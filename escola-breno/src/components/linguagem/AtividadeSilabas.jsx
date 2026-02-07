import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SILABAS_SIMPLES, CORES_DOMINIOS } from '../../lib/conteudo-linguagem'
import { marcarProgresso, foiCompletado } from '../../lib/progress'
import { falar } from '../../lib/audio'

export default function AtividadeSilabas() {
  const navigate = useNavigate()
  const cores = CORES_DOMINIOS.linguagem
  const [modo, setModo] = useState('explorar')
  const [grupoActual, setGrupoActual] = useState('B')
  const [silabaActiva, setSilabaActiva] = useState(null)
  const [jogoConsoante, setJogoConsoante] = useState(null)
  const [jogoVogal, setJogoVogal] = useState(null)
  const [jogoAlvo, setJogoAlvo] = useState(null)
  const [jogoFeedback, setJogoFeedback] = useState(null)
  const [acertos, setAcertos] = useState(0)

  const consoantes = [...new Set(SILABAS_SIMPLES.map(s => s.partes[0]))]
  const vogais = ['A', 'E', 'I', 'O', 'U']
  const silabasDoGrupo = SILABAS_SIMPLES.filter(s => s.partes[0] === grupoActual)

  function explorarSilaba(sil) {
    setSilabaActiva(sil)
    falar(`${sil.partes[0]} com ${sil.partes[1]} faz ${sil.silaba}. ${sil.exemplo}`, 0.7)
    marcarProgresso('linguagem', 2, 'silabas', sil.silaba)
  }

  function iniciarJogo() {
    setModo('jogo')
    setAcertos(0)
    gerarRondaJogo()
  }

  function gerarRondaJogo() {
    const alvo = SILABAS_SIMPLES[Math.floor(Math.random() * SILABAS_SIMPLES.length)]
    setJogoAlvo(alvo)
    setJogoConsoante(null)
    setJogoVogal(null)
    setJogoFeedback(null)
    setTimeout(() => falar(`Faz a silaba ${alvo.silaba}`), 300)
  }

  useEffect(() => {
    if (jogoConsoante && jogoVogal && jogoAlvo) {
      const tentativa = jogoConsoante + jogoVogal
      if (tentativa === jogoAlvo.silaba) {
        setJogoFeedback('certo')
        setAcertos(a => a + 1)
        falar(`${tentativa}! Muito bem!`)
        marcarProgresso('linguagem', 2, 'silabas', tentativa)
        setTimeout(() => gerarRondaJogo(), 2500)
      } else {
        setJogoFeedback('tentar')
        falar(`${tentativa}. Nao e. Tenta outra vez.`)
        setTimeout(() => {
          setJogoConsoante(null)
          setJogoVogal(null)
          setJogoFeedback(null)
        }, 2000)
      }
    }
  }, [jogoConsoante, jogoVogal])

  return (
    <div className="breno-app">
      <div className="breno-container">
        <div className="breno-header" style={{ background: `linear-gradient(135deg, ${cores.claro}, white)` }}>
          <button className="breno-voltar" onClick={() => navigate('/linguagem')}>
            {'\u2190'} Voltar
          </button>
          <h1 className="breno-titulo-principal" style={{ color: cores.escuro }}>Silabas</h1>
          <div className="breno-modo-toggle">
            <button
              className={`breno-modo-btn ${modo === 'explorar' ? 'breno-modo-activo' : ''}`}
              style={modo === 'explorar' ? { background: cores.principal, color: 'white' } : {}}
              onClick={() => setModo('explorar')}
            >
              Explorar
            </button>
            <button
              className={`breno-modo-btn ${modo === 'jogo' ? 'breno-modo-activo' : ''}`}
              style={modo === 'jogo' ? { background: cores.principal, color: 'white' } : {}}
              onClick={iniciarJogo}
            >
              Jogar
            </button>
          </div>
        </div>

        {modo === 'explorar' ? (
          <>
            <div className="breno-silabas-consoantes">
              {consoantes.map(c => (
                <button
                  key={c}
                  className={`breno-silaba-consoante ${grupoActual === c ? 'breno-silaba-consoante-activa' : ''}`}
                  style={grupoActual === c ? { background: cores.principal, color: 'white' } : {}}
                  onClick={() => { setGrupoActual(c); setSilabaActiva(null) }}
                >
                  {c}
                </button>
              ))}
            </div>

            {silabaActiva && (
              <div className="breno-silaba-destaque" style={{ borderColor: cores.principal }}>
                <div className="breno-silaba-grande" style={{ color: cores.escuro }}>
                  <span className="breno-silaba-parte1">{silabaActiva.partes[0]}</span>
                  <span className="breno-silaba-mais">+</span>
                  <span className="breno-silaba-parte2">{silabaActiva.partes[1]}</span>
                  <span className="breno-silaba-igual">=</span>
                  <span className="breno-silaba-resultado">{silabaActiva.silaba}</span>
                </div>
                <div className="breno-silaba-exemplo">Exemplo: <strong>{silabaActiva.exemplo}</strong></div>
                <button
                  className="breno-btn-ouvir"
                  style={{ background: cores.principal }}
                  onClick={() => falar(`${silabaActiva.partes[0]} com ${silabaActiva.partes[1]} faz ${silabaActiva.silaba}. ${silabaActiva.exemplo}`)}
                >
                  {'\u{1F50A}'} Ouvir
                </button>
              </div>
            )}

            <div className="breno-silabas-grid">
              {silabasDoGrupo.map(sil => {
                const completado = foiCompletado('linguagem', 2, 'silabas', sil.silaba)
                return (
                  <button
                    key={sil.silaba}
                    className={`breno-silaba-btn ${completado ? 'breno-silaba-completada' : ''} ${silabaActiva?.silaba === sil.silaba ? 'breno-silaba-activa' : ''}`}
                    style={{ '--dominio-cor': cores.principal, '--dominio-cor-claro': cores.claro }}
                    onClick={() => explorarSilaba(sil)}
                  >
                    <span className="breno-silaba-btn-texto">{sil.silaba}</span>
                    <span className="breno-silaba-btn-exemplo">{sil.exemplo}</span>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="breno-jogo-container">
            {acertos > 0 && (
              <div className="breno-jogo-acertos" style={{ color: cores.escuro }}>
                {'\u2B50'} {acertos} acertos
              </div>
            )}
            {jogoAlvo && (
              <>
                <div className="breno-jogo-pergunta">
                  <p>Faz a silaba:</p>
                  <div className="breno-jogo-alvo" style={{ color: cores.escuro }}>{jogoAlvo.silaba}</div>
                  <button
                    className="breno-btn-ouvir-mini"
                    style={{ background: cores.principal }}
                    onClick={() => falar(jogoAlvo.silaba)}
                  >
                    {'\u{1F50A}'}
                  </button>
                </div>
                <div className="breno-jogo-secao">
                  <p className="breno-jogo-label">Escolhe a consoante:</p>
                  <div className="breno-jogo-letras-row">
                    {consoantes.slice(0, 8).map(c => (
                      <button
                        key={c}
                        className={`breno-jogo-letra-btn ${jogoConsoante === c ? 'breno-jogo-letra-escolhida' : ''}`}
                        style={jogoConsoante === c ? { background: cores.principal, color: 'white' } : {}}
                        onClick={() => { setJogoConsoante(c); falar(c) }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="breno-jogo-secao">
                  <p className="breno-jogo-label">Escolhe a vogal:</p>
                  <div className="breno-jogo-letras-row">
                    {vogais.map(v => (
                      <button
                        key={v}
                        className={`breno-jogo-letra-btn ${jogoVogal === v ? 'breno-jogo-letra-escolhida' : ''}`}
                        style={jogoVogal === v ? { background: cores.principal, color: 'white' } : {}}
                        onClick={() => { setJogoVogal(v); falar(v) }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                {jogoConsoante && jogoVogal && (
                  <div className="breno-silaba-destaque" style={{ borderColor: jogoFeedback === 'certo' ? '#4CAF50' : jogoFeedback === 'tentar' ? '#FF9800' : cores.principal }}>
                    <div className="breno-silaba-grande" style={{ color: cores.escuro }}>{jogoConsoante}{jogoVogal}</div>
                  </div>
                )}
              </>
            )}
            {jogoFeedback === 'certo' && <div className="breno-feedback breno-feedback-positivo">Muito bem!</div>}
            {jogoFeedback === 'tentar' && <div className="breno-feedback breno-feedback-neutro">Tenta outra vez</div>}
          </div>
        )}
      </div>
    </div>
  )
}
