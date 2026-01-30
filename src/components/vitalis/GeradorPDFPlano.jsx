// ============================================================
// VITALIS - GERADOR DE PDF DO PLANO ALIMENTAR
// ============================================================
// Gera PDF personalizado baseado nos dados do intake e plano
// Usa: jsPDF + html2canvas (instalar: npm install jspdf html2canvas)
// ============================================================

import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ============================================================
// CONFIGURAÇÕES DAS FASES
// ============================================================
const FASES_CONFIG = {
  inducao: {
    nome: 'Fase 1: Indução',
    emoji: '🔥',
    duracao: '3-4 semanas',
    descricao: 'A fase de arranque onde o corpo entra em modo de queima de gordura. Foco em proteína, gorduras saudáveis e vegetais.',
    cor: '#C1634A',
    priorizar: [
      'Proteína em todas as refeições',
      'Vegetais em abundância',
      'Gorduras saudáveis (azeite, abacate, nozes)',
      'Água (mínimo 2L por dia)',
      'Dormir 7-8 horas por noite'
    ],
    evitar: [
      'Açúcar e adoçantes',
      'Grãos e cereais (pão, massa, arroz)',
      'Frutas doces (banana, manga, uvas)',
      'Leguminosas',
      'Álcool'
    ],
    dicas: [
      'Prepara as refeições ao domingo para a semana',
      'Tem sempre snacks saudáveis à mão',
      'Nos primeiros dias podes sentir "keto flu" — é normal',
      'Pesa-te apenas às sextas-feiras, de manhã, em jejum'
    ]
  },
  estabilizacao: {
    nome: 'Fase 2: Estabilização',
    emoji: '⚖️',
    duracao: '6-8 semanas',
    descricao: 'O corpo começa a estabilizar. Reintroduzimos alguns hidratos de forma controlada.',
    cor: '#8B4513',
    priorizar: [
      'Manter proteína elevada',
      'Introduzir leguminosas aos poucos',
      'Frutas de baixo índice glicémico',
      'Continuar com vegetais abundantes'
    ],
    evitar: [
      'Açúcar refinado',
      'Farinhas brancas',
      'Alimentos processados',
      'Refrigerantes e sumos'
    ],
    dicas: [
      'Podes ter 1 refeição livre por semana',
      'Observa como o corpo reage aos novos alimentos',
      'Mantém o registo no check-in diário'
    ]
  },
  reeducacao: {
    nome: 'Fase 3: Reeducação',
    emoji: '🌱',
    duracao: '6-8 semanas',
    descricao: 'Aprende a fazer escolhas intuitivas. Flexibilidade com responsabilidade.',
    cor: '#6B8E23',
    priorizar: [
      'Escutar os sinais do corpo',
      'Variedade de alimentos naturais',
      'Refeições equilibradas',
      'Movimento regular'
    ],
    evitar: [
      'Comer por emoção',
      'Pular refeições',
      'Alimentos ultra-processados'
    ],
    dicas: [
      'Pratica comer com atenção plena',
      '1-2 refeições livres por semana',
      'Foca em como te sentes, não só no peso'
    ]
  },
  manutencao: {
    nome: 'Fase 4: Manutenção',
    emoji: '🏆',
    duracao: 'Contínua',
    descricao: 'Mantém os resultados com autonomia. O plano agora é teu estilo de vida.',
    cor: '#5D4E6D',
    priorizar: [
      'Manter hábitos construídos',
      'Alimentação intuitiva',
      'Actividade física regular',
      'Equilíbrio mental e emocional'
    ],
    evitar: [
      'Voltar aos velhos hábitos',
      'Mentalidade de "dieta"',
      'Restrição excessiva'
    ],
    dicas: [
      'Usa o Espaço de Retorno quando precisares',
      'Revê os teus objectivos periodicamente',
      'Celebra as tuas conquistas'
    ]
  }
};

