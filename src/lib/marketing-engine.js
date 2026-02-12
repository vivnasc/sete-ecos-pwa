/**
 * Marketing Engine v2 - Motor de conteúdo AUDACIOSO
 *
 * Princípios:
 * - Provocar, não informar. Cada frase deve fazer parar o scroll.
 * - Falar como humana (Vivianne), não como marca corporativa.
 * - Tocar na dor REAL: culpa, solidão, dietas falhadas, pressão social.
 * - Culturalmente ancorado em Moçambique: xima, matapa, calor, realidade local.
 * - Cada peça tem um HOOK (primeiros 3 segundos) e um CTA claro.
 */

import { buildUTMUrl, UTM_TEMPLATES } from '../utils/utm';

const BASE_URL = 'https://app.seteecos.com';

// ============================================================
// HOOKS - Frases que param o scroll (primeiros 3 segundos)
// ============================================================

const HOOKS_PROVOCADORES = [
  'As dietas que te vendem estão a destruir o teu metabolismo.',
  'Tens fome ou tens medo?',
  'O problema não é o que comes. É o que te come por dentro.',
  'Ninguém te ensinou a comer. Ensinaram-te a ter medo de comer.',
  'Se a dieta funcionasse, não precisavas de outra a cada 3 meses.',
  'O teu corpo não é o inimigo. A tua relação com ele é que está.',
  'A maioria das mulheres come por ansiedade e chama isso de "falta de força de vontade".',
  'Perder peso é fácil. Manter é que ninguém te ensina.',
  'Estou farta de ver mulheres a pedir desculpa por comer.',
  'A balança não mede o teu valor. Nem a tua saúde.',
  'A culpa que sentes depois de comer engorda mais que a refeição.',
  'Acordas cansada? Não é preguiça. É o teu corpo a gritar.',
  'Comer em segredo. Já fizeste isso? Eu também.',
  'Quantas dietas já começaste numa Segunda-feira?',
  'O teu corpo não precisa de castigo. Precisa de compreensão.',
];

// ============================================================
// CONTEUDO POR CATEGORIA - Provocador e emocional
// ============================================================

const CONTEUDO_CORPO = [
  {
    hook: 'A matapa que a tua avó fazia é mais saudável que qualquer suplemento importado.',
    corpo: 'Ferro, vitaminas, proteína vegetal. Tudo na comida que já conheces. Não precisas de comprar nada caro. Precisas de voltar ao que é teu.',
    cta: 'O VITALIS ensina-te a usar o que já tens.',
  },
  {
    hook: 'Xima não engorda. O que engorda é a falta de equilíbrio no prato.',
    corpo: 'Ouviste a vida inteira que hidratos são maus. Mentira. O teu corpo precisa deles. O segredo é o tamanho da porção e o que metes ao lado. Mão aberta = porção certa.',
    cta: 'No VITALIS, aprendes a medir com as mãos. Sem balança, sem stress.',
  },
  {
    hook: 'Beber 2 litros de água em Maputo não é conselho. É sobrevivência.',
    corpo: 'Com este calor, o teu corpo perde mais água do que imaginas. A desidratação disfarça-se de fome. Antes de comer, bebe. Depois decide.',
    cta: 'O VITALIS rastreia a tua água, sono e energia todos os dias.',
  },
  {
    hook: 'Se cozinhas para a família inteira e comes os restos em pé na cozinha, este post é para ti.',
    corpo: 'Tu também mereces sentar, comer com calma, e ter um prato pensado para TI. Não só para o marido e as crianças. A tua saúde importa tanto quanto a deles.',
    cta: 'VITALIS: um plano alimentar que é SÓ teu.',
  },
  {
    hook: 'A proteína mais barata de Moçambique? Feijão nhemba.',
    corpo: 'Esquece a whey protein de 3000 MT. Feijão nhemba, amendoim, ovo cozido. Comida real, local, acessível. A ciência confirma o que as avós já sabiam.',
    cta: 'Receitas com ingredientes que encontras no mercado do bairro.',
  },
  {
    hook: 'Jejum intermitente não é passar fome. É dar ao teu corpo tempo para se curar.',
    corpo: 'Mas também não é para toda a gente. Se tens histórico de compulsão, pode ser perigoso. Não copies o que viste no TikTok. Precisa de orientação.',
    cta: 'No VITALIS, o jejum é acompanhado e personalizado.',
  },
  {
    hook: 'Comer salada todos os dias não é saudável. É aborrecido.',
    corpo: 'Comida saudável não tem de ser sem sabor. Caril de coco com legumes. Frango grelhado com piri-piri. Banana frita como snack. O segredo é porção, não privação.',
    cta: 'Receitas que sabem bem e fazem bem. Só no VITALIS.',
  },
  {
    hook: 'Dormes 5 horas e depois perguntas porque não emagreces?',
    corpo: 'O sono regula as hormonas da fome. Se dormes mal, o corpo pede açúcar para compensar. Não é falta de disciplina. É falta de descanso.',
    cta: 'O VITALIS rastreia sono, stress e alimentação juntos.',
  },
];

const CONTEUDO_EMOCIONAL = [
  {
    hook: 'A comida não é o problema. É a anestesia.',
    corpo: 'Quando comes sem fome, não é gula. É dor. Solidão, stress, frustração. O corpo encontrou uma forma de se acalmar. Não precisa de castigo. Precisa de outra saída.',
    cta: 'O Espaço de Retorno do VITALIS foi criado para esses momentos.',
  },
  {
    hook: 'Recaíste? Bem-vinda ao clube de quem é humana.',
    corpo: 'A diferença entre quem transforma o corpo e quem desiste não é nunca falhar. É levantar-se na terça em vez de esperar pela próxima segunda.',
    cta: 'No VITALIS, não há "estragar a dieta". Há dias. E cada dia é novo.',
  },
  {
    hook: 'Se te comparas com a mulher da foto filtrada, já perdeste.',
    corpo: 'Aquela influencer tem ring light, 47 fotos para escolher uma, e provavelmente um cirurgião. O teu corpo carrega filhos, trabalho, vida real. Respeita-o.',
    cta: 'O VITALIS celebra O TEU progresso. Não o de ninguém.',
  },
  {
    hook: 'A última vez que alguém te perguntou "como te sentes?" foi quando?',
    corpo: 'Não o que queres comer. Não quanto pesas. Como TE SENTES. Porque se a resposta é "nem sei", o problema não é a comida. É desconexão.',
    cta: 'O LUMINA faz-te essa pergunta todos os dias. Em 2 minutos.',
  },
  {
    hook: 'Comes escondida? Não é vergonha. É um sinal.',
    corpo: 'Comer às escondidas é o corpo a tentar satisfazer uma necessidade emocional em segredo. Enquanto a julgares, ela vai continuar. Quando a ouvires, ela pode parar.',
    cta: 'Espaço de Retorno: o único sítio na app onde ninguém te julga.',
  },
  {
    hook: 'Não é sobre emagrecer. É sobre parar de sofrer com a comida.',
    corpo: 'Pesar menos é um efeito colateral de viver melhor. Se o único objectivo é o número na balança, vais voltar ao mesmo sítio. Se o objectivo é paz, tudo muda.',
    cta: 'O VITALIS não é uma dieta. É uma mudança de relação.',
  },
  {
    hook: 'Diz-me: há quanto tempo não fazes nada só para ti?',
    corpo: 'Cuidas dos filhos. Do trabalho. Da casa. E de ti? Quem cuida? 2 minutos por dia para ti não é egoísmo. É manutenção.',
    cta: 'Experimenta o LUMINA. 2 minutos. Só para ti.',
  },
];

