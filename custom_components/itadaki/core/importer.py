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


def _yield(scraper, language: str, unit_terms: dict[tuple[str, str], str]) -> tuple[float | None, str | None]:
    """The first number of the yield, and its unit when the word after the number names
    one ("200 g"), in the recipe's language or any other. Any other word ("4 servings",
    "12 cookies") counts people, to be corrected in review. The page's own text is tried
    first: recipe-scrapers rewrites yields it does not know, "2人分" to "2 servings"."""
    raw = _optional(lambda: scraper.schema.data.get("recipeYield"))
    texts = [t for t in (raw if isinstance(raw, str) else None, _optional(scraper.yields)) if t]
    anywhere = {term: unit_id for (_, term), unit_id in unit_terms.items()}
    found = []
    for text in texts:
        match = _LEADING_NUMBER.search(text)
        if match:
            word = text[match.end() :].strip().casefold()
            found.append((float(match.group().replace(",", ".")), unit_terms.get((language, word)) or anywhere.get(word)))
    return next((f for f in found if f[1]), found[0] if found else (None, None))


def _language(tag: str | None, fallback: str) -> str:
    return tag.split("-")[0].lower() if tag else fallback


def _lines(scraper) -> list[RawLine]:
    groups = _optional(scraper.ingredient_groups) or []
    if groups:
        return [
            RawLine(text, group.purpose or None) for group in groups for text in group.ingredients
        ]
    return [RawLine(text) for text in _optional(scraper.ingredients) or []]


_TAG_SEPARATORS = re.compile(r"[,、，;]")
_MAX_PAGE_TAGS = 12


def _page_tags(scraper) -> list[str]:
    """The words the page tags its recipe with: category, cuisine, then keywords,
    without repeats. Sites stuff keywords for search engines, so the list is capped."""
    found: list[str] = []
    for getter in (scraper.category, scraper.cuisine, scraper.keywords):
        value = _optional(getter)
        for text in value if isinstance(value, list) else [value or ""]:
            found += [w.strip() for w in _TAG_SEPARATORS.split(str(text)) if w.strip()]
    unique: dict[str, str] = {}
    for word in found:
        unique.setdefault(word.casefold(), word)
    return list(unique.values())[:_MAX_PAGE_TAGS]


def draft_from_html(
    html: str, url: str, fallback_language: str = "en", unit_terms: dict[tuple[str, str], str] | None = None
) -> Draft | None:
    """Reads the page's schema.org recipe data, or returns None when it has none.
    Costs no LLM tokens; the ingredient lines come back raw, to be structured.
    `unit_terms` (see catalog.term_index) links a yield like "200 g" to its unit. Data
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
    language = _language(_optional(scraper.language), fallback_language)
    yield_quantity, yield_unit_id = _yield(scraper, language, unit_terms or {})
    recipe = Recipe(
        language=language,
        title=title,
        description=_optional(scraper.description) or "",
        yield_quantity=yield_quantity,
        yield_unit_id=yield_unit_id,
        prep_minutes=_optional(scraper.prep_time),
        cook_minutes=_optional(scraper.cook_time),
        total_minutes=_optional(scraper.total_time),
        steps=steps,
        image_url=_optional(scraper.image),
        source_url=url,
    )
    return Draft(recipe, raw_lines=lines, suggested_tags=_page_tags(scraper))
