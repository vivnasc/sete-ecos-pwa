import { notFound } from "next/navigation";
import Link from "next/link";
import { cursosData, getCursoBySlug, getCategoriaById } from "@/lib/veus-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CursoModulos from "@/components/CursoModulos";

export async function generateStaticParams() {
  return cursosData.map((curso) => ({
    slug: curso.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const curso = getCursoBySlug(slug);

  if (!curso) {
    return { title: "Curso não encontrado" };
  }

  const categoria = getCategoriaById(curso.categoriaId);

  return {
    title: `${curso.titulo} | Os 7 Véus`,
    description: curso.descricaoLonga,
    openGraph: {
      title: `${curso.titulo} — ${categoria?.nome || "Curso"}`,
      description: curso.descricao,
    },
  };
}

export default async function CursoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const curso = getCursoBySlug(slug);

  if (!curso) {
    notFound();
  }

  const categoria = getCategoriaById(curso.categoriaId);

  // Find prev/next curso by global order
  const sorted = [...cursosData].sort((a, b) => a.numero - b.numero);
  const idx = sorted.findIndex((c) => c.slug === curso.slug);
  const prevCurso = idx > 0 ? sorted[idx - 1] : null;
  const nextCurso = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="min-h-[85vh] bg-gradient-to-b from-[#1a1530] via-[#1e1a35] to-[#252040] flex items-center justify-center text-center px-6 pt-24 pb-16">
          <div className="max-w-3xl mx-auto">
            <span
              className="text-sm uppercase tracking-[0.35em] mb-6 block font-medium"
              style={{ color: categoria?.corClara || "#C9B3C9" }}
            >
              Curso {curso.numero}
            </span>

            <h1 className="text-5xl md:text-6xl lg:text-7xl text-white mb-6">
              {curso.titulo}
            </h1>

            <p
              className="text-xl md:text-2xl italic mb-8"
              style={{ color: categoria?.corClara || "#C9B3C9" }}
            >
              {curso.subtituloLanding}
            </p>

            <p className="text-[#9990b0] text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              {curso.descricaoLonga}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#inscrever"
                className="font-medium py-4 px-8 rounded-lg transition-all uppercase tracking-wider text-sm text-white hover:brightness-110"
                style={{ backgroundColor: categoria?.cor || "#7B5B7B" }}
              >
                Inscrever-me neste curso
              </Link>

              <Link
                href="#modulos"
                className="border-2 border-white/20 text-white/80 font-medium py-4 px-8 rounded-lg hover:bg-white/5 transition-all uppercase tracking-wider text-sm"
              >
                Ver módulos
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-[#1e1a35] py-12 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { valor: curso.stats.modulos, label: "Módulos" },
              { valor: curso.stats.videos, label: "Vídeos curtos" },
              { valor: curso.stats.manualPdf, label: "Manual PDF" },
              { valor: curso.stats.cadernos, label: "Cadernos de exercícios" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.valor}
                </div>
                <div className="text-sm text-[#9990b0]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Módulos */}
        <section id="modulos" className="bg-gradient-to-b from-[#1e1a35] to-[#252040] py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl text-white mb-12">O que vais explorar</h2>

            <CursoModulos modulos={curso.modulos} cor={categoria?.cor || "#7B5B7B"} />
          </div>
        </section>

        {/* CTA Inscrição */}
        <section id="inscrever" className="bg-[#252040] py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl text-white mb-6">Pronta para esta travessia?</h2>
            <p className="text-[#9990b0] text-lg mb-10">
              {curso.modulos.length} módulos. Ao teu ritmo. Com acompanhamento.
            </p>

            <Link
              href="https://www.seteecos.com"
              className="inline-block font-medium py-4 px-10 rounded-lg transition-all uppercase tracking-wider text-sm text-white hover:brightness-110"
              style={{ backgroundColor: categoria?.cor || "#7B5B7B" }}
            >
              Inscrever-me neste curso
            </Link>

            <p className="text-[#9990b0]/60 text-sm mt-6">
              Acesso imediato após inscrição
            </p>
          </div>
        </section>

        {/* Navegação entre cursos */}
        <section className="py-8 px-6 bg-[#1a1530]">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            {prevCurso ? (
              <Link
                href={`/cursos/${prevCurso.slug}`}
                className="text-white/40 hover:text-white transition-colors text-sm"
              >
                &larr; {prevCurso.titulo}
              </Link>
            ) : (
              <span></span>
            )}

            <Link
              href="/#os-7-veus"
              className="hover:text-white transition-colors text-sm"
              style={{ color: categoria?.corClara || "#C9B3C9" }}
            >
              Ver todos os cursos
            </Link>

            {nextCurso ? (
              <Link
                href={`/cursos/${nextCurso.slug}`}
                className="text-white/40 hover:text-white transition-colors text-sm"
              >
                {nextCurso.titulo} &rarr;
              </Link>
            ) : (
              <span></span>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
