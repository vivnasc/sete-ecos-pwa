import Link from "next/link";
import { categorias, getCursosByCategoria } from "@/lib/veus-data";

export default function Os7Veus() {
  return (
    <section id="os-7-veus" className="py-20 px-6 bg-[var(--cream)]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl text-[var(--text-dark)] mb-4 text-center">
          20 Cursos
        </h2>

        <p className="text-center text-[var(--text-dark)]/60 text-sm uppercase tracking-[0.2em] mb-6">
          4 categorias · 5 cursos cada
        </p>

        <p className="text-center text-[var(--text-dark)]/70 text-lg mb-16 max-w-2xl mx-auto">
          Cada curso é uma travessia. Cada categoria, um território diferente do que somos.
        </p>

        <div className="space-y-12">
          {categorias.map((cat) => {
            const cursos = getCursosByCategoria(cat.id);
            return (
              <div key={cat.id}>
                {/* Cabeçalho da categoria */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.cor }}
                  />
                  <div>
                    <h3 className="text-2xl md:text-3xl text-[var(--text-dark)]">
                      {cat.nome}
                    </h3>
                    <p className="text-[var(--text-dark)]/50 italic text-sm">
                      {cat.subtitulo}
                    </p>
                  </div>
                </div>

                {/* Lista de cursos */}
                <div className="space-y-3 pl-7">
                  {cursos.map((curso) => (
                    <Link
                      key={curso.slug}
                      href={`/cursos/${curso.slug}`}
                      className="block p-5 bg-white rounded-lg border border-transparent hover:border-[var(--sage-green)]/40 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className="text-sm font-medium w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                          style={{ backgroundColor: cat.cor }}
                        >
                          {curso.numero}
                        </span>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-lg text-[var(--brown-dark)] group-hover:text-[var(--sage-green)] transition-colors">
                            {curso.titulo}
                          </h4>
                          <p className="text-[var(--text-dark)]/50 text-sm mt-1">
                            {curso.descricao}
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-[var(--text-dark)]/30 group-hover:text-[var(--sage-green)] flex-shrink-0 mt-1 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[var(--text-dark)]/60 text-lg mt-16">
          Cada texto é um espelho. Cada travessia, uma forma de voltar a ti.
        </p>
      </div>
    </section>
  );
}
