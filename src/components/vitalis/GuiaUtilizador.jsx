import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SECCOES = [
  {
    id: 'inicio',
    titulo: 'Começar',
    icone: '🚀',
    conteudo: [
      {
        subtitulo: 'O que é o Vitalis?',
        texto: 'O Vitalis é a tua app de acompanhamento para o método de Adaptação Metabólica. Ajuda-te a seguir o plano alimentar, registar progresso e manter a motivação.'
      },
      {
        subtitulo: 'Porções com as Mãos',
        texto: 'O método usa as tuas mãos como medida:\n\n• **Palmas** 🫲 = Proteína (carne, peixe, ovos)\n• **Punhos** ✊ = Legumes (à vontade!)\n• **Mãos Concha** 🤲 = Hidratos (arroz, batata)\n• **Polegares** 👍 = Gordura (azeite, abacate)'
      },
      {
        subtitulo: 'Fases do Método',
        texto: '**Indução/Keto:** Hidratos muito reduzidos (< 2 mãos)\n**Low Carb:** Hidratos moderados (2-3 mãos)\n**Normal:** Hidratos normais (4+ mãos)\n\nA fase é definida pelo teu coach no plano inicial.'
      }
    ]
  },
  {
    id: 'dashboard',
    titulo: 'Dashboard',
    icone: '📊',
    conteudo: [
      {
        subtitulo: 'Progresso Diário',
        texto: 'O círculo central mostra o teu progresso de hoje:\n• **Anel exterior:** Refeições registadas\n• **Anel médio:** Água consumida\n• **Anel interior:** Check-in feito\n\nO objectivo é fechar todos os anéis!'
      },
      {
        subtitulo: 'Timer de Jejum',
        texto: 'Se o teu plano inclui jejum intermitente:\n1. Clica em "Iniciar Jejum" quando terminares de comer\n2. O timer conta as horas de jejum\n3. Recebes notificação quando a janela alimentar abre\n\nProtocolos comuns: 16:8, 18:6, 20:4'
      },
      {
        subtitulo: 'Streak (Sequência)',
        texto: 'A streak mostra quantos dias consecutivos fizeste check-in. Mantém a streak alta para ganhar XP e conquistas!'
      }
    ]
  },
  {
    id: 'refeicoes',
    titulo: 'Registar Refeições',
    icone: '🍽️',
    conteudo: [
      {
        subtitulo: 'Como Registar',
        texto: '1. Vai a "Refeições" no dashboard\n2. Seleciona a refeição (pequeno-almoço, almoço, etc.)\n3. Clica em "Registar"\n4. Indica se seguiste o plano\n5. Opcionalmente adiciona foto ou nota'
      },
      {
        subtitulo: 'Sugestões de Refeições',
        texto: 'Em "Sugestões", vês refeições que se encaixam nos teus macros restantes do dia. As cores indicam:\n• **Verde:** Encaixa perfeitamente\n• **Amarelo:** Pode exceder ligeiramente\n• **Vermelho:** Excede os macros'
      },
      {
        subtitulo: 'Calendário de Planeamento',
        texto: 'Usa o "Calendário" para planear a semana toda. Podes copiar o plano da semana anterior para poupar tempo!'
      }
    ]
  },
  {
    id: 'checkin',
    titulo: 'Check-in Diário',
    icone: '✅',
    conteudo: [
      {
        subtitulo: 'Quando Fazer',
        texto: 'Faz o check-in de manhã, idealmente sempre à mesma hora. Isto ajuda a manter consistência nos dados.'
      },
      {
        subtitulo: 'O que Registar',
        texto: '• **Peso:** Em jejum, depois de ir à casa de banho\n• **Sono:** Horas dormidas e qualidade (1-5)\n• **Aderência:** Quanto seguiste o plano (1-10)\n• **Medidas:** Cintura e anca (semanalmente)'
      },
      {
        subtitulo: 'Importância das Medidas',
        texto: 'O peso pode variar por retenção de líquidos. As medidas de cintura e anca são mais fiáveis para ver perda de gordura!'
      }
    ]
  },
  {
    id: 'coach',
    titulo: 'Chat com Vivianne',
    icone: '💬',
    conteudo: [
      {
        subtitulo: 'O que Perguntar',
        texto: 'A Vivianne é a tua coach virtual. Pergunta sobre:\n• Porções e como medir\n• O que comer em cada refeição\n• Jejum intermitente e ciência\n• Hormonas (grelina, insulina, etc.)\n• Autofagia e benefícios\n• Café keto e receitas'
      },
      {
        subtitulo: 'Botões Rápidos',
        texto: 'Usa os botões de perguntas rápidas na parte inferior do chat para aceder a informação comum.'
      }
    ]
  },
  {
    id: 'pwa',
    titulo: 'Instalar a App',
    icone: '📱',
    conteudo: [
      {
        subtitulo: 'O que é PWA?',
        texto: 'O Vitalis é uma Progressive Web App (PWA). Isto significa que podes instalá-la no teu telemóvel como uma app normal, mas sem ocupar espaço da App Store!'
      },
      {
        subtitulo: 'Como Instalar (iPhone)',
        texto: '1. Abre o Vitalis no Safari\n2. Toca no ícone de partilha (quadrado com seta)\n3. Desliza e toca em "Adicionar ao ecrã principal"\n4. Toca em "Adicionar"'
      },
      {
        subtitulo: 'Como Instalar (Android)',
        texto: '1. Abre o Vitalis no Chrome\n2. Aparece um banner "Adicionar ao ecrã inicial"\n3. Ou toca nos 3 pontos → "Instalar app"\n4. Confirma a instalação'
      },
      {
        subtitulo: 'Ativar Notificações',
        texto: 'Depois de instalar:\n1. Inicia um jejum no dashboard\n2. O browser pede permissão para notificações\n3. Aceita para receber alertas quando a janela alimentar abrir\n\n⚠️ No iPhone, as notificações PWA só funcionam em iOS 16.4+'
      }
    ]
  },
  {
    id: 'tendencias',
    titulo: 'Gráficos e Progresso',
    icone: '📈',
    conteudo: [
      {
        subtitulo: 'O que Acompanhar',
        texto: '• **Peso:** Tendência ao longo do tempo\n• **Água:** Meta de 2L/dia\n• **Sono:** Ideal 7-8h\n• **Aderência:** Consistência no plano\n• **Medidas:** Cintura e anca\n• **% Gordura:** Estimativa baseada nas medidas'
      },
      {
        subtitulo: 'Percentagem de Gordura',
        texto: 'O Vitalis calcula uma estimativa da tua % de gordura corporal usando a fórmula de Deurenberg + rácio cintura/anca.\n\n⚠️ É uma estimativa! Para valores precisos, usa bioimpedância ou DEXA.'
      },
      {
        subtitulo: 'Períodos de Análise',
        texto: 'Podes ver tendências de 7, 14 ou 30 dias. Para ver progresso real, olha para períodos mais longos.'
      }
    ]
  },
  {
    id: 'whatsapp',
    titulo: 'Atualizar via WhatsApp',
    icone: '📲',
    conteudo: [
      {
        subtitulo: 'O que podes fazer',
        texto: 'Não precisas de abrir a app para atualizar os teus dados! Manda uma mensagem ao WhatsApp do Sete Ecos e o chatbot trata de tudo:\n\n• **Atualizar peso:** "peso 72kg"\n• **Restrições alimentares:** "sem glúten" ou "tirar lactose"\n• **Atividade física:** "3x semana" ou "atividade moderada"\n• **Refeições por dia:** "4 refeições"\n• **Objetivo:** "quero emagrecer" ou "ganhar massa"'
      },
      {
        subtitulo: 'Como funciona',
        texto: '1. Envia a mensagem para o número Sete Ecos no WhatsApp\n2. O chatbot pergunta-te para confirmar (sim/não)\n3. Os dados são guardados automaticamente\n4. A Vivianne revê e ajusta o teu plano quando necessário\n\nSe o chatbot não te reconhecer pelo número, basta enviar o teu email!'
      },
      {
        subtitulo: 'Número do WhatsApp',
        texto: '**+258 85 100 6473**\n\nGuarda este número nos teus contactos como "Sete Ecos" para acesso rápido.'
      }
    ]
  },
  {
    id: 'dicas',
    titulo: 'Dicas e Truques',
    icone: '💡',
    conteudo: [
      {
        subtitulo: 'Para Melhores Resultados',
        texto: '• Faz check-in todos os dias (streak!)\n• Regista as refeições logo após comer\n• Pesa-te sempre nas mesmas condições\n• Tira fotos de progresso mensais\n• Pergunta dúvidas à Vivianne'
      },
      {
        subtitulo: 'Se Tiveres Fome',
        texto: '• Bebe água primeiro (pode ser sede)\n• Come proteína em todas as refeições\n• Legumes são livres - come à vontade!\n• A grelina (hormona da fome) adapta-se em 1-2 semanas'
      },
      {
        subtitulo: 'Não Desistas!',
        texto: 'Dias maus acontecem. O importante é voltar ao plano no dia seguinte. Usa o "Espaço Retorno" quando precisares de apoio emocional.'
      }
    ]
  }
];

