import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  listarContactosWhatsApp,
  broadcastWhatsApp,
  broadcastWhatsAppGrupo,
  broadcastEmail,
  historicoWhatsApp,
} from '../lib/broadcast-api';

// ===== TEMPLATES DE MENSAGEM WHATSAPP (só envios manuais) =====
// A sequência nurturing (dia 0-30) é 100% automática via cron.
// Aqui ficam só os templates para envios manuais pontuais.

const WA_TEMPLATES = {
  'lembrete-app': {
    nome: 'Lembrete',
    metaTemplate: 'lembrete_app',
    texto: (nome) =>
      `Olá ${nome || 'querida'}! Já lá vão uns dias desde o teu último registo. Cada pequeno passo conta. Que tal registares algo hoje? Mesmo que seja só a água.\n\nhttps://app.seteecos.com/vitalis\n\n— Vivianne`,
  },
  'motivacao': {
    nome: 'Motivação',
    metaTemplate: 'motivacao',
    texto: (nome) =>
      `Olá ${nome || ''}! Sei que estes dias não foram fáceis.\n\n"A diferença entre quem transforma o corpo e quem desiste não é força de vontade. É ter alguém que não desiste de ti."\n\nEu não desisti de ti. Todo o teu progresso está guardado.\n\nhttps://app.seteecos.com/vitalis\n\n— Vivianne`,
  },
  'follow-up': {
    nome: 'Follow-up',
    metaTemplate: 'follow_up',
    texto: (nome) =>
      `Olá ${nome || ''}! Passaste por aqui e quero saber como estás. O VITALIS tem ajudado muitas mulheres a encontrar o equilíbrio com a comida, sem dietas malucas.\n\nQueres saber mais? Responde aqui.\n\n— Vivianne`,
  },
  'promo': {
    nome: 'Promo 20%',
    metaTemplate: 'promo',
    texto: (nome) =>
      `Olá ${nome || ''}! Presente especial: usa o código VEMVITALIS20 e tem 20% de desconto no VITALIS.\n\nDe 2.500 por 2.000 MZN/mês.\n\nhttps://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20\n\n— Vivianne`,
  },
  'novidade': {
    nome: 'Novidade',
    metaTemplate: 'novidade',
    texto: (nome) =>
      `Olá ${nome || ''}! Temos novidades no Sete Ecos! Novos recursos, novas funcionalidades.\n\nhttps://app.seteecos.com\n\n— Vivianne`,
  },
  'curiosidade': {
    nome: 'Curiosidade',
    metaTemplate: 'curiosidade',
    texto: (nome) =>
      `Olá ${nome || ''}! Faz este exercício: antes de comeres algo, põe a mão no peito e pergunta "estou mesmo com fome ou estou a sentir algo?"\n\nSe a resposta for "estou a sentir algo" — o problema não é fome. É emoção.\n\nVEMVITALIS20 — 20% desconto\nhttps://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20\n\n— Vivianne`,
  },
  personalizado: {
    nome: 'Personalizado',
    metaTemplate: null,
    texto: () => '',
  },
};

// ===== GRUPOS DE BROADCAST =====

const WA_GRUPOS = [
  { id: 'todos', nome: 'Todos os contactos', desc: 'Todos que já falaram no WhatsApp' },
  { id: 'leads', nome: 'Leads (não convertidos)', desc: 'Contactaram mas não são clientes' },
  { id: 'interessados-precos', nome: 'Interessados em preços', desc: 'Perguntaram preços, pagamento ou trial' },
  { id: 'interessados-vitalis', nome: 'Interessados no VITALIS', desc: 'Mostraram interesse no VITALIS' },
  { id: 'recentes', nome: 'Recentes (30 dias)', desc: 'Última mensagem nos últimos 30 dias' },
];

// ===== EMAIL TEMPLATES =====

const EMAIL_TEMPLATES = [
  { id: 'catalogo', nome: 'Catálogo Completo', desc: 'Apresenta todos os serviços Sete Ecos com preços e bundles' },
  { id: 'promo', nome: 'Promo 20% Desconto', desc: 'Código VEMVITALIS20 com CTA directo para pagamento' },
  { id: 'convite-whatsapp', nome: 'Convite WhatsApp', desc: 'Convida a juntar-se ao WhatsApp Business da Vivianne' },
];

