/**
 * ÁUREA - Micro-Práticas Diárias
 *
 * 100+ práticas organizadas por categoria:
 * - DINHEIRO: Relação com gastar consigo
 * - TEMPO: Reservar tempo para si
 * - ROUPA: Presença através do vestir
 * - PRAZER: Pequenos mimos sem culpa
 */

export const CATEGORIAS = {
  DINHEIRO: {
    id: 'dinheiro',
    nome: 'Dinheiro',
    icone: '💰',
    cor: '#D4AF37',
    descricao: 'Gastar contigo sem culpa'
  },
  TEMPO: {
    id: 'tempo',
    nome: 'Tempo',
    icone: '⏰',
    cor: '#C68B77',
    descricao: 'Reservar tempo para ti'
  },
  ROUPA: {
    id: 'roupa',
    nome: 'Roupa',
    icone: '👗',
    cor: '#B8856A',
    descricao: 'Vestir-te com presença'
  },
  PRAZER: {
    id: 'prazer',
    nome: 'Prazer',
    icone: '🌸',
    cor: '#FF9F7C',
    descricao: 'Pequenos mimos para ti'
  }
};

// PRÁTICAS DE DINHEIRO (25+)
// Referência de preços em Moçambique: café=100MT, refeição=300-500MT, massagem=3000MT
export const PRATICAS_DINHEIRO = [
  {
    id: 'd1',
    texto: 'Gasta 200 MT só contigo hoje. Sem justificação.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'd2',
    texto: 'Compra algo que te dá prazer (não utilidade) - sem limite de valor.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'd3',
    texto: 'No café, pede o que QUERES (não o mais barato).',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'd4',
    texto: 'Reserva 500 MT esta semana só para ti.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'd5',
    texto: 'Compra flores para TI (não para a casa).',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'd6',
    texto: 'Abre uma poupança "para mim" e deposita 200 MT.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'd7',
    texto: 'Compra um produto de beleza só porque gostas do cheiro.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'd8',
    texto: 'Paga o teu próprio café/refeição antes de pagar o de alguém.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'd9',
    texto: 'Compra um livro, revista ou subscrição que quiseres.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'd10',
    texto: 'Investe em algo bonito para o teu espaço pessoal.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'd11',
    texto: 'Compra a comida/fruta que gostas, mesmo que seja cara.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'd12',
    texto: 'Marca um tratamento de beleza ou massagem para ti.',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 'd13',
    texto: 'Compra algo bonito para vestir sem ocasião especial.',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 'd14',
    texto: 'Investe num objecto que te faz feliz só de olhar.',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 'd15',
    texto: 'Guarda 10% do teu rendimento este mês só para prazer.',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 'd16',
    texto: 'Compra o snack ou doce que desejas sem culpa.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'd17',
    texto: 'Paga por um serviço (limpeza, lavandaria, etc) para teres tempo.',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 'd18',
    texto: 'Compra uma peça de roupa interior bonita ou pijama novo.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'd19',
    texto: 'Investe num creme, perfume ou maquilhagem que quiseres.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'd20',
    texto: 'Compra algo decorativo para a tua casa/quarto.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'd21',
    texto: 'Investe num workshop, curso ou formação que queres.',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 'd22',
    texto: 'Compra um presente para ti mesma como se fosses amiga.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'd23',
    texto: 'Investe em algo que facilita o TEU dia (não o dos outros).',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 'd24',
    texto: 'Compra velas, incenso ou aromas para o teu espaço.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'd25',
    texto: 'Pede comida entregue em casa em vez de cozinhares.',
    nivel: 'prata',
    joias: 1
  }
];

