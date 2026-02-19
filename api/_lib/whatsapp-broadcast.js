/**
 * WhatsApp Broadcast — Módulo partilhado
 *
 * Lógica de envio proativo de WhatsApp via Meta Cloud API.
 * Usado pelo coach.js como actions de broadcast.
 *
 * Suporta dois modos de envio:
 * 1. Texto livre (só funciona dentro da janela de 24h)
 * 2. Message Templates aprovados pela Meta (funciona sempre — RECOMENDADO)
 */

const ACCESS_TOKEN = () => (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
const PHONE_NUMBER_ID = () => (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();

// ===== META MESSAGE TEMPLATES =====
// Estes nomes devem corresponder aos templates aprovados no Meta Business Manager.
// Para criar: Meta Business > WhatsApp > Message Templates > Criar
// Categoria: MARKETING (para broadcasts) ou UTILITY (para notificações)
//
// Guia rápido para criar templates na Meta:
// 1. Ir a business.facebook.com > WhatsApp Manager > Message Templates
// 2. Clicar "Create Template"
// 3. Categoria: Marketing
// 4. Idioma: Portuguese (BR) ou Portuguese (PT)
// 5. Nome: ex. "sete_ecos_convite_trial" (só minúsculas, underscores)
// 6. Body: texto com {{1}}, {{2}} para variáveis (ex. nome)
// 7. Submeter para aprovação (demora minutos a horas)

// Textos EXACTOS para submeter na Meta Business Manager.
// Copiar o campo "body" e colar no formulário da Meta.
// {{1}} = nome da pessoa (preenchido automaticamente pelo sistema)

export const META_TEMPLATES = {
  convite_trial: {
    name: 'sete_ecos_convite_trial',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'VITALIS — 7 Dias Grátis',
    body: 'Olá {{1}}! 🌿\n\nFalamos há uns dias e quero saber: já experimentaste o VITALIS?\n\nTens *7 dias grátis* para testar. Plano alimentar personalizado com comida moçambicana, check-in diário e o meu acompanhamento directo.\n\nSem compromisso. Se não gostares, não pagas nada.\n\nComeça aqui: https://app.seteecos.com/vitalis\n\nQualquer dúvida, responde aqui. Estou do outro lado.\n\n— Vivianne',
    footer: 'Sete Ecos — Sistema de Transmutação',
    buttons: [{ type: 'URL', text: 'Começar Trial Grátis', url: 'https://app.seteecos.com/vitalis' }],
    params: (nome) => [nome || 'amiga'],
  },
  lembrete_app: {
    name: 'sete_ecos_lembrete',
    language: 'pt_BR',
    category: 'UTILITY',
    header: 'Sete Ecos — Lembrete',
    body: 'Olá {{1}}! 💚\n\nLembra-te de fazer o teu check-in diário na app Sete Ecos. Leva 30 segundos e o teu corpo agradece a consistência.\n\nSe precisares de ajuda ou tiveres dúvidas, responde aqui.\n\n— Vivianne',
    footer: 'Sete Ecos',
    params: (nome) => [nome || 'querida'],
  },
  follow_up: {
    name: 'sete_ecos_follow_up',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Como estás?',
    body: 'Olá {{1}}! 🤗\n\nPassaste por aqui há uns dias e quero saber como estás.\n\nO VITALIS tem ajudado muitas mulheres moçambicanas a encontrar o equilíbrio com a comida — sem dietas malucas, sem passar fome, com comida que já conheces.\n\nSe quiseres saber mais ou tiveres qualquer dúvida, responde aqui. Estou sempre disponível.\n\n— Vivianne',
    footer: 'Sete Ecos — Transformação Feminina',
    params: (nome) => [nome || ''],
  },
  promo: {
    name: 'sete_ecos_promo',
    language: 'pt_BR',
    category: 'MARKETING',
    header: '🎁 20% Desconto VITALIS',
    body: 'Olá {{1}}!\n\nTenho um presente especial para ti: usa o código *VEMVITALIS20* e tens *20% de desconto* no VITALIS.\n\nPlano alimentar personalizado + check-in diário + apoio emocional + receitas moçambicanas. De 2.500 por *2.000 MZN/mês*.\n\nComeça aqui: https://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20\n\nSó até ao fim do mês!\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Usar Código 20% Off', url: 'https://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20' }],
    params: (nome) => [nome || ''],
  },
  novidade: {
    name: 'sete_ecos_novidade',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Novidades Sete Ecos! 🌟',
    body: 'Olá {{1}}!\n\nTemos novidades no Sete Ecos! Novos recursos e funcionalidades que vão tornar a tua jornada ainda melhor.\n\nPassa pela app para descobrir: https://app.seteecos.com\n\nSe tiveres dúvidas ou quiseres saber mais, responde aqui.\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Ver Novidades', url: 'https://app.seteecos.com' }],
    params: (nome) => [nome || ''],
  },
};

// ===== ENVIAR MENSAGEM VIA META CLOUD API =====

