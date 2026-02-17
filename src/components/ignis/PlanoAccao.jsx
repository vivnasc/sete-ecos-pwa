import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

/**
 * PLANO DE ACCAO — Objectivos verificados contra a Bussola de Valores
 * Criar planos com passos, acompanhar progresso, review semanal
 * Cada plano criado = 10 Chamas
 */

const IGNIS_COLOR = '#C1634A'
const IGNIS_DARK = '#2e1a14'

export default function PlanoAccao() {
  const { user } = useAuth()
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [planos, setPlanos] = useState([])
  const [valores, setValores] = useState([])
  const [showNovoPlano, setShowNovoPlano] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  // Formulario novo plano
  const [novoObjectivo, setNovoObjectivo] = useState('')
  const [novoValor, setNovoValor] = useState('')
  const [novoPrazo, setNovoPrazo] = useState('')
  const [novosPassos, setNovosPassos] = useState(['', '', ''])

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (!userData) return
      setUserId(userData.id)

      // Buscar valores definidos
      const { data: valoresData } = await supabase
        .from('ignis_valores')
        .select('id, valor')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: true })

      setValores(valoresData || [])

      // Buscar planos activos e concluidos
      const { data: planosData } = await supabase
        .from('ignis_plano_accao')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setPlanos(planosData || [])
    } catch (error) {
      console.error('PlanoAccao loadData:', error)
    } finally {
      setLoading(false)
    }
  }

  const adicionarPasso = () => {
    setNovosPassos(prev => [...prev, ''])
  }

  const removerPasso = (index) => {
    if (novosPassos.length <= 1) return
    setNovosPassos(prev => prev.filter((_, i) => i !== index))
  }

  const actualizarPasso = (index, valor) => {
    setNovosPassos(prev => prev.map((p, i) => i === index ? valor : p))
  }

  const criarPlano = async () => {
    if (!userId || !novoObjectivo.trim() || !novoPrazo) return
    setSalvando(true)

    const passosValidos = novosPassos
      .filter(p => p.trim())
      .map((texto, i) => ({ id: i + 1, texto, concluido: false }))

    if (passosValidos.length === 0) {
      setSalvando(false)
      return
    }

    try {
      const { error } = await supabase
        .from('ignis_plano_accao')
        .insert({
          user_id: userId,
          objectivo: novoObjectivo.trim(),
          valor_alinhado: novoValor || null,
          passos: passosValidos,
          prazo: novoPrazo,
          progresso: 0,
          estado: 'activo'
        })

      if (error) throw error

      // Adicionar 10 chamas
      const { data: clientData } = await supabase
        .from('ignis_clients')
        .select('chamas_total')
        .eq('user_id', userId)
        .maybeSingle()

      if (clientData) {
        await supabase
          .from('ignis_clients')
          .update({ chamas_total: (clientData.chamas_total || 0) + 10 })
          .eq('user_id', userId)
      }

      setMensagemSucesso(`+10 Chamas! Plano ${g('criado', 'criada')} com sucesso.`)
      setShowNovoPlano(false)
      setNovoObjectivo('')
      setNovoValor('')
      setNovoPrazo('')
      setNovosPassos(['', '', ''])

      await loadData()
      setTimeout(() => setMensagemSucesso(''), 3000)
    } catch (error) {
      console.error('PlanoAccao criarPlano:', error)
    } finally {
      setSalvando(false)
    }
  }

  const togglePasso = async (planoId, passoId) => {
    const plano = planos.find(p => p.id === planoId)
    if (!plano || plano.estado === 'concluido') return

    const passosActualizados = plano.passos.map(p =>
      p.id === passoId ? { ...p, concluido: !p.concluido } : p
    )

    const totalPassos = passosActualizados.length
    const passosConcluidos = passosActualizados.filter(p => p.concluido).length
    const novoProgresso = Math.round((passosConcluidos / totalPassos) * 100)
    const novoEstado = novoProgresso === 100 ? 'concluido' : 'activo'

    try {
      await supabase
        .from('ignis_plano_accao')
        .update({
          passos: passosActualizados,
          progresso: novoProgresso,
          estado: novoEstado
        })
        .eq('id', planoId)

      setPlanos(prev => prev.map(p =>
        p.id === planoId
          ? { ...p, passos: passosActualizados, progresso: novoProgresso, estado: novoEstado }
          : p
      ))
    } catch (error) {
      console.error('PlanoAccao togglePasso:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: IGNIS_DARK }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse" aria-hidden="true">🔥</div>
          <p className="text-white/60 text-sm">A carregar planos...</p>
        </div>
      </div>
    )
  }

  const planosActivos = planos.filter(p => p.estado === 'activo')
  const planosConcluidos = planos.filter(p => p.estado === 'concluido')

  return (
    <div className="min-h-screen pb-24" style={{ background: IGNIS_DARK }}>
      <ModuleHeader eco="ignis" title="Plano de Accao" compact />

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Mensagem de sucesso */}
        {mensagemSucesso && (
          <div
            className="rounded-xl p-4 text-center animate-pulse"
            style={{ background: `${IGNIS_COLOR}30`, border: `1px solid ${IGNIS_COLOR}50` }}
          >
            <span className="text-2xl block mb-1">🔥</span>
            <p className="text-white font-semibold text-sm">{mensagemSucesso}</p>
          </div>
        )}

        {/* Botao novo plano */}
        {!showNovoPlano && (
          <button
            onClick={() => setShowNovoPlano(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed text-sm font-medium transition-all hover:opacity-80"
            style={{ borderColor: `${IGNIS_COLOR}40`, color: IGNIS_COLOR }}
          >
            + Novo Objectivo
          </button>
        )}

        {/* Formulario novo plano */}
        {showNovoPlano && (
          <div
            className="rounded-2xl border p-5 space-y-4"
            style={{ background: `${IGNIS_COLOR}10`, borderColor: `${IGNIS_COLOR}30` }}
          >
            <h3
              className="text-white text-lg font-bold"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Novo Objectivo
            </h3>

            {/* Objectivo */}
            <div>
              <label className="block text-white/50 text-xs mb-1">Objectivo</label>
              <input
                type="text"
                value={novoObjectivo}
                onChange={(e) => setNovoObjectivo(e.target.value)}
                placeholder="O que queres alcançar?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                aria-label="Objectivo do plano"
              />
            </div>

            {/* Valor alinhado */}
            <div>
              <label className="block text-white/50 text-xs mb-1">Valor alinhado (opcional)</label>
              {valores.length > 0 ? (
                <select
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                  aria-label="Valor alinhado com o objectivo"
                >
                  <option value="">Selecciona um valor</option>
                  {valores.map(v => (
                    <option key={v.id} value={v.valor}>{v.valor}</option>
                  ))}
                </select>
              ) : (
                <p className="text-white/30 text-xs italic">
                  Define os teus valores na Bussola primeiro.
                </p>
              )}
            </div>

            {/* Prazo */}
            <div>
              <label className="block text-white/50 text-xs mb-1">Prazo</label>
              <input
                type="date"
                value={novoPrazo}
                onChange={(e) => setNovoPrazo(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                aria-label="Prazo do objectivo"
              />
            </div>

            {/* Passos */}
            <div>
              <label className="block text-white/50 text-xs mb-2">Passos</label>
              <div className="space-y-2">
                {novosPassos.map((passo, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-white/30 text-xs w-5 text-center">{i + 1}.</span>
                    <input
                      type="text"
                      value={passo}
                      onChange={(e) => actualizarPasso(i, e.target.value)}
                      placeholder={`Passo ${i + 1}`}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                      aria-label={`Passo ${i + 1}`}
                    />
                    {novosPassos.length > 1 && (
                      <button
                        onClick={() => removerPasso(i)}
                        className="text-white/20 hover:text-white/50 text-sm transition-colors"
                        aria-label={`Remover passo ${i + 1}`}
                      >
                        &#10005;
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={adicionarPasso}
                className="mt-2 text-xs transition-colors"
                style={{ color: `${IGNIS_COLOR}aa` }}
              >
                + Adicionar passo
              </button>
            </div>

            {/* Accoes */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowNovoPlano(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 text-white/50 text-sm font-medium transition-colors hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={criarPlano}
                disabled={!novoObjectivo.trim() || !novoPrazo || salvando}
                className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-40"
                style={{ background: IGNIS_COLOR }}
              >
                {salvando ? 'A criar...' : 'Criar Plano (+10 Chamas)'}
              </button>
            </div>
          </div>
        )}

        {/* Review semanal prompt */}
        {planosActivos.length > 0 && new Date().getDay() === 0 && (
          <div
            className="rounded-2xl border p-4"
            style={{ background: `${IGNIS_COLOR}08`, borderColor: `${IGNIS_COLOR}15` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">📋</span>
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Review Semanal</p>
                <p className="text-white/50 text-xs leading-relaxed">
                  Domingo e dia de rever os teus planos. Os passos que definiste ainda fazem sentido?
                  Algum precisa de ajuste? Revisa com honestidade.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Planos activos */}
        {planosActivos.length > 0 && (
          <div>
            <h3
              className="text-white text-lg font-bold mb-3"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Planos Activos
            </h3>

            <div className="space-y-4">
              {planosActivos.map((plano) => {
                const diasRestantes = plano.prazo
                  ? Math.ceil((new Date(plano.prazo) - new Date()) / (24 * 60 * 60 * 1000))
                  : null

                return (
                  <div
                    key={plano.id}
                    className="rounded-2xl border bg-white/5 border-white/10 p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-sm">{plano.objectivo}</h4>
                        {plano.valor_alinhado && (
                          <span
                            className="inline-block mt-1 px-2 py-0.5 rounded text-xs"
                            style={{ background: `${IGNIS_COLOR}20`, color: IGNIS_COLOR }}
                          >
                            🧭 {plano.valor_alinhado}
                          </span>
                        )}
                      </div>
                      {diasRestantes !== null && (
                        <span className={`text-xs ${diasRestantes <= 3 ? 'text-red-400' : 'text-white/30'}`}>
                          {diasRestantes > 0 ? `${diasRestantes}d` : 'Vencido'}
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-white/40 mb-1">
                        <span>Progresso</span>
                        <span>{plano.progresso || 0}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${plano.progresso || 0}%`,
                            background: `linear-gradient(90deg, ${IGNIS_COLOR}, ${IGNIS_COLOR}cc)`
                          }}
                        />
                      </div>
                    </div>

                    {/* Passos */}
                    <div className="space-y-2">
                      {(plano.passos || []).map((passo) => (
                        <button
                          key={passo.id}
                          onClick={() => togglePasso(plano.id, passo.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                            passo.concluido
                              ? 'bg-white/3'
                              : 'bg-white/5 hover:bg-white/8'
                          }`}
                          aria-label={`${passo.concluido ? 'Desmarcar' : 'Marcar'} passo: ${passo.texto}`}
                        >
                          <span className="text-sm flex-shrink-0">
                            {passo.concluido ? '✅' : '⬜'}
                          </span>
                          <span className={`text-sm flex-1 ${
                            passo.concluido ? 'text-white/40 line-through' : 'text-white/70'
                          }`}>
                            {passo.texto}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Planos concluidos */}
        {planosConcluidos.length > 0 && (
          <div>
            <h3
              className="text-white/50 text-sm font-medium mb-3"
            >
              {g('Concluidos', 'Concluidas')} ({planosConcluidos.length})
            </h3>

            <div className="space-y-3">
              {planosConcluidos.map((plano) => (
                <div
                  key={plano.id}
                  className="rounded-xl border bg-white/3 border-white/5 p-4 opacity-60"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-sm">&#10003;</span>
                    <h4 className="text-white text-sm">{plano.objectivo}</h4>
                  </div>
                  {plano.valor_alinhado && (
                    <span className="text-white/30 text-xs mt-1 block">
                      🧭 {plano.valor_alinhado}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {planos.length === 0 && !showNovoPlano && (
          <div className="text-center py-12">
            <span className="text-5xl block mb-4">🎯</span>
            <h3
              className="text-white text-lg font-bold mb-2"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Sem planos ainda
            </h3>
            <p className="text-white/50 text-sm mb-6">
              Cria o teu primeiro plano de accao alinhado com os teus valores.
            </p>
            <button
              onClick={() => setShowNovoPlano(true)}
              className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: IGNIS_COLOR }}
            >
              Criar Primeiro Plano
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
