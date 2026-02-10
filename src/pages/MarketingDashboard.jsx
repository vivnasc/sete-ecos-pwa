import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isSessionCoach } from '../lib/coach';
import { supabase } from '../lib/supabase';
import {
  getGridInstagram,
  getAnunciosPagos,
  getSemana1,
  getSemana2,
  getCarrosseisProntos,
  gerarConteudoHoje,
  gerarMensagemWhatsApp,
  gerarCaptionInstagram,
  getConteudosMockupVitalis,
  getMensagensWhatsAppMockups,
  getSetupInstagram,
  getCalendario6Dias,
} from '../lib/marketing-engine';
import { RENDER_MAP, CORES, FORMATOS } from '../components/TemplateVisual';

// ============================================================
// AUTO IMAGE - Gera imagem automaticamente
// ============================================================

function AutoImage({ template, eco, formato, texto, subtitulo, slideNum, totalSlides, scale, filename, className }) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const render = async () => {
      try {
        const renderFn = RENDER_MAP[template];
        if (!renderFn) return;
        await renderFn(canvas, { formato: formato || 'post', eco: eco || 'vitalis', texto, subtitulo, slideNum, totalSlides });
        setDataUrl(canvas.toDataURL('image/png'));
      } catch (e) {
        console.error('Erro ao gerar imagem:', e);
      }
    };
    if (texto) render();
  }, [template, eco, formato, texto, subtitulo, slideNum, totalSlides]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.download = filename || `sete-ecos-${eco}-${Date.now()}.png`;
    a.href = dataUrl;
    a.click();
  };

  const dim = FORMATOS[formato || 'post'];
  const s = scale || (formato === 'stories' ? 0.16 : 0.28);
  const w = dim.width * s;
  const h = dim.height * s;

  if (!dataUrl) {
    return <div style={{ width: w, height: h }} className={`bg-gray-200 rounded-xl animate-pulse shrink-0 ${className || ''}`} />;
  }

  return (
    <div className={`relative group shrink-0 ${className || ''}`}>
      <img src={dataUrl} style={{ width: w, height: h }} className="rounded-xl shadow-md object-cover" alt="" />
      <button onClick={download} className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-[#4A4035] shadow opacity-0 group-hover:opacity-100 transition-opacity">
        ⬇ PNG
      </button>
    </div>
  );
}

// ============================================================
// MOCKUP SLIDE - Imagem composta: mockup + texto sobreposto
// Gera slides de carrossel PRONTOS a publicar no Instagram
// ============================================================

