"""Every core operation as an HA action returning data: the one API that both the
panel and MCP clients use."""

from __future__ import annotations

import base64
from collections.abc import Awaitable, Callable
from dataclasses import asdict
from typing import TYPE_CHECKING, Any

import probatio

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_API_KEY
from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse, callback
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError, Unauthorized

from .ai_config import build_assistant, changed, public
from .const import CONF_BASE_URL, CONF_EXTRA_BODY, CONF_MODEL, CONF_MODELS, CONF_STRUCTURED_OUTPUT, DOMAIN
from .core import AI_ACTIONS, Draft, InUseError, InvalidRequestError, ItadakiError, NoRecipeDataError, RawLine
from .core.llm import AiError

if TYPE_CHECKING:
    from . import Itadaki

Handler = Callable[["Itadaki", dict[str, Any]], dict[str, Any]]

_ID = probatio.Required("recipe_id")
_NOTE = probatio.Optional("note")
_SAVE = probatio.Optional("save", default=False)
_DRAFT_ID = probatio.Required("draft_id")
_EDITED = probatio.Optional("draft")
_SOURCE = probatio.Required("source_id")
_TARGET = probatio.Required("target_id")


def _request(d: dict[str, Any], *keys: str) -> dict[str, Any]:
    return {k: d[k] for k in keys if d.get(k) not in (None, "")}


def _parsed(parse: Callable[[Any], Any], value: Any, what: str) -> Any:
    """Turns a malformed caller value into a validation error, keeping the plain
    Python errors for real bugs further down."""
    try:
        return parse(value)
    except (KeyError, TypeError, ValueError) as err:
        raise InvalidRequestError(f"invalid {what}: {err}") from err


def _raw_line(value: Any) -> RawLine:
    return RawLine(value) if isinstance(value, str) else RawLine(value["text"], value.get("section"))


def _import_url(it: Itadaki, d: dict[str, Any]) -> dict[str, Any]:
    """Never runs AI: a page that embeds recipe data is a ready draft at once, its
    ingredient lines left to structure_draft or to matching by hand in review."""
    url = d["url"]
    draft = it.assistant.read_page(it.assistant.fetch(url), url)
    if draft is None:
        raise NoRecipeDataError(f"{url} embeds no recipe data; extract_url imports it with AI")
    work = lambda: draft  # noqa: E731
    return {"draft_id": it.jobs.start("import", draft.recipe.title, work, False, initial=draft, request={"url": url})}


def _extract_url(it: Itadaki, d: dict[str, Any]) -> dict[str, Any]:
    it.assistant.require()
    url, note = d["url"], d.get("note")
    work = lambda: it.assistant.extract(url, note)  # noqa: E731
    return {"draft_id": it.jobs.start("import", url, work, d["save"], request=_request(d, "url", "note"))}


def _translate(it: Itadaki, d: dict[str, Any]) -> dict[str, Any]:
    it.assistant.require()
    source = it.book.get_recipe(d["recipe_id"])
    work = lambda: it.assistant.translate(source.id, d["language"], d.get("note"))  # noqa: E731
    request = _request(d, "language", "note")
    return {"draft_id": it.jobs.start("translate", source.title, work, d["save"], recipe_id=source.id, request=request)}


def _adapt(it: Itadaki, d: dict[str, Any]) -> dict[str, Any]:
    it.assistant.require()
    source = it.book.get_recipe(d["recipe_id"])
    work = lambda: it.assistant.adapt(source.id, d["instruction"], d["as_variant"])  # noqa: E731
    request = _request(d, "instruction", "as_variant")
    return {"draft_id": it.jobs.start("adapt", source.title, work, d["save"], recipe_id=source.id, request=request)}


def _rework(
    it: Itadaki, d: dict[str, Any], request: dict[str, Any], work: Callable[[Draft], Draft]
) -> dict[str, Any]:
    """Sends a ready draft, as edited in review when given, back to the AI."""
    it.assistant.require()
    edited = _parsed(Draft.from_dict, d["draft"], "draft") if d.get("draft") else None
    entry = it.book.rework_draft(d["draft_id"], request, edited)
    draft = entry.draft
    it.jobs.rework(entry.id, lambda: work(draft), d["save"])
    return {"draft_id": entry.id}


def _adapt_draft(it: Itadaki, d: dict[str, Any]) -> dict[str, Any]:
    return _rework(it, d, _request(d, "instruction"), lambda draft: it.assistant.adapt_draft(draft, d["instruction"]))


