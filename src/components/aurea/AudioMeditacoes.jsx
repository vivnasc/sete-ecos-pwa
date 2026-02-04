import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * ÁUREA - Áudio-Meditações
 * Meditações guiadas para permissão, culpa e valor
 * Inclui áudios de afirmações e práticas de presença
 */

// Biblioteca de áudios pré-definidos
// Quando os áudios forem criados, adicionar URLs aqui
const BIBLIOTECA_AUDIOS = [
  {
    id: 'meditacao_permissao',
    titulo: 'Meditação da Permissão',
    descricao: 'Dá a ti mesma permissão para existir',
    duracao: '8:00',
    categoria: 'meditacao',
    nivel: 'prata',
    icone: '🧘‍♀️',
    audio_url: null, // Adicionar URL quando disponível
    transcricao: 'Fecha os olhos... Respira fundo... Hoje vais dar-te permissão...'
  },
  {
    id: 'afirmacoes_valor',
    titulo: 'Afirmações de Valor',
    descricao: 'Reconhece o teu valor intrínseco',
    duracao: '5:00',
    categoria: 'afirmacoes',
    nivel: 'bronze',
    icone: '✨',
    audio_url: null,
    transcricao: 'Eu mereço estar aqui... O meu valor não depende do que faço...'
  },
  {
    id: 'meditacao_culpa',
    titulo: 'Libertar a Culpa',
    descricao: 'Soltar a culpa de cuidar de ti',
    duracao: '10:00',
    categoria: 'meditacao',
    nivel: 'prata',
    icone: '🌸',
    audio_url: null,
    transcricao: 'A culpa que sentes não é verdade... É um padrão aprendido...'
  },
  {
    id: 'afirmacoes_merecimento',
    titulo: 'Eu Mereço',
    descricao: 'Afirmações de merecimento',
    duracao: '4:00',
    categoria: 'afirmacoes',
    nivel: 'bronze',
    icone: '💎',
    audio_url: null,
    transcricao: 'Eu mereço cuidar de mim... Eu mereço tempo para mim...'
  },
  {
    id: 'pratica_presenca',
    titulo: 'Prática de Presença',
    descricao: 'Estar presente no teu corpo',
    duracao: '6:00',
    categoria: 'pratica',
    nivel: 'bronze',
    icone: '🌿',
    audio_url: null,
    transcricao: 'Sente os teus pés no chão... Sente o peso do teu corpo...'
  },
  {
    id: 'meditacao_dinheiro',
    titulo: 'Relação com Dinheiro',
    descricao: 'Transformar crenças sobre gastar contigo',
    duracao: '12:00',
    categoria: 'meditacao',
    nivel: 'ouro',
    icone: '💰',
    audio_url: null,
    transcricao: 'O dinheiro é energia... Mereces investir energia em ti...'
  },
  {
    id: 'ritual_noite',
    titulo: 'Ritual da Noite',
    descricao: 'Encerrar o dia com gratidão por ti',
    duracao: '7:00',
    categoria: 'ritual',
    nivel: 'prata',
    icone: '🌙',
    audio_url: null,
    transcricao: 'O dia está a terminar... O que fizeste por ti hoje?...'
  },
  {
    id: 'afirmacoes_manha',
    titulo: 'Despertar com Intenção',
    descricao: 'Começar o dia a priorizar-te',
    duracao: '3:00',
    categoria: 'afirmacoes',
    nivel: 'bronze',
    icone: '☀️',
    audio_url: null,
    transcricao: 'Bom dia... Hoje escolho existir para mim também...'
  }
];

const CATEGORIAS = {
  meditacao: { nome: 'Meditações', icone: '🧘‍♀️', cor: 'from-purple-500/30 to-purple-600/30' },
  afirmacoes: { nome: 'Afirmações', icone: '✨', cor: 'from-amber-500/30 to-amber-600/30' },
  pratica: { nome: 'Práticas', icone: '🌿', cor: 'from-green-500/30 to-green-600/30' },
  ritual: { nome: 'Rituais', icone: '🌙', cor: 'from-indigo-500/30 to-indigo-600/30' }
};

