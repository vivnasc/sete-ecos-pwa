import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// ============================================================
// TREINOS VITALIS - Totalmente Integrado com o Sistema
// ============================================================
// - Lê dados reais do utilizador (peso, objectivo, fase)
// - Sincronizado com plano alimentar (calorias, proteína)
// - Treinos adaptados à fase do programa
// - Links directos YouTube para demonstração
// ============================================================

// Recomendações por fase do programa Vitalis
const FASES_VITALIS = {
  inducao: {
    nome: 'Indução',
    semanas: '1-2',
    icon: '🌱',
    cor: 'bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5F]',
    corBorda: 'border-[#7C8B6F]',
    descricao: 'Foco em equilíbrio hormonal e ajustes metabólicos',
    treino: {
      recomendacao: 'Movimento suave apenas. Evitar stress físico para não interferir nos ajustes metabólicos.',
      permitido: ['caminhada', 'yoga', 'alongamentos', 'respiracao', 'pilates_leve'],
      bloqueado: ['forca', 'hiit', 'cardio_intenso', 'corrida'],
      frequencia: '2-3x por semana',
      duracao: '20-30 minutos',
      intensidade: 'Muito leve (30-40% esforço máximo)',
      aviso: '⚠️ Treinos intensos nesta fase podem prejudicar a adaptação metabólica e hormonal. Prioriza descanso e recuperação.'
    },
    nutricao: {
      foco: 'Défice calórico moderado, proteína adequada',
      calorias_extra_treino: 0, // Não adicionar calorias por treino nesta fase
      proteina_ajuste: 1.0 // Manter proteína base
    }
  },
  transicao: {
    nome: 'Transição',
    semanas: '3-4',
    icon: '🌿',
    cor: 'bg-gradient-to-r from-[#6B7A5F] to-[#5A694F]',
    corBorda: 'border-[#6B7A5F]',
    descricao: 'Introdução gradual de exercício estruturado',
    treino: {
      recomendacao: 'Começar força leve e cardio moderado. Corpo está pronto para mais estímulo.',
      permitido: ['caminhada', 'yoga', 'alongamentos', 'pilates', 'forca_leve', 'cardio_leve', 'natacao'],
      bloqueado: ['hiit', 'forca_pesada', 'crossfit'],
      frequencia: '3-4x por semana',
      duracao: '30-40 minutos',
      intensidade: 'Leve a moderada (50-60% esforço máximo)'
    },
    nutricao: {
      foco: 'Manter défice, aumentar proteína para suportar treino',
      calorias_extra_treino: 100,
      proteina_ajuste: 1.2
    }
  },
  construcao: {
    nome: 'Construção',
    semanas: '5-8',
    icon: '💪',
    cor: 'bg-gradient-to-r from-[#4A4035] to-[#3A3025]',
    corBorda: 'border-[#4A4035]',
    descricao: 'Construção muscular e condicionamento físico',
    treino: {
      recomendacao: 'Treino de força recomendado! Momento ideal para construir músculo e acelerar metabolismo.',
      permitido: ['todos'],
      bloqueado: [],
      frequencia: '4-5x por semana',
      duracao: '45-60 minutos',
      intensidade: 'Moderada a alta (70-85% esforço máximo)'
    },
    nutricao: {
      foco: 'Proteína alta para construção muscular',
      calorias_extra_treino: 150,
      proteina_ajuste: 1.4
    }
  },
  manutencao: {
    nome: 'Manutenção',
    semanas: '9+',
    icon: '⭐',
    cor: 'bg-gradient-to-r from-[#C9A227] to-[#A8891F]',
    corBorda: 'border-[#C9A227]',
    descricao: 'Manter ganhos e optimizar composição corporal',
    treino: {
      recomendacao: 'Liberdade total! Mantém consistência e desafia-te progressivamente.',
      permitido: ['todos'],
      bloqueado: [],
      frequencia: '3-5x por semana',
      duracao: '30-60 minutos',
      intensidade: 'Variada conforme objectivos'
    },
    nutricao: {
      foco: 'Equilíbrio para manutenção',
      calorias_extra_treino: 100,
      proteina_ajuste: 1.2
    }
  }
};

// Fases do ciclo menstrual
// NOTA: Os exercícios 'ideal' usam IDs que existem em EXERCICIOS
// A fase de treino do utilizador (indução, transição, etc.) pode bloquear alguns destes
const FASES_CICLO = {
  menstrual: {
    nome: 'Menstrual',
    dias: '1-5',
    icon: '🌙',
    cor: 'from-rose-500 to-red-600',
    energia: 30,
    recomendacao: 'Treinos leves: yoga, caminhada, alongamentos. Respeita o teu corpo.',
    evitar: 'HIIT, treino pesado, exercícios de alto impacto',
    ideal: ['yoga', 'caminhada', 'alongamentos', 'natacao', 'pilates', 'ponte_gluteos', 'prancha']
  },
  folicular: {
    nome: 'Folicular',
    dias: '6-14',
    icon: '🌸',
    cor: 'from-emerald-500 to-teal-600',
    energia: 75,
    recomendacao: 'Energia crescente! Ideal para novos desafios e aumentar intensidade.',
    evitar: 'Nada - fase óptima para qualquer treino',
    ideal: ['agachamento_livre', 'lunges', 'hiit', 'corrida', 'flexoes', 'bicicleta']
  },
  ovulacao: {
    nome: 'Ovulação',
    dias: '14-17',
    icon: '☀️',
    cor: 'from-amber-400 to-orange-500',
    energia: 100,
    recomendacao: 'Pico de energia e força! Aproveita para treinos intensos e bater recordes.',
    evitar: 'Cuidado com lesões - articulações mais flexíveis',
    ideal: ['hip_thrust', 'deadlift_romeno', 'hiit', 'saltar_corda', 'agachamento_bulgaro']
  },
  lutea: {
    nome: 'Lútea',
    dias: '18-28',
    icon: '🍂',
    cor: 'from-stone-500 to-stone-600',
    energia: 50,
    recomendacao: 'Energia a baixar. Foca em treinos moderados e não te frustres com performance.',
    evitar: 'Expectativas altas, treinos muito longos',
    ideal: ['yoga', 'pilates', 'caminhada', 'ponte_gluteos', 'prancha', 'alongamentos']
  }
};

