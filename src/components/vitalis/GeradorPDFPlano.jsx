// ============================================================
// VITALIS - GERADOR DE PDF DO PLANO ALIMENTAR
// Versão FINAL - Qualidade Profissional
// ============================================================

import React, { useState, useEffect, useRef } from ‘react’;
import { supabase } from ‘../../lib/supabase.js’;

// Logo SVG do Vitalis
const VITALIS_LOGO_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"> <defs> <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%"> <stop offset="0%" style="stop-color:#C1634A"/> <stop offset="100%" style="stop-color:#8B4513"/> </linearGradient> </defs> <circle cx="50" cy="50" r="48" fill="url(#logoGrad)"/> <text x="50" y="68" text-anchor="middle" fill="white" font-family="Georgia, serif" font-size="52" font-weight="bold">V</text> </svg>`;

// Configuração das fases
const FASES_CONFIG = {
inducao: {
nome: ‘Fase 1: Indução’,
duracao: ‘3-4 semanas’,
descricao: ‘A fase de arranque onde o corpo entra em modo de queima de gordura. Foco em proteína, gorduras saudáveis e vegetais.’,
priorizar: [‘Proteína em todas as refeições’, ‘Vegetais em abundância’, ‘Gorduras saudáveis (azeite, abacate, nozes)’, ‘Água (mínimo 2L por dia)’, ‘Dormir 7-8 horas por noite’],
evitar: [‘Açúcar e adoçantes’, ‘Grãos e cereais (pão, massa, arroz)’, ‘Frutas doces (banana, manga, uvas)’, ‘Leguminosas’, ‘Álcool’],
dicas: [‘Prepara as refeições ao domingo para a semana’, ‘Tem sempre snacks saudáveis à mão’, ‘Nos primeiros dias podes sentir “keto flu” — é normal’, ‘Pesa-te apenas às sextas-feiras, de manhã, em jejum’]
},
estabilizacao: {
nome: ‘Fase 2: Estabilização’,
duracao: ‘6-8 semanas’,
descricao: ‘Reintrodução gradual de hidratos complexos enquanto mantemos os resultados alcançados.’,
priorizar: [‘Manter proteína elevada’, ‘Hidratos complexos (batata-doce, arroz integral)’, ‘Fruta de baixo índice glicémico’, ‘Leguminosas em moderação’],
evitar: [‘Açúcar refinado’, ‘Farinhas brancas’, ‘Alimentos processados’, ‘Bebidas açucaradas’],
dicas: [‘Introduz um novo alimento de cada vez’, ‘Observa como o corpo reage’, ‘Mantém o diário alimentar’]
},
reeducacao: {
nome: ‘Fase 3: Reeducação’,
duracao: ‘6-8 semanas’,
descricao: ‘Aprender a comer de forma equilibrada e intuitiva para a vida.’,
priorizar: [‘Equilíbrio em todas as refeições’, ‘Variedade alimentar’, ‘Comer com atenção plena’, ‘Flexibilidade saudável’],
evitar: [‘Restrições extremas’, ‘Mentalidade de dieta’, ‘Comer emocional’],
dicas: [‘Pratica a escuta do corpo’, ‘Permite-te flexibilidade’, ‘Foca em como te sentes, não só no peso’]
},
manutencao: {
nome: ‘Fase 4: Manutenção’,
duracao: ‘Contínua’,
descricao: ‘Manter os resultados alcançados com um estilo de vida equilibrado.’,
priorizar: [‘Consistência’, ‘Movimento regular’, ‘Sono de qualidade’, ‘Gestão do stress’],
evitar: [‘Voltar aos velhos hábitos’, ‘Ignorar sinais do corpo’, ‘Perder a rotina’],
dicas: [‘Pesagem semanal para monitorizar’, ‘Ajusta conforme necessário’, ‘Celebra as vitórias’]
}
};

export default function GeradorPDFPlano({ userId, onClose }) {
const [loading, setLoading] = useState(true);
const [gerando, setGerando] = useState(false);
const [dados, setDados] = useState(null);
const [erro, setErro] = useState(null);
const pdfRef = useRef(null);

useEffect(() => {
carregarDados();
}, [userId]);

const carregarDados = async () => {
try {
const { data: cliente } = await supabase
.from(‘vitalis_clients’)
.select(’*’)
.eq(‘user_id’, userId)
.single();

```
  const { data: plano } = await supabase
    .from('vitalis_plano')
    .select('*')
    .eq('client_id', cliente?.id)
    .single();

  const { data: intake } = await supabase
    .from('vitalis_intake')
    .select('nome, email')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  setDados({
    nome: intake?.nome || 'Cliente',
    peso_actual: plano?.peso_actual || plano?.peso_inicial,
    peso_meta: plano?.peso_meta,
    peso_inicial: plano?.peso_inicial,
    fase: plano?.fase || 'inducao',
    calorias: plano?.calorias_diarias,
    proteina_g: plano?.proteina_g,
    carboidratos_g: plano?.carboidratos_g,
    gordura_g: plano?.gordura_g,
    porcoes_proteina: plano?.porcoes_proteina,
    porcoes_hidratos: plano?.porcoes_hidratos,
    porcoes_gordura: plano?.porcoes_gordura,
    porcoes_legumes: plano?.porcoes_legumes,
    tamanho_palma: plano?.tamanho_palma_g || 20,
    tamanho_mao: plano?.tamanho_mao_g || 25,
    tamanho_polegar: plano?.tamanho_polegar_g || 7,
    data_inicio: plano?.data_inicio_fase || new Date().toISOString(),
    abordagem: plano?.abordagem || 'equilibrado'
  });
} catch (err) {
  console.error('Erro:', err);
  setErro('Erro ao carregar dados');
} finally {
  setLoading(false);
}
```

};

const formatarData = (d) => {
if (!d) return new Date().toLocaleDateString(‘pt-PT’, { day: ‘numeric’, month: ‘long’, year: ‘numeric’ });
return new Date(d).toLocaleDateString(‘pt-PT’, { day: ‘numeric’, month: ‘long’, year: ‘numeric’ });
};

const gerarPDF = async () => {
setGerando(true);
try {
const html2pdf = (await import(‘html2pdf.js’)).default;

```
  await html2pdf()
    .set({
      margin: 0,
      filename: `Vitalis_Plano_${dados.nome.replace(/\s+/g, '_')}_${dados.fase}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all', before: '.page-break' }
    })
    .from(pdfRef.current)
    .save();

  setTimeout(onClose, 500);
} catch (err) {
  console.error('Erro PDF:', err);
  setErro('Erro ao gerar PDF');
} finally {
  setGerando(false);
}
```

};

const faseConfig = FASES_CONFIG[dados?.fase] || FASES_CONFIG.inducao;

if (loading) {
return (
<div style={{position:‘fixed’,inset:0,background:‘rgba(0,0,0,0.5)’,display:‘flex’,alignItems:‘center’,justifyContent:‘center’,zIndex:9999}}>
<div style={{background:‘white’,borderRadius:‘16px’,padding:‘32px’,textAlign:‘center’}}>
<div style={{width:‘48px’,height:‘48px’,border:‘4px solid #f3f3f3’,borderTop:‘4px solid #C1634A’,borderRadius:‘50%’,animation:‘spin 1s linear infinite’,margin:‘0 auto’}}></div>
<p style={{marginTop:‘16px’,color:’#666’}}>A preparar…</p>
<style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
</div>
</div>
);
}

if (erro) {
return (
<div style={{position:‘fixed’,inset:0,background:‘rgba(0,0,0,0.5)’,display:‘flex’,alignItems:‘center’,justifyContent:‘center’,zIndex:9999}}>
<div style={{background:‘white’,borderRadius:‘16px’,padding:‘32px’,textAlign:‘center’}}>
<p style={{color:’#C62828’,marginBottom:‘16px’}}>{erro}</p>
<button onClick={onClose} style={{padding:‘8px 24px’,background:’#eee’,border:‘none’,borderRadius:‘8px’,cursor:‘pointer’}}>Fechar</button>
</div>
</div>
);
}

// CSS inline para o PDF
const cssStyles = `
@import url(‘https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap’);

```
.pdf-container * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.pdf-container {
  font-family: 'Montserrat', 'Segoe UI', sans-serif;
  line-height: 1.5;
  color: #333;
}

.page {
  width: 210mm;
  height: 297mm;
  background: #FDF8F3;
  position: relative;
  overflow: hidden;
}

.page-break {
  page-break-before: always;
}

.serif {
  font-family: 'Cormorant Garamond', Georgia, serif;
}

/* Cores */
.terracota { color: #C1634A; }
.terracota-dark { color: #A0422A; }
.castanho { color: #8B4513; }
.castanho-dark { color: #6B4423; }
.verde { color: #6B8E23; }
.verde-dark { color: #2E7D32; }

.bg-terracota { background: #C1634A; }
.bg-castanho-dark { background: #6B4423; }
.bg-creme { background: #FDF8F3; }
.bg-bege-light { background: #F5F0E8; }

/* Cards de porções */
.porcao-proteina { background: #FFEBEE; border: 2px solid #E57373; }
.porcao-proteina .valor { color: #C62828; }

.porcao-hidratos { background: #E3F2FD; border: 2px solid #64B5F6; }
.porcao-hidratos .valor { color: #1565C0; }

.porcao-gordura { background: #FFF8E1; border: 2px solid #FFD54F; }
.porcao-gordura .valor { color: #F57F17; }

.porcao-legumes { background: #E8F5E9; border: 2px solid #81C784; }
.porcao-legumes .valor { color: #2E7D32; }
```

`;

return (
<div style={{position:‘fixed’,inset:0,background:‘rgba(0,0,0,0.7)’,display:‘flex’,alignItems:‘center’,justifyContent:‘center’,zIndex:9999,overflow:‘auto’,padding:‘20px’}}>
<div style={{background:‘white’,borderRadius:‘16px’,maxWidth:‘900px’,width:‘100%’,maxHeight:‘95vh’,overflow:‘auto’}}>
{/* Header do Modal */}
<div style={{position:‘sticky’,top:0,background:‘white’,borderBottom:‘1px solid #eee’,padding:‘16px 24px’,display:‘flex’,justifyContent:‘space-between’,alignItems:‘center’,zIndex:10}}>
<div>
<h2 style={{fontSize:‘18px’,fontWeight:‘bold’,color:’#333’,margin:0}}>Gerar PDF do Plano</h2>
<p style={{fontSize:‘13px’,color:’#666’,margin:‘4px 0 0’}}>Pré-visualização do documento profissional</p>
</div>
<div style={{display:‘flex’,gap:‘12px’}}>
<button onClick={onClose} style={{padding:‘10px 20px’,background:’#f5f5f5’,border:‘none’,borderRadius:‘8px’,cursor:‘pointer’,fontSize:‘14px’}}>
Cancelar
</button>
<button
onClick={gerarPDF}
disabled={gerando}
style={{padding:‘10px 24px’,background:‘linear-gradient(135deg, #C1634A, #8B4513)’,color:‘white’,border:‘none’,borderRadius:‘8px’,cursor:‘pointer’,fontSize:‘14px’,fontWeight:‘600’,opacity:gerando?0.7:1}}
>
{gerando ? ‘⏳ A gerar…’ : ‘📥 Descarregar PDF’}
</button>
</div>
</div>

```
    {/* Preview do PDF */}
    <div style={{padding:'24px',background:'#2a2a2a'}}>
      <div style={{transform:'scale(0.45)',transformOrigin:'top center',width:'222%',marginLeft:'-61%'}}>
        <div ref={pdfRef} className="pdf-container">
          <style>{cssStyles}</style>
          
          {/* ==================== PÁGINA 1 - CAPA ==================== */}
          <div className="page" style={{background:'linear-gradient(180deg, #FDF8F3 0%, #F5F0E8 100%)',display:'flex',flexDirection:'column'}}>
            {/* Padrão decorativo */}
            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,opacity:0.03,backgroundImage:'radial-gradient(circle at 20% 30%, #C1634A 1px, transparent 1px), radial-gradient(circle at 80% 70%, #6B8E23 1px, transparent 1px)',backgroundSize:'50px 50px'}}></div>
            
            {/* Conteúdo da capa */}
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 40px',position:'relative',zIndex:1}}>
              {/* Logo */}
              <div style={{width:'100px',height:'100px',marginBottom:'20px'}} dangerouslySetInnerHTML={{__html: VITALIS_LOGO_SVG}}></div>
              
              <div className="serif" style={{fontSize:'42px',fontWeight:700,color:'#A0422A',letterSpacing:'10px'}}>VITALIS</div>
              <div style={{fontSize:'11px',color:'#8B4513',letterSpacing:'4px',textTransform:'uppercase',marginTop:'5px'}}>A Raiz da Transformação</div>
              
              <div style={{width:'100px',height:'2px',background:'linear-gradient(90deg, transparent, #C1634A, transparent)',margin:'40px 0'}}></div>
              
              <div className="serif" style={{fontSize:'32px',fontWeight:600,color:'#6B4423',marginBottom:'10px',letterSpacing:'3px'}}>Guia Personalizado</div>
              <div style={{fontSize:'16px',color:'#C1634A',fontWeight:500,letterSpacing:'4px',textTransform:'uppercase',marginBottom:'50px'}}>PLANO ALIMENTAR</div>
              
              {/* Box do cliente */}
              <div style={{background:'white',border:'2px solid #D2B48C',borderRadius:'24px',padding:'40px 70px',textAlign:'center',boxShadow:'0 15px 50px rgba(0,0,0,0.08)'}}>
                <div style={{fontSize:'10px',color:'#8B4513',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'10px'}}>PREPARADO EXCLUSIVAMENTE PARA</div>
                <div className="serif" style={{fontSize:'36px',fontWeight:600,color:'#6B4423',marginBottom:'25px'}}>{dados.nome}</div>
                
                <div style={{display:'flex',gap:'30px',justifyContent:'center',alignItems:'center',marginBottom:'20px'}}>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'9px',color:'#8B4513',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'5px'}}>PESO ACTUAL</div>
                    <div style={{fontSize:'28px',color:'#A0422A',fontWeight:700}}>{dados.peso_actual} kg</div>
                  </div>
                  <div style={{color:'#6B8E23',fontSize:'32px',fontWeight:300}}>→</div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'9px',color:'#8B4513',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'5px'}}>META</div>
                    <div style={{fontSize:'28px',color:'#A0422A',fontWeight:700}}>{dados.peso_meta} kg</div>
                  </div>
                </div>
                
                <div style={{fontSize:'12px',color:'#8B4513'}}>Início: {formatarData(dados.data_inicio)}</div>
              </div>
            </div>
            
            {/* Footer da capa */}
            <div style={{background:'#6B4423',padding:'25px 50px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{color:'rgba(255,255,255,0.95)',fontSize:'11px',lineHeight:1.7}}>
                <div style={{fontWeight:600}}>Vivianne Saraiva</div>
                <div style={{opacity:0.85}}>Precision Nutrition Level 1 Coach</div>
              </div>
              <div style={{color:'rgba(255,255,255,0.95)',fontSize:'11px',textAlign:'right',lineHeight:1.7}}>
                <div>vivianne.saraiva@outlook.com</div>
                <div style={{opacity:0.85}}>WhatsApp: +258 84 524 3875</div>
              </div>
            </div>
          </div>

          {/* ==================== PÁGINA 2 - BEM-VINDA & FASE ==================== */}
          <div className="page page-break" style={{padding:'50px 55px 80px',position:'relative'}}>
            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #D2B48C',paddingBottom:'18px',marginBottom:'40px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'36px',height:'36px'}} dangerouslySetInnerHTML={{__html: VITALIS_LOGO_SVG}}></div>
                <span style={{fontWeight:600,fontSize:'16px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span>
              </div>
              <div style={{fontSize:'13px',color:'#8B4513',fontWeight:500}}>{faseConfig.nome}</div>
            </div>
            
            {/* Bem-vinda */}
            <div className="serif" style={{fontSize:'28px',fontWeight:600,color:'#6B4423',marginBottom:'25px',display:'flex',alignItems:'center',gap:'15px'}}>
              <span style={{fontSize:'32px'}}>👋</span> Bem-vinda à Tua Jornada
            </div>
            
            <div style={{background:'linear-gradient(135deg, #FDF8F3, #F5F0E8)',borderRadius:'16px',padding:'30px',marginBottom:'40px',border:'1px solid #D2B48C'}}>
              <p style={{color:'#6B4423',fontSize:'15px',lineHeight:1.9}}>
                <strong>{dados.nome}</strong>, este guia foi criado especialmente para ti, com base nas tuas respostas, objectivos e estilo de vida. Cada porção, cada recomendação, foi calculada para o teu corpo e para onde queres chegar.
              </p>
            </div>
            
            {/* Fase */}
            <div className="serif" style={{fontSize:'28px',fontWeight:600,color:'#6B4423',marginBottom:'25px',display:'flex',alignItems:'center',gap:'15px'}}>
              <span style={{fontSize:'32px'}}>🔥</span> {faseConfig.nome}
            </div>
            
            <div style={{background:'white',borderRadius:'16px',padding:'30px',marginBottom:'35px',border:'1px solid #D2B48C',boxShadow:'0 4px 15px rgba(0,0,0,0.04)'}}>
              <div style={{display:'inline-block',padding:'6px 16px',background:'#F5F0E8',borderRadius:'25px',fontSize:'12px',color:'#8B4513',fontWeight:500,marginBottom:'18px'}}>
                Duração: {faseConfig.duracao}
              </div>
              <p style={{color:'#6B4423',fontSize:'15px',lineHeight:1.8}}>{faseConfig.descricao}</p>
            </div>
            
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'25px'}}>
              <div style={{background:'white',borderRadius:'16px',padding:'25px',border:'1px solid #D2B48C'}}>
                <div style={{fontSize:'10px',color:'#8B4513',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'12px',fontWeight:500}}>ABORDAGEM NUTRICIONAL</div>
                <div style={{fontSize:'22px',fontWeight:600,color:'#C1634A',textTransform:'capitalize'}}>{dados.abordagem?.replace('_', ' ')}</div>
              </div>
              <div style={{background:'white',borderRadius:'16px',padding:'25px',border:'1px solid #D2B48C'}}>
                <div style={{fontSize:'10px',color:'#8B4513',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'12px',fontWeight:500}}>META SEMANAL</div>
                <div style={{fontSize:'22px',fontWeight:600,color:'#6B8E23'}}>-0.5 a -1.0 kg/semana</div>
              </div>
            </div>
            
            {/* Footer da página */}
            <div style={{position:'absolute',bottom:'30px',left:'55px',right:'55px',display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'15px'}}>
              <span>Documento exclusivo de {dados.nome}</span>
              <span>Página 2 de 10</span>
            </div>
          </div>

          {/* ==================== PÁGINA 3 - PORÇÕES DIÁRIAS ==================== */}
          <div className="page page-break" style={{padding:'50px 55px 80px',position:'relative'}}>
            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #D2B48C',paddingBottom:'18px',marginBottom:'40px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'36px',height:'36px'}} dangerouslySetInnerHTML={{__html: VITALIS_LOGO_SVG}}></div>
                <span style={{fontWeight:600,fontSize:'16px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span>
              </div>
              <div style={{fontSize:'13px',color:'#8B4513',fontWeight:500}}>{faseConfig.nome}</div>
            </div>
            
            <div className="serif" style={{fontSize:'28px',fontWeight:600,color:'#6B4423',marginBottom:'20px',display:'flex',alignItems:'center',gap:'15px'}}>
              <span style={{fontSize:'32px'}}>🍽️</span> As Tuas Porções Diárias
            </div>
            
            <p style={{color:'#6B4423',fontSize:'15px',marginBottom:'35px'}}>
              Usa o Método da Mão para medir — simples, prático e sempre contigo.
            </p>
            
            {/* Cards de porções */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'25px',marginBottom:'35px'}}>
              {/* Proteína */}
              <div className="porcao-proteina" style={{borderRadius:'16px',padding:'30px',textAlign:'center'}}>
                <div style={{fontSize:'16px',fontWeight:600,color:'#C62828',marginBottom:'12px'}}>Proteína</div>
                <div className="valor" style={{fontSize:'56px',fontWeight:700,lineHeight:1}}>{dados.porcoes_proteina}</div>
                <div style={{fontSize:'14px',color:'#C62828',marginTop:'8px'}}>palmas/dia</div>
              </div>
              
              {/* Hidratos */}
              <div className="porcao-hidratos" style={{borderRadius:'16px',padding:'30px',textAlign:'center'}}>
                <div style={{fontSize:'16px',fontWeight:600,color:'#1565C0',marginBottom:'12px'}}>Hidratos</div>
                <div className="valor" style={{fontSize:'56px',fontWeight:700,lineHeight:1}}>{dados.porcoes_hidratos}</div>
                <div style={{fontSize:'14px',color:'#1565C0',marginTop:'8px'}}>mãos/dia</div>
              </div>
              
              {/* Gordura */}
              <div className="porcao-gordura" style={{borderRadius:'16px',padding:'30px',textAlign:'center'}}>
                <div style={{fontSize:'16px',fontWeight:600,color:'#F57F17',marginBottom:'12px'}}>Gordura</div>
                <div className="valor" style={{fontSize:'56px',fontWeight:700,lineHeight:1}}>{dados.porcoes_gordura}</div>
                <div style={{fontSize:'14px',color:'#F57F17',marginTop:'8px'}}>polegares/dia</div>
              </div>
            </div>
            
            {/* Vegetais */}
            <div className="porcao-legumes" style={{borderRadius:'16px',padding:'30px',textAlign:'center',marginBottom:'40px'}}>
              <div style={{fontSize:'16px',fontWeight:600,color:'#2E7D32',marginBottom:'8px'}}>🥬 Vegetais & Legumes</div>
              <div className="valor" style={{fontSize:'36px',fontWeight:700}}>À VONTADE</div>
              <div style={{fontSize:'13px',color:'#2E7D32',marginTop:'8px'}}>Não precisas medir — quanto mais cores, melhor!</div>
            </div>
            
            {/* Macros */}
            <div className="serif" style={{fontSize:'24px',fontWeight:600,color:'#6B4423',marginBottom:'25px',display:'flex',alignItems:'center',gap:'12px'}}>
              <span>📊</span> Os Teus Macros Diários
            </div>
            
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'20px'}}>
              <div style={{background:'white',borderRadius:'14px',padding:'25px',textAlign:'center',border:'1px solid #D2B48C'}}>
                <div style={{fontSize:'11px',color:'#8B4513',marginBottom:'8px'}}>🔥</div>
                <div style={{fontSize:'32px',fontWeight:700,color:'#C1634A'}}>{dados.calorias}</div>
                <div style={{fontSize:'12px',color:'#8B4513',marginTop:'5px'}}>Calorias</div>
              </div>
              <div style={{background:'white',borderRadius:'14px',padding:'25px',textAlign:'center',border:'1px solid #D2B48C'}}>
                <div style={{fontSize:'11px',color:'#8B4513',marginBottom:'8px'}}>🥩</div>
                <div style={{fontSize:'32px',fontWeight:700,color:'#C62828'}}>{dados.proteina_g}g</div>
                <div style={{fontSize:'12px',color:'#8B4513',marginTop:'5px'}}>Proteína</div>
              </div>
              <div style={{background:'white',borderRadius:'14px',padding:'25px',textAlign:'center',border:'1px solid #D2B48C'}}>
                <div style={{fontSize:'11px',color:'#8B4513',marginBottom:'8px'}}>🍚</div>
                <div style={{fontSize:'32px',fontWeight:700,color:'#1565C0'}}>{dados.carboidratos_g}g</div>
                <div style={{fontSize:'12px',color:'#8B4513',marginTop:'5px'}}>Hidratos</div>
              </div>
              <div style={{background:'white',borderRadius:'14px',padding:'25px',textAlign:'center',border:'1px solid #D2B48C'}}>
                <div style={{fontSize:'11px',color:'#8B4513',marginBottom:'8px'}}>🥑</div>
                <div style={{fontSize:'32px',fontWeight:700,color:'#F57F17'}}>{dados.gordura_g}g</div>
                <div style={{fontSize:'12px',color:'#8B4513',marginTop:'5px'}}>Gordura</div>
              </div>
            </div>
            
            {/* Footer */}
            <div style={{position:'absolute',bottom:'30px',left:'55px',right:'55px',display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'15px'}}>
              <span>Documento exclusivo de {dados.nome}</span>
              <span>Página 3 de 10</span>
            </div>
          </div>

          {/* ==================== PÁGINA 4 - MÉTODO DA MÃO ==================== */}
          <div className="page page-break" style={{padding:'50px 55px 80px',position:'relative'}}>
            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #D2B48C',paddingBottom:'18px',marginBottom:'40px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'36px',height:'36px'}} dangerouslySetInnerHTML={{__html: VITALIS_LOGO_SVG}}></div>
                <span style={{fontWeight:600,fontSize:'16px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span>
              </div>
            </div>
            
            <div className="serif" style={{fontSize:'28px',fontWeight:600,color:'#6B4423',marginBottom:'25px',display:'flex',alignItems:'center',gap:'15px'}}>
              <span style={{fontSize:'32px'}}>✋</span> O Método da Mão
            </div>
            
            <p style={{color:'#6B4423',fontSize:'15px',marginBottom:'40px',textAlign:'center',fontStyle:'italic'}}>
              A tua mão é proporcional ao teu corpo — mãos maiores = corpo maior = mais comida. Simples, prático e sempre contigo.
            </p>
            
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'30px'}}>
              {/* Palma */}
              <div className="porcao-proteina" style={{borderRadius:'16px',padding:'30px'}}>
                <div style={{fontWeight:600,color:'#C62828',marginBottom:'15px',fontSize:'18px'}}>🖐️ A Palma — PROTEÍNA</div>
                <div style={{color:'#C62828',fontWeight:600,fontSize:'20px',marginBottom:'15px'}}>~{dados.tamanho_palma}g de proteína</div>
                <p style={{fontSize:'14px',color:'#6B4423',marginBottom:'10px'}}>Tamanho e espessura da tua palma (sem dedos)</p>
                <p style={{fontSize:'13px',color:'#8B4513',fontStyle:'italic'}}>Ex: 1 bife, 1 peito de frango</p>
              </div>
              
              {/* Mão */}
              <div className="porcao-hidratos" style={{borderRadius:'16px',padding:'30px'}}>
                <div style={{fontWeight:600,color:'#1565C0',marginBottom:'15px',fontSize:'18px'}}>🤲 A Mão em Concha — HIDRATOS</div>
                <div style={{color:'#1565C0',fontWeight:600,fontSize:'20px',marginBottom:'15px'}}>~{dados.tamanho_mao}g de hidratos</div>
                <p style={{fontSize:'14px',color:'#6B4423',marginBottom:'10px'}}>O que cabe na tua mão em concha</p>
                <p style={{fontSize:'13px',color:'#8B4513',fontStyle:'italic'}}>Ex: punhado de arroz, batata-doce</p>
              </div>
              
              {/* Polegar */}
              <div className="porcao-gordura" style={{borderRadius:'16px',padding:'30px'}}>
                <div style={{fontWeight:600,color:'#F57F17',marginBottom:'15px',fontSize:'18px'}}>👍 O Polegar — GORDURA</div>
                <div style={{color:'#F57F17',fontWeight:600,fontSize:'20px',marginBottom:'15px'}}>~{dados.tamanho_polegar}g de gordura</div>
                <p style={{fontSize:'14px',color:'#6B4423',marginBottom:'10px'}}>Tamanho do teu polegar inteiro</p>
                <p style={{fontSize:'13px',color:'#8B4513',fontStyle:'italic'}}>Ex: 1 colher azeite, nozes</p>
              </div>
              
              {/* Punho */}
              <div className="porcao-legumes" style={{borderRadius:'16px',padding:'30px'}}>
                <div style={{fontWeight:600,color:'#2E7D32',marginBottom:'15px',fontSize:'18px'}}>✊ O Punho — VEGETAIS</div>
                <div style={{color:'#2E7D32',fontWeight:600,fontSize:'20px',marginBottom:'15px'}}>~100g de vegetais</div>
                <p style={{fontSize:'14px',color:'#6B4423',marginBottom:'10px'}}>Tamanho do teu punho fechado</p>
                <p style={{fontSize:'13px',color:'#2E7D32',fontWeight:600}}>Mas lembra-te: À VONTADE!</p>
              </div>
            </div>
            
            {/* Footer */}
            <div style={{position:'absolute',bottom:'30px',left:'55px',right:'55px',display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'15px'}}>
              <span>Documento exclusivo de {dados.nome}</span>
              <span>Página 4 de 10</span>
            </div>
          </div>

          {/* ==================== PÁGINA 5 - PROTEÍNAS ==================== */}
          <div className="page page-break" style={{padding:'50px 55px 80px',position:'relative'}}>
            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #D2B48C',paddingBottom:'18px',marginBottom:'40px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'36px',height:'36px'}} dangerouslySetInnerHTML={{__html: VITALIS_LOGO_SVG}}></div>
                <span style={{fontWeight:600,fontSize:'16px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span>
              </div>
            </div>
            
            <div className="serif" style={{fontSize:'28px',fontWeight:600,color:'#6B4423',marginBottom:'35px',display:'flex',alignItems:'center',gap:'15px'}}>
              <span style={{fontSize:'32px'}}>🥩</span> Proteínas Saudáveis
            </div>
            
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'25px'}}>
              <div style={{background:'white',borderRadius:'16px',padding:'30px',border:'1px solid #D2B48C'}}>
                <div style={{fontWeight:600,color:'#C62828',marginBottom:'18px',fontSize:'17px'}}>Carnes Vermelhas (magras)</div>
                <p style={{fontSize:'14px',color:'#6B4423',lineHeight:2}}>Bife de vaca • Carne moída magra • Lombo de porco • Cabrito • Borrego • Fígado</p>
              </div>
              <div style={{background:'white',borderRadius:'16px',padding:'30px',border:'1px solid #D2B48C'}}>
                <div style={{fontWeight:600,color:'#C62828',marginBottom:'18px',fontSize:'17px'}}>Aves</div>
                <p style={{fontSize:'14px',color:'#6B4423',lineHeight:2}}>Peito de frango • Coxa de frango (sem pele) • Peru • Pato (sem pele) • Codorniz</p>
              </div>
              <div style={{background:'white',borderRadius:'16px',padding:'30px',border:'1px solid #D2B48C'}}>
                <div style={{fontWeight:600,color:'#C62828',marginBottom:'18px',fontSize:'17px'}}>Peixes & Mariscos</div>
                <p style={{fontSize:'14px',color:'#6B4423',lineHeight:2}}>Salmão • Atum • Sardinha • Carapau • Pescada • Tilápia • Camarão • Lulas</p>
              </div>
              <div style={{background:'white',borderRadius:'16px',padding:'30px',border:'1px solid #D2B48C'}}>
                <div style={{fontWeight:600,color:'#C62828',marginBottom:'18px',fontSize:'17px'}}>Ovos & Lacticínios</div>
                <p style={{fontSize:'14px',color:'#6B4423',lineHeight:2}}>Ovos inteiros • Queijo fresco • Iogurte grego natural • Requeijão</p>
              </div>
            </div>
            
            {/* Footer */}
            <div style={{position:'absolute',bottom:'30px',left:'55px',right:'55px',display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'15px'}}>
              <span>Documento exclusivo de {dados.nome}</span>
              <span>Página 5 de 10</span>
            </div>
          </div>

          {/* ==================== PÁGINA 6 - HIDRATOS E GORDURAS ==================== */}
          <div className="page page-break" style={{padding:'50px 55px 80px',position:'relative'}}>
            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #D2B48C',paddingBottom:'18px',marginBottom:'40px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'36px',height:'36px'}} dangerouslySetInnerHTML={{__html: VITALIS_LOGO_SVG}}></div>
                <span style={{fontWeight:600,fontSize:'16px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span>
              </div>
            </div>
            
            <div className="serif" style={{fontSize:'28px',fontWeight:600,color:'#6B4423',marginBottom:'35px',display:'flex',alignItems:'center',gap:'15px'}}>
              <span style={{fontSize:'28px'}}>🍚</span> Hidratos Saudáveis & <span style={{fontSize:'28px'}}>🥑</span> Gorduras
            </div>
            
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'25px',marginBottom:'25px'}}>
              <div className="porcao-hidratos" style={{borderRadius:'16px',padding:'28px'}}>
                <div style={{fontWeight:600,color:'#1565C0',marginBottom:'15px',fontSize:'17px'}}>Tubérculos & Grãos</div>
                <p style={{fontSize:'14px',color:'#6B4423',lineHeight:2}}>Batata-doce • Mandioca • Inhame • Arroz integral • Quinoa • Aveia</p>
              </div>
              <div className="porcao-hidratos" style={{borderRadius:'16px',padding:'28px'}}>
                <div style={{fontWeight:600,color:'#1565C0',marginBottom:'15px',fontSize:'17px'}}>Frutas (baixo IG)</div>
                <p style={{fontSize:'14px',color:'#6B4423',lineHeight:2}}>Frutos vermelhos • Maçã verde • Pera • Laranja • Toranja • Kiwi</p>
              </div>
            </div>
            
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'25px',marginBottom:'25px'}}>
              <div className="porcao-gordura" style={{borderRadius:'16px',padding:'28px'}}>
                <div style={{fontWeight:600,color:'#F57F17',marginBottom:'15px',fontSize:'17px'}}>Óleos & Manteigas</div>
                <p style={{fontSize:'14px',color:'#6B4423',lineHeight:2}}>Azeite extra-virgem • Óleo de coco • Manteiga • Ghee</p>
              </div>
              <div className="porcao-gordura" style={{borderRadius:'16px',padding:'28px'}}>
                <div style={{fontWeight:600,color:'#F57F17',marginBottom:'15px',fontSize:'17px'}}>Frutos Secos & Sementes</div>
                <p style={{fontSize:'14px',color:'#6B4423',lineHeight:2}}>Amêndoas • Nozes • Cajus • Sementes de chia • Sementes de linhaça</p>
              </div>
            </div>
            
            <div className="porcao-gordura" style={{borderRadius:'16px',padding:'28px'}}>
              <div style={{fontWeight:600,color:'#F57F17',marginBottom:'15px',fontSize:'17px'}}>Outras Fontes de Gordura</div>
              <p style={{fontSize:'14px',color:'#6B4423',lineHeight:2}}>Abacate • Azeitonas • Coco • Chocolate negro (+70%)</p>
            </div>
            
            {/* Footer */}
            <div style={{position:'absolute',bottom:'30px',left:'55px',right:'55px',display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'15px'}}>
              <span>Documento exclusivo de {dados.nome}</span>
              <span>Página 6 de 10</span>
            </div>
          </div>

          {/* ==================== PÁGINA 7 - VEGETAIS ==================== */}
          <div className="page page-break" style={{padding:'50px 55px 80px',position:'relative'}}>
            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #D2B48C',paddingBottom:'18px',marginBottom:'40px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'36px',height:'36px'}} dangerouslySetInnerHTML={{__html: VITALIS_LOGO_SVG}}></div>
                <span style={{fontWeight:600,fontSize:'16px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span>
              </div>
            </div>
            
            <div className="serif" style={{fontSize:'28px',fontWeight:600,color:'#6B4423',marginBottom:'25px',display:'flex',alignItems:'center',gap:'15px'}}>
              <span style={{fontSize:'32px'}}>🥬</span> Vegetais — Come o Arco-Íris!
            </div>
            
            <p style={{color:'#6B4423',fontSize:'15px',marginBottom:'35px',textAlign:'center'}}>
              Cada cor representa diferentes nutrientes. Inclui pelo menos 3 cores por refeição!
            </p>
            
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
              <div style={{background:'white',borderRadius:'14px',padding:'22px',border:'1px solid #D2B48C',borderLeft:'5px solid #4CAF50'}}>
                <div style={{fontWeight:600,color:'#2E7D32',marginBottom:'12px',fontSize:'16px'}}>🟢 Verdes</div>
                <p style={{fontSize:'13px',color:'#6B4423',lineHeight:1.8}}>Espinafre, Couve, Brócolos, Alface, Rúcula, Pepino, Abobrinha</p>
              </div>
              <div style={{background:'white',borderRadius:'14px',padding:'22px',border:'1px solid #D2B48C',borderLeft:'5px solid #F44336'}}>
                <div style={{fontWeight:600,color:'#C62828',marginBottom:'12px',fontSize:'16px'}}>🔴 Vermelhos</div>
                <p style={{fontSize:'13px',color:'#6B4423',lineHeight:1.8}}>Tomate, Pimento vermelho, Beterraba, Rabanete</p>
              </div>
              <div style={{background:'white',borderRadius:'14px',padding:'22px',border:'1px solid #D2B48C',borderLeft:'5px solid #FF9800'}}>
                <div style={{fontWeight:600,color:'#E65100',marginBottom:'12px',fontSize:'16px'}}>🟠 Laranjas</div>
                <p style={{fontSize:'13px',color:'#6B4423',lineHeight:1.8}}>Cenoura, Abóbora, Pimento laranja</p>
              </div>
              <div style={{background:'white',borderRadius:'14px',padding:'22px',border:'1px solid #D2B48C',borderLeft:'5px solid #9E9E9E'}}>
                <div style={{fontWeight:600,color:'#616161',marginBottom:'12px',fontSize:'16px'}}>⚪ Brancos</div>
                <p style={{fontSize:'13px',color:'#6B4423',lineHeight:1.8}}>Couve-flor, Cogumelos, Alho, Cebola, Nabo</p>
              </div>
              <div style={{background:'white',borderRadius:'14px',padding:'22px',border:'1px solid #D2B48C',borderLeft:'5px solid #9C27B0',gridColumn:'span 2'}}>
                <div style={{fontWeight:600,color:'#7B1FA2',marginBottom:'12px',fontSize:'16px'}}>🟣 Roxos</div>
                <p style={{fontSize:'13px',color:'#6B4423',lineHeight:1.8}}>Beringela, Couve roxa, Cebola roxa</p>
              </div>
            </div>
            
            {/* Footer */}
            <div style={{position:'absolute',bottom:'30px',left:'55px',right:'55px',display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'15px'}}>
              <span>Documento exclusivo de {dados.nome}</span>
              <span>Página 7 de 10</span>
            </div>
          </div>

          {/* ==================== PÁGINA 8 - LISTA DE COMPRAS ==================== */}
          <div className="page page-break" style={{padding:'50px 55px 80px',position:'relative'}}>
            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #D2B48C',paddingBottom:'18px',marginBottom:'40px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'36px',height:'36px'}} dangerouslySetInnerHTML={{__html: VITALIS_LOGO_SVG}}></div>
                <span style={{fontWeight:600,fontSize:'16px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span>
              </div>
            </div>
            
            <div className="serif" style={{fontSize:'28px',fontWeight:600,color:'#6B4423',marginBottom:'35px',display:'flex',alignItems:'center',gap:'15px'}}>
              <span style={{fontSize:'32px'}}>🛒</span> Lista de Compras Semanal
            </div>
            
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'25px'}}>
              <div style={{background:'white',borderRadius:'16px',padding:'28px',border:'1px solid #D2B48C'}}>
                <div style={{fontWeight:600,color:'#C62828',marginBottom:'20px',fontSize:'17px'}}>🥩 Proteínas</div>
                <div style={{fontSize:'14px',color:'#6B4423',lineHeight:2.2}}>
                  ☐ Peito de frango (1kg)<br/>
                  ☐ Ovos (2 dúzias)<br/>
                  ☐ Peixe fresco (500g)<br/>
                  ☐ Carne moída (500g)
                </div>
              </div>
              <div style={{background:'white',borderRadius:'16px',padding:'28px',border:'1px solid #D2B48C'}}>
                <div style={{fontWeight:600,color:'#2E7D32',marginBottom:'20px',fontSize:'17px'}}>🥬 Vegetais</div>
                <div style={{fontSize:'14px',color:'#6B4423',lineHeight:2.2}}>
                  ☐ Espinafre/Couve<br/>
                  ☐ Brócolos<br/>
                  ☐ Tomate<br/>
                  ☐ Pepino<br/>
                  ☐ Pimentos<br/>
                  ☐ Cebola e Alho
                </div>
              </div>
              <div style={{background:'white',borderRadius:'16px',padding:'28px',border:'1px solid #D2B48C'}}>
                <div style={{fontWeight:600,color:'#F57F17',marginBottom:'20px',fontSize:'17px'}}>🥑 Gorduras</div>
                <div style={{fontSize:'14px',color:'#6B4423',lineHeight:2.2}}>
                  ☐ Azeite extra-virgem<br/>
                  ☐ Abacate (2-3)<br/>
                  ☐ Manteiga<br/>
                  ☐ Amêndoas/Nozes
                </div>
              </div>
              <div style={{background:'white',borderRadius:'16px',padding:'28px',border:'1px solid #D2B48C'}}>
                <div style={{fontWeight:600,color:'#8B4513',marginBottom:'20px',fontSize:'17px'}}>🧂 Outros</div>
                <div style={{fontSize:'14px',color:'#6B4423',lineHeight:2.2}}>
                  ☐ Sal e pimenta<br/>
                  ☐ Ervas frescas<br/>
                  ☐ Limões<br/>
                  ☐ Chá/Café
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div style={{position:'absolute',bottom:'30px',left:'55px',right:'55px',display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'15px'}}>
              <span>Documento exclusivo de {dados.nome}</span>
              <span>Página 8 de 10</span>
            </div>
          </div>

          {/* ==================== PÁGINA 9 - REGRAS ==================== */}
          <div className="page page-break" style={{padding:'50px 55px 80px',position:'relative'}}>
            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #D2B48C',paddingBottom:'18px',marginBottom:'40px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'36px',height:'36px'}} dangerouslySetInnerHTML={{__html: VITALIS_LOGO_SVG}}></div>
                <span style={{fontWeight:600,fontSize:'16px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span>
              </div>
            </div>
            
            <div className="serif" style={{fontSize:'28px',fontWeight:600,color:'#6B4423',marginBottom:'35px',display:'flex',alignItems:'center',gap:'15px'}}>
              <span style={{fontSize:'32px'}}>📋</span> Regras da {faseConfig.nome}
            </div>
            
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'25px',marginBottom:'30px'}}>
              <div className="porcao-legumes" style={{borderRadius:'16px',padding:'28px'}}>
                <div style={{fontWeight:600,color:'#2E7D32',marginBottom:'20px',fontSize:'17px'}}>✓ PRIORIZAR</div>
                <div style={{fontSize:'14px',color:'#6B4423',lineHeight:2}}>
                  {faseConfig.priorizar.map((item, i) => (
                    <div key={i}>✓ {item}</div>
                  ))}
                </div>
              </div>
              <div className="porcao-proteina" style={{borderRadius:'16px',padding:'28px'}}>
                <div style={{fontWeight:600,color:'#C62828',marginBottom:'20px',fontSize:'17px'}}>✗ EVITAR</div>
                <div style={{fontSize:'14px',color:'#6B4423',lineHeight:2}}>
                  {faseConfig.evitar.map((item, i) => (
                    <div key={i}>✗ {item}</div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="porcao-gordura" style={{borderRadius:'16px',padding:'28px'}}>
              <div style={{fontWeight:600,color:'#F57F17',marginBottom:'20px',fontSize:'17px'}}>💡 DICAS</div>
              <div style={{fontSize:'14px',color:'#6B4423',lineHeight:2}}>
                {faseConfig.dicas.map((item, i) => (
                  <div key={i}>• {item}</div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div style={{position:'absolute',bottom:'30px',left:'55px',right:'55px',display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'15px'}}>
              <span>Documento exclusivo de {dados.nome}</span>
              <span>Página 9 de 10</span>
            </div>
          </div>

          {/* ==================== PÁGINA 10 - ENCERRAMENTO ==================== */}
          <div className="page page-break" style={{background:'linear-gradient(180deg, #FDF8F3 0%, #F5F0E8 100%)',display:'flex',flexDirection:'column'}}>
            {/* Padrão decorativo */}
            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,opacity:0.03,backgroundImage:'radial-gradient(circle at 20% 30%, #C1634A 1px, transparent 1px), radial-gradient(circle at 80% 70%, #6B8E23 1px, transparent 1px)',backgroundSize:'50px 50px'}}></div>
            
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px',position:'relative',zIndex:1}}>
              {/* Logo */}
              <div style={{width:'100px',height:'100px',marginBottom:'35px'}} dangerouslySetInnerHTML={{__html: VITALIS_LOGO_SVG}}></div>
              
              <div className="serif" style={{fontSize:'42px',fontWeight:700,color:'#A0422A',letterSpacing:'10px',marginBottom:'50px'}}>VITALIS</div>
              
              {/* Citação */}
              <div style={{maxWidth:'450px',textAlign:'center',padding:'40px',background:'white',borderRadius:'20px',boxShadow:'0 15px 50px rgba(0,0,0,0.08)',marginBottom:'50px'}}>
                <div style={{fontSize:'50px',color:'#D2B48C',marginBottom:'10px',lineHeight:1}}>"</div>
                <p className="serif" style={{fontSize:'22px',color:'#6B4423',fontStyle:'italic',lineHeight:1.7}}>
                  Quando o excesso cai, o corpo responde.
                </p>
              </div>
              
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'11px',color:'#8B4513',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'15px'}}>CRIADO EXCLUSIVAMENTE PARA</div>
                <div className="serif" style={{fontSize:'32px',fontWeight:600,color:'#6B4423'}}>{dados.nome}</div>
              </div>
            </div>
            
            {/* Footer */}
            <div style={{background:'#6B4423',padding:'25px 50px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{color:'rgba(255,255,255,0.95)',fontSize:'11px',lineHeight:1.7}}>
                <div style={{fontWeight:600}}>Vivianne Saraiva</div>
                <div style={{opacity:0.85}}>Precision Nutrition Level 1 Coach</div>
              </div>
              <div style={{color:'rgba(255,255,255,0.95)',fontSize:'11px',textAlign:'right',lineHeight:1.7}}>
                <div>vivianne.saraiva@outlook.com</div>
                <div style={{opacity:0.85}}>WhatsApp: +258 84 524 3875</div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</div>
```

);
}