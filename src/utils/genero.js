/**
 * Utilitário de género - adapta texto ao sexo do utilizador
 *
 * DOIS CONTEXTOS DE USO:
 *
 * 1. Cliente-side (localStorage) — componentes do utilizador:
 *    import { g } from '../utils/genero'
 *    g('Bem-vindo', 'Bem-vinda')  // lê de localStorage
 *
 * 2. Explicito (coach dashboard, emails, API) — quando tens o sexo do cliente:
 *    import { gx } from '../utils/genero'
 *    gx(intake.sexo, 'Bem-vindo', 'Bem-vinda')
 *
 * REGRA: Todo texto em portugues que varia com genero DEVE usar g() ou gx().
 *        Nunca hardcodar "Bem-vinda", "querida", "perfeita", etc.
 */

// ===== LEITURA/ESCRITA DO SEXO (localStorage) =====

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

// ===== ADAPTACAO DE GENERO =====

/**
 * g(masc, fem) — adapta ao genero via localStorage
 * Usar em componentes do utilizador (DashboardVitalis, EspacoRetorno, etc.)
 * Default: feminino (maioria dos clientes)
 */
export function g(masc, fem) {
  return getSexo() === 'masculino' ? masc : fem;
}

/**
 * gx(sexo, masc, fem) — adapta ao genero explicitamente
 * Usar no coach dashboard, emails, API, ou quando tens o sexo do cliente.
 * Default: feminino
 *
 * Exemplo:
 *   gx(cliente.sexo, 'Bem-vindo', 'Bem-vinda')
 *   gx(intake?.sexo, 'querido', 'querida')
 */
export function gx(sexo, masc, fem) {
  return sexo === 'masculino' ? masc : fem;
}

/**
 * Palavras comuns com genero — referencia rapida para devs:
 *
 * g('Bem-vindo', 'Bem-vinda')
 * g('querido', 'querida')
 * g('obrigado', 'obrigada')
 * g('perfeito', 'perfeita')
 * g('cansado', 'cansada')
 * g('motivado', 'motivada')
 * g('preparado', 'preparada')
 * g('conectado', 'conectada')
 * g('activo', 'activa')
 * g('inactivo', 'inactiva')
 * g('inscrito', 'inscrita')
 * g('sozinho', 'sozinha')
 */
