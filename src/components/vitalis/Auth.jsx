import React, { useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { checkVitalisAccess } from '../../lib/subscriptions';
import { isCoach } from '../../lib/coach';

// Validação de email
const validarEmail = (email) => {
  if (!email || typeof email !== 'string') return { valido: false, erro: 'Email é obrigatório' };
  const emailTrimmed = email.trim().toLowerCase();
  if (emailTrimmed.length === 0) return { valido: false, erro: 'Email é obrigatório' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailTrimmed)) return { valido: false, erro: 'Introduz um email válido' };
  return { valido: true, valor: emailTrimmed };
};

// Validação de password robusta
const validarPassword = (password, isSignup = false) => {
  if (!password) return { valido: false, erro: 'Password é obrigatória' };

  if (isSignup) {
    if (password.length < 8) {
      return { valido: false, erro: 'Mínimo 8 caracteres' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valido: false, erro: 'Falta letra maiúscula' };
    }
    if (!/[a-z]/.test(password)) {
      return { valido: false, erro: 'Falta letra minúscula' };
    }
    if (!/[0-9]/.test(password)) {
      return { valido: false, erro: 'Falta um número' };
    }
  } else {
    if (password.length < 6) {
      return { valido: false, erro: 'Password muito curta' };
    }
  }

  return { valido: true };
};

// Calcular força da password
const calcularForcaPassword = (password) => {
  if (!password) return { forca: 0, texto: '', cor: '', largura: '0%' };

  let pontos = 0;
  if (password.length >= 8) pontos++;
  if (password.length >= 12) pontos++;
  if (/[A-Z]/.test(password)) pontos++;
  if (/[a-z]/.test(password)) pontos++;
  if (/[0-9]/.test(password)) pontos++;
  if (/[^A-Za-z0-9]/.test(password)) pontos++;

  if (pontos <= 2) return { forca: 1, texto: 'Fraca', cor: 'bg-red-500', largura: '33%' };
  if (pontos <= 4) return { forca: 2, texto: 'Média', cor: 'bg-yellow-500', largura: '66%' };
  return { forca: 3, texto: 'Forte', cor: 'bg-green-500', largura: '100%' };
};

