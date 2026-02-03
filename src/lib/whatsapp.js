/**
 * WhatsApp Notifications para Coach via CallMeBot
 *
 * CONFIGURAÇÃO INICIAL (apenas uma vez):
 * 1. Adicionar +34 644 51 95 23 aos contactos do WhatsApp
 * 2. Enviar "I allow callmebot to send me messages" para este número
 * 3. Guardar a API Key recebida como CALLMEBOT_API_KEY no Vercel
 *
 * Documentação: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */

const COACH_PHONE = '258845243875'; // Número da Vivianne (sem +)

/**
 * Envia mensagem WhatsApp via CallMeBot
 */
export async function enviarWhatsApp(mensagem) {
  try {
    const response = await fetch('/api/whatsapp-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem })
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar WhatsApp');
    }

    return { success: true };
  } catch (error) {
    console.error('Erro WhatsApp:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Alertas WhatsApp para situações críticas
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

Bem-vinda à comunidade! 🌱`;

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

export default { enviarWhatsApp, WhatsAppAlertas };
