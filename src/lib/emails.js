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

import { getCoachEmails } from './coach';

// Email principal da coach (primeiro da lista)
const getCoachEmail = () => getCoachEmails()[0] || 'viv.saraiva@gmail.com';

/**
 * Notifica coach sobre nova cliente
 */
export async function notificarNovaCliente(dados) {
  return enviarEmail('coach-nova-cliente', getCoachEmail(), dados);
}

/**
 * Notifica coach sobre alerta de cliente
 */
export async function notificarAlertaCliente(dados) {
  return enviarEmail('coach-alerta', getCoachEmail(), dados);
}

/**
 * Envia resumo diário para coach
 */
export async function enviarResumoDiario(dados) {
  return enviarEmail('coach-resumo-diario', getCoachEmail(), dados);
}

// ===== WHATSAPP NOTIFICATIONS (via Twilio) =====

/**
 * Envia notificação WhatsApp para coach via Twilio
 * Usa /api/whatsapp-twilio como endpoint principal.
 * Fallback para /api/whatsapp-notify (CallMeBot) se Twilio falhar.
 */
async function enviarWhatsAppCoach(mensagem) {
  try {
    // Tentar Twilio primeiro
    const response = await fetch('/api/whatsapp-twilio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) return true;
    }

    // Fallback para CallMeBot se Twilio falhar
    console.warn('Twilio falhou, a tentar CallMeBot...');
    const fallback = await fetch('/api/whatsapp-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem })
    });
    return fallback.ok;
  } catch (error) {
    console.error('Erro WhatsApp:', error);
    return false;
  }
}

// ===== TRIGGERS AUTOMÁTICOS =====

/**
 * Triggers que podem ser chamados em diferentes pontos da aplicação
 * Enviam email E WhatsApp para alertas críticos
 */
export const EmailTriggers = {

  /**
   * Chamar após pagamento bem-sucedido
   */
  async onPagamentoSucesso(cliente) {
    // Email para cliente
    await enviarConfirmacaoPagamento(cliente.email, {
      nome: cliente.nome,
      plano: cliente.plano,
      valor: cliente.valor,
      data: new Date().toLocaleDateString('pt-PT'),
      validoAte: cliente.validoAte
    });

    // Email para coach
    await notificarNovaCliente({
      nome: cliente.nome,
      email: cliente.email,
      plano: cliente.plano,
      data: new Date().toLocaleDateString('pt-PT')
    });

    // WhatsApp para coach (alerta imediato)
    await enviarWhatsAppCoach(`🎉 *NOVA CLIENTE VITALIS*

👤 ${cliente.nome}
📧 ${cliente.email}
💰 ${cliente.plano} - ${cliente.valor}

Boas-vindas à comunidade! 🌱`);
  },

  /**
   * Chamar quando cliente registra pagamento manual pendente
   */
  async onPagamentoPendente(cliente) {
    // Email para cliente (confirmação de recebimento)
    await enviarEmail('pagamento-pendente', cliente.email, {
      nome: cliente.nome,
      plano: cliente.plano,
      valor: cliente.valor,
      metodo: cliente.metodo,
      referencia: cliente.referencia
    });

    // WhatsApp para coach (alerta imediato)
    await enviarWhatsAppCoach(`💰 *PAGAMENTO PENDENTE - VITALIS*

👤 ${cliente.nome}
📧 ${cliente.email}
💵 ${cliente.plano} - ${cliente.valor}
📱 Método: ${cliente.metodo}
🔖 Ref: ${cliente.referencia}

⚠️ Verificar e aprovar no Coach Dashboard!`);
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
    // Conquistas não enviam WhatsApp (não é crítico)
  },

  /**
   * Chamar quando cliente usa Espaço de Retorno
   */
  async onEspacoRetorno(cliente, estado) {
    // Email para coach
    await notificarAlertaCliente({
      tipo: 'Espaço de Retorno activado',
      descricao: `${cliente.nome} usou o Espaço de Retorno (${estado})`,
      nome: cliente.nome,
      email: cliente.email,
      ultimaActividade: new Date().toLocaleDateString('pt-PT'),
      whatsapp: cliente.whatsapp
    });

    // WhatsApp para coach (alerta crítico - cliente pode precisar de apoio)
    await enviarWhatsAppCoach(`⚠️ *ALERTA ESPAÇO RETORNO*

👤 ${cliente.nome}
😔 Estado: ${estado}
🕐 ${new Date().toLocaleTimeString('pt-PT')}

A cliente pode precisar de apoio. 💚`);
  },

  /**
   * Chamar 3 dias antes do trial expirar
   */
  async onTrialExpiring3Days(cliente) {
    await enviarEmail('trial-expirando-3-dias', cliente.email, {
      nome: cliente.nome,
      diasRestantes: 3,
      urlPlanos: 'https://seteecos.com/vitalis/pagamento'
    });
  },

  /**
   * Chamar 1 dia antes do trial expirar
   */
  async onTrialExpiring1Day(cliente) {
    await enviarEmail('trial-expirando-1-dia', cliente.email, {
      nome: cliente.nome,
      diasRestantes: 1,
      urlPlanos: 'https://seteecos.com/vitalis/pagamento'
    });

    // WhatsApp para coach (para dar follow-up pessoal se necessário)
    await enviarWhatsAppCoach(`⏰ *TRIAL EXPIRA AMANHÃ*

👤 ${cliente.nome}
📧 ${cliente.email}
⏱️ Último dia de trial amanhã

Considera fazer follow-up se for uma cliente engajada! 💪`);
  },

  /**
   * Chamar quando trial expirar
   */
  async onTrialExpired(cliente) {
    await enviarEmail('trial-expirado', cliente.email, {
      nome: cliente.nome,
      urlPlanos: 'https://seteecos.com/vitalis/pagamento'
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
