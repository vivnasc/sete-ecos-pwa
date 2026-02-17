/**
 * IMAGO — Sistema de Gamificação
 * Moeda: Estrelas ⭐
 * Níveis: Reflexo → Clareza → Sabedoria → Luminosidade
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
      name: 'Máscara Reconhecida',
      description: 'Identificar 3 máscaras no Espelho Triplo',
      icon: '🎭',
      condition: (data) => (data.mascaras_total || 0) >= 3
    },
    {
      id: 'valores_definidos',
      name: 'Valores Definidos',
      description: 'Completar a selecção dos 3 valores essenciais',
      icon: '💠',
      condition: (data) => (data.valores_definidos || false)
    },
    {
      id: 'arqueologia_profunda',
      name: 'Arqueologia Profunda',
      description: 'Fazer 5 escavações de identidade',
      icon: '⛏️',
      condition: (data) => (data.arqueologia_total || 0) >= 5
    },
    {
      id: 'nomeacao_sagrada',
      name: 'Nomeação Sagrada',
      description: 'Completar o primeiro ritual de auto-nomeação',
      icon: '📜',
      condition: (data) => (data.nomeacao_feita || false)
    },
    {
      id: 'meditacao_essencia',
      name: 'Essência Meditada',
      description: 'Completar 10 meditações de essência',
      icon: '🧘',
      condition: (data) => (data.meditacoes_total || 0) >= 10
    },
    {
      id: 'integrador',
      name: 'Integrador de Ecos',
      description: 'Registar insights de integração entre 3 ecos diferentes',
      icon: '🌀',
      condition: (data) => (data.integracoes_total || 0) >= 3
    },
    {
      id: 'jornada_completa',
      name: 'Jornada Completa',
      description: 'Alcançar o nível Luminosidade',
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
 * Meditações de Essência — Scripts em português
 */
