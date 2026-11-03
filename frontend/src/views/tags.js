import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import { describer, nameOf } from "../catalog.js";
import { exactMatch } from "../search.js";
import "./combo.js";

// Chosen tags as chips plus a search box to add more. `value` is the chosen ids; with
// `toggleable`, tapping a chip moves it to `excluded` and back, for filters. Fires
// `change` with {value, excluded}, and `create` with {name} when `createLabel` is set
// and the typed name matches no tag.
class ItadakiTags extends LitElement {
  static properties = {
    entries: { attribute: false },
    value: { attribute: false },
    excluded: { attribute: false },
    lang: {},
    hint: { attribute: false },
    t: { attribute: false },
    placeholder: {},
    createLabel: {},
    toggleable: { type: Boolean },
  };

  static styles = [
    shared,
    css`
      :host { display: block; }
      .row { margin-bottom: 8px; }
      .chip.excluded { background: color-mix(in srgb, var(--it-error) 16%, transparent); text-decoration: line-through; }
      .x { background: none; border: none; color: inherit; cursor: pointer; padding: 0 0 0 4px; font: inherit; opacity: 0.6; }
      .x:hover, .x.name { opacity: 1; }
      .x.name { padding: 0; }
    `,
  ];

  // A name some tag already answers to adds that tag instead of making a twin.
  _create(name) {
    const value = this.value || [];
    const excluded = this.excluded || [];
    const existing = exactMatch(this.entries || [], name);
    if (!existing) this.dispatchEvent(new CustomEvent("create", { detail: { name } }));
    else if (![...value, ...excluded].includes(existing.id)) this._fire([...value, existing.id], excluded);
  }

  _fire(value, excluded) {
    this.dispatchEvent(new CustomEvent("change", { detail: { value, excluded } }));
  }

  render() {
    const value = this.value || [];
    const excluded = this.excluded || [];
    const byId = new Map((this.entries || []).map((e) => [e.id, e]));
    const chosen = new Set([...value, ...excluded]);
    const chip = (id, out) => {
      const entry = byId.get(id);
      const name = entry ? nameOf(entry, this.lang) : id;
      const others = (list) => list.filter((x) => x !== id);
      const toggle = () => (out ? this._fire([...value, id], others(excluded)) : this._fire(others(value), [...excluded, id]));
      return html`<span class="chip ${out ? "excluded" : ""}">
        ${this.toggleable ? html`<button class="x name" @click=${toggle}>${name}</button>` : name}
        <button class="x" aria-label=${this.t("remove")} title=${this.t("remove")}
          @click=${() => this._fire(others(value), others(excluded))}>×</button>
      </span>`;
    };
    return html`
      ${chosen.size ? html`<div class="row">${value.map((id) => chip(id, false))}${excluded.map((id) => chip(id, true))}</div>` : nothing}
      <itadaki-combo .entries=${(this.entries || []).filter((e) => !chosen.has(e.id))}
        .hint=${this.hint || describer(this.lang)} placeholder=${this.placeholder ?? ""}
        ?noCreate=${!this.createLabel} createLabel=${this.createLabel ?? nothing}
        @pick=${(e) => this._fire([...value, e.detail.id], excluded)}
        @create=${(e) => this._create(e.detail.name)}></itadaki-combo>
    `;
  }
}
customElements.define("itadaki-tags", ItadakiTags);