def _structure_draft(it: Itadaki, d: dict[str, Any]) -> dict[str, Any]:
    return _rework(it, d, _request(d, "note"), lambda draft: it.assistant.structure_draft(draft, d.get("note")))


def _get_draft(it: Itadaki, d: dict[str, Any]) -> dict[str, Any]:
    entry = it.book.get_draft(d["draft_id"])
    result = entry.to_dict()
    if entry.draft:
        recipe = entry.draft.recipe
        result["lines_text"] = it.book.rendered_lines(recipe.ingredients, recipe.language, entry.draft.new_ingredients)
    return result


def _save_draft(it: Itadaki, d: dict[str, Any]) -> dict[str, Any]:
    edited = _parsed(Draft.from_dict, d["draft"], "draft") if d.get("draft") else None
    return {"recipe": it.book.save_inbox_draft(d["draft_id"], edited).to_dict()}


def _get_recipe(it: Itadaki, d: dict[str, Any]) -> dict[str, Any]:
    recipe = it.book.get_recipe(d["recipe_id"])
    related = it.book.related(recipe.id)
    if d.get("servings"):
        recipe = it.book.scaled(recipe, d["servings"])
    lines = it.book.rendered_lines(recipe.ingredients, recipe.language)
    return {"recipe": recipe.to_dict(), "lines_text": lines, **related}


def _structure_lines(it: Itadaki, d: dict[str, Any]) -> dict[str, Any]:
    lines = _parsed(lambda ls: [_raw_line(l) for l in ls], d["lines"], "lines")
    result = it.assistant.structure(lines, d["language"], d.get("note"))
    return asdict(result)


def _deleted(delete: Callable[[Itadaki, str], None], key: str) -> Handler:
    def handler(it: Itadaki, d: dict[str, Any]) -> dict[str, Any]:
        delete(it, d[key])
        return {"deleted": d[key]}

    return handler


