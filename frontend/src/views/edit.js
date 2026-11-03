import { LitElement, html, nothing } from "lit";
import { shared } from "../styles.js";
import { navigate } from "../router.js";
import { loadCatalog } from "../catalog.js";
import "./busy.js";
import "./page.js";
import "./editor.js";

// Edits a saved recipe, or writes a new one when there is no recipe id.
class ItadakiEdit extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    lang: {},
    languages: { attribute: false },
    recipeId: {},
    _data: { state: true },
    _busy: { state: true },
    _error: { state: true },
  };
  static styles = [shared];

  willUpdate(changed) {
    if (changed.has("recipeId") || !this.hasUpdated) this._load();
  }

  _blank() {
    const language = this.languages.includes(this.lang) ? this.lang : this.languages[0];
    return { language, title: "", description: "", servings: null, prep_minutes: null, cook_minutes: null, total_minutes: null, ingredients: [], steps: [], notes: "", tags: [], image_url: null, source_url: null };
  }

  async _load() {
    try {
      const [recipe, ingredients, units, tags] = await Promise.all([
        this.recipeId ? this.api.call("get_recipe", { recipe_id: this.recipeId }).then((r) => r.recipe) : this._blank(),
        loadCatalog(this.api, "ingredients"),
        loadCatalog(this.api, "units"),
        loadCatalog(this.api, "recipe_tags"),
      ]);
      this._data = { recipe, ingredients, units, tags };
    } catch (err) {
      this._error = this.t.error(err);
    }
  }

  async _save() {
    const editor = this.renderRoot.querySelector("itadaki-editor");
    // Same save path as AI drafts, so ingredients created while editing are added
    // to the list (checked for clashes first) together with the recipe change.
    const draft = { recipe: editor.value, updates_id: this.recipeId, new_ingredients: editor.newIngredientsUsed, new_tags: editor.newTagsUsed };
    this._busy = true;
    this._error = undefined;
    try {
      const { recipe } = await this.api.call("apply_draft", { draft });
      navigate(this, this.recipeId ? { view: "back" } : { view: "recipe", id: recipe.id, replace: true });
    } catch (err) {
      this._error = this.t.error(err);
    } finally {
      this._busy = false;
    }
  }

  render() {
    return html`<itadaki-page .t=${this.t} header=${this.t(this.recipeId ? "edit" : "newRecipe")}>${this._content()}</itadaki-page>`;
  }

  _content() {
    const t = this.t;
    if (!this._data) return this._error ? html`<div class="error">${this._error}</div>` : html`<itadaki-busy></itadaki-busy>`;
    return html`
      <itadaki-editor .api=${this.api} .languages=${this.languages} .recipe=${this._data.recipe} uiLang=${this.lang} .ingredients=${this._data.ingredients}
        .units=${this._data.units} .tags=${this._data.tags} .t=${t} ?fixedLanguage=${Boolean(this.recipeId)}></itadaki-editor>
      <div class="row" style="margin:16px 0">
        <button class="btn" ?disabled=${this._busy} @click=${this._save}>${t("save")}</button>
        <button class="btn quiet" ?disabled=${this._busy}
          @click=${() => navigate(this, { view: "back" })}>
          ${t("cancel")}</button>
      </div>
      ${this._busy ? html`<itadaki-busy></itadaki-busy>` : nothing}
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
    `;
  }
}
customElements.define("itadaki-edit", ItadakiEdit);
