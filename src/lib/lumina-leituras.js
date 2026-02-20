// ============================================================
// LUMINA - SISTEMA DE LEITURAS (23 PADRÕES)
// Sete Ecos © Vivianne dos Santos
// ============================================================

import { LEITURAS_I18N } from './i18n/lumina-leituras.js';

export const LEITURAS = {
  // CRÍTICOS (3 padrões de alerta máximo)
  crit_vid: [
    "Pára. Não é altura de decidir nada. Estás vazia, não te vês, e queres resolver. Protege-te de ti mesma. Espera até amanhã.",
    "Energia zero, espelho partido, e a querer agir. Não. Hoje não decides nada. Amanhã vês mais claro.",
    "Estás a funcionar no vazio e a forçar. Pára antes de te magoares com uma decisão que não é tua."
  ],
  crit_pfm: [
    "O passado puxa, o futuro assusta, a mente gira. Pára. Respira. Não tens de resolver nada disto agora. Só respirar.",
    "Estás presa entre o que foi e o que pode ser, e a cabeça não pára. Sai daí. Literalmente. Muda de divisão. Bebe água. Respira.",
    "Muito peso, muita projecção. Não vais resolver isto a pensar. Pára. Escreve três linhas. Depois larga."
  ],
  crit_tba: [
    "Corpo tenso, energia em baixo, não te vês ao espelho. Dia difícil. Não tomes decisões importantes hoje. Cuida só do básico.",
    "O corpo está a gritar, a energia sumiu, e perdeste-te de vista. Hoje é dia de mínimos. Água. Descanso. Nada mais.",
    "Estás a operar no limite. Não é fraqueza – é sinal. Hoje fazes só o essencial. O resto espera."
  ],

  // MÁXIMOS (2 padrões de força total)
  forcaMax: [
    "Isto é o teu melhor. Energia cheia, corpo solto, mente clara, e vês-te bem. O que fizeres agora vai ter raiz profunda. Usa este momento.",
    "Alinhamento raro. Estás presente, forte, e lúcida. Não desperdices isto em tarefas pequenas. Faz o que importa.",
    "Dia de ouro. Tudo está no sítio. Age. Cria. Decide. Hoje tens apoio interno total."
  ],
  presencaRara: [
    "Momento raro: quase tudo alinhado. Presença real. Usa isto. Está aqui. O que fizeres agora tem peso.",
    "Estás aqui. Toda. Isso é raro. Não desperdices. Faz uma coisa importante. Agora.",
    "Presença quase total. Não deixes escapar. Este é o momento de agir, criar, ou simplesmente ser – completamente."
  ],

  // ALERTAS (8 padrões de atenção)
  esgotamento: [
    "Estás cansada e a querer resolver. Pára. Não decidas nada hoje. Deita-te 10 minutos antes de fazer o que quer que seja.",
    "A energia está em baixo mas o impulso quer agir. Cuidado. Decisões tomadas em vazio raramente são boas. Espera.",
    "Pouca energia, muita vontade de fazer. Essa combinação engana. Descansa primeiro. A clareza vem depois."
  ],
  dissociacao: [
    "Não te estás a ver bem e a energia está em baixo. Afasta-te do espelho hoje. Não te julgues. Não é verdade o que estás a ver.",
    "Estás desligada de ti. Isso acontece. Não forces conexão. Faz uma coisa sensorial: duche quente, chá, música. Volta ao corpo.",
    "O espelho hoje mente. E tu não tens energia para o confrontar. Deixa estar. Amanhã vês diferente."
  ],
  passadoComanda: [
    "O passado está a comandar o presente. A mente não pára de revisitar. Pára o ciclo. Escreve o que te pesa numa folha. Depois fecha a folha.",
    "Estás presa no que já foi. A ruminação não resolve – alimenta. Muda de cenário. Faz uma tarefa física. Quebra o loop.",
    "O ontem não larga. E a cabeça não ajuda. Não vais resolver isto a pensar. Movimento, água, ar. Depois vês."
  ],
  falsaClareza: [
    "A mente parece clara mas o corpo está fechado. Cuidado com decisões que parecem certas mas não têm raiz. Espera pelo corpo.",
    "Tens clareza mental mas o corpo discorda. Não avances. Quando cabeça e corpo alinham, sabes. Agora, ainda não.",
    "Parece que sabes o que fazer, mas há tensão. Essa tensão é informação. Espera. Clareza real inclui o corpo."
  ],
  fugaFrente: [
    "Estás a fugir para a frente. O futuro assusta e a resposta é agir. Mas agir agora é evitar. Pára. Olha para o medo. Não o contornes.",
    "Medo do que vem e vontade de resolver já. Essa urgência é alarme falso. Não precisas decidir agora. Respira.",
    "A ansiedade com o futuro está a empurrar-te. Cuidado. Decisões de fuga não são decisões – são reacções. Pára."
  ],
  menteSabota: [
    "O corpo está bem, mas a mente não pára. Ignora a cabeça hoje. Segue o corpo. Ele sabe o que fazer.",
    "Ruído mental com corpo disponível. Não deixes a mente comandar. Move-te. O corpo resolve o que a mente baralha.",
    "A mente está a sabotar um dia que podia ser bom. Não lhe dês ouvidos. Age a partir do corpo."
  ],
  corpoGrita: [
    "A mente está calma mas o corpo pede atenção. Ouve-o. O que precisas fisicamente agora? Movimento? Descanso? Comida? Atende.",
    "Corpo a gritar, mente a ignorar. Não faças isso. O corpo fala primeiro. Pára e pergunta-lhe o que precisa.",
    "Tensão física com mente serena. O corpo está a carregar algo que a mente ainda não viu. Atende ao corpo primeiro."
  ],
  futuroRouba: [
    "O futuro está a roubar o presente. Tens energia mas ela está a ir toda para preocupação. Pára. Volta ao agora. O futuro não existe ainda.",
    "Energia boa a ser drenada por ansiedade futura. Desperdício. Traz a atenção para aqui. O que podes fazer agora? Só isso importa.",
    "Estás presente no amanhã e ausente no hoje. A energia está a escapar. Volta. Faz uma coisa. Só uma."
  ],

  // PROTECÇÃO (1 padrão)
  recolhimento: [
    "Queres esconder-te e o corpo concorda. Honra isso. Hoje não é dia de exposição. Recolhe. Protege. Está tudo bem.",
    "O impulso é desaparecer. E o corpo apoia. Não lutes contra isto. É sabedoria, não fraqueza. Recolhe e cuida de ti.",
    "Dia de não. Não aparecer, não forçar, não fingir. Está bem. Amanhã será diferente. Hoje, honra o não."
  ],

  // FERTILIDADE (2 padrões de potencial)
  vazioFertil: [
    "A energia está em baixo mas há silêncio e abertura. Este vazio não é mau. É fértil. Não o preenchas. Deixa-o estar.",
    "Cansada mas calma. Sem ruído. Este vazio pode ser incubação. Não forces nada. Confia no processo.",
    "Parece que não há nada, mas há espaço. E espaço é raro. Não o ocupes com preocupação. Descansa nele."
  ],
  silencioCura: [
    "Mente silenciosa, corpo neutro, energia estável. Protege este estado. Não metas barulho. Este silêncio cura.",
    "Raro: paz interior. Não faças nada para a perturbar. Saboreia. Este é o teu estado natural a lembrar-te que existe.",
    "Equilíbrio delicado. Não mexas. Respira aqui. Este momento é suficiente."
  ],

  // ALINHAMENTO (3 padrões de clareza)
  alinhamento: [
    "Energia, corpo e mente alinhados. Bom dia para fazer o que importa. Não percas isto em tarefas pequenas.",
    "Alinhamento presente. Usa bem. Fala, cria, decide. Tens suporte interno.",
    "Dia de clareza e capacidade. Faz o que tens adiado. Hoje tens recursos."
  ],
  aberturaSemDirecao: [
    "Corpo disponível mas sem impulso claro. Está bem. Não precisas saber para onde. Só estar disponível já é muito.",
    "Abertura sem direcção. Não forces um rumo. Às vezes o caminho aparece quando paramos de o procurar.",
    "Pronta mas sem destino. Fica assim. A direcção vem. Por agora, só presença."
  ],
  corpoLidera: [
    "O corpo quer ir e tem energia para isso. Segue-o. Não penses demais. Age.",
    "Impulso físico com energia. Combinação poderosa. Deixa o corpo liderar. A mente que siga.",
    "Dia de acção física. Não analises. Move-te. O corpo sabe."
  ],

  // CONVITE (1 padrão)
  futuroConvite: [
    "O futuro parece bom e tens energia para ele. Aceita o convite. Planeia, sonha, age em direcção ao que vem.",
    "Abertura ao futuro com recursos presentes. Raro. Usa para preparar, decidir, avançar.",
    "Energia e esperança juntas. Boa altura para compromissos, planos, inícios."
  ],

  // NEUTROS (2 padrões)
  neutralidade: [
    "Dia neutro. Nada a puxar muito. Faz o básico. Não forces brilho. Nem tudo tem de ser intenso.",
    "Tudo no meio. Sem drama, sem euforia. Dia de manutenção. Cuida do que precisa de cuidado. Só isso.",
    "Equilíbrio cinzento. Não é mau. É descanso disfarçado. Aceita a normalidade."
  ],
  transicao: [
    "Estás entre estados. Algo está a mudar. Não forces clareza. Deixa a transição acontecer.",
    "Mistura de sinais. Normal em mudança. Não interpretes demais. Observa. Espera. Move-se devagar.",
    "Nem cá nem lá. Transição. Incomoda mas é necessária. Confia no processo."
  ],

  // INDEFINIDO (1 padrão)
  diaSemNome: [
    "Há mistério em ti que não se decifra. E está bem. Não precisas de respostas hoje. Só de continuares.",
    "Estado indefinido. Não catalogável. Às vezes somos isso. Aceita o não-saber.",
    "Hoje não tens rótulo. E não precisas. Vive o dia sem o nomear. A clareza nem sempre é necessária."
  ],

  // ============================================================
  // PADRÕES ÁUREA - AUTO-SACRIFÍCIO E VALOR PRÓPRIO
  // ============================================================

  // Auto-sacrifício + Corpo tenso
  aurea_corpoTenso: [
    "Estás em modo de serviço constante. O corpo sente mas tu ignoras. ÁUREA pode ajudar-te a recuperar o que é teu.",
    "O teu corpo carrega o peso do que dás aos outros. Tens reservado pouco para ti. ÁUREA ensina-te a receber também.",
    "Tensão física e entrega total aos outros. O corpo grita o que tu não dizes. ÁUREA ajuda-te a existir para ti."
  ],

  // Auto-sacrifício + Energia baixa
  aurea_energiaBaixa: [
    "A tua energia vai toda para fora. Nada fica para ti. ÁUREA ensina-te a reservar quota de presença.",
    "Estás vazia porque te esvaziaste nos outros. ÁUREA pode ajudar-te a guardar algo só teu.",
    "Drenaste-te em serviço. A energia que dás não volta porque não a reclamas. ÁUREA mostra-te como."
  ],

  // Auto-sacrifício + Espelho invisível
  aurea_espelhoInvisivel: [
    "Não te vês porque não te tratas como visível. ÁUREA ajuda-te a ocupar o teu lugar sem culpa.",
    "Tornaste-te invisível à força de servir. ÁUREA ensina-te a ser vista — por ti mesma primeiro.",
    "O espelho está vazio porque te apagaste. ÁUREA ajuda-te a reaparecer na tua própria vida."
  ],

  // Auto-sacrifício isolado (sistema equilibrado mas não se prioriza)
  aurea_isolado: [
    "O sistema está equilibrado, mas há uma ferida: não te colocas na lista. ÁUREA ajuda-te a ser prioridade também.",
    "Tudo parece bem — mas e tu? Quando foi a última vez que fizeste algo só para ti? ÁUREA trabalha isso.",
    "Equilibrada para fora, esquecida por dentro. ÁUREA ajuda-te a existir na tua própria agenda."
  ]
};

