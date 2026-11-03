from __future__ import annotations

import uuid
from collections.abc import Callable, Sequence
from dataclasses import fields, replace
from datetime import UTC, datetime, timedelta
from typing import Any, TypeVar

from .catalog import absorb_names, ensure_unique_terms, merge_localized, slug, unique_id
from .errors import InUseError, InvalidRequestError, NotFoundError
from .images import IMAGE_PATH, content_id, image_type, stored_image_id
from .languages import clean_languages, language_code
from .models import (
    AI_ACTIONS,
    CatalogKind,
    Draft,
    DraftEntry,
    DraftStatus,
    Ingredient,
    IngredientLine,
    Localized,
    Recipe,
    RecipeSummary,
    Relation,
    Settings,
    Tag,
    TagKind,
    Unit,
)
from .storage import Store
from .render import LineParts, line_parts, render_line
from .tags import matches, recipe_tag_set, retagged
from .tree import anchor_of, is_stale, pick_per_group, translation_group, validate_child
from .units import DEFAULT_UNITS, scale_lines

# Set by the service, never by callers: identity, tree position and bookkeeping.
_MANAGED_FIELDS = frozenset(
    {"id", "parent_id", "relation", "parent_revision", "revision", "created_at", "updated_at"}
)
_RECIPE_FIELDS = frozenset(f.name for f in fields(Recipe))


def _now() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def _new_id() -> str:
    return uuid.uuid4().hex


def _parse_recipe(data: dict[str, Any]) -> Recipe:
    try:
        recipe = Recipe.from_dict(data)
        recipe = replace(recipe, language=language_code(recipe.language))
    except (TypeError, ValueError, AttributeError) as err:
        raise InvalidRequestError(f"invalid recipe: {err}") from err
    if not recipe.title.strip():
        raise InvalidRequestError("a recipe needs a title", key="title_required")
    return replace(recipe, tags=list(dict.fromkeys(recipe.tags)))


def _content(recipe: Recipe) -> Recipe:
    """What a translation is made from: everything but the shared tags."""
    return replace(recipe, tags=[])


CatalogEntry = TypeVar("CatalogEntry", Ingredient, Unit, Tag)


