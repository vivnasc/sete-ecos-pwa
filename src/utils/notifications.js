// src/utils/notifications.js
// Sistema de notificações para Vitalis PWA

// Verificar suporte a notificações
export const notificacoesSuportadas = () => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

// Pedir permissão para notificações
export const pedirPermissao = async () => {
  if (!('Notification' in window)) {
    console.log('Notificações não suportadas neste browser');
    return false;
  }

  try {
    // Handle both callback and promise-based APIs (for older browsers)
    let permissao;
    if (typeof Notification.requestPermission === 'function') {
      // Modern promise-based API
      permissao = await Notification.requestPermission();
    }

    console.log('Permissão de notificação:', permissao);
    return permissao === 'granted';
  } catch (error) {
    console.error('Erro ao pedir permissão de notificações:', error);
    return false;
  }
};

// Verificar se já tem permissão
export const temPermissao = () => {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted';
};

// Enviar notificação local
export const enviarNotificacao = (titulo, opcoes = {}) => {
  if (!temPermissao()) {
    console.log('Sem permissão para notificações');
    return null;
  }

  const opcoesDefault = {
    icon: '/logos/VITALIS_LOGO_V3.png',
    badge: '/logos/VITALIS_LOGO_V3.png',
    vibrate: [100, 50, 100],
    tag: 'vitalis-notification',
    requireInteraction: false,
    ...opcoes
  };

  return new Notification(titulo, opcoesDefault);
};

// Notificações pré-definidas para Vitalis
export const NOTIFICACOES = {
  // Lembretes de água
  agua: {
    titulo: '💧 Hora de beber água!',
    corpo: 'Já bebeste água nas últimas 2 horas? Mantém-te hidratada!',
    tag: 'vitalis-agua'
  },

  // Lembretes de refeição
  pequenoAlmoco: {
    titulo: '🌅 Bom dia! Pequeno-almoço',
    corpo: 'Começa o dia com energia. Não te esqueças do pequeno-almoço!',
    tag: 'vitalis-refeicao'
  },
  almoco: {
    titulo: '🍽️ Hora do almoço',
    corpo: 'Pausa para nutrir o corpo. Lembra-te das porções!',
    tag: 'vitalis-refeicao'
  },
  jantar: {
    titulo: '🌙 Hora do jantar',
    corpo: 'Última refeição do dia. Mantém leve e nutritivo.',
    tag: 'vitalis-refeicao'
  },

  // Lembrete de check-in
  checkin: {
    titulo: '✅ Check-in diário',
    corpo: 'Como foi o teu dia? Faz o check-in para manter o streak!',
    tag: 'vitalis-checkin'
  },

  // Lembrete de treino
  treino: {
    titulo: '🏃‍♀️ Dia de treino!',
    corpo: 'Hoje é dia de mexer o corpo. Vamos lá!',
    tag: 'vitalis-treino'
  },

  // Jejum
  jejumFim: {
    titulo: '⏱️ Janela alimentar aberta!',
    corpo: 'O teu período de jejum terminou. Podes comer!',
    tag: 'vitalis-jejum'
  },
  jejumInicio: {
    titulo: '🔒 Início do jejum',
    corpo: 'Janela alimentar fechada. Foco e disciplina!',
    tag: 'vitalis-jejum'
  },

  // Motivação
  motivacao: {
    titulo: '✨ Lembra-te...',
    corpo: 'Cada escolha consciente te aproxima da melhor versão de ti!',
    tag: 'vitalis-motivacao'
  },

  // Streak
  streak: {
    titulo: '🔥 Mantém o streak!',
    corpo: 'Não quebre a sequência. Regista algo hoje!',
    tag: 'vitalis-streak'
  }
};

// Agendar notificação (usando setTimeout para demo - em produção usaria service worker)
export const agendarNotificacao = (tipo, horaMinutos) => {
  if (!temPermissao()) return null;

  const notif = NOTIFICACOES[tipo];
  if (!notif) return null;

  const agora = new Date();
  const [hora, minutos] = horaMinutos.split(':').map(Number);

  const alvo = new Date();
  alvo.setHours(hora, minutos, 0, 0);

  // Se já passou, agenda para amanhã
  if (alvo <= agora) {
    alvo.setDate(alvo.getDate() + 1);
  }

  const delay = alvo - agora;

  const timeoutId = setTimeout(() => {
    enviarNotificacao(notif.titulo, {
      body: notif.corpo,
      tag: notif.tag
    });
  }, delay);

  return timeoutId;
};

// Configuração de lembretes por defeito
export const LEMBRETES_DEFAULT = [
  { tipo: 'agua', hora: '09:00', activo: true },
  { tipo: 'agua', hora: '11:00', activo: true },
  { tipo: 'agua', hora: '14:00', activo: true },
  { tipo: 'agua', hora: '16:00', activo: true },
  { tipo: 'agua', hora: '19:00', activo: true },
  { tipo: 'pequenoAlmoco', hora: '07:30', activo: true },
  { tipo: 'almoco', hora: '12:30', activo: true },
  { tipo: 'jantar', hora: '19:30', activo: true },
  { tipo: 'checkin', hora: '21:00', activo: true },
];

// Guardar configuração de lembretes
export const guardarLembretes = (lembretes) => {
  localStorage.setItem('vitalis-lembretes', JSON.stringify(lembretes));
};

// Carregar configuração de lembretes
export const carregarLembretes = () => {
  const saved = localStorage.getItem('vitalis-lembretes');
  return saved ? JSON.parse(saved) : LEMBRETES_DEFAULT;
};

// Activar todos os lembretes configurados
export const activarLembretes = () => {
  const lembretes = carregarLembretes();
  const timeouts = [];

  lembretes.forEach(lembrete => {
    if (lembrete.activo) {
      const timeoutId = agendarNotificacao(lembrete.tipo, lembrete.hora);
      if (timeoutId) timeouts.push(timeoutId);
    }
  });

  return timeouts;
};

// Hook para usar notificações em React
export const useNotificacoes = () => {
  const [permissao, setPermissao] = React.useState(
    notificacoesSuportadas() ? Notification.permission : 'denied'
  );

  const pedir = async () => {
    const resultado = await pedirPermissao();
    setPermissao(resultado ? 'granted' : 'denied');
    return resultado;
  };

  return {
    permissao,
    temPermissao: permissao === 'granted',
    pedirPermissao: pedir,
    enviar: enviarNotificacao,
    suportado: notificacoesSuportadas()
  };
};

// Importar React para o hook
import React from 'react';

export default {
  notificacoesSuportadas,
  pedirPermissao,
  temPermissao,
  enviarNotificacao,
  agendarNotificacao,
  NOTIFICACOES,
  LEMBRETES_DEFAULT,
  guardarLembretes,
  carregarLembretes,
  activarLembretes,
  useNotificacoes
};
