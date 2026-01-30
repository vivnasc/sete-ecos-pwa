// ============================================================
// VITALIS - GERADOR DE PDF PROFISSIONAL
// Usa @react-pdf/renderer para qualidade vectorial
// npm install @react-pdf/renderer
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
  Image,
  Svg,
  Circle,
} from '@react-pdf/renderer';
import { supabase } from '../../lib/supabase.js';

// Registar fontes Google
Font.register({
  family: 'Montserrat',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Ew-.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtZ6Ew-.ttf', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu173w-.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w-.ttf', fontWeight: 700 },
  ],
});

Font.register({
  family: 'Cormorant',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYrEtFmQ.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3YmX5slCNuHLi8bLeY9MK7whWMhyjQAllvuQ.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3YmX5slCNuHLi8bLeY9MK7whWMhyjQWlhvuQ.ttf', fontWeight: 700 },
  ],
});

// Cores
const colors = {
  terracota: '#C1634A',
  terracotaDark: '#A0422A',
  castanho: '#8B4513',
  castanhoDark: '#6B4423',
  verde: '#6B8E23',
  bege: '#D2B48C',
  begeLight: '#F5F0E8',
  creme: '#FDF8F3',
  proteinaBg: '#FFEBEE',
  proteinaBorder: '#E57373',
  proteinaText: '#C62828',
  hidratosBg: '#E3F2FD',
  hidratosBorder: '#64B5F6',
  hidratosText: '#1565C0',
  gorduraBg: '#FFF8E1',
  gorduraBorder: '#FFD54F',
  gorduraText: '#F57F17',
  legumesBg: '#E8F5E9',
  legumesBorder: '#81C784',
  legumesText: '#2E7D32',
};

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

