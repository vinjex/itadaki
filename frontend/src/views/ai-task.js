import { LitElement, html, nothing } from "lit";
import { shared } from "../styles.js";
import "./ai-run.js";

// An AI action on one recipe or many, through the shared AI card. `task` is
// {action: "adapt"}, {action: "tag"} or {action: "translate", language, again?}.
// Starts one background job per recipe and fires `started` with the action's answer
// ({draft_ids, skipped?}), or `cancel`.
class ItadakiAiTask extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    task: { attribute: false },
    recipeIds: { attribute: false },
    instructions: { attribute: false },
    _busy: { state: true },
    _error: { state: true },
  };

  static styles = [shared];

  _call({ note, asVariant }) {
    const ids = this.recipeIds;
    const noted = note ? { note } : {};
    const { action, language } = this.task;
    if (action === "adapt") return ["adapt", { recipe_ids: ids, instruction: note, as_variant: asVariant }];
    if (action === "tag") return ["suggest_tags", { recipe_ids: ids, ...noted }];
    return ["translate", { recipe_ids: ids, language, ...noted }];
  }

  async _run(e) {
    this._busy = true;
    this._error = undefined;
    try {
      const result = await this.api.call(...this._call(e.detail));
      this.dispatchEvent(new CustomEvent("started", { detail: result }));
    } catch (err) {
      this._error = this.t.error(err);
    } finally {
      this._busy = false;
    }
  }

  render() {
    const t = this.t;
    const { action, language, again } = this.task;
    const adapt = action === "adapt";
    const heading = action === "translate" ? t("translateTo", { lang: t.langName(language) }) : t(`${action}Ai`);
    return html`<itadaki-ai-run .t=${t} cancellable ?variant=${adapt} ?noteRequired=${adapt}
      heading=${heading} .standing=${this.instructions[action]} ?disabled=${this._busy}
      @run=${this._run} @cancel=${() => this.dispatchEvent(new CustomEvent("cancel"))}>
      ${this.recipeIds.length > 1 ? html`<div class="muted">${t("forNRecipes", { n: this.recipeIds.length })}</div>` : nothing}
      ${again ? html`<div class="muted">${t("retranslateNote")}</div>` : nothing}
      ${action === "tag" ? html`<div class="muted">${t("tagAiExplain")}</div>` : nothing}
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
    </itadaki-ai-run>`;
  }
}
customElements.define("itadaki-ai-task", ItadakiAiTask);
