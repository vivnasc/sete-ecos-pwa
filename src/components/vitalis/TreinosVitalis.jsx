import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// Fases do ciclo menstrual e recomendações
const FASES_CICLO = {
  menstrual: {
    nome: 'Menstrual',
    dias: '1-5',
    icon: '🌙',
    cor: 'from-red-400 to-pink-500',
    energia: 'Baixa',
    recomendacao: 'Treinos leves, yoga, caminhadas. O corpo está a renovar-se.',
    evitar: 'Treinos intensos, HIIT, levantamento pesado',
    intensidade: 30,
    treinos: ['yoga', 'caminhada', 'alongamentos', 'pilates_leve']
  },
  folicular: {
    nome: 'Folicular',
    dias: '6-14',
    icon: '🌸',
    cor: 'from-pink-400 to-purple-500',
    energia: 'Crescente',
    recomendacao: 'Energia a aumentar! Ideal para novos desafios e treinos progressivos.',
    evitar: 'Nada específico - fase óptima para treino',
    intensidade: 70,
    treinos: ['forca', 'hiit', 'cardio', 'funcional']
  },
  ovulacao: {
    nome: 'Ovulação',
    dias: '14-17',
    icon: '☀️',
    cor: 'from-yellow-400 to-orange-500',
    energia: 'Máxima',
    recomendacao: 'Pico de energia e força! Aproveita para treinos intensos e PRs.',
    evitar: 'Cuidado com lesões - mais flexibilidade pode causar instabilidade',
    intensidade: 100,
    treinos: ['forca_maxima', 'hiit', 'crossfit', 'sprint']
  },
  lutea: {
    nome: 'Lútea',
    dias: '18-28',
    icon: '🍂',
    cor: 'from-amber-400 to-red-400',
    energia: 'Decrescente',
    recomendacao: 'Foco em treinos moderados e recuperação. Evita frustração com performance.',
    evitar: 'Treinos muito longos, expectativas altas de performance',
    intensidade: 50,
    treinos: ['forca_moderada', 'cardio_leve', 'yoga', 'natacao']
  }
};

// Fases do programa Vitalis
const FASES_PROGRAMA = {
  inducao: {
    nome: 'Indução',
    semanas: '1-2',
    foco: 'Equilíbrio hormonal e ajustes metabólicos',
    treino: 'Evitar treinos intensos. Foco em movimento suave e recuperação.',
    icon: '🌱',
    cor: 'from-green-400 to-teal-500',
    permitido: ['caminhada', 'yoga', 'alongamentos', 'respiracao'],
    evitar: ['hiit', 'forca_pesada', 'cardio_intenso']
  },
  transicao: {
    nome: 'Transição',
    semanas: '3-4',
    foco: 'Introdução gradual de exercício',
    treino: 'Começar treino de força leve. Cardio moderado.',
    icon: '🌿',
    cor: 'from-teal-400 to-cyan-500',
    permitido: ['forca_leve', 'cardio_moderado', 'funcional', 'pilates'],
    evitar: ['hiit_intenso', 'treinos_longos']
  },
  construcao: {
    nome: 'Construção',
    semanas: '5-8',
    foco: 'Construção muscular e condicionamento',
    treino: 'Treino de força recomendado! 3-4x por semana ideal.',
    icon: '💪',
    cor: 'from-purple-400 to-pink-500',
    permitido: ['forca', 'hiit', 'cardio', 'funcional', 'crossfit'],
    evitar: []
  },
  manutencao: {
    nome: 'Manutenção',
    semanas: '9+',
    foco: 'Manter ganhos e optimizar composição corporal',
    treino: 'Liberdade total! Segue os teus objectivos.',
    icon: '⭐',
    cor: 'from-amber-400 to-orange-500',
    permitido: ['todos'],
    evitar: []
  }
};

