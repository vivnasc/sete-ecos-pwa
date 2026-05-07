'use client'

// Hook simples para Text-to-Speech via SpeechSynthesis API.
// pt-PT, voz feminina se disponível.

import { useEffect, useRef, useState } from 'react'

export function useTextToSpeech() {
  const [suportado, setSuportado] = useState(false)
  const [aFalar, setAFalar] = useState(false)
  const vozRef = useRef<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    setSuportado(true)
    const escolherVoz = () => {
      const vozes = window.speechSynthesis.getVoices()
      // Preferir pt-PT, depois pt-BR, depois primeira pt
      const pt =
        vozes.find(v => v.lang === 'pt-PT' && /female|feminin|joana|catarina|luciana/i.test(v.name)) ||
        vozes.find(v => v.lang === 'pt-PT') ||
        vozes.find(v => v.lang === 'pt-BR') ||
        vozes.find(v => v.lang.startsWith('pt')) ||
        null
      vozRef.current = pt
    }
    escolherVoz()
    window.speechSynthesis.onvoiceschanged = escolherVoz
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const falar = (texto: string, opcoes?: { rate?: number; pitch?: number }) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    if (!texto.trim()) return
    // Cancela qualquer fala em curso
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(texto)
    u.lang = vozRef.current?.lang ?? 'pt-PT'
    if (vozRef.current) u.voice = vozRef.current
    u.rate = opcoes?.rate ?? 0.95
    u.pitch = opcoes?.pitch ?? 1.0
    u.onstart = () => setAFalar(true)
    u.onend = () => setAFalar(false)
    u.onerror = () => setAFalar(false)
    window.speechSynthesis.speak(u)
  }

  const parar = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setAFalar(false)
  }

  return { suportado, aFalar, falar, parar }
}
