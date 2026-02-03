import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SeEstasAqui from "@/components/SeEstasAqui";
import OQueExiste from "@/components/OQueExiste";
import Os7Veus from "@/components/Os7Veus";
import Livro from "@/components/Livro";
import Recursos from "@/components/Recursos";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SeEstasAqui />
        <OQueExiste />
        <Os7Veus />
        <Livro />
        <Recursos />
      </main>
      <Footer />
    </>
  );
}
