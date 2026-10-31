"""Runs AI work in the background and announces every outcome on HA's event bus,
which the panel and automations listen to. What a job means (statuses, saving)
lives in the core; this only adds threads and events."""

from __future__ import annotations

import logging
from collections.abc import Callable
from typing import Any

from homeassistant.core import HomeAssistant, callback

from .const import EVENT_DRAFT_UPDATED
from .core import Draft, ItadakiError, RecipeBook

_LOGGER = logging.getLogger(__name__)


class JobRunner:
    def __init__(self, hass: HomeAssistant, book: RecipeBook) -> None:
        self._hass = hass
        self._book = book

    def start(
        self,
        action: str,
        title: str,
        work: Callable[[], Draft],
        save: bool,
        *,
        initial: Draft | None = None,
        recipe_id: str | None = None,
        request: dict[str, Any] | None = None,
    ) -> str:
        """Records the job, schedules it, and returns its draft id at once. Called from
        a worker thread, so scheduling hops onto the event loop thread-safely."""
        entry = self._book.start_draft(action, title, initial, recipe_id, request)
        self._hass.loop.call_soon_threadsafe(self._schedule, entry.id, work, save)
        return entry.id

    @callback
    def _schedule(self, draft_id: str, work: Callable[[], Draft], save: bool) -> None:
        self._announce(draft_id, "working")
        self._hass.async_create_background_task(self._run(draft_id, work, save), f"itadaki job {draft_id}")

    async def _run(self, draft_id: str, work: Callable[[], Draft], save: bool) -> None:
        run = self._hass.async_add_executor_job
        try:
            draft = await run(work)
            await run(self._book.finish_draft, draft_id, draft)
            if save:
                recipe = await run(self._book.save_inbox_draft, draft_id)
                self._announce(draft_id, "saved", recipe.id)
                return
            self._announce(draft_id, "ready")
        except ItadakiError as err:
            await run(self._book.fail_draft, draft_id, str(err))
            self._announce(draft_id, "failed")
        except Exception:
            _LOGGER.exception("Itadaki job %s failed", draft_id)
            await run(self._book.fail_draft, draft_id, "unexpected error, see the Home Assistant log")
            self._announce(draft_id, "failed")

    @callback
    def _announce(self, draft_id: str, status: str, recipe_id: str | None = None) -> None:
        data = {"draft_id": draft_id, "status": status}
        if recipe_id:
            data["recipe_id"] = recipe_id
        self._hass.bus.async_fire(EVENT_DRAFT_UPDATED, data)
