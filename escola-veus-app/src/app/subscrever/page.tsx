"use client";

import { useState } from "react";
import Link from "next/link";

const PLANOS = [
  {
    id: "mensal",
    nome: "Mensal",
    preco: "$19",
    precoMZN: "~1 200 MZN",
    periodo: "/mês",
    destaque: false,
    descricao: "Acesso total. Cancela quando quiseres.",
  },
  {
    id: "anual",
    nome: "Anual",
    preco: "$149",
    precoMZN: "~9 500 MZN",
    periodo: "/ano",
    destaque: true,
    descricao: "Poupa 35%. Acesso total por 12 meses.",
    poupanca: "Poupa $79",
  },
];

export default function SubscreverPage() {
  const [planoId, setPlanoId] = useState("anual");

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <span className="text-escola-dourado text-[10px] uppercase tracking-[0.3em] block mb-2">
            Escola dos Véus
          </span>
          <h1 className="text-2xl sm:text-3xl text-escola-creme mb-3">
            Começa a tua transformação
          </h1>
          <p className="text-escola-muted text-sm">
            7 dias grátis. 20 cursos. Cancela a qualquer momento.
          </p>
        </div>

        {/* Planos */}
        <div className="space-y-3 mb-8">
          {PLANOS.map((plano) => (
            <button
              key={plano.id}
              onClick={() => setPlanoId(plano.id)}
              className={`w-full p-4 rounded-xl border text-left transition-all active:scale-[0.98] ${
                planoId === plano.id
                  ? "border-escola-dourado/60 bg-escola-dourado/[0.08]"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm text-escola-creme font-medium">
                      {plano.nome}
                    </h3>
                    {plano.poupanca && (
                      <span className="text-[9px] text-escola-dourado bg-escola-dourado/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {plano.poupanca}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-escola-muted-dark mt-0.5">
                    {plano.descricao}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <span className="text-lg text-escola-creme">{plano.preco}</span>
                  <span className="text-xs text-escola-muted-dark">{plano.periodo}</span>
                  <p className="text-[10px] text-escola-muted-dark">{plano.precoMZN}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* O que inclui */}
        <div className="mb-8 px-2">
          <h3 className="text-xs text-escola-muted uppercase tracking-wider mb-3">
            O que inclui
          </h3>
          <ul className="space-y-2">
            {[
              "20 cursos de transformação interior",
              "8 módulos por curso com vídeos",
              "Cadernos de exercícios por módulo",
              "Novos conteúdos adicionados regularmente",
              "Acesso em qualquer dispositivo",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-escola-muted">
                <span className="text-escola-dourado mt-0.5 flex-shrink-0">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button className="w-full bg-escola-dourado text-escola-bg font-medium py-3.5 rounded-lg hover:bg-escola-dourado/90 active:scale-[0.98] transition-all text-sm mb-3">
          Começar 7 dias grátis
        </button>

        <p className="text-center text-[10px] text-escola-muted-dark">
          Após os 7 dias grátis, a subscrição {planoId === "mensal" ? "mensal" : "anual"} é activada
          automaticamente. Cancela a qualquer momento.
        </p>

        <p className="text-center text-xs text-escola-muted-dark mt-4">
          <Link href="/entrar" className="text-escola-dourado hover:underline">
            Já tens conta? Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
