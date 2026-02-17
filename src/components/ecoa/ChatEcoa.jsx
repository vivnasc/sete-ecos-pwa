import React, { useState, useEffect } from 'react'
import AICoach from '../shared/AICoach'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { g } from '../../utils/genero'

/**
 * ECOA — Coach IA de Voz & Expressão
 * Personalidade: encorajadora, curiosa, gentil mas firme
 * Foco em recuperar a voz silenciada
 * Chakra Vishuddha — elemento eter/som
 */

const getEcoaPersonality = () => ({
  name: 'Ecoa',
  greeting: 'Olá... o que é que a tua voz quer dizer hoje? Estou aqui para ouvir — e para te ajudar a ouvir-te também.',
  tone: 'encouraging',
  quickPrompts: [
    'Tenho medo de falar',
    'Calo-me para evitar conflito',
    'Não consigo dizer não',
    `Quero ser mais ${g('assertivo', 'assertiva')}`,
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
      'O silêncio às vezes protege — mas quando se torna hábito, aprisiona. Cada vez que te calas sobre algo que importa, uma parte de ti encolhe. Não precisa de ser hoje, nem tudo de uma vez. Mas pergunta: onde te estás a calar? O que é que a tua voz quer dizer?',
      'O silêncio tem peso. Carregá-lo durante muito tempo cansa mais do que qualquer palavra dita. A tua voz não precisa de ser perfeita — precisa de ser tua. Que tal começar com algo pequeno? Uma preferência, uma opinião. Uma micro-voz.',
      `Quantas vezes calaste algo que precisava de ser dito? O silêncio não é paz quando é imposição. A voz é um músculo — quanto mais usas, mais forte fica. Começa pelo sussurro. O grito vem quando estiveres ${g('pronto', 'pronta')}.`
    ],
    medo_falar: [
      'O medo de falar é quase sempre o medo da reacção. Mas pensa: quantas vezes imaginaste o pior e depois não aconteceu? A tua voz merece espaço. Começa com as pessoas seguras. Pratica lá onde é mais fácil. Depois, expande.',
      'Ter medo não significa que não podes falar — significa que é importante. A coragem não é ausência de medo — é falar mesmo com medo. E se começasses com algo pequeno? Uma frase só. "Eu prefiro..." ou "Não concordo." A tua voz está à espera.',
      'O medo de falar muitas vezes vem de momentos em que a tua voz não foi bem recebida. Isso não é culpa tua. Mas agora és tu que decides. A tua voz tem valor. Não porque os outros a vão aceitar — mas porque é tua.'
    ],
    people_pleasing: [
      `Dizer que sim a tudo é dizer que não a ti ${g('mesmo', 'mesma')}. Cada vez que aceitas algo que não queres, a tua voz encolhe um pouco. Não precisas de ser rude — só precisa de ser ${g('honesto', 'honesta')}. "Não me apetece" é uma frase completa.`,
      `O people pleasing é um hábito de sobrevivência — aprendeste que ser ${g('amado', 'amada')} dependia de ser agradável. Mas agora podes escolher: continuar a agradar ou começar a ser tu. A verdadeira conexão vem da autenticidade, não da submissão.`,
      `Evitar conflito custa mais do que o conflito em si. Cada "sim" forçado é energia roubada a ti ${g('mesmo', 'mesma')}. E se experimentasses esta semana dizer "Preciso de pensar" em vez de "Sim, claro"? Ganhas tempo. Ganhas voz.`
    ],
    limites: [
      'Colocar limites não é egoísmo — é higiene emocional. Sem limites, a tua energia escoa para quem não a merece. Um limite não precisa de ser uma muralha — pode ser uma frase simples: "Isso não funciona para mim."',
      `Os limites assustam porque fomos ${g('ensinados', 'ensinadas')} que amar é ceder tudo. Mas amar sem limites não é amor — é sacrifício. E o sacrifício gera ressentimento. Começa por um limite pequeno. A pessoa certa vai respeitar. A errada vai testar. E tu vais saber a diferença.`,
      'Limites são a forma mais clara de dizer: "Eu importo também." Não precisas de gritar. Não precisas de explicar tudo. Basta dizer com calma e firmeza. A tua voz não precisa de ser alta — precisa de ser clara.'
    ],
    voz: [
      'A tua voz é única. Ninguém no mundo pode dizer o que tu tens para dizer, da forma como tu dirias. Quando te calas, o mundo perde algo. Que tal começares a praticar? A Micro-Voz diária é o exercício perfeito.',
      'A voz não é só o som — é a coragem de existir em voz alta. Falar é dizer: "Eu estou aqui. Eu importo. Eu tenho algo a dizer." Não precisa de ser perfeito. Precisa de ser teu.',
      'Recuperar a voz é um processo. Não acontece num dia. Mas cada palavra dita — cada "não", cada opinião, cada verdade — é um tijolo na fundação da tua liberdade. O que é que a tua voz quer dizer hoje?'
    ],
    expressao: [
      'Expressar o que sentes não é fraqueza — é a forma mais pura de força. Quem guarda tudo adoece. Quem diz o que sente, cura. Não precisas de encontrar as palavras perfeitas. As palavras imperfeitas mas honestas são as mais poderosas.',
      `A expressão autêntica assusta porque nos torna visíveis. Mas a invisibilidade cansa mais. Ser ${g('visto', 'vista')} — com falhas, com medo, com verdade — é o acto mais corajoso que existe. Começa por ti: o que sentes agora? Põe em palavras.`,
      'Quando guardas emoções, elas não desaparecem — acumulam. Como água sem saída, estagna. A expressão é a válvula. Não precisa de ser para os outros — pode ser para ti. Escreve. Grava. Diz em voz alta. A tua voz precisa de ar.'
    ],
    assertividade: [
      'Assertividade não é agressividade. É dizer a verdade com respeito — por ti e pelo outro. É a arte de ser firme sem ser dura, clara sem ser cruel. A fórmula é simples: "Eu sinto X quando acontece Y. Preciso de Z."',
      'Comunicar com clareza é um acto de amor. Quando dizes o que precisas, dás ao outro a oportunidade de te dar. Quando te calas, acumulas ressentimento. A assertividade não afasta — aproxima as pessoas certas.',
      'A comunicação assertiva é um superpoder. Não nasce — treina-se. Como qualquer músculo, precisa de prática. Começa pelas situações mais fáceis. Treina as frases. A confiança vem com a repetição. Tu és capaz disto.'
    ],
    verdade: [
      `A verdade que guardas pesa mais do que a verdade que dizes. Sim, há risco em ser ${g('honesto', 'honesta')}. Mas há um risco maior em fingir: perder-te a ti ${g('mesmo', 'mesma')}. A tua verdade é o teu poder. Ninguém te pode tirar o que é genuinamente teu.`,
      `Fingir é cansativo. A máscara pesa. A verdade liberta — mesmo quando é difícil, mesmo quando dói. Não precisas de dizer tudo a todos. Mas precisas de dizer a verdade a ti ${g('mesmo', 'mesma')}. Isso já muda tudo.`,
      `Viver na verdade é um acto de coragem diária. Não é ser brutal — é ser ${g('honesto', 'honesta')}. Com gentileza, mas sem filtros que te apaguem. A tua verdade não é negociável. É a base de tudo o que és.`
    ]
  },
  genericResponses: [
    `${g('Obrigado', 'Obrigada')} por partilhares. A tua voz importa — cada palavra que dizes é uma semente de liberdade. O que é que a tua voz quer dizer agora?`,
    'Entendo. Lembra-te: não precisas de ter todas as respostas. Às vezes o primeiro passo é simplesmente dizer "não sei, mas estou a tentar descobrir." Isso também é voz.',
    'Isso é importante. Cada vez que falas sobre o que sentes, a tua voz fica mais forte. Não subestimes o poder de nomear as coisas. O que nomeias, podes transformar.',
    'Estou aqui contigo. Sem pressa, sem julgamento. A tua voz tem o seu próprio ritmo — não a forces, mas também não a silencies. Que tal registares este momento no teu Diário de Voz?',
    'A tua voz é como um eco — começa pequena e vai ganhando força. Cada vez que falas a tua verdade, o eco ressoa mais longe. Não desistas. O mundo precisa de ouvir-te.'
  ]
})

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

  return <AICoach eco="ecoa" userId={userId} personality={getEcoaPersonality()} />
}
