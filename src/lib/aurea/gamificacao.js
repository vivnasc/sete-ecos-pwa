/**
 * ÁUREA - Sistema de Gamificação
 *
 * Jóias de Ouro - Não são pontos arbitrários, são marcadores de evolução real.
 *
 * Níveis:
 * - BRONZE (0-50): Despertar
 * - PRATA (51-150): Presença
 * - OURO (151-300): Valor
 * - DIAMANTE (301+): Integração
 */

// Níveis de transformação
export const NIVEIS = {
  BRONZE: {
    id: 'bronze',
    nome: 'Bronze',
    subtitulo: 'Despertar',
    descricao: 'Estás a começar a ver onde te abandonas',
    min: 0,
    max: 50,
    cor: '#CD7F32',
    icone: '🥉',
    desbloqueios: ['Acesso completo a Micro-Práticas (100)']
  },
  PRATA: {
    id: 'prata',
    nome: 'Prata',
    subtitulo: 'Presença',
    descricao: 'Já não vives só para os outros',
    min: 51,
    max: 150,
    cor: '#C0C0C0',
    icone: '🥈',
    desbloqueios: ['Espelho de Roupa avançado', 'Áudio-meditações (5)']
  },
  OURO: {
    id: 'ouro',
    nome: 'Ouro',
    subtitulo: 'Valor',
    descricao: 'Tratas-te como prioridade',
    min: 151,
    max: 300,
    cor: '#D4AF37',
    icone: '🥇',
    desbloqueios: ['Diário de Merecimento', 'Ritual Mensal', 'Badge "A que merece"']
  },
  DIAMANTE: {
    id: 'diamante',
    nome: 'Diamante',
    subtitulo: 'Integração',
    descricao: 'És presença plena',
    min: 301,
    max: Infinity,
    cor: '#B9F2FF',
    icone: '💎',
    desbloqueios: ['Comunidade Anónima', 'Acesso antecipado', 'Certificado "Jornada ÁUREA Completa"']
  }
};

