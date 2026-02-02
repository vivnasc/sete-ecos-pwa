import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';

// Respostas automáticas da coach (simulação IA)
const RESPOSTAS_AUTOMATICAS = {
  saudacao: [
    'Olá! Como posso ajudar-te hoje? 💚',
    'Bom dia! Estou aqui para te apoiar na tua jornada! 🌱',
    'Olá querida! Como te sentes hoje? 😊'
  ],
  motivacao: [
    'Estás a fazer um excelente trabalho! Cada pequeno passo conta. 💪',
    'Lembra-te: o progresso não é linear, mas a consistência é a chave! 🌟',
    'Tu és mais forte do que pensas. Continua! 🔥',
    'Cada dia é uma nova oportunidade para te aproximares dos teus objetivos! ✨'
  ],
  duvida_refeicao: [
    'Para as refeições, foca-te primeiro nas proteínas, depois nos vegetais, e por fim nos hidratos. 🥗',
    'Tenta fazer refeições coloridas - quanto mais cores, mais nutrientes! 🌈',
    'Se tiveres fome entre refeições, opta por snacks com proteína como iogurte ou frutos secos. 🥜'
  ],
  duvida_treino: [
    'O ideal é treinar 3-4x por semana, alternando os grupos musculares. 💪',
    'Não te esqueças do aquecimento antes e alongamentos depois! 🧘‍♀️',
    'Ouve o teu corpo - descanso também é parte do treino! 😴'
  ],
  duvida_agua: [
    'Tenta beber pelo menos 2L de água por dia. Usa a app para registar! 💧',
    'Uma dica: bebe um copo de água ao acordar e antes de cada refeição. 🥤',
    'Se esqueces de beber água, configura lembretes na app! 🔔'
  ],
  ajuda_geral: [
    'Conta-me mais sobre a tua dúvida para eu poder ajudar melhor! 🤗',
    'Estou aqui para te ajudar. O que precisas saber? 💚',
    'Diz-me o que te preocupa e vamos resolver juntas! 🌱'
  ]
};

// Detectar intenção da mensagem
const detectarIntencao = (mensagem) => {
  const texto = mensagem.toLowerCase();

  if (texto.match(/ol[aá]|bom dia|boa tarde|boa noite|oi/)) return 'saudacao';
  if (texto.match(/motiva|desanima|difícil|dific|cansar|desistir|ajuda/)) return 'motivacao';
  if (texto.match(/comer|refeic|comida|fome|alimento|macro|proteina|hidrato/)) return 'duvida_refeicao';
  if (texto.match(/treino|exerc|muscula|ginás|gym|correr/)) return 'duvida_treino';
  if (texto.match(/água|agua|beber|hidrat|sede/)) return 'duvida_agua';
  return 'ajuda_geral';
};

const getRespostaAutomatica = (intencao) => {
  const respostas = RESPOSTAS_AUTOMATICAS[intencao] || RESPOSTAS_AUTOMATICAS.ajuda_geral;
  return respostas[Math.floor(Math.random() * respostas.length)];
};

export default function ChatCoach() {
  const [loading, setLoading] = useState(true);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [userId, setUserId] = useState(null);
  const [client, setClient] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChat = async () => {
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

      const { data: clientData } = await supabase
        .from('vitalis_clients')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (clientData) setClient(clientData);

      // Carregar mensagens do localStorage (ou BD futuramente)
      const msgsSalvas = JSON.parse(localStorage.getItem(`vitalis-chat-${userData.id}`) || '[]');

      if (msgsSalvas.length === 0) {
        // Mensagem de boas-vindas
        const boasVindas = {
          id: Date.now(),
          texto: `Olá ${clientData?.nome_completo?.split(' ')[0] || 'querida'}! 👋\n\nSou a tua coach virtual Vitalis. Estou aqui para te ajudar com dúvidas sobre alimentação, treino, ou simplesmente para te motivar!\n\nComo posso ajudar-te hoje? 💚`,
          remetente: 'coach',
          timestamp: new Date().toISOString()
        };
        setMensagens([boasVindas]);
      } else {
        setMensagens(msgsSalvas);
      }

    } catch (error) {
      console.error('Erro ao carregar chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || enviando) return;

    setEnviando(true);
    const msgUser = {
      id: Date.now(),
      texto: novaMensagem,
      remetente: 'user',
      timestamp: new Date().toISOString()
    };

    const novasMsgs = [...mensagens, msgUser];
    setMensagens(novasMsgs);
    setNovaMensagem('');

    // Simular resposta da coach (com delay para parecer natural)
    setTimeout(() => {
      const intencao = detectarIntencao(novaMensagem);
      const resposta = getRespostaAutomatica(intencao);

      const msgCoach = {
        id: Date.now() + 1,
        texto: resposta,
        remetente: 'coach',
        timestamp: new Date().toISOString()
      };

      const msgsFinais = [...novasMsgs, msgCoach];
      setMensagens(msgsFinais);

      // Guardar no localStorage
      localStorage.setItem(`vitalis-chat-${userId}`, JSON.stringify(msgsFinais));
      setEnviando(false);
    }, 1000 + Math.random() * 1000);
  };

  const formatarHora = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarData = (timestamp) => {
    const data = new Date(timestamp);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    if (data.toDateString() === hoje.toDateString()) return 'Hoje';
    if (data.toDateString() === ontem.toDateString()) return 'Ontem';
    return data.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
  };

  // Agrupar mensagens por data
  const mensagensAgrupadas = mensagens.reduce((acc, msg) => {
    const data = formatarData(msg.timestamp);
    if (!acc[data]) acc[data] = [];
    acc[data].push(msg);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">💬</div>
          <p className="text-[#6B5C4C]">A carregar chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E4DC] flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/vitalis/dashboard" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              ←
            </Link>
            <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-2xl">
              👩‍⚕️
            </div>
            <div className="flex-1">
              <h1 className="font-bold">Coach Vitalis</h1>
              <p className="text-white/70 text-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Online
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Mensagens */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {Object.entries(mensagensAgrupadas).map(([data, msgs]) => (
            <div key={data}>
              {/* Separador de data */}
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 bg-white/80 rounded-full text-xs text-gray-500">
                  {data}
                </span>
              </div>

              {/* Mensagens do dia */}
              {msgs.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.remetente === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.remetente === 'user'
                        ? 'bg-[#7C8B6F] text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md shadow'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.texto}</p>
                    <p className={`text-xs mt-1 ${
                      msg.remetente === 'user' ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {formatarHora(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {enviando && (
            <div className="flex justify-start mb-3">
              <div className="bg-white rounded-2xl px-4 py-3 shadow rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Respostas Rápidas */}
      <div className="bg-white/50 px-4 py-2 overflow-x-auto">
        <div className="max-w-2xl mx-auto flex gap-2">
          {[
            { texto: 'Preciso de motivação', emoji: '💪' },
            { texto: 'Dúvida sobre refeições', emoji: '🍽️' },
            { texto: 'Como beber mais água?', emoji: '💧' },
            { texto: 'Dicas de treino', emoji: '🏃‍♀️' }
          ].map((quick, i) => (
            <button
              key={i}
              onClick={() => setNovaMensagem(quick.texto)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap shadow-sm"
            >
              <span>{quick.emoji}</span>
              <span>{quick.texto}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
            placeholder="Escreve a tua mensagem..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
          />
          <button
            onClick={enviarMensagem}
            disabled={!novaMensagem.trim() || enviando}
            className="w-12 h-12 bg-[#7C8B6F] text-white rounded-full flex items-center justify-center hover:bg-[#6B7A5D] transition-colors disabled:opacity-50"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
