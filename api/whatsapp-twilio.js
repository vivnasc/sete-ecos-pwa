/**
 * API Endpoint: WhatsApp via Meta Cloud API (consolidado)
 *
 * Ações:
 * - POST { mensagem, para? }           → Enviar mensagem WhatsApp
 * - POST { action: "perfil" }           → Configurar perfil Business
 * - GET  ?action=perfil&key=CRON_SECRET → Configurar perfil (browser)
 * - GET  ?action=templates              → Listar templates definidos (dry-run)
 * - GET  ?action=templates-criar        → Criar TODOS os templates na Meta
 * - GET  ?action=templates-criar&nome=boas_vindas → Criar 1 template
 * - GET  ?action=templates-status       → Ver estado dos templates na Meta
 * - GET  ?action=templates-apagar&nome=boas_vindas → Apagar 1 template
 *
 * Configuração no Vercel:
 * - WHATSAPP_ACCESS_TOKEN: Token de acesso Meta Business
 * - WHATSAPP_PHONE_NUMBER_ID: ID do número WhatsApp Business
 * - WHATSAPP_BUSINESS_ACCOUNT_ID: WABA ID (para templates)
 * - VIVIANNE_PERSONAL_NUMBER: Número pessoal da coach (ex: 258851006473)
 */

import { META_TEMPLATES } from './_lib/whatsapp-broadcast.js';

const GRAPH_API = 'https://graph.facebook.com/v22.0';

export default async function handler(req, res) {
  // CORS
  const allowedOrigins = [
    'https://app.seteecos.com',
    'https://seteecos.com',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return res.status(500).json({ error: 'Meta WhatsApp API não configurada. Adiciona WHATSAPP_ACCESS_TOKEN e WHATSAPP_PHONE_NUMBER_ID no Vercel.' });
  }

  // Determinar ação: query param (GET) ou body (POST)
  const action = req.query?.action || req.body?.action;

  if (action === 'perfil') {
    return handlePerfil(req, res, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID);
  }

  // Diagnóstico — descobre WABA ID automaticamente
  if (action === 'diagnostico') {
    return handleDiagnostico(req, res, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID);
  }

  // Teste rápido — envia template boas_vindas para o número da Vivianne
  if (action === 'teste') {
    return handleTeste(req, res, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID);
  }

  // Templates management
  if (action && action.startsWith('templates')) {
    return handleTemplates(req, res, action, WHATSAPP_ACCESS_TOKEN);
  }

  // Ação default: enviar mensagem
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  return handleEnviarMensagem(req, res, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID);
}

// ═══════════════════════════════════════════
// Enviar mensagem WhatsApp
// ═══════════════════════════════════════════
async function handleEnviarMensagem(req, res, token, phoneId) {
  const personalNumber = (process.env.VIVIANNE_PERSONAL_NUMBER || '').trim();
  const COACH_NUMBER = personalNumber
    ? personalNumber.replace(/[^0-9]/g, '')
    : '258851006473';

  try {
    const { mensagem, para } = req.body;

    if (!mensagem) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    const destinatario = para
      ? para.replace(/[^0-9]/g, '')
      : COACH_NUMBER;

    const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: destinatario,
        type: 'text',
        text: { body: mensagem },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Erro Meta API:', result?.error?.message || JSON.stringify(result));
      return res.status(response.status).json({
        error: result?.error?.message || 'Erro ao enviar WhatsApp',
        code: result?.error?.code
      });
    }

    const msgId = result.messages?.[0]?.id;
    console.log('WhatsApp enviado via Meta:', msgId);
    return res.status(200).json({ success: true, messageId: msgId });

  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return res.status(500).json({ error: 'Erro interno ao enviar WhatsApp' });
  }
}

