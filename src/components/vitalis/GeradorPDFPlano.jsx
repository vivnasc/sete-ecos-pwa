// VITALIS - GERADOR PDF (html2pdf.js)
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';

const FASES_CONFIG = {
  inducao: { nome: 'Fase 1: Indução', duracao: '3-4 semanas', descricao: 'A fase de arranque onde o corpo entra em modo de queima de gordura.', priorizar: ['Proteína em todas as refeições', 'Vegetais em abundância', 'Gorduras saudáveis', 'Água (mínimo 2L/dia)', 'Dormir 7-8h'], evitar: ['Açúcar e adoçantes', 'Grãos e cereais', 'Frutas doces', 'Leguminosas', 'Álcool'], dicas: ['Prepara refeições ao domingo', 'Tem snacks saudáveis à mão', 'Podes sentir "keto flu" — é normal', 'Pesa-te às sextas, em jejum'] },
  estabilizacao: { nome: 'Fase 2: Estabilização', duracao: '6-8 semanas', descricao: 'Reintrodução gradual de hidratos complexos.', priorizar: ['Manter proteína elevada', 'Hidratos complexos', 'Fruta baixo IG', 'Leguminosas moderação'], evitar: ['Açúcar refinado', 'Farinhas brancas', 'Processados', 'Bebidas açucaradas'], dicas: ['Introduz um alimento de cada vez', 'Observa o corpo', 'Mantém diário alimentar'] },
  reeducacao: { nome: 'Fase 3: Reeducação', duracao: '6-8 semanas', descricao: 'Aprender a comer de forma equilibrada.', priorizar: ['Equilíbrio nas refeições', 'Variedade alimentar', 'Comer com atenção', 'Flexibilidade'], evitar: ['Restrições extremas', 'Mentalidade de dieta', 'Comer emocional'], dicas: ['Escuta o corpo', 'Permite flexibilidade', 'Foca em como te sentes'] },
  manutencao: { nome: 'Fase 4: Manutenção', duracao: 'Contínua', descricao: 'Manter resultados com estilo de vida equilibrado.', priorizar: ['Consistência', 'Movimento regular', 'Sono qualidade', 'Gestão stress'], evitar: ['Velhos hábitos', 'Ignorar sinais', 'Perder rotina'], dicas: ['Pesagem semanal', 'Ajusta conforme necessário', 'Celebra vitórias'] }
};

