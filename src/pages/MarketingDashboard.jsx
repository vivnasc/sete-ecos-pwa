import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isSessionCoach } from '../lib/coach';
import { supabase } from '../lib/supabase';
import { publicarAgora, agendarDiaCompleto, verificarMetaAPI } from '../lib/instagram-api';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  getGridInstagram,
  getAnunciosPagos,
  getSemana1,
  getSemana2,
  getCarrosseisProntos,
  gerarConteudoHoje,
  gerarConteudoSemana,
  gerarMensagemWhatsApp,
  gerarStatusWhatsApp,
  gerarCaptionInstagram,
  totalVariantes,
  getConteudosMockupVitalis,
  getMensagensWhatsAppMockups,
  getSetupInstagram,
  getCalendario6Dias,
  getGuiaMetaDeveloper,
  getSetupWhatsAppBusiness,
  gerarConteudoDiario,
  gerarSemanaCompleta,
  getMockupsEco,
  getCampanhaLancamentoZero,
} from '../lib/marketing-engine';
import { RENDER_MAP, CORES, FORMATOS } from '../components/TemplateVisual';
import { getAudioUrl } from '../lib/shared/audioStorage';

// ============================================================
// AUTO IMAGE - Gera imagem automaticamente
// ============================================================

function AutoImage({ template, eco, formato, texto, subtitulo, slideNum, totalSlides, bgIndex, scale, filename, className }) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const render = async () => {
      try {
        const renderFn = RENDER_MAP[template];
        if (!renderFn) return;
        await renderFn(canvas, { formato: formato || 'post', eco: eco || 'vitalis', texto, subtitulo, slideNum, totalSlides, bgIndex });
        setDataUrl(canvas.toDataURL('image/png'));
      } catch (e) {
        console.error('Erro ao gerar imagem:', e);
      }
    };
    if (texto) render();
  }, [template, eco, formato, texto, subtitulo, slideNum, totalSlides, bgIndex]);

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
// REEL FRAMES - Extrai frames do script tiktok para sequência
// Cada frame = 1 imagem 1080×1920 pronta para juntar num vídeo
// ============================================================

function parseReelFrames(post) {
  const script = post.tiktok?.ideia || '';
  if (!script) return [];

  // Post 2: transição de cores — frames especiais com cada eco
  if (post.dia === 2) {
    return [
      { texto: 'Resolver só o corpo\nnão muda identidade.', eco: 'seteEcos', num: 1 },
      { texto: '7 dimensões.', eco: 'seteEcos', num: 2 },
      { texto: 'VITALIS\nCorpo & Nutrição', eco: 'vitalis', num: 3 },
      { texto: 'ÁUREA\nValor & Presença', eco: 'aurea', num: 4 },
      { texto: 'SERENA\nEmoção & Fluidez', eco: 'serena', num: 5 },
      { texto: 'IGNIS\nVontade & Foco', eco: 'ignis', num: 6 },
      { texto: 'VENTIS\nEnergia & Ritmo', eco: 'ventis', num: 7 },
      { texto: 'ECOA\nExpressão & Voz', eco: 'ecoa', num: 8 },
      { texto: 'IMAGO\nIdentidade & Essência', eco: 'imago', num: 9 },
      { texto: '1 sistema.\nAs partes conversam.', eco: 'seteEcos', num: 10 },
      { texto: 'Sete Ecos.', eco: 'seteEcos', num: 11 },
    ];
  }

  // Extrair texto entre aspas — cada um é um frame
  const quoted = script.match(/"([^"]+)"/g);
  if (!quoted || quoted.length === 0) return [];

  return quoted.map((q, i) => ({
    texto: q.replace(/^"|"$/g, ''),
    eco: post.eco,
    num: i + 1,
  }));
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

// ============================================================
// STORY SLIDE — Imagem 9:16 (1080×1920) com mockup real
// Para IG Stories, FB Stories e WA Status
// ============================================================

