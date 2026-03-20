"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ContaPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-escola-muted-dark text-sm" role="status">A carregar...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl text-escola-creme mb-3">A tua conta</h1>
          <p className="text-escola-muted text-sm mb-6">
            Entra para ver a tua conta e os teus cursos.
          </p>
          <Link
            href="/entrar"
            className="inline-block bg-escola-dourado text-escola-bg font-medium px-6 py-3 rounded-lg hover:bg-escola-dourado/90 transition-all text-sm"
          >
            Entrar
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 pt-14 pb-24">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl text-escola-creme mb-6">A tua conta</h1>

        {/* Info */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4">
          <p className="text-sm text-escola-creme">
            {user.user_metadata?.nome || user.email}
          </p>
          <p className="text-xs text-escola-muted-dark mt-0.5">{user.email}</p>
        </div>

        {/* Subscrição */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4">
          <h2 className="text-sm text-escola-creme mb-2">Subscrição</h2>
          <p className="text-xs text-escola-muted-dark">
            Sem subscrição activa
          </p>
          <Link
            href="/subscrever"
            className="inline-block mt-3 text-xs text-escola-dourado hover:underline"
          >
            Subscrever &rarr;
          </Link>
        </div>

        {/* Sair */}
        <button
          onClick={async () => { await signOut(); router.push("/"); }}
          className="w-full mt-4 text-sm text-escola-muted-dark hover:text-escola-muted py-3 transition-colors"
        >
          Sair da conta
        </button>
      </div>
    </main>
  );
}
