/**
 * API Endpoint: Tarefas Agendadas
 *
 * Este endpoint é chamado por um cron job para:
 * 1. Enviar lembretes a clientes inativas (2+ dias sem check-in)
 * 2. Enviar avisos de expiração (7 dias antes)
 * 3. Enviar resumo diário à coach
 *
 * Configurar no vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/tarefas-agendadas",
 *     "schedule": "0 19 * * *"  // 19h UTC = 21h Moçambique
 *   }]
 * }
 */

import { createClient } from '@supabase/supabase-js';
import { enviarMensagemWA } from './whatsapp-broadcast.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
// Coach email - configurável via Vercel ENV
const COACH_EMAIL = process.env.COACH_EMAIL || 'viv.saraiva@gmail.com';

// WhatsApp config via Meta Cloud API (produção)
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VIVIANNE_PERSONAL_NUMBER = (process.env.VIVIANNE_PERSONAL_NUMBER || '').trim();
const COACH_WHATSAPP_NUMBER = VIVIANNE_PERSONAL_NUMBER
  ? VIVIANNE_PERSONAL_NUMBER.replace(/[^0-9]/g, '')
  : '258851006473';

export default async function handler(req, res) {
  // Auth centralizada no api/cron.js dispatcher

  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Configuração em falta');
    return res.status(500).json({ error: 'Configuração em falta' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const resultados = {
    lembretes: 0,
    expiracoes: 0,
    curiosidade: 0,
    marcos: 0,
    winback: 0,
    wa_enviados: 0,
    resumo: false,
    erros: []
  };

  try {
    // 1. LEMBRETES PARA CLIENTES INATIVAS (email + WhatsApp)
    await enviarLembretes(supabase, resultados);

    // 2. AVISOS DE EXPIRAÇÃO (email + WhatsApp trial)
    await enviarAvisosExpiracao(supabase, resultados);

    // 3. MARCOS — celebração de streaks (WhatsApp)
    await enviarMarcos(supabase, resultados);

    // 3b. MARCOS DE PESO — celebrar perda de peso significativa
    await enviarMarcosPeso(supabase, resultados);

    // 4. WIN-BACK — clientes com subscrição expirada (WhatsApp)
    await enviarWinback(supabase, resultados);

    // 5. CURIOSIDADE INSANA - users registados sem subscrição
    await enviarCuriosidadeInsana(supabase, resultados);

    // 6. RESUMO DIÁRIO PARA COACH
    await enviarResumoDiario(supabase, resultados);

    return res.status(200).json({
      success: true,
      ...resultados
    });

  } catch (error) {
    console.error('Erro nas tarefas agendadas:', error);
    return res.status(500).json({
      error: 'Erro ao executar tarefas',
      detalhes: error.message
    });
  }
}

/**
 * Enviar lembretes motivacionais a clientes inativas
 * - 2-4 dias: lembrete suave
 * - 5+ dias: email provocador com curiosidade + WhatsApp direto
 */
async function enviarLembretes(supabase, resultados) {
  const doisDiasAtras = new Date();
  doisDiasAtras.setDate(doisDiasAtras.getDate() - 2);

  const { data: clientes, error } = await supabase
    .from('vitalis_clients')
    .select(`
      id,
      user_id,
      users!inner(id, nome, email, auth_id)
    `)
    .in('subscription_status', ['active', 'trial', 'tester']);

  if (error) {
    resultados.erros.push('Erro ao buscar clientes: ' + error.message);
    return;
  }

  for (const cliente of clientes || []) {
    try {
      const { data: ultimoRegisto } = await supabase
        .from('vitalis_registos')
        .select('created_at')
        .eq('user_id', cliente.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const ultimaActividade = ultimoRegisto?.created_at
        ? new Date(ultimoRegisto.created_at)
        : null;

      if (!ultimaActividade || ultimaActividade < doisDiasAtras) {
        const diasInactiva = ultimaActividade
          ? Math.floor((new Date() - ultimaActividade) / (1000 * 60 * 60 * 24))
          : 10;

        const hoje = new Date().toISOString().split('T')[0];

        // Motivação intensa: limitar a 1x a cada 3 dias (evitar spam diário)
        // Lembrete check-in: manter 1x por dia
        const tipoVerificacao = diasInactiva >= 5 ? 'motivacao-intensa' : 'lembrete-checkin';
        let dedupDesde = hoje;
        if (diasInactiva >= 5) {
          const tresDiasAtrasDedup = new Date();
          tresDiasAtrasDedup.setDate(tresDiasAtrasDedup.getDate() - 3);
          dedupDesde = tresDiasAtrasDedup.toISOString();
        }

        const { data: jaEnviado } = await supabase
          .from('vitalis_email_log')
          .select('id')
          .eq('user_id', cliente.user_id)
          .eq('tipo', tipoVerificacao)
          .gte('created_at', dedupDesde)
          .limit(1);

        if (!jaEnviado || jaEnviado.length === 0) {
          const tipoEmail = diasInactiva >= 5 ? 'motivacao-intensa' : 'lembrete-checkin';

          await enviarEmail(tipoEmail, cliente.users.email, {
            nome: cliente.users.nome || 'Querida',
            dias: diasInactiva
          });

          await supabase.from('vitalis_email_log').insert({
            user_id: cliente.user_id,
            tipo: tipoEmail,
            destinatario: cliente.users.email
          });

          resultados.lembretes++;

          // Enviar também via WhatsApp (template apropriado)
          const waTemplate = diasInactiva >= 5 ? 'motivacao' : 'checkin_lembrete';
          await enviarWACliente(supabase, cliente.user_id, waTemplate, {
            nome: cliente.users.nome || '',
          }, resultados);
        }
      }
    } catch (err) {
      resultados.erros.push(`Erro lembrete ${cliente.users?.email}: ${err.message}`);
    }
  }
}

/**
 * Enviar avisos a clientes cuja subscrição expira em 7 dias
 */
async function enviarAvisosExpiracao(supabase, resultados) {
  const seteDias = new Date();
  seteDias.setDate(seteDias.getDate() + 7);
  const seisDias = new Date();
  seisDias.setDate(seisDias.getDate() + 6);

  // Buscar clientes que expiram em ~7 dias
  const { data: clientes, error } = await supabase
    .from('vitalis_clients')
    .select(`
      id,
      user_id,
      subscription_expires,
      users!inner(id, nome, email)
    `)
    .eq('subscription_status', 'active')
    .gte('subscription_expires', seisDias.toISOString())
    .lte('subscription_expires', seteDias.toISOString());

  if (error) {
    resultados.erros.push('Erro ao buscar expirações: ' + error.message);
    return;
  }

  for (const cliente of clientes || []) {
    try {
      const hoje = new Date().toISOString().split('T')[0];

      // Verificar se já enviámos este aviso
      const { data: jaEnviado } = await supabase
        .from('vitalis_email_log')
        .select('id')
        .eq('user_id', cliente.user_id)
        .eq('tipo', 'expiracao-aviso')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (!jaEnviado || jaEnviado.length === 0) {
        const diasRestantes = Math.ceil(
          (new Date(cliente.subscription_expires) - new Date()) / (1000 * 60 * 60 * 24)
        );

        await enviarEmail('expiracao-aviso', cliente.users.email, {
          nome: cliente.users.nome || 'Querida',
          dias: diasRestantes
        });

        await supabase.from('vitalis_email_log').insert({
          user_id: cliente.user_id,
          tipo: 'expiracao-aviso',
          destinatario: cliente.users.email
        });

        resultados.expiracoes++;

        // WhatsApp trial/subscrição a expirar
        await enviarWACliente(supabase, cliente.user_id, 'trial_expirando', {
          nome: cliente.users.nome || '',
        }, resultados);
      }
    } catch (err) {
      resultados.erros.push(`Erro expiração ${cliente.users?.email}: ${err.message}`);
    }
  }
}

/**
 * Enviar resumo diário para a coach
 * Inclui: clientes activas, quem fez check-in, quem não fez, alertas, novas
 */
async function enviarResumoDiario(supabase, resultados) {
  const hoje = new Date().toISOString().split('T')[0];
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  const ontemStr = ontem.toISOString().split('T')[0];

  try {
    // Buscar dados completos para um relatório útil
    const [
      { data: clientesActivas, count: totalClientes },
      { data: checkinsHoje },
      { count: espacoRetornoHoje },
      { data: novasClientes },
      { data: todosClientes }
    ] = await Promise.all([
      // Clientes com subscrição activa (com nome)
      supabase.from('vitalis_clients')
        .select('user_id, users!inner(nome, email)', { count: 'exact' })
        .in('subscription_status', ['active', 'tester', 'trial']),
      // Check-ins de hoje
      supabase.from('vitalis_registos')
        .select('user_id, aderencia_1a10, users!inner(nome)')
        .eq('data', hoje),
      // Alertas espaço retorno hoje
      supabase.from('vitalis_espaco_retorno')
        .select('id', { count: 'exact' })
        .gte('created_at', ontem.toISOString()),
      // Novas clientes (últimas 24h)
      supabase.from('vitalis_clients')
        .select('users!inner(nome, email)')
        .gte('created_at', ontem.toISOString()),
      // Todos os clientes activos para cruzar com check-ins (inclui peso)
      supabase.from('vitalis_clients')
        .select('user_id, peso_inicial, peso_actual, peso_meta, users!inner(nome)')
        .in('subscription_status', ['active', 'tester', 'trial'])
    ]);

    // Determinar quem fez e quem não fez check-in
    const userIdsComCheckin = new Set((checkinsHoje || []).map(c => c.user_id));
    const fizeram = (checkinsHoje || []).map(c => {
      const nome = c.users?.nome?.split(' ')[0] || '?';
      return `${nome} (${c.aderencia_1a10}/10)`;
    });
    const naoFizeram = (todosClientes || [])
      .filter(c => !userIdsComCheckin.has(c.user_id))
      .map(c => c.users?.nome?.split(' ')[0] || '?');

    // Progresso de peso de cada cliente
    const progressoPeso = (todosClientes || [])
      .filter(c => c.peso_inicial && c.peso_actual && c.peso_inicial > c.peso_actual)
      .map(c => {
        const nome = c.users?.nome?.split(' ')[0] || '?';
        const perdido = (c.peso_inicial - c.peso_actual).toFixed(1);
        const restante = c.peso_meta ? (c.peso_actual - c.peso_meta).toFixed(1) : '?';
        return { nome, perdido, restante, actual: c.peso_actual, meta: c.peso_meta };
      });

    const dadosResumo = {
      data: new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }),
      totalClientes: totalClientes || 0,
      checkinsHoje: checkinsHoje?.length || 0,
      alertasHoje: espacoRetornoHoje || 0,
      novasClientes: novasClientes?.length || 0,
      clientesLista: novasClientes?.map(c => c.users?.nome || c.users?.email).join(', ') || '',
      fizeramCheckin: fizeram,
      naoFizeramCheckin: naoFizeram,
      progressoPeso
    };

    await enviarEmail('coach-resumo-diario', COACH_EMAIL, dadosResumo);

    // WhatsApp resumo diário
    const linhasFizeram = fizeram.length > 0 ? `\n✅ *Fizeram check-in:*\n${fizeram.join('\n')}` : '\n❌ Ninguém fez check-in hoje';
    const linhasNaoFizeram = naoFizeram.length > 0 ? `\n⏳ *Sem check-in:*\n${naoFizeram.join(', ')}` : '';
    const linhasPeso = progressoPeso.length > 0
      ? `\n⚖️ *Progresso de peso:*\n${progressoPeso.map(p => `${p.nome}: -${p.perdido}kg (actual: ${p.actual}kg${p.meta ? ` → meta: ${p.meta}kg` : ''})`).join('\n')}`
      : '';

    await enviarWhatsAppCoach(`📊 *RESUMO VITALIS* — ${dadosResumo.data}

👥 Clientes activas: ${dadosResumo.totalClientes}
✅ Check-ins hoje: ${dadosResumo.checkinsHoje}/${dadosResumo.totalClientes}
⚠️ Alertas: ${dadosResumo.alertasHoje}
🆕 Novas: ${dadosResumo.novasClientes}${dadosResumo.novasClientes > 0 ? ` (${dadosResumo.clientesLista})` : ''}
${linhasFizeram}${linhasNaoFizeram}${linhasPeso}

Boa noite! 🌙`);

    resultados.resumo = true;
  } catch (err) {
    resultados.erros.push('Erro resumo diário: ' + err.message);
  }
}

/**
 * Helper: enviar WA template a um cliente activo (busca telefone do intake)
 */
async function enviarWACliente(supabase, userId, template, options, resultados) {
  try {
    const { data: intake } = await supabase
      .from('vitalis_intake')
      .select('whatsapp')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!intake?.whatsapp) return;

    // Deduplicação: verificar se já enviámos este template hoje
    const hoje = new Date().toISOString().split('T')[0];
    try {
      const { data: jaEnviado } = await supabase
        .from('whatsapp_broadcast_log')
        .select('id')
        .eq('telefone', intake.whatsapp.replace(/[^0-9]/g, ''))
        .eq('tipo', `cron-cliente-${template}`)
        .gte('created_at', hoje)
        .limit(1);

      if (jaEnviado && jaEnviado.length > 0) return;
    } catch (_) { /* tabela pode não existir */ }

    const result = await enviarMensagemWA(intake.whatsapp, '', {
      template,
      nome: options.nome || '',
      ...(options.dias ? { dias: options.dias } : {}),
    });

    if (result.ok) resultados.wa_enviados++;

    // Log
    try {
      await supabase.from('whatsapp_broadcast_log').insert({
        telefone: intake.whatsapp.replace(/[^0-9]/g, ''),
        mensagem: `[cron:cliente][template:${template}]`,
        tipo: `cron-cliente-${template}`,
        status: result.ok ? 'enviado' : 'erro',
        erro: result.ok ? null : result.error,
        message_id: result.messageId || null,
      });
    } catch (_) { /* tabela pode não existir */ }
  } catch (_) {
    // Silently fail — WA é complementar ao email
  }
}

