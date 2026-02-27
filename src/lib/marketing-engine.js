/**
 * Marketing Engine v3 - Motor de conteúdo com SUBSTÂNCIA
 *
 * Princípios fundadores (palavras da Vivianne):
 * - A Sete Ecos nasceu de excesso, não de falta. Nasceu de alguém que vivia muitas
 *   camadas ao mesmo tempo — intelectual, espiritual, profissional, criativa, corporal —
 *   e tudo estava separado.
 * - Não é mais uma solução. É um sistema onde as partes conversam entre si.
 * - Resolver só o corpo não muda identidade. Resolver só emoção não muda disciplina.
 *   Resolver só produtividade não muda valor próprio.
 * - Arquitectura de integração. Humana. Não corporativa. Não mística performativa.
 * - Não vender esperança. Oferecer coerência.
 * - Criar respeito antes de criar empatia.
 *
 * Frase-âncora: "A Sete Ecos não nasceu para te melhorar. Nasceu para integrar o que já és."
 *
 * Tom: inteligente, denso, directo. Frases curtas. Sem slogans motivacionais vazios.
 * Assinar: "— Vivianne". Máximo 1-2 emojis. Máximo 1 exclamação por parágrafo.
 */

import { buildUTMUrl, UTM_TEMPLATES } from '../utils/utm';

const BASE_URL = 'https://app.seteecos.com';

// ============================================================
// HOOKS - Frases que param o scroll (primeiros 3 segundos)
// Princípio: não motivação barata. Observação inteligente.
// ============================================================

const HOOKS_PROVOCADORES = [
  'Tens profundidade. Tens disciplina. Tens visão. Mas não tens integração.',
  'Resolves o corpo. Depois a emoção. Depois o foco. E nunca juntam.',
  'O problema não é falta de conhecimento. É excesso de fragmentação.',
  'Há anos que trabalhas em ti. Mas cada pedaço separado do resto.',
  'Sabes o que comer, como respirar, como meditar. Mas continuas exausta.',
  'Não te falta mais uma solução. Falta-te um sistema onde tudo converse.',
  'A Sete Ecos não nasceu para te melhorar. Nasceu para integrar o que já és.',
  'Se tratas partes isoladas, vais continuar a viver em ciclos.',
  'Isto nasceu de excesso, não de falta. De alguém que vivia muitas camadas separadas.',
  'Resolver só o corpo não muda identidade. Resolver só emoção não muda disciplina.',
  'Enquanto cada dimensão da tua vida falar uma língua diferente, não há coerência.',
  'Já percebeste que soluções isoladas não funcionam. E agora?',
  'Não quero vender-te esperança. Quero oferecer-te coerência.',
  'Isto não é wellness estético. É arquitectura de integração.',
  'Eu recusei-me a continuar a trabalhar a vida por pedaços. E criei isto.',
];

// ============================================================
// CONTEUDO POR CATEGORIA
// Eixo: fragmentação → integração → coerência
// ============================================================

// INTEGRAÇÃO — a tese central da Sete Ecos
const CONTEUDO_CORPO = [
  {
    hook: 'Tens profundidade em cada área da tua vida. Mas nenhuma fala com a outra.',
    corpo: 'Sabes sobre nutrição. Leste sobre emoções. Experimentaste meditação. Fizeste terapia. Mas cada conhecimento vive num compartimento estanque. A Sete Ecos é a arquitectura que liga tudo.',
    cta: 'Não é mais uma solução. É um sistema. — Vivianne',
  },
  {
    hook: 'Resolves o corpo numa app. A emoção noutra. O foco noutra. E depois?',
    corpo: 'Depois continuas exausta. Porque o problema nunca foi falta de ferramentas. Foi falta de integração. 7 apps separadas nunca vão funcionar como 1 sistema desenhado para conversar.',
    cta: '7 ecos. 1 sistema. As partes conversam entre si.',
  },
  {
    hook: 'A Sete Ecos nasceu de excesso. Não de falta.',
    corpo: 'Não nasceu porque faltava algo. Nasceu porque havia demasiado — camadas intelectuais, espirituais, profissionais, criativas, corporais — tudo a viver separado dentro da mesma pessoa.',
    cta: 'Isto é estrutura com consciência. — Vivianne',
  },
  {
    hook: 'Já tens disciplina. Já tens visão. O que te falta é coerência.',
    corpo: 'Coerência é quando o que comes, o que sentes, o que dizes, o que decides e quem és estão alinhados. Não perfeitos — alinhados. A Sete Ecos constrói esse alinhamento.',
    cta: 'Descobre o teu ponto de partida com o LUMINA. Grátis.',
  },
  {
    hook: 'Não construí mais uma app de bem-estar. Construí um sistema de integração.',
    corpo: 'Corpo (Vitalis). Valor (Áurea). Emoção (Serena). Vontade (Ignis). Energia (Ventis). Voz (Ecoa). Identidade (Imago). 7 dimensões que finalmente conversam entre si.',
    cta: 'Arquitectura humana. Não corporativa. Não mística performativa.',
  },
  {
    hook: 'A fragmentação cansa. E ninguém fala nisso.',
    corpo: 'Fazes tudo bem. Mas no fim do dia, algo não encaixa. Porque viver por pedaços — um para o trabalho, outro para a família, outro para ti — gasta mais energia do que qualquer rotina.',
    cta: 'A Sete Ecos existe para quem percebeu isto.',
  },
  {
    hook: 'Eu vivia muitas camadas ao mesmo tempo. E nenhuma se tocava.',
    corpo: 'Intelectual. Espiritual. Profissional. Criativa. Corporal. Todas profundas. Todas sérias. Todas separadas. A Sete Ecos nasceu como resposta: um sistema onde as partes conversam.',
    cta: 'A minha história é provavelmente a tua também. — Vivianne',
  },
  {
    hook: 'Se tratas cada dimensão da vida por separado, nunca sais dos ciclos.',
    corpo: 'Resolves o corpo — a emoção sabota. Resolves a emoção — a identidade bloqueia. Resolves a identidade — falta energia. É um ciclo. A Sete Ecos é a saída do ciclo.',
    cta: 'Não é melhorar partes. É integrar o todo.',
  },
];

// PROFUNDIDADE — para quem já fez muita coisa e procura algo com substância
const CONTEUDO_EMOCIONAL = [
  {
    hook: 'Isto não é para quem quer motivação. É para quem quer coerência.',
    corpo: 'Se procuras frases inspiradoras e promessas de transformação em 21 dias, isto não é para ti. A Sete Ecos é para quem já percebeu que a resposta não está numa frase bonita. Está na estrutura.',
    cta: 'Inteligência. Não inspiração. — Vivianne',
  },
  {
    hook: 'A maioria do wellness vende-te a versão fácil. Eu recusei-me.',
    corpo: 'Recusei-me a simplificar o que é complexo. A vida não tem uma dimensão. Tu não tens um problema. Tens camadas. E cada camada merece ser tratada com respeito, não com slogans.',
    cta: 'Estrutura com consciência. Não espuma.',
  },
  {
    hook: 'Se já percebeste que soluções isoladas não funcionam, esta conta é tua.',
    corpo: 'Esta conta é para gente que pensa. Que sente. Que já experimentou. Que sabe que a próxima app de hábitos não vai resolver o que falta. O que falta é integração.',
    cta: 'Começa pelo LUMINA. Grátis. 2 minutos. Sem promessas vazias.',
  },
  {
    hook: 'Não quero que me sigas por inspiração. Quero que me sigas por reconhecimento.',
    corpo: 'Se olhas para isto e pensas "alguém finalmente percebe a forma como eu funciono" — é isso. Não vim resolver o teu problema. Vim organizar o que já sabes.',
    cta: 'Isto foi pensado por quem vive profundidade. Não é raso.',
  },
  {
    hook: 'A Sete Ecos não nasceu para te melhorar. Nasceu para integrar o que já és.',
    corpo: 'Não és um projecto a corrigir. És uma pessoa com muitas dimensões que nunca tiveram espaço para se encontrar. Este sistema é esse espaço.',
    cta: 'Sem guru. Sem milagre. Só arquitectura humana.',
  },
  {
    hook: 'Eu criei isto porque me recusei a continuar a trabalhar a vida por pedaços.',
    corpo: 'Nutrição por um lado. Emoções por outro. Produtividade numa app. Meditação noutra. Identidade em lado nenhum. Chega. A vida é uma. O sistema que a suporta também devia ser.',
    cta: 'Sete Ecos. Porque as partes precisam de conversar.',
  },
  {
    hook: 'Há quanto tempo procuras algo que não sabes nomear? Talvez seja isto.',
    corpo: 'Não é falta de motivação. Não é preguiça. Não é depressão. É fragmentação. A sensação de que cada parte da tua vida está a funcionar — mas não juntas. Eu conheço essa sensação.',
    cta: 'O LUMINA é o primeiro passo. 2 minutos. Para ti.',
  },
];

// POSIÇÃO — o que torna a Sete Ecos diferente de tudo o resto
const CONTEUDO_PROVOCACAO = [
  {
    hook: 'Enquanto tratares partes isoladas, vais continuar a viver em ciclos.',
    corpo: 'Corpo sem emoção: recaída. Emoção sem identidade: instabilidade. Identidade sem voz: frustração. A indústria do bem-estar lucra com pedaços. A Sete Ecos recusa-se.',
    cta: '7 dimensões. 1 sistema. As partes conversam.',
  },
  {
    hook: 'Não sou guru. Não sou influencer. Sou alguém que construiu o que precisava.',
    corpo: 'Construí um sistema porque o que existia não servia. Nenhuma app tratava o corpo E a identidade. Nenhuma ligava a voz à emoção. Nenhuma via a pessoa inteira. Agora existe.',
    cta: 'E se te identificas, é para ti. — Vivianne',
  },
  {
    hook: 'O mercado do wellness vende esperança. Eu quero oferecer coerência.',
    corpo: 'Esperança é bonita. Mas sem estrutura, é vazio. Coerência é quando o que comes, sentes, dizes e decides estão alinhados. Isso não se compra numa frase motivacional.',
    cta: 'Descobre por onde começar. LUMINA — gratuito.',
  },
  {
    hook: '7 perguntas. 23 padrões. 8 dimensões da tua vida mapeadas.',
    corpo: 'Corpo. Energia. Mente. Emoção. Passado. Futuro. Conexão. Espelho. O LUMINA não mede peso. Mede como estás. De verdade. E é gratuito.',
    cta: 'Experimenta: app.seteecos.com/lumina',
  },
  {
    hook: 'Isto não é wellness estético. É arquitectura de integração.',
    corpo: 'Não vai ser bonito no Instagram. Não vai parecer fácil. Não vou prometer transformação em 21 dias. Vou prometer que cada dimensão da tua vida passa a ter um lugar. E que esses lugares conversam.',
    cta: 'Se isso te faz sentido, estás no sítio certo.',
  },
  {
    hook: 'Criar respeito antes de criar empatia. Essa é a posição.',
    corpo: 'Não quero que chores com os meus posts. Quero que pares e penses "isto foi pensado por alguém que sabe do que fala." O respeito vem antes. A confiança constrói-se depois.',
    cta: 'Sete Ecos. Estrutura com consciência. — Vivianne',
  },
];

// Juntar tudo num pool único rotativo
const TODO_CONTEUDO = [...CONTEUDO_CORPO, ...CONTEUDO_EMOCIONAL, ...CONTEUDO_PROVOCACAO];

const HASHTAGS_BASE = [
  '#seteecos', '#vitalis', '#transformacao',
  '#nutricaointeligente', '#saudereal', '#semdieta', '#bemestar',
];

const HASHTAGS_TEMATICOS = {
  corpo: ['#nutricao', '#comidadereal', '#comidadeverdade', '#porcoes', '#receitas'],
  emocional: ['#saudeemocional', '#autoconhecimento', '#mulherforte', '#comerconsciente'],
  provocacao: ['#verdadeincomoda', '#semfiltro', '#realidade', '#mudanca', '#chega'],
  lumina: ['#lumina', '#diagnostico', '#autoconhecimento', '#energia', '#checkin'],
  aurea: ['#aurea', '#autovalor', '#autoestima', '#mulherreal', '#empoderamento'],
};

// ============================================================
// CALENDARIO SEMANAL - Mais variado e estrategico
// ============================================================

const TEMAS_SEMANA = {
  0: { tema: 'emocional', titulo: 'Reflexão de Domingo', formato: 'carrossel', tipo: 'empatia' },
  1: { tema: 'provocação', titulo: 'Verdade Incomoda', formato: 'reel', tipo: 'desafio' },
  2: { tema: 'corpo', titulo: 'Mito vs Realidade', formato: 'carrossel', tipo: 'educação' },
  3: { tema: 'emocional', titulo: 'História Real', formato: 'stories', tipo: 'testemunho' },
  4: { tema: 'provocação', titulo: 'Pergunta que Doi', formato: 'reel', tipo: 'provocação' },
  5: { tema: 'corpo', titulo: 'Receita + Dica', formato: 'reel', tipo: 'valor' },
  6: { tema: 'emocional', titulo: 'Carta para Ti', formato: 'post', tipo: 'conexão' },
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

function getConteudoByTema(tema, seed) {
  if (tema === 'corpo') return pickFromArray(CONTEUDO_CORPO, seed);
  if (tema === 'emocional') return pickFromArray(CONTEUDO_EMOCIONAL, seed);
  return pickFromArray(CONTEUDO_PROVOCACAO, seed);
}

export function gerarConteudoHoje(date = new Date(), variante = 0) {
  const dayOfWeek = date.getDay();
  const dayOfYear = getDayOfYear(date);
  const seed = dayOfYear + variante;
  const { tema, titulo, formato, tipo } = TEMAS_SEMANA[dayOfWeek];
  const conteudo = getConteudoByTema(tema, seed);

  const hashBase = HASHTAGS_BASE.slice(0, 4);
  const hashTema = (HASHTAGS_TEMATICOS[tema] || []).slice(0, 4);

  return {
    data: date.toISOString().split('T')[0],
    diaSemana: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayOfWeek],
    tema,
    titulo,
    formato,
    tipo,
    hook: conteudo.hook,
    dica: conteudo.hook, // backwards compat
    corpo: conteudo.corpo,
    cta: conteudo.cta,
    hashtags: [...hashBase, ...hashTema],
  };
}

export function totalVariantes(tema) {
  if (tema === 'corpo') return CONTEUDO_CORPO.length;
  if (tema === 'emocional') return CONTEUDO_EMOCIONAL.length;
  return CONTEUDO_PROVOCACAO.length;
}

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
// WHATSAPP - Mensagens que soam como a Vivianne a falar
// ============================================================

export function gerarMensagemWhatsApp(tipo = 'dica', campanha = '', variante = 0) {
  const hoje = gerarConteudoHoje(new Date(), variante);
  const camp = campanha || `whatsapp-${hoje.data}`;
  const linkVitalis = buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.whatsappBroadcast(camp));
  const linkLumina = buildUTMUrl(`${BASE_URL}/lumina`, UTM_TEMPLATES.whatsappBroadcast(camp + '-lumina'));

  const templates = {
    // Dica crua e directa
    dica: `${hoje.hook}\n\n${hoje.corpo}\n\n${hoje.cta}\n\n👉 ${linkVitalis}`,

    // Provocacao pura
    provocacao: `*${hoje.hook}*\n\nVou dizer uma coisa que talvez ninguém te disse:\n\n${hoje.corpo}\n\nSe isto te tocou, não ignores.\n\n👉 ${linkLumina}\n\nÉ gratuito. 2 minutos. Começa por ti.`,

    // Voz pessoal (como se a Viv estivesse a falar)
    pessoal: `Olá 🤍\n\nHoje quero partilhar algo que me incomoda:\n\n_${hoje.hook}_\n\n${hoje.corpo}\n\nSe te identificas, responde a esta mensagem. Quero saber como te sentes.\n\nOu experimenta o diagnóstico gratuito:\n${linkLumina}`,

    // Urgencia real
    urgencia: `⚡ Pergunta honesta:\n\nHá quanto tempo dizes "vou começar na segunda"?\n\nSemanas? Meses? Anos?\n\nEnquanto esperas pelo "momento certo", o teu corpo continua a pedir ajuda.\n\nDeixa de esperar.\n\n2 minutos. Gratuito. Agora:\n${linkLumina}`,

    // Promo directa
    promo: `*Isto não é uma dieta. É o fim das dietas.* 💥\n\nO VITALIS é coaching nutricional REAL:\n\n🍽 Plano feito para TI (não copiado da internet)\n📱 Coach IA que te responde às 3 da manhã\n💚 Espaço emocional para os dias difíceis\n📊 Dashboard que mostra o teu progresso real\n📖 Receitas com comida real e acessível\n\nEnvia-me DM para saber como começar 🌿\n\n👉 ${linkVitalis}`,

    // Testemunho cru
    testemunho: `*"Chorei quando vi os meus resultados."*\n\nNão porque perdi peso.\n\nMas porque pela primeira vez em anos, comi sem culpa.\n\nPassei a vida inteira a fazer dieta. A sentir-me falhada. O VITALIS não me deu uma lista de alimentos. Deu-me uma nova relação com a comida.\n\n_- Cliente VITALIS_\n\nQueres saber como?\n👉 ${linkVitalis}`,

    // Lumina como anzol
    lumina: `Faz-te estas 7 perguntas:\n\n1. Como está a tua energia hoje?\n2. Onde sentes tensão no corpo?\n3. O que viste no espelho?\n4. Pensaste muito no passado?\n5. Preocupaste-te com o futuro?\n6. A tua mente está clara ou confusa?\n7. Sentes vontade de conexão ou isolamento?\n\nO LUMINA analisa as tuas respostas e revela padrões que não vias.\n\nGratuito. 2 minutos. 23 leituras possíveis.\n\n${linkLumina}`,

    // Status rápido (para WhatsApp Status)
    status: `_${hoje.hook}_\n\n${hoje.cta} 🌿\n\n${linkVitalis}`,

    // DM pessoal (para enviar a uma pessoa)
    dm: `Olá! 🤍\n\nEu sou a Vivianne e criei uma coisa que acho que te pode interessar.\n\nÉ um diagnóstico gratuito que te diz como estás REALMENTE - energia, emoção, corpo - em 2 minutos.\n\nNão é questionário chato. É uma leitura personalizada.\n\nExperimenta e diz-me o que achaste:\n${linkLumina}\n\nSe quiseres saber mais, estou aqui 🤍`,

    // Sequencia Stories WhatsApp (5 partes)
    storiesSeq: `📱 *SEQUENCIA DE 5 STATUS* (publica um de cada vez, de hora em hora):\n\n*Status 1 (9h):*\n_${hoje.hook}_\n\n*Status 2 (11h):*\n_${hoje.corpo}_\n\n*Status 3 (13h):*\n_Sabias que a maioria das pessoas nunca recebeu orientação nutricional personalizada?_\n\n*Status 4 (16h):*\n_${hoje.cta}\nExperimenta grátis: ${linkLumina}_\n\n*Status 5 (19h):*\n_Hoje já cuidaste de ti? Mesmo 2 minutos contam.\n${linkLumina}_`,

    // Audio script (para gravar nota de voz)
    audio: `🎙 *SCRIPT PARA NOTA DE VOZ* (grava e envia para contactos):\n\n"Olá, tudo bem contigo? Olha, queria partilhar uma coisa contigo.\n\nEu descobri uma ferramenta gratuita que faz um diagnóstico de como tu estás - energia, emoção, corpo - em 2 minutinhos. Chama-se Lumina.\n\nEu experimentei e fiquei impressionada com a leitura. Parecia que me conhecia.\n\nVou mandar-te o link, experimenta e depois diz-me o que achaste, tá?\n\n[envia o link logo a seguir]\n\n${linkLumina}"`,

    // Para grupos de mulheres
    grupo: `*Para todas as mulheres neste grupo* 💜\n\nVou ser directa: a maioria de nós nunca aprendeu a comer.\n\nAprendemos a fazer dieta. A contar calorias. A sentir culpa.\n\nMas ninguém nos ensinou a OUVIR o corpo.\n\nHoje quero partilhar algo que me mudou: um diagnóstico gratuito que analisa a tua energia, emoção e corpo em 2 minutos.\n\nNão vende nada. Não pede cartão. É só... um espelho.\n\n${linkLumina}\n\nExperimenta e partilha aqui o que achaste 🤍`,
  };

  return {
    mensagem: templates[tipo] || templates.dica,
    link: linkVitalis,
    tipo,
    campanha: camp,
  };
}

export function gerarStatusWhatsApp(campanha = '', variante = 0) {
  const hoje = gerarConteudoHoje(new Date(), variante);
  const camp = campanha || `status-${hoje.data}`;
  const link = buildUTMUrl(`${BASE_URL}/lumina`, UTM_TEMPLATES.whatsappStatus(camp));
  return {
    mensagem: `_${hoje.hook}_\n\n🌿 Descobre mais: ${link}`,
    link,
  };
}

// ============================================================
// INSTAGRAM - Captions que param o scroll
// ============================================================

export function gerarCaptionInstagram(tipo = 'post', variante = 0) {
  const hoje = gerarConteudoHoje(new Date(), variante);
  const hashtagStr = hoje.hashtags.join(' ');

  const templates = {
    post: `${hoje.hook}\n\n${hoje.corpo}\n\n${hoje.cta}\n\nLink na bio 👆\n.\n.\n.\n${hashtagStr}`,

    reel: `${hoje.hook} 🔥\n\n${hoje.corpo}\n\nGuarda isto. Partilha com alguém que precisa de ouvir.\n\n${hashtagStr}`,

    carrossel: `SLIDE 1 (CAPA): ${hoje.hook}\n\nSLIDE 2: ${hoje.corpo.split('.').slice(0, 2).join('.')}\n\nSLIDE 3: ${hoje.corpo.split('.').slice(2).join('.')}\n\nSLIDE 4: ${hoje.cta}\n\nSLIDE 5 (FINAL): Experimenta o LUMINA - diagnóstico gratuito em 2 min. Link na bio.\n\n---\n\nCAPTION:\n${hoje.hook}\n\nDesliza para a verdade que ninguém te conta 👉\n\n${hashtagStr}`,

    stories: `📱 *SEQUENCIA DE 5 STORIES:*\n\n*Story 1:* Poll - "${hoje.hook}" (SIM / NÃO)\n\n*Story 2:* Texto sobre fundo de cor:\n"${hoje.corpo.split('.')[0]}"\n\n*Story 3:* Slider - "Quanto te identificas? 0-100%"\n\n*Story 4:* "${hoje.cta}"\n\n*Story 5:* Swipe up / Link - LUMINA gratuito`,

    reelScript: `🎬 *SCRIPT PARA REEL (30-60 seg):*\n\n*HOOK (0-3s):* [Olha para camera]\n"${hoje.hook}"\n\n*DESENVOLVIMENTO (3-25s):*\n"${hoje.corpo}"\n\n*CTA (25-30s):*\n"${hoje.cta}. Link na bio."\n\n*AUDIO:* Musica trending ou voz original\n*TEXTO NA TELA:* "${hoje.hook.split('.')[0]}"`,
  };

  return {
    caption: templates[tipo] || templates.post,
    formato: tipo,
    hashtags: hashtagStr,
    dica: hoje.hook,
    hook: hoje.hook,
  };
}

// ============================================================
// SCRIPTS DE VOZ PARA REELS/STORIES
// ============================================================

export function gerarScriptVoz() {
  const hoje = gerarConteudoHoje();
  return {
    reel30s: `[Camera frontal, olha directamente]\n\n"${hoje.hook}"\n\n[Pausa 1 segundo]\n\n"${hoje.corpo}"\n\n[Tom mais suave]\n\n"${hoje.cta}. Link na bio."`,

    storiesVoz: `[Fundo simples, face visivel]\n\n"Vou dizer uma coisa que talvez ninguém te disse..."\n\n[Pausa]\n\n"${hoje.hook}"\n\n[Proximo story]\n\n"Se isto te tocou, há uma ferramenta gratuita que te pode ajudar. Chama-se LUMINA. Link em cima."`,

    audioWhatsApp: `"Olá! Hoje quero partilhar algo importante contigo.\n\n${hoje.hook}\n\nPorque digo isto? Porque ${hoje.corpo.toLowerCase()}\n\nSe te identificas, experimenta o LUMINA - é gratuito e demora 2 minutinhos. Vou mandar-te o link."`,
  };
}

// ============================================================
// CAMPANHAS LANCAMENTO - Sequencias de 7 dias
// ============================================================

export function getCampanhaLancamento() {
  return [
    {
      dia: 1,
      titulo: 'TEASE - O Problema',
      whatsapp: '*Vou dizer algo que me incomoda há muito tempo.*\n\nA maioria das mulheres que conheço está em guerra com o próprio corpo.\n\nDietas. Culpa. Restrição. Mais culpa.\n\nE ninguém fala disto.\n\nNos próximos 7 dias, vou partilhar algo que pode mudar isso. Fica atenta.',
      instagram: 'Algo está errado.\n\nA maioria das mulheres que conheço está em guerra com o próprio corpo.\n\nE ninguém fala disto.\n\nEsta semana, vou mudar isso.\n\nActiva as notificações 🔔',
      stories: 'Poll: "Já fizeste uma dieta que não funcionou?" SIM/NÃO',
    },
    {
      dia: 2,
      titulo: 'EDUCACAO - O Mito',
      whatsapp: '*Mentira #1 que te venderam:*\n\n"Se comeres menos, emagreces."\n\nFalso.\n\nQuando comes de menos, o metabolismo ABRANDA. O corpo entra em modo de sobrevivência. Quando voltas a comer normal, ganhas tudo de volta. É mais.\n\nNão é falta de disciplina. É biologia.\n\nAmanhã conto-te o que realmente funciona.',
      instagram: 'MENTIRA #1 que te venderam sobre emagrecer.\n\n"Come menos." ❌\n\nA verdade? Quando comes de menos, o metabolismo abranda.\n\nO corpo não é estúpido. Protege-se.\n\nDesliza para entender o que realmente acontece 👉',
      stories: 'Caixa de perguntas: "Qual a dieta mais absurda que já fizeste?"',
    },
    {
      dia: 3,
      titulo: 'VULNERABILIDADE - A Vivianne',
      whatsapp: 'Hoje quero ser honesta contigo.\n\nAntes de criar o Sete Ecos, eu também lutava com a comida.\n\nJejuava por culpa. Comia escondida. Pesava-me todos os dias.\n\nAté que percebi: o problema nunca foi o meu corpo. Era a minha relação com ele.\n\nFoi isso que me levou a criar algo diferente.\n\nAmanhã mostro-te o que.',
      instagram: 'História que nunca contei.\n\nAntes de criar o @seteecos, eu também estive em guerra com o meu corpo.\n\nJejuava por culpa. Comia escondida. Pesava-me todos os dias.\n\nAté que percebi algo que mudou tudo...\n\n(continua nos comentários)',
      stories: 'Video pessoal: "Hoje vou ser vulnerável convosco..."',
    },
    {
      dia: 4,
      titulo: 'REVELACAO - O LUMINA',
      whatsapp: '*E se te dissesse que em 2 minutos podes descobrir padrões que nunca viste em ti?*\n\n7 perguntas sobre energia, emoção e corpo.\n23 leituras possíveis.\n1 espelho digital.\n\nChama-se LUMINA. É gratuito.\n\nExperimenta agora e diz-me o que achaste:\n',
      instagram: '2 minutos que podem mudar a forma como te vês.\n\n7 perguntas.\n23 padrões.\n1 leitura que parece que te conhece.\n\nO LUMINA é gratuito. É diferente de tudo o que já experimentaste.\n\nLink na bio 🔮',
      stories: 'Countdown: "LUMINA - Diagnóstico gratuito" + Swipe up',
    },
    {
      dia: 5,
      titulo: 'PROVA SOCIAL - Resultados',
      whatsapp: '*Isto é o que acontece quando paras de fazer dieta e começas a OUVIR o teu corpo:*\n\n"Perdi 8kg mas o melhor foi parar de chorar depois de comer." - M.J.\n\n"A minha filha disse que estou diferente. Não mais magra. Mais feliz." - A.B.\n\n"Pela primeira vez não desisti ao 3o dia." - S.C.\n\nO VITALIS não é uma dieta. É o fim das dietas.\n\n',
      instagram: 'Resultados reais. Sem filtro.\n\n"Perdi 8kg mas o melhor foi parar de chorar depois de comer."\n\n"A minha filha disse que estou diferente. Não mais magra. Mais feliz."\n\nIsto é possível para ti também.\n\nLink na bio.',
      stories: 'Screenshots de mensagens de clientes (com permissão) + reações',
    },
    {
      dia: 6,
      titulo: 'OBJECOES - Porque não',
      whatsapp: '*"Não tenho tempo."*\n\nO check-in diário demora 2 minutos.\nAs receitas são rápidas.\nA app está no teu telemóvel.\n\n*"Já tentei tudo."*\n\nMas nunca tentaste algo que cuida da tua EMOÇÃO ao mesmo tempo que cuida da tua COMIDA.\n\nÉ isso que o VITALIS faz.\n\n7 dias de garantia. Sem risco. Envia-me DM para saber mais.\n\n',
      instagram: '"Já tentei tudo."\n\nMas nunca tentaste algo que cuida da tua EMOÇÃO ao mesmo tempo.\n\n90% dos problemas com comida são emocionais.\n\nO VITALIS é o primeiro programa que trata os dois.\n\nLink na bio.',
      stories: 'Q&A: Responder às dúvidas mais comuns sobre o VITALIS',
    },
    {
      dia: 7,
      titulo: 'CTA FINAL - Agora ou Nunca',
      whatsapp: '*Hoje é o dia.*\n\nJá viste o problema.\nJá ouviste a minha história.\nJá experimentaste o LUMINA.\nJá leste os resultados reais.\n\nAgora só falta uma coisa: TU decidires.\n\nNão na próxima segunda. Agora.\n\nO VITALIS está aberto. 7 dias de garantia.\n\nDaqui a 3 meses, vais agradecer-te.\n\n👉 ',
      instagram: 'Deixa-me ser directa.\n\nSe chegaste até aqui, não é por acaso.\n\nSe algo dentro de ti ressoou esta semana, ouve isso.\n\nNão na próxima segunda. Agora.\n\nO link está na bio. A decisão é tua.\n\nDaqui a 3 meses, vais agradecer-te. 🤍',
      stories: 'Countdown final + Swipe up + "Hoje é o dia"',
    },
  ];
}

