import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardVitalis = () => {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [registos, setRegistos] = useState([]);
  const [ultimoCheckin, setUltimoCheckin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Get client data
      const { data: clientData } = await supabase
        .from('vitalis_clients')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setClient(clientData);

      // Get últimos 30 registos
      const { data: registosData } = await supabase
        .from('vitalis_registos')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .limit(30);
      setRegistos(registosData || []);
      setUltimoCheckin(registosData?.[0] || null);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌱</div>
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  // Calcular progresso
  const pesoInicial = client?.peso_inicial || 0;
  const pesoActual = client?.peso_actual || pesoInicial;
  const pesoMeta = client?.peso_meta || pesoInicial;
  const progressoTotal = pesoInicial - pesoMeta;
  const progressoActual = pesoInicial - pesoActual;
  const percentagemProgresso = progressoTotal > 0 ? (progressoActual / progressoTotal) * 100 : 0;

  // Preparar dados para gráfico
  const chartData = registos
    .slice(0, 30)
    .reverse()
    .map(r => ({
      data: new Date(r.data).toLocaleDateString('pt', { day: '2-digit', month: '2-digit' }),
      peso: r.peso_kg || null
    }))
    .filter(d => d.peso !== null);

  // Calcular dias sem check-in
  const diasSemCheckin = ultimoCheckin 
    ? Math.floor((new Date() - new Date(ultimoCheckin.data)) / (1000 * 60 * 60 * 24))
    : 999;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-orange-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Olá, {client?.objectivo_principal ? 'Guerreira' : 'Viajante'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                {client?.fase_actual === 'inducao' && 'Fase: Indução 🌱'}
                {client?.fase_actual === 'estabilizacao' && 'Fase: Estabilização 💪'}
                {client?.fase_actual === 'reeducacao' && 'Fase: Reeducação 🎯'}
                {client?.fase_actual === 'manutencao' && 'Fase: Manutenção ✨'}
              </p>
            </div>
            <Link
              to="/vitalis/checkin"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              ✓ Check-in Diário
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alerta de Check-in */}
        {diasSemCheckin > 1 && (
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-amber-900">
                  Já passaram {diasSemCheckin} dias sem check-in!
                </p>
                <p className="text-amber-700 text-sm">
                  Mantém a consistência para melhores resultados.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Peso Actual */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">⚖️</span>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                PESO
              </span>
            </div>
            <div className="text-4xl font-bold text-orange-900 mb-1">
              {pesoActual.toFixed(1)}
              <span className="text-lg text-gray-500 ml-1">kg</span>
            </div>
            <div className="text-sm text-gray-600">
              Meta: {pesoMeta.toFixed(1)} kg
            </div>
          </div>

          {/* Progresso */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📈</span>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                PROGRESSO
              </span>
            </div>
            <div className="text-4xl font-bold text-green-700 mb-1">
              {percentagemProgresso.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">
              {progressoActual.toFixed(1)} de {progressoTotal.toFixed(1)} kg
            </div>
            <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(percentagemProgresso, 100)}%` }}
              />
            </div>
          </div>

          {/* Semana do Programa */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📅</span>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                SEMANA
              </span>
            </div>
            <div className="text-4xl font-bold text-purple-700 mb-1">
              {ultimoCheckin?.semana_programa || 1}
            </div>
            <div className="text-sm text-gray-600">
              Do programa
            </div>
          </div>

          {/* Aderência */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">✅</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                ADERÊNCIA
              </span>
            </div>
            <div className="text-4xl font-bold text-blue-700 mb-1">
              {ultimoCheckin?.aderencia_1a10 || 0}
              <span className="text-lg text-gray-500 ml-1">/10</span>
            </div>
            <div className="text-sm text-gray-600">
              Última avaliação
            </div>
          </div>
        </div>

        {/* Gráfico de Peso */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Evolução de Peso (30 dias)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d6" />
                <XAxis 
                  dataKey="data" 
                  stroke="#6B5D4D"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6B5D4D"
                  domain={[
                    Math.floor(Math.min(...chartData.map(d => d.peso)) - 2),
                    Math.ceil(Math.max(...chartData.map(d => d.peso)) + 2)
                  ]}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFF', 
                    border: '2px solid #C1634A',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="peso" 
                  stroke="#C1634A" 
                  strokeWidth={3}
                  dot={{ fill: '#C1634A', r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Sem dados de peso ainda</p>
              <p className="text-sm">Faz o teu primeiro check-in para começar a ver o gráfico!</p>
            </div>
          )}
        </div>

        {/* Grid de Acções Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ver Plano */}
          <Link to="/vitalis/plano" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-orange-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                📋
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Meu Plano</h3>
                <p className="text-sm text-gray-600">Porções e horários</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Consulta as tuas porções personalizadas e horários de refeições.
            </p>
          </Link>

          {/* Receitas */}
          <Link to="/vitalis/receitas" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                🍽️
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Receitas</h3>
                <p className="text-sm text-gray-600">Biblioteca completa</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Explora receitas adaptadas ao teu plano nutricional.
            </p>
          </Link>

          {/* Progresso */}
          <Link to="/vitalis/progresso" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Progresso</h3>
                <p className="text-sm text-gray-600">Histórico completo</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Vê fotos, medidas e toda a tua evolução.
            </p>
          </Link>
        </div>

        {/* Último Check-in */}
        {ultimoCheckin && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Último Check-in</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Energia</p>
                <p className="text-2xl font-bold text-orange-600">{ultimoCheckin.energia_1a10}/10</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fome</p>
                <p className="text-2xl font-bold text-orange-600">{ultimoCheckin.fome_1a10}/10</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Humor</p>
                <p className="text-2xl font-bold text-orange-600">{ultimoCheckin.humor_1a10}/10</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Aderência</p>
                <p className="text-2xl font-bold text-orange-600">{ultimoCheckin.aderencia_1a10}/10</p>
              </div>
            </div>
            {ultimoCheckin.desafios_semana && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                <p className="text-sm font-semibold text-amber-900 mb-1">Desafios da semana:</p>
                <p className="text-sm text-amber-800">{ultimoCheckin.desafios_semana}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão Flutuante - Espaço Retorno */}
      <button 
        onClick={() => window.location.href = '/vitalis/espaco-retorno'}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all flex items-center justify-center text-2xl z-50"
        title="Espaço de Retorno - Tenho vontade de comer"
      >
        💭
      </button>
    </div>
  );
};

export default DashboardVitalis;
