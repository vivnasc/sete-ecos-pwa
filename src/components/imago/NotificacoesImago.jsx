import React from 'react'
import NotificacoesModule from '../shared/NotificacoesModule'

/**
 * NOTIFICAÇÕES IMAGO — Config de lembretes do Imago
 * Lembretes para reflexão diária, insights semanais,
 * meditações e revisão trimestral de valores
 */

const IMAGO_NOTIFICACOES_CONFIG = {
  title: 'Lembretes Imago',
  reminders: [
    {
      id: 'reflexao_diaria',
      label: 'Reflexão Diária',
      description: 'Quem és tu hoje? Momento de auto-observação',
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
      label: 'Lembrete de Meditação',
      description: 'Momento para meditação de essência',
      defaultTime: '07:00',
      defaultEnabled: false
    },
    {
      id: 'revisao_valores',
      label: 'Revisão Trimestral de Valores',
      description: 'Os teus valores continuam actuais?',
      defaultTime: '10:00',
      defaultEnabled: false
    }
  ]
}

export default function NotificacoesImago() {
  return <NotificacoesModule eco="imago" config={IMAGO_NOTIFICACOES_CONFIG} />
}
