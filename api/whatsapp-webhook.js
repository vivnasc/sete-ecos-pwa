/**
 * WhatsApp Business API — Chatbot Completo Sete Ecos
 *
 * Cobre TODOS os módulos e funcionalidades:
 * - LUMINA (diagnóstico gratuito)
 * - VITALIS (coaching nutricional)
 * - ÁUREA (auto-valor e presença)
 * - BUNDLE (Vitalis + Áurea com desconto)
 * - COMUNIDADE (espaço colectivo)
 * - Pagamentos (PayPal, M-Pesa, e-Mola, transferência)
 * - Trial gratuito de 7 dias
 * - Sistema de referral
 * - FAQ e suporte
 *
 * Variáveis de ambiente:
 * - WHATSAPP_VERIFY_TOKEN: Token de verificação (ex: "seteecos2026")
 * - WHATSAPP_ACCESS_TOKEN: Token da Meta Cloud API
 * - WHATSAPP_PHONE_NUMBER_ID: ID do número no Meta Business
 */

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'seteecos2026';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const COACH_NUMERO = '258851006473';

// ===== MENU PRINCIPAL =====

const MENU_PRINCIPAL = `Como te posso ajudar?

1️⃣ VITALIS — Coaching nutricional
2️⃣ LUMINA — Diagnóstico gratuito
3️⃣ ÁUREA — Auto-valor e presença
4️⃣ Preços e planos
5️⃣ Como pagar (M-Pesa, PayPal, etc.)
6️⃣ Experimentar grátis (7 dias)
7️⃣ Falar com a Vivianne

Responde com o número ou escreve à vontade 💛`;

const SAUDACAO = `Olá! 🌿 Bem-vinda ao *Sete Ecos*.

Sou a Vivianne, coach de nutrição e bem-estar feminino. Este é um sistema de transformação feito para a mulher moçambicana.

${MENU_PRINCIPAL}`;

// ===== RESPOSTAS COMPLETAS =====

const R = {};

// --- 1: VITALIS ---
R['1'] = `🌱 *VITALIS — Coaching Nutricional Completo*

O VITALIS é um programa de transformação nutricional feito para a mulher moçambicana. Não é uma dieta — é uma mudança real, ao teu ritmo.

*O que inclui:*
🍽 Plano alimentar personalizado (xima, matapa, caril, feijão nhemba)
🍳 Receitas moçambicanas saudáveis
✅ Check-in diário (30 segundos)
💬 Chat directo com a coach Vivianne
📊 Relatórios semanais de progresso
🏋️ Treinos adaptados (sem ginásio)
📋 Lista de compras automática
🔄 Espaço de Retorno (sem culpa se recaíres)
🎯 Gamificação com XP, níveis e conquistas
👥 Acesso à Comunidade

*3 fases do programa:*
1. Indução — primeiras mudanças
2. Estabilização — criar hábitos
3. Reeducação — transformação duradoura

👉 Catálogo completo: app.seteecos.com/catalogo
👉 Ver na app: app.seteecos.com/vitalis

Responde *4* para ver preços ou *6* para experimentar grátis 7 dias 💛`;

// --- 2: LUMINA ---
R['2'] = `🔮 *LUMINA — Diagnóstico Gratuito*

O LUMINA é o teu primeiro passo. Em *5 minutos* descobres:

✦ O teu padrão emocional dominante
✦ Como a alimentação afecta o teu humor
✦ O que o teu corpo realmente precisa
✦ Leitura personalizada com orientações

São *23 padrões possíveis* — cada leitura é única.

O diagnóstico também avalia:
• Relação com a comida
• Nível de energia e sono
• Estado emocional
• Fase do ciclo menstrual (opcional)

👉 *Começa agora:* app.seteecos.com/lumina

100% gratuito · Sem registo · 5 minutos

Após o LUMINA, o próximo passo natural é o *VITALIS* (responde *1*) 🌿`;

// --- 3: ÁUREA ---
R['3'] = `✨ *ÁUREA — Auto-Valor e Presença*

O ÁUREA trabalha a tua relação contigo mesma. Não é sobre aparência — é sobre *merecimento*.

*O que inclui:*
💎 100+ micro-práticas diárias de auto-cuidado
👗 Espelho de Roupa — presença através do vestir
💰 Carteira de Merecimento — quanto investes em ti
📝 Diário de Merecimento — escrita reflexiva
🧘 5 meditações guiadas em áudio
📊 Insights semanais e análise de padrões
💬 Chat com coach
👥 Acesso à Comunidade

*Sistema de Jóias de Ouro:*
🥉 Bronze (0-50) — Despertar
🥈 Prata (51-150) — Presença
🥇 Ouro (151-300) — Valor
💎 Diamante (301+) — Integração

*Preços ÁUREA:*
• Mensal: 975 MZN/mês
• Semestral: 5.265 MZN (poupas 585 MZN)
• Anual: 9.945 MZN (poupas 1.755 MZN)

👉 Ver na app: app.seteecos.com/aurea

Ou experimenta o *BUNDLE* (Vitalis + Áurea) com 25% de desconto — responde *bundle* 💛`;