// ============================================================
// CARROSSEIS PRONTOS - 5 slides cada, prontos para descarregar
// ============================================================

export function getCarrosseisProntos() {
  return [
    {
      id: 'mitos-alimentação',
      titulo: '5 Mitos sobre Alimentação',
      marca: 'vitalis',
      cor: '#7C8B6F',
      slides: [
        { titulo: '5 Mitos que Destroem a tua Saúde', texto: 'Quantos destes já acreditaste?' },
        { titulo: 'Mito 1: Hidratos engordam', texto: 'Falso. O que importa é a porção e o acompanhamento. Hidratos são energia essencial.' },
        { titulo: 'Mito 2: Preciso de suplementos caros', texto: 'Feijão, ovo, amendoim, lentilhas. Proteína acessível em qualquer mercado.' },
        { titulo: 'Mito 3: Comer menos = emagrecer', texto: 'Quando comes de menos, o metabolismo abranda. Comer MELHOR é o segredo.' },
        { titulo: 'Mito 4: Salada todos os dias', texto: 'Comida saudável tem sabor. Caril de coco, piri-piri. Porção certa = saúde.' },
        { titulo: 'Para de acreditar em mitos.', texto: 'VITALIS - Coaching Nutricional\napp.seteecos.com' },
      ],
      caption: '5 mitos que provavelmente já acreditaste (eu também!) 🫣\n\nDesliza e descobre a verdade.\n\nSalva este post. Partilha com alguém que precisa.\n\n#seteecos #vitalis #nutricaointeligente #mitos #comidadereal #saudereal',
    },
    {
      id: 'fome-emocional',
      titulo: '4 Sinais de Fome Emocional',
      marca: 'vitalis',
      cor: '#7C8B6F',
      slides: [
        { titulo: 'Tens fome ou tens medo?', texto: '4 sinais de que comes por emoção, não por necessidade.' },
        { titulo: 'Sinal 1: Comes sem fome', texto: 'Quando a boca quer mas o estômago não pede. É emoção disfarçada.' },
        { titulo: 'Sinal 2: Comes escondida', texto: 'Se precisas de esconder o que comes, o problema não é a comida.' },
        { titulo: 'Sinal 3: Culpa depois de comer', texto: 'Comer não é crime. Se sentes culpa, alguém te ensinou a ter medo.' },
        { titulo: 'Sinal 4: Comer acalma a ansiedade', texto: 'A comida virou anestesia. O corpo encontrou uma forma de lidar com a dor.' },
        { titulo: 'Há uma saída. E não é mais uma dieta.', texto: 'VITALIS - Espaço de Retorno Emocional\napp.seteecos.com' },
      ],
      caption: 'Tens fome... ou algo dentro de ti precisa de atenção? 🤍\n\nDesliza e descobre os 4 sinais de fome emocional.\n\nPartilha com alguém que precisa de ouvir isto.\n\n#seteecos #vitalis #fomeemocional #saudeemocional #mulherforte #comerconsciente',
    },
    {
      id: 'porções-mãos',
      titulo: 'Guia de Porções com as Mãos',
      marca: 'vitalis',
      cor: '#7C8B6F',
      slides: [
        { titulo: 'Esquece a balança. Usa as mãos.', texto: 'O guia mais simples para porções correctas.' },
        { titulo: 'Palma aberta = Proteína', texto: 'Frango, peixe, carne, ovo. Uma palma por refeição.' },
        { titulo: 'Punho fechado = Hidratos', texto: 'Arroz, massa, batata, pão. Um punho por refeição. É suficiente.' },
        { titulo: 'Polegar = Gorduras', texto: 'Óleo, amendoim, abacate. Um polegar. Pouco mas essencial.' },
        { titulo: 'Duas mãos = Legumes', texto: 'Quanto mais legumes, melhor. Sem limite. Enche o prato.' },
        { titulo: 'Sem balança. Sem apps. Só as tuas mãos.', texto: 'VITALIS - Coaching Nutricional\napp.seteecos.com' },
      ],
      caption: 'A forma mais simples de medir porções que já vi 🤲\n\nNão precisa de balança. Não precisa de app de calorias. Só as tuas mãos.\n\nSalva e usa na tua próxima refeição.\n\n#seteecos #vitalis #porcoes #nutricao #comidadereal #dicasdesaude',
    },
    {
      id: 'lumina-como-funciona',
      titulo: 'LUMINA: O Diagnóstico que Ninguém te Fez',
      marca: 'lumina',
      cor: '#5C6BC0',
      slides: [
        { titulo: 'O diagnóstico que ninguém te fez.', texto: '2 minutos. 7 perguntas. 23 padrões possíveis.' },
        { titulo: '7 perguntas simples', texto: 'Energia, tensão, imagem, passado, futuro, clareza, conexão.' },
        { titulo: '23 leituras possíveis', texto: 'Críticas, alertas, proteção, transição, equilíbrio. O LUMINA encontra O TEU padrão.' },
        { titulo: 'Uma leitura só tua', texto: 'Não é horóscopo. É baseado nas tuas respostas reais de hoje.' },
        { titulo: 'Gratuito. Sem registo. 2 minutos.', texto: 'LUMINA - app.seteecos.com/lumina' },
      ],
      caption: 'Quando foi a última vez que alguém te perguntou como te sentes REALMENTE? 🔮\n\nO LUMINA faz-te 7 perguntas e revela padrões que não vias.\n\nGratuito. 2 minutos. Link na bio.\n\n#seteecos #lumina #autoconhecimento #diagnostico #saudeemocional #bemestar',
    },
    {
      id: 'vitalis-o-que-inclui',
      titulo: 'O que o VITALIS Inclui',
      marca: 'vitalis',
      cor: '#7C8B6F',
      slides: [
        { titulo: 'Não é uma dieta. É o fim das dietas.', texto: 'VITALIS - Coaching Nutricional Personalizado' },
        { titulo: 'Plano alimentar feito para TI', texto: 'Com comida real e acessível. Adaptado à tua rotina. Sem listas impossíveis.' },
        { titulo: 'Coach IA disponível 24h', texto: 'Pergunta o que quiseres. A qualquer hora. Sem julgamento.' },
        { titulo: 'Espaço emocional para dias difíceis', texto: 'Recaíste? Sem problema. Há um espaço para isso. Sem culpa.' },
        { titulo: 'Dashboard + Receitas + Desafios', texto: 'Tudo no teu telemóvel. Progresso real que podes ver.' },
        { titulo: 'Queres saber mais? Envia-me DM.', texto: 'VITALIS — app.seteecos.com' },
      ],
      caption: 'O VITALIS não é mais uma dieta. É o único programa que cuida da tua COMIDA e da tua EMOÇÃO ao mesmo tempo. 🌿\n\nDesliza para ver tudo o que inclui.\n\nEnvia DM para saber como começar.\n\nLink na bio.\n\n#seteecos #vitalis #coachingnutricional #saudereal #bemestar #transformacao',
    },
    {
      id: 'ciclo-dieta',
      titulo: 'O Ciclo Vicioso da Dieta',
      marca: 'seteEcos',
      cor: '#6B5B95',
      slides: [
        { titulo: '80% dos problemas com comida são emocionais.', texto: 'Conhece o ciclo que te prende.' },
        { titulo: 'STRESS → Comes demais', texto: 'O corpo procura conforto rápido. Açúcar. Hidratos. Comida processada.' },
        { titulo: 'CULPA → Restringes', texto: '"Amanhã não como nada." "Vou só beber água." A punição começa.' },
        { titulo: 'RESTRIÇÃO → Compulsão', texto: 'O corpo não aguenta. Comes tudo. A culpa volta. Repete.' },
        { titulo: 'A saída não é mais disciplina. É compreensão.', texto: 'SETE ECOS - Transmutação Feminina\napp.seteecos.com' },
      ],
      caption: 'Já estiveste presa neste ciclo? Eu também. 🔄\n\nStress → Comida → Culpa → Restrição → Compulsão → Mais culpa.\n\nA saída não é mais força de vontade. É entender PORQUE acontece.\n\nDesliza.\n\n#seteecos #ciclovicioso #saudeemocional #semdieta #mulherforte #realidade',
    },
    {
      id: 'aurea-autovalor',
      titulo: 'AUREA: O Programa de Autovalor',
      marca: 'aurea',
      cor: '#C9A227',
      slides: [
        { titulo: 'O teu valor não cabe numa calça tamanho S.', texto: 'AUREA - Programa de Autovalor Feminino' },
        { titulo: 'Foste ensinada a duvidar de ti.', texto: 'Pela escola. Pela TV. Pelas redes. Pelo espelho. Mas isso é uma mentira.' },
        { titulo: '7 semanas de reconexão.', texto: 'Exercícios, reflexões e ferramentas para reconstruir a relação contigo mesma.' },
        { titulo: 'O teu corpo é a tua casa. Não um projecto.', texto: 'Para de tentar arranja-lo. Começa a habita-lo.' },
        { titulo: 'ÁUREA: envia DM para saber mais.', texto: 'app.seteecos.com/aurea' },
      ],
      caption: 'O teu valor não depende do que vestes, pesas ou aparentas. 🤍\n\nO ÁUREA é um programa de 7 semanas para reconstruir a relação contigo.\n\nPorque antes de mudar o corpo, precisas de mudar o olhar.\n\nLink na bio.\n\n#seteecos #aurea #autovalor #autoestima #mulherreal #empoderamento #wellness',
    },
    {
      id: 'testemunhos-reais',
      titulo: 'Transformações Reais',
      marca: 'vitalis',
      cor: '#7C8B6F',
      slides: [
        { titulo: 'O que acontece quando paras de fazer dieta.', texto: 'Histórias reais de mulheres como tu.' },
        { titulo: '"Perdi 8kg mas o melhor foi parar de chorar depois de comer."', texto: '- M.J.' },
        { titulo: '"A minha filha disse que estou diferente. Não mais magra. Mais feliz."', texto: '- A.B.' },
        { titulo: '"Pela primeira vez não desisti ao 3o dia."', texto: '- S.C.' },
        { titulo: 'A próxima história pode ser a tua.', texto: 'VITALIS - Começa hoje\napp.seteecos.com/vitalis' },
      ],
      caption: 'Resultados reais. Sem filtro. Sem Photoshop. 🤍\n\nEstas mulheres decidiram parar de fazer dieta e começar a VIVER.\n\nA próxima história pode ser a tua.\n\nLink na bio.\n\n#seteecos #vitalis #transformacao #resultadosreais #semfiltro #bemestar',
    },
  ];
}

// ============================================================
// CALENDARIO MENSAL - 30 dias de conteúdo planeado
// ============================================================

export function gerarConteudoMensal(ano, mes) {
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const dias = [];
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const date = new Date(ano, mes, dia);
    const conteudo = gerarConteudoHoje(date);
    dias.push({
      ...conteudo,
      dia,
      dayOfWeek: date.getDay(),
    });
  }
  return dias;
}

// ============================================================
// PLANO DE LANCAMENTO - 12 POSTS GRID INSTAGRAM
// ============================================================

export function getGridInstagram() {
  return [
    {
      ordem: 1, dia: 'Dom 8', titulo: 'Apresentação da Marca',
      template: 'cta', eco: 'seteEcos', formato: 'post',
      texto: 'Comida. Emoção. Corpo. Mente. Tudo está ligado.',
      subtitulo: 'SETE ECOS - Sistema de Transmutação Feminina',
      caption: 'E se existisse um sistema que cuida de TI como um todo?\n\nNão só a comida. Não só o peso. TU - inteira.\n\nComida. Emoção. Corpo. Mente. Tudo está ligado.\n\nIsto é o SETE ECOS. E está aqui para ti.\n\nSegue para acompanhar esta jornada 🤍\n\n#seteecos #transmutacaofeminina #bemestar #bemestar #saudeintegral #saudereal',
    },
    {
      ordem: 2, dia: 'Dom 8', titulo: 'Quem é a Vivianne',
      template: 'testemunho', eco: 'seteEcos', formato: 'post',
      texto: 'Antes de criar o Sete Ecos, eu também estive em guerra com o meu corpo.',
      subtitulo: '- Vivianne, Fundadora',
      caption: 'Olá. Sou a Vivianne.\n\nAntes de criar o @seteecos, eu também estive em guerra com o meu corpo.\n\nJejuava por culpa. Comia escondida. Pesava-me todos os dias.\n\nAté que percebi: o problema nunca foi o meu corpo. Era a minha relação com ele.\n\nCriei o Sete Ecos para que nenhuma mulher tenha de passar pelo que eu passei. Sozinha.\n\nSe te identificas, segue esta página. 🤍\n\n#seteecos #historiapessoal #mulherreal #wellness #comidaeemocao',
    },
    {
      ordem: 3, dia: 'Dom 8', titulo: 'Primeiro Hook Emocional',
      template: 'dica', eco: 'vitalis', formato: 'post',
      texto: 'Ninguém te ensinou a comer. Ensinaram-te a ter medo de comer.',
      subtitulo: '@seteecos',
      caption: 'Ninguém te ensinou a comer. Ensinaram-te a ter medo de comer.\n\nMedo de hidratos. Medo de gordura. Medo de jantar depois das 18h. Medo de viver.\n\nE se te dissesse que podes comer sem culpa, sem medo, sem restrição - e mesmo assim transformar o teu corpo?\n\nFica atenta. Algo está a mudar. 🌿\n\n#seteecos #semdieta #semculpa #alimentacaoconsciente #bemestar #nutricao',
    },
    {
      ordem: 4, dia: 'Seg 9', titulo: 'Carrossel: 5 Mitos',
      template: 'carrossel', eco: 'vitalis', formato: 'post',
      carrosselId: 'mitos-alimentação',
      caption: '5 mitos que provavelmente já acreditaste (eu também!) 🫣\n\nDesliza e descobre a verdade sobre alimentação.\n\nSalva este post. Partilha com alguém que precisa.\n\n#seteecos #vitalis #nutricaointeligente #mitos #comidadereal #saudereal',
    },
    {
      ordem: 5, dia: 'Seg 9', titulo: 'Estatística de Impacto',
      template: 'stats', eco: 'vitalis', formato: 'post',
      texto: '80%',
      subtitulo: 'dos problemas com comida são emocionais. Não é falta de disciplina. É dor.',
      caption: '80% dos problemas com comida são emocionais.\n\nNão é falta de disciplina. É dor.\n\nStress. Solidão. Frustração. O corpo encontrou uma forma de se acalmar.\n\nE se em vez de castigo, o teu corpo recebesse compreensão?\n\nGuarda este post. 🤍\n\n#seteecos #fomeemocional #saudeemocional #estatistica #mulherforte #comerconsciente',
    },
    {
      ordem: 6, dia: 'Ter 10', titulo: 'Carrossel: Porções',
      template: 'carrossel', eco: 'vitalis', formato: 'post',
      carrosselId: 'porções-mãos',
      caption: 'A forma mais simples de medir porções 🤲\n\nSem balança. Sem app de calorias. Só as tuas mãos.\n\nSalva e usa na tua próxima refeição.\n\n#seteecos #vitalis #porcoes #nutricao #comidadereal #dicasdesaude',
    },
    {
      ordem: 7, dia: 'Qua 11', titulo: 'LUMINA Teaser',
      template: 'cta', eco: 'lumina', formato: 'post',
      texto: '7 perguntas. 23 padrões. O diagnóstico que ninguém te fez.',
      subtitulo: 'LUMINA - Gratuito. 2 minutos.',
      caption: 'Quando foi a última vez que alguém te perguntou como te sentes REALMENTE?\n\nNão o que comes. Não quanto pesas. Como TE SENTES.\n\nO LUMINA faz-te 7 perguntas sobre energia, emoção e corpo. E revela padrões que não vias.\n\n🔮 Gratuito. 2 minutos. 23 leituras possíveis.\n\nLink na bio.\n\n#seteecos #lumina #diagnostico #autoconhecimento #saudeemocional #bemestar',
    },
    {
      ordem: 8, dia: 'Qui 12', titulo: 'Testemunho',
      template: 'testemunho', eco: 'vitalis', formato: 'post',
      texto: 'Perdi 8kg mas o melhor foi parar de chorar depois de comer.',
      subtitulo: '- M.J.',
      caption: '"Perdi 8kg mas o melhor foi parar de chorar depois de comer."\n\nEsta frase é real. De uma pessoa real.\n\nNão perdeu peso por fazer dieta. Perdeu peso porque parou de sofrer com a comida.\n\nIsto é possível para ti também.\n\nFica atenta. 🌿\n\n#seteecos #vitalis #transformacao #resultadosreais #semfiltro #bemestar',
    },
    {
      ordem: 9, dia: 'Sex 13', titulo: 'Hook Relatable',
      template: 'dica', eco: 'seteEcos', formato: 'post',
      texto: 'Se cozinhas para a família inteira e comes os restos em pé na cozinha, este post é para ti.',
      subtitulo: '@seteecos',
      caption: 'Se cozinhas para a família inteira e comes os restos em pé na cozinha, este post é para ti.\n\nTu também mereces sentar. Comer com calma. Ter um prato pensado para TI.\n\nA tua saúde importa tanto quanto a deles.\n\nPartilha com uma mulher que precisa de ouvir isto. 🤍\n\n#seteecos #bemestar #cuidadeti #maes #comidaconsciente #realidade',
    },
    {
      ordem: 10, dia: 'Sáb 14', titulo: 'Carrossel: LUMINA',
      template: 'carrossel', eco: 'lumina', formato: 'post',
      carrosselId: 'lumina-como-funciona',
      caption: 'O diagnóstico que ninguém te fez 🔮\n\nO LUMINA analisa energia, emoção e corpo em 2 minutos.\n\nGratuito. Link na bio.\n\n#seteecos #lumina #autoconhecimento #diagnostico #saudeemocional #bemestar',
    },
    {
      ordem: 11, dia: 'Sáb 14', titulo: 'VITALIS Reveal',
      template: 'cta', eco: 'vitalis', formato: 'post',
      texto: 'Não é uma dieta. É o fim das dietas.',
      subtitulo: 'VITALIS - Abre próxima semana',
      caption: 'Algo que estive a construir há muito tempo.\n\nUm programa que não te dá uma lista e te deseja boa sorte.\n\n🍽 Plano alimentar com comida local (matapa, xima, feijão nhemba)\n🧠 Cuida da emoção ao mesmo tempo que da comida\n📱 Coach IA disponível 24h\n💚 Espaço para os dias difíceis\n\nChama-se VITALIS. Abre na próxima semana.\n\nQueres ser das primeiras? Experimenta o LUMINA (link na bio) 🌿\n\n#seteecos #vitalis #lancamento #coachingnutricional #embreve #bemestar',
    },
    {
      ordem: 12, dia: 'Sáb 14', titulo: 'Teaser Final',
      template: 'dica', eco: 'vitalis', formato: 'post',
      texto: 'Próxima semana, tudo muda.',
      subtitulo: 'VITALIS - Em breve',
      caption: 'Próxima semana, tudo muda.\n\nSe esta semana algo ressoou contigo...\nSe te identificaste com algum post...\nSe o LUMINA te surpreendeu...\n\nEntão estás pronta.\n\nActiva as notificações 🔔\n\n🌿\n\n#seteecos #vitalis #embreve #lancamento #transformacao #bemestar',
    },
  ];
}

// ============================================================
// ANUNCIOS PAGOS - Facebook / Instagram Ads
// ============================================================

export function getAnunciosPagos() {
  return [
    {
      id: 'lumina-diagnóstico',
      nome: 'Lumina - Diagnóstico Gratuito',
      objectivo: 'Conversoes (Cliques no Link)',
      template: 'cta', eco: 'lumina', formato: 'post',
      texto_imagem: 'Descobre como REALMENTE estas. 2 minutos.',
      subtitulo_imagem: 'LUMINA - Diagnóstico Gratuito',
      headline: 'O diagnóstico que ninguém te fez',
      texto_primario: '7 perguntas sobre energia, emoção e corpo.\n23 leituras possíveis.\n1 espelho digital.\n\nO LUMINA revela padrões que não vias sobre ti mesma.\n\nGratuito. 2 minutos. Sem registo.',
      descricao: 'Diagnóstico gratuito | LUMINA by Sete Ecos',
      cta_botao: 'Experimenta Agora',
      link: `${BASE_URL}/lumina?utm_source=facebook&utm_medium=ad&utm_campaign=lumina-launch-s1`,
      targeting: 'Pessoas 25-55 | Lusofonia | Interesses: Saúde, Bem-estar, Nutrição, Alimentação saudável, Yoga, Meditação',
      orcamento: '300-500 MT/dia (~$5-8 USD)',
    },
    {
      id: 'hook-emocional',
      nome: 'Hook Emocional - Engagement',
      objectivo: 'Engagement + Seguidores',
      template: 'dica', eco: 'vitalis', formato: 'post',
      texto_imagem: 'Tens fome ou tens medo?',
      subtitulo_imagem: '@seteecos',
      headline: 'A verdade que ninguém te diz sobre comida',
      texto_primario: 'A maioria das mulheres come por emoção e chama isso de "falta de força de vontade".\n\nNão é falta de disciplina. É dor.\n\nSegue @seteecos para conteúdo que ninguém mais partilha.',
      descricao: 'Segue @seteecos',
      cta_botao: 'Saber Mais',
      link: 'https://www.instagram.com/seteecos/',
      targeting: 'Pessoas 25-55 | Lusofonia | Interesses: Dieta, Perda de peso, Saúde mental, Corpo positivo',
      orcamento: '200-400 MT/dia (~$3-6 USD)',
    },
    {
      id: 'dor-dietas',
      nome: 'Dor das Dietas - Conversao',
      objectivo: 'Conversoes (Cliques no Link)',
      template: 'dica', eco: 'seteEcos', formato: 'post',
      texto_imagem: 'Se a dieta funcionasse, não precisavas de outra a cada 3 meses.',
      subtitulo_imagem: 'Existe outra forma.',
      headline: 'Cansada de dietas que não funcionam?',
      texto_primario: 'Dieta → Restrição → Desistência → Culpa → Nova dieta.\n\nJá passaste por este ciclo?\n\nDescobre o que realmente está a acontecer em 2 minutos. Gratuito.',
      descricao: 'Diagnóstico gratuito | Sem compromisso',
      cta_botao: 'Descobre Agora',
      link: `${BASE_URL}/lumina?utm_source=facebook&utm_medium=ad&utm_campaign=dor-dietas-s1`,
      targeting: 'Pessoas 25-55 | Lusofonia | Interesses: Dieta, Emagrecimento, Receitas saudáveis, Fitness',
      orcamento: '300-500 MT/dia (~$5-8 USD)',
    },
    {
      id: 'testemunho-ad',
      nome: 'Prova Social - Testemunho',
      objectivo: 'Conversoes (Cliques no Link)',
      template: 'testemunho', eco: 'vitalis', formato: 'post',
      texto_imagem: 'Perdi 8kg mas o melhor foi parar de chorar depois de comer.',
      subtitulo_imagem: '- M.J.',
      headline: 'Resultado real. Sem filtro.',
      texto_primario: '"Perdi 8kg mas o melhor foi parar de chorar depois de comer."\n\nEsta mulher não fez dieta. Mudou a relação com a comida.\n\nComeça pelo diagnóstico gratuito.',
      descricao: 'Diagnóstico gratuito LUMINA',
      cta_botao: 'Experimenta Grátis',
      link: `${BASE_URL}/lumina?utm_source=facebook&utm_medium=ad&utm_campaign=testemunho-s1`,
      targeting: 'Pessoas 25-55 | Lusofonia | Interesses: Transformação pessoal, Saúde, Bem-estar',
      orcamento: '300-500 MT/dia (~$5-8 USD)',
    },
  ];
}

// ============================================================
// SEMANA 1 (8-14 FEV): AQUECER - Dia a dia
// ============================================================

