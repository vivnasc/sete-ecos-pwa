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

// ===== TEMPLATES DE MENSAGEM WHATSAPP =====
// Cada template tem: nome, texto (preview), metaTemplate (nome do template na Meta)

const WA_TEMPLATES = {
  // --- Sequencia nurturing (= emails) ---
  'boas-vindas': {
    nome: 'Boas-vindas',
    metaTemplate: 'boas_vindas',
    grupo: 'sequencia',
    texto: (nome) =>
      `Ola ${nome || 'amiga'}! Obrigada por te juntares ao Sete Ecos.\n\nNos proximos dias vou partilhar contigo ferramentas que podem mudar a tua relacao contigo mesma.\n\nA comecar pelo Lumina — um diagnostico gratuito que revela padroes sobre a tua energia, emocao e corpo.\n\nhttps://app.seteecos.com/lumina\n\n— Vivianne`,
  },
  'convite-lumina': {
    nome: 'Convite Lumina',
    metaTemplate: 'convite_lumina',
    grupo: 'sequencia',
    texto: (nome) =>
      `Ola ${nome || 'amiga'}! 2 minutos podem mudar o teu dia.\n\nO Lumina e um ritual diario de auto-observacao. 7 perguntas simples que revelam padroes sobre como te sentes.\n\nMulheres que usam o Lumina reportam:\n- Mais consciencia sobre padroes emocionais\n- Melhor capacidade de prever dias dificeis\n- Correlacao entre ciclo menstrual e estados emocionais\n\nE completamente gratuito.\n\nhttps://app.seteecos.com/lumina\n\n— Vivianne`,
  },
  'tres-sinais': {
    nome: '3 Sinais',
    metaTemplate: 'tres_sinais',
    grupo: 'sequencia',
    texto: (nome) =>
      `Ola ${nome || ''}! O teu corpo fala. Estas a ouvir?\n\nHa 3 sinais que muitas mulheres ignoram:\n\n1. Cansaco cronico — Se dormes e acordas cansada, pode ser o que comes.\n2. Comer por emocao — Se comes quando estas triste ou ansiosa, o problema nao e fome.\n3. Efeito ioio — As dietas restritivas estao a sabotar o teu metabolismo.\n\nSe te identificas com pelo menos 1, o VITALIS foi criado para ti.\n\nhttps://app.seteecos.com/vitalis\n\n— Vivianne`,
  },
  'segredo': {
    nome: 'Segredo',
    metaTemplate: 'segredo',
    grupo: 'sequencia',
    texto: (nome) =>
      `Ola ${nome || ''}! Preciso de te contar uma coisa.\n\n"A maioria das mulheres que me procura nao tem um problema de comida. Tem um problema de emocao disfarcado de fome."\n\nQuando comes por ansiedade, solidao, tedio — o teu corpo nao precisa de comida. Precisa de presenca. Nenhuma dieta resolve isso.\n\nFoi por isso que criei o Espaco de Retorno dentro do VITALIS — para quando sentes vontade de comer por emocao. Sem culpa. Sem julgamento.\n\nIsto nao existe em mais nenhum programa.\n\nQueres saber mais? Responde aqui.\n\n— Vivianne`,
  },
  'convite-trial': {
    nome: 'Convite 20% Off',
    metaTemplate: 'convite_trial',
    grupo: 'sequencia',
    texto: (nome) =>
      `Ola ${nome || ''}! Imagina: daqui a 3 meses, mais energia, roupa a caber melhor, comes sem culpa.\n\nO VITALIS inclui:\n- Plano alimentar com comida mocambicana\n- Receitas com ingredientes que ja tens em casa\n- Check-in diario em 30 segundos\n- Espaco de Retorno (apoio emocional unico)\n- Chat directo com a Vivianne\n- 7 dias de garantia total\n\nCodigo: VEMVITALIS20 — 20% desconto\nDe 2.500 por 2.000 MZN/mes\n\nhttps://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20\n\n— Vivianne`,
  },
  'testemunho': {
    nome: 'Testemunho',
    metaTemplate: 'testemunho',
    grupo: 'sequencia',
    texto: (nome) =>
      `Ola ${nome || ''}! Isto e possivel para ti tambem.\n\n"Perdi 8kg em 3 meses e aprendi a comer sem culpa. O Espaco de Retorno mudou tudo." — M.J., Maputo\n\n"Uso a comida que ja tenho em casa — xima, matapa, feijao nhemba." — A.B., Beira\n\nO teu codigo ainda esta activo:\nVEMVITALIS20 — 20% desconto\n\nhttps://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20\n\n— Vivianne`,
  },
  'ultima-chance': {
    nome: 'Ultima Chance',
    metaTemplate: 'ultima_chance',
    grupo: 'sequencia',
    texto: (nome) =>
      `Ola ${nome || ''}! Ja passou um mes. Mulheres que comecaram o VITALIS ja:\n\n- Perderam 2-4kg na primeira semana\n- Aprenderam a medir porcoes sem balanca\n- Descobriram o Espaco de Retorno\n- Construiram habitos que duram — com comida mocambicana\n\nA unica diferenca entre elas e tu? Elas comecaram.\n\nULTIMA OPORTUNIDADE\nVEMVITALIS20 — 20% desconto\nDe 2.500 por 2.000 MZN/mes\n7 dias de garantia. Zero risco.\n\nhttps://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20\n\n— Vivianne`,
  },
  // --- Utilitarios ---
  'lembrete-app': {
    nome: 'Lembrete App',
    metaTemplate: 'lembrete_app',
    grupo: 'util',
    texto: (nome) =>
      `Ola ${nome || 'querida'}! Ja la vao uns dias desde o teu ultimo registo. Cada pequeno passo conta. Que tal registares algo hoje? Mesmo que seja so a agua.\n\nhttps://app.seteecos.com/vitalis\n\n— Vivianne`,
  },
  'motivacao': {
    nome: 'Motivacao',
    metaTemplate: 'motivacao',
    grupo: 'util',
    texto: (nome) =>
      `Ola ${nome || ''}! Sei que estes dias nao foram faceis.\n\n"A diferenca entre quem transforma o corpo e quem desiste nao e forca de vontade. E ter alguem que nao desiste de ti."\n\nEu nao desisti de ti.\n\nTodo o teu progresso esta guardado. Um check-in de 30 segundos ja e uma vitoria.\n\nhttps://app.seteecos.com/vitalis\n\nQueres falar? Responde aqui. Sem julgamento.\n\n— Vivianne`,
  },
  // --- Broadcasts manuais ---
  'follow-up': {
    nome: 'Follow-up',
    metaTemplate: 'follow_up',
    grupo: 'broadcast',
    texto: (nome) =>
      `Ola ${nome || ''}! Passaste por aqui e quero saber como estas. O VITALIS tem ajudado muitas mulheres a encontrar o equilibrio com a comida, sem dietas malucas.\n\nQueres saber mais? Responde aqui.\n\n— Vivianne`,
  },
  'promo': {
    nome: 'Promo 20%',
    metaTemplate: 'promo',
    grupo: 'broadcast',
    texto: (nome) =>
      `Ola ${nome || ''}! Presente especial: usa o codigo VEMVITALIS20 e tem 20% de desconto no VITALIS.\n\nDe 2.500 por 2.000 MZN/mes.\n\nhttps://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20\n\nSo ate ao fim do mes!\n\n— Vivianne`,
  },
  'novidade': {
    nome: 'Novidade',
    metaTemplate: 'novidade',
    grupo: 'broadcast',
    texto: (nome) =>
      `Ola ${nome || ''}! Temos novidades no Sete Ecos! Novos recursos, novas funcionalidades.\n\nhttps://app.seteecos.com\n\nQualquer duvida, estou aqui.\n\n— Vivianne`,
  },
  'curiosidade': {
    nome: 'Curiosidade',
    metaTemplate: 'curiosidade',
    grupo: 'broadcast',
    texto: (nome) =>
      `Ola ${nome || ''}! Faz este exercicio: antes de comeres algo, poe a mao no peito e pergunta "estou mesmo com fome ou estou a sentir algo?"\n\nSe a resposta for "estou a sentir algo" — parabens, descobriste o padrao que 87% das mulheres ignoram. E o efeito ioio. Nao e a comida. E a emocao.\n\nO VITALIS tem o Espaco de Retorno — feito para estes momentos.\n\nVEMVITALIS20 — 20% desconto\nhttps://app.seteecos.com/vitalis/pagamento?code=VEMVITALIS20\n\n— Vivianne`,
  },
  personalizado: {
    nome: 'Personalizado',
    metaTemplate: null,
    grupo: 'broadcast',
    texto: () => '',
  },
};

