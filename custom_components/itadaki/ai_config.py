"""The AI provider settings. They are edited from the panel but stored in the config
entry, HA's place for integration secrets, so the recipe database never holds the
API key. The key is write-only: nothing ever sends it back."""

from __future__ import annotations

import json
from typing import Any

from homeassistant.const import CONF_API_KEY

from .const import AI_ACTIONS, CONF_BASE_URL, CONF_EXTRA_BODY, CONF_MODEL, CONF_MODELS, CONF_STRUCTURED_OUTPUT
from .core import InvalidRequestError, RecipeBook
from .core.ai import Assistant
from .core.llm import AiSettings, OpenAIChat, StructuredOutput

DEFAULTS: dict[str, Any] = {
    CONF_BASE_URL: "",
    CONF_API_KEY: "",
    CONF_MODEL: "",
    CONF_MODELS: {},
    CONF_STRUCTURED_OUTPUT: StructuredOutput.SCHEMA.value,
    CONF_EXTRA_BODY: {},
}


def ai_settings(data: dict[str, Any]) -> AiSettings | None:
    """None until a provider address and model are given."""
    d = {**DEFAULTS, **data}
    if not (d[CONF_BASE_URL] and d[CONF_MODEL]):
        return None
    return AiSettings(
        base_url=d[CONF_BASE_URL],
        api_key=d[CONF_API_KEY],
        model=d[CONF_MODEL],
        models={a: m for a, m in d[CONF_MODELS].items() if m},
        structured_output=StructuredOutput(d[CONF_STRUCTURED_OUTPUT]),
        extra_body=d[CONF_EXTRA_BODY],
    )


def build_assistant(book: RecipeBook, data: dict[str, Any]) -> Assistant:
    """Blocks: the AI client library is imported on first use."""
    settings = ai_settings(data)
    chat = OpenAIChat(settings.base_url, settings.api_key) if settings else None
    return Assistant(book, chat, settings)


def public(data: dict[str, Any]) -> dict[str, Any]:
    d = {**DEFAULTS, **data}
    shown = {k: v for k, v in d.items() if k != CONF_API_KEY}
    return {"enabled": ai_settings(d) is not None, **shown, "api_key_set": bool(d[CONF_API_KEY])}


def changed(data: dict[str, Any], changes: dict[str, Any]) -> dict[str, Any]:
    """The stored settings with `changes` applied. An empty api_key keeps the
    current one; clearing the address or model turns AI off."""
    d = {**DEFAULTS, **data}
    for key, value in changes.items():
        if key == CONF_API_KEY and not value:
            continue
        if key in (CONF_BASE_URL, CONF_API_KEY, CONF_MODEL):
            value = value.strip()
        d[key] = value
    if unknown := d[CONF_MODELS].keys() - set(AI_ACTIONS):
        raise InvalidRequestError(f"unknown AI actions: {', '.join(sorted(unknown))}")
    if d[CONF_STRUCTURED_OUTPUT] not in {m.value for m in StructuredOutput}:
        raise InvalidRequestError("structured_output must be schema, json or off")
    if not isinstance(d[CONF_EXTRA_BODY], dict):
        raise InvalidRequestError("extra_body must be a JSON object")
    return d


def from_version_1(data: dict[str, Any], options: dict[str, Any]) -> dict[str, Any]:
    """Version 1 split the settings between setup data and options."""
    return {
        **DEFAULTS,
        **{k: data[k] for k in (CONF_BASE_URL, CONF_API_KEY, CONF_MODEL) if k in data},
        CONF_MODELS: {a: options[f"model_{a}"] for a in AI_ACTIONS if options.get(f"model_{a}")},
        CONF_STRUCTURED_OUTPUT: options.get(CONF_STRUCTURED_OUTPUT, StructuredOutput.SCHEMA.value),
        CONF_EXTRA_BODY: json.loads(options.get(CONF_EXTRA_BODY) or "{}"),
    }
