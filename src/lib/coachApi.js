/**
 * Coach API client - calls /api/coach endpoint
 * Bypasses RLS by using service role key on the server
 */

import { supabase } from './supabase';

async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

async function coachRequest(action, params = {}) {
  const token = await getAuthToken();
  if (!token) throw new Error('Sessao expirada. Faz login novamente.');

  const res = await fetch('/api/coach', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ action, ...params })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro na operacao');
  return data;
}

export const coachApi = {
  listarClientes: () => coachRequest('listar-clientes'),
  buscarNotificacoes: () => coachRequest('coach-notificacoes'),
  buscarAlertasRT: (desde) => coachRequest('coach-alertas-rt', { desde }),
  buscarDadosCliente: (userId) => coachRequest('buscar-dados-cliente', { userId }),
  buscarPlanoPdf: (planId, userId) => coachRequest('buscar-plano-pdf', { planId, userId }),
  gerarPlano: (userId) => coachRequest('gerar-plano', { userId }),
  aprovarPlano: (userId, planId) => coachRequest('aprovar-plano', { userId, planId }),
  apagarCliente: (userId) => coachRequest('apagar-cliente', { userId }),
  activarSubscricao: (userId, planKey) => coachRequest('activar-subscricao', { userId, planKey }),
  setTester: (userId) => coachRequest('set-tester', { userId }),
};
