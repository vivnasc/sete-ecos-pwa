import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { g } from '../../utils/genero';

/**
 * ÁUREA - ChatBot Coach Inteligente
 * Esmeralda: Coach que lê padrões, não repete frases,
 * extrai insights de cada resposta e guia a conversa
 */

const PERSONA = {
  nome: 'Esmeralda',
  papel: 'Coach de Auto-Valor'
};

// Sistema de tracking para evitar repetições
class ConversationMemory {
  constructor() {
    this.usedResponses = new Set();
    this.conversationTopics = [];
    this.emotionalState = null;
    this.identifiedPatterns = [];
    this.sessionInsights = [];
    this.questionDepth = 0;
  }

  markUsed(response) {
    // Hash simples para tracking
    const hash = response.substring(0, 50);
    this.usedResponses.add(hash);
  }

  wasUsed(response) {
    const hash = response.substring(0, 50);
    return this.usedResponses.has(hash);
  }

  addTopic(topic) {
    if (!this.conversationTopics.includes(topic)) {
      this.conversationTopics.push(topic);
    }
  }

  addPattern(pattern) {
    if (!this.identifiedPatterns.includes(pattern)) {
      this.identifiedPatterns.push(pattern);
    }
  }

  addInsight(insight) {
    this.sessionInsights.push(insight);
  }

  getTopicsCount() {
    return this.conversationTopics.length;
  }
}

// Análise profunda de mensagens
function analyzeMessage(message, memory) {
  const lower = message.toLowerCase();
  const analysis = {
    emotions: [],
    topics: [],
    patterns: [],
    intensity: 'medium',
    needsExploration: false,
    keyPhrases: [],
    questionType: null
  };

  // Detectar emoções
  const emotionMap = {
    tristeza: ['triste', 'chorar', 'lágrimas', 'pesado', 'vazio', 'sozinha'],
    culpa: ['culpa', 'culpada', 'egoísta', 'mal por', 'não devia', 'remorso', 'errada'],
    medo: ['medo', 'receio', 'assustad', 'nervos', 'ansiedad', 'preocupad'],
    raiva: ['raiva', 'irritad', 'farta', 'cansad', 'frustrad'],
    confusao: ['confus', 'não sei', 'perdida', 'não entendo', 'dúvida'],
    esperanca: ['espero', 'talvez', 'quero', 'gostava', 'sonho'],
    alegria: ['feliz', 'contente', 'bem', 'consegui', 'orgulho']
  };

  for (const [emotion, keywords] of Object.entries(emotionMap)) {
    if (keywords.some(k => lower.includes(k))) {
      analysis.emotions.push(emotion);
    }
  }

  // Detectar tópicos profundos
  const topicMap = {
    tempo: ['tempo', 'ocupada', 'correr', 'parar', 'momento'],
    dinheiro: ['dinheiro', 'gastar', 'comprar', 'caro', 'preço', 'pagar'],
    roupa: ['roupa', 'vestir', 'armário', 'peça', 'usar'],
    relacionamentos: ['marido', 'filhos', 'mãe', 'pai', 'família', 'amiga', 'chefe'],
    trabalho: ['trabalho', 'emprego', 'chefe', 'colegas', 'carreira'],
    corpo: ['corpo', 'peso', 'espelho', 'aparência', 'bonita', 'feia'],
    merecimento: ['mereço', 'merecer', 'digna', 'valho', 'valor'],
    passado: ['sempre foi', 'desde', 'criança', 'aprendi', 'ensinaram'],
    futuro: ['vai ser', 'nunca vou', 'um dia', 'quando'],
    prazer: ['prazer', 'gostar', 'querer', 'desejo', 'vontade']
  };

  for (const [topic, keywords] of Object.entries(topicMap)) {
    if (keywords.some(k => lower.includes(k))) {
      analysis.topics.push(topic);
      memory.addTopic(topic);
    }
  }

  // Detectar padrões comportamentais
  const patternIndicators = {
    auto_sabotagem: ['sempre que', 'toda vez', 'não consigo', 'acabo por'],
    comparacao: ['outras pessoas', 'os outros', 'ela consegue', 'toda gente'],
    perfeccionismo: ['perfeito', 'tudo certo', 'não pode falhar', 'tem de ser'],
    people_pleasing: ['agradar', 'não dizer não', 'todos felizes', 'o que vão pensar'],
    minimizacao: ['não é nada', 'exagero', 'há piores', 'não importa'],
    catastrofizacao: ['nunca', 'sempre', 'tudo', 'ninguém', 'impossível']
  };

  for (const [pattern, indicators] of Object.entries(patternIndicators)) {
    if (indicators.some(i => lower.includes(i))) {
      analysis.patterns.push(pattern);
      memory.addPattern(pattern);
    }
  }

  // Detectar intensidade emocional
  const intensityMarkers = {
    high: ['muito', 'demais', 'tanto', 'sempre', 'nunca', 'completamente', '!'],
    low: ['um pouco', 'talvez', 'às vezes', 'não sei bem']
  };

  if (intensityMarkers.high.some(m => lower.includes(m))) {
    analysis.intensity = 'high';
  } else if (intensityMarkers.low.some(m => lower.includes(m))) {
    analysis.intensity = 'low';
  }

  // Detectar se precisa de exploração
  const vaguePhrases = ['não sei', 'talvez', 'acho que', 'sei lá', 'confusa'];
  if (vaguePhrases.some(p => lower.includes(p))) {
    analysis.needsExploration = true;
  }

  // Extrair frases-chave para referência
  const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 10);
  analysis.keyPhrases = sentences.slice(0, 2).map(s => s.trim());

  return analysis;
}

