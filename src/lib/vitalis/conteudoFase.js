// Conteúdo educativo por semana e abordagem alimentar
// Mostrado no Dashboard num card contextual à fase do programa.

const CONTEUDO_KETO = {
  1: {
    titulo: 'Semana 1 — A Adaptação',
    mensagem: 'O teu corpo está a trocar de combustível. É normal sentir cansaço e dor de cabeça nos dias 3-5.',
    expectativa: 'Perda rápida de 2-4kg (água, não gordura). Possível "keto flu".',
    dica: 'Sal generoso na comida, 3L de água por dia, magnésio à noite.'
  },
  2: {
    titulo: 'Semana 2 — A Estabilização',
    mensagem: 'A fome começa a desaparecer. A energia estabiliza. Já estás em cetose.',
    expectativa: 'Energia mais constante. Cintura visivelmente reduzida.',
    dica: 'Mede a cintura hoje. Compara com o início.'
  },
  3: {
    titulo: 'Semana 3 — O Ritmo',
    mensagem: 'Encontras o teu ritmo. Já sabes o que comer sem pensar muito.',
    expectativa: 'Fome controlada. Roupa começa a folgar.',
    dica: 'Tira fotos de progresso. A balança não conta tudo.'
  },
  4: {
    titulo: 'Semana 4 — A Transformação',
    mensagem: 'A composição corporal muda visivelmente. Estás adaptada.',
    expectativa: 'Mais energia, sono melhor, pele mais limpa. Roupa folga.',
    dica: 'Compara fotos da semana 1 com hoje. A mudança é real.'
  },
  5: {
    titulo: 'Semana 5 — A Consistência',
    mensagem: 'O hábito está a formar-se. Não estás a fazer dieta — estás a viver.',
    expectativa: 'Perda de peso estável (~0.5-1kg/semana).',
    dica: 'Adiciona variedade ao menu para não te aborreceres.'
  },
  6: {
    titulo: 'Semana 6 — A Confiança',
    mensagem: 'Olhas para o espelho com outros olhos. O corpo responde-te.',
    expectativa: 'Marcos de peso ou medidas atingidos.',
    dica: 'Celebra. Conta a alguém. A vergonha esconde, o orgulho transforma.'
  },
  8: {
    titulo: 'Semana 8 — A Manutenção Activa',
    mensagem: 'Já não és principiante. Conheces o teu corpo a este nível como nunca.',
    expectativa: 'Resultados visíveis para os outros.',
    dica: 'Reavalia a meta. Talvez seja hora de subir a fasquia.'
  },
  12: {
    titulo: 'Semana 12 — A Integração',
    mensagem: 'Três meses depois, és uma pessoa diferente. O corpo conta a história.',
    expectativa: 'Perda significativa, hábitos sólidos.',
    dica: 'Considera transição para fase de manutenção. Fala com a Vivianne.'
  }
};

const CONTEUDO_LOW_CARB = {
  1: {
    titulo: 'Semana 1 — Reduzir Sem Sofrer',
    mensagem: 'Estás a reduzir hidratos refinados. Substitui pão branco por integral, arroz branco por integral.',
    expectativa: 'Perda de 1-2kg (água + redução de inflamação).',
    dica: 'Lê os rótulos. O açúcar esconde-se em tudo.'
  },
  2: {
    titulo: 'Semana 2 — Estabilizar Glicemia',
    mensagem: 'A glicemia está a estabilizar. Menos picos, menos quedas, menos vontade de doce.',
    expectativa: 'Energia mais constante. Fome menos errática.',
    dica: 'Combina sempre hidrato com proteína para evitar picos.'
  },
  4: {
    titulo: 'Semana 4 — A Transformação',
    mensagem: 'Já notas diferença visual e na energia. Os hidratos integrais bastam.',
    expectativa: 'Roupa começa a folgar. Pele melhora.',
    dica: 'Mede a cintura. Compara com o início.'
  },
  8: {
    titulo: 'Semana 8 — O Hábito Forma-se',
    mensagem: 'Não pensas mais nas escolhas — fazes naturalmente. Isto é vitória.',
    expectativa: 'Resultados sólidos. Energia estável.',
    dica: 'Documenta o teu menu favorito. É a tua nova "comida normal".'
  }
};

const CONTEUDO_EQUILIBRADO = {
  1: {
    titulo: 'Semana 1 — O Método da Mão',
    mensagem: 'Estás a aprender a equilibrar o prato: 1 palma de proteína, 1 punho de legumes, 1 mão de hidrato, 1 polegar de gordura.',
    expectativa: 'Pequenos ajustes nas porções.',
    dica: 'Tira fotos das tuas refeições para calibrares o olho.'
  },
  2: {
    titulo: 'Semana 2 — Mastigar Devagar',
    mensagem: 'Foco em comer 20 minutos por refeição. A saciedade vem com o tempo, não com a quantidade.',
    expectativa: 'Comes menos sem perceber, com mais prazer.',
    dica: 'Pousa o garfo entre garfadas.'
  },
  4: {
    titulo: 'Semana 4 — Os Sinais Mudam',
    mensagem: 'Roupa começa a sentar-se diferente. Mais energia para fazer o que gostas.',
    expectativa: 'Perda gradual e sustentável.',
    dica: 'Mede a cintura. Anota como te sentes.'
  },
  8: {
    titulo: 'Semana 8 — Um Estilo de Vida',
    mensagem: 'Já não é dieta. É como comes. Permite-te flexibilidade 80/20.',
    expectativa: 'Hábitos consolidados. Bem-estar visível.',
    dica: 'Refeições sociais são para aproveitar — não para te punires.'
  }
};

const TABELA = {
  keto_if: CONTEUDO_KETO,
  low_carb: CONTEUDO_LOW_CARB,
  equilibrado: CONTEUDO_EQUILIBRADO
};

export const obterConteudoSemanal = (abordagem, semana) => {
  const tabela = TABELA[abordagem] || TABELA.equilibrado;
  if (tabela[semana]) return tabela[semana];
  // Procurar a semana mais próxima abaixo (ex: semana 5 → semana 4 ou 5 → 5 etc.)
  const semanas = Object.keys(tabela).map(Number).sort((a, b) => a - b);
  let melhor = semanas[0];
  for (const s of semanas) {
    if (s <= semana) melhor = s;
    else break;
  }
  return tabela[melhor];
};

export const calcularSemanaPrograma = (dataInicio) => {
  if (!dataInicio) return 1;
  const inicio = new Date(dataInicio);
  const hoje = new Date();
  const diffDias = Math.floor((hoje - inicio) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.ceil((diffDias + 1) / 7));
};
