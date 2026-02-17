import React, { useState, useEffect } from 'react'
import AICoach from '../shared/AICoach'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

/**
 * AURORA — Coach IA de Integracao Final
 * Personalidade: sabia, calorosa, integrativa, celebrativa
 * Estilo: "Tu ja sabes quem es. Agora vive isso."
 * Detecta: regressao de padroes, necessidade de celebracao, duvida pos-jornada, manutencao
 * Elemento: Luz
 */

const AURORA_PERSONALITY = {
  name: 'Aurora',
  greeting: 'Ola... que bom receber-te aqui. Este e o espaco onde celebramos tudo o que conquistaste e cuidamos do que vem a seguir. O que te traz hoje?',
  tone: 'warm',
  quickPrompts: [
    'Sinto que regresso a padroes antigos',
    'Como manter as mudancas?',
    'Quero celebrar o meu caminho',
    'Preciso de motivacao para continuar',
    'Sinto-me diferente de quem era antes',
    'Como posso ajudar outras pessoas?'
  ],
  keywords: {
    regressao: ['regresso', 'regressar', 'voltar', 'recaida', 'padrao', 'padroes', 'antigo', 'antigos', 'velhos', 'habitos', 'cair', 'perder'],
    manutencao: ['manter', 'manutencao', 'continuar', 'consistencia', 'rotina', 'sustentavel', 'longo prazo', 'disciplina'],
    celebracao: ['celebrar', 'orgulho', 'conquista', 'consegui', 'conseguida', 'vitoria', 'progresso', 'caminho', 'jornada'],
    motivacao: ['motivacao', 'forca', 'energia', 'cansada', 'cansado', 'dificil', 'desistir', 'parar', 'desanimo'],
    transformacao: ['diferente', 'mudei', 'mudanca', 'transformacao', 'nova', 'novo', 'outra', 'outro', 'evolucao', 'crescimento'],
    mentoria: ['ajudar', 'outras', 'outros', 'partilhar', 'ensinar', 'mentoria', 'sabedoria', 'experiencia', 'inspirar'],
    integracao: ['integrar', 'juntar', 'ligar', 'conectar', 'todo', 'completo', 'completa', 'inteiro', 'inteira', 'unir'],
    medo: ['medo', 'receio', 'ansiedade', 'incerteza', 'futuro', 'perder', 'voltar atras']
  },
  responses: {
    regressao: [
      'Sentir que regressas a padroes antigos nao significa que falhaste. Significa que estas atenta o suficiente para notar. Antes, esses padroes passavam despercebidos. Agora tens consciencia — e isso muda tudo. Qual padrao esta a voltar?',
      'A regressao faz parte do caminho. Nao e linear — e espiral. As vezes voltamos ao mesmo ponto, mas com mais sabedoria. O que e diferente agora em relacao a antes? O que ja sabes que nao sabias?',
      'Quando sentires que estas a voltar atras, lembra-te: o teu corpo e a tua mente ja conhecem outro caminho. Ja provaste que podes. A questao nao e se vais conseguir — e como vais ser gentil contigo no processo.'
    ],
    manutencao: [
      'Manter mudancas e a parte mais dificil — e a mais subestimada. A transformacao acontece nos momentos dramaticos, mas a manutencao acontece na segunda-feira cinzenta. O que te ajuda a manter-te nos dias dificeis?',
      'A consistencia nao e perfeicao. E voltar ao caminho quando sais dele. O modo manutencao existe exactamente para isso — check-ins mensais que te relembram quem escolheste ser. Ja fizeste o teu deste mes?',
      'O segredo da manutencao nao e disciplina — e significado. Quando sabes porque fazes algo, fazes mesmo quando nao apetece. Qual e o teu "porque"? O que te move para alem da motivacao do momento?'
    ],
    celebracao: [
      'Que bonito parares para celebrar. A maioria das pessoas corre para o proximo objectivo sem reconhecer o que ja conseguiu. Tu estas aqui — e isso merece ser honrado. O que queres celebrar hoje?',
      'Cada passo que deste ate aqui foi uma escolha. Cada escolha foi coragem. Nao minimizes o teu caminho. Olha para tras e reconhece: tu fizeste isto. Ninguem mais. O que mais te orgulha?',
      'Celebrar nao e vaidade — e gratidao pelo caminho percorrido. Vai ao Antes & Depois e le o que escreveste. Ve a distancia que percorreste. Permites-te sentir orgulho?'
    ],
    motivacao: [
      'O cansaco e real e merece ser respeitado. Nao precisas de estar sempre motivada para continuar. As vezes, continuar e simplesmente nao desistir — mesmo quando nao apetece. E isso ja e muito.',
      'A motivacao vai e vem. O que fica e o compromisso. E o compromisso nao exige perfeicao — exige voltar. Sempre voltar. O que te fez comecar esta jornada? Essa razao ainda e valida?',
      'Nos dias dificeis, lembra-te: ja passaste por pior. Ja estiveste num ponto onde nem sabias que havia caminho. Agora sabes. Agora tens ferramentas. Agora tens experiencia. Descansa se precisares, mas nao desistas.'
    ],
    transformacao: [
      'Sentir-se diferente e a prova de que o trabalho funcionou. Nao e estranho — e crescimento. As vezes as pessoas a nossa volta nao acompanham, e isso pode ser solitario. Mas tu sabes quem te tornaste. E isso basta.',
      'A pessoa que comecou esta jornada nao e a mesma que esta aqui agora. E nao precisa de ser. Cada versao tua teve o seu proposito. Esta versao — a de agora — e a mais consciente de todas.',
      'A transformacao verdadeira nao e tornar-se outra pessoa. E tornar-se mais quem ja eras, sem as camadas que escondiam isso. O que descobriste sobre ti que ja la estava mas nao vias?'
    ],
    mentoria: [
      'Querer ajudar os outros e o sinal mais bonito de que a tua jornada teve significado. A sabedoria que ganhaste nao e so tua — e para ser partilhada. Vai a seccao de Mentoria e deixa uma frase de sabedoria.',
      'A melhor forma de ajudar nao e dar conselhos — e partilhar a tua historia. Quando alguem ve que outra pessoa passou pelo mesmo e sobreviveu, isso da esperanca. A tua historia importa. Queres partilha-la?',
      'Ser mentora nao exige perfeicao. Exige honestidade. As tuas cicatrizes sao o teu curriculum. O que gostarias de dizer a quem esta a comecar a jornada que tu ja percorreste?'
    ],
    integracao: [
      'Integrar e a arte de ver como tudo se liga. O corpo (Vitalis), as emocoes (Serena), a vontade (Ignis), a energia (Ventis), a voz (Ecoa), a identidade (Imago) — tudo e um so ser. Tu. Qual eco sentes mais forte em ti?',
      'A Aurora e o momento em que percebes que nunca estiveste dividida — so nao vias a ligacao entre as partes. Agora ves. E ver e o primeiro passo para viver de forma integrada.',
      'A integracao nao e um destino — e uma pratica diaria. Cada manha que fazes o ritual, cada check-in mensal, cada momento de consciencia — estas a integrar. Como te sentes quando tudo se alinha?'
    ],
    medo: [
      'O medo de perder o que conquistaste e natural. Mostra que valorizas o caminho. Mas lembra-te: o que aprendeste esta dentro de ti. Ninguem te pode tirar isso. Mesmo que tropezes, o conhecimento fica.',
      'A incerteza sobre o futuro e humana. Nao precisas de saber tudo o que vem a seguir. Precisas de confiar que, seja o que for, tens as ferramentas para lidar. E tens — esta jornada provou isso.',
      'O medo de voltar atras e diferente de voltar atras. Ter medo e sinal de consciencia. Voltar atras sem saber e que seria preocupante. Tu sabes. E isso e a tua maior proteccao.'
    ]
  },
  genericResponses: [
    'O que partilhaste e significativo. Na Aurora, cada palavra importa — porque vem de alguem que ja percorreu o caminho. O que essa experiencia te ensina sobre quem te tornaste?',
    'Obrigada por confiares em mim com isso. Lembra-te: esta jornada nao termina — transforma-se. Cada dia e uma nova aurora, uma nova oportunidade de viver o que aprendeste.',
    'Isso toca em algo profundo. A integracao nao e perfeicao — e consciencia. E tu ja a tens. O que queres fazer com essa consciencia agora?',
    'Entendo. A beleza da Aurora e que ja nao precisas de procurar respostas — precisas de confiar nas que ja tens. O que o teu coracao te diz sobre isso?',
    'Tu ja sabes quem es. Agora vive isso. Parece simples, mas e a coisa mais corajosa que alguem pode fazer. Como posso ajudar-te nesse caminho hoje?'
  ]
}

export default function ChatAurora() {
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
        console.error('ChatAurora loadUserId:', err)
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#2e1a1a' }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse" aria-hidden="true">🌅</div>
          <p className="text-white/60 text-sm">A carregar...</p>
        </div>
      </div>
    )
  }

  return <AICoach eco="aurora" userId={userId} personality={AURORA_PERSONALITY} />
}
