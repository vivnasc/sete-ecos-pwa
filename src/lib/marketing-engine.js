/**
 * Marketing Engine v2 - Motor de conteudo AUDACIOSO
 *
 * Principios:
 * - Provocar, nao informar. Cada frase deve fazer parar o scroll.
 * - Falar como humana (Vivianne), nao como marca corporativa.
 * - Tocar na dor REAL: culpa, solidao, dietas falhadas, pressao social.
 * - Culturalmente ancorado em Mocambique: xima, matapa, calor, realidade local.
 * - Cada peca tem um HOOK (primeiros 3 segundos) e um CTA claro.
 */

import { buildUTMUrl, UTM_TEMPLATES } from '../utils/utm';

const BASE_URL = 'https://app.seteecos.com';

// ============================================================
// HOOKS - Frases que param o scroll (primeiros 3 segundos)
// ============================================================

const HOOKS_PROVOCADORES = [
  'As dietas que te vendem estao a destruir o teu metabolismo.',
  'Tens fome ou tens medo?',
  'O problema nao e o que comes. E o que te come por dentro.',
  'Ninguem te ensinou a comer. Ensinaram-te a ter medo de comer.',
  'Se a dieta funcionasse, nao precisavas de outra a cada 3 meses.',
  'O teu corpo nao e o inimigo. A tua relacao com ele e que esta.',
  'A maioria das mulheres come por ansiedade e chama isso de "falta de forca de vontade".',
  'Perder peso e facil. Manter e que ninguem te ensina.',
  'Estou farta de ver mulheres a pedir desculpa por comer.',
  'A balanca nao mede o teu valor. Nem a tua saude.',
  'A culpa que sentes depois de comer engorda mais que a refeicao.',
  'Acordas cansada? Nao e preguica. E o teu corpo a gritar.',
  'Comer em segredo. Ja fizeste isso? Eu tambem.',
  'Quantas dietas ja comecaste numa Segunda-feira?',
  'O teu corpo nao precisa de castigo. Precisa de compreensao.',
];

// ============================================================
// CONTEUDO POR CATEGORIA - Provocador e emocional
// ============================================================

const CONTEUDO_CORPO = [
  {
    hook: 'A matapa que a tua avo fazia e mais saudavel que qualquer suplemento importado.',
    corpo: 'Ferro, vitaminas, proteina vegetal. Tudo na comida que ja conheces. Nao precisas de comprar nada caro. Precisas de voltar ao que e teu.',
    cta: 'O VITALIS ensina-te a usar o que ja tens.',
  },
  {
    hook: 'Xima nao engorda. O que engorda e a falta de equilibrio no prato.',
    corpo: 'Ouviste a vida inteira que hidratos sao maus. Mentira. O teu corpo precisa deles. O segredo e o tamanho da porcao e o que metes ao lado. Mao aberta = porcao certa.',
    cta: 'No VITALIS, aprendes a medir com as maos. Sem balanca, sem stress.',
  },
  {
    hook: 'Beber 2 litros de agua em Maputo nao e conselho. E sobrevivencia.',
    corpo: 'Com este calor, o teu corpo perde mais agua do que imaginas. A desidratacao disfarsa-se de fome. Antes de comer, bebe. Depois decide.',
    cta: 'O VITALIS rastreia a tua agua, sono e energia todos os dias.',
  },
  {
    hook: 'Se cozinhas para a familia inteira e comes os restos em pe na cozinha, este post e para ti.',
    corpo: 'Tu tambem mereces sentar, comer com calma, e ter um prato pensado para TI. Nao so para o marido e as criancas. A tua saude importa tanto quanto a deles.',
    cta: 'VITALIS: um plano alimentar que e SO teu.',
  },
  {
    hook: 'A proteina mais barata de Mocambique? Feijao nhemba.',
    corpo: 'Esquece a whey protein de 3000 MT. Feijao nhemba, amendoim, ovo cozido. Comida real, local, acessivel. A ciencia confirma o que as avos ja sabiam.',
    cta: 'Receitas com ingredientes que encontras no mercado do bairro.',
  },
  {
    hook: 'Jejum intermitente nao e passar fome. E dar ao teu corpo tempo para se curar.',
    corpo: 'Mas tambem nao e para toda a gente. Se tens historico de compulsao, pode ser perigoso. Nao copies o que viste no TikTok. Precisa de orientacao.',
    cta: 'No VITALIS, o jejum e acompanhado e personalizado.',
  },
  {
    hook: 'Comer salada todos os dias nao e saudavel. E aborrecido.',
    corpo: 'Comida saudavel nao tem de ser sem sabor. Caril de coco com legumes. Frango grelhado com piri-piri. Banana frita como snack. O segredo e porcao, nao privacao.',
    cta: 'Receitas que sabem bem e fazem bem. So no VITALIS.',
  },
  {
    hook: 'Dormes 5 horas e depois perguntas porque nao emagreces?',
    corpo: 'O sono regula as hormonas da fome. Se dormes mal, o corpo pede acucar para compensar. Nao e falta de disciplina. E falta de descanso.',
    cta: 'O VITALIS rastreia sono, stress e alimentacao juntos.',
  },
];