// Gerar resposta inteligente baseada na análise
function generateCoachResponse(analysis, memory, messageHistory) {
  const { emotions, topics, patterns, intensity, needsExploration, keyPhrases } = analysis;

  let responses = [];
  let approach = 'exploration'; // exploration, validation, challenge, action

  // Determinar abordagem baseada no contexto
  if (emotions.includes('tristeza') || emotions.includes('medo')) {
    approach = 'validation';
  } else if (patterns.length > 0 && memory.questionDepth > 2) {
    approach = 'challenge';
  } else if (emotions.includes('esperanca') || emotions.includes('alegria')) {
    approach = 'action';
  }

  // ===== RESPOSTAS DE VALIDAÇÃO =====
  if (approach === 'validation') {
    responses = [
      `Ouvir-te dizer isso... sinto o peso dessas palavras. ${needsExploration ? 'Consegues dizer-me mais sobre o que estás a sentir?' : 'O que desencadeou esse sentimento?'}`,
      `O que sentes é real e válido. Não precisas de o justificar. ${keyPhrases[0] ? `Quando dizes "${keyPhrases[0]}", o que há por trás disso?` : 'Conta-me mais.'}`,
      `Estou aqui contigo neste momento. ${intensity === 'high' ? 'Parece intenso. Queres que exploremos isso ' + g('juntos', 'juntas') + '?' : 'O que precisas agora?'}`,
      `Obrigada por partilhares isso comigo. Há coragem em admitir o que sentes. O que te ajudaria neste momento?`
    ];
  }

  // ===== RESPOSTAS DE EXPLORAÇÃO =====
  if (approach === 'exploration') {
    // Exploração baseada em tópicos identificados
    if (topics.includes('culpa') || emotions.includes('culpa')) {
      responses = [
        `A culpa que descreves... de onde vem? Consegues lembrar-te da primeira vez que sentiste que cuidar de ti era errado?`,
        `Essa voz que te diz que não deves... é tua ou herdaste-a? De quem?`,
        `Se uma amiga te dissesse exactamente o que me estás a dizer, o que lhe dirias?`,
        `A culpa está a proteger-te de quê? Às vezes ela mascara-se de responsabilidade.`
      ];
    } else if (topics.includes('tempo')) {
      responses = [
        `Quando dizes que não tens tempo... para quem tens tempo? E porque é que elas vêm antes de ti?`,
        `Se amanhã tivesses 2 horas só tuas, sem culpa, o que farias? Sê ${g('específico', 'específica')}.`,
        `O tempo para ti não aparece - cria-se. O que precisarias de soltar para te encontrar?`,
        `Quem te ensinou que o teu tempo valia menos que o dos outros?`
      ];
    } else if (topics.includes('dinheiro')) {
      responses = [
        `Quando gastas com os outros, como te sentes? E quando é contigo - o que muda?`,
        `Se o dinheiro não fosse problema, o que comprarias para ti amanhã?`,
        `De onde vem a crença de que gastar contigo é desperdício?`,
        `O que dirias à tua filha se ela se recusasse a investir em si mesma?`
      ];
    } else if (topics.includes('merecimento')) {
      responses = [
        `"Não mereço" - quando começaste a acreditar nisso? Houve um momento específico?`,
        `Quais são as condições que colocas a ti mesma para mereceres? Quem as definiu?`,
        `Se o merecimento não se ganhasse - se fosse um direito de nascença - como viverias diferente?`,
        `O que terias de fazer para finalmente mereceres? E se isso nunca for suficiente?`
      ];
    } else if (topics.includes('relacionamentos')) {
      responses = [
        `Como é a dinâmica de cuidar nessa relação? Quem cuida de quem, e em que proporção?`,
        `O que aconteceria se dissesses "não" uma vez? O que temes?`,
        `Essa pessoa sabe o que precisas? Já lhe disseste directamente?`,
        `Nas tuas relações, onde está a linha entre amor e auto-abandono?`
      ];
    } else if (topics.includes('roupa')) {
      responses = [
        `Essas peças guardadas "para ocasião especial" - qual é a ocasião que estás à espera?`,
        `Quando te vestes de manhã, o que pensas? É para ti ou para como os outros te vão ver?`,
        `Se amanhã vestisses a tua roupa favorita sem razão, o que sentirias? E porquê?`,
        `O que a tua roupa de hoje diz sobre como te vês?`
      ];
    } else if (needsExploration) {
      responses = [
        `Sinto que há algo mais por baixo do que estás a dizer. O que é que ainda não conseguiste pôr em palavras?`,
        `Quando dizes "${keyPhrases[0] || 'isso'}", o que realmente queres dizer?`,
        `Pareces incerta. Isso é bom - significa que estás a questionar. O que está a causar essa dúvida?`,
        `Se pudesses ser completamente honesta, sem filtros, o que dirias?`
      ];
    } else {
      // Exploração genérica profunda
      responses = [
        `Conta-me mais. O que está por trás disso?`,
        `E como isso te faz sentir? No corpo, onde sentes isso?`,
        `O que precisarias de ouvir neste momento?`,
        `Se este sentimento tivesse voz, o que diria?`
      ];
    }
  }

  // ===== RESPOSTAS DE DESAFIO (para padrões identificados) =====
  if (approach === 'challenge') {
    if (patterns.includes('perfeccionismo')) {
      responses = [
        `Reparei num padrão: o "tem de ser perfeito". E se 80% fosse suficiente? O que mudaria?`,
        `O perfeccionismo protege-te de quê? De críticas? De falhar? De seres vista?`,
        `Quem te ensinou que "bom" não era suficiente?`
      ];
    } else if (patterns.includes('people_pleasing')) {
      responses = [
        `Vejo um padrão: priorizas sempre os outros. Quando é que TU vais estar na tua lista?`,
        `Se deixasses de agradar a todos, quem ficaria? E será que essas pessoas merecem a tua energia?`,
        `O "não" é uma frase completa. Quando foi a última vez que o usaste?`
      ];
    } else if (patterns.includes('auto_sabotagem')) {
      responses = [
        `Reparei que dizes "sempre que" tento, falho. E se essa não for a história toda?`,
        `O que ganhas em não conseguir? Às vezes a sabotagem protege-nos de algo maior.`,
        `E se desta vez fosse diferente? O que precisarias de mudar?`
      ];
    } else if (patterns.includes('comparacao')) {
      responses = [
        `Comparas-te muito com os outros. Mas conheces a história delas por dentro?`,
        `Se deixasses de te comparar, como saberias que estás no caminho certo?`,
        `A tua jornada é tua. Incomparável. O que estás a evitar olhar em ti ao olhar para elas?`
      ];
    } else {
      responses = [
        `Vejo um padrão a repetir-se nas tuas palavras. Consegues vê-lo também?`,
        `Esta história que contas a ti mesma... é verdade ou é hábito?`,
        `O que aconteceria se essa crença não fosse verdade?`
      ];
    }
  }

  // ===== RESPOSTAS DE ACÇÃO =====
  if (approach === 'action') {
    responses = [
      `Gosto de ouvir isso! Agora, o que vais fazer com essa energia? Algo concreto, para amanhã.`,
      `Esse reconhecimento é poderoso. Como vais honrá-lo? O que vai ser diferente?`,
      `Óptimo. Agora o desafio: transforma isso em acção. Uma coisa pequena. O quê?`,
      `Sinto esperança nas tuas palavras. Vamos ancorar isso: o que podes fazer esta semana?`
    ];
  }

  // Filtrar respostas já usadas
  const unusedResponses = responses.filter(r => !memory.wasUsed(r));

  // Se todas foram usadas, gerar resposta dinâmica
  if (unusedResponses.length === 0) {
    const dynamicResponses = [
      `${keyPhrases[0] ? `Disseste algo importante: "${keyPhrases[0]}". ` : ''}Quero aprofundar isso. O que está realmente em jogo aqui?`,
      `Voltemos atrás. O que te trouxe a este ponto? Qual foi o momento de viragem?`,
      `Estou a ouvir muito sobre ${topics[0] || 'o que sentes'}. O que precisas realmente?`,
      `Se pudesses mudar uma coisa - só uma - o que seria?`
    ];
    const response = dynamicResponses[Math.floor(Math.random() * dynamicResponses.length)];
    memory.markUsed(response);
    memory.questionDepth++;
    return response;
  }

  const selectedResponse = unusedResponses[Math.floor(Math.random() * unusedResponses.length)];
  memory.markUsed(selectedResponse);
  memory.questionDepth++;

  return selectedResponse;
}

