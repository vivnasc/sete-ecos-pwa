import React, { useRef, useState, useEffect } from 'react';

/**
 * TemplateVisual v2 - Gerador profissional de imagens para redes sociais
 *
 * Templates:
 * - Dica do Dia: frase centrada com decoração
 * - Carrossel (slides): título + pontos, 1-5 slides
 * - Testemunho: citação com aspas estilizadas
 * - Antes/Depois: comparação visual
 * - CTA / Promo: chamada para acção com botão visual
 */

const CORES = {
  vitalis: {
    primary: '#7C8B6F',
    secondary: '#5A6B4E',
    accent: '#9CAF88',
    bg: '#F5F2ED',
    bgDark: '#2D3A25',
    text: '#FFFFFF',
    textDark: '#4A4035',
    logo: '/logos/VITALIS_LOGO_V3.png',
    logoNome: '/logos/VITALIS_LOGO-NOME_V3.png',
    nome: 'VITALIS',
    subtitulo: 'Coaching Nutricional',
  },
  aurea: {
    primary: '#C9A227',
    secondary: '#8B6914',
    accent: '#D4AF37',
    bg: '#FAF6F0',
    bgDark: '#2D2A24',
    text: '#FFFFFF',
    textDark: '#2D2A24',
    logo: '/logos/AUREA_LOGO_V3.png',
    nome: 'AUREA',
    subtitulo: 'Programa de Autovalor',
  },
  seteEcos: {
    primary: '#6B5B95',
    secondary: '#3D2D5C',
    accent: '#9B59B6',
    bg: '#FAF6F0',
    bgDark: '#1a1a2e',
    text: '#FFFFFF',
    textDark: '#1a1a2e',
    logo: '/logos/seteecos_logo_v2.png',
    nome: 'SETE ECOS',
    subtitulo: 'Transmutação Feminina',
  },
  lumina: {
    primary: '#5C6BC0',
    secondary: '#3949AB',
    accent: '#7986CB',
    bg: '#F0F0FA',
    bgDark: '#1a1a3e',
    text: '#FFFFFF',
    textDark: '#1a1a3e',
    logo: '/logos/lumina-logo_v2.png',
    nome: 'LUMINA',
    subtitulo: 'Diagnóstico Gratuito',
  },
  serena: {
    primary: '#6B8E9B',
    secondary: '#4A6B7C',
    accent: '#8FB3C8',
    bg: '#F0F5F7',
    bgDark: '#1a2e3a',
    text: '#FFFFFF',
    textDark: '#1a2e3a',
    logo: '/logos/SERENA_LOGO_V3.png',
    nome: 'SERENA',
    subtitulo: 'Emoção & Fluidez',
  },
  ignis: {
    primary: '#C1634A',
    secondary: '#964A38',
    accent: '#D9825A',
    bg: '#FAF4F0',
    bgDark: '#2e1a14',
    text: '#FFFFFF',
    textDark: '#2e1a14',
    logo: '/logos/IGNIS-LOGO-V3.png',
    nome: 'IGNIS',
    subtitulo: 'Vontade & Foco',
  },
  ventis: {
    primary: '#5D9B84',
    secondary: '#47745E',
    accent: '#7CB89C',
    bg: '#F0F7F3',
    bgDark: '#1a2e24',
    text: '#FFFFFF',
    textDark: '#1a2e24',
    logo: '/logos/VENTIS_LOGO_V3.png',
    nome: 'VENTIS',
    subtitulo: 'Energia & Ritmo',
  },
  ecoa: {
    primary: '#4A90A4',
    secondary: '#37697A',
    accent: '#66A8C4',
    bg: '#F0F5FB',
    bgDark: '#1a2a34',
    text: '#FFFFFF',
    textDark: '#1a2a34',
    logo: '/logos/ECOA_LOGO_V3.png',
    nome: 'ECOA',
    subtitulo: 'Expressão & Voz',
  },
  imago: {
    primary: '#8B7BA5',
    secondary: '#695870',
    accent: '#A896BB',
    bg: '#F5F2FA',
    bgDark: '#1a1a2e',
    text: '#FFFFFF',
    textDark: '#1a1a2e',
    logo: '/logos/IMAGO_LOGO_V3.png',
    nome: 'IMAGO',
    subtitulo: 'Identidade Essencial',
  },
  aurora: {
    primary: '#D4A5A5',
    secondary: '#A57D7D',
    accent: '#E5C5C5',
    bg: '#FBF5F5',
    bgDark: '#2e1a1a',
    text: '#FFFFFF',
    textDark: '#2e1a1a',
    logo: '/logos/AURORA_LOGO_V3.png',
    nome: 'AURORA',
    subtitulo: 'Integração Final',
  },
};