// ============================================================
// LISTAS DE ALIMENTOS
// ============================================================
const ALIMENTOS = {
  proteinas: {
    titulo: '🥩 Proteínas Saudáveis',
    categorias: [
      {
        nome: 'Carnes Vermelhas (magras)',
        items: ['Bife de vaca', 'Carne moída magra', 'Lombo de porco', 'Cabrito', 'Borrego', 'Fígado']
      },
      {
        nome: 'Aves',
        items: ['Peito de frango', 'Coxa de frango (sem pele)', 'Peru', 'Pato (sem pele)', 'Codorniz']
      },
      {
        nome: 'Peixes & Mariscos',
        items: ['Salmão', 'Atum', 'Sardinha', 'Carapau', 'Pescada', 'Tilápia', 'Camarão', 'Lulas']
      },
      {
        nome: 'Ovos & Lacticínios',
        items: ['Ovos inteiros', 'Queijo fresco', 'Iogurte grego natural', 'Requeijão']
      }
    ]
  },
  hidratos: {
    titulo: '🍚 Hidratos Saudáveis',
    categorias: [
      {
        nome: 'Tubérculos & Grãos',
        items: ['Batata-doce', 'Mandioca', 'Inhame', 'Arroz integral', 'Quinoa', 'Aveia']
      },
      {
        nome: 'Frutas (baixo IG)',
        items: ['Frutos vermelhos', 'Maçã verde', 'Pera', 'Laranja', 'Toranja', 'Kiwi']
      }
    ]
  },
  gorduras: {
    titulo: '🥑 Gorduras Saudáveis',
    categorias: [
      {
        nome: 'Óleos & Manteigas',
        items: ['Azeite extra-virgem', 'Óleo de coco', 'Manteiga', 'Ghee']
      },
      {
        nome: 'Frutos Secos & Sementes',
        items: ['Amêndoas', 'Nozes', 'Cajus', 'Sementes de chia', 'Sementes de linhaça']
      },
      {
        nome: 'Outras Fontes',
        items: ['Abacate', 'Azeitonas', 'Coco', 'Chocolate negro (+70%)']
      }
    ]
  },
  vegetais: {
    titulo: '🥬 Vegetais (À Vontade!)',
    cores: [
      { cor: 'Verdes', emoji: '🟢', items: 'Espinafre, Couve, Brócolos, Alface, Rúcula, Pepino, Abobrinha' },
      { cor: 'Vermelhos', emoji: '🔴', items: 'Tomate, Pimento vermelho, Beterraba, Rabanete' },
      { cor: 'Laranjas', emoji: '🟠', items: 'Cenoura, Abóbora, Pimento laranja' },
      { cor: 'Brancos', emoji: '⚪', items: 'Couve-flor, Cogumelos, Alho, Cebola, Nabo' },
      { cor: 'Roxos', emoji: '🟣', items: 'Beringela, Couve roxa, Cebola roxa' }
    ]
  }
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function GeradorPDFPlano({ userId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [dadosPlano, setDadosPlano] = useState(null);
  const [error, setError] = useState(null);
  const [progresso, setProgresso] = useState(0);
  const pdfRef = useRef(null);

  // Carregar dados do plano
  const carregarDados = async () => {
    try {
      setLoading(true);
      setProgresso(10);

      // Buscar dados do cliente
      const { data: cliente, error: clienteError } = await supabase
        .from('vitalis_clients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (clienteError) throw clienteError;
      setProgresso(30);

      // Buscar intake
      const { data: intake, error: intakeError } = await supabase
        .from('vitalis_intake')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (intakeError) throw intakeError;
      setProgresso(50);

      // Buscar plano
      const { data: plano, error: planoError } = await supabase
        .from('vitalis_plano')
        .select('*')
        .eq('client_id', cliente.id)
        .single();

      if (planoError) throw planoError;
      setProgresso(70);

      // Buscar user para nome
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('nome')
        .eq('id', userId)
        .single();

      setProgresso(90);

      // Compilar dados (nomes correspondem à estrutura real da tabela vitalis_plano)
      setDadosPlano({
        nome: user?.nome || intake?.nome || 'Cliente',
        peso_actual: plano?.peso_actual || plano?.peso_inicial,
        peso_meta: plano?.peso_meta,
        altura: plano?.altura_cm,
        idade: plano?.idade,
        fase: plano?.fase || 'inducao',
        abordagem: plano?.abordagem || 'equilibrado',
        aceita_jejum: plano?.aceita_jejum,
        protocolo_jejum: plano?.protocolo_jejum,
        janela_inicio: plano?.janela_alimentar_inicio,
        janela_fim: plano?.janela_alimentar_fim,
        calorias: plano?.calorias_diarias,
        proteina_g: plano?.proteina_g,
        carboidratos_g: plano?.carboidratos_g,
        gordura_g: plano?.gordura_g,
        porcoes: {
          proteina: plano?.porcoes_proteina,
          legumes: plano?.porcoes_legumes,
          hidratos: plano?.porcoes_hidratos,
          gordura: plano?.porcoes_gordura
        },
        tamanhos: {
          palma: plano?.tamanho_palma_g || 20,
          mao: plano?.tamanho_mao_g || 25,
          polegar: plano?.tamanho_polegar_g || 7
        },
        dias_treino: plano?.dias_treino || [],
        data_inicio: plano?.data_inicio_fase || cliente?.data_inicio || new Date().toISOString()
      });

      setProgresso(100);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do plano');
    } finally {
      setLoading(false);
    }
  };

  // Gerar PDF
  const gerarPDF = async () => {
    if (!dadosPlano) {
      await carregarDados();
    }

    setLoading(true);
    setProgresso(0);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      const faseConfig = FASES_CONFIG[dadosPlano.fase] || FASES_CONFIG.inducao;
      
      // Cores
      const cores = {
        terracota: [193, 99, 74],
        castanho: [139, 69, 19],
        verde: [107, 142, 35],
        roxo: [93, 78, 109],
        bege: [210, 180, 140],
        creme: [253, 248, 243]
      };

      // ============================================
      // PÁGINA 1 - CAPA
      // ============================================
      setProgresso(10);
      
      // Background
      pdf.setFillColor(...cores.creme);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Header decorativo
      pdf.setFillColor(...cores.terracota);
      pdf.rect(0, 0, pageWidth, 8, 'F');
      
      // Logo placeholder (círculo com V)
      pdf.setFillColor(...cores.terracota);
      pdf.circle(pageWidth / 2, 60, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.text('V', pageWidth / 2, 68, { align: 'center' });
      
      // Título VITALIS
      pdf.setTextColor(...cores.terracota);
      pdf.setFontSize(36);
      pdf.text('VITALIS', pageWidth / 2, 105, { align: 'center' });
      
      // Tagline
      pdf.setFontSize(10);
      pdf.setTextColor(...cores.castanho);
      pdf.setFont('helvetica', 'normal');
      pdf.text('A Raiz da Transformação', pageWidth / 2, 115, { align: 'center' });
      
      // Linha divisória
      pdf.setDrawColor(...cores.terracota);
      pdf.setLineWidth(0.5);
      pdf.line(margin + 40, 130, pageWidth - margin - 40, 130);
      
      // Título do documento
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...cores.castanho);
      pdf.text('Guia Personalizado', pageWidth / 2, 150, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(...cores.terracota);
      pdf.text('PLANO ALIMENTAR', pageWidth / 2, 162, { align: 'center' });
      
      // Box do cliente
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(margin + 20, 180, contentWidth - 40, 70, 5, 5, 'F');
      pdf.setDrawColor(...cores.bege);
      pdf.setLineWidth(1);
      pdf.roundedRect(margin + 20, 180, contentWidth - 40, 70, 5, 5, 'S');
      
      // Dados do cliente
      pdf.setFontSize(9);
      pdf.setTextColor(...cores.castanho);
      pdf.text('PREPARADO EXCLUSIVAMENTE PARA', pageWidth / 2, 195, { align: 'center' });
      
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(dadosPlano.nome, pageWidth / 2, 212, { align: 'center' });
      
      // Peso actual -> Meta
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const pesoText = `${dadosPlano.peso_actual} kg → ${dadosPlano.peso_meta} kg`;
      pdf.text(pesoText, pageWidth / 2, 230, { align: 'center' });
      
      // Data de início
      const dataFormatada = new Date(dadosPlano.data_inicio).toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      pdf.setFontSize(10);
      pdf.setTextColor(...cores.castanho);
      pdf.text(`Início: ${dataFormatada}`, pageWidth / 2, 242, { align: 'center' });
      
      // Footer
      pdf.setFillColor(...cores.castanho);
      pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
      
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Vivianne Saraiva', margin, pageHeight - 15);
      pdf.text('Precision Nutrition Level 1 Coach', margin, pageHeight - 9);
      
      pdf.text('vivianne.saraiva@outlook.com', pageWidth - margin, pageHeight - 15, { align: 'right' });
      pdf.text('WhatsApp: +258 84 524 3875', pageWidth - margin, pageHeight - 9, { align: 'right' });

      // ============================================
      // PÁGINA 2 - A TUA JORNADA
      // ============================================
      setProgresso(25);
      pdf.addPage();
      
      // Header
      pdf.setFillColor(...cores.creme);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Título da página
      pdf.setFontSize(9);
      pdf.setTextColor(...cores.terracota);
      pdf.text('VITALIS', margin, 15);
      pdf.text(faseConfig.nome, pageWidth - margin, 15, { align: 'right' });
      pdf.setDrawColor(...cores.bege);
      pdf.line(margin, 20, pageWidth - margin, 20);
      
      // Título secção
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...cores.castanho);
      pdf.text('🌱 Bem-vinda à Tua Jornada', margin, 40);
      
      // Introdução
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const introText = `${dadosPlano.nome}, este guia foi criado especialmente para ti, com base nas tuas respostas, objectivos e estilo de vida. Cada porção, cada recomendação, foi calculada para o teu corpo e para onde queres chegar.`;
      const introLines = pdf.splitTextToSize(introText, contentWidth);
      pdf.text(introLines, margin, 55);
      
      // Box da Fase
      const faseY = 85;
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : cores.terracota;
      };
      
      pdf.setFillColor(...hexToRgb(faseConfig.cor));
      pdf.roundedRect(margin, faseY, contentWidth, 45, 4, 4, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${faseConfig.emoji} ${faseConfig.nome}`, margin + 10, faseY + 15);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Duração: ${faseConfig.duracao}`, margin + 10, faseY + 25);
      
      const descLines = pdf.splitTextToSize(faseConfig.descricao, contentWidth - 20);
      pdf.text(descLines, margin + 10, faseY + 35);
      
      // Abordagem e Meta
      const infoY = faseY + 55;
      
      // Abordagem
      pdf.setFillColor(245, 240, 232);
      pdf.roundedRect(margin, infoY, contentWidth / 2 - 5, 40, 3, 3, 'F');
      
      pdf.setFontSize(9);
      pdf.setTextColor(...cores.terracota);
      pdf.text('ABORDAGEM NUTRICIONAL', margin + 10, infoY + 12);
      
      const abordagemNomes = {
        'keto_if': 'Keto + Jejum Intermitente',
        'low_carb': 'Low Carb',
        'equilibrado': 'Equilibrado'
      };
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...cores.castanho);
      pdf.text(abordagemNomes[dadosPlano.abordagem] || 'Personalizado', margin + 10, infoY + 25);
      
      // Meta
      pdf.setFillColor(245, 240, 232);
      pdf.roundedRect(margin + contentWidth / 2 + 5, infoY, contentWidth / 2 - 5, 40, 3, 3, 'F');
      
      pdf.setFontSize(9);
      pdf.setTextColor(...cores.terracota);
      pdf.text('META SEMANAL', margin + contentWidth / 2 + 15, infoY + 12);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...cores.castanho);
      pdf.text('-0.5 a -1.0 kg/semana', margin + contentWidth / 2 + 15, infoY + 25);
      
      // Jejum (se aplicável)
      if (dadosPlano.aceita_jejum) {
        const jejumY = infoY + 50;
        
        pdf.setFillColor(93, 78, 109);
        pdf.roundedRect(margin, jejumY, contentWidth, 50, 4, 4, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`⏰ Protocolo de Jejum ${dadosPlano.protocolo_jejum?.replace('_', ':')}`, margin + 10, jejumY + 15);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Janela alimentar: ${dadosPlano.janela_inicio} - ${dadosPlano.janela_fim}`, margin + 10, jejumY + 28);
        pdf.text('Durante o jejum: água, chá sem açúcar, café sem açúcar', margin + 10, jejumY + 40);
      }
      
      // Footer da página
      pdf.setFontSize(8);
      pdf.setTextColor(...cores.castanho);
      pdf.text(`Documento exclusivo de ${dadosPlano.nome}`, margin, pageHeight - 10);
      pdf.text('Página 2 de 10', pageWidth - margin, pageHeight - 10, { align: 'right' });

      // ============================================
      // PÁGINA 3 - AS TUAS PORÇÕES
      // ============================================
      setProgresso(40);
      pdf.addPage();
      
      pdf.setFillColor(...cores.creme);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Header
      pdf.setFontSize(9);
      pdf.setTextColor(...cores.terracota);
      pdf.text('VITALIS', margin, 15);
      pdf.text(faseConfig.nome, pageWidth - margin, 15, { align: 'right' });
      pdf.setDrawColor(...cores.bege);
      pdf.line(margin, 20, pageWidth - margin, 20);
      
      // Título
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...cores.castanho);
      pdf.text('🍽️ As Tuas Porções Diárias', margin, 40);
      
      // Intro
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Usa o Método da Mão para medir — simples, prático e sempre contigo.', margin, 52);
      
      // Cards das porções
      const cardWidth = (contentWidth - 10) / 3;
      const cardHeight = 55;
      const cardsY = 65;
      
      const porcoesData = [
        { nome: 'Proteína', valor: dadosPlano.porcoes?.proteina || 3, unidade: 'palmas', cor: [255, 235, 238], borderCor: [229, 115, 115] },
        { nome: 'Hidratos', valor: dadosPlano.porcoes?.hidratos || 2, unidade: 'mãos', cor: [227, 242, 253], borderCor: [100, 181, 246] },
        { nome: 'Gordura', valor: dadosPlano.porcoes?.gordura || 8, unidade: 'polegares', cor: [255, 248, 225], borderCor: [255, 213, 79] }
      ];
      
      porcoesData.forEach((p, i) => {
        const x = margin + (cardWidth + 5) * i;
        
        pdf.setFillColor(...p.cor);
        pdf.roundedRect(x, cardsY, cardWidth, cardHeight, 4, 4, 'F');
        pdf.setDrawColor(...p.borderCor);
        pdf.setLineWidth(1.5);
        pdf.roundedRect(x, cardsY, cardWidth, cardHeight, 4, 4, 'S');
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...cores.castanho);
        pdf.text(p.nome, x + cardWidth / 2, cardsY + 15, { align: 'center' });
        
        pdf.setFontSize(28);
        pdf.setTextColor(...p.borderCor);
        pdf.text(String(p.valor), x + cardWidth / 2, cardsY + 38, { align: 'center' });
        
        pdf.setFontSize(9);
        pdf.setTextColor(...cores.castanho);
        pdf.text(`${p.unidade}/dia`, x + cardWidth / 2, cardsY + 48, { align: 'center' });
      });
      
      // Legumes - À VONTADE
      const legumesY = cardsY + cardHeight + 10;
      pdf.setFillColor(232, 245, 233);
      pdf.roundedRect(margin, legumesY, contentWidth, 30, 4, 4, 'F');
      pdf.setDrawColor(129, 199, 132);
      pdf.roundedRect(margin, legumesY, contentWidth, 30, 4, 4, 'S');
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(46, 125, 50);
      pdf.text('🥬 Vegetais & Legumes', margin + 15, legumesY + 13);
      pdf.text('À VONTADE', pageWidth - margin - 15, legumesY + 13, { align: 'right' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Não precisas medir — quanto mais cores, melhor!', margin + 15, legumesY + 24);
      
      // Macros
      const macrosY = legumesY + 45;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...cores.castanho);
      pdf.text('Os Teus Macros Diários', pageWidth / 2, macrosY, { align: 'center' });
      
      const macroWidth = contentWidth / 4 - 5;
      const macroY = macrosY + 10;
      
      const macrosData = [
        { label: 'Calorias', valor: dadosPlano.calorias || 1300, icon: '🔥' },
        { label: 'Proteína', valor: `${dadosPlano.proteina_g || 98}g`, icon: '🥩', pct: '30%' },
        { label: 'Hidratos', valor: `${dadosPlano.carboidratos_g || 50}g`, icon: '🍚', pct: '15%' },
        { label: 'Gordura', valor: `${dadosPlano.gordura_g || 85}g`, icon: '🥑', pct: '55%' }
      ];
      
      macrosData.forEach((m, i) => {
        const x = margin + (macroWidth + 6.5) * i;
        
        pdf.setFillColor(107, 84, 35);
        pdf.roundedRect(x, macroY, macroWidth, 40, 3, 3, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.text(m.icon, x + macroWidth / 2, macroY + 12, { align: 'center' });
        
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(m.valor), x + macroWidth / 2, macroY + 26, { align: 'center' });
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(m.label, x + macroWidth / 2, macroY + 34, { align: 'center' });
      });
      
      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(...cores.castanho);
      pdf.text(`Documento exclusivo de ${dadosPlano.nome}`, margin, pageHeight - 10);
      pdf.text('Página 3 de 10', pageWidth - margin, pageHeight - 10, { align: 'right' });

      // ============================================
      // PÁGINA 4 - COMO MEDIR
      // ============================================
      setProgresso(50);
      pdf.addPage();
      
      pdf.setFillColor(...cores.creme);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Header
      pdf.setFontSize(9);
      pdf.setTextColor(...cores.terracota);
      pdf.text('VITALIS', margin, 15);
      pdf.setDrawColor(...cores.bege);
      pdf.line(margin, 20, pageWidth - margin, 20);
      
      // Título
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...cores.castanho);
      pdf.text('✋ O Método da Mão', margin, 40);
      
      // Intro
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const metodoIntro = 'A tua mão é proporcional ao teu corpo — mãos maiores = corpo maior = mais comida. Simples, prático e sempre contigo.';
      pdf.text(metodoIntro, margin, 55);
      
      // Cards do método
      const metodoData = [
        { 
          nome: 'A Palma', 
          tipo: 'PROTEÍNA', 
          equiv: '~20g de proteína',
          desc: 'Tamanho e espessura da tua palma (sem dedos)',
          ex: 'Ex: 1 bife, 1 peito de frango',
          cor: [255, 235, 238],
          borderCor: [229, 115, 115]
        },
        { 
          nome: 'A Mão em Concha', 
          tipo: 'HIDRATOS', 
          equiv: '~20-25g de hidratos',
          desc: 'O que cabe na tua mão em concha',
          ex: 'Ex: punhado de arroz, batata-doce',
          cor: [227, 242, 253],
          borderCor: [100, 181, 246]
        },
        { 
          nome: 'O Polegar', 
          tipo: 'GORDURA', 
          equiv: '~7-10g de gordura',
          desc: 'Tamanho do teu polegar inteiro',
          ex: 'Ex: 1 colher azeite, nozes',
          cor: [255, 248, 225],
          borderCor: [255, 213, 79]
        },
        { 
          nome: 'O Punho', 
          tipo: 'VEGETAIS', 
          equiv: '~100g de vegetais',
          desc: 'Tamanho do teu punho fechado',
          ex: 'Mas lembra-te: À VONTADE!',
          cor: [232, 245, 233],
          borderCor: [129, 199, 132]
        }
      ];
      
      const metodoCardW = (contentWidth - 10) / 2;
      const metodoCardH = 60;
      
      metodoData.forEach((m, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = margin + (metodoCardW + 10) * col;
        const y = 70 + (metodoCardH + 10) * row;
        
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(x, y, metodoCardW, metodoCardH, 4, 4, 'F');
        pdf.setDrawColor(...m.borderCor);
        pdf.setLineWidth(1.5);
        pdf.roundedRect(x, y, metodoCardW, metodoCardH, 4, 4, 'S');
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...cores.castanho);
        pdf.text(m.nome, x + 10, y + 15);
        
        pdf.setFontSize(8);
        pdf.setTextColor(...m.borderCor);
        pdf.text(m.tipo, x + 10, y + 24);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...cores.castanho);
        pdf.text(m.equiv, x + 10, y + 35);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(m.desc, x + 10, y + 45);
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text(m.ex, x + 10, y + 54);
      });
      
      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(...cores.castanho);
      pdf.text(`Documento exclusivo de ${dadosPlano.nome}`, margin, pageHeight - 10);
      pdf.text('Página 4 de 10', pageWidth - margin, pageHeight - 10, { align: 'right' });

      // ============================================
      // PÁGINAS 5-7 - LISTAS DE ALIMENTOS
      // ============================================
      setProgresso(60);
      
      // Função auxiliar para adicionar página de alimentos
      const addAlimentosPage = (titulo, categorias, pageNum) => {
        pdf.addPage();
        
        pdf.setFillColor(...cores.creme);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Header
        pdf.setFontSize(9);
        pdf.setTextColor(...cores.terracota);
        pdf.text('VITALIS', margin, 15);
        pdf.setDrawColor(...cores.bege);
        pdf.line(margin, 20, pageWidth - margin, 20);
        
        // Título
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...cores.castanho);
        pdf.text(titulo, margin, 40);
        
        let currentY = 55;
        
        categorias.forEach((cat) => {
          if (currentY > pageHeight - 40) return; // Evita overflow
          
          pdf.setFillColor(245, 240, 232);
          pdf.roundedRect(margin, currentY, contentWidth, 8, 2, 2, 'F');
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...cores.terracota);
          pdf.text(cat.nome, margin + 5, currentY + 6);
          
          currentY += 12;
          
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...cores.castanho);
          
          const itemsText = cat.items.join(' • ');
          const itemsLines = pdf.splitTextToSize(itemsText, contentWidth - 10);
          pdf.text(itemsLines, margin + 5, currentY);
          
          currentY += itemsLines.length * 5 + 10;
        });
        
        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(...cores.castanho);
        pdf.text(`Documento exclusivo de ${dadosPlano.nome}`, margin, pageHeight - 10);
        pdf.text(`Página ${pageNum} de 10`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      };
      
      addAlimentosPage(ALIMENTOS.proteinas.titulo, ALIMENTOS.proteinas.categorias, 5);
      setProgresso(65);
      addAlimentosPage(ALIMENTOS.hidratos.titulo + ' & ' + ALIMENTOS.gorduras.titulo, 
        [...ALIMENTOS.hidratos.categorias, ...ALIMENTOS.gorduras.categorias], 6);
      
      // Página de vegetais (especial - por cores)
      setProgresso(70);
      pdf.addPage();
      
      pdf.setFillColor(...cores.creme);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setFontSize(9);
      pdf.setTextColor(...cores.terracota);
      pdf.text('VITALIS', margin, 15);
      pdf.setDrawColor(...cores.bege);
      pdf.line(margin, 20, pageWidth - margin, 20);
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...cores.castanho);
      pdf.text('🥬 Vegetais — Come o Arco-Íris!', margin, 40);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Cada cor representa diferentes nutrientes. Inclui pelo menos 3 cores por refeição!', margin, 52);
      
      let vegY = 65;
      ALIMENTOS.vegetais.cores.forEach((v) => {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...cores.castanho);
        pdf.text(`${v.emoji} ${v.cor}`, margin, vegY);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const vegLines = pdf.splitTextToSize(v.items, contentWidth - 20);
        pdf.text(vegLines, margin + 5, vegY + 8);
        
        vegY += 8 + vegLines.length * 5 + 8;
      });
      
      pdf.setFontSize(8);
      pdf.setTextColor(...cores.castanho);
      pdf.text(`Documento exclusivo de ${dadosPlano.nome}`, margin, pageHeight - 10);
      pdf.text('Página 7 de 10', pageWidth - margin, pageHeight - 10, { align: 'right' });

      // ============================================
      // PÁGINA 8 - LISTA DE COMPRAS
      // ============================================
      setProgresso(75);
      pdf.addPage();
      
      pdf.setFillColor(...cores.creme);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setFontSize(9);
      pdf.setTextColor(...cores.terracota);
      pdf.text('VITALIS', margin, 15);
      pdf.setDrawColor(...cores.bege);
      pdf.line(margin, 20, pageWidth - margin, 20);
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...cores.castanho);
      pdf.text('🛒 Lista de Compras Semanal', margin, 40);
      
      const comprasData = [
        { cat: '🥩 Proteínas', items: ['Peito de frango (1kg)', 'Ovos (2 dúzias)', 'Peixe fresco (500g)', 'Carne moída (500g)'] },
        { cat: '🥬 Vegetais', items: ['Espinafre/Couve', 'Brócolos', 'Tomate', 'Pepino', 'Pimentos', 'Cebola', 'Alho'] },
        { cat: '🥑 Gorduras', items: ['Azeite extra-virgem', 'Abacate (2-3)', 'Manteiga', 'Amêndoas/Nozes'] },
        { cat: '🧂 Outros', items: ['Sal e pimenta', 'Ervas frescas', 'Limões', 'Chá/Café'] }
      ];
      
      const compraCardW = (contentWidth - 10) / 2;
      let compraY = 55;
      
      comprasData.forEach((c, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = margin + (compraCardW + 10) * col;
        const y = compraY + row * 65;
        
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(x, y, compraCardW, 58, 3, 3, 'F');
        pdf.setDrawColor(...cores.bege);
        pdf.roundedRect(x, y, compraCardW, 58, 3, 3, 'S');
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...cores.terracota);
        pdf.text(c.cat, x + 8, y + 12);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...cores.castanho);
        
        c.items.forEach((item, j) => {
          pdf.text(`☐ ${item}`, x + 8, y + 24 + j * 8);
        });
      });
      
      pdf.setFontSize(8);
      pdf.setTextColor(...cores.castanho);
      pdf.text(`Documento exclusivo de ${dadosPlano.nome}`, margin, pageHeight - 10);
      pdf.text('Página 8 de 10', pageWidth - margin, pageHeight - 10, { align: 'right' });

      // ============================================
      // PÁGINA 9 - REGRAS DA FASE
      // ============================================
      setProgresso(85);
      pdf.addPage();
      
      pdf.setFillColor(...cores.creme);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setFontSize(9);
      pdf.setTextColor(...cores.terracota);
      pdf.text('VITALIS', margin, 15);
      pdf.setDrawColor(...cores.bege);
      pdf.line(margin, 20, pageWidth - margin, 20);
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...cores.castanho);
      pdf.text(`📋 Regras da ${faseConfig.nome}`, margin, 40);
      
      let regrasY = 55;
      
      // Priorizar
      pdf.setFillColor(232, 245, 233);
      pdf.roundedRect(margin, regrasY, contentWidth, 5 + faseConfig.priorizar.length * 7, 3, 3, 'F');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(46, 125, 50);
      pdf.text('✅ PRIORIZAR', margin + 5, regrasY + 8);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      faseConfig.priorizar.forEach((item, i) => {
        pdf.text(`✓ ${item}`, margin + 10, regrasY + 18 + i * 7);
      });
      
      regrasY += 15 + faseConfig.priorizar.length * 7 + 10;
      
      // Evitar
      pdf.setFillColor(255, 235, 238);
      pdf.roundedRect(margin, regrasY, contentWidth, 5 + faseConfig.evitar.length * 7, 3, 3, 'F');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(198, 40, 40);
      pdf.text('❌ EVITAR', margin + 5, regrasY + 8);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      faseConfig.evitar.forEach((item, i) => {
        pdf.text(`✗ ${item}`, margin + 10, regrasY + 18 + i * 7);
      });
      
      regrasY += 15 + faseConfig.evitar.length * 7 + 10;
      
      // Dicas
      pdf.setFillColor(255, 243, 224);
      pdf.roundedRect(margin, regrasY, contentWidth, 5 + faseConfig.dicas.length * 7, 3, 3, 'F');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...cores.terracota);
      pdf.text('💡 DICAS', margin + 5, regrasY + 8);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...cores.castanho);
      faseConfig.dicas.forEach((item, i) => {
        pdf.text(`• ${item}`, margin + 10, regrasY + 18 + i * 7);
      });
      
      pdf.setFontSize(8);
      pdf.setTextColor(...cores.castanho);
      pdf.text(`Documento exclusivo de ${dadosPlano.nome}`, margin, pageHeight - 10);
      pdf.text('Página 9 de 10', pageWidth - margin, pageHeight - 10, { align: 'right' });

      // ============================================
      // PÁGINA 10 - ENCERRAMENTO
      // ============================================
      setProgresso(95);
      pdf.addPage();
      
      pdf.setFillColor(...cores.creme);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Logo
      pdf.setFillColor(...cores.terracota);
      pdf.circle(pageWidth / 2, 60, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('V', pageWidth / 2, 66, { align: 'center' });
      
      pdf.setTextColor(...cores.terracota);
      pdf.setFontSize(24);
      pdf.text('VITALIS', pageWidth / 2, 95, { align: 'center' });
      
      // Citação
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(...cores.castanho);
      pdf.text('"Quando o excesso cai, o corpo responde."', pageWidth / 2, 130, { align: 'center' });
      
      // Cliente
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('CRIADO EXCLUSIVAMENTE PARA', pageWidth / 2, 160, { align: 'center' });
      
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text(dadosPlano.nome, pageWidth / 2, 180, { align: 'center' });
      
      // Linha
      pdf.setDrawColor(...cores.terracota);
      pdf.line(margin + 60, 200, pageWidth - margin - 60, 200);
      
      // Coach
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...cores.castanho);
      pdf.text('Vivianne Saraiva', pageWidth / 2, 225, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...cores.terracota);
      pdf.text('Precision Nutrition Level 1 Coach', pageWidth / 2, 238, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(...cores.castanho);
      pdf.text('vivianne.saraiva@outlook.com', pageWidth / 2, 255, { align: 'center' });
      pdf.text('WhatsApp: +258 84 524 3875', pageWidth / 2, 267, { align: 'center' });
      
      // ============================================
      // SALVAR PDF
      // ============================================
      setProgresso(100);
      
      const nomeArquivo = `Vitalis_Plano_${dadosPlano.nome.replace(/\s+/g, '_')}_${dadosPlano.fase}.pdf`;
      pdf.save(nomeArquivo);
      
      // Registar na base de dados que PDF foi gerado
      try {
        await supabase
          .from('vitalis_plano')
          .update({ 
            pdf_gerado_em: new Date().toISOString(),
            pdf_fase: dadosPlano.fase
          })
          .eq('client_id', userId);
      } catch (e) {
        console.log('Aviso: não foi possível registar geração do PDF');
      }
      
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      setError('Erro ao gerar PDF. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados ao montar
  React.useEffect(() => {
    carregarDados();
  }, [userId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">📄 Gerar Plano em PDF</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}
        
        {dadosPlano && (
          <div className="bg-orange-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">O PDF incluirá:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Dados personalizados de <strong>{dadosPlano.nome}</strong></li>
              <li>✓ {FASES_CONFIG[dadosPlano.fase]?.nome || 'Fase actual'}</li>
              <li>✓ Porções calculadas para ti</li>
              <li>✓ {dadosPlano.aceita_jejum ? 'Protocolo de jejum' : 'Sem jejum'}</li>
              <li>✓ Listas de alimentos completas</li>
              <li>✓ Lista de compras</li>
              <li>✓ Regras e dicas da fase</li>
            </ul>
          </div>
        )}
        
        {loading && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>A gerar PDF...</span>
              <span>{progresso}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={gerarPDF}
            disabled={loading || !dadosPlano}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'A gerar...' : '📥 Descarregar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