// --- 4: PREÇOS ---
R['4'] = `💰 *Planos e Preços — Sete Ecos*

━━━━━━━━━━━━━━━━━━
🌱 *VITALIS* (Coaching Nutricional)
━━━━━━━━━━━━━━━━━━
📋 Mensal — *2.500 MZN*/mês
📋 Semestral — *12.500 MZN* (poupas 2.500!)
📋 Anual — *21.000 MZN* (poupas 9.000!)

━━━━━━━━━━━━━━━━━━
✨ *ÁUREA* (Auto-Valor)
━━━━━━━━━━━━━━━━━━
📋 Mensal — *975 MZN*/mês
📋 Semestral — *5.265 MZN* (10% desc.)
📋 Anual — *9.945 MZN* (15% desc.)

━━━━━━━━━━━━━━━━━━
🎁 *BUNDLE* (Vitalis + Áurea — 25% desc.)
━━━━━━━━━━━━━━━━━━
📋 Mensal — *2.600 MZN*/mês (poupas 875!)
📋 Semestral — *13.300 MZN* (poupas 4.465!)
📋 Anual — *23.200 MZN* (poupas 7.745!)

━━━━━━━━━━━━━━━━━━
🔮 *LUMINA* — *GRÁTIS* (sempre!)
━━━━━━━━━━━━━━━━━━

Todos os planos incluem acesso à *Comunidade*.

Responde *5* para saber como pagar ou *6* para experimentar grátis 7 dias 💛`;

// --- 5: PAGAMENTO ---
R['5'] = `💳 *Como Pagar — Sete Ecos*

*1. PayPal / Cartão (acesso imediato)*
Visa, Mastercard ou PayPal directo na app.
👉 app.seteecos.com/vitalis/pagamento

*2. M-Pesa*
📱 Envia para: *85 100 6473*
👤 Nome: Vivianne Santos
Depois envia o comprovativo aqui.

*3. e-Mola*
📱 Contacta-nos para dados e-Mola.
Depois envia o comprovativo aqui.

*4. Transferência Bancária*
🏦 Banco BCI
👤 Titular: Vivianne Nascimento
Contacta-nos para NIB completo.
Depois envia o comprovativo aqui.

⏱ *Prazos de activação:*
• PayPal/cartão: acesso imediato
• M-Pesa/e-Mola/transferência: activação em menos de 1 hora após comprovativo

Já pagaste? Envia o comprovativo aqui que activo o teu acesso! 💛`;

// --- 6: TRIAL ---
R['6'] = `🎁 *Experimenta Grátis — 7 Dias*

Podes experimentar o VITALIS durante *7 dias grátis* antes de decidir.

*O que tens acesso no trial:*
✅ Dashboard com progresso
✅ Check-in diário
✅ Receitas moçambicanas
✅ Espaço de Retorno
✅ Desafios semanais
✅ Chat com a coach

*Limitações do trial:*
❌ Plano alimentar completo
❌ Lista de compras
❌ Relatórios detalhados
❌ Fotos de progresso

Para activar o trial gratuito:
👉 Regista-te em app.seteecos.com/vitalis/pagamento
Ou responde *7* e peço à Vivianne para te activar 🌿`;

// --- 7: FALAR COM VIVIANNE ---
R['7'] = `💛 *Falar com a Vivianne*

A tua mensagem foi recebida! A Vivianne vai responder-te pessoalmente assim que possível.

⏰ Horário: Seg-Sex, 9h-18h (Maputo)

Enquanto esperas:
🔮 Diagnóstico gratuito: app.seteecos.com/lumina
📋 Catálogo: app.seteecos.com/catalogo

Obrigada pela paciência 🌿`;

// --- BUNDLE ---
R['bundle'] = `🎁 *BUNDLE — Vitalis + Áurea (25% desconto!)*

A combinação perfeita: nutrição + auto-valor.

*O que inclui:*
🌱 Tudo do VITALIS (coaching nutricional completo)
✨ Tudo do ÁUREA (micro-práticas, meditações, diário)
👥 Comunidade incluída

*Preços Bundle (25% desconto):*
📋 Mensal — *2.600 MZN*/mês (poupas 875 MZN!)
📋 Semestral — *13.300 MZN* (poupas 4.465 MZN!)
📋 Anual — *23.200 MZN* (poupas 7.745 MZN!)

👉 Ver mais: app.seteecos.com/bundle

Responde *5* para saber como pagar 💛`;

