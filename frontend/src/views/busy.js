import { LitElement, html, css } from "lit";
import { shared } from "../styles.js";

class ItadakiBusy extends LitElement {
  static properties = { text: {} };
  static styles = [
    shared,
    css`
      :host { display: flex; align-items: center; gap: 12px; padding: 16px 0; }
      .spinner {
        width: 22px; height: 22px; border-radius: 50%;
        border: 3px solid var(--it-soft); border-top-color: var(--it-accent);
        animation: spin 0.9s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `,
  ];
  render() {
    return html`<div class="spinner"></div><span class="muted">${this.text}</span>`;
  }
}
customElements.define("itadaki-busy", ItadakiBusy);
