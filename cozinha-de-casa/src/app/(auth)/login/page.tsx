"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    alert("Magic link enviado!");
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/icon-192.png" alt="Pitada" className="w-20 h-20 mx-auto mb-4 rounded-2xl" />
          <h1 className="text-3xl font-display text-charcoal">
            Pitada
          </h1>
          <p className="text-sm text-stone mt-2">
            A tua cozinha, organizada.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="o-teu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={sent}
          >
            {sent ? "A enviar..." : "Entrar com magic link"}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-xs text-stone-light text-center mt-8">
          Ao entrar, aceitas os termos de utilização.
        </p>
      </div>
    </div>
  );
}
