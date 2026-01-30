// ============================================================
// VITALIS - GERADOR DE PDF DO PLANO ALIMENTAR
// Versão 4 - Gera HTML para impressão como PDF
// O utilizador abre o HTML no browser e imprime como PDF
// ============================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';

// Configuração das fases
const FASES_CONFIG = {
  inducao: {
    nome: 'Fase 1: Indução',
    duracao: '3-4 semanas',
    descricao: 'A fase de arranque onde o corpo entra em modo de queima de gordura. Foco em proteína, gorduras saudáveis e vegetais.',
    priorizar: ['Proteína em todas as refeições', 'Vegetais em abundância', 'Gorduras saudáveis (azeite, abacate, nozes)', 'Água (mínimo 2L por dia)', 'Dormir 7-8 horas por noite'],
    evitar: ['Açúcar e adoçantes', 'Grãos e cereais (pão, massa, arroz)', 'Frutas doces (banana, manga, uvas)', 'Leguminosas', 'Álcool'],
    dicas: ['Prepara as refeições ao domingo para a semana', 'Tem sempre snacks saudáveis à mão', 'Nos primeiros dias podes sentir "keto flu" — é normal', 'Pesa-te apenas às sextas-feiras, de manhã, em jejum']
  },
  estabilizacao: {
    nome: 'Fase 2: Estabilização',
    duracao: '6-8 semanas',
    descricao: 'Reintrodução gradual de hidratos complexos enquanto mantemos os resultados alcançados.',
    priorizar: ['Manter proteína elevada', 'Hidratos complexos (batata-doce, arroz integral)', 'Fruta de baixo índice glicémico', 'Leguminosas em moderação'],
    evitar: ['Açúcar refinado', 'Farinhas brancas', 'Alimentos processados', 'Bebidas açucaradas'],
    dicas: ['Introduz um novo alimento de cada vez', 'Observa como o corpo reage', 'Mantém o diário alimentar']
  },
  reeducacao: {
    nome: 'Fase 3: Reeducação',
    duracao: '6-8 semanas',
    descricao: 'Aprender a comer de forma equilibrada e intuitiva para a vida.',
    priorizar: ['Equilíbrio em todas as refeições', 'Variedade alimentar', 'Comer com atenção plena', 'Flexibilidade saudável'],
    evitar: ['Restrições extremas', 'Mentalidade de dieta', 'Comer emocional'],
    dicas: ['Pratica a escuta do corpo', 'Permite-te flexibilidade', 'Foca em como te sentes, não só no peso']
  },
  manutencao: {
    nome: 'Fase 4: Manutenção',
    duracao: 'Contínua',
    descricao: 'Manter os resultados alcançados com um estilo de vida equilibrado.',
    priorizar: ['Consistência', 'Movimento regular', 'Sono de qualidade', 'Gestão do stress'],
    evitar: ['Voltar aos velhos hábitos', 'Ignorar sinais do corpo', 'Perder a rotina'],
    dicas: ['Pesagem semanal para monitorizar', 'Ajusta conforme necessário', 'Celebra as vitórias']
  }
};

