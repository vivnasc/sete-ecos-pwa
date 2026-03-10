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

// Lista completa de emails de coach (não recebem lembretes de cliente)
const COACH_EMAILS_LIST = (process.env.VITE_COACH_EMAILS || 'viv.saraiva@gmail.com,vivnasc@gmail.com,vivianne.saraiva@outlook.com')
  .split(',').map(e => e.trim().toLowerCase());

// WhatsApp config via Meta Cloud API (produção)
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VIVIANNE_PERSONAL_NUMBER = (process.env.VIVIANNE_PERSONAL_NUMBER || '').trim();
const COACH_WHATSAPP_NUMBER = VIVIANNE_PERSONAL_NUMBER
  ? VIVIANNE_PERSONAL_NUMBER.replace(/[^0-9]/g, '')
  : '258851006473';

// Telegram config para notificações da coach
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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
    trial_alertas: 0,
    super_engajadas: 0,
    alertas_inactividade: 0,
    resumo: false,
    erros: []
  };

  // Cada tarefa corre de forma INDEPENDENTE — se uma falhar, as outras continuam.
  // Isto previne que um erro numa sub-task (ex: tabela inexistente, API key expirada)
  // bloqueie TODAS as comunicações do dia.
  const tarefas = [
    // Prioridade 1: Notificações para a COACH (Telegram)
    { nome: 'resumo-diario', fn: () => enviarResumoDiario(supabase, resultados) },
    { nome: 'trials-expirando', fn: () => alertarTrialsExpirando(supabase, resultados) },
    { nome: 'super-engajadas', fn: () => alertarSuperEngajadas(supabase, resultados) },
    { nome: 'clientes-inactivos', fn: () => alertarClientesInactivos(supabase, resultados) },
    // Prioridade 2: Comunicações com clientes
    { nome: 'lembretes', fn: () => enviarLembretes(supabase, resultados) },
    { nome: 'avisos-expiracao', fn: () => enviarAvisosExpiracao(supabase, resultados) },
    { nome: 'marcos', fn: () => enviarMarcos(supabase, resultados) },
    { nome: 'marcos-peso', fn: () => enviarMarcosPeso(supabase, resultados) },
    { nome: 'winback', fn: () => enviarWinback(supabase, resultados) },
    { nome: 'curiosidade', fn: () => enviarCuriosidadeInsana(supabase, resultados) },
  ];

  for (const tarefa of tarefas) {
    try {
      await tarefa.fn();
    } catch (err) {
      console.error(`[Tarefas] ERRO em "${tarefa.nome}":`, err.message || err);
      resultados.erros.push(`${tarefa.nome}: ${err.message}`);
    }
  }

  const temErros = resultados.erros.length > 0;
  return res.status(200).json({
    success: !temErros,
    tarefas_executadas: tarefas.length,
    tarefas_falhadas: resultados.erros.length,
    ...resultados
  });
}

/**
 * Enviar lembretes motivacionais a clientes inactivos — escalação por marcos
 * - 2-4 dias: lembrete suave (1x/dia)
 * - 5-6 dias: motivação intensa (1x a cada 3 dias)
 * - 7 dias: marco — mensagem especial "1 semana" + alerta coach
 * - 14 dias: marco — mensagem "reconexão" + alerta coach
 * - 30 dias: marco — última tentativa gentil + alerta coach
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
    // Excluir coaches — não enviar lembretes de cliente a contas de coach
    if (cliente.users?.email && COACH_EMAILS_LIST.includes(cliente.users.email.toLowerCase())) continue;

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

        // Determinar tipo de email e deduplicação por marco
        const { tipoEmail, dedupDias } = determinarTipoLembrete(diasInactiva);

        const dedupDesde = new Date();
        dedupDesde.setDate(dedupDesde.getDate() - dedupDias);

        const { data: jaEnviado } = await supabase
          .from('vitalis_email_log')
          .select('id')
          .eq('user_id', cliente.user_id)
          .eq('tipo', tipoEmail)
          .gte('created_at', dedupDesde.toISOString())
          .limit(1);

        if (!jaEnviado || jaEnviado.length === 0) {
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

          // WhatsApp template por nível
          const waTemplate = diasInactiva >= 14 ? 'motivacao' :
                            diasInactiva >= 7 ? 'motivacao' :
                            diasInactiva >= 5 ? 'motivacao' : 'checkin_lembrete';
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
 * Determinar tipo de email e período de deduplicação por marco de inactividade
 */
