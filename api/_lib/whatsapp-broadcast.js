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
  // ===== SEQUENCIA NURTURING (mesmo conteudo dos emails) =====

  // Dia 0 — Boas-vindas (= email dia 0)
  boas_vindas: {
    name: 'sete_ecos_boas_vindas',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Bem-vindo(a) ao Sete Ecos!',
    body: 'Olá {{1}}! 🌿\n\nObrigado(a) por te juntares ao Sete Ecos.\n\nO Sete Ecos é um ecossistema de transformação — sete caminhos que se complementam para te guiar numa jornada de autodescoberta, equilíbrio e plenitude.\n\nNos próximos dias vou partilhar contigo ferramentas que podem mudar a tua relação contigo.\n\nA começar pelo *Lumina* — um diagnóstico gratuito que revela padrões sobre a tua energia, emoção e corpo.\n\nExperimenta aqui: https://app.seteecos.com/lumina\n\n— Vivianne',
    footer: 'Sete Ecos — Sistema de Transmutação',
    buttons: [{ type: 'URL', text: 'Experimentar Lumina', url: 'https://app.seteecos.com/lumina' }],
    params: (nome) => [nome || ''],
  },

  // Dia 3 — Convite Lumina (= email dia 3)
  convite_lumina: {
    name: 'sete_ecos_convite_lumina',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Já experimentaste o Lumina?',
    body: 'Olá {{1}}! ✨\n\n2 minutos podem mudar o teu dia.\n\nO *Lumina* é um ritual diário de auto-observação. 7 perguntas simples que revelam padrões sobre como te sentes — corpo, mente e emoção.\n\nQuem usa o Lumina reporta:\n• Mais consciência sobre padrões emocionais\n• Melhor capacidade de prever dias difíceis\n• Correlação entre estados físicos e emocionais\n\nÉ *completamente gratuito*. Demora menos de 2 minutos.\n\nhttps://app.seteecos.com/lumina\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Fazer Diagnóstico', url: 'https://app.seteecos.com/lumina' }],
    params: (nome) => [nome || ''],
  },

  // Dia 7 — 3 Sinais (= email dia 7)
  tres_sinais: {
    name: 'sete_ecos_tres_sinais',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'O teu corpo fala. Estás a ouvir?',
    body: 'Olá {{1}}! 💚\n\nHá 3 sinais que muitas pessoas ignoram:\n\n*1. Cansaço crónico* — Se dormes e acordas sem energia, pode ser o que comes (ou não comes).\n\n*2. Comer por emoção* — Se comes quando estás triste, com ansiedade ou tédio, o problema não é fome.\n\n*3. Efeito ioiô* — Se perdes peso e ganhas de volta, as dietas restritivas estão a sabotar o teu metabolismo.\n\nSe te identificas com pelo menos 1, o *VITALIS* foi criado exactamente para ti.\n\nhttps://app.seteecos.com/vitalis\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Conhecer o VITALIS', url: 'https://app.seteecos.com/vitalis' }],
    params: (nome) => [nome || ''],
  },

  // Dia 10 — Segredo / Curiosidade (= email dia 10)
  segredo: {
    name: 'sete_ecos_segredo',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Preciso de te contar uma coisa',
    body: 'Olá {{1}}!\n\nTenho trabalhado com pessoas moçambicanas há anos. E há um padrão que vejo repetir-se:\n\n_"A maioria das pessoas que me procura não tem um problema de comida. Tem um problema de emoção disfarçado de fome."_\n\nLeste isto e sentiste algo?\n\nQuando comes por ansiedade, por solidão, por tédio — o teu corpo não precisa de comida. Precisa de *presença*. E nenhuma dieta resolve isso.\n\nFoi por isso que criei o *Espaço de Retorno* dentro do VITALIS — um lugar onde podes ir quando sentes vontade de comer por emoção. Sem culpa. Sem julgamento.\n\n*Isto não existe em mais nenhum programa — em lado nenhum do mundo.*\n\nQueres saber mais? Responde aqui.\n\n— Vivianne',
    footer: 'Sete Ecos',
    params: (nome) => [nome || ''],
  },

  // Dia 14 — Convite VITALIS + código promo (= email dia 14)
  convite_trial: {
    name: 'sete_ecos_convite_trial',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'VITALIS — 20% Desconto',
    body: 'Olá {{1}}! 🌿\n\nImagina isto: daqui a 3 meses, acordas com mais energia. A roupa cabe melhor. Comes sem culpa.\n\nO que inclui o *VITALIS*:\n• Plano alimentar personalizado com comida moçambicana\n• Receitas com ingredientes que já tens em casa\n• Check-in diário em 30 segundos\n• Espaço de Retorno (apoio emocional único)\n• Chat directo com a Vivianne\n• 7 dias de garantia total\n\nCódigo exclusivo: *VEMVITALIS20*\nDe 2.500 por *2.000 MZN/mês*\n\nComeça aqui: https://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20\n\n— Vivianne',
    footer: 'Sete Ecos — Sistema de Transmutação',
    buttons: [{ type: 'URL', text: 'Começar com 20% Off', url: 'https://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20' }],
    params: (nome) => [nome || ''],
  },

  // Dia 21 — Testemunho / Prova social (= email dia 21)
  testemunho: {
    name: 'sete_ecos_testemunho',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Isto é possível para ti também',
    body: 'Olá {{1}}! 💚\n\n_"Finalmente um método que não me faz sentir em dieta. Perdi 8kg em 3 meses e aprendi a comer sem culpa. O Espaço de Retorno mudou tudo — percebi que comia por ansiedade, não por fome."_\n— M., Maputo\n\n_"A app é tão fácil de usar. Uso a comida que já tenho em casa — xima, matapa, feijão nhemba. Não preciso de comprar nada especial."_\n— A., Beira\n\nO teu código ainda está activo:\n*VEMVITALIS20* — 20% de desconto\n\nhttps://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Quero o Mesmo Resultado', url: 'https://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20' }],
    params: (nome) => [nome || ''],
  },

  // Dia 30 — Última chance (= email dia 30)
  ultima_chance: {
    name: 'sete_ecos_ultima_chance',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Última oportunidade',
    body: 'Olá {{1}}!\n\nJá passou um mês. Nesse tempo, quem começou o VITALIS já:\n\n• Perderam 2-4kg na primeira semana\n• Aprenderam a medir porções sem balança (método da mão)\n• Descobriram o Espaço de Retorno para momentos difíceis\n• Construíram hábitos que duram — com comida moçambicana\n\nA única diferença entre elas e tu? *Elas começaram.*\n\n*ÚLTIMA OPORTUNIDADE*\nCódigo: *VEMVITALIS20* — 20% desconto\nDe 2.500 por *2.000 MZN/mês*\n7 dias de garantia total. Zero risco.\n\nhttps://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20\n\nPreferes falar comigo primeiro? Responde aqui.\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Começar Agora — 20% Off', url: 'https://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20' }],
    params: (nome) => [nome || ''],
  },

  // ===== UTILITÁRIOS =====

  lembrete_app: {
    name: 'sete_ecos_lembrete',
    language: 'pt_BR',
    category: 'UTILITY',
    header: 'Sete Ecos — Lembrete',
    body: 'Olá {{1}}! 💚\n\nJá lá vão uns dias desde o teu último registo no Vitalis.\n\nSabemos que a vida acontece, mas cada pequeno passo conta. Que tal registares algo hoje? Mesmo que seja só a água.\n\nLeva 30 segundos e o teu corpo agradece a consistência.\n\nhttps://app.seteecos.com/vitalis\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Voltar ao Vitalis', url: 'https://app.seteecos.com/vitalis' }],
    params: (nome) => [nome || ''],
  },

  // Motivação intensa (= email inactivo 5+ dias)
  motivacao: {
    name: 'sete_ecos_motivacao',
    language: 'pt_BR',
    category: 'UTILITY',
    header: 'Não desisti de ti',
    body: 'Olá {{1}}!\n\nSei que estes dias não foram fáceis.\n\n_"A diferença entre quem transforma o corpo e quem desiste não é força de vontade. É ter alguém que não desiste de ti."_\n\nEu não desisti de ti. E não vou desistir.\n\nSabes o que acontece quando voltas hoje?\n• Todo o teu progresso anterior está guardado\n• Retomas exactamente onde paraste\n• Um check-in de 30 segundos já é uma vitória\n\nhttps://app.seteecos.com/vitalis\n\nQueres falar sobre o que te está a travar? Responde aqui. Sem julgamento.\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Fazer Check-in Agora', url: 'https://app.seteecos.com/vitalis' }],
    params: (nome) => [nome || ''],
  },

  // ===== TEMPLATES PARA CLIENTES ACTIVOS =====

  // Check-in lembrete (2 dias sem actividade)
  checkin_lembrete: {
    name: 'sete_ecos_checkin_lembrete',
    language: 'pt_BR',
    category: 'UTILITY',
    header: 'Sete Ecos — Lembrete',
    body: 'Olá {{1}}! 💚\n\nJá passaram 2 dias desde o teu último check-in no VITALIS.\n\nSabemos que a vida acontece, mas cada pequeno passo conta. Leva 30 segundos e o teu corpo agradece a consistência.\n\nQue tal registares algo hoje? Mesmo que seja só a água.\n\nhttps://app.seteecos.com/vitalis/dashboard\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Fazer Check-in', url: 'https://app.seteecos.com/vitalis/dashboard' }],
    params: (nome) => [nome || ''],
  },

  // Celebração de marco (7, 30, 90 dias)
  marco_celebracao: {
    name: 'sete_ecos_marco',
    language: 'pt_BR',
    category: 'UTILITY',
    header: 'Parabéns! 🎉',
    body: 'Olá {{1}}! 🎉\n\n*{{2}} dias consecutivos de check-in!*\n\nIsto é enorme. A maioria das pessoas desiste antes de chegar aqui.\n\nTu não. Tu estás a construir hábitos que duram.\n\nContinua assim — cada dia conta, e o teu corpo está a agradecer.\n\nhttps://app.seteecos.com/vitalis/dashboard\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Ver Progresso', url: 'https://app.seteecos.com/vitalis/dashboard' }],
    params: (nome, dias) => [nome || '', String(dias || 7)],
    // dias = número do marco (7, 30, 90)
  },

  // Resumo semanal (segundas-feiras)
  resumo_semanal: {
    name: 'sete_ecos_resumo_semanal',
    language: 'pt_BR',
    category: 'UTILITY',
    header: 'O teu resumo semanal',
    body: 'Olá {{1}}! 📊\n\nResumo da tua semana no VITALIS:\n• Check-ins: {{2}}\n• Água média: {{3}}\n\nCada registo é um passo. Esta semana, tenta superar a anterior.\n\nhttps://app.seteecos.com/vitalis/dashboard\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Ver Dashboard', url: 'https://app.seteecos.com/vitalis/dashboard' }],
    params: (nome, dias, extra) => [nome || '', String(dias || 0), extra || '—'],
  },

  // Trial a expirar (3 dias antes do fim)
  trial_expirando: {
    name: 'sete_ecos_trial_expirando',
    language: 'pt_BR',
    category: 'UTILITY',
    header: 'O teu trial termina em breve',
    body: 'Olá {{1}}!\n\nO teu período de experimentação no VITALIS termina em *3 dias*.\n\nPara continuares a ter acesso ao teu plano alimentar, receitas e check-in diário, subscreve agora:\n\nCódigo exclusivo: *VEMVITALIS20* — 20% desconto\nDe 2.500 por *2.000 MZN/mês*\n\nhttps://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20\n\nDúvidas? Responde aqui.\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Subscrever com 20% Off', url: 'https://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20' }],
    params: (nome) => [nome || ''],
  },

  // Win-back (3+ dias após expirar)
  winback: {
    name: 'sete_ecos_winback',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Sentimos a tua falta',
    body: 'Olá {{1}}!\n\nA tua subscrição VITALIS expirou, mas quero que saibas: todo o teu progresso está guardado.\n\nSe voltares agora, retomas exactamente onde paraste — plano alimentar, receitas, histórico de check-ins. Tudo intacto.\n\nCódigo especial de regresso: *VEMVITALIS20* — 20% desconto\n\nhttps://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20\n\nEstou aqui se precisares de falar.\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Reactivar com 20% Off', url: 'https://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20' }],
    params: (nome) => [nome || ''],
  },

  // ===== BROADCASTS MANUAIS =====

  follow_up: {
    name: 'sete_ecos_follow_up',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Como estás?',
    body: 'Olá {{1}}! 🤗\n\nPassaste por aqui há uns dias e quero saber como estás.\n\nO VITALIS tem ajudado muitas pessoas a encontrar o equilíbrio com a comida — sem dietas malucas, sem passar fome, com comida que já conheces.\n\nSe quiseres saber mais ou tiveres qualquer dúvida, responde aqui. Estou sempre disponível.\n\n— Vivianne',
    footer: 'Sete Ecos — Transformação Feminina',
    params: (nome) => [nome || ''],
  },

  promo: {
    name: 'sete_ecos_promo',
    language: 'pt_BR',
    category: 'MARKETING',
    header: '20% Desconto VITALIS',
    body: 'Olá {{1}}!\n\nTenho um presente especial para ti: usa o código *VEMVITALIS20* e tens *20% de desconto* no VITALIS.\n\nPlano alimentar personalizado + check-in diário + apoio emocional + receitas moçambicanas. De 2.500 por *2.000 MZN/mês*.\n\nComeça aqui: https://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20\n\nSó até ao fim do mês!\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Usar Código 20% Off', url: 'https://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20' }],
    params: (nome) => [nome || ''],
  },

  novidade: {
    name: 'sete_ecos_novidade',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Novidades Sete Ecos!',
    body: 'Olá {{1}}!\n\nTemos novidades no Sete Ecos! Novos recursos e funcionalidades que vão tornar a tua jornada ainda melhor.\n\nPassa pela app para descobrir: https://app.seteecos.com\n\nSe tiveres dúvidas ou quiseres saber mais, responde aqui.\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Ver Novidades', url: 'https://app.seteecos.com' }],
    params: (nome) => [nome || ''],
  },

  // Curiosidade semanal (= email curiosidade insana)
  curiosidade: {
    name: 'sete_ecos_curiosidade',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Comes por fome ou por emoção?',
    body: 'Olá {{1}}!\n\nFaz este exercício: antes de comeres algo, põe a mão no peito e pergunta _"estou mesmo com fome ou estou a sentir algo?"_\n\nSe a resposta for "estou a sentir algo" — parabéns, acabaste de descobrir o padrão que 87% das pessoas ignoram.\n\nÉ este padrão que faz o efeito ioiô. Não é a comida. É a emoção.\n\nO VITALIS tem uma ferramenta única chamada *Espaço de Retorno* — feita exactamente para estes momentos. Nenhum outro programa no mundo tem isto.\n\nCódigo: *VEMVITALIS20* — 20% desconto\nhttps://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Começar com 20% Off', url: 'https://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20' }],
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
    const params = tmpl.params(options.nome || '', options.dias, options.extra);

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
