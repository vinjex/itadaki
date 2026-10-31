import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import "./body.js";
import "./busy.js";
import "./menu.js";
import "./page.js";
import { icon } from "../icons.js";
import { describeRequest } from "../drafts.js";

import { navigate } from "../router.js";

class ItadakiRecipe extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    lang: {},
    languages: { attribute: false },
    ai: { type: Boolean },
    recipeId: {},
    _data: { state: true },
    _servings: { state: true },
    _busy: { state: true },
    _error: { state: true },
    _adapting: { state: true },
    _drafts: { state: true },
  };

  static styles = [
    shared,
    css`
      .hero { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 16px; }
      .hero img { width: 180px; height: 135px; object-fit: cover; border-radius: var(--it-radius); flex-shrink: 0; }
      @media (max-width: 600px) { .hero { flex-direction: column; } .hero img { width: 100%; height: 200px; } }
      h1 { margin: 0 0 8px; font-size: 1.6rem; }
      .meta { margin: 8px 0; }
      .stepper { display: inline-flex; align-items: center; gap: 8px; }
      .stepper button { width: 32px; height: 32px; padding: 0; }
      .adapt { margin-bottom: 16px; }
      .variants { margin-top: 16px; }
      .drafts { margin-bottom: 16px; }
      .draft { display: flex; gap: 10px; align-items: center; width: 100%; text-align: left; font: inherit;
        color: inherit; background: none; border: none; padding: 8px 0; cursor: pointer; }
      .draft:hover { color: var(--it-accent); }
      .chip.ready { background: var(--it-accent); color: var(--it-on-accent); }
      .chip.failed { background: color-mix(in srgb, var(--it-error) 18%, transparent); }
      a { color: var(--it-accent); }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._unsubscribe = this.api.subscribeDrafts(() => this._loadDrafts());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribe?.then((stop) => stop());
  }

  updated(changed) {
    if (changed.has("recipeId")) {
      this._servings = undefined;
      this._adapting = false;
      this._load();
      this._loadDrafts();
    }
  }

  async _loadDrafts() {
    try {
      this._drafts = (await this.api.call("list_drafts", { recipe_id: this.recipeId })).drafts;
    } catch {
      this._drafts = [];
    }
  }

  async _load() {
    try {
      this._data = await this.api.call("get_recipe", {
        recipe_id: this.recipeId,
        ...(this._servings ? { servings: this._servings } : {}),
      });
      this._error = undefined;
    } catch (err) {
      this._error = err.message;
    }
  }

  _scale(delta) {
    const current = this._servings || this._data.recipe.servings;
    this._servings = Math.max(1, current + delta);
    this._load();
  }

  async _ai(action, data) {
    this._busy = true;
    this._error = undefined;
    try {
      const { draft_id } = await this.api.call(action, data);
      navigate(this, { view: "draft", id: draft_id });
    } catch (err) {
      this._error = err.message;
    } finally {
      this._busy = false;
    }
  }

  async _delete() {
    if (!confirm(this.t("confirmDelete"))) return;
    try {
      await this.api.call("delete_recipe", { recipe_id: this.recipeId });
    } catch (err) {
      if (err.key !== "in_use") {
        this._error = err.message;
        return;
      }
      // Refused because it has translations or variants: ask before taking them too.
      if (!confirm(this.t("confirmDeleteAll"))) return;
      try {
        await this.api.call("delete_recipe", { recipe_id: this.recipeId, cascade: true });
      } catch (err) {
        this._error = err.message;
        return;
      }
    }
    navigate(this, { view: "list", replace: true });
  }

  render() {
    return html`<itadaki-page .t=${this.t}>${this._data ? this._actions() : nothing}${this._content()}</itadaki-page>`;
  }

  // Header icons: the language menu switches between this dish's versions and
  // starts translations into the library languages it is still missing.
  _actions() {
    const t = this.t;
    const { recipe, translations } = this._data;
    const versions = [{ id: recipe.id, language: recipe.language }, ...translations].sort((a, b) =>
      a.language.localeCompare(b.language),
    );
    const missing = this.ai ? this.languages.filter((l) => !versions.some((v) => v.language === l)) : [];
    const items = [
      ...versions.map((v) => ({
        label: t.langName(v.language),
        active: v.id === recipe.id,
        run: () => v.id !== recipe.id && navigate(this, { view: "recipe", id: v.id, replace: true }),
      })),
      ...(missing.length ? ["-"] : []),
      ...missing.map((l) => ({
        label: t("translateTo", { lang: t.langName(l) }),
        run: () => this._ai("translate", { recipe_id: recipe.id, language: l }),
      })),
    ];
    const button = (name, label, run) => html`<button slot="actions" class="icon" ?disabled=${this._busy}
      aria-label=${label} title=${label} @click=${run}>${icon(name)}</button>`;
    return html`
      ${items.length > 1
        ? html`<itadaki-menu slot="actions" icon="translate" label=${t("language")} .items=${items} ?disabled=${this._busy}></itadaki-menu>`
        : nothing}
      ${button("edit", t("edit"), () => navigate(this, { view: "edit", id: recipe.id }))}
      ${this.ai ? button("adapt", t("adapt"), () => (this._adapting = !this._adapting)) : nothing}
      ${button("delete", t("delete"), this._delete)}
    `;
  }

  _content() {
    const t = this.t;
    if (!this._data) return this._error ? html`<div class="error">${this._error}</div>` : html`<itadaki-busy></itadaki-busy>`;
    const { recipe, lines_text, variants, stale, parent } = this._data;
    const minutes = recipe.total_minutes || (recipe.prep_minutes || 0) + (recipe.cook_minutes || 0);

    return html`
      <div class="hero">
        ${recipe.image_url ? html`<img src=${recipe.image_url} alt="" referrerpolicy="no-referrer" />` : nothing}
        <div>
          <h1>${recipe.title}</h1>
          ${recipe.description ? html`<div class="muted">${recipe.description}</div>` : nothing}
          <div class="row meta">
            <span class="chip">${t.langName(recipe.language)}</span>
            ${recipe.relation === "variant" && parent
              ? html`<button class="chip" @click=${() => navigate(this, { view: "recipe", id: parent.id })}>
                  ${t("variant")}: ${parent.title}</button>`
              : nothing}
            ${minutes ? html`<span class="chip">${t("minutes", { n: minutes })}</span>` : nothing}
            ${recipe.servings
              ? html`<span class="stepper">
                  <button class="btn quiet" @click=${() => this._scale(-1)}>−</button>
                  <span>${recipe.servings} ${t("servings")}</span>
                  <button class="btn quiet" @click=${() => this._scale(1)}>+</button>
                </span>`
              : nothing}
          </div>
          ${recipe.source_url ? html`<div class="muted"><a href=${recipe.source_url} target="_blank" rel="noreferrer">${t("source")}</a></div>` : nothing}
        </div>
      </div>

      ${stale
        ? html`<div class="banner row">${t("stale")}
            ${this.ai
              ? html`<button class="btn quiet" ?disabled=${this._busy}
                  @click=${() => this._ai("translate", { recipe_id: parent.id, language: recipe.language })}>${t("retranslate")}</button>`
              : nothing}
          </div>`
        : nothing}

      ${this._adapting ? this._renderAdapt() : nothing}
      ${this._drafts?.length
        ? html`<div class="card drafts">
            <h2>${t("inProgress")}</h2>
            ${this._drafts.map(
              (d) => html`<button class="draft" @click=${() => navigate(this, { view: "draft", id: d.id })}>
                <span class="chip ${d.status}">${t.status(d.status)}</span>
                <span>${t.action(d.action)}${describeRequest(t, d) ? ` · ${describeRequest(t, d)}` : ""}</span>
              </button>`,
            )}
          </div>`
        : nothing}
      ${this._busy ? html`<itadaki-busy .text=${t("working")}></itadaki-busy>` : nothing}
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}

      <itadaki-body .recipe=${recipe} .lines=${lines_text} .t=${t}></itadaki-body>

      ${variants.length
        ? html`<div class="card variants">
            <h2>${t("variants")}</h2>
            <div class="row">${variants.map(
              (v) => html`<button class="chip" @click=${() => navigate(this, { view: "recipe", id: v.id })}>${v.title}</button>`,
            )}</div>
          </div>`
        : nothing}
    `;
  }

  _renderAdapt() {
    const t = this.t;
    const run = () => {
      const instruction = this.renderRoot.querySelector("#instruction").value.trim();
      if (!instruction) return;
      const asVariant = this.renderRoot.querySelector("#variant").checked;
      this._ai("adapt", { recipe_id: this.recipeId, instruction, as_variant: asVariant });
    };
    return html`
      <div class="card adapt">
        <textarea id="instruction" rows="2" placeholder=${t("adaptHint")}></textarea>
        <div class="row" style="margin-top:12px;justify-content:space-between">
          <label class="row" style="margin:0"><input type="checkbox" id="variant" /> ${t("asVariant")}</label>
          <button class="btn" ?disabled=${this._busy} @click=${run}>${t("run")}</button>
        </div>
      </div>
    `;
  }
}
customElements.define("itadaki-recipe", ItadakiRecipe);
