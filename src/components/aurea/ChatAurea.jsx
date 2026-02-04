import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * ÁUREA - ChatBot Proactivo de Auto-Valor
 * Persona: Esmeralda - Coach gentil que INICIA conversas,
 * detecta padrões e oferece insights personalizados
 */

const PERSONA_AUREA = {
  nome: 'Esmeralda',
  papel: 'Coach de Auto-Valor',
  estilo: 'Gentil, acolhedora, proactiva. Inicia conversas, faz perguntas, oferece insights.',
  avatar: '💛'
};

// Saudações baseadas no contexto
const SAUDACOES_PROACTIVAS = {
  manha: {
    primeira_vez: 'Bom dia, querida! Sou a Esmeralda, a tua companheira nesta jornada de auto-valor. Estou aqui para te ajudar a reconhecer o teu direito de existir para ti mesma. Como te sentes esta manhã?',
    retorno_recente: 'Bom dia! Que bom ver-te de novo. Como acordaste hoje?',
    retorno_dias: (dias) => `Bom dia, querida. Passaram ${dias} dias desde a nossa última conversa. Senti a tua falta. Como tens estado?`,
    retorno_semana: 'Bom dia! Já passou uma semana... Tudo bem contigo? Estou aqui quando precisares.'
  },
  tarde: {
    primeira_vez: 'Boa tarde! Sou a Esmeralda, e estou aqui para te acompanhar. Este é um espaço só teu, sem julgamentos. O que te trouxe aqui hoje?',
    retorno_recente: 'Boa tarde! Como está a correr o teu dia?',
    retorno_dias: (dias) => `Boa tarde! ${dias} dias sem nos falarmos. Aconteceu alguma coisa? Estou aqui para ti.`,
    retorno_semana: 'Boa tarde, querida. Já faz uma semana... Quero saber como estás.'
  },
  noite: {
    primeira_vez: 'Boa noite! Sou a Esmeralda. Às vezes a noite é o melhor momento para reflexão. Posso fazer-te companhia?',
    retorno_recente: 'Boa noite! Como foi o teu dia? Fizeste algo por ti hoje?',
    retorno_dias: (dias) => `Boa noite, querida. ${dias} dias... Espero que tenhas estado a cuidar de ti. Conta-me.`,
    retorno_semana: 'Boa noite. Senti a tua falta esta semana. Como te sentes agora?'
  }
};

// Mensagens proactivas baseadas em padrões detectados
const MENSAGENS_PROACTIVAS = {
  sem_praticas: {
    titulo: 'Momento de reflexão',
    mensagem: 'Reparei que ainda não registaste nenhuma prática de auto-cuidado recentemente. Lembra-te: pequenos gestos contam. O que poderias fazer hoje só para ti?',
    accao: 'Quero sugestões'
  },
  padrao_culpa: {
    titulo: 'Padrão identificado',
    mensagem: 'Nas nossas conversas, a culpa aparece com frequência. Quero falar sobre isso contigo - sem julgamento, só com curiosidade.',
    accao: 'Vamos conversar'
  },
  quota_baixa: {
    titulo: 'Investimento em ti',
    mensagem: 'O teu orçamento para ti mesma está quase intacto. Não é egoísmo investir em ti - é manutenção básica. Posso ajudar-te?',
    accao: 'Como posso começar?'
  },
  roupa_guardada: {
    titulo: 'Armário de possibilidades',
    mensagem: 'Tens peças bonitas guardadas para "ocasiões especiais"? A tua vida diária É especial. Que tal usares hoje algo que te faz sentir bem?',
    accao: 'Quero reflectir sobre isso'
  },
  dias_ausente: {
    titulo: 'Senti a tua falta',
    mensagem: 'Há alguns dias que não nos falamos. Espero que estejas bem. Lembra-te: este espaço é teu, sem pressões.',
    accao: 'Estou aqui'
  },
  conquista: {
    titulo: 'Celebração!',
    mensagem: 'Vi que registaste uma prática de auto-cuidado! Isso merece ser reconhecido. Como te sentiste?',
    accao: 'Quero partilhar'
  }
};

