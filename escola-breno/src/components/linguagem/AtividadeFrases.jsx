import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FRASES_SIMPLES, CORES_DOMINIOS } from '../../lib/conteudo-linguagem'
import { marcarProgresso, foiCompletado } from '../../lib/progress'
import { falar } from '../../lib/audio'

export default function AtividadeFrases() {
  const navigate = useNavigate()
  const cores = CORES_DOMINIOS.linguagem
  const [nivelActivo, setNivelActivo] = useState(1)
  const [modo, setModo] = useState('ler')
  const [fraseActiva, setFraseActiva] = useState(null)
  const [construcaoAlvo, setConstrucaoAlvo] = useState(null)
  const [palavrasColocadas, setPalavrasColocadas] = useState([])
  const [palavrasDisponiveis, setPalavrasDisponiveis] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [acertos, setAcertos] = useState(0)

  const frasesDoNivel = FRASES_SIMPLES.filter(f => f.nivel === nivelActivo)
  const nomeNivel = { 1: 'Frases simples', 2: 'Instrucoes', 3: 'Mensagens' }

  function lerFrase(f) {
    setFraseActiva(f)
    falar(f.frase, 0.65)
    marcarProgresso('linguagem', 3, 'frases', f.frase)
  }

  function iniciarConstrucao() {
    setModo('construir')
    setAcertos(0)
    gerarRondaConstrucao()
  }

  function gerarRondaConstrucao() {
    const frases = FRASES_SIMPLES.filter(f => f.nivel <= nivelActivo)
    const alvo = frases[Math.floor(Math.random() * frases.length)]
    setConstrucaoAlvo(alvo)
    setPalavrasColocadas([])
    setPalavrasDisponiveis([...alvo.palavras].sort(() => Math.random() - 0.5))
    setFeedback(null)
    setTimeout(() => falar(`Constroi a frase: ${alvo.frase}`, 0.65), 300)
  }

  function colocarPalavra(palavra, index) {
    const posicao = palavrasColocadas.length
    const palavraEsperada = construcaoAlvo.palavras[posicao]

    if (palavra === palavraEsperada) {
      const novasColocadas = [...palavrasColocadas, palavra]
      setPalavrasColocadas(novasColocadas)
      setPalavrasDisponiveis(prev => prev.filter((_, i) => i !== index))
      falar(palavra)

      if (novasColocadas.length === construcaoAlvo.palavras.length) {
        setFeedback('completo')
        setAcertos(a => a + 1)
        marcarProgresso('linguagem', 3, 'frases', construcaoAlvo.frase)
        setTimeout(() => falar(`${construcaoAlvo.frase}. Muito bem!`, 0.65), 500)
      }
    } else {
      setFeedback('tentar')
      falar('Tenta outra palavra')
      setTimeout(() => setFeedback(null), 1500)
    }
  }

  function removerUltimaPalavra() {
    if (palavrasColocadas.length === 0) return
    const ultima = palavrasColocadas[palavrasColocadas.length - 1]
    setPalavrasColocadas(prev => prev.slice(0, -1))
    setPalavrasDisponiveis(prev => [...prev, ultima].sort(() => Math.random() - 0.5))
  }

  return (
    <div className="breno-app">
      <div className="breno-container">
        <div className="breno-header" style={{ background: `linear-gradient(135deg, ${cores.claro}, white)` }}>
          <button className="breno-voltar" onClick={() => navigate('/linguagem')}>
            {'\u2190'} Voltar
          </button>
          <h1 className="breno-titulo-principal" style={{ color: cores.escuro }}>Frases Simples</h1>
          <div className="breno-modo-toggle">
            <button
              className={`breno-modo-btn ${modo === 'ler' ? 'breno-modo-activo' : ''}`}
              style={modo === 'ler' ? { background: cores.principal, color: 'white' } : {}}
              onClick={() => setModo('ler')}
            >
              Ler
            </button>
            <button
              className={`breno-modo-btn ${modo === 'construir' ? 'breno-modo-activo' : ''}`}
              style={modo === 'construir' ? { background: cores.principal, color: 'white' } : {}}
              onClick={iniciarConstrucao}
            >
              Construir
            </button>
          </div>
        </div>

        <div className="breno-niveis">
          {[1, 2, 3].map(n => (
            <button
              key={n}
              className={`breno-nivel-btn ${nivelActivo === n ? 'breno-nivel-activo' : ''}`}
              style={nivelActivo === n ? { background: cores.principal, color: 'white' } : {}}
              onClick={() => { setNivelActivo(n); setFraseActiva(null) }}
            >
              {nomeNivel[n]}
            </button>
          ))}
        </div>

        {modo === 'ler' ? (
          <>
            {fraseActiva && (
              <div className="breno-frase-destaque" style={{ borderColor: cores.principal }}>
                <div className="breno-frase-texto" style={{ color: cores.escuro }}>{fraseActiva.frase}</div>
                <div className="breno-frase-palavras">
                  {fraseActiva.palavras.map((p, i) => (
                    <button key={i} className="breno-frase-palavra" style={{ background: cores.claro }} onClick={() => falar(p)}>
                      {p}
                    </button>
                  ))}
                </div>
                <button className="breno-btn-ouvir" style={{ background: cores.principal }} onClick={() => falar(fraseActiva.frase, 0.65)}>
                  {'\u{1F50A}'} Ouvir frase
                </button>
              </div>
            )}
            <div className="breno-frases-lista">
              {frasesDoNivel.map((f, i) => {
                const completado = foiCompletado('linguagem', 3, 'frases', f.frase)
                return (
                  <button
                    key={i}
                    className={`breno-frase-card ${completado ? 'breno-frase-completada' : ''} ${fraseActiva?.frase === f.frase ? 'breno-frase-activa' : ''}`}
                    style={{ '--dominio-cor': cores.principal, '--dominio-cor-claro': cores.claro }}
                    onClick={() => lerFrase(f)}
                  >
                    <span className="breno-frase-card-texto">{f.frase}</span>
                    {completado && <span className="breno-check">{'\u2713'}</span>}
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="breno-jogo-container">
            {acertos > 0 && (
              <div className="breno-jogo-acertos" style={{ color: cores.escuro }}>
                {'\u2B50'} {acertos} frases construidas
              </div>
            )}
            {construcaoAlvo && (
              <>
                <div className="breno-construcao-area">
                  <button
                    className="breno-btn-ouvir-mini"
                    style={{ background: cores.principal, marginBottom: '1rem' }}
                    onClick={() => falar(construcaoAlvo.frase, 0.65)}
                  >
                    {'\u{1F50A}'} Ouvir frase
                  </button>
                  <div className="breno-construcao-frase" style={{ borderColor: cores.principal }}>
                    {construcaoAlvo.palavras.map((_, i) => (
                      <div
                        key={i}
                        className={`breno-construcao-espaco ${palavrasColocadas[i] ? 'breno-construcao-preenchido' : ''}`}
                        style={{ borderColor: cores.principal, background: palavrasColocadas[i] ? cores.claro : 'white', color: cores.escuro }}
                      >
                        {palavrasColocadas[i] || '\u00A0'}
                      </div>
                    ))}
                  </div>
                  {palavrasColocadas.length > 0 && feedback !== 'completo' && (
                    <button className="breno-btn-apagar" onClick={removerUltimaPalavra}>
                      {'\u232B'} Apagar
                    </button>
                  )}
                </div>
                {feedback !== 'completo' && (
                  <div className="breno-construcao-opcoes">
                    {palavrasDisponiveis.map((p, i) => (
                      <button
                        key={i}
                        className="breno-construcao-palavra-btn"
                        style={{ background: cores.claro, color: cores.escuro }}
                        onClick={() => colocarPalavra(p, i)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {feedback === 'completo' && (
              <>
                <div className="breno-feedback breno-feedback-positivo breno-feedback-grande">Muito bem!</div>
                <button className="breno-btn-repetir" style={{ background: cores.principal }} onClick={gerarRondaConstrucao}>
                  Outra frase
                </button>
              </>
            )}
            {feedback === 'tentar' && <div className="breno-feedback breno-feedback-neutro">Tenta outra palavra</div>}
          </div>
        )}
      </div>
    </div>
  )
}