// Gerar saudação contextual inteligente
function generateSmartGreeting(userData, chatHistory, memory) {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  if (!chatHistory || chatHistory.length === 0) {
    return `${timeGreeting}. Sou a Esmeralda, e vou ser a tua companheira nesta jornada de auto-descoberta.\n\nAntes de começarmos, quero que saibas: aqui não há respostas erradas. Não vou julgar-te. O meu papel é ajudar-te a ver o que talvez ainda não consigas ver.\n\nConta-me: o que te trouxe aqui hoje?`;
  }

  // Analisar histórico para contexto
  const lastMessages = chatHistory.slice(-10);
  const lastUserMessages = lastMessages.filter(m => m.role === 'user');

  if (lastUserMessages.length > 0) {
    const recentTopics = [];
    lastUserMessages.forEach(m => {
      const analysis = analyzeMessage(m.content, memory);
      recentTopics.push(...analysis.topics);
    });

    const daysSince = Math.floor((new Date() - new Date(chatHistory[chatHistory.length - 1].created_at)) / (1000 * 60 * 60 * 24));

    if (daysSince >= 3) {
      if (recentTopics.length > 0) {
        return `${timeGreeting}. Passaram alguns dias desde a nossa última conversa. Da última vez, falámos sobre ${recentTopics[0]}.\n\nComo tens estado desde então? Houve alguma mudança?`;
      }
      return `${timeGreeting}. Senti a tua falta. Como tens estado? O que te traz de volta?`;
    }

    if (recentTopics.includes('culpa')) {
      return `${timeGreeting}. Ontem falámos sobre culpa. Pensei em ti. Como te sentes hoje em relação a isso?`;
    }
  }

  const greetings = [
    `${timeGreeting}. Como estás hoje? E não me digas "bem" se não estiveres.`,
    `${timeGreeting}. Antes de falarmos - respira fundo. Agora conta-me: como te sentes neste momento?`,
    `${timeGreeting}. Estou aqui. O que precisas partilhar hoje?`
  ];

  return greetings[Math.floor(Math.random() * greetings.length)];
}

