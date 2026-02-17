/**
 * ECOA — Sistema de Gamificacao
 * Moeda: Ecos 🔊
 * Niveis: Sussurro → Voz → Canto → Ressonancia
 */

export const ECOA_GAMIFICATION = {
  currency: { name: 'Ecos', icon: '🔊', plural: 'Ecos' },
  levels: [
    { name: 'Sussurro', threshold: 0, icon: '🤫' },
    { name: 'Voz', threshold: 50, icon: '🗣️' },
    { name: 'Canto', threshold: 200, icon: '🎵' },
    { name: 'Ressonancia', threshold: 500, icon: '🔔' }
  ],
  badges: [
    {
      id: 'primeira_palavra',
      name: 'Primeira Palavra',
      description: 'Registar a primeira voz recuperada',
      icon: '💬',
      condition: (data) => (data.vozes_recuperadas || 0) >= 1
    },
    {
      id: 'primeiro_nao',
      name: 'Primeiro Nao',
      description: 'Completar o exercicio de dizer nao sem explicar',
      icon: '✋',
      condition: (data) => (data.primeiro_nao || false)
    },
    {
      id: 'sem_filtro',
      name: 'Sem Filtro',
      description: '7 dias consecutivos de expressao',
      icon: '🎤',
      condition: (data) => (data.streak_dias || 0) >= 7
    },
    {
      id: 'carta_libertada',
      name: 'Carta Libertada',
      description: 'Libertar a primeira carta nao enviada',
      icon: '📨',
      condition: (data) => (data.cartas_libertadas || 0) >= 1
    },
    {
      id: 'mapa_completo',
      name: 'Mapa do Silencio',
      description: 'Completar o mapa de silenciamento',
      icon: '🗺️',
      condition: (data) => (data.silenciamento_mapeado || false)
    },
    {
      id: 'micro_voz_4',
      name: 'Voz em Crescimento',
      description: 'Completar 4 semanas de Micro-Voz',
      icon: '📈',
      condition: (data) => (data.semana_micro_voz || 0) >= 4
    },
    {
      id: 'assertividade_10',
      name: 'Comunicacao Clara',
      description: 'Registar 10 situacoes de comunicacao assertiva',
      icon: '💎',
      condition: (data) => (data.comunicacao_total || 0) >= 10
    },
    {
      id: 'ressonancia',
      name: 'Ressonancia Interior',
      description: 'Alcancar o nivel Ressonancia',
      icon: '🔔',
      condition: (data) => (data.ecos_total || 0) >= 500
    }
  ],
  actions: {
    micro_voz: 8,
    voz_recuperada: 10,
    carta_escrita: 7,
    carta_libertada: 12,
    diario_voz: 5,
    afirmacao: 4,
    exercicio_expressao: 6,
    comunicacao_assertiva: 8,
    silenciamento_mapeado: 15
  }
}

/**
 * Exercicios progressivos de Micro-Voz
 * Nivel semanal: do mais facil ao mais dificil
 */
