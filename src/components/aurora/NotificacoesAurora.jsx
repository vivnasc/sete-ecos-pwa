import React from 'react'
import NotificacoesModule from '../shared/NotificacoesModule'

/**
 * NOTIFICACOES AURORA — Config de lembretes da Aurora
 * Lembretes para check-in mensal, ritual matinal,
 * mentoria semanal e renovacao anual
 */

const AURORA_NOTIFICACOES_CONFIG = {
  title: 'Lembretes Aurora',
  reminders: [
    {
      id: 'checkin_mensal',
      label: 'Check-in Mensal',
      description: 'Lembrete para o teu check-in de manutencao mensal',
      defaultTime: '10:00',
      defaultEnabled: true
    },
    {
      id: 'ritual_matinal',
      label: 'Ritual Matinal Aurora',
      description: 'Comeca o dia com o ritual de integracao',
      defaultTime: '07:00',
      defaultEnabled: true
    },
    {
      id: 'mentoria_semanal',
      label: 'Lembrete de Mentoria',
      description: 'Partilhar sabedoria com a comunidade',
      defaultTime: '18:00',
      defaultEnabled: false
    },
    {
      id: 'renovacao_anual',
      label: 'Renovacao Anual',
      description: 'Renovar intencoes e celebrar mais um ano',
      defaultTime: '09:00',
      defaultEnabled: false
    }
  ]
}

export default function NotificacoesAurora() {
  return <NotificacoesModule eco="aurora" config={AURORA_NOTIFICACOES_CONFIG} />
}
