import React from 'react'
import GuiaUtilizadorShell from '../shared/GuiaUtilizadorShell'

const SECCOES = [
  {
    id: 'inicio',
    titulo: 'Começar',
    icone: '🚀',
    conteudo: [
      {
        subtitulo: 'O que é o Serena?',
        texto: 'O Serena é o teu espaço de acolhimento emocional. Ajuda-te a sentir, nomear e transformar emoções — sem julgamento.'
      },
      {
        subtitulo: 'Roda das Emoções',
        texto: 'O Serena usa uma roda de **16 emoções** agrupadas por famílias. Não existem emoções "más" — todas são mensageiras que te guiam.'
      },
      {
        subtitulo: 'Gamificação',
        texto: '**Gotas 💧** — Ganhas gotas ao registar emoções, praticar respiração e fazer rituais.\n\n4 níveis: **Nascente** → **Riacho** → **Rio** → **Oceano**'
      }
    ]
  },
  {
    id: 'diario',
    titulo: 'Diário Emocional',
    icone: '📝',
    conteudo: [
      {
        subtitulo: 'Como Registar',
        texto: '1. Vai ao "Diário" no dashboard\n2. Escolhe a emoção que sentes agora\n3. Marca a intensidade (1-10)\n4. Opcionalmente indica a zona corporal\n5. Escreve uma nota breve'
      },
      {
        subtitulo: 'Zonas Corporais',
        texto: 'As emoções vivem no corpo. O Serena mapeia **7 zonas corporais** para te ajudar a localizar onde sentes:\n\n• **Cabeça** — Pensamentos acelerados\n• **Garganta** — Palavras engolidas\n• **Peito** — Angústia, alegria\n• **Estômago** — Ansiedade, intuição\n• **Mãos** — Raiva, criatividade\n• **Pernas** — Instabilidade, grounding\n• **Corpo inteiro** — Exaustão, euforia'
      },
      {
        subtitulo: 'Padrões',
        texto: 'Ao longo do tempo, o Serena detecta padrões: emoções recorrentes, horários, ciclos. Quanto mais registas, mais claro fica.'
      }
    ]
  },
  {
    id: 'respiracao',
    titulo: 'Respiração',
    icone: '🫁',
    conteudo: [
      {
        subtitulo: '6 Técnicas Disponíveis',
        texto: '• **4-7-8** — Acalma o sistema nervoso em segundos\n• **Box Breathing** — Equilíbrio e foco (4-4-4-4)\n• **Oceânica** — Respiração fluida para relaxar\n• **Suspiro Fisiológico** — Reset rápido de stress\n• **Alternada** — Equilíbrio dos hemisférios cerebrais\n• **Coerência Cardíaca** — 5.5 respirações/minuto'
      },
      {
        subtitulo: 'Quando Usar',
        texto: '• **Ansiedade** → 4-7-8 ou Suspiro\n• **Foco** → Box Breathing\n• **Dormir** → Oceânica ou Coerência\n• **Raiva** → Alternada\n• **Geral** → Coerência Cardíaca'
      }
    ]
  },
  {
    id: 'praticas',
    titulo: 'Práticas de Fluidez',
    icone: '🌊',
    conteudo: [
      {
        subtitulo: 'O que são',
        texto: '15 práticas organizadas em **3 níveis de dificuldade** para te ajudar a fluir com as emoções em vez de resistir.'
      },
      {
        subtitulo: 'Exemplos',
        texto: '• **Nível 1** — Nomear 3 emoções do dia\n• **Nível 2** — Escrever uma carta à emoção\n• **Nível 3** — Dançar a emoção sem música'
      }
    ]
  },
  {
    id: 'rituais',
    titulo: 'Rituais de Libertação',
    icone: '🦋',
    conteudo: [
      {
        subtitulo: 'Para que servem',
        texto: 'Rituais simbólicos para libertar emoções guardadas. Não são "terapia" — são práticas de cuidado consciente.'
      },
      {
        subtitulo: 'SOS Emocional',
        texto: 'O **SOS Emocional** está disponível a qualquer momento — mesmo sem subscrição activa. Se estiveres em crise, usa-o. Inclui respiração de emergência e contactos de apoio.'
      }
    ]
  },
  {
    id: 'ciclos',
    titulo: 'Ciclos',
    icone: '🔄',
    conteudo: [
      {
        subtitulo: 'Ciclo Emocional',
        texto: 'O Serena acompanha o teu ciclo emocional — padrões que se repetem ao longo de semanas ou meses. Quanto mais dados, melhor a previsão.'
      },
      {
        subtitulo: 'Ciclo Menstrual',
        texto: 'Se activares, o Serena integra o ciclo menstrual com o emocional para perceberes melhor a ligação entre hormonas e emoções.\n\n⚠️ Só visível para quem o activar (configuração de género).'
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
        texto: '• Regista emoções 2-3x por dia (manhã, tarde, noite)\n• Experimenta pelo menos 3 técnicas de respiração\n• Faz um ritual de libertação por semana\n• Lê os insights semanais\n• Usa o SOS quando precisares — sem vergonha'
      },
      {
        subtitulo: 'Lembra-te',
        texto: 'Sentir não é fraqueza. É a forma mais corajosa de estar vivo. O Serena não te pede que sejas feliz — pede que sejas honesto(a) contigo.'
      }
    ]
  }
]

export default function GuiaUtilizadorSerena() {
  return (
    <GuiaUtilizadorShell
      titulo="Guia do Utilizador"
      subtitulo="Como usar o Serena"
      color="#6B8E9B"
      colorDark="#4A6B7A"
      backTo="/serena/dashboard"
      chatTo="/serena/chat"
      seccoes={SECCOES}
    />
  )
}