/**
 * Celebrar marcos de consistência (7, 30, 90 dias de check-ins)
 * Envia WA de parabéns quando o cliente atinge um marco
 */
async function enviarMarcos(supabase, resultados) {
  const MARCOS = [7, 30, 90];

  const { data: clientes, error } = await supabase
    .from('vitalis_clients')
    .select(`
      id,
      user_id,
      users!inner(id, nome, email)
    `)
    .in('subscription_status', ['active', 'trial', 'tester']);

  if (error || !clientes) return;

  for (const cliente of clientes) {
    try {
      // Contar check-ins consecutivos recentes
      const { data: registos } = await supabase
        .from('vitalis_registos')
        .select('created_at')
        .eq('user_id', cliente.user_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!registos || registos.length === 0) continue;

      // Contar dias únicos de check-in
      const diasUnicos = new Set();
      for (const r of registos) {
        diasUnicos.add(new Date(r.created_at).toISOString().split('T')[0]);
      }

      const totalDias = diasUnicos.size;

      // Verificar se atingiu um marco exacto
      const marco = MARCOS.find(m => totalDias === m);
      if (!marco) continue;

      // Verificar se já celebrámos este marco
      try {
        const { data: jaEnviado } = await supabase
          .from('whatsapp_broadcast_log')
          .select('id')
          .eq('tipo', `cron-cliente-marco_celebracao`)
          .like('mensagem', `%marco:${marco}%`)
          .limit(1);

        // Buscar por telefone do intake
        const { data: intake } = await supabase
          .from('vitalis_intake')
          .select('whatsapp')
          .eq('user_id', cliente.user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!intake?.whatsapp) continue;

        const tel = intake.whatsapp.replace(/[^0-9]/g, '');
        const { data: jaEnviadoTel } = await supabase
          .from('whatsapp_broadcast_log')
          .select('id')
          .eq('telefone', tel)
          .eq('tipo', 'cron-cliente-marco_celebracao')
          .like('mensagem', `%marco:${marco}%`)
          .limit(1);

        if (jaEnviadoTel && jaEnviadoTel.length > 0) continue;

        const result = await enviarMensagemWA(intake.whatsapp, '', {
          template: 'marco_celebracao',
          nome: cliente.users.nome || '',
          dias: marco,
        });

        if (result.ok) resultados.marcos++;

        await supabase.from('whatsapp_broadcast_log').insert({
          telefone: tel,
          mensagem: `[cron:cliente][template:marco_celebracao][marco:${marco}]`,
          tipo: 'cron-cliente-marco_celebracao',
          status: result.ok ? 'enviado' : 'erro',
          erro: result.ok ? null : result.error,
          message_id: result.messageId || null,
        });
      } catch (_) { /* tabela pode não existir */ }
    } catch (_) {
      // Skip individual errors
    }
  }
}

