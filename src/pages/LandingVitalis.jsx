import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * VITALIS - Landing Page Especifica
 * vitalis.app.setecos.com
 *
 * Apresentacao do programa Vitalis com foco em conversao
 */

const LandingVitalis = () => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  const beneficios = [
    {
      icone: '🌱',
      titulo: 'Adaptacao Metabolica',
      descricao: 'Plano personalizado que respeita o teu corpo e os teus ritmos naturais'
    },
    {
      icone: '✋',
      titulo: 'Porcoes com as Maos',
      descricao: 'Sistema simples e intuitivo - sem pesar comida, sem contar calorias'
    },
    {
      icone: '⏱️',
      titulo: 'Jejum Intermitente',
      descricao: 'Protocolos flexiveis adaptados ao teu estilo de vida e ciclo'
    },
    {
      icone: '🔥',
      titulo: 'Queima de Gordura',
      descricao: 'Estrategias baseadas em ciencia para resultados sustentaveis'
    },
    {
      icone: '💬',
      titulo: 'Coach IA (Vivianne)',
      descricao: 'Suporte 24/7 com inteligencia artificial treinada na metodologia'
    },
    {
      icone: '📊',
      titulo: 'Acompanhamento Completo',
      descricao: 'Dashboard com graficos, tendencias e insights personalizados'
    }
  ];

  const testemunhos = [
    {
      nome: 'Maria Silva',
      resultado: '-8kg em 3 meses',
      texto: 'Finalmente encontrei algo que funciona sem me sentir privada. O sistema de porcoes com as maos mudou tudo!',
      avatar: '👩‍🦰'
    },
    {
      nome: 'Ana Costa',
      resultado: 'Mais energia e foco',
      texto: 'O jejum intermitente parecia impossivel ate experimentar com o Vitalis. Agora faz parte natural do meu dia.',
      avatar: '👩‍🦱'
    },
    {
      nome: 'Sofia Martins',
      resultado: '-5kg sem efeito sanfona',
      texto: 'A Vivianne e incrivel! Sempre que tenho duvidas, ela esta la para me ajudar. Parece ter uma coach particular.',
      avatar: '👩'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !nome) {
      setErro('Por favor preenche nome e email');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      const { error } = await supabase.from('waitlist').insert({
        nome,
        email,
        whatsapp: whatsapp || null,
        produto: 'vitalis'
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
        setWhatsapp('');
      }
    } catch (err) {
      setErro('Erro ao registar. Tenta novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F2ED] via-[#E8E4DC] to-[#C5D1BC]">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-[#9CAF88]/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#7C8B6F]/20 rounded-full blur-3xl"></div>
        </div>

        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-12 h-12" />
            <span className="text-2xl font-bold text-[#4A4035]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              VITALIS
            </span>
          </div>
          <div className="flex gap-4">
            <Link to="/" className="px-4 py-2 text-[#6B5C4C] hover:text-[#4A4035] transition-colors">
              Sete Ecos
            </Link>
            <Link to="/vitalis/login" className="px-6 py-2 bg-gradient-to-r from-[#7C8B6F] to-[#9CAF88] text-white rounded-full font-medium hover:shadow-lg transition-all">
              Entrar
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-[#7C8B6F]/20 rounded-full text-[#6B5C4C] text-sm mb-6">
                🌱 Parte do ecossistema Sete Ecos
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-[#4A4035] mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                A Raiz da <br />
                <span className="text-[#7C8B6F]">Transformacao</span>
              </h1>
              <p className="text-xl text-[#6B5C4C] mb-8">
                Um programa de nutricao consciente que respeita o teu corpo,
                os teus ritmos e a tua vida real. Sem dietas restritivas,
                sem culpa, sem obsessao.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/vitalis/login"
                  className="px-8 py-4 bg-gradient-to-r from-[#7C8B6F] to-[#9CAF88] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#7C8B6F]/30 transition-all text-center"
                >
                  Comecar Agora
                </Link>
                <a
                  href="#como-funciona"
                  className="px-8 py-4 bg-white/80 text-[#6B5C4C] rounded-xl font-medium hover:bg-white transition-all text-center border border-[#E8E2D9]"
                >
                  Saber Mais
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#9CAF88]/20 to-[#7C8B6F]/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white rounded-3xl p-6 shadow-xl">
                <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-24 h-24 mx-auto mb-4" />
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl">
                    <span className="text-2xl">✋</span>
                    <div>
                      <p className="font-medium text-[#4A4035]">Porcoes com as maos</p>
                      <p className="text-sm text-[#6B5C4C]">Simples e intuitivo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl">
                    <span className="text-2xl">⏱️</span>
                    <div>
                      <p className="font-medium text-[#4A4035]">Jejum Intermitente</p>
                      <p className="text-sm text-[#6B5C4C]">Protocolos flexiveis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl">
                    <span className="text-2xl">💬</span>
                    <div>
                      <p className="font-medium text-[#4A4035]">Coach IA 24/7</p>
                      <p className="text-sm text-[#6B5C4C]">Vivianne ao teu lado</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#4A4035] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Como Funciona
            </h2>
            <p className="text-[#6B5C4C] max-w-2xl mx-auto">
              Uma metodologia cientifica adaptada a realidade da mulher moderna
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#7C8B6F]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">1️⃣</span>
              </div>
              <h3 className="text-xl font-bold text-[#4A4035] mb-2">Conhece-te</h3>
              <p className="text-[#6B5C4C]">
                Preenches um questionario detalhado sobre a tua saude, rotina,
                preferencias e objetivos. A Vivianne analisa tudo.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#7C8B6F]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">2️⃣</span>
              </div>
              <h3 className="text-xl font-bold text-[#4A4035] mb-2">Recebe o Teu Plano</h3>
              <p className="text-[#6B5C4C]">
                Um plano alimentar 100% personalizado com porcoes em medidas de mao,
                receitas e sugestoes adaptadas a ti.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#7C8B6F]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">3️⃣</span>
              </div>
              <h3 className="text-xl font-bold text-[#4A4035] mb-2">Transforma-te</h3>
              <p className="text-[#6B5C4C]">
                Acompanha o teu progresso, faz check-ins diarios e conversa com a
                Vivianne sempre que precisares de apoio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-20 bg-gradient-to-b from-white to-[#F5F2ED]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#4A4035] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              O Que Inclui
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beneficios.map((b, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-[#E8E2D9]">
                <span className="text-4xl mb-4 block">{b.icone}</span>
                <h3 className="text-xl font-bold text-[#4A4035] mb-2">{b.titulo}</h3>
                <p className="text-[#6B5C4C]">{b.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metodologia */}
      <section className="py-20 bg-[#7C8B6F]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Metodologia <br />Precision Nutrition
              </h2>
              <p className="text-white/90 mb-6">
                O Vitalis e baseado na metodologia Precision Nutrition Level 1,
                uma das mais respeitadas do mundo em coaching nutricional.
                Adaptada ao contexto portugues e as necessidades da mulher moderna.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-white/90">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>
                  Baseada em ciencia, nao em modas
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>
                  Respeita o teu ciclo hormonal
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>
                  Focada em habitos sustentaveis
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>
                  Sem alimentos proibidos
                </li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✋</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Sistema de Porcoes</h3>
                <div className="grid grid-cols-2 gap-4 text-white/90 text-sm">
                  <div className="bg-white/10 rounded-xl p-3">
                    <span className="text-2xl block mb-1">👊</span>
                    <p>Punho = Hidratos</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <span className="text-2xl block mb-1">🤚</span>
                    <p>Palma = Proteina</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <span className="text-2xl block mb-1">👐</span>
                    <p>Mao = Vegetais</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <span className="text-2xl block mb-1">👍</span>
                    <p>Polegar = Gordura</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testemunhos */}
      <section className="py-20 bg-[#F5F2ED]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#4A4035] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              O Que Dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testemunhos.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{t.avatar}</span>
                  <div>
                    <p className="font-bold text-[#4A4035]">{t.nome}</p>
                    <p className="text-sm text-[#7C8B6F]">{t.resultado}</p>
                  </div>
                </div>
                <p className="text-[#6B5C4C] italic">"{t.texto}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final / Waitlist */}
      <section className="py-20 bg-gradient-to-b from-[#F5F2ED] to-[#C5D1BC]">
        <div className="max-w-xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-[#4A4035] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Comeca a Tua Transformacao
              </h2>
              <p className="text-[#6B5C4C]">
                Junta-te a comunidade Vitalis e comeca hoje a cuidar de ti de forma consciente.
              </p>
            </div>

            {sucesso ? (
              <div className="text-center py-8">
                <span className="text-5xl mb-4 block">🌱</span>
                <p className="text-[#7C8B6F] text-lg font-medium">Obrigada! Vamos contactar-te em breve.</p>
                <Link
                  to="/vitalis/login"
                  className="inline-block mt-4 px-6 py-3 bg-[#7C8B6F] text-white rounded-xl"
                >
                  Entrar na App
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#6B5C4C] mb-2">Nome *</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F5F2ED] border border-[#E8E2D9] rounded-xl text-[#4A4035] placeholder-[#A89F91] focus:border-[#7C8B6F] focus:outline-none"
                    placeholder="O teu nome"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#6B5C4C] mb-2">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F5F2ED] border border-[#E8E2D9] rounded-xl text-[#4A4035] placeholder-[#A89F91] focus:border-[#7C8B6F] focus:outline-none"
                    placeholder="o.teu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#6B5C4C] mb-2">WhatsApp (opcional)</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F5F2ED] border border-[#E8E2D9] rounded-xl text-[#4A4035] placeholder-[#A89F91] focus:border-[#7C8B6F] focus:outline-none"
                    placeholder="+351 912 345 678"
                  />
                </div>

                {erro && (
                  <p className="text-red-500 text-sm">{erro}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#7C8B6F] to-[#9CAF88] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#7C8B6F]/30 transition-all disabled:opacity-50"
                >
                  {loading ? 'A registar...' : 'Quero Transformar-me'}
                </button>

                <p className="text-center text-sm text-[#A89F91]">
                  Ja tens conta?{' '}
                  <Link to="/vitalis/login" className="text-[#7C8B6F] hover:underline">
                    Entra aqui
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#4A4035]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-10 h-10" />
              <span className="text-white font-medium">Vitalis</span>
              <span className="text-white/50">|</span>
              <span className="text-white/70 text-sm">by Sete Ecos</span>
            </div>
            <div className="flex gap-6">
              <Link to="/" className="text-white/70 hover:text-white transition-colors">Sete Ecos</Link>
              <Link to="/lumina" className="text-white/70 hover:text-white transition-colors">Lumina</Link>
              <a href="https://instagram.com/viv_saraiva" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                Instagram
              </a>
            </div>
            <p className="text-white/50 text-sm">
              © 2024 Sete Ecos. Metodologia PN Level 1.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingVitalis;
