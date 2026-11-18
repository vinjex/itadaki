import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import "./ai-task.js";
import "./amount.js";
import "./shopping.js";
import "./body.js";
import "./busy.js";
import "./menu.js";
import "./page.js";
import { fab, headerButton, icon } from "../icons.js";
import { deleteRecipes, totalMinutes } from "../recipes.js";
import { describeRequest } from "../drafts.js";
import { cleanFactor, storedFactor, storeFactor } from "../scale.js";

import { navigate } from "../router.js";
import { loadCatalog, nameOf } from "../catalog.js";

class ItadakiRecipe extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    lang: {},
    languages: { attribute: false },
    ai: { type: Boolean },
    instructions: { attribute: false },
    recipeId: {},
    _data: { state: true },
    // How many times the recipe is shown: a preview, never saved to the recipe.
    _factor: { state: true },
    _shopping: { state: true },
    _notice: { state: true },
    _error: { state: true },
    _tags: { state: true },
    // The AI action waiting on its card, as itadaki-ai-task takes it.
    _task: { state: true },
    _drafts: { state: true },
    _cooking: { state: true },
  };

  static styles = [
    shared,
    css`
      .hero { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 16px; }
      .hero img { width: 180px; height: 135px; object-fit: cover; border-radius: var(--it-radius); flex-shrink: 0; }
      @media (max-width: 600px) { .hero { flex-direction: column; } .hero img { width: 100%; height: 200px; } }
      h1 { margin: 0 0 8px; font-size: 1.6rem; }
      .meta { margin: 8px 0; }
      .cart { padding: 8px; }
      .cart.on { background: var(--it-accent); color: var(--it-on-accent); }
      .scale svg { width: 14px; height: 14px; fill: currentColor; }
      .adapt { margin-bottom: 16px; }
      .variants { margin-top: 16px; }
      .drafts { margin-bottom: 16px; }
      .draft { display: flex; gap: 10px; align-items: center; width: 100%; text-align: left; font: inherit;
        color: inherit; background: none; border: none; padding: 8px 0; cursor: pointer; }
      .draft:hover { color: var(--it-accent); }
      .chip.tag { background: none; border: 1px solid var(--it-divider); }
      .chip.ready { background: var(--it-accent); color: var(--it-on-accent); }
      .chip.failed { background: color-mix(in srgb, var(--it-error) 18%, transparent); }
      a { color: var(--it-accent); }
      .cooking { position: fixed; inset: 0; z-index: 10; overflow-y: auto;
        background: var(--primary-background-color, #f2f2f7); }
      .cooking header { position: sticky; top: 0; z-index: 1; display: flex; align-items: center; gap: 8px;
        padding: 4px 4px 4px 20px; background: var(--primary-background-color, #f2f2f7); }
      .cooking h1 { flex: 1; min-width: 0; margin: 0; font-size: 1.5rem; }
      .cooking .body { max-width: 1100px; margin: 0 auto; padding: 8px 16px 32px; }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._unsubscribe = this.api.subscribeDrafts(() => this._loadDrafts());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribe?.then((stop) => stop());
    this._keepAwake(false);
  }

  // The browser drops the lock whenever the page is hidden, so it is taken again on return.
  _keepAwake(on) {
    document.removeEventListener("visibilitychange", this._onVisible);
    this._wakeLock?.then((lock) => lock?.release());
    this._wakeLock = undefined;
    if (!on || !navigator.wakeLock) return;
    this._onVisible ??= () => document.visibilityState === "visible" && this._keepAwake(true);
    document.addEventListener("visibilitychange", this._onVisible);
    this._wakeLock = navigator.wakeLock.request("screen").catch(() => undefined);
  }

  updated(changed) {
    if (changed.has("_cooking")) this._keepAwake(Boolean(this._cooking));
    if (changed.has("recipeId")) {
      this._factor = storedFactor(this.recipeId);
      this._shopping = false;
      this._notice = undefined;
      this._task = undefined;
      this._cooking = false;
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
      const [data, tags] = await Promise.all([
        this.api.call("get_recipe", { recipe_id: this.recipeId, factor: this._factor }),
        this._tags ?? loadCatalog(this.api, "recipe_tags"),
      ]);
      this._data = data;
      this._tags = tags;
      this._error = undefined;
    } catch (err) {
      this._error = this.t.error(err);
    }
  }

  // Every way of scaling (the yield, any ingredient's amount) ends here as a ratio
  // to what is shown now, so they all move the one factor.
  _scale(ratio) {
    this._setFactor(cleanFactor(this._factor * ratio));
  }

  _setFactor(factor) {
    this._factor = factor;
    storeFactor(this.recipeId, factor);
    this._load();
  }

  _scaleChip() {
    if (this._factor === 1) return nothing;
    const label = this.t("resetScale");
    return html`<button class="chip active scale" title=${label} aria-label=${label} @click=${() => this._setFactor(1)}>
      ${this.t("scaled", { n: Math.round(this._factor * 100) / 100 })} ${icon("close")}</button>`;
  }

  _yield() {
    const t = this.t;
    const { recipe, yield: parts } = this._data;
    const shown = recipe.yield_quantity;
    if (!shown) return nothing;
    const n = Math.round(shown * 100) / 100;
    const to = (value) => this._scale(value / shown);
    return html`<itadaki-amount .value=${shown} text=${parts ? t("makes", { measure: parts.measure }) : t("serves", { n })}
      unit=${parts ? parts.unit : t("people")} label=${t("yield")} @amount=${(e) => to(e.detail.value)}></itadaki-amount>`;
  }

  // The original changed in a way this translation does not need to follow.
  async _keepTranslation() {
    try {
      await this.api.call("mark_translation_synced", { recipe_id: this.recipeId });
      await this._load();
    } catch (err) {
      this._error = this.t.error(err);
    }
  }

  async _delete() {
    try {
      if (await deleteRecipes(this.api, this.t, [this.recipeId], this.t("confirmDelete"))) navigate(this, { view: "list", replace: true });
    } catch (err) {
      this._error = this.t.error(err);
    }
  }

  render() {
    if (this._cooking) return this._cookingMode();
    return html`<itadaki-page .t=${this.t}>${this._data ? this._actions() : nothing}${this._content()}</itadaki-page>
      ${this._data
        ? fab("cook", this.t("cook"), () => (this._cooking = true))
        : nothing}`;
  }

  // Only what is needed at the stove, large enough to read from a distance.
  _cookingMode() {
    const { recipe, lines } = this._data;
    return html`<div class="cooking">
      <header>
        <h1>${recipe.title}</h1>
        ${this._scaleChip()}
        <button class="icon" aria-label=${this.t("closeCooking")} title=${this.t("closeCooking")}
          @click=${() => (this._cooking = false)}>${icon("close")}</button>
      </header>
      <div class="body"><itadaki-body cooking scalable .recipe=${recipe} .lines=${lines} .t=${this.t}
        @scale=${(e) => this._scale(e.detail.ratio)}></itadaki-body></div>
    </div>`;
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
        // The same dish in another language keeps the scale it is shown at.
        run: () => v.id !== recipe.id && (storeFactor(v.id, this._factor), navigate(this, { view: "recipe", id: v.id, replace: true })),
      })),
      ...(missing.length ? ["-"] : []),
      ...missing.map((l) => ({
        label: t("translateTo", { lang: t.langName(l) }),
        run: () => (this._task = { action: "translate", language: l }),
      })),
    ];
    return html`
      ${items.length > 1
        ? html`<itadaki-menu slot="actions" icon="translate" label=${t("language")} .items=${items}></itadaki-menu>`
        : nothing}
      ${headerButton("edit", t("edit"), () => navigate(this, { view: "edit", id: recipe.id }))}
      ${this.ai ? headerButton("tag", t("tagAi"), () => this._toggleTask("tag")) : nothing}
      ${this.ai ? headerButton("adapt", t("adapt"), () => this._toggleTask("adapt")) : nothing}
      ${headerButton("delete", t("delete"), this._delete)}
    `;
  }

  _toggleTask(action) {
    this._task = this._task?.action === action ? undefined : { action };
  }

  _taskCard() {
    // Translating a recipe is from that recipe; re-translating is from the parent.
    const source = this._task.again ? this._data.parent.id : this.recipeId;
    return html`<itadaki-ai-task class="adapt" .api=${this.api} .t=${this.t} .task=${this._task}
      .recipeIds=${[source]} .instructions=${this.instructions}
      @started=${this._started} @cancel=${() => (this._task = undefined)}></itadaki-ai-task>`;
  }

  _started(e) {
    const [draftId] = e.detail.draft_ids;
    if (draftId) navigate(this, { view: "draft", id: draftId });
    else this._error = this.t("nothingToTranslate");
  }

  _content() {
    const t = this.t;
    if (!this._data) return this._error ? html`<div class="error">${this._error}</div>` : html`<itadaki-busy></itadaki-busy>`;
    const { recipe, lines, variants, stale, parent } = this._data;
    const minutes = totalMinutes(recipe);

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
            ${this._yield()}
            ${this._scaleChip()}
          </div>
          ${recipe.tags.length
            ? html`<div class="row meta">${recipe.tags.map((id) => {
                const tag = this._tags.find((x) => x.id === id);
                return html`<span class="chip tag">${tag ? nameOf(tag, recipe.language) : id}</span>`;
              })}</div>`
            : nothing}
          ${recipe.source_url ? html`<div class="muted"><a href=${recipe.source_url} target="_blank" rel="noreferrer">${t("source")}</a></div>` : nothing}
        </div>
      </div>

      ${stale
        ? html`<div class="banner row">${t("stale")}
            ${this.ai
              ? html`<button class="btn quiet"
                  @click=${() => (this._task = { action: "translate", language: recipe.language, again: true })}>${t("retranslate")}</button>`
              : nothing}
            <button class="btn quiet" title=${t("keepTranslationHint")} @click=${this._keepTranslation}>${t("keepTranslation")}</button>
          </div>`
        : nothing}

      ${this._task ? this._taskCard() : nothing}
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
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}

      <itadaki-body scalable .recipe=${recipe} .lines=${lines} .t=${t} @scale=${(e) => this._scale(e.detail.ratio)}>
        <button slot="ingredients-action" class="icon cart ${this._shopping ? "on" : ""}" aria-label=${t("toShoppingList")}
          title=${t("toShoppingList")} aria-pressed=${this._shopping ? "true" : "false"}
          @click=${() => ((this._shopping = !this._shopping), (this._notice = undefined))}>${icon("cart")}</button>
        ${this._notice ? html`<div slot="ingredients-note" class="muted">${this._notice}</div>` : nothing}
        ${this._shopping
          ? html`<itadaki-shopping slot="ingredients" .api=${this.api} .t=${t} recipeId=${recipe.id} .factor=${this._factor}
              subject=${recipe.title} @cancel=${() => (this._shopping = false)}
              @added=${(e) => ((this._shopping = false), (this._notice = e.detail.message))}></itadaki-shopping>`
          : nothing}
      </itadaki-body>

      ${variants.length
        ? html`<div class="card variants">
            <h2>${t("variants")}</h2>
            <div class="row">${variants.map(
              (v) => html`<button class="chip" @click=${() => navigate(this, { view: "recipe", id: v.id })}>${v.title}</button>`,
            )}</div>
          </div>`
        : nothing}
      <div class="fab-space"></div>
    `;
  }
}
customElements.define("itadaki-recipe", ItadakiRecipe);
