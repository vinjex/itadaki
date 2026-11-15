"""A recipe's ingredients as shopping list items, named for the household rather
than for the recipe: in every library language, whatever language the recipe is in."""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass

from .models import Dimension, Ingredient, IngredientLine, Recipe, Unit
from .render import line_parts

NAME_SEPARATOR = " / "


@dataclass(frozen=True)
class ShoppingItem:
    name: str
    quantity: str
    # The recipe's ingredient lines it stands for.
    lines: list[int]

    def to_dict(self) -> dict:
        return asdict(self)


def _counted(unit_id: str | None, units: dict[str, Unit]) -> bool:
    return unit_id is None or units[unit_id].dimension is Dimension.COUNT


def shopping_items(
    recipe: Recipe, languages: list[str], ingredients: dict[str, Ingredient], units: dict[str, Unit]
) -> list[ShoppingItem]:
    """One item per ingredient and unit, summing the lines that share both (dough and
    filling both taking butter in grams). Counted amounts round up: nobody buys
    half an egg. Units stay as the recipe wrote them."""
    groups: dict[tuple[str, str | None], list[int]] = {}
    for index, line in enumerate(recipe.ingredients):
        groups.setdefault((line.ingredient_id, line.unit_id), []).append(index)
    languages = languages or [recipe.language]
    items = []
    for (ingredient_id, unit_id), indexes in groups.items():
        amounts = [q for i in indexes if (q := recipe.ingredients[i].quantity) is not None]
        quantity = sum(amounts) if amounts else None
        if quantity is not None and _counted(unit_id, units):
            # Rounded first, so 3.0000001 from scaling stays 3.
            quantity = math.ceil(round(quantity, 2))
        line = IngredientLine(ingredient_id, quantity, unit_id)
        parts = [line_parts(line, language, ingredients, units) for language in languages]
        names = dict.fromkeys(p.name for p in parts)
        items.append(ShoppingItem(NAME_SEPARATOR.join(names), parts[0].measure, indexes))
    return items


def item_text(name: str, quantity: str) -> str:
    """How an item reads on the list: "Potato / じゃがいも (3)"."""
    name, quantity = name.strip(), quantity.strip()
    return f"{name} ({quantity})" if name and quantity else name or quantity