export function getSemana1() {
  const linkLumina = `${BASE_URL}/lumina?utm_source=whatsapp&utm_medium=broadcast&utm_campaign=s1-aquecer`;
  return [
    {
      dia: 1, data: 'Domingo 8 Fev', titulo: 'APRESENTAR',
      gridPosts: [1, 2, 3],
      stories: 'Vídeo/foto pessoal: "Olá, sou a Vivianne e criei algo para nós mulheres."',
      whatsapp: {
        mensagem: `Olá 🤍\n\nQuero partilhar uma coisa contigo.\n\nCriei um projecto para pessoas que, como eu, já estiveram em guerra com o próprio corpo.\n\nNão é uma dieta. Não é um ginásio. É algo diferente.\n\nNos próximos dias vou contar-te mais.\n\nSe tens curiosidade, segue @seteecos no Instagram. Acabou de nascer. 🌿`,
        imagem: { template: 'cta', eco: 'seteEcos', formato: 'stories', texto: 'Algo especial para mulheres acaba de nascer.', subtitulo: 'SETE ECOS - Segue @seteecos' },
      },
      ads: null,
      notas: 'Publica 3 posts para preencher grid. Envia WA para TODA a lista. Cria a broadcast list.',
    },
    {
      dia: 2, data: 'Segunda 9 Fev', titulo: 'EDUCAR',
      gridPosts: [4, 5],
      stories: 'Poll: "Já fizeste uma dieta que não funcionou?" SIM / NÃO',
      whatsapp: {
        mensagem: `Sabias que 80% dos problemas com comida são emocionais? 😮\n\nNão é falta de disciplina. É o corpo a tentar lidar com stress, solidão ou frustração.\n\nPubliquei algo sobre isto no Instagram que te vai interessar.\n\n@seteecos 🌿`,
        imagem: { template: 'stats', eco: 'vitalis', formato: 'stories', texto: '80%', subtitulo: 'dos problemas com comida são emocionais' },
      },
      ads: null,
      notas: 'Publica carrossel mitos + estatística. Engaja com respostas ao poll.',
    },
    {
      dia: 3, data: 'Terça 10 Fev', titulo: 'VALOR',
      gridPosts: [6],
      stories: 'Partilha o carrossel das porções: "Salva isto!"',
      whatsapp: {
        mensagem: `Bom dia 🤍\n\nSabias que podes medir porções só com as mãos?\n\n🤚 Palma = proteína\n✊ Punho = hidratos\n👍 Polegar = gordura\n🙌 Duas mãos = legumes\n\nSem balança. Sem stress. Experimenta hoje no almoço.\n\nGuia completo no Instagram: @seteecos`,
        imagem: { template: 'dica', eco: 'vitalis', formato: 'stories', texto: 'Esquece a balança. Usa as mãos.', subtitulo: 'Guia de porções no @seteecos' },
      },
      ads: 'ACTIVAR: Ad "Lumina Diagnóstico" + Ad "Hook Emocional". Começa com 300-500 MT/dia cada.',
      notas: 'DIA DE ACTIVAR ADS. Começa a investir. Publica carrossel de porções.',
    },
    {
      dia: 4, data: 'Quarta 11 Fev', titulo: 'LUMINA - O ANZOL',
      gridPosts: [7],
      stories: 'Grava ecrã a fazer o LUMINA + reação ao resultado. Partilha nos stories.',
      whatsapp: {
        mensagem: `Tenho algo para ti 🔮\n\nCriei um diagnóstico gratuito que em 2 minutos te diz como REALMENTE estás.\n\n7 perguntas sobre energia, emoção e corpo.\n23 padrões possíveis.\nUma leitura só tua.\n\nChama-se LUMINA e é completamente grátis.\n\nExperimenta e diz-me o que achaste:\n${linkLumina}\n\nQuero saber a tua opinião 🤍`,
        imagem: { template: 'cta', eco: 'lumina', formato: 'stories', texto: '2 minutos. 7 perguntas. O diagnóstico que ninguém te fez.', subtitulo: 'LUMINA - Experimenta grátis' },
      },
      ads: 'Manter ads. Verificar métricas (CTR, CPC).',
      notas: 'DIA CHAVE: primeiro push do LUMINA. Envia para TODOS os contactos. Pede feedback.',
    },
    {
      dia: 5, data: 'Quinta 12 Fev', titulo: 'TESTEMUNHO',
      gridPosts: [8],
      stories: 'Partilha screenshots de respostas/reações ao Lumina.',
      whatsapp: {
        mensagem: `Olá 🤍\n\nOntem partilhei o LUMINA contigo.\n\nJá experimentaste? Se sim, o que achaste da leitura?\n\nSe ainda não, demora só 2 minutinhos:\n${linkLumina}\n\nQuero ouvir a tua experiência! Responde-me 🌿`,
        imagem: { template: 'testemunho', eco: 'vitalis', formato: 'stories', texto: 'Perdi 8kg mas o melhor foi parar de chorar depois de comer.', subtitulo: '- M.J.' },
      },
      ads: 'Manter. Ver qual ad tem melhor CTR e aumentar orçamento nesse.',
      notas: 'Follow-up do Lumina. Recolhe feedback. Publica testemunho.',
    },
    {
      dia: 6, data: 'Sexta 13 Fev', titulo: 'EMPATIA',
      gridPosts: [9],
      stories: 'Caixa de perguntas: "Qual a tua maior luta com a comida?"',
      whatsapp: {
        mensagem: `Se cozinhas para a família inteira e comes os restos em pé na cozinha... esta mensagem é para ti.\n\nTu também mereces sentar, comer com calma, e ter um prato pensado para TI.\n\nA tua saúde importa tanto quanto a deles.\n\nAmanhã tenho uma surpresa para ti 🌿`,
        imagem: { template: 'dica', eco: 'seteEcos', formato: 'stories', texto: 'Se cozinhas para todos e comes os restos em pé... esta mensagem é para ti.', subtitulo: '@seteecos' },
      },
      ads: 'Pausar ad com pior CTR. Aumentar o melhor para 500-800 MT/dia.',
      notas: 'Conteúdo relatable. Pura empatia. Preparar terreno para amanhã.',
    },
    {
      dia: 7, data: 'Sábado 14 Fev ❤️', titulo: 'REVELAR VITALIS',
      gridPosts: [10, 11, 12],
      stories: 'Countdown: "VITALIS abre próxima semana!" + Video pessoal sobre o projecto.',
      whatsapp: {
        mensagem: `🤍 Feliz Dia dos Namorados!\n\nHoje quero lembrar-te: o namoro mais importante da tua vida é CONTIGO.\n\nE por isso criei o VITALIS.\n\nCoaching nutricional que cuida da tua COMIDA e da tua EMOÇÃO:\n\n🍽 Plano alimentar com comida local\n🧠 Coach IA 24h\n💚 Espaço emocional sem julgamento\n📊 Dashboard com progresso real\n\nAbre na próxima semana.\n\nSe ainda não fizeste o diagnóstico gratuito:\n${linkLumina}\n\n🌿`,
        imagem: { template: 'cta', eco: 'vitalis', formato: 'stories', texto: 'Não é uma dieta. É o fim das dietas.', subtitulo: 'VITALIS - Abre próxima semana' },
      },
      ads: 'Adicionar Ad "Dor das Dietas". Manter restantes activos.',
      notas: 'DIA CHAVE: Revelar Vitalis! 3 posts. Aproveitar Dia dos Namorados!',
    },
  ];
}

// ============================================================
// SEMANA 2 (15-21 FEV): LANCAR - Dia a dia
// ============================================================

export function getSemana2() {
  const linkVitalis = `${BASE_URL}/vitalis?utm_source=whatsapp&utm_medium=broadcast&utm_campaign=s2-lancamento`;
  const linkLumina = `${BASE_URL}/lumina?utm_source=whatsapp&utm_medium=broadcast&utm_campaign=s2-lancamento`;
  return [
    {
      dia: 8, data: 'Domingo 15 Fev', titulo: 'LANÇAMENTO!',
      stories: 'Video pessoal: "Hoje é o dia! O VITALIS está aberto!" + Countdown a zero.',
      whatsapp: {
        mensagem: `*O VITALIS está ABERTO.* 🌿\n\nDepois de meses a construir, finalmente está aqui.\n\nCoaching nutricional que cuida de TI - comida E emoção.\n\n🍽 Plano alimentar personalizado (com comida moçambicana)\n📱 Coach IA disponível 24h\n💚 Espaço emocional para dias difíceis\n📊 Dashboard com o teu progresso\n🎯 Desafios semanais\n📖 Receitas com ingredientes locais\n\n7 dias de garantia. Envia DM para saber mais.\n\n${linkVitalis}\n\nPara as primeiras 10: surpresa especial! 🤍`,
        imagem: { template: 'cta', eco: 'vitalis', formato: 'stories', texto: 'VITALIS está ABERTO.', subtitulo: 'Coaching Nutricional | Envia DM' },
      },
      ads: 'Adicionar Ad "Testemunho". Retarget: quem visitou Lumina mas não converteu.',
      notas: 'DIA DE LANCAMENTO! Publica post de lançamento. Envia WA a todos. Stories o dia todo.',
    },
    {
      dia: 9, data: 'Segunda 16 Fev', titulo: 'DEEP DIVE',
      stories: 'Tour guiado pela app: mostra dashboard, check-in, receitas, chat.',
      whatsapp: {
        mensagem: `Bom dia 🤍\n\nOntem lancei o VITALIS e a reação foi incrível.\n\nHoje quero mostrar-te POR DENTRO o que recebes:\n\n✅ Plano alimentar feito para ti (não copiado da internet)\n✅ Receitas com matapa, xima, feijão nhemba, caril de amendoim\n✅ Check-in diário (água, sono, refeições, exercício)\n✅ Coach IA que responde às 3 da manhã sem julgamento\n✅ Espaço emocional para quando recaís\n✅ Desafios semanais que te mantêm motivada\n\n7 dias de garantia. Se não gostares, devolvemos.\n\n${linkVitalis}`,
        imagem: { template: 'dica', eco: 'vitalis', formato: 'stories', texto: 'O que recebes no VITALIS?', subtitulo: 'Tudo no teu telemóvel. 24h por dia.' },
      },
      ads: 'Manter todos. Verificar conversões do dia de lançamento.',
      notas: 'Mostra o produto por dentro. Elimina dúvidas com transparência.',
    },
    {
      dia: 10, data: 'Terça 17 Fev', titulo: 'RESULTADOS',
      stories: 'Partilha mais testemunhos. Mostra números de quem já entrou.',
      whatsapp: {
        mensagem: `*O que acontece quando paras de fazer dieta e começas a OUVIR o teu corpo:*\n\n"Perdi 8kg mas o melhor foi parar de chorar depois de comer." - M.J.\n\n"A minha filha disse que estou diferente. Não mais magra. Mais feliz." - A.B.\n\n"Pela primeira vez não desisti ao 3o dia." - S.C.\n\nEstas mulheres não fizeram dieta. Mudaram a relação com a comida.\n\n${linkVitalis}`,
        imagem: { template: 'testemunho', eco: 'vitalis', formato: 'stories', texto: 'A minha filha disse que estou diferente. Não mais magra. Mais feliz.', subtitulo: '- A.B.' },
      },
      ads: 'Manter. Escalar ads com melhor ROAS.',
      notas: 'Prova social forte. Testemunhos criam confiança.',
    },
    {
      dia: 11, data: 'Quarta 18 Fev', titulo: 'OBJEÇÕES',
      stories: 'Q&A: Responder dúvidas sobre preço, tempo, funcionamento.',
      whatsapp: {
        mensagem: `Sei que talvez estejas a pensar:\n\n*"Não tenho tempo."*\nCheck-in: 2 min. Receitas: rápidas. App no telemóvel.\n\n*"Já tentei tudo."*\nMas nunca tentaste algo que cuida da emoção ao mesmo tempo.\n\n*"E se não gostar?"*\n7 dias de garantia. Sem risco.\n\nSe alguma destas era a tua dúvida, já tens a resposta.\n\n${linkVitalis} 🌿`,
        imagem: { template: 'dica', eco: 'vitalis', formato: 'stories', texto: '"Já tentei tudo." Mas nunca tentaste algo que cuida da tua EMOÇÃO.', subtitulo: 'VITALIS - 7 dias de garantia' },
      },
      ads: 'Manter. Considerar ad de retargeting com objeções.',
      notas: 'Elimina objeções uma a uma. Torna a decisão fácil.',
    },
    {
      dia: 12, data: 'Quinta 19 Fev', titulo: 'BASTIDORES',
      stories: 'Mostra-te a usar a app. Mostra o teu dia-a-dia com o VITALIS.',
      whatsapp: {
        mensagem: `Hoje quero mostrar-te algo pessoal 🤍\n\nTodos os dias, eu própria uso o VITALIS.\n\nFaço o check-in. Sigo o meu plano. Uso o espaço emocional quando preciso.\n\nPorque isto não é só para ti. É para mim também.\n\nSomos todas iguais. Todas lutamos.\n\nA diferença é ter ferramentas.\n\n${linkVitalis}`,
        imagem: { template: 'dica', eco: 'seteEcos', formato: 'stories', texto: 'Eu própria uso o VITALIS todos os dias. Porque também preciso.', subtitulo: '- Vivianne' },
      },
      ads: 'Manter.',
      notas: 'Vulnerabilidade e autenticidade. Mostra que és humana.',
    },
    {
      dia: 13, data: 'Sexta 20 Fev', titulo: 'URGÊNCIA',
      stories: 'Countdown: "Vagas limitadas esta semana!" + Screenshots de quem entrou.',
      whatsapp: {
        mensagem: `⚡ Pergunta honesta:\n\nHá quanto tempo dizes "vou começar na segunda"?\n\nSemanas? Meses? Anos?\n\nDaqui a 3 meses vais estar exactamente onde estás agora. Ou pior.\n\nO VITALIS está aberto AGORA. 7 dias de garantia.\n\nO único risco é não tentares.\n\n${linkVitalis}\n\nA decisão é tua. Mas o corpo não espera. 🌿`,
        imagem: { template: 'cta', eco: 'vitalis', formato: 'stories', texto: 'Daqui a 3 meses, vais agradecer-te.', subtitulo: 'VITALIS - Começa agora' },
      },
      ads: 'Aumentar orçamento nos 2 melhores ads. Adicionar urgência ao copy.',
      notas: 'Urgência real. Não manipulação. O corpo realmente não espera.',
    },
    {
      dia: 14, data: 'Sábado 21 Fev', titulo: 'ENCERRAR SEMANA',
      stories: 'Resumo da semana. Agradecimento. Resultados até agora.',
      whatsapp: {
        mensagem: `Esta semana foi especial 🤍\n\nLançámos o VITALIS e a resposta superou tudo.\n\nSe ainda não entraste, esta é a tua última oportunidade esta semana.\n\nLembra-te: 7 dias de garantia. Sem risco.\n\n🍽 Plano alimentar personalizado\n📱 Coach IA 24h\n💚 Espaço emocional\n📊 Dashboard de progresso\n\nEnvia-me DM para saber como começar.\n\n${linkVitalis}\n\nDaqui a 3 meses, vais agradecer-te. 🌿`,
        imagem: { template: 'cta', eco: 'vitalis', formato: 'stories', texto: 'O VITALIS está aberto. Envia DM.', subtitulo: '7 dias de garantia. A decisão é tua.' },
      },
      ads: 'Avaliar resultados da semana. Pausar ads com mau desempenho. Manter os melhores.',
      notas: 'Último push da semana. Avaliar métricas totais. Planear semana 3.',
    },
  ];
}

// ============================================================
// EMAIL SEQUENCES & UTM LINKS (mantidos por compatibilidade)
// ============================================================

export function getEmailSequencia(diasDesdeRegisto) {
  const sequencia = [
    { dia: 0, assunto: 'Bem-vindo/a — A tua jornada começa aqui', tipo: 'boas-vindas', preview: 'Não é mais uma newsletter. É um espelho.' },
    { dia: 3, assunto: '2 minutos que te podem surpreender', tipo: 'convite-lumina', preview: 'O diagnóstico que ninguém te fez.' },
    { dia: 7, assunto: 'Porque falhas nas dietas (não é o que pensas)', tipo: 'valor-provocação', preview: 'A indústria ganhou. Tu perdeste. Até agora.' },
    { dia: 14, assunto: 'Resultado: -8kg sem passar fome', tipo: 'testemunho-vitalis', preview: 'História real de uma mulher como tu.' },
    { dia: 21, assunto: 'A pergunta que ninguém te faz', tipo: 'emocional-profundo', preview: 'Como te sentes? Não o que comes. Como TE SENTES.' },
    { dia: 30, assunto: 'Já passou um mês. É agora?', tipo: 'urgência-final', preview: 'O tempo não espera. O teu corpo não espera.' },
  ];
  return sequencia.find(s => s.dia === diasDesdeRegisto) || null;
}

export function getSequenciaCompleta() {
  return [0, 3, 7, 14, 21, 30].map(dia => getEmailSequencia(dia));
}

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

// ============================================================
// MOCKUPS VITALIS - 12 Conteúdos para popular o Instagram
// Usa imagens reais da app (mockups telemóvel e PC)
// ============================================================

const MOCKUP_IMAGES = {
  dashboard: '/mockups/Vitalis-dashboard_mb-mockup.jpeg',
  coach: '/mockups/Vitalis-coach_mb-mockup.jpeg',
  receitas: '/mockups/Vitalis-receitas_mb-mockup.jpeg',
  treinos: '/mockups/Vitalis-treinos_mb-mockup.jpeg',
  espacoRetorno: '/mockups/Vitalis-espaçoretorno_mb-mockup.jpeg',
  landingPC: '/mockups/Vitalis-landing_PC-mockup.jpeg',
  mozproud: '/mockups/mozproud-vitalis.jpeg',
};

// Mockups por eco — imagens reais criadas pela Vivianne
const ECO_MOCKUPS = {
  vitalis: [
    '/mockups/Vitalis-dashboard_mb-mockup.jpeg',
    '/mockups/Vitalis-receitas_mb-mockup.jpeg',
    '/mockups/Vitalis-coach_mb-mockup.jpeg',
    '/mockups/Vitalis-treinos_mb-mockup.jpeg',
    '/mockups/Vitalis-espaçoretorno_mb-mockup.jpeg',
    '/mockups/mozproud-vitalis.jpeg',
  ],
  aurea: [
    '/mockups/Aurea-Dash-portrait.png',
    '/mockups/Aurea-praticas-portrait.png',
    '/mockups/Aurea-Dash-left.png',
    '/mockups/Aurea-praticas-left.png',
  ],
  serena: [
    '/mockups/Serena-dash-portrait.png',
    '/mockups/Serena-praticas-portrait.png',
    '/mockups/Serena-dash-left.png',
    '/mockups/Serena-praticas-left.png',
  ],
  ignis: [
    '/mockups/Ignis-dash-portrait.png',
    '/mockups/Ignis-escolhas-portrait.png',
    '/mockups/Ignis-dash-left.png',
    '/mockups/Ingis-bussula-left.png',
  ],
  ventis: [
    '/mockups/Ventis-dash-portrait.png',
    '/mockups/Ventis-praticas-portrait.png',
    '/mockups/Ventis-dash-left.png',
    '/mockups/Ventis-praticas-left.png',
  ],
  ecoa: [
    '/mockups/Ecoa-dash-portrait.png',
    '/mockups/Ecoa-praticas-portrait.png',
    '/mockups/Ecoa-dash-left.png',
    '/mockups/Ecoa-praticas-left.png',
  ],
  imago: [
    '/mockups/Imago-dash-portrait.png',
    '/mockups/Imago-arqueologia-portrait.png',
    '/mockups/Imago-dash-left.png',
    '/mockups/Imago-arqueologia-left.png',
  ],
};

export function getMockupsEco(eco) {
  return ECO_MOCKUPS[eco] || ECO_MOCKUPS.vitalis;
}

