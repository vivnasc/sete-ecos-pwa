import React, { useState } from 'react'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

/**
 * BIBLIOTECA DE EMOÇÕES — Guia educativo sobre emoções
 * Explica cada emoção: o que é, para que serve, como lidar,
 * diferenças entre emoções parecidas
 */

const BIBLIOTECA = [
  {
    id: 'alegria',
    nome: 'Alegria',
    icon: '😊',
    cor: '#FFD700',
    oque: 'Sensação de prazer, satisfação e bem-estar. Pode ser suave (contentamento) ou intensa (euforia).',
    paraque: 'Reforçar comportamentos positivos. Conectar-te aos outros. Dar energia para agir.',
    comolidar: 'Permite-te senti-la sem culpa. Partilha com alguém. Regista o que a provocou — para poderes voltar lá.',
    confunde_com: { emocao: 'Mania/Euforia', diferenca: 'A alegria é sustentável e proporcional. A mania é excessiva, desligada da realidade e seguida de queda.' }
  },
  {
    id: 'tristeza',
    nome: 'Tristeza',
    icon: '😢',
    cor: '#4A90A4',
    oque: 'Sensação de perda, vazio ou desapontamento. É uma das emoções mais profundas e necessárias.',
    paraque: 'Processar perdas. Pedir ajuda (a tristeza é social). Reavaliar o que importa. Descansar.',
    comolidar: 'Não a apresses. Chora se precisares. Fala com alguém. Escreve. Descansa. A tristeza precisa de tempo.',
    confunde_com: { emocao: 'Depressão', diferenca: 'A tristeza tem causa e passa. A depressão é persistente (>2 semanas), sem causa clara, e afecta sono/apetite/energia.' }
  },
  {
    id: 'raiva',
    nome: 'Raiva',
    icon: '😠',
    cor: '#C1634A',
    oque: 'Energia intensa que surge quando algo viola os teus limites, valores ou expectativas.',
    paraque: 'Proteger limites. Denunciar injustiça. Motivar acção. A raiva é combustível.',
    comolidar: 'Não a reprimas NEM a descarregues em alguém. Sente-a no corpo. Move-te (sacude, caminha). Depois, pergunta: "O que preciso?"',
    confunde_com: { emocao: 'Frustração', diferenca: 'A frustração é raiva contida por obstáculos. A raiva pura é mais quente e direccionada a algo/alguém.' }
  },
  {
    id: 'medo',
    nome: 'Medo',
    icon: '😨',
    cor: '#8B7BA5',
    oque: 'Alarme do corpo perante ameaça (real ou imaginada). Activa o sistema de luta-ou-fuga.',
    paraque: 'Proteger-te de perigo real. Preparar-te para desafios. Sinalizar que algo importa.',
    comolidar: 'Respira (o medo encurta a respiração). Pergunta: "O perigo é real ou imaginado?" Nomeia o medo — isso reduz a sua força.',
    confunde_com: { emocao: 'Ansiedade', diferenca: 'O medo tem objecto claro (medo DE algo). A ansiedade é difusa — é medo sem endereço.' }
  },
  {
    id: 'ansiedade',
    nome: 'Ansiedade',
    icon: '😰',
    cor: '#C4A265',
    oque: 'Preocupação excessiva sobre o futuro. O corpo age como se houvesse perigo, mas não há (ainda).',
    paraque: 'Antecipar problemas (em dose pequena). Preparar-te. Motivar planeamento.',
    comolidar: 'Volta ao presente (grounding 5-4-3-2-1). Respira devagar. Pergunta: "Posso resolver isto AGORA? Se não, posso soltar?"',
    confunde_com: { emocao: 'Medo', diferenca: 'O medo é sobre o presente (perigo agora). A ansiedade é sobre o futuro (e se acontecer?).' }
  },
  {
    id: 'vergonha',
    nome: 'Vergonha',
    icon: '😳',
    cor: '#CE93D8',
    oque: 'Sensação de que algo está errado CONTIGO (não com o que fizeste). É sobre identidade, não acção.',
    paraque: 'Regular comportamento social. Mas em excesso, paralisa.',
    comolidar: 'Partilha com alguém de confiança — a vergonha morre quando é falada. Distingue "fiz algo mau" de "sou má".',
    confunde_com: { emocao: 'Culpa', diferenca: 'A culpa é "fiz algo errado" (acção). A vergonha é "sou errada" (identidade). A culpa pode ser útil; a vergonha raramente é.' }
  },
  {
    id: 'culpa',
    nome: 'Culpa',
    icon: '😔',
    cor: '#A1887F',
    oque: 'Desconforto por ter feito algo contra os teus valores. Pode ser própria ou herdada (de outros).',
    paraque: 'Corrigir comportamentos. Reparar relações. Alinhar acções com valores.',
    comolidar: 'Pergunta: "Esta culpa é minha ou de alguém?" Se é tua: repara ou perdoa-te. Se é herdada: devolve-a mentalmente.',
    confunde_com: { emocao: 'Vergonha', diferenca: 'A culpa foca-se na acção e pode ser reparada. A vergonha foca-se no eu e precisa de compaixão.' }
  },
  {
    id: 'solidao',
    nome: 'Solidão',
    icon: '🥺',
    cor: '#78909C',
    oque: 'Sensação de desconexão dos outros, mesmo rodeada de pessoas. Não é estar só — é sentir-se só.',
    paraque: 'Motivar conexão. Dizer-te que precisas de pertença. Pedir-te que te aproximes.',
    comolidar: 'Reconhece-a sem julgar. Contacta alguém (mesmo um "olá"). Lembra-te: estar só é uma situação, não uma identidade.',
    confunde_com: { emocao: 'Vazio', diferenca: 'A solidão quer conexão com outros. O vazio é desconexão de tudo — inclusive de ti mesma.' }
  },
  {
    id: 'gratidao',
    nome: 'Gratidão',
    icon: '🙏',
    cor: '#E8B4B8',
    oque: 'Reconhecimento de algo bom na tua vida. Pode ser pela natureza, pessoas, situações ou por ti mesma.',
    paraque: 'Aumentar bem-estar. Fortalecer relações. Mudar o foco do que falta para o que existe.',
    comolidar: 'Saboreia-a. Diz em voz alta "sou grata por..." Escreve. Partilha. A gratidão cresce quando é expressa.',
    confunde_com: { emocao: 'Obrigação', diferenca: 'A gratidão é livre e espontânea. A obrigação é forçada — "deveria agradecer" não é gratidão.' }
  },
  {
    id: 'vazio',
    nome: 'Vazio',
    icon: '😶',
    cor: '#9E9E9E',
    oque: 'Ausência de sentir. Entorpecimento. O corpo desligou as emoções como protecção.',
    paraque: 'Proteger-te quando tudo é demais. É uma pausa do sistema nervoso. Não é falha.',
    comolidar: 'Não forces. Começa pelo corpo: toca algo frio, come algo com sabor forte, toma banho. O corpo é a porta de volta.',
    confunde_com: { emocao: 'Calma', diferenca: 'A calma é presença tranquila. O vazio é ausência de presença.' }
  }
]

