import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';

// Desafios disponíveis
const DESAFIOS_DISPONIVEIS = [
  {
    id: 'agua_7dias',
    nome: 'Hidratação Perfeita',
    descricao: 'Bebe 2L de água durante 7 dias seguidos',
    icone: '💧',
    cor: 'blue',
    meta: 7,
    unidade: 'dias',
    tipo: 'agua',
    xp: 150
  },
  {
    id: 'refeicoes_plano',
    nome: 'Plano na Risca',
    descricao: 'Segue 100% do plano em 5 dias',
    icone: '🎯',
    cor: 'green',
    meta: 5,
    unidade: 'dias',
    tipo: 'refeicoes',
    xp: 200
  },
  {
    id: 'treino_4x',
    nome: 'Guerreira Fitness',
    descricao: 'Treina 4 vezes esta semana',
    icone: '💪',
    cor: 'orange',
    meta: 4,
    unidade: 'treinos',
    tipo: 'treino',
    xp: 175
  },
  {
    id: 'sono_qualidade',
    nome: 'Sono Reparador',
    descricao: 'Dorme 7-8h durante 5 noites',
    icone: '😴',
    cor: 'indigo',
    meta: 5,
    unidade: 'noites',
    tipo: 'sono',
    xp: 125
  },
  {
    id: 'checkin_diario',
    nome: 'Consistência',
    descricao: 'Faz check-in todos os dias da semana',
    icone: '✅',
    cor: 'emerald',
    meta: 7,
    unidade: 'dias',
    tipo: 'checkin',
    xp: 100
  },
  {
    id: 'sem_acucar',
    nome: 'Detox Açúcar',
    descricao: 'Evita açúcar adicionado por 5 dias',
    icone: '🚫',
    cor: 'red',
    meta: 5,
    unidade: 'dias',
    tipo: 'habito',
    xp: 200
  },
  {
    id: 'passos_10k',
    nome: 'Caminhante',
    descricao: 'Anda 10.000 passos em 3 dias',
    icone: '🚶‍♀️',
    cor: 'amber',
    meta: 3,
    unidade: 'dias',
    tipo: 'atividade',
    xp: 150
  },
  {
    id: 'meditacao',
    nome: 'Mente Calma',
    descricao: 'Medita 5 minutos por dia, 5 dias',
    icone: '🧘‍♀️',
    cor: 'purple',
    meta: 5,
    unidade: 'dias',
    tipo: 'mindfulness',
    xp: 125
  }
];