export function getConteudosMockupVitalis() {
  const linkVitalis = buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.instagramBio());
  const linkLumina = buildUTMUrl(`${BASE_URL}/lumina`, UTM_TEMPLATES.instagramBio('lumina'));

  return [
    // ========== POST 1 - LANÇAMENTO ==========
    {
      numero: 1,
      tipo: 'feed',
      titulo: 'Saúde real. Feita para nós.',
      descricao: 'Post de apresentação — inteligência nutricional e desportiva',
      imagens: [MOCKUP_IMAGES.mozproud],
      caption: `Saúde real. Feita para ti. 🌿

Não é mais um app de dieta genérico.
Não é mais uma lista de "não comas isto".

É uma plataforma inteira de inteligência nutricional e desportiva. Personalizada. Com ciência. Com emoção.

Chama-se VITALIS. E está dentro do @seteecos.

98 receitas equilibradas. Coach disponível 24h. Treinos adaptados ao teu ciclo. Espaço para quando a emoção pesa mais que a fome.

Saúde inteligente. Para ti. 🌿

Link na bio.

#vitalis #seteecos #saudereal #transformacaopessoal #inteligencianutricional #nutricao #bemestar #coachingnutricional #saude #wellness`,
      whatsapp: `🌿 *VITALIS - Inteligência nutricional e desportiva.*

Finalmente uma plataforma de saúde que entende a pessoa inteira.

98 receitas equilibradas. Coach 24h. Treinos que respeitam o teu corpo.

Não é dieta. É cuidado.

👉 ${linkVitalis}

Segue @seteecos no Instagram para acompanhar 🌿`,
      melhorHora: '8h ou 18h',
      dica: 'Primeiro post do perfil. Fixa-o no topo do feed.',
    },

    // ========== POST 2 - DASHBOARD TOUR ==========
    {
      numero: 2,
      tipo: 'feed',
      titulo: 'Isto é o VITALIS por dentro.',
      descricao: 'Mostrar o dashboard real - prova social e profissionalismo',
      imagens: [MOCKUP_IMAGES.dashboard],
      caption: `Isto é o VITALIS por dentro. 📱

Não é um PDF.
Não é um grupo de WhatsApp.
Não é uma lista genérica.

É uma app completa no teu telemóvel:

📋 Meu Plano - personalizado para ti
✅ Check-in diário - água, sono, emoção
🍽 Refeições - registo fácil
📖 Receitas - 98, equilibradas e variadas
💜 Espaço Retorno - para quando precisas de parar
📊 Relatórios - vê a tua evolução
💪 Treinos - adaptados à tua fase

Tudo num só lugar. Tudo feito para TI.

Link na bio. Envia DM para saber mais. 🌿

#vitalis #seteecos #appsaude #dashboard #planoalimentar #coachingnutricional #saudereal #bemestar #tecnologia #wellness`,
      whatsapp: `📱 *Já viste o VITALIS por dentro?*

Olha o que tens quando entras:
📋 Plano personalizado
✅ Check-in diário
📖 98 receitas locais
💜 Espaço emocional
📊 Relatórios
💪 Treinos

Tudo no teu telemóvel. Envia-me mensagem para saber como começar 🌿

👉 ${linkVitalis}`,
      melhorHora: '12h-14h (pausa do almoço)',
      dica: 'Mostra que é real e profissional. O mockup impressiona.',
    },

    // ========== POST 3 - COACH 24h ==========
    {
      numero: 3,
      tipo: 'feed',
      titulo: 'Uma coach que nunca dorme.',
      descricao: 'Destaque para a Coach IA - diferencial único',
      imagens: [MOCKUP_IMAGES.coach],
      caption: `3 da manhã. Não consegues dormir. A ansiedade aperta. Abres o frigorífico.

E se em vez disso... abrires uma conversa com alguém que te entende?

Conhece a Vivianne. A tua Coach Vitalis. 🤍

Disponível 24 horas. Sem julgamento. Sem espera.

Pergunta sobre porções. 🤲
Monta o teu prato. 🍽
Tira dúvidas sobre jejum. ⏰
Adapta o treino ao teu dia. 💪
Precisa de ajuda geral? Ela está lá. 💚

Isto não é um chatbot genérico. É coaching nutricional REAL, sempre disponível.

Link na bio. 🌿

#vitalis #seteecos #coachnutricional #IA #coachingonline #disponivel24h #saudereal #saudedigital #nutricao #apoioemocional`,
      whatsapp: `🤖 *Imagina ter uma coach de nutrição disponível às 3 da manhã.*

Sem julgamento. Sem espera. Sem marcação.

A Coach Vivianne no VITALIS responde-te SEMPRE:
🤲 Porções certas
🍽 Como montar o prato
⏰ Jejum
💪 Treino
💚 O que precisares

👉 ${linkVitalis}

Experimenta. Está lá para ti. 🌿`,
      melhorHora: '21h-23h (quando a ansiedade nocturna aparece)',
      dica: 'Este post toca na dor real da solidão nocturna com comida.',
    },

    // ========== POST 4 - RECEITAS LOCAIS ==========
    {
      numero: 4,
      tipo: 'feed',
      titulo: '98 receitas. Todas com comida real.',
      descricao: 'Biblioteca de receitas equilibradas e variadas',
      imagens: [MOCKUP_IMAGES.receitas],
      caption: `98 receitas. Nenhuma pede quinoa. 🍽

Comida real. Equilibrada. Saborosa.

A Biblioteca de Receitas do VITALIS tem:

🥘 Pratos tradicionais
🥗 Opções leves
🍲 Comfort food saudável
🥙 Rápidas do dia-a-dia
🌍 Internacionais

Cada receita filtrada para o TEU perfil. Compatível com as tuas necessidades. Ingredientes que encontras em qualquer mercado.

Chega de dietas com comida que não existe na tua realidade.

Link na bio. 🌿

#vitalis #seteecos #receitassaudaveis #comidadeverdade #receitas #nutricaointeligente #saudavel #bemestar #coachingnutricional #saudereal`,
      whatsapp: `🍽 *98 receitas e NENHUMA pede quinoa.*

O VITALIS tem uma biblioteca inteira de receitas:
🥘 Pratos tradicionais
🥗 Opções leves
🍲 Comfort food saudável
🥙 Rápidas do dia-a-dia

Filtradas para o teu perfil. Com comida real e acessível.

Sem listas impossíveis. Comida REAL.

👉 ${linkVitalis}`,
      melhorHora: '11h-12h (antes do almoço)',
      dica: 'O argumento "comida real e acessível" é o mais forte. As pessoas estão fartas de dietas impossíveis.',
    },

    // ========== POST 5 - ESPAÇO EMOCIONAL ==========
    {
      numero: 5,
      tipo: 'feed',
      titulo: 'O que estás a sentir agora?',
      descricao: 'Espaço de Retorno Emocional - o grande diferencial',
      imagens: [MOCKUP_IMAGES.espacoRetorno],
      caption: `O que estás a sentir agora? 💜

Cansaço. Ansiedade. Tristeza. Raiva. Vazio. Solidão.

Não há resposta errada. Só observa.

Isto é o Espaço de Retorno do VITALIS. O lugar dentro da app onde não se fala de comida. Fala-se de TI.

Porque 80% dos problemas com alimentação são emocionais. E nenhuma dieta do mundo resolve isso.

Antes de mudar o que comes, precisas de entender PORQUE comes.

Este espaço existe para isso. 🤍

Link na bio.

#vitalis #seteecos #saudeemocional #espacoseguro #ansiedade #cansaco #emocoes #mulherreal #autocuidado #saudementalimporta #saudereal #bemestar`,
      whatsapp: `💜 *Antes de mudar o que comes, precisas de entender PORQUE comes.*

O VITALIS tem um Espaço de Retorno Emocional.

Cansaço? Ansiedade? Tristeza? Solidão?

Não é terapia. É um espaço para parares e observares o que sentes. Sem julgamento.

Porque 80% dos problemas com comida são emocionais.

👉 ${linkVitalis}`,
      melhorHora: '20h-22h (momento introspectivo)',
      dica: 'Post mais emocional. As cores vibrantes do ecrã chamam muita atenção no feed.',
    },

    // ========== POST 6 - TREINO + CICLO ==========
    {
      numero: 6,
      tipo: 'feed',
      titulo: 'O teu treino adapta-se ao teu ciclo.',
      descricao: 'Treinos por fase do ciclo menstrual - único no mercado',
      imagens: [MOCKUP_IMAGES.treinos],
      caption: `Sabias que treinar intenso na fase errada pode PREJUDICAR-TE? 🌙

O VITALIS não te dá um plano de treino genérico. Adapta-se ao TEU ciclo:

🌙 Menstrual (Dias 1-5) → Descanso e movimento suave
🌸 Folicular (Dias 6-14) → Energia a subir, mais intensidade
☀️ Ovulação (Dias 14-17) → Pico de energia, treino forte
🍂 Lútea (Dias 18-28) → Abrandar, focar em recuperação

Frequência. Duração. Intensidade. Tudo personalizado à tua fase.

Isto não é um app de fitness. É um app que te ENTENDE. 🌿

Link na bio.

#vitalis #seteecos #ciclomenstrual #treinofeminino #fasemenstrual #ovulacao #fitness #saudefeminina #hormonal #saudereal #bemestar #treino`,
      whatsapp: `🌙 *O teu treino devia mudar conforme o teu ciclo menstrual.*

No VITALIS, muda:

🌙 Menstrual → Descanso
🌸 Folicular → Mais energia
☀️ Ovulação → Treino forte
🍂 Lútea → Recuperação

Frequência, duração, intensidade - tudo adaptado a TI.

Nenhum outro app de coaching faz isto.

👉 ${linkVitalis}`,
      melhorHora: '7h-9h (motivação matinal)',
      dica: 'Conteúdo educativo + produto. O ciclo menstrual é tema viral entre mulheres.',
    },

    // ========== CARROSSEL 7 - 5 RAZÕES ==========
    {
      numero: 7,
      tipo: 'carrossel',
      titulo: '5 coisas que o VITALIS faz por ti',
      descricao: 'Carrossel mostrando cada funcionalidade com mockup real',
      imagens: [
        MOCKUP_IMAGES.mozproud,
        MOCKUP_IMAGES.receitas,
        MOCKUP_IMAGES.coach,
        MOCKUP_IMAGES.treinos,
        MOCKUP_IMAGES.espacoRetorno,
        MOCKUP_IMAGES.dashboard,
      ],
      slides: [
        { texto: '5 coisas que o VITALIS faz por ti', subtitulo: 'Desliza →' },
        { texto: '1. 98 receitas equilibradas e variadas', subtitulo: 'Tradicionais, Internacionais, Rápidas, Comfort food' },
        { texto: '2. Coach disponível 24h', subtitulo: 'Sem espera. Sem julgamento. Sempre lá.' },
        { texto: '3. Treinos adaptados ao ciclo', subtitulo: 'Menstrual, Folicular, Ovulação, Lútea' },
        { texto: '4. Espaço emocional só teu', subtitulo: 'Porque 80% dos problemas com comida são emocionais' },
        { texto: '5. Dashboard completo', subtitulo: 'Plano, check-in, refeições, relatórios. Tudo num sítio.' },
      ],
      caption: `5 coisas que o VITALIS faz por ti e que nenhuma dieta faz. 🌿

Desliza para ver cada uma →

1️⃣ 98 receitas com comida real e acessível
2️⃣ Coach disponível 24 horas por dia
3️⃣ Treinos que se adaptam ao teu ciclo menstrual
4️⃣ Espaço emocional para os dias difíceis
5️⃣ Dashboard completo - tudo no teu telemóvel

Isto não é uma dieta. É um sistema inteiro de cuidado.

Envia DM para saber como começar. 7 dias de garantia.

Link na bio 🤍

#vitalis #seteecos #coachingnutricional #5razoes #carrossel #saudavel #bemestar #saudereal #planoalimentar #wellness`,
      whatsapp: `🌿 *5 coisas que o VITALIS faz por ti:*

1️⃣ 98 receitas equilibradas
2️⃣ Coach disponível 24h
3️⃣ Treinos adaptados ao ciclo
4️⃣ Espaço emocional
5️⃣ Dashboard completo

Envia DM para saber como começar. 7 dias de garantia.

👉 ${linkVitalis}`,
      melhorHora: '12h-14h',
      dica: 'Carrosséis têm o MAIOR alcance no Instagram. Publica este nos primeiros 3 dias.',
    },

    // ========== CARROSSEL 8 - DIETAS vs VITALIS ==========
    {
      numero: 8,
      tipo: 'carrossel',
      titulo: 'Dietas vs VITALIS',
      descricao: 'Comparação provocadora - formato viral',
      imagens: [
        MOCKUP_IMAGES.mozproud,
        MOCKUP_IMAGES.receitas,
        MOCKUP_IMAGES.espacoRetorno,
        MOCKUP_IMAGES.coach,
        MOCKUP_IMAGES.dashboard,
      ],
      slides: [
        { texto: 'DIETAS vs VITALIS', subtitulo: 'Desliza para ver a diferença →' },
        { texto: '❌ Dietas: "Não comas arroz"\n✅ VITALIS: 98 receitas com comida real e saborosa', subtitulo: '' },
        { texto: '❌ Dietas: "Tens de ter força de vontade"\n✅ VITALIS: Espaço emocional para quando recaís', subtitulo: '' },
        { texto: '❌ Dietas: "Segue este plano genérico"\n✅ VITALIS: Coach 24h que te responde a QUALQUER hora', subtitulo: '' },
        { texto: '❌ Dietas: "Pesa-te todos os dias"\n✅ VITALIS: Dashboard que mede progresso REAL (não só peso)', subtitulo: '' },
      ],
      caption: `DIETAS vs VITALIS 🥊

As dietas dizem-te para NÃO comer.
O VITALIS ensina-te a CUIDAR de ti.

Desliza para ver as 4 diferenças que mudam tudo →

Se já estás farta do ciclo dieta-culpa-desistência, talvez estejas pronta para algo diferente.

Link na bio. 🌿

#vitalis #seteecos #dietasnao #semdieta #comidareal #comparacao #mudanca #saudavel #bemestar #saudereal #antidieta #nutricaointuitiva`,
      whatsapp: `🥊 *DIETAS vs VITALIS*

❌ "Não comas arroz" → ✅ 98 receitas reais e saborosas
❌ "Força de vontade" → ✅ Espaço emocional
❌ "Plano genérico" → ✅ Coach 24h
❌ "Pesa-te todos os dias" → ✅ Progresso real

Farta de dietas? Experimenta algo diferente.

👉 ${linkVitalis}`,
      melhorHora: '10h-12h',
      dica: 'Formato "vs" é altamente viral. Convida as pessoas a guardar e partilhar.',
    },

    // ========== CARROSSEL 9 - TOUR COMPLETO ==========
    {
      numero: 9,
      tipo: 'carrossel',
      titulo: 'Tour pela app em 7 ecrãs',
      descricao: 'Mostrar TODOS os mockups em sequência - tour visual completo',
      imagens: [
        MOCKUP_IMAGES.landingPC,
        MOCKUP_IMAGES.dashboard,
        MOCKUP_IMAGES.receitas,
        MOCKUP_IMAGES.coach,
        MOCKUP_IMAGES.treinos,
        MOCKUP_IMAGES.espacoRetorno,
        MOCKUP_IMAGES.mozproud,
      ],
      slides: [
        { texto: 'VITALIS - A raiz da transformação', subtitulo: 'Tour pela app. Desliza →' },
        { texto: 'O teu Dashboard pessoal', subtitulo: 'Plano, check-in, progresso, tudo organizado' },
        { texto: 'Biblioteca de 98 Receitas', subtitulo: 'Filtro por tipo de refeição, perfil e preferências' },
        { texto: 'Coach Vivianne - 24h disponível', subtitulo: 'Porções, prato, jejum, treino. Pergunta o que quiseres.' },
        { texto: 'Treinos por fase do ciclo', subtitulo: 'Menstrual → Folicular → Ovulação → Lútea' },
        { texto: 'Espaço de Retorno Emocional', subtitulo: 'Para quando o problema não é a comida. É a emoção.' },
        { texto: 'Saúde real. Inteligência nutricional.', subtitulo: 'Coaching personalizado 🌿' },
      ],
      caption: `Tour pela app VITALIS 📱✨

7 ecrãs. 7 razões para nunca mais fazeres dieta.

Desliza para ver o que recebes →

🖥 Landing profissional
📱 Dashboard completo
📖 98 receitas equilibradas e variadas
🤖 Coach Vivianne disponível 24h
💪 Treinos adaptados ao ciclo menstrual
💜 Espaço de retorno emocional
🧠 Inteligência nutricional e desportiva

Isto é coaching nutricional de verdade. No teu telemóvel.

Link na bio. Envia DM para saber mais. 🌿

#vitalis #seteecos #tourapp #plataforma #saudedigital #nutricao #coachingnutricional #saudereal #bemestar #bemestar #tecnologia`,
      whatsapp: `📱 *Queres ver o VITALIS por dentro?*

Fiz um tour pela app:

🖥 Landing profissional
📱 Dashboard completo
📖 98 receitas equilibradas
🤖 Coach 24h
💪 Treinos por ciclo menstrual
💜 Espaço emocional
🧠 Inteligência nutricional

Vê tudo aqui: ${linkVitalis}`,
      melhorHora: '15h-17h',
      dica: 'Carrossel "tour" funciona como prova. Mostra que é REAL, não promessa vazia.',
    },

    // ========== REEL 10 - UM DIA COM VITALIS ==========
    {
      numero: 10,
      tipo: 'reel',
      titulo: 'Um dia com VITALIS',
      descricao: 'Reel mostrando rotina diária com a app - formato "day in my life"',
      imagens: [MOCKUP_IMAGES.dashboard, MOCKUP_IMAGES.coach, MOCKUP_IMAGES.receitas],
      roteiro: `🎬 *REEL: "Um dia com VITALIS"*
Duração: 30-45 segundos
Música: trending calm/motivacional
Formato: gravar ecrã do telemóvel + voz off

---

🕗 *MANHÃ (0-8s)*
[Mostra ecrã do Dashboard - mockup dashboard]
VOZ: "Acordo. Abro o VITALIS. Vejo a minha frase do dia."
TEXTO NO ECRÃ: "7:30 — Check-in matinal ☀️"

🕐 *ALMOÇO (8-18s)*
[Mostra ecrã das Receitas - mockup receitas]
VOZ: "Na hora do almoço, procuro uma receita rápida. Hoje: caril de coco com legumes."
TEXTO NO ECRÃ: "12:30 — Receita do dia 🍽"

🕓 *TARDE (18-28s)*
[Mostra ecrã do Coach - mockup coach]
VOZ: "Meio da tarde, bate a fome emocional. Falo com a minha coach."
TEXTO NO ECRÃ: "16:00 — Momento difícil? A coach está lá 💚"

🕘 *NOITE (28-35s)*
[Mostra mozproud-vitalis]
VOZ: "VITALIS. Saúde real. Feita para nós."
TEXTO NO ECRÃ: "Link na bio 🌿"

---
CAPTION: Mostra abaixo.`,
      caption: `Um dia com VITALIS. 🌿

Não é mais uma app de dieta.
É a tua companheira de todos os dias.

De manhã: check-in e motivação ☀️
Ao almoço: receita rápida do mercado 🍽
À tarde: coach para os momentos difíceis 💚
À noite: reflexão e progresso 📊

Queres experimentar este dia?
Link na bio. 🤍

#vitalis #seteecos #reels #umdiacomvitalis #rotina #saudavel #dayinmylife #saudereal #bemestar #wellness #nutricao`,
      whatsapp: `🎬 *Viste o meu reel "Um dia com VITALIS"?*

De manhã: check-in
Ao almoço: receita local
À tarde: coach para a ansiedade
À noite: progresso

É isto todos os dias. No telemóvel.

👉 ${linkVitalis}`,
      melhorHora: '18h-20h (pico de reels)',
      dica: 'Grava o ecrã real do telemóvel. A autenticidade vende mais que perfeição.',
    },

    // ========== REEL 11 - POV TRENDING ==========
    {
      numero: 11,
      tipo: 'reel',
      titulo: 'POV: A tua amiga envia-te um link...',
      descricao: 'Formato trending "POV" com reveal da app',
      imagens: [MOCKUP_IMAGES.espacoRetorno, MOCKUP_IMAGES.dashboard, MOCKUP_IMAGES.mozproud],
      roteiro: `🎬 *REEL: "POV: A tua amiga envia-te um link..."*
Duração: 20-30 segundos
Música: trending com "build-up" (suspense → reveal)
Formato: face cam + ecrã telemóvel

---

*CENA 1 (0-5s)* - HOOK
[Face cam - expressão curiosa a olhar para o telemóvel]
TEXTO: "POV: A tua amiga envia-te um link e diz 'experimenta isto, confia em mim'"
🎵 Música calma, suspense

*CENA 2 (5-10s)* - ABERTURA
[Gravar ecrã: abrir a app, mostrar a pergunta "O que estás a sentir agora?"]
TEXTO: "Abres e... 👀"
🎵 Build-up

*CENA 3 (10-18s)* - REAÇÃO
[Face cam - expressão de surpresa/emoção]
[Corta para: ecrã do dashboard completo]
TEXTO: "98 receitas. Coach 24h. Treinos por ciclo. Espaço emocional."
🎵 Drop da música

*CENA 4 (18-25s)* - CTA
[Mostrar mozproud-vitalis]
TEXTO: "VITALIS - Inteligência nutricional e desportiva. 🌿"
VOZ/TEXTO: "Agora envia TU este reel a essa amiga 🤍"

---
CAPTION: Mostra abaixo.`,
      caption: `POV: A tua amiga envia-te um link e diz "confia em mim" 🤍

E depois descobres uma app inteira de inteligência nutricional e desportiva.

Com receitas reais. Coach que te ouve às 3 da manhã. Treinos que respeitam o teu ciclo.

E um espaço para quando o problema não é a comida. É a emoção.

Marca essa amiga nos comentários. Ela precisa de ver isto. 👇🏾

Link na bio 🌿

#vitalis #seteecos #pov #reels #trending #amiga #bemestar #saudereal #surprise #saudavel #wellness`,
      whatsapp: `👀 *Vi um reel que me fez lembrar de ti.*

Uma app de inteligência nutricional e desportiva com:
🍽 98 receitas equilibradas
🤖 Coach 24h
💪 Treinos por ciclo menstrual
💜 Espaço emocional

Abre e vê: ${linkVitalis}

Depois diz-me o que achaste 🤍`,
      melhorHora: '19h-21h',
      dica: 'O formato POV é dos mais virais do Instagram. Pede para a audiência marcar amigas.',
    },

    // ========== REEL 12 - PORQUÊ O VITALIS ==========
    {
      numero: 12,
      tipo: 'reel',
      titulo: 'Porquê o VITALIS existe.',
      descricao: 'Reel emotivo sobre a origem do projecto - storytelling pessoal',
      imagens: [MOCKUP_IMAGES.mozproud, MOCKUP_IMAGES.landingPC, MOCKUP_IMAGES.dashboard],
      roteiro: `🎬 *REEL: "Porquê o VITALIS existe."*
Duração: 30-45 segundos
Música: instrumental emotiva (piano suave ou lo-fi)
Formato: Vivianne a falar para a câmara + cuts para mockups

---

*CENA 1 (0-8s)* - HOOK PESSOAL
[Vivianne a falar para a câmara, close-up]
VOZ: "Quando procurei ajuda para a minha alimentação, tudo o que encontrava era genérico. Planos copiados. Sem emoção. Sem ciência real."
TEXTO: 🌿

*CENA 2 (8-16s)* - O PROBLEMA
[B-roll: pessoa a ver apps de dieta frustrada]
VOZ: "Nenhuma app perguntava como me sentia. Nenhuma entendia que 80% dos problemas com comida são emocionais."
TEXTO: "A saúde merece inteligência."

*CENA 3 (16-28s)* - A SOLUÇÃO
[Mostrar mockups: landing PC → dashboard → receitas → coach]
VOZ: "Então criei o VITALIS. 98 receitas equilibradas. Coach disponível 24 horas. Treinos que respeitam o teu corpo. Espaço emocional para os dias difíceis."
TEXTO: "VITALIS - A raiz da transformação 🌿"

*CENA 4 (28-40s)* - VISÃO
[Mostrar mozproud-vitalis.jpeg]
VOZ: "Inteligência nutricional e desportiva. Porque a tua saúde merece mais do que uma folha A4 com proibições."
TEXTO: "Coaching que entende a pessoa inteira. 🌿"

---
CAPTION: Mostra abaixo.`,
      caption: `Quando procurei ajuda para a minha alimentação, só encontrei planos genéricos. Listas de proibições. Sem emoção. Sem ciência.

Nenhuma app perguntava como me sentia. Nenhuma entendia que 80% dos problemas com comida são emocionais.

Então criei o VITALIS. 🌿

98 receitas equilibradas.
Coach disponível 24 horas.
Treinos que respeitam o teu ciclo.
Espaço para quando a emoção pesa mais que a fome.

Inteligência nutricional e desportiva. Para ti. 🌿

Se acreditas que a saúde merece mais do que proibições, partilha este reel. 🤍

Link na bio.

#vitalis #seteecos #wellness #saudereal #inteligencianutricional #coachingdigital #tecnologia #saude #bemestar #transformacaopessoal #coachingnutricional #inovacao`,
      whatsapp: `🌿 *Criei algo que gostava que existisse quando precisei.*

Nenhuma app perguntava como me sentia. Nenhuma entendia que o problema raramente é a comida.

Então criei o VITALIS:
📖 98 receitas equilibradas
🤖 Coach 24h
💪 Treinos por ciclo
💜 Espaço emocional

Inteligência nutricional e desportiva. Para ti.

👉 ${linkVitalis}

Partilha com quem precisa disto 🤍`,
      melhorHora: '18h-20h',
      dica: 'O mais emotivo de todos. Storytelling pessoal + orgulho nacional = viral garantido.',
    },
  ];
}

// ============================================================
// MENSAGENS WHATSAPP COM MOCKUPS
// Para enviar com as imagens reais da app
// ============================================================

export function getMensagensWhatsAppMockups() {
  const linkVitalis = buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.whatsappBroadcast());
  const linkLumina = buildUTMUrl(`${BASE_URL}/lumina`, UTM_TEMPLATES.whatsappBroadcast('lumina'));

  return [
    {
      titulo: 'Lançamento — inteligência nutricional',
      imagem: MOCKUP_IMAGES.mozproud,
      mensagem: `🌿 *VITALIS - Inteligência nutricional e desportiva.*

Criei uma plataforma inteira de coaching nutricional personalizado.

Não é dieta. Não é restrição. É ciência + emoção.

📖 98 receitas equilibradas e variadas
🤖 Coach disponível 24 horas
💪 Treinos adaptados ao teu ciclo
💜 Espaço emocional para os dias difíceis

Envia DM para saber como começar. 7 dias de garantia.

👉 ${linkVitalis}

Se te identificas, experimenta. Se conheces alguém que precisa, encaminha esta mensagem. 🌿`,
    },
    {
      titulo: 'Dashboard - mostrar a app real',
      imagem: MOCKUP_IMAGES.dashboard,
      mensagem: `📱 *Olha o que recebes quando entras no VITALIS:*

✨ Frase motivacional diária
🔥 Contador de dias consecutivos
📋 Meu Plano personalizado
✅ Check-in (água, sono, emoção)
🍽 Registo de refeições
📖 98 receitas filtradas para ti
💜 Espaço de retorno emocional
📊 Relatórios de evolução
💪 Treinos por fase do ciclo

Tudo isto no teu telemóvel. Envia DM para saber como começar.

Não é um PDF. Não é um grupo. É uma app COMPLETA.

👉 ${linkVitalis}`,
    },
    {
      titulo: 'Coach - apoio 24h',
      imagem: MOCKUP_IMAGES.coach,
      mensagem: `🤍 *Imagina ter alguém que te responde às 3 da manhã. Sem julgamento.*

A Coach Vivianne no VITALIS ajuda-te com:

🤲 Porções certas para ti
🍽 Como montar o prato
⏰ Dúvidas sobre jejum
💪 Adaptar o treino
❓ Qualquer pergunta sobre nutrição

Sempre disponível. Sempre paciente.

Se já te sentiste sozinha nesta jornada, isto é para ti.

👉 ${linkVitalis}`,
    },
    {
      titulo: 'Receitas — comida real',
      imagem: MOCKUP_IMAGES.receitas,
      mensagem: `🍽 *98 receitas. ZERO quinoa.*

O VITALIS tem uma biblioteca inteira com:

🥘 Pratos tradicionais
🥗 Opções leves
🍲 Comfort food saudável
🥙 Rápidas do dia-a-dia
🌍 Internacionais

Cada receita filtrada para o teu perfil e as tuas necessidades.

Ingredientes reais e acessíveis. Não do supermercado gourmet.

👉 ${linkVitalis}

Experimenta. 7 dias de garantia. 🌿`,
    },
    {
      titulo: 'Espaço emocional',
      imagem: MOCKUP_IMAGES.espacoRetorno,
      mensagem: `💜 *"O que estás a sentir agora?"*

Esta é a primeira pergunta do Espaço de Retorno no VITALIS.

Cansaço. Ansiedade. Tristeza. Raiva. Vazio. Solidão. Negação.

Sem resposta errada. Só observação.

Porque antes de mudar o que COMES, precisas de entender o que SENTES.

80% dos problemas com comida são emocionais. E nenhuma dieta resolve isso.

O VITALIS é o primeiro programa que cuida de AMBOS.

👉 ${linkVitalis}`,
    },
    {
      titulo: 'Treinos por ciclo',
      imagem: MOCKUP_IMAGES.treinos,
      mensagem: `🌙 *O teu corpo muda ao longo do mês. O teu treino devia mudar também.*

No VITALIS, o treino adapta-se ao teu ciclo menstrual:

🌙 Menstrual (Dias 1-5) → Repouso, movimento suave
🌸 Folicular (Dias 6-14) → Energia a subir
☀️ Ovulação (Dias 14-17) → Pico de força
🍂 Lútea (Dias 18-28) → Recuperação

Frequência, duração, intensidade - tudo muda conforme a TUA fase.

Nenhuma outra app de coaching faz isto.

👉 ${linkVitalis}

7 dias de garantia. Experimenta. 🌿`,
    },
    {
      titulo: 'Landing PC - credibilidade',
      imagem: MOCKUP_IMAGES.landingPC,
      mensagem: `🖥 *VITALIS - A raiz da transformação*

Coaching nutricional personalizado. Dashboard completo. 98 receitas. Coach 24h. Treinos por ciclo. Apoio emocional.

Plataforma profissional. Acessível. Inteligente.

Método Precision Nutrition adaptado a ti.

Envia DM para saber como começar.

Vê a plataforma: ${linkVitalis} 🌿`,
    },
  ];
}

// ============================================================
// SETUP INSTAGRAM - Perfil pronto a copiar
// ============================================================

export function getSetupInstagram() {
  return {
    nome: 'Sete Ecos 🌿',
    username: '@seteecos',
    bio: `Transmutação Integral 🌿
Comida · Emoção · Corpo · Mente · Voz · Identidade
🧠 Inteligência nutricional e desportiva
🔮 LUMINA: diagnóstico gratuito ↓
🌱 7 módulos de transformação ↓`,
    link: 'https://app.seteecos.com/lumina',
    linkTexto: 'app.seteecos.com/lumina',
    categoria: 'Saúde/Beleza',
    destaques: [
      { nome: '🔮 LUMINA', descricao: 'Screenshots do LUMINA + resultados + reacções', cor: 'roxo/azul' },
      { nome: '🌿 VITALIS', descricao: 'Tour pela app + funcionalidades + preço', cor: 'verde sage' },
      { nome: '📖 RECEITAS', descricao: 'Screenshots de receitas + comida local', cor: 'verde' },
      { nome: '💜 EMOÇÃO', descricao: 'Espaço de retorno + dicas emocionais', cor: 'roxo' },
      { nome: '🗣 EU', descricao: 'Vivianne: quem sou, a minha história, bastidores', cor: 'dourado' },
      { nome: '💬 OPINIÕES', descricao: 'Screenshots de feedbacks + testemunhos', cor: 'branco' },
    ],
    fotoPerfil: 'Foto da Vivianne com fundo claro/verde. Sorriso natural. Sem filtros excessivos.',
    primeirosPassos: [
      'Muda para conta Profissional (Criador de Conteúdo > Saúde/Beleza)',
      'Coloca a bio exactamente como está acima',
      'Link na bio: app.seteecos.com/lumina (LUMINA primeiro, porque é gratuito)',
      'Publica os 3 primeiros posts antes de seguir qualquer pessoa',
      'Segue 50-100 contas relevantes (saúde, bem-estar, nutrição, fitness)',
      'Activa notificações das contas que segues para interagir cedo',
    ],
  };
}

// ============================================================
// CALENDÁRIO 6 DIAS - Tudo pronto, dia a dia, hora a hora
// Cada entrada tem TUDO: o que publicar, onde, quando, textos, imagens
// ============================================================

