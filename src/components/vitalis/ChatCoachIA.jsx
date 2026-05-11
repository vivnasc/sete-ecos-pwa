/**
 * ChatCoachIA — Chat conversacional com a coach IA.
 * Suporta tool use: registar_refeicao, registar_peso, registar_agua.
 *
 * Quando a IA emite um tool_use, o frontend executa a operação no
 * Supabase imediatamente (sem confirmação) e mostra uma confirmação
 * editorial discreta na conversa.
 */

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'
import VitalisHeader from './VitalisHeader'
import { Send, Loader2, Check, UtensilsCrossed, Scale, Droplet, Sparkles } from 'lucide-react'

const MENSAGEM_BOAS_VINDAS = {
  role: 'assistant',
  content: 'olá. estou aqui para te acompanhar — registar refeições, peso, água. ou só conversar. o que comeste hoje?'
}

export default function ChatCoachIA() {
  const [mensagens, setMensagens] = useState([MENSAGEM_BOAS_VINDAS])
  const [input, setInput] = useState('')
  const [aEnviar, setAEnviar] = useState(false)
  const [erro, setErro] = useState('')
  const [contexto, setContexto] = useState({})
  const scrollRef = useRef(null)

  useEffect(() => {
    carregarContexto()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensagens])

  async function carregarContexto() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: userData } = await supabase.from('users').select('id, nome').eq('auth_id', user.id).single()
      if (!userData) return

      const { data: client } = await supabase
        .from('vitalis_clients')
        .select('peso_actual, peso_meta, data_inicio')
        .eq('user_id', userData.id)
        .maybeSingle()

      const hoje = new Date().toISOString().split('T')[0]
      const { count: refeicoesHoje } = await supabase
        .from('vitalis_meal_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.id)
        .eq('data', hoje)

      setContexto({
        userId: userData.id,
        nome: (userData.nome || '').split(' ')[0],
        pesoActual: client?.peso_actual,
        pesoMeta: client?.peso_meta,
        diaJornada: client?.data_inicio
          ? Math.max(1, Math.floor((Date.now() - new Date(client.data_inicio).getTime()) / 86_400_000) + 1)
          : null,
        refeicoesHoje: refeicoesHoje || 0
      })
    } catch (e) {
      console.error('Erro a carregar contexto:', e)
    }
  }

  async function executarTool(tool) {
    if (!contexto.userId) return { ok: false, msg: 'não estás autenticada' }

    try {
      switch (tool.name) {
        case 'registar_refeicao': {
          const { descricao, tipo } = tool.input || {}
          if (!descricao) return { ok: false, msg: 'falta descrição' }

          // 1. Estimar macros chamando a própria API
          let macros = { proteina_g: 0, hidratos_g: 0, gordura_g: 0, kcal: 0, porcoes: { proteina: 0, hidratos: 0, gordura: 0 } }
          try {
            const r = await fetch('/api/ia', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ action: 'estimar-macros', descricao, tipo })
            })
            if (r.ok) macros = await r.json()
          } catch { /* fallback com zeros */ }

          // 2. Registar
          const payload = {
            user_id: contexto.userId,
            data: new Date().toISOString().split('T')[0],
            tipo: tipo || 'lanche',
            alimentos: descricao,
            descricao,
            porcoes_proteina: macros.porcoes?.proteina ?? 0,
            porcoes_hidratos: macros.porcoes?.hidratos ?? 0,
            porcoes_gordura: macros.porcoes?.gordura ?? 0,
            kcal: macros.kcal,
            created_at: new Date().toISOString()
          }
          const { error } = await supabase.from('vitalis_meal_log').insert([payload])
          if (error) {
            // fallback
            await supabase.from('vitalis_refeicoes_log').insert([payload])
          }
          return {
            ok: true,
            tipo: 'refeicao',
            resumo: `${descricao} · ${macros.kcal || '—'} kcal`
          }
        }

        case 'registar_peso': {
          const { peso_kg } = tool.input || {}
          if (!peso_kg || peso_kg < 20 || peso_kg > 300) return { ok: false, msg: 'peso fora do intervalo' }
          await supabase.from('vitalis_clients')
            .update({ peso_actual: peso_kg, ultimo_registo: new Date().toISOString() })
            .eq('user_id', contexto.userId)
          return { ok: true, tipo: 'peso', resumo: `${peso_kg} kg` }
        }

        case 'registar_agua': {
          const { ml } = tool.input || {}
          if (!ml || ml < 50 || ml > 5000) return { ok: false, msg: 'volume fora do intervalo' }
          await supabase.from('vitalis_agua_log').insert([{
            user_id: contexto.userId,
            data: new Date().toISOString().split('T')[0],
            ml,
            created_at: new Date().toISOString()
          }]).catch(() => { /* tabela pode não existir, ignorar */ })
          return { ok: true, tipo: 'agua', resumo: `${ml} ml` }
        }

        default:
          return { ok: false, msg: `tool desconhecida: ${tool.name}` }
      }
    } catch (e) {
      console.error('Erro a executar tool:', e)
      return { ok: false, msg: e.message }
    }
  }

  async function enviar() {
    const texto = input.trim()
    if (!texto || aEnviar) return

    const novaMensagemUser = { role: 'user', content: texto }
    const mensagensComUser = [...mensagens, novaMensagemUser]
    setMensagens(mensagensComUser)
    setInput('')
    setAEnviar(true)
    setErro('')

    try {
      const r = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'coach-chat',
          mensagens: mensagensComUser.map(m => ({ role: m.role, content: m.content })),
          contexto: {
            nome: contexto.nome,
            diaJornada: contexto.diaJornada,
            pesoActual: contexto.pesoActual,
            pesoMeta: contexto.pesoMeta,
            refeicoesHoje: contexto.refeicoesHoje
          }
        })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'falha')

      // Executar tools (se houver)
      const toolResults = []
      if (data.toolCalls && data.toolCalls.length > 0) {
        for (const tool of data.toolCalls) {
          const result = await executarTool(tool)
          toolResults.push({ tool, result })
        }
        // Refrescar contexto se houve registos
        carregarContexto()
      }

      // Mostrar mensagem do assistente + resumo dos tools
      const novaMensagemAssistant = {
        role: 'assistant',
        content: data.texto || '',
        toolResults: toolResults.length > 0 ? toolResults : undefined
      }
      setMensagens([...mensagensComUser, novaMensagemAssistant])
    } catch (e) {
      setErro(e.message || 'não consegui responder agora.')
      setMensagens([...mensagensComUser, {
        role: 'assistant',
        content: 'desculpa, não consegui responder agora. tenta de novo daqui a pouco.'
      }])
    } finally {
      setAEnviar(false)
    }
  }

  function iconeTool(tipo) {
    switch (tipo) {
      case 'refeicao': return UtensilsCrossed
      case 'peso': return Scale
      case 'agua': return Droplet
      default: return Check
    }
  }

  return (
    <div className="fnx-theme min-h-screen flex flex-col">
      <VitalisHeader
        title="fala com a coach"
        subtitle="conta-me o que comeste, o teu peso, ou o que precisares"
        backTo="/vitalis/dashboard"
      />

      <main className="fnx-container flex-1 flex flex-col pb-2" style={{ minHeight: 0 }}>
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto py-4 space-y-3"
          style={{ minHeight: 0 }}
        >
          {mensagens.map((m, i) => (
            <MensagemBubble key={i} mensagem={m} iconeTool={iconeTool} />
          ))}
          {aEnviar && (
            <div className="flex items-center gap-2 px-4 py-2">
              <Loader2 size={14} strokeWidth={1.4} className="animate-spin fnx-text-ouro" />
              <span className="fnx-text-soft italic" style={{
                fontFamily: 'var(--font-editorial)', fontWeight: 300, fontSize: '13px'
              }}>
                a coach está a escrever
              </span>
            </div>
          )}
          {erro && (
            <p className="italic px-4" style={{
              fontFamily: 'var(--font-editorial)', fontWeight: 300,
              fontSize: '12.5px', color: '#C9614E'
            }}>{erro}</p>
          )}
        </div>

        {/* Input bar */}
        <div
          className="sticky bottom-0 pt-3 pb-4"
          style={{ background: 'var(--fnx-bg)', boxShadow: 'inset 0 1px 0 var(--fnx-hair)' }}
        >
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  enviar()
                }
              }}
              placeholder="conta-me o que comeste, o teu peso, água, ou qualquer coisa"
              rows={1}
              className="fnx-input"
              style={{
                fontFamily: 'var(--font-corpo)',
                fontSize: '14px',
                resize: 'none',
                minHeight: '44px',
                maxHeight: '120px'
              }}
              disabled={aEnviar}
            />
            <button
              onClick={enviar}
              disabled={!input.trim() || aEnviar}
              className="fnx-btn-primary"
              style={{ padding: '0.625rem 1rem', minHeight: '44px' }}
              aria-label="enviar"
            >
              {aEnviar ? <Loader2 size={14} strokeWidth={1.4} className="animate-spin" /> : <Send size={14} strokeWidth={1.4} />}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

