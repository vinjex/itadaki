import json

from core.importer import draft_from_html


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
    assert recipe.servings == 2 and recipe.total_minutes == 25
    assert recipe.ingredients == []
    assert [line.text for line in draft.raw_lines] == ["2 eggs", "150 g chicken thigh"]
    assert [s.text for s in recipe.steps] == ["Simmer the chicken.", "Add the eggs."]
    assert recipe.image_url == "https://example.com/oyakodon.jpg"
    assert recipe.id == "" and recipe.source_url == "https://example.com/oyakodon"


def test_takes_language_from_page():
    html = _page(
        {"@context": "https://schema.org", "@type": "Recipe", "name": "親子丼", "recipeIngredient": ["卵 2個"]},
        lang="ja-JP",
    )
    assert draft_from_html(html, "https://example.jp/r").recipe.language == "ja"


def test_page_without_recipe_returns_none():
    assert draft_from_html("<html><body><p>Just a blog</p></body></html>", "https://example.com") is None
