import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * SETE ECOS - Landing Page Geral
 *
 * Apresentação completa do ecossistema dos 7 Ecos
 * Com descrições detalhadas, design visual da flor e Aurora
 */

const LandingGeral = () => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  const ecos = [
    {
      numero: 1,
      nome: 'VITALIS',
      slogan: 'A Raiz da Transformação',
      chakra: 'Muladhara — Raiz',
      descricaoCompleta: 'O corpo é o templo. O Vitalis guia-te numa jornada de nutrição consciente, onde aprendes a ouvir os sinais do teu corpo, a nutri-lo sem culpa e a criar uma relação saudável com a comida. Baseado na metodologia Precision Nutrition, usa o sistema de porções com as mãos para simplificar a alimentação.',
      beneficios: ['Plano alimentar personalizado', 'Jejum intermitente adaptado', 'Coach IA 24/7', 'Receitas e lista de compras'],
      logo: '/logos/VITALIS_LOGO_V3.png',
      cor: 'from-emerald-500 to-green-600',
      corFundo: 'bg-emerald-500/10',
      disponivel: true,
      link: '/vitalis',
      preco: 'A partir de 2.500 MZN/mês'
    },
    {
      numero: 2,
      nome: 'SERENA',
      slogan: 'Regular para Fluir',
      chakra: 'Svadhisthana — Sacral',
      descricaoCompleta: 'As emoções são informação, não obstáculos. O Serena ensina-te a navegar o mundo emocional com inteligência, a regular o sistema nervoso e a honrar os ciclos naturais do corpo feminino. Aprende a transformar reactividade em resposta consciente.',
      beneficios: ['Gestão emocional', 'Equilíbrio hormonal', 'Práticas de regulação', 'Honrar o ciclo menstrual'],
      logo: '/logos/SERENA_LOGO_V3.png',
      cor: 'from-blue-500 to-cyan-600',
      corFundo: 'bg-blue-500/10',
      disponivel: false,
      emBreve: true
    },
    {
      numero: 3,
      nome: 'IGNIS',
      slogan: 'Agir com Direcção',
      chakra: 'Manipura — Plexo Solar',
      descricaoCompleta: 'A vontade é o motor da mudança. O Ignis acende a chama interior que te impulsiona a agir, a tomar decisões alinhadas e a manter o foco mesmo quando a motivação falha. Movimento intencional que respeita o teu corpo.',
      beneficios: ['Movimento intencional', 'Força de vontade', 'Disciplina compassiva', 'Energia vital'],
      logo: '/logos/IGNIS-LOGO-V3.png',
      cor: 'from-orange-500 to-red-600',
      corFundo: 'bg-orange-500/10',
      disponivel: false,
      emBreve: true
    },
    {
      numero: 4,
      nome: 'VENTIS',
      slogan: 'Ritmo Sustentável',
      chakra: 'Anahata — Coração',
      descricaoCompleta: 'A respiração é ponte entre corpo e mente. O Ventis ensina-te a criar ritmos sustentáveis — de sono, de descanso, de energia. Aprende a respirar conscientemente e a recuperar de forma inteligente.',
      beneficios: ['Optimização do sono', 'Técnicas de respiração', 'Gestão de energia', 'Recuperação activa'],
      logo: '/logos/VENTIS_LOGO_V3.png',
      cor: 'from-sky-500 to-blue-600',
      corFundo: 'bg-sky-500/10',
      disponivel: false,
      emBreve: true
    },
    {
      numero: 5,
      nome: 'ECOA',
      slogan: 'A Expressão que Ressoa',
      chakra: 'Vishuddha — Garganta',
      descricaoCompleta: 'A tua voz tem poder. O Ecoa desbloqueia a expressão autêntica, ensina-te a comunicar com clareza e a criar conexões genuínas. Aprende a pedir o que precisas e a dizer não quando necessário.',
      beneficios: ['Comunicação autêntica', 'Expressão criativa', 'Limites saudáveis', 'Conexões verdadeiras'],
      logo: '/logos/ECOA_LOGO_V3.png',
      cor: 'from-pink-500 to-rose-600',
      corFundo: 'bg-pink-500/10',
      disponivel: false,
      emBreve: true
    },
    {
      numero: 6,
      nome: 'LUMINA',
      slogan: 'O Espelho Interior',
      chakra: 'Ajna — Terceiro Olho',
      descricaoCompleta: 'Antes de transformar, é preciso ver. O Lumina é um ritual diário de auto-observação que te ajuda a reconhecer padrões, honrar o teu estado actual e conectar contigo mesma. 7 perguntas simples que geram leituras personalizadas baseadas em 23 padrões.',
      beneficios: ['Check-in diário consciente', 'Leituras personalizadas', 'Reconhecimento de padrões', 'Rastreamento do ciclo'],
      logo: '/logos/lumina-logo_v2.png',
      cor: 'from-purple-500 to-violet-600',
      corFundo: 'bg-purple-500/10',
      disponivel: true,
      link: '/lumina',
      gratuito: true
    },
    {
      numero: 7,
      nome: 'IMAGO',
      slogan: 'O Reflexo da Essência',
      chakra: 'Sahasrara — Coroa',
      descricaoCompleta: 'A imagem exterior reflecte a verdade interior. O Imago ajuda-te a alinhar a forma como te apresentas ao mundo com quem realmente és. Não é sobre seguir tendências — é sobre expressares a tua essência.',
      beneficios: ['Imagem pessoal alinhada', 'Estilo autêntico', 'Presença consciente', 'Auto-expressão'],
      logo: '/logos/IMAGO_LOGO_V3.png',
      cor: 'from-purple-500 to-violet-600',
      corFundo: 'bg-purple-500/10',
      disponivel: false,
      emBreve: true
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !nome) {
      setErro('Por favor preenche todos os campos');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      const { error } = await supabase.from('waitlist').insert({
        nome,
        email,
        produto: 'sete-ecos-geral'
      });

      if (error) {
        if (error.code === '23505') {
          setErro('Este email já está registado');
        } else {
          throw error;
        }
      } else {
        setSucesso(true);
        setNome('');
        setEmail('');
      }
    } catch (err) {
      setErro('Erro ao registar. Tenta novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23]">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
        </div>

        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logos/CENTRO_7ECOS.png" alt="Sete Ecos" className="w-12 h-12" />
            <span className="text-2xl font-bold text-white">Sete Ecos</span>
          </div>
          <div className="flex gap-4">
            <Link to="/lumina" className="px-4 py-2 text-purple-300 hover:text-white transition-colors">
              Lumina
            </Link>
            <Link to="/vitalis" className="px-4 py-2 text-purple-300 hover:text-white transition-colors">
              Vitalis
            </Link>
            <Link to="/vitalis/login" className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
              Entrar
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-amber-200 via-purple-300 to-pink-200 bg-clip-text text-transparent">
              Sete Ecos
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-200 mb-4 max-w-3xl mx-auto">
            Um ecossistema de transformação integral feminina
          </p>
          <p className="text-lg text-purple-300/80 mb-12 max-w-2xl mx-auto">
            Sete caminhos que se complementam para te guiar numa jornada de autodescoberta,
            equilíbrio e plenitude. Cada eco desperta uma dimensão essencial do teu ser.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/lumina"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/20 transition-all border border-white/20"
            >
              💡 Começar pelo Lumina (Gratuito)
            </Link>
            <Link
              to="/vitalis"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
            >
              🌱 Conhecer o Vitalis
            </Link>
          </div>
        </div>
      </header>

      {/* Visual da Flor - Os 7 Ecos */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">A Flor dos Sete Ecos</h2>
            <p className="text-purple-300 max-w-2xl mx-auto">
              Como pétalas de uma flor, cada eco é essencial ao todo.
              Juntos formam um sistema integrado de transformação.
            </p>
          </div>

          {/* Flower Visual */}
          <div className="relative max-w-4xl mx-auto mb-16">
            <div className="flex justify-center items-center">
              <div className="relative w-80 h-80 md:w-96 md:h-96">
                {/* Centro - Aurora */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50 z-20">
                  <div className="text-center">
                    <span className="text-2xl md:text-3xl">✨</span>
                    <p className="text-white text-xs font-bold mt-1">AURORA</p>
                  </div>
                </div>

                {/* Pétalas - 7 Ecos posicionados em círculo */}
                {ecos.map((eco, index) => {
                  const angle = (index * 360 / 7) - 90; // Start from top
                  const radian = (angle * Math.PI) / 180;
                  const radius = 120; // Distance from center
                  const x = Math.cos(radian) * radius;
                  const y = Math.sin(radian) * radius;

                  return (
                    <div
                      key={eco.nome}
                      className={`absolute w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                        eco.disponivel
                          ? 'cursor-pointer hover:scale-110 shadow-lg'
                          : 'opacity-60'
                      }`}
                      style={{
                        left: `calc(50% + ${x}px - 2rem)`,
                        top: `calc(50% + ${y}px - 2rem)`,
                        background: eco.disponivel
                          ? `linear-gradient(135deg, ${eco.cor.includes('emerald') ? '#10b981' : eco.cor.includes('purple') ? '#8b5cf6' : '#6b7280'}, ${eco.cor.includes('emerald') ? '#059669' : eco.cor.includes('purple') ? '#7c3aed' : '#4b5563'})`
                          : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <div className="text-center">
                        <img src={eco.logo} alt={eco.nome} className="w-8 h-8 md:w-10 md:h-10 mx-auto" />
                      </div>
                    </div>
                  );
                })}

                {/* Linhas conectando ao centro */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
                  {ecos.map((eco, index) => {
                    const angle = (index * 360 / 7) - 90;
                    const radian = (angle * Math.PI) / 180;
                    const innerRadius = 50;
                    const outerRadius = 100;
                    const x1 = 50 + Math.cos(radian) * innerRadius / 1.9;
                    const y1 = 50 + Math.sin(radian) * innerRadius / 1.9;
                    const x2 = 50 + Math.cos(radian) * outerRadius / 1.9;
                    const y2 = 50 + Math.sin(radian) * outerRadius / 1.9;

                    return (
                      <line
                        key={eco.nome}
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke={eco.disponivel ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}
                        strokeWidth="2"
                        strokeDasharray={eco.disponivel ? '0' : '4 4'}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Legenda */}
            <div className="flex justify-center gap-8 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-600"></div>
                <span className="text-white/70 text-sm">Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-white/20"></div>
                <span className="text-white/70 text-sm">Em breve</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
                <span className="text-white/70 text-sm">Aurora (destino final)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Módulos Disponíveis */}
      <section className="py-20 bg-gradient-to-r from-purple-900/30 to-indigo-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm uppercase tracking-wider">Começa Agora</span>
            <h2 className="text-4xl font-bold text-white mt-2 mb-4">Módulos Disponíveis</h2>
            <p className="text-purple-300 max-w-2xl mx-auto">
              Dois caminhos já estão abertos para ti. Começa pelo Lumina (gratuito) ou mergulha directamente no Vitalis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* LUMINA */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-3xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all">
              <div className="flex items-start justify-between mb-6">
                <img src="/logos/lumina-logo_v2.png" alt="Lumina" className="w-20 h-20" />
                <span className="px-4 py-2 bg-purple-500/30 text-purple-300 text-sm font-medium rounded-full">
                  ✨ Gratuito
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">LUMINA</h3>
              <p className="text-purple-300 mb-4">O Espelho Interior</p>
              <p className="text-purple-200/80 mb-6">
                Antes de transformar, é preciso ver. Um ritual diário de auto-observação com 7 perguntas
                que geram leituras personalizadas baseadas em 23 padrões únicos.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-purple-200 text-sm">
                  <span className="text-purple-400">✓</span> Check-in diário consciente
                </li>
                <li className="flex items-center gap-2 text-purple-200 text-sm">
                  <span className="text-purple-400">✓</span> 23 padrões de leitura
                </li>
                <li className="flex items-center gap-2 text-purple-200 text-sm">
                  <span className="text-purple-400">✓</span> Rastreamento do ciclo
                </li>
                <li className="flex items-center gap-2 text-purple-200 text-sm">
                  <span className="text-purple-400">✓</span> Histórico de estados
                </li>
              </ul>
              <Link
                to="/lumina"
                className="block w-full py-3 text-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Experimentar Lumina →
              </Link>
            </div>

            {/* VITALIS */}
            <div className="bg-gradient-to-br from-emerald-900/50 to-green-900/50 rounded-3xl p-8 border border-emerald-500/30 hover:border-emerald-400/50 transition-all">
              <div className="flex items-start justify-between mb-6">
                <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-20 h-20" />
                <span className="px-4 py-2 bg-emerald-500/30 text-emerald-300 text-sm font-medium rounded-full">
                  🌱 Premium
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">VITALIS</h3>
              <p className="text-emerald-300 mb-4">A Raiz da Transformação</p>
              <p className="text-emerald-200/80 mb-6">
                Nutrição consciente com metodologia Precision Nutrition. Plano personalizado,
                sistema de porções com as mãos, jejum intermitente e coach IA 24/7.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-emerald-200 text-sm">
                  <span className="text-emerald-400">✓</span> Plano alimentar personalizado
                </li>
                <li className="flex items-center gap-2 text-emerald-200 text-sm">
                  <span className="text-emerald-400">✓</span> Coach Vivianne IA 24/7
                </li>
                <li className="flex items-center gap-2 text-emerald-200 text-sm">
                  <span className="text-emerald-400">✓</span> Receitas e lista de compras
                </li>
                <li className="flex items-center gap-2 text-emerald-200 text-sm">
                  <span className="text-emerald-400">✓</span> Relatórios de progresso
                </li>
              </ul>
              <Link
                to="/vitalis"
                className="block w-full py-3 text-center bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Conhecer Vitalis →
              </Link>
              <p className="text-center text-emerald-400/70 text-sm mt-3">
                A partir de 2.500 MZN/mês
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Em Breve - Outros Ecos */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-amber-400 text-sm uppercase tracking-wider">Em Desenvolvimento</span>
            <h2 className="text-4xl font-bold text-white mt-2 mb-4">Em Breve</h2>
            <p className="text-purple-300 max-w-2xl mx-auto">
              Mais cinco ecos estão a ser preparados com todo o cuidado.
              Regista-te para seres das primeiras a saber quando estiverem disponíveis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecos.filter(e => e.emBreve).map((eco) => (
              <div
                key={eco.nome}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img src={eco.logo} alt={eco.nome} className="w-14 h-14 opacity-70" />
                  <div>
                    <h3 className="text-lg font-bold text-white">{eco.nome}</h3>
                    <p className="text-purple-300 text-sm">{eco.slogan}</p>
                  </div>
                </div>
                <p className="text-xs text-purple-400 mb-3">{eco.chakra}</p>
                <p className="text-purple-200/70 text-sm mb-4 line-clamp-3">
                  {eco.descricaoCompleta}
                </p>
                <div className="flex flex-wrap gap-2">
                  {eco.beneficios.slice(0, 2).map((b, i) => (
                    <span key={i} className="px-2 py-1 bg-white/10 rounded-full text-xs text-purple-300">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aurora - O Destino Final */}
      <section className="py-20 bg-gradient-to-b from-transparent to-amber-900/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-3xl"></div>
            <img src="/logos/AURORA_LOGO_V3.png" alt="Aurora" className="relative w-32 h-32 mx-auto" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">
              Aurora
            </span>
          </h2>
          <p className="text-xl text-amber-200 mb-4">A Coroação — Presença Plena</p>
          <p className="text-purple-300/80 max-w-2xl mx-auto mb-8">
            Ao completares os sete caminhos, atinges a Aurora — o estado de integração
            onde todas as dimensões do teu ser vibram em harmonia.
            Não é um fim, mas um novo começar, com raízes profundas e asas prontas a voar.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 rounded-full">
            <span className="text-amber-300">✨</span>
            <span className="text-white">Desbloqueia ao integrar os 7 ecos</span>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/5 rounded-xl p-6">
              <span className="text-3xl mb-3 block">🌅</span>
              <h3 className="text-white font-bold mb-2">Integração Total</h3>
              <p className="text-purple-300/70 text-sm">
                Corpo, emoção, mente e espírito alinhados numa só direcção.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <span className="text-3xl mb-3 block">🦋</span>
              <h3 className="text-white font-bold mb-2">Transformação Sustentável</h3>
              <p className="text-purple-300/70 text-sm">
                Mudanças que duram porque vêm de dentro, não impostas de fora.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <span className="text-3xl mb-3 block">👑</span>
              <h3 className="text-white font-bold mb-2">Presença Plena</h3>
              <p className="text-purple-300/70 text-sm">
                Viver cada momento com consciência, propósito e paz interior.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20">
        <div className="max-w-xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Junta-te à Jornada</h2>
              <p className="text-purple-300">
                Recebe novidades sobre os novos ecos e acesso antecipado.
              </p>
            </div>

            {sucesso ? (
              <div className="text-center py-8">
                <span className="text-5xl mb-4 block">🎉</span>
                <p className="text-green-400 text-lg font-medium">Obrigada por te juntares!</p>
                <p className="text-purple-300 mt-2">Vamos manter-te informada.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-purple-300 mb-2">Nome</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                    placeholder="O teu nome"
                  />
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                    placeholder="o.teu@email.com"
                  />
                </div>

                {erro && (
                  <p className="text-red-400 text-sm">{erro}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
                >
                  {loading ? 'A registar...' : 'Quero fazer parte'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/logos/CENTRO_7ECOS.png" alt="Sete Ecos" className="w-10 h-10" />
              <span className="text-white font-medium">Sete Ecos</span>
            </div>
            <div className="flex gap-6">
              <Link to="/lumina" className="text-purple-300 hover:text-white transition-colors">Lumina</Link>
              <Link to="/vitalis" className="text-purple-300 hover:text-white transition-colors">Vitalis</Link>
              <a href="https://instagram.com/viv_saraiva" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white transition-colors">
                Instagram
              </a>
            </div>
            <p className="text-purple-400 text-sm">
              © 2024 Sete Ecos. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingGeral;
