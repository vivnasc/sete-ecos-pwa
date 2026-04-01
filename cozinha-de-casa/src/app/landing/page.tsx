import Link from "next/link";

const features = [
  {
    emoji: "📖",
    title: "Receitas da família",
    description:
      "Todas as receitas num só lugar — moçambicanas, portuguesas, internacionais. Com ingredientes, passos e vídeos.",
  },
  {
    emoji: "⚠️",
    title: "Alergias sempre visíveis",
    description:
      "Leite, trigo, ovos — cada receita mostra badges de alergia que nunca se escondem. A segurança da família em primeiro.",
  },
  {
    emoji: "📦",
    title: "Controlo de stock",
    description:
      "Sabe o que tens em casa — frigorífico, congelador, despensa. Alertas de validade e stock baixo.",
  },
  {
    emoji: "📅",
    title: "Cardápio semanal",
    description:
      "Planeia a semana inteira — jantar, lancheiras low carb, lancheiras escolares. Tudo organizado por dia.",
  },
  {
    emoji: "🛒",
    title: "Lista de compras inteligente",
    description:
      "Gerada automaticamente a partir do cardápio. Organizada por local — mercado, supermercado, talho.",
  },
  {
    emoji: "📱",
    title: "Funciona offline",
    description:
      "Instala no telemóvel como uma app. Funciona sem internet — perfeito para usar no mercado.",
  },
];

