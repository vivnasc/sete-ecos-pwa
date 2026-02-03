import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "O Véu da Ilusão | Os 7 Véus",
  description: "Confundir funcionalidade com verdade. Há momentos em que a vida funciona. Mas já não convence.",
};

export default function VeuIlusaoPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="min-h-screen bg-gradient-to-b from-[#4a433b] to-[#3d3630] flex items-center justify-center text-center px-6 py-24">
          <div className="max-w-3xl mx-auto">
            <span className="text-[var(--sage-green)] text-sm uppercase tracking-[0.35em] mb-8 block">
              Véu 1 de 7
            </span>

            <p className="text-2xl text-[#c4bfb6] italic mb-8">
              Confundir funcionalidade com verdade
            </p>

            <div className="w-32 h-0.5 bg-[var(--sage-green)] mx-auto mb-8"></div>

            {/* Placeholder para capa do livro */}
            <div className="w-72 h-96 mx-auto mb-8 bg-gradient-to-br from-[var(--sage-green)] to-[#4a5a40] rounded-lg shadow-2xl flex items-center justify-center">
              <div className="text-center text-white p-6">
                <div className="text-6xl mb-4">1</div>
                <p className="text-lg font-medium">O Véu da Ilusão</p>
              </div>
            </div>

            <p className="text-xl text-[#d4cfc6] mb-8 max-w-xl mx-auto">
              Há momentos em que a vida funciona. Mas já não convence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#dia1"
                className="bg-[var(--cream)] text-[var(--brown-dark)] font-medium py-4 px-8 border-2 border-[var(--cream)] hover:bg-transparent hover:text-[var(--cream)] transition-colors uppercase tracking-wider text-sm"
              >
                Experimentar Dia 1 Grátis
              </Link>

              <Link
                href="#produtos"
                className="border-2 border-[var(--sage-green)] text-[var(--cream)] font-medium py-4 px-8 hover:bg-[var(--sage-green)]/20 transition-colors uppercase tracking-wider text-sm"
              >
                Ver Produtos
              </Link>
            </div>
          </div>
        </section>

        {/* Sobre este Véu */}
        <section className="py-20 px-6 bg-[var(--cream)]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl mb-8">Sobre este Véu</h2>

            <p className="text-xl text-[#5a524a] mb-6 leading-relaxed">
              O Véu da Ilusão não oferece soluções. Não propõe métodos. Oferece clareza.
            </p>

            <p className="text-xl text-[#5a524a] mb-12 leading-relaxed">
              Observa — com precisão contida — o momento em que a lucidez chega. E a partir daí, abre espaço para escolher com mais presença.
            </p>

            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="text-center">
                <span className="block text-3xl text-[#c4bfb6] mb-2">✗</span>
                <p className="text-[#6b6360]">Não é autoajuda</p>
              </div>
              <div className="text-center">
                <span className="block text-3xl text-[#c4bfb6] mb-2">✗</span>
                <p className="text-[#6b6360]">Não é coaching</p>
              </div>
              <div className="text-center">
                <span className="block text-3xl text-[#c4bfb6] mb-2">✗</span>
                <p className="text-[#6b6360]">Não ensina &quot;como mudar&quot;</p>
              </div>
              <div className="text-center">
                <span className="block text-3xl text-[var(--sage-green)] mb-2">✓</span>
                <p className="text-[var(--sage-green)]">Ajuda a ver com clareza</p>
              </div>
            </div>

            <blockquote className="text-xl italic text-[var(--brown-dark)] border-l-4 border-[var(--sage-green)] pl-6 py-4 bg-[#ebe7df] text-left max-w-2xl mx-auto">
              É um convite a ver — e a partir daí, escolher com mais presença.
            </blockquote>
          </div>
        </section>

        {/* Dia 1 Gratuito */}
        <section id="dia1" className="py-20 px-6 bg-gradient-to-b from-[#4a433b] to-[#3d3630]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl text-[var(--cream)] mb-4">Dia 1 — O Véu da Conformidade</h2>
              <p className="text-[#c4bfb6] text-lg">Experimenta a experiência completa. Sem registo. Sem truques.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 md:p-12">
              {/* Intenção */}
              <div className="mb-10 pb-10 border-b border-white/10">
                <h3 className="text-[var(--sage-green)] uppercase tracking-widest text-sm mb-4">Intenção do Dia</h3>
                <p className="text-[#d4cfc6] text-lg mb-4"><strong>Observar o que é vivido no automático.</strong></p>
                <p className="text-[#d4cfc6]">Não para julgar. Para reconhecer. E a partir daí, ter espaço para escolher.</p>
              </div>

              {/* Leitura */}
              <div className="mb-10 pb-10 border-b border-white/10">
                <h3 className="text-[var(--sage-green)] uppercase tracking-widest text-sm mb-4">Leitura</h3>
                <p className="text-[#d4cfc6] mb-4">Sara acordou às 6h15. Sempre acordava às 6h15.</p>
                <p className="text-[#d4cfc6] mb-4">Não porque o despertador tocasse a essa hora, mas porque o corpo já sabia. Trinta e dois anos a fazer o mesmo tinha ensinado o corpo a dispensar o alarme.</p>
                <p className="text-[#d4cfc6] mb-6">Levantou-se sem pensar. Os pés encontraram as pantufas sem que os olhos procurassem. A mão direita esticou-se para o interruptor na exacta distância necessária.</p>
                <blockquote className="text-[#c4bfb6] italic border-l-4 border-[var(--sage-green)] pl-6 py-2">
                  O dia começou. Como todos os dias começavam. E Sara não notou que não tinha notado.
                </blockquote>
                <p className="text-sm text-[#a09a90] mt-4">Continua na experiência completa...</p>
              </div>

              {/* Afirmações */}
              <div className="mb-10 pb-10 border-b border-white/10">
                <h3 className="text-[var(--sage-green)] uppercase tracking-widest text-sm mb-4">Afirmações</h3>
                <blockquote className="text-[#c4bfb6] italic border-l-4 border-[var(--sage-green)] pl-6 py-2 mb-4">
                  &quot;O que faço por hábito não é necessariamente o que escolho.&quot;
                </blockquote>
                <blockquote className="text-[#c4bfb6] italic border-l-4 border-[var(--sage-green)] pl-6 py-2 mb-4">
                  &quot;Posso funcionar bem e ainda assim estar no automático.&quot;
                </blockquote>
                <blockquote className="text-[#c4bfb6] italic border-l-4 border-[var(--sage-green)] pl-6 py-2">
                  &quot;Ver é o primeiro passo para voltar a escolher.&quot;
                </blockquote>
              </div>

              {/* Prática */}
              <div className="mb-10 pb-10 border-b border-white/10">
                <h3 className="text-[var(--sage-green)] uppercase tracking-widest text-sm mb-4">Prática de Escrita</h3>
                <p className="text-[#d4cfc6] mb-2"><strong>Pergunta do dia:</strong> &quot;O que em mim continua por hábito?&quot;</p>
                <p className="text-[#d4cfc6]">Escreve livremente. Sem julgamento. Sem censura. Apenas para ver.</p>
              </div>

              {/* Checklist */}
              <div>
                <h3 className="text-[var(--sage-green)] uppercase tracking-widest text-sm mb-4">Checklist do Dia</h3>
                <ul className="space-y-3">
                  <li className="text-[#d4cfc6] flex items-center gap-3">
                    <span className="text-[var(--sage-green)]">○</span> Li o trecho da Parte I
                  </li>
                  <li className="text-[#d4cfc6] flex items-center gap-3">
                    <span className="text-[var(--sage-green)]">○</span> Reflecti sobre as Afirmações
                  </li>
                  <li className="text-[#d4cfc6] flex items-center gap-3">
                    <span className="text-[var(--sage-green)]">○</span> Escrevi sobre a pergunta
                  </li>
                  <li className="text-[#d4cfc6] flex items-center gap-3">
                    <span className="text-[var(--sage-green)]">○</span> Fiz uma pausa de 5 minutos em silêncio
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-10">
              <p className="text-[#c4bfb6] text-lg mb-6">Este foi o Dia 1. A travessia completa tem mais 6 dias.</p>
              <Link
                href="#produtos"
                className="inline-block bg-[var(--cream)] text-[var(--brown-dark)] font-medium py-4 px-8 border-2 border-[var(--cream)] hover:bg-transparent hover:text-[var(--cream)] transition-colors uppercase tracking-wider text-sm"
              >
                Continuar Travessia
              </Link>
            </div>
          </div>
        </section>

        {/* Produtos */}
        <section id="produtos" className="py-20 px-6 bg-[#ebe7df]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl mb-4">Duas formas de atravessar</h2>
              <p className="text-[#6b6360] text-lg">Escolhe a que faz sentido para ti.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Experiência */}
              <div className="bg-[var(--cream)] p-8 border-2 border-[#ddd8cf] hover:border-[var(--brown-dark)] hover:-translate-y-2 hover:shadow-xl transition-all">
                <span className="text-xs uppercase tracking-widest text-[#6b6360]">Travessia Guiada</span>
                <h3 className="text-2xl mt-2 mb-4">Experiência de 7 Dias</h3>
                <div className="text-5xl mb-6">$59</div>

                <ul className="space-y-3 mb-8">
                  <li className="py-3 border-b border-[#ddd8cf] text-[#5a524a]">📘 Ebook completo</li>
                  <li className="py-3 border-b border-[#ddd8cf] text-[#5a524a]">🎧 Áudios rituais diários</li>
                  <li className="py-3 border-b border-[#ddd8cf] text-[#5a524a]">✅ 7 checklists diários</li>
                  <li className="py-3 border-b border-[#ddd8cf] text-[#5a524a]">🃏 7 cartas reflexivas</li>
                  <li className="py-3 border-b border-[#ddd8cf] text-[#5a524a]">📄 Guia da Experiência</li>
                  <li className="py-3 text-[#5a524a]">📄 Planner dos 7 dias</li>
                </ul>

                <Link
                  href="https://pay.hotmart.com/X103866676W?checkoutMode=10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[var(--brown-dark)] text-[var(--cream)] text-center font-medium py-4 px-8 border-2 border-[var(--brown-dark)] hover:bg-transparent hover:text-[var(--brown-dark)] transition-colors uppercase tracking-wider text-sm"
                >
                  Começar Travessia
                </Link>
              </div>

              {/* Biblioteca */}
              <div className="bg-[var(--cream)] p-8 border-4 border-[var(--sage-green)] hover:-translate-y-2 hover:shadow-xl transition-all relative">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--sage-green)] text-[var(--cream)] text-xs uppercase tracking-widest px-4 py-2">
                  Recomendado
                </span>

                <span className="text-xs uppercase tracking-widest text-[#6b6360]">Acesso Vitalício</span>
                <h3 className="text-2xl mt-2 mb-4">Biblioteca Integral</h3>
                <div className="text-5xl mb-6">$99</div>

                <ul className="space-y-3 mb-8">
                  <li className="py-3 border-b border-[#ddd8cf] text-[#5a524a]">✓ Tudo da Travessia +</li>
                  <li className="py-3 border-b border-[#ddd8cf] text-[#5a524a]">🎧 Audiobook completo narrado</li>
                  <li className="py-3 border-b border-[#ddd8cf] text-[#5a524a]">🃏 Deck 49 Cartas Reflexivas</li>
                  <li className="py-3 border-b border-[#ddd8cf] text-[#5a524a]">📦 Materiais reutilizáveis</li>
                  <li className="py-3 text-[#5a524a]">🔄 Actualizações futuras</li>
                </ul>

                <Link
                  href="https://pay.hotmart.com/X103863639K?checkoutMode=10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[var(--brown-dark)] text-[var(--cream)] text-center font-medium py-4 px-8 border-2 border-[var(--brown-dark)] hover:bg-transparent hover:text-[var(--brown-dark)] transition-colors uppercase tracking-wider text-sm"
                >
                  Biblioteca Integral
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Para Quem */}
        <section className="py-20 px-6 bg-[var(--cream)]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl text-center mb-12">Para quem é isto</h2>

            <ul className="space-y-4">
              <li className="py-4 border-b-2 border-[#ddd8cf] text-[#5a524a] text-lg">
                <span className="text-[var(--sage-green)] mr-4">→</span>
                Funciona bem por fora, mas sente que algo falta por dentro
              </li>
              <li className="py-4 border-b-2 border-[#ddd8cf] text-[#5a524a] text-lg">
                <span className="text-[var(--sage-green)] mr-4">→</span>
                Cumpre tudo, mas quer voltar a sentir que escolhe
              </li>
              <li className="py-4 border-b-2 border-[#ddd8cf] text-[#5a524a] text-lg">
                <span className="text-[var(--sage-green)] mr-4">→</span>
                Adaptou-se tanto que quer reencontrar quem é
              </li>
              <li className="py-4 text-[#5a524a] text-lg">
                <span className="text-[var(--sage-green)] mr-4">→</span>
                Começou a ver o automático e quer ter espaço para escolher
              </li>
            </ul>

            <div className="mt-8 p-6 bg-[#ebe7df] text-center text-[#6b6360] italic">
              Não é para quem procura fórmulas rápidas. É para quem quer ver com clareza e escolher com mais presença.
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 bg-[#ebe7df]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl text-center mb-12">Perguntas frequentes</h2>

            <div className="space-y-6">
              <div className="py-6 border-b-2 border-[#ddd8cf]">
                <h3 className="text-xl mb-3">Isto vai mudar a minha vida?</h3>
                <p className="text-[#6b6360]">Pode ajudar-te a ver com mais clareza. O que fazes com essa clareza é contigo.</p>
              </div>

              <div className="py-6 border-b-2 border-[#ddd8cf]">
                <h3 className="text-xl mb-3">Vou sentir-me melhor depois?</h3>
                <p className="text-[#6b6360]">Muitas pessoas sentem mais presença e mais liberdade de escolha.</p>
              </div>

              <div className="py-6 border-b-2 border-[#ddd8cf]">
                <h3 className="text-xl mb-3">Quanto tempo leva?</h3>
                <p className="text-[#6b6360]">A experiência é de 7 dias. Ao teu ritmo.</p>
              </div>

              <div className="py-6">
                <h3 className="text-xl mb-3">E se não for para mim?</h3>
                <p className="text-[#6b6360]">Experimenta o Dia 1 gratuito primeiro. Sem compromisso.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 px-6 bg-gradient-to-b from-[#4a433b] to-[#3d3630] text-center">
          <p className="text-2xl text-[var(--cream)] italic mb-8 max-w-2xl mx-auto">
            Ver é o primeiro passo para parar de perder tempo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://pay.hotmart.com/X103866676W?checkoutMode=10"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[var(--cream)] text-[var(--brown-dark)] font-medium py-4 px-8 border-2 border-[var(--cream)] hover:bg-transparent hover:text-[var(--cream)] transition-colors uppercase tracking-wider text-sm"
            >
              Começar Travessia — $59
            </Link>

            <Link
              href="https://pay.hotmart.com/X103863639K?checkoutMode=10"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-[var(--sage-green)] text-[var(--cream)] font-medium py-4 px-8 hover:bg-[var(--sage-green)]/20 transition-colors uppercase tracking-wider text-sm"
            >
              Biblioteca Integral — $99
            </Link>
          </div>
        </section>

        {/* Navegação */}
        <section className="py-8 px-6 bg-[var(--brown-dark)]">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <span></span>
            <Link href="/#os-7-veus" className="text-[var(--sage-green)] hover:text-[var(--cream)] transition-colors">
              Ver todos os véus
            </Link>
            <Link href="/veu/medo" className="text-[var(--cream)]/60 hover:text-[var(--cream)] transition-colors">
              O Véu do Medo →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
