export default function OQueExiste() {
  const items = [
    {
      title: "Livros literários",
      description: "histórias que funcionam como espelhos"
    },
    {
      title: "Experiências guiadas",
      description: "percursos práticos de auto-observação"
    },
    {
      title: "Ferramentas de pausa",
      description: "recursos para quebrar o automático"
    },
    {
      title: "Comunidade silenciosa",
      description: "presença sem ruído"
    }
  ];

  return (
    <section className="py-20 px-6 bg-[var(--cream)]">
      <div className="max-w-3xl mx-auto">
        <div className="w-full h-px bg-[var(--sage-green)]/30 mb-16"></div>

        <h2 className="text-3xl md:text-4xl text-[var(--text-dark)] mb-8">
          O que existe aqui
        </h2>

        <p className="text-[var(--text-dark)]/80 mb-10">
          <strong>Os 7 Véus</strong> é um sistema editorial que trabalha padrões automáticos de vida através de:
        </p>

        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-[var(--text-dark)]/80">
              <span className="text-[var(--sage-green)]">→</span>
              <span>
                <strong>{item.title}</strong> — {item.description}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
