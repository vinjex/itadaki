"""Runs every AI action once against the real provider in dev/ai.env, on a throwaway
database. Usage: scripts/run.sh python scripts/live_check.py [schema|json|off] [url] [steps]
where steps is a comma list of: import, translate, adapt, retranslate, page (default all)."""

import json
import os
import re
import sys
import tempfile
import time
import traceback

sys.path.insert(0, "custom_components/itadaki")

from core import RecipeBook, Store  # noqa: E402
from core.ai import Assistant  # noqa: E402
from core.llm import AiSettings, OpenAIChat, StructuredOutput  # noqa: E402
from core.page import fetch_html  # noqa: E402

mode = StructuredOutput(sys.argv[1] if len(sys.argv) > 1 else "schema")
url = sys.argv[2] if len(sys.argv) > 2 else "https://www.justonecookbook.com/oyakodon/"
steps = set((sys.argv[3] if len(sys.argv) > 3 else "import,translate,adapt,retranslate,page").split(","))
base, key, model = (os.environ[f"ITADAKI_AI_{k}"] for k in ("BASE_URL", "API_KEY", "MODEL"))
extra_body = json.loads(os.environ.get("ITADAKI_AI_EXTRA_BODY") or "{}")
settings = AiSettings(base, key, model, structured_output=mode, extra_body=extra_body)
chat = OpenAIChat(base, key)
book = RecipeBook(Store(os.path.join(tempfile.mkdtemp(), "live.db")))
print(f"fetching {url}")
html = fetch_html(url)
print(f"model {model}, mode {mode}, extra {extra_body}, page {len(html)} chars\n")


def show(label, draft, started):
    recipe = draft.recipe
    ai = Assistant(book, chat, settings)
    print(f"== {label}: {time.time() - started:.1f}s, tokens {draft.usage.prompt_tokens} in / {draft.usage.completion_tokens} out")
    print(f"   [{recipe.language}] {recipe.title} | serves {recipe.servings} | {recipe.total_minutes} min")
    if draft.new_ingredients:
        print("   new ingredients: " + "; ".join(
            f"{i.id} " + "/".join(f"{l}:{v.name}" for l, v in i.localized.items()) for i in draft.new_ingredients))
    if draft.added_names:
        print("   added names: " + "; ".join(f"{n.id}={n.name}" for n in draft.added_names))
    saved = book.save_draft(draft)
    for line in ai._lines_as_text(saved):
        print(f"   - {line.text}" + (f"  [{line.section}]" if line.section else ""))
    for n, step in enumerate(saved.steps[:3], 1):
        print(f"   {n}. {step.text[:110]}")
    if len(saved.steps) > 3:
        print(f"   ... {len(saved.steps)} steps")
    print()
    return saved


def step(label, action):
    started = time.time()
    try:
        return show(label, action(), started)
    except Exception:
        print(f"== {label}: FAILED after {time.time() - started:.1f}s")
        traceback.print_exc(limit=3)
        print()


ai = Assistant(book, chat, settings, fetch=lambda u: html)
original = step("import (embedded data, lines only)", lambda: ai.structure_draft(ai.read_url(url)))
if original and "translate" in steps:
    step("translate to ja", lambda: ai.translate(original.id, "ja"))
if original and "adapt" in steps:
    step("adapt as variant: vegetarian", lambda: ai.adapt(original.id, "make it vegetarian", as_variant=True))
if original and "retranslate" in steps:
    book.update_recipe(original.id, {"notes": "Use day-old rice if you have it."})
    step("re-translate after a parent edit", lambda: ai.translate(original.id, "ja"))
if "page" not in steps:
    sys.exit()

stripped = re.sub(r"<script[^>]*ld\+json[^>]*>.*?</script>", "", html, flags=re.S | re.I)
no_data = Assistant(book, chat, settings, fetch=lambda u: stripped)
step("import (no embedded data, page text)", lambda: no_data.extract(url))
