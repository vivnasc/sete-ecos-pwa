'use client'

import { useEffect, useState } from 'react'

export default function LimparPage() {
  const [estado, setEstado] = useState<string>('a limpar...')
  const [feito, setFeito] = useState(false)

  useEffect(() => {
    const limpar = async () => {
      const passos: string[] = []

      // 1. Unregister service workers
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations()
          await Promise.all(regs.map(r => r.unregister()))
          passos.push(`✓ ${regs.length} service worker(s) removido(s)`)
        }
      } catch (e) {
        passos.push('✗ erro a remover SW: ' + (e as Error).message)
      }

      // 2. Limpar todos os caches
      try {
        if ('caches' in window) {
          const keys = await caches.keys()
          await Promise.all(keys.map(k => caches.delete(k)))
          passos.push(`✓ ${keys.length} cache(s) eliminado(s)`)
        }
      } catch (e) {
        passos.push('✗ erro a limpar cache: ' + (e as Error).message)
      }

      // 3. NÃO limpar localStorage (perderia dados!)
      passos.push('✓ localStorage preservado (dados intactos)')

      setEstado(passos.join('\n'))
      setFeito(true)

      // Auto-redirect após 3s
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
    }
    limpar()
  }, [])

  return (
    <div className="container-app flex min-h-[80vh] flex-col items-center justify-center gap-6 text-center">
      <h1 className="font-serif text-[32px] font-light tracking-editorial">
        a limpar caches
      </h1>
      <pre className="text-soft text-[13px] whitespace-pre-wrap text-left max-w-md">
        {estado}
      </pre>
      {feito ? (
        <p className="text-faint text-[12px]">
          a recarregar em 3 segundos...
        </p>
      ) : (
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" />
          <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" style={{ animationDelay: '0.3s' }} />
          <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ouro" style={{ animationDelay: '0.6s' }} />
        </div>
      )}
    </div>
  )
}
