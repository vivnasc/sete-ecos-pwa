'use client'

import BackButton from '@/components/BackButton'
import SetupCompleto from '@/components/SetupCompleto'

export default function SetupPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <BackButton />

      <header className="space-y-2 pt-4">
        <p className="label-soft">setup</p>
        <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-editorial sm:text-[42px]">
          tudo num sítio
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px] leading-relaxed">
          preenche uma vez. a coach passa a ter contexto em <strong>cada</strong> conversa sem perguntar.
        </p>
      </header>

      <SetupCompleto />
    </div>
  )
}
