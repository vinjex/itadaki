import pytest

from core import Draft, DraftStatus, InvalidRequestError, NotFoundError, RawLine, Recipe, RecipeBook, Store


def draft(title="Oyakodon", **kw):
    return Draft(Recipe(language="en", title=title), **kw)


def test_life_cycle_from_working_to_saved(book):
    entry = book.start_draft("import", "https://e.x/r")
    assert entry.status is DraftStatus.WORKING
    with pytest.raises(InvalidRequestError):
        book.save_inbox_draft(entry.id)

    ready = book.finish_draft(entry.id, draft())
    assert (ready.status, ready.title) == (DraftStatus.READY, "Oyakodon")

    edited = draft("Oyakodon for two")
    recipe = book.save_inbox_draft(entry.id, edited)
    assert recipe.title == "Oyakodon for two"
    assert book.list_drafts() == []


def test_a_working_draft_can_carry_a_readable_preview(book):
    preview = draft(raw_lines=[RawLine("2 eggs")])
    entry = book.start_draft("import", "Oyakodon", preview)
    assert book.get_draft(entry.id).draft.raw_lines[0].text == "2 eggs"


def test_list_has_summaries_without_content(book):
    book.start_draft("import", "Oyakodon", draft())
    (summary,) = book.list_drafts()
    assert summary.draft is None and summary.title == "Oyakodon"


def test_failures_and_discarding(book):
    entry = book.start_draft("translate", "Carbonara")
    failed = book.fail_draft(entry.id, "AI request failed")
    assert (failed.status, failed.error) == (DraftStatus.FAILED, "AI request failed")
    book.discard_draft(entry.id)
    with pytest.raises(NotFoundError):
        book.get_draft(entry.id)


def test_restart_fails_work_that_was_running(book, tmp_path):
    entry = book.start_draft("adapt", "Carbonara")
    RecipeBook(Store(tmp_path / "itadaki.db")).fail_interrupted_drafts()
    assert book.get_draft(entry.id).status is DraftStatus.FAILED


def test_version_1_database_is_upgraded(tmp_path):
    import sqlite3

    from core.storage import _SCHEMA

    path = tmp_path / "old.db"
    with sqlite3.connect(path) as db:
        db.executescript(_SCHEMA)
        db.execute("PRAGMA user_version = 1")
    book = RecipeBook(Store(path))
    assert book.start_draft("import", "x").status is DraftStatus.WORKING


def test_drafts_remember_their_recipe_and_request(book, carbonara):
    book.start_draft("adapt", "Carbonara", recipe_id=carbonara.id, request={"instruction": "use bacon"})
    book.start_draft("import", "Oyakodon", request={"url": "https://e.x"})
    (mine,) = book.list_drafts(recipe_id=carbonara.id)
    assert (mine.action, mine.request) == ("adapt", {"instruction": "use bacon"})
    assert len(book.list_drafts()) == 2


def test_version_2_database_is_upgraded(tmp_path):
    import sqlite3

    from core.storage import _MIGRATIONS, _SCHEMA

    path = tmp_path / "v2.db"
    with sqlite3.connect(path) as db:
        db.executescript(_SCHEMA + _MIGRATIONS[2])
        db.execute("PRAGMA user_version = 2")
        db.execute("INSERT INTO drafts VALUES ('d1', 'ready', 'import', 'Old', NULL, 't', NULL)")
    book = RecipeBook(Store(path))
    assert book.get_draft("d1").request == {}


def test_a_failed_migration_leaves_the_database_at_its_old_version(tmp_path, monkeypatch):
    import sqlite3

    from core import storage

    path = tmp_path / "itadaki.db"
    RecipeBook(Store(path))
    monkeypatch.setattr(storage, "SCHEMA_VERSION", storage.SCHEMA_VERSION + 1)
    monkeypatch.setitem(storage._MIGRATIONS, storage.SCHEMA_VERSION, "CREATE TABLE a (x); CREATE TABLE a (x);")
    with pytest.raises(sqlite3.OperationalError):
        Store(path)
    with sqlite3.connect(path) as db:
        assert db.execute("PRAGMA user_version").fetchone()[0] == storage.SCHEMA_VERSION - 1
        assert db.execute("SELECT count(*) FROM sqlite_master WHERE name = 'a'").fetchone()[0] == 0