// ============================================================
// ALGORITMO DE DETECÇÃO DE PADRÃO
// ============================================================

export function detectarPadrao(respostas) {
  const { energia, corpo, mente, passado, impulso, futuro, espelho, cuidado } = respostas;

  // Classificações
  const eBaixa = ['vazia', 'baixa'].includes(energia);
  const eAlta = ['boa', 'cheia'].includes(energia);
  const cFechado = ['pesado', 'tenso'].includes(corpo);
  const cAberto = ['leve', 'solto'].includes(corpo);
  const mRuid = ['caotica', 'barulhenta'].includes(mente);
  const mClara = ['calma', 'silenciosa'].includes(mente);
  const pPesa = ['preso', 'apesar'].includes(passado);
  const pLeve = ['leve', 'arrumado'].includes(passado);
  const fAmeaca = ['escuro', 'pesado'].includes(futuro);
  const fConv = ['claro', 'luminoso'].includes(futuro);
  const eMau = ['invisivel', 'apagada'].includes(espelho);
  const eBom = ['visivel', 'luminosa'].includes(espelho);

  // Classificações ÁUREA - Auto-sacrifício
  const autoSacrificio = ['esquecida', 'por ultimo'].includes(cuidado);
  const cuidadoBom = ['presente', 'prioritaria'].includes(cuidado);

  // Contagem de normais e positivos
  const normais = [energia, corpo, mente, passado, impulso, futuro, espelho, cuidado]
    .filter(x => x === 'normal' || x === 'nada').length;
  const pos = (eAlta ? 1 : 0) + (cAberto ? 1 : 0) + (mClara ? 1 : 0) +
              (pLeve ? 1 : 0) + (fConv ? 1 : 0) + (eBom ? 1 : 0) + (cuidadoBom ? 1 : 0);

  // CRÍTICOS (prioridade máxima)
  if (energia === 'vazia' && eMau && impulso === 'decidir') return 'crit_vid';
  if (pPesa && fAmeaca && mRuid) return 'crit_pfm';
  if (corpo === 'tenso' && eBaixa && eMau) return 'crit_tba';

  // PADRÕES ÁUREA - Auto-sacrifício (prioridade alta quando detectado)
  if (autoSacrificio && cFechado) return 'aurea_corpoTenso';
  if (autoSacrificio && eBaixa) return 'aurea_energiaBaixa';
  if (autoSacrificio && eMau) return 'aurea_espelhoInvisivel';
  // Auto-sacrifício isolado: quando tudo está equilibrado mas não se prioriza
  if (autoSacrificio && normais >= 4) return 'aurea_isolado';

  // MÁXIMOS
  if (energia === 'cheia' && corpo === 'solto' && mente === 'silenciosa' && espelho === 'luminosa') return 'forcaMax';
  if (pos >= 6) return 'presencaRara';

  // ALERTAS
  if (eBaixa && (impulso === 'decidir' || impulso === 'agir')) return 'esgotamento';
  if (eMau && (eBaixa || mRuid)) return 'dissociacao';
  if (pPesa && mRuid) return 'passadoComanda';
  if (mClara && cFechado) return 'falsaClareza';
  if (fAmeaca && (impulso === 'decidir' || impulso === 'agir')) return 'fugaFrente';
  if (mRuid && cAberto) return 'menteSabota';
  if (cFechado && mClara) return 'corpoGrita';
  if (fAmeaca && eAlta) return 'futuroRouba';

  // PROTECÇÃO
  if (cFechado && impulso === 'esconder') return 'recolhimento';

  // FERTILIDADE
  if (eBaixa && mente === 'silenciosa' && (futuro === 'normal' || fConv)) return 'vazioFertil';
  if (mente === 'silenciosa' && (corpo === 'normal' || cAberto) && energia === 'normal') return 'silencioCura';

  // ALINHAMENTO
  if (eAlta && cAberto && mClara) return 'alinhamento';
  if (cAberto && impulso === 'nada') return 'aberturaSemDirecao';
  if (cAberto && impulso === 'agir' && eAlta) return 'corpoLidera';

  // CONVITE
  if (fConv && eAlta && cAberto) return 'futuroConvite';

  // NEUTROS
  if (normais >= 4) return 'neutralidade';
  if (pos >= 2 && normais >= 2) return 'transicao';

  // INDEFINIDO
  return 'diaSemNome';
}

