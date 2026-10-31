// One line saying what an AI draft was asked to do, shown in the inbox, on the
// recipe it came from, and on the draft itself.
export function describeRequest(t, entry) {
  const r = entry.request || {};
  const parts = [];
  if (entry.action === "translate" && r.language) parts.push(`→ ${t.langName(r.language)}`);
  if (entry.action === "adapt" && r.instruction) parts.push(`“${r.instruction}”`);
  if (entry.action === "adapt" && r.as_variant) parts.push(t("asNewVariant"));
  if (entry.action === "import" && r.url) {
    try {
      parts.push(new URL(r.url).hostname.replace(/^www\./, ""));
    } catch {
      parts.push(r.url);
    }
  }
  if (r.note) parts.push(`“${r.note}”`);
  return parts.join(" · ");
}
