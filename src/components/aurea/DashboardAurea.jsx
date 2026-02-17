import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { calcularNivel, calcularProgressoNivel, formatarJoias } from '../../lib/aurea/gamificacao';
import { getPraticaDoDia, CATEGORIAS } from '../../lib/aurea/praticas';

/**
 * ÁUREA - Dashboard Principal
 * Design claro, feminino, alegre - presença e auto-valor
 */

// Cores femininas e alegres
const CORES = {
  bg: '#FDF8F3',           // Creme suave
  bgCard: '#FFFFFF',       // Branco puro
  gold: '#C9A227',         // Dourado ÁUREA
  goldLight: '#E8D59E',    // Dourado claro
  goldDark: '#7A6200',     // Dourado escuro (WCAG AA)
  rose: '#E8B4B8',         // Rosa suave
  roseDark: '#D4919A',     // Rosa médio
  text: '#4A3728',         // Castanho texto
  textLight: '#7A6445',    // Castanho claro (WCAG AA)
  accent: '#F5E6D3',       // Bege accent
};

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
  const [evolucaoSemanal, setEvolucaoSemanal] = useState([]);

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

      const { data: userData } = await supabase
        .from('users')
        .select('id, email, nome')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (!userData) {
        navigate('/aurea/login');
        return;
      }

      setUserId(userData.id);
      setUserName(userData.nome || userData.email?.split('@')[0] || '');

      const { data: clientData } = await supabase
        .from('aurea_clients')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle();

      if (clientData) {
        setClient(clientData);
        setJoias(clientData.joias_total || 0);
        setStreakQuota(clientData.streak_quota || 0);
      }

      const { data: quotaData } = await supabase
        .from('aurea_checkins_quota')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .maybeSingle();

      setQuotaHoje(quotaData);

      const { data: praticasData } = await supabase
        .from('aurea_praticas_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje);

      setPraticasHoje(praticasData?.length || 0);

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

      // Evolucao ultimas 4 semanas (para mini-grafico)
      const quatroSemanasAtras = new Date();
      quatroSemanasAtras.setDate(quatroSemanasAtras.getDate() - 28);
      const { data: evolucaoData } = await supabase
        .from('aurea_joias_log')
        .select('quantidade, created_at')
        .eq('user_id', userData.id)
        .gte('created_at', quatroSemanasAtras.toISOString())
        .order('created_at', { ascending: true });

      if (evolucaoData && evolucaoData.length > 0) {
        // Agrupar por semana
        const semanas = {};
        evolucaoData.forEach(j => {
          const d = new Date(j.created_at);
          const weekKey = `${d.getFullYear()}-W${Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7)}`;
          semanas[weekKey] = (semanas[weekKey] || 0) + j.quantidade;
        });
        setEvolucaoSemanal(Object.entries(semanas).map(([week, total]) => ({
          semana: week.split('-W')[1] ? `S${week.split('-W')[1]}` : week,
          joias: total
        })));
      }

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
      await supabase.from('aurea_checkins_quota').upsert({
        user_id: userId,
        data: hoje,
        resposta,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,data' });

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
      await supabase.from('aurea_joias_log').insert({
        user_id: userId,
        quantidade,
        motivo,
        created_at: new Date().toISOString()
      });

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: CORES.bg }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: CORES.goldLight }}>
            <span className="text-3xl">✨</span>
          </div>
          <p style={{ color: CORES.textLight }}>A preparar o teu espaço...</p>
        </div>
      </div>
    );
  }

  const nivelInfo = calcularProgressoNivel(joias);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: CORES.bg }}>
      {/* Header com gradiente suave */}
      <header className="px-5 pt-6 pb-8" style={{ background: `linear-gradient(180deg, ${CORES.goldLight}40 0%, ${CORES.bg} 100%)` }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm capitalize" style={{ color: CORES.textLight }}>{diaSemana}</p>
            <h1 className="text-lg font-semibold" style={{ color: CORES.text }}>{dataFormatada}</h1>
          </div>
          <Link
            to="/aurea/perfil"
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: CORES.gold, boxShadow: `0 4px 15px ${CORES.gold}50` }}
          >
            <span className="text-xl">👸</span>
          </Link>
        </div>

        {/* Saudação elegante */}
        <div className="mt-2">
          <h2 className="text-2xl font-light" style={{ color: CORES.text, fontFamily: 'var(--font-titulos)' }}>
            Olá, <span className="font-semibold">{userName}</span>
          </h2>
          <p className="text-sm mt-1" style={{ color: CORES.textLight }}>
            {quotaHoje?.resposta === 'sim'
              ? '✨ Hoje já te priorizaste!'
              : 'Como vais cuidar de ti hoje?'}
          </p>
        </div>

        {/* Jóias e Nível - Card flutuante */}
        <div
          className="mt-5 p-4 rounded-2xl shadow-lg"
          style={{ backgroundColor: CORES.bgCard, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${nivelInfo.nivelActual.cor}20` }}
              >
                {nivelInfo.nivelActual.icone}
              </div>
              <div>
                <div className="font-semibold" style={{ color: CORES.text }}>{nivelInfo.nivelActual.nome}</div>
                <div className="text-xs" style={{ color: CORES.textLight }}>{nivelInfo.nivelActual.subtitulo}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: CORES.goldDark}}>{formatarJoias(joias)}</div>
              <div className="text-xs" style={{ color: CORES.textLight }}>jóias ✨</div>
            </div>
          </div>

          {nivelInfo.proximoNivel && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1" style={{ color: CORES.textLight }}>
                <span>{nivelInfo.nivelActual.nome}</span>
                <span>{nivelInfo.proximoNivel.nome}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: CORES.accent }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${nivelInfo.progresso}%`,
                    background: `linear-gradient(90deg, ${CORES.gold} 0%, ${CORES.goldLight} 100%)`
                  }}
                />
              </div>
              <p className="text-xs mt-1 text-center" style={{ color: CORES.textLight }}>
                {nivelInfo.joiasParaProximo} jóias para subir
              </p>
            </div>
          )}
        </div>
      </header>

      <main className="px-5 space-y-4 -mt-2">
        {/* Quota Check-in - Destaque se não feito */}
        {!quotaHoje && (
          <div
            className="p-5 rounded-2xl shadow-md"
            style={{
              backgroundColor: CORES.bgCard,
              border: `2px solid ${CORES.gold}`,
              boxShadow: `0 4px 15px ${CORES.gold}20`
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">💫</span>
              <h3 className="font-semibold" style={{ color: CORES.text }}>Hoje respeitaste a tua quota?</h3>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor: CORES.accent }}>
              <div className="text-center">
                <div className="font-bold" style={{ color: CORES.goldDark}}>{client?.quota_tempo_horas || 3}h</div>
                <div className="text-[10px]" style={{ color: CORES.textLight }}>tempo/semana</div>
              </div>
              <div className="text-center border-x" style={{ borderColor: CORES.goldLight }}>
                <div className="font-bold" style={{ color: CORES.goldDark}}>{(client?.quota_dinheiro_mzn || 2000).toLocaleString()}</div>
                <div className="text-[10px]" style={{ color: CORES.textLight }}>MT/mês</div>
              </div>
              <div className="text-center">
                <div className="font-bold" style={{ color: CORES.goldDark}}>{client?.quota_energia_actividades || 2}</div>
                <div className="text-[10px]" style={{ color: CORES.textLight }}>actividades</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuotaCheckin('sim')}
                className="py-3 rounded-xl font-medium transition-all hover:scale-105"
                style={{ backgroundColor: '#D4EDDA', color: '#155724' }}
              >
                ✅ Sim!
              </button>
              <button
                onClick={() => handleQuotaCheckin('parcial')}
                className="py-3 rounded-xl font-medium transition-all hover:scale-105"
                style={{ backgroundColor: '#FFF3CD', color: '#856404' }}
              >
                🌓 Parcial
              </button>
              <button
                onClick={() => handleQuotaCheckin('nao')}
                className="py-3 rounded-xl font-medium transition-all hover:scale-105"
                style={{ backgroundColor: '#F8D7DA', color: '#721C24' }}
              >
                💭 Não
              </button>
            </div>
          </div>
        )}

        {quotaHoje && (
          <div
            className="p-4 rounded-2xl flex items-center justify-between"
            style={{ backgroundColor: quotaHoje.resposta === 'sim' ? '#D4EDDA' : quotaHoje.resposta === 'parcial' ? '#FFF3CD' : CORES.bgCard }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {quotaHoje.resposta === 'sim' ? '✅' : quotaHoje.resposta === 'parcial' ? '🌓' : '💭'}
              </span>
              <div>
                <div className="font-medium" style={{ color: CORES.text }}>Quota de hoje</div>
                <div className="text-sm" style={{ color: CORES.textLight }}>
                  {quotaHoje.resposta === 'sim' ? 'Parabéns! Priorizaste-te!' : quotaHoje.resposta === 'parcial' ? 'Um passo de cada vez' : 'Amanhã é uma nova oportunidade'}
                </div>
              </div>
            </div>
            {quotaHoje.resposta === 'sim' && (
              <div className="font-bold" style={{ color: CORES.goldDark}}>+1 ✨</div>
            )}
          </div>
        )}

        {/* Esmeralda - Coach CTA destacado */}
        <Link
          to="/aurea/chat"
          className="block p-4 rounded-2xl shadow-md transition-all hover:shadow-lg hover:scale-[1.01]"
          style={{
            background: `linear-gradient(135deg, ${CORES.rose} 0%, ${CORES.roseDark} 100%)`,
            boxShadow: `0 4px 15px ${CORES.rose}50`
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center">
              <span className="text-2xl">💛</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">Fala com a Esmeralda</div>
              <div className="text-white/80 text-sm">A tua coach de auto-valor está aqui</div>
            </div>
            <div className="text-white/80">→</div>
          </div>
        </Link>

        {/* Prática do Dia */}
        <Link
          to="/aurea/praticas"
          className="block p-4 rounded-2xl shadow-md transition-all hover:shadow-lg"
          style={{ backgroundColor: CORES.bgCard }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💎</span>
            <span className="text-xs font-medium uppercase" style={{ color: CORES.goldDark}}>Prática do Dia</span>
            <span className="ml-auto text-sm font-semibold" style={{ color: CORES.goldDark}}>+{praticaDoDia.joias} ✨</span>
          </div>
          <p style={{ color: CORES.text }}>{praticaDoDia.texto}</p>
          <div className="mt-3 flex items-center justify-center gap-2 py-2 rounded-xl" style={{ backgroundColor: CORES.accent }}>
            <span style={{ color: CORES.goldDark}}>Ver todas as práticas</span>
            <span style={{ color: CORES.goldDark}}>→</span>
          </div>
        </Link>

        {/* Stats da Semana */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: CORES.bgCard, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div className="text-3xl font-bold" style={{ color: CORES.goldDark}}>{semanaStats.diasCumpridos}</div>
            <div className="text-xs" style={{ color: CORES.textLight }}>dias com quota esta semana</div>
          </div>
          <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: CORES.bgCard, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div className="text-3xl font-bold" style={{ color: CORES.goldDark}}>{semanaStats.joiasGanhas}</div>
            <div className="text-xs" style={{ color: CORES.textLight }}>jóias ganhas esta semana</div>
          </div>
        </div>

        {streakQuota > 2 && (
          <div className="text-center py-2">
            <span className="px-4 py-2 rounded-full text-sm" style={{ backgroundColor: '#FFF3CD', color: '#856404' }}>
              🔥 {streakQuota} dias seguidos a priorizar-te!
            </span>
          </div>
        )}

        {/* Ferramentas - Título de secção */}
        <div className="pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: CORES.textLight }}>
            As Tuas Ferramentas
          </h3>

          {/* Grid de ferramentas principais */}
          <div className="grid grid-cols-4 gap-3">
            <Link to="/aurea/roupa" className="flex flex-col items-center p-3 rounded-xl transition-all hover:scale-105" style={{ backgroundColor: CORES.bgCard, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <span className="text-2xl mb-1">👗</span>
              <span className="text-xs font-medium" style={{ color: CORES.text }}>Espelho</span>
            </Link>
            <Link to="/aurea/carteira" className="flex flex-col items-center p-3 rounded-xl transition-all hover:scale-105" style={{ backgroundColor: CORES.bgCard, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <span className="text-2xl mb-1">💰</span>
              <span className="text-xs font-medium" style={{ color: CORES.text }}>Carteira</span>
            </Link>
            <Link to="/aurea/diario" className="flex flex-col items-center p-3 rounded-xl transition-all hover:scale-105" style={{ backgroundColor: CORES.bgCard, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <span className="text-2xl mb-1">📝</span>
              <span className="text-xs font-medium" style={{ color: CORES.text }}>Diário</span>
            </Link>
            <Link to="/aurea/audios" className="flex flex-col items-center p-3 rounded-xl transition-all hover:scale-105" style={{ backgroundColor: CORES.bgCard, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <span className="text-2xl mb-1">🎧</span>
              <span className="text-xs font-medium" style={{ color: CORES.text }}>Áudios</span>
            </Link>
          </div>

          {/* Segunda linha */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            <Link to="/aurea/padroes" className="flex flex-col items-center p-3 rounded-xl transition-all hover:scale-105" style={{ backgroundColor: CORES.bgCard, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <span className="text-2xl mb-1">🔍</span>
              <span className="text-xs font-medium" style={{ color: CORES.text }}>Padrões</span>
            </Link>
            <Link to="/aurea/insights" className="flex flex-col items-center p-3 rounded-xl transition-all hover:scale-105" style={{ backgroundColor: CORES.bgCard, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <span className="text-2xl mb-1">📊</span>
              <span className="text-xs font-medium" style={{ color: CORES.text }}>Insights</span>
            </Link>
            <Link to="/aurea/notificacoes" className="flex flex-col items-center p-3 rounded-xl transition-all hover:scale-105" style={{ backgroundColor: CORES.bgCard, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <span className="text-2xl mb-1">🔔</span>
              <span className="text-xs font-medium" style={{ color: CORES.text }}>Lembretes</span>
            </Link>
          </div>
        </div>

        {/* Evolução Semanal (Dashboard v2) */}
        {evolucaoSemanal.length > 1 && (
          <div className="p-4 rounded-2xl" style={{ backgroundColor: CORES.bgCard, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: CORES.textLight }}>
                Evolução
              </h3>
              <Link to="/aurea/insights" className="text-xs" style={{ color: CORES.goldDark }}>
                Ver mais →
              </Link>
            </div>
            <div className="flex items-end gap-2 justify-center" style={{ height: '80px' }}>
              {evolucaoSemanal.map((s, i) => {
                const maxJoias = Math.max(...evolucaoSemanal.map(x => x.joias), 1);
                const height = Math.max(8, (s.joias / maxJoias) * 64);
                return (
                  <div key={i} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
                    <span className="text-xs font-bold" style={{ color: CORES.goldDark }}>{s.joias}</span>
                    <div
                      className="w-full rounded-t-lg transition-all duration-500"
                      style={{
                        height: `${height}px`,
                        background: `linear-gradient(180deg, ${CORES.gold} 0%, ${CORES.goldLight} 100%)`,
                        minWidth: '20px'
                      }}
                    />
                    <span className="text-[10px]" style={{ color: CORES.textLight }}>{s.semana}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lumina Integration */}
        <Link
          to="/lumina"
          className="block p-4 rounded-2xl transition-all hover:shadow-lg"
          style={{
            background: `linear-gradient(135deg, rgba(88, 86, 214, 0.08) 0%, rgba(88, 86, 214, 0.02) 100%)`,
            border: '1px solid rgba(88, 86, 214, 0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(88, 86, 214, 0.12)' }}>
              <span className="text-xl">🔮</span>
            </div>
            <div className="flex-1">
              <div className="font-medium" style={{ color: CORES.text }}>Lumina — Diagnóstico</div>
              <div className="text-sm" style={{ color: CORES.textLight }}>Descobre o que precisas hoje</div>
            </div>
            <span style={{ color: CORES.textLight }}>→</span>
          </div>
        </Link>

        {/* Partilha social */}
        {joias >= 50 && (
          <Link
            to="/comunidade"
            className="block p-4 rounded-2xl transition-all hover:shadow-lg"
            style={{ backgroundColor: CORES.bgCard, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div className="flex-1">
                <div className="font-medium" style={{ color: CORES.text }}>Partilha as tuas conquistas</div>
                <div className="text-sm" style={{ color: CORES.textLight }}>
                  {formatarJoias(joias)} jóias — nível {nivelInfo.nivelActual.nome}
                </div>
              </div>
              <span style={{ color: CORES.textLight }}>→</span>
            </div>
          </Link>
        )}

        {/* Desbloqueios por nível */}
        {nivelInfo.nivelActual.id === 'prata' && (
          <Link to="/aurea/meditacoes" className="block p-4 rounded-2xl" style={{ background: `linear-gradient(135deg, ${CORES.goldLight}50 0%, ${CORES.gold}30 100%)` }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎧</span>
              <div>
                <div className="font-medium" style={{ color: CORES.text }}>Meditações Desbloqueadas!</div>
                <div className="text-sm" style={{ color: CORES.textLight }}>5 áudios exclusivos para ti</div>
              </div>
            </div>
          </Link>
        )}
      </main>

      {/* Bottom Navigation - Claro e organizado */}
      <nav
        className="fixed bottom-0 left-0 right-0 px-4 py-3 border-t"
        style={{ backgroundColor: CORES.bgCard, borderColor: CORES.accent, boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}
      >
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link to="/aurea/dashboard" className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: CORES.gold }}>
              <span className="text-white text-lg">🏠</span>
            </div>
            <span className="text-[10px] mt-1 font-medium" style={{ color: CORES.goldDark}}>Início</span>
          </Link>
          <Link to="/aurea/praticas" className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: CORES.accent }}>
              <span className="text-lg">💎</span>
            </div>
            <span className="text-[10px] mt-1" style={{ color: CORES.textLight }}>Práticas</span>
          </Link>
          <Link to="/aurea/chat" className="flex flex-col items-center -mt-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${CORES.rose} 0%, ${CORES.roseDark} 100%)`, boxShadow: `0 4px 15px ${CORES.rose}50` }}>
              <span className="text-2xl">💛</span>
            </div>
            <span className="text-[10px] mt-1 font-medium" style={{ color: CORES.roseDark }}>Coach</span>
          </Link>
          <Link to="/aurea/roupa" className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: CORES.accent }}>
              <span className="text-lg">👗</span>
            </div>
            <span className="text-[10px] mt-1" style={{ color: CORES.textLight }}>Espelho</span>
          </Link>
          <Link to="/aurea/perfil" className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: CORES.accent }}>
              <span className="text-lg">⚙️</span>
            </div>
            <span className="text-[10px] mt-1" style={{ color: CORES.textLight }}>Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