/**
 * Celebrar marcos de perda de peso
 * Verifica peso_inicial vs peso_actual e envia WA + notifica coach
 */
async function enviarMarcosPeso(supabase, resultados) {
  const MARCOS_PESO = [
    { kg: 1, id: 'peso_1kg', emoji: '⚖️', msg: 'Perdeste o teu primeiro quilo' },
    { kg: 5, id: 'peso_5kg', emoji: '🎯', msg: 'Perdeste 5kg — estás em transformação' },
    { kg: 10, id: 'peso_10kg', emoji: '🦋', msg: 'Perdeste 10kg — és uma nova pessoa' },
  ];

  const { data: clientes, error } = await supabase
    .from('vitalis_clients')
    .select(`
      id,
      user_id,
      peso_inicial,
      peso_actual,
      peso_meta,
      users!inner(id, nome, email)
    `)
    .in('subscription_status', ['active', 'trial', 'tester'])
    .not('peso_inicial', 'is', null)
    .not('peso_actual', 'is', null);

  if (error || !clientes) return;

  const alertasCoach = [];

  for (const cliente of clientes) {
    try {
      if (!cliente.peso_inicial || !cliente.peso_actual) continue;
      const pesoPerdido = cliente.peso_inicial - cliente.peso_actual;
      if (pesoPerdido < 1) continue;

      const nome = cliente.users?.nome?.split(' ')[0] || '?';

      // Verificar se atingiu peso meta
      if (cliente.peso_meta && cliente.peso_actual <= cliente.peso_meta) {
        const marcoId = `peso_meta_${cliente.user_id}`;
        const jaNotificado = await verificarMarcoNotificado(supabase, cliente.user_id, 'peso_meta');
        if (!jaNotificado) {
          alertasCoach.push(`🎉 *${nome}* ATINGIU O PESO META! (${cliente.peso_actual}kg — objectivo era ${cliente.peso_meta}kg)`);
          await registarMarcoNotificado(supabase, cliente.user_id, 'peso_meta');
          await enviarWACliente(supabase, cliente.user_id, 'marco_celebracao', {
            nome: cliente.users.nome || '',
            dias: 0,
          }, resultados);
        }
      }

      // Verificar marcos de kg perdidos
      for (const marco of MARCOS_PESO) {
        if (pesoPerdido >= marco.kg) {
          const jaNotificado = await verificarMarcoNotificado(supabase, cliente.user_id, marco.id);
          if (!jaNotificado) {
            alertasCoach.push(`${marco.emoji} *${nome}* perdeu ${pesoPerdido.toFixed(1)}kg (marco: ${marco.kg}kg)`);
            await registarMarcoNotificado(supabase, cliente.user_id, marco.id);
            await enviarWACliente(supabase, cliente.user_id, 'marco_celebracao', {
              nome: cliente.users.nome || '',
              dias: marco.kg,
            }, resultados);
          }
        }
      }
    } catch (_) {
      // Skip individual errors
    }
  }

  // Notificar coach sobre marcos de peso do dia
  if (alertasCoach.length > 0) {
    await enviarWhatsAppCoach(`🏆 *MARCOS DE PESO HOJE*\n\n${alertasCoach.join('\n')}\n\nParabéns às tuas clientes! 🎉`);
    resultados.marcos += alertasCoach.length;
  }
}

