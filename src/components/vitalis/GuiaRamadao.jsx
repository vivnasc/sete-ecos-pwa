import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ============================================================
// GUIA RAMADÃO - Nutrição durante o mês sagrado
// Inclusivo, respeitoso e baseado em ciência nutricional
// ============================================================

export default function GuiaRamadao() {
  const [seccaoActiva, setSeccaoActiva] = useState('visao-geral');

  const seccoes = [
    { id: 'visao-geral', nome: 'Visão Geral', emoji: '🌙' },
    { id: 'suhoor', nome: 'Suhoor', emoji: '🌅' },
    { id: 'iftar', nome: 'Iftar', emoji: '🌇' },
    { id: 'hidratacao', nome: 'Hidratação', emoji: '💧' },
    { id: 'exercicio', nome: 'Exercício', emoji: '🏃‍♀️' },
    { id: 'bem-estar', nome: 'Bem-Estar', emoji: '💚' },
  ];

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-[#1a1a3e] via-[#2d2d5e] to-[#E8E4DC]">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a3e] via-[#2d2d5e] to-[#1a3a4e]"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-8 text-6xl opacity-40">🌙</div>
          <div className="absolute top-12 right-24 text-2xl opacity-30">⭐</div>
          <div className="absolute top-6 right-44 text-xl opacity-20">⭐</div>
        </div>
        <div className="relative max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link
              to="/vitalis/dashboard"
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Guia Ramadão
              </h1>
              <p className="text-white/70 text-sm">Nutrição consciente durante o mês sagrado</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <p className="text-white/90 text-sm leading-relaxed">
              Ramadan Mubarak! Este guia foi criado com respeito e carinho para te ajudar a manter
              a tua saúde e energia durante o Ramadão, adaptando o método Vitalis ao jejum sagrado.
            </p>
          </div>
        </div>
      </header>

      {/* Navegação por Secções */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-2 overflow-x-auto">
          <div className="flex gap-2">
            {seccoes.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSeccaoActiva(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  seccaoActiva === sec.id
                    ? 'bg-[#1a1a3e] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{sec.emoji}</span>
                <span>{sec.nome}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* VISÃO GERAL */}
        {seccaoActiva === 'visao-geral' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
                🌙 O Ramadão e a Tua Nutrição
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Durante o Ramadão, o jejum do amanhecer ao pôr-do-sol é um pilar espiritual. O método Vitalis
                adapta-se naturalmente a este período, ajudando-te a nutrir o corpo com sabedoria nas horas
                de alimentação.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                  <span className="text-2xl">🌅</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Suhoor (Refeição antes do amanhecer)</p>
                    <p className="text-gray-600 text-xs">A refeição que te sustenta durante o dia. Prioriza proteína e gordura para energia duradoura.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                  <span className="text-2xl">🌇</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Iftar (Quebra do jejum ao pôr-do-sol)</p>
                    <p className="text-gray-600 text-xs">Momento de gratidão e nutrição. Começa devagar com tâmaras e água, depois refeição completa.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                  <span className="text-2xl">🌙</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Período nocturno</p>
                    <p className="text-gray-600 text-xs">Aproveita para hidratar bem e, se precisares, uma refeição leve adicional entre Iftar e Suhoor.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#1a1a3e] to-[#2d2d5e] rounded-2xl p-5 text-white">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                ⭐ Princípios Vitalis para o Ramadão
              </h3>
              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">✓</span>
                  <span>Mantém as tuas porções diárias totais, distribuídas em 2-3 refeições</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">✓</span>
                  <span>Proteína é prioridade absoluta - previne perda de massa muscular</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">✓</span>
                  <span>Hidratação intensa entre Iftar e Suhoor (mínimo 2L)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">✓</span>
                  <span>Gorduras boas para energia sustentada durante o jejum</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300">✓</span>
                  <span>Ouve o teu corpo - adapta o exercício à tua energia</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                📊 Distribuição das Porções
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                As tuas porções diárias (palmas, mãos, polegares) mantêm-se iguais.
                A diferença é a distribuição:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-2xl mb-1">🌅</p>
                  <p className="font-bold text-gray-800 text-sm">Suhoor</p>
                  <p className="text-xs text-gray-600">~40% das porções</p>
                  <p className="text-xs text-amber-700 mt-1">Foco: proteína + gordura</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <p className="text-2xl mb-1">🌇</p>
                  <p className="font-bold text-gray-800 text-sm">Iftar</p>
                  <p className="text-xs text-gray-600">~60% das porções</p>
                  <p className="text-xs text-orange-700 mt-1">Refeição completa equilibrada</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUHOOR */}
        {seccaoActiva === 'suhoor' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
                🌅 Suhoor - Refeição Antes do Amanhecer
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                O Suhoor é a tua fonte de energia para o dia. Uma refeição bem planeada faz toda a
                diferença na forma como te vais sentir durante o jejum.
              </p>

              <div className="bg-amber-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-gray-800 text-sm mb-2">Porções Suhoor (~40% do dia):</h4>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li>🥩 <strong>2-3 palmas de proteína</strong> - ovos, queijo, iogurte grego, frango</li>
                  <li>🍚 <strong>1-2 mãos concha de hidratos</strong> - aveia, pão integral, tâmaras</li>
                  <li>🫒 <strong>3-4 polegares de gordura</strong> - azeite, abacate, manteiga de amendoim</li>
                  <li>🥬 <strong>Legumes</strong> - à vontade</li>
                </ul>
              </div>

              <h4 className="font-semibold text-gray-800 text-sm mb-2">Ideias de Suhoor:</h4>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-800 text-sm">Opção 1: Ovos nutritivos</p>
                  <p className="text-xs text-gray-600">3 ovos mexidos com espinafres + 1 fatia de pão integral + abacate + chá</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-800 text-sm">Opção 2: Bowl proteico</p>
                  <p className="text-xs text-gray-600">Iogurte grego + aveia + tâmaras + sementes de chia + mel + amêndoas</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-800 text-sm">Opção 3: Refeição completa</p>
                  <p className="text-xs text-gray-600">Frango grelhado + arroz integral + legumes salteados + azeite</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-800 text-sm">Opção 4: Batido energético</p>
                  <p className="text-xs text-gray-600">Whey + leite + banana + manteiga de amendoim + aveia + tâmaras</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-white">
              <h4 className="font-bold mb-2 flex items-center gap-2">💡 Dicas Essenciais</h4>
              <ul className="space-y-1.5 text-sm text-white/90">
                <li>• Não saltes o Suhoor - é fundamental para manter a energia</li>
                <li>• Come devagar e com intenção</li>
                <li>• Bebe pelo menos 500ml de água no Suhoor</li>
                <li>• Evita alimentos muito salgados (aumentam a sede)</li>
                <li>• Prioriza hidratos complexos (libertação lenta de energia)</li>
                <li>• Tâmaras são excelentes - ricas em fibra e energia natural</li>
              </ul>
            </div>
          </div>
        )}

        {/* IFTAR */}
        {seccaoActiva === 'iftar' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
                🌇 Iftar - Quebra do Jejum
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                O Iftar é um momento de gratidão e renovação. A forma como quebras o jejum é tão
                importante quanto a refeição em si.
              </p>

              <div className="bg-orange-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-gray-800 text-sm mb-3">A Sequência Ideal:</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-sm font-bold text-orange-800 flex-shrink-0">1</div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Tâmaras + Água</p>
                      <p className="text-xs text-gray-600">1-3 tâmaras com um copo de água. Tradição do Profeta (SAW) e nutricionalmente perfeito - açúcar natural para restaurar a glicose.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-sm font-bold text-orange-800 flex-shrink-0">2</div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Pausa (15-20 min)</p>
                      <p className="text-xs text-gray-600">Momento de oração e gratidão. Permite que o estômago se prepare para a refeição principal.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-sm font-bold text-orange-800 flex-shrink-0">3</div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Refeição Principal</p>
                      <p className="text-xs text-gray-600">Refeição equilibrada com proteína, hidratos, gordura e legumes. Come devagar e com atenção.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-gray-800 text-sm mb-2">Porções Iftar (~60% do dia):</h4>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li>🥩 <strong>3-4 palmas de proteína</strong> - carne, peixe, frango, leguminosas</li>
                  <li>🍚 <strong>2-3 mãos concha de hidratos</strong> - arroz, pão, batata, cuscuz</li>
                  <li>🫒 <strong>4-5 polegares de gordura</strong> - azeite, frutos secos, sementes</li>
                  <li>🥬 <strong>Legumes</strong> - sopa, salada, legumes cozidos (à vontade)</li>
                </ul>
              </div>

              <h4 className="font-semibold text-gray-800 text-sm mb-2">Ideias de Iftar:</h4>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-800 text-sm">Opção 1: Tradicional</p>
                  <p className="text-xs text-gray-600">Tâmaras + sopa de lentilhas + frango grelhado com arroz + salada + frutos secos</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-800 text-sm">Opção 2: Mediterrâneo</p>
                  <p className="text-xs text-gray-600">Tâmaras + hummus + peixe assado + cuscuz com legumes + azeite + iogurte</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-800 text-sm">Opção 3: Reconfortante</p>
                  <p className="text-xs text-gray-600">Tâmaras + sopa nutritiva + carne estufada com batata + legumes + fruta</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 text-white">
              <h4 className="font-bold mb-2">⚠️ O Que Evitar no Iftar</h4>
              <ul className="space-y-1.5 text-sm text-white/90">
                <li>• Comer demasiado rápido (o estômago precisa de tempo)</li>
                <li>• Frituras em excesso (difíceis de digerir)</li>
                <li>• Bebidas açucaradas (picos de insulina)</li>
                <li>• Saltar directamente para refeição pesada (começa com tâmaras e água)</li>
              </ul>
            </div>
          </div>
        )}

        {/* HIDRATAÇÃO */}
        {seccaoActiva === 'hidratacao' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
                💧 Hidratação Durante o Ramadão
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                A hidratação é o maior desafio durante o Ramadão. Como não bebes água durante o dia,
                é essencial maximizar a ingestão entre o Iftar e o Suhoor.
              </p>

              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-gray-800 text-sm mb-2">Plano de Hidratação Nocturna:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-white rounded-lg">
                    <span className="text-lg">🌇</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Iftar</p>
                      <p className="text-xs text-gray-600">2-3 copos de água (500-750ml)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white rounded-lg">
                    <span className="text-lg">🌙</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Entre Iftar e Suhoor</p>
                      <p className="text-xs text-gray-600">3-4 copos de água (750ml-1L) - bebe aos poucos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white rounded-lg">
                    <span className="text-lg">🌅</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Suhoor</p>
                      <p className="text-xs text-gray-600">2 copos de água (500ml)</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                  <p className="text-sm font-bold text-blue-800 text-center">Meta total: 2-2.5L entre Iftar e Suhoor</p>
                </div>
              </div>

              <h4 className="font-semibold text-gray-800 text-sm mb-2">Alimentos Hidratantes:</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gray-50 rounded-lg text-center text-sm">
                  <span className="text-lg">🍉</span>
                  <p className="text-xs text-gray-700 mt-1">Melancia (92% água)</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg text-center text-sm">
                  <span className="text-lg">🥒</span>
                  <p className="text-xs text-gray-700 mt-1">Pepino (96% água)</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg text-center text-sm">
                  <span className="text-lg">🍅</span>
                  <p className="text-xs text-gray-700 mt-1">Tomate (94% água)</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg text-center text-sm">
                  <span className="text-lg">🥗</span>
                  <p className="text-xs text-gray-700 mt-1">Alface (96% água)</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-4 text-white">
              <h4 className="font-bold mb-2">💡 Dicas de Hidratação</h4>
              <ul className="space-y-1.5 text-sm text-white/90">
                <li>• Bebe aos poucos - não tentes beber tudo de uma vez</li>
                <li>• Água de coco é excelente para repor electrólitos</li>
                <li>• Sopas contam como hidratação</li>
                <li>• Evita cafeína em excesso (é diurética)</li>
                <li>• Inclui alimentos ricos em água nas refeições</li>
                <li>• Se treinas, adiciona +500ml à meta</li>
              </ul>
            </div>
          </div>
        )}

        {/* EXERCÍCIO */}
        {seccaoActiva === 'exercicio' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
                🏃‍♀️ Exercício Durante o Ramadão
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                O exercício pode e deve continuar durante o Ramadão, mas adaptado à tua energia
                e ao horário de jejum.
              </p>

              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 text-sm mb-2">Melhor Horário: Antes do Iftar (30-60 min)</h4>
                  <p className="text-xs text-green-700">
                    Treino leve a moderado. Vais poder hidratar e comer logo a seguir.
                    A autofagia está no pico, potenciando os benefícios do exercício.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 text-sm mb-2">Alternativa: Após o Iftar (1-2h depois)</h4>
                  <p className="text-xs text-blue-700">
                    Melhor para treinos mais intensos. O corpo já está hidratado e nutrido.
                    Ideal para musculação ou treinos de maior intensidade.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h4 className="font-semibold text-amber-800 text-sm mb-2">Adaptações Recomendadas:</h4>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• Reduz a intensidade em 30-40%</li>
                    <li>• Prefere treinos mais curtos (30-45 min)</li>
                    <li>• Caminhadas são sempre uma excelente opção</li>
                    <li>• Yoga e alongamentos ajudam sem exigir demasiado</li>
                    <li>• Se sentires tonturas, para imediatamente</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BEM-ESTAR */}
        {seccaoActiva === 'bem-estar' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
                💚 Bem-Estar Durante o Ramadão
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                O Ramadão é um período de renovação espiritual, mental e física.
                Cuida de ti com compaixão e paciência.
              </p>

              <div className="space-y-3">
                <div className="p-4 bg-purple-50 rounded-xl">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">😴 Sono</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Tenta manter 6-7h de sono (pode ser dividido)</li>
                    <li>• Uma sesta curta (20-30 min) após o Dhuhr ajuda</li>
                    <li>• Organiza o horário para acomodar o Suhoor</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-xl">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">🧘‍♀️ Energia</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Os primeiros 3-5 dias são os mais difíceis - é normal</li>
                    <li>• O corpo adapta-se naturalmente (como no jejum intermitente)</li>
                    <li>• A grelina (hormona da fome) ajusta-se em 1-2 semanas</li>
                    <li>• Se sentes muita fraqueza, fala com a Vivianne no chat</li>
                  </ul>
                </div>

                <div className="p-4 bg-rose-50 rounded-xl">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">❤️ Compaixão</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Não te compares com outros - cada jornada é única</li>
                    <li>• O peso pode flutuar - é normal e temporário</li>
                    <li>• Se precisares de ajustar porções, está tudo bem</li>
                    <li>• O Espaço de Retorno está disponível para ti</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">⚠️ Quando Parar o Jejum</h4>
                  <p className="text-xs text-gray-600">
                    A saúde é prioridade no Islão. O jejum não é obrigatório para quem está doente,
                    grávida, a amamentar, com menstruação, ou em situação de risco de saúde.
                    Consulta sempre um profissional de saúde se tiveres dúvidas.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#1a1a3e] to-[#2d2d5e] rounded-2xl p-5 text-white text-center">
              <p className="text-2xl mb-2">🤲</p>
              <p className="text-lg font-bold mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Ramadan Mubarak
              </p>
              <p className="text-white/80 text-sm">
                Que este mês sagrado traga paz, saúde e renovação.
                <br/>Estamos contigo nesta jornada.
              </p>
            </div>
          </div>
        )}

        {/* Link para o Chat */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a1a3e] to-[#2d2d5e] flex items-center justify-center text-xl">
              💬
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">Dúvidas sobre o Ramadão?</p>
              <p className="text-xs text-gray-500">A Vivianne tem respostas específicas para este período</p>
            </div>
            <Link
              to="/vitalis/chat"
              className="px-4 py-2 bg-[#1a1a3e] text-white rounded-full text-sm font-medium hover:bg-[#2d2d5e] transition-colors"
            >
              Falar →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
