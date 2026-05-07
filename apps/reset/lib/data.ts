import type { DiaSemana } from './dates'

export type CategoriaAncora = 'corpo' | 'mente' | 'emocao' | 'mundo'

export type Ancora = {
  id: string
  titulo: string
  detalhe: string
  categoria?: CategoriaAncora
}

// Pool de âncoras · catálogo do qual ela escolhe as que estão activas.
// Cada uma tem categoria para agrupar no editor.
export const ANCORAS_POOL: Ancora[] = [
  // CORPO
  { id: 'pa_proteina', titulo: 'Proteína no PA', detalhe: '30g+ proteína · sem carbo · rompe o jejum em consciência', categoria: 'corpo' },
  { id: 'janela_9_19', titulo: 'Janela alimentar', detalhe: 'jejum ≥14h · ver timer em /jejum', categoria: 'corpo' },
  { id: 'carbos_zero', titulo: 'Carbos zero', detalhe: 'sem cinzentos · refeed só sábado à noite', categoria: 'corpo' },
  { id: 'eletrolitos', titulo: 'Electrólitos', detalhe: 'sal de manhã · magnésio à noite', categoria: 'corpo' },
  { id: 'treino_feito', titulo: 'Movimento do dia', detalhe: 'treino ou caminhada · 30min', categoria: 'corpo' },
  { id: 'caminhada', titulo: 'Caminhada 20min', detalhe: 'fora de casa · sem podcast', categoria: 'corpo' },
  { id: 'alongamento', titulo: 'Alongamento 5min', detalhe: 'manhã ou antes de deitar', categoria: 'corpo' },
  { id: 'agua_oito', titulo: '8 copos de água', detalhe: 'pequenos golos ao longo do dia', categoria: 'corpo' },
  // MENTE
  { id: 'ecra_21h', titulo: 'Ecrã off às 21h', detalhe: 'cama 22h30 · carregador na cozinha', categoria: 'mente' },
  { id: 'meditacao', titulo: 'Meditação 10min', detalhe: 'silêncio ou guiada', categoria: 'mente' },
  { id: 'respiracao', titulo: 'Respiração consciente', detalhe: '5min · 4-7-8 ou box breathing', categoria: 'mente' },
  { id: 'leitura_livro', titulo: 'Leitura sem ecrã', detalhe: '20min de papel', categoria: 'mente' },
  { id: 'silencio', titulo: 'Silêncio 10min', detalhe: 'sem música · sem voz · sem notificações', categoria: 'mente' },
  // EMOÇÃO
  { id: 'caderno_copo', titulo: 'Caderno antes do copo', detalhe: 'hora + emoção antes de decidir', categoria: 'emocao' },
  { id: 'diario_3', titulo: 'Diário · 3 frases', detalhe: 'o que sentiu · o que viu · o que ficou', categoria: 'emocao' },
  { id: 'gratidao', titulo: '3 gratidões', detalhe: 'concretas · do dia · não genéricas', categoria: 'emocao' },
  // MUNDO
  { id: 'sol_manha', titulo: 'Sol matinal', detalhe: '10min de sol nos olhos · regula ritmo', categoria: 'mundo' },
  { id: 'contacto_real', titulo: 'Contacto real', detalhe: 'telefonema ou encontro · não chat', categoria: 'mundo' },
  { id: 'ar_livre', titulo: 'Ar livre', detalhe: 'sair de casa pelo menos 1×', categoria: 'mundo' }
]

// Default · as 7 originais do plano. Se ela não escolher activas, usa estas.
export const ANCORAS_DEFAULT_IDS = [
  'pa_proteina', 'janela_9_19', 'carbos_zero', 'eletrolitos',
  'treino_feito', 'ecra_21h', 'caderno_copo'
]

// Compat · alguns sítios ainda lêem ANCORAS directamente.
// Aponta para o pool até serem migrados para getAncorasActivas().
export const ANCORAS: Ancora[] = ANCORAS_POOL.filter(a => ANCORAS_DEFAULT_IDS.includes(a.id))

export const CATEGORIAS_LABEL: Record<CategoriaAncora, string> = {
  corpo: 'Corpo',
  mente: 'Mente',
  emocao: 'Emoção',
  mundo: 'Mundo'
}

export const TREINO_SEMANAL: Record<DiaSemana, { tipo: string; descricao: string; descanso: boolean }> = {
  Segunda: { tipo: 'Pernas + Glúteos', descricao: '30min · halteres · agachamento, peso morto, lunges', descanso: false },
  Terça: { tipo: 'Cardio leve', descricao: '30min · caminhada rápida ou bicicleta', descanso: false },
  Quarta: { tipo: 'Descanso activo', descricao: 'caminhada com Cris ou alongamentos', descanso: true },
  Quinta: { tipo: 'Costas + Ombros + Bíceps', descricao: '30min · halteres · remada, press, curls', descanso: false },
  Sexta: { tipo: 'Descanso', descricao: 'caminhada se apetecer', descanso: true },
  Sábado: { tipo: 'Full body', descricao: '40min · circuito intenso · refeed à noite', descanso: false },
  Domingo: { tipo: 'Descanso total', descricao: 'pausa real · sem culpa', descanso: true }
}

