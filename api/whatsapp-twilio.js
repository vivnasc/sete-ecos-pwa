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

// Auto-detectar WABA ID (tenta env var, depois descobre via API)
async function resolverWabaId(token) {
  const envId = (process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.WHATSAPP_WABA_ID || '').trim();
  const businessId = (process.env.META_BUSINESS_ID || '').trim();
  const tentativas = [];

  // Método 1: Testar env var
  if (envId) {
    try {
      const res = await fetch(`${GRAPH_API}/${envId}/message_templates?limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) return { wabaId: envId, metodo: 'env var WHATSAPP_BUSINESS_ACCOUNT_ID' };
      tentativas.push({ metodo: 'env var', id: envId, erro: 'ID inválido ou sem permissões' });
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
      instrucoes: 'O WABA ID é diferente do Business ID. Para encontrá-lo: business.facebook.com > WhatsApp Manager > Definições da conta > o ID numérico na barra de endereço.',
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
