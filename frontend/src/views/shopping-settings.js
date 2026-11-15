import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import "./busy.js";
import "./page.js";

// The to-do list "Add to shopping list" offers first. Saved as soon as it is picked.
class ItadakiShoppingSettings extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    _s: { state: true },
    _busy: { state: true },
    _error: { state: true },
    _saved: { state: true },
  };

  static styles = [
    shared,
    css`
      .card { max-width: 640px; margin: 0 auto; }
    `,
  ];

  async connectedCallback() {
    super.connectedCallback();
    try {
      this._s = await this.api.call("get_shopping_settings");
    } catch (err) {
      this._error = this.t.error(err);
    }
  }

  async _save(list) {
    this._busy = true;
    this._error = undefined;
    this._saved = false;
    try {
      this._s = await this.api.call("update_shopping_settings", { list });
      this._saved = true;
    } catch (err) {
      this._error = this.t.error(err);
    } finally {
      this._busy = false;
    }
  }

  render() {
    const t = this.t;
    const s = this._s;
    return html`
      <itadaki-page .t=${t} header=${t("shoppingList")}>
        <div class="card">
          <div class="muted">${t("shoppingHint")}</div>
          ${!s
            ? (this._error ? nothing : html`<itadaki-busy></itadaki-busy>`)
            : s.lists.length
              ? html`<label>${t("defaultList")}</label>
                  <select ?disabled=${this._busy} @change=${(e) => this._save(e.target.value)}>
                    ${s.lists.map((l) => html`<option value=${l.entity_id} ?selected=${l.entity_id === s.list}>${l.name}</option>`)}
                  </select>`
              : html`<div class="error">${t("noTodoLists")}</div>`}
          ${this._saved ? html`<div class="muted" style="margin-top:8px">${t("saved")}</div>` : nothing}
          ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
        </div>
      </itadaki-page>
    `;
  }
}
customElements.define("itadaki-shopping-settings", ItadakiShoppingSettings);
