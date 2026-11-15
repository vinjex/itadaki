// The scale a recipe is shown at, kept per recipe on this device so a refresh or a
// locked screen mid-cooking does not lose it. Never sent anywhere but get_recipe.
const key = (recipeId) => `itadaki.scale.${recipeId}`;

// Typing amounts back and forth must be able to land on exactly 1 again.
export const cleanFactor = (factor) => {
  const rounded = Math.round(factor * 10000) / 10000;
  return Math.abs(rounded - 1) < 0.001 ? 1 : rounded;
};

export function storedFactor(recipeId) {
  const value = Number(localStorage.getItem(key(recipeId)));
  return value > 0 ? value : 1;
}

export function storeFactor(recipeId, factor) {
  if (factor === 1) localStorage.removeItem(key(recipeId));
  else localStorage.setItem(key(recipeId), String(factor));
}
