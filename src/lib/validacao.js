/**
 * Utilitários de Validação - Vitalis
 *
 * Funções simples de validação para formulários
 */

/**
 * Valida se um email é válido
 */
export function validarEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valido: false, erro: 'Email é obrigatório' };
  }

  const emailTrimmed = email.trim();

  if (emailTrimmed.length === 0) {
    return { valido: false, erro: 'Email é obrigatório' };
  }

  // Regex simples para email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailTrimmed)) {
    return { valido: false, erro: 'Email inválido' };
  }

  return { valido: true, valor: emailTrimmed.toLowerCase() };
}

/**
 * Valida password
 */
export function validarPassword(password, minLength = 6) {
  if (!password || typeof password !== 'string') {
    return { valido: false, erro: 'Password é obrigatória' };
  }

  if (password.length < minLength) {
    return { valido: false, erro: `Password deve ter pelo menos ${minLength} caracteres` };
  }

  return { valido: true, valor: password };
}

/**
 * Valida nome (não vazio, tamanho máximo)
 */
export function validarNome(nome, maxLength = 100) {
  if (!nome || typeof nome !== 'string') {
    return { valido: false, erro: 'Nome é obrigatório' };
  }

  const nomeTrimmed = nome.trim();

  if (nomeTrimmed.length === 0) {
    return { valido: false, erro: 'Nome é obrigatório' };
  }

  if (nomeTrimmed.length > maxLength) {
    return { valido: false, erro: `Nome não pode exceder ${maxLength} caracteres` };
  }

  // Verificar caracteres suspeitos (básico XSS)
  if (/<script|javascript:|on\w+=/i.test(nomeTrimmed)) {
    return { valido: false, erro: 'Nome contém caracteres inválidos' };
  }

  return { valido: true, valor: nomeTrimmed };
}

/**
 * Valida número de telefone
 */
export function validarTelefone(telefone) {
  if (!telefone || typeof telefone !== 'string') {
    return { valido: true, valor: '' }; // Telefone é opcional
  }

  const telefoneLimpo = telefone.replace(/[\s\-\(\)\.]/g, '');

  // Deve ter pelo menos 9 dígitos
  if (telefoneLimpo.length > 0 && telefoneLimpo.length < 9) {
    return { valido: false, erro: 'Número de telefone inválido' };
  }

  // Deve conter apenas dígitos e opcionalmente +
  if (!/^\+?\d+$/.test(telefoneLimpo)) {
    return { valido: false, erro: 'Número de telefone deve conter apenas dígitos' };
  }

  return { valido: true, valor: telefoneLimpo };
}

/**
 * Valida número dentro de um intervalo
 */
export function validarNumero(valor, { min, max, obrigatorio = false, nome = 'Valor' } = {}) {
  if (valor === '' || valor === null || valor === undefined) {
    if (obrigatorio) {
      return { valido: false, erro: `${nome} é obrigatório` };
    }
    return { valido: true, valor: null };
  }

  const numero = parseFloat(valor);

  if (isNaN(numero)) {
    return { valido: false, erro: `${nome} deve ser um número` };
  }

  if (min !== undefined && numero < min) {
    return { valido: false, erro: `${nome} deve ser pelo menos ${min}` };
  }

  if (max !== undefined && numero > max) {
    return { valido: false, erro: `${nome} não pode exceder ${max}` };
  }

  return { valido: true, valor: numero };
}

/**
 * Valida texto livre (sanitização básica)
 */
export function validarTexto(texto, { maxLength = 500, obrigatorio = false, nome = 'Texto' } = {}) {
  if (!texto || typeof texto !== 'string') {
    if (obrigatorio) {
      return { valido: false, erro: `${nome} é obrigatório` };
    }
    return { valido: true, valor: '' };
  }

  const textoTrimmed = texto.trim();

  if (textoTrimmed.length === 0 && obrigatorio) {
    return { valido: false, erro: `${nome} é obrigatório` };
  }

  if (textoTrimmed.length > maxLength) {
    return { valido: false, erro: `${nome} não pode exceder ${maxLength} caracteres` };
  }

  // Sanitização básica - remover tags HTML
  const textoSanitizado = textoTrimmed
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');

  return { valido: true, valor: textoSanitizado };
}

/**
 * Valida data
 */
export function validarData(data, { minDate, maxDate, obrigatorio = false, nome = 'Data' } = {}) {
  if (!data) {
    if (obrigatorio) {
      return { valido: false, erro: `${nome} é obrigatória` };
    }
    return { valido: true, valor: null };
  }

  const dataObj = new Date(data);

  if (isNaN(dataObj.getTime())) {
    return { valido: false, erro: `${nome} inválida` };
  }

  if (minDate && dataObj < new Date(minDate)) {
    return { valido: false, erro: `${nome} não pode ser anterior a ${new Date(minDate).toLocaleDateString('pt-PT')}` };
  }

  if (maxDate && dataObj > new Date(maxDate)) {
    return { valido: false, erro: `${nome} não pode ser posterior a ${new Date(maxDate).toLocaleDateString('pt-PT')}` };
  }

  return { valido: true, valor: dataObj.toISOString().split('T')[0] };
}

/**
 * Valida seleção (valor está numa lista de opções)
 */
export function validarSelecao(valor, opcoes, { obrigatorio = false, nome = 'Selecção' } = {}) {
  if (!valor || valor === '') {
    if (obrigatorio) {
      return { valido: false, erro: `${nome} é obrigatória` };
    }
    return { valido: true, valor: null };
  }

  if (!opcoes.includes(valor)) {
    return { valido: false, erro: `${nome} inválida` };
  }

  return { valido: true, valor };
}

/**
 * Valida formulário completo
 * @param {Object} dados - Dados do formulário
 * @param {Object} regras - Regras de validação { campo: funcaoValidacao }
 * @returns {{ valido: boolean, erros: Object, dadosValidados: Object }}
 */
export function validarFormulario(dados, regras) {
  const erros = {};
  const dadosValidados = {};
  let valido = true;

  for (const [campo, validador] of Object.entries(regras)) {
    const resultado = validador(dados[campo]);

    if (!resultado.valido) {
      erros[campo] = resultado.erro;
      valido = false;
    } else {
      dadosValidados[campo] = resultado.valor;
    }
  }

  return { valido, erros, dadosValidados };
}

/**
 * Hook para usar validação em componentes React
 */
export function useValidation() {
  const validar = (dados, regras) => validarFormulario(dados, regras);

  return {
    validar,
    validarEmail,
    validarPassword,
    validarNome,
    validarTelefone,
    validarNumero,
    validarTexto,
    validarData,
    validarSelecao
  };
}

export default {
  validarEmail,
  validarPassword,
  validarNome,
  validarTelefone,
  validarNumero,
  validarTexto,
  validarData,
  validarSelecao,
  validarFormulario,
  useValidation
};
