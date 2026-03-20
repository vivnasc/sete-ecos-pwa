"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getCursoBySlug, getCategoriaById } from "@/data/cursos";

export default function ModuloPage() {
  const { slug, modulo } = useParams<{ slug: string; modulo: string }>();
  const curso = getCursoBySlug(slug);
  if (!curso) return null;

  const moduloNum = parseInt(modulo, 10);
  const mod = curso.modulos.find((m) => m.numero === moduloNum);
  if (!mod) return null;

  const cat = getCategoriaById(curso.categoriaId);
  const prevMod = curso.modulos.find((m) => m.numero === moduloNum - 1);
  const nextMod = curso.modulos.find((m) => m.numero === moduloNum + 1);

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <section className="pt-14 pb-6 px-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href={`/cursos/${slug}`}
            className="text-escola-muted-dark text-xs hover:text-escola-muted transition-colors mb-6 inline-block"
          >
            &larr; {curso.titulo}
          </Link>

          {cat && (
            <span
              className="text-[10px] uppercase tracking-[0.2em] block mb-2"
              style={{ color: cat.cor }}
            >
              Módulo {mod.numero} de {curso.modulos.length}
            </span>
          )}

          <h1 className="text-2xl sm:text-3xl text-escola-creme mb-2">
            {mod.titulo}
          </h1>
          <p className="text-escola-muted text-sm">{mod.descricao}</p>
        </div>
      </section>

      {/* Video placeholder */}
      <section className="px-4 max-w-2xl mx-auto mb-8">
        <div className="aspect-video rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <div className="text-center">
            <span className="text-3xl block mb-2">▶</span>
            <span className="text-escola-muted-dark text-xs">
              Vídeo da aula
            </span>
          </div>
        </div>
      </section>

      {/* Sub-aulas */}
      <section className="px-4 max-w-2xl mx-auto mb-8">
        <h2 className="text-sm text-escola-creme mb-3 px-2">
          Aulas deste módulo
        </h2>
        <div className="space-y-2">
          {mod.subAulas.map((sub) => (
            <div
              key={sub.letra}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
            >
              <span className="text-escola-dourado text-xs font-medium w-5 text-center flex-shrink-0 mt-0.5">
                {sub.letra}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm text-escola-creme">{sub.titulo}</h3>
                <p className="text-xs text-escola-muted-dark mt-0.5">
                  {sub.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Caderno */}
      <section className="px-4 max-w-2xl mx-auto mb-8">
        <div className="p-4 rounded-xl bg-escola-dourado/[0.08] border border-escola-dourado/20">
          <div className="flex items-center gap-3">
            <span className="text-lg">📓</span>
            <div>
              <h3 className="text-sm text-escola-creme">Caderno de exercícios</h3>
              <p className="text-xs text-escola-muted">{mod.caderno}</p>
            </div>
            <button className="ml-auto text-xs text-escola-dourado hover:text-escola-creme transition-colors px-3 py-1.5 rounded-lg border border-escola-dourado/30 hover:border-escola-dourado/60">
              Abrir
            </button>
          </div>
        </div>
      </section>

      {/* Nav prev/next */}
      <section className="px-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          {prevMod ? (
            <Link
              href={`/cursos/${slug}/${prevMod.numero}`}
              className="text-xs text-escola-muted-dark hover:text-escola-muted transition-colors"
            >
              &larr; {prevMod.titulo}
            </Link>
          ) : (
            <span />
          )}
          {nextMod ? (
            <Link
              href={`/cursos/${slug}/${nextMod.numero}`}
              className="text-xs text-escola-muted-dark hover:text-escola-muted transition-colors text-right"
            >
              {nextMod.titulo} &rarr;
            </Link>
          ) : (
            <span className="text-xs text-escola-dourado">
              Último módulo
            </span>
          )}
        </div>
      </section>
    </main>
  );
}
