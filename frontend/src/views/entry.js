import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import { BASE_UNIT, CATALOGS, describer, hasPlural, hintLanguage, nameOf } from "../catalog.js";
import { newId } from "../search.js";
import { navigate } from "../router.js";
import "./busy.js";
import "./combo.js";
import "./tags.js";
import "./text.js";

const DIMENSIONS = ["mass", "volume", "count", "other"];
const SYSTEMS = ["metric", "us", "imperial", "japanese"];
const num = (v) => (v === "" || v == null ? null : Number(v));
const words = (v) => v.split(/[,、]/).map((s) => s.trim()).filter(Boolean);

// The form for one ingredient, unit or tag: its names per language, an ingredient's
// density and tags, a unit's measures, plus deleting it or merging it into another
// entry. `entry` is null for a new one. Fires `changed` once the catalog has been
// written, and `tag-created` with the tag when an ingredient tag is made here.
class ItadakiEntry extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    lang: {},
    languages: { attribute: false },
    kind: {},
    entry: { attribute: false },
    entries: { attribute: false },
    usedBy: { attribute: false },
    // Ingredient tags, for an ingredient's tag picker.
    tags: { attribute: false },
    _e: { state: true },
    _busy: { state: true },
    _error: { state: true },
  };

  static styles = [
    shared,
    css`
      :host { display: block; padding: 8px 0 16px; container-type: inline-size; }
      .lang { margin-bottom: 12px; }
      .lang-name { font-weight: 600; margin-top: 8px; }
      .fields { display: grid; gap: 0 12px; grid-template-columns: 1fr; }
      @container (min-width: 560px) {
        .fields { grid-template-columns: 1fr 1fr 2fr; }
        .fields.single { grid-template-columns: 1fr 2fr; }
      }
      .grid2 { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
      .actions { margin-top: 16px; }
      .merge { margin-top: 16px; max-width: 420px; }
    `,
  ];

  willUpdate(changed) {
    if (changed.has("entry")) {
      const e = structuredClone(this.entry) || { localized: {}, density: null, tags: [], dimension: "other", factor: null, systems: [] };
      const languages = [...new Set([...this.languages, ...Object.keys(e.localized)])];
      e.localized = Object.fromEntries(
        languages.map((l) => {
          const n = e.localized[l];
          return [l, { name: n?.name || "", plural: n?.plural || "", aliases: (n?.aliases || []).join(", ") }];
        }),
      );
      this._e = e;
    }
  }

  get _isUnit() {
    return this.kind === "units";
  }

  get _catalog() {
    return CATALOGS[this.kind];
  }

  // Tags have names and other names only: no plural, no measures.
  _hasPlural(language) {
    return !this._catalog.tagKind && hasPlural(language);
  }

  async _createTag(name) {
    try {
      const { tag } = await this.api.call("upsert_tag", { tag: { kind: "ingredient", localized: { [this.lang]: { name, aliases: [] } } } });
      this.dispatchEvent(new CustomEvent("tag-created", { detail: tag }));
      this._set("tags", [...this._e.tags, tag.id]);
    } catch (err) {
      this._error = this.t.error(err);
    }
  }

  _set(field, value) {
    this._e = { ...this._e, [field]: value };
  }

  _setName(language, field, value) {
    this._set("localized", { ...this._e.localized, [language]: { ...this._e.localized[language], [field]: value } });
  }

  _payload() {
    const e = this._e;
    const localized = Object.fromEntries(
      Object.entries(e.localized).map(([l, n]) => [
        l,
        n.name.trim() ? { name: n.name.trim(), plural: (this._hasPlural(l) && n.plural.trim()) || null, aliases: words(n.aliases) } : null,
      ]),
    );
    const firstName = Object.values(localized).find(Boolean)?.name ?? "";
    const { tagKind } = this._catalog;
    // Recipe and ingredient tags share one id space on the server, so a new tag gets
    // its id there.
    const id = this.entry?.id ?? (tagKind ? undefined : newId(firstName, new Set(this.entries.map((x) => x.id))));
    if (tagKind) return { id, localized, kind: tagKind };
    if (!this._isUnit) return { id, localized, density: num(e.density), tags: e.tags };
    const dimension = e.dimension;
    const factor = dimension === "other" ? null : num(e.factor);
    return { id, localized, dimension, factor, systems: e.systems };
  }

  async _act(work) {
    this._busy = true;
    this._error = undefined;
    try {
      await work();
      this.dispatchEvent(new CustomEvent("changed"));
    } catch (err) {
      this._error = this.t.error(err);
    } finally {
      this._busy = false;
    }
  }

  _save() {
    const [action, field] = this._catalog.upsert;
    this._act(() => this.api.call(action, { [field]: this._payload() }));
  }

  _delete() {
    const name = nameOf(this.entry, this.lang);
    const question = this.usedBy?.length ? this.t("confirmDeleteTag", { name, n: this.usedBy.length }) : this.t("confirmDeleteEntry", { name });
    if (!confirm(question)) return;
    const [action, field] = this._catalog.remove;
    this._act(() => this.api.call(action, { [field]: this.entry.id }));
  }

  _merge(targetId) {
    const target = this.entries.find((x) => x.id === targetId);
    const names = { from: nameOf(this.entry, this.lang), to: nameOf(target, this.lang) };
    if (!confirm(this.t("confirmMerge", names))) return;
    this._act(() => this.api.call(this._catalog.merge, { source_id: this.entry.id, target_id: targetId }));
  }

  render() {
    const t = this.t;
    const e = this._e;
    const usedBy = this.usedBy || [];
    const { tagKind } = this._catalog;
    // A tag can go while in use: taking it off loses nothing a recipe needs.
    const deletable = this.entry && (tagKind || !usedBy.length);
    return html`
      ${Object.entries(e.localized).map(([l, n]) => {
        const field = (key, label) => html`<div>
          <label>${label}</label>
          <itadaki-text .value=${n[key]} @input=${(ev) => this._setName(l, key, ev.target.value)}></itadaki-text>
        </div>`;
        return html`<div class="lang">
          <div class="lang-name">${t.langName(l)}</div>
          <div class="fields ${this._hasPlural(l) ? "" : "single"}">
            ${field("name", t("name"))}
            ${this._hasPlural(l) ? field("plural", t("plural")) : nothing}
            ${field("aliases", t("aliases"))}
          </div>
        </div>`;
      })}

      ${tagKind ? nothing : this._measures(e)}

      ${usedBy.length
        ? html`<label>${t(tagKind === "ingredient" ? "usedByIngredients" : "usedBy", { n: usedBy.length })}</label>
            <div class="row">
              ${usedBy.map((r) =>
                r.title
                  ? html`<button class="chip" @click=${() => navigate(this, { view: "recipe", id: r.id })}>${r.title}</button>`
                  : html`<span class="chip">${nameOf(r, this.lang)}</span>`,
              )}
            </div>`
        : nothing}

      <div class="row actions">
        <button class="btn" ?disabled=${this._busy} @click=${this._save}>${t("save")}</button>
        <button class="btn quiet" ?disabled=${this._busy} @click=${() => this.dispatchEvent(new CustomEvent("cancel"))}>${t("cancel")}</button>
        ${deletable ? html`<button class="btn danger" ?disabled=${this._busy} @click=${this._delete}>${t("delete")}</button>` : nothing}
      </div>

      ${this.entry
        ? html`<div class="merge">
            <label>${t("mergeInto")}</label>
            <itadaki-combo noCreate .entries=${this.entries.filter((x) => x.id !== this.entry.id)}
              .hint=${describer(this.lang, hintLanguage(this.languages, this.lang))} placeholder=${t("catalogSearch")}
              @pick=${(ev) => this._merge(ev.detail.id)}></itadaki-combo>
            <div class="muted" style="font-size:0.85rem;margin-top:6px">${t("mergeHint")}</div>
          </div>`
        : nothing}
      ${this._busy ? html`<itadaki-busy></itadaki-busy>` : nothing}
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
    `;
  }

  // An ingredient's density and tags, or a unit's dimension, size and systems.
  _measures(e) {
    const t = this.t;
    return html`
      <div class="grid2">
        ${this._isUnit
          ? html`<div>
                <label>${t("dimension")}</label>
                <select @change=${(ev) => this._set("dimension", ev.target.value)}>
                  ${DIMENSIONS.map((d) => html`<option value=${d} ?selected=${d === e.dimension}>${t(`dim_${d}`)}</option>`)}
                </select>
              </div>
              ${e.dimension !== "other"
                ? html`<div>
                    <label>${t("factor", { base: BASE_UNIT[e.dimension] ?? t("items") })}</label>
                    <input type="number" step="any" .value=${e.factor ?? ""} @input=${(ev) => this._set("factor", ev.target.value)} />
                  </div>`
                : nothing}`
          : html`<div>
              <label>${t("density")}</label>
              <input type="number" step="any" .value=${e.density ?? ""} @input=${(ev) => this._set("density", ev.target.value)} />
            </div>`}
      </div>
      ${this._isUnit
        ? html`<label>${t("systems")}</label>
            <div class="row">
              ${SYSTEMS.map(
                (s) => html`<button class="chip ${e.systems.includes(s) ? "active" : ""}"
                  @click=${() => this._set("systems", e.systems.includes(s) ? e.systems.filter((x) => x !== s) : [...e.systems, s])}>
                  ${t(`sys_${s}`)}</button>`,
              )}
            </div>`
        : nothing}
      ${this.kind === "ingredients"
        ? html`<label>${t("tags")}</label>
            <itadaki-tags .entries=${this.tags || []} .value=${e.tags} lang=${this.lang} .t=${t}
              placeholder=${t("tagSearch")} createLabel=${t("create")}
              @change=${(ev) => this._set("tags", ev.detail.value)} @create=${(ev) => this._createTag(ev.detail.name)}></itadaki-tags>`
        : nothing}
    `;
  }
}
customElements.define("itadaki-entry", ItadakiEntry);
