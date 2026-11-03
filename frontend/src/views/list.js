import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import { navigate } from "../router.js";
import { fab, headerButton, icon } from "../icons.js";
import { totalMinutes } from "../recipes.js";
import "./page.js";
import "./text.js";
import "./tags.js";
import { describeRequest } from "../drafts.js";
import { byName, loadCatalog, nameOf } from "../catalog.js";

// The search outlives the screen, so opening a recipe and coming back keeps it.
// Reloading the panel clears it.
const remembered = { query: "", tags: [], searching: false };

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
    _searching: { state: true },
    _error: { state: true },
  };

  static styles = [
    shared,
    css`
      .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
      .recipe { cursor: pointer; display: flex; flex-direction: column; gap: 8px; min-height: 96px; }
      .recipe:hover { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
      .recipe .name { font-weight: 600; font-size: 1.05rem; }
      .search { max-width: 560px; }
      .chosen { margin-bottom: 8px; }
      .meta { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; font-size: 0.8rem; color: var(--it-muted); }
      .meta span { display: inline-flex; align-items: center; gap: 3px; min-width: 0; }
      .meta svg { width: 15px; height: 15px; fill: currentColor; flex-shrink: 0; }
      .meta .chip { padding: 2px 8px; font-size: 0.75rem; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; }
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
    this._filter = remembered.tags;
    this._searching = remembered.searching;
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

  _setFilter(tags) {
    this._filter = remembered.tags = tags;
    this._load();
  }

  async _load() {
    const tags = this._filter;
    try {
      const res = await this.api.call("list_recipes", {
        prefer_language: this.lang,
        query: this._query || undefined,
        ...(tags.length ? { tags } : {}),
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

  _search(text) {
    this._query = remembered.query = text;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._load(), 250);
  }

  // Opening the search moves the cursor into it, once the box has drawn. Closing it
  // clears the text and the tags, so nothing filters the list unseen.
  async _setSearching(on) {
    this._searching = remembered.searching = on;
    if (on) {
      await this.updateComplete;
      const box = this.renderRoot.querySelector(".search");
      await box.updateComplete;
      box.focus();
    } else if (this._query || this._filtered) {
      this._query = remembered.query = "";
      this._setFilter([]);
    }
  }

  get _filtered() {
    return this._filter.length > 0;
  }

  // Free text searches titles; recipe and ingredient tags are suggested as you type,
  // and a recipe matches an ingredient tag through any ingredient it uses. The box
  // sits in the header and the chosen tags under it: two halves of one picker.
  _tagBar(only) {
    const t = this.t;
    const hint = (tag) => ({ name: nameOf(tag, this.lang), hint: tag.kind === "ingredient" ? t("ingredientTag") : "" });
    return html`<itadaki-tags slot=${only === "box" ? "title" : nothing} class=${only === "box" ? "search" : "chosen"}
      only=${only} freeText .entries=${this._tags || []}
      .value=${this._filter} .text=${this._query} lang=${this.lang} .hint=${hint} .t=${t}
      placeholder=${t("search")} @text=${(e) => this._search(e.detail.value)} @change=${(e) => this._setFilter(e.detail.value)}></itadaki-tags>`;
  }

  // A language icon when the dish has translations (their names show on hover), the
  // time, and the first tag with a count of the others.
  _meta(r) {
    const t = this.t;
    const minutes = totalMinutes(r);
    const tag = r.tags.length ? this._tags?.find((x) => x.id === r.tags[0]) : undefined;
    return html`<div class="meta">
      ${r.languages.length > 1
        ? html`<span title=${r.languages.map((l) => t.langName(l)).join(", ")}>${icon("translate")}</span>`
        : nothing}
      ${minutes ? html`<span>${icon("clock")}${t("minutes", { n: minutes })}</span>` : nothing}
      ${r.relation === "variant" ? html`<span class="chip">${t("variant")}</span>` : nothing}
      ${tag ? html`<span class="chip">${nameOf(tag, this.lang)}</span>` : nothing}
      ${r.tags.length > 1 ? html`<span>+${r.tags.length - 1}</span>` : nothing}
    </div>`;
  }

  _open(id) {
    navigate(this, { view: "recipe", id });
  }

  render() {
    const t = this.t;
    return html`<itadaki-page .t=${t} header=${t("recipes")} home ?narrow=${this.narrow}>
      ${this._searching
        ? html`${this._tagBar("box")}${headerButton("close", t("closeSearch"), () => this._setSearching(false))}`
        : headerButton("search", t("search"), () => this._setSearching(true))}
      ${this.admin
        ? headerButton("cog", t("manage"), () => navigate(this, { view: "manage" }))
        : nothing}
      ${this._filtered ? this._tagBar("chips") : nothing}
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
      ${this._recipes?.length === 0 && (this._filtered || this._query) ? html`<p class="muted">${t("noMatches")}</p>` : nothing}
      <div class="grid">
        ${(this._recipes || []).map(
          (r) => html`
            <div class="card recipe photo" @click=${() => this._open(r.id)}>
              ${r.image_url
                ? html`<img src=${r.image_url} alt="" loading="lazy" referrerpolicy="no-referrer" />`
                : html`<div class="placeholder"></div>`}
              <div class="name">${r.title}</div>
              ${this._meta(r)}
            </div>
          `,
        )}
      </div>
      <div class="fab-space"></div>
    </itadaki-page>
    ${fab("plus", t("add"), () => navigate(this, { view: "add" }))}`;
  }
}
customElements.define("itadaki-list", ItadakiList);