// --- COMUNIDADE ---
R['comunidade'] = `👥 *Comunidade Sete Ecos*

Um espaço seguro de transformação colectiva. Incluída em todos os planos pagos.

*4 espaços:*

🌊 *O Rio* — Reflexões guiadas por prompts diários. Partilha pensamentos, lê os de outras mulheres.

👥 *Círculos de Eco* — Grupos de 7-12 mulheres que exploram o mesmo tema juntas, com apoio mútuo.

🔥 *Fogueira* — Espaço efémero de 24h. Todas se reúnem num tema. Conversas honestas que desaparecem.

💜 *Sussurros* — Mensagens privadas de apoio e encorajamento entre mulheres.

Não é uma rede social. É um espaço de cura colectiva.

A Comunidade vem incluída no VITALIS, ÁUREA e Bundle 🌿`;

// --- REFERRAL ---
R['referral'] = `🎁 *Programa de Referência*

Partilha o Sete Ecos com amigas e ambas ganham!

*Como funciona:*
1. Recebes o teu código único (formato ECOS-XXXXXX)
2. Partilha com amigas
3. Quando ela subscreve, tu ganhas *+7 dias grátis*
4. Ela ganha *7 dias de trial*

Podes convidar até *10 pessoas*.

Para receber o teu código de referência, regista-te em app.seteecos.com e vai ao teu perfil.

Ou responde *7* e a Vivianne envia-te o teu código 💛`;

// --- CATÁLOGO ---
R['catalogo'] = `📋 *Catálogo Sete Ecos 2026*

Tudo sobre os nossos serviços num só lugar:

👉 app.seteecos.com/catalogo

Inclui: LUMINA, VITALIS, ÁUREA, Comunidade, preços e formas de pagamento.

Tens dúvidas? Responde com um número:
1️⃣ VITALIS  2️⃣ LUMINA  3️⃣ ÁUREA  4️⃣ Preços  5️⃣ Pagamento  7️⃣ Falar com Vivianne`;

// --- FAQ ---
R['faq'] = `❓ *Perguntas Frequentes*

*É uma dieta?*
Não. É um sistema de transformação nutricional que usa a comida moçambicana que já conheces.

*Preciso de ginásio?*
Não. Os treinos são adaptados para fazer em casa.

*Funciona sem internet?*
Sim! A app funciona offline (PWA).

*Posso cancelar?*
Sim, a qualquer momento.

*Que comida usam?*
Xima, matapa, caril, feijão nhemba — comida real moçambicana.

*A coach é real?*
Sim! A Vivianne responde pessoalmente, não é um bot.

*O LUMINA é mesmo grátis?*
Sim, 100% gratuito, sem registo, em 5 minutos.

*Posso pagar por M-Pesa?*
Sim! M-Pesa, e-Mola, PayPal, cartão e transferência.

Mais dúvidas? Responde *7* para falar com a Vivianne 💛`;

// --- MENSAGEM GENÉRICA ---
const GENERICA = `Obrigada pela tua mensagem! 🌿

Posso ajudar-te com:

1️⃣ VITALIS (coaching nutricional)
2️⃣ LUMINA (diagnóstico grátis)
3️⃣ ÁUREA (auto-valor)
4️⃣ Preços e planos
5️⃣ Como pagar
6️⃣ Experimentar grátis
7️⃣ Falar com a Vivianne

Ou escreve: *catalogo*, *bundle*, *comunidade*, *referral*, *faq*

Responde com o número ou palavra 💛`;

// ===== DETECÇÃO POR PALAVRAS-CHAVE =====

