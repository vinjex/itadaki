import pytest

from core import ConversionError, IngredientLine, Recipe, scaled
from core.units import DEFAULT_UNITS, convert

UNITS = {u.id: u for u in DEFAULT_UNITS}


def test_japanese_and_us_cups_differ():
    assert convert(1, UNITS["cup_jp"], UNITS["ml"]) == 200
    assert convert(1, UNITS["cup_us"], UNITS["tbsp"]) == pytest.approx(15.77, abs=0.01)


@pytest.mark.parametrize("source,target", [("g", "ml"), ("pinch", "g"), ("piece", "g")])
def test_incompatible_units_raise(source, target):
    with pytest.raises(ConversionError):
        convert(1, UNITS[source], UNITS[target])


def test_scaling_moves_yield_and_amounts_and_leaves_unquantified_lines_alone():
    recipe = Recipe("en", "Mix", yield_quantity=200, yield_unit_id="g",
                    ingredients=[IngredientLine("egg", quantity=2), IngredientLine("salt")])
    bigger = scaled(recipe, 1.5)
    assert (bigger.yield_quantity, bigger.yield_unit_id) == (300, "g")
    assert [line.quantity for line in bigger.ingredients] == [3, None]
