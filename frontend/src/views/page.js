import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import { icon } from "../icons.js";
import { navigate } from "../router.js";

// The frame of every screen, like Home Assistant's own pages: a header with back
// (or, on the home screen of a phone, the sidebar menu), the title and the screen's
// own action icons in the `actions` slot, then the content. A screen may put its own
// element, such as a search field, in the `title` slot instead of the title.
class ItadakiPage extends LitElement {
  static properties = {
    t: { attribute: false },
    header: {},
    home: { type: Boolean },
    narrow: { type: Boolean },
  };

  static styles = [
    shared,
    css`
      :host { display: block; }
      header {
        position: sticky; top: 0; z-index: 2; display: flex; align-items: center; gap: 4px;
        height: var(--header-height, 56px); padding: 0 4px;
        background: var(--app-header-background-color, var(--primary-background-color));
        color: var(--app-header-text-color, var(--it-text));
        border-bottom: var(--app-header-border-bottom, none);
      }
      .title { flex: 1; min-width: 0; margin-left: 8px; }
      .text { display: block; font-size: 1.25rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .actions { display: flex; }
      ::slotted([slot="title"]) { font-size: 1rem; }
      main { max-width: 1100px; margin: 0 auto; padding: 16px; }
    `,
  ];

  render() {
    const t = this.t;
    let lead = nothing;
    if (!this.home) {
      lead = html`<button class="icon" @click=${() => navigate(this, { view: "back" })} aria-label=${t("back")} title=${t("back")}>${icon("back")}</button>`;
    } else if (this.narrow) {
      lead = html`<button class="icon" aria-label="Menu"
        @click=${() => this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: true, composed: true }))}>${icon("menu")}</button>`;
    }
    return html`
      <header>
        ${lead}
        <div class="title"><slot name="title"><span class="text">${this.header ?? ""}</span></slot></div>
        <div class="actions"><slot name="actions"></slot></div>
      </header>
      <main><slot></slot></main>
    `;
  }
}
customElements.define("itadaki-page", ItadakiPage);
