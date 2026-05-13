/**
 * EstimarMacrosInput — input que recebe descrição em texto da refeição
 * e devolve estimativa de macros via /api/estimar-macros.
 *
 * Tom editorial: caixa com placeholder evocativo, botão "estimar",
 * resultado em fnx-card-solid abaixo com macros + confiança + nota.
 *
 * Props:
 *   onAceitar({ proteina_g, hidratos_g, gordura_g, kcal, porcoes, alimentos })
 *     — chamado quando a cliente clica "registar". O componente pai
 *     decide o que fazer com os valores (inserir na DB, etc).
 */

import { useState } from 'react'
import { Sparkles, Loader2, Check } from 'lucide-react'

export default function EstimarMacrosInput({ onAceitar, tipoDefault = '' }) {
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState(tipoDefault)
  const [estimativa, setEstimativa] = useState(null)
  const [a_estimar, setEstimando] = useState(false)
  const [erro, setErro] = useState('')

  const estimar = async () => {
    if (!descricao.trim() || a_estimar) return
    setEstimando(true)
    setErro('')
    setEstimativa(null)
    try {
      const r = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'estimar-macros',
          descricao: descricao.trim(),
          tipo: tipo || undefined
        })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'falha')
      setEstimativa(data)
    } catch (e) {
      setErro(e.message || 'não consegui estimar agora. tenta outra vez.')
    } finally {
      setEstimando(false)
    }
  }

  const aceitar = () => {
    if (!estimativa || !onAceitar) return
    onAceitar({
      ...estimativa,
      descricao: descricao.trim(),
      tipo
    })
    setDescricao('')
    setEstimativa(null)
  }

  const confiancaTextos = {
    alta: 'estimativa confiante',
    media: 'estimativa razoável',
    baixa: 'estimativa muito aproximada'
  }

  return (
    <section className="fnx-card-feature" aria-label="Estimar macros por descrição">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} strokeWidth={1.4} className="fnx-text-ouro" />
        <span className="fnx-label-cap">descrever e estimar</span>
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
        escreve o que comeste em palavras. a coach estima as porções.
      </p>

      <textarea
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="ex: prato com xima, matapa e bocadinho de frango grelhado · meio abacate"
        rows={2}
        maxLength={500}
        className="fnx-input"
        style={{ fontFamily: 'var(--font-corpo)', fontSize: '14px', resize: 'vertical', minHeight: '56px' }}
      />

      <div className="flex items-center gap-2 mt-3">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="fnx-input"
          style={{ flex: '0 0 auto', width: 'auto', padding: '0.5rem 0.75rem', fontSize: '12px' }}
        >
          <option value="">— refeição —</option>
          <option value="pa">pequeno-almoço</option>
          <option value="lanche-manha">lanche manhã</option>
          <option value="almoco">almoço</option>
          <option value="lanche-tarde">lanche tarde</option>
          <option value="jantar">jantar</option>
          <option value="ceia">ceia</option>
        </select>

        <button
          onClick={estimar}
          disabled={!descricao.trim() || a_estimar}
          className="fnx-btn-primary"
          style={{ flex: '1 1 auto', padding: '0.625rem 1rem' }}
        >
          {a_estimar ? (
            <>
              <Loader2 size={14} strokeWidth={1.4} className="animate-spin" />
              <span>a estimar</span>
            </>
          ) : (
            <>
              <Sparkles size={14} strokeWidth={1.4} />
              <span>estimar macros</span>
            </>
          )}
        </button>
      </div>

      {erro && (
        <p
          className="mt-3 italic"
          style={{
            fontFamily: 'var(--font-editorial)',
            fontWeight: 300,
            fontSize: '12.5px',
            color: '#C9614E',
            lineHeight: 1.5
          }}
        >
          {erro}
        </p>
      )}

      {estimativa && (
        <div className="mt-4">
          <hr className="fnx-hairline mb-4" />
          <div className="flex items-baseline justify-between mb-3">
            <span className="fnx-label-cap">estimativa</span>
            <span className="fnx-label-soft">{confiancaTextos[estimativa.confianca] || ''}</span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: 'kcal', valor: estimativa.kcal, unidade: '' },
              { label: 'proteína', valor: estimativa.proteina_g, unidade: 'g' },
              { label: 'hidratos', valor: estimativa.hidratos_g, unidade: 'g' },
              { label: 'gordura', valor: estimativa.gordura_g, unidade: 'g' }
            ].map(m => (
              <div key={m.label} className="text-center">
                <p className="fnx-editorial-num fnx-tnum" style={{ fontSize: '22px', lineHeight: 1, color: 'var(--fnx-ink)' }}>
                  {m.valor}
                </p>
                <p className="fnx-text-faint" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.18em', marginTop: 4 }}>
                  {m.label}
                </p>
              </div>
            ))}
          </div>

          {estimativa.alimentos && estimativa.alimentos.length > 0 && (
            <p className="fnx-text-faint italic" style={{ fontFamily: 'var(--font-editorial)', fontWeight: 300, fontSize: '11.5px', lineHeight: 1.5 }}>
              detectado: {estimativa.alimentos.join(' · ')}
            </p>
          )}

          {estimativa.nota && (
            <p
              className="fnx-text-soft italic mt-2"
              style={{ fontFamily: 'var(--font-editorial)', fontWeight: 300, fontSize: '12.5px', lineHeight: 1.5 }}
            >
              {estimativa.nota}
            </p>
          )}

          <button
            onClick={aceitar}
            className="fnx-btn-ouro w-full mt-4"
            style={{ padding: '0.625rem 1rem' }}
          >
            <Check size={14} strokeWidth={1.4} />
            <span>registar esta refeição</span>
          </button>
        </div>
      )}
    </section>
  )
}