const FORMATOS = {
  post: { width: 1080, height: 1080, label: 'Post (1:1)' },
  stories: { width: 1080, height: 1920, label: 'Stories (9:16)' },
  tiktok: { width: 1080, height: 1920, label: 'TikTok (9:16)' },
};

const TEMPLATES = {
  dica: { label: 'Dica / Frase', icon: '💡', desc: 'Frase centrada com decoração' },
  carrossel: { label: 'Carrossel', icon: '📑', desc: 'Slides para deslizar' },
  testemunho: { label: 'Testemunho', icon: '💬', desc: 'Citação com aspas' },
  cta: { label: 'Promoção / CTA', icon: '🎯', desc: 'Chamada para acção' },
  stats: { label: 'Estatística', icon: '📊', desc: 'Número grande + contexto' },
  statusWA: { label: 'WA Status', icon: '📱', desc: 'WhatsApp Status com foto' },
};

async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = test;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function drawCenteredText(ctx, lines, x, y, lineHeight) {
  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineHeight);
  });
  return y + lines.length * lineHeight;
}

// ============================================================
// RENDER FUNCTIONS PER TEMPLATE
// ============================================================

async function renderDica(canvas, config) {
  const { formato, eco, texto, subtitulo } = config;
  const { width, height } = FORMATOS[formato];
  const cores = CORES[eco];
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const isStories = formato === 'stories';

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, width * 0.3, height);
  grad.addColorStop(0, cores.secondary);
  grad.addColorStop(0.5, cores.primary);
  grad.addColorStop(1, cores.secondary);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Decorative geometric shapes
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#FFFFFF';
  // Top-right circle
  ctx.beginPath();
  ctx.arc(width * 0.85, height * 0.12, isStories ? 250 : 180, 0, Math.PI * 2);
  ctx.fill();
  // Bottom-left circle
  ctx.beginPath();
  ctx.arc(width * 0.15, height * 0.88, isStories ? 200 : 150, 0, Math.PI * 2);
  ctx.fill();
  // Middle accent
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.5, isStories ? 350 : 280, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Thin decorative line at top
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  const lineY = isStories ? 140 : 100;
  ctx.beginPath();
  ctx.moveTo(width * 0.2, lineY);
  ctx.lineTo(width * 0.8, lineY);
  ctx.stroke();

  // Logo
  const logo = await loadImage(cores.logo);
  if (logo) {
    const logoSize = isStories ? 70 : 56;
    ctx.drawImage(logo, (width - logoSize) / 2, lineY - logoSize - 20, logoSize, logoSize);
  }

  // Main text - centered vertically
  const padding = 100;
  const maxW = width - padding * 2;
  const fontSize = texto.length > 120 ? 44 : texto.length > 80 ? 50 : texto.length > 40 ? 58 : 64;
  ctx.font = `600 ${fontSize}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  const lines = wrapText(ctx, texto, maxW);
  const totalH = lines.length * (fontSize * 1.35);
  const startY = (height - totalH) / 2 + fontSize * 0.3;
  drawCenteredText(ctx, lines, width / 2, startY, fontSize * 1.35);

  // Subtitle
  if (subtitulo) {
    const subY = startY + totalH + 30;
    ctx.font = `400 ${Math.round(fontSize * 0.45)}px 'Inter', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(subtitulo, width / 2, subY);
  }

  // Thin decorative line at bottom
  const bottomLineY = height - (isStories ? 200 : 140);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.moveTo(width * 0.2, bottomLineY);
  ctx.lineTo(width * 0.8, bottomLineY);
  ctx.stroke();

  // Footer
  ctx.font = `600 22px 'Inter', sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('app.seteecos.com', width / 2, bottomLineY + 45);
  ctx.font = `400 18px 'Inter', sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText(`${cores.nome} • @seteecos`, width / 2, bottomLineY + 75);
}

