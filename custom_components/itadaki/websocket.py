"""Live draft updates for the panel. A dedicated command rather than plain event
subscription, because HA lets non-admin users subscribe only to a fixed set of
events, and every household member should see their imports finish."""

from __future__ import annotations

from typing import Any

import probatio

from homeassistant.components import websocket_api
from homeassistant.core import Event, HomeAssistant, callback

from .const import EVENT_DRAFT_UPDATED


@callback
def async_setup_websocket(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, _subscribe_drafts)


@websocket_api.websocket_command({probatio.Required("type"): "itadaki/subscribe_drafts"})
@callback
def _subscribe_drafts(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    @callback
    def forward(event: Event) -> None:
        connection.send_message(websocket_api.event_message(msg["id"], event.data))

    connection.subscriptions[msg["id"]] = hass.bus.async_listen(EVENT_DRAFT_UPDATED, forward)
    connection.send_result(msg["id"])
