import { RecipeIngredient } from "./types";

export function computeIsVivianneSafe(ingredients: RecipeIngredient[]): boolean {
  return !ingredients.some((i) => i.is_allergen_milk || i.is_allergen_wheat);
}

export function computeIsTicySafe(ingredients: RecipeIngredient[]): boolean {
  return !ingredients.some((i) => i.is_allergen_egg);
}

export function getAllergenBadges(ingredients: RecipeIngredient[]): Array<{
  label: string;
  color: "red" | "orange";
  allergens: string[];
}> {
  const badges: Array<{ label: string; color: "red" | "orange"; allergens: string[] }> = [];

  const hasMilk = ingredients.some((i) => i.is_allergen_milk);
  const hasWheat = ingredients.some((i) => i.is_allergen_wheat);
  const hasEgg = ingredients.some((i) => i.is_allergen_egg);

  if (hasMilk || hasWheat) {
    const allergens: string[] = [];
    if (hasMilk) allergens.push("leite");
    if (hasWheat) allergens.push("trigo");
    badges.push({
      label: `⚠ Contém ${allergens.join("/")}`,
      color: "red",
      allergens,
    });
  }

  if (hasEgg) {
    badges.push({
      label: "⚠ Contém ovos",
      color: "orange",
      allergens: ["ovos"],
    });
  }

  return badges;
}
