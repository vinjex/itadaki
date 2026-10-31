import pytest

from core import InvalidRequestError, ItadakiError, NotFoundError


def test_round_trips_through_storage(book, carbonara):
    loaded = book.get_recipe(carbonara.id)
    assert loaded == carbonara
    assert (loaded.ingredients[0].quantity, loaded.ingredients[0].unit_id) == (200, "g")


def test_partial_update_bumps_revision_and_keeps_other_fields(book, carbonara):
    updated = book.update_recipe(carbonara.id, {"title": "Spaghetti carbonara"})
    assert updated.revision == 2
    assert updated.steps == carbonara.steps
    assert updated.created_at == carbonara.created_at
    assert updated.updated_at > carbonara.updated_at


@pytest.mark.parametrize("changes", [{"revision": 9}, {"parent_id": "x"}, {"colour": "red"}])
def test_update_rejects_managed_and_unknown_fields(book, carbonara, changes):
    with pytest.raises(InvalidRequestError):
        book.update_recipe(carbonara.id, changes)


def test_create_requires_language_and_title(book):
    with pytest.raises(InvalidRequestError):
        book.create_recipe({"title": "No language"})
    with pytest.raises(InvalidRequestError, match="title"):
        book.create_recipe({"language": "en", "title": "  "})


def test_update_cannot_clear_the_title(book, carbonara):
    with pytest.raises(InvalidRequestError, match="title"):
        book.update_recipe(carbonara.id, {"title": ""})


def test_list_filters_by_language_and_title(book, carbonara):
    book.create_recipe({"language": "ja", "title": "親子丼"})
    assert [r.title for r in book.list_recipes(language="ja")] == ["親子丼"]
    assert [r.id for r in book.list_recipes(query="carbo")] == [carbonara.id]


@pytest.mark.parametrize(
    "line",
    [{"ingredient_id": "nope"}, {"ingredient_id": "guanciale", "unit_id": "nope"}, {"quantity": 1}, {"ingredient_id": None}],
)
def test_lines_must_reference_known_entries(book, guanciale, line):
    with pytest.raises(InvalidRequestError):
        book.create_recipe({"language": "en", "title": "x", "ingredients": [line]})


def test_update_checks_references_too(book, carbonara):
    with pytest.raises(InvalidRequestError):
        book.update_recipe(carbonara.id, {"ingredients": [{"ingredient_id": "nope"}]})


def test_save_draft_checks_all_catalog_changes_before_applying_any(book):
    from core import Draft, Ingredient, Localized, Recipe

    book.upsert_ingredient({"id": "egg", "localized": {"en": {"name": "egg"}}})
    draft = Draft(
        Recipe(language="en", title="x"),
        new_ingredients=[
            Ingredient("milk", {"en": Localized("milk")}),
            Ingredient("hen_egg", {"en": Localized("hen egg", aliases=["egg"])}),
        ],
    )
    with pytest.raises(InvalidRequestError):
        book.save_draft(draft)
    assert [i.id for i in book.list_ingredients()] == ["egg"]


def test_save_draft_rejects_the_recipe_before_touching_the_catalog(book, carbonara):
    from core import Draft, Ingredient, IngredientLine, Localized, Recipe

    milk = Ingredient("milk", {"en": Localized("milk")})
    lines = [IngredientLine("milk", 1, "cup_us")]
    bad = [
        Draft(Recipe(language="en", title=" ", ingredients=lines), new_ingredients=[milk]),
        Draft(Recipe(language="en", title="x", ingredients=[*lines, IngredientLine("nope")]), new_ingredients=[milk]),
        Draft(Recipe(language="en", title="x", ingredients=lines), new_ingredients=[milk], updates_id="gone"),
        Draft(Recipe(language="en", title="x"), new_ingredients=[milk], parent_id=carbonara.id, relation="translation"),
    ]
    for draft in bad:
        with pytest.raises(ItadakiError):
            book.save_draft(draft)
        assert [i.id for i in book.list_ingredients()] == ["guanciale"]

    recipe = book.save_draft(Draft(Recipe(language="en", title="x", ingredients=lines), new_ingredients=[milk]))
    assert recipe.ingredients[0].ingredient_id == "milk"


def test_deleting_a_recipe_discards_its_drafts(book, carbonara):
    from core import Draft, Recipe

    about = book.start_draft("adapt", "Carbonara", recipe_id=carbonara.id)
    updating = book.start_draft("translate", "x", Draft(Recipe("ja", "x"), updates_id=carbonara.id))
    under = book.start_draft("adapt", "x", Draft(Recipe("en", "x"), parent_id=carbonara.id, relation="variant"))
    other = book.start_draft("import", "Oyakodon")
    book.delete_recipe(carbonara.id)
    assert [e.id for e in book.list_drafts()] == [other.id]
    for gone in (about, updating, under):
        with pytest.raises(NotFoundError):
            book.get_draft(gone.id)


def test_language_is_a_lower_cased_code(book):
    assert book.create_recipe({"language": "EN", "title": "x"}).language == "en"
    with pytest.raises(InvalidRequestError):
        book.create_recipe({"language": "English", "title": "x"})
    with pytest.raises(InvalidRequestError):
        book.create_recipe({"language": None, "title": "x"})


def test_search_takes_wildcards_literally(book, carbonara):
    book.create_recipe({"language": "en", "title": "100% beef burger"})
    assert [r.title for r in book.list_recipes(query="%")] == ["100% beef burger"]
    assert book.list_recipes(query="_") == []
