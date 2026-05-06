'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { getProfile, saveProfile, type Profile } from '@/lib/profile'
import { syncProfile } from '@/lib/sync'
import { useAuth } from './AuthGate'

const GATILHOS_OPCOES = [
  'cansaço', 'stress', 'aborrecimento', 'tristeza', 'celebração',
  'social', 'raiva', 'ansiedade', 'tédio', 'fim do dia', 'fim de semana'
]

const PASSOS = [
  { id: 'nome', titulo: 'Como te chamas?' },
  { id: 'fisico', titulo: 'Ponto de partida' },
  { id: 'horarios', titulo: 'Os teus horários' },
  { id: 'gatilhos', titulo: 'O que costuma mover-te ao copo?' },
  { id: 'fim', titulo: 'Pronta' }
] as const

export default function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { configurado, session } = useAuth()
  const [verificado, setVerificado] = useState(false)
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    // Só mostra onboarding se autenticada (ou Supabase não configurado mas com profile vazio)
    if (configurado && !session) {
      setVerificado(true)
      return
    }
    const p = getProfile()
    if (!p.onboardingCompleto) setAberto(true)
    setVerificado(true)
  }, [configurado, session])

  if (!verificado) return null
  if (!aberto) return <>{children}</>
  return <OnboardingFlow onClose={() => setAberto(false)} />
}

