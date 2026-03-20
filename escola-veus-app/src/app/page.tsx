import Link from "next/link";
import { categorias, getCursosByCategoria } from "@/data/cursos";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="pt-14 pb-10 px-6 text-center">
        <span className="text-escola-dourado text-[10px] uppercase tracking-[0.3em] mb-3 block">
          A Escola dos Véus
        </span>
        <h1 className="text-3xl sm:text-4xl text-escola-creme mb-4">
          Cursos de transformação interior
        </h1>
        <p className="text-escola-muted text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          20 travessias. 4 territórios. Cada curso é uma zona da tua vida que
          precisas de atravessar com mais clareza.
        </p>
      </section>

      {/* Categorias */}
      <section className="px-4 pb-24 space-y-10 max-w-2xl mx-auto">
        {categorias.map((cat) => {
          const cursosCat = getCursosByCategoria(cat.id);
          return (
            <div key={cat.id}>
              {/* Categoria header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.cor }}
                />
                <div>
                  <h2 className="text-lg text-escola-creme">{cat.nome}</h2>
                  <p className="text-xs text-escola-muted-dark">{cat.subtitulo}</p>
                </div>
              </div>

              {/* Cursos da categoria */}
              <div className="space-y-2">
                {cursosCat.map((curso) => (
                  <Link
                    key={curso.slug}
                    href={`/cursos/${curso.slug}`}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.06] transition-all active:scale-[0.98]"
                  >
                    <span
                      className="text-[10px] font-medium tabular-nums w-6 text-center flex-shrink-0"
                      style={{ color: cat.cor }}
                    >
                      {String(curso.numero).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm text-escola-creme group-hover:text-white truncate transition-colors">
                        {curso.titulo}
                      </h3>
                      <p className="text-xs text-escola-muted-dark truncate">
                        {curso.descricao}
                      </p>
                    </div>
                    {curso.emBreve ? (
                      <span className="text-[9px] uppercase tracking-wider text-escola-muted-dark border border-escola-muted-dark/30 px-1.5 py-0.5 rounded flex-shrink-0">
                        Breve
                      </span>
                    ) : (
                      <span className="text-escola-muted-dark text-xs group-hover:text-escola-muted transition-colors flex-shrink-0">
                        &rarr;
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
