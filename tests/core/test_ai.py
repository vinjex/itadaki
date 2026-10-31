import json

import pytest

from core import Draft, Ingredient, IngredientLine, InvalidRequestError, Localized, RawLine, Recipe, Relation, Step, Usage
from core.ai import Assistant
from core.llm import AiSettings
from fake_chat import FakeChat, line, names


def assistant(book, chat, pages=None):
    return Assistant(book, chat, AiSettings("http://x", "k", "m"), fetch=lambda url: pages[url])


def ld_page(**recipe):
    data = {"@context": "https://schema.org", "@type": "Recipe", **recipe}
    return f'<html><head><script type="application/ld+json">{json.dumps(data)}</script></head></html>'


def test_structure_links_known_entries_and_proposes_new_ones(book, guanciale):
    book.upsert_ingredient({"id": "egg", "localized": {"en": {"name": "egg", "plural": "eggs"}}})
    chat = FakeChat(
        {
            "ingredients": [
                line("Guanciale", quantity=200, unit="grams"),
                line("egg", "eggs", quantity=3),
                line("pecorino romano", quantity=50, unit="g", note="grated"),
                line("milk", quantity=0.6666666, unit="cup_us"),
            ]
        },
        names({"ja": "ペコリーノ・ロマーノ"}, {"ja": "牛乳"}),
    )
    lines = [RawLine("200 grams guanciale"), RawLine("3 eggs"), RawLine("50 g pecorino, grated"), RawLine("2/3 cup milk")]
    result = assistant(book, chat).structure(lines, "en")

    assert [l.ingredient_id for l in result.lines] == ["guanciale", "egg", "pecorino_romano", "milk"]
    assert result.lines[3].quantity == 0.67
    assert result.lines[0].unit_id == "g"
    assert result.lines[2].note == "grated"
    assert [i.id for i in result.new_ingredients] == ["pecorino_romano", "milk"]
    assert result.new_ingredients[0].localized["ja"].name == "ペコリーノ・ロマーノ"
    assert "200 grams guanciale" in chat.sent(0)
    assert json.loads(chat.sent(1)) == {"names": ["pecorino romano", "milk"]}


def test_japanese_recipe_gets_english_based_ids(book):
    chat = FakeChat({"ingredients": [line("卵", quantity=2)]}, names({"en": "egg"}))
    result = assistant(book, chat).structure([RawLine("卵 2個")], "ja")
    assert result.lines[0].ingredient_id == "egg"
    assert set(result.new_ingredients[0].localized) == {"ja", "en"}


def test_names_that_already_mean_something_else_are_left_out(book):
    book.upsert_ingredient({"id": "green_onion", "localized": {"en": {"name": "green onion"}, "ja": {"name": "ネギ"}}})
    chat = FakeChat({"ingredients": [line("scallion", quantity=1)]}, names({"ja": "ネギ"}))
    result = assistant(book, chat).structure([RawLine("1 scallion")], "en")
    assert set(result.new_ingredients[0].localized) == {"en"}


def test_unknown_unit_triggers_a_retry(book, guanciale):
    chat = FakeChat(
        {"ingredients": [line("guanciale", quantity=1, unit="handful")]},
        {"ingredients": [line("guanciale", quantity=1, unit=None)]},
    )
    result = assistant(book, chat).structure([RawLine("a handful of guanciale")], "en")
    assert result.lines[0].unit_id is None
    assert "handful" in chat.sent()


