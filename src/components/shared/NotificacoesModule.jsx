import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { getEcoTheme } from '../../lib/shared/subscriptionPlans'
import { g } from '../../utils/genero'
import ModuleHeader from './ModuleHeader'

/**
 * NOTIFICACOES MODULE — Config de notificacoes generico para qualquer eco
 *
 * Cada eco pode definir os seus tipos de lembretes.
 *
 * Uso:
 * <NotificacoesModule
 *   eco="serena"
 *   userId={userId}
 *   config={{
 *     title: 'Lembretes Serena',
 *     reminders: [
 *       { id: 'checkin_manha', label: 'Check-in da Manha', defaultTime: '08:00', defaultEnabled: true },
 *       { id: 'respiracao', label: 'Lembrete de Respiracao', defaultTime: '15:00', defaultEnabled: false },
 *     ]
 *   }}
 * />
 */

export default function NotificacoesModule({ eco, userId, config }) {
  const [settings, setSettings] = useState({})
  const [saved, setSaved] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState('default')
  const theme = getEcoTheme(eco)

  // Inicializar defaults
  useEffect(() => {
    const defaults = {}
    for (const reminder of config.reminders) {
      defaults[reminder.id] = {
        enabled: reminder.defaultEnabled ?? false,
        time: reminder.defaultTime || '09:00'
      }
    }
    setSettings(defaults)

    // Carregar settings guardados
    const stored = localStorage.getItem(`${eco}_notification_settings`)
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch {}
    }

    // Verificar permissao de notificacoes
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission)
    }
  }, [eco, config.reminders])

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)
    }
  }

  const toggleReminder = (id) => {
    setSettings(prev => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id]?.enabled }
    }))
    setSaved(false)
  }

  const updateTime = (id, time) => {
    setSettings(prev => ({
      ...prev,
      [id]: { ...prev[id], time }
    }))
    setSaved(false)
  }

  const handleSave = () => {
    localStorage.setItem(`${eco}_notification_settings`, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen" style={{ background: theme.colorDark }}>
      <ModuleHeader eco={eco} title={config.title || 'Notificacoes'} compact />

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Permissao do browser */}
        {permissionStatus !== 'granted' && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-amber-200 text-sm mb-3">
              Para receberes lembretes, precisas de activar as notificacoes.
            </p>
            <button
              onClick={requestPermission}
              className="w-full py-2.5 rounded-lg bg-amber-500/20 text-amber-200 text-sm font-medium hover:bg-amber-500/30 transition-colors"
            >
              Activar Notificacoes
            </button>
          </div>
        )}

        {/* Lista de lembretes */}
        <div className="space-y-3">
          {config.reminders.map((reminder) => {
            const setting = settings[reminder.id] || {}
            return (
              <div
                key={reminder.id}
                className="bg-white/5 rounded-xl border border-white/10 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white text-sm font-medium">{reminder.label}</p>
                    {reminder.description && (
                      <p className="text-white/40 text-xs mt-0.5">{reminder.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    className={`w-12 h-6 rounded-full transition-all relative ${
                      setting.enabled ? '' : 'bg-white/10'
                    }`}
                    style={setting.enabled ? { background: theme.color } : {}}
                    role="switch"
                    aria-checked={setting.enabled}
                    aria-label={`${setting.enabled ? 'Desactivar' : 'Activar'} ${reminder.label}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {setting.enabled && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-white/40 text-xs">Hora:</span>
                    <input
                      type="time"
                      value={setting.time || '09:00'}
                      onChange={(e) => updateTime(reminder.id, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                      aria-label={`Hora do lembrete ${reminder.label}`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Botao guardar */}
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
          style={{ background: saved ? '#22c55e' : theme.color }}
        >
          {saved ? 'Guardado!' : 'Guardar Preferencias'}
        </button>
      </div>
    </div>
  )
}