// Badges/Conquistas
export const BADGES = {
  // Streaks de quota
  SEMANA_VALOR: {
    id: 'semana_valor',
    nome: '7 Dias de Valor',
    descricao: 'Respeitaste a tua quota 7 dias seguidos',
    icone: '✨',
    condicao: 'streak_quota_7',
    joias: 3
  },
  MES_OURO: {
    id: 'mes_ouro',
    nome: 'Mês de Ouro',
    descricao: '30 dias consecutivos a respeitar-te',
    icone: '🌟',
    condicao: 'streak_quota_30',
    joias: 10
  },

  // Práticas
  PRIMEIROS_PASSOS: {
    id: 'primeiros_passos',
    nome: 'Primeiros Passos',
    descricao: '10 práticas completadas',
    icone: '👣',
    condicao: 'praticas_10',
    joias: 5
  },
  EM_MOVIMENTO: {
    id: 'em_movimento',
    nome: 'Em Movimento',
    descricao: '50 práticas completadas',
    icone: '🚶‍♀️',
    condicao: 'praticas_50',
    joias: 15
  },
  IMPARAVEL: {
    id: 'imparavel',
    nome: 'Imparável',
    descricao: '100 práticas completadas',
    icone: '🏃‍♀️',
    condicao: 'praticas_100',
    joias: 30
  },

  // Roupa
  SEMANA_DOURADA: {
    id: 'semana_dourada',
    nome: 'Semana Dourada',
    descricao: '7 dias vestida com presença',
    icone: '👗',
    condicao: 'roupa_presenca_7',
    joias: 5
  },
  RENOVACAO: {
    id: 'renovacao',
    nome: 'Renovação',
    descricao: 'Doaste 5 peças da versão antiga',
    icone: '🦋',
    condicao: 'roupa_doada_5',
    joias: 8
  },

  // Dinheiro
  PRIORIDADE_PROPRIA: {
    id: 'prioridade_propria',
    nome: 'Prioridade Própria',
    descricao: '4 semanas a gastar ≥10% contigo',
    icone: '💰',
    condicao: 'gasto_proprio_4_semanas',
    joias: 12
  },

  // Diário
  SEMANA_CLAREZA: {
    id: 'semana_clareza',
    nome: 'Semana de Clareza',
    descricao: '7 dias seguidos no diário',
    icone: '📝',
    condicao: 'diario_7',
    joias: 5
  },
  VOZ_CONSTANTE: {
    id: 'voz_constante',
    nome: 'Voz Constante',
    descricao: '30 entradas no diário',
    icone: '🗣️',
    condicao: 'diario_30',
    joias: 15
  },

  // Meditações
  ESCUTA_PROFUNDA: {
    id: 'escuta_profunda',
    nome: 'Escuta Profunda',
    descricao: 'Ouviste todas as 5 meditações',
    icone: '🎧',
    condicao: 'meditacoes_5',
    joias: 10
  },

  // Ritual Mensal
  TRIMESTRE_CONSCIENTE: {
    id: 'trimestre_consciente',
    nome: 'Trimestre Consciente',
    descricao: '3 rituais mensais completos',
    icone: '🌙',
    condicao: 'rituais_3',
    joias: 15
  },
  ANO_OURO: {
    id: 'ano_ouro',
    nome: 'Ano de Ouro',
    descricao: '12 rituais mensais completos',
    icone: '👑',
    condicao: 'rituais_12',
    joias: 50
  },

  // Comunidade
  VOZ_CAMPO: {
    id: 'voz_campo',
    nome: 'Voz no Campo',
    descricao: '10 testemunhos partilhados',
    icone: '💬',
    condicao: 'testemunhos_10',
    joias: 8
  },

  // Especiais
  A_QUE_MERECE: {
    id: 'a_que_merece',
    nome: 'A Que Merece',
    descricao: 'Chegaste ao nível Ouro',
    icone: '👸',
    condicao: 'nivel_ouro',
    joias: 25
  },
  JORNADA_COMPLETA: {
    id: 'jornada_completa',
    nome: 'Jornada ÁUREA Completa',
    descricao: 'Chegaste ao nível Diamante',
    icone: '💎',
    condicao: 'nivel_diamante',
    joias: 50
  }
};

/**
 * Calcula o nível actual baseado nas jóias
 */
export const calcularNivel = (joias) => {
  if (joias >= NIVEIS.DIAMANTE.min) return NIVEIS.DIAMANTE;
  if (joias >= NIVEIS.OURO.min) return NIVEIS.OURO;
  if (joias >= NIVEIS.PRATA.min) return NIVEIS.PRATA;
  return NIVEIS.BRONZE;
};

/**
 * Calcula progresso para o próximo nível
 */
export const calcularProgressoNivel = (joias) => {
  const nivelActual = calcularNivel(joias);

  if (nivelActual.id === 'diamante') {
    return {
      nivelActual,
      proximoNivel: null,
      progresso: 100,
      joiasParaProximo: 0
    };
  }

  const niveis = Object.values(NIVEIS);
  const indexActual = niveis.findIndex(n => n.id === nivelActual.id);
  const proximoNivel = niveis[indexActual + 1];

  const joiasNoNivel = joias - nivelActual.min;
  const joiasNecessarias = proximoNivel.min - nivelActual.min;
  const progresso = Math.min(100, (joiasNoNivel / joiasNecessarias) * 100);
  const joiasParaProximo = proximoNivel.min - joias;

  return {
    nivelActual,
    proximoNivel,
    progresso,
    joiasParaProximo
  };
};

/**
 * Verifica se um badge deve ser desbloqueado
 */
