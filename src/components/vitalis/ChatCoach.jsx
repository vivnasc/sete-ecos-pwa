import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';

// ============================================================
// VIVIANNE - COACH INTELIGENTE COM CONHECIMENTO DO PLANO
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

      if (clientData) {
        setClient(clientData);

        // Carregar plano completo da utilizadora
        const { data: planoData } = await supabase
          .from('vitalis_plano')
          .select('*')
          .eq('client_id', clientData.id)
          .single();

        if (planoData) {
          setPlano(planoData);

          // Carregar dados do plano do dia (com regras da fase)
          const { data: planoDia } = await supabase.rpc('vitalis_plano_do_dia', {
            p_user_id: userData.id
          });

          if (planoDia && !planoDia.erro) {
            setPlanoCompleto(planoDia);
          }
        }
      }

      // Carregar mensagens do localStorage
      const msgsSalvas = JSON.parse(localStorage.getItem(`vitalis-chat-${userData.id}`) || '[]');

      if (msgsSalvas.length === 0) {
        const nome = clientData?.nome_completo?.split(' ')[0] || 'querida';
        const fase = planoCompleto?.fase?.nome || 'actual';

        const boasVindas = {
          id: Date.now(),
          texto: `Olá ${nome}! 👋\n\nSou a Vivianne, a tua nutricionista. Estou aqui para te ajudar a entender melhor o teu plano e esclarecer qualquer dúvida.\n\nPergunta-me o que quiseres sobre:\n• O teu plano e porções\n• Distribuição das refeições\n• Alimentos permitidos e a evitar\n• Dúvidas sobre nutrição\n\nComo posso ajudar-te hoje?`,
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

  // ============================================================
  // SISTEMA DE RESPOSTA INTELIGENTE DA VIVIANNE
  // ============================================================
  const gerarRespostaVivianne = (pergunta) => {
    const texto = pergunta.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const nome = client?.nome_completo?.split(' ')[0] || '';

    // Dados do plano
    const porcoesProteina = plano?.porcoes_proteina || 6;
    const porcoesHidratos = plano?.porcoes_hidratos || 3;
    const porcoesGordura = plano?.porcoes_gordura || 8;
    const calorias = plano?.calorias_diarias || 1500;
    const fase = planoCompleto?.fase?.nome || 'Inicial';
    const diasTreino = plano?.dias_treino || [];
    const aceitaJejum = plano?.aceita_jejum || false;
    const protocoloJejum = plano?.protocolo_jejum || '16_8';

    // Regras da fase
    const priorizar = planoCompleto?.regras?.priorizar || [];
    const evitar = planoCompleto?.regras?.evitar || [];
    const dicas = planoCompleto?.regras?.dicas || [];

    // Verificar se está em fase restritiva (low carb, cetogénica, etc.)
    const faseRestritiva = fase.toLowerCase().includes('ceto') ||
                          fase.toLowerCase().includes('low') ||
                          porcoesHidratos <= 2;

    // ========== MACROS E DISTRIBUIÇÃO ==========
    if (texto.match(/distribui|distribuicao|dividir|repartir|pelas refeic/)) {
      return `${nome ? nome + ', a' : 'A'} distribuição ideal para o teu plano:\n\n` +
        `📊 **As tuas porções diárias:**\n` +
        `• Proteína: ${porcoesProteina} porções\n` +
        `• Hidratos: ${porcoesHidratos} porções${diasTreino.length > 0 ? ' (+1 nos dias de treino)' : ''}\n` +
        `• Gordura: ${porcoesGordura} porções\n\n` +
        `**Sugestão de distribuição:**\n\n` +
        `🌅 **Pequeno-almoço** (25%):\n` +
        `• ${Math.round(porcoesProteina * 0.25)}-${Math.round(porcoesProteina * 0.3)} proteína\n` +
        `• ${Math.round(porcoesHidratos * 0.3)}-${Math.round(porcoesHidratos * 0.35)} hidratos\n` +
        `• ${Math.round(porcoesGordura * 0.25)} gordura\n\n` +
        `☀️ **Almoço** (35%):\n` +
        `• ${Math.round(porcoesProteina * 0.35)} proteína\n` +
        `• ${Math.round(porcoesHidratos * 0.35)}-${Math.round(porcoesHidratos * 0.4)} hidratos\n` +
        `• ${Math.round(porcoesGordura * 0.3)} gordura\n\n` +
        `🌙 **Jantar** (30%):\n` +
        `• ${Math.round(porcoesProteina * 0.35)} proteína\n` +
        `• ${Math.round(porcoesHidratos * 0.25)}-${Math.round(porcoesHidratos * 0.3)} hidratos\n` +
        `• ${Math.round(porcoesGordura * 0.3)} gordura\n\n` +
        `${faseRestritiva ? '⚠️ Nota: Estás numa fase com hidratos reduzidos. Prioriza proteína e gordura boas.' : ''}`;
    }

    // Macros iguais?
    if (texto.match(/(igual|mesmo|identic).*(macro|refeic|almoco|jantar|pequeno)/i) ||
        texto.match(/macro.*(igual|mesmo)/i)) {
      return `Não, os macros NÃO precisam ser iguais em todas as refeições! 📊\n\n` +
        `O importante é atingires os totais diários:\n` +
        `• Proteína: ${porcoesProteina} porções\n` +
        `• Hidratos: ${porcoesHidratos} porções\n` +
        `• Gordura: ${porcoesGordura} porções\n\n` +
        `**O que deve ser consistente:**\n` +
        `✅ Proteína em TODAS as refeições (para saciedade)\n\n` +
        `**O que pode variar:**\n` +
        `⚖️ Hidratos - mais de manhã/almoço, menos ao jantar\n` +
        `⚖️ Gordura - pode compensar quando reduces hidratos\n\n` +
        `${diasTreino.length > 0 ? `Nos teus dias de treino (${diasTreino.map(d => ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d-1]).join(', ')}), adiciona +1 porção de hidratos.` : ''}`;
    }

    // ========== PEQUENO-ALMOÇO ==========
    if (texto.match(/pequeno.?almoco|manha|pa\b|breakfast/)) {
      const protPA = Math.round(porcoesProteina * 0.25);
      const hidPA = Math.round(porcoesHidratos * 0.3);
      const gorPA = Math.round(porcoesGordura * 0.25);

      let sugestoes = '';
      if (faseRestritiva) {
        sugestoes = `**Sugestões para a tua fase:**\n` +
          `• Ovos mexidos com espinafres e queijo\n` +
          `• Iogurte grego com sementes e canela\n` +
          `• Omelete de vegetais\n\n` +
          `⚠️ Evita: cereais açucarados, pão branco, sumos`;
      } else {
        sugestoes = `**Sugestões:**\n` +
          `• Papas de aveia com proteína e frutos vermelhos\n` +
          `• Ovos + tosta integral + abacate\n` +
          `• Iogurte grego + granola + banana`;
      }

      return `Para o TEU pequeno-almoço, recomendo:\n\n` +
        `🥩 Proteína: ${protPA}-${protPA + 0.5} porções\n` +
        `🍚 Hidratos: ${hidPA}-${hidPA + 0.5} porções\n` +
        `🥑 Gordura: ${gorPA}-${gorPA + 0.5} porções\n\n` +
        sugestoes;
    }

    // ========== ALMOÇO ==========
    if (texto.match(/\balmoco\b|meio.?dia|lunch/)) {
      const protAlm = Math.round(porcoesProteina * 0.35);
      const hidAlm = Math.round(porcoesHidratos * 0.35);
      const gorAlm = Math.round(porcoesGordura * 0.3);

      return `Para o TEU almoço (a refeição principal):\n\n` +
        `🥩 Proteína: ${protAlm}-${protAlm + 0.5} porções (~${protAlm * 100}g carne/peixe)\n` +
        `🥬 Vegetais: À vontade! Metade do prato\n` +
        `🍚 Hidratos: ${hidAlm}-${hidAlm + 0.5} porções\n` +
        `🥑 Gordura: ${gorAlm} porções (azeite na salada)\n\n` +
        `${faseRestritiva ?
          '**Na tua fase actual:**\nReduz os hidratos e aumenta vegetais e proteína. Ex: Salada grande com frango grelhado e azeite.' :
          '**Sugestões:**\nFrango/peixe + arroz/batata + legumes salteados'}\n\n` +
        `${evitar.length > 0 ? `⚠️ Evita: ${evitar.slice(0, 3).join(', ')}` : ''}`;
    }

    // ========== JANTAR ==========
    if (texto.match(/jantar|noite|dinner/)) {
      const protJan = Math.round(porcoesProteina * 0.35);
      const hidJan = Math.round(porcoesHidratos * 0.25);

      return `Para o TEU jantar (mais leve):\n\n` +
        `🥩 Proteína: ${protJan} porções (essencial!)\n` +
        `🥬 Vegetais: Abundantes\n` +
        `🍚 Hidratos: ${hidJan}-${hidJan + 0.5} porções (menos que ao almoço)\n` +
        `🥑 Gordura: ${Math.round(porcoesGordura * 0.3)} porções\n\n` +
        `${faseRestritiva ?
          '**Para a tua fase:**\nPeixe grelhado + salada grande OU sopa de legumes + ovo' :
          '**Sugestões:**\nPeixe ao forno com vegetais OU salada com proteína'}\n\n` +
        `💡 Janta 2-3h antes de dormir para melhor digestão e sono.`;
    }

    // ========== FRUTA ==========
    if (texto.match(/fruta|frutos|banana|maca|laranja|morango/)) {
      if (faseRestritiva || evitar.some(e => e.toLowerCase().includes('fruta'))) {
        return `⚠️ ${nome ? nome + ', na' : 'Na'} tua fase actual (${fase}), a fruta está limitada.\n\n` +
          `**Porquê?**\nA fruta contém frutose (açúcar) que pode dificultar os teus objectivos nesta fase.\n\n` +
          `**O que podes comer:**\n` +
          `• Frutos vermelhos em pequena quantidade (morangos, mirtilos) - têm menos açúcar\n` +
          `• Abacate (tecnicamente é fruta, mas é gordura boa)\n` +
          `• Limão/lima para temperar\n\n` +
          `**Evitar por agora:**\n` +
          `• Banana, manga, uvas (muito açúcar)\n` +
          `• Sumos de fruta (mesmo naturais)\n\n` +
          `Quando avançares de fase, poderás reintroduzir mais fruta. Por agora, foca nos vegetais para fibra e vitaminas.`;
      } else {
        return `A fruta faz parte do teu plano! 🍎\n\n` +
          `**Recomendação:** 2-3 peças por dia\n\n` +
          `**Melhores opções:**\n` +
          `• Frutos vermelhos (baixo açúcar, muitos antioxidantes)\n` +
          `• Maçã, pêra (fibra, saciam)\n` +
          `• Citrinos (vitamina C)\n\n` +
          `**Melhores momentos:**\n` +
          `• Pequeno-almoço (com proteína)\n` +
          `• Lanche (com iogurte ou nozes)\n` +
          `• Pós-treino (ajuda na recuperação)\n\n` +
          `Evita comer fruta sozinha - combina sempre com proteína ou gordura para evitar picos de açúcar no sangue.`;
      }
    }

    // ========== O QUE COMER / O QUE EVITAR ==========
    if (texto.match(/o que (posso |devo )?(comer|coma)|permitido|pode comer/)) {
      return `${nome ? nome + ', no' : 'No'} teu plano actual (Fase: ${fase}):\n\n` +
        `✅ **PRIORIZAR:**\n${priorizar.length > 0 ? priorizar.map(p => `• ${p}`).join('\n') : '• Proteínas magras\n• Vegetais variados\n• Gorduras boas (azeite, abacate)'}\n\n` +
        `❌ **EVITAR:**\n${evitar.length > 0 ? evitar.map(e => `• ${e}`).join('\n') : '• Açúcar refinado\n• Processados\n• Álcool'}\n\n` +
        `${dicas.length > 0 ? `💡 **DICAS:**\n${dicas.map(d => `• ${d}`).join('\n')}` : ''}\n\n` +
        `Tens alguma dúvida específica sobre um alimento?`;
    }

    if (texto.match(/evitar|n[aã]o (posso|devo)|proibido|restri/)) {
      return `${nome ? nome + ', na' : 'Na'} tua fase actual deves EVITAR:\n\n` +
        `${evitar.length > 0 ? evitar.map(e => `❌ ${e}`).join('\n') : '❌ Açúcar refinado\n❌ Alimentos processados\n❌ Farinhas brancas\n❌ Álcool\n❌ Refrigerantes'}\n\n` +
        `${faseRestritiva ? '⚠️ Estás numa fase mais restritiva, por isso é importante seguir estas indicações para ver resultados.\n\n' : ''}` +
        `Se tiveres uma ocasião especial, fala comigo antes para planearmos!`;
    }

    // ========== PROTEÍNA ==========
    if (texto.match(/proteina|prote[íi]na/)) {
      return `Sobre proteína no TEU plano:\n\n` +
        `📊 **A tua meta:** ${porcoesProteina} porções/dia\n` +
        `(1 porção = ~20g proteína = palma da mão)\n\n` +
        `**Fontes recomendadas:**\n` +
        `• Frango/peru: 100g = 1 porção\n` +
        `• Peixe: 100g = 1 porção\n` +
        `• Ovos: 2-3 ovos = 1 porção\n` +
        `• Iogurte grego: 170g = ~0.75 porção\n\n` +
        `**Distribuição:**\n` +
        `• Peq. almoço: ${Math.round(porcoesProteina * 0.25)} porções\n` +
        `• Almoço: ${Math.round(porcoesProteina * 0.35)} porções\n` +
        `• Jantar: ${Math.round(porcoesProteina * 0.35)} porções\n\n` +
        `A proteína é ESSENCIAL em todas as refeições para manter saciedade e preservar massa muscular.`;
    }

    // ========== HIDRATOS ==========
    if (texto.match(/hidrato|carbo|carboidrato/)) {
      return `Sobre hidratos no TEU plano:\n\n` +
        `📊 **A tua meta:** ${porcoesHidratos} porções/dia\n` +
        `${diasTreino.length > 0 ? `(+1 porção nos dias de treino: ${diasTreino.map(d => ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d-1]).join(', ')})` : ''}\n\n` +
        `**Fontes permitidas:**\n` +
        `${faseRestritiva ?
          '• Vegetais (principal fonte nesta fase)\n• Leguminosas em moderação\n• Frutos vermelhos (pequenas quantidades)' :
          '• Aveia\n• Arroz integral\n• Batata doce\n• Leguminosas\n• Fruta'}\n\n` +
        `**Melhores momentos:**\n` +
        `• Pequeno-almoço (energia para o dia)\n` +
        `• Almoço (especialmente antes de treinar)\n` +
        `• Menos ao jantar\n\n` +
        `${faseRestritiva ? '⚠️ Estás numa fase com hidratos reduzidos - isto é intencional para potenciar a perda de gordura.' : ''}`;
    }

    // ========== GORDURA ==========
    if (texto.match(/gordura|l[íi]pido|azeite|abacate|nozes|oleagino/)) {
      return `Sobre gordura no TEU plano:\n\n` +
        `📊 **A tua meta:** ${porcoesGordura} porções/dia\n` +
        `(1 porção = 1 polegar = ~7g gordura)\n\n` +
        `**Fontes BOAS (priorizar):**\n` +
        `• Azeite extra virgem (1 colher sopa = 2 porções)\n` +
        `• Abacate (1/4 = 2 porções)\n` +
        `• Frutos secos (punhado = 2 porções)\n` +
        `• Sementes (chia, linhaça)\n` +
        `• Peixes gordos (salmão, sardinha)\n\n` +
        `**Limitar:**\n` +
        `• Manteiga\n• Queijos gordos\n\n` +
        `**Evitar:**\n` +
        `• Óleos refinados\n• Fritos\n• Gorduras trans\n\n` +
        `Gordura boa é essencial - não tenhas medo dela!`;
    }

    // ========== JEJUM ==========
    if (texto.match(/jejum|fasting|janela/)) {
      if (aceitaJejum) {
        const horasJejum = protocoloJejum === '16_8' ? 16 : protocoloJejum === '18_6' ? 18 : 16;
        return `Sobre o TEU jejum intermitente:\n\n` +
          `📊 **Protocolo:** ${protocoloJejum.replace('_', ':')}\n` +
          `• ${horasJejum}h de jejum\n` +
          `• ${24 - horasJejum}h de janela alimentar\n\n` +
          `**Durante o jejum PODES:**\n` +
          `• Água (obrigatório!)\n` +
          `• Chá sem açúcar\n` +
          `• Café preto (sem leite)\n\n` +
          `**Durante o jejum EVITA:**\n` +
          `• Qualquer alimento\n` +
          `• Bebidas com calorias\n` +
          `• Pastilhas/rebuçados\n\n` +
          `💡 Se sentires muita fome, bebe água ou chá. O corpo adapta-se em 1-2 semanas.`;
      } else {
        return `O teu plano actual não inclui jejum intermitente.\n\n` +
          `Se tens interesse em experimentar, podemos discutir isso numa consulta. O jejum não é para todos e deve ser adaptado ao teu estilo de vida.`;
      }
    }

    // ========== TREINO ==========
    if (texto.match(/treino|exerc[íi]cio|muscula|academia|gin[áa]sio/)) {
      if (diasTreino.length > 0) {
        return `Sobre treino e alimentação:\n\n` +
          `📊 **Os teus dias de treino:** ${diasTreino.map(d => ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][d-1]).join(', ')}\n\n` +
          `**Nesses dias, tens:**\n` +
          `• +1 porção de hidratos (total: ${porcoesHidratos + 1})\n\n` +
          `**Antes do treino (1-2h):**\n` +
          `• Hidrato + proteína leve\n` +
          `• Ex: Banana + iogurte\n\n` +
          `**Depois do treino (até 1h):**\n` +
          `• Proteína + hidrato\n` +
          `• Ou uma refeição principal completa\n\n` +
          `Se treinas em jejum, quebra o jejum logo após com proteína.`;
      } else {
        return `Ainda não configuraste os teus dias de treino no plano.\n\n` +
          `Vai a "Meu Plano" no dashboard para definir os dias em que treinas. Isto permite-me ajustar os teus hidratos automaticamente.\n\n` +
          `Queres que te explique como a alimentação deve variar nos dias de treino?`;
      }
    }

    // ========== ÁGUA ==========
    if (texto.match(/[áa]gua|beber|hidrat|litro/)) {
      return `Sobre hidratação:\n\n` +
        `📊 **Meta diária:** Mínimo 2L de água\n\n` +
        `**Estratégias:**\n` +
        `• 1 copo ao acordar (antes de qualquer coisa)\n` +
        `• 1 copo antes de cada refeição\n` +
        `• Garrafa sempre à vista\n` +
        `• Usa a app para registar!\n\n` +
        `**Se treinas:** +500ml por hora de exercício\n\n` +
        `**Sinais de desidratação:**\n` +
        `• Urina escura\n` +
        `• Sede (já estás desidratada!)\n` +
        `• Fadiga, dor de cabeça\n\n` +
        `A água é fundamental para a perda de peso - ajuda na digestão e reduz retenção de líquidos.`;
    }

    // ========== SONO ==========
    if (texto.match(/sono|dormir|descanso|ins[óo]nia|cansa/)) {
      return `O sono é CRUCIAL para os teus resultados! 😴\n\n` +
        `**Porque importa:**\n` +
        `• Regula hormonas da fome (grelina/leptina)\n` +
        `• Recuperação muscular\n` +
        `• Menos cravings no dia seguinte\n` +
        `• Melhores decisões alimentares\n\n` +
        `**Meta:** 7-8 horas por noite\n\n` +
        `**Dicas:**\n` +
        `• Horário consistente (mesmo ao fim-de-semana)\n` +
        `• Evita ecrãs 1h antes\n` +
        `• Jantar leve, 2-3h antes de dormir\n` +
        `• Evita cafeína após 14h\n` +
        `• Quarto fresco e escuro\n\n` +
        `Dormir mal pode sabotar todo o resto do plano!`;
    }

    // ========== FOME / CRAVINGS ==========
    if (texto.match(/fome|craving|vontade|desejo|saciar|saciedade|apetite/)) {
      return `Para controlar fome e cravings:\n\n` +
        `**Estratégias:**\n` +
        `• Proteína em TODAS as refeições (${porcoesProteina} porções/dia)\n` +
        `• Muitos vegetais (fibra = saciedade)\n` +
        `• Bebe água antes de comer\n` +
        `• Come devagar (20 min mínimo)\n` +
        `• Não saltes refeições!\n\n` +
        `**Quando tens cravings:**\n` +
        `• Bebe água ou chá primeiro\n` +
        `• Espera 15-20 minutos\n` +
        `• Pergunta: é fome real ou emocional?\n\n` +
        `**Snacks seguros:**\n` +
        `• Iogurte grego\n` +
        `• Vegetais crus\n` +
        `• Punhado de nozes\n\n` +
        `Se tens MUITA fome consistentemente, o plano pode precisar de ajuste. Fala comigo!`;
    }

    // ========== MOTIVAÇÃO ==========
    if (texto.match(/motiv|desanima|dif[íi]cil|cansar|desistir|conseguir|for[çc]a/)) {
      return `${nome ? nome + ', entendo' : 'Entendo'} que por vezes é difícil. Mas estás aqui, e isso já mostra compromisso! 💚\n\n` +
        `**Lembra-te:**\n` +
        `• Progresso não é linear - haverá dias melhores e piores\n` +
        `• Consistência > Perfeição\n` +
        `• Cada refeição é uma nova oportunidade\n\n` +
        `**O que te posso perguntar:**\n` +
        `• O que está a ser mais difícil para ti?\n` +
        `• Há alguma situação específica que te desafia?\n` +
        `• Estás a dormir bem? (Afecta muito a motivação)\n\n` +
        `Conta-me mais sobre o que sentes - posso ajudar-te com estratégias específicas.`;
    }

    // ========== PESO ==========
    if (texto.match(/peso|emagrec|perder|balanca|kilo|kg/)) {
      const pesoInicial = client?.peso_inicial || 0;
      const pesoActual = client?.peso_actual || pesoInicial;
      const pesoMeta = client?.peso_meta || pesoActual;
      const perdido = pesoInicial - pesoActual;

      return `Sobre o teu progresso de peso:\n\n` +
        `📊 **Os teus números:**\n` +
        `• Peso inicial: ${pesoInicial}kg\n` +
        `• Peso actual: ${pesoActual}kg\n` +
        `• Meta: ${pesoMeta}kg\n` +
        `${perdido > 0 ? `• Já perdeste: ${perdido.toFixed(1)}kg! 🎉\n` : ''}\n` +
        `**Expectativas realistas:**\n` +
        `• 0.5-1kg por semana é saudável\n` +
        `• O peso flutua diariamente (água, hormonas)\n` +
        `• Mede também cintura e como a roupa fica\n\n` +
        `**Dica:** Não te peses todos os dias. Uma vez por semana, de manhã em jejum, é suficiente.`;
    }

    // ========== SAUDAÇÕES ==========
    if (texto.match(/^(ol[aá]|oi|bom dia|boa tarde|boa noite)\b/)) {
      return `Olá${nome ? ' ' + nome : ''}! 👋\n\nComo posso ajudar-te hoje?\n\n` +
        `Posso esclarecer dúvidas sobre:\n` +
        `• O teu plano e porções\n` +
        `• Distribuição de macros\n` +
        `• O que comer e evitar\n` +
        `• Treino e alimentação\n` +
        `• Ou qualquer outra questão nutricional!`;
    }

    // ========== RESPOSTA PADRÃO (com contexto) ==========
    return `${nome ? nome + ', posso' : 'Posso'} ajudar-te com questões sobre o teu plano! 💚\n\n` +
      `**O teu plano actual (${fase}):**\n` +
      `• ${porcoesProteina} porções proteína\n` +
      `• ${porcoesHidratos} porções hidratos\n` +
      `• ${porcoesGordura} porções gordura\n` +
      `• ~${calorias} kcal/dia\n\n` +
      `Pergunta-me sobre:\n` +
      `• Como distribuir as refeições\n` +
      `• O que comer e evitar\n` +
      `• Dúvidas sobre alimentos específicos\n` +
      `• Treino e alimentação\n` +
      `• Estratégias para fome/cravings`;
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

    // Resposta da Vivianne
    setTimeout(() => {
      const resposta = gerarRespostaVivianne(textoEnviado);

      const msgCoach = {
        id: Date.now() + 1,
        texto: resposta,
        remetente: 'coach',
        timestamp: new Date().toISOString()
      };

      const msgsFinais = [...novasMsgs, msgCoach];
      setMensagens(msgsFinais);
      localStorage.setItem(`vitalis-chat-${userId}`, JSON.stringify(msgsFinais));
      setEnviando(false);
    }, 600 + Math.random() * 800);
  };

  const limparConversa = () => {
    if (!confirm('Tens a certeza que queres limpar a conversa?')) return;
    localStorage.removeItem(`vitalis-chat-${userId}`);
    const nome = client?.nome_completo?.split(' ')[0] || 'querida';
    const boasVindas = {
      id: Date.now(),
      texto: `Olá ${nome}! 👋\n\nSou a Vivianne, a tua nutricionista. Estou aqui para te ajudar a entender melhor o teu plano e esclarecer qualquer dúvida.\n\nComo posso ajudar-te hoje?`,
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
                Nutricionista
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
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 bg-white/80 rounded-full text-xs text-gray-500">
                  {data}
                </span>
              </div>

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
            { texto: 'Como distribuir as refeições?', emoji: '📊' },
            { texto: 'O que posso comer?', emoji: '✅' },
            { texto: 'E a fruta?', emoji: '🍎' },
            { texto: 'Tenho fome', emoji: '😋' },
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
