import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * ÁUREA - ChatBot de Auto-Valor
 * Persona: Coach gentil que ajuda a quebrar padrões de culpa
 * e reconhecer o direito de existir para si mesma
 */

const PERSONA_AUREA = {
  nome: 'Esmeralda',
  papel: 'Coach de Auto-Valor',
  estilo: 'Gentil, acolhedora, sem julgamento. Valida sentimentos mas questiona crenças limitantes.',
  frases_inicio: [
    'Olá, querida. Como estás hoje? Há algo que queiras partilhar?',
    'Bem-vinda. Este é o teu espaço. O que te trouxe aqui hoje?',
    'Que bom ver-te. Como te sentes neste momento?'
  ],
  emojis: ['💛', '✨', '🌟', '💫', '🌸']
};

const RESPOSTAS_CONTEXTUAIS = {
  culpa: {
    keywords: ['culpa', 'culpada', 'egoísta', 'não mereço', 'não devia', 'mal por', 'remorso'],
    respostas: [
      'Ouço que há culpa nessas palavras. Posso perguntar: de onde vem essa voz que diz que não deves?',
      'A culpa é uma visitante frequente, não é? Mas ela não é dona da verdade. O que precisaste fazer por ti que gerou essa sensação?',
      'Cuidar de ti não é egoísmo. É responsabilidade. O que aconteceria se te tratasses como tratarias uma amiga querida?',
      'Essa culpa... protege-te de quê? Às vezes a culpa é um hábito antigo, não uma verdade.'
    ]
  },
  merecimento: {
    keywords: ['mereço', 'merecimento', 'merecer', 'não sou digna', 'não valho', 'outros merecem mais'],
    respostas: [
      'Quem decidiu que não mereces? Essa não é uma verdade universal - é uma crença que aprendeste.',
      'Mereces porque existes. Não há condições a cumprir. Quais são as "condições" que colocas a ti mesma?',
      'Se a tua filha ou melhor amiga dissesse isso, o que lhe dirias? Diz isso a ti mesma agora.',
      'O merecimento não se ganha. É um direito de nascença que te ensinaram a questionar.'
    ]
  },
  tempo: {
    keywords: ['tempo para mim', 'não tenho tempo', 'ocupada', 'sempre a correr', 'primeiro os outros'],
    respostas: [
      'Quando dizes "não tenho tempo", o que estás realmente a dizer é que não és prioridade. Isso pode mudar.',
      '10 minutos. Só 10. Consegues encontrá-los amanhã? O que farias nesses 10 minutos só teus?',
      'Os outros sobrevivem quando não estás disponível. A questão é: consegues permitir-te não estar sempre disponível?',
      'O tempo para ti não aparece - cria-se. Que tarefa podes delegar ou adiar esta semana?'
    ]
  },
  dinheiro: {
    keywords: ['gastar', 'dinheiro', 'caro', 'luxo', 'despesa', 'não posso', 'outros precisam mais'],
    respostas: [
      'Quanto do teu dinheiro vai para ti vs. para os outros? Não há certo ou errado, só curiosidade.',
      'Investir em ti não é luxo. É manutenção básica. O que comprarias para ti se não houvesse culpa?',
      'Quando gastas com os outros, sentes-te bem. Por que é diferente contigo?',
      'O dinheiro que guardas "para emergências" - e se a emergência for a tua felicidade?'
    ]
  },
  roupa: {
    keywords: ['roupa', 'vestir', 'armário', 'peças guardadas', 'ocasião especial', 'não uso'],
    respostas: [
      'Essas peças bonitas guardadas... estão à espera de quê? A tua vida diária É a ocasião.',
      'Vestires-te bem não é vaidade. É presença. É dizeres "eu existo e mereço ser vista".',
      'Quantas peças tens no armário que "nunca usas"? O que te impede de as usar hoje?',
      'A roupa que usamos comunica como nos vemos. O que a tua roupa de hoje diz sobre ti?'
    ]
  },
  prazer: {
    keywords: ['prazer', 'mimo', 'descanso', 'relaxar', 'gostar', 'desejo'],
    respostas: [
      'O prazer não é recompensa por trabalho. É nutrição básica. O que te daria prazer agora?',
      'Quando foi a última vez que fizeste algo só porque te apetecia? Sem função, sem resultado?',
      'O teu corpo sabe do que precisa. Consegues ouvi-lo sem julgamento?',
      'Permitir-te prazer não tira nada a ninguém. Pelo contrário - enche o teu copo.'
    ]
  },
  geral: {
    respostas: [
      'Conta-me mais sobre isso. Como é que isso te faz sentir?',
      'Estou aqui a ouvir. Não há pressa.',
      'O que precisas neste momento? Desabafar, conselho, ou só companhia?',
      'Isso que sentes é válido. Não precisas de justificar.',
      'E se olhasses para isso com curiosidade em vez de julgamento?'
    ]
  }
};

