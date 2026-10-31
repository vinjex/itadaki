import { LitElement, html, css } from "lit";
import { shared } from "../styles.js";

// The instruction box for Adapt, on a saved recipe and on a draft under review.
// Fires `adapt` with { instruction, asVariant }.
class ItadakiAdapt extends LitElement {
  static properties = {
    t: { attribute: false },
    // Only a saved recipe can become the parent of a variant.
    variant: { type: Boolean },
    disabled: { type: Boolean },
  };

  static styles = [shared, css`:host { display: block; } .foot { margin-top: 12px; justify-content: space-between; }`];

  _run() {
    const box = this.renderRoot.querySelector("#instruction");
    const instruction = box.value.trim();
    if (!instruction) return;
    const asVariant = Boolean(this.renderRoot.querySelector("#variant")?.checked);
    this.dispatchEvent(new CustomEvent("adapt", { detail: { instruction, asVariant } }));
    box.value = "";
  }

  render() {
    const t = this.t;
    return html`
      <div class="card">
        <textarea id="instruction" rows="2" placeholder=${t("adaptHint")}></textarea>
        <div class="row foot">
          ${this.variant
            ? html`<label class="row" style="margin:0"><input type="checkbox" id="variant" /> ${t("asVariant")}</label>`
            : html`<span></span>`}
          <button class="btn" ?disabled=${this.disabled} @click=${this._run}>${t("run")}</button>
        </div>
      </div>
    `;
  }
}
customElements.define("itadaki-adapt", ItadakiAdapt);