async function renderCarrossel(canvas, config) {
  const { formato, eco, texto, subtitulo, slideNum, totalSlides } = config;
  const { width, height } = FORMATOS[formato];
  const cores = CORES[eco];
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const isStories = formato === 'stories';
  const isFirst = slideNum === 1;
  const isLast = slideNum === totalSlides;

  // Background: cover/CTA = bold gradient, content = light
  const isDark = isFirst || isLast;
  if (isDark) {
    const grad = ctx.createLinearGradient(0, 0, width * 0.4, height);
    grad.addColorStop(0, cores.secondary);
    grad.addColorStop(0.5, cores.primary);
    grad.addColorStop(1, cores.secondary);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = cores.bg;
    ctx.fillRect(0, 0, width, height);
    // Left accent stripe
    ctx.fillStyle = cores.primary;
    ctx.fillRect(0, 0, 8, height);
  }

  const textColor = isDark ? '#FFFFFF' : cores.textDark;
  const subColor = isDark ? 'rgba(255,255,255,0.7)' : (cores.textDark + 'AA');

  // Decorative circles
  ctx.globalAlpha = isDark ? 0.06 : 0.03;
  ctx.fillStyle = isDark ? '#FFFFFF' : cores.primary;
  ctx.beginPath();
  ctx.arc(width * 0.82, height * 0.18, isStories ? 260 : 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width * 0.18, height * 0.82, isStories ? 200 : 160, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Top: Logo centered
  const logoY = isStories ? 70 : 50;
  const logo = await loadImage(cores.logo);
  if (logo) {
    const logoSize = 44;
    ctx.drawImage(logo, (width - logoSize) / 2, logoY, logoSize, logoSize);
  }

  // Slide dots centered below logo
  if (slideNum && totalSlides) {
    const dotY = logoY + 62;
    const dotSpacing = 18;
    const totalDotsW = (totalSlides - 1) * dotSpacing;
    const dotStartX = (width - totalDotsW) / 2;
    for (let i = 1; i <= totalSlides; i++) {
      ctx.beginPath();
      ctx.arc(dotStartX + (i - 1) * dotSpacing, dotY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = i === slideNum
        ? (isDark ? '#FFFFFF' : cores.primary)
        : (isDark ? 'rgba(255,255,255,0.25)' : (cores.primary + '25'));
      ctx.fill();
    }
  }

  // ALL TEXT CENTERED
  ctx.textAlign = 'center';
  const padding = 90;
  const maxW = width - padding * 2;

  // Calculate title
  const titleSize = texto.length > 100 ? 36 : texto.length > 70 ? 42 : texto.length > 40 ? 50 : 58;
  ctx.font = `700 ${titleSize}px 'Playfair Display', Georgia, serif`;
  const titleLines = wrapText(ctx, texto, maxW);
  const titleH = titleLines.length * (titleSize * 1.35);

  // Calculate subtitle
  const subSize = 28;
  let subLines = [];
  let subH = 0;
  if (subtitulo) {
    ctx.font = `400 ${subSize}px 'Inter', sans-serif`;
    subLines = wrapText(ctx, subtitulo, maxW);
    subH = subLines.length * (subSize * 1.5) + 35;
  }

  // Vertical centering
  const totalTextH = titleH + subH;
  const textStartY = (height - totalTextH) / 2 + titleSize * 0.3;

  // Draw title
  ctx.font = `700 ${titleSize}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = textColor;
  drawCenteredText(ctx, titleLines, width / 2, textStartY, titleSize * 1.35);

  // Accent line
  const accentY = textStartY + titleH + 12;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.3)' : cores.primary;
  ctx.fillRect(width / 2 - 28, accentY, 56, 3);

  // Subtitle
  if (subtitulo && subLines.length > 0) {
    const subStartY = accentY + 28;
    ctx.font = `400 ${subSize}px 'Inter', sans-serif`;
    ctx.fillStyle = subColor;
    drawCenteredText(ctx, subLines, width / 2, subStartY, subSize * 1.5);
  }

  // Bottom: CTA button on last slide, swipe prompt on others
  if (isLast) {
    const btnY = height - (isStories ? 280 : 200);
    const btnW = 360;
    const btnH = 64;
    const btnX = (width - btnW) / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    roundRect(ctx, btnX + 3, btnY + 3, btnW, btnH, 32);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, btnX, btnY, btnW, btnH, 32);
    ctx.fill();
    ctx.font = `700 24px 'Inter', sans-serif`;
    ctx.fillStyle = cores.primary;
    ctx.fillText('Começa Agora', width / 2, btnY + 40);
  } else if (!isFirst) {
    ctx.font = `500 18px 'Inter', sans-serif`;
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.4)' : (cores.primary + '50');
    ctx.fillText('Desliza ▸', width / 2, height - (isStories ? 160 : 80));
  } else {
    // Cover slide - "Desliza para descobrir"
    ctx.font = `500 20px 'Inter', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('Desliza para descobrir ▸', width / 2, height - (isStories ? 200 : 110));
  }

  // Footer
  ctx.font = `400 16px 'Inter', sans-serif`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.25)' : (cores.primary + '35');
  ctx.fillText('app.seteecos.com', width / 2, height - (isStories ? 120 : 45));
}