// ============================================================
// OBTER LEITURA ALEATÓRIA DO PADRÃO
// ============================================================

export function obterLeitura(padrao, locale = 'pt') {
  // Para pt, usar as leituras originais (que são a fonte de verdade)
  if (locale === 'pt' || !LEITURAS_I18N[locale]) {
    const leituras = LEITURAS[padrao];
    if (!leituras || leituras.length === 0) {
      return "Hoje és mistério. E está bem assim.";
    }
    return leituras[Math.floor(Math.random() * leituras.length)];
  }

  // Para en/fr, usar as traduções
  const leiturasLocale = LEITURAS_I18N[locale][padrao];
  if (!leiturasLocale || leiturasLocale.length === 0) {
    return LEITURAS_I18N[locale]._fallback || "Today you are mystery. And that's fine.";
  }
  return leiturasLocale[Math.floor(Math.random() * leiturasLocale.length)];
}

// ============================================================
// RECOMENDAÇÃO DE ECO BASEADA NO ESTADO
// ============================================================

// Ecos disponíveis (activos no sistema)
// Os 7 Ecos: Vitalis, Áurea, Serena, Ignis, Ventis, Ecoa, Imago
const ECOS_DISPONIVEIS = {
  Vitalis: { link: '/vitalis', disponivel: true },
  Aurea: { link: '/aurea', disponivel: true },
  Serena: { link: '/serena', disponivel: true },
  Ignis: { link: '/ignis', disponivel: true },
  Ventis: { link: '/ventis', disponivel: true },
  Ecoa: { link: '/ecoa', disponivel: true },
  Imago: { link: '/imago', disponivel: true }
};

