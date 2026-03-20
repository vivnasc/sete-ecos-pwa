// ─── Categorias ───

export interface Categoria {
  id: string;
  nome: string;
  subtitulo: string;
  cor: string;
  corClara: string;
}

export const categorias: Categoria[] = [
  { id: "materia", nome: "Matéria", subtitulo: "O que vive no corpo", cor: "#8B6F47", corClara: "#D4C4A8" },
  { id: "herancas", nome: "Heranças", subtitulo: "O que veio antes de ti", cor: "#8B5CF6", corClara: "#C9B3C9" },
  { id: "ciclos", nome: "Ciclos", subtitulo: "As passagens da vida", cor: "#5B7B6B", corClara: "#B3C9BD" },
  { id: "fronteiras", nome: "Fronteiras", subtitulo: "Onde tu acabas e o outro começa", cor: "#6B6B8B", corClara: "#B8B8D0" },
];

// ─── Cursos ───

export interface Modulo {
  numero: number;
  titulo: string;
  descricao: string;
  subAulas: { letra: string; titulo: string; descricao: string }[];
  caderno: string;
}

export interface CursoData {
  numero: number;
  titulo: string;
  slug: string;
  categoriaId: string;
  descricao: string;
  emBreve?: boolean;
  modulos: Modulo[];
}

