import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import PartilharSocial from '../components/PartilharSocial';
import WhatsAppMockup from '../components/WhatsAppMockup';

/**
 * ÁUREA - Landing Page
 * "Valor & Presença" - A que merece
 * Redireciona utilizadores com acesso ativo para o dashboard
 */

const LandingAurea = () => {
  const navigate = useNavigate();
  const [faqAberta, setFaqAberta] = useState(null);
  const { session, aureaAccess } = useAuth();

  useEffect(() => {
    // Se já tem acesso, vai direto para o dashboard
    if (aureaAccess) {
      navigate('/aurea/dashboard', { replace: true });
      return;
    }

    // Se tem sessão mas ainda não sabemos o acesso, verificar diretamente
    if (session && !aureaAccess) {
      const checkAccess = async () => {
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', session.user.id)
            .maybeSingle();

          if (userData) {
            const { data: aureaClient } = await supabase
              .from('aurea_clients')
              .select('subscription_status, onboarding_complete')
              .eq('user_id', userData.id)
              .maybeSingle();

            if (aureaClient && ['active', 'trial', 'tester', 'pending'].includes(aureaClient.subscription_status)) {
              if (aureaClient.onboarding_complete) {
                navigate('/aurea/dashboard', { replace: true });
              } else {
                navigate('/aurea/onboarding', { replace: true });
              }
            }
          }
        } catch (err) {
          console.error('Erro ao verificar acesso ÁUREA:', err);
        }
      };
      checkAccess();
    }
  }, [session, aureaAccess, navigate]);

  const planos = {
    mensal: { id: 'monthly', nome: 'Mensal', meses: 1, preco: 975, precoUSD: 15, desconto: 0 },
    semestral: { id: 'semestral', nome: 'Semestral', meses: 6, preco: 5265, precoUSD: 81, desconto: 10 },
    anual: { id: 'annual', nome: 'Anual', meses: 12, preco: 9945, precoUSD: 153, desconto: 15 }
  };

  // Pilares agrupados - atualizado com novas features
  const pilares = [
    {
      nome: 'PRÁTICA',
      subtitulo: 'Ações diárias de auto-valor',
      icone: '✨',
      cor: 'from-amber-500/30 to-amber-600/30',
      features: [
        { icone: '📊', titulo: 'Quota de Presença', desc: 'Define quanto tempo, dinheiro e energia MÍNIMOS reservas para ti por semana.' },
        { icone: '✨', titulo: 'Micro-Práticas', desc: '100+ práticas de 2-5 minutos em 4 categorias: Dinheiro, Tempo, Roupa, Prazer.' },
        { icone: '🎧', titulo: 'Áudio-Meditações', desc: '8+ meditações guiadas para permissão, culpa, valor e rituais.' },
        { icone: '🌙', titulo: 'Rituais', desc: 'Despertar com intenção, ritual da noite, balanço mensal.' }
      ]
    },
    {
      nome: 'VISIBILIDADE',
      subtitulo: 'Ver onde te abandonas',
      icone: '🔍',
      cor: 'from-amber-400/30 to-amber-500/30',
      features: [
        { icone: '💰', titulo: 'Carteira de Merecimento', desc: 'Vê quanto do teu dinheiro vai para TI vs. para os outros.' },
        { icone: '👗', titulo: 'Espelho de Roupa', desc: 'Identifica padrões. Usa as peças "guardadas" no dia-a-dia.' },
        { icone: '🔍', titulo: 'Análise de Padrões', desc: 'Detecta os 5 padrões: culpa, auto-abandono, roupa escondida, dinheiro, justificação.' },
        { icone: '📝', titulo: 'Diário de Merecimento', desc: 'Prompts diários para reconhecer o teu valor.' }
      ]
    },
    {
      nome: 'SUPORTE',
      subtitulo: 'Nunca estás sozinha',
      icone: '💬',
      cor: 'from-amber-600/30 to-amber-700/30',
      features: [
        { icone: '💬', titulo: 'Chat Esmeralda', desc: 'Coach virtual gentil que ajuda a quebrar padrões de culpa e auto-abandono.' },
        { icone: '💎', titulo: 'Sistema de Jóias', desc: 'Cada ação = 1 jóia. Evolui de Bronze a Diamante.' },
        { icone: '📈', titulo: 'Insights Semanais', desc: 'Relatório automático com padrões detectados e celebrações.' },
        { icone: '🔔', titulo: 'Notificações Gentis', desc: 'Lembretes que convidam, nunca culpabilizam.' }
      ]
    }
  ];

  const niveis = [
    {
      nome: 'Bronze',
      subtitulo: 'Despertar',
      icone: '🥉',
      joias: '0-50',
      descricao: 'Estás a começar a ver onde te abandonas',
      desbloqueios: ['Acesso a todas as Micro-Práticas (100+)']
    },
    {
      nome: 'Prata',
      subtitulo: 'Presença',
      icone: '🥈',
      joias: '51-150',
      descricao: 'Já não vives só para os outros',
      desbloqueios: ['Espelho de Roupa avançado', 'Áudio-meditações (5)']
    },
    {
      nome: 'Ouro',
      subtitulo: 'Valor',
      icone: '🥇',
      joias: '151-300',
      descricao: 'Tratas-te como prioridade',
      desbloqueios: ['Diário de Merecimento', 'Ritual Mensal', 'Badge "A que merece"']
    },
    {
      nome: 'Diamante',
      subtitulo: 'Integração',
      icone: '💎',
      joias: '301+',
      descricao: 'És presença plena',
      desbloqueios: ['Comunidade Anónima', 'Certificado completo']
    }
  ];

  const faqs = [
    {
      pergunta: 'Isto é para mulheres que não se miman?',
      resposta: 'É para mulheres que funcionam bem para os outros mas não existem para si próprias. Que sentem culpa quando cuidam de si. Que trabalham, dão, produzem — mas quando chega a hora de gastar tempo, dinheiro ou energia consigo, travam.'
    },
    {
      pergunta: 'Como é diferente de outras apps de auto-cuidado?',
      resposta: 'ÁUREA não te diz para "tomar banhos relaxantes". Trabalha a raiz: a relação com a matéria — dinheiro, roupa, prazer, mimo — sem culpa. Detecta os padrões de auto-sacrifício e ajuda-te a recuperar o direito de existir para ti mesma.'
    },
    {
      pergunta: 'Quanto tempo preciso por dia?',
      resposta: 'As práticas diárias levam 2-5 minutos. O check-in de quota leva 30 segundos. Podes usar mais se quiseres (diário, meditações), mas o mínimo é muito acessível.'
    },
    {
      pergunta: 'Posso experimentar antes de pagar?',
      resposta: 'Sim! Tens 7 dias de trial gratuito com acesso completo. Sem compromisso, sem cartão de crédito. Se no fim dos 7 dias quiseres continuar, escolhes um plano.'
    },
    {
      pergunta: 'E se eu não conseguir manter a prática?',
      resposta: 'ÁUREA não te pressiona. As notificações são gentis, nunca culpabilizam. Se faltares 3 dias, recebes: "Há 3 dias que não te vejo. Voltas quando quiseres." Ao teu ritmo, sempre.'
    }
  ];

  const testemunhos = [
    {
      contacto: 'MF',
      resultado: 'Nível Ouro em 3 meses',
      mensagens: [
        { texto: 'Finalmente percebi porque é que tinha roupas lindas no armário que "nunca usava"', hora: '10:22', tipo: 'recebida' },
        { texto: 'Hoje uso-as. São para mim.', hora: '10:22', tipo: 'recebida' },
      ]
    },
    {
      contacto: 'AS',
      resultado: 'Padrão de culpa reduzido 80%',
      mensagens: [
        { texto: 'O Detector de Culpa abriu-me os olhos', hora: '19:45', tipo: 'recebida' },
        { texto: 'Dizia "os outros precisam mais" 12 vezes por semana. Agora são 2.', hora: '19:46', tipo: 'recebida' },
      ]
    },
    {
      contacto: 'RC',
      resultado: 'De 3% para 12% em 4 meses',
      mensagens: [
        { texto: 'Gastava 3% do meu dinheiro comigo. Hoje são 12%', hora: '08:10', tipo: 'recebida' },
        { texto: 'Não sou egoísta. Sou prioridade também. 💛', hora: '08:11', tipo: 'recebida' },
      ]
    }
  ];

  const handleComecar = () => {
    navigate(session ? '/aurea/pagamento' : '/aurea/login');
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(to bottom, #2D2A24, #3D3830, #2D2A24)' }}>
      <SEOHead
        title="ÁUREA - Valor & Presença | Sete Ecos"
        description="Para mulheres que merecem mais. Micro-práticas diárias, Espelho de Roupa, Carteira de Merecimento e coaching personalizado. Desde 975 MZN/mês."
        url="https://app.seteecos.com/aurea"
        image="https://app.seteecos.com/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "ÁUREA - Valor & Presença",
          "description": "Programa de autoestima e presença para mulheres com micro-práticas diárias e coaching personalizado.",
          "brand": { "@type": "Brand", "name": "Sete Ecos" },
          "offers": [
            { "@type": "Offer", "name": "Mensal", "price": "975", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" },
            { "@type": "Offer", "name": "Semestral", "price": "5265", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" },
            { "@type": "Offer", "name": "Anual", "price": "9945", "priceCurrency": "MZN", "availability": "https://schema.org/InStock" }
          ]
        }}
      />
      {/* Navegação */}
      <nav className="fixed top-0 w-full px-4 md:px-8 py-4 flex justify-between items-center bg-[#2D2A24]/95 backdrop-blur-sm z-50 border-b border-amber-500/20">
        <Link to="/landing" className="flex items-center gap-3">
          <img src="/logos/AUREA_LOGO_V3.png" alt="ÁUREA" className="w-12 h-12" />
          <span className="text-2xl font-bold text-amber-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            ÁUREA
          </span>
        </Link>
        <div className="hidden md:flex gap-6">
          <a href="#features" className="text-amber-100/70 hover:text-amber-200 transition-colors">Funcionalidades</a>
          <a href="#niveis" className="text-amber-100/70 hover:text-amber-200 transition-colors">Níveis</a>
          <a href="#testemunhos" className="text-amber-100/70 hover:text-amber-200 transition-colors">Resultados</a>
          <a href="#precos" className="text-amber-100/70 hover:text-amber-200 transition-colors">Preços</a>
        </div>
        <div className="flex gap-3 items-center">
          <Link
            to="/aurea/login"
            className="px-5 py-2 text-amber-200 font-semibold text-sm hover:text-amber-100 transition-colors"
          >
            Entrar
          </Link>
          <button
            onClick={handleComecar}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-semibold text-sm hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30"
          >
            7 Dias Grátis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Gradientes decorativos */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-amber-500/20 rounded-full mb-6">
            <span className="text-amber-300 text-sm font-medium">✨ Já ajudou +200 mulheres a priorizarem-se</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-amber-100 mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Valor & Presença
          </h1>

          <p className="text-xl md:text-2xl text-amber-200/80 mb-4">
            A que merece
          </p>

          <p className="text-lg text-amber-100/60 max-w-2xl mx-auto mb-8">
            Para mulheres que funcionam bem para os outros mas não existem para si próprias.
            ÁUREA trabalha a relação com dinheiro, roupa, prazer e mimo — sem culpa, sem justificação.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleComecar}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30"
            >
              Começar 7 Dias Grátis
            </button>
            <a
              href="#features"
              className="px-8 py-4 bg-white/10 text-amber-200 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-amber-500/30"
            >
              Ver como funciona
            </a>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-bold text-amber-300">200+</div>
              <div className="text-amber-200/60 text-sm">mulheres activas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-300">100+</div>
              <div className="text-amber-200/60 text-sm">micro-práticas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-300">80%</div>
              <div className="text-amber-200/60 text-sm">redução de culpa</div>
            </div>
          </div>
        </div>
      </section>

      {/* A Ferida */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-900/20 to-amber-800/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-100 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Reconheces-te?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              'Trabalhas a usar tudo nos outros, nada em ti',
              'Sentes culpa quando cuidas de ti',
              'Tens roupas lindas "para ocasiões" que nunca usas',
              'Compras para todos menos para ti',
              'O teu prazer vem sempre por último',
              'Justificas cada gasto contigo',
              'Dizes "não preciso" quando precisas',
              'Sentes que não mereces'
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-amber-500/20">
                <span className="text-amber-400">✓</span>
                <span className="text-amber-100/80">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-amber-200/70 mt-8 text-lg">
            Se marcaste 3 ou mais, ÁUREA foi criada para ti.
          </p>
        </div>
      </section>

      {/* Features - 3 Pilares */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-100 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Como ÁUREA funciona
            </h2>
            <p className="text-amber-200/70 max-w-2xl mx-auto">
              Três pilares para recuperar o teu direito de existir para ti.
            </p>
          </div>

          <div className="space-y-8">
            {pilares.map((pilar, i) => (
              <div key={i} className={`p-6 md:p-8 rounded-2xl bg-gradient-to-r ${pilar.cor} border border-amber-500/30`}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{pilar.icone}</span>
                  <div>
                    <h3 className="text-xl font-bold text-amber-100">{pilar.nome}</h3>
                    <p className="text-amber-200/70 text-sm">{pilar.subtitulo}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  {pilar.features.map((feature, j) => (
                    <div key={j} className="p-4 bg-white/10 rounded-xl">
                      <div className="text-2xl mb-2">{feature.icone}</div>
                      <h4 className="text-amber-100 font-medium mb-1">{feature.titulo}</h4>
                      <p className="text-amber-200/60 text-xs">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={handleComecar}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30"
            >
              Experimentar 7 dias grátis
            </button>
          </div>
        </div>
      </section>

      {/* Sistema de Jóias / Níveis */}
      <section id="niveis" className="py-20 px-4 bg-gradient-to-r from-amber-900/20 to-amber-800/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-100 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Jóias de Ouro
            </h2>
            <p className="text-amber-200/70 max-w-2xl mx-auto">
              Não são pontos arbitrários — são marcadores de evolução real.
              Cada acção de auto-cuidado = 1 jóia.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {niveis.map((nivel, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-2xl border border-amber-500/20 text-center">
                <div className="text-4xl mb-3">{nivel.icone}</div>
                <h3 className="text-xl font-bold text-amber-100">{nivel.nome}</h3>
                <p className="text-amber-300 text-sm mb-2">{nivel.subtitulo}</p>
                <p className="text-amber-200/50 text-xs mb-4">{nivel.joias} jóias</p>
                <p className="text-amber-200/70 text-sm mb-4">"{nivel.descricao}"</p>
                <div className="space-y-1">
                  {nivel.desbloqueios.map((d, j) => (
                    <div key={j} className="text-xs text-amber-300/70 flex items-center gap-1 justify-center">
                      <span>✓</span> {d}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testemunhos */}
      <section id="testemunhos" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-100 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Resultados reais
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testemunhos.map((t, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <WhatsAppMockup
                  mensagens={t.mensagens}
                  contacto={t.contacto}
                  corTema="dourado"
                />
                <span className="inline-block px-4 py-1.5 bg-amber-500/10 text-amber-300 rounded-full text-sm font-semibold border border-amber-500/20">
                  {t.resultado}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quem criou ÁUREA */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-900/20 to-amber-800/20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-amber-100 mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Quem criou ÁUREA
              </h2>
              <p className="text-amber-200/80 mb-4">
                <strong className="text-amber-100">Vivianne Santos</strong> é terapeuta, coach de desenvolvimento pessoal
                e criadora do Sistema Sete Ecos — um caminho de transformação feminina que integra corpo, emoção e espírito.
              </p>
              <p className="text-amber-200/70 mb-4">
                ÁUREA nasceu da observação de um padrão muito comum: mulheres que funcionam bem para todos,
                mas não existem para si próprias. Que trabalham, dão, produzem — mas quando chega a hora de
                gastar tempo, dinheiro ou energia consigo, travam.
              </p>
              <p className="text-amber-200/70 mb-6">
                "Criei ÁUREA para que possas dar a ti mesma permissão de existir — sem culpa, sem justificação.
                Mereces ser prioridade na tua própria vida."
              </p>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <img
                  src="/logos/SETE_ECOS_LOGO.png"
                  alt="Sete Ecos"
                  className="w-10 h-10 opacity-70"
                />
                <span className="text-amber-200/50 text-sm">Parte do Sistema Sete Ecos</span>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">💫</div>
                  <p className="text-amber-200/70 text-sm italic">"Mereces existir para ti."</p>
                  <p className="text-amber-300 text-sm mt-2">— Vivianne Santos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preços */}
      <section id="precos" className="py-20 px-4 bg-gradient-to-r from-amber-900/20 to-amber-800/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-100 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Investimento em ti
            </h2>
            <p className="text-amber-200/70">
              Começa com 7 dias grátis. Sem compromisso.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {Object.values(planos).map((plano, i) => (
              <div
                key={plano.id}
                className={`p-6 rounded-2xl border ${i === 1
                  ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-400'
                  : 'bg-white/5 border-amber-500/20'
                  }`}
              >
                {i === 1 && (
                  <div className="text-center mb-4">
                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                      MAIS POPULAR
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-amber-100 text-center mb-2">{plano.nome}</h3>
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-amber-200">{plano.preco.toLocaleString()}</span>
                  <span className="text-amber-200/70"> MZN</span>
                  {plano.desconto > 0 && (
                    <div className="text-amber-400 text-sm">-{plano.desconto}% desconto</div>
                  )}
                  <div className="text-amber-200/50 text-sm">(${plano.precoUSD} USD)</div>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-amber-200/80 text-sm">
                    <span className="text-amber-400">✓</span> Chat Coach Esmeralda
                  </li>
                  <li className="flex items-center gap-2 text-amber-200/80 text-sm">
                    <span className="text-amber-400">✓</span> 100+ micro-práticas
                  </li>
                  <li className="flex items-center gap-2 text-amber-200/80 text-sm">
                    <span className="text-amber-400">✓</span> Análise de padrões
                  </li>
                  <li className="flex items-center gap-2 text-amber-200/80 text-sm">
                    <span className="text-amber-400">✓</span> 8+ áudio-meditações
                  </li>
                  <li className="flex items-center gap-2 text-amber-200/80 text-sm">
                    <span className="text-amber-400">✓</span> Todas as ferramentas
                  </li>
                </ul>
                <button
                  onClick={handleComecar}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${i === 1
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'
                    : 'bg-white/10 text-amber-200 hover:bg-white/20 border border-amber-500/30'
                    }`}
                >
                  {i === 0 ? 'Experimentar grátis' : i === 1 ? 'Escolher este plano' : 'Subscrever anual'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-amber-100 text-center mb-12" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Perguntas frequentes
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-amber-500/20 rounded-xl overflow-hidden">
                <button
                  onClick={() => setFaqAberta(faqAberta === i ? null : i)}
                  className="w-full p-4 flex justify-between items-center text-left bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-amber-100 font-medium">{faq.pergunta}</span>
                  <span className="text-amber-400 text-xl">{faqAberta === i ? '−' : '+'}</span>
                </button>
                {faqAberta === i && (
                  <div className="p-4 bg-white/5 border-t border-amber-500/20">
                    <p className="text-amber-200/80">{faq.resposta}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-600/20 to-amber-500/20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-100 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            A tua jornada começa agora
          </h2>
          <p className="text-amber-200/80 text-lg mb-4">
            Quantos anos mais vais adiar o direito de existir para ti?
          </p>
          <p className="text-amber-200/60 mb-8">
            7 dias grátis. Sem compromisso. Sem cartão. Cancelas quando quiseres.
          </p>
          <button
            onClick={handleComecar}
            className="px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-xl shadow-amber-500/40 animate-pulse"
          >
            Quero começar HOJE
          </button>
          <p className="text-amber-300/50 text-sm mt-4">
            +200 mulheres já começaram a priorizar-se
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-amber-500/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logos/AUREA_LOGO_V3.png" alt="ÁUREA" className="w-8 h-8" />
            <span className="text-amber-200/70">ÁUREA - Sete Ecos</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/landing" className="text-amber-200/50 hover:text-amber-200">Sete Ecos</Link>
            <a href="/termos.pdf" className="text-amber-200/50 hover:text-amber-200">Termos</a>
            <a href="/privacidade.pdf" className="text-amber-200/50 hover:text-amber-200">Privacidade</a>
          </div>
          <PartilharSocial
            compact
            url="https://app.seteecos.com/aurea"
            titulo="ÁUREA - Valor & Presença"
            texto="Descobre a AUREA, um programa para mulheres que merecem mais."
          />
          <div className="text-amber-200/50 text-sm">
            © 2026 Sete Ecos
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingAurea;
