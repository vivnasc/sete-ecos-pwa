/**
 * Marketing Engine - Motor de conteudo automatizado
 * Gera sugestoes diarias de conteudo para Instagram, WhatsApp e email
 * Tudo em portugues, adaptado ao mercado de Mocambique
 */

import { buildUTMUrl, UTM_TEMPLATES } from '../utils/utm';

const BASE_URL = 'https://app.seteecos.com';

// ============================================================
// BANCO DE CONTEUDO: ~90 templates rotacionados ao longo do mes
// ============================================================

const DICAS_NUTRICAO = [
  'Sabias que beber agua antes das refeicoes ajuda a controlar as porcoes? Experimenta um copo 20 min antes de comer.',
  'A tua mao e a melhor ferramenta de nutricao. 1 palma = proteina, 1 punho = legumes, 1 polegar = gordura saudavel.',
  'Comer devagar nao e so para saborear - o cerebro precisa de 20 minutos para registar saciedade.',
  'Nao saltes o pequeno-almoco. O corpo precisa de combustivel para comecar o dia com energia.',
  'Troca o sumo de pacote por agua com limao ou pepino. O teu corpo agradece.',
  'Jejum intermitente nao e passar fome. E dar ao corpo tempo para se regenerar.',
  'As cores no prato importam: quanto mais variado, mais nutrientes recebes.',
  'Proteina em cada refeicao ajuda a manter a saciedade e preservar a massa muscular.',
  'Cozinhar em casa e o investimento mais rentavel na tua saude. E nao precisa ser complicado.',
  'Stress cronico engorda. Cuidar da mente e cuidar do corpo.',
  'Dormir bem e tao importante como comer bem. 7-8 horas fazem diferenca no peso.',
  'Nao existem alimentos proibidos. Existem escolhas conscientes.',
  'A matapa tem ferro, a couve tem calcio, o feijao nhemba tem proteina. Comida local e super-comida.',
  'Xima com caril de amendoim e uma refeicao completa se adicionares legumes.',
  'Agua de coco e um isotunico natural. Perfeito para o calor de Maputo.',
];

const DICAS_EMOCIONAL = [
  'Quando a vontade de comer aparece sem fome, para. Respira. Pergunta: o que sinto agora?',
  'Recair nao e falhar. E humano. O que importa e como te levantas, nao quantas vezes cais.',
  'A culpa depois de comer e mais prejudicial que a refeicao em si. Perdoa-te e segue.',
  'Nao e fraqueza pedir ajuda. E coragem reconhecer que nao precisas fazer tudo sozinha.',
  'O teu corpo e a tua casa. Trata-o com o mesmo carinho que darias a alguem que amas.',
  'Celebra cada pequena vitoria. Bebeste agua hoje? Isso ja e progresso.',
  'A transformacao nao acontece da noite para o dia. Acontece em cada escolha, todos os dias.',
  'Comparar-te com outras e roubar a tua propria paz. O teu caminho e so teu.',
];

const DICAS_MOTIVACAO = [
  'Cada dia que ages com consciencia, estas a plantar sementes de uma vida diferente.',
  'O progresso nao e linear. Ha dias bons e dias menos bons. Ambos fazem parte.',
  'A consistencia supera a perfeicao. Sempre.',
  'Tu ja tens tudo o que precisas dentro de ti. So precisas de lembrar.',
  'Uma semana de consistencia muda o teu humor. Um mes muda o teu corpo. Um ano muda a tua vida.',
  'Nao esperes motivacao. Age, e a motivacao vem depois.',
  'O melhor momento para comecar era ontem. O segundo melhor e agora.',
];

const HASHTAGS_BASE = [
  '#nutricaomocambique', '#emagrecersaudavel', '#saudavel',
  '#mulhermocambicana', '#maputo', '#vidasaudavel',
  '#precisionnutrition', '#seteecos', '#vitalis',
  '#transformacao', '#bemestar', '#autocuidado',
  '#saude', '#habitos', '#mudanca',
];

const HASHTAGS_TEMATICOS = {
  nutricao: ['#nutricao', '#comidadereal', '#alimentacaosaudavel', '#semdieta', '#porcoes'],
  emocional: ['#saudeemocional', '#autoconhecimento', '#mindfulness', '#equilibrio'],
  motivacao: ['#motivacao', '#disciplina', '#foco', '#crescimento', '#inspiracao'],
  ramadao: ['#ramadao', '#ramadan', '#suhoor', '#iftar', '#jejum'],
  treino: ['#exercicio', '#treino', '#ativa', '#movimento', '#corpo'],
};