function detectarResposta(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Números directos
  if (['1', '2', '3', '4', '5', '6', '7'].includes(texto.trim())) {
    return { chave: texto.trim(), notificarCoach: texto.trim() === '7' };
  }

  // Palavras-chave específicas
  if (t.includes('bundle') || t.includes('pacote') || (t.includes('vitalis') && t.includes('aurea')))
    return { chave: 'bundle' };

  if (t.includes('catalogo') || t.includes('brochura'))
    return { chave: 'catalogo' };

  if (t.includes('comunidade') || t.includes('rio') || t.includes('circulo') || t.includes('fogueira') || t.includes('sussurro'))
    return { chave: 'comunidade' };

  if (t.includes('referral') || t.includes('referencia') || t.includes('convidar') || t.includes('codigo') || t.includes('indicar'))
    return { chave: 'referral' };

  if (t.includes('faq') || t.includes('pergunta') || t.includes('duvida'))
    return { chave: 'faq' };

  // Pagamento
  if (t.includes('pagar') || t.includes('pagamento') || t.includes('mpesa') || t.includes('m-pesa') || t.includes('emola') || t.includes('e-mola') || t.includes('paypal') || t.includes('transferencia') || t.includes('comprovativo') || t.includes('cartao'))
    return { chave: '5' };

  // Preços
  if (t.includes('preco') || t.includes('quanto custa') || t.includes('valor') || t.includes('quanto') || t.includes('plano'))
    return { chave: '4' };

  // Trial
  if (t.includes('gratis') || t.includes('gratuito') || t.includes('trial') || t.includes('experimentar') || t.includes('teste'))
    return { chave: '6' };

  // Lumina
  if (t.includes('lumina') || t.includes('diagnostico') || t.includes('leitura') || t.includes('padrao'))
    return { chave: '2' };

  // Áurea
  if (t.includes('aurea') || t.includes('auto-valor') || t.includes('autovalor') || t.includes('merecimento') || t.includes('presenca') || t.includes('meditac'))
    return { chave: '3' };

  // Vitalis
  if (t.includes('vitalis') || t.includes('nutri') || t.includes('coaching') || t.includes('receita') || t.includes('plano alimentar') || t.includes('emagrecer') || t.includes('peso') || t.includes('dieta') || t.includes('comida') || t.includes('alimenta'))
    return { chave: '1' };

  // Saudações
  if (/^(ola|oi|bom dia|boa tarde|boa noite|hello|hi|hey|boa|epa)/.test(t))
    return { chave: 'saudacao' };

  // Falar com humana
  if (t.includes('vivianne') || t.includes('coach') || t.includes('ajuda') || t.includes('suporte') || t.includes('problema') || t.includes('reclamar') || t.includes('nao funciona') || t.includes('erro'))
    return { chave: '7', notificarCoach: true };

  // Agradecimento
  if (t.includes('obrigad') || t.includes('thanks') || t.includes('brigada'))
    return { chave: 'obrigada' };

  return { chave: null, notificarCoach: true };
}

// ===== HANDLER PRINCIPAL =====

export default async function handler(req, res) {
  // GET = verificação do webhook pela Meta
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook WhatsApp verificado');
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Token inválido');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const body = req.body;
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages?.[0]) {
      return res.status(200).send('OK');
    }

    const message = value.messages[0];
    const from = message.from;
    const nome = value.contacts?.[0]?.profile?.name || '';
    const msgBody = (message.text?.body || '').trim();

    // Ignorar mensagens vazias
    if (!msgBody) return res.status(200).send('OK');

    // Detectar intenção
    const { chave, notificarCoach } = detectarResposta(msgBody);

    let resposta;

    if (chave === 'saudacao') {
      // Personalizar saudação se temos nome
      resposta = nome
        ? `Olá ${nome.split(' ')[0]}! 🌿 Bem-vinda ao *Sete Ecos*.\n\nSou a Vivianne, coach de nutrição e bem-estar feminino.\n\n${MENU_PRINCIPAL}`
        : SAUDACAO;
    } else if (chave === 'obrigada') {
      resposta = `De nada! 💛 Estou aqui para o que precisares.\n\n🔮 Diagnóstico gratuito: app.seteecos.com/lumina\n📋 Catálogo: app.seteecos.com/catalogo\n\nBoa transformação! 🌿`;
    } else if (R[chave]) {
      resposta = R[chave];
    } else {
      resposta = GENERICA;
    }

    // Enviar resposta
    await enviarMensagem(from, resposta);

    // Notificar coach se necessário
    if (notificarCoach) {
      const contexto = chave === '7'
        ? `Cliente pediu para falar com a Vivianne`
        : `Mensagem não reconhecida: "${msgBody}"`;

      notificarVivianne(from, nome, contexto).catch(() => {});
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    return res.status(200).send('OK');
  }
}

// ===== ENVIAR MENSAGEM =====

async function enviarMensagem(para, texto) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.error('WhatsApp API não configurada');
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
    console.error('Erro ao enviar WhatsApp:', err);
  }
}

// ===== NOTIFICAR COACH =====

async function notificarVivianne(clienteNumero, clienteNome, contexto) {
  const msg = `📩 *Nova mensagem Sete Ecos*

👤 ${clienteNome || 'Contacto novo'}
📱 +${clienteNumero}
💬 ${contexto}

Responde directamente à cliente no WhatsApp.`;

  await enviarMensagem(COACH_NUMERO, msg);
}
