import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { detectPattern, getReading, getEcoSuggestion } from '../lib/lumina-leituras'
import './Lumina.css'

const SCREENS = [
  { id: 'energia', eco: 2, letra: 'E', resto: 'nergia', explicacao: 'De onde vem a tua força hoje?',
    opcoes: [['vazia', 'baixa'], ['normal'], ['boa', 'cheia']] },
  { id: 'corpo', eco: 1, letra: 'C', resto: 'orpo', explicacao: 'O que sentes quando paras e escutas?',
    opcoes: [['pesado', 'tenso'], ['normal'], ['solto', 'leve']] },
  { id: 'mente', eco: 3, letra: 'M', resto: 'ente', explicacao: 'Como está o ruído interno?',
    opcoes: [['caotica', 'barulhenta'], ['normal'], ['calma', 'silenciosa']] },
  { id: 'passado', eco: 4, letra: 'P', resto: 'assado', explicacao: 'Como te relacionas com o que já foi?',
    opcoes: [['preso', 'apesar'], ['normal'], ['arrumado', 'leve']] },
  { id: 'impulso', eco: 5, letra: 'I', resto: 'mpulso', explicacao: 'O que queres fazer agora?',
    opcoes: [['esconder', 'parar'], ['nada'], ['decidir', 'agir']] },
  { id: 'futuro', eco: 6, letra: 'F', resto: 'uturo', explicacao: 'Como sentes o que vem?',
    opcoes: [['escuro', 'pesado'], ['normal'], ['claro', 'luminoso']] },
  { id: 'espelho', eco: 7, letra: 'E', resto: 'spelho', explicacao: 'Quando te olhas, o que encontras?',
    opcoes: [['invisivel', 'apagada'], ['normal'], ['visivel', 'luminosa']] }
]

export default function Lumina() {
  const [screen, setScreen] = useState('splash')
  const [answers, setAnswers] = useState({})
  const [reading, setReading] = useState(null)
  const [ecoRec, setEcoRec] = useState(null)
  const [exiting, setExiting] = useState(null)
  const [dbUserId, setDbUserId] = useState(null)

  useEffect(() => { initUser() }, [])

  const initUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    let { data: profile } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
    if (!profile) {
      const { data: newUser } = await supabase.from('users').insert({ auth_id: user.id, nome: user.email.split('@')[0], email: user.email }).select('id').single()
      profile = newUser
    }
    if (profile) setDbUserId(profile.id)
  }

  const transition = (from, to) => {
    setExiting(from)
    setTimeout(() => { setScreen(to); setExiting(null) }, 400)
  }

  const select = (id, value) => {
    const newAns = { ...answers, [id]: value }
    setAnswers(newAns)
    const idx = SCREENS.findIndex(s => s.id === id)
    if (idx < SCREENS.length - 1) {
      transition(idx, idx + 1)
    } else {
      transition(idx, 'pause')
      setTimeout(async () => {
        const pattern = detectPattern(newAns)
        const leitura = getReading(pattern)
        const rec = getEcoSuggestion(newAns)
        setReading(leitura)
        setEcoRec(rec)
        await saveCheckin(newAns, pattern, leitura, rec)
        transition('pause', 'reading')
      }, 2500)
    }
  }

  const saveCheckin = async (ans, pat, leit, rec) => {
    if (!dbUserId) return
    try {
      const { data: checkin } = await supabase.from('lumina_checkins').insert({
        user_id: dbUserId, data: new Date().toISOString().split('T')[0],
        corpo: ans.corpo, energia: ans.energia, mente: ans.mente, passado: ans.passado,
        impulso: ans.impulso, futuro: ans.futuro, espelho: ans.espelho
      }).select().single()
      if (checkin) {
        await supabase.from('lumina_leituras').insert({
          user_id: dbUserId, checkin_id: checkin.id, padrao: pat, texto_leitura: leit,
          eco_sugerido: rec?.eco || 'nenhum', bloqueio_principal: rec?.bloqueio || null, razao_sugestao: rec?.msg || null
        })
      }
    } catch (err) { console.error('Erro:', err) }
  }

  const restart = () => { setAnswers({}); setReading(null); setEcoRec(null); transition('reading', 'splash') }

  const cls = (id) => {
    let c = 'lumina-screen'
    if (screen === id) c += ' active'
    if (exiting === id) c += ' exit'
    return c
  }

  return (
    <div className="lumina-container">
      <div className={cls('splash')} onClick={() => transition('splash', 'intro')}>
        <div className="splash-eye">✦</div>
        <h1 className="splash-title">LUMINA</h1>
        <p className="splash-subtitle">o espelho interior</p>
        <p className="splash-tap">toca para começar</p>
      </div>

      <div className={cls('intro')}>
        <p className="intro-text">Este é um momento<br/>de <em>escuta</em>.<br/><br/>Sete perguntas.<br/>Sem respostas certas.<br/>Só <em>verdade</em>.</p>
        <button className="start-button" onClick={() => transition('intro', 0)}>COMEÇAR</button>
      </div>

      {SCREENS.map((s, i) => (
        <div key={s.id} className={`${cls(i)} eco-${s.eco}`}>
          <div className="logo-small">LUMINA</div>
          <div className="progress">{SCREENS.map((_, j) => <div key={j} className={`progress-dot eco-${SCREENS[j].eco} ${j <= i ? 'filled' : ''}`}/>)}</div>
          <div className="question-container">
            <p className={`question eco-${s.eco}`}><span className="letra">{s.letra}</span>{s.resto}</p>
            <p className="question-explanation">{s.explicacao}</p>
          </div>
          <div className="options">
            {s.opcoes.map((row, ri) => <div key={ri} className="options-row">{row.map(opt => <button key={opt} className="option" onClick={() => select(s.id, opt)}>{opt}</button>)}</div>)}
          </div>
        </div>
      ))}

      <div className={`${cls('pause')} pause-screen`}><p className="pause-text">a ler-te...</p></div>

      <div className={cls('reading')}>
        <div className="logo-small">LUMINA</div>
        <div className="reading-container">
          <p className="reading-text">{reading}</p>
          {ecoRec && <div className="eco-recommend"><div className="eco-recommend-title">sugestão</div><div className="eco-recommend-text">{ecoRec.msg}</div></div>}
        </div>
        <div className="reading-signature">LUMINA · Sete Ecos<br/>© Vivianne dos Santos</div>
        <button className="close-button" onClick={restart}>GUARDAR</button>
      </div>
    </div>
  )
}
