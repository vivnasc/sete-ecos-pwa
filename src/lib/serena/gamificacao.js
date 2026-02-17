/**
 * SERENA — Sistema de Gamificação
 * Moeda: Gotas 💧
 * Níveis: Nascente → Riacho → Rio → Oceano
 */

export const SERENA_GAMIFICATION = {
  currency: { name: 'Gotas', icon: '💧', plural: 'Gotas' },
  levels: [
    { name: 'Nascente', threshold: 0, icon: '🫧' },
    { name: 'Riacho', threshold: 50, icon: '💦' },
    { name: 'Rio', threshold: 200, icon: '🌊' },
    { name: 'Oceano', threshold: 500, icon: '🌏' }
  ],
  badges: [
    {
      id: 'primeira_lagrima',
      name: 'Primeira Lágrima',
      description: 'Registar a primeira emoção',
      icon: '😢',
      condition: (data) => (data.emocoes_total || 0) >= 1
    },
    {
      id: 'fluxo_7dias',
      name: '7 Dias de Fluxo',
      description: 'Check-in emocional 7 dias seguidos',
      icon: '🌊',
      condition: (data) => (data.streak_dias || 0) >= 7
    },
    {
      id: 'respiracao_mestre',
      name: 'Respiração Consciente',
      description: 'Completar 10 sessões de respiração',
      icon: '🫁',
      condition: (data) => (data.respiracoes_total || 0) >= 10
    },
    {
      id: 'ritual_libertacao',
      name: 'Ritual de Libertação',
      description: 'Completar o primeiro ritual',
      icon: '🔓',
      condition: (data) => (data.rituais_total || 0) >= 1
    },
    {
      id: 'explorador_emocoes',
      name: 'Explorador de Emoções',
      description: 'Registar 5 emoções diferentes',
      icon: '🎨',
      condition: (data) => (data.emocoes_unicas || 0) >= 5
    },
    {
      id: 'sos_usado',
      name: 'Ancora no Momento',
      description: 'Usar o SOS Emocional pela primeira vez',
      icon: '⚓',
      condition: (data) => (data.sos_usado || false)
    },
    {
      id: 'praticas_10',
      name: 'Fluir com Água',
      description: 'Completar 10 praticas de fluidez',
      icon: '💧',
      condition: (data) => (data.praticas_total || 0) >= 10
    },
    {
      id: 'oceano_interior',
      name: 'Oceano Interior',
      description: 'Alcançar o nível Oceano',
      icon: '🌏',
      condition: (data) => (data.gotas_total || 0) >= 500
    }
  ],
  actions: {
    log_emotion: 5,
    breathing_session: 10,
    ritual: 15,
    practice: 8,
    checkin: 3,
    sos_used: 5,
    reflection: 7
  }
}

/**
 * Lista de emoções disponíveis na roda emocional
 */
export const EMOCOES = [
  { value: 'alegria', label: 'Alegria', icon: '😊', cor: '#FFD700' },
  { value: 'tristeza', label: 'Tristeza', icon: '😢', cor: '#4A90A4' },
  { value: 'raiva', label: 'Raiva', icon: '😠', cor: '#C1634A' },
  { value: 'medo', label: 'Medo', icon: '😨', cor: '#8B7BA5' },
  { value: 'ansiedade', label: 'Ansiedade', icon: '😰', cor: '#C4A265' },
  { value: 'calma', label: 'Calma', icon: '😌', cor: '#5D9B84' },
  { value: 'cansaco', label: 'Cansaço', icon: '😴', cor: '#6B5C4C' },
  { value: 'motivacao', label: 'Motivação', icon: '💪', cor: '#7C8B6F' },
  { value: 'vazio', label: 'Vazio', icon: '😶', cor: '#9E9E9E' },
  { value: 'gratidao', label: 'Gratidão', icon: '🙏', cor: '#E8B4B8' },
  { value: 'confusao', label: 'Confusão', icon: '😵‍💫', cor: '#B39DDB' },
  { value: 'esperanca', label: 'Esperança', icon: '🌟', cor: '#81C784' },
  { value: 'vergonha', label: 'Vergonha', icon: '😳', cor: '#CE93D8' },
  { value: 'culpa', label: 'Culpa', icon: '😔', cor: '#A1887F' },
  { value: 'solidao', label: 'Solidão', icon: '🥺', cor: '#78909C' },
  { value: 'amor', label: 'Amor', icon: '💕', cor: '#E57373' }
]

/**
 * Zonas do corpo para mapeamento de emoções
 */
export const CORPO_ZONAS = [
  { value: 'cabeca', label: 'Cabeça', icon: '🧠' },
  { value: 'garganta', label: 'Garganta', icon: '🗣️' },
  { value: 'peito', label: 'Peito', icon: '💗' },
  { value: 'estomago', label: 'Estômago', icon: '🫄' },
  { value: 'maos', label: 'Mãos', icon: '🤲' },
  { value: 'pernas', label: 'Pernas', icon: '🦵' },
  { value: 'corpo_todo', label: 'Corpo todo', icon: '🧍' },
  { value: 'nenhum', label: 'Não sinto no corpo', icon: '❓' }
]

/**
 * Técnicas de respiração
 */