function MensagemBubble({ mensagem, iconeTool }) {
  const isUser = mensagem.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-2`}>
      <div
        className={isUser ? '' : 'fnx-card-solid'}
        style={{
          maxWidth: '85%',
          padding: isUser ? '10px 14px' : '14px 16px',
          borderRadius: 14,
          background: isUser ? 'var(--fnx-ink)' : undefined,
          color: isUser ? 'var(--fnx-bg)' : 'var(--fnx-ink)',
          fontFamily: isUser ? 'var(--font-corpo)' : 'var(--font-editorial)',
          fontSize: '14px',
          fontWeight: isUser ? 400 : 400,
          lineHeight: 1.55,
          letterSpacing: '-0.005em'
        }}
      >
        <p style={{ whiteSpace: 'pre-wrap' }}>{mensagem.content}</p>

        {/* Tool results */}
        {mensagem.toolResults && mensagem.toolResults.length > 0 && (
          <div className="mt-2 pt-2 space-y-1.5" style={{ borderTop: '1px solid var(--fnx-hair)' }}>
            {mensagem.toolResults.map((tr, idx) => {
              const Icon = iconeTool(tr.result.tipo)
              return (
                <div key={idx} className="flex items-center gap-1.5">
                  {tr.result.ok ? (
                    <>
                      <Icon size={12} strokeWidth={1.4} className="fnx-text-ouro" />
                      <span className="fnx-label-cap">{tr.result.tipo} registado</span>
                      {tr.result.resumo && (
                        <span className="fnx-text-faint" style={{ fontSize: '11.5px', marginLeft: 4 }}>
                          · {tr.result.resumo}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="fnx-text-faint italic" style={{ fontSize: '11px' }}>
                      tool falhou: {tr.result.msg}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
