// src/pages/PlanoHTML.jsx
// Página do Plano optimizada para impressão/PDF - COM LOGO REAL

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

const FASES_CONFIG = {
  inducao: { nome: 'Fase 1: Indução', duracao: '3-4 semanas', descricao: 'A fase de arranque onde o corpo entra em modo de queima de gordura. Foco em proteína, gorduras saudáveis e vegetais.', priorizar: ['Proteína em todas as refeições', 'Vegetais em abundância', 'Gorduras saudáveis (azeite, abacate, nozes)', 'Água (mínimo 2L por dia)', 'Dormir 7-8 horas por noite'], evitar: ['Açúcar e adoçantes', 'Grãos e cereais (pão, massa, arroz)', 'Frutas doces (banana, manga, uvas)', 'Leguminosas', 'Álcool'], dicas: ['Prepara as refeições ao domingo', 'Tem snacks saudáveis à mão', 'Podes sentir "keto flu" — é normal', 'Pesa-te às sextas-feiras, em jejum'] },
  estabilizacao: { nome: 'Fase 2: Estabilização', duracao: '6-8 semanas', descricao: 'Reintrodução gradual de hidratos complexos enquanto mantemos os resultados.', priorizar: ['Manter proteína elevada', 'Hidratos complexos (batata-doce, arroz integral)', 'Fruta de baixo índice glicémico', 'Leguminosas em moderação'], evitar: ['Açúcar refinado', 'Farinhas brancas', 'Alimentos processados', 'Bebidas açucaradas'], dicas: ['Introduz um alimento de cada vez', 'Observa como o corpo reage', 'Mantém o diário alimentar'] },
  reeducacao: { nome: 'Fase 3: Reeducação', duracao: '6-8 semanas', descricao: 'Aprender a comer de forma equilibrada e intuitiva para a vida.', priorizar: ['Equilíbrio em todas as refeições', 'Variedade alimentar', 'Comer com atenção plena', 'Flexibilidade saudável'], evitar: ['Restrições extremas', 'Mentalidade de dieta', 'Comer emocional'], dicas: ['Pratica a escuta do corpo', 'Permite-te flexibilidade', 'Foca em como te sentes'] },
  manutencao: { nome: 'Fase 4: Manutenção', duracao: 'Contínua', descricao: 'Manter os resultados com um estilo de vida equilibrado.', priorizar: ['Consistência', 'Movimento regular', 'Sono de qualidade', 'Gestão do stress'], evitar: ['Voltar aos velhos hábitos', 'Ignorar sinais do corpo', 'Perder a rotina'], dicas: ['Pesagem semanal', 'Ajusta conforme necessário', 'Celebra as vitórias'] }
};

// Caminho do logo V3
const LOGO_PATH = '/logos/VITALIS_LOGO_V3.png';