// Estilos do PDF
const styles = StyleSheet.create({
  // BASE
  page: {
    backgroundColor: colors.creme,
    fontFamily: 'Montserrat',
    fontSize: 11,
    color: colors.castanhoDark,
    position: 'relative',
  },
  
  // CAPA
  coverPage: {
    backgroundColor: colors.creme,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  coverTop: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.terracota,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  logoText: {
    color: 'white',
    fontSize: 48,
    fontFamily: 'Cormorant',
    fontWeight: 700,
  },
  brandName: {
    fontFamily: 'Cormorant',
    fontSize: 42,
    fontWeight: 700,
    color: colors.terracotaDark,
    letterSpacing: 10,
  },
  brandTagline: {
    fontSize: 10,
    color: colors.castanho,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 5,
  },
  coverDivider: {
    width: 80,
    height: 2,
    backgroundColor: colors.terracota,
    marginVertical: 35,
  },
  coverTitle: {
    fontFamily: 'Cormorant',
    fontSize: 30,
    fontWeight: 600,
    color: colors.castanhoDark,
    letterSpacing: 2,
  },
  coverSubtitle: {
    fontSize: 14,
    color: colors.terracota,
    fontWeight: 500,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 40,
  },
  clientBox: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: colors.bege,
    borderRadius: 20,
    padding: '30 60',
    alignItems: 'center',
  },
  clientLabel: {
    fontSize: 9,
    color: colors.castanho,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  clientName: {
    fontFamily: 'Cormorant',
    fontSize: 32,
    fontWeight: 600,
    color: colors.castanhoDark,
    marginBottom: 20,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
    marginBottom: 15,
  },
  weightBox: {
    alignItems: 'center',
  },
  weightLabel: {
    fontSize: 8,
    color: colors.castanho,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  weightValue: {
    fontSize: 28,
    fontWeight: 700,
    color: colors.terracotaDark,
  },
  weightArrow: {
    fontSize: 28,
    color: colors.verde,
  },
  startDate: {
    fontSize: 11,
    color: colors.castanho,
  },
  coverFooter: {
    backgroundColor: colors.castanhoDark,
    padding: '20 40',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 10,
  },
  footerBold: {
    fontWeight: 600,
    marginBottom: 2,
  },
  
  // PÁGINAS INTERIORES
  innerPage: {
    padding: '40 50 70 50',
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.bege,
    paddingBottom: 12,
    marginBottom: 30,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogoCircle: {
    width: 35,
    height: 35,
    borderRadius: 17,
    backgroundColor: colors.terracota,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Cormorant',
    fontWeight: 700,
  },
  headerBrand: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.terracota,
    letterSpacing: 2,
  },
  headerPhase: {
    fontSize: 11,
    color: colors.castanho,
    fontWeight: 500,
  },
  sectionTitle: {
    fontFamily: 'Cormorant',
    fontSize: 24,
    fontWeight: 600,
    color: colors.castanhoDark,
    marginBottom: 20,
  },
  pageFooter: {
    position: 'absolute',
    bottom: 25,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.bege,
    paddingTop: 10,
    fontSize: 9,
    color: colors.castanho,
  },
  
  // CARDS & BOXES
  infoBox: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.bege,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 1.7,
    color: colors.castanhoDark,
  },
  grid2: {
    flexDirection: 'row',
    gap: 15,
  },
  grid3: {
    flexDirection: 'row',
    gap: 12,
  },
  grid4: {
    flexDirection: 'row',
    gap: 10,
  },
  gridItem: {
    flex: 1,
  },
  
  // PORÇÕES
  portionCard: {
    flex: 1,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  portionCardProtein: {
    backgroundColor: colors.proteinaBg,
    borderColor: colors.proteinaBorder,
  },
  portionCardCarbs: {
    backgroundColor: colors.hidratosBg,
    borderColor: colors.hidratosBorder,
  },
  portionCardFats: {
    backgroundColor: colors.gorduraBg,
    borderColor: colors.gorduraBorder,
  },
  portionCardVeggies: {
    backgroundColor: colors.legumesBg,
    borderColor: colors.legumesBorder,
  },
  portionLabel: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 10,
  },
  portionValue: {
    fontSize: 48,
    fontWeight: 700,
    lineHeight: 1,
  },
  portionUnit: {
    fontSize: 11,
    color: colors.castanho,
    marginTop: 6,
  },
  
  // MACROS
  macroCard: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.bege,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  macroIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.terracotaDark,
  },
  macroLabel: {
    fontSize: 10,
    color: colors.castanho,
    marginTop: 4,
  },
  
  // MÉTODO DA MÃO
  handCard: {
    flex: 1,
    borderRadius: 14,
    padding: 20,
    borderWidth: 2,
  },
  handTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 10,
  },
  handAmount: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 12,
  },
  handDesc: {
    fontSize: 11,
    color: colors.castanhoDark,
    marginBottom: 6,
  },
  handExample: {
    fontSize: 10,
    color: colors.castanho,
    fontStyle: 'italic',
  },
  
  // ALIMENTOS
  foodCard: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.bege,
    borderRadius: 12,
    padding: 18,
  },
  foodTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.terracotaDark,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.bege,
  },
  foodList: {
    fontSize: 11,
    color: colors.castanhoDark,
    lineHeight: 1.8,
  },
  
  // VEGETAIS
  veggieCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
  },
  veggieTitle: {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 8,
  },
  veggieList: {
    fontSize: 10,
    color: colors.castanho,
    lineHeight: 1.6,
  },
  
  // REGRAS
  rulesCard: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
  },
  rulesPriority: {
    backgroundColor: '#E8F5E9',
    borderColor: '#81C784',
  },
  rulesAvoid: {
    backgroundColor: '#FFEBEE',
    borderColor: '#E57373',
  },
  rulesTips: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFD54F',
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 15,
  },
  rulesList: {
    fontSize: 11,
    lineHeight: 1.8,
  },
  
  // PÁGINA FINAL
  finalPage: {
    backgroundColor: colors.creme,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  finalContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  finalQuote: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 40,
    maxWidth: 400,
  },
  finalQuoteMark: {
    fontSize: 50,
    color: colors.bege,
    lineHeight: 0.5,
  },
  finalQuoteText: {
    fontFamily: 'Cormorant',
    fontSize: 22,
    color: colors.castanhoDark,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 1.5,
    marginVertical: 20,
  },
  finalFor: {
    fontSize: 10,
    color: colors.castanho,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  finalName: {
    fontFamily: 'Cormorant',
    fontSize: 32,
    fontWeight: 600,
    color: colors.castanhoDark,
  },
});

