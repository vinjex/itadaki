import { css } from "lit";

// Everything is drawn from Home Assistant's theme variables, with fallbacks so the
// panel still looks right outside HA. Generous radii and soft surfaces follow Fluvy.
export const shared = css`
  :host {
    --it-radius: var(--ha-card-border-radius, 20px);
    --it-surface: var(--card-background-color, #fff);
    --it-text: var(--primary-text-color, #1c1c1e);
    --it-muted: var(--secondary-text-color, #6e6e73);
    --it-accent: var(--primary-color, #ff8a3d);
    --it-on-accent: var(--text-primary-color, #fff);
    --it-divider: var(--divider-color, rgba(0, 0, 0, 0.12));
    --it-soft: color-mix(in srgb, var(--it-accent) 12%, transparent);
    --it-warn: var(--warning-color, #f5a524);
    --it-error: var(--error-color, #e5484d);
    color: var(--it-text);
    font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, system-ui, sans-serif));
  }
  * { box-sizing: border-box; }
  .card {
    background: var(--it-surface);
    border-radius: var(--it-radius);
    box-shadow: var(--ha-card-box-shadow, 0 2px 12px rgba(0, 0, 0, 0.06));
    border: var(--ha-card-border-width, 0) solid var(--ha-card-border-color, var(--it-divider));
    padding: 20px;
  }
  h2 { font-size: 1.05rem; font-weight: 600; margin: 0 0 12px; }
  .muted { color: var(--it-muted); }
  .chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 12px; border-radius: 999px; font-size: 0.8rem;
    background: var(--it-soft); color: var(--it-text); border: none;
    font: inherit; font-size: 0.8rem; cursor: default;
  }
  button.chip { cursor: pointer; }
  .chip.active { background: var(--it-accent); color: var(--it-on-accent); }
  .btn {
    font: inherit; font-weight: 600; cursor: pointer; border: none;
    border-radius: 999px; padding: 10px 20px;
    background: var(--it-accent); color: var(--it-on-accent);
  }
  .btn.quiet { background: var(--it-soft); color: var(--it-text); }
  .btn.danger { background: transparent; color: var(--it-error); }
  .btn:disabled { opacity: 0.5; cursor: default; }
  input[type="text"], input[type="url"], input[type="search"], input[type="password"], textarea {
    width: 100%; font: inherit; color: var(--it-text);
    background: var(--input-fill-color, var(--secondary-background-color, #f2f2f7));
    border: 1px solid transparent; border-radius: 14px; padding: 12px 14px;
  }
  select, input[type="number"] {
    width: 100%; font: inherit; color: var(--it-text); padding: 10px 8px; border-radius: 12px;
    border: 1px solid transparent; background: var(--input-fill-color, var(--secondary-background-color, #f2f2f7));
  }
  input:focus, textarea:focus { outline: none; border-color: var(--it-accent); }
  label { display: block; font-size: 0.85rem; color: var(--it-muted); margin: 12px 0 6px; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .error { color: var(--it-error); margin: 12px 0; }
  .icon { background: none; border: none; color: inherit; cursor: pointer; padding: 12px; display: flex; border-radius: 50%; }
  .icon:hover { background: var(--it-soft); }
  .icon:disabled { opacity: 0.5; cursor: default; }
  .icon svg { width: 24px; height: 24px; fill: currentColor; }
  .banner {
    border-radius: 14px; padding: 12px 16px; margin-bottom: 16px;
    background: color-mix(in srgb, var(--it-warn) 18%, transparent);
  }
`;
