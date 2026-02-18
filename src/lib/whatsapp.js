/**
 * WhatsApp Notifications via Meta Cloud API
 *
 * Configuração no Vercel:
 * - WHATSAPP_ACCESS_TOKEN: Token Meta Business
 * - WHATSAPP_PHONE_NUMBER_ID: ID do número WhatsApp Business
 * - VIVIANNE_PERSONAL_NUMBER: Número pessoal da coach
 */

/**
 * Envia mensagem WhatsApp via Meta Cloud API
 * @param {string} mensagem - Texto da mensagem
 * @param {string} para - Número de destino (opcional, usa coach por defeito)
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
 * Envia WhatsApp para a coach
 */
export async function enviarWhatsAppCoach(mensagem) {
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

    return enviarWhatsApp(msg);
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

    return enviarWhatsApp(msg);
  },

  /**
   * Cliente inativa há vários dias
   */
  async clienteInactiva(cliente, dias) {
    const msg = `📱 *CLIENTE INATIVA*

👤 ${cliente.nome}
📅 ${dias} dias sem registo

Considera enviar uma mensagem de apoio. 🌱`;

    return enviarWhatsApp(msg);
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

    return enviarWhatsApp(msg);
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

    return enviarWhatsApp(msg);
  }
};

export default { enviarWhatsApp, enviarWhatsAppCoach, WhatsAppAlertas };
