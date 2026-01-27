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
      cor: 'vitalis', 
      logo: '/logos/vitalis_logo.png',
      disponivel: true,
      rota: '/vitalis/login'
    },
    { 
      nome: 'SERENA', 
      slogan: 'Regular para fluir',
      cor: 'serena',
      logo: '/logos/serena_logo.png',
      disponivel: false 
    },
    { 
      nome: 'IGNIS', 
      slogan: 'Agir com direcção',
      cor: 'ignis',
      logo: '/logos/ignis_logo.png',
      disponivel: false 
    },
    { 
      nome: 'VENTIS', 
      slogan: 'Ritmo sustentável',
      cor: 'ventis',
      logo: '/logos/ventis_logo.png',
      disponivel: false 
    },
    { 
      nome: 'ECOA', 
      slogan: 'A expressão que ressoa',
      cor: 'ecoa',
      logo: '/logos/ecoa_logo.png',
      disponivel: false 
    },
    { 
      nome: 'IMAGO', 
      slogan: 'O reflexo da essência',
      cor: 'imago',
      logo: '/logos/imago_logo.png',
      disponivel: false 
    }
  ]

  return (
    <div className="home">
      <header className="home-header">
        <img 
          src="/logos/seteecos_logo.png" 
          alt="Sete Ecos" 
          style={{ width: '100px', height: '100px', marginBottom: '1rem' }}
        />
        <h1 className="home-title">SETE ECOS</h1>
      <p className="home-subtitle">Sete caminhos. Uma travessia.</p>
     </header>

      <section className="home-section">
        <div className="lumina-card" onClick={() => navigate('/lumina')}>
          <div className="lumina-card-header">
            <img 
              src="/logos/lumina-eye.png" 
              alt="Lumina" 
              style={{ width: '60px', height: '60px' }}
            />
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
            <div 
              key={eco.nome} 
              className={`eco-card eco-card-${eco.cor} ${!eco.disponivel ? 'disabled' : ''}`}
              onClick={() => eco.disponivel && navigate(eco.rota)}
              style={{ cursor: eco.disponivel ? 'pointer' : 'not-allowed' }}
            >
              <img 
                src={eco.logo} 
                alt={eco.nome}
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  marginBottom: '1rem',
                  objectFit: 'contain'
                }}
              />
              <h4 className="eco-nome">{eco.nome}</h4>
              <p className="eco-slogan">{eco.slogan}</p>
              {!eco.disponivel && (
                <span className="eco-badge" style={{ background: '#94a3b8' }}>Em breve</span>
              )}
              {eco.disponivel && (
                <span className="eco-badge" style={{ background: '#10b981' }}>Disponível</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="aurora-card">
          <div className="aurora-card-glow"></div>
          <div className="aurora-card-content">
            <img 
              src="/logos/aurora_logo.png" 
              alt="Aurōra"
              style={{ 
                width: '100px', 
                height: '100px', 
                marginBottom: '1rem',
                objectFit: 'contain'
              }}
            />
            <h3 className="aurora-title">AURŌRA</h3>
            <p className="aurora-desc">A Coroação — Presença plena</p>
            <p className="aurora-info">
              O bónus de integração para quem completa os 7 Ecos. 
              Onde todas as partes se encontram e a mulher inteira nasce.
            </p>
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
