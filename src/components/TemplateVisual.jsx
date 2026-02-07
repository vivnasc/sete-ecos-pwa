import React, { useRef, useState } from 'react';

/**
 * TemplateVisual - Gerador de imagens com identidade visual Sete Ecos
 * Gera templates prontos para Instagram (1080x1080), Stories (1080x1920)
 * e WhatsApp Status usando Canvas API
 *
 * Usa as cores, fontes e logos oficiais do brand
 */

// Paleta oficial
const CORES = {
  vitalis: {
    primary: '#7C8B6F',
    secondary: '#6B7A5D',
    accent: '#9CAF88',
    bg: '#F5F2ED',
    bgGrad: ['#7C8B6F', '#5A6B4E'],
    text: '#FFFFFF',
    textDark: '#4A4035',
    logo: '/logos/VITALIS_LOGO_V3.png',
    logoNome: '/logos/VITALIS_LOGO-NOME_V3.png',
  },
  aurea: {
    primary: '#C9A227',
    secondary: '#B8941F',
    accent: '#D4AF37',
    bg: '#2D2A24',
    bgGrad: ['#C9A227', '#8B6914'],
    text: '#FFFFFF',
    textDark: '#2D2A24',
    logo: '/logos/AUREA_LOGO_V3.png',
  },
  seteEcos: {
    primary: '#6B5B95',
    secondary: '#4A3D6B',
    accent: '#9B59B6',
    bg: '#1a1a2e',
    bgGrad: ['#6B5B95', '#3D2D5C'],
    text: '#FFFFFF',
    textDark: '#1a1a2e',
    logo: '/logos/seteecos_logo_v2.png',
  },
};

const FORMATOS = {
  post: { width: 1080, height: 1080, label: 'Post (1:1)' },
  stories: { width: 1080, height: 1920, label: 'Stories (9:16)' },
  whatsapp: { width: 1080, height: 1080, label: 'WhatsApp Status' },
};

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  const lines = [];

  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      lines.push({ text: line.trim(), y: currentY });
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  lines.push({ text: line.trim(), y: currentY });
  return lines;
}

async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function gerarImagem(canvas, config) {
  const { formato, eco, texto, subtitulo, estilo } = config;
  const { width, height } = FORMATOS[formato];
  const cores = CORES[eco];

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // === FUNDO ===
  if (estilo === 'gradiente' || estilo === 'escuro') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, cores.bgGrad[0]);
    grad.addColorStop(1, cores.bgGrad[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Circulos decorativos
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.15, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width * 0.1, height * 0.85, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  } else {
    // Estilo claro
    ctx.fillStyle = cores.bg;
    ctx.fillRect(0, 0, width, height);

    // Barra de cor no topo
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, cores.bgGrad[0]);
    grad.addColorStop(1, cores.bgGrad[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, formato === 'stories' ? 200 : 160);
  }

  const isLight = estilo === 'claro';
  const textColor = isLight ? cores.textDark : cores.text;
  const textSoft = isLight ? cores.primary : 'rgba(255,255,255,0.8)';

  // === LOGO ===
  try {
    const logo = await loadImage(cores.logo);
    const logoSize = formato === 'stories' ? 80 : 64;
    const logoX = isLight ? 60 : (width - logoSize) / 2;
    const logoY = isLight ? (formato === 'stories' ? 60 : 48) : (formato === 'stories' ? 180 : 100);
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
  } catch {
    // Logo nao carregou, continuar sem
  }

  // === TEXTO PRINCIPAL ===
  const textStartY = isLight
    ? (formato === 'stories' ? 300 : 260)
    : (formato === 'stories' ? 400 : 300);
  const padding = 80;
  const maxTextWidth = width - padding * 2;

  ctx.fillStyle = textColor;
  ctx.textAlign = isLight ? 'left' : 'center';

  // Titulo/dica
  const fontSize = texto.length > 100 ? 42 : texto.length > 60 ? 48 : 56;
  ctx.font = `bold ${fontSize}px 'Cormorant Garamond', Georgia, serif`;
  const textX = isLight ? padding : width / 2;
  const lines = wrapText(ctx, texto, textX, textStartY, maxTextWidth, fontSize * 1.3);

  lines.forEach(line => {
    ctx.fillText(line.text, textX, line.y);
  });

  // Subtitulo
  if (subtitulo) {
    const subY = (lines[lines.length - 1]?.y || textStartY) + fontSize * 1.8;
    ctx.font = `400 ${Math.round(fontSize * 0.55)}px 'Quicksand', sans-serif`;
    ctx.fillStyle = textSoft;
    const subLines = wrapText(ctx, subtitulo, textX, subY, maxTextWidth, fontSize * 0.7);
    subLines.forEach(line => {
      ctx.fillText(line.text, textX, line.y);
    });
  }

  // === CTA / FOOTER ===
  const footerY = height - (formato === 'stories' ? 200 : 140);

  // Linha separadora
  ctx.strokeStyle = isLight ? cores.primary + '30' : 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, footerY);
  ctx.lineTo(width - padding, footerY);
  ctx.stroke();

  // URL / marca
  ctx.font = `600 24px 'Quicksand', sans-serif`;
  ctx.fillStyle = isLight ? cores.primary : 'rgba(255,255,255,0.7)';
  ctx.textAlign = 'center';
  ctx.fillText('app.seteecos.com', width / 2, footerY + 50);

  // Hashtag
  ctx.font = `400 20px 'Quicksand', sans-serif`;
  ctx.fillStyle = isLight ? cores.primary + '99' : 'rgba(255,255,255,0.4)';
  ctx.fillText('#seteecos  #vitalis  #transformacao', width / 2, footerY + 85);
}

