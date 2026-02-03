import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * VITALIS - Landing Page
 * Actualizada com cores sage green e features reais da plataforma
 */

const LandingVitalis = () => {
  const navigate = useNavigate();
  const [faqAberta, setFaqAberta] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const planos = {
    mensal: { id: 'monthly', nome: 'Mensal', meses: 1, preco: 2500, precoUSD: 38, desconto: 0 },
    semestral: { id: 'semestral', nome: 'Semestral', meses: 6, preco: 12500, precoUSD: 190, desconto: 17 },
    anual: { id: 'annual', nome: 'Anual', meses: 12, preco: 21000, precoUSD: 320, desconto: 30 }
  };

  const fases = [
    {
      numero: '01',
      nome: 'Inducao',
      duracao: '4-6 semanas',
      icone: '🚀',
      descricao: 'Activar a queima de gordura e reduzir inflamacao. O corpo aprende a usar gordura como combustivel.'
    },
    {
      numero: '02',
      nome: 'Estabilizacao',
      duracao: '6-8 semanas',
      icone: '⚖️',
      descricao: 'Consolidar habitos e introduzir flexibilidade. Aprender a viver sem depender de regras rigidas.'
    },
    {
      numero: '03',
      nome: 'Reeducacao',
      duracao: '6-8 semanas',
      icone: '🦋',
      descricao: 'Autonomia alimentar completa. Liberdade para fazer escolhas conscientes, sem culpa.'
    }
  ];

  const features = [
    {
      icone: '📊',
      titulo: 'Dashboard Inteligente',
      desc: 'Acompanha o teu progresso diario com streak, XP e conquistas. Ve tudo num so lugar.'
    },
    {
      icone: '🍽️',
      titulo: 'Registo de Refeicoes',
      desc: 'Regista refeicoes com porcoes medidas a mao. Sem contar calorias, sem stress.'
    },
    {
      icone: '💧',
      titulo: 'Tracker de Agua',
      desc: 'Acompanha a tua hidratacao diaria com botoes rapidos para registar.'
    },
    {
      icone: '😴',
      titulo: 'Registo de Sono',
      desc: 'Regista horas e qualidade do sono. Correlaciona com o teu progresso.'
    },
    {
      icone: '⏱️',
      titulo: 'Timer de Jejum',
      desc: 'Protocolo 16/8 com notificacoes quando a janela alimentar abre.'
    },
    {
      icone: '🍳',
      titulo: 'Receitas Adaptadas',
      desc: 'Centenas de receitas com ingredientes locais acessiveis.'
    },
    {
      icone: '💬',
      titulo: 'Chat Coach IA',
      desc: 'Conversa com a Vivianne virtual para duvidas e motivacao a qualquer hora.'
    },
    {
      icone: '📈',
      titulo: 'Graficos de Tendencia',
      desc: 'Visualiza a evolucao do peso, agua e sono ao longo do tempo.'
    },
    {
      icone: '💜',
      titulo: 'Espaco de Retorno',
      desc: 'Apoio emocional para quando a emocao pede comida. Unico em Mocambique.'
    },
    {
      icone: '🎯',
      titulo: 'Desafios Semanais',
      desc: 'Missoes para manter a motivacao e ganhar XP extra.'
    },
    {
      icone: '🛒',
      titulo: 'Lista de Compras',
      desc: 'Gera automaticamente a lista do que precisas comprar.'
    },
    {
      icone: '📸',
      titulo: 'Fotos de Progresso',
      desc: 'Regista a tua transformacao visual ao longo do tempo.'
    }
  ];

  const estadosEmocionais = [
    { icone: '🔋', nome: 'Cansaco' },
    { icone: '🌀', nome: 'Ansiedade' },
    { icone: '💧', nome: 'Tristeza' },
    { icone: '🔥', nome: 'Raiva' },
    { icone: '◯', nome: 'Vazio' },
    { icone: '🌑', nome: 'Solidao' },
    { icone: '🪞', nome: 'Negacao' }
  ];

  const testemunhos = [
    {
      iniciais: 'MJ',
      resultado: '-8kg em 3 meses',
      texto: 'Finalmente um metodo que nao me faz sentir em dieta. Perdi 8kg em 3 meses e aprendi a comer sem culpa.'
    },
    {
      iniciais: 'CM',
      resultado: '-6kg em 2 meses',
      texto: 'O Espaco de Retorno mudou tudo. Percebi que comia por ansiedade, nao por fome. Agora sei a diferenca.'
    },
    {
      iniciais: 'AB',
      resultado: '-12kg em 6 meses',
      texto: 'A app e tao facil de usar. Os graficos mostram exactamente o meu progresso e isso motiva imenso.'
    }
  ];

  const faqs = [
    {
      pergunta: 'E realmente diferente das outras dietas?',
      resposta: 'Sim, completamente. Nao e dieta restritiva. E reeducacao alimentar baseada em metodo cientifico (Precision Nutrition) + apoio emocional unico (Espaco de Retorno). Trabalhamos corpo E mente, nao apenas calorias.'
    },
    {
      pergunta: 'Funciona para mim em Mocambique?',
      resposta: 'Totalmente! As receitas usam ingredientes locais acessiveis, as porcoes sao adaptadas, e nao precisas produtos caros importados. O programa foi criado especificamente pensando na realidade mocambicana.'
    },
    {
      pergunta: 'E se eu nao souber usar tecnologia?',
      resposta: 'A app e tao simples como usar WhatsApp. Se sabes enviar mensagem no WhatsApp, consegues usar o Vitalis. E tens suporte para qualquer duvida que apareca.'
    },
    {
      pergunta: 'Quanto tempo ate ver resultados?',
      resposta: 'Primeiros 7 dias: -2 a -4kg (retencao liquidos + desinchaco). Depois: -0.5 a -2kg/semana consistente. Em 3 meses: -8 a -15kg tipico. Mas resultados variam por pessoa.'
    },
    {
      pergunta: 'Preciso comprar suplementos ou produtos especiais?',
      resposta: 'Nao! Zero suplementos obrigatorios, zero shakes, zero produtos vendidos. So comida real que encontras no mercado ou supermercado. O programa e completo como esta.'
    }
  ];

  const handleComecar = () => {
    if (session) {
      navigate('/vitalis/pagamento');
    } else {
      navigate('/vitalis/login');
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(to bottom, #F5F2ED, #E8E4DC, #C5D1BC)' }}>
      {/* Navegacao */}
      <nav className="fixed top-0 w-full px-4 md:px-8 py-4 flex justify-between items-center bg-white/95 backdrop-blur-sm z-50 border-b border-[#E8E2D9]">
        <Link to="/landing" className="flex items-center gap-3">
          <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-12 h-12" />
          <span className="text-2xl font-bold text-[#7C8B6F]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            VITALIS
          </span>
        </Link>
        <div className="hidden md:flex gap-6">
          <a href="#metodo" className="text-[#4A4035] hover:text-[#7C8B6F] transition-colors">Metodo</a>
          <a href="#plataforma" className="text-[#4A4035] hover:text-[#7C8B6F] transition-colors">Plataforma</a>
          <a href="#resultados" className="text-[#4A4035] hover:text-[#7C8B6F] transition-colors">Resultados</a>
          <a href="#precos" className="text-[#4A4035] hover:text-[#7C8B6F] transition-colors">Precos</a>
        </div>
        <button
          onClick={handleComecar}
          className="px-6 py-2 bg-[#7C8B6F] text-white rounded-full font-semibold text-sm hover:bg-[#6B7A5D] transition-all shadow-md"
        >
          Comecar Agora
        </button>
      </nav>

      {/* Hero */}
      <header className="pt-28 pb-16 px-4 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7C8B6F 0%, #6B7A5D 50%, #5A6B4E 100%)' }}>
        <div className="absolute top-[-50%] right-[-20%] w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] bg-[#9CAF88]/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
            <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            VITALIS
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
            A raiz da transformacao
          </p>
          <p className="text-lg text-white/80 mb-2">🌿 Quando o excesso cai, o corpo responde</p>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            Coaching nutricional personalizado baseado no metodo Precision Nutrition.
            App completa com dashboard, receitas, e apoio emocional unico.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleComecar}
              className="px-10 py-4 bg-white text-[#7C8B6F] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Comecar a Transformacao →
            </button>
            <a
              href="#plataforma"
              className="px-10 py-4 bg-white/20 text-white rounded-full font-semibold text-lg hover:bg-white/30 transition-all border border-white/30"
            >
              Ver a Plataforma
            </a>
          </div>
        </div>
      </header>

      {/* Prova Social */}
      <section className="py-12 bg-white border-b-4 border-[#7C8B6F]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#4A4035] mb-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Ja Mudou Vidas. Pode Mudar a Tua.
          </h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-6">
            <div className="text-center">
              <span className="text-4xl md:text-5xl font-bold text-[#7C8B6F]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>84%</span>
              <p className="text-sm text-[#6B5C4C] uppercase tracking-wider">Taxa Sucesso Metodo PN</p>
            </div>
            <div className="text-center">
              <span className="text-4xl md:text-5xl font-bold text-[#7C8B6F]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>100K+</span>
              <p className="text-sm text-[#6B5C4C] uppercase tracking-wider">Profissionais Usam Globalmente</p>
            </div>
          </div>
          <span className="inline-block px-6 py-3 bg-gradient-to-r from-[#7C8B6F] to-[#9CAF88] text-white rounded-full font-semibold">
            🏆 Unico programa com Espaco de Retorno em Mocambique
          </span>
        </div>
      </section>

      {/* O que funciona vs nao funciona */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4A4035] text-center mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Cansada de dietas que nao funcionam?
          </h2>
          <p className="text-center text-[#6B5C4C] mb-10">Nao es tu que falhas. Sao as dietas que te falharam.</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border-2 border-[#E8E2D9] bg-red-50 border-l-4 border-l-red-400">
              <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                ❌ O que NAO funciona
              </h3>
              <ul className="space-y-2 text-[#4A4035]">
                <li className="flex items-start gap-2"><span>❌</span> Contar calorias obsessivamente</li>
                <li className="flex items-start gap-2"><span>❌</span> Pesar cada grama de comida</li>
                <li className="flex items-start gap-2"><span>❌</span> Passar fome para ver resultados</li>
                <li className="flex items-start gap-2"><span>❌</span> Dietas genericas de revista</li>
                <li className="flex items-start gap-2"><span>❌</span> Solucoes rapidas insustentaveis</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border-2 border-[#E8E2D9] bg-[#F5F9F3] border-l-4 border-l-[#7C8B6F]">
              <h3 className="text-xl font-bold text-[#7C8B6F] mb-4 flex items-center gap-2">
                ✅ O que FUNCIONA
              </h3>
              <ul className="space-y-2 text-[#4A4035]">
                <li className="flex items-start gap-2"><span>✅</span> Porcoes medidas com a mao</li>
                <li className="flex items-start gap-2"><span>✅</span> Adaptar o metabolismo gradualmente</li>
                <li className="flex items-start gap-2"><span>✅</span> Plano personalizado a tua vida</li>
                <li className="flex items-start gap-2"><span>✅</span> Comer ate estar satisfeita</li>
                <li className="flex items-start gap-2"><span>✅</span> Acompanhamento que motiva</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Metodo */}
      <section id="metodo" className="py-16 bg-[#F5F2ED]">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4A4035] text-center mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            O Metodo Precision Nutrition
          </h2>
          <p className="text-center text-[#6B5C4C] mb-10 max-w-xl mx-auto">
            Um metodo cientifico que transforma a forma como o teu corpo queima gordura
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icone: '🖐️', titulo: 'Porcoes com a Mao', desc: 'Esquece balancas e apps. A tua mao e a medida perfeita para proteinas, legumes e gorduras.' },
              { icone: '🔥', titulo: 'Adaptacao Metabolica', desc: 'Reprogramamos o teu corpo para queimar gordura como combustivel principal.' },
              { icone: '⏰', titulo: 'Jejum Flexivel', desc: 'Janelas alimentares adaptadas a tua rotina. Tu escolhes o que funciona melhor.' },
              { icone: '💬', titulo: 'Acompanhamento Real', desc: 'Chat coach IA + suporte humano. Nunca estas sozinha nesta jornada.' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border-2 border-[#E8E2D9] hover:border-[#7C8B6F] hover:translate-y-[-3px] hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-[#7C8B6F]/20 to-[#9CAF88]/20 rounded-xl flex items-center justify-center text-3xl mb-4">
                  {item.icone}
                </div>
                <h3 className="text-lg font-bold text-[#7C8B6F] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {item.titulo}
                </h3>
                <p className="text-sm text-[#6B5C4C]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* As 3 Fases */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4A4035] text-center mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            As 3 Fases da Transformacao
          </h2>
          <p className="text-center text-[#6B5C4C] mb-10 max-w-xl mx-auto">
            Um metodo progressivo que respeita o teu corpo e cria resultados duradouros
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {fases.map((fase) => (
              <div key={fase.numero} className="bg-[#F5F2ED] p-8 rounded-2xl border-2 border-[#E8E2D9] text-center relative hover:border-[#7C8B6F] hover:translate-y-[-3px] transition-all">
                <span className="absolute top-3 right-4 text-5xl font-bold text-black/5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {fase.numero}
                </span>
                <div className="w-16 h-16 bg-white border-3 border-[#7C8B6F] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  {fase.icone}
                </div>
                <h3 className="text-xl font-bold text-[#4A4035] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {fase.nome}
                </h3>
                <p className="text-sm text-[#7C8B6F] font-semibold mb-3">{fase.duracao}</p>
                <p className="text-sm text-[#6B5C4C]">{fase.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plataforma/Features */}
      <section id="plataforma" className="py-16 bg-gradient-to-b from-[#7C8B6F] to-[#6B7A5D] text-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            A Plataforma Completa
          </h2>
          <p className="text-center text-white/80 mb-12 max-w-xl mx-auto">
            Tudo o que precisas numa app simples e intuitiva
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <div key={i} className="bg-white/10 backdrop-blur p-5 rounded-2xl border border-white/10 hover:bg-white/20 transition-all group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{feature.icone}</div>
                <h3 className="font-bold text-white mb-2">{feature.titulo}</h3>
                <p className="text-sm text-white/70">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-white/80 mb-4">App disponivel como PWA - instala no telemovel sem ir a App Store</p>
            <button
              onClick={handleComecar}
              className="px-8 py-4 bg-white text-[#7C8B6F] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
            >
              Experimentar Agora →
            </button>
          </div>
        </div>
      </section>

      {/* Espaco de Retorno */}
      <section className="py-16 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #5D4E6D 0%, #3D3249 100%)' }}>
        <div className="absolute top-[-100px] right-[-100px] w-[350px] h-[350px] bg-white/5 rounded-full blur-3xl"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            💜 Espaco de Retorno
          </h2>
          <p className="text-center text-white/80 mb-6">
            Quando a emocao pede comida, ha outra resposta possivel
          </p>
          <p className="text-center text-white/85 max-w-2xl mx-auto mb-8">
            O Vitalis inclui algo que nenhum outro programa oferece: um sistema de apoio emocional
            para os momentos em que o corpo quer comer, mas a verdadeira fome e outra.
          </p>

          <div className="grid grid-cols-3 md:grid-cols-7 gap-3 mb-10">
            {estadosEmocionais.map((estado) => (
              <div key={estado.nome} className="bg-white/10 backdrop-blur p-4 rounded-xl text-center border border-white/10 hover:bg-white/15 transition-all">
                <span className="text-2xl block mb-2">{estado.icone}</span>
                <span className="text-sm font-semibold">{estado.nome}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur p-8 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold text-center mb-6">Como funciona em 90 segundos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { num: 1, titulo: 'Identificar', desc: 'Reconhecer o estado emocional' },
                { num: 2, titulo: 'Pausar', desc: 'Interromper o impulso automatico' },
                { num: 3, titulo: 'Aliviar', desc: 'Usar a resposta adequada' },
                { num: 4, titulo: 'Escolher', desc: 'Decidir com clareza' }
              ].map((passo) => (
                <div key={passo.num} className="text-center">
                  <div className="w-9 h-9 bg-[#7C8B6F] rounded-full flex items-center justify-center mx-auto mb-3 font-semibold">
                    {passo.num}
                  </div>
                  <h4 className="font-semibold mb-1">{passo.titulo}</h4>
                  <p className="text-xs text-white/70">{passo.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Precos */}
      <section id="precos" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4A4035] text-center mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Escolhe o Teu Plano
          </h2>
          <p className="text-center text-[#6B5C4C] mb-10">
            Precos simples. Sem complicacoes.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {Object.entries(planos).map(([key, plano]) => (
              <div
                key={key}
                className={`p-6 rounded-2xl border-2 text-center transition-all cursor-pointer hover:translate-y-[-3px] hover:shadow-lg ${
                  key === 'semestral'
                    ? 'border-[#7C8B6F] bg-white relative'
                    : 'border-[#E8E2D9] bg-[#F5F2ED]'
                }`}
                onClick={() => handleComecar()}
              >
                {key === 'semestral' && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#7C8B6F] text-white text-xs font-semibold rounded-full">
                    Mais Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold text-[#4A4035] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {plano.nome}
                </h3>
                {plano.desconto > 0 && (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mb-3">
                    -{plano.desconto}% desconto
                  </span>
                )}
                <div className="text-3xl font-bold text-[#7C8B6F] mb-1">
                  {plano.preco.toLocaleString('pt-MZ')} <span className="text-sm font-normal text-[#6B5C4C]">MZN</span>
                </div>
                <p className="text-sm text-[#6B5C4C] mb-4">
                  ~${plano.precoUSD} USD
                </p>
                {plano.meses > 1 && (
                  <p className="text-xs text-[#6B5C4C]">
                    {Math.round(plano.preco / plano.meses).toLocaleString('pt-MZ')} MZN/mes
                  </p>
                )}
                <button
                  onClick={handleComecar}
                  className="mt-4 w-full py-3 bg-[#7C8B6F] text-white rounded-full font-semibold hover:bg-[#6B7A5D] transition-all"
                >
                  Escolher →
                </button>
              </div>
            ))}
          </div>

          {/* Garantias */}
          <div className="bg-[#F5F2ED] p-8 rounded-2xl border-2 border-[#E8E2D9]">
            <h3 className="text-2xl font-bold text-[#4A4035] text-center mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              🛡️ Compromisso Vitalis
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icone: '✅', titulo: '7 Dias Garantia', desc: 'Se nao gostares, reembolso total sem perguntas' },
                { icone: '🎯', titulo: 'Resultados em 30 Dias', desc: 'Ou ajustamos teu plano gratuitamente' },
                { icone: '💬', titulo: 'Suporte Incluido', desc: 'WhatsApp sempre disponivel, nunca estas sozinha' },
                { icone: '🚪', titulo: 'Cancela Quando Quiseres', desc: 'Sem multas, sem complicacoes, sem stress' }
              ].map((garantia) => (
                <div key={garantia.titulo} className="flex items-start gap-4">
                  <span className="text-2xl">{garantia.icone}</span>
                  <div>
                    <h4 className="font-bold text-[#7C8B6F]">{garantia.titulo}</h4>
                    <p className="text-sm text-[#6B5C4C]">{garantia.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testemunhos */}
      <section id="resultados" className="py-16 bg-[#F5F2ED]">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4A4035] text-center mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            O Que Dizem as Clientes
          </h2>
          <p className="text-center text-[#6B5C4C] mb-10">Historias reais de transformacao</p>

          <div className="grid md:grid-cols-3 gap-6">
            {testemunhos.map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border-2 border-[#E8E2D9] relative">
                <span className="absolute top-3 left-5 text-5xl text-[#7C8B6F] opacity-30" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  "
                </span>
                <p className="text-[#6B5C4C] italic mb-6 relative z-10">"{t.texto}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#7C8B6F] rounded-full flex items-center justify-center text-white font-semibold">
                    {t.iniciais}
                  </div>
                  <div>
                    <p className="font-bold text-[#4A4035]">{t.iniciais}.</p>
                    <p className="text-sm text-[#7C8B6F]">{t.resultado}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coach */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="text-center md:text-left">
              <div className="relative inline-block">
                <img
                  src="/vivianne-foto.jpeg"
                  alt="Vivianne Saraiva"
                  className="w-64 h-64 object-cover rounded-2xl shadow-lg mx-auto md:mx-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-64 h-64 bg-gradient-to-br from-[#7C8B6F] to-[#6B7A5D] rounded-2xl items-center justify-center text-white text-6xl mx-auto md:mx-0">
                  VS
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
                <span className="px-4 py-2 bg-[#F5F2ED] rounded-full text-xs font-semibold text-[#7C8B6F] border-2 border-[#7C8B6F]">
                  ✓ Precision Nutrition L1
                </span>
                <span className="px-4 py-2 bg-[#F5F2ED] rounded-full text-xs font-semibold text-[#9CAF88] border-2 border-[#9CAF88]">
                  ✓ ISSA Certified
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#4A4035] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Vivianne Saraiva
              </h3>
              <p className="text-[#6B5C4C] mb-4">
                Sou autora de <em>Os 7 Veus</em>, onde exploro os veus que nos separam de nos mesmos.
              </p>
              <p className="text-[#6B5C4C] mb-4">
                Essa mesma sabedoria esta presente no Vitalis: quando o excesso cai - mental, emocional, fisico - o corpo responde.
              </p>
              <div className="bg-[#F5F2ED] p-5 rounded-xl border-l-4 border-[#7C8B6F] italic">
                <p className="text-[#4A4035]">
                  "Juntei ciencia internacional (Precision Nutrition), sabedoria dos 7 Veus, e tecnologia,
                  para criar algo unico em Mocambique: um programa que trata a pessoa inteira, nao apenas o corpo."
                </p>
                <cite className="block text-right font-semibold text-[#7C8B6F] mt-2 not-italic">- Vivianne Saraiva</cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 text-white text-center" style={{ background: 'linear-gradient(135deg, #7C8B6F 0%, #6B7A5D 100%)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Pronta para comecar a tua transformacao?
          </h2>
          <p className="text-white/90 mb-8">Escolhe o teu plano e da o primeiro passo hoje</p>
          <button
            onClick={handleComecar}
            className="px-10 py-4 bg-white text-[#7C8B6F] rounded-full font-semibold text-lg hover:translate-y-[-3px] hover:shadow-lg transition-all"
          >
            Comecar Agora →
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4A4035] text-center mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Perguntas Frequentes
          </h2>
          <p className="text-center text-[#6B5C4C] mb-10">Respondemos as duvidas mais comuns</p>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#F5F2ED] rounded-xl overflow-hidden shadow-sm border border-[#E8E2D9]">
                <button
                  onClick={() => setFaqAberta(faqAberta === i ? null : i)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left font-semibold text-[#4A4035] hover:bg-[#E8E4DC] transition-colors"
                >
                  <span>❓ {faq.pergunta}</span>
                  <span className="text-xl text-[#7C8B6F] ml-4">
                    {faqAberta === i ? '−' : '+'}
                  </span>
                </button>
                {faqAberta === i && (
                  <div className="px-6 pb-5 text-[#6B5C4C] leading-relaxed">
                    {faq.resposta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#4A4035] text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-8 h-8" />
                <h3 className="font-bold text-[#9CAF88]">Vitalis</h3>
              </div>
              <p className="text-white/70 text-sm">
                A raiz da transformacao.<br />
                Quando o excesso cai, o corpo responde.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#9CAF88] mb-3">Contacto</h3>
              <p className="text-white/70 text-sm">📱 +258 84 524 3875</p>
              <p className="text-white/70 text-sm">📧 vitalis@setecos.com</p>
              <p className="text-white/70 text-sm">📍 Maputo, Mocambique</p>
            </div>
            <div>
              <h3 className="font-bold text-[#9CAF88] mb-3">Links</h3>
              <div className="flex flex-col gap-1">
                <a href="#precos" className="text-white/70 text-sm hover:text-white">Precos</a>
                <Link to="/landing" className="text-white/70 text-sm hover:text-white">Sete Ecos</Link>
                <Link to="/lumina" className="text-white/70 text-sm hover:text-white">Lumina</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-white/50 text-sm">
            © 2026 Vitalis · Vivianne Saraiva · Precision Nutrition Level 1 & ISSA Certified
          </div>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a
        href="https://wa.me/258845243875"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-transform z-50"
      >
        💬
      </a>
    </div>
  );
};

export default LandingVitalis;
