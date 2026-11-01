import { LitElement, html, nothing } from "lit";
import { shared } from "../styles.js";
import { navigate } from "../router.js";
import "./ai-run.js";
import "./busy.js";
import "./page.js";
import "./text.js";

// Importing never runs the AI by itself: a page with embedded recipe data opens as a
// draft at once; for a page without it, the AI import is offered and started by hand.
class ItadakiImport extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    ai: { type: Boolean },
    instructions: { attribute: false },
    _noData: { state: true },
    _busy: { state: true },
    _error: { state: true },
  };
  static styles = [shared];

  get _url() {
    return this.renderRoot.querySelector("#url").value.trim();
  }

  async _import(e) {
    e.preventDefault();
    if (!this._url) return;
    this._noData = false;
    await this._open("import_url", { url: this._url });
  }

  async _open(action, data) {
    this._busy = true;
    this._error = undefined;
    try {
      const { draft_id } = await this.api.call(action, data);
      navigate(this, { view: "draft", id: draft_id });
    } catch (err) {
      if (err.key === "no_recipe_data") this._noData = true;
      else this._error = err.message;
    } finally {
      this._busy = false;
    }
  }

  render() {
    const t = this.t;
    return html`<itadaki-page .t=${t} header=${t("import")}>
      <form class="card" @submit=${this._import}>
        <h2>${t("importTitle")}</h2>
        <label for="url">${t("url")}</label>
        <itadaki-text id="url" type="url" placeholder="https://" @input=${() => (this._noData = false)}></itadaki-text>
        ${this.ai ? nothing : html`<div class="muted" style="margin-top:12px">${t("importNoAi")}</div>`}
        <div class="row" style="margin-top:16px">
          <button class="btn" type="submit" ?disabled=${this._busy}>${t("import")}</button>
        </div>
        ${this._noData && !this.ai ? html`<div class="error">${t("noRecipeDataNoAi")}</div>` : nothing}
        ${this._busy ? html`<itadaki-busy></itadaki-busy>` : nothing}
        ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      </form>
      ${this._noData && this.ai
        ? html`<itadaki-ai-run style="margin-top:16px" .t=${t} heading=${t("importAi")} .standing=${this.instructions.extract}
            ?disabled=${this._busy} @run=${(e) => this._open("extract_url", { url: this._url, ...(e.detail.note ? { note: e.detail.note } : {}) })}>
            <div class="muted">${t("noRecipeData")}</div>
          </itadaki-ai-run>`
        : nothing}
    </itadaki-page>`;
  }
}
customElements.define("itadaki-import", ItadakiImport);
