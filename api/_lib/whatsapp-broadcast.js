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
// 5. Nome: ex. "sete_ecos_edu_sinais_corpo" (só minúsculas, underscores)
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
    body: 'Olá {{1}}! 🌿\n\nObrigado(a) por te juntares ao Sete Ecos.\n\nO Sete Ecos é um ecossistema de transformação — sete caminhos que se complementam para te guiar numa jornada de autodescoberta, equilíbrio e plenitude.\n\nNos próximos dias vou partilhar contigo ferramentas e conhecimento que podem mudar a tua relação contigo.\n\nA começar pelo *Lumina* — um diagnóstico gratuito que revela padrões sobre a tua energia, emoção e corpo.\n\nExperimenta aqui: https://app.seteecos.com/lumina\n\n— Vivianne',
    footer: 'Sete Ecos — Sistema de Transmutação Integral',
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

  // Dia 7 — 3 Sinais educativos (= email dia 7)
  tres_sinais: {
    name: 'sete_ecos_tres_sinais',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'O teu corpo fala. Estás a ouvir?',
    body: 'Olá {{1}}! 💚\n\nHá 3 sinais que muitas pessoas ignoram — e a ciência explica porquê:\n\n*1. Cansaço crónico* — Quando dormes e acordas sem energia, pode haver um desequilíbrio no cortisol. O cortisol elevado de forma crónica interfere com a qualidade do sono profundo.\n\n*2. Comer por emoção* — O cérebro usa comida como regulador emocional. Não é falta de disciplina — é neurobiologia. Aprender a distinguir fome física de fome emocional é uma competência que se treina.\n\n*3. Efeito ioiô* — Dietas restritivas reduzem a taxa metabólica basal. O corpo interpreta restrição como escassez e adapta-se, tornando cada dieta seguinte menos eficaz.\n\nSe te identificas com pelo menos 1, vale a pena aprofundar. Escrevi mais sobre isto aqui:\n\nhttps://app.seteecos.com/vitalis\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Saber Mais', url: 'https://app.seteecos.com/vitalis' }],
    params: (nome) => [nome || ''],
  },

  // Dia 10 — Fome emocional vs física (= email dia 10)
  segredo: {
    name: 'sete_ecos_segredo',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Fome emocional vs. fome física',
    body: 'Olá {{1}}!\n\nHoje quero ensinar-te algo que aprendi ao longo de anos a trabalhar com pessoas:\n\n*Como distinguir fome física de fome emocional:*\n\n• *Fome física* aparece gradualmente, aceita vários alimentos, pára quando estás satisfeito(a)\n• *Fome emocional* aparece de repente, pede alimentos específicos (doces, salgados), e raramente se sacia\n\nUm exercício simples: antes de comeres, põe a mão no peito e pergunta _"estou mesmo com fome ou estou a sentir algo?"_\n\nSe a resposta for emoção — não precisas de comida. Precisas de *presença*. Respirar fundo 3 vezes, beber água, ou simplesmente reconhecer o que sentes já ajuda.\n\nNenhuma dieta ensina isto. Mas é aqui que a mudança real começa.\n\nQueres conversar sobre isto? Responde aqui.\n\n— Vivianne',
    footer: 'Sete Ecos',
    params: (nome) => [nome || ''],
  },

  // Dia 14 — Mitos da nutrição (= email dia 14)
  convite_trial: {
    name: 'sete_ecos_convite_trial',
    language: 'pt_BR',
    category: 'MARKETING',
    header: '3 mitos sobre nutrição',
    body: 'Olá {{1}}! 🌿\n\nHoje quero desmontar 3 mitos que ainda confundem muita gente:\n\n*Mito 1: "Comer gordura engorda"*\nO corpo precisa de gorduras saudáveis para absorver vitaminas (A, D, E, K) e produzir hormonas. O problema não é a gordura — é o excesso de açúcar processado.\n\n*Mito 2: "Preciso de contar calorias"*\nContar calorias ignora a qualidade nutricional. 200 calorias de amendoim não são iguais a 200 calorias de bolachas. O corpo processa-as de forma completamente diferente.\n\n*Mito 3: "Tenho que comer de 3 em 3 horas"*\nIsto depende de cada pessoa. Algumas pessoas funcionam melhor com menos refeições e mais substanciais. Ouvir o corpo é mais importante que seguir regras rígidas.\n\nA nutrição consciente começa por questionar o que nos ensinaram. Se quiseres explorar mais, tens recursos gratuitos aqui:\n\nhttps://app.seteecos.com/lumina\n\n— Vivianne',
    footer: 'Sete Ecos — Sistema de Transmutação Integral',
    buttons: [{ type: 'URL', text: 'Explorar', url: 'https://app.seteecos.com/lumina' }],
    params: (nome) => [nome || ''],
  },

  // Dia 21 — Metabolismo e ciclos (= email dia 21)
  testemunho: {
    name: 'sete_ecos_testemunho',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'O que ninguém te ensinou sobre metabolismo',
    body: 'Olá {{1}}! 💚\n\nSabias que o teu metabolismo não é fixo? Ele muda com:\n\n*Sono* — Dormir menos de 7h aumenta a grelina (hormona da fome) e reduz a leptina (hormona da saciedade). Resultado: mais fome, menos controlo.\n\n*Stress* — Cortisol elevado faz o corpo armazenar gordura abdominal como mecanismo de sobrevivência. Não é preguiça — é biologia.\n\n*Ciclos hormonais* — Se tens ciclo menstrual, a fase lútea (pré-menstrual) aumenta naturalmente o apetite em 200-300 calorias. É normal. Não é falta de disciplina.\n\n*Movimento* — Não precisa de ser ginásio. Caminhar 30 minutos por dia melhora a sensibilidade à insulina e regula o apetite.\n\nO corpo não é o inimigo. Quando o entendes, trabalhas com ele — não contra ele.\n\nhttps://app.seteecos.com/lumina\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Conhecer Melhor o Teu Corpo', url: 'https://app.seteecos.com/lumina' }],
    params: (nome) => [nome || ''],
  },

  // Dia 30 — Integração holística (= email dia 30)
  ultima_chance: {
    name: 'sete_ecos_ultima_chance',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Os 7 Ecos da transformação',
    body: 'Olá {{1}}!\n\nJá passou um mês desde que nos conhecemos. Hoje quero partilhar a visão completa do Sete Ecos.\n\nA transformação real não acontece numa só dimensão. São 7 que se complementam:\n\n🌿 *Corpo* — nutrição consciente, não dietas\n✨ *Valor próprio* — como te vês e te tratas\n💧 *Emoções* — fluir em vez de reprimir\n🔥 *Foco* — escolhas conscientes, não reactivas\n🍃 *Energia* — ritmos que respeitam o teu corpo\n🔊 *Voz* — expressar o que sentes sem medo\n⭐ *Identidade* — saber quem és, além dos papéis\n\nCada pessoa começa pela dimensão que mais precisa. O Lumina (gratuito) ajuda-te a descobrir qual é a tua:\n\nhttps://app.seteecos.com/lumina\n\nSe quiseres conversar sobre a tua jornada, responde aqui.\n\n— Vivianne',
    footer: 'Sete Ecos — Sistema de Transmutação Integral',
    buttons: [{ type: 'URL', text: 'Descobrir o Meu Caminho', url: 'https://app.seteecos.com/lumina' }],
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
    name: 'sete_ecos_marco_v2',
    language: 'pt_BR',
    category: 'UTILITY',
    header: 'Parabéns pelo teu marco!',
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
    name: 'sete_ecos_trial_expirando_v2',
    language: 'pt_BR',
    category: 'UTILITY',
    header: 'O teu trial termina em breve',
    body: 'Olá {{1}}!\n\nO teu período de experimentação no VITALIS termina em *3 dias*.\n\nSe a experiência tem sido útil para ti e quiseres continuar com acesso ao teu plano alimentar, receitas e check-in diário, podes subscrever aqui:\n\nhttps://app.seteecos.com/vitalis/pagamento\n\nSe tiveres dúvidas, responde aqui. Estou disponível para conversar.\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Ver Opções', url: 'https://app.seteecos.com/vitalis/pagamento' }],
    params: (nome) => [nome || ''],
  },

  // Win-back (3+ dias após expirar)
  winback: {
    name: 'sete_ecos_winback_v2',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'O teu progresso está guardado',
    body: 'Olá {{1}}!\n\nA tua subscrição VITALIS expirou, mas quero que saibas: todo o teu progresso está guardado.\n\nSe decidires voltar, retomas exactamente onde paraste — plano alimentar, receitas, histórico de check-ins. Tudo intacto.\n\nhttps://app.seteecos.com/vitalis/pagamento\n\nEstou aqui se precisares de falar.\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Voltar ao Vitalis', url: 'https://app.seteecos.com/vitalis/pagamento' }],
    params: (nome) => [nome || ''],
  },

  // ===== BROADCASTS MANUAIS =====

  follow_up: {
    name: 'sete_ecos_follow_up',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Como estás?',
    body: 'Olá {{1}}! 🤗\n\nPassaste por aqui há uns dias e quero saber como estás.\n\nSe tiveres alguma dúvida sobre nutrição, bem-estar ou qualquer tema que partilhei, responde aqui. Estou sempre disponível para conversar.\n\n— Vivianne',
    footer: 'Sete Ecos — Transmutação Integral',
    params: (nome) => [nome || ''],
  },

  dica_nutricional: {
    name: 'sete_ecos_dica_nutricional',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Dica de nutrição',
    body: 'Olá {{1}}!\n\nSabias que o intestino produz cerca de 90% da serotonina do corpo? A serotonina é a hormona do bem-estar.\n\nIsto significa que o que comes afecta directamente como te sentes emocionalmente. Alimentos ricos em fibra (vegetais, leguminosas, fruta) alimentam as bactérias boas do intestino — e elas retribuem com mais equilíbrio emocional.\n\nUm passo simples: inclui uma porção de leguminosas (feijão, lentilha, grão) na tua refeição principal hoje.\n\nSe quiseres aprofundar este tema, tens o Lumina disponível:\nhttps://app.seteecos.com/lumina\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Explorar Lumina', url: 'https://app.seteecos.com/lumina' }],
    params: (nome) => [nome || ''],
  },

  novidade: {
    name: 'sete_ecos_novidade',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Novidades Sete Ecos!',
    body: 'Olá {{1}}!\n\nTemos novidades no Sete Ecos — novos recursos e conteúdos educativos que aprofundam a tua jornada de autoconhecimento.\n\nPassa pela app para explorar: https://app.seteecos.com\n\nSe tiveres dúvidas ou quiseres saber mais, responde aqui.\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Explorar Novidades', url: 'https://app.seteecos.com' }],
    params: (nome) => [nome || ''],
  },

  // Novidade: atualizar plano via WhatsApp
  novidade_wa_plano: {
    name: 'sete_ecos_novidade_wa_plano',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Novidade: atualiza o teu plano por WhatsApp!',
    body: 'Olá {{1}}!\n\nAgora podes atualizar os teus dados do VITALIS directamente por WhatsApp. Sem abrir a app!\n\nÉ só mandares mensagem para o número *+258 85 100 6473* com:\n• *peso 72kg* — para atualizar o teu peso\n• *sem glúten* — para adicionar uma restrição\n• *tirar lactose* — para remover uma restrição\n• *3x semana* — para mudar o nível de atividade\n• *4 refeições* — para mudar o número de refeições\n• *quero emagrecer* — para mudar o objetivo\n\nEu confirmo contigo antes de mudar. Depois revejo e ajusto o teu plano.\n\nExperimenta agora — manda o teu peso actual para o +258 85 100 6473!\n\n— Vivianne',
    footer: 'Sete Ecos — VITALIS',
    params: (nome) => [nome || ''],
  },

  // Curiosidade semanal (exercício educativo)
  curiosidade: {
    name: 'sete_ecos_edu_consciencia_alimentar',
    language: 'pt_BR',
    category: 'MARKETING',
    header: 'Comes por fome ou por emoção?',
    body: 'Olá {{1}}!\n\nFaz este exercício: antes de comeres algo, põe a mão no peito e pergunta _"estou mesmo com fome ou estou a sentir algo?"_\n\nSe a resposta for "estou a sentir algo" — parabéns, acabaste de desenvolver uma competência que a maioria das pessoas nunca treina: a consciência alimentar.\n\nÉ este padrão inconsciente que perpetua o efeito ioiô. Não é a comida. É a emoção por trás da comida.\n\nDa próxima vez que isto acontecer, experimenta: respira fundo 3 vezes, bebe um copo de água, e espera 5 minutos. Se a fome passar, era emocional. Se continuar, come com tranquilidade.\n\nSe quiseres aprofundar, o Lumina ajuda-te a mapear estes padrões:\nhttps://app.seteecos.com/lumina\n\n— Vivianne',
    footer: 'Sete Ecos',
    buttons: [{ type: 'URL', text: 'Conhecer os Meus Padrões', url: 'https://app.seteecos.com/lumina' }],
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
