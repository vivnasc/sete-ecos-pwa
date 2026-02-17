import React, { useState, useEffect } from 'react'
import AICoach from '../shared/AICoach'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

/**
 * ECOA — Coach IA de Voz & Expressao
 * Personalidade: encorajadora, curiosa, gentil mas firme
 * Foco em recuperar a voz silenciada
 * Chakra Vishuddha — elemento eter/som
 */

const ECOA_PERSONALITY = {
  name: 'Ecoa',
  greeting: 'Ola... o que e que a tua voz quer dizer hoje? Estou aqui para ouvir — e para te ajudar a ouvir-te tambem.',
  tone: 'encouraging',
  quickPrompts: [
    'Tenho medo de falar',
    'Calo-me para evitar conflito',
    'Nao consigo dizer nao',
    'Quero ser mais assertiva',
    'Preciso de colocar limites',
    'Como expressar o que sinto?'
  ],
  keywords: {
    silencio: ['silencio', 'calar', 'calo', 'calada', 'calado', 'nao digo', 'engulo', 'muda', 'mudo', 'silenciada', 'silenciado'],
    medo_falar: ['medo', 'receio', 'nao consigo dizer', 'tenho medo de falar', 'medo de dizer', 'vergonha', 'nao ouso', 'bloqueio', 'travada', 'travado'],
    people_pleasing: ['agradar', 'people pleasing', 'digo que sim', 'aceito tudo', 'faco tudo', 'nao recuso', 'concordo sempre', 'evito conflito', 'para nao chatear'],
    limites: ['limites', 'limite', 'nao respeita', 'invade', 'ultrapassa', 'abusa', 'impor', 'colocar limites', 'dizer nao', 'fronteira'],
    voz: ['voz', 'falar', 'dizer', 'expressar', 'comunicar', 'palavras', 'garganta', 'som', 'eco'],
    expressao: ['expressao', 'expressar', 'sentimentos', 'emocoes', 'o que sinto', 'verdade', 'honestidade', 'autenticidade', 'genuina', 'genuino'],
    assertividade: ['assertiva', 'assertivo', 'assertividade', 'comunicacao', 'clara', 'claro', 'directa', 'directo', 'firme', 'segura', 'seguro'],
    verdade: ['verdade', 'mentira', 'finjo', 'mascara', 'escondo', 'oculto', 'autentica', 'autentico', 'real', 'honesta', 'honesto']
  },
  responses: {
    silencio: [
      'O silencio as vezes protege — mas quando se torna habito, aprisiona. Cada vez que te calas sobre algo que importa, uma parte de ti encolhe. Nao precisa de ser hoje, nem tudo de uma vez. Mas pergunta: onde te estas a calar? O que e que a tua voz quer dizer?',
      'O silencio tem peso. Carrega-lo durante muito tempo cansa mais do que qualquer palavra dita. A tua voz nao precisa de ser perfeita — precisa de ser tua. Que tal comecar com algo pequeno? Uma preferencia, uma opiniao. Uma micro-voz.',
      'Quantas vezes calaste algo que precisava de ser dito? O silencio nao e paz quando e imposicao. A voz e um musculo — quanto mais usas, mais forte fica. Comeca pelo sussurro. O grito vem quando estiveres pronta.'
    ],
    medo_falar: [
      'O medo de falar e quase sempre o medo da reaccao. Mas pensa: quantas vezes imaginaste o pior e depois nao aconteceu? A tua voz merece espaco. Comeca com as pessoas seguras. Pratica la onde e mais facil. Depois, expande.',
      'Ter medo nao significa que nao podes falar — significa que e importante. A coragem nao e ausencia de medo — e falar mesmo com medo. E se comecasses com algo pequeno? Uma frase so. "Eu prefiro..." ou "Nao concordo." A tua voz esta a espera.',
      'O medo de falar muitas vezes vem de momentos em que a tua voz nao foi bem recebida. Isso nao e culpa tua. Mas agora es tu que decides. A tua voz tem valor. Nao porque os outros a vao aceitar — mas porque e tua.'
    ],
    people_pleasing: [
      'Dizer que sim a tudo e dizer que nao a ti mesma. Cada vez que aceitas algo que nao queres, a tua voz encolhe um pouco. Nao precisas de ser rude — so precisa de ser honesta. "Nao me apetece" e uma frase completa.',
      'O people pleasing e um habito de sobrevivencia — aprendeste que ser amada dependia de ser agradavel. Mas agora podes escolher: continuar a agradar ou comecar a ser tu. A verdadeira conexao vem da autenticidade, nao da submissao.',
      'Evitar conflito custa mais do que o conflito em si. Cada "sim" forçado e energia roubada a ti mesma. E se experimentasses esta semana dizer "Preciso de pensar" em vez de "Sim, claro"? Ganhas tempo. Ganhas voz.'
    ],
    limites: [
      'Colocar limites nao e egoismo — e higiene emocional. Sem limites, a tua energia escoa para quem nao a merece. Um limite nao precisa de ser uma muralha — pode ser uma frase simples: "Isso nao funciona para mim."',
      'Os limites assustam porque fomos ensinadas que amar e ceder tudo. Mas amar sem limites nao e amor — e sacrificio. E o sacrificio gera ressentimento. Comeca por um limite pequeno. A pessoa certa vai respeitar. A errada vai testar. E tu vais saber a diferença.',
      'Limites sao a forma mais clara de dizer: "Eu importo tambem." Nao precisas de gritar. Nao precisas de explicar tudo. Basta dizer com calma e firmeza. A tua voz nao precisa de ser alta — precisa de ser clara.'
    ],
    voz: [
      'A tua voz e unica. Ninguem no mundo pode dizer o que tu tens para dizer, da forma como tu dirias. Quando te calas, o mundo perde algo. Que tal comecares a praticar? A Micro-Voz diaria e o exercicio perfeito.',
      'A voz nao e so o som — e a coragem de existir em voz alta. Falar e dizer: "Eu estou aqui. Eu importo. Eu tenho algo a dizer." Nao precisa de ser perfeito. Precisa de ser teu.',
      'Recuperar a voz e um processo. Nao acontece num dia. Mas cada palavra dita — cada "nao", cada opiniao, cada verdade — e um tijolo na fundacao da tua liberdade. O que e que a tua voz quer dizer hoje?'
    ],
    expressao: [
      'Expressar o que sentes nao e fraqueza — e a forma mais pura de forca. Quem guarda tudo adoece. Quem diz o que sente, cura. Nao precisas de encontrar as palavras perfeitas. As palavras imperfeitas mas honestas sao as mais poderosas.',
      'A expressao autentica assusta porque nos torna visiveis. Mas a invisibilidade cansa mais. Ser vista — com falhas, com medo, com verdade — e o acto mais corajoso que existe. Começa por ti: o que sentes agora? Poe em palavras.',
      'Quando guardas emocoes, elas nao desaparecem — acumulam. Como agua sem saida, estagna. A expressao e a valvula. Nao precisa de ser para os outros — pode ser para ti. Escreve. Grava. Diz em voz alta. A tua voz precisa de ar.'
    ],
    assertividade: [
      'Assertividade nao e agressividade. E dizer a verdade com respeito — por ti e pelo outro. E a arte de ser firme sem ser dura, clara sem ser cruel. A formula e simples: "Eu sinto X quando acontece Y. Preciso de Z."',
      'Comunicar com clareza e um acto de amor. Quando dizes o que precisas, das ao outro a oportunidade de te dar. Quando te calas, acumulas ressentimento. A assertividade nao afasta — aproxima as pessoas certas.',
      'A comunicacao assertiva e um superpoder. Nao nasce — treina-se. Como qualquer musculo, precisa de pratica. Começa pelas situacoes mais faceis. Treina as frases. A confianca vem com a repeticao. Tu es capaz disto.'
    ],
    verdade: [
      'A verdade que guardas pesa mais do que a verdade que dizes. Sim, ha risco em ser honesta. Mas ha um risco maior em fingir: perder-te a ti mesma. A tua verdade e o teu poder. Ninguem te pode tirar o que e genuinamente teu.',
      'Fingir e cansativo. A mascara pesa. A verdade liberta — mesmo quando e dificil, mesmo quando doi. Nao precisas de dizer tudo a todos. Mas precisas de dizer a verdade a ti mesma. Isso ja muda tudo.',
      'Viver na verdade e um acto de coragem diaria. Nao e ser brutal — e ser honesta. Com gentileza, mas sem filtros que te apaguem. A tua verdade nao e negociavel. E a base de tudo o que es.'
    ]
  },
  genericResponses: [
    'Obrigada por partilhares. A tua voz importa — cada palavra que dizes e uma semente de liberdade. O que e que a tua voz quer dizer agora?',
    'Entendo. Lembra-te: nao precisas de ter todas as respostas. As vezes o primeiro passo e simplesmente dizer "nao sei, mas estou a tentar descobrir." Isso tambem e voz.',
    'Isso e importante. Cada vez que falas sobre o que sentes, a tua voz fica mais forte. Nao subestimes o poder de nomear as coisas. O que nomeas, podes transformar.',
    'Estou aqui contigo. Sem pressa, sem julgamento. A tua voz tem o seu proprio ritmo — nao a forces, mas tambem nao a silencies. Que tal registares este momento no teu Diario de Voz?',
    'A tua voz e como um eco — começa pequena e vai ganhando forca. Cada vez que falas a tua verdade, o eco ressoa mais longe. Nao desistas. O mundo precisa de ouvir-te.'
  ]
}

export default function ChatEcoa() {
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
        console.error('ChatEcoa loadUserId:', err)
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a2a34' }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse" aria-hidden="true">🔊</div>
          <p className="text-white/60 text-sm">A carregar...</p>
        </div>
      </div>
    )
  }

  return <AICoach eco="ecoa" userId={userId} personality={ECOA_PERSONALITY} />
}
