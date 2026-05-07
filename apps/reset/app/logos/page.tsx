'use client'

import BackButton from '@/components/BackButton'

const LOGOS = [
  {
    nome: 'wordmark',
    src: '/logos/logo-01-wordmark.svg',
    descricao: 'tipografia editorial · curva phoenix discreta · selo restrito'
  },
  {
    nome: 'pássaro',
    src: '/logos/logo-02-bird.svg',
    descricao: 'fénix em linha contínua · chama a subir · mais expressivo'
  },
  {
    nome: 'selo',
    src: '/logos/logo-03-seal.svg',
    descricao: 'selo circular · monograma FF · ex libris editorial'
  }
] as const

export default function LogosPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <BackButton />

      <header className="space-y-2 pt-2">
        <p className="label-soft">marca</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">
          três caminhos
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px]">escolhe o que mais te chama · diz-me e fica como ícone</p>
      </header>

      <div className="space-y-6">
        {LOGOS.map((l, i) => (
          <section key={l.nome} className="space-y-3">
            <div className="flex items-baseline justify-between px-1">
              <span className="label-cap">
                {String(i + 1).padStart(2, '0')} · {l.nome}
              </span>
            </div>

            <div className="card-solid !p-0 overflow-hidden">
              <div className="bg-[#F6F1E8] aspect-square w-full flex items-center justify-center">
                <img
                  src={l.src}
                  alt={`logo ${l.nome}`}
                  className="max-w-full max-h-full"
                  loading="lazy"
                />
              </div>
              <div className="p-4 border-t border-[var(--hair)]">
                <p className="text-soft text-[13px] leading-relaxed">{l.descricao}</p>
                <a
                  href={l.src}
                  download
                  className="text-faint text-[11px] uppercase tracking-cap mt-2 inline-block hover:text-ouro"
                >
                  ↓ descarregar svg
                </a>
              </div>
            </div>
          </section>
        ))}
      </div>

      <p className="text-faint text-center text-[11px] leading-relaxed pb-4">
        diz-me o número · eu actualizo o ícone da app, manifest e ecrãs.
      </p>
    </div>
  )
}
