import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';

export default function RefeicoesCofig() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [refeicoes, setRefeicoes] = useState([]);
  const [novaRefeicao, setNovaRefeicao] = useState({ nome: '', hora_habitual: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadRefeicoes();
  }, []);

  const loadRefeicoes = async () => {
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

      // 3. Buscar refeições configuradas
      const { data: refeicoesCofig, error: refError } = await supabase
        .from('vitalis_refeicoes_config')
        .select('*')
        .eq('user_id', userData.id)
        .eq('activo', true)
        .order('ordem', { ascending: true });

      if (refError) throw refError;

      setRefeicoes(refeicoesCofig || []);

    } catch (err) {
      console.error('Erro ao carregar refeições:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const adicionarRefeicao = async () => {
    if (!novaRefeicao.nome.trim()) {
      setError('Insere um nome para a refeição');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const novaOrdem = refeicoes.length;

      const { data, error } = await supabase
        .from('vitalis_refeicoes_config')
        .insert([{
          user_id: userId,
          nome: novaRefeicao.nome.trim(),
          hora_habitual: novaRefeicao.hora_habitual || null,
          ordem: novaOrdem,
          activo: true
        }])
        .select()
        .single();

      if (error) throw error;

      setRefeicoes([...refeicoes, data]);
      setNovaRefeicao({ nome: '', hora_habitual: '' });

    } catch (err) {
      console.error('Erro ao adicionar:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const actualizarRefeicao = async (id, campo, valor) => {
    try {
      const { error } = await supabase
        .from('vitalis_refeicoes_config')
        .update({ [campo]: valor })
        .eq('id', id);

      if (error) throw error;

      setRefeicoes(refeicoes.map(r => 
        r.id === id ? { ...r, [campo]: valor } : r
      ));

    } catch (err) {
      console.error('Erro ao actualizar:', err);
      setError(err.message);
    }
  };

  const removerRefeicao = async (id) => {
    if (!confirm('Remover esta refeição?')) return;

    try {
      const { error } = await supabase
        .from('vitalis_refeicoes_config')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;

      setRefeicoes(refeicoes.filter(r => r.id !== id));

    } catch (err) {
      console.error('Erro ao remover:', err);
      setError(err.message);
    }
  };

  const moverRefeicao = async (index, direcao) => {
    const novaLista = [...refeicoes];
    const novoIndex = index + direcao;
    
    if (novoIndex < 0 || novoIndex >= novaLista.length) return;

    // Trocar posições
    [novaLista[index], novaLista[novoIndex]] = [novaLista[novoIndex], novaLista[index]];

    // Actualizar ordem
    const updates = novaLista.map((r, i) => ({
      id: r.id,
      ordem: i
    }));

    try {
      for (const update of updates) {
        await supabase
          .from('vitalis_refeicoes_config')
          .update({ ordem: update.ordem })
          .eq('id', update.id);
      }

      setRefeicoes(novaLista.map((r, i) => ({ ...r, ordem: i })));

    } catch (err) {
      console.error('Erro ao reordenar:', err);
    }
  };

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
          <h1 className="text-3xl font-bold text-orange-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            As Minhas Refeições
          </h1>
          <p className="text-gray-600 mt-2">Configura as refeições que fazes no teu dia</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Lista de Refeições */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {refeicoes.length > 0 ? 'As tuas refeições' : 'Ainda não tens refeições configuradas'}
          </h2>

          {refeicoes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-5xl mb-4">🍽️</div>
              <p>Adiciona as refeições que costumas fazer</p>
            </div>
          )}

          <div className="space-y-3">
            {refeicoes.map((ref, index) => (
              <div 
                key={ref.id} 
                className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border-2 border-orange-100"
              >
                {/* Ordem */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moverRefeicao(index, -1)}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-orange-600 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moverRefeicao(index, 1)}
                    disabled={index === refeicoes.length - 1}
                    className="text-gray-400 hover:text-orange-600 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>

                {/* Nome */}
                <input
                  type="text"
                  value={ref.nome}
                  onChange={(e) => actualizarRefeicao(ref.id, 'nome', e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-transparent rounded-lg bg-white focus:border-orange-300 focus:outline-none"
                />

                {/* Hora */}
                <input
                  type="time"
                  value={ref.hora_habitual || ''}
                  onChange={(e) => actualizarRefeicao(ref.id, 'hora_habitual', e.target.value)}
                  className="w-28 px-3 py-2 border-2 border-transparent rounded-lg bg-white focus:border-orange-300 focus:outline-none"
                />

                {/* Remover */}
                <button
                  onClick={() => removerRefeicao(ref.id)}
                  className="text-red-400 hover:text-red-600 p-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Adicionar Nova */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-4">Adicionar refeição</h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Nome (ex: Almoço, Lanche, Pós-treino)"
              value={novaRefeicao.nome}
              onChange={(e) => setNovaRefeicao({ ...novaRefeicao, nome: e.target.value })}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
            />
            <input
              type="time"
              value={novaRefeicao.hora_habitual}
              onChange={(e) => setNovaRefeicao({ ...novaRefeicao, hora_habitual: e.target.value })}
              className="w-full sm:w-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
              placeholder="Hora"
            />
            <button
              onClick={adicionarRefeicao}
              disabled={saving || !novaRefeicao.nome.trim()}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? '...' : '+ Adicionar'}
            </button>
          </div>
        </div>

        {/* Sugestões Rápidas */}
        {refeicoes.length === 0 && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-3">💡 Sugestões rápidas</h3>
            <div className="flex flex-wrap gap-2">
              {['Pequeno-almoço', 'Lanche manhã', 'Almoço', 'Lanche tarde', 'Jantar', 'Ceia', 'Pós-treino'].map(nome => (
                <button
                  key={nome}
                  onClick={() => setNovaRefeicao({ ...novaRefeicao, nome })}
                  className="px-4 py-2 bg-white border-2 border-blue-300 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                >
                  {nome}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botão Concluir */}
        {refeicoes.length > 0 && (
          <button
            onClick={() => navigate('/vitalis/meals')}
            className="w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
          >
            ✓ Concluído — Ir para Registo
          </button>
        )}
      </div>
    </div>
  );
}
