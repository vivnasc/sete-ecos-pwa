import React from 'react'
import NotificacoesModule from '../shared/NotificacoesModule'

/**
 * NOTIFICACOES IMAGO — Config de lembretes do Imago
 * Lembretes para reflexao diaria, insights semanais,
 * meditacoes e revisao trimestral de valores
 */

const IMAGO_NOTIFICACOES_CONFIG = {
  title: 'Lembretes Imago',
  reminders: [
    {
      id: 'reflexao_diaria',
      label: 'Reflexao Diaria',
      description: 'Quem es tu hoje? Momento de auto-observacao',
      defaultTime: '08:00',
      defaultEnabled: true
    },
    {
      id: 'insights_semanais',
      label: 'Insights Semanais',
      description: 'Resumo semanal do teu mapa interior',
      defaultTime: '20:00',
      defaultEnabled: true
    },
    {
      id: 'meditacao',
      label: 'Lembrete de Meditacao',
      description: 'Momento para meditacao de essencia',
      defaultTime: '07:00',
      defaultEnabled: false
    },
    {
      id: 'revisao_valores',
      label: 'Revisao Trimestral de Valores',
      description: 'Os teus valores continuam actuais?',
      defaultTime: '10:00',
      defaultEnabled: false
    }
  ]
}

export default function NotificacoesImago() {
  return <NotificacoesModule eco="imago" config={IMAGO_NOTIFICACOES_CONFIG} />
}
