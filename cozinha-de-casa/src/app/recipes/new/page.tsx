"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { RECIPE_CATEGORIES, RECIPE_CUISINES, RECIPE_TAGS, RECIPE_DIFFICULTIES, STOCK_UNITS } from "@/lib/constants";

interface IngredientForm {
  name: string;
  qty: string;
  unit: string;
  is_allergen_milk: boolean;
  is_allergen_wheat: boolean;
  is_allergen_egg: boolean;
}

const emptyIngredient: IngredientForm = {
  name: "",
  qty: "1",
  unit: "un",
  is_allergen_milk: false,
  is_allergen_wheat: false,
  is_allergen_egg: false,
};

export default function NewRecipePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Prato principal");
  const [cuisine, setCuisine] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState("30");
  const [servings, setServings] = useState("5");
  const [difficulty, setDifficulty] = useState("");
  const [ingredients, setIngredients] = useState<IngredientForm[]>([{ ...emptyIngredient }]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const updateIngredient = (index: number, field: keyof IngredientForm, value: string | boolean) => {
    setIngredients((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addIngredient = () => setIngredients((prev) => [...prev, { ...emptyIngredient }]);
  const removeIngredient = (index: number) => setIngredients((prev) => prev.filter((_, i) => i !== index));

  const updateStep = (index: number, value: string) => {
    setSteps((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addStep = () => setSteps((prev) => [...prev, ""]);
  const removeStep = (index: number) => setSteps((prev) => prev.filter((_, i) => i !== index));

  const hasAllergenMilkOrWheat = ingredients.some((i) => i.is_allergen_milk || i.is_allergen_wheat);
  const hasAllergenEgg = ingredients.some((i) => i.is_allergen_egg);

  const handleSave = () => {
    if (!name.trim()) return;
    setSaving(true);
    // TODO: Save to Supabase
    setTimeout(() => {
      alert("Receita guardada!");
      router.push("/recipes");
    }, 500);
  };

  return (
    <PageWrapper>
      <Header title="Nova Receita" showBack />
      <div className="p-4 space-y-5 animate-fade-in">
        {/* Allergen warnings */}
        {(hasAllergenMilkOrWheat || hasAllergenEgg) && (
          <div className="flex flex-wrap gap-2">
            {hasAllergenMilkOrWheat && (
              <Badge color="red">⚠ Contém {[
                ingredients.some((i) => i.is_allergen_milk) && "leite",
                ingredients.some((i) => i.is_allergen_wheat) && "trigo",
              ].filter(Boolean).join("/")}</Badge>
            )}
            {hasAllergenEgg && <Badge color="orange">⚠ Contém ovos</Badge>}
          </div>
        )}

        {/* Basic info */}
        <Input label="Nome da receita" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Caril de frango" required />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Categoria"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={RECIPE_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <Select
            label="Culinária"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            options={RECIPE_CUISINES.map((c) => ({ value: c, label: c }))}
            placeholder="Opcional"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input label="Tempo (min)" type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} min="1" />
          <Input label="Porções" type="number" value={servings} onChange={(e) => setServings(e.target.value)} min="1" />
          <Select
            label="Dificuldade"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            options={RECIPE_DIFFICULTIES.map((d) => ({ value: d, label: d }))}
            placeholder="—"
          />
        </div>

        {/* Tags */}
        <div>
          <p className="text-sm font-semibold text-charcoal mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {RECIPE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  tags.includes(tag)
                    ? "bg-terracotta text-white border-terracotta"
                    : "bg-white text-charcoal border-cream-dark hover:border-terracotta"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <p className="text-sm font-semibold text-charcoal mb-2">Ingredientes</p>
          <div className="space-y-3">
            {ingredients.map((ing, i) => (
              <div key={i} className="bg-white rounded-xl border border-cream-dark p-3 space-y-2">
                <div className="flex gap-2">
                  <Input placeholder="Ingrediente" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} className="flex-1" />
                  <Input placeholder="Qtd" type="number" value={ing.qty} onChange={(e) => updateIngredient(i, "qty", e.target.value)} className="w-16" />
                  <select
                    value={ing.unit}
                    onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                    className="px-2 py-2 rounded-xl border border-cream-dark bg-white text-sm w-20"
                  >
                    {STOCK_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={ing.is_allergen_milk} onChange={(e) => updateIngredient(i, "is_allergen_milk", e.target.checked)} className="rounded" />
                      🥛 Leite
                    </label>
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={ing.is_allergen_wheat} onChange={(e) => updateIngredient(i, "is_allergen_wheat", e.target.checked)} className="rounded" />
                      🌾 Trigo
                    </label>
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={ing.is_allergen_egg} onChange={(e) => updateIngredient(i, "is_allergen_egg", e.target.checked)} className="rounded" />
                      🥚 Ovos
                    </label>
                  </div>
                  {ingredients.length > 1 && (
                    <button onClick={() => removeIngredient(i)} className="text-rose text-xs font-semibold">Remover</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={addIngredient} className="mt-2 text-sm text-terracotta font-semibold">+ Adicionar ingrediente</button>
        </div>

        {/* Steps */}
        <div>
          <p className="text-sm font-semibold text-charcoal mb-2">Passos</p>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="w-6 h-6 rounded-full bg-terracotta text-white text-xs flex items-center justify-center flex-shrink-0 mt-2">{i + 1}</span>
                <textarea
                  value={step}
                  onChange={(e) => updateStep(i, e.target.value)}
                  placeholder={`Passo ${i + 1}`}
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-xl border border-cream-dark bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                />
                {steps.length > 1 && (
                  <button onClick={() => removeStep(i)} className="text-rose text-xs mt-2">✕</button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addStep} className="mt-2 text-sm text-terracotta font-semibold">+ Adicionar passo</button>
        </div>

        {/* Notes */}
        <div>
          <p className="text-sm font-semibold text-charcoal mb-1">Notas</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Dicas, variações..."
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-cream-dark bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-terracotta/30"
          />
        </div>

        {/* Save */}
        <div className="flex gap-3 pb-4">
          <Button variant="secondary" onClick={() => router.back()} className="flex-1">Cancelar</Button>
          <Button onClick={handleSave} loading={saving} disabled={!name.trim()} className="flex-1">Guardar Receita</Button>
        </div>
      </div>
    </PageWrapper>
  );
}
