import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link, useNavigate } from 'react-router-dom';

// Lista de avatares disponíveis
const AVATARES = [
  { id: 'woman1', emoji: '👩', label: 'Mulher' },
  { id: 'woman2', emoji: '👩‍🦰', label: 'Ruiva' },
  { id: 'woman3', emoji: '👩‍🦱', label: 'Cacheada' },
  { id: 'woman4', emoji: '👱‍♀️', label: 'Loira' },
  { id: 'woman5', emoji: '👩‍🦳', label: 'Grisalha' },
  { id: 'man1', emoji: '👨', label: 'Homem' },
  { id: 'man2', emoji: '👨‍🦰', label: 'Ruivo' },
  { id: 'man3', emoji: '👨‍🦱', label: 'Cacheado' },
  { id: 'man4', emoji: '👱‍♂️', label: 'Loiro' },
  { id: 'man5', emoji: '👨‍🦳', label: 'Grisalho' },
  { id: 'fitness1', emoji: '🏃‍♀️', label: 'Corredora' },
  { id: 'fitness2', emoji: '🧘‍♀️', label: 'Yoga' },
  { id: 'fitness3', emoji: '💪', label: 'Força' },
  { id: 'nature1', emoji: '🌸', label: 'Flor' },
  { id: 'nature2', emoji: '🌿', label: 'Natureza' },
  { id: 'nature3', emoji: '🦋', label: 'Borboleta' },
];

