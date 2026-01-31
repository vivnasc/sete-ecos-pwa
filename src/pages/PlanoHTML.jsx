// src/pages/PlanoHTML.jsx
// Página que renderiza o plano completo para o Puppeteer converter em PDF

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

const FASES_CONFIG = {
  inducao: { nome: 'Fase 1: Indução', duracao: '3-4 semanas', descricao: 'A fase de arranque onde o corpo entra em modo de queima de gordura. Foco em proteína, gorduras saudáveis e vegetais.', priorizar: ['Proteína em todas as refeições', 'Vegetais em abundância', 'Gorduras saudáveis (azeite, abacate, nozes)', 'Água (mínimo 2L por dia)', 'Dormir 7-8 horas por noite'], evitar: ['Açúcar e adoçantes', 'Grãos e cereais (pão, massa, arroz)', 'Frutas doces (banana, manga, uvas)', 'Leguminosas', 'Álcool'], dicas: ['Prepara as refeições ao domingo', 'Tem snacks saudáveis à mão', 'Podes sentir "keto flu" — é normal', 'Pesa-te às sextas-feiras, em jejum'] },
  estabilizacao: { nome: 'Fase 2: Estabilização', duracao: '6-8 semanas', descricao: 'Reintrodução gradual de hidratos complexos enquanto mantemos os resultados.', priorizar: ['Manter proteína elevada', 'Hidratos complexos (batata-doce, arroz integral)', 'Fruta de baixo índice glicémico', 'Leguminosas em moderação'], evitar: ['Açúcar refinado', 'Farinhas brancas', 'Alimentos processados', 'Bebidas açucaradas'], dicas: ['Introduz um alimento de cada vez', 'Observa como o corpo reage', 'Mantém o diário alimentar'] },
  reeducacao: { nome: 'Fase 3: Reeducação', duracao: '6-8 semanas', descricao: 'Aprender a comer de forma equilibrada e intuitiva para a vida.', priorizar: ['Equilíbrio em todas as refeições', 'Variedade alimentar', 'Comer com atenção plena', 'Flexibilidade saudável'], evitar: ['Restrições extremas', 'Mentalidade de dieta', 'Comer emocional'], dicas: ['Pratica a escuta do corpo', 'Permite-te flexibilidade', 'Foca em como te sentes'] },
  manutencao: { nome: 'Fase 4: Manutenção', duracao: 'Contínua', descricao: 'Manter os resultados com um estilo de vida equilibrado.', priorizar: ['Consistência', 'Movimento regular', 'Sono de qualidade', 'Gestão do stress'], evitar: ['Voltar aos velhos hábitos', 'Ignorar sinais do corpo', 'Perder a rotina'], dicas: ['Pesagem semanal', 'Ajusta conforme necessário', 'Celebra as vitórias'] }
};

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
      const { data: plano } = await supabase.from('vitalis_plano').select('*').eq('id', planoId).single();
      const { data: cliente } = await supabase.from('vitalis_clients').select('*').eq('id', plano?.client_id).single();
      const { data: intake } = await supabase.from('vitalis_intake').select('nome').eq('user_id', cliente?.user_id).order('created_at', { ascending: false }).limit(1).single();
      
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

  if (loading) return <div>A carregar...</div>;
  if (!dados) return <div>Plano não encontrado</div>;

  const faseConfig = FASES_CONFIG[dados.fase] || FASES_CONFIG.inducao;
  const formatarData = (d) => d ? new Date(d).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return (
    <>
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          .page { page-break-after: always; page-break-inside: avoid; }
          .page:last-child { page-break-after: auto; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #FDF8F3; color: #6B4423; }
        .page { width: 210mm; min-height: 297mm; background: #FDF8F3; position: relative; overflow: hidden; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #D2B48C; padding-bottom: 12px; margin-bottom: 25px; }
        .logo { width: 40px; height: 40px; background: linear-gradient(135deg, #C1634A, #8B4513); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; font-weight: bold; }
        .title { font-size: 24px; font-weight: 600; color: #6B4423; margin-bottom: 20px; }
        .card { background: white; border: 1px solid #D2B48C; border-radius: 14px; padding: 22px; margin-bottom: 18px; }
        .footer { position: absolute; bottom: 20px; left: 45px; right: 45px; display: flex; justify-content: space-between; font-size: 9px; color: #8B4513; border-top: 1px solid #D2B48C; padding-top: 10px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }
        .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; }
        .portion-card { border-radius: 18px; padding: 28px 20px; text-align: center; border: 3px solid; }
        .portion-protein { background: linear-gradient(135deg, #FFEBEE, #FFCDD2); border-color: #E57373; }
        .portion-carbs { background: linear-gradient(135deg, #E3F2FD, #BBDEFB); border-color: #64B5F6; }
        .portion-fats { background: linear-gradient(135deg, #FFF8E1, #FFECB3); border-color: #FFD54F; }
        .portion-veggies { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); border-color: #81C784; }
        .portion-value { font-size: 56px; font-weight: 700; line-height: 1; }
        .macro-card { text-align: center; padding: 20px; }
        .macro-value { font-size: 28px; font-weight: 700; }
        .rules-priority { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); border-color: #81C784; }
        .rules-avoid { background: linear-gradient(135deg, #FFEBEE, #FFCDD2); border-color: #E57373; }
        .rules-tips { background: linear-gradient(135deg, #FFF8E1, #FFECB3); border-color: #FFD54F; }
      `}</style>

      {/* Indicador para o Puppeteer saber que a página carregou */}
      <div id="pdf-ready" style={{display:'none'}}>ready</div>

      {/* PÁGINA 1 - CAPA */}
      <div className="page" style={{display:'flex',flexDirection:'column'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'50px'}}>
          <div style={{width:'110px',height:'110px',background:'linear-gradient(135deg, #C1634A, #8B4513)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px',boxShadow:'0 12px 35px rgba(193,99,74,0.4)'}}><span style={{color:'white',fontSize:'60px',fontWeight:'bold'}}>V</span></div>
          <div style={{fontSize:'52px',fontWeight:'700',color:'#A0422A',letterSpacing:'14px'}}>VITALIS</div>
          <div style={{fontSize:'12px',color:'#8B4513',letterSpacing:'6px',marginTop:'10px'}}>A RAIZ DA TRANSFORMAÇÃO</div>
          <div style={{width:'120px',height:'2px',background:'linear-gradient(90deg, transparent, #C1634A, transparent)',margin:'50px 0'}}></div>
          <div style={{fontSize:'38px',fontWeight:'600',color:'#6B4423',letterSpacing:'4px'}}>Guia Personalizado</div>
          <div style={{fontSize:'18px',color:'#C1634A',fontWeight:'500',letterSpacing:'6px',marginTop:'12px',marginBottom:'55px'}}>PLANO ALIMENTAR</div>
          
          <div style={{background:'white',border:'2px solid #D2B48C',borderRadius:'28px',padding:'45px 90px',textAlign:'center',boxShadow:'0 18px 55px rgba(0,0,0,0.08)'}}>
            <div style={{fontSize:'11px',color:'#8B4513',letterSpacing:'4px',marginBottom:'12px'}}>PREPARADO EXCLUSIVAMENTE PARA</div>
            <div style={{fontSize:'40px',fontWeight:'600',color:'#6B4423',marginBottom:'30px'}}>{dados.nome}</div>
            <div style={{display:'flex',gap:'40px',justifyContent:'center',alignItems:'center',marginBottom:'25px'}}>
              <div style={{textAlign:'center'}}><div style={{fontSize:'10px',color:'#8B4513',letterSpacing:'2px',marginBottom:'6px'}}>PESO ACTUAL</div><div style={{fontSize:'36px',color:'#A0422A',fontWeight:'700'}}>{dados.peso_actual} kg</div></div>
              <div style={{color:'#6B8E23',fontSize:'40px'}}>→</div>
              <div style={{textAlign:'center'}}><div style={{fontSize:'10px',color:'#8B4513',letterSpacing:'2px',marginBottom:'6px'}}>META</div><div style={{fontSize:'36px',color:'#A0422A',fontWeight:'700'}}>{dados.peso_meta} kg</div></div>
            </div>
            <div style={{fontSize:'14px',color:'#8B4513'}}>Início: {formatarData(dados.data_inicio)}</div>
          </div>
        </div>
        <div style={{background:'#6B4423',padding:'28px 55px',display:'flex',justifyContent:'space-between'}}>
          <div style={{color:'rgba(255,255,255,0.95)',fontSize:'12px'}}><div style={{fontWeight:'600',marginBottom:'3px'}}>Vivianne Saraiva</div><div style={{opacity:0.85}}>Precision Nutrition Level 1 Coach</div></div>
          <div style={{color:'rgba(255,255,255,0.95)',fontSize:'12px',textAlign:'right'}}><div style={{marginBottom:'3px'}}>vivianne.saraiva@outlook.com</div><div style={{opacity:0.85}}>WhatsApp: +258 84 524 3875</div></div>
        </div>
      </div>

      {/* PÁGINA 2 - BEM-VINDA */}
      <div className="page" style={{padding:'45px'}}>
        <div className="header">
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}><div className="logo">V</div><span style={{fontWeight:'600',fontSize:'18px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div>
          <div style={{fontSize:'13px',color:'#8B4513',fontWeight:'500'}}>{faseConfig.nome}</div>
        </div>
        <div className="title">👋 Bem-vinda à Tua Jornada</div>
        <div className="card"><p style={{fontSize:'15px',lineHeight:'2'}}><strong>{dados.nome}</strong>, este guia foi criado especialmente para ti, com base nas tuas respostas, objectivos e estilo de vida. Cada porção, cada recomendação, foi calculada para o teu corpo e para onde queres chegar.</p></div>
        <div className="title" style={{marginTop:'30px'}}>🔥 {faseConfig.nome}</div>
        <div className="card"><span style={{display:'inline-block',padding:'8px 20px',background:'#F5F0E8',borderRadius:'20px',fontSize:'12px',marginBottom:'15px'}}>Duração: {faseConfig.duracao}</span><p style={{fontSize:'15px',lineHeight:'1.9'}}>{faseConfig.descricao}</p></div>
        <div className="grid-2" style={{marginTop:'28px'}}>
          <div className="card"><div style={{fontSize:'11px',color:'#C1634A',letterSpacing:'2px',marginBottom:'12px'}}>ABORDAGEM NUTRICIONAL</div><div style={{fontSize:'26px',fontWeight:'600',color:'#A0422A',textTransform:'capitalize'}}>{dados.abordagem?.replace('_', ' ')}</div></div>
          <div className="card"><div style={{fontSize:'11px',color:'#C1634A',letterSpacing:'2px',marginBottom:'12px'}}>META SEMANAL</div><div style={{fontSize:'26px',fontWeight:'600',color:'#6B8E23'}}>-0.5 a -1.0 kg</div></div>
        </div>
        <div className="footer"><span>Documento exclusivo de {dados.nome}</span><span>Página 2 de 10</span></div>
      </div>

      {/* PÁGINA 3 - PORÇÕES */}
      <div className="page" style={{padding:'45px'}}>
        <div className="header">
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}><div className="logo">V</div><span style={{fontWeight:'600',fontSize:'18px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div>
          <div style={{fontSize:'13px',color:'#8B4513',fontWeight:'500'}}>{faseConfig.nome}</div>
        </div>
        <div className="title">🍽️ As Tuas Porções Diárias</div>
        <p style={{fontSize:'14px',color:'#8B4513',marginBottom:'28px'}}>Usa o Método da Mão para medir — simples, prático e sempre contigo.</p>
        <div className="grid-3" style={{marginBottom:'25px'}}>
          <div className="portion-card portion-protein"><div style={{fontSize:'17px',fontWeight:'600',color:'#C62828',marginBottom:'12px'}}>Proteína</div><div className="portion-value" style={{color:'#C62828'}}>{dados.porcoes_proteina}</div><div style={{fontSize:'13px',color:'#8B4513',marginTop:'12px'}}>palmas/dia</div></div>
          <div className="portion-card portion-carbs"><div style={{fontSize:'17px',fontWeight:'600',color:'#1565C0',marginBottom:'12px'}}>Hidratos</div><div className="portion-value" style={{color:'#1565C0'}}>{dados.porcoes_hidratos}</div><div style={{fontSize:'13px',color:'#8B4513',marginTop:'12px'}}>mãos/dia</div></div>
          <div className="portion-card portion-fats"><div style={{fontSize:'17px',fontWeight:'600',color:'#F57F17',marginBottom:'12px'}}>Gordura</div><div className="portion-value" style={{color:'#F57F17'}}>{dados.porcoes_gordura}</div><div style={{fontSize:'13px',color:'#8B4513',marginTop:'12px'}}>polegares/dia</div></div>
        </div>
        <div className="portion-card portion-veggies" style={{marginBottom:'32px'}}><div style={{fontSize:'17px',fontWeight:'600',color:'#2E7D32',marginBottom:'10px'}}>🥬 Vegetais & Legumes</div><div style={{fontSize:'46px',fontWeight:'700',color:'#2E7D32'}}>À VONTADE</div><div style={{fontSize:'13px',color:'#2E7D32',marginTop:'12px'}}>Quanto mais cores, melhor!</div></div>
        <div className="title" style={{fontSize:'20px',marginBottom:'20px'}}>📊 Os Teus Macros Diários</div>
        <div className="grid-4">
          <div className="card macro-card"><div style={{fontSize:'24px',marginBottom:'12px'}}>🔥</div><div className="macro-value" style={{color:'#C1634A'}}>{dados.calorias}</div><div style={{fontSize:'12px',color:'#8B4513',marginTop:'8px'}}>Calorias</div></div>
          <div className="card macro-card"><div style={{fontSize:'24px',marginBottom:'12px'}}>🥩</div><div className="macro-value" style={{color:'#C62828'}}>{dados.proteina_g}g</div><div style={{fontSize:'12px',color:'#8B4513',marginTop:'8px'}}>Proteína</div></div>
          <div className="card macro-card"><div style={{fontSize:'24px',marginBottom:'12px'}}>🍚</div><div className="macro-value" style={{color:'#1565C0'}}>{dados.carboidratos_g}g</div><div style={{fontSize:'12px',color:'#8B4513',marginTop:'8px'}}>Hidratos</div></div>
          <div className="card macro-card"><div style={{fontSize:'24px',marginBottom:'12px'}}>🥑</div><div className="macro-value" style={{color:'#F57F17'}}>{dados.gordura_g}g</div><div style={{fontSize:'12px',color:'#8B4513',marginTop:'8px'}}>Gordura</div></div>
        </div>
        <div className="footer"><span>Documento exclusivo de {dados.nome}</span><span>Página 3 de 10</span></div>
      </div>

      {/* PÁGINA 4 - MÉTODO DA MÃO */}
      <div className="page" style={{padding:'45px'}}>
        <div className="header">
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}><div className="logo">V</div><span style={{fontWeight:'600',fontSize:'18px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div>
        </div>
        <div className="title">✋ O Método da Mão</div>
        <p style={{fontSize:'15px',color:'#8B4513',marginBottom:'35px',textAlign:'center',fontStyle:'italic'}}>A tua mão é proporcional ao teu corpo — mãos maiores = corpo maior = mais comida.</p>
        <div className="grid-2" style={{gap:'25px'}}>
          <div className="portion-card portion-protein" style={{padding:'32px',textAlign:'left'}}><div style={{fontWeight:'600',color:'#C62828',marginBottom:'15px',fontSize:'19px'}}>🖐️ A Palma — PROTEÍNA</div><div style={{color:'#C62828',fontWeight:'700',fontSize:'26px',marginBottom:'15px'}}>~{dados.tamanho_palma}g de proteína</div><p style={{fontSize:'14px',color:'#6B4423',marginBottom:'12px'}}>Tamanho e espessura da tua palma (sem dedos)</p><p style={{fontSize:'13px',color:'#8B4513',fontStyle:'italic'}}>Ex: 1 bife, 1 peito de frango</p></div>
          <div className="portion-card portion-carbs" style={{padding:'32px',textAlign:'left'}}><div style={{fontWeight:'600',color:'#1565C0',marginBottom:'15px',fontSize:'19px'}}>🤲 A Mão em Concha — HIDRATOS</div><div style={{color:'#1565C0',fontWeight:'700',fontSize:'26px',marginBottom:'15px'}}>~{dados.tamanho_mao}g de hidratos</div><p style={{fontSize:'14px',color:'#6B4423',marginBottom:'12px'}}>O que cabe na tua mão em concha</p><p style={{fontSize:'13px',color:'#8B4513',fontStyle:'italic'}}>Ex: punhado de arroz, batata-doce</p></div>
          <div className="portion-card portion-fats" style={{padding:'32px',textAlign:'left'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'15px',fontSize:'19px'}}>👍 O Polegar — GORDURA</div><div style={{color:'#F57F17',fontWeight:'700',fontSize:'26px',marginBottom:'15px'}}>~{dados.tamanho_polegar}g de gordura</div><p style={{fontSize:'14px',color:'#6B4423',marginBottom:'12px'}}>Tamanho do teu polegar inteiro</p><p style={{fontSize:'13px',color:'#8B4513',fontStyle:'italic'}}>Ex: 1 colher azeite, nozes</p></div>
          <div className="portion-card portion-veggies" style={{padding:'32px',textAlign:'left'}}><div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'15px',fontSize:'19px'}}>✊ O Punho — VEGETAIS</div><div style={{color:'#2E7D32',fontWeight:'700',fontSize:'26px',marginBottom:'15px'}}>~100g de vegetais</div><p style={{fontSize:'14px',color:'#6B4423',marginBottom:'12px'}}>Tamanho do teu punho fechado</p><p style={{fontSize:'13px',color:'#2E7D32',fontWeight:'600'}}>Mas lembra-te: À VONTADE!</p></div>
        </div>
        <div className="footer"><span>Documento exclusivo de {dados.nome}</span><span>Página 4 de 10</span></div>
      </div>

      {/* PÁGINA 5 - PROTEÍNAS */}
      <div className="page" style={{padding:'45px'}}>
        <div className="header">
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}><div className="logo">V</div><span style={{fontWeight:'600',fontSize:'18px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div>
        </div>
        <div className="title">🥩 Proteínas Saudáveis</div>
        <div className="grid-2">
          <div className="card"><div style={{fontWeight:'600',color:'#C1634A',marginBottom:'18px',fontSize:'17px',borderBottom:'2px solid #D2B48C',paddingBottom:'12px'}}>Carnes Vermelhas (magras)</div><p style={{fontSize:'15px',lineHeight:'2.3'}}>Bife de vaca • Carne moída magra • Lombo de porco • Cabrito • Borrego • Fígado</p></div>
          <div className="card"><div style={{fontWeight:'600',color:'#C1634A',marginBottom:'18px',fontSize:'17px',borderBottom:'2px solid #D2B48C',paddingBottom:'12px'}}>Aves</div><p style={{fontSize:'15px',lineHeight:'2.3'}}>Peito de frango • Coxa de frango (sem pele) • Peru • Pato (sem pele) • Codorniz</p></div>
          <div className="card"><div style={{fontWeight:'600',color:'#C1634A',marginBottom:'18px',fontSize:'17px',borderBottom:'2px solid #D2B48C',paddingBottom:'12px'}}>Peixes & Mariscos</div><p style={{fontSize:'15px',lineHeight:'2.3'}}>Salmão • Atum • Sardinha • Carapau • Pescada • Tilápia • Camarão • Lulas</p></div>
          <div className="card"><div style={{fontWeight:'600',color:'#C1634A',marginBottom:'18px',fontSize:'17px',borderBottom:'2px solid #D2B48C',paddingBottom:'12px'}}>Ovos & Lacticínios</div><p style={{fontSize:'15px',lineHeight:'2.3'}}>Ovos inteiros • Queijo fresco • Iogurte grego natural • Requeijão • Queijo cottage</p></div>
        </div>
        <div className="footer"><span>Documento exclusivo de {dados.nome}</span><span>Página 5 de 10</span></div>
      </div>

      {/* PÁGINA 6 - HIDRATOS E GORDURAS */}
      <div className="page" style={{padding:'45px'}}>
        <div className="header">
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}><div className="logo">V</div><span style={{fontWeight:'600',fontSize:'18px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div>
        </div>
        <div className="title">🍚 Hidratos Saudáveis & 🥑 Gorduras</div>
        <div className="grid-2" style={{marginBottom:'22px'}}>
          <div className="portion-card portion-carbs" style={{padding:'25px',textAlign:'left'}}><div style={{fontWeight:'600',color:'#1565C0',marginBottom:'15px',fontSize:'16px'}}>Tubérculos & Grãos</div><p style={{fontSize:'14px',lineHeight:'2'}}>Batata-doce • Mandioca • Inhame • Arroz integral • Quinoa • Aveia</p></div>
          <div className="portion-card portion-carbs" style={{padding:'25px',textAlign:'left'}}><div style={{fontWeight:'600',color:'#1565C0',marginBottom:'15px',fontSize:'16px'}}>Frutas (baixo IG)</div><p style={{fontSize:'14px',lineHeight:'2'}}>Frutos vermelhos • Maçã verde • Pera • Laranja • Toranja • Kiwi</p></div>
        </div>
        <div className="grid-2" style={{marginBottom:'22px'}}>
          <div className="portion-card portion-fats" style={{padding:'25px',textAlign:'left'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'15px',fontSize:'16px'}}>Óleos & Manteigas</div><p style={{fontSize:'14px',lineHeight:'2'}}>Azeite extra-virgem • Óleo de coco • Manteiga • Ghee</p></div>
          <div className="portion-card portion-fats" style={{padding:'25px',textAlign:'left'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'15px',fontSize:'16px'}}>Frutos Secos & Sementes</div><p style={{fontSize:'14px',lineHeight:'2'}}>Amêndoas • Nozes • Cajus • Sementes de chia • Linhaça</p></div>
        </div>
        <div className="portion-card portion-fats" style={{padding:'25px',textAlign:'left'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'15px',fontSize:'16px'}}>Outras Fontes de Gordura Saudável</div><p style={{fontSize:'14px',lineHeight:'2'}}>Abacate • Azeitonas • Coco • Chocolate negro (+70%) • Gema de ovo</p></div>
        <div className="footer"><span>Documento exclusivo de {dados.nome}</span><span>Página 6 de 10</span></div>
      </div>

      {/* PÁGINA 7 - VEGETAIS */}
      <div className="page" style={{padding:'45px'}}>
        <div className="header">
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}><div className="logo">V</div><span style={{fontWeight:'600',fontSize:'18px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div>
        </div>
        <div className="title">🥬 Vegetais — Come o Arco-Íris!</div>
        <p style={{fontSize:'14px',color:'#8B4513',marginBottom:'28px',textAlign:'center'}}>Cada cor representa diferentes nutrientes. Inclui pelo menos 3 cores por refeição!</p>
        <div className="grid-2" style={{marginBottom:'18px'}}>
          <div className="card" style={{borderLeft:'7px solid #4CAF50',background:'linear-gradient(135deg, #F1F8E9, #DCEDC8)'}}><div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'14px',fontSize:'16px'}}>🟢 Verdes</div><p style={{fontSize:'14px',lineHeight:'1.9'}}>Espinafre, Couve, Brócolos, Alface, Rúcula, Pepino, Abobrinha</p></div>
          <div className="card" style={{borderLeft:'7px solid #F44336',background:'linear-gradient(135deg, #FFEBEE, #FFCDD2)'}}><div style={{fontWeight:'600',color:'#C62828',marginBottom:'14px',fontSize:'16px'}}>🔴 Vermelhos</div><p style={{fontSize:'14px',lineHeight:'1.9'}}>Tomate, Pimento vermelho, Beterraba, Rabanete</p></div>
        </div>
        <div className="grid-2" style={{marginBottom:'18px'}}>
          <div className="card" style={{borderLeft:'7px solid #FF9800',background:'linear-gradient(135deg, #FFF3E0, #FFE0B2)'}}><div style={{fontWeight:'600',color:'#E65100',marginBottom:'14px',fontSize:'16px'}}>🟠 Laranjas</div><p style={{fontSize:'14px',lineHeight:'1.9'}}>Cenoura, Abóbora, Pimento laranja</p></div>
          <div className="card" style={{borderLeft:'7px solid #9E9E9E',background:'linear-gradient(135deg, #FAFAFA, #F5F5F5)'}}><div style={{fontWeight:'600',color:'#616161',marginBottom:'14px',fontSize:'16px'}}>⚪ Brancos</div><p style={{fontSize:'14px',lineHeight:'1.9'}}>Couve-flor, Cogumelos, Alho, Cebola, Nabo</p></div>
        </div>
        <div className="card" style={{borderLeft:'7px solid #9C27B0',background:'linear-gradient(135deg, #F3E5F5, #E1BEE7)'}}><div style={{fontWeight:'600',color:'#6A1B9A',marginBottom:'14px',fontSize:'16px'}}>🟣 Roxos</div><p style={{fontSize:'14px',lineHeight:'1.9'}}>Beringela, Couve roxa, Cebola roxa</p></div>
        <div className="footer"><span>Documento exclusivo de {dados.nome}</span><span>Página 7 de 10</span></div>
      </div>

      {/* PÁGINA 8 - LISTA DE COMPRAS */}
      <div className="page" style={{padding:'45px'}}>
        <div className="header">
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}><div className="logo">V</div><span style={{fontWeight:'600',fontSize:'18px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div>
        </div>
        <div className="title">🛒 Lista de Compras Semanal</div>
        <div className="grid-2">
          <div className="card"><div style={{fontWeight:'600',color:'#C62828',marginBottom:'20px',fontSize:'17px',borderBottom:'2px solid #E57373',paddingBottom:'12px'}}>🥩 Proteínas</div><div style={{fontSize:'15px',lineHeight:'2.6'}}>☐ Peito de frango (1kg)<br/>☐ Ovos (2 dúzias)<br/>☐ Peixe fresco (500g)<br/>☐ Carne moída magra (500g)</div></div>
          <div className="card"><div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'20px',fontSize:'17px',borderBottom:'2px solid #81C784',paddingBottom:'12px'}}>🥬 Vegetais</div><div style={{fontSize:'15px',lineHeight:'2.6'}}>☐ Espinafre/Couve<br/>☐ Brócolos<br/>☐ Tomate<br/>☐ Pepino<br/>☐ Pimentos<br/>☐ Cebola e Alho</div></div>
          <div className="card"><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'20px',fontSize:'17px',borderBottom:'2px solid #FFD54F',paddingBottom:'12px'}}>🥑 Gorduras</div><div style={{fontSize:'15px',lineHeight:'2.6'}}>☐ Azeite extra-virgem<br/>☐ Abacate (2-3)<br/>☐ Manteiga<br/>☐ Amêndoas/Nozes</div></div>
          <div className="card"><div style={{fontWeight:'600',color:'#8B4513',marginBottom:'20px',fontSize:'17px',borderBottom:'2px solid #D2B48C',paddingBottom:'12px'}}>🧂 Outros</div><div style={{fontSize:'15px',lineHeight:'2.6'}}>☐ Sal e pimenta<br/>☐ Ervas frescas<br/>☐ Limões<br/>☐ Chá/Café</div></div>
        </div>
        <div className="footer"><span>Documento exclusivo de {dados.nome}</span><span>Página 8 de 10</span></div>
      </div>

      {/* PÁGINA 9 - REGRAS */}
      <div className="page" style={{padding:'45px'}}>
        <div className="header">
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}><div className="logo">V</div><span style={{fontWeight:'600',fontSize:'18px',color:'#C1634A',letterSpacing:'3px'}}>VITALIS</span></div>
        </div>
        <div className="title">📋 Regras da {faseConfig.nome}</div>
        <div className="grid-2" style={{marginBottom:'22px'}}>
          <div className="portion-card rules-priority" style={{padding:'30px',textAlign:'left'}}><div style={{fontWeight:'600',color:'#2E7D32',marginBottom:'20px',fontSize:'17px'}}>✓ PRIORIZAR</div><div style={{fontSize:'14px',lineHeight:'2.3'}}>{faseConfig.priorizar.map((item, i) => <div key={i}>✓ {item}</div>)}</div></div>
          <div className="portion-card rules-avoid" style={{padding:'30px',textAlign:'left'}}><div style={{fontWeight:'600',color:'#C62828',marginBottom:'20px',fontSize:'17px'}}>✗ EVITAR</div><div style={{fontSize:'14px',lineHeight:'2.3'}}>{faseConfig.evitar.map((item, i) => <div key={i}>✗ {item}</div>)}</div></div>
        </div>
        <div className="portion-card rules-tips" style={{padding:'30px',textAlign:'left'}}><div style={{fontWeight:'600',color:'#F57F17',marginBottom:'20px',fontSize:'17px'}}>💡 DICAS PARA O SUCESSO</div><div style={{fontSize:'14px',lineHeight:'2.3'}}>{faseConfig.dicas.map((item, i) => <div key={i}>• {item}</div>)}</div></div>
        <div className="footer"><span>Documento exclusivo de {dados.nome}</span><span>Página 9 de 10</span></div>
      </div>

      {/* PÁGINA 10 - FINAL */}
      <div className="page" style={{display:'flex',flexDirection:'column'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'55px'}}>
          <div style={{width:'110px',height:'110px',background:'linear-gradient(135deg, #C1634A, #8B4513)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'28px',boxShadow:'0 12px 35px rgba(193,99,74,0.4)'}}><span style={{color:'white',fontSize:'60px',fontWeight:'bold'}}>V</span></div>
          <div style={{fontSize:'52px',fontWeight:'700',color:'#A0422A',letterSpacing:'14px',marginBottom:'65px'}}>VITALIS</div>
          <div style={{maxWidth:'450px',textAlign:'center',padding:'50px',background:'white',borderRadius:'28px',boxShadow:'0 18px 55px rgba(0,0,0,0.1)',marginBottom:'65px'}}><div style={{fontSize:'65px',color:'#D2B48C',marginBottom:'18px',lineHeight:'0.5'}}>"</div><p style={{fontSize:'28px',color:'#6B4423',fontStyle:'italic',lineHeight:'1.7'}}>Quando o excesso cai, o corpo responde.</p></div>
          <div style={{textAlign:'center'}}><div style={{fontSize:'12px',color:'#8B4513',letterSpacing:'5px',marginBottom:'18px'}}>CRIADO EXCLUSIVAMENTE PARA</div><div style={{fontSize:'42px',fontWeight:'600',color:'#6B4423'}}>{dados.nome}</div></div>
        </div>
        <div style={{background:'#6B4423',padding:'28px 55px',display:'flex',justifyContent:'space-between'}}>
          <div style={{color:'rgba(255,255,255,0.95)',fontSize:'12px'}}><div style={{fontWeight:'600',marginBottom:'3px'}}>Vivianne Saraiva</div><div style={{opacity:0.85}}>Precision Nutrition Level 1 Coach</div></div>
          <div style={{color:'rgba(255,255,255,0.95)',fontSize:'12px',textAlign:'right'}}><div style={{marginBottom:'3px'}}>vivianne.saraiva@outlook.com</div><div style={{opacity:0.85}}>WhatsApp: +258 84 524 3875</div></div>
        </div>
      </div>
    </>
  );
}