export default function GuiaUtilizador() {
  const [seccaoActiva, setSeccaoActiva] = useState('inicio');

  const seccaoAtual = SECCOES.find(s => s.id === seccaoActiva);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#7C8B6F] to-[#5C6B4F] text-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/vitalis/dashboard" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span>←</span>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Guia do Utilizador</h1>
              <p className="text-white/70 text-sm">Como usar o Vitalis</p>
            </div>
            <span className="text-2xl">📖</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* Navegação das secções */}
        <div className="overflow-x-auto -mx-4 px-4 mb-6">
          <div className="flex gap-2 min-w-max">
            {SECCOES.map(seccao => (
              <button
                key={seccao.id}
                onClick={() => setSeccaoActiva(seccao.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  seccaoActiva === seccao.id
                    ? 'bg-[#7C8B6F] text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{seccao.icone}</span>
                <span>{seccao.titulo}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo da secção */}
        {seccaoAtual && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <span className="text-3xl">{seccaoAtual.icone}</span>
                <h2 className="text-xl font-bold text-gray-800">{seccaoAtual.titulo}</h2>
              </div>

              <div className="space-y-6">
                {seccaoAtual.conteudo.map((item, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-[#7C8B6F] mb-2">{item.subtitulo}</h3>
                    <div className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">
                      {item.texto.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i} className="text-gray-800">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navegação anterior/próximo */}
        <div className="flex justify-between mt-6">
          {(() => {
            const indexAtual = SECCOES.findIndex(s => s.id === seccaoActiva);
            const anterior = indexAtual > 0 ? SECCOES[indexAtual - 1] : null;
            const proximo = indexAtual < SECCOES.length - 1 ? SECCOES[indexAtual + 1] : null;

            return (
              <>
                {anterior ? (
                  <button
                    onClick={() => setSeccaoActiva(anterior.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-gray-600 hover:bg-gray-50"
                  >
                    <span>←</span>
                    <span className="text-sm">{anterior.titulo}</span>
                  </button>
                ) : <div />}

                {proximo ? (
                  <button
                    onClick={() => setSeccaoActiva(proximo.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#7C8B6F] rounded-xl text-white hover:bg-[#6B7A5D]"
                  >
                    <span className="text-sm">{proximo.titulo}</span>
                    <span>→</span>
                  </button>
                ) : <div />}
              </>
            );
          })()}
        </div>

        {/* Ajuda adicional */}
        <div className="mt-8 bg-gradient-to-r from-[#7C8B6F] to-[#5C6B4F] rounded-2xl p-5 text-white">
          <h3 className="font-bold mb-2">Ainda tens dúvidas?</h3>
          <p className="text-white/80 text-sm mb-4">
            Pergunta à Vivianne! Ela conhece todo o método e pode ajudar com questões específicas.
          </p>
          <Link
            to="/vitalis/chat"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#7C8B6F] rounded-lg font-medium hover:bg-gray-100"
          >
            <span>💬</span>
            <span>Falar com Vivianne</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
