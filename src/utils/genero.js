/**
 * Utilitário de género - adapta texto ao sexo do utilizador
 * Lê do localStorage (definido no intake e login)
 */

// Retorna 'masculino', 'feminino' ou null
export function getSexo() {
  try {
    return localStorage.getItem('vitalis-sexo') || null;
  } catch {
    return null;
  }
}

export function setSexo(sexo) {
  try {
    if (sexo) localStorage.setItem('vitalis-sexo', sexo);
  } catch {
    // silently fail
  }
}

// g('Bem-vindo', 'Bem-vinda') → adapta ao género
// Se não houver info, retorna feminino (maioria dos clientes)
export function g(masc, fem) {
  return getSexo() === 'masculino' ? masc : fem;
}