async function renderTestemunho(canvas, config) {
  const { formato, eco, texto, subtitulo } = config;
  const { width, height } = FORMATOS[formato];
  const cores = CORES[eco];
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const isStories = formato === 'stories';

  // Dark elegant background
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, cores.bgDark);
  grad.addColorStop(1, '#000000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle radial glow
  const radGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.6);
  radGrad.addColorStop(0, cores.primary + '15');
  radGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, width, height);

  // Giant opening quote
  ctx.font = `bold 200px Georgia, serif`;
  ctx.fillStyle = cores.primary + '25';
  ctx.textAlign = 'left';
  ctx.fillText('"', 60, isStories ? 350 : 250);

  // Quote text
  const padding = 100;
  const maxW = width - padding * 2;
  const fontSize = texto.length > 100 ? 38 : texto.length > 60 ? 44 : 52;
  ctx.font = `italic 500 ${fontSize}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  const lines = wrapText(ctx, texto, maxW);
  const totalH = lines.length * (fontSize * 1.4);
  const startY = (height - totalH) / 2 + (isStories ? 50 : 0);
  drawCenteredText(ctx, lines, width / 2, startY, fontSize * 1.4);

  // Author / source
  const authorY = startY + totalH + 40;
  ctx.fillStyle = cores.accent;
  ctx.fillRect(width / 2 - 30, authorY, 60, 3);

  if (subtitulo) {
    ctx.font = `600 26px 'Inter', sans-serif`;
    ctx.fillStyle = cores.accent;
    ctx.fillText(subtitulo, width / 2, authorY + 40);
  }

  // Logo + footer
  const logo = await loadImage(cores.logo);
  const footerY = height - (isStories ? 180 : 120);
  if (logo) {
    const logoSize = 40;
    ctx.drawImage(logo, (width - logoSize) / 2, footerY, logoSize, logoSize);
  }
  ctx.font = `500 20px 'Inter', sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText(cores.nome, width / 2, footerY + 65);
  ctx.font = `400 16px 'Inter', sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('app.seteecos.com', width / 2, footerY + 90);
}

async function renderCTA(canvas, config) {
  const { formato, eco, texto, subtitulo } = config;
  const { width, height } = FORMATOS[formato];
  const cores = CORES[eco];
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const isStories = formato === 'stories';

  // Bold gradient background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, cores.primary);
  grad.addColorStop(0.4, cores.secondary);
  grad.addColorStop(1, cores.primary);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Geometric decoration
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(
      Math.random() * width,
      Math.random() * height,
      100 + Math.random() * 200,
      0, Math.PI * 2
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Logo
  const logo = await loadImage(cores.logo);
  const logoY = isStories ? 200 : 120;
  if (logo) {
    const logoSize = isStories ? 90 : 72;
    ctx.drawImage(logo, (width - logoSize) / 2, logoY, logoSize, logoSize);
  }

  // Main headline
  const padding = 90;
  const maxW = width - padding * 2;
  const headY = isStories ? 450 : 320;
  const headSize = texto.length > 50 ? 48 : 58;
  ctx.font = `800 ${headSize}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  const headLines = wrapText(ctx, texto, maxW);
  let y = headY;
  headLines.forEach(line => {
    ctx.fillText(line, width / 2, y);
    y += headSize * 1.25;
  });

  // Sub-headline
  if (subtitulo) {
    y += 15;
    ctx.font = `400 28px 'Inter', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    const subLines = wrapText(ctx, subtitulo, maxW);
    subLines.forEach(line => {
      ctx.fillText(line, width / 2, y);
      y += 38;
    });
  }

  // CTA Button
  const btnY = isStories ? height - 500 : height - 300;
  const btnW = 400;
  const btnH = 70;
  const btnX = (width - btnW) / 2;

  // Button shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  roundRect(ctx, btnX + 4, btnY + 4, btnW, btnH, 35);
  ctx.fill();

  // Button fill
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, btnX, btnY, btnW, btnH, 35);
  ctx.fill();

  // Button text
  ctx.font = `700 26px 'Inter', sans-serif`;
  ctx.fillStyle = cores.primary;
  ctx.fillText('Experimenta Agora', width / 2, btnY + 45);

  // Footer
  ctx.font = `500 22px 'Inter', sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('app.seteecos.com', width / 2, height - (isStories ? 150 : 80));
  ctx.font = `400 18px 'Inter', sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText(`${cores.nome} • ${cores.subtitulo}`, width / 2, height - (isStories ? 115 : 50));
}

async function renderStats(canvas, config) {
  const { formato, eco, texto, subtitulo } = config;
  const { width, height } = FORMATOS[formato];
  const cores = CORES[eco];
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const isStories = formato === 'stories';

  // Clean light background
  ctx.fillStyle = cores.bg;
  ctx.fillRect(0, 0, width, height);

  // Side accent bar
  ctx.fillStyle = cores.primary;
  ctx.fillRect(0, 0, 12, height);

  // Logo top-right
  const logo = await loadImage(cores.logo);
  if (logo) {
    const logoSize = 50;
    ctx.drawImage(logo, width - 60 - logoSize, 50, logoSize, logoSize);
  }

  // The big stat number (first line of texto)
  const centerY = height / 2 - (isStories ? 100 : 50);
  ctx.font = `900 ${isStories ? 160 : 130}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = cores.primary;
  ctx.textAlign = 'center';
  ctx.fillText(texto.split('\n')[0] || texto, width / 2, centerY);

  // Context text (subtitulo)
  if (subtitulo) {
    const padding = 100;
    const maxW = width - padding * 2;
    ctx.font = `500 32px 'Inter', sans-serif`;
    ctx.fillStyle = cores.textDark + 'CC';
    const lines = wrapText(ctx, subtitulo, maxW);
    let y = centerY + 50;
    lines.forEach(line => {
      ctx.fillText(line, width / 2, y);
      y += 42;
    });
  }

  // Accent bar below stat
  ctx.fillStyle = cores.accent;
  ctx.fillRect(width / 2 - 40, centerY + 15, 80, 4);

  // Footer
  ctx.font = `500 20px 'Inter', sans-serif`;
  ctx.fillStyle = cores.primary;
  ctx.fillText(cores.nome, width / 2, height - (isStories ? 130 : 70));
  ctx.font = `400 16px 'Inter', sans-serif`;
  ctx.fillStyle = cores.textDark + '60';
  ctx.fillText('app.seteecos.com', width / 2, height - (isStories ? 100 : 42));
}

