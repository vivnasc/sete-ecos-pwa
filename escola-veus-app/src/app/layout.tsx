import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import NavBar from "@/components/escola/NavBar";

export const metadata: Metadata = {
  title: "Escola dos Véus | Cursos de autoconhecimento",
  description: "20 cursos de autoconhecimento organizados em 4 categorias. Vídeos, cadernos de exercícios e materiais para a tua transformação.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Escola dos Véus",
  },
  openGraph: {
    title: "Escola dos Véus",
    description: "Cursos de autoconhecimento — 20 travessias para voltar a ti.",
    type: "website",
    locale: "pt_PT",
    siteName: "Escola dos Véus",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0D1A",
  width: "device-width",
  initialScale: 1,
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
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-[#C9A96E] focus:text-[#0D0D1A]">
          Saltar para o conteúdo
        </a>
        <AuthProvider>
          <div id="main-content" className="pb-20">
            {children}
          </div>
          <NavBar />
        </AuthProvider>
      </body>
    </html>
  );
}
