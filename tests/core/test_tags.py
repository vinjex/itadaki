import json

import pytest

from core import Draft, InvalidRequestError, Relation, TagKind
from core.ai import Assistant
from core.llm import AiSettings
from core.tags import recipe_tag_set, retagged
from core.models import IngredientLine
from fake_chat import FakeChat, names


def _tag(book, tag_id, en, ja=None, kind="recipe"):
    localized = {"en": {"name": en}, **({"ja": {"name": ja}} if ja else {})}
    return book.upsert_tag({"id": tag_id, "kind": kind, "localized": localized})


@pytest.fixture
def ja(book, carbonara):
    return book.create_recipe({"language": "ja", "title": "カルボナーラ"}, carbonara.id, Relation.TRANSLATION)


# Pure rules


def test_retagged_swaps_or_drops_without_repeats():
    assert retagged(["a", "b", "c"], "b", "c") == ["a", "c"]
    assert retagged(["a", "b"], "a", None) == ["b"]


def test_filter_set_includes_ingredient_tags():
    lines = [IngredientLine("pork"), IngredientLine("egg")]
    found = recipe_tag_set(["quick"], lines, {"pork": ["meat"], "egg": []})
    assert found == {"quick", "meat"}


# Catalog


def test_words_are_unique_per_kind_only(book):
    _tag(book, "vegan", "vegan")
    _tag(book, "vegan_i", "vegan", kind="ingredient")
    with pytest.raises(InvalidRequestError):
        _tag(book, "vegan_2", "Vegan")


def test_tag_kind_is_fixed(book):
    _tag(book, "quick", "quick")
    with pytest.raises(InvalidRequestError):
        book.upsert_tag({"id": "quick", "kind": "ingredient"})


def test_recipes_take_only_recipe_tags(book, carbonara):
    _tag(book, "meat", "meat", kind="ingredient")
    with pytest.raises(InvalidRequestError):
        book.update_recipe(carbonara.id, {"tags": ["meat"]})
    with pytest.raises(InvalidRequestError):
        book.update_recipe(carbonara.id, {"tags": ["nope"]})


def test_ingredients_take_only_ingredient_tags(book, guanciale):
    _tag(book, "meat", "meat", kind="ingredient")
    _tag(book, "quick", "quick")
    assert book.upsert_ingredient({"id": guanciale.id, "tags": ["meat", "meat"]}).tags == ["meat"]
    with pytest.raises(InvalidRequestError):
        book.upsert_ingredient({"id": guanciale.id, "tags": ["quick"]})


# Shared by a translation group


def test_translation_group_shares_one_tag_list(book, carbonara, ja):
    _tag(book, "quick", "quick", "時短")
    _tag(book, "italian", "Italian", "イタリアン")
    book.update_recipe(ja.id, {"tags": ["quick"]})
    assert book.get_recipe(carbonara.id).tags == ["quick"]
    book.update_recipe(carbonara.id, {"tags": ["quick", "italian"]})
    assert book.get_recipe(ja.id).tags == ["quick", "italian"]


def test_tag_change_alone_keeps_revisions(book, carbonara, ja):
    _tag(book, "quick", "quick")
    book.update_recipe(carbonara.id, {"tags": ["quick"]})
    assert book.get_recipe(carbonara.id).revision == carbonara.revision
    assert book.related(ja.id)["stale"] is False


def test_new_translation_keeps_group_tags_unless_given(book, carbonara):
    _tag(book, "quick", "quick")
    book.update_recipe(carbonara.id, {"tags": ["quick"]})
    ja = book.create_recipe({"language": "ja", "title": "カルボナーラ"}, carbonara.id, Relation.TRANSLATION)
    assert ja.tags == ["quick"]


def test_variant_starts_with_a_copy(book, carbonara):
    _tag(book, "quick", "quick")
    _tag(book, "vegan", "vegan")
    book.update_recipe(carbonara.id, {"tags": ["quick"]})
    variant = book.save_draft(Draft(book.get_recipe(carbonara.id), parent_id=carbonara.id, relation=Relation.VARIANT))
    assert variant.tags == ["quick"]
    book.update_recipe(variant.id, {"tags": ["vegan"]})
    assert book.get_recipe(carbonara.id).tags == ["quick"]


