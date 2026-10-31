from __future__ import annotations

import json
import re
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path
from typing import Any

from .models import Draft, DraftEntry, DraftStatus, Ingredient, Recipe, Settings, Unit

SCHEMA_VERSION = 5

# The full document lives in `body`; the other columns are copies kept only so
# listing and tree lookups can use indexes without parsing JSON.
_SCHEMA = """
CREATE TABLE recipes (
    id TEXT PRIMARY KEY,
    parent_id TEXT REFERENCES recipes(id),
    language TEXT NOT NULL,
    title TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    body TEXT NOT NULL
);
CREATE INDEX recipes_parent ON recipes(parent_id);
CREATE TABLE ingredients (id TEXT PRIMARY KEY, body TEXT NOT NULL);
CREATE TABLE units (id TEXT PRIMARY KEY, body TEXT NOT NULL);
CREATE TABLE translation_memory (
    recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    PRIMARY KEY (recipe_id, source)
);
"""


# Each entry upgrades the database from the previous version; never edit a released one.
_MIGRATIONS = {
    2: """
    CREATE TABLE drafts (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        action TEXT NOT NULL,
        title TEXT NOT NULL,
        error TEXT,
        updated_at TEXT NOT NULL,
        body TEXT
    );
    """,
    3: """
    ALTER TABLE drafts ADD COLUMN recipe_id TEXT;
    ALTER TABLE drafts ADD COLUMN request TEXT;
    CREATE INDEX drafts_recipe ON drafts(recipe_id);
    """,
    4: """
    CREATE TABLE settings (id TEXT PRIMARY KEY, body TEXT NOT NULL);
    """,
    5: """
    CREATE TABLE images (id TEXT PRIMARY KEY, mime TEXT NOT NULL, created_at TEXT NOT NULL, data BLOB NOT NULL);
    """,
}


