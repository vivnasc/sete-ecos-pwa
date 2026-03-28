"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Início", icon: "🏠" },
  { href: "/stock", label: "Stock", icon: "📦" },
  { href: "/recipes", label: "Receitas", icon: "📖" },
  { href: "/menu", label: "Cardápio", icon: "📅" },
  { href: "/more", label: "Mais", icon: "⋯" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on auth pages
  if (pathname?.startsWith("/login") || pathname?.startsWith("/onboarding")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-cream-dark" role="navigation" aria-label="Menu principal">
      <div className="max-w-app mx-auto flex items-center justify-around py-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] rounded-lg transition-colors ${
                isActive
                  ? "text-terracotta"
                  : "text-stone hover:text-charcoal"
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-body font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
