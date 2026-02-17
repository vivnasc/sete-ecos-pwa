/**
 * IMAGO — Sistema de Gamificacao
 * Moeda: Estrelas ⭐
 * Niveis: Reflexo → Clareza → Sabedoria → Luminosidade
 */

export const IMAGO_GAMIFICATION = {
  currency: { name: 'Estrelas', icon: '⭐', plural: 'Estrelas' },
  levels: [
    { name: 'Reflexo', threshold: 0, icon: '🪞' },
    { name: 'Clareza', threshold: 50, icon: '💎' },
    { name: 'Sabedoria', threshold: 200, icon: '🦉' },
    { name: 'Luminosidade', threshold: 500, icon: '✨' }
  ],
  badges: [
    {
      id: 'primeiro_reflexo',
      name: 'Primeiro Reflexo',
      description: 'Completar o Espelho Triplo pela primeira vez',
      icon: '🪞',
      condition: (data) => (data.espelho_completado || false)
    },
    {
      id: 'mascara_reconhecida',
      name: 'Mascara Reconhecida',
      description: 'Identificar 3 mascaras no Espelho Triplo',
      icon: '🎭',
      condition: (data) => (data.mascaras_total || 0) >= 3
    },
    {
      id: 'valores_definidos',
      name: 'Valores Definidos',
      description: 'Completar a seleccao dos 3 valores essenciais',
      icon: '💠',
      condition: (data) => (data.valores_definidos || false)
    },
    {
      id: 'arqueologia_profunda',
      name: 'Arqueologia Profunda',
      description: 'Fazer 5 escavacoes de identidade',
      icon: '⛏️',
      condition: (data) => (data.arqueologia_total || 0) >= 5
    },
    {
      id: 'nomeacao_sagrada',
      name: 'Nomeacao Sagrada',
      description: 'Completar o primeiro ritual de auto-nomeacao',
      icon: '📜',
      condition: (data) => (data.nomeacao_feita || false)
    },
    {
      id: 'meditacao_essencia',
      name: 'Essencia Meditada',
      description: 'Completar 10 meditacoes de essencia',
      icon: '🧘',
      condition: (data) => (data.meditacoes_total || 0) >= 10
    },
    {
      id: 'integrador',
      name: 'Integrador de Ecos',
      description: 'Registar insights de integracao entre 3 ecos diferentes',
      icon: '🌀',
      condition: (data) => (data.integracoes_total || 0) >= 3
    },
    {
      id: 'jornada_completa',
      name: 'Jornada Completa',
      description: 'Alcancar o nivel Luminosidade',
      icon: '✨',
      condition: (data) => (data.estrelas_total || 0) >= 500
    }
  ],
  actions: {
    espelho_triplo: 15,
    arqueologia_sessao: 10,
    nomeacao: 12,
    mapa_dimensao: 8,
    valor_reflexao: 7,
    roupa_reflexao: 5,
    meditacao_essencia: 8,
    visao_board_update: 10,
    integracao_insight: 12,
    timeline_review: 5
  }
}

/**
 * Meditacoes de Essencia — Scripts em portugues
 */
