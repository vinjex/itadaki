"""Serves stored recipe photos at the address stored in their recipes, and their
thumbnails with ?size=thumbnail."""

from __future__ import annotations

from aiohttp import web

from homeassistant.components.http import HomeAssistantView

from .const import DOMAIN
from .core import NotFoundError
from .core.images import IMAGE_PATH


class ImageView(HomeAssistantView):
    url = IMAGE_PATH + "{image_id}"
    name = "api:itadaki:image"
    # Browsers load <img> without HA's token. Ids are content hashes: unguessable
    # without already having the photo.
    requires_auth = False

    async def get(self, request: web.Request, image_id: str) -> web.Response:
        hass = request.app["hass"]
        entries = hass.config_entries.async_loaded_entries(DOMAIN)
        if not entries:
            raise web.HTTPNotFound
        try:
            book = entries[0].runtime_data.book
            read = book.get_thumbnail if request.query.get("size") == "thumbnail" else book.get_image
            mime, data = await hass.async_add_executor_job(read, image_id)
        except NotFoundError:
            raise web.HTTPNotFound from None
        # Content-addressed, so a given address never changes.
        headers = {"Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff"}
        return web.Response(body=data, content_type=mime, headers=headers)