// Perguntas proactivas para iniciar conversa
const PERGUNTAS_PROACTIVAS = [
  {
    tema: 'tempo',
    pergunta: 'Hoje dedicaste algum momento só a ti? Mesmo que pequeno?',
    followUp: 'E como te sentiste durante esse momento?'
  },
  {
    tema: 'roupa',
    pergunta: 'Que roupa escolheste hoje? Foi algo que te faz sentir bem ou foi "qualquer coisa"?',
    followUp: 'O que te impede de te vestires todos os dias como se fosses a ocasião especial?'
  },
  {
    tema: 'dinheiro',
    pergunta: 'Gastaste algum dinheiro contigo hoje? Um café, um mimo, algo só teu?',
    followUp: 'Se sentiste culpa, de onde achas que ela vem?'
  },
  {
    tema: 'prazer',
    pergunta: 'O que te deu prazer hoje? Não precisa ser grande - pode ser um aroma, uma música, um momento de silêncio.',
    followUp: 'Consegues permitir-te esses momentos sem culpa?'
  },
  {
    tema: 'prioridades',
    pergunta: 'Se tivesses de ordenar as tuas prioridades de hoje, em que posição estarias tu?',
    followUp: 'O que precisaria de mudar para subires um lugar nessa lista?'
  },
  {
    tema: 'reflexao',
    pergunta: 'Se a tua melhor amiga se tratasse como tu te tratas, o que lhe dirias?',
    followUp: 'Consegues dizer isso a ti mesma agora?'
  }
];

// Quick suggestions baseadas no contexto
const SUGESTOES_RAPIDAS = [
  { texto: 'Sinto-me culpada', tema: 'culpa' },
  { texto: 'Não tenho tempo para mim', tema: 'tempo' },
  { texto: 'Gastei dinheiro comigo', tema: 'dinheiro' },
  { texto: 'Preciso de um mimo', tema: 'prazer' },
  { texto: 'Vesti-me bem hoje', tema: 'roupa' },
  { texto: 'Quero desabafar', tema: 'geral' }
];

