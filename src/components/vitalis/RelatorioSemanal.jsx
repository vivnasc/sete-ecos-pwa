import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link, useNavigate } from 'react-router-dom';

export default function RelatorioSemanal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [client, setClient] = useState(null);
  const [plano, setPlano] = useState(null);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(0); // 0 = esta semana, -1 = semana passada, etc.
  
  // Dados agregados
  const [dadosSemana, setDadosSemana] = useState({
    registos: [],
    meals: [],
    agua: [],
    treinos: [],
    sono: [],
    jejum: []
  });

  useEffect(() => {
    loadRelatorio();
  }, [semanaSeleccionada]);

  const getDatasSemana = (offset = 0) => {
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0 = Domingo
    const segundaFeira = new Date(hoje);
    segundaFeira.setDate(hoje.getDate() - diaSemana + 1 + (offset * 7));
    
    const domingo = new Date(segundaFeira);
    domingo.setDate(segundaFeira.getDate() + 6);
    
    return {
      inicio: segundaFeira.toISOString().split('T')[0],
      fim: domingo.toISOString().split('T')[0],
      label: `${segundaFeira.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })} - ${domingo.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}`
    };
  };

  const loadRelatorio = async () => {
    setLoading(true);
    try {
      // 1. Buscar user autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/vitalis/login');
        return;
      }

      // 2. Converter auth_id → users.id
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) throw new Error('Utilizador não encontrado');
      setUserId(userData.id);

      // 3. Buscar client
      const { data: clientData } = await supabase
        .from('vitalis_clients')
        .select('*')
        .eq('user_id', userData.id)
        .single();
      setClient(clientData);

      // 4. Buscar plano
      if (clientData) {
        const { data: planoData } = await supabase
          .from('vitalis_plano')
          .select('*')
          .eq('client_id', clientData.id)
          .single();
        setPlano(planoData);
      }

      // 5. Datas da semana
      const { inicio, fim } = getDatasSemana(semanaSeleccionada);

      // 6. Buscar registos da semana
      const { data: registos } = await supabase
        .from('vitalis_registos')
        .select('*')
        .eq('user_id', userData.id)
        .gte('data', inicio)
        .lte('data', fim)
        .order('data', { ascending: true });

      // 7. Buscar meals da semana
      const { data: meals } = await supabase
        .from('vitalis_meals_log')
        .select('*')
        .eq('user_id', userData.id)
        .gte('data', inicio)
        .lte('data', fim);

      // 8. Buscar água da semana
      const { data: agua } = await supabase
        .from('vitalis_agua_log')
        .select('*')
        .eq('user_id', userData.id)
        .gte('data', inicio)
        .lte('data', fim);

      // 9. Buscar treinos da semana
      const { data: treinos } = await supabase
        .from('vitalis_workouts_log')
        .select('*')
        .eq('user_id', userData.id)
        .gte('data', inicio)
        .lte('data', fim);

      // 10. Buscar sono da semana
      const { data: sono } = await supabase
        .from('vitalis_sono_log')
        .select('*')
        .eq('user_id', userData.id)
        .gte('data', inicio)
        .lte('data', fim);

      // 11. Buscar jejum da semana
      const { data: jejum } = await supabase
        .from('vitalis_fasting_log')
        .select('*')
        .eq('user_id', userData.id)
        .gte('data', inicio)
        .lte('data', fim);

      setDadosSemana({
        registos: registos || [],
        meals: meals || [],
        agua: agua || [],
        treinos: treinos || [],
        sono: sono || [],
        jejum: jejum || []
      });

    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos
  const calcularEstatisticas = () => {
    const { registos, meals, agua, treinos, sono, jejum } = dadosSemana;
    
    // Peso
    const pesosOrdenados = registos.filter(r => r.peso_kg).sort((a, b) => new Date(a.data) - new Date(b.data));
    const pesoInicio = pesosOrdenados[0]?.peso_kg || client?.peso_actual || 0;
    const pesoFim = pesosOrdenados[pesosOrdenados.length - 1]?.peso_kg || pesoInicio;
    const variacaoPeso = pesoFim - pesoInicio;

    // Refeições
    const totalMeals = meals.length;
    const mealsCompletas = meals.filter(m => m.seguiu_plano === 'sim').length;
    const mealsParciais = meals.filter(m => m.seguiu_plano === 'parcial').length;
    const mealsFalhadas = meals.filter(m => m.seguiu_plano === 'nao').length;
    const aderenciaRefeicoes = totalMeals > 0 
      ? Math.round(((mealsCompletas + (mealsParciais * 0.5)) / totalMeals) * 100) 
      : 0;

    // Água (média diária em litros)
    const aguaPorDia = {};
    agua.forEach(a => {
      if (!aguaPorDia[a.data]) aguaPorDia[a.data] = 0;
      aguaPorDia[a.data] += a.quantidade_ml;
    });
    const diasComAgua = Object.keys(aguaPorDia).length;
    const totalAgua = Object.values(aguaPorDia).reduce((sum, ml) => sum + ml, 0);
    const mediaAgua = diasComAgua > 0 ? (totalAgua / diasComAgua / 1000).toFixed(1) : 0;

    // Treinos
    const diasTreinoPlaneados = plano?.dias_treino?.length || 0;
    const treinosFeitos = treinos.length;

    // Sono (média)
    const sonoComDuracao = sono.filter(s => s.duracao_min);
    const mediaSono = sonoComDuracao.length > 0 
      ? Math.round(sonoComDuracao.reduce((sum, s) => sum + s.duracao_min, 0) / sonoComDuracao.length / 60 * 10) / 10
      : 0;
    const mediaQualidadeSono = sonoComDuracao.length > 0
      ? Math.round(sonoComDuracao.reduce((sum, s) => sum + (s.qualidade_1a5 || 0), 0) / sonoComDuracao.length * 10) / 10
      : 0;

    // Jejum
    const jejunsCompletos = jejum.filter(j => j.completou).length;
    const totalJejuns = jejum.length;

    // Energia/Humor médio
    const registosComEnergia = registos.filter(r => r.energia_1a10);
    const mediaEnergia = registosComEnergia.length > 0
      ? Math.round(registosComEnergia.reduce((sum, r) => sum + r.energia_1a10, 0) / registosComEnergia.length * 10) / 10
      : 0;

    const registosComHumor = registos.filter(r => r.humor_1a10);
    const mediaHumor = registosComHumor.length > 0
      ? Math.round(registosComHumor.reduce((sum, r) => sum + r.humor_1a10, 0) / registosComHumor.length * 10) / 10
      : 0;

    // Aderência geral
    const aderenciaGeral = registos.length > 0
      ? Math.round(registos.reduce((sum, r) => sum + (r.aderencia_1a10 || 0), 0) / registos.length * 10)
      : 0;

    return {
      pesoInicio,
      pesoFim,
      variacaoPeso,
      totalMeals,
      mealsCompletas,
      mealsParciais,
      mealsFalhadas,
      aderenciaRefeicoes,
      mediaAgua,
      diasComAgua,
      treinosFeitos,
      diasTreinoPlaneados,
      mediaSono,
      mediaQualidadeSono,
      jejunsCompletos,
      totalJejuns,
      mediaEnergia,
      mediaHumor,
      aderenciaGeral
    };
  };

  const stats = calcularEstatisticas();
  const { inicio, fim, label } = getDatasSemana(semanaSeleccionada);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📊</div>
          <p className="text-gray-600">A carregar relatório...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pb-8">

      {/* Header */}
      <header className="bg-gradient-to-r from-[#C1634A] via-[#D97706] to-[#A54E38] text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/vitalis/dashboard')}
              className="text-white/80 hover:text-white flex items-center gap-2"
            >
              ← Voltar
            </button>
            <div className="flex items-center gap-3">
              <img
                src="/logos/VITALIS_LOGO_V3.png"
                alt="Vitalis"
                className="w-10 h-10 object-contain drop-shadow-lg"
              />
              <h1 className="text-2xl font-bold">Relatório Semanal</h1>
            </div>
            <div className="w-16"></div>
          </div>
          
          {/* Selector de Semana */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setSemanaSeleccionada(s => s - 1)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              ←
            </button>
            <div className="text-center">
              <p className="text-lg font-semibold">{label}</p>
              <p className="text-sm text-white/70">
                {semanaSeleccionada === 0 ? 'Esta semana' : 
                 semanaSeleccionada === -1 ? 'Semana passada' : 
                 `${Math.abs(semanaSeleccionada)} semanas atrás`}
              </p>
            </div>
            <button
              onClick={() => setSemanaSeleccionada(s => Math.min(s + 1, 0))}
              disabled={semanaSeleccionada >= 0}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Score Geral */}
        <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Aderência Geral</h2>
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
              <circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke={stats.aderenciaGeral >= 70 ? '#10b981' : stats.aderenciaGeral >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * stats.aderenciaGeral / 100)} 
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-800">{stats.aderenciaGeral}%</span>
            </div>
          </div>
          <p className="text-gray-600">
            {stats.aderenciaGeral >= 80 ? '🎉 Excelente semana!' :
             stats.aderenciaGeral >= 60 ? '💪 Bom progresso!' :
             stats.aderenciaGeral >= 40 ? '📈 Podes melhorar!' :
             '🌱 Vamos recomeçar!'}
          </p>
        </div>

        {/* Peso */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Peso</h3>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              stats.variacaoPeso < 0 ? 'bg-green-100 text-green-700' :
              stats.variacaoPeso > 0 ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {stats.variacaoPeso > 0 ? '+' : ''}{stats.variacaoPeso.toFixed(1)} kg
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-xs text-gray-500">Início</p>
              <p className="text-2xl font-bold text-gray-800">{stats.pesoInicio}</p>
              <p className="text-xs text-gray-500">kg</p>
            </div>
            <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full relative">
              <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${
                stats.variacaoPeso <= 0 ? 'bg-green-500' : 'bg-red-500'
              }`} style={{ left: '0%' }}></div>
              <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow ${
                stats.variacaoPeso <= 0 ? 'bg-green-500' : 'bg-red-500'
              }`} style={{ right: '0%' }}></div>
              <div className="text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {stats.variacaoPeso < 0 ? '→' : stats.variacaoPeso > 0 ? '←' : '•'}
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Fim</p>
              <p className="text-2xl font-bold text-gray-800">{stats.pesoFim}</p>
              <p className="text-xs text-gray-500">kg</p>
            </div>
          </div>
        </div>

        {/* Grid de Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Refeições */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🍽️</span>
              <span className="text-xs text-gray-500 uppercase">Refeições</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.aderenciaRefeicoes}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.mealsCompletas}✓ {stats.mealsParciais}~ {stats.mealsFalhadas}✕
            </p>
          </div>

          {/* Água */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💧</span>
              <span className="text-xs text-gray-500 uppercase">Água/dia</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.mediaAgua}L</p>
            <p className="text-xs text-gray-500 mt-1">{stats.diasComAgua} dias registados</p>
          </div>

          {/* Treinos */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏃‍♀️</span>
              <span className="text-xs text-gray-500 uppercase">Treinos</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.treinosFeitos}</p>
            <p className="text-xs text-gray-500 mt-1">
              de {stats.diasTreinoPlaneados} planeados
            </p>
          </div>

          {/* Sono */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">😴</span>
              <span className="text-xs text-gray-500 uppercase">Sono</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.mediaSono}h</p>
            <p className="text-xs text-gray-500 mt-1">
              Qualidade: {stats.mediaQualidadeSono}/5 ★
            </p>
          </div>
        </div>

        {/* Energia & Humor */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Bem-estar</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">⚡ Energia</span>
                <span className="font-bold text-gray-800">{stats.mediaEnergia}/10</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all"
                  style={{ width: `${stats.mediaEnergia * 10}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">😊 Humor</span>
                <span className="font-bold text-gray-800">{stats.mediaHumor}/10</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
                  style={{ width: `${stats.mediaHumor * 10}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Jejum (se aplicável) */}
        {(plano?.aceita_jejum || stats.totalJejuns > 0) && (
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⏱️</span>
                <div>
                  <h3 className="font-semibold text-gray-800">Jejum Intermitente</h3>
                  <p className="text-sm text-gray-500">{plano?.protocolo_jejum || 'Protocolo não definido'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-purple-600">{stats.jejunsCompletos}/{stats.totalJejuns}</p>
                <p className="text-xs text-gray-500">completados</p>
              </div>
            </div>
          </div>
        )}

        {/* Dicas/Insights */}
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-5 border border-amber-200">
          <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <span>💡</span> Insights da Semana
          </h3>
          <ul className="space-y-2 text-sm text-amber-800">
            {stats.aderenciaRefeicoes < 70 && (
              <li>• Tenta planear as refeições com antecedência para melhorar a aderência</li>
            )}
            {stats.mediaAgua < 1.5 && (
              <li>• A hidratação pode melhorar! Tenta beber pelo menos 2L por dia</li>
            )}
            {stats.treinosFeitos < stats.diasTreinoPlaneados && (
              <li>• Faltaram {stats.diasTreinoPlaneados - stats.treinosFeitos} treinos esta semana</li>
            )}
            {stats.mediaSono < 7 && stats.mediaSono > 0 && (
              <li>• O sono está abaixo do ideal. Tenta dormir pelo menos 7-8 horas</li>
            )}
            {stats.mediaEnergia < 5 && stats.mediaEnergia > 0 && (
              <li>• Energia baixa pode estar ligada à alimentação ou sono</li>
            )}
            {stats.aderenciaGeral >= 80 && (
              <li>• 🎉 Parabéns! Mantém este ritmo excelente!</li>
            )}
            {stats.variacaoPeso < 0 && (
              <li>• ✨ Perdeste {Math.abs(stats.variacaoPeso).toFixed(1)}kg esta semana! Bom trabalho!</li>
            )}
          </ul>
        </div>

        {/* Botões de Acção */}
        <div className="flex gap-4">
          <Link
            to="/vitalis/dashboard"
            className="flex-1 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-center hover:bg-gray-50 transition-colors"
          >
            ← Voltar ao Dashboard
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            🖨️ Imprimir/PDF
          </button>
        </div>

      </main>
    </div>
  );
}