export function obterRecomendacaoEco(respostas, locale = 'pt') {
  const { corpo, passado, impulso, futuro, mente, espelho, cuidado } = respostas;
  const recs = [];

  // Mensagens por locale (importadas do i18n/lumina.js via translate())
  // Aqui usamos inline para manter a lógica auto-contida
  const MSGS = {
    pt: {
      aurea: 'Parece que precisas de ÁUREA. Trabalha o valor próprio encarnado — ajuda-te a existir para ti, sem culpa.',
      vitalis: 'O corpo precisa de atenção. O Vitalis pode ajudar-te a nutrir e cuidar do teu corpo.',
      serena: 'Há emoção por fluir. O Serena ajuda-te a processar o passado com fluidez.',
      ignis: 'A vontade precisa de direcção. O Ignis ajuda-te a agir com propósito e foco.',
      ventis: 'Precisas de ar, de ritmo. O Ventis traz leveza e energia ao teu dia.',
      ecoa: 'Há ruído por expressar. O Ecoa ajuda-te a encontrar e libertar a tua voz.',
      imago: 'Não te estás a ver. O Imago ajuda-te a reconhecer a tua essência.'
    },
    en: {
      aurea: 'It looks like you need ÁUREA. It works on embodied self-worth — it helps you exist for yourself, without guilt.',
      vitalis: 'Your body needs attention. Vitalis can help you nourish and care for your body.',
      serena: 'There\'s emotion to process. Serena helps you process the past with fluidity.',
      ignis: 'Your will needs direction. Ignis helps you act with purpose and focus.',
      ventis: 'You need air, rhythm. Ventis brings lightness and energy to your day.',
      ecoa: 'There\'s noise to express. Ecoa helps you find and free your voice.',
      imago: 'You can\'t see yourself. Imago helps you recognise your essence.'
    },
    fr: {
      aurea: 'Il semble que tu aies besoin d\'ÁUREA. Elle travaille la valeur de soi incarnée — elle t\'aide à exister pour toi, sans culpabilité.',
      vitalis: 'Ton corps a besoin d\'attention. Vitalis peut t\'aider à nourrir et prendre soin de ton corps.',
      serena: 'Il y a des émotions à traverser. Serena t\'aide à traiter le passé avec fluidité.',
      ignis: 'Ta volonté a besoin de direction. Ignis t\'aide à agir avec intention et focus.',
      ventis: 'Tu as besoin d\'air, de rythme. Ventis apporte légèreté et énergie à ta journée.',
      ecoa: 'Il y a du bruit à exprimer. Ecoa t\'aide à trouver et libérer ta voix.',
      imago: 'Tu ne te vois pas. Imago t\'aide à reconnaître ton essence.'
    }
  };
  const msg = MSGS[locale] || MSGS['pt'];

  // ÁUREA - auto-sacrifício/valor próprio - PRIORIDADE
  if (['esquecida', 'por ultimo'].includes(cuidado)) {
    recs.push({
      eco: 'Áurea',
      msg: msg.aurea,
      link: '/aurea',
      disponivel: true,
      prioridade: true
    });
  }

  // Vitalis - corpo
  if (['pesado', 'tenso'].includes(corpo)) {
    recs.push({
      eco: 'Vitalis',
      msg: msg.vitalis,
      link: '/vitalis',
      disponivel: true
    });
  }

  // Serena - passado/emoção
  if (['preso', 'apesar'].includes(passado)) {
    recs.push({
      eco: 'Serena',
      msg: msg.serena,
      link: '/serena',
      disponivel: true
    });
  }

  // Ignis - impulso/vontade
  if (['esconder', 'parar'].includes(impulso)) {
    recs.push({
      eco: 'Ignis',
      msg: msg.ignis,
      link: '/ignis',
      disponivel: true
    });
  }

  // Ventis - futuro/ritmo
  if (['escuro', 'pesado'].includes(futuro)) {
    recs.push({
      eco: 'Ventis',
      msg: msg.ventis,
      link: '/ventis',
      disponivel: true
    });
  }

  // Ecoa - mente/expressão
  if (['caotica', 'barulhenta'].includes(mente)) {
    recs.push({
      eco: 'Ecoa',
      msg: msg.ecoa,
      link: '/ecoa',
      disponivel: true
    });
  }

  // Imago - espelho/identidade
  if (['invisivel', 'apagada'].includes(espelho)) {
    recs.push({
      eco: 'Imago',
      msg: msg.imago,
      link: '/imago',
      disponivel: true
    });
  }

  // Priorizar ÁUREA se detectado padrão de auto-sacrifício
  const aureaPrioritaria = recs.find(r => r.prioridade && r.eco === 'Áurea');
  if (aureaPrioritaria) return aureaPrioritaria;

  // Retornar o primeiro eco recomendado
  return recs.length > 0 ? recs[0] : null;
}

// ============================================================
// ANÁLISE DE PADRÕES SEMANAIS
// ============================================================

export function analisarPadroesSemanais(historico, locale = 'pt') {
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const thisWeek = historico.filter(e => new Date(e.created_at).getTime() > weekAgo);

  if (thisWeek.length < 3) return null;

  const patterns = {
    energia: thisWeek.filter(e => ['vazia', 'baixa'].includes(e.energia)).length,
    corpo: thisWeek.filter(e => ['pesado', 'tenso'].includes(e.corpo)).length,
    mente: thisWeek.filter(e => ['caotica', 'barulhenta'].includes(e.mente)).length
  };

  const msgs = {
    pt: {
      energia: 'A energia tem estado baixa. O que te está a drenar?',
      corpo: 'O corpo tem estado fechado. Precisas de movimento ou descanso?',
      mente: 'A mente tem estado agitada. O que precisas de processar?'
    },
    en: {
      energia: 'Energy has been low. What\'s draining you?',
      corpo: 'Your body has been closed off. Do you need movement or rest?',
      mente: 'Your mind has been restless. What do you need to process?'
    },
    fr: {
      energia: 'L\'énergie a été basse. Qu\'est-ce qui te draine ?',
      corpo: 'Le corps a été fermé. Tu as besoin de mouvement ou de repos ?',
      mente: 'L\'esprit a été agité. Qu\'as-tu besoin de traiter ?'
    }
  };
  const m = msgs[locale] || msgs['pt'];

  if (patterns.energia >= 3) {
    return { type: 'energia', message: m.energia };
  }
  if (patterns.corpo >= 3) {
    return { type: 'corpo', message: m.corpo };
  }
  if (patterns.mente >= 3) {
    return { type: 'mente', message: m.mente };
  }

  return null;
}

