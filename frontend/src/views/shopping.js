import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import "./busy.js";

// Picks a recipe's ingredients to add to a to-do list, at the scale the recipe is
// shown at, inside the ingredients card in place of its lines. One row per item, so
// an ingredient used in two sections shows once, summed. Nothing starts ticked: most
// of it is usually in the house already. Names and amounts stay editable until added.
// Fires `added` with {message}, and `cancel`.
class ItadakiShopping extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    recipeId: {},
    factor: { type: Number },
    // Written on each item, where the list keeps a description: the recipe title.
    subject: {},
    _items: { state: true },
    _lists: { state: true },
    _list: { state: true },
    _busy: { state: true },
    _error: { state: true },
  };

  static styles = [
    shared,
    css`
      :host { display: block; }
      .item { display: grid; grid-template-columns: auto minmax(0, 1fr) 5.5em; gap: 8px; align-items: center; padding: 8px 0; }
      .item + .item { border-top: var(--it-row-rule); }
      .item input[type="checkbox"] { width: 20px; height: 20px; margin: 0; }
      .item input[type="text"] { padding: 6px 10px; border-radius: 10px; }
      .item .amount { text-align: right; }
      .item:not(.on) input[type="text"] { opacity: 0.6; }
      .foot { margin-top: 12px; display: grid; gap: 8px; }
      .foot .row { justify-content: flex-end; }
    `,
  ];

  updated(changed) {
    if (changed.has("recipeId") || changed.has("factor")) this._load();
  }

  async _load() {
    try {
      const [settings, { items }] = await Promise.all([
        this._lists ? null : this.api.call("get_shopping_settings"),
        this.api.call("shopping_items", { recipe_id: this.recipeId, factor: this.factor }),
      ]);
      if (settings) {
        this._lists = settings.lists;
        this._list = settings.list;
      }
      // A new scale changes the amounts; what was ticked stays ticked.
      const ticked = new Set((this._items ?? []).flatMap((item) => (item.checked ? item.lines : [])));
      this._items = items.map((item) => ({ ...item, checked: item.lines.some((l) => ticked.has(l)) }));
      this._error = undefined;
    } catch (err) {
      this._error = this.t.error(err);
    }
  }

  _set(index, changes) {
    this._items = this._items.map((item, i) => (i === index ? { ...item, ...changes } : item));
  }

  async _add() {
    const chosen = this._items.filter((item) => item.checked);
    this._busy = true;
    this._error = undefined;
    try {
      const items = chosen.map(({ name, quantity }) => ({ name, quantity }));
      const { added } = await this.api.call("add_to_shopping_list", { list: this._list, items, description: this.subject });
      const list = this._lists.find((l) => l.entity_id === this._list)?.name ?? this._list;
      this.dispatchEvent(new CustomEvent("added", { detail: { message: this.t("addedN", { n: added, list }) } }));
    } catch (err) {
      this._error = this.t.error(err);
    } finally {
      this._busy = false;
    }
  }

  render() {
    const t = this.t;
    const count = this._items?.filter((item) => item.checked).length ?? 0;
    return html`
      ${!this._items
        ? (this._error ? nothing : html`<itadaki-busy></itadaki-busy>`)
        : html`${this._items.map(
            (item, i) => html`<div class="item ${item.checked ? "on" : ""}">
              <input type="checkbox" .checked=${item.checked} @change=${(e) => this._set(i, { checked: e.target.checked })} />
              <input type="text" aria-label=${t("name")} .value=${item.name}
                @input=${(e) => this._set(i, { name: e.target.value, checked: true })} />
              <input type="text" class="amount" aria-label=${t("amount")} .value=${item.quantity}
                @input=${(e) => this._set(i, { quantity: e.target.value, checked: true })} />
            </div>`,
          )}`}
      ${this._lists && !this._lists.length ? html`<div class="error">${t("noTodoLists")}</div>` : nothing}
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      <div class="foot">
        ${this._lists?.length > 1
          ? html`<select aria-label=${t("todoList")} @change=${(e) => (this._list = e.target.value)}>
              ${this._lists.map((l) => html`<option value=${l.entity_id} ?selected=${l.entity_id === this._list}>${l.name}</option>`)}
            </select>`
          : nothing}
        <div class="row">
          <button class="btn quiet" ?disabled=${this._busy} @click=${() => this.dispatchEvent(new CustomEvent("cancel"))}>${t("cancel")}</button>
          <button class="btn" ?disabled=${this._busy || !count || !this._list} @click=${this._add}>${t("addN", { n: count })}</button>
        </div>
      </div>`;
  }
}
customElements.define("itadaki-shopping", ItadakiShopping);
