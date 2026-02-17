/**
 * IGNIS — Sistema de Gamificacao
 * Moeda: Chamas 🔥
 * Niveis: Faisca → Brasa → Chama → Fogueira
 */

export const IGNIS_GAMIFICATION = {
  currency: { name: 'Chamas', icon: '🔥', plural: 'Chamas' },
  levels: [
    { name: 'Faisca', threshold: 0, icon: '✨' },
    { name: 'Brasa', threshold: 50, icon: '🟠' },
    { name: 'Chama', threshold: 200, icon: '🔥' },
    { name: 'Fogueira', threshold: 500, icon: '🏔️' }
  ],
  badges: [
    {
      id: 'primeiro_nao',
      name: 'Primeiro Nao',
      description: 'Registar a primeira dispersao cortada',
      icon: '✋',
      condition: (data) => (data.dispersoes_cortadas || 0) >= 1
    },
    {
      id: 'semana_alinhada',
      name: 'Semana Alinhada',
      description: '7 dias consecutivos de escolhas conscientes',
      icon: '🎯',
      condition: (data) => (data.streak_dias || 0) >= 7
    },
    {
      id: 'bussola_definida',
      name: 'Bussola Interior',
      description: 'Definir os 5 valores essenciais',
      icon: '🧭',
      condition: (data) => (data.valores_definidos || false)
    },
    {
      id: 'foco_10',
      name: 'Foco de Ferro',
      description: 'Completar 10 sessoes de foco consciente',
      icon: '⚔️',
      condition: (data) => (data.foco_total || 0) >= 10
    },
    {
      id: 'corte_semanal',
      name: 'Corte Consciente',
      description: 'Completar o primeiro exercicio de corte',
      icon: '🗡️',
      condition: (data) => (data.cortes_total || 0) >= 1
    },
    {
      id: 'conquistas_30',
      name: 'Coleccao de Vitorias',
      description: 'Registar 30 conquistas alinhadas',
      icon: '🏆',
      condition: (data) => (data.conquistas_total || 0) >= 30
    },
    {
      id: 'desafio_coragem',
      name: 'Coragem em Accao',
      description: 'Completar 5 desafios de coragem',
      icon: '🦁',
      condition: (data) => (data.desafios_coragem || 0) >= 5
    },
    {
      id: 'fogueira_interior',
      name: 'Fogueira Interior',
      description: 'Alcancar o nivel Fogueira',
      icon: '🏔️',
      condition: (data) => (data.chamas_total || 0) >= 500
    }
  ],
  actions: {
    escolha_consciente: 5,
    foco_session: 10,
    dispersao_registada: 3,
    corte_semanal: 15,
    conquista_registada: 5,
    desafio_completado: 12,
    review_nocturno: 7,
    valor_definido: 8,
    plano_criado: 10
  }
}

/**
 * Desafios de Fogo — 4 categorias
 */
