/**
 * WhatsApp Business API — Chatbot Webhook
 *
 * Recebe mensagens da Meta Cloud API e responde automaticamente.
 *
 * Fluxos:
 * - Primeira mensagem / "ola" → Saudação com menu 1-4
 * - "1" → Info VITALIS
 * - "2" → Link LUMINA
 * - "3" → Preços
 * - "4" → Suporte (notifica coach)
 * - "catalogo" → Link do catálogo
 * - Qualquer outra → Mensagem genérica + menu
 *
 * Variáveis de ambiente necessárias:
 * - WHATSAPP_VERIFY_TOKEN: Token de verificação (defines tu, ex: "seteecos2026")
 * - WHATSAPP_ACCESS_TOKEN: Token permanente da Meta Cloud API
 * - WHATSAPP_PHONE_NUMBER_ID: ID do número de telefone no Meta Business
 */

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'seteecos2026';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// ===== RESPOSTAS DO CHATBOT =====

const MENU = `Como te posso ajudar?

1️⃣ Quero saber mais sobre o VITALIS (coaching nutricional)
2️⃣ Quero fazer o diagnóstico gratuito LUMINA
3️⃣ Tenho dúvidas sobre preços
4️⃣ Quero falar com a Vivianne

Responde com o número ou escreve à vontade 💛`;

const SAUDACAO = `Olá! 🌿 Bem-vinda ao Sete Ecos.

Sou a Vivianne, coach de nutrição e bem-estar feminino.

${MENU}`;

const RESPOSTAS = {
  '1': `🌱 *VITALIS — Coaching Nutricional*

O VITALIS é o nosso programa completo de transformação nutricional, feito para a mulher moçambicana.

O que inclui:
✦ Plano alimentar personalizado (comida moçambicana!)
✦ Receitas com xima, matapa, caril, feijão nhemba
✦ Check-in diário (30 segundos)
✦ Chat directo com a coach
✦ Relatórios semanais de progresso
✦ Treinos adaptados sem ginásio
✦ Comunidade de mulheres
✦ Gamificação com XP e conquistas

Não é uma dieta. É transformação real, ao teu ritmo.

👉 Vê o catálogo completo: app.seteecos.com/catalogo

Queres subscrever? Responde *3* para ver preços ou *4* para falar comigo directamente 💛`,

  '2': `🔮 *LUMINA — Diagnóstico Gratuito*

O LUMINA é o primeiro passo. Em 5 minutos descobres:
✦ O teu padrão emocional dominante
✦ Como a alimentação afecta o teu humor
✦ O que o teu corpo realmente precisa
✦ Leitura personalizada com orientações

São 23 padrões possíveis — cada leitura é única.

👉 Começa agora (é grátis!): app.seteecos.com/lumina

100% gratuito · Sem registo · 5 minutos 🌿`,

  '3': `💰 *Planos e Preços VITALIS*

📋 *Mensal* — 2.500 MZN/mês
📋 *Semestral* — 12.500 MZN (poupas 2.500 MZN!)
📋 *Anual* — 21.000 MZN (poupas 9.000 MZN!)

Todos incluem: plano alimentar, receitas, check-in, chat com coach, treinos, relatórios e comunidade.

💳 *Como pagar:*
• PayPal / Cartão — directo na app (acesso imediato)
• M-Pesa — 85 100 6473 (Vivianne Santos)
• Transferência — envia comprovativo aqui

Após comprovativo, activo o teu acesso em menos de 1 hora!

Queres subscrever? Responde *4* para falar comigo 💛`,

  '4': `💛 *Falar com a Vivianne*

A tua mensagem foi recebida! Vou responder-te pessoalmente assim que possível.

Enquanto esperas, podes:
🔮 Fazer o diagnóstico gratuito: app.seteecos.com/lumina
📋 Ver o catálogo: app.seteecos.com/catalogo

Horário de atendimento: Seg-Sex, 9h-18h (Maputo)

Obrigada pela tua paciência 🌿`,
};

