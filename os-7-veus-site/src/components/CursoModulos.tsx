"use client";

import { useState } from "react";

interface Modulo {
  titulo: string;
  resumo: string;
}

export default function CursoModulos({ modulos, cor }: { modulos: Modulo[]; cor: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-1">
      {modulos.map((modulo, index) => {
        const isOpen = openIndex === index;
        return (
          <button
            key={index}
            onClick={() => setOpenIndex(isOpen ? null : index)}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors text-left group"
            aria-expanded={isOpen}
          >
            {/* Number badge */}
            <span
              className="text-[10px] font-medium w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: `${cor}15`,
                color: cor,
                border: `1px solid ${cor}25`,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#F5F0E6] truncate">
                {modulo.titulo}
              </p>
              {isOpen && (
                <p className="text-[11px] text-[#666680] mt-1">
                  {modulo.resumo}
                </p>
              )}
            </div>

            {/* Arrow */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#666680"
              strokeWidth="2"
              className={`h-4 w-4 flex-shrink-0 transition-all ${
                isOpen ? "rotate-180 opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
