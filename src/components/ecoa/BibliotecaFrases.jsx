import React, { useState } from 'react'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'
import { FRASES_DIFICEIS } from '../../lib/ecoa/gamificacao'

// ============================================================
// ECOA — Biblioteca de Frases: Como Dizer Coisas Dificeis
// Eco da Expressao & Voz (Vishuddha)
// Componente educativo de leitura — sem escrita em base de dados
// ============================================================

const ACCENT = '#4A90A4'
const ACCENT_DARK = '#1a2a34'
const ACCENT_LIGHT = '#6DB0C4'

// Category badge colors
const CATEGORIA_CORES = {
  limite: { bg: '#C1634A22', text: '#D4826A', label: 'Limite' },
  dor: { bg: '#8B7BA522', text: '#A99BC5', label: 'Dor' },
  desacordo: { bg: '#C4A26522', text: '#D4B87A', label: 'Desacordo' },
  necessidade: { bg: '#5D9B8422', text: '#7DBBA4', label: 'Necessidade' },
  verdade: { bg: '#CE93D822', text: '#CE93D8', label: 'Verdade' }
}

// ---- Category badge component ----
const CategoriaBadge = ({ categoria }) => {
  const config = CATEGORIA_CORES[categoria] || { bg: `${ACCENT}22`, text: ACCENT_LIGHT, label: categoria }
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ background: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  )
}

// ---- Phrase card (grid view) ----
const FraseCard = ({ frase, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white/5 border border-white/10 rounded-xl p-5 text-left hover:bg-white/8 hover:border-white/15 transition-all duration-200 active:scale-[0.98] flex flex-col gap-3 h-full"
    aria-label={`Frase: ${frase.frase}`}
  >
    <CategoriaBadge categoria={frase.categoria} />
    <p
      className="text-white font-semibold text-base leading-snug flex-1"
      style={{ fontFamily: 'var(--font-titulos)' }}
    >
      "{frase.frase}"
    </p>
    <p className="text-xs text-white/30 mt-auto">Toca para explorar</p>
  </button>
)

// ---- Detail view for a single phrase ----
const FraseDetalhe = ({ frase, onBack }) => {
  const config = CATEGORIA_CORES[frase.categoria] || { bg: `${ACCENT}22`, text: ACCENT_LIGHT, label: frase.categoria }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with category */}
      <div className="text-center space-y-4 pt-2">
        <CategoriaBadge categoria={frase.categoria} />
        <h2
          className="text-2xl font-bold text-white leading-tight px-4"
          style={{ fontFamily: 'var(--font-titulos)' }}
        >
          "{frase.frase}"
        </h2>
      </div>

      {/* Quando usar */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
        <h3 className="font-semibold text-sm mb-2" style={{ color: ACCENT_LIGHT }}>
          Quando usar
        </h3>
        <p className="text-white/80 text-sm leading-relaxed">{frase.contexto}</p>
      </div>

      {/* Variacoes */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
        <h3 className="font-semibold text-sm mb-3" style={{ color: ACCENT_LIGHT }}>
          {g('Variacoes', 'Variacoes')} \u2014 outras formas de dizer
        </h3>
        <div className="space-y-2">
          {frase.variacoes.map((variacao, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-medium"
                style={{ background: `${ACCENT}22`, color: ACCENT_LIGHT }}
              >
                {i + 1}
              </div>
              <p
                className="text-white/75 text-sm leading-relaxed italic"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                "{variacao}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* O que esperar */}
      <div
        className="rounded-2xl p-5"
        style={{ background: config.bg, border: `1px solid ${config.text}25` }}
      >
        <h3 className="font-semibold text-sm mb-2" style={{ color: config.text }}>
          O que esperar
        </h3>
        <p className="text-white/75 text-sm leading-relaxed">{frase.esperar}</p>
      </div>

      {/* Pratica */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}30` }}
      >
        <div className="text-3xl mb-3" aria-hidden="true">{'\uD83D\uDD0A'}</div>
        <h3
          className="font-bold text-base text-white mb-2"
          style={{ fontFamily: 'var(--font-titulos)' }}
        >
          Pratica
        </h3>
        <p className="text-sm text-white/60 leading-relaxed">
          Diz esta frase em voz alta agora. Repete 3 vezes.
        </p>
        <p
          className="text-lg font-semibold text-white mt-4 leading-relaxed"
          style={{ fontFamily: 'var(--font-titulos)' }}
        >
          "{frase.frase}"
        </p>
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
            >
              {n}x
            </div>
          ))}
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors"
      >
        Ver todas as frases
      </button>
    </div>
  )
}

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function BibliotecaFrases() {
  const [selectedId, setSelectedId] = useState(null)
  const [filterCategoria, setFilterCategoria] = useState(null)

  const selectedFrase = selectedId ? FRASES_DIFICEIS.find(f => f.id === selectedId) : null
  const categorias = [...new Set(FRASES_DIFICEIS.map(f => f.categoria))]

  const filteredFrases = filterCategoria
    ? FRASES_DIFICEIS.filter(f => f.categoria === filterCategoria)
    : FRASES_DIFICEIS

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${ACCENT_DARK} 0%, #111318 30%, #0d0f13 100%)` }}>
      <ModuleHeader
        eco="ecoa"
        title="Biblioteca de Frases"
        subtitle="Como dizer coisas dificeis"
      />

      <div className="max-w-lg mx-auto px-5 py-6">
        {!selectedFrase ? (
          <>
            {/* Introduction */}
            <p className="text-white/50 text-sm mb-6">
              Frases que normalmente calamos \u2014 com contexto, variacoes e o que esperar quando as disseres.
            </p>

            {/* Category filters */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
              <button
                onClick={() => setFilterCategoria(null)}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full transition-all duration-200"
                style={{
                  background: !filterCategoria ? `${ACCENT}33` : 'rgba(255,255,255,0.06)',
                  color: !filterCategoria ? ACCENT_LIGHT : 'rgba(255,255,255,0.4)',
                  border: !filterCategoria ? `1px solid ${ACCENT}44` : '1px solid transparent'
                }}
                aria-pressed={!filterCategoria}
              >
                Todas
              </button>
              {categorias.map(cat => {
                const config = CATEGORIA_CORES[cat]
                const isActive = filterCategoria === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategoria(isActive ? null : cat)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full transition-all duration-200"
                    style={{
                      background: isActive ? config.bg : 'rgba(255,255,255,0.06)',
                      color: isActive ? config.text : 'rgba(255,255,255,0.4)',
                      border: isActive ? `1px solid ${config.text}44` : '1px solid transparent'
                    }}
                    aria-pressed={isActive}
                  >
                    {config.label}
                  </button>
                )
              })}
            </div>

            {/* Phrases grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredFrases.map((frase) => (
                <FraseCard
                  key={frase.id}
                  frase={frase}
                  onClick={() => setSelectedId(frase.id)}
                />
              ))}
            </div>

            {filteredFrases.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/40 text-sm">Nenhuma frase nesta categoria.</p>
              </div>
            )}
          </>
        ) : (
          <FraseDetalhe
            frase={selectedFrase}
            onBack={() => setSelectedId(null)}
          />
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
