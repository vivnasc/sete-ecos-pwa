'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor, Bell, Download, Upload, RotateCcw, Cloud, CloudOff, Check, AlertCircle } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/components/AuthGate'
import { getProfile, saveProfile, type Profile } from '@/lib/profile'
import BackButton from '@/components/BackButton'
import { exportarTudo, importarTudo, limparTudoLocal } from '@/lib/storage'
import { hidratarTudo, lastSyncTime } from '@/lib/sync'
import { syncProfile } from '@/lib/sync'
import { getLembretes, saveLembretes, type Lembrete, pedirPermissao, permissaoActual, reagendarLembretes, notificacaoSuportada, LEMBRETES_DEFAULT } from '@/lib/notifications'
import { cn } from '@/lib/utils'

export default function DefinicoesPage() {
  const { theme, setTheme } = useTheme()
  const { configurado, session } = useAuth()
  const [perfil, setPerfil] = useState<Profile>(getProfile())
  const [lembretes, setLembretes] = useState<Lembrete[]>(LEMBRETES_DEFAULT)
  const [permissao, setPermissao] = useState<NotificationPermission>('default')
  const [sincronizando, setSincronizando] = useState(false)
  const [ultimoSync, setUltimoSync] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    setPerfil(getProfile())
    setLembretes(getLembretes())
    setPermissao(permissaoActual())
    setUltimoSync(lastSyncTime())
  }, [])

  const guardarPerfil = (p: Partial<Profile>) => {
    const novo = saveProfile(p)
    setPerfil(novo)
    void syncProfile(novo as unknown as Record<string, unknown>).catch(() => {})
  }

  const toggleLembrete = (id: string) => {
    const novos = lembretes.map(l => l.id === id ? { ...l, ativo: !l.ativo } : l)
    setLembretes(novos)
    saveLembretes(novos)
    reagendarLembretes()
  }

  const updateLembreteHora = (id: string, hora: string) => {
    const novos = lembretes.map(l => l.id === id ? { ...l, hora } : l)
    setLembretes(novos)
    saveLembretes(novos)
    reagendarLembretes()
  }

  const ativarNotificacoes = async () => {
    const r = await pedirPermissao()
    setPermissao(r)
    if (r === 'granted') {
      reagendarLembretes()
      setInfo('lembretes activos')
    }
  }

  const sincronizarAgora = async () => {
    setSincronizando(true)
    const r = await hidratarTudo()
    if (r.ok) {
      setUltimoSync(lastSyncTime())
      setInfo('sincronizado.')
    } else {
      setInfo(r.erro ?? 'erro')
    }
    setSincronizando(false)
  }

  const exportar = () => {
    const data = exportarTudo()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reset-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const ok = importarTudo(ev.target?.result as string)
      setInfo(ok ? 'dados importados.' : 'ficheiro inválido.')
    }
    reader.readAsText(file)
  }

  const apagarLocal = () => {
    if (!window.confirm('Apagar dados locais? Os dados na nuvem (Supabase) ficam.')) return
    limparTudoLocal()
    setInfo('local limpo.')
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <BackButton />

      <header className="space-y-2 pt-4">
        <p className="label-soft">definições</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">ajustar</h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
      </header>

      {info ? <p className="text-soft text-center text-[13px]">{info}</p> : null}

      {/* PERFIL */}
      <section className="space-y-3">
        <span className="label-cap">Perfil</span>
        <div className="card-solid space-y-4">
          <Field label="Nome">
            <input
              type="text"
              value={perfil.nome}
              onChange={e => guardarPerfil({ nome: e.target.value })}
              className="input-base"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Acordar">
              <input
                type="time"
                value={perfil.acordaTipico}
                onChange={e => guardarPerfil({ acordaTipico: e.target.value })}
                className="input-base"
              />
            </Field>
            <Field label="Deitar">
              <input
                type="time"
                value={perfil.deitaTipico}
                onChange={e => guardarPerfil({ deitaTipico: e.target.value })}
                className="input-base"
              />
            </Field>
          </div>
        </div>
      </section>

      {/* TEMA */}
      <section className="space-y-3">
        <span className="label-cap">Tema</span>
        <div className="card-solid">
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: 'light', l: 'claro', icon: Sun },
              { v: 'dark', l: 'escuro', icon: Moon },
              { v: 'system', l: 'sistema', icon: Monitor }
            ].map(o => {
              const I = o.icon
              return (
                <button
                  key={o.v}
                  onClick={() => setTheme(o.v as 'light' | 'dark' | 'system')}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg py-3 transition-elegant',
                    theme === o.v ? 'bg-tinta text-[var(--bg)]' : 'shadow-hair hover:shadow-hair-strong'
                  )}
                >
                  <I size={16} strokeWidth={1.4} />
                  <span className="text-[11px]">{o.l}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* LEMBRETES */}
      {notificacaoSuportada() ? (
        <section className="space-y-3">
          <span className="label-cap">Lembretes</span>
          <div className="card-solid space-y-4">
            {permissao === 'default' && (
              <div className="rounded-lg bg-ouro/10 p-3">
                <p className="text-soft text-[13px] leading-relaxed">
                  os lembretes funcionam quando a app está aberta no telemóvel. ativa para começar.
                </p>
                <button onClick={ativarNotificacoes} className="btn-ouro mt-3 w-full text-[12px]">
                  <Bell size={14} strokeWidth={1.4} /> activar
                </button>
              </div>
            )}
            {permissao === 'denied' && (
              <div className="rounded-lg bg-terracota/10 p-3 text-[12px] text-terracota">
                <AlertCircle size={14} strokeWidth={1.4} className="mb-1 inline" /> notificações bloqueadas no browser. ativa nas definições do telemóvel.
              </div>
            )}
            <ul className="divide-y divide-[var(--hair)]">
              {lembretes.map(l => (
                <li key={l.id} className="flex items-center gap-3 py-3">
                  <input
                    type="time"
                    value={l.hora}
                    onChange={e => updateLembreteHora(l.id, e.target.value)}
                    disabled={!l.ativo}
                    className="w-20 rounded bg-transparent text-[14px] tnum text-tinta dark:text-creme disabled:opacity-50"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px]">{l.titulo}</p>
                    <p className="text-faint text-[11px]">{l.corpo}</p>
                  </div>
                  <Toggle ativo={l.ativo} onChange={() => toggleLembrete(l.id)} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* SUPABASE SYNC */}
      <section className="space-y-3">
        <span className="label-cap">Sincronização</span>
        <div className="card-solid space-y-3">
          <div className="flex items-center gap-3">
            {configurado && session ? (
              <>
                <Cloud size={18} strokeWidth={1.4} className="text-oliva" />
                <div className="flex-1">
                  <p className="text-[13px]">activa · {session.user.email}</p>
                  <p className="text-faint text-[11px]">
                    último sync: {ultimoSync ? new Date(ultimoSync).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'nunca'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <CloudOff size={18} strokeWidth={1.4} className="text-faint" />
                <p className="text-faint text-[13px] flex-1">
                  {configurado ? 'sem sessão' : 'supabase não configurado'}
                </p>
              </>
            )}
          </div>
          {configurado && session ? (
            <button onClick={sincronizarAgora} disabled={sincronizando} className="btn-outline w-full text-[12px]">
              {sincronizando ? '...' : 'sincronizar agora'}
            </button>
          ) : null}
        </div>
      </section>

      {/* BACKUP */}
      <section className="space-y-3">
        <span className="label-cap">Backup local</span>
        <div className="card-solid space-y-2">
          <button onClick={exportar} className="btn-outline w-full">
            <Download size={14} strokeWidth={1.4} /> exportar JSON
          </button>
          <label className="btn-outline block w-full cursor-pointer text-center">
            <Upload size={14} strokeWidth={1.4} className="-mt-0.5 mr-1 inline-block" /> importar JSON
            <input type="file" accept=".json,application/json" onChange={importar} className="hidden" />
          </label>
          <button onClick={apagarLocal} className="btn-ghost w-full text-terracota">
            <RotateCcw size={14} strokeWidth={1.4} /> limpar dados locais
          </button>
        </div>
      </section>

      <p className="text-faint pb-4 pt-2 text-center text-[10px]">
        fénixfit v1.0 · {new Date().toISOString().slice(0, 10)}
      </p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-cap mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}

function Toggle({ ativo, onChange }: { ativo: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ativo}
      onClick={onChange}
      className={cn(
        'relative h-5 w-9 shrink-0 rounded-full transition-elegant',
        ativo ? 'bg-tinta dark:bg-ouro' : 'bg-[var(--hair-strong)]'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-[var(--bg)] transition-elegant',
          ativo ? 'left-[18px]' : 'left-0.5'
        )}
      />
    </button>
  )
}
