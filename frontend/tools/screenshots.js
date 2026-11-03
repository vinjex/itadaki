// Takes the README screenshots from a fresh Home Assistant: onboards it, adds the
// integration, loads the demo library through Itadaki's own actions, then photographs
// the panel. Run by scripts/screenshots.sh, which provides HA and the browser.
//   node tools/screenshots.js <ha url> <demo dir> <output dir>
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const [HA, DEMO, OUT] = process.argv.slice(2);
const CLIENT = `${HA}/`;
const DEMO_USER = { username: "demo", password: "demodemo" };
const VIEWPORT = { width: 810, height: 720 };

async function request(path, { token, json, form } = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let body;
  if (json) [headers["Content-Type"], body] = ["application/json", JSON.stringify(json)];
  if (form) body = new URLSearchParams(form);
  const res = await fetch(HA + path, { method: "POST", headers, body });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function waitForHa() {
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(`${HA}/manifest.json`)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Home Assistant did not start");
}

async function onboard() {
  const user = { client_id: CLIENT, name: "Demo", language: "en", ...DEMO_USER };
  const { auth_code } = await request("/api/onboarding/users", { json: user });
  const tokens = await request("/auth/token", { form: { grant_type: "authorization_code", code: auth_code, client_id: CLIENT } });
  for (const step of ["core_config", "analytics"]) await request(`/api/onboarding/${step}`, { token: tokens.access_token, json: {} });
  await request("/api/onboarding/integration", { token: tokens.access_token, json: { client_id: CLIENT, redirect_uri: CLIENT } });
  return tokens;
}

async function seed(token) {
  const call = async (action, data) =>
    (await request(`/api/services/itadaki/${action}?return_response`, { token, json: data })).service_response;
  const demo = JSON.parse(await readFile(join(DEMO, "demo.json"), "utf8"));
  await call("update_settings", { languages: demo.languages });
  for (const tag of demo.tags) await call("upsert_tag", { tag });
  for (const ingredient of demo.ingredients) await call("upsert_ingredient", { ingredient });
  const ids = {};
  for (const { key, image, recipe, translations = [] } of demo.recipes) {
    const photo = join(DEMO, image);
    const image_url = existsSync(photo)
      ? (await call("upload_image", { data: (await readFile(photo)).toString("base64") })).image_url
      : null;
    if (!image_url) console.warn(`no photo at ${photo}`);
    const saved = (await call("create_recipe", { recipe: { ...recipe, image_url } })).recipe;
    for (const t of translations) {
      await call("create_recipe", { recipe: { ...t, image_url }, parent_id: saved.id, relation: "translation" });
    }
    ids[key] = saved.id;
  }
  return ids;
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

async function shoot(page, path, file) {
  await page.goto(`${HA}/itadaki${path}`);
  await page.locator("itadaki-panel").waitFor();
  await settled(page);
  await page.screenshot({ path: join(OUT, file) });
  console.log(`saved ${file}`);
}

await waitForHa();
const tokens = await onboard();
await request("/api/config/config_entries/flow", { token: tokens.access_token, json: { handler: "itadaki" } });
const ids = await seed(tokens.access_token);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: VIEWPORT, colorScheme: "dark", reducedMotion: "reduce", locale: "en-US" });
const page = await context.newPage();
await page.goto(HA);
await page.getByRole("textbox", { name: "Username" }).fill(DEMO_USER.username);
await page.getByRole("textbox", { name: "Password" }).fill(DEMO_USER.password);
await page.getByRole("button", { name: "Log in" }).click();
await page.waitForFunction(() => localStorage.getItem("hassTokens"));
await shoot(page, "", "recipes.png");
await shoot(page, `/recipe/${ids.tsukune}`, "recipe_example.png");
await shoot(page, `/recipe/${ids.tsukune}/edit`, "recipe_form_example.png");
await browser.close();
