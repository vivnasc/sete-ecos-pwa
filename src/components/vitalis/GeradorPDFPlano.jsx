// VITALIS - GERADOR PDF PROFISSIONAL
// Usa jsPDF + html2canvas página a página
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';

const FASES_CONFIG = {
  inducao: { nome: 'Fase 1: Indução', duracao: '3-4 semanas', descricao: 'A fase de arranque onde o corpo entra em modo de queima de gordura. Foco em proteína, gorduras saudáveis e vegetais.', priorizar: ['Proteína em todas as refeições', 'Vegetais em abundância', 'Gorduras saudáveis (azeite, abacate, nozes)', 'Água (mínimo 2L por dia)', 'Dormir 7-8 horas por noite'], evitar: ['Açúcar e adoçantes', 'Grãos e cereais (pão, massa, arroz)', 'Frutas doces (banana, manga, uvas)', 'Leguminosas', 'Álcool'], dicas: ['Prepara as refeições ao domingo', 'Tem snacks saudáveis à mão', 'Podes sentir "keto flu" — é normal', 'Pesa-te às sextas-feiras, em jejum'] },
  estabilizacao: { nome: 'Fase 2: Estabilização', duracao: '6-8 semanas', descricao: 'Reintrodução gradual de hidratos complexos enquanto mantemos os resultados.', priorizar: ['Manter proteína elevada', 'Hidratos complexos (batata-doce, arroz integral)', 'Fruta de baixo índice glicémico', 'Leguminosas em moderação'], evitar: ['Açúcar refinado', 'Farinhas brancas', 'Alimentos processados', 'Bebidas açucaradas'], dicas: ['Introduz um alimento de cada vez', 'Observa como o corpo reage', 'Mantém o diário alimentar'] },
  reeducacao: { nome: 'Fase 3: Reeducação', duracao: '6-8 semanas', descricao: 'Aprender a comer de forma equilibrada e intuitiva para a vida.', priorizar: ['Equilíbrio em todas as refeições', 'Variedade alimentar', 'Comer com atenção plena', 'Flexibilidade saudável'], evitar: ['Restrições extremas', 'Mentalidade de dieta', 'Comer emocional'], dicas: ['Pratica a escuta do corpo', 'Permite-te flexibilidade', 'Foca em como te sentes'] },
  manutencao: { nome: 'Fase 4: Manutenção', duracao: 'Contínua', descricao: 'Manter os resultados com um estilo de vida equilibrado.', priorizar: ['Consistência', 'Movimento regular', 'Sono de qualidade', 'Gestão do stress'], evitar: ['Voltar aos velhos hábitos', 'Ignorar sinais do corpo', 'Perder a rotina'], dicas: ['Pesagem semanal', 'Ajusta conforme necessário', 'Celebra as vitórias'] }
};

