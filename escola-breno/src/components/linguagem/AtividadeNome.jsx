import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CORES_DOMINIOS } from '../../lib/conteudo-linguagem'
import { marcarProgresso } from '../../lib/progress'
import { falar } from '../../lib/audio'

const NOME = ['B', 'R', 'E', 'N', 'O']

export default function AtividadeNome() {
  const navigate = useNavigate()
  const cores = CORES_DOMINIOS.linguagem
  const [modo, setModo] = useState('ver')
  const [construidas, setConstruidas] = useState([])
  const [letrasDisponiveis, setLetrasDisponiveis] = useState([])
  const [escrita, setEscrita] = useState('')
  const [feedback, setFeedback] = useState(null)

  function iniciarConstrucao() {
    setModo('construir')
    setConstruidas([])
    const extras = ['A', 'S', 'L', 'M']
    const mistura = [...NOME, ...extras.slice(0, 3)].sort(() => Math.random() - 0.5)
    setLetrasDisponiveis(mistura)
    setFeedback(null)
    setTimeout(() => falar('Forma o teu nome: Breno'), 500)
  }

  function adicionarLetra(letra, index) {
    const posicaoActual = construidas.length
    if (posicaoActual >= NOME.length) return
    const letraEsperada = NOME[posicaoActual]

    if (letra === letraEsperada) {
      const novasConstruidas = [...construidas, letra]
      setConstruidas(novasConstruidas)
      setLetrasDisponiveis(prev => prev.filter((_, i) => i !== index))
      falar(letra)
      marcarProgresso('linguagem', 1, 'nome', letra)

      if (novasConstruidas.length === NOME.length) {
        setFeedback('completo')
        setTimeout(() => falar('Breno! Muito bem, esse e o teu nome!'), 500)
      }
    } else {
      setFeedback('tentar')
      falar('Tenta outra letra')
      setTimeout(() => setFeedback(null), 1500)
    }
  }

  function iniciarEscrita() {
    setModo('escrever')
    setEscrita('')
    setFeedback(null)
    setTimeout(() => falar('Escreve o teu nome'), 500)
  }

  function verificarEscrita() {
    const normalizado = escrita.trim().toUpperCase()
    if (normalizado === 'BRENO') {
      setFeedback('completo')
      falar('Perfeito! Breno!')
      NOME.forEach(l => marcarProgresso('linguagem', 1, 'nome', l))
    } else if (normalizado.length > 0) {
      setFeedback('tentar')
      falar('Tenta outra vez')
      setTimeout(() => setFeedback(null), 2000)
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
            O Meu Nome
          </h1>
        </div>

        <div className="breno-modo-toggle" style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <button
            className={`breno-modo-btn ${modo === 'ver' ? 'breno-modo-activo' : ''}`}
            style={modo === 'ver' ? { background: cores.principal, color: 'white' } : {}}
            onClick={() => { setModo('ver'); setFeedback(null) }}
          >
            Ver
          </button>
          <button
            className={`breno-modo-btn ${modo === 'construir' ? 'breno-modo-activo' : ''}`}
            style={modo === 'construir' ? { background: cores.principal, color: 'white' } : {}}
            onClick={iniciarConstrucao}
          >
            Construir
          </button>
          <button
            className={`breno-modo-btn ${modo === 'escrever' ? 'breno-modo-activo' : ''}`}
            style={modo === 'escrever' ? { background: cores.principal, color: 'white' } : {}}
            onClick={iniciarEscrita}
          >
            Escrever
          </button>
        </div>

        {modo === 'ver' && (
          <div className="breno-nome-ver">
            <div className="breno-nome-grande">
              {NOME.map((letra, i) => (
                <button
                  key={i}
                  className="breno-nome-letra"
                  style={{ background: cores.claro, color: cores.escuro, borderColor: cores.principal }}
                  onClick={() => { falar(letra); marcarProgresso('linguagem', 1, 'nome', letra) }}
                >
                  {letra}
                </button>
              ))}
            </div>
            <button
              className="breno-btn-ouvir"
              style={{ background: cores.principal }}
              onClick={() => falar('Breno')}
            >
              {'\u{1F50A}'} Ouvir o nome
            </button>
            <p className="breno-dica">Toca em cada letra para ouvir o seu som</p>
          </div>
        )}

        {modo === 'construir' && (
          <div className="breno-nome-construir">
            <div className="breno-nome-espacos">
              {NOME.map((letra, i) => (
                <div
                  key={i}
                  className={`breno-nome-espaco ${construidas[i] ? 'breno-nome-espaco-preenchido' : ''}`}
                  style={{ borderColor: cores.principal, background: construidas[i] ? cores.claro : 'white', color: cores.escuro }}
                >
                  {construidas[i] || ''}
                </div>
              ))}
            </div>
            <div className="breno-nome-opcoes">
              {letrasDisponiveis.map((letra, i) => (
                <button
                  key={i}
                  className="breno-nome-opcao-btn"
                  style={{ background: cores.claro, color: cores.escuro }}
                  onClick={() => adicionarLetra(letra, i)}
                >
                  {letra}
                </button>
              ))}
            </div>
            {feedback === 'completo' && (
              <>
                <div className="breno-feedback breno-feedback-positivo breno-feedback-grande">
                  {'\u{1F389}'} BRENO!
                </div>
                <button className="breno-btn-repetir" style={{ background: cores.principal }} onClick={iniciarConstrucao}>
                  Fazer outra vez
                </button>
              </>
            )}
            {feedback === 'tentar' && (
              <div className="breno-feedback breno-feedback-neutro">Tenta outra letra</div>
            )}
          </div>
        )}

        {modo === 'escrever' && (
          <div className="breno-nome-escrever">
            <p className="breno-instrucao">Escreve o teu nome:</p>
            <input
              type="text"
              className="breno-input-nome"
              style={{ borderColor: cores.principal }}
              value={escrita}
              onChange={e => setEscrita(e.target.value)}
              placeholder="Escreve aqui..."
              autoFocus
              maxLength={10}
              onKeyDown={e => e.key === 'Enter' && verificarEscrita()}
            />
            <button className="breno-btn-verificar" style={{ background: cores.principal }} onClick={verificarEscrita}>
              Verificar
            </button>
            {feedback === 'completo' && (
              <div className="breno-feedback breno-feedback-positivo breno-feedback-grande">
                {'\u{1F389}'} Perfeito!
              </div>
            )}
            {feedback === 'tentar' && (
              <div className="breno-feedback breno-feedback-neutro">Tenta outra vez</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
