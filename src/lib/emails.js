/**
 * Sistema de Emails - Vitalis
 *
 * Usa a API /api/enviar-email para enviar emails via Resend.
 *
 * Configuração necessária:
 * 1. Criar conta em resend.com
 * 2. Adicionar domínio seteecos.com
 * 3. Adicionar RESEND_API_KEY nas variáveis de ambiente do Vercel
 */

const API_URL = '/api/enviar-email';

/**
 * Envia um email usando a API
 * @param {string} tipo - Tipo de email (ver api/enviar-email.js)
 * @param {string} destinatario - Email do destinatário
 * @param {object} dados - Dados para o template
 */
export async function enviarEmail(tipo, destinatario, dados = {}) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tipo, destinatario, dados })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Erro ao enviar email:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, id: result.id };
  } catch (error) {
    console.error('Erro de rede ao enviar email:', error);
    return { success: false, error: 'Erro de rede' };
  }
}

// ===== EMAILS PARA CLIENTES =====

/**
 * Email de boas-vindas após registo
 */
export async function enviarBoasVindas(email, nome) {
  return enviarEmail('boas-vindas', email, { nome });
}

/**
 * Email de confirmação de pagamento
 */
export async function enviarConfirmacaoPagamento(email, dados) {
  return enviarEmail('pagamento-confirmado', email, dados);
}

/**
 * Email de lembrete para cliente inactiva
 */
export async function enviarLembreteCheckin(email, nome, dias) {
  return enviarEmail('lembrete-checkin', email, { nome, dias });
}

/**
 * Email de celebração de conquista
 */
export async function enviarConquista(email, dados) {
  return enviarEmail('conquista', email, dados);
}

/**
 * Email de aviso de expiração
 */
export async function enviarAvisoExpiracao(email, nome, dias) {
  return enviarEmail('expiracao-aviso', email, { nome, dias });
}

// ===== EMAILS PARA COACH =====

const COACH_EMAIL = 'viv.saraiva@gmail.com';

/**
 * Notifica coach sobre nova cliente
 */
export async function notificarNovaCliente(dados) {
  return enviarEmail('coach-nova-cliente', COACH_EMAIL, dados);
}

/**
 * Notifica coach sobre alerta de cliente
 */
export async function notificarAlertaCliente(dados) {
  return enviarEmail('coach-alerta', COACH_EMAIL, dados);
}

/**
 * Envia resumo diário para coach
 */
export async function enviarResumoDiario(dados) {
  return enviarEmail('coach-resumo-diario', COACH_EMAIL, dados);
}

// ===== TRIGGERS AUTOMÁTICOS =====

/**
 * Triggers que podem ser chamados em diferentes pontos da aplicação
 */
export const EmailTriggers = {

  /**
   * Chamar após pagamento bem-sucedido
   */
  async onPagamentoSucesso(cliente) {
    await enviarConfirmacaoPagamento(cliente.email, {
      nome: cliente.nome,
      plano: cliente.plano,
      valor: cliente.valor,
      data: new Date().toLocaleDateString('pt-PT'),
      validoAte: cliente.validoAte
    });

    await notificarNovaCliente({
      nome: cliente.nome,
      email: cliente.email,
      plano: cliente.plano,
      data: new Date().toLocaleDateString('pt-PT')
    });
  },

  /**
   * Chamar quando cliente atinge conquista
   */
  async onConquista(cliente, conquista) {
    await enviarConquista(cliente.email, {
      nome: cliente.nome,
      conquista: conquista.nome,
      emoji: conquista.emoji,
      mensagem: conquista.mensagem,
      xp: conquista.xp
    });
  },

  /**
   * Chamar quando cliente usa Espaço de Retorno
   */
  async onEspacoRetorno(cliente, estado) {
    await notificarAlertaCliente({
      tipo: 'Espaço de Retorno activado',
      descricao: `${cliente.nome} usou o Espaço de Retorno (${estado})`,
      nome: cliente.nome,
      email: cliente.email,
      ultimaActividade: new Date().toLocaleDateString('pt-PT'),
      whatsapp: cliente.whatsapp
    });
  }
};

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
};
