from __future__ import annotations

from dataclasses import asdict, dataclass, field, fields
from enum import StrEnum
from typing import Any


class Relation(StrEnum):
    TRANSLATION = "translation"
    VARIANT = "variant"


class Dimension(StrEnum):
    MASS = "mass"
    VOLUME = "volume"
    COUNT = "count"
    OTHER = "other"


class System(StrEnum):
    METRIC = "metric"
    US = "us"
    IMPERIAL = "imperial"
    JAPANESE = "japanese"


def _known(cls: type, data: dict[str, Any]) -> dict[str, Any]:
    names = {f.name for f in fields(cls)}
    return {k: v for k, v in data.items() if k in names}


@dataclass
class IngredientLine:
    # Always structured: display text is rendered from the catalog in the recipe's
    # language, so there is no free-text copy that could drift from these fields.
    ingredient_id: str
    quantity: float | None = None
    unit_id: str | None = None
    note: str | None = None
    section: str | None = None


@dataclass
class RawLine:
    """An ingredient line as written, before it is structured."""

    text: str
    section: str | None = None


@dataclass
class Step:
    text: str
    section: str | None = None


@dataclass
class Recipe:
    language: str
    title: str
    id: str = ""
    description: str = ""
    servings: float | None = None
    prep_minutes: int | None = None
    cook_minutes: int | None = None
    total_minutes: int | None = None
    ingredients: list[IngredientLine] = field(default_factory=list)
    steps: list[Step] = field(default_factory=list)
    notes: str = ""
    # Recipe tag ids. Shared by a translation group: stored on its original only.
    tags: list[str] = field(default_factory=list)
    image_url: str | None = None
    source_url: str | None = None
    parent_id: str | None = None
    relation: Relation | None = None
    parent_revision: int | None = None
    revision: int = 1
    created_at: str = ""
    updated_at: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Recipe:
        values = _known(cls, data)
        values["ingredients"] = [
            IngredientLine(**_known(IngredientLine, i)) for i in data.get("ingredients", [])
        ]
        values["steps"] = [Step(**_known(Step, s)) for s in data.get("steps", [])]
        if values.get("relation"):
            values["relation"] = Relation(values["relation"])
        return cls(**values)