const CONTEUDO_EMOCIONAL = [
  {
    hook: 'A comida nao e o problema. E a anestesia.',
    corpo: 'Quando comes sem fome, nao e gula. E dor. Solidao, stress, frustracao. O corpo encontrou uma forma de se acalmar. Nao precisa de castigo. Precisa de outra saida.',
    cta: 'O Espaco de Retorno do VITALIS foi criado para esses momentos.',
  },
  {
    hook: 'Recaiste? Bem-vinda ao clube de quem e humana.',
    corpo: 'A diferenca entre quem transforma o corpo e quem desiste nao e nunca falhar. E levantar-se na terça em vez de esperar pela proxima segunda.',
    cta: 'No VITALIS, nao ha "estragar a dieta". Ha dias. E cada dia e novo.',
  },
  {
    hook: 'Se te comparas com a mulher da foto filtrada, ja perdeste.',
    corpo: 'Aquela influencer tem ring light, 47 fotos para escolher uma, e provavelmente um cirurgiao. O teu corpo carrega filhos, trabalho, vida real. Respeita-o.',
    cta: 'O VITALIS celebra O TEU progresso. Nao o de ninguem.',
  },
  {
    hook: 'A ultima vez que alguem te perguntou "como te sentes?" foi quando?',
    corpo: 'Nao o que queres comer. Nao quanto pesas. Como TE SENTES. Porque se a resposta e "nem sei", o problema nao e a comida. E desconexao.',
    cta: 'O LUMINA faz-te essa pergunta todos os dias. Em 2 minutos.',
  },
  {
    hook: 'Comes escondida? Nao e vergonha. E um sinal.',
    corpo: 'Comer as escondidas e o corpo a tentar satisfazer uma necessidade emocional em segredo. Enquanto a julgares, ela vai continuar. Quando a ouvires, ela pode parar.',
    cta: 'Espaco de Retorno: o unico sitio na app onde ninguem te julga.',
  },
  {
    hook: 'Nao e sobre emagrecer. E sobre parar de sofrer com a comida.',
    corpo: 'Pesar menos e um efeito colateral de viver melhor. Se o unico objectivo e o numero na balanca, vais voltar ao mesmo sitio. Se o objectivo e paz, tudo muda.',
    cta: 'O VITALIS nao e uma dieta. E uma mudanca de relacao.',
  },
  {
    hook: 'Dis-me: ha quanto tempo nao fazes nada so para ti?',
    corpo: 'Cuidas dos filhos. Do trabalho. Da casa. E de ti? Quem cuida? 2 minutos por dia para ti nao e egoismo. E manutencao.',
    cta: 'Experimenta o LUMINA. 2 minutos. So para ti.',
  },
];

