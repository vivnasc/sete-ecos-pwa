import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';

// Base de conhecimento da Vivianne - respostas contextuais e personalizadas
const RESPOSTAS_VIVIANNE = {
  saudacao: [
    'Olá! Sou a Vivianne, a tua coach de nutrição. Como posso ajudar-te hoje? 💚',
    'Bom dia! Estou aqui para te apoiar em tudo o que precisares. O que te traz aqui? 🌱',
    'Olá querida! Que bom falar contigo. Em que posso ajudar? 😊'
  ],

  // MACROS E DISTRIBUIÇÃO
  macros_distribuicao: [
    'Boa pergunta sobre a distribuição de macros! 📊\n\nA distribuição ideal varia conforme o teu objetivo, mas uma boa base é:\n\n🥩 **Proteína**: Dividir igualmente pelas refeições principais (ex: 2 porções ao pequeno-almoço, 2 ao almoço, 2 ao jantar)\n\n🍚 **Hidratos**: Concentrar mais nas refeições antes/depois do treino e no pequeno-almoço\n\n🥑 **Gorduras**: Distribuir ao longo do dia, especialmente nas refeições sem treino\n\nQueres que te explique melhor algum destes pontos?',
    'Sobre distribuição de macros! 🎯\n\nO teu plano está pensado para:\n\n**Pequeno-almoço**: 20-25% das calorias diárias\n**Almoço**: 30-35% das calorias\n**Lanche**: 10-15% das calorias\n**Jantar**: 25-30% das calorias\n\nA proteína deve estar presente em TODAS as refeições para manter a saciedade e preservar massa muscular. Os hidratos podem ser mais flexíveis conforme a tua fome e energia.'
  ],

  macros_pequeno_almoco: [
    'Para o pequeno-almoço, recomendo: 🌅\n\n🥩 **Proteína**: 1.5-2 porções (ex: 2 ovos + iogurte, ou proteína em pó)\n🍚 **Hidratos**: 1-1.5 porções (ex: aveia, fruta, ou pão integral)\n🥑 **Gordura**: 1-2 porções (ex: manteiga de amendoim, sementes)\n\nO pequeno-almoço deve ser saciante para evitar fome a meio da manhã. A proteína logo de manhã ajuda a controlar o apetite durante todo o dia! 💪'
  ],

  macros_almoco: [
    'Para o almoço, a maior refeição do dia: 🍽️\n\n🥩 **Proteína**: 2-2.5 porções (ex: 150-180g de frango/peixe)\n🥬 **Vegetais**: À vontade! Metade do prato\n🍚 **Hidratos**: 1-2 porções (conforme treino)\n🥑 **Gordura**: 1-2 porções (azeite na salada, por ex.)\n\nO almoço é ideal para consumir hidratos, especialmente se treinares à tarde. Faz do vegetal a base do prato! 🥗'
  ],

  macros_jantar: [
    'Para o jantar, mais leve mas nutritivo: 🌙\n\n🥩 **Proteína**: 2 porções (essencial!)\n🥬 **Vegetais**: Abundantes\n🍚 **Hidratos**: 0.5-1 porção (reduzir se não treinaste)\n🥑 **Gordura**: 1-2 porções\n\nÀ noite convém reduzir hidratos se não fizeste exercício intenso. A proteína continua importante para a recuperação noturna. Evita jantar muito tarde para melhor digestão e sono! 😴'
  ],

  macros_iguais: [
    'Os macros NÃO precisam ser iguais em todas as refeições! 📊\n\nNa verdade, faz sentido ajustar:\n\n✅ **Proteína**: Sim, esta deve ser consistente (presente em todas as refeições)\n\n⚖️ **Hidratos**: Variar conforme energia necessária - mais ao pequeno-almoço e almoço, menos ao jantar\n\n🔄 **Gorduras**: Podem compensar quando reduces hidratos\n\nO importante é atingir os totais diários! A distribuição é flexível conforme o teu estilo de vida e horários de treino.'
  ],

  // PROTEÍNA
  proteina_fontes: [
    'Excelentes fontes de proteína para o teu plano: 🥩\n\n**Animais (20-25g por 100g):**\n• Frango, peru (magros)\n• Peixe (salmão, atum, pescada)\n• Ovos (6g por ovo)\n• Carne magra\n\n**Vegetais/Outros:**\n• Iogurte grego/Skyr (10g por 100g)\n• Queijo fresco (12g por 100g)\n• Leguminosas (lentilhas, grão)\n• Tofu, tempeh\n\nUma porção = ~20g de proteína = ~100g de carne/peixe ou 3 ovos'
  ],

  proteina_quantidade: [
    'Sobre a quantidade de proteína: 💪\n\nO teu plano indica as porções diárias. Cada porção equivale a ~20g de proteína.\n\n**Regra prática:**\n• 100g frango/peixe = 1 porção\n• 2-3 ovos = 1 porção\n• 150g iogurte grego = 0.75 porção\n• 100g tofu = 0.5 porção\n\nDistribui ao longo do dia para melhor absorção. O corpo processa melhor 20-40g por refeição do que 60g de uma vez!'
  ],

  // HIDRATOS
  hidratos_quando: [
    'Quando comer hidratos? Boa pergunta! 🍚\n\n**Melhores momentos:**\n• Pequeno-almoço (energia para o dia)\n• Antes do treino (1-2h antes)\n• Depois do treino (recuperação)\n\n**Reduzir:**\n• Jantar (especialmente sem treino)\n• Dias sedentários\n\n**Dica:** Se treinares de manhã, hidratos ao pequeno-almoço. Se treinares à tarde, guarda mais para o almoço. Os hidratos são combustível - usa-os quando precisas de energia!'
  ],

  hidratos_fontes: [
    'Melhores fontes de hidratos para o teu plano: 🌾\n\n**Complexos (preferir):**\n• Aveia\n• Arroz integral/basmati\n• Batata doce\n• Quinoa\n• Leguminosas\n\n**Simples (moderação):**\n• Fruta (2-3 peças/dia)\n• Pão integral\n\n**Evitar:**\n• Açúcar refinado\n• Pão branco\n• Massas refinadas\n\nUma porção = ~30g hidratos = 40g arroz cru ou 1 batata média'
  ],

  // GORDURAS
  gorduras_boas: [
    'Gorduras saudáveis são essenciais! 🥑\n\n**Incluir diariamente:**\n• Azeite extra virgem (1-2 colheres sopa)\n• Abacate (1/4 a 1/2 unidade)\n• Frutos secos (punhado ~30g)\n• Sementes (chia, linhaça, abóbora)\n• Peixes gordos (salmão, sardinha)\n\n**Limitar:**\n• Manteiga (ocasional)\n• Queijos gordos\n\n**Evitar:**\n• Óleos vegetais refinados\n• Fritos\n• Gorduras trans\n\nGordura NÃO engorda - o excesso calórico é que engorda!'
  ],

  // JEJUM
  jejum_info: [
    'Sobre o jejum intermitente no teu plano: ⏱️\n\nO protocolo 16:8 significa:\n• 16 horas sem comer\n• 8 horas de janela alimentar\n\n**Exemplo:** Última refeição às 20h → Primeira refeição às 12h\n\n**Durante o jejum podes:**\n• Água (essencial!)\n• Chá/café sem açúcar\n• Água com limão\n\n**Benefícios:**\n• Melhora sensibilidade à insulina\n• Facilita défice calórico\n• Mais foco mental\n\nSe sentires muita fome no início, é normal - o corpo adapta-se em 1-2 semanas!'
  ],

  // ÁGUA
  agua_dicas: [
    'Dicas para beber mais água! 💧\n\n**Estratégias práticas:**\n• Garrafa sempre à vista\n• Bebe 1 copo ao acordar\n• 1 copo antes de cada refeição\n• App de lembretes (usa o Vitalis!)\n• Marca níveis na garrafa com horas\n\n**Quanto beber:**\n• Mínimo 2L/dia\n• Mais se treinares (+500ml por hora de treino)\n• Mais no calor\n\n**Sinais de desidratação:**\n• Urina escura\n• Sede (já estás desidratada!)\n• Dor de cabeça\n• Fadiga\n\nÁgua é fundamental para perda de peso - ajuda na digestão e reduz retenção!'
  ],

  // TREINO
  treino_alimentacao: [
    'Alimentação antes e depois do treino: 🏋️‍♀️\n\n**1-2h ANTES:**\n• Hidrato + pouca proteína\n• Ex: Banana + iogurte, ou aveia\n• Evita gordura (digestão lenta)\n\n**ATÉ 1h DEPOIS:**\n• Proteína + hidrato\n• Ex: Batido proteico + fruta\n• Ou refeição completa\n\n**Se treinas em jejum:**\n• Pode ser eficaz para perda de gordura\n• Quebra jejum logo após com proteína\n\nO mais importante é a alimentação TOTAL do dia, não só à volta do treino!'
  ],

  treino_frequencia: [
    'Sobre frequência de treino ideal: 💪\n\n**Para perda de peso:**\n• 3-4x força + 2x cardio/semana\n• Ou 4-5x treinos mistos\n\n**Descanso:**\n• Mínimo 1-2 dias/semana\n• Sono adequado (7-8h)\n• Não treines grupos musculares 2 dias seguidos\n\n**Intensidade:**\n• Começa moderado\n• Aumenta progressivamente\n• Ouve o teu corpo!\n\nMais não é sempre melhor - recuperação é onde o corpo muda!'
  ],

  // SONO
  sono_dicas: [
    'O sono é CRUCIAL para perda de peso! 😴\n\n**Porque importa:**\n• Regula hormonas da fome\n• Recuperação muscular\n• Menos cravings no dia seguinte\n• Melhor decisões alimentares\n\n**Dicas para melhorar:**\n• Horário consistente\n• Evita ecrãs 1h antes\n• Quarto fresco e escuro\n• Jantar leve, 2-3h antes\n• Evita cafeína após 14h\n\n**Meta:** 7-8 horas por noite\n\nDormir mal pode sabotar todo o resto do plano!'
  ],

  // FOME E CRAVINGS
  fome_controlar: [
    'Para controlar a fome e cravings: 🎯\n\n**Estratégias:**\n• Proteína em TODAS as refeições\n• Fibra (vegetais, aveia)\n• Bebe água antes de comer\n• Come devagar (20 min mínimo)\n• Não saltes refeições\n\n**Quando tens cravings:**\n• Bebe água ou chá primeiro\n• Espera 15-20 minutos\n• Pergunta: é fome real ou emocional?\n• Snacks permitidos: frutos secos, iogurte, vegetais\n\n**Se tiveres muita fome:**\n• Pode ser pouca proteína\n• Ou pouca comida no geral\n• Fala comigo para ajustar!'
  ],

  // MOTIVAÇÃO
  motivacao: [
    'Estás a fazer um excelente trabalho! 💚\n\nLembra-te:\n• Progresso não é linear\n• Cada dia é uma nova oportunidade\n• Pequenas mudanças = grandes resultados\n• Tu és capaz!\n\nO que te está a custar mais neste momento? Posso ajudar com estratégias específicas.',
    'Sei que nem sempre é fácil, mas estás no caminho certo! 🌟\n\nDicas para dias difíceis:\n• Foca num dia de cada vez\n• Celebra pequenas vitórias\n• Não te compares com outros\n• Lembra-te do teu "porquê"\n\nComo te posso apoiar hoje?',
    'A consistência supera a perfeição! 💪\n\nNão precisas ser perfeita - precisas ser consistente. Se tiveres um dia menos bom, o próximo é uma nova oportunidade.\n\nO que te está a motivar a continuar? Às vezes ajuda relembrar os objetivos!'
  ],

  // DÚVIDAS GERAIS
  ajuda_geral: [
    'Claro que te ajudo! 💚\n\nPosso esclarecer dúvidas sobre:\n• 📊 Distribuição de macros\n• 🥩 Fontes de proteína\n• 🍚 Quando comer hidratos\n• 💧 Hidratação\n• 🏋️ Treino e alimentação\n• 😴 Sono e recuperação\n• 💪 Motivação\n\nSobre o que queres saber mais?',
    'Estou aqui para te ajudar! 🌱\n\nDiz-me especificamente o que precisas:\n• Dúvidas sobre o plano?\n• Como distribuir as refeições?\n• Ideias de receitas?\n• Estratégias para situações sociais?\n\nQuanto mais específica fores, melhor te posso ajudar!'
  ],

  // PLANO
  sobre_plano: [
    'Sobre o teu plano alimentar: 📋\n\nO plano foi criado com base nos teus objetivos e está pensado para:\n• Criar défice calórico sustentável\n• Manter massa muscular (proteína adequada)\n• Dar energia para o dia-a-dia\n• Ser flexível e adaptável\n\nPodes consultar todos os detalhes em "Meu Plano" no dashboard.\n\nTens alguma dúvida específica sobre as quantidades ou alimentos?'
  ],

  // RECEITAS
  receitas_ideias: [
    'Ideias de receitas rápidas! 🍳\n\n**Pequeno-almoço:**\n• Ovos mexidos + abacate + tomate\n• Papas de aveia + frutos vermelhos + proteína\n• Iogurte grego + granola + banana\n\n**Almoço/Jantar:**\n• Salada com frango grelhado\n• Peixe ao forno com legumes\n• Omelete recheada + salada\n\n**Snacks:**\n• Maçã + manteiga amendoim\n• Iogurte + nozes\n• Palitos cenoura + hummus\n\nVê mais receitas na secção "Receitas" da app! 👩‍🍳'
  ]
};

