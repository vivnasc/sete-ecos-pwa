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
          texto: `Olá ${nome}! 👋\n\nSou a Vivianne. Estou aqui para te ajudar a entender o teu plano de adaptação metabólica.\n\nPergunta-me sobre:\n• As tuas porções (palmas, punhos, mãos, polegares)\n• Como montar os pratos\n• O que priorizar ou evitar na tua fase\n• Jejum intermitente e ciência por trás\n• Hormonas (insulina, grelina, leptina)\n• Autofagia e renovação celular\n\nComo posso ajudar?`,
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

    // ========== PERGUNTA SOBRE ALIMENTO / "POSSO COMER...?" ==========
    const ePerguntaAlimento =
      texto.match(/(posso|pode|devo|consigo|funciona).*(comer|tomar|beber|na\s*(indu|fase|estab|reeduc|ceto))/) ||
      texto.match(/(comer|tomar|beber).*(pode|posso|devo)/) ||
      texto.match(/pode.*(na|nesta|durante).*(indu|fase|estab|reeduc|ceto)/) ||
      texto.match(/\+.*(pode|posso|bom|ok)\b/);

    if (ePerguntaAlimento) {
      const temProteina = !!texto.match(/ovo|frango|galinha|peixe|carne|bife|atum|salmao|iogurte|queijo|whey|peru|porco|borrego|tofu|fiambre|presunto|sardinha|camarao|lula|polvo/);
      const temHidrato = !!texto.match(/pao|arroz|batata|aveia|massa|esparguete|banana|fruta|cereal|tamara|quinoa|milho|mandioca|feijao|grao|lentilha|bolacha|tosta/);
      const temGordura = !!texto.match(/abacate|azeite|manteiga|nozes|amendoim|coco|amendoa|castanha|noz\b|azeitona|ghee/);
      const temLegume = !!texto.match(/salada|brocol|espinafre|couve|legume|tomate|pepino|cenoura|alface|courgette|cogumelo/);

      if (temProteina || temHidrato || temGordura || temLegume) {
        let resp = `${nome ? nome + ', ' : ''}`;

        if (faseRestritiva && temHidrato) {
          resp += `podes, mas atenção ao hidrato!\n\n`;
          if (temProteina) resp += `✅ Proteína — perfeito\n`;
          resp += `⚠️ Hidrato — conta para as tuas **${maos} mãos/dia**\n`;
          if (temGordura) resp += `✅ Gordura boa — excelente na tua fase\n`;
          if (temLegume) resp += `✅ Legumes — à vontade\n`;
          resp += `\nNa fase **${fase}** tens ${maos} mãos de hidratos por dia. Esta refeição gasta 1 mão. Se for a única dessa refeição, está OK!\n\n`;
          resp += `Queres uma alternativa sem hidratos?`;
        } else if (temHidrato && !temProteina) {
          resp += `falta proteína nessa refeição!\n\n`;
          if (temHidrato) resp += `✅ Hidrato (${maos} mãos/dia)\n`;
          if (temGordura) resp += `✅ Gordura\n`;
          if (temLegume) resp += `✅ Legumes\n`;
          resp += `\n**Sugestão:** Junta proteína (ovos, frango, iogurte grego) — deve estar em todas as refeições principais. As tuas ${palmas} palmas diárias são fundamentais!`;
        } else {
          resp += `sim, boa combinação! ✅\n\n`;
          if (temProteina) resp += `✅ Proteína\n`;
          if (temHidrato) resp += `✅ Hidrato (${maos} mãos/dia)\n`;
          if (temGordura) resp += `✅ Gordura boa\n`;
          if (temLegume) resp += `✅ Legumes\n`;
          resp += `\nEncaixa na fase **${fase}**. Conta nas porções diárias (${palmas}P ${maos}H ${polegares}G).`;
        }

        return resp;
      }
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
          `**Ideias para a tua fase:**\n• Ovos mexidos com bacon e queijo\n• Café keto (café + óleo coco + manteiga)\n• Omelete com cogumelos e abacate\n• Batido proteico (whey + leite amêndoa)\n• Iogurte grego com sementes` :
          `**Ideias:**\n• Ovos com bacon ou fiambre\n• Batido de whey com aveia\n• Iogurte grego com fruta\n• Omelete + tosta integral`}\n\n` +
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
        `**Exemplos de proteína:**\n` +
        `• Bife de vaca, frango, peru\n` +
        `• Salmão, pescada, atum\n` +
        `• Costeletas de porco\n\n` +
        `**Como montar o prato:**\n` +
        `• Metade do prato = legumes\n` +
        `• Um quarto = proteína (cozinhada em ghee/azeite)\n` +
        `• Um quarto = hidratos (se tiveres na fase)\n\n` +
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
          `**Ideias para a tua fase:**\n• Bife com cogumelos em manteiga\n• Salmão com legumes e azeite\n• Hambúrguer caseiro sem pão\n• Omelete com queijo e salada\n• Sopa cremosa com frango` :
          `**Ideias:**\n• Peixe grelhado com batata doce\n• Frango ao forno com arroz\n• Carne estufada com legumes`}\n\n` +
        `Janta pelo menos 2-3h antes de dormir.`;
    }

    // ========== PROTEÍNA ==========
    if (texto.match(/proteina|prote[íi]na/)) {
      return `Sobre a proteína no teu plano:\n\n` +
        `🖐️ **A tua meta: ${palmas} palmas por dia**\n\n` +
        `**Uma palma equivale a:**\n` +
        `• Frango, peru (tamanho da palma)\n` +
        `• Carne de vaca, porco, borrego\n` +
        `• Peixe (salmão, pescada, atum)\n` +
        `• 2-3 ovos = 1 palma\n` +
        `• Whey protein (1 scoop) = 1 palma\n\n` +
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
    if (texto.match(/gordura|azeite|abacate|oleagino|polegar|coco|ghee|manteiga|mct/)) {
      const respBase = `Sobre a gordura no teu plano:\n\n` +
        `👍 **A tua meta: ${polegares} polegares por dia**\n\n` +
        `**Um polegar equivale a:**\n` +
        `• 1 colher de sopa de azeite/óleo (≈ 2 polegares)\n` +
        `• 1/4 de abacate (≈ 2 polegares)\n` +
        `• Punhado pequeno de frutos secos (≈ 2 polegares)\n` +
        `• 1 colher de manteiga/ghee (≈ 1 polegar)\n\n` +
        `**Fontes a priorizar:**\n` +
        `• Azeite extra virgem (temperar)\n` +
        `• Ghee ou manteiga (cozinhar)\n` +
        `• Óleo de coco (cozinhar, café keto)\n` +
        `• Abacate\n` +
        `• Frutos secos e sementes\n` +
        `• Azeitonas\n` +
        `• Peixes gordos (salmão, sardinha)\n`;

      if (faseRestritiva) {
        return respBase + `\n**Na tua fase (${fase}):**\n` +
          `A gordura é a tua principal fonte de energia! Podes aumentar:\n` +
          `• Café keto (café + óleo coco + manteiga)\n` +
          `• MCT oil para energia rápida\n` +
          `• Coco ralado em receitas`;
      }
      return respBase + `\nA gordura boa é essencial - ajuda na saciedade e na absorção de vitaminas.`;
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
    if (texto.match(/treino|exerc|muscula/) && !texto.match(/ramad/)) {
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

    // ========== CAFÉ KETO / BULLETPROOF ==========
    if (texto.match(/caf[eé]\s*keto|bulletproof|caf[eé].*coco|caf[eé].*manteiga/)) {
      return `O Café Keto (Bulletproof):\n\n` +
        `☕ **Receita:**\n` +
        `• 1 café expresso ou longo\n` +
        `• 1 colher de óleo de coco ou MCT\n` +
        `• 1 colher de manteiga ou ghee\n` +
        `• Bater tudo no liquidificador\n\n` +
        `**Porções:** ≈ 3 polegares de gordura\n\n` +
        `**Quando usar:**\n` +
        `• Energia matinal sem hidratos\n` +
        `• Jejum intermitente prolongado\n` +
        `• Treino em jejum\n\n` +
        `${faseRestritiva ? '✅ Excelente para a tua fase!' : '⚠️ Usa com moderação se não estás em fase restritiva.'}`;
    }

    // ========== WHEY / BATIDOS ==========
    if (texto.match(/whey|batido|shake|protein.*po/)) {
      return `Sobre Whey e Batidos:\n\n` +
        `🥤 **1 scoop de whey = 1 palma de proteína**\n\n` +
        `**Batido rápido:**\n` +
        `• 1 scoop whey\n` +
        `• Leite de amêndoa ou água\n` +
        `• 1 colher de manteiga de amendoim\n` +
        `• Gelo\n\n` +
        `**Porções:** ~2 palmas P + 1-2 polegares G\n\n` +
        `**Quando usar:**\n` +
        `• Pequeno-almoço rápido\n` +
        `• Pós-treino\n` +
        `• Snack proteico\n\n` +
        `${faseRestritiva ? 'Evita adicionar fruta! Usa cacau em pó ou canela.' : 'Podes adicionar fruta se quiseres.'}`;
    }

    // ========== RAMADÃO - RESPOSTAS ESPECÍFICAS (antes da geral!) ==========

    // SUHOOR ESPECÍFICO
    if (texto.match(/suhoor|suhur|antes.*amanhecer|refeicao.*madrugada/)) {
      const protSuhoor = Math.round(palmas * 0.4);
      const hidSuhoor = Math.round(maos * 0.4);
      const gorSuhoor = Math.round(polegares * 0.4);
      return `🌅 ${nome ? nome + ', o' : 'O'} Suhoor faz toda a diferença no teu dia!\n\n` +
        `O segredo é: **energia lenta**. Queres aguentar até ao Iftar sem aquela quebra a meio da tarde.\n\n` +
        `Para ti: ${protSuhoor} palmas proteína + ${hidSuhoor} mão hidratos complexos + ${gorSuhoor} polegares gordura.\n\n` +
        `**3 combos rápidos que funcionam:**\n` +
        `🥚 Ovos mexidos + pão integral + abacate\n` +
        `🥣 Aveia com iogurte grego + tâmaras + nozes\n` +
        `🥤 Batido de whey + banana + manteiga de amendoim\n\n` +
        `Dica: bebe pelo menos 500ml de água e evita o muito salgado (aumenta a sede). Qual destes combos te atrai mais?`;
    }

    // IFTAR ESPECÍFICO
    if (texto.match(/iftar|quebr.*jejum|por.?do.?sol|abrir.*jejum/)) {
      const protIftar = Math.round(palmas * 0.6);
      const hidIftar = Math.round(maos * 0.6);
      return `🌇 ${nome ? nome + ', ' : ''}O Iftar é o momento de nutrir o corpo com calma e gratidão.\n\n` +
        `**O ritual que funciona:**\n` +
        `1️⃣ Tâmaras + água (restaura a glicose suavemente)\n` +
        `2️⃣ Pausa para oração\n` +
        `3️⃣ Refeição equilibrada: ${protIftar} palmas proteína + ${hidIftar} mãos hidratos + legumes à vontade\n\n` +
        `O erro mais comum? Comer tudo de uma vez, muito rápido. O estômago está mais sensível — come devagar, saboreia.\n\n` +
        `**Uma ideia para hoje:** Sopa de lentilhas para começar + prato principal com proteína e legumes. Que achas?`;
    }

    // TÂMARAS
    if (texto.match(/t[aâ]mara|tamara|datil/)) {
      return `🌴 As tâmaras são um alimento incrível!\n\n` +
        `3 tâmaras (~75g) dão-te energia rápida, fibra e minerais como potássio e magnésio. No método Vitalis, contam como ~1 mão concha de hidratos.\n\n` +
        `São ideais para:\n` +
        `• Quebrar o jejum no Iftar (tradição com base científica!)\n` +
        `• No Suhoor com iogurte e nozes\n` +
        `• Como snack natural entre Iftar e Suhoor\n\n` +
        `Queres que te sugira uma combinação com tâmaras para o teu próximo Suhoor ou Iftar?`;
    }

    // HIDRATAÇÃO RAMADÃO
    if (texto.match(/(hidrat|agua|beber).*ramad|(ramad).*(hidrat|agua|beber)|sede.*ramad/)) {
      return `💧 ${nome ? nome + ', a' : 'A'} hidratação é mesmo o maior desafio, não é?\n\n` +
        `O truque é distribuir ao longo da noite, nunca tudo de uma vez:\n` +
        `• 🌇 Iftar: 2-3 copos com calma\n` +
        `• 🌙 Durante a noite: vai bebendo aos poucos\n` +
        `• 🌅 Suhoor: mais 2 copos\n` +
        `• Meta: 2-2.5L no total\n\n` +
        `**Dica prática:** Sopas e alimentos ricos em água (melancia, pepino) ajudam muito! E cuidado com a cafeína — é diurética.\n\n` +
        `Estás a conseguir beber o suficiente? Conta-me como está a correr.`;
    }

    // EXERCÍCIO RAMADÃO
    if (texto.match(/(exerc|treino|trein).*ramad|(ramad).*(exerc|treino|trein)/)) {
      return `🏃‍♀️ Sim, podes e deves continuar a mexer-te!\n\n` +
        `Mas adapta — o teu corpo está a trabalhar diferente durante o jejum.\n\n` +
        `**Melhor horário:** 30-60 min antes do Iftar\n` +
        `Porquê? Treino leve, e logo comes e hidrata a seguir. A autofagia está no pico!\n\n` +
        `**Como adaptar:**\n` +
        `• Intensidade: reduz 30-40% do habitual\n` +
        `• Duração: 30-45 min é suficiente\n` +
        `• Caminhadas e yoga são excelentes opções\n` +
        `• Se sentires tonturas, PARA — ouve o teu corpo\n\n` +
        `${diasTreino.length > 0 ? `Os teus dias de treino (${diasTreino.map(d => ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d-1]).join(', ')}) mantêm as porções extra. ` : ''}Como tem sido o teu treino durante o jejum?`;
    }

    // RAMADÃO GERAL (apanha o que não foi capturado acima)
    if (texto.match(/ramad[aã]o|ramadan|jejum.*sagrado|mes.*sagrado/)) {
      return `🌙 ${nome ? nome + ', R' : 'R'}amadan Mubarak!\n\n` +
        `Que bom que estás aqui. O Ramadão é um período especial e o teu corpo merece atenção extra.\n\n` +
        `Como te estás a sentir? Posso ajudar-te com:\n` +
        `• Como estás a gerir a energia durante o dia?\n` +
        `• Tens sentido mais fome ou cansaço do que o esperado?\n` +
        `• Precisas de ideias práticas para o Suhoor ou Iftar?\n\n` +
        `As tuas porções diárias mantêm-se (${palmas}P ${maos}H ${polegares}G), só distribuímos em 2 momentos.\n\n` +
        `Diz-me o que precisas e eu adapto ao teu dia. Também tens o 📖 **Guia Ramadão** completo na app com tudo detalhado!`;
    }

    // ========== JEJUM INTERMITENTE ==========
    if (texto.match(/jejum|fasting|16.?8|intermitente/)) {
      return `${nome ? nome + ', o' : 'O'} jejum intermitente é uma das ferramentas mais poderosas do método Vitalis.\n\n` +
        `**Como funciona:** defines uma janela para comer e jejuas no resto.\n\n` +
        `**Protocolos:**\n` +
        `• **16:8** — 16h jejum, 8h alimentação (o mais comum)\n` +
        `• **14:10** — mais suave para começar\n` +
        `• **18:6** — mais avançado\n\n` +
        `**O que acontece no corpo:**\n` +
        `• Insulina baixa → queima gordura\n` +
        `• Autofagia (limpeza celular) activa após 16h\n` +
        `• A fome adapta-se em 1-2 semanas\n\n` +
        `${faseRestritiva ?
          `**Para a tua fase:** O jejum potencia a adaptação. Experimenta 16:8 — almoço + jantar com as tuas porções (${palmas}P ${maos}H ${polegares}G).` :
          `**Para ti:** Experimenta 14:10 ou 16:8. Última refeição até às 20h, primeira às 10h-12h.`}\n\n` +
        `Não é obrigatório, mas funciona muito bem! Queres ajuda a planear a tua janela?`;
    }

    // ========== HORMONAS ==========
    if (texto.match(/hormon|grelina|insulina|leptina|cortisol/)) {
      return `${nome ? nome + ', as' : 'As'} hormonas-chave na alimentação:\n\n` +
        `📉 **Insulina** — ${faseRestritiva ? 'a tua fase mantém-na baixa = corpo queima gordura' : 'porções controladas evitam picos = menos armazenamento de gordura'}\n\n` +
        `🍽️ **Grelina** (fome) — é um HÁBITO! Adapta-se em 1-2 semanas. A fome que sentes antes da refeição habitual vai passar.\n\n` +
        `✋ **Leptina** (saciedade) — diz ao cérebro "chega". O método Vitalis melhora esta sensibilidade.\n\n` +
        `😰 **Cortisol** (stress) — níveis altos = gordura abdominal. Dorme bem e come regularmente.\n\n` +
        `Qual destas queres perceber melhor?`;
    }

    // ========== AUTOFAGIA ==========
    if (texto.match(/autofag|limpeza celular|renovar celula|detox real/)) {
      return `${nome ? nome + ', a' : 'A'} autofagia é a "limpeza celular" do corpo — as células reciclam partes danificadas e renovam-se. Prémio Nobel de 2016!\n\n` +
        `**Quando se activa:**\n` +
        `• Após 12-14h de jejum começa gradualmente\n` +
        `• Pico às 16-18h — é aqui que a magia acontece\n\n` +
        `**Benefícios:** anti-envelhecimento, prevenção de doenças, preserva músculo.\n\n` +
        `**Como potenciar:**\n` +
        `• Jejum 16:8 ou mais\n` +
        `• Exercício (especialmente em jejum)\n` +
        `• Café — sim, o café activa autofagia!\n\n` +
        `${faseRestritiva ?
          `Na tua fase, já estás a beneficiar! O jejum + baixos hidratos maximiza este processo.` :
          `É um dos maiores benefícios do jejum intermitente. Queres experimentar?`}`;
    }

    // ========== FOME ==========
    if (texto.match(/fome|saciedade|craving/)) {
      return `Para controlar a fome:\n\n` +
        `**Estratégias do método:**\n` +
        `• Proteína em TODAS as refeições que fizeres (${palmas} palmas/dia)\n` +
        `• Legumes à vontade - enchem o prato sem "gastar" porções\n` +
        `• Gordura dá saciedade prolongada\n` +
        `• Bebe água - muitas vezes confundimos sede com fome\n\n` +
        `**Sobre a fome:**\n` +
        `• A grelina (hormona da fome) é um HÁBITO\n` +
        `• Adapta-se em 1-2 semanas a novos horários\n` +
        `• Fome antes da refeição habitual é normal - vai passar!\n\n` +
        `**Se sentires fome:**\n` +
        `• Água ou chá primeiro\n` +
        `• Snack com proteína + gordura (ovo, iogurte grego, queijo)\n` +
        `• ${faseRestritiva ? 'Café keto pode ajudar a prolongar o jejum' : 'Verifica se estás a cumprir as porções de proteína'}\n\n` +
        `Se tens fome constante, pode ser sinal de que precisas de mais proteína ou gordura.`;
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

    // ========== MÉTODO VITALIS / O QUE É ==========
    if (texto.match(/o que [eé] ?(o )?(m[eé]todo )?vitalis|como funciona o (m[eé]todo|vitalis)|explica.*m[eé]todo|sobre o m[eé]todo/i)) {
      return `O Método Vitalis:\n\n` +
        `**O que é?**\n` +
        `É um programa de reeducação alimentar baseado no Precision Nutrition, o método científico mais respeitado mundialmente (84% taxa de sucesso).\n\n` +
        `**3 Pilares:**\n` +
        `🖐️ **Porções com a mão** - Sem contar calorias, só medir com a mão\n` +
        `⏰ **Jejum flexível** - Janelas alimentares adaptadas a ti\n` +
        `💜 **Apoio emocional** - Espaço de Retorno único\n\n` +
        `**As 3 Fases:**\n` +
        `1️⃣ **Indução** (4-6 semanas): Activar queima de gordura\n` +
        `2️⃣ **Estabilização** (6-8 semanas): Consolidar hábitos\n` +
        `3️⃣ **Reeducação** (6-8 semanas): Autonomia alimentar\n\n` +
        `Tu estás na fase: **${fase}** com ${palmas}P ${maos}H ${polegares}G`;
    }

    // ========== COMO USAR A APP ==========
    if (texto.match(/como (usar|funciona|uso) ?(a )?app|navegar|onde (fica|est[aá])|funcionalidades/i)) {
      return `Como usar a app Vitalis:\n\n` +
        `**📊 Dashboard (página inicial)**\n` +
        `• Vê o teu progresso, streak, XP\n` +
        `• Regista água, refeições, sono, treino\n` +
        `• Controla o jejum intermitente\n\n` +
        `**🍽️ Plano Alimentar**\n` +
        `• Vê as tuas porções personalizadas\n` +
        `• Lista de alimentos recomendados\n\n` +
        `**🍳 Receitas**\n` +
        `• Centenas de receitas adaptadas\n` +
        `• Filtros por refeição e tempo\n\n` +
        `**📅 Calendário**\n` +
        `• Planeia a semana inteira\n\n` +
        `**🛒 Lista de Compras**\n` +
        `• Gerada automaticamente\n` +
        `• Partilha por WhatsApp\n\n` +
        `**💡 Sugestões**\n` +
        `• "O que comer agora?"\n\n` +
        `**📖 Guia** - Manual completo da app`;
    }

    // ========== ESPAÇO DE RETORNO ==========
    if (texto.match(/espa[cç]o.*retorno|quando.*emo[cç]|fome.*emocional|comer.*sentimento/i)) {
      return `O Espaço de Retorno:\n\n` +
        `É o nosso sistema único de apoio emocional - para quando a emoção pede comida.\n\n` +
        `**Como funciona (90 segundos):**\n` +
        `1️⃣ **Identificar** - Qual é a emoção?\n` +
        `2️⃣ **Pausar** - Interrompe o impulso automático\n` +
        `3️⃣ **Aliviar** - Usa a resposta adequada\n` +
        `4️⃣ **Escolher** - Decide com clareza\n\n` +
        `**Estados que reconhecemos:**\n` +
        `🔋 Cansaço → Descanso, não comida\n` +
        `🌀 Ansiedade → Respiração, movimento\n` +
        `💧 Tristeza → Conexão, auto-compaixão\n` +
        `🔥 Raiva → Movimento físico, expressão\n` +
        `◯ Vazio → Propósito, criatividade\n` +
        `🌑 Solidão → Conexão humana\n\n` +
        `Acede em: Dashboard → Espaço de Retorno`;
    }

    // ========== FASES DO MÉTODO ==========
    if (texto.match(/fase|indu[cç][aã]o|estabiliza[cç][aã]o|reeduca[cç][aã]o|qual.*fase/i)) {
      return `As Fases do Método Vitalis:\n\n` +
        `**Tu estás na fase: ${fase}**\n\n` +
        `**1️⃣ INDUÇÃO (4-6 semanas)**\n` +
        `• Hidratos reduzidos (≤2 mãos)\n` +
        `• Activar queima de gordura\n` +
        `• Corpo aprende a usar gordura como combustível\n` +
        `• Possível: fadiga inicial, desejos\n\n` +
        `**2️⃣ ESTABILIZAÇÃO (6-8 semanas)**\n` +
        `• Hidratos aumentam gradualmente (3-4 mãos)\n` +
        `• Consolidar hábitos sem rigidez\n` +
        `• Introduzir flexibilidade\n` +
        `• Aprender a ouvir o corpo\n\n` +
        `**3️⃣ REEDUCAÇÃO (6-8 semanas)**\n` +
        `• Autonomia alimentar completa\n` +
        `• Liberdade para escolher\n` +
        `• Sem culpa, sem restrição mental\n` +
        `• Comer intuitivo guiado\n\n` +
        `A transição de fase é avaliada individualmente.`;
    }

    // ========== PORÇÕES / COMO MEDIR ==========
    if (texto.match(/por[cç][oõ]es|como medir|quanto.*comer|minha.*meta|minhas.*por[cç][oõ]es/i)) {
      return `As Tuas Porções Personalizadas:\n\n` +
        `**Fase actual: ${fase}**\n\n` +
        `🖐️ **PROTEÍNA: ${palmas} palmas/dia**\n` +
        `Uma palma = porção do tamanho da tua palma\n` +
        `Ex: frango, peixe, carne, ovos\n\n` +
        `🤲 **HIDRATOS: ${maos} mãos concha/dia**\n` +
        `${diasTreino.length > 0 ? `(+1 mão nos dias de treino)\n` : ''}` +
        `Uma mão concha = porção na tua mão em concha\n` +
        `Ex: arroz, batata, fruta, aveia\n\n` +
        `👍 **GORDURA: ${polegares} polegares/dia**\n` +
        `Um polegar = porção do tamanho do polegar\n` +
        `Ex: azeite, abacate, frutos secos\n\n` +
        `🥬 **LEGUMES: À vontade!**\n` +
        `Sem limite - come o que quiseres\n\n` +
        `📍 **Dica:** Usa a TUA mão - é personalizado ao teu tamanho!`;
    }

    // ========== STREAK / GAMIFICAÇÃO ==========
    if (texto.match(/streak|sequencia|dias.*seguidos|xp|pontos|conquista|badge/i)) {
      return `Sistema de Gamificação:\n\n` +
        `**🔥 Streak (Sequência)**\n` +
        `• Dias consecutivos com pelo menos 1 registo\n` +
        `• Água, refeição, sono ou treino contam\n` +
        `• Marcos: 3, 7, 14, 30, 60 dias\n\n` +
        `**⭐ XP (Pontos de Experiência)**\n` +
        `• Ganhas XP por cada conquista\n` +
        `• Sobe de nível a cada 500 XP\n` +
        `• Níveis: Semente → Broto → Planta → Árvore → Floresta → Jardim → Paraíso → Lenda\n\n` +
        `**🏆 Conquistas**\n` +
        `• Primeiro registo: 50 XP\n` +
        `• Streak de 7 dias: 200 XP\n` +
        `• 50 registos de água: 150 XP\n` +
        `• E muitas mais!\n\n` +
        `Vê todas as tuas conquistas no Dashboard!`;
    }

    // ========== REGISTAR / COMO REGISTAR ==========
    if (texto.match(/como regist|registar|adicionar|marcar/i)) {
      return `Como Registar na App:\n\n` +
        `**💧 Água**\n` +
        `Dashboard → Secção Água → Clica no copo\n` +
        `Cada clique = 250ml\n\n` +
        `**🍽️ Refeições**\n` +
        `Dashboard → Secção Refeições → "+ Adicionar"\n` +
        `Escolhe o tipo e as porções\n\n` +
        `**😴 Sono**\n` +
        `Dashboard → Secção Sono → Clica para registar\n` +
        `Indica horas e qualidade\n\n` +
        `**🏋️ Treino**\n` +
        `Dashboard → Secção Treino → "+ Registar"\n` +
        `Escolhe tipo e duração\n\n` +
        `**⏰ Jejum**\n` +
        `Dashboard → Timer de Jejum → "Iniciar/Terminar"\n\n` +
        `**Dica:** Registar diariamente mantém o teu streak!`;
    }

    // ========== SNACKS / LANCHES ==========
    if (texto.match(/snack|lanche|meio.?manha|meio.?tarde|merenda/)) {
      return `Sobre snacks e lanches:\n\n` +
        `**Opções rápidas (contam nas porções):**\n` +
        `• 1 iogurte grego natural = ~0.5 palma proteína\n` +
        `• 2-3 ovos cozidos = 1 palma proteína\n` +
        `• Punhado de amêndoas = 2 polegares gordura\n` +
        `• Queijo + 2 nozes = proteína + gordura\n` +
        `• Batido whey = 1 palma proteína\n\n` +
        `${faseRestritiva ?
          `**Na tua fase, prioriza:**\n• Snacks ricos em gordura e proteína\n• Evita fruta e cereais` :
          `**Opções com hidratos:**\n• Maçã + manteiga de amendoim\n• Iogurte grego com aveia`}\n\n` +
        `**Dica:** Snacks devem complementar, não substituir refeições principais.`;
    }

    // ========== ÁLCOOL ==========
    if (texto.match(/alcool|vinho|cerveja|bebida.*alcoo|beber.*alcool/)) {
      return `Sobre álcool e o método Vitalis:\n\n` +
        `**O que deves saber:**\n` +
        `• O álcool é metabolizado primeiro - pausa a queima de gordura\n` +
        `• Aumenta a fome e reduz a disciplina alimentar\n` +
        `• Afecta a qualidade do sono (menos recuperação)\n\n` +
        `${faseRestritiva ?
          `**Na tua fase (${fase}):**\nRecomendo evitar completamente. Estás num período de adaptação metabólica importante.` :
          `**Se fores beber:**\n• Prefere vinho tinto (1-2 copos)\n• Evita cocktails doces e cerveja\n• Não bebas de estômago vazio\n• Hidrata bem antes e depois`}\n\n` +
        `**A regra dos 80/20:** Se 80% do tempo estiveres no caminho certo, uma ocasião especial não vai arruinar o progresso.`;
    }

    // ========== SUPLEMENTOS ==========
    if (texto.match(/suplement|vitamin|omega|magnesio|creatina|colageno/)) {
      return `Sobre suplementos:\n\n` +
        `**Essenciais (se não obtens pela alimentação):**\n` +
        `• **Vitamina D** - especialmente se pouca exposição solar\n` +
        `• **Ómega 3** - se não comes peixe gordo 2-3x/semana\n` +
        `• **Magnésio** - ajuda no sono e recuperação muscular\n\n` +
        `**Úteis no método Vitalis:**\n` +
        `• **Whey Protein** - para atingir as ${palmas} palmas\n` +
        `${faseRestritiva ? `• **Electrólitos** - importante em fases low carb\n• **MCT Oil** - energia rápida sem hidratos\n` : ''}` +
        `• **Colágeno** - para pele e articulações\n\n` +
        `**Não substitui comida!** Suplementos são complemento, não base.`;
    }

    // ========== COMER FORA / RESTAURANTE ==========
    if (texto.match(/restaurante|comer fora|festa|evento|jantar.*fora|almoco.*fora/)) {
      return `Comer fora seguindo o método:\n\n` +
        `**Antes de ir:**\n` +
        `• Consulta o menu online se possível\n` +
        `• Não vás com muita fome (snack proteico antes)\n\n` +
        `**No restaurante:**\n` +
        `• Pede a proteína grelhada/assada (não frita)\n` +
        `• Troca batatas fritas por legumes ou salada\n` +
        `• Pede molhos à parte\n` +
        `• Controla o pão antes da refeição\n\n` +
        `**Montagem do prato:**\n` +
        `• Visualiza as tuas porções (${palmas} palmas/dia)\n` +
        `• Metade legumes, um quarto proteína, um quarto resto\n\n` +
        `${faseRestritiva ?
          `**Na tua fase:** Escolhe grelhados sem molhos, pede legumes extra em vez de acompanhamentos.` :
          `**Flexibilidade:** Uma refeição fora do plano não arruina a semana. Desfruta e volta ao normal na próxima.`}`;
    }

    // ========== AÇÚCAR / DOCES ==========
    if (texto.match(/acucar|doce|sobremesa|chocolate|gelado|bolo/)) {
      return `Sobre açúcar e doces:\n\n` +
        `**A verdade:**\n` +
        `• O açúcar provoca picos de insulina\n` +
        `• Quanto mais comes, mais queres (viciante)\n` +
        `• Engorda porque estimula o armazenamento\n\n` +
        `${faseRestritiva ?
          `**Na tua fase actual:**\nDoces estão fora. Mas tens alternativas:\n• Chocolate 85%+ cacau (1-2 quadrados)\n• Mousse de abacate com cacau\n• Gelatina sem açúcar\n• Frutos vermelhos em pequena quantidade` :
          `**Estratégias:**\n• Guarda doces para ocasiões especiais\n• Chocolate negro (70%+) em vez de ao leite\n• Se vais comer, faz parte da refeição (nunca sozinho)`}\n\n` +
        `**Vontade de doce?**\n` +
        `• Pode ser falta de proteína\n` +
        `• Pode ser desidratação\n` +
        `• Pode ser hábito (quebre o ciclo!)`;
    }

    // ========== CONSTIPAÇÃO / DIGESTÃO ==========
    if (texto.match(/obstip|prisao.*ventre|intestino|diges|barriga.*inchada|gases/)) {
      return `Sobre digestão e intestino:\n\n` +
        `**Causas comuns de inchaço:**\n` +
        `• Pouca fibra (legumes insuficientes)\n` +
        `• Pouca água (meta: 2L/dia)\n` +
        `• Mudança brusca de alimentação\n` +
        `• Comer muito rápido\n\n` +
        `**Soluções:**\n` +
        `• Aumenta os legumes gradualmente\n` +
        `• Bebe água ao longo do dia (não só às refeições)\n` +
        `• Sementes de linhaça ou chia (1 colher/dia)\n` +
        `• Caminha após refeições\n\n` +
        `${faseRestritiva ?
          `**Em fases restritivas:** É normal alguma mudança intestinal nas primeiras 1-2 semanas. O corpo está a adaptar-se.` :
          `**Probióticos:** Iogurte natural, kefir ou suplemento podem ajudar.`}\n\n` +
        `Se persistir por mais de 2 semanas, consulta um profissional.`;
    }

    // ========== RETENÇÃO / PESO NÃO DESCE ==========
    if (texto.match(/reten|peso.*para|peso.*desce|estagnado|plateau|nao.*perco|nao.*emagreco/)) {
      return `Peso estagnado? Vamos analisar:\n\n` +
        `**Primeiro, verifica:**\n` +
        `• Estás a cumprir as porções exactas?\n` +
        `• Estás a contar os "pequenos extras"?\n` +
        `• Dormes bem (7-8h)?\n` +
        `• Bebes água suficiente?\n\n` +
        `**O peso flutua!**\n` +
        `• Retenção de água (sal, ciclo menstrual, stress)\n` +
        `• Ganho de músculo (se treinas)\n` +
        `• Não uses a balança como única métrica\n\n` +
        `**Estratégias para quebrar plateau:**\n` +
        `• Refeed day (1 dia com +2 mãos de hidratos)\n` +
        `• Mudar horários das refeições\n` +
        `• Adicionar/mudar tipo de exercício\n` +
        `• Verificar se não estás a comer de menos(!)\n\n` +
        `**Paciência:** Às vezes o corpo precisa de tempo para se ajustar. Confia no processo!`;
    }

    // ========== MENSTRUAÇÃO / CICLO ==========
    if (texto.match(/menstrua|periodo|ciclo|tpm|antes.*periodo/)) {
      return `Alimentação e ciclo menstrual:\n\n` +
        `**Fase Pré-menstrual (TPM):**\n` +
        `• Aumento de fome é NORMAL (metabolismo acelera)\n` +
        `• Retenção de água pode aumentar 1-3kg\n` +
        `• Vontade de doces é hormonal\n\n` +
        `**O que fazer:**\n` +
        `• Aumenta ligeiramente as porções (+1 palma proteína)\n` +
        `• Magnésio ajuda nas cãibras\n` +
        `• Chocolate negro 85% para a vontade\n` +
        `• Não te peses nesta fase!\n\n` +
        `**Durante a menstruação:**\n` +
        `• Mantém as porções normais\n` +
        `• Hidrata bem\n` +
        `• Alimentos ricos em ferro (carne vermelha, espinafres)\n\n` +
        `**Pós-menstruação:** Melhor altura para ser mais estrita - energia e disposição aumentam!`;
    }

    // ========== STRESS / EMOCIONAL ==========
    if (texto.match(/stress|ansiedade|nervos|emocional|comer.*emocao|comfor.*food/)) {
      return `Alimentação emocional:\n\n` +
        `**Reconhecer:**\n` +
        `• Fome real vs fome emocional\n` +
        `• Fome real: cresce gradualmente, qualquer comida satisfaz\n` +
        `• Fome emocional: súbita, específica, nunca satisfaz\n\n` +
        `**Estratégias:**\n` +
        `• Pausa antes de comer (5 respirações profundas)\n` +
        `• Pergunta: "Estou mesmo com fome?"\n` +
        `• Bebe água primeiro\n` +
        `• Caminha 10 minutos antes de decidir\n\n` +
        `**Alternativas ao comfort food:**\n` +
        `• Chá quente\n` +
        `• Banho quente\n` +
        `• Ligar a alguém\n` +
        `• Escrever o que sentes\n\n` +
        `**Compaixão:** Se comeres por emoção, não te castigues. Identifica o gatilho e aprende para a próxima.`;
    }

    // ========== VEGETARIANO / VEGAN ==========
    if (texto.match(/vegetariano|vegan|sem.*carne|nao.*como.*carne/)) {
      return `Opções vegetarianas no método:\n\n` +
        `**Fontes de proteína vegetariana:**\n` +
        `• Ovos (se comes) - excelente fonte\n` +
        `• Tofu/tempeh - 1 palma = 100-150g\n` +
        `• Leguminosas (feijão, grão, lentilhas)\n` +
        `• Iogurte grego e queijo\n` +
        `• Seitan (se não és celíaco)\n\n` +
        `**Combinações completas:**\n` +
        `• Arroz + feijão = proteína completa\n` +
        `• Hummus + pão integral\n` +
        `• Tofu + quinoa\n\n` +
        `**Nota importante:**\n` +
        `• Proteína vegetal é menos biodisponível\n` +
        `• Pode precisar de +1 palma para igualar animal\n` +
        `• Suplementar B12 se vegan\n\n` +
        `O método funciona, mas requer mais planeamento.`;
    }

    // ========== SONO E ALIMENTAÇÃO ==========
    if (texto.match(/insonia|dormir.*mal|acordar.*noite|sono.*ruim/)) {
      return `Alimentação para melhor sono:\n\n` +
        `**O que afecta o sono:**\n` +
        `• Cafeína após 14h\n` +
        `• Refeição pesada à noite\n` +
        `• Álcool (parece ajudar mas prejudica qualidade)\n` +
        `• Açúcar à noite\n\n` +
        `**Jantar ideal:**\n` +
        `• ${Math.round(palmas * 0.35)} palmas de proteína\n` +
        `• Legumes à vontade\n` +
        `• Hidratos leves (se a tua fase permite)\n` +
        `• 2-3h antes de deitar\n\n` +
        `**Alimentos que ajudam:**\n` +
        `• Peixes gordos (ómega 3)\n` +
        `• Frutos secos (magnésio)\n` +
        `• Chá de camomila\n` +
        `• Kiwi antes de dormir\n\n` +
        `**Rotina:** Evita ecrãs 1h antes, quarto fresco e escuro.`;
    }

    // ========== EXERCÍCIO E ALIMENTAÇÃO ==========
    if (texto.match(/comer.*antes.*treino|comer.*depois.*treino|pre.?treino|pos.?treino/)) {
      return `Alimentação à volta do treino:\n\n` +
        `**PRÉ-TREINO (1-2h antes):**\n` +
        `• 1 palma de proteína\n` +
        `• 1 mão concha de hidratos (se treino intenso)\n` +
        `• Pouca gordura (digestão lenta)\n\n` +
        `**Exemplos:**\n` +
        `• Iogurte grego + banana\n` +
        `• Omelete + tosta\n` +
        `• Batido whey + aveia\n\n` +
        `**PÓS-TREINO (até 2h depois):**\n` +
        `• 1-2 palmas de proteína (fundamental!)\n` +
        `• Hidratos para repor glicogénio\n` +
        `• É a melhor altura para comer hidratos!\n\n` +
        `**Lembra-te:** Nos teus dias de treino (${diasTreino.length > 0 ? diasTreino.map(d => ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d-1]).join(', ') : 'não definidos'}), tens +1 mão concha de hidratos.`;
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

    // ========== AJUDA / COMANDOS ==========
    if (texto.match(/ajuda|help|o que (sabes|podes)|comandos|perguntas/)) {
      return `${nome ? nome + ', posso' : 'Posso'} ajudar com muitos temas!\n\n` +
        `**📏 Porções e Medidas:**\n` +
        `• "Como medir porções?"\n` +
        `• "Quanto devo comer de proteína?"\n` +
        `• "Quantos hidratos posso comer?"\n\n` +
        `**🍽️ Refeições:**\n` +
        `• "O que comer ao pequeno-almoço?"\n` +
        `• "Ideias para o almoço"\n` +
        `• "Snacks saudáveis"\n\n` +
        `**🔬 Ciência e Método:**\n` +
        `• "O que é jejum intermitente?"\n` +
        `• "Autofagia"\n` +
        `• "Hormonas da fome"\n\n` +
        `**💪 Situações Específicas:**\n` +
        `• "Comer fora de casa"\n` +
        `• "Peso estagnado"\n` +
        `• "Alimentação e treino"\n` +
        `• "Alimentação emocional"\n\n` +
        `**🌙 Ramadão:**\n` +
        `• "Ramadão" - apoio durante o mês sagrado\n` +
        `• "Suhoor" / "Iftar" - dicas práticas\n` +
        `• "Hidratação ramadão" / "Exercício ramadão"\n\n` +
        `Pergunta o que quiseres!`;
    }

    // ========== OBRIGADA / FEEDBACK ==========
    if (texto.match(/obrigad|agradec|muito (util|bom)|ajudou/)) {
      return `${nome ? 'De nada, ' + nome : 'De nada'}! 😊\n\n` +
        `Fico feliz em ajudar. Lembra-te:\n` +
        `• As tuas porções: ${palmas}P ${maos}H ${polegares}G\n` +
        `• Fase actual: ${fase}\n` +
        `• Consistência > Perfeição\n\n` +
        `Estou aqui sempre que precisares!`;
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
      `• O que priorizar ou evitar\n` +
      `• Jejum intermitente e autofagia\n` +
      `• Situações específicas (restaurantes, treino, etc.)\n\n` +
      `Escreve "ajuda" para ver todos os temas disponíveis!`;
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
    <div className="fixed inset-0 bg-[#F5F1EB] flex flex-col" style={{ paddingBottom: '64px' }}>
      {/* Header - Vivianne sempre visível */}
      <header className="bg-gradient-to-r from-[#7C8B6F] to-[#5D6B4F] text-white shadow-md z-10 flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/vitalis/dashboard" className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg hover:bg-white/30 transition-colors">←</Link>
            <img src="/logos/VITALIS_LOGO_V3.png" alt="Vivianne" className="w-11 h-11 rounded-full bg-white/90 object-contain shadow-sm flex-shrink-0 p-1" />
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-base">Vivianne</h1>
              <p className="text-white/80 text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Coach Vitalis
              </p>
            </div>
            <button onClick={limparConversa} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-sm hover:bg-white/25 transition-colors" title="Limpar conversa">🗑️</button>
          </div>
        </div>
      </header>

      {/* Mensagens - scrollable */}
      <main className="flex-1 overflow-y-auto px-3 py-3">
        <div className="max-w-2xl mx-auto space-y-1">
          {Object.entries(mensagensAgrupadas).map(([data, msgs]) => (
            <div key={data}>
              <div className="flex justify-center my-3">
                <span className="px-3 py-0.5 bg-white/70 rounded-full text-[11px] text-gray-500 shadow-sm">{data}</span>
              </div>
              {msgs.map((msg) => (
                <div key={msg.id} className={`flex ${msg.remetente === 'user' ? 'justify-end' : 'justify-start'} mb-2.5`}>
                  {msg.remetente === 'coach' && (
                    <div className="w-7 h-7 rounded-full bg-[#7C8B6F] flex items-center justify-center flex-shrink-0 mr-2 mt-1 shadow-sm"><span className="text-white text-xs font-bold">V</span></div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                    msg.remetente === 'user'
                      ? 'bg-[#7C8B6F] text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                  }`}>
                    <p className="whitespace-pre-line text-[13px] leading-relaxed">{msg.texto}</p>
                    <p className={`text-[10px] mt-1 text-right ${msg.remetente === 'user' ? 'text-white/60' : 'text-gray-400'}`}>{formatarHora(msg.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {enviando && (
            <div className="flex justify-start mb-2.5">
              <div className="w-7 h-7 rounded-full bg-[#7C8B6F] flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-1 shadow-sm">👩‍⚕️</div>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm rounded-bl-sm border border-gray-100">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Sugestões rápidas */}
      <div className="bg-[#F5F1EB] border-t border-gray-200/60 px-3 py-2 flex-shrink-0">
        <div className="max-w-2xl mx-auto overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 pb-0.5" style={{ WebkitOverflowScrolling: 'touch' }}>
            {[
              { texto: 'Porções', emoji: '🖐️' },
              { texto: 'Refeições', emoji: '🍽️' },
              { texto: 'Jejum', emoji: '⏰' },
              { texto: 'Ramadão', emoji: '🌙' },
              { texto: 'Treino', emoji: '💪' },
              { texto: 'Peso', emoji: '⚖️' },
              { texto: 'Ajuda', emoji: '❓' },
            ].map((quick, i) => (
              <button key={i} onClick={() => { setNovaMensagem(quick.texto); }} className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-full text-xs text-[#6B5C4C] hover:bg-[#7C8B6F] hover:text-white whitespace-nowrap shadow-sm border border-gray-200/80 transition-colors flex-shrink-0">
                <span>{quick.emoji}</span><span>{quick.texto}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-3 py-2.5 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
            placeholder="Pergunta à Vivianne..."
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]/50 focus:bg-white transition-colors"
          />
          <button onClick={enviarMensagem} disabled={!novaMensagem.trim() || enviando} className="w-10 h-10 bg-[#7C8B6F] text-white rounded-full flex items-center justify-center hover:bg-[#5D6B4F] transition-colors disabled:opacity-40 flex-shrink-0 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
