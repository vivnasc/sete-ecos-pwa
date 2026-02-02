// src/components/vitalis/GraficosTendencia.jsx
// Gráficos de tendência para peso, sono, água e aderência

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';

// Componente de gráfico de linha simples (SVG)
function LineChart({ data, color = '#7C8B6F', height = 150, showLabels = true, unit = '', meta = null }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
        Sem dados suficientes
      </div>
    );
  }

  const values = data.map(d => d.value);
  const max = Math.max(...values) * 1.1;
  const min = Math.min(...values) * 0.9;
  const range = max - min || 1;

  const width = 100;
  const padding = 5;
  const chartWidth = width - padding * 2;
  const chartHeight = height - 40;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
    const y = chartHeight - ((d.value - min) / range) * (chartHeight - 20) + 10;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Área preenchida
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
        {/* Linha de meta */}
        {meta && (
          <line
            x1={padding}
            y1={chartHeight - ((meta - min) / range) * (chartHeight - 20) + 10}
            x2={width - padding}
            y2={chartHeight - ((meta - min) / range) * (chartHeight - 20) + 10}
            stroke="#10b981"
            strokeWidth="0.3"
            strokeDasharray="2,2"
          />
        )}

        {/* Área preenchida */}
        <path
          d={areaD}
          fill={`${color}20`}
        />

        {/* Linha principal */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pontos */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.2"
            fill={color}
          />
        ))}
      </svg>

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
          <span>{data[0]?.label || ''}</span>
          <span>{data[data.length - 1]?.label || ''}</span>
        </div>
      )}

      {/* Valor actual */}
      <div className="absolute top-0 right-0 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-lg shadow-sm">
        <span className="text-lg font-bold" style={{ color }}>{values[values.length - 1]?.toFixed(1)}</span>
        <span className="text-xs text-gray-500 ml-1">{unit}</span>
      </div>
    </div>
  );
}

