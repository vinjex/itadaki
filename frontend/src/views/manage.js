import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import { icon } from "../icons.js";
import { navigate } from "../router.js";
import "./page.js";

// Groups of pages, drawn with a divider between them.
const PAGES = [
  [
    { target: { view: "catalog", id: "ingredients" }, key: "ingredients", icon: "list" },
    { target: { view: "catalog", id: "units" }, key: "units", icon: "ruler" },
  ],
  [
    { target: { view: "languages" }, key: "languages", icon: "translate" },
    { target: { view: "ai" }, key: "ai", icon: "adapt" },
  ],
];

// Like Home Assistant's settings: one card listing the management pages.
class ItadakiManage extends LitElement {
  static properties = { t: { attribute: false } };

  static styles = [
    shared,
    css`
      .card { max-width: 640px; margin: 0 auto; padding: 8px 0; }
      .item {
        display: flex; align-items: center; gap: 16px; width: 100%; padding: 12px 16px;
        background: none; border: none; font: inherit; color: inherit; text-align: left; cursor: pointer;
      }
      .item:hover { background: var(--it-soft); }
      .badge { display: flex; padding: 8px; border-radius: 50%; background: var(--it-soft); color: var(--it-accent); }
      .badge svg, .chevron svg { width: 24px; height: 24px; fill: currentColor; }
      .name { flex: 1; min-width: 0; font-weight: 500; }
      hr { border: none; border-top: 1px solid var(--it-divider); margin: 8px 0; }
      .chevron { display: flex; color: var(--it-muted); }
    `,
  ];

  render() {
    const t = this.t;
    return html`
      <itadaki-page .t=${t} header=${t("manage")}>
        <div class="card">
          ${PAGES.map(
            (group, i) => html`${i ? html`<hr />` : nothing}${group.map(
              (p) => html`<button class="item" @click=${() => navigate(this, p.target)}>
                <span class="badge">${icon(p.icon)}</span>
                <span class="name">${t(p.key)}</span>
                <span class="chevron">${icon("chevron")}</span>
              </button>`,
            )}`,
          )}
        </div>
      </itadaki-page>
    `;
  }
}
customElements.define("itadaki-manage", ItadakiManage);
