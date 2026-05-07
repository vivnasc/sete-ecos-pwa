'use client'

import { useEffect, useRef, useState } from 'react'

// Tipos mínimos para SpeechRecognition (não está em lib.dom)
interface SpeechRecognitionEvent extends Event {
  results: {
    length: number
    [index: number]: {
      [index: number]: { transcript: string; confidence: number }
      isFinal: boolean
    }
  }
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

export type UseSpeechResult = {
  suportado: boolean
  ouvir: boolean
  iniciar: () => void
  parar: () => void
  transcricao: string
  parcial: string
  erro: string | null
  reset: () => void
}

export function useSpeechRecognition(opcoes?: {
  lang?: string
  onFim?: (texto: string) => void
}): UseSpeechResult {
  const [suportado, setSuportado] = useState(false)
  const [ouvir, setOuvir] = useState(false)
  const [transcricao, setTranscricao] = useState('')
  const [parcial, setParcial] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const recRef = useRef<SpeechRecognition | null>(null)
  const finalRef = useRef('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Ctor) return
    setSuportado(true)
  }, [])

  const iniciar = () => {
    if (typeof window === 'undefined') return
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Ctor) {
      setErro('voz não suportada neste browser')
      return
    }
    setErro(null)
    finalRef.current = ''
    setTranscricao('')
    setParcial('')

    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = opcoes?.lang ?? 'pt-PT'

    rec.onstart = () => setOuvir(true)
    rec.onend = () => {
      setOuvir(false)
      const finalText = finalRef.current.trim()
      if (finalText && opcoes?.onFim) opcoes.onFim(finalText)
    }
    rec.onerror = (e) => {
      setOuvir(false)
      const msg = e.error === 'not-allowed' || e.error === 'permission-denied'
        ? 'permissão de microfone negada'
        : e.error === 'no-speech'
          ? 'não ouvi nada · tenta de novo'
          : `erro voz: ${e.error}`
      setErro(msg)
    }
    rec.onresult = (e) => {
      let parcialTxt = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) {
          finalRef.current += (finalRef.current ? ' ' : '') + r[0].transcript
        } else {
          parcialTxt += r[0].transcript
        }
      }
      setTranscricao(finalRef.current)
      setParcial(parcialTxt)
    }

    try {
      rec.start()
      recRef.current = rec
    } catch (err) {
      setOuvir(false)
      setErro(err instanceof Error ? err.message : 'erro ao iniciar')
    }
  }

  const parar = () => {
    recRef.current?.stop()
  }

  const reset = () => {
    finalRef.current = ''
    setTranscricao('')
    setParcial('')
    setErro(null)
  }

  return { suportado, ouvir, iniciar, parar, transcricao, parcial, erro, reset }
}
