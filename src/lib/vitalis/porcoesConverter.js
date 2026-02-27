// src/lib/vitalis/porcoesConverter.js
// Motor de conversão porções-mão ↔ gramas (Precision Nutrition)

/**
 * Tabela de conversão Método da Mão → gramas
 * Baseado em Precision Nutrition + adaptações para contexto real
 */
export const CONVERSOES_MAO = {
  palma: {
    g: 120,
    macro: 'proteina',
    desc: 'palma da mão',
    descPlural: 'palmas',
    emoji: '🫲',
    cor: 'rose',
    macrosPor1: { calorias: 165, proteina: 30, carboidratos: 0, gordura: 4 },
    dica: 'Tamanho e espessura da tua palma (sem dedos)'
  },
  punho: {
    g: 150,
    macro: 'legumes',
    desc: 'punho',
    descPlural: 'punhos',
    emoji: '✊',
    cor: 'green',
    macrosPor1: { calorias: 35, proteina: 2, carboidratos: 7, gordura: 0 },
    dica: 'Tamanho do teu punho fechado'
  },
  concha: {
    g: 130,
    macro: 'hidratos',
    desc: 'mão em concha',
    descPlural: 'mãos em concha',
    emoji: '🤲',
    cor: 'amber',
    macrosPor1: { calorias: 130, proteina: 3, carboidratos: 30, gordura: 0.5 },
    dica: 'Quantidade que cabe na tua mão em concha'
  },
  polegar: {
    g: 15,
    macro: 'gordura',
    desc: 'polegar',
    descPlural: 'polegares',
    emoji: '👍',
    cor: 'purple',
    macrosPor1: { calorias: 120, proteina: 0, carboidratos: 0, gordura: 14 },
    dica: 'Ponta do polegar (1ª falange)'
  }
};

/**
 * Converter gramas para porções-mão
 * @param {number} gramas
 * @param {string} tipoMao - palma, punho, concha, polegar
 * @returns {number} porções (arredondado a 0.25)
 */
export function gramasParaPorcoes(gramas, tipoMao) {
  const conv = CONVERSOES_MAO[tipoMao];
  if (!conv || !gramas) return 0;
  const raw = gramas / conv.g;
  return Math.round(raw * 4) / 4; // arredondar a 0.25
}

/**
 * Converter porções-mão para gramas
 * @param {number} porcoes
 * @param {string} tipoMao - palma, punho, concha, polegar
 * @returns {number} gramas
 */
export function porcoesParaGramas(porcoes, tipoMao) {
  const conv = CONVERSOES_MAO[tipoMao];
  if (!conv || !porcoes) return 0;
  return Math.round(porcoes * conv.g);
}

/**
 * Calcular macros de um alimento para uma dada quantidade em gramas
 * @param {Object} alimento - { calorias_100g, proteina_100g, carboidratos_100g, gordura_100g }
 * @param {number} quantidadeG - gramas
 * @returns {{ calorias: number, proteina: number, carboidratos: number, gordura: number }}
 */
export function calcularMacrosAlimento(alimento, quantidadeG) {
  if (!alimento || !quantidadeG) {
    return { calorias: 0, proteina: 0, carboidratos: 0, gordura: 0 };
  }
  const factor = quantidadeG / 100;
  return {
    calorias: Math.round((alimento.calorias_100g || 0) * factor),
    proteina: Math.round((alimento.proteina_100g || 0) * factor * 10) / 10,
    carboidratos: Math.round((alimento.carboidratos_100g || 0) * factor * 10) / 10,
    gordura: Math.round((alimento.gordura_100g || 0) * factor * 10) / 10
  };
}

/**
 * Calcular macros usando porções-mão (quando não há dados nutricionais exactos)
 * @param {number} porcoes
 * @param {string} tipoMao
 * @returns {{ calorias: number, proteina: number, carboidratos: number, gordura: number }}
 */
export function calcularMacrosPorcaoMao(porcoes, tipoMao) {
  const conv = CONVERSOES_MAO[tipoMao];
  if (!conv || !porcoes) {
    return { calorias: 0, proteina: 0, carboidratos: 0, gordura: 0 };
  }
  return {
    calorias: Math.round(conv.macrosPor1.calorias * porcoes),
    proteina: Math.round(conv.macrosPor1.proteina * porcoes * 10) / 10,
    carboidratos: Math.round(conv.macrosPor1.carboidratos * porcoes * 10) / 10,
    gordura: Math.round(conv.macrosPor1.gordura * porcoes * 10) / 10
  };
}

/**
 * Detectar o tipo de porção-mão mais adequado para um alimento
 * @param {string} categoria - proteina, hidrato, gordura, legume, fruta, lacteo, etc.
 * @returns {string} tipoMao - palma, punho, concha, polegar
 */
export function detectarTipoMao(categoria) {
  switch (categoria) {
    case 'proteina': return 'palma';
    case 'hidrato': return 'concha';
    case 'gordura': return 'polegar';
    case 'legume': return 'punho';
    case 'fruta': return 'punho';
    case 'lacteo': return 'concha';
    case 'bebida': return null;
    case 'snack': return 'concha';
    default: return 'concha';
  }
}

/**
 * Formatar porção para display
 * @param {number} porcoes - ex: 1.5
 * @param {string} tipoMao - palma, punho, concha, polegar
 * @returns {string} ex: "1.5 palmas" ou "1 palma"
 */
export function formatarPorcao(porcoes, tipoMao) {
  const conv = CONVERSOES_MAO[tipoMao];
  if (!conv) return `${porcoes}`;
  const label = porcoes === 1 ? conv.desc : conv.descPlural;
  return `${porcoes} ${label}`;
}

/**
 * Somar macros de vários items
 * @param {Array<{ calorias: number, proteina: number, carboidratos: number, gordura: number }>} items
 * @returns {{ calorias: number, proteina: number, carboidratos: number, gordura: number }}
 */
export function somarMacros(items) {
  return items.reduce((acc, item) => ({
    calorias: acc.calorias + (item.calorias || 0),
    proteina: Math.round((acc.proteina + (item.proteina || 0)) * 10) / 10,
    carboidratos: Math.round((acc.carboidratos + (item.carboidratos || 0)) * 10) / 10,
    gordura: Math.round((acc.gordura + (item.gordura || 0)) * 10) / 10
  }), { calorias: 0, proteina: 0, carboidratos: 0, gordura: 0 });
}
