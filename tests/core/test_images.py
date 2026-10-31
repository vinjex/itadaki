from datetime import timedelta

import pytest

from core import InvalidRequestError, NotFoundError
from core.images import IMAGE_PATH, stored_image_id

PNG = b"\x89PNG\r\n\x1a\n" + b"pixels"
JPEG = b"\xff\xd8\xff\xe0" + b"pixels"


def test_upload_returns_a_url_serving_the_same_bytes(book):
    url = book.add_image(PNG)
    assert url.startswith(IMAGE_PATH)
    assert book.get_image(stored_image_id(url)) == ("image/png", PNG)


def test_same_photo_is_stored_once(book):
    assert book.add_image(JPEG) == book.add_image(JPEG)


@pytest.mark.parametrize("data", [b"<html><script>", b"", b"GIF8"])
def test_only_pictures_are_accepted(book, data):
    with pytest.raises(InvalidRequestError):
        book.add_image(data)


def test_unknown_image(book):
    with pytest.raises(NotFoundError):
        book.get_image("nope")


def test_prune_keeps_shown_and_recent_photos(book, carbonara):
    shown = book.add_image(PNG)
    orphan = book.add_image(JPEG)
    book.update_recipe(carbonara.id, {"image_url": shown})

    book.prune_images(grace=timedelta(days=1))
    assert book.get_image(stored_image_id(orphan))

    book.prune_images(grace=timedelta(0))
    assert book.get_image(stored_image_id(shown))
    with pytest.raises(NotFoundError):
        book.get_image(stored_image_id(orphan))


def test_prune_keeps_photos_of_unsaved_drafts(book):
    from core import Draft, Recipe

    kept = book.add_image(PNG)
    book.start_draft("import", "x", Draft(Recipe("en", "x", image_url=kept)))
    book.prune_images(grace=timedelta(0))
    assert book.get_image(stored_image_id(kept))