# name -> (schema, handler, response mode). Reads only return data; writes may be
# called without asking for a response, e.g. from an automation.
ACTIONS: dict[str, tuple[probatio.Schema, Handler, SupportsResponse]] = {
    "list_recipes": (
        probatio.Schema(
            {
                probatio.Optional("language"): str,
                probatio.Optional("query"): str,
                probatio.Optional("prefer_language"): str,
            }
        ),
        lambda it, d: {
            "recipes": [
                r.to_dict()
                for r in it.book.list_recipes(d.get("language"), d.get("query"), d.get("prefer_language"))
            ]
        },
        SupportsResponse.ONLY,
    ),
    "get_recipe": (
        probatio.Schema({_ID: str, probatio.Optional("servings"): probatio.Coerce(float)}),
        _get_recipe,
        SupportsResponse.ONLY,
    ),
    "create_recipe": (
        probatio.Schema(
            {
                probatio.Required("recipe"): dict,
                probatio.Optional("parent_id"): str,
                probatio.Optional("relation"): probatio.In(["translation", "variant"]),
            }
        ),
        lambda it, d: {"recipe": it.book.create_recipe(d["recipe"], d.get("parent_id"), d.get("relation")).to_dict()},
        SupportsResponse.OPTIONAL,
    ),
    "update_recipe": (
        probatio.Schema({_ID: str, probatio.Required("changes"): dict}),
        lambda it, d: {"recipe": it.book.update_recipe(d["recipe_id"], d["changes"]).to_dict()},
        SupportsResponse.OPTIONAL,
    ),
    "delete_recipe": (
        probatio.Schema({_ID: str, probatio.Optional("cascade", default=False): bool}),
        lambda it, d: {"deleted": it.book.delete_recipe(d["recipe_id"], d["cascade"])},
        SupportsResponse.OPTIONAL,
    ),
    "mark_translation_synced": (
        probatio.Schema({_ID: str}),
        lambda it, d: {"recipe": it.book.mark_translation_synced(d["recipe_id"]).to_dict()},
        SupportsResponse.OPTIONAL,
    ),
    "get_settings": (probatio.Schema({}), lambda it, d: it.book.get_settings().to_dict(), SupportsResponse.ONLY),
    "update_settings": (
        probatio.Schema(
            {probatio.Optional("languages"): [str], probatio.Optional("instructions"): {probatio.In(AI_ACTIONS): str}}
        ),
        lambda it, d: it.book.update_settings(d).to_dict(),
        SupportsResponse.OPTIONAL,
    ),
    "upload_image": (
        probatio.Schema({probatio.Required("data"): str}),
        lambda it, d: {"image_url": it.book.add_image(_parsed(lambda s: base64.b64decode(s, validate=True), d["data"], "image data"))},
        SupportsResponse.OPTIONAL,
    ),
    "list_ingredients": (
        probatio.Schema({}),
        lambda it, d: {"ingredients": [i.to_dict() for i in it.book.list_ingredients()]},
        SupportsResponse.ONLY,
    ),
    "upsert_ingredient": (
        probatio.Schema({probatio.Required("ingredient"): dict}),
        lambda it, d: {"ingredient": it.book.upsert_ingredient(d["ingredient"]).to_dict()},
        SupportsResponse.OPTIONAL,
    ),
    "delete_ingredient": (
        probatio.Schema({probatio.Required("ingredient_id"): str}),
        _deleted(lambda it, entry_id: it.book.delete_ingredient(entry_id), "ingredient_id"),
        SupportsResponse.OPTIONAL,
    ),
    "list_units": (
        probatio.Schema({}),
        lambda it, d: {"units": [u.to_dict() for u in it.book.list_units()]},
        SupportsResponse.ONLY,
    ),
    "upsert_unit": (
        probatio.Schema({probatio.Required("unit"): dict}),
        lambda it, d: {"unit": it.book.upsert_unit(d["unit"]).to_dict()},
        SupportsResponse.OPTIONAL,
    ),
    "delete_unit": (
        probatio.Schema({probatio.Required("unit_id"): str}),
        _deleted(lambda it, entry_id: it.book.delete_unit(entry_id), "unit_id"),
        SupportsResponse.OPTIONAL,
    ),
    "merge_ingredient": (
        probatio.Schema({_SOURCE: str, _TARGET: str}),
        lambda it, d: {"ingredient": it.book.merge_ingredient(d["source_id"], d["target_id"]).to_dict()},
        SupportsResponse.OPTIONAL,
    ),
    "merge_unit": (
        probatio.Schema({_SOURCE: str, _TARGET: str}),
        lambda it, d: {"unit": it.book.merge_unit(d["source_id"], d["target_id"]).to_dict()},
        SupportsResponse.OPTIONAL,
    ),
    "catalog_usage": (probatio.Schema({}), lambda it, d: it.book.catalog_usage(), SupportsResponse.ONLY),
    "import_url": (probatio.Schema({probatio.Required("url"): str}), _import_url, SupportsResponse.OPTIONAL),
    "extract_url": (
        probatio.Schema({probatio.Required("url"): str, _NOTE: str, _SAVE: bool}),
        _extract_url,
        SupportsResponse.OPTIONAL,
    ),
    "structure_lines": (
        probatio.Schema({probatio.Required("lines"): list, probatio.Required("language"): str, _NOTE: str}),
        _structure_lines,
        SupportsResponse.ONLY,
    ),
    "translate": (
        probatio.Schema({_ID: str, probatio.Required("language"): str, _NOTE: str, _SAVE: bool}),
        _translate,
        SupportsResponse.OPTIONAL,
    ),
    "adapt": (
        probatio.Schema(
            {
                _ID: str,
                probatio.Required("instruction"): str,
                probatio.Optional("as_variant", default=False): bool,
                _SAVE: bool,
            }
        ),
        _adapt,
        SupportsResponse.OPTIONAL,
    ),
    "adapt_draft": (
        probatio.Schema({_DRAFT_ID: str, probatio.Required("instruction"): str, _EDITED: dict, _SAVE: bool}),
        _adapt_draft,
        SupportsResponse.OPTIONAL,
    ),
    "structure_draft": (
        probatio.Schema({_DRAFT_ID: str, _NOTE: str, _EDITED: dict, _SAVE: bool}),
        _structure_draft,
        SupportsResponse.OPTIONAL,
    ),
    "list_drafts": (
        probatio.Schema({probatio.Optional("recipe_id"): str}),
        lambda it, d: {"drafts": [e.summary() for e in it.book.list_drafts(d.get("recipe_id"))]},
        SupportsResponse.ONLY,
    ),
    "get_draft": (probatio.Schema({_DRAFT_ID: str}), _get_draft, SupportsResponse.ONLY),
    "save_draft": (
        probatio.Schema({_DRAFT_ID: str, _EDITED: dict}),
        _save_draft,
        SupportsResponse.OPTIONAL,
    ),
    "apply_draft": (
        probatio.Schema({probatio.Required("draft"): dict}),
        lambda it, d: {"recipe": it.book.save_draft(_parsed(Draft.from_dict, d["draft"], "draft")).to_dict()},
        SupportsResponse.OPTIONAL,
    ),
    "discard_draft": (
        probatio.Schema({_DRAFT_ID: str}),
        _deleted(lambda it, draft_id: it.book.discard_draft(draft_id), "draft_id"),
        SupportsResponse.OPTIONAL,
    ),
}


