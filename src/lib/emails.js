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

// ===== WHATSAPP NOTIFICATIONS =====

/**
 * Envia notificação WhatsApp para coach
 */
async function enviarWhatsAppCoach(mensagem) {
  try {
    const response = await fetch('/api/whatsapp-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem })
    });
    return response.ok;
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
    await enviarEmail({
      to: cliente.email,
      subject: '⏳ Pagamento Recebido - Aguarda Confirmação | Vitalis',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7C8B6F; font-size: 28px; margin: 0;">✅ Pagamento Registado!</h1>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Olá <strong>${cliente.nome}</strong>,
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Recebemos o registo do teu pagamento! A Coach Vivianne vai confirmar em até 24 horas.
          </p>

          <div style="background: #F5F0E8; border-left: 4px solid #7C8B6F; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #6B5C4C;"><strong>Plano:</strong> ${cliente.plano}</p>
            <p style="margin: 0 0 10px 0; color: #6B5C4C;"><strong>Valor:</strong> ${cliente.valor}</p>
            <p style="margin: 0 0 10px 0; color: #6B5C4C;"><strong>Método:</strong> ${cliente.metodo}</p>
            <p style="margin: 0; color: #6B5C4C;"><strong>Referência:</strong> ${cliente.referencia}</p>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Vais receber outro email assim que o pagamento for confirmado e o teu acesso for ativado.
          </p>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Qualquer dúvida, estamos aqui!<br>
            WhatsApp: +258 85 100 6473
          </p>
        </div>
      `
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