export const MEDITACOES_ESSENCIA = [
  {
    id: 'sem_rotulos',
    nome: 'Quem sou sem rótulos?',
    descricao: 'Meditação guiada para explorar a identidade além de papéis e rótulos sociais.',
    duracao_min: 10,
    script: [
      'Fecha os olhos. Respira fundo três vezes.',
      'Imagina que podes tirar todos os rótulos que carregas: mãe, filha, profissional, amiga...',
      'Tira cada um, como se fossem roupas. Um a um.',
      'O que resta quando não és nenhum desses papéis?',
      'Fica nesse espaço. Observa o que sentes.',
      'Esse espaço vazio não é nada — é tudo. É a tua essência.',
      'Respira nesse lugar. Ele sempre esteve aqui.',
      'Quando estiveres pronta, abre os olhos lentamente.'
    ]
  },
  {
    id: 'eu_essencial',
    nome: 'O meu eu essencial',
    descricao: 'Conectar com a versão mais autêntica de si, antes das máscaras.',
    duracao_min: 12,
    script: [
      'Senta-te confortavelmente. Deixa o corpo relaxar.',
      'Imagina-te numa sala de espelhos. Cada espelho mostra uma versão tua.',
      'Num espelho, vês quem mostras ao mundo. Observa.',
      'Noutro, vês quem eras antes de aprender a esconder-te.',
      'Num terceiro, vês quem queres ser.',
      'Agora, caminha para além dos espelhos. Há uma porta.',
      'Atrás da porta está a versão mais real de ti. Sem filtros.',
      'Encontra-a. Olha-a nos olhos. O que te diz?',
      'Respira com essa versão de ti. Ela nunca foi embora.',
      'Quando estiveres pronta, regressa lentamente.'
    ]
  },
  {
    id: 'integracao_7_ecos',
    nome: 'Integração dos 7 Ecos',
    descricao: 'Meditação de integração que percorre cada eco e unifica a experiência.',
    duracao_min: 15,
    script: [
      'Fecha os olhos. Sente a tua base, o teu corpo. Isto é Vitalis — o chão.',
      'Sobe ao teu centro emocional. Serena — o que sentes agora?',
      'Vai ao teu centro de vontade. Ignis — o que queres realmente?',
      'Expande ao teu peito. Ventis — qual é o teu ritmo hoje?',
      'Sobe à garganta. Ecoa — que verdade precisa de ser dita?',
      'Chega ao espaço entre os olhos. O que vês com clareza?',
      'Finalmente, a coroa. Imago — quem és tu, inteira?',
      'Sente os 7 centros a vibrar juntos. Não separados — integrados.',
      'És uma só pessoa com muitas dimensões. Todas são tuas.',
      'Respira nessa inteireza. Permanece.',
      'Quando estiveres pronta, abre os olhos com suavidade.'
    ]
  },
  {
    id: 'soltar_versoes',
    nome: 'Soltar versões antigas',
    descricao: 'Ritual meditativo para libertar identidades que já não servem.',
    duracao_min: 12,
    script: [
      'Respira fundo. Permite-te estar presente.',
      'Pensa numa versão tua que já não te serve. Pode ser a que agrada, a que se esconde, a que tem medo.',
      'Visualiza essa versão à tua frente. Olha para ela com compaixão.',
      'Diz-lhe: "Obrigada por me teres protegido. Já não preciso de ti assim."',
      'Observa como ela reage. Talvez sorria. Talvez chore.',
      'Abraça-a. E depois, suavemente, deixa-a ir.',
      'Observa-a a afastar-se. Não com tristeza — com gratidão.',
      'No espaço que ela deixou, o que surge? Fica atenta.',
      'Respira. O espaço vazio é o espaço da possibilidade.',
      'Quando estiveres pronta, regressa ao presente.'
    ]
  },
  {
    id: 'corpo_identidade',
    nome: 'O corpo como identidade',
    descricao: 'Exploração da relação entre corpo e sentido de eu.',
    duracao_min: 8,
    script: [
      'Fecha os olhos. Traz a atenção ao teu corpo.',
      'Este corpo que te carrega. Que mudou tantas vezes.',
      'Cada cicatriz conta uma história. Cada ruga é um mapa.',
      'O teu corpo não é só um veículo — é parte de quem és.',
      'Pergunta ao teu corpo: "O que sabes sobre mim que eu esqueci?"',
      'Ouve. O corpo fala em sensações, não em palavras.',
      'Agradece ao teu corpo. Ele sempre soube quem és.',
      'Abre os olhos quando estiveres pronta.'
    ]
  }
]

/**
 * 50 Valores para o exercício de selecção progressiva
 */
export const LISTA_VALORES = [
  'Autenticidade', 'Coragem', 'Compaixão', 'Criatividade', 'Curiosidade',
  'Determinação', 'Empatia', 'Equidade', 'Esperança', 'Fé',
  'Generosidade', 'Gratidão', 'Honestidade', 'Humildade', 'Humor',
  'Independência', 'Integridade', 'Intuição', 'Justiça', 'Lealdade',
  'Liberdade', 'Liderança', 'Amor', 'Natureza', 'Optimismo',
  'Paciência', 'Paz', 'Perseverança', 'Presença', 'Prosperidade',
  'Resiliência', 'Respeito', 'Responsabilidade', 'Sabedoria', 'Saúde',
  'Segurança', 'Serenidade', 'Serviço', 'Simplicidade', 'Solidariedade',
  'Sustentabilidade', 'Ternura', 'Tolerância', 'Tradição', 'Transparência',
  'Unidade', 'Versatilidade', 'Visão', 'Vulnerabilidade', 'Zelo'
]

/**
 * Dimensões do Mapa de Identidade — uma por eco
 */
