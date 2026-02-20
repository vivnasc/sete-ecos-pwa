import React from 'react'
import NotificacoesModule from '../shared/NotificacoesModule'
import { useI18n } from '../../contexts/I18nContext'

/**
 * NOTIFICACOES AURORA — Config de lembretes da Aurora
 * Lembretes para check-in mensal, ritual matinal,
 * mentoria semanal e renovacao anual
 */

export default function NotificacoesAurora() {
  const { t } = useI18n()

  const config = {
    title: t('aurora.notificacoes.title'),
    reminders: [
      {
        id: 'checkin_mensal',
        label: t('aurora.notificacoes.checkin_label'),
        description: t('aurora.notificacoes.checkin_desc'),
        defaultTime: '10:00',
        defaultEnabled: true
      },
      {
        id: 'ritual_matinal',
        label: t('aurora.notificacoes.ritual_label'),
        description: t('aurora.notificacoes.ritual_desc'),
        defaultTime: '07:00',
        defaultEnabled: true
      },
      {
        id: 'mentoria_semanal',
        label: t('aurora.notificacoes.mentoria_label'),
        description: t('aurora.notificacoes.mentoria_desc'),
        defaultTime: '18:00',
        defaultEnabled: false
      },
      {
        id: 'renovacao_anual',
        label: t('aurora.notificacoes.renovacao_label'),
        description: t('aurora.notificacoes.renovacao_desc'),
        defaultTime: '09:00',
        defaultEnabled: false
      }
    ]
  }

  return <NotificacoesModule eco="aurora" config={config} />
}
