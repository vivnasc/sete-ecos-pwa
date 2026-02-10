// src/utils/notifications.js
// Sistema de notificações para Vitalis PWA

import React from 'react';

// Verificar suporte a notificações
export const notificacoesSuportadas = () => {
  return 'Notification' in window;
};

// Pedir permissão para notificações
export const pedirPermissao = async () => {
  if (!('Notification' in window)) {
    console.log('Notificações não suportadas neste browser');
    return false;
  }

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  try {
    const permissao = await Notification.requestPermission();
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

// Enviar notificação local — usa Service Worker quando disponível (mais fiável em PWA)
export const enviarNotificacao = async (titulo, opcoes = {}) => {
  if (!temPermissao()) {
    console.log('Sem permissão para notificações');
    return null;
  }

  const opcoesCompletas = {
    icon: '/logos/VITALIS_LOGO_V3.png',
    badge: '/logos/VITALIS_LOGO_V3.png',
    vibrate: [100, 50, 100],
    tag: opcoes.tag || 'vitalis-notification',
    requireInteraction: false,
    ...opcoes
  };

  // Tentar via Service Worker (funciona melhor em PWA, especialmente em background)
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(titulo, opcoesCompletas);
        return true;
      }
    }
  } catch (err) {
    console.log('SW notification fallback:', err.message);
  }

  // Fallback: Notification API directa
  try {
    const notif = new Notification(titulo, opcoesCompletas);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return notif;
  } catch (err) {
    console.error('Erro ao enviar notificação:', err);
    return null;
  }
};

// Notificações pré-definidas para Vitalis
export const NOTIFICACOES = {
  agua: {
    titulo: '💧 Hora de beber água!',
    corpo: 'Já bebeste água nas últimas 2 horas? Mantém-te hidratada!',
    tag: 'vitalis-agua'
  },
  pequenoAlmoco: {
    titulo: '🌅 Bom dia! Pequeno-almoço',
    corpo: 'Começa o dia com energia. Não te esqueças do pequeno-almoço!',
    tag: 'vitalis-refeicao-pa'
  },
  almoco: {
    titulo: '🍽️ Hora do almoço',
    corpo: 'Pausa para nutrir o corpo. Lembra-te das porções com a palma da mão!',
    tag: 'vitalis-refeicao-almoco'
  },
  jantar: {
    titulo: '🌙 Hora do jantar',
    corpo: 'Última refeição do dia. Mantém leve e nutritivo.',
    tag: 'vitalis-refeicao-jantar'
  },
  prepAlmoco: {
    titulo: '🔪 Começa a preparar o almoço',
    corpo: 'Daqui a 30 min é hora de almoçar. Prepara agora para não sair do plano!',
    tag: 'vitalis-prep-almoco'
  },
  prepJantar: {
    titulo: '🔪 Começa a preparar o jantar',
    corpo: 'Daqui a 30 min é hora de jantar. Prepara agora!',
    tag: 'vitalis-prep-jantar'
  },
  checkin: {
    titulo: '✅ Check-in diário',
    corpo: 'Como foi o teu dia? Faz o check-in para manter o streak!',
    tag: 'vitalis-checkin'
  },
  treino: {
    titulo: '🏃‍♀️ Dia de treino!',
    corpo: 'Hoje é dia de mexer o corpo. Vamos lá!',
    tag: 'vitalis-treino'
  },
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
  motivacao: {
    titulo: '✨ Lembra-te...',
    corpo: 'Cada escolha consciente te aproxima da melhor versão de ti!',
    tag: 'vitalis-motivacao'
  },
  streak: {
    titulo: '🔥 Mantém o streak!',
    corpo: 'Não quebre a sequência. Regista algo hoje!',
    tag: 'vitalis-streak'
  }
};

// Guardar IDs dos timeouts activos para poder cancelar
let timeoutsActivos = [];

// Cancelar todos os lembretes agendados
export const cancelarLembretes = () => {
  timeoutsActivos.forEach(id => clearTimeout(id));
  timeoutsActivos = [];
};