// ===== GRUPOS DE BROADCAST =====

const WA_GRUPOS = [
  { id: 'todos', nome: 'Todos os contactos', desc: 'Todos que ja falaram no WhatsApp' },
  { id: 'leads', nome: 'Leads (nao convertidos)', desc: 'Contactaram mas nao sao clientes' },
  { id: 'interessados-precos', nome: 'Interessados em precos', desc: 'Perguntaram precos, pagamento ou trial' },
  { id: 'interessados-vitalis', nome: 'Interessados no VITALIS', desc: 'Mostraram interesse no VITALIS' },
  { id: 'recentes', nome: 'Recentes (30 dias)', desc: 'Ultima mensagem nos ultimos 30 dias' },
];

// ===== EMAIL TEMPLATES =====

const EMAIL_TEMPLATES = [
  { id: 'catalogo', nome: 'Catalogo Completo', desc: 'Apresenta todos os servicos Sete Ecos com precos e bundles' },
  { id: 'promo', nome: 'Promo 20% Desconto', desc: 'Codigo VEMVITALIS20 com CTA directo para pagamento' },
  { id: 'convite-whatsapp', nome: 'Convite WhatsApp', desc: 'Convida a juntar-se ao WhatsApp Business da Vivianne' },
];

const EMAIL_AUDIENCIAS = [
  { id: 'todos', nome: 'Todos', desc: 'Waitlist + registados + expirados' },
  { id: 'waitlist', nome: 'Waitlist', desc: 'Leads que ainda nao subscreveram' },
  { id: 'registados', nome: 'Registados sem sub', desc: 'Users sem subscricao activa' },
  { id: 'expirados', nome: 'Expirados', desc: 'Clientes expirados ou cancelados (win-back)' },
];

