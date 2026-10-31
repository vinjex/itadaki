"""Uploaded recipe photos. They live in the database and are served by the host at
IMAGE_PATH + id, so a recipe's image_url works the same inside and outside HA."""

from __future__ import annotations

import hashlib

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
        raise InvalidRequestError(f"image larger than {MAX_IMAGE_BYTES // (1024 * 1024)} MB")
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    for signature, mime in _SIGNATURES.items():
        if data.startswith(signature):
            return mime
    raise InvalidRequestError("not a JPEG, PNG, WebP or GIF image")


def content_id(data: bytes) -> str:
    """Named by content: the same photo uploaded twice is stored once."""
    return hashlib.sha256(data).hexdigest()[:32]


def stored_image_id(url: str | None) -> str | None:
    return url[len(IMAGE_PATH) :] if url and url.startswith(IMAGE_PATH) else None
