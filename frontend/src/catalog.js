// Display name of an ingredient or unit: the requested language, then English, then
// any. Mirrors the backend's rule for names the panel lists in pickers; text built
// from whole lines always comes rendered from the backend.
export function nameOf(entry, language) {
  const l = entry.localized;
  return (l[language] || l.en || Object.values(l)[0])?.name || entry.id;
}

// The language shown beside `shown` in pickers: `preferred` when it differs, else
// the first other library language.
export function hintLanguage(languages, shown, preferred) {
  return preferred && preferred !== shown ? preferred : languages.find((l) => l !== shown);
}

// How pickers show an entry: its name in `language`, with `hintLanguage` beside it.
export function describer(language, hintLanguage) {
  return (entry) => ({ name: nameOf(entry, language), hint: entry.localized[hintLanguage]?.name ?? "" });
}

// What a unit's size is counted in, per dimension; count units are in items.
export const BASE_UNIT = { mass: "g", volume: "ml" };

// Languages whose nouns do not change for quantity, so a plural field means nothing.
const NO_PLURAL = new Set(["ja", "zh", "ko", "th", "vi", "id", "ms", "km", "lo", "my"]);
export const hasPlural = (language) => !NO_PLURAL.has(language.split("-")[0]);
