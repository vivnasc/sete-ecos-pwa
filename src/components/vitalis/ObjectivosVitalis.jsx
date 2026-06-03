/**
 * ObjectivosVitalis — página de objectivos pessoais customizáveis.
 * CRUD completo: criar / editar / pausar / concluir / apagar.
 *
 * Schema: supabase/vitalis_objectivos.sql
 */

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import VitalisHeader from './VitalisHeader'
import {
  Target, Plus, Check, X, Scale, Ruler, Droplet, Dumbbell, Clock,
  Wine, Edit2, Trash2, Pause, Play, Loader2
} from 'lucide-react'

const TIPOS = {
  peso: { label: 'peso', icon: Scale, unidade: 'kg', placeholder: 'ex: 70', descPlaceholder: 'chegar aos 70kg sem dietas restritas' },
  cintura: { label: 'cintura', icon: Ruler, unidade: 'cm', placeholder: 'ex: 72', descPlaceholder: 'reduzir 5cm de cintura' },
  sono: { label: 'sono', icon: Clock, unidade: 'h/noite', placeholder: 'ex: 7.5', descPlaceholder: 'dormir 7.5h em média' },
  proteina: { label: 'proteína', icon: Dumbbell, unidade: 'g/dia', placeholder: 'ex: 110', descPlaceholder: 'atingir 110g de proteína por dia' },
  agua: { label: 'água', icon: Droplet, unidade: 'L/dia', placeholder: 'ex: 2.5', descPlaceholder: 'beber 2.5L de água por dia' },
  treinos_semana: { label: 'treinos/semana', icon: Dumbbell, unidade: 'treinos', placeholder: 'ex: 4', descPlaceholder: 'treinar 4 vezes por semana' },
  jejum_dias: { label: 'jejum cumprido', icon: Clock, unidade: 'dias/semana', placeholder: 'ex: 5', descPlaceholder: 'cumprir janela alimentar 5 dias por semana' },
  alcool: { label: 'álcool', icon: Wine, unidade: 'copos/semana', placeholder: 'ex: 2', descPlaceholder: 'manter abaixo de 2 copos por semana' },
  custom: { label: 'outro', icon: Target, unidade: '', placeholder: '', descPlaceholder: 'o teu objectivo em palavras' }
}

