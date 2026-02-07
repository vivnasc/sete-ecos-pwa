import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ALFABETO, CORES_DOMINIOS } from '../../lib/conteudo-linguagem'
import { marcarProgresso, foiCompletado } from '../../lib/progress'
import { falar } from '../../lib/audio'

export default function AtividadeLetras() {
  const navigate = useNavigate()
  const cores = CORES_DOMINIOS.linguagem
  const [letraSelecionada, setLetraSelecionada] = useState(null)
  const [modo, setModo] = useState('explorar')
  const [jogoLetras, setJogoLetras] = useState([])
  const [jogoAlvo, setJogoAlvo] = useState(null)
  const [jogoResultado, setJogoResultado] = useState(null)
  const [acertos, setAcertos] = useState(0)

  function selecionarLetra(item) {
    setLetraSelecionada(item)
    falar(`${item.letra}. ${item.palavra}`)
    marcarProgresso('linguagem', 1, 'letras', item.letra)
  }

  function iniciarJogo() {
    setModo('jogo')
    setAcertos(0)
    gerarRonda()
  }

  function gerarRonda() {
    const embaralhado = [...ALFABETO].sort(() => Math.random() - 0.5)
    const opcoes = embaralhado.slice(0, 4)
    const alvo = opcoes[Math.floor(Math.random() * opcoes.length)]
    setJogoLetras(opcoes)
    setJogoAlvo(alvo)
    setJogoResultado(null)
    setTimeout(() => falar(`Onde esta a letra ${alvo.letra}?`), 300)
  }

  function tentarResposta(item) {
    if (jogoResultado) return
    if (item.letra === jogoAlvo.letra) {
      setJogoResultado('certo')
      setAcertos(a => a + 1)
      falar('Muito bem!')
      marcarProgresso('linguagem', 1, 'letras', item.letra)
      setTimeout(() => gerarRonda(), 2000)
    } else {
      setJogoResultado('tentar')
      falar('Tenta outra vez')
      setTimeout(() => setJogoResultado(null), 1500)
    }
  }

  return (
    <div className="breno-app">
      <div className="breno-container">
        <div className="breno-header" style={{ background: `linear-gradient(135deg, ${cores.claro}, white)` }}>
          <button className="breno-voltar" onClick={() => navigate('/linguagem')}>
            {'\u2190'} Voltar
          </button>
          <h1 className="breno-titulo-principal" style={{ color: cores.escuro }}>
            Explorar Letras
          </h1>
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
            {letraSelecionada && (
              <div className="breno-letra-destaque" style={{ borderColor: cores.principal }}>
                <div className="breno-letra-grande" style={{ color: cores.escuro }}>
                  {letraSelecionada.letra}{letraSelecionada.minuscula}
                </div>
                <div className="breno-letra-imagem">{letraSelecionada.imagem}</div>
                <div className="breno-letra-palavra">{letraSelecionada.palavra}</div>
                <button
                  className="breno-btn-ouvir"
                  style={{ background: cores.principal }}
                  onClick={() => falar(`${letraSelecionada.letra}. ${letraSelecionada.palavra}`)}
                >
                  {'\u{1F50A}'} Ouvir
                </button>
              </div>
            )}

            <div className="breno-letras-grid">
              {ALFABETO.map(item => {
                const completado = foiCompletado('linguagem', 1, 'letras', item.letra)
                return (
                  <button
                    key={item.letra}
                    className={`breno-letra-btn ${completado ? 'breno-letra-completada' : ''} ${letraSelecionada?.letra === item.letra ? 'breno-letra-activa' : ''}`}
                    style={{ '--dominio-cor': cores.principal, '--dominio-cor-claro': cores.claro }}
                    onClick={() => selecionarLetra(item)}
                  >
                    <span className="breno-letra-btn-letra">{item.letra}</span>
                    <span className="breno-letra-btn-imagem">{item.imagem}</span>
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
                  <p>Onde esta a letra...</p>
                  <div className="breno-jogo-alvo" style={{ color: cores.escuro }}>
                    {jogoAlvo.letra}
                  </div>
                  <button
                    className="breno-btn-ouvir-mini"
                    style={{ background: cores.principal }}
                    onClick={() => falar(`Onde esta a letra ${jogoAlvo.letra}?`)}
                  >
                    {'\u{1F50A}'}
                  </button>
                </div>
                <div className="breno-jogo-opcoes">
                  {jogoLetras.map(item => (
                    <button
                      key={item.letra}
                      className={`breno-jogo-opcao ${jogoResultado === 'certo' && item.letra === jogoAlvo.letra ? 'breno-jogo-certo' : ''}`}
                      onClick={() => tentarResposta(item)}
                    >
                      <span className="breno-jogo-opcao-letra">{item.letra}</span>
                      <span className="breno-jogo-opcao-imagem">{item.imagem}</span>
                      <span className="breno-jogo-opcao-palavra">{item.palavra}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {jogoResultado === 'certo' && (
              <div className="breno-feedback breno-feedback-positivo">Muito bem!</div>
            )}
            {jogoResultado === 'tentar' && (
              <div className="breno-feedback breno-feedback-neutro">Tenta outra vez</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
