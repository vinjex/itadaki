from __future__ import annotations

from collections.abc import Callable

from .errors import TreeError
from .models import Recipe, Relation


def validate_child(parent: Recipe, relation: Relation, language: str) -> None:
    if relation is Relation.TRANSLATION and language == parent.language:
        raise TreeError("a translation must be in a different language than its parent")


def is_stale(recipe: Recipe, parent: Recipe | None) -> bool:
    return (
        parent is not None
        and recipe.relation is Relation.TRANSLATION
        and recipe.parent_revision is not None
        and recipe.parent_revision < parent.revision
    )


def anchor_of(recipe: Recipe, get: Callable[[str], Recipe | None]) -> Recipe:
    """The nearest ancestor that is not a translation: the original of this dish."""
    while recipe.relation is Relation.TRANSLATION and recipe.parent_id:
        parent = get(recipe.parent_id)
        if parent is None:
            break
        recipe = parent
    return recipe


def translation_group(
    recipe: Recipe,
    get: Callable[[str], Recipe | None],
    children: Callable[[str], list[Recipe]],
) -> list[Recipe]:
    """The same dish in every language: the nearest non-translation ancestor plus
    every recipe reachable from it through translation links only."""
    anchor = anchor_of(recipe, get)
    group = [anchor]
    pending = [anchor]
    while pending:
        for child in children(pending.pop().id):
            if child.relation is Relation.TRANSLATION:
                group.append(child)
                pending.append(child)
    return group


def pick_per_group(recipes: list[Recipe], everything: dict[str, Recipe], language: str) -> list[Recipe]:
    """One recipe per translation group among `recipes`, preferring `language`, else
    the group's original. Keeps the order of first appearance."""

    chosen: dict[str, Recipe] = {}
    for recipe in recipes:
        key = anchor_of(recipe, everything.get).id
        current = chosen.get(key)
        if current is None or (current.language != language and (recipe.language == language or recipe.id == key)):
            chosen[key] = recipe
    return list(chosen.values())