// Biblioteca de exercícios
const EXERCICIOS = {
  // FORÇA - CASA
  agachamento_corpo: {
    nome: 'Agachamento',
    tipo: 'forca',
    local: 'casa',
    musculos: ['Glúteos', 'Quadríceps', 'Core'],
    calorias: 8, // por minuto
    instrucoes: 'Pés à largura dos ombros, desce como se fosses sentar, mantém joelhos alinhados.',
    series: '3x15',
    icon: '🦵'
  },
  lunges: {
    nome: 'Lunges/Afundos',
    tipo: 'forca',
    local: 'casa',
    musculos: ['Glúteos', 'Quadríceps', 'Equilíbrio'],
    calorias: 7,
    instrucoes: 'Passo à frente, joelho a 90°, volta à posição inicial. Alterna pernas.',
    series: '3x12 cada',
    icon: '🚶‍♀️'
  },
  ponte_gluteos: {
    nome: 'Ponte de Glúteos',
    tipo: 'forca',
    local: 'casa',
    musculos: ['Glúteos', 'Lombar', 'Core'],
    calorias: 5,
    instrucoes: 'Deitada, joelhos dobrados, eleva a anca contraindo glúteos.',
    series: '3x20',
    icon: '🌉'
  },
  prancha: {
    nome: 'Prancha',
    tipo: 'forca',
    local: 'casa',
    musculos: ['Core', 'Ombros', 'Costas'],
    calorias: 4,
    instrucoes: 'Apoio nos antebraços, corpo em linha recta, mantém a posição.',
    series: '3x30-60s',
    icon: '📏'
  },
  flexoes_joelhos: {
    nome: 'Flexões (joelhos)',
    tipo: 'forca',
    local: 'casa',
    musculos: ['Peito', 'Tríceps', 'Ombros'],
    calorias: 6,
    instrucoes: 'Joelhos no chão, mãos à largura dos ombros, desce o peito ao chão.',
    series: '3x10',
    icon: '💪'
  },
  superman: {
    nome: 'Superman',
    tipo: 'forca',
    local: 'casa',
    musculos: ['Lombar', 'Glúteos', 'Ombros'],
    calorias: 4,
    instrucoes: 'Deitada de barriga para baixo, eleva braços e pernas simultaneamente.',
    series: '3x15',
    icon: '🦸‍♀️'
  },
  // FORÇA - GINÁSIO
  agachamento_barra: {
    nome: 'Agachamento com Barra',
    tipo: 'forca',
    local: 'ginasio',
    musculos: ['Glúteos', 'Quadríceps', 'Core', 'Costas'],
    calorias: 10,
    instrucoes: 'Barra nos trapézios, desce controladamente, volta à posição.',
    series: '4x8-12',
    icon: '🏋️‍♀️'
  },
  leg_press: {
    nome: 'Leg Press',
    tipo: 'forca',
    local: 'ginasio',
    musculos: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
    calorias: 8,
    instrucoes: 'Pés na plataforma, empurra controladamente, não bloqueia joelhos.',
    series: '4x12',
    icon: '🦿'
  },
  hip_thrust: {
    nome: 'Hip Thrust',
    tipo: 'forca',
    local: 'ginasio',
    musculos: ['Glúteos', 'Isquiotibiais', 'Core'],
    calorias: 7,
    instrucoes: 'Costas no banco, barra na anca, eleva contraindo glúteos.',
    series: '4x12',
    icon: '🍑'
  },
  deadlift: {
    nome: 'Peso Morto',
    tipo: 'forca',
    local: 'ginasio',
    musculos: ['Posterior', 'Glúteos', 'Core', 'Costas'],
    calorias: 12,
    instrucoes: 'Barra junto às pernas, costas neutras, eleva com força das pernas.',
    series: '4x8',
    icon: '⬆️'
  },
  pulldown: {
    nome: 'Lat Pulldown',
    tipo: 'forca',
    local: 'ginasio',
    musculos: ['Costas', 'Bíceps', 'Ombros'],
    calorias: 6,
    instrucoes: 'Puxa a barra ao peito, controla o regresso.',
    series: '3x12',
    icon: '🔽'
  },
  chest_press: {
    nome: 'Chest Press',
    tipo: 'forca',
    local: 'ginasio',
    musculos: ['Peito', 'Tríceps', 'Ombros'],
    calorias: 7,
    instrucoes: 'Empurra os pesos para cima, controla a descida.',
    series: '3x12',
    icon: '💪'
  },
  // CARDIO
  caminhada: {
    nome: 'Caminhada',
    tipo: 'cardio',
    local: 'ambos',
    musculos: ['Pernas', 'Core', 'Sistema cardiovascular'],
    calorias: 4,
    instrucoes: 'Ritmo moderado, 5000-10000 passos diários ideal.',
    series: '30-60 min',
    icon: '🚶‍♀️',
    intensidade: 'leve'
  },
  corrida_leve: {
    nome: 'Corrida Leve',
    tipo: 'cardio',
    local: 'ambos',
    musculos: ['Pernas', 'Core', 'Cardio'],
    calorias: 10,
    instrucoes: 'Ritmo confortável onde consegues conversar.',
    series: '20-40 min',
    icon: '🏃‍♀️',
    intensidade: 'moderada'
  },
  hiit: {
    nome: 'HIIT',
    tipo: 'cardio',
    local: 'ambos',
    musculos: ['Corpo inteiro', 'Cardio', 'Metabolismo'],
    calorias: 15,
    instrucoes: '30s intenso + 30s descanso. Repetir 8-12x.',
    series: '15-25 min',
    icon: '🔥',
    intensidade: 'alta'
  },
  bicicleta: {
    nome: 'Bicicleta',
    tipo: 'cardio',
    local: 'ginasio',
    musculos: ['Quadríceps', 'Glúteos', 'Cardio'],
    calorias: 8,
    instrucoes: 'Resistência moderada, cadência 60-90 RPM.',
    series: '30-45 min',
    icon: '🚴‍♀️',
    intensidade: 'moderada'
  },
  eliptica: {
    nome: 'Elíptica',
    tipo: 'cardio',
    local: 'ginasio',
    musculos: ['Corpo inteiro', 'Cardio'],
    calorias: 9,
    instrucoes: 'Baixo impacto, ideal para proteger articulações.',
    series: '30-45 min',
    icon: '🎿',
    intensidade: 'moderada'
  },
  natacao: {
    nome: 'Natação',
    tipo: 'cardio',
    local: 'ginasio',
    musculos: ['Corpo inteiro', 'Cardio', 'Flexibilidade'],
    calorias: 11,
    instrucoes: 'Excelente para ciclo menstrual - baixo impacto.',
    series: '30-45 min',
    icon: '🏊‍♀️',
    intensidade: 'moderada'
  },
  // FLEXIBILIDADE/RECUPERAÇÃO
  yoga: {
    nome: 'Yoga',
    tipo: 'flexibilidade',
    local: 'casa',
    musculos: ['Flexibilidade', 'Core', 'Mente'],
    calorias: 3,
    instrucoes: 'Foco na respiração e alongamento. Ideal para fase menstrual.',
    series: '30-60 min',
    icon: '🧘‍♀️'
  },
  pilates: {
    nome: 'Pilates',
    tipo: 'flexibilidade',
    local: 'ambos',
    musculos: ['Core', 'Postura', 'Flexibilidade'],
    calorias: 4,
    instrucoes: 'Controlo e precisão de movimentos. Fortalece core profundo.',
    series: '45-60 min',
    icon: '🤸‍♀️'
  },
  alongamentos: {
    nome: 'Alongamentos',
    tipo: 'flexibilidade',
    local: 'casa',
    musculos: ['Flexibilidade', 'Recuperação'],
    calorias: 2,
    instrucoes: 'Mantém cada posição 30s. Não force.',
    series: '15-20 min',
    icon: '🙆‍♀️'
  }
};

