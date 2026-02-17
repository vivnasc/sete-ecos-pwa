import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';
import PartilharSocial from '../components/PartilharSocial';
import ScrollReveal from '../components/ScrollReveal';

/**
 * SETE ECOS - Landing Page Geral
 * landing.app.setecos.com
 *
 * Apresentação do ecossistema completo dos 7 Ecos
 */

const LandingGeral = () => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  const ecos = [
    {
      nome: 'VITALIS',
      slogan: 'A Raiz da Transformação',
      descricao: 'O chão do sistema. Corpo, nutrição, peso. Baseado em Precision Nutrition — hábitos pequenos, porções com as mãos, Espaço de Retorno para gatilhos emocionais.',
      detalhe: 'Regista refeições, água, sono, peso. Uso diário + semanal.',
      logo: '/logos/VITALIS_LOGO_V3.png',
      cor: 'from-emerald-500 to-green-600',
      bgCor: 'bg-emerald-500/20',
      disponivel: true,
      modelo: 'Subscrição mensal',
      rota: '/vitalis'
    },
    {
      nome: 'ÁUREA',
      slogan: 'Valor & Presença',
      descricao: 'A que merece. Para mulheres que gastam tudo nos outros e sentem culpa quando cuidam de si. Trabalha a relação com dinheiro, prazer, roupa e mimo — sem culpa.',
      detalhe: 'Quota de Presença, Micro-Práticas diárias, Espelho de Roupa, Carteira de Merecimento.',
      logo: '/logos/AUREA_LOGO_V3.png',
      cor: 'from-amber-500 to-yellow-600',
      bgCor: 'bg-amber-500/20',
      disponivel: true,
      modelo: 'Subscrição mensal',
      rota: '/aurea'
    },
    {
      nome: 'SERENA',
      slogan: 'A Maré Interior',
      descricao: 'O fluxo do sistema. Regulação emocional. Para mulheres em caos emocional — botão SOS para crises, diário emocional, correlação com ciclo menstrual.',
      detalhe: 'Práticas de 3-5 min para momentos de crise + check-in diário.',
      logo: '/logos/SERENA_LOGO_V3.png',
      cor: 'from-blue-500 to-cyan-600',
      bgCor: 'bg-blue-500/20',
      disponivel: true,
      modelo: 'Subscrição mensal',
      rota: '/serena'
    },
    {
      nome: 'IGNIS',
      slogan: 'O Fogo Interior',
      descricao: 'O eixo do sistema. Vontade, direcção, foco. Para mulheres dispersas — define UM foco semanal, regista decisões tomadas e adiadas.',
      detalhe: 'Aprende a dizer não. Clarificação de vontade, não planeamento.',
      logo: '/logos/IGNIS-LOGO-V3.png',
      cor: 'from-orange-500 to-red-600',
      bgCor: 'bg-orange-500/20',
      disponivel: true,
      modelo: 'Subscrição mensal',
      rota: '/ignis'
    },
    {
      nome: 'VENTIS',
      slogan: 'O Fôlego Vital',
      descricao: 'O ritmo do sistema. Energia, pausas, sustentabilidade. Para mulheres em exaustão crónica — mapeia energia, sono, pausas.',
      detalhe: 'Devolve padrões, práticas de respiração, permissão para parar.',
      logo: '/logos/VENTIS_LOGO_V3.png',
      cor: 'from-sky-500 to-blue-600',
      bgCor: 'bg-sky-500/20',
      disponivel: true,
      modelo: 'Subscrição mensal',
      rota: '/ventis'
    },
    {
      nome: 'ECOA',
      slogan: 'A Voz que Ressoa',
      descricao: 'A expressão do sistema. Voz, escrita, desbloqueio. Para mulheres silenciadas — journaling diário, regista o que disse e engoliu.',
      detalhe: 'Práticas vocais, prompts de escrita, celebra expressão.',
      logo: '/logos/ECOA_LOGO_V3.png',
      cor: 'from-pink-500 to-rose-600',
      bgCor: 'bg-pink-500/20',
      disponivel: true,
      modelo: 'Subscrição mensal',
      rota: '/ecoa'
    },
    {
      nome: 'IMAGO',
      slogan: 'O Reflexo da Essência',
      descricao: 'O espelho do sistema. Identidade, auto-imagem. Jornada de 8 semanas com início e fim — práticas de espelho, cartas para si, ritual de nomeação.',
      detalhe: 'Diferente dos outros: não é uso contínuo, é jornada estruturada.',
      logo: '/logos/IMAGO_LOGO_V3.png',
      cor: 'from-purple-500 to-violet-600',
      bgCor: 'bg-purple-500/20',
      disponivel: true,
      modelo: 'Subscrição mensal',
      rota: '/imago'
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
        whatsapp: null,
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
      <SEOHead
        title="SETE ECOS - Sistema de Transmutação Feminina"
        description="Um ecossistema de transformação integral para a mulher moderna. Sete caminhos que se complementam: nutrição, emoção, foco, energia, expressão, visão e identidade."
        url="https://app.seteecos.com/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Sete Ecos",
          "url": "https://app.seteecos.com",
          "description": "Sistema de Transmutação Feminina - Sete caminhos para despertar cada dimensão da tua essência feminina.",
          "inLanguage": "pt",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://app.seteecos.com/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient-animated" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #1a1a2e 50%, #0f0f23 75%, #1a1a2e 100%)' }}>
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
        </div>

        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logos/CENTRO_7ECOS.png" alt="Sete Ecos" className="w-12 h-12 animate-float" />
            <span className="text-2xl font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-titulos)' }}>Sete Ecos</span>
          </div>
          <div className="hidden md:flex gap-4 items-center">
            <a href="#lumina" className="px-4 py-2 text-purple-300 hover:text-white transition-colors tracking-wide text-sm">
              Lumina
            </a>
            <a href="#ecos" className="px-4 py-2 text-emerald-300 hover:text-white transition-colors tracking-wide text-sm">
              Os Ecos
            </a>
            <a href="#comunidade" className="px-4 py-2 text-purple-300 hover:text-white transition-colors tracking-wide text-sm">
              Comunidade
            </a>
          </div>
          <div className="flex gap-3 items-center">
            <Link to="/login" className="px-4 py-2 text-purple-300 hover:text-white transition-colors font-medium text-sm tracking-wide">
              Entrar
            </Link>
            <Link to="/lumina" className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all animate-pulse-glow-purple tracking-wide">
              Começar
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
          <ScrollReveal variant="scale" duration={0.8}>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8" style={{ fontFamily: 'var(--font-titulos)' }}>
              <span className="bg-gradient-to-r from-amber-200 via-purple-300 to-pink-200 bg-clip-text text-transparent">
                Sete Ecos
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <p className="text-xl md:text-2xl text-purple-200 mb-5 max-w-3xl mx-auto leading-relaxed">
              Um ecossistema de transformação integral para a mulher moderna
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.4}>
            <p className="text-lg text-purple-300/80 mb-14 max-w-2xl mx-auto leading-relaxed">
              Sete caminhos que se complementam para te guiar numa jornada de autodescoberta,
              equilíbrio e plenitude. Cada eco desperta uma dimensão essencial do teu ser.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fadeUp" delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/lumina"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-105"
              >
                Começar pelo Lumina (Gratuito)
              </Link>
              <Link
                to="/vitalis"
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 animate-pulse-glow-sage hover:scale-105"
              >
                Ir directo ao Vitalis
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </header>

      {/* O que está disponível */}
      <section id="lumina" className="py-20 bg-gradient-to-r from-emerald-900/30 to-purple-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-2 bg-green-500/20 rounded-full text-green-400 text-sm mb-4 tracking-wide">
                Já disponível
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-5" style={{ fontFamily: 'var(--font-titulos)' }}>Começa a Tua Jornada Hoje</h2>
              <p className="text-purple-300 max-w-2xl mx-auto leading-relaxed">
                Todos os caminhos estão abertos — escolhe onde começar
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Lumina */}
            <ScrollReveal variant="fadeLeft" delay={0.1}>
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-4">
                <img src="/logos/lumina-logo_v2.png" alt="Lumina" className="w-20 h-20" />
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  Gratuito
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">LUMINA</h3>
              <p className="text-purple-300 text-lg mb-4">O Espelho Interior</p>
              <p className="text-purple-400/80 mb-6">
                Antes de transformar, é preciso ver. Ritual diário de auto-observação
                com 8 perguntas para consciência, leituras personalizadas e rastreamento do ciclo.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-purple-200 text-sm">
                  <span className="text-green-400">✓</span> 8 perguntas diárias
                </li>
                <li className="flex items-center gap-2 text-purple-200 text-sm">
                  <span className="text-green-400">✓</span> Leituras personalizadas
                </li>
                <li className="flex items-center gap-2 text-purple-200 text-sm">
                  <span className="text-green-400">✓</span> Rastreamento do ciclo
                </li>
              </ul>
              <Link
                to="/lumina"
                className="block text-center py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 animate-pulse-glow-purple"
              >
                Experimentar Lumina →
              </Link>
            </div>
            </ScrollReveal>

            {/* Vitalis */}
            <ScrollReveal variant="fadeRight" delay={0.2}>
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-4">
                <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-20 h-20" />
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">
                  Desde 2.500 MT/mês
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">VITALIS</h3>
              <p className="text-emerald-300 text-lg mb-4">A Raiz da Transformação</p>
              <p className="text-purple-400/80 mb-6">
                Coaching nutricional baseado em Precision Nutrition. Sem dietas restritivas,
                sem pesar alimentos — porções com as mãos e Espaço de Retorno emocional.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-purple-200 text-sm">
                  <span className="text-green-400">✓</span> Plano personalizado
                </li>
                <li className="flex items-center gap-2 text-purple-200 text-sm">
                  <span className="text-green-400">✓</span> Coach IA (Vivianne)
                </li>
                <li className="flex items-center gap-2 text-purple-200 text-sm">
                  <span className="text-green-400">✓</span> Resultados sustentáveis
                </li>
              </ul>
              <Link
                to="/vitalis"
                className="block text-center py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 animate-pulse-glow-sage"
              >
                Conhecer Vitalis →
              </Link>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Flor dos 7 Ecos */}
      <section id="ecos" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-5" style={{ fontFamily: 'var(--font-titulos)' }}>Os Sete Caminhos</h2>
              <p className="text-purple-300 max-w-2xl mx-auto leading-relaxed">
                Cada eco representa uma dimensão essencial da tua vida.
                Juntos, formam um ecossistema completo de transformação.
              </p>
            </div>
          </ScrollReveal>

          {/* Flor Visual */}
          <ScrollReveal variant="scale" delay={0.2}>
          <div className="relative max-w-lg mx-auto mb-16" style={{ aspectRatio: '1/1' }}>
            {/* Centro */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                <img src="/logos/CENTRO_7ECOS.png" alt="Tu" className="w-16 h-16" />
              </div>
              <p className="text-center text-white/60 text-sm mt-2">Tu</p>
            </div>

            {/* Pétalas */}
            {ecos.map((eco, index) => {
              const angle = (index * 360 / 7) - 90;
              const radius = 42;
              const x = 50 + radius * Math.cos(angle * Math.PI / 180);
              const y = 50 + radius * Math.sin(angle * Math.PI / 180);

              return (
                <div
                  key={eco.nome}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                    eco.disponivel ? 'cursor-pointer hover:scale-110' : 'opacity-60'
                  }`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => eco.rota && window.location.assign(eco.rota)}
                >
                  <div className={`w-20 h-20 ${eco.bgCor} rounded-full flex items-center justify-center border-2 ${
                    eco.disponivel ? 'border-white/30' : 'border-white/10'
                  }`}>
                    <img src={eco.logo} alt={eco.nome} className="w-14 h-14" />
                  </div>
                  <p className="text-center text-white text-xs mt-1 font-medium">{eco.nome}</p>
                  <span className={`block text-center text-xs px-2 py-0.5 rounded-full mt-1 ${
                    eco.disponivel ? 'bg-green-500/30 text-green-400' : 'bg-white/10 text-white/50'
                  }`}>
                    {eco.disponivel ? 'Aberto' : 'Breve'}
                  </span>
                </div>
              );
            })}

            {/* Linhas conectoras */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              {ecos.map((eco, index) => {
                const angle = (index * 360 / 7) - 90;
                const radius = 42;
                const x = 50 + radius * Math.cos(angle * Math.PI / 180);
                const y = 50 + radius * Math.sin(angle * Math.PI / 180);
                return (
                  <line
                    key={eco.nome}
                    x1="50%"
                    y1="50%"
                    x2={`${x}%`}
                    y2={`${y}%`}
                    stroke={eco.disponivel ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
          </div>
          </ScrollReveal>

          {/* Cards detalhados */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecos.map((eco) => (
              <div
                key={eco.nome}
                className={`relative group overflow-hidden rounded-2xl border transition-all duration-300 ${
                  eco.disponivel
                    ? 'border-white/20 hover:border-white/40 cursor-pointer'
                    : 'border-white/10 opacity-80'
                }`}
                onClick={() => eco.rota && window.location.assign(eco.rota)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${eco.cor} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <img src={eco.logo} alt={eco.nome} className="w-16 h-16" />
                    <div className="text-right">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        eco.disponivel
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/10 text-white/50'
                      }`}>
                        {eco.disponivel ? 'Disponível' : 'Em breve'}
                      </span>
                      <p className="text-xs text-white/40 mt-1">{eco.modelo}</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{eco.nome}</h3>
                  <p className="text-purple-300 text-sm mb-3">{eco.slogan}</p>
                  <p className="text-purple-400/80 text-sm mb-3">{eco.descricao}</p>
                  <p className="text-purple-500/60 text-xs italic">{eco.detalhe}</p>

                  {eco.disponivel && (
                    <Link
                      to={eco.rota}
                      className="mt-4 inline-block text-sm text-purple-300 hover:text-white transition-colors"
                    >
                      Explorar →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comunidade - Espaço de Autoconhecimento */}
      <section id="comunidade" className="py-24 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal variant="fadeUp">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm mb-4 tracking-wide">
                Espaço Colectivo
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-5" style={{ fontFamily: 'var(--font-titulos)' }}>Comunidade de Autoconhecimento</h2>
              <p className="text-purple-300 max-w-2xl mx-auto leading-relaxed">
                Mais do que uma rede social — um espaço sagrado onde mulheres partilham reflexões,
                oferecem ressonância e caminham juntas na transformação.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <ScrollReveal variant="fadeUp" delay={0.1}>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-7 border border-purple-500/20 text-center hover:border-purple-500/40 transition-all duration-300 hover:scale-[1.03]">
                <span className="text-4xl block mb-3">🌊</span>
                <h3 className="text-lg font-bold text-white mb-2">O Rio</h3>
                <p className="text-purple-300/80 text-sm leading-relaxed">Um diário colectivo de reflexões guiadas. Partilha pensamentos profundos com prompts de autoconhecimento.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.2}>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-7 border border-orange-500/20 text-center hover:border-orange-500/40 transition-all duration-300 hover:scale-[1.03]">
                <span className="text-4xl block mb-3">🔥</span>
                <h3 className="text-lg font-bold text-white mb-2">Fogueira</h3>
                <p className="text-purple-300/80 text-sm leading-relaxed">Um espaço efémero de 24 horas. Todas se reúnem em torno de um tema. Quando o fogo apaga, ficam as cinzas da memória.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.3}>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-7 border border-pink-500/20 text-center hover:border-pink-500/40 transition-all duration-300 hover:scale-[1.03]">
                <span className="text-4xl block mb-3">👥</span>
                <h3 className="text-lg font-bold text-white mb-2">Círculos de Eco</h3>
                <p className="text-purple-300/80 text-sm leading-relaxed">Pequenos grupos de 7-12 mulheres que exploram o mesmo caminho. Intimidade, apoio e partilha verdadeira.</p>
              </div>
            </ScrollReveal>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">✨</span>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Ressonância, não Likes</h3>
                <p className="text-purple-300/80 text-sm mb-3">
                  Aqui não existem likes. Ofereces <strong className="text-purple-200">ressonância</strong> — cinco formas de reconhecer o que alguém partilhou:
                  Ressoo, Luz, Força, Espelho, Raiz. Cada uma com um significado profundo.
                </p>
                <div className="flex gap-3 text-xl">
                  <span title="Ressoo">🫧</span>
                  <span title="Luz">💡</span>
                  <span title="Força">💪</span>
                  <span title="Espelho">🪞</span>
                  <span title="Raiz">🌿</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              to="/comunidade"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all inline-block"
            >
              Entrar na Comunidade
            </Link>
          </div>
        </div>
      </section>

      {/* Todos os Ecos activos */}
      <section className="py-16 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-2 bg-green-500/20 rounded-full text-green-300 text-sm mb-6">
            ✨ Ecossistema completo
          </span>
          <h2 className="text-3xl font-bold text-white mb-4">Todos os Caminhos Abertos</h2>
          <p className="text-purple-300 mb-8 max-w-2xl mx-auto">
            Os sete ecos estão prontos para te acompanhar. Escolhe o que mais ressoa contigo
            e começa a tua jornada de transformação integral.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ecos.map(eco => (
              <Link key={eco.nome} to={eco.rota} className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all">
                <img src={eco.logo} alt={eco.nome} className="w-12 h-12 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">{eco.nome}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Aurora - O Destino */}
      <section className="py-24 bg-gradient-to-b from-transparent to-amber-900/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal variant="scale">
            <img src="/logos/AURORA_LOGO_V3.png" alt="Aurora" className="w-24 h-24 mx-auto mb-6 animate-float" />
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.15}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5" style={{ fontFamily: 'var(--font-titulos)' }}>
            <span className="bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">
              Aurōra
            </span>
          </h2>
          <p className="text-xl text-amber-200 mb-5">A Coroação — Presença Plena</p>
          <p className="text-purple-300/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Ao completares os sete caminhos, atinges a Aurōra — o estado de integração
            onde todas as dimensões do teu ser vibram em harmonia.
            Não é um fim, mas um novo começar, com raízes profundas e asas prontas a voar.
          </p>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.3}>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 max-w-md mx-auto">
            <p className="text-sm text-purple-300 mb-3">
              O culminar da tua transformação integral
            </p>
            <Link
              to="/aurora"
              className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 animate-pulse-glow"
            >
              Conhecer Aurōra →
            </Link>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Vivianne - Quem está por trás */}
      <section className="py-20 bg-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="text-center md:text-left">
              <div className="relative inline-block">
                <img
                  src="/vivianne-foto.jpg.jpeg"
                  alt="Vivianne Saraiva"
                  className="w-48 h-48 object-cover rounded-2xl shadow-lg mx-auto md:mx-0 border-2 border-purple-500/30"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-48 h-48 bg-gradient-to-br from-amber-400 to-purple-500 rounded-2xl items-center justify-center text-white text-5xl mx-auto md:mx-0">
                  VS
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Vivianne Saraiva
              </h3>
              <p className="text-amber-300 text-sm font-semibold mb-4">Criadora do Sistema Sete Ecos</p>

              <p className="text-purple-300/80 mb-4">
                Autora de <em className="text-purple-200">Os 7 Véus</em>, onde exploro os véus que nos separam de nós mesmas.
                O Sistema Sete Ecos nasce dessa mesma sabedoria: cada eco é um véu a ser transcendido.
              </p>

              <p className="text-purple-300/80 mb-6">
                Certificada em Precision Nutrition e ISSA, combino ciência, espiritualidade e tecnologia
                para criar ferramentas de transformação únicas em Moçambique.
              </p>

              <a
                href="https://wa.me/258851006473?text=Olá%20Vivianne%2C%20vim%20do%20Sete%20Ecos%20e%20gostaria%20de%20saber%20mais."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full font-semibold hover:bg-[#20BD5A] transition-all"
              >
                💬 Falar com Vivianne
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Lumina CTA - Funil Gratuito */}
      <section id="lumina-cta" className="py-24">
        <div className="max-w-xl mx-auto px-6">
          <ScrollReveal variant="scale">
          <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-3xl p-10 border border-purple-500/20 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-purple-500/20 rounded-full flex items-center justify-center">
              <img src="/logos/lumina-eye.png" alt="Lumina" className="w-12 h-12" onError={(e) => { e.target.style.display='none'; }} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-titulos)' }}>
              Começa por te Conhecer
            </h2>
            <p className="text-purple-200 mb-2 text-lg">
              O <strong>LUMINA</strong> é um diagnóstico gratuito que revela padrões sobre a tua energia, emoção e corpo.
            </p>
            <p className="text-purple-300/80 mb-6 text-sm">
              8 perguntas. 2 minutos. Uma leitura que pode mudar o teu dia.
            </p>

            <div className="flex flex-col gap-3 items-center">
              <Link
                to="/lumina"
                className="w-full max-w-xs py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 text-center block animate-pulse-glow-purple"
              >
                Fazer o Meu Diagnóstico Gratuito
              </Link>
              <span className="text-purple-400/60 text-xs">Sem registo obrigatório · 100% gratuito</span>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { num: '8', label: 'Perguntas' },
                { num: '2 min', label: 'Duração' },
                { num: '23', label: 'Padrões' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{s.num}</div>
                  <div className="text-xs text-purple-300/70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* WhatsApp Flutuante */}
      <a
        href="https://wa.me/258851006473?text=Olá%20Vivianne%2C%20vim%20do%20Sete%20Ecos%20e%20gostaria%20de%20saber%20mais."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-transform z-50"
        title="Falar no WhatsApp"
      >
        💬
      </a>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/logos/CENTRO_7ECOS.png" alt="Sete Ecos" className="w-8 h-8" />
                <h3 className="font-bold text-amber-200">Sete Ecos</h3>
              </div>
              <p className="text-purple-300/70 text-sm">
                Sete caminhos. Uma transformação completa.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-amber-200 mb-3">Contacto</h3>
              <p className="text-purple-300/70 text-sm">📱 +258 85 100 6473</p>
              <p className="text-purple-300/70 text-sm">📧 feedback@seteecos.com</p>
              <p className="text-purple-300/70 text-sm">📍 Maputo, Moçambique</p>
              <div className="flex gap-4 mt-3">
                <a href="https://instagram.com/viv_saraiva" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white transition-colors text-sm">
                  Instagram
                </a>
                <a href="https://wa.me/258851006473" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white transition-colors text-sm">
                  WhatsApp
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-amber-200 mb-3">Ecos Disponíveis</h3>
              <div className="flex flex-col gap-1">
                <Link to="/lumina" className="text-purple-300/70 text-sm hover:text-white transition-colors">Lumina (Gratuito)</Link>
                <Link to="/vitalis" className="text-purple-300/70 text-sm hover:text-white transition-colors">Vitalis</Link>
                <Link to="/aurea" className="text-purple-300/70 text-sm hover:text-white transition-colors">Áurea</Link>
                <Link to="/serena" className="text-purple-300/70 text-sm hover:text-white transition-colors">Serena</Link>
                <Link to="/ignis" className="text-purple-300/70 text-sm hover:text-white transition-colors">Ignis</Link>
                <Link to="/ventis" className="text-purple-300/70 text-sm hover:text-white transition-colors">Ventis</Link>
                <Link to="/ecoa" className="text-purple-300/70 text-sm hover:text-white transition-colors">Ecoa</Link>
                <Link to="/imago" className="text-purple-300/70 text-sm hover:text-white transition-colors">Imago</Link>
                <Link to="/comunidade" className="text-purple-300/70 text-sm hover:text-white transition-colors">Comunidade</Link>
              </div>
            </div>
          </div>
          <div className="flex justify-center mb-6">
            <PartilharSocial
              compact
              url="https://app.seteecos.com/"
              titulo="Sete Ecos - Sistema de Transmutação Feminina"
              texto="Descobre os Sete Ecos, uma jornada de transformação feminina integral."
            />
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-purple-400/50 text-sm">
            © 2026 Sete Ecos · Vivianne Saraiva · Todos os direitos reservados
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingGeral;
