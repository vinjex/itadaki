from core.shopping import item_text


def _ingredient(book, entry_id, en, ja, it, en_plural=None):
    book.upsert_ingredient({"id": entry_id, "localized": {
        "en": {"name": en, "plural": en_plural}, "ja": {"name": ja}, "it": {"name": it},
    }})


def test_items_are_named_in_the_library_languages_summed_and_rounded_up(book):
    _ingredient(book, "potato", "potato", "じゃがいも", "patata", "potatoes")
    _ingredient(book, "butter", "butter", "バター", "burro")
    recipe = book.create_recipe({
        "language": "it", "title": "Gnocchi",
        "ingredients": [
            {"ingredient_id": "potato", "quantity": 1.2},
            {"ingredient_id": "butter", "quantity": 30, "unit_id": "g", "section": "impasto"},
            {"ingredient_id": "butter", "quantity": 20, "unit_id": "g", "section": "salsa"},
            {"ingredient_id": "butter", "quantity": 1, "unit_id": "tbsp"},
        ],
    })

    items = book.shopping_items(recipe.id, factor=2)

    assert [(i.name, i.quantity, i.lines) for i in items] == [
        ("potatoes / じゃがいも", "3", [0]),
        ("butter / バター", "100 g", [1, 2]),
        ("butter / バター", "2 tbsp", [3]),
    ]


def test_lines_without_amounts_stay_without_one(book, guanciale):
    recipe = book.create_recipe({"language": "en", "title": "Pasta", "ingredients": [{"ingredient_id": guanciale.id}]})
    [item] = book.shopping_items(recipe.id)
    assert (item.name, item.quantity) == ("guanciale / グアンチャーレ", "")


def test_item_text():
    assert item_text(" egg ", "3") == "egg (3)"
    assert item_text("salt", "") == "salt"