const recipeHighlights = [
  { name: "Matapa", cuisine: "🇲🇿 Moçambicana", safe: "✓ Todos" },
  { name: "Caril de Frango", cuisine: "🇲🇿 Moçambicana", safe: "✓ Todos" },
  { name: "Frango Assado", cuisine: "🇵🇹 Portuguesa", safe: "✓ Todos" },
  { name: "Butter Chicken", cuisine: "🌍 Internacional", safe: "⚠ Leite" },
  { name: "Caldeirada de Peixe", cuisine: "🇵🇹 Portuguesa", safe: "✓ Todos" },
  { name: "Stir-fry de Frango", cuisine: "🌍 Internacional", safe: "✓ Todos" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-terracotta to-terracotta-dark" />
        <div className="relative max-w-app mx-auto px-6 pt-12 pb-16 text-center">
          <img
            src="/icon-192.png"
            alt="Pitada"
            className="w-24 h-24 mx-auto mb-6 rounded-3xl shadow-lg"
          />
          <h1 className="text-4xl font-display text-white mb-3">Pitada</h1>
          <p className="text-lg text-white/90 font-body mb-2">
            A tua cozinha, organizada.
          </p>
          <p className="text-sm text-white/70 font-body max-w-xs mx-auto mb-8">
            Receitas, stock, cardápio e lista de compras — tudo o que a tua
            família precisa, numa só app.
          </p>
          <Link
            href="/login"
            className="inline-block bg-white text-terracotta font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all text-sm"
          >
            Começar agora — é grátis
          </Link>
        </div>
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 60V20C240 0 480 0 720 20C960 40 1200 40 1440 20V60H0Z"
              fill="#FBF7F0"
            />
          </svg>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="max-w-app mx-auto px-6 py-10">
        <div className="bg-white rounded-card p-6 shadow-sm border border-cream-dark">
          <h2 className="text-xl font-display text-charcoal mb-3">
            A cozinha precisa de estrutura
          </h2>
          <p className="text-sm text-stone leading-relaxed">
            Receitas repetidas. Compras desorganizadas. Alergias esquecidas.
            Ninguém sabe o que há no congelador.
          </p>
          <p className="text-sm text-charcoal font-semibold mt-3">
            A Pitada resolve isto — sem tirar a autonomia de quem cozinha.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-app mx-auto px-6 pb-10">
        <h2 className="text-2xl font-display text-charcoal text-center mb-6">
          O que a Pitada faz
        </h2>
        <div className="space-y-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-card p-4 shadow-sm border border-cream-dark flex gap-4 items-start"
            >
              <span className="text-3xl flex-shrink-0 mt-0.5">{f.emoji}</span>
              <div>
                <h3 className="font-bold text-sm text-charcoal">{f.title}</h3>
                <p className="text-xs text-stone mt-1 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recipe Preview */}
      <section className="bg-cream-dark py-10">
        <div className="max-w-app mx-auto px-6">
          <h2 className="text-2xl font-display text-charcoal text-center mb-2">
            52 receitas da família
          </h2>
          <p className="text-sm text-stone text-center mb-6">
            Moçambicanas, portuguesas e internacionais — todas com flags de
            alergia.
          </p>
          <div className="space-y-2">
            {recipeHighlights.map((r) => (
              <div
                key={r.name}
                className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-sm"
              >
                <div>
                  <span className="font-semibold text-sm text-charcoal">
                    {r.name}
                  </span>
                  <span className="text-xs text-stone ml-2">{r.cuisine}</span>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    r.safe.startsWith("✓")
                      ? "bg-olive/10 text-olive"
                      : "bg-rose/10 text-rose"
                  }`}
                >
                  {r.safe}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone text-center mt-3">
            + 46 receitas mais...
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-app mx-auto px-6 py-10">
        <h2 className="text-2xl font-display text-charcoal text-center mb-6">
          Como funciona
        </h2>
        <div className="space-y-6">
          {[
            {
              step: "1",
              title: "Regista-te",
              desc: "Magic link — sem passwords. Cria o teu household.",
            },
            {
              step: "2",
              title: "Configura a família",
              desc: "Alergias, dietas, quem come em casa, quem faz compras.",
            },
            {
              step: "3",
              title: "Planeia a semana",
              desc: "Escolhe receitas, monta o cardápio, gera a lista de compras.",
            },
            {
              step: "4",
              title: "Cozinha com confiança",
              desc: "Receitas detalhadas, stock controlado, alergias sempre visíveis.",
            },
          ].map((s) => (
            <div key={s.step} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-terracotta text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                {s.step}
              </div>
              <div>
                <h3 className="font-bold text-sm text-charcoal">{s.title}</h3>
                <p className="text-xs text-stone mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Family Safety */}
      <section className="bg-white py-10">
        <div className="max-w-app mx-auto px-6 text-center">
          <h2 className="text-2xl font-display text-charcoal mb-4">
            Segurança alimentar
          </h2>
          <div className="space-y-3">
            <div className="bg-rose/5 rounded-card p-4 border border-rose/10">
              <span className="inline-block bg-rose/10 text-rose text-xs font-bold px-3 py-1 rounded-full mb-2">
                ⚠ Contém leite/trigo
              </span>
              <p className="text-xs text-stone">
                Badge vermelha — sempre visível, nunca escondida. Protege quem
                tem intolerância.
              </p>
            </div>
            <div className="bg-amber-50 rounded-card p-4 border border-amber-100">
              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                ⚠ Contém ovos
              </span>
              <p className="text-xs text-stone">
                Badge laranja — protege quem tem alergia a ovos. Lancheiras
                escolares nunca incluem ovos.
              </p>
            </div>
            <div className="bg-olive/5 rounded-card p-4 border border-olive/10">
              <span className="inline-block bg-olive/10 text-olive text-xs font-bold px-3 py-1 rounded-full mb-2">
                ✓ Seguro para todos
              </span>
              <p className="text-xs text-stone">
                Badge verde — toda a família pode comer sem preocupação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-app mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl font-display text-charcoal mb-3">
          Organiza a tua cozinha hoje
        </h2>
        <p className="text-sm text-stone mb-6">
          Grátis. Instala no telemóvel. Sem passwords.
        </p>
        <Link
          href="/login"
          className="inline-block bg-terracotta text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-terracotta-dark active:scale-95 transition-all text-sm"
        >
          Começar agora
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal py-8">
        <div className="max-w-app mx-auto px-6 text-center">
          <img
            src="/icon-192.png"
            alt="Pitada"
            className="w-12 h-12 mx-auto mb-3 rounded-xl opacity-90"
          />
          <p className="text-sm text-white/80 font-display">Pitada</p>
          <p className="text-xs text-white/50 mt-1">
            A tua cozinha, organizada.
          </p>
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-white/40">
              Powered by{" "}
              <a
                href="https://seteecos.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta-light hover:text-terracotta transition-colors"
              >
                Sete Ecos
              </a>
            </p>
            <p className="text-[10px] text-white/30 mt-1">
              <a
                href="mailto:suporte@seteecos.com"
                className="hover:text-white/50 transition-colors"
              >
                suporte@seteecos.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
