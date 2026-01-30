import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';

export default function MealsTracker() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [refeicoes, setRefeicoes] = useState([]);
  const [registosHoje, setRegistosHoje] = useState({});
  const [dataSeleccionada, setDataSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [expandido, setExpandido] = useState(null);
  const [plano, setPlano] = useState(null);

  useEffect(() => {
    loadData();
  }, [dataSeleccionada]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Buscar user autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // 2. Converter auth_id → users.id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (userError || !userData) {
        throw new Error('Utilizador não encontrado');
      }

      setUserId(userData.id);

      // 3. Buscar configuração de refeições
      const { data: refeicoesCofig, error: refError } = await supabase
        .from('vitalis_refeicoes_config')
        .select('*')
        .eq('user_id', userData.id)
        .eq('activo', true)
        .order('ordem', { ascending: true });

      if (refError) throw refError;

      setRefeicoes(refeicoesCofig || []);

      // 4. Buscar registos do dia seleccionado
      const { data: registos, error: regError } = await supabase
        .from('vitalis_meals_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', dataSeleccionada);

      if (regError) throw regError;

      // Converter para objecto por refeicao
      const registosMap = {};
      (registos || []).forEach(r => {
        registosMap[r.refeicao] = r;
      });
      setRegistosHoje(registosMap);

      // 5. Buscar plano (para mostrar porções alvo)
      const { data: clientData } = await supabase
        .from('vitalis_clients')
        .select('id')
        .eq('user_id', userData.id)
        .single();

      if (clientData) {
        const { data: planoData } = await supabase
          .from('vitalis_plano')
          .select('porcoes_proteina, porcoes_hidratos, porcoes_gordura, porcoes_legumes')
          .eq('client_id', clientData.id)
          .single();

        setPlano(planoData);
      }

    } catch (err) {
      console.error('Erro ao carregar:', err);
    } finally {
      setLoading(false);
    }
  };

  const registarRefeicao = async (refeicaoNome, status, detalhes = {}) => {
    setSaving(true);
    try {
      const registoExistente = registosHoje[refeicaoNome];

      const dados = {
        user_id: userId,
        data: dataSeleccionada,
        refeicao: refeicaoNome,
        seguiu_plano: status,
        hora: detalhes.hora || new Date().toLocaleTimeString('pt', { hour: '2-digit', minute: '2-digit' }),
        porcoes_proteina: detalhes.porcoes_proteina || null,
        porcoes_hidratos: detalhes.porcoes_hidratos || null,
        porcoes_gordura: detalhes.porcoes_gordura || null,
        porcoes_legumes: detalhes.porcoes_legumes || null,
        notas: detalhes.notas || null
      };

      if (registoExistente) {
        // Actualizar
        const { error } = await supabase
          .from('vitalis_meals_log')
          .update(dados)
          .eq('id', registoExistente.id);

        if (error) throw error;

        setRegistosHoje({
          ...registosHoje,
          [refeicaoNome]: { ...registoExistente, ...dados }
        });
      } else {
        // Inserir
        const { data, error } = await supabase
          .from('vitalis_meals_log')
          .insert([dados])
          .select()
          .single();

        if (error) throw error;

        setRegistosHoje({
          ...registosHoje,
          [refeicaoNome]: data
        });
      }

      setExpandido(null);

    } catch (err) {
      console.error('Erro ao registar:', err);
      alert('Erro ao registar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sim': return '✅';
      case 'parcial': return '⚠️';
      case 'nao': return '❌';
      default: return '○';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sim': return 'bg-green-100 border-green-400';
      case 'parcial': return 'bg-yellow-100 border-yellow-400';
      case 'nao': return 'bg-red-100 border-red-400';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  // Calcular resumo do dia
  const calcularResumo = () => {
    const total = refeicoes.length;
    const registadas = Object.keys(registosHoje).length;
    const completas = Object.values(registosHoje).filter(r => r.seguiu_plano === 'sim').length;
    const parciais = Object.values(registosHoje).filter(r => r.seguiu_plano === 'parcial').length;
    
    return { total, registadas, completas, parciais };
  };

  const resumo = calcularResumo();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  // Se não tem refeições configuradas
  if (refeicoes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="bg-white shadow-sm border-b border-orange-100">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <button 
              onClick={() => navigate('/vitalis/dashboard')}
              className="text-orange-600 hover:text-orange-700 mb-4 flex items-center gap-2"
            >
              ← Voltar
            </button>
            <h1 className="text-3xl font-bold text-orange-900">Registo de Refeições</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Configura as tuas refeições</h2>
            <p className="text-gray-600 mb-6">
              Antes de começar a registar, define quais refeições fazes no teu dia.
            </p>
            <button
              onClick={() => navigate('/vitalis/refeicoes-config')}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
            >
              Configurar Refeições →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button 
            onClick={() => navigate('/vitalis/dashboard')}
            className="text-orange-600 hover:text-orange-700 mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-orange-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Refeições
            </h1>
            <button
              onClick={() => navigate('/vitalis/refeicoes-config')}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              ⚙️ Configurar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Selector de Data */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const d = new Date(dataSeleccionada);
                d.setDate(d.getDate() - 1);
                setDataSeleccionada(d.toISOString().split('T')[0]);
              }}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
            >
              ←
            </button>
            <div className="text-center">
              <input
                type="date"
                value={dataSeleccionada}
                onChange={(e) => setDataSeleccionada(e.target.value)}
                className="text-lg font-semibold text-gray-800 border-none text-center bg-transparent cursor-pointer"
              />
              {dataSeleccionada === new Date().toISOString().split('T')[0] && (
                <p className="text-sm text-orange-600">Hoje</p>
              )}
            </div>
            <button
              onClick={() => {
                const d = new Date(dataSeleccionada);
                d.setDate(d.getDate() + 1);
                if (d <= new Date()) {
                  setDataSeleccionada(d.toISOString().split('T')[0]);
                }
              }}
              disabled={dataSeleccionada === new Date().toISOString().split('T')[0]}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>

        {/* Resumo do Dia */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{resumo.completas}</div>
            <div className="text-xs text-gray-500">Completas</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{resumo.parciais}</div>
            <div className="text-xs text-gray-500">Parciais</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{resumo.registadas}/{resumo.total}</div>
            <div className="text-xs text-gray-500">Registadas</div>
          </div>
        </div>

        {/* Lista de Refeições */}
        <div className="space-y-3">
          {refeicoes.map((ref) => {
            const registo = registosHoje[ref.nome];
            const isExpanded = expandido === ref.nome;

            return (
              <div 
                key={ref.id}
                className={`bg-white rounded-xl shadow overflow-hidden border-2 transition-all ${getStatusColor(registo?.seguiu_plano)}`}
              >
                {/* Linha Principal */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getStatusIcon(registo?.seguiu_plano)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">{ref.nome}</h3>
                        {ref.hora_habitual && (
                          <p className="text-sm text-gray-500">{ref.hora_habitual}</p>
                        )}
                      </div>
                    </div>

                    {/* Botões Rápidos */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => registarRefeicao(ref.nome, 'sim')}
                        disabled={saving}
                        className={`p-2 rounded-lg transition-all ${
                          registo?.seguiu_plano === 'sim' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => registarRefeicao(ref.nome, 'parcial')}
                        disabled={saving}
                        className={`p-2 rounded-lg transition-all ${
                          registo?.seguiu_plano === 'parcial' 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                      >
                        ~
                      </button>
                      <button
                        onClick={() => registarRefeicao(ref.nome, 'nao')}
                        disabled={saving}
                        className={`p-2 rounded-lg transition-all ${
                          registo?.seguiu_plano === 'nao' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        ✕
                      </button>
                      <button
                        onClick={() => setExpandido(isExpanded ? null : ref.nome)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg ml-2"
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detalhes Expandidos */}
                {isExpanded && (
                  <DetalheRefeicao
                    refeicao={ref.nome}
                    registo={registo}
                    plano={plano}
                    onSave={(detalhes) => registarRefeicao(ref.nome, detalhes.seguiu_plano || registo?.seguiu_plano || 'sim', detalhes)}
                    saving={saving}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Dica */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold text-blue-900 mb-1">Dica:</p>
              <p className="text-blue-800 text-sm">
                Clica nos botões ✓ ~ ✕ para registo rápido, ou expande (▼) para adicionar detalhes de porções.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de Detalhe
function DetalheRefeicao({ refeicao, registo, plano, onSave, saving }) {
  const [detalhes, setDetalhes] = useState({
    seguiu_plano: registo?.seguiu_plano || 'sim',
    hora: registo?.hora || '',
    porcoes_proteina: registo?.porcoes_proteina || '',
    porcoes_hidratos: registo?.porcoes_hidratos || '',
    porcoes_gordura: registo?.porcoes_gordura || '',
    porcoes_legumes: registo?.porcoes_legumes || '',
    notas: registo?.notas || ''
  });

  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Estado</label>
          <select
            value={detalhes.seguiu_plano}
            onChange={(e) => setDetalhes({ ...detalhes, seguiu_plano: e.target.value })}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none"
          >
            <option value="sim">✅ Seguiu o plano</option>
            <option value="parcial">⚠️ Parcialmente</option>
            <option value="nao">❌ Não seguiu</option>
          </select>
        </div>

        {/* Hora */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Hora</label>
          <input
            type="time"
            value={detalhes.hora}
            onChange={(e) => setDetalhes({ ...detalhes, hora: e.target.value })}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Porções */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Porções {plano && <span className="text-gray-400">(alvo do dia)</span>}
        </label>
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              🥩 Proteína {plano && <span className="text-orange-500">({plano.porcoes_proteina})</span>}
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={detalhes.porcoes_proteina}
              onChange={(e) => setDetalhes({ ...detalhes, porcoes_proteina: e.target.value })}
              placeholder="0"
              className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-center"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              🍚 Hidratos {plano && <span className="text-orange-500">({plano.porcoes_hidratos})</span>}
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={detalhes.porcoes_hidratos}
              onChange={(e) => setDetalhes({ ...detalhes, porcoes_hidratos: e.target.value })}
              placeholder="0"
              className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-center"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              🥑 Gordura {plano && <span className="text-orange-500">({plano.porcoes_gordura})</span>}
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={detalhes.porcoes_gordura}
              onChange={(e) => setDetalhes({ ...detalhes, porcoes_gordura: e.target.value })}
              placeholder="0"
              className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-center"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              🥬 Legumes {plano && <span className="text-orange-500">({plano.porcoes_legumes})</span>}
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={detalhes.porcoes_legumes}
              onChange={(e) => setDetalhes({ ...detalhes, porcoes_legumes: e.target.value })}
              placeholder="0"
              className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-center"
            />
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mb-1">Notas (opcional)</label>
        <textarea
          value={detalhes.notas}
          onChange={(e) => setDetalhes({ ...detalhes, notas: e.target.value })}
          placeholder="Ex: Comi fora, escolhi grelhados..."
          rows={2}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none"
        />
      </div>

      {/* Guardar */}
      <button
        onClick={() => onSave(detalhes)}
        disabled={saving}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
      >
        {saving ? 'A guardar...' : '✓ Guardar Detalhes'}
      </button>
    </div>
  );
}
