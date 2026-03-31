/**
 * API Endpoint: Recuperar Password via Resend
 *
 * Gera link de recuperação via Supabase Admin e envia email
 * personalizado pelo Resend (mesmo remetente dos outros emails).
 */
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // CORS
  const allowedOrigins = [
    'https://app.seteecos.com',
    'https://seteecos.com',
    'http://localhost:3000'
  ]
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Variáveis de ambiente em falta para recuperar-password')
    return res.status(500).json({ error: 'Configuração em falta' })
  }

  try {
    const { email, redirectTo } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    // Supabase Admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Gerar link de recuperação via Admin API
    // IMPORTANTE: redirectTo SEM query params — o wildcard ** do Supabase
    // só corresponde ao path, não a query strings. Com ?type=recovery,
    // o Supabase não faz match e redireciona para o Site URL (home).
    // A detecção do modo recovery é feita pelo hash fragment (#type=recovery)
    // que o Supabase adiciona automaticamente.
    const cleanRedirect = (redirectTo || 'https://app.seteecos.com/recuperar-password')
      .split('?')[0] // Remover qualquer query param

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim(),
      options: {
        redirectTo: cleanRedirect
      }
    })

    if (error) {
      // Não revelar se o email existe ou não (segurança)
      console.error('Erro ao gerar link:', error.message)
      return res.status(200).json({ success: true })
    }

    const recoveryLink = data?.properties?.action_link
    if (!recoveryLink) {
      console.error('Link de recuperação não gerado')
      return res.status(200).json({ success: true })
    }

    // Enviar email bonito pelo Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Sete Ecos <feedback@seteecos.com>',
        to: email.trim(),
        subject: 'Redefinir a tua password — Sete Ecos',
        html: getRecoveryEmailTemplate(recoveryLink)
      })
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      console.error('Erro Resend:', emailResult)
      return res.status(500).json({ error: 'Erro ao enviar email' })
    }

    return res.status(200).json({ success: true })

  } catch (error) {
    console.error('Erro em recuperar-password:', error)
    return res.status(500).json({ error: 'Erro interno' })
  }
}

function getRecoveryEmailTemplate(link) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #FAF6F0; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #4B0082 0%, #6B21A8 50%, #C9A227 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; letter-spacing: 3px; }
        .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-style: italic; font-size: 14px; }
        .content { padding: 40px 30px; color: #4A4035; line-height: 1.6; }
        .content h2 { color: #4B0082; margin-top: 0; font-size: 22px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #C9A227 0%, #B8911E 100%); color: white; padding: 16px 40px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0; }
        .note { background: #F5F2ED; border-radius: 12px; padding: 16px 20px; margin: 24px 0; font-size: 13px; color: #6B5C4C; }
        .footer { background: #F5F2ED; padding: 30px; text-align: center; color: #6B5C4C; font-size: 13px; }
        .footer a { color: #4B0082; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SETE ECOS</h1>
          <p>Uma PWA. Sete caminhos.</p>
        </div>
        <div class="content">
          <h2>Redefinir password</h2>
          <p>Olá!</p>
          <p>Recebemos um pedido para redefinir a tua password. Clica no botão abaixo para escolher uma nova:</p>
          <p style="text-align: center;">
            <a href="${link}" class="btn">Redefinir Password</a>
          </p>
          <div class="note">
            <p style="margin: 0;">Se não pediste esta alteração, podes ignorar este email. A tua password actual não será alterada.</p>
            <p style="margin: 8px 0 0;">Este link expira em 1 hora.</p>
          </div>
          <p>Qualquer dúvida, estamos aqui.</p>
          <p>— Vivianne</p>
        </div>
        <div class="footer">
          <p>Sete Ecos · Maputo, Moçambique</p>
          <p><a href="https://wa.me/258851006473">WhatsApp</a> · <a href="https://app.seteecos.com">app.seteecos.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}
