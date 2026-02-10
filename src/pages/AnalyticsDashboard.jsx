import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Analytics Dashboard - Métricas avançadas de monetização
 *
 * - Funil de conversão completo
 * - MRR (Monthly Recurring Revenue)
 * - Churn rate e análise
 * - Cohort retention
 * - LTV e ARPU
 * - Revenue breakdown
 */

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y
  const [metrics, setMetrics] = useState({
    funil: [],
    mrr: [],
    churn: { rate: 0, valor: 0 },
    cohorts: [],
    ltv: 0,
    arpu: 0,
    breakdown: [],
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [funil, mrr, churn, cohorts, breakdown] = await Promise.all([
        calcularFunil(),
        calcularMRR(),
        calcularChurn(),
        calcularCohorts(),
        calcularBreakdown(),
      ]);

      const ltv = calcularLTV(cohorts);
      const arpu = calcularARPU(breakdown);

      setMetrics({ funil, mrr, churn, cohorts, ltv, arpu, breakdown });
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    }
    setLoading(false);
  };

  // ============================================================
  // CÁLCULOS DE MÉTRICAS
  // ============================================================

  const calcularFunil = async () => {
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: luminaUsers } = await supabase.from('lumina_checkins').select('user_id', { count: 'exact', head: true });
    const { count: trialUsers } = await supabase.from('vitalis_clients').select('*', { count: 'exact', head: true }).eq('subscription_status', 'trial');
    const { count: paidUsers } = await supabase.from('vitalis_clients').select('*', { count: 'exact', head: true }).in('subscription_status', ['active', 'tester']);

    const funil = [
      { stage: 'Registo', value: totalUsers || 0, percent: 100 },
      { stage: 'Lumina', value: luminaUsers || 0, percent: totalUsers ? Math.round((luminaUsers / totalUsers) * 100) : 0 },
      { stage: 'Trial', value: trialUsers || 0, percent: totalUsers ? Math.round((trialUsers / totalUsers) * 100) : 0 },
      { stage: 'Pago', value: paidUsers || 0, percent: totalUsers ? Math.round((paidUsers / totalUsers) * 100) : 0 },
    ];

    return funil;
  };

  const calcularMRR = async () => {
    // Simular dados de MRR dos últimos 6 meses
    // Em produção, isto viria de payment_logs ou subscription_stats
    const meses = [];
    const hoje = new Date();

    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoje);
      mes.setMonth(mes.getMonth() - i);
      const mesNome = mes.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });

      // Query aproximada: contar subscritores ativos naquele mês
      const primeiroDia = new Date(mes.getFullYear(), mes.getMonth(), 1).toISOString();
      const ultimoDia = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).toISOString();

      const { data: vitalisAtivos } = await supabase
        .from('vitalis_clients')
        .select('subscription_plan, subscription_status')
        .in('subscription_status', ['active', 'trial', 'tester'])
        .lte('created_at', ultimoDia);

      const { data: aureaAtivos } = await supabase
        .from('aurea_clients')
        .select('subscription_plan, subscription_status')
        .in('subscription_status', ['active', 'trial', 'tester'])
        .lte('created_at', ultimoDia);

      // Calcular receita aproximada (baseado nos planos)
      const vitalisMRR = (vitalisAtivos || []).reduce((sum, c) => {
        if (c.subscription_status === 'tester') return sum;
        if (c.subscription_plan === 'MENSAL') return sum + 2500;
        if (c.subscription_plan === 'SEMESTRAL') return sum + (12500 / 6);
        if (c.subscription_plan === 'ANUAL') return sum + (21000 / 12);
        return sum;
      }, 0);

      const aureaMRR = (aureaAtivos || []).reduce((sum, c) => {
        if (c.subscription_status === 'tester') return sum;
        if (c.subscription_plan === 'MENSAL') return sum + 975;
        if (c.subscription_plan === 'SEMESTRAL') return sum + (5265 / 6);
        if (c.subscription_plan === 'ANUAL') return sum + (9945 / 12);
        return sum;
      }, 0);

      meses.push({
        mes: mesNome,
        mrr: Math.round(vitalisMRR + aureaMRR),
        vitalis: Math.round(vitalisMRR),
        aurea: Math.round(aureaMRR),
      });
    }

    return meses;
  };

  const calcularChurn = async () => {
    // Churn rate: % de clientes que cancelaram no último mês
    const umMesAtras = new Date();
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);

    const { count: totalAtivos } = await supabase
      .from('vitalis_clients')
      .select('*', { count: 'exact', head: true })
      .in('subscription_status', ['active', 'trial', 'tester']);

    const { count: cancelados } = await supabase
      .from('vitalis_clients')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'expired')
      .gte('subscription_end', umMesAtras.toISOString());

    const rate = totalAtivos ? Math.round((cancelados / totalAtivos) * 100) : 0;
    const valor = cancelados * 2500; // Assumir plano mensal médio

    return { rate, valor };
  };

  const calcularCohorts = async () => {
    // Cohort retention: % que permanece ativa após 1, 3, 6 meses
    const cohorts = [];
    const mesesAtras = [1, 3, 6];

    for (const meses of mesesAtras) {
      const dataInicio = new Date();
      dataInicio.setMonth(dataInicio.getMonth() - meses);

      const { data: clientesCohort } = await supabase
        .from('vitalis_clients')
        .select('subscription_status, created_at')
        .lte('created_at', dataInicio.toISOString());

      const total = clientesCohort?.length || 0;
      const ativos = clientesCohort?.filter(c => ['active', 'trial', 'tester'].includes(c.subscription_status)).length || 0;
      const retention = total ? Math.round((ativos / total) * 100) : 0;

      cohorts.push({
        periodo: `${meses} ${meses === 1 ? 'mês' : 'meses'}`,
        total,
        ativos,
        retention,
      });
    }

    return cohorts;
  };

  const calcularBreakdown = async () => {
    const { data: vitalis } = await supabase
      .from('vitalis_clients')
      .select('subscription_plan, subscription_status')
      .in('subscription_status', ['active', 'tester']);

    const { data: aurea } = await supabase
      .from('aurea_clients')
      .select('subscription_plan, subscription_status')
      .in('subscription_status', ['active', 'tester']);

    const vitalisReceita = (vitalis || []).reduce((sum, c) => {
      if (c.subscription_status === 'tester') return sum;
      if (c.subscription_plan === 'MENSAL') return sum + 2500;
      if (c.subscription_plan === 'SEMESTRAL') return sum + 12500;
      if (c.subscription_plan === 'ANUAL') return sum + 21000;
      return sum;
    }, 0);

    const aureaReceita = (aurea || []).reduce((sum, c) => {
      if (c.subscription_status === 'tester') return sum;
      if (c.subscription_plan === 'MENSAL') return sum + 975;
      if (c.subscription_plan === 'SEMESTRAL') return sum + 5265;
      if (c.subscription_plan === 'ANUAL') return sum + 9945;
      return sum;
    }, 0);

    return [
      { name: 'Vitalis', value: vitalisReceita, clientes: vitalis?.length || 0 },
      { name: 'Áurea', value: aureaReceita, clientes: aurea?.length || 0 },
    ];
  };

  const calcularLTV = (cohorts) => {
    // LTV simplificado: ARPU * lifetime médio (baseado na retention)
    // Se retention de 6 meses é 70%, lifetime médio ≈ 18 meses
    const retention6m = cohorts.find(c => c.periodo === '6 meses')?.retention || 50;
    const lifetimeEstimado = retention6m > 50 ? 18 : 12;
    return Math.round(metrics.arpu * lifetimeEstimado);
  };

  const calcularARPU = (breakdown) => {
    const totalReceita = breakdown.reduce((sum, b) => sum + b.value, 0);
    const totalClientes = breakdown.reduce((sum, b) => sum + b.clientes, 0);
    return totalClientes ? Math.round(totalReceita / totalClientes) : 0;
  };

  // ============================================================
  // RENDER
  // ============================================================

  const COLORS = {
    primary: '#7C8B6F',
    secondary: '#C9A227',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C8B6F] mx-auto mb-4"></div>
          <p className="text-[#6B5C4C]">A carregar analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2D3A25] to-[#3D4A2F] text-white px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/coach" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
            ← Coach Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Analytics Dashboard
          </h1>
          <p className="text-white/80">Métricas avançadas de monetização</p>

          {/* Time Range Selector */}
          <div className="flex gap-2 mt-4">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-white text-[#2D3A25]'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : range === '90d' ? '90 dias' : '1 ano'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* KPIs Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard
            title="MRR Atual"
            value={`${(metrics.mrr[metrics.mrr.length - 1]?.mrr || 0).toLocaleString('pt-MZ')} MZN`}
            subtitle={`≈ $${Math.round((metrics.mrr[metrics.mrr.length - 1]?.mrr || 0) / 65.5)}`}
            color={COLORS.primary}
          />
          <KPICard
            title="ARPU"
            value={`${metrics.arpu.toLocaleString('pt-MZ')} MZN`}
            subtitle="Receita média/utilizadora"
            color={COLORS.success}
          />
          <KPICard
            title="Churn Rate"
            value={`${metrics.churn.rate}%`}
            subtitle={`${metrics.churn.valor.toLocaleString('pt-MZ')} MZN perdidos`}
            color={metrics.churn.rate > 10 ? COLORS.danger : COLORS.success}
          />
          <KPICard
            title="LTV"
            value={`${metrics.ltv.toLocaleString('pt-MZ')} MZN`}
            subtitle="Lifetime Value estimado"
            color={COLORS.secondary}
          />
        </div>

        {/* Funil de Conversão */}
        <Card title="Funil de Conversão">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.funil} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.primary}>
                {metrics.funil.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === metrics.funil.length - 1 ? COLORS.success : COLORS.primary} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {metrics.funil.map((stage, i) => (
              <div key={i} className="text-center p-3 bg-[#F5F2ED] rounded-lg">
                <p className="text-sm text-[#6B5C4C]">{stage.stage}</p>
                <p className="text-2xl font-bold text-[#2D3A25]">{stage.value}</p>
                <p className="text-xs text-[#7C8B6F]">{stage.percent}%</p>
                {i < metrics.funil.length - 1 && (
                  <p className="text-xs text-[#6B5C4C] mt-1">
                    → {Math.round((metrics.funil[i + 1].value / stage.value) * 100)}% conversão
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* MRR Trend */}
        <Card title="MRR - Monthly Recurring Revenue">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.mrr}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toLocaleString('pt-MZ')} MZN`} />
              <Legend />
              <Line type="monotone" dataKey="mrr" stroke={COLORS.primary} strokeWidth={3} name="MRR Total" />
              <Line type="monotone" dataKey="vitalis" stroke={COLORS.success} strokeWidth={2} name="Vitalis" />
              <Line type="monotone" dataKey="aurea" stroke={COLORS.secondary} strokeWidth={2} name="Áurea" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <Card title="Revenue Breakdown">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.breakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.primary : COLORS.secondary} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString('pt-MZ')} MZN`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {metrics.breakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-[#F5F2ED] rounded">
                  <span className="text-sm font-medium">{item.name}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold">{item.value.toLocaleString('pt-MZ')} MZN</p>
                    <p className="text-xs text-[#6B5C4C]">{item.clientes} clientes</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Cohort Retention */}
          <Card title="Cohort Retention">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.cohorts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="retention" fill={COLORS.success} name="Retention %" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {metrics.cohorts.map((cohort, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-[#F5F2ED] rounded">
                  <span className="text-sm font-medium">{cohort.periodo}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold">{cohort.retention}% retention</p>
                    <p className="text-xs text-[#6B5C4C]">{cohort.ativos}/{cohort.total} ativos</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Insights & Recommendations */}
        <Card title="Insights & Recomendações">
          <div className="space-y-3">
            {metrics.churn.rate > 10 && (
              <Insight
                type="warning"
                title="Churn Rate Elevado"
                message={`Churn de ${metrics.churn.rate}% está acima do ideal (<8%). Considera implementar win-back campaigns e melhorar onboarding.`}
              />
            )}
            {metrics.funil[1].percent < 30 && (
              <Insight
                type="danger"
                title="Conversão Registo → Lumina Baixa"
                message={`Apenas ${metrics.funil[1].percent}% dos registos usam o Lumina. Aumenta visibilidade do Lumina no onboarding.`}
              />
            )}
            {metrics.funil[3].percent < 5 && (
              <Insight
                type="warning"
                title="Conversão para Pago Baixa"
                message={`Apenas ${metrics.funil[3].percent}% convertem para pago. Melhora o trial onboarding e adiciona mais touchpoints.`}
              />
            )}
            {metrics.arpu < 3000 && (
              <Insight
                type="info"
                title="Oportunidade de Upsell"
                message={`ARPU de ${metrics.arpu} MZN pode ser aumentado com bundles e upsells. Promove mais o Bundle Vitalis+Áurea.`}
              />
            )}
            <Insight
              type="success"
              title="LTV Saudável"
              message={`LTV estimado de ${metrics.ltv.toLocaleString('pt-MZ')} MZN indica boa retenção. Continua a investir em qualidade.`}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTES
// ============================================================

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-[#E8E2D9] overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-[#E8E2D9] bg-[#F5F2ED]">
        <h3 className="font-semibold text-lg text-[#2D3A25]">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function KPICard({ title, value, subtitle, color }) {
  return (
    <div className="bg-white rounded-xl border-2 border-[#E8E2D9] p-6 shadow-sm">
      <p className="text-sm text-[#6B5C4C] mb-2">{title}</p>
      <p className="text-3xl font-bold mb-1" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-[#6B5C4C]">{subtitle}</p>
    </div>
  );
}

function Insight({ type, title, message }) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: '✓',
    warning: '⚠️',
    danger: '❌',
    info: '💡',
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icons[type]}</span>
        <div>
          <p className="font-semibold mb-1">{title}</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}
