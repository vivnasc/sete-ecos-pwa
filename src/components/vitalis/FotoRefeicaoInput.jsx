/**
 * FotoRefeicaoInput — input de foto (camera ou ficheiro) que envia
 * imagem para /api/ia (action: foto-refeicao) e devolve estimativa
 * de macros. UI editorial coerente com EstimarMacrosInput.
 *
 * Props:
 *   onAceitar({ descricao, alimentos, proteina_g, ..., porcoes, tipo })
 */

import { useState, useRef } from 'react'
import { Camera, Loader2, Check, X } from 'lucide-react'

export default function FotoRefeicaoInput({ onAceitar, tipoDefault = '' }) {
  const [preview, setPreview] = useState(null)
  const [estimativa, setEstimativa] = useState(null)
  const [tipo, setTipo] = useState(tipoDefault)
  const [analisando, setAnalisando] = useState(false)
  const [erro, setErro] = useState('')
  const inputRef = useRef(null)

  const onPickFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErro('o ficheiro tem de ser uma imagem.')
      return
    }
    setErro('')
    setEstimativa(null)

    // Comprimir/resize antes de enviar (max 1024px largura)
    const dataUrl = await resizeImage(file, 1024, 0.85)
    setPreview(dataUrl)

    // Auto-analisar logo após seleccionar
    setAnalisando(true)
    try {
      const r = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'foto-refeicao', imagem: dataUrl, tipo: tipo || undefined })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'falha')
      setEstimativa(data)
    } catch (err) {
      setErro(err.message || 'não consegui analisar a imagem.')
    } finally {
      setAnalisando(false)
    }
  }

  const limpar = () => {
    setPreview(null)
    setEstimativa(null)
    setErro('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const aceitar = () => {
    if (!estimativa || !onAceitar) return
    onAceitar({ ...estimativa, tipo })
    limpar()
  }

  return (
    <section className="fnx-card-feature" aria-label="Foto da refeição">
      <div className="flex items-center gap-2 mb-3">
        <Camera size={14} strokeWidth={1.4} className="fnx-text-ouro" />
        <span className="fnx-label-cap">foto da refeição</span>
      </div>

      <p
        className="fnx-text-soft mb-3 italic"
        style={{
          fontFamily: 'var(--font-editorial)',
          fontWeight: 300,
          fontSize: '13.5px',
          lineHeight: 1.55
        }}
      >
        tira foto ao prato. a coach descreve e estima macros.
      </p>

      {!preview ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPickFile}
            className="sr-only"
            id="fnx-foto-input"
          />
          <label
            htmlFor="fnx-foto-input"
            className="fnx-btn-primary w-full cursor-pointer"
            style={{ padding: '0.75rem 1rem' }}
          >
            <Camera size={16} strokeWidth={1.4} />
            <span>tirar foto / escolher imagem</span>
          </label>
        </>
      ) : (
        <div>
          <div className="relative rounded-md overflow-hidden" style={{ boxShadow: 'inset 0 0 0 1px var(--fnx-hair-strong)' }}>
            <img src={preview} alt="Refeição" className="w-full h-auto block" style={{ maxHeight: 280, objectFit: 'cover' }} />
            <button
              onClick={limpar}
              className="absolute top-2 right-2 fnx-text-ink rounded-full"
              style={{ background: 'rgba(255,255,255,0.92)', padding: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
              aria-label="remover foto"
            >
              <X size={14} strokeWidth={1.6} />
            </button>
          </div>

          {analisando && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 size={14} strokeWidth={1.4} className="animate-spin fnx-text-ouro" />
              <span className="fnx-text-soft italic" style={{ fontFamily: 'var(--font-editorial)', fontWeight: 300, fontSize: '13.5px' }}>
                a analisar o prato
              </span>
            </div>
          )}

          {erro && (
            <p className="italic mt-3" style={{
              fontFamily: 'var(--font-editorial)', fontWeight: 300,
              fontSize: '12.5px', color: '#C9614E'
            }}>
              {erro}
            </p>
          )}

          {estimativa && (
            <div className="mt-4">
              <p
                className="fnx-text-ink italic mb-3"
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontWeight: 300,
                  fontSize: '14.5px',
                  lineHeight: 1.55
                }}
              >
                {estimativa.descricao || (estimativa.alimentos || []).join(' · ')}
              </p>

              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="fnx-input mb-3"
                style={{ padding: '0.5rem 0.75rem', fontSize: '12px' }}
              >
                <option value="">— refeição —</option>
                <option value="pa">pequeno-almoço</option>
                <option value="lanche-manha">lanche manhã</option>
                <option value="almoco">almoço</option>
                <option value="lanche-tarde">lanche tarde</option>
                <option value="jantar">jantar</option>
                <option value="ceia">ceia</option>
              </select>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: 'kcal', valor: estimativa.kcal },
                  { label: 'proteína', valor: estimativa.proteina_g },
                  { label: 'hidratos', valor: estimativa.hidratos_g },
                  { label: 'gordura', valor: estimativa.gordura_g }
                ].map(m => (
                  <div key={m.label} className="text-center">
                    <p className="fnx-editorial-num fnx-tnum" style={{ fontSize: '20px', lineHeight: 1, color: 'var(--fnx-ink)' }}>
                      {m.valor}
                    </p>
                    <p className="fnx-text-faint" style={{ fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.18em', marginTop: 4 }}>
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>

              {estimativa.nota && (
                <p className="fnx-text-soft italic mb-3" style={{
                  fontFamily: 'var(--font-editorial)', fontWeight: 300,
                  fontSize: '12.5px', lineHeight: 1.5
                }}>
                  {estimativa.nota}
                </p>
              )}

              <button onClick={aceitar} className="fnx-btn-ouro w-full" style={{ padding: '0.625rem 1rem' }}>
                <Check size={14} strokeWidth={1.4} />
                <span>registar esta refeição</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

/**
 * Resize de imagem antes de enviar — reduz custo + latência.
 */
function resizeImage(file, maxWidth = 1024, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxWidth) {
          height = Math.round((maxWidth / width) * height)
          width = maxWidth
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