export default function ChatAurea() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [memory] = useState(() => new ConversationMemory());
  const messagesEndRef = useRef(null);

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
        .select('id, nome, email')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (userData) {
        setUserId(userData.id);

        const { data: chatHistory } = await supabase
          .from('aurea_chat_messages')
          .select('*')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: true })
          .limit(100);

        if (chatHistory && chatHistory.length > 0) {
          const isToday = new Date(chatHistory[chatHistory.length - 1].created_at).toDateString() === new Date().toDateString();

          // Carregar respostas usadas para memória
          chatHistory.filter(m => m.role === 'assistant').forEach(m => {
            memory.markUsed(m.content);
          });

          setMessages(chatHistory.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.created_at
          })));

          if (!isToday) {
            const greeting = generateSmartGreeting(userData, chatHistory, memory);
            setTimeout(() => addMessage('assistant', greeting), 1000);
          }
        } else {
          const greeting = generateSmartGreeting(userData, null, memory);
          setTimeout(() => addMessage('assistant', greeting), 500);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async (role, content) => {
    if (role === 'assistant') {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500));
    }

    const msg = { role, content, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);

    if (role === 'assistant') {
      setIsTyping(false);
      memory.markUsed(content);
    }

    // Save to database
    if (userId) {
      await supabase.from('aurea_chat_messages').insert({
        user_id: userId,
        role,
        content,
        created_at: msg.timestamp
      });
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    setInputValue('');

    // Add user message
    await addMessage('user', userText);

    // Analyze and generate response
    const analysis = analyzeMessage(userText, memory);
    const response = generateCoachResponse(analysis, memory, messages);

    // Log themes for pattern analysis
    if (analysis.topics.length > 0 || analysis.patterns.length > 0) {
      await supabase.from('aurea_chat_themes').insert({
        user_id: userId,
        themes: [...analysis.topics, ...analysis.patterns],
        created_at: new Date().toISOString()
      }).catch(() => {});
    }

    // Add assistant response
    await addMessage('assistant', response);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cores claras e femininas
  const CORES = {
    bg: '#FDF8F3',
    bgCard: '#FFFFFF',
    gold: '#C9A227',
    goldLight: '#E8D59E',
    rose: '#E8B4B8',
    roseDark: '#D4919A',
    text: '#4A3728',
    textLight: '#7A6445',
    goldDark: '#7A6200',
    accent: '#F5E6D3',
    userBubble: '#C9A227',
    assistantBubble: '#FFFFFF'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: CORES.bg }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse" style={{ background: `linear-gradient(135deg, ${CORES.rose} 0%, ${CORES.roseDark} 100%)` }}>
            <span className="text-2xl">💛</span>
          </div>
          <p style={{ color: CORES.textLight }}>A Esmeralda está a chegar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: CORES.bg }}>
      {/* Header */}
      <header className="px-4 py-4 border-b shadow-sm" style={{ backgroundColor: CORES.bgCard, borderColor: CORES.accent }}>
        <div className="flex items-center gap-4">
          <Link to="/aurea/dashboard" style={{ color: CORES.textLight }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md" style={{ background: `linear-gradient(135deg, ${CORES.rose} 0%, ${CORES.roseDark} 100%)` }}>
                <span className="text-xl">💛</span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2" style={{ borderColor: CORES.bgCard }}></div>
            </div>
            <div>
              <h1 className="font-bold text-lg" style={{ color: CORES.text }}>{PERSONA.nome}</h1>
              <p className="text-xs flex items-center gap-1" style={{ color: '#22C55E' }}>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Aqui para ti
              </p>
            </div>
          </div>

          {/* Padrões identificados badge */}
          {memory.identifiedPatterns.length > 0 && (
            <div className="ml-auto px-3 py-1 rounded-full" style={{ backgroundColor: CORES.accent }}>
              <span className="text-xs" style={{ color: CORES.goldDark }}>{memory.identifiedPatterns.length} padrões</span>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1 shadow-sm" style={{ background: `linear-gradient(135deg, ${CORES.rose} 0%, ${CORES.roseDark} 100%)` }}>
                <span className="text-sm">💛</span>
              </div>
            )}
            <div
              className="max-w-[85%] p-4 rounded-2xl shadow-sm"
              style={msg.role === 'user'
                ? { backgroundColor: CORES.gold, color: 'white', borderBottomRightRadius: '4px' }
                : { backgroundColor: CORES.bgCard, color: CORES.text, borderBottomLeftRadius: '4px', border: `1px solid ${CORES.accent}` }
              }
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className="text-[10px] mt-2 text-right" style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : '#8B7355' }}>
                {new Date(msg.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 shadow-sm" style={{ background: `linear-gradient(135deg, ${CORES.rose} 0%, ${CORES.roseDark} 100%)` }}>
              <span className="text-sm">💛</span>
            </div>
            <div className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: CORES.bgCard, border: `1px solid ${CORES.accent}`, borderBottomLeftRadius: '4px' }}>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: CORES.textLight }}>A reflectir</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: CORES.rose, animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: CORES.rose, animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: CORES.rose, animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t shadow-lg" style={{ backgroundColor: CORES.bgCard, borderColor: CORES.accent }}>
        <div className="flex gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Partilha o que sentes..."
            rows={1}
            className="flex-1 px-4 py-3 rounded-xl focus:outline-none resize-none"
            style={{
              backgroundColor: CORES.accent,
              color: CORES.text,
              border: `1px solid ${CORES.goldLight}`,
              minHeight: '48px',
              maxHeight: '120px'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-3 rounded-xl text-white disabled:opacity-50 transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${CORES.rose} 0%, ${CORES.roseDark} 100%)` }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: CORES.textLight }}>
          Sem julgamentos. Só honestidade.
        </p>
      </div>
    </div>
  );
}