function determinarTipoLembrete(diasInactiva) {
  if (diasInactiva >= 30) {
    return { tipoEmail: 'inactividade-30d', dedupDias: 30 }; // 1x por mês
  }
  if (diasInactiva >= 14) {
    return { tipoEmail: 'inactividade-14d', dedupDias: 14 }; // 1x a cada 14 dias
  }
  if (diasInactiva >= 7) {
    return { tipoEmail: 'inactividade-7d', dedupDias: 7 }; // 1x por semana
  }
  if (diasInactiva >= 5) {
    return { tipoEmail: 'motivacao-intensa', dedupDias: 3 }; // 1x a cada 3 dias
  }
  return { tipoEmail: 'lembrete-checkin', dedupDias: 1 }; // 1x por dia
}

/**
 * Alertar coach via Telegram + Push sobre clientes inactivos 7+ dias
 * Envia alerta agrupado com todos os clientes em risco
 */
async function alertarClientesInactivos(supabase, resultados) {
  try {
    const { data: clientes, error } = await supabase
      .from('vitalis_clients')
      .select(`
        id,
        user_id,
        users!inner(id, nome, email)
      `)
      .in('subscription_status', ['active', 'trial', 'tester']);

    if (error || !clientes) return;

    const alertas = { semana: [], quinzena: [], mes: [] };

    for (const cliente of clientes) {
      try {
        const { data: ultimoRegisto } = await supabase
          .from('vitalis_registos')
          .select('created_at')
          .eq('user_id', cliente.user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!ultimoRegisto) {
          // Nunca fez check-in — verificar data de registo
          const { data: clienteData } = await supabase
            .from('vitalis_clients')
            .select('created_at')
            .eq('id', cliente.id)
            .single();
          const diasDesdeRegisto = clienteData
            ? Math.floor((Date.now() - new Date(clienteData.created_at).getTime()) / 86400000)
            : 0;
          if (diasDesdeRegisto >= 7) {
            const nome = cliente.users?.nome?.split(' ')[0] || '?';
            alertas.semana.push(`${nome} (nunca fez check-in, ${diasDesdeRegisto}d desde registo)`);
          }
          continue;
        }

        const diasInactivo = Math.floor(
          (Date.now() - new Date(ultimoRegisto.created_at).getTime()) / 86400000
        );
        const nome = cliente.users?.nome?.split(' ')[0] || '?';

        if (diasInactivo >= 30) {
          alertas.mes.push(`${nome} (${diasInactivo}d)`);
        } else if (diasInactivo >= 14) {
          alertas.quinzena.push(`${nome} (${diasInactivo}d)`);
        } else if (diasInactivo >= 7) {
          alertas.semana.push(`${nome} (${diasInactivo}d)`);
        }
      } catch (_) {
        // Skip individual errors
      }
    }

    const totalAlertas = alertas.semana.length + alertas.quinzena.length + alertas.mes.length;
    if (totalAlertas === 0) return;

    // Deduplicação: 1x por dia
    const hoje = new Date().toISOString().split('T')[0];
    try {
      const { data: jaEnviado } = await supabase
        .from('vitalis_email_log')
        .select('id')
        .eq('tipo', 'coach-alerta-inactividade')
        .gte('created_at', hoje)
        .limit(1);
      if (jaEnviado && jaEnviado.length > 0) return;
    } catch (_) { /* tabela pode não existir */ }

    let mensagem = `⚠️ *CLIENTES INACTIVOS — ATENÇÃO*\n`;

    if (alertas.mes.length > 0) {
      mensagem += `\n🔴 *30+ dias* (risco alto):\n${alertas.mes.join('\n')}`;
    }
    if (alertas.quinzena.length > 0) {
      mensagem += `\n🟠 *14+ dias* (precisa contacto):\n${alertas.quinzena.join('\n')}`;
    }
    if (alertas.semana.length > 0) {
      mensagem += `\n🟡 *7+ dias* (atenção):\n${alertas.semana.join('\n')}`;
    }

    mensagem += `\n\n💬 Considera enviar mensagem pessoal a quem está há mais tempo inactivo.`;

    await enviarWhatsAppCoach(mensagem);

    // Registar envio para deduplicação
    try {
      await supabase.from('vitalis_email_log').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        tipo: 'coach-alerta-inactividade',
        destinatario: 'coach-telegram'
      });
    } catch (_) { /* ok */ }

    resultados.alertas_inactividade = totalAlertas;
  } catch (err) {
    resultados.erros.push('Erro alertar inactivos: ' + err.message);
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
    // Excluir coaches
    if (cliente.users?.email && COACH_EMAILS_LIST.includes(cliente.users.email.toLowerCase())) continue;

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
      // Alertas espaço retorno hoje (tabela pode não existir — retorna 0)
      supabase.from('vitalis_espaco_retorno')
        .select('id', { count: 'exact' })
        .gte('created_at', ontem.toISOString())
        .then(r => r.error ? { count: 0 } : r),
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

    // Telegram/WhatsApp PRIMEIRO (prioridade — não bloquear se email falhar)
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

    // Email depois (se falhar, Telegram já foi)
    try {
      await enviarEmail('coach-resumo-diario', COACH_EMAIL, dadosResumo);
    } catch (emailErr) {
      resultados.erros.push('Email resumo falhou (Telegram já enviado): ' + emailErr.message);
    }

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
    // Excluir coaches
    if (cliente.users?.email && COACH_EMAILS_LIST.includes(cliente.users.email.toLowerCase())) continue;

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
    // Excluir coaches
    if (cliente.users?.email && COACH_EMAILS_LIST.includes(cliente.users.email.toLowerCase())) continue;

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
    // Excluir coaches
    if (cliente.users?.email && COACH_EMAILS_LIST.includes(cliente.users.email.toLowerCase())) continue;

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
      // Excluir coaches
      if (user.email && COACH_EMAILS_LIST.includes(user.email.toLowerCase())) continue;

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
 * Alertar coach sobre trials que expiram amanhã
 * Para a coach ter tempo de enviar mensagem pessoal de retenção
 */
async function alertarTrialsExpirando(supabase, resultados) {
  try {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const amanhaStr = amanha.toISOString().split('T')[0];

    // Buscar todos os ecos com trials
    const ecoTables = [
      { table: 'vitalis_clients', eco: 'Vitalis' },
      { table: 'aurea_clients', eco: 'Áurea' },
      { table: 'serena_clients', eco: 'Serena' },
      { table: 'ignis_clients', eco: 'Ignis' },
      { table: 'ventis_clients', eco: 'Ventis' },
      { table: 'ecoa_clients', eco: 'Ecoa' },
      { table: 'imago_clients', eco: 'Imago' },
    ];

    const trialsAmanha = [];

    for (const { table, eco } of ecoTables) {
      try {
        const { data } = await supabase
          .from(table)
          .select('user_id, subscription_expires, trial_started, users!inner(nome, email)')
          .eq('subscription_status', 'trial')
          .not('subscription_expires', 'is', null);

        for (const c of (data || [])) {
          if (!c.subscription_expires) continue;
          const expiresStr = new Date(c.subscription_expires).toISOString().split('T')[0];
          if (expiresStr === amanhaStr) {
            const nome = c.users?.nome?.split(' ')[0] || '?';
            // Calcular dias de uso
            const diasUso = c.trial_started
              ? Math.floor((Date.now() - new Date(c.trial_started).getTime()) / 86400000)
              : '?';
            trialsAmanha.push({ nome, eco, diasUso });
          }
        }
      } catch (_) {
        // Tabela pode não existir ainda
      }
    }

    if (trialsAmanha.length > 0) {
      const linhas = trialsAmanha.map(t =>
        `👤 *${t.nome}* — ${t.eco} (${t.diasUso} dias de uso)`
      ).join('\n');

      await enviarWhatsAppCoach(`📅 *TRIALS EXPIRAM AMANHÃ*\n\n${linhas}\n\nBoa altura para enviar mensagem pessoal de retenção! 💬`);
      resultados.trial_alertas = trialsAmanha.length;
    }
  } catch (err) {
    resultados.erros.push('Erro alertar trials: ' + err.message);
  }
}

/**
 * Alertar coach sobre clientes com aderência excepcional (90%+)
 * Identifica candidatas a testemunhos e celebrações
 */
async function alertarSuperEngajadas(supabase, resultados) {
  try {
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    // Buscar check-ins dos últimos 7 dias
    const { data: checkins } = await supabase
      .from('vitalis_registos')
      .select('user_id, aderencia_1a10, data')
      .gte('created_at', seteDiasAtras.toISOString());

    if (!checkins || checkins.length === 0) return;

    // Agrupar por user_id
    const porUser = {};
    for (const c of checkins) {
      if (!porUser[c.user_id]) porUser[c.user_id] = [];
      porUser[c.user_id].push(c);
    }

    const superEngajadas = [];

    for (const [userId, registos] of Object.entries(porUser)) {
      // Precisa de pelo menos 6 check-ins em 7 dias (86%+)
      if (registos.length < 6) continue;

      // Média de aderência >= 8/10 (80%+)
      const mediaAderencia = registos.reduce((sum, r) => sum + (r.aderencia_1a10 || 0), 0) / registos.length;
      if (mediaAderencia < 8) continue;

      // Buscar nome
      const { data: user } = await supabase
        .from('users')
        .select('nome')
        .eq('id', userId)
        .maybeSingle();

      superEngajadas.push({
        nome: user?.nome?.split(' ')[0] || '?',
        checkins: registos.length,
        media: mediaAderencia.toFixed(1),
      });
    }

    if (superEngajadas.length > 0) {
      const linhas = superEngajadas.map(s =>
        `💪 *${s.nome}* — ${s.checkins}/7 check-ins, aderência ${s.media}/10`
      ).join('\n');

      await enviarWhatsAppCoach(`🌟 *CLIENTES SUPER-ENGAJADAS ESTA SEMANA*\n\n${linhas}\n\nConsidera celebrar ou pedir testemunho! 🎉`);
      resultados.super_engajadas = superEngajadas.length;
    }
  } catch (err) {
    resultados.erros.push('Erro super-engajadas: ' + err.message);
  }
}

/**
 * Envia notificação para a coach via Telegram (preferido) ou WhatsApp (fallback)
 */
async function enviarWhatsAppCoach(mensagem) {
  // 1. Tentar Telegram primeiro (mais fiável, sem tokens que expiram)
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      // Tentar com Markdown
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: mensagem,
          parse_mode: 'Markdown',
        }),
      });
      if (response.ok) {
        console.log('[Telegram] Mensagem enviada à coach');
        return true;
      }
      // Markdown falhou (nomes com _ ou * crasham) — retry sem formatação
      const errData = await response.json().catch(() => ({}));
      console.warn('[Telegram] Markdown falhou:', errData?.description, '— retry sem formatação');
      const resp2 = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: mensagem }),
      });
      if (resp2.ok) {
        console.log('[Telegram] Mensagem enviada sem Markdown');
        return true;
      }
      console.error('[Telegram] Falhou mesmo sem Markdown:', (await resp2.json().catch(() => ({}))).description);
    } catch (err) {
      console.error('[Telegram] Erro de rede:', err.message);
    }
  }

  // 2. Fallback: WhatsApp Meta
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !COACH_WHATSAPP_NUMBER) {
    console.log('Nem Telegram nem WhatsApp configurados — notificação não enviada');
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
    'inactividade-7d': {
      assunto: `${dados.nome}, já passou uma semana — estou preocupada contigo`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #FAF6F0;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://app.seteecos.com/logos/VITALIS_LOGO_V3.png" alt="Vitalis" style="height: 50px;">
          </div>
          <h1 style="color: #4A4035; font-size: 22px; text-align: center; line-height: 1.4;">${dados.nome}, já lá vai uma semana.</h1>
          <p style="color: #6B5C4C; font-size: 15px; line-height: 1.8; text-align: center;">Sei que a vida às vezes atropela tudo. E está tudo bem.</p>
          <div style="background: #2C2C2C; color: white; padding: 24px; border-radius: 12px; margin: 20px 0;">
            <p style="font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">Mas quero que saibas: <strong>o teu progresso não desapareceu</strong>. Está tudo guardado, exactamente onde deixaste.</p>
          </div>
          <p style="color: #6B5C4C; font-size: 15px; line-height: 1.8;">Não precisas de recomeçar do zero. Basta um pequeno passo:</p>
          <div style="background: white; padding: 16px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #7C8B6F;">
            <p style="color: #4A4035; margin: 4px 0;">Abre o Vitalis</p>
            <p style="color: #4A4035; margin: 4px 0;">Regista só a água de hoje</p>
            <p style="color: #4A4035; margin: 4px 0;">Pronto. Já reactivaste o teu hábito.</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.seteecos.com/vitalis/dashboard"
               style="display: inline-block; background: linear-gradient(135deg, #7C8B6F, #5a6b4f); color: white; padding: 16px 36px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Voltar ao Vitalis
            </a>
          </div>
          <div style="background: #25D366; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="color: white; font-weight: bold; margin: 0 0 8px;">Aconteceu alguma coisa? Fala comigo.</p>
            <a href="${WHATSAPP_LINK}" style="display: inline-block; padding: 10px 24px; background: white; color: #25D366; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 14px;">Abrir WhatsApp</a>
          </div>
          <p style="color: #6B5C4C; font-size: 14px; text-align: center; margin-top: 20px;">Estou aqui, sem julgamento.<br><strong>— Vivianne</strong></p>
        </div>
      `
    },
    'inactividade-14d': {
      assunto: `${dados.nome}, precisamos de falar — ${dados.dias} dias sem nos vermos`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #FAF6F0;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://app.seteecos.com/logos/VITALIS_LOGO_V3.png" alt="Vitalis" style="height: 50px;">
          </div>
          <h1 style="color: #4A4035; font-size: 22px; text-align: center; line-height: 1.4;">${dados.nome}, faz ${dados.dias} dias.</h1>
          <p style="color: #6B5C4C; font-size: 15px; line-height: 1.8; text-align: center;">Não te vou mentir — quando vejo que paraste, fico preocupada. Não por ti como "número", mas porque sei o que querias alcançar.</p>
          <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #E65100;">
            <p style="color: #4A4035; font-size: 15px; line-height: 1.7; margin: 0;"><strong>Posso ser honesta?</strong> Cada dia que passa sem cuidares de ti, os velhos padrões ganham terreno. Não é fraqueza — é biologia. O corpo volta ao que conhece.</p>
          </div>
          <p style="color: #6B5C4C; font-size: 15px; line-height: 1.8;">Mas a boa notícia é que <strong>bastam 30 segundos</strong> para quebrares o ciclo. Um check-in. Uma nota. Um copo de água registado.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.seteecos.com/vitalis/dashboard"
               style="display: inline-block; background: linear-gradient(135deg, #E65100, #BF360C); color: white; padding: 16px 36px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Reconectar Agora
            </a>
          </div>
          <div style="background: #25D366; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="color: white; font-weight: bold; margin: 0 0 4px;">Se algo te está a travar, quero ouvir.</p>
            <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin: 0 0 12px;">Às vezes só precisamos de alguém que entenda.</p>
            <a href="${WHATSAPP_LINK}" style="display: inline-block; padding: 12px 28px; background: white; color: #25D366; border-radius: 20px; text-decoration: none; font-weight: bold;">Falar com a Vivianne</a>
          </div>
          <p style="color: #6B5C4C; font-size: 14px; text-align: center; margin-top: 20px;">Com carinho,<br><strong>— Vivianne</strong></p>
        </div>
      `
    },
    'inactividade-30d': {
      assunto: `${dados.nome}, ainda acredito em ti`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #FAF6F0;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://app.seteecos.com/logos/VITALIS_LOGO_V3.png" alt="Vitalis" style="height: 50px;">
          </div>
          <h1 style="color: #4A4035; font-size: 22px; text-align: center; line-height: 1.4;">${dados.nome},</h1>
          <p style="color: #6B5C4C; font-size: 16px; line-height: 1.8; text-align: center;">Faz um mês. E não, não me esqueci de ti.</p>
          <div style="background: #2C2C2C; color: white; padding: 24px; border-radius: 12px; margin: 20px 0;">
            <p style="font-size: 18px; font-style: italic; line-height: 1.6; margin: 0; text-align: center;">"Não é sobre nunca cair. É sobre levantar mais uma vez."</p>
          </div>
          <p style="color: #6B5C4C; font-size: 15px; line-height: 1.8;">Quero que saibas três coisas:</p>
          <div style="background: white; padding: 16px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #7C8B6F;">
            <p style="color: #4A4035; margin: 8px 0;">1. O teu plano e todo o progresso <strong>estão guardados</strong></p>
            <p style="color: #4A4035; margin: 8px 0;">2. Não há julgamento — só apoio</p>
            <p style="color: #4A4035; margin: 8px 0;">3. Quando estiveres pronta, basta abrir o Vitalis</p>
          </div>
          <p style="color: #6B5C4C; font-size: 15px; line-height: 1.8; text-align: center;">Estou à distância de uma mensagem.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.seteecos.com/vitalis/dashboard"
               style="display: inline-block; background: linear-gradient(135deg, #7C8B6F, #5a6b4f); color: white; padding: 16px 36px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Estou de Volta
            </a>
          </div>
          <div style="background: #25D366; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="color: white; font-weight: bold; margin: 0 0 8px;">Ou se preferires, manda-me uma mensagem.</p>
            <a href="${WHATSAPP_LINK}" style="display: inline-block; padding: 10px 24px; background: white; color: #25D366; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 14px;">Abrir WhatsApp</a>
          </div>
          <p style="color: #6B5C4C; font-size: 14px; text-align: center; margin-top: 20px;">Sempre aqui,<br><strong>— Vivianne</strong></p>
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
