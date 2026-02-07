import React from 'react'
import { useNavigate } from 'react-router-dom'
import { DOMINIOS, CORES_DOMINIOS } from '../lib/conteudo-linguagem'

export default function DominioEmBreve({ dominioId }) {
  const navigate = useNavigate()
  const dominio = DOMINIOS.find(d => d.id === dominioId)
  const cores = CORES_DOMINIOS[dominioId] || CORES_DOMINIOS.linguagem

  if (!dominio) {
    return (
      <div className="breno-app">
        <div className="breno-container">
          <p>Dominio nao encontrado</p>
          <button className="breno-voltar" onClick={() => navigate('/')}>Voltar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="breno-app">
      <div className="breno-container">
        <div className="breno-header" style={{ background: `linear-gradient(135deg, ${cores.claro}, white)` }}>
          <button className="breno-voltar" onClick={() => navigate('/')}>
            {'\u2190'} Voltar
          </button>
          <div className="breno-mundo-icone" style={{ fontSize: '4rem' }}>{dominio.icone}</div>
          <h1 className="breno-titulo-principal" style={{ color: cores.escuro }}>
            {dominio.nome}
          </h1>
          <p className="breno-subtitulo">{dominio.descricao}</p>
        </div>

        <div className="breno-em-breve">
          <div className="breno-em-breve-icone">{'\u{1F3D7}'}</div>
          <h2>Em construcao</h2>
          <p>Este mundo esta a ser preparado com muito cuidado.</p>
          <p>Em breve vais poder explorar!</p>
        </div>
      </div>
    </div>
  )
}
