import Link from "next/link";
import { cursosData } from "@/lib/veus-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Cursos | A Escola dos Véus",
  description: "20 cursos de autoconhecimento. Vinte jornadas de transformação interior — cada uma é um território da tua vida que precisas de atravessar com mais clareza.",
};

const sorted = [...cursosData].sort((a, b) => a.numero - b.numero);

// Course 1 is "Em breve"
const EM_BREVE_SLUGS = ["ouro-proprio"];

export default function CursosPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#1A1A2E] to-[#0D0D1A] pt-28 pb-16 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="text-[#C9A96E] text-xs uppercase tracking-[0.3em] mb-4 block">
              A Escola dos Véus
            </span>
            <h1 className="text-4xl md:text-5xl text-[#F5F0E6] mb-6">
              Cursos
            </h1>
            <p className="text-[#a0a0b0] text-lg leading-relaxed max-w-2xl mx-auto">
              Vinte jornadas de transformação interior. Cada uma é um território
              — uma zona da tua vida que precisas de atravessar com mais clareza.
            </p>
            <div className="w-16 h-0.5 bg-[#666680] mx-auto mt-8" />
          </div>
        </section>

        {/* Grid */}
        <section className="bg-[#0D0D1A] px-6 py-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((curso) => {
              const emBreve = EM_BREVE_SLUGS.includes(curso.slug);
              const colors: Record<string, string> = {
                herancas: "#8B5CF6",
                fronteiras: "#C9A96E",
                ciclos: "#5B7B6B",
                materia: "#8B6F47",
              };
              const labelColor = colors[curso.categoriaId] || "#C9A96E";

              return (
                <Link
                  key={curso.slug}
                  href={`/cursos/${curso.slug}`}
                  className="group block p-6 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.06] hover:shadow-lg transition-all"
                >
                  <span
                    className="text-[10px] uppercase tracking-[0.2em] font-medium"
                    style={{ color: labelColor }}
                  >
                    Curso {String(curso.numero).padStart(2, "0")}
                  </span>

                  <h2 className="text-xl text-[#F5F0E6] mt-2 mb-2 group-hover:text-white transition-colors">
                    {curso.titulo}
                  </h2>

                  <p className="text-sm text-[#666680] leading-relaxed">
                    {curso.descricao}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    {emBreve ? (
                      <span className="text-[10px] uppercase tracking-wider text-[#666680] border border-[#666680]/30 px-2 py-0.5 rounded">
                        Em breve
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-[#666680] group-hover:text-[#a0a0b0] transition-colors">
                      Explorar &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
