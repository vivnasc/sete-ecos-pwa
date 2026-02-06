import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { g } from '../../utils/genero';

/**
 * ÁUREA - Áudio-Meditações
 * Meditações guiadas, afirmações e práticas de presença
 * Design claro e feminino
 */

// Cores claras e femininas
const CORES = {
  bg: '#FDF8F3',
  bgCard: '#FFFFFF',
  gold: '#C9A227',
  goldLight: '#E8D59E',
  rose: '#E8B4B8',
  roseDark: '#D4919A',
  text: '#4A3728',
  textLight: '#8B7355',
  accent: '#F5E6D3',
};

// Biblioteca de áudios - 8 áudios conforme scripts
const BIBLIOTECA_AUDIOS = [
  {
    id: 'valor_nao_se_ganha',
    titulo: 'O Teu Valor Não Se Ganha',
    descricao: 'Meditação para reconhecer o teu valor intrínseco',
    duracao: '5-7 min',
    categoria: 'meditacao',
    nivel: 'bronze',
    icone: '✨',
    audio_url: null, // Adicionar URL ElevenLabs quando disponível
    transcricao: `Acomoda-te... Encontra uma posição confortável...
Fecha os olhos se te sentires segura para isso...

Respira fundo... inspira pelo nariz...
E solta pela boca, deixando ir qualquer tensão...

Quero que te lembres de algo importante...
Algo que talvez tenhas esquecido...

O teu valor não se ganha... Não se conquista...
Não depende do que fazes, do que produzes, de quem agradas...

O teu valor é um facto... Um dado... Uma verdade...

Nasceste com ele... Veio contigo...
Não há nada que possas fazer para o perder...
E não há nada que precises de fazer para o ter...

Ele já é teu...

Quando te disseram que precisavas de provar algo...
Quando te ensinaram que o amor tinha condições...
Quando aprendeste a colocar-te em último lugar...

Nada disso mudou o teu valor...
Apenas te fez esquecer que ele existia...

Agora, coloca uma mão sobre o peito...
Sente o teu coração a bater...

Cada batimento é uma prova de que mereces estar aqui...
Cada respiração é um lembrete de que o teu corpo escolhe, todos os dias, manter-te viva...

Repete comigo, em silêncio ou em voz alta...

"Eu mereço porque existo."

"O meu valor não depende do que faço pelos outros."

"Hoje, escolho lembrar-me de quem sou."

Quando estiveres ${g('pronto', 'pronta')}, abre os olhos...
Leva esta verdade contigo...

Tu mereces... Sempre mereceste...`
  },
  {
    id: 'eu_sou_prioridade',
    titulo: 'Eu Sou Prioridade',
    descricao: 'Afirmações para te colocares em primeiro lugar',
    duracao: '3-4 min',
    categoria: 'afirmacoes',
    nivel: 'bronze',
    icone: '💎',
    audio_url: null,
    transcricao: `Estas são afirmações para repetires...
Podes ouvi-las de manhã, ou sempre que precisares de te lembrar...

Eu sou digna do meu próprio tempo...

O meu descanso não é preguiça... É manutenção...

Quando cuido de mim, tenho mais para dar...

Dizer não é um acto de amor próprio...

Eu mereço espaço na minha própria vida...

O meu corpo merece conforto...

Os meus sonhos merecem atenção...

Os meus desejos são válidos...

Não preciso de justificar as minhas necessidades...

Investir em mim não é egoísmo... É responsabilidade...

Eu sou a pessoa mais importante da minha vida...

Sem mim, nada do resto funciona...

Hoje, escolho colocar-me na lista...
Não no fim... Junto com os outros... Com o mesmo peso...

Eu sou prioridade...
E isso não é negociável...

Leva estas palavras contigo...
Repete-as até acreditares...`
  },
  {
    id: 'culpa_nao_te_pertence',
    titulo: 'A Culpa Que Não Te Pertence',
    descricao: 'Libertar culpa herdada de cuidar de ti',
    duracao: '6-8 min',
    categoria: 'meditacao',
    nivel: 'prata',
    icone: '🌸',
    audio_url: null,
    transcricao: `Encontra um lugar onde possas estar só contigo...
Fecha os olhos... Deixa o corpo relaxar...

Hoje vamos falar de algo que carregas há muito tempo...
Algo que te pesa... Que te acompanha...

A culpa...

A culpa de descansar quando há tanto para fazer...
A culpa de gastar contigo quando outros precisam...
A culpa de dizer não...
A culpa de querer...
A culpa de existir para ti mesma...

Quero que visualizes essa culpa...
Como é que ela se parece?...
Talvez seja uma pedra... Um peso... Uma sombra...

Onde a sentes no corpo?...
No peito?... No estômago?... Nos ombros?...

Agora, pergunta-lhe...
"De onde vieste?"...

Talvez ela te mostre rostos...
Pessoas que te ensinaram que não devias...
Que cuidar de ti era egoísmo...
Que os outros vinham sempre primeiro...

Essas pessoas fizeram o melhor que sabiam...
Mas o que te ensinaram... não era verdade...

Era a verdade delas... O medo delas... A culpa delas...
E tu herdaste algo que nunca foi teu...

Imagina agora que podes devolver essa culpa...
Não com raiva... Com gentileza...

Diz, em silêncio...
"Isto não é meu... Devolvo com amor."

Sente o peso a diminuir...
A pedra a ficar mais leve...
A sombra a dissipar-se...

A culpa que te impede de viver plenamente...
Não é tua... Nunca foi...

Cuidar de ti não é traição...
É a coisa mais sagrada que podes fazer...

Quando estiveres ${g('pronto', 'pronta')}, abre os olhos...
Deixa a culpa ficar para trás...
Tu já não precisas dela...`
  },
  {
    id: 'ritual_auto_cuidado',
    titulo: 'Pequeno Ritual de Auto-Cuidado',
    descricao: 'Prática diária de 3 minutos',
    duracao: '4-5 min',
    categoria: 'pratica',
    nivel: 'bronze',
    icone: '🌿',
    audio_url: null,
    transcricao: `Este é um pequeno ritual para fazeres em qualquer momento do dia...
Pode ser de manhã, antes de sair de casa...
Ou à noite, antes de dormir...
Só precisas de três minutos...

Primeiro, olha para as tuas mãos...
Estas mãos que fazem tanto pelos outros...
Que cuidam... Que trabalham... Que seguram...

Coloca uma mão sobre a outra...
Sente o calor...

Agora, diz a ti ${g('mesmo', 'mesma')}...
"Obrigada por tudo o que fazes."

Não por ti... Por elas... Pelas tuas mãos...
Elas merecem reconhecimento...

Agora, coloca as duas mãos sobre o coração...
Este coração que bate sem que lhe peças...
Que te mantém viva sem condições...

Diz...
"Eu vejo-te... Eu ouço-te... Eu cuido de ti."

Por último, olha-te ao espelho...
Ou simplesmente visualiza o teu rosto...

E diz, como se falasses com alguém que amas...

"Tu és suficiente... Exactamente como és."

Este é o teu ritual...
Podes fazê-lo todos os dias...
É simples... E é teu...

Porque tu mereces três minutos...
Tu mereces ser ${g('visto', 'vista')}... Por ti ${g('mesmo', 'mesma')}...`
  },
  {
    id: 'espelho_interior',
    titulo: 'O Espelho Interior',
    descricao: 'Ver-te como realmente és',
    duracao: '5-6 min',
    categoria: 'meditacao',
    nivel: 'prata',
    icone: '🪞',
    audio_url: null,
    transcricao: `Acomoda-te e fecha os olhos...
Deixa o corpo relaxar, parte por parte...

Imagina que estás num quarto calmo e seguro...
No centro deste quarto, há um espelho grande...
Dourado... Antigo... Bonito...

Aproxima-te dele...

Quando olhas para o espelho, não vês o teu reflexo normal...
Vês a ti ${g('mesmo', 'mesma')}... mas como realmente és...
Sem os filtros do medo... Sem as lentes da crítica...

O que vês?...

Talvez vejas força onde pensavas haver fraqueza...
Beleza onde só vias defeitos...
Coragem onde sentias medo...

O espelho mostra-te a verdade...
E a verdade é que és muito mais do que pensas...

Agora, imagina que a pessoa no espelho te sorri...
E diz-te...

"Já chega de te esconderes...
Já chega de te diminuíres...
Já chega de esperares permissão..."

"O mundo precisa de te ver...
Não a versão que pensas que deves ser...
Mas esta... A verdadeira... A completa."

Coloca a mão no espelho...
A pessoa do outro lado coloca a ${g('dele', 'dela')} também...

Sente a conexão...
Ela és tu... A versão que sempre foste...

Quando estiveres ${g('pronto', 'pronta')}, despede-te dela...
Sabe que ela está sempre lá, à tua espera...

Abre os olhos... E lembra-te...
Tu és ela... Sempre foste...`
  },
  {
    id: 'abundancia_merecimento',
    titulo: 'Abundância e Merecimento',
    descricao: 'Reprogramar a relação com abundância',
    duracao: '3-4 min',
    categoria: 'afirmacoes',
    nivel: 'prata',
    icone: '💰',
    audio_url: null,
    transcricao: `Repete estas afirmações para reprogramar a tua relação com abundância...

Eu mereço abundância em todas as áreas da minha vida...

O dinheiro que gasto comigo não é desperdício...

Investir no meu bem-estar é sabedoria...

Eu mereço coisas bonitas... Sem culpa...

A minha prosperidade não tira nada a ninguém...

Quando me cuido, tenho mais para partilhar...

Eu sou digna de conforto...

Eu sou digna de prazer...

Eu sou digna de beleza...

Deixo de pedir desculpa por querer mais...

Deixo de me contentar com menos do que mereço...

A abundância é o meu estado natural...

Recebo com gratidão tudo o que a vida me oferece...

E ofereço-me a mim mesma com a mesma generosidade...

Eu mereço... Ponto final...`
  },
  {
    id: 'soltar_o_dia',
    titulo: 'Soltar o Dia',
    descricao: 'Meditação para dormir',
    duracao: '5-6 min',
    categoria: 'ritual',
    nivel: 'bronze',
    icone: '🌙',
    audio_url: null,
    transcricao: `Deita-te confortavelmente...
O dia está a terminar... É hora de soltar...

Inspira profundamente...
E ao expirar, imagina que soltas todas as preocupações...

Mais uma vez... Inspira... e solta...

Pensa no teu dia...
Houve momentos em que te criticaste?...
Em que te julgaste?...
Em que te colocaste em último?...

Está tudo bem... Não é para te culpares...
É para reconheceres... E soltar...

Diz em silêncio...
"Hoje fiz o que pude... E foi suficiente."

Agora pensa... houve algum momento, mesmo pequeno, em que cuidaste de ti?...
Uma pausa... Um respiro... Um pensamento gentil...

Se houve, celebra-o...
Se não houve, tudo bem... Amanhã é um novo dia...

Imagina que uma luz dourada te envolve...
Quente... Segura... Amorosa...

Esta luz é o cuidado que mereces...
Está sempre disponível... Sempre tua...

Enquanto adormeces, leva contigo esta certeza...

Tu és amada... Por ti mesma...
Tu és digna... Exactamente como és...
E amanhã... vais lembrar-te disso...

Dorme bem... Descansa...
Amanhã, eu estarei aqui...`
  },
  {
    id: 'lembrete_1_minuto',
    titulo: 'Lembrete de 1 Minuto',
    descricao: 'Pausa rápida para te lembrares',
    duracao: '1 min',
    categoria: 'pratica',
    nivel: 'bronze',
    icone: '⏱️',
    audio_url: null,
    transcricao: `Pára um momento...
Respira...

Tu estás aqui... Tu existes... Tu importas...

Não precisas de fazer nada para merecer amor...
Não precisas de provar nada a ninguém...

Só precisas de te lembrar...
Tu és suficiente...

Agora, volta ao teu dia...
Mas leva esta verdade contigo...`
  }
];

