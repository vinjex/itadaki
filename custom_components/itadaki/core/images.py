"""Recipe photos, uploaded or downloaded. They live in the database and are served by the host at
IMAGE_PATH + id, so a recipe's image_url works the same inside and outside HA."""

from __future__ import annotations

import hashlib
import io
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from PIL import Image, ImageOps

from .errors import InvalidRequestError

IMAGE_PATH = "/api/itadaki/images/"
MAX_IMAGE_BYTES = 8 * 1024 * 1024

# The type is read from the bytes, never taken from the uploader, so nothing but a
# picture is ever served back.
_SIGNATURES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"GIF87a": "image/gif",
    b"GIF89a": "image/gif",
}


def image_type(data: bytes) -> str:
    if len(data) > MAX_IMAGE_BYTES:
        mb = MAX_IMAGE_BYTES // (1024 * 1024)
        raise InvalidRequestError(f"image larger than {mb} MB", key="image_too_large", mb=mb)
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    for signature, mime in _SIGNATURES.items():
        if data.startswith(signature):
            return mime
    raise InvalidRequestError("not a JPEG, PNG, WebP or GIF image", key="image_type")


def content_id(data: bytes) -> str:
    """Named by content: the same photo uploaded twice is stored once."""
    return hashlib.sha256(data).hexdigest()[:32]


def stored_image_id(url: str | None) -> str | None:
    return url[len(IMAGE_PATH) :] if url and url.startswith(IMAGE_PATH) else None


# Downloaded photos get the same treatment the panel gives uploads: at most this many
# pixels on the long side, re-encoded as JPEG.
MAX_SIDE = 1600
# Cards are about 300 px wide; twice that stays sharp on high-density screens.
THUMBNAIL_SIDE = 640
_FORMATS = ("JPEG", "PNG", "WEBP", "GIF")
_DOWNLOAD_TIMEOUT = 20


def thumbnail_url(url: str | None) -> str | None:
    """Where a small version of a stored photo is served; None for a linked one."""
    return f"{url}?size=thumbnail" if stored_image_id(url) else None


def as_jpeg(data: bytes, max_side: int) -> bytes:
    """The picture turned upright, fitted within max_side, transparency on white."""
    try:
        with Image.open(io.BytesIO(data), formats=_FORMATS) as image:
            image = ImageOps.exif_transpose(image).convert("RGBA")
            image.thumbnail((max_side, max_side))
            flat = Image.new("RGB", image.size, "white")
            flat.paste(image, mask=image.getchannel("A"))
    except (OSError, ValueError, Image.DecompressionBombError) as err:
        raise InvalidRequestError(f"unreadable image: {err}", key="image_type") from err
    out = io.BytesIO()
    flat.save(out, "JPEG", quality=85, optimize=True)
    return out.getvalue()


def download(url: str) -> bytes:
    """The photo at url, refused when it is not a picture or too large to keep."""
    if urlparse(url).scheme not in ("http", "https"):
        raise InvalidRequestError(f"not a web address: {url}")
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; recipe app)", "Accept": "image/*"})
    try:
        with urlopen(request, timeout=_DOWNLOAD_TIMEOUT) as response:
            data = response.read(MAX_IMAGE_BYTES + 1)
    except (OSError, ValueError) as err:
        raise InvalidRequestError(f"could not download {url}: {err}", key="fetch_failed") from err
    image_type(data)
    return data