def test_read_url_is_instant_and_structuring_finishes_it(book):
    page = ld_page(
        name="Oyakodon",
        recipeIngredient=["2 eggs"],
        recipeInstructions=[{"@type": "HowToStep", "text": "Simmer the secret broth."}],
    )
    idle = FakeChat()
    draft = assistant(book, idle, {"https://e.x/r": page}).read_url("https://e.x/r")
    assert idle.calls == []
    assert draft.recipe.steps[0].text == "Simmer the secret broth."
    assert [l.text for l in draft.raw_lines] == ["2 eggs"]
    with pytest.raises(InvalidRequestError):
        book.save_draft(draft)

    chat = FakeChat({"ingredients": [line("egg", "eggs", quantity=2)]}, names({"ja": "卵"}))
    done = assistant(book, chat).structure_draft(draft)
    assert "secret broth" not in chat.sent(0)
    assert done.raw_lines == [] and done.usage.prompt_tokens == 20

    saved = book.save_draft(done)
    assert saved.ingredients[0].ingredient_id == "egg"
    assert book.list_ingredients()[0].localized["ja"].name == "卵"


def test_read_url_without_embedded_data_returns_none(book):
    assert assistant(book, FakeChat(), {"https://e.x": "<html></html>"}).read_url("https://e.x") is None


def test_extract_uses_page_text(book):
    from test_page import ARTICLE

    answer = {
        "language": "en", "title": "Grandma's oyakodon", "description": "", "servings": 2,
        "prep_minutes": None, "cook_minutes": 9.6, "total_minutes": None,
        "ingredients": [line("egg", "eggs", quantity=2)], "steps": [{"text": "Simmer.", "section": None}],
        "notes": "", "tags": [],
    }
    chat = FakeChat(answer, names({"ja": "卵"}))
    draft = assistant(book, chat, {"https://e.x/r": ARTICLE}).extract("https://e.x/r")
    assert "dashi broth" in chat.sent(0) and "newsletter" not in chat.sent(0)
    assert draft.recipe.cook_minutes == 10
    assert draft.recipe.image_url == "https://e.x/photo.jpg"


def test_extract_without_any_recipe_fails_cleanly(book):
    with pytest.raises(InvalidRequestError):
        assistant(book, FakeChat(), {"https://e.x": "<html></html>"}).extract("https://e.x")


def test_translation_creates_child_and_fills_missing_catalog_names(book, carbonara):
    book.upsert_ingredient({"id": "guanciale", "localized": {"ja": None}})
    chat = FakeChat({"texts": ["カルボナーラ", "パスタを茹でる。"]}, names({"ja": "グアンチャーレ"}))
    draft = assistant(book, chat).translate(carbonara.id, "ja")
    assert json.loads(chat.sent(0)) == {"texts": ["Carbonara", "Cook the pasta."]}
    assert json.loads(chat.sent(1)) == {"names": ["guanciale"]}

    saved = book.save_draft(draft)
    assert (saved.parent_id, saved.relation, saved.title) == (carbonara.id, Relation.TRANSLATION, "カルボナーラ")
    assert saved.ingredients == carbonara.ingredients
    assert book.list_ingredients()[0].localized["ja"].name == "グアンチャーレ"


def test_retranslation_sends_only_changed_text(book, carbonara):
    first = FakeChat({"texts": ["カルボナーラ", "パスタを茹でる。"]})
    ja = book.save_draft(assistant(book, first).translate(carbonara.id, "ja"))
    book.update_recipe(carbonara.id, {"notes": "Use pecorino."})
    assert book.related(ja.id)["stale"] is True

    second = FakeChat({"texts": ["ペコリーノを使う。"]})
    draft = assistant(book, second).translate(carbonara.id, "ja")
    assert json.loads(second.sent())["texts"] == ["Use pecorino."]
    assert draft.updates_id == ja.id

    updated = book.save_draft(draft)
    assert (updated.title, updated.notes) == ("カルボナーラ", "ペコリーノを使う。")
    assert book.related(ja.id)["stale"] is False


def test_unchanged_retranslation_makes_no_call(book, carbonara):
    first = FakeChat({"texts": ["カルボナーラ", "パスタを茹でる。"]})
    book.save_draft(assistant(book, first).translate(carbonara.id, "ja"))
    idle = FakeChat()
    assistant(book, idle).translate(carbonara.id, "ja")
    assert idle.calls == []