function StorySlide({ mockupSrc, texto, subtitulo, eco, filename }) {
  const [dataUrl, setDataUrl] = useState(null);
  const W = 1080;
  const H = 1920;

  // Cores por eco
  const ecoCores = {
    vitalis: { start: '#2d4a2d', mid: '#3d5a3d', end: '#1a2e1a' },
    aurea: { start: '#4a3a10', mid: '#6a5520', end: '#2e2008' },
    serena: { start: '#1a3a4a', mid: '#2a4a5a', end: '#0e2430' },
    ignis: { start: '#4a1a10', mid: '#6a2a1a', end: '#2e0e08' },
    ventis: { start: '#1a4a3a', mid: '#2a5a4a', end: '#0e302a' },
    ecoa: { start: '#1a3050', mid: '#2a4060', end: '#0e2035' },
    imago: { start: '#3a2a4a', mid: '#4a3a5a', end: '#20182e' },
    lumina: { start: '#2a2a50', mid: '#3a3a60', end: '#181835' },
  };
  const cores = ecoCores[eco] || ecoCores.vitalis;

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, cores.start);
      grad.addColorStop(0.5, cores.mid);
      grad.addColorStop(1, cores.end);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Subtle texture overlay
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 100 + 50, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mockup image — large, centered
      const mockupMaxW = W * 0.85;
      const aspectRatio = img.height / img.width;
      let mockupW = mockupMaxW;
      let mockupH = mockupW * aspectRatio;
      const maxMockupH = H * 0.50;
      if (mockupH > maxMockupH) {
        mockupH = maxMockupH;
        mockupW = mockupH / aspectRatio;
      }
      const mockupX = (W - mockupW) / 2;
      const mockupY = H * 0.30;

      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 15;

      // Draw mockup with rounded corners
      const r = 20;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(mockupX, mockupY, mockupW, mockupH, r);
      ctx.clip();
      ctx.drawImage(img, mockupX, mockupY, mockupW, mockupH);
      ctx.restore();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Top text (hook)
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
      const lines = wrapText(ctx, texto, W * 0.8);
      let textY = 140;
      lines.forEach(line => {
        ctx.fillText(line, W / 2, textY);
        textY += 60;
      });

      // Subtitle below mockup
      if (subtitulo) {
        const subY = mockupY + mockupH + 80;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(subtitulo.toUpperCase(), W / 2, subY);
      }

      // Swipe up CTA at bottom
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('app.seteecos.com', W / 2, H - 100);

      // Brand watermark
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('@seteecos', W / 2, H - 60);

      setDataUrl(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => {
      // Fallback: text-only story
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, cores.start);
      grad.addColorStop(1, cores.end);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, sans-serif';
      const lines = wrapText(ctx, texto, W * 0.8);
      let y = H / 2 - (lines.length * 64) / 2;
      lines.forEach(line => { ctx.fillText(line, W / 2, y); y += 64; });

      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('@seteecos', W / 2, H - 80);

      setDataUrl(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = mockupSrc;
  }, [mockupSrc, texto, subtitulo, eco, cores]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.download = filename || `story-${eco}.jpg`;
    a.href = dataUrl;
    a.click();
  };

  // Preview dimensions (aspect ratio 9:16)
  const displayW = 180;
  const displayH = 320;

  if (!dataUrl) {
    return <div style={{ width: displayW, height: displayH }} className="bg-gray-200 rounded-xl animate-pulse" />;
  }

  return (
    <div className="relative group">
      <img src={dataUrl} style={{ width: displayW, height: displayH }} className="rounded-xl shadow-md object-cover" alt={texto} />
      <button onClick={download} className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-[#4A4035] shadow opacity-0 group-hover:opacity-100 transition-opacity">
        ⬇ JPG
      </button>
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

// ============================================================
// PROGRESS TRACKING (localStorage)
// ============================================================

const STORAGE_KEY = 'sete-ecos-marketing-progress';

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function saveProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function useProgress() {
  const [progress, setProgress] = useState(loadProgress);

  const toggle = useCallback((key) => {
    setProgress(prev => {
      const next = { ...prev, [key]: prev[key] ? null : new Date().toISOString() };
      saveProgress(next);
      return next;
    });
  }, []);

  const isDone = useCallback((key) => !!progress[key], [progress]);

  const countDone = useCallback((prefix) => {
    return Object.keys(progress).filter(k => k.startsWith(prefix) && progress[k]).length;
  }, [progress]);

  return { progress, toggle, isDone, countDone };
}

export default function MarketingDashboard() {
  const { session } = useAuth();
  const [modo, setModo] = useState('simples'); // 'simples' ou 'completo'
  const [tab, setTab] = useState('revisao');
  const [copiado, setCopied] = useState('');
  const prog = useProgress();

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

  const totalTarefas = 24; // total trackable tasks across revisao
  const tarefasFeitas = prog.countDone('rev-');
  const percentagem = Math.round((tarefasFeitas / totalTarefas) * 100);

  const tabs = [
    { id: 'revisao', label: `Revisão ${tarefasFeitas > 0 ? `(${percentagem}%)` : ''}`, icon: '🧭' },
    { id: 'vitalis', label: 'VITALIS (12)', icon: '📱' },
    { id: 'wabusiness', label: 'WA Business', icon: '💼' },
    { id: 'hoje', label: 'Hoje', icon: '⚡' },
    { id: 'plano', label: 'Plano Semanal', icon: '🗓' },
    { id: 'grid', label: 'Grid IG (12)', icon: '📸' },
    { id: 'anuncios', label: 'Anúncios', icon: '📣' },
    { id: 'carrosseis', label: 'Carrosséis', icon: '📑' },
  ];

  // ---- MODO SIMPLES: conteúdo de hoje, copiar e pronto ----
  if (modo === 'simples') {
    return <ModoSimples copiar={copiar} copiado={copiado} onVerTudo={() => setModo('completo')} prog={prog} />;
  }

  // ---- MODO COMPLETO: dashboard original com todos os tabs ----
  return (
    <div className="min-h-screen bg-[#F5F2ED] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Link to="/coach" className="text-white/60 hover:text-white text-sm">&larr; Coach</Link>
            <div className="flex gap-2">
              <button onClick={() => setModo('simples')} className="text-[10px] bg-white/10 text-white/70 px-3 py-1 rounded-full border border-white/20 hover:bg-white/20 transition-colors">Vista simples</button>
              <Link to="/coach/social" className="text-[10px] bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-400/30 hover:bg-purple-500/30 transition-colors">Agendar Posts</Link>
            </div>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-titulos)' }}>
            Marketing Coach
          </h1>
          <p className="text-white/50 text-sm mt-1">Tudo pronto. Só precisas de seguir os passos.</p>

          {/* Progress bar */}
          {tarefasFeitas > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/50">{tarefasFeitas}/{totalTarefas} tarefas concluídas</span>
                <span className="text-white/70 font-bold">{percentagem}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${percentagem}%` }} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-5 gap-2 mt-4">
            {[
              { v: '12', l: 'Mockups' },
              { v: '12', l: 'Posts Grid' },
              { v: '4', l: 'Anúncios' },
              { v: String(getCarrosseisProntos().length), l: 'Carrosséis' },
              { v: '12', l: 'Msgs WA' },
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
        {tab === 'revisao' && <RevisaoTab copiar={copiar} copiado={copiado} prog={prog} />}
        {tab === 'vitalis' && <VitalisTab copiar={copiar} copiado={copiado} />}
        {tab === 'wabusiness' && <WABusinessTab copiar={copiar} copiado={copiado} />}
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
// MODO SIMPLES - Só o conteúdo de hoje, copiar e pronto
// ============================================================

// ============================================================
// BLOCO DE ECO — todo o conteúdo visual de 1 eco (imagens + legendas)
// ============================================================

function BlocoEco({ eco, copiar, copiado, prefixo }) {
  if (!eco) return null;
  const [aberto, setAberto] = useState(true);
  const [textoAberto, setTextoAberto] = useState(null);
  const ig = eco.conteudoIG;
  const temCarrossel = ig && ig.tipo === 'carrossel' && ig.slides;
  const mockups = getMockupsEco(eco.eco);

  const mockupPrincipal = mockups[0];
  const mockupSecundario = mockups.length > 1 ? mockups[1] : mockups[0];

  // Template: reflexão usa 'reflexão', CTA usa 'cta', resto usa 'dica'
  const templateTipo = ig?.tipo === 'reflexão' ? 'reflexão' : ig?.tipo === 'cta' ? 'cta' : 'dica';

  return (
    <div className="space-y-3">
      {/* Header do eco */}
      <button
        onClick={() => setAberto(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-[#E8E2D9] shadow-sm active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{eco.emoji}</span>
          <div className="text-left">
            <p className="font-bold text-sm text-[#4A4035]">{eco.nome}</p>
            <p className="text-[11px] text-[#A09888]">{eco.hook?.slice(0, 60)}{eco.hook?.length > 60 ? '...' : ''}</p>
          </div>
        </div>
        <span className="text-[#A09888] text-sm">{aberto ? '▲' : '▼'}</span>
      </button>

      {aberto && (
        <div className="space-y-3 pl-1">

          {/* ===== 1. IMAGEM COLORIDA DO ECO (AutoImage) — post principal ===== */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 border-b border-[#E8E2D9] flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[#4A4035]">
                  {templateTipo === 'reflexão' ? 'Reflexão' : templateTipo === 'cta' ? 'CTA' : 'Post do dia'}
                </p>
                <p className="text-[10px] text-[#A09888]">Imagem pronta — descarrega e publica</p>
              </div>
              <span className="text-[9px] bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded-full">1:1</span>
            </div>
            <div className="p-3 flex justify-center">
              <AutoImage
                template={templateTipo}
                eco={eco.eco} formato="post"
                texto={eco.hook}
                subtitulo={ig?.subtitulo || ig?.texto || eco.corpo?.slice(0, 80) || ''}
                scale={0.28} filename={`${eco.eco}-post-${prefixo}.png`}
              />
            </div>
          </div>

          {/* ===== 2. CARROSSEL (se houver) com AutoImage colorido ===== */}
          {temCarrossel && (
            <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 border-b border-[#E8E2D9] flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#4A4035]">Carrossel: {ig.titulo}</p>
                  <p className="text-[10px] text-[#A09888]">{ig.slides.length} slides coloridos — desliza e descarrega</p>
                </div>
                <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Slides</span>
              </div>
              <div className="p-3">
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                  {ig.slides.map((slide, i) => (
                    <AutoImage
                      key={i}
                      template="carrossel" eco={eco.eco} formato="post"
                      texto={slide.titulo} subtitulo={slide.texto}
                      slideNum={i + 1} totalSlides={ig.slides.length}
                      bgIndex={i}
                      scale={0.24} filename={`${eco.eco}-carrossel-${i + 1}.png`}
                      className="shrink-0"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== 3. MOCKUP COMPOSTO (screenshot da app + texto) ===== */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 border-b border-[#E8E2D9] flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[#4A4035]">Mockup da app</p>
                <p className="text-[10px] text-[#A09888]">Imagem profissional com screenshot real</p>
              </div>
              <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Mockup</span>
            </div>
            <div className="p-3">
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                <MockupSlide
                  mockupSrc={mockupPrincipal}
                  texto={eco.hook}
                  subtitulo={ig?.subtitulo || ig?.texto || eco.corpo?.slice(0, 60) || ''}
                  isCover={true}
                  filename={`${eco.eco}-mockup-${prefixo}.jpg`}
                />
                {mockupSecundario !== mockupPrincipal && (
                  <MockupSlide
                    mockupSrc={mockupSecundario}
                    texto={eco.nome}
                    subtitulo={eco.hook?.slice(0, 60) || ''}
                    isCover={false}
                    filename={`${eco.eco}-mockup2-${prefixo}.jpg`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ===== 4. STORIES — duas versões: colorida + mockup ===== */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 border-b border-[#E8E2D9] flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[#4A4035]">Stories</p>
                <p className="text-[10px] text-[#A09888]">IG, FB e WA Status — 2 versões</p>
              </div>
              <span className="text-[9px] bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold px-2 py-0.5 rounded-full">9:16</span>
            </div>
            <div className="p-3 flex gap-3 justify-center overflow-x-auto">
              {/* Story colorido */}
              <AutoImage
                template={templateTipo}
                eco={eco.eco} formato="stories"
                texto={eco.hook}
                subtitulo="app.seteecos.com"
                scale={0.16} filename={`${eco.eco}-story-colorido-${prefixo}.png`}
              />
              {/* Story com mockup */}
              <StorySlide
                mockupSrc={mockupPrincipal}
                texto={eco.hook}
                subtitulo={eco.nome}
                eco={eco.eco}
                filename={`${eco.eco}-story-mockup-${prefixo}.jpg`}
              />
            </div>
          </div>

          {/* ===== 5. TEXTOS POR PLATAFORMA (collapsible) ===== */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 border-b border-[#E8E2D9]">
              <p className="font-bold text-xs text-[#4A4035]">Legendas prontas</p>
              <p className="text-[10px] text-[#A09888]">Toca para copiar o texto de cada rede</p>
            </div>
            <div className="divide-y divide-[#E8E2D9]">
              <TextoPlataforma
                plataforma="Instagram"
                icone="📸"
                cor="text-pink-600"
                texto={ig?.caption || eco.instagram?.caption || ''}
                aberto={textoAberto === 'ig'}
                onToggle={() => setTextoAberto(v => v === 'ig' ? null : 'ig')}
                copiar={copiar}
                copiado={copiado}
                idCopia={`${prefixo}-ig`}
              />
              <TextoPlataforma
                plataforma="Facebook"
                icone="👤"
                cor="text-blue-600"
                texto={eco.facebook || ''}
                aberto={textoAberto === 'fb'}
                onToggle={() => setTextoAberto(v => v === 'fb' ? null : 'fb')}
                copiar={copiar}
                copiado={copiado}
                idCopia={`${prefixo}-fb`}
              />
              <TextoPlataforma
                plataforma="WhatsApp"
                icone="💬"
                cor="text-green-600"
                texto={eco.whatsapp || ''}
                aberto={textoAberto === 'wa'}
                onToggle={() => setTextoAberto(v => v === 'wa' ? null : 'wa')}
                copiar={copiar}
                copiado={copiado}
                idCopia={`${prefixo}-wa`}
                linkEnviar={eco.whatsapp ? `https://wa.me/?text=${encodeURIComponent(eco.whatsapp)}` : null}
              />
              {/* TikTok / Reels — script para gravar */}
              {eco.tiktok && (
                <TextoPlataforma
                  plataforma="TikTok / Reels"
                  icone="🎬"
                  cor="text-gray-700"
                  texto={typeof eco.tiktok === 'object'
                    ? `COMO GRAVAR:\nUsa o CapCut (grátis) ou grava directo no TikTok/Instagram.\nPode ser só texto em ecrã + a tua voz por cima. Não precisas de aparecer.\nAs imagens de story acima servem como fundo.\n\n---\nROTEIRO:\n${eco.tiktok.ideia}\n\n---\nCAPTION:\n${eco.tiktok.caption}`
                    : eco.tiktok}
                  aberto={textoAberto === 'tt'}
                  onToggle={() => setTextoAberto(v => v === 'tt' ? null : 'tt')}
                  copiar={copiar}
                  copiado={copiado}
                  idCopia={`${prefixo}-tt`}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Linha de texto por plataforma (dentro do bloco de legendas)
function TextoPlataforma({ plataforma, icone, cor, texto, aberto, onToggle, copiar, copiado, idCopia, linkEnviar }) {
  if (!texto) return null;
  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-2.5 active:bg-[#FAFAF8] transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icone}</span>
          <span className={`text-xs font-bold ${cor}`}>{plataforma}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); copiar(texto, idCopia); }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${copiado === idCopia ? 'bg-green-100 text-green-700' : 'bg-[#F5F2ED] text-[#6B5C4C] hover:bg-[#E8E2D9]'}`}
          >
            {copiado === idCopia ? '✓ Copiado' : 'Copiar'}
          </button>
          <span className="text-[#A09888] text-xs">{aberto ? '▲' : '▼'}</span>
        </div>
      </button>
      {aberto && (
        <div className="px-4 pb-3">
          <pre className="text-[11px] text-[#4A4035] whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto bg-[#FAFAF8] rounded-xl p-3">{texto}</pre>
          {linkEnviar && (
            <a
              href={linkEnviar}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-[#25D366] text-white rounded-full text-[10px] font-bold"
            >
              Enviar no WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CAMPANHA DE LANÇAMENTO — 17 posts para conta com ZERO seguidores
// Reels only + Destaques IG + Mockups reais + 1 eco por post
// ============================================================

function CampanhaLancamento({ copiar, copiado, onDiario, onVerTudo, prog }) {
  const [faseAberta, setFaseAberta] = useState(1);
  const posts = getCampanhaLancamentoZero();
  const { toggle, isDone, countDone } = prog;

  // Contagem de progresso
  const totalPublicados = posts.filter(p => isDone(`lanc-post-${p.dia}`)).length;
  const totalPosts = posts.length;
  const percentagem = Math.round((totalPublicados / totalPosts) * 100);

  // Agrupar por fase
  const fases = [
    { num: 1, titulo: 'Marca & Destaques', subtitulo: 'Identidade visual + Destaques IG (posts 1-4)', emoji: '🌱', cor: 'from-indigo-500 to-purple-600', posts: posts.filter(p => p.fase === 1) },
    { num: 2, titulo: 'Lumina + Vitalis', subtitulo: 'Isca gratuita + produto herói com mockups (posts 5-10)', emoji: '🌿', cor: 'from-emerald-500 to-teal-600', posts: posts.filter(p => p.fase === 2) },
    { num: 3, titulo: 'Cada Eco', subtitulo: '1 eco por post, cor e mockup próprias (posts 11-17)', emoji: '🌳', cor: 'from-amber-500 to-orange-600', posts: posts.filter(p => p.fase === 3) },
  ];

  // Abrir automaticamente a primeira fase não completa
  const primeiraFaseIncompleta = fases.find(f => f.posts.some(p => !isDone(`lanc-post-${p.dia}`)));

  return (
    <div className="min-h-screen bg-[#F5F2ED] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0f3460] via-[#1a1a2e] to-[#533483] text-white px-4 pt-5 pb-5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Link to="/coach" className="text-white/60 hover:text-white text-sm">&larr; Coach</Link>
            <button
              onClick={onDiario}
              className="px-3 py-1.5 bg-white/10 rounded-full text-[11px] font-bold text-white/80 hover:bg-white/20 active:scale-95 transition-all"
            >
              Conteúdo diário →
            </button>
          </div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)' }}>
            17 Posts de Lançamento
          </h1>
          <p className="text-white/60 text-sm mt-1">
            17 posts para construir audiência do zero — feeds, carrosséis, stories e reels
          </p>

          {/* Barra de progresso */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-white/50">Progresso</span>
              <span className="text-[10px] text-white/70 font-bold">{totalPublicados}/{totalPosts} publicados</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                style={{ width: `${percentagem}%` }}
              />
            </div>
          </div>

          <div className="flex gap-1.5 mt-3">
            <span className="text-[9px] bg-white/10 text-white/70 px-2 py-1 rounded-full">Feeds + Stories</span>
            <span className="text-[9px] bg-white/10 text-white/70 px-2 py-1 rounded-full">Carrosséis</span>
            <span className="text-[9px] bg-white/10 text-white/70 px-2 py-1 rounded-full">Mockups reais</span>
            <span className="text-[9px] bg-white/10 text-white/70 px-2 py-1 rounded-full">1 eco = 1 cor</span>
          </div>
        </div>
      </div>

      {/* Dica geral — esconde quando já publicou pelo menos 3 */}
      {totalPublicados < 3 && (
        <div className="max-w-lg mx-auto px-4 mt-3">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
            <p className="text-xs text-amber-800 font-bold mb-1">Como usar esta campanha</p>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Publica 1 post por dia. Cada post inclui: imagem feed (1:1), carrossel deslizável, stories (9:16) e legendas para todas as redes. Fase 1: monta o perfil e os destaques. Fase 2: mostra Lumina grátis + Vitalis com mockups. Fase 3: cada eco com a sua cor e mockup.
            </p>
          </div>
        </div>
      )}

      {/* Parabéns quando completar tudo */}
      {totalPublicados === totalPosts && (
        <div className="max-w-lg mx-auto px-4 mt-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-sm font-bold text-emerald-800">Campanha completa!</p>
            <p className="text-[11px] text-emerald-700 mt-1">Os 17 posts de lançamento estão publicados. Agora passa para o conteúdo diário.</p>
          </div>
        </div>
      )}

      {/* Fases */}
      <div className="max-w-lg mx-auto px-4 mt-3 space-y-3">
        {fases.map(fase => {
          const fasePublicados = fase.posts.filter(p => isDone(`lanc-post-${p.dia}`)).length;
          const faseCompleta = fasePublicados === fase.posts.length;

          return (
            <div key={fase.num}>
              {/* Header da fase */}
              <button
                onClick={() => setFaseAberta(f => f === fase.num ? null : fase.num)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border shadow-sm active:scale-[0.99] transition-all mb-2 ${faseCompleta ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-[#E8E2D9]'}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full ${faseCompleta ? 'bg-emerald-500' : `bg-gradient-to-br ${fase.cor}`} flex items-center justify-center text-white text-sm font-bold`}>
                    {faseCompleta ? '✓' : fase.num}
                  </div>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${faseCompleta ? 'text-emerald-700' : 'text-[#4A4035]'}`}>{fase.emoji} {fase.titulo}</p>
                    <p className="text-[10px] text-[#A09888]">{fase.subtitulo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${faseCompleta ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    {fasePublicados}/{fase.posts.length}
                  </span>
                  <span className="text-[#A09888] text-sm">{faseAberta === fase.num ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Posts da fase */}
              {faseAberta === fase.num && (
                <div className="space-y-4 pl-1">
                  {fase.posts.map(post => (
                    <PostLancamento
                      key={post.dia}
                      post={post}
                      copiar={copiar}
                      copiado={copiado}
                      publicado={isDone(`lanc-post-${post.dia}`)}
                      onTogglePublicado={() => toggle(`lanc-post-${post.dia}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Depois da campanha */}
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-4 shadow-sm">
          <p className="font-bold text-sm text-[#4A4035] mb-1">Depois dos 17 posts?</p>
          <p className="text-xs text-[#6B5C4C] leading-relaxed mb-3">
            Passa para o conteúdo diário — o sistema gera posts novos todos os dias com rotação automática entre os Ecos. Nunca ficas sem conteúdo.
          </p>
          <button
            onClick={onDiario}
            className="w-full py-2.5 bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all"
          >
            Ver conteúdo diário →
          </button>
        </div>

        <button
          onClick={onVerTudo}
          className="w-full py-3 rounded-2xl text-xs text-[#A09888] hover:text-[#6B5C4C] transition-colors"
        >
          Ver dashboard completo
        </button>
      </div>
    </div>
  );
}

// Post individual da campanha de lançamento
function PostLancamento({ post, copiar, copiado, publicado, onTogglePublicado }) {
  const [aberto, setAberto] = useState(false);
  const [textoAberto, setTextoAberto] = useState(null);

  const templateTipo = post.template === 'cta' ? 'cta' : 'dica';
  const mockups = post.mockups || getMockupsEco(post.eco);
  const mockupPrincipal = mockups[0];

  // Usar slides pré-escritos do conteudoIG quando existem, senão auto-gerar do corpo
  const carrosselSlides = (() => {
    if (post.formato === 'destaques') return null;
    // Preferir slides pré-definidos em conteudoIG
    if (post.conteudoIG?.slides?.length > 1) return post.conteudoIG.slides;
    // Fallback: auto-gerar a partir do corpo
    const paragrafos = (post.corpo || '').split('\n').filter(p => p.trim().length > 10);
    if (paragrafos.length < 2) return null;
    const slides = [
      { titulo: post.titulo || post.hook, texto: 'Desliza →' },
    ];
    paragrafos.slice(0, 4).forEach(p => {
      slides.push({ titulo: p.length > 80 ? p.slice(0, 77) + '...' : p, texto: '' });
    });
    slides.push({ titulo: post.cta?.length > 80 ? post.cta.slice(0, 77) + '...' : (post.cta || 'app.seteecos.com'), texto: 'app.seteecos.com' });
    return slides;
  })();

  return (
    <div className="space-y-2">
      {/* Header do post */}
      <div className={`flex items-center gap-2 px-1 ${publicado ? 'opacity-70' : ''}`}>
        {/* Checkbox publicado */}
        <button
          onClick={onTogglePublicado}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all active:scale-90 ${
            publicado ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-[#C8C0B4] hover:border-[#A09888]'
          }`}
          aria-label={publicado ? 'Marcar como não publicado' : 'Marcar como publicado'}
        >
          {publicado && <span className="text-xs font-bold">✓</span>}
        </button>

        <button
          onClick={() => setAberto(v => !v)}
          className={`flex-1 flex items-center justify-between px-3 py-3 rounded-2xl border shadow-sm active:scale-[0.99] transition-all ${
            publicado ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-[#E8E2D9]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
              publicado ? 'bg-emerald-500' : 'bg-[#1a1a2e]'
            }`}>
              {post.dia}
            </div>
            <div className="text-left min-w-0">
              <p className={`font-bold text-sm truncate ${publicado ? 'text-emerald-700 line-through' : 'text-[#4A4035]'}`}>{post.titulo}</p>
              <p className="text-[10px] text-[#A09888] truncate">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold mr-1 ${
                  post.formato === 'carrossel' ? 'bg-purple-100 text-purple-700' :
                  post.formato === 'destaques' ? 'bg-amber-100 text-amber-700' :
                  'bg-pink-100 text-pink-700'
                }`}>
                  {post.formato === 'carrossel' ? 'CARROSSEL' : post.formato === 'destaques' ? 'TAREFA' : 'REEL'}
                </span>
                {post.hook?.slice(0, 40)}{post.hook?.length > 40 ? '...' : ''}
              </p>
            </div>
          </div>
          <span className="text-[#A09888] text-sm shrink-0 ml-2">{aberto ? '▲' : '▼'}</span>
        </button>
      </div>

      {aberto && (
        <div className="space-y-3 pl-1">
          {/* Cronograma — instrução clara do que fazer */}
          {post.cronograma && (
            <div className="bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] rounded-xl p-3">
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">O que fazer hoje</p>
              <p className="text-xs text-white font-medium leading-relaxed">{post.cronograma}</p>
            </div>
          )}

          {/* Áudio — player se pré-gerado, ou script para copiar */}
          {post.audioScript && (() => {
            const audioUrl = post.audioSlug ? getAudioUrl('marketing', post.audioSlug) : null;
            return (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-orange-700 font-bold">Áudio (voiceover)</p>
                  <button
                    onClick={() => copiar(post.audioScript, `lanc-${post.dia}-audio`)}
                    className="text-[9px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold active:scale-95"
                  >
                    {copiado === `lanc-${post.dia}-audio` ? 'Copiado!' : 'Copiar script'}
                  </button>
                </div>
                {audioUrl ? (
                  <div className="flex items-center gap-2">
                    <audio src={audioUrl} controls preload="none" className="h-8 flex-1 min-w-0" />
                    <a
                      href={audioUrl}
                      download
                      className="text-[9px] bg-orange-200 text-orange-800 px-2 py-1 rounded-full font-bold shrink-0 active:scale-95"
                    >
                      ⬇ MP3
                    </a>
                  </div>
                ) : (
                  <p className="text-[9px] text-orange-400 italic">Áudio não gerado — gera em /coach/audio-meditacoes</p>
                )}
                <details className="group">
                  <summary className="text-[9px] text-orange-500 cursor-pointer">Ver script</summary>
                  <p className="text-[10px] text-orange-600 leading-relaxed mt-1">{post.audioScript}</p>
                </details>
              </div>
            );
          })()}

          {/* Dica de formato */}
          {post.dica && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5">
              <p className="text-[10px] text-blue-700 font-bold mb-0.5">Dica</p>
              <p className="text-[10px] text-blue-600 leading-relaxed">{post.dica}</p>
            </div>
          )}

          {/* ===== DESTAQUES (post 4 apenas) ===== */}
          {post.formato === 'destaques' ? (
            <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 border-b border-[#E8E2D9] flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#4A4035]">9 Capas de Destaques</p>
                  <p className="text-[10px] text-[#A09888]">Descarrega cada uma → Instagram → Destaque</p>
                </div>
                <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">9 capas</span>
              </div>
              <div className="p-3 grid grid-cols-3 gap-2">
                {(() => {
                  const ecoMap = { LUMINA: 'lumina', VITALIS: 'vitalis', 'ÁUREA': 'aurea', SERENA: 'serena', IGNIS: 'ignis', VENTIS: 'ventis', ECOA: 'ecoa', IMAGO: 'imago', AURORA: 'aurora' };
                  return post.conteudoIG.slides.map((slide, i) => {
                    const nomeEco = slide.titulo?.replace(/^[^\s]+\s/, '').trim().toUpperCase();
                    const ecoKey = ecoMap[nomeEco] || 'seteEcos';
                    const conteudo = slide.texto?.match(/Conteúdo:\s*"([^"]+)"/)?.[1] || '';
                    return (
                      <AutoImage
                        key={i}
                        template="dica"
                        eco={ecoKey}
                        formato="stories"
                        texto={CORES[ecoKey]?.nome || nomeEco}
                        subtitulo={conteudo}
                        scale={0.15}
                        filename={`destaque-${ecoKey}.png`}
                      />
                    );
                  });
                })()}
              </div>
            </div>
          ) : (
            <>
              {/* ===== 1. POST FEED COLORIDO (AutoImage 1:1) ===== */}
              <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 border-b border-[#E8E2D9] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-[#4A4035]">Post do dia</p>
                    <p className="text-[10px] text-[#A09888]">Imagem pronta — descarrega e publica</p>
                  </div>
                  <span className="text-[9px] bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded-full">1:1</span>
                </div>
                <div className="p-3 flex justify-center">
                  <AutoImage
                    template={templateTipo}
                    eco={post.eco}
                    formato="post"
                    texto={post.conteudoIG?.texto || post.hook}
                    subtitulo={post.conteudoIG?.subtitulo || post.cta || ''}
                    scale={0.28}
                    filename={`post-${post.dia}-feed.png`}
                  />
                </div>
              </div>

              {/* ===== 2. CARROSSEL (slides deslizáveis) ===== */}
              {carrosselSlides && (
                <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
                  <div className="px-4 py-2.5 border-b border-[#E8E2D9] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-[#4A4035]">Carrossel: {post.titulo}</p>
                      <p className="text-[10px] text-[#A09888]">{carrosselSlides.length} slides — desliza e descarrega</p>
                    </div>
                    <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Slides</span>
                  </div>
                  <div className="p-3">
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                      {carrosselSlides.map((slide, i) => (
                        <AutoImage
                          key={i}
                          template="carrossel"
                          eco={post.eco}
                          formato="post"
                          texto={slide.titulo}
                          subtitulo={slide.texto}
                          slideNum={i + 1}
                          totalSlides={carrosselSlides.length}
                          bgIndex={i}
                          scale={0.24}
                          filename={`post-${post.dia}-carrossel-${i + 1}.png`}
                          className="shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ===== 3. MOCKUP (se houver) ===== */}
              {post.mockups && post.mockups.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
                  <div className="px-4 py-2.5 border-b border-[#E8E2D9] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-[#4A4035]">Mockup da app</p>
                      <p className="text-[10px] text-[#A09888]">Imagem com screenshot real</p>
                    </div>
                    <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Mockup</span>
                  </div>
                  <div className="p-3">
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                      {post.mockups.map((src, i) => (
                        <MockupSlide
                          key={`feed-${i}`}
                          mockupSrc={src}
                          texto={post.hook}
                          subtitulo={post.cta || 'app.seteecos.com'}
                          isCover={i === 0}
                          filename={`post-${post.dia}-mockup-${i + 1}.jpg`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ===== 4. STORIES — colorida + mockup ===== */}
              <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 border-b border-[#E8E2D9] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-[#4A4035]">Stories</p>
                    <p className="text-[10px] text-[#A09888]">IG, FB e WA Status — 2 versões</p>
                  </div>
                  <span className="text-[9px] bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold px-2 py-0.5 rounded-full">9:16</span>
                </div>
                <div className="p-3 flex gap-3 justify-center overflow-x-auto">
                  <AutoImage
                    template={templateTipo}
                    eco={post.eco}
                    formato="stories"
                    texto={post.conteudoIG?.texto || post.hook}
                    subtitulo="app.seteecos.com"
                    scale={0.16}
                    filename={`post-${post.dia}-story-colorido.png`}
                  />
                  {mockupPrincipal && (
                    <StorySlide
                      mockupSrc={mockupPrincipal}
                      texto={post.hook}
                      subtitulo={CORES[post.eco]?.nome || post.eco.toUpperCase()}
                      eco={post.eco}
                      filename={`post-${post.dia}-story-mockup.jpg`}
                    />
                  )}
                </div>
              </div>

              {/* ===== 5. REEL FRAMES (se não tem mockups) ===== */}
              {!post.mockups && (() => {
                const frames = parseReelFrames(post);
                if (frames.length === 0) return null;
                return (
                  <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
                    <div className="px-4 py-2.5 border-b border-[#E8E2D9] flex items-center justify-between">
                      <div>
                        <p className="font-bold text-xs text-[#4A4035]">Reel — {frames.length} frames</p>
                        <p className="text-[10px] text-[#A09888]">CapCut → 2-3s por frame + fade</p>
                      </div>
                      <span className="text-[9px] bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-2 py-0.5 rounded-full">{frames.length} frames</span>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-2 gap-2">
                        {frames.map((frame, i) => (
                          <AutoImage key={i} template="dica" eco={frame.eco} formato="stories" texto={frame.texto} subtitulo={i === frames.length - 1 ? 'app.seteecos.com' : ''} scale={0.22} filename={`reel-${post.dia}-frame-${frame.num}.png`} />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* Legendas por plataforma */}
          {post.formato !== 'destaques' && <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 border-b border-[#E8E2D9]">
              <p className="font-bold text-xs text-[#4A4035]">Legendas prontas</p>
              <p className="text-[10px] text-[#A09888]">Toca para copiar o texto de cada rede</p>
            </div>
            <div className="divide-y divide-[#E8E2D9]">
              <TextoPlataforma
                plataforma="Instagram"
                icone="📸"
                cor="text-pink-600"
                texto={post.instagram?.caption || ''}
                aberto={textoAberto === 'ig'}
                onToggle={() => setTextoAberto(v => v === 'ig' ? null : 'ig')}
                copiar={copiar}
                copiado={copiado}
                idCopia={`lanc-${post.dia}-ig`}
              />
              <TextoPlataforma
                plataforma="Facebook"
                icone="👤"
                cor="text-blue-600"
                texto={post.facebook || ''}
                aberto={textoAberto === 'fb'}
                onToggle={() => setTextoAberto(v => v === 'fb' ? null : 'fb')}
                copiar={copiar}
                copiado={copiado}
                idCopia={`lanc-${post.dia}-fb`}
              />
              <TextoPlataforma
                plataforma="WhatsApp"
                icone="💬"
                cor="text-green-600"
                texto={post.whatsapp || ''}
                aberto={textoAberto === 'wa'}
                onToggle={() => setTextoAberto(v => v === 'wa' ? null : 'wa')}
                copiar={copiar}
                copiado={copiado}
                idCopia={`lanc-${post.dia}-wa`}
                linkEnviar={post.whatsapp ? `https://wa.me/?text=${encodeURIComponent(post.whatsapp)}` : null}
              />
              {post.tiktok && (
                <TextoPlataforma
                  plataforma="TikTok / Reels"
                  icone="🎬"
                  cor="text-gray-700"
                  texto={typeof post.tiktok === 'object'
                    ? `COMO FAZER (sem aparecer):\nTexto em ecrã + música trending. Usa o CapCut (grátis).\nAs imagens de story acima servem como fundo.\n\n---\nROTEIRO:\n${post.tiktok.ideia}\n\n---\nCAPTION:\n${post.tiktok.caption}`
                    : post.tiktok}
                  aberto={textoAberto === 'tt'}
                  onToggle={() => setTextoAberto(v => v === 'tt' ? null : 'tt')}
                  copiar={copiar}
                  copiado={copiado}
                  idCopia={`lanc-${post.dia}-tt`}
                />
              )}
            </div>
          </div>}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MODO SIMPLES — Vista principal com 4 redes + 2 ecos por dia
// ============================================================

function ModoSimples({ copiar, copiado, onVerTudo, prog }) {
  const [variante, setVariante] = useState(0);
  const [diaOffset, setDiaOffset] = useState(0);
  const [subModo, setSubModo] = useState('diario'); // 'diario' ou 'lancamento'

  const dataAlvo = new Date();
  dataAlvo.setDate(dataAlvo.getDate() + diaOffset);
  const conteudo = gerarConteudoDiario(dataAlvo, variante);

  const dataFormatada = dataAlvo.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
  const isHoje = diaOffset === 0;

  // Semana completa para preview
  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
  const semana = gerarSemanaCompleta(inicioSemana, variante);

  if (subModo === 'lancamento') {
    return <CampanhaLancamento copiar={copiar} copiado={copiado} onDiario={() => setSubModo('diario')} onVerTudo={onVerTudo} prog={prog} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white px-4 pt-5 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Link to="/coach" className="text-white/60 hover:text-white text-sm">&larr; Coach</Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSubModo('lancamento')}
                className="px-3 py-1.5 bg-white/10 rounded-full text-[11px] font-bold text-white/80 hover:bg-white/20 active:scale-95 transition-all"
              >
                Lançamento
              </button>
              <button
                onClick={() => setVariante(v => v + 1)}
                className="px-3 py-1.5 bg-white/10 rounded-full text-[11px] font-bold text-white/80 hover:bg-white/20 active:scale-95 transition-all"
              >
                Outro conteúdo
              </button>
            </div>
          </div>
          <p className="text-white/50 text-xs uppercase tracking-wider">{dataFormatada}</p>
          <h1 className="text-xl font-bold mt-1" style={{ fontFamily: 'var(--font-titulos)' }}>
            {isHoje ? 'Publica hoje' : `Conteúdo — ${conteudo.diaSemana}`}
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {conteudo.vitalis?.emoji} VITALIS + {conteudo.ecoDoDia?.emoji} {conteudo.ecoDoDia?.nome}
          </p>
        </div>
      </div>

      {/* Navegação semanal */}
      <div className="max-w-lg mx-auto px-4 mt-3">
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
          {semana.map((dia, i) => {
            const dData = new Date(inicioSemana);
            dData.setDate(dData.getDate() + i);
            const isSelected = dData.toISOString().split('T')[0] === dataAlvo.toISOString().split('T')[0];
            const isToday = dData.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
            const diaSemanaAbrev = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i];
            return (
              <button
                key={i}
                onClick={() => { const hoje = new Date(); hoje.setHours(0,0,0,0); const d = new Date(dData); d.setHours(0,0,0,0); setDiaOffset(Math.round((d - hoje) / 86400000)); }}
                className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[#1a1a2e] text-white shadow-lg'
                    : isToday
                      ? 'bg-white border-2 border-[#1a1a2e] text-[#1a1a2e]'
                      : 'bg-white border border-[#E8E2D9] text-[#6B5C4C]'
                }`}
              >
                <span>{diaSemanaAbrev}</span>
                <span className="text-[9px]">{dData.getDate()}</span>
                <span className="text-[9px]">{dia.ecoDoDia?.emoji}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-3 space-y-4">

        {/* VITALIS (sempre) */}
        <div>
          <p className="text-[10px] font-bold text-[#A09888] uppercase tracking-wider mb-2 px-1">
            Vitalis — todos os dias
          </p>
          <BlocoEco eco={conteudo.vitalis} copiar={copiar} copiado={copiado} prefixo="v" />
        </div>

        {/* ECO DO DIA */}
        <div>
          <p className="text-[10px] font-bold text-[#A09888] uppercase tracking-wider mb-2 px-1">
            {conteudo.ecoDoDia?.nome} — eco do dia
          </p>
          <BlocoEco eco={conteudo.ecoDoDia} copiar={copiar} copiado={copiado} prefixo="e" />
        </div>

        {/* Link para dashboard completo */}
        <button
          onClick={onVerTudo}
          className="w-full py-3 rounded-2xl text-xs text-[#A09888] hover:text-[#6B5C4C] transition-colors"
        >
          Ver dashboard completo (mockups, carrosséis, anúncios...)
        </button>

      </div>
    </div>
  );
}

// ============================================================
// TAB: REVISÃO - Coach de marketing pessoal
// ============================================================

function RevisaoTab({ copiar, copiado, prog }) {
  const { toggle, isDone, countDone } = prog;
  const hoje = gerarConteudoHoje();
  const semana = gerarConteudoSemana();
  const statusWA = gerarStatusWhatsApp();
  const [semanaAberta, setSemanaAberta] = useState(0);

  // Calculate current week number since start
  const dataHoje = new Date();
  const dataHojeStr = dataHoje.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });

  // Phase logic: which phase is she in?
  const fase1Done = countDone('rev-f1-');
  const fase1Total = 6;
  const fase2Done = countDone('rev-f2-');
  const fase2Total = 6;
  const fase3Done = countDone('rev-f3-');
  const fase3Total = 6;
  const fase4Done = countDone('rev-f4-');
  const fase4Total = 6;

  const faseActual = fase1Done >= fase1Total ? (fase2Done >= fase2Total ? (fase3Done >= fase3Total ? 3 : 2) : 1) : 0;

  const fases = [
    {
      num: 1,
      titulo: 'ARRANCAR',
      subtitulo: 'Setup + campanha de lançamento (10 posts)',
      cor: 'from-amber-500 to-orange-600',
      corBg: 'bg-amber-50 border-amber-200',
      corText: 'text-amber-700',
      done: fase1Done,
      total: fase1Total,
      tarefas: [
        { key: 'rev-f1-bio', texto: 'Configurar perfil Instagram (bio, foto, link)', tab: 'vitalis', secao: 'Setup Instagram', accao: 'Vai ao tab VITALIS > Setup Instagram. Copia a bio, mete a foto, configura o link.' },
        { key: 'rev-f1-wa', texto: 'Configurar WhatsApp Business (perfil + mensagens auto)', tab: 'wabusiness', accao: 'Vai ao tab WA Business. Copia o perfil, a saudação e a mensagem de ausência.' },
        { key: 'rev-f1-lanc-f1', texto: 'Publicar posts 1-3 da Campanha de Lançamento (Fase 1: Quem somos)', accao: 'Vai à Vista Simples > Lançamento. Abre a Fase 1. Descarrega imagens, copia legendas e publica 1 por dia. Marca cada post como publicado.' },
        { key: 'rev-f1-lanc-f2', texto: 'Publicar posts 4-6 da Campanha (Fase 2: Lumina + Vitalis + Serena)', accao: 'Continua na Campanha de Lançamento > Fase 2. Publica 1 post por dia. O post do Lumina é o mais importante — é o teu anzol gratuito.' },
        { key: 'rev-f1-lanc-f3', texto: 'Publicar posts 7-10 da Campanha (Fase 3: Mais ecos + CTA)', accao: 'Campanha de Lançamento > Fase 3. Publica os últimos 4 posts. O post 10 é o CTA final — convida a experimentar o Lumina grátis.' },
        { key: 'rev-f1-wa1', texto: 'Enviar posts 1, 5 e 10 no WhatsApp (versão WA)', accao: 'Na Campanha de Lançamento, cada post tem versão WhatsApp. Envia pelo menos o post 1 (apresentação), 5 (Vitalis) e 10 (CTA Lumina) para os teus contactos.' },
      ],
    },
    {
      num: 2,
      titulo: 'RITMO',
      subtitulo: 'Rotina diária: 1 post + 1 status + 1 WA',
      cor: 'from-blue-500 to-indigo-600',
      corBg: 'bg-blue-50 border-blue-200',
      corText: 'text-blue-700',
      done: fase2Done,
      total: fase2Total,
      tarefas: [
        { key: 'rev-f2-post3', texto: 'Publicar Post #12 (reel orgulho MZ)', tab: 'vitalis', secao: 'Posts (12)', accao: 'Vai a Posts (12), post #12. Grava o reel seguindo o roteiro. Publica.' },
        { key: 'rev-f2-post4', texto: 'Publicar Post #5 (espaço emocional)', tab: 'vitalis', secao: 'Posts (12)', accao: 'Post #5 com mockup + caption. Formato emocional.' },
        { key: 'rev-f2-post5', texto: 'Publicar Post #8 (carrossel Dietas vs VITALIS)', tab: 'carrosseis', accao: 'Descarrega o carrossel "Dietas vs VITALIS". Polémico = mais alcance.' },
        { key: 'rev-f2-post6', texto: 'Publicar Post #4 (98 receitas)', tab: 'vitalis', secao: 'Posts (12)', accao: 'Post #4: receitas do mercado. Prático e local.' },
        { key: 'rev-f2-stories', texto: 'Publicar stories 3 dias seguidos (usar tab Hoje)', tab: 'hoje', accao: 'Cada dia, vai ao tab Hoje > Stories. Copia a sequência de 5 stories.' },
        { key: 'rev-f2-wa-rotina', texto: 'Enviar 3 mensagens WA em 3 dias diferentes', tab: 'hoje', accao: 'Cada dia, vai ao tab Hoje > WhatsApp. Alterna entre Dica, Provocação e Pessoal.' },
      ],
    },
    {
      num: 3,
      titulo: 'CRESCER',
      subtitulo: 'Engagement + últimos posts do grid',
      cor: 'from-green-500 to-emerald-600',
      corBg: 'bg-green-50 border-green-200',
      corText: 'text-green-700',
      done: fase3Done,
      total: fase3Total,
      tarefas: [
        { key: 'rev-f3-post7', texto: 'Publicar Post #11 (reel POV)', tab: 'vitalis', secao: 'Posts (12)', accao: 'Reel #11: POV trending. Grava seguindo o roteiro.' },
        { key: 'rev-f3-post8', texto: 'Publicar Post #3 (coach 24h)', tab: 'vitalis', secao: 'Posts (12)', accao: 'Post #3: diferencial da coach IA.' },
        { key: 'rev-f3-post9', texto: 'Publicar Post #9 (carrossel tour)', tab: 'carrosseis', accao: 'Carrossel tour da app. Educativo.' },
        { key: 'rev-f3-post10', texto: 'Publicar Post #6 (treinos + ciclo)', tab: 'vitalis', secao: 'Posts (12)', accao: 'Post #6: treinos que se adaptam ao ciclo. Nicho.' },
        { key: 'rev-f3-engage', texto: 'Responder a 10 comentários/DMs no Instagram', accao: 'Dedica 15 minutos a responder e interagir. Cada comentário respondido = mais alcance.' },
        { key: 'rev-f3-grupo', texto: 'Enviar mensagem para 1 grupo no WA', tab: 'hoje', accao: 'Tab Hoje > WhatsApp > tom "Lumina". Adapta para grupo.' },
      ],
    },
    {
      num: 4,
      titulo: 'CONVERTER',
      subtitulo: 'Vendas directas + anúncios',
      cor: 'from-purple-500 to-pink-600',
      corBg: 'bg-purple-50 border-purple-200',
      corText: 'text-purple-700',
      done: fase4Done,
      total: fase4Total,
      tarefas: [
        { key: 'rev-f4-post11', texto: 'Publicar Post #10 (reel dia com VITALIS)', tab: 'vitalis', secao: 'Posts (12)', accao: 'Reel #10: "Um dia com VITALIS". Relatable.' },
        { key: 'rev-f4-post12', texto: 'Publicar Post #2 (dashboard profissional)', tab: 'vitalis', secao: 'Posts (12)', accao: 'Post #2: mostra o interior da app. Profissionalismo.' },
        { key: 'rev-f4-promo', texto: 'Enviar mensagem WA com código VEMVITALIS20', tab: 'hoje', accao: 'Tab Hoje > WhatsApp > tom "Urgência" ou "Promo". Inclui o código de 20% desconto.' },
        { key: 'rev-f4-testemunho', texto: 'Publicar 1 testemunho (story ou post)', accao: 'Pede feedback a um/a utilizador/a. Publica como story com a permissão.' },
        { key: 'rev-f4-ad1', texto: 'Activar 1 anúncio no Meta (Lumina grátis)', tab: 'anuncios', accao: 'Tab Anúncios. Copia o anúncio "Lumina Diagnóstico". Cria no Meta Business Suite.' },
        { key: 'rev-f4-recap', texto: 'Enviar mensagem de recap/urgência final no WA', tab: 'hoje', accao: 'Tab Hoje > WhatsApp > tom "Urgência". Última chance do mês.' },
      ],
    },
  ];

  // Find today's micro-tasks (3 quick wins)
  const getMicroTarefasHoje = () => {
    const diaKey = dataHoje.toISOString().split('T')[0];
    const dayOfWeek = dataHoje.getDay();

    const tarefas = [];

    // 1. Always: post or content task based on phase
    const faseActiva = fases[faseActual];
    if (faseActiva) {
      const proxTarefa = faseActiva.tarefas.find(t => !isDone(t.key));
      if (proxTarefa) {
        tarefas.push({ ...proxTarefa, key: proxTarefa.key, micro: true, tipo: 'conteudo' });
      }
    }

    // 2. Always: WA status
    tarefas.push({
      key: `micro-status-${diaKey}`,
      texto: 'Publicar 1 status no WhatsApp',
      accao: `Copia o texto abaixo e publica como status no WhatsApp.`,
      conteudo: statusWA.mensagem,
      tipo: 'whatsapp',
    });

    // 3. Rotating: engagement / stories / DM
    if (dayOfWeek % 3 === 0) {
      tarefas.push({
        key: `micro-engage-${diaKey}`,
        texto: 'Responder a 3 comentários ou DMs no Instagram',
        accao: 'Abre o Instagram, responde a comentários ou mensagens. 5 minutos.',
        tipo: 'engage',
      });
    } else if (dayOfWeek % 3 === 1) {
      tarefas.push({
        key: `micro-stories-${diaKey}`,
        texto: 'Publicar 1 story no Instagram',
        accao: 'Usa o hook do dia como texto no story. Adiciona sticker de enquete para engagement.',
        conteudo: hoje.hook,
        tipo: 'stories',
      });
    } else {
      tarefas.push({
        key: `micro-dm-${diaKey}`,
        texto: 'Enviar 1 DM pessoal a alguém que interagiu',
        accao: 'Escolhe alguém que reagiu ao teu conteúdo. Envia uma mensagem curta e genuína.',
        tipo: 'engage',
      });
    }

    return tarefas;
  };

  const microTarefas = getMicroTarefasHoje();

  return (
    <div className="space-y-4">
      {/* Estado actual - honest assessment */}
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white rounded-2xl p-5">
        <h3 className="font-bold text-lg">Onde estás agora</h3>
        <p className="text-white/60 text-sm mt-1 leading-relaxed">
          Tens imenso conteúdo pronto — 12 mockups, 8 carrosséis, 7 mensagens WA, captions escritas, roteiros de reels. Não te falta material. Falta-te uma rotina simples e saber por onde começar.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-[10px] text-white/40 uppercase font-bold">Pronto a usar</p>
            <p className="text-2xl font-bold mt-1">42+</p>
            <p className="text-[10px] text-white/50">peças de conteúdo</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-[10px] text-white/40 uppercase font-bold">Teu progresso</p>
            <p className="text-2xl font-bold mt-1">{fase1Done + fase2Done + fase3Done + fase4Done}/24</p>
            <p className="text-[10px] text-white/50">tarefas concluídas</p>
          </div>
        </div>
      </div>

      {/* HOJE: 3 MICRO-TAREFAS */}
      <div className="bg-white rounded-2xl border-2 border-[#1a1a2e] overflow-hidden shadow-lg">
        <div className="bg-[#1a1a2e] text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base">Hoje faz APENAS isto</h3>
              <p className="text-white/50 text-xs mt-0.5">{dataHojeStr}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{microTarefas.filter(t => isDone(t.key)).length}/{microTarefas.length}</p>
              <p className="text-[9px] text-white/40">feitas hoje</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {microTarefas.map((tarefa, i) => {
            const done = isDone(tarefa.key);
            const tipoIcon = tarefa.tipo === 'whatsapp' ? '💬' : tarefa.tipo === 'stories' ? '📱' : tarefa.tipo === 'engage' ? '💬' : '📸';
            const tipoCor = tarefa.tipo === 'whatsapp' ? 'border-l-green-400 bg-green-50/50' : tarefa.tipo === 'stories' ? 'border-l-purple-400 bg-purple-50/50' : tarefa.tipo === 'engage' ? 'border-l-amber-400 bg-amber-50/50' : 'border-l-pink-400 bg-pink-50/50';
            return (
              <div key={tarefa.key} className={`border-l-4 rounded-xl p-3 transition-all ${done ? 'border-l-green-400 bg-green-50/30 opacity-60' : tipoCor}`}>
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggle(tarefa.key)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      done ? 'bg-green-500 border-green-500 text-white' : 'border-[#C8BFB6] hover:border-[#1a1a2e]'
                    }`}
                  >
                    {done && <span className="text-xs">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs">{tipoIcon}</span>
                      <p className={`text-sm font-bold ${done ? 'line-through text-[#A09888]' : 'text-[#4A4035]'}`}>{tarefa.texto}</p>
                    </div>
                    <p className="text-xs text-[#6B5C4C] leading-relaxed">{tarefa.accao}</p>
                    {tarefa.conteudo && !done && (
                      <div className="mt-2 bg-white rounded-lg p-2.5 border border-[#E8E2D9]">
                        <pre className="text-[11px] text-[#4A4035] whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">{tarefa.conteudo}</pre>
                        <CopyBtn onClick={() => copiar(tarefa.conteudo, `micro-${i}`)} copiado={copiado === `micro-${i}`} label="Copiar" small />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {microTarefas.every(t => isDone(t.key)) && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 text-center">
              <p className="text-lg font-bold">Parabéns! Dia concluído.</p>
              <p className="text-sm text-white/80 mt-1">Volta amanhã para novas micro-tarefas.</p>
            </div>
          )}
        </div>
      </div>

      {/* PLANO DE 4 FASES */}
      <Card titulo="Plano de 4 Fases" badge="24 tarefas no total">
        <p className="text-xs text-[#6B5C4C] mb-3 leading-relaxed">
          Segue na ordem. Cada fase tem 6 tarefas. Não passes à próxima sem acabar a anterior.
          Ao teu ritmo — sem pressão de datas.
        </p>
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {fases.map((fase, i) => {
            const isActive = i === faseActual;
            const isComplete = fase.done >= fase.total;
            return (
              <button
                key={fase.num}
                onClick={() => setSemanaAberta(i)}
                className={`p-2 rounded-xl text-center transition-all border-2 ${
                  semanaAberta === i ? 'border-[#1a1a2e] shadow-md' :
                  isComplete ? 'border-green-300 bg-green-50' :
                  isActive ? 'border-amber-300 bg-amber-50' :
                  'border-[#E8E2D9] bg-white'
                }`}
              >
                <p className={`text-xs font-bold ${isComplete ? 'text-green-600' : isActive ? 'text-amber-700' : 'text-[#6B5C4C]'}`}>
                  {isComplete ? '✓' : ''} Fase {fase.num}
                </p>
                <p className="text-[9px] text-[#A09888] mt-0.5">{fase.done}/{fase.total}</p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Fase aberta - detalhe */}
      {(() => {
        const fase = fases[semanaAberta];
        const isComplete = fase.done >= fase.total;
        return (
          <div className={`rounded-2xl border overflow-hidden ${isComplete ? 'border-green-300' : 'border-[#E8E2D9]'}`}>
            <div className={`bg-gradient-to-r ${fase.cor} text-white px-4 py-3`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Fase {fase.num}: {fase.titulo}</h3>
                  <p className="text-white/80 text-xs">{fase.subtitulo}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{fase.done}/{fase.total}</p>
                </div>
              </div>
              {/* Mini progress */}
              <div className="h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${(fase.done / fase.total) * 100}%` }} />
              </div>
            </div>
            <div className="bg-white p-4 space-y-2">
              {fase.tarefas.map((tarefa, i) => {
                const done = isDone(tarefa.key);
                return (
                  <div
                    key={tarefa.key}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                      done ? 'bg-green-50/50' : 'bg-[#FAFAF8] hover:bg-[#F5F2ED]'
                    }`}
                  >
                    <button
                      onClick={() => toggle(tarefa.key)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        done ? 'bg-green-500 border-green-500 text-white' : 'border-[#C8BFB6] hover:border-[#1a1a2e]'
                      }`}
                    >
                      {done && <span className="text-xs">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${done ? 'line-through text-[#A09888]' : 'text-[#4A4035]'}`}>
                        {i + 1}. {tarefa.texto}
                      </p>
                      {!done && (
                        <p className="text-xs text-[#6B5C4C] mt-1 leading-relaxed">{tarefa.accao}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ESTA SEMANA - conteúdo dinâmico */}
      <Card titulo="Conteúdo desta semana" badge="gerado automaticamente">
        <p className="text-xs text-[#6B5C4C] mb-3">
          Cada dia tem um tema diferente. O conteúdo renova-se automaticamente.
        </p>
        <div className="space-y-2">
          {semana.map((dia, i) => {
            const isPast = i < dataHoje.getDay();
            const isToday = i === dataHoje.getDay();
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  isToday ? 'bg-[#1a1a2e] text-white' :
                  isPast ? 'bg-gray-50 opacity-50' :
                  'bg-[#FAFAF8]'
                }`}
              >
                <span className={`text-xs font-bold w-14 shrink-0 ${isToday ? 'text-white' : 'text-[#A09888]'}`}>
                  {dia.diaSemana.slice(0, 3)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${isToday ? 'text-white' : 'text-[#4A4035]'}`}>{dia.hook}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    isToday ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'
                  }`}>{dia.formato}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    isToday ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                  }`}>{dia.tipo}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick links to other tabs */}
      <div className="grid grid-cols-2 gap-2">
        <QuickLink icon="📱" titulo="12 Mockups Prontos" desc="Imagens + captions + WA" tab="vitalis" />
        <QuickLink icon="📑" titulo="Carrosséis" desc="Descarrega e publica" tab="carrosseis" />
        <QuickLink icon="⚡" titulo="Conteúdo de Hoje" desc="Post + stories + WA" tab="hoje" />
        <QuickLink icon="💼" titulo="Setup WA Business" desc="Perfil + respostas auto" tab="wabusiness" />
      </div>

      {/* Motivational note */}
      <div className="bg-[#1a1a2e] text-white rounded-2xl p-4">
        <p className="text-sm leading-relaxed">
          Não tens de fazer tudo de uma vez. <strong>3 micro-tarefas por dia</strong> é o suficiente.
          Em 4 semanas, vais ter um Instagram profissional, uma presença activa no WhatsApp,
          e pessoas a descobrirem o SETE ECOS todos os dias.
        </p>
        <p className="text-white/50 text-xs mt-2">— O teu marketing coach digital</p>
      </div>
    </div>
  );
}

function QuickLink({ icon, titulo, desc }) {
  return (
    <div className="bg-white rounded-xl border border-[#E8E2D9] p-3 hover:shadow-md transition-all cursor-pointer">
      <span className="text-lg">{icon}</span>
      <p className="text-xs font-bold text-[#4A4035] mt-1">{titulo}</p>
      <p className="text-[10px] text-[#A09888]">{desc}</p>
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
  const [metaConfigurada, setMetaConfigurada] = useState(false);

  useEffect(() => {
    verificarMetaAPI().then(r => setMetaConfigurada(r.configurada)).catch(() => {});
  }, []);

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
          { id: 'meta-api', label: 'Meta API', icon: '🔗' },
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
        <Link
          to="/coach/social"
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
        >
          🗓 Agendar Posts
        </Link>
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
                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3">
                    <DownloadDiaZip dia={dia} />
                    <AgendarDiaBtn dia={dia} copiar={copiar} copiado={copiado} />
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

                        {/* Publicar directo no Instagram */}
                        {tarefa.post && tarefa.post.tipo !== 'reel' && (
                          <PublicarBtn post={tarefa.post} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </>
      )}

      {/* =================== GUIA META API =================== */}
      {secao === 'meta-api' && (() => {
        const guia = getGuiaMetaDeveloper();
        return (
          <>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-4">
              <h3 className="font-bold text-lg flex items-center gap-2">🔗 {guia.titulo}</h3>
              <p className="text-white/80 text-sm mt-1">{guia.descricao}</p>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="bg-white/20 px-2 py-1 rounded">⏱ {guia.tempoEstimado}</span>
                {metaConfigurada && <span className="bg-green-400/30 px-2 py-1 rounded">✅ API Activa</span>}
                {!metaConfigurada && <span className="bg-red-400/30 px-2 py-1 rounded">⚠️ Nao configurada</span>}
              </div>
            </div>

            <Card titulo="Requisitos" badge="ANTES DE COMECAR">
              <ul className="space-y-1">
                {guia.requisitos.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500 mt-0.5">●</span> {r}
                  </li>
                ))}
              </ul>
            </Card>

            {guia.passos.map(passo => (
              <Card key={passo.numero} titulo={`Passo ${passo.numero}: ${passo.titulo}`} badge={`${passo.numero}/7`}>
                <ol className="space-y-2">
                  {passo.instrucoes.map((inst, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ol>
                {passo.nota && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    ⚠️ {passo.nota}
                  </div>
                )}
                {passo.link && (
                  <a href={passo.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    🔗 Abrir {passo.link.replace('https://', '')}
                  </a>
                )}
              </Card>
            ))}

            <Card titulo={guia.verificacao.titulo} badge="TESTE">
              <ol className="space-y-2">
                {guia.verificacao.passos.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="bg-green-100 text-green-700 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card titulo="Problemas Comuns" badge="FAQ">
              <div className="space-y-3">
                {guia.problemas.map((p, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="font-bold text-sm text-red-600">❌ {p.problema}</p>
                    <p className="text-sm text-gray-700 mt-1">✅ {p.solucao}</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        );
      })()}

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
  const [variante, setVariante] = useState(0);
  const hoje = gerarConteudoHoje(new Date(), variante);
  const maxVar = totalVariantes(hoje.tema);
  const captionPost = gerarCaptionInstagram('post', variante);
  const captionReel = gerarCaptionInstagram('reel', variante);
  const captionStories = gerarCaptionInstagram('stories', variante);
  const waTypes = ['dica', 'provocacao', 'pessoal', 'educacao', 'reflexao', 'ciencia', 'lumina'];
  const [waTipo, setWaTipo] = useState('dica');
  const wa = gerarMensagemWhatsApp(waTipo, '', variante);

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
        <div className="flex items-center justify-between mt-3">
          <p className="text-[10px] text-[#6B5C4C]">
            Variante {(variante % maxVar) + 1} de {maxVar}
          </p>
          <button
            onClick={() => setVariante(v => v + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200 transition-colors active:scale-95"
          >
            <span className="text-sm">&#x21bb;</span> Gerar novo conteúdo
          </button>
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
              {t === 'dica' ? '💡 Dica' : t === 'provocacao' ? '🔥 Provocação' : t === 'pessoal' ? '🤍 Pessoal' : t === 'educacao' ? '📚 Educação' : t === 'reflexao' ? '💭 Reflexão' : t === 'ciencia' ? '🔬 Ciência' : '🔮 Lumina'}
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
          Cada dia tem um tema diferente (reflexão, provocação, educação, etc.).
          Carrega em "Gerar novo conteúdo" para ver outras variantes do mesmo tema.
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
  const audioUrl = carrossel.audioSlug ? getAudioUrl('marketing', carrossel.audioSlug) : null;

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
      {audioUrl && (
        <div className="mt-3 p-3 bg-[#1a1a2e]/5 rounded-xl border border-[#E8E2D9]">
          <p className="text-[10px] font-bold text-[#6B5C4C] mb-2">VOICEOVER</p>
          <audio controls preload="metadata" className="w-full h-10" style={{ borderRadius: '8px' }}>
            <source src={audioUrl} type="audio/mpeg" />
          </audio>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#E8E2D9]">
        <button onClick={downloadAll} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a2e] text-white rounded-full text-sm font-bold disabled:opacity-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Todos ({carrossel.slides.length} slides)
        </button>
        {audioUrl && (
          <a href={audioUrl} download={`${carrossel.id}-voiceover.mp3`} className="flex items-center gap-1.5 px-4 py-2 bg-[#6B5B95] text-white rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
            MP3
          </a>
        )}
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

// ============================================================
// PUBLICAR NO INSTAGRAM - Botão por post
// ============================================================

function PublicarBtn({ post }) {
  const [estado, setEstado] = useState('idle'); // idle, loading, success, error
  const [erro, setErro] = useState('');

  const publicar = async () => {
    setEstado('loading');
    setErro('');
    try {
      const isCarousel = post.tipo === 'carrossel';
      const imageUrl = isCarousel
        ? post.imagens.map(img => `${window.location.origin}${img}`)
        : `${window.location.origin}${post.imagens[0]}`;

      await publicarAgora({
        type: isCarousel ? 'carousel' : 'photo',
        imageUrl,
        caption: post.caption,
      });
      setEstado('success');
    } catch (e) {
      setEstado('error');
      setErro(e.message);
    }
  };

  if (estado === 'success') {
    return (
      <div className="flex items-center gap-2 mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
        <span className="text-green-600 text-xs font-bold">✅ Publicado no Instagram!</span>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <button
        onClick={publicar}
        disabled={estado === 'loading'}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
          estado === 'loading'
            ? 'bg-gray-200 text-gray-500 cursor-wait'
            : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-md'
        }`}
      >
        {estado === 'loading' ? '⏳ A publicar...' : '📸 Publicar no Instagram'}
      </button>
      {estado === 'error' && (
        <p className="text-[10px] text-red-500 mt-1">
          {erro.includes('not configured') ? '⚙️ Meta API não configurada. Ver tab "Setup Instagram".' : `❌ ${erro}`}
        </p>
      )}
    </div>
  );
}

// ============================================================
// AGENDAR DIA COMPLETO
// ============================================================

function AgendarDiaBtn({ dia, copiar, copiado }) {
  const [estado, setEstado] = useState('idle');
  const [showPicker, setShowPicker] = useState(false);
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });

  const agendar = async () => {
    setEstado('loading');
    try {
      const resultados = await agendarDiaCompleto(dia.dia, dia.tarefas, new Date(dataInicio));
      const sucesso = resultados.filter(r => r.sucesso).length;
      setEstado(sucesso > 0 ? 'success' : 'error');
    } catch {
      setEstado('error');
    }
  };

  if (!showPicker) {
    return (
      <button
        onClick={() => setShowPicker(true)}
        className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
      >
        🗓 Agendar Dia
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={dataInicio}
        onChange={(e) => setDataInicio(e.target.value)}
        className="text-xs border rounded-lg px-2 py-1.5"
      />
      <button
        onClick={agendar}
        disabled={estado === 'loading'}
        className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
          estado === 'loading' ? 'bg-gray-300 text-gray-500' :
          estado === 'success' ? 'bg-green-500 text-white' :
          'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {estado === 'loading' ? '⏳...' : estado === 'success' ? '✅ Agendado!' : '🗓 Confirmar'}
      </button>
    </div>
  );
}

// ============================================================
// DOWNLOAD ZIP - Todo o material de um dia
// ============================================================

function DownloadDiaZip({ dia }) {
  const [loading, setLoading] = useState(false);

  const download = async () => {
    setLoading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(`dia-${dia.dia}-${dia.titulo.replace(/[^a-zA-Z0-9]/g, '-')}`);
      let captionsText = `# ${dia.titulo}\n${dia.subtitulo}\n\n`;

      for (const tarefa of dia.tarefas) {
        if (tarefa.post) {
          // Download images
          for (let j = 0; j < tarefa.post.imagens.length; j++) {
            try {
              const res = await fetch(tarefa.post.imagens[j]);
              const blob = await res.blob();
              const ext = tarefa.post.imagens[j].split('.').pop() || 'jpg';
              folder.file(`post-${tarefa.post.numero}-img-${j + 1}.${ext}`, blob);
            } catch (e) {
              console.error('Erro download imagem:', e);
            }
          }

          // Add caption
          captionsText += `---\n## ${tarefa.hora} — ${tarefa.titulo}\n\n`;
          captionsText += `**Caption:**\n${tarefa.post.caption}\n\n`;
          if (tarefa.post.roteiro) {
            captionsText += `**Roteiro Reel:**\n${tarefa.post.roteiro}\n\n`;
          }
        }

        if (tarefa.mensagemWA) {
          captionsText += `---\n## ${tarefa.hora} — WhatsApp: ${tarefa.titulo}\n\n`;
          captionsText += `${tarefa.mensagemWA.mensagem}\n\n`;

          try {
            const res = await fetch(tarefa.mensagemWA.imagem);
            const blob = await res.blob();
            folder.file(`whatsapp-${tarefa.titulo.replace(/[^a-zA-Z0-9]/g, '-')}.jpg`, blob);
          } catch (e) {
            console.error('Erro download imagem WA:', e);
          }
        }

        if (tarefa.stories) {
          captionsText += `---\n## ${tarefa.hora} — Stories\n\n`;
          tarefa.stories.forEach((s, si) => {
            captionsText += `${si + 1}. [${s.tipo}] ${s.texto}\n`;
          });
          captionsText += '\n';
        }
      }

      folder.file('CAPTIONS-E-TEXTOS.md', captionsText);

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `sete-ecos-dia-${dia.dia}.zip`);
    } catch (e) {
      console.error('Erro ao gerar ZIP:', e);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={download}
      disabled={loading}
      className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
        loading ? 'bg-gray-200 text-gray-500 cursor-wait' : 'bg-[#1a1a2e] text-white hover:bg-[#2a2a4e]'
      }`}
    >
      {loading ? '⏳ A preparar...' : '📦 Download ZIP do Dia'}
    </button>
  );
}

// ============================================================
// CARD + COPYBTN helpers
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

// ============================================================
// WA BUSINESS TAB - Setup completo WhatsApp Business
// ============================================================

function WABusinessTab({ copiar, copiado }) {
  const wa = getSetupWhatsAppBusiness();
  const [secao, setSecao] = useState('perfil');

  const corEtiqueta = (cor) => {
    const map = { verde: 'bg-green-500', amarelo: 'bg-yellow-400', azul: 'bg-blue-500', vermelho: 'bg-red-500', roxo: 'bg-purple-500', cinza: 'bg-gray-400' };
    return map[cor] || 'bg-gray-400';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-4">
        <h3 className="font-bold text-lg">💼 WhatsApp Business — Setup Profissional</h3>
        <p className="text-white/80 text-sm mt-1">Tudo pronto para copiar e colar. Configura o teu WhatsApp Business em 25 minutos.</p>
      </div>

      {/* Sub-secções */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'perfil', label: 'Perfil', icon: '👤' },
          { id: 'mensagens', label: 'Mensagens Auto', icon: '💬' },
          { id: 'rapidas', label: 'Respostas Rápidas', icon: '⚡' },
          { id: 'catalogo', label: 'Catálogo', icon: '🛒' },
          { id: 'etiquetas', label: 'Etiquetas', icon: '🏷' },
          { id: 'status', label: 'Status Semanal', icon: '📱' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setSecao(s.id)}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              secao === s.id ? 'bg-green-700 text-white shadow-lg' : 'bg-white text-[#6B5C4C] border border-[#E8E2D9]'
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* ===== PERFIL ===== */}
      {secao === 'perfil' && (
        <Card titulo="Perfil da Empresa" badge="COPIAR E COLAR">
          <div className="space-y-3">
            {Object.entries(wa.perfil).map(([campo, valor]) => (
              <div key={campo} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-400">{campo}</span>
                  <CopyBtn onClick={() => copiar(valor)} copiado={copiado === valor} label="Copiar" small />
                </div>
                <p className="text-sm mt-1 font-medium">{valor}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
            📍 Caminho: Definições → Ferramentas comerciais → Perfil da empresa
          </div>
        </Card>
      )}

      {/* ===== MENSAGENS AUTOMÁTICAS ===== */}
      {secao === 'mensagens' && (
        <>
          <Card titulo="Mensagem de Saudação" badge="AUTOMÁTICA">
            <div className="bg-green-50 rounded-lg p-3 text-sm whitespace-pre-line border-l-4 border-green-400">{wa.saudacao}</div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Enviada a todos que escrevem pela 1ª vez</span>
              <CopyBtn onClick={() => copiar(wa.saudacao)} copiado={copiado === wa.saudacao} label="📋 Copiar" small />
            </div>
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2 text-[10px] text-blue-800">
              📍 Definições → Ferramentas comerciais → Mensagem de saudação → ON
            </div>
          </Card>

          <Card titulo="Mensagem de Ausência" badge="AUTOMÁTICA">
            <div className="bg-amber-50 rounded-lg p-3 text-sm whitespace-pre-line border-l-4 border-amber-400">{wa.ausencia}</div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Enviada fora do horário (Seg-Sex, 8h-18h)</span>
              <CopyBtn onClick={() => copiar(wa.ausencia)} copiado={copiado === wa.ausencia} label="📋 Copiar" small />
            </div>
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2 text-[10px] text-blue-800">
              📍 Definições → Ferramentas comerciais → Mensagem de ausência → ON → Fora do horário
            </div>
          </Card>
        </>
      )}

      {/* ===== RESPOSTAS RÁPIDAS ===== */}
      {secao === 'rapidas' && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
            📍 Definições → Ferramentas comerciais → Respostas rápidas → ➕ Adicionar<br/>
            <strong>Como usar:</strong> Numa conversa, escreve <code>/</code> e aparece a lista. Ex: escreve <code>/precos</code> e a mensagem toda aparece.
          </div>
          {wa.respostasRapidas.map((r, i) => (
            <Card key={i} titulo={r.titulo} badge={r.atalho}>
              <div className="bg-gray-50 rounded-lg p-3 text-sm whitespace-pre-line">{r.mensagem}</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-mono bg-green-100 text-green-700 px-2 py-1 rounded">{r.atalho}</span>
                <CopyBtn onClick={() => copiar(r.mensagem)} copiado={copiado === r.mensagem} label="📋 Copiar" small />
              </div>
            </Card>
          ))}
        </>
      )}

      {/* ===== CATÁLOGO ===== */}
      {secao === 'catalogo' && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
            📍 Definições → Ferramentas comerciais → Catálogo → ➕ Adicionar produto<br/>
            Para cada produto: preencher nome, preço, descrição, link e imagem.
          </div>
          {wa.catalogo.map((prod, i) => (
            <Card key={i} titulo={prod.nome} badge={prod.preco}>
              <div className="flex gap-3">
                <img src={prod.imagem} alt={prod.nome} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">{prod.descricao}</p>
                  <p className="text-xs text-blue-600 mt-1">{prod.link}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <CopyBtn onClick={() => copiar(prod.nome)} copiado={copiado === prod.nome} label="Nome" small />
                <CopyBtn onClick={() => copiar(prod.descricao)} copiado={copiado === prod.descricao} label="Descrição" small />
                <CopyBtn onClick={() => copiar(prod.link)} copiado={copiado === prod.link} label="Link" small />
              </div>
            </Card>
          ))}
        </>
      )}

      {/* ===== ETIQUETAS ===== */}
      {secao === 'etiquetas' && (
        <Card titulo="Etiquetas para Organizar Contactos" badge="6 ETIQUETAS">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 mb-3">
            📍 <strong>Onde criar:</strong> Abrir qualquer conversa → Tocar no nome em cima → Etiqueta → Criar nova<br/>
            Ou: Ecrã principal → ⋮ → Etiquetas
          </div>
          <div className="space-y-2">
            {wa.etiquetas.map((et, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className={`w-4 h-4 rounded-full shrink-0 ${corEtiqueta(et.cor)}`} />
                <div className="flex-1">
                  <span className="font-bold text-sm">{et.nome}</span>
                  <p className="text-xs text-gray-500">{et.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ===== STATUS SEMANAL ===== */}
      {secao === 'status' && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
            📍 WhatsApp → Status → Escrever texto ou adicionar foto<br/>
            Publicar 1 estado por dia seguindo este calendário. Cada estado dura 24h.
          </div>
          {wa.statusSemanal.map((dia, i) => (
            <Card key={i} titulo={dia.dia} badge={dia.conteudo}>
              <div className="flex gap-3">
                {dia.imagem && (
                  <AutoImage
                    template={dia.imagem.template}
                    eco={dia.imagem.eco}
                    formato="stories"
                    texto={dia.imagem.texto}
                    subtitulo={dia.imagem.subtitulo}
                    bgIndex={dia.imagem.bgIndex}
                    scale={0.12}
                    filename={`wa-status-${dia.dia.toLowerCase()}.png`}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-lg p-3 text-sm whitespace-pre-line">{dia.exemplo}</div>
                  <div className="mt-2 flex justify-end">
                    <CopyBtn onClick={() => copiar(dia.exemplo, `status-${i}`)} copiado={copiado === `status-${i}`} label="📋 Copiar" small />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </>
      )}
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