export function getCalendario6Dias() {
  const conteudos = getConteudosMockupVitalis();
  const mensagensWA = getMensagensWhatsAppMockups();

  // Map posts by number for easy reference
  const post = (n) => conteudos.find(c => c.numero === n);

  return [
    // =================== DIA 1 ===================
    {
      dia: 1,
      titulo: 'DIA 1 — Lançamento do Perfil',
      subtitulo: 'Hoje crias o perfil e publicas os primeiros posts. Impacto máximo.',
      tarefas: [
        {
          hora: '08:00',
          tipo: 'setup',
          titulo: 'Configurar perfil Instagram',
          descricao: 'Bio, foto, destaques, link. Tudo conforme o guia de Setup acima.',
          accao: 'Copiar bio → Colar no Instagram → Meter foto → Link na bio',
        },
        {
          hora: '09:00',
          tipo: 'post',
          titulo: 'Post #1 — Saúde real. Feita para nós.',
          descricao: 'O post de apresentação. FIXA NO TOPO DO FEED.',
          post: post(1),
          accao: 'Descarregar imagem mozproud → Publicar → Copiar caption → Fixar post no perfil',
        },
        {
          hora: '10:00',
          tipo: 'whatsapp',
          titulo: 'WhatsApp: Anunciar aos contactos',
          descricao: 'Envia para TODOS os contactos e grupos relevantes.',
          mensagemWA: mensagensWA[0],
          accao: 'Copiar mensagem → Abrir WhatsApp → Enviar para listas de broadcast + grupos + contactos individuais',
        },
        {
          hora: '12:00',
          tipo: 'post',
          titulo: 'Post #7 — Carrossel: 5 coisas que o VITALIS faz',
          descricao: 'Carrossel = mais alcance no Instagram. Publica este como 2º post.',
          post: post(7),
          accao: 'Descarregar os 6 slides → Publicar como carrossel → Copiar caption',
        },
        {
          hora: '14:00',
          tipo: 'stories',
          titulo: 'Stories: 5 slides de apresentação',
          stories: [
            { texto: 'Foto tua + texto: "Hoje começa algo novo 🌿"', tipo: 'foto' },
            { texto: 'Screenshot do post #1 (mozproud) + "Segue @seteecos"', tipo: 'screenshot' },
            { texto: 'Mockup do dashboard + "Isto é o VITALIS por dentro 📱"', tipo: 'imagem' },
            { texto: 'Texto: "98 receitas equilibradas e saborosas 🍽"', tipo: 'texto' },
            { texto: 'Sticker de Link para app.seteecos.com/lumina + "Experimenta grátis 🔮"', tipo: 'link' },
          ],
          accao: 'Publicar os 5 stories ao longo da tarde (1 a cada 30min para manter engagement)',
        },
        {
          hora: '21:00',
          tipo: 'whatsapp',
          titulo: 'Status WhatsApp: Imagem mozproud',
          descricao: 'Coloca a imagem mozproud-vitalis no teu status do WhatsApp.',
          accao: 'Descarregar mozproud → Colocar como status → Adicionar texto "Segue @seteecos no Instagram 🌿"',
        },
      ],
    },

    // =================== DIA 2 ===================
    {
      dia: 2,
      titulo: 'DIA 2 — Emoção + Viral',
      subtitulo: 'Posts emocionais geram mais partilhas. Hoje é sobre conexão.',
      tarefas: [
        {
          hora: '08:00',
          tipo: 'post',
          titulo: 'Reel #12 — Porquê o VITALIS existe.',
          descricao: 'O reel mais emotivo. Storytelling pessoal = partilhas garantidas.',
          post: post(12),
          accao: 'Gravar reel seguindo o roteiro → Publicar → Copiar caption',
        },
        {
          hora: '10:00',
          tipo: 'whatsapp',
          titulo: 'WhatsApp: Enviar o reel',
          mensagemWA: mensagensWA[1],
          descricao: 'Envia o link do reel + mockup dashboard para contactos que não responderam ontem.',
          accao: 'Copiar mensagem → Enviar com imagem do dashboard',
        },
        {
          hora: '14:00',
          tipo: 'post',
          titulo: 'Post #5 — O que estás a sentir agora? 💜',
          descricao: 'Post emocional com ecrã do Espaço de Retorno. As cores vibrantes chamam atenção.',
          post: post(5),
          accao: 'Descarregar imagem espaço retorno → Publicar → Copiar caption',
        },
        {
          hora: '16:00',
          tipo: 'stories',
          titulo: 'Stories: Emoção + Bastidores',
          stories: [
            { texto: 'Selfie + "Sabias que 80% dos problemas com comida são emocionais?"', tipo: 'foto' },
            { texto: 'Screenshot do Espaço de Retorno + "Isto existe dentro do VITALIS"', tipo: 'imagem' },
            { texto: 'Enquete: "Já comeste por ansiedade?" SIM / QUEM NUNCA', tipo: 'enquete' },
            { texto: 'Texto: "O VITALIS cuida da comida E da emoção ao mesmo tempo 🤍"', tipo: 'texto' },
            { texto: 'Link sticker para LUMINA: "Começa por aqui — gratuito 🔮"', tipo: 'link' },
          ],
          accao: 'Publicar ao longo da tarde. A enquete gera interacção!',
        },
        {
          hora: '21:00',
          tipo: 'interaccao',
          titulo: 'Interagir: comentar em 10 contas relevantes',
          descricao: 'Vai a contas de saúde/bem-estar e deixa comentários genuínos.',
          accao: 'Procurar #saudereal #bemestar → Comentar (não spam) → Seguir 20 contas relevantes',
        },
      ],
    },

    // =================== DIA 3 ===================
    {
      dia: 3,
      titulo: 'DIA 3 — Polémico + Prático',
      subtitulo: 'Conteúdo que desafia o status quo + valor prático concreto.',
      tarefas: [
        {
          hora: '09:00',
          tipo: 'post',
          titulo: 'Post #8 — Carrossel: Dietas vs VITALIS',
          descricao: 'Formato comparativo = comentários + partilhas. Polémico no bom sentido.',
          post: post(8),
          accao: 'Descarregar 5 slides → Publicar como carrossel → Copiar caption',
        },
        {
          hora: '11:00',
          tipo: 'whatsapp',
          titulo: 'WhatsApp: Receitas',
          mensagemWA: mensagensWA[3],
          descricao: 'Foco nas receitas locais — argumento mais forte.',
          accao: 'Copiar mensagem → Enviar com mockup receitas → Enviar para grupos de mães/cozinha',
        },
        {
          hora: '14:00',
          tipo: 'post',
          titulo: 'Post #4 — 98 receitas. Todas do mercado.',
          descricao: 'Post prático: mostra a biblioteca de receitas real.',
          post: post(4),
          accao: 'Descarregar imagem receitas → Publicar → Copiar caption',
        },
        {
          hora: '17:00',
          tipo: 'stories',
          titulo: 'Stories: Receitas + Enquete',
          stories: [
            { texto: 'Mockup receitas + "98 receitas e NENHUMA pede quinoa 😂"', tipo: 'imagem' },
            { texto: 'Enquete: "O que mais te faz recair?" STRESS / CANSAÇO', tipo: 'enquete' },
            { texto: 'Quiz: "Qual a melhor hora para treinar?" (depende do teu ciclo!)', tipo: 'quiz' },
            { texto: 'Mockup coach + "Dúvida sobre porções? Pergunta à coach 24h"', tipo: 'imagem' },
            { texto: 'Sticker link LUMINA', tipo: 'link' },
          ],
          accao: 'Enquetes e quizzes aumentam o alcance dos stories',
        },
      ],
    },

    // =================== DIA 4 ===================
    {
      dia: 4,
      titulo: 'DIA 4 — Trending + Diferencial',
      subtitulo: 'Reel trending para alcance + post que mostra o diferencial único.',
      tarefas: [
        {
          hora: '09:00',
          tipo: 'post',
          titulo: 'Reel #11 — POV: A tua amiga envia-te um link...',
          descricao: 'Formato trending POV. Potencial viral. Pede para marcar amigas.',
          post: post(11),
          accao: 'Gravar reel seguindo o roteiro → Usar áudio trending → Publicar',
        },
        {
          hora: '12:00',
          tipo: 'whatsapp',
          titulo: 'WhatsApp: Coach 24h',
          mensagemWA: mensagensWA[2],
          descricao: 'Destaque para a coach — diferencial único.',
          accao: 'Copiar mensagem → Enviar com mockup coach',
        },
        {
          hora: '15:00',
          tipo: 'post',
          titulo: 'Post #3 — Uma coach que nunca dorme.',
          descricao: 'Mostra o coach IA como diferencial único.',
          post: post(3),
          accao: 'Descarregar imagem coach → Publicar → Copiar caption',
        },
        {
          hora: '19:00',
          tipo: 'stories',
          titulo: 'Stories: Demo da Coach',
          stories: [
            { texto: 'Gravação de ecrã: abrir a coach e fazer uma pergunta sobre porções', tipo: 'gravacao' },
            { texto: 'Reacção tua à resposta da coach + "Impressionante, não?"', tipo: 'foto' },
            { texto: 'Texto: "Disponível 24h. Sem julgamento. Sem espera."', tipo: 'texto' },
            { texto: 'Enquete: "Já tiveste dúvidas de nutrição às 3 da manhã?" SIM / NÃO', tipo: 'enquete' },
            { texto: 'Sticker link LUMINA', tipo: 'link' },
          ],
          accao: 'A gravação de ecrã real é OURO — mostra que é verdade',
        },
      ],
    },

    // =================== DIA 5 ===================
    {
      dia: 5,
      titulo: 'DIA 5 — Educativo + Nicho',
      subtitulo: 'Tour completo pela app + conteúdo especializado para mulheres.',
      tarefas: [
        {
          hora: '09:00',
          tipo: 'post',
          titulo: 'Post #9 — Carrossel: Tour pela app em 7 ecrãs',
          descricao: 'Tour visual completo. Prova que a app é REAL.',
          post: post(9),
          accao: 'Descarregar 7 slides → Publicar como carrossel → Copiar caption',
        },
        {
          hora: '12:00',
          tipo: 'whatsapp',
          titulo: 'WhatsApp: Treinos por ciclo',
          mensagemWA: mensagensWA[5],
          descricao: 'Treinos adaptados ao ciclo menstrual — tema que gera conversa.',
          accao: 'Copiar mensagem → Enviar com mockup treinos',
        },
        {
          hora: '15:00',
          tipo: 'post',
          titulo: 'Post #6 — O teu treino adapta-se ao ciclo.',
          descricao: 'Conteúdo de nicho: ciclo menstrual + treino. Muito partilhável.',
          post: post(6),
          accao: 'Descarregar imagem treinos → Publicar → Copiar caption',
        },
        {
          hora: '18:00',
          tipo: 'stories',
          titulo: 'Stories: Ciclo Menstrual',
          stories: [
            { texto: 'Texto: "Sabias que treinar intenso na fase errada pode prejudicar-te?"', tipo: 'texto' },
            { texto: 'Mockup treinos + mostrar as 4 fases', tipo: 'imagem' },
            { texto: 'Slider: "Quanto sabes sobre o teu ciclo?" 🌙→☀️', tipo: 'slider' },
            { texto: 'Texto: "O VITALIS adapta o treino à tua fase. Automaticamente."', tipo: 'texto' },
            { texto: 'Sticker link VITALIS', tipo: 'link' },
          ],
          accao: 'Conteúdo educativo gera saves e partilhas',
        },
      ],
    },

    // =================== DIA 6 ===================
    {
      dia: 6,
      titulo: 'DIA 6 — Relatable + Profissional',
      subtitulo: 'Último dia da primeira vaga. Mostrar a app por dentro + reel relatable.',
      tarefas: [
        {
          hora: '09:00',
          tipo: 'post',
          titulo: 'Reel #10 — Um dia com VITALIS',
          descricao: 'Formato "day in my life" com a app. Relatable e aspiracional.',
          post: post(10),
          accao: 'Gravar reel mostrando o dia com gravação de ecrã → Publicar',
        },
        {
          hora: '12:00',
          tipo: 'whatsapp',
          titulo: 'WhatsApp: Landing + urgência suave',
          mensagemWA: mensagensWA[6],
          descricao: 'Última mensagem da semana. Mostra a plataforma profissional.',
          accao: 'Copiar mensagem → Enviar com mockup landing PC',
        },
        {
          hora: '15:00',
          tipo: 'post',
          titulo: 'Post #2 — Isto é o VITALIS por dentro.',
          descricao: 'Dashboard real da app. Profissionalismo. Prova social.',
          post: post(2),
          accao: 'Descarregar imagem dashboard → Publicar → Copiar caption',
        },
        {
          hora: '18:00',
          tipo: 'stories',
          titulo: 'Stories: Resumo da semana',
          stories: [
            { texto: 'Selfie: "Esta semana foi especial. Obrigada por estarem aqui 🤍"', tipo: 'foto' },
            { texto: 'Texto: "Em 6 dias: [X] seguidores, [X] mensagens, [X] LUMINAs feitos"', tipo: 'texto' },
            { texto: 'Screenshot de uma mensagem/feedback recebido (com permissão)', tipo: 'screenshot' },
            { texto: 'Countdown: "Próxima semana: NOVIDADES 🌿"', tipo: 'countdown' },
            { texto: 'Sticker link LUMINA + "Ainda não experimentaste? É grátis 🔮"', tipo: 'link' },
          ],
          accao: 'Fechar a semana com gratidão e antecipação',
        },
        {
          hora: '21:00',
          tipo: 'analise',
          titulo: 'Analisar resultados da semana',
          descricao: 'Ver no Instagram Insights: alcance, seguidores, posts com melhor performance.',
          accao: 'Instagram → Insights → Ver top posts → Anotar o que funcionou melhor → Repetir na semana 2',
        },
      ],
    },
  ];
}

// ============================================================
// GUIA META DEVELOPER - Setup completo para auto-publicar
// ============================================================

export function getGuiaMetaDeveloper() {
  return {
    titulo: 'Configurar Publicacao Automatica no Instagram',
    descricao: 'Guia passo-a-passo para ligar o Sete Ecos ao Instagram via Meta Graph API. Depois de configurar, os posts publicam-se sozinhos.',
    tempoEstimado: '20-30 minutos',
    requisitos: [
      'Conta Instagram Business ou Creator (não pessoal)',
      'Página de Facebook ligada ao Instagram',
      'Conta Meta Developer (grátis)',
    ],
    passos: [
      {
        numero: 1,
        titulo: 'Converter conta Instagram para Business',
        instrucoes: [
          'Abrir Instagram → Definições → Conta',
          'Tocar "Mudar para conta profissional"',
          'Escolher "Business" (empresa) ou "Creator" (criador)',
          'Selecionar categoria "Saúde/Beleza"',
          'Ligar a uma Página de Facebook (criar uma se não tiveres)',
        ],
        nota: 'A conta pessoal NÃO funciona com a API. Tem de ser Business ou Creator.',
      },
      {
        numero: 2,
        titulo: 'Criar App no Meta Developer',
        instrucoes: [
          'Ir a developers.facebook.com e fazer login',
          'Clicar "Criar App" → Tipo: "Business"',
          'Nome da app: "Sete Ecos Publishing" (ou como quiseres)',
          'Conta Business: selecionar a tua (ou criar)',
          'No painel da app, ir a "Adicionar Produto" → "Instagram Graph API" → Configurar',
        ],
        link: 'https://developers.facebook.com/apps/',
      },
      {
        numero: 3,
        titulo: 'Obter Token de Acesso',
        instrucoes: [
          'No painel da app, ir a "Ferramentas" → "Graph API Explorer"',
          'Em "Meta App", seleccionar a app criada',
          'Em "User or Page", seleccionar a tua Página de Facebook',
          'Adicionar permissoes: instagram_basic, instagram_content_publish, pages_show_list, pages_read_engagement',
          'Clicar "Generate Access Token" e autorizar',
          'IMPORTANTE: Este token expira em 1 hora. Para token permanente, seguir passo 4.',
        ],
      },
      {
        numero: 4,
        titulo: 'Converter para Token Permanente',
        instrucoes: [
          'Copiar o token do passo 3',
          'Ir ao Graph API Explorer e fazer este pedido:',
          'GET /me/accounts?access_token={TOKEN_CURTO}',
          'Na resposta, encontrar a tua Página e copiar o "access_token" dela',
          'Este Page Token ja NAO expira (Long-Lived Page Token)',
          'Guardar este token - e o META_ACCESS_TOKEN',
        ],
        nota: 'O Page Token permanente e o que vais usar. Nunca partilhes este token.',
      },
      {
        numero: 5,
        titulo: 'Obter Instagram Account ID',
        instrucoes: [
          'No Graph API Explorer, fazer:',
          'GET /me/accounts (com o token permanente)',
          'Copiar o "id" da Página de Facebook',
          'Depois fazer: GET /{PAGE_ID}?fields=instagram_business_account',
          'O campo "instagram_business_account.id" e o teu INSTAGRAM_ACCOUNT_ID',
        ],
      },
      {
        numero: 6,
        titulo: 'Configurar no Vercel',
        instrucoes: [
          'Ir ao painel Vercel → Projeto sete-ecos-pwa → Settings → Environment Variables',
          'Adicionar:',
          '  META_ACCESS_TOKEN = (token permanente do passo 4)',
          '  INSTAGRAM_ACCOUNT_ID = (ID do passo 5)',
          '  CRON_SECRET = (inventar uma password qualquer, ex: "minha-chave-secreta-123")',
          'Clicar "Save" e fazer Redeploy',
        ],
        nota: 'Depois do redeploy, o botao "Publicar no Instagram" fica activo no dashboard.',
      },
      {
        numero: 7,
        titulo: 'Criar tabela no Supabase',
        instrucoes: [
          'Ir ao painel Supabase → SQL Editor',
          'Colar e executar o script CREATE_SCHEDULED_POSTS.sql',
          'Este script está na pasta /scripts/ do projeto',
          'A tabela scheduled_posts guarda as publicações agendadas',
        ],
        nota: 'Sem esta tabela, o agendamento não funciona. A publicação direta funciona sem ela.',
      },
    ],
    verificacao: {
      titulo: 'Como verificar se está tudo a funcionar',
      passos: [
        'No Marketing Dashboard, secção VITALIS, o indicador "Meta API" deve ficar verde',
        'Se ficar vermelho, verifica os tokens no Vercel',
        'Testa com "Publicar Agora" num post - deve aparecer no Instagram em 30 segundos',
        'Para agendamento: agenda um post para daqui a 20 minutos e espera',
      ],
    },
    problemas: [
      {
        problema: 'Token expirado / erro 190',
        solucao: 'Gerar novo token seguindo passos 3 e 4. Os Page Tokens permanentes raramente expiram, mas podem ser revogados se mudares a password do Facebook.',
      },
      {
        problema: 'Permissão negada / erro OAuthException',
        solucao: 'Verificar se a app tem as permissões instagram_content_publish e pages_show_list aprovadas.',
      },
      {
        problema: 'Imagem não encontrada',
        solucao: 'As imagens precisam de estar num URL público acessível pela Meta. As imagens em /public/mockups/ são servidas pelo Vercel e funcionam.',
      },
      {
        problema: 'Rate limit / erro 4 ou 32',
        solucao: 'A Meta limita a ~25 posts por dia. O sistema automaticamente espera quando atinge o limite.',
      },
    ],
  };
}

// ============================================================
// STATUS SEMANAL DINÂMICO — roda automaticamente a cada semana
// ============================================================

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000));
}

const STATUS_PLAN = [
  // [dia, tipo, fonte de conteúdo, template visual, eco, bgIndex]
  { dia: 'Segunda', tipo: 'dica',       fonte: 'corpo',      tpl: 'statusWA',      eco: 'vitalis', bgIdx: [1, 3, 6, 0] },
  { dia: 'Terça',   tipo: 'motivação',  fonte: 'hooks',      tpl: 'statusMinimal', eco: 'lumina',  bgIdx: null },
  { dia: 'Quarta',  tipo: 'testemunho', fonte: 'emocional',  tpl: 'statusWA',      eco: 'vitalis', bgIdx: [4, 2, 8, 5] },
  { dia: 'Quinta',  tipo: 'bastidores', fonte: 'hooks',      tpl: 'statusMinimal', eco: 'vitalis', bgIdx: null },
  { dia: 'Sexta',   tipo: 'promoção',   fonte: 'provocacao', tpl: 'statusWA',      eco: 'vitalis', bgIdx: [5, 0, 1, 7] },
  { dia: 'Sábado',  tipo: 'receita',    fonte: 'corpo',      tpl: 'statusWA',      eco: 'vitalis', bgIdx: [6, 3, 1, 9] },
  { dia: 'Domingo', tipo: 'reflexão',   fonte: 'emocional',  tpl: 'statusMinimal', eco: 'vitalis', bgIdx: null },
];

const STATUS_CTAS = {
  dica:       '🌱 Experimenta grátis 7 dias: app.seteecos.com/vitalis\n💬 Fala comigo: wa.me/258851006473',
  motivação:  '✨ Faz o diagnóstico grátis: app.seteecos.com/lumina\n💬 Fala comigo: wa.me/258851006473',
  testemunho: '🔮 Faz o LUMINA: app.seteecos.com/lumina\n🌱 Conhece o VITALIS: app.seteecos.com/vitalis\n💬 Fala comigo: wa.me/258851006473',
  bastidores: '🌱 Conhece o projecto: app.seteecos.com\n💬 Fala comigo: wa.me/258851006473',
  promoção:   '✅ Experimenta grátis 7 dias: app.seteecos.com/vitalis\n💬 Fala comigo para começar: wa.me/258851006473',
  receita:    '🌱 Receitas e mais: app.seteecos.com/vitalis\n💬 Fala comigo: wa.me/258851006473',
  reflexão:   '🔮 LUMINA grátis: app.seteecos.com/lumina\n💬 Fala comigo: wa.me/258851006473',
};

function gerarStatusSemanal() {
  const week = getWeekNumber();

  return STATUS_PLAN.map((plan) => {
    let conteudo;
    if (plan.fonte === 'corpo') {
      conteudo = pickFromArray(CONTEUDO_CORPO, week + STATUS_PLAN.indexOf(plan));
    } else if (plan.fonte === 'emocional') {
      conteudo = pickFromArray(CONTEUDO_EMOCIONAL, week + STATUS_PLAN.indexOf(plan));
    } else if (plan.fonte === 'provocacao') {
      conteudo = pickFromArray(CONTEUDO_PROVOCACAO, week + STATUS_PLAN.indexOf(plan));
    } else {
      // hooks — frase curta motivacional
      const hook = pickFromArray(HOOKS_PROVOCADORES, week + STATUS_PLAN.indexOf(plan));
      conteudo = { hook, corpo: '', cta: '' };
    }

    const hookText = conteudo.hook;
    const bodyText = conteudo.corpo ? `\n\n${conteudo.corpo}` : '';
    const ctaText = conteudo.cta ? `\n\n${conteudo.cta}` : '';

    // Legenda completa com link + WA + CTA
    const exemplo = `${hookText}${bodyText}${ctaText}\n\n${STATUS_CTAS[plan.tipo]}`;

    // Imagem — texto curto para a imagem (só hook + subtítulo)
    const imgTexto = hookText.length > 70 ? hookText.split('.').slice(0, 2).join('.') + '.' : hookText;
    const imgSub = conteudo.cta || (conteudo.corpo ? conteudo.corpo.split('.')[0] + '.' : '');
    const bgIndex = plan.bgIdx ? plan.bgIdx[week % plan.bgIdx.length] : 0;

    return {
      dia: plan.dia,
      conteudo: plan.tipo.charAt(0).toUpperCase() + plan.tipo.slice(1),
      exemplo,
      imagem: {
        template: plan.tpl,
        eco: plan.eco,
        texto: imgTexto,
        subtitulo: imgSub.length > 80 ? imgSub.substring(0, 77) + '...' : imgSub,
        bgIndex,
      },
    };
  });
}

// ============================================================
// WHATSAPP BUSINESS - Setup completo profissional
// ============================================================

export function getSetupWhatsAppBusiness() {
  return {
    perfil: {
      nome: 'Sete Ecos',
      categoria: 'Saúde e bem-estar',
      descricao: 'Inteligência nutricional e desportiva 🌿 Coaching personalizado',
      sobre: 'Inteligência nutricional e desportiva 🌿 Coaching personalizado',
      horario: 'Seg-Sex: 8h-18h',
      email: 'viv.saraiva@gmail.com',
      website: 'https://app.seteecos.com',
      endereco: '',
    },
    saudacao: `Olá! 🌿 Bem-vindo/a ao Sete Ecos.\n\nSou a Vivianne, coach de nutrição e bem-estar.\n\nComo te posso ajudar?\n\n1️⃣ Quero saber mais sobre o VITALIS (coaching nutricional)\n2️⃣ Quero fazer o diagnóstico gratuito LUMINA\n3️⃣ Tenho dúvidas sobre preços\n4️⃣ Preciso de suporte técnico\n\nResponde com o número ou escreve à vontade 💚`,
    ausencia: `Olá! 🌿 Obrigada pela tua mensagem.\n\nNeste momento estou fora do horário de atendimento (Seg-Sex, 8h-18h).\n\nEnquanto isso, podes:\n🔮 Fazer o diagnóstico gratuito: app.seteecos.com/lumina\n🌱 Ver o programa VITALIS: app.seteecos.com/vitalis\n\nRespondo-te assim que possível! 💚`,
    respostasRapidas: [
      {
        atalho: '/precos',
        titulo: 'Preços VITALIS',
        mensagem: `Os nossos planos VITALIS (coaching nutricional):\n\n💚 Mensal: 2.500 MZN/mês\n💚 Semestral: 12.500 MZN (poupas 2.500!)\n💚 Anual: 21.000 MZN (poupas 9.000!)\n\nTodos incluem:\n✅ Plano alimentar personalizado\n✅ 98 receitas equilibradas e variadas\n✅ Chat directo comigo\n✅ Treinos guiados\n✅ Acompanhamento semanal\n\nQueres experimentar? Posso activar-te um período de teste 🌱`,
      },
      {
        atalho: '/lumina',
        titulo: 'Diagnóstico LUMINA',
        mensagem: `O LUMINA é o nosso diagnóstico gratuito 🔮\n\nEm 5 minutos, descobres:\n• Como está a tua relação com a comida\n• Os teus padrões emocionais\n• O que o teu corpo está a pedir\n\nÉ 100% grátis, sem compromisso.\n\nFaz aqui: app.seteecos.com/lumina 💜`,
      },
      {
        atalho: '/vitalis',
        titulo: 'Programa VITALIS',
        mensagem: `O VITALIS é o nosso programa de coaching nutricional 🌱\n\nNão é dieta. É transformação.\n\nO que inclui:\n🍽 Plano alimentar personalizado com comida real\n📊 Dashboard com o teu progresso\n💬 Chat directo comigo\n🏋️ Treinos adaptados ao teu nível\n📋 Lista de compras automática\n🔄 Espaço de retorno (sem culpa, sem julgamento)\n\nInteligência nutricional e desportiva. Para ti.\n\nQueres começar? 💚`,
      },
      {
        atalho: '/pagamento',
        titulo: 'Dados de pagamento',
        mensagem: `Para efectuar o pagamento:\n\n📱 M-Pesa: 85 100 6473 (Vivianne Santos)\n\nDepois de pagar:\n1. Envia-me o comprovativo aqui\n2. Eu activo o teu acesso em menos de 1 hora\n3. Recebes email com as instruções\n\nQual plano escolheste? 💚`,
      },
      {
        atalho: '/obrigada',
        titulo: 'Agradecimento',
        mensagem: `Obrigada pela confiança! 💚\n\nQualquer dúvida, estou aqui. Este número é exclusivo para o Sete Ecos, por isso não hesites em escrever.\n\nLembra-te: isto é uma jornada, não uma corrida. Um dia de cada vez. 🌿`,
      },
      {
        atalho: '/teste',
        titulo: 'Activar teste',
        mensagem: `Óptimo! Vou activar-te um período de teste do VITALIS 🌱\n\nPreciso só de:\n1. O teu nome completo\n2. O teu email (para criares conta)\n\nAssim que enviares, activo em minutos! 💚`,
      },
      {
        atalho: '/suporte',
        titulo: 'Suporte técnico',
        mensagem: `Lamento que estejas com dificuldades 😔\n\nDiz-me:\n1. Qual é o problema exactamente?\n2. Que ecrã estás a ver?\n3. Se possível, envia screenshot\n\nVou resolver o mais rápido possível! 🛠`,
      },
    ],
    etiquetas: [
      { nome: 'Cliente Activo/a', cor: 'verde', descricao: 'Tem subscrição activa' },
      { nome: 'Interessado/a', cor: 'amarelo', descricao: 'Perguntou mas ainda não comprou' },
      { nome: 'Teste', cor: 'azul', descricao: 'Em período de teste' },
      { nome: 'Expirado/a', cor: 'vermelho', descricao: 'Subscrição expirou' },
      { nome: 'Lumina', cor: 'roxo', descricao: 'Fez o diagnóstico gratuito' },
      { nome: 'Suporte', cor: 'cinza', descricao: 'Precisa de ajuda técnica' },
    ],
    catalogo: [
      {
        nome: 'LUMINA — Diagnóstico Gratuito',
        preco: 'Grátis',
        descricao: 'Descobre como está a tua relação com a comida, os teus padrões emocionais e o que o teu corpo precisa. 5 minutos, 100% gratuito, sem compromisso. Resultados imediatos com leitura personalizada.',
        link: 'https://app.seteecos.com/lumina',
        imagem: '/mockups/Vitalis-landing_PC-mockup.jpeg',
      },
      {
        nome: 'VITALIS Mensal',
        preco: '2.500 MZN/mês',
        descricao: 'Coaching nutricional completo: plano alimentar personalizado, 98 receitas, treinos guiados, chat directo com a coach, lista de compras automática e acompanhamento semanal.',
        link: 'https://app.seteecos.com/vitalis',
        imagem: '/mockups/Vitalis-dashboard_mb-mockup.jpeg',
      },
      {
        nome: 'VITALIS Semestral (Poupa 2.500 MZN)',
        preco: '12.500 MZN',
        descricao: '6 meses de transformação com todos os benefícios do plano mensal. Poupas o equivalente a 1 mês inteiro. Ideal para quem quer compromisso real com a mudança.',
        link: 'https://app.seteecos.com/vitalis',
        imagem: '/mockups/Vitalis-receitas_mb-mockup.jpeg',
      },
      {
        nome: 'VITALIS Anual (Poupa 9.000 MZN)',
        preco: '21.000 MZN',
        descricao: '12 meses de acompanhamento completo. A maior poupança e o compromisso total com a tua transformação. Prioridade no suporte e acesso a todas as novidades.',
        link: 'https://app.seteecos.com/vitalis',
        imagem: '/mockups/Vitalis-coach_mb-mockup.jpeg',
      },
    ],
    statusSemanal: gerarStatusSemanal(),
  };
}

// ============================================================
// CONTEÚDO MULTI-ECO — Todos os 7 Ecos + Lumina
// Hooks, carrosséis, posts IG, mensagens WA, scripts TikTok
// ============================================================

