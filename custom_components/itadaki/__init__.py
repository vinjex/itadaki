"""Itadaki: a multilingual recipe book. This package only adapts the host-independent
core to Home Assistant: settings, actions and the panel."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.config_entries import ConfigEntry
from homeassistant.components.frontend.storage import async_user_store
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .ai_config import build_assistant, from_version_1
from .const import DB_FILE, DOMAIN
from .core import RecipeBook, Store
from .core.ai import Assistant
from .images import ImageView
from .jobs import JobRunner
from .panel import async_register_panel, async_remove_panel
from .services import async_setup_services
from .websocket import async_setup_websocket

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


@dataclass
class Itadaki:
    book: RecipeBook
    assistant: Assistant
    jobs: JobRunner


type ItadakiConfigEntry = ConfigEntry[Itadaki]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    async_setup_services(hass)
    async_setup_websocket(hass)
    hass.http.register_view(ImageView)
    return True


async def users_languages(hass: HomeAssistant) -> list[str]:
    """The server's language, then each person's chosen one, without region (en-GB
    is en): the starting languages of a new recipe library."""
    codes = [hass.config.language]
    for user in await hass.auth.async_get_users():
        if not user.system_generated:
            store = await async_user_store(hass, user.id)
            codes.append((store.data.get("language") or {}).get("language"))
    return list(dict.fromkeys(c.split("-")[0].lower() for c in codes if c))


async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    if entry.version == 1:
        data = from_version_1(dict(entry.data), dict(entry.options))
        hass.config_entries.async_update_entry(entry, data=data, options={}, version=2)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ItadakiConfigEntry) -> bool:
    languages = await users_languages(hass)

    def build() -> Itadaki:
        # Opening the database and importing the AI client both block.
        book = RecipeBook(Store(hass.config.path(DB_FILE)), languages)
        book.fail_interrupted_drafts()
        book.prune_images()
        return Itadaki(book, build_assistant(book, dict(entry.data)), JobRunner(hass, book))

    entry.runtime_data = await hass.async_add_executor_job(build)
    await async_register_panel(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ItadakiConfigEntry) -> bool:
    async_remove_panel(hass)
    return True
