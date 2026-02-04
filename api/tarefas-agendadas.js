/**
 * API Endpoint: Tarefas Agendadas
 *
 * Este endpoint é chamado por um cron job para:
 * 1. Enviar lembretes a clientes inactivas (2+ dias sem check-in)
 * 2. Enviar avisos de expiração (7 dias antes)
 * 3. Enviar resumo diário à coach
 *
 * Configurar no vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/tarefas-agendadas",
 *     "schedule": "0 9 * * *"  // 9h todos os dias
 *   }]
 * }
 */

import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
// Coach email - configurável via Vercel ENV
const COACH_EMAIL = process.env.COACH_EMAIL || 'viv.saraiva@gmail.com';

export default async function handler(req, res) {
  // Verificar autorização (cron jobs do Vercel enviam header específico)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  // Aceitar chamadas do Vercel Cron ou com secret válido
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Também aceitar se vier do Vercel (sem auth mas com header específico)
    if (!req.headers['x-vercel-cron']) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
  }

  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Configuração em falta');
    return res.status(500).json({ error: 'Configuração em falta' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const resultados = {
    lembretes: 0,
    expiracoes: 0,
    resumo: false,
    erros: []
  };

  try {
    // 1. LEMBRETES PARA CLIENTES INACTIVAS
    await enviarLembretes(supabase, resultados);

    // 2. AVISOS DE EXPIRAÇÃO
    await enviarAvisosExpiracao(supabase, resultados);

    // 3. RESUMO DIÁRIO PARA COACH
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
 * Enviar lembretes a clientes que não fizeram check-in há 2+ dias
 */
async function enviarLembretes(supabase, resultados) {
  const doisDiasAtras = new Date();
  doisDiasAtras.setDate(doisDiasAtras.getDate() - 2);

  // Buscar clientes activas
  const { data: clientes, error } = await supabase
    .from('vitalis_clients')
    .select(`
      id,
      user_id,
      users!inner(id, nome, email, auth_id)
    `)
    .eq('subscription_status', 'active');

  if (error) {
    resultados.erros.push('Erro ao buscar clientes: ' + error.message);
    return;
  }

  for (const cliente of clientes || []) {
    try {
      // Verificar último registo
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

      // Se não há registo ou último registo foi há mais de 2 dias
      if (!ultimaActividade || ultimaActividade < doisDiasAtras) {
        const diasInactiva = ultimaActividade
          ? Math.floor((new Date() - ultimaActividade) / (1000 * 60 * 60 * 24))
          : 'muitos';

        // Verificar se já enviámos lembrete hoje
        const hoje = new Date().toISOString().split('T')[0];
        const cacheKey = `lembrete-${cliente.user_id}-${hoje}`;

        // Usar tabela de logs para evitar duplicados
        const { data: jaEnviado } = await supabase
          .from('vitalis_email_log')
          .select('id')
          .eq('user_id', cliente.user_id)
          .eq('tipo', 'lembrete-checkin')
          .gte('created_at', hoje)
          .limit(1);

        if (!jaEnviado || jaEnviado.length === 0) {
          await enviarEmail('lembrete-checkin', cliente.users.email, {
            nome: cliente.users.nome || 'Querida',
            dias: diasInactiva
          });

          // Registar envio
          await supabase.from('vitalis_email_log').insert({
            user_id: cliente.user_id,
            tipo: 'lembrete-checkin',
            destinatario: cliente.users.email
          });

          resultados.lembretes++;
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
    resultados.erros.push('Erro ao buscar expiracoes: ' + error.message);
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
      }
    } catch (err) {
      resultados.erros.push(`Erro expiração ${cliente.users?.email}: ${err.message}`);
    }
  }
}

/**
 * Enviar resumo diário para a coach
 */
async function enviarResumoDiario(supabase, resultados) {
  const hoje = new Date().toISOString().split('T')[0];
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);

  try {
    // Contar métricas do dia anterior
    const [
      { count: totalClientes },
      { count: checkinsOntem },
      { count: espacoRetornoOntem },
      { data: novasClientes }
    ] = await Promise.all([
      supabase.from('vitalis_clients').select('id', { count: 'exact' }).eq('subscription_status', 'active'),
      supabase.from('vitalis_registos').select('id', { count: 'exact' }).gte('created_at', ontem.toISOString()),
      supabase.from('vitalis_espaco_retorno').select('id', { count: 'exact' }).gte('created_at', ontem.toISOString()),
      supabase.from('vitalis_clients')
        .select('users!inner(nome, email)')
        .gte('created_at', ontem.toISOString())
    ]);

    await enviarEmail('coach-resumo-diario', COACH_EMAIL, {
      data: new Date().toLocaleDateString('pt-PT'),
      totalClientes: totalClientes || 0,
      checkinsOntem: checkinsOntem || 0,
      alertasOntem: espacoRetornoOntem || 0,
      novasClientes: novasClientes?.length || 0,
      clientesLista: novasClientes?.map(c => c.users?.nome || c.users?.email).join(', ') || 'Nenhuma'
    });

    resultados.resumo = true;
  } catch (err) {
    resultados.erros.push('Erro resumo diário: ' + err.message);
  }
}

/**
 * Função auxiliar para enviar email via Resend
 */
async function enviarEmail(tipo, destinatario, dados) {
  const templates = {
    'lembrete-checkin': {
      assunto: `💚 ${dados.nome}, sentimos a tua falta no Vitalis`,
      html: `
        <div style="font-family: 'Quicksand', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://app.seteecos.com/logos/VITALIS_LOGO_V3.png" alt="Vitalis" style="height: 60px;">
          </div>
          <h1 style="color: #7C8B6F; font-size: 24px; text-align: center;">Olá ${dados.nome} 💚</h1>
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
          <p style="color: #9CAF88; font-size: 12px; text-align: center; margin-top: 40px;">
            Estou aqui contigo 🌱<br>
            - Vivianne
          </p>
        </div>
      `
    },
    'expiracao-aviso': {
      assunto: `⏰ ${dados.nome}, a tua subscrição Vitalis expira em ${dados.dias} dias`,
      html: `
        <div style="font-family: 'Quicksand', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
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
      assunto: `📊 Resumo Vitalis - ${dados.data}`,
      html: `
        <div style="font-family: 'Quicksand', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
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
                <td style="padding: 8px 0; color: #6B5C4C;">✅ Check-ins ontem</td>
                <td style="padding: 8px 0; color: #7C8B6F; font-weight: bold; text-align: right;">${dados.checkinsOntem}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B5C4C;">⚠️ Alertas (Espaço Retorno)</td>
                <td style="padding: 8px 0; color: ${dados.alertasOntem > 0 ? '#C1634A' : '#7C8B6F'}; font-weight: bold; text-align: right;">${dados.alertasOntem}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B5C4C;">🆕 Novas clientes</td>
                <td style="padding: 8px 0; color: #7C8B6F; font-weight: bold; text-align: right;">${dados.novasClientes}</td>
              </tr>
            </table>
          </div>

          ${dados.novasClientes > 0 ? `
          <div style="background: #E8F5E9; border-radius: 12px; padding: 15px; margin: 20px 0;">
            <p style="color: #2E7D32; font-size: 14px; margin: 0;">
              <strong>Novas:</strong> ${dados.clientesLista}
            </p>
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
