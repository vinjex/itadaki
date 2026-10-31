import itertools

import pytest

from core import RecipeBook, Store


@pytest.fixture
def book(tmp_path):
    ids = (f"id{n}" for n in itertools.count(1))
    ticks = (f"2026-01-01T00:00:{n:02d}+00:00" for n in itertools.count())
    return RecipeBook(Store(tmp_path / "itadaki.db"), ("en", "ja"), now=lambda: next(ticks), new_id=lambda: next(ids))


@pytest.fixture
def guanciale(book):
    return book.upsert_ingredient(
        {"id": "guanciale", "localized": {"en": {"name": "guanciale"}, "ja": {"name": "グアンチャーレ"}}}
    )


@pytest.fixture
def carbonara(book, guanciale):
    return book.create_recipe(
        {
            "language": "en",
            "title": "Carbonara",
            "ingredients": [{"ingredient_id": guanciale.id, "quantity": 200, "unit_id": "g"}],
            "steps": [{"text": "Cook the pasta."}],
        }
    )