const CONTEUDO_PROVOCACAO = [
  {
    hook: 'A industria das dietas ganha dinheiro cada vez que falhas.',
    corpo: 'Pensas que falhas por falta de disciplina? Nao. O modelo foi DESENHADO para falhares e voltares a comprar. Dieta restritiva → desistencia → culpa → nova dieta. Repete.',
    cta: 'O VITALIS quebra o ciclo. Sem restricao. Com ciencia.',
  },
  {
    hook: 'Se a tua nutricionista te deu uma folha A4 e te desejou boa sorte, nao foi acompanhamento.',
    corpo: 'Acompanhamento real e alguem que te pergunta como estiveste no sabado a noite. Que te ajuda quando recais. Que esta la todos os dias, nao so na consulta.',
    cta: 'VITALIS: coach IA disponivel 24h. Todos os dias.',
  },
  {
    hook: 'O teu valor nao cabe numa calca tamanho S.',
    corpo: 'Foste ensinada a acreditar que so mereces respeito se fores magra. Que so es bonita se a roupa for pequena. Isso e uma mentira que te venderam. O teu corpo nao e um projecto. E a tua casa.',
    cta: 'AUREA: o programa que te ensina a morar bem em ti mesma.',
  },
  {
    hook: '7 perguntas. 23 padroes. O diagnostico que ninguem te fez.',
    corpo: 'O medico mede a tensao. A nutricionista mede o peso. Quem mede como TE SENTES? Energia, tensao no corpo, clareza mental, desejo de conexao. Isto importa.',
    cta: 'LUMINA: gratuito. 2 minutos. Resultados que te vao surpreender.',
  },
  {
    hook: 'Se nao fizeres nada, daqui a 6 meses vais estar exactamente onde estas agora.',
    corpo: 'Ou pior. Porque o corpo nao espera. O metabolismo nao espera. O unico momento que tens controlo e AGORA. Nao amanha. Nao na proxima segunda.',
    cta: 'Comeca gratis pelo LUMINA. Leva 2 minutos.',
  },
  {
    hook: 'Investir 2.500 MT na tua saude e "caro". Mas o hospital e gratis, ne?',
    corpo: 'Prevenir custa menos que tratar. 2.500 MT/mes e menos que o que gastas em comida processada. A diferenca e que um te destroi e o outro te transforma.',
    cta: 'VITALIS: desde 2.500 MT. Garantia de 7 dias.',
  },
];

