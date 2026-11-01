import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";

// Ingredients, steps and notes of a recipe, shared by the saved view, the draft
// review and cooking mode so all show a recipe the same way. Cooking mode is
// larger and leaves out the notes.
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
  };

  static styles = [
    shared,
    css`
      :host { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); }
      @media (max-width: 800px) { :host { grid-template-columns: minmax(0, 1fr); } }
      .item { display: flex; gap: 14px; padding: 12px 0; line-height: 1.5; }
      .item + .item { border-top: 1px solid var(--it-divider); }
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
    `,
  ];

  render() {
    const { recipe, lines, t } = this;
    const ingredientGroups = bySection(lines, (_, i) => recipe.ingredients[i]?.section);
    const stepGroups = bySection(recipe.steps.map((s, i) => ({ ...s, number: i + 1 })), (s) => s.section);
    return html`
      <div class="card">
        <h2>${t("ingredients")}</h2>
        ${ingredientGroups.map(
          (g) => html`${g.section ? html`<h3>${g.section}</h3>` : nothing}
            ${g.items.map(
              (line) => html`<div class="item ingredient">
                <div class="line"><span>${line.name}</span><span class="measure">${line.measure}</span></div>
                ${line.note ? html`<div class="note">${line.note}</div>` : nothing}
              </div>`,
            )}`,
        )}
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