// ============================================================
// BIBLIOTECA DE EXERCÍCIOS COMPLETA
// Com vídeos YouTube directos de demonstração
// ============================================================
const EXERCICIOS = {
  // ==================== MEMBROS INFERIORES ====================
  agachamento_livre: {
    id: 'agachamento_livre',
    nome: 'Agachamento Livre',
    grupo: 'Membros Inferiores',
    subgrupo: 'Quadríceps & Glúteos',
    local: 'casa',
    dificuldade: 'Iniciante',
    musculos: ['Quadríceps', 'Glúteos', 'Core', 'Isquiotibiais'],
    equipamento: 'Nenhum',
    series: 4,
    repeticoes: '12-15',
    descanso: '60s',
    calorias_min: 6,
    instrucoes: [
      'Pés à largura dos ombros, pontas ligeiramente para fora',
      'Core activado, peito erguido',
      'Desce empurrando a anca para trás',
      'Joelhos seguem direcção dos pés',
      'Desce até coxas paralelas ao chão',
      'Sobe empurrando pelos calcanhares'
    ],
    erros: ['Joelhos a colapsar para dentro', 'Levantar calcanhares', 'Inclinar demasiado à frente'],
    video: 'https://www.youtube.com/watch?v=aclHkVaku9U',
    video_canal: 'Athlean-X',
    icon: '🦵',
    fase_minima: 'transicao'
  },
  agachamento_sumo: {
    id: 'agachamento_sumo',
    nome: 'Agachamento Sumo',
    grupo: 'Membros Inferiores',
    subgrupo: 'Glúteos & Adutores',
    local: 'casa',
    dificuldade: 'Iniciante',
    musculos: ['Glúteos', 'Adutores', 'Quadríceps', 'Core'],
    equipamento: 'Nenhum (opcional: haltere)',
    series: 4,
    repeticoes: '12-15',
    descanso: '60s',
    calorias_min: 7,
    instrucoes: [
      'Pés bem afastados (1.5x largura ombros)',
      'Pontas dos pés a 45° para fora',
      'Mantém tronco vertical',
      'Desce até coxas paralelas',
      'Aperta glúteos ao subir'
    ],
    erros: ['Pés pouco afastados', 'Joelhos a colapsar', 'Inclinar tronco'],
    video: 'https://www.youtube.com/watch?v=9ZuXKqRbT9k',
    video_canal: 'Buff Dudes',
    icon: '🏋️‍♀️',
    fase_minima: 'transicao'
  },
  agachamento_bulgaro: {
    id: 'agachamento_bulgaro',
    nome: 'Agachamento Búlgaro',
    grupo: 'Membros Inferiores',
    subgrupo: 'Quadríceps & Glúteos',
    local: 'ambos',
    dificuldade: 'Intermédio',
    musculos: ['Quadríceps', 'Glúteos', 'Core', 'Estabilizadores'],
    equipamento: 'Banco ou cadeira',
    series: 3,
    repeticoes: '10-12 cada perna',
    descanso: '60s',
    calorias_min: 8,
    instrucoes: [
      'Pé de trás elevado num banco',
      'Pé da frente avançado ~60cm',
      'Desce verticalmente',
      'Joelho quase toca o chão',
      'Mantém tronco erecto'
    ],
    erros: ['Pé da frente muito perto', 'Inclinar à frente', 'Joelho passar do pé'],
    video: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
    video_canal: 'Jeff Nippard',
    icon: '🦿',
    fase_minima: 'construcao'
  },
  lunges: {
    id: 'lunges',
    nome: 'Lunges / Afundos',
    grupo: 'Membros Inferiores',
    subgrupo: 'Quadríceps & Glúteos',
    local: 'casa',
    dificuldade: 'Iniciante',
    musculos: ['Quadríceps', 'Glúteos', 'Isquiotibiais', 'Core'],
    equipamento: 'Nenhum',
    series: 3,
    repeticoes: '12 cada perna',
    descanso: '45s',
    calorias_min: 7,
    instrucoes: [
      'Em pé, pés à largura da anca',
      'Dá passo largo à frente',
      'Desce até ambos joelhos a 90°',
      'Joelho de trás quase toca chão',
      'Empurra de volta à posição inicial'
    ],
    erros: ['Passo curto', 'Joelho passa do pé', 'Perder equilíbrio'],
    video: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
    video_canal: 'Athlean-X',
    icon: '🚶‍♀️',
    fase_minima: 'transicao'
  },
  ponte_gluteos: {
    id: 'ponte_gluteos',
    nome: 'Ponte de Glúteos',
    grupo: 'Membros Inferiores',
    subgrupo: 'Glúteos',
    local: 'casa',
    dificuldade: 'Iniciante',
    musculos: ['Glúteos', 'Isquiotibiais', 'Core', 'Lombar'],
    equipamento: 'Tapete',
    series: 4,
    repeticoes: '15-20',
    descanso: '45s',
    calorias_min: 5,
    instrucoes: [
      'Deitada, joelhos dobrados, pés no chão',
      'Pés à largura da anca',
      'Contrai glúteos e eleva anca',
      'Linha recta ombros-joelhos no topo',
      'Mantém 2s, desce controlado'
    ],
    erros: ['Hiperextender lombar', 'Não contrair glúteos', 'Subir pelos isquiotibiais'],
    video: 'https://www.youtube.com/watch?v=OUgsJ8-Vi0E',
    video_canal: 'Bret Contreras',
    icon: '🌉',
    fase_minima: 'inducao' // Pode fazer em qualquer fase
  },
  hip_thrust: {
    id: 'hip_thrust',
    nome: 'Hip Thrust',
    grupo: 'Membros Inferiores',
    subgrupo: 'Glúteos',
    local: 'ambos',
    dificuldade: 'Intermédio',
    musculos: ['Glúteos', 'Isquiotibiais', 'Core'],
    equipamento: 'Banco + Barra/Haltere',
    series: 4,
    repeticoes: '10-12',
    descanso: '90s',
    calorias_min: 8,
    instrucoes: [
      'Costas no banco (omoplatas)',
      'Barra/haltere na anca (com pad)',
      'Pés à largura da anca',
      'Empurra anca para cima',
      'Contrai glúteos 2s no topo'
    ],
    erros: ['Hiperextender lombar', 'Pés mal posicionados', 'Não usar pad'],
    video: 'https://www.youtube.com/watch?v=SEdqd1n0cvg',
    video_canal: 'Bret Contreras',
    icon: '🍑',
    fase_minima: 'construcao'
  },
  leg_press: {
    id: 'leg_press',
    nome: 'Leg Press',
    grupo: 'Membros Inferiores',
    subgrupo: 'Quadríceps & Glúteos',
    local: 'ginasio',
    dificuldade: 'Iniciante',
    musculos: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
    equipamento: 'Máquina Leg Press',
    series: 4,
    repeticoes: '12-15',
    descanso: '90s',
    calorias_min: 9,
    instrucoes: [
      'Costas e lombar bem apoiadas',
      'Pés à largura dos ombros na plataforma',
      'Pés mais alto = mais glúteos',
      'Desce até 90° nos joelhos',
      'Não bloqueia joelhos no topo'
    ],
    erros: ['Lombar descola do banco', 'Bloquear joelhos', 'Amplitude insuficiente'],
    video: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    video_canal: 'Jeff Nippard',
    icon: '🦿',
    fase_minima: 'transicao'
  },
  deadlift_romeno: {
    id: 'deadlift_romeno',
    nome: 'Peso Morto Romeno',
    grupo: 'Membros Inferiores',
    subgrupo: 'Isquiotibiais & Glúteos',
    local: 'ambos',
    dificuldade: 'Intermédio',
    musculos: ['Isquiotibiais', 'Glúteos', 'Lombar', 'Core'],
    equipamento: 'Barra ou Halteres',
    series: 4,
    repeticoes: '10-12',
    descanso: '90s',
    calorias_min: 10,
    instrucoes: [
      'Em pé, barra/halteres à frente das coxas',
      'Joelhos ligeiramente flectidos',
      'Costas SEMPRE neutras',
      'Empurra anca para trás (hip hinge)',
      'Desce até sentir alongamento nos isquios',
      'Sobe apertando glúteos'
    ],
    erros: ['Arredondar costas', 'Dobrar muito os joelhos', 'Peso longe do corpo'],
    video: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
    video_canal: 'Athlean-X',
    icon: '⬆️',
    fase_minima: 'construcao'
  },
  extensao_quadriceps: {
    id: 'extensao_quadriceps',
    nome: 'Extensão de Quadríceps',
    grupo: 'Membros Inferiores',
    subgrupo: 'Quadríceps',
    local: 'ginasio',
    dificuldade: 'Iniciante',
    musculos: ['Quadríceps'],
    equipamento: 'Máquina Extensora',
    series: 3,
    repeticoes: '12-15',
    descanso: '45s',
    calorias_min: 5,
    instrucoes: [
      'Sentada, costas apoiadas',
      'Almofada sobre os tornozelos',
      'Estende as pernas completamente',
      'Contrai quadríceps no topo',
      'Desce controlado'
    ],
    erros: ['Usar impulso', 'Não estender completamente', 'Peso excessivo'],
    video: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
    video_canal: 'Jeff Nippard',
    icon: '🦵',
    fase_minima: 'transicao'
  },
  curl_isquiotibiais: {
    id: 'curl_isquiotibiais',
    nome: 'Curl de Isquiotibiais',
    grupo: 'Membros Inferiores',
    subgrupo: 'Isquiotibiais',
    local: 'ginasio',
    dificuldade: 'Iniciante',
    musculos: ['Isquiotibiais'],
    equipamento: 'Máquina Flexora',
    series: 3,
    repeticoes: '12-15',
    descanso: '45s',
    calorias_min: 5,
    instrucoes: [
      'Deitada de barriga para baixo',
      'Almofada nos tornozelos',
      'Flexiona os joelhos',
      'Contrai isquios no topo',
      'Desce controlado'
    ],
    erros: ['Levantar a anca', 'Movimento brusco', 'Não contrair no topo'],
    video: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
    video_canal: 'Jeff Nippard',
    icon: '🦵',
    fase_minima: 'transicao'
  },

  // ==================== MEMBROS SUPERIORES ====================
  flexoes: {
    id: 'flexoes',
    nome: 'Flexões',
    grupo: 'Membros Superiores',
    subgrupo: 'Peito & Tríceps',
    local: 'casa',
    dificuldade: 'Iniciante-Intermédio',
    musculos: ['Peito', 'Tríceps', 'Ombros', 'Core'],
    equipamento: 'Nenhum',
    series: 3,
    repeticoes: '8-15',
    descanso: '60s',
    calorias_min: 7,
    instrucoes: [
      'Mãos à largura dos ombros',
      'Corpo em linha recta',
      'Core e glúteos contraídos',
      'Desce até peito quase tocar chão',
      'Cotovelos a 45° (não 90°)',
      'Sobe até extensão completa'
    ],
    erros: ['Anca a cair/subir', 'Cotovelos muito abertos', 'Amplitude incompleta'],
    variantes: ['Joelhos apoiados', 'Inclinadas', 'Declinadas', 'Diamante'],
    video: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    video_canal: 'Athlean-X',
    icon: '💪',
    fase_minima: 'transicao'
  },
  flexoes_joelhos: {
    id: 'flexoes_joelhos',
    nome: 'Flexões de Joelhos',
    grupo: 'Membros Superiores',
    subgrupo: 'Peito & Tríceps',
    local: 'casa',
    dificuldade: 'Iniciante',
    musculos: ['Peito', 'Tríceps', 'Ombros'],
    equipamento: 'Tapete',
    series: 3,
    repeticoes: '12-15',
    descanso: '45s',
    calorias_min: 5,
    instrucoes: [
      'Apoio nos joelhos',
      'Cruza os pés atrás',
      'Mãos à largura dos ombros',
      'Linha recta joelhos-cabeça',
      'Desce controlado'
    ],
    erros: ['Anca muito alta', 'Não descer suficiente'],
    video: 'https://www.youtube.com/watch?v=jWxvty2KROs',
    video_canal: 'Calisthenicmovement',
    icon: '💪',
    fase_minima: 'transicao'
  },
  supino_halteres: {
    id: 'supino_halteres',
    nome: 'Supino com Halteres',
    grupo: 'Membros Superiores',
    subgrupo: 'Peito',
    local: 'ginasio',
    dificuldade: 'Iniciante',
    musculos: ['Peito', 'Tríceps', 'Ombros'],
    equipamento: 'Banco + Halteres',
    series: 4,
    repeticoes: '10-12',
    descanso: '90s',
    calorias_min: 7,
    instrucoes: [
      'Deitada no banco, pés no chão',
      'Halteres ao nível do peito',
      'Empurra para cima',
      'Desce controlado até cotovelos a 90°',
      'Mantém omoplatas retraídas'
    ],
    erros: ['Arquear costas', 'Descer demasiado', 'Não retrair omoplatas'],
    video: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
    video_canal: 'Jeff Nippard',
    icon: '🏋️',
    fase_minima: 'construcao'
  },
  remada_haltere: {
    id: 'remada_haltere',
    nome: 'Remada com Haltere',
    grupo: 'Membros Superiores',
    subgrupo: 'Costas',
    local: 'ambos',
    dificuldade: 'Iniciante',
    musculos: ['Grande Dorsal', 'Romboides', 'Bíceps', 'Core'],
    equipamento: 'Haltere + Banco',
    series: 3,
    repeticoes: '10-12 cada lado',
    descanso: '60s',
    calorias_min: 7,
    instrucoes: [
      'Joelho e mão de apoio no banco',
      'Costas paralelas ao chão',
      'Puxa haltere em direcção à anca',
      'Cotovelo junto ao corpo',
      'Aperta costas no topo'
    ],
    erros: ['Rodar tronco', 'Usar impulso', 'Não subir suficiente'],
    video: 'https://www.youtube.com/watch?v=pYcpY20QaE8',
    video_canal: 'Athlean-X',
    icon: '🏋️',
    fase_minima: 'transicao'
  },
  lat_pulldown: {
    id: 'lat_pulldown',
    nome: 'Puxada à Frente',
    grupo: 'Membros Superiores',
    subgrupo: 'Costas',
    local: 'ginasio',
    dificuldade: 'Iniciante',
    musculos: ['Grande Dorsal', 'Bíceps', 'Romboides', 'Trapézio'],
    equipamento: 'Máquina Pulldown',
    series: 4,
    repeticoes: '10-12',
    descanso: '60s',
    calorias_min: 6,
    instrucoes: [
      'Sentada, coxas fixas sob apoio',
      'Pega mais larga que ombros',
      'Puxa barra ao peito (não atrás)',
      'Peito para cima, omoplatas para trás',
      'Controla o regresso'
    ],
    erros: ['Puxar atrás do pescoço', 'Inclinar muito', 'Usar impulso'],
    video: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    video_canal: 'Jeff Nippard',
    icon: '🔽',
    fase_minima: 'transicao'
  },
  shoulder_press: {
    id: 'shoulder_press',
    nome: 'Press de Ombros',
    grupo: 'Membros Superiores',
    subgrupo: 'Ombros',
    local: 'ambos',
    dificuldade: 'Iniciante',
    musculos: ['Deltóides', 'Tríceps', 'Trapézio'],
    equipamento: 'Halteres',
    series: 3,
    repeticoes: '10-12',
    descanso: '60s',
    calorias_min: 6,
    instrucoes: [
      'Sentada ou em pé, core activado',
      'Halteres ao nível dos ombros',
      'Empurra para cima',
      'Não bloqueia cotovelos',
      'Desce controlado'
    ],
    erros: ['Arquear costas', 'Usar impulso', 'Cotovelos muito atrás'],
    video: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
    video_canal: 'Athlean-X',
    icon: '🙆‍♀️',
    fase_minima: 'transicao'
  },
  triceps_banco: {
    id: 'triceps_banco',
    nome: 'Tríceps no Banco',
    grupo: 'Membros Superiores',
    subgrupo: 'Tríceps',
    local: 'casa',
    dificuldade: 'Iniciante',
    musculos: ['Tríceps', 'Ombros', 'Peito'],
    equipamento: 'Cadeira ou banco',
    series: 3,
    repeticoes: '12-15',
    descanso: '45s',
    calorias_min: 6,
    instrucoes: [
      'Mãos no banco atrás, dedos para frente',
      'Pernas esticadas ou dobradas',
      'Desce dobrando cotovelos até 90°',
      'Cotovelos apontam para trás',
      'Empurra de volta'
    ],
    erros: ['Cotovelos abrem para lados', 'Descer demasiado'],
    video: 'https://www.youtube.com/watch?v=6kALZikXxLc',
    video_canal: 'Athlean-X',
    icon: '💺',
    fase_minima: 'transicao'
  },
  biceps_curl: {
    id: 'biceps_curl',
    nome: 'Curl de Bíceps',
    grupo: 'Membros Superiores',
    subgrupo: 'Bíceps',
    local: 'ambos',
    dificuldade: 'Iniciante',
    musculos: ['Bíceps', 'Antebraço'],
    equipamento: 'Halteres',
    series: 3,
    repeticoes: '12-15',
    descanso: '45s',
    calorias_min: 5,
    instrucoes: [
      'Em pé, halteres nas mãos',
      'Cotovelos junto ao corpo',
      'Flexiona os cotovelos subindo os halteres',
      'Não balança o corpo',
      'Desce controlado'
    ],
    erros: ['Balançar corpo', 'Cotovelos a mover', 'Peso excessivo'],
    video: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
    video_canal: 'Athlean-X',
    icon: '💪',
    fase_minima: 'transicao'
  },

  // ==================== CORE ====================
  prancha: {
    id: 'prancha',
    nome: 'Prancha',
    grupo: 'Core',
    subgrupo: 'Core Completo',
    local: 'casa',
    dificuldade: 'Iniciante',
    musculos: ['Core', 'Recto Abdominal', 'Oblíquos', 'Lombar', 'Ombros'],
    equipamento: 'Tapete',
    series: 3,
    repeticoes: '30-60 segundos',
    descanso: '30s',
    calorias_min: 4,
    instrucoes: [
      'Antebraços no chão, cotovelos sob ombros',
      'Corpo em linha recta',
      'Core contraído',
      'Glúteos apertados',
      'Olha para o chão',
      'Respira normalmente'
    ],
    erros: ['Anca alta', 'Anca a cair', 'Prender respiração'],
    video: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
    video_canal: 'Athlean-X',
    icon: '📏',
    fase_minima: 'inducao'
  },
  crunch: {
    id: 'crunch',
    nome: 'Crunch Abdominal',
    grupo: 'Core',
    subgrupo: 'Abdominais',
    local: 'casa',
    dificuldade: 'Iniciante',
    musculos: ['Recto Abdominal'],
    equipamento: 'Tapete',
    series: 3,
    repeticoes: '15-20',
    descanso: '30s',
    calorias_min: 5,
    instrucoes: [
      'Deitada, joelhos dobrados',
      'Mãos atrás da cabeça (não puxar pescoço)',
      'Eleva ombros do chão',
      'Aproxima costelas da anca',
      'Desce controlado'
    ],
    erros: ['Puxar pescoço', 'Usar impulso', 'Subir demasiado'],
    video: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
    video_canal: 'Athlean-X',
    icon: '🔄',
    fase_minima: 'transicao'
  },
  russian_twist: {
    id: 'russian_twist',
    nome: 'Russian Twist',
    grupo: 'Core',
    subgrupo: 'Oblíquos',
    local: 'casa',
    dificuldade: 'Intermédio',
    musculos: ['Oblíquos', 'Recto Abdominal', 'Core'],
    equipamento: 'Opcional: peso',
    series: 3,
    repeticoes: '20 (10 cada lado)',
    descanso: '30s',
    calorias_min: 6,
    instrucoes: [
      'Sentada, joelhos dobrados',
      'Pés elevados ou no chão',
      'Inclina tronco ligeiramente atrás',
      'Roda tronco lado a lado',
      'Mantém anca estável'
    ],
    erros: ['Rodar só braços', 'Perder postura', 'Movimento rápido'],
    video: 'https://www.youtube.com/watch?v=wkD8rjkodUI',
    video_canal: 'Athlean-X',
    icon: '🌀',
    fase_minima: 'transicao'
  },
  dead_bug: {
    id: 'dead_bug',
    nome: 'Dead Bug',
    grupo: 'Core',
    subgrupo: 'Core Profundo',
    local: 'casa',
    dificuldade: 'Iniciante',
    musculos: ['Core Profundo', 'Estabilizadores', 'Lombar'],
    equipamento: 'Tapete',
    series: 3,
    repeticoes: '10 cada lado',
    descanso: '30s',
    calorias_min: 4,
    instrucoes: [
      'Deitada, braços ao tecto',
      'Joelhos a 90°, pernas elevadas',
      'Lombar pressionada no chão',
      'Estende braço e perna opostos',
      'Mantém lombar sempre no chão'
    ],
    erros: ['Lombar arquea', 'Movimento rápido', 'Prender respiração'],
    video: 'https://www.youtube.com/watch?v=4XLEnwUr1d8',
    video_canal: 'Squat University',
    icon: '🐛',
    fase_minima: 'inducao'
  },
  superman: {
    id: 'superman',
    nome: 'Superman',
    grupo: 'Core',
    subgrupo: 'Lombar',
    local: 'casa',
    dificuldade: 'Iniciante',
    musculos: ['Lombar', 'Glúteos', 'Ombros', 'Eretores'],
    equipamento: 'Tapete',
    series: 3,
    repeticoes: '12-15',
    descanso: '30s',
    calorias_min: 4,
    instrucoes: [
      'Deitada de barriga para baixo',
      'Braços estendidos à frente',
      'Eleva braços e pernas simultaneamente',
      'Mantém 2s no topo',
      'Olha para o chão'
    ],
    erros: ['Hiperextender pescoço', 'Movimento brusco', 'Não manter contracção'],
    video: 'https://www.youtube.com/watch?v=cc6UVRS7PW4',
    video_canal: 'Athlean-X',
    icon: '🦸‍♀️',
    fase_minima: 'inducao'
  },
  prancha_lateral: {
    id: 'prancha_lateral',
    nome: 'Prancha Lateral',
    grupo: 'Core',
    subgrupo: 'Oblíquos',
    local: 'casa',
    dificuldade: 'Intermédio',
    musculos: ['Oblíquos', 'Core', 'Ombros'],
    equipamento: 'Tapete',
    series: 3,
    repeticoes: '30s cada lado',
    descanso: '30s',
    calorias_min: 5,
    instrucoes: [
      'Apoio num antebraço',
      'Corpo em linha recta lateral',
      'Anca elevada, não deixa cair',
      'Core contraído',
      'Mantém a posição'
    ],
    erros: ['Anca cai', 'Ombro sobe', 'Torcer corpo'],
    video: 'https://www.youtube.com/watch?v=K2VljzCC16g',
    video_canal: 'Athlean-X',
    icon: '📐',
    fase_minima: 'transicao'
  },

  // ==================== CARDIO ====================
  caminhada: {
    id: 'caminhada',
    nome: 'Caminhada',
    grupo: 'Cardio',
    subgrupo: 'Baixa Intensidade',
    local: 'ambos',
    dificuldade: 'Iniciante',
    musculos: ['Sistema Cardiovascular', 'Pernas', 'Core'],
    equipamento: 'Nenhum',
    series: 1,
    repeticoes: '30-60 minutos',
    descanso: 'N/A',
    calorias_min: 4,
    instrucoes: [
      'Ritmo moderado mas consistente',
      'Postura erecta',
      'Balanço natural dos braços',
      'Objectivo: 5000-10000 passos/dia',
      'Ideal após refeições'
    ],
    erros: ['Ritmo muito lento', 'Má postura'],
    video: 'https://www.youtube.com/watch?v=wgOmrX3cNPw',
    video_canal: 'Bob and Brad',
    icon: '🚶‍♀️',
    fase_minima: 'inducao'
  },
  corrida: {
    id: 'corrida',
    nome: 'Corrida',
    grupo: 'Cardio',
    subgrupo: 'Intensidade Moderada',
    local: 'ambos',
    dificuldade: 'Iniciante-Intermédio',
    musculos: ['Sistema Cardiovascular', 'Pernas', 'Glúteos'],
    equipamento: 'Sapatilhas de corrida',
    series: 1,
    repeticoes: '20-45 minutos',
    descanso: 'N/A',
    calorias_min: 10,
    instrucoes: [
      'Começar devagar (conversar confortável)',
      'Cadência 170-180 passos/min',
      'Aterrar com médio-pé',
      'Postura erecta',
      'Respiração ritmada'
    ],
    erros: ['Começar rápido demais', 'Aterrar com calcanhar', 'Má postura'],
    video: 'https://www.youtube.com/watch?v=_kGESn8ArrU',
    video_canal: 'Global Triathlon Network',
    icon: '🏃‍♀️',
    fase_minima: 'construcao'
  },
  hiit: {
    id: 'hiit',
    nome: 'HIIT',
    grupo: 'Cardio',
    subgrupo: 'Alta Intensidade',
    local: 'ambos',
    dificuldade: 'Avançado',
    musculos: ['Corpo Inteiro', 'Sistema Cardiovascular'],
    equipamento: 'Nenhum',
    series: 1,
    repeticoes: '15-25 minutos',
    descanso: 'Intervalado',
    calorias_min: 12,
    instrucoes: [
      'Aquecimento: 3-5 min',
      'Trabalho: 20-40s (máximo esforço)',
      'Descanso: 20-40s',
      'Repetir 8-12 rondas',
      'Arrefecimento: 3-5 min'
    ],
    exemplo: ['Burpees 30s', 'Descanso 30s', 'Mountain Climbers 30s', 'Descanso 30s'],
    erros: ['Sem aquecimento', 'Não dar máximo', 'Treinar todos os dias'],
    video: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
    video_canal: 'THENX',
    icon: '🔥',
    fase_minima: 'construcao'
  },
  bicicleta: {
    id: 'bicicleta',
    nome: 'Bicicleta',
    grupo: 'Cardio',
    subgrupo: 'Intensidade Moderada',
    local: 'ginasio',
    dificuldade: 'Iniciante',
    musculos: ['Quadríceps', 'Glúteos', 'Cardiovascular'],
    equipamento: 'Bicicleta estática',
    series: 1,
    repeticoes: '30-45 minutos',
    descanso: 'N/A',
    calorias_min: 8,
    instrucoes: [
      'Ajustar altura do selim',
      'Cadência 60-90 RPM',
      'Resistência moderada',
      'Costas neutras',
      'Variar intensidade'
    ],
    erros: ['Selim mal ajustado', 'Resistência muito baixa', 'Má postura'],
    video: 'https://www.youtube.com/watch?v=OJihJ7-qNWk',
    video_canal: 'Global Cycling Network',
    icon: '🚴‍♀️',
    fase_minima: 'transicao'
  },
  natacao: {
    id: 'natacao',
    nome: 'Natação',
    grupo: 'Cardio',
    subgrupo: 'Baixo Impacto',
    local: 'ginasio',
    dificuldade: 'Iniciante-Intermédio',
    musculos: ['Corpo Inteiro', 'Cardiovascular'],
    equipamento: 'Piscina',
    series: 1,
    repeticoes: '30-45 minutos',
    descanso: 'Entre séries',
    calorias_min: 11,
    instrucoes: [
      'Variar estilos',
      'Começar com intervalos',
      'Progredir para contínuo',
      'Respiração bilateral'
    ],
    erros: ['Técnica pobre', 'Sem variar estilos'],
    video: 'https://www.youtube.com/watch?v=gh5mAtmeR3Y',
    video_canal: 'Swim England',
    icon: '🏊‍♀️',
    fase_minima: 'inducao'
  },
  saltar_corda: {
    id: 'saltar_corda',
    nome: 'Saltar à Corda',
    grupo: 'Cardio',
    subgrupo: 'Alta Intensidade',
    local: 'casa',
    dificuldade: 'Intermédio',
    musculos: ['Gémeos', 'Quadríceps', 'Core', 'Cardiovascular'],
    equipamento: 'Corda de saltar',
    series: 1,
    repeticoes: '10-20 minutos (intervalos)',
    descanso: '30s entre séries',
    calorias_min: 13,
    instrucoes: [
      'Corda ao comprimento certo',
      'Saltos pequenos',
      'Aterra na frente dos pés',
      'Cotovelos junto ao corpo',
      'Rodar com pulsos'
    ],
    erros: ['Saltos grandes', 'Braços afastados', 'Corda errada'],
    video: 'https://www.youtube.com/watch?v=u3zgHI8QnqE',
    video_canal: 'Jump Rope Dudes',
    icon: '⏫',
    fase_minima: 'construcao'
  },

  // ==================== FLEXIBILIDADE ====================
  yoga: {
    id: 'yoga',
    nome: 'Yoga',
    grupo: 'Flexibilidade',
    subgrupo: 'Corpo & Mente',
    local: 'casa',
    dificuldade: 'Variável',
    musculos: ['Flexibilidade', 'Core', 'Equilíbrio', 'Mente'],
    equipamento: 'Tapete',
    series: 1,
    repeticoes: '30-60 minutos',
    descanso: 'Contínuo',
    calorias_min: 3,
    instrucoes: [
      'Hatha para iniciantes',
      'Vinyasa para intermédio',
      'Foco na respiração',
      'Nunca forçar',
      'Ideal manhã ou noite'
    ],
    erros: ['Forçar posições', 'Respiração incorrecta', 'Comparar com outros'],
    video: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
    video_canal: 'Yoga With Adriene',
    icon: '🧘‍♀️',
    fase_minima: 'inducao'
  },
  pilates: {
    id: 'pilates',
    nome: 'Pilates',
    grupo: 'Flexibilidade',
    subgrupo: 'Core & Postura',
    local: 'ambos',
    dificuldade: 'Iniciante-Intermédio',
    musculos: ['Core Profundo', 'Postura', 'Flexibilidade'],
    equipamento: 'Tapete',
    series: 1,
    repeticoes: '45-60 minutos',
    descanso: 'Contínuo',
    calorias_min: 4,
    instrucoes: [
      'Foco em controlo e precisão',
      'Respiração lateral',
      'Movimentos lentos',
      'Powerhouse sempre activo'
    ],
    erros: ['Movimentos rápidos', 'Respiração errada', 'Perder foco'],
    video: 'https://www.youtube.com/watch?v=K56Z12XNQ5c',
    video_canal: 'Move With Nicole',
    icon: '🤸‍♀️',
    fase_minima: 'inducao'
  },
  alongamentos: {
    id: 'alongamentos',
    nome: 'Alongamentos',
    grupo: 'Flexibilidade',
    subgrupo: 'Recuperação',
    local: 'casa',
    dificuldade: 'Iniciante',
    musculos: ['Flexibilidade', 'Recuperação'],
    equipamento: 'Tapete',
    series: 1,
    repeticoes: '15-20 minutos',
    descanso: 'N/A',
    calorias_min: 2,
    instrucoes: [
      'Mantém cada posição 30-60s',
      'Nunca fazer bounce',
      'Respirar profundamente',
      'Alongar todos os grupos',
      'Ideal após treino'
    ],
    erros: ['Bounce/saltar', 'Forçar demais', 'Prender respiração'],
    video: 'https://www.youtube.com/watch?v=sTxC3J3gQEU',
    video_canal: 'Tom Merrick',
    icon: '🙆‍♀️',
    fase_minima: 'inducao'
  }
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function TreinosVitalis() {
  // Estados de dados do utilizador
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [planoAlimentar, setPlanoAlimentar] = useState(null);
  const [intakeData, setIntakeData] = useState(null);

  // Estados da interface
  const [tabActiva, setTabActiva] = useState('recomendado');
  const [localTreino, setLocalTreino] = useState('todos');
  const [grupoFiltro, setGrupoFiltro] = useState('todos');
  const [faseCiclo, setFaseCiclo] = useState('folicular');
  const [exercicioExpandido, setExercicioExpandido] = useState(null);

  // Carregar dados do utilizador
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Buscar ID do utilizador
      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userRecord) {
        setLoading(false);
        return;
      }

      // Buscar dados em paralelo
      const [clientResult, planoResult, intakeResult] = await Promise.all([
        supabase.from('vitalis_clients').select('*').eq('user_id', userRecord.id).single(),
        supabase.from('vitalis_planos').select('*').eq('user_id', userRecord.id).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('vitalis_intake').select('*').eq('user_id', userRecord.id).order('created_at', { ascending: false }).limit(1).single()
      ]);

      setUserData(clientResult.data);
      setPlanoAlimentar(planoResult.data);
      setIntakeData(intakeResult.data);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Determinar fase actual
  const getFaseActual = () => {
    if (!userData?.created_at) return 'inducao';
    const semanas = Math.floor((Date.now() - new Date(userData.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (semanas < 2) return 'inducao';
    if (semanas < 4) return 'transicao';
    if (semanas < 8) return 'construcao';
    return 'manutencao';
  };

  const faseActual = getFaseActual();
  const faseInfo = FASES_VITALIS[faseActual];
  const cicloInfo = FASES_CICLO[faseCiclo];

  // Filtrar exercícios por permissão da fase
  const exercicioPermitido = (exercicio) => {
    const faseOrdem = ['inducao', 'transicao', 'construcao', 'manutencao'];
    const faseMinima = exercicio.fase_minima || 'inducao';
    return faseOrdem.indexOf(faseActual) >= faseOrdem.indexOf(faseMinima);
  };

  // Obter exercícios filtrados
  const getExerciciosFiltrados = () => {
    return Object.values(EXERCICIOS).filter(ex => {
      const localMatch = localTreino === 'todos' || ex.local === localTreino || ex.local === 'ambos';
      const grupoMatch = grupoFiltro === 'todos' || ex.grupo === grupoFiltro;
      return localMatch && grupoMatch;
    });
  };

  // Obter exercícios recomendados para a fase
  const getExerciciosRecomendados = () => {
    return Object.values(EXERCICIOS).filter(ex => {
      const permitido = exercicioPermitido(ex);
      // Na fase de indução, apenas exercícios muito leves
      if (faseActual === 'inducao') {
        return ['caminhada', 'yoga', 'pilates', 'alongamentos', 'ponte_gluteos', 'prancha', 'dead_bug', 'superman', 'natacao'].includes(ex.id);
      }
      return permitido;
    });
  };

  // Calcular dados nutricionais com treino
  const getDadosNutricionais = () => {
    if (!planoAlimentar) return null;

    const ajuste = faseInfo.nutricao;
    const caloriasBase = planoAlimentar.calorias || 1600;
    const proteinaBase = planoAlimentar.macros?.proteina_g || 100;

    return {
      caloriasSemTreino: caloriasBase,
      caloriasComTreino: caloriasBase + ajuste.calorias_extra_treino,
      proteinaDiaria: Math.round(proteinaBase * ajuste.proteina_ajuste),
      proteinaGkg: intakeData?.peso_actual ?
        (Math.round((proteinaBase * ajuste.proteina_ajuste) / intakeData.peso_actual * 10) / 10) :
        null
    };
  };

  const dadosNutricionais = getDadosNutricionais();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
        <div className="text-[#4A4035] text-xl">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#4A4035] shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/vitalis/dashboard" className="text-white/70 hover:text-white">
              ← Voltar
            </Link>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-titulos)' }}>💪 Treinos</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Card Fase Actual + Integração Nutricional */}
        <div className={`p-5 rounded-2xl ${faseInfo.cor} shadow-lg`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{faseInfo.icon}</span>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">Fase: {faseInfo.nome}</h2>
              <p className="text-white/80 text-sm">{faseInfo.descricao}</p>
            </div>
          </div>

          {/* Recomendação de treino */}
          <div className="bg-black/20 rounded-xl p-3 mb-3">
            <p className="text-white text-sm">{faseInfo.treino.recomendacao}</p>
          </div>

          {/* Stats da fase */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/20 rounded-lg p-2">
              <p className="text-white/70 text-xs">Frequência</p>
              <p className="text-white font-bold text-sm">{faseInfo.treino.frequencia}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2">
              <p className="text-white/70 text-xs">Duração</p>
              <p className="text-white font-bold text-sm">{faseInfo.treino.duracao}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2">
              <p className="text-white/70 text-xs">Intensidade</p>
              <p className="text-white font-bold text-xs">{faseInfo.treino.intensidade.split('(')[0]}</p>
            </div>
          </div>

          {/* Aviso na indução */}
          {faseActual === 'inducao' && (
            <div className="mt-3 p-3 bg-yellow-500/30 rounded-xl border border-yellow-400/50">
              <p className="text-yellow-100 text-sm">{faseInfo.treino.aviso}</p>
            </div>
          )}
        </div>

        {/* Integração com Plano Alimentar */}
        {dadosNutricionais && (
          <div className="bg-white rounded-2xl p-4 shadow-md border border-[#E8E2D9]">
            <h3 className="font-bold text-[#4A4035] mb-3 flex items-center gap-2">
              🍽️ Nutrição + Treino Sincronizados
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F5F1EB] rounded-xl p-3">
                <p className="text-[#4A4035]/60 text-xs">Dia sem treino</p>
                <p className="font-bold text-[#4A4035] text-lg">{dadosNutricionais.caloriasSemTreino} kcal</p>
              </div>
              <div className="bg-[#7C8B6F]/10 rounded-xl p-3 border border-[#7C8B6F]/30">
                <p className="text-[#7C8B6F] text-xs">Dia com treino</p>
                <p className="font-bold text-[#7C8B6F] text-lg">{dadosNutricionais.caloriasComTreino} kcal</p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-orange-50 rounded-xl">
              <p className="text-orange-700 text-sm">
                <strong>Proteína nesta fase:</strong> {dadosNutricionais.proteinaDiaria}g/dia
                {dadosNutricionais.proteinaGkg && (
                  <span className="text-orange-600"> ({dadosNutricionais.proteinaGkg}g/kg)</span>
                )}
              </p>
              <p className="text-orange-600 text-xs mt-1">
                {faseInfo.nutricao.foco}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#4A4035]/10 rounded-xl">
          {[
            { id: 'recomendado', label: 'Para Ti', icon: '⭐' },
            { id: 'ciclo', label: 'Ciclo', icon: '🌙' },
            { id: 'biblioteca', label: 'Biblioteca', icon: '📖' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all ${
                tabActiva === tab.id
                  ? 'bg-[#4A4035] text-white shadow-md'
                  : 'text-[#4A4035]/60 hover:text-[#4A4035]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: Exercícios Recomendados */}
        {tabActiva === 'recomendado' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-bold text-[#4A4035]">Exercícios para a tua fase</h2>
              <p className="text-[#4A4035]/60 text-sm">
                {getExerciciosRecomendados().length} exercícios disponíveis na fase {faseInfo.nome}
              </p>
            </div>

            {faseActual === 'inducao' && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-blue-700 text-sm">
                  💡 <strong>Nesta fase</strong>, foca em movimento suave e consistente.
                  O objectivo é criar o hábito sem stressar o corpo enquanto ele se adapta.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {getExerciciosRecomendados().map(ex => (
                <ExercicioCard
                  key={ex.id}
                  exercicio={ex}
                  expandido={exercicioExpandido === ex.id}
                  onToggle={() => setExercicioExpandido(exercicioExpandido === ex.id ? null : ex.id)}
                  permitido={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB: Ciclo Menstrual */}
        {tabActiva === 'ciclo' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-bold text-[#4A4035]">Treino & Ciclo Menstrual</h2>
              <p className="text-[#4A4035]/60 text-sm">Adapta o treino à tua fase</p>
            </div>

            {/* Selector de fase do ciclo */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(FASES_CICLO).map(([key, fase]) => (
                <button
                  key={key}
                  onClick={() => setFaseCiclo(key)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    faseCiclo === key
                      ? `bg-gradient-to-r ${fase.cor} border-transparent text-white`
                      : 'bg-white border-[#E8E2D9] text-[#4A4035]'
                  }`}
                >
                  <span className="text-xl">{fase.icon}</span>
                  <p className="font-medium text-sm">{fase.nome}</p>
                  <p className={`text-xs ${faseCiclo === key ? 'text-white/70' : 'text-[#4A4035]/50'}`}>
                    Dias {fase.dias}
                  </p>
                </button>
              ))}
            </div>

            {/* Info da fase do ciclo */}
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${cicloInfo.cor} shadow-lg`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{cicloInfo.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">{cicloInfo.nome}</h3>
                  <p className="text-white/80 text-sm">Dias {cicloInfo.dias}</p>
                </div>
              </div>

              {/* Barra de energia */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-white/80 mb-1">
                  <span>Nível de Energia</span>
                  <span>{cicloInfo.energia}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${cicloInfo.energia}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-white/20 rounded-lg p-2">
                  <p className="text-white text-sm">✅ {cicloInfo.recomendacao}</p>
                </div>
                <div className="bg-black/20 rounded-lg p-2">
                  <p className="text-white/80 text-sm">⚠️ Evitar: {cicloInfo.evitar}</p>
                </div>
              </div>
            </div>

            {/* Aviso se estiver em fase de indução */}
            {faseActual === 'inducao' && (
              <div className="bg-[#7C8B6F]/10 rounded-xl p-4 border border-[#7C8B6F]/30">
                <p className="text-[#4A4035] text-sm font-medium mb-1">
                  🌱 Estás na Fase de Indução (Semanas 1-2)
                </p>
                <p className="text-[#4A4035]/70 text-sm">
                  Estamos a proteger o teu progresso! Nesta fase, o teu corpo está a fazer ajustes importantes.
                  Em breve vais poder aproveitar toda a energia do teu ciclo com treinos mais intensos.
                </p>
              </div>
            )}

            {/* Exercícios ideais para o ciclo - filtrados pela fase de treino */}
            <div>
              <h3 className="font-bold text-[#4A4035] mb-2">Exercícios ideais:</h3>
              <div className="flex flex-wrap gap-2">
                {cicloInfo.ideal.map(id => {
                  const ex = EXERCICIOS[id];
                  if (!ex) return null;

                  // Verificar se exercício está permitido na fase actual
                  const faseOrdem = ['inducao', 'transicao', 'construcao', 'manutencao'];
                  const faseMinima = ex.fase_minima || 'inducao';
                  const permitidoNaFase = faseOrdem.indexOf(faseActual) >= faseOrdem.indexOf(faseMinima);

                  return (
                    <span
                      key={id}
                      className={`px-3 py-1 rounded-full text-sm border ${
                        permitidoNaFase
                          ? 'bg-white text-[#4A4035] border-[#E8E2D9]'
                          : 'bg-[#7C8B6F]/5 text-[#4A4035]/40 border-[#7C8B6F]/20'
                      }`}
                      title={!permitidoNaFase ? `Disponível na fase ${faseMinima}` : ''}
                    >
                      {ex.icon} {ex.nome}
                      {!permitidoNaFase && ' 🌱'}
                    </span>
                  );
                })}
              </div>
              {faseActual === 'inducao' && cicloInfo.ideal.some(id => {
                const ex = EXERCICIOS[id];
                if (!ex) return false;
                const faseMinima = ex.fase_minima || 'inducao';
                return ['transicao', 'construcao', 'manutencao'].includes(faseMinima);
              }) && (
                <p className="text-[#7C8B6F] text-xs mt-2">
                  🌱 Em breve disponível para ti
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB: Biblioteca Completa */}
        {tabActiva === 'biblioteca' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-bold text-[#4A4035]">Biblioteca de Exercícios</h2>
              <p className="text-[#4A4035]/60 text-sm">
                {Object.keys(EXERCICIOS).length} exercícios com vídeos
              </p>
            </div>

            {/* Filtro local */}
            <div className="flex gap-2 p-1 bg-white rounded-xl border border-[#E8E2D9]">
              {['todos', 'casa', 'ginasio'].map(local => (
                <button
                  key={local}
                  onClick={() => setLocalTreino(local)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    localTreino === local
                      ? 'bg-[#4A4035] text-white'
                      : 'text-[#4A4035]/60'
                  }`}
                >
                  {local === 'todos' ? '📚 Todos' : local === 'casa' ? '🏠 Casa' : '🏋️ Ginásio'}
                </button>
              ))}
            </div>

            {/* Filtro por grupo */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {['todos', 'Membros Inferiores', 'Membros Superiores', 'Core', 'Cardio', 'Flexibilidade'].map(grupo => (
                <button
                  key={grupo}
                  onClick={() => setGrupoFiltro(grupo)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                    grupoFiltro === grupo
                      ? 'bg-[#7C8B6F] text-white'
                      : 'bg-white text-[#4A4035]/70 border border-[#E8E2D9]'
                  }`}
                >
                  {grupo === 'todos' ? 'Todos' : grupo}
                </button>
              ))}
            </div>

            {/* Lista de exercícios */}
            <div className="space-y-3">
              {getExerciciosFiltrados().map(ex => (
                <ExercicioCard
                  key={ex.id}
                  exercicio={ex}
                  expandido={exercicioExpandido === ex.id}
                  onToggle={() => setExercicioExpandido(exercicioExpandido === ex.id ? null : ex.id)}
                  permitido={exercicioPermitido(ex)}
                  faseActual={faseActual}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[#E8E2D9] shadow-lg">
        <div className="max-w-2xl mx-auto flex justify-around py-3">
          <Link to="/vitalis/dashboard" className="flex flex-col items-center text-[#4A4035]/40">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Início</span>
          </Link>
          <Link to="/vitalis/checkin" className="flex flex-col items-center text-[#4A4035]/40">
            <span className="text-xl">✅</span>
            <span className="text-xs mt-1">Check-in</span>
          </Link>
          <Link to="/vitalis/treinos" className="flex flex-col items-center text-[#7C8B6F]">
            <span className="text-xl">💪</span>
            <span className="text-xs mt-1 font-medium">Treinos</span>
          </Link>
          <Link to="/vitalis/plano" className="flex flex-col items-center text-[#4A4035]/40">
            <span className="text-xl">🍽️</span>
            <span className="text-xs mt-1">Plano</span>
          </Link>
          <Link to="/vitalis/perfil" className="flex flex-col items-center text-[#4A4035]/40">
            <span className="text-xl">👤</span>
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

// ============================================================
// COMPONENTE: Card de Exercício
// ============================================================
function ExercicioCard({ exercicio, expandido, onToggle, permitido, faseActual }) {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden border ${
      permitido ? 'border-[#E8E2D9]' : 'border-orange-200 opacity-60'
    }`}>
      <button onClick={onToggle} className="w-full p-4 text-left">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
            permitido ? 'bg-[#7C8B6F]/10' : 'bg-orange-100'
          }`}>
            {exercicio.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-[#4A4035] truncate">{exercicio.nome}</p>
              {!permitido && <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">🔒</span>}
              {exercicio.local === 'ginasio' && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">🏋️</span>}
            </div>
            <p className="text-[#4A4035]/50 text-xs">{exercicio.grupo} • {exercicio.subgrupo}</p>
            <div className="flex gap-2 mt-1">
              <span className="text-xs bg-[#7C8B6F]/10 text-[#7C8B6F] px-2 py-0.5 rounded">
                {exercicio.series}x{exercicio.repeticoes}
              </span>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                ~{exercicio.calorias_min} kcal/min
              </span>
            </div>
          </div>
          <span className={`text-[#4A4035]/40 transition-transform ${expandido ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {expandido && (
        <div className="px-4 pb-4 space-y-4 border-t border-[#E8E2D9] pt-4">
          {!permitido && (
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <p className="text-orange-700 text-sm">
                🔒 Este exercício estará disponível na fase de <strong>{exercicio.fase_minima}</strong>
              </p>
            </div>
          )}

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
            <p className="text-xs font-medium text-[#4A4035]/50 mb-1">MÚSCULOS</p>
            <div className="flex flex-wrap gap-1">
              {exercicio.musculos.map(m => (
                <span key={m} className="text-xs bg-[#7C8B6F]/10 text-[#7C8B6F] px-2 py-1 rounded-full">{m}</span>
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
          {exercicio.erros && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs font-medium text-red-600 mb-1">⚠️ ERROS COMUNS</p>
              <ul className="space-y-0.5">
                {exercicio.erros.map((erro, idx) => (
                  <li key={idx} className="text-xs text-red-600/80">• {erro}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Variantes */}
          {exercicio.variantes && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-600 mb-1">🔄 VARIANTES</p>
              <p className="text-xs text-blue-600/80">{exercicio.variantes.join(' • ')}</p>
            </div>
          )}

          {/* BOTÃO VÍDEO - DESTAQUE */}
          <a
            href={exercicio.video}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
            VER DEMONSTRAÇÃO ({exercicio.video_canal})
          </a>

          <p className="text-center text-[#4A4035]/40 text-xs">
            Vídeo abre no YouTube
          </p>
        </div>
      )}
    </div>
  );
}