export default function AudioMeditacoes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userNivel, setUserNivel] = useState('bronze');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audiosOuvidos, setAudiosOuvidos] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/aurea/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (userData) {
        setUserId(userData.id);

        // Get user level from joias
        const { data: client } = await supabase
          .from('aurea_clients')
          .select('joias_total')
          .eq('user_id', userData.id)
          .single();

        if (client) {
          const joias = client.joias_total || 0;
          if (joias >= 301) setUserNivel('diamante');
          else if (joias >= 151) setUserNivel('ouro');
          else if (joias >= 51) setUserNivel('prata');
          else setUserNivel('bronze');
        }

        // Get listened audios
        const { data: ouvidos } = await supabase
          .from('aurea_audios_log')
          .select('audio_id')
          .eq('user_id', userData.id);

        setAudiosOuvidos(ouvidos?.map(a => a.audio_id) || []);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const podeAceder = (nivelAudio) => {
    const niveis = ['bronze', 'prata', 'ouro', 'diamante'];
    return niveis.indexOf(userNivel) >= niveis.indexOf(nivelAudio);
  };

  const handlePlayAudio = async (audio) => {
    if (!podeAceder(audio.nivel)) {
      // Show upgrade message
      return;
    }

    setCurrentAudio(audio);

    if (audio.audio_url) {
      // If there's an actual audio URL, play it
      if (audioRef.current) {
        audioRef.current.src = audio.audio_url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      // Show transcript/reading mode
      setIsPlaying(false);
    }

    // Log audio view
    if (!audiosOuvidos.includes(audio.id)) {
      await supabase.from('aurea_audios_log').insert({
        user_id: userId,
        audio_id: audio.id,
        created_at: new Date().toISOString()
      });
      setAudiosOuvidos([...audiosOuvidos, audio.id]);

      // Add joias for listening
      const { data: client } = await supabase
        .from('aurea_clients')
        .select('joias_total')
        .eq('user_id', userId)
        .single();

      await supabase
        .from('aurea_clients')
        .update({ joias_total: (client?.joias_total || 0) + 1 })
        .eq('user_id', userId);
    }
  };

  const handleClosePlayer = () => {
    setCurrentAudio(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const filteredAudios = selectedCategory
    ? BIBLIOTECA_AUDIOS.filter(a => a.categoria === selectedCategory)
    : BIBLIOTECA_AUDIOS;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <Link to="/aurea/dashboard" className="text-amber-200/60 hover:text-amber-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-amber-100">Áudio-Meditações</h1>
            <p className="text-amber-200/60 text-sm">{BIBLIOTECA_AUDIOS.length} áudios disponíveis</p>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-4">
        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              !selectedCategory
                ? 'bg-amber-500 text-white'
                : 'bg-white/10 text-amber-200 hover:bg-white/20'
            }`}
          >
            Todos
          </button>
          {Object.entries(CATEGORIAS).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedCategory === key
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/10 text-amber-200 hover:bg-white/20'
              }`}
            >
              <span>{cat.icone}</span>
              <span>{cat.nome}</span>
            </button>
          ))}
        </div>

        {/* Audio list */}
        <div className="space-y-3">
          {filteredAudios.map((audio) => {
            const categoria = CATEGORIAS[audio.categoria];
            const acessivel = podeAceder(audio.nivel);
            const jaOuviu = audiosOuvidos.includes(audio.id);

            return (
              <button
                key={audio.id}
                onClick={() => handlePlayAudio(audio)}
                disabled={!acessivel}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  acessivel
                    ? 'bg-white/5 border-amber-500/20 hover:border-amber-500/40'
                    : 'bg-white/5 border-gray-500/20 opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${categoria.cor}`}
                  >
                    {audio.icone}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-amber-100 font-medium">{audio.titulo}</h3>
                      {jaOuviu && <span className="text-green-400 text-xs">✓</span>}
                      {!acessivel && <span className="text-amber-500 text-xs">🔒 {audio.nivel}</span>}
                    </div>
                    <p className="text-amber-200/60 text-sm">{audio.descricao}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-amber-200/40 text-xs">{audio.duracao}</span>
                      <span className="text-amber-200/40 text-xs capitalize">{categoria.nome}</span>
                    </div>
                  </div>
                  <div className="text-amber-400">
                    {acessivel ? (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info about creating audios */}
        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30">
          <div className="flex items-start gap-3">
            <span className="text-xl">🎙️</span>
            <div>
              <p className="text-amber-100 font-medium">Mais áudios em breve</p>
              <p className="text-amber-200/60 text-sm mt-1">
                Novos áudios e meditações guiadas estão a ser criados.
                Ganha jóias para desbloquear conteúdo exclusivo.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Audio Player Modal */}
      {currentAudio && (
        <div className="fixed inset-0 bg-black/80 flex items-end z-50">
          <div className="w-full bg-[#2D2A24] rounded-t-3xl p-6 border-t border-amber-500/30">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-amber-100">{currentAudio.titulo}</h3>
                <p className="text-amber-200/60">{currentAudio.descricao}</p>
              </div>
              <button
                onClick={handleClosePlayer}
                className="text-amber-200/60 hover:text-amber-200"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {currentAudio.audio_url ? (
              // Real audio player
              <div className="space-y-4">
                <div className="h-2 bg-amber-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      if (isPlaying) {
                        audioRef.current?.pause();
                      } else {
                        audioRef.current?.play();
                      }
                      setIsPlaying(!isPlaying);
                    }}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center"
                  >
                    {isPlaying ? (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Transcript/reading mode
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-amber-500/20 max-h-64 overflow-y-auto">
                  <p className="text-amber-200/80 leading-relaxed whitespace-pre-line">
                    {currentAudio.transcricao}
                  </p>
                </div>
                <p className="text-amber-200/40 text-sm text-center">
                  Áudio em produção. Lê a transcrição enquanto meditas.
                </p>
                <div className="flex justify-center">
                  <span className="px-4 py-2 bg-amber-500/20 rounded-full text-amber-300 text-sm">
                    +1 jóia por ouvir/ler
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D2A24]/95 backdrop-blur-sm border-t border-amber-500/20 px-4 py-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link to="/aurea/dashboard" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/aurea/praticas" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">💎</span>
            <span className="text-xs mt-1">Práticas</span>
          </Link>
          <Link to="/aurea/audios" className="flex flex-col items-center text-amber-400">
            <span className="text-xl">🎧</span>
            <span className="text-xs mt-1">Áudios</span>
          </Link>
          <Link to="/aurea/chat" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">💬</span>
            <span className="text-xs mt-1">Chat</span>
          </Link>
          <Link to="/aurea/perfil" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">⚙️</span>
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