export async function enviarMensagemWA(para, texto, options = {}) {
  const token = ACCESS_TOKEN();
  const phoneId = PHONE_NUMBER_ID();

  if (!token || !phoneId) {
    return { ok: false, error: 'Meta API não configurada' };
  }

  const paraLimpo = para.replace(/[^0-9]/g, '');
  const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;

  // Construir payload: template ou texto livre
  let payload;

  if (options.template && META_TEMPLATES[options.template]) {
    const tmpl = META_TEMPLATES[options.template];
    const params = tmpl.params(options.nome || '');

    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: paraLimpo,
      type: 'template',
      template: {
        name: tmpl.name,
        language: { code: tmpl.language },
        components: params.length > 0 ? [{
          type: 'body',
          parameters: params.map(p => ({ type: 'text', text: p })),
        }] : undefined,
      },
    };
  } else {
    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: paraLimpo,
      type: 'text',
      text: { body: texto },
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errData;
      try { errData = await response.json(); } catch (_) { errData = await response.text(); }
      console.error('Erro Meta API broadcast:', response.status, JSON.stringify(errData));
      return { ok: false, error: errData?.error?.message || `HTTP ${response.status}`, numero: paraLimpo };
    }

    const result = await response.json();
    return { ok: true, messageId: result.messages?.[0]?.id, numero: paraLimpo };
  } catch (err) {
    return { ok: false, error: err.message, numero: paraLimpo };
  }
}

// ===== LISTAR CONTACTOS DO CHATBOT =====

export async function listarContactosWA(supabase) {
  const { data: mensagens, error } = await supabase
    .from('chatbot_mensagens')
    .select('telefone, nome, chave_detectada, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Erro ao buscar contactos: ${error.message}`);

  const contactosMap = new Map();

  for (const msg of mensagens || []) {
    const tel = msg.telefone;
    if (!tel || tel === 'teste-simulador' || tel === 'desconhecido') continue;

    if (!contactosMap.has(tel)) {
      contactosMap.set(tel, {
        telefone: tel,
        nome: msg.nome || null,
        total_mensagens: 0,
        ultima_mensagem: msg.created_at,
        primeira_mensagem: msg.created_at,
        chaves_detectadas: new Set(),
      });
    }

    const c = contactosMap.get(tel);
    c.total_mensagens++;
    if (msg.nome && !c.nome) c.nome = msg.nome;
    c.primeira_mensagem = msg.created_at;
    if (msg.chave_detectada) c.chaves_detectadas.add(msg.chave_detectada);
  }

  const { data: clientes } = await supabase
    .from('vitalis_clients')
    .select('user_id, subscription_status, users!inner(email, nome)')
    .in('subscription_status', ['active', 'trial', 'tester']);

  const contactos = [];
  for (const [, c] of contactosMap) {
    const interesses = [...c.chaves_detectadas];
    const interessouPrecos = interesses.some(k => ['precos', 'pagar', 'trial'].includes(k));
    const interessouVitalis = interesses.some(k => ['1', 'vitalis'].includes(k));

    contactos.push({
      telefone: c.telefone,
      nome: c.nome,
      total_mensagens: c.total_mensagens,
      ultima_mensagem: c.ultima_mensagem,
      primeira_mensagem: c.primeira_mensagem,
      interesses,
      interessou_precos: interessouPrecos,
      interessou_vitalis: interessouVitalis,
      tipo: 'lead',
    });
  }

  contactos.sort((a, b) => new Date(b.ultima_mensagem) - new Date(a.ultima_mensagem));

  return {
    contactos,
    total: contactos.length,
    total_clientes_activos: clientes?.length || 0,
  };
}

// ===== BROADCAST PARA LISTA DE NÚMEROS =====

export async function broadcastWA(supabase, numeros, mensagem, options = {}) {
  const resultados = { enviados: 0, erros: [], total: numeros.length };

  for (let i = 0; i < numeros.length; i++) {
    const result = await enviarMensagemWA(numeros[i], mensagem, options);

    if (result.ok) {
      resultados.enviados++;
    } else {
      resultados.erros.push({ numero: numeros[i], erro: result.error });
    }

    try {
      await supabase.from('whatsapp_broadcast_log').insert({
        telefone: numeros[i].replace(/[^0-9]/g, ''),
        mensagem: mensagem.slice(0, 2000),
        tipo: 'broadcast',
        status: result.ok ? 'enviado' : 'erro',
        erro: result.ok ? null : result.error,
        message_id: result.messageId || null,
      });
    } catch (_) { /* tabela pode não existir */ }

    // Rate limit: 3s entre mensagens
    if (i < numeros.length - 1) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  return resultados;
}

// ===== BROADCAST POR GRUPO =====

export async function broadcastGrupoWA(supabase, grupo, mensagem, options = {}) {
  const { contactos } = await listarContactosWA(supabase);

  let numeros = [];
  if (grupo === 'todos') {
    numeros = contactos.map(c => c.telefone);
  } else if (grupo === 'leads') {
    numeros = contactos.filter(c => c.tipo === 'lead').map(c => c.telefone);
  } else if (grupo === 'interessados-precos') {
    numeros = contactos.filter(c => c.interessou_precos).map(c => c.telefone);
  } else if (grupo === 'interessados-vitalis') {
    numeros = contactos.filter(c => c.interessou_vitalis).map(c => c.telefone);
  } else if (grupo === 'recentes') {
    const limite = new Date();
    limite.setDate(limite.getDate() - 30);
    numeros = contactos
      .filter(c => new Date(c.ultima_mensagem) >= limite)
      .map(c => c.telefone);
  } else {
    throw new Error(`Grupo inválido: ${grupo}. Disponíveis: todos, leads, interessados-precos, interessados-vitalis, recentes`);
  }

  if (numeros.length === 0) {
    return { message: 'Nenhum contacto neste grupo', enviados: 0, total: 0, grupo };
  }

  const resultados = await broadcastWA(supabase, numeros, mensagem, options);
  resultados.grupo = grupo;
  resultados.message = `Broadcast "${grupo}": ${resultados.enviados}/${resultados.total} enviados`;
  return resultados;
}
