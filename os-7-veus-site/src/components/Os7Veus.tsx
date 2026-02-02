import Link from "next/link";
import { veusData } from "@/lib/veus-data";

export default function Os7Veus() {
  return (
    <section id="os-7-veus" className="py-20 px-6 bg-[var(--cream)]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl text-[var(--text-dark)] mb-6 text-center">
          Os 7 Véus
        </h2>

        <p className="text-center text-[var(--text-dark)]/70 text-lg mb-12 max-w-2xl mx-auto">
          Cada véu representa uma forma diferente de nos afastarmos de quem somos.
          Não por maldade. Não por fraqueza. Mas por sobrevivência.
        </p>

        <div className="bg-[var(--cream-light)] p-8 md:p-12 rounded-lg mb-12">
          <div className="bg-white/50 border-l-4 border-[var(--sage-green)] p-6">
            <p className="text-[var(--sage-green)] italic text-center text-lg">
              Reconhecer o véu não é julgamento — é o primeiro passo para voltar a escolher.
            </p>
          </div>
        </div>

        {/* Lista dos 7 Véus */}
        <div className="space-y-4">
          {veusData.map((veu) => (
            <Link
              key={veu.slug}
              href={`/veu/${veu.slug}`}
              className="block p-6 bg-white rounded-lg border-2 border-transparent hover:border-[var(--sage-green)] transition-all group"
            >
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full border-2 border-[var(--brown-dark)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--brown-dark)] group-hover:text-white transition-colors">
                  <span className="font-medium">{veu.numero}</span>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl text-[var(--brown-dark)] mb-1 group-hover:text-[var(--sage-green)] transition-colors">
                    {veu.titulo}
                  </h3>
                  <p className="text-[var(--text-dark)]/60 italic">
                    {veu.subtitulo}
                  </p>
                </div>
                <span className="text-[var(--sage-green)] opacity-0 group-hover:opacity-100 transition-opacity text-2xl">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-[var(--text-dark)]/60 text-lg mt-12">
          Este sistema existe para tornar o invisível visível.
          <br />
          Para que possas ver com clareza e, a partir daí, estar mais presente.
        </p>
      </div>
    </section>
  );
}
