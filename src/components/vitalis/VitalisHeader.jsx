// ============================================================
// VITALIS HEADER - Consistent navigation header for Vitalis pages
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
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
      <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E8E2D9] ${className}`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-lg hover:bg-[#F5F2ED] text-[#6B5C4C] transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="font-semibold text-[#4A4035]">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {rightAction}
            {showHomeButton && (
              <button
                onClick={() => navigate('/vitalis/dashboard')}
                className="p-2 rounded-lg hover:bg-[#F5F2ED] text-[#6B5C4C] transition-colors"
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
    <header className={`bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Navigation row */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors"
          >
            <ArrowLeftIcon />
            <span>Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            {rightAction}
            {showHomeButton && (
              <button
                onClick={() => navigate('/vitalis/dashboard')}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                aria-label="Dashboard"
              >
                <HomeIcon />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-white">
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/80 text-sm mt-1">{subtitle}</p>
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
    <nav className="px-4 py-2 bg-[#F5F2ED] text-sm">
      <ol className="flex items-center gap-2 text-[#6B5C4C]">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-[#C4A484]">/</span>}
            {item.link ? (
              <button
                onClick={() => navigate(item.link)}
                className="hover:text-[#7C8B6F] transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-[#4A4035] font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
