export interface VeuData {
  numero: number;
  titulo: string;
  subtitulo: string;
  slug: string;
  descricao: string;
  sobreTexto: string[];
  naoE: string[];
  e: string[];
}

export const veusData: VeuData[] = [
  {
    numero: 1,
    titulo: "O Véu da Ilusão",
    subtitulo: "Confundir funcionalidade com verdade",
    slug: "ilusao",
    descricao: "Há momentos em que a vida funciona. Mas já não convence.",
    sobreTexto: [
      "O Véu da Ilusão não oferece soluções. Não propõe métodos. Oferece clareza.",
      "Observa — com precisão contida — o momento em que a lucidez chega. E a partir daí, abre espaço para escolher com mais presença.",
      "É um convite a ver — e a partir daí, escolher com mais presença."
    ],
    naoE: ["autoajuda", "coaching", "ensina como mudar"],
    e: ["Ajuda a ver com clareza"]
  },
  {
    numero: 2,
    titulo: "O Véu do Medo",
    subtitulo: "Nunca é o momento certo",
    slug: "medo",
    descricao: "Quando dizes \"não é o momento\" e nunca é.",
    sobreTexto: [
      "O segundo véu é a contenção invisível. É quando evitas sem saber que evitas. Quando escolhes o seguro e chamas de \"sensatez\".",
      "O medo não grita. Sussurra. Disfarça-se de prudência, de responsabilidade, de \"ainda não estou pronta\". E enquanto sussurra, a vida passa.",
      "Ver o medo não é eliminá-lo. É reconhecer quando ele decide por ti — e voltar a ter escolha."
    ],
    naoE: [],
    e: []
  },
  {
    numero: 3,
    titulo: "O Véu do Desejo",
    subtitulo: "Conseguiste. E agora?",
    slug: "desejo",
    descricao: "Quando consegues o que querias e não sentes nada.",
    sobreTexto: [
      "O terceiro véu é a busca que afasta. É quando corres atrás do que achas que queres — e ao conseguir, não reconheces.",
      "O desejo herdado disfarça-se de ambição, de sonho, de \"sempre quis isto\". Mas há uma diferença entre querer e ter aprendido a querer.",
      "Distinguir o desejo genuíno do desejo herdado não é negar o que sentes. É perguntar: isto é meu?"
    ],
    naoE: [],
    e: []
  },
  {
    numero: 4,
    titulo: "O Véu do Controlo",
    subtitulo: "Seguras tudo. Nada se move",
    slug: "controlo",
    descricao: "Quando seguras tudo e a vida pára.",
    sobreTexto: [
      "O quarto véu é a força que paralisa. É quando seguras tudo — e nada se move. Quando a necessidade de prever substitui a capacidade de viver.",
      "O controlo promete segurança. Mas quanto mais apertamos, mais a vida escapa entre os dedos. E chamamos a isso \"ser responsável\".",
      "Largar o controlo não é perder. É abrir espaço para o que precisa de acontecer — mesmo que não seja o que planeaste."
    ],
    naoE: [],
    e: []
  },
  {
    numero: 5,
    titulo: "O Véu da Culpa",
    subtitulo: "Não é teu. Larga",
    slug: "culpa",
    descricao: "Quando carregas um peso que não é teu.",
    sobreTexto: [
      "O quinto véu é o peso herdado. É quando carregas o que não é teu. Quando te sentes responsável pelo que não causaste.",
      "A culpa herdada não precisa de razão. Vive no corpo antes de chegar à mente. E justifica-se depois — sempre encontra motivo.",
      "Reconhecer o que não te pertence é o primeiro passo para te libertares do peso — sem negar a responsabilidade que é tua."
    ],
    naoE: [],
    e: []
  },
  {
    numero: 6,
    titulo: "O Véu da Identidade",
    subtitulo: "Quem és sem o papel?",
    slug: "identidade",
    descricao: "Quando já não sabes quem és sem o papel.",
    sobreTexto: [
      "O sexto véu é a máscara colada. É quando defendes uma versão de ti que não reconheces. Quando \"quem eu sou\" se tornou uma prisão em vez de uma casa.",
      "A identidade construída protege. Mas também limita. E às vezes o que mais defendemos é exactamente o que mais nos aprisiona.",
      "Soltar a máscara não é perder-te. É permitir-te ser quem realmente és — para lá da história que contas sobre ti."
    ],
    naoE: [],
    e: []
  },
  {
    numero: 7,
    titulo: "O Véu da Separação",
    subtitulo: "Ninguém entende? Tens a certeza?",
    slug: "separacao",
    descricao: "Quando achas que ninguém te entende.",
    sobreTexto: [
      "O sétimo véu é o que resta quando tudo cai. É a crença de que estás sozinha no que sentes. De que ninguém entende. De que a ligação verdadeira é impossível.",
      "A separação é a última defesa. E talvez a mais dolorosa. Porque convence que a solidão é inevitável — quando é apenas mais um véu.",
      "Reconhecer a separação como ilusão não é negar a dor. É abrir a porta para a reconexão — consigo, com os outros, com a vida."
    ],
    naoE: [],
    e: []
  }
];

