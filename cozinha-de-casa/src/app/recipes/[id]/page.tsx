"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import PageWrapper from "@/components/layout/PageWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { getAllergenBadges } from "@/lib/allergens";
import { SAMPLE_RECIPES } from "@/lib/sample-recipes";

// ---------------------------------------------------------------------------
// Category color map for photo placeholders
// ---------------------------------------------------------------------------
const CATEGORY_COLORS: Record<string, string> = {
  "Prato principal": "bg-terracotta",
  "Acompanhamento": "bg-olive",
  "Sopa": "bg-amber-600",
  "Lancheira": "bg-blue-500",
  "Pequeno-almoço": "bg-orange-400",
  "Sobremesa": "bg-pink-500",
  "Lanche": "bg-purple-500",
  "Bebida": "bg-cyan-600",
};

// Allergen emoji helpers
function allergenIcons(ing: { is_allergen_milk: boolean; is_allergen_wheat: boolean; is_allergen_egg: boolean }): string {
  const icons: string[] = [];
  if (ing.is_allergen_milk) icons.push("\uD83E\uDD5B"); // 🥛
  if (ing.is_allergen_wheat) icons.push("\uD83C\uDF3E"); // 🌾
  if (ing.is_allergen_egg) icons.push("\uD83E\uDD5A");   // 🥚
  return icons.join(" ");
}

// ---------------------------------------------------------------------------
// Difficulty badge color
// ---------------------------------------------------------------------------
function difficultyColor(d: string | null): "green" | "orange" | "red" {
  if (d === "Fácil") return "green";
  if (d === "Difícil") return "red";
  return "orange";
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;

  const recipe = SAMPLE_RECIPES.find((r) => r.id === recipeId);

  // Portion scaling
  const [servings, setServings] = useState(recipe?.servings ?? 1);
  const originalServings = recipe?.servings ?? 1;
  const multiplier = servings / originalServings;

  // Ingredient checkboxes (visual only)
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggleCheck = (idx: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Favorite toggle
  const [isFavorite, setIsFavorite] = useState(recipe?.is_favorite ?? false);

  // Allergen badges
  const allergenBadges = useMemo(
    () => (recipe ? getAllergenBadges(recipe.ingredients) : []),
    [recipe]
  );

  // Not found
  if (!recipe) {
    return (
      <PageWrapper>
        <Header title="Receita" showBack />
        <EmptyState
          emoji="🔍"
          title="Receita não encontrada"
          description="Esta receita não existe ou foi removida."
          action={
            <Button size="sm" onClick={() => router.push("/recipes")}>
              Voltar às receitas
            </Button>
          }
        />
      </PageWrapper>
    );
  }

  const bgColor = CATEGORY_COLORS[recipe.category] || "bg-stone";

  return (
    <PageWrapper>
      <Header title={recipe.name} showBack />

      {/* Hero section */}
      <div className={`relative w-full h-48 sm:h-56 ${bgColor} flex items-center justify-center`}>
        {recipe.photo_url ? (
          <img
            src={recipe.photo_url}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl sm:text-7xl font-display text-white/70">
            {recipe.name.charAt(0).toUpperCase()}
          </span>
        )}
        {/* Overlay with name */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
          <h2 className="text-xl sm:text-2xl font-display text-white leading-tight">
            {recipe.name}
          </h2>
          {recipe.cuisine && (
            <span className="text-xs text-white/80">{recipe.cuisine}</span>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-stone">⏱ {recipe.prep_time_min} min</span>

          {/* Servings with +/- */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-stone">🍽</span>
            <button
              type="button"
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              className="w-7 h-7 rounded-full bg-cream-dark text-charcoal flex items-center justify-center hover:bg-stone-light/30 active:scale-90 font-bold text-sm select-none"
              aria-label="Diminuir doses"
            >
              −
            </button>
            <span className="min-w-[40px] text-center text-sm font-semibold text-charcoal">
              {servings} {servings === 1 ? "dose" : "doses"}
            </span>
            <button
              type="button"
              onClick={() => setServings((s) => s + 1)}
              className="w-7 h-7 rounded-full bg-terracotta text-white flex items-center justify-center hover:bg-terracotta-dark active:scale-90 font-bold text-sm select-none"
              aria-label="Aumentar doses"
            >
              +
            </button>
          </div>

          {recipe.difficulty && (
            <Badge color={difficultyColor(recipe.difficulty)}>
              {recipe.difficulty}
            </Badge>
          )}
        </div>

        {/* Allergen badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {allergenBadges.map((b) => (
            <Badge key={b.label} color={b.color}>
              {b.label}
            </Badge>
          ))}
          {recipe.is_vivianne_safe && (
            <Badge color="green">{"\u2713"} Vivianne</Badge>
          )}
          {recipe.is_ticy_safe && (
            <Badge color="green">{"\u2713"} Ticy</Badge>
          )}
          {allergenBadges.length === 0 && recipe.is_vivianne_safe && recipe.is_ticy_safe && (
            <Badge color="green">Segura para todos</Badge>
          )}
        </div>

        {/* Ingredients */}
        <section>
          <h3 className="text-base font-display text-charcoal mb-3">
            Ingredientes
            {multiplier !== 1 && (
              <span className="text-xs text-stone font-body ml-2">
                (ajustado para {servings} {servings === 1 ? "dose" : "doses"})
              </span>
            )}
          </h3>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, idx) => {
              const scaledQty = Math.round(ing.qty * multiplier * 100) / 100;
              const icons = allergenIcons(ing);
              const isChecked = checked.has(idx);

              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => toggleCheck(idx)}
                    className={`w-full flex items-center gap-3 text-left py-2 px-3 rounded-xl transition-colors ${
                      isChecked ? "bg-olive/10" : "bg-white hover:bg-cream-dark/50"
                    }`}
                  >
                    {/* Checkbox */}
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isChecked
                          ? "bg-olive border-olive text-white"
                          : "border-stone-light"
                      }`}
                    >
                      {isChecked && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>

                    {/* Name + qty */}
                    <span
                      className={`flex-1 text-sm ${
                        isChecked ? "line-through text-stone" : "text-charcoal"
                      }`}
                    >
                      {ing.name}
                    </span>
                    <span className="text-sm font-semibold text-charcoal flex-shrink-0">
                      {scaledQty} {ing.unit}
                    </span>

                    {/* Allergen icons */}
                    {icons && (
                      <span className="text-sm flex-shrink-0" title="Contém alergénios">
                        {icons}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Steps */}
        <section>
          <h3 className="text-base font-display text-charcoal mb-3">Preparação</h3>
          <ol className="space-y-3">
            {recipe.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-terracotta text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-sm text-charcoal leading-relaxed flex-1">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Notes */}
        {recipe.notes && (
          <section>
            <h3 className="text-base font-display text-charcoal mb-2">Notas</h3>
            <p className="text-sm text-stone leading-relaxed bg-cream-dark/50 rounded-xl p-3">
              {recipe.notes}
            </p>
          </section>
        )}

        {/* Bottom actions */}
        <div className="flex gap-3 pt-2 pb-4">
          <Button
            variant={isFavorite ? "primary" : "secondary"}
            className="flex-1"
            onClick={() => setIsFavorite((f) => !f)}
          >
            {isFavorite ? "❤️ Favorita" : "🤍 Favoritar"}
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              // TODO: Add missing ingredients to shopping list
              alert("Ingredientes em falta adicionados ao carrinho (em breve).");
            }}
          >
            🛒 Adicionar em falta
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