// ============================================================
// COMPONENTE REACT
// ============================================================

export default function TemplateVisual({ texto, subtitulo, onClose }) {
  const canvasRef = useRef(null);
  const [eco, setEco] = useState('vitalis');
  const [formato, setFormato] = useState('post');
  const [estilo, setEstilo] = useState('gradiente');
  const [gerado, setGerado] = useState(false);
  const [gerando, setGerando] = useState(false);

  const gerar = async () => {
    if (!canvasRef.current || !texto) return;
    setGerando(true);
    try {
      await gerarImagem(canvasRef.current, { formato, eco, texto, subtitulo, estilo });
      setGerado(true);
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
    }
    setGerando(false);
  };

  const descarregar = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `sete-ecos-${eco}-${formato}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const { width: canvasW, height: canvasH } = FORMATOS[formato];
  const previewScale = formato === 'stories' ? 0.22 : 0.35;

  return (
    <div className="bg-white rounded-2xl border-2 border-[#E8E2D9] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8E2D9] bg-[#F5F2ED]">
        <h3 className="font-semibold text-[#4A4035]">Criar Imagem</h3>
        {onClose && (
          <button onClick={onClose} className="text-[#6B5C4C] hover:text-[#4A4035] text-lg">x</button>
        )}
      </div>
      <div className="p-5 space-y-4">

        {/* Eco */}
        <div>
          <label className="text-xs font-semibold text-[#6B5C4C] uppercase tracking-wider block mb-2">Marca</label>
          <div className="flex gap-2">
            {[
              { id: 'vitalis', label: 'Vitalis', cor: '#7C8B6F' },
              { id: 'aurea', label: 'Aurea', cor: '#C9A227' },
              { id: 'seteEcos', label: 'Sete Ecos', cor: '#6B5B95' },
            ].map(e => (
              <button
                key={e.id}
                onClick={() => { setEco(e.id); setGerado(false); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  eco === e.id ? 'text-white shadow-md' : 'bg-[#E8E2D9] text-[#4A4035] hover:opacity-80'
                }`}
                style={eco === e.id ? { background: e.cor } : {}}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Formato */}
        <div>
          <label className="text-xs font-semibold text-[#6B5C4C] uppercase tracking-wider block mb-2">Formato</label>
          <div className="flex gap-2">
            {Object.entries(FORMATOS).map(([id, f]) => (
              <button
                key={id}
                onClick={() => { setFormato(id); setGerado(false); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  formato === id ? 'bg-[#4A4035] text-white' : 'bg-[#E8E2D9] text-[#4A4035]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Estilo */}
        <div>
          <label className="text-xs font-semibold text-[#6B5C4C] uppercase tracking-wider block mb-2">Estilo</label>
          <div className="flex gap-2">
            {[
              { id: 'gradiente', label: 'Gradiente' },
              { id: 'claro', label: 'Claro' },
              { id: 'escuro', label: 'Escuro' },
            ].map(e => (
              <button
                key={e.id}
                onClick={() => { setEstilo(e.id); setGerado(false); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  estilo === e.id ? 'bg-[#4A4035] text-white' : 'bg-[#E8E2D9] text-[#4A4035]'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Texto preview */}
        <div className="bg-[#F5F2ED] p-3 rounded-lg text-sm text-[#4A4035]">
          <span className="text-xs text-[#6B5C4C] block mb-1">Texto:</span>
          {texto}
          {subtitulo && <p className="text-xs text-[#6B5C4C] mt-1">{subtitulo}</p>}
        </div>

        {/* Botao gerar */}
        <button
          onClick={gerar}
          disabled={gerando}
          className="w-full py-3 bg-[#7C8B6F] text-white rounded-xl font-semibold hover:bg-[#6B7A5D] transition-all disabled:opacity-50"
        >
          {gerando ? 'A gerar...' : gerado ? 'Regenerar Imagem' : 'Gerar Imagem'}
        </button>

        {/* Canvas + download */}
        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            style={{
              width: canvasW * previewScale,
              height: canvasH * previewScale,
              borderRadius: '12px',
              border: gerado ? '2px solid #E8E2D9' : 'none',
              display: gerado ? 'block' : 'none',
            }}
          />
          {gerado && (
            <button
              onClick={descarregar}
              className="mt-3 flex items-center gap-2 px-6 py-2 bg-[#4A4035] text-white rounded-full text-sm font-medium hover:bg-[#3A3025] transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descarregar PNG
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
