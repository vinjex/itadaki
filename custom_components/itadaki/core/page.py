"""Fetching a web page and reducing it to what an LLM needs to read."""

from __future__ import annotations

from dataclasses import dataclass

import trafilatura

from .errors import InvalidRequestError

# Roughly 3 to 4k tokens: enough for any real recipe, and a hard ceiling on what
# a page with runaway comments or an endless blog intro can cost.
MAX_TEXT_CHARS = 12_000


@dataclass
class PageText:
    text: str
    image_url: str | None


def fetch_html(url: str) -> str:
    html = trafilatura.fetch_url(url)
    if not html:
        raise InvalidRequestError(f"could not fetch {url}", key="fetch_failed")
    return html


def main_text(html: str, url: str) -> PageText | None:
    """The article body without navigation, ads and comments, plus the page's
    preview image, which is the photo the author chose to represent it."""
    text = trafilatura.extract(html, url=url, include_comments=False, include_tables=True)
    if not text:
        return None
    meta = trafilatura.extract_metadata(html, default_url=url)
    return PageText(text=text[:MAX_TEXT_CHARS], image_url=meta.image if meta else None)
