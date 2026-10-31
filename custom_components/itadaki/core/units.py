from __future__ import annotations

from dataclasses import replace

from .errors import ConversionError
from .models import Dimension, IngredientLine, Localized, System, Unit


METRIC, US, IMPERIAL, JAPANESE = System.METRIC, System.US, System.IMPERIAL, System.JAPANESE
MASS, VOLUME, COUNT, OTHER = Dimension.MASS, Dimension.VOLUME, Dimension.COUNT, Dimension.OTHER


def _unit(
    unit_id: str,
    dimension: Dimension,
    factor: float | None,
    systems: list[System],
    en: tuple[str, str | None, list[str]],
    ja: tuple[str, list[str]],
) -> Unit:
    return Unit(
        unit_id,
        {"en": Localized(*en), "ja": Localized(ja[0], None, ja[1])},
        dimension,
        factor,
        systems,
    )


# Units that share a name across traditions (cup, pint, fluid ounce) differ in size,
# so each tradition gets its own unit rather than one ambiguous entry.
# "t" and "T" are deliberately not aliases: matching ignores case, and US recipes
# use them for teaspoon and tablespoon respectively.
DEFAULT_UNITS: list[Unit] = [
    _unit("g", MASS, 1, [METRIC, JAPANESE], ("g", None, ["gram", "grams", "gr"]), ("g", ["グラム"])),
    _unit("kg", MASS, 1000, [METRIC, JAPANESE], ("kg", None, ["kilogram", "kilograms", "kilo", "kilos"]), ("kg", ["キロ", "キログラム"])),
    _unit("oz", MASS, 28.3495, [US, IMPERIAL], ("oz", None, ["ounce", "ounces"]), ("オンス", [])),
    _unit("lb", MASS, 453.592, [US, IMPERIAL], ("lb", "lb", ["lbs", "pound", "pounds"]), ("ポンド", [])),
    _unit("ml", VOLUME, 1, [METRIC, JAPANESE], ("ml", None, ["milliliter", "milliliters", "millilitre", "millilitres", "cc"]), ("ml", ["ミリリットル", "cc"])),
    _unit("l", VOLUME, 1000, [METRIC, JAPANESE], ("l", None, ["liter", "liters", "litre", "litres"]), ("L", ["リットル"])),
    _unit("tsp", VOLUME, 5, [METRIC, US, IMPERIAL, JAPANESE], ("tsp", None, ["teaspoon", "teaspoons", "tsps"]), ("小さじ", ["小匙"])),
    _unit("tbsp", VOLUME, 15, [METRIC, US, IMPERIAL, JAPANESE], ("tbsp", None, ["tablespoon", "tablespoons", "tbs", "tbsps", "tbl"]), ("大さじ", ["大匙"])),
    _unit("cup_jp", VOLUME, 200, [JAPANESE], ("Japanese cup", "Japanese cups", []), ("カップ", [])),
    _unit("cup_us", VOLUME, 236.588, [US], ("cup", "cups", []), ("カップ（米国）", [])),
    _unit("fl_oz_us", VOLUME, 29.5735, [US], ("fl oz", None, ["fluid ounce", "fluid ounces"]), ("液量オンス（米国）", [])),
    _unit("fl_oz_uk", VOLUME, 28.4131, [IMPERIAL], ("fl oz (UK)", None, []), ("液量オンス（英国）", [])),
    _unit("pint_us", VOLUME, 473.176, [US], ("pint", "pints", ["pt"]), ("パイント（米国）", [])),
    _unit("pint_uk", VOLUME, 568.261, [IMPERIAL], ("pint (UK)", "pints (UK)", []), ("パイント（英国）", [])),
    _unit("piece", COUNT, 1, [], ("piece", "pieces", ["pc", "pcs"]), ("個", [])),
    _unit("clove", COUNT, 1, [], ("clove", "cloves", []), ("片", ["かけ"])),
    _unit("pinch", OTHER, None, [], ("pinch", "pinches", []), ("ひとつまみ", ["少々"])),
]


def round_quantity(value: float | None) -> float | None:
    """Amounts are kept to 2 decimals: ⅔ cup is 0.67, never 0.6666666."""
    return None if value is None else round(value, 2)


def convert(quantity: float, source: Unit, target: Unit) -> float:
    if (
        source.dimension != target.dimension
        or source.dimension is Dimension.OTHER
        or source.factor is None
        or target.factor is None
    ):
        raise ConversionError(f"cannot convert {source.id} to {target.id}")
    return quantity * source.factor / target.factor


def scale_lines(lines: list[IngredientLine], factor: float) -> list[IngredientLine]:
    return [replace(line, quantity=None if line.quantity is None else line.quantity * factor) for line in lines]
