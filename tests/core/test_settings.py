import pytest

from core import InvalidRequestError, RecipeBook, Settings, Store
from core.models import DEFAULT_INSTRUCTIONS


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



def test_instructions_start_from_defaults_and_change_per_action(book):
    assert book.get_settings().instructions["extract"]
    book.update_settings({"instructions": {"translate": "  Keep it casual. "}})
    instructions = book.get_settings().instructions
    assert instructions["translate"] == "Keep it casual."
    assert instructions["extract"] == DEFAULT_INSTRUCTIONS["extract"]


def test_instructions_for_unknown_actions_are_rejected(book):
    with pytest.raises(InvalidRequestError):
        book.update_settings({"instructions": {"summarize": "x"}})


def test_settings_stored_before_instructions_get_the_defaults():
    assert Settings.from_dict({"languages": ["en"]}).instructions == DEFAULT_INSTRUCTIONS
