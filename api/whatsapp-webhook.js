/**
 * WhatsApp Chatbot — Sete Ecos (via Twilio)
 *
 * Webhook para Twilio WhatsApp Sandbox/Business.
 * Recebe mensagens e responde automaticamente com TwiML.
 *
 * Cobre todos os módulos reais do projecto:
 * - LUMINA (diagnóstico gratuito, 23 padrões)
 * - VITALIS (coaching nutricional, 3 fases)
 * - ÁUREA (auto-valor, jóias de ouro)
 * - BUNDLE (Vitalis + Áurea, 25% desconto)
 * - COMUNIDADE (Rio, Círculos, Fogueira, Sussurros)
 * - Pagamentos: PayPal/cartão, M-Pesa, transferência Standard Bank
 * - Trial 7 dias, referral ECOS-XXXXXX
 *
 * Configuração Twilio:
 * 1. Sandbox: Messaging → Try it Out → WhatsApp Sandbox → Paste webhook URL
 * 2. Production: Configure WhatsApp Sender → Webhook URL
 * URL: https://app.seteecos.com/api/whatsapp-webhook
 *
 * Variáveis de ambiente (Vercel):
 * - TWILIO_ACCOUNT_SID: Account SID
 * - TWILIO_AUTH_TOKEN: Auth Token
 * - TWILIO_WHATSAPP_NUMBER: Número Twilio (ex: whatsapp:+14155238886)
 */

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
const COACH_NUMERO = 'whatsapp:+258851006473';

// ===== MENU PRINCIPAL =====

const MENU = `Como te posso ajudar?

1️⃣ VITALIS — Coaching nutricional
2️⃣ LUMINA — Diagnóstico gratuito
3️⃣ ÁUREA — Auto-valor e presença
4️⃣ Preços e planos
5️⃣ Como pagar (M-Pesa, PayPal)
6️⃣ Experimentar grátis (7 dias)
7️⃣ Falar com a Vivianne

Responde com o número ou escreve à vontade 💛`;

const SAUDACAO_COM_NOME = (nome) => `Olá ${nome}! 🌿 Bem-vinda ao *Sete Ecos*.

Sou a Vivianne, coach de nutrição e bem-estar feminino. Um sistema de transformação feito para a mulher moçambicana.

${MENU}`;

const SAUDACAO = `Olá! 🌿 Bem-vinda ao *Sete Ecos*.

Sou a Vivianne, coach de nutrição e bem-estar feminino. Um sistema de transformação feito para a mulher moçambicana.

${MENU}`;

// ===== RESPOSTAS =====
// Dados verificados directamente no código-fonte do projecto

const R = {};

R['1'] = `🌱 *VITALIS — Coaching Nutricional*

Programa de transformação nutricional para a mulher moçambicana. Não é uma dieta — é mudança real, ao teu ritmo.

*O que inclui:*
🍽 Plano alimentar personalizado (xima, matapa, caril)
🍳 Receitas moçambicanas ilimitadas
✅ Check-in diário (30 segundos)
💬 Chat directo com a coach Vivianne
📊 Relatórios semanais de progresso
🏋️ Treinos adaptados (sem ginásio)
📋 Lista de compras automática
🔄 Espaço de Retorno (sem culpa se recaíres)
🎯 XP, 8 níveis e 40+ conquistas
👥 Comunidade incluída

*3 fases:*
1. Indução — primeiras mudanças
2. Estabilização — criar hábitos
3. Reeducação — transformação duradoura

*Preços:*
• Mensal: 2.500 MZN ($38)
• Semestral: 12.500 MZN ($190) — poupas 2.500!
• Anual: 21.000 MZN ($320) — poupas 9.000!

👉 app.seteecos.com/vitalis
📋 Catálogo: app.seteecos.com/catalogo

Responde *5* para saber como pagar ou *6* para 7 dias grátis 💛`;

R['2'] = `🔮 *LUMINA — Diagnóstico Gratuito*

O LUMINA é o teu primeiro passo. Em *5 minutos* descobres:

✦ O teu padrão emocional dominante
✦ Como a alimentação afecta o teu humor
✦ O que o teu corpo realmente precisa
✦ Leitura personalizada com orientações

São *23 padrões possíveis* — cada leitura é única.

Também avalia:
• Relação com a comida
• Nível de energia e sono
• Estado emocional
• Fase do ciclo menstrual (opcional)

👉 *Começa agora:* app.seteecos.com/lumina

100% gratuito · Sem registo · 5 minutos

O próximo passo natural é o *VITALIS* (responde *1*) 🌿`;

