// Takes the README and docs screenshots from a fresh Home Assistant: onboards it, adds
// the integration, loads the demo library through Itadaki's own actions, then
// photographs the panel. This process also stands in for a recipe site and an AI
// provider, so imports and AI drafts come out the same on every run. Run by
// scripts/screenshots.sh, which provides HA and the browser.
//   node tools/screenshots.js <ha url> <demo dir> <output dir> <this machine's url, as HA reaches it>
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";
import { chromium } from "playwright-core";

const [HA, DEMO, OUT, SELF] = process.argv.slice(2);
const CLIENT = `${HA}/`;
const DEMO_USER = { username: "demo", password: "demodemo" };
const DESKTOP = { width: 810, height: 720 };
const PHONE = { width: 390, height: 844 };

const demo = JSON.parse(await readFile(join(DEMO, "demo.json"), "utf8"));

async function request(path, { token, json, form } = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let body;
  if (json) [headers["Content-Type"], body] = ["application/json", JSON.stringify(json)];
  if (form) body = new URLSearchParams(form);
  const res = await fetch(HA + path, { method: "POST", headers, body });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function waitFor(check, what, seconds = 120) {
  for (let i = 0; i < seconds; i++) {
    try {
      if (await check()) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`${what} did not happen`);
}

// The recipe page for the import, its photo, and the AI provider's one answer: the
// adaptation in demo.json, whatever is asked.
function serveFakes() {
  const page = `${SELF}/recipe`;
  const recipe = { ...demo.import.recipe, image: `${SELF}/photo.jpg`, url: page };
  const html = `<!doctype html><html><head><title>${recipe.name}</title>
    <script type="application/ld+json">${JSON.stringify(recipe)}</script></head>
    <body><h1>${recipe.name}</h1></body></html>`;
  const completion = JSON.stringify({
    id: "demo", object: "chat.completion", created: 0, model: "demo",
    choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: JSON.stringify(demo.adapt.answer) } }],
    usage: { prompt_tokens: 1200, completion_tokens: 600, total_tokens: 1800 },
  });
  const server = createServer(async (req, res) => {
    for await (const _ of req);
    if (req.url === "/recipe") res.writeHead(200, { "Content-Type": "text/html" }).end(html);
    else if (req.url === "/photo.jpg") res.writeHead(200, { "Content-Type": "image/jpeg" }).end(await readFile(join(DEMO, demo.import.image)));
    else if (req.url.endsWith("/chat/completions")) res.writeHead(200, { "Content-Type": "application/json" }).end(completion);
    else res.writeHead(404).end();
  });
  return new Promise((resolve) => server.listen(new URL(SELF).port || 80, "0.0.0.0", () => resolve({ server, page })));
}

async function onboard() {
  const user = { client_id: CLIENT, name: "Demo", language: "en", ...DEMO_USER };
  const { auth_code } = await request("/api/onboarding/users", { json: user });
  const tokens = await request("/auth/token", { form: { grant_type: "authorization_code", code: auth_code, client_id: CLIENT } });
  for (const step of ["core_config", "analytics"]) await request(`/api/onboarding/${step}`, { token: tokens.access_token, json: {} });
  await request("/api/onboarding/integration", { token: tokens.access_token, json: { client_id: CLIENT, redirect_uri: CLIENT } });
  return tokens;
}

function actions(token) {
  return async (action, data) =>
    (await request(`/api/services/itadaki/${action}?return_response`, { token, json: data })).service_response;
}

async function seed(call) {
  await call("update_settings", { languages: demo.languages });
  for (const unit of demo.units) await call("upsert_unit", { unit });
  for (const tag of demo.tags) await call("upsert_tag", { tag });
  for (const ingredient of demo.ingredients) await call("upsert_ingredient", { ingredient });
  const ids = {};
  // The list shows the newest first, so the first recipe in demo.json is created last.
  for (const { key, image, recipe, translations = [], variants = [], update } of [...demo.recipes].reverse()) {
    const photo = join(DEMO, image);
    const image_url = existsSync(photo)
      ? (await call("upload_image", { data: (await readFile(photo)).toString("base64") })).image_url
      : null;
    if (!image_url) console.warn(`no photo at ${photo}`);
    const create = async (data, parent_id, relation) => (await call("create_recipe", { recipe: { ...data, image_url }, parent_id, relation })).recipe.id;
    ids[key] = await create(recipe);
    for (const t of translations) ids[`${key}_${t.language}`] = await create(t, ids[key], "translation");
    for (const [i, v] of variants.entries()) ids[`${key}_variant${i}`] = await create(v, ids[key], "variant");
    // Changing the original after translating it leaves the translations out of date.
    if (update) await call("update_recipe", { recipe_id: ids[key], changes: update });
  }
  return ids;
}

async function readyDraft(call, draft_id) {
  await waitFor(async () => (await call("get_draft", { draft_id })).status !== "working", `draft ${draft_id} finishing`);
  return draft_id;
}

// Panel content lives in nested shadow roots, which document.images cannot see.
async function settled(page) {
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => {
    const images = [];
    const walk = (root) => root.querySelectorAll("*").forEach((el) => {
      if (el.tagName === "IMG") images.push(el);
      if (el.shadowRoot) walk(el.shadowRoot);
    });
    walk(document);
    return images.every((img) => img.complete) && document.fonts.status === "loaded";
  });
}