// ===== COMPONENTE PRINCIPAL =====

export default function CoachBroadcast() {
  const [tab, setTab] = useState('whatsapp');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const [confirmar, setConfirmar] = useState(null); // { tipo, dados, descricao }

  // WhatsApp state
  const [contactos, setContactos] = useState([]);
  const [loadingContactos, setLoadingContactos] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState(new Set());
  const [waTemplate, setWaTemplate] = useState('convite-trial');
  const [waCustomMsg, setWaCustomMsg] = useState('');
  const [waGrupo, setWaGrupo] = useState('');
  const [waModo, setWaModo] = useState('grupo');
  const [waUsarTemplate, setWaUsarTemplate] = useState(true);
  const [filtro, setFiltro] = useState('');

  // Email state
  const [emailTemplate, setEmailTemplate] = useState('catalogo');
  const [emailAudiencia, setEmailAudiencia] = useState('todos');

  // Historico state
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
      console.error('Erro ao carregar historico:', err);
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

  // ===== CONTAGEM DE AUDIENCIA =====

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

  // ===== PEDIR CONFIRMACAO WHATSAPP =====

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
      setErro('Seleciona um grupo ou contactos individuais');
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

      // Extra params para template Meta
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

  // ===== PEDIR CONFIRMACAO EMAIL =====

  const pedirConfirmacaoEmail = () => {
    setErro(null);
    setResultado(null);
    const tmpl = EMAIL_TEMPLATES.find(t => t.id === emailTemplate);
    const aud = EMAIL_AUDIENCIAS.find(a => a.id === emailAudiencia);
    setConfirmar({
      tipo: 'email',
      descricao: `Enviar email "${tmpl?.nome}" para audiencia "${aud?.nome}"`,
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

  // ===== TOGGLE SELECAO =====

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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <Link to="/coach" className="text-sm text-[#7C8B6F] hover:underline">&larr; Dashboard</Link>
            <h1 className="text-xl font-bold text-[#4A4035] dark:text-white mt-1">Centro de Broadcast</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp, Email e Instagram</p>
          </div>
          {tab === 'whatsapp' && !loadingContactos && (
            <div className="text-right">
              <p className="text-2xl font-bold text-[#7C8B6F]">{contactos.length}</p>
              <p className="text-xs text-gray-500">contactos</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmacao */}
      {confirmar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[#4A4035] dark:text-white mb-2">Confirmar envio</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{confirmar.descricao}</p>

            {confirmar.dados?.count && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  Vao ser enviadas {confirmar.dados.count} mensagens. Tempo estimado: ~{Math.ceil(confirmar.dados.count * 3 / 60)} min
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmar(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={confirmar.tipo === 'whatsapp' ? confirmarEnvioWA : confirmarEnvioEmail}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold ${
                  confirmar.tipo === 'whatsapp' ? 'bg-[#25D366] hover:bg-[#20bd5a]' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirmar Envio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="flex gap-2 mb-4">
          {[
            { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
            { id: 'email', label: 'Email', icon: '📧' },
            { id: 'instagram', label: 'Instagram', icon: '📸' },
            { id: 'historico', label: 'Historico', icon: '📋' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setResultado(null); setErro(null); }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-[#7C8B6F] text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="mr-1">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {erro && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
            {erro}
          </div>
        )}
        {resultado && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 text-sm">
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
          <div className="space-y-4">
            {/* Modo de envio */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-[#4A4035] dark:text-white mb-3">Modo de envio</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setWaModo('grupo')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    waModo === 'grupo' ? 'bg-green-100 text-green-800 ring-2 ring-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Por grupo
                </button>
                <button
                  onClick={() => setWaModo('selecionar')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    waModo === 'selecionar' ? 'bg-green-100 text-green-800 ring-2 ring-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Selecionar contactos
                </button>
              </div>

              {/* Grupo */}
              {waModo === 'grupo' && (
                <div className="mt-3 space-y-2">
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
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          waGrupo === g.id ? 'bg-green-50 dark:bg-green-900/20 ring-1 ring-green-300' : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="grupo"
                          value={g.id}
                          checked={waGrupo === g.id}
                          onChange={() => setWaGrupo(g.id)}
                          className="mt-1 accent-green-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#4A4035] dark:text-white">{g.nome}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{g.desc}</p>
                        </div>
                        <span className="text-sm font-bold text-[#7C8B6F] bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Selecionar contactos */}
              {waModo === 'selecionar' && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Filtrar por nome, numero ou interesse..."
                      value={filtro}
                      onChange={e => setFiltro(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#4A4035] dark:text-white"
                    />
                    <button
                      onClick={selectAll}
                      className="px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 text-gray-600 dark:text-gray-300"
                    >
                      {selectedNumbers.size === contactosFiltrados.length ? 'Desmarcar' : 'Selecionar'} todos
                    </button>
                  </div>

                  {loadingContactos ? (
                    <p className="text-sm text-gray-500 py-4 text-center">A carregar contactos...</p>
                  ) : contactosFiltrados.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">Nenhum contacto encontrado</p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                      <p className="text-xs text-gray-400 mb-1">{contactosFiltrados.length} contactos | {selectedNumbers.size} seleccionados</p>
                      {contactosFiltrados.map(c => (
                        <label
                          key={c.telefone}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-all ${
                            selectedNumbers.has(c.telefone) ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedNumbers.has(c.telefone)}
                            onChange={() => toggleNumber(c.telefone)}
                            className="accent-green-600"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-[#4A4035] dark:text-white">
                              {c.nome || 'Sem nome'}
                            </span>
                            <span className="text-gray-400 ml-2">+{c.telefone}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-xs text-gray-400">{c.total_mensagens} msg</span>
                            {c.interessou_precos && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded-full">Precos</span>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-[#4A4035] dark:text-white mb-3">Mensagem</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(WA_TEMPLATES).map(([id, t]) => (
                  <button
                    key={id}
                    onClick={() => setWaTemplate(id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      waTemplate === id
                        ? 'bg-[#25D366] text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {t.nome}
                  </button>
                ))}
              </div>

              {waTemplate === 'personalizado' ? (
                <textarea
                  value={waCustomMsg}
                  onChange={e => setWaCustomMsg(e.target.value)}
                  placeholder="Escreve a tua mensagem aqui... Usa o tom da Vivianne: directo, humano, sem formalidades."
                  rows={5}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#4A4035] dark:text-white resize-none"
                />
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm text-[#4A4035] dark:text-gray-200 whitespace-pre-wrap">
                  {previewMensagem}
                </div>
              )}

              {/* Opcao Meta Template */}
              {waTemplate !== 'personalizado' && (
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={waUsarTemplate}
                    onChange={e => setWaUsarTemplate(e.target.checked)}
                    className="accent-green-600"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Usar Meta Template (funciona fora das 24h — requer template aprovado na Meta)
                  </span>
                </label>
              )}

              <p className="text-xs text-gray-400 mt-2">
                {audienciaCount > 0 && (
                  <span className="font-medium text-[#7C8B6F]">{audienciaCount} destinatarios</span>
                )}
                {audienciaCount > 0 && ' | '}
                {waUsarTemplate && waTemplate !== 'personalizado'
                  ? 'Envia como Meta Template (funciona sempre)'
                  : 'Texto livre (so funciona dentro de 24h da ultima conversa)'}
              </p>
            </div>

            {/* Botao enviar */}
            <button
              onClick={pedirConfirmacaoWA}
              disabled={loading || audienciaCount === 0}
              className="w-full py-3 rounded-xl text-white font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#25D366] hover:bg-[#20bd5a] shadow-md"
            >
              {loading
                ? 'A enviar...'
                : `Enviar WhatsApp para ${audienciaCount} contacto${audienciaCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}

        {/* ===== TAB: EMAIL ===== */}
        {tab === 'email' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-[#4A4035] dark:text-white mb-3">Template de Email</h3>
              <div className="space-y-2">
                {EMAIL_TEMPLATES.map(t => (
                  <label
                    key={t.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      emailTemplate === t.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-300' : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="emailTemplate"
                      value={t.id}
                      checked={emailTemplate === t.id}
                      onChange={() => setEmailTemplate(t.id)}
                      className="mt-1 accent-blue-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-[#4A4035] dark:text-white">{t.nome}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-[#4A4035] dark:text-white mb-3">Audiencia</h3>
              <div className="space-y-2">
                {EMAIL_AUDIENCIAS.map(a => (
                  <label
                    key={a.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      emailAudiencia === a.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-300' : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="emailAudiencia"
                      value={a.id}
                      checked={emailAudiencia === a.id}
                      onChange={() => setEmailAudiencia(a.id)}
                      className="mt-1 accent-blue-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-[#4A4035] dark:text-white">{a.nome}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{a.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={pedirConfirmacaoEmail}
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 shadow-md"
            >
              {loading ? 'A enviar...' : `Enviar Email: ${EMAIL_TEMPLATES.find(t => t.id === emailTemplate)?.nome}`}
            </button>
          </div>
        )}

        {/* ===== TAB: INSTAGRAM ===== */}
        {tab === 'instagram' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
              <p className="text-4xl mb-3">📸</p>
              <h3 className="text-lg font-semibold text-[#4A4035] dark:text-white mb-2">Agendamento Instagram</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Agenda posts, stories, reels e carroseis para Instagram e Facebook.
              </p>
              <Link
                to="/coach/social"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
              >
                Abrir Agendador Social
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-[#4A4035] dark:text-white mb-2">Funcionalidades disponiveis</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Publicar fotos com legenda
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Carroseis (2-10 imagens)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Stories
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Reels (video ate 90s)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Agendar para publicacao futura
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Facebook + Instagram no mesmo painel
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ===== TAB: HISTORICO ===== */}
        {tab === 'historico' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#4A4035] dark:text-white">Historico de envios</h3>
                <button
                  onClick={carregarHistorico}
                  disabled={loadingHistorico}
                  className="text-xs text-[#7C8B6F] hover:underline disabled:opacity-50"
                >
                  {loadingHistorico ? 'A carregar...' : 'Actualizar'}
                </button>
              </div>

              {loadingHistorico ? (
                <p className="text-sm text-gray-500 py-8 text-center">A carregar historico...</p>
              ) : historico.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">Nenhum envio registado ainda</p>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {historico.map((log, i) => (
                    <div
                      key={log.id || i}
                      className={`p-3 rounded-lg border text-sm ${
                        log.status === 'enviado'
                          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-[#4A4035] dark:text-white">
                          +{log.telefone}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
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
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
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