R['3'] = `✨ *ÁUREA — Auto-Valor e Presença*

Trabalha a tua relação contigo mesma. Não é sobre aparência — é sobre *merecimento*.

*O que inclui:*
💎 100+ micro-práticas diárias
👗 Espelho de Roupa — presença no vestir
💰 Carteira de Merecimento — quanto investes em ti
📝 Diário de Merecimento — escrita reflexiva
🧘 5 meditações guiadas em áudio
📊 Insights semanais e padrões
💬 Chat com coach
👥 Comunidade incluída

*Sistema de Jóias de Ouro (4 níveis):*
🥉 Bronze (0-50) — Despertar
🥈 Prata (51-150) — Presença
🥇 Ouro (151-300) — Valor
💎 Diamante (301+) — Integração

*Preços:*
• Mensal: 975 MZN ($15)
• Semestral: 5.265 MZN ($81) — 10% desc.
• Anual: 9.945 MZN ($153) — 15% desc.

👉 app.seteecos.com/aurea

Ou experimenta o *BUNDLE* com 25% desconto — escreve *bundle* 💛`;

R['4'] = `💰 *Planos e Preços*

━━━━━━━━━━━━━━━━━━
🌱 *VITALIS* (Coaching Nutricional)
━━━━━━━━━━━━━━━━━━
📋 Mensal — *2.500 MZN* ($38)/mês
📋 Semestral — *12.500 MZN* ($190) — poupas 2.500!
📋 Anual — *21.000 MZN* ($320) — poupas 9.000!

━━━━━━━━━━━━━━━━━━
✨ *ÁUREA* (Auto-Valor)
━━━━━━━━━━━━━━━━━━
📋 Mensal — *975 MZN* ($15)/mês
📋 Semestral — *5.265 MZN* ($81) — 10% desc.
📋 Anual — *9.945 MZN* ($153) — 15% desc.

━━━━━━━━━━━━━━━━━━
🎁 *BUNDLE* Vitalis + Áurea (25% desc.)
━━━━━━━━━━━━━━━━━━
📋 Mensal — *2.600 MZN* ($40) — poupas 875!
📋 Semestral — *13.300 MZN* ($204) — poupas 4.465!
📋 Anual — *23.200 MZN* ($355) — poupas 7.745!

━━━━━━━━━━━━━━━━━━
🔮 *LUMINA* — *GRÁTIS* sempre
━━━━━━━━━━━━━━━━━━

Todos incluem Comunidade.
Responde *5* para saber como pagar 💛`;

R['5'] = `💳 *Como Pagar*

*1. PayPal / Cartão (acesso imediato)*
Visa, Mastercard ou PayPal na app.
👉 app.seteecos.com/vitalis/pagamento

*2. M-Pesa*
📱 Número: *85 100 6473*
👤 Nome: Vivianne Saraiva
Envia o comprovativo aqui nesta conversa.

*3. Transferência Bancária*
🏦 Banco: *Standard Bank*
📄 NIB: *0003 0108 0669 8041 0086 5*
👤 Titular: Vivianne Saraiva
Envia o comprovativo aqui nesta conversa.

⏱ *Activação:*
• PayPal/cartão → imediato (automático)
• M-Pesa/transferência → menos de 1h após comprovativo

Já pagaste? Envia o comprovativo aqui! 💛`;

R['6'] = `🎁 *Trial Grátis — 7 Dias*

Experimenta o VITALIS durante *7 dias* sem pagar.

*Acesso no trial:*
✅ Dashboard com progresso
✅ Check-in diário
✅ Receitas moçambicanas
✅ Espaço de Retorno
✅ Desafios semanais
✅ Chat com a coach

*Não incluído no trial:*
❌ Plano alimentar completo
❌ Lista de compras
❌ Relatórios e tendências
❌ Fotos de progresso
❌ Exportar plano PDF
❌ Sugestões de refeições

👉 Regista-te: app.seteecos.com/vitalis/pagamento

Ou responde *7* para a Vivianne te activar 🌿`;

R['7'] = `💛 *Falar com a Vivianne*

A tua mensagem foi recebida! A Vivianne responde pessoalmente assim que possível.

⏰ Horário: Seg-Sex, 9h-18h (Maputo)

Enquanto esperas:
🔮 Diagnóstico gratuito: app.seteecos.com/lumina
📋 Catálogo: app.seteecos.com/catalogo

Obrigada pela paciência 🌿`;

