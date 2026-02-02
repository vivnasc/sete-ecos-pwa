import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';

// Refeições disponíveis para planeamento
const REFEICOES_DISPONIVEIS = {
  pequeno_almoco: [
    { id: 'pa1', nome: 'Ovos mexidos com espinafres', icone: '🥚', proteina: 2, gordura: 1.5 },
    { id: 'pa2', nome: 'Café Keto', icone: '☕', proteina: 0, gordura: 3 },
    { id: 'pa3', nome: 'Batido proteico', icone: '🥤', proteina: 2, gordura: 1.5 },
    { id: 'pa4', nome: 'Omelete com bacon', icone: '🍳', proteina: 2, gordura: 2 },
    { id: 'pa5', nome: 'Iogurte grego com sementes', icone: '🥛', proteina: 1.5, gordura: 1 },
    { id: 'pa6', nome: 'Papas de aveia com whey', icone: '🥣', proteina: 1.5, gordura: 0.5 },
  ],
  almoco: [
    { id: 'al1', nome: 'Salada de frango grelhado', icone: '🥗', proteina: 3, gordura: 2.5 },
    { id: 'al2', nome: 'Bife de vaca com legumes', icone: '🥩', proteina: 3, gordura: 3 },
    { id: 'al3', nome: 'Salmão ao forno', icone: '🐟', proteina: 2.5, gordura: 2.5 },
    { id: 'al4', nome: 'Frango com arroz e brócolos', icone: '🍛', proteina: 3, gordura: 1 },
    { id: 'al5', nome: 'Picanha grelhada', icone: '🥩', proteina: 3.5, gordura: 3 },
    { id: 'al6', nome: 'Carne moída com legumes', icone: '🥩', proteina: 3, gordura: 2.5 },
  ],
  jantar: [
    { id: 'jt1', nome: 'Peixe grelhado com salada', icone: '🐟', proteina: 2.5, gordura: 2 },
    { id: 'jt2', nome: 'Sopa cremosa com frango', icone: '🍜', proteina: 2, gordura: 1.5 },
    { id: 'jt3', nome: 'Bife com cogumelos', icone: '🥩', proteina: 3, gordura: 2.5 },
    { id: 'jt4', nome: 'Frango ao forno', icone: '🍗', proteina: 2.5, gordura: 1.5 },
    { id: 'jt5', nome: 'Hambúrguer sem pão', icone: '🍔', proteina: 2.5, gordura: 2.5 },
    { id: 'jt6', nome: 'Omelete com salada', icone: '🍳', proteina: 2, gordura: 2 },
  ],
  snack: [
    { id: 'sn1', nome: 'Iogurte grego com nozes', icone: '🥜', proteina: 1, gordura: 1.5 },
    { id: 'sn2', nome: 'Queijo com azeitonas', icone: '🧀', proteina: 1, gordura: 2 },
    { id: 'sn3', nome: 'Ovos cozidos', icone: '🥚', proteina: 1.5, gordura: 1 },
    { id: 'sn4', nome: 'Amêndoas', icone: '🌰', proteina: 0.5, gordura: 2 },
    { id: 'sn5', nome: 'Abacate', icone: '🥑', proteina: 0.5, gordura: 3 },
    { id: 'sn6', nome: 'Fat bomb chocolate', icone: '🍫', proteina: 0.5, gordura: 3 },
  ]
};

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const TIPOS_REFEICAO = ['pequeno_almoco', 'almoco', 'jantar', 'snack'];
const NOMES_REFEICAO = {
  pequeno_almoco: 'Peq. Almoço',
  almoco: 'Almoço',
  jantar: 'Jantar',
  snack: 'Snack'
};