export const MICRO_VOZ_PROGRAMA = [
  {
    semana: 1,
    titulo: 'Preferencia Pequena',
    descricao: 'Expressa uma preferencia simples sem pedir desculpa.',
    exercicios: [
      'Diz "Prefiro cafe, nao cha" (ou outra preferencia simples)',
      'Escolhe o restaurante ou o filme sem dizer "tanto faz"',
      'Quando te perguntarem "queres X ou Y?", responde sem hesitar',
      'Diz "Nao gosto disto" sobre algo trivial (comida, musica)',
      'Pede para mudar de lugar num cafe ou restaurante'
    ]
  },
  {
    semana: 2,
    titulo: 'Opiniao Neutra',
    descricao: 'Partilha uma opiniao sobre algo que nao e pessoal.',
    exercicios: [
      'Comenta uma noticia: "Eu acho que..."',
      'Diz a tua opiniao sobre um filme, livro ou serie',
      'Discorda educadamente de algo trivial',
      'Sugere um plano em vez de esperar que outros decidam',
      'Diz "Na minha opiniao..." numa conversa de grupo'
    ]
  },
  {
    semana: 3,
    titulo: 'Dizer Nao Sem Explicar',
    descricao: 'Pratica dizer nao sem te justificares.',
    exercicios: [
      'Diz "Nao, obrigada" a um convite que nao queres aceitar',
      'Recusa um pedido de favor com "Nao posso" (sem razao)',
      'Diz "Nao me apetece" sem adicionar "mas..."',
      'Cancela um compromisso sem inventar uma desculpa elaborada',
      'Diz "Prefiro nao" quando te pedem algo'
    ]
  },
  {
    semana: 4,
    titulo: 'Expressar Desacordo',
    descricao: 'Diz quando nao concordas com algo.',
    exercicios: [
      'Diz "Nao concordo" numa conversa',
      'Corrige alguem gentilmente: "Na verdade, eu vejo de forma diferente"',
      'Nao rias de uma piada que nao achaste engraçada',
      'Diz "Isso nao e como eu vejo" numa discussao',
      'Defende a tua posicao quando alguem tenta mudar a tua opiniao'
    ]
  },
  {
    semana: 5,
    titulo: 'Expressar Necessidades',
    descricao: 'Diz o que precisas sem pedir desculpa por precisar.',
    exercicios: [
      'Diz "Preciso de um momento a sos"',
      'Pede ajuda directamente: "Podes ajudar-me com isto?"',
      'Diz "Preciso que fales mais baixo/devagar"',
      'Expressa uma necessidade emocional: "Preciso que me ouças"',
      'Pede algo que normalmente nao pedias: um abraco, espaco, tempo'
    ]
  },
  {
    semana: 6,
    titulo: 'Pedir Limites',
    descricao: 'Coloca limites com clareza e firmeza.',
    exercicios: [
      'Diz "Nao estou disponivel para isso"',
      'Interrompe alguem que te interrompe: "Desculpa, estava a falar"',
      'Diz "Isso nao esta bem para mim"',
      'Recusa uma tarefa extra: "Nao consigo tomar conta disso agora"',
      'Diz a alguem: "Quando fazes X, eu sinto Y"'
    ]
  },
  {
    semana: 7,
    titulo: 'Verdade Pessoal',
    descricao: 'Partilha algo pessoal e verdadeiro.',
    exercicios: [
      'Conta a alguem de confianca algo que nunca disseste',
      'Admite "Eu errei" ou "Nao sei" sem vergonha',
      'Partilha um medo real com alguem proximo',
      'Diz como te sentes honestamente quando te perguntam "Estas bem?"',
      'Escreve uma verdade tua e le em voz alta (so para ti)'
    ]
  },
  {
    semana: 8,
    titulo: 'Nomear Ferida Antiga',
    descricao: 'O nivel mais profundo: nomear o que doia.',
    exercicios: [
      'Escreve sobre um momento em que te silenciaram — e como te afectou',
      'Diz a alguem: "Isso magoou-me" (sobre algo passado)',
      'Nomeia o padrao: "Eu calo-me quando..." (completa)',
      'Escreve uma carta a quem te silenciou (nao precisa de enviar)',
      'Grava em audio: "A minha voz merece ser ouvida porque..."'
    ]
  }
]

/**
 * Frases dificeis — como dizer coisas que normalmente calamos
 */