// ============================================================
// STATUS WHATSAPP - Template com foto de fundo real
// ============================================================

const STATUS_BACKGROUNDS = [
  '/mockups/Vitalis-dashboard_mb-mockup.jpeg',
  '/mockups/Vitalis-receitas_mb-mockup.jpeg',
  '/mockups/Vitalis-coach_mb-mockup.jpeg',
  '/catalogo/Vitalis_plano.jpeg',
  '/mockups/mozproud-vitalis.jpeg',
  '/mockups/Vitalis-treinos_mb-mockup.jpeg',
  '/catalogo/Vitalis_receitas.jpeg',
  '/catalogo/Lumina_leitura.jpeg',
  '/mockups/Vitalis-espa%C3%A7oretorno_mb-mockup.jpeg',
  '/catalogo/comunidade.jpeg',
];

async function renderStatusWA(canvas, config) {
  const { formato, eco, texto, subtitulo, bgIndex } = config;
  const { width, height } = FORMATOS[formato || 'stories'];
  const cores = CORES[eco] || CORES.vitalis;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1) Photo background
  const bgSrc = STATUS_BACKGROUNDS[(bgIndex || 0) % STATUS_BACKGROUNDS.length];
  const bgImg = await loadImage(bgSrc);
  if (bgImg) {
    // Cover-fill the canvas
    const imgRatio = bgImg.width / bgImg.height;
    const canvasRatio = width / height;
    let sx = 0, sy = 0, sw = bgImg.width, sh = bgImg.height;
    if (imgRatio > canvasRatio) {
      sw = bgImg.height * canvasRatio;
      sx = (bgImg.width - sw) / 2;
    } else {
      sh = bgImg.width / canvasRatio;
      sy = (bgImg.height - sh) / 2;
    }
    ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, width, height);
  } else {
    // Fallback: bold gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, cores.secondary);
    grad.addColorStop(1, cores.primary);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2) Overlay escuro uniforme
  const overlay = ctx.createLinearGradient(0, 0, 0, height);
  overlay.addColorStop(0, 'rgba(0,0,0,0.7)');
  overlay.addColorStop(0.35, 'rgba(0,0,0,0.45)');
  overlay.addColorStop(0.65, 'rgba(0,0,0,0.45)');
  overlay.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);

  // 3) Tinta da marca
  ctx.fillStyle = cores.primary + '20';
  ctx.fillRect(0, 0, width, height);

  // Layout zones — texto centrado na zona útil
  const topZone = 280;
  const bottomZone = 200;
  const textZoneTop = topZone;
  const textZoneBottom = height - bottomZone;
  const textZoneH = textZoneBottom - textZoneTop;

  // 4) Logo + marca no topo
  const logo = await loadImage(cores.logo);
  if (logo) {
    const logoSize = 72;
    ctx.drawImage(logo, (width - logoSize) / 2, 80, logoSize, logoSize);
  }
  ctx.textAlign = 'center';
  ctx.font = `600 26px 'Inter', sans-serif`;
  ctx.fillStyle = cores.accent || '#FFFFFF';
  ctx.fillText(cores.nome, width / 2, 185);
  ctx.fillStyle = cores.accent || '#FFFFFF';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(width / 2 - 30, 205, 60, 2);
  ctx.globalAlpha = 1;

  // 5) Calcular todo o texto para centrar na zona útil
  const padding = 90;
  const maxW = width - padding * 2;
  const fontSize = texto.length > 100 ? 46 : texto.length > 60 ? 54 : texto.length > 35 ? 62 : 70;
  ctx.font = `800 ${fontSize}px 'Playfair Display', Georgia, serif`;
  const mainLines = wrapText(ctx, texto, maxW);
  const mainH = mainLines.length * (fontSize * 1.3);

  let subLines = [];
  const subSize = Math.round(fontSize * 0.45);
  let subH = 0;
  if (subtitulo) {
    ctx.font = `500 ${subSize}px 'Inter', sans-serif`;
    subLines = wrapText(ctx, subtitulo, maxW);
    subH = subLines.length * (subSize * 1.5) + 35;
  }

  const totalTextH = mainH + subH;
  const textStartY = textZoneTop + (textZoneH - totalTextH) / 2 + fontSize * 0.3;

  // 6) Texto principal com sombra
  ctx.font = `800 ${fontSize}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  drawCenteredText(ctx, mainLines, width / 2, textStartY, fontSize * 1.3);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 7) Subtítulo
  if (subtitulo && subLines.length > 0) {
    const subY = textStartY + mainH + 35;
    ctx.font = `500 ${subSize}px 'Inter', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;
    drawCenteredText(ctx, subLines, width / 2, subY, subSize * 1.5);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  // 8) Barra CTA no fundo
  const stripH = 180;
  const stripY = height - stripH;
  const stripGrad = ctx.createLinearGradient(0, stripY, 0, height);
  stripGrad.addColorStop(0, 'rgba(0,0,0,0)');
  stripGrad.addColorStop(0.35, cores.primary + 'BB');
  stripGrad.addColorStop(1, cores.secondary + 'EE');
  ctx.fillStyle = stripGrad;
  ctx.fillRect(0, stripY, width, stripH);

  ctx.font = `700 26px 'Inter', sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('app.seteecos.com', width / 2, height - 85);
  ctx.font = `500 20px 'Inter', sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText(cores.subtitulo || '@seteecos', width / 2, height - 50);
}