export default function CalendarioRefeicoes() {
  const [semanaAtual, setSemanaAtual] = useState(0); // 0 = esta semana, 1 = próxima, etc.
  const [planoSemanal, setPlanoSemanal] = useState({});
  const [modalAberto, setModalAberto] = useState(null); // { dia: 0, tipo: 'almoco' }
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Calcular datas da semana
  const getDatasSemana = (offset = 0) => {
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;

    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() + diffSegunda + (offset * 7));

    return DIAS_SEMANA.map((_, i) => {
      const data = new Date(segunda);
      data.setDate(segunda.getDate() + i);
      return data;
    });
  };

  const datasSemana = getDatasSemana(semanaAtual);
  const chavesSemana = datasSemana.map(d => d.toISOString().split('T')[0]);

  useEffect(() => {
    carregarDados();
  }, [semanaAtual]);

  const carregarDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserData(user);

      // Carregar plano semanal do localStorage
      const planoGuardado = localStorage.getItem(`vitalis-plano-refeicoes-${user.id}`);
      if (planoGuardado) {
        setPlanoSemanal(JSON.parse(planoGuardado));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarPlano = (novoPlano) => {
    setPlanoSemanal(novoPlano);
    if (userData) {
      localStorage.setItem(`vitalis-plano-refeicoes-${userData.id}`, JSON.stringify(novoPlano));
    }
  };

  const adicionarRefeicao = (refeicao) => {
    if (!modalAberto) return;

    const { dia, tipo } = modalAberto;
    const chave = chavesSemana[dia];

    const novoPlano = { ...planoSemanal };
    if (!novoPlano[chave]) novoPlano[chave] = {};
    novoPlano[chave][tipo] = refeicao;

    guardarPlano(novoPlano);
    setModalAberto(null);
  };

  const removerRefeicao = (dia, tipo) => {
    const chave = chavesSemana[dia];
    const novoPlano = { ...planoSemanal };

    if (novoPlano[chave]) {
      delete novoPlano[chave][tipo];
      if (Object.keys(novoPlano[chave]).length === 0) {
        delete novoPlano[chave];
      }
    }

    guardarPlano(novoPlano);
  };

  const copiarSemanaAnterior = () => {
    const datasAnterior = getDatasSemana(semanaAtual - 1);
    const chavesAnterior = datasAnterior.map(d => d.toISOString().split('T')[0]);

    const novoPlano = { ...planoSemanal };

    chavesAnterior.forEach((chaveAnt, i) => {
      if (planoSemanal[chaveAnt]) {
        novoPlano[chavesSemana[i]] = { ...planoSemanal[chaveAnt] };
      }
    });

    guardarPlano(novoPlano);
  };

  const limparSemana = () => {
    const novoPlano = { ...planoSemanal };
    chavesSemana.forEach(chave => delete novoPlano[chave]);
    guardarPlano(novoPlano);
  };

  const formatarData = (data) => {
    return `${data.getDate()}/${data.getMonth() + 1}`;
  };

  const isHoje = (data) => {
    const hoje = new Date();
    return data.toDateString() === hoje.toDateString();
  };

  // Calcular totais da semana
  const calcularTotaisSemana = () => {
    let proteina = 0, gordura = 0, refeicoes = 0;

    chavesSemana.forEach(chave => {
      if (planoSemanal[chave]) {
        Object.values(planoSemanal[chave]).forEach(ref => {
          proteina += ref.proteina || 0;
          gordura += ref.gordura || 0;
          refeicoes++;
        });
      }
    });

    return { proteina, gordura, refeicoes };
  };

  const totais = calcularTotaisSemana();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7C8B6F] to-[#5C6B4F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#7C8B6F] to-[#5C6B4F] text-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/vitalis/dashboard" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span>←</span>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Calendário de Refeições</h1>
              <p className="text-white/70 text-sm">Planeia a tua semana</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {/* Navegação da Semana */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSemanaAtual(s => s - 1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              ←
            </button>

            <div className="text-center">
              <p className="font-bold text-lg text-gray-800">
                {semanaAtual === 0 ? 'Esta Semana' : semanaAtual === 1 ? 'Próxima Semana' : semanaAtual === -1 ? 'Semana Passada' : `Semana ${semanaAtual > 0 ? '+' : ''}${semanaAtual}`}
              </p>
              <p className="text-sm text-gray-500">
                {formatarData(datasSemana[0])} - {formatarData(datasSemana[6])}
              </p>
            </div>

            <button
              onClick={() => setSemanaAtual(s => s + 1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              →
            </button>
          </div>

          {/* Ações rápidas */}
          <div className="flex gap-2 mt-4 justify-center">
            <button
              onClick={copiarSemanaAnterior}
              className="px-3 py-1.5 bg-[#7C8B6F]/10 text-[#7C8B6F] rounded-full text-sm hover:bg-[#7C8B6F]/20"
            >
              📋 Copiar semana anterior
            </button>
            <button
              onClick={limparSemana}
              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm hover:bg-red-100"
            >
              🗑️ Limpar semana
            </button>
          </div>
        </div>

        {/* Resumo da Semana */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h3 className="font-bold text-gray-800 mb-3">Resumo da Semana</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-blue-600">{totais.refeicoes}</p>
              <p className="text-xs text-gray-500">Refeições planeadas</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-red-600">{totais.proteina.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Palmas proteína</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-yellow-600">{totais.gordura.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Polegares gordura</p>
            </div>
          </div>
        </div>

        {/* Calendário Grid */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header dos dias */}
          <div className="grid grid-cols-8 bg-gray-50 border-b">
            <div className="p-3 text-center font-medium text-gray-500 text-sm border-r">
              Refeição
            </div>
            {DIAS_SEMANA.map((dia, i) => (
              <div
                key={dia}
                className={`p-3 text-center border-r last:border-r-0 ${isHoje(datasSemana[i]) ? 'bg-[#7C8B6F] text-white' : ''}`}
              >
                <p className="font-bold text-sm">{dia.slice(0, 3)}</p>
                <p className={`text-xs ${isHoje(datasSemana[i]) ? 'text-white/70' : 'text-gray-400'}`}>
                  {formatarData(datasSemana[i])}
                </p>
              </div>
            ))}
          </div>

          {/* Linhas de refeições */}
          {TIPOS_REFEICAO.map(tipo => (
            <div key={tipo} className="grid grid-cols-8 border-b last:border-b-0">
              <div className="p-3 text-center bg-gray-50 border-r flex items-center justify-center">
                <span className="font-medium text-gray-600 text-xs">
                  {NOMES_REFEICAO[tipo]}
                </span>
              </div>

              {DIAS_SEMANA.map((_, diaIndex) => {
                const chave = chavesSemana[diaIndex];
                const refeicao = planoSemanal[chave]?.[tipo];

                return (
                  <div
                    key={diaIndex}
                    className={`p-2 border-r last:border-r-0 min-h-[80px] ${isHoje(datasSemana[diaIndex]) ? 'bg-[#7C8B6F]/5' : ''}`}
                  >
                    {refeicao ? (
                      <div className="bg-[#7C8B6F]/10 rounded-lg p-2 h-full relative group">
                        <button
                          onClick={() => removerRefeicao(diaIndex, tipo)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <span className="text-xl">{refeicao.icone}</span>
                        <p className="text-xs text-gray-700 mt-1 line-clamp-2">{refeicao.nome}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setModalAberto({ dia: diaIndex, tipo })}
                        className="w-full h-full flex items-center justify-center text-gray-300 hover:text-[#7C8B6F] hover:bg-[#7C8B6F]/5 rounded-lg transition-colors"
                      >
                        <span className="text-2xl">+</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Dicas */}
        <div className="bg-gradient-to-r from-[#7C8B6F] to-[#5C6B4F] rounded-2xl p-4 text-white">
          <h3 className="font-bold mb-2">💡 Dica de Planeamento</h3>
          <p className="text-sm text-white/80">
            Planear as refeições com antecedência ajuda a manter o foco e evita decisões impulsivas.
            Usa o botão "Copiar semana anterior" para poupar tempo!
          </p>
        </div>
      </main>

      {/* Modal de Seleção */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">
                    Escolher {NOMES_REFEICAO[modalAberto.tipo]}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {DIAS_SEMANA[modalAberto.dia]}, {formatarData(datasSemana[modalAberto.dia])}
                  </p>
                </div>
                <button
                  onClick={() => setModalAberto(null)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-3">
                {REFEICOES_DISPONIVEIS[modalAberto.tipo].map(refeicao => (
                  <button
                    key={refeicao.id}
                    onClick={() => adicionarRefeicao(refeicao)}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-[#7C8B6F]/10 transition-colors text-left"
                  >
                    <span className="text-3xl">{refeicao.icone}</span>
                    <p className="font-medium text-gray-800 mt-2 text-sm">{refeicao.nome}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-red-600">{refeicao.proteina}P</span>
                      <span className="text-xs text-yellow-600">{refeicao.gordura}G</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
