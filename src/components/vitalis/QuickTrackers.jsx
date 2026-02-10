import { useState } from 'react'

/**
 * QuickTrackers — Painel de tracking rápido (água, treino, sono, humor)
 * Extraído do DashboardVitalis para melhor manutenção.
 */
export default function QuickTrackers({
  aguaHoje,
  metaAgua,
  treinoHoje,
  ehDiaTreino,
  sonoHoje,
  humor,
  onAddWater,
  onLogWorkout,
  onLogSleep,
  onMoodSelect,
}) {
  const [mostrarSonoForm, setMostrarSonoForm] = useState(false)
  const [sonoHoras, setSonoHoras] = useState('')
  const [sonoMinutos, setSonoMinutos] = useState('')
  const [sonoQualidade, setSonoQualidade] = useState(0)

  const progressoAgua = (aguaHoje / metaAgua) * 100

  const handleLogSleep = async () => {
    const duracaoMin = (parseInt(sonoHoras) || 0) * 60 + (parseInt(sonoMinutos) || 0)
    if (duracaoMin === 0) {
      alert('Preenche as horas de sono')
      return
    }
    await onLogSleep(parseInt(sonoHoras) || 0, parseInt(sonoMinutos) || 0, sonoQualidade)
    setMostrarSonoForm(false)
    setSonoHoras('')
    setSonoMinutos('')
    setSonoQualidade(0)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Track</h3>

      {/* Agua */}
      <div className="p-3 bg-sky-50 rounded-xl mb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">💧</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{aguaHoje.toFixed(1)} / {metaAgua}L</p>
              <p className="text-xs text-gray-500">Agua</p>
            </div>
          </div>
        </div>

        <div className="h-2 bg-sky-100 rounded-full mb-3 overflow-hidden" role="progressbar" aria-valuenow={Math.round(progressoAgua)} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso de agua">
          <div
            className="h-full bg-sky-500 rounded-full transition-all"
            style={{ width: `${Math.min(progressoAgua, 100)}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { ml: 150, icon: '☕', label: '150ml' },
            { ml: 250, icon: '🥤', label: '250ml' },
            { ml: 330, icon: '🧃', label: '330ml' },
            { ml: 500, icon: '🍶', label: '500ml' },
          ].map(({ ml, icon, label }) => (
            <button
              key={ml}
              onClick={() => onAddWater(ml)}
              className="flex flex-col items-center p-2 bg-white hover:bg-sky-100 rounded-lg transition-colors shadow-sm"
              aria-label={`Adicionar ${label} de agua`}
            >
              <span className="text-lg" aria-hidden="true">{icon}</span>
              <span className="text-xs text-gray-600">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Treino */}
      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">🏃‍♀️</span>
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {ehDiaTreino ? 'Dia de Treino' : 'Dia de Descanso'}
            </p>
            <p className="text-xs text-gray-500">
              {treinoHoje ? `Feito as ${treinoHoje.hora || treinoHoje.created_at?.substring(11, 16) || '—'}` : (ehDiaTreino ? 'Por fazer' : 'Recupera bem!')}
            </p>
          </div>
        </div>
        {ehDiaTreino && !treinoHoje && (
          <button
            onClick={onLogWorkout}
            className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-full font-medium hover:bg-emerald-600 transition-colors shadow-md"
            aria-label="Marcar treino como feito"
          >
            ✓ Feito
          </button>
        )}
        {treinoHoje && (
          <span className="text-emerald-500 text-xl" aria-label="Treino concluido">✓</span>
        )}
      </div>

      {/* Sono */}
      <div className="p-3 bg-indigo-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">😴</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                {sonoHoje ? `${Math.floor(sonoHoje.duracao_min / 60)}h ${sonoHoje.duracao_min % 60}m` : 'Sono esta noite'}
              </p>
              <p className="text-xs text-gray-500">
                {sonoHoje ? `Qualidade: ${sonoHoje.qualidade_1a5}/5 ★` : 'Por registar'}
              </p>
            </div>
          </div>
          {sonoHoje ? (
            <div className="flex items-center gap-0.5" aria-label={`Qualidade ${sonoHoje.qualidade_1a5} de 5`}>
              {[1,2,3,4,5].map(i => (
                <span key={i} className={i <= sonoHoje.qualidade_1a5 ? 'text-yellow-500' : 'text-gray-300'} aria-hidden="true">★</span>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setMostrarSonoForm(!mostrarSonoForm)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              aria-expanded={mostrarSonoForm}
            >
              {mostrarSonoForm ? 'Fechar' : 'Registar →'}
            </button>
          )}
        </div>

        {mostrarSonoForm && !sonoHoje && (
          <div className="mt-3 pt-3 border-t border-indigo-100 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label htmlFor="sono-horas" className="block text-xs text-gray-500 mb-1">Horas</label>
                <input
                  id="sono-horas"
                  type="number"
                  min="0"
                  max="12"
                  value={sonoHoras}
                  onChange={(e) => setSonoHoras(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-center text-lg font-bold focus:border-indigo-500 focus:outline-none"
                  placeholder="7"
                />
              </div>
              <span className="text-xl text-gray-400 mt-5" aria-hidden="true">:</span>
              <div className="flex-1">
                <label htmlFor="sono-minutos" className="block text-xs text-gray-500 mb-1">Min</label>
                <input
                  id="sono-minutos"
                  type="number"
                  min="0"
                  max="59"
                  step="15"
                  value={sonoMinutos}
                  onChange={(e) => setSonoMinutos(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-center text-lg font-bold focus:border-indigo-500 focus:outline-none"
                  placeholder="30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Qualidade</label>
              <div className="flex justify-between gap-1" role="radiogroup" aria-label="Qualidade do sono">
                {[1, 2, 3, 4, 5].map((valor) => (
                  <button
                    key={valor}
                    onClick={() => setSonoQualidade(valor)}
                    className={`flex-1 py-2 rounded-lg text-lg transition-all ${
                      sonoQualidade >= valor
                        ? 'bg-yellow-100 scale-105'
                        : 'bg-gray-100 opacity-50'
                    }`}
                    role="radio"
                    aria-checked={sonoQualidade >= valor}
                    aria-label={`${valor} estrelas`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleLogSleep}
              className="w-full py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors"
            >
              ✓ Guardar Sono
            </button>
          </div>
        )}
      </div>

      {/* Humor */}
      <div className="mt-2 p-3 bg-amber-50 rounded-xl">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Como te sentes?</p>
        <div className="grid grid-cols-5 gap-1" role="radiogroup" aria-label="Selecionar humor">
          {[
            { emoji: '😫', valor: 1, label: 'Muito mal' },
            { emoji: '😕', valor: 2, label: 'Mal' },
            { emoji: '😐', valor: 3, label: 'Normal' },
            { emoji: '😊', valor: 4, label: 'Bem' },
            { emoji: '🤩', valor: 5, label: 'Excelente' }
          ].map(({ emoji, valor, label }) => (
            <button
              key={valor}
              onClick={() => onMoodSelect(valor)}
              className={`p-2 rounded-lg transition-all text-xl ${
                humor === valor
                  ? 'bg-green-100 ring-2 ring-green-400'
                  : 'hover:bg-gray-100 opacity-50 hover:opacity-100'
              }`}
              role="radio"
              aria-checked={humor === valor}
              aria-label={label}
            >
              {emoji}
            </button>
          ))}
        </div>
        {humor && (
          <p className="text-xs text-center text-gray-500 mt-2">Energia: {humor * 2}/10</p>
        )}
      </div>
    </div>
  )
}