// ============================================================
// INSIGHTS SEMANAIS
// ============================================================

export function obterInsightsSemanais(historico, locale = 'pt') {
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const thisWeek = historico.filter(e => new Date(e.created_at).getTime() > weekAgo);

  if (thisWeek.length < 3) return null;

  const insights = [];
  const lowEnergy = thisWeek.filter(e => ['vazia', 'baixa'].includes(e.energia)).length;
  const closedBody = thisWeek.filter(e => ['pesado', 'tenso'].includes(e.corpo)).length;
  const noisyMind = thisWeek.filter(e => ['caotica', 'barulhenta'].includes(e.mente)).length;
  const total = thisWeek.length;

  const fmts = {
    pt: { energia: (n, t) => `A energia esteve baixa ${n} de ${t} dias.`, corpo: (n, t) => `O corpo esteve fechado ${n} de ${t} dias.`, mente: (n, t) => `A mente esteve agitada ${n} de ${t} dias.` },
    en: { energia: (n, t) => `Energy was low ${n} out of ${t} days.`, corpo: (n, t) => `Body was closed ${n} out of ${t} days.`, mente: (n, t) => `Mind was restless ${n} out of ${t} days.` },
    fr: { energia: (n, t) => `L'énergie a été basse ${n} jours sur ${t}.`, corpo: (n, t) => `Le corps a été fermé ${n} jours sur ${t}.`, mente: (n, t) => `L'esprit a été agité ${n} jours sur ${t}.` }
  };
  const f = fmts[locale] || fmts['pt'];

  if (lowEnergy >= Math.ceil(total * 0.5)) {
    insights.push(f.energia(lowEnergy, total));
  }
  if (closedBody >= Math.ceil(total * 0.5)) {
    insights.push(f.corpo(closedBody, total));
  }
  if (noisyMind >= Math.ceil(total * 0.5)) {
    insights.push(f.mente(noisyMind, total));
  }

  return insights.length > 0 ? insights : null;
}

// ============================================================
// ANÁLISE DE PADRÕES 14/30 DIAS
// ============================================================

export function analisarPadroesPeriodo(historico, dias) {
  const cutoff = Date.now() - (dias * 24 * 60 * 60 * 1000);
  const periodo = historico.filter(e => new Date(e.created_at).getTime() > cutoff);

  const minDias = dias === 14 ? 3 : 7;
  if (periodo.length < minDias) return null;

  const counts = {
    energiaBaixa: periodo.filter(e => ['vazia', 'baixa'].includes(e.energia)).length,
    corpoFechado: periodo.filter(e => ['pesado', 'tenso'].includes(e.corpo)).length,
    menteRuidosa: periodo.filter(e => ['caotica', 'barulhenta'].includes(e.mente)).length,
    passadoPesa: periodo.filter(e => ['preso', 'apesar'].includes(e.passado)).length,
    futuroAmeaca: periodo.filter(e => ['escuro', 'pesado'].includes(e.futuro)).length,
    espelhoMau: periodo.filter(e => ['invisivel', 'apagada'].includes(e.espelho)).length
  };

  return { counts, total: periodo.length, minDias };
}

// ============================================================
// CICLO MENSTRUAL - 7 ESTADOS EMOCIONAIS - 7 ECOS
// ============================================================

// Mapeamento das fases do ciclo aos estados emocionais e Ecos
export const CICLO_ECO_MAP = {
  menstrual: {
    fase: 'Menstruação',
    dias: '1-5',
    lua: '🌑',
    energia: 'baixa',
    estadosComuns: ['recolhimento', 'cansaço', 'introspecção', 'sensibilidade'],
    ecosPrioritarios: ['Vitalis', 'Serena'],
    mensagem: 'Tempo de recolher e nutrir. O corpo precisa de descanso e cuidado.',
    recomendacoes: {
      Vitalis: 'Alimentação nutritiva e reconfortante. Evita restrições.',
      Áurea: 'Tempo de receber. Permite que os outros cuidem de ti.',
      Serena: 'Permite-te sentir sem julgamento. Honra as emoções.',
      Ignis: 'Pausa na acção. Conserva energia.',
      Ventis: 'Ritmo lento. Pouco movimento intenso.',
      Ecoa: 'Silêncio e escuta interna.',
      Imago: 'Não te julgues. O espelho mente nesta fase.'
    }
  },
  folicular: {
    fase: 'Fase Folicular',
    dias: '6-13',
    lua: '🌒',
    energia: 'a subir',
    estadosComuns: ['curiosidade', 'optimismo', 'criatividade', 'abertura'],
    ecosPrioritarios: ['Ignis', 'Áurea', 'Ecoa'],
    mensagem: 'Energia a crescer. Boa altura para iniciar projectos e explorar.',
    recomendacoes: {
      Vitalis: 'Experimenta novos alimentos. O corpo aceita bem mudanças.',
      Áurea: 'Boa altura para investir em ti. O que queres para ti mesma?',
      Serena: 'Emoções mais leves. Aproveita para processar o que ficou.',
      Ignis: 'Excelente para começar coisas novas. Age.',
      Ventis: 'Aumenta gradualmente o movimento.',
      Ecoa: 'Voz clara. Boa altura para comunicar.',
      Imago: 'Reconecta contigo. Vês-te mais claramente.'
    }
  },
  ovulacao: {
    fase: 'Ovulação',
    dias: '14-16',
    lua: '🌕',
    energia: 'pico',
    estadosComuns: ['confiança', 'clareza', 'conexão', 'expressão'],
    ecosPrioritarios: ['Ecoa', 'Imago', 'Áurea'],
    mensagem: 'O teu pico natural. Máxima energia, clareza e presença social.',
    recomendacoes: {
      Vitalis: 'Corpo forte. Podes ser mais ousada na alimentação.',
      Áurea: 'O teu pico de valor. Celebra quem és e o que mereces.',
      Serena: 'Emoções equilibradas. Altura para conexões profundas.',
      Ignis: 'Acção máxima. Decide, lidera, cria.',
      Ventis: 'Movimento intenso bem-vindo.',
      Ecoa: 'A tua voz é mais clara. Fala, apresenta, comunica.',
      Imago: 'Vês-te no teu melhor. Confia no reflexo.'
    }
  },
  lutea: {
    fase: 'Fase Lútea',
    dias: '17-28',
    lua: '🌘',
    energia: 'a descer',
    estadosComuns: ['irritabilidade', 'ansiedade', 'auto-crítica', 'necessidade de completar'],
    ecosPrioritarios: ['Serena', 'Vitalis', 'Ventis'],
    mensagem: 'Energia a baixar. Completa em vez de iniciar. Cuida das emoções.',
    recomendacoes: {
      Vitalis: 'Evita açúcar e processados. O corpo precisa de estabilidade.',
      Áurea: 'Honra o que fizeste por ti. Não te exijas mais.',
      Serena: 'Emoções intensas são normais. Não te julgues.',
      Ignis: 'Completa tarefas. Evita começar coisas novas.',
      Ventis: 'Movimento suave. Não forces intensidade.',
      Ecoa: 'Cuidado com palavras impulsivas. Espera antes de falar.',
      Imago: 'A auto-crítica é amplificada. O que vês não é real.'
    }
  }
};

