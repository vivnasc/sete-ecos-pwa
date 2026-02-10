/**
 * WhatsApp Notifications via Twilio
 *
 * Configuração no Vercel:
 * 1. Criar conta em twilio.com
 * 2. Activar WhatsApp Sandbox ou Business API
 * 3. Adicionar variáveis de ambiente:
 *    - TWILIO_ACCOUNT_SID
 *    - TWILIO_AUTH_TOKEN
 *    - TWILIO_WHATSAPP_NUMBER (ex: whatsapp:+14155238886)
 *    - COACH_WHATSAPP_NUMBER (ex: whatsapp:+258851006473)
 */

const COACH_PHONE = '+258851006473';

/**
 * Envia mensagem WhatsApp via Twilio
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
        para: para ? `whatsapp:${para}` : null
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Erro WhatsApp:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, sid: result.sid };
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
   * Cliente inactiva há vários dias
   */
  async clienteInactiva(cliente, dias) {
    const msg = `📱 *CLIENTE INACTIVA*

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

👥 Clientes activas: ${dados.totalClientes}
✅ Check-ins ontem: ${dados.checkinsOntem}
⚠️ Alertas: ${dados.alertasOntem}
🆕 Novas: ${dados.novasClientes}

Bom dia! 🌱`;

    return enviarWhatsApp(msg);
  }
};

export default { enviarWhatsApp, enviarWhatsAppCoach, WhatsAppAlertas };
