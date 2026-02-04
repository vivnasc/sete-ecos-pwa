import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * ÁUREA - Notificações e Lembretes WhatsApp
 * Mensagens gentis que convidam (nunca culpabilizam)
 */

const LEMBRETES_AUREA = [
  {
    id: 'quota_manha',
    tipo: 'quota',
    titulo: 'Lembrete da Quota',
    descricao: 'Lembra-te do teu compromisso contigo',
    hora: '09:00',
    activo: true,
    icone: '📊'
  },
  {
    id: 'pratica_tarde',
    tipo: 'pratica',
    titulo: 'Micro-Prática',
    descricao: 'Uma prática de 2 minutos para ti',
    hora: '14:00',
    activo: true,
    icone: '✨'
  },
  {
    id: 'reflexao_noite',
    tipo: 'reflexao',
    titulo: 'Reflexão da Noite',
    descricao: 'O que fizeste por ti hoje?',
    hora: '21:00',
    activo: true,
    icone: '🌙'
  }
];

const MENSAGENS_GENTIS = {
  quota: [
    'Olá querida. Já reservaste o teu tempo hoje?',
    'Um lembrete gentil: a tua quota de presença espera por ti.',
    'Hoje já dedicaste algo a ti mesma?',
    'A tua quota é um acto de amor próprio. Já a cumpriste?'
  ],
  pratica: [
    'Que tal uma micro-prática de 2 minutos?',
    '2 minutos para ti mesma. Consegues encontrá-los?',
    'Uma pequena prática pode mudar o teu dia.',
    'Tens 2 minutos? A tua versão mais plena agradece.'
  ],
  reflexao: [
    'O dia está a terminar. O que fizeste por ti?',
    'Antes de dormir: celebra um pequeno "sim" a ti mesma.',
    'Hoje exististe para ti também? Isso é suficiente.',
    'Não precisas de justificar o cuidado contigo. Boa noite.'
  ]
};

