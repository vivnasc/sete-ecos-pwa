/**
 * AURORA — Sistema de Gamificação
 * Moeda: Raios de Aurora 🌅
 * Não tem níveis — é o nível final
 * Conquistas especiais de integração
 */

export const AURORA_GAMIFICATION = {
  currency: { name: 'Raios', icon: '🌅', plural: 'Raios de Aurora' },
  levels: [
    { name: 'Aurora', threshold: 0, icon: '🌅' }
  ],
  badges: [
    {
      id: 'aurora_completa',
      name: 'Aurora Completa',
      description: 'Completar a cerimónia de graduação',
      icon: '🌅',
      condition: (data) => (data.graduacao_feita || false)
    },
    {
      id: 'mentora',
      name: 'Mentora',
      description: 'Partilhar a primeira frase de sabedoria como mentora',
      icon: '🌟',
      condition: (data) => (data.mentoria_total || 0) >= 1
    },
    {
      id: 'manutencao_1_ano',
      name: '1 Ano de Manutenção',
      description: 'Manter check-ins mensais durante 12 meses',
      icon: '🏅',
      condition: (data) => (data.manutencao_meses || 0) >= 12
    },
    {
      id: 'renovacao',
      name: 'Renovação',
      description: 'Completar a primeira renovação anual',
      icon: '🔄',
      condition: (data) => (data.renovacao_feita || false)
    },
    {
      id: 'todas_dimensoes',
      name: 'Todas as Dimensões',
      description: 'Ter completado os 7 ecos',
      icon: '💫',
      condition: (data) => (data.ecos_completados || 0) >= 7
    },
    {
      id: 'ritual_30',
      name: 'Ritual Constante',
      description: '30 dias de rituais matinais Aurora',
      icon: '☀️',
      condition: (data) => (data.rituais_total || 0) >= 30
    }
  ],
  actions: {
    cerimonia_graduacao: 50,
    antes_depois_completo: 30,
    checkin_mensal: 10,
    frase_sabedoria: 8,
    ritual_matinal: 5,
    renovacao_anual: 40
  }
}

/**
 * Componentes do Ritual Matinal Aurora
 * Integra elementos de cada eco completado
 */
export const RITUAL_COMPONENTES = [
  {
    id: 'respiracao',
    eco: 'serena',
    nome: 'Respiração Consciente',
    icon: '💧',
    cor: '#6B8E9B',
    duracao_min: 3,
    instrucao: 'Respira fundo 3 vezes. Inspira pelo nariz, expira pela boca. Sente o corpo a acalmar.'
  },
  {
    id: 'movimento',
    eco: 'ventis',
    nome: 'Movimento Gentil',
    icon: '🍃',
    cor: '#5D9B84',
    duracao_min: 3,
    instrucao: 'Espreguiça o corpo inteiro. Roda os ombros. Mexe-te como o teu corpo pedir.'
  },
  {
    id: 'emocao',
    eco: 'serena',
    nome: 'Check-in Emocional',
    icon: '🌊',
    cor: '#6B8E9B',
    duracao_min: 2,
    instrucao: 'Como te sentes agora? Dá um nome à emoção. Sem julgar, só observar.'
  },
  {
    id: 'afirmacao',
    eco: 'ecoa',
    nome: 'Afirmação de Voz',
    icon: '🔊',
    cor: '#4A90A4',
    duracao_min: 2,
    instrucao: 'Diz em voz alta: "Hoje escolho ser eu. A minha voz importa. Eu importo."'
  },
  {
    id: 'escolha',
    eco: 'ignis',
    nome: 'Escolha Consciente',
    icon: '🔥',
    cor: '#C1634A',
    duracao_min: 2,
    instrucao: 'Qual é a tua única prioridade hoje? Uma só. Compromete-te com ela.'
  },
  {
    id: 'valor',
    eco: 'aurea',
    nome: 'Reconhecer o teu Valor',
    icon: '✨',
    cor: '#C4A265',
    duracao_min: 2,
    instrucao: 'Nomeia uma qualidade tua. Algo que fazes bem. Reconhece-te.'
  },
  {
    id: 'essencia',
    eco: 'imago',
    nome: 'Conectar com a Essência',
    icon: '⭐',
    cor: '#8B7BA5',
    duracao_min: 2,
    instrucao: 'Quem és tu hoje? Não o que fazes — quem és. Permanece nessa verdade.'
  }
]

/**
 * Perguntas para o Antes vs Depois narrativo
 */
export const ANTES_DEPOIS_PERGUNTAS = {
  quem_eras: {
    titulo: 'Quem eras quando começaste?',
    prompt: 'Recorda a pessoa que eras antes de começar esta jornada. O que sentias? O que evitavas? O que te faltava?'
  },
  que_feridas: {
    titulo: 'Que feridas carregavas?',
    prompt: 'Que dores, padrões ou máscaras trazias contigo? O que te pesava?'
  },
  o_que_soltaste: {
    titulo: 'O que soltaste?',
    prompt: 'O que deixaste ir ao longo desta jornada? Que pesos largaste?'
  },
  quem_es_agora: {
    titulo: 'Quem és agora?',
    prompt: 'Olha para ti agora. O que mudou? O que ganhaste? Quem te tornaste?'
  }
}

/**
 * Alertas de regressão de padrões (para Modo Manutenção)
 */
export const PADROES_ALERTA = [
  { id: 'emocoes_negativas', eco: 'serena', sinal: 'Aumento de emoções negativas consecutivas', accao: 'Voltar ao Diário Emocional e SOS' },
  { id: 'energia_baixa', eco: 'ventis', sinal: 'Energia consistentemente baixa (5+ dias)', accao: 'Rever rotinas e pausas no Ventis' },
  { id: 'silenciamento', eco: 'ecoa', sinal: 'Evitar expressar-se ou calar-se', accao: 'Retomar exercícios de micro-voz' },
  { id: 'dispersao', eco: 'ignis', sinal: 'Dificuldade em manter foco e decisões', accao: 'Voltar às escolhas conscientes' },
  { id: 'desvalorizacao', eco: 'aurea', sinal: 'Pensamentos de auto-desvalorização', accao: 'Retomar diário de merecimento' },
  { id: 'desconexao', eco: 'imago', sinal: 'Sentir-se perdida ou desconectada de si', accao: 'Revisitar o Espelho Triplo' }
]
