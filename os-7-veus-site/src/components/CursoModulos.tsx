"use client";

import { useState } from "react";

interface Modulo {
  titulo: string;
  resumo: string;
}

export default function CursoModulos({ modulos, cor }: { modulos: Modulo[]; cor: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {modulos.map((modulo, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="rounded-xl bg-white/5 border border-white/10 overflow-hidden transition-all"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
              aria-expanded={isOpen}
            >
              <span
                className="text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                style={{ backgroundColor: cor }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-white text-lg flex-grow min-w-0">
                {modulo.titulo}
              </span>
              <svg
                className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pl-17">
                <p className="text-[#9990b0] leading-relaxed pl-12">
                  {modulo.resumo}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
