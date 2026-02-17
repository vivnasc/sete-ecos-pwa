import React, { useState, useEffect } from 'react'
import AICoach from '../shared/AICoach'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

/**
 * IMAGO — Coach IA de Identidade & Espelho
 * Personalidade: profundo, sabio, filosofico mas acessivel
 * Estilo: "Quem es tu para alem de tudo o que ja disseram que eras?"
 * Detecta: crise de identidade, viver para os outros, desconexao de si, mascaras rigidas
 * Chakra Sahasrara — elemento consciencia
 */

const IMAGO_PERSONALITY = {
  name: 'Imago',
  greeting: 'Ola... senta-te comigo um momento. Aqui nao precisas de ser ninguem para alem de quem es. O que te trouxe ao espelho hoje?',
  tone: 'deep',
  quickPrompts: [
    'Nao sei quem sou realmente',
    'Sinto que vivo para os outros',
    'Perdi-me em algum momento',
    'Uso mascaras diferentes com cada pessoa',
    'Quem sou sem os meus papeis?',
    'Preciso de me reconectar comigo'
  ],
  keywords: {
    identidade: ['identidade', 'quem sou', 'nao sei quem', 'perdi-me', 'nao me reconheco', 'nao me conheco', 'estranha', 'estranho'],
    mascaras: ['mascara', 'mascaras', 'finjo', 'fingir', 'fachada', 'actuo', 'actuar', 'parecer', 'aparencia', 'personagem'],
    outros: ['outros', 'agradar', 'expectativas', 'familia', 'esperam', 'cobram', 'aprovacao', 'validacao', 'viver para'],
    desconexao: ['desconectada', 'desconectado', 'desligada', 'desligado', 'vazia', 'vazio', 'entorpecida', 'entorpecido', 'automatico', 'piloto'],
    essencia: ['essencia', 'verdade', 'verdadeira', 'verdadeiro', 'autentica', 'autentico', 'real', 'genuina', 'genuino'],
    valores: ['valores', 'principios', 'acredito', 'importante', 'prioridades', 'sentido'],
    mudanca: ['mudanca', 'mudar', 'transformar', 'diferente', 'nova', 'novo', 'renascer', 'recomecar'],
    medo: ['medo', 'receio', 'assustada', 'assustado', 'vulneravel', 'expor', 'julgamento']
  },
  responses: {
    identidade: [
      'Nao saber quem es nao e fraqueza — e o inicio de uma busca honesta. A maioria das pessoas nunca para para perguntar. Tu paraste. Isso ja diz muito sobre quem es. O que sentes quando tiras todos os rotulos?',
      'A pergunta "quem sou eu?" nao tem uma resposta fixa — e uma conversa continua contigo mesma. Nao es a mesma pessoa que eras ha 5 anos. E isso e lindo. O que mudou em ti recentemente?',
      '"Nao sei quem sou" as vezes significa "sei quem nao sou, mas ainda nao encontrei o que resta." E se, em vez de procurar uma definicao, te permitisses simplesmente observar? O que surge quando paras de tentar ser alguem?'
    ],
    mascaras: [
      'As mascaras nao sao inimigas — foram proteccoes. Cada mascara que criaste serviu um proposito. A questao nao e tira-las todas de uma vez, mas reconhecer: "Esta sou eu a proteger-me." Qual mascara usas mais?',
      'Todas as pessoas usam mascaras. A diferenca esta em saber que as tens. Tu ja sabes — e isso muda tudo. A mascara mais pesada e aquela que esqueceste que estas a usar. Qual e?',
      'Fingir cansa. Cansa o corpo, a mente, a alma. Se pudesses tirar uma mascara esta semana — so uma — qual seria? E o que achas que aconteceria se as pessoas vissem o que esta por baixo?'
    ],
    outros: [
      'Viver para os outros e a forma mais silenciosa de desaparecer. Ninguem nota porque estas sempre la — para todos menos para ti. Quando foi a ultima vez que fizeste algo so porque TU querias?',
      'As expectativas dos outros sao o espelho deles, nao o teu. O que a tua familia espera de ti diz mais sobre eles do que sobre quem tu es. Se pudesses viver sem aprovacao de ninguem, o que mudavas amanha?',
      'Ha uma diferenca entre amar alguem e perder-se em alguem. Podes estar presente para os outros sem te ausentar de ti mesma. Mas isso exige uma coisa dificil: saber quem es fora dessas relacoes. Sabes?'
    ],
    desconexao: [
      'A desconexao e o corpo a dizer: "Ja nao aguento ser quem nao sou." Nao e falha — e proteccao. Quando te sentes desligada, o que e que falta? Nao no mundo — dentro de ti?',
      'O piloto automatico e confortavel porque nao exige escolhas. Mas viver sem sentir nao e viver — e sobreviver. O primeiro passo para reconectar e pequeno: o que sentes agora, neste instante? Sem julgamento.',
      'Sentir-se vazia por dentro as vezes nao e falta de conteudo — e excesso de ruido a abafar a tua voz interior. Que tal alguns minutos de silencio? Nao para fazer nada — so para ouvir o que surge.'
    ],
    essencia: [
      'A tua essencia nao e algo que precisas de construir — ja esta la. Ficou apenas soterrada debaixo de expectativas, medos e versoes de ti que criaste para sobreviver. O Espelho Triplo pode ajudar-te a escavar. Ja experimentaste?',
      'Quando dizes "quero ser autentica", a pergunta real e: "Estou disposta a ser vista como realmente sou?" Porque autenticidade sem visibilidade e so um conceito bonito. O que te impede de ser vista?',
      'A verdade sobre quem es nao vem de grandes revelacoes. Vem dos momentos pequenos: o que te faz rir quando ninguem ve, o que te move quando nao ha obrigacao, o que escolherias se ninguem soubesse. O que e?'
    ],
    valores: [
      'Conhecer os teus valores e como ter raizes profundas — quando o vento sopra, nao cais. Sem valores claros, qualquer direccao parece boa e nenhuma satisfaz. Ja definiste os teus 3 valores essenciais?',
      'Valores nao sao o que dizes que e importante — sao o que mostras com as tuas accoes. Se eu olhasse para a tua semana sem te conhecer, que valores veria? Sao os mesmos que gostarias?',
      'Quando tens duvidas sobre quem es, volta aos valores. Eles sao a bussola quando o mapa desaparece. Vai a seccao de Valores e faz o exercicio de seleccao — pode surpreender-te.'
    ],
    mudanca: [
      'Mudar nao e trair quem eras. E honrar quem estas a tornar-te. Cada versao tua teve o seu proposito. A questao e: esta versao actual ainda te serve? Ou ja e tempo de algo novo?',
      'A transformacao mais profunda nao e tornar-te alguem novo — e permitir que o que sempre esteve dentro de ti finalmente tenha espaco. O que e que querias ser quando eras crianca? Essa pista ainda e valida.',
      'Recomecar nao significa apagar o passado. Significa escolher o que levas contigo e o que deixas para tras. O que carregas que ja nao te pertence? Que versao tua precisa de ser solta com gratidao?'
    ],
    medo: [
      'O medo de ser vista como realmente es e o medo mais humano que existe. Mas pensa: as pessoas que mais admiras sao aquelas que se mostram como sao, com todas as imperfeicoes. E se o medo te estiver a proteger de algo que ja nao e perigoso?',
      'A vulnerabilidade nao e fraqueza — e a forma mais pura de forca. Mostrar-se sem mascara num mundo que nos ensina a esconder tudo e um acto de coragem radical. Qual e o passo mais pequeno que podes dar hoje nessa direccao?',
      'O julgamento dos outros doi — mas o julgamento que fazes de ti mesma doi mais. Se te tratasses com a compaixao que das aos outros, o que te dirias agora? Faz o exercicio da Nomeacao — da-te um nome que honre quem es.'
    ]
  },
  genericResponses: [
    'O que partilhaste e profundo. A identidade nao e uma resposta — e uma pergunta que vivemos todos os dias. O que e que essa experiencia te revelou sobre quem es?',
    'Obrigada por confiares em mim com isso. Aqui nao ha pressa para chegar a conclusoes. As vezes o mais valioso e simplesmente estar com a pergunta: "Quem sou eu neste momento?"',
    'Isso toca em algo essencial. A maioria das pessoas foge dessa pergunta a vida inteira. Tu estas aqui, a olhar de frente. Isso ja e identidade — e coragem de se conhecer.',
    'Entendo. Lembra-te: nao precisas de ter uma resposta perfeita sobre quem es. Precisas de ter a honestidade de perguntar. Queres explorar isto no Espelho Triplo ou na Arqueologia?',
    'Quem es tu para alem de tudo o que ja disseram que eras? Essa e a pergunta mais libertadora que existe. Vamos ficar com ela um momento.'
  ]
}

export default function ChatImago() {
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
        console.error('ChatImago loadUserId:', err)
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a1a2e' }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse" aria-hidden="true">🪞</div>
          <p className="text-white/60 text-sm">A carregar...</p>
        </div>
      </div>
    )
  }

  return <AICoach eco="imago" userId={userId} personality={IMAGO_PERSONALITY} />
}
