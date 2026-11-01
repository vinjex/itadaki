"""Rules shared by the ingredient and unit lists, which localize the same way."""

from __future__ import annotations

from collections.abc import Iterable
from typing import Any

from .errors import InvalidRequestError
from .models import Localized


def terms(localized: dict[str, Localized]) -> set[tuple[str, str]]:
    """Every (language, word) an entry answers to, case-folded."""
    return {
        (language, term.casefold())
        for language, entry in localized.items()
        for term in (entry.name, entry.plural, *entry.aliases)
        if term
    }


def merge_localized(
    current: dict[str, Localized], changes: dict[str, dict[str, Any] | None]
) -> dict[str, Localized]:
    """Replaces the given languages whole and leaves the others; an empty value
    removes that language."""
    merged = dict(current)
    for language, entry in changes.items():
        if not entry:
            merged.pop(language, None)
            continue
        try:
            merged[language] = Localized(**entry)
        except TypeError as err:
            raise InvalidRequestError(f"invalid {language} entry: {err}") from err
    return merged


def absorb_names(target: dict[str, Localized], source: dict[str, Localized]) -> dict[str, Localized]:
    """The target's names plus every word of the source as an alias, per language."""
    merged = dict(target)
    for language, names in source.items():
        current = merged.get(language)
        if current is None:
            merged[language] = names
            continue
        known = {word for _, word in terms({language: current})}
        added = []
        for word in (names.name, names.plural, *names.aliases):
            if word and word.casefold() not in known:
                known.add(word.casefold())
                added.append(word)
        merged[language] = Localized(current.name, current.plural, [*current.aliases, *added])
    return merged


def ensure_unique_terms(
    entry_id: str,
    localized: dict[str, Localized],
    others: Iterable[tuple[str, dict[str, Localized]]],
) -> None:
    """A word may mean only one entry per language, or parsing a line would have to guess."""
    mine = terms(localized)
    clashes = sorted(
        f"{language}:{term} ({other_id})"
        for other_id, other in others
        if other_id != entry_id
        for language, term in mine & terms(other)
    )
    if clashes:
        raise InvalidRequestError(f"already used by another entry: {', '.join(clashes)}")


def is_taken(index: dict[tuple[str, str], str], language: str, names: Localized) -> bool:
    """Whether a proposed name already means an entry, so it must not be given to another."""
    return any((language, word.casefold()) in index for word in (names.name, names.plural) if word)


def term_index(entries: Iterable[tuple[str, dict[str, Localized]]]) -> dict[tuple[str, str], str]:
    """(language, case-folded word) -> entry id, for exact lookups."""
    return {term: entry_id for entry_id, localized in entries for term in terms(localized)}


def display_name(localized: dict[str, Localized], language: str, plural: bool = False) -> str:
    """Best available name: the requested language, then English, then any."""
    entry = localized.get(language) or localized.get("en") or next(iter(localized.values()))
    return (entry.plural if plural and entry.plural else None) or entry.name
