import pytest

from core import IngredientLine
from core.render import LineParts, line_parts, render_line
from core.units import DEFAULT_UNITS
from core.models import Ingredient, Localized

UNITS = {u.id: u for u in DEFAULT_UNITS}
INGREDIENTS = {
    "egg": Ingredient("egg", {"en": Localized("egg", "eggs"), "ja": Localized("卵")}),
    "soy_sauce": Ingredient("soy_sauce", {"en": Localized("soy sauce"), "ja": Localized("醤油")}),
}


@pytest.mark.parametrize(
    "line,language,text",
    [
        (IngredientLine("egg", 3), "en", "3 eggs"),
        (IngredientLine("egg", 1), "en", "1 egg"),
        (IngredientLine("egg", 2, note="2-3"), "en", "2 eggs, 2-3"),
        (IngredientLine("soy_sauce", 2, unit_id="tbsp"), "en", "2 tbsp soy sauce"),
        (IngredientLine("soy_sauce", note="to taste"), "en", "soy sauce, to taste"),
        (IngredientLine("soy_sauce", 2, unit_id="tbsp"), "ja", "醤油 大さじ2"),
        (IngredientLine("egg", 2, unit_id="piece"), "ja", "卵 2個"),
        (IngredientLine("egg", 0.333333), "ja", "卵 0.33"),
        (IngredientLine("soy_sauce", note="お好みで"), "ja", "醤油（お好みで）"),
    ],
)
def test_render_line(line, language, text):
    assert render_line(line, language, INGREDIENTS, UNITS) == text


def test_line_parts_keep_name_measure_and_note_apart():
    line = IngredientLine("soy_sauce", 2, unit_id="tbsp", note="dark")
    assert line_parts(line, "en", INGREDIENTS, UNITS) == LineParts("soy sauce", "2 tbsp", "dark")
    assert line_parts(line, "ja", INGREDIENTS, UNITS) == LineParts("醤油", "大さじ2", "dark")