export const FRASES_DIFICEIS = [
  {
    id: 'nao_posso',
    frase: 'Nao, nao posso.',
    categoria: 'limite',
    contexto: 'Quando te pedem algo e nao queres ou nao consegues.',
    variacoes: [
      'Nao posso, mas obrigada por pensares em mim.',
      'Desta vez nao me e possivel.',
      'Nao estou disponivel para isso agora.'
    ],
    esperar: 'Possivel surpresa ou insistencia. A maioria aceita melhor do que imaginas.'
  },
  {
    id: 'isso_magoou',
    frase: 'Isso magoou-me.',
    categoria: 'dor',
    contexto: 'Quando alguem te magoou e precisas de dizer.',
    variacoes: [
      'Quando disseste X, eu senti-me magoada.',
      'Isso tocou-me de uma forma que doia.',
      'Preciso de te dizer que isso me afectou.'
    ],
    esperar: 'A pessoa pode ficar defensiva. Respira. A tua dor e valida independentemente da reaccao.'
  },
  {
    id: 'nao_concordo',
    frase: 'Nao concordo.',
    categoria: 'desacordo',
    contexto: 'Quando a tua opiniao difere e normalmente ficas calada.',
    variacoes: [
      'Eu vejo isso de forma diferente.',
      'Respeito a tua opiniao, mas a minha e diferente.',
      'Nao e assim que eu vejo.'
    ],
    esperar: 'Pode gerar debate. Isso e saudavel. Desacordo nao e ataque.'
  },
  {
    id: 'preciso_espaco',
    frase: 'Preciso de espaco.',
    categoria: 'necessidade',
    contexto: 'Quando precisas de tempo a sos e temes parecer egoista.',
    variacoes: [
      'Preciso de um momento para mim.',
      'Vou precisar de algum tempo a sos.',
      'Preciso de espaco para processar isto.'
    ],
    esperar: 'Alguns podem levar a peito. Explica que nao e rejeicao — e cuidado contigo.'
  },
  {
    id: 'nao_funciona',
    frase: 'Isto nao funciona para mim.',
    categoria: 'limite',
    contexto: 'Quando algo nao te serve e finges que esta tudo bem.',
    variacoes: [
      'Isto nao esta a funcionar para mim.',
      'Precisamos de encontrar outra solucao.',
      'Nao estou confortavel com isto.'
    ],
    esperar: 'Pode ser recebido como critica. Foca no "para mim" — nao e culpa, e honestidade.'
  },
  {
    id: 'preciso_ajuda',
    frase: 'Preciso de ajuda.',
    categoria: 'necessidade',
    contexto: 'Quando carregas tudo sozinha e nao pedes ajuda.',
    variacoes: [
      'Podes ajudar-me com isto?',
      'Nao estou a conseguir sozinha.',
      'Agradecia a tua ajuda com X.'
    ],
    esperar: 'A maioria das pessoas QUER ajudar. Pedir nao e fraqueza — e confianca.'
  },
  {
    id: 'mereço_melhor',
    frase: 'Mereco melhor do que isto.',
    categoria: 'verdade',
    contexto: 'Quando aceitas menos do que mereces — na relacao, no trabalho, na vida.',
    variacoes: [
      'Isto nao e o suficiente para mim.',
      'Mereco ser tratada com mais respeito.',
      'Nao vou aceitar menos do que mereco.'
    ],
    esperar: 'Pode ser assustador. Mas cada vez que dizes, a tua voz fica mais forte.'
  },
  {
    id: 'estava_a_falar',
    frase: 'Desculpa, eu estava a falar.',
    categoria: 'limite',
    contexto: 'Quando te interrompem e normalmente cedes.',
    variacoes: [
      'Posso terminar o que estava a dizer?',
      'Deixa-me acabar, por favor.',
      'Eu estava a falar — posso continuar?'
    ],
    esperar: 'Momento de desconforto breve. Depois, respeito. Tu mereces ser ouvida.'
  }
]

/**
 * Categorias de cartas nao enviadas
 */
export const CATEGORIAS_CARTAS = [
  { id: 'perdao', nome: 'Perdao', icon: '🕊️', descricao: 'Cartas de perdao — a outros ou a ti mesma', prompt: 'Escreve a esta pessoa sobre o perdao que precisas de dar ou pedir...' },
  { id: 'raiva', nome: 'Raiva', icon: '🔥', descricao: 'Cartas de raiva — diz tudo o que nunca disseste', prompt: 'Escreve sem filtro. Ninguem vai ler isto. Diz tudo...' },
  { id: 'gratidao', nome: 'Gratidao', icon: '💛', descricao: 'Cartas de gratidao — agradece o que precisas', prompt: 'Escreve a esta pessoa o que nunca agradeceste...' },
  { id: 'despedida', nome: 'Despedida', icon: '🌅', descricao: 'Cartas de despedida — solta o que precisa de ir', prompt: 'Escreve a tua despedida. O que precisas de soltar?...' },
  { id: 'verdade', nome: 'Verdade', icon: '💎', descricao: 'Cartas de verdade — a verdade que nunca disseste', prompt: 'Escreve a verdade que nunca tiveste coragem de dizer...' }
]