const EMAIL_AUDIENCIAS = [
  { id: 'todos', nome: 'Todos', desc: 'Waitlist + registados + expirados' },
  { id: 'waitlist', nome: 'Waitlist', desc: 'Leads que ainda não subscreveram' },
  { id: 'registados', nome: 'Registados sem sub', desc: 'Users sem subscrição activa' },
  { id: 'expirados', nome: 'Expirados', desc: 'Clientes expirados ou cancelados (win-back)' },
];

// ===== COMPONENTE PRINCIPAL =====

export default function CoachBroadcast() {
  const [tab, setTab] = useState('whatsapp');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const [confirmar, setConfirmar] = useState(null);

  // WhatsApp state
  const [contactos, setContactos] = useState([]);
  const [loadingContactos, setLoadingContactos] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState(new Set());
  const [waTemplate, setWaTemplate] = useState('follow-up');
  const [waCustomMsg, setWaCustomMsg] = useState('');
  const [waGrupo, setWaGrupo] = useState('');
  const [waModo, setWaModo] = useState('grupo');
  const [waUsarTemplate, setWaUsarTemplate] = useState(true);
  const [filtro, setFiltro] = useState('');

  // Email state
  const [emailTemplate, setEmailTemplate] = useState('catalogo');
  const [emailAudiencia, setEmailAudiencia] = useState('todos');

  // Histórico state
  const [historico, setHistorico] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token;
  }, []);

  // ===== CARREGAR CONTACTOS =====

  const carregarContactos = useCallback(async () => {
    setLoadingContactos(true);
    setErro(null);
    try {
      const token = await getToken();
      const data = await listarContactosWhatsApp(token);
      setContactos(data.contactos || []);
    } catch (err) {
      setErro('Erro ao carregar contactos: ' + err.message);
    } finally {
      setLoadingContactos(false);
    }
  }, [getToken]);

  const carregarHistorico = useCallback(async () => {
    setLoadingHistorico(true);
    try {
      const token = await getToken();
      const data = await historicoWhatsApp(token, 100);
      setHistorico(data.logs || []);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoadingHistorico(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (tab === 'whatsapp') {
      carregarContactos();
    } else if (tab === 'historico') {
      carregarHistorico();
    }
  }, [tab, carregarContactos, carregarHistorico]);

  // ===== CONTAGEM DE AUDIÊNCIA =====

  const getAudienciaCount = () => {
    if (waModo === 'selecionar') return selectedNumbers.size;
    if (!waGrupo) return 0;

    if (waGrupo === 'todos') return contactos.length;
    if (waGrupo === 'leads') return contactos.filter(c => c.tipo === 'lead').length;
    if (waGrupo === 'interessados-precos') return contactos.filter(c => c.interessou_precos).length;
    if (waGrupo === 'interessados-vitalis') return contactos.filter(c => c.interessou_vitalis).length;
    if (waGrupo === 'recentes') {
      const limite = new Date();
      limite.setDate(limite.getDate() - 30);
      return contactos.filter(c => new Date(c.ultima_mensagem) >= limite).length;
    }
    return 0;
  };

  // ===== PEDIR CONFIRMAÇÃO WHATSAPP =====

  const pedirConfirmacaoWA = () => {
    setErro(null);
    setResultado(null);

    const template = WA_TEMPLATES[waTemplate];
    const mensagem = waTemplate === 'personalizado' ? waCustomMsg : template.texto('');

    if (!mensagem.trim() && waTemplate === 'personalizado') {
      setErro('Escreve uma mensagem primeiro');
      return;
    }

    const count = getAudienciaCount();
    if (count === 0) {
      setErro('Selecciona um grupo ou contactos individuais');
      return;
    }

    const grupoNome = waModo === 'grupo'
      ? WA_GRUPOS.find(g => g.id === waGrupo)?.nome
      : `${selectedNumbers.size} contactos`;

    const templateNome = WA_TEMPLATES[waTemplate]?.nome || 'Personalizado';
    const usarMeta = waUsarTemplate && waTemplate !== 'personalizado';

    setConfirmar({
      tipo: 'whatsapp',
      descricao: `Enviar "${templateNome}" para ${count} contactos (${grupoNome})${usarMeta ? ' via Meta Template' : ' como texto livre'}`,
      dados: { mensagem, count, grupoNome, usarMeta },
    });
  };

  // ===== CONFIRMAR E ENVIAR WHATSAPP =====

  const confirmarEnvioWA = async () => {
    setConfirmar(null);
    setLoading(true);
    setResultado(null);
    setErro(null);

    try {
      const token = await getToken();
      const template = WA_TEMPLATES[waTemplate];
      const mensagem = waTemplate === 'personalizado' ? waCustomMsg : template.texto('');
      const usarMeta = waUsarTemplate && waTemplate !== 'personalizado';

      const extra = usarMeta ? { template: template.metaTemplate } : {};

      let result;
      if (waModo === 'grupo' && waGrupo) {
        result = await broadcastWhatsAppGrupo(token, waGrupo, mensagem, extra);
      } else if (waModo === 'selecionar' && selectedNumbers.size > 0) {
        const numeros = [...selectedNumbers];
        result = await broadcastWhatsApp(token, numeros, mensagem, extra);
      }

      setResultado(result);
    } catch (err) {
      setErro('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== PEDIR CONFIRMAÇÃO EMAIL =====

  const pedirConfirmacaoEmail = () => {
    setErro(null);
    setResultado(null);
    const tmpl = EMAIL_TEMPLATES.find(t => t.id === emailTemplate);
    const aud = EMAIL_AUDIENCIAS.find(a => a.id === emailAudiencia);
    setConfirmar({
      tipo: 'email',
      descricao: `Enviar email "${tmpl?.nome}" para audiência "${aud?.nome}"`,
      dados: {},
    });
  };

  // ===== CONFIRMAR E ENVIAR EMAIL =====

  const confirmarEnvioEmail = async () => {
    setConfirmar(null);
    setLoading(true);
    setResultado(null);
    setErro(null);

    try {
      const token = await getToken();
      const result = await broadcastEmail(token, emailTemplate, emailAudiencia);
      setResultado(result);
    } catch (err) {
      setErro('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== TOGGLE SELECÇÃO =====

  const toggleNumber = (num) => {
    setSelectedNumbers(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const selectAll = () => {
    const filtered = contactosFiltrados;
    if (selectedNumbers.size === filtered.length) {
      setSelectedNumbers(new Set());
    } else {
      setSelectedNumbers(new Set(filtered.map(c => c.telefone)));
    }
  };

  // ===== FILTRAR =====

  const contactosFiltrados = contactos.filter(c => {
    if (!filtro) return true;
    const f = filtro.toLowerCase();
    return (
      c.telefone?.includes(f) ||
      c.nome?.toLowerCase().includes(f) ||
      c.interesses?.some(i => i.includes(f))
    );
  });

  const previewMensagem = waTemplate === 'personalizado'
    ? waCustomMsg
    : WA_TEMPLATES[waTemplate]?.texto('') || '';

  const audienciaCount = getAudienciaCount();

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-gray-900">
      {/* Header — mobile-first */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="min-w-0">
            <Link to="/coach" className="text-xs sm:text-sm text-[#7C8B6F] hover:underline">&larr; Dashboard</Link>
            <h1 className="text-lg sm:text-xl font-bold text-[#4A4035] dark:text-white mt-0.5 truncate">Centro de Broadcast</h1>
          </div>
          {tab === 'whatsapp' && !loadingContactos && (
            <div className="text-right flex-shrink-0 ml-3">
              <p className="text-xl sm:text-2xl font-bold text-[#7C8B6F]">{contactos.length}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">contactos</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação */}
      {confirmar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-[#4A4035] dark:text-white mb-2">Confirmar envio</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{confirmar.descricao}</p>

            {confirmar.dados?.count && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  Vão ser enviadas {confirmar.dados.count} mensagens. Tempo estimado: ~{Math.ceil(confirmar.dados.count * 3 / 60)} min
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmar(null)}
                className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium active:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmar.tipo === 'whatsapp' ? confirmarEnvioWA : confirmarEnvioEmail}
                className={`flex-1 py-3 rounded-xl text-white text-sm font-semibold active:opacity-80 ${
                  confirmar.tipo === 'whatsapp' ? 'bg-[#25D366]' : 'bg-blue-600'
                }`}
              >
                Confirmar Envio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs — scroll horizontal no mobile */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 mt-3 sm:mt-4">
        <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          {[
            { id: 'whatsapp', label: 'WhatsApp' },
            { id: 'email', label: 'Email' },
            { id: 'instagram', label: 'Instagram' },
            { id: 'historico', label: 'Histórico' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setResultado(null); setErro(null); }}
              className={`flex-shrink-0 flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-[#7C8B6F] text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 active:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {erro && (
          <div className="mb-3 sm:mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
            {erro}
          </div>
        )}
        {resultado && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 text-sm">
            <p className="font-semibold">{resultado.message || 'Enviado com sucesso!'}</p>
            {resultado.enviados !== undefined && (
              <p className="mt-1">Enviados: {resultado.enviados}/{resultado.total || resultado.total_destinatarios}</p>
            )}
            {resultado.erros?.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-red-600 dark:text-red-400 font-medium">
                  {resultado.erros.length} erros
                </summary>
                <ul className="mt-1 text-xs space-y-0.5">
                  {resultado.erros.slice(0, 10).map((e, i) => (
                    <li key={i}>+{e.numero}: {e.erro}</li>
                  ))}
                  {resultado.erros.length > 10 && <li>... e mais {resultado.erros.length - 10}</li>}
                </ul>
              </details>
            )}
          </div>
        )}

        {/* ===== TAB: WHATSAPP ===== */}
        {tab === 'whatsapp' && (
          <div className="space-y-3 sm:space-y-4">
            {/* Modo de envio */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
              <h3 className="font-semibold text-[#4A4035] dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Modo de envio</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setWaModo('grupo')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                    waModo === 'grupo' ? 'bg-green-100 text-green-800 ring-2 ring-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Por grupo
                </button>
                <button
                  onClick={() => setWaModo('selecionar')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                    waModo === 'selecionar' ? 'bg-green-100 text-green-800 ring-2 ring-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Seleccionar
                </button>
              </div>

              {/* Grupo */}
              {waModo === 'grupo' && (
                <div className="mt-3 space-y-1.5 sm:space-y-2">
                  {WA_GRUPOS.map(g => {
                    let count = 0;
                    if (g.id === 'todos') count = contactos.length;
                    else if (g.id === 'leads') count = contactos.filter(c => c.tipo === 'lead').length;
                    else if (g.id === 'interessados-precos') count = contactos.filter(c => c.interessou_precos).length;
                    else if (g.id === 'interessados-vitalis') count = contactos.filter(c => c.interessou_vitalis).length;
                    else if (g.id === 'recentes') {
                      const limite = new Date();
                      limite.setDate(limite.getDate() - 30);
                      count = contactos.filter(c => new Date(c.ultima_mensagem) >= limite).length;
                    }

                    return (
                      <label
                        key={g.id}
                        className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all active:scale-[0.98] ${
                          waGrupo === g.id ? 'bg-green-50 dark:bg-green-900/20 ring-1 ring-green-300' : 'bg-gray-50 dark:bg-gray-700/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="grupo"
                          value={g.id}
                          checked={waGrupo === g.id}
                          onChange={() => setWaGrupo(g.id)}
                          className="accent-green-600 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#4A4035] dark:text-white truncate">{g.nome}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{g.desc}</p>
                        </div>
                        <span className="text-sm font-bold text-[#7C8B6F] bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full flex-shrink-0">
                          {count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Seleccionar contactos */}
              {waModo === 'selecionar' && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Filtrar por nome ou número..."
                      value={filtro}
                      onChange={e => setFiltro(e.target.value)}
                      className="flex-1 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#4A4035] dark:text-white"
                    />
                    <button
                      onClick={selectAll}
                      className="px-3 py-2.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded-lg active:bg-gray-200 text-gray-600 dark:text-gray-300 flex-shrink-0"
                    >
                      {selectedNumbers.size === contactosFiltrados.length ? 'Desmarcar' : 'Todos'}
                    </button>
                  </div>

                  {loadingContactos ? (
                    <p className="text-sm text-gray-500 py-4 text-center">A carregar contactos...</p>
                  ) : contactosFiltrados.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">Nenhum contacto encontrado</p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-600 rounded-lg p-1.5 sm:p-2">
                      <p className="text-xs text-gray-400 mb-1 px-1">{contactosFiltrados.length} contactos | {selectedNumbers.size} seleccionados</p>
                      {contactosFiltrados.map(c => (
                        <label
                          key={c.telefone}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-all active:scale-[0.98] ${
                            selectedNumbers.has(c.telefone) ? 'bg-green-50 dark:bg-green-900/20' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedNumbers.has(c.telefone)}
                            onChange={() => toggleNumber(c.telefone)}
                            className="accent-green-600 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-[#4A4035] dark:text-white truncate block">
                              {c.nome || 'Sem nome'}
                            </span>
                            <span className="text-[11px] text-gray-400">+{c.telefone}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {c.interessou_precos && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded-full">Preços</span>
                            )}
                            {c.interessou_vitalis && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-green-100 text-green-700 rounded-full">Vitalis</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Template de mensagem */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
              <h3 className="font-semibold text-[#4A4035] dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Mensagem</h3>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                {Object.entries(WA_TEMPLATES).map(([id, t]) => (
                  <button
                    key={id}
                    onClick={() => setWaTemplate(id)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                      waTemplate === id
                        ? 'bg-[#25D366] text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {t.nome}
                  </button>
                ))}
              </div>

              <p className="text-[10px] sm:text-[11px] text-gray-400 mb-2">A sequência de nurturing (dia 0-30) é automática — não precisas de fazer nada.</p>

              {waTemplate === 'personalizado' ? (
                <textarea
                  value={waCustomMsg}
                  onChange={e => setWaCustomMsg(e.target.value)}
                  placeholder="Escreve a tua mensagem aqui..."
                  rows={4}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#4A4035] dark:text-white resize-none"
                />
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm text-[#4A4035] dark:text-gray-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {previewMensagem}
                </div>
              )}

              {/* Opção Meta Template */}
              {waTemplate !== 'personalizado' && (
                <label className="flex items-start gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={waUsarTemplate}
                    onChange={e => setWaUsarTemplate(e.target.checked)}
                    className="accent-green-600 mt-0.5"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Usar Meta Template (funciona fora das 24h — requer template aprovado na Meta)
                  </span>
                </label>
              )}

              <p className="text-xs text-gray-400 mt-2">
                {audienciaCount > 0 && (
                  <span className="font-medium text-[#7C8B6F]">{audienciaCount} destinatários</span>
                )}
                {audienciaCount > 0 && ' | '}
                {waUsarTemplate && waTemplate !== 'personalizado'
                  ? 'Envia como Meta Template (funciona sempre)'
                  : 'Texto livre (só funciona dentro de 24h da última conversa)'}
              </p>
            </div>

            {/* Botão enviar */}
            <button
              onClick={pedirConfirmacaoWA}
              disabled={loading || audienciaCount === 0}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#25D366] active:bg-[#20bd5a] shadow-md"
            >
              {loading
                ? 'A enviar...'
                : `Enviar WhatsApp para ${audienciaCount} contacto${audienciaCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}

        {/* ===== TAB: EMAIL ===== */}
        {tab === 'email' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
              <h3 className="font-semibold text-[#4A4035] dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Template de Email</h3>
              <div className="space-y-1.5 sm:space-y-2">
                {EMAIL_TEMPLATES.map(t => (
                  <label
                    key={t.id}
                    className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all active:scale-[0.98] ${
                      emailTemplate === t.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-300' : 'bg-gray-50 dark:bg-gray-700/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="emailTemplate"
                      value={t.id}
                      checked={emailTemplate === t.id}
                      onChange={() => setEmailTemplate(t.id)}
                      className="accent-blue-600 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#4A4035] dark:text-white">{t.nome}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{t.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
              <h3 className="font-semibold text-[#4A4035] dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Audiência</h3>
              <div className="space-y-1.5 sm:space-y-2">
                {EMAIL_AUDIENCIAS.map(a => (
                  <label
                    key={a.id}
                    className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all active:scale-[0.98] ${
                      emailAudiencia === a.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-300' : 'bg-gray-50 dark:bg-gray-700/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="emailAudiencia"
                      value={a.id}
                      checked={emailAudiencia === a.id}
                      onChange={() => setEmailAudiencia(a.id)}
                      className="accent-blue-600 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#4A4035] dark:text-white">{a.nome}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{a.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={pedirConfirmacaoEmail}
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 active:bg-blue-700 shadow-md"
            >
              {loading ? 'A enviar...' : `Enviar Email: ${EMAIL_TEMPLATES.find(t => t.id === emailTemplate)?.nome}`}
            </button>
          </div>
        )}

        {/* ===== TAB: INSTAGRAM ===== */}
        {tab === 'instagram' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-sm text-center">
              <p className="text-4xl mb-3">📸</p>
              <h3 className="text-lg font-semibold text-[#4A4035] dark:text-white mb-2">Agendamento Instagram</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Agenda posts, stories, reels e carrosséis para Instagram e Facebook.
              </p>
              <Link
                to="/coach/social"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold active:opacity-80 transition-all shadow-md"
              >
                Abrir Agendador Social
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
              <h3 className="font-semibold text-[#4A4035] dark:text-white mb-2 text-sm sm:text-base">Funcionalidades disponíveis</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Publicar fotos com legenda
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Carrosséis (2-10 imagens)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Stories
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Reels (vídeo até 90s)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Agendar para publicação futura
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Facebook + Instagram no mesmo painel
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ===== TAB: HISTÓRICO ===== */}
        {tab === 'historico' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#4A4035] dark:text-white text-sm sm:text-base">Histórico de envios</h3>
                <button
                  onClick={carregarHistorico}
                  disabled={loadingHistorico}
                  className="text-xs text-[#7C8B6F] active:underline disabled:opacity-50"
                >
                  {loadingHistorico ? 'A carregar...' : 'Actualizar'}
                </button>
              </div>

              {loadingHistorico ? (
                <p className="text-sm text-gray-500 py-8 text-center">A carregar histórico...</p>
              ) : historico.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">Nenhum envio registado ainda</p>
              ) : (
                <div className="space-y-1.5 sm:space-y-2 max-h-[60vh] overflow-y-auto">
                  {historico.map((log, i) => (
                    <div
                      key={log.id || i}
                      className={`p-2.5 sm:p-3 rounded-lg border text-sm ${
                        log.status === 'enviado'
                          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-[#4A4035] dark:text-white text-sm">
                          +{log.telefone}
                        </span>
                        <span className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${
                          log.status === 'enviado'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {log.status === 'enviado' ? 'Enviado' : 'Erro'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {log.mensagem}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-gray-400">
                          {log.tipo === 'broadcast' ? 'Broadcast' : log.tipo || 'Manual'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {log.created_at ? new Date(log.created_at).toLocaleString('pt-PT', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          }) : ''}
                        </span>
                      </div>
                      {log.erro && (
                        <p className="text-xs text-red-500 mt-1">{log.erro}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {historico.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-[#4A4035] dark:text-white mb-2">Resumo</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-[#7C8B6F]">{historico.length}</p>
                    <p className="text-[10px] text-gray-500">Total</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{historico.filter(l => l.status === 'enviado').length}</p>
                    <p className="text-[10px] text-gray-500">Enviados</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-red-500">{historico.filter(l => l.status === 'erro').length}</p>
                    <p className="text-[10px] text-gray-500">Erros</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="h-24" />
      </div>
    </div>
  );
}
