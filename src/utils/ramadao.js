/**
 * Ramadão - Utilidade de datas dinâmicas
 *
 * Datas aproximadas do Ramadão por ano gregoriano.
 * O calendário islâmico é lunar, recuando ~10-12 dias/ano.
 * Datas exactas dependem da observação da lua - estas são estimativas.
 */

// Tabela de datas aproximadas do Ramadão (início e fim)
const RAMADAN_DATES = {
  2025: { inicio: [2, 28], fim: [3, 30] },   // 28 Fev - 30 Mar
  2026: { inicio: [2, 17], fim: [3, 19] },   // 17 Fev - 19 Mar
  2027: { inicio: [2, 7],  fim: [3, 8] },    // 7 Fev - 8 Mar
  2028: { inicio: [1, 27], fim: [2, 25] },   // 27 Jan - 25 Fev
  2029: { inicio: [1, 15], fim: [2, 13] },   // 15 Jan - 13 Fev
  2030: { inicio: [1, 5],  fim: [2, 3] },    // 5 Jan - 3 Fev
  2030.5: { inicio: [12, 25], fim: [12, 31] }, // Dez 2030 (2º Ramadão no ano)
  2031: { inicio: [0, 1],  fim: [1, 23] },   // ~25 Dez 2030 - 23 Jan 2031
  2032: { inicio: [12, 14], fim: [12, 31] },  // ~14 Dez - Jan seguinte
};

/**
 * Retorna as datas de início e fim do Ramadão para o ano actual.
 * Procura o Ramadão mais próximo (pode ser do ano actual ou adjacente).
 */
export function getRamadanDates(anoRef) {
  const ano = anoRef || new Date().getFullYear();

  // Tenta o ano exacto
  if (RAMADAN_DATES[ano]) {
    const d = RAMADAN_DATES[ano];
    return {
      inicio: new Date(ano, d.inicio[0], d.inicio[1]),
      fim: new Date(ano, d.fim[0], d.fim[1])
    };
  }

  // Se não encontrar, estima baseado no recuo de ~10.63 dias/ano
  // Usa 2026 como referência
  const refAno = 2026;
  const refInicio = new Date(2026, 1, 17); // 17 Fev 2026
  const diffAnos = ano - refAno;
  const diffDias = Math.round(diffAnos * -10.63);

  const inicio = new Date(refInicio);
  inicio.setDate(inicio.getDate() + diffDias);
  inicio.setFullYear(ano + Math.floor((refInicio.getMonth() + diffDias / 30) / 12));

  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 30);

  return { inicio, fim };
}

/**
 * Verifica se estamos dentro do período do Ramadão.
 */
export function isRamadan() {
  const agora = new Date();
  const { inicio, fim } = getRamadanDates(agora.getFullYear());
  return agora >= inicio && agora <= fim;
}

/**
 * Verifica se estamos perto do Ramadão (X dias antes ou durante).
 * Útil para mostrar banners sazonais.
 */
export function isNearRamadan(diasAntes = 5) {
  const agora = new Date();
  const ano = agora.getFullYear();
  const { inicio, fim } = getRamadanDates(ano);

  const preRamadan = new Date(inicio);
  preRamadan.setDate(preRamadan.getDate() - diasAntes);

  return {
    mostrar: agora >= preRamadan && agora <= fim,
    dentroRamadan: agora >= inicio && agora <= fim,
    inicio,
    fim
  };
}

/**
 * Verifica se o utilizador observa o Ramadão (via localStorage).
 * Definido a partir do campo observa_ramadao do intake.
 */
export function observaRamadao() {
  try {
    const val = localStorage.getItem('vitalis-observa-ramadao');
    return val === 'sim' || val === 'as_vezes';
  } catch {
    return false;
  }
}

export function setObservaRamadao(valor) {
  try {
    if (valor) localStorage.setItem('vitalis-observa-ramadao', valor);
  } catch {}
}
