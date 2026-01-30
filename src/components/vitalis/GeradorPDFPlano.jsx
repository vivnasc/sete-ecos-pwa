// ============================================================
// VITALIS - GERADOR DE PDF DO PLANO ALIMENTAR
// Versão 3 - SEM PÁGINAS EM BRANCO
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';

// Configuração das fases
const FASES_CONFIG = {
  inducao: {
    nome: 'Fase 1: Indução',
    duracao: '3-4 semanas',
    descricao: 'A fase de arranque onde o corpo entra em modo de queima de gordura. Foco em proteína, gorduras saudáveis e vegetais.',
    priorizar: ['Proteína em todas as refeições', 'Vegetais em abundância', 'Gorduras saudáveis (azeite, abacate, nozes)', 'Água (mínimo 2L por dia)', 'Dormir 7-8 horas por noite'],
    evitar: ['Açúcar e adoçantes', 'Grãos e cereais (pão, massa, arroz)', 'Frutas doces (banana, manga, uvas)', 'Leguminosas', 'Álcool'],
    dicas: ['Prepara as refeições ao domingo para a semana', 'Tem sempre snacks saudáveis à mão', 'Nos primeiros dias podes sentir "keto flu" — é normal', 'Pesa-te apenas às sextas-feiras, de manhã, em jejum']
  },
  estabilizacao: {
    nome: 'Fase 2: Estabilização',
    duracao: '6-8 semanas',
    descricao: 'Reintrodução gradual de hidratos complexos enquanto mantemos os resultados alcançados.',
    priorizar: ['Manter proteína elevada', 'Hidratos complexos (batata-doce, arroz integral)', 'Fruta de baixo índice glicémico', 'Leguminosas em moderação'],
    evitar: ['Açúcar refinado', 'Farinhas brancas', 'Alimentos processados', 'Bebidas açucaradas'],
    dicas: ['Introduz um novo alimento de cada vez', 'Observa como o corpo reage', 'Mantém o diário alimentar']
  },
  reeducacao: {
    nome: 'Fase 3: Reeducação',
    duracao: '6-8 semanas',
    descricao: 'Aprender a comer de forma equilibrada e intuitiva para a vida.',
    priorizar: ['Equilíbrio em todas as refeições', 'Variedade alimentar', 'Comer com atenção plena', 'Flexibilidade saudável'],
    evitar: ['Restrições extremas', 'Mentalidade de dieta', 'Comer emocional'],
    dicas: ['Pratica a escuta do corpo', 'Permite-te flexibilidade', 'Foca em como te sentes, não só no peso']
  },
  manutencao: {
    nome: 'Fase 4: Manutenção',
    duracao: 'Contínua',
    descricao: 'Manter os resultados alcançados com um estilo de vida equilibrado.',
    priorizar: ['Consistência', 'Movimento regular', 'Sono de qualidade', 'Gestão do stress'],
    evitar: ['Voltar aos velhos hábitos', 'Ignorar sinais do corpo', 'Perder a rotina'],
    dicas: ['Pesagem semanal para monitorizar', 'Ajusta conforme necessário', 'Celebra as vitórias']
  }
};