// Componente Logo
const Logo = ({ size = 35 }) => (
  <View style={[styles.headerLogoCircle, { width: size, height: size, borderRadius: size/2 }]}>
    <Text style={[styles.headerLogoText, { fontSize: size * 0.5 }]}>V</Text>
  </View>
);

// Header das páginas interiores
const PageHeader = ({ fase }) => (
  <View style={styles.pageHeader}>
    <View style={styles.headerLogo}>
      <Logo />
      <Text style={styles.headerBrand}>VITALIS</Text>
    </View>
    <Text style={styles.headerPhase}>{fase}</Text>
  </View>
);

// Footer das páginas
const PageFooter = ({ nome, pagina }) => (
  <View style={styles.pageFooter}>
    <Text>Documento exclusivo de {nome}</Text>
    <Text>Página {pagina} de 10</Text>
  </View>
);

// Documento PDF
const VitalisPDF = ({ dados }) => {
  const faseConfig = FASES_CONFIG[dados?.fase] || FASES_CONFIG.inducao;
  
  const formatarData = (d) => {
    if (!d) return new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
    return new Date(d).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <Document>
      {/* PÁGINA 1 - CAPA */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <View style={styles.coverTop}>
            <Logo size={90} />
            <Text style={styles.brandName}>VITALIS</Text>
            <Text style={styles.brandTagline}>A Raiz da Transformação</Text>
            <View style={styles.coverDivider} />
            <Text style={styles.coverTitle}>Guia Personalizado</Text>
            <Text style={styles.coverSubtitle}>Plano Alimentar</Text>
            
            <View style={styles.clientBox}>
              <Text style={styles.clientLabel}>Preparado Exclusivamente Para</Text>
              <Text style={styles.clientName}>{dados.nome}</Text>
              <View style={styles.weightRow}>
                <View style={styles.weightBox}>
                  <Text style={styles.weightLabel}>Peso Actual</Text>
                  <Text style={styles.weightValue}>{dados.peso_actual} kg</Text>
                </View>
                <Text style={styles.weightArrow}>→</Text>
                <View style={styles.weightBox}>
                  <Text style={styles.weightLabel}>Meta</Text>
                  <Text style={styles.weightValue}>{dados.peso_meta} kg</Text>
                </View>
              </View>
              <Text style={styles.startDate}>Início: {formatarData(dados.data_inicio)}</Text>
            </View>
          </View>
          
          <View style={styles.coverFooter}>
            <View>
              <Text style={[styles.footerText, styles.footerBold]}>Vivianne Saraiva</Text>
              <Text style={styles.footerText}>Precision Nutrition Level 1 Coach</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.footerText, styles.footerBold]}>vivianne.saraiva@outlook.com</Text>
              <Text style={styles.footerText}>WhatsApp: +258 84 524 3875</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* PÁGINA 2 - BEM-VINDA & FASE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.innerPage}>
          <PageHeader fase={faseConfig.nome} />
          
          <Text style={styles.sectionTitle}>👋 Bem-vinda à Tua Jornada</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 600 }}>{dados.nome}</Text>, este guia foi criado especialmente para ti, com base nas tuas respostas, objectivos e estilo de vida. Cada porção, cada recomendação, foi calculada para o teu corpo e para onde queres chegar.
            </Text>
          </View>
          
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>🔥 {faseConfig.nome}</Text>
          <View style={styles.infoBox}>
            <View style={{ backgroundColor: colors.begeLight, borderRadius: 15, padding: '5 15', marginBottom: 12, alignSelf: 'flex-start' }}>
              <Text style={{ fontSize: 10, color: colors.castanho }}>Duração: {faseConfig.duracao}</Text>
            </View>
            <Text style={styles.infoText}>{faseConfig.descricao}</Text>
          </View>
          
          <View style={[styles.grid2, { marginTop: 20 }]}>
            <View style={[styles.infoBox, styles.gridItem]}>
              <Text style={{ fontSize: 9, color: colors.terracota, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Abordagem Nutricional</Text>
              <Text style={{ fontSize: 20, fontWeight: 600, color: colors.terracotaDark, textTransform: 'capitalize' }}>{dados.abordagem?.replace('_', ' ')}</Text>
            </View>
            <View style={[styles.infoBox, styles.gridItem]}>
              <Text style={{ fontSize: 9, color: colors.terracota, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Meta Semanal</Text>
              <Text style={{ fontSize: 20, fontWeight: 600, color: colors.verde }}>-0.5 a -1.0 kg/semana</Text>
            </View>
          </View>
          
          <PageFooter nome={dados.nome} pagina={2} />
        </View>
      </Page>

      {/* PÁGINA 3 - PORÇÕES */}
      <Page size="A4" style={styles.page}>
        <View style={styles.innerPage}>
          <PageHeader fase={faseConfig.nome} />
          
          <Text style={styles.sectionTitle}>🍽️ As Tuas Porções Diárias</Text>
          <Text style={{ fontSize: 12, color: colors.castanho, marginBottom: 20 }}>Usa o Método da Mão para medir — simples, prático e sempre contigo.</Text>
          
          <View style={[styles.grid3, { marginBottom: 20 }]}>
            <View style={[styles.portionCard, styles.portionCardProtein]}>
              <Text style={[styles.portionLabel, { color: colors.proteinaText }]}>Proteína</Text>
              <Text style={[styles.portionValue, { color: colors.proteinaText }]}>{dados.porcoes_proteina}</Text>
              <Text style={styles.portionUnit}>palmas/dia</Text>
            </View>
            <View style={[styles.portionCard, styles.portionCardCarbs]}>
              <Text style={[styles.portionLabel, { color: colors.hidratosText }]}>Hidratos</Text>
              <Text style={[styles.portionValue, { color: colors.hidratosText }]}>{dados.porcoes_hidratos}</Text>
              <Text style={styles.portionUnit}>mãos/dia</Text>
            </View>
            <View style={[styles.portionCard, styles.portionCardFats]}>
              <Text style={[styles.portionLabel, { color: colors.gorduraText }]}>Gordura</Text>
              <Text style={[styles.portionValue, { color: colors.gorduraText }]}>{dados.porcoes_gordura}</Text>
              <Text style={styles.portionUnit}>polegares/dia</Text>
            </View>
          </View>
          
          <View style={[styles.portionCard, styles.portionCardVeggies, { marginBottom: 25 }]}>
            <Text style={[styles.portionLabel, { color: colors.legumesText }]}>🥬 Vegetais & Legumes</Text>
            <Text style={[styles.portionValue, { color: colors.legumesText, fontSize: 32 }]}>À VONTADE</Text>
            <Text style={styles.portionUnit}>Não precisas medir — quanto mais cores, melhor!</Text>
          </View>
          
          <Text style={[styles.sectionTitle, { fontSize: 18, marginBottom: 15 }]}>📊 Os Teus Macros Diários</Text>
          <View style={styles.grid4}>
            <View style={styles.macroCard}>
              <Text style={styles.macroIcon}>🔥</Text>
              <Text style={styles.macroValue}>{dados.calorias}</Text>
              <Text style={styles.macroLabel}>Calorias</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroIcon}>🥩</Text>
              <Text style={styles.macroValue}>{dados.proteina_g}g</Text>
              <Text style={styles.macroLabel}>Proteína</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroIcon}>🍚</Text>
              <Text style={styles.macroValue}>{dados.carboidratos_g}g</Text>
              <Text style={styles.macroLabel}>Hidratos</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroIcon}>🥑</Text>
              <Text style={styles.macroValue}>{dados.gordura_g}g</Text>
              <Text style={styles.macroLabel}>Gordura</Text>
            </View>
          </View>
          
          <PageFooter nome={dados.nome} pagina={3} />
        </View>
      </Page>

      {/* PÁGINA 4 - MÉTODO DA MÃO */}
      <Page size="A4" style={styles.page}>
        <View style={styles.innerPage}>
          <PageHeader fase={faseConfig.nome} />
          
          <Text style={styles.sectionTitle}>✋ O Método da Mão</Text>
          <Text style={{ fontSize: 12, color: colors.castanho, marginBottom: 25, textAlign: 'center', fontStyle: 'italic' }}>A tua mão é proporcional ao teu corpo — mãos maiores = corpo maior = mais comida.</Text>
          
          <View style={[styles.grid2, { marginBottom: 15 }]}>
            <View style={[styles.handCard, styles.portionCardProtein]}>
              <Text style={[styles.handTitle, { color: colors.proteinaText }]}>🖐️ A Palma — PROTEÍNA</Text>
              <Text style={[styles.handAmount, { color: colors.proteinaText }]}>~{dados.tamanho_palma}g de proteína</Text>
              <Text style={styles.handDesc}>Tamanho e espessura da tua palma (sem dedos)</Text>
              <Text style={styles.handExample}>Ex: 1 bife, 1 peito de frango</Text>
            </View>
            <View style={[styles.handCard, styles.portionCardCarbs]}>
              <Text style={[styles.handTitle, { color: colors.hidratosText }]}>🤲 A Mão em Concha — HIDRATOS</Text>
              <Text style={[styles.handAmount, { color: colors.hidratosText }]}>~{dados.tamanho_mao}g de hidratos</Text>
              <Text style={styles.handDesc}>O que cabe na tua mão em concha</Text>
              <Text style={styles.handExample}>Ex: punhado de arroz, batata-doce</Text>
            </View>
          </View>
          
          <View style={styles.grid2}>
            <View style={[styles.handCard, styles.portionCardFats]}>
              <Text style={[styles.handTitle, { color: colors.gorduraText }]}>👍 O Polegar — GORDURA</Text>
              <Text style={[styles.handAmount, { color: colors.gorduraText }]}>~{dados.tamanho_polegar}g de gordura</Text>
              <Text style={styles.handDesc}>Tamanho do teu polegar inteiro</Text>
              <Text style={styles.handExample}>Ex: 1 colher azeite, nozes</Text>
            </View>
            <View style={[styles.handCard, styles.portionCardVeggies]}>
              <Text style={[styles.handTitle, { color: colors.legumesText }]}>✊ O Punho — VEGETAIS</Text>
              <Text style={[styles.handAmount, { color: colors.legumesText }]}>~100g de vegetais</Text>
              <Text style={styles.handDesc}>Tamanho do teu punho fechado</Text>
              <Text style={[styles.handExample, { fontWeight: 600, fontStyle: 'normal' }]}>Mas lembra-te: À VONTADE!</Text>
            </View>
          </View>
          
          <PageFooter nome={dados.nome} pagina={4} />
        </View>
      </Page>

      {/* PÁGINA 5 - PROTEÍNAS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.innerPage}>
          <PageHeader fase={faseConfig.nome} />
          
          <Text style={styles.sectionTitle}>🥩 Proteínas Saudáveis</Text>
          
          <View style={[styles.grid2, { marginBottom: 15 }]}>
            <View style={styles.foodCard}>
              <Text style={styles.foodTitle}>Carnes Vermelhas (magras)</Text>
              <Text style={styles.foodList}>Bife de vaca • Carne moída magra • Lombo de porco • Cabrito • Borrego • Fígado</Text>
            </View>
            <View style={styles.foodCard}>
              <Text style={styles.foodTitle}>Aves</Text>
              <Text style={styles.foodList}>Peito de frango • Coxa de frango (sem pele) • Peru • Pato (sem pele) • Codorniz</Text>
            </View>
          </View>
          
          <View style={styles.grid2}>
            <View style={styles.foodCard}>
              <Text style={styles.foodTitle}>Peixes & Mariscos</Text>
              <Text style={styles.foodList}>Salmão • Atum • Sardinha • Carapau • Pescada • Tilápia • Camarão • Lulas</Text>
            </View>
            <View style={styles.foodCard}>
              <Text style={styles.foodTitle}>Ovos & Lacticínios</Text>
              <Text style={styles.foodList}>Ovos inteiros • Queijo fresco • Iogurte grego natural • Requeijão</Text>
            </View>
          </View>
          
          <PageFooter nome={dados.nome} pagina={5} />
        </View>
      </Page>

      {/* PÁGINA 6 - HIDRATOS E GORDURAS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.innerPage}>
          <PageHeader fase={faseConfig.nome} />
          
          <Text style={styles.sectionTitle}>🍚 Hidratos Saudáveis & 🥑 Gorduras</Text>
          
          <View style={[styles.grid2, { marginBottom: 15 }]}>
            <View style={[styles.handCard, styles.portionCardCarbs, { padding: 18 }]}>
              <Text style={[styles.foodTitle, { color: colors.hidratosText, borderBottomWidth: 0, paddingBottom: 0 }]}>Tubérculos & Grãos</Text>
              <Text style={[styles.foodList, { marginTop: 10 }]}>Batata-doce • Mandioca • Inhame • Arroz integral • Quinoa • Aveia</Text>
            </View>
            <View style={[styles.handCard, styles.portionCardCarbs, { padding: 18 }]}>
              <Text style={[styles.foodTitle, { color: colors.hidratosText, borderBottomWidth: 0, paddingBottom: 0 }]}>Frutas (baixo IG)</Text>
              <Text style={[styles.foodList, { marginTop: 10 }]}>Frutos vermelhos • Maçã verde • Pera • Laranja • Toranja • Kiwi</Text>
            </View>
          </View>
          
          <View style={[styles.grid2, { marginBottom: 15 }]}>
            <View style={[styles.handCard, styles.portionCardFats, { padding: 18 }]}>
              <Text style={[styles.foodTitle, { color: colors.gorduraText, borderBottomWidth: 0, paddingBottom: 0 }]}>Óleos & Manteigas</Text>
              <Text style={[styles.foodList, { marginTop: 10 }]}>Azeite extra-virgem • Óleo de coco • Manteiga • Ghee</Text>
            </View>
            <View style={[styles.handCard, styles.portionCardFats, { padding: 18 }]}>
              <Text style={[styles.foodTitle, { color: colors.gorduraText, borderBottomWidth: 0, paddingBottom: 0 }]}>Frutos Secos & Sementes</Text>
              <Text style={[styles.foodList, { marginTop: 10 }]}>Amêndoas • Nozes • Cajus • Sementes de chia • Linhaça</Text>
            </View>
          </View>
          
          <View style={[styles.handCard, styles.portionCardFats, { padding: 18 }]}>
            <Text style={[styles.foodTitle, { color: colors.gorduraText, borderBottomWidth: 0, paddingBottom: 0 }]}>Outras Fontes de Gordura</Text>
            <Text style={[styles.foodList, { marginTop: 10 }]}>Abacate • Azeitonas • Coco • Chocolate negro (+70%)</Text>
          </View>
          
          <PageFooter nome={dados.nome} pagina={6} />
        </View>
      </Page>

      {/* PÁGINA 7 - VEGETAIS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.innerPage}>
          <PageHeader fase={faseConfig.nome} />
          
          <Text style={styles.sectionTitle}>🥬 Vegetais — Come o Arco-Íris!</Text>
          <Text style={{ fontSize: 12, color: colors.castanho, marginBottom: 20, textAlign: 'center' }}>Cada cor representa diferentes nutrientes. Inclui pelo menos 3 cores por refeição!</Text>
          
          <View style={[styles.grid2, { marginBottom: 12 }]}>
            <View style={[styles.veggieCard, { borderLeftColor: '#4CAF50', backgroundColor: '#F1F8E9' }]}>
              <Text style={[styles.veggieTitle, { color: '#2E7D32' }]}>🟢 Verdes</Text>
              <Text style={styles.veggieList}>Espinafre, Couve, Brócolos, Alface, Rúcula, Pepino, Abobrinha</Text>
            </View>
            <View style={[styles.veggieCard, { borderLeftColor: '#F44336', backgroundColor: '#FFEBEE' }]}>
              <Text style={[styles.veggieTitle, { color: '#C62828' }]}>🔴 Vermelhos</Text>
              <Text style={styles.veggieList}>Tomate, Pimento vermelho, Beterraba, Rabanete</Text>
            </View>
          </View>
          
          <View style={[styles.grid2, { marginBottom: 12 }]}>
            <View style={[styles.veggieCard, { borderLeftColor: '#FF9800', backgroundColor: '#FFF3E0' }]}>
              <Text style={[styles.veggieTitle, { color: '#E65100' }]}>🟠 Laranjas</Text>
              <Text style={styles.veggieList}>Cenoura, Abóbora, Pimento laranja</Text>
            </View>
            <View style={[styles.veggieCard, { borderLeftColor: '#9E9E9E', backgroundColor: '#FAFAFA' }]}>
              <Text style={[styles.veggieTitle, { color: '#616161' }]}>⚪ Brancos</Text>
              <Text style={styles.veggieList}>Couve-flor, Cogumelos, Alho, Cebola, Nabo</Text>
            </View>
          </View>
          
          <View style={[styles.veggieCard, { borderLeftColor: '#9C27B0', backgroundColor: '#F3E5F5' }]}>
            <Text style={[styles.veggieTitle, { color: '#6A1B9A' }]}>🟣 Roxos</Text>
            <Text style={styles.veggieList}>Beringela, Couve roxa, Cebola roxa</Text>
          </View>
          
          <PageFooter nome={dados.nome} pagina={7} />
        </View>
      </Page>

      {/* PÁGINA 8 - LISTA DE COMPRAS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.innerPage}>
          <PageHeader fase={faseConfig.nome} />
          
          <Text style={styles.sectionTitle}>🛒 Lista de Compras Semanal</Text>
          
          <View style={[styles.grid2, { marginBottom: 15 }]}>
            <View style={styles.foodCard}>
              <Text style={styles.foodTitle}>🥩 Proteínas</Text>
              <Text style={styles.foodList}>☐ Peito de frango (1kg){'\n'}☐ Ovos (2 dúzias){'\n'}☐ Peixe fresco (500g){'\n'}☐ Carne moída (500g)</Text>
            </View>
            <View style={styles.foodCard}>
              <Text style={styles.foodTitle}>🥬 Vegetais</Text>
              <Text style={styles.foodList}>☐ Espinafre/Couve{'\n'}☐ Brócolos{'\n'}☐ Tomate{'\n'}☐ Pepino{'\n'}☐ Pimentos{'\n'}☐ Cebola e Alho</Text>
            </View>
          </View>
          
          <View style={styles.grid2}>
            <View style={styles.foodCard}>
              <Text style={styles.foodTitle}>🥑 Gorduras</Text>
              <Text style={styles.foodList}>☐ Azeite extra-virgem{'\n'}☐ Abacate (2-3){'\n'}☐ Manteiga{'\n'}☐ Amêndoas/Nozes</Text>
            </View>
            <View style={styles.foodCard}>
              <Text style={styles.foodTitle}>🧂 Outros</Text>
              <Text style={styles.foodList}>☐ Sal e pimenta{'\n'}☐ Ervas frescas{'\n'}☐ Limões{'\n'}☐ Chá/Café</Text>
            </View>
          </View>
          
          <PageFooter nome={dados.nome} pagina={8} />
        </View>
      </Page>

      {/* PÁGINA 9 - REGRAS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.innerPage}>
          <PageHeader fase={faseConfig.nome} />
          
          <Text style={styles.sectionTitle}>📋 Regras da {faseConfig.nome}</Text>
          
          <View style={[styles.grid2, { marginBottom: 15 }]}>
            <View style={[styles.rulesCard, styles.rulesPriority]}>
              <Text style={[styles.rulesTitle, { color: '#2E7D32' }]}>✓ PRIORIZAR</Text>
              <Text style={styles.rulesList}>
                {faseConfig.priorizar.map((item, i) => `✓ ${item}`).join('\n')}
              </Text>
            </View>
            <View style={[styles.rulesCard, styles.rulesAvoid]}>
              <Text style={[styles.rulesTitle, { color: '#C62828' }]}>✗ EVITAR</Text>
              <Text style={styles.rulesList}>
                {faseConfig.evitar.map((item, i) => `✗ ${item}`).join('\n')}
              </Text>
            </View>
          </View>
          
          <View style={[styles.rulesCard, styles.rulesTips]}>
            <Text style={[styles.rulesTitle, { color: '#F57F17' }]}>💡 DICAS</Text>
            <Text style={styles.rulesList}>
              {faseConfig.dicas.map((item, i) => `• ${item}`).join('\n')}
            </Text>
          </View>
          
          <PageFooter nome={dados.nome} pagina={9} />
        </View>
      </Page>

      {/* PÁGINA 10 - FINAL */}
      <Page size="A4" style={styles.page}>
        <View style={styles.finalPage}>
          <View style={styles.finalContent}>
            <Logo size={90} />
            <Text style={[styles.brandName, { marginTop: 15, marginBottom: 40 }]}>VITALIS</Text>
            
            <View style={styles.finalQuote}>
              <Text style={styles.finalQuoteMark}>"</Text>
              <Text style={styles.finalQuoteText}>Quando o excesso cai, o corpo responde.</Text>
            </View>
            
            <Text style={styles.finalFor}>Criado Exclusivamente Para</Text>
            <Text style={styles.finalName}>{dados.nome}</Text>
          </View>
          
          <View style={styles.coverFooter}>
            <View>
              <Text style={[styles.footerText, styles.footerBold]}>Vivianne Saraiva</Text>
              <Text style={styles.footerText}>Precision Nutrition Level 1 Coach</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.footerText, styles.footerBold]}>vivianne.saraiva@outlook.com</Text>
              <Text style={styles.footerText}>WhatsApp: +258 84 524 3875</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Componente principal com modal
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
        peso_actual: plano?.peso_actual || plano?.peso_inicial || 70,
        peso_meta: plano?.peso_meta || 60,
        fase: plano?.fase || 'inducao',
        calorias: plano?.calorias_diarias || 1500,
        proteina_g: plano?.proteina_g || 120,
        carboidratos_g: plano?.carboidratos_g || 100,
        gordura_g: plano?.gordura_g || 60,
        porcoes_proteina: plano?.porcoes_proteina || 6,
        porcoes_hidratos: plano?.porcoes_hidratos || 4,
        porcoes_gordura: plano?.porcoes_gordura || 8,
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
          <span style={{color:'white',fontSize:'40px',fontWeight:'bold', fontFamily: 'serif'}}>V</span>
        </div>
        
        <h2 style={{fontSize:'24px',color:'#6B4423',marginBottom:'10px'}}>Plano de {dados.nome}</h2>
        <p style={{color:'#8B4513',marginBottom:'30px'}}>10 páginas • Design profissional</p>
        
        <div style={{display:'flex',gap:'15px',justifyContent:'center'}}>
          <button 
            onClick={onClose}
            style={{padding:'14px 28px',background:'#f5f5f5',color:'#666',border:'none',borderRadius:'10px',fontSize:'15px',cursor:'pointer'}}
          >
            Cancelar
          </button>
          
          <PDFDownloadLink 
            document={<VitalisPDF dados={dados} />} 
            fileName={`Vitalis_Plano_${dados.nome.replace(/\s+/g, '_')}_${dados.fase}.pdf`}
            style={{
              padding:'14px 28px',
              background:'linear-gradient(135deg, #C1634A, #8B4513)',
              color:'white',
              border:'none',
              borderRadius:'10px',
              fontSize:'15px',
              fontWeight:'600',
              cursor:'pointer',
              textDecoration:'none',
              display:'inline-block'
            }}
          >
            {({ loading: pdfLoading }) => pdfLoading ? '⏳ A gerar...' : '📥 Descarregar PDF'}
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  );
}
