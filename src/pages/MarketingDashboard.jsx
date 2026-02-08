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
// MAIN DASHBOARD
// ============================================================

export default function MarketingDashboard() {
  const { session } = useAuth();
  const [tab, setTab] = useState('plano');
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
    { id: 'plano', label: 'Plano Semanal', icon: '🗓' },
    { id: 'grid', label: 'Grid IG (12)', icon: '📸' },
    { id: 'anuncios', label: 'Anuncios', icon: '📣' },
    { id: 'carrosseis', label: 'Carrosseis', icon: '📑' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F2ED] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Link to="/coach" className="text-white/60 hover:text-white text-sm">&larr; Coach</Link>
            <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full border border-white/20">LANCAMENTO</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Plano de Lancamento
          </h1>
          <p className="text-white/50 text-sm mt-1">8-21 Fevereiro 2026 &middot; Semana 1: Aquecer &middot; Semana 2: Lancar</p>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { v: '12', l: 'Posts Grid' },
              { v: '4', l: 'Anuncios' },
              { v: String(getCarrosseisProntos().length), l: 'Carrosseis' },
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
        {tab === 'plano' && <PlanoTab copiar={copiar} copiado={copiado} />}
        {tab === 'grid' && <GridTab copiar={copiar} copiado={copiado} />}
        {tab === 'anuncios' && <AnunciosTab copiar={copiar} copiado={copiado} />}
        {tab === 'carrosseis' && <CarrosseisTab copiar={copiar} copiado={copiado} />}
      </div>
    </div>
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
          Semana 2: LANCAR<br /><span className="text-[10px] font-normal opacity-60">15-21 Fev &middot; Vitalis LIVE</span>
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
                  <p className="text-sm text-[#6B5C4C]">📑 Este e um carrossel. Vai ao tab <strong>Carrosseis</strong> para descarregar os slides de <strong>{post.titulo}</strong>.</p>
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
      <Card titulo="Como Configurar Ads" badge="Guia rapido">
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
      <Card titulo="Carrosseis Prontos" badge={`${carrosseis.length} sets`}>
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
