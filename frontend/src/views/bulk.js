import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import { icon } from "../icons.js";
import { nameOf } from "../catalog.js";
import { deleteRecipes } from "../recipes.js";
import "./ai-task.js";
import "./menu.js";
import "./tags.js";

// What can be done to the selected recipes at once: tags by hand, translate, adapt and
// AI tagging through the same AI card a single recipe uses, and delete. `recipes` are
// the selected list cards, `tags` the recipe tag catalog. Fires `select-all`, `clear`,
// and `done` with {message} once something changed the library or started.
class ItadakiBulk extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    lang: {},
    ai: { type: Boolean },
    languages: { attribute: false },
    instructions: { attribute: false },
    recipes: { attribute: false },
    tags: { attribute: false },
    // "tags", or an AI task as itadaki-ai-task takes it.
    _open: { state: true },
    _add: { state: true },
    _remove: { state: true },
    _busy: { state: true },
    _error: { state: true },
  };

  static styles = [
    shared,
    css`
      :host { display: block; position: sticky; top: var(--header-height, 56px); z-index: 1; margin-bottom: 16px; }
      .bar { display: flex; align-items: center; gap: 4px; padding: 4px 4px 4px 16px; border-radius: 999px;
        background: var(--it-accent); color: var(--it-on-accent); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); }
      .count { flex: 1; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .bar .link { background: none; border: none; color: inherit; font: inherit; cursor: pointer; padding: 8px; text-decoration: underline; white-space: nowrap; }
      .panel { margin-top: 8px; }
      .actions { margin-top: 12px; justify-content: flex-end; }
      @media (max-width: 600px) { .bar .link.all { display: none; } .bar .icon { padding: 8px; } }
    `,
  ];

  get _ids() {
    return this.recipes.map((r) => r.id);
  }

  _toggle(open) {
    this._error = undefined;
    this._open = this._open && JSON.stringify(this._open) === JSON.stringify(open) ? undefined : open;
    if (open === "tags") this._add = this._remove = [];
  }

  _done(message) {
    this._open = undefined;
    this.dispatchEvent(new CustomEvent("done", { detail: { message } }));
  }

  async _act(work) {
    this._busy = true;
    this._error = undefined;
    try {
      await work();
    } catch (err) {
      this._error = this.t.error(err);
    } finally {
      this._busy = false;
    }
  }

  _applyTags() {
    return this._act(async () => {
      const { changed } = await this.api.call("tag_recipes", { recipe_ids: this._ids, add: this._add, remove: this._remove });
      this._done(this.t("taggedN", { n: changed }));
    });
  }

  _delete() {
    const t = this.t;
    return this._act(async () => {
      const deleted = await deleteRecipes(this.api, t, this._ids, t("confirmDeleteN", { n: this._ids.length }));
      if (deleted) this._done(t("deletedN", { n: deleted.length }));
    });
  }

  _started(e) {
    const t = this.t;
    const { draft_ids, skipped = [] } = e.detail;
    this._done([t("startedN", { n: draft_ids.length }), skipped.length ? t("skippedN", { n: skipped.length }) : ""].join(" ").trim());
  }

  // Only tags some selected recipe has can be taken off.
  _tagsPanel() {
    const t = this.t;
    const used = new Set(this.recipes.flatMap((r) => r.tags));
    const picker = (label, entries, value, set) => html`<label>${label}</label>
      <itadaki-tags .entries=${entries} .value=${value} lang=${this.lang} .t=${t} placeholder=${t("tagSearch")}
        @change=${(e) => set(e.detail.value)}></itadaki-tags>`;
    return html`<div class="card panel">
      ${picker(t("addTags"), this.tags, this._add, (v) => (this._add = v))}
      ${picker(t("removeTags"), this.tags.filter((x) => used.has(x.id)), this._remove, (v) => (this._remove = v))}
      <div class="row actions">
        ${this.ai
          ? html`<button class="btn quiet" ?disabled=${this._busy} @click=${() => this._toggle({ action: "tag" })}>${t("tagAi")}</button>`
          : nothing}
        <button class="btn" ?disabled=${this._busy || !(this._add.length || this._remove.length)} @click=${this._applyTags}>${t("apply")}</button>
      </div>
    </div>`;
  }

  render() {
    const t = this.t;
    const button = (name, label, run) => html`<button class="icon" ?disabled=${this._busy} title=${label} aria-label=${label} @click=${run}>${icon(name)}</button>`;
    const translations = this.languages.map((l) => ({
      label: t("translateTo", { lang: t.langName(l) }),
      run: () => this._toggle({ action: "translate", language: l }),
    }));
    const task = this._open && this._open !== "tags" ? this._open : undefined;
    return html`
      <div class="bar">
        <span class="count">${t("selectedN", { n: this.recipes.length })}</span>
        <button class="link all" @click=${() => this.dispatchEvent(new CustomEvent("select-all"))}>${t("selectAll")}</button>
        ${button("tag", t("tags"), () => this._toggle("tags"))}
        ${this.ai ? html`<itadaki-menu icon="translate" label=${t("translate")} .items=${translations} ?disabled=${this._busy}></itadaki-menu>` : nothing}
        ${this.ai ? button("adapt", t("adapt"), () => this._toggle({ action: "adapt" })) : nothing}
        ${button("delete", t("delete"), this._delete)}
        ${button("close", t("clearSelection"), () => this.dispatchEvent(new CustomEvent("clear")))}
      </div>
      ${this._open === "tags" ? this._tagsPanel() : nothing}
      ${task
        ? html`<itadaki-ai-task class="panel" .api=${this.api} .t=${t} .task=${task} .recipeIds=${this._ids}
            .instructions=${this.instructions} @started=${this._started} @cancel=${() => (this._open = undefined)}></itadaki-ai-task>`
        : nothing}
      ${this._error ? html`<div class="card panel error">${this._error}</div>` : nothing}
    `;
  }
}
customElements.define("itadaki-bulk", ItadakiBulk);
