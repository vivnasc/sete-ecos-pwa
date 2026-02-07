import React from 'react'
import { useNavigate } from 'react-router-dom'
import { DOMINIOS, CORES_DOMINIOS } from '../lib/conteudo-linguagem'
import { getProgressoDominio, getTotalEstrelas } from '../lib/progress'

export default function EscolaBreno() {
  const navigate = useNavigate()
  const estrelas = getTotalEstrelas()

  return (
    <div className="breno-app">
      <div className="breno-container">
        <div className="breno-header">
          <h1 className="breno-titulo-principal">A Escola do Breno</h1>
          <p className="breno-subtitulo">Escolhe o teu mundo</p>
          {estrelas > 0 && (
            <div className="breno-estrelas-total">
              <span className="breno-estrela-icone">{'\u2B50'}</span>
              <span>{estrelas}</span>
            </div>
          )}
        </div>

        <div className="breno-dominios-grid">
          {DOMINIOS.map(dominio => {
            const cores = CORES_DOMINIOS[dominio.id]
            const prog = getProgressoDominio(dominio.id)

            return (
              <button
                key={dominio.id}
                className={`breno-dominio-card ${!dominio.activo ? 'breno-dominio-inactivo' : ''}`}
                style={{
                  '--dominio-cor': cores.principal,
                  '--dominio-cor-claro': cores.claro,
                  '--dominio-cor-escuro': cores.escuro,
                }}
                onClick={() => dominio.activo && navigate(dominio.rota)}
                disabled={!dominio.activo}
              >
                <div className="breno-dominio-icone">{dominio.icone}</div>
                <div className="breno-dominio-nome">{dominio.nome}</div>
                <div className="breno-dominio-descricao">{dominio.descricao}</div>

                {dominio.activo && prog.total > 0 && (
                  <div className="breno-dominio-progresso">
                    <div
                      className="breno-dominio-progresso-barra"
                      style={{ width: `${prog.percentagem}%` }}
                    />
                  </div>
                )}

                {!dominio.activo && (
                  <div className="breno-dominio-breve">Em breve</div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
