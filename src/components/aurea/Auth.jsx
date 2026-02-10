import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { g } from '../../utils/genero';

/**
 * ÁUREA - Autenticação
 * Login/Registo específico para o módulo ÁUREA
 */

export default function AureaAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Verificar se já está autenticado
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', session.user.id)
            .maybeSingle();

          if (userData) {
            const { data: aureaClient } = await supabase
              .from('aurea_clients')
              .select('onboarding_complete')
              .eq('user_id', userData.id)
              .maybeSingle();

            if (aureaClient?.onboarding_complete) {
              navigate('/aurea/dashboard');
            } else {
              navigate('/aurea/pagamento');
            }
          } else {
            navigate('/aurea/pagamento');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão ÁUREA:', error);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Email ou palavra-passe incorrectos');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Por favor confirma o teu email antes de entrar');
          } else {
            setError(error.message);
          }
          return;
        }

        // Redirecionar após login bem-sucedido
        navigate('/aurea/pagamento');
      } else {
        // Registo
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/aurea/pagamento`
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setError('Este email já está registado. Tenta fazer login.');
          } else {
            setError(error.message);
          }
          return;
        }

        if (data?.user?.identities?.length === 0) {
          setError('Este email já está registado. Tenta fazer login.');
          return;
        }

        // Criar registo na tabela users
        if (data.user) {
          await supabase.from('users').upsert({
            auth_id: data.user.id,
            email: data.user.email,
            created_at: new Date().toISOString()
          }, { onConflict: 'auth_id' }).select('id');
        }

        setMessage('Conta criada! Verifica o teu email para confirmar o registo.');
      }
    } catch (err) {
      setError('Ocorreu um erro. Tenta novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
      {/* Header */}
      <nav className="px-6 py-4 flex justify-between items-center">
        <Link to="/aurea" className="flex items-center gap-3">
          <img src="/logos/AUREA_LOGO_V3.png" alt="ÁUREA" className="w-10 h-10" />
          <span className="text-xl font-bold text-amber-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            ÁUREA
          </span>
        </Link>
        <Link to="/aurea" className="text-amber-300/70 hover:text-amber-200 text-sm">
          ← Voltar
        </Link>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="text-2xl font-bold text-amber-100 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {isLogin ? g('Bem-vindo de volta', 'Bem-vinda de volta') : 'Começa a tua jornada'}
            </h1>
            <p className="text-amber-200/70">
              {isLogin ? 'Entra na tua conta ÁUREA' : 'Cria a tua conta para começar'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-amber-200/80 text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="o.teu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-amber-200/80 text-sm mb-2">Palavra-passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-amber-400 transition-colors"
                placeholder={isLogin ? '••••••••' : 'Mínimo 6 caracteres'}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                <p className="text-green-300 text-sm">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  A processar...
                </span>
              ) : (
                isLogin ? 'Entrar' : 'Criar conta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
              }}
              className="text-amber-300 hover:text-amber-200 text-sm"
            >
              {isLogin ? 'Não tens conta? Criar agora' : 'Já tens conta? Entrar'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
              <button
                onClick={async () => {
                  if (!email) {
                    setError('Insere o teu email primeiro');
                    return;
                  }
                  setLoading(true);
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/aurea/login`
                  });
                  setLoading(false);
                  if (error) {
                    setError('Erro ao enviar email. Tenta novamente.');
                  } else {
                    setMessage('Email enviado! Verifica a tua caixa de correio.');
                  }
                }}
                className="text-amber-400/70 hover:text-amber-300 text-sm"
              >
                Esqueceste a palavra-passe?
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-amber-300/50 text-xs">
          Ao criar conta, aceitas os{' '}
          <a href="/termos.pdf" className="underline hover:text-amber-300">Termos de Uso</a>
          {' '}e{' '}
          <a href="/privacidade.pdf" className="underline hover:text-amber-300">Política de Privacidade</a>
        </p>
      </div>
    </div>
  );
}
