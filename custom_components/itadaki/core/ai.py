"""The AI actions. Each one sends as little as the task allows and returns an unsaved
Draft; RecipeBook.save_draft is the only way a result reaches storage."""

from __future__ import annotations

import json
import re
import uuid
from collections.abc import Callable, Sequence
from dataclasses import dataclass, replace
from typing import Any

from .catalog import display_name, term_index
from .errors import InvalidRequestError
from .importer import draft_from_html
from .languages import language_code
from .llm import AiSettings, ChatModel, complete_json
from .models import (
    CatalogKind,
    CatalogName,
    Draft,
    Ingredient,
    IngredientLine,
    Localized,
    RawLine,
    Recipe,
    Relation,
    Step,
    Unit,
    Usage,
)
from .page import fetch_html, main_text
from .units import round_quantity
from .service import RecipeBook

# --- JSON shapes the model must answer with. Strict-mode compatible: every key
# required, nullable values as type unions, no extra keys.


def _obj(properties: dict[str, Any]) -> dict[str, Any]:
    return {
        "type": "object",
        "properties": properties,
        "required": list(properties),
        "additionalProperties": False,
    }


_TEXT = {"type": "string"}
_NULLABLE_TEXT = {"type": ["string", "null"]}
_NULLABLE_NUMBER = {"type": ["number", "null"]}


_NAME = _obj({"name": _TEXT, "plural": _NULLABLE_TEXT})
_LINE_SCHEMA = _obj(
    {
        "name": _TEXT,
        "plural": _NULLABLE_TEXT,
        "quantity": _NULLABLE_NUMBER,
        "unit": _NULLABLE_TEXT,
        "note": _NULLABLE_TEXT,
        "section": _NULLABLE_TEXT,
    }
)
_LINES_SCHEMA = _obj({"ingredients": {"type": "array", "items": _LINE_SCHEMA}})
_RECIPE_SCHEMA = _obj(
    {
        "language": _TEXT,
        "title": _TEXT,
        "description": _TEXT,
        "servings": _NULLABLE_NUMBER,
        "prep_minutes": _NULLABLE_NUMBER,
        "cook_minutes": _NULLABLE_NUMBER,
        "total_minutes": _NULLABLE_NUMBER,
        "ingredients": {"type": "array", "items": _LINE_SCHEMA},
        "steps": {"type": "array", "items": _obj({"text": _TEXT, "section": _NULLABLE_TEXT})},
        "notes": _TEXT,
        "tags": {"type": "array", "items": _TEXT},
    }
)
_TEXTS_SCHEMA = _obj({"texts": {"type": "array", "items": _TEXT}})
_PLURAL_RULE = (
    "Plural only for countable ingredients (eggs, onions); null for uncountable ones "
    "(sugar, soy sauce, rice), for units, and in languages without plural forms."
)

# --- Prompts


def _ingredient_rules(units: str) -> str:
    return f"""Ingredient rules:
- One entry per ingredient. `name` is the ingredient alone, in the recipe's language, singular, without quantity, unit or preparation. {_PLURAL_RULE}
- Quantities are numbers (½ becomes 0.5). For a range like 2-3, quantity is the lower number and the range goes in `note`. No quantity means null.
- `unit` is one of the unit ids below, or null for none. Never invent a unit id.
- Preparation and remarks ("finely chopped", "to taste") go in `note`. Group headings ("for the sauce") go in `section`.

Units (id: words that mean it):
{units}"""


def _with_note(text: str, note: str | None) -> str:
    return f"{text}\n\nUser instructions, follow them: {note}" if note else text


# --- Turning model answers into catalog-linked lines


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")


def _unique_id(base: str, taken: set[str]) -> str:
    entry_id, n = base, 1
    while entry_id in taken:
        n += 1
        entry_id = f"{base}_{n}"
    return entry_id


