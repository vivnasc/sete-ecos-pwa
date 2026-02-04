import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { calcularNivel, calcularProgressoNivel, formatarJoias } from '../../lib/aurea/gamificacao';
import { getPraticaDoDia, CATEGORIAS } from '../../lib/aurea/praticas';

/**
 * ÁUREA - Dashboard Principal
 * Hub central com quota, prática do dia, progresso e navegação
 */

export default function DashboardAurea() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [client, setClient] = useState(null);

  // Stats
  const [joias, setJoias] = useState(0);
  const [streakQuota, setStreakQuota] = useState(0);
  const [praticasHoje, setPraticasHoje] = useState(0);
  const [quotaHoje, setQuotaHoje] = useState(null);
  const [semanaStats, setSemanaStats] = useState({ diasCumpridos: 0, joiasGanhas: 0 });

  // Prática do dia
  const praticaDoDia = getPraticaDoDia();

  const hoje = new Date().toISOString().split('T')[0];
  const diaSemana = new Date().toLocaleDateString('pt-PT', { weekday: 'long' });
  const dataFormatada = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/aurea/login');
        return;
      }

      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('id, email')
        .eq('auth_id', user.id)
        .single();

      if (!userData) {
        navigate('/aurea/login');
        return;
      }

      setUserId(userData.id);
      setUserName(userData.email.split('@')[0]);

      // Get client data
      const { data: clientData } = await supabase
        .from('aurea_clients')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (clientData) {
        setClient(clientData);
        setJoias(clientData.joias_total || 0);
        setStreakQuota(clientData.streak_quota || 0);
      }

      // Load today's quota check-in
      const { data: quotaData } = await supabase
        .from('aurea_checkins_quota')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .single();

      setQuotaHoje(quotaData);

      // Load today's practices
      const { data: praticasData } = await supabase
        .from('aurea_praticas_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje);

      setPraticasHoje(praticasData?.length || 0);

      // Load week stats
      const inicioSemana = getInicioSemana();
      const { data: semanaData } = await supabase
        .from('aurea_checkins_quota')
        .select('*')
        .eq('user_id', userData.id)
        .gte('data', inicioSemana)
        .eq('resposta', 'sim');

      const { data: joiasSemana } = await supabase
        .from('aurea_joias_log')
        .select('quantidade')
        .eq('user_id', userData.id)
        .gte('created_at', inicioSemana);

      const totalJoiasSemana = joiasSemana?.reduce((acc, j) => acc + j.quantidade, 0) || 0;

      setSemanaStats({
        diasCumpridos: semanaData?.length || 0,
        joiasGanhas: totalJoiasSemana
      });

    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInicioSemana = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const handleQuotaCheckin = async (resposta) => {
    try {
      // Save check-in
      await supabase.from('aurea_checkins_quota').upsert({
        user_id: userId,
        data: hoje,
        resposta,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,data' });

      // If positive, add joia
      if (resposta === 'sim') {
        await addJoias(1, 'quota_cumprida');
      }

      setQuotaHoje({ resposta });
      loadDashboard();
    } catch (err) {
      console.error('Erro ao registar check-in:', err);
    }
  };

  const addJoias = async (quantidade, motivo) => {
    try {
      // Log joias
      await supabase.from('aurea_joias_log').insert({
        user_id: userId,
        quantidade,
        motivo,
        created_at: new Date().toISOString()
      });

      // Update total
      const newTotal = joias + quantidade;
      await supabase
        .from('aurea_clients')
        .update({ joias_total: newTotal })
        .eq('user_id', userId);

      setJoias(newTotal);
    } catch (err) {
      console.error('Erro ao adicionar jóias:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const nivelInfo = calcularProgressoNivel(joias);

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-200/60 text-sm capitalize">{diaSemana}</p>
            <h1 className="text-xl font-bold text-amber-100">{dataFormatada}</h1>
          </div>
          <Link to="/aurea/perfil" className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-xl">👸</span>
          </Link>
        </div>

        {/* Saudação */}
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-amber-100" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Olá, {userName} ✨
          </h2>
          <p className="text-amber-200/70 text-sm mt-1">
            {quotaHoje?.resposta === 'sim'
              ? 'Já respeitaste a tua quota hoje!'
              : 'Como foi o teu dia?'}
          </p>
        </div>
      </header>

      <main className="px-4 space-y-4">
        {/* Nível e Jóias */}
        <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: nivelInfo.nivelActual.cor + '30' }}>
                {nivelInfo.nivelActual.icone}
              </div>
              <div>
                <div className="text-amber-100 font-bold">{nivelInfo.nivelActual.nome}</div>
                <div className="text-amber-200/60 text-sm">{nivelInfo.nivelActual.subtitulo}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-300">{formatarJoias(joias)} ✨</div>
              <div className="text-amber-200/50 text-xs">jóias</div>
            </div>
          </div>

          {/* Progress bar */}
          {nivelInfo.proximoNivel && (
            <div>
              <div className="flex justify-between text-xs text-amber-200/50 mb-1">
                <span>{nivelInfo.nivelActual.nome}</span>
                <span>{nivelInfo.proximoNivel.nome}</span>
              </div>
              <div className="h-2 bg-amber-900/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${nivelInfo.progresso}%`,
                    backgroundColor: nivelInfo.nivelActual.cor
                  }}
                />
              </div>
              <p className="text-amber-200/50 text-xs mt-1 text-center">
                {nivelInfo.joiasParaProximo} jóias para {nivelInfo.proximoNivel.nome}
              </p>
            </div>
          )}
        </div>

        {/* Quota Check-in */}
        {!quotaHoje && (
          <div className="p-4 bg-gradient-to-br from-amber-600/20 to-amber-500/20 rounded-2xl border border-amber-500/30">
            <h3 className="text-amber-100 font-bold mb-2">Hoje respeitaste a tua quota?</h3>
            <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-white/5 rounded-xl">
              <div className="text-center">
                <div className="text-amber-300 font-bold">{client?.quota_tempo_horas || 3}h</div>
                <div className="text-amber-200/50 text-xs">tempo/semana</div>
              </div>
              <div className="text-center border-x border-amber-500/20">
                <div className="text-amber-300 font-bold">{(client?.quota_dinheiro_mzn || 2000).toLocaleString()} MT</div>
                <div className="text-amber-200/50 text-xs">dinheiro/mês</div>
              </div>
              <div className="text-center">
                <div className="text-amber-300 font-bold">{client?.quota_energia_actividades || 2}</div>
                <div className="text-amber-200/50 text-xs">actividades</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuotaCheckin('sim')}
                className="py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-colors"
              >
                ✅ Sim
              </button>
              <button
                onClick={() => handleQuotaCheckin('parcial')}
                className="py-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-300 hover:bg-yellow-500/30 transition-colors"
              >
                ⚠️ Parcial
              </button>
              <button
                onClick={() => handleQuotaCheckin('nao')}
                className="py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-colors"
              >
                ❌ Não
              </button>
            </div>
          </div>
        )}

        {quotaHoje && (
          <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {quotaHoje.resposta === 'sim' ? '✅' : quotaHoje.resposta === 'parcial' ? '⚠️' : '❌'}
                </div>
                <div>
                  <div className="text-amber-100 font-medium">Quota de hoje</div>
                  <div className="text-amber-200/60 text-sm">
                    {quotaHoje.resposta === 'sim' ? 'Respeitaste-te!' : quotaHoje.resposta === 'parcial' ? 'Parcialmente' : 'Amanhã é outro dia'}
                  </div>
                </div>
              </div>
              {quotaHoje.resposta === 'sim' && (
                <div className="text-amber-300">+1 ✨</div>
              )}
            </div>
          </div>
        )}

        {/* Prática do Dia */}
        <Link to="/aurea/praticas" className="block p-4 bg-white/5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: CATEGORIAS[praticaDoDia.categoria.toUpperCase()].cor + '30' }}>
              {CATEGORIAS[praticaDoDia.categoria.toUpperCase()].icone}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-amber-200/60 text-xs uppercase">{CATEGORIAS[praticaDoDia.categoria.toUpperCase()].nome}</span>
                <span className="text-amber-300 text-xs">+{praticaDoDia.joias} ✨</span>
              </div>
              <p className="text-amber-100">{praticaDoDia.texto}</p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <span className="text-amber-300 text-sm">Ver mais práticas →</span>
          </div>
        </Link>

        {/* Esta Semana */}
        <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
          <h3 className="text-amber-100 font-bold mb-3">Esta Semana</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-amber-300">{semanaStats.diasCumpridos}/7</div>
              <div className="text-amber-200/60 text-xs">dias quota</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-amber-300">{semanaStats.joiasGanhas}</div>
              <div className="text-amber-200/60 text-xs">jóias ganhas</div>
            </div>
          </div>
          {streakQuota > 0 && (
            <div className="mt-3 text-center">
              <span className="text-amber-400">🔥 {streakQuota} dias seguidos!</span>
            </div>
          )}
        </div>

        {/* Quick Actions - Row 1 */}
        <div className="grid grid-cols-3 gap-3">
          <Link to="/aurea/roupa" className="p-4 bg-white/5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-colors text-center">
            <div className="text-2xl mb-2">👗</div>
            <div className="text-amber-100 text-xs font-medium">Roupa</div>
          </Link>
          <Link to="/aurea/carteira" className="p-4 bg-white/5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-colors text-center">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-amber-100 text-xs font-medium">Carteira</div>
          </Link>
          <Link to="/aurea/diario" className="p-4 bg-white/5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-colors text-center">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-amber-100 text-xs font-medium">Diário</div>
          </Link>
        </div>

        {/* Quick Actions - Row 2 */}
        <div className="grid grid-cols-3 gap-3">
          <Link to="/aurea/chat" className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-2xl border border-amber-500/30 hover:border-amber-500/50 transition-colors text-center">
            <div className="text-2xl mb-2">💬</div>
            <div className="text-amber-100 text-xs font-medium">Chat Coach</div>
          </Link>
          <Link to="/aurea/padroes" className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl border border-purple-500/30 hover:border-purple-500/50 transition-colors text-center">
            <div className="text-2xl mb-2">🔍</div>
            <div className="text-amber-100 text-xs font-medium">Padrões</div>
          </Link>
          <Link to="/aurea/audios" className="p-4 bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 rounded-2xl border border-indigo-500/30 hover:border-indigo-500/50 transition-colors text-center">
            <div className="text-2xl mb-2">🎧</div>
            <div className="text-amber-100 text-xs font-medium">Áudios</div>
          </Link>
        </div>

        {/* Row 3 - Insights e Notificações */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/aurea/insights" className="p-4 bg-white/5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div className="flex-1">
                <div className="text-amber-100 font-medium text-sm">Insights</div>
                <div className="text-amber-200/50 text-xs">Relatório semanal</div>
              </div>
            </div>
          </Link>
          <Link to="/aurea/notificacoes" className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl border border-green-500/30 hover:border-green-500/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <div className="flex-1">
                <div className="text-amber-100 font-medium text-sm">Lembretes</div>
                <div className="text-green-300/60 text-xs">WhatsApp + Push</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Níveis mais altos */}
        {nivelInfo.nivelActual.id === 'prata' && (
          <Link to="/aurea/meditacoes" className="block p-4 bg-gradient-to-r from-purple-500/20 to-purple-400/20 rounded-2xl border border-purple-500/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎧</span>
              <div>
                <div className="text-purple-200 font-medium">Áudio-Meditações</div>
                <div className="text-purple-300/60 text-sm">5 meditações desbloqueadas</div>
              </div>
            </div>
          </Link>
        )}

        {nivelInfo.nivelActual.id === 'ouro' && (
          <Link to="/aurea/ritual" className="block p-4 bg-gradient-to-r from-amber-500/20 to-amber-400/20 rounded-2xl border border-amber-400/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌙</span>
              <div>
                <div className="text-amber-200 font-medium">Ritual Mensal</div>
                <div className="text-amber-300/60 text-sm">Balanço de Ouro disponível</div>
              </div>
            </div>
          </Link>
        )}

        {nivelInfo.nivelActual.id === 'diamante' && (
          <Link to="/aurea/comunidade" className="block p-4 bg-gradient-to-r from-cyan-500/20 to-cyan-400/20 rounded-2xl border border-cyan-500/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <div className="text-cyan-200 font-medium">Comunidade Anónima</div>
                <div className="text-cyan-300/60 text-sm">Campo de testemunhos</div>
              </div>
            </div>
          </Link>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D2A24]/95 backdrop-blur-sm border-t border-amber-500/20 px-4 py-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link to="/aurea/dashboard" className="flex flex-col items-center text-amber-400">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/aurea/praticas" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">💎</span>
            <span className="text-xs mt-1">Práticas</span>
          </Link>
          <Link to="/aurea/roupa" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">👗</span>
            <span className="text-xs mt-1">Roupa</span>
          </Link>
          <Link to="/aurea/carteira" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">💰</span>
            <span className="text-xs mt-1">Carteira</span>
          </Link>
          <Link to="/aurea/perfil" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">⚙️</span>
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
