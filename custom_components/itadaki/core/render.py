"""Turning structured ingredient lines into display text. The one place this happens:
the panel shows it, and the AI reads it when a recipe is sent for adapting."""

from __future__ import annotations

from dataclasses import asdict, dataclass

from .catalog import display_name
from .models import Ingredient, IngredientLine, Unit

# Japanese writes spoon and cup measures before the number (大さじ2, カップ1) and
# everything else after it (200g, 2個).
_JA_UNITS_BEFORE_NUMBER = frozenset({"tsp", "tbsp", "cup_jp", "cup_us"})


def _number(value: float) -> str:
    return f"{round(value, 2):g}"


@dataclass(frozen=True)
class LineParts:
    """A line split for display: the panel lays these out, the AI reads them joined."""

    name: str
    measure: str = ""
    note: str = ""
    # The unit word alone, shown beside an amount being typed in.
    unit: str = ""

    def to_dict(self) -> dict[str, str]:
        return asdict(self)


def _is_plural(quantity: float | None) -> bool:
    return quantity is not None and quantity != 1


def measure_parts(
    quantity: float | None, unit_id: str | None, language: str, units: dict[str, Unit]
) -> tuple[str, str]:
    """The amount with its unit, in the language's order, and the unit word alone."""
    amount = "" if quantity is None else _number(quantity)
    unit = display_name(units[unit_id].localized, language, _is_plural(quantity)) if unit_id else ""
    if language == "ja":
        return (unit + amount if unit_id in _JA_UNITS_BEFORE_NUMBER else amount + unit), unit
    return " ".join(p for p in (amount, unit) if p), unit


def line_parts(
    line: IngredientLine, language: str, ingredients: dict[str, Ingredient], units: dict[str, Unit]
) -> LineParts:
    # "2 tbsp soy sauce" but "3 eggs": with a unit, the unit carries the plural.
    plural = _is_plural(line.quantity) and not line.unit_id
    name = display_name(ingredients[line.ingredient_id].localized, language, plural)
    measure, unit = measure_parts(line.quantity, line.unit_id, language, units)
    return LineParts(name, measure, line.note or "", unit)


def render_line(
    line: IngredientLine, language: str, ingredients: dict[str, Ingredient], units: dict[str, Unit]
) -> str:
    parts = line_parts(line, language, ingredients, units)
    if language == "ja":
        text = f"{parts.name} {parts.measure}".strip()
        return f"{text}（{parts.note}）" if parts.note else text
    text = f"{parts.measure} {parts.name}".strip()
    return f"{text}, {parts.note}" if parts.note else text
