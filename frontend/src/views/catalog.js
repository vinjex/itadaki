import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import { BASE_UNIT, nameOf } from "../catalog.js";
import { search } from "../search.js";
import "./entry.js";
import "./page.js";
import "./text.js";

// One shared list (ingredients or units) as a table: every name and other name per
// language at a glance, found by any of them. A row opens its form underneath, to
// fix names, delete it when unused or merge a duplicate away.
class ItadakiCatalog extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    lang: {},
    languages: { attribute: false },
    kind: {},
    _entries: { state: true },
    _usage: { state: true },
    _query: { state: true },
    _open: { state: true },
    _error: { state: true },
  };

  static styles = [
    shared,
    css`
      .tools { display: flex; gap: 12px; margin-bottom: 20px; }
      .tools itadaki-text { flex: 1; }
      .card { padding: 0; overflow-x: auto; container-type: inline-size; }
      table { width: 100%; border-collapse: collapse; }
      th { text-align: left; font-weight: 600; font-size: 0.8rem; color: var(--it-muted); white-space: nowrap; }
      th, td { padding: 10px 12px; vertical-align: top; }
      th:first-child, td:first-child { padding-left: 20px; }
      tbody tr { border-top: 1px solid var(--it-divider); }
      tr.entry { cursor: pointer; }
      tr.entry:hover, tr.entry.open { background: var(--it-soft); }
      tr.form { border-top: none; }
      tr.form td { padding: 0 0 8px; }
      /* The table may scroll sideways; its form stays within the visible width. */
      .pinned { position: sticky; left: 20px; width: calc(100cqw - 40px); }
      .name { font-weight: 600; }
      .aliases { color: var(--it-muted); font-size: 0.9rem; min-width: 120px; }
      .num { white-space: nowrap; }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._query = "";
  }

  willUpdate(changed) {
    if (changed.has("kind")) {
      this._entries = undefined;
      this._open = undefined;
      this._load();
    }
  }

  get _isUnit() {
    return this.kind === "units";
  }

  async _load() {
    const action = this._isUnit ? "list_units" : "list_ingredients";
    try {
      const [list, usage] = await Promise.all([this.api.call(action), this.api.call("catalog_usage")]);
      this._entries = list[this.kind].sort((a, b) => nameOf(a, this.lang).localeCompare(nameOf(b, this.lang)));
      this._usage = usage[this.kind];
      this._error = undefined;
    } catch (err) {
      this._error = err.message;
    }
  }

  _changed() {
    this._open = undefined;
    this._load();
  }

  _toggle(id) {
    this._open = this._open === id ? undefined : id;
  }

  _form(entry) {
    return html`<itadaki-entry .api=${this.api} .t=${this.t} lang=${this.lang} .languages=${this.languages} kind=${this.kind} .entry=${entry}
      .entries=${this._entries} .usedBy=${entry ? this._usage[entry.id] : []}
      @changed=${this._changed} @cancel=${() => (this._open = undefined)}></itadaki-entry>`;
  }

  // The kind-specific columns: header labels and the cells for one entry.
  _columns() {
    const t = this.t;
    if (!this._isUnit) return { heads: [t("density")], cells: (e) => [e.density ?? ""] };
    return {
      heads: [t("dimension"), t("size"), t("systems")],
      cells: (e) => [
        t(`dim_${e.dimension}`),
        e.factor != null ? `${e.factor} ${BASE_UNIT[e.dimension] ?? t("items")}` : "",
        e.systems.map((s) => t(`sys_${s}`)).join(", "),
      ],
    };
  }

  render() {
    return html`<itadaki-page .t=${this.t} header=${this.t(this.kind)}>${this._content()}</itadaki-page>`;
  }

  _content() {
    const t = this.t;
    const shown = this._entries ? search(this._entries, this._query, Infinity) : [];
    const languages = this.languages.includes(this.lang) ? [this.lang, ...this.languages.filter((l) => l !== this.lang)] : this.languages;
    const columns = this._columns();
    const span = languages.length * 2 + columns.heads.length + 1;
    return html`
      <div class="tools">
        <itadaki-text .value=${this._query} placeholder=${t("catalogSearch")} @input=${(e) => (this._query = e.target.value)}></itadaki-text>
        <button class="btn" @click=${() => this._toggle("new")}>+ ${t("newEntry")}</button>
      </div>
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      ${this._open === "new" ? html`<div class="card" style="margin-bottom:16px;padding:20px">${this._form(null)}</div>` : nothing}
      ${this._entries
        ? html`<div class="card">
            <table>
              <thead>
                <tr>
                  ${languages.map((l) => html`<th>${t.langName(l)}</th><th>${t("otherNames")}</th>`)}
                  ${columns.heads.map((h) => html`<th>${h}</th>`)}
                  <th>${t("recipes")}</th>
                </tr>
              </thead>
              <tbody>
                ${shown.map(
                  (entry) => html`
                    <tr class="entry ${this._open === entry.id ? "open" : ""}" @click=${() => this._toggle(entry.id)}>
                      ${languages.map((l) => {
                        const n = entry.localized[l];
                        return html`<td>
                            <span class="name">${n?.name ?? ""}</span>
                            ${n?.plural ? html`<span class="muted"> · ${n.plural}</span>` : nothing}
                          </td>
                          <td class="aliases">${(n?.aliases || []).join(", ")}</td>`;
                      })}
                      ${columns.cells(entry).map((c) => html`<td class="num">${c}</td>`)}
                      <td class="num">${this._usage[entry.id]?.length || html`<span class="muted">${t("unused")}</span>`}</td>
                    </tr>
                    ${this._open === entry.id ? html`<tr class="form"><td colspan=${span}><div class="pinned">${this._form(entry)}</div></td></tr>` : nothing}
                  `,
                )}
              </tbody>
            </table>
          </div>`
        : nothing}
    `;
  }
}
customElements.define("itadaki-catalog", ItadakiCatalog);
