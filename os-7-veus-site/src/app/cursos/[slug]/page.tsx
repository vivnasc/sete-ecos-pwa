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
  const accentColor = categoria?.cor || "#C9A96E";

  // Find prev/next curso by global order
  const sorted = [...cursosData].sort((a, b) => a.numero - b.numero);
  const idx = sorted.findIndex((c) => c.slug === curso.slug);
  const prevCurso = idx > 0 ? sorted[idx - 1] : null;
  const nextCurso = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return (
    <>
      <Header />
      <main className="bg-[#0D0D1A] min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Abstract background glow */}
          <div className="absolute inset-0">
            <div
              className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-15"
              style={{ backgroundColor: accentColor }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D1A]/60 via-[#0D0D1A]/80 to-[#0D0D1A]" />
          </div>

          <div className="relative px-6 pt-28 pb-20 max-w-screen-lg mx-auto">
            {/* Back link */}
            <Link
              href="/#os-7-veus"
              className="inline-flex items-center gap-2 text-xs text-[#666680] hover:text-[#a0a0b0] transition-colors mb-12"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Voltar aos cursos
            </Link>

            <div className="text-center max-w-3xl mx-auto">
              {/* Category + number label */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <span
                  className="text-[10px] font-medium uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}30` }}
                >
                  {categoria?.nome}
                </span>
                <span className="text-xs text-[#666680]">
                  Curso {curso.numero}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-[#F5F0E6] mb-5 leading-tight">
                {curso.titulo}
              </h1>

              {/* Subtitle */}
              <p
                className="text-lg md:text-xl italic mb-8"
                style={{ color: accentColor }}
              >
                {curso.subtituloLanding}
              </p>

              {/* Description */}
              <p className="text-[#a0a0b0] text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                {curso.descricaoLonga}
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="#inscrever"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-medium text-[#0D0D1A] transition-transform hover:scale-105"
                  style={{ backgroundColor: accentColor }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Inscrever-me neste curso
                </Link>

                <Link
                  href="#modulos"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm text-[#a0a0b0] border border-white/10 hover:bg-white/5 transition-colors"
                >
                  Ver módulos
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 pb-16">
          <div className="max-w-screen-lg mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { valor: curso.stats.modulos, label: "Módulos" },
              { valor: curso.stats.videos, label: "Vídeos curtos" },
              { valor: curso.stats.manualPdf, label: "Manual PDF" },
              { valor: curso.stats.cadernos, label: "Cadernos de exercícios" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-5 rounded-xl bg-white/5 border border-white/10"
              >
                <div
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{ color: accentColor, fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {stat.valor}
                </div>
                <div className="text-xs text-[#666680]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Módulos */}
        <section id="modulos" className="px-6 pb-20">
          <div className="max-w-screen-lg mx-auto">
            <h2 className="text-3xl md:text-4xl text-[#F5F0E6] mb-8">
              O que vais explorar
            </h2>

            <CursoModulos modulos={curso.modulos} cor={accentColor} />
          </div>
        </section>

        {/* Separator */}
        <div className="max-w-screen-lg mx-auto px-6">
          <div className="border-t border-white/5" />
        </div>

        {/* CTA Inscrição */}
        <section id="inscrever" className="px-6 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl text-[#F5F0E6] mb-4">
              Pronta para esta travessia?
            </h2>
            <p className="text-[#a0a0b0] text-base mb-8">
              {curso.modulos.length} módulos. Ao teu ritmo. Com acompanhamento.
            </p>

            <Link
              href="https://www.seteecos.com"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium text-[#0D0D1A] transition-transform hover:scale-105"
              style={{ backgroundColor: accentColor }}
            >
              Inscrever-me neste curso
            </Link>

            <p className="text-xs text-[#666680] mt-5">
              Acesso imediato após inscrição
            </p>
          </div>
        </section>

        {/* Navegação entre cursos */}
        <section className="px-6 pb-8">
          <div className="max-w-screen-lg mx-auto pt-6 border-t border-white/5 flex justify-between items-center">
            {prevCurso ? (
              <Link
                href={`/cursos/${prevCurso.slug}`}
                className="inline-flex items-center gap-2 text-xs text-[#666680] hover:text-[#a0a0b0] transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                {prevCurso.titulo}
              </Link>
            ) : (
              <span></span>
            )}

            <Link
              href="/#os-7-veus"
              className="text-xs hover:text-[#a0a0b0] transition-colors"
              style={{ color: accentColor }}
            >
              Ver todos os cursos
            </Link>

            {nextCurso ? (
              <Link
                href={`/cursos/${nextCurso.slug}`}
                className="inline-flex items-center gap-2 text-xs text-[#666680] hover:text-[#a0a0b0] transition-colors"
              >
                {nextCurso.titulo}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
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
