'use client'

// Traduz erros técnicos para mensagens amigáveis em PT.
export function erroAmigavel(erro: unknown): string {
  const msg = typeof erro === 'string'
    ? erro
    : erro instanceof Error
      ? erro.message
      : typeof erro === 'object' && erro && 'message' in erro
        ? String((erro as { message: unknown }).message)
        : 'erro desconhecido'

  const m = msg.toLowerCase()

  if (m.includes('failed to fetch') || m.includes('network') || m.includes('rede')) {
    return 'sem rede · vou tentar quando ligar'
  }
  if (m.includes('anthropic') && m.includes('500')) {
    return 'a coach está com problema · tenta daqui a 1 min'
  }
  if (m.includes('anthropic') && m.includes('429')) {
    return 'a coach está sobrecarregada · tenta daqui a 1 min'
  }
  if (m.includes('anthropic') && m.includes('400')) {
    return 'erro a falar com a coach · vê chat para tentar de novo'
  }
  if (m.includes('anthropic_api_key')) {
    return 'a coach não está configurada · falta chave API'
  }
  if (m.includes('column') && m.includes('not exist')) {
    return 'falta migração SQL · ver definições'
  }
  if (m.includes('relation') && m.includes('does not exist')) {
    return 'falta tabela na BD · ver definições'
  }
  if (m.includes('not-allowed') || m.includes('permission-denied')) {
    return 'permissão de microfone negada nas definições do telemóvel'
  }
  if (m.includes('no-speech')) {
    return 'não ouvi nada · tenta de novo'
  }
  if (m.includes('imagem inválida') || m.includes('invalid image')) {
    return 'imagem não consegui ler · escolhe outra'
  }
  if (m.includes('json inválido')) {
    return 'resposta da coach veio mal · tenta de novo'
  }
  if (msg.length > 80) {
    return 'algo correu mal · tenta de novo'
  }
  return msg
}
