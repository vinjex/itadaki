// How long a recipe takes: its total time, else prep plus cook. Zero when unknown.
export function totalMinutes(recipe) {
  return recipe.total_minutes || (recipe.prep_minutes || 0) + (recipe.cook_minutes || 0);
}
