import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { coachApi } from '../lib/coachApi';
import { SUBSCRIPTION_PLANS } from '../lib/subscriptions';

/**
 * Coach - Vista detalhada de um cliente
 * Mostra intake, plano, progresso e gestao
 */

const ABORDAGEM_LABELS = {
  keto_if: 'Keto + Jejum Intermitente',
  low_carb: 'Low Carb',
  equilibrado: 'Equilibrado'
};

const OBJECTIVO_LABELS = {
  emagrecer: 'Emagrecer',
  perder_peso: 'Perder peso',
  ganhar_massa: 'Ganhar massa',
  ganhar_energia: 'Ganhar energia',
  melhorar_saude: 'Melhorar saude',
  controlar_emocoes: 'Controlar emocoes'
};

const FASE_LABELS = {
  inducao: 'Inducao',
  transicao: 'Transicao',
  recomposicao: 'Recomposicao',
  manutencao: 'Manutencao'
};

export default function CoachClienteDetalhe() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('resumo');

  // Data
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [intake, setIntake] = useState(null);
  const [plano, setPlano] = useState([]);
  const [registos, setRegistos] = useState([]);
  const [aguaLogs, setAguaLogs] = useState([]);
  const [mealsLogs, setMealsLogs] = useState([]);

  // Actions
  const [gerandoPlano, setGerandoPlano] = useState(false);
  const [approvingPlan, setApprovingPlan] = useState(false);

  useEffect(() => {
    if (userId) loadClientData();
  }, [userId]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        userRes,
        clientRes,
        intakeRes,
        planoRes,
        registosRes,
        aguaRes,
        mealsRes
      ] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.from('vitalis_clients').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('vitalis_intake').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('vitalis_meal_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
        supabase.from('vitalis_registos').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(30),
        supabase.from('vitalis_agua_log').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(30),
        supabase.from('vitalis_meals_log').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(30),
      ]);

      setUser(userRes.data);
      setClient(clientRes.data);
      setIntake(intakeRes.data);
      setPlano(planoRes.data || []);
      setRegistos(registosRes.data || []);
      setAguaLogs(aguaRes.data || []);
      setMealsLogs(mealsRes.data || []);
    } catch (err) {
      console.error('Erro ao carregar dados do cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  // Current active plan (or most recent)
  const activePlan = plano.find(p => p.status === 'activo') || plano[0];
  const hasIntake = !!(intake && intake.altura_cm && intake.peso_actual && intake.idade);

  // Generate plan
  const handleGerarPlano = async () => {
    if (!confirm('Gerar plano nutricional para este cliente?')) return;
    setGerandoPlano(true);
    try {
      const result = await coachApi.gerarPlano(userId);
      alert(`Plano gerado e activo: ${result.plano.calorias} kcal\nP:${result.plano.macros.proteina}g C:${result.plano.macros.carboidratos}g G:${result.plano.macros.gordura}g`);
      loadClientData();
    } catch (err) {
      alert('Erro ao gerar plano: ' + err.message);
    } finally {
      setGerandoPlano(false);
    }
  };

  // Approve plan
  const handleApprovePlan = async (planId) => {
    if (!confirm('Aprovar e disponibilizar este plano a cliente?')) return;
    setApprovingPlan(true);
    try {
      await coachApi.aprovarPlano(userId, planId);
      alert('Plano aprovado e disponivel para a cliente!');
      loadClientData();
    } catch (err) {
      alert('Erro: ' + err.message);
    } finally {
      setApprovingPlan(false);
    }
  };

  // Delete client
  const handleDeleteClient = async () => {
    const nome = user?.nome || user?.email || 'este cliente';
    if (!confirm(`APAGAR "${nome}" e TODOS os seus dados?\n\nIsto e irreversivel!`)) return;
    if (!confirm('Ultima chance. Confirmas?')) return;

    try {
      await coachApi.apagarCliente(userId);
      alert('Cliente apagado.');
      navigate('/coach');
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  // Activate subscription
  const handleActivate = async (planKey) => {
    if (!confirm(`Activar ${SUBSCRIPTION_PLANS[planKey].name}?`)) return;
    try {
      const result = await coachApi.activarSubscricao(userId, planKey);
      alert(`Activado ate ${new Date(result.expiresAt).toLocaleDateString('pt-PT')}`);
      loadClientData();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-500">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Cliente nao encontrado.</p>
          <Link to="/coach" className="text-blue-600 text-sm mt-2 block">Voltar</Link>
        </div>
      </div>
    );
  }

  // Parse plan config
  const planConfig = activePlan?.receitas_incluidas ? (() => {
    try { return JSON.parse(activePlan.receitas_incluidas); } catch { return {}; }
  })() : {};

  const porcoesPorRefeicao = planConfig['porções_por_refeicao'] || planConfig.porcoes_por_refeicao || {};

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/coach" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.nome || 'Sem nome'}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={client?.subscription_status} />
                {client?.subscription_expires && (
                  <span className="text-xs text-gray-400">
                    Expira: {new Date(client.subscription_expires).toLocaleDateString('pt-PT')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-4xl mx-auto flex gap-1 overflow-x-auto">
          {[
            { key: 'resumo', label: 'Resumo' },
            { key: 'intake', label: 'Intake' },
            { key: 'plano', label: 'Plano' },
            { key: 'progresso', label: 'Progresso' },
            { key: 'gestao', label: 'Gestao' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t.key
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">

        {/* === RESUMO === */}
        {tab === 'resumo' && (
          <>
            {/* Status cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <InfoCard label="Subscricao" value={STATUS_LABELS_TEXT[client?.subscription_status] || 'N/A'} />
              <InfoCard label="Intake" value={hasIntake ? 'Completo' : 'Em falta'} color={hasIntake ? 'green' : 'red'} />
              <InfoCard label="Plano" value={
                activePlan?.status === 'activo' ? 'Activo' :
                activePlan ? 'Inactivo' :
                'Sem plano'
              } color={
                activePlan?.status === 'activo' ? 'green' :
                activePlan ? 'gray' : 'red'
              } />
              <InfoCard label="Check-ins" value={`${registos.length} (ultimos 30d)`} />
            </div>

            {/* Plan overview if exists */}
            {activePlan && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Plano actual</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-gray-800">{activePlan.calorias_alvo}</p>
                    <p className="text-xs text-gray-500">kcal/dia</p>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-rose-700">{activePlan.proteina_g}g</p>
                    <p className="text-xs text-gray-500">Proteina</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-amber-700">{activePlan.carboidratos_g}g</p>
                    <p className="text-xs text-gray-500">Carbs</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-purple-700">{activePlan.gordura_g}g</p>
                    <p className="text-xs text-gray-500">Gordura</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-700">{FASE_LABELS[activePlan.fase] || activePlan.fase}</p>
                    <p className="text-xs text-gray-500">Fase</p>
                  </div>
                </div>
              </div>
            )}

            {/* No plan warning */}
            {!activePlan && hasIntake && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-sm text-orange-800 font-medium mb-2">Intake preenchido mas sem plano gerado!</p>
                <button
                  onClick={handleGerarPlano}
                  disabled={gerandoPlano}
                  className="px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {gerandoPlano ? 'A gerar...' : 'Gerar plano agora'}
                </button>
              </div>
            )}

            {!hasIntake && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800 font-medium">Cliente ainda nao preencheu o intake. Sem intake, nao e possivel gerar plano.</p>
              </div>
            )}

            {/* Client weight info */}
            {client && (client.peso_inicial || client.peso_actual || client.peso_meta) && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Peso</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Inicial</p>
                    <p className="text-xl font-bold text-gray-400">{client.peso_inicial || '-'} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Actual</p>
                    <p className="text-xl font-bold text-gray-800">{client.peso_actual || '-'} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Meta</p>
                    <p className="text-xl font-bold text-green-600">{client.peso_meta || '-'} kg</p>
                  </div>
                </div>
                {client.peso_inicial && client.peso_actual && client.peso_inicial > client.peso_actual && (
                  <p className="text-center text-sm text-green-600 mt-2">
                    Ja perdeu {(client.peso_inicial - client.peso_actual).toFixed(1)} kg
                  </p>
                )}
              </div>
            )}

            {/* Recent activity */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Actividade recente</h3>
              {registos.length === 0 && aguaLogs.length === 0 && mealsLogs.length === 0 ? (
                <p className="text-sm text-gray-500">Sem actividade registada.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {registos.slice(0, 5).map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Check-in</span>
                      <span className="text-gray-400">{r.data}</span>
                      <span className={`font-medium ${r.aderencia_1a10 >= 7 ? 'text-green-600' : r.aderencia_1a10 >= 4 ? 'text-amber-600' : 'text-red-600'}`}>
                        {r.aderencia_1a10}/10
                      </span>
                    </div>
                  ))}
                  {aguaLogs.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Agua (ultimo registo)</span>
                      <span className="text-gray-400">{aguaLogs[0].data}</span>
                      <span className="font-medium text-blue-600">{aguaLogs[0].quantidade_ml}ml</span>
                    </div>
                  )}
                  {mealsLogs.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Refeicao (ultimo registo)</span>
                      <span className="text-gray-400">{mealsLogs[0].data}</span>
                      <span className={`font-medium ${mealsLogs[0].seguiu_plano === 'sim' ? 'text-green-600' : 'text-amber-600'}`}>
                        {mealsLogs[0].seguiu_plano}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* === INTAKE === */}
        {tab === 'intake' && (
          <>
            {!intake ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-500">Intake nao preenchido.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Dados do Intake</h3>
                <div className="grid grid-cols-2 gap-4">
                  <IntakeField label="Sexo" value={intake.sexo} />
                  <IntakeField label="Idade" value={intake.idade ? `${intake.idade} anos` : null} />
                  <IntakeField label="Peso actual" value={intake.peso_actual ? `${intake.peso_actual} kg` : null} />
                  <IntakeField label="Altura" value={intake.altura_cm ? `${intake.altura_cm} cm` : null} />
                  <IntakeField label="Peso meta" value={intake.peso_meta ? `${intake.peso_meta} kg` : null} />
                  <IntakeField label="Objectivo" value={OBJECTIVO_LABELS[intake.objectivo_principal] || intake.objectivo_principal} />
                  <IntakeField label="Nivel actividade" value={intake.nivel_actividade} />
                  <IntakeField label="Abordagem" value={ABORDAGEM_LABELS[intake.abordagem_preferida] || intake.abordagem_preferida} />
                  <IntakeField label="Jejum" value={intake.aceita_jejum ? 'Sim' : 'Nao'} />
                  <IntakeField label="Refeicoes/dia" value={intake.num_refeicoes_dia} />
                  <IntakeField label="Pequeno almoco" value={intake.pequeno_almoco} />
                  <IntakeField label="Emocao dominante" value={intake.emocao_dominante} />
                  <IntakeField label="Prontidao (1-10)" value={intake.prontidao_1a10} />
                </div>
                {intake.restricoes_alimentares && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-1">Restricoes alimentares:</p>
                    <p className="text-sm text-gray-800">{Array.isArray(intake.restricoes_alimentares) ? intake.restricoes_alimentares.join(', ') : intake.restricoes_alimentares}</p>
                  </div>
                )}
                {intake.tipos_comida && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Tipos de comida preferidos:</p>
                    <p className="text-sm text-gray-800">{Array.isArray(intake.tipos_comida) ? intake.tipos_comida.join(', ') : intake.tipos_comida}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-4">
                  Preenchido: {intake.created_at ? new Date(intake.created_at).toLocaleString('pt-PT') : 'N/A'}
                </p>
              </div>
            )}

            {/* Generate plan button */}
            {hasIntake && (
              <button
                onClick={handleGerarPlano}
                disabled={gerandoPlano}
                className="w-full py-3 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {gerandoPlano ? 'A gerar plano...' : (activePlan ? 'Regenerar plano' : 'Gerar plano')}
              </button>
            )}
          </>
        )}

        {/* === PLANO === */}
        {tab === 'plano' && (
          <>
            {plano.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-500 mb-3">Nenhum plano gerado.</p>
                {hasIntake ? (
                  <button
                    onClick={handleGerarPlano}
                    disabled={gerandoPlano}
                    className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {gerandoPlano ? 'A gerar...' : 'Gerar plano'}
                  </button>
                ) : (
                  <p className="text-xs text-red-500">Intake em falta - nao e possivel gerar plano.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show all plans (history) */}
                {plano.map((p, index) => (
                  <div
                    key={p.id}
                    className={`bg-white rounded-xl border p-4 ${
                      p.status === 'activo' ? 'border-green-300' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          Plano v{p.versao || index + 1}
                        </h3>
                        <PlanStatusBadge status={p.status} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString('pt-PT') : ''}
                        </span>
                      </div>
                    </div>

                    {/* Plan details */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-sm">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="font-bold text-gray-800">{p.calorias_alvo}</p>
                        <p className="text-xs text-gray-500">kcal</p>
                      </div>
                      <div className="bg-rose-50 rounded-lg p-2">
                        <p className="font-bold text-rose-700">{p.proteina_g}g</p>
                        <p className="text-xs text-gray-500">Proteina</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-2">
                        <p className="font-bold text-amber-700">{p.carboidratos_g}g</p>
                        <p className="text-xs text-gray-500">Carbs</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2">
                        <p className="font-bold text-purple-700">{p.gordura_g}g</p>
                        <p className="text-xs text-gray-500">Gordura</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2">
                        <p className="font-bold text-blue-700">{FASE_LABELS[p.fase] || p.fase}</p>
                        <p className="text-xs text-gray-500">Fase</p>
                      </div>
                    </div>

                    {/* Portions detail */}
                    {(() => {
                      let config = {};
                      try { config = p.receitas_incluidas ? JSON.parse(p.receitas_incluidas) : {}; } catch { /* */ }
                      const porcoes = config['porções_por_refeicao'] || config.porcoes_por_refeicao || {};
                      const numRef = config.num_refeicoes;
                      const horarios = config.horarios;

                      return (porcoes.proteina || numRef) ? (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                          <p className="font-medium text-gray-700 mb-1">Porcoes por refeicao:</p>
                          <div className="flex flex-wrap gap-3 text-xs">
                            {porcoes.proteina && <span>Proteina: {porcoes.proteina} palmas</span>}
                            {porcoes.legumes && <span>Legumes: {porcoes.legumes} punhos</span>}
                            {porcoes.hidratos && <span>Hidratos: {porcoes.hidratos} maos</span>}
                            {porcoes.gordura && <span>Gordura: {porcoes.gordura} polegares</span>}
                          </div>
                          {numRef && <p className="mt-1 text-xs text-gray-500">{numRef} refeicoes/dia</p>}
                          {horarios && <p className="text-xs text-gray-500">Horarios: {horarios.join(', ')}</p>}
                          {p.abordagem && <p className="text-xs text-gray-500">Abordagem: {ABORDAGEM_LABELS[p.abordagem] || p.abordagem}</p>}
                        </div>
                      ) : null;
                    })()}
                  </div>
                ))}

                {/* Regenerate button */}
                {hasIntake && (
                  <button
                    onClick={handleGerarPlano}
                    disabled={gerandoPlano}
                    className="w-full py-3 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    {gerandoPlano ? 'A gerar...' : 'Regenerar plano'}
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* === PROGRESSO === */}
        {tab === 'progresso' && (
          <>
            {/* Check-ins */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Check-ins ({registos.length})</h3>
              {registos.length === 0 ? (
                <p className="text-sm text-gray-500">Sem check-ins.</p>
              ) : (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {registos.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-600">{r.data}</span>
                      <div className="flex items-center gap-2">
                        {r.peso && <span className="text-xs text-gray-400">{r.peso}kg</span>}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.aderencia_1a10 >= 7 ? 'bg-green-100 text-green-700' :
                          r.aderencia_1a10 >= 4 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {r.aderencia_1a10}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Water */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Agua (ultimos 30 dias)</h3>
              {aguaLogs.length === 0 ? (
                <p className="text-sm text-gray-500">Sem registos de agua.</p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {/* Group by date */}
                  {Object.entries(
                    aguaLogs.reduce((acc, l) => {
                      acc[l.data] = (acc[l.data] || 0) + l.quantidade_ml;
                      return acc;
                    }, {})
                  ).map(([data, total]) => (
                    <div key={data} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-600">{data}</span>
                      <span className={`font-medium ${total >= 2000 ? 'text-blue-600' : 'text-gray-400'}`}>
                        {(total / 1000).toFixed(1)}L
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Meals */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Refeicoes (ultimos 30 dias)</h3>
              {mealsLogs.length === 0 ? (
                <p className="text-sm text-gray-500">Sem registos de refeicoes.</p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {mealsLogs.slice(0, 20).map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-600">{m.data} - {m.refeicao}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        m.seguiu_plano === 'sim' ? 'bg-green-100 text-green-700' :
                        m.seguiu_plano === 'parcial' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {m.seguiu_plano}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* === GESTAO === */}
        {tab === 'gestao' && (
          <div className="space-y-4">
            {/* Subscription management */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Subscricao</h3>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Estado</p>
                  <p className="font-medium">{STATUS_LABELS_TEXT[client?.subscription_status] || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Plano</p>
                  <p className="font-medium">{client?.subscription_plan || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Expira</p>
                  <p className="font-medium">{client?.subscription_expires ? new Date(client.subscription_expires).toLocaleDateString('pt-PT') : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Metodo pagamento</p>
                  <p className="font-medium">{client?.payment_method || 'N/A'}</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-2">Activar subscricao:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleActivate('MONTHLY')}
                  className="py-2 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  Mensal (${SUBSCRIPTION_PLANS.MONTHLY.price_usd})
                </button>
                <button
                  onClick={() => handleActivate('SEMESTRAL')}
                  className="py-2 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  Semestral (${SUBSCRIPTION_PLANS.SEMESTRAL.price_usd})
                </button>
                <button
                  onClick={() => handleActivate('ANNUAL')}
                  className="py-2 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  Anual (${SUBSCRIPTION_PLANS.ANNUAL.price_usd})
                </button>
              </div>

              <button
                onClick={async () => {
                  if (!confirm('Definir como tester?')) return;
                  try {
                    await coachApi.setTester(userId);
                    alert('Tester definido.');
                    loadClientData();
                  } catch (err) {
                    alert('Erro: ' + err.message);
                  }
                }}
                className="w-full mt-2 py-2 text-xs font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                Definir como tester (acesso gratuito)
              </button>
            </div>

            {/* Plan management */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Plano nutricional</h3>
              {hasIntake ? (
                <div className="space-y-2">
                  <button
                    onClick={handleGerarPlano}
                    disabled={gerandoPlano}
                    className="w-full py-2 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                  >
                    {gerandoPlano ? 'A gerar...' : (activePlan ? 'Regenerar plano' : 'Gerar plano')}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-red-500">Intake em falta. A cliente precisa preencher o questionario primeiro.</p>
              )}
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-xl border border-red-200 p-4">
              <h3 className="font-semibold text-red-600 mb-3">Zona perigosa</h3>
              <button
                onClick={handleDeleteClient}
                className="w-full py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Apagar cliente e todos os dados
              </button>
              <p className="text-xs text-red-400 mt-2">Esta accao e irreversivel. Remove todos os dados da cliente incluindo planos, registos, e historico.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper components
const STATUS_LABELS_TEXT = {
  tester: 'Tester',
  trial: 'Trial',
  active: 'Activo',
  pending: 'Pendente',
  expired: 'Expirado',
  cancelled: 'Cancelado',
};

function StatusBadge({ status }) {
  const colors = {
    tester: 'bg-purple-100 text-purple-700',
    trial: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    expired: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-500'}`}>
      {STATUS_LABELS_TEXT[status] || status || 'N/A'}
    </span>
  );
}

function PlanStatusBadge({ status }) {
  if (status === 'activo') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Activo</span>;
  if (status === 'inactivo') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactivo</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">{status || 'N/A'}</span>;
}

function InfoCard({ label, value, color = 'gray' }) {
  const colors = {
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-gray-50 text-gray-700',
  };
  return (
    <div className={`rounded-xl p-3 ${colors[color]}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  );
}

function IntakeField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || '-'}</p>
    </div>
  );
}
