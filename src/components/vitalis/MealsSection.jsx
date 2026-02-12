import { Link } from 'react-router-dom'

/**
 * MealsSection — Lista de refeições do dia com status
 * Extraído do DashboardVitalis para melhor manutenção.
 */
export default function MealsSection({ refeicoes, mealsHoje }) {
  return (
    <section className="bg-white rounded-3xl shadow-xl p-5 flex-grow" aria-label="Refeicoes de hoje">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-[#6B5C4C] uppercase tracking-wider">Refeicoes Hoje</h3>
        <Link to="/vitalis/refeicoes-config" className="text-xs text-[#7C8B6F] hover:text-[#6B7A5D] font-medium">
          Configurar →
        </Link>
      </div>

      {refeicoes.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm mb-3">Ainda não configuraste as tuas refeições</p>
          <Link
            to="/vitalis/refeicoes-config"
            className="inline-block px-4 py-2 bg-[#7C8B6F] text-white rounded-lg text-sm font-medium hover:bg-[#6B7A5D] transition-colors"
          >
            Configurar Agora
          </Link>
        </div>
      ) : (
        <div className="space-y-2" role="list">
          {refeicoes.map((ref) => {
            const meal = mealsHoje.find(m => m.refeicao === ref.nome)
            const status = meal?.seguiu_plano

            return (
              <div
                key={ref.id}
                role="listitem"
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  status === 'sim' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                  status === 'parcial' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' :
                  status === 'nao' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' :
                  'bg-gray-50 border-2 border-dashed border-gray-200'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm shadow-md ${
                  status === 'sim' ? 'bg-green-500' :
                  status === 'parcial' ? 'bg-yellow-500' :
                  status === 'nao' ? 'bg-red-500' :
                  'bg-gray-200 text-gray-400'
                }`} aria-hidden="true">
                  {status === 'sim' ? '✓' : status === 'parcial' ? '~' : status === 'nao' ? '✕' : '○'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${status ? 'text-gray-800' : 'text-gray-400'}`}>{ref.nome}</p>
                  <p className="text-xs text-gray-500">
                    {meal ? `${meal.hora || ref.hora_habitual || '--:--'} • ${status === 'sim' ? 'Seguiu o plano' : status === 'parcial' ? 'Parcialmente' : 'Nao seguiu'}` : `~${ref.hora_habitual || '--:--'}`}
                  </p>
                </div>
                {status ? (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    status === 'sim' ? 'bg-green-100 text-green-700' :
                    status === 'parcial' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {status === 'sim' ? '100%' : status === 'parcial' ? '70%' : '0%'}
                  </span>
                ) : (
                  <Link
                    to="/vitalis/meals"
                    className="px-3 py-1.5 bg-[#7C8B6F] text-white text-xs rounded-full font-medium hover:bg-[#6B7A5D] transition-colors shadow-md"
                  >
                    Registar
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