class _LineResolver:
    """Links each answered ingredient to the catalog by exact name or alias, and
    proposes a new entry for anything unknown. Fresh per attempt, since a retried
    answer must not inherit proposals from the rejected one."""

    def __init__(self, ingredients: list[Ingredient], units: list[Unit], language: str) -> None:
        self._language = language
        self._ingredient_ids = {i.id for i in ingredients}
        self._ingredients = term_index((i.id, i.localized) for i in ingredients)
        self._unit_ids = {u.id for u in units}
        self._units = term_index((u.id, u.localized) for u in units)
        self.new: dict[str, Ingredient] = {}

    def line(self, raw: dict[str, Any]) -> IngredientLine:
        return IngredientLine(
            ingredient_id=self._ingredient(raw),
            quantity=round_quantity(raw.get("quantity")),
            unit_id=self._unit(raw.get("unit")),
            note=raw.get("note") or None,
            section=raw.get("section") or None,
        )

    def _unit(self, value: str | None) -> str | None:
        if not value:
            return None
        if value in self._unit_ids:
            return value
        for (_, term), unit_id in self._units.items():
            if term == value.casefold():
                return unit_id
        raise ValueError(f"unknown unit {value!r}; use one of the listed unit ids or null")

    def _ingredient(self, raw: dict[str, Any]) -> str:
        for word in (raw["name"], raw.get("plural")):
            if word and (self._language, word.casefold()) in self._ingredients:
                return self._ingredients[(self._language, word.casefold())]

        # Provisional id: the final one comes from the English name, once known.
        localized = {self._language: Localized(raw["name"], raw.get("plural") or None)}
        entry_id = _unique_id(_slug(raw["name"]) or uuid.uuid4().hex[:8], self._ingredient_ids)
        ingredient = Ingredient(entry_id, localized)
        self.new[entry_id] = ingredient
        self._ingredient_ids.add(entry_id)
        self._ingredients.update(term_index([(entry_id, localized)]))
        return entry_id


# --- Translation segments: every piece of free text in a recipe, so a translation
# is a list of strings in and the same list out, and unchanged strings are reusable.


def _segments(recipe: Recipe) -> list[str]:
    texts = [recipe.title, recipe.description, recipe.notes, *recipe.tags]
    texts += [t for step in recipe.steps for t in (step.text, step.section)]
    texts += [t for line in recipe.ingredients for t in (line.note, line.section)]
    return list(dict.fromkeys(t for t in texts if t))


def _translated(recipe: Recipe, mapping: dict[str, str], language: str) -> Recipe:
    def tr(text: str | None) -> Any:
        return mapping.get(text, text) if text else text

    return replace(
        recipe,
        language=language,
        title=tr(recipe.title),
        description=tr(recipe.description),
        notes=tr(recipe.notes),
        tags=[tr(t) for t in recipe.tags],
        steps=[Step(tr(s.text), tr(s.section)) for s in recipe.steps],
        ingredients=[replace(line, note=tr(line.note), section=tr(line.section)) for line in recipe.ingredients],
    )


@dataclass
class StructuredLines:
    lines: list[IngredientLine]
    new_ingredients: list[Ingredient]
    usage: Usage


