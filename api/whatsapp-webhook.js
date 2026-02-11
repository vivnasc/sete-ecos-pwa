/**
 * WhatsApp Chatbot — Sete Ecos (via Twilio)
 *
 * Webhook para Twilio WhatsApp Sandbox/Business.
 * Recebe mensagens e responde automaticamente com TwiML.
 *
 * INVENTÁRIO COMPLETO de features cobertas:
 * - LUMINA (diagnóstico gratuito, 23 padrões, sem registo)
 * - VITALIS (coaching nutricional, 3 fases, 28 conquistas, 8 níveis)
 * - ÁUREA (auto-valor, jóias de ouro, 27 badges, 4 níveis)
 * - BUNDLE (Vitalis + Áurea, 25% desconto)
 * - COMUNIDADE (Rio 75 prompts, Círculos 12 max, Fogueira 24h, Sussurros, 5 ressonâncias)
 * - Pagamentos: PayPal/cartão, M-Pesa (85 100 6473), Standard Bank (NIB 0003 0108 0669 8041 0086 5)
 * - Trial 7 dias (Vitalis e Áurea), referral ECOS-XXXXXX (+7 dias)
 * - Promos: VEMVITALIS20 (20%), VOLTEI15 (15% win-back)
 * - Garantia 7 dias (reembolso total)
 * - Gamificação: XP, streaks, 8 níveis Vitalis, 4 níveis Áurea
 *
 * Configuração Twilio:
 * 1. Console → Messaging → Try it Out → Send a WhatsApp message
 * 2. Sandbox: cola o webhook URL no campo "When a message comes in"
 * 3. Production: Configure WhatsApp Sender → Webhook URL
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

Ou escreve: *desconto*, *bundle*, *comunidade*, *faq*

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
🎯 28 conquistas, 8 níveis, streaks e XP
👥 Comunidade incluída

*3 fases:*
1. Indução — primeiras mudanças
2. Estabilização — criar hábitos
3. Reeducação — transformação duradoura

*Preços:*
• Mensal: 2.500 MZN ($38)
• Semestral: 12.500 MZN ($190) — poupas 2.500!
• Anual: 21.000 MZN ($320) — poupas 9.000!

🎁 Código *VEMVITALIS20* = 20% desconto!
🛡 Garantia: 7 dias reembolso total, sem perguntas.

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

*27 badges para desbloquear:* semana dourada, voz constante, escuta profunda, prioridade própria, e mais.

*Preços:*
• Mensal: 975 MZN ($15)
• Semestral: 5.265 MZN ($81) — 10% desc.
• Anual: 9.945 MZN ($153) — 15% desc.

🛡 Garantia: 7 dias reembolso total, sem perguntas.

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

🎁 Código *VEMVITALIS20* = 20% extra!
🛡 Todos com garantia 7 dias reembolso total.
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

🎁 Tens código de desconto? Usa na app ao pagar.
Código *VEMVITALIS20* = 20% de desconto!

⏱ *Activação:*
• PayPal/cartão → imediato (automático)
• M-Pesa/transferência → menos de 1h após comprovativo

🛡 *Garantia:* 7 dias reembolso total, sem perguntas.

Já pagaste? Envia o comprovativo aqui! 💛`;

R['6'] = `🎁 *Trial Grátis — 7 Dias*

Experimenta o VITALIS ou ÁUREA durante *7 dias* sem pagar.

*VITALIS — acesso no trial:*
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

*ÁUREA — trial dá acesso completo* durante 7 dias.

👉 Regista-te: app.seteecos.com/vitalis/pagamento

Após o trial, se gostares, usa *VEMVITALIS20* para 20% de desconto!
🛡 Garantia adicional: 7 dias reembolso total após pagamento.

Ou responde *7* para a Vivianne te activar 🌿`;

R['7'] = `💛 *Falar com a Vivianne*

A tua mensagem foi recebida! A Vivianne responde pessoalmente assim que possível.

⏰ Horário: Seg-Sex, 9h-18h (Maputo)

Enquanto esperas:
🔮 Diagnóstico gratuito: app.seteecos.com/lumina
📋 Catálogo: app.seteecos.com/catalogo

Obrigada pela paciência 🌿`;

R['bundle'] = `🎁 *BUNDLE — Vitalis + Áurea (25% desconto)*

Nutrição + Auto-valor juntos. O caminho completo.

*Inclui tudo de:*
🌱 VITALIS — plano alimentar, receitas, check-in, treinos, relatórios, chat, 28 conquistas
✨ ÁUREA — 100+ práticas, meditações, diário, espelho de roupa, 27 badges, 4 níveis jóias
👥 Comunidade (Rio, Círculos, Fogueira, Sussurros)

*Preços (25% desconto sobre individual):*
📋 Mensal — *2.600 MZN* ($40) — poupas 875 MZN
📋 Semestral — *13.300 MZN* ($204) — poupas 4.465 MZN
📋 Anual — *23.200 MZN* ($355) — poupas 7.745 MZN

🎁 Código *VEMVITALIS20* = 20% extra sobre Bundle!
🛡 Garantia: 7 dias reembolso total, sem perguntas.
🎁 Trial 7 dias grátis disponível (responde *6*).

👉 app.seteecos.com/bundle

Responde *5* para saber como pagar 💛`;

R['comunidade'] = `👥 *Comunidade Sete Ecos*

Espaço seguro de transformação colectiva. Incluída em todos os planos pagos.

🌊 *O Rio* — Reflexões guiadas por *75 prompts* sobre gratidão, desafios, descoberta, intenção e transformação. Partilha pública ou privada.

👥 *Círculos de Eco* — Grupos de até *12 mulheres* por tema (Eco), com guardiã. Intimidade e apoio.

🔥 *Fogueira* — Espaço de *24h*. Tema do dia, conversas honestas que desaparecem ao amanhecer.

💜 *Sussurros* — Mensagens *privadas* de apoio entre mulheres. Modelos prontos disponíveis.

📖 *Stories* — Testemunhos de transformação de outras mulheres.

🪞 *Jornada* — O teu perfil pessoal e história de progresso.

*5 tipos de Ressonância (em vez de "likes"):*
🫧 Ressoo contigo · ✨ Enviar Luz · 🌿 Dar Força · 🪞 Espelhar · 🌱 Enraizar

Inclui sistema de seguidores e hashtags.

Vem com VITALIS, ÁUREA ou Bundle 🌿`;

R['referral'] = `🎁 *Convida Amigas — Programa de Referência*

Código formato: *ECOS-XXXXXX*

*Como funciona:*
1. Recebes o teu código no teu perfil da app
2. Partilhas com amigas (WhatsApp, link directo)
3. Ela ganha *7 dias de trial grátis*
4. Quando ela paga, tu ganhas *+7 dias* na tua subscrição

📊 Máximo: 10 convites activos por utilizadora.
🔗 Link: app.seteecos.com/vitalis/pagamento?ref=TEU-CODIGO

A app sugere partilhar automaticamente após conquistas e streaks.

Responde *7* para a Vivianne enviar o teu código 💛`;

R['catalogo'] = `📋 *Catálogo Sete Ecos 2026*

👉 app.seteecos.com/catalogo

Tudo num só lugar: módulos, preços, funcionalidades e como começar.

1️⃣ VITALIS  2️⃣ LUMINA  3️⃣ ÁUREA  4️⃣ Preços  5️⃣ Pagamento  7️⃣ Vivianne`;

R['desconto'] = `🎁 *Descontos Disponíveis*

━━━━━━━━━━━━━━━━━━
*Códigos Promocionais:*
━━━━━━━━━━━━━━━━━━

🏷 *VEMVITALIS20* — *20% desconto* em qualquer plano Vitalis
Usa na app em: app.seteecos.com/vitalis/pagamento

━━━━━━━━━━━━━━━━━━
*Descontos por Plano:*
━━━━━━━━━━━━━━━━━━

📋 Semestral — poupa *17%* vs mensal
📋 Anual — poupa *30%* vs mensal
📋 Bundle (Vitalis + Áurea) — *25%* desconto

━━━━━━━━━━━━━━━━━━
*Descontos de Renovação:*
━━━━━━━━━━━━━━━━━━

📋 Renovação antecipada (14 dias antes) — *10%* desc.
📋 Última semana — *15%* desc.
📋 Win-back (volta após expirar) — *20%* desc. com código *VOLTEI15*

━━━━━━━━━━━━━━━━━━
*Referência:*
━━━━━━━━━━━━━━━━━━

🎁 Convida amigas → ela ganha 7 dias grátis, tu ganhas +7 dias (escreve *referral*)

Os descontos *acumulam* com o VEMVITALIS20!

Responde *5* para saber como pagar 💛`;

R['gamificacao'] = `🎮 *Gamificação — Conquistas e Níveis*

━━━━━━━━━━━━━━━━━━
🌱 *VITALIS — 28 conquistas + 8 níveis*
━━━━━━━━━━━━━━━━━━

*Níveis (por XP):*
🌰 Semente (0) → 🌱 Broto (50) → 🌿 Planta (150) → 🌳 Árvore (300) → 🌲 Floresta (500) → 🌸 Jardim (750) → 🏝 Paraíso (1000) → 👑 Lenda (1500)

*Conquistas incluem:*
🔥 Streaks — 3, 7, 14, 30, 60 dias consecutivos
💧 Água — registos de hidratação
🏃‍♀️ Treinos — 1, 10 treinos
🍽 Refeições — 10, 50 registos
⚖️ Peso — -1kg, -5kg, -10kg, meta atingida
📝 Check-ins — 7, 30 check-ins
🎓 Fases — completar Indução, Estabilização, Reeducação
😴 Sono perfeito — 7 noites com 7h+

━━━━━━━━━━━━━━━━━━
✨ *ÁUREA — 27 badges + Jóias de Ouro*
━━━━━━━━━━━━━━━━━━

*4 Níveis de Jóias:*
🥉 Bronze (0-50) → 🥈 Prata (51-150) → 🥇 Ouro (151-300) → 💎 Diamante (301+)

*Badges incluem:*
✨ Semana de Valor · 🌟 Mês de Ouro · 👗 Semana Dourada · 📝 Voz Constante · 🎧 Escuta Profunda · 💰 Prioridade Própria · 👸 A Que Merece · 💎 Jornada Completa

Cada prática, meditação e registo = jóias ganhas! 💛`;

R['garantia'] = `🛡 *Garantia de 7 Dias — Reembolso Total*

Experimentas sem risco. Se não gostares, devolvemos *tudo*.

*Como funciona:*
1. Subscreves qualquer plano (Vitalis, Áurea ou Bundle)
2. Tens 7 dias completos para experimentar
3. Se não for para ti → reembolso total, sem perguntas
4. Contacta a Vivianne (responde *7*) e recebe de volta

Sem letras miúdas. Sem complicações.

Também podes começar com trial grátis de 7 dias antes de pagar (responde *6*) 💛`;

R['faq'] = `❓ *Perguntas Frequentes*

*É uma dieta?*
Não. Transformação nutricional com comida moçambicana real.

*Preciso de ginásio?*
Não. Treinos para fazer em casa, sem equipamento.

*Funciona sem internet?*
Sim, a app funciona offline (é uma PWA).

*Posso cancelar?*
Sim, a qualquer momento. Garantia 7 dias reembolso total.

*Que comida usam?*
Xima, matapa, caril, feijão nhemba — comida nossa.

*A coach é real?*
Sim, a Vivianne Saraiva responde pessoalmente.

*LUMINA é mesmo grátis?*
Sim. Sem registo, sem compromisso, 5 minutos.

*Como pago?*
PayPal/cartão (imediato), M-Pesa (85 100 6473) ou transferência Standard Bank.

*Há desconto?*
Sim! Código *VEMVITALIS20* = 20% desconto.
Semestral poupa 17%, anual poupa 30%. Bundle poupa 25%.

*O trial é mesmo grátis?*
Sim. 7 dias, sem cartão, sem compromisso.

*Posso usar Vitalis e Áurea juntos?*
Sim! O Bundle dá 25% de desconto nos dois.

*Como funciona a comunidade?*
Rio (reflexões), Círculos (grupos), Fogueira (24h), Sussurros (privado).

Responde *7* para falar com a Vivianne 💛`;

const OBRIGADA = `De nada! 💛 Estou aqui para o que precisares.

🔮 Diagnóstico gratuito: app.seteecos.com/lumina
📋 Catálogo: app.seteecos.com/catalogo
🎁 Código desconto: VEMVITALIS20 (20%)

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

Ou escreve: *desconto*, *bundle*, *comunidade*, *gamificação*, *garantia*, *referral*, *catalogo*, *faq*

Responde com o número ou palavra 💛`;

// ===== DETECÇÃO POR PALAVRAS-CHAVE =====

function detectar(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const limpo = texto.trim();

  // Números directos
  if (['1', '2', '3', '4', '5', '6', '7'].includes(limpo)) {
    return { chave: limpo, notificar: limpo === '7' };
  }

  // Códigos promo directos (detectar se alguém escreve o código)
  if (t.includes('vemvitalis') || t.includes('voltei15'))
    return { chave: 'desconto' };

  // Desconto / promoção
  if (t.includes('desconto') || t.includes('promocao') || t.includes('promo') || t.includes('cupao') || t.includes('cupom') || t.includes('codigo promocional') || t.includes('oferta'))
    return { chave: 'desconto' };

  // Garantia
  if (t.includes('garantia') || t.includes('reembolso') || t.includes('devolver') || t.includes('devolucao') || t.includes('cancelar') || t.includes('arrependimento'))
    return { chave: 'garantia' };

  // Gamificação
  if (t.includes('gamifica') || t.includes('conquista') || t.includes('nivel') || t.includes('niveis') || t.includes('badge') || t.includes('xp') || t.includes('streak') || t.includes('joia'))
    return { chave: 'gamificacao' };

  // Palavras específicas — módulos compostos
  if (t.includes('bundle') || t.includes('pacote') || (t.includes('vitalis') && t.includes('aurea')))
    return { chave: 'bundle' };

  if (t.includes('catalogo') || t.includes('brochura'))
    return { chave: 'catalogo' };

  if (t.includes('comunidade') || t.includes('circulo') || t.includes('fogueira') || t.includes('sussurro') || t.includes('ressonancia'))
    return { chave: 'comunidade' };

  if (t.includes('referral') || t.includes('referencia') || t.includes('convidar') || t.includes('indicar') || t.includes('convite'))
    return { chave: 'referral' };

  if (t.includes('faq') || t.includes('pergunta frequente') || t.includes('duvida'))
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
  if (t.includes('aurea') || t.includes('auto-valor') || t.includes('merecimento') || t.includes('presenca') || t.includes('meditac'))
    return { chave: '3' };

  // Vitalis
  if (t.includes('vitalis') || t.includes('nutri') || t.includes('coaching') || t.includes('receita') || t.includes('plano alimentar') || t.includes('emagrecer') || t.includes('peso') || t.includes('dieta') || t.includes('comida') || t.includes('alimenta'))
    return { chave: '1' };

  // Saudações
  if (/^(ola|oi|bom dia|boa tarde|boa noite|hello|hi|hey|boa$|epa|menu)/.test(t))
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

    // Notificar coach se necessário (assíncrono, não bloqueia resposta)
    if (notificar && TWILIO_SID && TWILIO_TOKEN && TWILIO_NUMBER) {
      const contexto = chave === '7'
        ? 'Pediu para falar com a Vivianne'
        : `Mensagem não reconhecida: "${msgBody}"`;
      notificarCoach(from, nome, contexto).catch(() => {});
    }

    // Responder via TwiML (Twilio responde directamente ao utilizador)
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
