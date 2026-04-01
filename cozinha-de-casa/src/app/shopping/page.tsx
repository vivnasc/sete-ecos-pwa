"use client";
import { useState, useMemo, FormEvent } from "react";
import Header from "@/components/layout/Header";
import PageWrapper from "@/components/layout/PageWrapper";
import FAB from "@/components/layout/FAB";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { ShoppingListItem, ShoppingSection } from "@/lib/types";
import { SHOPPING_SECTIONS, STOCK_UNITS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------
const SAMPLE_ITEMS: ShoppingListItem[] = [
  { id: "s1",  household_id: "h1", name: "Tomates",          quantity: 6,   unit: "un",      category: "Vegetais",   buy_at: "Mercado",       assigned_to: null, is_checked: false, auto_generated: false, created_at: "2026-03-28" },
  { id: "s2",  household_id: "h1", name: "Cebolas",          quantity: 3,   unit: "un",      category: "Vegetais",   buy_at: "Mercado",       assigned_to: null, is_checked: false, auto_generated: false, created_at: "2026-03-28" },
  { id: "s3",  household_id: "h1", name: "Alface",           quantity: 2,   unit: "un",      category: "Vegetais",   buy_at: "Mercado",       assigned_to: null, is_checked: false, auto_generated: false, created_at: "2026-03-28" },
  { id: "s4",  household_id: "h1", name: "Leite de coco",    quantity: 2,   unit: "lata",    category: "Conservas",  buy_at: "Supermercado",  assigned_to: null, is_checked: false, auto_generated: false, created_at: "2026-03-28" },
  { id: "s5",  household_id: "h1", name: "Arroz basmati",    quantity: 2,   unit: "kg",      category: "Cereais",    buy_at: "Supermercado",  assigned_to: null, is_checked: false, auto_generated: false, created_at: "2026-03-28" },
  { id: "s6",  household_id: "h1", name: "Detergente",       quantity: 1,   unit: "un",      category: "Limpeza",    buy_at: "Supermercado",  assigned_to: null, is_checked: true,  auto_generated: false, created_at: "2026-03-28" },
  { id: "s7",  household_id: "h1", name: "Peito de frango",  quantity: 1,   unit: "kg",      category: "Proteínas",  buy_at: "Talho",         assigned_to: null, is_checked: false, auto_generated: false, created_at: "2026-03-28" },
  { id: "s8",  household_id: "h1", name: "Camarão",          quantity: 500, unit: "g",       category: "Proteínas",  buy_at: "Talho",         assigned_to: null, is_checked: false, auto_generated: false, created_at: "2026-03-28" },
  { id: "s9",  household_id: "h1", name: "Queijo cheddar",   quantity: 1,   unit: "pacote",  category: "Lacticínios",buy_at: "Komatipoort",   assigned_to: null, is_checked: false, auto_generated: false, created_at: "2026-03-28" },
  { id: "s10", household_id: "h1", name: "Manteiga",         quantity: 1,   unit: "un",      category: "Lacticínios",buy_at: "Komatipoort",   assigned_to: null, is_checked: false, auto_generated: false, created_at: "2026-03-28" },
];

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------
interface ItemFormState {
  name: string;
  quantity: string;
  unit: string;
  buy_at: ShoppingSection;
  category: string;
}

const emptyForm: ItemFormState = {
  name: "",
  quantity: "1",
  unit: "un",
  buy_at: "Supermercado",
  category: "",
};

let nextId = 200;

function sectionInfo(value: string) {
  return SHOPPING_SECTIONS.find((s) => s.value === value) || { value, label: value, emoji: "📦" };
}

// ---------------------------------------------------------------------------
// Add item form
// ---------------------------------------------------------------------------
function AddItemForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: ItemFormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ItemFormState>(emptyForm);
  const set = <K extends keyof ItemFormState>(key: K, val: ItemFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Ex: Leite de coco"
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Quantidade"
          type="number"
          step="0.1"
          min="0"
          value={form.quantity}
          onChange={(e) => set("quantity", e.target.value)}
        />
        <Select
          label="Unidade"
          value={form.unit}
          onChange={(e) => set("unit", e.target.value)}
          options={STOCK_UNITS.map((u) => ({ value: u, label: u }))}
        />
      </div>

      <Select
        label="Onde comprar"
        value={form.buy_at}
        onChange={(e) => set("buy_at", e.target.value as ShoppingSection)}
        options={SHOPPING_SECTIONS.map((s) => ({
          value: s.value,
          label: `${s.emoji} ${s.label}`,
        }))}
      />

      <Input
        label="Categoria (opcional)"
        value={form.category}
        onChange={(e) => set("category", e.target.value)}
        placeholder="Ex: Proteínas, Vegetais"
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          Adicionar
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingListItem[]>(SAMPLE_ITEMS);
  const [filter, setFilter] = useState<string>("Tudo");
  const [showAdd, setShowAdd] = useState(false);

  // ---- Counts ----
  const checkedCount = items.filter((i) => i.is_checked).length;
  const totalCount = items.length;

  // ---- Filtered items ----
  const filtered = useMemo(() => {
    if (filter === "Tudo") return items;
    return items.filter((i) => i.buy_at === filter);
  }, [items, filter]);

  // ---- Group by section, checked at bottom ----
  const grouped = useMemo(() => {
    const map = new Map<string, ShoppingListItem[]>();
    filtered.forEach((item) => {
      const list = map.get(item.buy_at) || [];
      list.push(item);
      map.set(item.buy_at, list);
    });
    // Sort within each section: unchecked first, then checked
    map.forEach((list, key) => {
      map.set(
        key,
        list.sort((a, b) => Number(a.is_checked) - Number(b.is_checked))
      );
    });
    // Sort sections by SHOPPING_SECTIONS order
    const order: string[] = SHOPPING_SECTIONS.map((s) => s.value);
    return Array.from(map.entries()).sort(
      ([a], [b]) => order.indexOf(a) - order.indexOf(b)
    );
  }, [filtered]);

  // ---- Handlers ----
  const toggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_checked: !i.is_checked } : i))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAdd = (form: ItemFormState) => {
    const newItem: ShoppingListItem = {
      id: String(nextId++),
      household_id: "h1",
      name: form.name.trim(),
      quantity: parseFloat(form.quantity) || 1,
      unit: form.unit,
      category: form.category.trim() || "Outros",
      buy_at: form.buy_at,
      assigned_to: null,
      is_checked: false,
      auto_generated: false,
      created_at: new Date().toISOString(),
    };
    setItems((prev) => [...prev, newItem]);
    setShowAdd(false);
  };

  const moveCheckedToStock = () => {
    const checked = items.filter((i) => i.is_checked);
    if (checked.length === 0) {
      alert("Nenhum item marcado para mover.");
      return;
    }
    setItems((prev) => prev.filter((i) => !i.is_checked));
    alert(`${checked.length} item(ns) movido(s) para stock.`);
  };

  return (
    <PageWrapper>
      <Header
        title="Lista de Compras"
        rightAction={
          <Badge color={checkedCount === totalCount && totalCount > 0 ? "green" : "blue"}>
            {totalCount} itens
          </Badge>
        }
      />

      {/* Filter pills */}
      <div className="px-4 py-3 border-b border-cream-dark">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          <button
            type="button"
            onClick={() => setFilter("Tudo")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
              filter === "Tudo"
                ? "bg-terracotta text-white"
                : "bg-cream-dark text-charcoal"
            }`}
          >
            Tudo
          </button>
          {SHOPPING_SECTIONS.map((section) => {
            const count = items.filter((i) => i.buy_at === section.value).length;
            return (
              <button
                type="button"
                key={section.value}
                onClick={() =>
                  setFilter(filter === section.value ? "Tudo" : section.value)
                }
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                  filter === section.value
                    ? "bg-terracotta text-white"
                    : "bg-cream-dark text-charcoal"
                }`}
              >
                {section.emoji} {section.value}
                {count > 0 && (
                  <span className="ml-1 opacity-70">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shopping list */}
      <div className="px-4 py-3 space-y-4 animate-fade-in">
        {filtered.length === 0 ? (
          <EmptyState
            emoji="🛒"
            title="Lista vazia"
            description={
              filter !== "Tudo"
                ? "Nenhum item nesta secção."
                : "Adiciona itens à tua lista de compras."
            }
            action={
              filter === "Tudo" ? (
                <Button size="sm" onClick={() => setShowAdd(true)}>
                  Adicionar item
                </Button>
              ) : undefined
            }
          />
        ) : (
          grouped.map(([section, sectionItems]) => {
            const info = sectionInfo(section);
            const sectionChecked = sectionItems.filter((i) => i.is_checked).length;

            return (
              <section key={section}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg" aria-hidden="true">
                    {info.emoji}
                  </span>
                  <h3 className="text-xs font-bold text-stone uppercase tracking-wide">
                    {info.label}
                  </h3>
                  <span className="text-xs text-stone-light">
                    ({sectionChecked}/{sectionItems.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {sectionItems.map((item) => (
                    <Card key={item.id} className={item.is_checked ? "opacity-60" : ""}>
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleCheck(item.id)}
                          className={`w-6 h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                            item.is_checked
                              ? "bg-terracotta border-terracotta"
                              : "border-stone-light hover:border-terracotta"
                          }`}
                          aria-label={
                            item.is_checked
                              ? `Desmarcar ${item.name}`
                              : `Marcar ${item.name}`
                          }
                        >
                          {item.is_checked && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>

                        {/* Name + quantity */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              item.is_checked
                                ? "line-through text-stone"
                                : "text-charcoal"
                            }`}
                          >
                            {item.name}
                          </p>
                          <p className="text-xs text-stone mt-0.5">
                            {item.quantity} {item.unit}
                            {item.category && ` · ${item.category}`}
                          </p>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          className="p-1.5 text-stone hover:text-rose active:scale-90 transition-all flex-shrink-0"
                          aria-label={`Eliminar ${item.name}`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Summary bar */}
      {totalCount > 0 && (
        <div className="sticky bottom-16 z-20 mx-4 mb-2">
          <div className="bg-white rounded-xl border border-cream-dark shadow-md p-3 flex items-center justify-between gap-3">
            <div className="text-sm text-charcoal">
              <span className="font-bold">{checkedCount}</span> de{" "}
              <span className="font-bold">{totalCount}</span> itens comprados
            </div>
            <Button size="sm" variant="secondary" onClick={moveCheckedToStock} disabled={checkedCount === 0}>
              Mover para stock
            </Button>
          </div>
        </div>
      )}

      {/* FAB */}
      <FAB onClick={() => setShowAdd(true)} label="Adicionar item" />

      {/* Add modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Adicionar Item"
      >
        <AddItemForm
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </PageWrapper>
  );
}