export const DESAFIOS_FOGO = [
  // Coragem
  {
    id: 'coragem_1', categoria: 'coragem', nome: 'Dizer nao a um pedido',
    descricao: 'Identifica algo que te pediram e que nao queres fazer. Diz "nao" com clareza e sem culpa.',
    duracao: '1 dia'
  },
  {
    id: 'coragem_2', categoria: 'coragem', nome: 'Conversa adiada',
    descricao: 'Tem aquela conversa que andas a adiar. Nao precisa de ser perfeita — precisa de ser honesta.',
    duracao: '1 dia'
  },
  {
    id: 'coragem_3', categoria: 'coragem', nome: 'Pedir o que precisas',
    descricao: 'Pede algo que precisas a alguem. Sem rodeios, sem desculpas. Um pedido claro.',
    duracao: '1 dia'
  },
  {
    id: 'coragem_4', categoria: 'coragem', nome: 'Partilhar uma verdade',
    descricao: 'Partilha uma verdade tua com alguem de confianca. Algo que normalmente escondes.',
    duracao: '1 dia'
  },

  // Corte
  {
    id: 'corte_1', categoria: 'corte', nome: '24h sem redes sociais',
    descricao: 'Um dia inteiro sem redes sociais. Observa o que surge no espaco que se abre.',
    duracao: '1 dia'
  },
  {
    id: 'corte_2', categoria: 'corte', nome: 'Cancelar um compromisso',
    descricao: 'Cancela um compromisso que aceitaste por obrigacao, nao por desejo. Sem mentir.',
    duracao: '1 dia'
  },
  {
    id: 'corte_3', categoria: 'corte', nome: 'Dia sem noticias',
    descricao: 'Passa o dia sem consumir noticias. Observa se o mundo continua sem tu saberes tudo.',
    duracao: '1 dia'
  },
  {
    id: 'corte_4', categoria: 'corte', nome: 'Dizer "nao sei" sem vergonha',
    descricao: 'Da proxima vez que nao souberes algo, diz "nao sei" em vez de inventar ou desviar.',
    duracao: '1 dia'
  },

  // Alinhamento
  {
    id: 'alinhamento_1', categoria: 'alinhamento', nome: 'Dia dos teus valores',
    descricao: 'Cada decisao de hoje passa pelo filtro: "Isto alinha com os meus valores?"',
    duracao: '1 dia'
  },
  {
    id: 'alinhamento_2', categoria: 'alinhamento', nome: 'Manha sem automatismo',
    descricao: 'Amanha de manha, faz tudo com intencao. Cada gesto e uma escolha, nao um habito.',
    duracao: '1 manha'
  },
  {
    id: 'alinhamento_3', categoria: 'alinhamento', nome: 'Refeicao consciente',
    descricao: 'Faz uma refeicao inteira sem telemovel, sem distraccoes. So tu e a comida.',
    duracao: '1 refeicao'
  },
  {
    id: 'alinhamento_4', categoria: 'alinhamento', nome: 'Carta aos teus valores',
    descricao: 'Escreve uma carta aos teus 5 valores. Conta-lhes como tens vivido por eles.',
    duracao: '15 min'
  },

  // Iniciativa Propria
  {
    id: 'iniciativa_1', categoria: 'iniciativa', nome: 'Fazer algo so para ti',
    descricao: 'Faz uma coisa hoje que nao serve ninguem a nao ser tu. Sem justificar.',
    duracao: '1 dia'
  },
  {
    id: 'iniciativa_2', categoria: 'iniciativa', nome: 'Comecar o que adias',
    descricao: 'Aquele projecto que adias ha semanas. Nao precisas de o acabar — so de comecar. 15 minutos.',
    duracao: '15 min'
  },
  {
    id: 'iniciativa_3', categoria: 'iniciativa', nome: 'Decidir sem consultar',
    descricao: 'Toma uma decisao pequena hoje sem pedir opiniao a ninguem. Confia em ti.',
    duracao: '1 dia'
  },
  {
    id: 'iniciativa_4', categoria: 'iniciativa', nome: 'Celebrar-te em voz alta',
    descricao: 'Diz em voz alta 3 coisas que fizeste bem esta semana. Sem minimizar.',
    duracao: '5 min'
  }
]

/**
 * Categorias dos desafios
 */
export const CATEGORIAS_DESAFIOS = [
  { id: 'coragem', nome: 'Coragem', icon: '🦁', cor: '#C1634A', descricao: 'Enfrentar o que evitas' },
  { id: 'corte', nome: 'Corte', icon: '🗡️', cor: '#8B4513', descricao: 'Soltar o que nao e teu' },
  { id: 'alinhamento', nome: 'Alinhamento', icon: '🎯', cor: '#D4A017', descricao: 'Viver pelos teus valores' },
  { id: 'iniciativa', nome: 'Iniciativa', icon: '🚀', cor: '#E87040', descricao: 'Agir por vontade propria' }
]
