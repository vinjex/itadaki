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

    def to_dict(self) -> dict[str, str]:
        return asdict(self)


def line_parts(
    line: IngredientLine, language: str, ingredients: dict[str, Ingredient], units: dict[str, Unit]
) -> LineParts:
    plural = line.quantity is not None and line.quantity != 1
    amount = "" if line.quantity is None else _number(line.quantity)
    unit = display_name(units[line.unit_id].localized, language, plural) if line.unit_id else ""
    # "2 tbsp soy sauce" but "3 eggs": with a unit, the unit carries the plural.
    name = display_name(ingredients[line.ingredient_id].localized, language, plural and not line.unit_id)
    if language == "ja":
        measure = unit + amount if line.unit_id in _JA_UNITS_BEFORE_NUMBER else amount + unit
    else:
        measure = " ".join(p for p in (amount, unit) if p)
    return LineParts(name, measure, line.note or "")


def render_line(
    line: IngredientLine, language: str, ingredients: dict[str, Ingredient], units: dict[str, Unit]
) -> str:
    parts = line_parts(line, language, ingredients, units)
    if language == "ja":
        text = f"{parts.name} {parts.measure}".strip()
        return f"{text}（{parts.note}）" if parts.note else text
    text = f"{parts.measure} {parts.name}".strip()
    return f"{text}, {parts.note}" if parts.note else text