/**
 * Exercicios de expressao
 */
export const EXERCICIOS_EXPRESSAO = [
  {
    id: 'escrita_livre',
    nome: 'Escrita Livre',
    icon: '✍️',
    duracao: '5 min',
    descricao: 'Escreve sem parar durante 5 minutos. Sem editar, sem julgar, sem parar. O que sair, sai.',
    instrucoes: 'Poe o timer a contar. Comeca a escrever. Nao pares. Se nao souberes o que escrever, escreve "nao sei o que escrever" ate algo vir. Nao releias.'
  },
  {
    id: 'lista_verdades',
    nome: 'Lista de Verdades',
    icon: '📝',
    duracao: '10 min',
    descricao: 'Escreve 10 verdades sobre ti que normalmente escondes.',
    instrucoes: 'Comeca cada linha com "A verdade e que..." Nao censures. Ninguem vai ler. Sao tuas.'
  },
  {
    id: 'carta_futuro',
    nome: 'Carta ao Eu do Futuro',
    icon: '📮',
    duracao: '10 min',
    descricao: 'Escreve uma carta a ti mesma daqui a 1 ano.',
    instrucoes: 'Conta-lhe como te sentes agora. O que esperas. O que tens medo. O que queres que mude.'
  },
  {
    id: 'manifesto',
    nome: 'Manifesto Pessoal',
    icon: '📜',
    duracao: '15 min',
    descricao: 'Escreve o teu manifesto: quem es, o que defendes, o que nao aceitas.',
    instrucoes: 'Comeca com "Eu sou..." e vai construindo. Inclui: o que defendo, o que nao aceito, o que mereco, o que quero.'
  },
  {
    id: 'dialogo_interno',
    nome: 'Dialogo Interior',
    icon: '🪞',
    duracao: '10 min',
    descricao: 'Escreve um dialogo entre a ti que se cala e a ti que quer falar.',
    instrucoes: 'A Silenciosa: "..." / A Voz: "..." Alterna entre as duas. Deixa-as conversar.'
  }
]

/**
 * Templates de comunicacao assertiva
 */
export const TEMPLATES_ASSERTIVIDADE = [
  {
    id: 'sentimento',
    nome: 'Formula do Sentimento',
    template: 'Eu sinto [emocao] quando [situacao] porque [razao]. Preciso de [necessidade].',
    exemplo: 'Eu sinto-me frustrada quando chegas tarde porque sinto que o meu tempo nao e valorizado. Preciso que me avises quando vais atrasar.'
  },
  {
    id: 'sanduiche',
    nome: 'Tecnica Sanduiche',
    template: '[Algo positivo] + [O que precisa mudar] + [Reafirmacao positiva]',
    exemplo: 'Gosto muito de trabalhar contigo. Preciso que respeites o meu horario de saida. Sei que juntos vamos encontrar uma solucao.'
  },
  {
    id: 'disco_riscado',
    nome: 'Disco Riscado',
    template: 'Repete a tua posicao calmamente, sem te justificares mais: "[A tua frase]"',
    exemplo: '"Nao posso." "Entendo, mas nao posso." "Eu sei, mas a minha resposta e nao posso."'
  },
  {
    id: 'pedido_claro',
    nome: 'Pedido Claro',
    template: 'Gostaria de [pedido especifico]. Seria possivel?',
    exemplo: 'Gostaria de ter 30 minutos de silencio quando chego a casa. Seria possivel?'
  }
]