const CONTEUDO_PROVOCACAO = [
  {
    hook: 'A indústria das dietas ganha dinheiro cada vez que falhas.',
    corpo: 'Pensas que falhas por falta de disciplina? Não. O modelo foi DESENHADO para falhares e voltares a comprar. Dieta restritiva → desistência → culpa → nova dieta. Repete.',
    cta: 'O VITALIS quebra o ciclo. Sem restrição. Com ciência.',
  },
  {
    hook: 'Se a tua nutricionista te deu uma folha A4 e te desejou boa sorte, não foi acompanhamento.',
    corpo: 'Acompanhamento real é alguém que te pergunta como estiveste no sábado a noite. Que te ajuda quando recaís. Que está lá todos os dias, não só na consulta.',
    cta: 'VITALIS: coach IA disponível 24h. Todos os dias.',
  },
  {
    hook: 'O teu valor não cabe numa calça tamanho S.',
    corpo: 'Foste ensinada a acreditar que só mereces respeito se fores magra. Que só és bonita se a roupa for pequena. Isso é uma mentira que te venderam. O teu corpo não é um projecto. É a tua casa.',
    cta: 'AUREA: o programa que te ensina a morar bem em ti mesma.',
  },
  {
    hook: '7 perguntas. 23 padrões. O diagnóstico que ninguém te fez.',
    corpo: 'O médico mede a tensão. A nutricionista mede o peso. Quem mede como TE SENTES? Energia, tensão no corpo, clareza mental, desejo de conexão. Isto importa.',
    cta: 'LUMINA: gratuito. 2 minutos. Resultados que te vão surpreender.',
  },
  {
    hook: 'Se não fizeres nada, daqui a 6 meses vais estar exactamente onde estás agora.',
    corpo: 'Ou pior. Porque o corpo não espera. O metabolismo não espera. O único momento que tens controlo é AGORA. Não amanhã. Não na próxima segunda.',
    cta: 'Começa grátis pelo LUMINA. Leva 2 minutos.',
  },
  {
    hook: 'Investir 2.500 MT na tua saúde é "caro". Mas o hospital é grátis, né?',
    corpo: 'Prevenir custa menos que tratar. 2.500 MT/mês é menos que o que gastas em comida processada. A diferença é que um te destrói e o outro te transforma.',
    cta: 'VITALIS: desde 2.500 MT. Garantia de 7 dias.',
  },
];

// Juntar tudo num pool único rotativo
const TODO_CONTEUDO = [...CONTEUDO_CORPO, ...CONTEUDO_EMOCIONAL, ...CONTEUDO_PROVOCACAO];

const HASHTAGS_BASE = [
  '#seteecos', '#vitalis', '#mulhermocambicana', '#transformacao',
  '#nutricaomocambique', '#saudereal', '#semdieta', '#maputo',
];