# Filtering


def test_list_filters_by_recipe_and_ingredient_tags(book, carbonara, ja, guanciale):
    _tag(book, "quick", "quick")
    _tag(book, "meat", "meat", kind="ingredient")
    book.upsert_ingredient({"id": guanciale.id, "tags": ["meat"]})
    book.update_recipe(carbonara.id, {"tags": ["quick"]})
    book.create_recipe({"language": "en", "title": "Salad"})

    ids = lambda **kw: {r.id for r in book.list_recipes(**kw)}  # noqa: E731
    # The translation has no lines of its own here, so only the original contains meat.
    assert ids(tags=["quick"]) == {carbonara.id, ja.id}
    assert ids(tags=["meat"]) == {carbonara.id}
    assert ids(tags=["quick"], prefer_language="ja") == {ja.id}


# Delete and merge


def test_delete_takes_the_tag_off_everything(book, carbonara, guanciale):
    _tag(book, "quick", "quick")
    _tag(book, "meat", "meat", kind="ingredient")
    book.update_recipe(carbonara.id, {"tags": ["quick"]})
    book.upsert_ingredient({"id": guanciale.id, "tags": ["meat"]})
    entry = book.start_draft("adapt", "x", Draft(book.get_recipe(carbonara.id), updates_id=carbonara.id))
    book.delete_tag("quick")
    book.delete_tag("meat")
    assert book.get_recipe(carbonara.id).tags == []
    assert book.list_ingredients()[0].tags == []
    assert book.get_draft(entry.id).draft.recipe.tags == []


def test_merge_moves_users_and_keeps_words_as_aliases(book, carbonara):
    _tag(book, "quick", "quick")
    _tag(book, "fast", "fast")
    book.update_recipe(carbonara.id, {"tags": ["fast"]})
    merged = book.merge_tag("fast", "quick")
    assert merged.localized["en"].aliases == ["fast"]
    assert book.get_recipe(carbonara.id).tags == ["quick"]
    assert book.catalog_usage()["recipe_tags"]["quick"][0]["id"] == carbonara.id


def test_kinds_do_not_merge(book):
    _tag(book, "vegan", "vegan")
    _tag(book, "vegan_i", "vegan", kind="ingredient")
    with pytest.raises(InvalidRequestError):
        book.merge_tag("vegan", "vegan_i")


# Drafts


def test_draft_saves_its_new_tags_first(book, carbonara):
    tag = {"id": "roman", "kind": "recipe", "localized": {"en": {"name": "Roman"}}}
    recipe = book.get_recipe(carbonara.id)
    draft = Draft.from_dict({**Draft(recipe, updates_id=carbonara.id).to_dict(), "new_tags": [tag]})
    draft.recipe.tags = ["roman"]
    assert book.save_draft(draft).tags == ["roman"]
    assert book.list_tags(TagKind.RECIPE)[0].id == "roman"


# AI


def _assistant(book, chat, pages=None):
    return Assistant(book, chat, AiSettings("http://x", "k", "m"), fetch=lambda url: pages[url])


def test_ai_picks_listed_tags_and_proposes_new_ones(book, carbonara):
    _tag(book, "quick", "quick", "時短")
    chat = FakeChat({"tags": ["Quick", "Italian", "pasta", "egg", "pork", "extra"]}, names(*[{"ja": "x" + n} for n in "abc"]))
    draft = _assistant(book, chat).tag(carbonara.id, "keep it short")

    assert '"quick"' in chat.sent(0) and "keep it short" in chat.sent(0)
    assert draft.updates_id == carbonara.id
    assert draft.recipe.tags == ["quick", "italian", "pasta", "egg"]
    assert [t.id for t in draft.new_tags] == ["italian", "pasta", "egg"]
    assert draft.new_tags[0].localized["ja"].name == "xa"
    assert json.loads(chat.sent(1)) == {"names": ["Italian", "pasta", "egg"]}
    book.save_draft(draft)
    assert book.get_recipe(carbonara.id).tags == ["quick", "italian", "pasta", "egg"]