// Dimensões A4 em pixels (96 DPI)
const PAGE_WIDTH = '794px';  // 210mm
const PAGE_HEIGHT = '1123px'; // 297mm

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
        .from('vitalis_clients')
        .select('*')
        .eq('user_id', userId)
        .single();

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
        fase: plano?.fase || 'inducao',
        calorias: plano?.calorias_diarias,
        proteina_g: plano?.proteina_g,
        carboidratos_g: plano?.carboidratos_g,
        gordura_g: plano?.gordura_g,
        porcoes_proteina: plano?.porcoes_proteina,
        porcoes_hidratos: plano?.porcoes_hidratos,
        porcoes_gordura: plano?.porcoes_gordura,
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
  };

  const formatarData = (d) => {
    if (!d) return new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
    return new Date(d).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const gerarPDF = async () => {
    setGerando(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: 0,
        filename: `Vitalis_Plano_${dados.nome.replace(/\s+/g, '_')}_${dados.fase}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          width: 794,
          windowWidth: 794
        },
        jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait', hotfixes: ['px_scaling'] }
      };

      await html2pdf().set(opt).from(pdfRef.current).save();
      setTimeout(onClose, 500);
    } catch (err) {
      console.error('Erro PDF:', err);
      setErro('Erro ao gerar PDF');
    } finally {
      setGerando(false);
    }
  };

  const faseConfig = FASES_CONFIG[dados?.fase] || FASES_CONFIG.inducao;

  if (loading) {
    return (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
        <div style={{background:'white',borderRadius:'16px',padding:'32px',textAlign:'center'}}>
          <div style={{width:'48px',height:'48px',border:'4px solid #f3f3f3',borderTop:'4px solid #C1634A',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto'}}></div>
          <p style={{marginTop:'16px',color:'#666'}}>A preparar...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
        <div style={{background:'white',borderRadius:'16px',padding:'32px',textAlign:'center'}}>
          <p style={{color:'#C62828',marginBottom:'16px'}}>{erro}</p>
          <button onClick={onClose} style={{padding:'8px 24px',background:'#eee',border:'none',borderRadius:'8px',cursor:'pointer'}}>Fechar</button>
        </div>
      </div>
    );
  }

  // Estilos comuns
  const pageStyle = {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    background: '#FDF8F3',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #D2B48C',
    paddingBottom: '12px',
    marginBottom: '25px'
  };

  const footerStyle = {
    position: 'absolute',
    bottom: '25px',
    left: '40px',
    right: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    color: '#8B4513',
    borderTop: '1px solid #D2B48C',
    paddingTop: '10px'
  };

  const titleStyle = {
    fontSize: '22px',
    fontWeight: '600',
    color: '#6B4423',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const Logo = () => (
    <div style={{width:'32px',height:'32px',background:'linear-gradient(135deg, #C1634A, #8B4513)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <span style={{color:'white',fontSize:'18px',fontWeight:'bold'}}>V</span>
    </div>
  );

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,overflow:'auto',padding:'20px'}}>
      <div style={{background:'white',borderRadius:'16px',maxWidth:'900px',width:'100%',maxHeight:'95vh',overflow:'auto'}}>
        {/* Header do Modal */}
        <div style={{position:'sticky',top:0,background:'white',borderBottom:'1px solid #eee',padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:10}}>
          <div>
            <h2 style={{fontSize:'18px',fontWeight:'bold',color:'#333',margin:0}}>Gerar PDF do Plano</h2>
            <p style={{fontSize:'13px',color:'#666',margin:'4px 0 0'}}>10 páginas • Pré-visualização</p>
          </div>
          <div style={{display:'flex',gap:'12px'}}>
            <button onClick={onClose} style={{padding:'10px 20px',background:'#f5f5f5',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px'}}>
              Cancelar
            </button>
            <button 
              onClick={gerarPDF} 
              disabled={gerando}
              style={{padding:'10px 24px',background:'linear-gradient(135deg, #C1634A, #8B4513)',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px',fontWeight:'600',opacity:gerando?0.7:1}}
            >
              {gerando ? '⏳ A gerar...' : '📥 Descarregar PDF'}
            </button>
          </div>
        </div>

        {/* Preview - escala reduzida */}
        <div style={{padding:'24px',background:'#2a2a2a'}}>
          <div style={{transform:'scale(0.5)',transformOrigin:'top center',width:'200%',marginLeft:'-50%'}}>
            
            {/* Container do PDF - SEM gaps entre páginas */}
            <div ref={pdfRef} style={{width: PAGE_WIDTH, background:'white'}}>
              
              {/* ===== PÁGINA 1 - CAPA ===== */}
              <div style={{...pageStyle, background:'linear-gradient(180deg, #FDF8F3 0%, #F5F0E8 100%)', display:'flex', flexDirection:'column'}}>
                <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'50px 40px'}}>
                  <div style={{width:'80px',height:'80px',background:'linear-gradient(135deg, #C1634A, #8B4513)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'15px'}}>
                    <span style={{color:'white',fontSize:'42px',fontWeight:'bold'}}>V</span>
                  </div>
                  <div style={{fontSize:'36px',fontWeight:'700',color:'#A0422A',letterSpacing:'8px'}}>VITALIS</div>
                  <div style={{fontSize:'10px',color:'#8B4513',letterSpacing:'4px',textTransform:'uppercase',marginTop:'5px'}}>A RAIZ DA TRANSFORMAÇÃO</div>
                  <div style={{width:'80px',height:'2px',background:'linear-gradient(90deg, transparent, #C1634A, transparent)',margin:'35px 0'}}></div>
                  <div style={{fontSize:'28px',fontWeight:'600',color:'#6B4423',marginBottom:'8px'}}>Guia Personalizado</div>
                  <div style={{fontSize:'14px',color:'#C1634A',fontWeight:'500',letterSpacing:'4px',textTransform:'uppercase',marginBottom:'40px'}}>PLANO ALIMENTAR</div>
                  
                  <div style={{background:'white',border:'2px solid #D2B48C',borderRadius:'20px',padding:'30px 60px',textAlign:'center',boxShadow:'0 10px 40px rgba(0,0,0,0.06)'}}>
                    <div style={{fontSize:'9px',color:'#8B4513',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'8px'}}>PREPARADO EXCLUSIVAMENTE PARA</div>
                    <div style={{fontSize:'28px',fontWeight:'600',color:'#6B4423',marginBottom:'20px'}}>{dados.nome}</div>
                    <div style={{display:'flex',gap:'25px',justifyContent:'center',alignItems:'center',marginBottom:'15px'}}>
                      <div style={{textAlign:'center'}}>
                        <div style={{fontSize:'8px',color:'#8B4513',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'4px'}}>PESO ACTUAL</div>
                        <div style={{fontSize:'24px',color:'#A0422A',fontWeight:'700'}}>{dados.peso_actual} kg</div>
                      </div>
                      <div style={{color:'#6B8E23',fontSize:'28px'}}>→</div>
                      <div style={{textAlign:'center'}}>
                        <div style={{fontSize:'8px',color:'#8B4513',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'4px'}}>META</div>
                        <div style={{fontSize:'24px',color:'#A0422A',fontWeight:'700'}}>{dados.peso_meta} kg</div>
                      </div>
                    </div>
                    <div style={{fontSize:'11px',color:'#8B4513'}}>Início: {formatarData(dados.data_inicio)}</div>
                  </div>
                </div>
                <div style={{background:'#6B4423',padding:'20px 40px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{color:'rgba(255,255,255,0.95)',fontSize:'10px',lineHeight:1.6}}>
                    <div style={{fontWeight:'600'}}>Vivianne Saraiva</div>
                    <div style={{opacity:0.85}}>Precision Nutrition Level 1 Coach</div>
                  </div>
                  <div style={{color:'rgba(255,255,255,0.95)',fontSize:'10px',textAlign:'right',lineHeight:1.6}}>
                    <div>vivianne.saraiva@outlook.com</div>
                    <div style={{opacity:0.85}}>WhatsApp: +258 84 524 3875</div>
                  </div>
                </div>
              </div>

              {/* ===== PÁGINA 2 - BEM-VINDA & FASE ===== */}
              <div style={{...pageStyle, padding:'40px'}}>
                <div style={headerStyle}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><Logo/><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div>
                  <div style={{fontSize:'11px',color:'#8B4513',fontWeight:'500'}}>{faseConfig.nome}</div>
                </div>
                
                <div style={titleStyle}><span style={{fontSize:'26px'}}>👋</span> Bem-vinda à Tua Jornada</div>
                <div style={{background:'linear-gradient(135deg, #FDF8F3, #F5F0E8)',borderRadius:'12px',padding:'25px',marginBottom:'30px',border:'1px solid #D2B48C'}}>
                  <p style={{color:'#6B4423',fontSize:'13px',lineHeight:1.8}}><strong>{dados.nome}</strong>, este guia foi criado especialmente para ti, com base nas tuas respostas, objectivos e estilo de vida. Cada porção, cada recomendação, foi calculada para o teu corpo e para onde queres chegar.</p>
                </div>
                
                <div style={titleStyle}><span style={{fontSize:'26px'}}>🔥</span> {faseConfig.nome}</div>
                <div style={{background:'white',borderRadius:'12px',padding:'25px',marginBottom:'25px',border:'1px solid #D2B48C'}}>
                  <div style={{display:'inline-block',padding:'5px 14px',background:'#F5F0E8',borderRadius:'20px',fontSize:'11px',color:'#8B4513',fontWeight:'500',marginBottom:'15px'}}>Duração: {faseConfig.duracao}</div>
                  <p style={{color:'#6B4423',fontSize:'13px',lineHeight:1.7}}>{faseConfig.descricao}</p>
                </div>
                
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',border:'1px solid #D2B48C'}}>
                    <div style={{fontSize:'9px',color:'#8B4513',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'10px',fontWeight:'500'}}>ABORDAGEM NUTRICIONAL</div>
                    <div style={{fontSize:'18px',fontWeight:'600',color:'#C1634A',textTransform:'capitalize'}}>{dados.abordagem?.replace('_', ' ')}</div>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',border:'1px solid #D2B48C'}}>
                    <div style={{fontSize:'9px',color:'#8B4513',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'10px',fontWeight:'500'}}>META SEMANAL</div>
                    <div style={{fontSize:'18px',fontWeight:'600',color:'#6B8E23'}}>-0.5 a -1.0 kg/semana</div>
                  </div>
                </div>
                
                <div style={footerStyle}><span>Documento exclusivo de {dados.nome}</span><span>Página 2 de 10</span></div>
              </div>

              {/* ===== PÁGINA 3 - PORÇÕES DIÁRIAS ===== */}
              <div style={{...pageStyle, padding:'40px'}}>
                <div style={headerStyle}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><Logo/><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div>
                  <div style={{fontSize:'11px',color:'#8B4513',fontWeight:'500'}}>{faseConfig.nome}</div>
                </div>
                
                <div style={titleStyle}><span style={{fontSize:'26px'}}>🍽️</span> As Tuas Porções Diárias</div>
                <p style={{color:'#6B4423',fontSize:'13px',marginBottom:'25px'}}>Usa o Método da Mão para medir — simples, prático e sempre contigo.</p>
                
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'20px',marginBottom:'25px'}}>
                  <div style={{background:'#FFEBEE',border:'2px solid #E57373',borderRadius:'14px',padding:'25px',textAlign:'center'}}>
                    <div style={{fontSize:'14px',fontWeight:'600',color:'#C62828',marginBottom:'10px'}}>Proteína</div>
                    <div style={{fontSize:'48px',fontWeight:'700',color:'#C62828',lineHeight:1}}>{dados.porcoes_proteina}</div>
                    <div style={{fontSize:'12px',color:'#C62828',marginTop:'6px'}}>palmas/dia</div>
                  </div>
                  <div style={{background:'#E3F2FD',border:'2px solid #64B5F6',borderRadius:'14px',padding:'25px',textAlign:'center'}}>
                    <div style={{fontSize:'14px',fontWeight:'600',color:'#1565C0',marginBottom:'10px'}}>Hidratos</div>
                    <div style={{fontSize:'48px',fontWeight:'700',color:'#1565C0',lineHeight:1}}>{dados.porcoes_hidratos}</div>
                    <div style={{fontSize:'12px',color:'#1565C0',marginTop:'6px'}}>mãos/dia</div>
                  </div>
                  <div style={{background:'#FFF8E1',border:'2px solid #FFD54F',borderRadius:'14px',padding:'25px',textAlign:'center'}}>
                    <div style={{fontSize:'14px',fontWeight:'600',color:'#F57F17',marginBottom:'10px'}}>Gordura</div>
                    <div style={{fontSize:'48px',fontWeight:'700',color:'#F57F17',lineHeight:1}}>{dados.porcoes_gordura}</div>
                    <div style={{fontSize:'12px',color:'#F57F17',marginTop:'6px'}}>polegares/dia</div>
                  </div>
                </div>
                
                <div style={{background:'#E8F5E9',border:'2px solid #81C784',borderRadius:'14px',padding:'25px',textAlign:'center',marginBottom:'30px'}}>
                  <div style={{fontSize:'14px',fontWeight:'600',color:'#2E7D32',marginBottom:'6px'}}>🥬 Vegetais & Legumes</div>
                  <div style={{fontSize:'32px',fontWeight:'700',color:'#2E7D32'}}>À VONTADE</div>
                  <div style={{fontSize:'11px',color:'#2E7D32',marginTop:'6px'}}>Não precisas medir — quanto mais cores, melhor!</div>
                </div>
                
                <div style={{...titleStyle, fontSize:'20px'}}><span>📊</span> Os Teus Macros Diários</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'15px'}}>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',textAlign:'center',border:'1px solid #D2B48C'}}>
                    <div style={{fontSize:'10px',marginBottom:'6px'}}>🔥</div>
                    <div style={{fontSize:'26px',fontWeight:'700',color:'#C1634A'}}>{dados.calorias}</div>
                    <div style={{fontSize:'10px',color:'#8B4513',marginTop:'4px'}}>Calorias</div>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',textAlign:'center',border:'1px solid #D2B48C'}}>
                    <div style={{fontSize:'10px',marginBottom:'6px'}}>🥩</div>
                    <div style={{fontSize:'26px',fontWeight:'700',color:'#C62828'}}>{dados.proteina_g}g</div>
                    <div style={{fontSize:'10px',color:'#8B4513',marginTop:'4px'}}>Proteína</div>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',textAlign:'center',border:'1px solid #D2B48C'}}>
                    <div style={{fontSize:'10px',marginBottom:'6px'}}>🍚</div>
                    <div style={{fontSize:'26px',fontWeight:'700',color:'#1565C0'}}>{dados.carboidratos_g}g</div>
                    <div style={{fontSize:'10px',color:'#8B4513',marginTop:'4px'}}>Hidratos</div>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',textAlign:'center',border:'1px solid #D2B48C'}}>
                    <div style={{fontSize:'10px',marginBottom:'6px'}}>🥑</div>
                    <div style={{fontSize:'26px',fontWeight:'700',color:'#F57F17'}}>{dados.gordura_g}g</div>
                    <div style={{fontSize:'10px',color:'#8B4513',marginTop:'4px'}}>Gordura</div>
                  </div>
                </div>
                
                <div style={footerStyle}><span>Documento exclusivo de {dados.nome}</span><span>Página 3 de 10</span></div>
              </div>

              {/* ===== PÁGINA 4 - MÉTODO DA MÃO ===== */}
              <div style={{...pageStyle, padding:'40px'}}>
                <div style={headerStyle}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><Logo/><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div>
                </div>
                
                <div style={titleStyle}><span style={{fontSize:'26px'}}>✋</span> O Método da Mão</div>
                <p style={{color:'#6B4423',fontSize:'13px',marginBottom:'30px',textAlign:'center',fontStyle:'italic'}}>A tua mão é proporcional ao teu corpo — mãos maiores = corpo maior = mais comida. Simples, prático e sempre contigo.</p>
                
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'25px'}}>
                  <div style={{background:'#FFEBEE',border:'2px solid #E57373',borderRadius:'14px',padding:'25px'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'12px',fontSize:'16px'}}>🖐️ A Palma — PROTEÍNA</div>
                    <div style={{color:'#C62828',fontWeight:'600',fontSize:'18px',marginBottom:'12px'}}>~{dados.tamanho_palma}g de proteína</div>
                    <p style={{fontSize:'12px',color:'#6B4423',marginBottom:'8px'}}>Tamanho e espessura da tua palma (sem dedos)</p>
                    <p style={{fontSize:'11px',color:'#8B4513',fontStyle:'italic'}}>Ex: 1 bife, 1 peito de frango</p>
                  </div>
                  
                  <div style={{background:'#E3F2FD',border:'2px solid #64B5F6',borderRadius:'14px',padding:'25px'}}>
                    <div style={{fontWeight:'600',color:'#1565C0',marginBottom:'12px',fontSize:'16px'}}>🤲 A Mão em Concha — HIDRATOS</div>
                    <div style={{color:'#1565C0',fontWeight:'600',fontSize:'18px',marginBottom:'12px'}}>~{dados.tamanho_mao}g de hidratos</div>
                    <p style={{fontSize:'12px',color:'#6B4423',marginBottom:'8px'}}>O que cabe na tua mão em concha</p>
                    <p style={{fontSize:'11px',color:'#8B4513',fontStyle:'italic'}}>Ex: punhado de arroz, batata-doce</p>
                  </div>
                  
                  <div style={{background:'#FFF8E1',border:'2px solid #FFD54F',borderRadius:'14px',padding:'25px'}}>
                    <div style={{fontWeight:'600',color:'#F57F17',marginBottom:'12px',fontSize:'16px'}}>👍 O Polegar — GORDURA</div>
                    <div style={{color:'#F57F17',fontWeight:'600',fontSize:'18px',marginBottom:'12px'}}>~{dados.tamanho_polegar}g de gordura</div>
                    <p style={{fontSize:'12px',color:'#6B4423',marginBottom:'8px'}}>Tamanho do teu polegar inteiro</p>
                    <p style={{fontSize:'11px',color:'#8B4513',fontStyle:'italic'}}>Ex: 1 colher azeite, nozes</p>
                  </div>
                  
                  <div style={{background:'#E8F5E9',border:'2px solid #81C784',borderRadius:'14px',padding:'25px'}}>
                    <div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'12px',fontSize:'16px'}}>✊ O Punho — VEGETAIS</div>
                    <div style={{color:'#2E7D32',fontWeight:'600',fontSize:'18px',marginBottom:'12px'}}>~100g de vegetais</div>
                    <p style={{fontSize:'12px',color:'#6B4423',marginBottom:'8px'}}>Tamanho do teu punho fechado</p>
                    <p style={{fontSize:'11px',color:'#2E7D32',fontWeight:'600'}}>Mas lembra-te: À VONTADE!</p>
                  </div>
                </div>
                
                <div style={footerStyle}><span>Documento exclusivo de {dados.nome}</span><span>Página 4 de 10</span></div>
              </div>

              {/* ===== PÁGINA 5 - PROTEÍNAS ===== */}
              <div style={{...pageStyle, padding:'40px'}}>
                <div style={headerStyle}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><Logo/><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div>
                </div>
                
                <div style={titleStyle}><span style={{fontSize:'26px'}}>🥩</span> Proteínas Saudáveis</div>
                
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
                  <div style={{background:'white',borderRadius:'14px',padding:'25px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'15px',fontSize:'15px'}}>Carnes Vermelhas (magras)</div>
                    <p style={{fontSize:'13px',color:'#6B4423',lineHeight:1.9}}>Bife de vaca • Carne moída magra • Lombo de porco • Cabrito • Borrego • Fígado</p>
                  </div>
                  <div style={{background:'white',borderRadius:'14px',padding:'25px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'15px',fontSize:'15px'}}>Aves</div>
                    <p style={{fontSize:'13px',color:'#6B4423',lineHeight:1.9}}>Peito de frango • Coxa de frango (sem pele) • Peru • Pato (sem pele) • Codorniz</p>
                  </div>
                  <div style={{background:'white',borderRadius:'14px',padding:'25px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'15px',fontSize:'15px'}}>Peixes & Mariscos</div>
                    <p style={{fontSize:'13px',color:'#6B4423',lineHeight:1.9}}>Salmão • Atum • Sardinha • Carapau • Pescada • Tilápia • Camarão • Lulas</p>
                  </div>
                  <div style={{background:'white',borderRadius:'14px',padding:'25px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'15px',fontSize:'15px'}}>Ovos & Lacticínios</div>
                    <p style={{fontSize:'13px',color:'#6B4423',lineHeight:1.9}}>Ovos inteiros • Queijo fresco • Iogurte grego natural • Requeijão</p>
                  </div>
                </div>
                
                <div style={footerStyle}><span>Documento exclusivo de {dados.nome}</span><span>Página 5 de 10</span></div>
              </div>

              {/* ===== PÁGINA 6 - HIDRATOS E GORDURAS ===== */}
              <div style={{...pageStyle, padding:'40px'}}>
                <div style={headerStyle}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><Logo/><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div>
                </div>
                
                <div style={titleStyle}><span style={{fontSize:'22px'}}>🍚</span> Hidratos Saudáveis & <span style={{fontSize:'22px'}}>🥑</span> Gorduras</div>
                
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px'}}>
                  <div style={{background:'#E3F2FD',border:'2px solid #64B5F6',borderRadius:'14px',padding:'22px'}}>
                    <div style={{fontWeight:'600',color:'#1565C0',marginBottom:'12px',fontSize:'15px'}}>Tubérculos & Grãos</div>
                    <p style={{fontSize:'12px',color:'#6B4423',lineHeight:1.9}}>Batata-doce • Mandioca • Inhame • Arroz integral • Quinoa • Aveia</p>
                  </div>
                  <div style={{background:'#E3F2FD',border:'2px solid #64B5F6',borderRadius:'14px',padding:'22px'}}>
                    <div style={{fontWeight:'600',color:'#1565C0',marginBottom:'12px',fontSize:'15px'}}>Frutas (baixo IG)</div>
                    <p style={{fontSize:'12px',color:'#6B4423',lineHeight:1.9}}>Frutos vermelhos • Maçã verde • Pera • Laranja • Toranja • Kiwi</p>
                  </div>
                </div>
                
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px'}}>
                  <div style={{background:'#FFF8E1',border:'2px solid #FFD54F',borderRadius:'14px',padding:'22px'}}>
                    <div style={{fontWeight:'600',color:'#F57F17',marginBottom:'12px',fontSize:'15px'}}>Óleos & Manteigas</div>
                    <p style={{fontSize:'12px',color:'#6B4423',lineHeight:1.9}}>Azeite extra-virgem • Óleo de coco • Manteiga • Ghee</p>
                  </div>
                  <div style={{background:'#FFF8E1',border:'2px solid #FFD54F',borderRadius:'14px',padding:'22px'}}>
                    <div style={{fontWeight:'600',color:'#F57F17',marginBottom:'12px',fontSize:'15px'}}>Frutos Secos & Sementes</div>
                    <p style={{fontSize:'12px',color:'#6B4423',lineHeight:1.9}}>Amêndoas • Nozes • Cajus • Sementes de chia • Sementes de linhaça</p>
                  </div>
                </div>
                
                <div style={{background:'#FFF8E1',border:'2px solid #FFD54F',borderRadius:'14px',padding:'22px'}}>
                  <div style={{fontWeight:'600',color:'#F57F17',marginBottom:'12px',fontSize:'15px'}}>Outras Fontes de Gordura</div>
                  <p style={{fontSize:'12px',color:'#6B4423',lineHeight:1.9}}>Abacate • Azeitonas • Coco • Chocolate negro (+70%)</p>
                </div>
                
                <div style={footerStyle}><span>Documento exclusivo de {dados.nome}</span><span>Página 6 de 10</span></div>
              </div>

              {/* ===== PÁGINA 7 - VEGETAIS ===== */}
              <div style={{...pageStyle, padding:'40px'}}>
                <div style={headerStyle}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><Logo/><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div>
                </div>
                
                <div style={titleStyle}><span style={{fontSize:'26px'}}>🥬</span> Vegetais — Come o Arco-Íris!</div>
                <p style={{color:'#6B4423',fontSize:'13px',marginBottom:'25px',textAlign:'center'}}>Cada cor representa diferentes nutrientes. Inclui pelo menos 3 cores por refeição!</p>
                
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'18px'}}>
                  <div style={{background:'white',borderRadius:'12px',padding:'18px',border:'1px solid #D2B48C',borderLeft:'5px solid #4CAF50'}}>
                    <div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'10px',fontSize:'14px'}}>🟢 Verdes</div>
                    <p style={{fontSize:'12px',color:'#6B4423',lineHeight:1.7}}>Espinafre, Couve, Brócolos, Alface, Rúcula, Pepino, Abobrinha</p>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'18px',border:'1px solid #D2B48C',borderLeft:'5px solid #F44336'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'10px',fontSize:'14px'}}>🔴 Vermelhos</div>
                    <p style={{fontSize:'12px',color:'#6B4423',lineHeight:1.7}}>Tomate, Pimento vermelho, Beterraba, Rabanete</p>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'18px',border:'1px solid #D2B48C',borderLeft:'5px solid #FF9800'}}>
                    <div style={{fontWeight:'600',color:'#E65100',marginBottom:'10px',fontSize:'14px'}}>🟠 Laranjas</div>
                    <p style={{fontSize:'12px',color:'#6B4423',lineHeight:1.7}}>Cenoura, Abóbora, Pimento laranja</p>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'18px',border:'1px solid #D2B48C',borderLeft:'5px solid #9E9E9E'}}>
                    <div style={{fontWeight:'600',color:'#616161',marginBottom:'10px',fontSize:'14px'}}>⚪ Brancos</div>
                    <p style={{fontSize:'12px',color:'#6B4423',lineHeight:1.7}}>Couve-flor, Cogumelos, Alho, Cebola, Nabo</p>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'18px',border:'1px solid #D2B48C',borderLeft:'5px solid #9C27B0',gridColumn:'span 2'}}>
                    <div style={{fontWeight:'600',color:'#7B1FA2',marginBottom:'10px',fontSize:'14px'}}>🟣 Roxos</div>
                    <p style={{fontSize:'12px',color:'#6B4423',lineHeight:1.7}}>Beringela, Couve roxa, Cebola roxa</p>
                  </div>
                </div>
                
                <div style={footerStyle}><span>Documento exclusivo de {dados.nome}</span><span>Página 7 de 10</span></div>
              </div>

              {/* ===== PÁGINA 8 - LISTA DE COMPRAS ===== */}
              <div style={{...pageStyle, padding:'40px'}}>
                <div style={headerStyle}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><Logo/><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div>
                </div>
                
                <div style={titleStyle}><span style={{fontSize:'26px'}}>🛒</span> Lista de Compras Semanal</div>
                
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
                  <div style={{background:'white',borderRadius:'14px',padding:'25px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'18px',fontSize:'15px'}}>🥩 Proteínas</div>
                    <div style={{fontSize:'13px',color:'#6B4423',lineHeight:2.1}}>☐ Peito de frango (1kg)<br/>☐ Ovos (2 dúzias)<br/>☐ Peixe fresco (500g)<br/>☐ Carne moída (500g)</div>
                  </div>
                  <div style={{background:'white',borderRadius:'14px',padding:'25px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'18px',fontSize:'15px'}}>🥬 Vegetais</div>
                    <div style={{fontSize:'13px',color:'#6B4423',lineHeight:2.1}}>☐ Espinafre/Couve<br/>☐ Brócolos<br/>☐ Tomate<br/>☐ Pepino<br/>☐ Pimentos<br/>☐ Cebola e Alho</div>
                  </div>
                  <div style={{background:'white',borderRadius:'14px',padding:'25px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#F57F17',marginBottom:'18px',fontSize:'15px'}}>🥑 Gorduras</div>
                    <div style={{fontSize:'13px',color:'#6B4423',lineHeight:2.1}}>☐ Azeite extra-virgem<br/>☐ Abacate (2-3)<br/>☐ Manteiga<br/>☐ Amêndoas/Nozes</div>
                  </div>
                  <div style={{background:'white',borderRadius:'14px',padding:'25px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#8B4513',marginBottom:'18px',fontSize:'15px'}}>🧂 Outros</div>
                    <div style={{fontSize:'13px',color:'#6B4423',lineHeight:2.1}}>☐ Sal e pimenta<br/>☐ Ervas frescas<br/>☐ Limões<br/>☐ Chá/Café</div>
                  </div>
                </div>
                
                <div style={footerStyle}><span>Documento exclusivo de {dados.nome}</span><span>Página 8 de 10</span></div>
              </div>

              {/* ===== PÁGINA 9 - REGRAS ===== */}
              <div style={{...pageStyle, padding:'40px'}}>
                <div style={headerStyle}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><Logo/><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div>
                </div>
                
                <div style={titleStyle}><span style={{fontSize:'26px'}}>📋</span> Regras da {faseConfig.nome}</div>
                
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'25px',marginBottom:'25px'}}>
                  <div style={{background:'#E8F5E9',border:'2px solid #81C784',borderRadius:'14px',padding:'25px'}}>
                    <div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'18px',fontSize:'15px'}}>✓ PRIORIZAR</div>
                    <div style={{fontSize:'12px',color:'#6B4423',lineHeight:1.9}}>
                      {faseConfig.priorizar.map((item, i) => <div key={i}>✓ {item}</div>)}
                    </div>
                  </div>
                  <div style={{background:'#FFEBEE',border:'2px solid #E57373',borderRadius:'14px',padding:'25px'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'18px',fontSize:'15px'}}>✗ EVITAR</div>
                    <div style={{fontSize:'12px',color:'#6B4423',lineHeight:1.9}}>
                      {faseConfig.evitar.map((item, i) => <div key={i}>✗ {item}</div>)}
                    </div>
                  </div>
                </div>
                
                <div style={{background:'#FFF8E1',border:'2px solid #FFD54F',borderRadius:'14px',padding:'25px'}}>
                  <div style={{fontWeight:'600',color:'#F57F17',marginBottom:'18px',fontSize:'15px'}}>💡 DICAS</div>
                  <div style={{fontSize:'12px',color:'#6B4423',lineHeight:1.9}}>
                    {faseConfig.dicas.map((item, i) => <div key={i}>• {item}</div>)}
                  </div>
                </div>
                
                <div style={footerStyle}><span>Documento exclusivo de {dados.nome}</span><span>Página 9 de 10</span></div>
              </div>

              {/* ===== PÁGINA 10 - ENCERRAMENTO ===== */}
              <div style={{...pageStyle, background:'linear-gradient(180deg, #FDF8F3 0%, #F5F0E8 100%)', display:'flex', flexDirection:'column'}}>
                <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'50px'}}>
                  <div style={{width:'80px',height:'80px',background:'linear-gradient(135deg, #C1634A, #8B4513)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'25px'}}>
                    <span style={{color:'white',fontSize:'42px',fontWeight:'bold'}}>V</span>
                  </div>
                  <div style={{fontSize:'36px',fontWeight:'700',color:'#A0422A',letterSpacing:'8px',marginBottom:'40px'}}>VITALIS</div>
                  
                  <div style={{maxWidth:'380px',textAlign:'center',padding:'35px',background:'white',borderRadius:'18px',boxShadow:'0 10px 40px rgba(0,0,0,0.06)',marginBottom:'40px'}}>
                    <div style={{fontSize:'44px',color:'#D2B48C',marginBottom:'10px',lineHeight:1}}>"</div>
                    <p style={{fontSize:'18px',color:'#6B4423',fontStyle:'italic',lineHeight:1.7}}>Quando o excesso cai, o corpo responde.</p>
                  </div>
                  
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'10px',color:'#8B4513',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'12px'}}>CRIADO EXCLUSIVAMENTE PARA</div>
                    <div style={{fontSize:'28px',fontWeight:'600',color:'#6B4423'}}>{dados.nome}</div>
                  </div>
                </div>
                
                <div style={{background:'#6B4423',padding:'20px 40px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{color:'rgba(255,255,255,0.95)',fontSize:'10px',lineHeight:1.6}}>
                    <div style={{fontWeight:'600'}}>Vivianne Saraiva</div>
                    <div style={{opacity:0.85}}>Precision Nutrition Level 1 Coach</div>
                  </div>
                  <div style={{color:'rgba(255,255,255,0.95)',fontSize:'10px',textAlign:'right',lineHeight:1.6}}>
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
  );
}
