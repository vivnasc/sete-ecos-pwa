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
