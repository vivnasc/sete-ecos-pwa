import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * VITALIS - Landing Page Completa
 *
 * Inclui:
 * - Preços completos (MZN e USD)
 * - Secção "Cansada de dietas"
 * - Método Precision Nutrition
 * - 3 Fases da Transformação
 * - Espaço de Retorno
 * - Testemunhos
 * - Coach (Vivianne) com badges
 * - FAQ interactivo
 * - Garantias
 * - Botão WhatsApp flutuante
 */

const LandingVitalis = () => {
  const navigate = useNavigate();
  const [faqAberto, setFaqAberto] = useState(null);

  const planos = [
    {
      id: 'monthly',
      nome: 'Mensal',
      preco_mzn: '2.500',
      preco_usd: '38',
      periodo: '/mês',
      destaque: false,
      descricao: 'Ideal para experimentar'
    },
    {
      id: 'semestral',
      nome: 'Semestral',
      preco_mzn: '12.500',
      preco_usd: '190',
      periodo: '/6 meses',
      destaque: true,
      descricao: 'Mais popular',
      desconto: '17%',
      economia: 'Poupas 2.500 MZN'
    },
    {
      id: 'annual',
      nome: 'Anual',
      preco_mzn: '21.000',
      preco_usd: '320',
      periodo: '/ano',
      destaque: false,
      descricao: 'Melhor valor',
      desconto: '30%',
      economia: 'Poupas 9.000 MZN'
    }
  ];

  const oQueFunciona = [
    'Plano personalizado ao teu corpo e rotina',
    'Sistema de porções simples (com as mãos)',
    'Flexibilidade para a vida real',
    'Suporte contínuo de uma coach',
    'Respeito pelo teu ciclo hormonal',
    'Hábitos sustentáveis a longo prazo'
  ];

  const oQueNaoFunciona = [
    'Dietas genéricas de internet',
    'Contar calorias obsessivamente',
    'Eliminar grupos alimentares',
    'Restrição extrema',
    'Ignorar os sinais do corpo',
    'Fazer tudo sozinha'
  ];

  const fases = [
    {
      numero: '1',
      titulo: 'Fundação',
      duracao: 'Semanas 1-4',
      descricao: 'Construímos as bases: consciência alimentar, hidratação, sono. Sem pressa, sem stress. O corpo começa a confiar.',
      cor: 'from-emerald-400 to-teal-500'
    },
    {
      numero: '2',
      titulo: 'Adaptação',
      duracao: 'Semanas 5-12',
      descricao: 'O metabolismo acorda. Introduzimos o jejum intermitente de forma gentil. Os primeiros resultados aparecem.',
      cor: 'from-teal-400 to-cyan-500'
    },
    {
      numero: '3',
      titulo: 'Transformação',
      duracao: 'Semanas 13+',
      descricao: 'O novo normal. Os hábitos são automáticos. O corpo está em equilíbrio. A transformação é sustentável.',
      cor: 'from-cyan-400 to-blue-500'
    }
  ];

  const espacoRetorno = [
    { emoji: '😰', estado: 'Ansiedade', ferramenta: 'Respiração 4-7-8 + Chá de camomila' },
    { emoji: '😢', estado: 'Tristeza', ferramenta: 'Journaling + Caminhada ao ar livre' },
    { emoji: '😤', estado: 'Frustração', ferramenta: 'Movimento intenso + Água gelada' },
    { emoji: '🍫', estado: 'Vontade de doce', ferramenta: 'Fruta + Canela + Espera 15 min' },
    { emoji: '😴', estado: 'Cansaço', ferramenta: 'Power nap 20 min + Proteína' },
    { emoji: '🌀', estado: 'Overwhelm', ferramenta: 'Uma só coisa + Timer 25 min' }
  ];

  const testemunhos = [
    {
      nome: 'Maria Silva',
      local: 'Maputo',
      resultado: '-8kg em 3 meses',
      texto: 'Finalmente encontrei algo que funciona sem me sentir privada. O sistema de porções com as mãos mudou tudo!',
      avatar: '👩‍🦰'
    },
    {
      nome: 'Ana Costa',
      local: 'Lisboa',
      resultado: 'Mais energia e foco',
      texto: 'O jejum intermitente parecia impossível até experimentar com o Vitalis. Agora faz parte natural do meu dia.',
      avatar: '👩‍🦱'
    },
    {
      nome: 'Sofia Martins',
      local: 'Beira',
      resultado: '-5kg sem efeito sanfona',
      texto: 'A Vivianne é incrível! Sempre que tenho dúvidas, ela está lá para me ajudar. Parece ter uma coach particular.',
      avatar: '👩'
    }
  ];

  const faqs = [
    {
      pergunta: 'Preciso de contar calorias?',
      resposta: 'Não! O Vitalis usa o sistema de porções com as mãos da Precision Nutrition. É simples, intuitivo e funciona em qualquer lugar - até num restaurante ou em casa da avó.'
    },
    {
      pergunta: 'E se eu não gostar de cozinhar?',
      resposta: 'O plano inclui opções simples, refeições rápidas e até sugestões para quando comes fora. Não precisas de ser chef para comer bem.'
    },
    {
      pergunta: 'O jejum intermitente é obrigatório?',
      resposta: 'Não. É uma ferramenta opcional que introduzimos apenas quando faz sentido para ti. Muitas mulheres adoram, outras preferem não usar - e ambas têm resultados.'
    },
    {
      pergunta: 'E durante a menstruação?',
      resposta: 'O Vitalis respeita o teu ciclo. Nas fases mais sensíveis, ajustamos as expectativas e damos-te ferramentas específicas. O teu corpo, as tuas regras.'
    },
    {
      pergunta: 'Posso cancelar a qualquer momento?',
      resposta: 'Sim! Sem compromisso de permanência. Acreditamos que ficas porque queres, não porque tens de ficar.'
    },
    {
      pergunta: 'A coach Vivianne é uma pessoa real?',
      resposta: 'Sim! Vivianne dos Santos é certificada em Precision Nutrition Level 1 e ISSA Fitness Nutrition. A IA do chat foi treinada com a sua metodologia para te dar suporte 24/7.'
    }
  ];

  const garantias = [
    {
      icone: '🛡️',
      titulo: 'Garantia 7 Dias',
      descricao: 'Experimenta sem risco. Se não gostares nos primeiros 7 dias, devolvemos 100% do valor.'
    },
    {
      icone: '💪',
      titulo: 'Garantia 30 Dias',
      descricao: 'Se seguires o programa e não vires mudanças em 30 dias, prolongamos o teu acesso gratuitamente.'
    },
    {
      icone: '💬',
      titulo: 'Suporte Real',
      descricao: 'Não estás sozinha. Chat com IA 24/7 + acesso directo à Vivianne para dúvidas complexas.'
    }
  ];

  const handleComecar = () => {
    navigate('/vitalis/pagamento');
  };

  const whatsappLink = 'https://wa.me/258849061568?text=Olá! Tenho interesse no Vitalis.';

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
            <Link to="/landing" className="px-4 py-2 text-[#6B5C4C] hover:text-[#4A4035] transition-colors">
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
                <span className="text-[#7C8B6F]">Transformação</span>
              </h1>
              <p className="text-xl text-[#6B5C4C] mb-8">
                Um programa de nutrição consciente que respeita o teu corpo,
                os teus ritmos e a tua vida real. Sem dietas restritivas,
                sem culpa, sem obsessão.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleComecar}
                  className="px-8 py-4 bg-gradient-to-r from-[#7C8B6F] to-[#9CAF88] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#7C8B6F]/30 transition-all text-center"
                >
                  Começar Agora
                </button>
                <a
                  href="#precos"
                  className="px-8 py-4 bg-white/80 text-[#6B5C4C] rounded-xl font-medium hover:bg-white transition-all text-center border border-[#E8E2D9]"
                >
                  Ver Preços
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
                      <p className="font-medium text-[#4A4035]">Porções com as mãos</p>
                      <p className="text-sm text-[#6B5C4C]">Simples e intuitivo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl">
                    <span className="text-2xl">⏱️</span>
                    <div>
                      <p className="font-medium text-[#4A4035]">Jejum Intermitente</p>
                      <p className="text-sm text-[#6B5C4C]">Protocolos flexíveis</p>
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

      {/* Cansada de Dietas */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#4A4035] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Cansada de Dietas que Não Funcionam?
            </h2>
            <p className="text-[#6B5C4C] max-w-2xl mx-auto">
              Já tentaste de tudo e nada resulta a longo prazo? Há uma razão para isso.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* O que NÃO funciona */}
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <h3 className="text-xl font-bold text-red-700 mb-6 flex items-center gap-2">
                <span className="text-2xl">❌</span> O que NÃO funciona
              </h3>
              <ul className="space-y-4">
                {oQueNaoFunciona.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-red-800">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* O que FUNCIONA */}
            <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
              <h3 className="text-xl font-bold text-emerald-700 mb-6 flex items-center gap-2">
                <span className="text-2xl">✅</span> O que FUNCIONA
              </h3>
              <ul className="space-y-4">
                {oQueFunciona.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-emerald-800">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* As 3 Fases */}
      <section className="py-20 bg-gradient-to-b from-white to-[#F5F2ED]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#4A4035] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              As 3 Fases da Transformação
            </h2>
            <p className="text-[#6B5C4C] max-w-2xl mx-auto">
              Mudança sustentável não acontece de um dia para o outro. O Vitalis guia-te através de um processo gradual e respeitoso.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {fases.map((fase) => (
              <div key={fase.numero} className="relative">
                <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r ${fase.cor} rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                  {fase.numero}
                </div>
                <div className="bg-white rounded-2xl p-8 pt-10 shadow-lg border border-[#E8E2D9] h-full">
                  <span className="text-sm text-[#7C8B6F] font-medium">{fase.duracao}</span>
                  <h3 className="text-2xl font-bold text-[#4A4035] mt-2 mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {fase.titulo}
                  </h3>
                  <p className="text-[#6B5C4C]">{fase.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metodologia Precision Nutrition */}
      <section className="py-20 bg-[#7C8B6F]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Metodologia <br />Precision Nutrition
              </h2>
              <p className="text-white/90 mb-6">
                O Vitalis é baseado na metodologia Precision Nutrition Level 1,
                uma das mais respeitadas do mundo em coaching nutricional.
                Adaptada ao contexto português e moçambicano, e às necessidades da mulher moderna.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-white/90">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>
                  Baseada em ciência, não em modas
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>
                  Respeita o teu ciclo hormonal
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>
                  Focada em hábitos sustentáveis
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
                <h3 className="text-2xl font-bold text-white mb-4">Sistema de Porções</h3>
                <div className="grid grid-cols-2 gap-4 text-white/90 text-sm">
                  <div className="bg-white/10 rounded-xl p-3">
                    <span className="text-2xl block mb-1">👊</span>
                    <p>Punho = Hidratos</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <span className="text-2xl block mb-1">🤚</span>
                    <p>Palma = Proteína</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <span className="text-2xl block mb-1">👐</span>
                    <p>Mão = Vegetais</p>
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

      {/* Espaço de Retorno */}
      <section className="py-20 bg-gradient-to-b from-[#F5F2ED] to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#4A4035] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              O Espaço de Retorno
            </h2>
            <p className="text-[#6B5C4C] max-w-2xl mx-auto">
              Quando a emoção aperta e a vontade de desistir aparece, tens um lugar seguro.
              Ferramentas práticas para cada estado emocional.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {espacoRetorno.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-md border border-[#E8E2D9] hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{item.emoji}</span>
                  <div>
                    <p className="font-bold text-[#4A4035]">{item.estado}</p>
                    <p className="text-sm text-[#7C8B6F]">{item.ferramenta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coach Vivianne */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-[#7C8B6F] to-[#9CAF88] rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  A Tua Coach: Vivianne
                </h2>
                <p className="text-white/90 mb-6">
                  Não vais estar sozinha nesta jornada. A Vivianne é a criadora do Vitalis
                  e vai acompanhar-te em cada passo - através da IA treinada na sua metodologia
                  e suporte directo para questões mais complexas.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium">
                    🎓 Precision Nutrition L1
                  </span>
                  <span className="px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium">
                    💪 ISSA Fitness Nutrition
                  </span>
                </div>
                <p className="text-white/80 text-sm italic">
                  "Acredito que cada mulher merece uma abordagem personalizada.
                  O teu corpo é único, a tua vida é única - o teu plano também deve ser."
                </p>
              </div>
              <div className="text-center">
                <div className="w-48 h-48 bg-white/20 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-8xl">👩‍⚕️</span>
                </div>
                <p className="text-white font-medium mt-4">Vivianne dos Santos</p>
                <p className="text-white/70 text-sm">Fundadora do Sete Ecos</p>
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
              Histórias Reais
            </h2>
            <p className="text-[#6B5C4C]">Mulheres como tu que decidiram mudar</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testemunhos.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{t.avatar}</span>
                  <div>
                    <p className="font-bold text-[#4A4035]">{t.nome}</p>
                    <p className="text-xs text-[#A89F91]">{t.local}</p>
                    <p className="text-sm text-[#7C8B6F] font-medium">{t.resultado}</p>
                  </div>
                </div>
                <p className="text-[#6B5C4C] italic">"{t.texto}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preços */}
      <section id="precos" className="py-20 bg-gradient-to-b from-[#F5F2ED] to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#4A4035] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Investimento na Tua Transformação
            </h2>
            <p className="text-[#6B5C4C] max-w-2xl mx-auto">
              Escolhe o plano que melhor se adapta a ti. Todos incluem acesso completo ao programa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {planos.map((plano) => (
              <div
                key={plano.id}
                className={`relative rounded-2xl p-8 ${
                  plano.destaque
                    ? 'bg-gradient-to-b from-[#7C8B6F] to-[#5C6B4F] text-white shadow-2xl scale-105'
                    : 'bg-white border border-[#E8E2D9] shadow-lg'
                }`}
              >
                {plano.destaque && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-sm font-bold rounded-full">
                    MAIS POPULAR
                  </span>
                )}
                {plano.desconto && (
                  <span className={`absolute top-4 right-4 px-2 py-1 text-xs font-bold rounded ${
                    plano.destaque ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    -{plano.desconto}
                  </span>
                )}
                <div className="text-center mb-6">
                  <h3 className={`text-xl font-bold mb-2 ${plano.destaque ? 'text-white' : 'text-[#4A4035]'}`}>
                    {plano.nome}
                  </h3>
                  <p className={`text-sm ${plano.destaque ? 'text-white/70' : 'text-[#A89F91]'}`}>
                    {plano.descricao}
                  </p>
                </div>
                <div className="text-center mb-6">
                  <div className={`text-4xl font-bold ${plano.destaque ? 'text-white' : 'text-[#4A4035]'}`}>
                    {plano.preco_mzn} <span className="text-lg">MZN</span>
                  </div>
                  <div className={`text-sm ${plano.destaque ? 'text-white/70' : 'text-[#A89F91]'}`}>
                    ~${plano.preco_usd} USD {plano.periodo}
                  </div>
                  {plano.economia && (
                    <p className={`text-sm mt-2 font-medium ${plano.destaque ? 'text-emerald-300' : 'text-emerald-600'}`}>
                      {plano.economia}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleComecar}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    plano.destaque
                      ? 'bg-white text-[#7C8B6F] hover:bg-white/90'
                      : 'bg-[#7C8B6F] text-white hover:bg-[#6B7A5F]'
                  }`}
                >
                  Escolher {plano.nome}
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-[#A89F91] text-sm mt-8">
            Pagamento seguro via PayPal, cartão ou M-Pesa
          </p>
        </div>
      </section>

      {/* Garantias */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#4A4035] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Sem Risco
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {garantias.map((g, i) => (
              <div key={i} className="text-center p-8 bg-[#F5F2ED] rounded-2xl">
                <span className="text-5xl mb-4 block">{g.icone}</span>
                <h3 className="text-xl font-bold text-[#4A4035] mb-2">{g.titulo}</h3>
                <p className="text-[#6B5C4C]">{g.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#F5F2ED]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#4A4035] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md">
                <button
                  onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left"
                >
                  <span className="font-medium text-[#4A4035]">{faq.pergunta}</span>
                  <span className={`text-2xl text-[#7C8B6F] transition-transform ${faqAberto === i ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {faqAberto === i && (
                  <div className="px-6 pb-4 text-[#6B5C4C]">
                    {faq.resposta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-b from-[#F5F2ED] to-[#C5D1BC]">
        <div className="max-w-xl mx-auto px-6 text-center">
          <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-20 h-20 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-[#4A4035] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Pronta para Começar?
          </h2>
          <p className="text-[#6B5C4C] mb-8">
            A tua transformação começa com uma decisão.
            Não precisas de ser perfeita, só precisas de começar.
          </p>
          <button
            onClick={handleComecar}
            className="px-10 py-4 bg-gradient-to-r from-[#7C8B6F] to-[#9CAF88] text-white rounded-xl font-medium text-lg hover:shadow-lg hover:shadow-[#7C8B6F]/30 transition-all"
          >
            Começar a Minha Transformação
          </button>
          <p className="text-sm text-[#A89F91] mt-4">
            Garantia de 7 dias · Cancela quando quiseres
          </p>
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
              <Link to="/landing" className="text-white/70 hover:text-white transition-colors">Sete Ecos</Link>
              <Link to="/lumina" className="text-white/70 hover:text-white transition-colors">Lumina</Link>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                WhatsApp
              </a>
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

      {/* WhatsApp Floating Button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 hover:scale-110 transition-all z-50"
        aria-label="Contactar via WhatsApp"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
};

export default LandingVitalis;