export const TECNICAS_RESPIRACAO = [
  {
    id: '4-7-8',
    nome: 'Respiração 4-7-8',
    descricao: 'Inspira 4s, segura 7s, expira 8s. Acalma o sistema nervoso.',
    passos: [
      { accao: 'inspira', duracao: 4 },
      { accao: 'segura', duracao: 7 },
      { accao: 'expira', duracao: 8 }
    ],
    ciclos: 4,
    para: 'ansiedade, insónia'
  },
  {
    id: 'box',
    nome: 'Respiração Box',
    descricao: 'Inspira 4s, segura 4s, expira 4s, segura 4s. Equilibra.',
    passos: [
      { accao: 'inspira', duracao: 4 },
      { accao: 'segura', duracao: 4 },
      { accao: 'expira', duracao: 4 },
      { accao: 'segura', duracao: 4 }
    ],
    ciclos: 4,
    para: 'stress, foco'
  },
  {
    id: 'oceanica',
    nome: 'Respiração Oceânica',
    descricao: 'Inspira lentamente pelo nariz, expira pela boca como ondas do mar.',
    passos: [
      { accao: 'inspira', duracao: 5 },
      { accao: 'expira', duracao: 7 }
    ],
    ciclos: 6,
    para: 'calma, presença'
  },
  {
    id: 'suspiro',
    nome: 'Suspiro Fisiológico',
    descricao: 'Duas inspirações curtas pelo nariz + expiração longa. O reset mais rápido.',
    passos: [
      { accao: 'inspira', duracao: 2 },
      { accao: 'inspira', duracao: 1 },
      { accao: 'expira', duracao: 6 }
    ],
    ciclos: 3,
    para: 'pânico, emergência'
  },
  {
    id: 'alternada',
    nome: 'Respiração Alternada',
    descricao: 'Alterna entre narinas. Equilibra hemisférios cerebrais.',
    passos: [
      { accao: 'inspira (narina esquerda)', duracao: 4 },
      { accao: 'segura', duracao: 2 },
      { accao: 'expira (narina direita)', duracao: 4 },
      { accao: 'inspira (narina direita)', duracao: 4 },
      { accao: 'segura', duracao: 2 },
      { accao: 'expira (narina esquerda)', duracao: 4 }
    ],
    ciclos: 3,
    para: 'equilíbrio, clareza'
  },
  {
    id: 'coerencia',
    nome: 'Coerência Cardíaca',
    descricao: 'Inspira 5s, expira 5s. 6 respirações por minuto = coerência.',
    passos: [
      { accao: 'inspira', duracao: 5 },
      { accao: 'expira', duracao: 5 }
    ],
    ciclos: 6,
    para: 'regulação emocional, coerência'
  }
]

/**
 * Práticas de fluidez (elemento água)
 */
export const PRATICAS_FLUIDEZ = [
  // Nivel 1: Iniciante
  { id: 'agua_intencao', nivel: 1, nome: 'Beber água com intenção', descricao: 'Bebe um copo de água devagar, sentindo cada gole. Sem pressa.', duracao: '2 min' },
  { id: 'banho_consciente', nivel: 1, nome: 'Banho consciente', descricao: 'No banho, sente a água no corpo. Imagina que lava o que já não precisas.', duracao: '5 min' },
  { id: 'observar_agua', nivel: 1, nome: 'Observar água', descricao: 'Olha para água a correr (torneira, rio, chuva). Deixa a mente fluir.', duracao: '3 min' },
  { id: 'lagrimas_permitidas', nivel: 1, nome: 'Lágrimas permitidas', descricao: 'Se precisares de chorar, chora. Sem julgar. A água limpa.', duracao: 'quanto precisar' },
  { id: 'mao_na_agua', nivel: 1, nome: 'Mão na água', descricao: 'Coloca as mãos em água morna. Sente a temperatura. Respira.', duracao: '3 min' },

  // Nível 2: Intermédio
  { id: 'fluir_mudanca', nivel: 2, nome: 'Fluir com a mudança', descricao: 'Identifica algo que resistes. Pergunta: "E se eu deixasse fluir?"', duracao: '5 min' },
  { id: 'escrita_fluida', nivel: 2, nome: 'Escrita fluida', descricao: 'Escreve sem parar 5 minutos. Sem editar, sem julgar. Deixa sair.', duracao: '5 min' },
  { id: 'movimento_agua', nivel: 2, nome: 'Movimento de água', descricao: 'Move o corpo como água: suave, ondulante, sem rigidez. Sem certo ou errado.', duracao: '5 min' },
  { id: 'soltar_controlo', nivel: 2, nome: 'Soltar o controlo', descricao: 'Escolhe UMA coisa que tentas controlar. Deixa-a ser como e, so por hoje.', duracao: '1 min' },
  { id: 'compaixao_silenciosa', nivel: 2, nome: 'Compaixão silenciosa', descricao: 'Coloca a mão no peito. Diz em silêncio: "Isto é difícil, e eu estou aqui."', duracao: '2 min' },

  // Nível 3: Avançado
  { id: 'ritual_chuva', nivel: 3, nome: 'Ritual de chuva', descricao: 'Se chover, sai à chuva (ou imagina). Sente a purificação. Solta.', duracao: '10 min' },
  { id: 'carta_ao_rio', nivel: 3, nome: 'Carta ao rio', descricao: 'Escreve o que queres soltar num papel. Imagina que o rio leva embora.', duracao: '10 min' },
  { id: 'silencio_liquido', nivel: 3, nome: 'Silêncio líquido', descricao: '10 minutos em silêncio. Observa os pensamentos como bolhas que sobem e rebentam.', duracao: '10 min' },
  { id: 'reconciliacao', nivel: 3, nome: 'Reconciliação interna', descricao: 'Conversa internamente com uma parte de ti que tem estado em conflito.', duracao: '15 min' },
  { id: 'oceano_interior', nivel: 3, nome: 'Oceano interior', descricao: 'Meditação: imagina que dentro de ti há um oceano. Mergulha. O que encontras?', duracao: '15 min' }
]