const ECO_CONTEUDO = {
  aurea: {
    nome: 'ÁUREA',
    subtitulo: 'Programa de Autovalor',
    emoji: '✨',
    moeda: 'Jóias de Ouro',
    cor: '#C9A227',
    link: '/aurea',
    linkPagamento: '/aurea/pagamento',
    preco: '699 MT/mês',
    hooks: [
      'O teu valor não cabe numa calça tamanho S.',
      'Gastas horas a escolher roupa e 0 minutos a cuidar de como te vês ao espelho.',
      'Se precisas de validação externa para te sentires suficiente, este post é para ti.',
      'Quando foi a última vez que te olhaste ao espelho sem te criticares?',
      'Compras coisas para preencher um vazio que só o autovalor resolve.',
    ],
    conteudoIG: [
      {
        tipo: 'dica',
        texto: 'O teu valor não depende do que vestes, pesas ou aparentas.',
        caption: 'O teu valor não depende do que vestes, pesas ou aparentas. 🤍\n\nO ÁUREA é um programa de 7 semanas para reconstruir a relação contigo.\n\nPorque antes de mudar o corpo, precisas de mudar o olhar.\n\n#seteecos #aurea #autovalor #autoestima #bemestar #transformacaopessoal',
      },
      {
        tipo: 'carrossel',
        titulo: '5 sinais de que o teu autovalor precisa de atenção',
        slides: [
          { titulo: '5 sinais de baixo autovalor', texto: 'Quantos reconheces em ti?' },
          { titulo: '1. Dizes sim quando queres dizer não', texto: 'O medo de rejeição controla as tuas decisões.' },
          { titulo: '2. Comparas-te constantemente', texto: 'O feed dos outros parece perfeito. O teu parece insuficiente.' },
          { titulo: '3. Compras para te sentires melhor', texto: 'Roupa nova, maquilhagem, sapatos. O vazio volta no dia seguinte.' },
          { titulo: '4. Precisas de validação para decidir', texto: '"Achas que me fica bem?" — A pergunta que escondes todos os dias.' },
          { titulo: 'O ÁUREA ajuda-te a mudar isto.', texto: '7 semanas. 100+ micro-práticas.\napp.seteecos.com/aurea' },
        ],
        caption: '5 sinais de que o teu autovalor precisa de atenção ✨\n\nReconheces algum? Desliza.\n\nSalva e partilha com quem precisa.\n\n#seteecos #aurea #autovalor #autoestima #mulherreal #empoderamento',
      },
      {
        tipo: 'testemunho',
        texto: 'Pela primeira vez em anos, olhei para o espelho e não me critiquei.',
        subtitulo: '- Participante ÁUREA',
        caption: '"Pela primeira vez em anos, olhei para o espelho e não me critiquei."\n\nIsto é possível. 7 semanas. Uma prática por dia.\n\nO ÁUREA não muda o teu corpo. Muda o teu olhar.\n\n#seteecos #aurea #transformacao #autoestima #bemestar',
      },
    ],
    mensagensWA: [
      `✨ *ÁUREA — Programa de Autovalor*\n\nSabes aquela sensação de nunca seres suficiente?\n\nO ÁUREA é um programa de 7 semanas com 100+ micro-práticas para reconstruir a tua relação contigo.\n\n• Dinheiro: como gastas reflecte como te valorizas\n• Tempo: a quem dás e de quem recebes\n• Roupa: o espelho como aliado, não inimigo\n• Prazer: reconectar com o que te faz sentir viva\n\nEnvia-me mensagem para saber como começar 🤍\n\n👉 `,
      `🤍 *Quando foi a última vez que fizeste algo SÓ para ti?*\n\nSem culpa. Sem justificação.\n\nO ÁUREA ensina-te a colocar-te em primeiro lugar — não por egoísmo, mas por sobrevivência emocional.\n\n7 semanas. Uma prática por dia. A mudança começa no olhar.\n\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Descobres que o teu valor não depende de ninguém',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\nTexto: "Quando foi a última vez que te olhaste ao espelho sem te criticares?"\n\n*CENA 2 (5-15s)* — DOR\nTexto: "Passas a vida a dar. Aos filhos. Ao trabalho. A toda a gente. E a ti?"\n\n*CENA 3 (15-25s)* — SOLUÇÃO\nTexto: "O ÁUREA: 7 semanas para reconstruir a relação contigo. 100+ micro-práticas."\n\n*CENA 4 (25-30s)* — CTA\nTexto: "Link na bio. Começa hoje. ✨"`,
      caption: 'Quando foi a última vez que te olhaste ao espelho e sorriste? ✨\n\n#seteecos #aurea #autovalor #autoestima #selflove #tiktok #fyp',
    },
  },

  serena: {
    nome: 'SERENA',
    subtitulo: 'Emoção & Fluidez',
    emoji: '💧',
    moeda: 'Gotas',
    cor: '#6B8E9B',
    link: '/serena',
    linkPagamento: '/serena/pagamento',
    preco: '499 MT/mês',
    hooks: [
      'Sentes tudo com intensidade e depois culpas-te por ser "demasiado".',
      'A ansiedade não é fraqueza. É o teu corpo a pedir atenção.',
      'Quantas vezes disseste "estou bem" quando não estavas?',
      'Se choras sem razão aparente, há uma razão. Só não a vês ainda.',
      'Reprimir emoções não é força. É uma bomba-relógio.',
    ],
    conteudoIG: [
      {
        tipo: 'dica',
        texto: 'A ansiedade não é fraqueza. É o teu corpo a pedir atenção.',
        caption: 'A ansiedade não é fraqueza. É o teu corpo a pedir atenção. 💧\n\nO SERENA tem 16 emoções mapeadas, 6 técnicas de respiração e um diário emocional que te ajuda a entender padrões.\n\nPara de fugir do que sentes. Começa a fluir.\n\n#seteecos #serena #saudeemocional #ansiedade #respiracao #bemestar',
      },
      {
        tipo: 'carrossel',
        titulo: '4 técnicas de respiração para ansiedade',
        slides: [
          { titulo: '4 respirações que acalmam em minutos', texto: 'Guarda este post. Vais precisar.' },
          { titulo: '1. Respiração 4-7-8', texto: 'Inspira 4s → Segura 7s → Expira 8s. Repete 4x. Acalma o sistema nervoso em 2 minutos.' },
          { titulo: '2. Respiração Box (Quadrada)', texto: 'Inspira 4s → Segura 4s → Expira 4s → Segura 4s. Usada por militares para controlo.' },
          { titulo: '3. Respiração Oceânica', texto: 'Inspira pelo nariz → Expira pela boca como se soprasses uma vela ao longe. Suave e profunda.' },
          { titulo: '4. Suspiro Fisiológico', texto: 'Duas inspirações curtas pelo nariz + uma expiração longa pela boca. A forma mais rápida de acalmar.' },
          { titulo: 'Pratica no SERENA com guia áudio.', texto: 'app.seteecos.com/serena\nEnvia DM para saber mais' },
        ],
        caption: '4 respirações que te acalmam em minutos 💧\n\nGuarda este post. Vai ser útil.\n\nQual vais experimentar primeiro?\n\n#seteecos #serena #respiracao #ansiedade #calma #saudeemocional #bemestar',
      },
      {
        tipo: 'testemunho',
        texto: 'Aprendi que sentir não é fraqueza. É informação.',
        subtitulo: '- Participante SERENA',
        caption: '"Aprendi que sentir não é fraqueza. É informação."\n\nO SERENA ensina-te a ouvir as tuas emoções em vez de as calar.\n\n16 emoções mapeadas. Diário emocional. Técnicas de respiração. Rituais de libertação.\n\n#seteecos #serena #emocoes #saudeemocional #transformacao',
      },
    ],
    mensagensWA: [
      `💧 *SERENA — Emoção & Fluidez*\n\nSentes tudo com intensidade? Depois culpas-te por ser "demais"?\n\nO SERENA ajuda-te a:\n\n🎯 Mapear 16 emoções diferentes\n🌊 6 técnicas de respiração guiadas\n📖 Diário emocional com padrões\n🔥 Rituais de libertação\n💆 Integração com o ciclo menstrual\n\nPara de reprimir. Começa a fluir.\n\nEnvia-me mensagem para saber mais 💧\n\n👉 `,
      `🤍 *Quantas vezes disseste "estou bem" quando não estavas?*\n\nO SERENA é o único espaço onde as tuas emoções são bem-vindas. Todas.\n\nSem julgamento. Sem "tens de ser forte". Só observação e fluidez.\n\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Aprendes a sentir sem culpa',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\nTexto: "Quantas vezes disseste 'estou bem' quando não estavas?"\n\n*CENA 2 (5-15s)* — DOR\nTexto: "Reprimir emoções não é força. É uma bomba-relógio."\n\n*CENA 3 (15-25s)* — SOLUÇÃO\nTexto: "SERENA: 16 emoções mapeadas. Respiração guiada. Diário emocional."\n\n*CENA 4 (25-30s)* — CTA\nTexto: "Link na bio. Começa a fluir. 💧"`,
      caption: 'Reprimir emoções não é força. É uma bomba-relógio. 💧\n\n#seteecos #serena #emocoes #ansiedade #saudeemocional #tiktok #fyp',
    },
  },

  ignis: {
    nome: 'IGNIS',
    subtitulo: 'Vontade & Foco',
    emoji: '🔥',
    moeda: 'Chamas',
    cor: '#C1634A',
    link: '/ignis',
    linkPagamento: '/ignis/pagamento',
    preco: '499 MT/mês',
    hooks: [
      'Tens 47 separadores abertos e nenhum projecto acabado.',
      'A procrastinação não é preguiça. É medo disfarçado.',
      'Se esperas pela motivação para agir, vais esperar para sempre.',
      'Dizes que não tens tempo. Tens. Não tens foco.',
      'A disciplina não vem de gritar contigo. Vem de te conheceres.',
    ],
    conteudoIG: [
      {
        tipo: 'dica',
        texto: 'A procrastinação não é preguiça. É medo disfarçado.',
        caption: 'A procrastinação não é preguiça. É medo disfarçado. 🔥\n\nMedo de falhar. Medo de não ser suficiente. Medo de começar.\n\nO IGNIS ajuda-te a identificar os teus padrões de dispersão e a transformar vontade em acção.\n\n16 desafios de fogo. Sessões de foco. Detector de distracções.\n\n#seteecos #ignis #foco #produtividade #disciplina #motivacao #bemestar',
      },
      {
        tipo: 'carrossel',
        titulo: '4 tipos de procrastinação (e como vencer cada um)',
        slides: [
          { titulo: 'Porque procrastinas?', texto: 'Não é preguiça. É um padrão. Descobre o teu.' },
          { titulo: '1. Procrastinação por medo', texto: '"E se não for suficiente?" — O perfeccionismo paralisa. A acção imperfeita é melhor que a inacção perfeita.' },
          { titulo: '2. Procrastinação por sobrecarga', texto: '"Tenho tanto para fazer..." — O cérebro bloqueia. Começa por UMA coisa. Só uma.' },
          { titulo: '3. Procrastinação por recompensa', texto: '"Amanhã faço" — O cérebro prefere o prazer imediato. Precisa de micro-recompensas.' },
          { titulo: '4. Procrastinação por valores', texto: '"Não me apetece" — Talvez o que adias não esteja alinhado com o que realmente importa.' },
          { titulo: 'O IGNIS treina a tua vontade.', texto: '16 desafios. Sessões de foco. Bússola de valores.\napp.seteecos.com/ignis' },
        ],
        caption: 'Porque procrastinas? Não é o que pensas. 🔥\n\nDesliza para descobrir o teu padrão.\n\n#seteecos #ignis #procrastinacao #foco #produtividade #mindset #bemestar',
      },
      {
        tipo: 'testemunho',
        texto: 'Finalmente percebi que não me faltava disciplina. Faltava-me direcção.',
        subtitulo: '- Participante IGNIS',
        caption: '"Não me faltava disciplina. Faltava-me direcção."\n\nO IGNIS não te obriga a ser produtivo. Ajuda-te a perceber O QUE realmente importa.\n\n#seteecos #ignis #foco #proposito #transformacao #bemestar',
      },
    ],
    mensagensWA: [
      `🔥 *IGNIS — Vontade & Foco*\n\nTens projectos que nunca acabas? Ideias que morrem no "amanhã começo"?\n\nO IGNIS treina a tua vontade:\n\n🎯 16 desafios de fogo (coragem, corte, alinhamento, iniciativa)\n⏱ Sessões de foco cronometradas\n🔍 Detector de distracções\n🧭 Bússola de valores\n📋 Plano de acção concreto\n\nEnvia-me mensagem para saber mais 🔥\n\n👉 `,
      `🤍 *Dizes que não tens tempo. Mas tens — não tens foco.*\n\nO IGNIS ajuda-te a separar o urgente do importante. A dizer não ao que não serve. A transformar vontade em acção.\n\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Descobres que não te falta disciplina, falta-te foco',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\nTexto: "47 separadores abertos. 0 projectos acabados."\n\n*CENA 2 (5-15s)* — DOR\nTexto: "Procrastinação não é preguiça. É medo disfarçado."\n\n*CENA 3 (15-25s)* — SOLUÇÃO\nTexto: "IGNIS: 16 desafios de fogo. Sessões de foco. Detector de distracções."\n\n*CENA 4 (25-30s)* — CTA\nTexto: "Link na bio. Acende o fogo. 🔥"`,
      caption: '47 separadores. 0 projectos acabados. Conheces? 🔥\n\n#seteecos #ignis #foco #produtividade #procrastinacao #tiktok #fyp',
    },
  },

  ventis: {
    nome: 'VENTIS',
    subtitulo: 'Energia & Ritmo',
    emoji: '🍃',
    moeda: 'Folhas',
    cor: '#5D9B84',
    link: '/ventis',
    linkPagamento: '/ventis/pagamento',
    preco: '499 MT/mês',
    hooks: [
      'Acordas cansada e adormeces exausta. Onde foi parar a tua energia?',
      'Tens uma rotina ou tens um modo de sobrevivência?',
      'Burnout não é medalha de honra. É o corpo a desistir de ti.',
      'Se precisas de café para funcionar, não é energia. É dívida.',
      'O teu corpo tem um ritmo natural. Ignora-lo é o que te cansa.',
    ],
    conteudoIG: [
      {
        tipo: 'dica',
        texto: 'Burnout não é medalha de honra. É o corpo a desistir de ti.',
        caption: 'Burnout não é medalha de honra. É o corpo a desistir de ti. 🍃\n\nO VENTIS monitoriza a tua energia, constrói rotinas conscientes e detecta sinais de burnout antes que seja tarde.\n\nMovimento. Natureza. Pausas. Ritmo.\n\n#seteecos #ventis #energia #burnout #rotina #bemestar #saudemental',
      },
      {
        tipo: 'carrossel',
        titulo: '5 sinais de que o teu corpo precisa de pausa',
        slides: [
          { titulo: 'O teu corpo está a pedir pausa?', texto: '5 sinais que ignoras todos os dias.' },
          { titulo: '1. Acordas já cansada', texto: '8 horas de sono e mesmo assim exausta. O corpo está a gritar.' },
          { titulo: '2. Irritas-te por tudo', texto: 'Não é mau feitio. É esgotamento emocional disfarçado.' },
          { titulo: '3. Café o dia todo', texto: 'Se precisas de estimulantes para funcionar, estás a pedir emprestado ao futuro.' },
          { titulo: '4. Zero vontade de socializar', texto: 'Isolamento é o último sinal antes do burnout completo.' },
          { titulo: 'O VENTIS detecta isto por ti.', texto: 'Monitor de energia. Detector de burnout.\napp.seteecos.com/ventis' },
        ],
        caption: 'O teu corpo está a pedir pausa? 🍃\n\nDesliza. Reconhece. Age.\n\n#seteecos #ventis #burnout #energia #pausa #saudemental #bemestar',
      },
      {
        tipo: 'testemunho',
        texto: 'Descobri que não precisava de fazer mais. Precisava de parar melhor.',
        subtitulo: '- Participante VENTIS',
        caption: '"Não precisava de fazer mais. Precisava de parar melhor."\n\nO VENTIS ensina-te a respeitar o teu ritmo natural.\n\n#seteecos #ventis #energia #ritmo #pausa #transformacao',
      },
    ],
    mensagensWA: [
      `🍃 *VENTIS — Energia & Ritmo*\n\nAcordas cansada? Adormeces exausta? O dia é uma maratona sem fim?\n\nO VENTIS ajuda-te a:\n\n📊 Monitorizar a tua energia real\n🧘 8 tipos de pausas conscientes\n🏃 Movimento: yoga, tai chi, dança\n🌿 10 actividades de conexão com a natureza\n🔥 Detector de burnout\n⚡ Mapeamento de picos e vales\n\nEnvia-me mensagem para saber mais 🍃\n\n👉 `,
      `🤍 *O teu corpo tem um ritmo natural. Ignora-lo é o que te cansa.*\n\nO VENTIS ensina-te a trabalhar COM o teu corpo, não contra ele.\n\nRotinas conscientes. Pausas estratégicas. Energia real.\n\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Descobres que não precisas de mais café, precisas de ritmo',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\nTexto: "Acordas cansada. Adormeces exausta. Onde foi a tua energia?"\n\n*CENA 2 (5-15s)* — DOR\nTexto: "Burnout não é medalha de honra. É o corpo a desistir de ti."\n\n*CENA 3 (15-25s)* — SOLUÇÃO\nTexto: "VENTIS: Monitor de energia. Pausas conscientes. Detector de burnout."\n\n*CENA 4 (25-30s)* — CTA\nTexto: "Link na bio. Encontra o teu ritmo. 🍃"`,
      caption: 'Burnout não é medalha de honra. 🍃\n\n#seteecos #ventis #energia #burnout #ritmo #tiktok #fyp',
    },
  },

  ecoa: {
    nome: 'ECOA',
    subtitulo: 'Expressão & Voz',
    emoji: '🔊',
    moeda: 'Ecos',
    cor: '#4A90A4',
    link: '/ecoa',
    linkPagamento: '/ecoa/pagamento',
    preco: '499 MT/mês',
    hooks: [
      'Quantas vezes engoliste o que querias dizer para não incomodar?',
      'O silêncio que te protegeu em criança está a sufocar-te agora.',
      'Se a tua voz treme quando pedes algo, o problema não é timidez.',
      'Tens uma opinião sobre tudo mas nunca a dizes em voz alta.',
      'Ser assertiva não é ser agressiva. É ser honesta.',
    ],
    conteudoIG: [
      {
        tipo: 'dica',
        texto: 'O silêncio que te protegeu em criança está a sufocar-te agora.',
        caption: 'O silêncio que te protegeu em criança está a sufocar-te agora. 🔊\n\nO ECOA é um programa de 8 semanas para recuperar a tua voz.\n\nMapa de silenciamento. Programa Micro-Voz. Cartas não enviadas. Comunicação assertiva.\n\n#seteecos #ecoa #voz #expressao #assertividade #comunicacao #bemestar',
      },
      {
        tipo: 'carrossel',
        titulo: '4 formas de silenciamento que não reconheces',
        slides: [
          { titulo: 'Estás a silenciar-te?', texto: 'Talvez sem saber. Descobre.' },
          { titulo: '1. Silêncio por medo', texto: '"Se eu disser, vão ficar chateados." — Priorizas o conforto dos outros acima da tua verdade.' },
          { titulo: '2. Silêncio por hábito', texto: '"Sempre fui assim." — Cresceste a ouvir que crianças boas não respondem.' },
          { titulo: '3. Silêncio por vergonha', texto: '"A minha opinião não é importante." — Aprendeste que a tua voz não conta.' },
          { titulo: '4. Silêncio por exaustão', texto: '"Não vale a pena." — Desististe de ser ouvida. E isso dói.' },
          { titulo: 'O ECOA devolve-te a voz.', texto: '8 semanas. Programa Micro-Voz.\napp.seteecos.com/ecoa' },
        ],
        caption: 'Estás a silenciar-te sem saber? 🔊\n\nDesliza e descobre.\n\n#seteecos #ecoa #voz #silencio #expressao #assertividade #bemestar',
      },
      {
        tipo: 'testemunho',
        texto: 'Pela primeira vez disse "não" sem sentir culpa.',
        subtitulo: '- Participante ECOA',
        caption: '"Pela primeira vez disse não sem sentir culpa."\n\nIsto é o poder de recuperar a tua voz.\n\nO ECOA. 8 semanas. Um passo de cada vez.\n\n#seteecos #ecoa #assertividade #voz #transformacao',
      },
    ],
    mensagensWA: [
      `🔊 *ECOA — Expressão & Voz*\n\nEngoles o que queres dizer? Dizes sim quando queres dizer não?\n\nO ECOA ajuda-te a:\n\n🗺 Mapear os teus silenciamentos\n🎙 Programa Micro-Voz de 8 semanas\n✉️ Cartas não enviadas (5 categorias)\n💬 Templates de comunicação assertiva\n📖 Diário de voz recuperada\n\nEnvia-me mensagem para saber mais 🔊\n\n👉 `,
      `🤍 *Ser assertiva não é ser agressiva. É ser honesta.*\n\nO ECOA ensina-te 4 padrões de comunicação assertiva:\n• Sentimento • Sanduíche • Disco riscado • Pedido claro\n\nRecupera a tua voz. Uma palavra de cada vez.\n\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Descobres que calares-te não é ser educada',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\nTexto: "Quantas vezes engoliste o que querias dizer?"\n\n*CENA 2 (5-15s)* — DOR\nTexto: "O silêncio que te protegeu em criança está a sufocar-te agora."\n\n*CENA 3 (15-25s)* — SOLUÇÃO\nTexto: "ECOA: 8 semanas para recuperar a tua voz. Mapa de silêncio. Comunicação assertiva."\n\n*CENA 4 (25-30s)* — CTA\nTexto: "Link na bio. Faz-te ouvir. 🔊"`,
      caption: 'Quantas vezes engoliste o que querias dizer? 🔊\n\n#seteecos #ecoa #voz #assertividade #comunicacao #tiktok #fyp',
    },
  },

  imago: {
    nome: 'IMAGO',
    subtitulo: 'Identidade Essencial',
    emoji: '⭐',
    moeda: 'Estrelas',
    cor: '#8B7BA5',
    link: '/imago',
    linkPagamento: '/imago/pagamento',
    preco: '699 MT/mês',
    hooks: [
      'Sabes quem és quando ninguém está a ver?',
      'A máscara que usas para o mundo está a sufocar quem realmente és.',
      'Tens 30 anos e ainda vives segundo as expectativas dos teus pais.',
      'Se te pedissem para te descreveres em 3 palavras, conseguias?',
      'A roupa que vestes conta mais sobre ti do que pensas.',
    ],
    conteudoIG: [
      {
        tipo: 'dica',
        texto: 'Sabes quem és quando ninguém está a ver?',
        caption: 'Sabes quem és quando ninguém está a ver? ⭐\n\nO IMAGO é uma viagem à tua essência. Espelho triplo. Arqueologia pessoal. 50 valores. Mapa de identidade.\n\nDescobre quem és para além dos papéis que representas.\n\n#seteecos #imago #identidade #autoconhecimento #essencia #bemestar',
      },
      {
        tipo: 'carrossel',
        titulo: 'O Espelho Triplo: Essência, Máscara, Aspiração',
        slides: [
          { titulo: 'Quem és? Quem mostras? Quem queres ser?', texto: 'O Espelho Triplo do IMAGO.' },
          { titulo: 'Essência', texto: 'Quem és quando ninguém vê. Os teus valores reais. O que te move sem aplausos.' },
          { titulo: 'Máscara', texto: 'Quem mostras ao mundo. O papel que representas. A armadura que construíste.' },
          { titulo: 'Aspiração', texto: 'Quem queres ser. A versão que imaginas. O futuro que te chama.' },
          { titulo: 'Quando os 3 estão alinhados, encontras paz.', texto: 'IMAGO — Identidade Essencial\napp.seteecos.com/imago' },
        ],
        caption: 'Quem és? Quem mostras? Quem queres ser? ⭐\n\nQuando os 3 estão alinhados, encontras paz.\n\nDesliza para entender o Espelho Triplo.\n\n#seteecos #imago #identidade #espelho #autoconhecimento #bemestar',
      },
      {
        tipo: 'testemunho',
        texto: 'Descobri que estava a viver a vida que os meus pais queriam, não a minha.',
        subtitulo: '- Participante IMAGO',
        caption: '"Estava a viver a vida que os meus pais queriam, não a minha."\n\nO IMAGO ajuda-te a separar quem TU és de quem te disseram para ser.\n\n#seteecos #imago #identidade #autoconhecimento #transformacao',
      },
    ],
    mensagensWA: [
      `⭐ *IMAGO — Identidade Essencial*\n\nSabes quem és? Ou sabes quem te disseram para ser?\n\nO IMAGO é uma viagem à tua essência:\n\n🪞 Espelho Triplo (essência, máscara, aspiração)\n🏛 Arqueologia pessoal (5 camadas: infância → presente)\n🎯 Selecção de 50 valores fundamentais\n🗺 Mapa de identidade em 7 dimensões\n🧘 5 meditações de essência guiadas\n\nEnvia-me mensagem para saber mais ⭐\n\n👉 `,
      `🤍 *A roupa que vestes conta mais sobre ti do que pensas.*\n\nNo IMAGO, exploramos a roupa como identidade — não como moda, mas como espelho.\n\nQuem és quando escolhes o que vestir? O que escondes? O que mostras?\n\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Percebes que não sabes quem és',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\nTexto: "Se te pedissem para te descreveres em 3 palavras, conseguias?"\n\n*CENA 2 (5-15s)* — DOR\nTexto: "Vives segundo as expectativas de todos. Menos as tuas."\n\n*CENA 3 (15-25s)* — SOLUÇÃO\nTexto: "IMAGO: Espelho triplo. 50 valores. Mapa de identidade em 7 dimensões."\n\n*CENA 4 (25-30s)* — CTA\nTexto: "Link na bio. Descobre quem és. ⭐"`,
      caption: 'Sabes quem és quando ninguém está a ver? ⭐\n\n#seteecos #imago #identidade #autoconhecimento #essencia #tiktok #fyp',
    },
  },

  lumina: {
    nome: 'LUMINA',
    subtitulo: 'Diagnóstico Gratuito',
    emoji: '🔮',
    moeda: null,
    cor: '#5C6BC0',
    link: '/lumina',
    linkPagamento: null,
    preco: 'Gratuito',
    hooks: [
      '7 perguntas. 23 padrões. O diagnóstico que ninguém te fez.',
      'Em 2 minutos sabes mais sobre ti do que em 2 anos de terapia.',
      'O teu corpo está a falar. Tu não estás a ouvir.',
      'A última vez que alguém te perguntou como te sentes foi quando?',
      'Não é horóscopo. É ciência emocional em 2 minutos.',
    ],
    conteudoIG: [
      {
        tipo: 'cta',
        texto: '7 perguntas. 23 padrões. 2 minutos. Gratuito.',
        caption: '7 perguntas. 23 padrões possíveis. 2 minutos. Gratuito. 🔮\n\nO LUMINA é o diagnóstico que ninguém te fez. Não mede peso. Mede como TE SENTES.\n\nEnergia. Tensão. Imagem. Clareza. Conexão.\n\nExperimenta: link na bio.\n\n#seteecos #lumina #diagnostico #autoconhecimento #saudeemocional #gratuito #bemestar',
      },
    ],
    mensagensWA: [
      `🔮 *LUMINA — O diagnóstico que ninguém te fez.*\n\n7 perguntas sobre:\n• Energia\n• Tensão no corpo\n• Imagem no espelho\n• Passado e futuro\n• Clareza mental\n• Conexão\n\n23 leituras possíveis. Resultado personalizado.\n\n100% gratuito. 2 minutos. Sem registo.\n\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Fazes um diagnóstico e ficas em choque',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\nTexto: "Fiz um diagnóstico emocional gratuito e..."\n\n*CENA 2 (5-15s)* — REACÇÃO\n[Cara de surpresa ao ver resultado]\nTexto: "7 perguntas. 23 padrões possíveis. E acertou em TUDO."\n\n*CENA 3 (15-25s)* — CTA\nTexto: "LUMINA. Gratuito. 2 minutos. Link na bio."\n\n*CENA 4 (25-30s)*\nTexto: "Experimenta e diz-me nos comentários o que deu 🔮"`,
      caption: 'Fiz um diagnóstico emocional gratuito e... 🔮\n\n#seteecos #lumina #diagnostico #autoconhecimento #gratuit #tiktok #fyp',
    },
  },

  vitalis: {
    nome: 'VITALIS',
    subtitulo: 'Inteligência Nutricional & Desportiva',
    emoji: '🌿',
    moeda: null,
    cor: '#7C8B6F',
    link: '/vitalis',
    linkPagamento: '/vitalis/pagamento',
    preco: '2.500 MT/mês',
    hooks: HOOKS_PROVOCADORES,
    conteudoIG: [
      {
        tipo: 'carrossel',
        titulo: '5 Mitos sobre Alimentação',
        slides: [
          { titulo: '5 Mitos que Destroem a tua Saúde', texto: 'Quantos destes já acreditaste?' },
          { titulo: 'Mito 1: Hidratos engordam', texto: 'Falso. O que importa é a porção e o acompanhamento. Hidratos são energia essencial.' },
          { titulo: 'Mito 2: Preciso de suplementos caros', texto: 'Feijão, ovo, amendoim, lentilhas. Proteína acessível em qualquer mercado.' },
          { titulo: 'Mito 3: Comer menos = emagrecer', texto: 'Quando comes de menos, o metabolismo abranda. Comer MELHOR é o segredo.' },
          { titulo: 'Mito 4: Salada todos os dias', texto: 'Comida saudável tem sabor. Caril de coco, piri-piri. Porção certa = saúde.' },
          { titulo: 'Para de acreditar em mitos.', texto: 'VITALIS - Coaching Nutricional\napp.seteecos.com' },
        ],
        caption: '5 mitos que provavelmente já acreditaste (eu também!) 🌿\n\nDesliza e descobre a verdade.\n\nSalva este post. Partilha com alguém que precisa.\n\n#seteecos #vitalis #nutricaointeligente #mitos #comidadereal #saudereal',
      },
      {
        tipo: 'carrossel',
        titulo: '4 Sinais de Fome Emocional',
        slides: [
          { titulo: 'Tens fome ou tens medo?', texto: '4 sinais de que comes por emoção, não por necessidade.' },
          { titulo: 'Sinal 1: Comes sem fome', texto: 'Quando a boca quer mas o estômago não pede. É emoção disfarçada.' },
          { titulo: 'Sinal 2: Comes escondida', texto: 'Se precisas de esconder o que comes, o problema não é a comida.' },
          { titulo: 'Sinal 3: Culpa depois de comer', texto: 'Comer não é crime. Se sentes culpa, alguém te ensinou a ter medo.' },
          { titulo: 'Sinal 4: Comer acalma a ansiedade', texto: 'A comida virou anestesia. O corpo encontrou uma forma de lidar com a dor.' },
          { titulo: 'Há uma saída. E não é mais uma dieta.', texto: 'VITALIS - Espaço de Retorno Emocional\napp.seteecos.com' },
        ],
        caption: 'Tens fome... ou algo dentro de ti precisa de atenção? 🤍\n\nDesliza e descobre os 4 sinais de fome emocional.\n\nPartilha com alguém que precisa de ouvir isto.\n\n#seteecos #vitalis #fomeemocional #saudeemocional #comerconsciente #bemestar',
      },
      {
        tipo: 'carrossel',
        titulo: 'Guia de Porções com as Mãos',
        slides: [
          { titulo: 'Esquece a balança. Usa as mãos.', texto: 'O guia mais simples para porções correctas.' },
          { titulo: 'Palma aberta = Proteína', texto: 'Frango, peixe, carne, ovo. Uma palma por refeição.' },
          { titulo: 'Punho fechado = Hidratos', texto: 'Arroz, massa, batata, pão. Um punho por refeição. É suficiente.' },
          { titulo: 'Polegar = Gorduras', texto: 'Óleo, amendoim, abacate. Um polegar. Pouco mas essencial.' },
          { titulo: 'Duas mãos = Legumes', texto: 'Quanto mais legumes, melhor. Sem limite. Enche o prato.' },
          { titulo: 'Sem balança. Sem apps. Só as tuas mãos.', texto: 'VITALIS - Coaching Nutricional\napp.seteecos.com' },
        ],
        caption: 'A forma mais simples de medir porções que já vi 🤲\n\nNão precisa de balança. Não precisa de app de calorias. Só as tuas mãos.\n\nSalva e usa na tua próxima refeição.\n\n#seteecos #vitalis #porcoes #nutricao #comidadereal #dicasdesaude',
      },
      {
        tipo: 'dica',
        texto: 'A comida que a tua avó fazia é mais saudável que qualquer suplemento importado.',
        caption: 'A comida que a tua avó fazia é mais saudável que qualquer suplemento importado. 🌿\n\nFerro, vitaminas, proteína vegetal. Tudo na comida real que já conheces.\n\nNão precisas de comprar nada caro. Precisas de voltar ao que é teu.\n\nO VITALIS ensina-te a usar o que já tens.\n\n#seteecos #vitalis #comidadeverdade #nutricao #comidadereal #bemestar',
      },
      {
        tipo: 'dica',
        texto: 'Dormes 5 horas e depois perguntas porque não emagreces?',
        caption: 'Dormes 5 horas e depois perguntas porque não emagreces? 😴\n\nO sono regula as hormonas da fome. Se dormes mal, o corpo pede açúcar para compensar.\n\nNão é falta de disciplina. É falta de descanso.\n\nO VITALIS rastreia sono, stress e alimentação juntos.\n\n#seteecos #vitalis #sono #nutricao #saudereal #metabolismo #bemestar',
      },
      {
        tipo: 'testemunho',
        texto: 'Perdi 8kg mas o melhor foi parar de chorar depois de comer.',
        subtitulo: '- Cliente VITALIS',
        caption: '"Perdi 8kg mas o melhor foi parar de chorar depois de comer." 🤍\n\nIsto é o que acontece quando paras de fazer dieta e começas a OUVIR o teu corpo.\n\nO VITALIS não é uma dieta. É uma mudança de relação.\n\n#seteecos #vitalis #transformacao #resultadosreais #semfiltro #bemestar',
      },
      {
        tipo: 'carrossel',
        titulo: 'O Ciclo Vicioso da Dieta',
        slides: [
          { titulo: '80% dos problemas com comida são emocionais.', texto: 'Conhece o ciclo que te prende.' },
          { titulo: 'STRESS → Comes demais', texto: 'O corpo procura conforto rápido. Açúcar. Hidratos. Comida processada.' },
          { titulo: 'CULPA → Restringes', texto: '"Amanhã não como nada." A punição começa.' },
          { titulo: 'RESTRIÇÃO → Compulsão', texto: 'O corpo não aguenta. Comes tudo. A culpa volta. Repete.' },
          { titulo: 'A saída não é mais disciplina. É compreensão.', texto: 'VITALIS - Coaching Nutricional\napp.seteecos.com' },
        ],
        caption: 'Já estiveste presa neste ciclo? Eu também. 🔄\n\nStress → Comida → Culpa → Restrição → Compulsão → Mais culpa.\n\nA saída não é mais força de vontade. É entender PORQUE acontece.\n\nDesliza.\n\n#seteecos #vitalis #ciclovicioso #saudeemocional #semdieta #bemestar',
      },
    ],
    mensagensWA: [
      `🌿 *VITALIS — Inteligência Nutricional*\n\nNão é mais uma dieta. É o fim das dietas.\n\n🍽 Plano alimentar feito para TI (comida real, acessível)\n📱 Coach disponível 24h\n💚 Espaço emocional para dias difíceis\n📊 Dashboard com o teu progresso\n🎯 Desafios semanais\n📖 Receitas com ingredientes locais\n\nEnvia-me mensagem para saber como começar 🌿\n\n👉 `,
      `🤍 *A comida não é o problema. É a anestesia.*\n\nQuando comes sem fome, não é gula. É dor.\n\nO VITALIS tem um Espaço de Retorno para esses momentos. Sem julgamento. Sem culpa.\n\nExperimenta o diagnóstico gratuito LUMINA primeiro:\n👉 `,
    ],
    scriptTikTok: {
      titulo: 'POV: Descobres que o problema nunca foi a comida',
      duracao: '15-30s',
      roteiro: `*CENA 1 (0-5s)* — HOOK\nTexto: "O problema não é o que comes. É o que te come por dentro."\n\n*CENA 2 (5-15s)* — DOR\nTexto: "80% dos problemas com comida são emocionais. Dietas não resolvem emoções."\n\n*CENA 3 (15-25s)* — SOLUÇÃO\nTexto: "VITALIS: coaching nutricional que cuida da comida E da emoção."\n\n*CENA 4 (25-30s)* — CTA\nTexto: "Link na bio. O fim das dietas. 🌿"`,
      caption: 'O problema não é o que comes. É o que te come por dentro. 🌿\n\n#seteecos #vitalis #nutricao #fomeemocional #semdieta #tiktok #fyp',
    },
  },
};

