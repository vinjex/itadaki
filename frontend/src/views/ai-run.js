import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";

// The one screen every AI action passes through before it runs: what it will do,
// the library's standing instructions for it, and a note for this run. Adapt needs
// the note, since it is the instruction. Fires `run` with { note, asVariant } and `cancel`.
class ItadakiAiRun extends LitElement {
  static properties = {
    t: { attribute: false },
    heading: {},
    // The standing instructions of this action, from the library settings.
    standing: {},
    noteRequired: { type: Boolean },
    // Only a saved recipe can become the parent of a variant.
    variant: { type: Boolean },
    cancellable: { type: Boolean },
    disabled: { type: Boolean },
  };

  static styles = [
    shared,
    css`
      :host { display: block; }
      .standing { white-space: pre-wrap; font-size: 0.9rem; }
      .foot { margin-top: 12px; justify-content: space-between; }
    `,
  ];

  _run() {
    const note = this.renderRoot.querySelector("#note").value.trim();
    if (this.noteRequired && !note) return;
    const asVariant = Boolean(this.renderRoot.querySelector("#variant")?.checked);
    this.dispatchEvent(new CustomEvent("run", { detail: { note, asVariant } }));
  }

  render() {
    const t = this.t;
    return html`
      <div class="card">
        <h2>${this.heading}</h2>
        <slot></slot>
        <label>${t("standing")}</label>
        <div class="standing ${this.standing ? "" : "muted"}">${this.standing || t("standingNone")}</div>
        <label for="note">${this.noteRequired ? t("instruction") : t("note")}</label>
        <textarea id="note" rows="2" placeholder=${this.noteRequired ? t("adaptHint") : t("noteHint")}></textarea>
        <div class="row foot">
          ${this.variant
            ? html`<label class="row" style="margin:0"><input type="checkbox" id="variant" /> ${t("asVariant")}</label>`
            : html`<span></span>`}
          <div class="row">
            ${this.cancellable
              ? html`<button class="btn quiet" ?disabled=${this.disabled} @click=${() => this.dispatchEvent(new CustomEvent("cancel"))}>${t("cancel")}</button>`
              : nothing}
            <button class="btn" ?disabled=${this.disabled} @click=${this._run}>${t("run")}</button>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define("itadaki-ai-run", ItadakiAiRun);
