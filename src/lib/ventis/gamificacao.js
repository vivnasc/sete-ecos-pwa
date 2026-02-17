/**
 * VENTIS — Sistema de Gamificacao
 * Moeda: Folhas 🍃
 * Niveis: Semente → Broto → Arvore → Floresta
 */

export const VENTIS_GAMIFICATION = {
  currency: { name: 'Folhas', icon: '🍃', plural: 'Folhas' },
  levels: [
    { name: 'Semente', threshold: 0, icon: '🌱' },
    { name: 'Broto', threshold: 50, icon: '🌿' },
    { name: 'Arvore', threshold: 200, icon: '🌳' },
    { name: 'Floresta', threshold: 500, icon: '🌲' }
  ],
  badges: [
    {
      id: 'primeiro_amanhecer',
      name: 'Primeiro Amanhecer',
      description: 'Completar a primeira rotina matinal',
      icon: '🌅',
      condition: (data) => (data.rotinas_matinais || 0) >= 1
    },
    {
      id: 'raizes',
      name: 'Raizes',
      description: '7 dias consecutivos de check-in de energia',
      icon: '🌿',
      condition: (data) => (data.streak_dias || 0) >= 7
    },
    {
      id: 'respiracao_ar',
      name: 'Filho do Ar',
      description: 'Completar 10 pausas conscientes',
      icon: '🌬️',
      condition: (data) => (data.pausas_total || 0) >= 10
    },
    {
      id: 'movimento_10',
      name: 'Corpo em Movimento',
      description: 'Completar 10 sessoes de movimento',
      icon: '🧘',
      condition: (data) => (data.movimento_total || 0) >= 10
    },
    {
      id: 'natureza_5',
      name: 'Conexao Natural',
      description: '5 actividades de conexao com a natureza',
      icon: '🌿',
      condition: (data) => (data.natureza_total || 0) >= 5
    },
    {
      id: 'ritmo_encontrado',
      name: 'Ritmo Encontrado',
      description: 'Registar energia 3x/dia durante 7 dias',
      icon: '🎵',
      condition: (data) => (data.energia_completa_dias || 0) >= 7
    },
    {
      id: 'anti_burnout',
      name: 'Guardia do Ritmo',
      description: 'Agir sobre um alerta de burnout',
      icon: '🛡️',
      condition: (data) => (data.burnout_acoes || 0) >= 1
    },
    {
      id: 'floresta_interior',
      name: 'Floresta Interior',
      description: 'Alcancar o nivel Floresta',
      icon: '🌲',
      condition: (data) => (data.folhas_total || 0) >= 500
    }
  ],
  actions: {
    energia_checkin: 3,
    rotina_completada: 8,
    pausa_consciente: 5,
    movimento_sessao: 7,
    natureza_actividade: 6,
    ritual_criado: 10,
    burnout_accao: 8,
    reflexao: 4
  }
}

/**
 * Tipos de movimento disponíveis
 */
export const TIPOS_MOVIMENTO = [
  {
    id: 'yoga_suave',
    nome: 'Yoga Suave',
    icon: '🧘',
    intensidade: 'suave',
    descricao: 'Movimentos lentos, conectados com a respiracao. Ideal para comecar o dia ou terminar.',
    duracoes: [5, 15, 30],
    passos: [
      'Comeca em pe, pés á largura das ancas',
      'Inspira e levanta os bracos ao ceu',
      'Expira e dobra para a frente, mãos ao chão',
      'Inspira, meio caminho para cima, costas rectas',
      'Expira, dobra novamente',
      'Inspira, volta a subir com os bracos ao ceu',
      'Expira, bracos ao lado do corpo'
    ]
  },
  {
    id: 'alongamentos',
    nome: 'Alongamentos',
    icon: '🤸',
    intensidade: 'suave',
    descricao: 'Alongamentos gentis para libertar tensao acumulada no corpo.',
    duracoes: [5, 15, 30],
    passos: [
      'Pescoco: inclina suavemente para cada lado (30s cada)',
      'Ombros: roda para tras 10 vezes, depois para a frente',
      'Peito: entrelaça as mãos atras das costas e abre',
      'Coluna: torce suavemente sentada, olha sobre o ombro',
      'Ancas: pigeon pose ou borboleta sentada',
      'Pernas: hamstring stretch em pe ou sentada'
    ]
  },
  {
    id: 'tai_chi',
    nome: 'Tai Chi Flow',
    icon: '☯️',
    intensidade: 'suave',
    descricao: 'Movimentos fluidos e circulares. A meditacao em movimento.',
    duracoes: [5, 15, 30],
    passos: [
      'Posicao inicial: pes paralelos, joelhos levemente dobrados',
      'Maos sobem como se empurrassem agua para cima',
      'Maos descem como se acariciassem o ar',
      'Movimento circular: bracos em ondas suaves',
      'Transferencia de peso: de um pe para o outro',
      'Fecha com as maos no centro do peito'
    ]
  },
  {
    id: 'caminhada_consciente',
    nome: 'Caminhada Consciente',
    icon: '🚶',
    intensidade: 'moderado',
    descricao: 'Caminhar com atencao plena. Cada passo e uma meditacao.',
    duracoes: [5, 15, 30],
    passos: [
      'Comeca devagar — sente cada pe a tocar o chao',
      'Sincroniza a respiracao com os passos',
      'Observa o que esta a tua volta sem julgar',
      'Sente o ar na pele, o sol, a sombra',
      'Se a mente divagar, volta aos pes',
      'Nos ultimos minutos, agradece ao teu corpo por se mover'
    ]
  },
  {
    id: 'danca_livre',
    nome: 'Danca Livre',
    icon: '💃',
    intensidade: 'moderado',
    descricao: 'Move o corpo como ele quiser. Sem passos certos, sem julgamento.',
    duracoes: [5, 15, 30],
    passos: [
      'Poe musica que te faca sentir algo',
      'Fecha os olhos se quiseres',
      'Comeca pelos pes — deixa-os encontrar o ritmo',
      'Sobe para os joelhos, ancas, tronco',
      'Bracos livres — sem forma certa',
      'Danca como se ninguem te visse. Porque ninguem te esta a ver.'
    ]
  },
  {
    id: 'sacudimento',
    nome: 'Sacudimento Corporal',
    icon: '🫨',
    intensidade: 'intenso',
    descricao: 'Sacudir o corpo inteiro para libertar tensao, stress e energia estagnada.',
    duracoes: [5, 15],
    passos: [
      'Em pe, comeca a sacudir as maos',
      'Sobe para os bracos, ombros',
      'Adiciona as pernas — joelhos soltos',
      'Sacude o corpo inteiro — sem forma, sem regra',
      'Faz sons se quiseres — solta a voz',
      'Gradualmente abranda ate parar',
      'Fica quieta 30 segundos — sente o que mudou'
    ]
  }
]

