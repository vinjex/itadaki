import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import { exactMatch, search } from "../search.js";

// Search box for picking an ingredient, or creating one when nothing matches.
// An empty field shows nothing until you type; a filled one shows the entries that
// share its name, so similar ingredients are one click away. Fires `pick` with {id}
// or `create` with {name}.
class ItadakiCombo extends LitElement {
  // Focusing the element focuses its text box.
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static properties = {
    entries: { attribute: false },
    value: {},
    label: { attribute: false },
    hint: { attribute: false },
    placeholder: {},
    createLabel: {},
    noCreate: { type: Boolean },
    invalid: { type: Boolean, reflect: true },
    _query: { state: true },
    _open: { state: true },
    _active: { state: true },
  };

  static styles = [
    shared,
    css`
      :host { display: block; position: relative; min-width: 0; }
      :host([invalid]) input { border-color: var(--it-error); }
      ul {
        position: absolute; z-index: 5; left: 0; right: 0; top: calc(100% + 4px); margin: 0; padding: 6px;
        list-style: none; background: var(--it-surface); border-radius: 14px;
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18); max-height: 280px; overflow: auto;
      }
      li { padding: 8px 10px; border-radius: 10px; cursor: pointer; display: flex; justify-content: space-between; gap: 12px; }
      li.active { background: var(--it-soft); }
      li .hint { color: var(--it-muted); font-size: 0.85rem; }
      li.create { color: var(--it-accent); font-weight: 600; }
    `,
  ];

  willUpdate(changed) {
    if (changed.has("value") && !this._open) this._query = undefined;
  }

  _results() {
    // Until something is typed, the current name is the search, without offering
    // to create it again.
    const typed = this._query !== undefined;
    const query = typed ? this._query : this.label ?? "";
    const matches = query.trim() ? search(this.entries, query) : [];
    const create = !this.noCreate && typed && query.trim() && !exactMatch(this.entries, query);
    return { matches, create };
  }

  _choose(index) {
    const { matches, create } = this._results();
    if (index < matches.length) this.dispatchEvent(new CustomEvent("pick", { detail: { id: matches[index].id } }));
    else if (create) this.dispatchEvent(new CustomEvent("create", { detail: { name: this._query.trim() } }));
    this._open = false;
    this._query = undefined;
    this.renderRoot.querySelector("input").blur();
  }

  _key(e) {
    const { matches, create } = this._results();
    const count = matches.length + (create ? 1 : 0);
    if (e.key === "ArrowDown") this._active = Math.min((this._active ?? -1) + 1, count - 1);
    else if (e.key === "ArrowUp") this._active = Math.max((this._active ?? 0) - 1, 0);
    else if (e.key === "Enter" && count) this._choose(this._active ?? 0);
    else if (e.key === "Escape") {
      this._open = false;
      this._query = undefined;
    } else return;
    e.preventDefault();
  }

  render() {
    const { matches, create } = this._open ? this._results() : { matches: [], create: false };
    return html`
      <input type="text" placeholder=${this.placeholder ?? ""}
        .value=${this._query ?? this.label ?? ""}
        @focus=${(e) => { e.target.select(); this._open = Boolean(this.label); this._active = undefined; }}
        @blur=${() => { this._open = false; this._query = undefined; }}
        @input=${(e) => { this._query = e.target.value; this._open = Boolean(this._query.trim()); this._active = 0; }}
        @keydown=${this._key} />
      ${this._open && (matches.length || create)
        ? html`<ul @mousedown=${(e) => e.preventDefault()}>
            ${matches.map(
              (entry, i) => html`<li class=${i === this._active ? "active" : ""} @click=${() => this._choose(i)}>
                <span>${this.hint(entry).name}</span><span class="hint">${this.hint(entry).hint}</span>
              </li>`,
            )}
            ${create
              ? html`<li class="create ${this._active === matches.length ? "active" : ""}" @click=${() => this._choose(matches.length)}>
                  + ${this.createLabel} “${this._query.trim()}”</li>`
              : nothing}
          </ul>`
        : nothing}
    `;
  }
}
customElements.define("itadaki-combo", ItadakiCombo);
