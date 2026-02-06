import React, { useState, useEffect } from 'react';
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
  gerarLinksUTM,
  getSequenciaCompleta,
} from '../lib/marketing-engine';
import TemplateVisual from '../components/TemplateVisual';

/**
 * Marketing Dashboard - Painel de automacao de marketing para a Vivianne
 * Gera conteudo diario, mensagens WhatsApp, captions Instagram
 * Tudo pronto para copiar e publicar
 */

export default function MarketingDashboard() {
  const { session } = useAuth();
  const [tab, setTab] = useState('hoje');
  const [copiado, setCopied] = useState('');
  const [whatsappTipo, setWhatsappTipo] = useState('dica');
  const [instaTipo, setInstaTipo] = useState('post');
  const [waitlistStats, setWaitlistStats] = useState({ total: 0, semana: 0 });
  const [clientStats, setClientStats] = useState({ total: 0, activos: 0 });

  // Dados gerados
  const conteudoHoje = gerarConteudoHoje();
  const conteudoSemana = gerarConteudoSemana();
  const whatsapp = gerarMensagemWhatsApp(whatsappTipo);
  const statusWA = gerarStatusWhatsApp();
  const instaCaption = gerarCaptionInstagram(instaTipo);
  const linksUTM = gerarLinksUTM();
  const sequenciaEmail = getSequenciaCompleta();

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

      setWaitlistStats({
        total: waitlist.data?.length || 0,
        semana: waitlist.data?.filter(w => new Date(w.created_at) > weekAgo).length || 0,
      });

      setClientStats({
        total: clients.data?.length || 0,
        activos: clients.data?.filter(c => ['active', 'trial', 'tester'].includes(c.subscription_status)).length || 0,
      });
    } catch (err) {
      console.error('Erro ao carregar stats:', err);
    }
  };

  const copiar = async (texto, label) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    }
  };

  if (!isSessionCoach(session)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED]">
        <p className="text-[#6B5C4C]">Acesso restrito.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'hoje', label: 'Hoje', icon: '📅' },
    { id: 'semana', label: 'Semana', icon: '📋' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { id: 'instagram', label: 'Instagram', icon: '📸' },
    { id: 'imagens', label: 'Imagens', icon: '🎨' },
    { id: 'links', label: 'Links UTM', icon: '🔗' },
    { id: 'emails', label: 'Email Seq.', icon: '📧' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F2ED] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link to="/coach" className="text-white/80 hover:text-white text-sm">&larr; Coach</Link>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Marketing</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Centro de Marketing
          </h1>
          <p className="text-white/80 text-sm mt-1">Conteudo automatizado pronto para publicar</p>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Waitlist', valor: waitlistStats.total, sub: `+${waitlistStats.semana} esta semana` },
              { label: 'Clientes', valor: clientStats.total, sub: `${clientStats.activos} activos` },
              { label: 'Tema Hoje', valor: conteudoHoje.tema, sub: conteudoHoje.formato },
              { label: 'Dia', valor: conteudoHoje.diaSemana, sub: conteudoHoje.data },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-xs text-white/60">{s.label}</p>
                <p className="text-lg font-bold capitalize">{s.valor}</p>
                <p className="text-xs text-white/50">{s.sub}</p>
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
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-white shadow-md text-[#7C8B6F]'
                  : 'bg-white/50 text-[#6B5C4C] hover:bg-white/80'
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4 space-y-4">

        {/* ===== TAB: HOJE ===== */}
        {tab === 'hoje' && (
          <>
            <Card titulo={`${conteudoHoje.titulo} - ${conteudoHoje.diaSemana}`} badge={conteudoHoje.formato}>
              <p className="text-[#4A4035] mb-4 leading-relaxed">{conteudoHoje.dica}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {conteudoHoje.hashtags.map(h => (
                  <span key={h} className="text-xs bg-[#7C8B6F]/10 text-[#7C8B6F] px-2 py-1 rounded-full">{h}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <CopyBtn onClick={() => copiar(conteudoHoje.dica, 'dica')} copiado={copiado === 'dica'} label="Copiar Dica" />
                <CopyBtn onClick={() => copiar(conteudoHoje.hashtags.join(' '), 'hash')} copiado={copiado === 'hash'} label="Copiar Hashtags" />
              </div>
            </Card>

            {/* Checklist do dia */}
            <Card titulo="Checklist do Dia">
              <DailyChecklist dia={conteudoHoje} />
            </Card>

            {/* WhatsApp rapido */}
            <Card titulo="WhatsApp Status (pronto)" badge="Copiar e colar">
              <pre className="text-sm text-[#4A4035] whitespace-pre-wrap bg-white/50 p-3 rounded-lg mb-3">
                {statusWA.mensagem}
              </pre>
              <CopyBtn onClick={() => copiar(statusWA.mensagem, 'status')} copiado={copiado === 'status'} label="Copiar para Status" />
            </Card>
          </>
        )}

        {/* ===== TAB: SEMANA ===== */}
        {tab === 'semana' && (
          <Card titulo="Calendario da Semana">
            <div className="space-y-3">
              {conteudoSemana.map((dia, i) => (
                <div key={dia.data} className={`p-4 rounded-xl border-2 transition-all ${
                  i === 0 ? 'border-[#7C8B6F] bg-[#7C8B6F]/5' : 'border-[#E8E2D9] bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-[#7C8B6F] text-white px-2 py-1 rounded">
                        {dia.diaSemana.slice(0, 3)}
                      </span>
                      <span className="text-sm font-semibold text-[#4A4035]">{dia.titulo}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{dia.tema}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{dia.formato}</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#6B5C4C] mb-2">{dia.dica}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copiar(dia.dica, `sem-${i}`)}
                      className="text-xs text-[#7C8B6F] font-medium hover:underline"
                    >
                      {copiado === `sem-${i}` ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ===== TAB: WHATSAPP ===== */}
        {tab === 'whatsapp' && (
          <>
            <Card titulo="Gerador de Mensagens WhatsApp">
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { id: 'dica', label: 'Dica do Dia' },
                  { id: 'promo', label: 'Promocao' },
                  { id: 'testemunho', label: 'Testemunho' },
                  { id: 'lumina', label: 'Lumina Gratis' },
                  { id: 'status', label: 'Status' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setWhatsappTipo(t.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      whatsappTipo === t.id
                        ? 'bg-[#25D366] text-white'
                        : 'bg-[#E8E2D9] text-[#4A4035] hover:bg-[#25D366]/20'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <pre className="text-sm text-[#4A4035] whitespace-pre-wrap bg-white/50 p-4 rounded-xl border border-[#E8E2D9] mb-4 leading-relaxed">
                {whatsapp.mensagem}
              </pre>

              <div className="flex gap-2">
                <CopyBtn onClick={() => copiar(whatsapp.mensagem, 'wa')} copiado={copiado === 'wa'} label="Copiar Mensagem" />
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(whatsapp.mensagem)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-4 py-2 bg-[#25D366] text-white rounded-full text-sm font-medium hover:bg-[#20BD5A] transition-colors"
                >
                  Enviar via WhatsApp
                </a>
              </div>
            </Card>

            <Card titulo="Mensagens Pre-Escritas para Broadcast" badge="5 tipos">
              <p className="text-sm text-[#6B5C4C] mb-3">
                Cada mensagem inclui link UTM para rastrear conversoes.
                Usa "Copiar" e cola directamente no WhatsApp.
              </p>
              <div className="space-y-2">
                {['dica', 'promo', 'testemunho', 'lumina', 'status'].map(tipo => {
                  const msg = gerarMensagemWhatsApp(tipo);
                  return (
                    <div key={tipo} className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E8E2D9]">
                      <span className="text-sm font-medium text-[#4A4035] capitalize">{tipo}</span>
                      <CopyBtn
                        onClick={() => copiar(msg.mensagem, `wa-${tipo}`)}
                        copiado={copiado === `wa-${tipo}`}
                        label="Copiar"
                        small
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}

        {/* ===== TAB: INSTAGRAM ===== */}
        {tab === 'instagram' && (
          <>
            <Card titulo="Gerador de Captions Instagram">
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { id: 'post', label: 'Post' },
                  { id: 'reel', label: 'Reel' },
                  { id: 'carrossel', label: 'Carrossel' },
                  { id: 'stories', label: 'Stories' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setInstaTipo(t.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      instaTipo === t.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-[#E8E2D9] text-[#4A4035] hover:bg-purple-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <pre className="text-sm text-[#4A4035] whitespace-pre-wrap bg-white/50 p-4 rounded-xl border border-[#E8E2D9] mb-4 leading-relaxed">
                {instaCaption.caption}
              </pre>

              <div className="flex gap-2">
                <CopyBtn onClick={() => copiar(instaCaption.caption, 'insta')} copiado={copiado === 'insta'} label="Copiar Caption" />
                <CopyBtn onClick={() => copiar(instaCaption.hashtags, 'insta-hash')} copiado={copiado === 'insta-hash'} label="So Hashtags" />
              </div>
            </Card>

            <Card titulo="Ideias de Conteudo por Formato">
              <div className="space-y-3">
                {[
                  { formato: 'Reel (30-60s)', ideias: ['Dica rapida de nutricao', 'Antes vs depois de uma refeicao', 'Medir porcoes com a mao', 'Desmitificar um mito nutricional'] },
                  { formato: 'Carrossel', ideias: ['5 erros comuns ao emagrecer', '3 receitas rapidas com ingredientes locais', 'O que comer num dia tipico', 'Sinais de que o corpo precisa de atencao'] },
                  { formato: 'Stories', ideias: ['Poll: preferes xima ou arroz?', 'Caixa de perguntas sobre nutricao', 'O teu prato de hoje', 'Countdown para lancamento'] },
                ].map(f => (
                  <div key={f.formato} className="p-3 bg-white rounded-lg border border-[#E8E2D9]">
                    <p className="text-sm font-semibold text-[#7C8B6F] mb-1">{f.formato}</p>
                    <ul className="text-xs text-[#6B5C4C] space-y-1">
                      {f.ideias.map(i => <li key={i} className="flex items-start gap-1"><span>•</span> {i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* ===== TAB: IMAGENS ===== */}
        {tab === 'imagens' && (
          <>
            <Card titulo="Gerar Imagem com Identidade Visual" badge="Descarrega PNG">
              <p className="text-sm text-[#6B5C4C] mb-4">
                Cria imagens prontas para publicar no Instagram, Stories e WhatsApp Status
                com as cores e logo oficiais. Escolhe marca, formato e estilo.
              </p>
              <TemplateVisual
                texto={conteudoHoje.dica}
                subtitulo="VITALIS - Coaching Nutricional Personalizado"
              />
            </Card>

            <Card titulo="Criar com Texto Personalizado">
              <PersonalizedImageGenerator />
            </Card>
          </>
        )}

        {/* ===== TAB: LINKS UTM ===== */}
        {tab === 'links' && (
          <Card titulo="Links de Campanha (com UTM)">
            <p className="text-sm text-[#6B5C4C] mb-4">
              Cada link inclui parametros UTM para rastrear de onde vem cada visitante.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Instagram Bio', icon: '📸', link: linksUTM.instagramBio },
                { label: 'Instagram Stories', icon: '📱', link: linksUTM.instagramStory },
                { label: 'WhatsApp Broadcast', icon: '💬', link: linksUTM.whatsappBroadcast },
                { label: 'WhatsApp Status', icon: '📊', link: linksUTM.whatsappStatus },
                { label: 'Email Newsletter', icon: '📧', link: linksUTM.email },
                { label: 'Facebook Post', icon: '👍', link: linksUTM.facebook },
                { label: 'Lumina (Instagram)', icon: '🔮', link: linksUTM.luminaInstagram },
                { label: 'Lumina (WhatsApp)', icon: '🔮', link: linksUTM.luminaWhatsapp },
              ].map(l => (
                <div key={l.label} className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E8E2D9]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span>{l.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#4A4035]">{l.label}</p>
                      <p className="text-xs text-[#6B5C4C] truncate">{l.link}</p>
                    </div>
                  </div>
                  <CopyBtn onClick={() => copiar(l.link, l.label)} copiado={copiado === l.label} label="Copiar" small />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ===== TAB: EMAIL SEQUENCES ===== */}
        {tab === 'emails' && (
          <Card titulo="Sequencia Automatica de Emails" badge="Lead Nurturing">
            <p className="text-sm text-[#6B5C4C] mb-4">
              Emails enviados automaticamente apos registo na waitlist.
              Configura no endpoint <code className="bg-gray-100 px-1 rounded">/api/email-sequencia</code>.
            </p>
            <div className="space-y-3">
              {sequenciaEmail.map((email, i) => (
                <div key={i} className="p-4 bg-white rounded-xl border-2 border-[#E8E2D9] relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold bg-[#7C8B6F] text-white px-2 py-1 rounded">
                      Dia {email.dia}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{email.tipo}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#4A4035] mb-1">{email.assunto}</p>
                  <p className="text-xs text-[#6B5C4C]">{email.preview}</p>
                  {i < sequenciaEmail.length - 1 && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-[#7C8B6F]"></div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTES
// ============================================================

function Card({ titulo, badge, children }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-[#E8E2D9] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8E2D9] bg-[#F5F2ED]">
        <h3 className="font-semibold text-[#4A4035]">{titulo}</h3>
        {badge && <span className="text-xs bg-[#7C8B6F]/10 text-[#7C8B6F] px-2 py-0.5 rounded-full">{badge}</span>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function CopyBtn({ onClick, copiado, label, small }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 font-medium transition-all ${
        small
          ? 'px-3 py-1 text-xs rounded-lg'
          : 'px-4 py-2 text-sm rounded-full'
      } ${
        copiado
          ? 'bg-green-100 text-green-700'
          : 'bg-[#7C8B6F] text-white hover:bg-[#6B7A5D]'
      }`}
    >
      {copiado ? '✓ Copiado' : label}
    </button>
  );
}

function PersonalizedImageGenerator() {
  const [texto, setTexto] = useState('');
  const [subtitulo, setSubtitulo] = useState('');

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-[#6B5C4C] block mb-1">Texto principal</label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ex: Comer bem nao e passar fome. E saber escolher."
          className="w-full p-3 border-2 border-[#E8E2D9] rounded-xl text-sm focus:border-[#7C8B6F] focus:outline-none resize-none"
          rows={3}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-[#6B5C4C] block mb-1">Subtitulo (opcional)</label>
        <input
          value={subtitulo}
          onChange={(e) => setSubtitulo(e.target.value)}
          placeholder="Ex: VITALIS - Coaching Nutricional"
          className="w-full p-3 border-2 border-[#E8E2D9] rounded-xl text-sm focus:border-[#7C8B6F] focus:outline-none"
        />
      </div>
      {texto.length > 5 && (
        <TemplateVisual texto={texto} subtitulo={subtitulo || undefined} />
      )}
    </div>
  );
}

function DailyChecklist({ dia }) {
  const [checks, setChecks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`marketing-check-${dia.data}`)) || {};
    } catch { return {}; }
  });

  const toggle = (key) => {
    const next = { ...checks, [key]: !checks[key] };
    setChecks(next);
    localStorage.setItem(`marketing-check-${dia.data}`, JSON.stringify(next));
  };

  const items = [
    { key: 'status', label: 'Publicar WhatsApp Status com dica do dia', time: '09:00' },
    { key: 'stories', label: 'Publicar Instagram Stories (poll/pergunta)', time: '10:00' },
    { key: 'post', label: `Publicar ${dia.formato} no Instagram`, time: '12:00' },
    { key: 'broadcast', label: 'Enviar mensagem no broadcast WhatsApp (se aplicavel)', time: '14:00' },
    { key: 'dms', label: 'Responder DMs e mensagens pendentes', time: '17:00' },
    { key: 'engajar', label: 'Comentar em 5-10 posts de potenciais seguidoras', time: '18:00' },
  ];

  const done = Object.values(checks).filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[#6B5C4C]">{done}/{items.length} feitos</span>
        <div className="h-2 flex-1 mx-3 bg-[#E8E2D9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#7C8B6F] rounded-full transition-all"
            style={{ width: `${(done / items.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <label
            key={item.key}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
              checks[item.key] ? 'bg-green-50 border border-green-200' : 'bg-white border border-[#E8E2D9] hover:border-[#7C8B6F]'
            }`}
          >
            <input
              type="checkbox"
              checked={!!checks[item.key]}
              onChange={() => toggle(item.key)}
              className="w-5 h-5 rounded accent-[#7C8B6F]"
            />
            <div className="flex-1">
              <p className={`text-sm ${checks[item.key] ? 'text-green-700 line-through' : 'text-[#4A4035]'}`}>
                {item.label}
              </p>
            </div>
            <span className="text-xs text-[#6B5C4C]">{item.time}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
