"use client";

import { useState } from "react";
import Link from "next/link";

interface RecursoCard {
  title: string;
  description: string;
  tag?: string;
  image?: string;
  downloadUrl?: string;
  requiresEmail?: boolean;
}

const recursos: RecursoCard[] = [
  {
    title: "O Teste do Automático",
    description: "10 perguntas para descobrir se estás a viver ou a sobreviver no piloto automático. Demora 3 minutos. A resposta pode demorar mais.",
    tag: "GRÁTIS",
    downloadUrl: "#",
    requiresEmail: false,
  },
  {
    title: "30 Wallpapers",
    description: "Lembre-se do que importa. Imagens para o teu telemóvel que te ajudam a pausar.",
    downloadUrl: "#",
    requiresEmail: true,
  },
  {
    title: "Guia dos 7 Véus",
    description: "Uma introdução aos sete padrões automáticos e como reconhecê-los no dia-a-dia.",
    downloadUrl: "#",
    requiresEmail: true,
  },
  {
    title: "Diário de Observação",
    description: "21 dias de perguntas simples para começares a notar o que normalmente ignoras.",
    downloadUrl: "#",
    requiresEmail: true,
  },
];

export default function Recursos() {
  const [email, setEmail] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);

  return (
    <section id="recursos" className="py-20 px-6 bg-[var(--cream)]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl text-[var(--text-dark)] text-center mb-4">
          Recursos Gratuitos
        </h2>

        <p className="text-[var(--text-dark)]/60 text-center mb-12">
          Ferramentas para quem quer começar a ver. Sem pressa, sem fórmulas — apenas espelhos.
        </p>

        {/* Começa por aqui - Featured */}
        <div className="bg-gradient-to-br from-[var(--sage-green)]/10 to-[var(--sage-green)]/5 border-2 border-[var(--sage-green)]/30 rounded-2xl p-8 mb-8">
          <h3 className="text-[var(--sage-green)] text-xl font-medium text-center mb-2">
            Começa por aqui
          </h3>
          <p className="text-[var(--text-dark)]/60 text-center text-sm mb-6">
            Download imediato, sem email
          </p>

          <div className="bg-white rounded-xl p-6 max-w-sm mx-auto text-center shadow-sm">
            <div className="w-32 h-40 mx-auto mb-4 bg-[var(--cream-light)] rounded-lg flex items-center justify-center">
              <span className="text-4xl">📓</span>
            </div>

            <span className="inline-block bg-[var(--sage-green)] text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
              GRÁTIS
            </span>

            <h4 className="text-xl text-[var(--text-dark)] mb-2">
              O Teste do Automático
            </h4>

            <p className="text-[var(--text-dark)]/60 text-sm mb-4">
              10 perguntas para descobrir se estás a viver ou a sobreviver no piloto automático. Demora 3 minutos. A resposta pode demorar mais.
            </p>

            <Link
              href="#"
              className="inline-block bg-[var(--sage-green)] text-white font-medium py-3 px-6 rounded hover:bg-[var(--sage-green)]/90 transition-colors text-sm"
            >
              Descarregar Grátis
            </Link>
          </div>
        </div>

        {/* + 6 Recursos */}
        <div className="bg-white rounded-xl p-6 text-center shadow-sm mb-8">
          <h4 className="text-xl text-[var(--text-dark)] mb-2">
            + 6 Recursos Gratuitos
          </h4>
          <p className="text-[var(--text-dark)]/60 text-sm mb-4">
            Deixa o teu email e enviamos tudo — também grátis
          </p>

          <button
            onClick={() => setShowEmailModal(true)}
            className="inline-block bg-[var(--brown-dark)] text-white font-medium py-3 px-6 rounded hover:bg-[var(--brown-medium)] transition-colors text-sm"
          >
            Receber Grátis
          </button>
        </div>

        {/* Grid de recursos */}
        <div className="grid md:grid-cols-2 gap-6">
          {recursos.slice(1).map((recurso, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-full h-32 bg-[var(--cream-light)] rounded-lg mb-4 flex items-center justify-center">
                <span className="text-4xl">
                  {index === 0 ? "🖼️" : index === 1 ? "📖" : "📝"}
                </span>
              </div>

              <h4 className="text-lg text-[var(--text-dark)] mb-2">
                {recurso.title}
              </h4>

              <p className="text-[var(--text-dark)]/60 text-sm">
                {recurso.description}
              </p>
            </div>
          ))}
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl text-[var(--text-dark)] mb-4">
                Receber recursos grátis
              </h3>

              <p className="text-[var(--text-dark)]/60 mb-6">
                Deixa o teu email e enviamos todos os recursos diretamente para ti.
              </p>

              <input
                type="email"
                placeholder="O teu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--sage-green)]/30 rounded-lg mb-4 focus:outline-none focus:border-[var(--sage-green)]"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 py-3 px-6 border border-[var(--text-dark)]/20 rounded-lg hover:bg-[var(--cream-light)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 bg-[var(--sage-green)] text-white py-3 px-6 rounded-lg hover:bg-[var(--sage-green)]/90 transition-colors"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
