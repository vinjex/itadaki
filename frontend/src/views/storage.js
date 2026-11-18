import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import "./busy.js";
import "./page.js";

const LIBRARY = ["recipes", "drafts", "ingredients", "units", "tags"];
const PHOTO_KINDS = ["stored", "linked", "none"];

// What the library keeps and how much room it takes, and the upkeep that goes with
// it: for now, storing the photos older recipes only link to.
class ItadakiStorage extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    lang: {},
    _usage: { state: true },
    _busy: { state: true },
    _result: { state: true },
    _error: { state: true },
  };

  static styles = [
    shared,
    css`
      .card { max-width: 640px; margin: 0 auto 16px; }
      .line { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: var(--it-row-rule); }
      .line:last-of-type { border-bottom: none; }
      .value { font-variant-numeric: tabular-nums; white-space: nowrap; }
      .actions { margin-top: 12px; }
      .hint { margin-top: 8px; font-size: 0.9rem; }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }

  async _load() {
    try {
      this._usage = await this.api.call("storage_usage");
    } catch (err) {
      this._error = this.t.error(err);
    }
  }

  async _storePhotos() {
    const t = this.t;
    this._busy = true;
    this._result = this._error = undefined;
    try {
      const { stored, failed } = await this.api.call("store_linked_photos");
      this._result = [t("storedPhotosN", { n: stored }), failed.length ? t("photosFailed", { titles: failed.join(", ") }) : ""];
      await this._load();
    } catch (err) {
      this._error = t.error(err);
    } finally {
      this._busy = false;
    }
  }

  _size(bytes) {
    const [value, unit] = bytes >= 1e6 ? [bytes / 1e6, "megabyte"] : [bytes / 1e3, "kilobyte"];
    return new Intl.NumberFormat(this.lang, { style: "unit", unit, maximumFractionDigits: 1 }).format(value);
  }

  _line(label, value) {
    return html`<div class="line"><span>${label}</span><span class="value muted">${value}</span></div>`;
  }

  render() {
    const t = this.t;
    const u = this._usage;
    return html`<itadaki-page .t=${t} header=${t("storage")}>
      ${this._error ? html`<div class="card error">${this._error}</div>` : nothing}
      ${u ? this._content(u) : this._error ? nothing : html`<itadaki-busy></itadaki-busy>`}
    </itadaki-page>`;
  }

  _content(u) {
    const t = this.t;
    const counted = (part) => t("countBytes", { n: part.count, size: this._size(part.bytes) });
    const linked = u.recipe_photos.linked;
    return html`
      <div class="card">
        <h2>${t("library")}</h2>
        ${this._line(t("database"), this._size(u.database_bytes))}
        ${LIBRARY.map((key) => this._line(t(key), u[key]))}
        ${this._line(t("photos"), counted(u.images))}
        ${this._line(t("thumbnails"), counted(u.thumbnails))}
      </div>
      <div class="card">
        <h2>${t("recipePhotos")}</h2>
        ${PHOTO_KINDS.map((kind) => this._line(t(`photo_${kind}`), u.recipe_photos[kind]))}
        <div class="muted hint">${t("linkedPhotosHint")}</div>
        <div class="row actions">
          <button class="btn quiet" ?disabled=${this._busy || !linked} @click=${this._storePhotos}>${t("storePhotos")}</button>
        </div>
        ${this._busy ? html`<itadaki-busy></itadaki-busy>` : nothing}
        ${this._result ? this._result.filter(Boolean).map((line) => html`<p>${line}</p>`) : nothing}
      </div>
    `;
  }
}
customElements.define("itadaki-storage", ItadakiStorage);
