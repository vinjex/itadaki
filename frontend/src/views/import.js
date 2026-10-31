import { LitElement, html, nothing } from "lit";
import { shared } from "../styles.js";
import { navigate } from "../router.js";
import "./busy.js";
import "./page.js";
import "./text.js";

class ItadakiImport extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    ai: { type: Boolean },
    _busy: { state: true },
    _error: { state: true },
  };
  static styles = [shared];

  async _run(e) {
    e.preventDefault();
    const url = this.renderRoot.querySelector("#url").value.trim();
    const note = this.renderRoot.querySelector("#note")?.value.trim();
    if (!url) return;
    this._busy = true;
    this._error = undefined;
    try {
      const { draft_id } = await this.api.call("import_url", { url, ...(note ? { note } : {}) });
      navigate(this, { view: "draft", id: draft_id });
    } catch (err) {
      this._error = err.message;
    } finally {
      this._busy = false;
    }
  }

  render() {
    const t = this.t;
    return html`<itadaki-page .t=${t} header=${t("import")}>
      <form class="card" @submit=${this._run}>
        <h2>${t("importTitle")}</h2>
        <label for="url">${t("url")}</label>
        <itadaki-text id="url" type="url" placeholder="https://"></itadaki-text>
        ${this.ai
          ? html`<label for="note">${t("note")}</label>
              <textarea id="note" rows="2" placeholder=${t("noteHint")} ?disabled=${this._busy}></textarea>`
          : html`<div class="muted" style="margin-top:12px">${t("importNoAi")}</div>`}
        <div class="row" style="margin-top:16px">
          <button class="btn" type="submit" ?disabled=${this._busy}>${t("import")}</button>
        </div>
        ${this._busy ? html`<itadaki-busy .text=${t("working")}></itadaki-busy>` : nothing}
        ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      </form>
    </itadaki-page>`;
  }
}
customElements.define("itadaki-import", ItadakiImport);
