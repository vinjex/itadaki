// Preferences kept in this browser only. Storage can be missing or refuse (private
// windows, blocked site data), so reads fall back and writes are best effort.
export function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStored(key, value) {
  try {
    if (value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Not kept: the preference lasts until the page reloads.
  }
}
