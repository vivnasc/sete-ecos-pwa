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
  'O teu corpo não é o inimigo. A tua relação com ele é que esta.',
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
    hook: 'A matapa que a tua avó fazia e mais saudável que qualquer suplemento importado.',
    corpo: 'Ferro, vitaminas, proteína vegetal. Tudo na comida que já conheces. Não precisas de comprar nada caro. Precisas de voltar ao que e teu.',
    cta: 'O VITALIS ensina-te a usar o que já tens.',
  },
  {
    hook: 'Xima não engorda. O que engorda e a falta de equilíbrio no prato.',
    corpo: 'Ouviste a vida inteira que hidratos são maus. Mentira. O teu corpo precisa deles. O segredo é o tamanho da porção e o que metes ao lado. Mão aberta = porção certa.',
    cta: 'No VITALIS, aprendes a medir com as mãos. Sem balança, sem stress.',
  },
  {
    hook: 'Beber 2 litros de água em Maputo não é conselho. É sobrevivência.',
    corpo: 'Com este calor, o teu corpo perde mais água do que imaginas. A desidratação disfarça-se de fome. Antes de comer, bebe. Depois decide.',
    cta: 'O VITALIS rastreia a tua água, sono e energia todos os dias.',
  },
  {
    hook: 'Se cozinhas para a família inteira e comes os restos em pé na cozinha, este post e para ti.',
    corpo: 'Tu também mereces sentar, comer com calma, é ter um prato pensado para TI. Não só para o marido e as crianças. A tua saúde importa tanto quanto a deles.',
    cta: 'VITALIS: um plano alimentar que e SÓ teu.',
  },
  {
    hook: 'A proteína mais barata de Moçambique? Feijão nhemba.',
    corpo: 'Esquece a whey protein de 3000 MT. Feijão nhemba, amendoim, ovo cozido. Comida real, local, acessível. A ciência confirma o que as avós já sabiam.',
    cta: 'Receitas com ingredientes que encontras no mercado do bairro.',
  },
  {
    hook: 'Jejum intermitente não é passar fome. É dar ao teu corpo tempo para se curar.',
    corpo: 'Mas também não é para toda a gente. Se tens histórico de compulsão, pode ser perigoso. Não copies o que viste no TikTok. Precisa de orientação.',
    cta: 'No VITALIS, o jejum e acompanhado e personalizado.',
  },
  {
    hook: 'Comer salada todos os dias não é saudável. É aborrecido.',
    corpo: 'Comida saudável não tem de ser sem sabor. Caril de coco com legumes. Frango grelhado com piri-piri. Banana frita como snack. O segredo e porção, não privação.',
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
    hook: 'Recaíste? Bem-vinda ao clube de quem e humana.',
    corpo: 'A diferença entre quem transforma o corpo e quem desiste não é nunca falhar. É levantar-se na terça em vez de esperar pela próxima segunda.',
    cta: 'No VITALIS, não há "estragar a dieta". Há dias. É cada dia é novo.',
  },
  {
    hook: 'Se te comparas com a mulher da foto filtrada, já perdeste.',
    corpo: 'Aquela influencer tem ring light, 47 fotos para escolher uma, e provavelmente um cirurgião. O teu corpo carrega filhos, trabalho, vida real. Respeita-o.',
    cta: 'O VITALIS celebra O TEU progresso. Não o de ninguém.',
  },
  {
    hook: 'A última vez que alguém te perguntou "como te sentes?" foi quando?',
    corpo: 'Não o que queres comer. Não quanto pesas. Como TE SENTES. Porque se a resposta e "nem sei", o problema não é a comida. É desconexão.',
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
    corpo: 'Cuidas dos filhos. Do trabalho. Da casa. É de ti? Quem cuida? 2 minutos por dia para ti não é egoísmo. É manutenção.',
    cta: 'Experimenta o LUMINA. 2 minutos. Só para ti.',
  },
];