function OnboardingFlow({ onClose }: { onClose: () => void }) {
  const [passo, setPasso] = useState(0)
  const [perfil, setPerfil] = useState<Profile>(getProfile())

  const proximo = () => {
    if (passo < PASSOS.length - 1) setPasso(p => p + 1)
    else terminar()
  }
  const anterior = () => { if (passo > 0) setPasso(p => p - 1) }

  const terminar = () => {
    const final = { ...perfil, onboardingCompleto: true }
    saveProfile(final)
    void syncProfile(final).catch(() => {})
    onClose()
  }

  const toggleGatilho = (g: string) => {
    setPerfil(p => ({
      ...p,
      gatilhosAlcool: p.gatilhosAlcool.includes(g)
        ? p.gatilhosAlcool.filter(x => x !== g)
        : [...p.gatilhosAlcool, g]
    }))
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg)]">
      <div className="container-app min-h-screen pb-12 pt-12">
        <header className="mb-10 text-center">
          <p className="label-cap mb-3">Reset · começo</p>
          <div className="mx-auto flex max-w-[200px] gap-1">
            {PASSOS.map((_, i) => (
              <div
                key={i}
                className={`h-px flex-1 transition-elegant ${
                  i <= passo ? 'bg-ouro' : 'bg-[var(--hair)]'
                }`}
              />
            ))}
          </div>
        </header>

        <h1 className="mb-10 font-serif text-[36px] font-light leading-[1.1] tracking-editorial sm:text-[44px] animate-slide-up">
          {PASSOS[passo].titulo}
        </h1>

        <div className="mb-12 animate-fade-in">
          {PASSOS[passo].id === 'nome' && (
            <div className="space-y-6">
              <Field label="Nome">
                <input
                  type="text"
                  value={perfil.nome}
                  onChange={e => setPerfil({ ...perfil, nome: e.target.value })}
                  className="input-base"
                  autoFocus
                />
              </Field>
              <Field label="Como queres ser tratada">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 'F', l: 'feminino' },
                    { v: 'M', l: 'masculino' },
                    { v: 'O', l: 'outro' }
                  ].map(o => (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => setPerfil({ ...perfil, sexo: o.v as 'F' | 'M' | 'O' })}
                      className={`rounded-lg py-3 text-[13px] transition-elegant ${
                        perfil.sexo === o.v
                          ? 'bg-tinta text-[var(--bg)]'
                          : 'shadow-hair hover:shadow-hair-strong'
                      }`}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {PASSOS[passo].id === 'fisico' && (
            <div className="space-y-6">
              <p className="text-soft text-[14px] leading-relaxed">
                opcional. ajuda a perceber a evolução. podes deixar em branco.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Peso (kg)">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={perfil.pesoInicial ?? ''}
                    onChange={e => setPerfil({ ...perfil, pesoInicial: e.target.value ? Number(e.target.value) : null })}
                    className="input-base"
                    placeholder="—"
                  />
                </Field>
                <Field label="Cintura (cm)">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    value={perfil.cinturaInicial ?? ''}
                    onChange={e => setPerfil({ ...perfil, cinturaInicial: e.target.value ? Number(e.target.value) : null })}
                    className="input-base"
                    placeholder="—"
                  />
                </Field>
              </div>
            </div>
          )}

          {PASSOS[passo].id === 'horarios' && (
            <div className="space-y-6">
              <Field label="A que horas costumas acordar">
                <input
                  type="time"
                  value={perfil.acordaTipico}
                  onChange={e => setPerfil({ ...perfil, acordaTipico: e.target.value })}
                  className="input-base"
                />
              </Field>
              <Field label="A que horas queres deitar-te">
                <input
                  type="time"
                  value={perfil.deitaTipico}
                  onChange={e => setPerfil({ ...perfil, deitaTipico: e.target.value })}
                  className="input-base"
                />
              </Field>
              <Field label="Quando preferes treinar">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { v: 'manhã', l: 'manhã' },
                    { v: 'tarde', l: 'tarde' },
                    { v: 'noite', l: 'noite' },
                    { v: 'flexível', l: 'flexível' }
                  ].map(o => (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => setPerfil({ ...perfil, treinoPreferido: o.v as Profile['treinoPreferido'] })}
                      className={`rounded-lg py-2.5 text-[13px] transition-elegant ${
                        perfil.treinoPreferido === o.v
                          ? 'bg-tinta text-[var(--bg)]'
                          : 'shadow-hair hover:shadow-hair-strong'
                      }`}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {PASSOS[passo].id === 'gatilhos' && (
            <div className="space-y-5">
              <p className="text-soft text-[14px] leading-relaxed">
                seleciona os que reconheces. saber o gatilho não é prevê-lo — é estar acordada quando aparece.
              </p>
              <div className="flex flex-wrap gap-2">
                {GATILHOS_OPCOES.map(g => {
                  const active = perfil.gatilhosAlcool.includes(g)
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGatilho(g)}
                      className={`rounded-full px-4 py-2 text-[13px] transition-elegant ${
                        active
                          ? 'bg-tinta text-[var(--bg)]'
                          : 'shadow-hair hover:shadow-hair-strong'
                      }`}
                    >
                      {g}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {PASSOS[passo].id === 'fim' && (
            <div className="space-y-6">
              <p className="text-soft text-[15px] leading-[1.6]">
                tens 60 dias. começam a 11 de maio.
              </p>
              <p className="text-soft text-[15px] leading-[1.6]">
                não há streak para impressionar. não há leaderboard. é entre ti e a tua atenção.
              </p>
              <p className="font-serif text-[18px] italic text-tinta">
                não estás a começar — estás a regressar.
              </p>
            </div>
          )}
        </div>

        <nav className="flex items-center justify-between gap-3">
          <button
            onClick={anterior}
            disabled={passo === 0}
            className="btn-ghost disabled:opacity-30"
          >
            <ArrowLeft size={14} strokeWidth={1.4} />
            anterior
          </button>
          <span className="label-soft">
            {passo + 1} / {PASSOS.length}
          </span>
          <button onClick={proximo} className="btn-primary">
            {passo === PASSOS.length - 1 ? 'começar' : 'seguinte'}
            {passo === PASSOS.length - 1 ? <Check size={14} strokeWidth={1.6} /> : <ArrowRight size={14} strokeWidth={1.4} />}
          </button>
        </nav>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-cap mb-2 block">{label}</span>
      {children}
    </label>
  )
}