// Juntar tudo num pool unico rotativo
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
  0: { tema: 'emocional', titulo: 'Reflexao de Domingo', formato: 'carrossel', tipo: 'empatia' },
  1: { tema: 'provocacao', titulo: 'Verdade Incomoda', formato: 'reel', tipo: 'desafio' },
  2: { tema: 'corpo', titulo: 'Mito vs Realidade', formato: 'carrossel', tipo: 'educacao' },
  3: { tema: 'emocional', titulo: 'Historia Real', formato: 'stories', tipo: 'testemunho' },
  4: { tema: 'provocacao', titulo: 'Pergunta que Doi', formato: 'reel', tipo: 'provocacao' },
  5: { tema: 'corpo', titulo: 'Receita + Dica', formato: 'reel', tipo: 'valor' },
  6: { tema: 'emocional', titulo: 'Carta para Ti', formato: 'post', tipo: 'conexao' },
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
    diaSemana: ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'][dayOfWeek],
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
    provocacao: `*${hoje.hook}*\n\nVou dizer uma coisa que talvez ninguem te disse:\n\n${hoje.corpo}\n\nSe isto te tocou, nao ignores.\n\n👉 ${linkLumina}\n\nE gratuito. 2 minutos. Comeca por ti.`,

    // Voz pessoal (como se a Viv estivesse a falar)
    pessoal: `Ola querida 🤍\n\nHoje quero partilhar algo que me incomoda:\n\n_${hoje.hook}_\n\n${hoje.corpo}\n\nSe te identificas, responde a esta mensagem. Quero saber como te sentes.\n\nOu experimenta o diagnostico gratuito:\n${linkLumina}`,

    // Urgencia real
    urgencia: `⚡ Pergunta honesta:\n\nHa quanto tempo dizes "vou comecar na segunda"?\n\nSemanas? Meses? Anos?\n\nEnquanto esperas pelo "momento certo", o teu corpo continua a pedir ajuda.\n\nDeixa de esperar.\n\n2 minutos. Gratuito. Agora:\n${linkLumina}`,

    // Promo directa
    promo: `*Isto nao e uma dieta. E o fim das dietas.* 💥\n\nO VITALIS e coaching nutricional REAL:\n\n🍽 Plano feito para TI (nao copiado da internet)\n📱 Coach IA que te responde as 3 da manha\n💚 Espaco emocional para os dias dificeis\n📊 Dashboard que mostra o teu progresso real\n🇲🇿 Receitas com comida que encontras no mercado\n\nDesde 2.500 MT/mes\n7 dias de garantia (nao gostas = reembolso)\n\n👉 ${linkVitalis}`,

    // Testemunho cru
    testemunho: `*"Chorei quando vi os meus resultados."*\n\nNao porque perdi peso.\n\nMas porque pela primeira vez em anos, comi sem culpa.\n\nPassei a vida inteira a fazer dieta. A sentir-me falhada. O VITALIS nao me deu uma lista de alimentos. Deu-me uma nova relacao com a comida.\n\n_- Cliente VITALIS, Maputo_\n\nQueres saber como?\n👉 ${linkVitalis}`,

    // Lumina como anzol
    lumina: `Faz-te estas 7 perguntas:\n\n1. Como esta a tua energia hoje?\n2. Onde sentes tensao no corpo?\n3. O que viste no espelho?\n4. Pensaste muito no passado?\n5. Preocupaste-te com o futuro?\n6. A tua mente esta clara ou confusa?\n7. Sentes vontade de conexao ou isolamento?\n\nO LUMINA analisa as tuas respostas e revela padroes que nao vias.\n\nGratuito. 2 minutos. 23 leituras possiveis.\n\n${linkLumina}`,

    // Status rapido (para WhatsApp Status)
    status: `_${hoje.hook}_\n\n${hoje.cta} 🌿\n\n${linkVitalis}`,

    // DM pessoal (para enviar a uma pessoa)
    dm: `Ola! 🤍\n\nEu sou a Vivianne e criei uma coisa que acho que te pode interessar.\n\nE um diagnostico gratuito que te diz como estas REALMENTE - energia, emocao, corpo - em 2 minutos.\n\nNao e questionario chato. E uma leitura personalizada.\n\nExperimenta e diz-me o que achaste:\n${linkLumina}\n\nSe quiseres saber mais, estou aqui 🤍`,

    // Sequencia Stories WhatsApp (5 partes)
    storiesSeq: `📱 *SEQUENCIA DE 5 STATUS* (publica um de cada vez, de hora em hora):\n\n*Status 1 (9h):*\n_${hoje.hook}_\n\n*Status 2 (11h):*\n_${hoje.corpo}_\n\n*Status 3 (13h):*\n_Sabias que 80% das mulheres em Mocambique nunca receberam orientacao nutricional personalizada?_\n\n*Status 4 (16h):*\n_${hoje.cta}\nExperimenta gratis: ${linkLumina}_\n\n*Status 5 (19h):*\n_Hoje ja cuidaste de ti? Mesmo 2 minutos contam.\n${linkLumina}_`,

    // Audio script (para gravar nota de voz)
    audio: `🎙 *SCRIPT PARA NOTA DE VOZ* (grava e envia para contactos):\n\n"Ola querida, tudo bem contigo? Olha, queria partilhar uma coisa contigo.\n\nEu descobri uma ferramenta gratuita que faz um diagnostico de como tu estas - energia, emocao, corpo - em 2 minutinhos. Chama-se Lumina.\n\nEu experimentei e fiquei impressionada com a leitura. Parecia que me conhecia.\n\nVou mandar-te o link, experimenta e depois diz-me o que achaste, ta?\n\n[envia o link logo a seguir]\n\n${linkLumina}"`,

    // Para grupos de mulheres
    grupo: `*Para todas as mulheres neste grupo* 💜\n\nVou ser directa: a maioria de nos nunca aprendeu a comer.\n\nAprendemos a fazer dieta. A contar calorias. A sentir culpa.\n\nMas ninguem nos ensinou a OUVIR o corpo.\n\nHoje quero partilhar algo que me mudou: um diagnostico gratuito que analisa a tua energia, emocao e corpo em 2 minutos.\n\nNao vende nada. Nao pede cartao. E so... um espelho.\n\n${linkLumina}\n\nExperimenta e partilha aqui o que achaste 🤍`,
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

    reel: `${hoje.hook} 🔥\n\n${hoje.corpo}\n\nGuarda isto. Partilha com alguem que precisa de ouvir.\n\n${hashtagStr}`,

    carrossel: `SLIDE 1 (CAPA): ${hoje.hook}\n\nSLIDE 2: ${hoje.corpo.split('.').slice(0, 2).join('.')}\n\nSLIDE 3: ${hoje.corpo.split('.').slice(2).join('.')}\n\nSLIDE 4: ${hoje.cta}\n\nSLIDE 5 (FINAL): Experimenta o LUMINA - diagnostico gratuito em 2 min. Link na bio.\n\n---\n\nCAPTION:\n${hoje.hook}\n\nDesliza para a verdade que ninguem te conta 👉\n\n${hashtagStr}`,

    stories: `📱 *SEQUENCIA DE 5 STORIES:*\n\n*Story 1:* Poll - "${hoje.hook}" (SIM / NAO)\n\n*Story 2:* Texto sobre fundo de cor:\n"${hoje.corpo.split('.')[0]}"\n\n*Story 3:* Slider - "Quanto te identificas? 0-100%"\n\n*Story 4:* "${hoje.cta}"\n\n*Story 5:* Swipe up / Link - LUMINA gratuito`,

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

    storiesVoz: `[Fundo simples, face visivel]\n\n"Vou dizer uma coisa que talvez ninguem te disse..."\n\n[Pausa]\n\n"${hoje.hook}"\n\n[Proximo story]\n\n"Se isto te tocou, ha uma ferramenta gratuita que te pode ajudar. Chama-se LUMINA. Link em cima."`,

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
      whatsapp: '*Vou dizer algo que me incomoda ha muito tempo.*\n\nA maioria das mulheres que conheco esta em guerra com o proprio corpo.\n\nDietas. Culpa. Restricao. Mais culpa.\n\nE ninguem fala disto.\n\nNos proximos 7 dias, vou partilhar algo que pode mudar isso. Fica atenta.',
      instagram: 'Algo esta errado.\n\nA maioria das mulheres que conheco esta em guerra com o proprio corpo.\n\nE ninguem fala disto.\n\nEsta semana, vou mudar isso.\n\nActiva as notificacoes 🔔',
      stories: 'Poll: "Ja fizeste uma dieta que nao funcionou?" SIM/NAO',
    },
    {
      dia: 2,
      titulo: 'EDUCACAO - O Mito',
      whatsapp: '*Mentira #1 que te venderam:*\n\n"Se comeres menos, emagreces."\n\nFalso.\n\nQuando comes de menos, o metabolismo ABRANDA. O corpo entra em modo de sobrevivencia. Quando voltas a comer normal, ganhas tudo de volta. E mais.\n\nNao e falta de disciplina. E biologia.\n\nAmanha conto-te o que realmente funciona.',
      instagram: 'MENTIRA #1 que te venderam sobre emagrecer.\n\n"Come menos." ❌\n\nA verdade? Quando comes de menos, o metabolismo abranda.\n\nO corpo nao e estupido. Protege-se.\n\nDesliza para entender o que realmente acontece 👉',
      stories: 'Caixa de perguntas: "Qual a dieta mais absurda que ja fizeste?"',
    },
    {
      dia: 3,
      titulo: 'VULNERABILIDADE - A Vivianne',
      whatsapp: 'Hoje quero ser honesta contigo.\n\nAntes de criar o Sete Ecos, eu tambem lutava com a comida.\n\nJejuava por culpa. Comia escondida. Pesava-me todos os dias.\n\nAte que percebi: o problema nunca foi o meu corpo. Era a minha relacao com ele.\n\nFoi isso que me levou a criar algo diferente.\n\nAmanha mostro-te o que.',
      instagram: 'Historia que nunca contei.\n\nAntes de criar o @seteecos, eu tambem estive em guerra com o meu corpo.\n\nJejuava por culpa. Comia escondida. Pesava-me todos os dias.\n\nAte que percebi algo que mudou tudo...\n\n(continua nos comentarios)',
      stories: 'Video pessoal: "Hoje vou ser vulneravel convosco..."',
    },
    {
      dia: 4,
      titulo: 'REVELACAO - O LUMINA',
      whatsapp: '*E se te dissesse que em 2 minutos podes descobrir padroes que nunca viste em ti?*\n\n7 perguntas sobre energia, emocao e corpo.\n23 leituras possiveis.\n1 espelho digital.\n\nChama-se LUMINA. E gratuito.\n\nExperimenta agora e diz-me o que achaste:\n',
      instagram: '2 minutos que podem mudar a forma como te ves.\n\n7 perguntas.\n23 padroes.\n1 leitura que parece que te conhece.\n\nO LUMINA e gratuito. E diferente de tudo o que ja experimentaste.\n\nLink na bio 🔮',
      stories: 'Countdown: "LUMINA - Diagnostico gratuito" + Swipe up',
    },
    {
      dia: 5,
      titulo: 'PROVA SOCIAL - Resultados',
      whatsapp: '*Isto e o que acontece quando paras de fazer dieta e comecas a OUVIR o teu corpo:*\n\n"Perdi 8kg mas o melhor foi parar de chorar depois de comer." - M.J.\n\n"A minha filha disse que estou diferente. Nao mais magra. Mais feliz." - A.B.\n\n"Pela primeira vez nao desisti ao 3o dia." - S.C.\n\nO VITALIS nao e uma dieta. E o fim das dietas.\n\n',
      instagram: 'Resultados reais. Sem filtro.\n\n"Perdi 8kg mas o melhor foi parar de chorar depois de comer."\n\n"A minha filha disse que estou diferente. Nao mais magra. Mais feliz."\n\nIsto e possivel para ti tambem.\n\nLink na bio.',
      stories: 'Screenshots de mensagens de clientes (com permissao) + reaccoes',
    },
    {
      dia: 6,
      titulo: 'OBJECOES - Porque nao',
      whatsapp: '*"Nao tenho dinheiro."*\n\n2.500 MT = menos que um cafe por dia.\nMenos que a comida processada que compras por mes.\nMenos que a proxima consulta quando a saude piorar.\n\n*"Nao tenho tempo."*\n\nO check-in diario demora 2 minutos.\nAs receitas sao rapidas.\nA app esta no teu telemovel.\n\n*"Ja tentei tudo."*\n\nMas nunca tentaste algo que cuida da tua EMOCAO ao mesmo tempo que cuida da tua COMIDA.\n\nE isso que o VITALIS faz.\n\n7 dias de garantia. Sem risco.\n\n',
      instagram: '"Ja tentei tudo."\n\nMas nunca tentaste algo que cuida da tua EMOCAO ao mesmo tempo.\n\n90% dos problemas com comida sao emocionais.\n\nO VITALIS e o primeiro programa que trata os dois.\n\nLink na bio.',
      stories: 'Q&A: Responder as duvidas mais comuns sobre o VITALIS',
    },
    {
      dia: 7,
      titulo: 'CTA FINAL - Agora ou Nunca',
      whatsapp: '*Hoje e o dia.*\n\nJa viste o problema.\nJa ouviste a minha historia.\nJa experimentaste o LUMINA.\nJa leste os resultados reais.\n\nAgora so falta uma coisa: TU decidires.\n\nNao na proxima segunda. Agora.\n\nO VITALIS esta aberto. 7 dias de garantia.\n\nDaqui a 3 meses, vais agradecer-te.\n\n👉 ',
      instagram: 'Deixa-me ser directa.\n\nSe chegaste ate aqui, nao e por acaso.\n\nSe algo dentro de ti ressoou esta semana, ouve isso.\n\nNao na proxima segunda. Agora.\n\nO link esta na bio. A decisao e tua.\n\nDaqui a 3 meses, vais agradecer-te. 🤍',
      stories: 'Countdown final + Swipe up + "Hoje e o dia"',
    },
  ];
}

