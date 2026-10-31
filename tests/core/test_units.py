import pytest

from core import ConversionError, IngredientLine, scale_lines
from core.units import DEFAULT_UNITS, convert

UNITS = {u.id: u for u in DEFAULT_UNITS}


def test_japanese_and_us_cups_differ():
    assert convert(1, UNITS["cup_jp"], UNITS["ml"]) == 200
    assert convert(1, UNITS["cup_us"], UNITS["tbsp"]) == pytest.approx(15.77, abs=0.01)


@pytest.mark.parametrize("source,target", [("g", "ml"), ("pinch", "g"), ("piece", "g")])
def test_incompatible_units_raise(source, target):
    with pytest.raises(ConversionError):
        convert(1, UNITS[source], UNITS[target])


def test_scaling_leaves_unquantified_lines_alone():
    lines = [IngredientLine("egg", quantity=2), IngredientLine("salt")]
    scaled = scale_lines(lines, 1.5)
    assert scaled[0].quantity == 3
    assert scaled[1].quantity is None
