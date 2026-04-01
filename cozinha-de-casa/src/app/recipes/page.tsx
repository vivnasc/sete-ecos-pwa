"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import PageWrapper from "@/components/layout/PageWrapper";
import FAB from "@/components/layout/FAB";
import SearchBar from "@/components/ui/SearchBar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Recipe } from "@/lib/types";
import { RECIPE_CATEGORIES } from "@/lib/constants";
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

// ---------------------------------------------------------------------------
// Filter pill types
// ---------------------------------------------------------------------------
type FilterType =
  | { kind: "all" }
  | { kind: "category"; value: string }
  | { kind: "favorites" }
  | { kind: "vivianne" }
  | { kind: "ticy" };

function filterKey(f: FilterType): string {
  if (f.kind === "all") return "all";
  if (f.kind === "category") return `cat:${f.value}`;
  if (f.kind === "favorites") return "fav";
  if (f.kind === "vivianne") return "viv";
  return "ticy";
}

function filterLabel(f: FilterType): string {
  if (f.kind === "all") return "Todas";
  if (f.kind === "category") return f.value;
  if (f.kind === "favorites") return "Favoritas";
  if (f.kind === "vivianne") return "Vivianne \u2713";
  return "Ticy \u2713";
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>(SAMPLE_RECIPES);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>({ kind: "all" });
  const [showFilters, setShowFilters] = useState(true);

  // Build the pill list
  const filterPills: FilterType[] = useMemo(() => {
    const pills: FilterType[] = [{ kind: "all" }];
    RECIPE_CATEGORIES.forEach((cat) => pills.push({ kind: "category", value: cat }));
    pills.push({ kind: "favorites" }, { kind: "vivianne" }, { kind: "ticy" });
    return pills;
  }, []);

  // Filtered recipes
  const filtered = useMemo(() => {
    let result = recipes;

    // Text search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(q));
    }

    // Pill filter
    if (activeFilter.kind === "category") {
      result = result.filter((r) => r.category === activeFilter.value);
    } else if (activeFilter.kind === "favorites") {
      result = result.filter((r) => r.is_favorite);
    } else if (activeFilter.kind === "vivianne") {
      result = result.filter((r) => r.is_vivianne_safe);
    } else if (activeFilter.kind === "ticy") {
      result = result.filter((r) => r.is_ticy_safe);
    }

    return result;
  }, [recipes, search, activeFilter]);

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_favorite: !r.is_favorite } : r))
    );
  };

  return (
    <PageWrapper>
      <Header
        title="Receitas"
        rightAction={
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? "bg-terracotta/10 text-terracotta" : "text-charcoal hover:text-terracotta"
            }`}
            aria-label="Alternar filtros"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
        }
      />

      <div className="px-4 py-3 space-y-3">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          placeholder="Pesquisar receitas..."
        />

        {/* Filter pills — horizontal scroll */}
        {showFilters && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
            {filterPills.map((pill) => {
              const key = filterKey(pill);
              const isActive = filterKey(activeFilter) === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setActiveFilter(isActive && pill.kind !== "all" ? { kind: "all" } : pill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                    isActive ? "bg-terracotta text-white" : "bg-cream-dark text-charcoal"
                  }`}
                >
                  {filterLabel(pill)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Recipe list */}
      <div className="px-4 space-y-3 animate-fade-in">
        {filtered.length === 0 ? (
          <EmptyState
            emoji="📖"
            title="Nenhuma receita encontrada"
            description={
              search || activeFilter.kind !== "all"
                ? "Tenta alterar os filtros ou a pesquisa."
                : "Adiciona a tua primeira receita."
            }
          />
        ) : (
          filtered.map((recipe) => {
            const badges = getAllergenBadges(recipe.ingredients);
            const bgColor = CATEGORY_COLORS[recipe.category] || "bg-stone";

            return (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="block">
                <Card className="!p-0 overflow-hidden">
                  <div className="flex">
                    {/* Photo placeholder */}
                    <div
                      className={`flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 ${bgColor} flex items-center justify-center`}
                    >
                      {recipe.photo_url ? (
                        <img
                          src={recipe.photo_url}
                          alt={recipe.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl sm:text-4xl font-display text-white/80">
                          {recipe.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
                      <div>
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-charcoal text-sm sm:text-base leading-tight truncate">
                            {recipe.name}
                          </h3>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(recipe.id);
                            }}
                            className="flex-shrink-0 text-lg active:scale-90 transition-transform"
                            aria-label={
                              recipe.is_favorite
                                ? `Remover ${recipe.name} dos favoritos`
                                : `Adicionar ${recipe.name} aos favoritos`
                            }
                          >
                            {recipe.is_favorite ? "❤️" : "🤍"}
                          </button>
                        </div>

                        {/* Meta line */}
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-stone flex-wrap">
                          <span>{recipe.category}</span>
                          <span>·</span>
                          <span>⏱ {recipe.prep_time_min} min</span>
                          <span>·</span>
                          <span>🍽 {recipe.servings} doses</span>
                          {recipe.difficulty && (
                            <>
                              <span>·</span>
                              <span>{recipe.difficulty}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Badges row */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {/* Allergen badges */}
                        {badges.map((b) => (
                          <Badge key={b.label} color={b.color}>
                            {b.label}
                          </Badge>
                        ))}

                        {/* Safety badges */}
                        {recipe.is_vivianne_safe && (
                          <Badge color="green">{"\u2713"} Vivianne</Badge>
                        )}
                        {recipe.is_ticy_safe && (
                          <Badge color="green">{"\u2713"} Ticy</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>

      {/* FAB — new recipe */}
      <FAB onClick={() => router.push("/recipes/new")} label="Nova receita" />
    </PageWrapper>
  );
}
