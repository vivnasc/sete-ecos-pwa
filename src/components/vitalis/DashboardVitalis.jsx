import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link, useNavigate } from 'react-router-dom';
import { StreakDisplay, CelebracaoModal, ConquistasSection, NivelProgresso, CONQUISTAS } from './Gamificacao.jsx';
import { useOnboarding, OnboardingWrapper } from './OnboardingTutorial.jsx';

// Função para solicitar permissão de notificações
const solicitarPermissaoNotificacoes = async () => {
  if (!('Notification' in window)) {
    console.log('Este browser não suporta notificações');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Função para enviar notificação
const enviarNotificacao = (titulo, opcoes = {}) => {
  if (Notification.permission === 'granted') {
    const notif = new Notification(titulo, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      ...opcoes
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    return notif;
  }
};

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
  const [melhorStreak, setMelhorStreak] = useState(0);
  const [showCelebracao, setShowCelebracao] = useState(false);
  const [conquistaActual, setConquistaActual] = useState(null);
  const [conquistasDesbloqueadas, setConquistasDesbloqueadas] = useState([]);
  const [xpTotal, setXpTotal] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vitalis-theme') === 'dark';
    }
    return false;
  });

  // Hook do onboarding
  const { mostrarOnboarding, completarOnboarding } = useOnboarding();

  // Ref para controlar se já enviamos notificação do jejum
  const notificacaoJejumEnviada = useRef(false);
  const jejumTimerRef = useRef(null);

  // Estados para Sono interactivo
  const [mostrarSonoForm, setMostrarSonoForm] = useState(false);
  const [sonoHoras, setSonoHoras] = useState('');
  const [sonoMinutos, setSonoMinutos] = useState('');
  const [sonoQualidade, setSonoQualidade] = useState(0);

  // Estados para PWA install e notificações
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(false);
  const [mostrarBannerPWA, setMostrarBannerPWA] = useState(false);

  const hoje = new Date().toISOString().split('T')[0];
  const diaSemana = new Date().toLocaleDateString('pt-PT', { weekday: 'long' });
  const dataFormatada = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });

  useEffect(() => {
    loadDashboard();
  }, []);

  // Detectar se PWA está instalada e configurar eventos
  useEffect(() => {
    // Verificar se já está instalada
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    setIsPWAInstalled(isStandalone);

    // Verificar estado das notificações
    if ('Notification' in window) {
      setNotificacoesAtivas(Notification.permission === 'granted');
    }

    // Verificar se já fechou o banner antes (durante 7 dias)
    const bannerFechado = localStorage.getItem('vitalis-pwa-banner-fechado');
    if (bannerFechado) {
      const dataFecho = new Date(bannerFechado);
      const agora = new Date();
      const diasPassados = (agora - dataFecho) / (1000 * 60 * 60 * 24);
      if (diasPassados < 7) {
        setMostrarBannerPWA(false);
      } else {
        setMostrarBannerPWA(!isStandalone);
      }
    } else {
      setMostrarBannerPWA(!isStandalone);
    }

    // Capturar evento de instalação PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setMostrarBannerPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Dark mode effect
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('vitalis-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Fasting notification effect - monitora o timer e notifica quando a janela abre
  useEffect(() => {
    if (!jejumActual || !plano?.horas_jejum) return;

    const verificarJanelaAlimentar = () => {
      const inicio = new Date(jejumActual.hora_inicio);
      const agora = new Date();
      const diffMin = Math.floor((agora - inicio) / (1000 * 60));
      const horasDecorridas = diffMin / 60;
      const horasJejumMeta = plano.horas_jejum || 16;

      // Se completou o jejum e ainda não notificamos
      if (horasDecorridas >= horasJejumMeta && !notificacaoJejumEnviada.current) {
        notificacaoJejumEnviada.current = true;

        // Enviar notificação
        enviarNotificacao('Janela Alimentar Aberta! 🎉', {
          body: `Parabéns! Completaste ${horasJejumMeta}h de jejum. Podes começar a comer agora.`,
          tag: 'jejum-completo',
          requireInteraction: true
        });

        // Guardar no localStorage que notificação foi enviada para esta sessão
        localStorage.setItem(`jejum-notif-${jejumActual.id}`, 'true');
      }
    };

    // Verificar se já enviamos notificação para este jejum
    const jaNotificou = localStorage.getItem(`jejum-notif-${jejumActual.id}`);
    if (jaNotificou) {
      notificacaoJejumEnviada.current = true;
    }

    // Verificar imediatamente
    verificarJanelaAlimentar();

    // Verificar a cada minuto
    jejumTimerRef.current = setInterval(verificarJanelaAlimentar, 60000);

    return () => {
      if (jejumTimerRef.current) {
        clearInterval(jejumTimerRef.current);
      }
    };
  }, [jejumActual, plano?.horas_jejum]);

  // Reset notification flag when fasting ends
  useEffect(() => {
    if (!jejumActual) {
      notificacaoJejumEnviada.current = false;
    }
  }, [jejumActual]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/vitalis/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) throw new Error('Utilizador não encontrado');
      setUserId(userData.id);

      const { data: clientData } = await supabase
        .from('vitalis_clients')
        .select('*')
        .eq('user_id', userData.id)
        .single();
      setClient(clientData);

      if (clientData) {
        const { data: planoData } = await supabase
          .from('vitalis_plano')
          .select('*')
          .eq('client_id', clientData.id)
          .single();
        setPlano(planoData);
      }

      const { data: registosData } = await supabase
        .from('vitalis_registos')
        .select('*')
        .eq('user_id', userData.id)
        .order('data', { ascending: false })
        .limit(30);
      setRegistos(registosData || []);

      const { data: refeicoesCofig } = await supabase
        .from('vitalis_refeicoes_config')
        .select('*')
        .eq('user_id', userData.id)
        .eq('activo', true)
        .order('ordem', { ascending: true });
      setRefeicoes(refeicoesCofig || []);

      const { data: mealsData } = await supabase
        .from('vitalis_meals_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje);
      setMealsHoje(mealsData || []);

      const { data: aguaData } = await supabase
        .from('vitalis_agua_log')
        .select('quantidade_ml')
        .eq('user_id', userData.id)
        .eq('data', hoje);
      
      const totalAgua = (aguaData || []).reduce((sum, a) => sum + a.quantidade_ml, 0) / 1000;
      setAguaHoje(totalAgua);

      const { data: treinoData } = await supabase
        .from('vitalis_workouts_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .limit(1)
        .single();
      
      if (treinoData) setTreinoHoje(treinoData);

      const { data: sonoData } = await supabase
        .from('vitalis_sono_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .limit(1)
        .single();
      
      if (sonoData) setSonoHoje(sonoData);

      const { data: jejumData } = await supabase
        .from('vitalis_fasting_log')
        .select('*')
        .eq('user_id', userData.id)
        .is('hora_fim', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (jejumData) setJejumActual(jejumData);

      calcularStreak(userData.id);
      calcularConquistas(userData.id);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular conquistas desbloqueadas
  const calcularConquistas = async (userId) => {
    try {
      // Buscar dados para verificar conquistas
      const [aguaCount, mealsCount, treinoCount, checkinCount] = await Promise.all([
        supabase.from('vitalis_agua_log').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('vitalis_meals_log').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('vitalis_workouts_log').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('vitalis_registos').select('id', { count: 'exact' }).eq('user_id', userId)
      ]);

      const conquistas = [];
      let xp = 0;

      // Conquista primeiro registo
      if ((checkinCount.count || 0) >= 1) {
        conquistas.push('primeiro_registo');
        xp += CONQUISTAS.primeiro_registo?.xp || 50;
      }

      // Conquistas de streak
      const streakAtual = parseInt(localStorage.getItem('vitalis-melhor-streak') || '0');
      if (streakAtual >= 3) { conquistas.push('streak_3'); xp += 100; }
      if (streakAtual >= 7) { conquistas.push('streak_7'); xp += 200; }
      if (streakAtual >= 14) { conquistas.push('streak_14'); xp += 350; }
      if (streakAtual >= 30) { conquistas.push('streak_30'); xp += 500; }

      // Conquistas de água
      if ((aguaCount.count || 0) >= 1) { conquistas.push('agua_1'); xp += 50; }
      if ((aguaCount.count || 0) >= 50) { conquistas.push('agua_50'); xp += 150; }

      // Conquistas de treino
      if ((treinoCount.count || 0) >= 1) { conquistas.push('treino_1'); xp += 75; }
      if ((treinoCount.count || 0) >= 10) { conquistas.push('treino_10'); xp += 200; }

      // Conquistas de refeições
      if ((mealsCount.count || 0) >= 10) { conquistas.push('refeicoes_10'); xp += 100; }
      if ((mealsCount.count || 0) >= 50) { conquistas.push('refeicoes_50'); xp += 250; }

      setConquistasDesbloqueadas(conquistas);
      setXpTotal(xp);
      localStorage.setItem('vitalis-xp', xp.toString());
      localStorage.setItem('vitalis-conquistas', JSON.stringify(conquistas));
    } catch (error) {
      console.error('Erro ao calcular conquistas:', error);
    }
  };

  const calcularStreak = async (userId) => {
    // Streak = dias consecutivos com pelo menos 1 registo (água, refeição, treino, sono, ou check-in)
    try {
      const hoje = new Date();
      let count = 0;

      for (let i = 0; i < 60; i++) { // Estendido para 60 dias
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const dataStr = data.toISOString().split('T')[0];

        // Verificar se há algum registo neste dia
        const [agua, meals, treino, sono, checkin] = await Promise.all([
          supabase.from('vitalis_agua_log').select('id').eq('user_id', userId).eq('data', dataStr).limit(1),
          supabase.from('vitalis_meals_log').select('id').eq('user_id', userId).eq('data', dataStr).limit(1),
          supabase.from('vitalis_workouts_log').select('id').eq('user_id', userId).eq('data', dataStr).limit(1),
          supabase.from('vitalis_sono_log').select('id').eq('user_id', userId).eq('data', dataStr).limit(1),
          supabase.from('vitalis_registos').select('id').eq('user_id', userId).eq('data', dataStr).limit(1)
        ]);

        const temRegisto =
          (agua.data && agua.data.length > 0) ||
          (meals.data && meals.data.length > 0) ||
          (treino.data && treino.data.length > 0) ||
          (sono.data && sono.data.length > 0) ||
          (checkin.data && checkin.data.length > 0);

        if (temRegisto) {
          count++;
        } else if (i > 0) {
          // Se não é hoje e não tem registo, quebra o streak
          break;
        }
      }

      setStreak(count);

      // Verificar melhor streak (guardar no localStorage)
      const melhor = parseInt(localStorage.getItem('vitalis-melhor-streak') || '0');
      if (count > melhor) {
        localStorage.setItem('vitalis-melhor-streak', count.toString());
        setMelhorStreak(count);

        // Verificar conquistas de streak
        const streakMilestones = [3, 7, 14, 30, 60];
        for (const milestone of streakMilestones) {
          if (count >= milestone && melhor < milestone) {
            const conquistaId = `streak_${milestone}`;
            setConquistaActual(conquistaId);
            setShowCelebracao(true);
            break;
          }
        }
      } else {
        setMelhorStreak(melhor);
      }
    } catch (error) {
      console.error('Erro ao calcular streak:', error);
      setStreak(0);
    }
  };

  // FUNÇÃO ÁGUA
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
      
      if (error) {
        console.error('Erro Supabase:', error.message);
        return;
      }
      
      setAguaHoje(prev => prev + (ml / 1000));
    } catch (err) {
      console.error('Erro ao registar água:', err.message);
    }
  };

  // FUNÇÃO TREINO
  const registarTreino = async () => {
    if (!userId) {
      console.error('userId não disponível');
      return;
    }
    
    try {
      const agora = new Date();
      const horaFormatada = agora.toLocaleTimeString('pt-PT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const { data, error } = await supabase
        .from('vitalis_workouts_log')
        .insert({
          user_id: userId,
          data: hoje,
          tipo: 'geral'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Erro Supabase:', error.message);
        return;
      }
      
      setTreinoHoje({ ...data, hora: horaFormatada });
    } catch (err) {
      console.error('Erro ao registar treino:', err.message);
    }
  };

  // FUNÇÃO SONO
  const registarSono = async () => {
    if (!userId) {
      console.error('userId não disponível');
      return;
    }

    const duracaoMin = (parseInt(sonoHoras) || 0) * 60 + (parseInt(sonoMinutos) || 0);

    if (duracaoMin === 0) {
      alert('Preenche as horas de sono');
      return;
    }

    // Auto-calcular qualidade baseado nas horas se não foi selecionada manualmente
    let qualidadeFinal = sonoQualidade;
    if (qualidadeFinal === 0) {
      const horas = duracaoMin / 60;
      if (horas >= 7 && horas <= 9) {
        qualidadeFinal = 5; // Sono ideal
      } else if (horas >= 6 && horas < 7) {
        qualidadeFinal = 4; // Bom
      } else if ((horas >= 5 && horas < 6) || (horas > 9 && horas <= 10)) {
        qualidadeFinal = 3; // Razoável
      } else if ((horas >= 4 && horas < 5) || (horas > 10 && horas <= 11)) {
        qualidadeFinal = 2; // Pouco
      } else {
        qualidadeFinal = 1; // Muito pouco ou demais
      }
    }

    try {
      const { data, error } = await supabase
        .from('vitalis_sono_log')
        .insert({
          user_id: userId,
          data: hoje,
          duracao_min: duracaoMin,
          qualidade_1a5: qualidadeFinal
        })
        .select()
        .single();

      if (error) {
        console.error('Erro Supabase:', error.message);
        return;
      }

      setSonoHoje(data);
      setMostrarSonoForm(false);
      setSonoHoras('');
      setSonoMinutos('');
      setSonoQualidade(0);
    } catch (err) {
      console.error('Erro ao registar sono:', err.message);
    }
  };

  // FUNÇÃO INICIAR JEJUM
  const iniciarJejum = async () => {
    if (!userId) {
      console.error('userId não disponível');
      return;
    }

    // Solicitar permissão para notificações ao iniciar jejum
    await solicitarPermissaoNotificacoes();
    
    try {
      const { data, error } = await supabase
        .from('vitalis_fasting_log')
        .insert({
          user_id: userId,
          data: hoje,
          hora_inicio: new Date().toISOString(),
          protocolo: protocoloJejum
        })
        .select()
        .single();
      
      if (error) {
        console.error('Erro Supabase:', error.message);
        return;
      }
      
      setJejumActual(data);
    } catch (err) {
      console.error('Erro ao iniciar jejum:', err.message);
    }
  };

  // FUNÇÃO TERMINAR JEJUM
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
      
      if (error) {
        console.error('Erro Supabase:', error.message);
        return;
      }
      
      setJejumActual(null);
    } catch (err) {
      console.error('Erro ao terminar jejum:', err.message);
    }
  };

  const registarHumor = async (valor) => {
    setHumor(valor);
  };

  // Cálculos
  const pesoInicial = client?.peso_inicial || 0;
  const pesoActual = client?.peso_actual || 0;
  const pesoMeta = client?.peso_meta || pesoInicial;
  const pesoPerdido = pesoInicial - pesoActual;
  const pesoRestante = pesoActual - pesoMeta;
  const progressoPeso = pesoInicial > pesoMeta ? ((pesoPerdido) / (pesoInicial - pesoMeta)) * 100 : 0;

  const metaAgua = 2;
  const progressoAgua = (aguaHoje / metaAgua) * 100;

  const totalRefeicoes = refeicoes.length || 4;
  const refeicoesConcluidas = mealsHoje.filter(m => m.seguiu_plano === 'sim' || m.seguiu_plano === 'parcial').length;
  const progressoRefeicoes = totalRefeicoes > 0 ? (refeicoesConcluidas / totalRefeicoes) * 100 : 0;

  const progressoGeral = Math.round((progressoRefeicoes + progressoAgua) / 2);

  // Dados do jejum
  const jejumActivo = plano?.aceita_jejum || false;
  const protocoloJejum = plano?.protocolo_jejum || '16_8';
  const horasJejum = plano?.horas_jejum || 16;
  
  // Calcular janela alimentar dinamicamente (hora início + horas jejum)
  const calcularJanelaAlimentar = () => {
    if (!jejumActual?.hora_inicio) return '--:--';
    const inicio = new Date(jejumActual.hora_inicio);
    inicio.setHours(inicio.getHours() + horasJejum);
    return inicio.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };
  const janelaInicio = calcularJanelaAlimentar();

  // Macros
  const macrosAlvo = {
    proteina: plano?.porcoes_proteina || 6,
    hidratos: plano?.porcoes_hidratos || 3,
    gordura: plano?.porcoes_gordura || 8
  };

  const macrosConsumidos = mealsHoje.reduce((acc, meal) => ({
    proteina: acc.proteina + (parseFloat(meal.porcoes_proteina) || 0),
    hidratos: acc.hidratos + (parseFloat(meal.porcoes_hidratos) || 0),
    gordura: acc.gordura + (parseFloat(meal.porcoes_gordura) || 0)
  }), { proteina: 0, hidratos: 0, gordura: 0 });

  const caloriasAlvo = plano?.calorias_diarias || 1250;
  const caloriasConsumidas = Math.round(
    (macrosConsumidos.proteina * 20 * 4) +
    (macrosConsumidos.hidratos * 30 * 4) +
    (macrosConsumidos.gordura * 7 * 9)
  );
  const progressoCalorias = (caloriasConsumidas / caloriasAlvo) * 100;

  // Calendário
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
  // getDay() retorna 0-6 (Domingo=0), mas o sistema usa 1-7 (Domingo=1)
  const diasTreino = plano?.dias_treino || [];
  const diaAtual = new Date().getDay() + 1; // Converter para formato 1-7
  const ehDiaTreino = diasTreino.includes(diaAtual);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌱</div>
          <p className="text-[#6B5C4C]">A carregar o teu dia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] pb-20">
      
      {/* Header com Perfil */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D]"></div>
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,50 Q25,30 50,50 T100,50 V100 H0 Z" fill="white"/>
          </svg>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-4">
          {/* Top bar com logo e ações */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img
                src="/logos/VITALIS_LOGO_V3.png"
                alt="Vitalis"
                className="w-10 h-10 object-contain drop-shadow-lg"
              />
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Cormorant Garamond, serif', letterSpacing: '3px' }}>VITALIS</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Notificações */}
              <Link
                to="/vitalis/notificacoes"
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-base border border-white/30 hover:bg-white/30 transition-colors"
                title="Notificações"
              >
                🔔
              </Link>
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-base border border-white/30 hover:bg-white/30 transition-colors"
                title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {/* Perfil do Utilizador */}
          <div className="flex items-center gap-4">
            {/* Avatar - Clicável para ir ao perfil */}
            <Link to="/vitalis/perfil" className="relative group">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/30 border-3 border-white shadow-lg flex items-center justify-center overflow-hidden group-hover:bg-white/40 transition-colors">
                {client?.foto_url ? (
                  <img src={client.foto_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl md:text-4xl">{client?.genero === 'M' ? '👨' : '👩'}</span>
                )}
              </div>
              {/* Badge de nível */}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-xs font-bold shadow-md">
                {Math.floor(xpTotal / 500) + 1}
              </div>
              {/* Indicador de editar */}
              <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs shadow opacity-0 group-hover:opacity-100 transition-opacity">
                ✏️
              </div>
            </Link>

            {/* Info do utilizador */}
            <div className="flex-1">
              <p className="text-white/70 text-sm">Olá,</p>
              <Link to="/vitalis/perfil" className="block hover:opacity-80 transition-opacity">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {client?.nome_completo?.split(' ')[0] || 'Guerreira'}! 👋
                </h2>
              </Link>
              <p className="text-white/80 text-sm capitalize">{diaSemana}, {dataFormatada}</p>

              {/* Barra de XP */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden max-w-[150px]">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${(xpTotal % 500) / 500 * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-white/80">{xpTotal} XP</span>
              </div>
            </div>

            {/* Streak compacto no header */}
            {streak > 0 && (
              <div className="hidden md:flex flex-col items-center bg-white/20 rounded-xl px-4 py-2">
                <span className="text-2xl">🔥</span>
                <span className="text-white font-bold">{streak}</span>
                <span className="text-white/70 text-xs">dias</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5 space-y-5">

        {/* Banner PWA e Notificações */}
        {mostrarBannerPWA && (
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-4 shadow-xl relative overflow-hidden">
            {/* Background decorativo */}
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="0" cy="100" r="60" fill="white"/>
                <circle cx="100" cy="0" r="40" fill="white"/>
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Instala o Vitalis!</h3>
                    <p className="text-white/80 text-sm">Acede offline e recebe notificações</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMostrarBannerPWA(false);
                    localStorage.setItem('vitalis-pwa-banner-fechado', new Date().toISOString());
                  }}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Botão de instalação - só aparece se tiver deferredPrompt (Chrome/Edge/etc) */}
                {deferredPrompt && (
                  <button
                    onClick={async () => {
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      if (outcome === 'accepted') {
                        setIsPWAInstalled(true);
                        setMostrarBannerPWA(false);
                      }
                      setDeferredPrompt(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-md"
                  >
                    <span>⬇️</span>
                    <span>Instalar App</span>
                  </button>
                )}

                {/* Botão para ativar notificações */}
                {!notificacoesAtivas && (
                  <button
                    onClick={async () => {
                      const resultado = await solicitarPermissaoNotificacoes();
                      setNotificacoesAtivas(resultado);
                      if (resultado) {
                        enviarNotificacao('Notificações ativadas! 🔔', {
                          body: 'Vais receber alertas quando a janela alimentar abrir.'
                        });
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg font-semibold text-sm hover:bg-white/30 transition-colors border border-white/30"
                  >
                    <span>🔔</span>
                    <span>Ativar Notificações</span>
                  </button>
                )}

                {/* Link para o guia (especialmente para iOS) */}
                <Link
                  to="/vitalis/guia"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors border border-white/20"
                >
                  <span>📖</span>
                  <span>Ver Guia</span>
                </Link>
              </div>

              {/* Dica para iOS */}
              {!deferredPrompt && (
                <p className="text-white/70 text-xs mt-3 flex items-center gap-1">
                  <span>💡</span>
                  <span>iPhone/iPad: Usa Safari → Partilhar → "Adicionar ao ecrã inicial"</span>
                </p>
              )}

              {/* Indicadores de status */}
              <div className="flex gap-4 mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${isPWAInstalled ? 'bg-green-400' : 'bg-white/40'}`}></span>
                  <span className="text-white/80">{isPWAInstalled ? 'App instalada' : 'Não instalada'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${notificacoesAtivas ? 'bg-green-400' : 'bg-white/40'}`}></span>
                  <span className="text-white/80">{notificacoesAtivas ? 'Notificações ativas' : 'Notificações off'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
            <div className="md:w-64">
              <StreakDisplay streak={streak} melhorStreak={melhorStreak} compacto={false} />
            </div>
          )}
        </div>

        {/* Quick Actions - Navegação Principal */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <Link to="/vitalis/plano" className="group bg-white hover:bg-[#7C8B6F] rounded-2xl p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl text-center border border-[#E8E2D9]">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📋</div>
            <p className="font-medium text-[#4A4035] group-hover:text-white text-sm">Meu Plano</p>
          </Link>

          <Link to="/vitalis/checkin" className="group bg-white hover:bg-[#7C8B6F] rounded-2xl p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl text-center border border-[#E8E2D9]">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">✅</div>
            <p className="font-medium text-[#4A4035] group-hover:text-white text-sm">Check-in</p>
          </Link>

          <Link to="/vitalis/meals" className="group bg-white hover:bg-[#7C8B6F] rounded-2xl p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl text-center border border-[#E8E2D9]">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🍽️</div>
            <p className="font-medium text-[#4A4035] group-hover:text-white text-sm">Refeições</p>
          </Link>

          <Link to="/vitalis/receitas" className="group bg-white hover:bg-[#7C8B6F] rounded-2xl p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl text-center border border-[#E8E2D9]">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🍳</div>
            <p className="font-medium text-[#4A4035] group-hover:text-white text-sm">Receitas</p>
          </Link>

          <Link to="/vitalis/espaco-retorno" className="group bg-white hover:bg-[#7C8B6F] rounded-2xl p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl text-center border border-[#E8E2D9]">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💜</div>
            <p className="font-medium text-[#4A4035] group-hover:text-white text-sm">Espaço Retorno</p>
          </Link>

          <Link to="/vitalis/relatorios" className="group bg-white hover:bg-[#7C8B6F] rounded-2xl p-4 shadow-lg transition-all hover:scale-105 hover:shadow-xl text-center border border-[#E8E2D9]">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</div>
            <p className="font-medium text-[#4A4035] group-hover:text-white text-sm">Relatórios</p>
          </Link>
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
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="6"/>
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#f3f4f6" strokeWidth="5"/>
                  <circle cx="50" cy="50" r="28" fill="none" stroke="#f3f4f6" strokeWidth="4"/>
                  
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad1)" strokeWidth="6" 
                          strokeDasharray="283" strokeDashoffset={283 - (283 * progressoRefeicoes / 100)} strokeLinecap="round"/>
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#0ea5e9" strokeWidth="5" 
                          strokeDasharray="226" strokeDashoffset={226 - (226 * progressoAgua / 100)} strokeLinecap="round"/>
                  <circle cx="50" cy="50" r="28" fill="none" stroke="#10b981" strokeWidth="4" 
                          strokeDasharray="176" strokeDashoffset={176 - (176 * (treinoHoje ? 100 : 0) / 100)} strokeLinecap="round"/>
                  
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7C8B6F"/>
                      <stop offset="100%" stopColor="#9CAF88"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">{progressoGeral}%</span>
                  <span className="text-xs text-gray-500">completo</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-[#F5F2ED] rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#7C8B6F] to-[#9CAF88] mx-auto mb-1"></div>
                  <p className="font-semibold text-[#4A4035]">{refeicoesConcluidas}/{totalRefeicoes}</p>
                  <p className="text-[#6B5C4C]">Refeições</p>
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
              <div className="p-3 bg-sky-50 rounded-xl mb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💧</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{aguaHoje.toFixed(1)} / {metaAgua}L</p>
                      <p className="text-xs text-gray-500">Água</p>
                    </div>
                  </div>
                </div>
                
                <div className="h-2 bg-sky-100 rounded-full mb-3 overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 rounded-full transition-all"
                    style={{ width: `${Math.min(progressoAgua, 100)}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  <button 
                    onClick={() => adicionarAgua(150)}
                    className="flex flex-col items-center p-2 bg-white hover:bg-sky-100 rounded-lg transition-colors shadow-sm"
                  >
                    <span className="text-lg">☕</span>
                    <span className="text-xs text-gray-600">150ml</span>
                  </button>
                  <button 
                    onClick={() => adicionarAgua(250)}
                    className="flex flex-col items-center p-2 bg-white hover:bg-sky-100 rounded-lg transition-colors shadow-sm"
                  >
                    <span className="text-lg">🥤</span>
                    <span className="text-xs text-gray-600">250ml</span>
                  </button>
                  <button 
                    onClick={() => adicionarAgua(330)}
                    className="flex flex-col items-center p-2 bg-white hover:bg-sky-100 rounded-lg transition-colors shadow-sm"
                  >
                    <span className="text-lg">🧃</span>
                    <span className="text-xs text-gray-600">330ml</span>
                  </button>
                  <button 
                    onClick={() => adicionarAgua(500)}
                    className="flex flex-col items-center p-2 bg-white hover:bg-sky-100 rounded-lg transition-colors shadow-sm"
                  >
                    <span className="text-lg">🍶</span>
                    <span className="text-xs text-gray-600">500ml</span>
                  </button>
                </div>
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
                      {treinoHoje ? `Feito às ${treinoHoje.hora || treinoHoje.created_at?.substring(11, 16) || '—'}` : (ehDiaTreino ? 'Por fazer' : 'Recupera bem!')}
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

              {/* Sono - INTERACTIVO */}
              <div className="p-3 bg-indigo-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">😴</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {sonoHoje ? `${Math.floor(sonoHoje.duracao_min / 60)}h ${sonoHoje.duracao_min % 60}m` : 'Sono esta noite'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sonoHoje ? `Qualidade: ${sonoHoje.qualidade_1a5}/5 ★` : 'Por registar'}
                      </p>
                    </div>
                  </div>
                  {sonoHoje ? (
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={i <= sonoHoje.qualidade_1a5 ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                  ) : (
                    <button 
                      onClick={() => setMostrarSonoForm(!mostrarSonoForm)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {mostrarSonoForm ? 'Fechar' : 'Registar →'}
                    </button>
                  )}
                </div>
                
                {mostrarSonoForm && !sonoHoje && (
                  <div className="mt-3 pt-3 border-t border-indigo-100 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Horas</label>
                        <input
                          type="number"
                          min="0"
                          max="12"
                          value={sonoHoras}
                          onChange={(e) => setSonoHoras(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-center text-lg font-bold focus:border-indigo-500 focus:outline-none"
                          placeholder="7"
                        />
                      </div>
                      <span className="text-xl text-gray-400 mt-5">:</span>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Min</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          step="15"
                          value={sonoMinutos}
                          onChange={(e) => setSonoMinutos(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-center text-lg font-bold focus:border-indigo-500 focus:outline-none"
                          placeholder="30"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Qualidade</label>
                      <div className="flex justify-between gap-1">
                        {[1, 2, 3, 4, 5].map((valor) => (
                          <button
                            key={valor}
                            onClick={() => setSonoQualidade(valor)}
                            className={`flex-1 py-2 rounded-lg text-lg transition-all ${
                              sonoQualidade >= valor
                                ? 'bg-yellow-100 scale-105'
                                : 'bg-gray-100 opacity-50'
                            }`}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={registarSono}
                      className="w-full py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors"
                    >
                      ✓ Guardar Sono
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna Central */}
          <div className="col-span-12 md:col-span-5 space-y-4 flex flex-col">
            
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
                
                <div className="flex gap-2 mt-3">
                  {!jejumActual ? (
                    <button 
                      onClick={iniciarJejum}
                      className="flex-1 px-4 py-2 bg-white text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors"
                    >
                      Iniciar Jejum
                    </button>
                  ) : (
                    <>
                      <button className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors">
                        Pausar
                      </button>
                      <button 
                        onClick={terminarJejum}
                        className="flex-1 px-4 py-2 bg-white text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors"
                      >
                        Terminar Jejum
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Refeições do Dia */}
            <div className="bg-white rounded-3xl shadow-xl p-5 flex-grow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-[#6B5C4C] uppercase tracking-wider">Refeições Hoje</h3>
                <Link to="/vitalis/refeicoes-config" className="text-xs text-[#7C8B6F] hover:text-[#6B7A5D] font-medium">
                  Configurar →
                </Link>
              </div>
              
              {refeicoes.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-3">Ainda não configuraste as tuas refeições</p>
                  <Link 
                    to="/vitalis/refeicoes-config"
                    className="inline-block px-4 py-2 bg-[#7C8B6F] text-white rounded-lg text-sm font-medium hover:bg-[#6B7A5D] transition-colors"
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
                            className="px-3 py-1.5 bg-[#7C8B6F] text-white text-xs rounded-full font-medium hover:bg-[#6B7A5D] transition-colors shadow-md"
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
                <div className="h-2 bg-[#F5F2ED] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#9CAF88] to-[#7C8B6F] rounded-full transition-all"
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
                      dia.status === 'verde' ? 'bg-[#7C8B6F] text-white' :
                      dia.status === 'amarelo' ? 'bg-[#9CAF88] text-white' :
                      dia.status === 'vermelho' ? 'bg-[#C4A484] text-white' :
                      dia.ehHoje ? 'bg-[#7C8B6F] text-white ring-2 ring-[#9CAF88] ring-offset-2' :
                      'bg-[#F5F2ED] text-[#6B5C4C]'
                    }`}
                  >
                    {dia.dia}
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-[#E8E2D9] flex items-center justify-between">
                <span className="text-xs text-[#6B5C4C]">Aderência</span>
                <span className="text-sm font-bold text-[#7C8B6F]">
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

            <div className="col-span-3">
              <div className="bg-gradient-to-r from-[#E8E4DC] via-[#F5F2ED] to-[#FAF7F2] rounded-2xl p-4 border border-[#E8E2D9]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌿</span>
                    <span className="text-sm font-medium text-[#4A4035]">Calorias</span>
                  </div>
                  <span className="text-xs text-[#6B5C4C]">Meta: {caloriasAlvo} kcal</span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-bold text-[#4A4035]">{caloriasConsumidas}</span>
                  <span className="text-[#6B5C4C] mb-1">/ {caloriasAlvo} kcal</span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-[#9CAF88] via-[#7C8B6F] to-[#6B7A5D] rounded-full transition-all"
                    style={{ width: `${Math.min(progressoCalorias, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-[#6B5C4C] mt-2 text-center">
                  Restam {Math.max(caloriasAlvo - caloriasConsumidas, 0)} kcal para hoje
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Funcionalidades Premium - NOVAS */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-lg">Funcionalidades Premium</h3>
              <p className="text-white/70 text-sm">Explora todas as ferramentas</p>
            </div>
            <span className="text-3xl">✨</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {/* Chat Coach */}
            <Link to="/vitalis/chat" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💬</div>
              <p className="font-semibold text-white text-sm">Chat Coach</p>
              <p className="text-white/70 text-xs mt-1">Fala com a coach</p>
            </Link>

            {/* Desafios */}
            <Link to="/vitalis/desafios" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎯</div>
              <p className="font-semibold text-white text-sm">Desafios</p>
              <p className="text-white/70 text-xs mt-1">Desafios semanais</p>
            </Link>

            {/* Lista de Compras */}
            <Link to="/vitalis/lista-compras" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🛒</div>
              <p className="font-semibold text-white text-sm">Compras</p>
              <p className="text-white/70 text-xs mt-1">Lista automática</p>
            </Link>

            {/* Sugestões */}
            <Link to="/vitalis/sugestoes" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💡</div>
              <p className="font-semibold text-white text-sm">Sugestões</p>
              <p className="text-white/70 text-xs mt-1">O que comer</p>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {/* Calendário de Refeições */}
            <Link to="/vitalis/calendario" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📅</div>
              <p className="font-semibold text-white text-sm">Calendário</p>
              <p className="text-white/70 text-xs mt-1">Planear semana</p>
            </Link>

            {/* Guia do Utilizador */}
            <Link to="/vitalis/guia" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📖</div>
              <p className="font-semibold text-white text-sm">Guia</p>
              <p className="text-white/70 text-xs mt-1">Manual da app</p>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Fotos Progresso */}
            <Link to="/vitalis/fotos-progresso" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📸</div>
              <p className="font-semibold text-white text-sm">Fotos</p>
              <p className="text-white/70 text-xs mt-1">Antes e depois</p>
            </Link>

            {/* Gráficos de Tendência */}
            <Link to="/vitalis/tendencias" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📈</div>
              <p className="font-semibold text-white text-sm">Tendências</p>
              <p className="text-white/70 text-xs mt-1">Peso, água, sono</p>
            </Link>

            {/* Conquistas/Gamificação */}
            <button
              onClick={() => {
                const el = document.getElementById('conquistas-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏆</div>
              <p className="font-semibold text-white text-sm">Conquistas</p>
              <p className="text-white/70 text-xs mt-1">{conquistasDesbloqueadas.length} badges</p>
            </button>

            {/* Notificações */}
            <Link to="/vitalis/notificacoes" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔔</div>
              <p className="font-semibold text-white text-sm">Lembretes</p>
              <p className="text-white/70 text-xs mt-1">Configurar alertas</p>
            </Link>
          </div>
        </div>

        {/* Secção de Conquistas */}
        <div id="conquistas-section" className="bg-white rounded-3xl shadow-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                🏆 Minhas Conquistas
              </h3>
              <p className="text-sm text-gray-500">Nível {Math.floor(xpTotal / 500) + 1} • {xpTotal} XP total</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#7C8B6F]">{conquistasDesbloqueadas.length}</p>
              <p className="text-xs text-gray-500">conquistas</p>
            </div>
          </div>

          {/* Barra de progresso para próximo nível */}
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Próximo nível</span>
              <span className="font-semibold text-amber-600">{500 - (xpTotal % 500)} XP restantes</span>
            </div>
            <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all"
                style={{ width: `${(xpTotal % 500) / 500 * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Lista de conquistas */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {Object.entries(CONQUISTAS).slice(0, 8).map(([id, conquista]) => {
              const desbloqueada = conquistasDesbloqueadas.includes(id);
              return (
                <div
                  key={id}
                  className={`relative p-3 rounded-xl text-center transition-all ${
                    desbloqueada
                      ? 'bg-gradient-to-br from-yellow-100 to-amber-100 shadow-md'
                      : 'bg-gray-100 opacity-50'
                  }`}
                  title={conquista.nome}
                >
                  <span className={`text-2xl ${desbloqueada ? '' : 'grayscale'}`}>
                    {conquista.icone}
                  </span>
                  <p className="text-xs mt-1 font-medium text-gray-700 truncate">{conquista.nome?.split(' ')[0]}</p>
                  {desbloqueada && (
                    <span className="absolute -top-1 -right-1 text-xs">✨</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Modal de Celebração de Conquistas */}
      <CelebracaoModal
        conquista={conquistaActual}
        show={showCelebracao}
        onClose={() => {
          setShowCelebracao(false);
          setConquistaActual(null);
        }}
      />

      {/* Onboarding para novos utilizadores */}
      {mostrarOnboarding && (
        <OnboardingWrapper onComplete={completarOnboarding} />
      )}
    </div>
  );
}