export function getConteudoMultiEco() {
  return ECO_CONTEUDO;
}

export function getConteudoEco(eco) {
  return ECO_CONTEUDO[eco] || null;
}

export function getHooksEco(eco) {
  return ECO_CONTEUDO[eco]?.hooks || [];
}

export function getTodosHooksMultiEco() {
  const todos = [];
  for (const [eco, dados] of Object.entries(ECO_CONTEUDO)) {
    for (const hook of (dados.hooks || [])) {
      todos.push({ eco, hook, cor: dados.cor, emoji: dados.emoji, nome: dados.nome });
    }
  }
  return todos;
}

// ============================================================
// CALENDÁRIO MULTI-ECO — Rotação semanal entre todos os Ecos
// ============================================================

const ROTACAO_SEMANAL = {
  0: { eco: 'serena', tema: 'Reflexão emocional', formato: 'carrossel', razao: 'Domingo = introspecção' },
  1: { eco: 'ignis', tema: 'Foco e acção', formato: 'dica', razao: 'Segunda = motivação para a semana' },
  2: { eco: 'vitalis', tema: 'Corpo e nutrição', formato: 'carrossel', razao: 'Terça = prático e útil' },
  3: { eco: 'ecoa', tema: 'Voz e expressão', formato: 'dica', razao: 'Quarta = meio da semana, coragem' },
  4: { eco: 'ventis', tema: 'Energia e ritmo', formato: 'carrossel', razao: 'Quinta = pausa consciente' },
  5: { eco: 'aurea', tema: 'Autovalor e presença', formato: 'testemunho', razao: 'Sexta = celebração pessoal' },
  6: { eco: 'imago', tema: 'Identidade e essência', formato: 'dica', razao: 'Sábado = autoconhecimento profundo' },
};

export function getCalendarioMultiEco(semanas = 4) {
  const baseUrl = BASE_URL;
  const calendario = [];

  for (let semana = 1; semana <= semanas; semana++) {
    const dias = [];
    for (let diaSemana = 0; diaSemana <= 6; diaSemana++) {
      const rotacao = ROTACAO_SEMANAL[diaSemana];
      const ecoData = ECO_CONTEUDO[rotacao.eco];
      if (!ecoData) continue;

      const hookIndex = (semana - 1 + diaSemana) % (ecoData.hooks?.length || 1);
      const hook = ecoData.hooks?.[hookIndex] || '';
      const linkEco = `${baseUrl}${ecoData.link}`;
      const linkLumina = `${baseUrl}/lumina`;

      dias.push({
        diaSemana,
        eco: rotacao.eco,
        ecoNome: ecoData.nome,
        ecoEmoji: ecoData.emoji,
        ecoCor: ecoData.cor,
        tema: rotacao.tema,
        formato: rotacao.formato,
        hook,
        linkEco,
        linkLumina,
        // A cada 3 dias, intercalar com um post LUMINA (gratuito como anzol)
        intercalarLumina: diaSemana % 3 === 0,
        conteudoIG: ecoData.conteudoIG?.[hookIndex % (ecoData.conteudoIG?.length || 1)] || null,
      });
    }
    calendario.push({ semana, dias });
  }

  return calendario;
}

export function getRotacaoSemanal() {
  return ROTACAO_SEMANAL;
}

// ============================================================
// FORMATOS POR CANAL — IG, FB, WA, TikTok
// ============================================================

// ============================================================
// GERADOR DE CONTEUDO DIÁRIO — 4 plataformas × 2 ecos
// Vitalis SEMPRE + eco do dia em rotação
// ============================================================

const HASHTAGS_IG_BASE = ['#seteecos', '#vitalis', '#transformacao', '#bemestar'];
const HASHTAGS_TIKTOK_BASE = ['#seteecos', '#fyp', '#tiktok'];

function formatarParaFacebook(hook, corpo, cta, ecoNome) {
  // Facebook: mais curto, sem hashtags pesados, tom conversacional
  return `${hook}\n\n${corpo}\n\n${cta}\n\n— Vivianne | ${ecoNome}`;
}

function formatarParaTikTok(hook, corpo, cta, eco, hashtagsExtra) {
  const hashtags = [...HASHTAGS_TIKTOK_BASE, ...(hashtagsExtra || [])].slice(0, 6).join(' ');
  return {
    ideia: `HOOK (0-3s): "${hook}"\n\nDESENVOLVIMENTO: ${corpo}\n\nCTA: ${cta}`,
    caption: `${hook} ${ECO_CONTEUDO[eco]?.emoji || '🌿'}\n\n${hashtags}`,
  };
}

function formatarParaInstagram(hook, corpo, cta, hashtagsTematicos) {
  const hashtags = [...HASHTAGS_IG_BASE, ...(hashtagsTematicos || [])].slice(0, 12).join(' ');
  return {
    caption: `${hook}\n\n${corpo}\n\n${cta}\n\nLink na bio.\n.\n.\n.\n${hashtags}`,
    hashtags,
  };
}

function formatarParaWhatsApp(hook, corpo, cta, linkEco) {
  return `${hook}\n\n${corpo}\n\n${cta}\n\n👉 ${linkEco}`;
}

function gerarConteudoEcoDia(eco, seed) {
  const ecoData = ECO_CONTEUDO[eco];
  if (!ecoData) return null;

  const hooks = ecoData.hooks || [];
  const conteudoIG = ecoData.conteudoIG || [];
  const mensagensWA = ecoData.mensagensWA || [];
  const script = ecoData.scriptTikTok;

  const hookIndex = seed % (hooks.length || 1);
  const igIndex = seed % (conteudoIG.length || 1);
  const waIndex = seed % (mensagensWA.length || 1);

  const hook = hooks[hookIndex] || '';
  const igContent = conteudoIG[igIndex] || null;
  const waMsg = mensagensWA[waIndex] || '';

  // Build corpo from TODO_CONTEUDO for vitalis, or from IG content for others
  let corpo = '';
  let cta = '';
  if (eco === 'vitalis') {
    const conteudo = getConteudoByTema(['corpo', 'emocional', 'provocacao'][seed % 3], seed);
    corpo = conteudo.corpo;
    cta = conteudo.cta;
  } else {
    corpo = igContent?.texto || hook;
    cta = `Descobre mais sobre o ${ecoData.nome}. Link na bio.`;
  }

  const linkEco = `${BASE_URL}${ecoData.link}`;
  const hashExtra = HASHTAGS_TEMATICOS[eco === 'vitalis' ? ['corpo', 'emocional', 'provocacao'][seed % 3] : eco] || [];

  return {
    eco,
    nome: ecoData.nome,
    emoji: ecoData.emoji,
    cor: ecoData.cor,
    link: linkEco,
    hook,
    corpo,
    cta,
    // Conteúdo IG (carrossel ou dica)
    conteudoIG: igContent,
    // 4 plataformas formatadas
    instagram: formatarParaInstagram(hook, corpo, cta, hashExtra),
    facebook: formatarParaFacebook(hook, corpo, cta, ecoData.nome),
    tiktok: script ? {
      ideia: script.roteiro,
      caption: script.caption,
    } : formatarParaTikTok(hook, corpo, cta, eco, hashExtra),
    whatsapp: waMsg || formatarParaWhatsApp(hook, corpo, cta, linkEco),
  };
}

export function gerarConteudoDiario(date = new Date(), variante = 0) {
  const dayOfWeek = date.getDay();
  const dayOfYear = getDayOfYear(date);
  const seed = dayOfYear + variante;

  // Vitalis SEMPRE
  const vitalis = gerarConteudoEcoDia('vitalis', seed);

  // Eco do dia em rotação (exclui vitalis da rotação)
  const ecosRotacao = ['aurea', 'serena', 'ignis', 'ventis', 'ecoa', 'imago', 'lumina'];
  const ecoHoje = ecosRotacao[dayOfWeek % ecosRotacao.length];
  const ecoDoDia = gerarConteudoEcoDia(ecoHoje, seed);

  const diaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayOfWeek];

  return {
    data: date.toISOString().split('T')[0],
    diaSemana,
    vitalis,
    ecoDoDia,
  };
}

export function gerarSemanaCompleta(startDate = new Date(), variante = 0) {
  const semana = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    semana.push(gerarConteudoDiario(d, variante));
  }
  return semana;
}

export function getFormatosCanal() {
  return {
    instagram: {
      formatos: ['post (1:1)', 'stories (9:16)', 'reels (9:16)', 'carrossel (1:1, até 10 slides)'],
      melhorHora: '8h-9h, 12h-13h, 18h-20h',
      hashtags: 15,
      maxCaption: 2200,
      dica: 'Reels têm o maior alcance orgânico. Carrosséis o maior engagement.',
    },
    facebook: {
      formatos: ['post com imagem', 'vídeo', 'reels', 'link com preview'],
      melhorHora: '9h-11h, 14h-16h',
      hashtags: 3,
      maxCaption: 63206,
      dica: 'Facebook prefere vídeos nativos. Evita links no texto (reduz alcance).',
    },
    whatsapp: {
      formatos: ['mensagem directa', 'broadcast', 'status (24h)', 'catálogo'],
      melhorHora: '8h-9h, 12h-13h, 19h-20h',
      maxMensagem: 1024,
      dica: 'Mensagens pessoais têm 5x mais abertura que broadcasts. Status = visibilidade gratuita.',
    },
    tiktok: {
      formatos: ['vídeo curto (15-60s)', 'vídeo médio (1-3min)', 'carousel (fotos)'],
      melhorHora: '7h-9h, 12h-15h, 19h-23h',
      hashtags: 5,
      maxCaption: 2200,
      dica: 'Primeiros 3 segundos são tudo. Hook forte. Texto em ecrã. Trending audio.',
    },
  };
}

// ============================================================
// CAMPANHA DE LANÇAMENTO — Estratégia para ZERO seguidores
// REELS ONLY (único formato que chega a não-seguidores)
// NUNCA misturar ecos — 1 eco por post, cor e mockup próprias
// Fase 1: Marca visual + Destaques IG
// Fase 2: Lumina grátis + Vitalis com mockups
// Fase 3: Cada eco individual (cor + mockup + identidade)
// ============================================================

const DESTAQUES_INSTAGRAM = [
  { eco: 'lumina', nome: 'LUMINA', emoji: '🔮', cor: '#5C6BC0', descricao: 'Diagnóstico gratuito — 7 perguntas, 23 leituras' },
  { eco: 'vitalis', nome: 'VITALIS', emoji: '🌿', cor: '#7C8B6F', descricao: 'Nutrição e corpo — plano, receitas, coach 24h' },
  { eco: 'aurea', nome: 'ÁUREA', emoji: '✨', cor: '#C9A227', descricao: 'Valor próprio — 100+ micro-práticas' },
  { eco: 'serena', nome: 'SERENA', emoji: '💧', cor: '#6B8E9B', descricao: 'Emoções — 16 emoções, respiração, diário' },
  { eco: 'ignis', nome: 'IGNIS', emoji: '🔥', cor: '#C1634A', descricao: 'Foco e disciplina — desafios, detector' },
  { eco: 'ventis', nome: 'VENTIS', emoji: '🍃', cor: '#5D9B84', descricao: 'Energia e ritmo — pausas, burnout' },
  { eco: 'ecoa', nome: 'ECOA', emoji: '🔊', cor: '#4A90A4', descricao: 'Voz e expressão — programa Micro-Voz' },
  { eco: 'imago', nome: 'IMAGO', emoji: '⭐', cor: '#8B7BA5', descricao: 'Identidade — espelho triplo, 50 valores' },
  { eco: 'aurora', nome: 'AURORA', emoji: '🌅', cor: '#D4A5A5', descricao: 'Integração final — desbloqueia com 7/7' },
];

export function getDestaquesInstagram() {
  return DESTAQUES_INSTAGRAM;
}

