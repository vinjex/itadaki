import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import { describer, nameOf } from "../catalog.js";
import { exactMatch } from "../search.js";
import "./combo.js";

// Chosen tags as chips plus a search box to add more. `value` is the chosen ids. Fires
// `change` with {value}, and `create` with {name} when `createLabel` is set and the
// typed name matches no tag. With `freeText` the box is also a text search: `text` is
// its content, reported by `text` events with {value}, and tags are only suggested.
// `only` set to "chips" or "box" draws just that half, so a screen can place them
// apart: the box in its header, the chosen tags below it.
class ItadakiTags extends LitElement {
  static properties = {
    entries: { attribute: false },
    value: { attribute: false },
    lang: {},
    hint: { attribute: false },
    t: { attribute: false },
    placeholder: {},
    createLabel: {},
    freeText: { type: Boolean },
    text: {},
    only: {},
  };

  static styles = [
    shared,
    css`
      :host { display: block; }
      .row { margin-bottom: 8px; }
      .x { background: none; border: none; color: inherit; cursor: pointer; padding: 0 0 0 4px; font: inherit; opacity: 0.6; }
      .x:hover { opacity: 1; }
    `,
  ];

  get _value() {
    return this.value || [];
  }

  // A name some tag already answers to adds that tag instead of making a twin.
  _create(name) {
    const existing = exactMatch(this.entries || [], name);
    if (!existing) this.dispatchEvent(new CustomEvent("create", { detail: { name } }));
    else if (!this._value.includes(existing.id)) this._fire([...this._value, existing.id]);
  }

  focus() {
    this.renderRoot.querySelector("itadaki-combo")?.focus();
  }

  // Backspace in an empty box takes off the last tag, as in most tag fields.
  _key(e) {
    if (e.key === "Backspace" && !e.composedPath()[0].value && this._value.length) this._fire(this._value.slice(0, -1));
  }

  _fire(value) {
    this.dispatchEvent(new CustomEvent("change", { detail: { value } }));
  }

  render() {
    const value = this._value;
    const byId = new Map((this.entries || []).map((e) => [e.id, e]));
    const chip = (id) => html`<span class="chip">
      ${byId.has(id) ? nameOf(byId.get(id), this.lang) : id}
      <button class="x" aria-label=${this.t("remove")} title=${this.t("remove")}
        @click=${() => this._fire(value.filter((x) => x !== id))}>×</button>
    </span>`;
    return html`
      ${value.length && this.only !== "box" ? html`<div class="row">${value.map(chip)}</div>` : nothing}
      ${this.only === "chips" ? nothing : html`<itadaki-combo .entries=${(this.entries || []).filter((e) => !value.includes(e.id))}
        .hint=${this.hint || describer(this.lang)} placeholder=${this.placeholder ?? ""}
        ?noCreate=${!this.createLabel} createLabel=${this.createLabel ?? nothing}
        ?freeText=${this.freeText} .label=${this.freeText ? this.text ?? "" : undefined} @keydown=${this._key}
        @text=${(e) => this.dispatchEvent(new CustomEvent("text", { detail: e.detail }))}
        @pick=${(e) => this._fire([...value, e.detail.id])}
        @create=${(e) => this._create(e.detail.name)}></itadaki-combo>`}
    `;
  }
}
customElements.define("itadaki-tags", ItadakiTags);
