/**
 * API Endpoint: Enviar Email via Resend
 *
 * Tipos de email suportados:
 * - boas-vindas: Quando cliente se regista
 * - pagamento-confirmado: Após pagamento bem-sucedido
 * - inicio-programa: Onboarding do Vitalis
 * - lembrete-checkin: Cliente inativa 2+ dias
 * - conquista: Celebração de streaks/metas
 * - expiracao-aviso: 7 dias antes de expirar
 * - coach-nova-cliente: Notificar Vivianne
 * - coach-alerta: Cliente em dificuldade
 */

export default async function handler(req, res) {
  // CORS - Restrito ao domínio da app
  const allowedOrigins = [
    'https://app.seteecos.com',
    'https://seteecos.com',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY não configurada');
    return res.status(500).json({ error: 'Configuração de email em falta' });
  }

  try {
    const { tipo, destinatario, dados } = req.body;

    if (!tipo || !destinatario) {
      return res.status(400).json({ error: 'Tipo e destinatário são obrigatórios' });
    }

    const template = getEmailTemplate(tipo, dados);

    if (!template) {
      return res.status(400).json({ error: 'Tipo de email não suportado' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Sete Ecos <feedback@seteecos.com>',
        to: destinatario,
        subject: template.assunto,
        html: template.html
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Erro Resend:', result);
      return res.status(response.status).json({ error: result.message || 'Erro ao enviar email' });
    }

    return res.status(200).json({ success: true, id: result.id });

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return res.status(500).json({ error: 'Erro interno ao enviar email' });
  }
}

function getEmailTemplate(tipo, dados = {}) {
  const templates = {
    // ===== EMAILS PARA CLIENTES =====

    'boas-vindas': {
      assunto: '🌿 Bem-vinda ao Vitalis!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #FAF6F0; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #7C8B6F 0%, #6B7A5D 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; letter-spacing: 2px; }
            .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; font-style: italic; }
            .content { padding: 40px 30px; color: #4A4035; }
            .content h2 { color: #7C8B6F; margin-top: 0; }
            .btn { display: inline-block; background: #7C8B6F; color: white; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { background: #F5F2ED; padding: 30px; text-align: center; color: #6B5C4C; font-size: 14px; }
            .footer a { color: #7C8B6F; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VITALIS</h1>
              <p>A raiz da transformação</p>
            </div>
            <div class="content">
              <h2>Bem-vinda, ${dados.nome || 'querida'}! 🌿</h2>
              <p>É uma alegria ter-te connosco no Vitalis.</p>
              <p>Estás prestes a começar uma jornada de transformação que vai muito além da perda de peso. Vamos trabalhar o teu corpo, mente e emoções.</p>
              <p><strong>Próximos passos:</strong></p>
              <ol>
                <li>Completa o questionário inicial</li>
                <li>Recebe o teu plano personalizado</li>
                <li>Começa a registar as tuas refeições</li>
              </ol>
              <p style="text-align: center;">
                <a href="https://app.seteecos.com/vitalis/dashboard" class="btn">Aceder ao Vitalis →</a>
              </p>
              <p>Qualquer dúvida, estou aqui para ti.</p>
              <p>Com carinho,<br><strong>Vivianne Saraiva</strong></p>
            </div>
            <div class="footer">
              <p>Vitalis · Sete Ecos · Maputo, Moçambique</p>
              <p><a href="https://wa.me/258851006473">WhatsApp</a> · <a href="https://app.seteecos.com">Website</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    },

    'pagamento-confirmado': {
      assunto: '✅ Pagamento Confirmado - Vitalis',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #FAF6F0; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #7C8B6F 0%, #6B7A5D 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; color: #4A4035; }
            .success-box { background: #F0FDF4; border: 2px solid #7C8B6F; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
            .success-box .icon { font-size: 48px; }
            .details { background: #F5F2ED; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .details table { width: 100%; }
            .details td { padding: 8px 0; }
            .details td:first-child { color: #6B5C4C; }
            .details td:last-child { text-align: right; font-weight: 600; }
            .btn { display: inline-block; background: #7C8B6F; color: white; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: 600; }
            .footer { background: #F5F2ED; padding: 30px; text-align: center; color: #6B5C4C; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VITALIS</h1>
            </div>
            <div class="content">
              <div class="success-box">
                <div class="icon">✅</div>
                <h2 style="color: #7C8B6F; margin: 10px 0;">Pagamento Confirmado!</h2>
                <p>A tua subscrição está ativa.</p>
              </div>

              <div class="details">
                <table>
                  <tr><td>Plano</td><td>${dados.plano || 'Mensal'}</td></tr>
                  <tr><td>Valor</td><td>${dados.valor || '2.500 MZN'}</td></tr>
                  <tr><td>Data</td><td>${dados.data || new Date().toLocaleDateString('pt-PT')}</td></tr>
                  <tr><td>Válido até</td><td>${dados.validoAte || '-'}</td></tr>
                </table>
              </div>

              <p>Agora tens acesso completo a todas as funcionalidades do Vitalis:</p>
              <ul>
                <li>Dashboard com tracking diário</li>
                <li>Plano alimentar personalizado</li>
                <li>Chat Coach IA</li>
                <li>Espaço de Retorno</li>
                <li>Receitas e muito mais!</li>
              </ul>

              <p style="text-align: center;">
                <a href="https://app.seteecos.com/vitalis/dashboard" class="btn">Começar Agora →</a>
              </p>
            </div>
            <div class="footer">
              <p>Vitalis · Sete Ecos · Maputo, Moçambique</p>
            </div>
          </div>
        </body>
        </html>
      `
    },

    'pagamento-pendente': {
      assunto: '⏳ Pagamento Recebido - Aguarda Confirmação | Vitalis',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #FAF6F0; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #7C8B6F 0%, #6B7A5D 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; color: #4A4035; }
            .pending-box { background: #FEF9E7; border: 2px solid #F59E0B; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
            .details { background: #F5F2ED; border-left: 4px solid #7C8B6F; border-radius: 0 12px 12px 0; padding: 20px; margin: 20px 0; }
            .details p { margin: 8px 0; color: #6B5C4C; }
            .footer { background: #F5F2ED; padding: 30px; text-align: center; color: #6B5C4C; font-size: 14px; }
            .footer a { color: #7C8B6F; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VITALIS</h1>
            </div>
            <div class="content">
              <div class="pending-box">
                <p style="font-size: 48px; margin: 0;">⏳</p>
                <h2 style="color: #92400E; margin: 10px 0;">Pagamento Registado!</h2>
                <p style="color: #92400E;">A Coach Vivianne vai confirmar em ate 24 horas.</p>
              </div>
              <p>Ola <strong>${dados.nome || 'querida'}</strong>,</p>
              <p>Recebemos o registo do teu pagamento! Vais receber outro email assim que for confirmado.</p>
              <div class="details">
                <p><strong>Plano:</strong> ${dados.plano || '-'}</p>
                <p><strong>Valor:</strong> ${dados.valor || '-'}</p>
                <p><strong>Metodo:</strong> ${dados.metodo || 'M-Pesa'}</p>
                <p><strong>Referencia:</strong> ${dados.referencia || '-'}</p>
              </div>
              <p>Qualquer duvida, estamos aqui!</p>
              <p>WhatsApp: <a href="https://wa.me/258851006473" style="color: #7C8B6F;">+258 85 100 6473</a></p>
            </div>
            <div class="footer">
              <p>Vitalis · Sete Ecos · Maputo, Mocambique</p>
            </div>
          </div>
        </body>
        </html>
      `
    },

    'lembrete-checkin': {
      assunto: '💚 Sentimos a tua falta - Vitalis',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #FAF6F0; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #7C8B6F 0%, #6B7A5D 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 40px 30px; color: #4A4035; }
            .btn { display: inline-block; background: #7C8B6F; color: white; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: 600; }
            .footer { background: #F5F2ED; padding: 30px; text-align: center; color: #6B5C4C; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VITALIS</h1>
            </div>
            <div class="content">
              <h2>Olá ${dados.nome || 'querida'} 💚</h2>
              <p>Reparei que não tens feito check-in há ${dados.dias || 'alguns'} dias.</p>
              <p>Está tudo bem? Lembra-te: cada dia é uma nova oportunidade. Não precisas ser perfeita, só precisas de aparecer.</p>
              <p>Se estás a passar por um momento difícil, o <strong>Espaço de Retorno</strong> está lá para ti. Às vezes, precisamos de pausar antes de continuar.</p>
              <p style="text-align: center;">
                <a href="https://app.seteecos.com/vitalis/checkin" class="btn">Fazer Check-in →</a>
              </p>
              <p>Estou aqui se precisares de conversar.</p>
              <p>Com carinho,<br><strong>Vivianne</strong></p>
            </div>
            <div class="footer">
              <p><a href="https://wa.me/258851006473" style="color: #7C8B6F;">Responder no WhatsApp</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    },

    'conquista': {
      assunto: `🎉 Parabéns! ${dados.conquista || 'Nova Conquista'} - Vitalis`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #FAF6F0; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #C9A227 0%, #E8D5A3 100%); padding: 40px 30px; text-align: center; }
            .header .icon { font-size: 64px; }
            .header h1 { color: #4A3728; margin: 10px 0 0; font-size: 24px; }
            .content { padding: 40px 30px; color: #4A4035; text-align: center; }
            .achievement { font-size: 48px; margin: 20px 0; }
            .btn { display: inline-block; background: #7C8B6F; color: white; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: 600; }
            .footer { background: #F5F2ED; padding: 30px; text-align: center; color: #6B5C4C; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">🏆</div>
              <h1>CONQUISTA DESBLOQUEADA!</h1>
            </div>
            <div class="content">
              <div class="achievement">${dados.emoji || '🌟'}</div>
              <h2 style="color: #7C8B6F;">${dados.conquista || 'Nova Conquista'}</h2>
              <p>${dados.mensagem || 'Continua assim! Cada passo conta.'}</p>
              <p><strong>+${dados.xp || 50} XP</strong></p>
              <p style="margin-top: 30px;">
                <a href="https://app.seteecos.com/vitalis/dashboard" class="btn">Ver Progresso →</a>
              </p>
            </div>
            <div class="footer">
              <p>Vitalis · Sete Ecos</p>
            </div>
          </div>
        </body>
        </html>
      `
    },

    'expiracao-aviso': {
      assunto: '⏰ A tua subscrição expira em breve - Vitalis',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #FAF6F0; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #7C8B6F 0%, #6B7A5D 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 40px 30px; color: #4A4035; }
            .warning { background: #FEF3C7; border: 2px solid #F59E0B; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
            .btn { display: inline-block; background: #7C8B6F; color: white; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: 600; }
            .footer { background: #F5F2ED; padding: 30px; text-align: center; color: #6B5C4C; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VITALIS</h1>
            </div>
            <div class="content">
              <div class="warning">
                <p style="font-size: 32px; margin: 0;">⏰</p>
                <p style="margin: 10px 0 0; font-weight: 600;">A tua subscrição expira em ${dados.dias || 7} dias</p>
              </div>

              <p>Olá ${dados.nome || 'querida'},</p>
              <p>Não queremos que percas o acesso às tuas ferramentas de transformação!</p>
              <p>Renova agora e continua a tua jornada sem interrupções.</p>

              <p style="text-align: center;">
                <a href="https://app.seteecos.com/vitalis/pagamento" class="btn">Renovar Subscrição →</a>
              </p>

              <p>Dúvidas? Estou disponível no WhatsApp.</p>
              <p>Vivianne</p>
            </div>
            <div class="footer">
              <p><a href="https://wa.me/258851006473" style="color: #7C8B6F;">Falar no WhatsApp</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    },

    // ===== EMAILS PARA COACH (VIVIANNE) =====

    'coach-nova-cliente': {
      assunto: '🆕 Nova Cliente Registada - Vitalis',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #F5F2ED; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
            h1 { color: #7C8B6F; margin-top: 0; }
            .info { background: #F5F2ED; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info p { margin: 8px 0; }
            .btn { display: inline-block; background: #7C8B6F; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🆕 Nova Cliente!</h1>
            <div class="info">
              <p><strong>Nome:</strong> ${dados.nome || '-'}</p>
              <p><strong>Email:</strong> ${dados.email || '-'}</p>
              <p><strong>Plano:</strong> ${dados.plano || '-'}</p>
              <p><strong>Data:</strong> ${dados.data || new Date().toLocaleDateString('pt-PT')}</p>
            </div>
            <p><a href="https://app.seteecos.com/coach" class="btn">Ver Dashboard →</a></p>
          </div>
        </body>
        </html>
      `
    },

    'coach-alerta': {
      assunto: `⚠️ Alerta: ${dados.tipo || 'Cliente precisa de atenção'} - Vitalis`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #F5F2ED; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
            h1 { color: #DC2626; margin-top: 0; }
            .alert { background: #FEF2F2; border: 2px solid #DC2626; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info { background: #F5F2ED; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .btn { display: inline-block; background: #7C8B6F; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-right: 10px; }
            .btn-whatsapp { background: #25D366; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Alerta de Cliente</h1>
            <div class="alert">
              <p><strong>${dados.tipo || 'Atenção necessária'}</strong></p>
              <p>${dados.descricao || 'Uma cliente pode precisar de apoio.'}</p>
            </div>
            <div class="info">
              <p><strong>Cliente:</strong> ${dados.nome || '-'}</p>
              <p><strong>Email:</strong> ${dados.email || '-'}</p>
              <p><strong>Última atividade:</strong> ${dados.ultimaAtividade || dados.ultimaActividade || '-'}</p>
            </div>
            <p>
              <a href="https://app.seteecos.com/coach" class="btn">Ver Dashboard</a>
              <a href="https://wa.me/${dados.whatsapp || ''}" class="btn btn-whatsapp">WhatsApp</a>
            </p>
          </div>
        </body>
        </html>
      `
    },

    'coach-resumo-diario': {
      assunto: `📊 Resumo Diário - ${new Date().toLocaleDateString('pt-PT')} - Vitalis`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #F5F2ED; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
            h1 { color: #7C8B6F; margin-top: 0; }
            .stats { display: flex; gap: 20px; margin: 20px 0; }
            .stat { flex: 1; background: #F5F2ED; border-radius: 8px; padding: 20px; text-align: center; }
            .stat .number { font-size: 32px; font-weight: bold; color: #7C8B6F; }
            .stat .label { font-size: 14px; color: #6B5C4C; }
            .section { margin: 30px 0; }
            .section h2 { color: #4A4035; font-size: 18px; border-bottom: 2px solid #E8E2D9; padding-bottom: 10px; }
            .btn { display: inline-block; background: #7C8B6F; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📊 Resumo Diário</h1>
            <p>${new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <div class="stats">
              <div class="stat">
                <div class="number">${dados.clientesAtivas || dados.clientesActivas || 0}</div>
                <div class="label">Clientes Ativas</div>
              </div>
              <div class="stat">
                <div class="number">${dados.checkinsHoje || 0}</div>
                <div class="label">Check-ins Hoje</div>
              </div>
              <div class="stat">
                <div class="number">${dados.alertas || 0}</div>
                <div class="label">Alertas</div>
              </div>
            </div>

            ${dados.alertas > 0 ? `
            <div class="section">
              <h2>⚠️ Clientes que Precisam de Atenção</h2>
              <p>${dados.listaAlertas || 'Ver no dashboard'}</p>
            </div>
            ` : ''}

            <p><a href="https://app.seteecos.com/coach" class="btn">Ver Dashboard Completo →</a></p>
          </div>
        </body>
        </html>
      `
    }
  };

  return templates[tipo] || null;
}
