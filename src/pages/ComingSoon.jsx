import { useLocation, useNavigate, Navigate } from 'react-router-dom';

const ecosInfo = {
  serena: {
    nome: 'SERENA',
    slogan: 'Regular para fluir',
    descricao: 'Equilibra as emoções e encontra a serenidade no fluxo da vida.',
    cor: '#6B8E9B',
    foco: 'Emoção & Fluidez'
  },
  ignis: {
    nome: 'IGNIS',
    slogan: 'Agir com direcção',
    descricao: 'Acende o fogo interior. Encontra a vontade e o foco para transformar intenção em acção.',
    cor: '#C1634A',
    foco: 'Vontade & Foco'
  },
  ventis: {
    nome: 'VENTIS',
    slogan: 'Ritmo sustentável',
    descricao: 'Respira e encontra o ritmo. Energia e movimento em harmonia com o teu corpo.',
    cor: '#5D9B84',
    foco: 'Energia & Ritmo'
  },
  ecoa: {
    nome: 'ECOA',
    slogan: 'A expressão que ressoa',
    descricao: 'Encontra a tua voz autêntica. Expressa-te e faz ecoar a tua verdade interior.',
    cor: '#4A90A4',
    foco: 'Voz & Expressão'
  },
  imago: {
    nome: 'IMAGO',
    slogan: 'O reflexo da essência',
    descricao: 'O sétimo eco. Integra todos os aspectos e revela a imagem completa de quem és.',
    cor: '#8B7BA5',
    foco: 'Identidade & Essência'
  },
  aurora: {
    nome: 'AURORA',
    slogan: 'A coroação da jornada',
    descricao: 'O momento de integração final. Quando todos os ecos se encontram, nasce a Aurora.',
    cor: '#D4A5A5',
    foco: 'Integração Total'
  }
};

export default function ComingSoon() {
  const location = useLocation();
  const navigate = useNavigate();
  const eco = location.pathname.replace('/', '').toLowerCase();

  // ÁUREA já está disponível - redirecionar para landing
  if (eco === 'aurea') {
    return <Navigate to="/aurea" replace />;
  }

  const info = ecosInfo[eco] || ecosInfo.serena;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 text-center animate-page-enter" style={{ fontFamily: 'var(--font-corpo)' }}>
      {/* Background com gradient animado */}
      <div className="fixed inset-0 -z-10 hero-gradient-animated" style={{ background: `linear-gradient(135deg, ${info.cor}10 0%, #FAF6F0 25%, ${info.cor}08 50%, #FAF6F0 75%, ${info.cor}10 100%)` }}>
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${info.cor} 0%, transparent 70%)`, filter: 'blur(60px)' }} />
        <div className="absolute bottom-20 left-10 w-60 h-60 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${info.cor} 0%, transparent 70%)`, filter: 'blur(50px)' }} />
      </div>

      {/* Logo com glow */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full opacity-30 animate-pulse" style={{ background: `radial-gradient(circle, ${info.cor} 0%, transparent 70%)`, transform: 'scale(1.4)' }} />
        <div className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl" style={{ background: `linear-gradient(135deg, ${info.cor}60 0%, ${info.cor} 100%)`, boxShadow: `0 16px 48px ${info.cor}30` }}>
          <span className="text-white text-4xl font-bold" style={{ fontFamily: 'var(--font-titulos)', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            {info.nome[0]}
          </span>
        </div>
      </div>

      {/* Eco name */}
      <h1 className="text-4xl font-semibold mb-2" style={{ fontFamily: 'var(--font-titulos)', letterSpacing: '0.25em', color: info.cor }}>
        {info.nome}
      </h1>

      {/* Slogan */}
      <p className="text-lg text-[#6B5344]/80 mb-6" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
        {info.slogan}
      </p>

      {/* Description */}
      <p className="text-[#4A3728] max-w-sm leading-relaxed mb-3">
        {info.descricao}
      </p>

      {/* Focus area */}
      <p className="text-sm font-medium mb-8 tracking-wide" style={{ color: info.cor }}>
        {info.foco}
      </p>

      {/* Coming soon badge — glass */}
      <div className="backdrop-blur-sm rounded-full px-8 py-4 mb-10" style={{ background: `${info.cor}15`, border: `1.5px solid ${info.cor}30` }}>
        <p className="premium-label" style={{ color: info.cor, letterSpacing: '0.25em' }}>
          Em Breve
        </p>
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="px-7 py-3 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105"
        style={{ border: `1.5px solid ${info.cor}40`, color: info.cor, background: 'transparent' }}
        onMouseOver={(e) => { e.target.style.background = info.cor; e.target.style.color = 'white'; }}
        onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = info.cor; }}
      >
        Voltar ao Inicio
      </button>

      {/* Waitlist CTA — glass card */}
      <div className="mt-12 p-6 glass-card-light max-w-sm w-full">
        <p className="text-[#4A3728] text-sm mb-4 leading-relaxed">
          Queres ser notificada quando {info.nome} estiver disponivel?
        </p>
        <a
          href={`https://wa.me/258851006473?text=Olá! Quero ser notificada quando o eco ${info.nome} estiver disponível.`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Avisa-me!
        </a>
      </div>
    </div>
  );
}