export function getVeuBySlug(slug: string): VeuData | undefined {
  return veusData.find(v => v.slug === slug);
}

// ─── 20 Cursos organizados em 4 Categorias ───

export interface Categoria {
  id: string;
  nome: string;
  subtitulo: string;
  cor: string;
  corClara: string;
}

export interface CursoModulo {
  titulo: string;
  resumo: string;
}

export interface CursoData {
  numero: number;
  titulo: string;
  slug: string;
  categoriaId: string;
  descricao: string;
  subtituloLanding: string;
  descricaoLonga: string;
  modulos: CursoModulo[];
  stats: {
    modulos: number;
    videos: number;
    manualPdf: number;
    cadernos: number;
  };
}

export const categorias: Categoria[] = [
  {
    id: "materia",
    nome: "Matéria",
    subtitulo: "O que vive no corpo",
    cor: "#8B6F47",
    corClara: "#D4C4A8",
  },
  {
    id: "herancas",
    nome: "Heranças",
    subtitulo: "O que veio antes de ti",
    cor: "#7B5B7B",
    corClara: "#C9B3C9",
  },
  {
    id: "ciclos",
    nome: "Ciclos",
    subtitulo: "As passagens da vida",
    cor: "#5B7B6B",
    corClara: "#B3C9BD",
  },
  {
    id: "fronteiras",
    nome: "Fronteiras",
    subtitulo: "Onde tu acabas e o outro começa",
    cor: "#6B6B8B",
    corClara: "#B8B8D0",
  },
];