export default function VitalisAuth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const forcaPassword = calcularForcaPassword(password);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validação do email
    const emailResult = validarEmail(email);
    if (!emailResult.valido) {
      setFieldErrors(prev => ({ ...prev, email: emailResult.erro }));
      return;
    }

    // Validação da password
    const passwordResult = validarPassword(password, !isLogin);
    if (!passwordResult.valido) {
      setFieldErrors(prev => ({ ...prev, password: passwordResult.erro }));
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailResult.valor,
          password,
        });

        if (error) {
          // Traduzir erros comuns
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email ou password incorretos');
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Confirma o teu email primeiro. Verifica a caixa de entrada.');
          }
          throw error;
        }

        // Coach tem acesso directo
        if (isCoach(emailResult.valor)) {
          navigate('/vitalis/dashboard');
          return;
        }

        // Buscar users.id primeiro
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', data.user.id)
          .single();

        if (userError || !userData) {
          throw new Error('Utilizador não encontrado na base de dados');
        }

        // Usar a mesma função de verificação que o VitalisAccessGuard
        const access = await checkVitalisAccess(userData.id);

        if (access.hasAccess) {
          navigate('/vitalis/dashboard');
        } else {
          navigate('/vitalis/pagamento');
        }

      } else {
        // SIGNUP
        const { data, error } = await supabase.auth.signUp({
          email: emailResult.valor,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/vitalis/login`,
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('Este email já está registado. Faz login ou recupera a password.');
          }
          throw error;
        }

        // Mostrar mensagem de confirmação de email
        setConfirmationEmail(emailResult.valor);
        setShowConfirmation(true);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Tela de confirmação de email
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-[#E8E2D9] text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-[#4A4035] mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Confirma o teu Email
            </h2>

            <p className="text-[#6B5C4C] mb-4">
              Enviámos um email de confirmação para:
            </p>

            <p className="font-semibold text-[#7C8B6F] text-lg mb-6 break-all">
              {confirmationEmail}
            </p>

            <div className="bg-[#F5F2ED] rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-[#6B5C4C]">
                <strong>Próximos passos:</strong>
              </p>
              <ol className="text-sm text-[#6B5C4C] mt-2 space-y-1 list-decimal list-inside">
                <li>Abre o teu email</li>
                <li>Clica no link de confirmação</li>
                <li>Volta aqui e faz login</li>
              </ol>
            </div>

            <p className="text-xs text-[#6B5C4C]/70 mb-6">
              Não recebeste? Verifica a pasta de spam ou lixo.
            </p>

            <button
              onClick={() => {
                setShowConfirmation(false);
                setIsLogin(true);
                setPassword('');
              }}
              className="w-full bg-[#7C8B6F] hover:bg-[#6B7A5D] text-white font-bold py-4 rounded-xl transition-all shadow-lg"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#7C8B6F]/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#9CAF88]/15 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <img
              src="/logos/VITALIS_LOGO_V3.png"
              alt="Vitalis"
              className="w-28 h-28 mx-auto drop-shadow-lg"
            />
          </div>
          <h1
            className="text-4xl font-bold text-[#4A4035] mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif', letterSpacing: '6px' }}
          >
            VITALIS
          </h1>
          <p className="text-[#6B5C4C] italic text-lg">O caminho do corpo.</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-[#E8E2D9]">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-[#F5F2ED] p-1.5 rounded-2xl">
            <button
              onClick={() => { setIsLogin(true); setFieldErrors({}); setError(''); }}
              className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${
                isLogin
                  ? 'bg-[#7C8B6F] text-white shadow-lg'
                  : 'text-[#6B5C4C] hover:text-[#4A4035]'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setIsLogin(false); setFieldErrors({}); setError(''); }}
              className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${
                !isLogin
                  ? 'bg-[#7C8B6F] text-white shadow-lg'
                  : 'text-[#6B5C4C] hover:text-[#4A4035]'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#4A4035] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })); }}
                placeholder="exemplo@email.com"
                className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-2 outline-none transition-all bg-white ${
                  fieldErrors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-[#E8E2D9] focus:border-[#7C8B6F] focus:ring-[#7C8B6F]/20'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#4A4035] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: '' })); }}
                  placeholder={isLogin ? "A tua password" : "Mín. 8 caracteres, maiúscula, minúscula, número"}
                  className={`w-full px-4 py-3.5 pr-12 border-2 rounded-xl focus:ring-2 outline-none transition-all bg-white ${
                    fieldErrors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-[#E8E2D9] focus:border-[#7C8B6F] focus:ring-[#7C8B6F]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5C4C] hover:text-[#4A4035] transition-colors p-1"
                  aria-label={showPassword ? "Ocultar password" : "Mostrar password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {fieldErrors.password}
                </p>
              )}

              {/* Indicador de força da password (só no signup) */}
              {!isLogin && password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#6B5C4C]">Força da password:</span>
                    <span className={`text-xs font-semibold ${
                      forcaPassword.forca === 1 ? 'text-red-600' :
                      forcaPassword.forca === 2 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {forcaPassword.texto}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${forcaPassword.cor} transition-all duration-300`}
                      style={{ width: forcaPassword.largura }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-[#6B5C4C]/80 space-y-0.5">
                    <p className={password.length >= 8 ? 'text-green-600' : ''}>
                      {password.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
                    </p>
                    <p className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                      {/[A-Z]/.test(password) ? '✓' : '○'} Uma letra maiúscula
                    </p>
                    <p className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                      {/[a-z]/.test(password) ? '✓' : '○'} Uma letra minúscula
                    </p>
                    <p className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                      {/[0-9]/.test(password) ? '✓' : '○'} Um número
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7C8B6F] hover:bg-[#6B7A5D] text-white font-bold py-4 rounded-xl hover:shadow-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  A processar...
                </span>
              ) : isLogin ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-[#6B5C4C] hover:text-[#7C8B6F] text-sm font-medium transition-colors"
            >
              ← Voltar à Página Inicial
            </button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-[#6B5C4C] text-sm mt-6">
          {isLogin ? 'Esqueceste a password?' : 'Já tens conta?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#7C8B6F] hover:text-[#6B7A5D] font-semibold"
          >
            {isLogin ? 'Fala connosco' : 'Faz login'}
          </button>
        </p>

        {/* Brand footer */}
        <div className="text-center mt-8 text-[#6B5C4C]/60 text-xs">
          <p>Powered by SETE ECOS</p>
        </div>
      </div>
    </div>
  );
}
