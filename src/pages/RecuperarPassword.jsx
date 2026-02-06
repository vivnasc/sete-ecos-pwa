import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * RECUPERAR PASSWORD - Dedicated Password Recovery Page
 * Handles both request reset and set new password flows
 */
export default function RecuperarPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if this is a reset callback (user clicked email link)
  const isResetCallback = searchParams.get('type') === 'recovery' || window.location.hash.includes('type=recovery');

  const [mode, setMode] = useState(isResetCallback ? 'set-new' : 'request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Handle the recovery token from URL hash
    if (window.location.hash.includes('type=recovery')) {
      setMode('set-new');
    }
  }, []);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Por favor insere o teu email' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/recuperar-password?type=recovery`
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Se o email existir na nossa base de dados, receberás um link para redefinir a password. Verifica também a pasta de spam.'
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao enviar email. Tenta novamente mais tarde.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A password deve ter pelo menos 6 caracteres' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As passwords não coincidem' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Password alterada com sucesso! Vais ser redirecionada...'
      });

      // Redirect after success
      setTimeout(() => {
        navigate('/conta');
      }, 2000);
    } catch (error) {
      console.error('Erro ao alterar password:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao alterar password. O link pode ter expirado. Pede um novo link.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #FAF6F0 0%, #E8D5A3 100%)' }}>
      {/* Header */}
      <nav className="px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logos/CENTRO_7ECOS.png" alt="Sete Ecos" className="w-8 h-8" />
          <span className="text-lg font-bold text-[#4A3728]" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.1em' }}>
            SETE ECOS
          </span>
        </Link>
      </nav>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-[#E8D5A3]/50">
            {/* Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#C9A227] to-[#B8911E] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#4A3728] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {mode === 'request' ? 'Recuperar Password' : 'Nova Password'}
              </h1>
              <p className="text-[#6B5344] text-sm">
                {mode === 'request'
                  ? 'Insere o teu email para receber um link de recuperação'
                  : 'Define a tua nova password'}
              </p>
            </div>

            {/* Request Reset Form */}
            {mode === 'request' && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="o.teu@email.com"
                    required
                    className="w-full px-4 py-3 border-2 border-[#E8D5A3] rounded-xl focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all bg-white"
                  />
                </div>

                {message && (
                  <div className={`p-3 rounded-xl text-sm ${
                    message.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#C9A227] to-[#B8911E] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      A enviar...
                    </span>
                  ) : (
                    'Enviar Link de Recuperação'
                  )}
                </button>
              </form>
            )}

            {/* Set New Password Form */}
            {mode === 'set-new' && (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
                    Nova Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 pr-12 border-2 border-[#E8D5A3] rounded-xl focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5344] hover:text-[#4A3728] transition-colors p-1"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
                    Confirmar Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repete a password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border-2 border-[#E8D5A3] rounded-xl focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all bg-white"
                  />
                </div>

                {/* Password strength indicator */}
                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      <div className={`h-1 flex-1 rounded ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      <div className={`h-1 flex-1 rounded ${newPassword.length >= 10 && /[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    </div>
                    <p className="text-xs text-[#6B5344]">
                      {newPassword.length < 6 ? 'Muito curta' :
                       newPassword.length < 8 ? 'Razoável' :
                       newPassword.length < 10 ? 'Boa' : 'Forte'}
                    </p>
                  </div>
                )}

                {message && (
                  <div className={`p-3 rounded-xl text-sm ${
                    message.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#C9A227] to-[#B8911E] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      A guardar...
                    </span>
                  ) : (
                    'Definir Nova Password'
                  )}
                </button>
              </form>
            )}

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-[#C9A227] hover:underline">
                Voltar ao Login
              </Link>
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 text-center text-[#6B5344] text-sm">
            <p>Dica: Usa uma password única para cada serviço</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[#6B5344]/60 text-xs">
        <p>© 2026 Sete Ecos · Uma PWA. Sete caminhos.</p>
      </footer>
    </div>
  );
}
