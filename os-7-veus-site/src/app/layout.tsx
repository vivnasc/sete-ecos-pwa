import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Os 7 Véus | A sabedoria que não devias ter de esperar",
  description: "Um sistema editorial que trabalha padrões automáticos de vida. Livros literários, experiências guiadas e ferramentas de auto-observação.",
  keywords: ["7 véus", "autoconhecimento", "livros", "desenvolvimento pessoal", "Vivianne"],
  authors: [{ name: "Vivianne" }],
  openGraph: {
    title: "Os 7 Véus | A sabedoria que não devias ter de esperar",
    description: "O que eu queria ter lido aos 25.",
    type: "website",
    locale: "pt_PT",
    siteName: "Os 7 Véus",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Quicksand:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