R['bundle'] = `🎁 *BUNDLE — Vitalis + Áurea (25% desconto)*

Nutrição + Auto-valor juntos.

*Inclui tudo de:*
🌱 VITALIS — plano alimentar, receitas, check-in, treinos, relatórios, chat
✨ ÁUREA — 100+ práticas, meditações, diário, espelho de roupa
👥 Comunidade

*Preços (25% desconto sobre individual):*
📋 Mensal — *2.600 MZN* ($40) — poupas 875 MZN
📋 Semestral — *13.300 MZN* ($204) — poupas 4.465 MZN
📋 Anual — *23.200 MZN* ($355) — poupas 7.745 MZN

👉 app.seteecos.com/bundle

Responde *5* para saber como pagar 💛`;

R['comunidade'] = `👥 *Comunidade Sete Ecos*

Espaço seguro de transformação colectiva. Incluída em todos os planos pagos.

🌊 *O Rio* — Reflexões guiadas por prompts diários. 40+ prompts sobre gratidão, desafios, descoberta, intenção, transformação.

👥 *Círculos de Eco* — Grupos de até 12 mulheres por tema, com guardiã.

🔥 *Fogueira* — Espaço de 24h. Tema do dia, conversas honestas que desaparecem.

💜 *Sussurros* — Mensagens privadas de apoio entre mulheres.

Também inclui: perfis, sistema de seguidores, hashtags, 5 tipos de ressonância.

Vem com VITALIS, ÁUREA ou Bundle 🌿`;

R['referral'] = `🎁 *Convida Amigas*

Código formato: *ECOS-XXXXXX*

*Como funciona:*
1. Recebes o teu código no teu perfil da app
2. Partilhas com amigas
3. Ela ganha *7 dias de trial*
4. Quando ela paga, tu ganhas *+7 dias* na tua subscrição

Máximo: 10 convites activos.
Link: app.seteecos.com/vitalis/pagamento?ref=TEU-CODIGO

Responde *7* para a Vivianne enviar o teu código 💛`;

R['catalogo'] = `📋 *Catálogo Sete Ecos 2026*

👉 app.seteecos.com/catalogo

Tudo num só lugar: módulos, preços e como começar.

1️⃣ VITALIS  2️⃣ LUMINA  3️⃣ ÁUREA  4️⃣ Preços  5️⃣ Pagamento  7️⃣ Vivianne`;

R['faq'] = `❓ *Perguntas Frequentes*

*É uma dieta?*
Não. Transformação nutricional com comida moçambicana.

*Preciso de ginásio?*
Não. Treinos para fazer em casa.

*Funciona sem internet?*
Sim, a app funciona offline.

*Posso cancelar?*
Sim, a qualquer momento.

*Que comida usam?*
Xima, matapa, caril, feijão nhemba.

*A coach é real?*
Sim, a Vivianne responde pessoalmente.

*LUMINA é mesmo grátis?*
Sim. Sem registo, sem compromisso, 5 minutos.

*Como pago?*
PayPal/cartão (imediato), M-Pesa ou transferência Standard Bank.

*Há desconto?*
Sim! Semestral poupa 17%, anual poupa 30%. Bundle poupa 25%.

Responde *7* para falar com a Vivianne 💛`;

const OBRIGADA = `De nada! 💛 Estou aqui para o que precisares.

🔮 Diagnóstico gratuito: app.seteecos.com/lumina
📋 Catálogo: app.seteecos.com/catalogo

Boa transformação! 🌿`;

const GENERICA = `Obrigada pela tua mensagem! 🌿

Posso ajudar com:

1️⃣ VITALIS (nutrição)
2️⃣ LUMINA (diagnóstico grátis)
3️⃣ ÁUREA (auto-valor)
4️⃣ Preços
5️⃣ Como pagar
6️⃣ Experimentar grátis
7️⃣ Falar com Vivianne

Ou escreve: *bundle*, *comunidade*, *catalogo*, *faq*

Responde com o número ou palavra 💛`;

// ===== DETECÇÃO POR PALAVRAS-CHAVE =====

