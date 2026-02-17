import React from 'react'
import NotificacoesModule from '../shared/NotificacoesModule'

/**
 * NOTIFICACOES ECOA — Config de lembretes do Ecoa
 */

const ECOA_NOTIFICACOES_CONFIG = {
  title: 'Lembretes Ecoa',
  reminders: [
    {
      id: 'micro_voz',
      label: 'Micro-Voz Diaria',
      description: 'Exercicio diario de recuperacao de voz',
      defaultTime: '09:00',
      defaultEnabled: true
    },
    {
      id: 'afirmacao',
      label: 'Afirmacao do Dia',
      description: 'Repete as tuas afirmacoes em voz alta',
      defaultTime: '08:00',
      defaultEnabled: true
    },
    {
      id: 'diario',
      label: 'Diario de Voz',
      description: 'Momento para escrever o que a tua voz quer dizer',
      defaultTime: '21:00',
      defaultEnabled: false
    },
    {
      id: 'voz_recuperada',
      label: 'Celebrar Voz',
      description: 'Registar quando disseste algo que normalmente calarias',
      defaultTime: '20:00',
      defaultEnabled: false
    }
  ]
}

export default function NotificacoesEcoa() {
  return <NotificacoesModule eco="ecoa" config={ECOA_NOTIFICACOES_CONFIG} />
}
