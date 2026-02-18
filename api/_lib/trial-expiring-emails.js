/**
 * TRIAL EXPIRING EMAILS - Emails automáticos para trials próximos de expirar
 *
 * Cron diário (8h AM GMT): envia emails baseados em dias restantes de trial
 * - Dia -3: "Faltam 3 dias - aproveita ao máximo!"
 * - Dia -1: "Última oportunidade - não percas o progresso"
 * - Dia 0: "O teu trial expirou - continua a jornada"
 * - Dia +3: "Sentimos a tua falta - 15% desconto para voltar"
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// ============================================================
// TEMPLATES HTML DOS EMAILS
// ============================================================

const emailTemplate = (content, preheader) => `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
    body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #F5F2ED; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; }
    .header { background: linear-gradient(135deg, #7C8B6F 0%, #6B7A5D 100%); padding: 40px 30px; text-align: center; }
    .header h1 { font-family: 'Playfair Display', serif; color: #FFFFFF; margin: 0; font-size: 32px; font-weight: 700; }
    .content { padding: 40px 30px; color: #4A4035; }
    .content p { line-height: 1.7; margin-bottom: 16px; font-size: 16px; }
    .cta { text-align: center; margin: 32px 0; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #7C8B6F 0%, #6B7A5D 100%); color: #FFFFFF; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; }
    .footer { background-color: #F5F2ED; padding: 30px; text-align: center; color: #6B5C4C; font-size: 14px; }
    .footer a { color: #7C8B6F; text-decoration: none; }
    .highlight { background-color: #FFF9E6; border-left: 4px solid #C9A227; padding: 16px; margin: 24px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>
  <div class="container">
    ${content}
    <div class="footer">
      <p><strong>SETE ECOS</strong> - Transmutação Feminina</p>
      <p>
        <a href="https://app.seteecos.com">app.seteecos.com</a> •
        <a href="https://app.seteecos.com/conta">A Minha Conta</a>
      </p>
      <p style="font-size: 12px; color: #9B8B7E; margin-top: 16px;">
        Estás a receber este email porque te registaste no Sete Ecos.<br>
        Se não queres receber emails, podes <a href="https://app.seteecos.com/conta" style="color: #7C8B6F;">gerir as tuas preferências</a>.
      </p>
    </div>
  </div>
</body>
</html>
`;

const email3DiasAntes = (nome, eco = 'Vitalis') => ({
  subject: `${nome}, faltam 3 dias do teu trial ${eco} 🌿`,
  preheader: 'Aproveita ao máximo os próximos dias!',
  html: emailTemplate(
    `
    <div class="header">
      <h1>Faltam 3 Dias ⏰</h1>
    </div>
    <div class="content">
      <p>Olá, <strong>${nome}</strong>!</p>

      <p>Passaste para te dizer que faltam <strong>apenas 3 dias</strong> do teu trial gratuito do ${eco}.</p>

      <div class="highlight">
        <p style="margin: 0;"><strong>💡 Dica:</strong> Nos próximos dias, experimenta tudo o que o ${eco} tem para oferecer:</p>
        <ul style="margin: 8px 0 0 0;">
          ${eco === 'Vitalis' ? `
            <li>Faz o check-in diário</li>
            <li>Explora o plano alimentar personalizado</li>
            <li>Experimenta as receitas</li>
            <li>Fala com a Coach IA</li>
          ` : `
            <li>Faz as micro-práticas diárias</li>
            <li>Usa o espelho de roupa</li>
            <li>Preenche o diário de merecimento</li>
            <li>Conversa com a Coach Áurea</li>
          `}
        </ul>
      </div>

      <p>Quero que vivas a experiência completa para decidires se o ${eco} é para ti. Se tiveres dúvidas, estou aqui! 🤗</p>

      <p>Qualquer coisa, responde a este email. Estou aqui para te ajudar.</p>

      <p style="margin-top: 32px;">Com carinho,<br><strong>Vivianne</strong><br><em>Founder & Coach, Sete Ecos</em></p>
    </div>
  `,
    'Aproveita ao máximo os próximos 3 dias do teu trial!'
  ),
});

const email1DiaAntes = (nome, eco = 'Vitalis') => ({
  subject: `${nome}, o teu trial ${eco} termina amanhã 🕐`,
  preheader: 'Não percas o teu progresso - continua a tua jornada',
  html: emailTemplate(
    `
    <div class="header">
      <h1>Última Oportunidade 🌟</h1>
    </div>
    <div class="content">
      <p>Olá, <strong>${nome}</strong>!</p>

      <p>O teu trial de 7 dias do ${eco} termina <strong>amanhã</strong>.</p>

      <p>Vi o teu progresso até agora e estou impressionada! Seria uma pena perder tudo o que já construíste. 💪</p>

      <div class="highlight">
        <p style="margin: 0 0 12px 0;"><strong>Continua a tua jornada</strong></p>
        <p style="margin: 0;">Ao subscreveres agora:</p>
        <ul style="margin: 8px 0 0 0;">
          <li>✅ Mantens todo o teu progresso</li>
          <li>✅ Continuas com a mesma energia</li>
          <li>✅ Garantia de 7 dias (devolução total se não ficares satisfeita)</li>
          ${eco === 'Vitalis' ? `<li>💰 <strong>Bundle Vitalis + Áurea</strong>: Poupa 25%</li>` : ''}
        </ul>
      </div>

      <div class="cta">
        <a href="https://app.seteecos.com/vitalis/pagamento">Continuar a Minha Jornada →</a>
      </div>

      <p>Se tiveres dúvidas sobre os planos ou pagamento, responde a este email. Estou aqui para te ajudar!</p>

      <p style="margin-top: 32px;">Acredito em ti! 🌿<br><strong>Vivianne</strong></p>
    </div>
  `,
    'O teu trial termina amanhã - não percas o progresso!'
  ),
});

const emailTrialExpirado = (nome, eco = 'Vitalis') => ({
  subject: `${nome}, o teu trial ${eco} expirou hoje 😔`,
  preheader: 'Volta quando estiveres pronta - estamos aqui!',
  html: emailTemplate(
    `
    <div class="header">
      <h1>Trial Expirado 📅</h1>
    </div>
    <div class="content">
      <p>Olá, <strong>${nome}</strong>,</p>

      <p>O teu trial de 7 dias do ${eco} expirou hoje. Espero que tenhas gostado da experiência!</p>

      <p>Sei que às vezes o timing não é o ideal, ou ainda tens dúvidas. Está tudo bem. 🤗</p>

      <div class="highlight">
        <p style="margin: 0 0 12px 0;"><strong>A porta continua aberta</strong></p>
        <p style="margin: 0;">Quando estiveres pronta para continuar, estaremos aqui:</p>
        <ul style="margin: 8px 0 0 0;">
          <li>🔓 Acesso imediato assim que subscreveres</li>
          <li>📊 Todo o teu progresso está guardado</li>
          <li>💝 Garantia de 7 dias (sem risco)</li>
        </ul>
      </div>

      <div class="cta">
        <a href="https://app.seteecos.com/vitalis/pagamento">Voltar ao ${eco} →</a>
      </div>

      <p>Se tiveres alguma dúvida ou feedback sobre a tua experiência, <strong>responde a este email</strong>. Levo o teu feedback muito a sério!</p>

      <p style="margin-top: 32px;">Com gratidão,<br><strong>Vivianne</strong></p>
    </div>
  `,
    'O teu trial expirou - volta quando estiveres pronta!'
  ),
});

const emailWinBack3Dias = (nome, eco = 'Vitalis') => ({
  subject: `${nome}, sentimos a tua falta! Volta com 15% desconto 💚`,
  preheader: 'Oferta especial para voltar à tua jornada',
  html: emailTemplate(
    `
    <div class="header">
      <h1>Sentimos a Tua Falta 💌</h1>
    </div>
    <div class="content">
      <p>Olá, <strong>${nome}</strong>,</p>

      <p>Passaram 3 dias desde que o teu trial expirou, e queria passar para dizer: <strong>sentimos a tua falta!</strong> 🌿</p>

      <p>Sei que a vida acontece, e talvez não fosse o momento certo. Mas se ainda pensas em voltar, tenho uma oferta especial para ti:</p>

      <div class="highlight" style="background: linear-gradient(135deg, #FFF9E6 0%, #FFF5D6 100%); border-left-color: #C9A227;">
        <p style="font-size: 20px; font-weight: 700; color: #2D3A25; margin: 0 0 12px 0;">🎁 15% de Desconto Exclusivo</p>
        <p style="margin: 0;">Válido nos próximos <strong>3 dias</strong>. Usa o código:</p>
        <p style="font-size: 24px; font-weight: 700; color: #7C8B6F; letter-spacing: 2px; margin: 12px 0 0 0;">VOLTEI15</p>
      </div>

      <div class="cta">
        <a href="https://app.seteecos.com/vitalis/pagamento?code=VOLTEI15">Voltar com Desconto →</a>
      </div>

      <p><strong>Mais:</strong> Se subscreveres o Bundle Vitalis + Áurea, o desconto aplica-se ao preço já reduzido (25% + 15% = 40% de poupança total vs preços individuais!).</p>

      <p>Todo o teu progresso está guardado. É só voltar e continuar de onde paraste. 💪</p>

      <p style="margin-top: 32px;">Estou aqui se precisares,<br><strong>Vivianne</strong><br><em>P.S.: Esta oferta expira em 3 dias.</em></p>
    </div>
  `,
    'Oferta exclusiva: 15% desconto para voltares!'
  ),
});

// ============================================================
// FUNÇÃO PARA ENVIAR EMAIL VIA RESEND
// ============================================================

async function enviarEmailResend(to, subject, html, tipo) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Vivianne - Sete Ecos <feedback@seteecos.com>',
        to,
        subject,
        html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`❌ Erro Resend para ${to}:`, result);
      return false;
    }

    // Log do envio
    await supabase.from('email_log').insert({
      email: to,
      tipo,
      subject,
      sent_at: new Date().toISOString(),
    });

    console.log(`✅ Email enviado para ${to}: ${tipo}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar email para ${to}:`, error);
    return false;
  }
}

// ============================================================
// PROCESSAR TRIALS EXPIRANDO
// ============================================================

async function processarTrialsExpirando() {
  const hoje = new Date();
  const em3Dias = new Date(hoje.getTime() + 3 * 24 * 60 * 60 * 1000);
  const em1Dia = new Date(hoje.getTime() + 1 * 24 * 60 * 60 * 1000);
  const ha3Dias = new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000);

  const formatDate = (date) => date.toISOString().split('T')[0];

  // Query: trials que expiram em 3 dias, 1 dia, hoje, ou expiraram há 3 dias
  const { data: vitalisClients } = await supabase
    .from('vitalis_clients')
    .select('*, users(id, nome, email)')
    .eq('subscription_status', 'trial')
    .not('subscription_end', 'is', null);

  const { data: aureaClients } = await supabase
    .from('aurea_clients')
    .select('*, users(id, nome, email)')
    .eq('subscription_status', 'trial')
    .not('subscription_end', 'is', null);

  const todosClients = [
    ...(vitalisClients || []).map((c) => ({ ...c, eco: 'Vitalis' })),
    ...(aureaClients || []).map((c) => ({ ...c, eco: 'Áurea' })),
  ];

  let enviados = { dia3: 0, dia1: 0, expirado: 0, winback: 0 };

  for (const client of todosClients) {
    const { users, subscription_end, eco } = client;
    if (!users || !subscription_end) continue;

    const { nome, email } = users;
    const endDate = new Date(subscription_end);
    const endDateStr = formatDate(endDate);

    // Verificar se já enviámos email hoje para este cliente
    const { data: emailLog } = await supabase
      .from('email_log')
      .select('*')
      .eq('email', email)
      .gte('sent_at', formatDate(hoje))
      .limit(1);

    if (emailLog && emailLog.length > 0) {
      console.log(`⏭️  Email já enviado hoje para ${email}`);
      continue;
    }

    // Determinar que email enviar
    if (endDateStr === formatDate(em3Dias)) {
      // Faltam 3 dias
      const { subject, html } = email3DiasAntes(nome, eco);
      await enviarEmailResend(email, subject, html, 'trial_expiring_3d');
      enviados.dia3++;
    } else if (endDateStr === formatDate(em1Dia)) {
      // Falta 1 dia
      const { subject, html } = email1DiaAntes(nome, eco);
      await enviarEmailResend(email, subject, html, 'trial_expiring_1d');
      enviados.dia1++;
    } else if (endDateStr === formatDate(hoje)) {
      // Expirou hoje
      const { subject, html } = emailTrialExpirado(nome, eco);
      await enviarEmailResend(email, subject, html, 'trial_expired');
      enviados.expirado++;
    } else if (endDateStr === formatDate(ha3Dias)) {
      // Expirou há 3 dias - Win-back
      const { subject, html } = emailWinBack3Dias(nome, eco);
      await enviarEmailResend(email, subject, html, 'trial_winback_3d');
      enviados.winback++;
    }
  }

  return enviados;
}

// ============================================================
// SERVERLESS FUNCTION HANDLER
// ============================================================

export default async function handler(req, res) {
  // Auth centralizada no api/cron.js dispatcher

  if (!RESEND_API_KEY || !supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      error: 'Configuração em falta',
      details: 'RESEND_API_KEY, VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configurados'
    });
  }

  try {
    console.log('🚀 Iniciando processamento de trials expirando...');
    const enviados = await processarTrialsExpirando();

    res.status(200).json({
      success: true,
      message: 'Emails de trial expirando processados',
      enviados,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro ao processar trials expirando:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