// PRÁTICAS DE TEMPO (25+)
export const PRATICAS_TEMPO = [
  {
    id: 't1',
    texto: '10 minutos sozinha. Sem função. Só estar.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 't2',
    texto: 'Recusa um pedido hoje sem explicar porquê.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 't3',
    texto: 'Marca algo para ti ANTES de marcar para outros.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 't4',
    texto: 'Desliga o telemóvel por 30 minutos.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 't5',
    texto: 'Toma banho devagar (não corrida).',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 't6',
    texto: 'Acorda 15 minutos mais cedo só para ti.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 't7',
    texto: 'Faz uma pausa de 5 minutos no trabalho sem produzir.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 't8',
    texto: 'Diz "deixa-me pensar" em vez de responder logo.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 't9',
    texto: 'Bloqueia 1 hora no calendário só para ti.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 't10',
    texto: 'Almoça sozinha sem o telemóvel à frente.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 't11',
    texto: 'Sai de uma conversa quando quiseres (sem culpa).',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 't12',
    texto: 'Reserva a manhã de domingo só para ti.',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 't13',
    texto: 'Faz uma actividade sozinha (cinema, passeio, etc).',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 't14',
    texto: 'Não respondas mensagens por 2 horas.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 't15',
    texto: 'Cancela um compromisso se não te apetecer.',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 't16',
    texto: 'Vai dormir quando estiveres cansada (não quando tudo acabar).',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 't17',
    texto: 'Faz uma sesta sem culpa.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 't18',
    texto: 'Reserva 30 minutos para não fazer nada.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 't19',
    texto: 'Passeia sem destino por 15 minutos.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 't20',
    texto: 'Delega uma tarefa que costumas fazer.',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 't21',
    texto: 'Chega 10 minutos antes a algum lado para respirar.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 't22',
    texto: 'Não aceites urgências que não são tuas.',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 't23',
    texto: 'Faz uma coisa de cada vez (sem multitasking).',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 't24',
    texto: 'Reserva tempo para um hobby que abandonaste.',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 't25',
    texto: 'Diz não a um favor sem dar desculpas.',
    nivel: 'ouro',
    joias: 2
  }
];

// PRÁTICAS DE ROUPA (25+)
export const PRATICAS_ROUPA = [
  {
    id: 'r1',
    texto: 'Usa a peça bonita que guardas "para ocasiões".',
    nivel: 'prata',
    joias: 2
  },
  {
    id: 'r2',
    texto: 'Veste-te como se fosses importante (mesmo em casa).',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'r3',
    texto: 'Põe roupa interior bonita (mesmo que ninguém veja).',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'r4',
    texto: 'Tira foto de uma peça que te faz sentir TU.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'r5',
    texto: 'Doa 1 peça que carrega versão antiga de ti.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'r6',
    texto: 'Escolhe a roupa de amanhã com intenção.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'r7',
    texto: 'Usa cor que te faz sentir viva.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'r8',
    texto: 'Põe um acessório que gostas mas "nunca usas".',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'r9',
    texto: 'Veste-te para ti, não para o que vais fazer.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'r10',
    texto: 'Arruma o guarda-roupa com carinho (não obrigação).',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 'r11',
    texto: 'Deita fora roupa que já não te representa.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'r12',
    texto: 'Usa salto alto (ou sapato especial) em dia normal.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'r13',
    texto: 'Põe perfume mesmo que não saias de casa.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'r14',
    texto: 'Usa a mala bonita que guardas.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'r15',
    texto: 'Experimenta um estilo novo (só para ver).',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 'r16',
    texto: 'Veste roupa que mostra o teu corpo (sem esconder).',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 'r17',
    texto: 'Usa pijama bonito em vez de roupa velha.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'r18',
    texto: 'Combina cores que te fazem feliz.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'r19',
    texto: 'Usa uma peça que recebes elogios mas "não usas".',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'r20',
    texto: 'Faz upgrade de uma peça básica para uma bonita.',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 'r21',
    texto: 'Olha-te ao espelho vestida e diz algo bom.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'r22',
    texto: 'Usa jóia ou bijuteria em dia comum.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'r23',
    texto: 'Escolhe roupa pela textura (não só pela função).',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'r24',
    texto: 'Veste a peça que sempre quiseste usar mas "não é para ti".',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 'r25',
    texto: 'Põe maquilhagem/cuida do rosto mesmo sem sair.',
    nivel: 'bronze',
    joias: 1
  }
];

