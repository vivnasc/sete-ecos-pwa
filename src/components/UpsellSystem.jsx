import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * SISTEMA DE UPSELL INTELIGENTE
 *
 * Componentes:
 * 1. BannerUpsellAurea - Banner contextual no dashboard Vitalis
 * 2. PopupOfertaLimitada - Pop-up discreto com oferta especial
 * 3. PromptRenovacao - Alerta de renovação antecipada com desconto
 * 4. UpsellBundleCard - Card promovendo bundle no dashboard
 */

// ============================================================
// 1. BANNER UPSELL ÁUREA (no Vitalis Dashboard)
// ============================================================

export function BannerUpsellAurea() {
  const [dismissed, setDismissed] = useState(false);
  const [diasDeUso, setDiasDeUso] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkIfShouldShow();
  }, [user]);

  const checkIfShouldShow = async () => {
    if (!user) return;

    // Verificar se usuário já tem Áurea
    const { data: aureaClient } = await supabase
      .from('aurea_clients')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (aureaClient) {
      setDismissed(true);
      return;
    }

    // Verificar se já dispensou recentemente
    const dismissedKey = `upsell-aurea-dismissed-${user.id}`;
    const lastDismissed = localStorage.getItem(dismissedKey);
    if (lastDismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setDismissed(true);
        return;
      }
    }

    // Calcular dias de uso
    const { data: vitalisClient } = await supabase
      .from('vitalis_clients')
      .select('created_at')
      .eq('user_id', user.id)
      .single();

    if (vitalisClient) {
      const dias = Math.floor((Date.now() - new Date(vitalisClient.created_at)) / (1000 * 60 * 60 * 24));
      setDiasDeUso(dias);
    }
  };

  const handleDismiss = () => {
    const dismissedKey = `upsell-aurea-dismissed-${user.id}`;
    localStorage.setItem(dismissedKey, Date.now().toString());
    setDismissed(true);
  };

  if (dismissed || diasDeUso < 14) return null;

  return (
    <div className="bg-gradient-to-r from-[#C9A227]/10 to-[#E8D5A3]/10 border-2 border-[#C9A227]/30 rounded-2xl p-6 mb-6 relative overflow-hidden">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-[#6B5C4C] hover:text-[#4A4035] text-xl"
      >
        ×
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-[#C9A227] to-[#E8D5A3] rounded-full flex items-center justify-center text-3xl">
            ✨
          </div>
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-xl text-[#2D3A25] mb-2">
            Gostas do Vitalis? Experimenta o Áurea! 🌟
          </h3>
          <p className="text-[#4A4035] mb-4 leading-relaxed">
            Estás a cuidar do teu <strong>corpo</strong> com o Vitalis. Que tal cuidar também da tua <strong>autoestima e presença</strong>?
          </p>

          <div className="bg-white rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-[#C9A227] mb-2">O Áurea inclui:</p>
            <ul className="space-y-1 text-sm text-[#4A4035]">
              <li>✓ Micro-práticas diárias de autovalor</li>
              <li>✓ Espelho de roupa (confiança)</li>
              <li>✓ Diário de merecimento</li>
              <li>✓ Coach IA especializada em presença</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/aurea')}
              className="bg-gradient-to-r from-[#C9A227] to-[#E8D5A3] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Experimentar 7 Dias Grátis →
            </button>
            <button
              onClick={() => navigate('/bundle')}
              className="border-2 border-[#C9A227] text-[#C9A227] px-6 py-3 rounded-full font-semibold hover:bg-[#C9A227]/10 transition-all"
            >
              Ver Bundle (-25%)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 2. POP-UP OFERTA LIMITADA (aparece 1x/mês)
// ============================================================

export function PopupOfertaLimitada() {
  const [show, setShow] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkIfShouldShow();
  }, [user]);

  const checkIfShouldShow = async () => {
    if (!user) return;

    // Só mostrar 1x por mês
    const popupKey = `popup-oferta-${user.id}`;
    const lastShown = localStorage.getItem(popupKey);
    if (lastShown) {
      const daysSinceShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
      if (daysSinceShown < 30) return;
    }

    // Verificar se tem apenas Vitalis (não tem bundle ou Áurea)
    const { data: vitalis } = await supabase
      .from('vitalis_clients')
      .select('*')
      .eq('user_id', user.id)
      .in('subscription_status', ['active', 'tester'])
      .single();

    const { data: aurea } = await supabase
      .from('aurea_clients')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (vitalis && !aurea) {
      // Esperar 2 segundos antes de mostrar (não intrusivo)
      setTimeout(() => {
        setShow(true);
        localStorage.setItem(popupKey, Date.now().toString());
      }, 2000);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 relative animate-[slideIn_0.3s_ease-out]">
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-[#6B5C4C] hover:text-[#4A4035] text-2xl"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎁</div>
          <h2 className="text-2xl font-bold text-[#2D3A25] mb-2">
            Oferta Exclusiva para Ti!
          </h2>
          <p className="text-[#6B5C4C]">Válida apenas hoje</p>
        </div>

        <div className="bg-gradient-to-r from-[#7C8B6F]/10 to-[#C9A227]/10 rounded-2xl p-6 mb-6">
          <p className="text-center mb-4">
            <span className="text-4xl font-bold text-[#C9A227]">-30%</span>
          </p>
          <p className="text-center font-semibold text-[#2D3A25] mb-2">
            Upgrade para Anual e Poupa 30%
          </p>
          <p className="text-center text-sm text-[#6B5C4C]">
            De 21.000 MZN → <strong className="text-[#7C8B6F]">14.700 MZN</strong>
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              navigate('/vitalis/pagamento');
              setShow(false);
            }}
            className="w-full bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Aproveitar Oferta →
          </button>
          <button
            onClick={() => setShow(false)}
            className="w-full text-[#6B5C4C] text-sm hover:text-[#4A4035]"
          >
            Talvez mais tarde
          </button>
        </div>

        <p className="text-xs text-center text-[#9B8B7E] mt-4">
          Esta oferta expira em 24 horas
        </p>
      </div>
    </div>
  );
}

// ============================================================
// 3. PROMPT DE RENOVAÇÃO ANTECIPADA
// ============================================================

export function PromptRenovacao() {
  const [show, setShow] = useState(false);
  const [diasRestantes, setDiasRestantes] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkRenovacao();
  }, [user]);

  const checkRenovacao = async () => {
    if (!user) return;

    const { data: client } = await supabase
      .from('vitalis_clients')
      .select('subscription_end, subscription_status')
      .eq('user_id', user.id)
      .single();

    if (!client || !client.subscription_end || client.subscription_status !== 'active') return;

    const endDate = new Date(client.subscription_end);
    const hoje = new Date();
    const diasRestantes = Math.ceil((endDate - hoje) / (1000 * 60 * 60 * 24));

    setDiasRestantes(diasRestantes);

    // Mostrar apenas entre 14 e 7 dias antes
    if (diasRestantes > 14 || diasRestantes < 0) return;

    // Desconto progressivo
    const desconto = diasRestantes > 10 ? 10 : diasRestantes > 7 ? 15 : 20;
    setDesconto(desconto);

    // Verificar se já dispensou
    const dismissedKey = `renovacao-dismissed-${user.id}-${endDate.toISOString().split('T')[0]}`;
    if (localStorage.getItem(dismissedKey)) return;

    setShow(true);
  };

  const handleDismiss = () => {
    const { data: client } = await supabase
      .from('vitalis_clients')
      .select('subscription_end')
      .eq('user_id', user.id)
      .single();

    if (client) {
      const dismissedKey = `renovacao-dismissed-${user.id}-${client.subscription_end.split('T')[0]}`;
      localStorage.setItem(dismissedKey, 'true');
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white rounded-2xl p-6 mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-white/80 hover:text-white text-xl"
      >
        ×
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-4xl">
          ⏰
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-xl mb-2">
            Renova Agora e Ganha {desconto}% Desconto!
          </h3>
          <p className="text-white/90 mb-4">
            A tua subscrição expira em <strong>{diasRestantes} dias</strong>. Renova antecipadamente e ganha desconto exclusivo.
          </p>

          <div className="bg-white/20 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Desconto de renovação:</span>
              <span className="text-2xl font-bold">{desconto}% OFF</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                navigate('/vitalis/pagamento');
                handleDismiss();
              }}
              className="bg-white text-[#7C8B6F] px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Renovar Agora →
            </button>
            <button
              onClick={handleDismiss}
              className="border-2 border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-all"
            >
              Lembrar mais tarde
            </button>
          </div>

          <p className="text-xs text-white/60 mt-3">
            Oferta válida apenas durante este período
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 4. UPSELL BUNDLE CARD (Mini card no dashboard)
// ============================================================

export function UpsellBundleCard() {
  const [hasBundle, setHasBundle] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkBundle();
  }, [user]);

  const checkBundle = async () => {
    if (!user) return;

    const [{ data: vitalis }, { data: aurea }] = await Promise.all([
      supabase.from('vitalis_clients').select('*').eq('user_id', user.id).single(),
      supabase.from('aurea_clients').select('*').eq('user_id', user.id).single(),
    ]);

    if (vitalis && aurea) {
      setHasBundle(true);
    }
  };

  if (hasBundle) return null;

  return (
    <div className="bg-gradient-to-br from-[#7C8B6F] to-[#C9A227] text-white rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">💎</span>
          <h3 className="font-bold text-lg">Bundle Premium</h3>
        </div>

        <p className="text-white/90 text-sm mb-4">
          Vitalis + Áurea juntos com <strong className="text-xl">25% desconto</strong>
        </p>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-white/20 rounded-lg p-3 text-center">
            <p className="text-xs text-white/70">Economia</p>
            <p className="text-xl font-bold">7.745 MZN</p>
          </div>
          <div className="flex-1 bg-white/20 rounded-lg p-3 text-center">
            <p className="text-xs text-white/70">Trial</p>
            <p className="text-xl font-bold">7 dias</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/bundle')}
          className="w-full bg-white text-[#7C8B6F] py-3 rounded-full font-semibold hover:shadow-lg transition-all"
        >
          Saber Mais →
        </button>
      </div>
    </div>
  );
}

// ============================================================
// EXPORTAR HOOK ÚNICO PARA USAR TUDO
// ============================================================

export function useUpsellSystem() {
  return {
    BannerUpsellAurea,
    PopupOfertaLimitada,
    PromptRenovacao,
    UpsellBundleCard,
  };
}