// ============================================================
// CALENDARIO SEMANAL COM TEMAS
// ============================================================

const TEMAS_SEMANA = {
  0: { tema: 'motivacao', titulo: 'Domingo de Reflexao', formato: 'carrossel' },
  1: { tema: 'nutricao', titulo: 'Dica da Semana', formato: 'reel' },
  2: { tema: 'emocional', titulo: 'Cuidado Interior', formato: 'stories' },
  3: { tema: 'nutricao', titulo: 'Receita Rapida', formato: 'reel' },
  4: { tema: 'motivacao', titulo: 'Quinta de Forca', formato: 'stories' },
  5: { tema: 'nutricao', titulo: 'Sexta Saudavel', formato: 'reel' },
  6: { tema: 'emocional', titulo: 'Sabado de Presenca', formato: 'carrossel' },
};

// ============================================================
// GERADOR DE CONTEUDO DIARIO
// ============================================================

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / (1000 * 60 * 60 * 24));
}

function pickFromArray(arr, seed) {
  return arr[seed % arr.length];
}

/**
 * Gera o conteudo sugerido para hoje
 */
export function gerarConteudoHoje(date = new Date()) {
  const dayOfWeek = date.getDay();
  const dayOfYear = getDayOfYear(date);
  const weekNum = Math.floor(dayOfYear / 7);
  const { tema, titulo, formato } = TEMAS_SEMANA[dayOfWeek];

  // Seleccionar dica baseada no dia do ano (rotacao)
  let dica;
  if (tema === 'nutricao') {
    dica = pickFromArray(DICAS_NUTRICAO, dayOfYear);
  } else if (tema === 'emocional') {
    dica = pickFromArray(DICAS_EMOCIONAL, dayOfYear);
  } else {
    dica = pickFromArray(DICAS_MOTIVACAO, dayOfYear);
  }

  // Hashtags: 5 base + 3 tematicos
  const hashBase = HASHTAGS_BASE.slice(0, 5);
  const hashTema = (HASHTAGS_TEMATICOS[tema] || []).slice(0, 3);
  const hashtags = [...hashBase, ...hashTema];

  return {
    data: date.toISOString().split('T')[0],
    diaSemana: ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'][dayOfWeek],
    tema,
    titulo,
    formato,
    dica,
    hashtags,
  };
}

/**
 * Gera conteudo para a semana inteira
 */
export function gerarConteudoSemana(startDate = new Date()) {
  const semana = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    semana.push(gerarConteudoHoje(d));
  }
  return semana;
}

// ============================================================
// GERADOR DE MENSAGENS WHATSAPP
// ============================================================

/**
 * Gera mensagem WhatsApp com link UTM para broadcast
 */
export function gerarMensagemWhatsApp(tipo = 'dica', campanha = '') {
  const hoje = gerarConteudoHoje();
  const camp = campanha || `whatsapp-${hoje.data}`;
  const link = buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.whatsappBroadcast(camp));

  const templates = {
    dica: `*Dica do dia* 🌿\n\n${hoje.dica}\n\n👉 Quer mais? Experimenta o VITALIS:\n${link}`,

    promo: `*Oferta Especial VITALIS* 🌟\n\nCoaching nutricional completo:\n✅ Plano personalizado\n✅ Receitas adaptadas\n✅ Coach IA 24h\n✅ Apoio emocional unico\n\nDesde 2.500 MT/mes\n7 dias de garantia\n\n👉 ${link}`,

    testemunho: `*Resultado Real* 💪\n\n"Perdi 8kg em 3 meses sem passar fome. O Vitalis mudou a minha relacao com a comida."\n\nQueres o mesmo resultado?\n👉 ${link}`,

    lumina: `*Conhece-te melhor em 2 minutos* 🔮\n\nO LUMINA e um diagnostico gratuito que revela padroes sobre energia, emocao e corpo.\n\nExperimenta agora (e gratis!):\n${buildUTMUrl(`${BASE_URL}/lumina`, UTM_TEMPLATES.whatsappBroadcast(camp + '-lumina'))}`,

    status: `${hoje.dica}\n\n🌿 VITALIS - Coaching Nutricional\n${link}`,
  };

  return {
    mensagem: templates[tipo] || templates.dica,
    link,
    tipo,
    campanha: camp,
  };
}

/**
 * Gera mensagem WhatsApp para Status (mais curta)
 */
