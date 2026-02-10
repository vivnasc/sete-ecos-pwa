// src/components/vitalis/NotificacoesConfig.jsx
// Componente para configurar notificações e lembretes

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  notificacoesSuportadas,
  pedirPermissao,
  temPermissao,
  enviarNotificacao,
  NOTIFICACOES,
  carregarLembretes,
  guardarLembretes,
  activarLembretes,
  contarLembretesHoje,
  LEMBRETES_DEFAULT
} from '../../utils/notifications.js';

export default function NotificacoesConfig() {
  const [permissao, setPermissao] = useState(temPermissao());
  const [lembretes, setLembretes] = useState(carregarLembretes());
  const [saved, setSaved] = useState(false);
  const [aPedir, setAPedir] = useState(false);
  const [lembretesAgendados, setLembretesAgendados] = useState(0);

  const suportado = 'Notification' in window;

  useEffect(() => {
    if (permissao) {
      setLembretesAgendados(contarLembretesHoje());
    }
  }, [permissao]);

  const handlePedirPermissao = async () => {
    if (aPedir) return;
    setAPedir(true);

    try {
      const resultado = await pedirPermissao();
      setPermissao(resultado);

      if (resultado) {
        // Activar lembretes e enviar confirmação
        const timeouts = activarLembretes();
        setLembretesAgendados(timeouts.length);

        setTimeout(() => {
          enviarNotificacao('Notificações activadas!', {
            body: `${timeouts.length} lembretes agendados para hoje. Vais receber alertas!`,
            tag: 'vitalis-welcome'
          });
        }, 500);
      } else {
        alert('Permissão de notificações negada. Podes activar nas definições do browser.');
      }
    } catch (error) {
      console.error('Erro ao pedir permissão:', error);
      alert('Erro ao pedir permissão. Tenta novamente.');
    } finally {
      setAPedir(false);
    }
  };

  const toggleLembrete = (index) => {
    const novos = [...lembretes];
    novos[index].activo = !novos[index].activo;
    setLembretes(novos);
  };

  const alterarHora = (index, novaHora) => {
    const novos = [...lembretes];
    novos[index].hora = novaHora;
    setLembretes(novos);
  };

  const guardar = () => {
    guardarLembretes(lembretes);
    // CRITICAL: Actually activate the reminders after saving
    const timeouts = activarLembretes();
    setLembretesAgendados(timeouts.length);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const resetar = () => {
    setLembretes(LEMBRETES_DEFAULT);
    guardarLembretes(LEMBRETES_DEFAULT);
    const timeouts = activarLembretes();
    setLembretesAgendados(timeouts.length);
  };

  const adicionarLembrete = (tipo) => {
    const novos = [...lembretes, { tipo, hora: '10:00', activo: true, label: NOTIFICACOES[tipo]?.titulo?.replace(/^[^\s]+\s/, '') || tipo }];
    setLembretes(novos);
  };

  const removerLembrete = (index) => {
    const novos = lembretes.filter((_, i) => i !== index);
    setLembretes(novos);
  };

  const getNomeTipo = (tipo) => {
    const nomes = {
      agua: '💧 Água',
      pequenoAlmoco: '🌅 Pequeno-almoço',
      almoco: '🍽️ Almoço',
      jantar: '🌙 Jantar',
      prepAlmoco: '🔪 Prep almoço',
      prepJantar: '🔪 Prep jantar',
      checkin: '✅ Check-in',
      treino: '🏃‍♀️ Treino',
      motivacao: '✨ Motivação',
      streak: '🔥 Streak'
    };
    return nomes[tipo] || tipo;
  };

  const getCorTipo = (tipo) => {
    if (tipo === 'agua') return { bg: 'bg-blue-50', border: 'border-blue-200', toggle: 'bg-blue-500 border-blue-500' };
    if (tipo.startsWith('prep')) return { bg: 'bg-amber-50', border: 'border-amber-200', toggle: 'bg-amber-500 border-amber-500' };
    if (['pequenoAlmoco', 'almoco', 'jantar'].includes(tipo)) return { bg: 'bg-orange-50', border: 'border-orange-200', toggle: 'bg-orange-500 border-orange-500' };
    return { bg: 'bg-purple-50', border: 'border-purple-200', toggle: 'bg-purple-500 border-purple-500' };
  };

  // Agrupar lembretes
  const lembretesAgua = lembretes.map((l, i) => ({ ...l, idx: i })).filter(l => l.tipo === 'agua');
  const lembretesRefeicoes = lembretes.map((l, i) => ({ ...l, idx: i })).filter(l => ['pequenoAlmoco', 'almoco', 'jantar'].includes(l.tipo));
  const lembretesPrep = lembretes.map((l, i) => ({ ...l, idx: i })).filter(l => l.tipo.startsWith('prep'));
  const lembretesOutros = lembretes.map((l, i) => ({ ...l, idx: i })).filter(l => !['agua', 'pequenoAlmoco', 'almoco', 'jantar'].includes(l.tipo) && !l.tipo.startsWith('prep'));

  const activos = lembretes.filter(l => l.activo).length;

  const renderGrupo = (titulo, emoji, items, tipoAdd) => (
    <div className="bg-white rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <h3 className="font-bold text-gray-800">{titulo}</h3>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {items.filter(l => l.activo).length}/{items.length}
          </span>
        </div>
        {tipoAdd && (
          <button
            onClick={() => adicionarLembrete(tipoAdd)}
            className="text-sm text-[#7C8B6F] font-medium hover:text-[#6B7A5D]"
          >
            + Adicionar
          </button>
        )}
      </div>
      <div className="space-y-2">
        {items.map((lembrete) => {
          const cores = getCorTipo(lembrete.tipo);
          return (
            <div key={lembrete.idx} className={`flex items-center justify-between p-3 ${cores.bg} rounded-xl border ${cores.border}`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleLembrete(lembrete.idx)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    lembrete.activo ? `${cores.toggle} text-white` : 'border-gray-300'
                  }`}
                >
                  {lembrete.activo && '✓'}
                </button>
                <span className="text-gray-700 text-sm">{lembrete.label || getNomeTipo(lembrete.tipo)}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={lembrete.hora}
                  onChange={(e) => alterarHora(lembrete.idx, e.target.value)}
                  className="px-2 py-1 border border-gray-200 rounded-lg text-center text-sm"
                  disabled={!lembrete.activo}
                />
                {items.length > 1 && (
                  <button
                    onClick={() => removerLembrete(lembrete.idx)}
                    className="w-6 h-6 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center text-xs transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] text-white p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/vitalis/dashboard" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-bold">Notificações</h1>
              <p className="text-white/80 text-sm">Configura os teus lembretes</p>
            </div>
          </div>
          <span className="text-2xl">🔔</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Status das Notificações */}
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                permissao ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {permissao ? '🔔' : '🔕'}
              </div>
              <div>
                <h2 className="font-bold text-gray-800">
                  {!suportado ? 'Não suportado' : permissao ? 'Notificações activas' : 'Notificações desligadas'}
                </h2>
                <p className="text-sm text-gray-500">
                  {!suportado
                    ? 'O teu browser não suporta notificações'
                    : permissao
                      ? `${activos} lembretes activos · ${lembretesAgendados} agendados para hoje`
                      : 'Activa para receber lembretes de água, refeições e check-in'
                  }
                </p>
              </div>
            </div>
            {suportado && !permissao && (
              <button
                onClick={handlePedirPermissao}
                disabled={aPedir}
                className="px-4 py-2 bg-[#7C8B6F] text-white rounded-lg font-medium hover:bg-[#6B7A5D] transition-colors disabled:opacity-50"
              >
                {aPedir ? 'A activar...' : 'Activar'}
              </button>
            )}
          </div>
        </div>

        {permissao && (
          <>
            {renderGrupo('Lembretes de Água', '💧', lembretesAgua, 'agua')}
            {renderGrupo('Lembretes de Refeições', '🍽️', lembretesRefeicoes, null)}
            {lembretesPrep.length > 0 && renderGrupo('Preparação (30 min antes)', '🔪', lembretesPrep, null)}
            {renderGrupo('Outros Lembretes', '⏰', lembretesOutros, 'motivacao')}

            {/* Botões de Acção */}
            <div className="flex gap-3">
              <button
                onClick={guardar}
                className="flex-1 py-3 bg-[#7C8B6F] text-white rounded-xl font-semibold hover:bg-[#6B7A5D] transition-colors"
              >
                {saved ? `✓ Guardado! ${lembretesAgendados} agendados` : 'Guardar e Activar'}
              </button>
              <button
                onClick={resetar}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Resetar
              </button>
            </div>

            {/* Testar Notificação */}
            <button
              onClick={() => enviarNotificacao('Teste de notificação', {
                body: 'Se estás a ver isto, as notificações estão a funcionar!',
                tag: 'vitalis-test'
              })}
              className="w-full py-3 bg-white border-2 border-dashed border-gray-300 text-gray-600 rounded-xl font-medium hover:border-[#7C8B6F] hover:text-[#7C8B6F] transition-colors"
            >
              🔔 Testar Notificação Agora
            </button>
          </>
        )}

        {/* Info */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-medium text-blue-800 mb-1">Como funcionam</p>
              <p className="text-sm text-blue-700 mb-2">
                Os lembretes são agendados sempre que abres a app. Para receberes notificações mesmo em segundo plano:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5">📱</span>
                  <span><strong>Instala como app</strong> — toca "Adicionar ao ecrã inicial" (a app fica activa em background)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5">🔋</span>
                  <span><strong>Não feches a app</strong> — minimiza em vez de fechar para os lembretes continuarem</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
