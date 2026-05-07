// Cloudflare Pages Function: /api/resumo-email
// Gera resumo diário via Claude e envia por email via Resend.
// Pode ser chamado manualmente (botão em /definicoes) ou por cron externo.

interface Env {
  ANTHROPIC_API_KEY: string
  RESEND_API_KEY: string
  RESUMO_FROM_EMAIL?: string
}

const SYSTEM = `És a coach pessoal da Vivianne. Vais receber dados resumidos do dia/semana dela
e tens de redigir um email curto, em pt-PT informal, para ela ler à noite.

Estrutura:
- 2-3 frases sobre o dia (o que ela registou, padrões, vitórias)
- 1 observação concreta sobre algo que viste
- 1 pergunta ou sugestão de ajuste para amanhã

Tom: espelho calmo, sem floreios, sem emojis, sem exclamações múltiplas, sem "tu consegues!".
Tutear sempre. Frases curtas. Densas.

Devolve em texto simples, sem markdown, sem assinatura.`

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.ANTHROPIC_API_KEY
  const resendKey = context.env.RESEND_API_KEY
  const from = context.env.RESUMO_FROM_EMAIL ?? 'fenixfit@resend.dev'
  if (!apiKey) return Response.json({ error: 'sem ANTHROPIC_API_KEY' }, { status: 500 })
  if (!resendKey) return Response.json({ error: 'sem RESEND_API_KEY · não posso enviar email' }, { status: 500 })

  let body: { email: string; nome?: string; contexto: string }
  try {
    body = await context.request.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }
  if (!body.email) return Response.json({ error: 'email em falta' }, { status: 400 })

  // 1. Pedir resumo ao Claude
  let resumoTexto = ''
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: `dados:\n\n${body.contexto}\n\nescreve o email para esta noite.` }]
      })
    })
    if (!r.ok) {
      const e = await r.text()
      return Response.json({ error: `claude: ${e.slice(0, 200)}` }, { status: 500 })
    }
    const j = (await r.json()) as { content: Array<{ type: string; text?: string }> }
    resumoTexto = j.content.filter(b => b.type === 'text').map(b => b.text ?? '').join('\n').trim()
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'erro claude' }, { status: 500 })
  }

  if (!resumoTexto) return Response.json({ error: 'resumo vazio' }, { status: 500 })

  // 2. Enviar por Resend
  const nome = body.nome || ''
  const html = `<!DOCTYPE html>
<html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Resumo diário</title>
</head>
<body style="margin:0;padding:0;font-family:Georgia,serif;background:#F6F1E8;color:#1F1814">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(31,24,20,0.55)">FénixFit · resumo</p>
    <h1 style="font-family:Georgia,serif;font-weight:300;font-size:28px;letter-spacing:-0.01em;margin:8px 0 16px;line-height:1.15">
      ${nome ? `${nome},` : 'olá,'}
    </h1>
    <div style="height:1px;width:36px;background:#B8924A;margin-bottom:24px"></div>
    <div style="font-size:15.5px;line-height:1.65;white-space:pre-wrap">${resumoTexto.replace(/</g, '&lt;')}</div>
    <p style="margin:32px 0 0;font-size:11px;color:rgba(31,24,20,0.5);font-style:italic">— a coach</p>
    <p style="margin:24px 0 0;font-size:10px;color:rgba(31,24,20,0.45);text-align:center">
      <a href="https://sete-ecos-pwa.pages.dev/" style="color:rgba(31,24,20,0.55);text-decoration:none">abrir app →</a>
    </p>
  </div>
</body></html>`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${resendKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        from: `FénixFit <${from}>`,
        to: [body.email],
        subject: 'resumo · ' + new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'short' }),
        html,
        text: resumoTexto
      })
    })
    if (!r.ok) {
      const e = await r.text()
      return Response.json({ error: `resend: ${e.slice(0, 200)}` }, { status: 500 })
    }
    return Response.json({ ok: true, resumo: resumoTexto })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'erro resend' }, { status: 500 })
  }
}
