/**
 * MacrosDisplay — Gráficos circulares de macros + calorias
 * Extraído do DashboardVitalis para melhor manutenção.
 */
export default function MacrosDisplay({ mealsHoje, macrosAlvo, caloriasAlvo }) {
  const macrosConsumidos = mealsHoje.reduce((acc, meal) => ({
    proteina: acc.proteina + (parseFloat(meal.porcoes_proteina) || 0),
    hidratos: acc.hidratos + (parseFloat(meal.porcoes_hidratos) || 0),
    gordura: acc.gordura + (parseFloat(meal.porcoes_gordura) || 0)
  }), { proteina: 0, hidratos: 0, gordura: 0 })

  const caloriasConsumidas = Math.round(
    (macrosConsumidos.proteina * 20 * 4) +
    (macrosConsumidos.hidratos * 30 * 4) +
    (macrosConsumidos.gordura * 7 * 9)
  )
  const progressoCalorias = (caloriasConsumidas / caloriasAlvo) * 100

  const macros = [
    { key: 'proteina', label: 'Proteina', icon: '🥩', consumed: macrosConsumidos.proteina, target: macrosAlvo.proteina, bgColor: '#fee2e2', fillColor: '#ef4444' },
    { key: 'hidratos', label: 'Hidratos', icon: '🍚', consumed: macrosConsumidos.hidratos, target: macrosAlvo.hidratos, bgColor: '#fef3c7', fillColor: '#f59e0b' },
    { key: 'gordura', label: 'Gordura', icon: '🥑', consumed: macrosConsumidos.gordura, target: macrosAlvo.gordura, bgColor: '#d1fae5', fillColor: '#10b981' },
  ]

  return (
    <section className="bg-white rounded-3xl shadow-xl p-5" aria-label="Macronutrientes de hoje">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Macros de Hoje</h3>
        <p className="text-xs text-gray-500">Baseado nas refeicoes registadas</p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 items-center">
        {macros.map(({ key, label, icon, consumed, target, bgColor, fillColor }) => {
          const progress = Math.min(consumed / target, 1)
          const dashoffset = 94 - (94 * progress)
          return (
            <div key={key} className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2" role="img" aria-label={`${label}: ${consumed.toFixed(1)} de ${target} porcoes`}>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                  <circle cx="18" cy="18" r="15" fill="none" stroke={bgColor} strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15" fill="none" stroke={fillColor} strokeWidth="3"
                          strokeDasharray="94" strokeDashoffset={dashoffset} strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg" aria-hidden="true">{icon}</span>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-800">{consumed.toFixed(1)} / {target}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          )
        })}

        <div className="col-span-3">
          <div className="bg-gradient-to-r from-[#E8E4DC] via-[#F5F2ED] to-[#FAF7F2] rounded-2xl p-4 border border-[#E8E2D9]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">🌿</span>
                <span className="text-sm font-medium text-[#4A4035]">Calorias</span>
              </div>
              <span className="text-xs text-[#6B5C4C]">Meta: {caloriasAlvo} kcal</span>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-[#4A4035]">{caloriasConsumidas}</span>
              <span className="text-[#6B5C4C] mb-1">/ {caloriasAlvo} kcal</span>
            </div>
            <div
              className="h-3 bg-white rounded-full overflow-hidden shadow-inner"
              role="progressbar"
              aria-valuenow={Math.round(progressoCalorias)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progresso de calorias"
            >
              <div
                className="h-full bg-gradient-to-r from-[#9CAF88] via-[#7C8B6F] to-[#6B7A5D] rounded-full transition-all"
                style={{ width: `${Math.min(progressoCalorias, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-[#6B5C4C] mt-2 text-center">
              Restam {Math.max(caloriasAlvo - caloriasConsumidas, 0)} kcal para hoje
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