export default function GeradorPDFPlano({ userId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarDados();
  }, [userId]);

  const carregarDados = async () => {
    try {
      const { data: cliente } = await supabase
        .from('vitalis_clients')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: plano } = await supabase
        .from('vitalis_plano')
        .select('*')
        .eq('client_id', cliente?.id)
        .single();

      const { data: intake } = await supabase
        .from('vitalis_intake')
        .select('nome, email')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setDados({
        nome: intake?.nome || 'Cliente',
        peso_actual: plano?.peso_actual || plano?.peso_inicial,
        peso_meta: plano?.peso_meta,
        fase: plano?.fase || 'inducao',
        calorias: plano?.calorias_diarias,
        proteina_g: plano?.proteina_g,
        carboidratos_g: plano?.carboidratos_g,
        gordura_g: plano?.gordura_g,
        porcoes_proteina: plano?.porcoes_proteina,
        porcoes_hidratos: plano?.porcoes_hidratos,
        porcoes_gordura: plano?.porcoes_gordura,
        tamanho_palma: plano?.tamanho_palma_g || 20,
        tamanho_mao: plano?.tamanho_mao_g || 25,
        tamanho_polegar: plano?.tamanho_polegar_g || 7,
        data_inicio: plano?.data_inicio_fase || new Date().toISOString(),
        abordagem: plano?.abordagem || 'equilibrado'
      });
    } catch (err) {
      console.error('Erro:', err);
      setErro('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (d) => {
    if (!d) return new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
    return new Date(d).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const gerarHTML = () => {
    const faseConfig = FASES_CONFIG[dados?.fase] || FASES_CONFIG.inducao;
    
    const html = `<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VITALIS - Plano de ${dados.nome}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --terracota: #C1634A;
            --terracota-dark: #A0422A;
            --castanho: #8B4513;
            --castanho-dark: #6B4423;
            --verde: #6B8E23;
            --bege: #D2B48C;
            --bege-light: #F5F0E8;
            --creme: #FDF8F3;
        }
        
        @media print {
            @page { margin: 0; size: A4 portrait; }
            body { margin: 0; }
            .page { page-break-after: always; page-break-inside: avoid; }
            .page:last-child { page-break-after: auto; }
            .no-print { display: none !important; }
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Montserrat', sans-serif;
            background: #f0f0f0;
            line-height: 1.6;
        }
        
        .print-instructions {
            background: linear-gradient(135deg, var(--terracota), var(--terracota-dark));
            color: white;
            padding: 25px;
            text-align: center;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        
        .print-instructions h2 { font-size: 20px; margin-bottom: 8px; }
        .print-instructions p { font-size: 14px; opacity: 0.9; }
        .print-instructions button {
            margin-top: 15px;
            padding: 12px 30px;
            background: white;
            color: var(--terracota-dark);
            border: none;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
        }
        .print-instructions button:hover { background: var(--bege-light); }
        
        .page-container {
            max-width: 210mm;
            margin: 120px auto 40px;
            padding: 0 20px;
        }
        
        .page {
            background: var(--creme);
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            position: relative;
            overflow: hidden;
        }
        
        /* CAPA */
        .cover {
            height: 297mm;
            display: flex;
            flex-direction: column;
            background: linear-gradient(180deg, var(--creme) 0%, var(--bege-light) 100%);
        }
        
        .cover-top {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 50px;
        }
        
        .logo-circle {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, var(--terracota), var(--castanho));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(193, 99, 74, 0.4);
        }
        
        .logo-circle span {
            color: white;
            font-family: 'Cormorant Garamond', serif;
            font-size: 55px;
            font-weight: 700;
        }
        
        .brand-name {
            font-family: 'Cormorant Garamond', serif;
            font-size: 48px;
            font-weight: 700;
            color: var(--terracota-dark);
            letter-spacing: 12px;
        }
        
        .brand-tagline {
            font-size: 11px;
            color: var(--castanho);
            letter-spacing: 5px;
            text-transform: uppercase;
            margin-top: 5px;
        }
        
        .cover-divider {
            width: 100px;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--terracota), transparent);
            margin: 45px 0;
        }
        
        .cover-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 34px;
            font-weight: 600;
            color: var(--castanho-dark);
            letter-spacing: 3px;
        }
        
        .cover-subtitle {
            font-size: 16px;
            color: var(--terracota);
            font-weight: 500;
            letter-spacing: 5px;
            text-transform: uppercase;
            margin-top: 10px;
            margin-bottom: 50px;
        }
        
        .client-box {
            background: white;
            border: 2px solid var(--bege);
            border-radius: 25px;
            padding: 40px 80px;
            text-align: center;
            box-shadow: 0 15px 50px rgba(0,0,0,0.08);
        }
        
        .client-label {
            font-size: 10px;
            color: var(--castanho);
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        
        .client-name {
            font-family: 'Cormorant Garamond', serif;
            font-size: 36px;
            font-weight: 600;
            color: var(--castanho-dark);
            margin-bottom: 25px;
        }
        
        .weight-stats {
            display: flex;
            gap: 35px;
            justify-content: center;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .weight-stat { text-align: center; }
        
        .weight-label {
            font-size: 9px;
            color: var(--castanho);
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .weight-value {
            font-size: 32px;
            color: var(--terracota-dark);
            font-weight: 700;
        }
        
        .weight-arrow {
            color: var(--verde);
            font-size: 36px;
        }
        
        .start-date {
            font-size: 13px;
            color: var(--castanho);
        }
        
        .cover-footer {
            background: var(--castanho-dark);
            padding: 25px 50px;
            display: flex;
            justify-content: space-between;
            color: rgba(255,255,255,0.95);
            font-size: 11px;
        }
        
        .cover-footer-right { text-align: right; }
        .cover-footer strong { display: block; margin-bottom: 3px; }
        
        /* PÁGINAS INTERIORES */
        .page-inner {
            padding: 45px 55px 80px;
            min-height: 297mm;
            position: relative;
        }
        
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid var(--bege);
            padding-bottom: 15px;
            margin-bottom: 35px;
        }
        
        .page-logo {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .page-logo-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, var(--terracota), var(--castanho));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .page-logo-icon span {
            color: white;
            font-family: 'Cormorant Garamond', serif;
            font-size: 22px;
            font-weight: 700;
        }
        
        .page-logo-text {
            font-weight: 600;
            font-size: 16px;
            color: var(--terracota);
            letter-spacing: 3px;
        }
        
        .page-phase {
            font-size: 13px;
            color: var(--castanho);
            font-weight: 500;
        }
        
        .section-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 28px;
            font-weight: 600;
            color: var(--castanho-dark);
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .section-title span { font-size: 32px; }
        
        .page-footer {
            position: absolute;
            bottom: 30px;
            left: 55px;
            right: 55px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: var(--castanho);
            border-top: 1px solid var(--bege);
            padding-top: 12px;
        }
        
        /* CARDS */
        .info-box {
            background: white;
            border: 1px solid var(--bege);
            border-radius: 16px;
            padding: 25px 30px;
            margin-bottom: 20px;
        }
        
        .info-box p {
            color: var(--castanho-dark);
            font-size: 14px;
            line-height: 1.8;
        }
        
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 18px; }
        
        /* PORÇÕES */
        .portion-card {
            border-radius: 18px;
            padding: 30px 20px;
            text-align: center;
        }
        
        .portion-card.protein { background: linear-gradient(135deg, #FFEBEE, #FFCDD2); border: 2px solid #E57373; }
        .portion-card.carbs { background: linear-gradient(135deg, #E3F2FD, #BBDEFB); border: 2px solid #64B5F6; }
        .portion-card.fats { background: linear-gradient(135deg, #FFF8E1, #FFECB3); border: 2px solid #FFD54F; }
        .portion-card.veggies { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); border: 2px solid #81C784; }
        
        .portion-label {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 15px;
        }
        
        .portion-card.protein .portion-label { color: #C62828; }
        .portion-card.carbs .portion-label { color: #1565C0; }
        .portion-card.fats .portion-label { color: #F57F17; }
        .portion-card.veggies .portion-label { color: #2E7D32; }
        
        .portion-value {
            font-size: 60px;
            font-weight: 700;
            line-height: 1;
        }
        
        .portion-card.protein .portion-value { color: #C62828; }
        .portion-card.carbs .portion-value { color: #1565C0; }
        .portion-card.fats .portion-value { color: #F57F17; }
        .portion-card.veggies .portion-value { color: #2E7D32; font-size: 36px; }
        
        .portion-unit {
            font-size: 13px;
            color: var(--castanho);
            margin-top: 8px;
        }
        
        /* MACROS */
        .macro-card {
            background: white;
            border: 1px solid var(--bege);
            border-radius: 14px;
            padding: 25px 15px;
            text-align: center;
        }
        
        .macro-icon { font-size: 24px; margin-bottom: 10px; }
        
        .macro-value {
            font-size: 32px;
            font-weight: 700;
            color: var(--terracota-dark);
        }
        
        .macro-label {
            font-size: 11px;
            color: var(--castanho);
            margin-top: 5px;
        }
        
        /* MÉTODO DA MÃO */
        .hand-card {
            border-radius: 16px;
            padding: 28px;
        }
        
        .hand-card.protein { background: #FFEBEE; border: 2px solid #E57373; }
        .hand-card.carbs { background: #E3F2FD; border: 2px solid #64B5F6; }
        .hand-card.fats { background: #FFF8E1; border: 2px solid #FFD54F; }
        .hand-card.veggies { background: #E8F5E9; border: 2px solid #81C784; }
        
        .hand-title {
            font-weight: 600;
            font-size: 18px;
            margin-bottom: 12px;
        }
        
        .hand-card.protein .hand-title { color: #C62828; }
        .hand-card.carbs .hand-title { color: #1565C0; }
        .hand-card.fats .hand-title { color: #F57F17; }
        .hand-card.veggies .hand-title { color: #2E7D32; }
        
        .hand-amount {
            font-size: 22px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .hand-card.protein .hand-amount { color: #C62828; }
        .hand-card.carbs .hand-amount { color: #1565C0; }
        .hand-card.fats .hand-amount { color: #F57F17; }
        .hand-card.veggies .hand-amount { color: #2E7D32; }
        
        .hand-desc {
            font-size: 13px;
            color: var(--castanho-dark);
            margin-bottom: 10px;
        }
        
        .hand-example {
            font-size: 12px;
            color: var(--castanho);
            font-style: italic;
        }
        
        /* FOOD CARDS */
        .food-card {
            background: white;
            border: 1px solid var(--bege);
            border-radius: 14px;
            padding: 25px;
        }
        
        .food-title {
            font-weight: 600;
            color: var(--terracota-dark);
            font-size: 16px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--bege);
        }
        
        .food-list {
            font-size: 13px;
            color: var(--castanho-dark);
            line-height: 2;
        }
        
        /* VEGETAIS CORES */
        .veggie-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            border-left: 5px solid;
        }
        
        .veggie-card.green { border-color: #4CAF50; background: #F1F8E9; }
        .veggie-card.red { border-color: #F44336; background: #FFEBEE; }
        .veggie-card.orange { border-color: #FF9800; background: #FFF3E0; }
        .veggie-card.white { border-color: #9E9E9E; background: #FAFAFA; }
        .veggie-card.purple { border-color: #9C27B0; background: #F3E5F5; }
        
        .veggie-title {
            font-weight: 600;
            font-size: 15px;
            margin-bottom: 10px;
        }
        
        .veggie-card.green .veggie-title { color: #2E7D32; }
        .veggie-card.red .veggie-title { color: #C62828; }
        .veggie-card.orange .veggie-title { color: #E65100; }
        .veggie-card.white .veggie-title { color: #616161; }
        .veggie-card.purple .veggie-title { color: #6A1B9A; }
        
        .veggie-list {
            font-size: 12px;
            color: var(--castanho);
            line-height: 1.7;
        }
        
        /* REGRAS */
        .rules-card {
            border-radius: 14px;
            padding: 28px;
        }
        
        .rules-card.priority { background: #E8F5E9; border: 2px solid #81C784; }
        .rules-card.avoid { background: #FFEBEE; border: 2px solid #E57373; }
        .rules-card.tips { background: #FFF8E1; border: 2px solid #FFD54F; }
        
        .rules-title {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 18px;
        }
        
        .rules-card.priority .rules-title { color: #2E7D32; }
        .rules-card.avoid .rules-title { color: #C62828; }
        .rules-card.tips .rules-title { color: #F57F17; }
        
        .rules-list {
            list-style: none;
            font-size: 13px;
            color: var(--castanho-dark);
            line-height: 2;
        }
        
        /* PÁGINA FINAL */
        .final-page {
            height: 297mm;
            display: flex;
            flex-direction: column;
            background: linear-gradient(180deg, var(--creme) 0%, var(--bege-light) 100%);
        }
        
        .final-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px;
        }
        
        .final-quote {
            max-width: 450px;
            text-align: center;
            padding: 45px;
            background: white;
            border-radius: 25px;
            box-shadow: 0 15px 50px rgba(0,0,0,0.08);
            margin-bottom: 50px;
        }
        
        .final-quote-mark {
            font-size: 60px;
            color: var(--bege);
            line-height: 0.5;
        }
        
        .final-quote p {
            font-family: 'Cormorant Garamond', serif;
            font-size: 24px;
            color: var(--castanho-dark);
            font-style: italic;
            line-height: 1.6;
            margin: 20px 0;
        }
        
        .final-for {
            font-size: 11px;
            color: var(--castanho);
            letter-spacing: 4px;
            text-transform: uppercase;
            margin-bottom: 15px;
        }
        
        .final-name {
            font-family: 'Cormorant Garamond', serif;
            font-size: 36px;
            font-weight: 600;
            color: var(--castanho-dark);
        }
    </style>
</head>
<body>
    <div class="print-instructions no-print">
        <h2>📄 Plano Alimentar de ${dados.nome}</h2>
        <p>Para guardar como PDF: pressione <strong>Ctrl+P</strong> (ou Cmd+P no Mac) e seleccione "Guardar como PDF"</p>
        <button onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
    </div>

    <div class="page-container">
        <!-- PÁGINA 1 - CAPA -->
        <div class="page">
            <div class="cover">
                <div class="cover-top">
                    <div class="logo-circle"><span>V</span></div>
                    <div class="brand-name">VITALIS</div>
                    <div class="brand-tagline">A Raiz da Transformação</div>
                    <div class="cover-divider"></div>
                    <div class="cover-title">Guia Personalizado</div>
                    <div class="cover-subtitle">Plano Alimentar</div>
                    
                    <div class="client-box">
                        <div class="client-label">Preparado Exclusivamente Para</div>
                        <div class="client-name">${dados.nome}</div>
                        <div class="weight-stats">
                            <div class="weight-stat">
                                <div class="weight-label">Peso Actual</div>
                                <div class="weight-value">${dados.peso_actual} kg</div>
                            </div>
                            <div class="weight-arrow">→</div>
                            <div class="weight-stat">
                                <div class="weight-label">Meta</div>
                                <div class="weight-value">${dados.peso_meta} kg</div>
                            </div>
                        </div>
                        <div class="start-date">Início: ${formatarData(dados.data_inicio)}</div>
                    </div>
                </div>
                <div class="cover-footer">
                    <div><strong>Vivianne Saraiva</strong>Precision Nutrition Level 1 Coach</div>
                    <div class="cover-footer-right"><strong>vivianne.saraiva@outlook.com</strong>WhatsApp: +258 84 524 3875</div>
                </div>
            </div>
        </div>

        <!-- PÁGINA 2 - BEM-VINDA & FASE -->
        <div class="page">
            <div class="page-inner">
                <div class="page-header">
                    <div class="page-logo">
                        <div class="page-logo-icon"><span>V</span></div>
                        <div class="page-logo-text">VITALIS</div>
                    </div>
                    <div class="page-phase">${faseConfig.nome}</div>
                </div>
                
                <div class="section-title"><span>👋</span> Bem-vinda à Tua Jornada</div>
                <div class="info-box">
                    <p><strong>${dados.nome}</strong>, este guia foi criado especialmente para ti, com base nas tuas respostas, objectivos e estilo de vida. Cada porção, cada recomendação, foi calculada para o teu corpo e para onde queres chegar.</p>
                </div>
                
                <div class="section-title"><span>🔥</span> ${faseConfig.nome}</div>
                <div class="info-box">
                    <p style="display:inline-block;padding:6px 18px;background:var(--bege-light);border-radius:25px;font-size:12px;color:var(--castanho);margin-bottom:15px;">Duração: ${faseConfig.duracao}</p>
                    <p>${faseConfig.descricao}</p>
                </div>
                
                <div class="grid-2" style="margin-top:30px;">
                    <div class="info-box">
                        <p style="font-size:10px;color:var(--terracota);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Abordagem Nutricional</p>
                        <p style="font-size:22px;font-weight:600;color:var(--terracota-dark);text-transform:capitalize;">${dados.abordagem?.replace('_', ' ')}</p>
                    </div>
                    <div class="info-box">
                        <p style="font-size:10px;color:var(--terracota);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Meta Semanal</p>
                        <p style="font-size:22px;font-weight:600;color:var(--verde);">-0.5 a -1.0 kg/semana</p>
                    </div>
                </div>
                
                <div class="page-footer">
                    <span>Documento exclusivo de ${dados.nome}</span>
                    <span>Página 2 de 10</span>
                </div>
            </div>
        </div>

        <!-- PÁGINA 3 - PORÇÕES -->
        <div class="page">
            <div class="page-inner">
                <div class="page-header">
                    <div class="page-logo">
                        <div class="page-logo-icon"><span>V</span></div>
                        <div class="page-logo-text">VITALIS</div>
                    </div>
                    <div class="page-phase">${faseConfig.nome}</div>
                </div>
                
                <div class="section-title"><span>🍽️</span> As Tuas Porções Diárias</div>
                <p style="color:var(--castanho);font-size:14px;margin-bottom:30px;">Usa o Método da Mão para medir — simples, prático e sempre contigo.</p>
                
                <div class="grid-3" style="margin-bottom:30px;">
                    <div class="portion-card protein">
                        <div class="portion-label">Proteína</div>
                        <div class="portion-value">${dados.porcoes_proteina}</div>
                        <div class="portion-unit">palmas/dia</div>
                    </div>
                    <div class="portion-card carbs">
                        <div class="portion-label">Hidratos</div>
                        <div class="portion-value">${dados.porcoes_hidratos}</div>
                        <div class="portion-unit">mãos/dia</div>
                    </div>
                    <div class="portion-card fats">
                        <div class="portion-label">Gordura</div>
                        <div class="portion-value">${dados.porcoes_gordura}</div>
                        <div class="portion-unit">polegares/dia</div>
                    </div>
                </div>
                
                <div class="portion-card veggies" style="text-align:center;padding:30px;margin-bottom:35px;">
                    <div class="portion-label">🥬 Vegetais & Legumes</div>
                    <div class="portion-value">À VONTADE</div>
                    <div class="portion-unit">Não precisas medir — quanto mais cores, melhor!</div>
                </div>
                
                <div class="section-title" style="font-size:22px;"><span>📊</span> Os Teus Macros Diários</div>
                <div class="grid-4">
                    <div class="macro-card">
                        <div class="macro-icon">🔥</div>
                        <div class="macro-value">${dados.calorias}</div>
                        <div class="macro-label">Calorias</div>
                    </div>
                    <div class="macro-card">
                        <div class="macro-icon">🥩</div>
                        <div class="macro-value">${dados.proteina_g}g</div>
                        <div class="macro-label">Proteína</div>
                    </div>
                    <div class="macro-card">
                        <div class="macro-icon">🍚</div>
                        <div class="macro-value">${dados.carboidratos_g}g</div>
                        <div class="macro-label">Hidratos</div>
                    </div>
                    <div class="macro-card">
                        <div class="macro-icon">🥑</div>
                        <div class="macro-value">${dados.gordura_g}g</div>
                        <div class="macro-label">Gordura</div>
                    </div>
                </div>
                
                <div class="page-footer">
                    <span>Documento exclusivo de ${dados.nome}</span>
                    <span>Página 3 de 10</span>
                </div>
            </div>
        </div>

        <!-- PÁGINA 4 - MÉTODO DA MÃO -->
        <div class="page">
            <div class="page-inner">
                <div class="page-header">
                    <div class="page-logo">
                        <div class="page-logo-icon"><span>V</span></div>
                        <div class="page-logo-text">VITALIS</div>
                    </div>
                </div>
                
                <div class="section-title"><span>✋</span> O Método da Mão</div>
                <p style="color:var(--castanho);font-size:14px;margin-bottom:35px;text-align:center;font-style:italic;">A tua mão é proporcional ao teu corpo — mãos maiores = corpo maior = mais comida.</p>
                
                <div class="grid-2">
                    <div class="hand-card protein">
                        <div class="hand-title">🖐️ A Palma — PROTEÍNA</div>
                        <div class="hand-amount">~${dados.tamanho_palma}g de proteína</div>
                        <div class="hand-desc">Tamanho e espessura da tua palma (sem dedos)</div>
                        <div class="hand-example">Ex: 1 bife, 1 peito de frango</div>
                    </div>
                    <div class="hand-card carbs">
                        <div class="hand-title">🤲 A Mão em Concha — HIDRATOS</div>
                        <div class="hand-amount">~${dados.tamanho_mao}g de hidratos</div>
                        <div class="hand-desc">O que cabe na tua mão em concha</div>
                        <div class="hand-example">Ex: punhado de arroz, batata-doce</div>
                    </div>
                    <div class="hand-card fats">
                        <div class="hand-title">👍 O Polegar — GORDURA</div>
                        <div class="hand-amount">~${dados.tamanho_polegar}g de gordura</div>
                        <div class="hand-desc">Tamanho do teu polegar inteiro</div>
                        <div class="hand-example">Ex: 1 colher azeite, nozes</div>
                    </div>
                    <div class="hand-card veggies">
                        <div class="hand-title">✊ O Punho — VEGETAIS</div>
                        <div class="hand-amount">~100g de vegetais</div>
                        <div class="hand-desc">Tamanho do teu punho fechado</div>
                        <div class="hand-example" style="font-weight:600;font-style:normal;">Mas lembra-te: À VONTADE!</div>
                    </div>
                </div>
                
                <div class="page-footer">
                    <span>Documento exclusivo de ${dados.nome}</span>
                    <span>Página 4 de 10</span>
                </div>
            </div>
        </div>

        <!-- PÁGINA 5 - PROTEÍNAS -->
        <div class="page">
            <div class="page-inner">
                <div class="page-header">
                    <div class="page-logo">
                        <div class="page-logo-icon"><span>V</span></div>
                        <div class="page-logo-text">VITALIS</div>
                    </div>
                </div>
                
                <div class="section-title"><span>🥩</span> Proteínas Saudáveis</div>
                
                <div class="grid-2">
                    <div class="food-card">
                        <div class="food-title">Carnes Vermelhas (magras)</div>
                        <div class="food-list">Bife de vaca • Carne moída magra • Lombo de porco • Cabrito • Borrego • Fígado</div>
                    </div>
                    <div class="food-card">
                        <div class="food-title">Aves</div>
                        <div class="food-list">Peito de frango • Coxa de frango (sem pele) • Peru • Pato (sem pele) • Codorniz</div>
                    </div>
                    <div class="food-card">
                        <div class="food-title">Peixes & Mariscos</div>
                        <div class="food-list">Salmão • Atum • Sardinha • Carapau • Pescada • Tilápia • Camarão • Lulas</div>
                    </div>
                    <div class="food-card">
                        <div class="food-title">Ovos & Lacticínios</div>
                        <div class="food-list">Ovos inteiros • Queijo fresco • Iogurte grego natural • Requeijão</div>
                    </div>
                </div>
                
                <div class="page-footer">
                    <span>Documento exclusivo de ${dados.nome}</span>
                    <span>Página 5 de 10</span>
                </div>
            </div>
        </div>

        <!-- PÁGINA 6 - HIDRATOS E GORDURAS -->
        <div class="page">
            <div class="page-inner">
                <div class="page-header">
                    <div class="page-logo">
                        <div class="page-logo-icon"><span>V</span></div>
                        <div class="page-logo-text">VITALIS</div>
                    </div>
                </div>
                
                <div class="section-title"><span>🍚</span> Hidratos Saudáveis & <span>🥑</span> Gorduras</div>
                
                <div class="grid-2" style="margin-bottom:25px;">
                    <div class="hand-card carbs" style="padding:25px;">
                        <div class="hand-title" style="font-size:16px;">Tubérculos & Grãos</div>
                        <div class="food-list" style="margin-top:12px;">Batata-doce • Mandioca • Inhame • Arroz integral • Quinoa • Aveia</div>
                    </div>
                    <div class="hand-card carbs" style="padding:25px;">
                        <div class="hand-title" style="font-size:16px;">Frutas (baixo IG)</div>
                        <div class="food-list" style="margin-top:12px;">Frutos vermelhos • Maçã verde • Pera • Laranja • Toranja • Kiwi</div>
                    </div>
                </div>
                
                <div class="grid-2" style="margin-bottom:25px;">
                    <div class="hand-card fats" style="padding:25px;">
                        <div class="hand-title" style="font-size:16px;">Óleos & Manteigas</div>
                        <div class="food-list" style="margin-top:12px;">Azeite extra-virgem • Óleo de coco • Manteiga • Ghee</div>
                    </div>
                    <div class="hand-card fats" style="padding:25px;">
                        <div class="hand-title" style="font-size:16px;">Frutos Secos & Sementes</div>
                        <div class="food-list" style="margin-top:12px;">Amêndoas • Nozes • Cajus • Sementes de chia • Linhaça</div>
                    </div>
                </div>
                
                <div class="hand-card fats" style="padding:25px;">
                    <div class="hand-title" style="font-size:16px;">Outras Fontes de Gordura</div>
                    <div class="food-list" style="margin-top:12px;">Abacate • Azeitonas • Coco • Chocolate negro (+70%)</div>
                </div>
                
                <div class="page-footer">
                    <span>Documento exclusivo de ${dados.nome}</span>
                    <span>Página 6 de 10</span>
                </div>
            </div>
        </div>

        <!-- PÁGINA 7 - VEGETAIS -->
        <div class="page">
            <div class="page-inner">
                <div class="page-header">
                    <div class="page-logo">
                        <div class="page-logo-icon"><span>V</span></div>
                        <div class="page-logo-text">VITALIS</div>
                    </div>
                </div>
                
                <div class="section-title"><span>🥬</span> Vegetais — Come o Arco-Íris!</div>
                <p style="color:var(--castanho);font-size:14px;margin-bottom:30px;text-align:center;">Cada cor representa diferentes nutrientes. Inclui pelo menos 3 cores por refeição!</p>
                
                <div class="grid-2" style="margin-bottom:20px;">
                    <div class="veggie-card green">
                        <div class="veggie-title">🟢 Verdes</div>
                        <div class="veggie-list">Espinafre, Couve, Brócolos, Alface, Rúcula, Pepino, Abobrinha</div>
                    </div>
                    <div class="veggie-card red">
                        <div class="veggie-title">🔴 Vermelhos</div>
                        <div class="veggie-list">Tomate, Pimento vermelho, Beterraba, Rabanete</div>
                    </div>
                </div>
                <div class="grid-2" style="margin-bottom:20px;">
                    <div class="veggie-card orange">
                        <div class="veggie-title">🟠 Laranjas</div>
                        <div class="veggie-list">Cenoura, Abóbora, Pimento laranja</div>
                    </div>
                    <div class="veggie-card white">
                        <div class="veggie-title">⚪ Brancos</div>
                        <div class="veggie-list">Couve-flor, Cogumelos, Alho, Cebola, Nabo</div>
                    </div>
                </div>
                <div class="veggie-card purple">
                    <div class="veggie-title">🟣 Roxos</div>
                    <div class="veggie-list">Beringela, Couve roxa, Cebola roxa</div>
                </div>
                
                <div class="page-footer">
                    <span>Documento exclusivo de ${dados.nome}</span>
                    <span>Página 7 de 10</span>
                </div>
            </div>
        </div>

        <!-- PÁGINA 8 - LISTA DE COMPRAS -->
        <div class="page">
            <div class="page-inner">
                <div class="page-header">
                    <div class="page-logo">
                        <div class="page-logo-icon"><span>V</span></div>
                        <div class="page-logo-text">VITALIS</div>
                    </div>
                </div>
                
                <div class="section-title"><span>🛒</span> Lista de Compras Semanal</div>
                
                <div class="grid-2">
                    <div class="food-card">
                        <div class="food-title">🥩 Proteínas</div>
                        <div class="food-list" style="line-height:2.2;">☐ Peito de frango (1kg)<br>☐ Ovos (2 dúzias)<br>☐ Peixe fresco (500g)<br>☐ Carne moída (500g)</div>
                    </div>
                    <div class="food-card">
                        <div class="food-title">🥬 Vegetais</div>
                        <div class="food-list" style="line-height:2.2;">☐ Espinafre/Couve<br>☐ Brócolos<br>☐ Tomate<br>☐ Pepino<br>☐ Pimentos<br>☐ Cebola e Alho</div>
                    </div>
                    <div class="food-card">
                        <div class="food-title">🥑 Gorduras</div>
                        <div class="food-list" style="line-height:2.2;">☐ Azeite extra-virgem<br>☐ Abacate (2-3)<br>☐ Manteiga<br>☐ Amêndoas/Nozes</div>
                    </div>
                    <div class="food-card">
                        <div class="food-title">🧂 Outros</div>
                        <div class="food-list" style="line-height:2.2;">☐ Sal e pimenta<br>☐ Ervas frescas<br>☐ Limões<br>☐ Chá/Café</div>
                    </div>
                </div>
                
                <div class="page-footer">
                    <span>Documento exclusivo de ${dados.nome}</span>
                    <span>Página 8 de 10</span>
                </div>
            </div>
        </div>

        <!-- PÁGINA 9 - REGRAS -->
        <div class="page">
            <div class="page-inner">
                <div class="page-header">
                    <div class="page-logo">
                        <div class="page-logo-icon"><span>V</span></div>
                        <div class="page-logo-text">VITALIS</div>
                    </div>
                </div>
                
                <div class="section-title"><span>📋</span> Regras da ${faseConfig.nome}</div>
                
                <div class="grid-2" style="margin-bottom:25px;">
                    <div class="rules-card priority">
                        <div class="rules-title">✓ PRIORIZAR</div>
                        <ul class="rules-list">
                            ${faseConfig.priorizar.map(item => `<li>✓ ${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="rules-card avoid">
                        <div class="rules-title">✗ EVITAR</div>
                        <ul class="rules-list">
                            ${faseConfig.evitar.map(item => `<li>✗ ${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="rules-card tips">
                    <div class="rules-title">💡 DICAS</div>
                    <ul class="rules-list">
                        ${faseConfig.dicas.map(item => `<li>• ${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="page-footer">
                    <span>Documento exclusivo de ${dados.nome}</span>
                    <span>Página 9 de 10</span>
                </div>
            </div>
        </div>

        <!-- PÁGINA 10 - FINAL -->
        <div class="page">
            <div class="final-page">
                <div class="final-content">
                    <div class="logo-circle" style="margin-bottom:30px;"><span>V</span></div>
                    <div class="brand-name" style="margin-bottom:50px;">VITALIS</div>
                    
                    <div class="final-quote">
                        <div class="final-quote-mark">"</div>
                        <p>Quando o excesso cai, o corpo responde.</p>
                    </div>
                    
                    <div class="final-for">Criado Exclusivamente Para</div>
                    <div class="final-name">${dados.nome}</div>
                </div>
                <div class="cover-footer">
                    <div><strong>Vivianne Saraiva</strong>Precision Nutrition Level 1 Coach</div>
                    <div class="cover-footer-right"><strong>vivianne.saraiva@outlook.com</strong>WhatsApp: +258 84 524 3875</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    return html;
  };

  const descarregarHTML = () => {
    const htmlContent = gerarHTML();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vitalis_Plano_${dados.nome.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const faseConfig = FASES_CONFIG[dados?.fase] || FASES_CONFIG.inducao;

  if (loading) {
    return (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
        <div style={{background:'white',borderRadius:'16px',padding:'32px',textAlign:'center'}}>
          <div style={{width:'48px',height:'48px',border:'4px solid #f3f3f3',borderTop:'4px solid #C1634A',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto'}}></div>
          <p style={{marginTop:'16px',color:'#666'}}>A preparar...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
        <div style={{background:'white',borderRadius:'16px',padding:'32px',textAlign:'center'}}>
          <p style={{color:'#C62828',marginBottom:'16px'}}>{erro}</p>
          <button onClick={onClose} style={{padding:'8px 24px',background:'#eee',border:'none',borderRadius:'8px',cursor:'pointer'}}>Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
      <div style={{background:'white',borderRadius:'20px',padding:'40px 50px',maxWidth:'500px',textAlign:'center'}}>
        <div style={{width:'80px',height:'80px',background:'linear-gradient(135deg, #C1634A, #8B4513)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 25px'}}>
          <span style={{color:'white',fontSize:'40px',fontWeight:'bold'}}>V</span>
        </div>
        
        <h2 style={{fontSize:'24px',color:'#6B4423',marginBottom:'10px'}}>Plano de {dados.nome}</h2>
        <p style={{color:'#8B4513',marginBottom:'30px'}}>10 páginas • Design profissional</p>
        
        <div style={{background:'#FDF8F3',borderRadius:'12px',padding:'20px',marginBottom:'25px',textAlign:'left'}}>
          <p style={{fontSize:'14px',color:'#6B4423',marginBottom:'10px'}}><strong>Como usar:</strong></p>
          <ol style={{fontSize:'13px',color:'#8B4513',paddingLeft:'20px',lineHeight:'1.8'}}>
            <li>Clica em "Descarregar HTML"</li>
            <li>Abre o ficheiro no browser</li>
            <li>Pressiona <strong>Ctrl+P</strong> (ou Cmd+P no Mac)</li>
            <li>Selecciona "Guardar como PDF"</li>
          </ol>
        </div>
        
        <div style={{display:'flex',gap:'15px',justifyContent:'center'}}>
          <button 
            onClick={onClose}
            style={{padding:'14px 28px',background:'#f5f5f5',color:'#666',border:'none',borderRadius:'10px',fontSize:'15px',cursor:'pointer'}}
          >
            Cancelar
          </button>
          <button 
            onClick={descarregarHTML}
            style={{padding:'14px 28px',background:'linear-gradient(135deg, #C1634A, #8B4513)',color:'white',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'600',cursor:'pointer'}}
          >
            📥 Descarregar HTML
          </button>
        </div>
      </div>
    </div>
  );
}
