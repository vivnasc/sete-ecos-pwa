import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// Fases do ciclo menstrual e recomendações
const FASES_CICLO = {
  menstrual: {
    nome: 'Menstrual',
    dias: '1-5',
    icon: '🌙',
    cor: 'from-rose-600 to-red-700',
    energia: 'Baixa',
    recomendacao: 'Treinos leves, yoga, caminhadas. O corpo está a renovar-se.',
    evitar: 'Treinos intensos, HIIT, levantamento pesado',
    intensidade: 30,
    treinos: ['yoga', 'caminhada', 'alongamentos', 'pilates_leve']
  },
  folicular: {
    nome: 'Folicular',
    dias: '6-14',
    icon: '🌸',
    cor: 'from-emerald-600 to-teal-700',
    energia: 'Crescente',
    recomendacao: 'Energia a aumentar! Ideal para novos desafios e treinos progressivos.',
    evitar: 'Nada específico - fase óptima para treino',
    intensidade: 70,
    treinos: ['forca', 'hiit', 'cardio', 'funcional']
  },
  ovulacao: {
    nome: 'Ovulação',
    dias: '14-17',
    icon: '☀️',
    cor: 'from-amber-500 to-orange-600',
    energia: 'Máxima',
    recomendacao: 'Pico de energia e força! Aproveita para treinos intensos e PRs.',
    evitar: 'Cuidado com lesões - mais flexibilidade pode causar instabilidade',
    intensidade: 100,
    treinos: ['forca_maxima', 'hiit', 'crossfit', 'sprint']
  },
  lutea: {
    nome: 'Lútea',
    dias: '18-28',
    icon: '🍂',
    cor: 'from-stone-600 to-stone-700',
    energia: 'Decrescente',
    recomendacao: 'Foco em treinos moderados e recuperação. Evita frustração com performance.',
    evitar: 'Treinos muito longos, expectativas altas de performance',
    intensidade: 50,
    treinos: ['forca_moderada', 'cardio_leve', 'yoga', 'natacao']
  }
};

// Fases do programa Vitalis
const FASES_PROGRAMA = {
  inducao: {
    nome: 'Indução',
    semanas: '1-2',
    foco: 'Equilíbrio hormonal e ajustes metabólicos',
    treino: 'Evitar treinos intensos. Foco em movimento suave e recuperação.',
    icon: '🌱',
    cor: 'from-[#7C8B6F] to-[#6B7A5F]',
    permitido: ['caminhada', 'yoga', 'alongamentos', 'respiracao'],
    evitar: ['hiit', 'forca_pesada', 'cardio_intenso']
  },
  transicao: {
    nome: 'Transição',
    semanas: '3-4',
    foco: 'Introdução gradual de exercício',
    treino: 'Começar treino de força leve. Cardio moderado.',
    icon: '🌿',
    cor: 'from-[#6B7A5F] to-[#5A694F]',
    permitido: ['forca_leve', 'cardio_moderado', 'funcional', 'pilates'],
    evitar: ['hiit_intenso', 'treinos_longos']
  },
  construcao: {
    nome: 'Construção',
    semanas: '5-8',
    foco: 'Construção muscular e condicionamento',
    treino: 'Treino de força recomendado! 3-4x por semana ideal.',
    icon: '💪',
    cor: 'from-[#4A4035] to-[#3A3025]',
    permitido: ['forca', 'hiit', 'cardio', 'funcional', 'crossfit'],
    evitar: []
  },
  manutencao: {
    nome: 'Manutenção',
    semanas: '9+',
    foco: 'Manter ganhos e optimizar composição corporal',
    treino: 'Liberdade total! Segue os teus objectivos.',
    icon: '⭐',
    cor: 'from-[#C9A227] to-[#A8891F]',
    permitido: ['todos'],
    evitar: []
  }
};