async function verificarMarcoNotificado(supabase, userId, marcoId) {
  try {
    const { data } = await supabase
      .from('vitalis_email_log')
      .select('id')
      .eq('user_id', userId)
      .eq('tipo', `marco-peso-${marcoId}`)
      .limit(1);
    return data && data.length > 0;
  } catch (_) {
    return false;
  }
}

async function registarMarcoNotificado(supabase, userId, marcoId) {
  try {
    await supabase.from('vitalis_email_log').insert({
      user_id: userId,
      tipo: `marco-peso-${marcoId}`,
      destinatario: 'coach-notification'
    });
  } catch (_) {
    // Tabela pode não ter estas colunas
  }
}

/**
 * Win-back: clientes com subscrição expirada há 3+ dias
 * Envia WA convidando a voltar com código de desconto
 */
async function enviarWinback(supabase, resultados) {
  const tresDiasAtras = new Date();
  tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

  const { data: clientes, error } = await supabase
    .from('vitalis_clients')
    .select(`
      id,
      user_id,
      subscription_expires,
      users!inner(id, nome, email)
    `)
    .eq('subscription_status', 'expired')
    .gte('subscription_expires', trintaDiasAtras.toISOString())
    .lte('subscription_expires', tresDiasAtras.toISOString());

  if (error || !clientes) return;

  for (const cliente of clientes) {
    try {
      // Limitar win-back a 1x por semana (evitar spam diário)
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
      const { data: jaEnviado } = await supabase
        .from('vitalis_email_log')
        .select('id')
        .eq('user_id', cliente.user_id)
        .eq('tipo', 'winback')
        .gte('created_at', seteDiasAtras.toISOString())
        .limit(1);

      if (jaEnviado && jaEnviado.length > 0) continue;

      const waAntes = resultados.wa_enviados;
      await enviarWACliente(supabase, cliente.user_id, 'winback', {
        nome: cliente.users.nome || '',
      }, resultados);

      if (resultados.wa_enviados > waAntes) {
        resultados.winback++;
        // Registar para deduplicação semanal
        try {
          await supabase.from('vitalis_email_log').insert({
            user_id: cliente.user_id,
            tipo: 'winback',
            destinatario: cliente.users.email || 'whatsapp'
          });
        } catch (_) { /* tabela pode não ter estas colunas */ }
      }
    } catch (_) {
      // Skip individual errors
    }
  }
}

