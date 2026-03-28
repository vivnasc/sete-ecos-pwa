"use client";
import { useState, useMemo, useCallback } from "react";
import Header from "@/components/layout/Header";
import PageWrapper from "@/components/layout/PageWrapper";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { MenuSlot, Recipe } from "@/lib/types";
import { MENU_SLOTS, DAYS_OF_WEEK } from "@/lib/constants";
import { SAMPLE_RECIPES as sampleRecipes } from "@/lib/sample-recipes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SlotEntry {
  recipe_id: string | null;
  free_text: string | null;
  recipe?: Recipe;
}

type MenuState = Record<string, SlotEntry>;

interface SlotModalState {
  dayIndex: number;
  slot: MenuSlot;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function menuKey(dayIndex: number, slot: MenuSlot): string {
  return `${dayIndex}-${slot}`;
}

/** Filter recipes based on slot type */
function recipesForSlot(slot: MenuSlot, recipes: Recipe[]): Recipe[] {
  switch (slot) {
    case "lunchbox_lowcarb":
      return recipes.filter(
        (r) => r.is_vivianne_safe && r.tags.some((t) => t.toLowerCase().includes("low carb"))
      );
    case "lunchbox_school":
      return recipes.filter((r) => r.is_ticy_safe);
    case "dinner":
      return recipes;
    case "dinner_adapted":
      return recipes.filter((r) => r.is_vivianne_safe);
    default:
      return recipes;
  }
}

function slotInfo(slotValue: MenuSlot) {
  return MENU_SLOTS.find((s) => s.value === slotValue);
}

// ---------------------------------------------------------------------------
// Slot selection modal content
// ---------------------------------------------------------------------------
function SlotSelector({
  slot,
  current,
  onSelectRecipe,
  onSetFreeText,
  onClear,
  onClose,
}: {
  slot: MenuSlot;
  current: SlotEntry | undefined;
  onSelectRecipe: (recipe: Recipe) => void;
  onSetFreeText: (text: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"choose" | "freetext">(
    current?.free_text ? "freetext" : "choose"
  );
  const [text, setText] = useState(current?.free_text || "");
  const available = useMemo(() => recipesForSlot(slot, sampleRecipes), [slot]);
  const info = slotInfo(slot);

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("choose")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
            mode === "choose"
              ? "bg-terracotta text-white"
              : "bg-cream-dark text-charcoal"
          }`}
        >
          Escolher receita
        </button>
        <button
          type="button"
          onClick={() => setMode("freetext")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
            mode === "freetext"
              ? "bg-terracotta text-white"
              : "bg-cream-dark text-charcoal"
          }`}
        >
          Texto livre
        </button>
      </div>

      {mode === "choose" ? (
        <div className="space-y-2">
          {available.length === 0 ? (
            <EmptyState
              emoji="📭"
              title="Sem receitas"
              description={`Nenhuma receita disponível para ${info?.label || slot}.`}
            />
          ) : (
            available.map((recipe) => (
              <Card
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe)}
                className={`${
                  current?.recipe_id === recipe.id
                    ? "border-terracotta ring-1 ring-terracotta/30"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-charcoal text-sm truncate">
                      {recipe.name}
                    </p>
                    <p className="text-xs text-stone mt-0.5">
                      {recipe.prep_time_min} min · {recipe.servings} porções
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    {recipe.is_vivianne_safe && (
                      <Badge color="green">Viv</Badge>
                    )}
                    {recipe.is_ticy_safe && <Badge color="blue">Ticy</Badge>}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            label="O que vais preparar?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex: Sobras de ontem, Pizza"
          />
          <Button
            onClick={() => {
              if (text.trim()) onSetFreeText(text.trim());
            }}
            disabled={!text.trim()}
            className="w-full"
          >
            Confirmar
          </Button>
        </div>
      )}

      {/* Clear + close */}
      <div className="flex gap-3 pt-2 border-t border-cream-dark">
        {current && (
          <Button variant="danger" size="sm" onClick={onClear} className="flex-1">
            Limpar
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={onClose} className="flex-1">
          Fechar
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function MenuPage() {
  const today = new Date();
  const [weekStart, setWeekStart] = useState<Date>(getMonday(today));
  const [menu, setMenu] = useState<MenuState>({});
  const [activeSlot, setActiveSlot] = useState<SlotModalState | null>(null);

  const prevWeek = () => setWeekStart((w) => addDays(w, -7));
  const nextWeek = () => setWeekStart((w) => addDays(w, 7));

  const weekLabel = useMemo(() => {
    const end = addDays(weekStart, 6);
    return `${formatDate(weekStart)} — ${formatDate(end)}`;
  }, [weekStart]);

  const setSlotEntry = useCallback(
    (dayIndex: number, slot: MenuSlot, entry: SlotEntry | null) => {
      const key = menuKey(dayIndex, slot);
      setMenu((prev) => {
        if (!entry) {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return { ...prev, [key]: entry };
      });
    },
    []
  );

  const handleSelectRecipe = (recipe: Recipe) => {
    if (!activeSlot) return;
    setSlotEntry(activeSlot.dayIndex, activeSlot.slot, {
      recipe_id: recipe.id,
      free_text: null,
      recipe,
    });
    setActiveSlot(null);
  };

  const handleSetFreeText = (text: string) => {
    if (!activeSlot) return;
    setSlotEntry(activeSlot.dayIndex, activeSlot.slot, {
      recipe_id: null,
      free_text: text,
    });
    setActiveSlot(null);
  };

  const handleClear = () => {
    if (!activeSlot) return;
    setSlotEntry(activeSlot.dayIndex, activeSlot.slot, null);
    setActiveSlot(null);
  };

  const handleGenerateShoppingList = () => {
    const ingredients: string[] = [];
    Object.values(menu).forEach((entry) => {
      if (entry.recipe) {
        entry.recipe.ingredients.forEach((ing) => {
          ingredients.push(`${ing.qty} ${ing.unit} ${ing.name}`);
        });
      }
    });
    if (ingredients.length === 0) {
      alert("Nenhuma receita no cardápio para gerar lista.");
      return;
    }
    // eslint-disable-next-line no-console
    console.log("Lista de compras gerada:", ingredients);
    alert(
      `Lista de compras gerada com ${ingredients.length} ingredientes.\n\n${ingredients.join("\n")}`
    );
  };

  const filledCount = Object.keys(menu).length;

  return (
    <PageWrapper>
      <Header
        title="Cardápio Semanal"
        rightAction={
          filledCount > 0 ? (
            <Badge color="green">{filledCount} preenchidos</Badge>
          ) : undefined
        }
      />

      {/* Week navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cream-dark">
        <button
          type="button"
          onClick={prevWeek}
          className="p-2 rounded-full hover:bg-cream-dark active:scale-90 transition-all"
          aria-label="Semana anterior"
        >
          <svg className="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-charcoal">{weekLabel}</span>
        <button
          type="button"
          onClick={nextWeek}
          className="p-2 rounded-full hover:bg-cream-dark active:scale-90 transition-all"
          aria-label="Próxima semana"
        >
          <svg className="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day cards */}
      <div className="px-4 py-3 space-y-3 animate-fade-in">
        {DAYS_OF_WEEK.map((dayName, dayIndex) => {
          const dayDate = addDays(weekStart, dayIndex);
          const isToday = isSameDay(dayDate, today);

          return (
            <Card
              key={dayIndex}
              className={isToday ? "border-terracotta ring-1 ring-terracotta/30" : ""}
            >
              {/* Day header */}
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-display text-charcoal font-bold">
                  {dayName} {formatDate(dayDate)}
                </h3>
                {isToday && <Badge color="orange">Hoje</Badge>}
              </div>

              {/* Slots */}
              <div className="space-y-2">
                {MENU_SLOTS.map((slotDef) => {
                  const key = menuKey(dayIndex, slotDef.value as MenuSlot);
                  const entry = menu[key];

                  return (
                    <button
                      key={slotDef.value}
                      type="button"
                      onClick={() =>
                        setActiveSlot({
                          dayIndex,
                          slot: slotDef.value as MenuSlot,
                        })
                      }
                      className="w-full flex items-center gap-2 p-2 rounded-xl bg-cream hover:bg-cream-dark/50 active:scale-[0.98] transition-all text-left"
                      aria-label={`${slotDef.label} - ${dayName}`}
                    >
                      <span className="text-xs text-stone flex-shrink-0 w-[110px] sm:w-[130px] truncate">
                        {slotDef.label}
                      </span>
                      {entry ? (
                        <span className="flex-1 text-sm text-charcoal font-medium truncate min-w-0">
                          {entry.recipe?.name || entry.free_text}
                        </span>
                      ) : (
                        <span className="flex-1 text-sm text-stone-light italic">
                          + Adicionar
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Generate shopping list button */}
      <div className="px-4 py-4">
        <Button onClick={handleGenerateShoppingList} className="w-full" size="lg">
          🛒 Gerar Lista de Compras
        </Button>
      </div>

      {/* Slot selection modal */}
      <Modal
        open={!!activeSlot}
        onClose={() => setActiveSlot(null)}
        title={
          activeSlot
            ? `${slotInfo(activeSlot.slot)?.label || ""} — ${
                DAYS_OF_WEEK[activeSlot.dayIndex]
              }`
            : undefined
        }
      >
        {activeSlot && (
          <SlotSelector
            slot={activeSlot.slot}
            current={menu[menuKey(activeSlot.dayIndex, activeSlot.slot)]}
            onSelectRecipe={handleSelectRecipe}
            onSetFreeText={handleSetFreeText}
            onClear={handleClear}
            onClose={() => setActiveSlot(null)}
          />
        )}
      </Modal>
    </PageWrapper>
  );
}
