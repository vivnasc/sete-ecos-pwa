/**
 * ENDPOINT DE DIAGNÓSTICO
 * Verifica estado completo de um utilizador no Vitalis
 *
 * Uso: https://app.seteecos.com/api/diagnostico?email=SEU_EMAIL
 *
 * Retorna: estado em auth, users, vitalis_clients, vitalis_intake, vitalis_meal_plans
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://vvvdtogvlutrybultffx.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Coach emails que podem usar este endpoint
const COACH_EMAILS = (process.env.VITE_COACH_EMAILS || 'viv.saraiva@gmail.com,vivnasc@gmail.com,vivianne.saraiva@outlook.com')
  .split(',').map(e => e.trim().toLowerCase());

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ erro: 'Parâmetro email é obrigatório. Uso: /api/diagnostico?email=xxx@yyy.com' });
    }

    const emailLower = email.toLowerCase().trim();
    const resultado = {
      email: emailLower,
      timestamp: new Date().toISOString(),
      auth: null,
      users: null,
      vitalis_clients: null,
      vitalis_intake: null,
      vitalis_meal_plans: null,
      diagnostico: []
    };

    // 1. Verificar auth.users (precisa service role key)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      resultado.auth = { erro: 'Sem permissão para consultar auth (precisa service role key)', detalhes: authError.message };
    } else {
      const authUser = authUsers?.users?.find(u => u.email?.toLowerCase() === emailLower);
      if (authUser) {
        resultado.auth = {
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
          confirmed: !!authUser.email_confirmed_at
        };
      } else {
        resultado.auth = { encontrado: false };
        resultado.diagnostico.push('SEM REGISTO em auth.users - utilizador nunca fez login');
      }
    }

    // 2. Verificar tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, auth_id, email, nome, created_at')
      .eq('email', emailLower)
      .maybeSingle();

    if (userError) {
      // Tentar por auth_id se temos
      if (resultado.auth?.id) {
        const { data: userByAuth } = await supabase
          .from('users')
          .select('id, auth_id, email, nome, created_at')
          .eq('auth_id', resultado.auth.id)
          .maybeSingle();
        resultado.users = userByAuth || { encontrado: false, erro: userError.message };
      } else {
        resultado.users = { encontrado: false, erro: userError.message };
      }
    } else if (userData) {
      resultado.users = userData;
      // Verificar consistência auth_id
      if (resultado.auth?.id && userData.auth_id !== resultado.auth.id) {
        resultado.diagnostico.push(`INCONSISTÊNCIA: users.auth_id (${userData.auth_id}) != auth.id (${resultado.auth.id})`);
      }
    } else {
      // Tentar por auth_id
      if (resultado.auth?.id) {
        const { data: userByAuth } = await supabase
          .from('users')
          .select('id, auth_id, email, nome, created_at')
          .eq('auth_id', resultado.auth.id)
          .maybeSingle();
        if (userByAuth) {
          resultado.users = { ...userByAuth, nota: 'Encontrado por auth_id (email diferente na tabela users)' };
          resultado.diagnostico.push(`Email diferente: auth tem "${emailLower}" mas users tem "${userByAuth.email}"`);
        } else {
          resultado.users = { encontrado: false };
          resultado.diagnostico.push('SEM REGISTO em users - AuthContext não criou o registo');
        }
      } else {
        resultado.users = { encontrado: false };
        resultado.diagnostico.push('SEM REGISTO em users');
      }
    }

    const usersId = resultado.users?.id;

    if (!usersId) {
      resultado.diagnostico.push('Sem users.id - não é possível verificar vitalis_clients, intake ou meal_plans');
      return res.status(200).json(resultado);
    }

    // 3. Verificar vitalis_clients
    const { data: clientData, error: clientError } = await supabase
      .from('vitalis_clients')
      .select('id, user_id, status, subscription_status, fase_actual, peso_inicial, peso_actual, peso_meta, created_at, updated_at')
      .eq('user_id', usersId)
      .maybeSingle();

    if (clientError) {
      resultado.vitalis_clients = { erro: clientError.message };
    } else if (clientData) {
      resultado.vitalis_clients = clientData;
    } else {
      resultado.vitalis_clients = { encontrado: false };
      resultado.diagnostico.push('SEM REGISTO em vitalis_clients - utilizador não tem perfil Vitalis');
    }

    // 4. Verificar vitalis_intake
    const { data: intakeData, error: intakeError } = await supabase
      .from('vitalis_intake')
      .select('id, user_id, sexo, idade, peso, altura, objectivo, nivel_actividade, restricoes_alimentares, created_at, updated_at')
      .eq('user_id', usersId)
      .maybeSingle();

    if (intakeError) {
      resultado.vitalis_intake = { erro: intakeError.message };
    } else if (intakeData) {
      resultado.vitalis_intake = intakeData;
    } else {
      resultado.vitalis_intake = { encontrado: false };
      resultado.diagnostico.push('SEM REGISTO em vitalis_intake - intake não foi preenchido ou foi perdido');
    }

    // 5. Verificar vitalis_meal_plans
    const { data: mealPlans, error: mealError } = await supabase
      .from('vitalis_meal_plans')
      .select('id, user_id, status, fase, abordagem, calorias_alvo, proteina_g, carboidratos_g, gordura_g, created_at, updated_at')
      .eq('user_id', usersId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (mealError) {
      resultado.vitalis_meal_plans = { erro: mealError.message };
    } else if (mealPlans && mealPlans.length > 0) {
      resultado.vitalis_meal_plans = mealPlans;
      const activePlan = mealPlans.find(p => p.status === 'activo');
      if (!activePlan) {
        resultado.diagnostico.push('NENHUM plano activo em vitalis_meal_plans (todos inactivos ou expirados)');
      }
    } else {
      resultado.vitalis_meal_plans = { encontrado: false };
      resultado.diagnostico.push('SEM planos em vitalis_meal_plans - plano nunca foi gerado');
    }

    // 6. Verificar vitalis_plano (view)
    if (resultado.vitalis_clients?.id) {
      const { data: planoView, error: planoError } = await supabase
        .from('vitalis_plano')
        .select('*')
        .eq('client_id', resultado.vitalis_clients.id)
        .maybeSingle();

      if (planoError) {
        resultado.vitalis_plano_view = { erro: planoError.message };
      } else if (planoView) {
        resultado.vitalis_plano_view = { encontrado: true, tem_dados: true };
      } else {
        resultado.vitalis_plano_view = { encontrado: false };
        resultado.diagnostico.push('vitalis_plano VIEW não retorna dados para este client_id');
      }
    }

    // Resumo final
    if (resultado.diagnostico.length === 0) {
      resultado.diagnostico.push('Tudo OK - utilizador tem registos em todas as tabelas');
    }

    return res.status(200).json(resultado);

  } catch (err) {
    console.error('Erro no diagnóstico:', err);
    return res.status(500).json({ erro: 'Erro interno', detalhes: err.message });
  }
}