function MockupSlide({ mockupSrc, texto, subtitulo, slideLabel, isCover, slideNum, totalSlides, filename, size }) {
  const [dataUrl, setDataUrl] = useState(null);
  const canvasSize = size || 1080;

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
      if (isCover) {
        grad.addColorStop(0, '#1a1a2e');
        grad.addColorStop(0.5, '#16213e');
        grad.addColorStop(1, '#0f3460');
      } else {
        grad.addColorStop(0, '#2d3436');
        grad.addColorStop(1, '#1a1a2e');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // Draw mockup image
      const mockupW = canvasSize * 0.55;
      const aspectRatio = img.height / img.width;
      const mockupH = mockupW * aspectRatio;
      const maxMockupH = canvasSize * 0.55;
      const finalH = Math.min(mockupH, maxMockupH);
      const finalW = finalH / aspectRatio;
      const mockupX = canvasSize - finalW - 40;
      const mockupY = canvasSize - finalH - 20;

      // Mockup shadow
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 10;
      ctx.shadowOffsetY = 10;

      // Rounded corners for mockup
      const r = 16;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(mockupX, mockupY, finalW, finalH, r);
      ctx.clip();
      ctx.drawImage(img, mockupX, mockupY, finalW, finalH);
      ctx.restore();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Slide number badge
      if (slideNum && totalSlides) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.roundRect(40, 40, 80, 36, 18);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${slideNum}/${totalSlides}`, 80, 64);
      }

      // Text area (left side, top)
      const textX = 50;
      const maxTextW = canvasSize * 0.58;
      let textY = slideNum ? 110 : 80;

      // Main text
      ctx.textAlign = 'left';
      if (isCover) {
        // Cover: bigger text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, sans-serif';
        const lines = wrapText(ctx, texto, maxTextW);
        lines.forEach(line => {
          ctx.fillText(line, textX, textY);
          textY += 64;
        });
      } else {
        // Content slide
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, sans-serif';
        const lines = wrapText(ctx, texto, maxTextW);
        lines.forEach(line => {
          ctx.fillText(line, textX, textY);
          textY += 50;
        });
      }

      // Subtitle
      if (subtitulo) {
        textY += 16;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif';
        const subLines = wrapText(ctx, subtitulo, maxTextW);
        subLines.forEach(line => {
          ctx.fillText(line, textX, textY);
          textY += 32;
        });
      }

      // Brand watermark
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('@seteecos', 50, canvasSize - 30);

      // Swipe indicator on cover
      if (isCover) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('Desliza →', canvasSize - 50, canvasSize - 30);
      }

      // VITALIS accent line
      ctx.fillStyle = '#7C8B6F';
      ctx.fillRect(textX, textY + 10, 60, 4);

      setDataUrl(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => {
      // Fallback: text-only slide
      const grad = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
      grad.addColorStop(0, '#1a1a2e');
      grad.addColorStop(1, '#0f3460');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      const lines = wrapText(ctx, texto, canvasSize * 0.8);
      let y = canvasSize / 2 - (lines.length * 58) / 2;
      lines.forEach(line => { ctx.fillText(line, canvasSize / 2, y); y += 58; });

      if (subtitulo) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '28px -apple-system, BlinkMacSystemFont, sans-serif';
        const subLines = wrapText(ctx, subtitulo, canvasSize * 0.75);
        y += 20;
        subLines.forEach(line => { ctx.fillText(line, canvasSize / 2, y); y += 36; });
      }

      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('@seteecos', canvasSize / 2, canvasSize - 30);

      setDataUrl(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = mockupSrc;
  }, [mockupSrc, texto, subtitulo, isCover, slideNum, totalSlides, canvasSize]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.download = filename || `slide-${slideNum || 1}.jpg`;
    a.href = dataUrl;
    a.click();
  };

  const displayW = 280;
  const displayH = 280;

  if (!dataUrl) {
    return <div style={{ width: displayW, height: displayH }} className="bg-gray-200 rounded-xl animate-pulse shrink-0" />;
  }

  return (
    <div className="relative group shrink-0">
      <img src={dataUrl} style={{ width: displayW, height: displayH }} className="rounded-xl shadow-md object-cover" alt={texto} />
      <button onClick={download} className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-[#4A4035] shadow opacity-0 group-hover:opacity-100 transition-opacity">
        ⬇ JPG
      </button>
      {slideLabel && (
        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
          {slideLabel}
        </div>
      )}
    </div>
  );
}

// Utility: wrap text to fit canvas width
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    const test = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// ============================================================
// MAIN DASHBOARD
// ============================================================

export default function MarketingDashboard() {
  const { session } = useAuth();
  const [tab, setTab] = useState('vitalis');
  const [copiado, setCopied] = useState('');

  const copiar = async (texto, label) => {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  if (!isSessionCoach(session)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED]">
        <p className="text-[#6B5C4C]">Acesso restrito.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'vitalis', label: 'VITALIS (12)', icon: '📱' },
    { id: 'hoje', label: 'Hoje', icon: '⚡' },
    { id: 'plano', label: 'Plano Semanal', icon: '🗓' },
    { id: 'grid', label: 'Grid IG (12)', icon: '📸' },
    { id: 'anuncios', label: 'Anúncios', icon: '📣' },
    { id: 'carrosseis', label: 'Carrosséis', icon: '📑' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F2ED] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Link to="/coach" className="text-white/60 hover:text-white text-sm">&larr; Coach</Link>
            <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full border border-white/20">LANÇAMENTO</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Plano de Lançamento
          </h1>
          <p className="text-white/50 text-sm mt-1">8-21 Fevereiro 2026 &middot; Semana 1: Aquecer &middot; Semana 2: Lançar</p>
          <div className="grid grid-cols-5 gap-2 mt-4">
            {[
              { v: '12', l: 'Mockups' },
              { v: '12', l: 'Posts Grid' },
              { v: '4', l: 'Anúncios' },
              { v: String(getCarrosseisProntos().length), l: 'Carrosséis' },
              { v: '14', l: 'Dias' },
            ].map(s => (
              <div key={s.l} className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
                <p className="text-xl font-bold">{s.v}</p>
                <p className="text-[9px] text-white/40">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 -mt-3">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                tab === t.id ? 'bg-[#1a1a2e] text-white shadow-lg' : 'bg-white text-[#6B5C4C] border border-[#E8E2D9]'
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4 space-y-4">
        {tab === 'vitalis' && <VitalisTab copiar={copiar} copiado={copiado} />}
        {tab === 'hoje' && <HojeTab copiar={copiar} copiado={copiado} />}
        {tab === 'plano' && <PlanoTab copiar={copiar} copiado={copiado} />}
        {tab === 'grid' && <GridTab copiar={copiar} copiado={copiado} />}
        {tab === 'anuncios' && <AnunciosTab copiar={copiar} copiado={copiado} />}
        {tab === 'carrosseis' && <CarrosseisTab copiar={copiar} copiado={copiado} />}
      </div>
    </div>
  );
}

// ============================================================
// TAB: VITALIS - Kit completo: setup + calendário dia-a-dia
// ============================================================

function VitalisTab({ copiar, copiado }) {
  const conteudos = getConteudosMockupVitalis();
  const mensagensWA = getMensagensWhatsAppMockups();
  const setup = getSetupInstagram();
  const calendario = getCalendario6Dias();
  const [expandido, setExpandido] = useState(null);
  const [secao, setSecao] = useState('calendario');
  const [diaAberto, setDiaAberto] = useState(0);

  const tipoLabel = (tipo) => {
    switch (tipo) {
      case 'feed': return { label: 'FEED', cor: 'bg-blue-100 text-blue-700' };
      case 'carrossel': return { label: 'CARROSSEL', cor: 'bg-purple-100 text-purple-700' };
      case 'reel': return { label: 'REEL', cor: 'bg-pink-100 text-pink-700' };
      default: return { label: tipo, cor: 'bg-gray-100 text-gray-700' };
    }
  };

  const ticoTarefa = (tipo) => {
    switch (tipo) {
      case 'post': return { icon: '📸', cor: 'border-l-pink-400 bg-pink-50' };
      case 'whatsapp': return { icon: '💬', cor: 'border-l-green-400 bg-green-50' };
      case 'stories': return { icon: '📱', cor: 'border-l-purple-400 bg-purple-50' };
      case 'setup': return { icon: '⚙️', cor: 'border-l-blue-400 bg-blue-50' };
      case 'interaccao': return { icon: '💬', cor: 'border-l-amber-400 bg-amber-50' };
      case 'analise': return { icon: '📊', cor: 'border-l-indigo-400 bg-indigo-50' };
      default: return { icon: '📌', cor: 'border-l-gray-400 bg-gray-50' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Secção selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'calendario', label: 'Calendário 6 Dias', icon: '📅' },
          { id: 'setup', label: 'Setup Instagram', icon: '⚙️' },
          { id: 'instagram', label: 'Posts (12)', icon: '📸' },
          { id: 'whatsapp', label: 'WhatsApp (7)', icon: '💬' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setSecao(s.id)}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              secao === s.id ? 'bg-[#1a1a2e] text-white shadow-lg' : 'bg-white text-[#6B5C4C] border border-[#E8E2D9]'
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* =================== SETUP INSTAGRAM =================== */}
      {secao === 'setup' && (
        <>
          <Card titulo="Configurar perfil @seteecos" badge="PASSO 1">
            <div className="space-y-4">
              {/* Bio */}
              <div>
                <p className="text-xs font-bold text-[#6B5C4C] mb-1">Bio (copiar exactamente):</p>
                <div className="bg-[#FAFAF8] rounded-lg p-3 border">
                  <p className="text-sm text-[#4A4035] whitespace-pre-wrap font-medium">{setup.bio}</p>
                </div>
                <CopyBtn onClick={() => copiar(setup.bio, 'bio')} copiado={copiado === 'bio' ? '✓' : ''} label="📋 Copiar Bio" small />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FAFAF8] rounded-lg p-3">
                  <p className="text-[10px] text-[#A09888]">Nome do perfil</p>
                  <p className="text-sm font-bold text-[#4A4035]">{setup.nome}</p>
                </div>
                <div className="bg-[#FAFAF8] rounded-lg p-3">
                  <p className="text-[10px] text-[#A09888]">Categoria</p>
                  <p className="text-sm font-bold text-[#4A4035]">{setup.categoria}</p>
                </div>
                <div className="bg-[#FAFAF8] rounded-lg p-3 col-span-2">
                  <p className="text-[10px] text-[#A09888]">Link na bio</p>
                  <p className="text-sm font-bold text-[#4A4035]">{setup.linkTexto}</p>
                  <p className="text-[10px] text-green-600 mt-1">LUMINA primeiro (gratuito = mais cliques)</p>
                </div>
              </div>

              {/* Foto */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-bold text-amber-800">📸 Foto de perfil:</p>
                <p className="text-xs text-amber-700 mt-1">{setup.fotoPerfil}</p>
              </div>
            </div>
          </Card>

          <Card titulo="Destaques (Highlights)" badge="PASSO 2">
            <div className="space-y-2">
              {setup.destaques.map((d, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#FAFAF8] rounded-lg p-3">
                  <span className="text-lg">{d.nome.split(' ')[0]}</span>
                  <div>
                    <p className="text-sm font-bold text-[#4A4035]">{d.nome}</p>
                    <p className="text-xs text-[#A09888]">{d.descricao}</p>
                    <p className="text-[10px] text-[#A09888]">Cor: {d.cor}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card titulo="Primeiros passos" badge="PASSO 3">
            <div className="space-y-2">
              {setup.primeirosPassos.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1a1a2e] text-white text-xs flex items-center justify-center shrink-0 font-bold">{i + 1}</span>
                  <p className="text-xs text-[#4A4035]">{p}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* =================== CALENDÁRIO 6 DIAS =================== */}
      {secao === 'calendario' && (
        <>
          <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white rounded-xl p-4">
            <h3 className="font-bold text-lg">Calendário: 6 Dias para Popular o Instagram</h3>
            <p className="text-white/70 text-sm mt-1">Segue cada passo. Tudo está pronto — só precisas de copiar e publicar.</p>
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {calendario.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setDiaAberto(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    diaAberto === i ? 'bg-white text-[#1a1a2e]' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Dia {d.dia}
                </button>
              ))}
            </div>
          </div>

          {/* Dia seleccionado */}
          {calendario[diaAberto] && (() => {
            const dia = calendario[diaAberto];
            return (
              <div className="space-y-3">
                <div className="bg-white rounded-xl border border-[#E8E2D9] p-4">
                  <h3 className="font-bold text-lg text-[#4A4035]">{dia.titulo}</h3>
                  <p className="text-xs text-[#A09888] mt-1">{dia.subtitulo}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] bg-[#1a1a2e]/10 px-2 py-0.5 rounded-full font-bold">{dia.tarefas.length} tarefas</span>
                    <span className="text-[10px] text-[#A09888]">{dia.tarefas.filter(t => t.tipo === 'post').length} posts + {dia.tarefas.filter(t => t.tipo === 'stories').length} stories + {dia.tarefas.filter(t => t.tipo === 'whatsapp').length} WA</span>
                  </div>
                </div>

                {dia.tarefas.map((tarefa, ti) => {
                  const tt = ticoTarefa(tarefa.tipo);
                  return (
                    <div key={ti} className={`bg-white rounded-xl border-l-4 ${tt.cor} overflow-hidden`}>
                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-xs bg-[#1a1a2e] text-white px-2 py-0.5 rounded-full font-bold">{tarefa.hora}</span>
                          <span className="text-xs font-bold text-[#4A4035]">{tt.icon} {tarefa.titulo}</span>
                        </div>
                        <p className="text-xs text-[#A09888] mb-3">{tarefa.descricao}</p>

                        {/* Post content inline */}
                        {tarefa.post && (
                          <div className="bg-[#FAFAF8] rounded-lg p-3 space-y-3 mb-3">
                            {/* Image(s) */}
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {tarefa.post.tipo === 'carrossel' && tarefa.post.slides ? (
                                tarefa.post.slides.map((s, j) => (
                                  <MockupSlide
                                    key={j}
                                    mockupSrc={tarefa.post.imagens[j] || tarefa.post.imagens[j % tarefa.post.imagens.length]}
                                    texto={s.texto}
                                    subtitulo={s.subtitulo}
                                    isCover={j === 0}
                                    slideNum={j + 1}
                                    totalSlides={tarefa.post.slides.length}
                                    slideLabel={j === 0 ? 'Capa' : `Slide ${j}`}
                                    filename={`dia${dia.dia}-${tarefa.post.titulo.replace(/\s+/g, '-').toLowerCase()}-slide${j + 1}.jpg`}
                                  />
                                ))
                              ) : (
                                tarefa.post.imagens.map((img, j) => (
                                  <div key={j} className="relative group shrink-0">
                                    <img src={img} alt="" className="h-44 rounded-lg object-cover shadow-md" />
                                    <a href={img} download className="absolute bottom-1 right-1 bg-white/90 px-2 py-0.5 rounded text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">⬇</a>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Caption */}
                            <div>
                              <p className="text-[10px] font-bold text-[#6B5C4C] mb-1">Caption:</p>
                              <p className="text-[11px] text-[#4A4035] whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">{tarefa.post.caption}</p>
                            </div>
                            <CopyBtn
                              onClick={() => copiar(tarefa.post.caption, `cal-caption-${ti}`)}
                              copiado={copiado === `cal-caption-${ti}` ? '✓' : ''}
                              label="📋 Copiar Caption"
                              small
                            />

                            {/* Reel script */}
                            {tarefa.post.roteiro && (
                              <div>
                                <p className="text-[10px] font-bold text-[#6B5C4C] mb-1">Roteiro:</p>
                                <pre className="text-[10px] text-[#4A4035] whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto">{tarefa.post.roteiro}</pre>
                                <CopyBtn
                                  onClick={() => copiar(tarefa.post.roteiro, `cal-roteiro-${ti}`)}
                                  copiado={copiado === `cal-roteiro-${ti}` ? '✓' : ''}
                                  label="📋 Copiar Roteiro"
                                  small
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* WhatsApp message inline */}
                        {tarefa.mensagemWA && (
                          <div className="bg-green-50 rounded-lg p-3 border border-green-200 mb-3 space-y-2">
                            <div className="flex items-start gap-2">
                              <img src={tarefa.mensagemWA.imagem} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                              <div className="flex-1">
                                <p className="text-[10px] font-bold text-green-700">Enviar com esta imagem:</p>
                                <a href={tarefa.mensagemWA.imagem} download className="text-[10px] text-green-600 underline">⬇ Descarregar imagem</a>
                              </div>
                            </div>
                            <p className="text-[11px] text-[#4A4035] whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">{tarefa.mensagemWA.mensagem}</p>
                            <div className="flex gap-2">
                              <CopyBtn
                                onClick={() => copiar(tarefa.mensagemWA.mensagem, `cal-wa-${ti}`)}
                                copiado={copiado === `cal-wa-${ti}` ? '✓' : ''}
                                label="📋 Copiar"
                                small
                              />
                              <a
                                href={`https://wa.me/?text=${encodeURIComponent(tarefa.mensagemWA.mensagem)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-[#25D366] text-white"
                              >
                                📲 Enviar
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Stories inline */}
                        {tarefa.stories && (
                          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 mb-3">
                            <p className="text-[10px] font-bold text-purple-700 mb-2">Stories ({tarefa.stories.length}):</p>
                            <div className="space-y-1.5">
                              {tarefa.stories.map((s, si) => (
                                <div key={si} className="flex items-start gap-2">
                                  <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-700 text-[10px] flex items-center justify-center shrink-0 font-bold">{si + 1}</span>
                                  <div>
                                    <p className="text-[11px] text-[#4A4035]">{s.texto}</p>
                                    <span className="text-[9px] text-purple-500 uppercase font-bold">{s.tipo}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action box */}
                        <div className="bg-[#1a1a2e] text-white rounded-lg p-3">
                          <p className="text-[10px] font-bold text-white/60 mb-1">O QUE FAZER:</p>
                          <p className="text-xs">{tarefa.accao}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </>
      )}

      {/* =================== POSTS INSTAGRAM =================== */}
      {secao === 'instagram' && (
        <>
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl p-4">
            <h3 className="font-bold text-lg">12 Conteúdos com Mockups Reais</h3>
            <p className="text-white/80 text-sm mt-1">6 Feed + 3 Carrosséis + 3 Reels — usa as imagens reais da app</p>
          </div>

          {conteudos.map((c, i) => {
            const tipoMap = { feed: { label: 'FEED', cor: 'bg-blue-100 text-blue-700' }, carrossel: { label: 'CARROSSEL', cor: 'bg-purple-100 text-purple-700' }, reel: { label: 'REEL', cor: 'bg-pink-100 text-pink-700' } };
            const tipo = tipoMap[c.tipo] || { label: c.tipo, cor: 'bg-gray-100 text-gray-700' };
            const aberto = expandido === i;
            return (
              <div key={i} className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden">
                {/* Header com imagem preview */}
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer hover:bg-[#FAFAF8] transition-colors"
                  onClick={() => setExpandido(aberto ? null : i)}
                >
                  <img
                    src={c.imagens[0]}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover shrink-0 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tipo.cor}`}>{tipo.label}</span>
                      <span className="text-[10px] text-[#A09888]">Post {c.numero}/12</span>
                      {c.melhorHora && <span className="text-[10px] text-[#A09888]">🕐 {c.melhorHora}</span>}
                    </div>
                    <h4 className="font-bold text-sm text-[#4A4035] truncate">{c.titulo}</h4>
                    <p className="text-xs text-[#A09888] mt-0.5">{c.descricao}</p>
                  </div>
                  <span className="text-[#A09888] text-lg">{aberto ? '▲' : '▼'}</span>
                </div>

                {/* Expanded content */}
                {aberto && (
                  <div className="border-t border-[#E8E2D9] p-4 space-y-4">
                    {/* Images - compostas para carrosséis, simples para feed/reel */}
                    <div>
                      <p className="text-xs font-bold text-[#6B5C4C] mb-2">
                        {c.tipo === 'carrossel'
                          ? `📸 Slides prontos a publicar (${c.slides.length})`
                          : '📸 Imagem'}
                      </p>

                      {c.tipo === 'carrossel' && c.slides ? (
                        /* Carrossel: slides compostos com mockup + texto */
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {c.slides.map((s, j) => (
                            <MockupSlide
                              key={j}
                              mockupSrc={c.imagens[j] || c.imagens[j % c.imagens.length]}
                              texto={s.texto}
                              subtitulo={s.subtitulo}
                              isCover={j === 0}
                              slideNum={j + 1}
                              totalSlides={c.slides.length}
                              slideLabel={j === 0 ? 'Capa' : `Slide ${j}`}
                              filename={`${c.titulo.replace(/\s+/g, '-').toLowerCase()}-slide-${j + 1}.jpg`}
                            />
                          ))}
                        </div>
                      ) : (
                        /* Feed/Reel: imagem mockup original */
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {c.imagens.map((img, j) => (
                            <div key={j} className="relative group shrink-0">
                              <img src={img} alt="" className="h-48 rounded-lg object-cover shadow-md" />
                              <a
                                href={img}
                                download
                                className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-[#4A4035] shadow opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ⬇ Descarregar
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reel script */}
                    {c.roteiro && (
                      <div>
                        <p className="text-xs font-bold text-[#6B5C4C] mb-2">🎬 Roteiro do Reel</p>
                        <div className="bg-[#FAFAF8] rounded-lg p-3">
                          <pre className="text-[11px] text-[#4A4035] whitespace-pre-wrap font-sans leading-relaxed">{c.roteiro}</pre>
                        </div>
                        <CopyBtn
                          onClick={() => copiar(c.roteiro, `roteiro-${i}`)}
                          copiado={copiado === `roteiro-${i}` ? '✓' : ''}
                          label="📋 Copiar Roteiro"
                          small
                        />
                      </div>
                    )}

                    {/* Caption */}
                    <div>
                      <p className="text-xs font-bold text-[#6B5C4C] mb-2">✍️ Caption Instagram</p>
                      <div className="bg-[#FAFAF8] rounded-lg p-3">
                        <p className="text-[11px] text-[#4A4035] whitespace-pre-wrap leading-relaxed">{c.caption}</p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <CopyBtn
                          onClick={() => copiar(c.caption, `caption-v-${i}`)}
                          copiado={copiado === `caption-v-${i}` ? '✓' : ''}
                          label="📋 Copiar Caption"
                          small
                        />
                      </div>
                    </div>

                    {/* WhatsApp version */}
                    {c.whatsapp && (
                      <div>
                        <p className="text-xs font-bold text-[#6B5C4C] mb-2">💬 Versão WhatsApp</p>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <p className="text-[11px] text-[#4A4035] whitespace-pre-wrap leading-relaxed">{c.whatsapp}</p>
                        </div>
                        <CopyBtn
                          onClick={() => copiar(c.whatsapp, `wa-v-${i}`)}
                          copiado={copiado === `wa-v-${i}` ? '✓' : ''}
                          label="💬 Copiar WA"
                          small
                        />
                      </div>
                    )}

                    {/* Tips */}
                    {c.dica && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-[11px] text-amber-800">💡 <strong>Dica:</strong> {c.dica}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* WhatsApp Section */}
      {secao === 'whatsapp' && (
        <>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4">
            <h3 className="font-bold text-lg">7 Mensagens WhatsApp com Mockups</h3>
            <p className="text-white/80 text-sm mt-1">Cada mensagem vem com a imagem mockup certa para enviar junto</p>
          </div>

          {mensagensWA.map((m, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <img src={m.imagem} alt="" className="w-20 h-20 rounded-lg object-cover shadow-sm shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">WHATSAPP</span>
                    <h4 className="font-bold text-sm text-[#4A4035] mt-1">{m.titulo}</h4>
                    <p className="text-[10px] text-[#A09888] mt-1">Enviar com a imagem ao lado</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-[11px] text-[#4A4035] whitespace-pre-wrap leading-relaxed">{m.mensagem}</p>
                </div>

                <div className="flex gap-2 mt-3">
                  <CopyBtn
                    onClick={() => copiar(m.mensagem, `wa-mock-${i}`)}
                    copiado={copiado === `wa-mock-${i}` ? '✓' : ''}
                    label="📋 Copiar Mensagem"
                    small
                  />
                  <a
                    href={m.imagem}
                    download
                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all"
                  >
                    ⬇ Imagem
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(m.mensagem)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-[#25D366] text-white hover:bg-[#128C7E] transition-all"
                  >
                    📲 Enviar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Ordem sugerida */}
      <div className="bg-[#1a1a2e] text-white rounded-xl p-4">
        <h4 className="font-bold text-sm mb-2">📅 Ordem sugerida de publicação</h4>
        <div className="space-y-1 text-xs text-white/80">
          <p>1️⃣ <strong>Dia 1:</strong> Post #1 (mozproud) — Fixar no topo do perfil</p>
          <p>2️⃣ <strong>Dia 1:</strong> Post #7 (Carrossel 5 razões) — Maior alcance</p>
          <p>3️⃣ <strong>Dia 2:</strong> Post #12 (Reel orgulho MZ) — Viral potencial</p>
          <p>4️⃣ <strong>Dia 2:</strong> Post #5 (Espaço emocional) — Emocional</p>
          <p>5️⃣ <strong>Dia 3:</strong> Post #8 (Carrossel Dietas vs VITALIS) — Polémico</p>
          <p>6️⃣ <strong>Dia 3:</strong> Post #4 (Receitas) — Prático</p>
          <p>7️⃣ <strong>Dia 4:</strong> Post #11 (Reel POV) — Trending</p>
          <p>8️⃣ <strong>Dia 4:</strong> Post #3 (Coach 24h) — Diferencial</p>
          <p>9️⃣ <strong>Dia 5:</strong> Post #9 (Carrossel Tour) — Educativo</p>
          <p>🔟 <strong>Dia 5:</strong> Post #6 (Treinos ciclo) — Nicho</p>
          <p>1️⃣1️⃣ <strong>Dia 6:</strong> Post #10 (Reel dia com VITALIS) — Relatable</p>
          <p>1️⃣2️⃣ <strong>Dia 6:</strong> Post #2 (Dashboard) — Profissionalismo</p>
        </div>
        <p className="text-[10px] text-white/50 mt-3">💡 Publica 2 posts/dia. Alterna Feed ↔ Reel ↔ Carrossel para melhor alcance.</p>
      </div>
    </div>
  );
}

// ============================================================
// TAB: HOJE - Conteúdo automático pronto para hoje
// ============================================================

function HojeTab({ copiar, copiado }) {
  const hoje = gerarConteudoHoje();
  const captionPost = gerarCaptionInstagram('post');
  const captionReel = gerarCaptionInstagram('reelScript');
  const captionStories = gerarCaptionInstagram('stories');
  const waTypes = ['dica', 'provocacao', 'pessoal', 'urgencia', 'lumina'];
  const [waTipo, setWaTipo] = useState('dica');
  const wa = gerarMensagemWhatsApp(waTipo);

  const dataHoje = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      {/* Header do dia */}
      <Card titulo={`Conteúdo de Hoje`} badge={dataHoje}>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2 bg-purple-50 rounded-lg text-center">
            <p className="text-[10px] font-bold text-purple-600">TEMA</p>
            <p className="text-xs font-bold text-[#4A4035]">{hoje.titulo}</p>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg text-center">
            <p className="text-[10px] font-bold text-orange-600">FORMATO</p>
            <p className="text-xs font-bold text-[#4A4035]">{hoje.formato}</p>
          </div>
          <div className="p-2 bg-green-50 rounded-lg text-center">
            <p className="text-[10px] font-bold text-green-600">TIPO</p>
            <p className="text-xs font-bold text-[#4A4035]">{hoje.tipo}</p>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-xl text-white">
          <p className="text-[10px] font-bold text-white/50 mb-1">HOOK DO DIA</p>
          <p className="text-sm font-bold leading-relaxed">{hoje.hook}</p>
        </div>
      </Card>

      {/* Instagram - Post pronto */}
      <Card titulo="📸 Instagram - Post" badge="Pronto">
        <div className="flex gap-3 mb-3">
          <AutoImage
            template="dica" eco="vitalis" formato="post"
            texto={hoje.hook} subtitulo="@seteecos"
            scale={0.25} filename={`ig-post-${hoje.data}.png`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-purple-600 mb-1">CAPTION</p>
            <pre className="text-[11px] text-[#4A4035] whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">{captionPost.caption.slice(0, 300)}...</pre>
          </div>
        </div>
        <div className="flex gap-1.5">
          <CopyBtn onClick={() => copiar(captionPost.caption, 'ig-post')} copiado={copiado === 'ig-post'} label="Copiar Caption" small />
          <CopyBtn onClick={() => copiar(captionPost.hashtags, 'ig-hash')} copiado={copiado === 'ig-hash'} label="Hashtags" small />
        </div>
      </Card>

      {/* Instagram - Stories */}
      <Card titulo="📱 Stories (5 sequência)" badge="Pronto">
        <pre className="text-[11px] text-[#4A4035] whitespace-pre-wrap leading-relaxed bg-pink-50 p-3 rounded-xl max-h-48 overflow-y-auto">{captionStories.caption}</pre>
        <div className="mt-2">
          <CopyBtn onClick={() => copiar(captionStories.caption, 'ig-stories')} copiado={copiado === 'ig-stories'} label="Copiar Sequência" small />
        </div>
      </Card>

      {/* Instagram - Reel Script */}
      <Card titulo="🎬 Script para Reel" badge="Pronto">
        <pre className="text-[11px] text-[#4A4035] whitespace-pre-wrap leading-relaxed bg-purple-50 p-3 rounded-xl max-h-48 overflow-y-auto">{captionReel.caption}</pre>
        <div className="mt-2">
          <CopyBtn onClick={() => copiar(captionReel.caption, 'ig-reel')} copiado={copiado === 'ig-reel'} label="Copiar Script" small />
        </div>
      </Card>

      {/* WhatsApp */}
      <Card titulo="💬 WhatsApp Broadcast" badge="Escolhe o tom">
        <div className="flex gap-1.5 flex-wrap mb-3">
          {waTypes.map(t => (
            <button
              key={t}
              onClick={() => setWaTipo(t)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                waTipo === t ? 'bg-[#25D366] text-white' : 'bg-gray-100 text-[#6B5C4C]'
              }`}
            >
              {t === 'dica' ? '💡 Dica' : t === 'provocacao' ? '🔥 Provocação' : t === 'pessoal' ? '🤍 Pessoal' : t === 'urgencia' ? '⚡ Urgência' : '🔮 Lumina'}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <AutoImage
            template={waTipo === 'lumina' ? 'cta' : 'dica'}
            eco={waTipo === 'lumina' ? 'lumina' : 'vitalis'}
            formato="stories"
            texto={hoje.hook}
            subtitulo="@seteecos"
            scale={0.12}
            filename={`wa-${waTipo}-${hoje.data}.png`}
          />
          <div className="flex-1 min-w-0">
            <pre className="text-[11px] text-[#4A4035] whitespace-pre-wrap bg-[#25D366]/5 p-3 rounded-xl leading-relaxed max-h-40 overflow-y-auto">{wa.mensagem}</pre>
          </div>
        </div>
        <div className="flex gap-1.5 mt-2">
          <CopyBtn onClick={() => copiar(wa.mensagem, `wa-${waTipo}`)} copiado={copiado === `wa-${waTipo}`} label="Copiar" small />
          <a
            href={`https://wa.me/?text=${encodeURIComponent(wa.mensagem)}`}
            target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-[11px] font-bold"
          >
            Enviar WhatsApp
          </a>
        </div>
      </Card>

      {/* Nota */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-[11px] font-bold text-amber-700">💡 CONTEÚDO AUTOMÁTICO</p>
        <p className="text-xs text-amber-800 mt-1">
          Este conteúdo é gerado automaticamente todos os dias com base no calendário de temas.
          Cada dia tem um tema diferente (reflexão, provocação, educação, valor, etc.) para manter variedade.
          Volta amanhã para conteúdo novo!
        </p>
      </div>
    </>
  );
}

// ============================================================
// TAB: PLANO SEMANAL - Dia a dia com tudo pronto
// ============================================================

function PlanoTab({ copiar, copiado }) {
  const [semana, setSemana] = useState(1);
  const [diaAberto, setDiaAberto] = useState(null);
  const dias = semana === 1 ? getSemana1() : getSemana2();
  const gridPosts = getGridInstagram();

  return (
    <>
      {/* Week toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setSemana(1); setDiaAberto(null); }}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            semana === 1 ? 'bg-[#1a1a2e] text-white' : 'bg-white text-[#6B5C4C] border border-[#E8E2D9]'
          }`}
        >
          Semana 1: AQUECER<br /><span className="text-[10px] font-normal opacity-60">8-14 Fev &middot; Grid + Lumina + Ads</span>
        </button>
        <button
          onClick={() => { setSemana(2); setDiaAberto(null); }}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            semana === 2 ? 'bg-[#1a1a2e] text-white' : 'bg-white text-[#6B5C4C] border border-[#E8E2D9]'
          }`}
        >
          Semana 2: LANÇAR<br /><span className="text-[10px] font-normal opacity-60">15-21 Fev &middot; Vitalis LIVE</span>
        </button>
      </div>

      {/* Day cards */}
      {dias.map((dia) => {
        const open = diaAberto === dia.dia;
        return (
          <div key={dia.dia} className={`bg-white rounded-2xl border overflow-hidden transition-all ${open ? 'border-[#1a1a2e] shadow-md' : 'border-[#E8E2D9]'}`}>
            {/* Day header */}
            <button
              onClick={() => setDiaAberto(open ? null : dia.dia)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#1a1a2e] text-white flex items-center justify-center text-xs font-bold">{dia.dia}</span>
                <div>
                  <p className="text-sm font-bold text-[#4A4035]">{dia.data}</p>
                  <p className="text-[10px] text-[#6B5C4C] font-semibold">{dia.titulo}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {dia.gridPosts && <span className="text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{dia.gridPosts.length} posts</span>}
                {dia.ads && <span className="text-[9px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">ADS</span>}
                <span className="text-[#6B5C4C] text-lg">{open ? '−' : '+'}</span>
              </div>
            </button>

            {/* Day content */}
            {open && (
              <div className="px-4 pb-4 space-y-4 border-t border-[#E8E2D9]">
                {/* Notas do dia */}
                {dia.notas && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-[11px] font-bold text-amber-700">NOTAS DO DIA</p>
                    <p className="text-xs text-amber-800 mt-1">{dia.notas}</p>
                  </div>
                )}

                {/* Instagram Grid posts */}
                {dia.gridPosts && (
                  <div>
                    <p className="text-xs font-bold text-purple-600 mb-2">📸 PUBLICAR NO INSTAGRAM ({dia.gridPosts.length} posts)</p>
                    <div className="space-y-3">
                      {dia.gridPosts.map(num => {
                        const post = gridPosts.find(p => p.ordem === num);
                        if (!post) return null;
                        const isCarousel = post.template === 'carrossel';
                        return (
                          <div key={num} className="flex gap-3 p-3 bg-purple-50 rounded-xl">
                            {!isCarousel && (
                              <AutoImage
                                template={post.template} eco={post.eco} formato="post"
                                texto={post.texto} subtitulo={post.subtitulo}
                                scale={0.2} filename={`grid-${num}-${post.titulo}.png`}
                              />
                            )}
                            {isCarousel && (
                              <div className="w-[216px] h-[216px] shrink-0 bg-purple-100 rounded-xl flex items-center justify-center">
                                <span className="text-purple-400 text-xs font-bold text-center px-2">📑 Carrossel<br />{post.titulo}<br />(ver tab Carrosseis)</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-purple-600">POST #{num} - {post.titulo}</p>
                              <p className="text-[11px] text-[#4A4035] leading-relaxed mt-1 line-clamp-5">{post.caption.slice(0, 200)}...</p>
                              <div className="flex gap-1.5 mt-2">
                                <CopyBtn onClick={() => copiar(post.caption, `grid-${num}`)} copiado={copiado === `grid-${num}`} label="Caption" small />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Instagram Stories */}
                {dia.stories && (
                  <div>
                    <p className="text-xs font-bold text-pink-600 mb-1">📱 STORIES</p>
                    <p className="text-xs text-[#4A4035] bg-pink-50 p-3 rounded-xl">{dia.stories}</p>
                  </div>
                )}

                {/* WhatsApp */}
                {dia.whatsapp && (
                  <div>
                    <p className="text-xs font-bold text-[#25D366] mb-2">💬 WHATSAPP BROADCAST</p>
                    <div className="flex gap-3">
                      {dia.whatsapp.imagem && (
                        <AutoImage
                          template={dia.whatsapp.imagem.template}
                          eco={dia.whatsapp.imagem.eco}
                          formato={dia.whatsapp.imagem.formato || 'stories'}
                          texto={dia.whatsapp.imagem.texto}
                          subtitulo={dia.whatsapp.imagem.subtitulo}
                          scale={0.12}
                          filename={`wa-dia${dia.dia}.png`}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <pre className="text-[11px] text-[#4A4035] whitespace-pre-wrap bg-[#25D366]/5 p-3 rounded-xl leading-relaxed max-h-40 overflow-y-auto">{dia.whatsapp.mensagem}</pre>
                        <div className="flex gap-1.5 mt-2">
                          <CopyBtn onClick={() => copiar(dia.whatsapp.mensagem, `wa-${dia.dia}`)} copiado={copiado === `wa-${dia.dia}`} label="Copiar" small />
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(dia.whatsapp.mensagem)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-[11px] font-bold"
                          >
                            Enviar
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ads */}
                {dia.ads && (
                  <div>
                    <p className="text-xs font-bold text-orange-600 mb-1">📣 ANUNCIOS</p>
                    <p className="text-xs text-[#4A4035] bg-orange-50 p-3 rounded-xl">{dia.ads}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ============================================================
// TAB: GRID INSTAGRAM - 12 posts visuais
// ============================================================

function GridTab({ copiar, copiado }) {
  const posts = getGridInstagram();
  const [selected, setSelected] = useState(null);

  return (
    <>
      <Card titulo="Grid Instagram" badge="12 posts para preencher o perfil">
        <p className="text-xs text-[#6B5C4C] mb-3">
          Publica na ordem (1→12). Os primeiros 9 preenchem o grid visivel do perfil.
        </p>
        {/* Grid preview */}
        <div className="grid grid-cols-3 gap-1.5">
          {posts.map(post => {
            const isCarousel = post.template === 'carrossel';
            return (
              <button
                key={post.ordem}
                onClick={() => setSelected(selected === post.ordem ? null : post.ordem)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selected === post.ordem ? 'border-[#1a1a2e] ring-2 ring-[#1a1a2e]/20' : 'border-transparent'
                }`}
              >
                {!isCarousel ? (
                  <AutoImage
                    template={post.template} eco={post.eco} formato="post"
                    texto={post.texto} subtitulo={post.subtitulo}
                    scale={0.1} className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-gray-500 text-center px-1">📑<br />{post.titulo}</span>
                  </div>
                )}
                <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{post.ordem}</span>
                <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[8px] px-1 rounded">{post.dia}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected post detail */}
      {selected && (() => {
        const post = posts.find(p => p.ordem === selected);
        if (!post) return null;
        const isCarousel = post.template === 'carrossel';
        return (
          <Card titulo={`Post #${post.ordem} - ${post.titulo}`} badge={post.dia}>
            <div className="space-y-3">
              {!isCarousel && (
                <div className="flex justify-center">
                  <AutoImage
                    template={post.template} eco={post.eco} formato="post"
                    texto={post.texto} subtitulo={post.subtitulo}
                    scale={0.35} filename={`grid-${post.ordem}-${post.titulo}.png`}
                  />
                </div>
              )}
              {isCarousel && (
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-sm text-[#6B5C4C]">📑 Este é um carrossel. Vai ao tab <strong>Carrosseis</strong> para descarregar os slides de <strong>{post.titulo}</strong>.</p>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-[#6B5C4C] mb-1">CAPTION</p>
                <pre className="text-xs text-[#4A4035] whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-xl">{post.caption}</pre>
              </div>
              <CopyBtn onClick={() => copiar(post.caption, `detail-${post.ordem}`)} copiado={copiado === `detail-${post.ordem}`} label="Copiar Caption" />
            </div>
          </Card>
        );
      })()}
    </>
  );
}

// ============================================================
// TAB: ANUNCIOS PAGOS - Facebook/Instagram Ads
// ============================================================

function AnunciosTab({ copiar, copiado }) {
  const anuncios = getAnunciosPagos();

  return (
    <>
      <Card titulo="Como Configurar Ads" badge="Guia rápido">
        <div className="space-y-2 text-xs text-[#4A4035]">
          <p><strong>1.</strong> Vai a <strong>Meta Business Suite</strong> (business.facebook.com)</p>
          <p><strong>2.</strong> Cria uma campanha com o objectivo indicado em cada anuncio</p>
          <p><strong>3.</strong> No targeting, usa: <strong>Mulheres, 25-55, Maputo</strong> + interesses indicados</p>
          <p><strong>4.</strong> Comeca com <strong>300-500 MT/dia</strong> (~$5-8). Testa 3-4 dias.</p>
          <p><strong>5.</strong> Pausa os que tiverem CTR &lt; 1%. Escala os que tiverem CTR &gt; 2%.</p>
          <p><strong>6.</strong> Activa os ads no <strong>Dia 3 (Segunda 10 Fev)</strong> - nao antes! Primeiro preenche o grid.</p>
        </div>
      </Card>

      {anuncios.map(ad => (
        <div key={ad.id} className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5">
            <span className="text-white font-bold text-sm">{ad.nome}</span>
          </div>
          <div className="p-4 space-y-3">
            {/* Ad image */}
            <div className="flex justify-center">
              <AutoImage
                template={ad.template} eco={ad.eco} formato="post"
                texto={ad.texto_imagem} subtitulo={ad.subtitulo_imagem}
                scale={0.32} filename={`ad-${ad.id}.png`}
              />
            </div>

            {/* Ad copy */}
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 mb-0.5">HEADLINE</p>
                <p className="text-sm font-bold text-[#4A4035]">{ad.headline}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 mb-0.5">TEXTO PRIMARIO</p>
                <pre className="text-xs text-[#4A4035] whitespace-pre-wrap leading-relaxed">{ad.texto_primario}</pre>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <p className="text-[9px] font-bold text-gray-500">DESCRICAO</p>
                  <p className="text-[11px] text-[#4A4035]">{ad.descricao}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <p className="text-[9px] font-bold text-gray-500">BOTAO CTA</p>
                  <p className="text-[11px] text-[#4A4035] font-semibold">{ad.cta_botao}</p>
                </div>
              </div>
            </div>

            {/* Targeting */}
            <div className="p-3 bg-orange-50 rounded-xl">
              <p className="text-[10px] font-bold text-orange-600 mb-1">TARGETING</p>
              <p className="text-[11px] text-[#4A4035]">{ad.targeting}</p>
              <p className="text-[10px] text-orange-600 font-bold mt-1">Orcamento: {ad.orcamento}</p>
            </div>

            {/* Link */}
            <div className="p-2 bg-blue-50 rounded-lg">
              <p className="text-[9px] font-bold text-blue-500">LINK DO ANUNCIO</p>
              <p className="text-[10px] text-blue-700 break-all">{ad.link}</p>
            </div>

            {/* Copy buttons */}
            <div className="flex flex-wrap gap-1.5">
              <CopyBtn onClick={() => copiar(ad.headline, `ad-h-${ad.id}`)} copiado={copiado === `ad-h-${ad.id}`} label="Headline" small />
              <CopyBtn onClick={() => copiar(ad.texto_primario, `ad-t-${ad.id}`)} copiado={copiado === `ad-t-${ad.id}`} label="Texto" small />
              <CopyBtn onClick={() => copiar(ad.link, `ad-l-${ad.id}`)} copiado={copiado === `ad-l-${ad.id}`} label="Link" small />
              <CopyBtn onClick={() => copiar(`Headline: ${ad.headline}\n\nTexto: ${ad.texto_primario}\n\nDescricao: ${ad.descricao}\n\nCTA: ${ad.cta_botao}\n\nLink: ${ad.link}`, `ad-all-${ad.id}`)} copiado={copiado === `ad-all-${ad.id}`} label="Copiar Tudo" small />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// ============================================================
// TAB: CARROSSEIS - Sets de slides prontos
// ============================================================

function CarrosseisTab({ copiar, copiado }) {
  const carrosseis = getCarrosseisProntos();
  const [selected, setSelected] = useState(0);
  const carrossel = carrosseis[selected];

  return (
    <>
      <Card titulo="Carrosséis Prontos" badge={`${carrosseis.length} sets`}>
        <p className="text-xs text-[#6B5C4C] mb-3">Cada carrossel tem 5-6 slides. Seleciona, descarrega, publica.</p>
        <div className="grid grid-cols-2 gap-2">
          {carrosseis.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelected(i)}
              className={`p-3 rounded-xl text-left transition-all border-2 ${
                selected === i ? 'border-[#1a1a2e] bg-[#1a1a2e]/5' : 'border-[#E8E2D9] bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full" style={{ background: c.cor }} />
                <span className="text-[11px] font-bold text-[#4A4035]">{c.titulo}</span>
              </div>
              <p className="text-[9px] text-[#6B5C4C]">{c.slides.length} slides &middot; {CORES[c.marca]?.nome || c.marca}</p>
            </button>
          ))}
        </div>
      </Card>

      <CarrosselPreview carrossel={carrossel} copiar={copiar} copiado={copiado} />
    </>
  );
}

function CarrosselPreview({ carrossel, copiar, copiado }) {
  const [dataUrls, setDataUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const renderAll = async () => {
      const results = [];
      for (let i = 0; i < carrossel.slides.length; i++) {
        const canvas = document.createElement('canvas');
        await RENDER_MAP.carrossel(canvas, {
          formato: 'post', eco: carrossel.marca,
          texto: carrossel.slides[i].titulo, subtitulo: carrossel.slides[i].texto,
          slideNum: i + 1, totalSlides: carrossel.slides.length,
        });
        results.push(canvas.toDataURL('image/png'));
      }
      setDataUrls(results);
      setLoading(false);
    };
    renderAll();
  }, [carrossel.id]);

  const downloadAll = () => {
    dataUrls.forEach((url, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.download = `${carrossel.id}-slide-${i + 1}.png`;
        a.href = url;
        a.click();
      }, i * 400);
    });
  };

  const downloadSlide = (i) => {
    const a = document.createElement('a');
    a.download = `${carrossel.id}-slide-${i + 1}.png`;
    a.href = dataUrls[i];
    a.click();
  };

  return (
    <Card titulo={carrossel.titulo} badge={`${carrossel.slides.length} slides`}>
      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-3">
          {carrossel.slides.map((_, i) => <div key={i} className="w-44 h-44 shrink-0 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-3">
          {dataUrls.map((url, i) => (
            <div key={i} className="relative group shrink-0">
              <img src={url} className="w-44 h-44 rounded-xl shadow-md object-cover" alt={`Slide ${i + 1}`} />
              <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{i + 1}/{carrossel.slides.length}</span>
              <button onClick={() => downloadSlide(i)} className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity">⬇</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#E8E2D9]">
        <button onClick={downloadAll} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a2e] text-white rounded-full text-sm font-bold disabled:opacity-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Todos ({carrossel.slides.length} slides)
        </button>
        <CopyBtn onClick={() => copiar(carrossel.caption, 'c-cap')} copiado={copiado === 'c-cap'} label="Copiar Caption" />
      </div>
      <div className="mt-3 p-3 bg-gray-50 rounded-xl">
        <p className="text-[10px] font-bold text-[#6B5C4C] mb-1">CAPTION</p>
        <pre className="text-xs text-[#4A4035] whitespace-pre-wrap leading-relaxed">{carrossel.caption}</pre>
      </div>
    </Card>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

function Card({ titulo, badge, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E8E2D9] bg-[#FAFAF8]">
        <h3 className="font-bold text-sm text-[#4A4035]">{titulo}</h3>
        {badge && <span className="text-[10px] bg-[#1a1a2e]/10 text-[#1a1a2e] px-2 py-0.5 rounded-full font-semibold">{badge}</span>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function CopyBtn({ onClick, copiado, label, small }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 font-bold transition-all ${
        small ? 'px-3 py-1.5 text-[11px] rounded-lg' : 'px-4 py-2 text-xs rounded-full'
      } ${copiado ? 'bg-green-100 text-green-700' : 'bg-[#1a1a2e] text-white hover:bg-[#2a2a4e]'}`}
    >
      {copiado ? '✓ Copiado' : label}
    </button>
  );
}
