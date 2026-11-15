import pytest

from core import InUseError, InvalidRequestError, NotFoundError, Relation, TreeError


def test_translation_records_parent_revision(book, carbonara):
    ja = book.create_recipe({"language": "ja", "title": "カルボナーラ"}, carbonara.id, "translation")
    assert ja.parent_revision == carbonara.revision
    assert book.related(ja.id)["stale"] is False


def test_parent_edit_makes_translation_stale_until_synced(book, carbonara):
    ja = book.create_recipe({"language": "ja", "title": "カルボナーラ"}, carbonara.id, "translation")
    book.update_recipe(carbonara.id, {"notes": "Use pecorino."})
    assert book.related(ja.id)["stale"] is True
    book.mark_translation_synced(ja.id)
    assert book.related(ja.id)["stale"] is False


def test_variants_never_go_stale(book, carbonara):
    bacon = book.create_recipe({"language": "en", "title": "Bacon carbonara"}, carbonara.id, "variant")
    book.update_recipe(carbonara.id, {"notes": "x"})
    assert book.related(bacon.id)["stale"] is False


def test_translation_in_same_language_is_rejected(book, carbonara):
    with pytest.raises(TreeError):
        book.create_recipe({"language": "en", "title": "Carbonara 2"}, carbonara.id, "translation")


def test_parent_and_relation_go_together(book, carbonara):
    with pytest.raises(InvalidRequestError):
        book.create_recipe({"language": "ja", "title": "x"}, carbonara.id)


def test_translation_group_spans_translations_but_not_variants(book, carbonara):
    ja = book.create_recipe({"language": "ja", "title": "カルボナーラ"}, carbonara.id, "translation")
    it = book.create_recipe({"language": "it", "title": "Carbonara"}, ja.id, "translation")
    bacon = book.create_recipe({"language": "en", "title": "Bacon carbonara"}, carbonara.id, "variant")
    bacon_ja = book.create_recipe({"language": "ja", "title": "ベーコン"}, bacon.id, "translation")

    related = book.related(it.id)
    assert {r["id"] for r in related["translations"]} == {carbonara.id, ja.id}
    assert book.related(carbonara.id)["variants"][0]["id"] == bacon.id
    assert {r["id"] for r in book.related(bacon_ja.id)["translations"]} == {bacon.id}


def test_delete_with_children_needs_cascade(book, carbonara):
    ja = book.create_recipe({"language": "ja", "title": "カルボナーラ"}, carbonara.id, "translation")
    with pytest.raises(InUseError):
        book.delete_recipe(carbonara.id)
    assert book.delete_recipe(carbonara.id, cascade=True) == [ja.id, carbonara.id]
    with pytest.raises(NotFoundError):
        book.get_recipe(carbonara.id)


def test_relation_is_parsed(book, carbonara):
    ja = book.create_recipe({"language": "ja", "title": "x"}, carbonara.id, "translation")
    assert book.get_recipe(ja.id).relation is Relation.TRANSLATION


def test_list_shows_each_dish_once_in_the_preferred_language(book, carbonara):
    ja = book.create_recipe({"language": "ja", "title": "カルボナーラ"}, carbonara.id, "translation")
    bacon = book.create_recipe({"language": "en", "title": "Bacon carbonara"}, carbonara.id, "variant")
    oyako = book.create_recipe({"language": "ja", "title": "親子丼"})

    assert {r.id for r in book.list_recipes(prefer_language="ja")} == {ja.id, bacon.id, oyako.id}
    assert {r.id for r in book.list_recipes(prefer_language="en")} == {carbonara.id, bacon.id, oyako.id}


def test_yield_unit_counts_as_a_used_unit(book, carbonara):
    book.update_recipe(carbonara.id, {"ingredients": [], "yield_quantity": 200, "yield_unit_id": "g"})
    assert book.catalog_usage()["units"]["g"][0]["id"] == carbonara.id
    with pytest.raises(InUseError):
        book.delete_unit("g")
    book.upsert_unit({"id": "gram2", "localized": {"en": {"name": "gram2"}}})
    book.merge_unit("g", "gram2")
    assert book.get_recipe(carbonara.id).yield_unit_id == "gram2"
    assert book.yield_parts(book.get_recipe(carbonara.id)).measure == "200 gram2"


def test_unknown_yield_unit_is_refused(book, carbonara):
    with pytest.raises(InvalidRequestError):
        book.update_recipe(carbonara.id, {"yield_unit_id": "bowl"})
