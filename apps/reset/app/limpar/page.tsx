'use client'

import { useEffect, useState } from 'react'

export default function LimparPage() {
  const [estado, setEstado] = useState<string>('')
  const [feito, setFeito] = useState(false)

  const limparBasico = async () => {
    setEstado('a limpar caches...')
    const passos: string[] = []
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(regs.map(r => r.unregister()))
        passos.push(`✓ ${regs.length} service workers removidos`)
      }
    } catch {}
    try {
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map(k => caches.delete(k)))
        passos.push(`✓ ${keys.length} caches eliminados`)
      }
    } catch {}
    passos.push('✓ dados preservados')
    setEstado(passos.join('\n'))
    setFeito(true)
    setTimeout(() => { window.location.href = '/' }, 2000)
  }

  const limparTudo = async () => {
    if (!window.confirm('Apagar TUDO (incluindo dados na app)?\n\nOs dados na nuvem (Supabase) ficam intactos.')) return
    setEstado('a limpar tudo...')
    const passos: string[] = []
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(regs.map(r => r.unregister()))
        passos.push(`✓ service workers removidos`)
      }
    } catch {}
    try {
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map(k => caches.delete(k)))
        passos.push(`✓ caches eliminados`)
      }
    } catch {}
    try {
      // Limpar TODO o localStorage
      const todasChaves = Object.keys(localStorage)
      todasChaves.forEach(k => localStorage.removeItem(k))
      passos.push(`✓ ${todasChaves.length} entradas locais limpas`)
    } catch {}
    try {
      sessionStorage.clear()
      passos.push('✓ session limpa')
    } catch {}
    setEstado(passos.join('\n'))
    setFeito(true)
    setTimeout(() => { window.location.href = '/' }, 2500)
  }

  return (
    <div className="container-app flex min-h-[80vh] flex-col items-center justify-center gap-6 text-center">
      <h1 className="font-serif text-[28px] font-light tracking-editorial">
        recuperar
      </h1>

      {!feito ? (
        <>
          <p className="text-soft text-[13px] max-w-[320px] leading-relaxed">
            se a app está em branco, presa, ou com erro, escolhe uma opção:
          </p>

          <div className="card-solid w-full max-w-md space-y-3">
            <h2 className="font-serif text-[16px] tracking-editorial">limpar caches</h2>
            <p className="text-faint text-[12px] leading-relaxed">
              remove service workers e caches do browser. <strong>preserva os teus dados</strong>.
            </p>
            <button onClick={limparBasico} className="btn-primary w-full text-[12px]">
              limpar caches
            </button>
          </div>

          <div className="card-solid w-full max-w-md space-y-3 shadow-[inset_0_0_0_1px_rgba(155,93,62,0.3)]">
            <h2 className="font-serif text-[16px] tracking-editorial text-terracota">reset total</h2>
            <p className="text-faint text-[12px] leading-relaxed">
              limpa TUDO incluindo dados locais. dados na nuvem (Supabase) ficam intactos.
              vais ter que voltar a fazer login.
            </p>
            <button onClick={limparTudo} className="btn-outline w-full text-[12px] text-terracota">
              reset total
            </button>
          </div>

          <a href="/" className="text-faint text-[12px] underline-offset-4 hover:underline">
            voltar à app
          </a>
        </>
      ) : (
        <>
          <pre className="text-soft text-[13px] whitespace-pre-wrap text-left max-w-md">
            {estado}
          </pre>
          <p className="text-faint text-[12px]">a recarregar...</p>
        </>
      )}
    </div>
  )
}