// Biblioteca de exercícios COMPLETA com demonstrações
const EXERCICIOS = {
  // ============ FORÇA - MEMBROS INFERIORES ============
  agachamento_livre: {
    nome: 'Agachamento Livre',
    nome_en: 'Bodyweight Squat',
    tipo: 'forca',
    grupo: 'Membros Inferiores',
    local: 'casa',
    musculos: ['Quadríceps', 'Glúteos', 'Core', 'Isquiotibiais'],
    musculo_principal: 'Quadríceps',
    calorias_min: 6,
    dificuldade: 'Iniciante',
    equipamento: 'Nenhum',
    series: 4,
    repeticoes: '15-20',
    descanso: '45-60s',
    tempo_execucao: '3-0-1',
    instrucoes: [
      'Pés à largura dos ombros, pontas ligeiramente viradas para fora',
      'Mantém o peito erguido e core activado',
      'Desce como se fosses sentar numa cadeira',
      'Joelhos seguem a direcção dos pés (não colapsam para dentro)',
      'Desce até as coxas ficarem paralelas ao chão',
      'Empurra através dos calcanhares para subir'
    ],
    erros_comuns: [
      'Joelhos a colapsar para dentro',
      'Inclinar o tronco demasiado à frente',
      'Não descer o suficiente',
      'Levantar os calcanhares'
    ],
    video: 'https://www.youtube.com/results?search_query=bodyweight+squat+form+women',
    icon: '🦵',
    beneficios: 'Fortalece toda a cadeia posterior, melhora mobilidade do tornozelo e anca'
  },
  agachamento_sumo: {
    nome: 'Agachamento Sumo',
    nome_en: 'Sumo Squat',
    tipo: 'forca',
    grupo: 'Membros Inferiores',
    local: 'casa',
    musculos: ['Glúteos', 'Adutores', 'Quadríceps', 'Core'],
    musculo_principal: 'Glúteos & Adutores',
    calorias_min: 7,
    dificuldade: 'Iniciante',
    equipamento: 'Nenhum (opcional: haltere)',
    series: 4,
    repeticoes: '12-15',
    descanso: '45-60s',
    tempo_execucao: '3-1-1',
    instrucoes: [
      'Pés bem afastados (1.5x largura dos ombros)',
      'Pontas dos pés viradas para fora a 45°',
      'Mantém o tronco vertical',
      'Desce até as coxas ficarem paralelas',
      'Aperta os glúteos no topo do movimento'
    ],
    erros_comuns: [
      'Pés não suficientemente afastados',
      'Inclinar o tronco à frente',
      'Joelhos a colapsar'
    ],
    video: 'https://www.youtube.com/results?search_query=sumo+squat+form+women',
    icon: '🏋️‍♀️',
    beneficios: 'Maior activação dos glúteos e adutores que o agachamento tradicional'
  },
  agachamento_bulgaro: {
    nome: 'Agachamento Búlgaro',
    nome_en: 'Bulgarian Split Squat',
    tipo: 'forca',
    grupo: 'Membros Inferiores',
    local: 'ambos',
    musculos: ['Quadríceps', 'Glúteos', 'Core', 'Equilíbrio'],
    musculo_principal: 'Quadríceps & Glúteos',
    calorias_min: 8,
    dificuldade: 'Intermédio',
    equipamento: 'Banco ou cadeira',
    series: 3,
    repeticoes: '10-12 cada perna',
    descanso: '60s',
    tempo_execucao: '3-0-1',
    instrucoes: [
      'Coloca o pé de trás num banco ou cadeira',
      'Pé da frente avançado (cerca de 60cm do banco)',
      'Desce verticalmente até o joelho quase tocar o chão',
      'Mantém o tronco erecto',
      'Empurra através do calcanhar da frente'
    ],
    erros_comuns: [
      'Pé da frente demasiado perto do banco',
      'Inclinar excessivamente à frente',
      'Joelho a passar muito à frente do pé'
    ],
    video: 'https://www.youtube.com/results?search_query=bulgarian+split+squat+women',
    icon: '🦿',
    beneficios: 'Excelente para corrigir desequilíbrios entre pernas, grande activação glútea'
  },
  lunges: {
    nome: 'Afundos/Lunges',
    nome_en: 'Lunges',
    tipo: 'forca',
    grupo: 'Membros Inferiores',
    local: 'casa',
    musculos: ['Quadríceps', 'Glúteos', 'Isquiotibiais', 'Core'],
    musculo_principal: 'Quadríceps & Glúteos',
    calorias_min: 7,
    dificuldade: 'Iniciante',
    equipamento: 'Nenhum',
    series: 3,
    repeticoes: '12 cada perna',
    descanso: '45s',
    tempo_execucao: '2-0-1',
    instrucoes: [
      'Em pé, pés à largura da anca',
      'Dá um passo largo à frente',
      'Desce até ambos os joelhos a 90°',
      'Joelho de trás quase toca o chão',
      'Empurra de volta à posição inicial'
    ],
    erros_comuns: [
      'Passo demasiado curto',
      'Joelho da frente a passar do pé',
      'Perder o equilíbrio'
    ],
    video: 'https://www.youtube.com/results?search_query=lunges+proper+form+women',
    icon: '🚶‍♀️',
    beneficios: 'Melhora equilíbrio, força unilateral e mobilidade da anca'
  },
  ponte_gluteos: {
    nome: 'Ponte de Glúteos',
    nome_en: 'Glute Bridge',
    tipo: 'forca',
    grupo: 'Membros Inferiores',
    local: 'casa',
    musculos: ['Glúteos', 'Isquiotibiais', 'Core', 'Lombar'],
    musculo_principal: 'Glúteos',
    calorias_min: 5,
    dificuldade: 'Iniciante',
    equipamento: 'Tapete',
    series: 4,
    repeticoes: '15-20',
    descanso: '30-45s',
    tempo_execucao: '2-2-1',
    instrucoes: [
      'Deitada de costas, joelhos dobrados, pés no chão',
      'Pés à largura da anca, calcanhares perto dos glúteos',
      'Contrai os glúteos e eleva a anca',
      'Cria uma linha recta dos ombros aos joelhos',
      'Mantém 2s no topo, aperta os glúteos',
      'Desce controladamente'
    ],
    erros_comuns: [
      'Hiperextender a lombar',
      'Não apertar os glúteos no topo',
      'Subir através dos isquiotibiais'
    ],
    video: 'https://www.youtube.com/results?search_query=glute+bridge+form+women',
    icon: '🌉',
    beneficios: 'Activa os glúteos, alivia dor lombar, melhora postura'
  },
  hip_thrust: {
    nome: 'Hip Thrust',
    nome_en: 'Hip Thrust',
    tipo: 'forca',
    grupo: 'Membros Inferiores',
    local: 'ambos',
    musculos: ['Glúteos', 'Isquiotibiais', 'Core'],
    musculo_principal: 'Glúteos',
    calorias_min: 8,
    dificuldade: 'Intermédio',
    equipamento: 'Banco + Barra/Haltere',
    series: 4,
    repeticoes: '10-12',
    descanso: '60-90s',
    tempo_execucao: '2-1-1',
    instrucoes: [
      'Costas apoiadas no banco (ao nível das omoplatas)',
      'Barra ou haltere sobre a anca (usar pad)',
      'Pés à largura da anca, ligeiramente à frente dos joelhos',
      'Empurra através dos calcanhares elevando a anca',
      'No topo: linha recta dos ombros aos joelhos',
      'Contrai os glúteos 1-2s no topo'
    ],
    erros_comuns: [
      'Hiperextender a lombar',
      'Pés demasiado perto ou longe',
      'Não usar pad na barra'
    ],
    video: 'https://www.youtube.com/results?search_query=hip+thrust+form+bret+contreras',
    icon: '🍑',
    beneficios: 'O exercício #1 para desenvolvimento dos glúteos segundo estudos EMG'
  },
  leg_press: {
    nome: 'Leg Press',
    nome_en: 'Leg Press',
    tipo: 'forca',
    grupo: 'Membros Inferiores',
    local: 'ginasio',
    musculos: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
    musculo_principal: 'Quadríceps',
    calorias_min: 9,
    dificuldade: 'Iniciante',
    equipamento: 'Máquina Leg Press',
    series: 4,
    repeticoes: '12-15',
    descanso: '60-90s',
    tempo_execucao: '3-0-1',
    instrucoes: [
      'Costas e lombar bem apoiadas no encosto',
      'Pés à largura dos ombros na plataforma',
      'Posição dos pés: mais alto = mais glúteos, mais baixo = mais quadríceps',
      'Desce até 90° nos joelhos',
      'Empurra sem bloquear completamente os joelhos'
    ],
    erros_comuns: [
      'Lombar a descolar do banco',
      'Bloquear os joelhos no topo',
      'Amplitude de movimento insuficiente'
    ],
    video: 'https://www.youtube.com/results?search_query=leg+press+form+women',
    icon: '🦿',
    beneficios: 'Permite cargas pesadas com menor stress na coluna'
  },
  deadlift_romeno: {
    nome: 'Peso Morto Romeno',
    nome_en: 'Romanian Deadlift',
    tipo: 'forca',
    grupo: 'Membros Inferiores',
    local: 'ambos',
    musculos: ['Isquiotibiais', 'Glúteos', 'Lombar', 'Core'],
    musculo_principal: 'Isquiotibiais & Glúteos',
    calorias_min: 10,
    dificuldade: 'Intermédio',
    equipamento: 'Barra ou Halteres',
    series: 4,
    repeticoes: '10-12',
    descanso: '60-90s',
    tempo_execucao: '3-0-1',
    instrucoes: [
      'Em pé, barra ou halteres à frente das coxas',
      'Pés à largura da anca, joelhos ligeiramente flectidos',
      'Mantém as costas neutras durante todo o movimento',
      'Empurra a anca para trás (hip hinge)',
      'Desce a barra junto às pernas até sentir alongamento nos isquios',
      'Volta apertando os glúteos'
    ],
    erros_comuns: [
      'Arredondar as costas',
      'Dobrar demasiado os joelhos (não é agachamento)',
      'Barra longe do corpo'
    ],
    video: 'https://www.youtube.com/results?search_query=romanian+deadlift+form+women',
    icon: '⬆️',
    beneficios: 'Desenvolve toda a cadeia posterior, essencial para prevenção de lesões'
  },
  // ============ FORÇA - MEMBROS SUPERIORES ============
  flexoes: {
    nome: 'Flexões',
    nome_en: 'Push-ups',
    tipo: 'forca',
    grupo: 'Membros Superiores',
    local: 'casa',
    musculos: ['Peito', 'Tríceps', 'Ombros', 'Core'],
    musculo_principal: 'Peito & Tríceps',
    calorias_min: 7,
    dificuldade: 'Iniciante-Intermédio',
    equipamento: 'Nenhum',
    series: 3,
    repeticoes: '8-15',
    descanso: '45-60s',
    tempo_execucao: '2-0-1',
    instrucoes: [
      'Mãos à largura dos ombros ou ligeiramente mais afastadas',
      'Corpo em linha recta da cabeça aos calcanhares',
      'Core activado, glúteos contraídos',
      'Desce até o peito quase tocar o chão',
      'Cotovelos a 45° do corpo (não 90°)',
      'Empurra de volta até extensão completa'
    ],
    erros_comuns: [
      'Anca a cair ou subir (corpo não alinhado)',
      'Cotovelos demasiado abertos',
      'Amplitude incompleta'
    ],
    variantes: [
      'Joelhos apoiados (mais fácil)',
      'Inclinadas em banco (mais fácil)',
      'Declinadas (mais difícil)',
      'Diamante (mais tríceps)'
    ],
    video: 'https://www.youtube.com/results?search_query=push+ups+for+women+beginners',
    icon: '💪',
    beneficios: 'Exercício completo para tronco superior, não requer equipamento'
  },
  flexoes_joelhos: {
    nome: 'Flexões de Joelhos',
    nome_en: 'Knee Push-ups',
    tipo: 'forca',
    grupo: 'Membros Superiores',
    local: 'casa',
    musculos: ['Peito', 'Tríceps', 'Ombros'],
    musculo_principal: 'Peito & Tríceps',
    calorias_min: 5,
    dificuldade: 'Iniciante',
    equipamento: 'Tapete',
    series: 3,
    repeticoes: '12-15',
    descanso: '45s',
    tempo_execucao: '2-0-1',
    instrucoes: [
      'Apoio nos joelhos em vez dos pés',
      'Cruza os pés atrás',
      'Mãos à largura dos ombros',
      'Mantém linha recta dos joelhos à cabeça',
      'Desce controladamente'
    ],
    erros_comuns: [
      'Anca muito alta',
      'Não descer o suficiente'
    ],
    video: 'https://www.youtube.com/results?search_query=knee+push+ups+form',
    icon: '💪',
    beneficios: 'Progressão perfeita para flexões completas'
  },
  triceps_banco: {
    nome: 'Triceps no Banco',
    nome_en: 'Bench Dips',
    tipo: 'forca',
    grupo: 'Membros Superiores',
    local: 'casa',
    musculos: ['Tríceps', 'Ombros', 'Peito'],
    musculo_principal: 'Tríceps',
    calorias_min: 6,
    dificuldade: 'Iniciante',
    equipamento: 'Cadeira ou banco',
    series: 3,
    repeticoes: '12-15',
    descanso: '45s',
    tempo_execucao: '2-0-1',
    instrucoes: [
      'Mãos no banco atrás de ti, dedos para a frente',
      'Pernas esticadas ou dobradas (mais fácil)',
      'Desce dobrando os cotovelos até 90°',
      'Cotovelos apontam para trás, não para os lados',
      'Empurra de volta à posição inicial'
    ],
    erros_comuns: [
      'Cotovelos a abrir para os lados',
      'Descer demasiado (stress no ombro)'
    ],
    video: 'https://www.youtube.com/results?search_query=bench+dips+form+women',
    icon: '💺',
    beneficios: 'Isola os tríceps eficazmente sem equipamento'
  },
  remada_haltere: {
    nome: 'Remada com Haltere',
    nome_en: 'Dumbbell Row',
    tipo: 'forca',
    grupo: 'Membros Superiores',
    local: 'ambos',
    musculos: ['Costas', 'Bíceps', 'Core', 'Ombro posterior'],
    musculo_principal: 'Grande Dorsal',
    calorias_min: 7,
    dificuldade: 'Iniciante',
    equipamento: 'Haltere + Banco',
    series: 3,
    repeticoes: '10-12 cada lado',
    descanso: '45s',
    tempo_execucao: '2-1-1',
    instrucoes: [
      'Joelho e mão de apoio no banco',
      'Costas paralelas ao chão',
      'Puxa o haltere em direcção à anca',
      'Cotovelo junto ao corpo',
      'Aperta as costas no topo',
      'Desce controladamente'
    ],
    erros_comuns: [
      'Rodar o tronco',
      'Usar impulso do corpo',
      'Não subir o suficiente'
    ],
    video: 'https://www.youtube.com/results?search_query=dumbbell+row+form+women',
    icon: '🏋️',
    beneficios: 'Desenvolve costas fortes, melhora postura'
  },
  lat_pulldown: {
    nome: 'Puxada à Frente',
    nome_en: 'Lat Pulldown',
    tipo: 'forca',
    grupo: 'Membros Superiores',
    local: 'ginasio',
    musculos: ['Grande Dorsal', 'Bíceps', 'Romboides', 'Trapézio'],
    musculo_principal: 'Grande Dorsal',
    calorias_min: 6,
    dificuldade: 'Iniciante',
    equipamento: 'Máquina Pulldown',
    series: 4,
    repeticoes: '10-12',
    descanso: '60s',
    tempo_execucao: '2-1-2',
    instrucoes: [
      'Sentada, coxas bem fixas sob o apoio',
      'Agarra a barra mais larga que os ombros',
      'Puxa em direcção ao peito (não atrás da cabeça)',
      'Peito para cima, omoplatas para trás e baixo',
      'Controla o regresso (não deixa a barra puxar-te)'
    ],
    erros_comuns: [
      'Puxar atrás do pescoço',
      'Inclinar demasiado para trás',
      'Usar impulso'
    ],
    video: 'https://www.youtube.com/results?search_query=lat+pulldown+form+women',
    icon: '🔽',
    beneficios: 'Desenvolve as costas em "V", melhora capacidade de fazer elevações'
  },
  shoulder_press: {
    nome: 'Press de Ombros',
    nome_en: 'Shoulder Press',
    tipo: 'forca',
    grupo: 'Membros Superiores',
    local: 'ambos',
    musculos: ['Deltóides', 'Tríceps', 'Trapézio'],
    musculo_principal: 'Deltóides',
    calorias_min: 6,
    dificuldade: 'Iniciante',
    equipamento: 'Halteres',
    series: 3,
    repeticoes: '10-12',
    descanso: '60s',
    tempo_execucao: '2-0-1',
    instrucoes: [
      'Sentada ou em pé, core activado',
      'Halteres ao nível dos ombros, palmas para a frente',
      'Empurra para cima até extensão quase completa',
      'Não bloqueia completamente os cotovelos',
      'Desce controladamente até aos ombros'
    ],
    erros_comuns: [
      'Arquear as costas',
      'Usar impulso das pernas',
      'Cotovelos demasiado atrás'
    ],
    video: 'https://www.youtube.com/results?search_query=shoulder+press+dumbbells+women',
    icon: '🙆‍♀️',
    beneficios: 'Ombros fortes e definidos, melhora postura'
  },
  // ============ CORE ============
  prancha: {
    nome: 'Prancha',
    nome_en: 'Plank',
    tipo: 'forca',
    grupo: 'Core',
    local: 'casa',
    musculos: ['Core', 'Recto Abdominal', 'Oblíquos', 'Lombar', 'Ombros'],
    musculo_principal: 'Core Completo',
    calorias_min: 4,
    dificuldade: 'Iniciante',
    equipamento: 'Tapete',
    series: 3,
    repeticoes: '30-60 segundos',
    descanso: '30s',
    tempo_execucao: 'Isométrico',
    instrucoes: [
      'Antebraços no chão, cotovelos sob os ombros',
      'Corpo em linha recta da cabeça aos calcanhares',
      'Contrai abdominais como se fosse levar um murro',
      'Glúteos contraídos, não deixes a anca subir ou descer',
      'Olha para o chão (pescoço neutro)',
      'Respira normalmente'
    ],
    erros_comuns: [
      'Anca demasiado alta',
      'Anca a cair',
      'Prender a respiração',
      'Olhar para a frente (stressa o pescoço)'
    ],
    variantes: [
      'Prancha de mãos (mais fácil)',
      'Prancha lateral',
      'Prancha com elevação de perna',
      'Prancha com toque no ombro'
    ],
    video: 'https://www.youtube.com/results?search_query=plank+form+women',
    icon: '📏',
    beneficios: 'Fortalece todo o core, melhora postura e estabilidade'
  },
  crunch: {
    nome: 'Crunch Abdominal',
    nome_en: 'Crunch',
    tipo: 'forca',
    grupo: 'Core',
    local: 'casa',
    musculos: ['Recto Abdominal'],
    musculo_principal: 'Abdominais',
    calorias_min: 5,
    dificuldade: 'Iniciante',
    equipamento: 'Tapete',
    series: 3,
    repeticoes: '15-20',
    descanso: '30s',
    tempo_execucao: '2-1-1',
    instrucoes: [
      'Deitada, joelhos dobrados, pés no chão',
      'Mãos atrás da cabeça (não puxes o pescoço)',
      'Eleva os ombros do chão contraindo os abdominais',
      'Imagina aproximar as costelas da anca',
      'Desce controladamente'
    ],
    erros_comuns: [
      'Puxar o pescoço',
      'Usar impulso',
      'Subir demasiado'
    ],
    video: 'https://www.youtube.com/results?search_query=crunch+proper+form',
    icon: '🔄',
    beneficios: 'Isola os abdominais superiores'
  },
  russian_twist: {
    nome: 'Russian Twist',
    nome_en: 'Russian Twist',
    tipo: 'forca',
    grupo: 'Core',
    local: 'casa',
    musculos: ['Oblíquos', 'Recto Abdominal', 'Core'],
    musculo_principal: 'Oblíquos',
    calorias_min: 6,
    dificuldade: 'Intermédio',
    equipamento: 'Opcional: peso',
    series: 3,
    repeticoes: '20 (10 cada lado)',
    descanso: '30s',
    tempo_execucao: 'Controlado',
    instrucoes: [
      'Sentada, joelhos dobrados, pés elevados ou no chão',
      'Inclina o tronco ligeiramente para trás',
      'Mãos juntas ou a segurar peso',
      'Roda o tronco de um lado para o outro',
      'Mantém a anca estável'
    ],
    erros_comuns: [
      'Rodar só os braços (não o tronco)',
      'Perder a postura',
      'Movimento demasiado rápido'
    ],
    video: 'https://www.youtube.com/results?search_query=russian+twist+form',
    icon: '🌀',
    beneficios: 'Trabalha os oblíquos e rotação do tronco'
  },
  dead_bug: {
    nome: 'Dead Bug',
    nome_en: 'Dead Bug',
    tipo: 'forca',
    grupo: 'Core',
    local: 'casa',
    musculos: ['Core', 'Estabilizadores', 'Lombar'],
    musculo_principal: 'Core Profundo',
    calorias_min: 4,
    dificuldade: 'Iniciante',
    equipamento: 'Tapete',
    series: 3,
    repeticoes: '10 cada lado',
    descanso: '30s',
    tempo_execucao: '3-0-3',
    instrucoes: [
      'Deitada de costas, braços estendidos ao tecto',
      'Joelhos a 90°, pernas elevadas',
      'Lombar pressionada contra o chão',
      'Estende braço e perna opostos simultaneamente',
      'Volta ao centro e alterna',
      'Mantém a lombar sempre em contacto com o chão'
    ],
    erros_comuns: [
      'Lombar a arquear',
      'Movimento demasiado rápido',
      'Prender a respiração'
    ],
    video: 'https://www.youtube.com/results?search_query=dead+bug+exercise+form',
    icon: '🐛',
    beneficios: 'Excelente para activar core profundo e prevenir dor lombar'
  },
  superman: {
    nome: 'Superman',
    nome_en: 'Superman',
    tipo: 'forca',
    grupo: 'Core',
    local: 'casa',
    musculos: ['Lombar', 'Glúteos', 'Ombros', 'Eretores'],
    musculo_principal: 'Cadeia Posterior',
    calorias_min: 4,
    dificuldade: 'Iniciante',
    equipamento: 'Tapete',
    series: 3,
    repeticoes: '12-15',
    descanso: '30s',
    tempo_execucao: '2-2-2',
    instrucoes: [
      'Deitada de barriga para baixo, braços estendidos à frente',
      'Eleva simultaneamente braços e pernas do chão',
      'Mantém 2 segundos no topo',
      'Desce controladamente',
      'Olha para o chão (pescoço neutro)'
    ],
    erros_comuns: [
      'Hiperextender o pescoço',
      'Movimento brusco',
      'Não manter a contracção'
    ],
    video: 'https://www.youtube.com/results?search_query=superman+exercise+form',
    icon: '🦸‍♀️',
    beneficios: 'Fortalece toda a cadeia posterior, combate dor lombar'
  },
  // ============ CARDIO ============
  caminhada: {
    nome: 'Caminhada',
    nome_en: 'Walking',
    tipo: 'cardio',
    grupo: 'Cardio',
    local: 'ambos',
    musculos: ['Sistema Cardiovascular', 'Pernas', 'Core'],
    musculo_principal: 'Cardiovascular',
    calorias_min: 4,
    dificuldade: 'Iniciante',
    equipamento: 'Nenhum',
    series: 1,
    repeticoes: '30-60 minutos',
    descanso: 'N/A',
    fc_alvo: '50-60% FC máx',
    instrucoes: [
      'Ritmo moderado mas consistente',
      'Postura erecta, ombros relaxados',
      'Balanço natural dos braços',
      'Objectivo: 5000-10000 passos diários',
      'Ideal após refeições para controlo glicémico'
    ],
    video: 'https://www.youtube.com/results?search_query=power+walking+benefits',
    icon: '🚶‍♀️',
    intensidade: 'Leve',
    beneficios: 'Baixo impacto, sustentável, excelente para recuperação activa e saúde mental'
  },
  corrida: {
    nome: 'Corrida',
    nome_en: 'Running',
    tipo: 'cardio',
    grupo: 'Cardio',
    local: 'ambos',
    musculos: ['Sistema Cardiovascular', 'Pernas', 'Core', 'Glúteos'],
    musculo_principal: 'Cardiovascular',
    calorias_min: 10,
    dificuldade: 'Iniciante-Intermédio',
    equipamento: 'Sapatilhas de corrida',
    series: 1,
    repeticoes: '20-45 minutos',
    descanso: 'N/A',
    fc_alvo: '60-75% FC máx',
    instrucoes: [
      'Começar devagar (conseguir conversar)',
      'Cadência de 170-180 passos/minuto',
      'Aterrar com o médio-pé, não o calcanhar',
      'Postura erecta, ligeira inclinação à frente',
      'Respiração ritmada: 3 passos inspira, 2 expira'
    ],
    video: 'https://www.youtube.com/results?search_query=running+form+beginners',
    icon: '🏃‍♀️',
    intensidade: 'Moderada',
    beneficios: 'Excelente para queima calórica e saúde cardiovascular'
  },
  hiit: {
    nome: 'HIIT',
    nome_en: 'High Intensity Interval Training',
    tipo: 'cardio',
    grupo: 'Cardio',
    local: 'ambos',
    musculos: ['Corpo Inteiro', 'Sistema Cardiovascular', 'Metabolismo'],
    musculo_principal: 'Cardiovascular + Metabólico',
    calorias_min: 12,
    dificuldade: 'Intermédio-Avançado',
    equipamento: 'Nenhum',
    series: 1,
    repeticoes: '15-25 minutos',
    descanso: 'Alternado',
    fc_alvo: '80-95% FC máx',
    instrucoes: [
      'Aquecimento: 3-5 minutos',
      'Trabalho intenso: 20-40 segundos (máximo esforço)',
      'Descanso activo: 20-40 segundos',
      'Repetir 8-12 rondas',
      'Arrefecimento: 3-5 minutos'
    ],
    exemplo_circuito: [
      'Burpees - 30s',
      'Descanso - 30s',
      'Mountain Climbers - 30s',
      'Descanso - 30s',
      'Jump Squats - 30s',
      'Descanso - 30s',
      'High Knees - 30s',
      'Descanso - 30s',
      '(Repetir 3-4x)'
    ],
    video: 'https://www.youtube.com/results?search_query=hiit+workout+women+20+minutes',
    icon: '🔥',
    intensidade: 'Alta',
    beneficios: 'Queima calórica elevada, efeito afterburn (EPOC), eficiente em tempo'
  },
  bicicleta: {
    nome: 'Bicicleta',
    nome_en: 'Cycling',
    tipo: 'cardio',
    grupo: 'Cardio',
    local: 'ginasio',
    musculos: ['Quadríceps', 'Glúteos', 'Sistema Cardiovascular'],
    musculo_principal: 'Quadríceps + Cardio',
    calorias_min: 8,
    dificuldade: 'Iniciante',
    equipamento: 'Bicicleta estática',
    series: 1,
    repeticoes: '30-45 minutos',
    descanso: 'N/A',
    fc_alvo: '60-75% FC máx',
    instrucoes: [
      'Ajustar altura do selim (perna quase esticada em baixo)',
      'Cadência: 60-90 RPM',
      'Resistência moderada (deve sentir trabalho)',
      'Postura: costas neutras, não arqueadas',
      'Variar intensidade para mais resultados'
    ],
    video: 'https://www.youtube.com/results?search_query=stationary+bike+workout+beginners',
    icon: '🚴‍♀️',
    intensidade: 'Moderada',
    beneficios: 'Baixo impacto nas articulações, bom para iniciantes'
  },
  eliptica: {
    nome: 'Elíptica',
    nome_en: 'Elliptical',
    tipo: 'cardio',
    grupo: 'Cardio',
    local: 'ginasio',
    musculos: ['Corpo Inteiro', 'Sistema Cardiovascular'],
    musculo_principal: 'Cardiovascular',
    calorias_min: 9,
    dificuldade: 'Iniciante',
    equipamento: 'Máquina elíptica',
    series: 1,
    repeticoes: '30-45 minutos',
    descanso: 'N/A',
    fc_alvo: '60-75% FC máx',
    instrucoes: [
      'Postura erecta, core activado',
      'Usar os braços activamente',
      'Variar inclinação e resistência',
      'Manter cadência estável',
      'Experimentar pedalar para trás (mais glúteos)'
    ],
    video: 'https://www.youtube.com/results?search_query=elliptical+workout+women',
    icon: '🎿',
    intensidade: 'Moderada',
    beneficios: 'Zero impacto, trabalha corpo superior e inferior'
  },
  natacao: {
    nome: 'Natação',
    nome_en: 'Swimming',
    tipo: 'cardio',
    grupo: 'Cardio',
    local: 'ginasio',
    musculos: ['Corpo Inteiro', 'Sistema Cardiovascular', 'Core'],
    musculo_principal: 'Corpo Inteiro',
    calorias_min: 11,
    dificuldade: 'Iniciante-Intermédio',
    equipamento: 'Piscina',
    series: 1,
    repeticoes: '30-45 minutos',
    descanso: 'Entre séries se necessário',
    fc_alvo: '60-75% FC máx',
    instrucoes: [
      'Variar estilos (crawl, costas, bruços)',
      'Começar com intervalos: 50m + descanso',
      'Progredir para nado contínuo',
      'Respiração bilateral no crawl'
    ],
    video: 'https://www.youtube.com/results?search_query=swimming+workout+beginners',
    icon: '🏊‍♀️',
    intensidade: 'Moderada',
    beneficios: 'Ideal durante ciclo menstrual, zero impacto, trabalha todo o corpo'
  },
  saltar_corda: {
    nome: 'Saltar à Corda',
    nome_en: 'Jump Rope',
    tipo: 'cardio',
    grupo: 'Cardio',
    local: 'casa',
    musculos: ['Gémeos', 'Quadríceps', 'Core', 'Ombros', 'Cardiovascular'],
    musculo_principal: 'Cardiovascular + Pernas',
    calorias_min: 13,
    dificuldade: 'Intermédio',
    equipamento: 'Corda de saltar',
    series: 1,
    repeticoes: '10-20 minutos (intervalos)',
    descanso: '30s entre séries',
    fc_alvo: '75-85% FC máx',
    instrucoes: [
      'Corda ao comprimento certo (pegas ao peito quando pisas o meio)',
      'Saltos pequenos, só o suficiente para a corda passar',
      'Aterra na parte da frente dos pés',
      'Cotovelos junto ao corpo, rodar com os pulsos',
      'Começar: 30s saltar, 30s descanso'
    ],
    video: 'https://www.youtube.com/results?search_query=jump+rope+beginners+women',
    icon: '⏫',
    intensidade: 'Alta',
    beneficios: 'Queima calórica elevada, melhora coordenação, portátil'
  },
  // ============ FLEXIBILIDADE ============
  yoga: {
    nome: 'Yoga',
    nome_en: 'Yoga',
    tipo: 'flexibilidade',
    grupo: 'Flexibilidade',
    local: 'casa',
    musculos: ['Flexibilidade', 'Core', 'Equilíbrio', 'Mente'],
    musculo_principal: 'Flexibilidade Global',
    calorias_min: 3,
    dificuldade: 'Iniciante-Avançado',
    equipamento: 'Tapete yoga',
    series: 1,
    repeticoes: '30-60 minutos',
    descanso: 'Contínuo',
    instrucoes: [
      'Estilos recomendados: Hatha (iniciante), Vinyasa (intermédio)',
      'Foco na respiração (ujjayi)',
      'Nunca forçar - respeitar limites',
      'Ideal de manhã ou antes de dormir'
    ],
    video: 'https://www.youtube.com/results?search_query=yoga+for+women+beginners+30+min',
    icon: '🧘‍♀️',
    intensidade: 'Leve-Moderada',
    beneficios: 'Reduz stress, melhora flexibilidade, excelente para fase menstrual'
  },
  pilates: {
    nome: 'Pilates',
    nome_en: 'Pilates',
    tipo: 'flexibilidade',
    grupo: 'Flexibilidade',
    local: 'ambos',
    musculos: ['Core', 'Postura', 'Flexibilidade', 'Estabilizadores'],
    musculo_principal: 'Core Profundo',
    calorias_min: 4,
    dificuldade: 'Iniciante-Intermédio',
    equipamento: 'Tapete (mat pilates)',
    series: 1,
    repeticoes: '45-60 minutos',
    descanso: 'Contínuo',
    instrucoes: [
      'Foco nos princípios: controlo, centro, concentração, precisão',
      'Respiração lateral (costelas expandem)',
      'Movimentos lentos e controlados',
      'Powerhouse sempre activado'
    ],
    video: 'https://www.youtube.com/results?search_query=pilates+workout+women+beginners',
    icon: '🤸‍♀️',
    intensidade: 'Leve-Moderada',
    beneficios: 'Fortalece core profundo, melhora postura, ideal pós-parto'
  },
  alongamentos: {
    nome: 'Alongamentos',
    nome_en: 'Stretching',
    tipo: 'flexibilidade',
    grupo: 'Flexibilidade',
    local: 'casa',
    musculos: ['Flexibilidade', 'Recuperação'],
    musculo_principal: 'Flexibilidade Global',
    calorias_min: 2,
    dificuldade: 'Iniciante',
    equipamento: 'Tapete',
    series: 1,
    repeticoes: '15-20 minutos',
    descanso: 'N/A',
    instrucoes: [
      'Mantém cada posição 30-60 segundos',
      'Nunca fazer bounce (alongamento balístico)',
      'Respirar profundamente em cada posição',
      'Alongar todos os grupos principais',
      'Ideal após treino ou antes de dormir'
    ],
    video: 'https://www.youtube.com/results?search_query=full+body+stretch+routine+women',
    icon: '🙆‍♀️',
    intensidade: 'Leve',
    beneficios: 'Recuperação muscular, previne lesões, melhora mobilidade'
  }
};

