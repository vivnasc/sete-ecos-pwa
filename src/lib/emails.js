/**
 * Sistema de Emails - Vitalis
 *
 * DESACTIVADO: domínio removido do Resend (maio 2026).
 * Sem clientes activos. Todas as funções são no-ops silenciosos.
 * Os componentes que chamam EmailTriggers.* continuam a funcionar
 * sem erro — simplesmente não enviam nada.
 *
 * Para reactivar: voltar a ligar o domínio ao Resend e restaurar
 * este ficheiro do git history (commit anterior a esta alteração).
 */

// No-op base — retorna sucesso sem fazer nada
export async function enviarEmail() { return { success: true, disabled: true } }

// Wrappers que eram chamados directamente
export async function enviarBoasVindas() { return { success: true, disabled: true } }
export async function enviarConfirmacaoPagamento() { return { success: true, disabled: true } }
export async function enviarLembreteCheckin() { return { success: true, disabled: true } }
export async function enviarConquista() { return { success: true, disabled: true } }
export async function enviarAvisoExpiracao() { return { success: true, disabled: true } }
export async function notificarNovaCliente() { return { success: true, disabled: true } }
export async function notificarAlertaCliente() { return { success: true, disabled: true } }
export async function enviarResumoDiario() { return { success: true, disabled: true } }

// EmailTriggers — todos no-op mas mantêm a interface
export const EmailTriggers = {
  async onPagamentoSucesso() {},
  async onPagamentoPendente() {},
  async onTrialIniciado() {},
  async onIntakeCompleto() {},
  async onConquista() {},
  async onEspacoRetorno() {},
  async onTrialExpirando3Dias() {},
  async onTrialExpirando1Dia() {},
  async onTrialExpirado() {},
  async onPrimeiroCheckin() {},
}

export default {
  enviarEmail,
  enviarBoasVindas,
  enviarConfirmacaoPagamento,
  enviarLembreteCheckin,
  enviarConquista,
  enviarAvisoExpiracao,
  notificarNovaCliente,
  notificarAlertaCliente,
  enviarResumoDiario,
  EmailTriggers
}