class RecipeBook:
    """Every operation the app supports. Adapters (Home Assistant now, a standalone
    server later) only translate requests into these calls."""

    def __init__(
        self,
        store: Store,
        initial_languages: Sequence[str] = ("en",),
        now: Callable[[], str] = _now,
        new_id: Callable[[], str] = _new_id,
    ) -> None:
        self._store = store
        self._now = now
        self._new_id = new_id
        if store.created:
            for unit in DEFAULT_UNITS:
                store.put_unit(unit)
        if store.get_settings() is None:
            store.put_settings(Settings(clean_languages(initial_languages)))

    # Recipes

    def get_recipe(self, recipe_id: str) -> Recipe:
        """The recipe with its translation group's tags."""
        recipe = self._store.get_recipe(recipe_id)
        if recipe is None:
            raise NotFoundError(f"recipe {recipe_id} not found", key="recipe_not_found")
        if recipe.relation is Relation.TRANSLATION:
            recipe = replace(recipe, tags=anchor_of(recipe, self._store.get_recipe).tags)
        return recipe

    def list_recipes(
        self,
        language: str | None = None,
        query: str | None = None,
        prefer_language: str | None = None,
        tags: Sequence[str] = (),
        exclude_tags: Sequence[str] = (),
    ) -> list[RecipeSummary]:
        """With prefer_language, each dish appears once: the version in that language
        when one exists, else the original of its translation group. Tags filter by
        recipe tags and by the tags of the ingredients a recipe uses: every one of
        `tags` must be present, none of `exclude_tags`."""
        recipes = self._store.list_recipes(language, query)
        if prefer_language or tags or exclude_tags:
            everything = {r.id: r for r in self._store.list_recipes()}
        if tags or exclude_tags:
            ingredient_tags = {i.id: i.tags for i in self._store.list_ingredients()}
            recipes = [
                r
                for r in recipes
                if matches(
                    recipe_tag_set(anchor_of(r, everything.get).tags, r.ingredients, ingredient_tags),
                    tags,
                    exclude_tags,
                )
            ]
        if prefer_language:
            recipes = pick_per_group(recipes, everything, prefer_language)
        return [RecipeSummary.of(r) for r in recipes]

    def rendered_lines(
        self, lines: list[IngredientLine], language: str, extra_ingredients: list[Ingredient] = ()
    ) -> list[str]:
        """Display text per line; extra_ingredients covers a draft's not-yet-saved ones."""
        return self._per_line(render_line, lines, language, extra_ingredients)

    def split_lines(
        self, lines: list[IngredientLine], language: str, extra_ingredients: list[Ingredient] = ()
    ) -> list[LineParts]:
        return self._per_line(line_parts, lines, language, extra_ingredients)

    def _per_line(self, render, lines, language, extra_ingredients):
        ingredients = {i.id: i for i in [*self._store.list_ingredients(), *extra_ingredients]}
        units = {u.id: u for u in self._store.list_units()}
        return [render(line, language, ingredients, units) for line in lines]

    def scaled(self, recipe: Recipe, servings: float) -> Recipe:
        if not recipe.servings:
            raise InvalidRequestError("this recipe has no servings to scale from")
        factor = servings / recipe.servings
        return replace(recipe, servings=servings, ingredients=scale_lines(recipe.ingredients, factor))

    def create_recipe(
        self,
        data: dict[str, Any],
        parent_id: str | None = None,
        relation: Relation | str | None = None,
    ) -> Recipe:
        self._reject_managed(data)
        draft = _parse_recipe(data)
        timestamp = self._now()
        tree = self._tree_position(parent_id, relation, draft.language)
        self._ensure_references(draft)
        recipe = replace(
            draft, id=self._new_id(), revision=1, created_at=timestamp, updated_at=timestamp, **tree
        )
        self._put_recipe(recipe)
        # A new translation joins its group's tags; it changes them only when asked to.
        if recipe.relation is Relation.TRANSLATION and "tags" in data:
            self._set_group_tags(recipe, recipe.tags)
        return self.get_recipe(recipe.id)

    def _tree_position(
        self, parent_id: str | None, relation: Relation | str | None, language: str
    ) -> dict[str, Any]:
        """The tree fields of a new recipe under `parent_id`, after checking the parent
        exists and the relation is allowed; empty for an original."""
        if (parent_id is None) != (relation is None):
            raise InvalidRequestError("parent_id and relation must be given together")
        if parent_id is None:
            return {}
        parent = self.get_recipe(parent_id)
        try:
            relation = Relation(relation)
        except ValueError as err:
            raise InvalidRequestError(f"unknown relation: {relation}") from err
        validate_child(parent, relation, language)
        return {
            "parent_id": parent.id,
            "relation": relation,
            "parent_revision": parent.revision if relation is Relation.TRANSLATION else None,
        }

    def update_recipe(self, recipe_id: str, changes: dict[str, Any]) -> Recipe:
        """Applies a partial update: only the given fields change, lists are replaced
        whole. A content change bumps the revision, which makes translations stale.
        Tags are the translation group's: changing them on any member changes them for
        all, and never makes a translation stale, since there is nothing to translate."""
        self._reject_managed(changes)
        unknown = changes.keys() - _RECIPE_FIELDS
        if unknown:
            raise InvalidRequestError(f"unknown fields: {', '.join(sorted(unknown))}")
        current = self.get_recipe(recipe_id)
        merged = _parse_recipe({**current.to_dict(), **changes})
        if current.parent_id and "language" in changes:
            validate_child(self.get_recipe(current.parent_id), current.relation, merged.language)
        if changes.keys() & {"ingredients", "tags"}:
            self._ensure_references(merged)
        if _content(merged) != _content(current):
            self._put_recipe(replace(merged, revision=current.revision + 1, updated_at=self._now()))
        if "tags" in changes:
            self._set_group_tags(self._store.get_recipe(recipe_id), merged.tags)
        return self.get_recipe(recipe_id)

    def mark_translation_synced(self, recipe_id: str) -> Recipe:
        recipe = self.get_recipe(recipe_id)
        if recipe.relation is not Relation.TRANSLATION:
            raise InvalidRequestError("only translations can be synced")
        parent = self.get_recipe(recipe.parent_id)
        synced = replace(recipe, parent_revision=parent.revision, updated_at=self._now())
        self._put_recipe(synced)
        return synced

    def delete_recipe(self, recipe_id: str, cascade: bool = False) -> list[str]:
        """Deletes a recipe, and with cascade its whole subtree. Returns deleted ids."""
        self.get_recipe(recipe_id)
        subtree = self._subtree_leaves_first(recipe_id)
        if len(subtree) > 1 and not cascade:
            raise InUseError(
                f"recipe {recipe_id} has {len(subtree) - 1} translations or variants; "
                "delete with cascade to remove them too",
                key="in_use",
            )
        # Drafts about these recipes could never be saved any more.
        gone = set(subtree)
        orphaned = [
            e.id
            for e in self._store.full_drafts()
            if e.recipe_id in gone or (e.draft and {e.draft.updates_id, e.draft.parent_id} & gone)
        ]
        self._store.delete_recipes(subtree)
        self._store.delete_drafts(orphaned)
        return subtree

    def children(self, recipe_id: str) -> list[Recipe]:
        return self._store.children(recipe_id)

    def related(self, recipe_id: str) -> dict[str, Any]:
        recipe = self.get_recipe(recipe_id)
        parent = self._store.get_recipe(recipe.parent_id) if recipe.parent_id else None
        group = translation_group(recipe, self._store.get_recipe, self._store.children)
        return {
            "parent": RecipeSummary.of(parent).to_dict() if parent else None,
            "stale": is_stale(recipe, parent),
            "translations": [RecipeSummary.of(r).to_dict() for r in group if r.id != recipe.id],
            "variants": [
                RecipeSummary.of(r).to_dict()
                for r in self._store.children(recipe.id)
                if r.relation is Relation.VARIANT
            ],
        }

    def translation_memory(self, recipe_id: str) -> dict[str, str]:
        return self._store.get_memory(recipe_id)

    def save_draft(self, draft: Draft) -> Recipe:
        """The one way AI results are saved, whether reviewed in the panel first or
        saved directly: catalog changes first, then the recipe that references them."""
        if draft.raw_lines:
            raise InvalidRequestError("the ingredient lines are not structured yet", key="lines_unmatched")
        draft = self._renumber_new_tags(draft)
        content = {k: v for k, v in draft.recipe.to_dict().items() if k not in _MANAGED_FIELDS}
        # Everything is checked before anything is written, so a rejected recipe
        # cannot leave its new ingredients behind in the catalog.
        self._preflight_catalog(draft)
        self._preflight_recipe(draft, _parse_recipe(content))
        for tag in draft.new_tags:
            self.upsert_tag(tag.to_dict())
        for ingredient in draft.new_ingredients:
            self.upsert_ingredient(ingredient.to_dict())
        upserts = {CatalogKind.INGREDIENT: self.upsert_ingredient, CatalogKind.UNIT: self.upsert_unit, CatalogKind.TAG: self.upsert_tag}
        for added in draft.added_names:
            upserts[added.kind]({"id": added.id, "localized": {added.language: {"name": added.name, "plural": added.plural}}})

        if draft.updates_id:
            recipe = self.update_recipe(draft.updates_id, content)
        else:
            recipe = self.create_recipe(content, draft.parent_id, draft.relation)
        if draft.syncs_translation:
            recipe = self.mark_translation_synced(recipe.id)
            self._store.put_memory(recipe.id, draft.memory)
        return recipe

    # Drafts inbox: the life cycle of AI work, independent of who runs it.

    def start_draft(
        self,
        action: str,
        title: str,
        draft: Draft | None = None,
        recipe_id: str | None = None,
        request: dict[str, Any] | None = None,
    ) -> DraftEntry:
        entry = DraftEntry(
            self._new_id(), DraftStatus.WORKING, action, title, self._now(),
            draft=draft, recipe_id=recipe_id, request=request or {},
        )
        self._store.put_draft(entry)
        return entry

    def rework_draft(self, draft_id: str, request: dict[str, Any], edited: Draft | None = None) -> DraftEntry:
        """Sends a ready draft, optionally as edited in review, back to work."""
        entry = self.get_draft(draft_id)
        if entry.status is not DraftStatus.READY:
            raise InvalidRequestError(f"draft {draft_id} is {entry.status}, not ready")
        entry = replace(
            entry,
            status=DraftStatus.WORKING,
            draft=edited or entry.draft,
            error=None,
            request={**entry.request, **request},
            updated_at=self._now(),
        )
        self._store.put_draft(entry)
        return entry

    def finish_draft(self, draft_id: str, draft: Draft) -> DraftEntry:
        entry = replace(
            self.get_draft(draft_id),
            status=DraftStatus.READY,
            error=None,
            title=draft.recipe.title,
            draft=draft,
            updated_at=self._now(),
        )
        self._store.put_draft(entry)
        return entry

    def fail_draft(self, draft_id: str, error: str) -> DraftEntry:
        """A draft that has something to show stays reviewable, with the error on it:
        lines left unstructured are finished by hand, as without AI."""
        entry = self.get_draft(draft_id)
        status = DraftStatus.READY if entry.draft else DraftStatus.FAILED
        entry = replace(entry, status=status, error=error, updated_at=self._now())
        self._store.put_draft(entry)
        return entry

    # Images

    def add_image(self, data: bytes) -> str:
        """Stores an uploaded photo and returns the image_url to put on a recipe."""
        mime = image_type(data)
        new_id = content_id(data)
        self._store.put_image(new_id, mime, data, self._now())
        return IMAGE_PATH + new_id

    def get_image(self, image_id: str) -> tuple[str, bytes]:
        """The image's type and bytes."""
        image = self._store.get_image(image_id)
        if image is None:
            raise NotFoundError(f"image {image_id} not found")
        return image

    def prune_images(self, grace: timedelta = timedelta(days=1)) -> None:
        """Deletes photos no recipe shows any more. Recent ones are kept: they may
        belong to an edit or a review that has not been saved yet."""
        cutoff = (datetime.fromisoformat(self._now()) - grace).isoformat(timespec="seconds")
        shown = [r.image_url for r in self._store.list_recipes()]
        shown += [e.draft.recipe.image_url for e in self._store.full_drafts() if e.draft]
        self._store.delete_images_except({stored_image_id(url) for url in shown}, cutoff)

    def fail_interrupted_drafts(self) -> None:
        """Work that was running when the host stopped will never finish."""
        for entry in self._store.full_drafts():
            if entry.status is DraftStatus.WORKING:
                self.fail_draft(entry.id, "interrupted by a restart")

    def get_draft(self, draft_id: str) -> DraftEntry:
        entry = self._store.get_draft(draft_id)
        if entry is None:
            raise NotFoundError(f"draft {draft_id} not found", key="draft_not_found")
        return entry

    def list_drafts(self, recipe_id: str | None = None) -> list[DraftEntry]:
        return self._store.list_drafts(recipe_id)

    def discard_draft(self, draft_id: str) -> None:
        self.get_draft(draft_id)
        self._store.delete_drafts([draft_id])

    def save_inbox_draft(self, draft_id: str, edited: Draft | None = None) -> Recipe:
        """Saves a ready draft, optionally as edited in review, and clears it from the inbox."""
        entry = self.get_draft(draft_id)
        if entry.status is not DraftStatus.READY:
            raise InvalidRequestError(f"draft {draft_id} is {entry.status}, not ready")
        recipe = self.save_draft(edited or entry.draft)
        self._store.delete_drafts([draft_id])
        return recipe

    # Settings

    def get_settings(self) -> Settings:
        return self._store.get_settings()

    def update_settings(self, changes: dict[str, Any]) -> Settings:
        """Changes only the given fields. Dropping a language keeps the names already
        written in it."""
        unknown = changes.keys() - {f.name for f in fields(Settings)}
        if unknown:
            raise InvalidRequestError(f"unknown fields: {', '.join(sorted(unknown))}")
        settings = self.get_settings()
        if "languages" in changes:
            settings = replace(settings, languages=clean_languages(changes["languages"]))
        if "instructions" in changes:
            given = changes["instructions"]
            if unknown := given.keys() - set(AI_ACTIONS):
                raise InvalidRequestError(f"unknown AI actions: {', '.join(sorted(unknown))}")
            cleaned = {action: str(text or "").strip() for action, text in given.items()}
            settings = replace(settings, instructions={**settings.instructions, **cleaned})
        self._store.put_settings(settings)
        return settings

    # Catalogs

    def list_ingredients(self) -> list[Ingredient]:
        return self._store.list_ingredients()

    def upsert_ingredient(self, data: dict[str, Any]) -> Ingredient:
        """Creates or partially updates an ingredient; `localized` merges per language."""
        if "tags" in data:
            data = {**data, "tags": self._known_tags(data["tags"], TagKind.INGREDIENT)}
        return self._upsert_entry(
            Ingredient, data, self._store.get_ingredient, lambda _: self._store.list_ingredients(),
            self._store.put_ingredient,
        )

    def delete_ingredient(self, ingredient_id: str) -> None:
        self._ensure_unused("ingredient_id", ingredient_id)
        self._store.delete_ingredient(ingredient_id)

    def list_units(self) -> list[Unit]:
        return self._store.list_units()

    def upsert_unit(self, data: dict[str, Any]) -> Unit:
        """Creates or partially updates a unit; `localized` merges per language."""
        return self._upsert_entry(
            Unit, data, self._store.get_unit, lambda _: self._store.list_units(), self._store.put_unit
        )

    def delete_unit(self, unit_id: str) -> None:
        self._ensure_unused("unit_id", unit_id)
        self._store.delete_unit(unit_id)

    def merge_ingredient(self, source_id: str, target_id: str) -> Ingredient:
        """Folds a duplicate into another ingredient; see _merge_entry."""
        return self._merge_entry(
            CatalogKind.INGREDIENT, source_id, target_id, self._store.get_ingredient,
            self._store.put_ingredient, self._store.delete_ingredient,
        )

    def merge_unit(self, source_id: str, target_id: str) -> Unit:
        """Folds a duplicate into another unit; see _merge_entry."""
        return self._merge_entry(
            CatalogKind.UNIT, source_id, target_id, self._store.get_unit,
            self._store.put_unit, self._store.delete_unit,
        )

    def catalog_usage(self) -> dict[str, dict[str, list[dict[str, Any]]]]:
        """Per catalog, entry id -> summaries of the recipes using it (for ingredient
        tags: the ingredients, as id and names). Unused entries are absent. A recipe
        tag counts once per translation group, on its original."""
        recipe_tags: dict[str, list[dict[str, Any]]] = {}
        for recipe in self._store.list_recipes():
            for tag_id in recipe.tags:
                recipe_tags.setdefault(tag_id, []).append(RecipeSummary.of(recipe).to_dict())
        ingredient_tags: dict[str, list[dict[str, Any]]] = {}
        for ingredient in self._store.list_ingredients():
            for tag_id in ingredient.tags:
                ingredient_tags.setdefault(tag_id, []).append({"id": ingredient.id, "localized": ingredient.to_dict()["localized"]})
        return {
            "ingredients": self._users("ingredient_id"),
            "units": self._users("unit_id"),
            "recipe_tags": recipe_tags,
            "ingredient_tags": ingredient_tags,
        }

    def list_tags(self, kind: TagKind | str | None = None) -> list[Tag]:
        tags = self._store.list_tags()
        return [t for t in tags if t.kind == kind] if kind else tags

    def upsert_tag(self, data: dict[str, Any]) -> Tag:
        """Creates or partially updates a tag; `localized` merges per language. A word
        may mean only one tag of each kind per language. The kind is fixed once created."""
        current = self._store.get_tag(data["id"]) if data.get("id") else None
        if current and "kind" in data and data["kind"] != current.kind:
            raise InvalidRequestError("a tag's kind cannot change")
        if not data.get("id"):
            data = {**data, "id": self._new_tag_id(data.get("localized") or {})}
        return self._upsert_entry(
            Tag, data, self._store.get_tag,
            lambda tag: [t for t in self._store.list_tags() if t.kind is tag.kind], self._store.put_tag,
        )

    def _new_tag_id(self, localized: dict[str, Any], taken: set[str] | None = None) -> str:
        """Readable, from the English name when there is one. Recipe and ingredient
        tags share one id space, so it is checked against both."""
        names = [n.get("name", "") for n in [localized.get("en"), *localized.values()] if isinstance(n, dict)]
        taken = taken if taken is not None else {t.id for t in self._store.list_tags()}
        return unique_id(next((slug(n) for n in names if slug(n)), "tag"), taken)

    def delete_tag(self, tag_id: str) -> None:
        """Deletes a tag and takes it off every recipe, ingredient and draft."""
        self._get_tag(tag_id)
        self._retag(tag_id, None)
        self._store.delete_tag(tag_id)

    def merge_tag(self, source_id: str, target_id: str) -> Tag:
        """Everything tagged with the source gets the target instead, the source's words
        become the target's aliases, and the source is deleted."""
        if source_id == target_id:
            raise InvalidRequestError("cannot merge an entry into itself")
        source, target = self._get_tag(source_id), self._get_tag(target_id)
        if source.kind is not target.kind:
            raise InvalidRequestError("recipe tags and ingredient tags cannot be merged")
        self._retag(source_id, target_id)
        merged = replace(target, localized=absorb_names(target.localized, source.localized))
        self._store.put_tag(merged)
        self._store.delete_tag(source_id)
        return merged

    # Internals

    def _put_recipe(self, recipe: Recipe) -> None:
        """A translation's tags live on its group's original, never on itself."""
        self._store.put_recipe(_content(recipe) if recipe.relation is Relation.TRANSLATION else recipe)

    def _set_group_tags(self, recipe: Recipe, tags: list[str]) -> None:
        """Written straight to the group's original: its revision stays, so its
        translations do not go stale."""
        anchor = anchor_of(recipe, self._store.get_recipe)
        if anchor.tags != tags:
            self._store.put_recipe(replace(anchor, tags=tags))

    def _renumber_new_tags(self, draft: Draft) -> Draft:
        """A draft's new tags got their ids where the draft was made, which may not see
        every existing tag; one whose id is taken gets a fresh one, so saving it can
        never overwrite another tag."""
        taken = {t.id for t in self._store.list_tags()}
        renamed: dict[str, str] = {}
        tags = []
        for tag in draft.new_tags:
            if tag.id in taken:
                renamed[tag.id] = self._new_tag_id(tag.to_dict()["localized"], taken)
                tag = replace(tag, id=renamed[tag.id])
            taken.add(tag.id)
            tags.append(tag)
        if not renamed:
            return draft
        recipe = replace(draft.recipe, tags=[renamed.get(t, t) for t in draft.recipe.tags])
        return replace(draft, recipe=recipe, new_tags=tags)

    def _get_tag(self, tag_id: str) -> Tag:
        tag = self._store.get_tag(tag_id)
        if tag is None:
            raise NotFoundError(f"tag {tag_id} not found")
        return tag

    def _known_tags(self, tag_ids: Any, kind: TagKind, pending: Sequence[Tag] = ()) -> list[str]:
        """The ids without repeats, after checking each is a tag of `kind`."""
        if not isinstance(tag_ids, list):
            raise InvalidRequestError("tags must be a list of tag ids")
        kinds = {t.id: t.kind for t in [*self._store.list_tags(), *pending]}
        wrong = sorted({t for t in tag_ids if kinds.get(t) is not kind})
        if wrong:
            raise InvalidRequestError(f"unknown {kind} tags: {', '.join(wrong)}", key="entries_missing")
        return list(dict.fromkeys(tag_ids))

    def _retag(self, source_id: str, target_id: str | None) -> None:
        """Swaps a tag for another, or removes it, wherever it is used. Recipe revisions
        stay, as for a catalog merge."""
        swap = lambda ids: retagged(ids, source_id, target_id)  # noqa: E731
        for recipe in self._store.list_recipes():
            if source_id in recipe.tags:
                self._store.put_recipe(replace(recipe, tags=swap(recipe.tags)))
        for ingredient in self._store.list_ingredients():
            if source_id in ingredient.tags:
                self._store.put_ingredient(replace(ingredient, tags=swap(ingredient.tags)))
        for entry in self._store.full_drafts():
            if entry.draft is None:
                continue
            draft = entry.draft
            names = [
                replace(n, id=target_id) if n.kind is CatalogKind.TAG and n.id == source_id else n
                for n in draft.added_names
                if target_id or not (n.kind is CatalogKind.TAG and n.id == source_id)
            ]
            updated = replace(
                draft,
                recipe=replace(draft.recipe, tags=swap(draft.recipe.tags)),
                new_ingredients=[replace(i, tags=swap(i.tags)) for i in draft.new_ingredients],
                added_names=names,
            )
            if updated != draft:
                self._store.put_draft(replace(entry, draft=updated))

    @staticmethod
    def _reject_managed(data: dict[str, Any]) -> None:
        managed = data.keys() & _MANAGED_FIELDS
        if managed:
            raise InvalidRequestError(f"fields set by the app: {', '.join(sorted(managed))}")

    def _upsert_entry(
        self,
        cls: type[CatalogEntry],
        data: dict[str, Any],
        get: Callable[[str], CatalogEntry | None],
        peers: Callable[[CatalogEntry], list[CatalogEntry]],
        put: Callable[[CatalogEntry], None],
    ) -> CatalogEntry:
        """`peers` lists the entries whose words the new one must not reuse."""
        unknown = data.keys() - {f.name for f in fields(cls)}
        if unknown:
            raise InvalidRequestError(f"unknown fields: {', '.join(sorted(unknown))}")
        entry_id = data.get("id")
        base = (get(entry_id) if entry_id else None) or cls(id=entry_id or self._new_id())
        scalars = {k: v for k, v in data.items() if k not in ("id", "localized")}
        try:
            entry = cls.from_dict({**base.to_dict(), **scalars})
        except (TypeError, ValueError) as err:
            raise InvalidRequestError(f"invalid {cls.__name__.lower()}: {err}") from err
        entry = replace(entry, localized=merge_localized(base.localized, data.get("localized", {})))
        if not entry.localized:
            raise InvalidRequestError("needs a name in at least one language", key="name_required")
        ensure_unique_terms(entry.id, entry.localized, ((e.id, e.localized) for e in peers(entry)))
        put(entry)
        return entry

    def _preflight_catalog(self, draft: Draft) -> None:
        """Checks every catalog change before applying any, so a clash cannot leave
        half a draft's ingredients saved."""
        tags = self._store.list_tags()
        catalogs = {
            CatalogKind.INGREDIENT: {i.id: i.localized for i in self._store.list_ingredients()},
            CatalogKind.UNIT: {u.id: u.localized for u in self._store.list_units()},
            CatalogKind.TAG: {t.id: t.localized for t in tags},
        }
        tag_kinds = {t.id: t.kind for t in [*tags, *draft.new_tags]}
        changed: set[tuple[CatalogKind, str]] = set()
        for tag in draft.new_tags:
            catalogs[CatalogKind.TAG][tag.id] = tag.localized
            changed.add((CatalogKind.TAG, tag.id))
        for ingredient in draft.new_ingredients:
            self._known_tags(ingredient.tags, TagKind.INGREDIENT, draft.new_tags)
            catalogs[CatalogKind.INGREDIENT][ingredient.id] = ingredient.localized
            changed.add((CatalogKind.INGREDIENT, ingredient.id))
        for added in draft.added_names:
            entries = catalogs[added.kind]
            if added.id not in entries:
                raise NotFoundError(f"{added.kind} {added.id} not found")
            entries[added.id] = {**entries[added.id], added.language: Localized(added.name, added.plural)}
            changed.add((added.kind, added.id))
        for kind, entry_id in changed:
            peers = catalogs[kind].items()
            if kind is CatalogKind.TAG:
                peers = [(i, l) for i, l in peers if tag_kinds.get(i) is tag_kinds[entry_id]]
            ensure_unique_terms(entry_id, catalogs[kind][entry_id], peers)

    def _preflight_recipe(self, draft: Draft, recipe: Recipe) -> None:
        """Checks the recipe and where it lands, counting the draft's own new
        ingredients as known; the saves that follow repeat the checks cheaply."""
        self._ensure_references(recipe, {i.id for i in draft.new_ingredients}, draft.new_tags)
        if draft.updates_id:
            current = self.get_recipe(draft.updates_id)
            if current.parent_id:
                validate_child(self.get_recipe(current.parent_id), current.relation, recipe.language)
        else:
            self._tree_position(draft.parent_id, draft.relation, recipe.language)

    def _ensure_references(
        self, recipe: Recipe, pending_ingredient_ids: set[str] = frozenset(), pending_tags: Sequence[Tag] = ()
    ) -> None:
        self._known_tags(recipe.tags, TagKind.RECIPE, pending_tags)
        if any(not line.ingredient_id for line in recipe.ingredients):
            raise InvalidRequestError("every ingredient line needs an ingredient", key="ingredient_required")
        ingredient_ids = {i.id for i in self._store.list_ingredients()} | pending_ingredient_ids
        unit_ids = {u.id for u in self._store.list_units()}
        missing = sorted(
            {line.ingredient_id for line in recipe.ingredients} - ingredient_ids
            | {line.unit_id for line in recipe.ingredients if line.unit_id} - unit_ids
        )
        if missing:
            raise InvalidRequestError(f"unknown ingredients or units: {', '.join(missing)}", key="entries_missing")

    def _subtree_leaves_first(self, recipe_id: str) -> list[str]:
        ordered: list[str] = []
        for child in self._store.children(recipe_id):
            ordered.extend(self._subtree_leaves_first(child.id))
        ordered.append(recipe_id)
        return ordered

    def _users(self, line_field: str) -> dict[str, list[dict[str, Any]]]:
        users: dict[str, list[dict[str, Any]]] = {}
        for recipe in self._store.list_recipes():
            for entry_id in dict.fromkeys(getattr(line, line_field) for line in recipe.ingredients):
                if entry_id:
                    users.setdefault(entry_id, []).append(RecipeSummary.of(recipe).to_dict())
        return users

    def _ensure_unused(self, line_field: str, entry_id: str) -> None:
        users = self._users(line_field).get(entry_id)
        if users:
            titles = ", ".join(u["title"] for u in users)
            raise InUseError(f"{entry_id} is used by: {titles}", key="used_by_recipes", titles=titles)
        # A draft that names the entry would break on review or save without it.
        kind = CatalogKind(line_field.removesuffix("_id"))
        drafts = [
            e.title
            for e in self._store.full_drafts()
            if e.draft
            and (
                any(getattr(line, line_field) == entry_id for line in e.draft.recipe.ingredients)
                or any(n.kind is kind and n.id == entry_id for n in e.draft.added_names)
            )
        ]
        if drafts:
            titles = ", ".join(drafts)
            raise InUseError(f"{entry_id} is used by drafts: {titles}", key="used_by_drafts", titles=titles)

    def _merge_entry(
        self,
        kind: CatalogKind,
        source_id: str,
        target_id: str,
        get: Callable[[str], CatalogEntry | None],
        put: Callable[[CatalogEntry], None],
        delete: Callable[[str], None],
    ) -> CatalogEntry:
        """Recipes and inbox drafts switch from source to target, the source's words
        become the target's aliases, and the source is deleted. Recipe revisions stay:
        the content means the same, so translations do not go stale."""
        if source_id == target_id:
            raise InvalidRequestError("cannot merge an entry into itself")
        source, target = get(source_id), get(target_id)
        for entry_id, entry in ((source_id, source), (target_id, target)):
            if entry is None:
                raise NotFoundError(f"{kind} {entry_id} not found")
        line_field = f"{kind}_id"

        def repoint(lines: list[IngredientLine]) -> list[IngredientLine]:
            return [
                replace(line, **{line_field: target_id}) if getattr(line, line_field) == source_id else line
                for line in lines
            ]

        for recipe in self._store.list_recipes():
            if any(getattr(line, line_field) == source_id for line in recipe.ingredients):
                self._store.put_recipe(replace(recipe, ingredients=repoint(recipe.ingredients)))
        for entry in self._store.full_drafts():
            if entry.draft is None:
                continue
            draft = entry.draft
            names = [
                replace(n, id=target_id) if n.kind is kind and n.id == source_id else n for n in draft.added_names
            ]
            recipe = replace(draft.recipe, ingredients=repoint(draft.recipe.ingredients))
            if recipe != draft.recipe or names != draft.added_names:
                    self._store.put_draft(replace(entry, draft=replace(draft, recipe=recipe, added_names=names)))
        merged = replace(target, localized=absorb_names(target.localized, source.localized))
        if isinstance(merged, Ingredient):
            merged = replace(merged, tags=list(dict.fromkeys([*target.tags, *source.tags])))
        put(merged)
        delete(source_id)
        return merged
