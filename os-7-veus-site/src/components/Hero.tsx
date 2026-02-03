import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-screen bg-[var(--brown-dark)] flex items-center justify-center text-center px-6 pt-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-6xl lg:text-7xl text-[var(--cream)] mb-6 tracking-wide">
          OS 7 VÉUS
        </h1>

        <p className="text-[var(--cream)]/80 text-lg md:text-xl italic mb-8">
          A sabedoria que não devias ter de esperar
        </p>

        <div className="w-24 h-0.5 bg-[var(--sage-green)] mx-auto mb-8"></div>

        <p className="text-[var(--cream)]/70 text-lg italic mb-2">
          O que eu queria ter lido aos 25.
        </p>

        <p className="text-[var(--cream)]/60 text-base mb-12">
          — Vivianne
        </p>

        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <Link
            href="#sobre"
            className="bg-[var(--cream)] text-[var(--terracota)] font-medium py-4 px-8 rounded hover:bg-[var(--cream-light)] transition-colors uppercase tracking-wider text-sm"
          >
            Começar
          </Link>

          <Link
            href="#recursos"
            className="border-2 border-[var(--sage-green)] text-[var(--sage-green)] font-medium py-4 px-8 rounded hover:bg-[var(--sage-green)] hover:text-[var(--cream)] transition-colors uppercase tracking-wider text-sm"
          >
            Experimentar Grátis
          </Link>
        </div>
      </div>
    </section>
  );
}