export default function DesafiosSemanais() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [desafioAtivo, setDesafioAtivo] = useState(null);
  const [progressoAtual, setProgressoAtual] = useState(0);
  const [desafiosConcluidos, setDesafiosConcluidos] = useState([]);
  const [mostrarSelecao, setMostrarSelecao] = useState(false);
  const [xpGanho, setXpGanho] = useState(0);

  useEffect(() => {
    loadDesafios();
  }, []);

  const loadDesafios = async () => {
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

      // Carregar estado dos desafios do localStorage
      const estadoDesafios = JSON.parse(localStorage.getItem(`vitalis-desafios-${userData.id}`) || '{}');

      if (estadoDesafios.ativo) {
        setDesafioAtivo(estadoDesafios.ativo);
        setProgressoAtual(estadoDesafios.progresso || 0);
      }

      setDesafiosConcluidos(estadoDesafios.concluidos || []);
      setXpGanho(estadoDesafios.xpTotal || 0);

      // Calcular progresso automático baseado em dados reais
      if (estadoDesafios.ativo) {
        await calcularProgressoReal(userData.id, estadoDesafios.ativo);
      }

    } catch (error) {
      console.error('Erro ao carregar desafios:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularProgressoReal = async (userId, desafio) => {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
    const inicioStr = inicioSemana.toISOString().split('T')[0];

    let progresso = 0;

    try {
      switch (desafio.tipo) {
        case 'agua':
          // Contar dias com >= 2L de água
          const { data: aguaData } = await supabase
            .from('vitalis_agua_log')
            .select('data, quantidade_ml')
            .eq('user_id', userId)
            .gte('data', inicioStr);

          const aguaPorDia = (aguaData || []).reduce((acc, log) => {
            acc[log.data] = (acc[log.data] || 0) + log.quantidade_ml;
            return acc;
          }, {});

          progresso = Object.values(aguaPorDia).filter(ml => ml >= 2000).length;
          break;

        case 'treino':
          const { count: treinoCount } = await supabase
            .from('vitalis_workouts_log')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .gte('data', inicioStr);
          progresso = treinoCount || 0;
          break;

        case 'sono':
          const { data: sonoData } = await supabase
            .from('vitalis_sono_log')
            .select('duracao_min')
            .eq('user_id', userId)
            .gte('data', inicioStr);
          progresso = (sonoData || []).filter(s => s.duracao_min >= 420 && s.duracao_min <= 480).length;
          break;

        case 'checkin':
          const { count: checkinCount } = await supabase
            .from('vitalis_registos')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .gte('data', inicioStr);
          progresso = checkinCount || 0;
          break;

        default:
          // Para desafios manuais, manter o progresso salvo
          const estadoSalvo = JSON.parse(localStorage.getItem(`vitalis-desafios-${userId}`) || '{}');
          progresso = estadoSalvo.progresso || 0;
      }

      setProgressoAtual(Math.min(progresso, desafio.meta));

      // Verificar se completou
      if (progresso >= desafio.meta && !desafiosConcluidos.includes(desafio.id)) {
        completarDesafio(desafio);
      }

    } catch (error) {
      console.error('Erro ao calcular progresso:', error);
    }
  };

  const selecionarDesafio = (desafio) => {
    const estado = {
      ativo: desafio,
      progresso: 0,
      dataInicio: new Date().toISOString(),
      concluidos: desafiosConcluidos,
      xpTotal: xpGanho
    };

    localStorage.setItem(`vitalis-desafios-${userId}`, JSON.stringify(estado));
    setDesafioAtivo(desafio);
    setProgressoAtual(0);
    setMostrarSelecao(false);

    // Calcular progresso inicial
    calcularProgressoReal(userId, desafio);
  };

  const completarDesafio = (desafio) => {
    const novoXp = xpGanho + desafio.xp;
    const novosConcluidos = [...desafiosConcluidos, desafio.id];

    const estado = {
      ativo: null,
      progresso: 0,
      concluidos: novosConcluidos,
      xpTotal: novoXp
    };

    localStorage.setItem(`vitalis-desafios-${userId}`, JSON.stringify(estado));

    // Atualizar XP global
    const xpAtual = parseInt(localStorage.getItem('vitalis-xp') || '0');
    localStorage.setItem('vitalis-xp', (xpAtual + desafio.xp).toString());

    setDesafiosConcluidos(novosConcluidos);
    setXpGanho(novoXp);
    setDesafioAtivo(null);
    setProgressoAtual(0);

    // Mostrar celebração
    alert(`🎉 Parabéns! Completaste o desafio "${desafio.nome}" e ganhaste ${desafio.xp} XP!`);
  };

  const incrementarProgressoManual = () => {
    if (!desafioAtivo || progressoAtual >= desafioAtivo.meta) return;

    const novoProgresso = progressoAtual + 1;
    setProgressoAtual(novoProgresso);

    const estado = JSON.parse(localStorage.getItem(`vitalis-desafios-${userId}`) || '{}');
    estado.progresso = novoProgresso;
    localStorage.setItem(`vitalis-desafios-${userId}`, JSON.stringify(estado));

    if (novoProgresso >= desafioAtivo.meta) {
      completarDesafio(desafioAtivo);
    }
  };

  const desistirDesafio = () => {
    if (!confirm('Tens a certeza que queres desistir deste desafio?')) return;

    const estado = {
      ativo: null,
      progresso: 0,
      concluidos: desafiosConcluidos,
      xpTotal: xpGanho
    };

    localStorage.setItem(`vitalis-desafios-${userId}`, JSON.stringify(estado));
    setDesafioAtivo(null);
    setProgressoAtual(0);
  };

  // Desafios disponíveis (excluir já concluídos)
  const desafiosDisponiveis = DESAFIOS_DISPONIVEIS.filter(d => !desafiosConcluidos.includes(d.id));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🏆</div>
          <p className="text-[#6B5C4C]">A carregar desafios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/vitalis" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                ←
              </Link>
              <div>
                <h1 className="text-xl font-bold">Desafios Semanais</h1>
                <p className="text-white/70 text-sm">{desafiosConcluidos.length} desafios completados</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{xpGanho}</p>
              <p className="text-xs text-white/70">XP ganhos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Desafio Ativo */}
        {desafioAtivo ? (
          <div className={`bg-white rounded-3xl shadow-xl p-6 border-2 border-${desafioAtivo.cor}-200`}>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                DESAFIO ATIVO
              </span>
              <button onClick={desistirDesafio} className="text-xs text-gray-400 hover:text-red-500">
                Desistir
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl bg-${desafioAtivo.cor}-100 flex items-center justify-center text-3xl`}>
                {desafioAtivo.icone}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{desafioAtivo.nome}</h2>
                <p className="text-gray-500">{desafioAtivo.descricao}</p>
              </div>
            </div>

            {/* Progresso */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progresso</span>
                <span className="font-semibold text-gray-800">{progressoAtual} / {desafioAtivo.meta} {desafioAtivo.unidade}</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-${desafioAtivo.cor}-400 to-${desafioAtivo.cor}-500 rounded-full transition-all`}
                  style={{ width: `${(progressoAtual / desafioAtivo.meta) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Recompensa */}
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
              <span className="text-sm text-yellow-700">Recompensa:</span>
              <span className="font-bold text-yellow-700">+{desafioAtivo.xp} XP</span>
            </div>

            {/* Botão manual para desafios de hábito */}
            {desafioAtivo.tipo === 'habito' && (
              <button
                onClick={incrementarProgressoManual}
                disabled={progressoAtual >= desafioAtivo.meta}
                className="w-full mt-4 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                Marcar dia como cumprido
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setMostrarSelecao(true)}
            className="w-full py-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center gap-2 hover:shadow-2xl transition-all"
          >
            <span className="text-4xl">🎯</span>
            <span className="font-bold text-lg">Escolher Novo Desafio</span>
            <span className="text-white/70 text-sm">{desafiosDisponiveis.length} desafios disponíveis</span>
          </button>
        )}

        {/* Modal Seleção */}
        {mostrarSelecao && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
            <div className="bg-white rounded-t-3xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Escolhe um Desafio</h2>
                <button onClick={() => setMostrarSelecao(false)} className="text-2xl text-gray-400">×</button>
              </div>

              <div className="space-y-3">
                {desafiosDisponiveis.map(desafio => (
                  <button
                    key={desafio.id}
                    onClick={() => selecionarDesafio(desafio)}
                    className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center gap-4 text-left transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-${desafio.cor}-100 flex items-center justify-center text-2xl`}>
                      {desafio.icone}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{desafio.nome}</h3>
                      <p className="text-sm text-gray-500">{desafio.descricao}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600">+{desafio.xp}</p>
                      <p className="text-xs text-gray-400">XP</p>
                    </div>
                  </button>
                ))}
              </div>

              {desafiosDisponiveis.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🏆</div>
                  <p className="text-gray-500">Completaste todos os desafios!</p>
                  <p className="text-gray-400 text-sm">Novos desafios em breve...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Desafios Concluídos */}
        {desafiosConcluidos.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Desafios Completados ({desafiosConcluidos.length})
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {desafiosConcluidos.map(id => {
                const desafio = DESAFIOS_DISPONIVEIS.find(d => d.id === id);
                if (!desafio) return null;
                return (
                  <div key={id} className="text-center">
                    <div className={`w-12 h-12 mx-auto rounded-xl bg-${desafio.cor}-100 flex items-center justify-center text-xl mb-1`}>
                      {desafio.icone}
                    </div>
                    <p className="text-xs text-gray-600 truncate">{desafio.nome.split(' ')[0]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dicas */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <h3 className="font-semibold text-orange-800 mb-2">🎯 Como Funcionam</h3>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Escolhe um desafio por semana</li>
            <li>• O progresso é calculado automaticamente</li>
            <li>• Ganha XP ao completar cada desafio</li>
            <li>• Novos desafios desbloqueiam ao longo do tempo</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
