import { useState, useEffect } from 'react'
import { supabase, saveCheckin, saveLeitura, getCheckinHoje } from '../lib/supabase'
import { gerarLeitura } from '../lib/lumina-leituras'
import './Lumina.css'

const INPUTS = [
  { id: 'corpo', pergunta: 'Como está o teu corpo hoje?',
    opcoes: [{ valor: 'pesado', label: 'Pesado' }, { valor: 'tenso', label: 'Tenso' }, { valor: 'normal', label: 'Normal' }, { valor: 'solto', label: 'Solto' }, { valor: 'leve', label: 'Leve' }] },
  { id: 'energia', pergunta: 'Como está a tua energia?',
    opcoes: [{ valor: 'vazia', label: 'Vazia' }, { valor: 'baixa', label: 'Baixa' }, { valor: 'normal', label: 'Normal' }, { valor: 'boa', label: 'Boa' }, { valor: 'cheia', label: 'Cheia' }] },
  { id: 'mente', pergunta: 'Como está a tua mente?',
    opcoes: [{ valor: 'caotica', label: 'Caótica' }, { valor: 'barulhenta', label: 'Barulhenta' }, { valor: 'normal', label: 'Normal' }, { valor: 'calma', label: 'Calma' }, { valor: 'silenciosa', label: 'Silenciosa' }] },
  { id: 'passado', pergunta: 'Como te sentes em relação ao passado?',
    opcoes: [{ valor: 'preso', label: 'Presa nele' }, { valor: 'apesar', label: 'Pesa, apesar de tudo' }, { valor: 'normal', label: 'Normal' }, { valor: 'arrumado', label: 'Arrumado' }, { valor: 'leve', label: 'Leve' }] },
  { id: 'futuro', pergunta: 'Como vês o futuro?',
    opcoes: [{ valor: 'escuro', label: 'Escuro' }, { valor: 'pesado', label: 'Pesado' }, { valor: 'normal', label: 'Normal' }, { valor: 'claro', label: 'Claro' }, { valor: 'luminoso', label: 'Luminoso' }] },
  { id: 'impulso', pergunta: 'Qual é o teu impulso hoje?',
    opcoes: [{ valor: 'esconder', label: 'Calar-me' }, { valor: 'parar', label: 'Engolir' }, { valor: 'nada', label: 'Nenhum' }, { valor: 'decidir', label: 'Dizer' }, { valor: 'agir', label: 'Expressar' }] },
  { id: 'espelho', pergunta: 'Como te vês ao espelho?',
    opcoes: [{ valor: 'invisivel', label: 'Invisível' }, { valor: 'apagada', label: 'Apagada' }, { valor: 'normal', label: 'Normal' }, { valor: 'visivel', label: 'Visível' }, { valor: 'luminosa', label: 'Luminosa' }] }
]

export default function Lumina() {
  const [step, setStep] = useState(0)
  const [respostas, setRespostas] = useState({})
  const [leitura, setLeitura] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [jaFez, setJaFez] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkExistingCheckin()
  }, [])

  const checkExistingCheckin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const checkin = await getCheckinHoje(user.id)
        if (checkin) {
          setJaFez(true)
          if (checkin.lumina_leituras && checkin.lumina_leituras.length > 0) {
            setLeitura(checkin.lumina_leituras[0])
          }
        }
      }
    } catch (err) {
      console.error('Erro ao verificar check-in:', err)
    }
    setLoading(false)
  }

  const handleSelect = (valor) => {
    const input = INPUTS[step]
    const novasRespostas = { ...respostas, [input.id]: valor }
    setRespostas(novasRespostas)

    if (step < INPUTS.length - 1) {
      setTimeout(() => setStep(step + 1), 200)
    } else {
      finalizarCheckin(novasRespostas)
    }
  }

  const finalizarCheckin = async (dados) => {
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const checkin = await saveCheckin(user.id, dados)
      const leituraGerada = gerarLeitura(dados)
      const leituraSalva = await saveLeitura(user.id, checkin.id, leituraGerada)
      setLeitura(leituraSalva)
      setJaFez(true)
    } catch (err) {
      console.error('Erro ao salvar:', err)
      setError('Houve um problema ao guardar. Tenta novamente.')
    }

    setSaving(false)
  }

  if (loading) {
    return <div className="lumina-loading"><span className="lumina-loading-icon">✦</span><p>A preparar...</p></div>
  }

  if (saving) {
    return <div className="lumina-loading"><span className="lumina-loading-icon spinning">✦</span><p>A gerar a tua leitura...</p></div>
  }

  if (jaFez && leitura) {
    return (
      <div className="lumina-leitura">
        <header className="lumina-leitura-header">
          <span className="lumina-icon">✦</span>
          <h1>A tua leitura de hoje</h1>
        </header>
        <div className="lumina-leitura-card">
          <p className="lumina-leitura-texto">{leitura.texto_leitura}</p>
        </div>
        {leitura.eco_sugerido && leitura.eco_sugerido !== 'nenhum' && (
          <div className="lumina-sugestao">
            <span className="lumina-sugestao-label">Eco sugerido</span>
            <span className="lumina-sugestao-eco">{leitura.eco_sugerido.toUpperCase()}</span>
            {leitura.bloqueio_principal && (
              <span className="lumina-sugestao-bloqueio">Área de atenção: {leitura.bloqueio_principal}</span>
            )}
          </div>
        )}
        <p className="lumina-leitura-footer">Regressa amanhã para um novo check-in.</p>
      </div>
    )
  }

  const input = INPUTS[step]
  const progresso = ((step + 1) / INPUTS.length) * 100

  return (
    <div className="lumina-checkin">
      <header className="lumina-checkin-header">
        <span className="lumina-icon">✦</span>
        <h1>LUMINA</h1>
        <p className="lumina-progresso-texto">{step + 1} de {INPUTS.length}</p>
        <div className="lumina-progresso-bar">
          <div className="lumina-progresso-fill" style={{ width: `${progresso}%` }} />
        </div>
      </header>

      <div className="lumina-pergunta">
        <h2>{input.pergunta}</h2>
      </div>

      <div className="lumina-opcoes">
        {input.opcoes.map((opcao, index) => (
          <button key={opcao.valor} className="lumina-opcao" onClick={() => handleSelect(opcao.valor)} style={{ animationDelay: `${index * 0.05}s` }}>
            {opcao.label}
          </button>
        ))}
      </div>

      {error && <p className="lumina-error">{error}</p>}
    </div>
  )
}
