import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import { EMOCOES } from '../../lib/serena/gamificacao'
import ModuleHeader from '../shared/ModuleHeader'

/**
 * SERENA — Detector de Padrões
 * Após 2 semanas de uso, detecta padrões como:
 * "Aos domingos à noite, a ansiedade sobe 60%"
 * "Raiva aparece sempre depois de reuniões"
 * "Tristeza aumenta nos dias sem exercício"
 */

const SERENA_COLOR = '#6B8E9B'
const SERENA_DARK = '#1a2e3a'

const DIAS_SEMANA_NOMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const PERIODOS = {
  manha: { label: 'Manhã', horas: [6, 12], icon: '🌅' },
  tarde: { label: 'Tarde', horas: [12, 18], icon: '☀️' },
  noite: { label: 'Noite', horas: [18, 24], icon: '🌙' },
  madrugada: { label: 'Madrugada', horas: [0, 6], icon: '🌑' }
}

function getPeriodo(horaStr) {
  const hora = new Date(horaStr).getHours()
  if (hora >= 6 && hora < 12) return 'manha'
  if (hora >= 12 && hora < 18) return 'tarde'
  if (hora >= 18) return 'noite'
  return 'madrugada'
}

export default function DetectorPadroes() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [registos, setRegistos] = useState([])
  const [diasDeUso, setDiasDeUso] = useState(0)

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (!userData) return
      setUserId(userData.id)

      // Buscar todos os registos
      const { data } = await supabase
        .from('serena_emocoes_log')
        .select('data, emocao, intensidade, trigger, corpo_zona, created_at')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: true })

      setRegistos(data || [])

      // Calcular dias de uso
      if (data && data.length > 0) {
        const diasUnicos = new Set(data.map(r => r.data))
        setDiasDeUso(diasUnicos.size)
      }
    } catch (error) {
      console.error('DetectorPadroes: Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Detectar padroes
  const padroes = useMemo(() => {
    if (registos.length < 5) return []

    const resultados = []

    // 1. Padrão por dia da semana
    const porDiaSemana = {}
    registos.forEach(r => {
      const dia = new Date(r.data + 'T12:00:00').getDay()
      if (!porDiaSemana[dia]) porDiaSemana[dia] = []
      porDiaSemana[dia].push(r)
    })

    Object.entries(porDiaSemana).forEach(([dia, regs]) => {
      if (regs.length < 2) return

      // Contar emocoes neste dia
      const contagem = {}
      regs.forEach(r => {
        contagem[r.emocao] = (contagem[r.emocao] || 0) + 1
      })

      // Emocao dominante neste dia
      const sorted = Object.entries(contagem).sort((a, b) => b[1] - a[1])
      const [topEmocao, topCount] = sorted[0]
      const percent = Math.round((topCount / regs.length) * 100)

      if (percent >= 50 && topCount >= 2) {
        const emocaoInfo = EMOCOES.find(e => e.value === topEmocao)
        if (emocaoInfo) {
          resultados.push({
            tipo: 'dia_semana',
            icon: emocaoInfo.icon,
            cor: emocaoInfo.cor,
            titulo: `${emocaoInfo.label} domina as ${DIAS_SEMANA_NOMES[dia]}s`,
            descricao: `${percent}% dos registos de ${DIAS_SEMANA_NOMES[dia]} são de ${emocaoInfo.label.toLowerCase()}.`,
            forca: percent,
            dica: getDicaPorEmocao(topEmocao, DIAS_SEMANA_NOMES[dia])
          })
        }
      }
    })

    // 2. Padrão por período do dia
    const porPeriodo = {}
    registos.forEach(r => {
      const periodo = getPeriodo(r.created_at)
      if (!porPeriodo[periodo]) porPeriodo[periodo] = []
      porPeriodo[periodo].push(r)
    })

    Object.entries(porPeriodo).forEach(([periodo, regs]) => {
      if (regs.length < 3) return

      const contagem = {}
      regs.forEach(r => {
        contagem[r.emocao] = (contagem[r.emocao] || 0) + 1
      })

      const sorted = Object.entries(contagem).sort((a, b) => b[1] - a[1])
      const [topEmocao, topCount] = sorted[0]
      const percent = Math.round((topCount / regs.length) * 100)

      if (percent >= 40 && topCount >= 3) {
        const emocaoInfo = EMOCOES.find(e => e.value === topEmocao)
        const periodoInfo = PERIODOS[periodo]
        if (emocaoInfo && periodoInfo) {
          resultados.push({
            tipo: 'periodo',
            icon: periodoInfo.icon,
            cor: emocaoInfo.cor,
            titulo: `${emocaoInfo.label} aparece mais de ${periodoInfo.label.toLowerCase()}`,
            descricao: `${percent}% dos registos da ${periodoInfo.label.toLowerCase()} são de ${emocaoInfo.label.toLowerCase()}.`,
            forca: percent,
            dica: getDicaPorPeriodo(topEmocao, periodo)
          })
        }
      }
    })

    // 3. Padrão de intensidade
    const intensidadeMedia = registos.reduce((acc, r) => acc + (r.intensidade || 5), 0) / registos.length

    // Emocoes com alta intensidade
    const emocoesAltas = {}
    registos.filter(r => (r.intensidade || 5) >= 7).forEach(r => {
      emocoesAltas[r.emocao] = (emocoesAltas[r.emocao] || 0) + 1
    })

    Object.entries(emocoesAltas).forEach(([emocao, count]) => {
      if (count >= 3) {
        const emocaoInfo = EMOCOES.find(e => e.value === emocao)
        if (emocaoInfo) {
          resultados.push({
            tipo: 'intensidade',
            icon: '📈',
            cor: emocaoInfo.cor,
            titulo: `${emocaoInfo.label} tende a ser intensa`,
            descricao: `${count} vezes a ${emocaoInfo.label.toLowerCase()} apareceu com intensidade 7 ou mais.`,
            forca: Math.min(100, count * 15),
            dica: `Quando a ${emocaoInfo.label.toLowerCase()} vem forte, lembra-te: é uma onda. Vai passar.`
          })
        }
      }
    })

    // 4. Padrão de zonas do corpo
    const porZona = {}
    registos.filter(r => r.corpo_zona && r.corpo_zona !== 'nenhum').forEach(r => {
      if (!porZona[r.corpo_zona]) porZona[r.corpo_zona] = {}
      porZona[r.corpo_zona][r.emocao] = (porZona[r.corpo_zona][r.emocao] || 0) + 1
    })

    Object.entries(porZona).forEach(([zona, emocoes]) => {
      const sorted = Object.entries(emocoes).sort((a, b) => b[1] - a[1])
      if (sorted.length > 0 && sorted[0][1] >= 3) {
        const [topEmocao, topCount] = sorted[0]
        const emocaoInfo = EMOCOES.find(e => e.value === topEmocao)
        if (emocaoInfo) {
          resultados.push({
            tipo: 'corpo',
            icon: '🧍',
            cor: emocaoInfo.cor,
            titulo: `${emocaoInfo.label} manifesta-se no ${zona.replace('_', ' ')}`,
            descricao: `Quando sentes ${emocaoInfo.label.toLowerCase()}, o teu corpo responde na zona do ${zona.replace('_', ' ')}.`,
            forca: Math.min(100, topCount * 20),
            dica: `Dá atenção ao teu ${zona.replace('_', ' ')}. Respira para essa zona quando a ${emocaoInfo.label.toLowerCase()} aparecer.`
          })
        }
      }
    })

    // 5. Triggers recorrentes
    const triggers = {}
    registos.filter(r => r.trigger && r.trigger.trim()).forEach(r => {
      const triggerNorm = r.trigger.toLowerCase().trim()
      if (!triggers[triggerNorm]) triggers[triggerNorm] = { emocoes: {}, count: 0 }
      triggers[triggerNorm].count++
      triggers[triggerNorm].emocoes[r.emocao] = (triggers[triggerNorm].emocoes[r.emocao] || 0) + 1
    })

    Object.entries(triggers).forEach(([trigger, info]) => {
      if (info.count >= 3) {
        const topEmocao = Object.entries(info.emocoes).sort((a, b) => b[1] - a[1])[0]
        if (topEmocao) {
          const emocaoInfo = EMOCOES.find(e => e.value === topEmocao[0])
          if (emocaoInfo) {
            resultados.push({
              tipo: 'trigger',
              icon: '🎯',
              cor: emocaoInfo.cor,
              titulo: `"${trigger}" liga a ${emocaoInfo.label.toLowerCase()}`,
              descricao: `O trigger "${trigger}" já apareceu ${info.count} vezes, associado a ${emocaoInfo.label.toLowerCase()}.`,
              forca: Math.min(100, info.count * 20),
              dica: `Quando "${trigger}" acontecer, já sabes: ${emocaoInfo.label.toLowerCase()} pode vir. Prepara-te com uma respiração antes.`
            })
          }
        }
      }
    })

    // Ordenar por forca
    return resultados.sort((a, b) => b.forca - a.forca)
  }, [registos])

  // Dicas contextuais
  function getDicaPorEmocao(emocao, dia) {
    const dicas = {
      ansiedade: `As ${dia}s podem ser um gatilho. Considera uma respiração preventiva nesse dia.`,
      tristeza: `A tristeza tem um padrão. Nos dias de ${dia}, planeia algo que te nutre.`,
      raiva: `A raiva pede expressão. Nas ${dia}s, reserva tempo para soltar — escreve, move-te.`,
      cansaco: `${dia}s parecem drenar-te. Avalia se podes descansar mais nesse dia.`,
      medo: `O medo surge mais nas ${dia}s. Reconhece-o: "Estou com medo, e isso é normal."`,
      calma: `Ótimo! ${dia}s tendem a ser dias de calma. Aproveita para reflexão.`,
      alegria: `${dia}s trazem-te alegria! Nota o que fazes nesse dia — repete.`
    }
    return dicas[emocao] || `Presta atenção ao que acontece nas ${dia}s.`
  }

  function getDicaPorPeriodo(emocao, periodo) {
    const dicas = {
      manha: `A ${EMOCOES.find(e => e.value === emocao)?.label?.toLowerCase() || 'emoção'} aparece de manhã. Começa o dia com uma micro-prática.`,
      tarde: `A tarde traz esta emoção. Uma pausa consciente pode ajudar.`,
      noite: `A noite intensifica. Antes de dormir, faz uma respiração para soltar o dia.`,
      madrugada: `Se acordas com esta emoção, o corpo está a processar. Não ignores.`
    }
    return dicas[periodo] || 'Observa o que acontece neste período.'
  }

  // Loading
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${SERENA_DARK} 0%, #0f0f0f 100%)` }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🔍</div>
          <p className="text-white/60 text-sm">A analisar os teus padrões...</p>
        </div>
      </div>
    )
  }

  // Dados insuficientes
  const precisaMaisDados = diasDeUso < 5

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: `linear-gradient(180deg, ${SERENA_DARK} 0%, #0f0f0f 100%)` }}
    >
      <ModuleHeader
        eco="serena"
        title="Detector de Padrões"
        subtitle="Descobre os teus padrões emocionais"
        backTo="/serena/dashboard"
      />

      <div className="max-w-lg mx-auto px-4 py-6">
        {precisaMaisDados ? (
          /* Precisa de mais dados */
          <div
            className="rounded-2xl border p-8 text-center"
            style={{ background: `${SERENA_COLOR}10`, borderColor: `${SERENA_COLOR}25` }}
          >
            <div className="text-6xl mb-4">🔮</div>
            <h2 className="text-white text-xl font-semibold mb-3">
              A recolher dados...
            </h2>
            <p className="text-white/60 text-sm mb-4 leading-relaxed">
              Precisas de pelo menos 5 dias de registos emocionais para o detector encontrar padrões.
            </p>

            {/* Progresso */}
            <div className="mb-4">
              <div className="flex justify-between text-white/40 text-xs mb-1">
                <span>{diasDeUso} dias</span>
                <span>5 dias</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: `${SERENA_COLOR}20` }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (diasDeUso / 5) * 100)}%`,
                    background: SERENA_COLOR
                  }}
                />
              </div>
            </div>

            <p className="text-white/40 text-xs">
              Faltam {Math.max(0, 5 - diasDeUso)} dias de registos
            </p>
          </div>
        ) : padroes.length === 0 ? (
          /* Sem padrões detectados */
          <div
            className="rounded-2xl border p-8 text-center"
            style={{ background: `${SERENA_COLOR}10`, borderColor: `${SERENA_COLOR}25` }}
          >
            <div className="text-5xl mb-4">🌊</div>
            <h3 className="text-white text-lg font-medium mb-2">
              Sem padrões claros (ainda)
            </h3>
            <p className="text-white/50 text-sm">
              Continua a registar. Quanto mais dados, mais padrões o detector encontra.
            </p>
          </div>
        ) : (
          /* Padrões detectados */
          <>
            {/* Resumo */}
            <div
              className="rounded-2xl border p-5 mb-6"
              style={{ background: `${SERENA_COLOR}10`, borderColor: `${SERENA_COLOR}25` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🔍</span>
                <div>
                  <h2 className="text-white text-lg font-semibold">
                    {padroes.length} {padroes.length === 1 ? 'padrão' : 'padrões'} {padroes.length === 1 ? g('detectado', 'detectada') : g('detectados', 'detectadas')}
                  </h2>
                  <p className="text-white/40 text-xs">
                    Baseado em {registos.length} registos ao longo de {diasDeUso} dias
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de padrões */}
            <div className="space-y-4">
              {padroes.map((padrao, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border p-5 animate-fadeIn"
                  style={{
                    background: `${padrao.cor}08`,
                    borderColor: `${padrao.cor}20`,
                    animationDelay: `${idx * 100}ms`
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{padrao.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-sm">{padrao.titulo}</h3>
                      <p className="text-white/50 text-xs mt-1">{padrao.descricao}</p>
                    </div>
                  </div>

                  {/* Barra de força */}
                  <div className="mb-3">
                    <div className="flex justify-between text-white/30 text-[10px] mb-1">
                      <span>Força do padrão</span>
                      <span>{padrao.forca}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${padrao.cor}15` }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${padrao.forca}%`, background: padrao.cor }}
                      />
                    </div>
                  </div>

                  {/* Dica */}
                  <div
                    className="p-3 rounded-xl"
                    style={{ background: `${padrao.cor}10` }}
                  >
                    <p className="text-white/60 text-xs leading-relaxed">
                      💡 {padrao.dica}
                    </p>
                  </div>

                  {/* Tag do tipo */}
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px]"
                      style={{ background: `${padrao.cor}20`, color: `${padrao.cor}` }}
                    >
                      {padrao.tipo === 'dia_semana' && '📅 Dia da semana'}
                      {padrao.tipo === 'periodo' && '🕐 Período do dia'}
                      {padrao.tipo === 'intensidade' && '📈 Intensidade'}
                      {padrao.tipo === 'corpo' && '🧍 Corpo'}
                      {padrao.tipo === 'trigger' && '🎯 Gatilho'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Nota informativa */}
        <div
          className="mt-6 rounded-2xl border p-4"
          style={{ background: `${SERENA_COLOR}05`, borderColor: `${SERENA_COLOR}10` }}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">ℹ️</span>
            <p className="text-white/40 text-xs leading-relaxed">
              Os padrões são calculados com base nos teus registos no Diário Emocional.
              Quanto mais registares (incluindo triggers e zonas do corpo), mais precisos serão os padrões.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; opacity: 0; }
      `}</style>
    </div>
  )
}
