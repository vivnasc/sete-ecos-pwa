// ============================================================
// VITALIS HEADER - Consistent navigation header for Vitalis pages
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

export default function VitalisHeader({
  title,
  subtitle,
  backTo = '/vitalis/dashboard',
  showHomeButton = true,
  rightAction = null,
  compact = false,
  className = ''
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo === 'history') {
      // Use browser history if specified
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/vitalis/dashboard');
      }
    } else {
      navigate(backTo);
    }
  };

  if (compact) {
    return (
      <header
        className={`sticky top-0 z-40 backdrop-blur-md ${className}`}
        style={{
          background: 'rgba(246, 241, 232, 0.92)',
          boxShadow: 'inset 0 -1px 0 var(--vitalis-hair)'
        }}
      >
        <div className="max-w-[780px] mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-md transition-colors hover:bg-[var(--vitalis-bg-elev)]"
              style={{ color: 'var(--vitalis-ink-soft)' }}
              aria-label="Voltar"
            >
              <ArrowLeftIcon />
            </button>
            <h1
              className="truncate"
              style={{
                fontFamily: 'var(--font-editorial)',
                fontWeight: 400,
                fontSize: '1.0625rem',
                letterSpacing: '-0.015em',
                color: 'var(--vitalis-ink)'
              }}
            >
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-1">
            {rightAction}
            {showHomeButton && (
              <button
                onClick={() => navigate('/vitalis/dashboard')}
                className="p-2 rounded-md transition-colors hover:bg-[var(--vitalis-bg-elev)]"
                style={{ color: 'var(--vitalis-ink-soft)' }}
                aria-label="Dashboard"
              >
                <HomeIcon />
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`relative ${className}`}
      style={{
        background: 'var(--vitalis-bg)',
        boxShadow: 'inset 0 -1px 0 var(--vitalis-hair)'
      }}
    >
      <div className="max-w-[780px] mx-auto px-5 pt-4 pb-5">
        {/* Navigation row */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 -ml-2 px-2 py-1.5 rounded-md transition-colors hover:bg-[var(--vitalis-bg-elev)]"
            style={{ color: 'var(--vitalis-ink-soft)' }}
          >
            <ArrowLeftIcon />
            <span style={{ fontSize: '0.8125rem' }}>Voltar</span>
          </button>

          <div className="flex items-center gap-1">
            {rightAction}
            {showHomeButton && (
              <button
                onClick={() => navigate('/vitalis/dashboard')}
                className="p-2 rounded-md transition-colors hover:bg-[var(--vitalis-bg-elev)]"
                style={{ color: 'var(--vitalis-ink-soft)' }}
                aria-label="Dashboard"
              >
                <HomeIcon />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-editorial)',
              fontWeight: 400,
              fontSize: '1.625rem',
              letterSpacing: '-0.015em',
              lineHeight: 1.15,
              color: 'var(--vitalis-ink)'
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="mt-1"
              style={{
                fontSize: '0.8125rem',
                color: 'var(--vitalis-ink-faint)',
                letterSpacing: '0.01em'
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}

// Breadcrumb component for deep navigation
export function VitalisBreadcrumb({ items }) {
  const navigate = useNavigate();

  return (
    <nav
      className="px-5 py-2"
      style={{
        background: 'var(--vitalis-bg-elev)',
        fontSize: '0.75rem',
        letterSpacing: '0.04em',
        boxShadow: 'inset 0 -1px 0 var(--vitalis-hair)'
      }}
    >
      <ol className="max-w-[780px] mx-auto flex items-center gap-2" style={{ color: 'var(--vitalis-ink-faint)' }}>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <span style={{ color: 'var(--vitalis-hair-strong)' }}>/</span>}
            {item.link ? (
              <button
                onClick={() => navigate(item.link)}
                className="transition-colors"
                style={{ color: 'var(--vitalis-ink-soft)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--vitalis-ouro)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--vitalis-ink-soft)')}
              >
                {item.label}
              </button>
            ) : (
              <span style={{ color: 'var(--vitalis-ink)', fontWeight: 500 }}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