def test_translation_names_tags_missing_the_language(book, carbonara):
    _tag(book, "quick", "quick")
    book.update_recipe(carbonara.id, {"tags": ["quick"]})
    chat = FakeChat({"texts": ["カルボナーラ", "パスタを茹でる。"]}, names({"ja": "グアンチャーレ"}, {"ja": "時短"}))
    book.upsert_ingredient({"id": "guanciale", "localized": {"ja": None}})
    draft = _assistant(book, chat).translate(carbonara.id, "ja")
    assert "quick" not in chat.sent(0)
    book.save_draft(draft)
    assert book.list_tags()[0].localized["ja"].name == "時短"


def test_import_links_known_page_tags_and_suggests_the_rest(book):
    _tag(book, "italian", "Italian")
    data = {
        "@context": "https://schema.org", "@type": "Recipe", "name": "Carbonara",
        "recipeCuisine": "italian", "keywords": "pasta, Italian, eggs",
        "recipeIngredient": ["2 eggs"], "recipeInstructions": [{"@type": "HowToStep", "text": "Mix."}],
    }
    page = f'<html><head><script type="application/ld+json">{json.dumps(data)}</script></head></html>'
    draft = _assistant(book, FakeChat()).read_page(page, "https://x")
    assert draft.recipe.tags == ["italian"]
    assert draft.suggested_tags == ["pasta", "eggs"]


def test_new_tags_get_readable_ids_across_kinds(book):
    _tag(book, "vegan", "vegan", kind="ingredient")
    made = book.upsert_tag({"kind": "recipe", "localized": {"ja": {"name": "時短"}, "en": {"name": "Vegan"}}})
    assert made.id == "vegan_2"
    assert book.upsert_tag({"localized": {"ja": {"name": "時短料理"}}}).id == "tag"


def test_draft_tag_with_a_taken_id_is_renumbered(book, carbonara):
    _tag(book, "vegan", "vegan", kind="ingredient")
    tag = {"id": "vegan", "kind": "recipe", "localized": {"en": {"name": "vegan"}}}
    draft = Draft.from_dict({**Draft(book.get_recipe(carbonara.id), updates_id=carbonara.id).to_dict(), "new_tags": [tag]})
    draft.recipe.tags = ["vegan"]
    assert book.save_draft(draft).tags == ["vegan_2"]
    assert book.list_tags(TagKind.INGREDIENT)[0].id == "vegan"


def test_upgrade_drops_old_free_word_tags(tmp_path):
    import sqlite3

    from core import Store
    from core.storage import _MIGRATIONS, _SCHEMA

    path = tmp_path / "old.db"
    db = sqlite3.connect(path)
    db.executescript(_SCHEMA + "".join(_MIGRATIONS[v] for v in range(2, 6)) + "PRAGMA user_version = 5;")
    db.execute("INSERT INTO recipes VALUES ('r', NULL, 'en', 'Soup', 'now', ?)", (json.dumps({"language": "en", "title": "Soup", "tags": ["warm"]}),))
    db.commit()
    db.close()
    assert Store(path).get_recipe("r").tags == []


def test_list_cards_carry_group_tags_languages_and_times(book, carbonara, ja):
    _tag(book, "quick", "quick")
    book.update_recipe(carbonara.id, {"tags": ["quick"], "cook_minutes": 15})
    salad = book.create_recipe({"language": "en", "title": "Salad"})
    cards = {c.id: c for c in book.list_recipes()}
    assert (cards[ja.id].tags, cards[ja.id].languages) == (["quick"], ["en", "ja"])
    assert cards[carbonara.id].cook_minutes == 15
    assert cards[salad.id].languages == ["en"]
