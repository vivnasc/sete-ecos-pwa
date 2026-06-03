'use client'

// Helper para enviar foto e obter macros estimados via Vision API.

export type AnaliseRefeicao = {
  tipo: 'pa' | 'almoco' | 'snack' | 'jantar'
  descricao: string
  proteinaG: number | null
  carboG: number | null
  gorduraG: number | null
  calorias: number | null
  observacao: string
}

// Comprime + redimensiona em canvas para reduzir payload (max ~1200px lado maior)
async function comprimirImagem(file: File, maxLado = 1200, qualidade = 0.85): Promise<{ base64: string; mime: string }> {
  const img = new Image()
  const url = URL.createObjectURL(file)
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('imagem inválida'))
    img.src = url
  })
  const escala = Math.min(1, maxLado / Math.max(img.width, img.height))
  const w = Math.round(img.width * escala)
  const h = Math.round(img.height * escala)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas sem contexto')
  ctx.drawImage(img, 0, 0, w, h)
  URL.revokeObjectURL(url)
  const dataUrl = canvas.toDataURL('image/jpeg', qualidade)
  return { base64: dataUrl.split(',')[1] ?? '', mime: 'image/jpeg' }
}

export async function analisarFotoRefeicao(file: File): Promise<AnaliseRefeicao> {
  const { base64, mime } = await comprimirImagem(file)
  const hora = new Date().toTimeString().slice(0, 5)
  const r = await fetch('/api/foto-refeicao', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ image: base64, mime, hora })
  })
  const json = await r.json()
  if (!r.ok) throw new Error(json.error ?? 'erro')
  return json as AnaliseRefeicao
}