export default function PerfilVitalis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [client, setClient] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  // Estados do formulário
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [genero, setGenero] = useState('');
  const [avatarSelecionado, setAvatarSelecionado] = useState('');
  const [altura, setAltura] = useState('');
  const [pesoAtual, setPesoAtual] = useState('');
  const [pesoMeta, setPesoMeta] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [erro, setErro] = useState('');

  // Estatísticas
  const [stats, setStats] = useState({
    diasAtivos: 0,
    streak: 0,
    xp: 0,
    nivel: 1,
    conquistas: 0
  });

  useEffect(() => {
    loadPerfil();
  }, []);

  const loadPerfil = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/vitalis/login');
        return;
      }
      setAuthUser(user);
      setEmail(user.email || '');

      const { data: userData } = await supabase
        .from('users')
        .select('id, nome')
        .eq('auth_id', user.id)
        .single();

      if (!userData) throw new Error('Utilizador não encontrado');
      setUserId(userData.id);

      // Usar nome da tabela users como fallback
      const nomeDoUser = userData.nome || user.user_metadata?.name || user.email.split('@')[0];

      const { data: clientData } = await supabase
        .from('vitalis_clients')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (clientData) {
        setClient(clientData);
        setNomeCompleto(clientData.nome_completo || nomeDoUser);
        setTelefone(clientData.telefone || '');
        setDataNascimento(clientData.data_nascimento || '');
        setGenero(clientData.genero || '');
        setAvatarSelecionado(clientData.avatar || '');
        setAltura(clientData.altura?.toString() || '');
        setPesoAtual(clientData.peso_actual?.toString() || '');
        setPesoMeta(clientData.peso_meta?.toString() || '');
      } else {
        // Bypass user sem vitalis_clients - usar dados básicos
        setNomeCompleto(nomeDoUser);
      }

      // Carregar estatísticas
      const xp = parseInt(localStorage.getItem('vitalis-xp') || '0');
      const streak = parseInt(localStorage.getItem('vitalis-melhor-streak') || '0');
      const conquistas = JSON.parse(localStorage.getItem('vitalis-conquistas') || '[]');

      // Contar dias ativos
      const { count: diasAtivos } = await supabase
        .from('vitalis_registos')
        .select('*', { count: 'exact' })
        .eq('user_id', userData.id);

      setStats({
        diasAtivos: diasAtivos || 0,
        streak,
        xp,
        nivel: Math.floor(xp / 500) + 1,
        conquistas: conquistas.length
      });

    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setErro('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const guardarPerfil = async () => {
    setSaving(true);
    setErro('');
    setMensagemSucesso('');

    try {
      if (!nomeCompleto.trim()) {
        setErro('O nome é obrigatório');
        setSaving(false);
        return;
      }

      // 1. Atualizar nome na tabela users (sempre)
      const { error: userError } = await supabase
        .from('users')
        .update({
          nome: nomeCompleto.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (userError) {
        console.error('Erro ao atualizar users:', userError);
      }

      // 2. Atualizar vitalis_clients se existir
      if (client?.id) {
        const updateData = {
          nome_completo: nomeCompleto.trim(),
          telefone: telefone.trim(),
          data_nascimento: dataNascimento || null,
          genero: genero || null,
          avatar: avatarSelecionado || null,
          altura: altura ? parseFloat(altura) : null,
          peso_actual: pesoAtual ? parseFloat(pesoAtual) : null,
          peso_meta: pesoMeta ? parseFloat(pesoMeta) : null,
          updated_at: new Date().toISOString()
        };

        const { error: clientError } = await supabase
          .from('vitalis_clients')
          .update(updateData)
          .eq('id', client.id);

        if (clientError) {
          console.error('Erro ao atualizar vitalis_clients:', clientError);
          throw clientError;
        }
      } else {
        // Se não tem vitalis_clients, criar um registo básico
        const { error: insertError } = await supabase
          .from('vitalis_clients')
          .insert({
            user_id: userId,
            nome_completo: nomeCompleto.trim(),
            telefone: telefone.trim(),
            data_nascimento: dataNascimento || null,
            genero: genero || null,
            avatar: avatarSelecionado || null,
            altura: altura ? parseFloat(altura) : null,
            peso_actual: pesoAtual ? parseFloat(pesoAtual) : null,
            peso_meta: pesoMeta ? parseFloat(pesoMeta) : null
          });

        if (insertError) {
          console.error('Erro ao criar vitalis_clients:', insertError);
          // Não falhar se não conseguir criar - o nome já foi guardado em users
        }
      }

      // Atualizar também o avatar no localStorage para refletir imediatamente
      if (avatarSelecionado) {
        const avatarEmoji = AVATARES.find(a => a.id === avatarSelecionado)?.emoji;
        if (avatarEmoji) {
          localStorage.setItem('vitalis-avatar', avatarEmoji);
        }
      }

      setMensagemSucesso('Perfil atualizado com sucesso!');
      setTimeout(() => setMensagemSucesso(''), 3000);

    } catch (error) {
      console.error('Erro ao guardar perfil:', error);
      setErro('Erro ao guardar alterações. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">👤</div>
          <p className="text-[#6B5C4C]">A carregar perfil...</p>
        </div>
      </div>
    );
  }

  const avatarAtual = AVATARES.find(a => a.id === avatarSelecionado);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] pb-8">

      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D]"></div>
        <div className="relative max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/vitalis/dashboard" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg border border-white/30">
                ←
              </Link>
              <h1 className="text-xl font-bold text-white">Meu Perfil</h1>
            </div>
            <button
              onClick={guardarPerfil}
              disabled={saving}
              className="px-4 py-2 bg-white text-[#7C8B6F] rounded-full text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Mensagens */}
        {mensagemSucesso && (
          <div className="p-4 bg-green-100 border border-green-300 rounded-xl text-green-700 text-center">
            {mensagemSucesso}
          </div>
        )}
        {erro && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 text-center">
            {erro}
          </div>
        )}

        {/* Avatar e Estatísticas */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="flex flex-col items-center">
            {/* Avatar Grande */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7C8B6F] to-[#9CAF88] flex items-center justify-center text-5xl shadow-lg">
                {avatarAtual?.emoji || (genero === 'M' ? '👨' : '👩')}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 border-3 border-white flex items-center justify-center text-sm font-bold shadow">
                {stats.nivel}
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800">{nomeCompleto || 'O teu nome'}</h2>
            <p className="text-gray-500 text-sm">{email}</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mt-6 w-full">
              <div className="text-center p-3 bg-[#F5F2ED] rounded-xl">
                <p className="text-2xl font-bold text-[#7C8B6F]">{stats.diasAtivos}</p>
                <p className="text-xs text-gray-500">Dias</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <p className="text-2xl font-bold text-orange-500">{stats.streak}</p>
                <p className="text-xs text-gray-500">Streak</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-xl">
                <p className="text-2xl font-bold text-yellow-600">{stats.xp}</p>
                <p className="text-xs text-gray-500">XP</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <p className="text-2xl font-bold text-purple-600">{stats.conquistas}</p>
                <p className="text-xs text-gray-500">Badges</p>
              </div>
            </div>
          </div>
        </div>

        {/* Escolher Avatar */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Escolhe o teu Avatar</h3>

          <div className="grid grid-cols-8 gap-2">
            {AVATARES.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setAvatarSelecionado(avatar.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                  avatarSelecionado === avatar.id
                    ? 'bg-[#7C8B6F] scale-110 shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title={avatar.label}
              >
                {avatar.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Dados Pessoais */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Dados Pessoais</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nome Completo *</label>
              <input
                type="text"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#7C8B6F] focus:outline-none transition-colors"
                placeholder="O teu nome"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado</p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Telefone</label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#7C8B6F] focus:outline-none transition-colors"
                placeholder="912 345 678"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#7C8B6F] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Género</label>
                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#7C8B6F] focus:outline-none transition-colors bg-white"
                >
                  <option value="">Selecionar</option>
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                  <option value="O">Outro</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Dados Físicos */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Dados Físicos</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Altura (cm)</label>
              <input
                type="number"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#7C8B6F] focus:outline-none transition-colors text-center"
                placeholder="165"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Peso Atual (kg)</label>
              <input
                type="number"
                step="0.1"
                value={pesoAtual}
                onChange={(e) => setPesoAtual(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#7C8B6F] focus:outline-none transition-colors text-center"
                placeholder="65.0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Peso Meta (kg)</label>
              <input
                type="number"
                step="0.1"
                value={pesoMeta}
                onChange={(e) => setPesoMeta(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#7C8B6F] focus:outline-none transition-colors text-center"
                placeholder="58.0"
              />
            </div>
          </div>

          {pesoAtual && pesoMeta && (
            <div className="mt-4 p-4 bg-[#F5F2ED] rounded-xl">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progresso</span>
                <span className="font-semibold text-[#7C8B6F]">
                  {(parseFloat(pesoAtual) - parseFloat(pesoMeta)).toFixed(1)} kg para a meta
                </span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#9CAF88] to-[#7C8B6F] rounded-full"
                  style={{
                    width: `${Math.max(0, Math.min(100, ((client?.peso_inicial || parseFloat(pesoAtual)) - parseFloat(pesoAtual)) / ((client?.peso_inicial || parseFloat(pesoAtual)) - parseFloat(pesoMeta)) * 100))}%`
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Botão Guardar (mobile) */}
        <button
          onClick={guardarPerfil}
          disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {saving ? 'A guardar...' : 'Guardar Alterações'}
        </button>

        {/* Secção de Conta */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mt-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Conta</h3>

          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span>🚪</span> Terminar Sessão
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
