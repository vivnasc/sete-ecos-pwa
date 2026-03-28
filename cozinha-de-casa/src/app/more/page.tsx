"use client";
import Header from "@/components/layout/Header";
import PageWrapper from "@/components/layout/PageWrapper";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

// ---------------------------------------------------------------------------
// Menu items
// ---------------------------------------------------------------------------
interface MenuItem {
  emoji: string;
  title: string;
  description: string;
  href: string | null;
  comingSoon: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    emoji: "❤️",
    title: "Favoritas",
    description: "As receitas que a família mais gosta",
    href: "/recipes",
    comingSoon: false,
  },
  {
    emoji: "📝",
    title: "Notas",
    description: "Notas da semana, feedback de receitas",
    href: null,
    comingSoon: true,
  },
  {
    emoji: "👨‍👩‍👧‍👦",
    title: "Família",
    description: "Perfis alimentares e restrições",
    href: null,
    comingSoon: true,
  },
  {
    emoji: "❄️",
    title: "Congelador",
    description: "Controlo de porções congeladas",
    href: null,
    comingSoon: true,
  },
  {
    emoji: "🍱",
    title: "Lancheiras",
    description: "Planeamento de lancheiras da semana",
    href: null,
    comingSoon: true,
  },
  {
    emoji: "⚙️",
    title: "Definições",
    description: "Preferências e configurações",
    href: null,
    comingSoon: true,
  },
];

// ---------------------------------------------------------------------------
// Chevron icon
// ---------------------------------------------------------------------------
function ChevronRight() {
  return (
    <svg
      className="w-5 h-5 text-stone-light flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function MorePage() {
  return (
    <PageWrapper>
      <Header title="Mais" />

      <div className="px-4 py-4 space-y-3 animate-fade-in">
        {MENU_ITEMS.map((item) => {
          const inner = (
            <div className="flex items-center gap-3">
              <span className="text-2xl flex-shrink-0" aria-hidden="true">
                {item.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-charcoal text-sm">
                    {item.title}
                  </span>
                  {item.comingSoon && <Badge color="gray">Em breve</Badge>}
                </div>
                <p className="text-xs text-stone mt-0.5 truncate">
                  {item.description}
                </p>
              </div>
              <ChevronRight />
            </div>
          );

          if (item.href && !item.comingSoon) {
            return (
              <a key={item.title} href={item.href} className="block">
                <Card className="hover:shadow-md active:scale-[0.98] transition-all cursor-pointer">
                  {inner}
                </Card>
              </a>
            );
          }

          return (
            <Card
              key={item.title}
              className={item.comingSoon ? "opacity-70" : ""}
            >
              {inner}
            </Card>
          );
        })}
      </div>
    </PageWrapper>
  );
}
