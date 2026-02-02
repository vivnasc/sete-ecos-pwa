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
  LEMBRETES_DEFAULT
} from '../../utils/notifications.js';

export default function NotificacoesConfig() {
  const [permissao, setPermissao] = useState(temPermissao());
  const [lembretes, setLembretes] = useState(carregarLembretes());
  const [saved, setSaved] = useState(false);

  const suportado = notificacoesSuportadas();

  const handlePedirPermissao = async () => {
    const resultado = await pedirPermissao();
    setPermissao(resultado);
    if (resultado) {
      // Enviar notificação de teste
      enviarNotificacao('🎉 Notificações activadas!', {
        body: 'Agora vais receber lembretes para manter o foco.',
        tag: 'vitalis-welcome'
      });
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
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetar = () => {
    setLembretes(LEMBRETES_DEFAULT);
    guardarLembretes(LEMBRETES_DEFAULT);
  };

  const getNomeTipo = (tipo) => {
    const nomes = {
      agua: '💧 Água',
      pequenoAlmoco: '🌅 Pequeno-almoço',
      almoco: '🍽️ Almoço',
      jantar: '🌙 Jantar',
      checkin: '✅ Check-in',
      treino: '🏃‍♀️ Treino',
      motivacao: '✨ Motivação'
    };
    return nomes[tipo] || tipo;
  };

  // Agrupar lembretes por tipo
  const lembretesAgua = lembretes.filter(l => l.tipo === 'agua');
  const lembretesRefeicoes = lembretes.filter(l => ['pequenoAlmoco', 'almoco', 'jantar'].includes(l.tipo));
  const lembretesOutros = lembretes.filter(l => !['agua', 'pequenoAlmoco', 'almoco', 'jantar'].includes(l.tipo));

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

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

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
                      ? 'Vais receber lembretes nos horários definidos'
                      : 'Activa para receber lembretes'
                  }
                </p>
              </div>
            </div>
            {suportado && !permissao && (
              <button
                onClick={handlePedirPermissao}
                className="px-4 py-2 bg-[#7C8B6F] text-white rounded-lg font-medium hover:bg-[#6B7A5D] transition-colors"
              >
                Activar
              </button>
            )}
          </div>
        </div>

        {permissao && (
          <>
            {/* Lembretes de Água */}
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">💧</span>
                <h3 className="font-bold text-gray-800">Lembretes de Água</h3>
              </div>
              <div className="space-y-3">
                {lembretesAgua.map((lembrete, i) => {
                  const globalIndex = lembretes.findIndex(l => l === lembrete);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleLembrete(globalIndex)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            lembrete.activo
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {lembrete.activo && '✓'}
                        </button>
                        <span className="text-gray-700">Lembrete {i + 1}</span>
                      </div>
                      <input
                        type="time"
                        value={lembrete.hora}
                        onChange={(e) => alterarHora(globalIndex, e.target.value)}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-center"
                        disabled={!lembrete.activo}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lembretes de Refeições */}
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🍽️</span>
                <h3 className="font-bold text-gray-800">Lembretes de Refeições</h3>
              </div>
              <div className="space-y-3">
                {lembretesRefeicoes.map((lembrete, i) => {
                  const globalIndex = lembretes.findIndex(l => l === lembrete);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleLembrete(globalIndex)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            lembrete.activo
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {lembrete.activo && '✓'}
                        </button>
                        <span className="text-gray-700">{getNomeTipo(lembrete.tipo)}</span>
                      </div>
                      <input
                        type="time"
                        value={lembrete.hora}
                        onChange={(e) => alterarHora(globalIndex, e.target.value)}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-center"
                        disabled={!lembrete.activo}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Outros Lembretes */}
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⏰</span>
                <h3 className="font-bold text-gray-800">Outros Lembretes</h3>
              </div>
              <div className="space-y-3">
                {lembretesOutros.map((lembrete, i) => {
                  const globalIndex = lembretes.findIndex(l => l === lembrete);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleLembrete(globalIndex)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            lembrete.activo
                              ? 'bg-purple-500 border-purple-500 text-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {lembrete.activo && '✓'}
                        </button>
                        <span className="text-gray-700">{getNomeTipo(lembrete.tipo)}</span>
                      </div>
                      <input
                        type="time"
                        value={lembrete.hora}
                        onChange={(e) => alterarHora(globalIndex, e.target.value)}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-center"
                        disabled={!lembrete.activo}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botões de Acção */}
            <div className="flex gap-3">
              <button
                onClick={guardar}
                className="flex-1 py-3 bg-[#7C8B6F] text-white rounded-xl font-semibold hover:bg-[#6B7A5D] transition-colors"
              >
                {saved ? '✓ Guardado!' : 'Guardar Alterações'}
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
              onClick={() => enviarNotificacao('🧪 Teste de notificação', {
                body: 'Se estás a ver isto, as notificações estão a funcionar!',
                tag: 'vitalis-test'
              })}
              className="w-full py-3 bg-white border-2 border-dashed border-gray-300 text-gray-600 rounded-xl font-medium hover:border-[#7C8B6F] hover:text-[#7C8B6F] transition-colors"
            >
              🔔 Testar Notificação
            </button>
          </>
        )}

        {/* Info */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-medium text-blue-800 mb-1">Dica</p>
              <p className="text-sm text-blue-700">
                Para receber notificações mesmo com o browser fechado, adiciona a app ao ecrã inicial do teu telemóvel (Instalar como PWA).
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
