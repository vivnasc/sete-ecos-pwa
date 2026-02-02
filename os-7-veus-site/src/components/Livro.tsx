import Link from "next/link";

export default function Livro() {
  return (
    <section id="livro" className="py-20 px-6 bg-[var(--brown-dark)]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl text-[var(--cream)] text-center mb-12">
          O que muda quando vês
        </h2>

        {/* Book Image Placeholder */}
        <div className="flex justify-center mb-8">
          <div className="w-64 h-80 bg-gradient-to-br from-teal-400 via-emerald-300 to-cyan-400 rounded-lg flex items-center justify-center shadow-2xl">
            <div className="text-center text-white">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <p className="text-sm font-medium">Os 7 Véus</p>
            </div>
          </div>
        </div>

        <p className="text-[var(--cream)]/80 text-center text-lg max-w-2xl mx-auto mb-12">
          Uma travessia de dissolução e reconhecimento. Não um manual de respostas,
          mas um convite a olhar mais fundo — e a soltar o que perdeu verdade.
        </p>

        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <Link
            href="#"
            className="bg-[var(--terracota)] text-white font-medium py-4 px-8 rounded hover:bg-[var(--terracota)]/90 transition-colors text-center"
          >
            Ebook — $19 (Mundial)
          </Link>

          <Link
            href="https://wa.me/258XXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--whatsapp-green)] text-white font-medium py-4 px-8 rounded hover:bg-[var(--whatsapp-green)]/90 transition-colors text-center flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Livro Físico — 1.500 MT (Moçambique)
          </Link>
        </div>

        {/* Sobre este livro */}
        <div className="mt-16 bg-[var(--cream)] p-8 md:p-12 rounded-lg">
          <h3 className="text-2xl md:text-3xl text-[var(--text-dark)] text-center mb-8">
            Sobre este livro
          </h3>

          <div className="space-y-6 text-[var(--text-dark)]/80">
            <p>
              Este livro nasce de uma escuta — a escuta das perguntas que nos visitam quando a vida deixa de caber nos moldes habituais. São perguntas que surgem no silêncio, quando os papéis se tornam estreitos, os ritmos insuportáveis e os espelhos já não iludem.
            </p>

            <p>
              O despertar não é clarão nem chegada. É processo subtil, um desfiar de véus que acontece devagar. Ideias, crenças, papéis e medos desfazem-se, revelando momentos de simplicidade entre tantos retornos e esquecimentos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