export default function PlanoHTML() {
  const [searchParams] = useSearchParams();
  const planoId = searchParams.get('id');
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (planoId) carregarDados();
  }, [planoId]);

  const carregarDados = async () => {
    try {
      // Try vitalis_plano view first, fallback to vitalis_meal_plans
      let plano = null;
      const { data: planoView } = await supabase.from('vitalis_plano').select('*').eq('id', planoId).maybeSingle();
      plano = planoView;

      if (!plano) {
        const { data: mealPlan } = await supabase.from('vitalis_meal_plans').select('*').eq('id', planoId).maybeSingle();
        if (mealPlan) plano = { ...mealPlan, calorias_diarias: mealPlan.calorias_alvo };
      }

      const clientQuery = plano?.client_id
        ? supabase.from('vitalis_clients').select('*').eq('id', plano.client_id).maybeSingle()
        : plano?.user_id
          ? supabase.from('vitalis_clients').select('*').eq('user_id', plano.user_id).maybeSingle()
          : { data: null };
      const { data: cliente } = await clientQuery;
      const userIdForIntake = cliente?.user_id || plano?.user_id;
      const { data: intake } = userIdForIntake
        ? await supabase.from('vitalis_intake').select('nome').eq('user_id', userIdForIntake).order('created_at', { ascending: false }).limit(1).maybeSingle()
        : { data: null };
      
      setDados({
        nome: intake?.nome || 'Cliente',
        peso_actual: plano?.peso_actual || 70,
        peso_meta: plano?.peso_meta || 60,
        fase: plano?.fase || 'inducao',
        calorias: plano?.calorias_diarias || 1500,
        proteina_g: plano?.proteina_g || 120,
        carboidratos_g: plano?.carboidratos_g || 100,
        gordura_g: plano?.gordura_g || 60,
        porcoes_proteina: plano?.porcoes_proteina || 6,
        porcoes_hidratos: plano?.porcoes_hidratos || 4,
        porcoes_gordura: plano?.porcoes_gordura || 8,
        tamanho_palma: plano?.tamanho_palma_g || 20,
        tamanho_mao: plano?.tamanho_mao_g || 25,
        tamanho_polegar: plano?.tamanho_polegar_g || 7,
        data_inicio: plano?.data_inicio_fase || new Date().toISOString(),
        abordagem: plano?.abordagem || 'equilibrado'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dados && !loading) {
      setTimeout(() => { window.print(); }, 500);
    }
  }, [dados, loading]);

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#FAF7F2'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:'60px',height:'60px',border:'4px solid #f3f3f3',borderTop:'4px solid #7C8B6F',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto'}}></div>
        <p style={{marginTop:'20px',color:'#6B5C4C'}}>A preparar o teu plano...</p>
        <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
  
  if (!dados) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#FAF7F2'}}>
      <div style={{textAlign:'center',color:'#C62828'}}>
        <p>Plano não encontrado</p>
        <button onClick={() => window.close()} style={{marginTop:'20px',padding:'10px 30px',background:'#7C8B6F',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>Fechar</button>
      </div>
    </div>
  );

  const faseConfig = FASES_CONFIG[dados.fase] || FASES_CONFIG.inducao;
  const formatarData = (d) => d ? new Date(d).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  // Componente do Logo
  const Logo = ({ size = 80 }) => (
    <img src={LOGO_PATH} alt="Vitalis" style={{width:`${size}px`,height:`${size}px`,objectFit:'contain'}} />
  );

  // Header padrão para páginas internas
  const PageHeader = () => (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #C5D1BC',paddingBottom:'12px',marginBottom:'25px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
        <Logo size={40} />
        <span style={{fontWeight:'600',fontSize:'18px',color:'#7C8B6F',letterSpacing:'3px'}}>VITALIS</span>
      </div>
      <div style={{fontSize:'13px',color:'#6B5C4C',fontWeight:'500'}}>{faseConfig.nome}</div>
    </div>
  );

  // Footer padrão
  const PageFooter = ({ page }) => (
    <div style={{position:'absolute',bottom:'20px',left:'45px',right:'45px',display:'flex',justifyContent:'space-between',fontSize:'9px',color:'#6B5C4C',borderTop:'1px solid #C5D1BC',paddingTop:'10px'}}>
      <span>Documento exclusivo de {dados.nome}</span>
      <span>Página {page} de 10</span>
    </div>
  );

  return (
    <>
      <style>{`
        @page { size: A4; margin: 0; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #FAF7F2; color: #4A4035; }
        .page { width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background: #FAF7F2; position: relative; overflow: hidden; }
        @media screen {
          .page { margin: 20px auto; box-shadow: 0 5px 30px rgba(0,0,0,0.15); }
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .page {
            page-break-after: always !important;
            page-break-inside: avoid !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          .page:last-child { page-break-after: auto !important; }
        }
      `}</style>

      {/* Botão flutuante */}
      <div className="no-print" style={{position:'fixed',bottom:'30px',right:'30px',zIndex:1000,display:'flex',gap:'10px'}}>
        <button onClick={() => window.print()} style={{padding:'15px 30px',background:'linear-gradient(135deg, #7C8B6F, #6B5C4C)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'600',cursor:'pointer',boxShadow:'0 5px 20px rgba(193,99,74,0.4)',display:'flex',alignItems:'center',gap:'10px'}}>
          🖨️ Imprimir / Guardar PDF
        </button>
        <button onClick={() => window.close()} style={{padding:'15px 20px',background:'#666',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',cursor:'pointer'}}>
          ✕
        </button>
      </div>

      {/* PÁGINA 1 - CAPA */}
      <div className="page" style={{display:'flex',flexDirection:'column'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'50px'}}>
          <Logo size={140} />
          <div style={{fontSize:'14px',color:'#6B5C4C',letterSpacing:'6px',marginTop:'15px'}}>A RAIZ DA TRANSFORMAÇÃO</div>
          <div style={{width:'120px',height:'2px',background:'linear-gradient(90deg, transparent, #7C8B6F, transparent)',margin:'50px 0'}}></div>
          <div style={{fontSize:'38px',fontWeight:'600',color:'#4A4035',letterSpacing:'4px'}}>Guia Personalizado</div>
          <div style={{fontSize:'18px',color:'#7C8B6F',fontWeight:'500',letterSpacing:'6px',marginTop:'12px',marginBottom:'55px'}}>PLANO ALIMENTAR</div>
          
          <div style={{background:'white',border:'2px solid #C5D1BC',borderRadius:'28px',padding:'45px 90px',textAlign:'center',boxShadow:'0 18px 55px rgba(0,0,0,0.08)'}}>
            <div style={{fontSize:'11px',color:'#6B5C4C',letterSpacing:'4px',marginBottom:'12px'}}>PREPARADO EXCLUSIVAMENTE PARA</div>
            <div style={{fontSize:'40px',fontWeight:'600',color:'#4A4035',marginBottom:'30px'}}>{dados.nome}</div>
            <div style={{display:'flex',gap:'40px',justifyContent:'center',alignItems:'center',marginBottom:'25px'}}>
              <div style={{textAlign:'center'}}><div style={{fontSize:'10px',color:'#6B5C4C',letterSpacing:'2px',marginBottom:'6px'}}>PESO ACTUAL</div><div style={{fontSize:'36px',color:'#6B7A5D',fontWeight:'700'}}>{dados.peso_actual} kg</div></div>
              <div style={{color:'#6B8E23',fontSize:'40px'}}>→</div>
              <div style={{textAlign:'center'}}><div style={{fontSize:'10px',color:'#6B5C4C',letterSpacing:'2px',marginBottom:'6px'}}>META</div><div style={{fontSize:'36px',color:'#6B7A5D',fontWeight:'700'}}>{dados.peso_meta} kg</div></div>
            </div>
            <div style={{fontSize:'14px',color:'#6B5C4C'}}>Início: {formatarData(dados.data_inicio)}</div>
          </div>
        </div>
        <div style={{background:'#4A4035',padding:'28px 55px',display:'flex',justifyContent:'space-between'}}>
          <div style={{color:'rgba(255,255,255,0.95)',fontSize:'12px'}}><div style={{fontWeight:'600',marginBottom:'3px'}}>Vivianne Saraiva</div><div style={{opacity:0.85}}>Precision Nutrition Level 1 Coach</div></div>
          <div style={{color:'rgba(255,255,255,0.95)',fontSize:'12px',textAlign:'right'}}><div style={{marginBottom:'3px'}}>vivianne.saraiva@outlook.com</div><div style={{opacity:0.85}}>WhatsApp: +258 84 524 3875</div></div>
        </div>
      </div>

      {/* PÁGINA 2 - BEM-VINDA */}
      <div className="page" style={{padding:'45px'}}>
        <PageHeader />
        <div style={{fontSize:'24px',fontWeight:'600',color:'#4A4035',marginBottom:'20px'}}>👋 Boas-vindas à Tua Jornada</div>
        <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'25px',marginBottom:'18px'}}><p style={{fontSize:'15px',lineHeight:'2'}}><strong>{dados.nome}</strong>, este guia foi criado especialmente para ti, com base nas tuas respostas, objectivos e estilo de vida. Cada porção, cada recomendação, foi calculada para o teu corpo e para onde queres chegar.</p></div>
        <div style={{fontSize:'24px',fontWeight:'600',color:'#4A4035',marginBottom:'20px',marginTop:'30px'}}>🔥 {faseConfig.nome}</div>
        <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'25px',marginBottom:'18px'}}><span style={{display:'inline-block',padding:'8px 20px',background:'#F5F0E8',borderRadius:'20px',fontSize:'12px',marginBottom:'15px'}}>Duração: {faseConfig.duracao}</span><p style={{fontSize:'15px',lineHeight:'1.9'}}>{faseConfig.descricao}</p></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginTop:'28px'}}>
          <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'25px'}}><div style={{fontSize:'11px',color:'#7C8B6F',letterSpacing:'2px',marginBottom:'12px'}}>ABORDAGEM NUTRICIONAL</div><div style={{fontSize:'26px',fontWeight:'600',color:'#6B7A5D',textTransform:'capitalize'}}>{dados.abordagem?.replace('_', ' ')}</div></div>
          <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'25px'}}><div style={{fontSize:'11px',color:'#7C8B6F',letterSpacing:'2px',marginBottom:'12px'}}>META SEMANAL</div><div style={{fontSize:'26px',fontWeight:'600',color:'#6B8E23'}}>-0.5 a -1.0 kg</div></div>
        </div>
        <PageFooter page={2} />
      </div>

      {/* PÁGINA 3 - PORÇÕES */}
      <div className="page" style={{padding:'45px'}}>
        <PageHeader />
        <div style={{fontSize:'24px',fontWeight:'600',color:'#4A4035',marginBottom:'8px'}}>🤚 A Tua Mão É a Tua Medida</div>
        <p style={{fontSize:'14px',color:'#6B5C4C',marginBottom:'22px'}}>Sem balança, sem stress. Proporcional ao TEU corpo — mãos maiores = corpo maior = porções maiores.</p>

        {/* Banner do método */}
        <div style={{background:'linear-gradient(135deg, #7C8B6F, #5A6B4D)',borderRadius:'16px',padding:'18px 24px',marginBottom:'22px',display:'flex',justifyContent:'space-around',alignItems:'center'}}>
          <div style={{textAlign:'center',color:'white'}}><div style={{fontSize:'28px'}}>🫲</div><div style={{fontSize:'10px',fontWeight:'700',letterSpacing:'1px',marginTop:'2px'}}>PALMA</div><div style={{fontSize:'9px',opacity:0.8}}>Proteína</div></div>
          <div style={{textAlign:'center',color:'white'}}><div style={{fontSize:'28px'}}>✊</div><div style={{fontSize:'10px',fontWeight:'700',letterSpacing:'1px',marginTop:'2px'}}>PUNHO</div><div style={{fontSize:'9px',opacity:0.8}}>Legumes</div></div>
          <div style={{textAlign:'center',color:'white'}}><div style={{fontSize:'28px'}}>🤲</div><div style={{fontSize:'10px',fontWeight:'700',letterSpacing:'1px',marginTop:'2px'}}>MÃO CONCHA</div><div style={{fontSize:'9px',opacity:0.8}}>Hidratos</div></div>
          <div style={{textAlign:'center',color:'white'}}><div style={{fontSize:'28px'}}>👍</div><div style={{fontSize:'10px',fontWeight:'700',letterSpacing:'1px',marginTop:'2px'}}>POLEGAR</div><div style={{fontSize:'9px',opacity:0.8}}>Gordura</div></div>
        </div>

        {/* Porções com gestos */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'14px',marginBottom:'18px'}}>
          <div style={{background:'linear-gradient(135deg, #FFEBEE, #FFCDD2)',border:'3px solid #E57373',borderRadius:'18px',padding:'22px 16px',textAlign:'center'}}><div style={{fontSize:'32px',marginBottom:'6px'}}>🫲</div><div style={{fontSize:'14px',fontWeight:'600',color:'#C62828',marginBottom:'6px'}}>Proteína</div><div style={{fontSize:'48px',fontWeight:'700',color:'#C62828',lineHeight:1}}>{dados.porcoes_proteina}</div><div style={{fontSize:'12px',color:'#6B5C4C',marginTop:'8px'}}>palmas/dia</div></div>
          <div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',border:'3px solid #64B5F6',borderRadius:'18px',padding:'22px 16px',textAlign:'center'}}><div style={{fontSize:'32px',marginBottom:'6px'}}>🤲</div><div style={{fontSize:'14px',fontWeight:'600',color:'#1565C0',marginBottom:'6px'}}>Hidratos</div><div style={{fontSize:'48px',fontWeight:'700',color:'#1565C0',lineHeight:1}}>{dados.porcoes_hidratos}</div><div style={{fontSize:'12px',color:'#6B5C4C',marginTop:'8px'}}>mãos/dia</div></div>
          <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'3px solid #FFD54F',borderRadius:'18px',padding:'22px 16px',textAlign:'center'}}><div style={{fontSize:'32px',marginBottom:'6px'}}>👍</div><div style={{fontSize:'14px',fontWeight:'600',color:'#F57F17',marginBottom:'6px'}}>Gordura</div><div style={{fontSize:'48px',fontWeight:'700',color:'#F57F17',lineHeight:1}}>{dados.porcoes_gordura}</div><div style={{fontSize:'12px',color:'#6B5C4C',marginTop:'8px'}}>polegares/dia</div></div>
        </div>
        <div style={{background:'linear-gradient(135deg, #E8F5E9, #C8E6C9)',border:'3px solid #81C784',borderRadius:'18px',padding:'20px',textAlign:'center',marginBottom:'22px'}}><div style={{fontSize:'28px',marginBottom:'4px'}}>✊</div><div style={{fontSize:'14px',fontWeight:'600',color:'#2E7D32',marginBottom:'6px'}}>Vegetais & Legumes</div><div style={{fontSize:'38px',fontWeight:'700',color:'#2E7D32'}}>À VONTADE</div><div style={{fontSize:'12px',color:'#2E7D32',marginTop:'6px'}}>Quanto mais cores, melhor!</div></div>

        {/* Macros */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'12px'}}>
          <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'12px',textAlign:'center',padding:'14px'}}><div style={{fontSize:'20px',marginBottom:'6px'}}>🔥</div><div style={{fontSize:'24px',fontWeight:'700',color:'#7C8B6F'}}>{dados.calorias}</div><div style={{fontSize:'11px',color:'#6B5C4C',marginTop:'4px'}}>Calorias</div></div>
          <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'12px',textAlign:'center',padding:'14px'}}><div style={{fontSize:'20px',marginBottom:'6px'}}>🥩</div><div style={{fontSize:'24px',fontWeight:'700',color:'#C62828'}}>{dados.proteina_g}g</div><div style={{fontSize:'11px',color:'#6B5C4C',marginTop:'4px'}}>Proteína</div></div>
          <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'12px',textAlign:'center',padding:'14px'}}><div style={{fontSize:'20px',marginBottom:'6px'}}>🍚</div><div style={{fontSize:'24px',fontWeight:'700',color:'#1565C0'}}>{dados.carboidratos_g}g</div><div style={{fontSize:'11px',color:'#6B5C4C',marginTop:'4px'}}>Hidratos</div></div>
          <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'12px',textAlign:'center',padding:'14px'}}><div style={{fontSize:'20px',marginBottom:'6px'}}>🥑</div><div style={{fontSize:'24px',fontWeight:'700',color:'#F57F17'}}>{dados.gordura_g}g</div><div style={{fontSize:'11px',color:'#6B5C4C',marginTop:'4px'}}>Gordura</div></div>
        </div>
        <PageFooter page={3} />
      </div>

      {/* PÁGINA 4 - MÉTODO DA MÃO COM EQUIVALÊNCIAS */}
      <div className="page" style={{padding:'45px'}}>
        <PageHeader />
        <div style={{fontSize:'24px',fontWeight:'600',color:'#4A4035',marginBottom:'8px'}}>🫲 Guia Prático: Quanto É 1 Porção?</div>
        <p style={{fontSize:'13px',color:'#6B5C4C',marginBottom:'20px',textAlign:'center',fontStyle:'italic'}}>Cada pessoa tem mãos diferentes — por isso a medida é sempre proporcional ao teu corpo.</p>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'18px'}}>
          {/* Proteína */}
          <div style={{background:'linear-gradient(135deg, #FFEBEE, #FFCDD2)',border:'3px solid #E57373',borderRadius:'18px',padding:'22px'}}>
            <div style={{fontWeight:'600',color:'#C62828',marginBottom:'8px',fontSize:'17px'}}>🫲 A Palma — PROTEÍNA</div>
            <div style={{color:'#C62828',fontWeight:'700',fontSize:'20px',marginBottom:'12px'}}>~{dados.tamanho_palma}g por palma</div>
            <div style={{fontSize:'13px',color:'#4A4035',lineHeight:'2'}}>
              🍗 Frango grelhado (1 palma)<br/>
              🐟 1 lata de atum = 1 palma<br/>
              🥩 Bife/Carne (1 palma)<br/>
              🥚 <strong>2-3 ovos = 1 palma</strong><br/>
              🦐 Camarão/Peixe (1 palma)<br/>
              🥛 Iogurte grego (170g) = ½ palma<br/>
              🧀 2 fatias de queijo = ½ palma<br/>
              🥤 Whey (1 scoop) = 1 palma
            </div>
          </div>

          {/* Hidratos */}
          <div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',border:'3px solid #64B5F6',borderRadius:'18px',padding:'22px'}}>
            <div style={{fontWeight:'600',color:'#1565C0',marginBottom:'8px',fontSize:'17px'}}>🤲 Mão Concha — HIDRATOS</div>
            <div style={{color:'#1565C0',fontWeight:'700',fontSize:'20px',marginBottom:'12px'}}>~{dados.tamanho_mao}g carbs por mão</div>
            <div style={{fontSize:'13px',color:'#4A4035',lineHeight:'2'}}>
              🍚 Arroz (1 mão em concha)<br/>
              🍝 Massa (1 mão em concha)<br/>
              🥔 Batata (1 punho)<br/>
              🍠 Batata doce (1 punho)<br/>
              🍞 Pão (1 fatia)<br/>
              🥣 Aveia (3 col. sopa)<br/>
              🍎 Fruta (1 peça média)<br/>
              🫚 Mandioca (1 punho)
            </div>
          </div>

          {/* Gordura */}
          <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'3px solid #FFD54F',borderRadius:'18px',padding:'22px'}}>
            <div style={{fontWeight:'600',color:'#F57F17',marginBottom:'8px',fontSize:'17px'}}>👍 O Polegar — GORDURA</div>
            <div style={{color:'#F57F17',fontWeight:'700',fontSize:'20px',marginBottom:'12px'}}>~{dados.tamanho_polegar}g por polegar</div>
            <div style={{fontSize:'13px',color:'#4A4035',lineHeight:'2'}}>
              🫒 Azeite (1 col. sopa)<br/>
              🥑 ¼ de abacate<br/>
              🥜 Amêndoas/Nozes (1 punhado)<br/>
              🧈 Manteiga (1 col. chá)<br/>
              🥜 Manteiga amendoim (1 col. sopa)<br/>
              🥥 Coco ralado (2 col. sopa)
            </div>
          </div>

          {/* Vegetais */}
          <div style={{background:'linear-gradient(135deg, #E8F5E9, #C8E6C9)',border:'3px solid #81C784',borderRadius:'18px',padding:'22px'}}>
            <div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'8px',fontSize:'17px'}}>✊ O Punho — LEGUMES</div>
            <div style={{color:'#2E7D32',fontWeight:'700',fontSize:'20px',marginBottom:'12px'}}>~100g por punho</div>
            <div style={{fontSize:'13px',color:'#4A4035',lineHeight:'2'}}>
              🥗 Salada mista (1 punho)<br/>
              🥦 Brócolos (1 punho)<br/>
              🥬 Espinafres/Couve (1 punho)<br/>
              🍅 Tomate (1 punho)<br/>
              🥕 Cenoura (1 punho)<br/>
              🍄 Cogumelos (1 punho)
            </div>
            <p style={{fontSize:'12px',color:'#2E7D32',fontWeight:'600',marginTop:'8px',fontStyle:'italic'}}>Legumes são livres — come à vontade!</p>
          </div>
        </div>
        <PageFooter page={4} />
      </div>

      {/* PÁGINA 5 - PROTEÍNAS */}
      <div className="page" style={{padding:'45px'}}>
        <PageHeader />
        <div style={{fontSize:'24px',fontWeight:'600',color:'#4A4035',marginBottom:'25px'}}>🥩 Proteínas Saudáveis</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
          <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'25px'}}><div style={{fontWeight:'600',color:'#7C8B6F',marginBottom:'18px',fontSize:'17px',borderBottom:'2px solid #C5D1BC',paddingBottom:'12px'}}>Carnes Vermelhas (magras)</div><p style={{fontSize:'15px',lineHeight:'2.3'}}>Bife de vaca • Carne moída magra • Lombo de porco • Cabrito • Borrego • Fígado</p></div>
          <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'25px'}}><div style={{fontWeight:'600',color:'#7C8B6F',marginBottom:'18px',fontSize:'17px',borderBottom:'2px solid #C5D1BC',paddingBottom:'12px'}}>Aves</div><p style={{fontSize:'15px',lineHeight:'2.3'}}>Peito de frango • Coxa de frango (sem pele) • Peru • Pato (sem pele) • Codorniz</p></div>
          <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'25px'}}><div style={{fontWeight:'600',color:'#7C8B6F',marginBottom:'18px',fontSize:'17px',borderBottom:'2px solid #C5D1BC',paddingBottom:'12px'}}>Peixes & Mariscos</div><p style={{fontSize:'15px',lineHeight:'2.3'}}>Salmão • Atum • Sardinha • Carapau • Pescada • Tilápia • Camarão • Lulas</p></div>
          <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'25px'}}><div style={{fontWeight:'600',color:'#7C8B6F',marginBottom:'18px',fontSize:'17px',borderBottom:'2px solid #C5D1BC',paddingBottom:'12px'}}>Ovos & Lacticínios</div><p style={{fontSize:'15px',lineHeight:'2.3'}}>Ovos inteiros • Queijo fresco • Iogurte grego natural • Requeijão • Queijo cottage</p></div>
        </div>
        <PageFooter page={5} />
      </div>

      {/* PÁGINA 6 - HIDRATOS E GORDURAS */}
      <div className="page" style={{padding:'45px'}}>
        <PageHeader />
        <div style={{fontSize:'24px',fontWeight:'600',color:'#4A4035',marginBottom:'25px'}}>🍚 Hidratos Saudáveis & 🥑 Gorduras</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'22px'}}>
          <div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',border:'2px solid #64B5F6',borderRadius:'16px',padding:'25px'}}><div style={{fontWeight:'600',color:'#1565C0',marginBottom:'15px',fontSize:'16px'}}>Tubérculos & Grãos</div><p style={{fontSize:'14px',lineHeight:'2'}}>Batata-doce • Mandioca • Inhame • Arroz integral • Quinoa • Aveia</p></div>
          <div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',border:'2px solid #64B5F6',borderRadius:'16px',padding:'25px'}}><div style={{fontWeight:'600',color:'#1565C0',marginBottom:'15px',fontSize:'16px'}}>Frutas (baixo IG)</div><p style={{fontSize:'14px',lineHeight:'2'}}>Frutos vermelhos • Maçã verde • Pera • Laranja • Toranja • Kiwi</p></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'22px'}}>
          <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'2px solid #FFD54F',borderRadius:'16px',padding:'25px'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'15px',fontSize:'16px'}}>Óleos & Manteigas</div><p style={{fontSize:'14px',lineHeight:'2'}}>Azeite extra-virgem • Óleo de coco • Manteiga • Ghee</p></div>
          <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'2px solid #FFD54F',borderRadius:'16px',padding:'25px'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'15px',fontSize:'16px'}}>Frutos Secos & Sementes</div><p style={{fontSize:'14px',lineHeight:'2'}}>Amêndoas • Nozes • Cajus • Sementes de chia • Linhaça</p></div>
        </div>
        <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'2px solid #FFD54F',borderRadius:'16px',padding:'25px'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'15px',fontSize:'16px'}}>Outras Fontes de Gordura Saudável</div><p style={{fontSize:'14px',lineHeight:'2'}}>Abacate • Azeitonas • Coco • Chocolate negro (+70%) • Gema de ovo</p></div>
        <PageFooter page={6} />
      </div>

      {/* PÁGINA 7 - VEGETAIS */}
      <div className="page" style={{padding:'45px'}}>
        <PageHeader />
        <div style={{fontSize:'24px',fontWeight:'600',color:'#4A4035',marginBottom:'20px'}}>🥬 Vegetais — Come o Arco-Íris!</div>
        <p style={{fontSize:'14px',color:'#6B5C4C',marginBottom:'28px',textAlign:'center'}}>Cada cor representa diferentes nutrientes. Inclui pelo menos 3 cores por refeição!</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'18px',marginBottom:'18px'}}>
          <div style={{background:'linear-gradient(135deg, #F1F8E9, #DCEDC8)',border:'1px solid #C5D1BC',borderLeft:'7px solid #4CAF50',borderRadius:'14px',padding:'22px'}}><div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'14px',fontSize:'16px'}}>🟢 Verdes</div><p style={{fontSize:'14px',lineHeight:'1.9'}}>Espinafre, Couve, Brócolos, Alface, Rúcula, Pepino, Abobrinha</p></div>
          <div style={{background:'linear-gradient(135deg, #FFEBEE, #FFCDD2)',border:'1px solid #C5D1BC',borderLeft:'7px solid #F44336',borderRadius:'14px',padding:'22px'}}><div style={{fontWeight:'600',color:'#C62828',marginBottom:'14px',fontSize:'16px'}}>🔴 Vermelhos</div><p style={{fontSize:'14px',lineHeight:'1.9'}}>Tomate, Pimento vermelho, Beterraba, Rabanete</p></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'18px',marginBottom:'18px'}}>
          <div style={{background:'linear-gradient(135deg, #FFF3E0, #FFE0B2)',border:'1px solid #C5D1BC',borderLeft:'7px solid #FF9800',borderRadius:'14px',padding:'22px'}}><div style={{fontWeight:'600',color:'#E65100',marginBottom:'14px',fontSize:'16px'}}>🟠 Laranjas</div><p style={{fontSize:'14px',lineHeight:'1.9'}}>Cenoura, Abóbora, Pimento laranja</p></div>
          <div style={{background:'linear-gradient(135deg, #FAFAFA, #F5F5F5)',border:'1px solid #C5D1BC',borderLeft:'7px solid #9E9E9E',borderRadius:'14px',padding:'22px'}}><div style={{fontWeight:'600',color:'#616161',marginBottom:'14px',fontSize:'16px'}}>⚪ Brancos</div><p style={{fontSize:'14px',lineHeight:'1.9'}}>Couve-flor, Cogumelos, Alho, Cebola, Nabo</p></div>
        </div>
        <div style={{background:'linear-gradient(135deg, #F3E5F5, #E1BEE7)',border:'1px solid #C5D1BC',borderLeft:'7px solid #9C27B0',borderRadius:'14px',padding:'22px'}}><div style={{fontWeight:'600',color:'#6A1B9A',marginBottom:'14px',fontSize:'16px'}}>🟣 Roxos</div><p style={{fontSize:'14px',lineHeight:'1.9'}}>Beringela, Couve roxa, Cebola roxa</p></div>
        <PageFooter page={7} />
      </div>

      {/* PÁGINA 8 - LISTA DE COMPRAS */}
      <div className="page" style={{padding:'45px'}}>
        <PageHeader />
        <div style={{fontSize:'24px',fontWeight:'600',color:'#4A4035',marginBottom:'25px'}}>🛒 Lista de Compras Semanal</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
          <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'25px'}}><div style={{fontWeight:'600',color:'#C62828',marginBottom:'20px',fontSize:'17px',borderBottom:'2px solid #E57373',paddingBottom:'12px'}}>🥩 Proteínas</div><div style={{fontSize:'15px',lineHeight:'2.6'}}>☐ Peito de frango (1kg)<br/>☐ Ovos (2 dúzias)<br/>☐ Peixe fresco (500g)<br/>☐ Carne moída magra (500g)</div></div>
          <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'25px'}}><div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'20px',fontSize:'17px',borderBottom:'2px solid #81C784',paddingBottom:'12px'}}>🥬 Vegetais</div><div style={{fontSize:'15px',lineHeight:'2.6'}}>☐ Espinafre/Couve<br/>☐ Brócolos<br/>☐ Tomate<br/>☐ Pepino<br/>☐ Pimentos<br/>☐ Cebola e Alho</div></div>
          <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'25px'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'20px',fontSize:'17px',borderBottom:'2px solid #FFD54F',paddingBottom:'12px'}}>🥑 Gorduras</div><div style={{fontSize:'15px',lineHeight:'2.6'}}>☐ Azeite extra-virgem<br/>☐ Abacate (2-3)<br/>☐ Manteiga<br/>☐ Amêndoas/Nozes</div></div>
          <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'25px'}}><div style={{fontWeight:'600',color:'#6B5C4C',marginBottom:'20px',fontSize:'17px',borderBottom:'2px solid #C5D1BC',paddingBottom:'12px'}}>🧂 Outros</div><div style={{fontSize:'15px',lineHeight:'2.6'}}>☐ Sal e pimenta<br/>☐ Ervas frescas<br/>☐ Limões<br/>☐ Chá/Café</div></div>
        </div>
        <PageFooter page={8} />
      </div>

      {/* PÁGINA 9 - REGRAS */}
      <div className="page" style={{padding:'45px'}}>
        <PageHeader />
        <div style={{fontSize:'24px',fontWeight:'600',color:'#4A4035',marginBottom:'25px'}}>📋 Regras da {faseConfig.nome}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'22px'}}>
          <div style={{background:'linear-gradient(135deg, #E8F5E9, #C8E6C9)',border:'3px solid #81C784',borderRadius:'16px',padding:'30px'}}><div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'20px',fontSize:'17px'}}>✓ PRIORIZAR</div><div style={{fontSize:'14px',lineHeight:'2.3'}}>{faseConfig.priorizar.map((item, i) => <div key={i}>✓ {item}</div>)}</div></div>
          <div style={{background:'linear-gradient(135deg, #FFEBEE, #FFCDD2)',border:'3px solid #E57373',borderRadius:'16px',padding:'30px'}}><div style={{fontWeight:'600',color:'#C62828',marginBottom:'20px',fontSize:'17px'}}>✗ EVITAR</div><div style={{fontSize:'14px',lineHeight:'2.3'}}>{faseConfig.evitar.map((item, i) => <div key={i}>✗ {item}</div>)}</div></div>
        </div>
        <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'3px solid #FFD54F',borderRadius:'16px',padding:'30px'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'20px',fontSize:'17px'}}>💡 DICAS PARA O SUCESSO</div><div style={{fontSize:'14px',lineHeight:'2.3'}}>{faseConfig.dicas.map((item, i) => <div key={i}>• {item}</div>)}</div></div>
        <PageFooter page={9} />
      </div>

      {/* PÁGINA 10 - FINAL */}
      <div className="page" style={{display:'flex',flexDirection:'column'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'55px'}}>
          <Logo size={140} />
          <div style={{fontSize:'14px',color:'#6B5C4C',letterSpacing:'6px',marginTop:'15px',marginBottom:'65px'}}>A RAIZ DA TRANSFORMAÇÃO</div>
          <div style={{maxWidth:'450px',textAlign:'center',padding:'50px',background:'white',borderRadius:'28px',boxShadow:'0 18px 55px rgba(0,0,0,0.1)',marginBottom:'65px'}}><div style={{fontSize:'65px',color:'#C5D1BC',marginBottom:'18px',lineHeight:'0.5'}}>"</div><p style={{fontSize:'28px',color:'#4A4035',fontStyle:'italic',lineHeight:'1.7'}}>Quando o excesso cai, o corpo responde.</p></div>
          <div style={{textAlign:'center'}}><div style={{fontSize:'12px',color:'#6B5C4C',letterSpacing:'5px',marginBottom:'18px'}}>CRIADO EXCLUSIVAMENTE PARA</div><div style={{fontSize:'42px',fontWeight:'600',color:'#4A4035'}}>{dados.nome}</div></div>
        </div>
        <div style={{background:'#4A4035',padding:'28px 55px',display:'flex',justifyContent:'space-between'}}>
          <div style={{color:'rgba(255,255,255,0.95)',fontSize:'12px'}}><div style={{fontWeight:'600',marginBottom:'3px'}}>Vivianne Saraiva</div><div style={{opacity:0.85}}>Precision Nutrition Level 1 Coach</div></div>
          <div style={{color:'rgba(255,255,255,0.95)',fontSize:'12px',textAlign:'right'}}><div style={{marginBottom:'3px'}}>vivianne.saraiva@outlook.com</div><div style={{opacity:0.85}}>WhatsApp: +258 84 524 3875</div></div>
        </div>
      </div>
    </>
  );
}
