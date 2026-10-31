import { LitElement, html, css, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";
import Sortable from "sortablejs";
import { shared } from "../styles.js";
import { describer, hintLanguage, nameOf } from "../catalog.js";
import { IMAGE_PATH, shrinkToBase64 } from "../image.js";
import "./busy.js";
import "./text.js";
import "./combo.js";
import { newId } from "../search.js";
import { demoteHeading, groups, insertInGroup, move, promoteToHeading, relocate, renameGroup } from "../sections.js";

// Amounts keep 2 decimals, matching what the backend stores.
const round2 = (v) => (v == null ? v : Math.round(v * 100) / 100);
const num = (v) => (v === "" || v == null ? null : round2(Number(v)));
// Client-side identity so each row's DOM follows its item when items move.
let nextKey = 0;
const keyed = (item) => ({ ...item, _key: ++nextKey });
const unkeyed = ({ _key, _raw, ...item }) => item;
const text = (v) => (v && v.trim() ? v.trim() : null);

// One editor for every recipe: drafts under review and saved recipes alike. It keeps
// its own copy; the owner reads `value` when saving. Ingredients and steps are shown
// as section blocks: items are dragged by their handle, within or between blocks, or
// nudged with the arrows.
class ItadakiEditor extends LitElement {
  static properties = {
    api: { attribute: false },
    recipe: { attribute: false },
    ingredients: { attribute: false },
    units: { attribute: false },
    t: { attribute: false },
    uiLang: {},
    languages: { attribute: false },
    newIngredients: { attribute: false },
    // Set when the recipe is already placed (saved, or a draft updating or extending
    // one): its language is then not the editor's to change.
    fixedLanguage: { type: Boolean },
    _r: { state: true },
    _new: { state: true },
    _uploading: { state: true },
    _imageError: { state: true },
  };

  static styles = [
    shared,
    css`
      :host { display: grid; gap: 16px; }
      .grid2 { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
      .line { display: grid; gap: 8px; align-items: center; margin-bottom: 10px;
        grid-template-columns: minmax(160px, 2fr) 80px minmax(90px, 1fr) minmax(120px, 2fr) auto; }
      .line.head { color: var(--it-muted); font-size: 0.75rem; margin-bottom: 4px; }
      .raw { grid-column: 1 / -1; font-size: 0.85rem; }
      @media (max-width: 800px) {
        .line { grid-template-columns: 1fr 1fr; padding-bottom: 10px; border-bottom: 1px solid var(--it-divider); }
        .line.head { display: none; }
      }
      .step { display: grid; gap: 8px; grid-template-columns: 1fr auto; margin-bottom: 10px; align-items: start; }
      .block { border-left: 3px solid var(--it-soft); padding-left: 12px; margin: 12px 0 16px; }
      .block.named { border-left-color: var(--it-accent); }
      .block-title { font-weight: 600; margin-bottom: 8px; }
      .tools { display: flex; gap: 2px; align-items: center; }
      .block .row { flex-wrap: nowrap; }
      .block-title { flex: 1; }
      .item { display: grid; grid-template-columns: 20px 1fr; gap: 6px; align-items: start; }
      .item > :last-child { min-width: 0; }
      .handle { cursor: grab; color: var(--it-muted); user-select: none; padding-top: 10px; text-align: center; touch-action: none; }
      .sortable-ghost { opacity: 0.4; }
      .items { min-height: 8px; }
      .names { display: grid; gap: 8px; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); margin-top: 8px; }
      .names.head label { margin: 12px 0 0; }
      itadaki-combo[invalid] { --it-invalid: 1; }
      input, select, textarea { padding: 10px; }
      .x { background: none; border: none; color: var(--it-muted); cursor: pointer; font-size: 1.1rem; padding: 6px; border-radius: 8px; }
      .x:hover { background: var(--it-soft); color: var(--it-text); }
      .x.del:hover { color: var(--it-error); }
      .about { container-type: inline-size; }
      .split { display: grid; gap: 0 24px; grid-template-columns: 1fr; }
      @container (min-width: 720px) { .split { grid-template-columns: 1fr 300px; } }
      .photo { width: 100%; max-height: 260px; object-fit: cover; border-radius: 14px; display: block; margin-bottom: 8px; }
      .photo-link { margin-top: 8px; }
    `,
  ];

  willUpdate(changed) {
    if (changed.has("newIngredients") || !this._new) this._new = structuredClone(this.newIngredients || []);
    if (changed.has("recipe")) {
      const r = structuredClone(this.recipe);
      this._r = { ...r, ingredients: r.ingredients.map(keyed), steps: r.steps.map(keyed) };
    }
  }

  get value() {
    return { ...this._r, ingredients: this._r.ingredients.map(unkeyed), steps: this._r.steps.map(unkeyed) };
  }

  // Ingredients created during review or editing that a line still uses.
  get newIngredientsUsed() {
    const used = new Set(this._r.ingredients.map((l) => l.ingredient_id));
    return this._new.filter((i) => used.has(i.id));
  }

  _create(index, name) {
    const taken = new Set([...this.ingredients, ...this._new].map((i) => i.id));
    const entry = { id: newId(name, taken), localized: { [this._r.language]: { name, plural: null, aliases: [] } }, density: null };
    this._new = [...this._new, entry];
    this._setItem("ingredients", index, "ingredient_id", entry.id);
  }

  _rename(id, lang, name) {
    this._new = this._new.map((i) => {
      if (i.id !== id) return i;
      const localized = { ...i.localized };
      if (name.trim()) localized[lang] = { ...(localized[lang] || { plural: null, aliases: [] }), name: name.trim() };
      else delete localized[lang];
      return { ...i, localized };
    });
  }

  updated() {
    // Every block's item list becomes a drop zone shared with the other blocks of
    // the same list. Lit owns the DOM, so a drop is undone on the DOM and replayed
    // on the data, and Lit re-renders the result.
    this._sortables ??= new WeakMap();
    for (const zone of this.renderRoot.querySelectorAll(".items")) {
      if (this._sortables.has(zone)) continue;
      let next;
      this._sortables.set(
        zone,
        Sortable.create(zone, {
          group: zone.dataset.list,
          handle: ".handle",
          draggable: ".item",
          animation: 150,
          onStart: (e) => (next = e.item.nextSibling),
          onEnd: (e) => {
            e.from.insertBefore(e.item, next);
            const list = e.from.dataset.list;
            const from = Number(e.from.dataset.block);
            const to = Number(e.to.dataset.block);
            if (from === to && e.oldIndex === e.newIndex) return;
            this._set(list, relocate(this._r[list], from, e.oldIndex, to, e.newIndex));
          },
        }),
      );
    }
  }

  async _upload(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    this._uploading = true;
    this._imageError = undefined;
    try {
      const { image_url } = await this.api.call("upload_image", { data: await shrinkToBase64(file) });
      this._set("image_url", image_url);
    } catch (err) {
      this._imageError = err.message;
    } finally {
      this._uploading = false;
    }
  }

  _photo() {
    const t = this.t;
    const url = this._r.image_url;
    // Uploaded photos have an internal address; only outside links are worth showing.
    const link = url && !url.startsWith(IMAGE_PATH) ? url : "";
    return html`
      <label>${t("photo")}</label>
      ${url ? html`<img class="photo" src=${url} alt="" referrerpolicy="no-referrer" />` : nothing}
      <input id="file" type="file" accept="image/*" hidden @change=${this._upload} />
      <div class="row">
        <button class="btn quiet" ?disabled=${this._uploading} @click=${() => this.renderRoot.querySelector("#file").click()}>
          ${url ? t("changePhoto") : t("addPhoto")}</button>
        ${url ? html`<button class="btn danger" ?disabled=${this._uploading} @click=${() => this._set("image_url", null)}>${t("removePhoto")}</button>` : nothing}
      </div>
      <itadaki-text class="photo-link" type="url" .value=${link} placeholder=${t("photoLink")}
        @change=${(e) => (e.target.value.trim() || link) && this._set("image_url", e.target.value.trim() || null)}></itadaki-text>
      ${this._uploading ? html`<itadaki-busy></itadaki-busy>` : nothing}
      ${this._imageError ? html`<div class="error">${this._imageError}</div>` : nothing}
    `;
  }

  _languagePicker() {
    const r = this._r;
    return html`<label>${this.t("language")}</label>
      <select @change=${(e) => this._set("language", e.target.value)}>
        ${[...new Set([r.language, ...this.languages])].map((l) => html`<option value=${l} ?selected=${l === r.language}>${this.t.langName(l)}</option>`)}
      </select>`;
  }

  _set(field, value) {
    this._r = { ...this._r, [field]: value };
  }

  _setItem(list, index, field, value) {
    const items = this._r[list].map((item, i) => (i === index ? { ...item, [field]: value } : item));
    this._set(list, items);
  }

  _remove(list, index) {
    this._set(list, this._r[list].filter((_, i) => i !== index));
  }

  // Section blocks for `list`; renderItem(item, index) draws one row's own fields.
  _blocks(list, renderItem, blank, addLabel) {
    const t = this.t;
    const items = this._r[list];
    const tools = (i) => html`<span class="tools">
      <button class="x" title="▲" @click=${() => this._set(list, move(items, i, -1))}>▲</button>
      <button class="x" title="▼" @click=${() => this._set(list, move(items, i, 1))}>▼</button>
      ${list === "steps"
        ? html`<button class="x" title=${t("makeHeading")} @click=${() => this._set(list, promoteToHeading(items, i))}>H</button>`
        : nothing}
      <button class="x del" title=${t("remove")} @click=${() => this._remove(list, i)}>×</button>
    </span>`;
    return html`
      ${groups(items).map(
        (g, b) => html`<div class="block ${g.section ? "named" : ""}">
          <div class="row">
            <itadaki-text class="block-title" .value=${g.section || ""} placeholder=${t("sectionPlaceholder")}
              @change=${(e) => this._set(list, renameGroup(items, g, e.target.value))}></itadaki-text>
            ${list === "steps" && g.section
              ? html`<button class="x" title=${t("headingToStep")} @click=${() => this._set(list, demoteHeading(items, g))}>↧</button>`
              : nothing}
          </div>
          <div class="items" data-list=${list} data-block=${b}>
            ${repeat(
              items.slice(g.start, g.end + 1),
              (item) => item._key,
              (item, offset) => html`<div class="item">
                <span class="handle" title=${t("drag")}>⋮⋮</span>${renderItem(item, g.start + offset, tools(g.start + offset))}
              </div>`,
            )}
          </div>
          <button class="btn quiet" @click=${() => this._set(list, insertInGroup(items, g, keyed(blank())))}>+ ${addLabel}</button>
        </div>`,
      )}
      <button class="btn quiet" @click=${() => {
        const name = items.length ? prompt(t("newSection"))?.trim() : null;
        if (name === undefined || name === "") return;
        this._set(list, [...items, keyed({ ...blank(), section: name })]);
      }}>+ ${items.length ? t("addSection") : addLabel}</button>
    `;
  }

  render() {
    const t = this.t;
    const r = this._r;
    const lang = r.language;
    const ingredients = [...this.ingredients, ...this._new].sort((a, b) => nameOf(a, lang).localeCompare(nameOf(b, lang)));
    const units = [...this.units].sort((a, b) => nameOf(a, lang).localeCompare(nameOf(b, lang)));
    const field = (key, label, type = "text") => html`<div>
      <label>${label}</label>
      ${type === "number"
        ? html`<input type="number" .value=${r[key] ?? ""} @input=${(e) => this._set(key, num(e.target.value))} />`
        : html`<itadaki-text .value=${r[key] ?? ""} @input=${(e) => this._set(key, e.target.value)}></itadaki-text>`}
    </div>`;
    // Search results show the recipe-language name, with another language as a hint.
    const describe = describer(lang, hintLanguage(this.languages, lang, this.uiLang));
    const nameLanguages = [...new Set([lang, ...this.languages])];
    const byId = new Map(ingredients.map((g) => [g.id, g]));
    const proposals = this.newIngredientsUsed;

    return html`
      <div class="card about"><div class="split"><div>
        ${field("title", t("title"))}
        ${this.fixedLanguage ? nothing : this._languagePicker()}
        <label>${t("description")}</label>
        <textarea rows="2" .value=${r.description || ""} @input=${(e) => this._set("description", e.target.value)}></textarea>
        <div class="grid2">
          ${field("servings", t("servings"), "number")}
          ${field("prep_minutes", t("prepMinutes"), "number")}
          ${field("cook_minutes", t("cookMinutes"), "number")}
          ${field("total_minutes", t("totalMinutes"), "number")}
        </div>
      </div><div>${this._photo()}</div></div></div>

      ${proposals.length
        ? html`<div class="card">
            <h2>${t("newIngredients")}</h2>
            <div class="muted">${t("newIngredientsExplain")}</div>
            <div class="names head">
              ${nameLanguages.map((l) => html`<label>${t.langName(l)}${l === lang ? html` · ${t("usedAs")}` : nothing}</label>`)}
            </div>
            ${repeat(
              proposals,
              (p) => p.id,
              (p) => html`<div class="names">
                ${nameLanguages.map(
                  (l) => html`<itadaki-text .value=${p.localized[l]?.name || ""}
                    @change=${(e) => this._rename(p.id, l, e.target.value)}></itadaki-text>`,
                )}
              </div>`,
            )}
          </div>`
        : nothing}

      <div class="card">
        <h2>${t("ingredients")}</h2>
        <div class="line head">
          <span>${t("ingredient")}</span><span>${t("amount")}</span>
          <span>${t("unit")}</span><span>${t("lineNote")}</span><span></span>
        </div>
        ${this._blocks(
              "ingredients",
              (line, i, tools) => html`<div class="line">
                ${line._raw ? html`<div class="raw muted">${line._raw}</div>` : nothing}
                <itadaki-combo .entries=${ingredients} .hint=${describe} value=${line.ingredient_id ?? ""}
                  .label=${byId.has(line.ingredient_id) ? nameOf(byId.get(line.ingredient_id), lang) : ""}
                  ?invalid=${!byId.has(line.ingredient_id)} placeholder=${t("ingredientSearch")} createLabel=${t("create")}
                  @pick=${(e) => this._setItem("ingredients", i, "ingredient_id", e.detail.id)}
                  @create=${(e) => this._create(i, e.detail.name)}></itadaki-combo>
                <input type="number" step="any" .value=${round2(line.quantity) ?? ""} placeholder=${t("amount")}
                  @input=${(e) => this._setItem("ingredients", i, "quantity", num(e.target.value))} />
                <select @change=${(e) => this._setItem("ingredients", i, "unit_id", e.target.value || null)}>
                  <option value="" ?selected=${!line.unit_id}>—</option>
                  ${units.map((u) => html`<option value=${u.id} ?selected=${u.id === line.unit_id}>${nameOf(u, lang)}</option>`)}
                </select>
                <itadaki-text .value=${line.note || ""} placeholder=${t("lineNote")}
                  @input=${(e) => this._setItem("ingredients", i, "note", text(e.target.value))}></itadaki-text>
                ${tools}
              </div>`,
              () => ({ ingredient_id: null, quantity: null, unit_id: null, note: null }),
              t("addLine"),
            )}
      </div>

      <div class="card">
        <h2>${t("steps")}</h2>
        ${this._blocks(
          "steps",
          (step, i, tools) => html`<div class="step">
            <textarea rows="2" .value=${step.text} @input=${(e) => this._setItem("steps", i, "text", e.target.value)}></textarea>
            ${tools}
          </div>`,
          () => ({ text: "" }),
          t("addStep"),
        )}
      </div>

      <div class="card">
        <label>${t("notes")}</label>
        <textarea rows="3" .value=${r.notes || ""} @input=${(e) => this._set("notes", e.target.value)}></textarea>
        <label>${t("tags")}</label>
        <itadaki-text .value=${(r.tags || []).join(", ")}
          @change=${(e) => this._set("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}></itadaki-text>
      </div>
    `;
  }
}
customElements.define("itadaki-editor", ItadakiEditor);