// ============================================================
// APRENDIZAGEM PERSONALIZADA - PADRÕES POR FASE DO CICLO
// ============================================================

export function analisarPadroesPorFase(historico) {
  if (!historico || historico.length < 7) return null;

  const padroesPorFase = {
    menstrual: { registos: [], energia: [], corpo: [], mente: [], espelho: [] },
    folicular: { registos: [], energia: [], corpo: [], mente: [], espelho: [] },
    ovulacao: { registos: [], energia: [], corpo: [], mente: [], espelho: [] },
    lutea: { registos: [], energia: [], corpo: [], mente: [], espelho: [] }
  };

  // Agrupa registos por fase
  historico.forEach(entry => {
    const fase = entry.fase_ciclo;
    if (fase && padroesPorFase[fase]) {
      padroesPorFase[fase].registos.push(entry);
      padroesPorFase[fase].energia.push(entry.energia);
      padroesPorFase[fase].corpo.push(entry.corpo);
      padroesPorFase[fase].mente.push(entry.mente);
      padroesPorFase[fase].espelho.push(entry.espelho);
    }
  });

  // Calcula tendências por fase
  const tendencias = {};
  Object.keys(padroesPorFase).forEach(fase => {
    const dados = padroesPorFase[fase];
    if (dados.registos.length >= 2) {
      tendencias[fase] = {
        totalRegistos: dados.registos.length,
        energiaBaixa: dados.energia.filter(e => ['vazia', 'baixa'].includes(e)).length,
        corpoFechado: dados.corpo.filter(c => ['pesado', 'tenso'].includes(c)).length,
        menteAgitada: dados.mente.filter(m => ['caotica', 'barulhenta'].includes(m)).length,
        espelhoMau: dados.espelho.filter(e => ['invisivel', 'apagada'].includes(e)).length
      };
    }
  });

  return Object.keys(tendencias).length > 0 ? tendencias : null;
}

// ============================================================
// INSIGHTS PERSONALIZADOS BASEADOS NO HISTÓRICO
// ============================================================

export function obterInsightsPersonalizados(historico, faseActual, locale = 'pt') {
  const tendencias = analisarPadroesPorFase(historico);
  if (!tendencias || !faseActual || !tendencias[faseActual]) return null;

  const dadosFase = tendencias[faseActual];
  const cicloInfo = CICLO_ECO_MAP[faseActual];
  const insights = [];

  // Compara com o esperado para a fase
  const percentEnergiaBaixa = (dadosFase.energiaBaixa / dadosFase.totalRegistos) * 100;
  const percentCorpoFechado = (dadosFase.corpoFechado / dadosFase.totalRegistos) * 100;
  const percentMenteAgitada = (dadosFase.menteAgitada / dadosFase.totalRegistos) * 100;

  // Templates por locale
  const tpls = {
    pt: {
      menstrual: (p) => `Nos teus registos, ${p}% das vezes tens energia baixa nesta fase. Isto é normal e esperado.`,
      folicular: (p) => `A tua energia na fase folicular costuma estar baixa (${p}%). Algo pode estar a drenar-te quando devias estar a subir.`,
      ovulacao: (p) => `Na ovulação costumas ter o corpo fechado (${p}%). Esta fase devia ser de abertura máxima.`,
      lutea: (p) => `A tua mente costuma ficar agitada na fase lútea (${p}%). Isto é comum - não te culpes.`,
      strongest: (label) => `O teu padrão mais forte nesta fase é ${label}. A LUMINA vai lembrar-te disto.`,
      labels: { energia: 'energia baixa', corpo: 'corpo fechado', mente: 'mente agitada' }
    },
    en: {
      menstrual: (p) => `In your records, ${p}% of the time you have low energy in this phase. This is normal and expected.`,
      folicular: (p) => `Your energy in the follicular phase tends to be low (${p}%). Something may be draining you when you should be rising.`,
      ovulacao: (p) => `During ovulation your body tends to be closed (${p}%). This phase should be one of maximum openness.`,
      lutea: (p) => `Your mind tends to be restless in the luteal phase (${p}%). This is common — don't blame yourself.`,
      strongest: (label) => `Your strongest pattern in this phase is ${label}. LUMINA will remind you of this.`,
      labels: { energia: 'low energy', corpo: 'closed body', mente: 'restless mind' }
    },
    fr: {
      menstrual: (p) => `Dans tes données, ${p}% du temps tu as une énergie basse dans cette phase. C'est normal et attendu.`,
      folicular: (p) => `Ton énergie en phase folliculaire est souvent basse (${p}%). Quelque chose te draine alors que tu devrais monter.`,
      ovulacao: (p) => `Pendant l'ovulation ton corps est souvent fermé (${p}%). Cette phase devrait être d'ouverture maximale.`,
      lutea: (p) => `Ton esprit est souvent agité en phase lutéale (${p}%). C'est courant — ne te culpabilise pas.`,
      strongest: (label) => `Ton pattern le plus fort dans cette phase est ${label}. LUMINA te le rappellera.`,
      labels: { energia: 'énergie basse', corpo: 'corps fermé', mente: 'esprit agité' }
    }
  };
  const tpl = tpls[locale] || tpls['pt'];

  if (faseActual === 'menstrual') {
    if (percentEnergiaBaixa > 70) {
      insights.push({
        tipo: 'confirmacao',
        msg: tpl.menstrual(Math.round(percentEnergiaBaixa)),
        eco: 'Vitalis'
      });
    }
  } else if (faseActual === 'folicular') {
    if (percentEnergiaBaixa > 50) {
      insights.push({
        tipo: 'atencao',
        msg: tpl.folicular(Math.round(percentEnergiaBaixa)),
        eco: 'Vitalis'
      });
    }
  } else if (faseActual === 'ovulacao') {
    if (percentCorpoFechado > 40) {
      insights.push({
        tipo: 'atencao',
        msg: tpl.ovulacao(Math.round(percentCorpoFechado)),
        eco: 'Ventis'
      });
    }
  } else if (faseActual === 'lutea') {
    if (percentMenteAgitada > 60) {
      insights.push({
        tipo: 'confirmacao',
        msg: tpl.lutea(Math.round(percentMenteAgitada)),
        eco: 'Serena'
      });
    }
  }

  // Insight geral sobre o padrão mais forte
  const maisProblemático = [
    { tipo: 'energia', pct: percentEnergiaBaixa, msg: tpl.labels.energia },
    { tipo: 'corpo', pct: percentCorpoFechado, msg: tpl.labels.corpo },
    { tipo: 'mente', pct: percentMenteAgitada, msg: tpl.labels.mente }
  ].sort((a, b) => b.pct - a.pct)[0];

  if (maisProblemático.pct > 50) {
    insights.push({
      tipo: 'padrao',
      msg: tpl.strongest(maisProblemático.msg),
      eco: cicloInfo.ecosPrioritarios[0]
    });
  }

  return insights.length > 0 ? insights : null;
}

