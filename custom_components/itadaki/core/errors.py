class ItadakiError(Exception):
    """Base for every error the core raises on purpose; adapters map these to
    user-facing errors and let anything else surface as a bug.

    `key` names a refusal a person can cause, with `params` filling its text, so a
    UI can show it in its own language; the message stays the English fallback."""

    key: str | None = None

    def __init__(self, message: str, key: str | None = None, **params: object) -> None:
        super().__init__(message)
        if key:
            self.key = key
        self.params = {name: str(value) for name, value in params.items()}


class NotFoundError(ItadakiError, LookupError):
    pass


class InvalidRequestError(ItadakiError, ValueError):
    pass


class InUseError(ItadakiError):
    pass


class NoRecipeDataError(InvalidRequestError):
    """The page embeds no recipe data, so only the AI can import it."""

    key = "no_recipe_data"


class TreeError(ItadakiError, ValueError):
    pass


class ConversionError(ItadakiError, ValueError):
    pass
