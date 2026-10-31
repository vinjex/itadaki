import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";

// Ingredients, steps and notes of a recipe, shared by the saved view and the draft
// review so both always show a recipe the same way.
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
  static properties = { recipe: { attribute: false }, lines: { attribute: false }, t: { attribute: false } };

  static styles = [
    shared,
    css`
      :host { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); }
      @media (max-width: 800px) { :host { grid-template-columns: minmax(0, 1fr); } }
      ul { margin: 0; padding-left: 20px; }
      li { margin: 6px 0; }
      ol { margin: 0; padding-left: 22px; }
      ol li { margin: 10px 0; line-height: 1.5; }
      h3 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--it-muted); margin: 16px 0 4px; }
      .notes { grid-column: 1 / -1; white-space: pre-wrap; }
    `,
  ];

  render() {
    const { recipe, lines, t } = this;
    const ingredientGroups = bySection(lines, (_, i) => recipe.ingredients[i]?.section);
    const stepGroups = bySection(recipe.steps, (s) => s.section);
    return html`
      <div class="card">
        <h2>${t("ingredients")}</h2>
        ${ingredientGroups.map(
          (g) => html`${g.section ? html`<h3>${g.section}</h3>` : nothing}
            <ul>${g.items.map((line) => html`<li>${line}</li>`)}</ul>`,
        )}
      </div>
      <div class="card">
        <h2>${t("steps")}</h2>
        ${stepGroups.map(
          (g) => html`${g.section ? html`<h3>${g.section}</h3>` : nothing}
            <ol>${g.items.map((s) => html`<li>${s.text}</li>`)}</ol>`,
        )}
      </div>
      ${recipe.notes ? html`<div class="card notes"><h2>${t("notes")}</h2>${recipe.notes}</div>` : nothing}
    `;
  }
}
customElements.define("itadaki-body", ItadakiBody);
