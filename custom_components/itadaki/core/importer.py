from __future__ import annotations

import re
from collections.abc import Callable
from typing import TypeVar

from recipe_scrapers import scrape_html
from recipe_scrapers._exceptions import RecipeScrapersExceptions

from .models import Draft, RawLine, Recipe, Step

T = TypeVar("T")

_LEADING_NUMBER = re.compile(r"\d+(?:[.,]\d+)?")


def _optional(getter: Callable[[], T]) -> T | None:
    # recipe-scrapers raises for any field a page does not provide, and pages
    # routinely omit some, so every field except the title is optional.
    try:
        return getter() or None
    except (RecipeScrapersExceptions, AttributeError, TypeError, ValueError):
        return None


def _servings(yields: str | None) -> float | None:
    """The first number of a yield such as "4 servings"."""
    match = _LEADING_NUMBER.search(yields or "")
    return float(match.group().replace(",", ".")) if match else None


def _language(tag: str | None, fallback: str) -> str:
    return tag.split("-")[0].lower() if tag else fallback


def _lines(scraper) -> list[RawLine]:
    groups = _optional(scraper.ingredient_groups) or []
    if groups:
        return [
            RawLine(text, group.purpose or None) for group in groups for text in group.ingredients
        ]
    return [RawLine(text) for text in _optional(scraper.ingredients) or []]


def draft_from_html(html: str, url: str, fallback_language: str = "en") -> Draft | None:
    """Reads the page's schema.org recipe data, or returns None when it has none.
    Costs no LLM tokens; the ingredient lines come back raw, to be structured. Data
    without both ingredients and steps counts as none: some sites mark up only the
    title and photo, and the page text is then the better source."""
    try:
        scraper = scrape_html(html, org_url=url, supported_only=False)
        title = scraper.title()
    except RecipeScrapersExceptions:
        return None
    if not title:
        return None

    lines = _lines(scraper)
    steps = [Step(text=text) for text in _optional(scraper.instructions_list) or []]
    if not (lines and steps):
        return None
    recipe = Recipe(
        language=_language(_optional(scraper.language), fallback_language),
        title=title,
        description=_optional(scraper.description) or "",
        servings=_servings(_optional(scraper.yields)),
        prep_minutes=_optional(scraper.prep_time),
        cook_minutes=_optional(scraper.cook_time),
        total_minutes=_optional(scraper.total_time),
        steps=steps,
        image_url=_optional(scraper.image),
        source_url=url,
    )
    return Draft(recipe, raw_lines=lines)