// Detectar intenção da mensagem com mais precisão
const detectarIntencao = (mensagem) => {
  const texto = mensagem.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Saudações
  if (texto.match(/^(ola|oi|bom dia|boa tarde|boa noite|hey|hello|hi)\b/)) return 'saudacao';

  // MACROS - Distribuição
  if (texto.match(/distribui|distribuicao|dividir|repartir/) && texto.match(/macro|refeic|dia/)) return 'macros_distribuicao';
  if (texto.match(/macro.*(pequeno.?almoco|manha|pa)/i) || texto.match(/(pequeno.?almoco|manha).*(macro|quanto|como)/i)) return 'macros_pequeno_almoco';
  if (texto.match(/macro.*(almoco|meio.?dia)/i) || texto.match(/almoco.*(macro|quanto|como)/i)) return 'macros_almoco';
  if (texto.match(/macro.*(jantar|noite)/i) || texto.match(/jantar.*(macro|quanto|como)/i)) return 'macros_jantar';
  if (texto.match(/macro.*(igual|igual|mesmo|identic)/i) || texto.match(/(igual|mesmo).*(macro|refeic|almoco|jantar)/i)) return 'macros_iguais';
  if (texto.match(/macro|distribuicao/)) return 'macros_distribuicao';

  // Proteína
  if (texto.match(/proteina.*(fonte|onde|qual|o que|comer|alimento)/i) || texto.match(/(fonte|onde).*(proteina)/i)) return 'proteina_fontes';
  if (texto.match(/proteina.*(quant|gramas|porcao|porco)/i) || texto.match(/(quant|gramas).*(proteina)/i)) return 'proteina_quantidade';
  if (texto.match(/proteina/) && !texto.match(/quando|hora|momento/)) return 'proteina_fontes';

  // Hidratos
  if (texto.match(/hidrato.*(quando|hora|momento|melhor)/i) || texto.match(/(quando|hora).*(hidrato|carbo)/i)) return 'hidratos_quando';
  if (texto.match(/hidrato.*(fonte|onde|qual|o que|comer)/i) || texto.match(/(fonte|onde).*(hidrato|carbo)/i)) return 'hidratos_fontes';
  if (texto.match(/hidrato|carbo|carboidrato/)) return 'hidratos_quando';

  // Gorduras
  if (texto.match(/gordura|lipido|oleo|azeite|abacate|nozes/)) return 'gorduras_boas';

  // Jejum
  if (texto.match(/jejum|fasting|janela alimentar|16.?8|intermitente/)) return 'jejum_info';

  // Água
  if (texto.match(/agua|beber|hidratar|hidratacao|litro|sede/)) return 'agua_dicas';

  // Treino
  if (texto.match(/treino.*(comer|alimenta|antes|depois|refeic)/i) || texto.match(/(antes|depois|pre|pos).*(treino)/i)) return 'treino_alimentacao';
  if (texto.match(/treino.*(frequencia|quantas|vezes|semana)/i) || texto.match(/(quantas|vezes|frequencia).*(treino)/i)) return 'treino_frequencia';
  if (texto.match(/treino|exercicio|musculacao|academia|ginasio|gym/)) return 'treino_alimentacao';

  // Sono
  if (texto.match(/sono|dormir|descanso|noite|insonia|cansaco/)) return 'sono_dicas';

  // Fome e cravings
  if (texto.match(/fome|craving|vontade|desejo|compulsao|saciar|saciedade|apetite/)) return 'fome_controlar';

  // Motivação
  if (texto.match(/motiv|desanima|dificil|dific|cansar|desistir|ajuda|conseguir|forcar|fraca/)) return 'motivacao';

  // Plano
  if (texto.match(/plano|meu plano|ver plano|quantidade|caloria/)) return 'sobre_plano';

  // Receitas
  if (texto.match(/receita|ideia|sugest|o que comer|o que fazer|preparar|cozinhar/)) return 'receitas_ideias';

  // Refeições genérico
  if (texto.match(/refeic|comer|comida|alimento|alimentacao/)) return 'macros_distribuicao';

  return 'ajuda_geral';
};

