import React, { useState, useEffect } from 'react'
import AICoach from '../shared/AICoach'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { g } from '../../utils/genero'

/**
 * VENTIS — Coach IA de Energia & Ritmo
 * Personalidade: gentil, ritmica, como uma brisa
 * Foco em sustentabilidade, nao performance
 * Chakra Anahata — elemento ar
 */

const getVentisPersonality = () => ({
  name: 'Ventis',
  greeting: 'Ola... respira fundo. Como esta a tua energia hoje? Estou aqui para te ajudar a encontrar o teu ritmo.',
  tone: 'gentle',
  quickPrompts: [
    'Estou sem energia nenhuma',
    'Acho que estou em burnout',
    'Nao consigo dormir bem',
    'Preciso de criar uma rotina',
    'Quero conectar-me com a natureza',
    'Como encontrar o meu ritmo?'
  ],
  keywords: {
    cansaco: ['cansaco', 'cansada', 'cansado', 'exausta', 'exausto', 'esgotada', 'esgotado', 'sem energia', 'sem forca'],
    burnout: ['burnout', 'burn out', 'esgotamento', 'nao aguento', 'demais', 'sobrecarregada', 'sobrecarregado', 'limite'],
    insonia: ['insonia', 'dormir', 'sono', 'acordar', 'noite', 'descanso', 'descansar', 'repouso'],
    energia: ['energia', 'vitalidade', 'disposicao', 'animada', 'animado', 'activa', 'activo', 'forca'],
    rotina: ['rotina', 'habito', 'ritual', 'manha', 'noite', 'diario', 'consistencia', 'ritmo'],
    natureza: ['natureza', 'ar livre', 'sol', 'terra', 'arvore', 'mar', 'rio', 'plantas', 'jardim'],
    movimento: ['movimento', 'exercicio', 'yoga', 'caminhada', 'danca', 'corpo', 'alongar', 'mover'],
    pausa: ['pausa', 'parar', 'descansar', 'intervalo', 'respirar', 'calma', 'silencio', 'abrandar']
  },
  responses: {
    cansaco: [
      'O cansaco e o corpo a pedir-te para abrandar. Nao e fraqueza — e sabedoria do corpo. Antes de procurar mais energia, pergunta: onde a estou a gastar? As vezes o problema nao e falta de energia — e excesso de drenagem.',
      'Sinto o teu cansaco. O corpo nao mente. Quando a energia desce assim, o primeiro passo nao e fazer mais — e fazer menos. Consegues identificar uma coisa que podes tirar do teu dia de hoje?',
      'O cansaco tem camadas. Ha o cansaco fisico, o emocional e o de alma. Qual deles sentes mais? O fisico pede descanso, o emocional pede espaco, o de alma pede sentido. Nao apresses. Encontra o teu ritmo.'
    ],
    burnout: [
      `O burnout nao e um sinal de que es ${g('fraco', 'fraca')} — e um sinal de que foste forte durante demasiado tempo sem pausa. O teu corpo esta a pedir-te para parar. Nao amanha. Agora. Consegues dar-te 10 minutos de nada?`,
      'Quando o corpo chega ao limite, ja ultrapassaste a linha ha muito tempo. O burnout e o alarme final. Nao o ignores. O que e que podes soltar esta semana? Nem tudo e urgente. Nem tudo e teu.',
      'Reconhecer o burnout ja e um acto de coragem. Muitas pessoas so param quando o corpo as obriga. Tu estas a ouvir. Respira. O ritmo sustentavel nao e lento — e inteligente. Vamos encontrar o teu.'
    ],
    insonia: [
      'O sono e o ritual mais sagrado do corpo. Quando nao vem, e porque algo precisa de ser ouvido. Como estao as tuas noites? Tens um ritual de desligar — ou vais da accao directa para a cama?',
      'A insonia muitas vezes e a mente a recusar descansar porque sente que ainda ha coisas por resolver. Que tal um ritual nocturno simples? 30 minutos antes de dormir: sem ecra, luz suave, 3 respiracoes profundas.',
      'O corpo precisa de transicao — nao consegue saltar da agitacao para o sono. Cria uma ponte: cha quente, alongamentos suaves, escrever 3 coisas do dia. O corpo aprende rituais. Ele vai lembrar-se.'
    ],
    energia: [
      'A energia nao e infinita — e ciclica. Tens picos e vales naturais ao longo do dia. O segredo nao e ter mais energia — e usa-la nos momentos certos. Ja reparaste quando tens mais energia? Manha, tarde, noite?',
      'Que bom que queres cuidar da tua energia! A energia sustentavel vem de tres fontes: descanso de qualidade, movimento suave e conexao com o que te da sentido. Qual destas tres sentes que precisa de atencao?',
      'A energia e como o vento — vai e vem. Em vez de a forcares, surfeia-a. Nos picos, faz o que exige mais. Nos vales, descansa sem culpa. O ritmo natural e o mais sustentavel que existe.'
    ],
    rotina: [
      'As rotinas sao ancora — dao estrutura ao dia sem roubar liberdade. Mas nao precisam de ser rigidas. Comeca com um so ritual: uma coisa que fazes todos os dias, no mesmo momento. Pode ser simples como um cha consciente.',
      'A melhor rotina e a que respeita o teu ritmo, nao a que imita o de outra pessoa. Es mais da manha ou da noite? Precisas de silencio ou movimento para comecar? Cria a rotina a tua medida.',
      'Rotinas nao sao prisoes — sao raizes. Permitem-te crescer porque dao estabilidade. Nao tentes mudar tudo de uma vez. Uma micro-rotina de 5 minutos e mais poderosa do que um plano perfeito que nunca fazes.'
    ],
    natureza: [
      'A natureza e o ritmo original. Quando te conectas com ela, o corpo lembra-se do seu proprio ritmo. Nao precisa de ser uma aventura — basta descalcar os pes na relva, olhar o ceu, sentir o vento. 5 minutos bastam.',
      'A natureza nao tem pressa e tudo floresce. Quando foi a ultima vez que paraste para ouvir os passaros? Sentir o sol na pele? Tocar numa arvore? A conexao com a natureza e um reset energetico profundo.',
      'O ar, o sol, a terra — sao fontes de energia gratuitas e infinitas. Tenta incluir um momento de natureza no teu dia. Nem que seja abrir a janela e respirar fundo. O teu corpo e natureza — ele reconhece a chamada.'
    ],
    movimento: [
      'O movimento nao precisa de ser intenso para ser transformador. As vezes o que o corpo pede e suavidade — um alongamento, uma caminhada lenta, uma danca sem passos. Move-te como o corpo quiser, nao como a mente acha que deve ser.',
      'O corpo foi feito para se mover — mas ao seu ritmo. Nao ao ritmo de um relogio ou de uma meta. Hoje, que tipo de movimento te apetece? Suave como brisa ou intenso como tempestade? Os dois sao validos.',
      'Movimento e energia em accao. Quando a energia estagna, o corpo pede movimento. Nao importa o tipo — importa a intencao. 5 minutos de movimento consciente valem mais que 1 hora de exercicio forcado.'
    ],
    pausa: [
      'A pausa nao e o oposto de produtividade — e o que a torna sustentavel. Sem pausas, o corpo colapsa. Com pausas, o corpo regenera. Quando foi a tua ultima pausa real? Sem telemovel, sem pensar, so estar.',
      'Parar e um acto revolucionario num mundo que glorifica a pressa. Uma micro-pausa de 2 minutos pode mudar o teu dia inteiro. Fecha os olhos. 3 respiracoes. Sente os pes no chao. Ja esta.',
      'As pausas sao como o espaco entre as notas na musica — sem elas, nao ha melodia. O teu dia precisa de pausas para ter ritmo. Tenta programar 3 micro-pausas: manha, almoco e tarde. O corpo agradece.'
    ]
  },
  genericResponses: [
    `${g('Obrigado', 'Obrigada')} por partilhares. A energia e como o vento — muda, flui, transforma-se. O importante e estares ${g('atento', 'atenta')} ao teu ritmo. O que sentes que o teu corpo precisa agora?`,
    'Entendo. Lembra-te: nao precisas de correr para avancar. As vezes o passo mais inteligente e abrandar. Como esta o teu ritmo hoje?',
    'Isso e importante. O teu corpo sabe coisas que a mente ainda nao ouviu. Para um momento, respira fundo, e pergunta: o que preciso agora? A resposta pode surpreender-te.',
    'Estou aqui contigo, ao ritmo do vento. Sem pressa, sem julgamento. Que tal registares como esta a tua energia agora? O simples acto de notar ja e cuidar.',
    'A vida tem estacoes — e tu tambem. Ha dias de brisa suave e dias de tempestade. Ambos fazem parte. Nao apresses. Encontra o teu ritmo. Ele ja esta dentro de ti.'
  ]
})

export default function ChatVentis() {
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
        console.error('ChatVentis loadUserId:', err)
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a2e24' }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse" aria-hidden="true">🍃</div>
          <p className="text-white/60 text-sm">A carregar...</p>
        </div>
      </div>
    )
  }

  return <AICoach eco="ventis" userId={userId} personality={getVentisPersonality()} />
}
