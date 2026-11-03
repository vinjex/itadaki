import { LitElement, html, css, nothing } from "lit";
import { shared } from "../styles.js";
import "./ai-run.js";
import "./body.js";
import "./busy.js";
import "./page.js";
import "./editor.js";
import "./text.js";
import { describeRequest } from "../drafts.js";
import { headerButton } from "../icons.js";

import { navigate } from "../router.js";
import { loadCatalog } from "../catalog.js";

// A draft from the inbox, live: it shows whatever exists so far and refreshes when
// the job reports back. When ready, the whole recipe is editable, and so are the
// names of the ingredients about to join the shared list. More AI work on it (matching
// the ingredient lines, adapting) only starts from the AI card, never by itself.
class ItadakiDraft extends LitElement {
  static properties = {
    api: { attribute: false },
    t: { attribute: false },
    lang: {},
    languages: { attribute: false },
    ai: { type: Boolean },
    instructions: { attribute: false },
    draftId: {},
    _task: { state: true },
    // Page lines in review still without an ingredient, as the editor counts them.
    _unmatched: { state: true },
    _entry: { state: true },
    _catalog: { state: true },
    _busy: { state: true },
    _error: { state: true },
  };

  static styles = [
    shared,
    css`
      .head { margin-bottom: 16px; }
      .actions { margin: 16px 0; }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._unsubscribe = this.api.subscribeDrafts((update) => {
      if (update.draft_id !== this.draftId) return;
      if (update.status === "saved") navigate(this, { view: "recipe", id: update.recipe_id, replace: true });
      else this._load();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribe?.then((stop) => stop());
  }

  updated(changed) {
    if (changed.has("draftId")) this._load();
  }

  async _load() {
    try {
      const entry = await this.api.call("get_draft", { draft_id: this.draftId });
      if (entry.status === "ready" && !this._catalog) {
        const [ingredients, units, tags] = await Promise.all(["ingredients", "units", "recipe_tags"].map((k) => loadCatalog(this.api, k)));
        this._catalog = { ingredients, units, tags };
      }
      this._entry = entry;
      this._error = undefined;
    } catch (err) {
      this._error = this.t.error(err);
    }
  }

  // The draft as edited in review, for saving it or sending it back to the AI.
  _edited() {
    const editor = this.renderRoot.querySelector("itadaki-editor");
    return {
      ...structuredClone(this._entry.draft),
      recipe: editor.value,
      new_ingredients: editor.newIngredientsUsed,
      new_tags: editor.newTagsUsed,
      suggested_tags: editor.suggestedTagsLeft,
      raw_lines: editor.unmatchedLines,
    };
  }

  async _save() {
    await this._act(async () => {
      const { recipe } = await this.api.call("save_draft", { draft_id: this.draftId, draft: this._edited() });
      navigate(this, { view: "recipe", id: recipe.id, replace: true });
    });
  }

  async _runTask(e) {
    const { note } = e.detail;
    const data = { draft_id: this.draftId, draft: this._edited() };
    if (this._task === "adapt") data.instruction = note;
    else if (note) data.note = note;
    const action = { adapt: "adapt_draft", structure: "structure_draft", tag: "tag_draft" }[this._task];
    await this._act(() => this.api.call(action, data));
    this._task = undefined;
    await this._load();
  }

  async _discard() {
    await this._act(async () => {
      await this.api.call("discard_draft", { draft_id: this.draftId });
      navigate(this, { view: "back" });
    });
  }

  async _act(work) {
    this._busy = true;
    this._error = undefined;
    try {
      await work();
    } catch (err) {
      this._error = this.t.error(err);
    } finally {
      this._busy = false;
    }
  }

  render() {
    return html`<itadaki-page .t=${this.t} header=${this._entry ? this.t.action(this._entry.action) : ""}>${this._actions()}${this._content()}</itadaki-page>`;
  }

  _content() {
    const t = this.t;
    const entry = this._entry;
    if (!entry) return this._error ? html`<div class="error">${this._error}</div>` : html`<itadaki-busy></itadaki-busy>`;
    const draft = entry.draft;
    const ready = entry.status === "ready";

    if (!draft) {
      return html`
        <div class="card head">
          <h2>${entry.title}</h2>
          ${this._request(entry)}
          ${entry.status === "working" ? html`<itadaki-busy .text=${t("workingLeave")}></itadaki-busy>` : nothing}
          ${entry.error ? html`<div class="error">${entry.error}</div>` : nothing}
          ${entry.status === "failed" ? html`<button class="btn quiet" @click=${this._discard}>${t("discard")}</button>` : nothing}
        </div>
      `;
    }

    const recipe = draft.recipe;
    // Raw lines still being structured show as written, after any structured ones.
    const shown = {
      ...recipe,
      ingredients: [...recipe.ingredients, ...draft.raw_lines.map((r) => ({ section: r.section }))],
    };
    const lines = [...(entry.lines || []), ...draft.raw_lines.map((r) => ({ name: r.text }))];

    if (ready) return this._renderReview(draft);

    return html`
      <div class="card head">
        <h2>${entry.title}</h2>
        ${this._request(entry)}
        ${entry.status === "working" ? html`<itadaki-busy .text=${t("workingLeave")}></itadaki-busy>` : nothing}
        ${entry.error ? html`<div class="error">${entry.error}</div>` : nothing}
        ${entry.status === "failed" ? html`<button class="btn quiet" @click=${this._discard}>${t("discard")}</button>` : nothing}
      </div>
      <itadaki-body .recipe=${shown} .lines=${lines} .t=${t}></itadaki-body>
    `;
  }

  _request(entry) {
    const t = this.t;
    const text = describeRequest(t, entry);
    return html`<div class="muted" style="margin-bottom:8px">${t.action(entry.action)}${text ? html` · ${text}` : nothing}</div>`;
  }

  // Lines the AI did not structure (AI is off, or it failed) are finished by hand:
  // each becomes an empty line showing what the page said. Built once per loaded
  // draft, since a new object would reset the edits in the editor.
  _reviewRecipe(draft) {
    if (this._reviewOf !== draft) {
      this._reviewOf = draft;
      this._review = {
        ...draft.recipe,
        ingredients: [
          ...draft.recipe.ingredients,
          ...draft.raw_lines.map((r) => ({ ingredient_id: null, quantity: null, unit_id: null, note: null, section: r.section, _raw: r.text })),
        ],
      };
    }
    return this._review;
  }

  _renderReview(draft) {
    const t = this.t;
    const recipe = this._reviewRecipe(draft);
    return html`
      <div class="card head">
        <h2>${t("review")} · ${t.langName(recipe.language)}</h2>
        ${this._request(this._entry)}
        <div class="muted" style="font-size:0.8rem">
          ${t("tokens", { in: draft.usage.prompt_tokens, out: draft.usage.completion_tokens })}
        </div>
        ${this._entry.error ? html`<div class="error">${t("aiFailedKept", { error: this._entry.error })}</div>` : nothing}
      </div>

      ${this._unmatched && this._task !== "structure" ? this._matchCard() : nothing}
      ${this._task ? this._taskCard() : nothing}

      <itadaki-editor @unmatched-changed=${(e) => (this._unmatched = e.detail.count)} .api=${this.api} .languages=${this.languages} .recipe=${recipe} .t=${t} uiLang=${this.lang} .units=${this._catalog.units}
        .ingredients=${this._catalog.ingredients} .newIngredients=${draft.new_ingredients}
        .tags=${this._catalog.tags} .newTags=${draft.new_tags} .suggestedTags=${draft.suggested_tags}
        ?fixedLanguage=${Boolean(draft.updates_id || draft.parent_id)}></itadaki-editor>

      <div class="row actions">
        <button class="btn" ?disabled=${this._busy} @click=${this._save}>${t("save")}</button>
        <button class="btn quiet" ?disabled=${this._busy} @click=${this._discard}>${t("discard")}</button>
      </div>
      ${this._busy ? html`<itadaki-busy></itadaki-busy>` : nothing}
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
    `;
  }

  // A draft cannot be saved while page lines lack an ingredient, so the review says
  // so up front and offers both ways to finish them.
  _matchCard() {
    const t = this.t;
    const editor = () => this.renderRoot.querySelector("itadaki-editor");
    return html`<div class="card actions">
      <h2>${t("matchTitle", { n: this._unmatched })}</h2>
      <div class="muted">${t("matchExplain")} ${t(this.ai ? "matchHowAi" : "matchHowHand")}</div>
      <div class="row" style="margin-top:12px">
        ${this.ai ? html`<button class="btn" ?disabled=${this._busy} @click=${() => (this._task = "structure")}>${t("structureAi")}</button>` : nothing}
        <button class="btn quiet" @click=${() => editor().showUnmatched()}>${t("matchByHand")}</button>
      </div>
    </div>`;
  }

  // Header icon, as on a recipe: adapting rewrites the whole recipe and matches the
  // lines along the way.
  _actions() {
    const t = this.t;
    const entry = this._entry;
    if (!this.ai || entry?.status !== "ready") return nothing;
    const toggle = (task) => () => (this._task = this._task === task ? undefined : task);
    return html`
      ${headerButton("tag", t("tagAi"), toggle("tag"), this._busy)}
      ${headerButton("adapt", t("adaptAi"), toggle("adapt"), this._busy)}
    `;
  }

  _taskCard() {
    const t = this.t;
    const adapt = this._task === "adapt";
    const heading = { adapt: t("adaptAi"), structure: t("structureAi"), tag: t("tagAi") }[this._task];
    const explain = { structure: t("matchExplain"), tag: t("tagAiExplain") }[this._task];
    return html`<itadaki-ai-run class="actions" .t=${t} cancellable ?noteRequired=${adapt} ?disabled=${this._busy}
      heading=${heading} .standing=${this.instructions[this._task]}
      @run=${this._runTask} @cancel=${() => (this._task = undefined)}>
      ${explain ? html`<div class="muted">${explain}</div>` : nothing}
    </itadaki-ai-run>`;
  }
}
customElements.define("itadaki-draft", ItadakiDraft);