// Planos de treino por objectivo - EXPANDIDOS
const PLANOS_TREINO = {
  perda_gordura: {
    nome: 'Perda de Gordura',
    descricao: 'Foco em queima calórica com preservação muscular',
    icon: '🔥',
    cor: 'from-orange-600 to-red-700',
    dias: 4,
    duracao_media: 45,
    calorias_sessao: '300-400',
    estrutura: [
      {
        dia: 'Segunda',
        tipo: 'Força - Membros Inferiores',
        duracao: 45,
        exercicios: ['agachamento_livre', 'lunges', 'ponte_gluteos', 'agachamento_sumo', 'deadlift_romeno', 'prancha'],
        calorias: 320
      },
      {
        dia: 'Terça',
        tipo: 'Cardio HIIT',
        duracao: 25,
        exercicios: ['hiit'],
        calorias: 300
      },
      {
        dia: 'Quarta',
        tipo: 'Força - Membros Superiores + Core',
        duracao: 40,
        exercicios: ['flexoes', 'remada_haltere', 'shoulder_press', 'triceps_banco', 'russian_twist', 'dead_bug'],
        calorias: 280
      },
      {
        dia: 'Quinta',
        tipo: 'Recuperação Activa',
        duracao: 30,
        exercicios: ['caminhada', 'alongamentos'],
        calorias: 150
      },
      {
        dia: 'Sexta',
        tipo: 'Full Body + Cardio',
        duracao: 50,
        exercicios: ['agachamento_bulgaro', 'hip_thrust', 'flexoes_joelhos', 'superman', 'corrida'],
        calorias: 380
      },
      {
        dia: 'Sábado',
        tipo: 'Yoga ou Caminhada',
        duracao: 45,
        exercicios: ['yoga', 'caminhada'],
        calorias: 180
      },
      {
        dia: 'Domingo',
        tipo: 'Descanso Total',
        duracao: 0,
        exercicios: [],
        calorias: 0
      }
    ],
    dicas: [
      'Défice calórico moderado (300-500 kcal)',
      'Proteína alta (1.6-2g/kg) para preservar músculo',
      'HIIT limitar a 2-3x/semana',
      'Priorizar sono e recuperação'
    ]
  },
  ganho_muscular: {
    nome: 'Ganho Muscular',
    descricao: 'Foco em hipertrofia e força progressiva',
    icon: '💪',
    cor: 'from-[#4A4035] to-[#2A2015]',
    dias: 5,
    duracao_media: 50,
    calorias_sessao: '250-350',
    estrutura: [
      {
        dia: 'Segunda',
        tipo: 'Glúteos & Posteriores',
        duracao: 50,
        exercicios: ['hip_thrust', 'deadlift_romeno', 'ponte_gluteos', 'agachamento_sumo', 'lunges', 'superman'],
        calorias: 320
      },
      {
        dia: 'Terça',
        tipo: 'Costas & Bíceps',
        duracao: 45,
        exercicios: ['lat_pulldown', 'remada_haltere', 'deadlift_romeno', 'prancha'],
        calorias: 280
      },
      {
        dia: 'Quarta',
        tipo: 'Recuperação Activa',
        duracao: 30,
        exercicios: ['caminhada', 'alongamentos', 'yoga'],
        calorias: 120
      },
      {
        dia: 'Quinta',
        tipo: 'Peito, Ombros & Tríceps',
        duracao: 45,
        exercicios: ['flexoes', 'shoulder_press', 'triceps_banco', 'flexoes_joelhos', 'prancha'],
        calorias: 260
      },
      {
        dia: 'Sexta',
        tipo: 'Pernas Completo',
        duracao: 55,
        exercicios: ['agachamento_livre', 'leg_press', 'agachamento_bulgaro', 'ponte_gluteos', 'deadlift_romeno', 'crunch'],
        calorias: 350
      },
      {
        dia: 'Sábado',
        tipo: 'Cardio Leve + Core',
        duracao: 40,
        exercicios: ['caminhada', 'prancha', 'russian_twist', 'dead_bug', 'superman'],
        calorias: 200
      },
      {
        dia: 'Domingo',
        tipo: 'Descanso Total',
        duracao: 0,
        exercicios: [],
        calorias: 0
      }
    ],
    dicas: [
      'Superávit calórico ligeiro (200-300 kcal)',
      'Proteína: 1.6-2.2g/kg de peso corporal',
      'Progressão de carga semanal',
      'Sono mínimo: 7-8 horas'
    ]
  },
  manutencao: {
    nome: 'Manutenção & Saúde',
    descricao: 'Manter forma física e bem-estar geral',
    icon: '⚖️',
    cor: 'from-[#7C8B6F] to-[#5C6B4F]',
    dias: 3,
    duracao_media: 40,
    calorias_sessao: '200-300',
    estrutura: [
      {
        dia: 'Segunda',
        tipo: 'Full Body Força',
        duracao: 40,
        exercicios: ['agachamento_livre', 'ponte_gluteos', 'flexoes_joelhos', 'remada_haltere', 'prancha', 'superman'],
        calorias: 280
      },
      {
        dia: 'Terça',
        tipo: 'Descanso ou Caminhada',
        duracao: 30,
        exercicios: ['caminhada'],
        calorias: 120
      },
      {
        dia: 'Quarta',
        tipo: 'Cardio Moderado',
        duracao: 35,
        exercicios: ['corrida', 'alongamentos'],
        calorias: 300
      },
      {
        dia: 'Quinta',
        tipo: 'Descanso',
        duracao: 0,
        exercicios: [],
        calorias: 0
      },
      {
        dia: 'Sexta',
        tipo: 'Full Body Força',
        duracao: 40,
        exercicios: ['lunges', 'agachamento_sumo', 'triceps_banco', 'shoulder_press', 'crunch', 'dead_bug'],
        calorias: 260
      },
      {
        dia: 'Sábado',
        tipo: 'Actividade Livre',
        duracao: 45,
        exercicios: ['yoga', 'caminhada', 'pilates'],
        calorias: 150
      },
      {
        dia: 'Domingo',
        tipo: 'Descanso',
        duracao: 0,
        exercicios: [],
        calorias: 0
      }
    ],
    dicas: [
      'Calorias ao nível de manutenção',
      'Consistência > Intensidade',
      'Variar actividades para motivação',
      'Incluir actividades que gostas'
    ]
  },
  iniciante: {
    nome: 'Iniciante',
    descricao: 'Introdução gradual e segura ao exercício',
    icon: '🌱',
    cor: 'from-emerald-600 to-teal-700',
    dias: 3,
    duracao_media: 30,
    calorias_sessao: '150-250',
    estrutura: [
      {
        dia: 'Segunda',
        tipo: 'Corpo Inteiro - Básico',
        duracao: 30,
        exercicios: ['agachamento_livre', 'ponte_gluteos', 'flexoes_joelhos', 'prancha'],
        calorias: 180
      },
      {
        dia: 'Terça',
        tipo: 'Descanso',
        duracao: 0,
        exercicios: [],
        calorias: 0
      },
      {
        dia: 'Quarta',
        tipo: 'Caminhada + Alongamentos',
        duracao: 35,
        exercicios: ['caminhada', 'alongamentos'],
        calorias: 140
      },
      {
        dia: 'Quinta',
        tipo: 'Descanso',
        duracao: 0,
        exercicios: [],
        calorias: 0
      },
      {
        dia: 'Sexta',
        tipo: 'Corpo Inteiro - Básico',
        duracao: 30,
        exercicios: ['lunges', 'superman', 'triceps_banco', 'dead_bug'],
        calorias: 170
      },
      {
        dia: 'Sábado',
        tipo: 'Yoga ou Pilates',
        duracao: 30,
        exercicios: ['yoga', 'pilates'],
        calorias: 100
      },
      {
        dia: 'Domingo',
        tipo: 'Descanso',
        duracao: 0,
        exercicios: [],
        calorias: 0
      }
    ],
    dicas: [
      'Foco em aprender a técnica correcta',
      'Nunca sacrificar forma por repetições',
      'Progredir gradualmente (semana a semana)',
      'Ouvir o corpo - dor não é ganho'
    ]
  }
};

