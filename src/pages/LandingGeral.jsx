import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * SETE ECOS - Landing Page Geral
 * landing.app.setecos.com
 *
 * Apresentacao do ecossistema completo dos 7 Ecos
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
      slogan: 'A Raiz da Transformacao',
      descricao: 'Nutricao consciente e adaptacao metabolica',
      logo: '/logos/VITALIS_LOGO_V3.png',
      cor: 'from-emerald-500 to-green-600',
      disponivel: true
    },
    {
      nome: 'AUREA',
      slogan: 'A Luz Interior',
      descricao: 'Autoconhecimento e mentalidade de abundancia',
      logo: '/logos/AUREA_LOGO_V3.png',
      cor: 'from-amber-500 to-yellow-600',
      disponivel: false
    },
    {
      nome: 'SERENA',
      slogan: 'Regular para Fluir',
      descricao: 'Gestao emocional e equilibrio hormonal',
      logo: '/logos/SERENA_LOGO_V3.png',
      cor: 'from-blue-500 to-cyan-600',
      disponivel: false
    },
    {
      nome: 'IGNIS',
      slogan: 'Agir com Direccao',
      descricao: 'Movimento intencional e energia vital',
      logo: '/logos/IGNIS-LOGO-V3.png',
      cor: 'from-orange-500 to-red-600',
      disponivel: false
    },
    {
      nome: 'VENTIS',
      slogan: 'Ritmo Sustentavel',
      descricao: 'Respiracao, sono e recuperacao',
      logo: '/logos/VENTIS_LOGO_V3.png',
      cor: 'from-sky-500 to-blue-600',
      disponivel: false
    },
    {
      nome: 'ECOA',
      slogan: 'A Expressao que Ressoa',
      descricao: 'Comunicacao autentica e conexoes',
      logo: '/logos/ECOA_LOGO_V3.png',
      cor: 'from-pink-500 to-rose-600',
      disponivel: false
    },
    {
      nome: 'IMAGO',
      slogan: 'O Reflexo da Essencia',
      descricao: 'Imagem pessoal alinhada com a alma',
      logo: '/logos/IMAGO_LOGO_V3.png',
      cor: 'from-purple-500 to-violet-600',
      disponivel: false
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
          setErro('Este email ja esta registado');
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
            Um ecossistema de transformacao integral
          </p>
          <p className="text-lg text-purple-300/80 mb-12 max-w-2xl mx-auto">
            Sete caminhos que se complementam para te guiar numa jornada de autodescoberta,
            equilibrio e plenitude. Cada eco desperta uma dimensao essencial do teu ser.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/lumina"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/20 transition-all border border-white/20"
            >
              💡 Comecar pelo Lumina (Gratuito)
            </Link>
            <a
              href="#waitlist"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              Quero saber mais
            </a>
          </div>
        </div>
      </header>

      {/* Lumina Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/50 to-indigo-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-purple-400 text-sm uppercase tracking-wider">Ponto de Partida</span>
              <h2 className="text-4xl font-bold text-white mt-2 mb-6">
                💡 LUMINA
              </h2>
              <p className="text-xl text-purple-200 mb-4">O Espelho Interior</p>
              <p className="text-purple-300/80 mb-6">
                Antes de transformar, e preciso ver. O Lumina e um ritual diario de auto-observacao
                que te ajuda a reconhecer padroes, honrar o teu ciclo e conectar contigo mesma.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-purple-200">
                  <span className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-sm">✓</span>
                  7 perguntas para consciencia diaria
                </li>
                <li className="flex items-center gap-3 text-purple-200">
                  <span className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-sm">✓</span>
                  Leituras personalizadas baseadas nas tuas respostas
                </li>
                <li className="flex items-center gap-3 text-purple-200">
                  <span className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-sm">✓</span>
                  Rastreamento do ciclo menstrual
                </li>
                <li className="flex items-center gap-3 text-purple-200">
                  <span className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-sm">✓</span>
                  100% gratuito
                </li>
              </ul>
              <Link
                to="/lumina"
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Experimentar Lumina →
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <img src="/logos/lumina-logo_v2.png" alt="Lumina" className="w-32 h-32 mx-auto mb-6" />
                <div className="space-y-4">
                  <div className="h-3 bg-white/10 rounded-full w-full"></div>
                  <div className="h-3 bg-white/10 rounded-full w-4/5"></div>
                  <div className="h-3 bg-white/10 rounded-full w-3/5"></div>
                </div>
                <p className="text-center text-purple-300 mt-6 text-sm">
                  "O primeiro passo para a mudanca e a consciencia"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Os 7 Ecos */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Os Sete Caminhos</h2>
            <p className="text-purple-300 max-w-2xl mx-auto">
              Cada eco representa uma dimensao essencial da tua vida.
              Juntos, formam um ecossistema completo de transformacao.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecos.map((eco, index) => (
              <div
                key={eco.nome}
                className={`relative group overflow-hidden rounded-2xl border transition-all duration-300 ${
                  eco.disponivel
                    ? 'border-white/20 hover:border-white/40 cursor-pointer'
                    : 'border-white/10 opacity-70'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${eco.cor} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <img src={eco.logo} alt={eco.nome} className="w-16 h-16" />
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      eco.disponivel
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/10 text-white/50'
                    }`}>
                      {eco.disponivel ? 'Disponivel' : 'Em breve'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{eco.nome}</h3>
                  <p className="text-purple-300 text-sm mb-2">{eco.slogan}</p>
                  <p className="text-purple-400/80 text-sm">{eco.descricao}</p>

                  {eco.disponivel && (
                    <Link
                      to="/vitalis/login"
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

      {/* Aurora - O Destino */}
      <section className="py-20 bg-gradient-to-b from-transparent to-amber-900/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <img src="/logos/AURORA_LOGO_V3.png" alt="Aurora" className="w-24 h-24 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">
              Aurora
            </span>
          </h2>
          <p className="text-xl text-amber-200 mb-4">A Coroacao — Presenca Plena</p>
          <p className="text-purple-300/80 max-w-2xl mx-auto mb-8">
            Ao completares os sete caminhos, atinges a Aurora — o estado de integracao
            onde todas as dimensoes do teu ser vibram em harmonia.
            Nao e um fim, mas um novo comecar, com raizes profundas e asas prontas a voar.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 rounded-full">
            <span className="text-amber-300">✨</span>
            <span className="text-white">Desbloqueia ao completar os 7 ecos</span>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20">
        <div className="max-w-xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Junta-te a Jornada</h2>
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
              <Link to="/vitalis/login" className="text-purple-300 hover:text-white transition-colors">Vitalis</Link>
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