def test_translation_count_mismatch_is_retried(book, carbonara):
    chat = FakeChat(
        {"texts": ["カルボナーラ"]},
        {"texts": ["カルボナーラ", "パスタを茹でる。"]},
    )
    assistant(book, chat).translate(carbonara.id, "ja")
    assert len(chat.calls) == 2


@pytest.mark.parametrize("as_variant", [False, True])
def test_adapt_updates_in_place_or_creates_variant(book, carbonara, as_variant):
    answer = {
        "language": "en", "title": "Bacon carbonara", "description": "", "servings": None,
        "prep_minutes": None, "cook_minutes": None, "total_minutes": None,
        "ingredients": [line("bacon", quantity=200, unit="g")],
        "steps": [{"text": "Cook the pasta.", "section": None}], "notes": "", "tags": [],
    }
    chat = FakeChat(answer, names({"ja": "ベーコン"}))
    draft = assistant(book, chat).adapt(carbonara.id, "use bacon", as_variant=as_variant)
    assert "200 g guanciale" in chat.sent(0)

    saved = book.save_draft(draft)
    if as_variant:
        assert (saved.parent_id, saved.relation) == (carbonara.id, Relation.VARIANT)
    else:
        assert saved.id == carbonara.id and saved.revision == 2
    assert saved.ingredients[0].ingredient_id == "bacon"


def test_adapt_draft_finishes_raw_lines_and_keeps_where_it_lands(book, guanciale):
    draft = Draft(
        Recipe(language="en", title="Carbonara", steps=[Step("Cook the pasta.")],
               ingredients=[IngredientLine("pecorino", 50, "g"), IngredientLine("chili")]),
        updates_id="r1",
        new_ingredients=[Ingredient("pecorino", {"en": Localized("pecorino")}), Ingredient("chili", {"en": Localized("chili")})],
        raw_lines=[RawLine("200 g guanciale")],
        usage=Usage(1, 1),
    )
    answer = {
        "language": "en", "title": "Bacon carbonara", "description": "", "servings": None,
        "prep_minutes": None, "cook_minutes": None, "total_minutes": None,
        "ingredients": [line("pecorino", quantity=50, unit="g"), line("bacon", quantity=200, unit="g")],
        "steps": [{"text": "Cook the pasta.", "section": None}], "notes": "", "tags": [],
    }
    chat = FakeChat(answer, names({"ja": "ベーコン"}))
    done = assistant(book, chat).adapt_draft(draft, "use bacon")

    assert "50 g pecorino" in chat.sent(0) and "200 g guanciale" in chat.sent(0) and "use bacon" in chat.sent(0)
    assert json.loads(chat.sent(1)) == {"names": ["bacon"]}
    assert done.updates_id == "r1" and done.raw_lines == []
    assert [i.id for i in done.new_ingredients] == ["pecorino", "bacon"]
    assert done.usage.prompt_tokens == 21


def test_single_language_library_makes_no_naming_call(book):
    book.update_settings({"languages": ["en"]})
    chat = FakeChat({"ingredients": [line("milk", quantity=1, unit="cup_us")]})
    result = assistant(book, chat).structure([RawLine("1 cup milk")], "en")
    assert set(result.new_ingredients[0].localized) == {"en"}
    assert len(chat.calls) == 1


def test_without_ai_pages_with_recipe_data_still_import(book, carbonara):
    page = ld_page(name="Toast", recipeIngredient=["1 slice bread"], recipeInstructions="Toast it.")
    offline = Assistant(book, None, None, fetch=lambda url: page)
    assert not offline.enabled
    draft = offline.read_url("https://example.com/toast")
    assert draft.recipe.title == "Toast" and [r.text for r in draft.raw_lines] == ["1 slice bread"]
    with pytest.raises(InvalidRequestError, match="AI is not set up"):
        offline.translate(carbonara.id, "ja")
