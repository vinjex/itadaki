// Matching for the ingredient search box: every word an entry answers to, in every
// language, best matches first.
export function terms(entry) {
  return Object.values(entry.localized).flatMap((l) => [l.name, l.plural, ...(l.aliases || [])].filter(Boolean));
}

export function search(entries, query, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return entries.slice(0, limit);
  const scored = [];
  for (const entry of entries) {
    const words = terms(entry).map((w) => w.toLowerCase());
    const score = words.some((w) => w === q) ? 0 : words.some((w) => w.startsWith(q)) ? 1 : words.some((w) => w.includes(q)) ? 2 : -1;
    if (score >= 0) scored.push([score, entry]);
  }
  return scored.sort((a, b) => a[0] - b[0]).slice(0, limit).map(([, e]) => e);
}

export function exactMatch(entries, query) {
  const q = query.trim().toLowerCase();
  return entries.find((e) => terms(e).some((w) => w.toLowerCase() === q));
}

// An id for an entry created in the panel, readable when the name allows it.
export function newId(name, taken, fallback = "ingredient") {
  const base = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || fallback;
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}_${n}`;
  return id;
}
