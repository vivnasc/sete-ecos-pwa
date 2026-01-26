import { useState, useEffect } from 'react'
import { supabase, saveCheckin, saveLeitura, getCheckinHoje } from '../lib/supabase'
import { gerarLeitura } from '../lib/lumina-leituras'

const INPUTS = [
  { id: 'corpo', pergunta: 'Como está o teu corpo?', opcoes: ['pesado','tenso','normal','solto','leve'] },
  { id: 'energia', pergunta: 'Como está a tua energia?', opcoes: ['vazia','baixa','normal','boa','cheia'] },
  { id: 'mente', pergunta: 'Como está a tua mente?', opcoes: ['caotica','barulhenta','normal','calma','silenciosa'] },
  { id: 'passado', pergunta: 'Como te sentes em relação ao passado?', opcoes: ['preso','apesar','normal','arrumado','leve'] },
  { id: 'futuro', pergunta: 'Como vês o futuro?', opcoes: ['escuro','pesado','normal','claro','luminoso'] },
  { id: 'impulso', pergunta: 'Qual é o teu impulso?', opcoes: ['esconder','parar','nada','decidir','agir'] },
  { id: 'espelho', pergunta: 'Como te vês ao espelho?', opcoes: ['invisivel','apagada','normal','visivel','luminosa'] }
]

export default function Lumina() {
  const [step, setStep] = useState(0)
  const [respostas, setRespostas] = useState({})
  const [leitura, setLeitura] = useState(null)
  const [loading, setLoading] = useState(true)
  const [jaFez, setJaFez] = useState(false)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const checkin = await getCheckinHoje(user.id)
        if (checkin) { setJaFez(true); setLeitura(checkin.lumina_leituras?.[0]) }
      }
      setLoading(false)
    }
    check()
  }, [])

  const handleSelect = (valor) => {
    const input = INPUTS[step]
    setRespostas({ ...respostas, [input.id]: valor })
    if (step < INPUTS.length - 1) setStep(step + 1)
    else finalizarCheckin({ ...respostas, [input.id]: valor })
  }

  const finalizarCheckin = async (dados) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const checkin = await saveCheckin(user.id, dados)
    const leituraGerada = gerarLeitura(dados)
    const leituraSalva = await saveLeitura(user.id, checkin.id, leituraGerada)
    setLeitura(leituraSalva)
    setJaFez(true)
    setLoading(false)
  }

  if (loading) return <div style={{padding:'40px',textAlign:'center'}}>A carregar...</div>

  if (jaFez && leitura) return (
    <div style={{padding:'20px',maxWidth:'500px',margin:'0 auto'}}>
      <h1 style={{color:'#4B0082',textAlign:'center',marginBottom:'20px'}}>✨ A tua leitura de hoje</h1>
      <div style={{background:'white',padding:'25px',borderRadius:'16px',border:'1px solid #E8E8F0'}}>
        <p style={{fontSize:'1.1rem',lineHeight:'1.7',color:'#1A1A4E'}}>{leitura.texto_leitura}</p>
        {leitura.eco_sugerido && leitura.eco_sugerido !== 'nenhum' && (
          <p style={{marginTop:'20px',padding:'15px',background:'#F8F8FC',borderRadius:'8px',color:'#4B0082'}}>
            <strong>Eco sugerido:</strong> {leitura.eco_sugerido.toUpperCase()}
          </p>
        )}
      </div>
    </div>
  )

  const input = INPUTS[step]
  return (
    <div style={{padding:'20px',maxWidth:'500px',margin:'0 auto'}}>
      <div style={{textAlign:'center',marginBottom:'30px'}}>
        <h1 style={{color:'#4B0082'}}>LUMINA</h1>
        <p style={{color:'#6B6B9D'}}>{step + 1} de {INPUTS.length}</p>
        <div style={{height:'4px',background:'#E8E8F0',borderRadius:'2px',marginTop:'10px'}}>
          <div style={{height:'100%',width:`${((step+1)/INPUTS.length)*100}%`,background:'linear-gradient(90deg,#4B0082,#1A1A4E)',borderRadius:'2px',transition:'width 0.3s'}}/>
        </div>
      </div>
      <h2 style={{textAlign:'center',marginBottom:'25px',color:'#1A1A4E'}}>{input.pergunta}</h2>
      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        {input.opcoes.map(op => (
          <button key={op} onClick={() => handleSelect(op)} style={{padding:'15px',border:'1px solid #E8E8F0',borderRadius:'12px',background:'white',fontSize:'1rem',cursor:'pointer',transition:'all 0.2s'}}>{op}</button>
        ))}
      </div>
    </div>
  )
}
