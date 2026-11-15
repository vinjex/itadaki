import { LitElement, html, css } from "lit";
import { shared } from "../styles.js";

// An amount shown as text that turns into a number field when tapped: how an
// ingredient's amount or the yield is typed in to scale a recipe. Fires `amount`
// with {value} when a new positive number is entered; leaving the field unchanged,
// or pressing Escape, fires nothing.
class ItadakiAmount extends LitElement {
  static properties = {
    value: { type: Number },
    text: {},
    unit: {},
    label: {},
    _editing: { state: true },
  };

  static styles = [
    shared,
    css`
      :host { display: inline-flex; }
      button { font: inherit; color: inherit; font-weight: inherit; background: none; border: none; padding: 2px 6px;
        margin: -2px -6px; border-radius: 8px; cursor: pointer; text-decoration: underline dotted var(--it-muted);
        text-underline-offset: 4px; white-space: nowrap; }
      button:hover { background: var(--it-soft); }
      .edit { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
      input[type="number"] { width: 5.5em; padding: 4px 8px; font-weight: inherit; text-align: right; }
    `,
  ];

  updated(changed) {
    if (changed.has("_editing") && this._editing) {
      const input = this.renderRoot.querySelector("input");
      input.focus();
      input.select();
    }
  }

  _commit(input) {
    if (!this._editing) return;
    this._editing = false;
    const value = Number(input.value);
    if (input.value !== "" && value > 0 && value !== this.value) {
      this.dispatchEvent(new CustomEvent("amount", { detail: { value } }));
    }
  }

  _key(e) {
    if (e.key === "Enter") this._commit(e.target);
    if (e.key === "Escape") this._editing = false;
  }

  render() {
    if (!this._editing) {
      return html`<button title=${this.label} @click=${() => (this._editing = true)}>${this.text}</button>`;
    }
    return html`<span class="edit">
      <input type="number" inputmode="decimal" step="any" min="0" aria-label=${this.label}
        .value=${String(Math.round(this.value * 100) / 100)} @keydown=${this._key} @blur=${(e) => this._commit(e.target)} />
      ${this.unit}
    </span>`;
  }
}
customElements.define("itadaki-amount", ItadakiAmount);
