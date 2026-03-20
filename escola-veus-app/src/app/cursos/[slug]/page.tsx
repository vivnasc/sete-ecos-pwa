import Link from "next/link";
import { notFound } from "next/navigation";
import { cursos, getCursoBySlug, getCategoriaById, getAllSlugs } from "@/data/cursos";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const curso = getCursoBySlug(params.slug);
  if (!curso) return {};
  return {
    title: `${curso.titulo} | Escola dos Véus`,
    description: curso.descricao,
  };
}

export default function CursoPage({ params }: { params: { slug: string } }) {
  const curso = getCursoBySlug(params.slug);
  if (!curso) notFound();

  const cat = getCategoriaById(curso.categoriaId);
  const temModulos = curso.modulos.length > 0;

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <section className="pt-14 pb-8 px-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="text-escola-muted-dark text-xs hover:text-escola-muted transition-colors mb-6 inline-block"
          >
            &larr; Voltar
          </Link>

          {cat && (
            <span
              className="text-[10px] uppercase tracking-[0.2em] block mb-2"
              style={{ color: cat.cor }}
            >
              {cat.nome} &middot; Curso {String(curso.numero).padStart(2, "0")}
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl text-escola-creme mb-3">
            {curso.titulo}
          </h1>

          <p className="text-escola-muted text-sm sm:text-base leading-relaxed">
            {curso.descricao}
          </p>

          {curso.emBreve && (
            <div className="mt-4 inline-block text-xs text-escola-muted-dark border border-escola-muted-dark/30 px-3 py-1.5 rounded-lg">
              Este curso ainda não está disponível. Em breve.
            </div>
          )}
        </div>
      </section>

      {/* Módulos */}
      {temModulos && (
        <section className="px-4 max-w-2xl mx-auto">
          <h2 className="text-lg text-escola-creme mb-4 px-2">
            {curso.modulos.length} módulos
          </h2>

          <div className="space-y-2">
            {curso.modulos.map((mod) => (
              <Link
                key={mod.numero}
                href={`/cursos/${curso.slug}/${mod.numero}`}
                className="group block p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.06] transition-all active:scale-[0.98]"
              >
                <div className="flex items-start gap-4">
                  <span className="text-escola-muted-dark text-xs tabular-nums mt-0.5 w-5 text-center flex-shrink-0">
                    {mod.numero}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm text-escola-creme group-hover:text-white transition-colors">
                      {mod.titulo}
                    </h3>
                    <p className="text-xs text-escola-muted-dark mt-0.5">
                      {mod.descricao}
                    </p>
                    {/* Sub-aulas count */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-escola-muted-dark">
                        {mod.subAulas.length} aulas
                      </span>
                      <span className="text-[10px] text-escola-muted-dark">
                        Caderno: {mod.caderno}
                      </span>
                    </div>
                  </div>
                  <span className="text-escola-muted-dark text-xs group-hover:text-escola-muted transition-colors flex-shrink-0 mt-0.5">
                    &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sem módulos ainda */}
      {!temModulos && !curso.emBreve && (
        <section className="px-6 max-w-2xl mx-auto text-center py-12">
          <p className="text-escola-muted-dark text-sm">
            Os módulos deste curso estão a ser preparados.
          </p>
        </section>
      )}
    </main>
  );
}
