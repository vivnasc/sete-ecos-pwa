import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { coachApi } from '../lib/coachApi';
import { SUBSCRIPTION_PLANS } from '../lib/subscriptions';
import { enviarBoasVindas, enviarConfirmacaoPagamento } from '../lib/emails';

/**
 * SETE ECOS - COACH DASHBOARD v5
 * Painel real de coaching - foco em gestao de clientes
 */

const STATUS_LABELS = {
  tester: { label: 'Tester', cor: 'bg-purple-100 text-purple-700' },
  trial: { label: 'Trial', cor: 'bg-blue-100 text-blue-700' },
  active: { label: 'Activo', cor: 'bg-green-100 text-green-700' },
  pending: { label: 'Pendente', cor: 'bg-yellow-100 text-yellow-700' },
  expired: { label: 'Expirado', cor: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelado', cor: 'bg-gray-100 text-gray-700' },
};

function StatusBadge({ status }) {
  const config = STATUS_LABELS[status] || { label: status || 'N/A', cor: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.cor}`}>
      {config.label}
    </span>
  );
}

function PlanBadge({ hasIntake, hasPlan, planStatus, planErro }) {
  if (!hasIntake) {
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Sem intake</span>;
  }
  if (planStatus === 'erro') {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700" title={planErro || 'Erro na geracao'}>
        Erro no plano
      </span>
    );
  }
  if (!hasPlan) {
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Sem plano</span>;
  }
  if (planStatus === 'pendente_revisao') {
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Aguarda revisao</span>;
  }
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Plano activo</span>;
}

export default function CoachDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [gerandoPlano, setGerandoPlano] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);

  // Quick stats
  const [stats, setStats] = useState({ total: 0, active: 0, trial: 0, pending: 0, semPlano: 0, aguardaRevisao: 0, erros: 0 });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      // Server-side fetch via coach API (bypasses RLS)
      const data = await coachApi.listarClientes();
      const enriched = data.clients || [];

      // Calculate stats
      const statsCalc = {
        total: enriched.length,
        active: enriched.filter(c => c.subscription_status === 'active').length,
        trial: enriched.filter(c => c.subscription_status === 'trial').length,
        pending: enriched.filter(c => c.subscription_status === 'pending').length,
        semPlano: enriched.filter(c => c.hasIntake && !c.hasPlan && c.planStatus !== 'erro').length,
        aguardaRevisao: enriched.filter(c => c.planStatus === 'pendente_revisao').length,
        erros: enriched.filter(c => c.planStatus === 'erro').length,
      };

      setClients(enriched);
      setStats(statsCalc);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered clients
  const filteredClients = useMemo(() => {
    let result = clients;

    // Search
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(c =>
        c.nome.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s)
      );
    }

    // Filter by subscription status
    if (filterStatus !== 'all') {
      result = result.filter(c => c.subscription_status === filterStatus);
    }

    // Filter by plan status
    if (filterPlan === 'sem_intake') {
      result = result.filter(c => !c.hasIntake);
    } else if (filterPlan === 'sem_plano') {
      result = result.filter(c => c.hasIntake && !c.hasPlan && c.planStatus !== 'erro');
    } else if (filterPlan === 'aguarda_revisao') {
      result = result.filter(c => c.planStatus === 'pendente_revisao');
    } else if (filterPlan === 'plano_activo') {
      result = result.filter(c => c.planStatus === 'activo');
    } else if (filterPlan === 'erro') {
      result = result.filter(c => c.planStatus === 'erro');
    }

    return result;
  }, [clients, search, filterStatus, filterPlan]);

  // Generate plan for a client
  const handleGerarPlano = async (client) => {
    if (!confirm(`Gerar plano nutricional para ${client.nome}?`)) return;
    setGerandoPlano(client.user_id);

    try {
      const result = await coachApi.gerarPlano(client.user_id);
      alert(`Plano gerado com sucesso!\n${result.plano.calorias} kcal | P:${result.plano.macros.proteina}g C:${result.plano.macros.carboidratos}g G:${result.plano.macros.gordura}g\n\nPlano fica em revisao ate aprovares.`);
      loadClients();
    } catch (err) {
      alert('Erro ao gerar plano: ' + err.message);
    } finally {
      setGerandoPlano(null);
    }
  };

  // Delete client
  const handleDeleteClient = async (client) => {
    const nome = client.nome || client.email;
    if (!confirm(`APAGAR cliente "${nome}"?\n\nIsto vai remover:\n- Registo vitalis_clients\n- Planos (vitalis_meal_plans)\n- Intake (vitalis_intake)\n- Habitos (vitalis_habitos)\n\nEsta accao e irreversivel!`)) return;
    if (!confirm(`Tens a certeza ABSOLUTA que queres apagar "${nome}"? Ultima chance!`)) return;

    setDeletingClient(client.user_id);
    try {
      await coachApi.apagarCliente(client.user_id);
      alert(`Cliente "${nome}" apagado com sucesso.`);
      loadClients();
    } catch (err) {
      alert('Erro ao apagar cliente: ' + err.message);
    } finally {
      setDeletingClient(null);
    }
  };

  // Quick activate
  const handleActivate = async (client, planKey = 'MONTHLY') => {
    if (!confirm(`Activar subscricao ${SUBSCRIPTION_PLANS[planKey].name} para ${client.nome}?`)) return;
    try {
      const result = await coachApi.activarSubscricao(client.user_id, planKey);
      const validoAte = new Date(result.expiresAt).toLocaleDateString('pt-PT');
      alert(`Subscricao activada ate ${validoAte}`);

      // Enviar emails de boas-vindas e confirmacao a cliente
      const plan = SUBSCRIPTION_PLANS[planKey];
      enviarBoasVindas(client.email, client.nome).catch(() => {});
      enviarConfirmacaoPagamento(client.email, {
        nome: client.nome,
        plano: plan.name,
        valor: `${plan.price_mzn?.toLocaleString('pt-MZ') || plan.price_usd} ${plan.price_mzn ? 'MZN' : 'USD'}`,
        data: new Date().toLocaleDateString('pt-PT'),
        validoAte
      }).catch(() => {});

      loadClients();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  const handleSetTester = async (client) => {
    if (!confirm(`Definir "${client.nome}" como tester (acesso gratuito)?`)) return;
    try {
      await coachApi.setTester(client.user_id);
      alert('Cliente definido como tester.');
      loadClients();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  // Days since date
  const daysSince = (dateStr) => {
    if (!dateStr) return null;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-500">A carregar clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-8 h-8 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel Coach</h1>
                <p className="text-xs text-gray-500">Gestao de clientes Vitalis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadClients}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Actualizar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <Link
                to="/coach/marketing"
                className="px-3 py-1.5 text-sm bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors"
              >
                Marketing
              </Link>
              <Link
                to="/coach/analytics"
                className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Analytics
              </Link>
              <Link
                to="/vitalis/dashboard"
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Vitalis
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <button
            onClick={() => { setFilterStatus('all'); setFilterPlan('all'); }}
            className={`p-3 rounded-xl text-center transition-all ${filterStatus === 'all' && filterPlan === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs">Total</p>
          </button>
          <button
            onClick={() => { setFilterStatus('active'); setFilterPlan('all'); }}
            className={`p-3 rounded-xl text-center transition-all ${filterStatus === 'active' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-green-50'}`}
          >
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-xs">Activos</p>
          </button>
          <button
            onClick={() => { setFilterStatus('trial'); setFilterPlan('all'); }}
            className={`p-3 rounded-xl text-center transition-all ${filterStatus === 'trial' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'}`}
          >
            <p className="text-2xl font-bold">{stats.trial}</p>
            <p className="text-xs">Trial</p>
          </button>
          <button
            onClick={() => { setFilterStatus('pending'); setFilterPlan('all'); }}
            className={`p-3 rounded-xl text-center transition-all ${filterStatus === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-yellow-50'}`}
          >
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-xs">Pendentes</p>
          </button>
          <button
            onClick={() => { setFilterStatus('all'); setFilterPlan('sem_plano'); }}
            className={`p-3 rounded-xl text-center transition-all ${filterPlan === 'sem_plano' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-orange-50'}`}
          >
            <p className="text-2xl font-bold">{stats.semPlano}</p>
            <p className="text-xs">Sem plano</p>
          </button>
          <button
            onClick={() => { setFilterStatus('all'); setFilterPlan('aguarda_revisao'); }}
            className={`p-3 rounded-xl text-center transition-all ${filterPlan === 'aguarda_revisao' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700 hover:bg-amber-50'}`}
          >
            <p className="text-2xl font-bold">{stats.aguardaRevisao}</p>
            <p className="text-xs">Revisao</p>
          </button>
          {stats.erros > 0 && (
            <button
              onClick={() => { setFilterStatus('all'); setFilterPlan('erro'); }}
              className={`p-3 rounded-xl text-center transition-all ${filterPlan === 'erro' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-red-50'}`}
            >
              <p className="text-2xl font-bold">{stats.erros}</p>
              <p className="text-xs">Erros</p>
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Procurar por nome ou email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none"
          >
            <option value="all">Todos os estados</option>
            <option value="active">Activos</option>
            <option value="trial">Trial</option>
            <option value="pending">Pendentes</option>
            <option value="tester">Testers</option>
            <option value="expired">Expirados</option>
          </select>
          <select
            value={filterPlan}
            onChange={e => setFilterPlan(e.target.value)}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none"
          >
            <option value="all">Todos os planos</option>
            <option value="sem_intake">Sem intake</option>
            <option value="sem_plano">Sem plano</option>
            <option value="aguarda_revisao">Aguarda revisao</option>
            <option value="plano_activo">Plano activo</option>
            <option value="erro">Erro no plano</option>
          </select>
        </div>

        {/* Pending payments alert */}
        {(() => {
          const pendentes = clients.filter(c => c.subscription_status === 'pending' && c.payment_reference);
          if (pendentes.length === 0) return null;
          return (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
              <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                <span className="text-lg">💰</span>
                {pendentes.length} pagamento{pendentes.length !== 1 ? 's' : ''} pendente{pendentes.length !== 1 ? 's' : ''} de verificação
              </h3>
              <div className="space-y-2">
                {pendentes.map(c => (
                  <div key={c.user_id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-yellow-200">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{c.nome}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="text-yellow-700 font-medium">
                          📱 {c.payment_method || 'M-Pesa'}
                        </span>
                        <span className="text-gray-600 font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                          Ref: {c.payment_reference}
                        </span>
                        {c.payment_amount && (
                          <span className="text-green-700 font-semibold">
                            {Number(c.payment_amount).toLocaleString('pt-MZ')} {c.payment_currency || 'MZN'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <button
                        onClick={() => handleActivate(c, 'MONTHLY')}
                        className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        Mensal
                      </button>
                      <button
                        onClick={() => handleActivate(c, 'SEMESTRAL')}
                        className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        Semestral
                      </button>
                      <button
                        onClick={() => handleActivate(c, 'ANNUAL')}
                        className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        Anual
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Results count */}
        <p className="text-sm text-gray-500">
          {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''}
          {(filterStatus !== 'all' || filterPlan !== 'all' || search.trim()) && ` (filtrado de ${clients.length})`}
        </p>

        {/* Client List */}
        <div className="space-y-2">
          {filteredClients.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              {clients.length === 0 ? 'Nenhum cliente registado.' : 'Nenhum cliente corresponde aos filtros.'}
            </div>
          ) : (
            filteredClients.map(client => {
              const inactivityDays = daysSince(client.lastActivity);
              const isInactive = inactivityDays !== null && inactivityDays >= 5;

              return (
                <div
                  key={client.user_id}
                  className={`bg-white rounded-xl border transition-all hover:shadow-md ${
                    isInactive ? 'border-red-200' : 'border-gray-100'
                  }`}
                >
                  <div className="p-4">
                    {/* Top row: name, badges, actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/coach/cliente/${client.user_id}`}
                            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate"
                          >
                            {client.nome}
                          </Link>
                          <StatusBadge status={client.subscription_status} />
                          <PlanBadge hasIntake={client.hasIntake} hasPlan={client.hasPlan} planStatus={client.planStatus} planErro={client.planErro} />
                          {isInactive && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              {inactivityDays}d inactivo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-0.5">{client.email}</p>
                        {client.planErro && (
                          <p className="text-xs text-red-500 mt-0.5 truncate">{client.planErro}</p>
                        )}
                        {client.subscription_status === 'pending' && client.payment_reference && (
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className="text-yellow-700 font-medium">📱 {client.payment_method || 'M-Pesa'}</span>
                            <span className="font-mono bg-yellow-50 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200">
                              {client.payment_reference}
                            </span>
                            {client.payment_amount && (
                              <span className="text-green-700 font-semibold">
                                {Number(client.payment_amount).toLocaleString('pt-MZ')} {client.payment_currency || 'MZN'}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          {client.planCalorias && (
                            <span>{client.planCalorias} kcal</span>
                          )}
                          {client.subscription_expires && (
                            <span>Expira: {new Date(client.subscription_expires).toLocaleDateString('pt-PT')}</span>
                          )}
                          <span>Registo: {new Date(client.created_at).toLocaleDateString('pt-PT')}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link
                          to={`/coach/cliente/${client.user_id}`}
                          className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Ver
                        </Link>

                        {client.hasIntake && (!client.hasPlan || client.planStatus === 'erro') && (
                          <button
                            onClick={() => handleGerarPlano(client)}
                            disabled={gerandoPlano === client.user_id}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                              client.planStatus === 'erro'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {gerandoPlano === client.user_id ? 'A gerar...' : (client.planStatus === 'erro' ? 'Tentar novamente' : 'Gerar plano')}
                          </button>
                        )}

                        {/* Dropdown for more actions */}
                        <ClientActions
                          client={client}
                          onActivate={handleActivate}
                          onSetTester={handleSetTester}
                          onDelete={handleDeleteClient}
                          onGeneratePlan={handleGerarPlano}
                          isGenerating={gerandoPlano === client.user_id}
                          isDeleting={deletingClient === client.user_id}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Client action dropdown
function ClientActions({ client, onActivate, onSetTester, onDelete, onGeneratePlan, isGenerating, isDeleting }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 text-sm">
            <Link
              to={`/coach/cliente/${client.user_id}`}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Ver detalhes
            </Link>

            {client.hasIntake && (
              <button
                onClick={() => { onGeneratePlan(client); setOpen(false); }}
                disabled={isGenerating}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {client.hasPlan ? 'Regenerar plano' : 'Gerar plano'}
              </button>
            )}

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={() => { onActivate(client, 'MONTHLY'); setOpen(false); }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Activar mensal
            </button>
            <button
              onClick={() => { onActivate(client, 'SEMESTRAL'); setOpen(false); }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Activar semestral
            </button>
            <button
              onClick={() => { onActivate(client, 'ANNUAL'); setOpen(false); }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Activar anual
            </button>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={() => { onSetTester(client); setOpen(false); }}
              className="block w-full text-left px-4 py-2 text-purple-700 hover:bg-purple-50"
            >
              Definir como tester
            </button>

            {client.email && (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Ola ${client.nome}!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-green-700 hover:bg-green-50"
                onClick={() => setOpen(false)}
              >
                WhatsApp
              </a>
            )}

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={() => { onDelete(client); setOpen(false); }}
              disabled={isDeleting}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {isDeleting ? 'A apagar...' : 'Apagar cliente'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
