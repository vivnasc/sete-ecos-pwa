import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * PERFIL - Unified Profile Page
 * Edit user information across all Ecos
 */
export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { state: { from: '/perfil' } });
        return;
      }

      setUser(session.user);

      // Get user record from users table
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', session.user.id)
        .single();

      setFormData({
        nome: userData?.nome || session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
        email: session.user.email || ''
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: formData.nome }
      });

      if (authError) throw authError;

      // Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({ nome: formData.nome })
        .eq('auth_id', user.id);

      if (userError) throw userError;

      // Also update vitalis_clients if exists
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (userData) {
        await supabase
          .from('vitalis_clients')
          .update({ nome: formData.nome })
          .eq('user_id', userData.id);
      }

      setMessage({ type: 'success', text: 'Perfil actualizado com sucesso!' });
    } catch (error) {
      console.error('Erro ao guardar:', error);
      setMessage({ type: 'error', text: 'Erro ao guardar alterações. Tenta novamente.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FAF6F0 0%, #E8D5A3 100%)' }}>
        <div className="w-10 h-10 border-4 border-[#C9A227]/30 border-t-[#C9A227] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #FAF6F0 0%, #E8D5A3 100%)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#FAF6F0] rounded-full transition-colors">
            <svg className="w-6 h-6 text-[#4A3728]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-[#4A3728]">Editar Perfil</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Picture */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-[#C9A227] to-[#B8911E] rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {formData.nome?.charAt(0).toUpperCase() || formData.email?.charAt(0).toUpperCase()}
            </div>
            {/* Future: Add photo upload */}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#E8D5A3]/50 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
              Nome
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Como queres ser chamada?"
              className="w-full px-4 py-3 border-2 border-[#E8D5A3] rounded-xl focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all bg-white"
            />
          </div>

          {/* Email - Read Only */}
          <div>
            <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 border-2 border-[#E8D5A3]/50 rounded-xl bg-[#FAF6F0] text-[#6B5344] cursor-not-allowed"
            />
            <p className="text-xs text-[#6B5344] mt-1">
              O email não pode ser alterado
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-xl text-sm ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-gradient-to-r from-[#C9A227] to-[#B8911E] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                A guardar...
              </span>
            ) : (
              'Guardar Alterações'
            )}
          </button>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#E8D5A3]/50">
          <h3 className="font-semibold text-[#4A3728] mb-4">Informações da Conta</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B5344]">Conta criada:</span>
              <span className="text-[#4A3728] font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-PT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B5344]">Último acesso:</span>
              <span className="text-[#4A3728] font-medium">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('pt-PT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-3">
          <Link
            to="/conta"
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E8D5A3]/50 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FAF6F0] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#4A3728]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <span className="text-[#4A3728] font-medium">Ver Subscrições</span>
            </div>
            <svg className="w-5 h-5 text-[#6B5344]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            to="/recuperar-password"
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E8D5A3]/50 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FAF6F0] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#4A3728]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <span className="text-[#4A3728] font-medium">Alterar Password</span>
            </div>
            <svg className="w-5 h-5 text-[#6B5344]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