export default function ObjectivosVitalis() {
  const [userId, setUserId] = useState(null)
  const [objectivos, setObjectivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(null) // null | 'novo' | id existente
  const [tabelaEmFalta, setTabelaEmFalta] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: userData } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
      if (!userData) return
      setUserId(userData.id)

      const { data, error } = await supabase
        .from('vitalis_objectivos')
        .select('*')
        .eq('user_id', userData.id)
        .order('status', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) {
        // Tabela não existe ainda
        if (error.code === '42P01' || /does not exist|relation/i.test(error.message)) {
          setTabelaEmFalta(true)
        } else {
          console.error('Erro a carregar objectivos:', error)
        }
      } else {
        setObjectivos(data || [])
      }
    } finally {
      setLoading(false)
    }
  }

  async function salvar(obj) {
    if (!userId) return
    const payload = { ...obj, user_id: userId }
    if (obj.id) {
      // Update
      const { error } = await supabase
        .from('vitalis_objectivos')
        .update({
          titulo: obj.titulo, descricao: obj.descricao,
          tipo: obj.tipo, unidade: obj.unidade,
          valor_inicial: obj.valor_inicial, valor_actual: obj.valor_actual, valor_alvo: obj.valor_alvo,
          prazo_dias: obj.prazo_dias, status: obj.status
        })
        .eq('id', obj.id)
      if (error) console.error(error)
    } else {
      // Insert
      delete payload.id
      const { error } = await supabase.from('vitalis_objectivos').insert([payload])
      if (error) console.error(error)
    }
    setEditando(null)
    carregar()
  }

  async function apagar(id) {
    if (!confirm('apagar este objectivo?')) return
    await supabase.from('vitalis_objectivos').delete().eq('id', id)
    carregar()
  }

  async function alterarStatus(id, novoStatus) {
    await supabase.from('vitalis_objectivos').update({
      status: novoStatus,
      data_conclusao: novoStatus === 'concluido' ? new Date().toISOString() : null
    }).eq('id', id)
    carregar()
  }

  const activos = objectivos.filter(o => o.status === 'activo')
  const pausados = objectivos.filter(o => o.status === 'pausado')
  const concluidos = objectivos.filter(o => o.status === 'concluido')

  return (
    <div className="fnx-theme min-h-screen pb-24 fnx-fade-in">
      <VitalisHeader
        title="os meus objectivos"
        subtitle="define o teu foco · acompanha progresso"
        backTo="/vitalis/dashboard"
      />

      <main className="fnx-container py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={16} strokeWidth={1.4} className="animate-spin fnx-text-ouro" />
          </div>
        ) : tabelaEmFalta ? (
          <section className="fnx-card-feature">
            <span className="fnx-label-cap">configuração pendente</span>
            <h2 className="fnx-text-ink mt-1" style={{
              fontFamily: 'var(--font-editorial)', fontSize: '20px',
              fontWeight: 400, letterSpacing: '-0.015em'
            }}>
              tabela ainda não criada
            </h2>
            <p className="fnx-text-soft italic mt-2" style={{
              fontFamily: 'var(--font-editorial)', fontWeight: 300,
              fontSize: '14px', lineHeight: 1.55
            }}>
              corre o ficheiro <code style={{
                fontFamily: 'monospace', fontSize: '12.5px',
                background: 'var(--fnx-bg-elev)', padding: '2px 6px', borderRadius: 4
              }}>supabase/vitalis_objectivos.sql</code> no editor SQL do Supabase para activar esta página.
            </p>
          </section>
        ) : (
          <>
            {/* Activos */}
            <section>
              <div className="flex items-center justify-between px-1 mb-3">
                <span className="fnx-label-cap">activos · {activos.length}</span>
                <button
                  onClick={() => setEditando('novo')}
                  className="fnx-btn-ouro"
                  style={{ padding: '0.4rem 0.875rem', fontSize: '12px' }}
                >
                  <Plus size={13} strokeWidth={1.4} />
                  <span>novo</span>
                </button>
              </div>
              {activos.length === 0 ? (
                <EmptyState onCriar={() => setEditando('novo')} />
              ) : (
                <div className="space-y-3">
                  {activos.map(o => (
                    <ObjectivoCard
                      key={o.id} objectivo={o}
                      onEditar={() => setEditando(o.id)}
                      onPausar={() => alterarStatus(o.id, 'pausado')}
                      onConcluir={() => alterarStatus(o.id, 'concluido')}
                      onApagar={() => apagar(o.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {pausados.length > 0 && (
              <section>
                <span className="fnx-label-soft px-1 mb-3 block">pausados · {pausados.length}</span>
                <div className="space-y-3">
                  {pausados.map(o => (
                    <ObjectivoCard
                      key={o.id} objectivo={o}
                      onEditar={() => setEditando(o.id)}
                      onRetomar={() => alterarStatus(o.id, 'activo')}
                      onApagar={() => apagar(o.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {concluidos.length > 0 && (
              <section>
                <span className="fnx-label-soft px-1 mb-3 block">concluídos · {concluidos.length}</span>
                <div className="space-y-3">
                  {concluidos.map(o => (
                    <ObjectivoCard
                      key={o.id} objectivo={o} concluido
                      onApagar={() => apagar(o.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Modal de edição/criação */}
      {editando && (
        <EditorModal
          objectivo={editando === 'novo' ? null : objectivos.find(o => o.id === editando)}
          onSalvar={salvar}
          onFechar={() => setEditando(null)}
        />
      )}
    </div>
  )
}

function EmptyState({ onCriar }) {
  return (
    <div className="fnx-card-solid text-center py-8">
      <Target size={20} strokeWidth={1.4} className="fnx-text-ouro mx-auto mb-3" />
      <p className="fnx-text-soft italic mb-4" style={{
        fontFamily: 'var(--font-editorial)', fontWeight: 300,
        fontSize: '14px', lineHeight: 1.55
      }}>
        ainda sem objectivos. define o teu foco para esta fase.
      </p>
      <button onClick={onCriar} className="fnx-btn-primary" style={{ padding: '0.5rem 1rem' }}>
        <Plus size={14} strokeWidth={1.4} />
        <span>criar primeiro</span>
      </button>
    </div>
  )
}

function ObjectivoCard({ objectivo, concluido, onEditar, onPausar, onRetomar, onConcluir, onApagar }) {
  const tipoConfig = TIPOS[objectivo.tipo] || TIPOS.custom
  const Icon = tipoConfig.icon

  const inicial = parseFloat(objectivo.valor_inicial)
  const actual = parseFloat(objectivo.valor_actual)
  const alvo = parseFloat(objectivo.valor_alvo)
  let progresso = 0
  if (!isNaN(inicial) && !isNaN(actual) && !isNaN(alvo) && inicial !== alvo) {
    progresso = Math.min(100, Math.max(0, ((actual - inicial) / (alvo - inicial)) * 100))
  } else if (!isNaN(actual) && !isNaN(alvo) && alvo > 0) {
    progresso = Math.min(100, (actual / alvo) * 100)
  }

  return (
    <article className="fnx-card-solid" style={{ opacity: concluido ? 0.7 : 1 }}>
      <div className="flex items-start gap-3">
        <Icon size={16} strokeWidth={1.4} className="fnx-text-ouro shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="fnx-text-ink truncate" style={{
              fontFamily: 'var(--font-editorial)', fontSize: '16px',
              fontWeight: 400, letterSpacing: '-0.015em'
            }}>
              {objectivo.titulo}
            </h3>
            {concluido && (
              <span className="fnx-text-ouro" style={{ fontSize: '11px' }}>
                <Check size={12} strokeWidth={1.6} className="inline" /> concluído
              </span>
            )}
          </div>

          {objectivo.descricao && (
            <p className="fnx-text-soft italic mt-1" style={{
              fontFamily: 'var(--font-editorial)', fontWeight: 300,
              fontSize: '12.5px', lineHeight: 1.5
            }}>
              {objectivo.descricao}
            </p>
          )}

          {!isNaN(alvo) && (
            <>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="fnx-editorial-num fnx-tnum" style={{ fontSize: '22px', lineHeight: 1 }}>
                  {!isNaN(actual) ? actual : '—'}
                </span>
                <span className="fnx-text-faint" style={{ fontSize: '12px' }}>
                  / {alvo} {objectivo.unidade || tipoConfig.unidade}
                </span>
              </div>
              <div className="mt-2 h-px w-full overflow-hidden" style={{ background: 'var(--fnx-hair)' }}>
                <div
                  className="h-px"
                  style={{
                    width: `${progresso}%`,
                    background: 'var(--fnx-ouro)',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </>
          )}

          {/* Acções */}
          <div className="flex items-center gap-2 mt-3">
            {onEditar && (
              <button onClick={onEditar} className="fnx-text-soft fnx-transition hover:opacity-70"
                style={{ fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                aria-label="editar">
                <Edit2 size={11} strokeWidth={1.4} /> editar
              </button>
            )}
            {onPausar && (
              <button onClick={onPausar} className="fnx-text-soft fnx-transition hover:opacity-70"
                style={{ fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Pause size={11} strokeWidth={1.4} /> pausar
              </button>
            )}
            {onRetomar && (
              <button onClick={onRetomar} className="fnx-text-ouro fnx-transition hover:opacity-80"
                style={{ fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Play size={11} strokeWidth={1.4} /> retomar
              </button>
            )}
            {onConcluir && (
              <button onClick={onConcluir} className="fnx-text-ouro fnx-transition hover:opacity-80"
                style={{ fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Check size={11} strokeWidth={1.4} /> concluído
              </button>
            )}
            {onApagar && (
              <button onClick={onApagar} className="fnx-text-faint fnx-transition hover:opacity-70 ml-auto"
                style={{ fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Trash2 size={11} strokeWidth={1.4} /> apagar
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function EditorModal({ objectivo, onSalvar, onFechar }) {
  const [tipo, setTipo] = useState(objectivo?.tipo || 'peso')
  const [titulo, setTitulo] = useState(objectivo?.titulo || '')
  const [descricao, setDescricao] = useState(objectivo?.descricao || '')
  const [valorInicial, setValorInicial] = useState(objectivo?.valor_inicial?.toString() || '')
  const [valorActual, setValorActual] = useState(objectivo?.valor_actual?.toString() || '')
  const [valorAlvo, setValorAlvo] = useState(objectivo?.valor_alvo?.toString() || '')
  const [prazoDias, setPrazoDias] = useState(objectivo?.prazo_dias?.toString() || '')
  const [unidadeCustom, setUnidadeCustom] = useState(objectivo?.unidade || '')
  const [aSalvar, setASalvar] = useState(false)

  const tipoConfig = TIPOS[tipo] || TIPOS.custom

  // Auto-sugerir título quando muda o tipo (na criação)
  useEffect(() => {
    if (!objectivo && !titulo && tipoConfig.descPlaceholder) {
      // Não preencher automaticamente — deixar placeholder
    }
  }, [tipo, objectivo, titulo, tipoConfig])

  async function submit(e) {
    e.preventDefault()
    if (!titulo.trim() || !valorAlvo) return
    setASalvar(true)
    await onSalvar({
      id: objectivo?.id,
      tipo,
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      valor_inicial: valorInicial ? parseFloat(valorInicial) : null,
      valor_actual: valorActual ? parseFloat(valorActual) : null,
      valor_alvo: parseFloat(valorAlvo),
      unidade: tipo === 'custom' ? (unidadeCustom || null) : tipoConfig.unidade,
      prazo_dias: prazoDias ? parseInt(prazoDias) : null,
      status: objectivo?.status || 'activo'
    })
    setASalvar(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center fnx-fade-in"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onFechar() }}
    >
      <form
        onSubmit={submit}
        className="fnx-card-feature w-full sm:max-w-md"
        style={{
          maxHeight: '85vh',
          overflowY: 'auto',
          borderRadius: '12px 12px 0 0'
        }}
      >
        <div className="flex items-baseline justify-between mb-4">
          <span className="fnx-label-cap">{objectivo ? 'editar objectivo' : 'novo objectivo'}</span>
          <button type="button" onClick={onFechar} className="fnx-text-faint hover:opacity-70" aria-label="fechar">
            <X size={16} strokeWidth={1.4} />
          </button>
        </div>

        {/* Tipo */}
        <label className="fnx-label-soft block mb-1">tipo</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}
          className="fnx-input mb-3" style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}>
          {Object.entries(TIPOS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {/* Título */}
        <label className="fnx-label-soft block mb-1">título</label>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
          placeholder={tipoConfig.descPlaceholder} maxLength={80} required
          className="fnx-input mb-3" style={{ fontSize: '14px' }} />

        {/* Descrição */}
        <label className="fnx-label-soft block mb-1">descrição (opcional)</label>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)}
          placeholder="porque é importante para ti..." rows={2} maxLength={280}
          className="fnx-input mb-3" style={{ fontSize: '13.5px', resize: 'vertical' }} />

        {/* Unidade (apenas custom) */}
        {tipo === 'custom' && (
          <>
            <label className="fnx-label-soft block mb-1">unidade</label>
            <input value={unidadeCustom} onChange={(e) => setUnidadeCustom(e.target.value)}
              placeholder="ex: passos, horas, sessões" maxLength={20}
              className="fnx-input mb-3" style={{ fontSize: '13.5px' }} />
          </>
        )}

        {/* Valores */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <label className="fnx-label-soft block mb-1">inicial</label>
            <input type="number" step="0.1" value={valorInicial}
              onChange={(e) => setValorInicial(e.target.value)}
              placeholder={tipoConfig.placeholder}
              className="fnx-input" style={{ padding: '0.5rem 0.75rem', fontSize: '13.5px' }} />
          </div>
          <div>
            <label className="fnx-label-soft block mb-1">actual</label>
            <input type="number" step="0.1" value={valorActual}
              onChange={(e) => setValorActual(e.target.value)}
              placeholder={tipoConfig.placeholder}
              className="fnx-input" style={{ padding: '0.5rem 0.75rem', fontSize: '13.5px' }} />
          </div>
          <div>
            <label className="fnx-label-soft block mb-1">alvo</label>
            <input type="number" step="0.1" value={valorAlvo}
              onChange={(e) => setValorAlvo(e.target.value)}
              placeholder={tipoConfig.placeholder} required
              className="fnx-input" style={{ padding: '0.5rem 0.75rem', fontSize: '13.5px' }} />
          </div>
        </div>

        {/* Prazo */}
        <label className="fnx-label-soft block mb-1">prazo (dias, opcional)</label>
        <input type="number" min="1" value={prazoDias} onChange={(e) => setPrazoDias(e.target.value)}
          placeholder="ex: 90"
          className="fnx-input mb-5" style={{ padding: '0.5rem 0.75rem', fontSize: '13.5px' }} />

        <div className="flex gap-2">
          <button type="button" onClick={onFechar} className="fnx-btn-ghost flex-1">
            cancelar
          </button>
          <button type="submit" disabled={aSalvar || !titulo.trim() || !valorAlvo}
            className="fnx-btn-primary flex-1">
            {aSalvar ? <Loader2 size={14} strokeWidth={1.4} className="animate-spin" /> : <Check size={14} strokeWidth={1.4} />}
            <span>{objectivo ? 'guardar' : 'criar'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
