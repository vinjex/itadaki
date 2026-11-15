import json

import pytest

from core.catalog import term_index
from core.importer import draft_from_html
from core.units import DEFAULT_UNITS


def _page(recipe: dict, lang: str = "en") -> str:
    return (
        f'<html lang="{lang}"><head><script type="application/ld+json">'
        f"{json.dumps(recipe, ensure_ascii=False)}</script></head><body></body></html>"
    )


def test_reads_schema_org_recipe():
    html = _page(
        {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": "Oyakodon",
            "recipeYield": "2 servings",
            "totalTime": "PT25M",
            "image": "https://example.com/oyakodon.jpg",
            "recipeIngredient": ["2 eggs", "150 g chicken thigh"],
            "recipeInstructions": [
                {"@type": "HowToStep", "text": "Simmer the chicken."},
                {"@type": "HowToStep", "text": "Add the eggs."},
            ],
        }
    )
    draft = draft_from_html(html, "https://example.com/oyakodon")
    recipe = draft.recipe
    assert recipe.title == "Oyakodon"
    assert (recipe.yield_quantity, recipe.yield_unit_id) == (2, None) and recipe.total_minutes == 25
    assert recipe.ingredients == []
    assert [line.text for line in draft.raw_lines] == ["2 eggs", "150 g chicken thigh"]
    assert [s.text for s in recipe.steps] == ["Simmer the chicken.", "Add the eggs."]
    assert recipe.image_url == "https://example.com/oyakodon.jpg"
    assert recipe.id == "" and recipe.source_url == "https://example.com/oyakodon"


def test_takes_language_from_page():
    html = _page(
        {"@context": "https://schema.org", "@type": "Recipe", "name": "親子丼", "recipeIngredient": ["卵 2個"],
         "recipeInstructions": "煮る。"},
        lang="ja-JP",
    )
    assert draft_from_html(html, "https://example.jp/r").recipe.language == "ja"


def test_page_without_recipe_returns_none():
    assert draft_from_html("<html><body><p>Just a blog</p></body></html>", "https://example.com") is None


def test_recipe_data_without_ingredients_or_steps_counts_as_none():
    # Like sirogohan.com: microdata naming only the dish, its photo and description.
    html = """<html lang="ja"><body><div itemscope itemtype="http://schema.org/Recipe">
      <h1 itemprop="name">おからの煮物</h1><p itemprop="description">定番の副菜。</p>
      <img itemprop="image" src="https://example.jp/okara.jpg"></div>
      <ul><li>おから 100g</li></ul></body></html>"""
    assert draft_from_html(html, "https://example.jp/okara") is None


@pytest.mark.parametrize(
    "text, expected",
    [("200 g", (200, "g")), ("2人分", (2, None)), ("12 cookies", (12, None)), ("200 grams", (200, "g"))],
)
def test_yield_links_its_unit_when_the_word_names_one(text, expected):
    page = _page({"@context": "https://schema.org", "@type": "Recipe", "name": "Mix", "recipeYield": text,
                  "recipeIngredient": ["flour"], "recipeInstructions": ["Mix."]})
    units = term_index((u.id, u.localized) for u in DEFAULT_UNITS)
    recipe = draft_from_html(page, "https://e.x/mix", unit_terms=units).recipe
    assert (recipe.yield_quantity, recipe.yield_unit_id) == expected
