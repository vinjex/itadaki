"""Rules for tags, kept apart from storage so they can be tested alone."""

from __future__ import annotations

from collections.abc import Iterable, Mapping

from .models import IngredientLine


def retagged(tag_ids: list[str], source_id: str, target_id: str | None) -> list[str]:
    """The list with `source_id` swapped for `target_id`, or dropped without one,
    keeping order and never listing a tag twice."""
    swapped = (target_id if t == source_id else t for t in tag_ids)
    return list(dict.fromkeys(t for t in swapped if t))


def recipe_tag_set(
    group_tags: Iterable[str], lines: Iterable[IngredientLine], ingredient_tags: Mapping[str, list[str]]
) -> set[str]:
    """Everything a recipe can be filtered by: its own tags plus every tag of every
    ingredient it uses. Tag ids are unique across both kinds, so one set holds both."""
    found = set(group_tags)
    for line in lines:
        found.update(ingredient_tags.get(line.ingredient_id, ()))
    return found
