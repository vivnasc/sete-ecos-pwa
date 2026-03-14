import React from 'react'
import GuiaUtilizadorShell from '../shared/GuiaUtilizadorShell'

const SECCOES = [
  {
    id: 'inicio',
    titulo: 'Começar',
    icone: '🚀',
    conteudo: [
      {
        subtitulo: 'O que é o Ecoa?',
        texto: 'O Ecoa é o teu espaço de recuperação da voz. Ajuda-te a identificar onde te calas, praticar a tua expressão e libertar palavras guardadas.'
      },
      {
        subtitulo: 'Filosofia',
        texto: 'Quantas frases engoles por dia? O Ecoa não te pede que grites — pede que **fales**. A tua voz existe e merece ser ouvida.'
      },
      {
        subtitulo: 'Gamificação',
        texto: '**Ecos 🔊** — Ganhas ecos ao praticar a voz, escrever cartas e completar exercícios.\n\n4 níveis: **Sussurro** → **Voz** → **Canto** → **Ressonância**'
      }
    ]
  },
  {
    id: 'silenciamento',
    titulo: 'Silêncios',
    icone: '🤐',
    conteudo: [
      {
        subtitulo: 'Mapa de Silenciamento',
        texto: 'Identifica onde te calas mais:\n\n• **Família** — "Para manter a paz"\n• **Trabalho** — "Não é o meu lugar"\n• **Relação** — "Para evitar conflito"\n• **Amigos** — "Para ser aceite"\n• **Sociedade** — "Para não ser julgado(a)"\n• **Contigo** — "Para não sentir"'
      },
      {
        subtitulo: 'Porquê Mapear',
        texto: 'O silêncio inconsciente é uma prisão. O silêncio consciente é uma escolha. O primeiro passo é distinguir os dois.'
      }
    ]
  },
  {
    id: 'micro-voz',
    titulo: 'Micro-Voz',
    icone: '🎤',
    conteudo: [
      {
        subtitulo: 'Programa de 8 Semanas',
        texto: 'Progressão gradual de expressão:\n\n**Semana 1-2** — Nomear silêncios\n**Semana 3-4** — Praticar frases simples\n**Semana 5-6** — Comunicar necessidades\n**Semana 7-8** — Expressar limites\n\nCada semana tem exercícios específicos. Ao teu ritmo.'
      },
      {
        subtitulo: 'Não Precisas de Gritar',
        texto: 'A voz não é volume — é **verdade**. Um sussurro autêntico vale mais que um grito vazio.'
      }
    ]
  },
  {
    id: 'cartas',
    titulo: 'Cartas',
    icone: '✉️',
    conteudo: [
      {
        subtitulo: 'Cartas Não Enviadas',
        texto: '5 categorias de cartas que nunca precisam de ser enviadas:\n\n• **Perdão** — A quem te magoou\n• **Raiva** — O que nunca disseste\n• **Gratidão** — O que devias ter dito\n• **Despedida** — O que ficou por fechar\n• **Verdade** — A verdade nua'
      },
      {
        subtitulo: 'Porquê Escrever',
        texto: 'Escrever é falar sem medo de interrupção. Liberta palavras presas, mesmo que ninguém as leia. O acto de escrever já é cura.'
      }
    ]
  },
  {
    id: 'exercicios',
    titulo: 'Exercícios',
    icone: '🗣️',
    conteudo: [
      {
        subtitulo: '5 Tipos de Exercícios',
        texto: 'Práticas progressivas de expressão:\n\n• **Espelho** — Falar ao espelho\n• **Gravação** — Ouvir a tua própria voz\n• **Escrita livre** — Sem filtro, sem edição\n• **Role-play** — Praticar conversas difíceis\n• **Corpo** — Expressão através de movimento'
      },
      {
        subtitulo: 'Comunicação Assertiva',
        texto: '4 templates para comunicar com clareza:\n\n• **Sentimento** — "Quando X, eu sinto Y"\n• **Sanduíche** — Positivo + pedido + positivo\n• **Disco Riscado** — Repetir calmamente o pedido\n• **Pedido Claro** — "Preciso que X porque Y"'
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
        texto: '• Faz 1 exercício do Micro-Voz por semana (mínimo)\n• Escreve 1 carta por mês\n• Regista frases recuperadas no diário de voz\n• Usa os templates de comunicação assertiva no dia-a-dia\n• Revê o mapa de silenciamento mensalmente'
      },
      {
        subtitulo: 'A Voz Volta',
        texto: 'Pode demorar. Pode ser desconfortável. Mas a tua voz está lá — só precisa de permissão para sair. O Ecoa dá-te essa permissão.'
      }
    ]
  }
]

export default function GuiaUtilizadorEcoa() {
  return (
    <GuiaUtilizadorShell
      titulo="Guia do Utilizador"
      subtitulo="Como usar o Ecoa"
      color="#4A90A4"
      colorDark="#2A6074"
      backTo="/ecoa/dashboard"
      chatTo="/ecoa/chat"
      seccoes={SECCOES}
    />
  )
}
