import pytest

from core import InvalidRequestError, RecipeBook, Store


def test_initial_languages_are_stored_once(tmp_path):
    book = RecipeBook(Store(tmp_path / "itadaki.db"), [" JA", "en", "ja"])
    assert book.get_settings().languages == ["ja", "en"]
    book.update_settings({"languages": ["en"]})
    reopened = RecipeBook(Store(tmp_path / "itadaki.db"), ["fr"])
    assert reopened.get_settings().languages == ["en"]


@pytest.mark.parametrize("languages", [[], ["english"], ["en", "x"]])
def test_languages_must_be_codes(book, languages):
    with pytest.raises(InvalidRequestError):
        book.update_settings({"languages": languages})


def test_unknown_settings_are_rejected(book):
    with pytest.raises(InvalidRequestError):
        book.update_settings({"theme": "dark"})

