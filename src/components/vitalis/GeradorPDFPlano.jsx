// ============================================================
// VITALIS - GERADOR DE PDF DO PLANO ALIMENTAR
// ============================================================
// Usa html2pdf.js para gerar PDFs de alta qualidade
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';

// Configuração das fases
const FASES_CONFIG = {
  inducao: {
    nome: 'Fase 1: Indução',
    duracao: '3-4 semanas',
    descricao: 'A fase de arranque onde o corpo entra em modo de queima de gordura.',
    priorizar: ['Proteína em todas as refeições', 'Vegetais em abundância', 'Gorduras saudáveis', 'Água (mínimo 2L/dia)', 'Dormir 7-8 horas'],
    evitar: ['Açúcar e adoçantes', 'Pão, massa, arroz', 'Frutas doces', 'Leguminosas', 'Álcool'],
    dicas: ['Prepara refeições ao domingo', 'Tem snacks saudáveis à mão', 'Pesa-te às sextas de manhã']
  },
  estabilizacao: {
    nome: 'Fase 2: Estabilização',
    duracao: '6-8 semanas',
    descricao: 'Reintrodução gradual de hidratos complexos.',
    priorizar: ['Manter proteína elevada', 'Hidratos complexos', 'Fruta baixo IG'],
    evitar: ['Açúcar refinado', 'Farinhas brancas', 'Processados'],
    dicas: ['Introduz um alimento de cada vez', 'Observa como o corpo reage']
  },
  reeducacao: {
    nome: 'Fase 3: Reeducação',
    duracao: '6-8 semanas',
    descricao: 'Aprender a comer de forma equilibrada para a vida.',
    priorizar: ['Equilíbrio nas refeições', 'Variedade', 'Atenção plena'],
    evitar: ['Restrições extremas', 'Mentalidade de dieta'],
    dicas: ['Pratica a escuta do corpo', 'Permite-te flexibilidade']
  },
  manutencao: {
    nome: 'Fase 4: Manutenção',
    duracao: 'Contínua',
    descricao: 'Manter resultados com estilo de vida equilibrado.',
    priorizar: ['Consistência', 'Movimento regular', 'Sono de qualidade'],
    evitar: ['Velhos hábitos', 'Ignorar sinais do corpo'],
    dicas: ['Pesagem semanal', 'Ajusta conforme necessário']
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
  };

  const gerarPDF = async () => {
    setGerando(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      await html2pdf()
        .set({
          margin: 0,
          filename: `Vitalis_Plano_${dados.nome.replace(/\s+/g, '_')}_${dados.fase}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] }
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
  };

  const formatarData = (d) => new Date(d).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  const faseConfig = FASES_CONFIG[dados?.fase] || FASES_CONFIG.inducao;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">A preparar...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <p className="text-red-600 mb-4">{erro}</p>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold">Gerar PDF do Plano</h2>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button 
              onClick={gerarPDF} 
              disabled={gerando}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50"
            >
              {gerando ? 'A gerar...' : '📥 Descarregar PDF'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-gray-200">
          <div className="transform scale-50 origin-top-left" style={{width: '200%'}}>
            <div ref={pdfRef}>
              {/* ========== PÁGINA 1 - CAPA ========== */}
              <div style={{width:'210mm',minHeight:'297mm',background:'linear-gradient(180deg,#FDF8F3,#F5F0E8)',fontFamily:'Segoe UI,sans-serif',display:'flex',flexDirection:'column',pageBreakAfter:'always'}}>
                <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px'}}>
                  <div style={{width:'80px',height:'80px',background:'linear-gradient(135deg,#C1634A,#8B4513)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'15px'}}>
                    <span style={{color:'white',fontSize:'40px',fontWeight:'bold'}}>V</span>
                  </div>
                  <div style={{fontSize:'36px',fontWeight:'bold',color:'#A0422A',letterSpacing:'8px'}}>VITALIS</div>
                  <div style={{fontSize:'10px',color:'#8B4513',letterSpacing:'3px',marginTop:'5px'}}>A RAIZ DA TRANSFORMAÇÃO</div>
                  <div style={{width:'80px',height:'2px',background:'#C1634A',margin:'30px 0'}}></div>
                  <div style={{fontSize:'28px',fontWeight:'600',color:'#6B4423',marginBottom:'8px'}}>Guia Personalizado</div>
                  <div style={{fontSize:'14px',color:'#C1634A',letterSpacing:'3px',marginBottom:'40px'}}>PLANO ALIMENTAR</div>
                  <div style={{background:'white',border:'2px solid #D2B48C',borderRadius:'20px',padding:'30px 50px',textAlign:'center'}}>
                    <div style={{fontSize:'9px',color:'#8B4513',letterSpacing:'2px',marginBottom:'6px'}}>PREPARADO EXCLUSIVAMENTE PARA</div>
                    <div style={{fontSize:'28px',fontWeight:'600',color:'#6B4423',marginBottom:'18px'}}>{dados.nome}</div>
                    <div style={{display:'flex',gap:'20px',justifyContent:'center',alignItems:'center',marginBottom:'15px'}}>
                      <div><div style={{fontSize:'8px',color:'#8B4513'}}>PESO ACTUAL</div><div style={{fontSize:'22px',fontWeight:'bold',color:'#A0422A'}}>{dados.peso_actual} kg</div></div>
                      <div style={{color:'#6B8E23',fontSize:'24px'}}>→</div>
                      <div><div style={{fontSize:'8px',color:'#8B4513'}}>META</div><div style={{fontSize:'22px',fontWeight:'bold',color:'#A0422A'}}>{dados.peso_meta} kg</div></div>
                    </div>
                    <div style={{fontSize:'11px',color:'#8B4513'}}>Início: {formatarData(dados.data_inicio)}</div>
                  </div>
                </div>
                <div style={{background:'#6B4423',padding:'20px 40px',display:'flex',justifyContent:'space-between',color:'rgba(255,255,255,0.9)',fontSize:'10px'}}>
                  <div><div style={{fontWeight:'600'}}>Vivianne Saraiva</div><div>Precision Nutrition Level 1 Coach</div></div>
                  <div style={{textAlign:'right'}}><div>vivianne.saraiva@outlook.com</div><div>WhatsApp: +258 84 524 3875</div></div>
                </div>
              </div>

              {/* ========== PÁGINA 2 - FASE ========== */}
              <div style={{width:'210mm',minHeight:'297mm',background:'#FDF8F3',fontFamily:'Segoe UI,sans-serif',padding:'40px 50px',pageBreakAfter:'always',position:'relative'}}>
                <div style={{display:'flex',justifyContent:'space-between',borderBottom:'2px solid #D2B48C',paddingBottom:'15px',marginBottom:'30px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><span style={{fontSize:'24px',fontWeight:'bold',color:'#C1634A'}}>V</span><span style={{fontWeight:'600',color:'#C1634A'}}>VITALIS</span></div>
                  <div style={{fontSize:'12px',color:'#8B4513'}}>{faseConfig.nome}</div>
                </div>
                <div style={{fontSize:'22px',fontWeight:'600',color:'#6B4423',marginBottom:'20px'}}>👋 Bem-vinda à Tua Jornada</div>
                <div style={{background:'white',borderRadius:'12px',padding:'20px',border:'1px solid #D2B48C',marginBottom:'25px'}}>
                  <p style={{color:'#6B4423',lineHeight:'1.8'}}><strong>{dados.nome}</strong>, este guia foi criado especialmente para ti, com base nas tuas respostas, objectivos e estilo de vida.</p>
                </div>
                <div style={{fontSize:'22px',fontWeight:'600',color:'#6B4423',marginBottom:'20px'}}>🔥 {faseConfig.nome}</div>
                <div style={{background:'white',borderRadius:'12px',padding:'20px',border:'1px solid #D2B48C',marginBottom:'25px'}}>
                  <div style={{display:'inline-block',padding:'4px 12px',background:'#F5F0E8',borderRadius:'20px',fontSize:'11px',color:'#8B4513',marginBottom:'15px'}}>Duração: {faseConfig.duracao}</div>
                  <p style={{color:'#6B4423',lineHeight:'1.7'}}>{faseConfig.descricao}</p>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',border:'1px solid #D2B48C'}}>
                    <div style={{fontSize:'10px',color:'#8B4513',marginBottom:'8px'}}>ABORDAGEM</div>
                    <div style={{fontSize:'18px',fontWeight:'600',color:'#C1634A'}}>{dados.abordagem}</div>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',border:'1px solid #D2B48C'}}>
                    <div style={{fontSize:'10px',color:'#8B4513',marginBottom:'8px'}}>META SEMANAL</div>
                    <div style={{fontSize:'18px',fontWeight:'600',color:'#6B8E23'}}>-0.5 a -1.0 kg</div>
                  </div>
                </div>
                <div style={{position:'absolute',bottom:'20px',left:'50px',right:'50px',display:'flex',justifyContent:'space-between',fontSize:'9px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'10px'}}>
                  <span>Documento exclusivo de {dados.nome}</span><span>Página 2 de 10</span>
                </div>
              </div>

              {/* ========== PÁGINA 3 - PORÇÕES ========== */}
              <div style={{width:'210mm',minHeight:'297mm',background:'#FDF8F3',fontFamily:'Segoe UI,sans-serif',padding:'40px 50px',pageBreakAfter:'always',position:'relative'}}>
                <div style={{display:'flex',justifyContent:'space-between',borderBottom:'2px solid #D2B48C',paddingBottom:'15px',marginBottom:'30px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><span style={{fontSize:'24px',fontWeight:'bold',color:'#C1634A'}}>V</span><span style={{fontWeight:'600',color:'#C1634A'}}>VITALIS</span></div>
                  <div style={{fontSize:'12px',color:'#8B4513'}}>{faseConfig.nome}</div>
                </div>
                <div style={{fontSize:'22px',fontWeight:'600',color:'#6B4423',marginBottom:'20px'}}>🍽️ As Tuas Porções Diárias</div>
                <p style={{color:'#6B4423',marginBottom:'25px'}}>Usa o Método da Mão para medir — simples, prático e sempre contigo.</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'20px',marginBottom:'30px'}}>
                  <div style={{background:'#FFEBEE',borderRadius:'12px',padding:'20px',textAlign:'center',border:'2px solid #E57373'}}>
                    <div style={{fontSize:'14px',color:'#C62828',fontWeight:'600',marginBottom:'8px'}}>Proteína</div>
                    <div style={{fontSize:'42px',fontWeight:'bold',color:'#C62828'}}>{dados.porcoes_proteina}</div>
                    <div style={{fontSize:'12px',color:'#C62828'}}>palmas/dia</div>
                  </div>
                  <div style={{background:'#E3F2FD',borderRadius:'12px',padding:'20px',textAlign:'center',border:'2px solid #64B5F6'}}>
                    <div style={{fontSize:'14px',color:'#1565C0',fontWeight:'600',marginBottom:'8px'}}>Hidratos</div>
                    <div style={{fontSize:'42px',fontWeight:'bold',color:'#1565C0'}}>{dados.porcoes_hidratos}</div>
                    <div style={{fontSize:'12px',color:'#1565C0'}}>mãos/dia</div>
                  </div>
                  <div style={{background:'#FFF8E1',borderRadius:'12px',padding:'20px',textAlign:'center',border:'2px solid #FFD54F'}}>
                    <div style={{fontSize:'14px',color:'#F57F17',fontWeight:'600',marginBottom:'8px'}}>Gordura</div>
                    <div style={{fontSize:'42px',fontWeight:'bold',color:'#F57F17'}}>{dados.porcoes_gordura}</div>
                    <div style={{fontSize:'12px',color:'#F57F17'}}>polegares/dia</div>
                  </div>
                </div>
                <div style={{background:'#E8F5E9',borderRadius:'12px',padding:'20px',textAlign:'center',border:'2px solid #81C784',marginBottom:'30px'}}>
                  <div style={{fontSize:'14px',color:'#2E7D32',fontWeight:'600'}}>🥬 Vegetais & Legumes</div>
                  <div style={{fontSize:'24px',fontWeight:'bold',color:'#2E7D32'}}>À VONTADE</div>
                  <div style={{fontSize:'11px',color:'#2E7D32'}}>Quanto mais cores, melhor!</div>
                </div>
                <div style={{fontSize:'20px',fontWeight:'600',color:'#6B4423',marginBottom:'15px'}}>📊 Os Teus Macros Diários</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'15px'}}>
                  <div style={{background:'white',borderRadius:'12px',padding:'15px',textAlign:'center',border:'1px solid #D2B48C'}}>
                    <div style={{fontSize:'24px',fontWeight:'bold',color:'#C1634A'}}>{dados.calorias}</div>
                    <div style={{fontSize:'11px',color:'#8B4513'}}>Calorias</div>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'15px',textAlign:'center',border:'1px solid #D2B48C'}}>
                    <div style={{fontSize:'24px',fontWeight:'bold',color:'#C62828'}}>{dados.proteina_g}g</div>
                    <div style={{fontSize:'11px',color:'#8B4513'}}>Proteína</div>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'15px',textAlign:'center',border:'1px solid #D2B48C'}}>
                    <div style={{fontSize:'24px',fontWeight:'bold',color:'#1565C0'}}>{dados.carboidratos_g}g</div>
                    <div style={{fontSize:'11px',color:'#8B4513'}}>Hidratos</div>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'15px',textAlign:'center',border:'1px solid #D2B48C'}}>
                    <div style={{fontSize:'24px',fontWeight:'bold',color:'#F57F17'}}>{dados.gordura_g}g</div>
                    <div style={{fontSize:'11px',color:'#8B4513'}}>Gordura</div>
                  </div>
                </div>
                <div style={{position:'absolute',bottom:'20px',left:'50px',right:'50px',display:'flex',justifyContent:'space-between',fontSize:'9px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'10px'}}>
                  <span>Documento exclusivo de {dados.nome}</span><span>Página 3 de 10</span>
                </div>
              </div>

              {/* ========== PÁGINA 4 - MÉTODO DA MÃO ========== */}
              <div style={{width:'210mm',minHeight:'297mm',background:'#FDF8F3',fontFamily:'Segoe UI,sans-serif',padding:'40px 50px',pageBreakAfter:'always',position:'relative'}}>
                <div style={{display:'flex',justifyContent:'space-between',borderBottom:'2px solid #D2B48C',paddingBottom:'15px',marginBottom:'30px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><span style={{fontSize:'24px',fontWeight:'bold',color:'#C1634A'}}>V</span><span style={{fontWeight:'600',color:'#C1634A'}}>VITALIS</span></div>
                </div>
                <div style={{fontSize:'22px',fontWeight:'600',color:'#6B4423',marginBottom:'20px'}}>✋ O Método da Mão</div>
                <p style={{color:'#6B4423',marginBottom:'25px',textAlign:'center',fontStyle:'italic'}}>A tua mão é proporcional ao teu corpo — mãos maiores = corpo maior = mais comida.</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
                  <div style={{background:'#FFEBEE',borderRadius:'12px',padding:'20px',border:'1px solid #E57373'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'10px'}}>🖐️ A Palma — PROTEÍNA</div>
                    <div style={{color:'#C62828',fontWeight:'600',marginBottom:'10px'}}>~{dados.tamanho_palma}g de proteína</div>
                    <p style={{fontSize:'12px',color:'#6B4423'}}>Tamanho e espessura da tua palma (sem dedos)</p>
                    <p style={{fontSize:'11px',color:'#8B4513',marginTop:'8px',fontStyle:'italic'}}>Ex: 1 bife, 1 peito de frango</p>
                  </div>
                  <div style={{background:'#E3F2FD',borderRadius:'12px',padding:'20px',border:'1px solid #64B5F6'}}>
                    <div style={{fontWeight:'600',color:'#1565C0',marginBottom:'10px'}}>🤲 A Mão em Concha — HIDRATOS</div>
                    <div style={{color:'#1565C0',fontWeight:'600',marginBottom:'10px'}}>~{dados.tamanho_mao}g de hidratos</div>
                    <p style={{fontSize:'12px',color:'#6B4423'}}>O que cabe na tua mão em concha</p>
                    <p style={{fontSize:'11px',color:'#8B4513',marginTop:'8px',fontStyle:'italic'}}>Ex: punhado de arroz, batata-doce</p>
                  </div>
                  <div style={{background:'#FFF8E1',borderRadius:'12px',padding:'20px',border:'1px solid #FFD54F'}}>
                    <div style={{fontWeight:'600',color:'#F57F17',marginBottom:'10px'}}>👍 O Polegar — GORDURA</div>
                    <div style={{color:'#F57F17',fontWeight:'600',marginBottom:'10px'}}>~{dados.tamanho_polegar}g de gordura</div>
                    <p style={{fontSize:'12px',color:'#6B4423'}}>Tamanho do teu polegar inteiro</p>
                    <p style={{fontSize:'11px',color:'#8B4513',marginTop:'8px',fontStyle:'italic'}}>Ex: 1 colher azeite, nozes</p>
                  </div>
                  <div style={{background:'#E8F5E9',borderRadius:'12px',padding:'20px',border:'1px solid #81C784'}}>
                    <div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'10px'}}>✊ O Punho — VEGETAIS</div>
                    <div style={{color:'#2E7D32',fontWeight:'600',marginBottom:'10px'}}>~100g de vegetais</div>
                    <p style={{fontSize:'12px',color:'#6B4423'}}>Tamanho do teu punho fechado</p>
                    <p style={{fontSize:'11px',color:'#2E7D32',marginTop:'8px',fontWeight:'600'}}>Mas lembra-te: À VONTADE!</p>
                  </div>
                </div>
                <div style={{position:'absolute',bottom:'20px',left:'50px',right:'50px',display:'flex',justifyContent:'space-between',fontSize:'9px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'10px'}}>
                  <span>Documento exclusivo de {dados.nome}</span><span>Página 4 de 10</span>
                </div>
              </div>

              {/* ========== PÁGINA 5 - PROTEÍNAS ========== */}
              <div style={{width:'210mm',minHeight:'297mm',background:'#FDF8F3',fontFamily:'Segoe UI,sans-serif',padding:'40px 50px',pageBreakAfter:'always',position:'relative'}}>
                <div style={{display:'flex',justifyContent:'space-between',borderBottom:'2px solid #D2B48C',paddingBottom:'15px',marginBottom:'30px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><span style={{fontSize:'24px',fontWeight:'bold',color:'#C1634A'}}>V</span><span style={{fontWeight:'600',color:'#C1634A'}}>VITALIS</span></div>
                </div>
                <div style={{fontSize:'22px',fontWeight:'600',color:'#6B4423',marginBottom:'20px'}}>🥩 Proteínas Saudáveis</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'12px'}}>Carnes Vermelhas (magras)</div>
                    <p style={{fontSize:'13px',color:'#6B4423',lineHeight:'1.8'}}>Bife de vaca • Carne moída magra • Lombo de porco • Cabrito • Borrego • Fígado</p>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'12px'}}>Aves</div>
                    <p style={{fontSize:'13px',color:'#6B4423',lineHeight:'1.8'}}>Peito de frango • Coxa sem pele • Peru • Pato sem pele • Codorniz</p>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'12px'}}>Peixes & Mariscos</div>
                    <p style={{fontSize:'13px',color:'#6B4423',lineHeight:'1.8'}}>Salmão • Atum • Sardinha • Carapau • Pescada • Tilápia • Camarão • Lulas</p>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'12px'}}>Ovos & Lacticínios</div>
                    <p style={{fontSize:'13px',color:'#6B4423',lineHeight:'1.8'}}>Ovos inteiros • Queijo fresco • Iogurte grego natural • Requeijão</p>
                  </div>
                </div>
                <div style={{position:'absolute',bottom:'20px',left:'50px',right:'50px',display:'flex',justifyContent:'space-between',fontSize:'9px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'10px'}}>
                  <span>Documento exclusivo de {dados.nome}</span><span>Página 5 de 10</span>
                </div>
              </div>

              {/* ========== PÁGINA 6 - HIDRATOS E GORDURAS ========== */}
              <div style={{width:'210mm',minHeight:'297mm',background:'#FDF8F3',fontFamily:'Segoe UI,sans-serif',padding:'40px 50px',pageBreakAfter:'always',position:'relative'}}>
                <div style={{display:'flex',justifyContent:'space-between',borderBottom:'2px solid #D2B48C',paddingBottom:'15px',marginBottom:'30px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><span style={{fontSize:'24px',fontWeight:'bold',color:'#C1634A'}}>V</span><span style={{fontWeight:'600',color:'#C1634A'}}>VITALIS</span></div>
                </div>
                <div style={{fontSize:'22px',fontWeight:'600',color:'#6B4423',marginBottom:'20px'}}>🍚 Hidratos Saudáveis & 🥑 Gorduras</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
                  <div style={{background:'#E3F2FD',borderRadius:'12px',padding:'20px',border:'1px solid #64B5F6'}}>
                    <div style={{fontWeight:'600',color:'#1565C0',marginBottom:'12px'}}>Tubérculos & Grãos</div>
                    <p style={{fontSize:'13px',color:'#6B4423',lineHeight:'1.8'}}>Batata-doce • Mandioca • Inhame • Arroz integral • Quinoa • Aveia</p>
                  </div>
                  <div style={{background:'#E3F2FD',borderRadius:'12px',padding:'20px',border:'1px solid #64B5F6'}}>
                    <div style={{fontWeight:'600',color:'#1565C0',marginBottom:'12px'}}>Frutas (baixo IG)</div>
                    <p style={{fontSize:'13px',color:'#6B4423',lineHeight:'1.8'}}>Frutos vermelhos • Maçã verde • Pera • Laranja • Toranja • Kiwi</p>
                  </div>
                  <div style={{background:'#FFF8E1',borderRadius:'12px',padding:'20px',border:'1px solid #FFD54F'}}>
                    <div style={{fontWeight:'600',color:'#F57F17',marginBottom:'12px'}}>Óleos & Manteigas</div>
                    <p style={{fontSize:'13px',color:'#6B4423',lineHeight:'1.8'}}>Azeite extra-virgem • Óleo de coco • Manteiga • Ghee</p>
                  </div>
                  <div style={{background:'#FFF8E1',borderRadius:'12px',padding:'20px',border:'1px solid #FFD54F'}}>
                    <div style={{fontWeight:'600',color:'#F57F17',marginBottom:'12px'}}>Frutos Secos & Sementes</div>
                    <p style={{fontSize:'13px',color:'#6B4423',lineHeight:'1.8'}}>Amêndoas • Nozes • Cajus • Chia • Linhaça</p>
                  </div>
                </div>
                <div style={{background:'#FFF8E1',borderRadius:'12px',padding:'20px',border:'1px solid #FFD54F',marginTop:'20px'}}>
                  <div style={{fontWeight:'600',color:'#F57F17',marginBottom:'12px'}}>Outras Fontes de Gordura</div>
                  <p style={{fontSize:'13px',color:'#6B4423',lineHeight:'1.8'}}>Abacate • Azeitonas • Coco • Chocolate negro (+70%)</p>
                </div>
                <div style={{position:'absolute',bottom:'20px',left:'50px',right:'50px',display:'flex',justifyContent:'space-between',fontSize:'9px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'10px'}}>
                  <span>Documento exclusivo de {dados.nome}</span><span>Página 6 de 10</span>
                </div>
              </div>

              {/* ========== PÁGINA 7 - VEGETAIS ========== */}
              <div style={{width:'210mm',minHeight:'297mm',background:'#FDF8F3',fontFamily:'Segoe UI,sans-serif',padding:'40px 50px',pageBreakAfter:'always',position:'relative'}}>
                <div style={{display:'flex',justifyContent:'space-between',borderBottom:'2px solid #D2B48C',paddingBottom:'15px',marginBottom:'30px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><span style={{fontSize:'24px',fontWeight:'bold',color:'#C1634A'}}>V</span><span style={{fontWeight:'600',color:'#C1634A'}}>VITALIS</span></div>
                </div>
                <div style={{fontSize:'22px',fontWeight:'600',color:'#6B4423',marginBottom:'20px'}}>🥬 Vegetais — Come o Arco-Íris!</div>
                <p style={{color:'#6B4423',marginBottom:'25px',textAlign:'center'}}>Cada cor = diferentes nutrientes. Inclui pelo menos 3 cores por refeição!</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'15px'}}>
                  <div style={{background:'white',borderRadius:'12px',padding:'15px',border:'1px solid #D2B48C',borderLeft:'4px solid #4CAF50'}}>
                    <div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'8px'}}>🟢 Verdes</div>
                    <p style={{fontSize:'12px',color:'#6B4423'}}>Espinafre, Couve, Brócolos, Alface, Rúcula, Pepino, Abobrinha</p>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'15px',border:'1px solid #D2B48C',borderLeft:'4px solid #F44336'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'8px'}}>🔴 Vermelhos</div>
                    <p style={{fontSize:'12px',color:'#6B4423'}}>Tomate, Pimento vermelho, Beterraba, Rabanete</p>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'15px',border:'1px solid #D2B48C',borderLeft:'4px solid #FF9800'}}>
                    <div style={{fontWeight:'600',color:'#E65100',marginBottom:'8px'}}>🟠 Laranjas</div>
                    <p style={{fontSize:'12px',color:'#6B4423'}}>Cenoura, Abóbora, Pimento laranja</p>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'15px',border:'1px solid #D2B48C',borderLeft:'4px solid #9E9E9E'}}>
                    <div style={{fontWeight:'600',color:'#616161',marginBottom:'8px'}}>⚪ Brancos</div>
                    <p style={{fontSize:'12px',color:'#6B4423'}}>Couve-flor, Cogumelos, Alho, Cebola, Nabo</p>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'15px',border:'1px solid #D2B48C',borderLeft:'4px solid #9C27B0',gridColumn:'span 2'}}>
                    <div style={{fontWeight:'600',color:'#7B1FA2',marginBottom:'8px'}}>🟣 Roxos</div>
                    <p style={{fontSize:'12px',color:'#6B4423'}}>Beringela, Couve roxa, Cebola roxa</p>
                  </div>
                </div>
                <div style={{position:'absolute',bottom:'20px',left:'50px',right:'50px',display:'flex',justifyContent:'space-between',fontSize:'9px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'10px'}}>
                  <span>Documento exclusivo de {dados.nome}</span><span>Página 7 de 10</span>
                </div>
              </div>

              {/* ========== PÁGINA 8 - LISTA DE COMPRAS ========== */}
              <div style={{width:'210mm',minHeight:'297mm',background:'#FDF8F3',fontFamily:'Segoe UI,sans-serif',padding:'40px 50px',pageBreakAfter:'always',position:'relative'}}>
                <div style={{display:'flex',justifyContent:'space-between',borderBottom:'2px solid #D2B48C',paddingBottom:'15px',marginBottom:'30px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><span style={{fontSize:'24px',fontWeight:'bold',color:'#C1634A'}}>V</span><span style={{fontWeight:'600',color:'#C1634A'}}>VITALIS</span></div>
                </div>
                <div style={{fontSize:'22px',fontWeight:'600',color:'#6B4423',marginBottom:'20px'}}>🛒 Lista de Compras Semanal</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'15px'}}>🥩 Proteínas</div>
                    <div style={{fontSize:'13px',color:'#6B4423',lineHeight:'2'}}>☐ Peito de frango (1kg)<br/>☐ Ovos (2 dúzias)<br/>☐ Peixe fresco (500g)<br/>☐ Carne moída (500g)</div>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'15px'}}>🥬 Vegetais</div>
                    <div style={{fontSize:'13px',color:'#6B4423',lineHeight:'2'}}>☐ Espinafre/Couve<br/>☐ Brócolos<br/>☐ Tomate<br/>☐ Pepino<br/>☐ Pimentos<br/>☐ Cebola e Alho</div>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#F57F17',marginBottom:'15px'}}>🥑 Gorduras</div>
                    <div style={{fontSize:'13px',color:'#6B4423',lineHeight:'2'}}>☐ Azeite extra-virgem<br/>☐ Abacate (2-3)<br/>☐ Manteiga<br/>☐ Amêndoas/Nozes</div>
                  </div>
                  <div style={{background:'white',borderRadius:'12px',padding:'20px',border:'1px solid #D2B48C'}}>
                    <div style={{fontWeight:'600',color:'#8B4513',marginBottom:'15px'}}>🧂 Outros</div>
                    <div style={{fontSize:'13px',color:'#6B4423',lineHeight:'2'}}>☐ Sal e pimenta<br/>☐ Ervas frescas<br/>☐ Limões<br/>☐ Chá/Café</div>
                  </div>
                </div>
                <div style={{position:'absolute',bottom:'20px',left:'50px',right:'50px',display:'flex',justifyContent:'space-between',fontSize:'9px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'10px'}}>
                  <span>Documento exclusivo de {dados.nome}</span><span>Página 8 de 10</span>
                </div>
              </div>

              {/* ========== PÁGINA 9 - REGRAS ========== */}
              <div style={{width:'210mm',minHeight:'297mm',background:'#FDF8F3',fontFamily:'Segoe UI,sans-serif',padding:'40px 50px',pageBreakAfter:'always',position:'relative'}}>
                <div style={{display:'flex',justifyContent:'space-between',borderBottom:'2px solid #D2B48C',paddingBottom:'15px',marginBottom:'30px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}><span style={{fontSize:'24px',fontWeight:'bold',color:'#C1634A'}}>V</span><span style={{fontWeight:'600',color:'#C1634A'}}>VITALIS</span></div>
                </div>
                <div style={{fontSize:'22px',fontWeight:'600',color:'#6B4423',marginBottom:'20px'}}>📋 Regras da {faseConfig.nome}</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'30px'}}>
                  <div style={{background:'#E8F5E9',borderRadius:'12px',padding:'20px',border:'1px solid #81C784'}}>
                    <div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'15px'}}>✓ PRIORIZAR</div>
                    <div style={{fontSize:'13px',color:'#6B4423',lineHeight:'2'}}>{faseConfig.priorizar.map(i => `✓ ${i}`).join('\n')}</div>
                  </div>
                  <div style={{background:'#FFEBEE',borderRadius:'12px',padding:'20px',border:'1px solid #E57373'}}>
                    <div style={{fontWeight:'600',color:'#C62828',marginBottom:'15px'}}>✗ EVITAR</div>
                    <div style={{fontSize:'13px',color:'#6B4423',lineHeight:'2'}}>{faseConfig.evitar.map(i => `✗ ${i}`).join('\n')}</div>
                  </div>
                </div>
                <div style={{background:'#FFF8E1',borderRadius:'12px',padding:'20px',border:'1px solid #FFD54F'}}>
                  <div style={{fontWeight:'600',color:'#F57F17',marginBottom:'15px'}}>💡 DICAS</div>
                  <div style={{fontSize:'13px',color:'#6B4423',lineHeight:'2'}}>{faseConfig.dicas.map(i => `• ${i}`).join('\n')}</div>
                </div>
                <div style={{position:'absolute',bottom:'20px',left:'50px',right:'50px',display:'flex',justifyContent:'space-between',fontSize:'9px',color:'#8B4513',borderTop:'1px solid #D2B48C',paddingTop:'10px'}}>
                  <span>Documento exclusivo de {dados.nome}</span><span>Página 9 de 10</span>
                </div>
              </div>

              {/* ========== PÁGINA 10 - ENCERRAMENTO ========== */}
              <div style={{width:'210mm',minHeight:'297mm',background:'linear-gradient(180deg,#FDF8F3,#F5F0E8)',fontFamily:'Segoe UI,sans-serif',display:'flex',flexDirection:'column'}}>
                <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'50px'}}>
                  <div style={{width:'80px',height:'80px',background:'linear-gradient(135deg,#C1634A,#8B4513)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'30px'}}>
                    <span style={{color:'white',fontSize:'40px',fontWeight:'bold'}}>V</span>
                  </div>
                  <div style={{fontSize:'36px',fontWeight:'bold',color:'#A0422A',letterSpacing:'8px',marginBottom:'40px'}}>VITALIS</div>
                  <div style={{maxWidth:'400px',textAlign:'center',padding:'30px',background:'white',borderRadius:'15px',boxShadow:'0 10px 35px rgba(0,0,0,0.06)',marginBottom:'40px'}}>
                    <div style={{fontSize:'40px',marginBottom:'15px'}}>"</div>
                    <p style={{fontSize:'18px',color:'#6B4423',fontStyle:'italic',lineHeight:'1.6'}}>Quando o excesso cai, o corpo responde.</p>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'10px',color:'#8B4513',letterSpacing:'2px',marginBottom:'10px'}}>CRIADO EXCLUSIVAMENTE PARA</div>
                    <div style={{fontSize:'24px',fontWeight:'600',color:'#6B4423'}}>{dados.nome}</div>
                  </div>
                </div>
                <div style={{background:'#6B4423',padding:'20px 40px',display:'flex',justifyContent:'space-between',color:'rgba(255,255,255,0.9)',fontSize:'10px'}}>
                  <div><div style={{fontWeight:'600'}}>Vivianne Saraiva</div><div>Precision Nutrition Level 1 Coach</div></div>
                  <div style={{textAlign:'right'}}><div>vivianne.saraiva@outlook.com</div><div>WhatsApp: +258 84 524 3875</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
