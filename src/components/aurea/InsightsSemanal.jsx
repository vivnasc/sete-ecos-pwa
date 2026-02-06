import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { calcularProgressoNivel } from '../../lib/aurea/gamificacao';

/**
 * ÁUREA - Insights Semanais
 * Relatório automático com padrões, progresso e reflexões
 */

export default function InsightsSemanal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  function getInicioSemana() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/aurea/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (userData) {
        setUserId(userData.id);
        const inicioSemana = getInicioSemana();

        // Get client data
        const { data: client } = await supabase
          .from('aurea_clients')
          .select('joias_total, streak_quota')
          .eq('user_id', userData.id)
          .maybeSingle();

        // Quota stats
        const { data: quotas } = await supabase
          .from('aurea_checkins_quota')
          .select('*')
          .eq('user_id', userData.id)
          .gte('data', inicioSemana);

        const quotaCumprida = quotas?.filter(q => q.resposta === 'sim').length || 0;
        const quotaParcial = quotas?.filter(q => q.resposta === 'parcial').length || 0;
        const quotaNao = quotas?.filter(q => q.resposta === 'nao').length || 0;

        // Práticas stats
        const { data: praticas } = await supabase
          .from('aurea_praticas_log')
          .select('*')
          .eq('user_id', userData.id)
          .gte('data', inicioSemana);

        const praticasSemCulpa = praticas?.filter(p => p.nivel_culpa === 'sem').length || 0;
        const praticasTotal = praticas?.length || 0;

        // Jóias this week
        const { data: joias } = await supabase
          .from('aurea_joias_log')
          .select('quantidade')
          .eq('user_id', userData.id)
          .gte('created_at', inicioSemana);

        const joiasSemana = joias?.reduce((acc, j) => acc + j.quantidade, 0) || 0;

        // Carteira
        const { data: carteira } = await supabase
          .from('aurea_carteira')
          .select('*')
          .eq('user_id', userData.id)
          .eq('semana', inicioSemana)
          .maybeSingle();

        // Roupa
        const { data: roupa } = await supabase
          .from('aurea_roupa_checkins')
          .select('*')
          .eq('user_id', userData.id)
          .gte('data', inicioSemana)
          .maybeSingle();

        // Culpa patterns
        const { data: culpaData } = await supabase
          .from('aurea_culpa_log')
          .select('nivel')
          .eq('user_id', userData.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const culpaTotal = culpaData?.length || 0;
        const culpaMuita = culpaData?.filter(c => c.nivel === 'muita').length || 0;

        // Calculate percentages
        const percentagemQuota = quotas?.length > 0 ? Math.round((quotaCumprida / quotas.length) * 100) : 0;
        const percentagemSemCulpa = praticasTotal > 0 ? Math.round((praticasSemCulpa / praticasTotal) * 100) : 0;

        // Generate pattern insight
        let padrao = '';
        if (quotaNao >= 3) {
          padrao = 'Notamos que abdicas mais de ti em certos dias. O que está a acontecer nesses momentos?';
        } else if (culpaMuita > culpaTotal * 0.5) {
          padrao = 'A culpa ainda aparece com frequência. Está tudo bem — isso muda com prática.';
        } else if (percentagemQuota >= 80) {
          padrao = 'Tens respeitado a tua quota consistentemente. Isso é impressionante!';
        } else {
          padrao = 'Estás a construir novos hábitos. Cada dia conta.';
        }

        // Generate reflection question
        const perguntas = [
          'O que seria diferente se o fim-de-semana também fosse teu?',
          'Onde é que ainda te colocas em último lugar?',
          'Que permissão vais dar-te esta semana?',
          'O que te impede de gastar mais contigo?',
          'Que peça bonita vais usar amanhã?'
        ];
        const pergunta = perguntas[Math.floor(Math.random() * perguntas.length)];

        const nivelInfo = calcularProgressoNivel(client?.joias_total || 0);

        setInsights({
          semana: inicioSemana,
          quotaCumprida,
          quotaTotal: quotas?.length || 0,
          percentagemQuota,
          praticasTotal,
          praticasSemCulpa,
          percentagemSemCulpa,
          joiasSemana,
          joiasTotal: client?.joias_total || 0,
          nivel: nivelInfo.nivelActual,
          proximoNivel: nivelInfo.proximoNivel,
          joiasParaProximo: nivelInfo.joiasParaProximo,
          gastoMim: carteira?.percentagem_mim || null,
          modosRoupa: roupa?.modo_dominante || null,
          padrao,
          pergunta,
          streak: client?.streak_quota || 0
        });
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-amber-200">Sem dados suficientes para insights.</p>
          <Link to="/aurea/dashboard" className="text-amber-400 mt-4 inline-block">
            ← Voltar ao dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <Link to="/aurea/dashboard" className="text-amber-200/60 hover:text-amber-200">
            ← Voltar
          </Link>
          <h1 className="text-xl font-bold text-amber-100">Insights Semanais</h1>
        </div>
      </header>

      <main className="px-4 space-y-4">
        {/* Main Card */}
        <div className="p-6 bg-gradient-to-br from-amber-600/20 to-amber-500/20 rounded-2xl border border-amber-500/30">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-amber-100" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              ÁUREA — A Tua Semana
            </h2>
          </div>

          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-amber-300 mb-1">{insights.percentagemQuota}%</div>
            <div className="text-amber-200/70">Esta semana respeitaste-te</div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-white/10 rounded-xl text-center">
              <div className="text-amber-200/60 text-xs mb-1">📊 Quota cumprida</div>
              <div className="text-amber-100 font-bold">{insights.quotaCumprida}/{insights.quotaTotal} dias</div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl text-center">
              <div className="text-amber-200/60 text-xs mb-1">💎 Práticas</div>
              <div className="text-amber-100 font-bold">{insights.praticasTotal}</div>
            </div>
            {insights.gastoMim !== null && (
              <div className="p-3 bg-white/10 rounded-xl text-center">
                <div className="text-amber-200/60 text-xs mb-1">💰 Gastaste contigo</div>
                <div className={`font-bold ${insights.gastoMim >= 10 ? 'text-green-300' : 'text-amber-100'}`}>
                  {insights.gastoMim}%
                </div>
              </div>
            )}
            <div className="p-3 bg-white/10 rounded-xl text-center">
              <div className="text-amber-200/60 text-xs mb-1">😌 Práticas sem culpa</div>
              <div className="text-amber-100 font-bold">{insights.percentagemSemCulpa}%</div>
            </div>
          </div>

          {/* Pattern */}
          <div className="p-4 bg-white/10 rounded-xl mb-6">
            <div className="text-amber-200/60 text-xs mb-2">O teu padrão:</div>
            <p className="text-amber-100 italic">"{insights.padrao}"</p>
          </div>

          {/* Question */}
          <div className="p-4 bg-amber-500/20 rounded-xl mb-6 border border-amber-400/30">
            <div className="text-amber-300 text-xs mb-2">Uma pergunta:</div>
            <p className="text-amber-100 font-medium">"{insights.pergunta}"</p>
          </div>

          {/* Jóias */}
          <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
            <div>
              <div className="text-amber-200/60 text-sm">Jóias ganhas esta semana</div>
              <div className="text-2xl font-bold text-amber-300">{insights.joiasSemana} ✨</div>
            </div>
            <div className="text-right">
              <div className="text-amber-200/60 text-sm">Próximo nível</div>
              <div className="text-amber-100">
                {insights.proximoNivel ? (
                  <>
                    {insights.proximoNivel.nome}
                    <span className="text-amber-200/60 text-sm ml-1">(faltam {insights.joiasParaProximo})</span>
                  </>
                ) : (
                  'Nível máximo! 💎'
                )}
              </div>
            </div>
          </div>

          {/* Streak */}
          {insights.streak > 0 && (
            <div className="mt-4 text-center">
              <span className="text-amber-400">🔥 {insights.streak} dias seguidos de quota cumprida!</span>
            </div>
          )}
        </div>

        {/* Tips based on data */}
        <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
          <h3 className="text-amber-100 font-medium mb-3">Sugestões para esta semana</h3>
          <ul className="space-y-2 text-amber-200/80 text-sm">
            {insights.percentagemQuota < 50 && (
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Tenta cumprir a quota pelo menos 4 dias esta semana</span>
              </li>
            )}
            {insights.percentagemSemCulpa < 50 && (
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>A culpa ainda aparece frequentemente. Respira fundo e lembra-te: mereces.</span>
              </li>
            )}
            {insights.gastoMim !== null && insights.gastoMim < 5 && (
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Reserva pelo menos 5-10% do teu dinheiro só para prazer</span>
              </li>
            )}
            {insights.praticasTotal < 3 && (
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Experimenta fazer uma micro-prática por dia — são só 2-5 minutos</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span>✨</span>
              <span>Celebra: estás aqui. Isso já é um passo.</span>
            </li>
          </ul>
        </div>

        {/* Share */}
        <div className="text-center py-4">
          <p className="text-amber-200/50 text-sm">
            Insights gerados a {new Date().toLocaleDateString('pt-PT')}
          </p>
        </div>
      </main>
    </div>
  );
}
