// Sintese de voz para a Escola do Breno
// Usa Web Speech API para ler em voz alta

let vozPortuguesa = null

function carregarVoz() {
  if (vozPortuguesa) return vozPortuguesa
  const vozes = window.speechSynthesis.getVoices()
  vozPortuguesa = vozes.find(v => v.lang.startsWith('pt-')) ||
    vozes.find(v => v.lang.startsWith('pt')) ||
    vozes[0]
  return vozPortuguesa
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => carregarVoz()
}

export function falar(texto, velocidade = 0.8) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(texto)
  const voz = carregarVoz()
  if (voz) utterance.voice = voz
  utterance.lang = 'pt-BR'
  utterance.rate = velocidade
  utterance.pitch = 1.0
  utterance.volume = 1.0
  window.speechSynthesis.speak(utterance)
}

export function pararFala() {
  if (window.speechSynthesis) window.speechSynthesis.cancel()
}