// PRÁTICAS DE PRAZER (25+)
export const PRATICAS_PRAZER = [
  {
    id: 'p1',
    texto: 'Come sentada. Sem telemóvel. Saboreia.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p2',
    texto: 'Usa creme que cheira bem. Devagar.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p3',
    texto: 'Põe música que gostas. Alto.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p4',
    texto: 'Lê 15 minutos de algo que te dá prazer (não estudo/trabalho).',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p5',
    texto: 'Fica na cama 5 minutos extra de manhã.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p6',
    texto: 'Come algo doce sem culpa.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p7',
    texto: 'Toma um chá ou café devagar, a saborear.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p8',
    texto: 'Dança sozinha em casa.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'p9',
    texto: 'Vê um episódio de série sem fazer mais nada.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p10',
    texto: 'Recebe um elogio sem diminuir.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'p11',
    texto: 'Abraça-te a ti mesma por 30 segundos.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p12',
    texto: 'Olha pela janela sem fazer nada por 5 minutos.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p13',
    texto: 'Aprecia uma flor, uma árvore, algo bonito no caminho.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p14',
    texto: 'Faz um tratamento de rosto em casa.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'p15',
    texto: 'Ouve um podcast ou audiolivro que gostas.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p16',
    texto: 'Escreve 3 coisas boas sobre ti.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'p17',
    texto: 'Senta-te ao sol por 10 minutos.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p18',
    texto: 'Faz alongamentos com prazer (não obrigação).',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p19',
    texto: 'Acende uma vela aromática.',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p20',
    texto: 'Ri de algo (vídeo, memória, piada).',
    nivel: 'bronze',
    joias: 1
  },
  {
    id: 'p21',
    texto: 'Faz algo criativo sem resultado (desenhar, escrever...).',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'p22',
    texto: 'Cozinha algo que gostas (não o que devias).',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'p23',
    texto: 'Toma um banho de imersão ou duche longo.',
    nivel: 'prata',
    joias: 1
  },
  {
    id: 'p24',
    texto: 'Dorme uma hora extra no fim-de-semana.',
    nivel: 'ouro',
    joias: 2
  },
  {
    id: 'p25',
    texto: 'Celebra algo pequeno que conseguiste hoje.',
    nivel: 'bronze',
    joias: 1
  }
];

// Todas as práticas combinadas
export const TODAS_PRATICAS = [
  ...PRATICAS_DINHEIRO.map(p => ({ ...p, categoria: 'dinheiro' })),
  ...PRATICAS_TEMPO.map(p => ({ ...p, categoria: 'tempo' })),
  ...PRATICAS_ROUPA.map(p => ({ ...p, categoria: 'roupa' })),
  ...PRATICAS_PRAZER.map(p => ({ ...p, categoria: 'prazer' }))
];

/**
 * Retorna uma prática aleatória de uma categoria
 */
export const getPraticaAleatoria = (categoria = null) => {
  let praticas = TODAS_PRATICAS;

  if (categoria) {
    praticas = TODAS_PRATICAS.filter(p => p.categoria === categoria);
  }

  const index = Math.floor(Math.random() * praticas.length);
  return praticas[index];
};

/**
 * Retorna a prática do dia baseada na data
 */
export const getPraticaDoDia = (data = new Date()) => {
  const dia = data.getDate();
  const mes = data.getMonth();
  const seed = dia + mes * 31;
  const index = seed % TODAS_PRATICAS.length;
  return TODAS_PRATICAS[index];
};

/**
 * Retorna práticas por nível
 */
export const getPraticasPorNivel = (nivel) => {
  return TODAS_PRATICAS.filter(p => p.nivel === nivel);
};

/**
 * Retorna práticas por categoria
 */
export const getPraticasPorCategoria = (categoria) => {
  return TODAS_PRATICAS.filter(p => p.categoria === categoria);
};
