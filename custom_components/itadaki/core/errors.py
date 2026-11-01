class ItadakiError(Exception):
    """Base for every error the core raises on purpose; adapters map these to
    user-facing errors and let anything else surface as a bug."""


class NotFoundError(ItadakiError, LookupError):
    pass


class InvalidRequestError(ItadakiError, ValueError):
    pass


class InUseError(ItadakiError):
    pass


class NoRecipeDataError(InvalidRequestError):
    """The page embeds no recipe data, so only the AI can import it."""


class TreeError(ItadakiError, ValueError):
    pass


class ConversionError(ItadakiError, ValueError):
    pass
