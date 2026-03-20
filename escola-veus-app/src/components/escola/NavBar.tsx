"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Início", icon: "🏠" },
  { href: "/cursos", label: "Cursos", icon: "📚" },
  { href: "/conta", label: "Conta", icon: "👤" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-escola-bg/95 backdrop-blur-md border-t border-white/[0.06]"
      aria-label="Navegação principal"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 py-2 px-4 text-xs transition-colors ${
                active
                  ? "text-escola-dourado"
                  : "text-escola-muted-dark hover:text-escola-muted"
              }`}
            >
              <span className="text-lg" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
