import pytest

from core import Dimension, Draft, InUseError, InvalidRequestError, Localized, NotFoundError, RecipeBook, Store, System
from core.catalog import absorb_names


def test_default_units_are_seeded_once(book, tmp_path):
    assert {"g", "tbsp", "cup_jp", "cup_us", "pint_uk"} <= {u.id for u in book.list_units()}
    book.delete_unit("pinch")
    reopened = RecipeBook(Store(tmp_path / "itadaki.db"))
    assert "pinch" not in {u.id for u in reopened.list_units()}


def test_default_units_have_no_clashing_terms(book):
    # Seeds bypass the upsert check, so assert they would pass it.
    units = book.list_units()
    for unit in units:
        book.upsert_unit({"id": unit.id})


def test_localized_merges_per_language(book):
    soy = book.upsert_ingredient({"localized": {"en": {"name": "soy sauce", "aliases": ["shoyu"]}}})
    soy = book.upsert_ingredient({"id": soy.id, "localized": {"ja": {"name": "醤油"}}})
    assert set(soy.localized) == {"en", "ja"}
    assert soy.localized["en"].aliases == ["shoyu"]
    soy = book.upsert_ingredient({"id": soy.id, "localized": {"en": None}})
    assert set(soy.localized) == {"ja"}


def test_terms_must_be_unique_per_language_ignoring_case(book):
    book.upsert_ingredient({"localized": {"en": {"name": "egg", "plural": "eggs"}}})
    with pytest.raises(InvalidRequestError) as refused:
        book.upsert_ingredient({"localized": {"en": {"name": "hen egg", "aliases": ["Eggs"]}}})
    assert (refused.value.key, refused.value.params) == ("name_taken", {"names": "eggs"})
    with pytest.raises(InvalidRequestError):
        book.upsert_unit({"id": "big_spoon", "localized": {"en": {"name": "big spoon", "aliases": ["TBS"]}}})


def test_same_word_in_different_languages_is_fine(book):
    book.upsert_ingredient({"localized": {"en": {"name": "tofu"}}})
    book.upsert_ingredient({"localized": {"ja": {"name": "tofu"}}})


def test_entry_needs_a_name(book):
    with pytest.raises(InvalidRequestError):
        book.upsert_ingredient({"localized": {}})


def test_unit_upsert_keeps_unspecified_fields(book):
    cup = book.upsert_unit({"id": "cup_jp", "localized": {"it": {"name": "tazza giapponese"}}})
    assert cup.factor == 200 and cup.dimension is Dimension.VOLUME
    assert cup.systems == [System.JAPANESE]
    assert cup.localized["ja"].name == "カップ"


def test_ingredient_density(book):
    flour = book.upsert_ingredient({"localized": {"en": {"name": "flour"}}, "density": 0.53})
    assert book.list_ingredients()[0].density == flour.density == 0.53


def test_unknown_fields_are_rejected(book):
    with pytest.raises(InvalidRequestError):
        book.upsert_unit({"id": "g", "colour": "red"})


def test_cannot_delete_catalog_entries_in_use(book, carbonara, guanciale):
    with pytest.raises(InUseError) as refused:
        book.delete_ingredient(guanciale.id)
    assert (refused.value.key, refused.value.params) == ("used_by_recipes", {"titles": carbonara.title})
    with pytest.raises(InUseError):
        book.delete_unit("g")


def test_usage_lists_recipes_per_entry(book, carbonara, guanciale):
    usage = book.catalog_usage()
    assert [r["title"] for r in usage["ingredients"][guanciale.id]] == ["Carbonara"]
    assert [r["title"] for r in usage["units"]["g"]] == ["Carbonara"]
    assert "tbsp" not in usage["units"]


def test_merge_moves_recipes_and_keeps_words_as_aliases(book, carbonara, guanciale):
    cheek = book.upsert_ingredient(
        {"localized": {"en": {"name": "pork cheek", "plural": "pork cheeks", "aliases": ["jowl"]}, "it": {"name": "guancia"}}}
    )
    book.update_recipe(carbonara.id, {"ingredients": [{"ingredient_id": cheek.id, "quantity": 200, "unit_id": "g"}]})
    revision = book.get_recipe(carbonara.id).revision

    merged = book.merge_ingredient(cheek.id, guanciale.id)

    assert merged.localized["en"].name == "guanciale"
    assert merged.localized["en"].aliases == ["pork cheek", "pork cheeks", "jowl"]
    assert merged.localized["it"].name == "guancia"
    assert {i.id for i in book.list_ingredients()} == {guanciale.id}
    recipe = book.get_recipe(carbonara.id)
    assert recipe.ingredients[0].ingredient_id == guanciale.id
    assert recipe.revision == revision


def test_merge_repoints_inbox_drafts(book, carbonara, guanciale):
    cheek = book.upsert_ingredient({"localized": {"en": {"name": "pork cheek"}}})
    draft = Draft.from_dict(
        {"recipe": {**carbonara.to_dict(), "ingredients": [{"ingredient_id": cheek.id}]}, "updates_id": carbonara.id}
    )
    entry = book.start_draft("adapt", "Carbonara", draft)
    book.merge_ingredient(cheek.id, guanciale.id)
    assert book.get_draft(entry.id).draft.recipe.ingredients[0].ingredient_id == guanciale.id


def test_merge_rejects_self_and_unknown(book):
    with pytest.raises(InvalidRequestError):
        book.merge_unit("g", "g")
    with pytest.raises(NotFoundError):
        book.merge_unit("g", "nope")


def test_absorbed_words_skip_known_ones_ignoring_case():
    target = {"en": Localized("egg", "eggs")}
    source = {"en": Localized("Egg", "hen eggs", ["EGGS", "hen egg", "Hen Egg"])}
    assert absorb_names(target, source)["en"].aliases == ["hen eggs", "hen egg"]


def test_cannot_delete_entries_that_drafts_use(book, guanciale):
    cheek = book.upsert_ingredient({"localized": {"en": {"name": "pork cheek"}}})
    draft = Draft.from_dict(
        {
            "recipe": {"language": "en", "title": "x", "ingredients": [{"ingredient_id": cheek.id, "unit_id": "g"}]},
            "added_names": [{"kind": "ingredient", "id": guanciale.id, "language": "it", "name": "guanciale"}],
        }
    )
    entry = book.start_draft("import", "x", draft)
    for entry_id, delete in ((cheek.id, book.delete_ingredient), ("g", book.delete_unit), (guanciale.id, book.delete_ingredient)):
        with pytest.raises(InUseError):
            delete(entry_id)
    book.discard_draft(entry.id)
    book.delete_ingredient(cheek.id)