export default function NotificacoesAurea() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [lembretes, setLembretes] = useState(LEMBRETES_AUREA);
  const [whatsappNumero, setWhatsappNumero] = useState('');
  const [whatsappActivo, setWhatsappActivo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [permissaoPush, setPermissaoPush] = useState(false);

  useEffect(() => {
    loadData();
    checkPushPermission();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/aurea/login');
        return;
      }

      const { data: uData } = await supabase
        .from('users')
        .select('id, email')
        .eq('auth_id', user.id)
        .single();

      if (uData) {
        setUserId(uData.id);
        setUserData(uData);

        // Load notification preferences
        const { data: prefs } = await supabase
          .from('aurea_clients')
          .select('notificacoes_config, whatsapp_numero, whatsapp_activo')
          .eq('user_id', uData.id)
          .single();

        if (prefs) {
          if (prefs.notificacoes_config) {
            setLembretes(prefs.notificacoes_config);
          }
          setWhatsappNumero(prefs.whatsapp_numero || '');
          setWhatsappActivo(prefs.whatsapp_activo || false);
        }
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkPushPermission = () => {
    if ('Notification' in window) {
      setPermissaoPush(Notification.permission === 'granted');
    }
  };

  const pedirPermissaoPush = async () => {
    if (!('Notification' in window)) {
      alert('O teu browser não suporta notificações push.');
      return;
    }

    const result = await Notification.requestPermission();
    setPermissaoPush(result === 'granted');

    if (result === 'granted') {
      new Notification('ÁUREA', {
        body: 'Notificações activadas! Vais receber lembretes gentis.',
        icon: '/logos/aurea-logo.png'
      });
    }
  };

  const toggleLembrete = (id) => {
    setLembretes(prev => prev.map(l =>
      l.id === id ? { ...l, activo: !l.activo } : l
    ));
  };

  const alterarHora = (id, novaHora) => {
    setLembretes(prev => prev.map(l =>
      l.id === id ? { ...l, hora: novaHora } : l
    ));
  };

  const guardar = async () => {
    setSaving(true);

    try {
      await supabase
        .from('aurea_clients')
        .update({
          notificacoes_config: lembretes,
          whatsapp_numero: whatsappNumero,
          whatsapp_activo: whatsappActivo
        })
        .eq('user_id', userId);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Erro ao guardar:', err);
    } finally {
      setSaving(false);
    }
  };

  const testarNotificacao = () => {
    if (permissaoPush) {
      const msg = MENSAGENS_GENTIS.pratica[Math.floor(Math.random() * MENSAGENS_GENTIS.pratica.length)];
      new Notification('ÁUREA', {
        body: msg,
        icon: '/logos/aurea-logo.png'
      });
    }
  };

  const testarWhatsApp = async () => {
    if (!whatsappNumero) {
      alert('Insere o teu número de WhatsApp primeiro.');
      return;
    }

    try {
      const response = await fetch('/api/whatsapp-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem: `Olá da ÁUREA! Este é um teste de notificação. As mensagens gentis vão chegar aqui.`
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Mensagem de teste enviada! Verifica o teu WhatsApp.');
      } else {
        alert('Não foi possível enviar. Verifica se o WhatsApp está configurado.');
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao enviar teste.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <Link to="/aurea/perfil" className="text-amber-200/60 hover:text-amber-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-amber-100">Notificações</h1>
            <p className="text-amber-200/60 text-sm">Lembretes gentis para ti</p>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-4">
        {/* Push Notifications */}
        <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${permissaoPush ? 'bg-green-500/20' : 'bg-white/10'}`}>
                {permissaoPush ? '🔔' : '🔕'}
              </div>
              <div>
                <h3 className="text-amber-100 font-medium">Notificações Push</h3>
                <p className="text-amber-200/60 text-sm">
                  {permissaoPush ? 'Activas no browser' : 'Desactivadas'}
                </p>
              </div>
            </div>
            {!permissaoPush && (
              <button
                onClick={pedirPermissaoPush}
                className="px-4 py-2 bg-amber-500/20 text-amber-300 rounded-lg text-sm hover:bg-amber-500/30"
              >
                Activar
              </button>
            )}
          </div>
        </div>

        {/* WhatsApp */}
        <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl border border-green-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-xl">📱</span>
            </div>
            <div>
              <h3 className="text-amber-100 font-medium">WhatsApp</h3>
              <p className="text-amber-200/60 text-sm">Recebe lembretes no WhatsApp</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-amber-200/60 text-sm block mb-1">Número WhatsApp</label>
              <input
                type="tel"
                value={whatsappNumero}
                onChange={(e) => setWhatsappNumero(e.target.value)}
                placeholder="+258 84 xxx xxxx"
                className="w-full px-4 py-3 bg-white/10 border border-green-500/30 rounded-xl text-amber-100 placeholder-amber-300/30 focus:outline-none focus:border-green-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-amber-200/80">Activar lembretes WhatsApp</span>
              <button
                onClick={() => setWhatsappActivo(!whatsappActivo)}
                className={`w-14 h-8 rounded-full transition-colors ${whatsappActivo ? 'bg-green-500' : 'bg-white/20'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${whatsappActivo ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <button
              onClick={testarWhatsApp}
              className="w-full py-2 bg-green-500/20 text-green-300 rounded-xl text-sm hover:bg-green-500/30"
            >
              Enviar Teste WhatsApp
            </button>
          </div>
        </div>

        {/* Lembretes */}
        <div className="space-y-3">
          <h3 className="text-amber-100 font-bold">Horários dos Lembretes</h3>

          {lembretes.map(lembrete => (
            <div
              key={lembrete.id}
              className="p-4 bg-white/5 rounded-2xl border border-amber-500/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleLembrete(lembrete.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-colors ${lembrete.activo
                      ? 'bg-amber-500/30 border-2 border-amber-400'
                      : 'bg-white/10 border-2 border-white/20'
                      }`}
                  >
                    {lembrete.icone}
                  </button>
                  <div>
                    <h4 className={`font-medium ${lembrete.activo ? 'text-amber-100' : 'text-amber-200/50'}`}>
                      {lembrete.titulo}
                    </h4>
                    <p className="text-amber-200/50 text-sm">{lembrete.descricao}</p>
                  </div>
                </div>
                <input
                  type="time"
                  value={lembrete.hora}
                  onChange={(e) => alterarHora(lembrete.id, e.target.value)}
                  disabled={!lembrete.activo}
                  className="px-3 py-2 bg-white/10 border border-amber-500/30 rounded-lg text-amber-200 text-center disabled:opacity-50"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Exemplo de mensagem */}
        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30">
          <div className="flex items-start gap-3">
            <span className="text-xl">💬</span>
            <div>
              <p className="text-amber-100 font-medium mb-1">Exemplo de mensagem</p>
              <p className="text-amber-200/70 text-sm italic">
                "{MENSAGENS_GENTIS.pratica[0]}"
              </p>
              <p className="text-amber-200/50 text-xs mt-2">
                As mensagens são sempre gentis e nunca culpabilizam.
              </p>
            </div>
          </div>
        </div>

        {/* Guardar */}
        <div className="flex gap-3">
          <button
            onClick={guardar}
            disabled={saving}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {saving ? 'A guardar...' : saved ? '✓ Guardado!' : 'Guardar Preferências'}
          </button>
          {permissaoPush && (
            <button
              onClick={testarNotificacao}
              className="px-4 py-3 bg-white/10 text-amber-200 rounded-xl hover:bg-white/20"
            >
              Testar
            </button>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D2A24]/95 backdrop-blur-sm border-t border-amber-500/20 px-4 py-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link to="/aurea/dashboard" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/aurea/praticas" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">💎</span>
            <span className="text-xs mt-1">Práticas</span>
          </Link>
          <Link to="/aurea/chat" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">💬</span>
            <span className="text-xs mt-1">Chat</span>
          </Link>
          <Link to="/aurea/perfil" className="flex flex-col items-center text-amber-400">
            <span className="text-xl">⚙️</span>
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