// Agendar notificação para uma hora específica hoje (ou amanhã se já passou)
export const agendarNotificacao = (tipo, horaMinutos) => {
  if (!temPermissao()) return null;

  const notif = NOTIFICACOES[tipo];
  if (!notif) return null;

  const agora = new Date();
  const [hora, minutos] = horaMinutos.split(':').map(Number);

  const alvo = new Date();
  alvo.setHours(hora, minutos, 0, 0);

  // Se já passou hoje, não agenda (será reagendado na próxima abertura da app)
  if (alvo <= agora) return null;

  const delay = alvo - agora;

  const timeoutId = setTimeout(() => {
    enviarNotificacao(notif.titulo, {
      body: notif.corpo,
      tag: notif.tag
    });
  }, delay);

  return timeoutId;
};

// Configuração de lembretes por defeito — inclui prep reminders
export const LEMBRETES_DEFAULT = [
  { tipo: 'agua', hora: '09:00', activo: true, label: 'Água manhã' },
  { tipo: 'agua', hora: '11:00', activo: true, label: 'Água meio-dia' },
  { tipo: 'agua', hora: '14:00', activo: true, label: 'Água tarde' },
  { tipo: 'agua', hora: '16:00', activo: true, label: 'Água fim-tarde' },
  { tipo: 'agua', hora: '19:00', activo: true, label: 'Água noite' },
  { tipo: 'pequenoAlmoco', hora: '07:30', activo: true, label: 'Pequeno-almoço' },
  { tipo: 'prepAlmoco', hora: '12:00', activo: true, label: 'Preparar almoço' },
  { tipo: 'almoco', hora: '12:30', activo: true, label: 'Almoço' },
  { tipo: 'prepJantar', hora: '19:00', activo: true, label: 'Preparar jantar' },
  { tipo: 'jantar', hora: '19:30', activo: true, label: 'Jantar' },
  { tipo: 'checkin', hora: '21:00', activo: true, label: 'Check-in diário' },
];

// Guardar configuração de lembretes
export const guardarLembretes = (lembretes) => {
  localStorage.setItem('vitalis-lembretes', JSON.stringify(lembretes));
};

// Carregar configuração de lembretes (migra formato antigo sem label)
export const carregarLembretes = () => {
  const saved = localStorage.getItem('vitalis-lembretes');
  if (!saved) return LEMBRETES_DEFAULT;

  try {
    const parsed = JSON.parse(saved);
    // Migrar: se lembretes antigos não têm label, adicionar
    return parsed.map(l => ({
      ...l,
      label: l.label || NOTIFICACOES[l.tipo]?.titulo?.replace(/^[^\s]+\s/, '') || l.tipo
    }));
  } catch {
    return LEMBRETES_DEFAULT;
  }
};

// Activar todos os lembretes configurados — chamar a cada abertura da app
export const activarLembretes = () => {
  // Cancelar anteriores para evitar duplicados
  cancelarLembretes();

  if (!temPermissao()) return [];

  const lembretes = carregarLembretes();

  lembretes.forEach(lembrete => {
    if (lembrete.activo) {
      const timeoutId = agendarNotificacao(lembrete.tipo, lembrete.hora);
      if (timeoutId) timeoutsActivos.push(timeoutId);
    }
  });

  const count = timeoutsActivos.length;
  if (count > 0) {
    console.log(`Vitalis: ${count} lembretes agendados para hoje`);
  }

  return timeoutsActivos;
};

// Contar lembretes activos restantes para hoje
export const contarLembretesHoje = () => {
  if (!temPermissao()) return 0;

  const lembretes = carregarLembretes();
  const agora = new Date();

  return lembretes.filter(l => {
    if (!l.activo) return false;
    const [hora, min] = l.hora.split(':').map(Number);
    const alvo = new Date();
    alvo.setHours(hora, min, 0, 0);
    return alvo > agora;
  }).length;
};

// Hook para usar notificações em React
export const useNotificacoes = () => {
  const [permissao, setPermissao] = React.useState(
    notificacoesSuportadas() ? Notification.permission : 'denied'
  );

  const pedir = async () => {
    const resultado = await pedirPermissao();
    setPermissao(resultado ? 'granted' : 'denied');
    if (resultado) {
      // Activar lembretes imediatamente após permissão concedida
      activarLembretes();
    }
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
  cancelarLembretes,
  contarLembretesHoje,
  useNotificacoes
};
