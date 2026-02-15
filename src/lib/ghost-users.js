// ============================================================
// GHOST USERS — Presenças Simuladas na Comunidade
// Gera perfis, reflexões e interacções fictícias que se
// misturam com conteúdo real para dar vida à comunidade.
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

// ---------- GHOST PROFILES ----------

export const GHOST_PROFILES = [
  // --- Nomes portugueses ---
  {
    id: 'ghost_ana_sofia',
    display_name: 'Ana Sofia',
    bio: 'A aprender a ouvir o meu corpo. Vitalis mudou a minha relação com a comida.',
    avatar_emoji: '🌿',
    ecos_activos: ['vitalis'],
    personalidade: 'reflexiva'
  },
  {
    id: 'ghost_mariana',
    display_name: 'Mariana',
    bio: 'Mãe de dois. Encontrei no Sete Ecos o espaço que me faltava.',
    avatar_emoji: '🦋',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'calorosa'
  },
  {
    id: 'ghost_fatima_rosa',
    display_name: 'Fátima Rosa',
    bio: 'Em Maputo, a transformar-me um dia de cada vez.',
    avatar_emoji: '🌺',
    ecos_activos: ['vitalis'],
    personalidade: 'poetica'
  },
  {
    id: 'ghost_lucia',
    display_name: 'Lúcia',
    bio: 'Nutricionista em formação. O Vitalis é o meu laboratório interior.',
    avatar_emoji: '🍃',
    ecos_activos: ['vitalis'],
    personalidade: 'pratica'
  },
  {
    id: 'ghost_carolina',
    display_name: 'Carolina M.',
    bio: 'Yoga, meditação e autoconhecimento. Este é o meu jardim.',
    avatar_emoji: '🧘',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'espiritual'
  },
  {
    id: 'ghost_amelia',
    display_name: 'Amélia',
    bio: 'Avó aos 52. Nunca é tarde para recomeçar.',
    avatar_emoji: '🌸',
    ecos_activos: ['vitalis'],
    personalidade: 'sabia'
  },
  {
    id: 'ghost_beatriz',
    display_name: 'Beatriz N.',
    bio: 'De Beira. O caminho da cura começa por dentro.',
    avatar_emoji: '💜',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'corajosa'
  },
  {
    id: 'ghost_ines',
    display_name: 'Inês',
    bio: 'Artista plástica. Encontro nos Ecos cores que não sabia que tinha.',
    avatar_emoji: '🎨',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'criativa'
  },
  {
    id: 'ghost_raquel',
    display_name: 'Raquel S.',
    bio: 'Professora primária. A ensinar-me a mim mesma.',
    avatar_emoji: '📚',
    ecos_activos: ['vitalis'],
    personalidade: 'reflexiva'
  },
  {
    id: 'ghost_sara',
    display_name: 'Sara Luz',
    bio: 'Estudante de psicologia. Fascinada pelo autoconhecimento.',
    avatar_emoji: '🔮',
    ecos_activos: ['lumina'],
    personalidade: 'curiosa'
  },
  {
    id: 'ghost_tania',
    display_name: 'Tânia',
    bio: 'Empreendedora em Maputo. A equilibrar trabalho e alma.',
    avatar_emoji: '✨',
    ecos_activos: ['vitalis'],
    personalidade: 'determinada'
  },
  {
    id: 'ghost_joana',
    display_name: 'Joana P.',
    bio: 'Depois de uma fase difícil, estou a renascer.',
    avatar_emoji: '🌱',
    ecos_activos: ['vitalis'],
    personalidade: 'vulneravel'
  },
  {
    id: 'ghost_helena',
    display_name: 'Helena',
    bio: 'Enfermeira. Cuido dos outros, agora aprendo a cuidar de mim.',
    avatar_emoji: '🕊️',
    ecos_activos: ['vitalis'],
    personalidade: 'empática'
  },
  {
    id: 'ghost_marta',
    display_name: 'Marta C.',
    bio: 'Lisboa. Runner e amante de chás. A descobrir o meu ritmo.',
    avatar_emoji: '🍵',
    ecos_activos: ['vitalis'],
    personalidade: 'energetica'
  },
  {
    id: 'ghost_claudia',
    display_name: 'Cláudia',
    bio: 'Jornalista freelancer. As palavras curam quando são verdadeiras.',
    avatar_emoji: '🖊️',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'articulada'
  },
  // --- Nomes muçulmanos (Moçambique) ---
  {
    id: 'ghost_amina',
    display_name: 'Amina',
    bio: 'De Nampula. O Vitalis ensinou-me a alimentar o corpo com intenção e gratidão.',
    avatar_emoji: '🌙',
    ecos_activos: ['vitalis'],
    personalidade: 'sabia'
  },
  {
    id: 'ghost_halima',
    display_name: 'Halima J.',
    bio: 'Mãe e comerciante na Ilha de Moçambique. A cuidar de mim para cuidar dos meus.',
    avatar_emoji: '🕊️',
    ecos_activos: ['vitalis'],
    personalidade: 'calorosa'
  },
  {
    id: 'ghost_aisha',
    display_name: 'Aisha',
    bio: 'Farmacêutica em Maputo. Descobri no Lumina padrões que não via há anos.',
    avatar_emoji: '🌟',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'curiosa'
  },
  {
    id: 'ghost_zainab',
    display_name: 'Zainab M.',
    bio: 'Professora em Pemba. A transformação começa no prato e no coração.',
    avatar_emoji: '💫',
    ecos_activos: ['vitalis'],
    personalidade: 'determinada'
  },
  {
    id: 'ghost_mariamo',
    display_name: 'Mariamo',
    bio: 'Nascida em Angoche. O caminho do autoconhecimento não tem pressa.',
    avatar_emoji: '🌷',
    ecos_activos: ['vitalis', 'lumina'],
    personalidade: 'poetica'
  }
]

