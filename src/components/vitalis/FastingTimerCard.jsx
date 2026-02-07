/**
 * FastingTimerCard — Timer de jejum intermitente
 * Extraído do DashboardVitalis para melhor manutenção.
 */
export default function FastingTimerCard({
  jejumActual,
  jejumActivo,
  protocoloJejum,
  horasJejum,
  janelaInicio,
  onStartFasting,
  onEndFasting,
}) {
  if (!jejumActivo && !jejumActual) return null

  const calcularTempo = () => {
    if (!jejumActual) return { display: '--:--', progressPercent: 0 }
    const inicio = new Date(jejumActual.hora_inicio)
    const agora = new Date()
    const diffMin = Math.floor((agora - inicio) / (1000 * 60))
    const horas = Math.floor(diffMin / 60)
    const mins = diffMin % 60
    return {
      display: `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
      progressPercent: Math.min((diffMin / (horasJejum * 60)) * 100, 100),
    }
  }

  const { display, progressPercent } = calcularTempo()

  return (
    <section
      className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-4 text-white shadow-xl"
      aria-label="Timer de jejum intermitente"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">⏱️</span>
          <span className="font-semibold">Jejum {protocoloJejum}</span>
        </div>
        <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
          {jejumActual ? 'A decorrer' : 'Parado'}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl md:text-4xl font-bold" aria-live="polite">{display}</p>
          <p className="text-purple-200 text-sm">de {horasJejum} horas</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-purple-200">Janela alimentar as</p>
          <p className="text-xl font-semibold">{janelaInicio}</p>
        </div>
      </div>

      <div
        className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso do jejum"
      >
        <div
          className="h-full bg-white rounded-full transition-all"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="flex gap-2 mt-3">
        {!jejumActual ? (
          <button
            onClick={onStartFasting}
            className="flex-1 px-4 py-2 bg-white text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors"
          >
            Iniciar Jejum
          </button>
        ) : (
          <>
            <button className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors">
              Pausar
            </button>
            <button
              onClick={onEndFasting}
              className="flex-1 px-4 py-2 bg-white text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors"
            >
              Terminar Jejum
            </button>
          </>
        )}
      </div>
    </section>
  )
}
