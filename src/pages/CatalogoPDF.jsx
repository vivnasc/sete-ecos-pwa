import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Catálogo PDF v4 — 8 páginas A4 que preenchem toda a página
 * Ctrl+P → Guardar como PDF
 * Screenshots reais de /public/catalogo/
 * Logos reais de /public/logos/
 * Identidade visual: tons quentes (#4A4035, #7C8B6F, #F5F2ED, #C1634A)
 */

const B = {
  castanho: '#4A4035',
  verde: '#7C8B6F',
  bege: '#F5F2ED',
  linho: '#F0EBE3',
  terracota: '#C1634A',
  creme: '#f8f6f3',
  borda: '#E8E2D9',
};

function Footer({ n }) {
  return (
    <div className="flex items-center justify-between text-[9px] pt-3" style={{ color: '#b8b0a4' }}>
      <span>Sete Ecos · Maputo, Moçambique</span>
      <span>app.seteecos.com · @sete.ecos</span>
      <span>{n}/8</span>
    </div>
  );
}

export default function CatalogoPDF() {
  return (
    <div className="catalogo-root bg-white min-h-screen">
      {/* Barra (não aparece no PDF) */}
      <div className="print:hidden sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{ backgroundColor: B.castanho }}>
        <Link to="/coach/marketing" className="text-white/70 hover:text-white text-sm">← Marketing</Link>
        <button onClick={() => window.print()} className="text-white px-4 py-2 rounded-lg text-sm font-bold" style={{ backgroundColor: B.verde }}>
          Descarregar PDF
        </button>
      </div>

      {/* ===== PÁG 1: CAPA ===== */}
      <div className="catalogo-page relative flex flex-col items-center justify-center text-center" style={{ background: `linear-gradient(160deg, ${B.castanho} 0%, #5C4F42 40%, #6B5D4F 100%)` }}>
        <div style={{ position: 'absolute', top: 60, left: 60, width: 140, height: 140, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: 80, right: 80, width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '30%', right: 50, width: 80, height: 80, borderRadius: '50%', background: 'rgba(124,139,111,0.12)' }} />
        <div style={{ position: 'absolute', bottom: '30%', left: 50, width: 60, height: 60, borderRadius: '50%', background: 'rgba(193,99,74,0.08)' }} />

        <img src="/logos/SETEECOS_HERO.png" alt="Sete Ecos" className="w-48 h-48 mb-8 drop-shadow-2xl" />
        <h1 className="text-6xl font-bold text-white mb-3 tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>SETE ECOS</h1>
        <div className="w-24 h-0.5 mb-4" style={{ background: `linear-gradient(to right, transparent, ${B.verde}, transparent)` }} />
        <p className="text-xl text-white/60 mb-2 italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Sistema de Transmutação Feminina</p>
        <p className="text-white/40 text-sm mt-16 tracking-widest uppercase">Catálogo de Serviços · 2026</p>
        <p className="text-white/25 text-xs mt-2">Maputo, Moçambique</p>

        <div className="absolute bottom-10 flex gap-5 items-center">
          <span className="text-white/30 text-xs">app.seteecos.com</span>
          <span className="text-white/15">·</span>
          <span className="text-white/30 text-xs">+258 85 100 6473</span>
          <span className="text-white/15">·</span>
          <span className="text-white/30 text-xs">@sete.ecos</span>
        </div>
      </div>

      {/* ===== PÁG 2: QUEM SOMOS ===== */}
      <div className="catalogo-page px-12 py-10 flex flex-col" style={{ backgroundColor: 'white' }}>
        <div className="flex items-center gap-3 mb-5">
          <img src="/logos/CENTRO_7ECOS.png" alt="7 Ecos" className="w-14 h-14" />
          <div>
            <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: B.castanho }}>Quem Somos</h2>
            <div className="w-12 h-0.5 mt-1" style={{ backgroundColor: B.verde }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6 flex-1">
          <div className="space-y-4 flex flex-col justify-center">
            <p className="text-gray-700 leading-relaxed text-[15px]">
              O <strong>Sete Ecos</strong> é um sistema de transformação feminina criado em Moçambique, para mulheres moçambicanas e de língua portuguesa.
            </p>
            <p className="text-gray-700 leading-relaxed text-[15px]">
              Acreditamos que a saúde da mulher não começa na balança — começa na <strong>relação com o próprio corpo</strong>, com a comida, com as emoções.
            </p>
            <p className="text-gray-700 leading-relaxed text-[15px]">
              O nosso trabalho combina <strong>nutrição baseada em evidência</strong> com <strong>compreensão emocional</strong>, usando a comida que já conheces: xima, matapa, caril, feijão nhemba.
            </p>
            <p className="text-gray-700 leading-relaxed text-[15px]">
              Não vendemos dietas. Não vendemos culpa. Vendemos <strong>transformação real</strong>, ao teu ritmo, na tua língua, com a tua comida.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="rounded-2xl p-6 mb-4 flex-1" style={{ background: `linear-gradient(to bottom right, ${B.creme}, ${B.linho})` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: B.verde }}>A nossa missão</p>
              <p className="italic leading-relaxed text-gray-600 mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '17px' }}>
                "Ajudar cada mulher a ouvir o seu corpo, alimentar-se com consciência e transformar-se sem culpa. Sem dietas importadas. Sem julgamento. Com amor e ciência."
              </p>
              <div className="pt-4 flex items-center gap-3" style={{ borderTop: `1px solid ${B.borda}` }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: `linear-gradient(to bottom right, ${B.verde}, #5a6b4e)` }}>VS</div>
                <div>
                  <p className="font-bold text-sm" style={{ color: B.castanho }}>Vivianne Saraiva</p>
                  <p className="text-[11px] text-gray-400">Precision Nutrition Level 1 Coach</p>
                  <p className="text-[11px] text-gray-400">Fundadora do Sete Ecos</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: B.castanho }}>
              <p className="text-white/60 text-[10px] uppercase tracking-wider mb-3">Plataforma completa</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><p className="text-3xl font-bold" style={{ color: B.verde }}>7</p><p className="text-[10px] text-white/40">Módulos</p></div>
                <div><p className="text-3xl font-bold" style={{ color: B.verde }}>83</p><p className="text-[10px] text-white/40">Componentes</p></div>
                <div><p className="text-3xl font-bold" style={{ color: B.verde }}>3</p><p className="text-[10px] text-white/40">Idiomas</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Os 7 Ecos com logos reais */}
        <div>
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
                <img src={eco.logo} alt={eco.nome} className="w-11 h-11 mx-auto mb-1 object-contain" />
                <p className="text-[10px] font-bold" style={{ color: eco.cor }}>{eco.nome}</p>
                <p className="text-[8px] text-gray-400">{eco.desc}</p>
                <span className={`text-[7px] px-1.5 py-0.5 rounded-full inline-block mt-1 font-bold ${eco.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {eco.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <Footer n={2} />
      </div>

      {/* ===== PÁG 3: LUMINA ===== */}
      <div className="catalogo-page px-12 py-10 flex flex-col" style={{ backgroundColor: 'white' }}>
        <div className="flex items-center gap-3 mb-4">
          <img src="/logos/lumina-logo_v2.png" alt="Lumina" className="w-14 h-14" />
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-purple-700" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>LUMINA</h2>
            <p className="text-sm text-purple-400">O teu diagnóstico de transformação</p>
          </div>
          <span className="bg-green-100 text-green-700 px-5 py-2 rounded-full text-sm font-bold">GRÁTIS</span>
        </div>

        <p className="text-gray-700 text-[15px] leading-relaxed mb-5">
          O LUMINA é o ponto de entrada no universo Sete Ecos. Em <strong>5 minutos</strong>, fazes um diagnóstico completo da tua relação com a comida, o teu corpo e as tuas emoções. Sem registo, sem compromisso.
        </p>

        {/* Screenshots grandes — flex-1 para preencher */}
        <div className="grid grid-cols-3 gap-4 flex-1 mb-5">
          {[
            { src: '/catalogo/Lumina_comecar.jpeg', label: 'INÍCIO', desc: '8 perguntas sobre o teu estado' },
            { src: '/catalogo/Lumina_leitura.jpeg', label: 'LEITURA', desc: 'Resultado personalizado' },
            { src: '/catalogo/Lumina_leitura8-cuidado-proprio.jpeg', label: 'PADRÃO', desc: 'Orientações práticas' },
          ].map((s, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden shadow-lg flex flex-col">
              <img src={s.src} alt={s.label} className="w-full flex-1 object-cover object-top" />
              <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: 'linear-gradient(to top, rgba(75,0,130,0.85), transparent)' }}>
                <p className="text-white text-xs font-bold">{s.label}</p>
                <p className="text-white/70 text-[10px]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-5 mb-4">
          <div className="space-y-2.5">
            <h3 className="font-bold text-sm" style={{ color: B.castanho }}>O que descobres:</h3>
            {[
              'O teu padrão emocional dominante',
              'Como a alimentação afeta o teu humor',
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
            <div className="bg-purple-50 rounded-xl p-5">
              <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">Como aceder</p>
              <p className="text-xl text-purple-900 font-bold mt-2">app.seteecos.com/lumina</p>
              <p className="text-sm text-purple-500 mt-1">100% gratuito · Sem registo · 5 minutos</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'linear-gradient(to right, rgba(155,89,182,0.1), rgba(193,99,74,0.08))' }}>
              <p className="text-xs text-purple-700 font-bold">Ideal para:</p>
              <p className="text-sm text-gray-600 mt-1">Mulheres que querem entender a sua relação com a comida antes de começar qualquer mudança.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: B.creme, border: `1px solid ${B.borda}` }}>
          <p className="text-gray-500 text-sm">O LUMINA é a porta de entrada. O próximo passo é o <strong style={{ color: B.verde }}>VITALIS</strong>.</p>
        </div>
        <Footer n={3} />
      </div>

      {/* ===== PÁG 4: VITALIS OVERVIEW ===== */}
      <div className="catalogo-page px-12 py-10 flex flex-col" style={{ backgroundColor: 'white' }}>
        <div className="flex items-center gap-3 mb-4">
          <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-14 h-14" />
          <div className="flex-1">
            <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: B.verde }}>VITALIS</h2>
            <p className="text-sm" style={{ color: B.verde + 'aa' }}>Coaching Nutricional Completo</p>
          </div>
          <span className="text-white px-5 py-2 rounded-full text-sm font-bold" style={{ backgroundColor: B.verde }}>PREMIUM</span>
        </div>

        <p className="text-gray-700 text-[15px] leading-relaxed mb-4">
          Não é uma dieta. É um <strong>sistema de transformação nutricional</strong> desenhado para a mulher moçambicana. Usa a comida que já conheces, respeita o teu ritmo e acompanha-te sem julgamento.
        </p>

        {/* 4 screenshots em grid — sem limite de altura */}
        <div className="grid grid-cols-4 gap-3 mb-4 flex-1">
          {[
            { src: '/catalogo/Vitalis_dashboard.jpeg', label: 'Dashboard', desc: 'Progresso e XP diário' },
            { src: '/catalogo/Vitalis_plano.jpeg', label: 'Plano Alimentar', desc: 'Personalizado por semana' },
            { src: '/catalogo/Vitalis_receitas.jpeg', label: 'Receitas', desc: 'Comida moçambicana' },
            { src: '/catalogo/Vitalis_checkin.jpeg', label: 'Check-in', desc: 'Acompanhamento diário' },
          ].map((s, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden shadow-md flex flex-col">
              <img src={s.src} alt={s.label} className="w-full flex-1 object-cover object-top" />
              <div className="absolute bottom-0 left-0 right-0 p-2" style={{ background: 'linear-gradient(to top, rgba(74,64,53,0.85), transparent)' }}>
                <p className="text-white text-[9px] font-bold">{s.label}</p>
                <p className="text-white/60 text-[7px]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 9 Funcionalidades */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: '🍽', titulo: 'Plano Alimentar', desc: 'Xima, matapa, caril — a tua comida' },
            { icon: '✅', titulo: 'Check-in Diário', desc: 'Regista o teu dia em 30 segundos' },
            { icon: '🍳', titulo: 'Receitas', desc: 'Moçambicanas, saudáveis, fáceis' },
            { icon: '📊', titulo: 'Relatórios', desc: 'Progresso semanal em gráficos' },
            { icon: '💬', titulo: 'Chat Coach', desc: 'Fala com a Vivianne' },
            { icon: '🏋️', titulo: 'Treinos', desc: 'Exercícios adaptados, sem ginásio' },
            { icon: '📋', titulo: 'Lista Compras', desc: 'Gerada do plano semanal' },
            { icon: '🔄', titulo: 'Espaço Retorno', desc: 'Voltaste atrás? Sem culpa' },
            { icon: '🎯', titulo: 'Gamificação', desc: 'XP, níveis e conquistas' },
          ].map((f, i) => (
            <div key={i} className="rounded-lg p-2.5 flex items-start gap-2" style={{ backgroundColor: B.creme }}>
              <span className="text-lg">{f.icon}</span>
              <div>
                <p className="font-bold text-[10px]" style={{ color: B.castanho }}>{f.titulo}</p>
                <p className="text-[8px] text-gray-400 leading-tight">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 2 screenshots em baixo */}
        <div className="grid grid-cols-2 gap-3" style={{ height: 200 }}>
          {[
            { src: '/catalogo/Vitalis_espaco-retorno.jpeg', label: 'Espaço de Retorno' },
            { src: '/catalogo/Vitalis_relatorios.jpeg', label: 'Relatórios Semanais' },
          ].map((s, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden shadow-md">
              <img src={s.src} alt={s.label} className="w-full h-full object-cover object-top" />
              <div className="absolute bottom-0 left-0 right-0 p-2" style={{ background: 'linear-gradient(to top, rgba(74,64,53,0.85), transparent)' }}>
                <p className="text-white text-[10px] font-bold">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
        <Footer n={4} />
      </div>

      {/* ===== PÁG 5: VITALIS DETALHES ===== */}
      <div className="catalogo-page px-12 py-10 flex flex-col" style={{ backgroundColor: 'white' }}>
        <div className="flex items-center gap-3 mb-5">
          <img src="/logos/VITALIS_LOGO-NOME_V3.png" alt="Vitalis" className="h-10 object-contain" />
          <div className="w-10 h-0.5" style={{ backgroundColor: B.verde }} />
          <p className="text-sm text-gray-400">O que vais encontrar lá dentro</p>
        </div>

        <div className="grid grid-cols-2 gap-6 flex-1">
          {/* Coluna screenshots — sem limites */}
          <div className="flex flex-col gap-4">
            <div className="relative rounded-xl overflow-hidden shadow-md flex-1">
              <img src="/catalogo/Vitalis_registo-refeicoes.jpeg" alt="Registo Refeições" className="w-full h-full object-cover object-top" />
              <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: 'linear-gradient(to top, rgba(74,64,53,0.85), transparent)' }}>
                <p className="text-white text-sm font-bold">Registo de Refeições</p>
                <p className="text-white/70 text-xs">Acompanha o que comes sem obsessão</p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-md flex-1">
              <img src="/catalogo/Vitalis_lumina-abertura.jpeg" alt="Lumina no Vitalis" className="w-full h-full object-cover object-top" />
              <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: 'linear-gradient(to top, rgba(74,64,53,0.85), transparent)' }}>
                <p className="text-white text-sm font-bold">LUMINA integrado</p>
                <p className="text-white/70 text-xs">Diagnóstico disponível dentro do Vitalis</p>
              </div>
            </div>
          </div>

          {/* Coluna texto */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl p-5 flex-1" style={{ backgroundColor: B.creme }}>
              <p className="font-bold text-base mb-3" style={{ color: B.castanho }}>Como funciona?</p>
              <ol className="space-y-3 text-sm text-gray-600">
                {[
                  'Fazes o diagnóstico LUMINA',
                  'Recebes plano alimentar personalizado',
                  'Fazes check-in diário (30 seg)',
                  'Acompanhas progresso nos relatórios',
                  'Falas com a coach quando precisares',
                ].map((step, i) => (
                  <li key={i} className="flex gap-2 items-center">
                    <span className="text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: B.verde }}>{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl p-5 flex-1" style={{ background: `linear-gradient(to bottom right, rgba(124,139,111,0.08), rgba(124,139,111,0.15))` }}>
              <p className="font-bold text-base mb-3" style={{ color: B.castanho }}>O que torna o VITALIS diferente?</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✦ <strong>Comida moçambicana</strong> — xima, matapa, caril, não "quinoa e abacate"</li>
                <li>✦ <strong>Sem contagem de calorias</strong> — usamos porções com a mão</li>
                <li>✦ <strong>Sem julgamento</strong> — o Espaço de Retorno acolhe recaídas</li>
                <li>✦ <strong>Coach real</strong> — não é um bot, é a Vivianne</li>
                <li>✦ <strong>Gamificação</strong> — XP, níveis e conquistas motivam</li>
                <li>✦ <strong>Offline-friendly</strong> — funciona com internet fraca</li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-xl p-5">
              <p className="font-bold text-base text-purple-700 mb-2">Inclui COMUNIDADE</p>
              <p className="text-sm text-gray-600">Espaço coletivo com Rio (reflexões), Círculos, Fogueira e Sussurros — mulheres a apoiarem-se mutuamente.</p>
            </div>
          </div>
        </div>
        <Footer n={5} />
      </div>

      {/* ===== PÁG 6: COMUNIDADE ===== */}
      <div className="catalogo-page px-12 py-10 flex flex-col" style={{ backgroundColor: 'white' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl" style={{ background: `linear-gradient(to bottom right, #9b59b6, ${B.terracota})` }}>⚡</div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: B.castanho }}>Comunidade</h2>
            <p className="text-sm text-gray-400">Espaço coletivo de transformação</p>
          </div>
        </div>

        <p className="text-gray-700 text-[15px] leading-relaxed mb-5">
          A transformação não se faz sozinha. A Comunidade Sete Ecos é um <strong>espaço seguro</strong> onde mulheres partilham reflexões, desafios e conquistas. Tudo moderado, tudo com propósito.
        </p>

        <div className="grid grid-cols-2 gap-5 flex-1 mb-5">
          {/* Screenshot grande — preenche toda a coluna */}
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img src="/catalogo/comunidade.jpeg" alt="Comunidade" className="w-full h-full object-cover object-top" />
          </div>
          {/* Espaços com mais detalhe */}
          <div className="flex flex-col gap-3">
            {[
              { icon: '🌊', nome: 'O Rio', desc: 'Reflexões guiadas por prompts diários. Partilha pensamentos, lê os de outras. Um espaço de escrita honesta sobre o dia-a-dia.' },
              { icon: '👥', nome: 'Círculos de Eco', desc: 'Grupos de 7-12 mulheres que exploram o mesmo Eco juntas. Apoio mútuo com propósito e acompanhamento.' },
              { icon: '🔥', nome: 'Fogueira', desc: 'Espaço efémero de 24h. Todas se reúnem num tema. Conversas honestas que desaparecem no dia seguinte.' },
              { icon: '💜', nome: 'Sussurros', desc: 'Mensagens privadas de apoio e encorajamento. Palavras que chegam quando mais precisas.' },
            ].map((e, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl p-4 flex-1" style={{ backgroundColor: B.creme }}>
                <span className="text-2xl">{e.icon}</span>
                <div>
                  <p className="font-bold text-sm mb-1" style={{ color: B.castanho }}>{e.nome}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-6 text-center" style={{ background: `linear-gradient(to right, rgba(155,89,182,0.08), rgba(193,99,74,0.06), rgba(155,89,182,0.08))` }}>
          <p className="text-base text-gray-700 font-medium">A Comunidade está incluída em todos os planos VITALIS.</p>
          <p className="text-sm text-gray-400 mt-1">Não é uma rede social. É um espaço de cura coletiva.</p>
        </div>
        <Footer n={6} />
      </div>

      {/* ===== PÁG 7: PREÇOS ===== */}
      <div className="catalogo-page px-12 py-10 flex flex-col" style={{ backgroundColor: 'white' }}>
        <div className="flex items-center gap-3 mb-6">
          <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-12 h-12" />
          <div>
            <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: B.castanho }}>Planos e Preços</h2>
            <div className="w-12 h-0.5 mt-1" style={{ backgroundColor: B.verde }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5 flex-1 mb-6">
          {[
            {
              nome: 'Mensal', preco: '2.500', periodo: 'MZN/mês', destaque: false,
              features: ['Plano alimentar personalizado', 'Receitas moçambicanas', 'Chat direto com coach', 'Treinos guiados', 'Dashboard de progresso', 'Lista de compras automática', 'Check-in diário', 'Comunidade'],
            },
            {
              nome: 'Semestral', preco: '12.500', periodo: 'MZN / 6 meses', destaque: true,
              poupanca: 'Poupas 2.500 MZN', porMes: '2.083 MZN/mês',
              features: ['Tudo do plano mensal', '6 meses de acompanhamento', 'Relatórios semanais', 'Prioridade no chat', 'Espaço de retorno', 'Análise de padrões', 'Poupança de 1 mês inteiro', 'Comunidade'],
            },
            {
              nome: 'Anual', preco: '21.000', periodo: 'MZN / 12 meses', destaque: false,
              poupanca: 'Poupas 9.000 MZN', porMes: '1.750 MZN/mês',
              features: ['Tudo do plano semestral', '12 meses completos', 'Acesso prioritário', 'Suporte prioritário', 'Maior poupança possível', 'Compromisso total', 'Todas as funcionalidades', 'Comunidade'],
            },
          ].map((plano, i) => (
            <div key={i} className={`rounded-2xl p-6 flex flex-col ${plano.destaque ? 'text-white shadow-2xl relative' : ''}`}
              style={plano.destaque
                ? { background: `linear-gradient(to bottom, ${B.castanho}, #5C4F42)`, transform: 'scale(1.03)' }
                : { backgroundColor: B.creme, border: `1px solid ${B.borda}` }
              }>
              {plano.destaque && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="text-white text-[9px] font-bold px-4 py-1 rounded-full uppercase tracking-wider" style={{ backgroundColor: B.terracota }}>Mais Popular</span>
                </div>
              )}
              <h3 className={`text-xl font-bold mt-1 ${plano.destaque ? 'text-white' : ''}`} style={!plano.destaque ? { color: B.castanho } : undefined}>{plano.nome}</h3>
              <p className="text-4xl font-bold mt-2" style={{ color: B.verde }}>{plano.preco}</p>
              <p className={`text-xs mt-1 ${plano.destaque ? 'text-white/50' : 'text-gray-400'}`}>{plano.periodo}</p>
              {plano.porMes && <p className={`text-xs ${plano.destaque ? 'text-white/40' : ''}`} style={!plano.destaque ? { color: B.verde + '99' } : undefined}>{plano.porMes}</p>}
              {plano.poupanca && (
                <span className={`inline-block mt-2 text-[10px] px-2.5 py-1 rounded-full font-bold self-start ${plano.destaque ? '' : 'bg-green-100 text-green-700'}`}
                  style={plano.destaque ? { backgroundColor: 'rgba(124,139,111,0.25)', color: '#a8c896' } : undefined}>
                  {plano.poupanca}
                </span>
              )}
              <ul className="mt-4 space-y-2 flex-1">
                {plano.features.map((f, j) => (
                  <li key={j} className={`flex items-start gap-2 text-xs ${plano.destaque ? 'text-white/70' : 'text-gray-500'}`}>
                    <span className="mt-0.5 text-[9px]" style={{ color: B.verde }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Pagamento */}
        <div className="rounded-xl p-6" style={{ backgroundColor: B.creme }}>
          <p className="font-bold text-base mb-4" style={{ color: B.castanho }}>Métodos de pagamento</p>
          <div className="grid grid-cols-3 gap-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <p className="font-bold text-sm">PayPal / Cartão</p>
                <p className="text-xs text-gray-400">Visa, Mastercard, PayPal</p>
                <p className="text-xs text-gray-400">Pagamento direto na app</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="font-bold text-sm">M-Pesa</p>
                <p className="text-xs text-gray-400">85 100 6473</p>
                <p className="text-xs text-gray-400">Vivianne Santos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <p className="font-bold text-sm">WhatsApp</p>
                <p className="text-xs text-gray-400">+258 85 100 6473</p>
                <p className="text-xs text-gray-400">Envia comprovativo</p>
              </div>
            </div>
          </div>
          <p className="text-[10px] mt-4 text-center" style={{ color: '#b8b0a4' }}>PayPal/cartão: acesso imediato · M-Pesa: acesso em menos de 1 hora após comprovativo</p>
        </div>
        <Footer n={7} />
      </div>

      {/* ===== PÁG 8: CONTACTOS ===== */}
      <div className="catalogo-page relative flex flex-col items-center justify-center text-center" style={{ background: `linear-gradient(160deg, ${B.castanho} 0%, #5C4F42 40%, #6B5D4F 100%)` }}>
        <div style={{ position: 'absolute', top: 60, right: 60, width: 150, height: 150, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: 100, left: 40, width: 100, height: 100, borderRadius: '50%', background: 'rgba(124,139,111,0.08)' }} />

        <img src="/logos/SETEECOS_HERO.png" alt="Sete Ecos" className="w-28 h-28 mb-8 drop-shadow-xl" />
        <h2 className="text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Começa Hoje</h2>
        <p className="text-white/45 text-base mb-10 max-w-md">O primeiro passo é gratuito. Faz o diagnóstico LUMINA e descobre o que o teu corpo precisa.</p>

        <div className="space-y-4 w-full max-w-lg">
          {[
            { icon: '🔮', nome: 'LUMINA (Grátis)', link: 'app.seteecos.com/lumina', desc: 'Diagnóstico em 5 minutos' },
            { icon: '🌱', nome: 'VITALIS', link: 'app.seteecos.com/vitalis', desc: 'Coaching nutricional completo' },
            { icon: '💬', nome: 'WhatsApp', link: '+258 85 100 6473', desc: 'Fala directamente connosco' },
            { icon: '📸', nome: 'Instagram', link: '@sete.ecos', desc: 'Conteúdo diário' },
            { icon: '🌐', nome: 'Website', link: 'app.seteecos.com', desc: 'Toda a plataforma' },
          ].map((c, i) => (
            <div key={i} className="backdrop-blur rounded-xl p-5 flex items-center gap-4 text-left" style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="text-2xl">{c.icon}</span>
              <div className="flex-1">
                <p className="text-white font-bold text-base">{c.nome}</p>
                <p className="text-white/40 text-sm">{c.desc}</p>
              </div>
              <p className="text-white/50 text-sm">{c.link}</p>
            </div>
          ))}
        </div>

        <div className="absolute bottom-10">
          <p className="text-white/20 text-[10px]">© 2026 Sete Ecos · Maputo, Moçambique · Todos os direitos reservados</p>
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