// Componente de gráfico de barras
function BarChart({ data, color = '#7C8B6F', height = 120, meta = null }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-gray-400 text-sm">
        Sem dados suficientes
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.value), meta || 0) * 1.1;

  return (
    <div className="flex items-end justify-between gap-1" style={{ height }}>
      {data.map((d, i) => {
        const barHeight = (d.value / max) * 100;
        const metaHeight = meta ? (meta / max) * 100 : 0;
        const isToday = i === data.length - 1;

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="relative w-full flex flex-col justify-end" style={{ height: height - 20 }}>
              {/* Linha de meta */}
              {meta && (
                <div
                  className="absolute w-full border-t-2 border-dashed border-green-400"
                  style={{ bottom: `${metaHeight}%` }}
                />
              )}
              {/* Barra */}
              <div
                className={`w-full rounded-t-md transition-all ${isToday ? 'animate-pulse' : ''}`}
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: d.value >= (meta || 0) ? '#10b981' : color,
                  minHeight: '4px'
                }}
              />
            </div>
            <span className="text-xs text-gray-400">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Componente principal de estatísticas
export default function GraficosTendencia() {
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('7'); // 7, 14, 30 dias
  const [userId, setUserId] = useState(null);

  // Dados
  const [dadosPeso, setDadosPeso] = useState([]);
  const [dadosAgua, setDadosAgua] = useState([]);
  const [dadosSono, setDadosSono] = useState([]);
  const [dadosAderencia, setDadosAderencia] = useState([]);
  const [estatisticas, setEstatisticas] = useState({});

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) return;
      setUserId(userData.id);

      const dias = parseInt(periodo);
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - dias);
      const dataInicioStr = dataInicio.toISOString().split('T')[0];

      // Carregar todos os dados em paralelo
      const [pesoRes, aguaRes, sonoRes, checkinRes, clientRes] = await Promise.all([
        supabase.from('vitalis_peso_log').select('*').eq('user_id', userData.id).gte('data', dataInicioStr).order('data'),
        supabase.from('vitalis_agua_log').select('*').eq('user_id', userData.id).gte('data', dataInicioStr).order('data'),
        supabase.from('vitalis_sono_log').select('*').eq('user_id', userData.id).gte('data', dataInicioStr).order('data'),
        supabase.from('vitalis_registos').select('*').eq('user_id', userData.id).gte('data', dataInicioStr).order('data'),
        supabase.from('vitalis_clients').select('peso_inicial, peso_actual, peso_meta').eq('user_id', userData.id).single()
      ]);

      // Processar dados de peso
      if (pesoRes.data && pesoRes.data.length > 0) {
        setDadosPeso(pesoRes.data.map(p => ({
          value: p.peso,
          label: new Date(p.data).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }),
          date: p.data
        })));
      } else if (clientRes.data) {
        // Usar peso do cliente se não houver log
        setDadosPeso([{
          value: clientRes.data.peso_actual || clientRes.data.peso_inicial,
          label: 'Actual',
          date: new Date().toISOString()
        }]);
      }

      // Processar dados de água (agrupar por dia)
      if (aguaRes.data) {
        const aguaPorDia = {};
        aguaRes.data.forEach(a => {
          if (!aguaPorDia[a.data]) aguaPorDia[a.data] = 0;
          aguaPorDia[a.data] += a.quantidade_ml / 1000;
        });
        setDadosAgua(Object.entries(aguaPorDia).map(([data, litros]) => ({
          value: litros,
          label: new Date(data).toLocaleDateString('pt-PT', { weekday: 'short' }).charAt(0).toUpperCase(),
          date: data
        })));
      }

      // Processar dados de sono
      if (sonoRes.data) {
        setDadosSono(sonoRes.data.map(s => ({
          value: s.duracao_min / 60,
          label: new Date(s.data).toLocaleDateString('pt-PT', { weekday: 'short' }).charAt(0).toUpperCase(),
          date: s.data,
          qualidade: s.qualidade_1a5
        })));
      }

      // Processar aderência
      if (checkinRes.data) {
        setDadosAderencia(checkinRes.data.map(c => ({
          value: c.aderencia_1a10 * 10,
          label: new Date(c.data).toLocaleDateString('pt-PT', { weekday: 'short' }).charAt(0).toUpperCase(),
          date: c.data
        })));
      }

      // Calcular estatísticas
      const stats = {
        pesoInicial: clientRes.data?.peso_inicial,
        pesoActual: clientRes.data?.peso_actual,
        pesoMeta: clientRes.data?.peso_meta,
        pesoPerdido: (clientRes.data?.peso_inicial || 0) - (clientRes.data?.peso_actual || 0),
        mediaAgua: aguaRes.data?.length > 0
          ? (Object.values(aguaRes.data.reduce((acc, a) => {
              if (!acc[a.data]) acc[a.data] = 0;
              acc[a.data] += a.quantidade_ml;
              return acc;
            }, {})).reduce((a, b) => a + b, 0) / Object.keys(aguaRes.data.reduce((acc, a) => { acc[a.data] = true; return acc; }, {})).length / 1000).toFixed(1)
          : 0,
        mediaSono: sonoRes.data?.length > 0
          ? (sonoRes.data.reduce((a, s) => a + s.duracao_min, 0) / sonoRes.data.length / 60).toFixed(1)
          : 0,
        mediaAderencia: checkinRes.data?.length > 0
          ? Math.round(checkinRes.data.reduce((a, c) => a + c.aderencia_1a10, 0) / checkinRes.data.length * 10)
          : 0
      };
      setEstatisticas(stats);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">📊</div>
          <p className="text-gray-600">A carregar estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/vitalis" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-bold">Tendências</h1>
              <p className="text-white/80 text-sm">A tua evolução ao longo do tempo</p>
            </div>
          </div>
          <span className="text-2xl">📈</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Selector de período */}
        <div className="flex justify-center gap-2">
          {[
            { value: '7', label: '7 dias' },
            { value: '14', label: '14 dias' },
            { value: '30', label: '30 dias' }
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setPeriodo(p.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                periodo === p.value
                  ? 'bg-[#7C8B6F] text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
            <p className="text-2xl mb-1">⚖️</p>
            <p className="text-2xl font-bold text-[#7C8B6F]">
              {estatisticas.pesoPerdido > 0 ? '-' : ''}{Math.abs(estatisticas.pesoPerdido || 0).toFixed(1)}kg
            </p>
            <p className="text-xs text-gray-500">Peso perdido</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
            <p className="text-2xl mb-1">💧</p>
            <p className="text-2xl font-bold text-blue-500">{estatisticas.mediaAgua}L</p>
            <p className="text-xs text-gray-500">Média água/dia</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
            <p className="text-2xl mb-1">😴</p>
            <p className="text-2xl font-bold text-indigo-500">{estatisticas.mediaSono}h</p>
            <p className="text-xs text-gray-500">Média sono</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
            <p className="text-2xl mb-1">✅</p>
            <p className="text-2xl font-bold text-green-500">{estatisticas.mediaAderencia}%</p>
            <p className="text-xs text-gray-500">Aderência</p>
          </div>
        </div>

        {/* Gráfico de Peso */}
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚖️</span>
              <h3 className="font-bold text-gray-800">Evolução do Peso</h3>
            </div>
            {estatisticas.pesoMeta && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Meta: {estatisticas.pesoMeta}kg
              </span>
            )}
          </div>
          <LineChart
            data={dadosPeso}
            color="#7C8B6F"
            height={160}
            unit="kg"
            meta={estatisticas.pesoMeta}
          />
          {estatisticas.pesoPerdido > 0 && (
            <p className="text-center text-sm text-green-600 mt-3">
              🎉 Já perdeste {estatisticas.pesoPerdido.toFixed(1)}kg desde o início!
            </p>
          )}
        </div>

        {/* Gráfico de Água */}
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">💧</span>
              <h3 className="font-bold text-gray-800">Consumo de Água</h3>
            </div>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Meta: 2L/dia
            </span>
          </div>
          <BarChart
            data={dadosAgua.slice(-7)}
            color="#0ea5e9"
            height={140}
            meta={2}
          />
        </div>

        {/* Gráfico de Sono */}
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">😴</span>
              <h3 className="font-bold text-gray-800">Horas de Sono</h3>
            </div>
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              Ideal: 7-8h
            </span>
          </div>
          <BarChart
            data={dadosSono.slice(-7)}
            color="#6366f1"
            height={140}
            meta={7}
          />
        </div>

        {/* Gráfico de Aderência */}
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <h3 className="font-bold text-gray-800">Aderência ao Plano</h3>
            </div>
          </div>
          <LineChart
            data={dadosAderencia}
            color="#10b981"
            height={140}
            unit="%"
          />
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-[#7C8B6F]/10 to-[#9CAF88]/10 rounded-2xl p-5 border border-[#7C8B6F]/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💡</span>
            <h3 className="font-bold text-gray-800">Insights</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            {estatisticas.mediaAgua >= 2 && (
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Excelente hidratação! Estás a atingir a meta de água.
              </li>
            )}
            {estatisticas.mediaAgua < 2 && (
              <li className="flex items-center gap-2">
                <span className="text-amber-500">⚠</span>
                Tenta aumentar o consumo de água para 2L/dia.
              </li>
            )}
            {estatisticas.mediaSono >= 7 && (
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                O teu sono está dentro do ideal. Continua assim!
              </li>
            )}
            {estatisticas.mediaSono < 7 && estatisticas.mediaSono > 0 && (
              <li className="flex items-center gap-2">
                <span className="text-amber-500">⚠</span>
                Tenta dormir pelo menos 7 horas por noite.
              </li>
            )}
            {estatisticas.pesoPerdido > 0 && (
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Estás no caminho certo! Continua focada.
              </li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
