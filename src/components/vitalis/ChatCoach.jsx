import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';

// ============================================================
// VIVIANNE - COACH COM METODOLOGIA VITALIS
// Adaptação Metabólica + Porções com medida da mão
// ============================================================

export default function ChatCoach() {
  const [loading, setLoading] = useState(true);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [userId, setUserId] = useState(null);
  const [client, setClient] = useState(null);
  const [plano, setPlano] = useState(null);
  const [planoCompleto, setPlanoCompleto] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => { loadChat(); }, []);
  useEffect(() => { scrollToBottom(); }, [mensagens]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users').select('id').eq('auth_id', user.id).single();
      if (!userData) return;
      setUserId(userData.id);

      const { data: clientData } = await supabase
        .from('vitalis_clients').select('*').eq('user_id', userData.id).single();

      if (clientData) {
        setClient(clientData);
        const { data: planoData } = await supabase
          .from('vitalis_plano').select('*').eq('client_id', clientData.id).single();

        if (planoData) {
          setPlano(planoData);
          const { data: planoDia } = await supabase.rpc('vitalis_plano_do_dia', { p_user_id: userData.id });
          if (planoDia && !planoDia.erro) setPlanoCompleto(planoDia);
        }
      }

      const msgsSalvas = JSON.parse(localStorage.getItem(`vitalis-chat-${userData.id}`) || '[]');
      if (msgsSalvas.length === 0) {
        const nome = clientData?.nome_completo?.split(' ')[0] || 'querida';
        const boasVindas = {
          id: Date.now(),
          texto: `Olá ${nome}! 👋\n\nSou a Vivianne. Estou aqui para te ajudar a entender o teu plano de adaptação metabólica.\n\nPergunta-me sobre:\n• As tuas porções (palmas, punhos, mãos, polegares)\n• Como montar os pratos\n• O que priorizar ou evitar na tua fase\n• Dúvidas sobre o método\n\nComo posso ajudar?`,
          remetente: 'coach',
          timestamp: new Date().toISOString()
        };
        setMensagens([boasVindas]);
      } else {
        setMensagens(msgsSalvas);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESPOSTAS BASEADAS NA METODOLOGIA VITALIS
  // ============================================================
  const gerarRespostaVivianne = (pergunta) => {
    const texto = pergunta.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const nome = client?.nome_completo?.split(' ')[0] || '';

    // Dados do plano em PORÇÕES (não gramas!)
    const palmas = plano?.porcoes_proteina || 6;
    const maos = plano?.porcoes_hidratos || 3;
    const polegares = plano?.porcoes_gordura || 8;
    const fase = planoCompleto?.fase?.nome || 'Actual';
    const diasTreino = plano?.dias_treino || [];

    // Regras da fase
    const priorizar = planoCompleto?.regras?.priorizar || [];
    const evitar = planoCompleto?.regras?.evitar || [];

    // Fase restritiva?
    const faseRestritiva = fase.toLowerCase().includes('ceto') ||
                          fase.toLowerCase().includes('low') ||
                          maos <= 2;

    // ========== PORÇÕES E MEDIDAS ==========
    if (texto.match(/por[çc][aã]o|palma|punho|polegar|m[aã]o|medir|quanto|medida/)) {
      return `${nome ? nome + ', no' : 'No'} método Vitalis medimos tudo com a TUA mão:\n\n` +
        `🖐️ **AS TUAS PORÇÕES DIÁRIAS:**\n\n` +
        `🥩 **Proteína: ${palmas} palmas/dia**\n` +
        `Uma palma = tamanho e espessura da tua palma (sem dedos)\n` +
        `Ex: peito de frango, peixe, carne\n\n` +
        `🥬 **Legumes: à vontade (mínimo 2 punhos)**\n` +
        `Um punho = quantidade que cabe no teu punho fechado\n` +
        `Ex: brócolos, espinafres, salada\n\n` +
        `🍚 **Hidratos: ${maos} mãos concha/dia**${diasTreino.length > 0 ? ` (+1 nos dias de treino)` : ''}\n` +
        `Uma mão concha = o que cabe na tua mão em concha\n` +
        `Ex: arroz, batata, fruta\n\n` +
        `🫒 **Gordura: ${polegares} polegares/dia**\n` +
        `Um polegar = tamanho do teu polegar\n` +
        `Ex: azeite, abacate, frutos secos\n\n` +
        `A beleza do método é que a TUA mão é proporcional ao TEU corpo!`;
    }

    // ========== DISTRIBUIÇÃO ==========
    if (texto.match(/distribui|dividir|repartir|refeic/)) {
      return `${nome ? nome + ', a' : 'A'} distribuição das tuas porções:\n\n` +
        `🌅 **PEQUENO-ALMOÇO:**\n` +
        `• ${Math.round(palmas * 0.25)}-${Math.round(palmas * 0.3)} palmas de proteína\n` +
        `• ${Math.round(maos * 0.3)} mãos concha de hidratos\n` +
        `• ${Math.round(polegares * 0.25)} polegares de gordura\n` +
        `• Legumes se quiseres\n\n` +
        `☀️ **ALMOÇO:**\n` +
        `• ${Math.round(palmas * 0.35)} palmas de proteína\n` +
        `• ${Math.round(maos * 0.35)}-${Math.round(maos * 0.4)} mãos concha de hidratos\n` +
        `• ${Math.round(polegares * 0.3)} polegares de gordura\n` +
        `• 1-2 punhos de legumes\n\n` +
        `🌙 **JANTAR:**\n` +
        `• ${Math.round(palmas * 0.35)} palmas de proteína\n` +
        `• ${Math.round(maos * 0.25)} mãos concha de hidratos\n` +
        `• ${Math.round(polegares * 0.3)} polegares de gordura\n` +
        `• Legumes à vontade\n\n` +
        `O importante é atingir os totais do dia. Se numa refeição comeres menos, podes compensar noutra.`;
    }

    // ========== MACROS IGUAIS? ==========
    if (texto.match(/(igual|mesmo).*(macro|refeic|almoco|jantar)/i) || texto.match(/macro.*(igual|mesmo)/i)) {
      return `Não precisam de ser iguais!\n\n` +
        `O que importa é o TOTAL do dia:\n` +
        `• ${palmas} palmas de proteína\n` +
        `• ${maos} mãos concha de hidratos\n` +
        `• ${polegares} polegares de gordura\n\n` +
        `**O que deve ser constante:**\n` +
        `✓ Proteína em todas as refeições principais\n\n` +
        `**O que pode variar:**\n` +
        `• Hidratos - mais cedo no dia, menos ao jantar\n` +
        `• Gordura - pode equilibrar quando reduces hidratos\n\n` +
        `${diasTreino.length > 0 ? `Nos dias de treino tens +1 mão concha de hidratos.` : ''}`;
    }

    // ========== PEQUENO-ALMOÇO ==========
    if (texto.match(/pequeno.?almoco|manha|pa\b/)) {
      const prot = Math.round(palmas * 0.25);
      const hid = Math.round(maos * 0.3);
      const gord = Math.round(polegares * 0.25);

      return `Para o teu pequeno-almoço:\n\n` +
        `🥩 ${prot}-${prot + 1} palmas de proteína\n` +
        `🍚 ${hid}-${hid + 1} mãos concha de hidratos\n` +
        `🫒 ${gord}-${gord + 1} polegares de gordura\n\n` +
        `${faseRestritiva ?
          `**Ideias para a tua fase:**\n• Ovos mexidos (2-3 ovos = ~1 palma)\n• Iogurte grego natural\n• Omelete com legumes` :
          `**Ideias:**\n• Ovos + aveia\n• Iogurte com fruta\n• Omelete + tosta integral`}\n\n` +
        `Lembra-te: a proteína de manhã ajuda a controlar a fome durante o dia.`;
    }

    // ========== ALMOÇO ==========
    if (texto.match(/\balmoco\b|meio.?dia/)) {
      const prot = Math.round(palmas * 0.35);
      const hid = Math.round(maos * 0.35);

      return `Para o teu almoço:\n\n` +
        `🥩 ${prot} palmas de proteína\n` +
        `🥬 1-2 punhos de legumes (ou mais!)\n` +
        `🍚 ${hid}-${hid + 1} mãos concha de hidratos\n` +
        `🫒 ${Math.round(polegares * 0.3)} polegares de gordura\n\n` +
        `**Como montar o prato:**\n` +
        `• Metade do prato = legumes\n` +
        `• Um quarto = proteína\n` +
        `• Um quarto = hidratos\n` +
        `• Gordura = tempero (azeite) ou parte da proteína\n\n` +
        `${evitar.length > 0 ? `Lembra-te de evitar: ${evitar.slice(0, 2).join(', ')}` : ''}`;
    }

    // ========== JANTAR ==========
    if (texto.match(/jantar|noite/)) {
      const prot = Math.round(palmas * 0.35);
      const hid = Math.round(maos * 0.25);

      return `Para o teu jantar:\n\n` +
        `🥩 ${prot} palmas de proteína\n` +
        `🥬 Legumes à vontade\n` +
        `🍚 ${hid}-${hid + 1} mãos concha de hidratos (menos que ao almoço)\n` +
        `🫒 ${Math.round(polegares * 0.3)} polegares de gordura\n\n` +
        `${faseRestritiva ?
          `**Na tua fase, ao jantar prioriza:**\n• Proteína + legumes\n• Reduzir ainda mais os hidratos\n• Sopa é uma boa opção` :
          `**Dica:** O jantar deve ser mais leve que o almoço.`}\n\n` +
        `Janta pelo menos 2-3h antes de dormir.`;
    }

    // ========== PROTEÍNA ==========
    if (texto.match(/proteina|prote[íi]na/)) {
      return `Sobre a proteína no teu plano:\n\n` +
        `🖐️ **A tua meta: ${palmas} palmas por dia**\n\n` +
        `**Uma palma equivale a:**\n` +
        `• Peito de frango (tamanho da palma)\n` +
        `• Peixe (mesmo tamanho)\n` +
        `• 2-3 ovos\n` +
        `• Carne magra\n\n` +
        `**Distribuição sugerida:**\n` +
        `• Peq. almoço: ${Math.round(palmas * 0.25)} palmas\n` +
        `• Almoço: ${Math.round(palmas * 0.35)} palmas\n` +
        `• Jantar: ${Math.round(palmas * 0.35)} palmas\n\n` +
        `A proteína deve estar presente em TODAS as refeições principais. É fundamental para a adaptação metabólica.`;
    }

    // ========== HIDRATOS ==========
    if (texto.match(/hidrato|carbo/)) {
      return `Sobre os hidratos no teu plano:\n\n` +
        `🖐️ **A tua meta: ${maos} mãos concha por dia**\n` +
        `${diasTreino.length > 0 ? `(+1 mão nos dias de treino: ${diasTreino.map(d => ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d-1]).join(', ')})` : ''}\n\n` +
        `**Uma mão concha equivale a:**\n` +
        `• Arroz/quinoa cozido\n` +
        `• Batata/batata doce\n` +
        `• Fruta\n` +
        `• Aveia\n\n` +
        `${faseRestritiva ?
          `**Na tua fase actual:**\nOs hidratos estão reduzidos intencionalmente. Isto faz parte da adaptação metabólica - o teu corpo está a aprender a usar outras fontes.` :
          `**Distribuição:** Mais no início do dia, menos ao jantar.`}\n\n` +
        `Os legumes NÃO contam como hidratos - podes comer à vontade!`;
    }

    // ========== GORDURA ==========
    if (texto.match(/gordura|azeite|abacate|oleagino|polegar/)) {
      return `Sobre a gordura no teu plano:\n\n` +
        `👍 **A tua meta: ${polegares} polegares por dia**\n\n` +
        `**Um polegar equivale a:**\n` +
        `• 1 colher de sopa de azeite (≈ 2 polegares)\n` +
        `• 1/4 de abacate (≈ 2 polegares)\n` +
        `• Punhado pequeno de frutos secos (≈ 2 polegares)\n\n` +
        `**Fontes a priorizar:**\n` +
        `• Azeite extra virgem\n` +
        `• Abacate\n` +
        `• Frutos secos\n` +
        `• Sementes\n` +
        `• Peixes gordos\n\n` +
        `A gordura boa é essencial - ajuda na saciedade e na absorção de vitaminas.`;
    }

    // ========== FRUTA ==========
    if (texto.match(/fruta|frutos|banana|maca|laranja/)) {
      if (faseRestritiva || evitar.some(e => e.toLowerCase().includes('fruta'))) {
        return `${nome ? nome + ', na' : 'Na'} tua fase actual (${fase}), a fruta está limitada.\n\n` +
          `**Porquê?**\n` +
          `A fruta conta como hidrato. Com ${maos} mãos concha por dia, precisas de escolher bem onde as usar.\n\n` +
          `**Se quiseres fruta:**\n` +
          `• Frutos vermelhos são a melhor opção\n` +
          `• 1 mão concha de fruta = 1 das tuas ${maos} mãos do dia\n` +
          `• Evita banana, manga, uvas (mais açúcar)\n\n` +
          `**Quando avançares de fase**, poderás ter mais flexibilidade.`;
      } else {
        return `A fruta conta como hidrato!\n\n` +
          `**1 mão concha de fruta** = 1 das tuas ${maos} mãos diárias\n\n` +
          `**Melhores opções:**\n` +
          `• Frutos vermelhos\n` +
          `• Maçã, pêra\n` +
          `• Citrinos\n\n` +
          `**Dica:** Come fruta com proteína ou gordura (ex: maçã com manteiga de amendoim) para evitar picos de açúcar.`;
      }
    }

    // ========== O QUE COMER/EVITAR ==========
    if (texto.match(/o que (posso |devo )?(comer|coma)|permitido|pode comer/)) {
      return `${nome ? nome + ', na' : 'Na'} tua fase (${fase}):\n\n` +
        `✅ **PRIORIZAR:**\n${priorizar.length > 0 ? priorizar.map(p => `• ${p}`).join('\n') : '• Proteína em todas as refeições\n• Legumes à vontade\n• Gorduras boas'}\n\n` +
        `❌ **EVITAR:**\n${evitar.length > 0 ? evitar.map(e => `• ${e}`).join('\n') : '• Açúcar\n• Processados\n• Álcool'}\n\n` +
        `**As tuas porções:**\n` +
        `• ${palmas} palmas proteína\n` +
        `• ${maos} mãos hidratos\n` +
        `• ${polegares} polegares gordura\n` +
        `• Legumes à vontade`;
    }

    if (texto.match(/evitar|n[aã]o (posso|devo)|proibido/)) {
      return `${nome ? nome + ', na' : 'Na'} tua fase deves EVITAR:\n\n` +
        `${evitar.length > 0 ? evitar.map(e => `❌ ${e}`).join('\n') : '❌ Açúcar refinado\n❌ Processados\n❌ Álcool\n❌ Farinhas brancas'}\n\n` +
        `${faseRestritiva ? 'Estás numa fase mais restritiva - isto é intencional para a adaptação metabólica.\n\n' : ''}` +
        `Se tiveres uma ocasião especial, fala comigo!`;
    }

    // ========== ADAPTAÇÃO METABÓLICA ==========
    if (texto.match(/adapta|metabol|fase|metodo|metodologia/)) {
      return `Sobre a adaptação metabólica:\n\n` +
        `O método Vitalis trabalha por **fases**, onde o teu corpo vai progressivamente adaptando-se.\n\n` +
        `**Estás na fase:** ${fase}\n\n` +
        `**O que isto significa:**\n` +
        `• As tuas porções estão calibradas para ESTA fase\n` +
        `• ${palmas} palmas, ${maos} mãos, ${polegares} polegares\n` +
        `• As restrições actuais têm um propósito\n\n` +
        `**Porque funciona:**\n` +
        `• Treinas o corpo gradualmente\n` +
        `• Evitas o efeito "dieta" tradicional\n` +
        `• Crias hábitos sustentáveis\n\n` +
        `A consistência é mais importante que a perfeição. Segue o plano e confia no processo!`;
    }

    // ========== TREINO ==========
    if (texto.match(/treino|exerc|muscula/)) {
      if (diasTreino.length > 0) {
        return `Sobre os dias de treino:\n\n` +
          `📅 **Os teus dias:** ${diasTreino.map(d => ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][d-1]).join(', ')}\n\n` +
          `**Nesses dias:**\n` +
          `• +1 mão concha de hidratos (total: ${maos + 1} mãos)\n` +
          `• Proteína mantém-se: ${palmas} palmas\n` +
          `• Gordura mantém-se: ${polegares} polegares\n\n` +
          `**Dica:** Coloca os hidratos extra à volta do treino (antes ou depois).`;
      } else {
        return `Ainda não definiste os dias de treino.\n\n` +
          `Vai a "Meu Plano" para configurar. Nos dias de treino, tens direito a +1 mão concha de hidratos.`;
      }
    }

    // ========== FOME ==========
    if (texto.match(/fome|saciedade|craving/)) {
      return `Para controlar a fome:\n\n` +
        `**Estratégias do método:**\n` +
        `• Proteína em TODAS as refeições (${palmas} palmas/dia)\n` +
        `• Legumes à vontade - enchem o prato sem "gastar" porções\n` +
        `• Não saltes refeições\n` +
        `• Bebe água antes de comer\n\n` +
        `**Se tiveres fome entre refeições:**\n` +
        `• Snack com proteína (ovo cozido, iogurte)\n` +
        `• Legumes crus\n` +
        `• Verifica se estás a cumprir as ${palmas} palmas de proteína\n\n` +
        `Se tens fome constante, pode ser sinal de que precisas de ajustar algo. Diz-me mais!`;
    }

    // ========== ÁGUA ==========
    if (texto.match(/[áa]gua|beber|hidrat|litro/)) {
      return `Sobre a hidratação:\n\n` +
        `💧 **Meta:** Mínimo 2L por dia\n\n` +
        `**Dicas práticas:**\n` +
        `• 1 copo ao acordar\n` +
        `• 1 copo antes de cada refeição\n` +
        `• Garrafa sempre por perto\n\n` +
        `**Se treinas:** +500ml por hora de exercício\n\n` +
        `A água ajuda na digestão e na sensação de saciedade.`;
    }

    // ========== SONO ==========
    if (texto.match(/sono|dormir|descanso/)) {
      return `O sono é fundamental para a adaptação metabólica!\n\n` +
        `**Porque importa:**\n` +
        `• Regula as hormonas da fome\n` +
        `• Permite recuperação\n` +
        `• Afecta as escolhas alimentares\n\n` +
        `**Meta:** 7-8 horas por noite\n\n` +
        `**Dicas:**\n` +
        `• Jantar leve, 2-3h antes de dormir\n` +
        `• Evita ecrãs antes de dormir\n` +
        `• Horário consistente`;
    }

    // ========== MOTIVAÇÃO ==========
    if (texto.match(/motiv|desanima|dificil|cansar|desistir/)) {
      return `${nome ? nome + ', entendo' : 'Entendo'} que pode ser difícil. Mas estás aqui!\n\n` +
        `**Lembra-te:**\n` +
        `• O método é progressivo por uma razão\n` +
        `• Consistência > Perfeição\n` +
        `• Cada refeição é uma nova oportunidade\n\n` +
        `**O que te posso perguntar:**\n` +
        `• O que está a ser mais difícil?\n` +
        `• Estás a conseguir as ${palmas} palmas de proteína?\n` +
        `• Como está o sono?\n\n` +
        `Conta-me mais - posso ajudar com estratégias específicas.`;
    }

    // ========== SAUDAÇÕES ==========
    if (texto.match(/^(ol[aá]|oi|bom dia|boa tarde|boa noite)\b/)) {
      return `Olá${nome ? ' ' + nome : ''}! 👋\n\nComo posso ajudar?\n\n` +
        `Posso esclarecer dúvidas sobre:\n` +
        `• As tuas porções (${palmas} palmas, ${maos} mãos, ${polegares} polegares)\n` +
        `• Como montar as refeições\n` +
        `• O que priorizar ou evitar\n` +
        `• A tua fase actual`;
    }

    // ========== RESPOSTA PADRÃO ==========
    return `${nome ? nome + ', posso' : 'Posso'} ajudar-te com o teu plano!\n\n` +
      `**As tuas porções (fase ${fase}):**\n` +
      `• ${palmas} palmas de proteína\n` +
      `• ${maos} mãos concha de hidratos${diasTreino.length > 0 ? ` (+1 no treino)` : ''}\n` +
      `• ${polegares} polegares de gordura\n` +
      `• Legumes à vontade\n\n` +
      `Pergunta-me sobre:\n` +
      `• Como medir as porções\n` +
      `• Como distribuir pelas refeições\n` +
      `• O que priorizar ou evitar`;
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || enviando) return;
    setEnviando(true);
    const textoEnviado = novaMensagem;
    const msgUser = {
      id: Date.now(), texto: textoEnviado, remetente: 'user', timestamp: new Date().toISOString()
    };
    const novasMsgs = [...mensagens, msgUser];
    setMensagens(novasMsgs);
    setNovaMensagem('');

    setTimeout(() => {
      const resposta = gerarRespostaVivianne(textoEnviado);
      const msgCoach = {
        id: Date.now() + 1, texto: resposta, remetente: 'coach', timestamp: new Date().toISOString()
      };
      const msgsFinais = [...novasMsgs, msgCoach];
      setMensagens(msgsFinais);
      localStorage.setItem(`vitalis-chat-${userId}`, JSON.stringify(msgsFinais));
      setEnviando(false);
    }, 500 + Math.random() * 500);
  };

  const limparConversa = () => {
    if (!confirm('Limpar conversa?')) return;
    localStorage.removeItem(`vitalis-chat-${userId}`);
    const nome = client?.nome_completo?.split(' ')[0] || 'querida';
    setMensagens([{
      id: Date.now(),
      texto: `Olá ${nome}! 👋\n\nSou a Vivianne. Como posso ajudar com o teu plano de adaptação metabólica?`,
      remetente: 'coach',
      timestamp: new Date().toISOString()
    }]);
  };

  const formatarHora = (timestamp) => new Date(timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

  const formatarData = (timestamp) => {
    const data = new Date(timestamp);
    const hoje = new Date();
    const ontem = new Date(hoje); ontem.setDate(ontem.getDate() - 1);
    if (data.toDateString() === hoje.toDateString()) return 'Hoje';
    if (data.toDateString() === ontem.toDateString()) return 'Ontem';
    return data.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
  };

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
          <p className="text-[#6B5C4C]">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E4DC] flex flex-col">
      <header className="bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/vitalis/dashboard" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">←</Link>
            <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-2xl">👩‍⚕️</div>
            <div className="flex-1">
              <h1 className="font-bold">Vivianne</h1>
              <p className="text-white/70 text-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Nutricionista
              </p>
            </div>
            <button onClick={limparConversa} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm hover:bg-white/30">🗑️</button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {Object.entries(mensagensAgrupadas).map(([data, msgs]) => (
            <div key={data}>
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 bg-white/80 rounded-full text-xs text-gray-500">{data}</span>
              </div>
              {msgs.map((msg) => (
                <div key={msg.id} className={`flex ${msg.remetente === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.remetente === 'user' ? 'bg-[#7C8B6F] text-white rounded-br-md' : 'bg-white text-gray-800 rounded-bl-md shadow'}`}>
                    <p className="whitespace-pre-line text-sm leading-relaxed">{msg.texto}</p>
                    <p className={`text-xs mt-1 ${msg.remetente === 'user' ? 'text-white/70' : 'text-gray-400'}`}>{formatarHora(msg.timestamp)}</p>
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

      <div className="bg-white/50 px-4 py-2 overflow-x-auto">
        <div className="max-w-2xl mx-auto flex gap-2">
          {[
            { texto: 'Como medir porções?', emoji: '🖐️' },
            { texto: 'O que posso comer?', emoji: '✅' },
            { texto: 'Como distribuir?', emoji: '📊' },
            { texto: 'Tenho fome', emoji: '😋' },
          ].map((quick, i) => (
            <button key={i} onClick={() => setNovaMensagem(quick.texto)} className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap shadow-sm">
              <span>{quick.emoji}</span><span>{quick.texto}</span>
            </button>
          ))}
        </div>
      </div>

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
          <button onClick={enviarMensagem} disabled={!novaMensagem.trim() || enviando} className="w-12 h-12 bg-[#7C8B6F] text-white rounded-full flex items-center justify-center hover:bg-[#6B7A5D] transition-colors disabled:opacity-50">➤</button>
        </div>
      </div>
    </div>
  );
}