const LANCAMENTO_POSTS = [
  // =================================================================
  // FASE 1: MARCA & IDENTIDADE (Posts 1-4)
  // Narrativa: quem é a Sete Ecos e porque nasceu
  // =================================================================

  {
    dia: 1,
    fase: 1,
    faseTitulo: 'Marca & Identidade',
    titulo: 'Nasceu de excesso. Não de falta.',
    eco: 'seteEcos',
    template: 'dica',
    formato: 'reel',
    hook: 'Isto nasceu de excesso. Não de falta.',
    corpo: 'Não nasceu porque eu precisava de emagrecer. Não nasceu porque eu estava perdida.\n\nNasceu porque eu vivia muitas camadas ao mesmo tempo — intelectual, espiritual, profissional, criativa, corporal — e tudo estava separado.\n\nEu tinha profundidade. Tinha disciplina. Tinha visão. Mas não tinha integração.\n\nRecusei-me a continuar a trabalhar a vida por pedaços. E criei isto.',
    cta: 'Segue. Nos próximos dias vais perceber o que é.',
    instagram: { caption: 'Isto nasceu de excesso. Não de falta.\n\nNão nasceu porque eu precisava de emagrecer.\nNão nasceu porque eu estava perdida.\n\nNasceu porque eu vivia muitas camadas ao mesmo tempo — e tudo estava separado.\n\nRecusei-me a continuar a trabalhar a vida por pedaços.\n\n— Vivianne\n\n#seteecos #integração #autoconhecimento #maputo #moçambique #reels' },
    facebook: 'Isto nasceu de excesso. Não de falta.\n\nEu vivia muitas camadas ao mesmo tempo — intelectual, espiritual, profissional, criativa, corporal — e tudo estava separado.\n\nRecusei-me a continuar a trabalhar a vida por pedaços.\n\n— Vivianne | Sete Ecos',
    whatsapp: 'Criei algo a partir de uma necessidade real.\n\nEu vivia muitas camadas ao mesmo tempo — e nenhuma falava com a outra. A Sete Ecos nasceu como resposta.\n\nSegue @seteecos no Instagram para perceberes o que é.',
    tiktok: { ideia: 'REEL — TEXTO EM ECRÃ (palavra a palavra, fundo escuro roxo, música calma trending):\n\n"Isto nasceu de excesso."\n"Não de falta."\n[pausa 2s]\n"Vivia muitas camadas."\n"Todas separadas."\n[pausa]\n"Recusei-me a continuar."\n"E criei isto."\n"— Vivianne"', caption: 'Nasceu de excesso. Não de falta. #seteecos #integração #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Isto nasceu de excesso. Não de falta.', subtitulo: 'Recusei-me a trabalhar a vida por pedaços.', caption: '' },
    dica: 'REEL obrigatório. Texto palavra a palavra, fundo escuro roxo (#6B5B95), música calma trending. Sem cara — só texto. É a declaração de identidade da marca.',
  },

  {
    dia: 2,
    fase: 1,
    faseTitulo: 'Marca & Identidade',
    titulo: '7 dimensões que finalmente conversam.',
    eco: 'seteEcos',
    template: 'dica',
    formato: 'reel',
    hook: 'Resolver só o corpo não muda identidade. Resolver só emoção não muda disciplina.',
    corpo: 'Enquanto tratares partes isoladas, vais continuar a viver em ciclos.\n\nCorpo (Vitalis). Valor (Áurea). Emoção (Serena). Vontade (Ignis). Energia (Ventis). Voz (Ecoa). Identidade (Imago).\n\n7 dimensões. 1 sistema. As partes conversam entre si.\n\nChama-se Sete Ecos.',
    cta: 'Nos próximos dias vais conhecer cada uma.',
    instagram: { caption: 'Resolver só o corpo não muda identidade.\nResolver só emoção não muda disciplina.\n\nEnquanto tratares partes isoladas, vais continuar a viver em ciclos.\n\n7 dimensões. 1 sistema.\nAs partes conversam entre si.\n\nChama-se Sete Ecos.\n\n— Vivianne\n\n#seteecos #integração #bemestar #autoconhecimento #maputo #moçambique #reels' },
    facebook: 'Resolver só o corpo não muda identidade. Resolver só emoção não muda disciplina.\n\n7 dimensões. 1 sistema. As partes conversam.\n\nChama-se Sete Ecos.\n\n— Vivianne | Sete Ecos',
    whatsapp: 'Resolver só o corpo não muda identidade. Resolver só emoção não muda disciplina.\n\nCriei um sistema de 7 dimensões onde tudo conversa: corpo, valor, emoção, vontade, energia, voz, identidade.\n\nChama-se Sete Ecos.',
    tiktok: { ideia: 'REEL — Cada dimensão aparece com a SUA cor de fundo:\n\n"Resolver só o corpo não muda identidade."\n[pausa]\n"7 dimensões."\n[transição de cores: verde → dourado → azul → terracota → teal → azul oceano → roxo]\n"1 sistema."\n"As partes conversam."\n"Sete Ecos."', caption: '7 dimensões. 1 sistema. #seteecos #integração #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Resolver só o corpo não muda identidade.', subtitulo: '7 dimensões. 1 sistema. Sete Ecos.', caption: '' },
    dica: 'REEL com transição de cores — cada eco aparece com o SEU fundo. O texto central é a tese da marca. Efeito visual forte.',
  },

  {
    dia: 3,
    fase: 1,
    faseTitulo: 'Marca & Identidade',
    titulo: 'O ponto de partida.',
    eco: 'lumina',
    template: 'cta',
    formato: 'reel',
    hook: '8 dimensões da tua vida. 7 perguntas. 2 minutos. Grátis.',
    corpo: 'O LUMINA mapeia como estás — de verdade. Não mede peso. Não conta calorias.\n\nMede corpo, energia, mente, emoção, passado, futuro, conexão, espelho.\n\n23 leituras possíveis. Cada uma com um padrão diferente. E a partir daí, sabes por onde começar.',
    cta: 'Experimenta: app.seteecos.com/lumina',
    instagram: { caption: '8 dimensões da tua vida mapeadas.\n7 perguntas. 2 minutos. Grátis.\n\nO LUMINA não mede peso. Não conta calorias.\n\nMede como estás — de verdade.\n\n23 leituras possíveis. Cada uma é o teu ponto de partida.\n\nLink na bio.\n\n#lumina #seteecos #autoconhecimento #diagnóstico #grátis #maputo #moçambique #reels' },
    facebook: '8 dimensões. 7 perguntas. 2 minutos. Grátis.\n\nO LUMINA mapeia como estás de verdade. 23 leituras possíveis.\n\nExperimenta: app.seteecos.com/lumina\n\n— Vivianne | Sete Ecos',
    whatsapp: '8 dimensões da tua vida. 7 perguntas. 2 minutos. Grátis.\n\nO LUMINA é o ponto de partida. 23 leituras possíveis.\n\n👉 app.seteecos.com/lumina',
    tiktok: { ideia: 'REEL — Screen recording do Lumina:\n\n"8 dimensões. 7 perguntas. 2 minutos. Grátis."\n[gravar ecrã a abrir LUMINA]\n[mostrar as perguntas uma a uma]\n[mostrar o resultado]\n"23 leituras possíveis. Qual é a tua?"\n"Link na bio."', caption: '23 leituras. Qual é a tua? #lumina #seteecos #fyp' },
    conteudoIG: { tipo: 'cta', texto: '8 dimensões. 7 perguntas. 2 minutos. Grátis.', subtitulo: 'LUMINA — o ponto de partida.', caption: '' },
    dica: 'REEL — Screen recording real do Lumina no telemóvel. Autêntico. Mostra que funciona de verdade. Fundo indigo (#5C6BC0).',
  },

  {
    dia: 4,
    fase: 1,
    faseTitulo: 'Marca & Destaques',
    titulo: 'Criar 9 Destaques do Instagram',
    eco: 'lumina',
    template: 'dica',
    formato: 'destaques',
    hook: '9 anéis coloridos no topo do teu perfil — um por cada Eco',
    corpo: 'Os Destaques (Highlights) são os anéis no topo do perfil Instagram. Cada um representa um Eco com a sua cor e identidade.\n\nCria uma Story para cada eco (fundo com a cor do eco + nome + emoji). Guarda como Destaque.\n\nAssim quem visita o perfil vê imediatamente o sistema completo.',
    cta: 'Cria os 9 destaques antes de continuar a publicar.',
    instagram: { caption: '' },
    facebook: '',
    whatsapp: '',
    tiktok: { ideia: '', caption: '' },
    conteudoIG: {
      tipo: 'carrossel',
      titulo: '9 Capas de Destaques',
      texto: 'Cria uma Story para cada eco e guarda como Destaque.',
      slides: [
        { titulo: '🔮 LUMINA', texto: 'Cor: Indigo (#5C6BC0)\nConteúdo: "Diagnóstico gratuito"\nStory: fundo indigo + 🔮 + LUMINA' },
        { titulo: '🌿 VITALIS', texto: 'Cor: Verde salva (#7C8B6F)\nConteúdo: "Nutrição inteligente"\nStory: fundo verde + 🌿 + VITALIS' },
        { titulo: '✨ ÁUREA', texto: 'Cor: Dourado (#C9A227)\nConteúdo: "Valor próprio"\nStory: fundo dourado + ✨ + ÁUREA' },
        { titulo: '💧 SERENA', texto: 'Cor: Azul (#6B8E9B)\nConteúdo: "Emoções"\nStory: fundo azul + 💧 + SERENA' },
        { titulo: '🔥 IGNIS', texto: 'Cor: Terracota (#C1634A)\nConteúdo: "Foco"\nStory: fundo terracota + 🔥 + IGNIS' },
        { titulo: '🍃 VENTIS', texto: 'Cor: Teal (#5D9B84)\nConteúdo: "Energia"\nStory: fundo teal + 🍃 + VENTIS' },
        { titulo: '🔊 ECOA', texto: 'Cor: Azul oceano (#4A90A4)\nConteúdo: "Voz"\nStory: fundo azul oceano + 🔊 + ECOA' },
        { titulo: '⭐ IMAGO', texto: 'Cor: Roxo (#8B7BA5)\nConteúdo: "Identidade"\nStory: fundo roxo + ⭐ + IMAGO' },
        { titulo: '🌅 AURORA', texto: 'Cor: Mauve (#D4A5A5)\nConteúdo: "Integração final"\nStory: fundo mauve + 🌅 + AURORA' },
      ],
      caption: '',
    },
    dica: 'NÃO é um post para publicar — é uma tarefa de preparação do perfil. Cria 9 Stories (uma por eco) com fundo na cor do eco + emoji + nome. Guarda cada uma como Destaque. O resultado: 9 anéis coloridos no topo do perfil. Visitantes veem o sistema todo de relance.',
  },

  // =================================================================
  // FASE 2: LUMINA + VITALIS (Posts 5-10)
  // Objectivo: Isca gratuita + produto herói com MOCKUPS REAIS
  // =================================================================

  {
    dia: 5,
    fase: 2,
    faseTitulo: 'Lumina + Vitalis',
    titulo: 'O que o LUMINA revela sobre ti.',
    eco: 'lumina',
    template: 'dica',
    formato: 'reel',
    hook: 'Energia baixa pode ser desconexão emocional. Tensão no corpo pode ser palavras engolidas.',
    corpo: 'O LUMINA não te diz o que está "errado". Mostra-te padrões que não vias.\n\nCansaço crónico? Pode ser falta de ritmo, não de sono.\nTensão no corpo? Pode ser o que não dizes.\nFalta de clareza? Pode ser identidade fragmentada.\n\nCada leitura é uma porta. Tu decides qual abrir.',
    cta: 'Grátis. 2 minutos. app.seteecos.com/lumina',
    instagram: { caption: 'Energia baixa pode ser desconexão emocional.\nTensão no corpo pode ser palavras engolidas.\n\nO LUMINA mostra padrões que não vias.\n\n23 leituras. Cada uma é uma porta.\nTu decides qual abrir.\n\nGrátis. Link na bio.\n\n#lumina #seteecos #autoconhecimento #padrões #maputo #moçambique #reels' },
    facebook: 'Energia baixa pode ser desconexão emocional. Tensão no corpo pode ser palavras engolidas.\n\nO LUMINA mostra padrões que não vias. 23 leituras possíveis.\n\nGrátis → app.seteecos.com/lumina\n\n— Vivianne | Sete Ecos',
    whatsapp: 'O LUMINA não te diz o que está "errado". Mostra-te padrões que não vias.\n\n23 leituras possíveis. Grátis.\n\n👉 app.seteecos.com/lumina',
    tiktok: { ideia: 'REEL — Revelação de padrões:\n\n"Energia baixa?"\n"Pode ser desconexão emocional."\n"Tensão no corpo?"\n"Pode ser o que não dizes."\n[pausa]\n"O LUMINA mostra o que não vias."\n"Grátis. Link na bio."', caption: 'O que o teu corpo te diz #lumina #seteecos #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Energia baixa pode ser desconexão emocional.', subtitulo: 'O LUMINA mostra padrões que não vias.', caption: '' },
    dica: 'REEL — Texto animado com revelação de padrões. Fundo indigo (#5C6BC0). Cada padrão aparece como conexão inesperada.',
  },

  {
    dia: 6,
    fase: 2,
    faseTitulo: 'Lumina + Vitalis',
    titulo: 'O corpo é a primeira dimensão. Não a única.',
    eco: 'vitalis',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/mozproud-vitalis.jpeg'],
    hook: 'A maioria das apps resolve o corpo e ignora tudo o resto. O VITALIS é diferente.',
    corpo: 'Dentro do sistema Sete Ecos, o corpo é a raiz. A primeira dimensão. O VITALIS cuida dela com profundidade:\n\nPlano nutricional personalizado. 98 receitas com ingredientes do mercado. Coach disponível 24h. Treinos adaptados. Espaço emocional integrado.\n\nMas é UMA dimensão de sete. E isso é o ponto.',
    cta: '7 dias grátis. Link na bio.',
    instagram: { caption: 'A maioria das apps resolve o corpo e ignora tudo o resto.\n\nO VITALIS é a primeira dimensão do sistema Sete Ecos. Cuida do corpo com profundidade — plano, receitas, coach, treinos, espaço emocional.\n\nMas é uma dimensão de sete. E isso é o ponto.\n\n7 dias grátis. Link na bio.\n\n— Vivianne\n\n#vitalis #seteecos #nutricao #integração #maputo #moçambique #reels' },
    facebook: 'A maioria das apps resolve o corpo e ignora tudo o resto.\n\nO VITALIS é a raiz — plano, receitas, coach 24h, espaço emocional. Mas é uma dimensão de sete.\n\n— Vivianne | VITALIS',
    whatsapp: 'O VITALIS é a raiz do sistema Sete Ecos.\n\nPlano nutricional. 98 receitas. Coach 24h. Espaço emocional.\n\nMas é uma dimensão de sete. E isso é o ponto.\n\n👉 app.seteecos.com/vitalis',
    tiktok: { ideia: 'REEL — Mockup mozproud:\n\n"A maioria das apps resolve o corpo e ignora tudo o resto."\n[mostrar mockup]\n"O VITALIS é a primeira dimensão."\n"Não a única."\n"Sete Ecos."', caption: 'Primeira dimensão 🌿 #vitalis #seteecos #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'A maioria das apps resolve o corpo e ignora tudo o resto.', subtitulo: 'O VITALIS é a primeira dimensão. Não a única.', caption: '' },
    dica: 'REEL com mockup mozproud-vitalis.jpeg. Mensagem central: o corpo é importante MAS é parte de algo maior. Fundo VERDE (#7C8B6F).',
  },

  {
    dia: 7,
    fase: 2,
    faseTitulo: 'Lumina + Vitalis',
    titulo: 'Isto é real. Não é um PDF.',
    eco: 'vitalis',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Vitalis-dashboard_mb-mockup.jpeg'],
    hook: 'Isto é o que recebes. Não é um PDF. Não é um grupo de WhatsApp. É uma app completa.',
    corpo: 'Plano personalizado. Check-in diário. 98 receitas filtradas para ti. Espaço emocional. Relatórios de evolução. Treinos adaptados.\n\nTudo construído com rigor. Nada genérico.',
    cta: 'Link na bio.',
    instagram: { caption: 'Isto é o que recebes.\n\nNão é um PDF. Não é um grupo de WhatsApp.\nÉ uma app completa:\n\nPlano personalizado. Check-in diário. 98 receitas. Espaço emocional. Relatórios. Treinos.\n\nConstruído com rigor. Nada genérico.\n\nLink na bio.\n\n— Vivianne\n\n#vitalis #seteecos #app #dashboard #maputo #moçambique #reels' },
    facebook: 'Isto é o que recebes. Não é PDF. Não é grupo de WhatsApp. É app completa.\n\nConstruído com rigor. Nada genérico.\n\n— Vivianne | VITALIS',
    whatsapp: 'Isto é o VITALIS por dentro.\n\nPlano personalizado. 98 receitas. Coach 24h. Espaço emocional. Tudo numa app.\n\n👉 app.seteecos.com/vitalis',
    tiktok: { ideia: 'REEL — Mostrar dashboard:\n\n"Isto é o que recebes."\n[mostrar mockup dashboard]\n"Não é PDF. Não é grupo."\n"É app completa. Construída com rigor."\n"Link na bio."', caption: 'Nada genérico #vitalis #seteecos #fyp #app' },
    conteudoIG: { tipo: 'dica', texto: 'Isto é o que recebes.', subtitulo: 'Construído com rigor. Nada genérico.', caption: '' },
    dica: 'REEL com mockup Vitalis-dashboard_mb-mockup.jpeg. Mostrar que é real e profissional. Fundo VERDE (#7C8B6F).',
  },

  {
    dia: 8,
    fase: 2,
    faseTitulo: 'Lumina + Vitalis',
    titulo: 'Acompanhamento real. Não chatbot genérico.',
    eco: 'vitalis',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Vitalis-coach_mb-mockup.jpeg'],
    hook: 'Quando precisas de orientação, a resposta está a uma mensagem. A qualquer hora.',
    corpo: 'A Coach no VITALIS está disponível 24 horas. Porções. Prato. Jejum. Treino. Dúvidas.\n\nNão é motivação genérica. É coaching nutricional real, sempre acessível.\n\nPorque as dúvidas não esperam pelo horário de consulta.',
    cta: 'Link na bio.',
    instagram: { caption: 'Quando precisas de orientação, a resposta está a uma mensagem.\n\nA qualquer hora. Coach disponível 24h.\n\nPorções. Prato. Jejum. Treino. Dúvidas.\n\nNão é motivação genérica. É coaching real.\n\nLink na bio.\n\n— Vivianne\n\n#vitalis #seteecos #coaching #maputo #moçambique #reels' },
    facebook: 'Quando precisas de orientação, a resposta está a uma mensagem. A qualquer hora.\n\nCoaching real. Sempre acessível.\n\n— Vivianne | VITALIS',
    whatsapp: 'Coach de nutrição disponível 24h dentro do VITALIS.\n\nPorções. Prato. Jejum. Treino. Dúvidas.\n\nSem espera.\n\n👉 app.seteecos.com/vitalis',
    tiktok: { ideia: 'REEL — Mostrar coach:\n\n"Precisas de orientação."\n"A resposta está a uma mensagem."\n[mostrar mockup coach]\n"24h. Coaching real."\n"VITALIS — link na bio."', caption: 'Coaching real 24h #vitalis #seteecos #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'A resposta está a uma mensagem. A qualquer hora.', subtitulo: 'Coach de nutrição 24h no VITALIS.', caption: '' },
    dica: 'REEL com mockup Vitalis-coach_mb-mockup.jpeg. Fundo VERDE (#7C8B6F).',
  },

  {
    dia: 9,
    fase: 2,
    faseTitulo: 'Lumina + Vitalis',
    titulo: 'Comida real. Do mercado. Para ti.',
    eco: 'vitalis',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Vitalis-receitas_mb-mockup.jpeg'],
    hook: '98 receitas. Ingredientes que encontras em qualquer mercado. Sem listas impossíveis.',
    corpo: 'Pratos tradicionais. Opções leves. Comfort food. Refeições rápidas.\n\nCada receita filtrada para o TEU perfil e as TUAS restrições. Nada importado. Nada caro.\n\nPorque cuidar do corpo não devia ser um privilégio.',
    cta: 'Link na bio.',
    instagram: { caption: '98 receitas. Ingredientes do mercado. Sem listas impossíveis.\n\nFiltradas para o teu perfil. Nada importado. Nada caro.\n\nPorque cuidar do corpo não devia ser um privilégio.\n\nLink na bio.\n\n— Vivianne\n\n#vitalis #seteecos #receitas #comidareal #maputo #moçambique #reels' },
    facebook: '98 receitas com ingredientes do mercado. Sem listas impossíveis.\n\nCuidar do corpo não devia ser um privilégio.\n\n— Vivianne | VITALIS',
    whatsapp: '98 receitas com ingredientes reais e acessíveis.\n\nFiltradas para o teu perfil. Sem listas impossíveis.\n\n👉 app.seteecos.com/vitalis',
    tiktok: { ideia: 'REEL — Receitas:\n\n"98 receitas."\n"Ingredientes do mercado."\n[mostrar mockup receitas]\n"Sem listas impossíveis."\n"VITALIS — link na bio."', caption: 'Comida real #vitalis #seteecos #receitas #fyp' },
    conteudoIG: { tipo: 'dica', texto: '98 receitas. Ingredientes do mercado.', subtitulo: 'Cuidar do corpo não devia ser um privilégio.', caption: '' },
    dica: 'REEL com mockup Vitalis-receitas_mb-mockup.jpeg. Fundo VERDE (#7C8B6F).',
  },

  {
    dia: 10,
    fase: 2,
    faseTitulo: 'Lumina + Vitalis',
    titulo: 'O corpo e a emoção não são departamentos separados.',
    eco: 'vitalis',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Vitalis-espaçoretorno_mb-mockup.jpeg'],
    hook: 'O corpo e a emoção não são departamentos separados. No VITALIS, também não.',
    corpo: 'O Espaço de Retorno existe dentro do VITALIS. É o lugar onde não se fala de comida. Fala-se do que está por trás.\n\nPorque uma app de nutrição que ignora o que sentes não é integração. É só mais um pedaço.\n\nE nós não trabalhamos por pedaços.',
    cta: 'Link na bio.',
    instagram: { caption: 'O corpo e a emoção não são departamentos separados.\n\nNo VITALIS, também não.\n\nO Espaço de Retorno: o lugar dentro da app onde não se fala de comida. Fala-se do que está por trás.\n\nPorque integração começa aqui.\n\nLink na bio.\n\n— Vivianne\n\n#vitalis #seteecos #integração #emoção #maputo #moçambique #reels' },
    facebook: 'O corpo e a emoção não são departamentos separados.\n\nNo VITALIS, também não. O Espaço de Retorno cuida do que está por trás.\n\n— Vivianne | VITALIS',
    whatsapp: 'O corpo e a emoção não são departamentos separados.\n\nO Espaço de Retorno no VITALIS: para quando o que sentes pesa mais do que o que comes.\n\n👉 app.seteecos.com/vitalis',
    tiktok: { ideia: 'REEL — Emocional:\n\n"O corpo e a emoção não são departamentos separados."\n[mostrar mockup espaço retorno]\n"Integração começa aqui."\n"VITALIS — link na bio."', caption: 'Integração começa aqui #vitalis #seteecos #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'O corpo e a emoção não são departamentos separados.', subtitulo: 'Integração começa aqui. VITALIS.', caption: '' },
    dica: 'REEL com mockup Vitalis-espaçoretorno_mb-mockup.jpeg. Diferencial ÚNICO — integração corpo + emoção. Fundo VERDE (#7C8B6F).',
  },

  // =================================================================
  // FASE 3: CADA ECO INDIVIDUAL (Posts 11-17)
  // Objectivo: 1 eco por post, cor própria, mockup própria
  // NUNCA misturar ecos no mesmo post
  // =================================================================

  {
    dia: 11,
    fase: 3,
    faseTitulo: 'Cada Eco',
    titulo: 'ÁUREA — Onde mora o teu valor?',
    eco: 'aurea',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Aurea-Dash-portrait.png', '/mockups/Aurea-praticas-portrait.png'],
    hook: 'Cuidas do corpo mas não cuidas de como te vês ao espelho. Porquê?',
    corpo: 'O ÁUREA é a dimensão do valor próprio. Como gastas dinheiro, como ocupas o tempo, como te vestes, o que te dá prazer.\n\n100+ micro-práticas em 4 áreas. Não é autoajuda. É arqueologia do que vale para ti.\n\nSem esta dimensão, qualquer transformação é superficial.',
    cta: 'Link na bio.',
    instagram: { caption: 'Cuidas do corpo mas não cuidas de como te vês ao espelho. Porquê?\n\nO ÁUREA é a dimensão do valor próprio.\n\n100+ micro-práticas. 4 áreas: dinheiro, tempo, roupa, prazer.\n\nSem esta dimensão, qualquer transformação é superficial.\n\nLink na bio.\n\n— Vivianne\n\n#áurea #seteecos #valorpróprio #integração #maputo #moçambique #reels' },
    facebook: 'Cuidas do corpo mas não cuidas de como te vês ao espelho.\n\nO ÁUREA trabalha o valor próprio. 100+ micro-práticas.\n\n— Vivianne | ÁUREA',
    whatsapp: 'O ÁUREA é a dimensão do valor próprio.\n\n100+ micro-práticas em 4 áreas: dinheiro, tempo, roupa, prazer.\n\n👉 app.seteecos.com/aurea',
    tiktok: { ideia: 'REEL — Fundo DOURADO (#C9A227):\n\n"Cuidas do corpo..."\n"...mas não cuidas de como te vês ao espelho."\n[pausa]\n"Porquê?"\n[mostrar mockup Áurea]\n"ÁUREA — link na bio."', caption: 'Onde mora o teu valor? #áurea #seteecos #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Cuidas do corpo mas não cuidas de como te vês.', subtitulo: 'ÁUREA — a dimensão do valor próprio.', caption: '' },
    dica: 'REEL — Fundo DOURADO (#C9A227) obrigatório. Mockups Aurea-Dash-portrait.png ou Aurea-praticas-portrait.png. NUNCA fundo verde.',
  },

  {
    dia: 12,
    fase: 3,
    faseTitulo: 'Cada Eco',
    titulo: 'SERENA — Sentir não é o problema. É informação.',
    eco: 'serena',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Serena-dash-portrait.png', '/mockups/Serena-praticas-portrait.png'],
    hook: 'Sentir intensamente não é o problema. O problema é não saber o que fazer com isso.',
    corpo: 'O SERENA mapeia 16 emoções no teu corpo. Quando as nomeias, perdem poder sobre ti.\n\n6 técnicas de respiração. Diário emocional. Detector de padrões. SOS para crises.\n\nNão é terapia. É consciência emocional com estrutura.',
    cta: 'Link na bio.',
    instagram: { caption: 'Sentir intensamente não é o problema.\nO problema é não saber o que fazer com isso.\n\nO SERENA mapeia 16 emoções no teu corpo. 6 técnicas de respiração. Detector de padrões.\n\nNão é terapia. É consciência com estrutura.\n\nLink na bio.\n\n— Vivianne\n\n#serena #seteecos #emoções #consciência #maputo #moçambique #reels' },
    facebook: 'Sentir intensamente não é o problema. O problema é não saber o que fazer com isso.\n\nO SERENA: 16 emoções, 6 respirações, padrões.\n\n— Vivianne | SERENA',
    whatsapp: 'Sentir intensamente não é o problema.\n\nO SERENA: 16 emoções mapeadas, 6 respirações, detector de padrões.\n\n👉 app.seteecos.com/serena',
    tiktok: { ideia: 'REEL — Fundo AZUL (#6B8E9B):\n\n"Sentir intensamente não é o problema."\n"O problema é não saber o que fazer com isso."\n[mostrar mockup Serena]\n"SERENA — link na bio."', caption: 'Sentir é informação #serena #seteecos #emoções #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Sentir intensamente não é o problema.', subtitulo: 'SERENA — consciência emocional com estrutura.', caption: '' },
    dica: 'REEL — Fundo AZUL (#6B8E9B) obrigatório. Mockups Serena. Música suave. NUNCA fundo verde.',
  },

  {
    dia: 13,
    fase: 3,
    faseTitulo: 'Cada Eco',
    titulo: 'IGNIS — A vontade sem direcção dispersa-se.',
    eco: 'ignis',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Ignis-dash-portrait.png', '/mockups/Ignis-escolhas-portrait.png'],
    hook: 'Tens vontade de mudar tudo. Mas sem direcção, a vontade dispersa-se.',
    corpo: 'O IGNIS é a dimensão da vontade e do foco. Não te obriga a ser produtivo. Ajuda-te a perceber o que realmente importa.\n\n16 desafios. Sessões de foco. Detector de distracções. Bússola de valores.\n\nPorque disciplina sem direcção é só cansaço.',
    cta: 'Link na bio.',
    instagram: { caption: 'Tens vontade de mudar tudo. Mas sem direcção, a vontade dispersa-se.\n\nO IGNIS: 16 desafios. Sessões de foco. Detector de distracções. Bússola de valores.\n\nDisciplina sem direcção é só cansaço.\n\nLink na bio.\n\n— Vivianne\n\n#ignis #seteecos #foco #vontade #maputo #moçambique #reels' },
    facebook: 'Tens vontade de mudar tudo. Mas sem direcção, a vontade dispersa-se.\n\nO IGNIS: foco com propósito. 16 desafios.\n\n— Vivianne | IGNIS',
    whatsapp: 'A vontade sem direcção dispersa-se.\n\nO IGNIS: 16 desafios, sessões de foco, bússola de valores.\n\n👉 app.seteecos.com/ignis',
    tiktok: { ideia: 'REEL — Fundo TERRACOTA (#C1634A):\n\n"Tens vontade de mudar tudo."\n"Mas sem direcção, dispersa-se."\n[mostrar mockup Ignis]\n"IGNIS — link na bio."', caption: 'Vontade sem direcção #ignis #seteecos #foco #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Tens vontade de mudar tudo.', subtitulo: 'Sem direcção, dispersa-se. IGNIS.', caption: '' },
    dica: 'REEL — Fundo TERRACOTA (#C1634A) obrigatório. Mockups Ignis. NUNCA fundo verde.',
  },

  {
    dia: 14,
    fase: 3,
    faseTitulo: 'Cada Eco',
    titulo: 'VENTIS — A energia não se gere com café.',
    eco: 'ventis',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Ventis-dash-portrait.png', '/mockups/Ventis-praticas-portrait.png'],
    hook: 'Se precisas de café para funcionar, não é energia. É dívida.',
    corpo: 'O VENTIS é a dimensão da energia e do ritmo. Monitor de energia. 8 tipos de pausas conscientes. Detector de burnout. Movimentos. Natureza.\n\nO teu corpo tem um ritmo natural. Ignorá-lo é o que te cansa.',
    cta: 'Link na bio.',
    instagram: { caption: 'Se precisas de café para funcionar, não é energia. É dívida.\n\nO VENTIS: monitor de energia. Pausas conscientes. Detector de burnout.\n\nO teu corpo tem um ritmo natural. Ignorá-lo é o que te cansa.\n\nLink na bio.\n\n— Vivianne\n\n#ventis #seteecos #energia #ritmo #maputo #moçambique #reels' },
    facebook: 'Se precisas de café para funcionar, não é energia. É dívida.\n\nO VENTIS encontra o teu ritmo natural.\n\n— Vivianne | VENTIS',
    whatsapp: 'Se precisas de café para funcionar, não é energia. É dívida.\n\nO VENTIS: monitor de energia + detector de burnout.\n\n👉 app.seteecos.com/ventis',
    tiktok: { ideia: 'REEL — Fundo TEAL (#5D9B84):\n\n"Se precisas de café para funcionar..."\n"...não é energia. É dívida."\n[mostrar mockup Ventis]\n"VENTIS — link na bio."', caption: 'Não é energia. É dívida. #ventis #seteecos #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Se precisas de café para funcionar, não é energia.', subtitulo: 'VENTIS — energia e ritmo.', caption: '' },
    dica: 'REEL — Fundo TEAL (#5D9B84) obrigatório. Mockups Ventis. NUNCA fundo verde.',
  },

  {
    dia: 15,
    fase: 3,
    faseTitulo: 'Cada Eco',
    titulo: 'ECOA — O silêncio também é uma ferida.',
    eco: 'ecoa',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Ecoa-dash-portrait.png', '/mockups/Ecoa-praticas-portrait.png'],
    hook: 'Há coisas que nunca disseste. E o corpo guarda tudo.',
    corpo: 'O ECOA é a dimensão da voz e da expressão. Mapa de silenciamento. Programa Micro-Voz de 8 semanas. Cartas não enviadas. Comunicação assertiva.\n\nPorque integração também é ter voz para o que sentes.',
    cta: 'Link na bio.',
    instagram: { caption: 'Há coisas que nunca disseste. E o corpo guarda tudo.\n\nO ECOA: mapa de silenciamento. Programa Micro-Voz. Cartas não enviadas. Comunicação assertiva.\n\nIntegração também é ter voz.\n\nLink na bio.\n\n— Vivianne\n\n#ecoa #seteecos #voz #expressão #maputo #moçambique #reels' },
    facebook: 'Há coisas que nunca disseste. E o corpo guarda tudo.\n\nO ECOA: a dimensão da voz. 8 semanas.\n\n— Vivianne | ECOA',
    whatsapp: 'Há coisas que nunca disseste. E o corpo guarda tudo.\n\nO ECOA: programa Micro-Voz de 8 semanas.\n\n👉 app.seteecos.com/ecoa',
    tiktok: { ideia: 'REEL — Fundo AZUL OCEANO (#4A90A4):\n\n"Há coisas que nunca disseste."\n"E o corpo guarda tudo."\n[mostrar mockup Ecoa]\n"ECOA — link na bio."', caption: 'O corpo guarda tudo #ecoa #seteecos #voz #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Há coisas que nunca disseste.', subtitulo: 'E o corpo guarda tudo. ECOA.', caption: '' },
    dica: 'REEL — Fundo AZUL OCEANO (#4A90A4) obrigatório. Mockups Ecoa. NUNCA fundo verde.',
  },

  {
    dia: 16,
    fase: 3,
    faseTitulo: 'Cada Eco',
    titulo: 'IMAGO — Quem és tu para além dos papéis?',
    eco: 'imago',
    template: 'dica',
    formato: 'reel',
    mockups: ['/mockups/Imago-dash-portrait.png', '/mockups/Imago-arqueologia-portrait.png'],
    hook: 'Mãe. Profissional. Filha. Amiga. E tu? Quem és tu para além dos papéis?',
    corpo: 'O IMAGO é a dimensão da identidade. Espelho triplo: essência, máscara, aspiração. Arqueologia pessoal. 50 valores. Mapa de identidade.\n\nPorque sem saber quem és, não sabes para onde ir.',
    cta: 'Link na bio.',
    instagram: { caption: 'Mãe. Profissional. Filha. Amiga.\nE tu? Quem és tu para além dos papéis?\n\nO IMAGO: espelho triplo. Arqueologia pessoal. 50 valores.\n\nSem saber quem és, não sabes para onde ir.\n\nLink na bio.\n\n— Vivianne\n\n#imago #seteecos #identidade #autoconhecimento #maputo #moçambique #reels' },
    facebook: 'Mãe. Profissional. Filha. Amiga. E tu? Quem és para além dos papéis?\n\nO IMAGO: a dimensão da identidade.\n\n— Vivianne | IMAGO',
    whatsapp: 'Quem és tu para além dos papéis que desempenhas?\n\nO IMAGO: espelho triplo, 50 valores, arqueologia pessoal.\n\n👉 app.seteecos.com/imago',
    tiktok: { ideia: 'REEL — Fundo ROXO (#8B7BA5):\n\n"Mãe. Profissional. Filha. Amiga."\n"E tu?"\n"Quem és para além dos papéis?"\n[mostrar mockup Imago]\n"IMAGO — link na bio."', caption: 'Para além dos papéis #imago #seteecos #identidade #fyp' },
    conteudoIG: { tipo: 'dica', texto: 'Quem és para além dos papéis?', subtitulo: 'IMAGO — a dimensão da identidade.', caption: '' },
    dica: 'REEL — Fundo ROXO (#8B7BA5) obrigatório. Mockups Imago. NUNCA fundo verde.',
  },

  {
    dia: 17,
    fase: 3,
    faseTitulo: 'Cada Eco',
    titulo: 'Agora sabes o que é. O passo é teu.',
    eco: 'lumina',
    template: 'cta',
    formato: 'reel',
    hook: '7 dimensões. 1 sistema. As partes conversam. E o primeiro passo é grátis.',
    corpo: 'Nos últimos dias mostrei-te o que é a Sete Ecos. Não é motivação. Não é wellness estético. É arquitectura de integração.\n\nO LUMINA é o ponto de partida. Gratuito. 2 minutos. 23 leituras possíveis.\n\nSe o que viste te fez parar e pensar, experimenta.',
    cta: 'app.seteecos.com/lumina',
    instagram: { caption: '7 dimensões. 1 sistema. As partes conversam.\n\nNos últimos dias mostrei-te o que é a Sete Ecos.\n\nNão é motivação. Não é wellness estético.\nÉ arquitectura de integração.\n\nO ponto de partida é gratuito. 2 minutos.\n\nLink na bio.\n\n— Vivianne\n\n#seteecos #lumina #integração #grátis #maputo #moçambique #reels' },
    facebook: '7 dimensões. 1 sistema. O primeiro passo é grátis.\n\nLUMINA: 2 minutos. 23 leituras → app.seteecos.com/lumina\n\n— Vivianne | Sete Ecos',
    whatsapp: '7 dimensões. 1 sistema. O ponto de partida é grátis.\n\nLUMINA: 2 minutos. 23 leituras possíveis.\n\n👉 app.seteecos.com/lumina',
    tiktok: { ideia: 'REEL — Recap cores:\n\n[fundo muda: verde → dourado → azul → terracota → teal → azul oceano → roxo]\n"7 dimensões."\n"1 sistema."\n"As partes conversam."\n[fundo branco]\n"O ponto de partida é grátis."\n"Link na bio."', caption: 'O ponto de partida #seteecos #lumina #fyp' },
    conteudoIG: { tipo: 'cta', texto: '7 dimensões. 1 sistema.', subtitulo: 'O ponto de partida é grátis. LUMINA.', caption: '' },
    dica: 'REEL — Recap de todas as cores (cada eco com a SUA cor, 1 segundo cada). Fecha o ciclo com CTA para o Lumina.',
  },
];

export function getCampanhaLancamentoZero() {
  return LANCAMENTO_POSTS;
}
