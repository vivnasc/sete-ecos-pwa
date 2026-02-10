import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ALFABETO, SILABAS_SIMPLES, PALAVRAS_UTEIS, FRASES_SIMPLES, CORES_DOMINIOS } from '../lib/conteudo-linguagem'
import { getPercentagem } from '../lib/progress'

const CAMADAS = [
  {
    numero: 1,
    nome: 'Reconhecimento',
    descricao: 'Letras, sons e o teu nome',
    actividades: [
      {
        id: 'letras',
        nome: 'Explorar Letras',
        descricao: 'Conhece cada letra',
        rota: '/linguagem/letras',
        total: ALFABETO.length,
      },
      {
        id: 'nome',
        nome: 'O Meu Nome',
        descricao: 'Escreve BRENO',
        rota: '/linguagem/nome',
        total: 5,
      },
    ],
  },
  {
    numero: 2,
    nome: 'Construcao',
    descricao: 'Silabas e palavras uteis',
    actividades: [
      {
        id: 'silabas',
        nome: 'Silabas',
        descricao: 'Junta letras em sons',
        rota: '/linguagem/silabas',
        total: SILABAS_SIMPLES.length,
      },
      {
        id: 'palavras',
        nome: 'Palavras do Dia-a-Dia',
        descricao: 'Comida, casa, pessoas',
        rota: '/linguagem/palavras',
        total: Object.values(PALAVRAS_UTEIS).flat().length,
      },
    ],
  },
  {
    numero: 3,
    nome: 'Uso',
    descricao: 'Frases e mensagens',
    actividades: [
      {
        id: 'frases',
        nome: 'Frases Simples',
        descricao: 'Le e constroi frases',
        rota: '/linguagem/frases',
        total: FRASES_SIMPLES.length,
      },
    ],
  },
]

export default function MundoLinguagem() {
  const navigate = useNavigate()
  const cores = CORES_DOMINIOS.linguagem

  return (
    <div className="breno-app">
      <div className="breno-container">
        <div className="breno-header" style={{ background: `linear-gradient(135deg, ${cores.claro}, white)` }}>
          <button className="breno-voltar" onClick={() => navigate('/')}>
            {'\u2190'} Voltar
          </button>
          <div className="breno-mundo-icone">{'\u{1F4D6}'}</div>
          <h1 className="breno-titulo-principal" style={{ color: cores.escuro }}>
            Mundo da Linguagem
          </h1>
          <p className="breno-subtitulo">Ler e Escrever</p>
        </div>

        <div className="breno-camadas">
          {CAMADAS.map(camada => (
            <div key={camada.numero} className="breno-camada">
              <div className="breno-camada-header">
                <div className="breno-camada-numero" style={{ background: cores.principal }}>
                  {camada.numero}
                </div>
                <div>
                  <h2 className="breno-camada-nome">{camada.nome}</h2>
                  <p className="breno-camada-descricao">{camada.descricao}</p>
                </div>
              </div>

              <div className="breno-actividades">
                {camada.actividades.map(act => {
                  const perc = getPercentagem('linguagem', camada.numero, act.id, act.total)
                  return (
                    <button
                      key={act.id}
                      className="breno-actividade-card"
                      style={{ '--dominio-cor': cores.principal, '--dominio-cor-claro': cores.claro }}
                      onClick={() => navigate(act.rota)}
                    >
                      <div className="breno-actividade-info">
                        <div className="breno-actividade-nome">{act.nome}</div>
                        <div className="breno-actividade-descricao">{act.descricao}</div>
                      </div>
                      <div className="breno-actividade-progresso-wrap">
                        <div className="breno-actividade-progresso">
                          <div
                            className="breno-actividade-progresso-barra"
                            style={{ width: `${perc}%`, background: cores.principal }}
                          />
                        </div>
                        <span className="breno-actividade-perc">{perc}%</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