// Planos de treino por objectivo
const PLANOS_TREINO = {
  perda_gordura: {
    nome: 'Perda de Gordura',
    descricao: 'Foco em queima calórica com preservação muscular',
    icon: '🔥',
    cor: 'from-orange-500 to-red-500',
    dias: 4,
    estrutura: [
      { dia: 'Segunda', tipo: 'Força - Inferior', exercicios: ['agachamento_barra', 'leg_press', 'hip_thrust', 'lunges'] },
      { dia: 'Terça', tipo: 'Cardio HIIT', exercicios: ['hiit'] },
      { dia: 'Quarta', tipo: 'Força - Superior', exercicios: ['chest_press', 'pulldown', 'flexoes_joelhos', 'prancha'] },
      { dia: 'Quinta', tipo: 'Descanso activo', exercicios: ['caminhada', 'alongamentos'] },
      { dia: 'Sexta', tipo: 'Full Body + Cardio', exercicios: ['agachamento_corpo', 'ponte_gluteos', 'superman', 'corrida_leve'] },
      { dia: 'Sábado', tipo: 'Descanso ou yoga', exercicios: ['yoga'] },
      { dia: 'Domingo', tipo: 'Descanso', exercicios: [] }
    ]
  },
  ganho_muscular: {
    nome: 'Ganho Muscular',
    descricao: 'Foco em hipertrofia e força',
    icon: '💪',
    cor: 'from-purple-500 to-pink-500',
    dias: 5,
    estrutura: [
      { dia: 'Segunda', tipo: 'Glúteos & Pernas', exercicios: ['agachamento_barra', 'hip_thrust', 'leg_press', 'lunges'] },
      { dia: 'Terça', tipo: 'Costas & Bíceps', exercicios: ['pulldown', 'deadlift'] },
      { dia: 'Quarta', tipo: 'Descanso activo', exercicios: ['caminhada', 'alongamentos'] },
      { dia: 'Quinta', tipo: 'Peito & Tríceps', exercicios: ['chest_press', 'flexoes_joelhos', 'prancha'] },
      { dia: 'Sexta', tipo: 'Glúteos & Pernas', exercicios: ['hip_thrust', 'ponte_gluteos', 'agachamento_corpo'] },
      { dia: 'Sábado', tipo: 'Cardio leve', exercicios: ['caminhada', 'yoga'] },
      { dia: 'Domingo', tipo: 'Descanso', exercicios: [] }
    ]
  },
  manutencao: {
    nome: 'Manutenção',
    descricao: 'Manter forma física e saúde geral',
    icon: '⚖️',
    cor: 'from-teal-500 to-cyan-500',
    dias: 3,
    estrutura: [
      { dia: 'Segunda', tipo: 'Full Body', exercicios: ['agachamento_corpo', 'ponte_gluteos', 'prancha', 'flexoes_joelhos'] },
      { dia: 'Terça', tipo: 'Descanso', exercicios: [] },
      { dia: 'Quarta', tipo: 'Cardio', exercicios: ['corrida_leve', 'alongamentos'] },
      { dia: 'Quinta', tipo: 'Descanso', exercicios: [] },
      { dia: 'Sexta', tipo: 'Full Body', exercicios: ['lunges', 'superman', 'prancha', 'ponte_gluteos'] },
      { dia: 'Sábado', tipo: 'Actividade livre', exercicios: ['caminhada', 'yoga'] },
      { dia: 'Domingo', tipo: 'Descanso', exercicios: [] }
    ]
  },
  iniciante: {
    nome: 'Iniciante',
    descricao: 'Introdução suave ao exercício',
    icon: '🌱',
    cor: 'from-green-500 to-teal-500',
    dias: 3,
    estrutura: [
      { dia: 'Segunda', tipo: 'Corpo Inteiro Leve', exercicios: ['agachamento_corpo', 'ponte_gluteos', 'prancha'] },
      { dia: 'Terça', tipo: 'Descanso', exercicios: [] },
      { dia: 'Quarta', tipo: 'Caminhada + Alongamentos', exercicios: ['caminhada', 'alongamentos'] },
      { dia: 'Quinta', tipo: 'Descanso', exercicios: [] },
      { dia: 'Sexta', tipo: 'Corpo Inteiro Leve', exercicios: ['lunges', 'superman', 'flexoes_joelhos'] },
      { dia: 'Sábado', tipo: 'Yoga ou caminhada', exercicios: ['yoga', 'caminhada'] },
      { dia: 'Domingo', tipo: 'Descanso', exercicios: [] }
    ]
  }
};

