import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PALAVRAS_UTEIS, CORES_DOMINIOS } from '../../lib/conteudo-linguagem'
import { marcarProgresso, foiCompletado } from '../../lib/progress'
import { falar } from '../../lib/audio'

const CATEGORIAS = [
  { id: 'comida', nome: 'Comida', icone: '\u{1F35E}' },
  { id: 'casa', nome: 'Casa', icone: '\u{1F3E0}' },
  { id: 'pessoas', nome: 'Pessoas', icone: '\u{1F465}' },
  { id: 'dinheiro', nome: 'Dinheiro', icone: '\u{1F4B0}' },
]

export default function AtividadePalavras() {
  const navigate = useNavigate()
  const cores = CORES_DOMINIOS.linguagem
  const [categoriaActiva, setCategoriaActiva] = useState('comida')
  const [palavraActiva, setPalavraActiva] = useState(null)
  const [modo, setModo] = useState('explorar')
  const [jogoAlvo, setJogoAlvo] = useState(null)
  const [jogoOpcoes, setJogoOpcoes] = useState([])
  const [jogoFeedback, setJogoFeedback] = useState(null)
  const [acertos, setAcertos] = useState(0)

  const palavras = PALAVRAS_UTEIS[categoriaActiva] || []

  function explorarPalavra(p) {
    setPalavraActiva(p)
    falar(p.palavra, 0.7)
    marcarProgresso('linguagem', 2, 'palavras', p.palavra)
  }

  function iniciarJogo() {
    setModo('jogo')
    setAcertos(0)
    gerarRondaJogo()
  }

  function gerarRondaJogo() {
    const todasPalavras = Object.values(PALAVRAS_UTEIS).flat()
    const embaralhadas = [...todasPalavras].sort(() => Math.random() - 0.5)
    const alvo = embaralhadas[0]
    const opcoes = [alvo, ...embaralhadas.filter(p => p.palavra !== alvo.palavra).slice(0, 3)]
      .sort(() => Math.random() - 0.5)
    setJogoAlvo(alvo)
    setJogoOpcoes(opcoes)
    setJogoFeedback(null)
    setTimeout(() => falar(`Qual e a palavra ${alvo.palavra}?`), 300)
  }

  function tentarResposta(p) {
    if (jogoFeedback) return
    if (p.palavra === jogoAlvo.palavra) {
      setJogoFeedback('certo')
      setAcertos(a => a + 1)
      falar('Muito bem! ' + p.palavra)
      marcarProgresso('linguagem', 2, 'palavras', p.palavra)
      setTimeout(() => gerarRondaJogo(), 2500)
    } else {
      setJogoFeedback('tentar')
      falar('Nao e. Tenta outra.')
      setTimeout(() => setJogoFeedback(null), 1500)
    }
  }

  return (
    <div className="breno-app">
      <div className="breno-container">
        <div className="breno-header" style={{ background: `linear-gradient(135deg, ${cores.claro}, white)` }}>
          <button className="breno-voltar" onClick={() => navigate('/linguagem')}>
            {'\u2190'} Voltar
          </button>
          <h1 className="breno-titulo-principal" style={{ color: cores.escuro }}>Palavras do Dia-a-Dia</h1>
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
            <div className="breno-categorias">
              {CATEGORIAS.map(cat => (
                <button
                  key={cat.id}
                  className={`breno-categoria-btn ${categoriaActiva === cat.id ? 'breno-categoria-activa' : ''}`}
                  style={categoriaActiva === cat.id ? { background: cores.principal, color: 'white' } : {}}
                  onClick={() => { setCategoriaActiva(cat.id); setPalavraActiva(null) }}
                >
                  <span>{cat.icone}</span>
                  <span>{cat.nome}</span>
                </button>
              ))}
            </div>

            {palavraActiva && (
              <div className="breno-palavra-destaque" style={{ borderColor: cores.principal }}>
                <div className="breno-palavra-imagem-grande">{palavraActiva.imagem}</div>
                <div className="breno-palavra-texto" style={{ color: cores.escuro }}>{palavraActiva.palavra}</div>
                <div className="breno-palavra-silabas">
                  {palavraActiva.silabas.map((s, i) => (
                    <span key={i} className="breno-palavra-silaba" style={{ background: cores.claro }}>{s}</span>
                  ))}
                </div>
                <button
                  className="breno-btn-ouvir"
                  style={{ background: cores.principal }}
                  onClick={() => falar(palavraActiva.palavra)}
                >
                  {'\u{1F50A}'} Ouvir
                </button>
              </div>
            )}

            <div className="breno-palavras-grid">
              {palavras.map(p => {
                const completado = foiCompletado('linguagem', 2, 'palavras', p.palavra)
                return (
                  <button
                    key={p.palavra}
                    className={`breno-palavra-card ${completado ? 'breno-palavra-completada' : ''} ${palavraActiva?.palavra === p.palavra ? 'breno-palavra-activa' : ''}`}
                    style={{ '--dominio-cor': cores.principal, '--dominio-cor-claro': cores.claro }}
                    onClick={() => explorarPalavra(p)}
                  >
                    <span className="breno-palavra-card-imagem">{p.imagem}</span>
                    <span className="breno-palavra-card-texto">{p.palavra}</span>
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
                  <div className="breno-jogo-imagem-grande">{jogoAlvo.imagem}</div>
                  <p>Qual e a palavra?</p>
                  <button
                    className="breno-btn-ouvir-mini"
                    style={{ background: cores.principal }}
                    onClick={() => falar(jogoAlvo.palavra)}
                  >
                    {'\u{1F50A}'} Ouvir
                  </button>
                </div>
                <div className="breno-jogo-opcoes-palavras">
                  {jogoOpcoes.map((p, i) => (
                    <button
                      key={i}
                      className={`breno-jogo-opcao-palavra ${jogoFeedback === 'certo' && p.palavra === jogoAlvo.palavra ? 'breno-jogo-certo' : ''}`}
                      onClick={() => tentarResposta(p)}
                    >
                      {p.palavra}
                    </button>
                  ))}
                </div>
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
