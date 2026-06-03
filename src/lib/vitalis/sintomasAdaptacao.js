// Sintomas de adaptação por abordagem alimentar
// 3 níveis: normais (verde), atenção (âmbar), parar (vermelho)
// Baseado nos protocolos clínicos de transição metabólica

export const SINTOMAS = {
  keto_if: {
    normais: [
      { chave: 'dor_cabeca', nome: 'Dor de cabeça', descricao: 'Normal nos primeiros 3-5 dias. Bebe mais água com sal.', dias: '1-5' },
      { chave: 'cansaco', nome: 'Cansaço', descricao: 'O corpo está a adaptar-se. Passa em 5-7 dias.', dias: '1-7' },
      { chave: 'boca_seca', nome: 'Boca seca / mau hálito', descricao: 'Sinal de cetose. Normal e temporário.', dias: '3-14' },
      { chave: 'fome', nome: 'Fome estranha', descricao: 'Passa com magnésio e paciência.', dias: '1-5' },
      { chave: 'vontade_doce', nome: 'Vontade de doce', descricao: 'O açúcar é viciante. Passa após 1 semana.', dias: '1-10' }
    ],
    atencao: [
      { chave: 'tonturas', nome: 'Tonturas frequentes', accao: 'Aumenta sal e água. Se persistir 3+ dias, contacta a coach.' },
      { chave: 'caibras', nome: 'Cãibras musculares', accao: 'Toma magnésio à noite. Aumenta sal e potássio (abacate).' },
      { chave: 'sono_pior', nome: 'Sono pior', accao: 'Antecipa bulletproof para 14h. Magnésio à noite.' },
      { chave: 'obstipacao', nome: 'Obstipação', accao: 'Mais vegetais verdes, mais água, mais magnésio.' },
      { chave: 'fome_persistente', nome: 'Fome persistente (2+ semanas)', accao: 'Aumenta gordura nas refeições. Fala com a Vivianne.' }
    ],
    parar: [
      { chave: 'palpitacoes', nome: 'Palpitações fortes', accao: 'PÁRA o jejum e procura médico imediatamente.' },
      { chave: 'vomitos', nome: 'Vómitos repetidos', accao: 'PÁRA e procura médico.' },
      { chave: 'confusao', nome: 'Confusão mental severa', accao: 'PÁRA e procura médico.' },
      { chave: 'desmaio', nome: 'Desmaio ou pré-desmaio', accao: 'PÁRA imediatamente, come algo, contacta médico.' }
    ]
  },
  low_carb: {
    normais: [
      { chave: 'fome', nome: 'Fome inicial', descricao: 'O corpo está a regular-se. Passa em 3-5 dias.', dias: '1-5' },
      { chave: 'cansaco', nome: 'Cansaço leve', descricao: 'Reduzir hidratos pode dar quebra inicial. Passa rápido.', dias: '1-3' },
      { chave: 'vontade_doce', nome: 'Vontade de doce', descricao: 'Diminui à medida que estabilizas a glicemia.', dias: '1-7' }
    ],
    atencao: [
      { chave: 'tonturas', nome: 'Tonturas', accao: 'Aumenta hidratos integrais. Bebe mais água.' },
      { chave: 'fome_persistente', nome: 'Fome persistente (2+ semanas)', accao: 'Aumenta proteína e gordura nas refeições.' },
      { chave: 'sono_pior', nome: 'Sono pior', accao: 'Mantém um pequeno hidrato ao jantar (batata-doce, arroz).' }
    ],
    parar: [
      { chave: 'desmaio', nome: 'Desmaio ou pré-desmaio', accao: 'PÁRA, come algo com hidratos, contacta médico.' }
    ]
  },
  equilibrado: {
    normais: [
      { chave: 'fome', nome: 'Fome em horários novos', descricao: 'O corpo está a adaptar-se aos teus horários. Passa em 3-5 dias.', dias: '1-5' },
      { chave: 'vontade_doce', nome: 'Vontade de doce após refeições', descricao: 'Memória do hábito. Passa com substituições saudáveis.', dias: '1-14' }
    ],
    atencao: [
      { chave: 'cansaco_persistente', nome: 'Cansaço persistente', accao: 'Verifica se estás a comer o suficiente. Aumenta hidratos integrais ao almoço.' },
      { chave: 'sono_pior', nome: 'Sono pior', accao: 'Janta mais cedo. Reduz cafeína à tarde.' }
    ],
    parar: [
      { chave: 'desmaio', nome: 'Desmaio ou pré-desmaio', accao: 'PÁRA, come algo, contacta médico.' }
    ]
  }
};

export const obterSintomas = (abordagem) => {
  return SINTOMAS[abordagem] || SINTOMAS.equilibrado;
};

export const getNivelGravidade = (categoria) => {
  if (categoria === 'parar') return { cor: '#DC2626', bg: '#FEE2E2', borda: '#FCA5A5', label: 'PARAR' };
  if (categoria === 'atencao') return { cor: '#D97706', bg: '#FEF3C7', borda: '#FCD34D', label: 'ATENÇÃO' };
  return { cor: '#059669', bg: '#D1FAE5', borda: '#6EE7B7', label: 'NORMAL' };
};
