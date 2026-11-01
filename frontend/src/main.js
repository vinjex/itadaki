import { LitElement, html, css, nothing } from "lit";
import { shared } from "./styles.js";
import { translator, uiLanguage } from "./i18n.js";
import { hassTransport } from "./transport.js";
import { back, go, viewFor } from "./router.js";
import "./views/page.js";
import "./views/list.js";
import "./views/recipe.js";
import "./views/import.js";
import "./views/draft.js";
import "./views/edit.js";
import "./views/catalog.js";
import "./views/manage.js";
import "./views/languages.js";
import "./views/ai.js";

const MANAGE_VIEWS = new Set(["manage", "languages", "catalog", "ai"]);

class ItadakiPanel extends LitElement {
  static properties = {
    hass: { attribute: false },
    narrow: { type: Boolean },
    route: { attribute: false },
    _settings: { state: true },
    _error: { state: true },
  };

  static styles = [
    shared,
    css`
      :host { display: block; min-height: 100vh; background: var(--primary-background-color, #f2f2f7); }
    `,
  ];

  constructor() {
    super();
    this.api = hassTransport(() => this.hass);
  }

  // The library's languages, its standing AI instructions and whether AI is set up
  // shape most screens, so nothing renders before they are known.
  willUpdate() {
    if (this.hass && !this._loading) {
      this._loading = Promise.all([this.api.call("get_settings"), this.api.call("get_ai_settings")])
        .then(([library, ai]) => (this._settings = { languages: library.languages, instructions: library.instructions, ai: ai.enabled }))
        .catch((err) => (this._error = err.message));
    }
  }

  get _prefix() {
    return this.route?.prefix ?? "/itadaki";
  }

  _navigate(e) {
    const { view, replace } = e.detail;
    if (view === "back") back(this._prefix);
    else go(this._prefix, e.detail, replace);
  }

  render() {
    if (!this.hass) return nothing;
    const lang = uiLanguage(this.hass);
    const t = translator(lang);
    return html`
      <div @navigate=${this._navigate} @settings-changed=${(e) => (this._settings = { ...this._settings, ...e.detail })}>
        ${this._settings
          ? this._screen(viewFor(this.route?.path), t, lang)
          : html`<itadaki-page .t=${t} home ?narrow=${this.narrow}>
              ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
            </itadaki-page>`}
      </div>
    `;
  }

  _screen(v, t, lang) {
    const { languages, instructions, ai } = this._settings;
    const admin = Boolean(this.hass.user?.is_admin);
    // Library management is for admins; the server refuses their changes anyway.
    if (!admin && MANAGE_VIEWS.has(v.view)) v = { view: "list" };
    switch (v.view) {
      case "recipe": return html`<itadaki-recipe .api=${this.api} .t=${t} lang=${lang} .languages=${languages} ?ai=${ai} .instructions=${instructions} .recipeId=${v.id}></itadaki-recipe>`;
      case "import": return html`<itadaki-import .api=${this.api} .t=${t} ?ai=${ai} .instructions=${instructions}></itadaki-import>`;
      case "new":
      case "edit": return html`<itadaki-edit .api=${this.api} .t=${t} lang=${lang} .languages=${languages} .recipeId=${v.id}></itadaki-edit>`;
      case "draft": return html`<itadaki-draft .api=${this.api} .t=${t} lang=${lang} .languages=${languages} ?ai=${ai} .instructions=${instructions} .draftId=${v.id}></itadaki-draft>`;
      case "manage": return html`<itadaki-manage .t=${t}></itadaki-manage>`;
      case "languages": return html`<itadaki-languages .api=${this.api} .t=${t} .languages=${languages}></itadaki-languages>`;
      case "ai": return html`<itadaki-ai .api=${this.api} .t=${t}></itadaki-ai>`;
      case "catalog": return html`<itadaki-catalog .api=${this.api} .t=${t} lang=${lang} .languages=${languages} kind=${v.id}></itadaki-catalog>`;
      default: return html`<itadaki-list .api=${this.api} .t=${t} lang=${lang} ?narrow=${this.narrow} ?admin=${admin}></itadaki-list>`;
    }
  }
}
customElements.define("itadaki-panel", ItadakiPanel);
