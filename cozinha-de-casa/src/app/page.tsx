"use client";

import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { MENU_SLOTS } from "@/lib/constants";
import { SAMPLE_RECIPES as sampleRecipes } from "@/lib/sample-recipes";
import { getAllergenBadges } from "@/lib/allergens";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const WEEKDAYS = [
  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
];

function formatDate(date: Date): string {
  const day = WEEKDAYS[date.getDay()];
  const num = date.getDate();
  const month = MONTHS[date.getMonth()];
  return `${day}, ${num} de ${month}`;
}

const expiringItems = [
  { name: "Iogurte natural", expiry: "2026-03-29", daysLeft: 1 },
  { name: "Peito de frango", expiry: "2026-03-30", daysLeft: 2 },
  { name: "Espinafre", expiry: "2026-03-27", daysLeft: -1 },
];

export default function HomePage() {
  const today = new Date();
  const quickRecipes = sampleRecipes.slice(0, 4);

  return (
    <PageWrapper>
      <div className="px-4 pt-6 pb-4 animate-fade-in">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-display text-charcoal">
            Olá! 👋
          </h1>
          <p className="text-sm text-stone-light mt-1">{formatDate(today)}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="text-center !p-3">
            <span className="text-xl mb-1 block">📖</span>
            <p className="text-lg font-bold text-charcoal">8</p>
            <p className="text-xs text-stone-light">receitas</p>
          </Card>
          <Card className="text-center !p-3">
            <span className="text-xl mb-1 block">📦</span>
            <p className="text-lg font-bold text-charcoal">24</p>
            <p className="text-xs text-stone-light">items em stock</p>
          </Card>
          <Card className="text-center !p-3">
            <span className="text-xl mb-1 block">🛒</span>
            <p className="text-lg font-bold text-charcoal">5</p>
            <p className="text-xs text-stone-light">por comprar</p>
          </Card>
        </div>

        {/* Today's Menu */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display text-charcoal">Hoje</h2>
            <Link
              href="/menu"
              className="text-sm text-terracotta font-semibold hover:underline"
            >
              Ver menu →
            </Link>
          </div>
          <Card>
            <div className="space-y-3">
              {MENU_SLOTS.map((slot) => (
                <div
                  key={slot.value}
                  className="flex items-center justify-between py-2 border-b border-cream-dark last:border-0 last:pb-0 first:pt-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-charcoal truncate">
                      {slot.label}
                    </p>
                    <p className="text-xs text-stone-light">{slot.sublabel}</p>
                  </div>
                  <Link
                    href="/menu"
                    className="text-sm text-stone-light hover:text-terracotta transition-colors ml-3 shrink-0"
                  >
                    Sem plano
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Quick Recipes */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display text-charcoal">
              Receitas rápidas
            </h2>
            <Link
              href="/recipes"
              className="text-sm text-terracotta font-semibold hover:underline"
            >
              Ver todas →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
            {quickRecipes.map((recipe) => {
              const badges = getAllergenBadges(recipe.ingredients);
              return (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="shrink-0 w-44"
                >
                  <Card className="!p-3 h-full hover:shadow-md transition-shadow">
                    <div className="w-full h-20 bg-cream-dark rounded-lg flex items-center justify-center text-3xl mb-2">
                      🍽️
                    </div>
                    <p className="text-sm font-semibold text-charcoal line-clamp-2 mb-1">
                      {recipe.name}
                    </p>
                    <p className="text-xs text-stone-light mb-2">
                      ⏱ {recipe.prep_time_min} min
                    </p>
                    {badges.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {badges.map((b, i) => (
                          <Badge key={i} color={b.color}>
                            {b.allergens.join("/")}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Expiring Soon */}
        <section className="mb-4">
          <h2 className="text-lg font-display text-charcoal mb-3">
            A expirar
          </h2>
          <div className="space-y-2">
            {expiringItems.map((item, i) => {
              const isExpired = item.daysLeft <= 0;
              const isUrgent = item.daysLeft > 0 && item.daysLeft <= 3;
              return (
                <Card key={i} className="!p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-charcoal truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-stone-light">{item.expiry}</p>
                    </div>
                    <Badge color={isExpired ? "red" : isUrgent ? "orange" : "green"}>
                      {isExpired
                        ? "Expirado"
                        : item.daysLeft === 1
                          ? "1 dia"
                          : `${item.daysLeft} dias`}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