// ============================================================
// STATUS MINIMALISTA - Design limpo e elegante sem foto
// ============================================================

async function renderStatusMinimal(canvas, config) {
  const { formato, eco, texto, subtitulo } = config;
  const { width, height } = FORMATOS[formato || 'stories'];
  const cores = CORES[eco] || CORES.vitalis;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1) Fundo gradiente rico (diagonal)
  const grad = ctx.createLinearGradient(0, 0, width * 0.6, height);
  grad.addColorStop(0, cores.bgDark);
  grad.addColorStop(0.4, cores.secondary);
  grad.addColorStop(0.7, cores.primary);
  grad.addColorStop(1, cores.secondary);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2) Padrão decorativo — linhas diagonais finas
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  for (let i = -height; i < width + height; i += 60) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // 3) Glow central suave
  const radGrad = ctx.createRadialGradient(width / 2, height * 0.45, 0, width / 2, height * 0.45, width * 0.7);
  radGrad.addColorStop(0, cores.accent + '18');
  radGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, width, height);

  // Layout zones
  const topZone = 280;
  const bottomZone = 200;
  const textZoneTop = topZone;
  const textZoneBottom = height - bottomZone;
  const textZoneH = textZoneBottom - textZoneTop;

  // 4) Logo + marca
  const logo = await loadImage(cores.logo);
  if (logo) {
    const logoSize = 72;
    ctx.drawImage(logo, (width - logoSize) / 2, 80, logoSize, logoSize);
  }
  ctx.textAlign = 'center';
  ctx.font = `600 26px 'Inter', sans-serif`;
  ctx.fillStyle = cores.accent || '#FFFFFF';
  ctx.fillText(cores.nome, width / 2, 185);

  // Linhas decorativas duplas
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(width * 0.15, 210, width * 0.7, 1);
  ctx.fillStyle = cores.accent || '#FFFFFF';
  ctx.globalAlpha = 0.6;
  ctx.fillRect(width / 2 - 25, 205, 50, 2);
  ctx.globalAlpha = 1;

  // 5) Calcular texto para centrar na zona útil
  const padding = 90;
  const maxW = width - padding * 2;
  const fontSize = texto.length > 100 ? 46 : texto.length > 60 ? 54 : texto.length > 35 ? 62 : 70;
  ctx.font = `700 ${fontSize}px 'Playfair Display', Georgia, serif`;
  const mainLines = wrapText(ctx, texto, maxW);
  const mainH = mainLines.length * (fontSize * 1.35);

  let subLines = [];
  const subSize = Math.round(fontSize * 0.45);
  let subH = 0;
  if (subtitulo) {
    ctx.font = `400 ${subSize}px 'Inter', sans-serif`;
    subLines = wrapText(ctx, subtitulo, maxW);
    subH = subLines.length * (subSize * 1.5) + 35;
  }

  const totalTextH = mainH + subH;
  const textStartY = textZoneTop + (textZoneH - totalTextH) / 2 + fontSize * 0.3;

  // 6) Texto principal
  ctx.font = `700 ${fontSize}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = '#FFFFFF';
  drawCenteredText(ctx, mainLines, width / 2, textStartY, fontSize * 1.35);

  // Linha de acento sob o texto
  const accentY = textStartY + mainH + 10;
  ctx.fillStyle = cores.accent || '#FFFFFF';
  ctx.globalAlpha = 0.4;
  ctx.fillRect(width / 2 - 30, accentY, 60, 2);
  ctx.globalAlpha = 1;

  // 7) Subtítulo
  if (subtitulo && subLines.length > 0) {
    const subY = accentY + 25;
    ctx.font = `400 ${subSize}px 'Inter', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    drawCenteredText(ctx, subLines, width / 2, subY, subSize * 1.5);
  }

  // 8) Rodapé elegante
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(width * 0.15, height - 170, width * 0.7, 1);

  ctx.font = `600 24px 'Inter', sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('app.seteecos.com', width / 2, height - 110);
  ctx.font = `400 18px 'Inter', sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText(`${cores.nome} • ${cores.subtitulo}`, width / 2, height - 78);
}