class Store:
    """SQLite persistence. Synchronous by design: callers in an event loop run it in
    a worker thread. One short-lived connection per operation keeps it thread-safe."""

    def __init__(self, path: str | Path) -> None:
        self._path = str(path)
        self.created = False
        with self._connect() as db:
            # Readers never wait for the one writer, and a second writer waits its
            # turn (see the connect timeout) instead of failing at once.
            db.execute("PRAGMA journal_mode = WAL")
            version = db.execute("PRAGMA user_version").fetchone()[0]
            if version == 0:
                self.created = True
                self._upgrade(db, 1, _SCHEMA)
                version = 1
            for target in range(version + 1, SCHEMA_VERSION + 1):
                self._upgrade(db, target, _MIGRATIONS[target])

    @staticmethod
    def _upgrade(db: sqlite3.Connection, version: int, script: str) -> None:
        # Each step commits with its version number, or not at all, so a failed
        # step is retried whole at the next start instead of tripping over itself.
        db.executescript(f"BEGIN;\n{script}\nPRAGMA user_version = {version};\nCOMMIT;")

    @contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        db = sqlite3.connect(self._path, timeout=10)
        try:
            db.execute("PRAGMA foreign_keys = ON")
            with db:
                yield db
        finally:
            db.close()

    def get_recipe(self, recipe_id: str) -> Recipe | None:
        with self._connect() as db:
            row = db.execute("SELECT body FROM recipes WHERE id = ?", (recipe_id,)).fetchone()
        return Recipe.from_dict(json.loads(row[0])) if row else None

    def put_recipe(self, recipe: Recipe) -> None:
        with self._connect() as db:
            db.execute(
                "INSERT OR REPLACE INTO recipes VALUES (?, ?, ?, ?, ?, ?)",
                (
                    recipe.id,
                    recipe.parent_id,
                    recipe.language,
                    recipe.title,
                    recipe.updated_at,
                    json.dumps(recipe.to_dict(), ensure_ascii=False),
                ),
            )

    def delete_recipes(self, recipe_ids: list[str]) -> None:
        with self._connect() as db:
            db.executemany("DELETE FROM recipes WHERE id = ?", [(i,) for i in recipe_ids])

    def children(self, recipe_id: str) -> list[Recipe]:
        return self._recipes("WHERE parent_id = ?", (recipe_id,))

    def list_recipes(self, language: str | None = None, query: str | None = None) -> list[Recipe]:
        clauses, params = [], []
        if language:
            clauses.append("language = ?")
            params.append(language)
        if query:
            clauses.append("title LIKE ? ESCAPE '\\'")
            params.append("%" + re.sub(r"([\\%_])", r"\\\1", query) + "%")
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        return self._recipes(f"{where} ORDER BY updated_at DESC", tuple(params))

    def _recipes(self, tail: str, params: tuple[Any, ...]) -> list[Recipe]:
        with self._connect() as db:
            rows = db.execute(f"SELECT body FROM recipes {tail}", params).fetchall()
        return [Recipe.from_dict(json.loads(r[0])) for r in rows]

    def get_memory(self, recipe_id: str) -> dict[str, str]:
        with self._connect() as db:
            rows = db.execute(
                "SELECT source, target FROM translation_memory WHERE recipe_id = ?", (recipe_id,)
            ).fetchall()
        return dict(rows)

    def put_memory(self, recipe_id: str, memory: dict[str, str]) -> None:
        with self._connect() as db:
            db.execute("DELETE FROM translation_memory WHERE recipe_id = ?", (recipe_id,))
            db.executemany(
                "INSERT INTO translation_memory VALUES (?, ?, ?)",
                [(recipe_id, source, target) for source, target in memory.items()],
            )

    def put_draft(self, entry: DraftEntry) -> None:
        body = json.dumps(entry.draft.to_dict(), ensure_ascii=False) if entry.draft else None
        with self._connect() as db:
            db.execute(
                "INSERT OR REPLACE INTO drafts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    entry.id,
                    entry.status,
                    entry.action,
                    entry.title,
                    entry.error,
                    entry.updated_at,
                    body,
                    entry.recipe_id,
                    json.dumps(entry.request, ensure_ascii=False),
                ),
            )

    def get_draft(self, draft_id: str) -> DraftEntry | None:
        with self._connect() as db:
            row = db.execute("SELECT * FROM drafts WHERE id = ?", (draft_id,)).fetchone()
        return _draft_entry(row) if row else None

    def list_drafts(self, recipe_id: str | None = None) -> list[DraftEntry]:
        where, params = ("WHERE recipe_id = ?", (recipe_id,)) if recipe_id else ("", ())
        with self._connect() as db:
            rows = db.execute(
                "SELECT id, status, action, title, error, updated_at, NULL, recipe_id, request "
                f"FROM drafts {where} ORDER BY updated_at DESC",
                params,
            ).fetchall()
        return [_draft_entry(r) for r in rows]

    def full_drafts(self) -> list[DraftEntry]:
        """Every draft with its content, for checks that must see what drafts reference."""
        with self._connect() as db:
            rows = db.execute("SELECT * FROM drafts").fetchall()
        return [_draft_entry(r) for r in rows]

    def delete_drafts(self, draft_ids: list[str]) -> None:
        with self._connect() as db:
            db.executemany("DELETE FROM drafts WHERE id = ?", [(i,) for i in draft_ids])

    def get_ingredient(self, ingredient_id: str) -> Ingredient | None:
        body = self._get_entry("ingredients", ingredient_id)
        return Ingredient.from_dict(body) if body else None

    def list_ingredients(self) -> list[Ingredient]:
        return [Ingredient.from_dict(b) for b in self._list_entries("ingredients")]

    def put_ingredient(self, ingredient: Ingredient) -> None:
        self._put_entry("ingredients", ingredient.id, ingredient.to_dict())

    def delete_ingredient(self, ingredient_id: str) -> None:
        self._delete_entry("ingredients", ingredient_id)

    def get_unit(self, unit_id: str) -> Unit | None:
        body = self._get_entry("units", unit_id)
        return Unit.from_dict(body) if body else None

    def list_units(self) -> list[Unit]:
        return [Unit.from_dict(b) for b in self._list_entries("units")]

    def put_unit(self, unit: Unit) -> None:
        self._put_entry("units", unit.id, unit.to_dict())

    def delete_unit(self, unit_id: str) -> None:
        self._delete_entry("units", unit_id)

    def get_settings(self) -> Settings | None:
        body = self._get_entry("settings", "library")
        return Settings.from_dict(body) if body else None

    def put_settings(self, settings: Settings) -> None:
        self._put_entry("settings", "library", settings.to_dict())

    def put_image(self, image_id: str, mime: str, data: bytes, created_at: str) -> None:
        with self._connect() as db:
            db.execute("INSERT OR IGNORE INTO images VALUES (?, ?, ?, ?)", (image_id, mime, created_at, data))

    def get_image(self, image_id: str) -> tuple[str, bytes] | None:
        with self._connect() as db:
            row = db.execute("SELECT mime, data FROM images WHERE id = ?", (image_id,)).fetchone()
        return (row[0], row[1]) if row else None

    def delete_images_except(self, keep: set[str], created_before: str) -> None:
        with self._connect() as db:
            rows = db.execute("SELECT id FROM images WHERE created_at < ?", (created_before,)).fetchall()
            db.executemany("DELETE FROM images WHERE id = ?", [r for r in rows if r[0] not in keep])

    # Table names below are only ever literals in this class, never user input.
    def _get_entry(self, table: str, entry_id: str) -> dict[str, Any] | None:
        with self._connect() as db:
            row = db.execute(f"SELECT body FROM {table} WHERE id = ?", (entry_id,)).fetchone()
        return json.loads(row[0]) if row else None

    def _list_entries(self, table: str) -> list[dict[str, Any]]:
        with self._connect() as db:
            rows = db.execute(f"SELECT body FROM {table} ORDER BY id").fetchall()
        return [json.loads(r[0]) for r in rows]

    def _put_entry(self, table: str, entry_id: str, body: dict[str, Any]) -> None:
        with self._connect() as db:
            db.execute(
                f"INSERT OR REPLACE INTO {table} VALUES (?, ?)",
                (entry_id, json.dumps(body, ensure_ascii=False)),
            )

    def _delete_entry(self, table: str, entry_id: str) -> None:
        with self._connect() as db:
            db.execute(f"DELETE FROM {table} WHERE id = ?", (entry_id,))



def _draft_entry(row: tuple[Any, ...]) -> DraftEntry:
    draft_id, status, action, title, error, updated_at, body, recipe_id, request = row
    draft = Draft.from_dict(json.loads(body)) if body else None
    return DraftEntry(
        draft_id, DraftStatus(status), action, title, updated_at, error, draft,
        recipe_id, json.loads(request) if request else {},
    )
