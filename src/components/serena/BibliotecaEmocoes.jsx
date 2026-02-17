import React, { useState } from 'react'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

/**
 * BIBLIOTECA DE EMOCOES — Guia educativo sobre emocoes
 * Explica cada emocao: o que e, para que serve, como lidar,
 * diferencas entre emocoes parecidas
 */

const BIBLIOTECA = [
  {
    id: 'alegria',
    nome: 'Alegria',
    icon: '😊',
    cor: '#FFD700',
    oque: 'Sensacao de prazer, satisfacao e bem-estar. Pode ser suave (contentamento) ou intensa (euforia).',
    paraque: 'Reforcar comportamentos positivos. Conectar-te aos outros. Dar energia para agir.',
    comolidar: 'Permite-te senti-la sem culpa. Partilha com alguem. Regista o que a provocou — para poderes voltar la.',
    confunde_com: { emocao: 'Mania/Euforia', diferenca: 'A alegria e sustentavel e proporcional. A mania e excessiva, desligada da realidade e seguida de queda.' }
  },
  {
    id: 'tristeza',
    nome: 'Tristeza',
    icon: '😢',
    cor: '#4A90A4',
    oque: 'Sensacao de perda, vazio ou desapontamento. E uma das emocoes mais profundas e necessarias.',
    paraque: 'Processar perdas. Pedir ajuda (a tristeza e social). Reavaliar o que importa. Descansar.',
    comolidar: 'Nao a apresses. Chora se precisares. Fala com alguem. Escreve. Descansa. A tristeza precisa de tempo.',
    confunde_com: { emocao: 'Depressao', diferenca: 'A tristeza tem causa e passa. A depressao e persistente (>2 semanas), sem causa clara, e afecta sono/apetite/energia.' }
  },
  {
    id: 'raiva',
    nome: 'Raiva',
    icon: '😠',
    cor: '#C1634A',
    oque: 'Energia intensa que surge quando algo viola os teus limites, valores ou expectativas.',
    paraque: 'Proteger limites. Denunciar injustica. Motivar accao. A raiva e combustivel.',
    comolidar: 'Nao a reprimas NEM a descarregues em alguem. Sente-a no corpo. Move-te (sacude, caminha). Depois, pergunta: "O que preciso?"',
    confunde_com: { emocao: 'Frustacao', diferenca: 'A frustracao e raiva contida por obstaculos. A raiva pura e mais quente e direccionada a algo/alguem.' }
  },
  {
    id: 'medo',
    nome: 'Medo',
    icon: '😨',
    cor: '#8B7BA5',
    oque: 'Alarme do corpo perante ameaca (real ou imaginada). Activa o sistema de luta-ou-fuga.',
    paraque: 'Proteger-te de perigo real. Preparar-te para desafios. Sinalizar que algo importa.',
    comolidar: 'Respira (o medo encurta a respiracao). Pergunta: "O perigo e real ou imaginado?" Nomeia o medo — isso reduz a sua forca.',
    confunde_com: { emocao: 'Ansiedade', diferenca: 'O medo tem objecto claro (medo DE algo). A ansiedade e difusa — e medo sem endereco.' }
  },
  {
    id: 'ansiedade',
    nome: 'Ansiedade',
    icon: '😰',
    cor: '#C4A265',
    oque: 'Preocupacao excessiva sobre o futuro. O corpo age como se houvesse perigo, mas nao ha (ainda).',
    paraque: 'Antecipar problemas (em dose pequena). Preparar-te. Motivar planeamento.',
    comolidar: 'Volta ao presente (grounding 5-4-3-2-1). Respira devagar. Pergunta: "Posso resolver isto AGORA? Se nao, posso soltar?"',
    confunde_com: { emocao: 'Medo', diferenca: 'O medo e sobre o presente (perigo agora). A ansiedade e sobre o futuro (e se acontecer?).' }
  },
  {
    id: 'vergonha',
    nome: 'Vergonha',
    icon: '😳',
    cor: '#CE93D8',
    oque: 'Sensacao de que algo esta errado CONTIGO (nao com o que fizeste). E sobre identidade, nao accao.',
    paraque: 'Regular comportamento social. Mas em excesso, paralisa.',
    comolidar: 'Partilha com alguem de confianca — a vergonha morre quando e falada. Distingue "fiz algo mau" de "sou ma".',
    confunde_com: { emocao: 'Culpa', diferenca: 'A culpa e "fiz algo errado" (accao). A vergonha e "sou errada" (identidade). A culpa pode ser util; a vergonha raramente e.' }
  },
  {
    id: 'culpa',
    nome: 'Culpa',
    icon: '😔',
    cor: '#A1887F',
    oque: 'Desconforto por ter feito algo contra os teus valores. Pode ser propria ou herdada (de outros).',
    paraque: 'Corrigir comportamentos. Reparar relacoes. Alinhar accoes com valores.',
    comolidar: 'Pergunta: "Esta culpa e minha ou de alguem?" Se e tua: repara ou perdoa-te. Se e herdada: devolve-a mentalmente.',
    confunde_com: { emocao: 'Vergonha', diferenca: 'A culpa foca-se na accao e pode ser reparada. A vergonha foca-se no eu e precisa de compaixao.' }
  },
  {
    id: 'solidao',
    nome: 'Solidao',
    icon: '🥺',
    cor: '#78909C',
    oque: 'Sensacao de desconexao dos outros, mesmo rodeada de pessoas. Nao e estar so — e sentir-se so.',
    paraque: 'Motivar conexao. Dizer-te que precisas de pertenca. Pedir-te que te aproximes.',
    comolidar: 'Reconhece-a sem julgar. Contacta alguem (mesmo um "ola"). Lembra-te: estar so e uma situacao, nao uma identidade.',
    confunde_com: { emocao: 'Vazio', diferenca: 'A solidao quer conexao com outros. O vazio e desconexao de tudo — inclusive de ti mesma.' }
  },
  {
    id: 'gratidao',
    nome: 'Gratidao',
    icon: '🙏',
    cor: '#E8B4B8',
    oque: 'Reconhecimento de algo bom na tua vida. Pode ser pela natureza, pessoas, situacoes ou por ti mesma.',
    paraque: 'Aumentar bem-estar. Fortalecer relacoes. Mudar o foco do que falta para o que existe.',
    comolidar: 'Saboreia-a. Diz em voz alta "sou grata por..." Escreve. Partilha. A gratidao cresce quando e expressa.',
    confunde_com: { emocao: 'Obrigacao', diferenca: 'A gratidao e livre e espontanea. A obrigacao e forcada — "deveria agradecer" nao e gratidao.' }
  },
  {
    id: 'vazio',
    nome: 'Vazio',
    icon: '😶',
    cor: '#9E9E9E',
    oque: 'Ausencia de sentir. Entorpecimento. O corpo desligou as emocoes como proteccao.',
    paraque: 'Proteger-te quando tudo e demais. E uma pausa do sistema nervoso. Nao e falha.',
    comolidar: 'Nao forces. Comeca pelo corpo: toca algo frio, come algo com sabor forte, toma banho. O corpo e a porta de volta.',
    confunde_com: { emocao: 'Calma', diferenca: 'A calma e presenca tranquila. O vazio e ausencia de presenca.' }
  }
]

