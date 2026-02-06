// ============================================================
// GENERO - Sistema Gender-Inclusive
// Sete Ecos - Vivianne dos Santos
// ============================================================

// Opcoes de genero para seleccao
export const GENEROS = [
  { valor: 'F', label: 'Feminino' },
  { valor: 'M', label: 'Masculino' },
  { valor: 'O', label: 'Prefiro nao especificar' }
];

// ============================================================
// SAUDACAO - fallback quando nao ha nome
// ============================================================

export function saudacao(genero) {
  switch (genero) {
    case 'M': return 'Guerreiro';
    case 'O': return 'Explorador';
    default: return 'Guerreira';
  }
}

export function bemVindo(genero) {
  switch (genero) {
    case 'M': return 'Bem-vindo';
    case 'O': return 'Bem-vindo(a)';
    default: return 'Bem-vinda';
  }
}

// ============================================================
// OPCAO LABEL - display gendered para opcoes de perguntas
// Os valores armazenados na BD nao mudam, so o display
// ============================================================

const OPCAO_GENERO = {
  // espelho - descrevem a pessoa reflectida
  apagada:     { F: 'apagada',      M: 'apagado',      O: 'apagado/a' },
  luminosa:    { F: 'luminosa',     M: 'luminoso',     O: 'luminoso/a' },
  // cuidado - descrevem o estado da pessoa
  esquecida:   { F: 'esquecida',    M: 'esquecido',    O: 'esquecido/a' },
  prioritaria: { F: 'prioritaria',  M: 'prioritario',  O: 'prioritario/a' },
};

export function opcaoLabel(valor, genero) {
  const mapa = OPCAO_GENERO[valor];
  if (!mapa) return valor;
  return mapa[genero] || mapa['F'] || valor;
}

// ============================================================
// EXPLICACAO ADAPTADA - para perguntas com texto gendered
// ============================================================

const EXPLICACOES_GENERO = {
  cuidado: {
    F: 'Como tens tratado a ti mesma ultimamente?',
    M: 'Como tens tratado a ti mesmo ultimamente?',
    O: 'Como te tens tratado ultimamente?'
  }
};

export function explicacaoAdaptada(perguntaId, explicacaoOriginal, genero) {
  const mapa = EXPLICACOES_GENERO[perguntaId];
  if (!mapa) return explicacaoOriginal;
  return mapa[genero] || mapa['F'] || explicacaoOriginal;
}

// ============================================================
// ADAPTAR TEXTO DE LEITURA - substitui padrao gendered
// Aplicado ao texto das leituras Lumina apos seleccao
// ============================================================

const SUBSTITUICOES_M = [
  ['Estás vazia', 'Estás vazio'],
  ['estás vazia', 'estás vazio'],
  ['Estás presa', 'Estás preso'],
  ['estás presa', 'estás preso'],
  ['Estás cansada', 'Estás cansado'],
  ['estás cansada', 'estás cansado'],
  ['Estás desligada', 'Estás desligado'],
  ['estás desligada', 'estás desligado'],
  ['lúcida', 'lúcido'],
  ['Toda.', 'Todo.'],
  ['toda.', 'todo.'],
  ['. Toda ', '. Todo '],
  ['. toda ', '. todo '],
  ['Cansada mas', 'Cansado mas'],
  ['Cansada e', 'Cansado e'],
  ['cansada mas', 'cansado mas'],
  ['Pronta mas', 'Pronto mas'],
  ['Pronta.', 'Pronto.'],
  ['pronta mas', 'pronto mas'],
  ['de ti mesma', 'de ti mesmo'],
  ['a ti mesma', 'a ti mesmo'],
  ['por ti mesma', 'por ti mesmo'],
  ['para ti mesma', 'para ti mesmo'],
  ['Protege-te de ti mesma', 'Protege-te de ti mesmo'],
  ['Tornaste-te invisível à força de servir', 'Tornaste-te invisível à força de servir'],
];

const SUBSTITUICOES_O = [
  ['Estás vazia', 'Estás sem energia'],
  ['estás vazia', 'estás sem energia'],
  ['Estás presa', 'Estás preso/a'],
  ['estás presa', 'estás preso/a'],
  ['Estás cansada', 'Estás cansado/a'],
  ['estás cansada', 'estás cansado/a'],
  ['Estás desligada', 'Estás desligado/a'],
  ['estás desligada', 'estás desligado/a'],
  ['lúcida', 'com lucidez'],
  ['Toda.', 'Por inteiro.'],
  ['toda.', 'por inteiro.'],
  ['. Toda ', '. Por inteiro '],
  ['Cansada mas', 'Com cansaco mas'],
  ['Pronta mas', 'Pronto/a mas'],
  ['de ti mesma', 'de ti'],
  ['a ti mesma', 'a ti'],
  ['por ti mesma', 'por ti'],
  ['para ti mesma', 'para ti'],
];

export function adaptarTextoGenero(texto, genero) {
  if (!texto || !genero || genero === 'F') return texto;

  const subs = genero === 'M' ? SUBSTITUICOES_M : SUBSTITUICOES_O;
  let resultado = texto;

  for (const [original, substituto] of subs) {
    resultado = resultado.split(original).join(substituto);
  }

  return resultado;
}

// ============================================================
// CICLO MENSTRUAL - mostrar baseado no genero
// ============================================================

export function mostrarCicloMenstrual(genero) {
  // Para masculino, esconder por defeito
  // Para feminino e outro, mostrar (podem precisar)
  return genero !== 'M';
}

// ============================================================
// SISTEMA TAGLINE - adaptada ao genero
// ============================================================

export function taglineSistema(genero) {
  switch (genero) {
    case 'M': return 'Sistema de Transmutacao Integral';
    case 'O': return 'Sistema de Transmutacao Integral';
    default: return 'Sistema de Transmutacao Feminina';
  }
}