export const DIMENSOES_IDENTIDADE = [
  { id: 'corpo', eco: 'vitalis', nome: 'Corpo', icon: '🌱', cor: '#7C8B6F', pergunta: 'Como habito o meu corpo?' },
  { id: 'valor', eco: 'aurea', nome: 'Valor', icon: '✨', cor: '#C4A265', pergunta: 'Qual o meu valor inerente?' },
  { id: 'emocao', eco: 'serena', nome: 'Emoção', icon: '💧', cor: '#6B8E9B', pergunta: 'Como fluo com as minhas emoções?' },
  { id: 'vontade', eco: 'ignis', nome: 'Vontade', icon: '🔥', cor: '#C1634A', pergunta: 'O que escolho conscientemente?' },
  { id: 'energia', eco: 'ventis', nome: 'Energia', icon: '🍃', cor: '#5D9B84', pergunta: 'Qual é o meu ritmo natural?' },
  { id: 'voz', eco: 'ecoa', nome: 'Voz', icon: '🔊', cor: '#4A90A4', pergunta: 'O que preciso de dizer?' },
  { id: 'essencia', eco: 'imago', nome: 'Essência', icon: '⭐', cor: '#8B7BA5', pergunta: 'Quem sou eu, inteira?' }
]

/**
 * Perguntas do Espelho Triplo
 */
export const ESPELHO_TRIPLO_GUIA = {
  essencia: {
    titulo: 'Quem sou realmente?',
    perguntas: [
      'Quando estou sozinha e ninguém vê, como sou?',
      'Que qualidades surgem quando não estou a tentar impressionar?',
      'O que faço quando ninguém espera nada de mim?',
      'Que tipo de pessoa sou nos meus momentos mais honestos?'
    ]
  },
  mascara: {
    titulo: 'Quem mostro ao mundo?',
    perguntas: [
      'Que versão de mim apresento em público?',
      'O que escondo das pessoas por medo de julgamento?',
      'Quando e que sinto que estou a "actuar" em vez de "ser"?',
      'Que máscaras uso em diferentes contextos (trabalho, família, amigos)?'
    ]
  },
  aspiracao: {
    titulo: 'Quem quero ser?',
    perguntas: [
      'Se pudesse ser qualquer versão de mim, qual escolheria?',
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
    nome: 'Infância',
    icon: '👶',
    pergunta_central: 'Quem era eu antes de aprender a adaptar-me?',
    sub_perguntas: [
      'O que adorava fazer quando era criança?',
      'Que sonhos tinha antes do mundo dizer "não podes"?',
      'Que parte de mim ficou nessa idade?'
    ]
  },
  {
    id: 'adolescencia',
    nome: 'Adolescência',
    icon: '🌸',
    pergunta_central: 'Que identidade construi para sobreviver?',
    sub_perguntas: [
      'Que máscara comecei a usar nessa fase?',
      'O que sacrifiquei para ser aceite?',
      'Que parte rebelde silenciei?'
    ]
  },
  {
    id: 'relacoes',
    nome: 'Relações',
    icon: '💞',
    pergunta_central: 'Quem me tornei para agradar os outros?',
    sub_perguntas: [
      'Que versão de mim criei para cada relação importante?',
      'O que perdi de mim nas relações?',
      'Que identidade assumi que não é minha?'
    ]
  },
  {
    id: 'traumas',
    nome: 'Momentos de ruptura',
    icon: '🌊',
    pergunta_central: 'Que evento mudou quem eu era?',
    sub_perguntas: [
      'Antes disso acontecer, quem era eu?',
      'Que versão minha ficou presa nesse momento?',
      'O que preciso de dizer a essa versao?'
    ]
  },
  {
    id: 'presente',
    nome: 'Presente',
    icon: '🌟',
    pergunta_central: 'Quem sou eu agora, com tudo isto?',
    sub_perguntas: [
      'Que partes de todas essas versões ainda carrego?',
      'O que estou pronta a integrar?',
      'O que estou pronta a libertar?'
    ]
  }
]
