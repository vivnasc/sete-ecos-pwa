import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getReferralLink, getShareMessages } from '../utils/referral';

/**
 * PromptReferral - Aparece apos momentos positivos (streaks, conquistas)
 * Convida a utilizadora a partilhar com amigas
 */
export default function PromptReferral({ eco = 'vitalis', trigger = 'streak', onClose }) {
  const { session } = useAuth();
  const [visible, setVisible] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const userId = session?.user?.id;
  const link = getReferralLink(userId, eco);
  const messages = getShareMessages(userId, eco);

  useEffect(() => {
    // Verificar se ja mostrou hoje
    const key = `referral-prompt-${new Date().toISOString().split('T')[0]}`;
    if (localStorage.getItem(key)) return;

    const timer = setTimeout(() => {
      setVisible(true);
      localStorage.setItem(key, '1');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!visible || !link) return null;

  const fechar = () => {
    setVisible(false);
    onClose?.();
  };

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(messages?.copy?.text || link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  const triggerMessages = {
    streak: 'O teu progresso esta a inspirar! Partilha com uma amiga.',
    conquista: 'Parabens pela conquista! Convida uma amiga a comecar tambem.',
    checkin: 'Mais um dia de consistencia! Conheces alguem que precisava disto?',
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '400px',
      zIndex: 1000,
      animation: 'slideUp 0.3s ease-out'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        border: '1px solid #E8E2D9'
      }}>
        <button
          onClick={fechar}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#999'
          }}
        >
          ×
        </button>

        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '32px' }}>🤝</span>
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: '15px',
          fontWeight: 'bold',
          color: '#4A4035',
          marginBottom: '8px'
        }}>
          {triggerMessages[trigger] || triggerMessages.checkin}
        </p>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          {messages?.whatsapp?.url && (
            <a
              href={messages.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                background: '#25D366',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 'bold'
              }}
            >
              💬 WhatsApp
            </a>
          )}
          <button
            onClick={copiarLink}
            style={{
              flex: 1,
              padding: '10px',
              background: copiado ? '#E8F5E9' : '#F5F2ED',
              color: copiado ? '#2E7D32' : '#4A4035',
              borderRadius: '12px',
              border: '1px solid #E8E2D9',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {copiado ? '✓ Copiado!' : '🔗 Copiar Link'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