class Assistant:
    def __init__(
        self,
        book: RecipeBook,
        chat: ChatModel | None,
        settings: AiSettings | None,
        fetch: Callable[[str], str] = fetch_html,
    ) -> None:
        self._book = book
        self._chat = chat
        self._settings = settings
        self._fetch = fetch

    @property
    def enabled(self) -> bool:
        """Without a provider everything still works except the AI steps."""
        return self._chat is not None and self._settings is not None

    def require(self) -> None:
        if not self.enabled:
            raise InvalidRequestError("AI is not set up")

    def _complete(self, *args: Any) -> Any:
        self.require()
        return complete_json(self._chat, self._settings, *args)

    def fetch(self, url: str) -> str:
        """The page's HTML, fetched once: read_page and extract both take it."""
        return self._fetch(url)

    def read_page(self, html: str, url: str, fallback_language: str = "en") -> Draft | None:
        """The page's embedded recipe data as a draft, in seconds and with no AI. Its
        ingredient lines are raw; structure_draft finishes it. None when the page has
        no embedded recipe, which needs extract instead."""
        return draft_from_html(html, url, fallback_language)

    def read_url(self, url: str, fallback_language: str = "en") -> Draft | None:
        return self.read_page(self.fetch(url), url, fallback_language)

    def structure_draft(self, draft: Draft) -> Draft:
        if not draft.raw_lines:
            return draft
        structured = self.structure(draft.raw_lines, draft.recipe.language)
        return replace(
            draft,
            recipe=replace(draft.recipe, ingredients=[*draft.recipe.ingredients, *structured.lines]),
            raw_lines=[],
            new_ingredients=[*draft.new_ingredients, *structured.new_ingredients],
            usage=draft.usage + structured.usage,
        )

    def extract(self, url: str, note: str | None = None, html: str | None = None) -> Draft:
        """For pages without embedded recipe data: the page's main text, cut to a
        fixed size, goes to the AI. Pass `html` when the page was already fetched."""
        page = main_text(html if html is not None else self.fetch(url), url)
        if page is None:
            raise InvalidRequestError(f"no recipe found at {url}")
        recipe, new, usage = self._rewrite(
            "extract", f"Extract the recipe from this web page text.\n\n{page.text}", note
        )
        return Draft(replace(recipe, source_url=url, image_url=page.image_url), new_ingredients=new, usage=usage)

    def structure(self, lines: list[RawLine], language: str, note: str | None = None) -> StructuredLines:
        if not lines:
            return StructuredLines([], [], Usage())
        ingredients, units = self._book.list_ingredients(), self._book.list_units()
        numbered = "\n".join(
            f"{n}. {line.text}" + (f"  [section: {line.section}]" if line.section else "")
            for n, line in enumerate(lines, 1)
        )
        system = (
            "You convert recipe ingredient lines into structured JSON.\n\n"
            + _ingredient_rules(self._unit_table(units, language))
        )
        user = _with_note(f"Recipe language: {language}\n\nLines:\n{numbered}", note)

        def validate(answer: dict[str, Any]) -> tuple[list[IngredientLine], list[Ingredient]]:
            resolver = _LineResolver(ingredients, units, language)
            return [resolver.line(raw) for raw in answer["ingredients"]], list(resolver.new.values())

        (structured, new), usage = self._complete("structure", system, user, _LINES_SCHEMA, validate)
        structured, new, naming = self._name_new_ingredients(structured, new, language)
        return StructuredLines(structured, new, usage + naming)

    def translate(self, recipe_id: str, target_language: str, note: str | None = None) -> Draft:
        """Re-translating an existing translation reuses its earlier translations for
        unchanged text, so only new or edited text is sent. A note disables the reuse,
        since it may ask for different wording throughout."""
        source = self._book.get_recipe(recipe_id)
        if target_language == source.language:
            raise InvalidRequestError("target language is the recipe's own language")
        existing = next(
            (
                r
                for r in self._book.children(source.id)
                if r.relation is Relation.TRANSLATION and r.language == target_language
            ),
            None,
        )
        memory = self._book.translation_memory(existing.id) if existing and not note else {}
        segments = _segments(source)
        todo = [s for s in segments if s not in memory]
        missing = self._missing_catalog_names(source, target_language)

        usage = Usage()
        mapping = {s: memory[s] for s in segments if s in memory}
        if todo:
            system = (
                f"You translate recipe texts from {source.language} to {target_language}. "
                "Return `texts` with exactly one translation per input text, in the same order. "
                "Use natural cooking language and keep numbers and units as written."
            )
            user = _with_note(json.dumps({"texts": todo}, ensure_ascii=False), note)

            def validate(answer: dict[str, Any]) -> list[str]:
                if len(answer["texts"]) != len(todo):
                    raise ValueError(f"expected {len(todo)} texts, got {len(answer['texts'])}")
                return answer["texts"]

            texts, usage = self._complete("translate", system, user, _TEXTS_SCHEMA, validate)
            mapping.update(zip(todo, texts))

        added: list[CatalogName] = []
        if missing:
            named, naming = self._names_in(list(missing.values()), source.language, [target_language])
            usage += naming
            for key, names in zip(missing, named):
                kind, entry_id = key.split(":", 1)
                entry = names[target_language]
                added.append(CatalogName(CatalogKind(kind), entry_id, target_language, entry.name, entry.plural))

        recipe = _translated(source, mapping, target_language)
        target = {"updates_id": existing.id} if existing else {"parent_id": source.id, "relation": Relation.TRANSLATION}
        return Draft(recipe, syncs_translation=True, added_names=added, memory=mapping, usage=usage, **target)

    def adapt(self, recipe_id: str, instruction: str, as_variant: bool = False) -> Draft:
        source = self._book.get_recipe(recipe_id)
        target = {"parent_id": source.id, "relation": Relation.VARIANT} if as_variant else {"updates_id": source.id}
        return self.adapt_draft(Draft(source, **target), instruction)

    def adapt_draft(self, draft: Draft, instruction: str) -> Draft:
        """Rewrites a draft's recipe and keeps where it lands. Lines not structured yet
        go along as written and come back structured, so this also finishes an import.
        The draft's proposed ingredients count as known, so naming them again reuses them."""
        source = draft.recipe
        known = draft.new_ingredients
        lines = [*self._lines_as_text(source, known), *draft.raw_lines]
        payload = json.dumps(self._raw_payload(source, lines), ensure_ascii=False)
        recipe, new, usage = self._rewrite(
            "adapt", f"Rewrite this recipe as JSON, applying the user instructions.\n\n{payload}", instruction, known
        )
        recipe = replace(recipe, language=source.language, image_url=source.image_url, source_url=source.source_url)
        used = {line.ingredient_id for line in recipe.ingredients}
        return replace(
            draft,
            recipe=recipe,
            new_ingredients=[*(i for i in known if i.id in used), *new],
            raw_lines=[],
            usage=draft.usage + usage,
        )

    # Internals

    def _rewrite(
        self, action: str, user: str, note: str | None, known: Sequence[Ingredient] = ()
    ) -> tuple[Recipe, list[Ingredient], Usage]:
        ingredients, units = [*self._book.list_ingredients(), *known], self._book.list_units()
        system = (
            "You turn recipes into structured JSON for a recipe app. Keep the recipe's "
            "language unless the user instructions say otherwise. Steps are one entry per "
            "step, without numbering. Times are in minutes.\n\n"
            + _ingredient_rules(self._unit_table(units, None))
        )

        def validate(answer: dict[str, Any]) -> tuple[Recipe, list[Ingredient]]:
            language = language_code(answer["language"])
            resolver = _LineResolver(ingredients, units, language)
            lines = [resolver.line(raw) for raw in answer["ingredients"]]
            recipe = Recipe.from_dict({**answer, "language": language, "ingredients": []})
            minutes = {k: round(v) if v is not None else None for k, v in answer.items() if k.endswith("_minutes")}
            return replace(recipe, ingredients=lines, **minutes), list(resolver.new.values())

        (recipe, new), usage = self._complete(action, system, _with_note(user, note), _RECIPE_SCHEMA, validate)
        lines, new, naming = self._name_new_ingredients(recipe.ingredients, new, recipe.language, known)
        return replace(recipe, ingredients=lines), new, usage + naming

    def _names_in(
        self, names: list[str], source_language: str, targets: list[str]
    ) -> tuple[list[dict[str, Localized]], Usage]:
        """The one way catalog entries get names in other languages: a short list of
        names in, the same list out, one entry per target language."""
        system = (
            f"You name cooking ingredients and units in other languages. For each input "
            f"name, written in {source_language}, give the name in {', '.join(targets)}, "
            f"with exactly one entry per input name, in the same order. {_PLURAL_RULE}"
        )
        schema = _obj({"names": {"type": "array", "items": _obj({t: _NAME for t in targets})}})

        def validate(answer: dict[str, Any]) -> list[dict[str, Localized]]:
            if len(answer["names"]) != len(names):
                raise ValueError(f"expected {len(names)} names, got {len(answer['names'])}")
            return [
                {lang: Localized(e["name"], e.get("plural") or None) for lang, e in item.items()}
                for item in answer["names"]
            ]

        user = json.dumps({"names": names}, ensure_ascii=False)
        return self._complete("translate", system, user, schema, validate)

    def _name_new_ingredients(
        self, lines: list[IngredientLine], new: list[Ingredient], language: str, known: Sequence[Ingredient] = ()
    ) -> tuple[list[IngredientLine], list[Ingredient], Usage]:
        """Names proposed ingredients in the other catalog languages and gives them
        their final, English-based ids. A name already meaning another entry is left
        out rather than guessed at; the review is where duplicates get merged."""
        targets = [lang for lang in self._book.get_settings().languages if lang != language]
        if not new or not targets:
            return lines, new, Usage()
        named, usage = self._names_in([i.localized[language].name for i in new], language, targets)

        catalog = [*self._book.list_ingredients(), *known]
        taken_terms = term_index((i.id, i.localized) for i in catalog)
        taken_ids = {i.id for i in catalog}
        final_ids: dict[str, str] = {}
        finished = []
        for ingredient, names in zip(new, named):
            localized = dict(ingredient.localized)
            for lang, entry in names.items():
                words = [w.casefold() for w in (entry.name, entry.plural) if w]
                if not any((lang, w) in taken_terms for w in words):
                    localized[lang] = entry
            final_id = _unique_id(_slug(display_name(localized, "en")) or ingredient.id, taken_ids)
            taken_ids.add(final_id)
            taken_terms.update(term_index([(final_id, localized)]))
            final_ids[ingredient.id] = final_id
            finished.append(Ingredient(final_id, localized))
        lines = [replace(l, ingredient_id=final_ids.get(l.ingredient_id, l.ingredient_id)) for l in lines]
        return lines, finished, usage

    @staticmethod
    def _raw_payload(recipe: Recipe, lines: list[RawLine]) -> dict[str, Any]:
        payload = {
            "language": recipe.language,
            "title": recipe.title,
            "description": recipe.description,
            "servings": recipe.servings,
            "prep_minutes": recipe.prep_minutes,
            "cook_minutes": recipe.cook_minutes,
            "total_minutes": recipe.total_minutes,
            "ingredients": [{"text": l.text, "section": l.section} for l in lines],
            "steps": [{"text": s.text, "section": s.section} for s in recipe.steps],
            "notes": recipe.notes,
            "tags": recipe.tags,
        }
        return {k: v for k, v in payload.items() if v not in (None, "", [])}

    def _lines_as_text(self, recipe: Recipe, extra_ingredients: Sequence[Ingredient] = ()) -> list[RawLine]:
        texts = self._book.rendered_lines(recipe.ingredients, recipe.language, extra_ingredients)
        return [RawLine(text, line.section) for text, line in zip(texts, recipe.ingredients)]

    def _unit_table(self, units: list[Unit], language: str | None) -> str:
        # Only the recipe's language plus English when known, to keep the list short.
        languages = {language, "en"} if language else None
        rows = []
        for unit in units:
            words = [
                word
                for lang, entry in unit.localized.items()
                if languages is None or lang in languages
                for word in (entry.name, entry.plural, *entry.aliases)
                if word
            ]
            rows.append(f"{unit.id}: {', '.join(dict.fromkeys(words))}")
        return "\n".join(rows)

    def _missing_catalog_names(self, recipe: Recipe, language: str) -> dict[str, str]:
        """Catalog entries this recipe uses that have no name in `language` yet,
        keyed kind:id, with their name in the recipe's language as the source."""
        ingredients = {i.id: i for i in self._book.list_ingredients()}
        units = {u.id: u for u in self._book.list_units()}
        missing: dict[str, str] = {}
        for line in recipe.ingredients:
            entries = [(CatalogKind.INGREDIENT, ingredients[line.ingredient_id])]
            if line.unit_id:
                entries.append((CatalogKind.UNIT, units[line.unit_id]))
            for kind, entry in entries:
                if language not in entry.localized:
                    missing[f"{kind}:{entry.id}"] = display_name(entry.localized, recipe.language)
        return missing