const RESPOSTAS_CONTEXTUAIS = {
  culpa: {
    keywords: ['culpa', 'culpada', 'egoísta', 'não mereço', 'não devia', 'mal por', 'remorso'],
    respostas: [
      'Ouço que há culpa nessas palavras. Posso perguntar: de onde vem essa voz que diz que não deves?',
      'A culpa é uma visitante frequente, não é? Mas ela não é dona da verdade. O que precisaste fazer por ti que gerou essa sensação?',
      'Cuidar de ti não é egoísmo. É responsabilidade. O que aconteceria se te tratasses como tratarias uma amiga querida?',
      'Essa culpa... protege-te de quê? Às vezes a culpa é um hábito antigo, não uma verdade.'
    ],
    followUp: 'Quero entender melhor: quando começaste a sentir que cuidar de ti era algo mau?'
  },
  merecimento: {
    keywords: ['mereço', 'merecimento', 'merecer', 'não sou digna', 'não valho', 'outros merecem mais'],
    respostas: [
      'Quem decidiu que não mereces? Essa não é uma verdade universal - é uma crença que aprendeste.',
      'Mereces porque existes. Não há condições a cumprir. Quais são as "condições" que colocas a ti mesma?',
      'Se a tua filha ou melhor amiga dissesse isso, o que lhe dirias? Diz isso a ti mesma agora.',
      'O merecimento não se ganha. É um direito de nascença que te ensinaram a questionar.'
    ],
    followUp: 'Posso fazer-te um desafio? Amanhã, faz uma coisa só porque mereces - sem justificar.'
  },
  tempo: {
    keywords: ['tempo para mim', 'não tenho tempo', 'ocupada', 'sempre a correr', 'primeiro os outros'],
    respostas: [
      'Quando dizes "não tenho tempo", o que estás realmente a dizer é que não és prioridade. Isso pode mudar.',
      '10 minutos. Só 10. Consegues encontrá-los amanhã? O que farias nesses 10 minutos só teus?',
      'Os outros sobrevivem quando não estás disponível. A questão é: consegues permitir-te não estar sempre disponível?',
      'O tempo para ti não aparece - cria-se. Que tarefa podes delegar ou adiar esta semana?'
    ],
    followUp: 'Vamos fazer uma coisa: amanhã, reserva 15 minutos intransferíveis para ti. O que vais fazer?'
  },
  dinheiro: {
    keywords: ['gastar', 'dinheiro', 'caro', 'luxo', 'despesa', 'não posso', 'outros precisam mais'],
    respostas: [
      'Quanto do teu dinheiro vai para ti vs. para os outros? Não há certo ou errado, só curiosidade.',
      'Investir em ti não é luxo. É manutenção básica. O que comprarias para ti se não houvesse culpa?',
      'Quando gastas com os outros, sentes-te bem. Por que é diferente contigo?',
      'O dinheiro que guardas "para emergências" - e se a emergência for a tua felicidade?'
    ],
    followUp: 'Esta semana, desafio-te a gastar algo contigo - mesmo que pequeno. Depois conta-me como te sentiste.'
  },
  roupa: {
    keywords: ['roupa', 'vestir', 'armário', 'peças guardadas', 'ocasião especial', 'não uso'],
    respostas: [
      'Essas peças bonitas guardadas... estão à espera de quê? A tua vida diária É a ocasião.',
      'Vestires-te bem não é vaidade. É presença. É dizeres "eu existo e mereço ser vista".',
      'Quantas peças tens no armário que "nunca usas"? O que te impede de as usar hoje?',
      'A roupa que usamos comunica como nos vemos. O que a tua roupa de hoje diz sobre ti?'
    ],
    followUp: 'Amanhã, veste algo que normalmente "guardas". Não precisa haver razão. Tu és a razão.'
  },
  prazer: {
    keywords: ['prazer', 'mimo', 'descanso', 'relaxar', 'gostar', 'desejo'],
    respostas: [
      'O prazer não é recompensa por trabalho. É nutrição básica. O que te daria prazer agora?',
      'Quando foi a última vez que fizeste algo só porque te apetecia? Sem função, sem resultado?',
      'O teu corpo sabe do que precisa. Consegues ouvi-lo sem julgamento?',
      'Permitir-te prazer não tira nada a ninguém. Pelo contrário - enche o teu copo.'
    ],
    followUp: 'Vamos praticar: diz-me três coisas que te dão prazer. Não julgues, só lista.'
  },
  positivo: {
    keywords: ['fiz por mim', 'consegui', 'bem', 'feliz', 'contente', 'orgulho', 'vesti-me bem'],
    respostas: [
      'Isso é lindo! Estou orgulhosa de ti. Como te sentiste ao fazer isso por ti?',
      'Sim! Isso é auto-cuidado em acção. Nota como o teu corpo responde quando te priorizas.',
      'Celebra esse momento. Não é pequeno - é revolucionário mudar padrões.',
      'Maravilha! Guarda essa sensação. Da próxima vez que a culpa aparecer, lembra-te deste momento.'
    ],
    followUp: 'O que aprendeste sobre ti mesma com essa experiência?'
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
  const [userName, setUserName] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [proactiveCard, setProactiveCard] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [conversationContext, setConversationContext] = useState({
    lastTopic: null,
    messageCount: 0,
    shouldFollowUp: false
  });
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

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'manha';
    if (hour < 18) return 'tarde';
    return 'noite';
  };

  const getDaysSinceLastChat = (lastMessageDate) => {
    if (!lastMessageDate) return null;
    const now = new Date();
    const last = new Date(lastMessageDate);
    const diffTime = Math.abs(now - last);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const generateProactiveGreeting = async (userData, chatHistory) => {
    const timeOfDay = getTimeOfDay();
    const greetings = SAUDACOES_PROACTIVAS[timeOfDay];

    // First time user
    if (!chatHistory || chatHistory.length === 0) {
      return greetings.primeira_vez;
    }

    // Check last message date
    const lastMessage = chatHistory[chatHistory.length - 1];
    const daysSince = getDaysSinceLastChat(lastMessage.created_at);

    if (daysSince === 0) {
      // Same day - continue conversation proactively
      const randomQuestion = PERGUNTAS_PROACTIVAS[Math.floor(Math.random() * PERGUNTAS_PROACTIVAS.length)];
      return `${greetings.retorno_recente}\n\n${randomQuestion.pergunta}`;
    } else if (daysSince >= 7) {
      return greetings.retorno_semana;
    } else if (daysSince >= 2) {
      return greetings.retorno_dias(daysSince);
    }

    return greetings.retorno_recente;
  };

  const checkForProactiveCard = async (userId) => {
    try {
      // Check for patterns that warrant proactive messages
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Check practices count this week
      const { data: practices } = await supabase
        .from('aurea_practices')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', weekAgo);

      if (!practices || practices.length === 0) {
        setProactiveCard(MENSAGENS_PROACTIVAS.sem_praticas);
        return;
      }

      // Check chat themes for guilt pattern
      const { data: themes } = await supabase
        .from('aurea_chat_themes')
        .select('themes')
        .eq('user_id', userId)
        .gte('created_at', weekAgo);

      if (themes) {
        const allThemes = themes.flatMap(t => t.themes || []);
        const culpaCount = allThemes.filter(t => t === 'culpa').length;
        if (culpaCount >= 3) {
          setProactiveCard(MENSAGENS_PROACTIVAS.padrao_culpa);
          return;
        }
      }

      // Check recent positive action (celebration)
      const { data: recentPractice } = await supabase
        .from('aurea_practices')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', today)
        .limit(1);

      if (recentPractice && recentPractice.length > 0) {
        setProactiveCard(MENSAGENS_PROACTIVAS.conquista);
      }
    } catch (err) {
      console.warn('Erro ao verificar padrões:', err);
    }
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
        .select('id, name, email')
        .eq('auth_id', user.id)
        .single();

      if (userData) {
        setUserId(userData.id);
        setUserName(userData.name || userData.email?.split('@')[0] || '');

        // Load conversation history
        const { data: chatHistory } = await supabase
          .from('aurea_chat_messages')
          .select('*')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: true })
          .limit(50);

        // Check for proactive card
        await checkForProactiveCard(userData.id);

        if (chatHistory && chatHistory.length > 0) {
          // Check if last messages are from today
          const lastMessage = chatHistory[chatHistory.length - 1];
          const isToday = new Date(lastMessage.created_at).toDateString() === new Date().toDateString();

          setMessages(chatHistory.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.created_at
          })));

          // If not from today, add proactive greeting
          if (!isToday) {
            const greeting = await generateProactiveGreeting(userData, chatHistory);
            setTimeout(() => {
              addProactiveMessage(greeting, userData.id);
            }, 1000);
          }
        } else {
          // First time - welcome with proactive greeting
          const greeting = await generateProactiveGreeting(userData, null);
          setTimeout(() => {
            addProactiveMessage(greeting, userData.id);
          }, 500);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const addProactiveMessage = async (content, uid) => {
    setIsTyping(true);

    // Simulate typing
    await new Promise(r => setTimeout(r, 1500));

    const msg = {
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      isProactive: true
    };

    setMessages(prev => [...prev, msg]);
    setIsTyping(false);
    await saveMessage(uid, msg);
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

  const detectTopic = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    for (const [topic, data] of Object.entries(RESPOSTAS_CONTEXTUAIS)) {
      if (topic === 'geral') continue;

      const hasKeyword = data.keywords?.some(keyword => lowerMessage.includes(keyword));
      if (hasKeyword) {
        return topic;
      }
    }

    return 'geral';
  };

  const getContextualResponse = (userMessage, context) => {
    const topic = detectTopic(userMessage);
    const data = RESPOSTAS_CONTEXTUAIS[topic];

    // Update conversation context
    setConversationContext(prev => ({
      lastTopic: topic,
      messageCount: prev.messageCount + 1,
      shouldFollowUp: topic !== 'geral' && prev.messageCount % 3 === 2
    }));

    let response = data.respostas[Math.floor(Math.random() * data.respostas.length)];

    // Add follow-up question sometimes for deeper conversation
    if (context.shouldFollowUp && data.followUp) {
      response += `\n\n${data.followUp}`;
    }

    // Add encouragement for positive messages
    if (topic === 'positivo') {
      const emoji = PERSONA_AUREA.avatar;
      response = `${emoji} ${response}`;
    }

    return { response, topic };
  };

  const handleSend = async (messageText = null) => {
    const text = messageText || inputValue.trim();
    if (!text || isTyping) return;

    setShowSuggestions(false);

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Save user message
    await saveMessage(userId, userMessage);

    // Simulate typing delay (varies by response length)
    const typingDelay = 1200 + Math.random() * 1500;

    setTimeout(async () => {
      const { response, topic } = getContextualResponse(userMessage.content, conversationContext);

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
      await logChatInteraction(userMessage.content, topic);

      // Sometimes ask proactive follow-up after 2-3 exchanges
      if (conversationContext.messageCount > 0 && conversationContext.messageCount % 4 === 0) {
        setTimeout(() => {
          askProactiveFollowUp(topic);
        }, 3000);
      }
    }, typingDelay);
  };

  const askProactiveFollowUp = async (lastTopic) => {
    const followUps = PERGUNTAS_PROACTIVAS.filter(p => p.tema !== lastTopic);
    if (followUps.length === 0) return;

    const selected = followUps[Math.floor(Math.random() * followUps.length)];

    setIsTyping(true);
    await new Promise(r => setTimeout(r, 2000));

    const msg = {
      role: 'assistant',
      content: `Mudando de assunto... ${selected.pergunta}`,
      timestamp: new Date().toISOString(),
      isProactive: true
    };

    setMessages(prev => [...prev, msg]);
    setIsTyping(false);
    await saveMessage(userId, msg);
  };

  const handleProactiveCardAction = async () => {
    if (!proactiveCard) return;

    setProactiveCard(null);

    // Send user's response as if they clicked the action
    const userMessage = {
      role: 'user',
      content: proactiveCard.accao,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userId, userMessage);

    // Generate contextual response
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1500));

    let response = '';
    if (proactiveCard.titulo === 'Momento de reflexão') {
      response = 'Fico feliz que queiras sugestões! Algumas práticas simples: fazer uma pausa de 5 minutos com chá, usar uma peça de roupa que gostes, dizer "não" a algo que não te apetece. Qual destas te parece mais acessível hoje?';
    } else if (proactiveCard.titulo === 'Padrão identificado') {
      response = 'Obrigada por abrires esse espaço. A culpa é algo que muitas mulheres carregam. Posso perguntar: de quem herdaste essa voz que te diz que não deves cuidar de ti?';
    } else if (proactiveCard.titulo === 'Celebração!') {
      response = 'Conta-me tudo! O que fizeste por ti? E mais importante: como te sentiste ao fazê-lo?';
    } else {
      response = 'Estou aqui para te ajudar. Por onde queres começar?';
    }

    const assistantMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
    await saveMessage(userId, assistantMessage);
  };

  const logChatInteraction = async (content, detectedTopic) => {
    try {
      const themes = [];
      const lowerContent = content.toLowerCase();

      if (lowerContent.includes('culpa') || lowerContent.includes('egoísta')) themes.push('culpa');
      if (lowerContent.includes('mereço') || lowerContent.includes('não valho')) themes.push('merecimento');
      if (lowerContent.includes('tempo') || lowerContent.includes('ocupada')) themes.push('tempo');
      if (lowerContent.includes('dinheiro') || lowerContent.includes('gastar')) themes.push('dinheiro');
      if (lowerContent.includes('roupa') || lowerContent.includes('vestir')) themes.push('roupa');
      if (lowerContent.includes('prazer') || lowerContent.includes('mimo')) themes.push('prazer');

      // Add detected topic if not already included
      if (detectedTopic && detectedTopic !== 'geral' && !themes.includes(detectedTopic)) {
        themes.push(detectedTopic);
      }

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

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion.texto);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center animate-pulse">
            <span className="text-2xl">💛</span>
          </div>
          <p className="text-amber-200/60">A Esmeralda está a chegar...</p>
        </div>
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
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-xl">💛</span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#2D2A24]"></div>
            </div>
            <div>
              <h1 className="text-amber-100 font-bold text-lg">{PERSONA_AUREA.nome}</h1>
              <p className="text-green-400 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                Online agora
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Proactive Card */}
      {proactiveCard && (
        <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">✨</span>
            </div>
            <div className="flex-1">
              <h3 className="text-amber-100 font-semibold text-sm">{proactiveCard.titulo}</h3>
              <p className="text-amber-200/80 text-sm mt-1">{proactiveCard.mensagem}</p>
              <button
                onClick={handleProactiveCardAction}
                className="mt-3 px-4 py-2 bg-amber-500/30 hover:bg-amber-500/50 text-amber-100 text-sm rounded-lg transition-colors"
              >
                {proactiveCard.accao}
              </button>
            </div>
            <button
              onClick={() => setProactiveCard(null)}
              className="text-amber-200/40 hover:text-amber-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mr-2 flex-shrink-0">
                <span className="text-sm">💛</span>
              </div>
            )}
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-amber-500/30 border border-amber-500/40 text-amber-100 rounded-br-md'
                  : 'bg-white/10 border border-amber-500/20 text-amber-200 rounded-bl-md'
              } ${msg.isProactive ? 'ring-1 ring-amber-400/30' : ''}`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className="text-[10px] text-amber-200/40 mt-2 text-right">
                {new Date(msg.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-sm">💛</span>
            </div>
            <div className="bg-white/10 border border-amber-500/20 p-4 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-2">
                <p className="text-amber-200/60 text-sm">Esmeralda está a escrever</p>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {showSuggestions && messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-amber-200/40 text-xs mb-2">Sugestões para começar:</p>
          <div className="flex flex-wrap gap-2">
            {SUGESTOES_RAPIDAS.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-200 text-xs hover:bg-amber-500/20 transition-colors"
              >
                {suggestion.texto}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-4 border-t border-amber-500/20 bg-[#2D2A24]/95 backdrop-blur-sm">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escreve aqui..."
            rows={1}
            className="flex-1 px-4 py-3 bg-white/10 border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-amber-400 resize-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl disabled:opacity-50 hover:from-amber-600 hover:to-amber-700 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-amber-200/40 text-xs text-center mt-2">
          A Esmeralda ouve sem julgamento
        </p>
      </div>
    </div>
  );
}