const CATEGORIAS = {
  meditacao: { nome: 'Meditações', icone: '🧘‍♀️', cor: '#E8B4B8' },
  afirmacoes: { nome: 'Afirmações', icone: '✨', cor: '#C9A227' },
  pratica: { nome: 'Práticas', icone: '🌿', cor: '#7C9885' },
  ritual: { nome: 'Rituais', icone: '🌙', cor: '#8B7BA5' }
};

export default function AudioMeditacoes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userNivel, setUserNivel] = useState('bronze');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
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
    if (!podeAceder(audio.nivel)) return;

    setCurrentAudio(audio);

    if (audio.audio_url && audioRef.current) {
      audioRef.current.src = audio.audio_url;
      audioRef.current.play();
      setIsPlaying(true);
    }

    if (!audiosOuvidos.includes(audio.id)) {
      await supabase.from('aurea_audios_log').insert({
        user_id: userId,
        audio_id: audio.id,
        created_at: new Date().toISOString()
      });
      setAudiosOuvidos([...audiosOuvidos, audio.id]);

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
    if (audioRef.current) audioRef.current.pause();
  };

  const filteredAudios = selectedCategory
    ? BIBLIOTECA_AUDIOS.filter(a => a.categoria === selectedCategory)
    : BIBLIOTECA_AUDIOS;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: CORES.bg }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: CORES.goldLight }}>
            <span className="text-2xl">🎧</span>
          </div>
          <p style={{ color: CORES.textLight }}>A carregar áudios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: CORES.bg }}>
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* Header */}
      <header className="px-5 pt-6 pb-4" style={{ background: `linear-gradient(180deg, ${CORES.goldLight}40 0%, ${CORES.bg} 100%)` }}>
        <div className="flex items-center gap-4">
          <Link to="/aurea/dashboard" style={{ color: CORES.textLight }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ color: CORES.text }}>Áudio-Meditações</h1>
            <p className="text-sm" style={{ color: CORES.textLight }}>{BIBLIOTECA_AUDIOS.length} áudios para ti</p>
          </div>
        </div>
      </header>

      <main className="px-5 space-y-4">
        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className="px-4 py-2 rounded-full whitespace-nowrap transition-colors text-sm font-medium"
            style={{
              backgroundColor: !selectedCategory ? CORES.gold : CORES.bgCard,
              color: !selectedCategory ? 'white' : CORES.text,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            Todos
          </button>
          {Object.entries(CATEGORIAS).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className="px-4 py-2 rounded-full whitespace-nowrap transition-colors flex items-center gap-2 text-sm font-medium"
              style={{
                backgroundColor: selectedCategory === key ? cat.cor : CORES.bgCard,
                color: selectedCategory === key ? 'white' : CORES.text,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
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
                className="w-full p-4 rounded-2xl text-left transition-all shadow-sm"
                style={{
                  backgroundColor: CORES.bgCard,
                  opacity: acessivel ? 1 : 0.6,
                  border: jaOuviu ? `2px solid ${CORES.gold}40` : `1px solid ${CORES.accent}`
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${categoria.cor}30` }}
                  >
                    {audio.icone}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold" style={{ color: CORES.text }}>{audio.titulo}</h3>
                      {jaOuviu && <span style={{ color: '#22C55E' }}>✓</span>}
                      {!acessivel && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: CORES.accent, color: CORES.gold }}>
                          🔒 {audio.nivel}
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: CORES.textLight }}>{audio.descricao}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs" style={{ color: CORES.textLight }}>{audio.duracao}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${categoria.cor}20`, color: categoria.cor }}>
                        {categoria.nome}
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: acessivel ? CORES.rose : CORES.accent }}
                  >
                    {acessivel ? (
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke={CORES.textLight} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info */}
        <div className="p-4 rounded-2xl" style={{ backgroundColor: `${CORES.gold}15`, border: `1px solid ${CORES.gold}30` }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">🎙️</span>
            <div>
              <p className="font-medium" style={{ color: CORES.text }}>Áudios em produção</p>
              <p className="text-sm mt-1" style={{ color: CORES.textLight }}>
                Os áudios estão a ser gravados com amor. Enquanto isso, podes ler as transcrições.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Audio Player Modal */}
      {currentAudio && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full rounded-t-3xl p-6" style={{ backgroundColor: CORES.bgCard }}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${CATEGORIAS[currentAudio.categoria].cor}30` }}
                >
                  {currentAudio.icone}
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: CORES.text }}>{currentAudio.titulo}</h3>
                  <p className="text-sm" style={{ color: CORES.textLight }}>{currentAudio.duracao}</p>
                </div>
              </div>
              <button onClick={handleClosePlayer} style={{ color: CORES.textLight }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {currentAudio.audio_url ? (
              <div className="space-y-4">
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: CORES.accent }}>
                  <div className="h-full rounded-full" style={{ width: '30%', backgroundColor: CORES.rose }} />
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
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white"
                    style={{ background: `linear-gradient(135deg, ${CORES.rose} 0%, ${CORES.roseDark} 100%)` }}
                  >
                    {isPlaying ? (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className="p-4 rounded-xl max-h-64 overflow-y-auto"
                  style={{ backgroundColor: CORES.accent }}
                >
                  <p className="leading-relaxed whitespace-pre-line text-sm" style={{ color: CORES.text }}>
                    {currentAudio.transcricao}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm" style={{ color: CORES.textLight }}>
                    Áudio em produção. Lê a transcrição enquanto meditas.
                  </p>
                  <span className="inline-block mt-2 px-4 py-2 rounded-full text-sm" style={{ backgroundColor: `${CORES.gold}20`, color: CORES.gold }}>
                    +1 jóia por ler/ouvir
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 px-4 py-3 border-t"
        style={{ backgroundColor: CORES.bgCard, borderColor: CORES.accent }}
      >
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link to="/aurea/dashboard" className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: CORES.accent }}>
              <span className="text-lg">🏠</span>
            </div>
            <span className="text-[10px] mt-1" style={{ color: CORES.textLight }}>Início</span>
          </Link>
          <Link to="/aurea/praticas" className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: CORES.accent }}>
              <span className="text-lg">💎</span>
            </div>
            <span className="text-[10px] mt-1" style={{ color: CORES.textLight }}>Práticas</span>
          </Link>
          <Link to="/aurea/chat" className="flex flex-col items-center -mt-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${CORES.rose} 0%, ${CORES.roseDark} 100%)` }}>
              <span className="text-2xl">💛</span>
            </div>
            <span className="text-[10px] mt-1 font-medium" style={{ color: CORES.roseDark }}>Coach</span>
          </Link>
          <Link to="/aurea/audios" className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: CORES.gold }}>
              <span className="text-white text-lg">🎧</span>
            </div>
            <span className="text-[10px] mt-1 font-medium" style={{ color: CORES.gold }}>Áudios</span>
          </Link>
          <Link to="/aurea/perfil" className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: CORES.accent }}>
              <span className="text-lg">⚙️</span>
            </div>
            <span className="text-[10px] mt-1" style={{ color: CORES.textLight }}>Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