export default function TreinosVitalis() {
  const [user, setUser] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados do componente
  const [localTreino, setLocalTreino] = useState('casa');
  const [faseCiclo, setFaseCiclo] = useState('folicular');
  const [fasePrograma, setFasePrograma] = useState('construcao');
  const [objectivoSelecionado, setObjectivoSelecionado] = useState(null);
  const [exercicioExpandido, setExercicioExpandido] = useState(null);
  const [tabActiva, setTabActiva] = useState('ciclo');
  const [calculadoraAberta, setCalculadoraAberta] = useState(false);
  const [tempoTreino, setTempoTreino] = useState(30);
  const [pesoUsuario, setPesoUsuario] = useState(65);
  const [grupoFiltro, setGrupoFiltro] = useState('todos');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();

        if (userData) {
          const { data: clientData } = await supabase
            .from('vitalis_clients')
            .select('*')
            .eq('user_id', userData.id)
            .single();

          if (clientData) {
            setClientData(clientData);
            const semanas = Math.floor((Date.now() - new Date(clientData.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000));
            if (semanas < 2) setFasePrograma('inducao');
            else if (semanas < 4) setFasePrograma('transicao');
            else if (semanas < 8) setFasePrograma('construcao');
            else setFasePrograma('manutencao');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFaseActual = () => FASES_CICLO[faseCiclo];
  const getProgramaActual = () => FASES_PROGRAMA[fasePrograma];

  const getExerciciosFiltrados = () => {
    return Object.entries(EXERCICIOS).filter(([key, ex]) => {
      const localMatch = localTreino === 'todos' || ex.local === localTreino || ex.local === 'ambos';
      const grupoMatch = grupoFiltro === 'todos' || ex.grupo === grupoFiltro;
      return localMatch && grupoMatch;
    });
  };

  const getGruposUnicos = () => {
    const grupos = new Set(Object.values(EXERCICIOS).map(ex => ex.grupo));
    return ['todos', ...Array.from(grupos)];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#E8E2D9] flex items-center justify-center">
        <div className="text-[#4A4035] text-xl">A carregar...</div>
      </div>
    );
  }

  const faseActual = getFaseActual();
  const programaActual = getProgramaActual();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#E8E2D9] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#4A4035] shadow-lg">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/vitalis/dashboard" className="text-white/70 hover:text-white transition-colors">
              ← Voltar
            </Link>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              💪 Treinos
            </h1>
            <button
              onClick={() => setCalculadoraAberta(true)}
              className="text-xl bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors"
              title="Calculadora de calorias"
            >
              🔢
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Fase do Programa */}
        <div className={`p-4 rounded-2xl bg-gradient-to-r ${programaActual.cor} shadow-lg`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{programaActual.icon}</span>
            <div className="flex-1">
              <h3 className="font-bold text-white">Fase: {programaActual.nome}</h3>
              <p className="text-white/80 text-sm">{programaActual.foco}</p>
            </div>
          </div>
          <p className="mt-3 text-white/90 text-sm bg-black/20 rounded-xl p-3">
            {programaActual.treino}
          </p>
          {fasePrograma === 'inducao' && (
            <div className="mt-3 p-3 bg-yellow-500/30 rounded-xl border border-yellow-400/50">
              <p className="text-yellow-100 text-sm font-medium">
                ⚠️ Na fase de indução, o foco é equilíbrio hormonal. Evita treinos intensos por enquanto.
              </p>
            </div>
          )}
        </div>

        {/* Toggle Casa/Ginásio */}
        <div className="flex gap-2 p-1 bg-[#4A4035]/10 rounded-xl">
          <button
            onClick={() => setLocalTreino('casa')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              localTreino === 'casa'
                ? 'bg-[#4A4035] text-white shadow-lg'
                : 'text-[#4A4035]/70 hover:text-[#4A4035]'
            }`}
          >
            🏠 Em Casa
          </button>
          <button
            onClick={() => setLocalTreino('ginasio')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              localTreino === 'ginasio'
                ? 'bg-[#4A4035] text-white shadow-lg'
                : 'text-[#4A4035]/70 hover:text-[#4A4035]'
            }`}
          >
            🏋️ Ginásio
          </button>
          <button
            onClick={() => setLocalTreino('todos')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              localTreino === 'todos'
                ? 'bg-[#4A4035] text-white shadow-lg'
                : 'text-[#4A4035]/70 hover:text-[#4A4035]'
            }`}
          >
            📚 Todos
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#4A4035]/5 rounded-xl overflow-x-auto">
          {[
            { id: 'ciclo', label: 'Ciclo', icon: '🌙' },
            { id: 'planos', label: 'Planos', icon: '📋' },
            { id: 'exercicios', label: 'Biblioteca', icon: '📖' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                tabActiva === tab.id
                  ? 'bg-[#7C8B6F] text-white shadow-md'
                  : 'text-[#4A4035]/60 hover:text-[#4A4035] hover:bg-white/50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: Ciclo Menstrual */}
        {tabActiva === 'ciclo' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-[#4A4035] mb-1">Treino Sincronizado com o Ciclo</h2>
              <p className="text-[#4A4035]/60 text-sm">Selecciona a fase actual do teu ciclo</p>
            </div>

            {/* Selector de fase */}
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(FASES_CICLO).map(([key, fase]) => (
                <button
                  key={key}
                  onClick={() => setFaseCiclo(key)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    faseCiclo === key
                      ? `bg-gradient-to-r ${fase.cor} border-transparent shadow-lg text-white`
                      : 'bg-white border-[#E8E2D9] hover:border-[#7C8B6F]/30 text-[#4A4035]'
                  }`}
                >
                  <span className="text-2xl block mb-1">{fase.icon}</span>
                  <span className="font-medium">
                    {fase.nome}
                  </span>
                  <span className={`block text-xs ${faseCiclo === key ? 'text-white/80' : 'text-[#4A4035]/50'}`}>
                    Dias {fase.dias}
                  </span>
                </button>
              ))}
            </div>

            {/* Info da fase actual */}
            <div className={`p-5 rounded-2xl bg-gradient-to-br ${faseActual.cor} shadow-xl`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{faseActual.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-white">{faseActual.nome}</h3>
                  <p className="text-white/80">Dias {faseActual.dias}</p>
                </div>
              </div>

              {/* Barra de energia */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-white/80 mb-1">
                  <span>Nível de Energia</span>
                  <span>{faseActual.energia}</span>
                </div>
                <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/90 rounded-full transition-all"
                    style={{ width: `${faseActual.intensidade}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white/20 rounded-xl p-3">
                  <p className="text-white/90 text-sm font-medium mb-1">✅ Recomendado</p>
                  <p className="text-white text-sm">{faseActual.recomendacao}</p>
                </div>
                <div className="bg-black/20 rounded-xl p-3">
                  <p className="text-white/70 text-sm font-medium mb-1">⚠️ Evitar</p>
                  <p className="text-white/80 text-sm">{faseActual.evitar}</p>
                </div>
              </div>
            </div>

            {/* Dica científica */}
            <div className="p-4 rounded-2xl bg-[#7C8B6F]/10 border border-[#7C8B6F]/30">
              <p className="text-[#7C8B6F] text-sm font-medium mb-2">📚 Base Científica</p>
              <p className="text-[#4A4035]/80 text-sm">
                O ciclo menstrual afecta os níveis de estrogénio e progesterona, que influenciam força, recuperação e energia.
                Treinar em sintonia com o ciclo optimiza resultados e reduz risco de lesões.
              </p>
            </div>
          </div>
        )}

        {/* TAB: Planos de Treino */}
        {tabActiva === 'planos' && (
          <div className="space-y-4">
            {!objectivoSelecionado ? (
              <>
                <div className="text-center mb-4">
                  <h2 className="text-lg font-bold text-[#4A4035] mb-1">Planos de Treino</h2>
                  <p className="text-[#4A4035]/60 text-sm">Escolhe o teu objectivo</p>
                </div>

                <div className="space-y-3">
                  {Object.entries(PLANOS_TREINO).map(([key, plano]) => (
                    <button
                      key={key}
                      onClick={() => setObjectivoSelecionado(key)}
                      disabled={fasePrograma === 'inducao' && key !== 'iniciante'}
                      className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                        fasePrograma === 'inducao' && key !== 'iniciante'
                          ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                          : 'bg-white border-[#E8E2D9] hover:border-[#7C8B6F] hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${plano.cor} flex items-center justify-center text-2xl shadow-lg`}>
                          {plano.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-[#4A4035]">{plano.nome}</h3>
                          <p className="text-[#4A4035]/60 text-sm">{plano.descricao}</p>
                          <div className="flex gap-3 mt-1 text-xs text-[#4A4035]/50">
                            <span>📅 {plano.dias} dias/sem</span>
                            <span>⏱️ ~{plano.duracao_media} min</span>
                            <span>🔥 {plano.calorias_sessao} kcal</span>
                          </div>
                        </div>
                        <span className="text-[#4A4035]/40">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Plano selecionado */
              <div className="space-y-4">
                <button
                  onClick={() => setObjectivoSelecionado(null)}
                  className="text-[#7C8B6F] hover:text-[#4A4035] text-sm font-medium"
                >
                  ← Voltar aos planos
                </button>

                {(() => {
                  const plano = PLANOS_TREINO[objectivoSelecionado];
                  const totalCalorias = plano.estrutura.reduce((sum, d) => sum + d.calorias, 0);
                  const totalMinutos = plano.estrutura.reduce((sum, d) => sum + d.duracao, 0);

                  return (
                    <>
                      <div className={`p-5 rounded-2xl bg-gradient-to-r ${plano.cor} shadow-xl`}>
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-4xl">{plano.icon}</span>
                          <div>
                            <h2 className="text-2xl font-bold text-white">{plano.nome}</h2>
                            <p className="text-white/80">{plano.dias} treinos/semana</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="bg-white/20 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-white">{totalMinutos}</p>
                            <p className="text-white/70 text-xs">minutos/semana</p>
                          </div>
                          <div className="bg-white/20 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-white">{totalCalorias}</p>
                            <p className="text-white/70 text-xs">kcal/semana</p>
                          </div>
                        </div>
                      </div>

                      {/* Dicas */}
                      <div className="bg-white rounded-xl p-4 shadow-md">
                        <h4 className="font-bold text-[#4A4035] mb-2">💡 Dicas para este plano:</h4>
                        <ul className="space-y-1">
                          {plano.dicas.map((dica, idx) => (
                            <li key={idx} className="text-sm text-[#4A4035]/70 flex items-start gap-2">
                              <span className="text-[#7C8B6F]">•</span>
                              {dica}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Semana de treino */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-[#4A4035]">📅 Semana Tipo:</h3>
                        {plano.estrutura.map((dia, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl ${
                              dia.exercicios.length > 0
                                ? 'bg-white shadow-md border border-[#E8E2D9]'
                                : 'bg-[#F5F1EB] border border-[#E8E2D9]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-bold text-[#4A4035]">{dia.dia}</span>
                                <span className="text-[#4A4035]/60 text-sm ml-2">• {dia.tipo}</span>
                              </div>
                              {dia.duracao > 0 && (
                                <div className="text-right text-xs">
                                  <span className="bg-[#7C8B6F]/10 text-[#7C8B6F] px-2 py-1 rounded-lg mr-1">
                                    ⏱️ {dia.duracao}min
                                  </span>
                                  <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-lg">
                                    🔥 {dia.calorias}kcal
                                  </span>
                                </div>
                              )}
                            </div>
                            {dia.exercicios.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {dia.exercicios.map(exId => {
                                  const ex = EXERCICIOS[exId];
                                  return ex ? (
                                    <span
                                      key={exId}
                                      className="text-xs bg-[#4A4035]/5 px-2 py-1 rounded-lg text-[#4A4035]/70 border border-[#4A4035]/10"
                                    >
                                      {ex.icon} {ex.nome}
                                      <span className="text-[#4A4035]/40 ml-1">
                                        {ex.series}x{ex.repeticoes}
                                      </span>
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* TAB: Biblioteca de Exercícios */}
        {tabActiva === 'exercicios' && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-lg font-bold text-[#4A4035] mb-1">Biblioteca de Exercícios</h2>
              <p className="text-[#4A4035]/60 text-sm">
                {Object.keys(EXERCICIOS).length} exercícios com instruções detalhadas
              </p>
            </div>

            {/* Filtro por grupo muscular */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {getGruposUnicos().map(grupo => (
                <button
                  key={grupo}
                  onClick={() => setGrupoFiltro(grupo)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                    grupoFiltro === grupo
                      ? 'bg-[#4A4035] text-white'
                      : 'bg-white text-[#4A4035]/70 border border-[#E8E2D9]'
                  }`}
                >
                  {grupo === 'todos' ? '📚 Todos' : grupo}
                </button>
              ))}
            </div>

            {/* Lista de exercícios */}
            <div className="space-y-3">
              {getExerciciosFiltrados().map(([key, exercicio]) => (
                <div key={key} className="bg-white rounded-xl shadow-md overflow-hidden border border-[#E8E2D9]">
                  <button
                    onClick={() => setExercicioExpandido(exercicioExpandido === key ? null : key)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#4A4035]/5 rounded-xl flex items-center justify-center text-2xl">
                        {exercicio.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#4A4035] truncate">{exercicio.nome}</p>
                          {exercicio.local === 'ginasio' && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">🏋️</span>
                          )}
                        </div>
                        <p className="text-[#4A4035]/50 text-xs">{exercicio.musculo_principal}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs text-[#7C8B6F] bg-[#7C8B6F]/10 px-2 py-0.5 rounded">
                            {exercicio.series}x{exercicio.repeticoes}
                          </span>
                          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                            ~{exercicio.calorias_min} cal/min
                          </span>
                        </div>
                      </div>
                      <span className={`text-[#4A4035]/40 transition-transform ${exercicioExpandido === key ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Detalhes expandidos */}
                  {exercicioExpandido === key && (
                    <div className="px-4 pb-4 space-y-4 border-t border-[#E8E2D9] pt-4">
                      {/* Info rápida */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-[#F5F1EB] rounded-lg p-2">
                          <p className="text-xs text-[#4A4035]/50">Séries</p>
                          <p className="font-bold text-[#4A4035]">{exercicio.series}</p>
                        </div>
                        <div className="bg-[#F5F1EB] rounded-lg p-2">
                          <p className="text-xs text-[#4A4035]/50">Reps</p>
                          <p className="font-bold text-[#4A4035]">{exercicio.repeticoes}</p>
                        </div>
                        <div className="bg-[#F5F1EB] rounded-lg p-2">
                          <p className="text-xs text-[#4A4035]/50">Descanso</p>
                          <p className="font-bold text-[#4A4035]">{exercicio.descanso}</p>
                        </div>
                      </div>

                      {/* Músculos */}
                      <div>
                        <p className="text-xs font-medium text-[#4A4035]/50 mb-1">MÚSCULOS TRABALHADOS</p>
                        <div className="flex flex-wrap gap-1">
                          {exercicio.musculos.map(musculo => (
                            <span
                              key={musculo}
                              className="text-xs bg-[#7C8B6F]/10 text-[#7C8B6F] px-2 py-1 rounded-full"
                            >
                              {musculo}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Instruções */}
                      <div>
                        <p className="text-xs font-medium text-[#4A4035]/50 mb-2">COMO EXECUTAR</p>
                        <ol className="space-y-1">
                          {exercicio.instrucoes.map((inst, idx) => (
                            <li key={idx} className="text-sm text-[#4A4035]/80 flex gap-2">
                              <span className="text-[#7C8B6F] font-bold">{idx + 1}.</span>
                              {inst}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Erros comuns */}
                      {exercicio.erros_comuns && (
                        <div className="bg-red-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-red-600 mb-1">⚠️ ERROS COMUNS</p>
                          <ul className="space-y-0.5">
                            {exercicio.erros_comuns.map((erro, idx) => (
                              <li key={idx} className="text-xs text-red-600/80 flex gap-1">
                                <span>•</span> {erro}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Variantes */}
                      {exercicio.variantes && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-blue-600 mb-1">🔄 VARIANTES</p>
                          <ul className="space-y-0.5">
                            {exercicio.variantes.map((var_, idx) => (
                              <li key={idx} className="text-xs text-blue-600/80 flex gap-1">
                                <span>•</span> {var_}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Benefícios */}
                      <div className="bg-[#7C8B6F]/10 rounded-lg p-3">
                        <p className="text-xs font-medium text-[#7C8B6F] mb-1">✨ BENEFÍCIOS</p>
                        <p className="text-sm text-[#4A4035]/80">{exercicio.beneficios}</p>
                      </div>

                      {/* Video link */}
                      <a
                        href={exercicio.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#4A4035] text-white rounded-xl font-medium hover:bg-[#3A3025] transition-colors"
                      >
                        ▶️ Ver Demonstração no YouTube
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Calculadora de Calorias */}
      {calculadoraAberta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 bg-[#4A4035] text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">🔢 Calculadora de Calorias</h2>
                <button
                  onClick={() => setCalculadoraAberta(false)}
                  className="text-white/60 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Peso */}
              <div>
                <label className="block text-[#4A4035]/60 text-sm mb-2">Teu peso (kg)</label>
                <input
                  type="number"
                  value={pesoUsuario}
                  onChange={(e) => setPesoUsuario(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-[#F5F1EB] border border-[#E8E2D9] text-[#4A4035] text-center text-xl font-bold"
                />
              </div>

              {/* Tempo */}
              <div>
                <label className="block text-[#4A4035]/60 text-sm mb-2">Duração do treino: <span className="font-bold text-[#4A4035]">{tempoTreino} minutos</span></label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={tempoTreino}
                  onChange={(e) => setTempoTreino(Number(e.target.value))}
                  className="w-full accent-[#7C8B6F]"
                />
              </div>

              {/* Estimativas */}
              <div className="space-y-2">
                <h4 className="font-medium text-[#4A4035]">Estimativa por actividade:</h4>
                {[
                  { nome: 'Caminhada', calorias: 4, icon: '🚶‍♀️' },
                  { nome: 'Yoga/Pilates', calorias: 3.5, icon: '🧘‍♀️' },
                  { nome: 'Treino de força', calorias: 7, icon: '💪' },
                  { nome: 'Corrida', calorias: 10, icon: '🏃‍♀️' },
                  { nome: 'HIIT', calorias: 12, icon: '🔥' },
                  { nome: 'Saltar corda', calorias: 13, icon: '⏫' }
                ].map(act => (
                  <div key={act.nome} className="flex justify-between items-center p-3 bg-[#F5F1EB] rounded-xl">
                    <span className="text-[#4A4035]/70">{act.icon} {act.nome}</span>
                    <span className="text-[#7C8B6F] font-bold">
                      {Math.round(act.calorias * tempoTreino * (pesoUsuario / 65))} kcal
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[#4A4035]/40 text-xs text-center">
                * Valores aproximados. A queima real depende de intensidade, composição corporal e metabolismo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[#E8E2D9] safe-area-inset-bottom shadow-lg">
        <div className="max-w-lg mx-auto flex justify-around py-3">
          <Link to="/vitalis/dashboard" className="flex flex-col items-center text-[#4A4035]/40 hover:text-[#7C8B6F] transition-colors">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Início</span>
          </Link>
          <Link to="/vitalis/checkin" className="flex flex-col items-center text-[#4A4035]/40 hover:text-[#7C8B6F] transition-colors">
            <span className="text-xl">✅</span>
            <span className="text-xs mt-1">Check-in</span>
          </Link>
          <Link to="/vitalis/treinos" className="flex flex-col items-center text-[#7C8B6F]">
            <span className="text-xl">💪</span>
            <span className="text-xs mt-1 font-medium">Treinos</span>
          </Link>
          <Link to="/vitalis/plano" className="flex flex-col items-center text-[#4A4035]/40 hover:text-[#7C8B6F] transition-colors">
            <span className="text-xl">🍽️</span>
            <span className="text-xs mt-1">Plano</span>
          </Link>
          <Link to="/vitalis/perfil" className="flex flex-col items-center text-[#4A4035]/40 hover:text-[#7C8B6F] transition-colors">
            <span className="text-xl">👤</span>
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