const CATALOGO = `📋 *Catálogo Sete Ecos*

Aqui tens tudo sobre os nossos serviços, preços e como começar:

👉 app.seteecos.com/catalogo

Tens dúvidas? Responde com um número:
1️⃣ VITALIS  2️⃣ LUMINA  3️⃣ Preços  4️⃣ Falar com Vivianne`;

const GENERICA = `Obrigada pela tua mensagem! 🌿

Não entendi bem, mas posso ajudar-te com:

1️⃣ Saber mais sobre o VITALIS
2️⃣ Fazer o diagnóstico gratuito LUMINA
3️⃣ Ver preços
4️⃣ Falar com a Vivianne

Responde com o número 💛`;

// ===== HANDLER =====

export default async function handler(req, res) {
  // GET = verificação do webhook pela Meta
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verificado com sucesso');
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Token inválido');
  }

  // POST = mensagem recebida
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Meta espera sempre 200, mesmo que processemos em background
  try {
    const body = req.body;

    // Verificar se é uma mensagem válida
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages?.[0]) {
      // Pode ser status update, ignorar
      return res.status(200).send('OK');
    }

    const message = value.messages[0];
    const from = message.from; // número da cliente (ex: 258841234567)
    const msgBody = (message.text?.body || '').trim();
    const msgLower = msgBody.toLowerCase();

    // Determinar resposta
    let resposta;

    if (['1', '2', '3', '4'].includes(msgBody)) {
      resposta = RESPOSTAS[msgBody];

      // Se escolheu 4, notificar coach (assíncrono, não bloqueia)
      if (msgBody === '4') {
        notificarCoach(from, 'Cliente pediu para falar com a Vivianne').catch(() => {});
      }
    } else if (msgLower.includes('catalogo') || msgLower.includes('catálogo')) {
      resposta = CATALOGO;
    } else if (msgLower.includes('preço') || msgLower.includes('preco') || msgLower.includes('quanto custa') || msgLower.includes('valor')) {
      resposta = RESPOSTAS['3'];
    } else if (msgLower.includes('lumina') || msgLower.includes('diagnóstico') || msgLower.includes('diagnostico') || msgLower.includes('gratuito') || msgLower.includes('gratis') || msgLower.includes('grátis')) {
      resposta = RESPOSTAS['2'];
    } else if (msgLower.includes('vitalis') || msgLower.includes('programa') || msgLower.includes('coaching') || msgLower.includes('nutrição') || msgLower.includes('nutricao')) {
      resposta = RESPOSTAS['1'];
    } else if (msgLower.includes('ola') || msgLower.includes('olá') || msgLower.includes('bom dia') || msgLower.includes('boa tarde') || msgLower.includes('boa noite') || msgLower.includes('oi') || msgLower.includes('hello') || msgLower.includes('hi')) {
      resposta = SAUDACAO;
    } else {
      resposta = GENERICA;

      // Notificar coach de mensagem não reconhecida
      notificarCoach(from, `Mensagem não reconhecida: "${msgBody}"`).catch(() => {});
    }

    // Enviar resposta
    await enviarMensagem(from, resposta);

    return res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    // Retornar 200 mesmo com erro para a Meta não reenviar
    return res.status(200).send('OK');
  }
}

// ===== ENVIAR MENSAGEM VIA META CLOUD API =====

async function enviarMensagem(para, texto) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.error('WhatsApp API não configurada (WHATSAPP_ACCESS_TOKEN ou WHATSAPP_PHONE_NUMBER_ID em falta)');
    return;
  }

  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: para,
      type: 'text',
      text: { body: texto },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Erro ao enviar mensagem WhatsApp:', err);
  }
}

// ===== NOTIFICAR COACH (OPCIONAL) =====

async function notificarCoach(clienteNumero, contexto) {
  // Envia notificação à Vivianne quando alguém pede para falar ou envia mensagem não reconhecida
  const coachNumero = '258851006473';
  const msg = `📩 *Nova mensagem Sete Ecos*\n\nCliente: +${clienteNumero}\n${contexto}\n\nResponde directamente à cliente.`;

  await enviarMensagem(coachNumero, msg);
}