async def _get_ai_settings(hass: HomeAssistant, entry: ConfigEntry, d: dict[str, Any]) -> dict[str, Any]:
    return public(dict(entry.data))


async def _update_ai_settings(hass: HomeAssistant, entry: ConfigEntry, d: dict[str, Any]) -> dict[str, Any]:
    data = changed(dict(entry.data), d)
    entry.runtime_data.assistant = await hass.async_add_executor_job(build_assistant, entry.runtime_data.book, data)
    hass.config_entries.async_update_entry(entry, data=data)
    return public(data)


# Provider settings live in the config entry, so these run on the event loop.
ENTRY_ACTIONS: dict[str, tuple[probatio.Schema, Callable[..., Awaitable[dict[str, Any]]], SupportsResponse]] = {
    "get_ai_settings": (probatio.Schema({}), _get_ai_settings, SupportsResponse.ONLY),
    "update_ai_settings": (
        probatio.Schema(
            {
                probatio.Optional(CONF_BASE_URL): str,
                probatio.Optional(CONF_API_KEY): str,
                probatio.Optional(CONF_MODEL): str,
                probatio.Optional(CONF_MODELS): {probatio.In(AI_ACTIONS): str},
                probatio.Optional(CONF_STRUCTURED_OUTPUT): str,
                probatio.Optional(CONF_EXTRA_BODY): dict,
            }
        ),
        _update_ai_settings,
        SupportsResponse.OPTIONAL,
    ),
}

# Library management: refused to non-admin users. Recipes, and the new ingredients
# they bring along, stay open to everyone.
ADMIN_ACTIONS = frozenset(
    {
        "update_settings",
        "update_ai_settings",
        "upsert_ingredient",
        "delete_ingredient",
        "merge_ingredient",
        "upsert_unit",
        "delete_unit",
        "merge_unit",
    }
)


@callback
def async_setup_services(hass: HomeAssistant) -> None:
    for name, (schema, handler, mode) in ACTIONS.items():
        # Core calls block (SQLite, HTTP to the AI provider), so they run off the event loop.
        run = lambda entry, data, handler=handler: hass.async_add_executor_job(handler, entry.runtime_data, data)  # noqa: E731
        hass.services.async_register(DOMAIN, name, _make_service(hass, name, run), schema=schema, supports_response=mode)
    for name, (schema, handler, mode) in ENTRY_ACTIONS.items():
        run = lambda entry, data, handler=handler: handler(hass, entry, data)  # noqa: E731
        hass.services.async_register(DOMAIN, name, _make_service(hass, name, run), schema=schema, supports_response=mode)


def _make_service(
    hass: HomeAssistant, name: str, run: Callable[[ConfigEntry, dict[str, Any]], Awaitable[dict[str, Any]]]
) -> Callable[[ServiceCall], Any]:
    async def service(call: ServiceCall) -> ServiceResponse:
        entries = hass.config_entries.async_loaded_entries(DOMAIN)
        if not entries:
            raise ServiceValidationError("Itadaki is not set up")
        # Calls without a user (automations, scripts) are trusted like HA does.
        if name in ADMIN_ACTIONS and call.context.user_id:
            user = await hass.auth.async_get_user(call.context.user_id)
            if user is None or not user.is_admin:
                raise Unauthorized(context=call.context)
        try:
            return await run(entries[0], dict(call.data))
        except AiError as err:
            raise HomeAssistantError(str(err)) from err
        except NoRecipeDataError as err:
            raise ServiceValidationError(str(err), translation_domain=DOMAIN, translation_key="no_recipe_data") from err
        except InUseError as err:
            # The key lets the panel tell this refusal apart and offer a cascade.
            raise ServiceValidationError(str(err), translation_domain=DOMAIN, translation_key="in_use") from err
        except ItadakiError as err:
            raise ServiceValidationError(str(err)) from err

    return service
