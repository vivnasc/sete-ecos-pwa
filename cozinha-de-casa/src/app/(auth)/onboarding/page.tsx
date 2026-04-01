"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";

const ROLES = [
  { value: "admin", label: "Admin", emoji: "👑", desc: "Gere tudo: menu, stock, compras" },
  { value: "cozinheira", label: "Cozinheira", emoji: "👩‍🍳", desc: "Planeia e cozinha as refeições" },
  { value: "comprador", label: "Comprador", emoji: "🛒", desc: "Faz as compras e gere o stock" },
  { value: "membro", label: "Membro", emoji: "🏠", desc: "Consulta o menu e receitas" },
] as const;

const ALLERGIES = [
  { value: "leite", label: "Leite" },
  { value: "trigo", label: "Trigo" },
  { value: "ovos", label: "Ovos" },
  { value: "nenhuma", label: "Nenhuma" },
] as const;

const DIETS = [
  { value: "normal", label: "Normal" },
  { value: "low-carb", label: "Low Carb" },
  { value: "adaptado", label: "Adaptado" },
];

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");

  // Step 2
  const [role, setRole] = useState("");

  // Step 3
  const [allergies, setAllergies] = useState<string[]>([]);
  const [diet, setDiet] = useState("");
  const [preferences, setPreferences] = useState("");

  function toggleAllergy(value: string) {
    if (value === "nenhuma") {
      setAllergies((prev) => (prev.includes("nenhuma") ? [] : ["nenhuma"]));
      return;
    }
    setAllergies((prev) => {
      const without = prev.filter((a) => a !== "nenhuma");
      return without.includes(value)
        ? without.filter((a) => a !== value)
        : [...without, value];
    });
  }

  function handleNext() {
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  function handleFinish() {
    router.push("/");
  }

  const canAdvance =
    (step === 1 && name.trim().length > 0) ||
    (step === 2 && role !== "") ||
    (step === 3) ||
    (step === 4);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-cream-dark h-1.5">
        <div
          className="h-full bg-terracotta transition-all duration-300 rounded-r-full"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {/* Header with back */}
      <div className="px-4 pt-4 flex items-center h-12">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="p-1 -ml-1 text-charcoal hover:text-terracotta active:scale-95"
            aria-label="Voltar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <span className="ml-auto text-xs text-stone-light font-semibold">
          {step} de {TOTAL_STEPS}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pt-6 pb-8 max-w-sm mx-auto w-full animate-fade-in" key={step}>
        {/* Step 1: Name */}
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-display text-charcoal mb-2">
              Como te chamas?
            </h1>
            <p className="text-sm text-stone-light mb-8">
              Vamos personalizar a tua experiência.
            </p>
            <Input
              placeholder="O teu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              autoComplete="given-name"
            />
          </div>
        )}

        {/* Step 2: Role */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-display text-charcoal mb-2">
              Qual o teu papel?
            </h1>
            <p className="text-sm text-stone-light mb-6">
              Podes mudar isto mais tarde.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <Card
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`!p-4 text-center transition-all ${
                    role === r.value
                      ? "!border-terracotta !bg-terracotta/5 ring-2 ring-terracotta/20"
                      : ""
                  }`}
                >
                  <span className="text-3xl block mb-2">{r.emoji}</span>
                  <p className="text-sm font-bold text-charcoal">{r.label}</p>
                  <p className="text-xs text-stone-light mt-1">{r.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Dietary profile */}
        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-display text-charcoal mb-2">
              Perfil alimentar
            </h1>
            <p className="text-sm text-stone-light mb-6">
              Para filtrar receitas automaticamente.
            </p>

            <div className="space-y-5">
              {/* Allergies */}
              <div>
                <p className="text-sm font-semibold text-charcoal mb-2">
                  Alergias / Intolerâncias
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALLERGIES.map((a) => {
                    const selected = allergies.includes(a.value);
                    return (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() => toggleAllergy(a.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95 ${
                          selected
                            ? "bg-terracotta text-white border-terracotta"
                            : "bg-white text-charcoal border-cream-dark hover:border-terracotta/40"
                        }`}
                      >
                        {a.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Diet */}
              <Select
                label="Tipo de dieta"
                placeholder="Selecciona..."
                options={DIETS}
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
              />

              {/* Preferences */}
              <Input
                label="Preferências (opcional)"
                placeholder="Ex: sem picante, gosto de peixe..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl font-display text-charcoal mb-2">
              Quase pronto!
            </h1>
            <p className="text-sm text-stone-light mb-6">
              Confirma os teus dados.
            </p>

            <Card className="space-y-4">
              <div>
                <p className="text-xs text-stone-light uppercase tracking-wide">Nome</p>
                <p className="text-sm font-semibold text-charcoal">{name || "—"}</p>
              </div>
              <div className="border-t border-cream-dark pt-3">
                <p className="text-xs text-stone-light uppercase tracking-wide">Papel</p>
                <p className="text-sm font-semibold text-charcoal">
                  {ROLES.find((r) => r.value === role)
                    ? `${ROLES.find((r) => r.value === role)!.emoji} ${ROLES.find((r) => r.value === role)!.label}`
                    : "—"}
                </p>
              </div>
              <div className="border-t border-cream-dark pt-3">
                <p className="text-xs text-stone-light uppercase tracking-wide">Alergias</p>
                <p className="text-sm font-semibold text-charcoal">
                  {allergies.length > 0
                    ? allergies.map((a) => ALLERGIES.find((al) => al.value === a)?.label).join(", ")
                    : "Nenhuma"}
                </p>
              </div>
              <div className="border-t border-cream-dark pt-3">
                <p className="text-xs text-stone-light uppercase tracking-wide">Dieta</p>
                <p className="text-sm font-semibold text-charcoal">
                  {DIETS.find((d) => d.value === diet)?.label || "Não especificada"}
                </p>
              </div>
              {preferences && (
                <div className="border-t border-cream-dark pt-3">
                  <p className="text-xs text-stone-light uppercase tracking-wide">Preferências</p>
                  <p className="text-sm font-semibold text-charcoal">{preferences}</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Bottom action */}
        <div className="mt-8">
          {step < TOTAL_STEPS ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleNext}
              disabled={!canAdvance}
            >
              Continuar
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleFinish}
            >
              Começar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
