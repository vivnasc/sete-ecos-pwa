"use client";
import { useState, useMemo, FormEvent } from "react";
import Header from "@/components/layout/Header";
import PageWrapper from "@/components/layout/PageWrapper";
import FAB from "@/components/layout/FAB";
import SearchBar from "@/components/ui/SearchBar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { StockItem, StockLocation } from "@/lib/types";
import { STOCK_CATEGORIES, STOCK_LOCATIONS, STOCK_UNITS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Form state type
// ---------------------------------------------------------------------------
interface StockFormState {
  name: string;
  category: string;
  location: StockLocation;
  quantity: string;
  unit: string;
  min_threshold: string;
  expiry_date: string;
  source: string;
}

const emptyForm: StockFormState = {
  name: "",
  category: "Outros",
  location: "pantry",
  quantity: "1",
  unit: "un",
  min_threshold: "",
  expiry_date: "",
  source: "",
};

function formFromItem(item: StockItem): StockFormState {
  return {
    name: item.name,
    category: item.category,
    location: item.location,
    quantity: String(item.quantity),
    unit: item.unit,
    min_threshold: item.min_threshold != null ? String(item.min_threshold) : "",
    expiry_date: item.expiry_date || "",
    source: item.source || "",
  };
}

function formToPartial(f: StockFormState): Partial<StockItem> {
  return {
    name: f.name.trim(),
    category: f.category,
    location: f.location,
    quantity: parseFloat(f.quantity) || 0,
    unit: f.unit,
    min_threshold: f.min_threshold ? parseFloat(f.min_threshold) : null,
    expiry_date: f.expiry_date || null,
    source: f.source.trim() || null,
  };
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------
const today = new Date();
function daysFromNow(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

const SAMPLE_ITEMS: StockItem[] = [
  { id: "1",  household_id: "h1", name: "Peito de frango",   category: "Proteínas",           location: "freezer",  quantity: 4,   unit: "un",     min_threshold: 2,    expiry_date: daysFromNow(30),  frozen_at: null, portions_total: null, portions_remaining: null, source: "Supermercado",   updated_at: today.toISOString() },
  { id: "2",  household_id: "h1", name: "Ovos",              category: "Proteínas",           location: "fridge",   quantity: 6,   unit: "un",     min_threshold: 6,    expiry_date: daysFromNow(10),  frozen_at: null, portions_total: null, portions_remaining: null, source: null,             updated_at: today.toISOString() },
  { id: "3",  household_id: "h1", name: "Leite",             category: "Lacticínios",         location: "fridge",   quantity: 1,   unit: "litro",  min_threshold: 2,    expiry_date: daysFromNow(2),   frozen_at: null, portions_total: null, portions_remaining: null, source: null,             updated_at: today.toISOString() },
  { id: "4",  household_id: "h1", name: "Arroz basmati",     category: "Cereais/Grãos",       location: "pantry",   quantity: 2,   unit: "kg",     min_threshold: 1,    expiry_date: null,             frozen_at: null, portions_total: null, portions_remaining: null, source: "Komatipoort",    updated_at: today.toISOString() },
  { id: "5",  household_id: "h1", name: "Azeite",            category: "Óleos/Gorduras",      location: "shelf",    quantity: 1,   unit: "garrafa",min_threshold: 1,    expiry_date: daysFromNow(180), frozen_at: null, portions_total: null, portions_remaining: null, source: null,             updated_at: today.toISOString() },
  { id: "6",  household_id: "h1", name: "Tomates",           category: "Vegetais",            location: "fridge",   quantity: 5,   unit: "un",     min_threshold: 3,    expiry_date: daysFromNow(4),   frozen_at: null, portions_total: null, portions_remaining: null, source: "Mercado",        updated_at: today.toISOString() },
  { id: "7",  household_id: "h1", name: "Cebolas",           category: "Vegetais",            location: "pantry",   quantity: 3,   unit: "un",     min_threshold: 2,    expiry_date: daysFromNow(14),  frozen_at: null, portions_total: null, portions_remaining: null, source: "Mercado",        updated_at: today.toISOString() },
  { id: "8",  household_id: "h1", name: "Bananas",           category: "Frutas",              location: "shelf",    quantity: 1,   unit: "molho",  min_threshold: null, expiry_date: daysFromNow(1),   frozen_at: null, portions_total: null, portions_remaining: null, source: null,             updated_at: today.toISOString() },
  { id: "9",  household_id: "h1", name: "Atum enlatado",     category: "Conservas/Enlatados", location: "shelf",    quantity: 3,   unit: "lata",   min_threshold: 2,    expiry_date: daysFromNow(365), frozen_at: null, portions_total: null, portions_remaining: null, source: null,             updated_at: today.toISOString() },
  { id: "10", household_id: "h1", name: "Piri-piri",         category: "Temperos/Especiarias",location: "shelf",    quantity: 1,   unit: "garrafa",min_threshold: 1,    expiry_date: null,             frozen_at: null, portions_total: null, portions_remaining: null, source: "Mercado",        updated_at: today.toISOString() },
  { id: "11", household_id: "h1", name: "Camarão",           category: "Congelados",          location: "freezer",  quantity: 1,   unit: "pacote", min_threshold: 1,    expiry_date: daysFromNow(60),  frozen_at: null, portions_total: null, portions_remaining: null, source: "Komatipoort",    updated_at: today.toISOString() },
  { id: "12", household_id: "h1", name: "Sumo de laranja",   category: "Bebidas",             location: "fridge",   quantity: 2,   unit: "litro",  min_threshold: 1,    expiry_date: daysFromNow(-1),  frozen_at: null, portions_total: null, portions_remaining: null, source: null,             updated_at: today.toISOString() },
  { id: "13", household_id: "h1", name: "Detergente loiça",  category: "Limpeza/Casa",        location: "shelf",    quantity: 1,   unit: "garrafa",min_threshold: 1,    expiry_date: null,             frozen_at: null, portions_total: null, portions_remaining: null, source: "Supermercado",   updated_at: today.toISOString() },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function daysUntilExpiry(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

function expiryColor(days: number | null): "green" | "orange" | "red" | null {
  if (days == null) return null;
  if (days <= 0) return "red";
  if (days <= 3) return "orange";
  return "green";
}

function locationInfo(loc: StockLocation) {
  return STOCK_LOCATIONS.find((l) => l.value === loc) || { value: loc, label: loc, emoji: "📦" };
}

let nextId = 100;

// ---------------------------------------------------------------------------
// Sub-component: Stock item card (inline)
// ---------------------------------------------------------------------------
function StockItemRow({
  item,
  onAdjust,
  onClick,
}: {
  item: StockItem;
  onAdjust: (id: string, delta: number) => void;
  onClick: () => void;
}) {
  const loc = locationInfo(item.location);
  const isLow = item.min_threshold != null && item.quantity <= item.min_threshold;
  const days = daysUntilExpiry(item.expiry_date);
  const color = expiryColor(days);

  return (
    <Card
      className={`${
        color === "red"
          ? "border-rose/60"
          : color === "orange"
          ? "border-amber-400/60"
          : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Location emoji */}
        <span className="text-2xl flex-shrink-0" aria-hidden="true">
          {loc.emoji}
        </span>

        {/* Info — tappable to edit */}
        <button
          type="button"
          onClick={onClick}
          className="flex-1 min-w-0 text-left"
          aria-label={`Editar ${item.name}`}
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-charcoal truncate max-w-[140px] sm:max-w-none">
              {item.name}
            </span>
            {isLow && <Badge color="orange">Stock baixo</Badge>}
            {color === "red" && <Badge color="red">Expirado</Badge>}
            {color === "orange" && (
              <Badge color="orange">Expira em {days}d</Badge>
            )}
            {color === "green" && days != null && days <= 7 && (
              <Badge color="green">Válido {days}d</Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-stone">
            <span>{item.category}</span>
            <span>·</span>
            <span>{loc.label}</span>
            {item.source && (
              <>
                <span>·</span>
                <span>{item.source}</span>
              </>
            )}
          </div>
        </button>

        {/* Quantity +/- */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => onAdjust(item.id, -1)}
            className="w-11 h-11 rounded-full bg-cream-dark text-charcoal flex items-center justify-center hover:bg-stone-light/30 active:scale-90 font-bold text-lg select-none"
            aria-label={`Diminuir quantidade de ${item.name}`}
          >
            −
          </button>
          <span className="min-w-[52px] text-center font-bold text-charcoal select-none">
            {item.quantity}{" "}
            <span className="text-xs text-stone font-normal">{item.unit}</span>
          </span>
          <button
            type="button"
            onClick={() => onAdjust(item.id, 1)}
            className="w-11 h-11 rounded-full bg-terracotta text-white flex items-center justify-center hover:bg-terracotta-dark active:scale-90 font-bold text-lg select-none"
            aria-label={`Aumentar quantidade de ${item.name}`}
          >
            +
          </button>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Form (inline)
// ---------------------------------------------------------------------------
function StockFormInline({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: StockFormState;
  onSubmit: (data: StockFormState) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [form, setForm] = useState<StockFormState>(initial || emptyForm);

  const set = <K extends keyof StockFormState>(key: K, val: StockFormState[K]) =>
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
        placeholder="Ex: Arroz"
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Categoria"
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          options={STOCK_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <Select
          label="Localização"
          value={form.location}
          onChange={(e) => set("location", e.target.value as StockLocation)}
          options={STOCK_LOCATIONS.map((l) => ({
            value: l.value,
            label: `${l.emoji} ${l.label}`,
          }))}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
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
        <Input
          label="Mín. alerta"
          type="number"
          step="0.1"
          min="0"
          value={form.min_threshold}
          onChange={(e) => set("min_threshold", e.target.value)}
          placeholder="—"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Validade"
          type="date"
          value={form.expiry_date}
          onChange={(e) => set("expiry_date", e.target.value)}
        />
        <Input
          label="Origem"
          value={form.source}
          onChange={(e) => set("source", e.target.value)}
          placeholder="Ex: Komatipoort"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {initial ? "Guardar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function StockPage() {
  // TODO: Replace local state with Supabase queries (useStock hook)
  const [items, setItems] = useState<StockItem[]>(SAMPLE_ITEMS);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  const [saving, setSaving] = useState(false);

  // ---- Filtering ----
  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (filterCategory) {
      result = result.filter((i) => i.category === filterCategory);
    }
    return result;
  }, [items, search, filterCategory]);

  // ---- Grouping by category ----
  const grouped = useMemo(() => {
    const map = new Map<string, StockItem[]>();
    filtered.forEach((item) => {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // ---- CRUD handlers ----
  const adjustQuantity = (id: string, delta: number) => {
    // TODO: Supabase update
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, quantity: Math.max(0, i.quantity + delta), updated_at: new Date().toISOString() }
          : i
      )
    );
  };

  const handleAdd = (form: StockFormState) => {
    setSaving(true);
    const newItem: StockItem = {
      ...(formToPartial(form) as StockItem),
      id: String(nextId++),
      household_id: "h1",
      frozen_at: null,
      portions_total: null,
      portions_remaining: null,
      updated_at: new Date().toISOString(),
    };
    // TODO: Supabase insert
    setItems((prev) => [...prev, newItem]);
    setSaving(false);
    setShowAdd(false);
  };

  const handleEdit = (form: StockFormState) => {
    if (!editItem) return;
    setSaving(true);
    const updates = formToPartial(form);
    // TODO: Supabase update
    setItems((prev) =>
      prev.map((i) =>
        i.id === editItem.id
          ? { ...i, ...updates, updated_at: new Date().toISOString() }
          : i
      )
    );
    setSaving(false);
    setEditItem(null);
  };

  const handleDelete = (id: string) => {
    // TODO: Supabase delete
    setItems((prev) => prev.filter((i) => i.id !== id));
    setEditItem(null);
  };

  // ---- Counts for header ----
  const lowStockCount = items.filter(
    (i) => i.min_threshold != null && i.quantity <= i.min_threshold
  ).length;

  return (
    <PageWrapper>
      <Header
        title="Stock"
        rightAction={
          <div className="flex items-center gap-2 text-sm">
            {lowStockCount > 0 && (
              <Badge color="orange">{lowStockCount} baixo{lowStockCount > 1 ? "s" : ""}</Badge>
            )}
            <span className="text-stone">{items.length} itens</span>
          </div>
        }
      />

      <div className="px-4 py-3 space-y-3">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          placeholder="Pesquisar stock..."
        />

        {/* Category filter pills — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterCategory("")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
              !filterCategory
                ? "bg-terracotta text-white"
                : "bg-cream-dark text-charcoal"
            }`}
          >
            Todos
          </button>
          {STOCK_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() =>
                setFilterCategory(filterCategory === cat ? "" : cat)
              }
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                filterCategory === cat
                  ? "bg-terracotta text-white"
                  : "bg-cream-dark text-charcoal"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stock list grouped by category */}
      <div className="px-4 space-y-4 animate-fade-in">
        {filtered.length === 0 ? (
          <EmptyState
            emoji="📦"
            title="Stock vazio"
            description={
              search || filterCategory
                ? "Nenhum item encontrado com esses filtros."
                : "Adiciona o primeiro item ao teu stock."
            }
            action={
              !search && !filterCategory ? (
                <Button size="sm" onClick={() => setShowAdd(true)}>
                  Adicionar item
                </Button>
              ) : undefined
            }
          />
        ) : (
          grouped.map(([category, catItems]) => (
            <section key={category}>
              <h3 className="text-xs font-bold text-stone uppercase tracking-wide mb-2">
                {category}{" "}
                <span className="font-normal text-stone-light">
                  ({catItems.length})
                </span>
              </h3>
              <div className="space-y-2">
                {catItems.map((item) => (
                  <StockItemRow
                    key={item.id}
                    item={item}
                    onAdjust={adjustQuantity}
                    onClick={() => setEditItem(item)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* FAB — add item */}
      <FAB onClick={() => setShowAdd(true)} label="Adicionar ao stock" />

      {/* Add modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Adicionar ao Stock"
      >
        <StockFormInline
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          loading={saving}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title="Editar Item"
      >
        {editItem && (
          <div>
            <StockFormInline
              initial={formFromItem(editItem)}
              onSubmit={handleEdit}
              onCancel={() => setEditItem(null)}
              loading={saving}
            />
            <button
              type="button"
              onClick={() => handleDelete(editItem.id)}
              className="w-full mt-3 py-2.5 text-sm text-rose font-semibold hover:bg-rose/5 rounded-xl transition-colors"
            >
              Eliminar item
            </button>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