export default function BibliotecaEmocoes() {
  const [selected, setSelected] = useState(null)

  const emocao = selected ? BIBLIOTECA.find(e => e.id === selected) : null

  return (
    <div className="min-h-screen" style={{ background: '#1a2e3a' }}>
      <ModuleHeader eco="serena" title="Biblioteca de Emocoes" compact />

      <div className="max-w-lg mx-auto px-5 py-6">
        {!selected ? (
          <>
            <p className="text-white/50 text-sm mb-6">
              Toca numa emocao para aprender sobre ela: o que e, para que serve, e como lidar.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {BIBLIOTECA.map((emo) => (
                <button
                  key={emo.id}
                  onClick={() => setSelected(emo.id)}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 text-left hover:bg-white/10 transition-colors"
                >
                  <span className="text-3xl block mb-2">{emo.icon}</span>
                  <p className="text-white font-medium text-sm">{emo.nome}</p>
                  <p className="text-white/30 text-xs mt-1 line-clamp-2">{emo.oque.slice(0, 60)}...</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {/* Cabecalho da emocao */}
            <div className="text-center">
              <span className="text-6xl block mb-3">{emocao.icon}</span>
              <h2
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {emocao.nome}
              </h2>
            </div>

            {/* O que e */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
              <h3 className="text-[#6B8E9B] font-semibold text-sm mb-2">O que e?</h3>
              <p className="text-white/80 text-sm leading-relaxed">{emocao.oque}</p>
            </div>

            {/* Para que serve */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
              <h3 className="text-[#6B8E9B] font-semibold text-sm mb-2">Para que serve?</h3>
              <p className="text-white/80 text-sm leading-relaxed">{emocao.paraque}</p>
            </div>

            {/* Como lidar */}
            <div
              className="rounded-2xl p-5"
              style={{ background: '#6B8E9B15', border: '1px solid #6B8E9B25' }}
            >
              <h3 className="text-[#6B8E9B] font-semibold text-sm mb-2">Como lidar?</h3>
              <p className="text-white/80 text-sm leading-relaxed">{emocao.comolidar}</p>
            </div>

            {/* Nao confundir com */}
            {emocao.confunde_com && (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
                <h3 className="text-amber-400/80 font-semibold text-sm mb-2">
                  Nao confundir com: {emocao.confunde_com.emocao}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">{emocao.confunde_com.diferenca}</p>
              </div>
            )}

            {/* Voltar */}
            <button
              onClick={() => setSelected(null)}
              className="w-full py-3 rounded-xl bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors"
            >
              Ver todas as emocoes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
