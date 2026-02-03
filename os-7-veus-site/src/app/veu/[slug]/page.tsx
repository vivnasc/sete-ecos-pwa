import { notFound } from "next/navigation";
import Link from "next/link";
import { veusData, getVeuBySlug } from "@/lib/veus-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export async function generateStaticParams() {
  return veusData.map((veu) => ({
    slug: veu.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const veu = getVeuBySlug(slug);

  if (!veu) {
    return { title: "Véu não encontrado" };
  }

  return {
    title: `${veu.titulo} | Os 7 Véus`,
    description: veu.descricao,
  };
}

export default async function VeuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const veu = getVeuBySlug(slug);

  if (!veu) {
    notFound();
  }

  const prevVeu = veusData.find(v => v.numero === veu.numero - 1);
  const nextVeu = veusData.find(v => v.numero === veu.numero + 1);

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="min-h-[70vh] bg-[var(--brown-dark)] flex items-center justify-center text-center px-6 pt-24 pb-16">
          <div className="max-w-2xl mx-auto">
            <span className="text-[var(--sage-green)] text-sm uppercase tracking-[0.3em] mb-4 block">
              Véu {veu.numero} de 7
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl text-[var(--cream)] mb-6">
              {veu.titulo.replace("O Véu ", "").replace("da ", "").replace("do ", "")}
            </h1>

            <p className="text-[var(--cream)]/70 text-xl italic mb-8">
              {veu.subtitulo}
            </p>

            <div className="w-24 h-0.5 bg-[var(--sage-green)] mx-auto mb-8"></div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#sobre"
                className="bg-[var(--cream)] text-[var(--brown-dark)] font-medium py-3 px-8 rounded hover:bg-[var(--cream-light)] transition-colors uppercase tracking-wider text-sm"
              >
                Experimentar Dia 1 Grátis
              </Link>

              <Link
                href="/livro"
                className="border-2 border-[var(--sage-green)] text-[var(--sage-green)] font-medium py-3 px-8 rounded hover:bg-[var(--sage-green)] hover:text-[var(--cream)] transition-colors uppercase tracking-wider text-sm"
              >
                Ver Produtos
              </Link>
            </div>
          </div>
        </section>

        {/* Sobre este véu */}
        <section id="sobre" className="py-20 px-6 bg-[var(--cream)]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl text-center mb-12">
              Sobre este Véu
            </h2>

            <p className="text-xl text-[var(--brown-medium)] mb-8 leading-relaxed">
              {veu.descricao}
            </p>

            {veu.sobreTexto.map((texto, index) => (
              <p key={index} className="text-lg text-[var(--text-dark)]/80 mb-6 leading-relaxed">
                {texto}
              </p>
            ))}

            {veu.naoE.length > 0 && (
              <div className="mt-12 p-8 bg-[var(--cream-light)] rounded-lg">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    {veu.naoE.map((item, index) => (
                      <p key={index} className="text-[var(--text-dark)]/60 mb-2 flex items-center gap-2">
                        <span className="text-red-400">✗</span> Não é {item}
                      </p>
                    ))}
                  </div>
                  <div>
                    {veu.e.map((item, index) => (
                      <p key={index} className="text-[var(--sage-green)] mb-2 flex items-center gap-2">
                        <span>✓</span> {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Navegação entre véus */}
        <section className="py-12 px-6 bg-[var(--brown-dark)]">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            {prevVeu ? (
              <Link
                href={`/veu/${prevVeu.slug}`}
                className="text-[var(--cream)]/60 hover:text-[var(--cream)] transition-colors"
              >
                ← {prevVeu.titulo}
              </Link>
            ) : (
              <span></span>
            )}

            <Link
              href="/#os-7-veus"
              className="text-[var(--sage-green)] hover:text-[var(--cream)] transition-colors"
            >
              Ver todos os véus
            </Link>

            {nextVeu ? (
              <Link
                href={`/veu/${nextVeu.slug}`}
                className="text-[var(--cream)]/60 hover:text-[var(--cream)] transition-colors"
              >
                {nextVeu.titulo} →
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
