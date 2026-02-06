import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { g } from '../../utils/genero';

/**
 * ÁUREA - Onboarding
 * 5 ecrãs de boas-vindas com setup da Quota de Presença
 */

export default function AureaOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);

  // Quota values - valores realistas para Moçambique (café=100MT, massagem=3000MT)
  const [quotaTempo, setQuotaTempo] = useState(3);
  const [quotaDinheiro, setQuotaDinheiro] = useState(2000);
  const [quotaEnergia, setQuotaEnergia] = useState(2);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
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

      // Check if already completed onboarding
      const { data: aureaClient } = await supabase
        .from('aurea_clients')
        .select('onboarding_complete')
        .eq('user_id', userData.id)
        .maybeSingle();

      if (aureaClient?.onboarding_complete) {
        navigate('/aurea/dashboard');
        return;
      }
    }

    setLoading(false);
  };

  const handleComplete = async () => {
    setSaving(true);

    try {
      // Save quota settings and mark onboarding complete
      const { data: existingClient } = await supabase
        .from('aurea_clients')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      const clientData = {
        quota_tempo_horas: quotaTempo,
        quota_dinheiro_mzn: quotaDinheiro,
        quota_energia_actividades: quotaEnergia,
        onboarding_complete: true,
        onboarding_date: new Date().toISOString()
      };

      if (existingClient) {
        await supabase
          .from('aurea_clients')
          .update(clientData)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('aurea_clients')
          .insert({
            user_id: userId,
            ...clientData,
            created_at: new Date().toISOString()
          });
      }

      navigate('/aurea/dashboard');
    } catch (err) {
      console.error('Erro ao guardar:', err);
    } finally {
      setSaving(false);
    }
  };

  const screens = [
    // Screen 0 - Welcome
    {
      content: (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-3xl font-bold text-amber-100 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {g('Bem-vindo à ÁUREA', 'Bem-vinda à ÁUREA')}
          </h1>
          <p className="text-amber-200/80 text-lg leading-relaxed">
            Isto não é mais uma app de produtividade.
            <br /><br />
            É o teu <span className="text-amber-300 font-medium">espelho de merecimento</span>.
          </p>
        </div>
      )
    },

    // Screen 1 - What it is
    {
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-400/30 flex items-center justify-center">
            <span className="text-3xl">💰</span>
          </div>
          <h2 className="text-2xl font-bold text-amber-100 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Valor & Presença
          </h2>
          <p className="text-amber-200/80 leading-relaxed">
            Vamos trabalhar algo que ninguém fala:
            <br /><br />
            <span className="text-amber-300">A relação da mulher com existir para si</span> — sem culpa.
            <br /><br />
            Dinheiro, roupa, prazer, mimo.
            <br />
            Não é consumo. É <span className="text-amber-300 font-medium">permissão</span>.
          </p>
        </div>
      )
    },

    // Screen 2 - Not competing
    {
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-400/30 flex items-center justify-center">
            <span className="text-3xl">💎</span>
          </div>
          <h2 className="text-2xl font-bold text-amber-100 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Só tu e tu
          </h2>
          <p className="text-amber-200/80 leading-relaxed">
            Não vais encontrar pontos, rankings ou competição.
            <br /><br />
            Só o <span className="text-amber-300">teu progresso</span>, ao teu ritmo.
            <br /><br />
            Jóias de Ouro marcam a tua evolução real — não comparação com outras.
          </p>
        </div>
      )
    },

    // Screen 3 - Quota Setup
    {
      content: (
        <div>
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-400/30 flex items-center justify-center">
              <span className="text-3xl">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              A tua Quota de Presença
            </h2>
            <p className="text-amber-200/70 text-sm">
              Quanto tempo, dinheiro e energia MÍNIMOS vais reservar para ti esta semana?
            </p>
          </div>

          <div className="space-y-6">
            {/* Tempo */}
            <div className="p-4 bg-white/5 rounded-xl border border-amber-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏰</span>
                  <span className="text-amber-100 font-medium">Tempo</span>
                </div>
                <span className="text-amber-300 font-bold">{quotaTempo}h / semana</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={quotaTempo}
                onChange={(e) => setQuotaTempo(parseInt(e.target.value))}
                className="w-full h-2 bg-amber-900/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-amber-200/50 text-xs mt-2">Tempo só para ti, sem função</p>
            </div>

            {/* Dinheiro */}
            <div className="p-4 bg-white/5 rounded-xl border border-amber-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  <span className="text-amber-100 font-medium">Dinheiro</span>
                </div>
                <span className="text-amber-300 font-bold">{quotaDinheiro.toLocaleString()} MT / mês</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={quotaDinheiro}
                onChange={(e) => setQuotaDinheiro(parseInt(e.target.value))}
                className="w-full h-2 bg-amber-900/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-amber-200/40 text-xs mt-2">
                <span>500 MT</span>
                <span>Só para ti (não utilidade)</span>
                <span>10.000 MT</span>
              </div>
              <p className="text-amber-200/50 text-xs mt-1 text-center">~{Math.round(quotaDinheiro/30)} MT/dia | ~{Math.round(quotaDinheiro/100)} cafés/mês</p>
            </div>

            {/* Energia */}
            <div className="p-4 bg-white/5 rounded-xl border border-amber-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <span className="text-amber-100 font-medium">Energia</span>
                </div>
                <span className="text-amber-300 font-bold">{quotaEnergia} actividade(s) / semana</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={quotaEnergia}
                onChange={(e) => setQuotaEnergia(parseInt(e.target.value))}
                className="w-full h-2 bg-amber-900/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-amber-200/50 text-xs mt-2">Actividades que te nutrem</p>
            </div>
          </div>

          <p className="text-amber-200/50 text-xs text-center mt-4">
            Podes ajustar estes valores a qualquer momento nas definições
          </p>
        </div>
      )
    },

    // Screen 4 - Ready
    {
      content: (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <span className="text-4xl">👑</span>
          </div>
          <h2 className="text-2xl font-bold text-amber-100 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Tudo pronto
          </h2>
          <p className="text-amber-200/80 leading-relaxed mb-6">
            Começas em <span className="text-amber-300 font-medium">Bronze</span>.
            <br /><br />
            A cada acção de auto-valor, ganhas <span className="text-amber-300">jóias</span>.
            <br /><br />
            Evoluis ao teu ritmo.
            <br />
            Sem pressa. Sem culpa.
          </p>

          <div className="p-4 bg-white/5 rounded-xl border border-amber-500/20 mb-6">
            <div className="text-amber-200/70 text-sm mb-2">A tua Quota de Presença:</div>
            <div className="flex justify-center gap-6 text-center">
              <div>
                <div className="text-xl font-bold text-amber-300">{quotaTempo}h</div>
                <div className="text-amber-200/50 text-xs">tempo</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-300">{quotaDinheiro} MT</div>
                <div className="text-amber-200/50 text-xs">dinheiro</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-300">{quotaEnergia}</div>
                <div className="text-amber-200/50 text-xs">actividade(s)</div>
              </div>
            </div>
          </div>

          <p className="text-amber-300 font-medium">Vamos?</p>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-8 pb-4">
        {screens.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i === step
              ? 'bg-amber-400 w-6'
              : i < step
                ? 'bg-amber-500'
                : 'bg-amber-500/30'
              }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {screens[step].content}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 flex justify-between items-center">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-6 py-3 text-amber-300 hover:text-amber-200 transition-colors"
          >
            ← Anterior
          </button>
        ) : (
          <div></div>
        )}

        {step < screens.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30"
          >
            Continuar →
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50"
          >
            {saving ? 'A guardar...' : 'Começar! ✨'}
          </button>
        )}
      </div>
    </div>
  );
}