const CONTEUDO_PROVOCACAO = [
  {
    hook: 'A indústria das dietas ganha dinheiro cada vez que falhas.',
    corpo: 'Pensas que falhas por falta de disciplina? Nao. O modelo foi DESENHADO para falhares e voltares a comprar. Dieta restritiva → desistência → culpa → nova dieta. Repete.',
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
  const conteúdo = getConteudoByTema(tema, dayOfYear);

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
    provocacao: `*${hoje.hook}*\n\nVou dizer uma coisa que talvez ninguém te disse:\n\n${hoje.corpo}\n\nSe isto te tocou, não ignores.\n\n👉 ${linkLumina}\n\nE gratuito. 2 minutos. Começa por ti.`,

    // Voz pessoal (como se a Viv estivesse a falar)
    pessoal: `Ola querida 🤍\n\nHoje quero partilhar algo que me incomoda:\n\n_${hoje.hook}_\n\n${hoje.corpo}\n\nSe te identificas, responde a esta mensagem. Quero saber como te sentes.\n\nOu experimenta o diagnóstico gratuito:\n${linkLumina}`,

    // Urgencia real
    urgencia: `⚡ Pergunta honesta:\n\nHá quanto tempo dizes "vou começar na segunda"?\n\nSemanas? Meses? Anos?\n\nEnquanto esperas pelo "momento certo", o teu corpo continua a pedir ajuda.\n\nDeixa de esperar.\n\n2 minutos. Gratuito. Agora:\n${linkLumina}`,

    // Promo directa
    promo: `*Isto não é uma dieta. É o fim das dietas.* 💥\n\nO VITALIS é coaching nutricional REAL:\n\n🍽 Plano feito para TI (nao copiado da internet)\n📱 Coach IA que te responde as 3 da manhã\n💚 Espaço emocional para os dias difíceis\n📊 Dashboard que mostra o teu progresso real\n🇲🇿 Receitas com comida que encontras no mercado\n\nDesde 2.500 MT/mês\n7 dias de garantia (nao gostas = reembolso)\n\n👉 ${linkVitalis}`,

    // Testemunho cru
    testemunho: `*"Chorei quando vi os meus resultados."*\n\nNão porque perdi peso.\n\nMas porque pela primeira vez em anos, comi sem culpa.\n\nPassei a vida inteira a fazer dieta. A sentir-me falhada. O VITALIS não me deu uma lista de alimentos. Deu-me uma nova relação com a comida.\n\n_- Cliente VITALIS, Maputo_\n\nQueres saber como?\n👉 ${linkVitalis}`,

    // Lumina como anzol
    lumina: `Faz-te estas 7 perguntas:\n\n1. Como está a tua energia hoje?\n2. Onde sentes tensão no corpo?\n3. O que viste no espelho?\n4. Pensaste muito no passado?\n5. Preocupaste-te com o futuro?\n6. A tua mente está clara ou confusa?\n7. Sentes vontade de conexão ou isolamento?\n\nO LUMINA analisa as tuas respostas e revela padrões que não vias.\n\nGratuito. 2 minutos. 23 leituras possíveis.\n\n${linkLumina}`,

    // Status rápido (para WhatsApp Status)
    status: `_${hoje.hook}_\n\n${hoje.cta} 🌿\n\n${linkVitalis}`,

    // DM pessoal (para enviar a uma pessoa)
    dm: `Ola! 🤍\n\nEu sou a Vivianne e criei uma coisa que acho que te pode interessar.\n\nE um diagnóstico gratuito que te diz como estás REALMENTE - energia, emoção, corpo - em 2 minutos.\n\nNão é questionario chato. É uma leitura personalizada.\n\nExperimenta e diz-me o que achaste:\n${linkLumina}\n\nSe quiseres saber mais, estou aqui 🤍`,

    // Sequencia Stories WhatsApp (5 partes)
    storiesSeq: `📱 *SEQUENCIA DE 5 STATUS* (publica um de cada vez, de hora em hora):\n\n*Status 1 (9h):*\n_${hoje.hook}_\n\n*Status 2 (11h):*\n_${hoje.corpo}_\n\n*Status 3 (13h):*\n_Sabias que 80% das mulheres em Moçambique nunca receberam orientação nutricional personalizada?_\n\n*Status 4 (16h):*\n_${hoje.cta}\nExperimenta grátis: ${linkLumina}_\n\n*Status 5 (19h):*\n_Hoje já cuidaste de ti? Mesmo 2 minutos contam.\n${linkLumina}_`,

    // Audio script (para gravar nota de voz)
    audio: `🎙 *SCRIPT PARA NOTA DE VOZ* (grava e envia para contactos):\n\n"Ola querida, tudo bem contigo? Olha, queria partilhar uma coisa contigo.\n\nEu descobri uma ferramenta gratuita que faz um diagnóstico de como tu estas - energia, emoção, corpo - em 2 minutinhos. Chama-se Lumina.\n\nEu experimentei e fiquei impressionada com a leitura. Parecia que me conhecia.\n\nVou mandar-te o link, experimenta e depois diz-me o que achaste, ta?\n\n[envia o link logo a seguir]\n\n${linkLumina}"`,

    // Para grupos de mulheres
    grupo: `*Para todas as mulheres neste grupo* 💜\n\nVou ser directa: a maioria de nos nunca aprendeu a comer.\n\nAprendemos a fazer dieta. A contar calorias. A sentir culpa.\n\nMas ninguém nos ensinou a OUVIR o corpo.\n\nHoje quero partilhar algo que me mudou: um diagnóstico gratuito que analisa a tua energia, emoção e corpo em 2 minutos.\n\nNão vende nada. Não pede cartao. É so... um espelho.\n\n${linkLumina}\n\nExperimenta e partilha aqui o que achaste 🤍`,
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

    audioWhatsApp: `"Ola querida. Hoje quero partilhar algo importante contigo.\n\n${hoje.hook}\n\nPorque digo isto? Porque ${hoje.corpo.toLowerCase()}\n\nSe te identificas, experimenta o LUMINA - e gratuito e demora 2 minutinhos. Vou mandar-te o link."`,
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
      instagram: 'Algo esta errado.\n\nA maioria das mulheres que conheço está em guerra com o próprio corpo.\n\nE ninguém fala disto.\n\nEsta semana, vou mudar isso.\n\nActiva as notificações 🔔',
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
      instagram: '2 minutos que podem mudar a forma como tevês.\n\n7 perguntas.\n23 padrões.\n1 leitura que parece que te conhece.\n\nO LUMINA é gratuito. É diferente de tudo o que já experimentaste.\n\nLink na bio 🔮',
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
      whatsapp: '*"Não tenho dinheiro."*\n\n2.500 MT = menos que um café por dia.\nMenos que a comida processada que compras por mes.\nMenos que a próxima consulta quando a saúde piorar.\n\n*"Não tenho tempo."*\n\nO check-in diário demora 2 minutos.\nAs receitas são rápidas.\nA app esta no teu telemóvel.\n\n*"Já tentei tudo."*\n\nMas nunca tentaste algo que cuida da tua EMOÇÃO ao mesmo tempo que cuida da tua COMIDA.\n\nE isso que o VITALIS faz.\n\n7 dias de garantia. Sem risco.\n\n',
      instagram: '"Já tentei tudo."\n\nMas nunca tentaste algo que cuida da tua EMOÇÃO ao mesmo tempo.\n\n90% dos problemas com comida são emocionais.\n\nO VITALIS é o primeiro programa que trata os dois.\n\nLink na bio.',
      stories: 'Q&A: Responder as dúvidas mais comuns sobre o VITALIS',
    },
    {
      dia: 7,
      titulo: 'CTA FINAL - Agora ou Nunca',
      whatsapp: '*Hoje é o dia.*\n\nJá viste o problema.\nJá ouviste a minha história.\nJá experimentaste o LUMINA.\nJá leste os resultados reais.\n\nAgora só falta uma coisa: TU decidires.\n\nNão na próxima segunda. Agora.\n\nO VITALIS está aberto. 7 dias de garantia.\n\nDaqui a 3 meses, vais agradecer-te.\n\n👉 ',
      instagram: 'Deixa-me ser directa.\n\nSe chegaste até aqui, não é por acaso.\n\nSe algo dentro de ti ressoou esta semana, ouve isso.\n\nNão na próxima segunda. Agora.\n\nO link esta na bio. A decisão é tua.\n\nDaqui a 3 meses, vais agradecer-te. 🤍',
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
      titulo: '5 Mitos sobre Alimentacao',
      marca: 'vitalis',
      cor: '#7C8B6F',
      slides: [
        { titulo: '5 Mitos que Destroem a tua Saude', texto: 'Quantos destes já acreditaste?' },
        { titulo: 'Mito 1: Xima engorda', texto: 'Falso. O que importa é a porção e o acompanhamento. Xima é energia pura e barata.' },
        { titulo: 'Mito 2: Preciso de suplementos caros', texto: 'Feijão nhemba, ovo, amendoim. Proteina acessível no mercado do bairro.' },
        { titulo: 'Mito 3: Comer menos = emagrecer', texto: 'Quando comes de menos, o metabolismo abranda. Comer MELHOR é o segredo.' },
        { titulo: 'Mito 4: Salada todos os dias', texto: 'Comida saudável tem sabor. Caril de coco, piri-piri. Porcao certa = saúde.' },
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
        { titulo: 'Há uma saída. É não é mais uma dieta.', texto: 'VITALIS - Espaço de Retorno Emocional\napp.seteecos.com' },
      ],
      caption: 'Tens fome... ou algo dentro de ti precisa de atenção? 🤍\n\nDesliza e descobre os 4 sinais de fome emocional.\n\nPartilha com alguém que precisa de ouvir isto.\n\n#seteecos #vitalis #fomeemocional #saudeemocional #mulherforte #comerconsciente',
    },
    {
      id: 'porções-mãos',
      titulo: 'Guia de Porcoes com as Maos',
      marca: 'vitalis',
      cor: '#7C8B6F',
      slides: [
        { titulo: 'Esquece a balança. Usa as mãos.', texto: 'O guia mais simples para porções correctas.' },
        { titulo: 'Palma aberta = Proteina', texto: 'Frango, peixe, carne, ovo. Uma palma por refeição.' },
        { titulo: 'Punho fechado = Hidratos', texto: 'Xima, arroz, batata. Um punho por refeição. É suficiente.' },
        { titulo: 'Polegar = Gorduras', texto: 'Oleo, amendoim, abacate. Um polegar. Pouco mas essencial.' },
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
        { titulo: 'STRESS → Comes demais', texto: 'O corpo procura conforto rápido. Acucar. Hidratos. Comida processada.' },
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
        { titulo: 'Foste ensinada a dúvidar de ti.', texto: 'Pela escola. Pela TV. Pelas redes. Pelo espelho. Mas isso é uma mentira.' },
        { titulo: '7 semanas de reconexão.', texto: 'Exercícios, reflexões e ferramentas para reconstruir a relação contigo mesma.' },
        { titulo: 'O teu corpo é a tua casa. Não um projecto.', texto: 'Para de tentar arranja-lo. Começa a habita-lo.' },
        { titulo: 'AUREA: desde 975 MT/mês.', texto: 'app.seteecos.com/aurea' },
      ],
      caption: 'O teu valor não depende do que veste, pesas ou aparentas. 🤍\n\nO AUREA é um programa de 7 semanas para reconstruir a relação contigo mesma.\n\nPorque antes de mudar o corpo, precisas de mudar o olhar.\n\nLink na bio.\n\n#seteecos #aurea #autovalor #autoestima #mulherreal #empoderamento #moçambique',
    },
    {
      id: 'testemunhos-reais',
      titulo: 'Transformacoes Reais',
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
      caption: 'E se existisse um sistema que cuida de TI como um todo?\n\nNão só a comida. Não só o peso. TU - inteira.\n\nComida. Emoção. Corpo. Mente. Tudo está ligado.\n\nIsto é o SETE ECOS. É acabou de chegar a Maputo.\n\nSegue para acompanhar esta jornada 🤍\n\n#seteecos #transmutacaofeminina #mulhermocambicana #bemestar #saudeintegral #maputo',
    },
    {
      ordem: 2, dia: 'Dom 8', titulo: 'Quem é a Vivianne',
      template: 'testemunho', eco: 'seteEcos', formato: 'post',
      texto: 'Antes de criar o Sete Ecos, eu também estive em guerra com o meu corpo.',
      subtitulo: '- Vivianne, Fundadora',
      caption: 'Ola. Sou a Vivianne.\n\nAntes de criar o @seteecos, eu também estive em guerra com o meu corpo.\n\nJejuava por culpa. Comia escondida. Pesava-me todos os dias.\n\nAté que percebi: o problema nunca foi o meu corpo. Era a minha relação com ele.\n\nCriei o Sete Ecos para que nenhuma mulher tenha de passar pelo que eu passei. Sozinha.\n\nSe te identificas, segue esta pagina. 🤍\n\n#seteecos #historiapessoal #mulherreal #moçambique #comidaeemocao',
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
      caption: '80% dos problemas com comida são emocionais.\n\nNão é falta de disciplina. É dor.\n\nStress. Solidão. Frustracao. O corpo encontrou uma forma de se acalmar.\n\nE se em vez de castigo, o teu corpo recebesse compreensão?\n\nGuarda este post. 🤍\n\n#seteecos #fomeemocional #saudeemocional #estatistica #mulherforte #comerconsciente',
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
      caption: 'Quando foi a última vez que alguém te perguntou como te sentes REALMENTE?\n\nNão o que comes. Não quanto pesas. Como TE SENTES.\n\nO LUMINA faz-te 7 perguntas sobre energia, emoção e corpo. É revela padrões que não vias.\n\n🔮 Gratuito. 2 minutos. 23 leituras possíveis.\n\nLink na bio.\n\n#seteecos #lumina #diagnostico #autoconhecimento #saudeemocional #mulhermocambicana',
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
      texto: 'Se cozinhas para a família inteira e comes os restos em pé na cozinha, este post e para ti.',
      subtitulo: '@seteecos',
      caption: 'Se cozinhas para a família inteira e comes os restos em pé na cozinha, este post e para ti.\n\nTu também mereces sentar. Comer com calma. Ter um prato pensado para TI.\n\nA tua saúde importa tanto quanto a deles.\n\nPartilha com uma mulher que precisa de ouvir isto. 🤍\n\n#seteecos #mulhermocambicana #cuidadeti #maes #comidaconsciente #realidade',
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
      caption: 'Algo que estive a construir há muito tempo.\n\nUm programa que não te da uma lista e te deseja boa sorte.\n\n🍽 Plano alimentar com comida local (matapa, xima, feijão nhemba)\n🧠 Cuida da emoção ao mesmo tempo que da comida\n📱 Coach IA disponível 24h\n💚 Espaço para os dias difíceis\n\nChama-se VITALIS. Abre na próxima semana.\n\nQueres ser das primeiras? Experimenta o LUMINA (link na bio) 🌿\n\n#seteecos #vitalis #lancamento #coachingnutricional #embreve #mulhermocambicana',
    },
    {
      ordem: 12, dia: 'Sáb 14', titulo: 'Teaser Final',
      template: 'dica', eco: 'vitalis', formato: 'post',
      texto: 'Próxima semana, tudo muda.',
      subtitulo: 'VITALIS - Em breve',
      caption: 'Próxima semana, tudo muda.\n\nSe esta semana algo ressoou contigo...\nSe te identificaste com algum post...\nSe o LUMINA te surpreendeu...\n\nEntao estas pronta.\n\nActiva as notificações 🔔\n\n🌿\n\n#seteecos #vitalis #embreve #lancamento #transformacao #mulhermocambicana',
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
      targeting: 'Mulheres 25-55 | Maputo, Moçambique | Interesses: Saude, Bem-estar, Nutricao, Alimentacao saudável, Yoga, Meditação',
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
      targeting: 'Mulheres 25-55 | Maputo | Interesses: Dieta, Perda de peso, Saude mental, Corpo positivo',
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
      texto_primario: 'Dieta → Restrição → Desistencia → Culpa → Nova dieta.\n\nJá passaste por este ciclo?\n\nDescobre o que realmente está a acontecer em 2 minutos. Gratuito.',
      descricao: 'Diagnóstico gratuito | Sem compromisso',
      cta_botao: 'Descobre Agora',
      link: `${BASE_URL}/lumina?utm_source=facebook&utm_medium=ad&utm_campaign=dor-dietas-s1`,
      targeting: 'Mulheres 25-55 | Maputo | Interesses: Dieta, Emagrecimento, Receitas saudaveis, Fitness',
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
      targeting: 'Mulheres 25-55 | Maputo | Interesses: Transformacao pessoal, Saude, Bem-estar',
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
      stories: 'Video/foto pessoal: "Ola, sou a Vivianne e criei algo para nos mulheres."',
      whatsapp: {
        mensagem: `Ola querida 🤍\n\nQuero partilhar uma coisa contigo.\n\nCriei um projecto para mulheres que, como eu, já estiveram em guerra com o próprio corpo.\n\nNão é uma dieta. Não é um ginasio. É algo diferente.\n\nNos próximos dias vou contar-te mais.\n\nSe tens curiosidade, segue @seteecos no Instagram. Acabou de nascer. 🌿`,
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
        mensagem: `Bom dia 🤍\n\nSabias que podes medir porções só com as mãos?\n\n🤚 Palma = proteína\n✊ Punho = hidratos\n👍 Polegar = gordura\n🙌 Duas mãos = legumes\n\nSem balança. Sem stress. Experimenta hoje no almoco.\n\nGuia completo no Instagram: @seteecos`,
        imagem: { template: 'dica', eco: 'vitalis', formato: 'stories', texto: 'Esquece a balança. Usa as mãos.', subtitulo: 'Guia de porções no @seteecos' },
      },
      ads: 'ACTIVAR: Ad "Lumina Diagnóstico" + Ad "Hook Emocional". Começa com 300-500 MT/dia cada.',
      notas: 'DIA DE ACTIVAR ADS. Começa a investir. Publica carrossel de porções.',
    },
    {
      dia: 4, data: 'Quarta 11 Fev', titulo: 'LUMINA - O ANZOL',
      gridPosts: [7],
      stories: 'Grava ecra a fazer o LUMINA + reação ao resultado. Partilha nos stories.',
      whatsapp: {
        mensagem: `Tenho algo para ti 🔮\n\nCriei um diagnóstico gratuito que em 2 minutos te diz como REALMENTE estas.\n\n7 perguntas sobre energia, emoção e corpo.\n23 padrões possíveis.\nUma leitura só tua.\n\nChama-se LUMINA e é completamente grátis.\n\nExperimenta e diz-me o que achaste:\n${linkLumina}\n\nQuero saber a tua opiniao 🤍`,
        imagem: { template: 'cta', eco: 'lumina', formato: 'stories', texto: '2 minutos. 7 perguntas. O diagnóstico que ninguém te fez.', subtitulo: 'LUMINA - Experimenta grátis' },
      },
      ads: 'Manter ads. Verificar métricas (CTR, CPC).',
      notas: 'DIA CHAVE: primeiro push do Lumina. Envia para TODOS os contactos. Pede feedback.',
    },
    {
      dia: 5, data: 'Quinta 12 Fev', titulo: 'TESTEMUNHO',
      gridPosts: [8],
      stories: 'Partilha screenshots de respostas/reações ao Lumina.',
      whatsapp: {
        mensagem: `Ola 🤍\n\nOntem partilhei o LUMINA contigo.\n\nJá experimentaste? Se sim, o que achaste da leitura?\n\nSe ainda não, demora só 2 minutinhos:\n${linkLumina}\n\nQuero ouvir a tua experiencia! Responde-me 🌿`,
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
        mensagem: `Se cozinhas para a família inteira e comes os restos em pé na cozinha... esta mensagem e para ti.\n\nTu também mereces sentar, comer com calma, é ter um prato pensado para TI.\n\nA tua saúde importa tanto quanto a deles.\n\nAmanhã tenho uma surpresa para ti 🌿`,
        imagem: { template: 'dica', eco: 'seteEcos', formato: 'stories', texto: 'Se cozinhas para todos e comes os restos em pe... esta mensagem e para ti.', subtitulo: '@seteecos' },
      },
      ads: 'Pausar ad com pior CTR. Aumentar o melhor para 500-800 MT/dia.',
      notas: 'Conteúdo relatable. Pura empatia. Prepara terreno para amanhã.',
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
        mensagem: `*O VITALIS está ABERTO.* 🌿\n\nDepois de meses a construir, finalmente está aqui.\n\nCoaching nutricional que cuida de TI - comida E emoção.\n\n🍽 Plano alimentar personalizado (com comida moçambicana)\n📱 Coach IA disponível 24h\n💚 Espaço emocional para dias difíceis\n📊 Dashboard com o teu progresso\n🎯 Desafios semanais\n📖 Receitas com ingredientes locais\n\nDesde 2.500 MT/mês. 7 dias de garantia.\n\nInscreve-te agora:\n${linkVitalis}\n\nPara as primeiras 10: surpresa especial 🤍`,
        imagem: { template: 'cta', eco: 'vitalis', formato: 'stories', texto: 'VITALIS está ABERTO.', subtitulo: 'Coaching Nutricional | Desde 2.500 MT/mês' },
      },
      ads: 'Adicionar Ad "Testemunho". Retarget: quem visitou Lumina mas não converteu.',
      notas: 'DIA DE LANCAMENTO! Publica post de lançamento. Envia WA a todos. Stories o dia todo.',
    },
    {
      dia: 9, data: 'Segunda 16 Fev', titulo: 'DEEP DIVE',
      stories: 'Tour guiado pela app: mostra dashboard, check-in, receitas, chat.',
      whatsapp: {
        mensagem: `Bom dia 🤍\n\nOntem lancei o VITALIS é a reação foi incrível.\n\nHoje quero mostrar-te POR DENTRO o que recebes:\n\n✅ Plano alimentar feito para ti (nao copiado da internet)\n✅ Receitas com matapa, xima, feijão nhemba, caril de amendoim\n✅ Check-in diário (agua, sono, refeições, exercício)\n✅ Coach IA que responde as 3 da manhã sem julgamento\n✅ Espaço emocional para quando recaís\n✅ Desafios semanais que te mantem motivada\n\n7 dias de garantia. Se não gostares, devolvemos.\n\n${linkVitalis}`,
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
        mensagem: `Sei que talvez estejas a pensar:\n\n*"Não tenho dinheiro."*\n2.500 MT = menos que 1 café por dia. Menos que comida processada por mes.\n\n*"Não tenho tempo."*\nCheck-in: 2 min. Receitas: rápidas. App no telemóvel.\n\n*"Já tentei tudo."*\nMas nunca tentaste algo que cuida da emoção ao mesmo tempo.\n\n*"E se não gostar?"*\n7 dias de garantia. Sem risco.\n\nSe alguma destas era a tua dúvida, já tens a resposta.\n\n${linkVitalis} 🌿`,
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
      notas: 'Vulnerabilidade e autenticidade. Mostra que es humana.',
    },
    {
      dia: 13, data: 'Sexta 20 Fev', titulo: 'URGÊNCIA',
      stories: 'Countdown: "Vagas limitadas esta semana!" + Screenshots de quem entrou.',
      whatsapp: {
        mensagem: `⚡ Pergunta honesta:\n\nHá quanto tempo dizes "vou começar na segunda"?\n\nSemanas? Meses? Anos?\n\nDaqui a 3 meses vais estar exactamente onde estás agora. Ou pior.\n\nO VITALIS está aberto AGORA. 7 dias de garantia.\n\nO único risco e não tentares.\n\n${linkVitalis}\n\nA decisão é tua. Mas o corpo não espera. 🌿`,
        imagem: { template: 'cta', eco: 'vitalis', formato: 'stories', texto: 'Daqui a 3 meses, vais agradecer-te.', subtitulo: 'VITALIS - Começa agora' },
      },
      ads: 'Aumentar orçamento nos 2 melhores ads. Adicionar urgência ao copy.',
      notas: 'Urgencia real. Não manipulação. O corpo realmente não espera.',
    },
    {
      dia: 14, data: 'Sábado 21 Fev', titulo: 'ENCERRAR SEMANA',
      stories: 'Resumo da semana. Agradecimento. Resultados até agora.',
      whatsapp: {
        mensagem: `Esta semana foi especial 🤍\n\nLançámos o VITALIS é a resposta superou tudo.\n\nSe ainda não entraste, esta e a tua última oportunidade esta semana.\n\nLembra-te: 7 dias de garantia. Sem risco.\n\n🍽 Plano alimentar personalizado\n📱 Coach IA 24h\n💚 Espaço emocional\n📊 Dashboard de progresso\n\nDesde 2.500 MT/mês.\n\n${linkVitalis}\n\nDaqui a 3 meses, vais agradecer-te. 🌿`,
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
    { dia: 0, assunto: 'Bem-vinda - A tua jornada começa aqui', tipo: 'boas-vindas', preview: 'Não é mais uma newsletter. É um espelho.' },
    { dia: 3, assunto: '2 minutos que te podem surpreender', tipo: 'convite-lumina', preview: 'O diagnóstico que ninguém te fez.' },
    { dia: 7, assunto: 'Porque falhas nas dietas (não é o que pensas)', tipo: 'valor-provocação', preview: 'A indústria ganhou. Tu perdeste. Até agora.' },
    { dia: 14, assunto: 'Resultado: -8kg sem passar fome', tipo: 'testemunho-vitalis', preview: 'História real de uma mulher como tu.' },
    { dia: 21, assunto: 'A pergunta que ninguém te faz', tipo: 'emocional-profundo', preview: 'Como te sentes? Não o que comes. Como TE SENTES.' },
    { dia: 30, assunto: 'Já passou um mes. É agora?', tipo: 'urgência-final', preview: 'O tempo não espera. O teu corpo não espera.' },
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
