"use client";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function Header({ title, showBack, rightAction }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 bg-cream border-b border-cream-dark">
      <div className="max-w-app mx-auto flex items-center h-14 px-4">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="mr-2 p-1 -ml-1 text-charcoal hover:text-terracotta active:scale-95"
            aria-label="Voltar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="flex-1 text-xl font-display text-charcoal truncate">{title}</h1>
        {rightAction && <div className="ml-2">{rightAction}</div>}
      </div>
    </header>
  );
}