export default function GeradorPDFPlano({ userId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const pagesRef = useRef([]);

  useEffect(() => { carregarDados(); }, [userId]);

  const carregarDados = async () => {
    try {
      const { data: cliente } = await supabase.from('vitalis_clients').select('*').eq('user_id', userId).single();
      const { data: plano } = await supabase.from('vitalis_plano').select('*').eq('client_id', cliente?.id).single();
      const { data: intake } = await supabase.from('vitalis_intake').select('nome, email').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single();
      setDados({
        nome: intake?.nome || 'Cliente', peso_actual: plano?.peso_actual || plano?.peso_inicial || 70, peso_meta: plano?.peso_meta || 60,
        fase: plano?.fase || 'inducao', calorias: plano?.calorias_diarias || 1500, proteina_g: plano?.proteina_g || 120,
        carboidratos_g: plano?.carboidratos_g || 100, gordura_g: plano?.gordura_g || 60, porcoes_proteina: plano?.porcoes_proteina || 6,
        porcoes_hidratos: plano?.porcoes_hidratos || 4, porcoes_gordura: plano?.porcoes_gordura || 8,
        tamanho_palma: plano?.tamanho_palma_g || 20, tamanho_mao: plano?.tamanho_mao_g || 25, tamanho_polegar: plano?.tamanho_polegar_g || 7,
        data_inicio: plano?.data_inicio_fase || new Date().toISOString(), abordagem: plano?.abordagem || 'equilibrado'
      });
    } catch (err) { setErro('Erro ao carregar dados'); } finally { setLoading(false); }
  };

  const formatarData = (d) => d ? new Date(d).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });

  const gerarPDF = async () => {
    setGerando(true);
    setProgresso(0);
    try {
      const html2canvas = (await import('html2pdf.js/dist/html2pdf.bundle.min.js')).default;
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      const totalPages = pagesRef.current.length;

      for (let i = 0; i < totalPages; i++) {
        const pageEl = pagesRef.current[i];
        if (!pageEl) continue;
        
        setProgresso(Math.round(((i + 1) / totalPages) * 100));
        
        // Captura a página com html2canvas
        const canvas = await window.html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#FDF8F3'
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
      }

      pdf.save(`Vitalis_Plano_${dados.nome.replace(/\s+/g, '_')}.pdf`);
      setTimeout(onClose, 500);
    } catch (err) {
      console.error('Erro PDF:', err);
      // Fallback para html2pdf.js
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        const container = document.getElementById('pdf-pages-container');
        await html2pdf().set({
          margin: 0,
          filename: `Vitalis_Plano_${dados.nome.replace(/\s+/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: 'css', before: '.pdf-page' }
        }).from(container).save();
        setTimeout(onClose, 500);
      } catch (err2) {
        setErro('Erro ao gerar PDF');
      }
    } finally { setGerando(false); }
  };

  const faseConfig = FASES_CONFIG[dados?.fase] || FASES_CONFIG.inducao;
  
  // Estilos
  const PAGE = { width: '210mm', height: '297mm', background: '#FDF8F3', fontFamily: 'Segoe UI, Tahoma, sans-serif', fontSize: '11px', color: '#6B4423', position: 'relative', boxSizing: 'border-box', overflow: 'hidden', flexShrink: 0 };
  const HEADER = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #D2B48C', paddingBottom: '12px', marginBottom: '25px' };
  const LOGO = { width: '35px', height: '35px', background: 'linear-gradient(135deg, #C1634A, #8B4513)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 'bold' };
  const TITLE = { fontSize: '22px', fontWeight: '600', color: '#6B4423', marginBottom: '20px' };
  const CARD = { background: 'white', border: '1px solid #D2B48C', borderRadius: '12px', padding: '20px', marginBottom: '15px' };
  const FOOTER = { position: 'absolute', bottom: '20px', left: '40px', right: '40px', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#8B4513', borderTop: '1px solid #D2B48C', paddingTop: '10px' };

  if (loading) return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}><div style={{background:'white',borderRadius:'16px',padding:'32px',textAlign:'center'}}><div style={{width:'48px',height:'48px',border:'4px solid #f3f3f3',borderTop:'4px solid #C1634A',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto'}}></div><p style={{marginTop:'16px',color:'#666'}}>A preparar...</p><style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style></div></div>;
  if (erro) return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}><div style={{background:'white',borderRadius:'16px',padding:'32px',textAlign:'center'}}><p style={{color:'#C62828',marginBottom:'16px'}}>{erro}</p><button onClick={onClose} style={{padding:'8px 24px',background:'#eee',border:'none',borderRadius:'8px',cursor:'pointer'}}>Fechar</button></div></div>;

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,overflow:'auto',padding:'20px'}}>
      <div style={{background:'white',borderRadius:'16px',maxWidth:'95vw',width:'900px',maxHeight:'95vh',overflow:'hidden',display:'flex',flexDirection:'column'}}>
        
        {/* Header */}
        <div style={{background:'linear-gradient(135deg, #C1634A, #8B4513)',padding:'20px 24px',color:'white'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h2 style={{fontSize:'20px',fontWeight:'bold',margin:0}}>📄 Plano Alimentar</h2>
              <p style={{fontSize:'14px',opacity:0.9,margin:'4px 0 0'}}>{dados.nome} • 10 páginas</p>
            </div>
            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={onClose} style={{padding:'10px 20px',background:'rgba(255,255,255,0.2)',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px'}}>✕ Fechar</button>
              <button onClick={gerarPDF} disabled={gerando} style={{padding:'10px 24px',background:'white',color:'#C1634A',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px',fontWeight:'600',opacity:gerando?0.7:1}}>
                {gerando ? `⏳ ${progresso}%` : '📥 Descarregar PDF'}
              </button>
            </div>
          </div>
          {gerando && <div style={{marginTop:'12px',background:'rgba(255,255,255,0.3)',borderRadius:'4px',height:'6px'}}><div style={{background:'white',height:'100%',borderRadius:'4px',width:`${progresso}%`,transition:'width 0.3s'}}></div></div>}
        </div>

        {/* Preview Container */}
        <div style={{flex:1,overflow:'auto',padding:'20px',background:'#e5e5e5'}}>
          <div id="pdf-pages-container" style={{display:'flex',flexDirection:'column',gap:'20px',alignItems:'center'}}>
            
            {/* PÁGINA 1 - CAPA */}
            <div ref={el => pagesRef.current[0] = el} className="pdf-page" style={{...PAGE, display:'flex', flexDirection:'column'}}>
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'50px'}}>
                <div style={{width:'100px',height:'100px',background:'linear-gradient(135deg, #C1634A, #8B4513)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px',boxShadow:'0 10px 30px rgba(193,99,74,0.4)'}}><span style={{color:'white',fontSize:'55px',fontWeight:'bold'}}>V</span></div>
                <div style={{fontSize:'48px',fontWeight:'700',color:'#A0422A',letterSpacing:'12px'}}>VITALIS</div>
                <div style={{fontSize:'11px',color:'#8B4513',letterSpacing:'5px',marginTop:'8px'}}>A RAIZ DA TRANSFORMAÇÃO</div>
                <div style={{width:'100px',height:'2px',background:'linear-gradient(90deg, transparent, #C1634A, transparent)',margin:'45px 0'}}></div>
                <div style={{fontSize:'34px',fontWeight:'600',color:'#6B4423',letterSpacing:'3px'}}>Guia Personalizado</div>
                <div style={{fontSize:'16px',color:'#C1634A',fontWeight:'500',letterSpacing:'5px',marginTop:'10px',marginBottom:'50px'}}>PLANO ALIMENTAR</div>
                <div style={{background:'white',border:'2px solid #D2B48C',borderRadius:'25px',padding:'40px 80px',textAlign:'center',boxShadow:'0 15px 50px rgba(0,0,0,0.08)'}}>
                  <div style={{fontSize:'10px',color:'#8B4513',letterSpacing:'3px',marginBottom:'10px'}}>PREPARADO EXCLUSIVAMENTE PARA</div>
                  <div style={{fontSize:'36px',fontWeight:'600',color:'#6B4423',marginBottom:'25px'}}>{dados.nome}</div>
                  <div style={{display:'flex',gap:'35px',justifyContent:'center',alignItems:'center',marginBottom:'20px'}}>
                    <div style={{textAlign:'center'}}><div style={{fontSize:'9px',color:'#8B4513',letterSpacing:'2px',marginBottom:'5px'}}>PESO ACTUAL</div><div style={{fontSize:'32px',color:'#A0422A',fontWeight:'700'}}>{dados.peso_actual} kg</div></div>
                    <div style={{color:'#6B8E23',fontSize:'36px'}}>→</div>
                    <div style={{textAlign:'center'}}><div style={{fontSize:'9px',color:'#8B4513',letterSpacing:'2px',marginBottom:'5px'}}>META</div><div style={{fontSize:'32px',color:'#A0422A',fontWeight:'700'}}>{dados.peso_meta} kg</div></div>
                  </div>
                  <div style={{fontSize:'13px',color:'#8B4513'}}>Início: {formatarData(dados.data_inicio)}</div>
                </div>
              </div>
              <div style={{background:'#6B4423',padding:'25px 50px',display:'flex',justifyContent:'space-between'}}><div style={{color:'rgba(255,255,255,0.95)',fontSize:'11px'}}><div style={{fontWeight:'600',marginBottom:'2px'}}>Vivianne Saraiva</div><div style={{opacity:0.85}}>Precision Nutrition Level 1 Coach</div></div><div style={{color:'rgba(255,255,255,0.95)',fontSize:'11px',textAlign:'right'}}><div style={{marginBottom:'2px'}}>vivianne.saraiva@outlook.com</div><div style={{opacity:0.85}}>WhatsApp: +258 84 524 3875</div></div></div>
            </div>

            {/* PÁGINA 2 - BEM-VINDA */}
            <div ref={el => pagesRef.current[1] = el} className="pdf-page" style={{...PAGE, padding:'45px'}}>
              <div style={HEADER}><div style={{display:'flex',alignItems:'center',gap:'12px'}}><div style={LOGO}>V</div><span style={{fontWeight:'600',fontSize:'16px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div><div style={{fontSize:'12px',color:'#8B4513',fontWeight:'500'}}>{faseConfig.nome}</div></div>
              <div style={TITLE}>👋 Bem-vinda à Tua Jornada</div>
              <div style={{...CARD, padding:'25px'}}><p style={{fontSize:'14px',lineHeight:'1.9',margin:0}}><strong>{dados.nome}</strong>, este guia foi criado especialmente para ti, com base nas tuas respostas, objectivos e estilo de vida. Cada porção, cada recomendação, foi calculada para o teu corpo e para onde queres chegar.</p></div>
              <div style={{...TITLE,marginTop:'30px'}}>🔥 {faseConfig.nome}</div>
              <div style={{...CARD, padding:'25px'}}><span style={{display:'inline-block',padding:'6px 18px',background:'#F5F0E8',borderRadius:'20px',fontSize:'11px',marginBottom:'15px'}}>Duração: {faseConfig.duracao}</span><p style={{fontSize:'14px',lineHeight:'1.8',margin:0}}>{faseConfig.descricao}</p></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginTop:'25px'}}><div style={{...CARD,padding:'25px'}}><div style={{fontSize:'10px',color:'#C1634A',letterSpacing:'2px',marginBottom:'10px'}}>ABORDAGEM NUTRICIONAL</div><div style={{fontSize:'24px',fontWeight:'600',color:'#A0422A',textTransform:'capitalize'}}>{dados.abordagem?.replace('_', ' ')}</div></div><div style={{...CARD,padding:'25px'}}><div style={{fontSize:'10px',color:'#C1634A',letterSpacing:'2px',marginBottom:'10px'}}>META SEMANAL</div><div style={{fontSize:'24px',fontWeight:'600',color:'#6B8E23'}}>-0.5 a -1.0 kg</div></div></div>
              <div style={FOOTER}><span>Documento exclusivo de {dados.nome}</span><span>Página 2 de 10</span></div>
            </div>

            {/* PÁGINA 3 - PORÇÕES */}
            <div ref={el => pagesRef.current[2] = el} className="pdf-page" style={{...PAGE, padding:'45px'}}>
              <div style={HEADER}><div style={{display:'flex',alignItems:'center',gap:'12px'}}><div style={LOGO}>V</div><span style={{fontWeight:'600',fontSize:'16px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div><div style={{fontSize:'12px',color:'#8B4513',fontWeight:'500'}}>{faseConfig.nome}</div></div>
              <div style={TITLE}>🍽️ As Tuas Porções Diárias</div>
              <p style={{fontSize:'13px',color:'#8B4513',marginBottom:'25px'}}>Usa o Método da Mão para medir — simples, prático e sempre contigo.</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'18px',marginBottom:'25px'}}>
                <div style={{background:'linear-gradient(135deg, #FFEBEE, #FFCDD2)',border:'3px solid #E57373',borderRadius:'18px',padding:'30px 20px',textAlign:'center'}}><div style={{fontSize:'16px',fontWeight:'600',color:'#C62828',marginBottom:'12px'}}>Proteína</div><div style={{fontSize:'60px',fontWeight:'700',color:'#C62828',lineHeight:1}}>{dados.porcoes_proteina}</div><div style={{fontSize:'12px',color:'#8B4513',marginTop:'10px'}}>palmas/dia</div></div>
                <div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',border:'3px solid #64B5F6',borderRadius:'18px',padding:'30px 20px',textAlign:'center'}}><div style={{fontSize:'16px',fontWeight:'600',color:'#1565C0',marginBottom:'12px'}}>Hidratos</div><div style={{fontSize:'60px',fontWeight:'700',color:'#1565C0',lineHeight:1}}>{dados.porcoes_hidratos}</div><div style={{fontSize:'12px',color:'#8B4513',marginTop:'10px'}}>mãos/dia</div></div>
                <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'3px solid #FFD54F',borderRadius:'18px',padding:'30px 20px',textAlign:'center'}}><div style={{fontSize:'16px',fontWeight:'600',color:'#F57F17',marginBottom:'12px'}}>Gordura</div><div style={{fontSize:'60px',fontWeight:'700',color:'#F57F17',lineHeight:1}}>{dados.porcoes_gordura}</div><div style={{fontSize:'12px',color:'#8B4513',marginTop:'10px'}}>polegares/dia</div></div>
              </div>
              <div style={{background:'linear-gradient(135deg, #E8F5E9, #C8E6C9)',border:'3px solid #81C784',borderRadius:'18px',padding:'28px',textAlign:'center',marginBottom:'30px'}}><div style={{fontSize:'16px',fontWeight:'600',color:'#2E7D32',marginBottom:'10px'}}>🥬 Vegetais & Legumes</div><div style={{fontSize:'42px',fontWeight:'700',color:'#2E7D32'}}>À VONTADE</div><div style={{fontSize:'12px',color:'#2E7D32',marginTop:'10px'}}>Quanto mais cores, melhor!</div></div>
              <div style={{...TITLE,fontSize:'18px',marginBottom:'18px'}}>📊 Os Teus Macros Diários</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'15px'}}><div style={{...CARD,textAlign:'center',padding:'22px'}}><div style={{fontSize:'22px',marginBottom:'10px'}}>🔥</div><div style={{fontSize:'30px',fontWeight:'700',color:'#C1634A'}}>{dados.calorias}</div><div style={{fontSize:'11px',color:'#8B4513',marginTop:'6px'}}>Calorias</div></div><div style={{...CARD,textAlign:'center',padding:'22px'}}><div style={{fontSize:'22px',marginBottom:'10px'}}>🥩</div><div style={{fontSize:'30px',fontWeight:'700',color:'#C62828'}}>{dados.proteina_g}g</div><div style={{fontSize:'11px',color:'#8B4513',marginTop:'6px'}}>Proteína</div></div><div style={{...CARD,textAlign:'center',padding:'22px'}}><div style={{fontSize:'22px',marginBottom:'10px'}}>🍚</div><div style={{fontSize:'30px',fontWeight:'700',color:'#1565C0'}}>{dados.carboidratos_g}g</div><div style={{fontSize:'11px',color:'#8B4513',marginTop:'6px'}}>Hidratos</div></div><div style={{...CARD,textAlign:'center',padding:'22px'}}><div style={{fontSize:'22px',marginBottom:'10px'}}>🥑</div><div style={{fontSize:'30px',fontWeight:'700',color:'#F57F17'}}>{dados.gordura_g}g</div><div style={{fontSize:'11px',color:'#8B4513',marginTop:'6px'}}>Gordura</div></div></div>
              <div style={FOOTER}><span>Documento exclusivo de {dados.nome}</span><span>Página 3 de 10</span></div>
            </div>

            {/* PÁGINA 4 - MÉTODO DA MÃO */}
            <div ref={el => pagesRef.current[3] = el} className="pdf-page" style={{...PAGE, padding:'45px'}}>
              <div style={HEADER}><div style={{display:'flex',alignItems:'center',gap:'12px'}}><div style={LOGO}>V</div><span style={{fontWeight:'600',fontSize:'16px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div></div>
              <div style={TITLE}>✋ O Método da Mão</div>
              <p style={{fontSize:'14px',color:'#8B4513',marginBottom:'35px',textAlign:'center',fontStyle:'italic'}}>A tua mão é proporcional ao teu corpo — mãos maiores = corpo maior = mais comida.</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'25px'}}>
                <div style={{background:'linear-gradient(135deg, #FFEBEE, #FFCDD2)',border:'3px solid #E57373',borderRadius:'18px',padding:'30px'}}><div style={{fontWeight:'600',color:'#C62828',marginBottom:'15px',fontSize:'18px'}}>🖐️ A Palma — PROTEÍNA</div><div style={{color:'#C62828',fontWeight:'700',fontSize:'24px',marginBottom:'15px'}}>~{dados.tamanho_palma}g de proteína</div><p style={{fontSize:'13px',color:'#6B4423',marginBottom:'10px',margin:0}}>Tamanho e espessura da tua palma (sem dedos)</p><p style={{fontSize:'12px',color:'#8B4513',fontStyle:'italic',margin:'10px 0 0'}}>Ex: 1 bife, 1 peito de frango</p></div>
                <div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',border:'3px solid #64B5F6',borderRadius:'18px',padding:'30px'}}><div style={{fontWeight:'600',color:'#1565C0',marginBottom:'15px',fontSize:'18px'}}>🤲 A Mão em Concha — HIDRATOS</div><div style={{color:'#1565C0',fontWeight:'700',fontSize:'24px',marginBottom:'15px'}}>~{dados.tamanho_mao}g de hidratos</div><p style={{fontSize:'13px',color:'#6B4423',marginBottom:'10px',margin:0}}>O que cabe na tua mão em concha</p><p style={{fontSize:'12px',color:'#8B4513',fontStyle:'italic',margin:'10px 0 0'}}>Ex: punhado de arroz, batata-doce</p></div>
                <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'3px solid #FFD54F',borderRadius:'18px',padding:'30px'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'15px',fontSize:'18px'}}>👍 O Polegar — GORDURA</div><div style={{color:'#F57F17',fontWeight:'700',fontSize:'24px',marginBottom:'15px'}}>~{dados.tamanho_polegar}g de gordura</div><p style={{fontSize:'13px',color:'#6B4423',marginBottom:'10px',margin:0}}>Tamanho do teu polegar inteiro</p><p style={{fontSize:'12px',color:'#8B4513',fontStyle:'italic',margin:'10px 0 0'}}>Ex: 1 colher azeite, nozes</p></div>
                <div style={{background:'linear-gradient(135deg, #E8F5E9, #C8E6C9)',border:'3px solid #81C784',borderRadius:'18px',padding:'30px'}}><div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'15px',fontSize:'18px'}}>✊ O Punho — VEGETAIS</div><div style={{color:'#2E7D32',fontWeight:'700',fontSize:'24px',marginBottom:'15px'}}>~100g de vegetais</div><p style={{fontSize:'13px',color:'#6B4423',marginBottom:'10px',margin:0}}>Tamanho do teu punho fechado</p><p style={{fontSize:'12px',color:'#2E7D32',fontWeight:'600',margin:'10px 0 0'}}>Mas lembra-te: À VONTADE!</p></div>
              </div>
              <div style={FOOTER}><span>Documento exclusivo de {dados.nome}</span><span>Página 4 de 10</span></div>
            </div>

            {/* PÁGINA 5 - PROTEÍNAS */}
            <div ref={el => pagesRef.current[4] = el} className="pdf-page" style={{...PAGE, padding:'45px'}}>
              <div style={HEADER}><div style={{display:'flex',alignItems:'center',gap:'12px'}}><div style={LOGO}>V</div><span style={{fontWeight:'600',fontSize:'16px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div></div>
              <div style={TITLE}>🥩 Proteínas Saudáveis</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}><div style={{...CARD,padding:'25px'}}><div style={{fontWeight:'600',color:'#C1634A',marginBottom:'18px',fontSize:'16px',borderBottom:'2px solid #D2B48C',paddingBottom:'10px'}}>Carnes Vermelhas (magras)</div><p style={{fontSize:'14px',lineHeight:'2.2',margin:0}}>Bife de vaca • Carne moída magra • Lombo de porco • Cabrito • Borrego • Fígado</p></div><div style={{...CARD,padding:'25px'}}><div style={{fontWeight:'600',color:'#C1634A',marginBottom:'18px',fontSize:'16px',borderBottom:'2px solid #D2B48C',paddingBottom:'10px'}}>Aves</div><p style={{fontSize:'14px',lineHeight:'2.2',margin:0}}>Peito de frango • Coxa de frango (sem pele) • Peru • Pato (sem pele) • Codorniz</p></div><div style={{...CARD,padding:'25px'}}><div style={{fontWeight:'600',color:'#C1634A',marginBottom:'18px',fontSize:'16px',borderBottom:'2px solid #D2B48C',paddingBottom:'10px'}}>Peixes & Mariscos</div><p style={{fontSize:'14px',lineHeight:'2.2',margin:0}}>Salmão • Atum • Sardinha • Carapau • Pescada • Tilápia • Camarão • Lulas</p></div><div style={{...CARD,padding:'25px'}}><div style={{fontWeight:'600',color:'#C1634A',marginBottom:'18px',fontSize:'16px',borderBottom:'2px solid #D2B48C',paddingBottom:'10px'}}>Ovos & Lacticínios</div><p style={{fontSize:'14px',lineHeight:'2.2',margin:0}}>Ovos inteiros • Queijo fresco • Iogurte grego natural • Requeijão • Queijo cottage</p></div></div>
              <div style={FOOTER}><span>Documento exclusivo de {dados.nome}</span><span>Página 5 de 10</span></div>
            </div>

            {/* PÁGINA 6 - HIDRATOS E GORDURAS */}
            <div ref={el => pagesRef.current[5] = el} className="pdf-page" style={{...PAGE, padding:'45px'}}>
              <div style={HEADER}><div style={{display:'flex',alignItems:'center',gap:'12px'}}><div style={LOGO}>V</div><span style={{fontWeight:'600',fontSize:'16px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div></div>
              <div style={TITLE}>🍚 Hidratos Saudáveis & 🥑 Gorduras</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px'}}><div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',border:'2px solid #64B5F6',borderRadius:'16px',padding:'25px'}}><div style={{fontWeight:'600',color:'#1565C0',marginBottom:'15px',fontSize:'15px'}}>Tubérculos & Grãos</div><p style={{fontSize:'13px',lineHeight:'2',margin:0}}>Batata-doce • Mandioca • Inhame • Arroz integral • Quinoa • Aveia</p></div><div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',border:'2px solid #64B5F6',borderRadius:'16px',padding:'25px'}}><div style={{fontWeight:'600',color:'#1565C0',marginBottom:'15px',fontSize:'15px'}}>Frutas (baixo IG)</div><p style={{fontSize:'13px',lineHeight:'2',margin:0}}>Frutos vermelhos • Maçã verde • Pera • Laranja • Toranja • Kiwi</p></div></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px'}}><div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'2px solid #FFD54F',borderRadius:'16px',padding:'25px'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'15px',fontSize:'15px'}}>Óleos & Manteigas</div><p style={{fontSize:'13px',lineHeight:'2',margin:0}}>Azeite extra-virgem • Óleo de coco • Manteiga • Ghee</p></div><div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'2px solid #FFD54F',borderRadius:'16px',padding:'25px'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'15px',fontSize:'15px'}}>Frutos Secos & Sementes</div><p style={{fontSize:'13px',lineHeight:'2',margin:0}}>Amêndoas • Nozes • Cajus • Sementes de chia • Linhaça</p></div></div>
              <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'2px solid #FFD54F',borderRadius:'16px',padding:'25px'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'15px',fontSize:'15px'}}>Outras Fontes de Gordura Saudável</div><p style={{fontSize:'13px',lineHeight:'2',margin:0}}>Abacate • Azeitonas • Coco • Chocolate negro (+70%) • Gema de ovo</p></div>
              <div style={FOOTER}><span>Documento exclusivo de {dados.nome}</span><span>Página 6 de 10</span></div>
            </div>

            {/* PÁGINA 7 - VEGETAIS */}
            <div ref={el => pagesRef.current[6] = el} className="pdf-page" style={{...PAGE, padding:'45px'}}>
              <div style={HEADER}><div style={{display:'flex',alignItems:'center',gap:'12px'}}><div style={LOGO}>V</div><span style={{fontWeight:'600',fontSize:'16px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div></div>
              <div style={TITLE}>🥬 Vegetais — Come o Arco-Íris!</div>
              <p style={{fontSize:'13px',color:'#8B4513',marginBottom:'25px',textAlign:'center'}}>Cada cor representa diferentes nutrientes. Inclui pelo menos 3 cores por refeição!</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'18px'}}><div style={{...CARD,borderLeft:'6px solid #4CAF50',background:'linear-gradient(135deg, #F1F8E9, #DCEDC8)',padding:'22px'}}><div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'12px',fontSize:'15px'}}>🟢 Verdes</div><p style={{fontSize:'13px',lineHeight:'1.8',margin:0}}>Espinafre, Couve, Brócolos, Alface, Rúcula, Pepino, Abobrinha</p></div><div style={{...CARD,borderLeft:'6px solid #F44336',background:'linear-gradient(135deg, #FFEBEE, #FFCDD2)',padding:'22px'}}><div style={{fontWeight:'600',color:'#C62828',marginBottom:'12px',fontSize:'15px'}}>🔴 Vermelhos</div><p style={{fontSize:'13px',lineHeight:'1.8',margin:0}}>Tomate, Pimento vermelho, Beterraba, Rabanete</p></div><div style={{...CARD,borderLeft:'6px solid #FF9800',background:'linear-gradient(135deg, #FFF3E0, #FFE0B2)',padding:'22px'}}><div style={{fontWeight:'600',color:'#E65100',marginBottom:'12px',fontSize:'15px'}}>🟠 Laranjas</div><p style={{fontSize:'13px',lineHeight:'1.8',margin:0}}>Cenoura, Abóbora, Pimento laranja</p></div><div style={{...CARD,borderLeft:'6px solid #9E9E9E',background:'linear-gradient(135deg, #FAFAFA, #F5F5F5)',padding:'22px'}}><div style={{fontWeight:'600',color:'#616161',marginBottom:'12px',fontSize:'15px'}}>⚪ Brancos</div><p style={{fontSize:'13px',lineHeight:'1.8',margin:0}}>Couve-flor, Cogumelos, Alho, Cebola, Nabo</p></div><div style={{...CARD,borderLeft:'6px solid #9C27B0',background:'linear-gradient(135deg, #F3E5F5, #E1BEE7)',padding:'22px',gridColumn:'span 2'}}><div style={{fontWeight:'600',color:'#6A1B9A',marginBottom:'12px',fontSize:'15px'}}>🟣 Roxos</div><p style={{fontSize:'13px',lineHeight:'1.8',margin:0}}>Beringela, Couve roxa, Cebola roxa</p></div></div>
              <div style={FOOTER}><span>Documento exclusivo de {dados.nome}</span><span>Página 7 de 10</span></div>
            </div>

            {/* PÁGINA 8 - LISTA DE COMPRAS */}
            <div ref={el => pagesRef.current[7] = el} className="pdf-page" style={{...PAGE, padding:'45px'}}>
              <div style={HEADER}><div style={{display:'flex',alignItems:'center',gap:'12px'}}><div style={LOGO}>V</div><span style={{fontWeight:'600',fontSize:'16px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div></div>
              <div style={TITLE}>🛒 Lista de Compras Semanal</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}><div style={{...CARD,padding:'25px'}}><div style={{fontWeight:'600',color:'#C62828',marginBottom:'18px',fontSize:'16px',borderBottom:'2px solid #E57373',paddingBottom:'10px'}}>🥩 Proteínas</div><div style={{fontSize:'14px',lineHeight:'2.5'}}>☐ Peito de frango (1kg)<br/>☐ Ovos (2 dúzias)<br/>☐ Peixe fresco (500g)<br/>☐ Carne moída magra (500g)</div></div><div style={{...CARD,padding:'25px'}}><div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'18px',fontSize:'16px',borderBottom:'2px solid #81C784',paddingBottom:'10px'}}>🥬 Vegetais</div><div style={{fontSize:'14px',lineHeight:'2.5'}}>☐ Espinafre/Couve<br/>☐ Brócolos<br/>☐ Tomate<br/>☐ Pepino<br/>☐ Pimentos<br/>☐ Cebola e Alho</div></div><div style={{...CARD,padding:'25px'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'18px',fontSize:'16px',borderBottom:'2px solid #FFD54F',paddingBottom:'10px'}}>🥑 Gorduras</div><div style={{fontSize:'14px',lineHeight:'2.5'}}>☐ Azeite extra-virgem<br/>☐ Abacate (2-3)<br/>☐ Manteiga<br/>☐ Amêndoas/Nozes</div></div><div style={{...CARD,padding:'25px'}}><div style={{fontWeight:'600',color:'#8B4513',marginBottom:'18px',fontSize:'16px',borderBottom:'2px solid #D2B48C',paddingBottom:'10px'}}>🧂 Outros</div><div style={{fontSize:'14px',lineHeight:'2.5'}}>☐ Sal e pimenta<br/>☐ Ervas frescas<br/>☐ Limões<br/>☐ Chá/Café</div></div></div>
              <div style={FOOTER}><span>Documento exclusivo de {dados.nome}</span><span>Página 8 de 10</span></div>
            </div>

            {/* PÁGINA 9 - REGRAS */}
            <div ref={el => pagesRef.current[8] = el} className="pdf-page" style={{...PAGE, padding:'45px'}}>
              <div style={HEADER}><div style={{display:'flex',alignItems:'center',gap:'12px'}}><div style={LOGO}>V</div><span style={{fontWeight:'600',fontSize:'16px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div></div>
              <div style={TITLE}>📋 Regras da {faseConfig.nome}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px'}}><div style={{background:'linear-gradient(135deg, #E8F5E9, #C8E6C9)',border:'3px solid #81C784',borderRadius:'16px',padding:'28px'}}><div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'18px',fontSize:'16px'}}>✓ PRIORIZAR</div><div style={{fontSize:'13px',lineHeight:'2.2'}}>{faseConfig.priorizar.map((item, i) => <div key={i}>✓ {item}</div>)}</div></div><div style={{background:'linear-gradient(135deg, #FFEBEE, #FFCDD2)',border:'3px solid #E57373',borderRadius:'16px',padding:'28px'}}><div style={{fontWeight:'600',color:'#C62828',marginBottom:'18px',fontSize:'16px'}}>✗ EVITAR</div><div style={{fontSize:'13px',lineHeight:'2.2'}}>{faseConfig.evitar.map((item, i) => <div key={i}>✗ {item}</div>)}</div></div></div>
              <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'3px solid #FFD54F',borderRadius:'16px',padding:'28px'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'18px',fontSize:'16px'}}>💡 DICAS PARA O SUCESSO</div><div style={{fontSize:'13px',lineHeight:'2.2'}}>{faseConfig.dicas.map((item, i) => <div key={i}>• {item}</div>)}</div></div>
              <div style={FOOTER}><span>Documento exclusivo de {dados.nome}</span><span>Página 9 de 10</span></div>
            </div>

            {/* PÁGINA 10 - FINAL */}
            <div ref={el => pagesRef.current[9] = el} className="pdf-page" style={{...PAGE, display:'flex', flexDirection:'column'}}>
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'50px'}}>
                <div style={{width:'100px',height:'100px',background:'linear-gradient(135deg, #C1634A, #8B4513)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'25px',boxShadow:'0 10px 30px rgba(193,99,74,0.4)'}}><span style={{color:'white',fontSize:'55px',fontWeight:'bold'}}>V</span></div>
                <div style={{fontSize:'48px',fontWeight:'700',color:'#A0422A',letterSpacing:'12px',marginBottom:'60px'}}>VITALIS</div>
                <div style={{maxWidth:'420px',textAlign:'center',padding:'45px',background:'white',borderRadius:'25px',boxShadow:'0 15px 50px rgba(0,0,0,0.1)',marginBottom:'60px'}}><div style={{fontSize:'60px',color:'#D2B48C',marginBottom:'15px',lineHeight:'0.5'}}>"</div><p style={{fontSize:'26px',color:'#6B4423',fontStyle:'italic',lineHeight:'1.6',margin:0}}>Quando o excesso cai, o corpo responde.</p></div>
                <div style={{textAlign:'center'}}><div style={{fontSize:'11px',color:'#8B4513',letterSpacing:'4px',marginBottom:'15px'}}>CRIADO EXCLUSIVAMENTE PARA</div><div style={{fontSize:'38px',fontWeight:'600',color:'#6B4423'}}>{dados.nome}</div></div>
              </div>
              <div style={{background:'#6B4423',padding:'25px 50px',display:'flex',justifyContent:'space-between'}}><div style={{color:'rgba(255,255,255,0.95)',fontSize:'11px'}}><div style={{fontWeight:'600',marginBottom:'2px'}}>Vivianne Saraiva</div><div style={{opacity:0.85}}>Precision Nutrition Level 1 Coach</div></div><div style={{color:'rgba(255,255,255,0.95)',fontSize:'11px',textAlign:'right'}}><div style={{marginBottom:'2px'}}>vivianne.saraiva@outlook.com</div><div style={{opacity:0.85}}>WhatsApp: +258 84 524 3875</div></div></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
