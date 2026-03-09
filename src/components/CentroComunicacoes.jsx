import React, { useState, useEffect, useMemo } from 'react';
import { coachApi } from '../lib/coachApi';

const TIPO_LABELS = {
  'lembrete-checkin': 'Lembrete check-in',
  'motivacao-intensa': 'Motivacao intensa',
  'inactividade-7d': 'Marco 7 dias',
  'inactividade-14d': 'Marco 14 dias',
  'inactividade-30d': 'Marco 30 dias',
  'expiracao-aviso': 'Aviso expiracao',
  'curiosidade-insana': 'Curiosidade',
  'winback': 'Win-back',
  'coach-resumo-diario': 'Resumo coach',
  'boas-vindas': 'Boas-vindas',
  'confirmacao-pagamento': 'Pagamento',
  'trial_expiring_3d': 'Trial -3 dias',
  'trial_expiring_1d': 'Trial -1 dia',
  'trial_expired': 'Trial expirado',
  'trial_winback_3d': 'Win-back +3 dias',
  'sequencia-dia-0': 'Sequencia dia 0',
  'sequencia-dia-1': 'Sequencia dia 1',
  'sequencia-dia-3': 'Sequencia dia 3',
  'sequencia-dia-7': 'Sequencia dia 7',
  'sequencia-dia-14': 'Sequencia dia 14',
  'sequencia-dia-21': 'Sequencia dia 21',
  'sequencia-dia-30': 'Sequencia dia 30',
  'individual': 'Manual',
  'broadcast': 'Broadcast',
  'cron-tarefas': 'Automatico',
  'cron-wa-sequencia': 'Sequencia WA',
  'cron-wa-leads': 'Follow-up leads',
};

function tipoLabel(tipo) {
  return TIPO_LABELS[tipo] || tipo || 'Desconhecido';
}

function canalIcon(canal) {
  if (canal === 'whatsapp') return '💬';
  return '📧';
}

function tempoRelativo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const dias = Math.floor(hrs / 24);
  return `${dias}d`;
}

