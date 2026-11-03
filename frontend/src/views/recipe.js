import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import "./ai-run.js";
import "./body.js";
import "./busy.js";
import "./menu.js";
import "./page.js";
import { fab, headerButton, icon } from "../icons.js";
import { totalMinutes } from "../recipes.js";
import { describeRequest } from "../drafts.js";

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
    _servings: { state: true },
    _busy: { state: true },
    _error: { state: true },
    _tags: { state: true },
    // The AI action waiting on its card: {action: "adapt"}, {action: "tag"} or
    // {action: "translate", recipeId, language}.
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
      .stepper { display: inline-flex; align-items: center; gap: 8px; }
      .stepper button { width: 32px; height: 32px; padding: 0; }
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
      this._servings = undefined;
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
        this.api.call("get_recipe", { recipe_id: this.recipeId, ...(this._servings ? { servings: this._servings } : {}) }),
        this._tags ?? loadCatalog(this.api, "recipe_tags"),
      ]);
      this._data = data;
      this._tags = tags;
      this._error = undefined;
    } catch (err) {
      this._error = this.t.error(err);
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
      this._error = this.t.error(err);
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
        this._error = this.t.error(err);
        return;
      }
      // Refused because it has translations or variants: ask before taking them too.
      if (!confirm(this.t("confirmDeleteAll"))) return;
      try {
        await this.api.call("delete_recipe", { recipe_id: this.recipeId, cascade: true });
      } catch (err) {
        this._error = this.t.error(err);
        return;
      }
    }
    navigate(this, { view: "list", replace: true });
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
        <button class="icon" aria-label=${this.t("closeCooking")} title=${this.t("closeCooking")}
          @click=${() => (this._cooking = false)}>${icon("close")}</button>
      </header>
      <div class="body"><itadaki-body cooking .recipe=${recipe} .lines=${lines} .t=${this.t}></itadaki-body></div>
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
        run: () => v.id !== recipe.id && navigate(this, { view: "recipe", id: v.id, replace: true }),
      })),
      ...(missing.length ? ["-"] : []),
      ...missing.map((l) => ({
        label: t("translateTo", { lang: t.langName(l) }),
        run: () => (this._task = { action: "translate", recipeId: recipe.id, language: l }),
      })),
    ];
    const button = (name, label, run) => headerButton(name, label, run, this._busy);
    return html`
      ${items.length > 1
        ? html`<itadaki-menu slot="actions" icon="translate" label=${t("language")} .items=${items} ?disabled=${this._busy}></itadaki-menu>`
        : nothing}
      ${button("edit", t("edit"), () => navigate(this, { view: "edit", id: recipe.id }))}
      ${this.ai ? button("tag", t("tagAi"), () => this._toggleTask("tag")) : nothing}
      ${this.ai ? button("adapt", t("adapt"), () => this._toggleTask("adapt")) : nothing}
      ${button("delete", t("delete"), this._delete)}
    `;
  }

  _toggleTask(action) {
    this._task = this._task?.action === action ? undefined : { action };
  }

  _taskCard() {
    const t = this.t;
    const task = this._task;
    const adapt = task.action === "adapt";
    const run = (e) => {
      const { note, asVariant } = e.detail;
      const noted = note ? { note } : {};
      if (adapt) return this._ai("adapt", { recipe_id: this.recipeId, instruction: note, as_variant: asVariant });
      if (task.action === "tag") return this._ai("suggest_tags", { recipe_id: this.recipeId, ...noted });
      this._ai("translate", { recipe_id: task.recipeId, language: task.language, ...noted });
    };
    const heading = { adapt: t("adaptAi"), tag: t("tagAi"), translate: t("translateTo", { lang: t.langName(task.language) }) }[task.action];
    return html`<itadaki-ai-run class="adapt" .t=${t} cancellable ?variant=${adapt} ?noteRequired=${adapt}
      heading=${heading} .standing=${this.instructions[task.action]} ?disabled=${this._busy}
      @run=${run} @cancel=${() => (this._task = undefined)}>
      ${task.again ? html`<div class="muted">${t("retranslateNote")}</div>` : nothing}
      ${task.action === "tag" ? html`<div class="muted">${t("tagAiExplain")}</div>` : nothing}
    </itadaki-ai-run>`;
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
            ${recipe.servings
              ? html`<span class="stepper">
                  <button class="btn quiet" @click=${() => this._scale(-1)}>−</button>
                  <span>${recipe.servings} ${t("servings")}</span>
                  <button class="btn quiet" @click=${() => this._scale(1)}>+</button>
                </span>`
              : nothing}
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
              ? html`<button class="btn quiet" ?disabled=${this._busy}
                  @click=${() => (this._task = { action: "translate", recipeId: parent.id, language: recipe.language, again: true })}>${t("retranslate")}</button>`
              : nothing}
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
      ${this._busy ? html`<itadaki-busy .text=${t("working")}></itadaki-busy>` : nothing}
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}

      <itadaki-body .recipe=${recipe} .lines=${lines} .t=${t}></itadaki-body>

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