/**
 * Actividades de conexao com a natureza
 */
export const ACTIVIDADES_NATUREZA = [
  { id: 'descalca', nome: 'Pes descalcos na terra', icon: '🦶', descricao: 'Tira os sapatos. Sente a terra sob os teus pes. 5 minutos.', duracao: '5 min' },
  { id: 'ceu', nome: 'Observar o ceu', icon: '☁️', descricao: 'Deita-te ou senta-te e olha para o ceu. Nuvens, estrelas, azul. Sem telemovel.', duracao: '10 min' },
  { id: 'passaros', nome: 'Ouvir passaros', icon: '🐦', descricao: 'Para e ouve. Quantos sons de passaros diferentes consegues distinguir?', duracao: '5 min' },
  { id: 'sol', nome: 'Banho de sol consciente', icon: '☀️', descricao: 'Fecha os olhos ao sol. Sente o calor na pele. Agradece.', duracao: '10 min' },
  { id: 'arvore', nome: 'Abracar uma arvore', icon: '🌳', descricao: 'Encontra uma arvore. Toca nela. Sente a casca. Fica ali um momento.', duracao: '5 min' },
  { id: 'agua_natural', nome: 'Ouvir agua natural', icon: '💧', descricao: 'Vai a um rio, fonte ou mar. Fecha os olhos e ouve. So ouve.', duracao: '10 min' },
  { id: 'chuva', nome: 'Sentir a chuva', icon: '🌧️', descricao: 'Se chover, sai por um momento. Sente as gotas. Sem guarda-chuva.', duracao: '3 min' },
  { id: 'nascer_sol', nome: 'Ver o nascer do sol', icon: '🌅', descricao: 'Acorda cedo e ve o sol nascer. Em silencio. Um ritual de presenca.', duracao: '20 min' },
  { id: 'flores', nome: 'Cheirar flores', icon: '🌸', descricao: 'Encontra flores. Para e cheira. Nota cores, formas, texturas.', duracao: '5 min' },
  { id: 'vento', nome: 'Sentir o vento', icon: '🌬️', descricao: 'Abre os bracos ao vento. Sente-o no cabelo, na pele. Deixa-te levar.', duracao: '5 min' }
]

/**
 * Exercicios para pausas conscientes
 */
export const EXERCICIOS_PAUSA = [
  { id: 'respiracao_3', nome: '3 Respiracoes Profundas', icon: '🌬️', duracao: 1, descricao: 'Inspira contando ate 4. Expira contando ate 6. Repete 3 vezes.' },
  { id: 'olhos_longe', nome: 'Olhar ao Longe', icon: '👀', duracao: 2, descricao: 'Olha pela janela ou para o horizonte. Relaxa os olhos. Deixa o foco suavizar.' },
  { id: 'corpo_scan', nome: 'Body Scan Rapido', icon: '🧍', duracao: 3, descricao: 'Da cabeca aos pes: onde tens tensao? Respira para esse lugar. Solta.' },
  { id: 'maos_quentes', nome: 'Aquecer as Maos', icon: '🤲', duracao: 2, descricao: 'Esfrega as maos 15 segundos. Coloca-as nos olhos. Sente o calor. Descansa.' },
  { id: 'pes_chao', nome: 'Pes no Chao', icon: '🦶', duracao: 2, descricao: 'Sente os pes no chao. Pressiona. Sente o peso do corpo. Estas aqui.' },
  { id: 'agua_lenta', nome: 'Beber Agua Devagar', icon: '💧', duracao: 2, descricao: 'Bebe um copo de agua devagar. Sente cada gole. Hidrata com presenca.' },
  { id: 'espreguicar', nome: 'Espreguicar', icon: '🙆', duracao: 1, descricao: 'Levanta os bracos, estica o corpo todo. Boceja se precisares. O corpo sabe.' },
  { id: 'sorriso', nome: 'Sorriso Interior', icon: '😊', duracao: 1, descricao: 'Sorri suavemente. Mesmo sem razao. O corpo le o sorriso como seguranca.' }
]
