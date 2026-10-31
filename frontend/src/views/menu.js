import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import { icon } from "../icons.js";

// A header icon that opens a short list of choices. `items` are
// {label, active?, run}; a click anywhere else closes it.
class ItadakiMenu extends LitElement {
  static properties = {
    icon: {},
    label: {},
    items: { attribute: false },
    disabled: { type: Boolean },
    _open: { state: true },
  };

  static styles = [
    shared,
    css`
      :host { position: relative; display: block; }
      .list {
        position: absolute; right: 0; top: 100%; z-index: 3; min-width: 200px; padding: 6px 0;
        background: var(--it-surface); color: var(--it-text); border-radius: 12px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
      }
      .item {
        display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 16px;
        background: none; border: none; font: inherit; color: inherit; text-align: left; cursor: pointer; white-space: nowrap;
      }
      .item:hover { background: var(--it-soft); }
      .mark { width: 20px; height: 20px; display: flex; fill: var(--it-accent); }
      hr { border: none; border-top: 1px solid var(--it-divider); margin: 6px 0; }
    `,
  ];

  constructor() {
    super();
    this._close = (e) => {
      if (!e.composedPath().includes(this)) this._open = false;
    };
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._close);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._close);
  }

  _pick(item) {
    this._open = false;
    item.run();
  }

  render() {
    return html`
      <button class="icon" ?disabled=${this.disabled} aria-label=${this.label} title=${this.label}
        @click=${() => (this._open = !this._open)}>${icon(this.icon)}</button>
      ${this._open
        ? html`<div class="list">
            ${this.items.map((item) =>
              item === "-"
                ? html`<hr />`
                : html`<button class="item" @click=${() => this._pick(item)}>
                    <span class="mark">${item.active ? icon("check") : nothing}</span>${item.label}</button>`,
            )}
          </div>`
        : nothing}
    `;
  }
}
customElements.define("itadaki-menu", ItadakiMenu);
