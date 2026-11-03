// Panel screens live in the URL, so the header's back arrow, the browser and the
// phone's back gesture share one history, and recipe links can be shared. A screen
// that stops existing (a saved draft) is replaced in history instead of stacked.

import { CATALOGS } from "./catalog.js";

export function pathFor({ view, id }) {
  switch (view) {
    case "recipe": return `/recipe/${id}`;
    case "edit": return `/recipe/${id}/edit`;
    case "draft": return `/draft/${id}`;
    case "new": return "/new";
    case "import": return "/import";
    case "manage": return "/manage";
    case "languages": return "/manage/languages";
    case "ai": return "/manage/ai";
    case "catalog": return `/manage/${id}`;
    default: return "";
  }
}

export function viewFor(path = "") {
  const [, first, id, extra] = path.split("/");
  if (first === "recipe" && id) return extra === "edit" ? { view: "edit", id } : { view: "recipe", id };
  if (first === "draft" && id) return { view: "draft", id };
  if (first === "new") return { view: "new" };
  if (first === "import") return { view: "import" };
  if (first === "manage" && (id === "languages" || id === "ai")) return { view: id };
  if (first === "manage") return Object.hasOwn(CATALOGS, id ?? "") ? { view: "catalog", id } : { view: "manage" };
  return { view: "list" };
}

export function go(prefix, target, replace = false) {
  const depth = history.state?.itadakiDepth ?? 0;
  const url = prefix + pathFor(target);
  if (replace) history.replaceState({ itadakiDepth: depth }, "", url);
  else history.pushState({ itadakiDepth: depth + 1 }, "", url);
  // Home Assistant listens for this to update the panel's route.
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace } }));
  window.scrollTo(0, 0);
}

// Back within the panel when there is somewhere to go back to; a panel opened
// directly on a deep link falls back to the recipe list instead of leaving.
export function back(prefix) {
  if ((history.state?.itadakiDepth ?? 0) > 0) history.back();
  else go(prefix, { view: "list" }, true);
}

// Screens ask the panel to move by firing this; only the panel touches history.
export function navigate(el, detail) {
  el.dispatchEvent(new CustomEvent("navigate", { detail, bubbles: true, composed: true }));
}
