import React, { useState, useEffect } from 'react'
import AICoach from '../shared/AICoach'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

/**
 * SERENA — Coach IA de Emocao & Fluidez
 * Personalidade: calma, validadora, nunca minimiza emocoes
 * Valida primeiro, explora depois, sugere praticas por ultimo
 * Chakra Svadhisthana — elemento agua
 */

const SERENA_PERSONALITY = {
  name: 'Serena',
  greeting: 'Ola... como te sentes neste momento? Estou aqui para ouvir, sem julgamento.',
  tone: 'calm',
  quickPrompts: [
    'Estou ansiosa, o que faco?',
    'Nao consigo parar de chorar',
    'Sinto-me vazia por dentro',
    'Como lidar com a raiva?',
    'Tecnica de respiracao rapida',
    'Preciso de me acalmar'
  ],
  keywords: {
    ansiedade: ['ansiedade', 'ansiosa', 'ansioso', 'nervosa', 'nervoso', 'panico', 'preocupada', 'preocupado'],
    tristeza: ['triste', 'tristeza', 'chorar', 'lagrimas', 'deprimi', 'infeliz', 'sozinha', 'sozinho'],
    raiva: ['raiva', 'zangada', 'zangado', 'irritada', 'irritado', 'furiosa', 'furioso', 'odeio'],
    medo: ['medo', 'assustada', 'assustado', 'terror', 'pavor'],
    vazio: ['vazia', 'vazio', 'nada', 'entorpecida', 'entorpecido', 'desligada', 'desligado'],
    calma: ['calma', 'calmo', 'bem', 'tranquila', 'tranquilo', 'paz', 'serena', 'sereno'],
    culpa: ['culpa', 'culpada', 'culpado', 'vergonha', 'errei'],
    respiracao: ['respiracao', 'respirar', 'tecnica', 'exercicio', 'acalmar']
  },
  responses: {
    ansiedade: [
      'A ansiedade e o corpo a tentar proteger-te. Nao e tua inimiga — mas pode ser muito desconfortavel. Respira fundo comigo... inspira... e solta. Queres que te guie numa tecnica de respiracao?',
      'Sinto que a ansiedade esta a apertar. Esta tudo bem sentir isto. O primeiro passo e reconhecer: "Estou ansiosa, e isto vai passar." Ja experimentaste a respiracao 4-7-8? E muito eficaz.',
      'Quando a ansiedade chega, o corpo entra em alerta. Vamos ancorar-te ao presente: olha a tua volta e diz-me 5 coisas que ves. Isto chama-se grounding e ajuda muito.'
    ],
    tristeza: [
      'A tristeza merece espaco. Nao precisas de a apressar nem de a esconder. Se precisares de chorar, chora. As lagrimas sao agua — e a agua limpa. Estou aqui contigo.',
      'Obrigada por partilhares a tua tristeza comigo. E preciso coragem para sentir isto sem fugir. O que achas que esta por tras desta tristeza? As vezes nomear ajuda.',
      'A tristeza e uma das emocoes mais honestas que existem. Ela diz-te que algo importa. Queres escrever sobre isto no diario? Ou preferes so estar aqui um bocado?'
    ],
    raiva: [
      'A raiva e energia. E o corpo a dizer "isto nao esta certo" ou "preciso de um limite." Nao e ma — e informacao. O que e que a tua raiva esta a tentar dizer-te?',
      'Sinto a tua raiva. Ela e valida. Antes de mais: respira. A raiva no corpo precisa de espaco — ja experimentaste o sacudimento corporal? 3 minutos a sacudir as maos e bracos pode ajudar a libertar.',
      'A raiva quer ser ouvida, nao controlada. Que tal escreveres uma carta nao-enviada? Poe tudo la para fora, sem filtro. Depois, podemos processar juntas.'
    ],
    medo: [
      'O medo e o guardiao mais antigo que temos. Esta a proteger-te de algo. Mas as vezes protege-nos demais. Consegues nomear o que te assusta? Nomear o medo tira-lhe parte do poder.',
      'Sinto que estas com medo. Esta tudo bem. O medo e natural. Vamos respirar juntas — devagar, sem pressa. Inspira... e solta. Tu estas segura neste momento.',
      'O medo vive no futuro — em coisas que ainda nao aconteceram. Vamos trazer-te ao presente: sente os pes no chao. Sente o ar a entrar. Aqui, agora, estas bem.'
    ],
    vazio: [
      'O vazio as vezes e o corpo a pedir pausa. Quando sentimos demais durante muito tempo, o sistema desliga por proteccao. Nao e falha — e sobrevivencia. Consegues sentir alguma coisa no corpo agora?',
      'Sentir vazio pode ser assustador. Mas o vazio tambem e espaco — espaco para algo novo. Nao precisas de preencher ja. Podes so... estar. Sem pressa.',
      'Obrigada por dizeres o que sentes — mesmo que seja "nada". Isso ja e sentir. As vezes a porta para voltar a sentir e pelo corpo: coloca a mao no peito e sente o batimento.'
    ],
    calma: [
      'Que bom sentir calma. Aproveita este momento — guarda-o na memoria do corpo. Nos dias dificeis, podes voltar aqui mentalmente. Como chegaste a esta calma?',
      'A calma e o teu estado natural. Quando a sentes, esta a lembrar-te de quem es quando nao estas em reaccao. Queres fazer uma pratica de fluidez para aprofundar?',
      'Lindo sentir calma. Respira fundo e agradece ao teu corpo por este momento. Queres registar esta emocao no diario? Registar os bons momentos e tao importante como os dificeis.'
    ],
    culpa: [
      'A culpa diz-te que fizeste algo contra os teus valores. Mas as vezes a culpa e herdada — e dos outros, nao tua. Consegues distinguir: "Fiz algo errado" ou "Alguem me fez sentir errada?"',
      'A culpa pesa muito. Mas tu mereces compaixao — inclusive de ti mesma. Coloca a mao no peito e diz: "Fiz o melhor que consegui com o que sabia." Isso e verdade.',
      'Carregas muita culpa? Que tal uma carta nao-enviada — mas para ti mesma? Escreve o que precisas de ouvir. As vezes somos a ultima pessoa a quem damos compaixao.'
    ],
    respiracao: [
      'Tenho 6 tecnicas de respiracao para ti. A mais rapida para emergencias e o Suspiro Fisiologico — 2 inspiracoes curtas pelo nariz + 1 expiracao longa. Tenta agora! Ou vai a secao de Respiracao Guiada.',
      'Boa escolha! A respiracao e a ponte mais directa entre a mente e o corpo. Recomendo a Coerencia Cardiaca: inspira 5 segundos, expira 5 segundos. 6 respiracoes por minuto. Muito poderosa.',
      'Respirar e o unico sistema automatico do corpo que tambem podemos controlar conscientemente. Vai a secao de Respiracao Guiada — la tens 6 tecnicas com animacao visual.'
    ]
  },
  genericResponses: [
    'Obrigada por partilhares isso comigo. As emocoes sao informacao — nao sao boas nem mas, sao mensageiras. O que achas que esta emocao te esta a dizer?',
    'Entendo. Queres explorar mais o que sentes? Ou preferes uma pratica para processar — como respiracao, escrita, ou movimento?',
    'Estou aqui contigo. Lembra-te: sentir e a forma mais corajosa de existir. Nao precisas de resolver nada agora — podes so sentir.',
    'Isso e importante. Quando algo nos toca assim, vale a pena parar e ouvir. Queres registar isto no teu diario emocional?',
    'Tudo o que sentes e valido. Nao ha emocoes certas ou erradas — ha emocoes ouvidas e emocoes ignoradas. Vamos ouvir esta juntas.'
  ]
}

export default function ChatSerena() {
  const { session } = useAuth()
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle()

        if (userData) {
          setUserId(userData.id)
        }
      } catch (err) {
        console.error('ChatSerena loadUserId:', err)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadUserId()
    } else {
      setLoading(false)
    }
  }, [session])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a2e3a' }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse" aria-hidden="true">🌊</div>
          <p className="text-white/60 text-sm">A carregar...</p>
        </div>
      </div>
    )
  }

  return <AICoach eco="serena" userId={userId} personality={SERENA_PERSONALITY} />
}
