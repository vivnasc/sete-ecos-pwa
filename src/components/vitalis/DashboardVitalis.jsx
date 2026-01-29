import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardVitalis() {
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

      // 🔧 Buscar users.id primeiro
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      // Get client data
      const { data: clientData } = await supabase
        .from('vitalis_clients')
        .select('*')
        .eq('user_id', userData.id)
        .single();
      setClient(clientData);

      // Get últimos 30 registos
      const { data: registosData } = await supabase
        .from('vitalis_registos')
        .select('*')
        .eq('user_id', userData.id)
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  // Calcular progresso
  const pesoInicial = client?.peso_inicial || 0;
  const pesoActual = client?.peso_actual || 0;
  const pesoMeta = client?.peso_meta || pesoInicial;
  const progressoTotal = pesoInicial - pesoMeta;
  const progressoActual = pesoInicial - pesoActual;
  const percentagemProgresso = progressoTotal > 0 ? (progressoActual / progressoTotal) * 100 : 0;

  // Preparar dados para gráfico
  const chartData = registos
    .slice(0, 30)
    .reverse()
    .map((r, i) => ({
      data: new Date(r.data).toLocaleDateString('pt', { day: '2-digit', month: '2-digit' }),
      peso: r.peso_kg || null
    }))
    .filter(d => d.peso !== null);

  // Calcular dias sem check-in
  const diasSemCheckin = ultimoCheckin
    ? Math.floor((new Date() - new Date(ultimoCheckin.data)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-red-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">VITALIS</h1>
              <p className="text-amber-100">Olá, {client?.nome_completo || 'Guerreira'}! 🌱</p>
            </div>
            <Link
              to="/"
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
            >
              ← Voltar
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="text-gray-500 text-xs md:text-sm mb-1">Peso Actual</div>
            <div className="text-2xl md:text-3xl font-bold text-amber-600">{pesoActual} kg</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="text-gray-500 text-xs md:text-sm mb-1">Progresso</div>
            <div className="text-2xl md:text-3xl font-bold text-green-600">{percentagemProgresso.toFixed(1)}%</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="text-gray-500 text-xs md:text-sm mb-1">Semana</div>
            <div className="text-2xl md:text-3xl font-bold text-blue-600">
              {client?.data_inicio ? Math.floor((new Date() - new Date(client.data_inicio)) / (7 * 24 * 60 * 60 * 1000)) + 1 : 1}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="text-gray-500 text-xs md:text-sm mb-1">Aderência</div>
            <div className="text-2xl md:text-3xl font-bold text-purple-600">
              {registos.length > 0 ? Math.round((registos.length / 30) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Alert */}
        {diasSemCheckin > 2 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚠️</div>
              <div>
                <div className="font-bold text-red-800">Faz o teu check-in!</div>
                <div className="text-red-600 text-sm">Já passaram {diasSemCheckin} dias desde o último registo.</div>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico de Peso */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Evolução de Peso (30 dias)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="data" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #d97706',
                    borderRadius: '12px',
                    padding: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#d97706"
                  strokeWidth={3}
                  dot={{ fill: '#d97706', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">📊 Sem dados ainda</p>
              <p className="text-sm">Faz o teu primeiro check-in para ver o gráfico!</p>
            </div>
          )}
        </div>

        {/* Quick Actions - AGORA COM 4 CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 🆕 NOVO CARD: Meu Plano */}
          <Link
            to="/vitalis/plano"
            className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="text-3xl md:text-4xl mb-3">🍽️</div>
            <div className="font-bold text-lg md:text-xl mb-1">Meu Plano</div>
            <div className="text-amber-100 text-xs md:text-sm">Porções e check-in do dia</div>
          </Link>

          <Link
            to="/vitalis/checkin"
            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="text-3xl md:text-4xl mb-3">✅</div>
            <div className="font-bold text-lg md:text-xl mb-1">Check-in</div>
            <div className="text-green-100 text-xs md:text-sm">Regista o teu progresso</div>
          </Link>

          <Link
            to="/vitalis/receitas"
            className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="text-3xl md:text-4xl mb-3">🍳</div>
            <div className="font-bold text-lg md:text-xl mb-1">Receitas</div>
            <div className="text-orange-100 text-xs md:text-sm">Explora receitas saudáveis</div>
          </Link>

          <Link
            to="/vitalis/espaco-retorno"
            className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="text-3xl md:text-4xl mb-3">💜</div>
            <div className="font-bold text-lg md:text-xl mb-1">Espaço Retorno</div>
            <div className="text-purple-100 text-xs md:text-sm">Lado emocional</div>
          </Link>
        </div>

        {/* Último Check-in */}
        {ultimoCheckin && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-800 mb-4">Último Check-in</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-gray-500 text-sm">Energia</div>
                <div className="text-2xl font-bold text-yellow-600">{ultimoCheckin.energia_1a10}/10</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Fome</div>
                <div className="text-2xl font-bold text-orange-600">{ultimoCheckin.fome_1a10}/10</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Humor</div>
                <div className="text-2xl font-bold text-green-600">{ultimoCheckin.humor_1a10}/10</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Aderência</div>
                <div className="text-2xl font-bold text-blue-600">{ultimoCheckin.aderencia_1a10}/10</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
