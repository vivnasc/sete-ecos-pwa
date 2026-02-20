/**
 * API: Criar Message Templates do WhatsApp na Meta
 *
 * Endpoint que regista automaticamente os 18 templates definidos em
 * whatsapp-broadcast.js no WhatsApp Business Account via Meta Graph API.
 *
 * Uso:
 *   GET /api/criar-templates-wa                      → Lista templates (dry-run)
 *   GET /api/criar-templates-wa?action=criar          → Cria TODOS os templates
 *   GET /api/criar-templates-wa?action=criar&nome=boas_vindas  → Cria 1 template
 *   GET /api/criar-templates-wa?action=status          → Ver estado dos templates existentes
 *   GET /api/criar-templates-wa?action=apagar&nome=boas_vindas → Apaga 1 template (para recriar)
 *
 * Variáveis de ambiente necessárias:
 *   WHATSAPP_ACCESS_TOKEN          → Token do System User (com permissão whatsapp_business_management)
 *   WHATSAPP_BUSINESS_ACCOUNT_ID   → WABA ID (ou WHATSAPP_WABA_ID)
 */

import { META_TEMPLATES } from './_lib/whatsapp-broadcast.js';

const GRAPH_API = 'https://graph.facebook.com/v22.0';

function getConfig() {
  const token = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
  const wabaId = (process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.WHATSAPP_WABA_ID || '').trim();

  return { token, wabaId };
}

// Converter template interno para formato Meta API
function converterParaMeta(key, tmpl) {
  const components = [];

  // Header (texto)
  if (tmpl.header) {
    components.push({
      type: 'HEADER',
      format: 'TEXT',
      text: tmpl.header,
    });
  }

  // Body — contar parâmetros {{1}}, {{2}}, etc.
  const bodyParams = tmpl.body.match(/\{\{\d+\}\}/g) || [];
  const bodyComponent = {
    type: 'BODY',
    text: tmpl.body,
  };

  // Exemplos obrigatórios para a Meta aprovar
  if (bodyParams.length > 0) {
    const exemplos = {
      '{{1}}': 'Maria',
      '{{2}}': '7',
      '{{3}}': '1.5L',
    };
    bodyComponent.example = {
      body_text: [bodyParams.map(p => exemplos[p] || 'exemplo')],
    };
  }
  components.push(bodyComponent);

  // Footer
  if (tmpl.footer) {
    components.push({
      type: 'FOOTER',
      text: tmpl.footer,
    });
  }

  // Botões
  if (tmpl.buttons && tmpl.buttons.length > 0) {
    components.push({
      type: 'BUTTONS',
      buttons: tmpl.buttons.map(btn => {
        if (btn.type === 'URL') {
          return {
            type: 'URL',
            text: btn.text,
            url: btn.url,
          };
        }
        return btn;
      }),
    });
  }

  return {
    name: tmpl.name,
    language: tmpl.language,
    category: tmpl.category,
    components,
  };
}

// Criar um template na Meta
async function criarTemplate(token, wabaId, metaPayload) {
  const url = `${GRAPH_API}/${wabaId}/message_templates`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metaPayload),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      name: metaPayload.name,
      status: response.status,
      error: data.error?.message || JSON.stringify(data),
      code: data.error?.code,
    };
  }

  return {
    ok: true,
    name: metaPayload.name,
    id: data.id,
    status: data.status,
  };
}

// Listar templates existentes
async function listarTemplates(token, wabaId) {
  const url = `${GRAPH_API}/${wabaId}/message_templates?limit=100`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json();
    return { ok: false, error: data.error?.message || `HTTP ${response.status}` };
  }

  const data = await response.json();
  return { ok: true, templates: data.data || [] };
}

