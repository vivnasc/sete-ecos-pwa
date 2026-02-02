import React, { useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';

export default function VitalisAuth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Buscar users.id primeiro
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', data.user.id)
          .single();

        if (userError || !userData) {
          throw new Error('Utilizador não encontrado na base de dados');
        }

        // Verificar se tem client
        const { data: client } = await supabase
          .from('vitalis_clients')
          .select('id')
          .eq('user_id', userData.id)
          .single();

        if (client) {
          navigate('/vitalis/dashboard');
        } else {
          navigate('/vitalis/intake');
        }

      } else {
        // SIGNUP
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        navigate('/vitalis/intake');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#FDF8F3] to-[#F0EBE3] flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#C1634A]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#D97706]/10 to-transparent rounded-full blur-3xl"></div>
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
            style={{ fontFamily: 'Cormorant Garamond, serif', letterSpacing: '3px' }}
          >
            VITALIS
          </h1>
          <p className="text-[#8B4513] italic text-lg">A Raiz da Transformação</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-[#D2B48C]/30">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-[#F5F0E8] p-1.5 rounded-2xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-[#C1634A] to-[#A54E38] text-white shadow-lg'
                  : 'text-[#6B4423] hover:text-[#4A4035]'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-[#C1634A] to-[#A54E38] text-white shadow-lg'
                  : 'text-[#6B4423] hover:text-[#4A4035]'
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                required
                className="w-full px-4 py-3.5 border-2 border-[#D2B48C]/50 rounded-xl focus:border-[#C1634A] focus:ring-2 focus:ring-[#C1634A]/20 outline-none transition-all bg-white/80"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#4A4035] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full px-4 py-3.5 border-2 border-[#D2B48C]/50 rounded-xl focus:border-[#C1634A] focus:ring-2 focus:ring-[#C1634A]/20 outline-none transition-all bg-white/80"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#C1634A] via-[#D97706] to-[#A54E38] text-white font-bold py-4 rounded-xl hover:shadow-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  A processar...
                </span>
              ) : isLogin ? '🌱 Entrar' : '🌱 Criar Conta'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-[#8B4513] hover:text-[#C1634A] text-sm font-medium transition-colors"
            >
              ← Voltar à Página Inicial
            </button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-[#6B4423] text-sm mt-6">
          {isLogin ? 'Esqueceste a password?' : 'Já tens conta?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#C1634A] hover:text-[#A54E38] font-semibold"
          >
            {isLogin ? 'Fala connosco' : 'Faz login'}
          </button>
        </p>

        {/* Brand footer */}
        <div className="text-center mt-8 text-[#8B4513]/60 text-xs">
          <p>Powered by SETE ECOS</p>
        </div>
      </div>
    </div>
  );
}
