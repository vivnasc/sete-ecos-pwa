"use client";
import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { StockItem, StockLocation } from "@/lib/types";
import { STOCK_CATEGORIES, STOCK_LOCATIONS, STOCK_UNITS } from "@/lib/constants";

interface StockFormProps {
  initial?: Partial<StockItem>;
  onSubmit: (data: Partial<StockItem>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function StockForm({ initial, onSubmit, onCancel, loading }: StockFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || "Outros");
  const [location, setLocation] = useState(initial?.location || "pantry");
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 1));
  const [unit, setUnit] = useState(initial?.unit || "un");
  const [minThreshold, setMinThreshold] = useState(initial?.min_threshold != null ? String(initial.min_threshold) : "");
  const [expiryDate, setExpiryDate] = useState(initial?.expiry_date || "");
  const [source, setSource] = useState(initial?.source || "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({
      name: name.trim(),
      category,
      location: location as StockItem["location"],
      quantity: parseFloat(quantity) || 0,
      unit,
      min_threshold: minThreshold ? parseFloat(minThreshold) : null,
      expiry_date: expiryDate || null,
      source: source.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Arroz" required />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={STOCK_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <Select
          label="Localização"
          value={location}
          onChange={(e) => setLocation(e.target.value as StockLocation)}
          options={STOCK_LOCATIONS.map((l) => ({ value: l.value, label: `${l.emoji} ${l.label}` }))}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input label="Quantidade" type="number" step="0.1" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <Select
          label="Unidade"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          options={STOCK_UNITS.map((u) => ({ value: u, label: u }))}
        />
        <Input label="Mín. alerta" type="number" step="0.1" min="0" value={minThreshold} onChange={(e) => setMinThreshold(e.target.value)} placeholder="Opcional" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Validade" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        <Input label="Origem" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Ex: Komatipoort" />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button type="submit" loading={loading} className="flex-1">{initial?.id ? "Guardar" : "Adicionar"}</Button>
      </div>
    </form>
  );
}
