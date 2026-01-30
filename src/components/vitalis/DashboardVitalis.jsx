import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link, useNavigate } from 'react-router-dom';

export default function DashboardVitalis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [client, setClient] = useState(null);
  const [plano, setPlano] = useState(null);
  const [registos, setRegistos] = useState([]);
  const [refeicoes, setRefeicoes] = useState([]);
  const [mealsHoje, setMealsHoje] = useState([]);
  const [aguaHoje, setAguaHoje] = useState(0);
  const [treinoHoje, setTreinoHoje] = useState(null);
  const [sonoHoje, setSonoHoje] = useState(null);
  const [jejumActual, setJejumActual] = useState(null);
  const [humor, setHumor] = useState(null);
  const [streak, setStreak] = useState(0);

  const hoje = new Date().toISOString().split('T')[0];
  const diaSemana = new Date().toLocaleDateString('pt-PT', { weekday: 'long' });
  const dataFormatada = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
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

      // 3. Buscar client data
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

      // 5. Buscar registos (últimos 30 dias)
      const { data: registosData } = await supabase
        .from('vitalis_registos')
        .select('*')
        .eq('user_id', userData.id)
        .order('data', { ascending: false })
        .limit(30);
      setRegistos(registosData || []);

      // 6. Buscar configuração de refeições
      const { data: refeicoesCofig } = await supabase
        .from('vitalis_refeicoes_config')
        .select('*')
        .eq('user_id', userData.id)
        .eq('activo', true)
        .order('ordem', { ascending: true });
      setRefeicoes(refeicoesCofig || []);

      // 7. Buscar meals de hoje
      const { data: mealsData } = await supabase
        .from('vitalis_meals_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje);
      setMealsHoje(mealsData || []);

      // 8. Buscar água de hoje
      const { data: aguaData } = await supabase
        .from('vitalis_agua_log')
        .select('quantidade_ml')
        .eq('user_id', userData.id)
        .eq('data', hoje);
      
      const totalAgua = (aguaData || []).reduce((sum, a) => sum + a.quantidade_ml, 0) / 1000;
      setAguaHoje(totalAgua);

      // 9. Buscar treino de hoje
      const { data: treinoData } = await supabase
        .from('vitalis_workouts_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .limit(1)
        .single();
      
      if (treinoData) setTreinoHoje(treinoData);

      // 10. Buscar sono de hoje (noite anterior)
      const { data: sonoData } = await supabase
        .from('vitalis_sono_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .limit(1)
        .single();
      
      if (sonoData) setSonoHoje(sonoData);

      // 11. Buscar jejum activo
      const { data: jejumData } = await supabase
        .from('vitalis_fasting_log')
        .select('*')
        .eq('user_id', userData.id)
        .is('hora_fim', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (jejumData) setJejumActual(jejumData);

      // 12. Calcular streak
      calcularStreak(registosData || []);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularStreak = (registos) => {
    let count = 0;
    const hoje = new Date();
    
    for (let i = 0; i < 30; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];
      
      const temRegisto = registos.some(r => r.data === dataStr);
      if (temRegisto) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    setStreak(count);
  };

  const adicionarAgua = async (ml = 250) => {
  if (!userId) {
    console.error('userId não disponível');
    return;
  }
  
  try {
    const { error } = await supabase
      .from('vitalis_agua_log')
      .insert({
        user_id: userId,
        data: hoje,
        quantidade_ml: ml
      });
    
    if (error) throw error;
    
    setAguaHoje(prev => prev + (ml / 1000));
  } catch (err) {
    console.error('Erro ao registar água:', err.message);
  }
};
    try {
      const { error } = await supabase
        .from('vitalis_agua_log')
        .insert([{
          user_id: userId,
          data: hoje,
          quantidade_ml: ml
        }]);
      
      if (error) throw error;
      
      setAguaHoje(prev => prev + (ml / 1000));
    } catch (err) {
      console.error('Erro ao registar água:', err);
    }
  };

  const registarTreino = async () => {
    try {
      const agora = new Date();
      const hora = agora.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
      
      const { data, error } = await supabase
        .from('vitalis_workouts_log')
        .insert([{
          user_id: userId,
          data: hoje,
          tipo: 'geral'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setTreinoHoje({ ...data, hora });
    } catch (err) {
      console.error('Erro ao registar treino:', err);
    }
  };

  const iniciarJejum = async () => {
    try {
      const { data, error } = await supabase
        .from('vitalis_fasting_log')
        .insert([{
          user_id: userId,
          data: hoje,
          hora_inicio: new Date().toISOString(),
          protocolo: protocoloJejum
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setJejumActual(data);
    } catch (err) {
      console.error('Erro ao iniciar jejum:', err);
    }
  };

  const terminarJejum = async () => {
    if (!jejumActual) return;
    
    try {
      const horaFim = new Date();
      const horaInicio = new Date(jejumActual.hora_inicio);
      const duracaoMin = Math.round((horaFim - horaInicio) / (1000 * 60));
      
      const { error } = await supabase
        .from('vitalis_fasting_log')
        .update({
          hora_fim: horaFim.toISOString(),
          duracao_min: duracaoMin,
          completou: duracaoMin >= (horasJejum * 60)
        })
        .eq('id', jejumActual.id);
      
      if (error) throw error;
      
      setJejumActual(null);
    } catch (err) {
      console.error('Erro ao terminar jejum:', err);
    }
  };

  const registarHumor = async (valor) => {
    setHumor(valor);
    // TODO: Guardar na base de dados
  };

  // Cálculos
  const pesoInicial = client?.peso_inicial || 0;
  const pesoActual = client?.peso_actual || 0;
  const pesoMeta = client?.peso_meta || pesoInicial;
  const pesoPerdido = pesoInicial - pesoActual;
  const pesoRestante = pesoActual - pesoMeta;
  const progressoPeso = pesoInicial > pesoMeta ? ((pesoPerdido) / (pesoInicial - pesoMeta)) * 100 : 0;

  const metaAgua = 2; // litros
  const progressoAgua = (aguaHoje / metaAgua) * 100;

  const totalRefeicoes = refeicoes.length || 4;
  const refeicoesConcluidas = mealsHoje.filter(m => m.seguiu_plano === 'sim' || m.seguiu_plano === 'parcial').length;
  const progressoRefeicoes = totalRefeicoes > 0 ? (refeicoesConcluidas / totalRefeicoes) * 100 : 0;

  const progressoGeral = Math.round((progressoRefeicoes + progressoAgua) / 2);

  // Dados do jejum
  const jejumActivo = plano?.aceita_jejum || false;
  const protocoloJejum = plano?.protocolo_jejum || '16:8';
  const horasJejum = plano?.horas_jejum || 16;
  const janelaInicio = plano?.janela_alimentar_inicio || '12:00';

  // Macros do plano
  const macrosAlvo = {
    proteina: plano?.porcoes_proteina || 6,
    hidratos: plano?.porcoes_hidratos || 3,
    gordura: plano?.porcoes_gordura || 8
  };

  // Calcular macros consumidos hoje
  const macrosConsumidos = mealsHoje.reduce((acc, meal) => ({
    proteina: acc.proteina + (parseFloat(meal.porcoes_proteina) || 0),
    hidratos: acc.hidratos + (parseFloat(meal.porcoes_hidratos) || 0),
    gordura: acc.gordura + (parseFloat(meal.porcoes_gordura) || 0)
  }), { proteina: 0, hidratos: 0, gordura: 0 });

  // Calorias estimadas
  const caloriasAlvo = plano?.calorias_diarias || 1250;
  const caloriasConsumidas = Math.round(
    (macrosConsumidos.proteina * 20 * 4) + // proteína: ~20g por porção, 4 kcal/g
    (macrosConsumidos.hidratos * 30 * 4) + // hidratos: ~30g por porção, 4 kcal/g
    (macrosConsumidos.gordura * 7 * 9)     // gordura: ~7g por porção, 9 kcal/g
  );
  const progressoCalorias = (caloriasConsumidas / caloriasAlvo) * 100;

  // Última semana para calendário
  const ultimaSemana = [];
  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    const dataStr = data.toISOString().split('T')[0];
    const registo = registos.find(r => r.data === dataStr);
    ultimaSemana.push({
      dia: data.getDate(),
      diaSemana: data.toLocaleDateString('pt-PT', { weekday: 'short' }).charAt(0).toUpperCase(),
      status: registo ? (registo.aderencia_1a10 >= 7 ? 'verde' : registo.aderencia_1a10 >= 4 ? 'amarelo' : 'vermelho') : (i === 0 ? 'hoje' : 'vazio'),
      ehHoje: i === 0
    });
  }

  // Dias de treino
  const diasTreino = plano?.dias_treino || [];
  const diaAtual = new Date().getDay(); // 0 = Domingo
  const ehDiaTreino = diasTreino.includes(diaAtual);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌱</div>
          <p className="text-gray-600">A carregar o teu dia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pb-8">
      
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500"></div>
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,50 Q25,30 50,50 T100,50 V100 H0 Z" fill="white"/>
          </svg>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>VITALIS</h1>
              <p className="text-amber-100 text-sm capitalize">{diaSemana}, {dataFormatada}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right text-white">
                <p className="text-xs opacity-80">Bem-vinda,</p>
                <p className="font-semibold">{client?.nome_completo?.split(' ')[0] || 'Guerreira'} 🌱</p>
              </div>
              <Link to="/" className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-xl border-2 border-white/30 hover:bg-white/30 transition-colors">
                ←
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5 space-y-5">
        
        {/* Mensagem + Streak */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-white/80 backdrop-blur rounded-2xl p-4 border border-white/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl animate-bounce">✨</div>
              <div>
                <p className="text-gray-800 font-medium text-sm md:text-base">"Cada escolha consciente te aproxima da melhor versão de ti."</p>
                <p className="text-xs text-gray-500 mt-1">
                  Dia {Math.floor((new Date() - new Date(client?.data_inicio || new Date())) / (1000 * 60 * 60 * 24)) + 1} da tua jornada • 
                  Semana {Math.floor((new Date() - new Date(client?.data_inicio || new Date())) / (7 * 24 * 60 * 60 * 1000)) + 1} • 
                  Fase {plano?.fase || 'Inicial'}
                </p>
              </div>
            </div>
          </div>
          
          {streak > 0 && (
            <div className="md:w-48 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🔥</div>
                <div>
                  <p className="text-2xl font-bold">{streak} dias</p>
                  <p className="text-amber-100 text-xs">Streak activo!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* Coluna Esquerda */}
          <div className="col-span-12 md:col-span-4 space-y-4">
            
            {/* Círculo de Progresso */}
            <div className="bg-white rounded-3xl shadow-xl p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Progresso Hoje</h3>
              
              <div className="relative w-44 h-44 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background circles */}
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="6"/>
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#f3f4f6" strokeWidth="5"/>
                  <circle cx="50" cy="50" r="28" fill="none" stroke="#f3f4f6" strokeWidth="4"/>
                  
                  {/* Refeições - Outer */}
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad1)" strokeWidth="6" 
                          strokeDasharray="283" strokeDashoffset={283 - (283 * progressoRefeicoes / 100)} strokeLinecap="round"/>
                  {/* Água - Middle */}
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#0ea5e9" strokeWidth="5" 
                          strokeDasharray="226" strokeDashoffset={226 - (226 * progressoAgua / 100)} strokeLinecap="round"/>
                  {/* Movimento - Inner */}
                  <circle cx="50" cy="50" r="28" fill="none" stroke="#10b981" strokeWidth="4" 
                          strokeDasharray="176" strokeDashoffset={176 - (176 * (treinoHoje ? 100 : 0) / 100)} strokeLinecap="round"/>
                  
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b"/>
                      <stop offset="100%" stopColor="#ef4444"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">{progressoGeral}%</span>
                  <span className="text-xs text-gray-500">completo</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-red-500 mx-auto mb-1"></div>
                  <p className="font-semibold text-gray-700">{refeicoesConcluidas}/{totalRefeicoes}</p>
                  <p className="text-gray-500">Refeições</p>
                </div>
                <div className="p-2 bg-sky-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-sky-500 mx-auto mb-1"></div>
                  <p className="font-semibold text-gray-700">{aguaHoje.toFixed(1)}L</p>
                  <p className="text-gray-500">Água</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto mb-1"></div>
                  <p className="font-semibold text-gray-700">{treinoHoje ? '✓' : '—'}</p>
                  <p className="text-gray-500">Treino</p>
                </div>
              </div>
            </div>

            {/* Quick Trackers */}
            <div className="bg-white rounded-2xl shadow-xl p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Track</h3>
              
              {/* Água */}
              <div className="flex items-center justify-between p-3 bg-sky-50 rounded-xl mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💧</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{aguaHoje.toFixed(1)} / {metaAgua}L</p>
                    <p className="text-xs text-gray-500">Água</p>
                  </div>
                </div>
                <button 
                  onClick={adicionarAgua}
                  className="w-8 h-8 bg-sky-500 text-white rounded-full text-sm font-bold hover:bg-sky-600 transition-colors shadow-md"
                >
                  +
                </button>
              </div>

              {/* Treino */}
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏃‍♀️</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {ehDiaTreino ? 'Dia de Treino' : 'Dia de Descanso'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {treinoHoje ? `Feito às ${treinoHoje.hora}` : (ehDiaTreino ? 'Por fazer' : 'Recupera bem!')}
                    </p>
                  </div>
                </div>
                {ehDiaTreino && !treinoHoje && (
                  <button 
                    onClick={registarTreino}
                    className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-full font-medium hover:bg-emerald-600 transition-colors shadow-md"
                  >
                    ✓ Feito
                  </button>
                )}
                {treinoHoje && (
                  <span className="text-emerald-500 text-xl">✓</span>
                )}
              </div>

              {/* Sono */}
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xl">😴</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {sonoHoje ? `${Math.floor(sonoHoje.duracao_min / 60)}h ${sonoHoje.duracao_min % 60}m` : '— h'}
                    </p>
                    <p className="text-xs text-gray-500">Sono esta noite</p>
                  </div>
                </div>
                {sonoHoje ? (
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className={i <= sonoHoje.qualidade_1a5 ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                    ))}
                  </div>
                ) : (
                  <Link to="/vitalis/checkin" className="text-xs text-indigo-600 hover:text-indigo-700">
                    Registar →
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Coluna Central */}
          <div className="col-span-12 md:col-span-5 space-y-4">
            
            {/* Timer de Jejum */}
            {(jejumActivo || jejumActual) && (
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-4 text-white shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⏱️</span>
                    <span className="font-semibold">Jejum {protocoloJejum}</span>
                  </div>
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                    {jejumActual ? 'A decorrer' : 'Parado'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold">
                      {jejumActual ? (() => {
                        const inicio = new Date(jejumActual.hora_inicio);
                        const agora = new Date();
                        const diffMin = Math.floor((agora - inicio) / (1000 * 60));
                        const horas = Math.floor(diffMin / 60);
                        const mins = diffMin % 60;
                        return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                      })() : '--:--'}
                    </p>
                    <p className="text-purple-200 text-sm">de {horasJejum} horas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-purple-200">Janela alimentar às</p>
                    <p className="text-xl font-semibold">{janelaInicio}</p>
                  </div>
                </div>
                
                <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all" 
                    style={{ 
                      width: jejumActual ? `${Math.min((() => {
                        const inicio = new Date(jejumActual.hora_inicio);
                        const agora = new Date();
                        const diffMin = Math.floor((agora - inicio) / (1000 * 60));
                        return (diffMin / (horasJejum * 60)) * 100;
                      })(), 100)}%` : '0%' 
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between mt-3">
                  {!jejumActual ? (
                    <button 
                      onClick={iniciarJejum}
                      className="flex-1 px-4 py-2 bg-white text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors"
                    >
                      Iniciar Jejum
                    </button>
                  ) : (
                    <>
                      <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors">
                        Pausar
                      </button>
                      <button 
                        onClick={terminarJejum}
                        className="px-4 py-2 bg-white text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors"
                      >
                        Terminar Jejum
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Refeições do Dia */}
            <div className="bg-white rounded-3xl shadow-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Refeições Hoje</h3>
                <Link to="/vitalis/refeicoes-config" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                  Configurar →
                </Link>
              </div>
              
              {refeicoes.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-3">Ainda não configuraste as tuas refeições</p>
                  <Link 
                    to="/vitalis/refeicoes-config"
                    className="inline-block px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                  >
                    Configurar Agora
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {refeicoes.map((ref) => {
                    const meal = mealsHoje.find(m => m.refeicao === ref.nome);
                    const status = meal?.seguiu_plano;
                    
                    return (
                      <div 
                        key={ref.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${
                          status === 'sim' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                          status === 'parcial' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' :
                          status === 'nao' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' :
                          'bg-gray-50 border-2 border-dashed border-gray-200'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm shadow-md ${
                          status === 'sim' ? 'bg-green-500' :
                          status === 'parcial' ? 'bg-yellow-500' :
                          status === 'nao' ? 'bg-red-500' :
                          'bg-gray-200 text-gray-400'
                        }`}>
                          {status === 'sim' ? '✓' : status === 'parcial' ? '~' : status === 'nao' ? '✕' : '○'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${status ? 'text-gray-800' : 'text-gray-400'}`}>{ref.nome}</p>
                          <p className="text-xs text-gray-500">
                            {meal ? `${meal.hora || ref.hora_habitual || '--:--'} • ${status === 'sim' ? 'Seguiu o plano' : status === 'parcial' ? 'Parcialmente' : 'Não seguiu'}` : `~${ref.hora_habitual || '--:--'}`}
                          </p>
                        </div>
                        {status ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            status === 'sim' ? 'bg-green-100 text-green-700' :
                            status === 'parcial' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {status === 'sim' ? '100%' : status === 'parcial' ? '70%' : '0%'}
                          </span>
                        ) : (
                          <Link 
                            to="/vitalis/meals"
                            className="px-3 py-1.5 bg-amber-500 text-white text-xs rounded-full font-medium hover:bg-amber-600 transition-colors shadow-md"
                          >
                            Registar
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="col-span-12 md:col-span-3 space-y-4">
            
            {/* Peso */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Peso</p>
                {pesoPerdido > 0 && (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                    ↓ {pesoPerdido.toFixed(1)}kg
                  </span>
                )}
              </div>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-gray-800">{pesoActual}</p>
                <p className="text-gray-500 text-sm mb-1">kg</p>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Início: {pesoInicial}kg</span>
                  <span>Meta: {pesoMeta}kg</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-green-500 rounded-full transition-all" 
                    style={{ width: `${Math.min(progressoPeso, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {pesoPerdido.toFixed(1)}kg perdidos • {pesoRestante.toFixed(1)}kg restantes
                </p>
              </div>
            </div>

            {/* Humor */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Como te sentes?</p>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { emoji: '😫', valor: 1 },
                  { emoji: '😕', valor: 2 },
                  { emoji: '😐', valor: 3 },
                  { emoji: '😊', valor: 4 },
                  { emoji: '🤩', valor: 5 }
                ].map(({ emoji, valor }) => (
                  <button
                    key={valor}
                    onClick={() => registarHumor(valor)}
                    className={`p-2 rounded-lg transition-all text-xl ${
                      humor === valor 
                        ? 'bg-green-100 ring-2 ring-green-400' 
                        : 'hover:bg-gray-100 opacity-50 hover:opacity-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {humor && (
                <p className="text-xs text-center text-gray-500 mt-2">Energia: {humor * 2}/10</p>
              )}
            </div>

            {/* Mini Calendário */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Esta Semana</p>
              
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {ultimaSemana.map((dia, i) => (
                  <span key={i} className="text-xs text-gray-400">{dia.diaSemana}</span>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {ultimaSemana.map((dia, i) => (
                  <div 
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mx-auto ${
                      dia.status === 'verde' ? 'bg-green-500 text-white' :
                      dia.status === 'amarelo' ? 'bg-yellow-400 text-white' :
                      dia.status === 'vermelho' ? 'bg-red-400 text-white' :
                      dia.ehHoje ? 'bg-amber-500 text-white ring-2 ring-amber-300 ring-offset-2' :
                      'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {dia.dia}
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Aderência</span>
                <span className="text-sm font-bold text-green-600">
                  {Math.round((ultimaSemana.filter(d => d.status === 'verde' || d.status === 'amarelo').length / 7) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="bg-white rounded-3xl shadow-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Macros de Hoje</h3>
            <p className="text-xs text-gray-500">Baseado nas refeições registadas</p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 items-center">
            {/* Proteína */}
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#fee2e2" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#ef4444" strokeWidth="3" 
                          strokeDasharray="94" strokeDashoffset={94 - (94 * Math.min(macrosConsumidos.proteina / macrosAlvo.proteina, 1))} strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg">🥩</span>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-800">{macrosConsumidos.proteina.toFixed(1)} / {macrosAlvo.proteina}</p>
              <p className="text-xs text-gray-500">Proteína</p>
            </div>

            {/* Hidratos */}
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#fef3c7" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="3" 
                          strokeDasharray="94" strokeDashoffset={94 - (94 * Math.min(macrosConsumidos.hidratos / macrosAlvo.hidratos, 1))} strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg">🍚</span>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-800">{macrosConsumidos.hidratos.toFixed(1)} / {macrosAlvo.hidratos}</p>
              <p className="text-xs text-gray-500">Hidratos</p>
            </div>

            {/* Gordura */}
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#d1fae5" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#10b981" strokeWidth="3" 
                          strokeDasharray="94" strokeDashoffset={94 - (94 * Math.min(macrosConsumidos.gordura / macrosAlvo.gordura, 1))} strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg">🥑</span>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-800">{macrosConsumidos.gordura.toFixed(1)} / {macrosAlvo.gordura}</p>
              <p className="text-xs text-gray-500">Gordura</p>
            </div>

            {/* Calorias */}
            <div className="col-span-3">
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <span className="text-sm font-medium text-gray-700">Calorias</span>
                  </div>
                  <span className="text-xs text-gray-500">Meta: {caloriasAlvo} kcal</span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-800">{caloriasConsumidas}</span>
                  <span className="text-gray-500 mb-1">/ {caloriasAlvo} kcal</span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full transition-all" 
                    style={{ width: `${Math.min(progressoCalorias, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Restam {Math.max(caloriasAlvo - caloriasConsumidas, 0)} kcal para hoje
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <Link to="/vitalis/plano" className="group bg-white hover:bg-gradient-to-br hover:from-amber-500 hover:to-orange-600 rounded-2xl p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl text-center">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📋</div>
            <p className="font-medium text-gray-800 group-hover:text-white text-xs">Meu Plano</p>
          </Link>
          
          <Link to="/vitalis/meals" className="group bg-white hover:bg-gradient-to-br hover:from-teal-500 hover:to-cyan-600 rounded-2xl p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl text-center">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🍽️</div>
            <p className="font-medium text-gray-800 group-hover:text-white text-xs">Refeições</p>
          </Link>
          
          <Link to="/vitalis/checkin" className="group bg-white hover:bg-gradient-to-br hover:from-green-500 hover:to-emerald-600 rounded-2xl p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl text-center">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">✅</div>
            <p className="font-medium text-gray-800 group-hover:text-white text-xs">Check-in</p>
          </Link>
          
          <Link to="/vitalis/receitas" className="group bg-white hover:bg-gradient-to-br hover:from-orange-500 hover:to-red-600 rounded-2xl p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl text-center">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🍳</div>
            <p className="font-medium text-gray-800 group-hover:text-white text-xs">Receitas</p>
          </Link>
          
          <Link to="/vitalis/espaco-retorno" className="group bg-white hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-600 rounded-2xl p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl text-center">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💜</div>
            <p className="font-medium text-gray-800 group-hover:text-white text-xs">Espaço Retorno</p>
          </Link>
          
          <Link to="/vitalis/relatorios" className="group bg-white hover:bg-gradient-to-br hover:from-indigo-500 hover:to-violet-600 rounded-2xl p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl text-center">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</div>
            <p className="font-medium text-gray-800 group-hover:text-white text-xs">Relatórios</p>
          </Link>
        </div>

      </main>
    </div>
  );
}