export const cursosData: CursoData[] = [
  // — HERANÇAS —
  {
    numero: 1,
    titulo: "Ouro Próprio",
    slug: "ouro-proprio",
    categoriaId: "herancas",
    descricao: "A relação com dinheiro como espelho de ti",
    subtituloLanding: "Valor próprio, validação externa, o brilho que já existe",
    descricaoLonga: "Começa pela arqueologia do teu valor: de onde veio a crença de que precisas de aprovação? Passa pelo inventário do que já tens. Treina o reconhecimento. Termina com o brilho como ponto de partida, não de chegada.",
    modulos: [
      { titulo: "O Brilho Emprestado", resumo: "A origem da busca de validação externa" },
      { titulo: "O Espelho dos Outros", resumo: "Como aprendeste a medir o teu valor pelo olhar alheio" },
      { titulo: "A Moeda Invisível", resumo: "O que pagas emocionalmente pela aprovação" },
      { titulo: "O Inventário do Ouro", resumo: "Reconhecer o que já tens antes de procurar mais" },
      { titulo: "A Ferida da Insuficiência", resumo: "Onde nasceu o 'não sou suficiente'" },
      { titulo: "O Preço de Brilhar", resumo: "O medo de se mostrar e ser rejeitado" },
      { titulo: "O Ouro Enterrado", resumo: "Recuperar talentos e qualidades esquecidas" },
      { titulo: "O Brilho de Dentro", resumo: "Viver a partir do valor que já és" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 2,
    titulo: "Sangue e Seda",
    slug: "sangue-e-seda",
    categoriaId: "herancas",
    descricao: "A herança invisível entre mães e filhas",
    subtituloLanding: "Heranças familiares, lealdades invisíveis, o peso do sangue",
    descricaoLonga: "Começa pela árvore emocional: o que herdaste sem pedir? Passa pelas lealdades invisíveis que te prendem ao passado. Treina a separação saudável. Termina com a escolha do que levar e do que devolver.",
    modulos: [
      { titulo: "A Árvore Emocional", resumo: "Mapear as heranças que carregas sem saber" },
      { titulo: "Lealdades Invisíveis", resumo: "Os pactos silenciosos com a família" },
      { titulo: "O Peso do Sobrenome", resumo: "Expectativas herdadas e o papel que te deram" },
      { titulo: "Dívidas de Sangue", resumo: "O que sentes que deves e nunca pediste emprestado" },
      { titulo: "A Seda que Sufoca", resumo: "Quando o amor familiar vem com condições" },
      { titulo: "O Corte Necessário", resumo: "Separar-te sem te perderes" },
      { titulo: "O que Devolver", resumo: "Entregar o que nunca foi teu" },
      { titulo: "A Herança Escolhida", resumo: "Decidir o que levas e o que deixas" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 11,
    titulo: "O Fio Invisível",
    slug: "o-fio-invisivel",
    categoriaId: "herancas",
    descricao: "A ligação entre todos nós e como a tua cura toca o todo",
    subtituloLanding: "Vínculos inconscientes, padrões repetidos, ligações que puxam",
    descricaoLonga: "Começa pela detecção dos fios: que padrões se repetem nas tuas relações? Passa pela origem — onde foram tecidos. Treina a consciência do que te puxa. Termina com a escolha de cortar ou fortalecer cada fio.",
    modulos: [
      { titulo: "Os Fios que te Puxam", resumo: "Identificar padrões repetitivos nas relações" },
      { titulo: "A Teia Original", resumo: "Onde estes vínculos foram tecidos" },
      { titulo: "O Nó Cego", resumo: "O que não consegues ver mas que te prende" },
      { titulo: "Repetições Disfarçadas", resumo: "Quando mudas de pessoa mas não de padrão" },
      { titulo: "O Fio do Medo", resumo: "Ligações mantidas pelo receio de ficar só" },
      { titulo: "O Fio do Dever", resumo: "Ligações mantidas pela obrigação" },
      { titulo: "Cortar sem Destruir", resumo: "A arte de soltar com respeito" },
      { titulo: "Fios Escolhidos", resumo: "Construir vínculos conscientes" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 13,
    titulo: "O Silêncio que Grita",
    slug: "o-silencio-que-grita",
    categoriaId: "herancas",
    descricao: "O que a tua família nunca disse vive no teu corpo",
    subtituloLanding: "O não-dito, segredos familiares, o peso do silêncio",
    descricaoLonga: "Começa pelo mapa dos silêncios: o que nunca foi dito na tua família? Passa pelo custo de guardar segredos que não são teus. Treina a voz que foi calada. Termina com a liberdade de nomear o que existia sem palavras.",
    modulos: [
      { titulo: "O Mapa dos Silêncios", resumo: "Os temas proibidos na tua história" },
      { titulo: "Segredos Herdados", resumo: "O que te foi passado sem palavras" },
      { titulo: "A Boca Cosida", resumo: "Quando aprendeste que era melhor calar" },
      { titulo: "O Corpo que Fala", resumo: "Onde o silêncio se instala no corpo" },
      { titulo: "A Vergonha Guardada", resumo: "O que protege o silêncio" },
      { titulo: "Palavras Proibidas", resumo: "Nomear o que nunca teve nome" },
      { titulo: "A Voz Recuperada", resumo: "Aprender a dizer o que precisa de ser dito" },
      { titulo: "O Silêncio Escolhido", resumo: "A diferença entre calar e escolher o silêncio" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 16,
    titulo: "A Mulher Antes de Mãe",
    slug: "a-mulher-antes-de-mae",
    categoriaId: "herancas",
    descricao: "Quem eras antes de seres de alguém",
    subtituloLanding: "Identidade pré-papéis, a mulher antes dos rótulos, o eu original",
    descricaoLonga: "Começa pela escavação: quem eras antes de te definires pelos outros? Passa pelos papéis que vestiram por ti. Treina o contacto com quem existe por baixo. Termina com a integração — ser todas e ainda assim ser tu.",
    modulos: [
      { titulo: "Antes de Tudo", resumo: "Quem eras antes dos papéis que te deram" },
      { titulo: "O Vestido que Vestiram", resumo: "Os rótulos que aceitaste sem questionar" },
      { titulo: "A Filha Perfeita", resumo: "O peso de corresponder às expectativas" },
      { titulo: "A Esposa Esperada", resumo: "O que perdeste para caber na relação" },
      { titulo: "A Mãe sem Nome Próprio", resumo: "Quando o papel apaga a pessoa" },
      { titulo: "A Profissional como Máscara", resumo: "Esconder-se atrás da competência" },
      { titulo: "O Rosto por Baixo", resumo: "Reencontrar quem existe sem rótulos" },
      { titulo: "Todas e Nenhuma", resumo: "Integrar os papéis sem perder o centro" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },

  // — FRONTEIRAS —
  {
    numero: 3,
    titulo: "A Arte da Inteireza",
    slug: "a-arte-da-inteireza",
    categoriaId: "fronteiras",
    descricao: "Amar sem te perderes no outro",
    subtituloLanding: "Fragmentação, perfeição, a coragem de ser inteira",
    descricaoLonga: "Começa pelo inventário dos pedaços cortados: o que amputaste de ti para ser aceite? Passa pelo custo da perfeição. Treina a reintegração. Termina com a inteireza como prática diária — imperfeita e completa.",
    modulos: [
      { titulo: "Os Pedaços Cortados", resumo: "O que amputaste de ti para caber" },
      { titulo: "A Fábrica da Perfeição", resumo: "Onde aprendeste que só inteira não chegava" },
      { titulo: "O Custo de Agradar", resumo: "O que perdes cada vez que te ajustas" },
      { titulo: "A Sombra Negada", resumo: "As partes de ti que escondes" },
      { titulo: "O Medo de Ser Vista", resumo: "A vulnerabilidade de mostrar tudo" },
      { titulo: "Peças Recuperadas", resumo: "Reintegrar o que foi rejeitado" },
      { titulo: "Imperfeita e Inteira", resumo: "A beleza do que é real" },
      { titulo: "A Arte de Ser", resumo: "Viver sem cortar pedaços" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 7,
    titulo: "Limite Sagrado",
    slug: "limite-sagrado",
    categoriaId: "fronteiras",
    descricao: "Limites, o preço de agradar, a culpa da recusa",
    subtituloLanding: "Limites, o preço de agradar, a culpa da recusa",
    descricaoLonga: "Começa pela arqueologia: de onde vem a incapacidade de recusar? Passa pelo custo real de dizer sim a tudo. Treina o não. Termina com o não como espaço para o sim.",
    modulos: [
      { titulo: "A Boa Menina que Cresceu", resumo: "A origem da dificuldade em dizer não" },
      { titulo: "O Preço do Sim Automático", resumo: "O que pagas cada vez que dizes sim sem querer" },
      { titulo: "A Culpa como Guardião", resumo: "Por que sentes culpa quando te proteges" },
      { titulo: "Onde Acabas Tu", resumo: "Mapear onde terminas e o outro começa" },
      { titulo: "O Não como Amor", resumo: "Quando recusar é o acto mais generoso" },
      { titulo: "Limites com Quem Amas", resumo: "A coragem de dizer não a quem mais importa" },
      { titulo: "O Corpo que Avisa", resumo: "Sinais físicos de limites ultrapassados" },
      { titulo: "O Sim Escolhido", resumo: "Quando o sim nasce do desejo e não do medo" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 10,
    titulo: "Voz de Dentro",
    slug: "voz-de-dentro",
    categoriaId: "fronteiras",
    descricao: "Dizer o que precisas de dizer a quem mais importa",
    subtituloLanding: "Intuição, voz interior, o ruído que cala o essencial",
    descricaoLonga: "Começa pelo silêncio: quando foi a última vez que ouviste sem filtro? Passa pelo ruído — tudo o que abafa a tua voz. Treina a escuta interna. Termina com a confiança no que sabes antes de saber.",
    modulos: [
      { titulo: "O Ruído de Fora", resumo: "Tudo o que abafa a tua voz interior" },
      { titulo: "A Voz Esquecida", resumo: "Quando deixaste de te ouvir" },
      { titulo: "Razão contra Intuição", resumo: "O conflito entre o que pensas e o que sentes" },
      { titulo: "O Corpo Sabe", resumo: "A inteligência que vive abaixo do pescoço" },
      { titulo: "Medos Disfarçados de Razão", resumo: "Quando a lógica é medo com argumentos" },
      { titulo: "O Treino da Escuta", resumo: "Práticas para ouvir o que já sabes" },
      { titulo: "Confiar sem Provas", resumo: "A coragem de seguir o que sentes" },
      { titulo: "A Voz como Bússola", resumo: "Viver guiada pelo que é verdadeiro" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 12,
    titulo: "O Espelho do Outro",
    slug: "o-espelho-do-outro",
    categoriaId: "fronteiras",
    descricao: "O que te incomoda no outro vive em ti",
    subtituloLanding: "Projecção, sombra, o outro como espelho",
    descricaoLonga: "Começa pela irritação: o que te incomoda nos outros e porquê? Passa pela projecção — o mecanismo de ver fora o que vive dentro. Treina o reconhecimento. Termina com o outro como mestre involuntário.",
    modulos: [
      { titulo: "O que te Irrita", resumo: "O mapa das tuas reacções aos outros" },
      { titulo: "O Mecanismo da Projecção", resumo: "Como pões nos outros o que é teu" },
      { titulo: "A Sombra no Espelho", resumo: "Reconhecer o que rejeitas em ti" },
      { titulo: "Admiração e Inveja", resumo: "O que admiras fora revela o que queres dentro" },
      { titulo: "Relações como Espelhos", resumo: "O que cada pessoa te mostra sobre ti" },
      { titulo: "O Julgamento como Pista", resumo: "Quando julgas, revelas-te" },
      { titulo: "Recolher a Projecção", resumo: "Trazer para dentro o que puseste fora" },
      { titulo: "O Outro como Mestre", resumo: "Aprender com quem te desafia" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 14,
    titulo: "A Teia",
    slug: "a-teia",
    categoriaId: "fronteiras",
    descricao: "Pertencer sem desaparecer",
    subtituloLanding: "Relações de poder, dependência, liberdade dentro da ligação",
    descricaoLonga: "Começa pelo mapa relacional: quem puxa, quem cede, quem controla? Passa pelos padrões de poder invisíveis. Treina a presença sem submissão. Termina com a liberdade de estar ligada sem estar presa.",
    modulos: [
      { titulo: "O Mapa da Teia", resumo: "Quem puxa, quem cede, quem controla" },
      { titulo: "Dependência Disfarçada", resumo: "Quando a ligação é uma prisão suave" },
      { titulo: "O Poder Invisível", resumo: "Dinâmicas de controlo que não se vêem" },
      { titulo: "Co-dependência", resumo: "Quando precisas que precisem de ti" },
      { titulo: "A Solidão como Medo", resumo: "Ficar por medo de estar só" },
      { titulo: "Autonomia com Ligação", resumo: "Ser livre dentro da relação" },
      { titulo: "Soltar sem Partir", resumo: "Dar espaço sem abandonar" },
      { titulo: "Fio e não Presa", resumo: "Escolher como te ligas ao mundo" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },

  // — CICLOS —
  {
    numero: 4,
    titulo: "Depois do Fogo",
    slug: "depois-do-fogo",
    categoriaId: "ciclos",
    descricao: "Quando a vida te pede para começar de novo",
    subtituloLanding: "Recomeço, destruição criativa, renascer das cinzas",
    descricaoLonga: "Começa pelo inventário das cinzas: o que perdeste e o que sobrou? Passa pelo luto do que foi. Treina a reconstrução a partir do essencial. Termina com a descoberta de que o fogo não destruiu — revelou.",
    modulos: [
      { titulo: "O Inventário das Cinzas", resumo: "O que sobrou depois de tudo arder" },
      { titulo: "O Luto do que Foi", resumo: "Chorar o que já não existe" },
      { titulo: "A Tentação de Reconstruir Igual", resumo: "O impulso de voltar ao que era" },
      { titulo: "O Vazio Fértil", resumo: "O espaço que se abre quando o velho cai" },
      { titulo: "Sementes nas Cinzas", resumo: "O que começa a nascer no meio da destruição" },
      { titulo: "A Pele Nova", resumo: "Aprender a habitar quem estás a ser" },
      { titulo: "O Fogo como Mestre", resumo: "O que a perda te ensinou" },
      { titulo: "Renascer sem Pressa", resumo: "Dar tempo ao que precisa de crescer" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 5,
    titulo: "Olhos Abertos",
    slug: "olhos-abertos",
    categoriaId: "ciclos",
    descricao: "Decidir a partir de clareza, não de medo",
    subtituloLanding: "Lucidez, auto-engano, a coragem de ver",
    descricaoLonga: "Começa pela cegueira voluntária: o que escolhes não ver? Passa pelos mecanismos de auto-engano. Treina a visão sem filtros. Termina com a lucidez como forma de liberdade — mesmo quando dói.",
    modulos: [
      { titulo: "A Cegueira Voluntária", resumo: "O que escolhes não ver e porquê" },
      { titulo: "As Histórias que Contas", resumo: "As narrativas que constróis para não sofrer" },
      { titulo: "O Auto-Engano", resumo: "Os mecanismos que te protegem da verdade" },
      { titulo: "O Momento da Lucidez", resumo: "Quando a verdade rompe a superfície" },
      { titulo: "O Medo de Ver", resumo: "O que acontece quando tiras os filtros" },
      { titulo: "A Dor da Clareza", resumo: "Quando ver dói mais do que ignorar" },
      { titulo: "Olhar sem Julgar", resumo: "Ver o que é, sem condenar" },
      { titulo: "Viver de Olhos Abertos", resumo: "A liberdade de quem já não precisa de mentir a si" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 8,
    titulo: "Flores no Escuro",
    slug: "flores-no-escuro",
    categoriaId: "ciclos",
    descricao: "As perdas que não são morte mas doem como se fossem",
    subtituloLanding: "Crise como crescimento, dor como terreno fértil, beleza no escuro",
    descricaoLonga: "Começa pela escuridão: o que vive nos teus momentos mais difíceis? Passa pela resistência ao sofrimento. Treina a presença no desconforto. Termina com a descoberta de que as maiores transformações nascem onde menos esperas.",
    modulos: [
      { titulo: "A Escuridão que Assusta", resumo: "Nomear o que vive nos momentos difíceis" },
      { titulo: "A Resistência à Dor", resumo: "Por que fugimos do que precisa de ser sentido" },
      { titulo: "O Solo Fértil", resumo: "Como a crise prepara o terreno" },
      { titulo: "Raízes no Escuro", resumo: "O crescimento que não se vê" },
      { titulo: "A Beleza Inesperada", resumo: "O que floresce quando menos esperas" },
      { titulo: "Estar Presente no Desconforto", resumo: "A arte de ficar quando tudo diz para fugir" },
      { titulo: "A Força Silenciosa", resumo: "A resiliência que nasce sem alarde" },
      { titulo: "Flores que Escolheste Regar", resumo: "Cultivar o que descobriste no escuro" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 17,
    titulo: "O Ofício de Ser",
    slug: "o-oficio-de-ser",
    categoriaId: "ciclos",
    descricao: "Quando o trabalho te define e o propósito te escapa",
    subtituloLanding: "Trabalho, identidade, propósito, a mulher para além da função",
    descricaoLonga: "Começa pelo inventário do que seguras: o que carregas que já não faz sentido? Passa pela confusão entre força e teimosia. Treina o largar. Termina com a descoberta de que descansar é um acto de coragem.",
    modulos: [
      { titulo: "O que Seguras", resumo: "O inventário do que carregas sem necessidade" },
      { titulo: "Força ou Teimosia", resumo: "Quando persistir já não é virtude" },
      { titulo: "O Corpo Exausto", resumo: "Os sinais que ignoras há tempo demais" },
      { titulo: "A Culpa de Parar", resumo: "Por que descansar parece fraqueza" },
      { titulo: "O Vício do Controlo", resumo: "Quando segurar se torna identidade" },
      { titulo: "Mãos que Largam", resumo: "A arte de soltar sem perder" },
      { titulo: "O Descanso como Acção", resumo: "Parar é fazer alguma coisa por ti" },
      { titulo: "Mãos Livres", resumo: "O que podes receber quando largas" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 18,
    titulo: "O Relógio Partido",
    slug: "o-relogio-partido",
    categoriaId: "ciclos",
    descricao: "A relação com o tempo que te rouba o presente",
    subtituloLanding: "Tempo, pressa, presença, a tirania do relógio",
    descricaoLonga: "Começa pelo mapa das partidas: o que deixaste para trás e porquê? Passa pela diferença entre fugir e partir. Treina a despedida consciente. Termina com a descoberta de que partir pode ser a forma mais profunda de ficar contigo.",
    modulos: [
      { titulo: "O Mapa das Partidas", resumo: "As vezes que partiste e o que levaste" },
      { titulo: "Fugir ou Partir", resumo: "A diferença entre escapar e escolher" },
      { titulo: "O que Deixaste para Trás", resumo: "O luto das vidas não vividas" },
      { titulo: "Estações que Mudaram", resumo: "As transições que te transformaram" },
      { titulo: "A Mala que Carregas", resumo: "O que levas de cada lugar por onde passas" },
      { titulo: "O Medo de Ficar", resumo: "Quando partir é mais fácil do que estar" },
      { titulo: "A Despedida Consciente", resumo: "Sair com presença e gratidão" },
      { titulo: "O Regresso a Ti", resumo: "Quando partir te traz de volta a quem és" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },

  // — MATÉRIA —
  {
    numero: 6,
    titulo: "Pele Nua",
    slug: "pele-nua",
    categoriaId: "materia",
    descricao: "Aprender a ouvir o corpo antes de a mente racionalizar",
    subtituloLanding: "Memória corporal, marcas emocionais, o corpo como arquivo",
    descricaoLonga: "Começa pelo mapa do corpo: onde guardas a dor, a tensão, a alegria? Passa pela memória somática. Treina a escuta do corpo. Termina com a reconciliação — habitar o corpo como casa e não como campo de batalha.",
    modulos: [
      { titulo: "O Mapa do Corpo", resumo: "Onde guardas o que não dizes" },
      { titulo: "Cicatrizes Visíveis e Invisíveis", resumo: "As marcas que contas e as que escondes" },
      { titulo: "A Memória da Pele", resumo: "O que o corpo lembra quando a mente esquece" },
      { titulo: "Tensões Guardadas", resumo: "Músculos que carregam emoções antigas" },
      { titulo: "O Toque que Faltou", resumo: "As carências que vivem no corpo" },
      { titulo: "O Corpo como Alarme", resumo: "Sintomas como mensagens não ouvidas" },
      { titulo: "A Escuta Somática", resumo: "Aprender a ouvir o que o corpo diz" },
      { titulo: "Habitar o Corpo", resumo: "Reconciliar-se com a casa que és" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 9,
    titulo: "O Peso e o Chão",
    slug: "o-peso-e-o-chao",
    categoriaId: "materia",
    descricao: "Quando descansar não resolve",
    subtituloLanding: "Peso emocional, relação com o corpo, enraizamento",
    descricaoLonga: "Começa pela pergunta: o que pesa em ti que não está no corpo? Passa pela relação entre emoções não processadas e o peso físico. Treina o enraizamento. Termina com a leveza de quem encontrou o chão.",
    modulos: [
      { titulo: "O Peso Invisível", resumo: "O que carregas que não se vê na balança" },
      { titulo: "Comer e Sentir", resumo: "A relação entre emoção e alimentação" },
      { titulo: "O Corpo como Protecção", resumo: "Quando o peso é uma armadura" },
      { titulo: "A Vergonha do Espelho", resumo: "O olhar que te condena" },
      { titulo: "Dietas como Castigo", resumo: "Quando cuidar do corpo é punição" },
      { titulo: "O Chão sob os Pés", resumo: "Encontrar raízes e estabilidade" },
      { titulo: "Leveza sem Perda", resumo: "Soltar o peso sem perder a substância" },
      { titulo: "O Corpo como Aliado", resumo: "Viver com o corpo e não contra ele" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 15,
    titulo: "A Chama",
    slug: "a-chama",
    categoriaId: "materia",
    descricao: "A raiva que nunca te deixaram sentir",
    subtituloLanding: "Desejo, raiva contida, energia vital reprimida",
    descricaoLonga: "Começa pela brasa: o que arde em ti que não encontra saída? Passa pela raiva contida, o desejo reprimido, a energia vital bloqueada. Treina a expressão segura do fogo. Termina com o fogo como aliado e não como ameaça.",
    modulos: [
      { titulo: "O Fogo Contido", resumo: "A energia que arde sem saída" },
      { titulo: "A Raiva Proibida", resumo: "Quando sentir raiva não é permitido" },
      { titulo: "O Desejo Calado", resumo: "O que queres e não te deixas querer" },
      { titulo: "A Energia Bloqueada", resumo: "Onde o corpo trava a força vital" },
      { titulo: "Explosão ou Implosão", resumo: "O que acontece quando o fogo não tem saída" },
      { titulo: "A Expressão do Fogo", resumo: "Formas seguras de libertar a energia" },
      { titulo: "Arder sem Destruir", resumo: "A arte de sentir com intensidade" },
      { titulo: "O Fogo como Aliado", resumo: "Usar a brasa como força criativa" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 19,
    titulo: "A Coroa Escondida",
    slug: "a-coroa-escondida",
    categoriaId: "materia",
    descricao: "O poder que tens e te assusta",
    subtituloLanding: "Poder pessoal, medo de brilhar, a coroa que escondes",
    descricaoLonga: "Começa pela sombra: o que escondes de ti e do mundo? Passa pela descoberta de que o ouro e a sombra são inseparáveis. Treina a aceitação do todo. Termina com a integração — brilhar sem negar o escuro.",
    modulos: [
      { titulo: "A Sombra Escondida", resumo: "O que escondes de ti e dos outros" },
      { titulo: "O Medo do Escuro Interior", resumo: "Por que evitas certas partes de ti" },
      { titulo: "O Ouro na Sombra", resumo: "Talentos e forças escondidas no que rejeitas" },
      { titulo: "A Máscara de Luz", resumo: "Quando só mostras o brilho" },
      { titulo: "Integrar os Opostos", resumo: "Ser boa e má, forte e frágil" },
      { titulo: "A Ferida como Fonte", resumo: "O que nasceu da tua dor" },
      { titulo: "Brilhar com Raízes", resumo: "Ouro que conhece o escuro de onde veio" },
      { titulo: "O Todo que És", resumo: "Viver sem amputar nenhuma parte" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
  {
    numero: 20,
    titulo: "A Fome",
    slug: "a-fome",
    categoriaId: "materia",
    descricao: "O que comes quando não tens fome de comida",
    subtituloLanding: "Fome emocional, vazio, o que preenches sem saber",
    descricaoLonga: "Começa pela fome: do que tens fome para além do pão? Passa pela forma como te nutres — ou não. Treina a presença no gesto simples. Termina com o quotidiano como prática sagrada — comer, parar, respirar.",
    modulos: [
      { titulo: "A Fome que não é Fome", resumo: "O que procuras quando abres o frigorífico" },
      { titulo: "Nutrir e Preencher", resumo: "A diferença entre alimentar e tapar buracos" },
      { titulo: "O Vazio que Pede", resumo: "O que vive por trás da fome emocional" },
      { titulo: "A Mesa como Ritual", resumo: "Comer com presença e intenção" },
      { titulo: "O Silêncio como Alimento", resumo: "O que acontece quando paras" },
      { titulo: "O Sagrado no Quotidiano", resumo: "Encontrar significado nos gestos simples" },
      { titulo: "Respirar como Prática", resumo: "A nutrição que não vem do prato" },
      { titulo: "Pão e Presença", resumo: "Viver cada gesto como se fosse o único" },
    ],
    stats: { modulos: 8, videos: 24, manualPdf: 1, cadernos: 8 },
  },
];

export function getCursosByCategoria(categoriaId: string): CursoData[] {
  return cursosData
    .filter((c) => c.categoriaId === categoriaId)
    .sort((a, b) => a.numero - b.numero);
}

export function getCursoBySlug(slug: string): CursoData | undefined {
  return cursosData.find((c) => c.slug === slug);
}

export function getCategoriaById(id: string): Categoria | undefined {
  return categorias.find((c) => c.id === id);
}
