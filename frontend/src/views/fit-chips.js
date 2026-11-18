import { LitElement, html, css } from "lit";
import { shared } from "../styles.js";

// One line of chips: as many of `labels` as fit, then "+N" for the rest, whose names
// show on hover. A first chip too long even alone is cut with an ellipsis.
class ItadakiFitChips extends LitElement {
  static properties = { labels: { attribute: false } };

  static styles = [
    shared,
    css`
      :host { display: block; min-width: 0; }
      .line { display: flex; gap: 4px; overflow: hidden; min-height: 1.4rem; }
      .chip { padding: 2px 8px; font-size: 0.75rem; flex-shrink: 0; white-space: nowrap; }
      .squeeze .chip:first-child { flex-shrink: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; display: block; }
      .chip.gone { display: none; }
      .more { background: none; color: var(--it-muted); padding: 2px 4px; }
    `,
  ];

  // Watched again on every attach: Lit may move a card and so detach and reattach it.
  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;
    if (!this.isConnected) return;
    this._observer ??= new ResizeObserver(() => this._fit());
    this._observer.observe(this.renderRoot.querySelector(".line"));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer?.disconnect();
  }

  updated() {
    this._fit();
  }

  // Hides chips from the end until the row stops overflowing. The chips are toggled
  // directly because the answer depends on the drawn width, known only after render.
  _fit() {
    const line = this.renderRoot.querySelector(".line");
    const chips = [...line.querySelectorAll(".chip:not(.more)")];
    const more = line.querySelector(".more");
    line.classList.remove("squeeze");
    chips.forEach((c) => c.classList.remove("gone"));
    more.classList.add("gone");
    let shown = chips.length;
    while (shown > 1 && line.scrollWidth > line.clientWidth) {
      chips[--shown].classList.add("gone");
      more.classList.remove("gone");
      more.textContent = `+${chips.length - shown}`;
      more.title = (this.labels || []).slice(shown).join(", ");
    }
    line.classList.add("squeeze");
  }

  render() {
    return html`<div class="line">
      ${(this.labels || []).map((label) => html`<span class="chip" title=${label}>${label}</span>`)}
      <span class="chip more gone"></span>
    </div>`;
  }
}
customElements.define("itadaki-fit-chips", ItadakiFitChips);
