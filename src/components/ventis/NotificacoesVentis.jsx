import React from 'react'
import NotificacoesModule from '../shared/NotificacoesModule'

/**
 * NOTIFICACOES VENTIS — Config de lembretes do Ventis
 */

const VENTIS_NOTIFICACOES_CONFIG = {
  title: 'Lembretes Ventis',
  reminders: [
    {
      id: 'energia_manha',
      label: 'Check-in Energia Manha',
      description: 'Como esta a tua energia ao acordar?',
      defaultTime: '08:00',
      defaultEnabled: true
    },
    {
      id: 'energia_tarde',
      label: 'Check-in Energia Tarde',
      description: 'Como esta a tua energia agora?',
      defaultTime: '14:00',
      defaultEnabled: true
    },
    {
      id: 'energia_noite',
      label: 'Check-in Energia Noite',
      description: 'Como terminou o teu dia?',
      defaultTime: '21:00',
      defaultEnabled: true
    },
    {
      id: 'pausa',
      label: 'Hora da Pausa',
      description: 'Momento para uma micro-pausa consciente',
      defaultTime: '11:00',
      defaultEnabled: false
    },
    {
      id: 'movimento',
      label: 'Movimento do Dia',
      description: 'Lembrete para mover o corpo',
      defaultTime: '17:00',
      defaultEnabled: false
    }
  ]
}

export default function NotificacoesVentis() {
  return <NotificacoesModule eco="ventis" config={VENTIS_NOTIFICACOES_CONFIG} />
}
