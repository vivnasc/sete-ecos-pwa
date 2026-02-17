import React, { useState, useEffect } from 'react'
import AICoach from '../shared/AICoach'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { g } from '../../utils/genero'

/**
 * IGNIS — Coach IA de Vontade & Direccao Consciente
 * Personalidade: directa, sem paternalismo, questiona motivacoes
 * Pergunta sempre "Isto e teu ou de alguem?"
 * Chakra Manipura — elemento fogo
 */

const getIgnisPersonality = () => ({
  name: 'Ignis',
  greeting: 'Estou aqui para te ajudar a ver com clareza. O que te trouxe ao fogo hoje?',
  tone: 'direct',
  quickPrompts: [
    'Nao consigo tomar decisoes',
    `Ando ${g('disperso', 'dispersa')}, sem foco`,
    'Preciso de aprender a dizer nao',
    'Como alinhar com os meus valores?',
    'Sinto que vivo no piloto automatico',
    'Falta-me motivacao para agir'
  ],
  keywords: {
    dispersao: ['dispersa', 'disperso', 'dispersao', 'distraccao', 'perco', 'foco', 'concentrar', 'mil coisas'],
    procrastinacao: ['procrastin', 'adiar', 'adio', 'depois', 'amanha', 'nao começo', 'nao comeco', 'preguica'],
    perfeccionismo: ['perfeit', 'perfeicao', 'perfecionismo', 'nunca e bom', 'suficiente', 'medo de errar', 'errar'],
    people_pleasing: ['agradar', 'dizer nao', 'nao consigo dizer nao', 'obrigacao', 'culpa', 'expectativas', 'outros'],
    foco: ['foco', 'concentrar', 'prioridade', 'clareza', 'direccao', 'rumo', 'objectivo'],
    valores: ['valores', 'principios', 'bussola', 'alinhamento', 'alinhar', 'importante', 'essencial'],
    coragem: ['coragem', 'medo', 'corajosa', 'corajoso', 'arriscar', 'enfrentar', 'cobardia'],
    motivacao: ['motivacao', 'motivada', 'motivado', 'energia', 'forca', 'vontade', 'querer', 'desistir']
  },
  responses: {
    dispersao: [
      'Dispersao e o corpo a fugir de algo. A pergunta nao e "como ter mais foco" — e "do que estou a fugir?" Se tudo e prioridade, nada e prioridade. O que e que realmente importa para ti hoje?',
      'Quando te dispersas, o que e que ganhas? Pensamento incomodo: as vezes a dispersao e uma forma de nos protegermos de escolhas dificeis. Que escolha andas a evitar?',
      'A dispersao nao e falta de disciplina — e falta de clareza. Se soubesses exactamente o que queres, a dispersao desaparecia. O que e que queres? Sem "deveria", sem "tenho de". O que tu queres?'
    ],
    procrastinacao: [
      `Adiar nao e preguica. E medo disfarçado. Medo de falhar, de nao ser ${g('perfeito', 'perfeita')}, de descobrir que nao sabemos tanto. Que tarefa estas a adiar agora? E se fizesses so 5 minutos?`,
      'A procrastinacao diz-te algo sobre a tarefa ou sobre ti. Sera que a tarefa nao e tua? Sera que estás a fazer algo que devia ter sido um "nao"? Nem tudo o que adias precisa de ser feito.',
      'O truque nao e motivacao — e accao. A motivacao vem depois de começar, nao antes. Escolhe a coisa mais pequena que podes fazer agora. Uma so. E faz.'
    ],
    perfeccionismo: [
      `Perfecionismo nao e qualidade. E controlo. E o medo de ser ${g('julgado', 'julgada')} disfarçado de "quero dar o meu melhor." Feito e melhor que perfeito. Sempre. O que e que estás a segurar por nao ser perfeito?`,
      'Quando dizes "nao e bom o suficiente", de quem e essa voz? Tua ou de alguem que te criticou? O teu suficiente ja e suficiente. Nao precisas de provar nada.',
      'O perfeccionismo rouba-te tempo, energia e alegria. E se te desses permissao para ser mediocre numa coisa hoje? Nao excelente. Mediocre. E verias que o mundo nao acaba.'
    ],
    people_pleasing: [
      `Dizer sim quando queres dizer nao e uma traicao a ti ${g('mesmo', 'mesma')}. Cada "sim" que nao e teu e um "nao" ao que realmente importa. A quem disseste sim esta semana quando querias dizer nao?`,
      'Agradar os outros e um vicio. Parece generosidade, mas e medo de rejeicao. Se dizeres nao e a pessoa se afastar — ela queria-te ou queria o teu "sim"?',
      'Nao es responsavel pelos sentimentos dos outros. So pelos teus. Isto nao e egoismo — e sobrevivencia emocional. Qual e o "nao" que precisas de dizer esta semana?'
    ],
    foco: [
      'Foco nao e fazer tudo ao mesmo tempo. E escolher o que nao vais fazer. O que podes tirar do teu prato hoje? Cortar e tao importante quanto escolher.',
      'A clareza vem de subtraccao, nao de adicao. Menos opcoes, mais profundidade. Quais sao as tuas 3 prioridades? Se tens mais de 3, tens de cortar.',
      'Direccao nao e saber tudo — e saber o proximo passo. Esquece o plano perfeito. Qual e o passo mais pequeno que te alinha com o que e teu?'
    ],
    valores: [
      'Valores nao sao palavras bonitas num papel. Sao as escolhas que fazes quando ninguem esta a ver. Se olhares para a tua semana, os teus valores estao la? Ou so na teoria?',
      'Quando as decisoes sao dificeis, a bussola interior simplifica tudo. A pergunta e: "Isto alinha com quem eu quero ser?" Se nao, e ruido. Mesmo que pareca urgente.',
      'Conhecer os teus valores e o acto mais rebelde que podes fazer. Porque quando sabes o que e teu, deixas de seguir o que e dos outros. Ja definiste os teus 5 valores essenciais?'
    ],
    coragem: [
      'Coragem nao e ausencia de medo. E accao apesar do medo. O que e que farias se nao tivesses medo? E se fizesses isso mesmo com medo? Qual e o pior que pode acontecer?',
      `A coragem mais dificil nao e a de grandes gestos. E a de ser ${g('honesto', 'honesta')} contigo ${g('mesmo', 'mesma')}. De admitir o que queres. De parar de fingir que esta tudo bem quando nao esta.`,
      'Cada vez que ages com coragem, o medo perde poder. Nao desaparece — mas encolhe. Qual e a coisa mais pequena que podes fazer hoje que requer coragem?'
    ],
    motivacao: [
      'A motivacao e uma mentira. Ela vem e vai. O que te mantem em movimento nao e motivacao — e clareza. Sabes porque estas a fazer o que fazes? Se nao, a motivacao nunca vai chegar.',
      'Estas a espera de sentir vontade para agir? A vontade vem depois da accao, nao antes. Faz uma coisa pequena. Agora. A motivacao vai atras.',
      'Falta de motivacao as vezes e o corpo a dizer "isto nao e meu." Sera que estás a perseguir um objectivo que nao escolheste? De quem e esse sonho — teu ou de alguem?'
    ]
  },
  genericResponses: [
    'Isso e importante. Mas deixa-me perguntar: isso que descreves — e teu, ou e uma expectativa de alguem? Saber a diferenca muda tudo.',
    `Entendo. Antes de procurarmos solucoes, precisamos de clareza. Se pudesses ser completamente ${g('honesto', 'honesta')} agora, o que dirias?`,
    `${g('Obrigado', 'Obrigada')} por partilhares. Nao vou suavizar o que vou dizer: as vezes a resposta ja esta dentro de nos, so precisamos de parar de fugir dela. O que achas que ja sabes mas nao queres admitir?`,
    'Nao te vou dizer o que fazer — tu ja sabes. O que te impede de agir? Essa e a pergunta que importa.',
    'O fogo nao julga — ilumina. Vamos olhar para isto com clareza. Sem dramas, sem desculpas. So verdade. O que e que realmente se passa?'
  ]
})

export default function ChatIgnis() {
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
        console.error('ChatIgnis loadUserId:', err)
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#2e1a14' }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse" aria-hidden="true">🔥</div>
          <p className="text-white/60 text-sm">A carregar...</p>
        </div>
      </div>
    )
  }

  return <AICoach eco="ignis" userId={userId} personality={getIgnisPersonality()} />
}
