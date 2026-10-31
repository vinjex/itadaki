import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";

// A single-line text field with the usual clear button. It behaves like an <input>
// for its owner: `value`, plus `input` and `change` events on the element itself.
class ItadakiText extends LitElement {
  static properties = {
    value: {},
    placeholder: {},
    type: {},
    invalid: { type: Boolean, reflect: true },
  };

  static styles = [
    shared,
    css`
      :host { display: block; position: relative; min-width: 0; }
      input { padding-right: 34px; }
      :host([invalid]) input { border-color: var(--it-error); }
      .clear {
        position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
        width: 24px; height: 24px; border-radius: 50%; border: none; cursor: pointer;
        background: var(--it-soft); color: var(--it-muted); font-size: 0.9rem; line-height: 1;
      }
      .clear:hover { color: var(--it-text); }
      .clear { visibility: hidden; }
      :host(:hover) .clear, :host(:focus-within) .clear { visibility: visible; }
    `,
  ];

  constructor() {
    super();
    this.value = "";
    this.type = "text";
  }

  _input(e) {
    // The native input event is composed and reaches the owner on its own.
    this.value = e.target.value;
  }

  _change() {
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  _clear() {
    this.value = "";
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this._change();
    this.renderRoot.querySelector("input").focus();
  }

  render() {
    return html`
      <input type=${this.type} .value=${this.value ?? ""} placeholder=${this.placeholder ?? ""}
        @input=${this._input} @change=${this._change} />
      ${this.value ? html`<button class="clear" tabindex="-1" aria-label="Clear" @click=${this._clear}>✕</button>` : nothing}
    `;
  }
}
customElements.define("itadaki-text", ItadakiText);
