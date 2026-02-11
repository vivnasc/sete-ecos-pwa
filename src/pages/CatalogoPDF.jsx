import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

const BASE = typeof window !== 'undefined' ? window.location.origin : 'https://app.seteecos.com';

/**
 * Catálogo PDF — Página completa pronta a imprimir / guardar como PDF
 *
 * Uso: Abrir /catalogo → Ctrl+P → Guardar como PDF
 * Ou: Botão "Descarregar PDF" que abre print dialog
 */
export default function CatalogoPDF() {
  const handlePrint = () => window.print();

  return (
    <div className="catalogo-root bg-white min-h-screen">
      {/* Barra de acções (não aparece no PDF) */}
      <div className="print:hidden sticky top-0 z-50 bg-[#1a1a2e] text-white px-4 py-3 flex items-center justify-between">
        <Link to="/coach/marketing" className="text-white/70 hover:text-white text-sm">← Marketing</Link>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            📄 Descarregar PDF
          </button>
        </div>
      </div>

      {/* ===== PÁGINA 1: CAPA ===== */}
      <div className="catalogo-page flex flex-col items-center justify-center text-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <img src="/logos/seteecos_logo_v2.png" alt="Sete Ecos" className="w-32 h-32 mb-6 opacity-90" />
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">SETE ECOS</h1>
        <p className="text-xl text-white/70 mb-8 italic">Sistema de Transmutação Feminina</p>
        <div className="w-24 h-0.5 bg-green-400 mb-8" />
        <p className="text-white/50 text-sm">Catálogo de Serviços 2026</p>
        <p className="text-white/40 text-xs mt-2">Maputo, Moçambique 🇲🇿</p>
      </div>

      {/* ===== PÁGINA 2: QUEM SOMOS ===== */}
      <div className="catalogo-page bg-white px-12 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-8 bg-green-500 rounded-full" />
          <h2 className="text-3xl font-bold text-[#1a1a2e]">Quem Somos</h2>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <p className="text-gray-700 leading-relaxed text-sm">
              O <strong>Sete Ecos</strong> é um sistema de transformação feminina criado em Moçambique, para mulheres moçambicanas e de língua portuguesa.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm mt-3">
              Acreditamos que a saúde da mulher não começa na balança — começa na relação com o próprio corpo, com a comida, com as emoções.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm mt-3">
              O nosso trabalho combina <strong>nutrição baseada em evidência</strong> com <strong>compreensão emocional</strong>, usando a comida que já conheces: xima, matapa, caril, feijão nhemba.
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
            <h3 className="font-bold text-[#1a1a2e] mb-4">A nossa missão</h3>
            <p className="text-sm text-gray-600 italic leading-relaxed">
              "Ajudar cada mulher a ouvir o seu corpo, alimentar-se com consciência e transformar-se sem culpa. Sem dietas importadas. Sem julgamento. Com amor e ciência."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1a1a2e] flex items-center justify-center text-white text-lg">VS</div>
              <div>
                <p className="font-bold text-sm">Vivianne Saraiva</p>
                <p className="text-xs text-gray-500">Precision Nutrition L1 Coach</p>
                <p className="text-xs text-gray-500">Fundadora do Sete Ecos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Os 7 Ecos */}
        <h3 className="font-bold text-[#1a1a2e] mb-4">Os 7 Ecos — Pilares da Transformação</h3>
        <div className="grid grid-cols-7 gap-2">
          {[
            { nome: 'LUMINA', desc: 'Diagnóstico', cor: '#9b59b6', status: 'Activo' },
            { nome: 'VITALIS', desc: 'Nutrição', cor: '#7C8B6F', status: 'Activo' },
            { nome: 'SERENA', desc: 'Emoção', cor: '#3498db', status: 'Breve' },
            { nome: 'IGNIS', desc: 'Vontade', cor: '#e74c3c', status: 'Breve' },
            { nome: 'VENTIS', desc: 'Energia', cor: '#1abc9c', status: 'Breve' },
            { nome: 'ECOA', desc: 'Expressão', cor: '#f39c12', status: 'Breve' },
            { nome: 'AURORA', desc: 'Integração', cor: '#e91e63', status: 'Futuro' },
          ].map(eco => (
            <div key={eco.nome} className="text-center p-2 rounded-xl" style={{ backgroundColor: eco.cor + '15' }}>
              <div className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: eco.cor }}>
                {eco.nome[0]}
              </div>
              <p className="text-[10px] font-bold" style={{ color: eco.cor }}>{eco.nome}</p>
              <p className="text-[8px] text-gray-500">{eco.desc}</p>
              <span className={`text-[7px] px-1.5 py-0.5 rounded-full inline-block mt-1 ${eco.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {eco.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== PÁGINA 3: LUMINA ===== */}
      <div className="catalogo-page bg-white px-12 py-16">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logos/lumina-logo_v2.png" alt="Lumina" className="w-10 h-10" />
          <div>
            <h2 className="text-3xl font-bold text-purple-700">LUMINA</h2>
            <p className="text-sm text-purple-400">Diagnóstico Gratuito</p>
          </div>
          <span className="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">GRÁTIS</span>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              O LUMINA é o ponto de entrada no universo Sete Ecos. Em <strong>5 minutos</strong>, fazes um diagnóstico completo da tua relação com a comida, o teu corpo e as tuas emoções.
            </p>

            <h3 className="font-bold text-sm text-[#1a1a2e] mb-2">O que descobres:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-purple-500">🔮</span> O teu padrão emocional dominante</li>
              <li className="flex items-start gap-2"><span className="text-purple-500">🔮</span> Como a alimentação afecta o teu humor</li>
              <li className="flex items-start gap-2"><span className="text-purple-500">🔮</span> O que o teu corpo realmente precisa</li>
              <li className="flex items-start gap-2"><span className="text-purple-500">🔮</span> Leitura personalizada com orientações práticas</li>
            </ul>

            <div className="mt-6 bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-purple-700 font-bold">COMO ACEDER</p>
              <p className="text-sm text-purple-900 mt-1">app.seteecos.com/lumina</p>
              <p className="text-xs text-purple-500 mt-1">Sem registo. Sem compromisso. 100% gratuito.</p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <img src="/mockups/Vitalis-landing_PC-mockup.jpeg" alt="Sete Ecos App" className="rounded-xl shadow-lg max-h-80 object-contain" />
          </div>
        </div>
      </div>

      {/* ===== PÁGINA 4: VITALIS ===== */}
      <div className="catalogo-page bg-white px-12 py-16">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logos/vitalis-logo_v2.png" alt="Vitalis" className="w-10 h-10" />
          <div>
            <h2 className="text-3xl font-bold text-[#7C8B6F]">VITALIS</h2>
            <p className="text-sm text-[#7C8B6F]/70">Coaching Nutricional Completo</p>
          </div>
          <span className="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">PREMIUM</span>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed mb-6">
          O VITALIS não é uma dieta. É um sistema de <strong>transformação nutricional</strong> desenhado para a mulher moçambicana. Usa a comida que já conheces, respeita o teu ritmo e acompanha-te sem julgamento.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: '🍽', titulo: 'Plano Alimentar', desc: 'Personalizado com comida moçambicana: xima, matapa, caril, feijão nhemba' },
            { icon: '📊', titulo: 'Dashboard', desc: 'Acompanha o teu progresso com gráficos e métricas visuais' },
            { icon: '💬', titulo: 'Chat com Coach', desc: 'Fala directamente com a Vivianne quando precisares' },
            { icon: '🏋️', titulo: 'Treinos', desc: 'Exercícios adaptados ao teu nível, sem ginásio' },
            { icon: '📋', titulo: 'Lista de Compras', desc: 'Gerada automaticamente a partir do teu plano semanal' },
            { icon: '🔄', titulo: 'Espaço de Retorno', desc: 'Voltaste atrás? Sem culpa. O sistema acolhe-te de volta' },
            { icon: '📈', titulo: 'Relatórios', desc: 'Análise semanal do teu progresso com insights' },
            { icon: '🍳', titulo: 'Receitas', desc: 'Receitas moçambicanas saudáveis e fáceis de fazer' },
            { icon: '🎯', titulo: 'Objectivos', desc: 'Define metas realistas e acompanha cada conquista' },
          ].map((f, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-2xl">{f.icon}</span>
              <p className="font-bold text-xs mt-1 text-[#1a1a2e]">{f.titulo}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Mockups */}
        <div className="flex gap-3 justify-center">
          <img src="/mockups/Vitalis-dashboard_mb-mockup.jpeg" alt="Dashboard" className="h-44 rounded-lg shadow-md object-contain" />
          <img src="/mockups/Vitalis-receitas_mb-mockup.jpeg" alt="Receitas" className="h-44 rounded-lg shadow-md object-contain" />
          <img src="/mockups/Vitalis-treinos_mb-mockup.jpeg" alt="Treinos" className="h-44 rounded-lg shadow-md object-contain" />
        </div>
      </div>

      {/* ===== PÁGINA 5: PREÇOS ===== */}
      <div className="catalogo-page bg-white px-12 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-8 bg-[#7C8B6F] rounded-full" />
          <h2 className="text-3xl font-bold text-[#1a1a2e]">Planos e Preços</h2>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-10">
          {[
            {
              nome: 'Mensal',
              preco: '2.500',
              periodo: 'MZN/mês',
              features: ['Plano alimentar personalizado', 'Receitas moçambicanas', 'Chat com a coach', 'Treinos guiados', 'Dashboard de progresso', 'Lista de compras'],
              destaque: false,
            },
            {
              nome: 'Semestral',
              preco: '12.500',
              periodo: 'MZN / 6 meses',
              poupanca: 'Poupas 2.500 MZN',
              features: ['Tudo do plano mensal', '6 meses de compromisso', 'Relatórios semanais', 'Prioridade no chat', 'Espaço de retorno', 'Poupança de 1 mês'],
              destaque: true,
            },
            {
              nome: 'Anual',
              preco: '21.000',
              periodo: 'MZN / 12 meses',
              poupanca: 'Poupas 9.000 MZN',
              features: ['Tudo do plano semestral', '12 meses completos', 'Acesso a novidades primeiro', 'Suporte prioritário', 'Análise de padrões', 'Maior poupança'],
              destaque: false,
            },
          ].map((plano, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 text-center ${
                plano.destaque
                  ? 'bg-gradient-to-b from-[#1a1a2e] to-[#0f3460] text-white shadow-xl scale-105'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              {plano.destaque && <span className="bg-green-400 text-[#1a1a2e] text-[9px] font-bold px-2 py-0.5 rounded-full">MAIS POPULAR</span>}
              <h3 className={`text-lg font-bold mt-2 ${plano.destaque ? 'text-white' : 'text-[#1a1a2e]'}`}>{plano.nome}</h3>
              <p className={`text-3xl font-bold mt-2 ${plano.destaque ? 'text-green-400' : 'text-[#7C8B6F]'}`}>{plano.preco}</p>
              <p className={`text-xs ${plano.destaque ? 'text-white/60' : 'text-gray-400'}`}>{plano.periodo}</p>
              {plano.poupanca && (
                <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${plano.destaque ? 'bg-green-400/20 text-green-300' : 'bg-green-100 text-green-700'}`}>
                  {plano.poupanca}
                </span>
              )}
              <ul className="mt-4 space-y-1.5 text-left">
                {plano.features.map((f, j) => (
                  <li key={j} className={`flex items-start gap-1.5 text-[11px] ${plano.destaque ? 'text-white/80' : 'text-gray-600'}`}>
                    <span className="text-green-400 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Pagamento */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold text-sm text-[#1a1a2e] mb-3">Como pagar</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="font-bold text-sm">M-Pesa</p>
                <p className="text-xs text-gray-500">85 100 6473 (Vivianne Santos)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <p className="font-bold text-sm">WhatsApp</p>
                <p className="text-xs text-gray-500">+258 85 100 6473</p>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-3">Após pagamento, envia comprovativo por WhatsApp. Acesso activado em menos de 1 hora.</p>
        </div>
      </div>

      {/* ===== PÁGINA 6: CONTACTOS ===== */}
      <div className="catalogo-page flex flex-col items-center justify-center text-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <h2 className="text-3xl font-bold text-white mb-6">Começa Hoje</h2>
        <p className="text-white/60 text-sm mb-8 max-w-md">
          O primeiro passo é gratuito. Faz o diagnóstico LUMINA e descobre o que o teu corpo precisa.
        </p>

        <div className="space-y-4 w-full max-w-sm">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">🔮</span>
            <div className="text-left">
              <p className="text-white font-bold text-sm">LUMINA (Grátis)</p>
              <p className="text-white/50 text-xs">app.seteecos.com/lumina</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <div className="text-left">
              <p className="text-white font-bold text-sm">VITALIS</p>
              <p className="text-white/50 text-xs">app.seteecos.com/vitalis</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div className="text-left">
              <p className="text-white font-bold text-sm">WhatsApp</p>
              <p className="text-white/50 text-xs">+258 85 100 6473</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">📸</span>
            <div className="text-left">
              <p className="text-white font-bold text-sm">Instagram</p>
              <p className="text-white/50 text-xs">@seteecos</p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <img src="/logos/seteecos_logo_v2.png" alt="Sete Ecos" className="w-16 h-16 opacity-40 mx-auto" />
          <p className="text-white/30 text-[10px] mt-2">© 2026 Sete Ecos · Maputo, Moçambique</p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .catalogo-root {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
        .catalogo-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          page-break-after: always;
          box-sizing: border-box;
          overflow: hidden;
        }
        @media screen {
          .catalogo-page {
            max-width: 794px;
            min-height: 1123px;
            margin: 0 auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}