export const MANTRAS = [
  'O teu corpo já sabe o caminho. Este plano só o guia.',
  'Subtracção, não adição.',
  'Suficiente é melhor que ótimo.',
  'Não estás a começar. Estás a regressar.',
  'Estás cansada, não falhada.',
  'Movimento é descompressão.',
  'A fita métrica não mente.',
  'Hoje, esta refeição. Não a vida toda.',
  'Aceitar ajuda não te diminui.',
  'Progresso, não perfeição.'
]

export const REFEICOES = {
  pequenoAlmoco: [
    { nome: 'Ovos mexidos + abacate + folhas', macros: '~28g proteína · 30g gordura · 4g carbo' },
    { nome: 'Omelete com espinafres e queijo feta', macros: '~25g proteína · 22g gordura · 3g carbo' },
    { nome: 'Iogurte grego + nozes + canela', macros: '~20g proteína · 18g gordura · 6g carbo' },
    { nome: 'Salmão fumado + ovo cozido + tomate', macros: '~32g proteína · 20g gordura · 3g carbo' }
  ],
  almoco: [
    { nome: 'Frango grelhado + brócolos + azeite', macros: '~40g proteína · 20g gordura · 6g carbo' },
    { nome: 'Peixe grelhado + courgette + salada', macros: '~35g proteína · 18g gordura · 5g carbo' },
    { nome: 'Carne picada + couve refogada', macros: '~38g proteína · 25g gordura · 4g carbo' },
    { nome: 'Atum + ovo + alface + maionese caseira', macros: '~36g proteína · 28g gordura · 2g carbo' }
  ],
  jantar: [
    { nome: 'Sopa de legumes (sem batata) + ovo cozido', macros: '~14g proteína · 12g gordura · 8g carbo' },
    { nome: 'Sardinhas + salada de tomate', macros: '~28g proteína · 18g gordura · 5g carbo' },
    { nome: 'Frango assado + abóbora courgete', macros: '~32g proteína · 14g gordura · 6g carbo' },
    { nome: 'Omelete + salada verde', macros: '~22g proteína · 18g gordura · 3g carbo' }
  ],
  snacks: [
    { nome: 'Frutos secos (mão fechada)', macros: '~6g proteína · 14g gordura · 4g carbo' },
    { nome: 'Queijo + azeitonas', macros: '~10g proteína · 14g gordura · 1g carbo' },
    { nome: 'Ovo cozido', macros: '~6g proteína · 5g gordura · 0g carbo' },
    { nome: 'Bulletproof Coffee (à tarde)', macros: '~0g proteína · 16g gordura · 0g carbo' }
  ],
  evitar: [
    'Pão, arroz, massa, batata, milho',
    'Açúcar, mel, doces, chocolate (excepto >85% pontual)',
    'Fruta (excepto frutos vermelhos a partir da semana 4)',
    'Bebidas com açúcar, sumos naturais, refrigerantes',
    'Álcool — caderno antes do copo'
  ]
}

export const COMPRAS = {
  proteinas: ['Ovos (24)', 'Frango (1,5kg)', 'Peixe / atum em lata', 'Carne picada', 'Sardinhas em lata'],
  vegetais: ['Folhas verdes (alface, espinafres)', 'Brócolos, couve-flor', 'Courgette, abóbora', 'Tomate, pepino', 'Couve, cebola, alho'],
  gorduras: ['Azeite extra-virgem', 'Abacate (4)', 'Frutos secos (amêndoa, noz)', 'Azeitonas', 'Manteiga'],
  outros: ['Queijo (feta, parmesão)', 'Iogurte grego natural', 'Sal grosso', 'Magnésio bisglicinato 400mg', 'Café'],
  fimSemana: ['Batata-doce ou arroz integral (refeed)', 'Frutos vermelhos (a partir semana 4)']
}

export const SINAIS_PROGRESSO = [
  'Conseguir olhar-te ao espelho sem desviar',
  'Roupa que está a magoar começar a servir',
  'Vontade de álcool a baixar sem esforço',
  'Acordar antes da Cris, voluntariamente',
  'Pensamento mais limpo',
  'Cintura a descer (medir quinzenal)',
  'Energia 4-5 mais dias do que 1-2'
]

export const REGRAS_TREINO = [
  'Treino antes do PA (jejum curto, queima gordura)',
  '30min máximo nas primeiras 4 semanas',
  'Cargas conservadoras nas primeiras 2 semanas',
  'Sem corrida até semana 4',
  'Movimento como descompressão — substitui o álcool nesse papel',
  '"Suficiente é melhor que ótimo" — durante 60 dias'
]
