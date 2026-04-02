import { useState } from 'react'

const TIPOS_TREINO = [
  { id: 'musculacao', emoji: '🏋️', label: 'Musculação', tips: ['Aquece 5-10 min antes', 'Foca na técnica antes de aumentar peso', 'Descansa 60-90s entre séries', 'Proteína até 1h após treino'] },
  { id: 'corrida', emoji: '🏃', label: 'Corrida', tips: ['Começa devagar, aumenta ritmo gradualmente', 'Hidrata antes e durante', 'Alonga bem no final', 'Alterna dias de corrida com descanso'] },
  { id: 'caminhada', emoji: '🚶', label: 'Caminhada', tips: ['Mantém postura erecta', 'Passos firmes e regulares', 'Tenta 30 min mínimo', 'Boa opção para dias de descanso activo'] },
  { id: 'yoga', emoji: '🧘', label: 'Yoga', tips: ['Respira profundamente em cada postura', 'Não forces — respeita o teu corpo', 'Foco na respiração, não na perfeição', 'Ideal para dias de recuperação'] },
  { id: 'natacao', emoji: '🏊', label: 'Natação', tips: ['Aquece articulações antes', 'Alterna estilos para trabalhar todo o corpo', 'Hidrata mesmo na água', 'Excelente para articulações'] },
  { id: 'danca', emoji: '💃', label: 'Dança', tips: ['Não precisa ser perfeito — diverte-te!', 'Boa alternativa a cardio tradicional', 'Melhora coordenação e humor', 'Queima muitas calorias sem perceber'] },
  { id: 'ciclismo', emoji: '🚴', label: 'Ciclismo', tips: ['Ajusta o selim à tua altura', 'Começa em terreno plano', 'Alterna intensidades', 'Protege os joelhos — não forces demais'] },
  { id: 'outro', emoji: '⚡', label: 'Outro', tips: ['Qualquer movimento conta', 'Consistência supera intensidade', 'Ouve o teu corpo', 'Celebra cada sessão feita'] },
]

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
  dataTracking,
  onChangeDate,
}) {
  const [mostrarSonoForm, setMostrarSonoForm] = useState(false)
  const [sonoHoras, setSonoHoras] = useState('')
  const [sonoMinutos, setSonoMinutos] = useState('')
  const [sonoQualidade, setSonoQualidade] = useState(0)
  const [mostrarTreinoForm, setMostrarTreinoForm] = useState(false)
  const [treinoTipo, setTreinoTipo] = useState(null)
  const [treinoDuracao, setTreinoDuracao] = useState('')
  const [salvandoTreino, setSalvandoTreino] = useState(false)

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

  const handleLogWorkout = async () => {
    if (!treinoTipo) return
    setSalvandoTreino(true)
    try {
      await onLogWorkout(treinoTipo, parseInt(treinoDuracao) || null)
      setMostrarTreinoForm(false)
      setTreinoTipo(null)
      setTreinoDuracao('')
    } finally {
      setSalvandoTreino(false)
    }
  }

  const tipoInfo = treinoTipo ? TIPOS_TREINO.find(t => t.id === treinoTipo) : null
  const treinoTipoInfo = treinoHoje?.tipo ? TIPOS_TREINO.find(t => t.id === treinoHoje.tipo) : null

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Track</h3>

      {/* Seletor de data — permite registar dias passados */}
      {onChangeDate && (
        <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg">
          <button
            onClick={() => {
              const d = new Date(dataTracking);
              d.setDate(d.getDate() - 1);
              onChangeDate(d.toISOString().split('T')[0]);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
            aria-label="Dia anterior"
          >
            ←
          </button>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dataTracking}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => onChangeDate(e.target.value)}
              className="text-sm font-medium text-gray-700 bg-transparent border-none text-center cursor-pointer focus:outline-none"
            />
            {dataTracking !== new Date().toISOString().split('T')[0] && (
              <button
                onClick={() => onChangeDate(new Date().toISOString().split('T')[0])}
                className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium hover:bg-emerald-200"
              >
                Hoje
              </button>
            )}
          </div>
          <button
            onClick={() => {
              const d = new Date(dataTracking);
              d.setDate(d.getDate() + 1);
              const hojeStr = new Date().toISOString().split('T')[0];
              if (d.toISOString().split('T')[0] <= hojeStr) {
                onChangeDate(d.toISOString().split('T')[0]);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
            aria-label="Dia seguinte"
          >
            →
          </button>
        </div>
      )}

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
      <div className="p-3 bg-emerald-50 rounded-xl mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">{treinoTipoInfo?.emoji || '🏃‍♀️'}</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                {treinoHoje
                  ? (treinoTipoInfo?.label || 'Treino')
                  : (ehDiaTreino ? 'Dia de Treino' : 'Dia de Descanso')}
              </p>
              <p className="text-xs text-gray-500">
                {treinoHoje
                  ? `${treinoHoje.duracao_min ? `${treinoHoje.duracao_min} min — ` : ''}${treinoHoje.hora || treinoHoje.created_at?.substring(11, 16) || '—'}`
                  : (ehDiaTreino ? 'Por registar' : 'Recupera bem!')}
              </p>
            </div>
          </div>
          {!treinoHoje && (
            <button
              onClick={() => setMostrarTreinoForm(!mostrarTreinoForm)}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors shadow-md ${
                mostrarTreinoForm
                  ? 'bg-gray-200 text-gray-600'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
              aria-expanded={mostrarTreinoForm}
              aria-label="Registar treino"
            >
              {mostrarTreinoForm ? 'Fechar' : '+ Registar'}
            </button>
          )}
          {treinoHoje && (
            <span className="text-emerald-500 text-xl" aria-label="Treino concluido">✓</span>
          )}
        </div>

        {/* Formulário de registo de treino */}
        {mostrarTreinoForm && !treinoHoje && (
          <div className="mt-3 pt-3 border-t border-emerald-100 space-y-3">
            {/* Tipo de treino */}
            <div>
              <p className="text-xs text-gray-500 mb-2">O que fizeste?</p>
              <div className="grid grid-cols-4 gap-1.5">
                {TIPOS_TREINO.map(({ id, emoji, label }) => (
                  <button
                    key={id}
                    onClick={() => setTreinoTipo(id)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all text-center ${
                      treinoTipo === id
                        ? 'bg-emerald-100 ring-2 ring-emerald-400 scale-105'
                        : 'bg-white hover:bg-emerald-50'
                    }`}
                    aria-pressed={treinoTipo === id}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="text-[10px] text-gray-600 leading-tight mt-0.5">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duração */}
            {treinoTipo && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Quanto tempo? (minutos)</p>
                <div className="flex gap-2">
                  {[15, 30, 45, 60].map(min => (
                    <button
                      key={min}
                      onClick={() => setTreinoDuracao(String(min))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        treinoDuracao === String(min)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-emerald-50'
                      }`}
                    >
                      {min}m
                    </button>
                  ))}
                  <input
                    type="number"
                    min="5"
                    max="180"
                    placeholder="Outro"
                    value={![15, 30, 45, 60].includes(parseInt(treinoDuracao)) ? treinoDuracao : ''}
                    onChange={(e) => setTreinoDuracao(e.target.value)}
                    className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-center text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Tips para o tipo escolhido */}
            {tipoInfo && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-emerald-700 mb-1.5">{tipoInfo.emoji} Dicas para {tipoInfo.label}</p>
                <ul className="space-y-1">
                  {tipoInfo.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botão guardar */}
            {treinoTipo && (
              <button
                onClick={handleLogWorkout}
                disabled={salvandoTreino}
                className="w-full py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 active:scale-95"
              >
                {salvandoTreino ? 'A guardar...' : `✓ Registar ${tipoInfo?.label || 'Treino'}`}
              </button>
            )}
          </div>
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
