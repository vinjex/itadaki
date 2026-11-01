import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import "./busy.js";
import "./page.js";
import "./text.js";

const TASKS = ["extract", "structure", "translate", "adapt"];
const JSON_MODES = ["schema", "json", "off"];

// The AI provider, and the library's standing instructions per action. The saved key
// is never sent back: the page only knows whether one exists. Fires `settings-changed`
// with {ai, instructions} after a save.
class ItadakiAi extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    _s: { state: true },
    _instructions: { state: true },
    _key: { state: true },
    _extra: { state: true },
    _busy: { state: true },
    _error: { state: true },
    _saved: { state: true },
  };

  static styles = [
    shared,
    css`
      .card { max-width: 640px; margin: 0 auto; }
      .status { margin: 12px 0 4px; font-weight: 500; }
      details { margin-top: 16px; }
      summary { cursor: pointer; color: var(--it-muted); }
      details textarea { font-family: monospace; font-size: 0.85rem; }
      .section { margin-top: 24px; }
      .hint { font-size: 0.8rem; margin-top: 4px; word-break: break-all; }
      .actions { margin-top: 20px; }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }

  async _load() {
    try {
      const [ai, library] = await Promise.all([this.api.call("get_ai_settings"), this.api.call("get_settings")]);
      this._instructions = library.instructions;
      this._show(ai);
    } catch (err) {
      this._error = err.message;
    }
  }

  _show(settings) {
    this._s = settings;
    this._key = "";
    this._extra = Object.keys(settings.extra_body).length ? JSON.stringify(settings.extra_body, null, 2) : "";
  }

  _set(field, value) {
    this._saved = false;
    this._s = { ...this._s, [field]: value };
  }

  async _save() {
    let extra;
    try {
      extra = this._extra.trim() ? JSON.parse(this._extra) : {};
      if (typeof extra !== "object" || Array.isArray(extra) || extra === null) throw new Error();
    } catch {
      this._error = this.t("invalidJson");
      return;
    }
    const s = this._s;
    const changes = {
      base_url: s.base_url,
      model: s.model,
      models: s.models,
      structured_output: s.structured_output,
      extra_body: extra,
      ...(this._key.trim() ? { api_key: this._key.trim() } : {}),
    };
    this._busy = true;
    this._error = undefined;
    try {
      const [saved, library] = await Promise.all([
        this.api.call("update_ai_settings", changes),
        this.api.call("update_settings", { instructions: this._instructions }),
      ]);
      this._show(saved);
      this._instructions = library.instructions;
      this._saved = true;
      const detail = { ai: saved.enabled, instructions: library.instructions };
      this.dispatchEvent(new CustomEvent("settings-changed", { detail, bubbles: true, composed: true }));
    } catch (err) {
      this._error = err.message;
    } finally {
      this._busy = false;
    }
  }

  render() {
    const t = this.t;
    return html`<itadaki-page .t=${t} header=${t("ai")}>${this._s ? this._form() : this._error ? html`<div class="error">${this._error}</div>` : html`<itadaki-busy></itadaki-busy>`}</itadaki-page>`;
  }

  _form() {
    const t = this.t;
    const s = this._s;
    const text = (field, label, type = "text") => html`<label>${label}</label>
      <itadaki-text type=${type} .value=${s[field]} @input=${(e) => this._set(field, e.target.value)}></itadaki-text>`;
    return html`
      <div class="card">
        <div class="muted">${t("aiHint")}</div>
        <div class="status">${s.enabled ? t("aiOn") : t("aiOff")}</div>
        ${text("base_url", t("apiUrl"), "url")}
        <label>${t("apiKey")}</label>
        <itadaki-text type="password" .value=${this._key} @input=${(e) => ((this._key = e.target.value), (this._saved = false))}></itadaki-text>
        ${s.api_key_set ? html`<div class="muted hint">${t("apiKeySet")}</div>` : nothing}
        ${text("model", t("model"))}

        <h2 class="section">${t("standing")}</h2>
        <div class="muted" style="font-size:0.85rem">${t("standingHint")}</div>
        ${TASKS.map(
          (task) => html`<label>${t("instructionsFor", { action: t(`task_${task}`) })}</label>
            <textarea rows="2" .value=${this._instructions[task] || ""}
              @input=${(e) => ((this._instructions = { ...this._instructions, [task]: e.target.value }), (this._saved = false))}></textarea>`,
        )}

        <details>
          <summary>${t("advanced")}</summary>
          <label>${t("jsonMode")}</label>
          <select @change=${(e) => this._set("structured_output", e.target.value)}>
            ${JSON_MODES.map((m) => html`<option value=${m} ?selected=${m === s.structured_output}>${t(`json_${m}`)}</option>`)}
          </select>
          <label>${t("extraBody")}</label>
          <textarea rows="3" .value=${this._extra} @input=${(e) => ((this._extra = e.target.value), (this._saved = false))}></textarea>
          <div class="muted hint">${t("extraBodyHint")}</div>
          ${TASKS.map(
            (task) => html`<label>${t("modelFor", { action: t(`task_${task}`) })}</label>
              <itadaki-text .value=${s.models[task] || ""} placeholder=${t("modelDefault")}
                @input=${(e) => this._set("models", { ...s.models, [task]: e.target.value.trim() })}></itadaki-text>`,
          )}
        </details>

        <div class="row actions">
          <button class="btn" ?disabled=${this._busy} @click=${this._save}>${t("save")}</button>
          ${this._saved ? html`<span class="muted">${t("saved")}</span>` : nothing}
        </div>
        ${this._busy ? html`<itadaki-busy></itadaki-busy>` : nothing}
        ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      </div>
    `;
  }
}
customElements.define("itadaki-ai", ItadakiAi);