export default function TreinosVitalis() {
  const [user, setUser] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados do componente
  const [localTreino, setLocalTreino] = useState('casa'); // casa ou ginasio
  const [faseCiclo, setFaseCiclo] = useState('folicular');
  const [fasePrograma, setFasePrograma] = useState('construcao');
  const [objectivoSelecionado, setObjectivoSelecionado] = useState(null);
  const [exercicioExpandido, setExercicioExpandido] = useState(null);
  const [tabActiva, setTabActiva] = useState('ciclo'); // ciclo, planos, exercicios
  const [calculadoraAberta, setCalculadoraAberta] = useState(false);
  const [tempoTreino, setTempoTreino] = useState(30);
  const [pesoUsuario, setPesoUsuario] = useState(65);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Carregar dados do cliente Vitalis
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();

        if (userData) {
          const { data: clientData } = await supabase
            .from('vitalis_clients')
            .select('*')
            .eq('user_id', userData.id)
            .single();

          if (clientData) {
            setClientData(clientData);
            // Determinar fase do programa baseado em semanas desde início
            const semanas = Math.floor((Date.now() - new Date(clientData.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000));
            if (semanas < 2) setFasePrograma('inducao');
            else if (semanas < 4) setFasePrograma('transicao');
            else if (semanas < 8) setFasePrograma('construcao');
            else setFasePrograma('manutencao');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularCalorias = (exercicio, minutos, peso) => {
    // MET aproximado baseado nas calorias/minuto
    const caloriasPorMinuto = exercicio.calorias * (peso / 65);
    return Math.round(caloriasPorMinuto * minutos);
  };

  const getFaseActual = () => FASES_CICLO[faseCiclo];
  const getProgramaActual = () => FASES_PROGRAMA[fasePrograma];

  const getExerciciosFiltrados = () => {
    return Object.entries(EXERCICIOS).filter(([key, ex]) => {
      if (localTreino === 'casa') return ex.local === 'casa' || ex.local === 'ambos';
      if (localTreino === 'ginasio') return ex.local === 'ginasio' || ex.local === 'ambos';
      return true;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">A carregar...</div>
      </div>
    );
  }

  const faseActual = getFaseActual();
  const programaActual = getProgramaActual();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/vitalis/dashboard" className="text-white/60 hover:text-white transition-colors">
              ← Voltar
            </Link>
            <h1 className="text-xl font-bold text-white">Treinos</h1>
            <button
              onClick={() => setCalculadoraAberta(true)}
              className="text-2xl"
              title="Calculadora de calorias"
            >
              🔢
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Fase do Programa - Alerta se em Indução */}
        <div className={`p-4 rounded-2xl bg-gradient-to-r ${programaActual.cor} shadow-lg`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{programaActual.icon}</span>
            <div className="flex-1">
              <h3 className="font-bold text-white">Fase: {programaActual.nome}</h3>
              <p className="text-white/80 text-sm">{programaActual.foco}</p>
            </div>
          </div>
          <p className="mt-3 text-white/90 text-sm bg-black/20 rounded-xl p-3">
            {programaActual.treino}
          </p>
          {fasePrograma === 'inducao' && (
            <div className="mt-3 p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
              <p className="text-yellow-200 text-sm font-medium">
                ⚠️ Na fase de indução, o foco é equilíbrio hormonal. Evita treinos intensos por enquanto.
              </p>
            </div>
          )}
        </div>

        {/* Toggle Casa/Ginásio */}
        <div className="flex gap-2 p-1 bg-white/10 rounded-xl">
          <button
            onClick={() => setLocalTreino('casa')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              localTreino === 'casa'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            🏠 Em Casa
          </button>
          <button
            onClick={() => setLocalTreino('ginasio')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              localTreino === 'ginasio'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            🏋️ Ginásio
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl overflow-x-auto">
          {[
            { id: 'ciclo', label: 'Ciclo', icon: '🌙' },
            { id: 'planos', label: 'Planos', icon: '📋' },
            { id: 'exercicios', label: 'Exercícios', icon: '💪' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                tabActiva === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: Ciclo Menstrual */}
        {tabActiva === 'ciclo' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-white mb-1">Treino Sincronizado com o Ciclo</h2>
              <p className="text-white/60 text-sm">Selecciona a fase actual do teu ciclo</p>
            </div>

            {/* Selector de fase */}
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(FASES_CICLO).map(([key, fase]) => (
                <button
                  key={key}
                  onClick={() => setFaseCiclo(key)}
                  className={`p-4 rounded-2xl border transition-all ${
                    faseCiclo === key
                      ? `bg-gradient-to-r ${fase.cor} border-white/30 shadow-lg`
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl block mb-1">{fase.icon}</span>
                  <span className={`font-medium ${faseCiclo === key ? 'text-white' : 'text-white/70'}`}>
                    {fase.nome}
                  </span>
                  <span className={`block text-xs ${faseCiclo === key ? 'text-white/80' : 'text-white/40'}`}>
                    Dias {fase.dias}
                  </span>
                </button>
              ))}
            </div>

            {/* Info da fase actual */}
            <div className={`p-5 rounded-2xl bg-gradient-to-br ${faseActual.cor} shadow-xl`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{faseActual.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-white">{faseActual.nome}</h3>
                  <p className="text-white/80">Dias {faseActual.dias}</p>
                </div>
              </div>

              {/* Barra de energia */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-white/80 mb-1">
                  <span>Nível de Energia</span>
                  <span>{faseActual.energia}</span>
                </div>
                <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/90 rounded-full transition-all"
                    style={{ width: `${faseActual.intensidade}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white/20 rounded-xl p-3">
                  <p className="text-white/90 text-sm font-medium mb-1">✅ Recomendado</p>
                  <p className="text-white text-sm">{faseActual.recomendacao}</p>
                </div>
                <div className="bg-black/20 rounded-xl p-3">
                  <p className="text-white/70 text-sm font-medium mb-1">⚠️ Evitar</p>
                  <p className="text-white/80 text-sm">{faseActual.evitar}</p>
                </div>
              </div>
            </div>

            {/* Treinos recomendados para a fase */}
            <div>
              <h3 className="font-bold text-white mb-3">Treinos para esta fase:</h3>
              <div className="grid grid-cols-2 gap-3">
                {faseActual.treinos.map(treino => {
                  const exercicio = Object.values(EXERCICIOS).find(e =>
                    e.nome.toLowerCase().includes(treino.replace('_', ' ')) ||
                    treino.includes(e.tipo)
                  );
                  return (
                    <div
                      key={treino}
                      className="p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <span className="text-xl">{exercicio?.icon || '🏃‍♀️'}</span>
                      <p className="text-white/80 text-sm capitalize mt-1">
                        {treino.replace('_', ' ')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dica científica */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <p className="text-blue-300 text-sm font-medium mb-2">📚 Base Científica</p>
              <p className="text-white/80 text-sm">
                O ciclo menstrual afecta os níveis de estrogénio e progesterona, que influenciam força, recuperação e energia.
                Treinar em sintonia com o ciclo optimiza resultados e reduz risco de lesões.
              </p>
            </div>
          </div>
        )}

        {/* TAB: Planos de Treino */}
        {tabActiva === 'planos' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-white mb-1">Planos de Treino</h2>
              <p className="text-white/60 text-sm">Escolhe o teu objectivo</p>
            </div>

            {/* Lista de objectivos */}
            {!objectivoSelecionado ? (
              <div className="space-y-3">
                {Object.entries(PLANOS_TREINO).map(([key, plano]) => (
                  <button
                    key={key}
                    onClick={() => setObjectivoSelecionado(key)}
                    disabled={fasePrograma === 'inducao' && key !== 'iniciante'}
                    className={`w-full p-4 rounded-2xl border transition-all text-left ${
                      fasePrograma === 'inducao' && key !== 'iniciante'
                        ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${plano.cor} flex items-center justify-center text-2xl shadow-lg`}>
                        {plano.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{plano.nome}</h3>
                        <p className="text-white/60 text-sm">{plano.descricao}</p>
                        <p className="text-white/40 text-xs mt-1">{plano.dias} dias/semana</p>
                      </div>
                      <span className="text-white/40">→</span>
                    </div>
                    {fasePrograma === 'inducao' && key !== 'iniciante' && (
                      <p className="text-yellow-400/70 text-xs mt-2">
                        🔒 Disponível após fase de indução
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              /* Plano selecionado */
              <div className="space-y-4">
                <button
                  onClick={() => setObjectivoSelecionado(null)}
                  className="text-white/60 hover:text-white text-sm"
                >
                  ← Voltar aos planos
                </button>

                {(() => {
                  const plano = PLANOS_TREINO[objectivoSelecionado];
                  return (
                    <>
                      <div className={`p-5 rounded-2xl bg-gradient-to-r ${plano.cor} shadow-xl`}>
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{plano.icon}</span>
                          <div>
                            <h2 className="text-2xl font-bold text-white">{plano.nome}</h2>
                            <p className="text-white/80">{plano.dias} treinos/semana</p>
                          </div>
                        </div>
                      </div>

                      {/* Semana de treino */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-white">Semana Tipo:</h3>
                        {plano.estrutura.map((dia, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl ${
                              dia.exercicios.length > 0
                                ? 'bg-white/10 border border-white/10'
                                : 'bg-white/5 border border-white/5'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium text-white">{dia.dia}</span>
                                <span className="text-white/60 text-sm ml-2">• {dia.tipo}</span>
                              </div>
                              {dia.exercicios.length > 0 && (
                                <span className="text-xs bg-white/10 px-2 py-1 rounded-lg text-white/60">
                                  {dia.exercicios.length} exercícios
                                </span>
                              )}
                            </div>
                            {dia.exercicios.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {dia.exercicios.map(exId => {
                                  const ex = EXERCICIOS[exId];
                                  return ex ? (
                                    <span
                                      key={exId}
                                      className="text-xs bg-white/10 px-2 py-1 rounded-lg text-white/70"
                                    >
                                      {ex.icon} {ex.nome}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* TAB: Biblioteca de Exercícios */}
        {tabActiva === 'exercicios' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-white mb-1">Biblioteca de Exercícios</h2>
              <p className="text-white/60 text-sm">
                {localTreino === 'casa' ? 'Exercícios para fazer em casa' : 'Exercícios para o ginásio'}
              </p>
            </div>

            {/* Filtros por tipo */}
            <div className="space-y-4">
              {['forca', 'cardio', 'flexibilidade'].map(tipo => {
                const exerciciosDoTipo = getExerciciosFiltrados().filter(([, ex]) => ex.tipo === tipo);
                if (exerciciosDoTipo.length === 0) return null;

                return (
                  <div key={tipo}>
                    <h3 className="font-bold text-white mb-2 capitalize flex items-center gap-2">
                      {tipo === 'forca' && '💪'}
                      {tipo === 'cardio' && '❤️'}
                      {tipo === 'flexibilidade' && '🧘‍♀️'}
                      {tipo === 'forca' ? 'Força' : tipo === 'flexibilidade' ? 'Flexibilidade' : 'Cardio'}
                      <span className="text-white/40 text-sm font-normal">({exerciciosDoTipo.length})</span>
                    </h3>
                    <div className="space-y-2">
                      {exerciciosDoTipo.map(([key, exercicio]) => (
                        <div key={key}>
                          <button
                            onClick={() => setExercicioExpandido(exercicioExpandido === key ? null : key)}
                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{exercicio.icon}</span>
                              <div className="flex-1">
                                <p className="font-medium text-white">{exercicio.nome}</p>
                                <p className="text-white/50 text-sm">{exercicio.musculos.join(' • ')}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white/60 text-sm">{exercicio.series}</p>
                                <p className="text-green-400/70 text-xs">~{exercicio.calorias} cal/min</p>
                              </div>
                              <span className="text-white/40">
                                {exercicioExpandido === key ? '▼' : '▶'}
                              </span>
                            </div>
                          </button>
                          {exercicioExpandido === key && (
                            <div className="mt-2 p-4 rounded-xl bg-white/10 border border-white/20">
                              <p className="text-white/80 text-sm mb-3">{exercicio.instrucoes}</p>
                              <div className="flex flex-wrap gap-2">
                                {exercicio.musculos.map(musculo => (
                                  <span
                                    key={musculo}
                                    className="text-xs bg-purple-500/30 px-2 py-1 rounded-full text-purple-300"
                                  >
                                    {musculo}
                                  </span>
                                ))}
                              </div>
                              {tipo === 'cardio' && exercicio.intensidade && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <p className="text-white/60 text-sm">
                                    Intensidade: <span className="text-white capitalize">{exercicio.intensidade}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Modal Calculadora de Calorias */}
      {calculadoraAberta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">🔢 Calculadora de Calorias</h2>
                <button
                  onClick={() => setCalculadoraAberta(false)}
                  className="text-white/60 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Peso */}
              <div>
                <label className="block text-white/60 text-sm mb-2">Teu peso (kg)</label>
                <input
                  type="number"
                  value={pesoUsuario}
                  onChange={(e) => setPesoUsuario(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white text-center text-xl"
                />
              </div>

              {/* Tempo */}
              <div>
                <label className="block text-white/60 text-sm mb-2">Duração do treino (minutos)</label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={tempoTreino}
                  onChange={(e) => setTempoTreino(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-center text-white text-xl font-bold">{tempoTreino} min</p>
              </div>

              {/* Estimativas */}
              <div className="space-y-2">
                <h4 className="font-medium text-white/80">Estimativa por actividade:</h4>
                {[
                  { nome: 'Caminhada', calorias: 4 },
                  { nome: 'Treino de força', calorias: 7 },
                  { nome: 'Corrida', calorias: 10 },
                  { nome: 'HIIT', calorias: 15 },
                  { nome: 'Yoga', calorias: 3 }
                ].map(act => (
                  <div key={act.nome} className="flex justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-white/70">{act.nome}</span>
                    <span className="text-green-400 font-bold">
                      {Math.round(act.calorias * tempoTreino * (pesoUsuario / 65))} kcal
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-white/40 text-xs text-center">
                * Valores aproximados. A queima real depende de intensidade, composição corporal e metabolismo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto flex justify-around py-3">
          <Link to="/vitalis/dashboard" className="flex flex-col items-center text-white/40 hover:text-white/70 transition-colors">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Início</span>
          </Link>
          <Link to="/vitalis/checkin" className="flex flex-col items-center text-white/40 hover:text-white/70 transition-colors">
            <span className="text-xl">✅</span>
            <span className="text-xs mt-1">Check-in</span>
          </Link>
          <Link to="/vitalis/treinos" className="flex flex-col items-center text-purple-400">
            <span className="text-xl">💪</span>
            <span className="text-xs mt-1">Treinos</span>
          </Link>
          <Link to="/vitalis/plano" className="flex flex-col items-center text-white/40 hover:text-white/70 transition-colors">
            <span className="text-xl">🍽️</span>
            <span className="text-xs mt-1">Plano</span>
          </Link>
          <Link to="/vitalis/perfil" className="flex flex-col items-center text-white/40 hover:text-white/70 transition-colors">
            <span className="text-xl">👤</span>
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