export function gerarStatusWhatsApp(campanha = '') {
  const hoje = gerarConteudoHoje();
  const camp = campanha || `status-${hoje.data}`;
  const link = buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.whatsappStatus(camp));
  return {
    mensagem: `${hoje.dica}\n\n🌿 ${link}`,
    link,
  };
}

// ============================================================
// GERADOR DE CAPTIONS INSTAGRAM
// ============================================================

/**
 * Gera caption para Instagram com hashtags
 */
export function gerarCaptionInstagram(tipo = 'post') {
  const hoje = gerarConteudoHoje();
  const hashtagStr = hoje.hashtags.join(' ');

  const templates = {
    post: `${hoje.dica}\n\n🌿 O VITALIS e coaching nutricional personalizado para mulheres em Mocambique.\n\nLink na bio 👆\n\n${hashtagStr}`,

    reel: `${hoje.dica} 💪\n\nGuarda este reel e partilha com uma amiga que precisa ouvir isto 🤍\n\n${hashtagStr}`,

    carrossel: `*${hoje.titulo}*\n\n${hoje.dica}\n\nDesliza para saber mais 👉\n\nVITALIS - Coaching Nutricional\nLink na bio\n\n${hashtagStr}`,

    stories: `Pergunta do dia:\n\n${hoje.tema === 'nutricao' ? 'Qual foi a tua refeicao mais saudavel hoje?' : hoje.tema === 'emocional' ? 'Como te sentes agora, de 1 a 10?' : 'O que fizeste hoje por ti?'}`,
  };

  return {
    caption: templates[tipo] || templates.post,
    formato: tipo,
    hashtags: hashtagStr,
    dica: hoje.dica,
  };
}

// ============================================================
// GERADOR DE EMAILS PARA SEQUENCIAS
// ============================================================

/**
 * Sequencia de emails para leads da waitlist
 * Retorna o email a enviar baseado no dia desde registo
 */
export function getEmailSequencia(diasDesdeRegisto) {
  const sequencia = [
    {
      dia: 0,
      assunto: '🌿 Bem-vinda ao Sete Ecos!',
      tipo: 'boas-vindas-waitlist',
      preview: 'A tua jornada de transformacao comeca aqui.',
    },
    {
      dia: 3,
      assunto: '🔮 Ja experimentaste o Lumina?',
      tipo: 'convite-lumina',
      preview: 'Um diagnostico gratuito que revela padroes sobre ti.',
    },
    {
      dia: 7,
      assunto: '💡 3 sinais de que o teu corpo precisa de atencao',
      tipo: 'valor-nutricao',
      preview: 'Como saber se estas a nutrir bem o teu corpo.',
    },
    {
      dia: 14,
      assunto: '🌱 O VITALIS esta a espera de ti',
      tipo: 'convite-vitalis',
      preview: 'Coaching nutricional personalizado desde 2.500 MT/mes.',
    },
    {
      dia: 21,
      assunto: '💬 "Perdi 8kg sem passar fome" - historia real',
      tipo: 'testemunho',
      preview: 'Como a Maria Jose transformou a sua relacao com a comida.',
    },
    {
      dia: 30,
      assunto: '⏰ Ultima oportunidade - oferta especial',
      tipo: 'oferta-final',
      preview: 'Desconto exclusivo para quem esta na lista de espera.',
    },
  ];

  return sequencia.find(s => s.dia === diasDesdeRegisto) || null;
}

/**
 * Retorna toda a sequencia de emails
 */
export function getSequenciaCompleta() {
  return [0, 3, 7, 14, 21, 30].map(dia => getEmailSequencia(dia));
}

// ============================================================
// METRICAS E TRACKING
// ============================================================

/**
 * Retorna links UTM pre-configurados para campanhas comuns
 */
export function gerarLinksUTM() {
  return {
    instagramBio: buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.instagramBio()),
    instagramStory: buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.instagramStory()),
    whatsappBroadcast: buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.whatsappBroadcast()),
    whatsappStatus: buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.whatsappStatus()),
    email: buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.emailNewsletter()),
    facebook: buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.facebookPost()),
    luminaInstagram: buildUTMUrl(`${BASE_URL}/lumina`, UTM_TEMPLATES.instagramBio('lumina')),
    luminaWhatsapp: buildUTMUrl(`${BASE_URL}/lumina`, UTM_TEMPLATES.whatsappBroadcast('lumina')),
  };
}
