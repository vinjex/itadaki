from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

PANEL_URL_PATH = "itadaki"
STATIC_URL = "/itadaki_static"
FRONTEND_DIR = Path(__file__).parent / "frontend"
_STATIC_REGISTERED = f"{PANEL_URL_PATH}_static_registered"


async def async_register_panel(hass: HomeAssistant) -> None:
    # Static paths cannot be unregistered, so a reloaded entry must not add them twice.
    if not hass.data.get(_STATIC_REGISTERED):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL, str(FRONTEND_DIR), cache_headers=False)]
        )
        hass.data[_STATIC_REGISTERED] = True
    # The file's modification time busts browser caches whenever the bundle changes.
    version = await hass.async_add_executor_job(
        lambda: int((FRONTEND_DIR / "itadaki-panel.js").stat().st_mtime)
    )
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name="itadaki-panel",
        sidebar_title="Itadaki",
        sidebar_icon="mdi:silverware-fork-knife",
        module_url=f"{STATIC_URL}/itadaki-panel.js?v={version}",
        require_admin=False,
    )


def async_remove_panel(hass: HomeAssistant) -> None:
    frontend.async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)