function detectar(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const limpo = texto.trim();

  // Números directos
  if (['1', '2', '3', '4', '5', '6', '7'].includes(limpo)) {
    return { chave: limpo, notificar: limpo === '7' };
  }

  // Palavras específicas
  if (t.includes('bundle') || t.includes('pacote') || (t.includes('vitalis') && t.includes('aurea')))
    return { chave: 'bundle' };

  if (t.includes('catalogo') || t.includes('brochura'))
    return { chave: 'catalogo' };

  if (t.includes('comunidade') || t.includes('circulo') || t.includes('fogueira') || t.includes('sussurro'))
    return { chave: 'comunidade' };

  if (t.includes('referral') || t.includes('referencia') || t.includes('convidar') || t.includes('indicar') || t.includes('codigo'))
    return { chave: 'referral' };

  if (t.includes('faq') || t.includes('pergunta frequente'))
    return { chave: 'faq' };

  // Pagamento
  if (t.includes('pagar') || t.includes('pagamento') || t.includes('mpesa') || t.includes('m-pesa') || t.includes('paypal') || t.includes('transferencia') || t.includes('comprovativo') || t.includes('cartao') || t.includes('nib') || t.includes('standard bank'))
    return { chave: '5' };

  // Preços
  if (t.includes('preco') || t.includes('quanto custa') || t.includes('valor') || t.includes('quanto'))
    return { chave: '4' };

  // Trial
  if (t.includes('gratis') || t.includes('gratuito') || t.includes('trial') || t.includes('experimentar') || t.includes('teste'))
    return { chave: '6' };

  // Lumina
  if (t.includes('lumina') || t.includes('diagnostico') || t.includes('leitura') || t.includes('padrao emocional'))
    return { chave: '2' };

  // Áurea
  if (t.includes('aurea') || t.includes('auto-valor') || t.includes('merecimento') || t.includes('presenca') || t.includes('meditac') || t.includes('joias'))
    return { chave: '3' };

  // Vitalis
  if (t.includes('vitalis') || t.includes('nutri') || t.includes('coaching') || t.includes('receita') || t.includes('plano alimentar') || t.includes('emagrecer') || t.includes('peso') || t.includes('dieta') || t.includes('comida') || t.includes('alimenta'))
    return { chave: '1' };

  // Saudações
  if (/^(ola|oi|bom dia|boa tarde|boa noite|hello|hi|hey|boa$|epa)/.test(t))
    return { chave: 'saudacao' };

  // Ajuda humana
  if (t.includes('vivianne') || t.includes('coach') || t.includes('ajuda') || t.includes('suporte') || t.includes('problema') || t.includes('reclamar') || t.includes('nao funciona') || t.includes('erro'))
    return { chave: '7', notificar: true };

  // Obrigada
  if (t.includes('obrigad') || t.includes('thanks') || t.includes('brigada'))
    return { chave: 'obrigada' };

  // Plano (genérico)
  if (t.includes('plano'))
    return { chave: '4' };

  return { chave: null, notificar: true };
}

// ===== HANDLER (TWILIO) =====

export default async function handler(req, res) {
  // Twilio envia POST com form-data
  if (req.method !== 'POST') {
    return res.status(200).send('Sete Ecos WhatsApp Chatbot activo');
  }

  try {
    // Twilio envia dados como form-encoded ou JSON
    const body = req.body;
    const msgBody = (body.Body || '').trim();
    const from = body.From || ''; // whatsapp:+258...
    const nome = body.ProfileName || '';

    if (!msgBody) {
      return res.status(200).set('Content-Type', 'text/xml').send('<Response></Response>');
    }

    // Detectar intenção
    const { chave, notificar } = detectar(msgBody);

    let resposta;

    if (chave === 'saudacao') {
      resposta = nome ? SAUDACAO_COM_NOME(nome.split(' ')[0]) : SAUDACAO;
    } else if (chave === 'obrigada') {
      resposta = OBRIGADA;
    } else if (R[chave]) {
      resposta = R[chave];
    } else {
      resposta = GENERICA;
    }

    // Notificar coach se necessário (assíncrono)
    if (notificar && TWILIO_SID && TWILIO_TOKEN && TWILIO_NUMBER) {
      const contexto = chave === '7'
        ? 'Pediu para falar com a Vivianne'
        : `Mensagem não reconhecida: "${msgBody}"`;
      notificarCoach(from, nome, contexto).catch(() => {});
    }

    // Responder via TwiML (Twilio responde directamente)
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(resposta)}</Message>
</Response>`;

    return res.status(200).set('Content-Type', 'text/xml').send(twiml);
  } catch (error) {
    console.error('Erro webhook WhatsApp:', error);
    return res.status(200).set('Content-Type', 'text/xml').send('<Response></Response>');
  }
}

// ===== ESCAPE XML =====

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== NOTIFICAR COACH VIA TWILIO API =====

async function notificarCoach(clienteFrom, clienteNome, contexto) {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_NUMBER) return;

  const numero = clienteFrom.replace('whatsapp:', '');
  const msg = `📩 *Sete Ecos — Nova mensagem*\n\n👤 ${clienteNome || 'Novo contacto'}\n📱 ${numero}\n💬 ${contexto}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
  const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64');

  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: TWILIO_NUMBER,
      To: COACH_NUMERO,
      Body: msg,
    }),
  });
}
