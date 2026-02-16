import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { DESAFIOS_FOGO, CATEGORIAS_DESAFIOS } from '../../lib/ignis/gamificacao'
import { g } from '../../utils/genero'

/**
 * DESAFIOS DE FOGO — Desafios semanais de transformacao
 * 4 categorias: Coragem, Corte, Alinhamento, Iniciativa Propria
 * Cada desafio completado = 12 Chamas
 */

const IGNIS_COLOR = '#C1634A'
const IGNIS_DARK = '#2e1a14'

export default function DesafiosFogo() {
  const { user } = useAuth()
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState('coragem')
  const [desafioActivo, setDesafioActivo] = useState(null)
  const [reflexao, setReflexao] = useState('')
  const [completando, setCompletando] = useState(false)
  const [historico, setHistorico] = useState([])
  const [showHistorico, setShowHistorico] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState('')

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

      // Buscar desafio activo (aceite mas nao completado)
      const { data: activo } = await supabase
        .from('ignis_desafios_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('completou', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (activo) {
        setDesafioActivo(activo)
      }

      // Buscar historico de desafios completados
      const { data: hist } = await supabase
        .from('ignis_desafios_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('completou', true)
        .order('created_at', { ascending: false })
        .limit(20)

      setHistorico(hist || [])
    } catch (error) {
      console.error('DesafiosFogo loadData:', error)
    } finally {
      setLoading(false)
    }
  }

  const aceitarDesafio = async (desafio) => {
    if (!userId || desafioActivo) return

    try {
      const { data, error } = await supabase
        .from('ignis_desafios_log')
        .insert({
          user_id: userId,
          data: new Date().toISOString().split('T')[0],
          desafio_id: desafio.id,
          categoria: desafio.categoria,
          completou: false,
          reflexao: null
        })
        .select()
        .maybeSingle()

      if (!error && data) {
        setDesafioActivo(data)
      }
    } catch (error) {
      console.error('DesafiosFogo aceitarDesafio:', error)
    }
  }

  const completarDesafio = async () => {
    if (!userId || !desafioActivo || !reflexao.trim()) return
    setCompletando(true)

    try {
      // Marcar como completado
      const { error } = await supabase
        .from('ignis_desafios_log')
        .update({
          completou: true,
          reflexao: reflexao.trim()
        })
        .eq('id', desafioActivo.id)

      if (error) throw error

      // Adicionar 12 chamas
      const { data: clientData } = await supabase
        .from('ignis_clients')
        .select('chamas_total')
        .eq('user_id', userId)
        .maybeSingle()

      if (clientData) {
        await supabase
          .from('ignis_clients')
          .update({ chamas_total: (clientData.chamas_total || 0) + 12 })
          .eq('user_id', userId)
      }

      setMensagemSucesso(`+12 Chamas! Desafio ${g('completado', 'completada')} com sucesso.`)
      setDesafioActivo(null)
      setReflexao('')

      // Atualizar historico
      await loadData()

      setTimeout(() => setMensagemSucesso(''), 3000)
    } catch (error) {
      console.error('DesafiosFogo completarDesafio:', error)
    } finally {
      setCompletando(false)
    }
  }

  const cancelarDesafio = async () => {
    if (!desafioActivo) return

    try {
      await supabase
        .from('ignis_desafios_log')
        .delete()
        .eq('id', desafioActivo.id)

      setDesafioActivo(null)
      setReflexao('')
    } catch (error) {
      console.error('DesafiosFogo cancelarDesafio:', error)
    }
  }

  // Desafios da categoria activa
  const desafiosCategoria = DESAFIOS_FOGO.filter(d => d.categoria === categoriaActiva)

  // Verificar se desafio ja foi completado
  const isDesafioCompletado = (desafioId) => {
    return historico.some(h => h.desafio_id === desafioId)
  }

  // Info do desafio activo (se existir)
  const desafioActivoInfo = desafioActivo
    ? DESAFIOS_FOGO.find(d => d.id === desafioActivo.desafio_id)
    : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: IGNIS_DARK }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse" aria-hidden="true">🔥</div>
          <p className="text-white/60 text-sm">A carregar desafios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: IGNIS_DARK }}>
      <ModuleHeader eco="ignis" title="Desafios de Fogo" compact />

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

        {/* Desafio activo */}
        {desafioActivo && desafioActivoInfo && (
          <div
            className="rounded-2xl border p-5"
            style={{ background: `${IGNIS_COLOR}15`, borderColor: `${IGNIS_COLOR}40` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: IGNIS_COLOR }}>
                Desafio Activo
              </span>
              <button
                onClick={cancelarDesafio}
                className="text-white/30 text-xs hover:text-white/60 transition-colors"
              >
                Cancelar
              </button>
            </div>

            <h3
              className="text-white text-lg font-bold mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {desafioActivoInfo.nome}
            </h3>
            <p className="text-white/60 text-sm mb-4">{desafioActivoInfo.descricao}</p>

            {/* Reflexao */}
            <div className="space-y-3">
              <label className="block text-white/50 text-xs">
                Reflexao (obrigatoria para completar):
              </label>
              <textarea
                value={reflexao}
                onChange={(e) => setReflexao(e.target.value)}
                placeholder="O que sentiste? O que descobriste sobre ti?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 resize-none focus:outline-none focus:border-white/20 transition-colors"
                rows={3}
                aria-label="Reflexao sobre o desafio"
              />
              <button
                onClick={completarDesafio}
                disabled={!reflexao.trim() || completando}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-40"
                style={{ background: IGNIS_COLOR }}
              >
                {completando ? 'A completar...' : `Completar Desafio (+12 Chamas)`}
              </button>
            </div>
          </div>
        )}

        {/* Tabs de categorias */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIAS_DESAFIOS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                categoriaActiva === cat.id
                  ? 'text-white'
                  : 'bg-white/5 text-white/50 border border-white/10'
              }`}
              style={categoriaActiva === cat.id ? {
                background: cat.cor,
                boxShadow: `0 4px 12px ${cat.cor}40`
              } : {}}
            >
              <span>{cat.icon}</span>
              <span>{cat.nome}</span>
            </button>
          ))}
        </div>

        {/* Descricao da categoria */}
        {CATEGORIAS_DESAFIOS.filter(c => c.id === categoriaActiva).map(cat => (
          <p key={cat.id} className="text-white/40 text-sm italic">
            {cat.descricao}
          </p>
        ))}

        {/* Lista de desafios */}
        <div className="space-y-3">
          {desafiosCategoria.map((desafio) => {
            const completado = isDesafioCompletado(desafio.id)
            const isActivo = desafioActivo?.desafio_id === desafio.id

            return (
              <div
                key={desafio.id}
                className={`rounded-xl border p-4 transition-all ${
                  completado
                    ? 'bg-white/3 border-white/5 opacity-60'
                    : isActivo
                      ? 'border-opacity-100'
                      : 'bg-white/5 border-white/10 hover:bg-white/8'
                }`}
                style={isActivo ? { borderColor: IGNIS_COLOR, background: `${IGNIS_COLOR}10` } : {}}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {completado && <span className="text-green-400 text-sm">&#10003;</span>}
                      <h4 className="text-white text-sm font-semibold">{desafio.nome}</h4>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed">{desafio.descricao}</p>
                    <span className="inline-block mt-2 text-white/30 text-xs">
                      Duracao: {desafio.duracao}
                    </span>
                  </div>

                  {!completado && !desafioActivo && (
                    <button
                      onClick={() => aceitarDesafio(desafio)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                      style={{ background: IGNIS_COLOR }}
                    >
                      Aceitar
                    </button>
                  )}

                  {completado && (
                    <span className="flex-shrink-0 text-xs text-green-400/60">
                      {g('Completado', 'Completada')}
                    </span>
                  )}

                  {isActivo && (
                    <span
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: `${IGNIS_COLOR}30`, color: IGNIS_COLOR }}
                    >
                      {g('Activo', 'Activa')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Toggle historico */}
        {historico.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistorico(!showHistorico)}
              className="w-full text-center text-sm py-2 transition-colors"
              style={{ color: `${IGNIS_COLOR}aa` }}
            >
              {showHistorico ? 'Esconder historico' : `Ver historico (${historico.length} ${g('completados', 'completadas')})`}
            </button>

            {showHistorico && (
              <div className="mt-3 space-y-3">
                {historico.map((item) => {
                  const desafioInfo = DESAFIOS_FOGO.find(d => d.id === item.desafio_id)
                  return (
                    <div
                      key={item.id}
                      className="bg-white/5 rounded-xl border border-white/10 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white text-sm font-medium">
                          {desafioInfo?.nome || item.desafio_id}
                        </h4>
                        <span className="text-white/30 text-xs">
                          {new Date(item.data || item.created_at).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs mb-2"
                        style={{ background: `${IGNIS_COLOR}20`, color: IGNIS_COLOR }}
                      >
                        {item.categoria}
                      </span>
                      {item.reflexao && (
                        <p className="text-white/50 text-xs italic mt-2 leading-relaxed">
                          "{item.reflexao}"
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