function formatarData(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

export default function CentroComunicacoes() {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState(null);
  const [dias, setDias] = useState(7);
  const [filtroCanal, setFiltroCanal] = useState('todos');
  const [erro, setErro] = useState(null);

  const carregar = async (d) => {
    setLoading(true);
    setErro(null);
    try {
      const result = await coachApi.centroComunicacoes({ dias: d, canal: 'todos' });
      setDados(result);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(dias); }, [dias]);

  const listaUnificada = useMemo(() => {
    if (!dados) return [];
    const items = [];

    if (filtroCanal === 'todos' || filtroCanal === 'email') {
      for (const e of dados.emails || []) {
        items.push({
          canal: 'email',
          tipo: e.tipo,
          destinatario: e.destinatario,
          fonte: e.fonte,
          status: 'enviado',
          data: e.data,
        });
      }
    }

    if (filtroCanal === 'todos' || filtroCanal === 'whatsapp') {
      for (const w of dados.whatsapp || []) {
        items.push({
          canal: 'whatsapp',
          tipo: w.tipo,
          destinatario: w.telefone,
          mensagem: w.mensagem,
          status: w.status,
          erro: w.erro,
          data: w.data,
        });
      }
    }

    items.sort((a, b) => new Date(b.data) - new Date(a.data));
    return items;
  }, [dados, filtroCanal]);

  // Resumo por tipo para a vista de resumo
  const resumoPorTipo = useMemo(() => {
    if (!dados?.porTipo) return [];
    return Object.entries(dados.porTipo)
      .map(([tipo, count]) => ({ tipo, count, label: tipoLabel(tipo) }))
      .sort((a, b) => b.count - a.count);
  }, [dados]);

  // Resumo por dia
  const resumoPorDia = useMemo(() => {
    if (!dados?.porDia) return [];
    return Object.entries(dados.porDia)
      .map(([dia, stats]) => ({ dia, ...stats }))
      .sort((a, b) => b.dia.localeCompare(a.dia));
  }, [dados]);

  if (loading && !dados) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-1.5">
          {[3, 7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDias(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                dias === d
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'email', label: '📧 Email' },
            { key: 'whatsapp', label: '💬 WhatsApp' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFiltroCanal(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filtroCanal === f.key
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => carregar(dias)}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 ml-auto"
        >
          {loading ? 'A carregar...' : 'Actualizar'}
        </button>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          Erro: {erro}
        </div>
      )}

      {/* Resumo rápido */}
      {dados && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{dados.resumo?.emails || 0}</p>
            <p className="text-xs text-blue-600">Emails</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{dados.resumo?.whatsapp || 0}</p>
            <p className="text-xs text-green-600">WhatsApp</p>
          </div>
          <div className={`rounded-xl p-3 text-center border ${
            (dados.resumo?.erros || 0) > 0
              ? 'bg-red-50 border-red-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-2xl font-bold ${(dados.resumo?.erros || 0) > 0 ? 'text-red-700' : 'text-gray-400'}`}>
              {dados.resumo?.erros || 0}
            </p>
            <p className={`text-xs ${(dados.resumo?.erros || 0) > 0 ? 'text-red-600' : 'text-gray-500'}`}>Erros</p>
          </div>
        </div>
      )}

      {/* Actividade por dia */}
      {resumoPorDia.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-700">Actividade por dia</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-[200px] overflow-y-auto">
            {resumoPorDia.map(d => {
              const total = d.emails + d.whatsapp;
              const maxBar = Math.max(...resumoPorDia.map(x => x.emails + x.whatsapp), 1);
              return (
                <div key={d.dia} className="flex items-center gap-3 px-4 py-2">
                  <span className="text-xs text-gray-500 w-12 flex-shrink-0 font-mono">
                    {d.dia.slice(5)}
                  </span>
                  <div className="flex-1 flex items-center gap-1 min-w-0">
                    {d.emails > 0 && (
                      <div
                        className="h-4 bg-blue-400 rounded-sm"
                        style={{ width: `${(d.emails / maxBar) * 100}%`, minWidth: 4 }}
                        title={`${d.emails} emails`}
                      />
                    )}
                    {d.whatsapp > 0 && (
                      <div
                        className="h-4 bg-green-400 rounded-sm"
                        style={{ width: `${(d.whatsapp / maxBar) * 100}%`, minWidth: 4 }}
                        title={`${d.whatsapp} WhatsApp`}
                      />
                    )}
                    {d.erros > 0 && (
                      <div
                        className="h-4 bg-red-400 rounded-sm"
                        style={{ width: `${(d.erros / maxBar) * 100}%`, minWidth: 4 }}
                        title={`${d.erros} erros`}
                      />
                    )}
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">{total}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resumo por tipo */}
      {resumoPorTipo.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-700">Por tipo de comunicacao</h3>
          </div>
          <div className="flex flex-wrap gap-1.5 p-3">
            {resumoPorTipo.slice(0, 12).map(t => (
              <span
                key={t.tipo}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
              >
                <span className="font-medium">{t.label}</span>
                <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                  {t.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Lista detalhada */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-700">
            Historico detalhado ({listaUnificada.length})
          </h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
          {listaUnificada.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Sem comunicacoes nos ultimos {dias} dias
            </div>
          ) : (
            listaUnificada.slice(0, 100).map((item, i) => (
              <div
                key={`${item.canal}-${item.data}-${i}`}
                className={`flex items-start gap-2.5 px-4 py-2.5 text-sm ${
                  item.status === 'erro' ? 'bg-red-50/50' : ''
                }`}
              >
                <span className="text-base flex-shrink-0 mt-0.5">{canalIcon(item.canal)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-gray-800 text-xs">{tipoLabel(item.tipo)}</span>
                    {item.fonte && item.fonte !== 'cliente' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {item.fonte}
                      </span>
                    )}
                    {item.status === 'erro' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                        erro
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {item.destinatario}
                    {item.mensagem ? ` — ${item.mensagem}` : ''}
                  </p>
                  {item.erro && (
                    <p className="text-[10px] text-red-500 mt-0.5 truncate">{item.erro}</p>
                  )}
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-[10px] text-gray-400">{tempoRelativo(item.data)}</span>
                  <span className="text-[10px] text-gray-300">{formatarData(item.data)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