const getRespostaVivianne = (intencao, cliente = null) => {
  const respostas = RESPOSTAS_VIVIANNE[intencao] || RESPOSTAS_VIVIANNE.ajuda_geral;
  let resposta = respostas[Math.floor(Math.random() * respostas.length)];

  // Personalizar com nome se disponível
  if (cliente?.nome_completo) {
    const primeiroNome = cliente.nome_completo.split(' ')[0];
    // Ocasionalmente adicionar o nome
    if (Math.random() > 0.7) {
      resposta = resposta.replace(/^(Olá|Boa|Claro|Sobre|Para|Os|O )/, `$1${primeiroNome}, `);
    }
  }

  return resposta;
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

      // Carregar mensagens do localStorage
      const msgsSalvas = JSON.parse(localStorage.getItem(`vitalis-chat-${userData.id}`) || '[]');

      if (msgsSalvas.length === 0) {
        // Mensagem de boas-vindas personalizada
        const nome = clientData?.nome_completo?.split(' ')[0] || 'querida';
        const boasVindas = {
          id: Date.now(),
          texto: `Olá ${nome}! 👋\n\nSou a Vivianne, a tua coach de nutrição pessoal. Estou aqui para te ajudar com:\n\n📊 Dúvidas sobre macros e distribuição\n🍽️ Ideias de refeições\n💪 Motivação e apoio\n💧 Dicas de hidratação\n🏋️ Alimentação e treino\n\nPergunta-me o que quiseres! Como posso ajudar-te hoje? 💚`,
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
    const textoEnviado = novaMensagem;
    const msgUser = {
      id: Date.now(),
      texto: textoEnviado,
      remetente: 'user',
      timestamp: new Date().toISOString()
    };

    const novasMsgs = [...mensagens, msgUser];
    setMensagens(novasMsgs);
    setNovaMensagem('');

    // Resposta da Vivianne com delay natural
    setTimeout(() => {
      const intencao = detectarIntencao(textoEnviado);
      const resposta = getRespostaVivianne(intencao, client);

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
    }, 800 + Math.random() * 1200);
  };

  const limparConversa = () => {
    if (!confirm('Tens a certeza que queres limpar a conversa?')) return;
    localStorage.removeItem(`vitalis-chat-${userId}`);
    const nome = client?.nome_completo?.split(' ')[0] || 'querida';
    const boasVindas = {
      id: Date.now(),
      texto: `Olá ${nome}! 👋\n\nSou a Vivianne, a tua coach de nutrição pessoal. Estou aqui para te ajudar com:\n\n📊 Dúvidas sobre macros e distribuição\n🍽️ Ideias de refeições\n💪 Motivação e apoio\n💧 Dicas de hidratação\n🏋️ Alimentação e treino\n\nPergunta-me o que quiseres! Como posso ajudar-te hoje? 💚`,
      remetente: 'coach',
      timestamp: new Date().toISOString()
    };
    setMensagens([boasVindas]);
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
              <h1 className="font-bold">Vivianne</h1>
              <p className="text-white/70 text-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Coach de Nutrição
              </p>
            </div>
            <button
              onClick={limparConversa}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm hover:bg-white/30 transition-colors"
              title="Limpar conversa"
            >
              🗑️
            </button>
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
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.remetente === 'user'
                        ? 'bg-[#7C8B6F] text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md shadow'
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm leading-relaxed">{msg.texto}</p>
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
            { texto: 'Como distribuir macros?', emoji: '📊' },
            { texto: 'Fontes de proteína', emoji: '🥩' },
            { texto: 'Quando comer hidratos?', emoji: '🍚' },
            { texto: 'Ideias de refeições', emoji: '🍽️' },
            { texto: 'Preciso de motivação', emoji: '💪' }
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
            placeholder="Pergunta à Vivianne..."
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