export default function GeradorPDFPlano({ userId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const pdfRef = useRef(null);

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
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set({
        margin: 0, filename: `Vitalis_Plano_${dados.nome.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, pagebreak: { mode: ['css', 'legacy'], before: '.page-break' }
      }).from(pdfRef.current).save();
      setTimeout(onClose, 500);
    } catch (err) { setErro('Erro ao gerar PDF'); } finally { setGerando(false); }
  };

  const faseConfig = FASES_CONFIG[dados?.fase] || FASES_CONFIG.inducao;
  const ps = { width:'210mm', minHeight:'297mm', background:'#FDF8F3', fontFamily:'Segoe UI, sans-serif', fontSize:'11px', color:'#6B4423', position:'relative', boxSizing:'border-box', pageBreakAfter:'always', pageBreakInside:'avoid' };
  const hs = { display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'2px solid #D2B48C', paddingBottom:'12px', marginBottom:'25px' };
  const ls = { width:'35px', height:'35px', background:'linear-gradient(135deg, #C1634A, #8B4513)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'18px', fontWeight:'bold' };
  const ts = { fontSize:'22px', fontWeight:'600', color:'#6B4423', marginBottom:'20px' };
  const cs = { background:'white', border:'1px solid #D2B48C', borderRadius:'12px', padding:'20px', marginBottom:'15px' };
  const fs = { position:'absolute', bottom:'20px', left:'40px', right:'40px', display:'flex', justifyContent:'space-between', fontSize:'9px', color:'#8B4513', borderTop:'1px solid #D2B48C', paddingTop:'10px' };

  if (loading) return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}><div style={{background:'white',borderRadius:'16px',padding:'32px',textAlign:'center'}}><div style={{width:'48px',height:'48px',border:'4px solid #f3f3f3',borderTop:'4px solid #C1634A',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto'}}></div><p style={{marginTop:'16px',color:'#666'}}>A preparar...</p><style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style></div></div>;
  if (erro) return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}><div style={{background:'white',borderRadius:'16px',padding:'32px',textAlign:'center'}}><p style={{color:'#C62828',marginBottom:'16px'}}>{erro}</p><button onClick={onClose} style={{padding:'8px 24px',background:'#eee',border:'none',borderRadius:'8px',cursor:'pointer'}}>Fechar</button></div></div>;

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,overflow:'auto',padding:'20px'}}>
      <div style={{background:'white',borderRadius:'16px',maxWidth:'900px',width:'100%',maxHeight:'95vh',overflow:'auto'}}>
        <div style={{position:'sticky',top:0,background:'white',borderBottom:'1px solid #eee',padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:10}}>
          <div><h2 style={{fontSize:'18px',fontWeight:'bold',color:'#333',margin:0}}>Gerar PDF</h2><p style={{fontSize:'13px',color:'#666',margin:'4px 0 0'}}>10 páginas • {dados.nome}</p></div>
          <div style={{display:'flex',gap:'12px'}}>
            <button onClick={onClose} style={{padding:'10px 20px',background:'#f5f5f5',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px'}}>Cancelar</button>
            <button onClick={gerarPDF} disabled={gerando} style={{padding:'10px 24px',background:'linear-gradient(135deg, #C1634A, #8B4513)',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px',fontWeight:'600',opacity:gerando?0.7:1}}>{gerando ? '⏳ A gerar...' : '📥 Descarregar PDF'}</button>
          </div>
        </div>
        <div style={{padding:'24px',background:'#f5f5f5'}}>
          <div style={{transform:'scale(0.4)',transformOrigin:'top center',width:'250%',marginLeft:'-75%'}}>
            <div ref={pdfRef} style={{background:'white',width:'210mm'}}>
              {/* P1 CAPA */}
              <div style={{...ps,display:'flex',flexDirection:'column'}}>
                <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'50px'}}>
                  <div style={{width:'90px',height:'90px',background:'linear-gradient(135deg, #C1634A, #8B4513)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'15px',boxShadow:'0 8px 25px rgba(193,99,74,0.4)'}}><span style={{color:'white',fontSize:'48px',fontWeight:'bold'}}>V</span></div>
                  <div style={{fontSize:'42px',fontWeight:'700',color:'#A0422A',letterSpacing:'10px'}}>VITALIS</div>
                  <div style={{fontSize:'10px',color:'#8B4513',letterSpacing:'4px',marginTop:'5px'}}>A RAIZ DA TRANSFORMAÇÃO</div>
                  <div style={{width:'80px',height:'2px',background:'linear-gradient(90deg, transparent, #C1634A, transparent)',margin:'40px 0'}}></div>
                  <div style={{fontSize:'30px',fontWeight:'600',color:'#6B4423'}}>Guia Personalizado</div>
                  <div style={{fontSize:'14px',color:'#C1634A',fontWeight:'500',letterSpacing:'4px',marginTop:'8px',marginBottom:'45px'}}>PLANO ALIMENTAR</div>
                  <div style={{background:'white',border:'2px solid #D2B48C',borderRadius:'20px',padding:'35px 70px',textAlign:'center',boxShadow:'0 10px 40px rgba(0,0,0,0.08)'}}>
                    <div style={{fontSize:'9px',color:'#8B4513',letterSpacing:'2px',marginBottom:'8px'}}>PREPARADO EXCLUSIVAMENTE PARA</div>
                    <div style={{fontSize:'32px',fontWeight:'600',color:'#6B4423',marginBottom:'25px'}}>{dados.nome}</div>
                    <div style={{display:'flex',gap:'30px',justifyContent:'center',alignItems:'center',marginBottom:'20px'}}>
                      <div style={{textAlign:'center'}}><div style={{fontSize:'8px',color:'#8B4513',marginBottom:'4px'}}>PESO ACTUAL</div><div style={{fontSize:'28px',color:'#A0422A',fontWeight:'700'}}>{dados.peso_actual} kg</div></div>
                      <div style={{color:'#6B8E23',fontSize:'32px'}}>→</div>
                      <div style={{textAlign:'center'}}><div style={{fontSize:'8px',color:'#8B4513',marginBottom:'4px'}}>META</div><div style={{fontSize:'28px',color:'#A0422A',fontWeight:'700'}}>{dados.peso_meta} kg</div></div>
                    </div>
                    <div style={{fontSize:'11px',color:'#8B4513'}}>Início: {formatarData(dados.data_inicio)}</div>
                  </div>
                </div>
                <div style={{background:'#6B4423',padding:'22px 45px',display:'flex',justifyContent:'space-between'}}><div style={{color:'rgba(255,255,255,0.95)',fontSize:'10px'}}><div style={{fontWeight:'600'}}>Vivianne Saraiva</div><div>Precision Nutrition Coach</div></div><div style={{color:'rgba(255,255,255,0.95)',fontSize:'10px',textAlign:'right'}}><div>vivianne.saraiva@outlook.com</div><div>+258 84 524 3875</div></div></div>
              </div>
              {/* P2 BEM-VINDA */}
              <div className="page-break" style={{...ps,padding:'45px'}}>
                <div style={hs}><div style={{display:'flex',alignItems:'center',gap:'10px'}}><div style={ls}>V</div><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div><div style={{fontSize:'11px',color:'#8B4513'}}>{faseConfig.nome}</div></div>
                <div style={ts}>👋 Bem-vinda à Tua Jornada</div>
                <div style={cs}><p style={{fontSize:'13px',lineHeight:'1.8'}}><strong>{dados.nome}</strong>, este guia foi criado especialmente para ti.</p></div>
                <div style={{...ts,marginTop:'25px'}}>🔥 {faseConfig.nome}</div>
                <div style={cs}><span style={{display:'inline-block',padding:'5px 15px',background:'#F5F0E8',borderRadius:'15px',fontSize:'10px',marginBottom:'12px'}}>Duração: {faseConfig.duracao}</span><p style={{fontSize:'13px',lineHeight:'1.7'}}>{faseConfig.descricao}</p></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginTop:'25px'}}><div style={cs}><div style={{fontSize:'9px',color:'#C1634A',letterSpacing:'1.5px',marginBottom:'8px'}}>ABORDAGEM</div><div style={{fontSize:'20px',fontWeight:'600',color:'#A0422A'}}>{dados.abordagem}</div></div><div style={cs}><div style={{fontSize:'9px',color:'#C1634A',letterSpacing:'1.5px',marginBottom:'8px'}}>META SEMANAL</div><div style={{fontSize:'20px',fontWeight:'600',color:'#6B8E23'}}>-0.5 a -1.0 kg</div></div></div>
                <div style={fs}><span>Documento exclusivo de {dados.nome}</span><span>Página 2 de 10</span></div>
              </div>
              {/* P3 PORÇÕES */}
              <div className="page-break" style={{...ps,padding:'45px'}}>
                <div style={hs}><div style={{display:'flex',alignItems:'center',gap:'10px'}}><div style={ls}>V</div><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div></div>
                <div style={ts}>🍽️ As Tuas Porções Diárias</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'15px',marginBottom:'25px'}}>
                  <div style={{background:'#FFEBEE',border:'2px solid #E57373',borderRadius:'14px',padding:'25px',textAlign:'center'}}><div style={{fontSize:'14px',fontWeight:'600',color:'#C62828',marginBottom:'10px'}}>Proteína</div><div style={{fontSize:'52px',fontWeight:'700',color:'#C62828'}}>{dados.porcoes_proteina}</div><div style={{fontSize:'11px',color:'#8B4513',marginTop:'8px'}}>palmas/dia</div></div>
                  <div style={{background:'#E3F2FD',border:'2px solid #64B5F6',borderRadius:'14px',padding:'25px',textAlign:'center'}}><div style={{fontSize:'14px',fontWeight:'600',color:'#1565C0',marginBottom:'10px'}}>Hidratos</div><div style={{fontSize:'52px',fontWeight:'700',color:'#1565C0'}}>{dados.porcoes_hidratos}</div><div style={{fontSize:'11px',color:'#8B4513',marginTop:'8px'}}>mãos/dia</div></div>
                  <div style={{background:'#FFF8E1',border:'2px solid #FFD54F',borderRadius:'14px',padding:'25px',textAlign:'center'}}><div style={{fontSize:'14px',fontWeight:'600',color:'#F57F17',marginBottom:'10px'}}>Gordura</div><div style={{fontSize:'52px',fontWeight:'700',color:'#F57F17'}}>{dados.porcoes_gordura}</div><div style={{fontSize:'11px',color:'#8B4513',marginTop:'8px'}}>polegares/dia</div></div>
                </div>
                <div style={{background:'#E8F5E9',border:'2px solid #81C784',borderRadius:'14px',padding:'25px',textAlign:'center',marginBottom:'30px'}}><div style={{fontSize:'14px',fontWeight:'600',color:'#2E7D32',marginBottom:'8px'}}>🥬 Vegetais</div><div style={{fontSize:'36px',fontWeight:'700',color:'#2E7D32'}}>À VONTADE</div></div>
                <div style={{...ts,fontSize:'18px'}}>📊 Macros Diários</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'12px'}}><div style={{...cs,textAlign:'center',padding:'18px'}}><div style={{fontSize:'18px',marginBottom:'8px'}}>🔥</div><div style={{fontSize:'26px',fontWeight:'700',color:'#C1634A'}}>{dados.calorias}</div><div style={{fontSize:'10px',marginTop:'4px'}}>Calorias</div></div><div style={{...cs,textAlign:'center',padding:'18px'}}><div style={{fontSize:'18px',marginBottom:'8px'}}>🥩</div><div style={{fontSize:'26px',fontWeight:'700',color:'#C62828'}}>{dados.proteina_g}g</div><div style={{fontSize:'10px',marginTop:'4px'}}>Proteína</div></div><div style={{...cs,textAlign:'center',padding:'18px'}}><div style={{fontSize:'18px',marginBottom:'8px'}}>🍚</div><div style={{fontSize:'26px',fontWeight:'700',color:'#1565C0'}}>{dados.carboidratos_g}g</div><div style={{fontSize:'10px',marginTop:'4px'}}>Hidratos</div></div><div style={{...cs,textAlign:'center',padding:'18px'}}><div style={{fontSize:'18px',marginBottom:'8px'}}>🥑</div><div style={{fontSize:'26px',fontWeight:'700',color:'#F57F17'}}>{dados.gordura_g}g</div><div style={{fontSize:'10px',marginTop:'4px'}}>Gordura</div></div></div>
                <div style={fs}><span>Documento exclusivo de {dados.nome}</span><span>Página 3 de 10</span></div>
              </div>
              {/* P4 MÉTODO MÃO */}
              <div className="page-break" style={{...ps,padding:'45px'}}>
                <div style={hs}><div style={{display:'flex',alignItems:'center',gap:'10px'}}><div style={ls}>V</div><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div></div>
                <div style={ts}>✋ O Método da Mão</div>
                <p style={{fontSize:'12px',color:'#8B4513',marginBottom:'30px',textAlign:'center',fontStyle:'italic'}}>A tua mão é proporcional ao teu corpo.</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
                  <div style={{background:'#FFEBEE',border:'2px solid #E57373',borderRadius:'14px',padding:'25px'}}><div style={{fontWeight:'600',color:'#C62828',marginBottom:'12px',fontSize:'16px'}}>🖐️ Palma — PROTEÍNA</div><div style={{color:'#C62828',fontWeight:'600',fontSize:'20px',marginBottom:'12px'}}>~{dados.tamanho_palma}g</div><p style={{fontSize:'12px'}}>Tamanho da palma (sem dedos)</p></div>
                  <div style={{background:'#E3F2FD',border:'2px solid #64B5F6',borderRadius:'14px',padding:'25px'}}><div style={{fontWeight:'600',color:'#1565C0',marginBottom:'12px',fontSize:'16px'}}>🤲 Mão Concha — HIDRATOS</div><div style={{color:'#1565C0',fontWeight:'600',fontSize:'20px',marginBottom:'12px'}}>~{dados.tamanho_mao}g</div><p style={{fontSize:'12px'}}>O que cabe na mão em concha</p></div>
                  <div style={{background:'#FFF8E1',border:'2px solid #FFD54F',borderRadius:'14px',padding:'25px'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'12px',fontSize:'16px'}}>👍 Polegar — GORDURA</div><div style={{color:'#F57F17',fontWeight:'600',fontSize:'20px',marginBottom:'12px'}}>~{dados.tamanho_polegar}g</div><p style={{fontSize:'12px'}}>Tamanho do polegar</p></div>
                  <div style={{background:'#E8F5E9',border:'2px solid #81C784',borderRadius:'14px',padding:'25px'}}><div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'12px',fontSize:'16px'}}>✊ Punho — VEGETAIS</div><div style={{color:'#2E7D32',fontWeight:'600',fontSize:'20px',marginBottom:'12px'}}>~100g</div><p style={{fontSize:'12px',fontWeight:'600'}}>À VONTADE!</p></div>
                </div>
                <div style={fs}><span>Documento exclusivo de {dados.nome}</span><span>Página 4 de 10</span></div>
              </div>
              {/* P5 PROTEÍNAS */}
              <div className="page-break" style={{...ps,padding:'45px'}}>
                <div style={hs}><div style={{display:'flex',alignItems:'center',gap:'10px'}}><div style={ls}>V</div><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div></div>
                <div style={ts}>🥩 Proteínas Saudáveis</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}><div style={cs}><div style={{fontWeight:'600',color:'#C1634A',marginBottom:'15px',fontSize:'15px'}}>Carnes Vermelhas</div><p style={{fontSize:'13px',lineHeight:'2'}}>Bife de vaca • Carne moída magra • Lombo porco • Cabrito • Borrego • Fígado</p></div><div style={cs}><div style={{fontWeight:'600',color:'#C1634A',marginBottom:'15px',fontSize:'15px'}}>Aves</div><p style={{fontSize:'13px',lineHeight:'2'}}>Peito frango • Coxa frango • Peru • Pato • Codorniz</p></div><div style={cs}><div style={{fontWeight:'600',color:'#C1634A',marginBottom:'15px',fontSize:'15px'}}>Peixes & Mariscos</div><p style={{fontSize:'13px',lineHeight:'2'}}>Salmão • Atum • Sardinha • Carapau • Pescada • Tilápia • Camarão • Lulas</p></div><div style={cs}><div style={{fontWeight:'600',color:'#C1634A',marginBottom:'15px',fontSize:'15px'}}>Ovos & Lacticínios</div><p style={{fontSize:'13px',lineHeight:'2'}}>Ovos inteiros • Queijo fresco • Iogurte grego • Requeijão</p></div></div>
                <div style={fs}><span>Documento exclusivo de {dados.nome}</span><span>Página 5 de 10</span></div>
              </div>
              {/* P6 HIDRATOS GORDURAS */}
              <div className="page-break" style={{...ps,padding:'45px'}}>
                <div style={hs}><div style={{display:'flex',alignItems:'center',gap:'10px'}}><div style={ls}>V</div><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div></div>
                <div style={ts}>🍚 Hidratos & 🥑 Gorduras</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px'}}><div style={{background:'#E3F2FD',border:'2px solid #64B5F6',borderRadius:'14px',padding:'22px'}}><div style={{fontWeight:'600',color:'#1565C0',marginBottom:'12px'}}>Tubérculos & Grãos</div><p style={{fontSize:'12px',lineHeight:'1.9'}}>Batata-doce • Mandioca • Inhame • Arroz integral • Quinoa • Aveia</p></div><div style={{background:'#E3F2FD',border:'2px solid #64B5F6',borderRadius:'14px',padding:'22px'}}><div style={{fontWeight:'600',color:'#1565C0',marginBottom:'12px'}}>Frutas (baixo IG)</div><p style={{fontSize:'12px',lineHeight:'1.9'}}>Frutos vermelhos • Maçã verde • Pera • Laranja • Kiwi</p></div></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}><div style={{background:'#FFF8E1',border:'2px solid #FFD54F',borderRadius:'14px',padding:'22px'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'12px'}}>Óleos & Manteigas</div><p style={{fontSize:'12px',lineHeight:'1.9'}}>Azeite extra-virgem • Óleo coco • Manteiga • Ghee</p></div><div style={{background:'#FFF8E1',border:'2px solid #FFD54F',borderRadius:'14px',padding:'22px'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'12px'}}>Frutos Secos</div><p style={{fontSize:'12px',lineHeight:'1.9'}}>Amêndoas • Nozes • Cajus • Chia • Linhaça • Abacate</p></div></div>
                <div style={fs}><span>Documento exclusivo de {dados.nome}</span><span>Página 6 de 10</span></div>
              </div>
              {/* P7 VEGETAIS */}
              <div className="page-break" style={{...ps,padding:'45px'}}>
                <div style={hs}><div style={{display:'flex',alignItems:'center',gap:'10px'}}><div style={ls}>V</div><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div></div>
                <div style={ts}>🥬 Vegetais — Come o Arco-Íris!</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'15px'}}><div style={{...cs,borderLeft:'5px solid #4CAF50',background:'#F1F8E9'}}><div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'10px'}}>🟢 Verdes</div><p style={{fontSize:'12px',lineHeight:'1.7'}}>Espinafre, Couve, Brócolos, Alface, Rúcula, Pepino</p></div><div style={{...cs,borderLeft:'5px solid #F44336',background:'#FFEBEE'}}><div style={{fontWeight:'600',color:'#C62828',marginBottom:'10px'}}>🔴 Vermelhos</div><p style={{fontSize:'12px',lineHeight:'1.7'}}>Tomate, Pimento vermelho, Beterraba</p></div><div style={{...cs,borderLeft:'5px solid #FF9800',background:'#FFF3E0'}}><div style={{fontWeight:'600',color:'#E65100',marginBottom:'10px'}}>🟠 Laranjas</div><p style={{fontSize:'12px',lineHeight:'1.7'}}>Cenoura, Abóbora, Pimento laranja</p></div><div style={{...cs,borderLeft:'5px solid #9E9E9E',background:'#FAFAFA'}}><div style={{fontWeight:'600',color:'#616161',marginBottom:'10px'}}>⚪ Brancos</div><p style={{fontSize:'12px',lineHeight:'1.7'}}>Couve-flor, Cogumelos, Alho, Cebola</p></div><div style={{...cs,borderLeft:'5px solid #9C27B0',background:'#F3E5F5',gridColumn:'span 2'}}><div style={{fontWeight:'600',color:'#6A1B9A',marginBottom:'10px'}}>🟣 Roxos</div><p style={{fontSize:'12px',lineHeight:'1.7'}}>Beringela, Couve roxa, Cebola roxa</p></div></div>
                <div style={fs}><span>Documento exclusivo de {dados.nome}</span><span>Página 7 de 10</span></div>
              </div>
              {/* P8 COMPRAS */}
              <div className="page-break" style={{...ps,padding:'45px'}}>
                <div style={hs}><div style={{display:'flex',alignItems:'center',gap:'10px'}}><div style={ls}>V</div><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div></div>
                <div style={ts}>🛒 Lista de Compras</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}><div style={cs}><div style={{fontWeight:'600',color:'#C62828',marginBottom:'15px'}}>🥩 Proteínas</div><div style={{fontSize:'13px',lineHeight:'2.2'}}>☐ Peito frango (1kg)<br/>☐ Ovos (2 dúzias)<br/>☐ Peixe fresco (500g)<br/>☐ Carne moída (500g)</div></div><div style={cs}><div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'15px'}}>🥬 Vegetais</div><div style={{fontSize:'13px',lineHeight:'2.2'}}>☐ Espinafre/Couve<br/>☐ Brócolos<br/>☐ Tomate<br/>☐ Pepino<br/>☐ Pimentos</div></div><div style={cs}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'15px'}}>🥑 Gorduras</div><div style={{fontSize:'13px',lineHeight:'2.2'}}>☐ Azeite extra-virgem<br/>☐ Abacate (2-3)<br/>☐ Manteiga<br/>☐ Amêndoas/Nozes</div></div><div style={cs}><div style={{fontWeight:'600',color:'#8B4513',marginBottom:'15px'}}>🧂 Outros</div><div style={{fontSize:'13px',lineHeight:'2.2'}}>☐ Sal e pimenta<br/>☐ Ervas frescas<br/>☐ Limões<br/>☐ Chá/Café</div></div></div>
                <div style={fs}><span>Documento exclusivo de {dados.nome}</span><span>Página 8 de 10</span></div>
              </div>
              {/* P9 REGRAS */}
              <div className="page-break" style={{...ps,padding:'45px'}}>
                <div style={hs}><div style={{display:'flex',alignItems:'center',gap:'10px'}}><div style={ls}>V</div><span style={{fontWeight:'600',fontSize:'14px',color:'#C1634A',letterSpacing:'2px'}}>VITALIS</span></div></div>
                <div style={ts}>📋 Regras da {faseConfig.nome}</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px'}}><div style={{background:'#E8F5E9',border:'2px solid #81C784',borderRadius:'14px',padding:'25px'}}><div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'15px'}}>✓ PRIORIZAR</div><div style={{fontSize:'12px',lineHeight:'2'}}>{faseConfig.priorizar.map((item, i) => <div key={i}>✓ {item}</div>)}</div></div><div style={{background:'#FFEBEE',border:'2px solid #E57373',borderRadius:'14px',padding:'25px'}}><div style={{fontWeight:'600',color:'#C62828',marginBottom:'15px'}}>✗ EVITAR</div><div style={{fontSize:'12px',lineHeight:'2'}}>{faseConfig.evitar.map((item, i) => <div key={i}>✗ {item}</div>)}</div></div></div>
                <div style={{background:'#FFF8E1',border:'2px solid #FFD54F',borderRadius:'14px',padding:'25px'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'15px'}}>💡 DICAS</div><div style={{fontSize:'12px',lineHeight:'2'}}>{faseConfig.dicas.map((item, i) => <div key={i}>• {item}</div>)}</div></div>
                <div style={fs}><span>Documento exclusivo de {dados.nome}</span><span>Página 9 de 10</span></div>
              </div>
              {/* P10 FINAL */}
              <div className="page-break" style={{...ps,display:'flex',flexDirection:'column',pageBreakAfter:'auto'}}>
                <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'50px'}}>
                  <div style={{width:'90px',height:'90px',background:'linear-gradient(135deg, #C1634A, #8B4513)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px'}}><span style={{color:'white',fontSize:'48px',fontWeight:'bold'}}>V</span></div>
                  <div style={{fontSize:'42px',fontWeight:'700',color:'#A0422A',letterSpacing:'10px',marginBottom:'50px'}}>VITALIS</div>
                  <div style={{maxWidth:'400px',textAlign:'center',padding:'40px',background:'white',borderRadius:'20px',boxShadow:'0 10px 40px rgba(0,0,0,0.08)',marginBottom:'50px'}}><div style={{fontSize:'50px',color:'#D2B48C',marginBottom:'10px',lineHeight:'0.5'}}>"</div><p style={{fontSize:'22px',color:'#6B4423',fontStyle:'italic',lineHeight:'1.6'}}>Quando o excesso cai, o corpo responde.</p></div>
                  <div style={{textAlign:'center'}}><div style={{fontSize:'10px',color:'#8B4513',letterSpacing:'3px',marginBottom:'12px'}}>CRIADO EXCLUSIVAMENTE PARA</div><div style={{fontSize:'32px',fontWeight:'600',color:'#6B4423'}}>{dados.nome}</div></div>
                </div>
                <div style={{background:'#6B4423',padding:'22px 45px',display:'flex',justifyContent:'space-between'}}><div style={{color:'rgba(255,255,255,0.95)',fontSize:'10px'}}><div style={{fontWeight:'600'}}>Vivianne Saraiva</div><div>Precision Nutrition Coach</div></div><div style={{color:'rgba(255,255,255,0.95)',fontSize:'10px',textAlign:'right'}}><div>vivianne.saraiva@outlook.com</div><div>+258 84 524 3875</div></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
