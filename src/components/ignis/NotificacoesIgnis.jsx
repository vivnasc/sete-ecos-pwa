import React from 'react'
import NotificacoesModule from '../shared/NotificacoesModule'

/**
 * NOTIFICACOES IGNIS — Config de lembretes do Ignis
 */

const IGNIS_NOTIFICACOES_CONFIG = {
  title: 'Lembretes Ignis',
  reminders: [
    {
      id: 'escolhas_manha',
      label: 'Escolhas da Manha',
      description: 'Define as tuas 3 escolhas conscientes',
      defaultTime: '08:00',
      defaultEnabled: true
    },
    {
      id: 'foco',
      label: 'Hora de Foco',
      description: 'Momento para foco consciente',
      defaultTime: '10:00',
      defaultEnabled: false
    },
    {
      id: 'review_noite',
      label: 'Review da Noite',
      description: 'Revisa as tuas escolhas do dia',
      defaultTime: '21:00',
      defaultEnabled: true
    },
    {
      id: 'conquistas',
      label: 'Diario de Conquistas',
      description: 'Regista as conquistas do dia',
      defaultTime: '20:00',
      defaultEnabled: false
    },
    {
      id: 'desafio',
      label: 'Desafio Semanal',
      description: 'Novo desafio de fogo disponivel',
      defaultTime: '09:00',
      defaultEnabled: false
    }
  ]
}

export default function NotificacoesIgnis() {
  return <NotificacoesModule eco="ignis" config={IGNIS_NOTIFICACOES_CONFIG} />
}
