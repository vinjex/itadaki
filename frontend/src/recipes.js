// How long a recipe takes: its total time, else prep plus cook. Zero when unknown.
export function totalMinutes(recipe) {
  return recipe.total_minutes || (recipe.prep_minutes || 0) + (recipe.cook_minutes || 0);
}

// Deletes after asking, and asks again before taking translations and variants along.
// Returns the deleted ids, or null when the user said no.
export async function deleteRecipes(api, t, ids, question) {
  if (!confirm(question)) return null;
  try {
    return (await api.call("delete_recipes", { recipe_ids: ids })).deleted;
  } catch (err) {
    if (err.key !== "in_use") throw err;
    if (!confirm(t(ids.length > 1 ? "confirmDeleteAllN" : "confirmDeleteAll"))) return null;
    return (await api.call("delete_recipes", { recipe_ids: ids, cascade: true })).deleted;
  }
}
