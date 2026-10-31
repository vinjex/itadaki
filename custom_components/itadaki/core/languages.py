"""Language codes as the library stores them."""

from __future__ import annotations

import re
from collections.abc import Iterable

from .errors import InvalidRequestError

# A BCP 47 tag in its common shapes: en, ja, pt-br, zh-hant.
_CODE = re.compile(r"[a-z]{2,3}(-[a-z0-9]{2,8})*")


def language_code(code: str) -> str:
    """One code, lower-cased and checked: the rule every stored language follows."""
    return clean_languages([code])[0]


def clean_languages(codes: Iterable[str]) -> list[str]:
    """Lower-cased, without repeats, in the given order; at least one."""
    cleaned = list(dict.fromkeys(c.strip().lower() for c in codes))
    bad = [c for c in cleaned if not _CODE.fullmatch(c)]
    if bad:
        raise InvalidRequestError(f"not language codes: {', '.join(bad)}")
    if not cleaned:
        raise InvalidRequestError("at least one language is needed")
    return cleaned
