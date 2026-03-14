import React from 'react'
import GuiaUtilizadorShell from '../shared/GuiaUtilizadorShell'

const SECCOES = [
  {
    id: 'inicio',
    titulo: 'Começar',
    icone: '🚀',
    conteudo: [
      {
        subtitulo: 'O que é o Ignis?',
        texto: 'O Ignis é o teu centro de vontade consciente. Ajuda-te a focar, escolher com intenção e transformar dispersão em direcção.'
      },
      {
        subtitulo: 'Filosofia',
        texto: 'Não é sobre fazer mais — é sobre **escolher melhor**. Cada escolha consciente é um acto de poder. Cada "não" ao dispensável é um "sim" ao essencial.'
      },
      {
        subtitulo: 'Gamificação',
        texto: '**Chamas 🔥** — Ganhas chamas ao fazer escolhas conscientes, completar sessões de foco e vencer desafios.\n\n4 níveis: **Faísca** → **Brasa** → **Chama** → **Fogueira**'
      }
    ]
  },
  {
    id: 'escolhas',
    titulo: 'Escolhas',
    icone: '🎯',
    conteudo: [
      {
        subtitulo: 'Escolhas Conscientes',
        texto: 'Cada vez que enfrentas uma decisão, regista-a:\n\n1. O que decidiste\n2. Porquê (intenção)\n3. Nível de consciência (1-10)\n\nCom o tempo, vês o padrão: decides por medo ou por vontade?'
      },
      {
        subtitulo: 'Exercício de Corte',
        texto: 'Semanalmente, escolhe algo para **cortar** da tua vida — um hábito, uma relação tóxica, uma distracção. O corte é libertação.'
      }
    ]
  },
  {
    id: 'foco',
    titulo: 'Foco',
    icone: '🔬',
    conteudo: [
      {
        subtitulo: 'Sessões de Foco',
        texto: 'Timer de concentração com métricas:\n• Define a tarefa\n• Escolhe a duração (15-90 min)\n• Regista distracções que surgem\n• Avalia a qualidade da sessão'
      },
      {
        subtitulo: 'Detector de Dispersão',
        texto: 'Mapeia o que te distrai mais: telemóvel, pessoas, pensamentos, ambiente. Ao identificar os padrões, podes criar defesas.'
      }
    ]
  },
  {
    id: 'desafios',
    titulo: 'Desafios',
    icone: '⚔️',
    conteudo: [
      {
        subtitulo: '16 Desafios de Fogo',
        texto: 'Organizados em 4 categorias:\n\n• **Coragem** — Enfrentar medos\n• **Corte** — Eliminar o dispensável\n• **Alinhamento** — Agir conforme valores\n• **Iniciativa** — Dar o primeiro passo'
      },
      {
        subtitulo: 'Bússola de Valores',
        texto: 'Define os teus valores-guia e avalia semanalmente se as tuas acções estão alinhadas. A bússola mostra o desvio entre intenção e acção.'
      }
    ]
  },
  {
    id: 'plano',
    titulo: 'Plano de Acção',
    icone: '📋',
    conteudo: [
      {
        subtitulo: 'Como Funciona',
        texto: 'Constrói planos com objectivos claros:\n\n1. Define o objectivo\n2. Divide em passos concretos\n3. Associa prazos\n4. Marca cada passo como feito\n\nO plano não é uma prisão — é uma bússola.'
      },
      {
        subtitulo: 'Diário de Conquistas',
        texto: 'Regista cada vitória, por mais pequena. Olhar para trás e ver o que fizeste é combustível para o que falta fazer.'
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
        texto: '• Faz pelo menos 1 escolha consciente por dia\n• Completa 1 sessão de foco diária\n• Faz o exercício de corte semanal\n• Revê a bússola de valores semanalmente\n• Aceita 1 desafio de fogo por semana'
      },
      {
        subtitulo: 'Quando o Fogo Apaga',
        texto: 'É normal perder motivação. O segredo não é nunca apagar — é saber reacender. Uma faísca basta. Volta ao dashboard, faz um registo pequeno. O fogo volta.'
      }
    ]
  }
]

export default function GuiaUtilizadorIgnis() {
  return (
    <GuiaUtilizadorShell
      titulo="Guia do Utilizador"
      subtitulo="Como usar o Ignis"
      color="#C1634A"
      colorDark="#8B4332"
      backTo="/ignis/dashboard"
      chatTo="/ignis/chat"
      seccoes={SECCOES}
    />
  )
}