const HASHTAGS_TEMATICOS = {
  corpo: ['#nutricao', '#comidadereal', '#comidamocambicana', '#porcoes', '#receitas'],
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

export function gerarConteudoHoje(date = new Date()) {
  const dayOfWeek = date.getDay();
  const dayOfYear = getDayOfYear(date);
  const { tema, titulo, formato, tipo } = TEMAS_SEMANA[dayOfWeek];
  const conteudo = getConteudoByTema(tema, dayOfYear);

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

export function gerarMensagemWhatsApp(tipo = 'dica', campanha = '') {
  const hoje = gerarConteudoHoje();
  const camp = campanha || `whatsapp-${hoje.data}`;
  const linkVitalis = buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.whatsappBroadcast(camp));
  const linkLumina = buildUTMUrl(`${BASE_URL}/lumina`, UTM_TEMPLATES.whatsappBroadcast(camp + '-lumina'));

  const templates = {
    // Dica crua e directa
    dica: `${hoje.hook}\n\n${hoje.corpo}\n\n${hoje.cta}\n\n👉 ${linkVitalis}`,

    // Provocacao pura
    provocacao: `*${hoje.hook}*\n\nVou dizer uma coisa que talvez ninguém te disse:\n\n${hoje.corpo}\n\nSe isto te tocou, não ignores.\n\n👉 ${linkLumina}\n\nÉ gratuito. 2 minutos. Começa por ti.`,

    // Voz pessoal (como se a Viv estivesse a falar)
    pessoal: `Olá querida 🤍\n\nHoje quero partilhar algo que me incomoda:\n\n_${hoje.hook}_\n\n${hoje.corpo}\n\nSe te identificas, responde a esta mensagem. Quero saber como te sentes.\n\nOu experimenta o diagnóstico gratuito:\n${linkLumina}`,

    // Urgencia real
    urgencia: `⚡ Pergunta honesta:\n\nHá quanto tempo dizes "vou começar na segunda"?\n\nSemanas? Meses? Anos?\n\nEnquanto esperas pelo "momento certo", o teu corpo continua a pedir ajuda.\n\nDeixa de esperar.\n\n2 minutos. Gratuito. Agora:\n${linkLumina}`,

    // Promo directa
    promo: `*Isto não é uma dieta. É o fim das dietas.* 💥\n\nO VITALIS é coaching nutricional REAL:\n\n🍽 Plano feito para TI (não copiado da internet)\n📱 Coach IA que te responde às 3 da manhã\n💚 Espaço emocional para os dias difíceis\n📊 Dashboard que mostra o teu progresso real\n🇲🇿 Receitas com comida que encontras no mercado\n\nDesde 2.500 MT/mês\n7 dias de garantia (não gostas = reembolso)\n\n👉 ${linkVitalis}`,

    // Testemunho cru
    testemunho: `*"Chorei quando vi os meus resultados."*\n\nNão porque perdi peso.\n\nMas porque pela primeira vez em anos, comi sem culpa.\n\nPassei a vida inteira a fazer dieta. A sentir-me falhada. O VITALIS não me deu uma lista de alimentos. Deu-me uma nova relação com a comida.\n\n_- Cliente VITALIS, Maputo_\n\nQueres saber como?\n👉 ${linkVitalis}`,

    // Lumina como anzol
    lumina: `Faz-te estas 7 perguntas:\n\n1. Como está a tua energia hoje?\n2. Onde sentes tensão no corpo?\n3. O que viste no espelho?\n4. Pensaste muito no passado?\n5. Preocupaste-te com o futuro?\n6. A tua mente está clara ou confusa?\n7. Sentes vontade de conexão ou isolamento?\n\nO LUMINA analisa as tuas respostas e revela padrões que não vias.\n\nGratuito. 2 minutos. 23 leituras possíveis.\n\n${linkLumina}`,

    // Status rápido (para WhatsApp Status)
    status: `_${hoje.hook}_\n\n${hoje.cta} 🌿\n\n${linkVitalis}`,

    // DM pessoal (para enviar a uma pessoa)
    dm: `Olá! 🤍\n\nEu sou a Vivianne e criei uma coisa que acho que te pode interessar.\n\nÉ um diagnóstico gratuito que te diz como estás REALMENTE - energia, emoção, corpo - em 2 minutos.\n\nNão é questionário chato. É uma leitura personalizada.\n\nExperimenta e diz-me o que achaste:\n${linkLumina}\n\nSe quiseres saber mais, estou aqui 🤍`,

    // Sequencia Stories WhatsApp (5 partes)
    storiesSeq: `📱 *SEQUENCIA DE 5 STATUS* (publica um de cada vez, de hora em hora):\n\n*Status 1 (9h):*\n_${hoje.hook}_\n\n*Status 2 (11h):*\n_${hoje.corpo}_\n\n*Status 3 (13h):*\n_Sabias que 80% das mulheres em Moçambique nunca receberam orientação nutricional personalizada?_\n\n*Status 4 (16h):*\n_${hoje.cta}\nExperimenta grátis: ${linkLumina}_\n\n*Status 5 (19h):*\n_Hoje já cuidaste de ti? Mesmo 2 minutos contam.\n${linkLumina}_`,

    // Audio script (para gravar nota de voz)
    audio: `🎙 *SCRIPT PARA NOTA DE VOZ* (grava e envia para contactos):\n\n"Olá querida, tudo bem contigo? Olha, queria partilhar uma coisa contigo.\n\nEu descobri uma ferramenta gratuita que faz um diagnóstico de como tu estás - energia, emoção, corpo - em 2 minutinhos. Chama-se Lumina.\n\nEu experimentei e fiquei impressionada com a leitura. Parecia que me conhecia.\n\nVou mandar-te o link, experimenta e depois diz-me o que achaste, tá?\n\n[envia o link logo a seguir]\n\n${linkLumina}"`,

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

export function gerarStatusWhatsApp(campanha = '') {
  const hoje = gerarConteudoHoje();
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

export function gerarCaptionInstagram(tipo = 'post') {
  const hoje = gerarConteudoHoje();
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

    audioWhatsApp: `"Olá querida. Hoje quero partilhar algo importante contigo.\n\n${hoje.hook}\n\nPorque digo isto? Porque ${hoje.corpo.toLowerCase()}\n\nSe te identificas, experimenta o LUMINA - é gratuito e demora 2 minutinhos. Vou mandar-te o link."`,
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
      whatsapp: '*"Não tenho dinheiro."*\n\n2.500 MT = menos que um café por dia.\nMenos que a comida processada que compras por mês.\nMenos que a próxima consulta quando a saúde piorar.\n\n*"Não tenho tempo."*\n\nO check-in diário demora 2 minutos.\nAs receitas são rápidas.\nA app está no teu telemóvel.\n\n*"Já tentei tudo."*\n\nMas nunca tentaste algo que cuida da tua EMOÇÃO ao mesmo tempo que cuida da tua COMIDA.\n\nÉ isso que o VITALIS faz.\n\n7 dias de garantia. Sem risco.\n\n',
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
        { titulo: 'Mito 1: Xima engorda', texto: 'Falso. O que importa é a porção e o acompanhamento. Xima é energia pura e barata.' },
        { titulo: 'Mito 2: Preciso de suplementos caros', texto: 'Feijão nhemba, ovo, amendoim. Proteína acessível no mercado do bairro.' },
        { titulo: 'Mito 3: Comer menos = emagrecer', texto: 'Quando comes de menos, o metabolismo abranda. Comer MELHOR é o segredo.' },
        { titulo: 'Mito 4: Salada todos os dias', texto: 'Comida saudável tem sabor. Caril de coco, piri-piri. Porção certa = saúde.' },
        { titulo: 'Para de acreditar em mitos.', texto: 'VITALIS - Coaching Nutricional\napp.seteecos.com' },
      ],
      caption: '5 mitos que provavelmente já acreditaste (eu também!) 🫣\n\nDesliza e descobre a verdade.\n\nSalva este post. Partilha com alguém que precisa.\n\n#seteecos #vitalis #nutricaomocambique #mitos #comidadereal #saudereal',
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
        { titulo: 'Punho fechado = Hidratos', texto: 'Xima, arroz, batata. Um punho por refeição. É suficiente.' },
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
      caption: 'Quando foi a última vez que alguém te perguntou como te sentes REALMENTE? 🔮\n\nO LUMINA faz-te 7 perguntas e revela padrões que não vias.\n\nGratuito. 2 minutos. Link na bio.\n\n#seteecos #lumina #autoconhecimento #diagnostico #saudeemocional #mulhermocambicana',
    },
    {
      id: 'vitalis-o-que-inclui',
      titulo: 'O que o VITALIS Inclui',
      marca: 'vitalis',
      cor: '#7C8B6F',
      slides: [
        { titulo: 'Não é uma dieta. É o fim das dietas.', texto: 'VITALIS - Coaching Nutricional Personalizado' },
        { titulo: 'Plano alimentar feito para TI', texto: 'Com comida local: matapa, xima, feijão. Sem listas impossíveis.' },
        { titulo: 'Coach IA disponível 24h', texto: 'Pergunta o que quiseres. A qualquer hora. Sem julgamento.' },
        { titulo: 'Espaço emocional para dias difíceis', texto: 'Recaíste? Sem problema. Há um espaço para isso. Sem culpa.' },
        { titulo: 'Dashboard + Receitas + Desafios', texto: 'Tudo no teu telemóvel. Progresso real que podes ver.' },
        { titulo: 'Desde 2.500 MT/mês. 7 dias de garantia.', texto: 'app.seteecos.com/vitalis' },
      ],
      caption: 'O VITALIS não é mais uma dieta. É o único programa que cuida da tua COMIDA e da tua EMOÇÃO ao mesmo tempo. 🌿\n\nDesliza para ver tudo o que inclui.\n\nDesde 2.500 MT/mês. 7 dias de garantia.\n\nLink na bio.\n\n#seteecos #vitalis #coachingnutricional #saudereal #mulhermocambicana #transformacao',
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
        { titulo: 'AUREA: desde 975 MT/mês.', texto: 'app.seteecos.com/aurea' },
      ],
      caption: 'O teu valor não depende do que veste, pesas ou aparentas. 🤍\n\nO AUREA é um programa de 7 semanas para reconstruir a relação contigo mesma.\n\nPorque antes de mudar o corpo, precisas de mudar o olhar.\n\nLink na bio.\n\n#seteecos #aurea #autovalor #autoestima #mulherreal #empoderamento #moçambique',
    },
    {
      id: 'testemunhos-reais',
      titulo: 'Transformações Reais',
      marca: 'vitalis',
      cor: '#7C8B6F',
      slides: [
        { titulo: 'O que acontece quando paras de fazer dieta.', texto: 'Histórias reais de mulheres como tu.' },
        { titulo: '"Perdi 8kg mas o melhor foi parar de chorar depois de comer."', texto: '- M.J., Maputo' },
        { titulo: '"A minha filha disse que estou diferente. Não mais magra. Mais feliz."', texto: '- A.B., Maputo' },
        { titulo: '"Pela primeira vez não desisti ao 3o dia."', texto: '- S.C., Maputo' },
        { titulo: 'A próxima história pode ser a tua.', texto: 'VITALIS - Começa hoje\napp.seteecos.com/vitalis' },
      ],
      caption: 'Resultados reais. Sem filtro. Sem Photoshop. 🤍\n\nEstas mulheres decidiram parar de fazer dieta e começar a VIVER.\n\nA próxima história pode ser a tua.\n\nLink na bio.\n\n#seteecos #vitalis #transformacao #resultadosreais #semfiltro #mulhermocambicana',
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
      caption: 'E se existisse um sistema que cuida de TI como um todo?\n\nNão só a comida. Não só o peso. TU - inteira.\n\nComida. Emoção. Corpo. Mente. Tudo está ligado.\n\nIsto é o SETE ECOS. E acabou de chegar a Maputo.\n\nSegue para acompanhar esta jornada 🤍\n\n#seteecos #transmutacaofeminina #mulhermocambicana #bemestar #saudeintegral #maputo',
    },
    {
      ordem: 2, dia: 'Dom 8', titulo: 'Quem é a Vivianne',
      template: 'testemunho', eco: 'seteEcos', formato: 'post',
      texto: 'Antes de criar o Sete Ecos, eu também estive em guerra com o meu corpo.',
      subtitulo: '- Vivianne, Fundadora',
      caption: 'Olá. Sou a Vivianne.\n\nAntes de criar o @seteecos, eu também estive em guerra com o meu corpo.\n\nJejuava por culpa. Comia escondida. Pesava-me todos os dias.\n\nAté que percebi: o problema nunca foi o meu corpo. Era a minha relação com ele.\n\nCriei o Sete Ecos para que nenhuma mulher tenha de passar pelo que eu passei. Sozinha.\n\nSe te identificas, segue esta página. 🤍\n\n#seteecos #historiapessoal #mulherreal #moçambique #comidaeemocao',
    },
    {
      ordem: 3, dia: 'Dom 8', titulo: 'Primeiro Hook Emocional',
      template: 'dica', eco: 'vitalis', formato: 'post',
      texto: 'Ninguém te ensinou a comer. Ensinaram-te a ter medo de comer.',
      subtitulo: '@seteecos',
      caption: 'Ninguém te ensinou a comer. Ensinaram-te a ter medo de comer.\n\nMedo de hidratos. Medo de gordura. Medo de jantar depois das 18h. Medo de viver.\n\nE se te dissesse que podes comer sem culpa, sem medo, sem restrição - e mesmo assim transformar o teu corpo?\n\nFica atenta. Algo está a mudar. 🌿\n\n#seteecos #semdieta #semculpa #alimentacaoconsciente #mulhermocambicana #nutricao',
    },
    {
      ordem: 4, dia: 'Seg 9', titulo: 'Carrossel: 5 Mitos',
      template: 'carrossel', eco: 'vitalis', formato: 'post',
      carrosselId: 'mitos-alimentação',
      caption: '5 mitos que provavelmente já acreditaste (eu também!) 🫣\n\nDesliza e descobre a verdade sobre alimentação em Moçambique.\n\nSalva este post. Partilha com alguém que precisa.\n\n#seteecos #vitalis #nutricaomocambique #mitos #comidadereal #saudereal',
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
      caption: 'Quando foi a última vez que alguém te perguntou como te sentes REALMENTE?\n\nNão o que comes. Não quanto pesas. Como TE SENTES.\n\nO LUMINA faz-te 7 perguntas sobre energia, emoção e corpo. E revela padrões que não vias.\n\n🔮 Gratuito. 2 minutos. 23 leituras possíveis.\n\nLink na bio.\n\n#seteecos #lumina #diagnostico #autoconhecimento #saudeemocional #mulhermocambicana',
    },
    {
      ordem: 8, dia: 'Qui 12', titulo: 'Testemunho',
      template: 'testemunho', eco: 'vitalis', formato: 'post',
      texto: 'Perdi 8kg mas o melhor foi parar de chorar depois de comer.',
      subtitulo: '- M.J., Maputo',
      caption: '"Perdi 8kg mas o melhor foi parar de chorar depois de comer."\n\nEsta frase é real. De uma mulher real. Em Maputo.\n\nNão perdeu peso por fazer dieta. Perdeu peso porque parou de sofrer com a comida.\n\nIsto é possível para ti também.\n\nFica atenta. 🌿\n\n#seteecos #vitalis #transformacao #resultadosreais #semfiltro #mulhermocambicana',
    },
    {
      ordem: 9, dia: 'Sex 13', titulo: 'Hook Relatable',
      template: 'dica', eco: 'seteEcos', formato: 'post',
      texto: 'Se cozinhas para a família inteira e comes os restos em pé na cozinha, este post é para ti.',
      subtitulo: '@seteecos',
      caption: 'Se cozinhas para a família inteira e comes os restos em pé na cozinha, este post é para ti.\n\nTu também mereces sentar. Comer com calma. Ter um prato pensado para TI.\n\nA tua saúde importa tanto quanto a deles.\n\nPartilha com uma mulher que precisa de ouvir isto. 🤍\n\n#seteecos #mulhermocambicana #cuidadeti #maes #comidaconsciente #realidade',
    },
    {
      ordem: 10, dia: 'Sáb 14', titulo: 'Carrossel: LUMINA',
      template: 'carrossel', eco: 'lumina', formato: 'post',
      carrosselId: 'lumina-como-funciona',
      caption: 'O diagnóstico que ninguém te fez 🔮\n\nO LUMINA analisa energia, emoção e corpo em 2 minutos.\n\nGratuito. Link na bio.\n\n#seteecos #lumina #autoconhecimento #diagnostico #saudeemocional #mulhermocambicana',
    },
    {
      ordem: 11, dia: 'Sáb 14', titulo: 'VITALIS Reveal',
      template: 'cta', eco: 'vitalis', formato: 'post',
      texto: 'Não é uma dieta. É o fim das dietas.',
      subtitulo: 'VITALIS - Abre próxima semana',
      caption: 'Algo que estive a construir há muito tempo.\n\nUm programa que não te dá uma lista e te deseja boa sorte.\n\n🍽 Plano alimentar com comida local (matapa, xima, feijão nhemba)\n🧠 Cuida da emoção ao mesmo tempo que da comida\n📱 Coach IA disponível 24h\n💚 Espaço para os dias difíceis\n\nChama-se VITALIS. Abre na próxima semana.\n\nQueres ser das primeiras? Experimenta o LUMINA (link na bio) 🌿\n\n#seteecos #vitalis #lancamento #coachingnutricional #embreve #mulhermocambicana',
    },
    {
      ordem: 12, dia: 'Sáb 14', titulo: 'Teaser Final',
      template: 'dica', eco: 'vitalis', formato: 'post',
      texto: 'Próxima semana, tudo muda.',
      subtitulo: 'VITALIS - Em breve',
      caption: 'Próxima semana, tudo muda.\n\nSe esta semana algo ressoou contigo...\nSe te identificaste com algum post...\nSe o LUMINA te surpreendeu...\n\nEntão estás pronta.\n\nActiva as notificações 🔔\n\n🌿\n\n#seteecos #vitalis #embreve #lancamento #transformacao #mulhermocambicana',
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
      targeting: 'Mulheres 25-55 | Maputo, Moçambique | Interesses: Saúde, Bem-estar, Nutrição, Alimentação saudável, Yoga, Meditação',
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
      targeting: 'Mulheres 25-55 | Maputo | Interesses: Dieta, Perda de peso, Saúde mental, Corpo positivo',
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
      targeting: 'Mulheres 25-55 | Maputo | Interesses: Dieta, Emagrecimento, Receitas saudáveis, Fitness',
      orcamento: '300-500 MT/dia (~$5-8 USD)',
    },
    {
      id: 'testemunho-ad',
      nome: 'Prova Social - Testemunho',
      objectivo: 'Conversoes (Cliques no Link)',
      template: 'testemunho', eco: 'vitalis', formato: 'post',
      texto_imagem: 'Perdi 8kg mas o melhor foi parar de chorar depois de comer.',
      subtitulo_imagem: '- M.J., Maputo',
      headline: 'Resultado real. Sem filtro.',
      texto_primario: '"Perdi 8kg mas o melhor foi parar de chorar depois de comer."\n\nEsta mulher não fez dieta. Mudou a relação com a comida.\n\nComeça pelo diagnóstico gratuito.',
      descricao: 'Diagnóstico gratuito LUMINA',
      cta_botao: 'Experimenta Grátis',
      link: `${BASE_URL}/lumina?utm_source=facebook&utm_medium=ad&utm_campaign=testemunho-s1`,
      targeting: 'Mulheres 25-55 | Maputo | Interesses: Transformação pessoal, Saúde, Bem-estar',
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
        mensagem: `Olá querida 🤍\n\nQuero partilhar uma coisa contigo.\n\nCriei um projecto para mulheres que, como eu, já estiveram em guerra com o próprio corpo.\n\nNão é uma dieta. Não é um ginásio. É algo diferente.\n\nNos próximos dias vou contar-te mais.\n\nSe tens curiosidade, segue @seteecos no Instagram. Acabou de nascer. 🌿`,
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
        imagem: { template: 'testemunho', eco: 'vitalis', formato: 'stories', texto: 'Perdi 8kg mas o melhor foi parar de chorar depois de comer.', subtitulo: '- M.J., Maputo' },
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
        mensagem: `*O VITALIS está ABERTO.* 🌿\n\nDepois de meses a construir, finalmente está aqui.\n\nCoaching nutricional que cuida de TI - comida E emoção.\n\n🍽 Plano alimentar personalizado (com comida moçambicana)\n📱 Coach IA disponível 24h\n💚 Espaço emocional para dias difíceis\n📊 Dashboard com o teu progresso\n🎯 Desafios semanais\n📖 Receitas com ingredientes locais\n\nDesde 2.500 MT/mês. 7 dias de garantia.\n\nInscreve-te agora:\n${linkVitalis}\n\nPara as primeiras 10: surpresa especial! 🤍`,
        imagem: { template: 'cta', eco: 'vitalis', formato: 'stories', texto: 'VITALIS está ABERTO.', subtitulo: 'Coaching Nutricional | Desde 2.500 MT/mês' },
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
        imagem: { template: 'testemunho', eco: 'vitalis', formato: 'stories', texto: 'A minha filha disse que estou diferente. Não mais magra. Mais feliz.', subtitulo: '- A.B., Maputo' },
      },
      ads: 'Manter. Escalar ads com melhor ROAS.',
      notas: 'Prova social forte. Testemunhos criam confiança.',
    },
    {
      dia: 11, data: 'Quarta 18 Fev', titulo: 'OBJEÇÕES',
      stories: 'Q&A: Responder dúvidas sobre preço, tempo, funcionamento.',
      whatsapp: {
        mensagem: `Sei que talvez estejas a pensar:\n\n*"Não tenho dinheiro."*\n2.500 MT = menos que 1 café por dia. Menos que comida processada por mês.\n\n*"Não tenho tempo."*\nCheck-in: 2 min. Receitas: rápidas. App no telemóvel.\n\n*"Já tentei tudo."*\nMas nunca tentaste algo que cuida da emoção ao mesmo tempo.\n\n*"E se não gostar?"*\n7 dias de garantia. Sem risco.\n\nSe alguma destas era a tua dúvida, já tens a resposta.\n\n${linkVitalis} 🌿`,
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
        mensagem: `Esta semana foi especial 🤍\n\nLançámos o VITALIS e a resposta superou tudo.\n\nSe ainda não entraste, esta é a tua última oportunidade esta semana.\n\nLembra-te: 7 dias de garantia. Sem risco.\n\n🍽 Plano alimentar personalizado\n📱 Coach IA 24h\n💚 Espaço emocional\n📊 Dashboard de progresso\n\nDesde 2.500 MT/mês.\n\n${linkVitalis}\n\nDaqui a 3 meses, vais agradecer-te. 🌿`,
        imagem: { template: 'cta', eco: 'vitalis', formato: 'stories', texto: 'O VITALIS está aberto. Desde 2.500 MT/mês.', subtitulo: '7 dias de garantia. A decisão é tua.' },
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
    { dia: 0, assunto: 'Bem-vinda — A tua jornada começa aqui', tipo: 'boas-vindas', preview: 'Não é mais uma newsletter. É um espelho.' },
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

export function getConteudosMockupVitalis() {
  const linkVitalis = buildUTMUrl(`${BASE_URL}/vitalis`, UTM_TEMPLATES.instagramBio());
  const linkLumina = buildUTMUrl(`${BASE_URL}/lumina`, UTM_TEMPLATES.instagramBio('lumina'));

  return [
    // ========== POST 1 - LANÇAMENTO ==========
    {
      numero: 1,
      tipo: 'feed',
      titulo: 'Saúde real. Feita para nós.',
      descricao: 'Post de apresentação com orgulho moçambicano',
      imagens: [MOCKUP_IMAGES.mozproud],
      caption: `Saúde real. Feita para nós. 🇲🇿

Não é mais um app de dieta gringa.
Não é mais uma lista de "não comas isto".

É uma plataforma inteira. Desenhada para mulheres moçambicanas. Com comida do nosso mercado. Com a nossa realidade.

Chama-se VITALIS. E está dentro do @seteecos.

98 receitas locais. Coach disponível 24h. Treinos adaptados ao teu ciclo. Espaço para quando a emoção pesa mais que a fome.

Desenvolvido em Moçambique. Para nós. 🌿

Link na bio.

#vitalis #seteecos #saudereal #feitaparanós #moçambique #maputo #mulhermocambicana #nutricao #bemestar #orgulhomocambicano #saude #wellness`,
      whatsapp: `🇲🇿 *VITALIS - Saúde real. Feita para nós.*

Finalmente uma plataforma de saúde feita com a NOSSA realidade.

98 receitas com comida do mercado moçambicano. Coach 24h. Treinos que respeitam o teu corpo.

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
📖 Receitas - 98, todas com comida local
💜 Espaço Retorno - para quando precisas de parar
📊 Relatórios - vê a tua evolução
💪 Treinos - adaptados à tua fase

Tudo num só lugar. Tudo feito para TI.

Desde 2.500 MT/mês. Link na bio. 🌿

#vitalis #seteecos #appsaude #dashboard #planoalimentar #coachingnutricional #maputo #mulhermocambicana #tecnologia #wellness`,
      whatsapp: `📱 *Já viste o VITALIS por dentro?*

Olha o que tens quando entras:
📋 Plano personalizado
✅ Check-in diário
📖 98 receitas locais
💜 Espaço emocional
📊 Relatórios
💪 Treinos

Tudo no teu telemóvel. Desde 2.500 MT/mês.

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

#vitalis #seteecos #coachnutricional #IA #coachingonline #disponivel24h #maputo #saudedigital #nutricao #apoioemocional`,
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
      titulo: '98 receitas. Todas com comida do mercado.',
      descricao: 'Biblioteca de receitas com filtros por origem',
      imagens: [MOCKUP_IMAGES.receitas],
      caption: `98 receitas. Nenhuma pede quinoa. 🇲🇿

Matapa. Caril de amendoim. Feijão nhemba. Xima.

A Biblioteca de Receitas do VITALIS tem:

🇲🇿 Moçambicana
🇿🇲 Zambeziana
🇮🇳 Indiana
🇵🇹 Portuguesa
🌍 Mediterrânica

Cada receita filtrada para o TEU perfil. Compatível com as tuas necessidades. Ingredientes que encontras no mercado do bairro.

Chega de dietas com comida que não existe em Maputo.

Link na bio. 🌿

#vitalis #seteecos #receitasmocambicanas #comidalocal #matapa #xima #feijaonobanquete #cozinhamocambicana #saudavel #receitas #mercado #maputo`,
      whatsapp: `🍽 *98 receitas e NENHUMA pede quinoa.*

O VITALIS tem uma biblioteca inteira de receitas:
🇲🇿 Moçambicanas
🇿🇲 Zambezianas
🇮🇳 Indianas
🇵🇹 Portuguesas

Filtradas para o teu perfil. Com comida do mercado.

Matapa, caril de amendoim, feijão nhemba... comida REAL.

👉 ${linkVitalis}`,
      melhorHora: '11h-12h (antes do almoço)',
      dica: 'O argumento "comida local" é o mais forte. As mulheres estão fartas de dietas gringas.',
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

#vitalis #seteecos #saudeemocional #espacoseguro #ansiedade #cansaco #emocoes #mulherreal #autocuidado #saudementalimporta #maputo #bemestar`,
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

#vitalis #seteecos #ciclomenstrual #treinofeminino #fasemenstrual #ovulacao #fitness #saudefeminina #hormonal #maputo #mulhermocambicana #treino`,
      whatsapp: `🌙 *O teu treino devia mudar conforme o teu ciclo menstrual.*

No VITALIS, muda:

🌙 Menstrual → Descanso
🌸 Folicular → Mais energia
☀️ Ovulação → Treino forte
🍂 Lútea → Recuperação

Frequência, duração, intensidade - tudo adaptado a TI.

Nenhum outro app faz isto em Moçambique.

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
        { texto: '1. 98 receitas com comida do mercado', subtitulo: 'Moçambicana, Zambeziana, Indiana, Portuguesa' },
        { texto: '2. Coach disponível 24h', subtitulo: 'Sem espera. Sem julgamento. Sempre lá.' },
        { texto: '3. Treinos adaptados ao ciclo', subtitulo: 'Menstrual, Folicular, Ovulação, Lútea' },
        { texto: '4. Espaço emocional só teu', subtitulo: 'Porque 80% dos problemas com comida são emocionais' },
        { texto: '5. Dashboard completo', subtitulo: 'Plano, check-in, refeições, relatórios. Tudo num sítio.' },
      ],
      caption: `5 coisas que o VITALIS faz por ti e que nenhuma dieta faz. 🌿

Desliza para ver cada uma →

1️⃣ 98 receitas com comida do NOSSO mercado
2️⃣ Coach disponível 24 horas por dia
3️⃣ Treinos que se adaptam ao teu ciclo menstrual
4️⃣ Espaço emocional para os dias difíceis
5️⃣ Dashboard completo - tudo no teu telemóvel

Isto não é uma dieta. É um sistema inteiro de cuidado.

Desde 2.500 MT/mês. 7 dias de garantia.

Link na bio 🤍

#vitalis #seteecos #coachingnutricional #5razoes #carrossel #saudavel #mulhermocambicana #maputo #planoalimentar #wellness`,
      whatsapp: `🌿 *5 coisas que o VITALIS faz por ti:*

1️⃣ 98 receitas com comida local
2️⃣ Coach disponível 24h
3️⃣ Treinos adaptados ao ciclo
4️⃣ Espaço emocional
5️⃣ Dashboard completo

Desde 2.500 MT/mês. 7 dias de garantia.

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
        { texto: '❌ Dietas: "Não comas arroz"\n✅ VITALIS: 98 receitas com xima, matapa e feijão nhemba', subtitulo: '' },
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

#vitalis #seteecos #dietasnao #semdieta #comidareal #comparacao #mudanca #saudavel #mulhermocambicana #maputo #antidieta #nutricaointuitiva`,
      whatsapp: `🥊 *DIETAS vs VITALIS*

❌ "Não comas arroz" → ✅ 98 receitas com xima e matapa
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
        { texto: 'Biblioteca de 98 Receitas', subtitulo: 'Filtro por origem: 🇲🇿🇿🇲🇮🇳🇵🇹 e tipo de refeição' },
        { texto: 'Coach Vivianne - 24h disponível', subtitulo: 'Porções, prato, jejum, treino. Pergunta o que quiseres.' },
        { texto: 'Treinos por fase do ciclo', subtitulo: 'Menstrual → Folicular → Ovulação → Lútea' },
        { texto: 'Espaço de Retorno Emocional', subtitulo: 'Para quando o problema não é a comida. É a emoção.' },
        { texto: 'Saúde real. Feita para nós.', subtitulo: 'Desenvolvido em Moçambique 🇲🇿' },
      ],
      caption: `Tour pela app VITALIS 📱✨

7 ecrãs. 7 razões para nunca mais fazeres dieta.

Desliza para ver o que recebes →

🖥 Landing profissional
📱 Dashboard completo
📖 98 receitas locais (moçambicanas, zambezianas, indianas, portuguesas)
🤖 Coach Vivianne disponível 24h
💪 Treinos adaptados ao ciclo menstrual
💜 Espaço de retorno emocional
🇲🇿 Feito com orgulho em Moçambique

Isto é coaching nutricional de verdade. No teu telemóvel.

Desde 2.500 MT/mês. Link na bio. 🌿

#vitalis #seteecos #tourapp #plataforma #saudedigital #nutricao #coachingnutricional #maputo #mulhermocambicana #bemestar #tecnologia`,
      whatsapp: `📱 *Queres ver o VITALIS por dentro?*

Fiz um tour pela app:

🖥 Landing profissional
📱 Dashboard completo
📖 98 receitas locais
🤖 Coach 24h
💪 Treinos por ciclo menstrual
💜 Espaço emocional
🇲🇿 Feito em Moçambique

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

#vitalis #seteecos #reels #umdiacomvitalis #rotina #saudavel #dayinmylife #maputo #mulhermocambicana #wellness #nutricao`,
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
TEXTO: "VITALIS - Saúde real. Feita para nós. 🇲🇿"
VOZ/TEXTO: "Agora envia TU este reel a essa amiga 🤍"

---
CAPTION: Mostra abaixo.`,
      caption: `POV: A tua amiga envia-te um link e diz "confia em mim" 🤍

E depois descobres uma app inteira feita para mulheres moçambicanas.

Com receitas do nosso mercado. Coach que te ouve às 3 da manhã. Treinos que respeitam o teu ciclo.

E um espaço para quando o problema não é a comida. É a emoção.

Marca essa amiga nos comentários. Ela precisa de ver isto. 👇🏾

Link na bio 🌿

#vitalis #seteecos #pov #reels #trending #amiga #mulhermocambicana #maputo #surprise #saudavel #wellness`,
      whatsapp: `👀 *Vi um reel que me fez lembrar de ti.*

Uma app feita para mulheres moçambicanas com:
🍽 Receitas do nosso mercado
🤖 Coach 24h
💪 Treinos por ciclo menstrual
💜 Espaço emocional

Abre e vê: ${linkVitalis}

Depois diz-me o que achaste 🤍`,
      melhorHora: '19h-21h',
      dica: 'O formato POV é dos mais virais do Instagram. Pede para a audiência marcar amigas.',
    },

    // ========== REEL 12 - FEITO EM MOÇAMBIQUE ==========
    {
      numero: 12,
      tipo: 'reel',
      titulo: 'Feito em Moçambique. Com orgulho.',
      descricao: 'Reel emotivo sobre orgulho moçambicano - storytelling pessoal',
      imagens: [MOCKUP_IMAGES.mozproud, MOCKUP_IMAGES.landingPC, MOCKUP_IMAGES.dashboard],
      roteiro: `🎬 *REEL: "Feito em Moçambique. Com orgulho."*
Duração: 30-45 segundos
Música: instrumental emotiva (afrobeat suave ou marrabenta instrumental)
Formato: Vivianne a falar para a câmara + cuts para mockups

---

*CENA 1 (0-8s)* - HOOK PESSOAL
[Vivianne a falar para a câmara, close-up]
VOZ: "Quando comecei a procurar ajuda para a minha alimentação, tudo o que encontrava era de fora. Em inglês. Com comida que não existe aqui."
TEXTO: 🇲🇿

*CENA 2 (8-16s)* - O PROBLEMA
[B-roll: mercado de Maputo / comida local]
VOZ: "Nenhuma app tinha matapa. Nenhuma falava de xima. Nenhuma entendia a nossa realidade."
TEXTO: "A nossa comida merece respeito."

*CENA 3 (16-28s)* - A SOLUÇÃO
[Mostrar mockups: landing PC → dashboard → receitas → coach]
VOZ: "Então criei o VITALIS. 98 receitas com comida moçambicana. Coach disponível 24 horas. Treinos que respeitam o teu corpo. Espaço emocional para os dias difíceis."
TEXTO: "VITALIS - A raiz da transformação 🌿"

*CENA 4 (28-40s)* - ORGULHO
[Mostrar mozproud-vitalis.jpeg]
VOZ: "Desenvolvido em Moçambique. Para mulheres moçambicanas. Porque a nossa saúde merece tecnologia de primeiro mundo."
TEXTO: "Saúde real. Feita para nós. 🇲🇿"

---
CAPTION: Mostra abaixo.`,
      caption: `Quando procurei ajuda para a minha alimentação, só encontrei apps em inglês. Com quinoa e abacate orgânico.

Nenhuma tinha matapa. Nenhuma falava de xima. Nenhuma entendia a realidade de uma mulher moçambicana.

Então criei o VITALIS. 🇲🇿

98 receitas com comida do nosso mercado.
Coach disponível 24 horas.
Treinos que respeitam o teu ciclo.
Espaço para quando a emoção pesa mais que a fome.

Desenvolvido em Moçambique. Com orgulho. Para nós. 🌿

Se acreditas que as mulheres moçambicanas merecem saúde de qualidade, partilha este reel. 🤍

Link na bio.

#vitalis #seteecos #moçambique #maputo #orgulhomocambicano #feitoemmocambique #tecnologia #saude #mulhermocambicana #empreendedorismo #africa #inovacao`,
      whatsapp: `🇲🇿 *Criei algo que gostava que existisse quando precisei.*

Nenhuma app tinha matapa. Nenhuma falava de xima.

Então criei o VITALIS:
📖 98 receitas moçambicanas
🤖 Coach 24h
💪 Treinos por ciclo
💜 Espaço emocional

Feito em Moçambique. Para nós.

👉 ${linkVitalis}

Partilha com mulheres que precisam disto 🤍`,
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
      titulo: 'Lançamento com mockup mozproud',
      imagem: MOCKUP_IMAGES.mozproud,
      mensagem: `🇲🇿 *VITALIS - Saúde real. Feita para nós.*

Criei uma plataforma inteira de nutrição e bem-estar para mulheres moçambicanas.

Não é dieta. Não é restrição. É cuidado.

📖 98 receitas com comida do nosso mercado
🤖 Coach disponível 24 horas
💪 Treinos adaptados ao teu ciclo
💜 Espaço emocional para os dias difíceis

Desde 2.500 MT/mês. 7 dias de garantia.

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

Tudo isto no teu telemóvel. Desde 2.500 MT/mês.

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
      titulo: 'Receitas - comida local',
      imagem: MOCKUP_IMAGES.receitas,
      mensagem: `🍽 *98 receitas. ZERO quinoa.*

O VITALIS tem uma biblioteca inteira com:

🇲🇿 Receitas moçambicanas (matapa, caril de amendoim, feijão nhemba)
🇿🇲 Zambezianas
🇮🇳 Indianas
🇵🇹 Portuguesas
🌍 Mediterrânicas

Cada receita filtrada para o teu perfil e as tuas necessidades.

Ingredientes que encontras no mercado do bairro. Não no supermercado gourmet.

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

Nenhuma app faz isto em Moçambique.

👉 ${linkVitalis}

7 dias de garantia. Experimenta. 🌿`,
    },
    {
      titulo: 'Landing PC - credibilidade',
      imagem: MOCKUP_IMAGES.landingPC,
      mensagem: `🖥 *VITALIS - A raiz da transformação*

Coaching nutricional personalizado. Dashboard completo. Receitas locais. Coach 24h. Treinos por ciclo. Apoio emocional.

Plataforma profissional. Acessível. Moçambicana.

Método Precision Nutrition adaptado à nossa realidade.

Desde 2.500 MT/mês.

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
    bio: `Sistema de Transmutação Feminina 🌿
Comida · Emoção · Corpo · Mente
🇲🇿 Feito em Moçambique, para nós
🔮 LUMINA: diagnóstico gratuito ↓
🌱 VITALIS: coaching nutricional ↓`,
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
      'Segue 50-100 contas de Maputo (mulheres, saúde, comida, fitness)',
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
            { texto: 'Texto: "98 receitas com comida moçambicana 🇲🇿🍽"', tipo: 'texto' },
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
          titulo: 'Reel #12 — Feito em Moçambique. Com orgulho.',
          descricao: 'O reel mais emotivo. Orgulho moçambicano = partilhas garantidas.',
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
          titulo: 'Interagir: comentar em 10 contas de Maputo',
          descricao: 'Vai a contas de mulheres em Maputo e deixa comentários genuínos.',
          accao: 'Procurar #maputo #mulhermocambicana → Comentar (não spam) → Seguir 20 contas relevantes',
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
            { texto: 'Enquete: "Qual comida preferes?" MATAPA / CARIL AMENDOIM', tipo: 'enquete' },
            { texto: 'Quiz: "Quantas calorias tem a matapa?" (surpreender com resposta)', tipo: 'quiz' },
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
          descricao: 'Mostra o coach IA como diferencial. Ninguém tem isto em Moçambique.',
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
          'Em "User or Page", seleccionar a tua Pagina de Facebook',
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
          'Na resposta, encontrar a tua Pagina e copiar o "access_token" dela',
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
          'Copiar o "id" da Pagina de Facebook',
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
// WHATSAPP BUSINESS - Setup completo profissional
// ============================================================

export function getSetupWhatsAppBusiness() {
  return {
    perfil: {
      nome: 'Sete Ecos',
      categoria: 'Saude e bem-estar',
      descricao: 'Coaching nutricional e bem-estar feminino 🌿 Feito em Moçambique 🇲🇿',
      sobre: 'Coaching nutricional e bem-estar feminino 🌿 Feito em Moçambique 🇲🇿',
      horario: 'Seg-Sex: 8h-18h',
      email: 'viv.saraiva@gmail.com',
      website: 'https://app.seteecos.com',
      endereco: 'Maputo, Moçambique',
    },
    saudacao: `Olá! 🌿 Bem-vinda ao Sete Ecos.\n\nSou a Vivianne, coach de nutrição e bem-estar feminino.\n\nComo te posso ajudar?\n\n1️⃣ Quero saber mais sobre o VITALIS (coaching nutricional)\n2️⃣ Quero fazer o diagnóstico gratuito LUMINA\n3️⃣ Tenho dúvidas sobre preços\n4️⃣ Preciso de suporte técnico\n\nResponde com o número ou escreve à vontade 💚`,
    ausencia: `Olá! 🌿 Obrigada pela tua mensagem.\n\nNeste momento estou fora do horário de atendimento (Seg-Sex, 8h-18h).\n\nEnquanto isso, podes:\n🔮 Fazer o diagnóstico gratuito: app.seteecos.com/lumina\n🌱 Ver o programa VITALIS: app.seteecos.com/vitalis\n\nRespondo-te assim que possível! 💚`,
    respostasRapidas: [
      {
        atalho: '/precos',
        titulo: 'Preços VITALIS',
        mensagem: `Os nossos planos VITALIS (coaching nutricional):\n\n💚 Mensal: 2.500 MZN/mês\n💚 Semestral: 12.500 MZN (poupas 2.500!)\n💚 Anual: 21.000 MZN (poupas 9.000!)\n\nTodos incluem:\n✅ Plano alimentar personalizado\n✅ Receitas moçambicanas adaptadas\n✅ Chat directo comigo\n✅ Treinos guiados\n✅ Acompanhamento semanal\n\nQueres experimentar? Posso activar-te um período de teste 🌱`,
      },
      {
        atalho: '/lumina',
        titulo: 'Diagnóstico LUMINA',
        mensagem: `O LUMINA é o nosso diagnóstico gratuito 🔮\n\nEm 5 minutos, descobres:\n• Como está a tua relação com a comida\n• Os teus padrões emocionais\n• O que o teu corpo está a pedir\n\nÉ 100% grátis, sem compromisso.\n\nFaz aqui: app.seteecos.com/lumina 💜`,
      },
      {
        atalho: '/vitalis',
        titulo: 'Programa VITALIS',
        mensagem: `O VITALIS é o nosso programa de coaching nutricional 🌱\n\nNão é dieta. É transformação.\n\nO que inclui:\n🍽 Plano alimentar com comida moçambicana (xima, matapa, caril...)\n📊 Dashboard com o teu progresso\n💬 Chat directo comigo\n🏋️ Treinos adaptados ao teu nível\n📋 Lista de compras automática\n🔄 Espaço de retorno (sem culpa, sem julgamento)\n\nFeito para a mulher moçambicana. Por uma moçambicana.\n\nQueres começar? 💚`,
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
      { nome: 'Cliente Activa', cor: 'verde', descricao: 'Tem subscrição activa' },
      { nome: 'Interessada', cor: 'amarelo', descricao: 'Perguntou mas ainda não comprou' },
      { nome: 'Teste', cor: 'azul', descricao: 'Em período de teste' },
      { nome: 'Expirada', cor: 'vermelho', descricao: 'Subscrição expirou' },
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
        descricao: 'Coaching nutricional completo: plano alimentar personalizado com comida moçambicana, receitas, treinos guiados, chat directo com a coach, lista de compras automática e acompanhamento semanal.',
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
    statusSemanal: [
      {
        dia: 'Segunda', conteudo: 'Dica de nutrição',
        exemplo: `🍽 Sabias que a matapa tem mais ferro que muitos suplementos importados? A tua avó já sabia. 🌿

O VITALIS ensina-te a usar o que já tens — comida real, local, sem gastar fortunas.

🌱 Experimenta grátis 7 dias: app.seteecos.com/vitalis
💬 Dúvidas? Fala comigo: wa.me/258851006473`,
        imagem: { template: 'statusWA', eco: 'vitalis', texto: 'A matapa tem mais ferro que muitos suplementos importados.', subtitulo: 'A tua avó já sabia.', bgIndex: 1 },
      },
      {
        dia: 'Terça', conteudo: 'Frase motivacional + link LUMINA',
        exemplo: `O teu corpo não precisa de castigo. Precisa de compreensão. 🔮

Descobre o que o teu corpo te pede com o LUMINA — diagnóstico gratuito em 5 minutos.

✨ Faz o teu: app.seteecos.com/lumina
💬 Fala comigo: wa.me/258851006473`,
        imagem: { template: 'statusMinimal', eco: 'lumina', texto: 'O teu corpo não precisa de castigo.', subtitulo: 'Precisa de compreensão.' },
      },
      {
        dia: 'Quarta', conteudo: 'Testemunho ou resultado',
        exemplo: `"Deixei de contar calorias e perdi 4kg em 2 meses. O segredo? Comer a MINHA comida, sem culpa." — Cliente VITALIS 🌱

Tu também podes. O primeiro passo é o diagnóstico gratuito.

🔮 Faz o LUMINA: app.seteecos.com/lumina
🌱 Conhece o VITALIS: app.seteecos.com/vitalis
💬 Fala comigo: wa.me/258851006473`,
        imagem: { template: 'statusWA', eco: 'vitalis', texto: 'Deixei de contar calorias e perdi 4kg em 2 meses.', subtitulo: 'Comer a MINHA comida, sem culpa.', bgIndex: 4 },
      },
      {
        dia: 'Quinta', conteudo: 'Bastidores',
        exemplo: `Por trás do Sete Ecos: a preparar novos conteúdos para vocês. Isto é mais que trabalho, é missão. 💚

Cada mulher que se transforma inspira outra. Queres fazer parte?

🌱 Conhece o projecto: app.seteecos.com
💬 Fala comigo: wa.me/258851006473`,
        imagem: { template: 'statusMinimal', eco: 'vitalis', texto: 'Isto é mais que trabalho. É missão.', subtitulo: 'Sete Ecos — Transmutação Feminina' },
      },
      {
        dia: 'Sexta', conteudo: 'Promoção directa VITALIS',
        exemplo: `🌱 VITALIS: coaching nutricional feito para a mulher moçambicana.

Sem dietas importadas. Sem culpa. Com resultados.
Plano alimentar personalizado + acompanhamento + receitas locais.

✅ Experimenta grátis 7 dias: app.seteecos.com/vitalis
💬 Fala comigo para começar: wa.me/258851006473`,
        imagem: { template: 'statusWA', eco: 'vitalis', texto: 'Coaching nutricional feito para ti.', subtitulo: 'Sem dietas importadas. Sem culpa. Com resultados.', bgIndex: 5 },
      },
      {
        dia: 'Sábado', conteudo: 'Receita rápida',
        exemplo: `🥣 Papas de aveia com banana e canela. 5 min. Sem açúcar. Energia para o dia todo.

Receita completa + dezenas de outras no VITALIS — tudo com ingredientes locais.

🌱 Receitas e mais: app.seteecos.com/vitalis
💬 Fala comigo: wa.me/258851006473`,
        imagem: { template: 'statusWA', eco: 'vitalis', texto: 'Papas de aveia com banana e canela.', subtitulo: '5 min. Sem açúcar. Energia para o dia todo.', bgIndex: 6 },
      },
      {
        dia: 'Domingo', conteudo: 'Reflexão pessoal',
        exemplo: `Domingo é dia de olhar para dentro. O que fizeste por ti esta semana? 🌿

Se a resposta é "nada"… esta semana pode ser diferente. Começa pelo diagnóstico.

🔮 LUMINA grátis: app.seteecos.com/lumina
💬 Fala comigo: wa.me/258851006473`,
        imagem: { template: 'statusMinimal', eco: 'vitalis', texto: 'O que fizeste por ti esta semana?', subtitulo: 'Domingo é dia de olhar para dentro.' },
      },
    ],
  };
}
