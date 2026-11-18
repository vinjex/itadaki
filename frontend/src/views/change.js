import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";

// A small marker under one field of a draft in review: "added", "removed", "moved", or a toggle that
// opens what the field was (`parts` from a word diff, or plain `text`) with a way
// back to it, or, for a translation, the source text. `expanded` opens or closes
// every marker at once; each can still be toggled on its own.
class ItadakiChange extends LitElement {
  static properties = {
    t: { attribute: false },
    kind: {},
    parts: { attribute: false },
    text: {},
    undoable: { type: Boolean },
    expanded: { type: Boolean },
    _open: { state: true },
  };

  static styles = [
    shared,
    css`
      :host { display: block; }
      .pill { font: inherit; font-size: 0.75rem; font-weight: 600; border: none; border-radius: 999px; cursor: pointer;
        padding: 4px 10px; margin: 2px 0; min-height: 28px; background: var(--it-mark-soft); color: var(--it-text);
        display: inline-flex; align-items: center; gap: 4px; position: relative; }
      /* A bigger invisible tap area than the pill shows. */
      .pill::after { content: ""; position: absolute; inset: -8px -4px; }
      .pill.added { background: var(--it-ok-soft); cursor: default; }
      .pill.removed { background: var(--it-error-soft); cursor: default; }
      .pill.moved { cursor: default; }
      .pill .arrow { transition: transform 0.15s; }
      .pill[aria-expanded="true"] .arrow { transform: rotate(180deg); }
      /* Ruled, not filled, so it does not read as one more field to edit. */
      .was { margin-top: 6px; padding: 2px 0 2px 12px; border-left: 3px solid var(--it-divider);
        font-size: 0.9rem; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; }
      .caption { display: block; font-size: 0.75rem; color: var(--it-muted); }
      del { background: var(--it-error-soft); text-decoration: line-through; text-decoration-color: var(--it-error); }
      ins { background: var(--it-ok-soft); text-decoration: none; }
      del, ins { padding: 0 2px; border-radius: 4px; }
      .btn.undo { margin-top: 6px; padding: 6px 14px; font-size: 0.8rem; background: var(--it-mark-soft); }
    `,
  ];

  willUpdate(changed) {
    if (changed.has("expanded")) this._open = this.expanded;
  }

  _content() {
    const { parts, text } = this;
    if (!parts) return text;
    return parts.map((p) => (p.added ? html`<ins>${p.value}</ins>` : p.removed ? html`<del>${p.value}</del>` : p.value));
  }

  render() {
    const t = this.t;
    if (["added", "removed", "moved"].includes(this.kind)) return html`<span class="pill ${this.kind}">${t(this.kind)}</span>`;
    const label = this.kind === "source" ? t("sourceText") : t("changed");
    return html`
      <button class="pill" aria-expanded=${this._open ? "true" : "false"} @click=${() => (this._open = !this._open)}>
        ${label}<span class="arrow">▾</span>
      </button>
      ${this._open
        ? html`<div class="was">${this.kind === "changed" ? html`<span class="caption">${t("before")}</span>` : nothing}${this._content()}</div>
            ${this.undoable
              ? html`<button class="btn quiet undo" @click=${() => this.dispatchEvent(new CustomEvent("undo"))}>${t("undoChange")}</button>`
              : nothing}`
        : nothing}
    `;
  }
}
customElements.define("itadaki-change", ItadakiChange);
