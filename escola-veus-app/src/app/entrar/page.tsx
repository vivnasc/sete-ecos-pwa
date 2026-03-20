"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function EntrarPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "registo">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      if (modo === "login") {
        const { error } = await signIn(email, password);
        if (error) { setErro("Email ou palavra-passe incorrectos."); return; }
      } else {
        if (!nome.trim()) { setErro("Escreve o teu nome."); return; }
        const { error } = await signUp(email, password, nome);
        if (error) { setErro("Erro ao criar conta. Tenta outro email."); return; }
      }
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-escola-dourado text-[10px] uppercase tracking-[0.3em] block mb-2">
            Escola dos Véus
          </span>
          <h1 className="text-2xl text-escola-creme">
            {modo === "login" ? "Entrar" : "Criar conta"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === "registo" && (
            <div>
              <label className="text-xs text-escola-muted-dark block mb-1">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-escola-creme placeholder:text-escola-muted-dark focus:outline-none focus:border-escola-dourado/50 transition-colors"
                placeholder="O teu nome"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-escola-muted-dark block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-escola-creme placeholder:text-escola-muted-dark focus:outline-none focus:border-escola-dourado/50 transition-colors"
              placeholder="o-teu@email.com"
            />
          </div>

          <div>
            <label className="text-xs text-escola-muted-dark block mb-1">Palavra-passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-escola-creme placeholder:text-escola-muted-dark focus:outline-none focus:border-escola-dourado/50 transition-colors"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {erro && (
            <p className="text-red-400 text-xs" role="alert">{erro}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-escola-dourado text-escola-bg font-medium py-3 rounded-lg hover:bg-escola-dourado/90 active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
          >
            {loading
              ? "A carregar..."
              : modo === "login"
              ? "Entrar"
              : "Criar conta e começar 7 dias grátis"}
          </button>
        </form>

        <p className="text-center text-xs text-escola-muted-dark mt-6">
          {modo === "login" ? (
            <>
              Ainda não tens conta?{" "}
              <button onClick={() => { setModo("registo"); setErro(""); }} className="text-escola-dourado hover:underline">
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tens conta?{" "}
              <button onClick={() => { setModo("login"); setErro(""); }} className="text-escola-dourado hover:underline">
                Entrar
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