async function open(page, path) {
  await page.goto(`${HA}/itadaki${path}`);
  await page.locator("itadaki-panel").waitFor();
  await settled(page);
}

async function save(page, file, options = {}) {
  await settled(page);
  await page.screenshot({ path: join(OUT, file), ...options });
  console.log(`saved ${file}`);
}

async function shoot(page, path, file) {
  await open(page, path);
  await save(page, file);
}

async function login(browser, viewport) {
  const context = await browser.newContext({ viewport, colorScheme: "dark", reducedMotion: "reduce", locale: "en-US" });
  const page = await context.newPage();
  await page.goto(HA);
  await page.getByRole("textbox", { name: "Username" }).fill(DEMO_USER.username);
  await page.getByRole("textbox", { name: "Password" }).fill(DEMO_USER.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForFunction(() => localStorage.getItem("hassTokens"));
  return page;
}

const fakes = await serveFakes();
await waitFor(async () => (await fetch(`${HA}/manifest.json`)).ok, "Home Assistant starting");
const tokens = await onboard();
const token = tokens.access_token;
await request("/api/config/config_entries/flow", { token, json: { handler: "itadaki" } });
await request("/api/config/config_entries/flow", { token, json: { handler: "shopping_list" } });
const call = actions(token);
await call("update_ai_settings", { base_url: `${SELF}/v1`, api_key: "demo", model: "demo-model", structured_output: "json" });
const ids = await seed(call);

const browser = await chromium.launch();
const page = await login(browser, DESKTOP);
const menu = async (label, item) => {
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.getByRole("button", { name: item, exact: true }).click();
};

await shoot(page, "", "recipes.png");
await shoot(page, `/recipe/${ids.tsukune}`, "recipe.png");
await shoot(page, `/recipe/${ids.tsukune}/edit`, "recipe-edit.png");
await shoot(page, `/recipe/${ids.shakshuka_ja}`, "translation-stale.png");

await open(page, `/recipe/${ids.dal}`);
await page.getByRole("button", { name: "Add to shopping list" }).click();
const items = page.getByRole("checkbox");
await items.first().waitFor();
for (const i of [0, 4, 6]) await items.nth(i).check();
await save(page, "shopping.png");

await open(page, "");
await page.getByRole("button", { name: "Search recipes or tags" }).click();
await page.getByRole("textbox", { name: "Search recipes or tags" }).fill("Vegetarian");
await page.keyboard.press("ArrowDown");
await page.keyboard.press("Enter");
await menu("Group by", "Time");
// The panel talks over a websocket, which the browser's idle check does not see.
await page.locator(".card", { hasText: "Cacio e pepe" }).waitFor();
await save(page, "recipes-grouped.png");
// The filter and grouping are kept in the browser; the next shots start clean.
await page.evaluate(() => localStorage.removeItem("itadaki.list"));

await open(page, "");
for (const title of ["Katsudon", "Cacio e pepe", "Red lentil dal"]) {
  await page.locator(".card", { hasText: title }).getByRole("button", { name: "Select" }).click();
}
await page.evaluate(() => window.scrollTo(0, 0));
await save(page, "recipes-select.png");

await open(page, `/recipe/${ids.dal}`);
await page.getByRole("button", { name: "Adapt", exact: true }).click();
await page.getByPlaceholder("What should change", { exact: false }).fill(demo.adapt.instruction);
await save(page, "ai-card.png");

const adapted = await readyDraft(call, (await call("adapt", { recipe_ids: [ids.dal], instruction: demo.adapt.instruction })).draft_ids[0]);
await shoot(page, `/draft/${adapted}`, "review-adapt.png");
await page.getByRole("button", { name: "Show all" }).click();
await page.mouse.move(0, 0);
// Tall enough for the whole card, so the sticky header is not stitched into it.
await page.setViewportSize({ width: DESKTOP.width, height: 1400 });
await settled(page);
await page.locator(".card").filter({ has: page.locator("h2", { hasText: /^Ingredients$/ }) }).screenshot({ path: join(OUT, "review-changes.png") });
console.log("saved review-changes.png");
await page.setViewportSize(DESKTOP);

const imported = await readyDraft(call, (await call("import_url", { url: fakes.page })).draft_id);
await shoot(page, `/draft/${imported}`, "review-import.png");
await shoot(page, "", "drafts.png");

await shoot(page, "/manage", "manage.png");
// The AI page as it looks set up for Cloudflare Workers AI, the provider the docs walk through.
await call("update_ai_settings", {
  base_url: "https://api.cloudflare.com/client/v4/accounts/<account id>/ai/v1",
  model: "@cf/google/gemma-4-26b-a4b-it",
  extra_body: { chat_template_kwargs: { enable_thinking: false } },
});
await shoot(page, "/manage/ai", "manage-ai.png");
await shoot(page, "/manage/ingredients", "catalog-ingredients.png");
await shoot(page, "/manage/storage", "storage.png");

const phone = await login(browser, PHONE);
await open(phone, `/recipe/${ids.tsukune}`);
await phone.screenshot({ path: join(OUT, "recipe-phone.png") });
console.log("saved recipe-phone.png");

await browser.close();
fakes.server.close();
