import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { isCoach } from '../lib/coach';
import { g } from '../utils/genero';

// Traduzir erros do Supabase para português
const traduzirErro = (error) => {
  const msg = error?.message || error || '';

  if (msg.includes('Invalid login')) return 'Email ou password incorrectos';
  if (msg.includes('already registered')) return 'Este email já está registado. Faz login.';
  if (msg.includes('Email not confirmed')) return 'Confirma o teu email antes de entrar.';
  if (msg.includes('Invalid email')) return 'Email inválido. Verifica o formato.';
  if (msg.includes('Password should be')) return 'Password deve ter pelo menos 6 caracteres.';
  if (msg.includes('rate limit')) return 'Demasiadas tentativas. Aguarda um momento.';
  if (msg.includes('network')) return 'Erro de conexão. Verifica a tua internet.';
  if (msg.includes('User not found')) return 'Utilizador não encontrado.';

  return msg || 'Ocorreu um erro. Tenta novamente.';
};

/**
 * LOGIN UNIFICADO - SETE ECOS
 * Uma conta para todos os Ecos
 */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Para onde redirecionar após login
  const from = location.state?.from || '/';
  const ecoDestino = location.state?.eco || null;

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Verificar se já está autenticado
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Coach vai sempre para /coach
        const dest = isCoach(session.user?.email) ? '/coach' : from;
        navigate(dest, { replace: true });
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) throw error;

        // Garantir registo na tabela users
        if (data.user) {
          await supabase.from('users').upsert({
            auth_id: data.user.id,
            email: data.user.email,
            created_at: new Date().toISOString()
          }, { onConflict: 'auth_id' }).select('id');
        }

        // Coach vai sempre para /coach
        const dest = isCoach(data.user?.email) ? '/coach' : from;
        navigate(dest, { replace: true });

      } else {
        // SIGNUP
        if (password.length < 6) {
          throw new Error('Password deve ter pelo menos 6 caracteres');
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: nome || email.split('@')[0] }
          }
        });

        if (error) throw error;

        // Criar registo na tabela users
        if (data.user) {
          await supabase.from('users').upsert({
            auth_id: data.user.id,
            email: email.trim(),
            nome: nome || email.split('@')[0],
            created_at: new Date().toISOString()
          }, { onConflict: 'auth_id' }).select('id');
        }

        // Se tem sessão, email confirmation está desactivado
        if (data.session) {
          navigate(from, { replace: true });
        } else {
          // Mostrar mensagem de confirmação
          setError('');
          alert('Conta criada! Verifica o teu email para confirmar.');
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError(traduzirErro(err));
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FAF6F0 0%, #E8D5A3 100%)' }}>
        <div className="w-10 h-10 border-4 border-[#C9A227]/30 border-t-[#C9A227] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col animate-page-enter" style={{ fontFamily: 'var(--font-corpo)' }}>
      {/* Background com gradient animado */}
      <div className="fixed inset-0 -z-10 hero-gradient-animated" style={{ background: 'linear-gradient(135deg, #FAF6F0 0%, #F0E6D4 25%, #E8D5A3 50%, #F0E6D4 75%, #FAF6F0 100%)' }}>
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-20 left-10 w-60 h-60 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      {/* Header */}
      <nav className="px-5 py-5 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logos/CENTRO_7ECOS.png" alt="Sete Ecos" className="w-9 h-9 animate-float" />
          <span className="text-lg font-bold text-[#4A3728] tracking-[0.15em]" style={{ fontFamily: 'var(--font-titulos)' }}>
            SETE ECOS
          </span>
        </Link>
      </nav>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

          {/* Card — glass morphism */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/60">

            {/* Logo e titulo */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 rounded-full opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'scale(1.5)' }} />
                <img src="/logos/CENTRO_7ECOS.png" alt="Sete Ecos" className="w-16 h-16 mx-auto mb-4 relative" />
              </div>
              <h1 className="text-2xl font-bold text-[#4A3728] mb-1.5" style={{ fontFamily: 'var(--font-titulos)' }}>
                {isLogin ? g('Bem-vindo de volta', 'Bem-vinda de volta') : 'Cria a tua conta'}
              </h1>
              <p className="text-[#6B5344]/70 text-sm tracking-wide">
                Uma conta para todos os Ecos
              </p>

              {/* Indicador do Eco destino */}
              {ecoDestino && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[#FAF6F0] rounded-full text-xs text-[#6B5344]">
                  <span>Continuar para</span>
                  <span className="font-semibold text-[#C9A227]">{ecoDestino}</span>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                  isLogin
                    ? 'bg-[#4A3728] text-white'
                    : 'bg-[#FAF6F0] text-[#6B5344] hover:bg-[#E8D5A3]/50'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                  !isLogin
                    ? 'bg-[#4A3728] text-white'
                    : 'bg-[#FAF6F0] text-[#6B5344] hover:bg-[#E8D5A3]/50'
                }`}
              >
                Criar Conta
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Nome (só signup) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Como queres ser chamada?"
                    className="w-full px-4 py-3 border-2 border-[#E8D5A3] rounded-xl focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all bg-white"
                  />
                </div>
              )}

              {/* Email */}
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

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? 'A tua password' : 'Mínimo 6 caracteres'}
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

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#C9A227] to-[#B8911E] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    A processar...
                  </span>
                ) : (
                  isLogin ? 'Entrar' : 'Criar Conta'
                )}
              </button>
            </form>

            {/* Recuperar password */}
            {isLogin && (
              <div className="mt-4 text-center">
                <Link
                  to="/recuperar-password"
                  className="text-sm text-[#C9A227] hover:underline"
                >
                  Esqueci a password
                </Link>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 text-center text-[#6B5344] text-sm">
            <p>Uma conta dá acesso a todos os Ecos:</p>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <span>Lumina (grátis)</span>
              <span>•</span>
              <span>Vitalis</span>
              <span>•</span>
              <span>e mais...</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 text-center text-[#6B5344]/40 text-xs tracking-wide">
        <p>© 2026 Sete Ecos · Uma PWA. Sete caminhos.</p>
      </footer>
    </div>
  );
}
