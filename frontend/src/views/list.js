import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import { navigate } from "../router.js";
import { headerButton } from "../icons.js";
import "./page.js";
import "./text.js";
import { describeRequest } from "../drafts.js";

class ItadakiList extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    lang: {},
    narrow: { type: Boolean },
    admin: { type: Boolean },
    _recipes: { state: true },
    _drafts: { state: true },
    _query: { state: true },
    _error: { state: true },
  };

  static styles = [
    shared,
    css`
      .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
      .recipe { cursor: pointer; display: flex; flex-direction: column; gap: 8px; min-height: 96px; }
      .recipe:hover { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
      .recipe .name { font-weight: 600; font-size: 1.05rem; }
      .tools { display: flex; gap: 12px; margin-bottom: 20px; }
      .tools input { flex: 1; }
      .inbox { margin-bottom: 24px; }
      .request { font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .photo { padding: 0 0 16px; overflow: hidden; }
      .photo > :not(img):not(.placeholder) { padding: 0 16px; }
      .photo img, .photo .placeholder { width: 100%; height: 150px; object-fit: cover; display: block; margin-bottom: 4px; }
      .photo .placeholder { background: linear-gradient(135deg, var(--it-soft), transparent); }
      .chip.ready { background: var(--it-accent); color: var(--it-on-accent); }
      .chip.failed { background: color-mix(in srgb, var(--it-error) 18%, transparent); }
      @media (max-width: 600px) {
        .grid { gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .recipe:not(.photo) { padding: 12px; }
        .photo { padding-bottom: 12px; }
        .photo > :not(img):not(.placeholder) { padding: 0 10px; }
        .photo img, .photo .placeholder { height: 110px; }
        .recipe .name { font-size: 0.95rem; }
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._query = "";
    this._load();
    this._loadDrafts();
    this._unsubscribe = this.api.subscribeDrafts((update) => {
      this._loadDrafts();
      if (update.status === "saved") this._load();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribe?.then((stop) => stop());
  }

  async _load() {
    try {
      const res = await this.api.call("list_recipes", { prefer_language: this.lang, query: this._query || undefined });
      this._recipes = res.recipes;
      this._error = undefined;
    } catch (err) {
      this._error = err.message;
    }
  }

  async _loadDrafts() {
    try {
      this._drafts = (await this.api.call("list_drafts")).drafts;
    } catch (err) {
      this._error = err.message;
    }
  }

  _search(e) {
    this._query = e.target.value;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._load(), 250);
  }

  _open(id) {
    navigate(this, { view: "recipe", id });
  }

  render() {
    const t = this.t;
    return html`<itadaki-page .t=${t} header=${t("recipes")} home ?narrow=${this.narrow}>
      ${this.admin
        ? headerButton("cog", t("manage"), () => navigate(this, { view: "manage" }))
        : nothing}
      <div class="tools">
        <itadaki-text style="flex:1" .value=${this._query} placeholder=${t("search")} @input=${this._search}></itadaki-text>
        <button class="btn" @click=${() => navigate(this, { view: "new" })}>${t("newRecipe")}</button>
        <button class="btn" @click=${() => navigate(this, { view: "import" })}>${t("import")}</button>
      </div>
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      ${this._drafts?.length
        ? html`<h2>${t("drafts")}</h2>
            <div class="grid inbox">
              ${this._drafts.map(
                (d) => html`
                  <div class="card recipe" @click=${() => navigate(this, { view: "draft", id: d.id })}>
                    <div class="name">${d.title}</div>
                    ${describeRequest(t, d) ? html`<div class="muted request">${describeRequest(t, d)}</div>` : nothing}
                    <div class="row">
                      <span class="chip">${t.action(d.action)}</span>
                      <span class="chip ${d.status}">${t.status(d.status)}</span>
                    </div>
                  </div>
                `,
              )}
            </div>
            <h2>${t("recipes")}</h2>`
        : nothing}
      ${this._recipes?.length === 0 && !this._query ? html`<p class="muted">${t("empty")}</p>` : nothing}
      <div class="grid">
        ${(this._recipes || []).map(
          (r) => html`
            <div class="card recipe photo" @click=${() => this._open(r.id)}>
              ${r.image_url
                ? html`<img src=${r.image_url} alt="" loading="lazy" referrerpolicy="no-referrer" />`
                : html`<div class="placeholder"></div>`}
              <div class="name">${r.title}</div>
              <div class="row">
                ${r.language !== this.lang ? html`<span class="chip">${t.langName(r.language)}</span>` : nothing}
                ${r.relation === "variant" ? html`<span class="chip">${t("variant")}</span>` : nothing}
              </div>
            </div>
          `,
        )}
      </div>
    </itadaki-page>`;
  }
}
customElements.define("itadaki-list", ItadakiList);
