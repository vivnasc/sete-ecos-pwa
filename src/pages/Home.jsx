import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const ecos = [
    { num: 1, nome: 'VITALIS', area: 'Corpo', elemento: 'Terra', cor: 'vitalis', disponivel: false },
    { num: 2, nome: 'SERENA', area: 'Emoção', elemento: 'Água', cor: 'serena', disponivel: false },
    { num: 3, nome: 'IGNIS', area: 'Vontade', elemento: 'Fogo', cor: 'ignis', disponivel: false },
    { num: 4, nome: 'VENTIS', area: 'Ritmo', elemento: 'Ar', cor: 'ventis', disponivel: false },
    { num: 5, nome: 'ECOA', area: 'Voz', elemento: 'Éter', cor: 'ecoa', disponivel: false },
    { num: 7, nome: 'IMAGO', area: 'Identidade', elemento: 'Consciência', cor: 'imago', disponivel: false }
  ]

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-logo">✦</div>
        <h1 className="home-title">SETE ECOS</h1>
        <p className="home-subtitle">Uma PWA. Sete caminhos. Uma travessia.</p>
      </header>

      <section className="home-section">
        <div className="lumina-card" onClick={() => navigate('/lumina')}>
          <div className="lumina-card-header">
            <span className="lumina-card-icon">✦</span>
            <div>
              <h2 className="lumina-card-title">LUMINA</h2>
              <p className="lumina-card-desc">O espelho interior</p>
            </div>
          </div>
          <p className="lumina-card-cta">Check-in diário — Como te sentes hoje?</p>
          <div className="lumina-card-arrow">→</div>
        </div>
      </section>

      <section className="home-section">
        <h3 className="section-title">Os Sete Caminhos</h3>
        <div className="ecos-grid">
          {ecos.map(eco => (
            <div key={eco.nome} className={`eco-card eco-card-${eco.cor} disabled`}>
              <span className="eco-num">{eco.num}</span>
              <h4 className="eco-nome">{eco.nome}</h4>
              <p className="eco-area">{eco.area}</p>
              <span className="eco-elemento">{eco.elemento}</span>
              <span className="eco-badge">Em breve</span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="aurora-card">
          <div className="aurora-card-glow"></div>
          <div className="aurora-card-content">
            <span className="aurora-symbol">☀</span>
            <h3 className="aurora-title">AURŌRA</h3>
            <p className="aurora-desc">A Coroação</p>
            <p className="aurora-info">O bónus de integração para quem completa os 7 Ecos. Onde todas as partes se encontram e a mulher inteira nasce.</p>
            <div className="aurora-progress">
              <span className="aurora-progress-label">0 de 7 Ecos completos</span>
              <div className="aurora-progress-bar">
                <div className="aurora-progress-fill" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="home-footer">
        <button className="logout-button" onClick={handleLogout}>Sair</button>
      </div>
    </div>
  )
}