@dataclass
class RecipeSummary:
    id: str
    language: str
    title: str
    parent_id: str | None
    relation: Relation | None
    updated_at: str
    image_url: str | None

    @classmethod
    def of(cls, recipe: Recipe) -> RecipeSummary:
        return cls(
            recipe.id,
            recipe.language,
            recipe.title,
            recipe.parent_id,
            recipe.relation,
            recipe.updated_at,
            recipe.image_url,
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class Localized:
    name: str
    plural: str | None = None
    aliases: list[str] = field(default_factory=list)


def _localized(data: dict[str, Any]) -> dict[str, Localized]:
    return {lang: Localized(**_known(Localized, entry)) for lang, entry in data.items()}


@dataclass
class Ingredient:
    id: str
    localized: dict[str, Localized] = field(default_factory=dict)
    # Grams per millilitre, which is what lets a cup of flour become grams.
    density: float | None = None
    # Ingredient tag ids.
    tags: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Ingredient:
        values = _known(cls, data)
        values["localized"] = _localized(data.get("localized", {}))
        return cls(**values)


class TagKind(StrEnum):
    RECIPE = "recipe"
    INGREDIENT = "ingredient"


@dataclass
class Tag:
    id: str
    localized: dict[str, Localized] = field(default_factory=dict)
    # Recipe and ingredient tags are separate lists: a word may name one of each.
    kind: TagKind = TagKind.RECIPE

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Tag:
        values = _known(cls, data)
        values["localized"] = _localized(data.get("localized", {}))
        values["kind"] = TagKind(values.get("kind", TagKind.RECIPE))
        return cls(**values)


@dataclass
class Unit:
    id: str
    localized: dict[str, Localized] = field(default_factory=dict)
    dimension: Dimension = Dimension.OTHER
    # Size in the dimension's base unit: grams for mass, millilitres for volume,
    # items for count. None means the unit cannot be converted (a pinch).
    factor: float | None = None
    # Empty means neutral (piece, pinch): it belongs to no measurement system.
    systems: list[System] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Unit:
        values = _known(cls, data)
        values["localized"] = _localized(data.get("localized", {}))
        values["dimension"] = Dimension(values.get("dimension", Dimension.OTHER))
        values["systems"] = [System(s) for s in values.get("systems", [])]
        return cls(**values)


AI_ACTIONS = ("extract", "structure", "translate", "adapt", "tag")
DEFAULT_INSTRUCTIONS = {
    "extract": "Keep only what the recipe needs. Leave out stories, tips, embellishments and anything else that is not part of the recipe.",
    "structure": "",
    "translate": "",
    "adapt": "",
    "tag": "",
}


@dataclass
class Settings:
    """Choices about the recipe library itself, stored with it so they move with it."""

    # Every ingredient and unit is named in these, and recipes translate into them.
    languages: list[str]
    # Sent with every run of that AI action, before the request's own note.
    instructions: dict[str, str] = field(default_factory=lambda: dict(DEFAULT_INSTRUCTIONS))

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Settings:
        values = _known(cls, data)
        values["instructions"] = {**DEFAULT_INSTRUCTIONS, **values.get("instructions", {})}
        return cls(**values)


@dataclass
class Usage:
    prompt_tokens: int = 0
    completion_tokens: int = 0

    def __add__(self, other: Usage) -> Usage:
        return Usage(
            self.prompt_tokens + other.prompt_tokens,
            self.completion_tokens + other.completion_tokens,
        )


class CatalogKind(StrEnum):
    INGREDIENT = "ingredient"
    UNIT = "unit"
    TAG = "tag"


@dataclass
class CatalogName:
    """A name for an existing catalog entry in a language it does not have yet."""

    kind: CatalogKind
    id: str
    language: str
    name: str
    plural: str | None = None


@dataclass
class Draft:
    """An unsaved AI result, plus the catalog changes it depends on. Where it lands:
    nothing set means a new original recipe, `parent_id` + `relation` a new child,
    `updates_id` a replacement of that recipe's content."""

    recipe: Recipe
    parent_id: str | None = None
    relation: Relation | None = None
    updates_id: str | None = None
    # Saving marks the translation as up to date with its parent.
    syncs_translation: bool = False
    new_ingredients: list[Ingredient] = field(default_factory=list)
    new_tags: list[Tag] = field(default_factory=list)
    # Words the source page tagged the recipe with that match no tag: offered in
    # review, never created by themselves.
    suggested_tags: list[str] = field(default_factory=list)
    added_names: list[CatalogName] = field(default_factory=list)
    # Source text -> translated text, reused by later re-translations.
    memory: dict[str, str] = field(default_factory=dict)
    usage: Usage = field(default_factory=Usage)
    # Ingredient lines still waiting to be structured; a draft with any cannot be saved.
    raw_lines: list[RawLine] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Draft:
        values = _known(cls, data)
        values["recipe"] = Recipe.from_dict(data["recipe"])
        if values.get("relation"):
            values["relation"] = Relation(values["relation"])
        values["new_ingredients"] = [Ingredient.from_dict(i) for i in data.get("new_ingredients", [])]
        values["new_tags"] = [Tag.from_dict(t) for t in data.get("new_tags", [])]
        values["added_names"] = [
            CatalogName(**{**_known(CatalogName, n), "kind": CatalogKind(n["kind"])})
            for n in data.get("added_names", [])
        ]
        values["usage"] = Usage(**_known(Usage, data.get("usage", {})))
        values["raw_lines"] = [RawLine(**_known(RawLine, r)) for r in data.get("raw_lines", [])]
        return cls(**values)


class DraftStatus(StrEnum):
    WORKING = "working"
    READY = "ready"
    FAILED = "failed"


@dataclass
class DraftEntry:
    """A draft in the inbox: AI work in progress, a result waiting for review, or a
    failure to show. Lives server-side so leaving the page loses nothing."""

    id: str
    status: DraftStatus
    action: str
    title: str
    updated_at: str
    error: str | None = None
    draft: Draft | None = None
    # The recipe the work started from, if any, and what was asked: shown with the
    # draft, and how a recipe page finds the work in progress on it.
    recipe_id: str | None = None
    request: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    def summary(self) -> dict[str, Any]:
        return {k: v for k, v in self.to_dict().items() if k != "draft"}
