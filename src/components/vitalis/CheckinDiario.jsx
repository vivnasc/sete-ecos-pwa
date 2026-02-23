import React, { useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { CONQUISTAS, CelebracaoModal } from './Gamificacao';

export const CheckinDiario = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [milestoneConquista, setMilestoneConquista] = useState(null);
  
  const [formData, setFormData] = useState({
    peso_kg: '',
    energia_1a10: 5,
    fome_1a10: 5,
    humor_1a10: 5,
    aderencia_1a10: 5,
    desafios_semana: '',
    vitorias_semana: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 🔧 Buscar users.id primeiro
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      // Buscar client para pegar data_inicio
      const { data: client } = await supabase
        .from('vitalis_clients')
        .select('data_inicio')
        .eq('user_id', userData.id)
        .single();

      // Calcular semana do programa
      let semanaPrograma = 1;
      
      if (client && client.data_inicio) {
        const dataInicio = new Date(client.data_inicio);
        const hoje = new Date();
        const diffTime = Math.abs(hoje - dataInicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        semanaPrograma = Math.ceil(diffDays / 7);
      }

      // Criar registo
      const { error } = await supabase
        .from('vitalis_registos')
        .insert([{
          user_id: userData.id,
          data: new Date().toISOString().split('T')[0],
          tipo: 'checkin_semanal',
          semana_programa: semanaPrograma,
          peso_kg: parseFloat(formData.peso_kg),
          energia_1a10: formData.energia_1a10,
          fome_1a10: formData.fome_1a10,
          humor_1a10: formData.humor_1a10,
          aderencia_1a10: formData.aderencia_1a10,
          desafios_semana: formData.desafios_semana,
          vitorias_semana: formData.vitorias_semana
        }]);

      if (error) throw error;

      // Buscar peso_inicial e peso_meta para detectar marcos
      const { data: clientFull } = await supabase
        .from('vitalis_clients')
        .select('peso_inicial, peso_meta')
        .eq('user_id', userData.id)
        .single();

      // Atualizar peso actual no cliente
      await supabase
        .from('vitalis_clients')
        .update({
          peso_actual: parseFloat(formData.peso_kg),
          ultimo_registo: new Date().toISOString()
        })
        .eq('user_id', userData.id);

      // Detectar marcos de peso atingidos AGORA
      let novoMarcoDetectado = null;
      if (clientFull?.peso_inicial) {
        const novoPeso = parseFloat(formData.peso_kg);
        const pesoPerdido = clientFull.peso_inicial - novoPeso;
        const conquistasNotificadas = JSON.parse(localStorage.getItem('vitalis-conquistas-notificadas') || '[]');

        // Verificar qual é o maior marco atingido que ainda não foi notificado
        if (pesoPerdido >= 10 && !conquistasNotificadas.includes('peso_10kg')) {
          novoMarcoDetectado = 'peso_10kg';
        } else if (pesoPerdido >= 5 && !conquistasNotificadas.includes('peso_5kg')) {
          novoMarcoDetectado = 'peso_5kg';
        } else if (pesoPerdido >= 1 && !conquistasNotificadas.includes('peso_1kg')) {
          novoMarcoDetectado = 'peso_1kg';
        }
        // Peso meta atingido
        if (clientFull.peso_meta && novoPeso <= clientFull.peso_meta && !conquistasNotificadas.includes('peso_meta')) {
          novoMarcoDetectado = 'peso_meta';
        }

        if (novoMarcoDetectado) {
          setMilestoneConquista(novoMarcoDetectado);
        }
      }

      // Notificar coach se é o primeiro check-in
      if (semanaPrograma <= 1) {
        const { count } = await supabase.from('vitalis_registos')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userData.id);
        if (count <= 1) {
          import('../../lib/emails').then(({ EmailTriggers }) => {
            EmailTriggers.onPrimeiroCheckin({
              nome: user.email.split('@')[0],
              email: user.email,
              peso: formData.peso_kg,
            }).catch(() => {});
          });
        }
      }

      setSuccess(true);

      // Se há marco de peso, dar mais tempo para ver a celebração
      setTimeout(() => {
        navigate('/vitalis/dashboard');
      }, novoMarcoDetectado ? 5000 : 2000);

    } catch (error) {
      console.error('Erro ao salvar check-in:', error);
      alert('Erro ao salvar check-in: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const Slider = ({ label, value, onChange, emoji }) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <label className="text-lg font-semibold text-[#4A4035] flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          {label}
        </label>
        <span className="text-3xl font-bold text-[#7C8B6F]">{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={onChange}
        className="w-full h-3 bg-[#E8E4DC] rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-[#6B5C4C] mt-1">
        <span>Muito Baixo</span>
        <span>Médio</span>
        <span>Muito Alto</span>
      </div>
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">✅</div>
          <h2 className="text-3xl font-bold text-[#7C8B6F] mb-2">Check-in Registado!</h2>
          <p className="text-[#6B5C4C]">A redirecionar para o dashboard...</p>
        </div>

        {milestoneConquista && (
          <CelebracaoModal
            conquista={milestoneConquista}
            show={true}
            onClose={() => {
              setMilestoneConquista(null);
              navigate('/vitalis/dashboard');
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/vitalis/dashboard')}
            className="text-white/80 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>
          <div className="flex items-center gap-4">
            <img
              src="/logos/VITALIS_LOGO_V3.png"
              alt="Vitalis"
              className="w-14 h-14 object-contain drop-shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '2px' }}>
                Check-in Diário
              </h1>
              <p className="text-white/80">Como está o teu dia hoje? 🌱</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          {/* Peso */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">⚖️</span>
              Peso de Hoje (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="200"
              value={formData.peso_kg}
              onChange={(e) => setFormData({ ...formData, peso_kg: e.target.value })}
              required
              placeholder="Ex: 72.5"
              className="w-full px-6 py-4 text-2xl border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
            />
          </div>

          <div className="border-t border-gray-200 my-8" />

          {/* Sliders de Auto-Avaliação */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Como te sentes hoje?</h3>

            <Slider
              label="Energia"
              emoji="⚡"
              value={formData.energia_1a10}
              onChange={(e) => setFormData({ ...formData, energia_1a10: parseInt(e.target.value) })}
            />

            <Slider
              label="Fome"
              emoji="🍽️"
              value={formData.fome_1a10}
              onChange={(e) => setFormData({ ...formData, fome_1a10: parseInt(e.target.value) })}
            />

            <Slider
              label="Humor"
              emoji="😊"
              value={formData.humor_1a10}
              onChange={(e) => setFormData({ ...formData, humor_1a10: parseInt(e.target.value) })}
            />

            <Slider
              label="Aderência ao Plano"
              emoji="✅"
              value={formData.aderencia_1a10}
              onChange={(e) => setFormData({ ...formData, aderencia_1a10: parseInt(e.target.value) })}
            />
          </div>

          <div className="border-t border-gray-200 my-8" />

          {/* Reflexões */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Reflexão da Semana</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🌱 Vitórias desta semana (opcional)
              </label>
              <textarea
                value={formData.vitorias_semana}
                onChange={(e) => setFormData({ ...formData, vitorias_semana: e.target.value })}
                placeholder="Ex: Consegui resistir ao chocolate 3x, bebi 2L água todos os dias..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⚠️ Desafios desta semana (opcional)
              </label>
              <textarea
                value={formData.desafios_semana}
                onChange={(e) => setFormData({ ...formData, desafios_semana: e.target.value })}
                placeholder="Ex: Evento social difícil, TPM, stress no trabalho..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 my-8" />

          {/* Botões */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/vitalis/dashboard')}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.peso_kg}
              className="flex-1 py-4 bg-[#7C8B6F] hover:bg-[#6B7A5D] text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  A guardar...
                </span>
              ) : (
                '✓ Guardar Check-in'
              )}
            </button>
          </div>
        </form>

        {/* Dica */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold text-blue-900 mb-1">Dica:</p>
              <p className="text-blue-800 text-sm">
                Faz o check-in sempre à mesma hora (preferencialmente de manhã) para dados mais consistentes!
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7C8B6F, #9CAF88);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7C8B6F, #9CAF88);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default CheckinDiario;