// ---------- GHOST REFLEXÕES ----------
// Conteúdos escritos em português natural, conectados com temas e prompts

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
    conteudo: 'O meu filho disse-me "mãe, tens os olhos bonitos quando sorris". Estes pequenos momentos são ouro puro.',
    prompt_id: 'grat_2',
    personalidades: ['calorosa']
  },
  {
    tema: 'gratidao',
    eco: 'vitalis',
    conteudo: 'Grata por ter descoberto que cozinhar pode ser meditação. Fiz uma sopa hoje com tanta intenção que até sabia diferente.',
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
    conteudo: 'Alhamdulillah pelo corpo que tenho. Hoje cozinhei matapa com tanto amor. Alimentar a família é alimentar a alma.',
    prompt_id: 'grat_1',
    personalidades: ['calorosa', 'sabia']
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
    conteudo: 'Estou a redescobrir a parte de mim que gosta de dançar. Pus música na cozinha e dancei sozinha. Senti-me viva.',
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

  // === VITALIS (corpo/nutrição) ===
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
    conteudo: 'Ofereci ao meu corpo uma caminhada ao pôr-do-sol. Sem cronómetro, sem objectivo. Só sentir o vento e o chão debaixo dos pés.',
    prompt_id: 'vit_2',
    personalidades: ['poetica', 'espiritual', 'energetica']
  },
  {
    tema: 'corpo',
    eco: 'vitalis',
    conteudo: 'Fiz uma sopa de abóbora com gengibre e limão. Nutriu-me a alma tanto quanto o estômago. Cozinhar com intenção muda tudo.',
    prompt_id: 'vit_3',
    personalidades: ['pratica', 'criativa']
  },
  {
    tema: 'corpo',
    eco: 'vitalis',
    conteudo: 'Descobri no Vitalis que o meu corpo precisa de mais proteína. Comecei a incluir feijão e lentilhas em todas as refeições. Sinto-me com mais energia.',
    prompt_id: 'vit_1',
    personalidades: ['pratica', 'energetica']
  },
  {
    tema: 'corpo',
    eco: 'vitalis',
    conteudo: 'Hoje fiz xima com caril de amendoim e legumes frescos. O Vitalis ensinou-me que a nossa comida tradicional pode ser muito nutritiva.',
    prompt_id: 'vit_3',
    personalidades: ['calorosa', 'pratica']
  },

  // === LUMINA (visão/diagnóstico) ===
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

  // === LIVRE (sem prompt) ===
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
    conteudo: 'Ensinei a minha filha a preparar um batido de fruta. Ela disse "mãe, somos chefs!". A alimentação saudável pode ser diversão em família.',
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
  }
]

// ---------- GHOST ESPELHOS (respostas a reflexões) ----------

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

// ---------- GHOST CHAMAS (para a Fogueira) ----------

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

/**
 * Gera um ID de ghost post determinístico baseado em data e índice
 */
function ghostPostId(date, index) {
  return `ghost_${dateSeed(date)}_${index}`
}

/**
 * Selecciona um perfil ghost para uma reflexão baseado na personalidade
 */
function selectProfile(reflexao, rng) {
  const compatible = GHOST_PROFILES.filter(p =>
    reflexao.personalidades.some(pers => pers === p.personalidade)
  )
  const pool = compatible.length > 0 ? compatible : GHOST_PROFILES
  return pool[Math.floor(rng() * pool.length)]
}

/**
 * Gera uma data/hora realista para um post ghost
 * Os posts aparecem em horas típicas de uso (7-9h, 12-14h, 19-23h)
 */
function generateTimestamp(baseDate, index, rng) {
  const horasPico = [7, 8, 9, 12, 13, 19, 20, 21, 22]
  const hora = horasPico[Math.floor(rng() * horasPico.length)]
  const minuto = Math.floor(rng() * 60)

  const d = new Date(baseDate)
  d.setHours(hora, minuto, Math.floor(rng() * 60), 0)
  return d.toISOString()
}

