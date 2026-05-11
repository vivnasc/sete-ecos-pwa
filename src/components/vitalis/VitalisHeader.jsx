// ============================================================
// VITALIS HEADER — Linguagem editorial FénixFit
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

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
          background: 'color-mix(in srgb, var(--fnx-bg) 92%, transparent)',
          boxShadow: 'inset 0 -1px 0 var(--fnx-hair)'
        }}
      >
        <div className="fnx-container flex items-center justify-between py-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              className="-ml-2 p-2 rounded-md fnx-transition fnx-text-soft hover:opacity-70"
              aria-label="Voltar"
            >
              <ArrowLeft size={18} strokeWidth={1.4} />
            </button>
            <h1
              className="truncate fnx-text-ink"
              style={{
                fontFamily: 'var(--font-editorial)',
                fontWeight: 400,
                fontSize: '17px',
                letterSpacing: '-0.015em'
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
                className="p-2 rounded-md fnx-transition fnx-text-soft hover:opacity-70"
                aria-label="Dashboard"
              >
                <Home size={18} strokeWidth={1.4} />
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
        background: 'var(--fnx-bg)',
        boxShadow: 'inset 0 -1px 0 var(--fnx-hair)'
      }}
    >
      <div className="fnx-container pt-5 pb-6">
        {/* Navigation row */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="fnx-btn-ghost -ml-3"
            style={{ padding: '0.5rem 0.75rem' }}
          >
            <ArrowLeft size={16} strokeWidth={1.4} />
            <span style={{ fontSize: '13px' }}>voltar</span>
          </button>

          <div className="flex items-center gap-1">
            {rightAction}
            {showHomeButton && (
              <button
                onClick={() => navigate('/vitalis/dashboard')}
                className="p-2 rounded-md fnx-transition fnx-text-soft hover:opacity-70"
                aria-label="Dashboard"
              >
                <Home size={18} strokeWidth={1.4} />
              </button>
            )}
          </div>
        </div>

        {/* Title editorial */}
        <div>
          <h1
            className="fnx-text-ink"
            style={{
              fontFamily: 'var(--font-editorial)',
              fontWeight: 300,
              fontSize: 'clamp(28px, 7vw, 36px)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="fnx-text-soft mt-1.5"
              style={{
                fontSize: '13px',
                letterSpacing: '0.01em',
                lineHeight: 1.5
              }}
            >
              {subtitle}
            </p>
          )}
          <div
            className="mt-3"
            aria-hidden
            style={{ height: '1px', width: '32px', background: 'var(--fnx-ouro)' }}
          />
        </div>
      </div>
    </header>
  );
}

// Breadcrumb editorial
export function VitalisBreadcrumb({ items }) {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        background: 'var(--fnx-bg-elev)',
        boxShadow: 'inset 0 -1px 0 var(--fnx-hair)'
      }}
    >
      <ol
        className="fnx-container flex items-center gap-2 py-2 fnx-text-faint"
        style={{ fontSize: '11px', letterSpacing: '0.04em' }}
      >
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <span style={{ color: 'var(--fnx-hair-strong)' }}>·</span>}
            {item.link ? (
              <button
                onClick={() => navigate(item.link)}
                className="fnx-transition fnx-text-soft hover:text-[var(--fnx-ouro)]"
              >
                {item.label}
              </button>
            ) : (
              <span className="fnx-text-ink" style={{ fontWeight: 500 }}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
