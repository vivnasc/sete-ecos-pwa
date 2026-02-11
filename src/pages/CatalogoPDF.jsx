import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Catálogo PDF — 8 páginas A4 prontas a imprimir
 * Ctrl+P → Guardar como PDF
 * Screenshots reais de /public/catalogo/
 * Logos reais de /public/logos/
 */
export default function CatalogoPDF() {
  return (
    <div className="catalogo-root bg-white min-h-screen">
      {/* Barra de acções (não aparece no PDF) */}
      <div className="print:hidden sticky top-0 z-50 bg-[#1a1a2e] text-white px-4 py-3 flex items-center justify-between">
        <Link to="/coach/marketing" className="text-white/70 hover:text-white text-sm">← Marketing</Link>
        <button onClick={() => window.print()} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
          📄 Descarregar PDF
        </button>
      </div>

      {/* ===== PÁG 1: CAPA ===== */}
      <div className="catalogo-page relative flex flex-col items-center justify-center text-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}>
        {/* Decoração */}
        <div style={{ position: 'absolute', top: 60, left: 60, width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: 80, right: 80, width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '30%', right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(124,139,111,0.08)' }} />

        <img src="/logos/SETEECOS_HERO.png" alt="Sete Ecos" className="w-44 h-44 mb-8 drop-shadow-2xl" />
        <h1 className="text-6xl font-bold text-white mb-3 tracking-tight" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>SETE ECOS</h1>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent mb-4" />
        <p className="text-lg text-white/60 mb-2 italic" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Sistema de Transmutação Feminina</p>
        <p className="text-white/30 text-xs mt-12 tracking-widest uppercase">Catálogo de Serviços · 2026</p>
        <p className="text-white/20 text-[10px] mt-1">Maputo, Moçambique</p>

        {/* Footer decorativo */}
        <div className="absolute bottom-8 flex gap-4 items-center">
          <span className="text-white/20 text-[10px]">app.seteecos.com</span>
          <span className="text-white/10">·</span>
          <span className="text-white/20 text-[10px]">+258 85 100 6473</span>
          <span className="text-white/10">·</span>
          <span className="text-white/20 text-[10px]">@seteecos</span>
        </div>
      </div>

      {/* ===== PÁG 2: QUEM SOMOS ===== */}
      <div className="catalogo-page bg-white px-14 py-12 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logos/CENTRO_7ECOS.png" alt="7 Ecos" className="w-12 h-12" />
          <div>
            <h2 className="text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Quem Somos</h2>
            <div className="w-12 h-0.5 bg-green-400 mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <p className="text-gray-700 leading-relaxed text-sm">
              O <strong>Sete Ecos</strong> é um sistema de transformação feminina criado em Moçambique, para mulheres moçambicanas e de língua portuguesa.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm">
              Acreditamos que a saúde da mulher não começa na balança — começa na <strong>relação com o próprio corpo</strong>, com a comida, com as emoções.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm">
              O nosso trabalho combina <strong>nutrição baseada em evidência</strong> com <strong>compreensão emocional</strong>, usando a comida que já conheces: xima, matapa, caril, feijão nhemba.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm">
              Não vendemos dietas. Não vendemos culpa. Vendemos <strong>transformação real</strong>, ao teu ritmo, na tua língua, com a tua comida.
            </p>
          </div>
          <div>
            <div className="bg-gradient-to-br from-[#f8f6f3] to-[#f0ece6] rounded-2xl p-5 mb-4">
              <p className="text-xs text-[#7C8B6F] font-bold uppercase tracking-wider mb-2">A nossa missão</p>
              <p className="text-sm text-gray-600 italic leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '15px' }}>
                "Ajudar cada mulher a ouvir o seu corpo, alimentar-se com consciência e transformar-se sem culpa. Sem dietas importadas. Sem julgamento. Com amor e ciência."
              </p>
              <div className="mt-4 pt-4 border-t border-[#E8E2D9] flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7C8B6F] to-[#5a6b4e] flex items-center justify-center text-white text-sm font-bold">VS</div>
                <div>
                  <p className="font-bold text-sm text-[#4A4035]">Vivianne Saraiva</p>
                  <p className="text-[10px] text-gray-400">Precision Nutrition Level 1 Coach</p>
                  <p className="text-[10px] text-gray-400">Fundadora do Sete Ecos</p>
                </div>
              </div>
            </div>
            <div className="bg-[#1a1a2e] rounded-2xl p-4 text-center">
              <p className="text-white/60 text-[10px] uppercase tracking-wider mb-2">Plataforma completa</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-2xl font-bold text-green-400">7</p><p className="text-[9px] text-white/40">Módulos</p></div>
                <div><p className="text-2xl font-bold text-green-400">83</p><p className="text-[9px] text-white/40">Componentes</p></div>
                <div><p className="text-2xl font-bold text-green-400">3</p><p className="text-[9px] text-white/40">Idiomas</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Os 7 Ecos com logos reais */}
        <div className="mt-auto">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-3">Os 7 Ecos — Pilares da Transformação</p>
          <div className="grid grid-cols-7 gap-2">
            {[
              { nome: 'LUMINA', desc: 'Diagnóstico', cor: '#9b59b6', logo: '/logos/lumina-logo_v2.png', status: 'Activo' },
              { nome: 'VITALIS', desc: 'Nutrição', cor: '#7C8B6F', logo: '/logos/VITALIS_LOGO_V3.png', status: 'Activo' },
              { nome: 'SERENA', desc: 'Emoção', cor: '#3498db', logo: '/logos/SERENA_LOGO_V3.png', status: 'Breve' },
              { nome: 'IGNIS', desc: 'Vontade', cor: '#e74c3c', logo: '/logos/IGNIS-LOGO-V3.png', status: 'Breve' },
              { nome: 'VENTIS', desc: 'Energia', cor: '#1abc9c', logo: '/logos/VENTIS_LOGO_V3.png', status: 'Breve' },
              { nome: 'ECOA', desc: 'Expressão', cor: '#f39c12', logo: '/logos/ECOA_LOGO_V3.png', status: 'Breve' },
              { nome: 'AURORA', desc: 'Integração', cor: '#e91e63', logo: '/logos/AURORA_LOGO_V3.png', status: 'Futuro' },
            ].map(eco => (
              <div key={eco.nome} className="text-center p-2 rounded-xl border" style={{ backgroundColor: eco.cor + '08', borderColor: eco.cor + '20' }}>
                <img src={eco.logo} alt={eco.nome} className="w-10 h-10 mx-auto mb-1 object-contain" />
                <p className="text-[10px] font-bold" style={{ color: eco.cor }}>{eco.nome}</p>
                <p className="text-[8px] text-gray-400">{eco.desc}</p>
                <span className={`text-[7px] px-1.5 py-0.5 rounded-full inline-block mt-1 font-bold ${eco.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {eco.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== PÁG 3: LUMINA ===== */}
      <div className="catalogo-page bg-white px-14 py-12 flex flex-col">
        <div className="flex items-center gap-3 mb-5">
          <img src="/logos/lumina-logo_v2.png" alt="Lumina" className="w-12 h-12" />
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-purple-700" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>LUMINA</h2>
            <p className="text-xs text-purple-400">O teu diagnóstico de transformação</p>
          </div>
          <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold">GRÁTIS</span>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed mb-5">
          O LUMINA é o ponto de entrada no universo Sete Ecos. Em <strong>5 minutos</strong>, fazes um diagnóstico completo da tua relação com a comida, o teu corpo e as tuas emoções. Sem registo, sem compromisso.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img src="/catalogo/Lumina_comecar.jpeg" alt="Lumina Início" className="w-full h-auto" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-900/80 to-transparent p-3">
              <p className="text-white text-[10px] font-bold">INÍCIO</p>
              <p className="text-white/70 text-[8px]">8 perguntas sobre o teu estado</p>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img src="/catalogo/Lumina_leitura.jpeg" alt="Lumina Leitura" className="w-full h-auto" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-900/80 to-transparent p-3">
              <p className="text-white text-[10px] font-bold">LEITURA</p>
              <p className="text-white/70 text-[8px]">Resultado personalizado</p>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img src="/catalogo/Lumina_leitura8-cuidado-proprio.jpeg" alt="Lumina Padrão" className="w-full h-auto" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-900/80 to-transparent p-3">
              <p className="text-white text-[10px] font-bold">PADRÃO</p>
              <p className="text-white/70 text-[8px]">Orientações práticas</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#1a1a2e]">O que descobres:</h3>
            {[
              'O teu padrão emocional dominante',
              'Como a alimentação afecta o teu humor',
              'O que o teu corpo realmente precisa',
              'Leitura personalizada com orientações',
              '23 padrões possíveis, cada um único',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-purple-400 mt-0.5">✦</span> {item}
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">Como aceder</p>
              <p className="text-lg text-purple-900 font-bold mt-1">app.seteecos.com/lumina</p>
              <p className="text-xs text-purple-500 mt-1">100% gratuito · Sem registo · 5 minutos</p>
            </div>
            <div className="bg-gradient-to-r from-purple-100 to-pink-50 rounded-xl p-4">
              <p className="text-xs text-purple-700 font-bold">Ideal para:</p>
              <p className="text-xs text-gray-600 mt-1">Mulheres que querem entender a sua relação com a comida antes de começar qualquer mudança.</p>
            </div>
          </div>
        </div>

        <div className="mt-auto bg-[#1a1a2e] rounded-xl p-4 text-center">
          <p className="text-white/60 text-xs">O LUMINA é a porta de entrada. O próximo passo é o <strong className="text-green-400">VITALIS</strong>.</p>
        </div>
      </div>

      {/* ===== PÁG 4: VITALIS OVERVIEW ===== */}
      <div className="catalogo-page bg-white px-14 py-12 flex flex-col">
        <div className="flex items-center gap-3 mb-5">
          <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-12 h-12" />
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-[#7C8B6F]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>VITALIS</h2>
            <p className="text-xs text-[#7C8B6F]/70">Coaching Nutricional Completo</p>
          </div>
          <span className="bg-[#7C8B6F] text-white px-4 py-1.5 rounded-full text-sm font-bold">PREMIUM</span>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed mb-4">
          Não é uma dieta. É um <strong>sistema de transformação nutricional</strong> desenhado para a mulher moçambicana. Usa a comida que já conheces, respeita o teu ritmo e acompanha-te sem julgamento.
        </p>

        {/* Screenshots reais em grid */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { src: '/catalogo/Vitalis_dashboard.jpeg', label: 'Dashboard', desc: 'Progresso e XP diário' },
            { src: '/catalogo/Vitalis_plano.jpeg', label: 'Plano Alimentar', desc: 'Personalizado por semana' },
            { src: '/catalogo/Vitalis_receitas.jpeg', label: 'Receitas', desc: 'Comida moçambicana' },
            { src: '/catalogo/Vitalis_checkin.jpeg', label: 'Check-in', desc: 'Acompanhamento diário' },
          ].map((s, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden shadow-md">
              <img src={s.src} alt={s.label} className="w-full h-auto" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2d3436]/90 to-transparent p-2">
                <p className="text-white text-[9px] font-bold">{s.label}</p>
                <p className="text-white/60 text-[7px]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Funcionalidades */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { icon: '🍽', titulo: 'Plano Alimentar', desc: 'Xima, matapa, caril — a tua comida, organizada' },
            { icon: '✅', titulo: 'Check-in Diário', desc: 'Regista o teu dia em 30 segundos' },
            { icon: '🍳', titulo: 'Receitas', desc: 'Moçambicanas, saudáveis, fáceis' },
            { icon: '📊', titulo: 'Relatórios', desc: 'Gráficos do teu progresso semanal' },
            { icon: '💬', titulo: 'Chat Coach', desc: 'Fala com a Vivianne directamente' },
            { icon: '🏋️', titulo: 'Treinos', desc: 'Exercícios adaptados, sem ginásio' },
            { icon: '📋', titulo: 'Lista Compras', desc: 'Gerada do teu plano semanal' },
            { icon: '🔄', titulo: 'Espaço Retorno', desc: 'Voltaste atrás? Sem culpa' },
            { icon: '🎯', titulo: 'Gamificação', desc: 'XP, níveis e conquistas' },
          ].map((f, i) => (
            <div key={i} className="bg-[#f8f6f3] rounded-lg p-2.5 flex items-start gap-2">
              <span className="text-lg">{f.icon}</span>
              <div>
                <p className="font-bold text-[10px] text-[#4A4035]">{f.titulo}</p>
                <p className="text-[8px] text-gray-400 leading-tight">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3">
          <div className="relative rounded-xl overflow-hidden shadow-md">
            <img src="/catalogo/Vitalis_espaco-retorno.jpeg" alt="Espaço Retorno" className="w-full h-auto" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2d3436]/90 to-transparent p-2">
              <p className="text-white text-[9px] font-bold">Espaço de Retorno</p>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden shadow-md">
            <img src="/catalogo/Vitalis_relatorios.jpeg" alt="Relatórios" className="w-full h-auto" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2d3436]/90 to-transparent p-2">
              <p className="text-white text-[9px] font-bold">Relatórios Semanais</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PÁG 5: VITALIS DETALHES ===== */}
      <div className="catalogo-page bg-white px-14 py-12 flex flex-col">
        <div className="flex items-center gap-3 mb-5">
          <img src="/logos/VITALIS_LOGO-NOME_V3.png" alt="Vitalis" className="h-8 object-contain" />
          <div className="w-8 h-0.5 bg-[#7C8B6F]" />
          <p className="text-xs text-gray-400">O que vais encontrar lá dentro</p>
        </div>

        <div className="grid grid-cols-2 gap-6 flex-1">
          {/* Coluna screenshots */}
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden shadow-md">
              <img src="/catalogo/Vitalis_registo-refeicoes.jpeg" alt="Registo Refeições" className="w-full h-auto" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2d3436]/90 to-transparent p-3">
                <p className="text-white text-xs font-bold">Registo de Refeições</p>
                <p className="text-white/60 text-[9px]">Acompanha o que comes sem obsessão</p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-md">
              <img src="/catalogo/Vitalis_lumina-abertura.jpeg" alt="Lumina no Vitalis" className="w-full h-auto" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2d3436]/90 to-transparent p-3">
                <p className="text-white text-xs font-bold">LUMINA integrado</p>
                <p className="text-white/60 text-[9px]">Diagnóstico disponível dentro do Vitalis</p>
              </div>
            </div>
          </div>

          {/* Coluna texto */}
          <div className="space-y-4">
            <div className="bg-[#f8f6f3] rounded-xl p-4">
              <p className="font-bold text-sm text-[#4A4035] mb-2">Como funciona?</p>
              <ol className="space-y-2 text-xs text-gray-600">
                <li className="flex gap-2"><span className="bg-[#7C8B6F] text-white rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-bold shrink-0">1</span> Fazes o diagnóstico LUMINA</li>
                <li className="flex gap-2"><span className="bg-[#7C8B6F] text-white rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-bold shrink-0">2</span> Recebes plano alimentar personalizado</li>
                <li className="flex gap-2"><span className="bg-[#7C8B6F] text-white rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-bold shrink-0">3</span> Fazes check-in diário (30 seg)</li>
                <li className="flex gap-2"><span className="bg-[#7C8B6F] text-white rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-bold shrink-0">4</span> Acompanhas progresso nos relatórios</li>
                <li className="flex gap-2"><span className="bg-[#7C8B6F] text-white rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-bold shrink-0">5</span> Falas com a coach quando precisares</li>
              </ol>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <p className="font-bold text-sm text-[#4A4035] mb-2">O que torna o VITALIS diferente?</p>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li>✦ <strong>Comida moçambicana</strong> — xima, matapa, caril, não "quinoa e abacate"</li>
                <li>✦ <strong>Sem contagem de calorias</strong> — usamos porções com a mão</li>
                <li>✦ <strong>Sem julgamento</strong> — o Espaço de Retorno acolhe recaídas</li>
                <li>✦ <strong>Coach real</strong> — não é um bot, é a Vivianne</li>
                <li>✦ <strong>Gamificação</strong> — XP, níveis e conquistas motivam</li>
                <li>✦ <strong>Offline-friendly</strong> — funciona com internet fraca</li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <p className="font-bold text-sm text-purple-700 mb-1">Inclui COMUNIDADE</p>
              <p className="text-xs text-gray-600">Espaço colectivo com Rio (reflexões), Círculos, Fogueira e Sussurros — mulheres a apoiarem-se mutuamente.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PÁG 6: COMUNIDADE ===== */}
      <div className="catalogo-page bg-white px-14 py-12 flex flex-col">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl">⚡</div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Comunidade</h2>
            <p className="text-xs text-gray-400">Espaço colectivo de transformação</p>
          </div>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed mb-5">
          A transformação não se faz sozinha. A Comunidade Sete Ecos é um <strong>espaço seguro</strong> onde mulheres partilham reflexões, desafios e conquistas. Tudo moderado, tudo com propósito.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img src="/catalogo/comunidade.jpeg" alt="Comunidade" className="w-full h-auto" />
          </div>
          <div className="space-y-3">
            {[
              { icon: '🌊', nome: 'O Rio', desc: 'Reflexões guiadas por prompts diários. Partilha pensamentos, lê os de outras.' },
              { icon: '👥', nome: 'Círculos de Eco', desc: 'Grupos de 7-12 mulheres que exploram o mesmo Eco juntas.' },
              { icon: '🔥', nome: 'Fogueira', desc: 'Espaço efémero de 24h. Todas se reúnem num tema.' },
              { icon: '💜', nome: 'Sussurros', desc: 'Mensagens privadas de apoio e encorajamento.' },
            ].map((e, i) => (
              <div key={i} className="flex items-start gap-2 bg-purple-50/50 rounded-lg p-3">
                <span className="text-xl">{e.icon}</span>
                <div>
                  <p className="font-bold text-xs text-[#4A4035]">{e.nome}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto bg-gradient-to-r from-purple-100 via-pink-50 to-purple-100 rounded-xl p-5 text-center">
          <p className="text-sm text-gray-700">A Comunidade está incluída em todos os planos VITALIS.</p>
          <p className="text-xs text-gray-400 mt-1">Não é uma rede social. É um espaço de cura colectiva.</p>
        </div>
      </div>

      {/* ===== PÁG 7: PREÇOS ===== */}
      <div className="catalogo-page bg-white px-14 py-12 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-10 h-10" />
          <div>
            <h2 className="text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Planos e Preços</h2>
            <div className="w-12 h-0.5 bg-[#7C8B6F] mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5 mb-6 flex-1">
          {[
            {
              nome: 'Mensal', preco: '2.500', periodo: 'MZN/mês', destaque: false,
              features: ['Plano alimentar personalizado', 'Receitas moçambicanas', 'Chat directo com coach', 'Treinos guiados', 'Dashboard de progresso', 'Lista de compras automática', 'Check-in diário', 'Comunidade'],
            },
            {
              nome: 'Semestral', preco: '12.500', periodo: 'MZN / 6 meses', destaque: true,
              poupanca: 'Poupas 2.500 MZN', porMes: '2.083 MZN/mês',
              features: ['Tudo do plano mensal', '6 meses de acompanhamento', 'Relatórios semanais', 'Prioridade no chat', 'Espaço de retorno', 'Análise de padrões', 'Poupança de 1 mês inteiro', 'Comunidade'],
            },
            {
              nome: 'Anual', preco: '21.000', periodo: 'MZN / 12 meses', destaque: false,
              poupanca: 'Poupas 9.000 MZN', porMes: '1.750 MZN/mês',
              features: ['Tudo do plano semestral', '12 meses completos', 'Acesso prioritário a novidades', 'Suporte prioritário', 'Maior poupança possível', 'Compromisso total', 'Todas as funcionalidades', 'Comunidade'],
            },
          ].map((plano, i) => (
            <div key={i} className={`rounded-2xl p-5 flex flex-col ${plano.destaque ? 'bg-gradient-to-b from-[#1a1a2e] to-[#0f3460] text-white shadow-2xl scale-[1.03] relative' : 'bg-[#f8f6f3] border border-[#E8E2D9]'}`}>
              {plano.destaque && <div className="absolute -top-2 left-1/2 -translate-x-1/2"><span className="bg-green-400 text-[#1a1a2e] text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Mais Popular</span></div>}
              <h3 className={`text-lg font-bold mt-1 ${plano.destaque ? 'text-white' : 'text-[#4A4035]'}`}>{plano.nome}</h3>
              <p className={`text-3xl font-bold mt-1 ${plano.destaque ? 'text-green-400' : 'text-[#7C8B6F]'}`}>{plano.preco}</p>
              <p className={`text-[10px] ${plano.destaque ? 'text-white/50' : 'text-gray-400'}`}>{plano.periodo}</p>
              {plano.porMes && <p className={`text-[10px] ${plano.destaque ? 'text-green-300/70' : 'text-[#7C8B6F]/60'}`}>{plano.porMes}</p>}
              {plano.poupanca && <span className={`inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full font-bold self-start ${plano.destaque ? 'bg-green-400/20 text-green-300' : 'bg-green-100 text-green-700'}`}>{plano.poupanca}</span>}
              <ul className="mt-3 space-y-1 flex-1">
                {plano.features.map((f, j) => (
                  <li key={j} className={`flex items-start gap-1.5 text-[10px] ${plano.destaque ? 'text-white/70' : 'text-gray-500'}`}>
                    <span className="text-green-400 mt-0.5 text-[8px]">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Pagamento */}
        <div className="bg-[#f8f6f3] rounded-xl p-5">
          <p className="font-bold text-sm text-[#4A4035] mb-3">Métodos de pagamento</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <span className="text-xl">💳</span>
              <div>
                <p className="font-bold text-xs">PayPal / Cartão</p>
                <p className="text-[10px] text-gray-400">Visa, Mastercard, PayPal</p>
                <p className="text-[10px] text-gray-400">Pagamento directo na app</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">📱</span>
              <div>
                <p className="font-bold text-xs">M-Pesa</p>
                <p className="text-[10px] text-gray-400">85 100 6473</p>
                <p className="text-[10px] text-gray-400">Vivianne Santos</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">💬</span>
              <div>
                <p className="font-bold text-xs">WhatsApp</p>
                <p className="text-[10px] text-gray-400">+258 85 100 6473</p>
                <p className="text-[10px] text-gray-400">Envia comprovativo</p>
              </div>
            </div>
          </div>
          <p className="text-[9px] text-gray-300 mt-3 text-center">PayPal/cartão: acesso imediato · M-Pesa: acesso em menos de 1 hora após comprovativo</p>
        </div>
      </div>

      {/* ===== PÁG 8: CONTACTOS ===== */}
      <div className="catalogo-page relative flex flex-col items-center justify-center text-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}>
        <div style={{ position: 'absolute', top: 60, right: 60, width: 150, height: 150, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: 100, left: 40, width: 100, height: 100, borderRadius: '50%', background: 'rgba(124,139,111,0.06)' }} />

        <img src="/logos/SETEECOS_HERO.png" alt="Sete Ecos" className="w-24 h-24 mb-6 drop-shadow-xl" />
        <h2 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Começa Hoje</h2>
        <p className="text-white/40 text-sm mb-8 max-w-sm">O primeiro passo é gratuito. Faz o diagnóstico LUMINA e descobre o que o teu corpo precisa.</p>

        <div className="space-y-3 w-full max-w-md">
          {[
            { icon: '🔮', nome: 'LUMINA (Grátis)', link: 'app.seteecos.com/lumina', desc: 'Diagnóstico em 5 minutos' },
            { icon: '🌱', nome: 'VITALIS', link: 'app.seteecos.com/vitalis', desc: 'Coaching nutricional completo' },
            { icon: '💬', nome: 'WhatsApp', link: '+258 85 100 6473', desc: 'Fala directamente connosco' },
            { icon: '📸', nome: 'Instagram', link: '@seteecos', desc: 'Conteúdo diário' },
            { icon: '🌐', nome: 'Website', link: 'app.seteecos.com', desc: 'Toda a plataforma' },
          ].map((c, i) => (
            <div key={i} className="bg-white/8 backdrop-blur border border-white/10 rounded-xl p-4 flex items-center gap-4 text-left">
              <span className="text-2xl">{c.icon}</span>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">{c.nome}</p>
                <p className="text-white/40 text-xs">{c.desc}</p>
              </div>
              <p className="text-white/50 text-xs">{c.link}</p>
            </div>
          ))}
        </div>

        <div className="absolute bottom-8">
          <p className="text-white/15 text-[9px]">© 2026 Sete Ecos · Maputo, Moçambique · Todos os direitos reservados</p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .catalogo-root { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
        .catalogo-page {
          width: 210mm; min-height: 297mm; margin: 0 auto;
          page-break-after: always; box-sizing: border-box; overflow: hidden;
        }
        @media screen {
          .catalogo-page {
            max-width: 794px; min-height: 1123px; margin: 0 auto;
            box-shadow: 0 4px 30px rgba(0,0,0,0.12); margin-bottom: 24px;
          }
        }
      `}</style>
    </div>
  );
}
