/**
 * Notificações para a Coach via Telegram (preferido) ou WhatsApp (fallback)
 *
 * Configuração no Vercel:
 * - TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID: Telegram (recomendado)
 * - WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID: WhatsApp (fallback)
 */

/**
 * Envia mensagem para a coach via Telegram
 */
async function enviarTelegram(mensagem) {
  try {
    const response = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'telegram-send', mensagem })
    });

    const result = await response.json();
    if (result.ok) return { success: true };
    return { success: false, error: result.error };
  } catch (error) {
    console.error('Erro Telegram:', error);
    return { success: false, error: 'Erro de rede' };
  }
}

/**
 * Envia mensagem WhatsApp via Meta Cloud API
 */
export async function enviarWhatsApp(mensagem, para = null) {
  try {
    const response = await fetch('/api/whatsapp-twilio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mensagem,
        para: para || null
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Erro WhatsApp:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Erro de rede WhatsApp:', error);
    return { success: false, error: 'Erro de rede' };
  }
}

/**
 * Envia notificação para a coach: Telegram primeiro, WhatsApp como fallback
 */
export async function enviarWhatsAppCoach(mensagem) {
  // Tentar Telegram primeiro
  const telegramResult = await enviarTelegram(mensagem);
  if (telegramResult.success) return telegramResult;

  // Fallback: WhatsApp
  return enviarWhatsApp(mensagem);
}

/**
 * Alertas WhatsApp pré-definidos
 */
export const WhatsAppAlertas = {

  /**
   * Nova cliente pagou - alerta imediato
   */
  async novaCliente(cliente) {
    const msg = `🎉 *NOVA CLIENTE VITALIS*

👤 ${cliente.nome}
📧 ${cliente.email}
💰 ${cliente.plano} - ${cliente.valor}

Boas-vindas à comunidade! 🌱`;

    return enviarWhatsAppCoach(msg);
  },

  /**
   * Cliente usou Espaço de Retorno - pode precisar de atenção
   */
  async alertaEspacoRetorno(cliente, estado) {
    const msg = `⚠️ *ALERTA ESPAÇO RETORNO*

👤 ${cliente.nome}
😔 Estado: ${estado}
🕐 ${new Date().toLocaleTimeString('pt-PT')}

A cliente pode precisar de apoio. 💚`;

    return enviarWhatsAppCoach(msg);
  },

  /**
   * Cliente inativa há vários dias
   */
  async clienteInactiva(cliente, dias) {
    const msg = `📱 *CLIENTE INATIVA*

👤 ${cliente.nome}
📅 ${dias} dias sem registo

Considera enviar uma mensagem de apoio. 🌱`;

    return enviarWhatsAppCoach(msg);
  },

  /**
   * Motivação enviada para cliente
   */
  async motivacaoEnviada(cliente, mensagem) {
    const msg = `💜 *MOTIVAÇÃO ENVIADA*

👤 Para: ${cliente.nome}
📧 ${cliente.email}

💬 "${mensagem.substring(0, 100)}${mensagem.length > 100 ? '...' : ''}"

✅ Email enviado com sucesso!`;

    return enviarWhatsAppCoach(msg);
  },

  /**
   * Resumo diário
   */
  async resumoDiario(dados) {
    const msg = `📊 *RESUMO VITALIS* - ${dados.data}

👥 Clientes ativas: ${dados.totalClientes}
✅ Check-ins ontem: ${dados.checkinsOntem}
⚠️ Alertas: ${dados.alertasOntem}
🆕 Novas: ${dados.novasClientes}

Bom dia! 🌱`;

    return enviarWhatsAppCoach(msg);
  },

  /**
   * Novo diagnóstico Lumina completo
   */
  async diagnosticoLumina(nome, padrao) {
    const msg = `🔮 *DIAGNÓSTICO LUMINA COMPLETO*

👤 ${nome}
📊 Padrão: ${padrao || 'Geral'}
🕐 ${new Date().toLocaleTimeString('pt-PT')}

Novo potencial lead! 🌱`;

    return enviarWhatsAppCoach(msg);
  },

  /**
   * Novo lead na waitlist
   */
  async novoLeadWaitlist(nome, email, produto) {
    const msg = `📧 *NOVO LEAD NA WAITLIST*

👤 ${nome || 'Anónimo'}
📧 ${email}
📦 Produto: ${produto}
🕐 ${new Date().toLocaleTimeString('pt-PT')}

Nova pessoa interessada! 🌱`;

    return enviarWhatsAppCoach(msg);
  }
};

export default { enviarWhatsApp, enviarWhatsAppCoach, WhatsAppAlertas };
