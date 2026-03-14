import React from 'react'
import GuiaUtilizadorShell from '../shared/GuiaUtilizadorShell'

const SECCOES = [
  {
    id: 'inicio',
    titulo: 'Começar',
    icone: '🚀',
    conteudo: [
      {
        subtitulo: 'O que é o Imago?',
        texto: 'O Imago é a tua escavação arqueológica de identidade. Ajuda-te a descobrir quem és — além das máscaras, rótulos e expectativas.'
      },
      {
        subtitulo: 'Filosofia',
        texto: 'Não somos quem nos disseram para ser. O Imago trabalha em **camadas**: infância → adolescência → vida adulta → presente → futuro. Cada camada revela algo.'
      },
      {
        subtitulo: 'Gamificação',
        texto: '**Estrelas ⭐** — Ganhas estrelas ao explorar espelhos, meditar, definir valores e completar exercícios.\n\n4 níveis: **Reflexo** → **Clareza** → **Sabedoria** → **Luminosidade**'
      }
    ]
  },
  {
    id: 'espelho',
    titulo: 'Espelho Triplo',
    icone: '🪞',
    conteudo: [
      {
        subtitulo: 'As 3 Dimensões',
        texto: 'O Espelho Triplo mostra 3 versões de ti:\n\n• **💎 Essência** — Quem és no fundo, sem máscaras\n• **🎭 Máscara** — O que mostras ao mundo por protecção\n• **✨ Aspiração** — Quem queres ser, o teu "eu futuro"\n\nA distância entre máscara e essência é o teu trabalho.'
      },
      {
        subtitulo: 'Como Usar',
        texto: 'Revisita o espelho regularmente. A essência não muda — mas a tua consciência dela aprofunda-se. A máscara pode tornar-se mais leve. A aspiração pode ficar mais clara.'
      }
    ]
  },
  {
    id: 'arqueologia',
    titulo: 'Arqueologia',
    icone: '⛏️',
    conteudo: [
      {
        subtitulo: '5 Camadas',
        texto: 'Escavação progressiva:\n\n1. **Infância** — O que te ensinaram sobre quem és\n2. **Adolescência** — As máscaras que criaste\n3. **Juventude** — As escolhas que te definiram\n4. **Vida adulta** — O que mantiveste e o que largaste\n5. **Presente** — Quem és agora, com tudo isso'
      },
      {
        subtitulo: 'Cerimónia de Nomeação',
        texto: 'Depois da escavação, podes fazer a Cerimónia de Nomeação: escolher um nome simbólico que representa a tua essência descoberta.'
      }
    ]
  },
  {
    id: 'valores',
    titulo: 'Valores',
    icone: '💎',
    conteudo: [
      {
        subtitulo: '50 Valores para Escolher',
        texto: 'O Imago oferece 50 valores universais. O desafio é escolher apenas os que são **realmente teus** — não os que a sociedade espera.\n\nO exercício é feito em eliminação: começas com muitos, vais cortando até ficares com 5-7 essenciais.'
      },
      {
        subtitulo: 'Mapa de Identidade',
        texto: 'Visualiza as 7 dimensões da tua identidade:\n\n• Corpo • Mente • Emoções • Relações • Trabalho • Espiritualidade • Criatividade\n\nCada dimensão tem um score — e o mapa mostra equilíbrio ou desequilíbrio.'
      }
    ]
  },
  {
    id: 'meditacoes',
    titulo: 'Meditações',
    icone: '🧘',
    conteudo: [
      {
        subtitulo: '5 Meditações de Essência',
        texto: 'Meditações guiadas (8-15 min cada):\n\n• **Encontro com a Criança Interior**\n• **Diálogo com a Máscara**\n• **Visão da Essência**\n• **Perdão ao Passado**\n• **Convite ao Futuro**\n\nCada uma tem um script completo em português.'
      },
      {
        subtitulo: 'Quadro de Visão',
        texto: 'Cria o teu vision board digital: imagens, palavras e intenções para o teu "eu futuro". Revê-o semanalmente para manter a direcção.'
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
        texto: '• Revisita o Espelho Triplo mensalmente\n• Faz 1 camada de arqueologia por semana\n• Medita pelo menos 2x por semana\n• Revê os teus valores a cada 3 meses\n• Actualiza o quadro de visão mensalmente'
      },
      {
        subtitulo: 'A Identidade é Fluida',
        texto: 'Não procures "a resposta final" sobre quem és. A identidade é um rio, não uma pedra. O Imago é uma lente — usa-a para ver com mais clareza, não para te fixar.'
      }
    ]
  }
]

export default function GuiaUtilizadorImago() {
  return (
    <GuiaUtilizadorShell
      titulo="Guia do Utilizador"
      subtitulo="Como usar o Imago"
      color="#8B7BA5"
      colorDark="#5B4B75"
      backTo="/imago/dashboard"
      chatTo="/imago/chat"
      seccoes={SECCOES}
    />
  )
}
