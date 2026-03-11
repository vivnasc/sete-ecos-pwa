import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { EmailTriggers } from '../../lib/emails';
import { g } from '../../utils/genero';

const EspacoRetorno = () => {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState('acolhimento'); // acolhimento, identificar, ferramentas, timer, registar, sucesso
  const [estadoSelecionado, setEstadoSelecionado] = useState(null);
  const [ferramentaActiva, setFerramentaActiva] = useState(null);
  const [timerActivo, setTimerActivo] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(600); // 10 minutos
  const [escritaLivre, setEscritaLivre] = useState('');
  const [loading, setLoading] = useState(false);
  const [respiracaoFase, setRespiracaoFase] = useState('preparar'); // preparar, inspirar, segurar, expirar
  const [respiracaoCiclo, setRespiracaoCiclo] = useState(0);
  const audioRef = useRef(null);

  // Contar usos do Espaço de Retorno para sugerir SERENA
  const [usosEspacoRetorno, setUsosEspacoRetorno] = useState(0);
  const [mostrarSugestaoSerena, setMostrarSugestaoSerena] = useState(false);

  useEffect(() => {
    const contarUsos = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();
        if (!userData) return;

        const { count } = await supabase
          .from('vitalis_espaco_retorno')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userData.id);

        const totalUsos = (count || 0) + 1; // +1 pelo uso actual
        setUsosEspacoRetorno(totalUsos);

        // Sugerir SERENA a partir de 3 usos (e apenas 1x a cada 5 usos)
        const ultimaSugestao = parseInt(localStorage.getItem('vitalis-serena-sugestao-uso') || '0');
        if (totalUsos >= 3 && totalUsos - ultimaSugestao >= 3) {
          setMostrarSugestaoSerena(true);
        }
      } catch (e) {
        // Silencioso — não bloqueia funcionalidade
      }
    };
    contarUsos();
  }, []);

  const fecharSugestaoSerena = () => {
    setMostrarSugestaoSerena(false);
    localStorage.setItem('vitalis-serena-sugestao-uso', String(usosEspacoRetorno));
  };

  // Estados emocionais
  const estados = [
    { 
      id: 'cansaco', 
      nome: 'Cansaço', 
      emoji: '🔋', 
      cor: 'from-gray-400 to-gray-600',
      desc: 'Sem energia, exausta',
      mensagem: 'O cansaço pede descanso, não comida. Vamos encontrar o que realmente precisas.'
    },
    { 
      id: 'ansiedade', 
      nome: 'Ansiedade', 
      emoji: '🌀', 
      cor: 'from-blue-400 to-indigo-600',
      desc: 'Nervosa, preocupada',
      mensagem: 'A ansiedade é energia presa. Vamos ajudar o teu corpo a libertá-la.'
    },
    { 
      id: 'tristeza', 
      nome: 'Tristeza', 
      emoji: '💧', 
      cor: 'from-blue-300 to-blue-500',
      desc: 'Em baixo, melancólica',
      mensagem: 'A tristeza precisa de acolhimento, não de doçura artificial. Estou aqui contigo.'
    },
    { 
      id: 'raiva', 
      nome: 'Raiva', 
      emoji: '🔥', 
      cor: 'from-red-400 to-red-600',
      desc: 'Frustrada, irritada',
      mensagem: 'A raiva tem uma mensagem importante. Vamos ouvi-la sem a abafar com comida.'
    },
    { 
      id: 'vazio', 
      nome: 'Vazio', 
      emoji: '◯', 
      cor: 'from-gray-300 to-gray-500',
      desc: 'Sem propósito, entediada',
      mensagem: g('O vazio pede presença, não preenchimento. Vamos estar aqui, juntos.', 'O vazio pede presença, não preenchimento. Vamos estar aqui, juntas.')
    },
    { 
      id: 'solidao', 
      nome: 'Solidão', 
      emoji: '🌑', 
      cor: 'from-purple-400 to-purple-700',
      desc: g('Sozinho, isolado', 'Sozinha, isolada'),
      mensagem: g('A solidão pede conexão. Neste momento, estás conectado comigo. Não estás sozinho.', 'A solidão pede conexão. Neste momento, estás conectada comigo. Não estás sozinha.')
    },
    { 
      id: 'negacao', 
      nome: 'Negação', 
      emoji: '🪞', 
      cor: 'from-amber-400 to-orange-600',
      desc: 'Evito pensar, automático',
      mensagem: 'Vieste aqui. Isso já é coragem. Já estás a quebrar o padrão automático.'
    }
  ];

  // Ferramentas por estado
  const ferramentas = {
    respiracao: {
      id: 'respiracao',
      nome: 'Respiração 4-7-8',
      emoji: '🫁',
      desc: '5 minutos para acalmar',
      tempo: 5
    },
    escrita: {
      id: 'escrita',
      nome: 'Escrita Livre',
      emoji: '✍️',
      desc: 'Desabafa sem filtro',
      tempo: null
    },
    afirmacoes: {
      id: 'afirmacoes',
      nome: 'Palavras de Conforto',
      emoji: '💭',
      desc: 'Mensagens que acalmam',
      tempo: null
    },
    alternativas: {
      id: 'alternativas',
      nome: 'O Que Fazer em Vez',
      emoji: '🚶‍♀️',
      desc: 'Acções práticas',
      tempo: null
    },
    timer: {
      id: 'timer',
      nome: 'Pausa de 10 Minutos',
      emoji: '⏰',
      desc: 'Espera antes de decidir',
      tempo: 10
    }
  };

  // Afirmações por estado
  const afirmacoesPorEstado = {
    cansaco: [
      "O teu corpo está a pedir descanso, não açúcar.",
      "Comer não vai dar-te energia verdadeira.",
      "Podes descansar sem culpa. Mereces.",
      "Uma pausa de 10 minutos pode fazer milagres.",
      "O cansaço é temporário. A gentileza contigo mesma é para sempre."
    ],
    ansiedade: [
      "Este momento vai passar. Sempre passa.",
      "A ansiedade mente. Tu estás segura.",
      "Respira. O teu corpo sabe acalmar-se.",
      "Não precisas resolver tudo agora.",
      "Cada respiração é um novo começo."
    ],
    tristeza: [
      "Está tudo bem sentir tristeza.",
      "As lágrimas limpam. A comida não.",
      "Esta dor é temporária. Tu és permanente.",
      "Não precisas de te anestesiar. Podes só sentir.",
      "Amanhã o sol nasce de novo. Sempre nasce."
    ],
    raiva: [
      "A tua raiva é válida. Não precisas de a engolir.",
      "Comer não vai resolver o que te irritou.",
      "Podes expressar sem destruir.",
      "A raiva tem uma mensagem. Ouve-a.",
      "Respira fundo. A clareza vem depois da calma."
    ],
    vazio: [
      "O vazio não se preenche com comida.",
      "Estar presente é suficiente.",
      "Não precisas de fazer nada. Só estar.",
      "O tédio é um convite para criar.",
      "Este momento também tem valor."
    ],
    solidao: [
      g("Neste momento, estás conectado comigo.", "Neste momento, estás conectada comigo."),
      "A solidão é uma sensação, não uma verdade.",
      g("Podes estar sozinho sem estar abandonado.", "Podes estar sozinha sem estar abandonada."),
      "Vieste aqui. Isso é cuidar de ti.",
      g("Mereces companhia. Começa por ti mesmo.", "Mereces companhia. Começa por ti mesma.")
    ],
    negacao: [
      "Vieste aqui. Isso já é consciência.",
      "Quebrar o automático é corajoso.",
      "Podes olhar. Não vai destruir-te.",
      "A verdade liberta, mesmo quando dói.",
      "Um passo de cada vez. Este é o primeiro."
    ]
  };

  // Alternativas práticas por estado
  const alternativasPorEstado = {
    cansaco: [
      "Deita-te 10 minutos com os olhos fechados",
      "Bebe um copo grande de água fresca",
      "Faz alongamentos suaves",
      "Abre a janela e respira ar fresco",
      "Lava o rosto com água fria"
    ],
    ansiedade: [
      "Caminha 5 minutos, mesmo que seja em casa",
      "Conta 5 coisas que vês, 4 que ouves, 3 que tocas",
      "Aperta um cubo de gelo na mão",
      "Liga a alguém durante 2 minutos",
      "Escreve tudo o que está na tua cabeça"
    ],
    tristeza: [
      "Permite-te chorar sem julgamento",
      "Abraça uma almofada ou cobertor",
      "Ouve uma música que te faça sentir compreendida",
      "Toma um banho quente",
      "Escreve uma carta para ti mesma"
    ],
    raiva: [
      "Sai de casa e caminha rápido por 10 minutos",
      "Grita para uma almofada",
      "Faz 20 agachamentos ou flexões",
      "Escreve tudo o que queres dizer (não envies)",
      "Lava a loiça com força (sério, funciona)"
    ],
    vazio: [
      "Faz uma única tarefa pequena (arrumar uma gaveta)",
      "Liga a alguém só para dizer olá",
      "Vê um vídeo que te faça rir",
      "Rega uma planta ou cuida de algo vivo",
      "Planeia algo pequeno para amanhã"
    ],
    solidao: [
      "Envia uma mensagem a alguém que gostas",
      "Vai a um café e senta-te perto de pessoas",
      "Liga para um familiar",
      "Escreve num diário como se falasses com uma amiga",
      "Vê fotos de momentos felizes com pessoas"
    ],
    negacao: [
      "Escreve: 'Agora estou a sentir...'",
      "Olha-te ao espelho e diz 'Estou aqui'",
      "Respira fundo 5 vezes, devagar",
      "Pergunta-te: 'O que estou a evitar?'",
      "Aceita que não precisas de ter tudo resolvido"
    ]
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActivo && tempoRestante > 0) {
      interval = setInterval(() => {
        setTempoRestante(t => t - 1);
      }, 1000);
    } else if (tempoRestante === 0) {
      setTimerActivo(false);
    }
    return () => clearInterval(interval);
  }, [timerActivo, tempoRestante]);

  // Respiração guiada effect
  useEffect(() => {
    let timeout;
    if (ferramentaActiva === 'respiracao' && respiracaoFase !== 'preparar') {
      const tempos = {
        inspirar: 4000,
        segurar: 7000,
        expirar: 8000
      };
      
      timeout = setTimeout(() => {
        if (respiracaoFase === 'inspirar') setRespiracaoFase('segurar');
        else if (respiracaoFase === 'segurar') setRespiracaoFase('expirar');
        else if (respiracaoFase === 'expirar') {
          if (respiracaoCiclo < 4) {
            setRespiracaoCiclo(c => c + 1);
            setRespiracaoFase('inspirar');
          } else {
            setRespiracaoFase('completo');
          }
        }
      }, tempos[respiracaoFase] || 0);
    }
    return () => clearTimeout(timeout);
  }, [respiracaoFase, respiracaoCiclo, ferramentaActiva]);

  const iniciarRespiracao = () => {
    setRespiracaoFase('inspirar');
    setRespiracaoCiclo(0);
  };

  const formatarTempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg.toString().padStart(2, '0')}`;
  };

  const guardarMomento = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: userData } = await supabase
        .from('users')
        .select('id, nome, email')
        .eq('auth_id', user.id)
        .single();

      await supabase
        .from('vitalis_espaco_retorno')
        .insert([{
          user_id: userData.id,
          emocao: estadoSelecionado,
          ferramenta_usada: ferramentaActiva,
          escrita_livre: escritaLivre || null,
          completou_timer: tempoRestante === 0
        }]);

      // Notificar coach sobre uso do Espaço de Retorno (async)
      const estadoInfo = estados.find(e => e.id === estadoSelecionado);
      EmailTriggers.onEspacoRetorno(
        {
          nome: userData.nome || user.email.split('@')[0],
          email: user.email
        },
        estadoInfo?.nome || estadoSelecionado
      ).catch(err => console.error('Erro ao notificar coach:', err));

      setEtapa('sucesso');
    } catch (error) {
      console.error('Erro ao guardar:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDERIZAÇÃO POR ETAPA ====================

  // ETAPA: ACOLHIMENTO
  if (etapa === 'acolhimento') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          {/* Logo Vitalis com animação suave */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto rounded-full bg-white/10 animate-pulse flex items-center justify-center">
              <img
                src="/logos/VITALIS_LOGO_V3.png"
                alt="Vitalis"
                className="w-20 h-20 object-contain drop-shadow-lg"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Espaço de Retorno
          </h1>
          
          <p className="text-xl text-purple-200 mb-2">
            Respira.
          </p>
          <p className="text-xl text-purple-200 mb-2">
            Estás segura aqui.
          </p>
          <p className="text-purple-300 mb-8">
            Vieste até aqui. Isso já é um acto de coragem.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setEtapa('identificar')}
              className="w-full py-4 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-semibold backdrop-blur-sm transition-all border border-white/20"
            >
              O que estás a sentir? →
            </button>

            <button
              onClick={() => navigate('/vitalis/dashboard')}
              className="w-full py-3 text-purple-300 hover:text-white transition-colors"
            >
              ← Voltar ao dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ETAPA: IDENTIFICAR ESTADO
  if (etapa === 'identificar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center pt-8 pb-6">
            <button
              onClick={() => setEtapa('acolhimento')}
              className="text-purple-300 hover:text-white mb-4 inline-block"
            >
              ← Voltar
            </button>
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              O que estás a sentir agora?
            </h2>
            <p className="text-purple-300">
              Não há resposta errada. Só observa.
            </p>
          </div>

          {/* Grid de estados */}
          <div className="grid grid-cols-2 gap-4">
            {estados.map(estado => (
              <button
                key={estado.id}
                onClick={() => {
                  setEstadoSelecionado(estado.id);
                  setEtapa('ferramentas');
                }}
                className={`p-5 rounded-2xl bg-gradient-to-br ${estado.cor} bg-opacity-80 text-left transition-all hover:scale-105 hover:shadow-xl border border-white/20`}
              >
                <span className="text-4xl block mb-2">{estado.emoji}</span>
                <h3 className="text-white font-bold text-lg">{estado.nome}</h3>
                <p className="text-white/80 text-sm">{estado.desc}</p>
              </button>
            ))}
          </div>

          {/* Opção: não sei */}
          <button
            onClick={() => {
              setEstadoSelecionado('ansiedade'); // default
              setEtapa('ferramentas');
            }}
            className="w-full mt-6 py-4 bg-white/10 hover:bg-white/20 text-white/80 rounded-2xl transition-all"
          >
            Não sei bem... só quero acalmar 🤷‍♀️
          </button>
        </div>
      </div>
    );
  }

  // ETAPA: FERRAMENTAS
  if (etapa === 'ferramentas') {
    const estadoActual = estados.find(e => e.id === estadoSelecionado);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Header com estado */}
          <div className="text-center pt-6 pb-4">
            <button
              onClick={() => {
                setFerramentaActiva(null);
                setEtapa('identificar');
              }}
              className="text-purple-300 hover:text-white mb-4 inline-block"
            >
              ← Voltar
            </button>
            
            <div className={`inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r ${estadoActual?.cor} mb-4`}>
              <span className="text-2xl">{estadoActual?.emoji}</span>
              <span className="text-white font-semibold">{estadoActual?.nome}</span>
            </div>
            
            <p className="text-purple-200 text-lg px-4">
              {estadoActual?.mensagem}
            </p>
          </div>

          {/* Se não há ferramenta activa, mostrar menu */}
          {!ferramentaActiva && (
            <>
              <h3 className="text-white text-center font-semibold mb-4 mt-6">
                O que precisas agora?
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFerramentaActiva('respiracao')}
                  className="p-5 bg-white/10 hover:bg-white/20 rounded-2xl text-left transition-all border border-white/20"
                >
                  <span className="text-3xl block mb-2">🫁</span>
                  <h4 className="text-white font-bold">Respirar</h4>
                  <p className="text-purple-300 text-sm">Técnica 4-7-8</p>
                </button>

                <button
                  onClick={() => setFerramentaActiva('afirmacoes')}
                  className="p-5 bg-white/10 hover:bg-white/20 rounded-2xl text-left transition-all border border-white/20"
                >
                  <span className="text-3xl block mb-2">💭</span>
                  <h4 className="text-white font-bold">Ouvir Palavras</h4>
                  <p className="text-purple-300 text-sm">Que acalmam</p>
                </button>

                <button
                  onClick={() => setFerramentaActiva('escrita')}
                  className="p-5 bg-white/10 hover:bg-white/20 rounded-2xl text-left transition-all border border-white/20"
                >
                  <span className="text-3xl block mb-2">✍️</span>
                  <h4 className="text-white font-bold">Desabafar</h4>
                  <p className="text-purple-300 text-sm">Escrita livre</p>
                </button>

                <button
                  onClick={() => setFerramentaActiva('alternativas')}
                  className="p-5 bg-white/10 hover:bg-white/20 rounded-2xl text-left transition-all border border-white/20"
                >
                  <span className="text-3xl block mb-2">🚶‍♀️</span>
                  <h4 className="text-white font-bold">Fazer Algo</h4>
                  <p className="text-purple-300 text-sm">Em vez de comer</p>
                </button>
              </div>

              {/* Timer especial */}
              <button
                onClick={() => {
                  setFerramentaActiva('timer');
                  setTimerActivo(true);
                  setTempoRestante(600);
                }}
                className="w-full mt-4 p-5 bg-gradient-to-r from-[#7C8B6F]/30 to-[#9CAF88]/30 hover:from-[#7C8B6F]/40 hover:to-[#9CAF88]/40 rounded-2xl text-left transition-all border border-[#9CAF88]/30"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">⏰</span>
                  <div>
                    <h4 className="text-white font-bold">Pausa de 10 Minutos</h4>
                    <p className="text-[#C5D1BC] text-sm">Espera antes de decidir comer</p>
                  </div>
                </div>
              </button>

              {/* Sugestão SERENA no menu de ferramentas (quando usa frequentemente) */}
              {mostrarSugestaoSerena && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-2xl border border-blue-300/20">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💧</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">Já vieste aqui {usosEspacoRetorno}x</p>
                      <p className="text-blue-200 text-xs">O SERENA ajuda-te a trabalhar as emoções na raiz.</p>
                    </div>
                    <button
                      onClick={() => navigate('/serena')}
                      className="px-3 py-1.5 bg-blue-500/50 hover:bg-blue-500/70 text-white text-xs rounded-lg font-semibold transition-colors shrink-0 active:scale-95"
                    >
                      Ver
                    </button>
                  </div>
                </div>
              )}

              {/* Botão registar opcional */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={guardarMomento}
                  disabled={loading}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-semibold transition-all"
                >
                  {loading ? 'A guardar...' : '💜 Guardar este momento'}
                </button>
                <p className="text-purple-400 text-sm text-center mt-2">
                  Opcional: guarda para veres padrões depois
                </p>
              </div>
            </>
          )}

          {/* FERRAMENTA: RESPIRAÇÃO */}
          {ferramentaActiva === 'respiracao' && (
            <div className="text-center py-8">
              <button
                onClick={() => {
                  setFerramentaActiva(null);
                  setRespiracaoFase('preparar');
                  setRespiracaoCiclo(0);
                }}
                className="text-purple-300 hover:text-white mb-6 inline-block"
              >
                ← Voltar às ferramentas
              </button>

              <h3 className="text-2xl font-bold text-white mb-6">
                Respiração 4-7-8
              </h3>

              {respiracaoFase === 'preparar' && (
                <div className="space-y-6">
                  <p className="text-purple-200">
                    Esta técnica activa o sistema nervoso parassimpático.<br/>
                    Vamos fazer 5 ciclos {g('juntos', 'juntas')}.
                  </p>
                  <div className="w-40 h-40 mx-auto rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-6xl">🫁</span>
                  </div>
                  <button
                    onClick={iniciarRespiracao}
                    className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-full font-semibold transition-all"
                  >
                    Começar →
                  </button>
                </div>
              )}

              {respiracaoFase !== 'preparar' && respiracaoFase !== 'completo' && (
                <div className="space-y-6">
                  <div className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center transition-all duration-1000 ${
                    respiracaoFase === 'inspirar' ? 'bg-blue-500/40 scale-110' :
                    respiracaoFase === 'segurar' ? 'bg-purple-500/40 scale-110' :
                    'bg-indigo-500/40 scale-90'
                  }`}>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-white mb-2">
                        {respiracaoFase === 'inspirar' ? '4' :
                         respiracaoFase === 'segurar' ? '7' : '8'}
                      </p>
                      <p className="text-white/80 text-lg">
                        {respiracaoFase === 'inspirar' ? 'INSPIRA' :
                         respiracaoFase === 'segurar' ? 'SEGURA' : 'EXPIRA'}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-purple-300">
                    Ciclo {respiracaoCiclo + 1} de 5
                  </p>
                  
                  <div className="flex justify-center gap-2">
                    {[0,1,2,3,4].map(i => (
                      <div 
                        key={i}
                        className={`w-3 h-3 rounded-full ${i <= respiracaoCiclo ? 'bg-white' : 'bg-white/30'}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {respiracaoFase === 'completo' && (
                <div className="space-y-6">
                  <div className="w-40 h-40 mx-auto rounded-full bg-green-500/30 flex items-center justify-center">
                    <span className="text-6xl">✨</span>
                  </div>
                  <h4 className="text-2xl font-bold text-white">Muito bem!</h4>
                  <p className="text-purple-200">
                    5 ciclos completos. Como te sentes agora?
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setRespiracaoFase('preparar');
                        setRespiracaoCiclo(0);
                      }}
                      className="px-6 py-3 bg-white/20 text-white rounded-full"
                    >
                      Repetir
                    </button>
                    <button
                      onClick={() => setFerramentaActiva(null)}
                      className="px-6 py-3 bg-purple-600 text-white rounded-full"
                    >
                      Continuar →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FERRAMENTA: AFIRMAÇÕES */}
          {ferramentaActiva === 'afirmacoes' && (
            <div className="py-8">
              <button
                onClick={() => setFerramentaActiva(null)}
                className="text-purple-300 hover:text-white mb-6 inline-block"
              >
                ← Voltar às ferramentas
              </button>

              <h3 className="text-2xl font-bold text-white text-center mb-6">
                💭 Palavras para Ti
              </h3>

              <div className="space-y-4">
                {afirmacoesPorEstado[estadoSelecionado]?.map((afirmacao, index) => (
                  <div 
                    key={index}
                    className="p-5 bg-white/10 rounded-2xl border border-white/20"
                  >
                    <p className="text-white text-lg text-center italic">
                      "{afirmacao}"
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setFerramentaActiva(null)}
                className="w-full mt-6 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-semibold"
              >
                Continuar →
              </button>
            </div>
          )}

          {/* FERRAMENTA: ESCRITA LIVRE */}
          {ferramentaActiva === 'escrita' && (
            <div className="py-8">
              <button
                onClick={() => setFerramentaActiva(null)}
                className="text-purple-300 hover:text-white mb-6 inline-block"
              >
                ← Voltar às ferramentas
              </button>

              <h3 className="text-2xl font-bold text-white text-center mb-2">
                ✍️ Desabafa Aqui
              </h3>
              <p className="text-purple-300 text-center mb-6">
                Escreve o que quiseres. Sem filtro. Sem julgamento.
              </p>

              <textarea
                value={escritaLivre}
                onChange={(e) => setEscritaLivre(e.target.value)}
                placeholder="Estou a sentir..."
                rows={8}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 resize-none"
              />

              <p className="text-purple-400 text-sm mt-2 mb-6">
                Isto é só para ti. Podes guardar ou não.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setFerramentaActiva(null)}
                  className="flex-1 py-4 bg-white/20 text-white rounded-2xl font-semibold"
                >
                  Não guardar
                </button>
                <button
                  onClick={guardarMomento}
                  disabled={loading}
                  className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-semibold"
                >
                  {loading ? '...' : '💜 Guardar'}
                </button>
              </div>
            </div>
          )}

          {/* FERRAMENTA: ALTERNATIVAS */}
          {ferramentaActiva === 'alternativas' && (
            <div className="py-8">
              <button
                onClick={() => setFerramentaActiva(null)}
                className="text-purple-300 hover:text-white mb-6 inline-block"
              >
                ← Voltar às ferramentas
              </button>

              <h3 className="text-2xl font-bold text-white text-center mb-2">
                🚶‍♀️ O Que Fazer em Vez de Comer
              </h3>
              <p className="text-purple-300 text-center mb-6">
                Escolhe uma. Só uma. Faz agora.
              </p>

              <div className="space-y-3">
                {alternativasPorEstado[estadoSelecionado]?.map((alternativa, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-white/10 rounded-xl border border-white/20 flex items-center gap-4"
                  >
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-white">{alternativa}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setFerramentaActiva(null)}
                className="w-full mt-6 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-semibold"
              >
                Vou fazer uma destas →
              </button>
            </div>
          )}

          {/* FERRAMENTA: TIMER */}
          {ferramentaActiva === 'timer' && (
            <div className="text-center py-8">
              <button
                onClick={() => {
                  setFerramentaActiva(null);
                  setTimerActivo(false);
                  setTempoRestante(600);
                }}
                className="text-purple-300 hover:text-white mb-6 inline-block"
              >
                ← Voltar às ferramentas
              </button>

              <h3 className="text-2xl font-bold text-white mb-2">
                ⏰ Pausa de 10 Minutos
              </h3>
              <p className="text-purple-300 mb-8">
                Antes de comer, espera. Muitas vezes o impulso passa.
              </p>

              <div className="w-48 h-48 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-6">
                <span className="text-5xl font-bold text-white font-mono">
                  {formatarTempo(tempoRestante)}
                </span>
              </div>

              {tempoRestante > 0 ? (
                <>
                  <p className="text-purple-200 mb-6">
                    Respira. Bebe água. Distrai-te.<br/>
                    Se depois ainda quiseres comer, come sem culpa.
                  </p>
                  
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setTimerActivo(!timerActivo)}
                      className="px-6 py-3 bg-white/20 text-white rounded-full"
                    >
                      {timerActivo ? 'Pausar' : 'Retomar'}
                    </button>
                    <button
                      onClick={() => setFerramentaActiva(null)}
                      className="px-6 py-3 bg-purple-600 text-white rounded-full"
                    >
                      Não preciso mais
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto rounded-full bg-green-500/30 flex items-center justify-center mb-4">
                    <span className="text-4xl">✨</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">10 minutos passaram!</h4>
                  <p className="text-purple-200 mb-6">
                    Como te sentes agora? Ainda precisas de comer?
                  </p>
                  <button
                    onClick={guardarMomento}
                    className="px-8 py-4 bg-purple-600 text-white rounded-full font-semibold"
                  >
                    💜 Consegui! Guardar vitória
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ETAPA: SUCESSO
  if (etapa === 'sucesso') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="mb-6 animate-bounce">
            <img
              src="/logos/VITALIS_LOGO_V3.png"
              alt="Vitalis"
              className="w-24 h-24 mx-auto object-contain drop-shadow-lg"
            />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Momento Guardado
          </h2>
          
          <p className="text-purple-200 text-lg mb-6">
            Cada vez que vens aqui, estás a fazer trabalho profundo.<br/>
            Estou orgulhosa de ti. 🌱
          </p>

          <div className="bg-white/10 rounded-2xl p-5 mb-8 border border-white/20">
            <p className="text-purple-100">
              <strong>Lembra-te:</strong> A transformação não é só física.<br/>
              É reconhecer padrões, pausar, e escolher diferente.
            </p>
          </div>

          {/* Sugestão SERENA — aparece quando usa o espaço emocional 3+ vezes */}
          {mostrarSugestaoSerena && (
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-5 mb-6 border border-blue-300/30">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">💧</span>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">
                    Queres trabalhar as emoções mais a fundo?
                  </h4>
                  <p className="text-blue-200 text-sm mb-3">
                    O <strong>SERENA</strong> é o nosso espaço dedicado à fluidez emocional — com diário de emoções,
                    técnicas de respiração avançadas, rituais de libertação e muito mais.
                    Perfeito para quem quer entender por que come por emoção.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('/serena')}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-colors active:scale-95"
                    >
                      Conhecer o SERENA
                    </button>
                    <button
                      onClick={fecharSugestaoSerena}
                      className="px-4 py-2 text-blue-300 hover:text-white text-sm transition-colors"
                    >
                      Agora não
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/vitalis/dashboard')}
            className="w-full py-4 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-semibold transition-all"
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default EspacoRetorno;