/**
 * Enviar email de curiosidade insana a utilizadores registados sem subscrição
 * Targeteia users que fizeram Lumina mas nunca subscreveram Vitalis
 * Envia 1x por semana (quartas-feiras)
 */
async function enviarCuriosidadeInsana(supabase, resultados) {
  // Só executa às quartas-feiras
  const hoje = new Date();
  if (hoje.getDay() !== 3) return; // 3 = quarta-feira

  const WHATSAPP_CHATBOT = 'https://wa.me/258851006473';
  const CODIGO_PROMO = 'VEMVITALIS20';

  // Hooks rotativos - cada semana um diferente
  const semanaDoAno = Math.ceil((hoje - new Date(hoje.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
  const CURIOSIDADES = [
    {
      assunto: 'Comes por fome ou por emoção? (faz este teste mental)',
      hook: 'Faz este exercício: antes de comeres algo, põe a mão no peito e pergunta "estou mesmo com fome ou estou a sentir algo?"',
      corpo: 'Se a resposta for "estou a sentir algo" - parabéns, acabaste de descobrir o padrão que 87% das pessoas ignoram. É este padrão que faz o efeito ioiô. Não é a comida. É a emoção.',
      cta: 'O VITALIS tem uma ferramenta única chamada Espaço de Retorno — feita exatamente para estes momentos. Nenhum outro programa no mundo tem isto.'
    },
    {
      assunto: 'A verdade sobre a xima que ninguém te diz',
      hook: 'Disseram-te a vida inteira que a xima engorda. É mentira. O que engorda é o desequilíbrio no prato — e a maioria das pessoas não sabe como equilibrar.',
      corpo: 'Uma mão fechada de xima + uma palma de caril de peixe + um punho de matapa = a refeição perfeita. Sem contar calorias. Sem apps complicadas. Só as tuas mãos.',
      cta: 'No VITALIS ensinamos-te o Método da Mão — medir porções com o que já tens. Simples, científico e feito para a comida moçambicana.'
    },
    {
      assunto: 'Porque é que perdes peso e ganhas tudo de volta?',
      hook: 'Já reparaste que quanto mais restritiva é a dieta, mais peso ganhas depois? Não é falta de disciplina. É biologia.',
      corpo: 'Quando cortas calorias drasticamente, o teu metabolismo desacelera. O corpo entra em modo de sobrevivência. Quando voltas a comer normal, ele armazena TUDO como gordura. É o teu corpo a proteger-te.',
      cta: 'O VITALIS não é uma dieta. É uma reeducação alimentar em 3 fases que respeita o teu metabolismo. Resultado: perda sustentável, sem efeito ioiô.'
    },
    {
      assunto: 'O que acontece no teu corpo quando comes por culpa',
      hook: 'Comeste algo "proibido" e sentiste culpa? Essa culpa dispara cortisol. O cortisol aumenta o apetite e armazena gordura abdominal. Ou seja: a culpa engorda mais que a comida.',
      corpo: 'Isto não é opinião. É ciência (Precision Nutrition). A relação emocional com a comida afeta diretamente o teu peso. E nenhuma dieta resolve isso.',
      cta: 'No VITALIS trabalhamos corpo E emoção. Plano alimentar + Espaço de Retorno. Porque não basta mudar o prato — é preciso mudar a relação.'
    },
  ];

  const curiosidade = CURIOSIDADES[semanaDoAno % CURIOSIDADES.length];

  try {
    // Buscar users que fizeram Lumina mas NÃO tem subscrição Vitalis
    const { data: users } = await supabase
      .from('users')
      .select('id, nome, email');

    if (!users || users.length === 0) return;

    // Filtrar: tem Lumina mas não tem Vitalis ativo
    for (const user of users) {
      try {
        const { data: vitalisClient } = await supabase
          .from('vitalis_clients')
          .select('subscription_status')
          .eq('user_id', user.id)
          .maybeSingle();

        // Se já tem subscrição ativa, skip
        if (vitalisClient && ['active', 'trial', 'tester'].includes(vitalisClient.subscription_status)) continue;

        // Verificar se tem Lumina
        const { count: luminaCount } = await supabase
          .from('lumina_checkins')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (!luminaCount || luminaCount === 0) continue;

        // Verificar se já enviámos esta semana
        const inicioSemana = new Date();
        inicioSemana.setDate(inicioSemana.getDate() - 7);

        const { data: jaEnviado } = await supabase
          .from('vitalis_email_log')
          .select('id')
          .eq('user_id', user.id)
          .eq('tipo', 'curiosidade-insana')
          .gte('created_at', inicioSemana.toISOString())
          .limit(1);

        if (jaEnviado && jaEnviado.length > 0) continue;

        // Enviar email de curiosidade
        const nome = user.nome || '';

        await enviarEmail('curiosidade-insana', user.email, {
          nome,
          dias: 0,
          curiosidade
        });

        await supabase.from('vitalis_email_log').insert({
          user_id: user.id,
          tipo: 'curiosidade-insana',
          destinatario: user.email
        });

        resultados.curiosidade++;
      } catch {
        // Skip individual user errors
      }
    }
  } catch (err) {
    resultados.erros.push('Erro curiosidade insana: ' + err.message);
  }
}

/**
 * Envia WhatsApp para a coach via Meta Cloud API (produção)
 */
async function enviarWhatsAppCoach(mensagem) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.log('Meta WhatsApp API não configurada — WhatsApp não enviado');
    return false;
  }
  if (!COACH_WHATSAPP_NUMBER) {
    console.log('VIVIANNE_PERSONAL_NUMBER não configurado — WhatsApp não enviado');
    return false;
  }
  try {
    const url = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: COACH_WHATSAPP_NUMBER,
        type: 'text',
        text: { body: mensagem },
      }),
    });
    if (!response.ok) {
      const err = await response.json();
      console.error('Erro Meta API (tarefas):', err?.error?.message || JSON.stringify(err));
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erro WhatsApp Meta (tarefas):', err.message);
    return false;
  }
}

