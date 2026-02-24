// ============================================================
// GHOST USERS — Presenças Simuladas na Comunidade
// Perfis moçambicanos autênticos com histórias reais.
// Tudo é determinístico (baseado em datas) e client-side.
// ============================================================

import { PROMPTS_REFLEXAO, ECOS_INFO, RESSONANCIA_TIPOS } from './comunidade'

// ---------- SEED / HASH HELPERS ----------

function hashStr(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function seededRandom(seed) {
  let s = seed | 0
  return function next() {
    s = (s * 1664525 + 1013904223) | 0
    return (s >>> 0) / 4294967296
  }
}

function dateSeed(date) {
  const d = date || new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

function shuffle(arr, rng) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---------- AVATAR COLORS (warm, African-inspired palette) ----------

const AVATAR_COLORS = [
  { bg: '#D97706', text: '#FFF' },  // Amber
  { bg: '#B45309', text: '#FFF' },  // Bronze
  { bg: '#92400E', text: '#FFF' },  // Terracotta escuro
  { bg: '#DC2626', text: '#FFF' },  // Vermelho capulana
  { bg: '#9333EA', text: '#FFF' },  // Roxo profundo
  { bg: '#059669', text: '#FFF' },  // Verde tropical
  { bg: '#0891B2', text: '#FFF' },  // Azul índico
  { bg: '#BE185D', text: '#FFF' },  // Rosa intenso
  { bg: '#7C3AED', text: '#FFF' },  // Violeta
  { bg: '#EA580C', text: '#FFF' },  // Laranja quente
  { bg: '#0D9488', text: '#FFF' },  // Teal
  { bg: '#4338CA', text: '#FFF' },  // Índigo
  { bg: '#C026D3', text: '#FFF' },  // Fúcsia
  { bg: '#15803D', text: '#FFF' },  // Verde floresta
  { bg: '#A16207', text: '#FFF' },  // Ouro escuro
  { bg: '#7E22CE', text: '#FFF' },  // Púrpura real
  { bg: '#DB2777', text: '#FFF' },  // Magenta
  { bg: '#0E7490', text: '#FFF' },  // Ciano profundo
  { bg: '#B91C1C', text: '#FFF' },  // Vermelho terra
  { bg: '#6D28D9', text: '#FFF' },  // Violeta real
]

// ---------- GHOST PROFILES — Maioria moçambicana ----------

export const GHOST_PROFILES = [
  {
    id: 'ghost_graca',
    display_name: 'Graça Mondlane',
    bio: 'Mãe de três, de Maputo. O Vitalis devolveu-me a energia que achava perdida.',
    avatar_emoji: '🌺',
    avatar_color: AVATAR_COLORS[0],
    iniciais: 'GM',
    cidade: 'Maputo',
    ecos_activos: ['vitalis'],
    personalidade: 'calorosa',
    membro_desde: '2025-09-14'
  },
  {
    id: 'ghost_esperanca',
    display_name: 'Esperança Nhaca',
    bio: 'Professora em Matola. A ensinar e a aprender todos os dias.',
    avatar_emoji: '📚',
    avatar_color: AVATAR_COLORS[1],
    iniciais: 'EN',
    cidade: 'Matola',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'reflexiva',
    membro_desde: '2025-10-02'
  },
  {
    id: 'ghost_celeste',
    display_name: 'Celeste Macuácua',
    bio: 'Enfermeira na Beira. Cuido dos outros, agora aprendo a cuidar de mim.',
    avatar_emoji: '🕊️',
    avatar_color: AVATAR_COLORS[2],
    iniciais: 'CM',
    cidade: 'Beira',
    ecos_activos: ['vitalis'],
    personalidade: 'empática',
    membro_desde: '2025-08-20'
  },
  {
    id: 'ghost_amina',
    display_name: 'Amina Hassane',
    bio: 'De Nampula. O Vitalis ensinou-me a alimentar o corpo com intenção e gratidão.',
    avatar_emoji: '🌙',
    avatar_color: AVATAR_COLORS[3],
    iniciais: 'AH',
    cidade: 'Nampula',
    ecos_activos: ['vitalis'],
    personalidade: 'sabia',
    membro_desde: '2025-07-15'
  },
  {
    id: 'ghost_fatima',
    display_name: 'Fátima Sitoe',
    bio: 'Empreendedora em Maputo. A equilibrar negócio e alma.',
    avatar_emoji: '✨',
    avatar_color: AVATAR_COLORS[4],
    iniciais: 'FS',
    cidade: 'Maputo',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'determinada',
    membro_desde: '2025-06-10'
  },
  {
    id: 'ghost_halima',
    display_name: 'Halima Januário',
    bio: 'Mãe e comerciante na Ilha de Moçambique. A cuidar de mim para cuidar dos meus.',
    avatar_emoji: '🕊️',
    avatar_color: AVATAR_COLORS[5],
    iniciais: 'HJ',
    cidade: 'Ilha de Moçambique',
    ecos_activos: ['vitalis'],
    personalidade: 'calorosa',
    membro_desde: '2025-11-05'
  },
  {
    id: 'ghost_dulce',
    display_name: 'Dulce Cossa',
    bio: 'Avó aos 50. Nunca é tarde para recomeçar. Cada dia é uma nova semente.',
    avatar_emoji: '🌸',
    avatar_color: AVATAR_COLORS[6],
    iniciais: 'DC',
    cidade: 'Inhambane',
    ecos_activos: ['vitalis'],
    personalidade: 'sabia',
    membro_desde: '2025-05-22'
  },
  {
    id: 'ghost_aisha',
    display_name: 'Aisha Momade',
    bio: 'Farmacêutica em Maputo. Descobri no Lumina padrões que não via há anos.',
    avatar_emoji: '🌟',
    avatar_color: AVATAR_COLORS[7],
    iniciais: 'AM',
    cidade: 'Maputo',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'curiosa',
    membro_desde: '2025-09-28'
  },
  {
    id: 'ghost_zainab',
    display_name: 'Zainab Mussá',
    bio: 'Professora em Pemba. A transformação começa no prato e no coração.',
    avatar_emoji: '💫',
    avatar_color: AVATAR_COLORS[8],
    iniciais: 'ZM',
    cidade: 'Pemba',
    ecos_activos: ['vitalis'],
    personalidade: 'determinada',
    membro_desde: '2025-12-01'
  },
  {
    id: 'ghost_mariamo',
    display_name: 'Mariamo Abdala',
    bio: 'Nascida em Angoche. O caminho do autoconhecimento não tem pressa.',
    avatar_emoji: '🌷',
    avatar_color: AVATAR_COLORS[9],
    iniciais: 'MA',
    cidade: 'Angoche',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'poetica',
    membro_desde: '2025-10-18'
  },
  {
    id: 'ghost_joana',
    display_name: 'Joana Tembe',
    bio: 'Depois de uma fase difícil, estou a renascer. Maputo é a minha raiz.',
    avatar_emoji: '🌱',
    avatar_color: AVATAR_COLORS[10],
    iniciais: 'JT',
    cidade: 'Maputo',
    ecos_activos: ['vitalis'],
    personalidade: 'vulneravel',
    membro_desde: '2026-01-08'
  },
  {
    id: 'ghost_luisa',
    display_name: 'Luísa Cumbane',
    bio: 'Artista plástica em Xai-Xai. Encontro nos Ecos cores que não sabia que tinha.',
    avatar_emoji: '🎨',
    avatar_color: AVATAR_COLORS[11],
    iniciais: 'LC',
    cidade: 'Xai-Xai',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'criativa',
    membro_desde: '2025-08-03'
  },
  {
    id: 'ghost_rosa',
    display_name: 'Rosa Mabjaia',
    bio: 'Nutricionista em formação. O Vitalis é o meu laboratório interior.',
    avatar_emoji: '🍃',
    avatar_color: AVATAR_COLORS[12],
    iniciais: 'RM',
    cidade: 'Maputo',
    ecos_activos: ['vitalis'],
    personalidade: 'pratica',
    membro_desde: '2025-07-20'
  },
  {
    id: 'ghost_beatriz',
    display_name: 'Beatriz Nhambi',
    bio: 'De Chimoio. O caminho da cura começa por dentro.',
    avatar_emoji: '💜',
    avatar_color: AVATAR_COLORS[13],
    iniciais: 'BN',
    cidade: 'Chimoio',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'corajosa',
    membro_desde: '2025-11-12'
  },
  {
    id: 'ghost_safira',
    display_name: 'Safira Langa',
    bio: 'Estudante de psicologia na UEM. Fascinada pelo autoconhecimento.',
    avatar_emoji: '🔮',
    avatar_color: AVATAR_COLORS[14],
    iniciais: 'SL',
    cidade: 'Maputo',
    ecos_activos: ['lumina'],
    personalidade: 'curiosa',
    membro_desde: '2025-09-05'
  },
  {
    id: 'ghost_nhara',
    display_name: 'Nhara Guambe',
    bio: 'Runner e amante de chás. A descobrir o meu ritmo entre Matola e o mar.',
    avatar_emoji: '🍵',
    avatar_color: AVATAR_COLORS[15],
    iniciais: 'NG',
    cidade: 'Matola',
    ecos_activos: ['vitalis'],
    personalidade: 'energetica',
    membro_desde: '2025-10-30'
  },
  {
    id: 'ghost_ines',
    display_name: 'Inês Chissano',
    bio: 'Jornalista freelancer. As palavras curam quando são verdadeiras.',
    avatar_emoji: '🖊️',
    avatar_color: AVATAR_COLORS[16],
    iniciais: 'IC',
    cidade: 'Maputo',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'articulada',
    membro_desde: '2025-06-28'
  },
  {
    id: 'ghost_marta',
    display_name: 'Marta Chiziane',
    bio: 'Yoga e meditação em Vilankulo. Este mar é o meu jardim.',
    avatar_emoji: '🧘',
    avatar_color: AVATAR_COLORS[17],
    iniciais: 'MC',
    cidade: 'Vilankulo',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'espiritual',
    membro_desde: '2025-08-15'
  },
  {
    id: 'ghost_ana',
    display_name: 'Ana Macie',
    bio: 'Cozinheira de coração. A comida tradicional é a minha meditação.',
    avatar_emoji: '🍲',
    avatar_color: AVATAR_COLORS[18],
    iniciais: 'AM',
    cidade: 'Quelimane',
    ecos_activos: ['vitalis'],
    personalidade: 'pratica',
    membro_desde: '2025-12-20'
  },
  {
    id: 'ghost_claudia',
    display_name: 'Cláudia Dzucula',
    bio: 'Contabilista que descobriu que os números da alma importam mais.',
    avatar_emoji: '📊',
    avatar_color: AVATAR_COLORS[19],
    iniciais: 'CD',
    cidade: 'Maputo',
    ecos_activos: ['vitalis'],
    personalidade: 'reflexiva',
    membro_desde: '2025-11-25'
  },
  // ──── Perfis masculinos ────
  {
    id: 'ghost_rafael',
    display_name: 'Rafael Tembe',
    bio: 'Personal trainer em Maputo. Descobri que treinar o corpo sem nutrir a mente é só metade do caminho.',
    avatar_emoji: '💪',
    avatar_color: { bg: '#1E40AF', text: '#FFF' },
    iniciais: 'RT',
    cidade: 'Maputo',
    ecos_activos: ['vitalis'],
    personalidade: 'determinada',
    membro_desde: '2025-10-10'
  },
  {
    id: 'ghost_dinis',
    display_name: 'Dinis Machanguana',
    bio: 'Engenheiro na Matola. A cuidar da saúde por mim e pelos meus filhos.',
    avatar_emoji: '🛠️',
    avatar_color: { bg: '#065F46', text: '#FFF' },
    iniciais: 'DM',
    cidade: 'Matola',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'pratica',
    membro_desde: '2025-12-15'
  }
]

// ---------- GHOST REFLEXÕES ----------

const GHOST_REFLEXOES = [
  // === GRATIDÃO ===
  {
    tema: 'gratidao',
    eco: 'vitalis',
    conteudo: 'Hoje o meu corpo pediu-me para parar. E eu ouvi. Pela primeira vez em meses, sentei-me sem fazer nada durante 10 minutos. O silêncio falou mais alto que qualquer lista de tarefas.',
    prompt_id: 'grat_1',
    personalidades: ['reflexiva', 'sabia']
  },
  {
    tema: 'gratidao',
    eco: 'geral',
    conteudo: 'O meu filho disse-me "mamã, tens os olhos bonitos quando sorris". Estes pequenos momentos são ouro puro.',
    prompt_id: 'grat_2',
    personalidades: ['calorosa']
  },
  {
    tema: 'gratidao',
    eco: 'vitalis',
    conteudo: 'Grata por ter descoberto que cozinhar pode ser meditação. Fiz uma sopa de abóbora com gengibre hoje com tanta intenção que até sabia diferente.',
    prompt_id: 'grat_1',
    personalidades: ['pratica', 'calorosa']
  },
  {
    tema: 'gratidao',
    eco: 'geral',
    conteudo: 'Agradeço a esta comunidade. Saber que não estou sozinha neste caminho faz toda a diferença. Cada ressonância que recebo aquece-me o coração.',
    prompt_id: 'grat_3',
    personalidades: ['vulneravel', 'empática']
  },
  {
    tema: 'gratidao',
    eco: 'geral',
    conteudo: 'Hoje disse "não" a um compromisso que não me servia. É a primeira vez que não sinto culpa. Grata por esta nova versão de mim.',
    prompt_id: 'grat_4',
    personalidades: ['determinada', 'corajosa']
  },
  {
    tema: 'gratidao',
    eco: 'vitalis',
    conteudo: 'Alhamdulillah pelo corpo que tenho. Hoje cozinhei matapa com todo o amor. Alimentar a família é alimentar a alma.',
    prompt_id: 'grat_1',
    personalidades: ['calorosa', 'sabia']
  },
  {
    tema: 'gratidao',
    eco: 'vitalis',
    conteudo: 'Fui ao mercado do Xipamanine e encontrei cajú fresco. Fiz um snack saudável para os miúdos. Pequenas vitórias que o Vitalis me ensinou.',
    prompt_id: 'grat_2',
    personalidades: ['pratica', 'energetica']
  },

  // === DESAFIO ===
  {
    tema: 'desafio',
    eco: 'geral',
    conteudo: 'O medo de não ser suficiente. É esse o medo que atravesso todos os dias. Mas cada dia que passo e continuo aqui, é uma vitória silenciosa.',
    prompt_id: 'des_1',
    personalidades: ['vulneravel', 'corajosa']
  },
  {
    tema: 'desafio',
    eco: 'vitalis',
    conteudo: 'Há 6 meses achava impossível beber 2 litros de água por dia. Agora é automático. Os pequenos hábitos movem montanhas.',
    prompt_id: 'des_2',
    personalidades: ['pratica', 'determinada', 'energetica']
  },
  {
    tema: 'desafio',
    eco: 'geral',
    conteudo: 'Estou a desafiar a crença de que preciso da aprovação dos outros para me sentir válida. É um limite interno antigo, mas estou a conseguir.',
    prompt_id: 'des_3',
    personalidades: ['reflexiva', 'articulada']
  },
  {
    tema: 'desafio',
    eco: 'vitalis',
    conteudo: 'O desafio de mudar a alimentação da família inteira. Quando comecei no Vitalis era só para mim, agora os filhos já pedem fruta em vez de bolachas.',
    prompt_id: 'des_2',
    personalidades: ['determinada', 'calorosa']
  },
  {
    tema: 'desafio',
    eco: 'geral',
    conteudo: 'Viver em Pemba e manter a disciplina com a alimentação não é fácil. Mas o grupo dá-me força. Uma chapa de cada vez.',
    prompt_id: 'des_1',
    personalidades: ['determinada', 'corajosa']
  },

  // === DESCOBERTA ===
  {
    tema: 'descoberta',
    eco: 'lumina',
    conteudo: 'Fiz a leitura do Lumina e percebi que repito o mesmo padrão em todas as relações: dou até ficar vazia. Agora que vejo, posso mudar.',
    prompt_id: 'desc_3',
    personalidades: ['curiosa', 'reflexiva']
  },
  {
    tema: 'descoberta',
    eco: 'geral',
    conteudo: 'Estou a redescobrir a parte de mim que gosta de dançar. Pus marrabenta na cozinha e dancei sozinha. Senti-me viva.',
    prompt_id: 'desc_1',
    personalidades: ['criativa', 'energetica']
  },
  {
    tema: 'descoberta',
    eco: 'lumina',
    conteudo: 'Se pudesse ouvir a minha intuição agora, diria: "pára de ter pressa". Sempre a correr para o próximo objectivo sem apreciar onde estou.',
    prompt_id: 'desc_2',
    personalidades: ['sabia', 'espiritual']
  },
  {
    tema: 'descoberta',
    eco: 'lumina',
    conteudo: 'O Lumina revelou-me que carrego a expectativa dos outros como se fosse minha. Descoberta dolorosa mas libertadora.',
    prompt_id: 'desc_3',
    personalidades: ['curiosa', 'poetica']
  },

  // === INTENÇÃO ===
  {
    tema: 'intencao',
    eco: 'geral',
    conteudo: 'A minha semente de hoje: paciência. Comigo, com os meus filhos, com o processo. Tudo floresce no seu tempo.',
    prompt_id: 'int_1',
    personalidades: ['calorosa', 'sabia']
  },
  {
    tema: 'intencao',
    eco: 'geral',
    conteudo: 'A palavra que guia a minha semana: PRESENÇA. Estar aqui, inteira, em cada momento. Sem fugir para o telemóvel, sem escapar para o futuro.',
    prompt_id: 'int_2',
    personalidades: ['espiritual', 'determinada']
  },
  {
    tema: 'intencao',
    eco: 'vitalis',
    conteudo: 'Comprometo-me hoje a não saltar o pequeno-almoço. Parece simples mas para mim é uma declaração de amor próprio.',
    prompt_id: 'int_3',
    personalidades: ['vulneravel', 'pratica']
  },
  {
    tema: 'intencao',
    eco: 'vitalis',
    conteudo: 'Esta semana vou preparar as refeições ao domingo. O Vitalis mostrou-me que organização é autocuidado.',
    prompt_id: 'int_3',
    personalidades: ['pratica', 'determinada']
  },

  // === TRANSFORMAÇÃO ===
  {
    tema: 'transformacao',
    eco: 'geral',
    conteudo: 'Deixei ir a necessidade de controlar tudo. E paradoxalmente, sinto-me mais forte. Soltar não é fraqueza — é sabedoria.',
    prompt_id: 'trans_1',
    personalidades: ['sabia', 'espiritual']
  },
  {
    tema: 'transformacao',
    eco: 'geral',
    conteudo: 'Há um ano era uma mulher que vivia para agradar aos outros. Hoje estou a tornar-me alguém que se agrada a si mesma primeiro. E não, não é egoísmo.',
    prompt_id: 'trans_2',
    personalidades: ['articulada', 'corajosa', 'determinada']
  },
  {
    tema: 'transformacao',
    eco: 'geral',
    conteudo: 'A crença de que "não mereço coisas boas" já não me serve. Ouço-a ainda, mas já não a obedeço.',
    prompt_id: 'trans_3',
    personalidades: ['reflexiva', 'vulneravel']
  },
  {
    tema: 'transformacao',
    eco: 'vitalis',
    conteudo: 'Três meses no Vitalis. O peso na balança mudou pouco, mas a forma como me vejo mudou tudo. A transformação é interna primeiro.',
    prompt_id: 'trans_2',
    personalidades: ['reflexiva', 'corajosa']
  },

  // === CONEXÃO ===
  {
    tema: 'conexao',
    eco: 'geral',
    conteudo: 'A verdade que ainda não disse: tenho medo de ficar sozinha. Mas estou a aprender que solidão e solitude são coisas muito diferentes.',
    prompt_id: 'con_1',
    personalidades: ['vulneravel', 'poetica']
  },
  {
    tema: 'conexao',
    eco: 'geral',
    conteudo: 'Pedi ajuda ontem. À minha irmã. Disse-lhe que não estava bem. Foi das coisas mais difíceis e mais libertadoras que fiz.',
    prompt_id: 'con_2',
    personalidades: ['corajosa', 'empática']
  },

  // === MASCULINAS ===
  {
    tema: 'desafio',
    eco: 'vitalis',
    conteudo: 'Sempre achei que cuidar da alimentação era "coisa de mulher". O Vitalis mostrou-me que é coisa de quem se respeita. A minha energia no treino duplicou.',
    prompt_id: 'des_2',
    personalidades: ['determinada', 'pratica']
  },
  {
    tema: 'transformacao',
    eco: 'vitalis',
    conteudo: 'Dois meses a seguir o plano. Os meus filhos notaram que já brinco mais com eles ao fim do dia. A nutrição dá-nos energia para o que importa.',
    prompt_id: 'trans_2',
    personalidades: ['pratica', 'calorosa']
  },
  {
    tema: 'livre',
    eco: 'lumina',
    conteudo: 'Fiz a leitura do Lumina pela primeira vez. Não esperava que me fosse tocar tanto. Há padrões que um homem também precisa de reconhecer.',
    personalidades: ['pratica', 'reflexiva']
  },

  // === CORPO ===
  {
    tema: 'corpo',
    eco: 'vitalis',
    conteudo: 'Hoje o meu corpo está cansado mas não doente. Aprendi a diferença. Cansaço pede descanso, não medicação. Vou honrar isso.',
    prompt_id: 'vit_1',
    personalidades: ['pratica', 'sabia']
  },
  {
    tema: 'corpo',
    eco: 'vitalis',
    conteudo: 'Ofereci ao meu corpo uma caminhada ao pôr-do-sol na Marginal. Sem cronómetro, sem objectivo. Só sentir o vento do Índico e o chão debaixo dos pés.',
    prompt_id: 'vit_2',
    personalidades: ['poetica', 'espiritual', 'energetica']
  },
  {
    tema: 'corpo',
    eco: 'vitalis',
    conteudo: 'Fiz caril de amendoim com couve e arroz integral. Nutriu-me a alma tanto quanto o estômago. Cozinhar com intenção muda tudo.',
    prompt_id: 'vit_3',
    personalidades: ['pratica', 'criativa']
  },
  {
    tema: 'corpo',
    eco: 'vitalis',
    conteudo: 'Descobri no Vitalis que o meu corpo precisa de mais proteína. Comecei a incluir feijão nhemba e lentilhas em todas as refeições. Sinto-me com mais energia.',
    prompt_id: 'vit_1',
    personalidades: ['pratica', 'energetica']
  },
  {
    tema: 'corpo',
    eco: 'vitalis',
    conteudo: 'Hoje fiz xima com caril de amendoim e legumes frescos do mercado. O Vitalis ensinou-me que a nossa comida tradicional pode ser muito nutritiva.',
    prompt_id: 'vit_3',
    personalidades: ['calorosa', 'pratica']
  },

  // === VISÃO ===
  {
    tema: 'visao',
    eco: 'lumina',
    conteudo: 'O padrão que reconheço: fujo de situações antes que me possam magoar. Auto-sabotagem disfarçada de protecção.',
    prompt_id: 'lum_1',
    personalidades: ['curiosa', 'articulada']
  },
  {
    tema: 'visao',
    eco: 'lumina',
    conteudo: 'O Lumina mostrou-me que tenho tendência a carregar o peso dos outros. Preciso de aprender onde eu acabo e os outros começam.',
    prompt_id: 'lum_1',
    personalidades: ['empática', 'reflexiva']
  },

  // === LIVRE ===
  {
    tema: 'livre',
    eco: 'vitalis',
    conteudo: 'Comecei a registar as minhas refeições no Vitalis há 3 semanas. A transformação não está no que como — está em como me sinto a comer. Mais presente. Mais grata.',
    personalidades: ['pratica', 'reflexiva']
  },
  {
    tema: 'livre',
    eco: 'geral',
    conteudo: 'Às vezes a transformação não é grande. É acordar e escolher, mais uma vez, ser gentil contigo mesma. Hoje escolhi.',
    personalidades: ['poetica', 'sabia']
  },
  {
    tema: 'livre',
    eco: 'vitalis',
    conteudo: 'Primeira semana a dormir 8 horas por noite. O impacto no meu humor, energia e paciência é absurdo. O sono é o medicamento mais subestimado.',
    personalidades: ['pratica', 'energetica']
  },
  {
    tema: 'livre',
    eco: 'geral',
    conteudo: 'Escrever aqui tornou-se o meu ritual nocturno. Antes de dormir, reflicto. Antes de reflectir, respiro. Antes de respirar, paro. E nesse parar, encontro-me.',
    personalidades: ['poetica', 'espiritual']
  },
  {
    tema: 'livre',
    eco: 'lumina',
    conteudo: 'A Lumina mostrou-me algo que eu já sabia mas não queria ver. É desconfortável mas é exactamente por isso que funciona.',
    personalidades: ['curiosa', 'corajosa']
  },
  {
    tema: 'livre',
    eco: 'geral',
    conteudo: 'Olhei-me ao espelho e não critiquei. Simplesmente olhei. Com curiosidade em vez de julgamento. Progresso.',
    personalidades: ['vulneravel', 'criativa']
  },
  {
    tema: 'livre',
    eco: 'vitalis',
    conteudo: 'O plano alimentar do Vitalis mudou a minha relação com o açúcar. Não é proibir — é entender o que o corpo realmente pede.',
    personalidades: ['pratica', 'determinada']
  },
  {
    tema: 'livre',
    eco: 'vitalis',
    conteudo: 'Ensinei a minha filha a preparar um batido de manga com aveia. Ela disse "mamã, somos chefs!". A alimentação saudável pode ser diversão em família.',
    personalidades: ['calorosa', 'energetica']
  },
  {
    tema: 'livre',
    eco: 'geral',
    conteudo: 'Este espaço ensinou-me que cuidar de mim não é egoísmo. É a fundação para cuidar de tudo o resto. Obrigada a todas.',
    personalidades: ['empática', 'vulneravel']
  },
  {
    tema: 'livre',
    eco: 'lumina',
    conteudo: 'Voltei a fazer a leitura do Lumina depois de 2 meses. Os resultados mudaram. Eu mudei. É bonito ter essa prova.',
    personalidades: ['curiosa', 'reflexiva']
  },
  {
    tema: 'livre',
    eco: 'geral',
    conteudo: 'Sentada na varanda em Inhambane, a ouvir o mar. Às vezes o maior acto de coragem é simplesmente parar.',
    personalidades: ['poetica', 'espiritual']
  },
  {
    tema: 'livre',
    eco: 'vitalis',
    conteudo: 'Troquei o pão branco pelo pão de milho caseiro. Os vizinhos já pedem a receita. A mudança é contagiosa.',
    personalidades: ['pratica', 'calorosa']
  },
  {
    tema: 'livre',
    eco: 'geral',
    conteudo: 'Hoje a minha mãe disse que me vê diferente. "Pareces mais leve", disse ela. Três meses de Sete Ecos e a mudança já se nota por fora.',
    personalidades: ['vulneravel', 'determinada']
  }
]

// ---------- GHOST ESPELHOS ----------

const GHOST_ESPELHOS = [
  'Isto fez-me pensar no quanto também evito parar. Obrigada por partilhares.',
  'Também senti isso quando comecei a prestar atenção ao meu corpo. Estamos juntas.',
  'A tua partilha dá-me coragem para ser mais honesta comigo mesma.',
  'Ressoo com isto porque estou exactamente nesse ponto do caminho.',
  'Obrigada por partilhares. Precisava de ler isto hoje.',
  'Isto toca-me porque me lembra a minha avó. Ela dizia algo parecido.',
  'Que bonito. A vulnerabilidade é a maior forma de coragem.',
  'Também senti isso quando decidi pôr-me em primeiro lugar. Não é fácil mas vale a pena.',
  'A tua partilha dá-me esperança de que a mudança é possível.',
  'Ressoo contigo. Estamos a caminhar juntas mesmo sem saber.',
  'Obrigada por estas palavras. Vou guardar para reler quando precisar.',
  'Isto fez-me pensar em como os pequenos gestos são os que realmente transformam.',
  'Que força! Estou a aprender com o teu caminho.',
  'Também senti isso. A diferença é que agora sei que não estou sozinha.',
  'A tua honestidade inspira. Continua a partilhar.',
  'Lindo. Exactamente o que precisava de ouvir hoje.',
  'Ressoo com cada palavra. Este espaço é precioso.',
  'A tua partilha dá-me uma nova perspectiva. Obrigada.',
]

// ---------- GHOST CHAMAS ----------

const GHOST_CHAMAS = [
  'Estar aqui à volta desta fogueira lembra-me que pertencer não exige ser perfeita.',
  'O tema de hoje ressoa tanto comigo. Obrigada a quem acendeu esta fogueira.',
  'Partilho com humildade: estou a aprender que vulnerabilidade é força.',
  'Que noite bonita para estar em círculo. Sinto a presença de todas.',
  'A minha chama: gratidão por este espaço seguro.',
  'Estou aqui. Silenciosa mas presente. Às vezes é o suficiente.',
  'O fogo transforma. Nós também. Uma chama de cada vez.',
  'Trago para esta fogueira a intenção de soltar o que já não me serve.',
  'Que lindo ler as partilhas de todas. Sinto-me menos sozinha.',
  'A minha chama é de esperança. Para mim e para todas nós.',
  'Obrigada por este espaço. As palavras aqui têm peso e leveza ao mesmo tempo.',
  'Sento-me neste círculo com o coração aberto.',
]

// ============================================================
// GENERATION FUNCTIONS
// ============================================================

function ghostPostId(date, index) {
  return `ghost_${dateSeed(date)}_${index}`
}

function selectProfile(reflexao, rng) {
  const compatible = GHOST_PROFILES.filter(p =>
    reflexao.personalidades.some(pers => pers === p.personalidade)
  )
  const pool = compatible.length > 0 ? compatible : GHOST_PROFILES
  return pool[Math.floor(rng() * pool.length)]
}

function generateTimestamp(baseDate, index, rng) {
  const horasPico = [7, 8, 9, 12, 13, 19, 20, 21, 22]
  const hora = horasPico[Math.floor(rng() * horasPico.length)]
  const minuto = Math.floor(rng() * 60)

  const d = new Date(baseDate)
  d.setHours(hora, minuto, Math.floor(rng() * 60), 0)
  return d.toISOString()
}

export function getGhostPostsForDate(date) {
  const seed = dateSeed(date)
  const rng = seededRandom(seed)

  const numPosts = 2 + Math.floor(rng() * 3)
  const available = shuffle(GHOST_REFLEXOES, rng)

  const posts = []
  for (let i = 0; i < numPosts && i < available.length; i++) {
    const reflexao = available[i]
    const perfil = selectProfile(reflexao, rng)
    const ressonanciaCount = 1 + Math.floor(rng() * 8)
    const espelhosCount = Math.floor(rng() * 3)

    posts.push({
      id: ghostPostId(date, i),
      user_id: perfil.id,
      tipo: reflexao.tema,
      eco: reflexao.eco,
      conteudo: reflexao.conteudo,
      prompt_id: reflexao.prompt_id || null,
      is_anonymous: rng() < 0.08,
      imagem_url: null,
      hashtags: [],
      likes_count: ressonanciaCount,
      comments_count: espelhosCount,
      saves_count: 0,
      ressonancia_count: ressonanciaCount,
      created_at: generateTimestamp(date, i, rng),
      _ghost: true,
      community_profiles: {
        display_name: perfil.display_name,
        avatar_emoji: perfil.avatar_emoji,
        avatar_color: perfil.avatar_color,
        iniciais: perfil.iniciais,
        avatar_url: null,
        ecos_activos: perfil.ecos_activos
      }
    })
  }

  return posts
}

export function getGhostPostsForRange(days = 14) {
  const posts = []
  const hoje = new Date()

  for (let d = 0; d < days; d++) {
    const date = new Date(hoje)
    date.setDate(date.getDate() - d)
    posts.push(...getGhostPostsForDate(date))
  }

  posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return posts
}

export function mergeGhostPosts(realPosts, ghostPosts) {
  if (!ghostPosts.length) return realPosts
  if (!realPosts.length) return ghostPosts

  let allPosts = [...realPosts, ...ghostPosts]
  allPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const merged = []
  let consecutiveGhosts = 0
  const delayed = []

  for (const post of allPosts) {
    if (post._ghost) {
      if (consecutiveGhosts >= 2) {
        delayed.push(post)
        continue
      }
      consecutiveGhosts++
    } else {
      consecutiveGhosts = 0
      if (delayed.length > 0) {
        merged.push(delayed.shift())
        consecutiveGhosts = 1
      }
    }
    merged.push(post)
  }

  merged.push(...delayed)
  return merged
}

export function getGhostEspelhos(postId) {
  const seed = hashStr(postId + '_espelhos')
  const rng = seededRandom(seed)

  const count = Math.floor(rng() * 3)
  if (count === 0) return []

  const espelhos = []
  const shuffled = shuffle(GHOST_ESPELHOS, rng)
  const profiles = shuffle(GHOST_PROFILES, rng)

  for (let i = 0; i < count; i++) {
    const perfil = profiles[i % profiles.length]
    espelhos.push({
      id: `ghost_espelho_${postId}_${i}`,
      post_id: postId,
      user_id: perfil.id,
      conteudo: shuffled[i % shuffled.length],
      created_at: new Date(Date.now() - (i + 1) * 3600000 * (2 + rng() * 10)).toISOString(),
      _ghost: true,
      community_profiles: {
        user_id: perfil.id,
        display_name: perfil.display_name,
        avatar_emoji: perfil.avatar_emoji,
        avatar_color: perfil.avatar_color,
        iniciais: perfil.iniciais,
        avatar_url: null
      }
    })
  }

  return espelhos
}

export function getGhostChamas(fogueiraId) {
  if (!fogueiraId) return []
  const seed = hashStr(String(fogueiraId) + '_chamas')
  const rng = seededRandom(seed)

  const count = 3 + Math.floor(rng() * 4)
  const chamas = []
  const shuffledTexts = shuffle(GHOST_CHAMAS, rng)
  const shuffledProfiles = shuffle(GHOST_PROFILES, rng)

  for (let i = 0; i < count; i++) {
    const perfil = shuffledProfiles[i % shuffledProfiles.length]
    const horasAtras = 1 + rng() * 18
    chamas.push({
      id: `ghost_chama_${fogueiraId}_${i}`,
      fogueira_id: fogueiraId,
      user_id: perfil.id,
      conteudo: shuffledTexts[i % shuffledTexts.length],
      created_at: new Date(Date.now() - horasAtras * 3600000).toISOString(),
      _ghost: true,
      community_profiles: {
        display_name: perfil.display_name,
        avatar_emoji: perfil.avatar_emoji,
        avatar_color: perfil.avatar_color,
        iniciais: perfil.iniciais,
        avatar_url: null
      }
    })
  }

  chamas.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  return chamas
}

export function getGhostCommunityStats() {
  const seed = dateSeed()
  const rng = seededRandom(seed)
  return {
    totalReflexoes: 12 + Math.floor(rng() * 8),
    totalRessonancia: 24 + Math.floor(rng() * 15),
    membrosActivos: 6 + Math.floor(rng() * 4),
    circulosActivos: 2
  }
}

export function getGhostCirculos() {
  const rng = seededRandom(dateSeed())
  const profiles = shuffle(GHOST_PROFILES.filter(p => p.ecos_activos.includes('vitalis')), rng)

  const circulos = [
    {
      id: 'ghost_circulo_raizes',
      eco: 'vitalis',
      nome: 'Raízes de Vitalis',
      intencao: 'Apoiar-nos mutuamente na jornada de nutrição consciente e amor ao corpo.',
      descricao: 'Um espaço seguro para partilhar conquistas e desafios na alimentação e bem-estar.',
      max_membros: 10,
      _ghost: true,
      community_circulo_membros: profiles.slice(0, 5 + Math.floor(rng() * 3)).map((p, i) => ({
        user_id: p.id,
        role: i === 0 ? 'guardia' : 'membro',
        community_profiles: {
          display_name: p.display_name,
          avatar_emoji: p.avatar_emoji,
          avatar_color: p.avatar_color,
          iniciais: p.iniciais
        }
      }))
    },
    {
      id: 'ghost_circulo_despertar',
      eco: 'lumina',
      nome: 'Despertar Interior',
      intencao: 'Explorar juntas o autoconhecimento através da reflexão diária.',
      descricao: 'Círculo para quem quer aprofundar a prática de Lumina em grupo.',
      max_membros: 8,
      _ghost: true,
      community_circulo_membros: profiles.slice(3, 6 + Math.floor(rng() * 2)).map((p, i) => ({
        user_id: p.id,
        role: i === 0 ? 'guardia' : 'membro',
        community_profiles: {
          display_name: p.display_name,
          avatar_emoji: p.avatar_emoji,
          avatar_color: p.avatar_color,
          iniciais: p.iniciais
        }
      }))
    },
    {
      id: 'ghost_circulo_forca',
      eco: 'vitalis',
      nome: 'Força Interior',
      intencao: 'Celebrar a força do corpo e encontrar equilíbrio.',
      descricao: null,
      max_membros: 12,
      _ghost: true,
      community_circulo_membros: profiles.slice(1, 4 + Math.floor(rng() * 3)).map((p, i) => ({
        user_id: p.id,
        role: i === 0 ? 'guardia' : 'membro',
        community_profiles: {
          display_name: p.display_name,
          avatar_emoji: p.avatar_emoji,
          avatar_color: p.avatar_color,
          iniciais: p.iniciais
        }
      }))
    }
  ]

  return circulos
}

/**
 * Retorna reflexões ghost de um perfil específico (para a página de perfil)
 */
export function getGhostUserReflexoes(ghostId) {
  const perfil = GHOST_PROFILES.find(p => p.id === ghostId)
  if (!perfil) return []

  const rng = seededRandom(hashStr(ghostId + '_reflexoes'))
  const compatible = GHOST_REFLEXOES.filter(r =>
    r.personalidades.some(p => p === perfil.personalidade)
  )
  const selected = shuffle(compatible.length > 3 ? compatible : GHOST_REFLEXOES, rng).slice(0, 3 + Math.floor(rng() * 3))

  return selected.map((r, i) => ({
    id: `ghost_user_ref_${ghostId}_${i}`,
    user_id: ghostId,
    tipo: r.tema,
    eco: r.eco,
    conteudo: r.conteudo,
    prompt_id: r.prompt_id || null,
    is_anonymous: false,
    imagem_url: null,
    hashtags: [],
    likes_count: 2 + Math.floor(rng() * 10),
    comments_count: Math.floor(rng() * 3),
    saves_count: 0,
    ressonancia_count: 2 + Math.floor(rng() * 10),
    created_at: new Date(Date.now() - (i + 1) * 86400000 * (1 + Math.floor(rng() * 5))).toISOString(),
    _ghost: true,
    community_profiles: {
      display_name: perfil.display_name,
      avatar_emoji: perfil.avatar_emoji,
      avatar_color: perfil.avatar_color,
      iniciais: perfil.iniciais,
      avatar_url: null,
      ecos_activos: perfil.ecos_activos
    }
  }))
}

export function isGhostUser(userId) {
  return typeof userId === 'string' && userId.startsWith('ghost_')
}

export function isGhostPost(post) {
  return post && post._ghost === true
}

export function getGhostProfile(ghostId) {
  const profile = GHOST_PROFILES.find(p => p.id === ghostId)
  if (!profile) return null
  return {
    user_id: profile.id,
    display_name: profile.display_name,
    bio: profile.bio,
    avatar_emoji: profile.avatar_emoji,
    avatar_color: profile.avatar_color,
    iniciais: profile.iniciais,
    avatar_url: null,
    ecos_activos: profile.ecos_activos,
    cidade: profile.cidade,
    membro_desde: profile.membro_desde,
    _ghost: true
  }
}

// ============================================================
// GHOST REACTIONS ON REAL POSTS
// Ghosts "respond" to real user posts after a realistic delay.
// Everything is deterministic and client-side.
// ============================================================

const RESSONANCIA_KEYS = ['ressoo', 'luz', 'forca', 'espelho', 'raiz']

/**
 * Gera reacções ghost para um post REAL baseado na sua idade.
 * Posts com <1.5h não recebem nada. Posts com >3h podem receber espelhos.
 * Retorna { ressonanciaBonus, espelhos[] }
 */
export function getGhostReactionsForRealPost(postId, postCreatedAt) {
  const seed = hashStr(postId + '_ghost_react')
  const rng = seededRandom(seed)

  const hoursOld = (Date.now() - new Date(postCreatedAt).getTime()) / 3600000

  // Nenhuma reacção se o post é muito recente
  if (hoursOld < 1.5) return { ressonanciaBonus: 0, espelhos: [] }

  // 1-3 ressonâncias dependendo da idade do post
  const maxR = hoursOld > 12 ? 3 : hoursOld > 4 ? 2 : 1
  const ressonanciaBonus = 1 + Math.floor(rng() * maxR)

  // Espelhos: 30% chance se post >3h, 50% se >8h
  const espelhos = []
  const espelhoChance = hoursOld > 8 ? 0.5 : hoursOld > 3 ? 0.3 : 0
  if (rng() < espelhoChance) {
    const profiles = shuffle(GHOST_PROFILES, rng)
    const espelhoPerfil = profiles[0]
    const shuffledTexts = shuffle(GHOST_ESPELHOS, rng)
    const delayHoras = 2 + rng() * 6 // 2-8h depois do post

    espelhos.push({
      id: `ghost_real_esp_${postId}_0`,
      post_id: postId,
      user_id: espelhoPerfil.id,
      conteudo: shuffledTexts[0],
      created_at: new Date(new Date(postCreatedAt).getTime() + delayHoras * 3600000).toISOString(),
      _ghost: true,
      community_profiles: {
        user_id: espelhoPerfil.id,
        display_name: espelhoPerfil.display_name,
        avatar_emoji: espelhoPerfil.avatar_emoji,
        avatar_color: espelhoPerfil.avatar_color,
        iniciais: espelhoPerfil.iniciais,
        avatar_url: null
      }
    })
  }

  return { ressonanciaBonus, espelhos }
}

/**
 * Gera notificações ghost para os posts reais de um utilizador.
 * Chamado pela página de Notificações.
 */
export function getGhostNotificationsForPosts(myPosts) {
  const notifications = []

  for (const post of myPosts) {
    const seed = hashStr(post.id + '_ghost_notif')
    const rng = seededRandom(seed)
    const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / 3600000

    if (hoursOld < 1.5) continue

    // Ressonância notification (1-2 ghosts)
    const profiles = shuffle(GHOST_PROFILES, rng)
    const numReactors = hoursOld > 6 ? 2 : 1

    for (let i = 0; i < numReactors; i++) {
      const perfil = profiles[i]
      const tipo = RESSONANCIA_KEYS[Math.floor(rng() * RESSONANCIA_KEYS.length)]
      const delayHoras = 1.5 + rng() * 5
      if (hoursOld < delayHoras) continue

      notifications.push({
        id: `ghost_notif_res_${post.id}_${i}`,
        user_id: post.user_id,
        actor_id: perfil.id,
        tipo: 'ressonancia',
        post_id: post.id,
        conteudo: tipo,
        lida: false,
        created_at: new Date(new Date(post.created_at).getTime() + delayHoras * 3600000).toISOString(),
        _ghost: true,
        actor_profile: {
          display_name: perfil.display_name,
          avatar_emoji: perfil.avatar_emoji,
          avatar_url: null,
          avatar_color: perfil.avatar_color,
          iniciais: perfil.iniciais
        }
      })
    }

    // Espelho notification (30% chance se >3h)
    if (hoursOld > 3 && rng() < 0.35) {
      const espelhoPerfil = profiles[numReactors]
      const shuffledTexts = shuffle(GHOST_ESPELHOS, rng)
      const delayHoras = 2.5 + rng() * 6
      if (hoursOld >= delayHoras) {
        notifications.push({
          id: `ghost_notif_esp_${post.id}`,
          user_id: post.user_id,
          actor_id: espelhoPerfil.id,
          tipo: 'espelho',
          post_id: post.id,
          conteudo: shuffledTexts[0].slice(0, 50),
          lida: false,
          created_at: new Date(new Date(post.created_at).getTime() + delayHoras * 3600000).toISOString(),
          _ghost: true,
          actor_profile: {
            display_name: espelhoPerfil.display_name,
            avatar_emoji: espelhoPerfil.avatar_emoji,
            avatar_url: null,
            avatar_color: espelhoPerfil.avatar_color,
            iniciais: espelhoPerfil.iniciais
          }
        })
      }
    }
  }

  notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return notifications
}

/**
 * Marca notificações ghost como lidas no localStorage
 */
export function marcarGhostNotifsLidas(notifIds) {
  const key = 'ghost_notifs_read'
  const read = JSON.parse(localStorage.getItem(key) || '[]')
  const updated = [...new Set([...read, ...notifIds])]
  localStorage.setItem(key, JSON.stringify(updated))
}

export function getGhostNotifsLidas() {
  return JSON.parse(localStorage.getItem('ghost_notifs_read') || '[]')
}

export function toggleGhostRessonancia(postId, tipo) {
  const key = 'ghost_ressonancia'
  const stored = JSON.parse(localStorage.getItem(key) || '{}')

  if (stored[postId]) {
    delete stored[postId]
    localStorage.setItem(key, JSON.stringify(stored))
    return null
  } else {
    stored[postId] = tipo
    localStorage.setItem(key, JSON.stringify(stored))
    return tipo
  }
}

export function getGhostRessonanciaBatch(postIds) {
  const stored = JSON.parse(localStorage.getItem('ghost_ressonancia') || '{}')
  const map = {}
  postIds.forEach(id => {
    if (stored[id]) map[id] = true
  })
  return map
}