export default function ChatAurea() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/aurea/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (userData) {
        setUserId(userData.id);

        // Load conversation history
        const { data: chatHistory } = await supabase
          .from('aurea_chat_messages')
          .select('*')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: true })
          .limit(50);

        if (chatHistory && chatHistory.length > 0) {
          setMessages(chatHistory.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.created_at
          })));
        } else {
          // First message from coach
          const welcomeMessage = PERSONA_AUREA.frases_inicio[Math.floor(Math.random() * PERSONA_AUREA.frases_inicio.length)];
          const msg = {
            role: 'assistant',
            content: welcomeMessage,
            timestamp: new Date().toISOString()
          };
          setMessages([msg]);
          await saveMessage(userData.id, msg);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveMessage = async (uid, message) => {
    try {
      await supabase.from('aurea_chat_messages').insert({
        user_id: uid,
        role: message.role,
        content: message.content,
        created_at: message.timestamp || new Date().toISOString()
      });
    } catch (err) {
      console.error('Erro ao guardar mensagem:', err);
    }
  };

  const getContextualResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    // Check each context for keywords
    for (const [context, data] of Object.entries(RESPOSTAS_CONTEXTUAIS)) {
      if (context === 'geral') continue;

      const hasKeyword = data.keywords.some(keyword => lowerMessage.includes(keyword));
      if (hasKeyword) {
        const responses = data.respostas;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }

    // Default to general responses
    const general = RESPOSTAS_CONTEXTUAIS.geral.respostas;
    return general[Math.floor(Math.random() * general.length)];
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Save user message
    await saveMessage(userId, userMessage);

    // Simulate typing delay
    const typingDelay = 1000 + Math.random() * 2000;

    setTimeout(async () => {
      const response = getContextualResponse(userMessage.content);

      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      // Save assistant message
      await saveMessage(userId, assistantMessage);

      // Log interaction for pattern analysis
      await logChatInteraction(userMessage.content);
    }, typingDelay);
  };

  const logChatInteraction = async (content) => {
    try {
      // Detect themes for pattern analysis
      const themes = [];
      const lowerContent = content.toLowerCase();

      if (lowerContent.includes('culpa') || lowerContent.includes('egoísta')) themes.push('culpa');
      if (lowerContent.includes('mereço') || lowerContent.includes('não valho')) themes.push('merecimento');
      if (lowerContent.includes('tempo') || lowerContent.includes('ocupada')) themes.push('tempo');
      if (lowerContent.includes('dinheiro') || lowerContent.includes('gastar')) themes.push('dinheiro');
      if (lowerContent.includes('roupa') || lowerContent.includes('vestir')) themes.push('roupa');
      if (lowerContent.includes('prazer') || lowerContent.includes('mimo')) themes.push('prazer');

      if (themes.length > 0) {
        await supabase.from('aurea_chat_themes').insert({
          user_id: userId,
          themes: themes,
          created_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Erro ao registar temas:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
      {/* Header */}
      <header className="px-4 py-4 border-b border-amber-500/20 bg-[#2D2A24]/95 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link to="/aurea/dashboard" className="text-amber-200/60 hover:text-amber-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-lg">💛</span>
            </div>
            <div>
              <h1 className="text-amber-100 font-bold">{PERSONA_AUREA.nome}</h1>
              <p className="text-amber-200/60 text-xs">{PERSONA_AUREA.papel}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-amber-500/20 border border-amber-500/30 text-amber-100'
                  : 'bg-white/10 border border-amber-500/20 text-amber-200'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className="text-[10px] text-amber-200/40 mt-2">
                {new Date(msg.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-amber-500/20 p-4 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-amber-500/20 bg-[#2D2A24]/95 backdrop-blur-sm">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escreve aqui o que sentes..."
            rows={1}
            className="flex-1 px-4 py-3 bg-white/10 border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-amber-400 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl disabled:opacity-50 hover:from-amber-600 hover:to-amber-700 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-amber-200/40 text-xs text-center mt-2">
          Este é um espaço seguro. Partilha ao teu ritmo.
        </p>
      </div>
    </div>
  );
}
