"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--cream)]/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-rose-400 to-violet-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">7V</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#sobre" className="text-[var(--text-dark)] hover:text-[var(--sage-green)] transition-colors">
            Sobre
          </Link>
          <Link href="#livro" className="text-[var(--text-dark)] hover:text-[var(--sage-green)] transition-colors">
            O Livro
          </Link>
          <Link href="#recursos" className="text-[var(--text-dark)] hover:text-[var(--sage-green)] transition-colors">
            Recursos
          </Link>
          <Link href="#contacto" className="text-[var(--text-dark)] hover:text-[var(--sage-green)] transition-colors">
            Contacto
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-[var(--cream-light)] rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-[var(--cream-light)] rounded-full transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--cream)] border-t border-[var(--sage-green)]/20 px-6 py-4">
          <nav className="flex flex-col gap-4">
            <Link href="#sobre" className="text-[var(--text-dark)] hover:text-[var(--sage-green)] transition-colors py-2" onClick={() => setMenuOpen(false)}>
              Sobre
            </Link>
            <Link href="#livro" className="text-[var(--text-dark)] hover:text-[var(--sage-green)] transition-colors py-2" onClick={() => setMenuOpen(false)}>
              O Livro
            </Link>
            <Link href="#recursos" className="text-[var(--text-dark)] hover:text-[var(--sage-green)] transition-colors py-2" onClick={() => setMenuOpen(false)}>
              Recursos
            </Link>
            <Link href="#contacto" className="text-[var(--text-dark)] hover:text-[var(--sage-green)] transition-colors py-2" onClick={() => setMenuOpen(false)}>
              Contacto
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