export const MEDITACOES_ESSENCIA = [
  {
    id: 'sem_rotulos',
    nome: 'Quem sou sem rotulos?',
    descricao: 'Meditacao guiada para explorar a identidade alem de papeis e rotulos sociais.',
    duracao_min: 10,
    script: [
      'Fecha os olhos. Respira fundo tres vezes.',
      'Imagina que podes tirar todos os rotulos que carregas: mae, filha, profissional, amiga...',
      'Tira cada um, como se fossem roupas. Um a um.',
      'O que resta quando nao es nenhum desses papeis?',
      'Fica nesse espaco. Observa o que sentes.',
      'Esse espaco vazio nao e nada — e tudo. E a tua essencia.',
      'Respira nesse lugar. Ele sempre esteve aqui.',
      'Quando estiveres pronta, abre os olhos lentamente.'
    ]
  },
  {
    id: 'eu_essencial',
    nome: 'O meu eu essencial',
    descricao: 'Conectar com a versao mais autentica de si, antes das mascaras.',
    duracao_min: 12,
    script: [
      'Senta-te confortavelmente. Deixa o corpo relaxar.',
      'Imagina-te numa sala de espelhos. Cada espelho mostra uma versao tua.',
      'Num espelho, ves quem mostras ao mundo. Observa.',
      'Noutro, ves quem eras antes de aprender a esconder-te.',
      'Num terceiro, ves quem queres ser.',
      'Agora, caminha para alem dos espelhos. Ha uma porta.',
      'Atras da porta esta a versao mais real de ti. Sem filtros.',
      'Encontra-a. Olha-a nos olhos. O que te diz?',
      'Respira com essa versao de ti. Ela nunca foi embora.',
      'Quando estiveres pronta, regressa lentamente.'
    ]
  },
  {
    id: 'integracao_7_ecos',
    nome: 'Integracao dos 7 Ecos',
    descricao: 'Meditacao de integracao que percorre cada eco e unifica a experiencia.',
    duracao_min: 15,
    script: [
      'Fecha os olhos. Sente a tua base, o teu corpo. Isto e Vitalis — o chao.',
      'Sobe ao teu centro emocional. Serena — o que sentes agora?',
      'Vai ao teu centro de vontade. Ignis — o que queres realmente?',
      'Expande ao teu peito. Ventis — qual e o teu ritmo hoje?',
      'Sobe a garganta. Ecoa — que verdade precisa de ser dita?',
      'Chega ao espaco entre os olhos. O que ves com clareza?',
      'Finalmente, a coroa. Imago — quem es tu, inteira?',
      'Sente os 7 centros a vibrar juntos. Nao separados — integrados.',
      'Es uma so pessoa com muitas dimensoes. Todas sao tuas.',
      'Respira nessa inteireza. Permanece.',
      'Quando estiveres pronta, abre os olhos com suavidade.'
    ]
  },
  {
    id: 'soltar_versoes',
    nome: 'Soltar versoes antigas',
    descricao: 'Ritual meditativo para libertar identidades que ja nao servem.',
    duracao_min: 12,
    script: [
      'Respira fundo. Permite-te estar presente.',
      'Pensa numa versao tua que ja nao te serve. Pode ser a que agrada, a que se esconde, a que tem medo.',
      'Visualiza essa versao a tua frente. Olha para ela com compaixao.',
      'Diz-lhe: "Obrigada por me teres protegido. Ja nao preciso de ti assim."',
      'Observa como ela reage. Talvez sorria. Talvez chore.',
      'Abraca-a. E depois, suavemente, deixa-a ir.',
      'Observa-a a afastar-se. Nao com tristeza — com gratidao.',
      'No espaco que ela deixou, o que surge? Fica atenta.',
      'Respira. O espaco vazio e o espaco da possibilidade.',
      'Quando estiveres pronta, regressa ao presente.'
    ]
  },
  {
    id: 'corpo_identidade',
    nome: 'O corpo como identidade',
    descricao: 'Exploracao da relacao entre corpo e sentido de eu.',
    duracao_min: 8,
    script: [
      'Fecha os olhos. Traz a atencao ao teu corpo.',
      'Este corpo que te carrega. Que mudou tantas vezes.',
      'Cada cicatriz conta uma historia. Cada ruga e um mapa.',
      'O teu corpo nao e so um veiculo — e parte de quem es.',
      'Pergunta ao teu corpo: "O que sabes sobre mim que eu esqueci?"',
      'Ouve. O corpo fala em sensacoes, nao em palavras.',
      'Agradece ao teu corpo. Ele sempre soube quem es.',
      'Abre os olhos quando estiveres pronta.'
    ]
  }
]

/**
 * 50 Valores para o exercicio de seleccao progressiva
 */
export const LISTA_VALORES = [
  'Autenticidade', 'Coragem', 'Compaixao', 'Criatividade', 'Curiosidade',
  'Determinacao', 'Empatia', 'Equidade', 'Esperanca', 'Fe',
  'Generosidade', 'Gratidao', 'Honestidade', 'Humildade', 'Humor',
  'Independencia', 'Integridade', 'Intuicao', 'Justica', 'Lealdade',
  'Liberdade', 'Lideranca', 'Amor', 'Natureza', 'Optimismo',
  'Paciencia', 'Paz', 'Perseveranca', 'Presenca', 'Prosperidade',
  'Resiliencia', 'Respeito', 'Responsabilidade', 'Sabedoria', 'Saude',
  'Seguranca', 'Serenidade', 'Servico', 'Simplicidade', 'Solidariedade',
  'Sustentabilidade', 'Ternura', 'Tolerancia', 'Tradicao', 'Transparencia',
  'Unidade', 'Versatilidade', 'Visao', 'Vulnerabilidade', 'Zelo'
]