/**
 * Função auxiliar para enviar email via Resend
 */
async function enviarEmail(tipo, destinatario, dados) {
  const WHATSAPP_LINK = 'https://wa.me/258851006473?text=Ola%20Vivianne%2C%20preciso%20de%20motivação';

  const templates = {
    'lembrete-checkin': {
      assunto: `${dados.nome}, sentimos a tua falta no Vitalis`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://app.seteecos.com/logos/VITALIS_LOGO_V3.png" alt="Vitalis" style="height: 60px;">
          </div>
          <h1 style="color: #7C8B6F; font-size: 24px; text-align: center;">Olá ${dados.nome}</h1>
          <p style="color: #4A4035; font-size: 16px; line-height: 1.6; text-align: center;">
            Já lá vão <strong>${dados.dias} dias</strong> desde o teu último registo no Vitalis.
          </p>
          <p style="color: #6B5C4C; font-size: 14px; text-align: center; margin: 20px 0;">
            Sabemos que a vida acontece, mas cada pequeno passo conta.<br>
            Que tal registares algo hoje? Mesmo que seja só a água.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.seteecos.com/vitalis/dashboard"
               style="background: #7C8B6F; color: white; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-weight: 600;">
              Voltar ao Vitalis
            </a>
          </div>
          <div style="background: #25D366; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="color: white; font-weight: bold; margin: 0 0 8px;">Precisas de apoio? Fala comigo!</p>
            <a href="${WHATSAPP_LINK}" style="display: inline-block; padding: 10px 24px; background: white; color: #25D366; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 14px;">Abrir WhatsApp</a>
          </div>
          <p style="color: #9CAF88; font-size: 12px; text-align: center; margin-top: 40px;">
            Estou aqui contigo<br>
            - Vivianne
          </p>
        </div>
      `
    },
    'motivacao-intensa': {
      assunto: `${dados.nome}, preciso de te dizer uma coisa importante`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #FAF6F0;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://app.seteecos.com/logos/VITALIS_LOGO_V3.png" alt="Vitalis" style="height: 50px;">
          </div>

          <h1 style="color: #4A4035; font-size: 22px; text-align: center; line-height: 1.4;">${dados.nome}, sei que estes ${dados.dias} dias não foram fáceis.</h1>

          <div style="background: #2C2C2C; color: white; padding: 24px; border-radius: 12px; margin: 20px 0;">
            <p style="font-size: 18px; font-style: italic; line-height: 1.6; margin: 0; text-align: center;">"A diferença entre quem transforma o corpo e quem desiste não é força de vontade. É ter alguém que não desiste de ti."</p>
          </div>

          <p style="color: #6B5C4C; font-size: 15px; line-height: 1.8; text-align: center;">Eu não desisti de ti. E não vou desistir.</p>

          <p style="color: #6B5C4C; font-size: 15px; line-height: 1.8;">Sabes o que acontece quando paras?</p>
          <ul style="color: #6B5C4C; font-size: 14px; line-height: 2;">
            <li>O teu metabolismo começa a desacelerar de novo</li>
            <li>Os padrões emocionais voltam silenciosamente</li>
            <li>A culpa aumenta - e a culpa engorda mais que a comida</li>
          </ul>

          <p style="color: #6B5C4C; font-size: 15px; line-height: 1.8;">Mas sabes o que acontece quando <strong>voltas hoje</strong>?</p>
          <div style="background: white; padding: 16px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #7C8B6F;">
            <p style="color: #4A4035; margin: 4px 0;">Todo o teu progresso anterior está guardado</p>
            <p style="color: #4A4035; margin: 4px 0;">Retomas exatamente onde paraste</p>
            <p style="color: #4A4035; margin: 4px 0;">Um check-in de 30 segundos já é uma vitória</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.seteecos.com/vitalis/dashboard"
               style="display: inline-block; background: linear-gradient(135deg, #7C8B6F, #5a6b4f); color: white; padding: 16px 36px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Fazer o Meu Check-in Agora
            </a>
          </div>

          <div style="background: #25D366; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="color: white; font-weight: bold; margin: 0 0 4px; font-size: 16px;">Queres falar sobre o que te está a travar?</p>
            <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin: 0 0 12px;">Estou aqui para ouvir, sem julgamento</p>
            <a href="${WHATSAPP_LINK}" style="display: inline-block; padding: 12px 28px; background: white; color: #25D366; border-radius: 20px; text-decoration: none; font-weight: bold;">Falar com a Vivianne no WhatsApp</a>
          </div>

          <p style="color: #6B5C4C; font-size: 14px; text-align: center; margin-top: 20px;">
            Com todo o carinho,<br><strong>Vivianne</strong>
          </p>
        </div>
      `
    },
    'curiosidade-insana': {
      assunto: `${dados.curiosidade?.assunto || dados.nome + ', descobri algo que precisas de saber'}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #FAF6F0;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://app.seteecos.com/logos/VITALIS_LOGO_V3.png" alt="Vitalis" style="height: 50px;">
          </div>
          <h1 style="color: #4A4035; font-size: 22px; line-height: 1.4;">${dados.nome},</h1>
          <div style="background: #2C2C2C; color: white; padding: 24px; border-radius: 12px; margin: 20px 0;">
            <p style="font-size: 17px; line-height: 1.7; margin: 0;">${dados.curiosidade?.hook || ''}</p>
          </div>
          <p style="color: #6B5C4C; font-size: 15px; line-height: 1.8;">${dados.curiosidade?.corpo || ''}</p>
          <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #7C8B6F;">
            <p style="color: #4A4035; font-size: 15px; line-height: 1.7; margin: 0;">${dados.curiosidade?.cta || ''}</p>
          </div>
          <div style="background: linear-gradient(135deg, #FF6B6B, #EE5A24); border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="color: white; font-size: 11px; letter-spacing: 2px; margin: 0;">CÓDIGO EXCLUSIVO</p>
            <p style="color: white; font-size: 28px; font-weight: bold; letter-spacing: 3px; margin: 4px 0;">VEMVITALIS20</p>
            <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">20% de desconto</p>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20&utm_source=email&utm_medium=curiosidade&utm_campaign=semanal"
               style="display: inline-block; background: #7C8B6F; color: white; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-weight: bold;">
              Começar com 20% Off
            </a>
          </div>
          <div style="background: #25D366; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="color: white; font-weight: bold; margin: 0 0 8px;">Tens dúvidas? Fala comigo!</p>
            <a href="https://wa.me/258851006473" style="display: inline-block; padding: 10px 24px; background: white; color: #25D366; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 14px;">Abrir WhatsApp</a>
          </div>
          <p style="color: #6B5C4C; font-size: 13px; text-align: center;">Vivianne Saraiva<br>Criadora do Sete Ecos</p>
        </div>
      `
    },
    'expiracao-aviso': {
      assunto: `⏰ ${dados.nome}, a tua subscrição Vitalis expira em ${dados.dias} dias`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://app.seteecos.com/logos/VITALIS_LOGO_V3.png" alt="Vitalis" style="height: 60px;">
          </div>
          <h1 style="color: #7C8B6F; font-size: 24px; text-align: center;">Olá ${dados.nome} 💚</h1>
          <p style="color: #4A4035; font-size: 16px; line-height: 1.6; text-align: center;">
            A tua subscrição Vitalis expira em <strong>${dados.dias} dias</strong>.
          </p>
          <p style="color: #6B5C4C; font-size: 14px; text-align: center; margin: 20px 0;">
            Para continuares a ter acesso ao teu plano alimentar, receitas e tracking,<br>
            renova a tua subscrição antes da data de expiração.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.seteecos.com/vitalis/pagamento"
               style="background: #7C8B6F; color: white; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-weight: 600;">
              Renovar Subscrição
            </a>
          </div>
          <p style="color: #9CAF88; font-size: 12px; text-align: center; margin-top: 40px;">
            Obrigada por fazeres parte desta jornada 🌱<br>
            - Vivianne
          </p>
        </div>
      `
    },
    'coach-resumo-diario': {
      assunto: `📊 Resumo Vitalis — ${dados.data}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #7C8B6F; font-size: 24px;">Resumo Diário Vitalis 📊</h1>
          <p style="color: #6B5C4C; font-size: 14px;">${dados.data}</p>

          <div style="background: #F5F2ED; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #4A4035; margin-bottom: 15px;">Métricas</h3>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #6B5C4C;">👥 Clientes activas</td>
                <td style="padding: 8px 0; color: #7C8B6F; font-weight: bold; text-align: right;">${dados.totalClientes}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B5C4C;">✅ Check-ins hoje</td>
                <td style="padding: 8px 0; color: ${dados.checkinsHoje > 0 ? '#7C8B6F' : '#C1634A'}; font-weight: bold; text-align: right;">${dados.checkinsHoje}/${dados.totalClientes}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B5C4C;">⚠️ Alertas (Espaço Retorno)</td>
                <td style="padding: 8px 0; color: ${dados.alertasHoje > 0 ? '#C1634A' : '#7C8B6F'}; font-weight: bold; text-align: right;">${dados.alertasHoje}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B5C4C;">🆕 Novas clientes</td>
                <td style="padding: 8px 0; color: #7C8B6F; font-weight: bold; text-align: right;">${dados.novasClientes}</td>
              </tr>
            </table>
          </div>

          ${dados.fizeramCheckin && dados.fizeramCheckin.length > 0 ? `
          <div style="background: #E8F5E9; border-radius: 12px; padding: 15px; margin: 20px 0;">
            <p style="color: #2E7D32; font-size: 13px; font-weight: bold; margin: 0 0 8px 0;">✅ Fizeram check-in:</p>
            <p style="color: #2E7D32; font-size: 13px; margin: 0;">${dados.fizeramCheckin.join(' · ')}</p>
          </div>
          ` : ''}

          ${dados.naoFizeramCheckin && dados.naoFizeramCheckin.length > 0 ? `
          <div style="background: #FFF3E0; border-radius: 12px; padding: 15px; margin: 20px 0;">
            <p style="color: #E65100; font-size: 13px; font-weight: bold; margin: 0 0 8px 0;">⏳ Sem check-in hoje:</p>
            <p style="color: #BF360C; font-size: 13px; margin: 0;">${dados.naoFizeramCheckin.join(' · ')}</p>
          </div>
          ` : ''}

          ${dados.novasClientes > 0 ? `
          <div style="background: #E3F2FD; border-radius: 12px; padding: 15px; margin: 20px 0;">
            <p style="color: #1565C0; font-size: 13px; margin: 0;">
              <strong>🆕 Novas:</strong> ${dados.clientesLista}
            </p>
          </div>
          ` : ''}

          ${dados.progressoPeso && dados.progressoPeso.length > 0 ? `
          <div style="background: #F3E5F5; border-radius: 12px; padding: 15px; margin: 20px 0;">
            <p style="color: #6A1B9A; font-size: 13px; font-weight: bold; margin: 0 0 8px 0;">⚖️ Progresso de peso:</p>
            ${dados.progressoPeso.map(p => `<p style="color: #4A148C; font-size: 13px; margin: 2px 0;">${p.nome}: <strong>-${p.perdido}kg</strong> (actual: ${p.actual}kg${p.meta ? ` → meta: ${p.meta}kg` : ''})</p>`).join('')}
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://app.seteecos.com/coach"
               style="background: #7C8B6F; color: white; padding: 12px 24px; border-radius: 20px; text-decoration: none; font-size: 14px;">
              Ver Dashboard
            </a>
          </div>
        </div>
      `
    }
  };

  const template = templates[tipo];
  if (!template) {
    throw new Error(`Template '${tipo}' não encontrado`);
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao enviar email');
  }

  return response.json();
}