// ============================================================
// EMAIL SEQUENCES & UTM LINKS (mantidos por compatibilidade)
// ============================================================

export function getEmailSequencia(diasDesdeRegisto) {
  const sequencia = [
    { dia: 0, assunto: 'Bem-vinda - A tua jornada comeca aqui', tipo: 'boas-vindas', preview: 'Nao e mais uma newsletter. E um espelho.' },
    { dia: 3, assunto: '2 minutos que te podem surpreender', tipo: 'convite-lumina', preview: 'O diagnostico que ninguem te fez.' },
    { dia: 7, assunto: 'Porque falhas nas dietas (nao e o que pensas)', tipo: 'valor-provocacao', preview: 'A industria ganhou. Tu perdeste. Ate agora.' },
    { dia: 14, assunto: 'Resultado: -8kg sem passar fome', tipo: 'testemunho-vitalis', preview: 'Historia real de uma mulher como tu.' },
    { dia: 21, assunto: 'A pergunta que ninguem te faz', tipo: 'emocional-profundo', preview: 'Como te sentes? Nao o que comes. Como TE SENTES.' },
    { dia: 30, assunto: 'Ja passou um mes. E agora?', tipo: 'urgencia-final', preview: 'O tempo nao espera. O teu corpo nao espera.' },
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