export const cursos: CursoData[] = [
  // ── HERANÇAS ──
  {
    numero: 1, titulo: "Ouro Próprio", slug: "ouro-proprio", categoriaId: "herancas",
    descricao: "A relação com dinheiro como espelho de ti", emBreve: true,
    modulos: [
      { numero: 1, titulo: "O Brilho Emprestado", descricao: "A origem da busca de validação externa", caderno: "Inventário do brilho", subAulas: [
        { letra: "A", titulo: "O software de infância", descricao: "Os programas de obediência que ainda correm em ti." },
        { letra: "B", titulo: "O espelho dos outros", descricao: "Como aprendeste a medir o teu valor pelo olhar alheio." },
        { letra: "C", titulo: "A moeda invisível", descricao: "O que pagas emocionalmente pela aprovação." },
      ]},
      { numero: 2, titulo: "O Espelho dos Outros", descricao: "Como aprendeste a medir o teu valor pelo olhar alheio", caderno: "Mapa do olhar alheio", subAulas: [
        { letra: "A", titulo: "Os espelhos que escolhes", descricao: "Quem defines como juiz do teu valor." },
        { letra: "B", titulo: "O reflexo distorcido", descricao: "Quando o espelho do outro não é verdade." },
        { letra: "C", titulo: "Devolver o espelho", descricao: "Parar de usar os outros como medida." },
      ]},
      { numero: 3, titulo: "A Moeda Invisível", descricao: "O que pagas emocionalmente pela aprovação", caderno: "Contabilidade emocional", subAulas: [
        { letra: "A", titulo: "O preço que pagas", descricao: "O custo real de cada aprovação." },
        { letra: "B", titulo: "Transacções silenciosas", descricao: "As trocas que fazes sem perceber." },
        { letra: "C", titulo: "O valor sem preço", descricao: "O que vale e não se compra." },
      ]},
      { numero: 4, titulo: "O Inventário do Ouro", descricao: "Reconhecer o que já tens antes de procurar mais", caderno: "O teu ouro", subAulas: [
        { letra: "A", titulo: "O que já tens", descricao: "Fazer inventário do que é teu." },
        { letra: "B", titulo: "O ouro enterrado", descricao: "Talentos esquecidos e forças negadas." },
        { letra: "C", titulo: "Reconhecer sem comparar", descricao: "Ver o teu ouro sem olhar para o do outro." },
      ]},
      { numero: 5, titulo: "A Ferida da Insuficiência", descricao: "Onde nasceu o 'não sou suficiente'", caderno: "Arqueologia da insuficiência", subAulas: [
        { letra: "A", titulo: "A primeira vez", descricao: "Quando sentiste pela primeira vez que não eras suficiente." },
        { letra: "B", titulo: "A ferida repetida", descricao: "Como a ferida se repete em diferentes contextos." },
        { letra: "C", titulo: "Suficiente como és", descricao: "O exercício de ser suficiente sem provar." },
      ]},
      { numero: 6, titulo: "O Preço de Brilhar", descricao: "O medo de se mostrar e ser rejeitada", caderno: "Diário do brilho", subAulas: [
        { letra: "A", titulo: "O medo de brilhar", descricao: "Quando te escondes para não incomodar." },
        { letra: "B", titulo: "A inveja como espelho", descricao: "O que a inveja dos outros te diz sobre ti." },
        { letra: "C", titulo: "Permissão para brilhar", descricao: "Dar-te a ti mesma a permissão que esperas dos outros." },
      ]},
      { numero: 7, titulo: "O Ouro Enterrado", descricao: "Recuperar talentos e qualidades esquecidas", caderno: "Escavação do ouro", subAulas: [
        { letra: "A", titulo: "O que enterraste", descricao: "O que abandonaste de ti para sobreviver." },
        { letra: "B", titulo: "Escavar sem pressa", descricao: "O processo de recuperar o que é teu." },
        { letra: "C", titulo: "O ouro na sombra", descricao: "Talentos que moram no que rejeitas." },
      ]},
      { numero: 8, titulo: "O Brilho de Dentro", descricao: "Viver a partir do valor que já és", caderno: "Celebração do ouro", subAulas: [
        { letra: "A", titulo: "Viver a partir do ouro", descricao: "Quando o valor é ponto de partida, não de chegada." },
        { letra: "B", titulo: "O brilho quotidiano", descricao: "Práticas diárias de reconhecimento." },
        { letra: "C", titulo: "Ouro próprio", descricao: "A declaração final: o brilho é teu." },
      ]},
    ],
  },
  {
    numero: 2, titulo: "Sangue e Seda", slug: "sangue-e-seda", categoriaId: "herancas",
    descricao: "A herança invisível entre mães e filhas", modulos: [],
  },
  {
    numero: 11, titulo: "O Fio Invisível", slug: "o-fio-invisivel", categoriaId: "herancas",
    descricao: "A ligação entre todos nós e como a tua cura toca o todo", modulos: [],
  },
  {
    numero: 13, titulo: "O Silêncio que Grita", slug: "o-silencio-que-grita", categoriaId: "herancas",
    descricao: "O que a tua família nunca disse vive no teu corpo", modulos: [],
  },
  {
    numero: 16, titulo: "A Mulher Antes de Mãe", slug: "a-mulher-antes-de-mae", categoriaId: "herancas",
    descricao: "Quem eras antes de seres de alguém", modulos: [],
  },

  // ── FRONTEIRAS ──
  {
    numero: 3, titulo: "A Arte da Inteireza", slug: "a-arte-da-inteireza", categoriaId: "fronteiras",
    descricao: "Amar sem te perderes no outro", modulos: [],
  },
  {
    numero: 7, titulo: "Limite Sagrado", slug: "limite-sagrado", categoriaId: "fronteiras",
    descricao: "Limites, o preço de agradar, a culpa da recusa",
    modulos: [
      { numero: 1, titulo: "A Boa Menina que Cresceu", descricao: "O software de infância que ainda corre.", caderno: "Auditoria do software interno", subAulas: [
        { letra: "A", titulo: "O software de infância", descricao: "Os programas de obediência que ainda correm em ti." },
        { letra: "B", titulo: "O preço de ser 'boa'", descricao: "O custo acumulado de agradar." },
        { letra: "C", titulo: "Actualizar o sistema", descricao: "Decidir conscientemente que regras ainda servem." },
      ]},
      { numero: 2, titulo: "O Preço do Sim Automático", descricao: "Contabilizar o custo de dizer sim a tudo.", caderno: "Diário dos sins automáticos", subAulas: [
        { letra: "A", titulo: "Contabilizar o custo", descricao: "Quanto te custa cada sim que não é teu." },
        { letra: "B", titulo: "Os últimos 7 dias", descricao: "Exercício: quantos sins automáticos nos últimos 7 dias?" },
        { letra: "C", titulo: "O corpo do sim falso", descricao: "Como o corpo reage quando dizes sim e sentes não." },
      ]},
      { numero: 3, titulo: "A Culpa de Recusar", descricao: "De onde vem a culpa de dizer não.", caderno: "Mapa da culpa", subAulas: [
        { letra: "A", titulo: "De onde vem a culpa", descricao: "A arqueologia da culpa: quando aprendeste que não = má pessoa." },
        { letra: "B", titulo: "Culpa vs. responsabilidade", descricao: "Separar culpa real de culpa herdada." },
        { letra: "C", titulo: "Atravessar a culpa", descricao: "Dizer não é sentir a culpa sem voltar atrás." },
      ]},
      { numero: 4, titulo: "A Diferença entre Ser Amada e Ser Útil", descricao: "Quando confundes ser útil com ser amada.", caderno: "Teste das relações transaccionais", subAulas: [
        { letra: "A", titulo: "Quando confundes ser útil com ser amada", descricao: "A armadilha de pensar que só serves se serves." },
        { letra: "B", titulo: "O valor além da utilidade", descricao: "O que és quando não estás a fazer nada por ninguém." },
        { letra: "C", titulo: "Relações transaccionais", descricao: "Identificar relações onde o amor depende da tua utilidade." },
      ]},
      { numero: 5, titulo: "Não Sem Desculpa", descricao: "O não curto e sem justificação.", caderno: "Treino do não", subAulas: [
        { letra: "A", titulo: "A anatomia da justificação", descricao: "Porque sentes necessidade de justificar cada não." },
        { letra: "B", titulo: "O não curto", descricao: "Prática: dizer não em menos de 10 palavras." },
        { letra: "C", titulo: "O desconforto do silêncio depois", descricao: "Sustentar o silêncio após o não sem preencher." },
      ]},
      { numero: 6, titulo: "Limites no Trabalho", descricao: "Dizer não ao chefe, aos colegas, ao sistema.", caderno: "Guia de limites profissionais", subAulas: [
        { letra: "A", titulo: "A mulher que faz tudo no escritório", descricao: "O padrão de carregar peso emocional/prático do trabalho." },
        { letra: "B", titulo: "Dizer não ao chefe", descricao: "Estratégias para limitar sem sabotar a carreira." },
        { letra: "C", titulo: "Promoção pelo sim vs. respeito pelo não", descricao: "O que ganha respeito a longo prazo." },
      ]},
      { numero: 7, titulo: "Limites com Família", descricao: "A família como teste máximo.", caderno: "Mapa de limites familiares", subAulas: [
        { letra: "A", titulo: "A família como teste máximo", descricao: "Porque é mais difícil dizer não a família." },
        { letra: "B", titulo: "A chantagem emocional", descricao: "Reconhecer e responder a chantagem emocional." },
        { letra: "C", titulo: "Amar com limites", descricao: "O amor não exige ausência de limites." },
      ]},
      { numero: 8, titulo: "O Não como Espaço para o Sim", descricao: "O que cabe quando largas.", caderno: "Celebração dos não", subAulas: [
        { letra: "A", titulo: "O que cabe quando largas", descricao: "O espaço que se abre quando dizes não ao que não é teu." },
        { letra: "B", titulo: "O sim autêntico", descricao: "Quando o sim nasce da liberdade, não da obrigação." },
        { letra: "C", titulo: "Celebrar o não", descricao: "Cada não é um sim a ti." },
      ]},
    ],
  },
  {
    numero: 10, titulo: "Voz de Dentro", slug: "voz-de-dentro", categoriaId: "fronteiras",
    descricao: "Dizer o que precisas de dizer a quem mais importa", modulos: [],
  },
  {
    numero: 12, titulo: "O Espelho do Outro", slug: "o-espelho-do-outro", categoriaId: "fronteiras",
    descricao: "O que te incomoda no outro vive em ti", modulos: [],
  },
  {
    numero: 14, titulo: "A Teia", slug: "a-teia", categoriaId: "fronteiras",
    descricao: "Pertencer sem desaparecer", modulos: [],
  },

  // ── CICLOS ──
  {
    numero: 4, titulo: "Depois do Fogo", slug: "depois-do-fogo", categoriaId: "ciclos",
    descricao: "Quando a vida te pede para começar de novo", modulos: [],
  },
  {
    numero: 5, titulo: "Olhos Abertos", slug: "olhos-abertos", categoriaId: "ciclos",
    descricao: "Decidir a partir de clareza, não de medo", modulos: [],
  },
  {
    numero: 8, titulo: "Flores no Escuro", slug: "flores-no-escuro", categoriaId: "ciclos",
    descricao: "As perdas que não são morte mas doem como se fossem", modulos: [],
  },
  {
    numero: 17, titulo: "O Ofício de Ser", slug: "o-oficio-de-ser", categoriaId: "ciclos",
    descricao: "Quando o trabalho te define e o propósito te escapa", modulos: [],
  },
  {
    numero: 18, titulo: "O Relógio Partido", slug: "o-relogio-partido", categoriaId: "ciclos",
    descricao: "A relação com o tempo que te rouba o presente", modulos: [],
  },

  // ── MATÉRIA ──
  {
    numero: 6, titulo: "Pele Nua", slug: "pele-nua", categoriaId: "materia",
    descricao: "Aprender a ouvir o corpo antes de a mente racionalizar", modulos: [],
  },
  {
    numero: 9, titulo: "O Peso e o Chão", slug: "o-peso-e-o-chao", categoriaId: "materia",
    descricao: "Quando descansar não resolve", modulos: [],
  },
  {
    numero: 15, titulo: "A Chama", slug: "a-chama", categoriaId: "materia",
    descricao: "A raiva que nunca te deixaram sentir", modulos: [],
  },
  {
    numero: 19, titulo: "A Coroa Escondida", slug: "a-coroa-escondida", categoriaId: "materia",
    descricao: "O poder que tens e te assusta", modulos: [],
  },
  {
    numero: 20, titulo: "A Fome", slug: "a-fome", categoriaId: "materia",
    descricao: "O que comes quando não tens fome de comida", modulos: [],
  },
];

// ─── Helpers ───

export function getCursosByCategoria(categoriaId: string): CursoData[] {
  return cursos.filter(c => c.categoriaId === categoriaId).sort((a, b) => a.numero - b.numero);
}

export function getCursoBySlug(slug: string): CursoData | undefined {
  return cursos.find(c => c.slug === slug);
}

export function getCategoriaById(id: string): Categoria | undefined {
  return categorias.find(c => c.id === id);
}

export function getAllSlugs(): string[] {
  return cursos.map(c => c.slug);
}