// Apagar template por nome
async function apagarTemplate(token, wabaId, nome) {
  const url = `${GRAPH_API}/${wabaId}/message_templates?name=${encodeURIComponent(nome)}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await response.json();

  if (!response.ok) {
    return { ok: false, error: data.error?.message || `HTTP ${response.status}` };
  }

  return { ok: true, success: data.success };
}

export default async function handler(req, res) {
  // Só GET para simplicidade (pode ser chamado pelo browser)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Usar GET' });
  }

  const { token, wabaId } = getConfig();
  const action = req.query.action || 'listar';
  const nomeFilter = req.query.nome || null;

  // Verificar configuração
  if (!token) {
    return res.status(500).json({
      error: 'WHATSAPP_ACCESS_TOKEN não configurado no Vercel',
      instrucoes: 'Vai a vercel.com > Settings > Environment Variables > adiciona WHATSAPP_ACCESS_TOKEN',
    });
  }

  if (!wabaId) {
    return res.status(500).json({
      error: 'WHATSAPP_BUSINESS_ACCOUNT_ID não configurado no Vercel',
      instrucoes: 'Vai a business.facebook.com > Definições > Contas do WhatsApp > copia o ID da conta > adiciona como WHATSAPP_BUSINESS_ACCOUNT_ID no Vercel',
      dica: 'O WABA ID é o número que aparece ao lado do nome da conta WhatsApp nas definições do Meta Business',
    });
  }

  // ===== LISTAR (dry-run) =====
  if (action === 'listar') {
    const templates = Object.entries(META_TEMPLATES).map(([key, tmpl]) => ({
      chave: key,
      nome_meta: tmpl.name,
      categoria: tmpl.category,
      idioma: tmpl.language,
      tem_header: !!tmpl.header,
      tem_botoes: !!(tmpl.buttons && tmpl.buttons.length),
      params: (tmpl.body.match(/\{\{\d+\}\}/g) || []).length,
    }));

    return res.status(200).json({
      message: `${templates.length} templates definidos. Usa ?action=criar para os registar na Meta.`,
      templates,
      url_criar_todos: '/api/criar-templates-wa?action=criar',
    });
  }

  // ===== STATUS — ver templates já registados na Meta =====
  if (action === 'status') {
    const result = await listarTemplates(token, wabaId);

    if (!result.ok) {
      return res.status(500).json({ error: result.error });
    }

    // Filtrar só os sete_ecos_*
    const nossos = result.templates.filter(t => t.name.startsWith('sete_ecos_'));
    const nossosNomes = new Set(nossos.map(t => t.name));

    // Ver quais faltam
    const definidos = Object.values(META_TEMPLATES).map(t => t.name);
    const faltam = definidos.filter(n => !nossosNomes.has(n));

    return res.status(200).json({
      message: `${nossos.length}/${definidos.length} templates registados na Meta`,
      registados: nossos.map(t => ({
        nome: t.name,
        estado: t.status,
        categoria: t.category,
        idioma: t.language,
        id: t.id,
      })),
      faltam,
      url_criar_faltam: faltam.length > 0
        ? `/api/criar-templates-wa?action=criar`
        : null,
    });
  }

  // ===== APAGAR template =====
  if (action === 'apagar') {
    if (!nomeFilter) {
      return res.status(400).json({
        error: 'Especifica o nome do template: ?action=apagar&nome=boas_vindas',
      });
    }

    const tmpl = META_TEMPLATES[nomeFilter];
    if (!tmpl) {
      return res.status(400).json({
        error: `Template "${nomeFilter}" não encontrado`,
        disponiveis: Object.keys(META_TEMPLATES),
      });
    }

    const result = await apagarTemplate(token, wabaId, tmpl.name);
    return res.status(result.ok ? 200 : 500).json({
      message: result.ok ? `Template ${tmpl.name} apagado` : `Erro ao apagar`,
      ...result,
    });
  }

  // ===== CRIAR templates =====
  if (action === 'criar') {
    // Primeiro ver quais já existem
    const existentes = await listarTemplates(token, wabaId);
    const nomeExistentes = new Set();

    if (existentes.ok) {
      for (const t of existentes.templates) {
        nomeExistentes.add(t.name);
      }
    }

    // Filtrar templates a criar
    let templatesPorCriar = Object.entries(META_TEMPLATES);

    if (nomeFilter) {
      // Criar só um específico
      if (!META_TEMPLATES[nomeFilter]) {
        return res.status(400).json({
          error: `Template "${nomeFilter}" não encontrado`,
          disponiveis: Object.keys(META_TEMPLATES),
        });
      }
      templatesPorCriar = [[nomeFilter, META_TEMPLATES[nomeFilter]]];
    }

    const resultados = {
      criados: [],
      ja_existiam: [],
      erros: [],
    };

    for (const [key, tmpl] of templatesPorCriar) {
      // Saltar se já existe (a menos que seja um pedido específico)
      if (!nomeFilter && nomeExistentes.has(tmpl.name)) {
        resultados.ja_existiam.push(tmpl.name);
        continue;
      }

      const metaPayload = converterParaMeta(key, tmpl);
      const result = await criarTemplate(token, wabaId, metaPayload);

      if (result.ok) {
        resultados.criados.push({ nome: tmpl.name, id: result.id, estado: result.status });
      } else {
        // Código 2388093 = template já existe com esse nome
        if (result.code === 2388093) {
          resultados.ja_existiam.push(tmpl.name);
        } else {
          resultados.erros.push({ nome: tmpl.name, erro: result.error, codigo: result.code });
        }
      }

      // Rate limit: esperar 500ms entre pedidos
      await new Promise(r => setTimeout(r, 500));
    }

    const totalOk = resultados.criados.length + resultados.ja_existiam.length;
    const totalEsperado = templatesPorCriar.length;

    return res.status(200).json({
      message: `${resultados.criados.length} criados, ${resultados.ja_existiam.length} já existiam, ${resultados.erros.length} erros (${totalOk}/${totalEsperado})`,
      ...resultados,
      proximo_passo: resultados.criados.length > 0
        ? 'Templates submetidos para aprovação da Meta. Estado: PENDING → APPROVED (demora minutos a horas). Verifica com ?action=status'
        : null,
    });
  }

  return res.status(400).json({
    error: `Acção "${action}" inválida`,
    acoes_disponiveis: {
      listar: 'Ver templates definidos (dry-run)',
      criar: 'Criar templates na Meta API',
      status: 'Ver estado dos templates na Meta',
      apagar: 'Apagar template (para recriar)',
    },
  });
}