/**
 * Gera posts ghost para um dia específico.
 * Retorna 2-4 posts por dia, determinísticos para a mesma data.
 */
export function getGhostPostsForDate(date) {
  const seed = dateSeed(date)
  const rng = seededRandom(seed)

  const numPosts = 2 + Math.floor(rng() * 3) // 2-4 posts
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
      is_anonymous: rng() < 0.08, // 8% chance de ser anónimo
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
        avatar_url: null,
        ecos_activos: perfil.ecos_activos
      }
    })
  }

  return posts
}

/**
 * Gera posts ghost para os últimos N dias.
 * Usado para preencher o feed com actividade recente.
 */
export function getGhostPostsForRange(days = 14) {
  const posts = []
  const hoje = new Date()

  for (let d = 0; d < days; d++) {
    const date = new Date(hoje)
    date.setDate(date.getDate() - d)
    posts.push(...getGhostPostsForDate(date))
  }

  // Ordenar por data descendente (mais recente primeiro)
  posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return posts
}

/**
 * Mistura posts ghost com posts reais, intercalando de forma natural.
 * Não coloca dois ghost posts seguidos se houver posts reais disponíveis.
 */
export function mergeGhostPosts(realPosts, ghostPosts) {
  if (!ghostPosts.length) return realPosts
  if (!realPosts.length) return ghostPosts

  const merged = []
  const ghosts = [...ghostPosts]
  const reals = [...realPosts]

  // Misturar por cronologia, mas garantir que não há mais de 2 ghost seguidos
  let allPosts = [...reals, ...ghosts]
  allPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

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
      // Inserir ghost posts atrasados
      if (delayed.length > 0) {
        merged.push(delayed.shift())
        consecutiveGhosts = 1
      }
    }
    merged.push(post)
  }

  // Adicionar restantes atrasados no final
  merged.push(...delayed)
  return merged
}

/**
 * Gera espelhos ghost para um post (real ou ghost).
 * Retorna 0-2 espelhos fictícios.
 */
export function getGhostEspelhos(postId) {
  const seed = hashStr(postId + '_espelhos')
  const rng = seededRandom(seed)

  const count = Math.floor(rng() * 3) // 0-2 espelhos
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
        avatar_url: null
      }
    })
  }

  return espelhos
}

/**
 * Gera chamas ghost para uma fogueira.
 * Retorna 3-6 chamas fictícias.
 */
export function getGhostChamas(fogueiraId) {
  if (!fogueiraId) return []
  const seed = hashStr(String(fogueiraId) + '_chamas')
  const rng = seededRandom(seed)

  const count = 3 + Math.floor(rng() * 4) // 3-6
  const chamas = []
  const shuffledTexts = shuffle(GHOST_CHAMAS, rng)
  const shuffledProfiles = shuffle(GHOST_PROFILES, rng)

  for (let i = 0; i < count; i++) {
    const perfil = shuffledProfiles[i % shuffledProfiles.length]
    const horasAtras = 1 + rng() * 18 // entre 1h e 19h atrás
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
        avatar_url: null
      }
    })
  }

  // Ordenar cronologicamente
  chamas.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  return chamas
}

/**
 * Gera stats da comunidade (para o Hub) somando actividade ghost.
 */
export function getGhostCommunityStats() {
  const seed = dateSeed()
  const rng = seededRandom(seed)
  return {
    totalReflexoes: 28 + Math.floor(rng() * 15),
    totalRessonancia: 94 + Math.floor(rng() * 40),
    membrosActivos: 8 + Math.floor(rng() * 6),
    circulosActivos: 2 + Math.floor(rng() * 2)
  }
}

/**
 * Verifica se um user_id é ghost
 */
export function isGhostUser(userId) {
  return typeof userId === 'string' && userId.startsWith('ghost_')
}

/**
 * Verifica se um post é ghost
 */
export function isGhostPost(post) {
  return post && post._ghost === true
}

/**
 * Retorna o perfil ghost por ID
 */
export function getGhostProfile(ghostId) {
  const profile = GHOST_PROFILES.find(p => p.id === ghostId)
  if (!profile) return null
  return {
    user_id: profile.id,
    display_name: profile.display_name,
    bio: profile.bio,
    avatar_emoji: profile.avatar_emoji,
    avatar_url: null,
    ecos_activos: profile.ecos_activos,
    _ghost: true
  }
}

/**
 * Simula ressonância num post ghost (guardado em localStorage).
 */
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

/**
 * Verifica se o user já deu ressonância em posts ghost (batch).
 */
export function getGhostRessonanciaBatch(postIds) {
  const stored = JSON.parse(localStorage.getItem('ghost_ressonancia') || '{}')
  const map = {}
  postIds.forEach(id => {
    if (stored[id]) map[id] = true
  })
  return map
}
