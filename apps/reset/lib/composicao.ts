'use client'

// Composição corporal · estimativas de % gordura por várias fórmulas.
// Todas são ESTIMATIVAS · não substituem DEXA / BodPod / impedância profissional.
// Boa precisão clínica: ±3-5% para RFM e US Navy quando bem medidas.

export type SexoBF = 'F' | 'M' | 'O'

type EntradaRFM = { alturaCm: number; cinturaCm: number; sexo: SexoBF }
// Relative Fat Mass (Woolcott & Bergman, 2018) · só altura + cintura
// F: 76 - 20 × (altura/cintura)
// M: 64 - 20 × (altura/cintura)
// O: usa média
export function rfm({ alturaCm, cinturaCm, sexo }: EntradaRFM): number | null {
  if (alturaCm <= 0 || cinturaCm <= 0) return null
  const ratio = alturaCm / cinturaCm
  let bf: number
  if (sexo === 'M') bf = 64 - 20 * ratio
  else if (sexo === 'F') bf = 76 - 20 * ratio
  else bf = (76 + 64) / 2 - 20 * ratio
  return Math.max(2, Math.min(60, Math.round(bf * 10) / 10))
}

type EntradaNavy = { alturaCm: number; cinturaCm: number; pescocoCm: number; ancaCm?: number; sexo: SexoBF }
// US Navy circumference method · mais preciso (~ ±3%) mas requer mais medidas.
// F: 163.205 × log10(cintura + anca - pescoço) - 97.684 × log10(altura) - 78.387
// M: 86.010 × log10(cintura - pescoço) - 70.041 × log10(altura) + 36.76
export function navy({ alturaCm, cinturaCm, pescocoCm, ancaCm, sexo }: EntradaNavy): number | null {
  if (alturaCm <= 0 || cinturaCm <= 0 || pescocoCm <= 0) return null
  let bf: number
  if (sexo === 'M' || (sexo === 'O' && !ancaCm)) {
    if (cinturaCm - pescocoCm <= 0) return null
    bf = 86.010 * Math.log10(cinturaCm - pescocoCm) - 70.041 * Math.log10(alturaCm) + 36.76
  } else {
    if (!ancaCm || ancaCm <= 0) return null
    if (cinturaCm + ancaCm - pescocoCm <= 0) return null
    bf = 163.205 * Math.log10(cinturaCm + ancaCm - pescocoCm) - 97.684 * Math.log10(alturaCm) - 78.387
  }
  return Math.max(2, Math.min(60, Math.round(bf * 10) / 10))
}

type EntradaDeurenberg = { pesoKg: number; alturaCm: number; idade: number; sexo: SexoBF }
// Deurenberg (BMI-based) · só peso/altura/idade · menos preciso mas serve de fallback.
// %BF = 1.20 × BMI + 0.23 × idade - 10.8 × (1 se M else 0) - 5.4
export function deurenberg({ pesoKg, alturaCm, idade, sexo }: EntradaDeurenberg): number | null {
  if (pesoKg <= 0 || alturaCm <= 0 || idade <= 0) return null
  const bmi = pesoKg / ((alturaCm / 100) ** 2)
  const sexoFactor = sexo === 'M' ? 1 : sexo === 'O' ? 0.5 : 0
  const bf = 1.20 * bmi + 0.23 * idade - 10.8 * sexoFactor - 5.4
  return Math.max(2, Math.min(60, Math.round(bf * 10) / 10))
}

// Massa magra e gorda em kg
export function compor(pesoKg: number, bfPct: number): { gorduraKg: number; magraKg: number } {
  const gorduraKg = Math.round((pesoKg * bfPct / 100) * 10) / 10
  const magraKg = Math.round((pesoKg - gorduraKg) * 10) / 10
  return { gorduraKg, magraKg }
}

// Categoria de % gordura por sexo (ACE / AČSM guidelines)
export function categoriaBF(bf: number, sexo: SexoBF): { label: string; cor: string } {
  const ranges = sexo === 'M'
    ? [
        { max: 5, label: 'essencial · risco', cor: '#C9614E' },
        { max: 13, label: 'atleta', cor: '#7B9A4F' },
        { max: 17, label: 'fitness', cor: '#7B9A4F' },
        { max: 24, label: 'aceitável', cor: '#D4A14E' },
        { max: 100, label: 'acima do recomendado', cor: '#C9614E' }
      ]
    : [
        { max: 13, label: 'essencial · risco', cor: '#C9614E' },
        { max: 20, label: 'atleta', cor: '#7B9A4F' },
        { max: 24, label: 'fitness', cor: '#7B9A4F' },
        { max: 31, label: 'aceitável', cor: '#D4A14E' },
        { max: 100, label: 'acima do recomendado', cor: '#C9614E' }
      ]
  return ranges.find(r => bf <= r.max) ?? ranges[ranges.length - 1]
}

// Escolhe a melhor fórmula disponível dadas as medidas e devolve resultado nomeado
export type ResultadoBF = {
  metodo: 'rfm' | 'navy' | 'deurenberg'
  metodoLabel: string
  bf: number
  gorduraKg: number
  magraKg: number
  precisao: 'alta' | 'média' | 'baixa'
}

export function estimarMelhor(input: {
  pesoKg: number | null
  alturaCm: number | null
  idade: number | null
  sexo: SexoBF
  cinturaCm?: number | null
  pescocoCm?: number | null
  ancaCm?: number | null
}): ResultadoBF | null {
  const { pesoKg, alturaCm, idade, sexo, cinturaCm, pescocoCm, ancaCm } = input
  if (!pesoKg || !alturaCm) return null

  // Preferência: Navy (se tem cintura + pescoço) > RFM (cintura) > Deurenberg (BMI)
  if (cinturaCm && pescocoCm) {
    const bf = navy({ alturaCm, cinturaCm, pescocoCm, ancaCm: ancaCm ?? undefined, sexo })
    if (bf !== null) {
      const { gorduraKg, magraKg } = compor(pesoKg, bf)
      return { metodo: 'navy', metodoLabel: 'US Navy', bf, gorduraKg, magraKg, precisao: 'alta' }
    }
  }
  if (cinturaCm) {
    const bf = rfm({ alturaCm, cinturaCm, sexo })
    if (bf !== null) {
      const { gorduraKg, magraKg } = compor(pesoKg, bf)
      return { metodo: 'rfm', metodoLabel: 'RFM (cintura)', bf, gorduraKg, magraKg, precisao: 'média' }
    }
  }
  if (idade) {
    const bf = deurenberg({ pesoKg, alturaCm, idade, sexo })
    if (bf !== null) {
      const { gorduraKg, magraKg } = compor(pesoKg, bf)
      return { metodo: 'deurenberg', metodoLabel: 'Deurenberg (BMI)', bf, gorduraKg, magraKg, precisao: 'baixa' }
    }
  }
  return null
}
