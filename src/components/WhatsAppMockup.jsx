import React from 'react';

/**
 * WhatsAppMockup - Simula um print de conversa WhatsApp
 * Usado nas landing pages para mostrar depoimentos reais com mais credibilidade
 *
 * Props:
 * - mensagens: Array de { texto, hora, tipo: 'enviada' | 'recebida' }
 * - contacto: String com iniciais ou nome do contacto (ex: "MJ")
 * - corTema: 'verde' (Vitalis) | 'dourado' (Aurea) - adapta as cores
 */
const WhatsAppMockup = ({ mensagens = [], contacto = '', corTema = 'verde' }) => {
  const cores = corTema === 'dourado' ? {
    header: '#1F2C34',
    bg: '#0B141A',
    wallpaper: '#0B141A',
    enviada: '#005C4B',
    recebida: '#1F2C34',
    textoEnviada: '#E9EDEF',
    textoRecebida: '#E9EDEF',
    hora: 'rgba(233, 237, 239, 0.5)',
    borda: 'rgba(196, 167, 96, 0.3)',
    acento: '#C4A760',
  } : {
    header: '#1F2C34',
    bg: '#0B141A',
    wallpaper: '#0B141A',
    enviada: '#005C4B',
    recebida: '#1F2C34',
    textoEnviada: '#E9EDEF',
    textoRecebida: '#E9EDEF',
    hora: 'rgba(233, 237, 239, 0.5)',
    borda: 'rgba(124, 139, 111, 0.3)',
    acento: '#7C8B6F',
  };

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-xl max-w-sm mx-auto"
      style={{ border: `2px solid ${cores.borda}`, fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif" }}
    >
      {/* Header WhatsApp */}
      <div
        className="flex items-center gap-3 px-3 py-2.5"
        style={{ background: cores.header }}
      >
        {/* Seta voltar */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#E9EDEF" opacity="0.7">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #667B68, #4A5D4C)' }}
        >
          {contacto}
        </div>
        {/* Nome (censurado) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="h-3.5 rounded-full" style={{ width: '80px', background: 'rgba(233, 237, 239, 0.15)' }}></div>
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(233, 237, 239, 0.45)' }}>online</div>
        </div>
        {/* Ícones do header */}
        <div className="flex items-center gap-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#E9EDEF" opacity="0.5">
            <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 00-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.58l2.2-2.21c.28-.27.36-.66.25-1.01A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>
          </svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#E9EDEF" opacity="0.5">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
      </div>

      {/* Área de chat */}
      <div
        className="px-3 py-4 space-y-2 min-h-[120px] relative"
        style={{ background: cores.wallpaper }}
      >
        {/* Pattern de fundo subtil */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="relative z-10 space-y-2">
          {mensagens.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.tipo === 'enviada' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="relative rounded-lg px-3 py-2 max-w-[85%]"
                style={{
                  background: msg.tipo === 'enviada' ? cores.enviada : cores.recebida,
                  borderTopLeftRadius: msg.tipo === 'recebida' ? '2px' : undefined,
                  borderTopRightRadius: msg.tipo === 'enviada' ? '2px' : undefined,
                }}
              >
                {/* Triângulo/tail da bolha */}
                <div
                  className="absolute top-0"
                  style={{
                    [msg.tipo === 'enviada' ? 'right' : 'left']: '-6px',
                    width: 0,
                    height: 0,
                    borderTop: `6px solid ${msg.tipo === 'enviada' ? cores.enviada : cores.recebida}`,
                    borderLeft: msg.tipo === 'enviada' ? '6px solid transparent' : undefined,
                    borderRight: msg.tipo === 'recebida' ? '6px solid transparent' : undefined,
                  }}
                ></div>

                <p
                  className="text-sm leading-relaxed pr-14"
                  style={{ color: msg.tipo === 'enviada' ? cores.textoEnviada : cores.textoRecebida }}
                >
                  {msg.texto}
                </p>

                {/* Hora + ticks */}
                <div
                  className="absolute bottom-1.5 right-2 flex items-center gap-1"
                  style={{ color: cores.hora }}
                >
                  <span className="text-[10px]">{msg.hora}</span>
                  {msg.tipo === 'enviada' && (
                    <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                      <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.36-.186.478.478 0 0 0-.344.131.486.486 0 0 0-.14.361.49.49 0 0 0 .157.347l2.391 2.49a.462.462 0 0 0 .347.162h.043a.518.518 0 0 0 .36-.2l6.545-8.076a.467.467 0 0 0 .102-.383.464.464 0 0 0-.215-.263z" fill="#53BDEB"/>
                      <path d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.2-1.25-.313.39 1.468 1.53a.462.462 0 0 0 .347.162h.043a.518.518 0 0 0 .36-.2l6.545-8.076a.467.467 0 0 0 .102-.383.464.464 0 0 0-.215-.263z" fill="#53BDEB"/>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barra de input (decorativa) */}
      <div
        className="flex items-center gap-2 px-2 py-2"
        style={{ background: cores.header }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#E9EDEF" opacity="0.4">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
        <div
          className="flex-1 rounded-full px-4 py-2 text-sm"
          style={{ background: 'rgba(233, 237, 239, 0.08)', color: 'rgba(233, 237, 239, 0.35)' }}
        >
          Mensagem
        </div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#E9EDEF" opacity="0.4">
          <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
        </svg>
      </div>
    </div>
  );
};

export default WhatsAppMockup;
