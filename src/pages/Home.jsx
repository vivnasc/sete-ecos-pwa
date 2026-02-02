import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const ecos = [
    {
      nome: 'VITALIS',
      slogan: 'A Raiz da Transformação',
      logo: '/logos/VITALIS_LOGO_V3.png',
      disponivel: true,
      rota: '/vitalis/login',
      posicao: 'petala-1'
    },
    {
      nome: 'AUREA',
      slogan: 'A luz interior',
      logo: '/logos/AUREA_LOGO_V3.png',
      disponivel: false,
      posicao: 'petala-2'
    },
    {
      nome: 'SERENA',
      slogan: 'Regular para fluir',
      logo: '/logos/SERENA_LOGO_V3.png',
      disponivel: false,
      posicao: 'petala-3'
    },
    {
      nome: 'IGNIS',
      slogan: 'Agir com direcção',
      logo: '/logos/IGNIS-LOGO-V3.png',
      disponivel: false,
      posicao: 'petala-4'
    },
    {
      nome: 'VENTIS',
      slogan: 'Ritmo sustentável',
      logo: '/logos/VENTIS_LOGO_V3.png',
      disponivel: false,
      posicao: 'petala-5'
    },
    {
      nome: 'ECOA',
      slogan: 'A expressão que ressoa',
      logo: '/logos/ECOA_LOGO_V3.png',
      disponivel: false,
      posicao: 'petala-6'
    },
    {
      nome: 'IMAGO',
      slogan: 'O reflexo da essência',
      logo: '/logos/IMAGO_LOGO_V3.png',
      disponivel: false,
      posicao: 'petala-7'
    }
  ]

  return (
    <div className="home">
      {/* HERO - texto já incluído na imagem de fundo */}
      <section className="hero">
      </section>

      {/* LUMINA */}
      <section className="lumina-section">
        <div className="lumina-card" onClick={() => navigate('/lumina')}>
          <img src="/logos/lumina-logo_v2.png" alt="Lumina" className="lumina-icon" />
          <div className="lumina-content">
            <h2 className="lumina-title">LUMINA</h2>
            <p className="lumina-desc">O espelho interior</p>
            <span className="lumina-cta">Começa aqui →</span>
          </div>
        </div>
      </section>

      {/* OS 7 ECOS */}
      <section className="section-title">
        <h3>Os Sete Caminhos</h3>
      </section>

      <div className="flor-wrapper">
        <div className="flor-container">
          {/* Linhas conectoras */}
          <svg className="linhas-svg" viewBox="0 0 360 360">
            <line x1="180" y1="180" x2="180" y2="55" />
            <line x1="180" y1="180" x2="295" y2="80" />
            <line x1="180" y1="180" x2="320" y2="180" />
            <line x1="180" y1="180" x2="280" y2="290" />
            <line x1="180" y1="180" x2="80" y2="290" />
            <line x1="180" y1="180" x2="40" y2="180" />
            <line x1="180" y1="180" x2="65" y2="80" />
          </svg>

          {/* Centro */}
          <div className="flor-centro">
            <img src="/logos/CENTRO_7ECOS.png" alt="Tu" />
          </div>

          {/* Pétalas / Ecos */}
          {ecos.map(eco => (
            <div
              key={eco.nome}
              className={`petala ${eco.posicao} ${!eco.disponivel ? 'disabled' : ''}`}
              onClick={() => eco.disponivel && navigate(eco.rota)}
            >
              <img src={eco.logo} alt={eco.nome} />
              <span className="petala-label">{eco.nome}</span>
              <span className={`badge ${eco.disponivel ? 'disponivel' : 'breve'}`}>
                {eco.disponivel ? 'Aberto' : 'Breve'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AURORA */}
      <section className="aurora-section">
        <img src="/logos/AURORA_LOGO_V3.png" alt="Aurora" className="aurora-icon" />
        <h2>Aurōra</h2>
        <p className="subtitle">A Coroação — Presença plena</p>
        <p className="unlock-info">Desbloqueia ao completar os 7 caminhos</p>
        <div className="progress-container">
          <div className="progress-info">
            <span>A tua jornada</span>
            <span>1 de 7</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: '14%' }}></div>
          </div>
        </div>
      </section>

      {/* NAVIGATION */}
      <nav className="nav-bottom">
        <a href="#" className="nav-item active">
          <span className="nav-icon">🏠</span>
          <span>Início</span>
        </a>
        <a href="#" className="nav-item" onClick={() => navigate('/lumina')}>
          <span className="nav-icon">👁️</span>
          <span>Lumina</span>
        </a>
      </nav>
    </div>
  )
}
