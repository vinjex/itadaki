import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import "./amount.js";

// Ingredients, steps and notes of a recipe, shared by the saved view, the draft
// review and cooking mode so all show a recipe the same way. Cooking mode is
// larger and leaves out the notes. With `scalable`, tapping an amount scales the
// whole recipe to it: fires `scale` with {ratio} of the new amount to the shown one.
// Slots let a screen add to the ingredients card without this knowing what: a header
// action (`ingredients-action`), a note under the heading (`ingredients-note`), and
// content shown instead of the lines (`ingredients`).
function bySection(items, sectionOf) {
  const groups = [];
  items.forEach((item, i) => {
    const section = sectionOf(item, i) || "";
    const last = groups[groups.length - 1];
    if (last && last.section === section) last.items.push(item);
    else groups.push({ section, items: [item] });
  });
  return groups;
}

class ItadakiBody extends LitElement {
  static properties = {
    recipe: { attribute: false },
    lines: { attribute: false },
    t: { attribute: false },
    cooking: { type: Boolean, reflect: true },
    scalable: { type: Boolean },
  };

  static styles = [
    shared,
    css`
      :host { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); }
      @media (max-width: 800px) { :host { grid-template-columns: minmax(0, 1fr); } }
      .item { display: flex; gap: 14px; padding: 12px 0; line-height: 1.5; }
      .item + .item { border-top: var(--it-row-rule); }
      .item:first-of-type { padding-top: 4px; }
      .ingredient { display: block; }
      .ingredient .line { display: flex; gap: 12px; justify-content: space-between; align-items: baseline; }
      .measure { text-align: right; white-space: nowrap; font-weight: 600; }
      .ingredient .note { font-size: 0.85em; color: var(--it-muted); }
      .num { flex-shrink: 0; width: 1.8em; height: 1.8em; border-radius: 50%; display: grid; place-items: center;
        background: var(--it-soft); font-weight: 600; font-size: 0.85em; }
      :host([cooking]) { font-size: 1.3rem; }
      :host([cooking]) h2 { font-size: 1.4rem; }
      :host([cooking]) .item { padding: 20px 0; line-height: 1.6; }
      h3 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--it-muted); margin: 16px 0 4px; }
      .notes { grid-column: 1 / -1; white-space: pre-wrap; }
      .head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: -8px -8px 12px 0; min-height: 40px; }
      .card > .head { padding-bottom: 0; }
      .head h2 { margin: 0; }
    `,
  ];

  _measure(line) {
    const quantity = this.recipe.ingredients[line.index]?.quantity;
    if (!this.scalable || quantity == null) return line.measure;
    const scale = (e) =>
      this.dispatchEvent(new CustomEvent("scale", { detail: { ratio: e.detail.value / quantity }, bubbles: true, composed: true }));
    return html`<itadaki-amount .value=${quantity} text=${line.measure} unit=${line.unit}
      label=${this.t("amountFor", { name: line.name })} @amount=${scale}></itadaki-amount>`;
  }

  render() {
    const { recipe, lines, t } = this;
    const indexed = lines.map((line, index) => ({ ...line, index }));
    const ingredientGroups = bySection(indexed, (line) => recipe.ingredients[line.index]?.section);
    const stepGroups = bySection(recipe.steps.map((s, i) => ({ ...s, number: i + 1 })), (s) => s.section);
    return html`
      <div class="card">
        <div class="head"><h2>${t("ingredients")}</h2><slot name="ingredients-action"></slot></div>
        <slot name="ingredients-note"></slot>
        <slot name="ingredients">${ingredientGroups.map(
          (g) => html`${g.section ? html`<h3>${g.section}</h3>` : nothing}
            ${g.items.map(
              (line) => html`<div class="item ingredient">
                <div class="line"><span>${line.name}</span><span class="measure">${this._measure(line)}</span></div>
                ${line.note ? html`<div class="note">${line.note}</div>` : nothing}
              </div>`,
            )}`,
        )}</slot>
      </div>
      <div class="card">
        <h2>${t("steps")}</h2>
        ${stepGroups.map(
          (g) => html`${g.section ? html`<h3>${g.section}</h3>` : nothing}
            ${g.items.map((s) => html`<div class="item"><span class="num">${s.number}</span><span>${s.text}</span></div>`)}`,
        )}
      </div>
      ${recipe.notes && !this.cooking ? html`<div class="card notes"><h2>${t("notes")}</h2>${recipe.notes}</div>` : nothing}
    `;
  }
}
customElements.define("itadaki-body", ItadakiBody);
