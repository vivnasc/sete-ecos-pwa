import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Simulador de WhatsApp Chatbot — testa respostas sem usar API real
 *
 * Usa o endpoint /api/whatsapp-webhook?mode=test que chama gerarResposta()
 * exactamente como o webhook Meta real, mas sem enviar via WhatsApp.
 */

const QUICK_TESTS = [
  { label: 'Olá', msg: 'ola' },
  { label: '1 Vitalis', msg: '1' },
  { label: '2 Lumina', msg: '2' },
  { label: '3 Áurea', msg: '3' },
  { label: '4 Preços', msg: '4' },
  { label: '5 Pagamento', msg: '5' },
  { label: '6 Trial', msg: '6' },
  { label: '7 Vivianne', msg: '7' },
  { label: 'mpesa', msg: 'quero pagar por mpesa' },
  { label: 'receita', msg: 'tens receitas?' },
  { label: 'bundle', msg: 'bundle' },
  { label: 'comunidade', msg: 'comunidade' },
  { label: 'random', msg: 'xpto abc 123' },
];

export default function ChatbotTeste() {
  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensagens]);

  const enviar = async (texto) => {
    const msg = texto || input.trim();
    if (!msg) return;
    setInput('');

    // Adicionar mensagem do "utilizador"
    setMensagens(prev => [...prev, { tipo: 'user', texto: msg, hora: new Date() }]);
    setLoading(true);

    try {
      const res = await fetch('/api/whatsapp-webhook?mode=test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: msg, nome: 'Teste Coach' }),
      });

      const data = await res.json();

      setMensagens(prev => [...prev, {
        tipo: 'bot',
        texto: data.resposta || 'Sem resposta',
        notificarCoach: data.notificarCoach,
        hora: new Date(),
      }]);
    } catch (err) {
      setMensagens(prev => [...prev, {
        tipo: 'erro',
        texto: `Erro: ${err.message}. Verifica se o dev server ou Vercel está a correr.`,
        hora: new Date(),
      }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const limpar = () => setMensagens([]);

  return (
    <div className="min-h-screen bg-[#0B141A] flex flex-col">
      {/* Header estilo WhatsApp */}
      <header className="bg-[#1F2C33] px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <Link to="/coach" className="text-white/60 hover:text-white text-sm">← Coach</Link>
        <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-lg">🤖</div>
        <div className="flex-1">
          <h1 className="text-white font-semibold text-sm">Sete Ecos Bot — Simulador</h1>
          <p className="text-[#8696A0] text-xs">Testa respostas do chatbot WhatsApp</p>
        </div>
        <button onClick={limpar} className="text-[#8696A0] hover:text-white text-xs px-3 py-1 rounded-lg border border-white/10">
          Limpar
        </button>
      </header>

      {/* Quick test buttons */}
      <div className="bg-[#1F2C33]/50 px-3 py-2 flex gap-1.5 overflow-x-auto border-b border-white/5">
        {QUICK_TESTS.map(t => (
          <button
            key={t.msg}
            onClick={() => enviar(t.msg)}
            disabled={loading}
            className="shrink-0 px-3 py-1 rounded-full bg-[#25D366]/15 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/25 transition-all border border-[#25D366]/20 disabled:opacity-50"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'p\' width=\'40\' height=\'40\' patternUnits=\'userSpaceOnUse\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1\' fill=\'%23ffffff08\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill=\'url(%23p)\' width=\'200\' height=\'200\'/%3E%3C/svg%3E")' }}>
        {mensagens.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-[#8696A0] text-sm">Envia uma mensagem para testar o chatbot</p>
            <p className="text-[#8696A0]/60 text-xs mt-1">Usa os botões rápidos em cima ou escreve</p>
          </div>
        )}

        {mensagens.map((m, i) => (
          <div key={i} className={`flex ${m.tipo === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 ${
              m.tipo === 'user'
                ? 'bg-[#005C4B] text-white'
                : m.tipo === 'erro'
                  ? 'bg-red-900/40 text-red-300 border border-red-500/30'
                  : 'bg-[#1F2C33] text-[#E9EDEF]'
            }`}>
              {m.notificarCoach && (
                <div className="text-[10px] text-amber-400 font-bold mb-1 flex items-center gap-1">
                  ⚠ Notificaria a Vivianne
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.texto}</p>
              <p className={`text-[10px] mt-1 text-right ${m.tipo === 'user' ? 'text-white/40' : 'text-[#8696A0]'}`}>
                {m.hora.toLocaleTimeString('pt', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1F2C33] rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#8696A0] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#8696A0] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#8696A0] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-[#1F2C33] px-3 py-2 flex items-center gap-2 border-t border-white/5">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar()}
          placeholder="Escreve uma mensagem..."
          disabled={loading}
          className="flex-1 bg-[#2A3942] text-white rounded-xl px-4 py-2.5 text-sm placeholder-[#8696A0] outline-none focus:ring-1 focus:ring-[#25D366]/50 disabled:opacity-50"
        />
        <button
          onClick={() => enviar()}
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:bg-[#20BD5A] transition-all disabled:opacity-30"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