// ============================================================
// RECOMENDAÇÃO CONTEXTUAL - CICLO + ESTADO + ECO
// ============================================================

export function obterRecomendacaoCicloEco(respostas, faseActual, historico, locale = 'pt') {
  if (!faseActual) return null;

  const cicloInfo = CICLO_ECO_MAP[faseActual];
  const tendencias = analisarPadroesPorFase(historico);

  // Identifica o Eco mais necessário com base no estado actual
  const { corpo, energia, mente, espelho, passado, futuro, cuidado } = respostas;

  // Razões por locale
  const razoes = {
    pt: { aurea: 'Não te colocas em primeiro lugar. ÁUREA ajuda-te a existir para ti.', body: 'O corpo precisa de atenção primeiro.', emotion: 'Há emoção a processar.', will: 'A vontade precisa de direcção.', identity: 'Precisas de te reconectar contigo.', fallback: 'Cuida de ti nesta fase.' },
    en: { aurea: 'You\'re not putting yourself first. ÁUREA helps you exist for yourself.', body: 'The body needs attention first.', emotion: 'There\'s emotion to process.', will: 'Your will needs direction.', identity: 'You need to reconnect with yourself.', fallback: 'Take care of yourself in this phase.' },
    fr: { aurea: 'Tu ne te mets pas en premier. ÁUREA t\'aide à exister pour toi.', body: 'Le corps a besoin d\'attention en premier.', emotion: 'Il y a des émotions à traiter.', will: 'Ta volonté a besoin de direction.', identity: 'Tu as besoin de te reconnecter à toi-même.', fallback: 'Prends soin de toi dans cette phase.' }
  };
  const r = razoes[locale] || razoes['pt'];

  let ecoSugerido = cicloInfo.ecosPrioritarios[0];
  let razao = '';

  // ÁUREA tem PRIORIDADE quando auto-sacrifício é detectado
  if (['esquecida', 'por ultimo'].includes(cuidado)) {
    ecoSugerido = 'Áurea';
    razao = r.aurea;
  }
  // Prioriza baseado no estado actual
  else if (['pesado', 'tenso'].includes(corpo) || ['vazia', 'baixa'].includes(energia)) {
    ecoSugerido = 'Vitalis';
    razao = r.body;
  } else if (['preso', 'apesar'].includes(passado) || ['caotica', 'barulhenta'].includes(mente)) {
    ecoSugerido = 'Serena';
    razao = r.emotion;
  } else if (['esconder', 'parar'].includes(respostas.impulso)) {
    ecoSugerido = 'Ignis';
    razao = r.will;
  } else if (['invisivel', 'apagada'].includes(espelho)) {
    ecoSugerido = 'Imago';
    razao = r.identity;
  }

  // Recomendações por fase por locale
  const RECS_I18N = {
    en: {
      menstrual: { Vitalis: 'Nutritive and comforting food. Avoid restrictions.', Áurea: 'Time to receive. Let others take care of you.', Serena: 'Allow yourself to feel without judgement. Honour the emotions.', Ignis: 'Pause from action. Conserve energy.', Ventis: 'Slow rhythm. Little intense movement.', Ecoa: 'Silence and inner listening.', Imago: 'Don\'t judge yourself. The mirror lies in this phase.' },
      folicular: { Vitalis: 'Try new foods. Your body welcomes changes.', Áurea: 'Good time to invest in yourself. What do you want for yourself?', Serena: 'Lighter emotions. Take the chance to process what remained.', Ignis: 'Excellent for starting new things. Act.', Ventis: 'Gradually increase movement.', Ecoa: 'Clear voice. Good time to communicate.', Imago: 'Reconnect with yourself. You see yourself more clearly.' },
      ovulacao: { Vitalis: 'Strong body. You can be bolder with food.', Áurea: 'Your peak of worth. Celebrate who you are and what you deserve.', Serena: 'Balanced emotions. Time for deep connections.', Ignis: 'Maximum action. Decide, lead, create.', Ventis: 'Intense movement welcome.', Ecoa: 'Your voice is clearer. Speak, present, communicate.', Imago: 'You see yourself at your best. Trust the reflection.' },
      lutea: { Vitalis: 'Avoid sugar and processed food. Your body needs stability.', Áurea: 'Honour what you did for yourself. Don\'t demand more.', Serena: 'Intense emotions are normal. Don\'t judge yourself.', Ignis: 'Complete tasks. Avoid starting new things.', Ventis: 'Gentle movement. Don\'t force intensity.', Ecoa: 'Careful with impulsive words. Wait before speaking.', Imago: 'Self-criticism is amplified. What you see isn\'t real.' }
    },
    fr: {
      menstrual: { Vitalis: 'Alimentation nutritive et réconfortante. Évite les restrictions.', Áurea: 'Temps de recevoir. Permets aux autres de prendre soin de toi.', Serena: 'Permets-toi de ressentir sans jugement. Honore les émotions.', Ignis: 'Pause dans l\'action. Conserve ton énergie.', Ventis: 'Rythme lent. Peu de mouvement intense.', Ecoa: 'Silence et écoute intérieure.', Imago: 'Ne te juge pas. Le miroir ment dans cette phase.' },
      folicular: { Vitalis: 'Essaie de nouveaux aliments. Le corps accueille bien les changements.', Áurea: 'Bon moment pour investir en toi. Que veux-tu pour toi-même ?', Serena: 'Émotions plus légères. Profite pour traiter ce qui est resté.', Ignis: 'Excellent pour commencer des choses nouvelles. Agis.', Ventis: 'Augmente progressivement le mouvement.', Ecoa: 'Voix claire. Bon moment pour communiquer.', Imago: 'Reconnecte-toi à toi-même. Tu te vois plus clairement.' },
      ovulacao: { Vitalis: 'Corps fort. Tu peux être plus audacieuse dans l\'alimentation.', Áurea: 'Ton pic de valeur. Célèbre qui tu es et ce que tu mérites.', Serena: 'Émotions équilibrées. Moment pour des connexions profondes.', Ignis: 'Action maximale. Décide, dirige, crée.', Ventis: 'Mouvement intense bienvenu.', Ecoa: 'Ta voix est plus claire. Parle, présente, communique.', Imago: 'Tu te vois au mieux. Fais confiance au reflet.' },
      lutea: { Vitalis: 'Évite le sucre et les aliments transformés. Le corps a besoin de stabilité.', Áurea: 'Honore ce que tu as fait pour toi. N\'exige pas plus.', Serena: 'Les émotions intenses sont normales. Ne te juge pas.', Ignis: 'Termine les tâches. Évite de commencer de nouvelles choses.', Ventis: 'Mouvement doux. Ne force pas l\'intensité.', Ecoa: 'Attention aux mots impulsifs. Attends avant de parler.', Imago: 'L\'auto-critique est amplifiée. Ce que tu vois n\'est pas réel.' }
    }
  };

  // Adiciona contexto do ciclo
  let recomendacaoFase;
  if (locale === 'pt' || !RECS_I18N[locale]) {
    recomendacaoFase = cicloInfo.recomendacoes[ecoSugerido] || r.fallback;
  } else {
    recomendacaoFase = RECS_I18N[locale]?.[faseActual]?.[ecoSugerido] || r.fallback;
  }

  return {
    eco: ecoSugerido,
    razao,
    contextoCiclo: recomendacaoFase,
    fase: cicloInfo.fase,
    lua: cicloInfo.lua,
    disponivel: true,
    link: ECOS_DISPONIVEIS[ecoSugerido === 'Áurea' ? 'Aurea' : ecoSugerido]?.link || `/${ecoSugerido.toLowerCase()}`
  };
}

