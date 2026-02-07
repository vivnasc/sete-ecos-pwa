import { useState } from 'react'

/**
 * SustainabilityBadge — Badge de sustentabilidade digital.
 * Mostra compromisso com green coding e desenvolvimento sustentável.
 * Padrão top-10 2026: transparência ambiental.
 */
export default function SustainabilityBadge({ compact = false }) {
  const [expanded, setExpanded] = useState(false)

  const practices = [
    { label: 'Build-time CSS', desc: 'Tailwind compilado, sem CDN runtime' },
    { label: 'Code splitting', desc: 'Carregamento lazy por módulo' },
    { label: 'Cache inteligente', desc: 'Service Worker com estratégias otimizadas' },
    { label: 'Imagens otimizadas', desc: 'Formatos modernos, lazy loading' },
    { label: 'Servidor edge', desc: 'Vercel Edge para latência mínima' },
    { label: 'Zero dependências supérfluas', desc: 'Bundle auditado regularmente' },
  ]

  if (compact) {
    return (
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
        aria-label="Informações sobre práticas de sustentabilidade digital"
        aria-expanded={expanded}
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clipRule="evenodd" />
        </svg>
        Eco-Digital
      </button>
    )
  }

  return (
    <section
      aria-labelledby="sustainability-title"
      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 id="sustainability-title" className="font-semibold text-green-800">
            Plataforma Eco-Digital
          </h3>
          <p className="text-xs text-green-600">
            Compromisso com sustentabilidade digital
          </p>
        </div>
      </div>

      <ul className="space-y-2" role="list">
        {practices.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            <div>
              <span className="font-medium text-green-800">{p.label}</span>
              <span className="text-green-600"> — {p.desc}</span>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-green-500 italic">
        Cada byte conta. Construido com praticas de green coding para minimizar a pegada digital.
      </p>
    </section>
  )
}
