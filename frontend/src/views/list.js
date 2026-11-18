import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import { navigate } from "../router.js";
import { fab, headerButton, icon } from "../icons.js";
import { totalMinutes } from "../recipes.js";
import "./page.js";
import "./text.js";
import "./tags.js";
import "./fit-chips.js";
import { describeRequest } from "../drafts.js";
import { byName, loadCatalog, nameOf } from "../catalog.js";
import { readStored, writeStored } from "../stored.js";
import { GROUPINGS, groupRecipes } from "../groups.js";
import "./menu.js";
import "./bulk.js";

// The typed search and the selection outlive the screen, so opening a recipe and
// coming back keeps them; reloading the panel clears them. Chosen tags and grouping
// are kept in the browser.
const remembered = { query: "", searching: false, selected: new Set() };
const SAVED = "itadaki.list";

class ItadakiList extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    lang: {},
    narrow: { type: Boolean },
    admin: { type: Boolean },
    ai: { type: Boolean },
    languages: { attribute: false },
    instructions: { attribute: false },
    _selected: { state: true },
    _notice: { state: true },
    _recipes: { state: true },
    _drafts: { state: true },
    _query: { state: true },
    _tags: { state: true },
    _filter: { state: true },
    _group: { state: true },
    _searching: { state: true },
    _error: { state: true },
  };

  static styles = [
    shared,
    css`
      .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
      .recipe { cursor: pointer; display: flex; flex-direction: column; gap: 8px; min-height: 96px; }
      .recipe:hover { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
      .recipe .name { font-weight: 600; font-size: 1.05rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .search { max-width: 560px; }
      .chosen { margin-bottom: 8px; }
      .grid + .group { margin-top: 24px; }
      .inbox { margin-bottom: 24px; }
      .request { font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .photo { padding: 0 0 16px; overflow: hidden; }
      .photo > :not(.picture) { padding: 0 16px; }
      .picture { position: relative; margin-bottom: 4px; }
      .picture img, .picture .placeholder { width: 100%; height: 150px; object-fit: cover; display: block; }
      .picture .placeholder { background: linear-gradient(135deg, var(--it-soft), transparent); }
      /* Time, translations and variant sit on the photo, leaving the line under the title to tags. */
      .badges { position: absolute; left: 8px; bottom: 8px; display: flex; gap: 4px; max-width: calc(100% - 16px); }
      .badges span { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 999px;
        font-size: 0.75rem; white-space: nowrap; color: #fff; background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(4px); }
      .badges svg { width: 14px; height: 14px; fill: currentColor; }
      /* Ticking a card selects it for the bulk actions; a click elsewhere opens it. */
      .pick { position: absolute; top: 8px; left: 8px; width: 32px; height: 32px; padding: 5px; border-radius: 50%;
        border: 2px solid #fff; background: rgba(0, 0, 0, 0.3); color: transparent; cursor: pointer; display: flex; }
      .pick svg { width: 100%; height: 100%; fill: currentColor; }
      .pick:hover { color: rgba(255, 255, 255, 0.7); }
      .pick.on { background: var(--it-accent); border-color: var(--it-accent); color: var(--it-on-accent); }
      .selected { outline: 3px solid var(--it-accent); }
      .notice { background: var(--it-soft); }
      .chip.ready { background: var(--it-accent); color: var(--it-on-accent); }
      .chip.failed { background: color-mix(in srgb, var(--it-error) 18%, transparent); }
      @media (max-width: 600px) {
        .grid { gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .recipe:not(.photo) { padding: 12px; }
        .photo { padding-bottom: 12px; }
        .photo > :not(.picture) { padding: 0 10px; }
        .picture img, .picture .placeholder { height: 110px; }
        .badges { left: 6px; bottom: 6px; }
        .recipe .name { font-size: 0.95rem; }
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._query = remembered.query;
    const saved = readStored(SAVED, {});
    this._filter = Array.isArray(saved.tags) ? saved.tags : [];
    this._group = GROUPINGS.includes(saved.group) ? saved.group : "none";
    this._searching = remembered.searching;
    this._selected = remembered.selected;
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
      // A kept filter may name a tag deleted since; it would hide every recipe.
      const known = this._filter.filter((id) => this._tags.some((x) => x.id === id));
      if (known.length !== this._filter.length) this._setFilter(known);
    } catch (err) {
      this._error = this.t.error(err);
    }
  }

  _save() {
    writeStored(SAVED, { tags: this._filter, group: this._group });
  }

  _setFilter(tags) {
    this._filter = tags;
    this._save();
    this._load();
  }

  _setGroup(group) {
    this._group = group;
    this._save();
  }

  _groupLabel = (by, key) => {
    const t = this.t;
    if (key === null) return by === "tag" ? t("noTags") : t("noTime");
    if (by === "tag") {
      const tag = this._tags?.find((x) => x.id === key);
      return tag && nameOf(tag, this.lang);
    }
    return by === "language" ? t.langName(key) : t(`time_${key}`);
  };

  async _load() {
    const tags = this._filter;
    try {
      const res = await this.api.call("list_recipes", {
        prefer_language: this.lang,
        query: this._query || undefined,
        ...(tags.length ? { tags } : {}),
      });
      this._recipes = res.recipes;
      // Recipes the filter now hides leave the selection: nothing is acted on unseen.
      const shown = new Set(res.recipes.map((r) => r.id));
      this._select([...this._selected].filter((id) => shown.has(id)));
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

  _select(ids) {
    this._selected = remembered.selected = new Set(ids);
  }

  _toggleSelected(e, id) {
    e.stopPropagation();
    this._notice = undefined;
    const ids = new Set(this._selected);
    if (!ids.delete(id)) ids.add(id);
    this._select(ids);
  }

  _bulkDone(e) {
    this._notice = e.detail.message;
    this._load();
  }

  _bulkBar() {
    const selected = (this._recipes || []).filter((r) => this._selected.has(r.id));
    if (!selected.length) return nothing;
    return html`<itadaki-bulk .api=${this.api} .t=${this.t} lang=${this.lang} ?ai=${this.ai} .languages=${this.languages}
      .instructions=${this.instructions} .recipes=${selected} .tags=${(this._tags || []).filter((x) => x.kind === "recipe")}
      @select-all=${() => this._select(this._recipes.map((r) => r.id))} @clear=${() => this._select([])}
      @done=${this._bulkDone}></itadaki-bulk>`;
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

  // The photo with the time, a language icon when the dish has translations (their
  // names show on hover) and the variant mark laid over it.
  _picture(r) {
    const t = this.t;
    const minutes = totalMinutes(r);
    return html`<div class="picture">
      ${r.image_url
        ? html`<img src=${r.thumbnail_url || r.image_url} alt="" loading="lazy" referrerpolicy="no-referrer" />`
        : html`<div class="placeholder"></div>`}
      <button class="pick ${this._selected.has(r.id) ? "on" : ""}" title=${t("select")} aria-label=${t("select")}
        aria-pressed=${this._selected.has(r.id)} @click=${(e) => this._toggleSelected(e, r.id)}>${icon("check")}</button>
      <div class="badges">
        ${minutes ? html`<span>${icon("clock")}${t("minutes", { n: minutes })}</span>` : nothing}
        ${r.languages.length > 1
          ? html`<span title=${r.languages.map((l) => t.langName(l)).join(", ")}>${icon("translate")}</span>`
          : nothing}
        ${r.relation === "variant" ? html`<span>${t("variant")}</span>` : nothing}
      </div>
    </div>`;
  }

  _tagNames(r) {
    const byId = new Map((this._tags || []).map((x) => [x.id, x]));
    return r.tags.filter((id) => byId.has(id)).map((id) => nameOf(byId.get(id), this.lang));
  }

  _card(r) {
    return html`<div class="card recipe photo ${this._selected.has(r.id) ? "selected" : ""}" @click=${() => this._open(r.id)}>
      ${this._picture(r)}
      <div class="name" title=${r.title}>${r.title}</div>
      <itadaki-fit-chips .labels=${this._tagNames(r)}></itadaki-fit-chips>
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
      <itadaki-menu slot="actions" icon="group" label=${t("groupBy")}
        .items=${GROUPINGS.map((g) => ({ label: t(`group_${g}`), active: g === this._group, run: () => this._setGroup(g) }))}></itadaki-menu>
      ${this.admin
        ? headerButton("cog", t("manage"), () => navigate(this, { view: "manage" }))
        : nothing}
      ${this._filtered ? this._tagBar("chips") : nothing}
      ${this._bulkBar()}
      ${this._notice ? html`<div class="banner notice">${this._notice}</div>` : nothing}
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
      ${groupRecipes(this._recipes || [], this._group, this._groupLabel).map(
        (g) => html`${g.label ? html`<h2 class="group">${g.label}</h2>` : nothing}
          <div class="grid">${g.recipes.map((r) => this._card(r))}</div>`,
      )}
      <div class="fab-space"></div>
    </itadaki-page>
    ${fab("plus", t("add"), () => navigate(this, { view: "add" }))}`;
  }
}
customElements.define("itadaki-list", ItadakiList);
