import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isSessionCoach } from '../lib/coach';
import { supabase } from '../lib/supabase';
import {
  gerarConteudoHoje,
  gerarConteudoSemana,
  gerarMensagemWhatsApp,
  gerarStatusWhatsApp,
  gerarCaptionInstagram,
  gerarScriptVoz,
  getCampanhaLancamento,
  getCarrosseisProntos,
  gerarConteudoMensal,
  gerarLinksUTM,
  getSequenciaCompleta,
} from '../lib/marketing-engine';
import { RENDER_MAP, CORES, FORMATOS } from '../components/TemplateVisual';

// ============================================================
// AUTO IMAGE - Gera imagem automaticamente e mostra preview
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
    const link = document.createElement('a');
    link.download = filename || `sete-ecos-${eco}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const dim = FORMATOS[formato || 'post'];
  const s = scale || (formato === 'stories' ? 0.18 : 0.28);
  const w = dim.width * s;
  const h = dim.height * s;

  if (!dataUrl) {
    return (
      <div style={{ width: w, height: h }} className={`bg-gray-200 rounded-xl animate-pulse flex items-center justify-center ${className || ''}`}>
        <span className="text-gray-400 text-xs">A gerar...</span>
      </div>
    );
  }

  return (
    <div className={`relative group shrink-0 ${className || ''}`}>
      <img src={dataUrl} style={{ width: w, height: h }} className="rounded-xl shadow-md object-cover" alt="" />
      <button
        onClick={download}
        className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-[#4A4035] shadow opacity-0 group-hover:opacity-100 transition-opacity"
      >
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
  const [tab, setTab] = useState('hoje');
  const [copiado, setCopied] = useState('');
  const [waitlistStats, setWaitlistStats] = useState({ total: 0, semana: 0 });
  const [clientStats, setClientStats] = useState({ total: 0, activos: 0 });

  const conteudoHoje = gerarConteudoHoje();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [waitlist, clients] = await Promise.all([
        supabase.from('waitlist').select('id, created_at'),
        supabase.from('vitalis_clients').select('id, subscription_status'),
      ]);
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      setWaitlistStats({ total: waitlist.data?.length || 0, semana: waitlist.data?.filter(w => new Date(w.created_at) > weekAgo).length || 0 });
      setClientStats({ total: clients.data?.length || 0, activos: clients.data?.filter(c => ['active', 'trial', 'tester'].includes(c.subscription_status)).length || 0 });
    } catch (err) {
      console.error('Erro:', err);
    }
  };

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
    { id: 'hoje', label: 'Publicar Hoje', icon: '🎯' },
    { id: 'carrosseis', label: 'Carrosseis', icon: '📑' },
    { id: 'calendario', label: 'Calendario', icon: '📅' },
    { id: 'lancamento', label: 'Lancamento 7d', icon: '🚀' },
    { id: 'biblioteca', label: 'Biblioteca', icon: '📚' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F2ED] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Link to="/coach" className="text-white/60 hover:text-white text-sm">&larr; Coach</Link>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full border border-white/20">Marketing HQ</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Publicar Hoje
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {conteudoHoje.diaSemana}, {conteudoHoje.data} &middot; Tema: <span className="text-white/80 font-medium">{conteudoHoje.tema}</span> &middot; Formato: <span className="text-white/80 font-medium">{conteudoHoje.formato}</span>
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: 'Waitlist', valor: waitlistStats.total, sub: `+${waitlistStats.semana} sem` },
              { label: 'Clientes', valor: clientStats.total, sub: `${clientStats.activos} act.` },
              { label: 'Carrosseis', valor: getCarrosseisProntos().length, sub: 'prontos' },
              { label: 'Posts/Sem', valor: 7, sub: 'planeados' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
                <p className="text-2xl font-bold">{s.valor}</p>
                <p className="text-[10px] text-white/40">{s.label} &middot; {s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 -mt-3">
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-[#1a1a2e] text-white shadow-lg'
                  : 'bg-white text-[#6B5C4C] hover:bg-gray-100 border border-[#E8E2D9]'
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4 space-y-4">
        {tab === 'hoje' && <PublicarHojeTab conteudoHoje={conteudoHoje} copiar={copiar} copiado={copiado} />}
        {tab === 'carrosseis' && <CarrosseisTab copiar={copiar} copiado={copiado} />}
        {tab === 'calendario' && <CalendarioTab />}
        {tab === 'lancamento' && <LancamentoTab copiar={copiar} copiado={copiado} />}
        {tab === 'biblioteca' && <BibliotecaTab copiar={copiar} copiado={copiado} conteudoHoje={conteudoHoje} />}
      </div>
    </div>
  );
}

// ============================================================
// TAB: PUBLICAR HOJE - Conteudo pronto para cada plataforma
// ============================================================

function PublicarHojeTab({ conteudoHoje, copiar, copiado }) {
  const instaPost = gerarCaptionInstagram('post');
  const instaStories = gerarCaptionInstagram('stories');
  const reelScript = gerarCaptionInstagram('reelScript');
  const waStatus = gerarStatusWhatsApp();
  const waBroadcast = gerarMensagemWhatsApp('dica');
  const scripts = gerarScriptVoz();

  return (
    <>
      {/* Instagram Post */}
      <PlatformCard
        plataforma="Instagram Post"
        icon="📸"
        cor="from-purple-500 to-pink-500"
        corBg="purple"
      >
        <div className="flex gap-4">
          <AutoImage
            template="dica"
            eco="vitalis"
            formato="post"
            texto={conteudoHoje.hook}
            subtitulo="VITALIS - Coaching Nutricional"
            scale={0.28}
            filename={`instagram-post-${conteudoHoje.data}.png`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-purple-600 mb-1">CAPTION</p>
            <p className="text-xs text-[#4A4035] leading-relaxed line-clamp-6 mb-2">{instaPost.caption.slice(0, 200)}...</p>
            <div className="flex flex-wrap gap-1.5">
              <CopyBtn onClick={() => copiar(instaPost.caption, 'ig-post')} copiado={copiado === 'ig-post'} label="Copiar Caption" small />
              <CopyBtn onClick={() => copiar(instaPost.hashtags, 'ig-hash')} copiado={copiado === 'ig-hash'} label="Hashtags" small />
            </div>
          </div>
        </div>
      </PlatformCard>

      {/* Instagram Stories */}
      <PlatformCard
        plataforma="Instagram Stories"
        icon="📱"
        cor="from-pink-500 to-orange-400"
        corBg="pink"
      >
        <div className="flex gap-4">
          <AutoImage
            template="dica"
            eco="vitalis"
            formato="stories"
            texto={conteudoHoje.hook}
            subtitulo="@seteecos"
            scale={0.14}
            filename={`instagram-stories-${conteudoHoje.data}.png`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-pink-600 mb-1">SEQUENCIA DE 5 STORIES</p>
            <pre className="text-[11px] text-[#4A4035] whitespace-pre-wrap leading-relaxed line-clamp-8 mb-2">{instaStories.caption.slice(0, 300)}...</pre>
            <CopyBtn onClick={() => copiar(instaStories.caption, 'ig-stories')} copiado={copiado === 'ig-stories'} label="Copiar Stories" small />
          </div>
        </div>
      </PlatformCard>

      {/* Instagram Reel */}
      <PlatformCard
        plataforma="Instagram Reel"
        icon="🎬"
        cor="from-violet-500 to-purple-600"
        corBg="violet"
      >
        <div className="flex gap-4">
          <AutoImage
            template="cta"
            eco="vitalis"
            formato="post"
            texto={conteudoHoje.hook.split('.')[0]}
            subtitulo="Assiste ate ao fim"
            scale={0.22}
            filename={`reel-cover-${conteudoHoje.data}.png`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-violet-600 mb-1">SCRIPT PARA REEL (30 seg)</p>
            <pre className="text-[11px] text-[#4A4035] whitespace-pre-wrap leading-relaxed line-clamp-8 mb-2">{scripts.reel30s.slice(0, 250)}...</pre>
            <div className="flex gap-1.5">
              <CopyBtn onClick={() => copiar(scripts.reel30s, 'reel')} copiado={copiado === 'reel'} label="Script Reel" small />
              <CopyBtn onClick={() => copiar(reelScript.caption, 'reel-full')} copiado={copiado === 'reel-full'} label="Caption Reel" small />
            </div>
          </div>
        </div>
      </PlatformCard>

      {/* WhatsApp Status */}
      <PlatformCard
        plataforma="WhatsApp Status"
        icon="📊"
        cor="from-green-500 to-emerald-600"
        corBg="green"
      >
        <div className="flex gap-4">
          <AutoImage
            template="dica"
            eco="seteEcos"
            formato="stories"
            texto={conteudoHoje.hook}
            subtitulo="seteecos.com"
            scale={0.14}
            filename={`whatsapp-status-${conteudoHoje.data}.png`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-green-600 mb-1">TEXTO PARA STATUS</p>
            <pre className="text-xs text-[#4A4035] whitespace-pre-wrap leading-relaxed mb-2">{waStatus.mensagem}</pre>
            <CopyBtn onClick={() => copiar(waStatus.mensagem, 'wa-status')} copiado={copiado === 'wa-status'} label="Copiar" small />
          </div>
        </div>
      </PlatformCard>

      {/* WhatsApp Broadcast */}
      <PlatformCard
        plataforma="WhatsApp Mensagem"
        icon="💬"
        cor="from-emerald-500 to-green-600"
        corBg="emerald"
      >
        <pre className="text-xs text-[#4A4035] whitespace-pre-wrap leading-relaxed bg-green-50 p-4 rounded-xl mb-3 max-h-48 overflow-y-auto">{waBroadcast.mensagem}</pre>
        <div className="flex gap-2">
          <CopyBtn onClick={() => copiar(waBroadcast.mensagem, 'wa-msg')} copiado={copiado === 'wa-msg'} label="Copiar" small />
          <a
            href={`https://wa.me/?text=${encodeURIComponent(waBroadcast.mensagem)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-xs font-bold hover:bg-[#20BD5A] transition-colors"
          >
            Enviar WhatsApp
          </a>
        </div>
      </PlatformCard>

      {/* Checklist do Dia */}
      <Card titulo="Checklist do Dia" badge={conteudoHoje.diaSemana}>
        <DailyChecklist dia={conteudoHoje} />
      </Card>
    </>
  );
}