/**
 * Dimensoes do Mapa de Identidade — uma por eco
 */
export const DIMENSOES_IDENTIDADE = [
  { id: 'corpo', eco: 'vitalis', nome: 'Corpo', icon: '🌱', cor: '#7C8B6F', pergunta: 'Como habito o meu corpo?' },
  { id: 'valor', eco: 'aurea', nome: 'Valor', icon: '✨', cor: '#C4A265', pergunta: 'Qual o meu valor inerente?' },
  { id: 'emocao', eco: 'serena', nome: 'Emocao', icon: '💧', cor: '#6B8E9B', pergunta: 'Como fluo com as minhas emocoes?' },
  { id: 'vontade', eco: 'ignis', nome: 'Vontade', icon: '🔥', cor: '#C1634A', pergunta: 'O que escolho conscientemente?' },
  { id: 'energia', eco: 'ventis', nome: 'Energia', icon: '🍃', cor: '#5D9B84', pergunta: 'Qual e o meu ritmo natural?' },
  { id: 'voz', eco: 'ecoa', nome: 'Voz', icon: '🔊', cor: '#4A90A4', pergunta: 'O que preciso de dizer?' },
  { id: 'essencia', eco: 'imago', nome: 'Essencia', icon: '⭐', cor: '#8B7BA5', pergunta: 'Quem sou eu, inteira?' }
]

/**
 * Perguntas do Espelho Triplo
 */
export const ESPELHO_TRIPLO_GUIA = {
  essencia: {
    titulo: 'Quem sou realmente?',
    perguntas: [
      'Quando estou sozinha e ninguem ve, como sou?',
      'Que qualidades surgem quando nao estou a tentar impressionar?',
      'O que faco quando ninguem espera nada de mim?',
      'Que tipo de pessoa sou nos meus momentos mais honestos?'
    ]
  },
  mascara: {
    titulo: 'Quem mostro ao mundo?',
    perguntas: [
      'Que versao de mim apresento em publico?',
      'O que escondo das pessoas por medo de julgamento?',
      'Quando e que sinto que estou a "actuar" em vez de "ser"?',
      'Que mascaras uso em diferentes contextos (trabalho, familia, amigos)?'
    ]
  },
  aspiracao: {
    titulo: 'Quem quero ser?',
    perguntas: [
      'Se pudesse ser qualquer versao de mim, qual escolheria?',
      'O que me impede de ser essa pessoa agora?',
      'Que qualidades admiro nos outros que gostaria de cultivar?',
      'Daqui a 5 anos, como me vejo a viver?'
    ]
  }
}

/**
 * Categorias para Arqueologia de Si
 */
export const CAMADAS_ARQUEOLOGIA = [
  {
    id: 'infancia',
    nome: 'Infancia',
    icon: '👶',
    pergunta_central: 'Quem era eu antes de aprender a adaptar-me?',
    sub_perguntas: [
      'O que adorava fazer quando era crianca?',
      'Que sonhos tinha antes do mundo dizer "nao podes"?',
      'Que parte de mim ficou nessa idade?'
    ]
  },
  {
    id: 'adolescencia',
    nome: 'Adolescencia',
    icon: '🌸',
    pergunta_central: 'Que identidade construi para sobreviver?',
    sub_perguntas: [
      'Que mascara comecei a usar nessa fase?',
      'O que sacrifiquei para ser aceite?',
      'Que parte rebelde silenciei?'
    ]
  },
  {
    id: 'relacoes',
    nome: 'Relacoes',
    icon: '💞',
    pergunta_central: 'Quem me tornei para agradar os outros?',
    sub_perguntas: [
      'Que versao de mim criei para cada relacao importante?',
      'O que perdi de mim nas relacoes?',
      'Que identidade assumi que nao e minha?'
    ]
  },
  {
    id: 'traumas',
    nome: 'Momentos de ruptura',
    icon: '🌊',
    pergunta_central: 'Que evento mudou quem eu era?',
    sub_perguntas: [
      'Antes disso acontecer, quem era eu?',
      'Que versao minha ficou presa nesse momento?',
      'O que preciso de dizer a essa versao?'
    ]
  },
  {
    id: 'presente',
    nome: 'Presente',
    icon: '🌟',
    pergunta_central: 'Quem sou eu agora, com tudo isto?',
    sub_perguntas: [
      'Que partes de todas essas versoes ainda carrego?',
      'O que estou pronta a integrar?',
      'O que estou pronta a libertar?'
    ]
  }
]
