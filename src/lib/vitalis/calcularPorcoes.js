// src/lib/vitalis/calcularPorcoes.js
// Função ÚNICA e partilhada para calcular porções diárias (Método da Mão)
// Usada pelo PDF (PlanoHTML), dashboard do coach, e vista da cliente (PlanoAlimentar)

/**
 * Calcula as porções diárias do Método da Mão a partir dos dados do plano.
 *
 * Conversões Precision Nutrition:
 * - 1 palma de proteína ≈ 25g proteína
 * - 1 punho de legumes (valor guardado no plano, ou 4 por defeito)
 * - 1 mão em concha de hidratos ≈ 30g hidratos
 * - 1 polegar de gordura ≈ 10g gordura
 *
 * @param {Object} plano - Objecto do plano (vitalis_meal_plans row)
 * @returns {{ proteina: number, legumes: number, hidratos: number, gordura: number }}
 */
export function calcularPorcoesDiarias(plano) {
  if (!plano) return { proteina: 0, legumes: 4, hidratos: 0, gordura: 0 };

  // Parse receitas_incluidas para extrair config guardada
  let receitasConfig = {};
  try {
    const raw = plano.receitas_incluidas;
    receitasConfig = raw
      ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
      : {};
  } catch (e) { /* ignore parse errors */ }

  // Porções diárias guardadas no plano (se existirem)
  const porcoesDiarias = receitasConfig.porcoes_diarias || {};

  // Macros do plano
  const proteinaG = plano.proteina_g || 0;
  const carboidratosG = plano.carboidratos_g || 0;
  const gorduraG = plano.gordura_g || 0;

  // Porções por refeição (legacy — guardadas no plano antes desta correcção)
  const porcoesRefeicao = receitasConfig['porções_por_refeicao']
    || receitasConfig.porcoes_por_refeicao
    || {};

  // Número de refeições
  const numRefeicoes = receitasConfig.num_refeicoes || 3;

  return {
    // Prioridade: porcoes_diarias guardadas > cálculo a partir dos macros
    proteina: porcoesDiarias.proteina || Math.round(proteinaG / 25),
    legumes: porcoesDiarias.legumes || porcoesRefeicao.legumes || 4,
    hidratos: porcoesDiarias.hidratos || Math.round(carboidratosG / 30),
    gordura: porcoesDiarias.gordura || Math.round(gorduraG / 10),
  };
}

/**
 * Extrai configuração do plano (num_refeicoes, horarios) de receitas_incluidas
 * @param {Object} plano - Objecto do plano
 * @returns {{ numRefeicoes: number, horarios: string[] }}
 */
export function extrairConfigPlano(plano) {
  let receitasConfig = {};
  try {
    const raw = plano?.receitas_incluidas;
    receitasConfig = raw
      ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
      : {};
  } catch (e) { /* ignore */ }

  return {
    numRefeicoes: receitasConfig.num_refeicoes || 3,
    horarios: receitasConfig.horarios || [],
  };
}