function roundRect(ctx, x, y, w, h, r) {
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

export const RENDER_MAP = {
  dica: renderDica,
  carrossel: renderCarrossel,
  testemunho: renderTestemunho,
  cta: renderCTA,
  stats: renderStats,
  statusWA: renderStatusWA,
  statusMinimal: renderStatusMinimal,
};

export { CORES, FORMATOS, TEMPLATES };

// ============================================================
// REACT COMPONENT
// ============================================================

export default function TemplateVisual({ texto, subtitulo, onClose }) {
  const canvasRef = useRef(null);
  const [eco, setEco] = useState('vitalis');
  const [formato, setFormato] = useState('post');
  const [template, setTemplate] = useState('dica');
  const [gerado, setGerado] = useState(false);
  const [gerando, setGerando] = useState(false);

  const gerar = async () => {
    if (!canvasRef.current || !texto) return;
    setGerando(true);
    try {
      const renderFn = RENDER_MAP[template];
      await renderFn(canvasRef.current, { formato, eco, texto, subtitulo });
      setGerado(true);
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
    }
    setGerando(false);
  };

  // Auto-generate on mount and on config change
  useEffect(() => {
    if (texto && texto.length > 3) {
      const timer = setTimeout(gerar, 200);
      return () => clearTimeout(timer);
    }
  }, [eco, formato, template, texto, subtitulo]);

  const descarregar = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `sete-ecos-${eco}-${template}-${formato}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const { width: canvasW, height: canvasH } = FORMATOS[formato];
  const previewScale = formato === 'stories' ? 0.25 : 0.38;

  return (
    <div className="bg-white rounded-2xl border-2 border-[#E8E2D9] overflow-hidden">
      {onClose && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8E2D9] bg-[#F5F2ED]">
          <h3 className="font-semibold text-[#4A4035]">Criar Imagem</h3>
          <button onClick={onClose} className="text-[#6B5C4C] hover:text-[#4A4035] text-lg">x</button>
        </div>
      )}
      <div className="p-5 space-y-4">

        {/* Template selector */}
        <div>
          <label className="text-xs font-semibold text-[#6B5C4C] uppercase tracking-wider block mb-2">Tipo de Imagem</label>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(TEMPLATES).map(([id, t]) => (
              <button
                key={id}
                onClick={() => { setTemplate(id); setGerado(false); }}
                className={`p-2 rounded-xl text-center transition-all border-2 ${
                  template === id
                    ? 'border-[#7C8B6F] bg-[#7C8B6F]/10'
                    : 'border-[#E8E2D9] bg-white hover:border-[#7C8B6F]/50'
                }`}
              >
                <span className="text-lg block">{t.icon}</span>
                <span className="text-xs font-medium text-[#4A4035] block mt-0.5">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Brand + Format selectors side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#6B5C4C] uppercase tracking-wider block mb-2">Marca</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(CORES).map(([id, c]) => (
                <button
                  key={id}
                  onClick={() => { setEco(id); setGerado(false); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    eco === id ? 'text-white shadow-md' : 'bg-[#E8E2D9] text-[#4A4035]'
                  }`}
                  style={eco === id ? { background: c.primary } : {}}
                >
                  {c.nome}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6B5C4C] uppercase tracking-wider block mb-2">Formato</label>
            <div className="flex gap-1.5">
              {Object.entries(FORMATOS).map(([id, f]) => (
                <button
                  key={id}
                  onClick={() => { setFormato(id); setGerado(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    formato === id ? 'bg-[#4A4035] text-white' : 'bg-[#E8E2D9] text-[#4A4035]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview + Download */}
        <div className="flex flex-col items-center bg-[#F5F2ED] rounded-xl p-4">
          <canvas
            ref={canvasRef}
            style={{
              width: canvasW * previewScale,
              height: canvasH * previewScale,
              borderRadius: '12px',
              border: '2px solid #E8E2D9',
              display: gerado ? 'block' : 'none',
            }}
          />
          {!gerado && !gerando && (
            <div className="py-12 text-center">
              <span className="text-3xl block mb-2">🎨</span>
              <p className="text-sm text-[#6B5C4C]">A gerar pré-visualização...</p>
            </div>
          )}
          {gerando && (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-3 border-[#7C8B6F]/30 border-t-[#7C8B6F] rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-[#6B5C4C]">A gerar...</p>
            </div>
          )}
          {gerado && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={descarregar}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#7C8B6F] text-white rounded-full text-sm font-semibold hover:bg-[#6B7A5D] transition-all shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descarregar PNG
              </button>
              <button
                onClick={gerar}
                className="px-4 py-2.5 bg-white text-[#4A4035] rounded-full text-sm font-medium border border-[#E8E2D9] hover:border-[#7C8B6F] transition-all"
              >
                Regenerar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
