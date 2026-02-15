import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { calcularNivel, calcularProgressoNivel, NIVEIS, BADGES } from '../../lib/aurea/gamificacao';
import { checkAureaAccess } from '../../lib/aurea/subscriptions';
import { g } from '../../utils/genero';

/**
 * ÁUREA - Perfil
 * Configurações, quota, badges, e gestão de conta
 */

export default function PerfilAurea() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [client, setClient] = useState(null);
  const [accessInfo, setAccessInfo] = useState(null);
  const [badgesDesbloqueados, setBadgesDesbloqueados] = useState([]);
  const [stats, setStats] = useState({
    praticasTotal: 0,
    diasQuota: 0,
    entradasDiario: 0
  });

  // Edit quota
  const [editingQuota, setEditingQuota] = useState(false);
  const [quotaTempo, setQuotaTempo] = useState(2);
  const [quotaDinheiro, setQuotaDinheiro] = useState(100);
  const [quotaEnergia, setQuotaEnergia] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/aurea/login');
        return;
      }

      setUserEmail(user.email);

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (userData) {
        setUserId(userData.id);

        // Load client
        const { data: clientData } = await supabase
          .from('aurea_clients')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle();

        if (clientData) {
          setClient(clientData);
          setQuotaTempo(clientData.quota_tempo_horas || 2);
          setQuotaDinheiro(clientData.quota_dinheiro_mzn || 100);
          setQuotaEnergia(clientData.quota_energia_actividades || 1);
          setBadgesDesbloqueados(clientData.badges_desbloqueados || []);
        }

        // Check access
        const access = await checkAureaAccess(userData.id);
        setAccessInfo(access);

        // Load stats
        const { count: praticasCount } = await supabase
          .from('aurea_praticas_log')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userData.id);

        const { count: quotaCount } = await supabase
          .from('aurea_checkins_quota')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userData.id)
          .eq('resposta', 'sim');

        const { count: diarioCount } = await supabase
          .from('aurea_diario')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userData.id);

        setStats({
          praticasTotal: praticasCount || 0,
          diasQuota: quotaCount || 0,
          entradasDiario: diarioCount || 0
        });
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuota = async () => {
    try {
      await supabase
        .from('aurea_clients')
        .update({
          quota_tempo_horas: quotaTempo,
          quota_dinheiro_mzn: quotaDinheiro,
          quota_energia_actividades: quotaEnergia
        })
        .eq('user_id', userId);

      setEditingQuota(false);
      loadData();
    } catch (err) {
      console.error('Erro ao guardar:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/aurea');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const nivelInfo = calcularProgressoNivel(client?.joias_total || 0);
  const allBadges = Object.values(BADGES);

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <Link to="/aurea/dashboard" className="text-amber-200/60 hover:text-amber-200">
            ← Voltar
          </Link>
          <h1 className="text-xl font-bold text-amber-100">Perfil</h1>
        </div>
      </header>

      <main className="px-4 space-y-4">
        {/* User info */}
        <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg">
              {nivelInfo.nivelActual.icone}
            </div>
            <div className="flex-1">
              <div className="text-amber-100 font-bold">{userEmail.split('@')[0]}</div>
              <div className="text-amber-200/60 text-sm">{userEmail}</div>
              <div className="text-amber-300 text-sm mt-1">
                {nivelInfo.nivelActual.nome} — {client?.joias_total || 0} jóias
              </div>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
          <h3 className="text-amber-100 font-medium mb-3">Subscrição</h3>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-amber-200">
                {accessInfo?.status === 'trial' ? '✨ Trial' :
                  accessInfo?.status === 'active' ? `✓ ${g('Activo', 'Activa')}` :
                    accessInfo?.status === 'tester' ? '🎁 Tester' : g('Inactivo', 'Inactiva')}
              </div>
              {accessInfo?.expiresAt && (
                <div className="text-amber-200/60 text-sm">
                  Expira: {new Date(accessInfo.expiresAt).toLocaleDateString('pt-PT')}
                </div>
              )}
              {accessInfo?.daysLeft && (
                <div className="text-amber-300 text-sm">
                  {accessInfo.daysLeft} dias restantes
                </div>
              )}
            </div>
            {accessInfo?.status !== 'tester' && (
              <Link
                to="/aurea/pagamento"
                className="px-4 py-2 bg-amber-500/20 text-amber-300 rounded-lg text-sm hover:bg-amber-500/30"
              >
                {accessInfo?.status === 'trial' ? 'Subscrever' : 'Renovar'}
              </Link>
            )}
          </div>
        </div>

        {/* Quota */}
        <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-amber-100 font-medium">Quota de Presença</h3>
            <button
              onClick={() => setEditingQuota(!editingQuota)}
              className="text-amber-300 text-sm"
            >
              {editingQuota ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          {editingQuota ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-200/70">⏰ Tempo</span>
                  <span className="text-amber-300">{quotaTempo}h/semana</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={quotaTempo}
                  onChange={(e) => setQuotaTempo(parseInt(e.target.value))}
                  className="w-full h-2 bg-amber-900/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-200/70">💰 Dinheiro</span>
                  <span className="text-amber-300">{quotaDinheiro} MT/mês</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="50"
                  value={quotaDinheiro}
                  onChange={(e) => setQuotaDinheiro(parseInt(e.target.value))}
                  className="w-full h-2 bg-amber-900/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-200/70">✨ Energia</span>
                  <span className="text-amber-300">{quotaEnergia} act./semana</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={quotaEnergia}
                  onChange={(e) => setQuotaEnergia(parseInt(e.target.value))}
                  className="w-full h-2 bg-amber-900/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <button
                onClick={handleSaveQuota}
                className="w-full py-2 bg-amber-500 text-white rounded-lg"
              >
                Guardar
              </button>
            </div>
          ) : (
            <div className="flex justify-around text-center">
              <div>
                <div className="text-xl font-bold text-amber-300">{client?.quota_tempo_horas || 2}h</div>
                <div className="text-amber-200/50 text-xs">tempo</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-300">{client?.quota_dinheiro_mzn || 100} MT</div>
                <div className="text-amber-200/50 text-xs">dinheiro</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-300">{client?.quota_energia_actividades || 1}</div>
                <div className="text-amber-200/50 text-xs">actividades</div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
          <h3 className="text-amber-100 font-medium mb-3">Estatísticas</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-white/5 rounded-xl">
              <div className="text-xl font-bold text-amber-300">{stats.praticasTotal}</div>
              <div className="text-amber-200/50 text-xs">práticas</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
              <div className="text-xl font-bold text-amber-300">{stats.diasQuota}</div>
              <div className="text-amber-200/50 text-xs">dias quota</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
              <div className="text-xl font-bold text-amber-300">{stats.entradasDiario}</div>
              <div className="text-amber-200/50 text-xs">entradas diário</div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
          <h3 className="text-amber-100 font-medium mb-3">Conquistas ({badgesDesbloqueados.length}/{allBadges.length})</h3>
          <div className="grid grid-cols-4 gap-2">
            {allBadges.slice(0, 8).map((badge) => {
              const desbloqueado = badgesDesbloqueados.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-2 rounded-xl text-center ${desbloqueado ? 'bg-amber-500/20' : 'bg-white/5 opacity-40'}`}
                  title={badge.nome}
                >
                  <div className="text-2xl">{badge.icone}</div>
                  <div className="text-amber-200/70 text-xs mt-1 truncate">{badge.nome}</div>
                </div>
              );
            })}
          </div>
          {allBadges.length > 8 && (
            <p className="text-amber-200/50 text-xs text-center mt-2">
              +{allBadges.length - 8} conquistas
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Link
            to="/aurea/insights"
            className="block w-full p-4 bg-white/5 rounded-xl border border-amber-500/20 text-amber-200 hover:bg-white/10 transition-colors"
          >
            📊 Ver Insights Semanais
          </Link>
          <button
            onClick={handleLogout}
            className="w-full p-4 bg-red-500/10 rounded-xl border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-colors"
          >
            Sair da conta
          </button>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-amber-200/40 text-xs">
            ÁUREA v1.0 | Sete Ecos
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D2A24]/95 backdrop-blur-sm border-t border-amber-500/20 px-4 py-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link to="/aurea/dashboard" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
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
          <Link to="/aurea/perfil" className="flex flex-col items-center text-amber-400">
            <span className="text-xl">⚙️</span>
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