// ═══════════════════════════════════════════
// Teste rápido — envia template para confirmar que funciona
// ═══════════════════════════════════════════
async function handleTeste(req, res, token, phoneId) {
  const personalNumber = (process.env.VIVIANNE_PERSONAL_NUMBER || '').trim();
  const destino = req.query?.para
    ? req.query.para.replace(/[^0-9]/g, '')
    : personalNumber
      ? personalNumber.replace(/[^0-9]/g, '')
      : '258851006473';

  const template = req.query?.template || 'boas_vindas';
  const tmpl = META_TEMPLATES[template];
  if (!tmpl) {
    return res.status(400).json({
      error: `Template "${template}" não existe`,
      disponiveis: Object.keys(META_TEMPLATES),
    });
  }

  const nome = req.query?.nome || 'Vivianne';

  // Montar payload do template
  const components = [];
  const params = tmpl.params ? tmpl.params(nome) : [nome];
  if (params.length > 0) {
    components.push({
      type: 'body',
      parameters: params.map(p => ({ type: 'text', text: p })),
    });
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: destino,
    type: 'template',
    template: {
      name: tmpl.name,
      language: { code: tmpl.language || 'pt_BR' },
      components,
    },
  };

  try {
    const response = await fetch(`${GRAPH_API}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: result?.error?.message || 'Erro ao enviar',
        code: result?.error?.code,
        destino,
        template: tmpl.name,
        payload_enviado: payload,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Template "${tmpl.name}" enviado para +${destino}`,
      messageId: result.messages?.[0]?.id,
      destino,
      template: tmpl.name,
      nome_usado: nome,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// ═══════════════════════════════════════════
// Configurar perfil WhatsApp Business
// ═══════════════════════════════════════════
async function handlePerfil(req, res, token, phoneId) {
  // Auth simples para proteger este endpoint
  const CRON_SECRET = process.env.CRON_SECRET;
  const apiKey = req.headers['x-api-key'] || req.query?.key;
  if (CRON_SECRET && apiKey !== CRON_SECRET) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const resultados = { perfil: null, foto: null, erros: [] };

  // ── 1. Atualizar informações do perfil ──
  try {
    const profileUrl = `https://graph.facebook.com/v22.0/${phoneId}/whatsapp_business_profile`;

    const profileData = {
      messaging_product: 'whatsapp',
      about: 'Terapia holística e coaching nutricional 🌱✨',
      description: 'SETE ECOS — Sistema de Transmutação Feminina\n\n🌿 VITALIS — Nutrição inteligente e personalizada\n💛 ÁUREA — Presença, valor próprio e merecimento\n🔮 LUMINA — Diagnóstico energético e autoconhecimento\n👥 COMUNIDADE — Rede de apoio entre mulheres\n\n7 módulos que integram corpo, emoção, energia, expressão e identidade. Planos alimentares adaptados, acompanhamento por WhatsApp e uma comunidade que te acolhe.\n\n👩‍💼 Vivianne Saraiva — Terapeuta Holística & Coach Nutricional\n📞 +258 845 243 875\n📍 Maputo, Moçambique',
      email: 'feedback@seteecos.com',
      websites: ['https://app.seteecos.com', 'https://seteecos.com'],
      address: 'Maputo, Moçambique',
      vertical: 'PROF_SERVICES',
    };

    const profileRes = await fetch(profileUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const profileResult = await profileRes.json();

    if (!profileRes.ok) {
      resultados.erros.push('Perfil: ' + (profileResult?.error?.message || JSON.stringify(profileResult)));
    } else {
      resultados.perfil = 'Atualizado com sucesso';
    }
  } catch (err) {
    resultados.erros.push('Perfil erro: ' + err.message);
  }

  // ── 2. Fazer upload da foto de perfil ──
  try {
    const logoUrl = 'https://app.seteecos.com/logos/seteecos_logo_v2.png';
    const logoRes = await fetch(logoUrl);

    if (!logoRes.ok) {
      resultados.erros.push('Foto: não conseguiu baixar logo de ' + logoUrl);
    } else {
      const logoBuffer = await logoRes.arrayBuffer();
      const logoBytes = new Uint8Array(logoBuffer);

      // Step 1: Criar sessão de upload
      const uploadSessionUrl = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_WABA_ID || 'app'}/uploads`;
      const sessionRes = await fetch(uploadSessionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_length: logoBytes.length,
          file_type: 'image/png',
          file_name: 'seteecos_logo.png',
        }),
      });

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        const uploadSessionId = sessionData.id;

        // Step 2: Upload do ficheiro
        const uploadUrl = `https://graph.facebook.com/v22.0/${uploadSessionId}`;
        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `OAuth ${token}`,
            'file_offset': '0',
            'Content-Type': 'application/octet-stream',
          },
          body: logoBytes,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          const mediaHandle = uploadData.h;

          // Step 3: Definir como foto de perfil
          const photoUrl = `https://graph.facebook.com/v22.0/${phoneId}/whatsapp_business_profile`;
          const photoRes = await fetch(photoUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              profile_picture_handle: mediaHandle,
            }),
          });

          const photoResult = await photoRes.json();
          if (!photoRes.ok) {
            resultados.erros.push('Foto perfil: ' + (photoResult?.error?.message || JSON.stringify(photoResult)));
          } else {
            resultados.foto = 'Foto de perfil atualizada';
          }
        } else {
          const uploadErr = await uploadRes.json();
          resultados.erros.push('Upload foto: ' + (uploadErr?.error?.message || JSON.stringify(uploadErr)));
        }
      } else {
        const sessErr = await sessionRes.json();
        resultados.erros.push('Sessão upload: ' + (sessErr?.error?.message || JSON.stringify(sessErr)));
      }
    }
  } catch (err) {
    resultados.erros.push('Foto erro: ' + err.message);
  }

  const sucesso = resultados.erros.length === 0;
  console.log('WhatsApp perfil:', JSON.stringify(resultados));

  return res.status(sucesso ? 200 : 207).json({
    success: sucesso,
    ...resultados,
  });
}

// ═══════════════════════════════════════════
// Message Templates — criar/listar/apagar
// ═══════════════════════════════════════════

function converterParaMeta(key, tmpl) {
  const components = [];

  if (tmpl.header) {
    components.push({ type: 'HEADER', format: 'TEXT', text: tmpl.header });
  }

  const bodyParams = tmpl.body.match(/\{\{\d+\}\}/g) || [];
  const bodyComponent = { type: 'BODY', text: tmpl.body };

  if (bodyParams.length > 0) {
    const exemplos = { '{{1}}': 'Maria', '{{2}}': '7', '{{3}}': '1.5L' };
    bodyComponent.example = {
      body_text: [bodyParams.map(p => exemplos[p] || 'exemplo')],
    };
  }
  components.push(bodyComponent);

  if (tmpl.footer) {
    components.push({ type: 'FOOTER', text: tmpl.footer });
  }

  if (tmpl.buttons && tmpl.buttons.length > 0) {
    components.push({
      type: 'BUTTONS',
      buttons: tmpl.buttons.map(btn => btn.type === 'URL'
        ? { type: 'URL', text: btn.text, url: btn.url }
        : btn),
    });
  }

  return { name: tmpl.name, language: tmpl.language, category: tmpl.category, components };
}

