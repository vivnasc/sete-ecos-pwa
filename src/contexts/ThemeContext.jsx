// src/contexts/ThemeContext.jsx
// Context para gestão do tema (Light/Dark Mode)

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Inicializa com preferência guardada ou light mode por defeito
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vitalis-theme');
      if (saved) return saved === 'dark';
      // Verifica preferência do sistema (desactivado por agora - sempre light por defeito)
      // return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Aplica a classe ao documento
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('vitalis-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);
  const setLight = () => setIsDark(false);
  const setDark = () => setIsDark(true);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setLight, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
}

// Componente de Toggle para Dark Mode
export function DarkModeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
        isDark ? 'bg-indigo-600' : 'bg-gray-200'
      } ${className}`}
      aria-label="Alternar tema"
    >
      <div
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        <span className="text-sm">{isDark ? '🌙' : '☀️'}</span>
      </div>
    </button>
  );
}

export default ThemeContext;