export default function BibliotecaEmocoes() {
  const [selected, setSelected] = useState(null)

  const emocao = selected ? BIBLIOTECA.find(e => e.id === selected) : null

  return (
    <div className="min-h-screen" style={{ background: '#1a2e3a' }}>
      <ModuleHeader eco="serena" title="Biblioteca de Emoções" compact />

      <div className="max-w-lg mx-auto px-5 py-6">
        {!selected ? (
          <>
            <p className="text-white/50 text-sm mb-6">
              Toca numa emoção para aprender sobre ela: o que é, para que serve, e como lidar.
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
            {/* Cabeçalho da emoção */}
            <div className="text-center">
              <span className="text-6xl block mb-3">{emocao.icon}</span>
              <h2
                className="text-2xl font-bold text-white"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                {emocao.nome}
              </h2>
            </div>

            {/* O que é */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
              <h3 className="text-[#6B8E9B] font-semibold text-sm mb-2">O que é?</h3>
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

            {/* Não confundir com */}
            {emocao.confunde_com && (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
                <h3 className="text-amber-400/80 font-semibold text-sm mb-2">
                  Não confundir com: {emocao.confunde_com.emocao}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">{emocao.confunde_com.diferenca}</p>
              </div>
            )}

            {/* Voltar */}
            <button
              onClick={() => setSelected(null)}
              className="w-full py-3 rounded-xl bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors"
            >
              Ver todas as emoções
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
