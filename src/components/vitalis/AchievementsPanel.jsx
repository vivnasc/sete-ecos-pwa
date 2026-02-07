import { useState } from 'react'
import { CONQUISTAS } from './Gamificacao.jsx'

/**
 * AchievementsPanel — Secção de conquistas com modal completo
 * Extraído do DashboardVitalis para melhor manutenção.
 */
export default function AchievementsPanel({
  conquistasDesbloqueadas,
  xpTotal,
}) {
  const [showModal, setShowModal] = useState(false)

  const nivel = Math.floor(xpTotal / 500) + 1
  const xpParaProximoNivel = 500 - (xpTotal % 500)
  const progressoNivel = (xpTotal % 500) / 500 * 100

  return (
    <>
      <section id="conquistas-section" className="bg-white rounded-3xl shadow-xl p-5" aria-label="Conquistas">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span aria-hidden="true">🏆</span> Minhas Conquistas
            </h3>
            <p className="text-sm text-gray-500">Nivel {nivel} • {xpTotal} XP total</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7C8B6F] text-white rounded-xl text-sm font-medium hover:bg-[#6B7A5D] transition-colors"
            aria-label={`Ver todas as conquistas. ${conquistasDesbloqueadas.length} desbloqueadas`}
          >
            <span>Ver todas</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{conquistasDesbloqueadas.length}</span>
          </button>
        </div>

        {/* Barra de progresso para proximo nivel */}
        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Proximo nivel</span>
            <span className="font-semibold text-amber-600">{xpParaProximoNivel} XP restantes</span>
          </div>
          <div className="h-3 bg-amber-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progressoNivel)} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso para proximo nivel">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all"
              style={{ width: `${progressoNivel}%` }}
            ></div>
          </div>
        </div>

        {/* Lista de conquistas (preview) */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {Object.entries(CONQUISTAS).slice(0, 8).map(([id, conquista]) => {
            const desbloqueada = conquistasDesbloqueadas.includes(id)
            return (
              <div
                key={id}
                className={`relative p-3 rounded-xl text-center transition-all ${
                  desbloqueada
                    ? 'bg-gradient-to-br from-yellow-100 to-amber-100 shadow-md'
                    : 'bg-gray-100 opacity-50'
                }`}
                title={conquista.nome}
              >
                <span className={`text-2xl ${desbloqueada ? '' : 'grayscale'}`} aria-hidden="true">
                  {conquista.icone}
                </span>
                <p className="text-xs mt-1 font-medium text-gray-700 truncate">{conquista.nome?.split(' ')[0]}</p>
                {desbloqueada && (
                  <span className="absolute -top-1 -right-1 text-xs" aria-hidden="true">✨</span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Modal de Conquistas Completo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-label="Todas as conquistas">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-bounceIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span aria-hidden="true">🏆</span> Todas as Conquistas
                </h3>
                <p className="text-sm text-gray-500">
                  {conquistasDesbloqueadas.length} de {Object.keys(CONQUISTAS).length} desbloqueadas
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                aria-label="Fechar modal"
              >
                ✕
              </button>
            </div>

            {/* Nivel e XP */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {nivel}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Nivel {nivel}</p>
                    <p className="text-sm text-gray-600">{xpTotal} XP total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600">{conquistasDesbloqueadas.length}</p>
                  <p className="text-xs text-gray-500">conquistas</p>
                </div>
              </div>
              <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all"
                  style={{ width: `${progressoNivel}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">{xpParaProximoNivel} XP para o proximo nivel</p>
            </div>

            {/* Lista completa */}
            <div className="space-y-3" role="list">
              {Object.entries(CONQUISTAS).map(([id, conquista]) => {
                const desbloqueada = conquistasDesbloqueadas.includes(id)
                return (
                  <div
                    key={id}
                    role="listitem"
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      desbloqueada
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
                        : 'bg-gray-50 border-2 border-dashed border-gray-200 opacity-60'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                      desbloqueada
                        ? `bg-gradient-to-br ${conquista.cor || 'from-yellow-400 to-amber-500'} shadow-md`
                        : 'bg-gray-200 grayscale'
                    }`} aria-hidden="true">
                      {conquista.icone}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-bold ${desbloqueada ? 'text-gray-800' : 'text-gray-400'}`}>
                          {conquista.nome}
                        </p>
                        {desbloqueada && <span className="text-yellow-500" aria-hidden="true">✨</span>}
                      </div>
                      <p className={`text-sm ${desbloqueada ? 'text-gray-600' : 'text-gray-400'}`}>
                        {conquista.descricao}
                      </p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                      desbloqueada
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      +{conquista.xp || conquista.pontos} XP
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 py-3 bg-[#7C8B6F] text-white rounded-xl font-semibold hover:bg-[#6B7A5D] transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
