// ============================================================
// VITALIS - RELATÓRIOS HUB
// ============================================================
// Página central para aceder a todos os relatórios:
// - Semanal (ecrã interactivo)
// - Mensal (PDF)
// - Fim de Fase (PDF)
// - Fim de Programa (PDF + DOCX)
// ============================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';

// ============================================================
// ÍCONES
// ============================================================
const Icons = {
  ArrowLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Trophy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  Target: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  BarChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  )
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function RelatoriosHub() {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [plano, setPlano] = useState(null);
  const [relatoriosDisponiveis, setRelatoriosDisponiveis] = useState({
    mensais: [],
    fases: [],
    final: false
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) return;

      // Buscar cliente
      const { data: clientData } = await supabase
        .from('vitalis_clients')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      setClient(clientData);

      // Buscar plano
      if (clientData) {
        const { data: planoData } = await supabase
          .from('vitalis_plano')
          .select('*')
          .eq('client_id', clientData.id)
          .single();

        setPlano(planoData);

        // Calcular relatórios disponíveis
        calcularRelatoriosDisponiveis(clientData, planoData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularRelatoriosDisponiveis = (clientData, planoData) => {
    const dataInicio = new Date(clientData?.data_inicio || new Date());
    const hoje = new Date();
    
    // Calcular meses completos
    const mesesCompletos = [];
    let dataVerificar = new Date(dataInicio);
    dataVerificar.setMonth(dataVerificar.getMonth() + 1);
    dataVerificar.setDate(1); // Primeiro dia do mês seguinte
    
    while (dataVerificar <= hoje) {
      const mesAnterior = new Date(dataVerificar);
      mesAnterior.setMonth(mesAnterior.getMonth() - 1);
      mesesCompletos.push({
        mes: mesAnterior.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }),
        data: mesAnterior.toISOString().split('T')[0]
      });
      dataVerificar.setMonth(dataVerificar.getMonth() + 1);
    }

    // Calcular fases completas
    const fasesCompletas = [];
    const faseAtual = planoData?.fase || 1;
    for (let i = 1; i < faseAtual; i++) {
      fasesCompletas.push({
        numero: i,
        nome: getNomeFase(i)
      });
    }

    // Verificar se programa terminou (3 meses)
    const diasPrograma = Math.floor((hoje - dataInicio) / (1000 * 60 * 60 * 24));
    const programaTerminado = diasPrograma >= 84; // ~12 semanas

    setRelatoriosDisponiveis({
      mensais: mesesCompletos,
      fases: fasesCompletas,
      final: programaTerminado
    });
  };

  const getNomeFase = (numero) => {
    const fases = {
      1: 'Indução',
      2: 'Transição',
      3: 'Recomposição',
      4: 'Manutenção'
    };
    return fases[numero] || `Fase ${numero}`;
  };

  const gerarPDFMensal = async (mes) => {
    // TODO: Implementar geração de PDF mensal
    alert(`A gerar relatório de ${mes}... (em desenvolvimento)`);
  };

  const gerarPDFFase = async (fase) => {
    // TODO: Implementar geração de PDF de fim de fase
    alert(`A gerar relatório da ${fase.nome}... (em desenvolvimento)`);
  };

  const gerarPDFFinal = async () => {
    // TODO: Implementar geração de PDF final
    alert('A gerar relatório final... (em desenvolvimento)');
  };

  // Calcular semana actual
  const semanaActual = client?.data_inicio 
    ? Math.ceil((new Date() - new Date(client.data_inicio)) / (7 * 24 * 60 * 60 * 1000))
    : 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">A carregar relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C1634A] via-[#D97706] to-[#A54E38] text-white px-4 pt-8 pb-6">
        <div className="max-w-md mx-auto">
          <Link to="/vitalis/dashboard" className="inline-flex items-center gap-1 text-orange-100 hover:text-white mb-4">
            <Icons.ArrowLeft />
            <span>Voltar</span>
          </Link>

          <div className="flex items-center gap-3">
            <img
              src="/logos/VITALIS_LOGO_V3.png"
              alt="Vitalis"
              className="w-12 h-12 object-contain drop-shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold">Relatórios</h1>
              <p className="text-orange-100 mt-1">Acompanha a tua evolução</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">

        {/* Relatório Semanal - Link para ecrã */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                <Icons.Calendar />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Relatório Semanal</h2>
                <p className="text-sm text-gray-500">Semana {semanaActual} do programa</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Visualiza o teu progresso semanal: refeições, água, treinos, sono e mais.
            </p>
            
            <Link 
              to="/vitalis/relatorio-semanal"
              className="flex items-center justify-between w-full p-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              <span className="font-medium text-indigo-700">Ver Relatório Semanal</span>
              <Icons.ChevronRight />
            </Link>
          </div>
        </div>

        {/* Secção PDFs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                <Icons.FileText />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Documentos PDF</h2>
                <p className="text-sm text-gray-500">Relatórios para guardar</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            
            {/* Relatórios Mensais */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icons.BarChart />
                <h3 className="font-semibold text-gray-700">Relatórios Mensais</h3>
              </div>
              
              {relatoriosDisponiveis.mensais.length > 0 ? (
                <div className="space-y-2">
                  {relatoriosDisponiveis.mensais.map((rel, i) => (
                    <button
                      key={i}
                      onClick={() => gerarPDFMensal(rel.mes)}
                      className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        <div className="text-left">
                          <p className="font-medium text-gray-800 capitalize">{rel.mes}</p>
                          <p className="text-xs text-gray-500">Resumo mensal</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-indigo-600">
                        <Icons.Download />
                        <span className="text-sm font-medium">PDF</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic p-3 bg-gray-50 rounded-xl">
                  Disponível no fim do primeiro mês completo
                </p>
              )}
            </div>

            {/* Relatórios de Fase */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icons.Target />
                <h3 className="font-semibold text-gray-700">Relatórios de Fase</h3>
              </div>
              
              {relatoriosDisponiveis.fases.length > 0 ? (
                <div className="space-y-2">
                  {relatoriosDisponiveis.fases.map((fase, i) => (
                    <button
                      key={i}
                      onClick={() => gerarPDFFase(fase)}
                      className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🎯</span>
                        <div className="text-left">
                          <p className="font-medium text-gray-800">Fase {fase.numero}: {fase.nome}</p>
                          <p className="text-xs text-gray-500">Análise completa da fase</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-indigo-600">
                        <Icons.Download />
                        <span className="text-sm font-medium">PDF</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic p-3 bg-gray-50 rounded-xl">
                  Disponível ao completar cada fase
                </p>
              )}
            </div>

            {/* Relatório Final */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icons.Trophy />
                <h3 className="font-semibold text-gray-700">Relatório Final</h3>
              </div>
              
              {relatoriosDisponiveis.final ? (
                <button
                  onClick={gerarPDFFinal}
                  className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 rounded-xl transition-colors border border-amber-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏆</span>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">Relatório de Conclusão</p>
                      <p className="text-xs text-gray-600">Toda a tua jornada documentada</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600">
                    <Icons.Download />
                    <span className="text-sm font-medium">PDF</span>
                  </div>
                </button>
              ) : (
                <div className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl opacity-60">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl grayscale">🏆</span>
                    <div className="text-left">
                      <p className="font-medium text-gray-500">Relatório de Conclusão</p>
                      <p className="text-xs text-gray-400">Disponível ao completar o programa</p>
                    </div>
                  </div>
                  <Icons.Lock />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
          <div className="flex gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-semibold text-blue-900 mb-1">Dica</p>
              <p className="text-sm text-blue-800">
                Os relatórios PDF são gerados automaticamente com base nos teus registos. 
                Quanto mais consistente fores nos check-ins, mais completos serão os relatórios!
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
