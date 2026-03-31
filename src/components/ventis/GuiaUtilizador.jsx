import React from 'react'
import GuiaUtilizadorShell from '../shared/GuiaUtilizadorShell'

const SECCOES = [
  {
    id: 'inicio',
    titulo: 'Começar',
    icone: '🚀',
    conteudo: [
      {
        subtitulo: 'O que é o Ventis?',
        texto: 'O Ventis é o teu centro de energia e ritmo. Ajuda-te a fluir sem forçar, descansar sem culpa e mover-te com intenção.'
      },
      {
        subtitulo: 'Filosofia',
        texto: 'A energia não é infinita — é **renovável**. O Ventis ensina-te a mapear picos e vales, construir rotinas sustentáveis e prevenir burnout.'
      },
      {
        subtitulo: 'Gamificação',
        texto: '**Folhas 🍃** — Ganhas folhas ao monitorar energia, fazer pausas e conectar-te com a natureza.\n\n4 níveis: **Semente** → **Broto** → **Árvore** → **Floresta**'
      }
    ]
  },
  {
    id: 'energia',
    titulo: 'Energia',
    icone: '⚡',
    conteudo: [
      {
        subtitulo: 'Monitor de Energia',
        texto: 'Regista o teu nível de energia 2-3x por dia:\n\n• **Manhã** — Como acordaste?\n• **Tarde** — Pico ou vale?\n• **Noite** — Como chegaste ao fim do dia?\n\nCom o tempo, o Ventis mostra o teu padrão natural.'
      },
      {
        subtitulo: 'Mapa de Picos e Vales',
        texto: 'Visualiza em gráfico quando tens mais e menos energia. Usa esta informação para planear tarefas difíceis nos picos e descanso nos vales.'
      }
    ]
  },
  {
    id: 'rotinas',
    titulo: 'Rotinas',
    icone: '🔄',
    conteudo: [
      {
        subtitulo: 'Builder de Rotinas',
        texto: 'Cria rotinas personalizadas:\n\n1. Define o período (manhã, tarde, noite)\n2. Adiciona blocos (movimento, pausa, trabalho, cuidado)\n3. Testa durante 1 semana\n4. Ajusta conforme os resultados'
      },
      {
        subtitulo: 'Rituais vs. Rotinas',
        texto: '**Rotina** — Repetição mecânica (escovar dentes)\n**Ritual** — Repetição com intenção (chá da manhã com atenção plena)\n\nO Ventis ajuda-te a transformar rotinas em rituais.'
      }
    ]
  },
  {
    id: 'pausas',
    titulo: 'Pausas',
    icone: '⏸️',
    conteudo: [
      {
        subtitulo: '8 Tipos de Pausa',
        texto: 'Nem toda pausa é igual:\n\n• **Micro-pausa** — 30s-2min entre tarefas\n• **Pausa sensorial** — Fechar os olhos, ouvir\n• **Pausa motora** — Levantar, espreguiçar\n• **Pausa social** — Conversa sem agenda\n• **Pausa criativa** — Rabiscar, brincar\n• **Pausa natural** — Olhar pela janela, ir lá fora\n• **Pausa digital** — Sem ecrãs\n• **Pausa meditativa** — Respiração consciente'
      },
      {
        subtitulo: 'Quando Pausar',
        texto: 'A cada 50-90 minutos de trabalho focado. Ou quando sentires a energia a descer. O corpo avisa — aprende a ouvir.'
      }
    ]
  },
  {
    id: 'movimento',
    titulo: 'Movimento',
    icone: '🏃',
    conteudo: [
      {
        subtitulo: 'Flows de Movimento',
        texto: '6 tipos disponíveis:\n\n• **Yoga** — Flexibilidade e presença\n• **Tai Chi** — Fluidez e equilíbrio\n• **Dança livre** — Expressão sem regras\n• **Caminhada consciente** — Atenção ao passo\n• **Alongamento** — Libertação de tensão\n• **Movimento intuitivo** — Deixar o corpo guiar'
      },
      {
        subtitulo: 'Conexão com a Natureza',
        texto: '10 actividades de conexão:\n\nDesde "pés descalços na terra" até "observar o pôr-do-sol em silêncio". A natureza é o melhor regulador de energia que existe.'
      }
    ]
  },
  {
    id: 'burnout',
    titulo: 'Burnout',
    icone: '🔋',
    conteudo: [
      {
        subtitulo: 'Detector de Burnout',
        texto: 'O Ventis monitoriza sinais precoces:\n\n• Energia consistentemente baixa\n• Sono não-reparador\n• Irritabilidade crescente\n• Perda de prazer nas actividades\n• Isolamento social\n\nSe o score ultrapassar 70%, recebes um alerta.'
      },
      {
        subtitulo: 'Prevenção',
        texto: 'Melhor que tratar burnout é prevenir:\n• Pausas regulares\n• Limites claros (trabalho ≠ vida)\n• Pelo menos 1 actividade de prazer por dia\n• Sono de qualidade (7-8h)\n• Movimento diário'
      }
    ]
  },
  {
    id: 'dicas',
    titulo: 'Dicas',
    icone: '💡',
    conteudo: [
      {
        subtitulo: 'Para Melhores Resultados',
        texto: '• Regista energia 3x por dia (demora 10 segundos)\n• Faz 1 pausa consciente por hora de trabalho\n• Experimenta 1 tipo de movimento novo por semana\n• Sai à natureza pelo menos 1x por semana\n• Revê o mapa de picos semanalmente'
      },
      {
        subtitulo: 'Descansar é Produzir',
        texto: 'A pausa não é o oposto do progresso — é parte dele. Sem descanso, o corpo e a mente degradam. O Ventis lembra-te que parar é avançar.'
      }
    ]
  }
]

export default function GuiaUtilizadorVentis() {
  return (
    <GuiaUtilizadorShell
      titulo="Guia do Utilizador"
      subtitulo="Como usar o Ventis"
      color="#5D9B84"
      colorDark="#3D6B5A"
      backTo="/ventis/dashboard"
      chatTo="/ventis/chat"
      seccoes={SECCOES}
    />
  )
}