export const verificarBadges = (estatisticas, badgesDesbloqueados = []) => {
  const novosBadges = [];

  Object.values(BADGES).forEach(badge => {
    if (badgesDesbloqueados.includes(badge.id)) return;

    let desbloqueado = false;

    switch (badge.condicao) {
      case 'streak_quota_7':
        desbloqueado = estatisticas.streakQuota >= 7;
        break;
      case 'streak_quota_30':
        desbloqueado = estatisticas.streakQuota >= 30;
        break;
      case 'praticas_10':
        desbloqueado = estatisticas.praticasCompletadas >= 10;
        break;
      case 'praticas_50':
        desbloqueado = estatisticas.praticasCompletadas >= 50;
        break;
      case 'praticas_100':
        desbloqueado = estatisticas.praticasCompletadas >= 100;
        break;
      case 'roupa_presenca_7':
        desbloqueado = estatisticas.diasRoupaPresenca >= 7;
        break;
      case 'roupa_doada_5':
        desbloqueado = estatisticas.pecasDoadas >= 5;
        break;
      case 'gasto_proprio_4_semanas':
        desbloqueado = estatisticas.semanasGastoProprio >= 4;
        break;
      case 'diario_7':
        desbloqueado = estatisticas.streakDiario >= 7;
        break;
      case 'diario_30':
        desbloqueado = estatisticas.entradasDiario >= 30;
        break;
      case 'meditacoes_5':
        desbloqueado = estatisticas.meditacoesOuvidas >= 5;
        break;
      case 'rituais_3':
        desbloqueado = estatisticas.rituaisMensais >= 3;
        break;
      case 'rituais_12':
        desbloqueado = estatisticas.rituaisMensais >= 12;
        break;
      case 'testemunhos_10':
        desbloqueado = estatisticas.testemunhosPartilhados >= 10;
        break;
      case 'nivel_ouro':
        desbloqueado = estatisticas.joias >= NIVEIS.OURO.min;
        break;
      case 'nivel_diamante':
        desbloqueado = estatisticas.joias >= NIVEIS.DIAMANTE.min;
        break;
      default:
        break;
    }

    if (desbloqueado) {
      novosBadges.push(badge);
    }
  });

  return novosBadges;
};

/**
 * Calcula jóias ganhas por uma acção
 */
export const calcularJoias = (accao, extras = {}) => {
  let joias = 0;

  switch (accao) {
    case 'quota_cumprida':
      joias = 1;
      break;
    case 'pratica_completada':
      joias = extras.joiasPratica || 1;
      if (extras.semCulpa) joias += 1; // Bónus sem culpa
      break;
    case 'roupa_guardada_usada':
      joias = 2;
      break;
    case 'checkin_semanal':
      joias = 1;
      break;
    case 'semana_completa':
      joias = 3; // Bónus 7/7 dias
      break;
    case 'meditacao_ouvida':
      joias = 2;
      break;
    case 'ritual_mensal':
      joias = 5;
      break;
    case 'entrada_diario':
      joias = 1;
      break;
    case 'testemunho':
      joias = 1;
      break;
    case 'badge_desbloqueado':
      joias = extras.joiasBadge || 5;
      break;
    default:
      joias = 1;
  }

  return joias;
};

/**
 * Formata número de jóias para display
 */
export const formatarJoias = (joias) => {
  if (joias >= 1000) {
    return `${(joias / 1000).toFixed(1)}k`;
  }
  return joias.toString();
};

/**
 * Gera mensagem de celebração baseada no contexto
 */
export const gerarMensagemCelebracao = (contexto) => {
  const mensagens = {
    quota_cumprida: [
      'Respeitaste-te hoje. Isso importa.',
      'Mais um dia em que foste prioridade.',
      'A tua quota é sagrada. Bem guardada.'
    ],
    pratica_completada: [
      'Mais uma prática, mais presença.',
      'Estás a construir algo bonito.',
      'Cada gesto conta. Este contou.'
    ],
    semana_completa: [
      'Esta semana foi tua. Celebra.',
      '7 dias de valor. Impressionante.',
      'Uma semana inteira a tratar-te bem.'
    ],
    nivel_subiu: [
      'Evoluíste. Estás diferente.',
      'Novo nível, nova tu.',
      'A transformação é visível.'
    ],
    badge_desbloqueado: [
      'Conquistaste isto. Ninguém te tira.',
      'Mais uma marca da tua jornada.',
      'Olha para onde chegaste.'
    ]
  };

  const lista = mensagens[contexto] || mensagens.pratica_completada;
  return lista[Math.floor(Math.random() * lista.length)];
};