async function criarTemplateMeta(token, wabaId, metaPayload) {
  const response = await fetch(`${GRAPH_API}/${wabaId}/message_templates`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(metaPayload),
  });
  const data = await response.json();
  if (!response.ok) {
    return { ok: false, name: metaPayload.name, error: data.error?.message || JSON.stringify(data), code: data.error?.code };
  }
  return { ok: true, name: metaPayload.name, id: data.id, status: data.status };
}

async function listarTemplatesMeta(token, wabaId) {
  const response = await fetch(`${GRAPH_API}/${wabaId}/message_templates?limit=100`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json();
    return { ok: false, error: data.error?.message || `HTTP ${response.status}` };
  }
  const data = await response.json();
  return { ok: true, templates: data.data || [] };
}

// ═══════════════════════════════════════════
// HTML renderer para diagnóstico (legível no browser)
// ═══════════════════════════════════════════
function renderDiagnosticoHtml(resultado) {
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const badge = (text, color) => `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:bold;color:white;background:${color}">${esc(text)}</span>`;
  const ok = (t) => badge(t, '#22c55e');
  const fail = (t) => badge(t, '#ef4444');
  const warn = (t) => badge(t, '#f59e0b');
  const info = (t) => badge(t, '#3b82f6');

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WhatsApp Diagnóstico — Sete Ecos</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0f172a;color:#e2e8f0;padding:16px;max-width:800px;margin:0 auto}
h1{color:#a78bfa;margin-bottom:8px;font-size:20px}h2{color:#818cf8;margin:16px 0 8px;font-size:16px;border-bottom:1px solid #334155;padding-bottom:4px}
.card{background:#1e293b;border-radius:8px;padding:12px;margin:8px 0;border-left:4px solid #334155}
.card.ok{border-left-color:#22c55e}.card.fail{border-left-color:#ef4444}.card.warn{border-left-color:#f59e0b}.card.info{border-left-color:#3b82f6}
.label{color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px}.value{color:#f1f5f9;font-size:14px;word-break:break-all}
pre{background:#0f172a;padding:8px;border-radius:4px;font-size:12px;overflow-x:auto;margin:4px 0;color:#cbd5e1}
.action{background:#7c3aed;color:white;padding:12px 16px;border-radius:8px;margin:12px 0;font-size:14px}
.action strong{display:block;margin-bottom:4px}ol{padding-left:20px}ol li{margin:4px 0}
</style></head><body>`;

  // Header
  const found = resultado.waba_encontrado;
  html += `<h1>WhatsApp Diagnóstico</h1>`;
  html += found
    ? `<div class="card ok"><strong>WABA Encontrado: ${esc(found.id)}</strong>${found.corrigir ? `<br>${esc(found.corrigir)}` : ''}</div>`
    : `<div class="card fail"><strong>WABA ID NÃO encontrado</strong> — vê as instruções abaixo</div>`;

  // Env vars
  html += `<h2>Variáveis de ambiente</h2>`;
  for (const [key, val] of Object.entries(resultado.env_vars)) {
    const isOk = val && !val.startsWith('(');
    html += `<div class="card ${isOk ? 'ok' : 'warn'}"><span class="label">${esc(key)}</span><br><span class="value">${esc(val)}</span></div>`;
  }

  // Token info
  if (resultado.token_info) {
    html += `<h2>Token</h2>`;
    const t = resultado.token_info;
    html += `<div class="card ${t.is_valid ? 'ok' : 'fail'}">`;
    html += `<span class="label">Tipo</span> ${esc(t.type)} &nbsp; ${t.is_valid ? ok('VÁLIDO') : fail('INVÁLIDO')}`;
    html += `<br><span class="label">App ID</span> ${esc(t.app_id)}`;
    html += `<br><span class="label">Expira</span> ${esc(t.expires_at)}`;
    if (t.scopes) html += `<br><span class="label">Scopes</span> <span style="font-size:11px">${esc(t.scopes.join(', '))}</span>`;
    html += `</div>`;
  }

  // Phone info
  if (resultado.phone_info) {
    html += `<h2>Telefone</h2>`;
    const p = resultado.phone_info;
    if (p.erro) {
      html += `<div class="card fail">${fail('ERRO')} ${esc(p.erro)}</div>`;
    } else {
      html += `<div class="card ok">`;
      html += `<span class="value" style="font-size:18px">${esc(p.display_phone_number)}</span>`;
      html += ` — ${esc(p.verified_name)}`;
      if (p.account_mode) html += ` ${p.account_mode === 'LIVE' ? ok('LIVE') : warn(p.account_mode)}`;
      if (p.quality_rating) html += ` ${p.quality_rating === 'GREEN' ? ok(p.quality_rating) : warn(p.quality_rating)}`;
      html += `</div>`;
    }
  }

  // Tests
  html += `<h2>Testes (${resultado.testes.length})</h2>`;
  for (const t of resultado.testes) {
    const isOk = t.resultado === 'FUNCIONA' || t.resultado === 'OK' || t.resultado === 'ENCONTROU';
    const isFail = t.resultado === 'FALHOU' || t.resultado === 'ERRO' || t.resultado?.includes('NÃO EXISTE');
    const isWarn = t.resultado?.includes('SEM') || t.resultado?.includes('0 negócio');
    const cls = isOk ? 'ok' : isFail ? 'fail' : isWarn ? 'warn' : 'info';
    html += `<div class="card ${cls}">`;
    html += `<strong>${esc(t.teste)}</strong> ${isOk ? ok(t.resultado) : isFail ? fail(t.resultado) : isWarn ? warn(t.resultado) : info(t.resultado)}`;
    if (t.erro) html += `<br><span style="color:#fca5a5;font-size:12px">${esc(t.erro)}</span>`;
    if (t.nota) html += `<br><span style="color:#fcd34d;font-size:12px">${esc(t.nota)}</span>`;
    if (t.dados) html += `<pre>${esc(JSON.stringify(t.dados, null, 2))}</pre>`;
    if (t.wabas) html += `<pre>${esc(JSON.stringify(t.wabas, null, 2))}</pre>`;
    if (t.negocios) html += `<pre>${esc(JSON.stringify(t.negocios, null, 2))}</pre>`;
    if (t.scopes_encontrados) html += `<pre>${esc(t.scopes_encontrados.join(', '))}</pre>`;
    html += `</div>`;
  }

  // Manual instructions
  if (resultado.instrucoes_manuais) {
    html += `<h2>Como resolver</h2>`;
    const m = resultado.instrucoes_manuais;
    html += `<div class="action"><strong>${esc(m.problema)}</strong><ol>`;
    for (const step of m.como_resolver) {
      html += `<li>${esc(step.replace(/^\d+\.\s*/, ''))}</li>`;
    }
    html += `</ol></div>`;
    if (m.alternativa) html += `<div class="card info">${esc(m.alternativa)}</div>`;
  }

  html += `<p style="margin-top:24px;color:#475569;font-size:11px">Gerado em ${new Date().toISOString()}</p>`;
  html += `</body></html>`;
  return html;
}

// ═══════════════════════════════════════════
// Diagnóstico — descobre WABA ID e mostra tudo
// ═══════════════════════════════════════════
async function handleDiagnostico(req, res, token, phoneId) {
  const envWabaId = (process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '').trim();
  const envBusinessId = (process.env.META_BUSINESS_ID || '').trim();

  const resultado = {
    env_vars: {
      WHATSAPP_PHONE_NUMBER_ID: phoneId,
      WHATSAPP_BUSINESS_ACCOUNT_ID: envWabaId || '(não definido)',
      META_BUSINESS_ID: envBusinessId || '(não definido)',
    },
    token_info: null,
    phone_info: null,
    testes: [],
    waba_encontrado: null,
  };

  // 1. debug_token — ver app, scopes, target_ids
  try {
    const debugRes = await fetch(`${GRAPH_API}/debug_token?input_token=${token}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (debugRes.ok) {
      const debugData = await debugRes.json();
      const d = debugData.data || {};
      resultado.token_info = {
        app_id: d.app_id,
        type: d.type,
        is_valid: d.is_valid,
        scopes: d.scopes,
        granular_scopes: d.granular_scopes,
        expires_at: d.expires_at ? new Date(d.expires_at * 1000).toISOString() : 'nunca',
      };
    }
  } catch (e) {
    resultado.token_info = { erro: e.message };
  }

  // 2. Phone number info
  try {
    const phoneRes = await fetch(`${GRAPH_API}/${phoneId}?fields=id,display_phone_number,verified_name,quality_rating,name_status`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (phoneRes.ok) {
      resultado.phone_info = await phoneRes.json();
    } else {
      const err = await phoneRes.json().catch(() => ({}));
      resultado.phone_info = { erro: err?.error?.message || `HTTP ${phoneRes.status}` };
    }
  } catch (e) {
    resultado.phone_info = { erro: e.message };
  }

  // 3. Testar env var WHATSAPP_BUSINESS_ACCOUNT_ID como WABA ID
  if (envWabaId) {
    try {
      const testRes = await fetch(`${GRAPH_API}/${envWabaId}/message_templates?limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (testRes.ok) {
        const data = await testRes.json();
        resultado.testes.push({
          teste: `Env var ${envWabaId} como WABA ID → templates`,
          resultado: 'FUNCIONA',
          templates_existentes: (data.data || []).length,
        });
        resultado.waba_encontrado = { id: envWabaId, metodo: 'env var WHATSAPP_BUSINESS_ACCOUNT_ID' };
      } else {
        const errData = await testRes.json().catch(() => ({}));
        resultado.testes.push({
          teste: `Env var ${envWabaId} como WABA ID → templates`,
          resultado: 'FALHOU',
          http: testRes.status,
          erro: errData?.error?.message || 'Erro desconhecido',
          codigo_erro: errData?.error?.code,
        });
      }
    } catch (e) {
      resultado.testes.push({ teste: `Env var ${envWabaId} como WABA ID`, resultado: 'ERRO', erro: e.message });
    }
  }

  // 4. Testar env var como Business ID → owned WABAs
  if (envWabaId && !resultado.waba_encontrado) {
    try {
      const bizRes = await fetch(`${GRAPH_API}/${envWabaId}/owned_whatsapp_business_accounts`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (bizRes.ok) {
        const bizData = await bizRes.json();
        const wabas = bizData.data || [];
        resultado.testes.push({
          teste: `Env var ${envWabaId} como Business ID → owned WABAs`,
          resultado: wabas.length > 0 ? 'ENCONTROU WABAs' : 'SEM WABAs',
          wabas: wabas.map(w => ({ id: w.id, nome: w.name })),
        });
        if (wabas.length > 0) {
          resultado.waba_encontrado = {
            id: wabas[0].id,
            metodo: `${envWabaId} é Business ID → WABA real é ${wabas[0].id}`,
            corrigir: `Mete WHATSAPP_BUSINESS_ACCOUNT_ID=${wabas[0].id} no Vercel`,
          };
        }
      } else {
        const errData = await bizRes.json().catch(() => ({}));
        resultado.testes.push({
          teste: `Env var ${envWabaId} como Business ID → owned WABAs`,
          resultado: 'FALHOU',
          http: bizRes.status,
          erro: errData?.error?.message || 'Erro desconhecido',
        });
      }
    } catch (e) {
      resultado.testes.push({ teste: `Env var ${envWabaId} como Business ID`, resultado: 'ERRO', erro: e.message });
    }
  }

  // 5. Identificar o que é o ID errado (que tipo de objecto é?)
  if (envWabaId && !resultado.waba_encontrado) {
    try {
      const idRes = await fetch(`${GRAPH_API}/${envWabaId}?fields=id,name`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (idRes.ok) {
        const idData = await idRes.json();
        resultado.testes.push({
          teste: `Identificar o que é o ID ${envWabaId}`,
          resultado: 'OBJECTO ENCONTRADO',
          dados: idData,
          nota: 'Este ID existe mas NÃO é um WABA. Pode ser Page ID, Ad Account, etc.',
        });
      } else {
        const errData = await idRes.json().catch(() => ({}));
        resultado.testes.push({
          teste: `Identificar o que é o ID ${envWabaId}`,
          resultado: 'NÃO EXISTE ou SEM PERMISSÃO',
          erro: errData?.error?.message,
        });
      }
    } catch (_) {}
  }

  // 6. Buscar info do system user: /me com business
  if (!resultado.waba_encontrado) {
    try {
      const meRes = await fetch(`${GRAPH_API}/me?fields=id,name,business`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        resultado.testes.push({
          teste: '/me — info do system user',
          resultado: 'OK',
          dados: meData,
        });

        // Se tem business, buscar WABAs desse business
        const bizId = meData.business?.id;
        if (!bizId) {
          resultado.testes.push({
            teste: '/me — business associado',
            resultado: 'SEM BUSINESS',
            nota: 'O system user não tem business associado. Precisa ser atribuído ao Business Manager.',
          });
        }
        if (bizId) {
          try {
            const wabaRes = await fetch(`${GRAPH_API}/${bizId}/owned_whatsapp_business_accounts?fields=id,name,currency,message_template_namespace`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (wabaRes.ok) {
              const wabaData = await wabaRes.json();
              const wabas = wabaData.data || [];
              resultado.testes.push({
                teste: `Business "${meData.business.name || bizId}" → owned WABAs`,
                resultado: wabas.length > 0 ? 'ENCONTROU' : 'SEM WABAs',
                wabas: wabas.map(w => ({ id: w.id, nome: w.name, namespace: w.message_template_namespace })),
              });
              if (wabas.length > 0) {
                // Testar cada WABA
                for (const w of wabas) {
                  try {
                    const checkRes = await fetch(`${GRAPH_API}/${w.id}/message_templates?limit=1`, {
                      headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (checkRes.ok) {
                      resultado.waba_encontrado = {
                        id: w.id,
                        nome: w.name,
                        metodo: `Descoberto via Business Manager "${meData.business.name}"`,
                        corrigir: `Mete WHATSAPP_BUSINESS_ACCOUNT_ID=${w.id} no Vercel`,
                      };
                      resultado.testes.push({
                        teste: `WABA ${w.id} (${w.name}) → templates`,
                        resultado: 'FUNCIONA',
                      });
                      break;
                    }
                  } catch (_) {}
                }
              }
            } else {
              const errData = await wabaRes.json().catch(() => ({}));
              resultado.testes.push({
                teste: `Business ${bizId} → owned WABAs`,
                resultado: 'FALHOU',
                erro: errData?.error?.message,
              });
            }
          } catch (_) {}
        }
      } else {
        const errData = await meRes.json().catch(() => ({}));
        resultado.testes.push({
          teste: '/me — info do system user',
          resultado: 'FALHOU',
          http: meRes.status,
          erro: errData?.error?.message || `HTTP ${meRes.status}`,
          nota: 'O token pode não ter permissão para /me. Verifica as permissões do system user.',
        });
      }
    } catch (e) {
      resultado.testes.push({ teste: '/me', resultado: 'ERRO', erro: e.message });
    }
  }

  // 7. Tentar via App ID → buscar WABAs associados à app
  if (!resultado.waba_encontrado && resultado.token_info?.app_id) {
    const appId = resultado.token_info.app_id;
    try {
      const appRes = await fetch(`${GRAPH_API}/${appId}?fields=id,name`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (appRes.ok) {
        const appData = await appRes.json();
        resultado.testes.push({
          teste: `App ${appId} info`,
          resultado: 'OK',
          dados: appData,
        });
      }
    } catch (_) {}
  }

  // 8. Tentar /me/businesses
  if (!resultado.waba_encontrado) {
    try {
      const meRes = await fetch(`${GRAPH_API}/me/businesses`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        const businesses = meData.data || [];
        resultado.testes.push({
          teste: '/me/businesses — listar negócios',
          resultado: `${businesses.length} negócio(s) encontrado(s)`,
          negocios: businesses.map(b => ({ id: b.id, nome: b.name })),
        });
        for (const biz of businesses) {
          try {
            const wabaRes = await fetch(`${GRAPH_API}/${biz.id}/owned_whatsapp_business_accounts`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (wabaRes.ok) {
              const wabaData = await wabaRes.json();
              const wabas = wabaData.data || [];
              if (wabas.length > 0) {
                resultado.testes.push({
                  teste: `Negócio "${biz.name}" (${biz.id}) → owned WABAs`,
                  resultado: 'ENCONTROU',
                  wabas: wabas.map(w => ({ id: w.id, nome: w.name })),
                });
                resultado.waba_encontrado = {
                  id: wabas[0].id,
                  metodo: `Descoberto via negócio "${biz.name}"`,
                  corrigir: `Mete WHATSAPP_BUSINESS_ACCOUNT_ID=${wabas[0].id} no Vercel`,
                };
                break;
              }
            }
          } catch (_) {}
        }
      } else {
        const errData = await meRes.json().catch(() => ({}));
        resultado.testes.push({
          teste: '/me/businesses',
          resultado: 'FALHOU',
          erro: errData?.error?.message || `HTTP ${meRes.status}`,
        });
      }
    } catch (e) {
      resultado.testes.push({ teste: '/me/businesses', resultado: 'ERRO', erro: e.message });
    }
  }

  // 9. Tentar granular_scopes target_ids como WABA IDs
  if (!resultado.waba_encontrado && resultado.token_info?.granular_scopes) {
    const waScopes = resultado.token_info.granular_scopes.filter(
      s => s.scope === 'whatsapp_business_management' || s.scope === 'whatsapp_business_messaging'
    );
    if (waScopes.length > 0) {
      for (const scope of waScopes) {
        if (scope.target_ids && scope.target_ids.length > 0) {
          for (const targetId of scope.target_ids) {
            try {
              const checkRes = await fetch(`${GRAPH_API}/${targetId}/message_templates?limit=1`, {
                headers: { 'Authorization': `Bearer ${token}` },
              });
              if (checkRes.ok) {
                resultado.testes.push({ teste: `scope ${scope.scope} target ${targetId} → templates`, resultado: 'FUNCIONA' });
                resultado.waba_encontrado = {
                  id: targetId,
                  metodo: `Descoberto via granular_scopes (${scope.scope})`,
                  corrigir: `Mete WHATSAPP_BUSINESS_ACCOUNT_ID=${targetId} no Vercel`,
                };
                break;
              }
            } catch (_) {}
          }
          if (resultado.waba_encontrado) break;
        } else {
          resultado.testes.push({
            teste: `granular_scopes: ${scope.scope}`,
            resultado: 'SEM TARGET_IDS',
            nota: 'O scope WhatsApp não tem target_ids — o system user precisa ser atribuído à conta WhatsApp no Business Manager.',
          });
        }
      }
    } else {
      resultado.testes.push({
        teste: 'granular_scopes — scopes WhatsApp',
        resultado: 'NÃO ENCONTRADOS',
        nota: 'O token não tem scopes whatsapp_business_management/whatsapp_business_messaging granulares.',
        scopes_encontrados: resultado.token_info.granular_scopes.map(s => s.scope),
      });
    }
  }

  // 10. Último recurso: o phone number pertence a algum WABA?
  if (!resultado.waba_encontrado) {
    try {
      // Tentar buscar WABA via phone number edge
      const phoneWabaRes = await fetch(`${GRAPH_API}/${phoneId}?fields=id,display_phone_number,verified_name,account_mode`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (phoneWabaRes.ok) {
        const phoneWabaData = await phoneWabaRes.json();
        resultado.testes.push({
          teste: 'phone_number fields avançados',
          resultado: 'INFO',
          dados: phoneWabaData,
        });
      }
    } catch (_) {}

    resultado.instrucoes_manuais = {
      problema: `O ID ${envWabaId || '(não definido)'} não é um WABA ID válido, ou o system user não tem permissão para aceder templates.`,
      como_resolver: [
        '1. Vai a business.facebook.com → Definições → Contas do WhatsApp',
        '2. Clica na conta do WhatsApp (Sete Ecos)',
        '3. O número na URL é o WABA ID: business.facebook.com/settings/whatsapp-accounts/XXXXXXXXXX',
        '4. Copia esse número e mete como WHATSAPP_BUSINESS_ACCOUNT_ID no Vercel',
        '5. Também verifica que o System User tem acesso a essa conta WhatsApp',
      ],
      alternativa: 'Ou acede a https://business.facebook.com/latest/whatsapp_account/overview e vê o WABA ID no topo',
    };
  }

  // Se pedido com Accept: text/html (browser), devolver HTML legível
  const wantHtml = (req.headers.accept || '').includes('text/html');
  if (wantHtml) {
    return res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(renderDiagnosticoHtml(resultado));
  }

  return res.status(200).json({
    message: resultado.waba_encontrado
      ? `WABA ID encontrado: ${resultado.waba_encontrado.id}`
      : `WABA ID não encontrado — vê a secção "instrucoes_manuais"`,
    ...resultado,
  });
}

// Auto-detectar WABA ID (tenta env var, depois descobre via API)
async function resolverWabaId(token) {
  const envId = (process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.WHATSAPP_WABA_ID || '').trim();
  const phoneId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
  const businessId = (process.env.META_BUSINESS_ID || '').trim();
  const tentativas = [];

  // Método 1: Testar env var directamente
  if (envId) {
    try {
      const res = await fetch(`${GRAPH_API}/${envId}/message_templates?limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) return { wabaId: envId, metodo: 'env var WHATSAPP_BUSINESS_ACCOUNT_ID' };
      const data = await res.json().catch(() => ({}));
      tentativas.push({ metodo: 'env var', id: envId, erro: data?.error?.message || 'ID inválido ou sem permissões' });
    } catch (e) {
      tentativas.push({ metodo: 'env var', id: envId, erro: e.message });
    }
  }

  // Método 2: A partir do META_BUSINESS_ID
  if (businessId) {
    try {
      const res = await fetch(`${GRAPH_API}/${businessId}/owned_whatsapp_business_accounts`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          return { wabaId: data.data[0].id, metodo: 'META_BUSINESS_ID → owned_whatsapp_business_accounts', nome: data.data[0].name };
        }
      }
      tentativas.push({ metodo: 'META_BUSINESS_ID', id: businessId, erro: 'Sem WABA associado' });
    } catch (e) {
      tentativas.push({ metodo: 'META_BUSINESS_ID', erro: e.message });
    }
  }

  // Método 3: Descobrir negócios via /me/businesses
  try {
    const res = await fetch(`${GRAPH_API}/me/businesses`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      for (const biz of (data.data || [])) {
        try {
          const wabaRes = await fetch(`${GRAPH_API}/${biz.id}/owned_whatsapp_business_accounts`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (wabaRes.ok) {
            const wabaData = await wabaRes.json();
            if (wabaData.data && wabaData.data.length > 0) {
              return { wabaId: wabaData.data[0].id, metodo: `auto-detect via negócio "${biz.name}" (${biz.id})`, nome: wabaData.data[0].name };
            }
          }
        } catch (_) {}
      }
      tentativas.push({ metodo: '/me/businesses', negocios: (data.data || []).map(b => ({ id: b.id, nome: b.name })), erro: 'Nenhum WABA encontrado' });
    }
  } catch (e) {
    tentativas.push({ metodo: '/me/businesses', erro: e.message });
  }

  // Método 4: Tentar via env var como business ID (caso o user tenha confundido)
  if (envId && envId !== businessId) {
    try {
      const res = await fetch(`${GRAPH_API}/${envId}/owned_whatsapp_business_accounts`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          return { wabaId: data.data[0].id, metodo: `ID ${envId} é o Business ID, não o WABA ID — correcto é ${data.data[0].id}`, nome: data.data[0].name, corrigir: data.data[0].id };
        }
      }
      const errData = await res.json().catch(() => ({}));
      tentativas.push({ metodo: 'env var como Business ID', id: envId, erro: errData?.error?.message || `HTTP ${res.status}` });
    } catch (_) {}
  }

  // Método 5: debug_token para descobrir app_id, depois verificar WABAs da app
  try {
    const debugRes = await fetch(`${GRAPH_API}/debug_token?input_token=${token}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (debugRes.ok) {
      const debugData = await debugRes.json();
      const appId = debugData?.data?.app_id;
      const granularScopes = debugData?.data?.granular_scopes || [];
      const wabaScope = granularScopes.find(s => s.scope === 'whatsapp_business_management');
      if (wabaScope && wabaScope.target_ids && wabaScope.target_ids.length > 0) {
        const candidateId = wabaScope.target_ids[0];
        // Verificar se este ID é um WABA válido
        const checkRes = await fetch(`${GRAPH_API}/${candidateId}/message_templates?limit=1`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (checkRes.ok) {
          return { wabaId: candidateId, metodo: 'auto-detect via debug_token granular_scopes' };
        }
      }
      tentativas.push({
        metodo: 'debug_token',
        app_id: appId,
        scopes: granularScopes.map(s => ({ scope: s.scope, targets: s.target_ids?.length || 0 })),
        erro: wabaScope ? 'WABA target_id não funciona' : 'Sem scope whatsapp_business_management',
      });
    }
  } catch (e) {
    tentativas.push({ metodo: 'debug_token', erro: e.message });
  }

  // Método 6: Verificar o phone number e buscar campos disponíveis
  if (phoneId) {
    try {
      const phoneRes = await fetch(`${GRAPH_API}/${phoneId}?fields=id,display_phone_number,verified_name,quality_rating`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (phoneRes.ok) {
        const phoneData = await phoneRes.json();
        tentativas.push({
          metodo: 'phone_number_info',
          phone_id: phoneId,
          numero: phoneData.display_phone_number,
          nome_verificado: phoneData.verified_name,
          nota: 'Número válido mas não consegui extrair WABA ID a partir dele',
        });
      }
    } catch (_) {}
  }

  return { wabaId: null, tentativas };
}

async function handleTemplates(req, res, action, token) {
  const nomeFilter = req.query.nome || null;

  // Auto-detectar WABA ID
  const waba = await resolverWabaId(token);

  if (!waba.wabaId) {
    return res.status(500).json({
      error: 'Não consegui encontrar o WABA ID (WhatsApp Business Account ID)',
      tentativas: waba.tentativas,
      como_encontrar: [
        '1. Vai a developers.facebook.com > a tua App > WhatsApp > API Setup',
        '2. O "WhatsApp Business Account ID" aparece no topo da página',
        '3. Copia esse número e mete como WHATSAPP_BUSINESS_ACCOUNT_ID no Vercel',
        'NOTA: O WABA ID é DIFERENTE do Business ID e do Phone Number ID',
      ],
    });
  }

  const wabaId = waba.wabaId;

  // Listar (dry-run)
  if (action === 'templates') {
    const templates = Object.entries(META_TEMPLATES).map(([key, tmpl]) => ({
      chave: key, nome_meta: tmpl.name, categoria: tmpl.category,
      tem_botoes: !!(tmpl.buttons && tmpl.buttons.length),
      params: (tmpl.body.match(/\{\{\d+\}\}/g) || []).length,
    }));
    return res.status(200).json({
      message: `${templates.length} templates definidos. Usa ?action=templates-criar para os registar na Meta.`,
      waba: { id: wabaId, metodo: waba.metodo, nome: waba.nome, corrigir: waba.corrigir },
      templates,
    });
  }

  // Status
  if (action === 'templates-status') {
    const result = await listarTemplatesMeta(token, wabaId);
    if (!result.ok) return res.status(500).json({ error: result.error });

    const nossos = result.templates.filter(t => t.name.startsWith('sete_ecos_'));
    const nossosNomes = new Set(nossos.map(t => t.name));
    const definidos = Object.values(META_TEMPLATES).map(t => t.name);
    const faltam = definidos.filter(n => !nossosNomes.has(n));

    return res.status(200).json({
      message: `${nossos.length}/${definidos.length} templates registados na Meta`,
      registados: nossos.map(t => ({ nome: t.name, estado: t.status, categoria: t.category, id: t.id })),
      faltam,
    });
  }

  // Apagar
  if (action === 'templates-apagar') {
    if (!nomeFilter) return res.status(400).json({ error: 'Especifica: ?action=templates-apagar&nome=boas_vindas', disponiveis: Object.keys(META_TEMPLATES) });
    const tmpl = META_TEMPLATES[nomeFilter];
    if (!tmpl) return res.status(400).json({ error: `Template "${nomeFilter}" não encontrado`, disponiveis: Object.keys(META_TEMPLATES) });

    const response = await fetch(`${GRAPH_API}/${wabaId}/message_templates?name=${encodeURIComponent(tmpl.name)}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    return res.status(response.ok ? 200 : 500).json({
      message: response.ok ? `Template ${tmpl.name} apagado` : 'Erro ao apagar',
      ok: response.ok, error: data.error?.message,
    });
  }

  // Criar
  if (action === 'templates-criar') {
    const existentes = await listarTemplatesMeta(token, wabaId);
    const nomeExistentes = new Set();
    if (existentes.ok) {
      for (const t of existentes.templates) nomeExistentes.add(t.name);
    }

    let templatesPorCriar = Object.entries(META_TEMPLATES);
    if (nomeFilter) {
      if (!META_TEMPLATES[nomeFilter]) return res.status(400).json({ error: `Template "${nomeFilter}" não encontrado`, disponiveis: Object.keys(META_TEMPLATES) });
      templatesPorCriar = [[nomeFilter, META_TEMPLATES[nomeFilter]]];
    }

    const resultados = { criados: [], ja_existiam: [], erros: [] };

    for (const [key, tmpl] of templatesPorCriar) {
      if (!nomeFilter && nomeExistentes.has(tmpl.name)) {
        resultados.ja_existiam.push(tmpl.name);
        continue;
      }
      const result = await criarTemplateMeta(token, wabaId, converterParaMeta(key, tmpl));
      if (result.ok) {
        resultados.criados.push({ nome: tmpl.name, id: result.id, estado: result.status });
      } else if (result.code === 2388093) {
        resultados.ja_existiam.push(tmpl.name);
      } else {
        resultados.erros.push({ nome: tmpl.name, erro: result.error, codigo: result.code });
      }
      await new Promise(r => setTimeout(r, 500));
    }

    return res.status(200).json({
      message: `${resultados.criados.length} criados, ${resultados.ja_existiam.length} já existiam, ${resultados.erros.length} erros`,
      ...resultados,
      proximo_passo: resultados.criados.length > 0
        ? 'Templates submetidos para aprovação. PENDING → APPROVED (minutos a horas). Verifica com ?action=templates-status'
        : null,
    });
  }

  return res.status(400).json({ error: `Acção "${action}" inválida` });
}
