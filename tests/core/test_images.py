from datetime import timedelta

import pytest

from core import InvalidRequestError, NotFoundError
import io

from PIL import Image

from core import images
from core.images import IMAGE_PATH, stored_image_id, thumbnail_url

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


def _picture(size, mode="RGB", fmt="PNG"):
    out = io.BytesIO()
    Image.new(mode, size, (200, 30, 30, 0) if mode == "RGBA" else (200, 30, 30)).save(out, fmt)
    return out.getvalue()


def _size(data):
    return Image.open(io.BytesIO(data)).size


def test_thumbnail_is_small_and_made_once(book, monkeypatch):
    url = book.add_image(_picture((2000, 1000)))
    mime, small = book.get_thumbnail(stored_image_id(url))
    assert (mime, _size(small)) == ("image/jpeg", (640, 320))
    monkeypatch.setattr("core.service.as_jpeg", lambda *a: pytest.fail("made again"))
    assert book.get_thumbnail(stored_image_id(url))[1] == small


def test_photo_no_larger_than_its_thumbnail_serves_itself(book):
    tiny = _picture((20, 20), fmt="GIF")
    url = book.add_image(tiny)
    assert book.get_thumbnail(stored_image_id(url)) == ("image/gif", tiny)


def test_unreadable_photo_serves_whole_as_thumbnail(book):
    url = book.add_image(PNG)
    assert book.get_thumbnail(stored_image_id(url)) == ("image/png", PNG)


def test_thumbnail_only_for_stored_photos():
    assert thumbnail_url(IMAGE_PATH + "abc") == IMAGE_PATH + "abc?size=thumbnail"
    assert thumbnail_url("https://example.com/a.jpg") is None
    assert thumbnail_url(None) is None


def test_transparency_becomes_white():
    flat = Image.open(io.BytesIO(images.as_jpeg(_picture((10, 10), "RGBA"), 1600)))
    assert flat.getpixel((5, 5)) > (245, 245, 245)


def test_linked_photo_is_downloaded_shrunk_and_stored(book, monkeypatch):
    from core import Draft, Recipe

    monkeypatch.setattr("core.service.download", lambda url: _picture((3200, 1600), fmt="WEBP"))
    draft = book.keep_photo(Draft(Recipe("en", "x", image_url="https://example.com/a.webp")))
    mime, data = book.get_image(stored_image_id(draft.recipe.image_url))
    assert (mime, _size(data)) == ("image/jpeg", (1600, 800))


def test_unreachable_photo_keeps_its_link(book, monkeypatch):
    from core import Draft, Recipe

    def fail(url):
        raise InvalidRequestError("down")

    monkeypatch.setattr("core.service.download", fail)
    draft = Draft(Recipe("en", "x", image_url="https://example.com/a.jpg"))
    assert book.keep_photo(draft) == draft


def test_download_refuses_other_schemes():
    with pytest.raises(InvalidRequestError):
        images.download("file:///etc/passwd")
