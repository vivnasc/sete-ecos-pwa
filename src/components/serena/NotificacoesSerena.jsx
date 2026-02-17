import React from 'react'
import NotificacoesModule from '../shared/NotificacoesModule'

/**
 * NOTIFICACOES SERENA — Config de lembretes do Serena
 */

const SERENA_NOTIFICACOES_CONFIG = {
  title: 'Lembretes Serena',
  reminders: [
    {
      id: 'checkin_manha',
      label: 'Check-in da Manha',
      description: 'Como acordaste emocionalmente?',
      defaultTime: '08:00',
      defaultEnabled: true
    },
    {
      id: 'checkin_tarde',
      label: 'Check-in da Tarde',
      description: 'Pausa para sentir como estas',
      defaultTime: '14:00',
      defaultEnabled: false
    },
    {
      id: 'checkin_noite',
      label: 'Reflexao da Noite',
      description: 'Como foi o teu dia emocional?',
      defaultTime: '21:00',
      defaultEnabled: true
    },
    {
      id: 'respiracao',
      label: 'Lembrete de Respiracao',
      description: 'Momento para respirar conscientemente',
      defaultTime: '15:00',
      defaultEnabled: false
    },
    {
      id: 'pratica_diaria',
      label: 'Pratica de Fluidez',
      description: 'Uma micro-pratica do elemento agua',
      defaultTime: '10:00',
      defaultEnabled: false
    }
  ]
}

export default function NotificacoesSerena() {
  return (
    <NotificacoesModule
      eco="serena"
      config={SERENA_NOTIFICACOES_CONFIG}
    />
  )
}
