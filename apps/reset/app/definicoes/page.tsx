'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor, Bell, Download, Upload, RotateCcw, Cloud, CloudOff, Check, AlertCircle } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { PALETAS } from '@/lib/palettes'
import { useAuth } from '@/components/AuthGate'
import { getProfile, saveProfile, sugerirMetas, type Profile, type Metas } from '@/lib/profile'
import { pesoUltimo } from '@/lib/storage'
import BackButton from '@/components/BackButton'
import { exportarTudo, importarTudo, limparTudoLocal } from '@/lib/storage'
import { hidratarTudo, lastSyncTime } from '@/lib/sync'
import { syncProfile } from '@/lib/sync'
import { getLembretes, saveLembretes, type Lembrete, pedirPermissao, permissaoActual, reagendarLembretes, notificacaoSuportada, LEMBRETES_DEFAULT } from '@/lib/notifications'
import { ANCORAS_POOL, CATEGORIAS_LABEL, type Ancora, type CategoriaAncora } from '@/lib/data'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DefinicoesPage() {
  const { theme, setTheme, paleta, setPaleta } = useTheme()
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
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">Ajustar</h1>
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

      {/* ÂNCORAS */}
      <AncorasEditor perfil={perfil} setPerfil={setPerfil} />

      {/* METAS */}
      <MetasSection perfil={perfil} guardarPerfil={guardarPerfil} />

      {/* MODO VIAGEM */}
      <section className="space-y-3">
        <span className="label-cap">Modo viagem</span>
        <div className="card-solid flex items-start gap-3">
          <Toggle ativo={perfil.modoViagem} onChange={() => guardarPerfil({ modoViagem: !perfil.modoViagem })} />
          <div className="min-w-0 flex-1">
            <p className="font-serif text-[15px] tracking-editorial">
              {perfil.modoViagem ? 'em viagem · regras suaves' : 'rotina normal'}
            </p>
            <p className="text-faint text-[11.5px] mt-1 leading-relaxed">
              {perfil.modoViagem
                ? 'a coach sabe que estás fora. não cobra streak. propõe ajustes ao que é possível no contexto.'
                : 'liga quando estiveres fora. a coach amacia exigências e foca-te no que controlas.'}
            </p>
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

      {/* PALETA */}
      <section className="space-y-3">
        <span className="label-cap">Paleta</span>
        <div className="card-solid !p-3">
          <ul className="divide-y divide-[var(--hair)]">
            {Object.values(PALETAS).map(p => {
              const active = paleta === p.id
              return (
                <li key={p.id}>
                  <button
                    onClick={() => setPaleta(p.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-elegant active:scale-[0.99]',
                      active && 'bg-[var(--surface-soft)]'
                    )}
                  >
                    {/* Swatches */}
                    <div className="flex gap-1 shrink-0">
                      <span
                        className="h-7 w-7 rounded-md ring-1 ring-[var(--hair-strong)]"
                        style={{ background: p.light.bg }}
                        aria-hidden
                      />
                      <span
                        className="h-7 w-7 rounded-md"
                        style={{ background: p.light.ouro }}
                        aria-hidden
                      />
                      <span
                        className="h-7 w-7 rounded-md"
                        style={{ background: p.light.ink }}
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-[15px] tracking-editorial">{p.nome}</p>
                      <p className="text-faint text-[11px]">{p.descricao}</p>
                    </div>
                    {active ? (
                      <span className="text-[10px] uppercase tracking-cap text-ouro shrink-0">activa</span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        <p className="text-faint text-[11px] px-1 leading-relaxed">
          a paleta aplica-se à app inteira em segundos · combina com tema claro/escuro
        </p>
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

function MetasSection({ perfil, guardarPerfil }: { perfil: Profile; guardarPerfil: (p: Partial<Profile>) => void }) {
  const m = perfil.metas
  const [valor, setValor] = useState({
    calorias: m.calorias !== null ? String(m.calorias) : '',
    proteinaG: m.proteinaG !== null ? String(m.proteinaG) : '',
    carboG: m.carboG !== null ? String(m.carboG) : '',
    gorduraG: m.gorduraG !== null ? String(m.gorduraG) : ''
  })
  const [objectivo, setObjectivo] = useState<'manter' | 'perder_devagar' | 'perder' | 'ganhar'>('perder_devagar')
  const [actividade, setActividade] = useState<'sedentaria' | 'leve' | 'activa'>('leve')

  useEffect(() => {
    setValor({
      calorias: m.calorias !== null ? String(m.calorias) : '',
      proteinaG: m.proteinaG !== null ? String(m.proteinaG) : '',
      carboG: m.carboG !== null ? String(m.carboG) : '',
      gorduraG: m.gorduraG !== null ? String(m.gorduraG) : ''
    })
  }, [m.calorias, m.proteinaG, m.carboG, m.gorduraG])

  const guardar = (campo: keyof Metas, v: string) => {
    setValor(prev => ({ ...prev, [campo]: v }))
    const n = v === '' ? null : Number(v)
    if (v !== '' && (isNaN(n as number) || (n as number) < 0)) return
    guardarPerfil({ metas: { ...m, [campo]: n } })
  }

  const sugerir = () => {
    const peso = pesoUltimo() ?? perfil.pesoInicial
    if (!peso) {
      window.alert('precisa de pelo menos um peso registado para sugerir.')
      return
    }
    const sugestao = sugerirMetas({ pesoKg: peso, objectivo, actividade })
    setValor({
      calorias: String(sugestao.calorias),
      proteinaG: String(sugestao.proteinaG),
      carboG: String(sugestao.carboG),
      gorduraG: String(sugestao.gorduraG)
    })
    guardarPerfil({ metas: sugestao })
  }

  const limpar = () => {
    setValor({ calorias: '', proteinaG: '', carboG: '', gorduraG: '' })
    guardarPerfil({ metas: { calorias: null, proteinaG: null, carboG: null, gorduraG: null } })
  }

  return (
    <section className="space-y-3">
      <span className="label-cap">Metas diárias</span>
      <div className="card-solid space-y-4">
        <p className="text-faint text-[11.5px] leading-relaxed">
          tu defines o que faz sentido. ajusta com o tempo. a coach usa estes números como referência, não como regra.
        </p>

        <div className="grid grid-cols-4 gap-2">
          <Field label="kcal">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={valor.calorias}
              onChange={e => guardar('calorias', e.target.value)}
              placeholder="—"
              className="input-base text-center tnum"
            />
          </Field>
          <Field label="Prot · g">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={valor.proteinaG}
              onChange={e => guardar('proteinaG', e.target.value)}
              placeholder="—"
              className="input-base text-center tnum"
            />
          </Field>
          <Field label="Carb · g">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={valor.carboG}
              onChange={e => guardar('carboG', e.target.value)}
              placeholder="—"
              className="input-base text-center tnum"
            />
          </Field>
          <Field label="Gord · g">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={valor.gorduraG}
              onChange={e => guardar('gorduraG', e.target.value)}
              placeholder="—"
              className="input-base text-center tnum"
            />
          </Field>
        </div>

        <details className="rounded-lg bg-[var(--surface-soft)] p-3">
          <summary className="label-cap cursor-pointer">sugerir números</summary>
          <div className="space-y-3 pt-3">
            <Field label="Objectivo">
              <select
                value={objectivo}
                onChange={e => setObjectivo(e.target.value as typeof objectivo)}
                className="input-base"
              >
                <option value="manter">manter peso</option>
                <option value="perder_devagar">perder devagar</option>
                <option value="perder">perder</option>
                <option value="ganhar">ganhar massa</option>
              </select>
            </Field>
            <Field label="Actividade média">
              <select
                value={actividade}
                onChange={e => setActividade(e.target.value as typeof actividade)}
                className="input-base"
              >
                <option value="sedentaria">sedentária (sem treino)</option>
                <option value="leve">leve (treino 2-3×/sem)</option>
                <option value="activa">activa (treino 4+×/sem)</option>
              </select>
            </Field>
            <button
              onClick={sugerir}
              className="btn-primary w-full py-2.5 text-[12.5px]"
            >
              calcular sugestão
            </button>
            <p className="text-faint text-[10.5px] leading-relaxed">
              cálculo simples baseado em peso · 1.6g proteína/kg, 0.9g gordura/kg. ajusta depois pelos resultados.
            </p>
          </div>
        </details>

        {(m.calorias !== null || m.proteinaG !== null) ? (
          <button
            onClick={limpar}
            className="text-faint text-[11px] hover:text-terracota"
          >
            limpar metas
          </button>
        ) : null}
      </div>
    </section>
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

function AncorasEditor({ perfil, setPerfil }: { perfil: Profile; setPerfil: (p: Profile) => void }) {
  const [novoTitulo, setNovoTitulo] = useState('')
  const [novoDetalhe, setNovoDetalhe] = useState('')
  const [novaCategoria, setNovaCategoria] = useState<CategoriaAncora>('corpo')
  const [adicionando, setAdicionando] = useState(false)

  const activas = new Set(perfil.ancorasActivas ?? [])
  const todas: Ancora[] = [...ANCORAS_POOL, ...(perfil.ancorasCustom ?? [])]
  const porCategoria: Record<CategoriaAncora, Ancora[]> = { corpo: [], mente: [], emocao: [], mundo: [] }
  todas.forEach(a => {
    const cat = a.categoria ?? 'corpo'
    porCategoria[cat].push(a)
  })

  const toggle = (id: string) => {
    const novas = activas.has(id)
      ? perfil.ancorasActivas.filter(x => x !== id)
      : [...perfil.ancorasActivas, id]
    const novoPerfil = saveProfile({ ancorasActivas: novas })
    setPerfil(novoPerfil)
    void syncProfile(novoPerfil as unknown as Record<string, unknown>).catch(() => {})
  }

  const adicionar = () => {
    const titulo = novoTitulo.trim()
    if (!titulo) return
    const id = 'custom_' + crypto.randomUUID().slice(0, 8)
    const nova: Ancora = { id, titulo, detalhe: novoDetalhe.trim(), categoria: novaCategoria }
    const novoPerfil = saveProfile({
      ancorasCustom: [...(perfil.ancorasCustom ?? []), nova],
      ancorasActivas: [...perfil.ancorasActivas, id]
    })
    setPerfil(novoPerfil)
    void syncProfile(novoPerfil as unknown as Record<string, unknown>).catch(() => {})
    setNovoTitulo('')
    setNovoDetalhe('')
    setAdicionando(false)
  }

  const apagarCustom = (id: string) => {
    if (!window.confirm('Apagar âncora?')) return
    const novoPerfil = saveProfile({
      ancorasCustom: (perfil.ancorasCustom ?? []).filter(a => a.id !== id),
      ancorasActivas: perfil.ancorasActivas.filter(x => x !== id)
    })
    setPerfil(novoPerfil)
    void syncProfile(novoPerfil as unknown as Record<string, unknown>).catch(() => {})
  }

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="label-cap">Âncoras</span>
        <span className="text-faint text-[11px] tnum">{activas.size} activas</span>
      </div>
      <p className="text-faint text-[11px] leading-relaxed">
        escolhe as que fazem sentido nesta fase. podes trocar quando quiseres.
      </p>
      <div className="card-solid space-y-4 !p-4">
        {(Object.keys(porCategoria) as CategoriaAncora[]).map(cat => (
          <div key={cat} className="space-y-1.5">
            <span className="label-cap text-[10px]">{CATEGORIAS_LABEL[cat]}</span>
            <ul className="space-y-1">
              {porCategoria[cat].map(a => {
                const active = activas.has(a.id)
                const custom = a.id.startsWith('custom_')
                return (
                  <li key={a.id} className="flex items-start gap-2">
                    <button
                      onClick={() => toggle(a.id)}
                      aria-pressed={active}
                      className={cn(
                        'flex-1 flex items-start gap-2 rounded-md px-3 py-2 text-left transition-elegant active:scale-[0.99]',
                        active ? 'bg-tinta/5 dark:bg-ouro/10' : 'hover:bg-[var(--surface-soft)]'
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0 rounded-full transition-elegant',
                          active ? 'bg-ouro' : 'border border-[var(--hair-strong)]'
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className={cn('block text-[13.5px]', active ? 'text-tinta dark:text-creme' : 'text-soft')}>{a.titulo}</span>
                        {a.detalhe ? <span className="text-faint mt-0.5 block text-[11px]">{a.detalhe}</span> : null}
                      </span>
                    </button>
                    {custom ? (
                      <button
                        onClick={() => apagarCustom(a.id)}
                        aria-label="apagar âncora"
                        className="text-faint hover:text-terracota p-1 active:scale-90"
                      >
                        <Trash2 size={13} strokeWidth={1.4} />
                      </button>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {adicionando ? (
          <div className="space-y-2 border-t border-[var(--hair)] pt-4">
            <input
              autoFocus
              value={novoTitulo}
              onChange={e => setNovoTitulo(e.target.value)}
              placeholder="título · ex: telefonar à mãe"
              className="input-base text-[13px]"
              maxLength={60}
            />
            <input
              value={novoDetalhe}
              onChange={e => setNovoDetalhe(e.target.value)}
              placeholder="detalhe (opcional)"
              className="input-base text-[13px]"
              maxLength={120}
            />
            <div className="flex gap-1.5">
              {(Object.keys(CATEGORIAS_LABEL) as CategoriaAncora[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setNovaCategoria(cat)}
                  className={cn(
                    'flex-1 rounded-md py-1.5 text-[11px] transition-elegant',
                    novaCategoria === cat ? 'bg-tinta text-[var(--bg)] dark:bg-ouro dark:text-tinta' : 'shadow-hair text-soft'
                  )}
                >
                  {CATEGORIAS_LABEL[cat]}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setAdicionando(false); setNovoTitulo(''); setNovoDetalhe('') }} className="btn-ghost flex-1 py-2 text-[12px]">cancelar</button>
              <button onClick={adicionar} disabled={!novoTitulo.trim()} className="btn-primary flex-1 py-2 text-[12px] disabled:opacity-30">guardar</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdicionando(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[var(--hair-strong)] py-2.5 text-[12px] text-soft transition-elegant hover:bg-[var(--surface-soft)]"
          >
            <Plus size={13} strokeWidth={1.4} /> adicionar âncora minha
          </button>
        )}
      </div>
    </section>
  )
}

