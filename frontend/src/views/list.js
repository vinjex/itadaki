import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import { navigate } from "../router.js";
import { headerButton } from "../icons.js";
import "./page.js";
import "./text.js";
import "./tags.js";
import { describeRequest } from "../drafts.js";
import { byName, loadCatalog, nameOf } from "../catalog.js";

// The search and tag filter outlive the screen, so opening a recipe and coming back
// keeps them. Reloading the panel clears them.
const remembered = { query: "", tags: [], excluded: [] };

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
    _tags: { state: true },
    _filter: { state: true },
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
      .filter { margin: -8px 0 20px; max-width: 480px; }
      .filter .muted { font-size: 0.8rem; margin-top: 6px; }
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
    this._query = remembered.query;
    this._filter = { tags: remembered.tags, excluded: remembered.excluded };
    this._load();
    this._loadTags();
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

  // Recipe and ingredient tags in one picker: a recipe matches an ingredient tag
  // through any ingredient it uses.
  async _loadTags() {
    try {
      const [recipe, ingredient] = await Promise.all([loadCatalog(this.api, "recipe_tags"), loadCatalog(this.api, "ingredient_tags")]);
      this._tags = [...recipe, ...ingredient].sort(byName(this.lang));
    } catch (err) {
      this._error = this.t.error(err);
    }
  }

  _setFilter({ value, excluded }) {
    this._filter = { tags: value, excluded };
    Object.assign(remembered, this._filter);
    this._load();
  }

  async _load() {
    const { tags, excluded } = this._filter;
    try {
      const res = await this.api.call("list_recipes", {
        prefer_language: this.lang,
        query: this._query || undefined,
        ...(tags.length ? { tags } : {}),
        ...(excluded.length ? { exclude_tags: excluded } : {}),
      });
      this._recipes = res.recipes;
      this._error = undefined;
    } catch (err) {
      this._error = this.t.error(err);
    }
  }

  async _loadDrafts() {
    try {
      this._drafts = (await this.api.call("list_drafts")).drafts;
    } catch (err) {
      this._error = this.t.error(err);
    }
  }

  _search(e) {
    this._query = remembered.query = e.target.value;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._load(), 250);
  }

  get _filtered() {
    return Boolean(this._filter.tags.length || this._filter.excluded.length);
  }

  _filterBox() {
    const t = this.t;
    const hint = (tag) => ({ name: nameOf(tag, this.lang), hint: tag.kind === "ingredient" ? t("ingredientTag") : "" });
    return html`<div class="filter">
      <itadaki-tags toggleable .entries=${this._tags} .value=${this._filter.tags} .excluded=${this._filter.excluded}
        lang=${this.lang} .hint=${hint} .t=${t} placeholder=${t("tagFilter")} @change=${(e) => this._setFilter(e.detail)}></itadaki-tags>
      ${this._filtered ? html`<div class="muted">${t("tagFilterHint")}</div>` : nothing}
    </div>`;
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
      ${this._tags?.length ? this._filterBox() : nothing}
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
      ${this._recipes?.length === 0 && !this._query && !this._filtered ? html`<p class="muted">${t("empty")}</p>` : nothing}
      ${this._recipes?.length === 0 && this._filtered ? html`<p class="muted">${t("noMatches")}</p>` : nothing}
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
