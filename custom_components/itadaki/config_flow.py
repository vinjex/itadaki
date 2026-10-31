from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN


class ItadakiConfigFlow(ConfigFlow, domain=DOMAIN):
    """Nothing to ask: AI is optional and set up in the panel's Manage page."""

    VERSION = 2

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        return self.async_create_entry(title="Itadaki", data={})
