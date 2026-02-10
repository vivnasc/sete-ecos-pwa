/**
 * SkipLink — Componente de acessibilidade para saltar para o conteúdo principal.
 * Visível apenas no foco por teclado (Tab).
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-purple-700 focus:font-semibold focus:ring-2 focus:ring-purple-500"
    >
      Saltar para o conteudo principal
    </a>
  )
}
