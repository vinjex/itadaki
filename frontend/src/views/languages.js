import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import { icon } from "../icons.js";
import "./page.js";
import "./text.js";

// The library's languages. Fires `settings-changed` with {languages} after a
// change is saved.
class ItadakiLanguages extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    languages: { attribute: false },
    _code: { state: true },
    _busy: { state: true },
    _error: { state: true },
  };

  static styles = [
    shared,
    css`
      .card { max-width: 640px; margin: 0 auto; }
      .lang { display: flex; align-items: center; gap: 12px; padding: 4px 0; border-bottom: 1px solid var(--it-divider); }
      .lang .name { flex: 1; }
      .lang .icon { padding: 8px; }
      .add { margin-top: 16px; flex-wrap: nowrap; }
      .add itadaki-text { flex: 1; }
    `,
  ];

  constructor() {
    super();
    this._code = "";
  }

  async _save(languages) {
    this._busy = true;
    this._error = undefined;
    try {
      const settings = await this.api.call("update_settings", { languages });
      this._code = "";
      this.dispatchEvent(new CustomEvent("settings-changed", { detail: { languages: settings.languages }, bubbles: true, composed: true }));
    } catch (err) {
      this._error = err.message;
    } finally {
      this._busy = false;
    }
  }

  render() {
    const t = this.t;
    const code = this._code.trim().toLowerCase();
    return html`
      <itadaki-page .t=${t} header=${t("languages")}>
        <div class="card">
          <div class="muted" style="margin-bottom:12px">${t("languagesHint")}</div>
          ${this.languages.map(
            (l) => html`<div class="lang">
              <span class="name">${t.langName(l)}</span>
              <span class="muted">${l}</span>
              <button class="icon" ?disabled=${this._busy || this.languages.length === 1} aria-label=${t("remove")} title=${t("remove")}
                @click=${() => this._save(this.languages.filter((x) => x !== l))}>${icon("close")}</button>
            </div>`,
          )}
          <div class="row add">
            <itadaki-text .value=${this._code} placeholder=${t("languageCode")} @input=${(e) => (this._code = e.target.value)}></itadaki-text>
            <button class="btn" ?disabled=${this._busy || !code || this.languages.includes(code)}
              @click=${() => this._save([...this.languages, code])}>${t("add")}</button>
          </div>
          ${code ? html`<div class="muted" style="margin-top:6px">${t.langName(code)}</div>` : nothing}
          ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
        </div>
      </itadaki-page>
    `;
  }
}
customElements.define("itadaki-languages", ItadakiLanguages);