// ============================================================
// TAB: CARROSSEIS - Sets de slides prontos para descarregar
// ============================================================

function CarrosseisTab({ copiar, copiado }) {
  const carrosseis = getCarrosseisProntos();
  const [selected, setSelected] = useState(0);
  const carrossel = carrosseis[selected];

  return (
    <>
      {/* Selector */}
      <Card titulo="Carrosseis Prontos" badge={`${carrosseis.length} sets`}>
        <p className="text-sm text-[#6B5C4C] mb-3">
          Cada carrossel tem 5-6 slides prontos. Seleciona, descarrega tudo, publica.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {carrosseis.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelected(i)}
              className={`p-3 rounded-xl text-left transition-all border-2 ${
                selected === i
                  ? 'border-[#1a1a2e] bg-[#1a1a2e]/5'
                  : 'border-[#E8E2D9] bg-white hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full" style={{ background: c.cor }}></span>
                <span className="text-xs font-bold text-[#4A4035]">{c.titulo}</span>
              </div>
              <p className="text-[10px] text-[#6B5C4C]">{c.slides.length} slides &middot; {CORES[c.marca]?.nome || c.marca}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Carousel Preview */}
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
          formato: 'post',
          eco: carrossel.marca,
          texto: carrossel.slides[i].titulo,
          subtitulo: carrossel.slides[i].texto,
          slideNum: i + 1,
          totalSlides: carrossel.slides.length,
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
        const link = document.createElement('a');
        link.download = `${carrossel.id}-slide-${i + 1}.png`;
        link.href = url;
        link.click();
      }, i * 400);
    });
  };

  const downloadSlide = (i) => {
    const link = document.createElement('a');
    link.download = `${carrossel.id}-slide-${i + 1}.png`;
    link.href = dataUrls[i];
    link.click();
  };

  return (
    <Card titulo={carrossel.titulo} badge={`${carrossel.slides.length} slides`}>
      {/* Slides */}
      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-3">
          {carrossel.slides.map((_, i) => (
            <div key={i} className="w-44 h-44 shrink-0 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-3">
          {dataUrls.map((url, i) => (
            <div key={i} className="relative group shrink-0">
              <img src={url} className="w-44 h-44 rounded-xl shadow-md object-cover" alt={`Slide ${i + 1}`} />
              <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {i + 1}/{carrossel.slides.length}
              </span>
              <button
                onClick={() => downloadSlide(i)}
                className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#4A4035] shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ⬇
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#E8E2D9]">
        <button
          onClick={downloadAll}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a2e] text-white rounded-full text-sm font-bold hover:bg-[#2a2a4e] transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Descarregar Todos ({carrossel.slides.length} slides)
        </button>
        <CopyBtn onClick={() => copiar(carrossel.caption, 'carousel-caption')} copiado={copiado === 'carousel-caption'} label="Copiar Caption" />
      </div>

      {/* Caption preview */}
      <div className="mt-3 p-3 bg-gray-50 rounded-xl">
        <p className="text-xs font-bold text-[#6B5C4C] mb-1">CAPTION</p>
        <pre className="text-xs text-[#4A4035] whitespace-pre-wrap leading-relaxed">{carrossel.caption}</pre>
      </div>
    </Card>
  );
}

// ============================================================
// TAB: CALENDARIO - Vista mensal com conteudo planeado
// ============================================================

function CalendarioTab() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth());
  const [ano, setAno] = useState(now.getFullYear());
  const [diaExpandido, setDiaExpandido] = useState(null);

  const conteudoMensal = gerarConteudoMensal(ano, mes);
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const nomeMes = new Date(ano, mes).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
  const hoje = now.getDate();
  const mesAtual = now.getMonth() === mes && now.getFullYear() === ano;

  const temasCores = {
    corpo: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    emocional: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
    provocacao: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  };

  const formatoIcons = { post: '📸', reel: '🎬', carrossel: '📑', stories: '📱' };

  const navMes = (dir) => {
    const d = new Date(ano, mes + dir, 1);
    setMes(d.getMonth());
    setAno(d.getFullYear());
    setDiaExpandido(null);
  };

  return (
    <>
      <Card titulo="Calendario de Conteudo">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navMes(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-lg">&lt;</button>
          <h3 className="text-lg font-bold text-[#4A4035] capitalize">{nomeMes}</h3>
          <button onClick={() => navMes(1)} className="p-2 hover:bg-gray-100 rounded-lg text-lg">&gt;</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-[#6B5C4C] py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before first day */}
          {Array.from({ length: primeiroDia }, (_, i) => (
            <div key={`empty-${i}`} className="h-16" />
          ))}
          {/* Day cells */}
          {conteudoMensal.map((dia) => {
            const tc = temasCores[dia.tema] || temasCores.corpo;
            const isHoje = mesAtual && dia.dia === hoje;
            const isExpanded = diaExpandido === dia.dia;
            return (
              <button
                key={dia.dia}
                onClick={() => setDiaExpandido(isExpanded ? null : dia.dia)}
                className={`h-16 rounded-lg p-1 text-left transition-all border ${
                  isExpanded ? 'border-[#1a1a2e] bg-[#1a1a2e]/5' :
                  isHoje ? 'border-[#1a1a2e] bg-white ring-2 ring-[#1a1a2e]/20' :
                  'border-transparent hover:border-gray-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isHoje ? 'text-[#1a1a2e]' : 'text-[#4A4035]'}`}>{dia.dia}</span>
                  <span className={`w-2 h-2 rounded-full ${tc.dot}`}></span>
                </div>
                <span className="text-[9px] block mt-0.5">{formatoIcons[dia.formato]}</span>
                <span className={`text-[8px] block ${tc.text} truncate`}>{dia.titulo}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 pt-3 border-t border-[#E8E2D9]">
          {Object.entries(temasCores).map(([tema, tc]) => (
            <div key={tema} className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full ${tc.dot}`}></span>
              <span className="text-[10px] text-[#6B5C4C] capitalize">{tema}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Expanded day detail */}
      {diaExpandido && (() => {
        const dia = conteudoMensal.find(d => d.dia === diaExpandido);
        if (!dia) return null;
        const tc = temasCores[dia.tema];
        return (
          <Card titulo={`${dia.dia} ${nomeMes.split(' ')[0]} - ${dia.diaSemana}`} badge={dia.titulo}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tc.bg} ${tc.text}`}>{dia.tema}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{dia.formato}</span>
              </div>
              <div className="bg-gradient-to-r from-[#1a1a2e]/5 to-transparent p-3 rounded-xl border-l-4 border-[#1a1a2e]">
                <p className="text-xs font-bold text-[#1a1a2e] mb-1">HOOK</p>
                <p className="text-sm font-semibold text-[#4A4035]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{dia.hook}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#6B5C4C] mb-1">DESENVOLVIMENTO</p>
                <p className="text-sm text-[#4A4035] leading-relaxed">{dia.corpo}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs font-bold text-[#6B5C4C] mb-1">CTA</p>
                <p className="text-sm font-medium text-[#4A4035]">{dia.cta}</p>
              </div>
              <div className="flex gap-3">
                <AutoImage template="dica" eco="vitalis" formato="post" texto={dia.hook} scale={0.18} filename={`post-${dia.data}.png`} />
                <AutoImage template="dica" eco="vitalis" formato="stories" texto={dia.hook} scale={0.1} filename={`story-${dia.data}.png`} />
              </div>
            </div>
          </Card>
        );
      })()}
    </>
  );
}

// ============================================================
// TAB: LANCAMENTO 7 DIAS
// ============================================================

function LancamentoTab({ copiar, copiado }) {
  return (
    <Card titulo="Campanha de Lancamento - 7 Dias" badge="Executa na ordem">
      <p className="text-sm text-[#6B5C4C] mb-4">
        Campanha sequencial. Cada dia tem WhatsApp + Instagram + Stories. Nao saltes dias.
      </p>
      <div className="space-y-4">
        {getCampanhaLancamento().map((dia, i) => (
          <div key={dia.dia} className="rounded-xl border-2 border-[#E8E2D9] overflow-hidden">
            <div className="bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] px-4 py-2">
              <span className="text-white font-bold text-sm">DIA {dia.dia} &mdash; {dia.titulo}</span>
            </div>
            <div className="p-4 space-y-3">
              <MsgBlock
                label="WHATSAPP" cor="text-[#25D366]" bg="bg-[#25D366]/5"
                texto={dia.whatsapp}
                copiar={copiar} copiado={copiado} id={`lanc-wa-${i}`}
              />
              <MsgBlock
                label="INSTAGRAM" cor="text-purple-600" bg="bg-purple-50"
                texto={dia.instagram}
                copiar={copiar} copiado={copiado} id={`lanc-ig-${i}`}
              />
              <div>
                <p className="text-xs font-bold text-pink-600 mb-1">STORIES</p>
                <p className="text-xs text-[#4A4035] bg-pink-50 p-3 rounded-lg">{dia.stories}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MsgBlock({ label, cor, bg, texto, copiar, copiado, id }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className={`text-xs font-bold ${cor}`}>{label}</p>
        <CopyBtn onClick={() => copiar(texto, id)} copiado={copiado === id} label="Copiar" small />
      </div>
      <pre className={`text-[11px] text-[#4A4035] whitespace-pre-wrap ${bg} p-3 rounded-lg leading-relaxed max-h-40 overflow-y-auto`}>{texto}</pre>
    </div>
  );
}

// ============================================================
// TAB: BIBLIOTECA - Todas as ferramentas de conteudo
// ============================================================

function BibliotecaTab({ copiar, copiado, conteudoHoje }) {
  const [secao, setSecao] = useState('whatsapp');
  const [whatsappTipo, setWhatsappTipo] = useState('dica');
  const [instaTipo, setInstaTipo] = useState('post');
  const linksUTM = gerarLinksUTM();
  const sequenciaEmail = getSequenciaCompleta();

  const secoes = [
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { id: 'instagram', label: 'Instagram', icon: '📸' },
    { id: 'scripts', label: 'Scripts Voz', icon: '🎙' },
    { id: 'links', label: 'Links UTM', icon: '🔗' },
    { id: 'emails', label: 'Emails', icon: '📧' },
  ];

  return (
    <>
      {/* Sub-tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {secoes.map(s => (
          <button
            key={s.id}
            onClick={() => setSecao(s.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              secao === s.id ? 'bg-[#4A4035] text-white' : 'bg-white text-[#6B5C4C] border border-[#E8E2D9]'
            }`}
          >
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* WhatsApp */}
      {secao === 'whatsapp' && (() => {
        const whatsapp = gerarMensagemWhatsApp(whatsappTipo);
        return (
          <Card titulo="Mensagens WhatsApp" badge="12 tipos">
            <div className="flex flex-wrap gap-1.5 mb-4">
              {[
                { id: 'dica', label: 'Dica Crua' },
                { id: 'provocacao', label: 'Provocacao' },
                { id: 'pessoal', label: 'Voz Pessoal' },
                { id: 'urgencia', label: 'Urgencia' },
                { id: 'promo', label: 'Promo' },
                { id: 'testemunho', label: 'Testemunho' },
                { id: 'lumina', label: 'Lumina' },
                { id: 'dm', label: 'DM' },
                { id: 'grupo', label: 'Grupos' },
                { id: 'storiesSeq', label: '5 Status' },
                { id: 'audio', label: 'Audio' },
                { id: 'status', label: 'Status' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setWhatsappTipo(t.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    whatsappTipo === t.id ? 'bg-[#25D366] text-white' : 'bg-gray-100 text-[#4A4035]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <pre className="text-xs text-[#4A4035] whitespace-pre-wrap bg-[#25D366]/5 p-4 rounded-xl leading-relaxed mb-3 max-h-64 overflow-y-auto">{whatsapp.mensagem}</pre>
            <div className="flex gap-2">
              <CopyBtn onClick={() => copiar(whatsapp.mensagem, 'bib-wa')} copiado={copiado === 'bib-wa'} label="Copiar" small />
              <a
                href={`https://wa.me/?text=${encodeURIComponent(whatsapp.mensagem)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-xs font-bold"
              >
                Enviar
              </a>
            </div>
          </Card>
        );
      })()}

      {/* Instagram */}
      {secao === 'instagram' && (() => {
        const insta = gerarCaptionInstagram(instaTipo);
        return (
          <Card titulo="Conteudo Instagram" badge="5 formatos">
            <div className="flex flex-wrap gap-1.5 mb-4">
              {[
                { id: 'post', label: 'Post' },
                { id: 'reel', label: 'Reel' },
                { id: 'reelScript', label: 'Script Reel' },
                { id: 'carrossel', label: 'Carrossel' },
                { id: 'stories', label: 'Stories' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setInstaTipo(t.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    instaTipo === t.id ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-100 text-[#4A4035]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <pre className="text-xs text-[#4A4035] whitespace-pre-wrap bg-purple-50 p-4 rounded-xl leading-relaxed mb-3 max-h-64 overflow-y-auto">{insta.caption}</pre>
            <div className="flex gap-2">
              <CopyBtn onClick={() => copiar(insta.caption, 'bib-ig')} copiado={copiado === 'bib-ig'} label="Copiar" small />
              <CopyBtn onClick={() => copiar(insta.hashtags, 'bib-ig-hash')} copiado={copiado === 'bib-ig-hash'} label="Hashtags" small />
            </div>
          </Card>
        );
      })()}

      {/* Scripts Voz */}
      {secao === 'scripts' && (() => {
        const scripts = gerarScriptVoz();
        return (
          <Card titulo="Scripts para Gravar" badge="Voz / Video">
            <div className="space-y-4">
              <MsgBlock label="SCRIPT REEL (30 seg)" cor="text-purple-600" bg="bg-purple-50"
                texto={scripts.reel30s} copiar={copiar} copiado={copiado} id="bib-reel" />
              <MsgBlock label="SCRIPT STORIES (voz)" cor="text-pink-600" bg="bg-pink-50"
                texto={scripts.storiesVoz} copiar={copiar} copiado={copiado} id="bib-stories" />
              <MsgBlock label="SCRIPT NOTA DE VOZ WHATSAPP" cor="text-[#25D366]" bg="bg-[#25D366]/5"
                texto={scripts.audioWhatsApp} copiar={copiar} copiado={copiado} id="bib-audio" />
            </div>
          </Card>
        );
      })()}

      {/* Links UTM */}
      {secao === 'links' && (
        <Card titulo="Links de Campanha (UTM)">
          <div className="space-y-2">
            {[
              { label: 'Instagram Bio', icon: '📸', link: linksUTM.instagramBio },
              { label: 'Instagram Stories', icon: '📱', link: linksUTM.instagramStory },
              { label: 'WhatsApp Broadcast', icon: '💬', link: linksUTM.whatsappBroadcast },
              { label: 'WhatsApp Status', icon: '📊', link: linksUTM.whatsappStatus },
              { label: 'Email', icon: '📧', link: linksUTM.email },
              { label: 'Facebook', icon: '👍', link: linksUTM.facebook },
              { label: 'Lumina (IG)', icon: '🔮', link: linksUTM.luminaInstagram },
              { label: 'Lumina (WA)', icon: '🔮', link: linksUTM.luminaWhatsapp },
            ].map(l => (
              <div key={l.label} className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E8E2D9]">
                <div className="flex items-center gap-2 min-w-0">
                  <span>{l.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#4A4035]">{l.label}</p>
                    <p className="text-[10px] text-[#6B5C4C] truncate">{l.link}</p>
                  </div>
                </div>
                <CopyBtn onClick={() => copiar(l.link, l.label)} copiado={copiado === l.label} label="Copiar" small />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Emails */}
      {secao === 'emails' && (
        <Card titulo="Sequencia de Emails" badge="Automatica">
          <p className="text-xs text-[#6B5C4C] mb-3">Emails enviados automaticamente apos registo.</p>
          <div className="space-y-2">
            {sequenciaEmail.map((email, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-[#E8E2D9]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold bg-[#1a1a2e] text-white px-1.5 py-0.5 rounded">Dia {email.dia}</span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{email.tipo}</span>
                </div>
                <p className="text-xs font-semibold text-[#4A4035]">{email.assunto}</p>
                <p className="text-[10px] text-[#6B5C4C]">{email.preview}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

function PlatformCard({ plataforma, icon, cor, corBg, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
      <div className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${cor}`}>
        <span className="text-lg">{icon}</span>
        <span className="text-white font-bold text-sm">{plataforma}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

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
      } ${
        copiado ? 'bg-green-100 text-green-700' : 'bg-[#1a1a2e] text-white hover:bg-[#2a2a4e]'
      }`}
    >
      {copiado ? '✓ Copiado' : label}
    </button>
  );
}

function DailyChecklist({ dia }) {
  const [checks, setChecks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`marketing-check-${dia.data}`)) || {}; }
    catch { return {}; }
  });

  const toggle = (key) => {
    const next = { ...checks, [key]: !checks[key] };
    setChecks(next);
    localStorage.setItem(`marketing-check-${dia.data}`, JSON.stringify(next));
  };

  const items = [
    { key: 'status', label: 'Publicar WhatsApp Status', time: '09:00' },
    { key: 'stories', label: 'Publicar Instagram Stories', time: '10:00' },
    { key: 'post', label: `Publicar ${dia.formato} no Instagram`, time: '12:00' },
    { key: 'broadcast', label: 'Enviar mensagem WhatsApp broadcast', time: '14:00' },
    { key: 'dms', label: 'Responder DMs e mensagens', time: '17:00' },
    { key: 'engajar', label: 'Engajar em 5-10 posts de potenciais seguidoras', time: '18:00' },
  ];

  const done = Object.values(checks).filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#6B5C4C] font-semibold">{done}/{items.length}</span>
        <div className="h-1.5 flex-1 mx-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#1a1a2e] rounded-full transition-all" style={{ width: `${(done / items.length) * 100}%` }} />
        </div>
      </div>
      <div className="space-y-1.5">
        {items.map(item => (
          <label
            key={item.key}
            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
              checks[item.key] ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-transparent hover:bg-gray-100'
            }`}
          >
            <input
              type="checkbox"
              checked={!!checks[item.key]}
              onChange={() => toggle(item.key)}
              className="w-4 h-4 rounded accent-[#1a1a2e]"
            />
            <p className={`flex-1 text-xs ${checks[item.key] ? 'text-green-700 line-through' : 'text-[#4A4035]'}`}>{item.label}</p>
            <span className="text-[10px] text-[#6B5C4C]">{item.time}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
