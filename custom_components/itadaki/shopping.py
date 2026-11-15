"""Adding a recipe's ingredients to a Home Assistant to-do list. The lists are
Home Assistant's, so this part lives in the adapter; the core only says what the
items are."""

from __future__ import annotations

from typing import Any

from homeassistant.components.todo.const import TodoListEntityFeature
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Context, HomeAssistant

from .const import CONF_SHOPPING_LIST
from .core import InvalidRequestError
from .core.shopping import item_text

TODO = "todo"
# The list of HA's own Shopping list integration: the natural default.
_HA_SHOPPING_LIST = "todo.shopping_list"


def _lists(hass: HomeAssistant) -> list[dict[str, str]]:
    lists = [{"entity_id": s.entity_id, "name": s.name} for s in hass.states.async_all(TODO)]
    return sorted(lists, key=lambda entry: entry["name"].casefold())


def _default(hass: HomeAssistant, data: dict[str, Any]) -> str | None:
    """The chosen list while it exists, else HA's shopping list, else the first one."""
    ids = [entry["entity_id"] for entry in _lists(hass)]
    for candidate in (data.get(CONF_SHOPPING_LIST), _HA_SHOPPING_LIST):
        if candidate in ids:
            return candidate
    return ids[0] if ids else None


def _require_list(hass: HomeAssistant, entity_id: str):
    state = hass.states.get(entity_id)
    if state is None or state.domain != TODO:
        raise InvalidRequestError(f"{entity_id} is not a to-do list", key="todo_list_missing")
    return state


async def get_shopping_settings(hass: HomeAssistant, entry: ConfigEntry, d: dict[str, Any], context: Context) -> dict[str, Any]:
    return {"list": _default(hass, entry.data), "lists": _lists(hass)}


async def update_shopping_settings(hass: HomeAssistant, entry: ConfigEntry, d: dict[str, Any], context: Context) -> dict[str, Any]:
    _require_list(hass, d["list"])
    hass.config_entries.async_update_entry(entry, data={**entry.data, CONF_SHOPPING_LIST: d["list"]})
    return await get_shopping_settings(hass, entry, d, context)


async def add_to_shopping_list(hass: HomeAssistant, entry: ConfigEntry, d: dict[str, Any], context: Context) -> dict[str, Any]:
    """One to-do item per entry, in order. The description goes along only where the
    list can store one: HA's own shopping list cannot, and refuses it."""
    state = _require_list(hass, d["list"])
    describes = state.attributes.get("supported_features", 0) & TodoListEntityFeature.SET_DESCRIPTION_ON_ITEM
    description = {"description": d["description"]} if d.get("description") and describes else {}
    texts = [t for item in d["items"] if (t := item_text(item.get("name", ""), item.get("quantity", "")))]
    for text in texts:
        await hass.services.async_call(
            TODO, "add_item", {"item": text, **description}, target={"entity_id": d["list"]}, blocking=True, context=context
        )
    return {"added": len(texts)}