// ============================================================
// TENDÊNCIAS MENSAIS COM APRENDIZAGEM
// ============================================================

export function analisarTendenciasMensais(historico, locale = 'pt') {
  if (!historico || historico.length < 14) return null;

  const mes = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const registosMes = historico.filter(e => new Date(e.created_at).getTime() > mes);

  if (registosMes.length < 10) return null;

  const msgs = {
    pt: { up: 'A energia tem subido esta semana. Bom sinal.', down: 'A energia tem descido. Algo pode estar a mudar.', consistent: 'Tens usado a LUMINA com consistência. Isso ajuda a ver padrões.' },
    en: { up: 'Energy has been rising this week. Good sign.', down: 'Energy has been dropping. Something may be changing.', consistent: 'You\'ve been using LUMINA consistently. That helps see patterns.' },
    fr: { up: 'L\'énergie monte cette semaine. Bon signe.', down: 'L\'énergie descend. Quelque chose est peut-être en train de changer.', consistent: 'Tu utilises LUMINA régulièrement. Ça aide à voir les patterns.' }
  };
  const m = msgs[locale] || msgs['pt'];

  // Agrupa por semana
  const semanas = [[], [], [], []];
  registosMes.forEach(entry => {
    const diasAtras = Math.floor((Date.now() - new Date(entry.created_at).getTime()) / (24 * 60 * 60 * 1000));
    const semana = Math.min(3, Math.floor(diasAtras / 7));
    semanas[semana].push(entry);
  });

  // Calcula média de energia por semana
  const mediasEnergia = semanas.map(sem => {
    if (sem.length === 0) return null;
    const scores = sem.map(e => {
      const map = { vazia: 1, baixa: 2, normal: 3, boa: 4, cheia: 5 };
      return map[e.energia] || 3;
    });
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  });

  // Detecta tendência
  const tendencia = {
    semanas: mediasEnergia,
    direcao: 'estavel',
    insights: []
  };

  const semanaActual = mediasEnergia[0];
  const semanaPassada = mediasEnergia[1];

  if (semanaActual && semanaPassada) {
    if (semanaActual > semanaPassada + 0.5) {
      tendencia.direcao = 'subir';
      tendencia.insights.push(m.up);
    } else if (semanaActual < semanaPassada - 0.5) {
      tendencia.direcao = 'descer';
      tendencia.insights.push(m.down);
    }
  }

  // Analisa consistência
  const diasConsecutivos = registosMes.filter((e, i) => {
    if (i === 0) return true;
    const diff = new Date(registosMes[i-1].created_at) - new Date(e.created_at);
    return diff <= 2 * 24 * 60 * 60 * 1000; // 2 dias
  }).length;

  if (diasConsecutivos >= 7) {
    tendencia.insights.push(m.consistent);
  }

  return tendencia;
}
