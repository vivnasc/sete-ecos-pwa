// src/pages/PlanoHTML.jsx
// Página do Plano optimizada para impressão/PDF - PREMIUM EDITION

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

const FASES_CONFIG = {
  inducao: {
    nome: 'Fase 1: Indução',
    duracao: '3-4 semanas',
    descricao: 'A fase de arranque onde o corpo entra em modo de queima de gordura. Foco em proteína, gorduras saudáveis e vegetais. Esta fase é desafiante mas transformadora — o teu corpo vai adaptar-se a usar gordura como combustível principal.',
    objetivo: 'Entrar em cetose nutricional e começar a perder peso de forma consistente.',
    expectativa: 'Perda de 2-4 kg nas primeiras 2 semanas (maioria água), depois 0.5-1kg por semana.',
    priorizar: ['Proteína em todas as refeições (palma da mão)', 'Vegetais verdes em abundância (pelo menos 4 punhos/dia)', 'Gorduras saudáveis (azeite, abacate, nozes)', 'Água cristalina (mínimo 2.5L por dia)', 'Sono reparador (7-9 horas por noite)', 'Electrólitos (sal marinho, magnésio)'],
    evitar: ['Açúcar e adoçantes (até stevia)', 'Grãos e cereais (pão, massa, arroz)', 'Frutas doces (banana, manga, uvas)', 'Leguminosas (feijão, grão, lentilhas)', 'Álcool (bloqueia cetose)', 'Alimentos processados'],
    dicas: ['Prepara as refeições ao domingo — facilita a semana', 'Tem snacks keto à mão (ovos cozidos, queijo, nozes)', 'Podes sentir "keto flu" dias 2-4 — é temporário', 'Adiciona 1 colher de sal na água 2x/dia', 'Pesa-te às sextas-feiras, em jejum', 'Tira fotos semanais — a balança não conta tudo']
  },
  transicao: {
    nome: 'Fase 2: Transição',
    duracao: '4-6 semanas',
    descricao: 'Reintrodução gradual de hidratos complexos enquanto mantemos a perda de gordura. O corpo adapta-se a usar carbs de forma eficiente sem acumular. Aprendes o que funciona para TI.',
    objetivo: 'Encontrar o teu ponto de equilíbrio — quantos hidratos consegues comer mantendo resultados.',
    expectativa: 'Perda de 0.5-1kg por semana. Algumas oscilações são normais ao testar novos alimentos.',
    priorizar: ['Manter proteína elevada em todas as refeições', 'Hidratos complexos pós-treino (batata-doce, arroz integral, aveia)', 'Fruta de baixo índice glicémico (maçã, frutos vermelhos, pera)', 'Leguminosas em moderação (½ chávena por dia)', 'Água (mínimo 2L por dia)', 'Movimento regular (caminhada 30min/dia)'],
    evitar: ['Açúcar refinado e adoçantes artificiais', 'Farinhas brancas e pão branco', 'Alimentos ultra-processados', 'Bebidas açucaradas e sumos de pacote', 'Refeições sem proteína', 'Comer emocional sem consciência'],
    dicas: ['Introduz UM hidrato novo por semana', 'Observa como o corpo reage nas 48h seguintes', 'Mantém o diário alimentar — é essencial agora', 'Se o peso subir mais de 1kg e mantiver, volta atrás 1 passo', 'Hidratos funcionam melhor perto do treino', 'O processo é individual — não te compares']
  },
  estabilizacao: {
    nome: 'Fase 2: Estabilização',
    duracao: '6-8 semanas',
    descricao: 'Consolidação dos resultados e criação de hábitos sustentáveis. Aqui solidificas as mudanças — o que começou como esforço torna-se natural.',
    objetivo: 'Manter o peso alcançado enquanto expandes o leque de alimentos permitidos.',
    expectativa: 'Peso estável com variações de ±0.5kg. Foco em composição corporal, não só balança.',
    priorizar: ['Manter proteína elevada', 'Hidratos complexos (batata-doce, arroz integral)', 'Fruta de baixo índice glicémico', 'Leguminosas em moderação', 'Sono e gestão de stress', 'Rotina de refeições consistente'],
    evitar: ['Açúcar refinado', 'Farinhas brancas', 'Alimentos processados', 'Bebidas açucaradas', 'Saltar refeições', 'Voltar aos velhos padrões'],
    dicas: ['Introduz um alimento de cada vez', 'Observa como o corpo reage', 'Mantém o diário alimentar', 'Celebra as vitórias não-balança (energia, sono, roupas)', 'Uma refeição livre por semana é saudável', 'Constrói a tua identidade nova']
  },
  recomposicao: {
    nome: 'Fase 3: Recomposição',
    duracao: '6-8 semanas',
    descricao: 'Foco em ganhar músculo e perder gordura em simultâneo. Mais hidratos nos dias de treino, mais proteína para recuperação muscular. O corpo transforma-se enquanto a balança quase não se mexe.',
    objetivo: 'Trocar gordura por músculo — ficar mais forte, definida e saudável.',
    expectativa: 'Peso estável OU até aumento ligeiro, mas corpo visivelmente mais definido. Força e energia aumentam.',
    priorizar: ['Proteína elevada (1.8-2g por kg de peso)', 'Hidratos antes e depois do treino (timing importa)', 'Variedade de vegetais e cores', 'Sono de 7-9 horas para recuperação', 'Treino de força 3-4x por semana', 'Descanso activo nos dias off'],
    evitar: ['Comer pouco nos dias de treino', 'Saltar refeições pós-treino', 'Alimentos processados e açúcar', 'Álcool (prejudica recuperação muscular)', 'Cardio excessivo sem força', 'Dietas restritivas'],
    dicas: ['Come mais hidratos nos dias de treino', 'Proteína em todas as refeições (mesmo snacks)', 'Pesa-te semanalmente ao mesmo dia/hora', 'Mede também cintura, quadris, braços', 'Tira fotos mensais — a diferença é visual', 'Progressão no treino = progressão no corpo']
  },
  reeducacao: {
    nome: 'Fase 3: Reeducação',
    duracao: '6-8 semanas',
    descricao: 'Aprender a comer de forma equilibrada e intuitiva para a vida. Desenvolves a tua bússola interna — sabes o que te faz bem sem regras externas.',
    objetivo: 'Comer de forma consciente, equilibrada e prazerosa sem dependência de planos.',
    expectativa: 'Peso estável. Liberdade alimentar com responsabilidade. Menos stress com comida.',
    priorizar: ['Equilíbrio em todas as refeições', 'Variedade alimentar e cores', 'Comer com atenção plena (sem ecrãs)', 'Flexibilidade saudável', 'Escuta dos sinais de fome e saciedade', 'Prazer e nutrição em harmonia'],
    evitar: ['Restrições extremas', 'Mentalidade de dieta', 'Comer emocional inconsciente', 'Culpa e compensação', 'Rigidez alimentar', 'Ignorar o corpo'],
    dicas: ['Pratica a escuta do corpo antes de comer', 'Permite-te flexibilidade 80/20', 'Foca em como te sentes, não só no peso', 'Refeições sociais são para aproveitar', 'Volta ao básico quando necessário', 'Confia no processo — és capaz']
  },
  manutencao: {
    nome: 'Fase 4: Manutenção',
    duracao: 'Contínua',
    descricao: 'Manter os resultados com um estilo de vida equilibrado e sustentável a longo prazo. Isto não é o fim — é o teu novo normal. Aqui vives a versão melhorada de ti.',
    objetivo: 'Viver bem, com energia, saúde e equilíbrio. Manter composição corporal sem obsessão.',
    expectativa: 'Peso estável ±1kg. Vida plena sem stress com comida. Corpo saudável e forte.',
    priorizar: ['Consistência nas refeições (não perfeição)', 'Movimento regular (3-5x por semana)', 'Sono de qualidade (7-9 horas)', 'Gestão do stress (meditação, natureza)', 'Hidratação adequada (2L/dia)', 'Conexão social e alegria'],
    evitar: ['Voltar aos velhos hábitos alimentares', 'Ignorar sinais de fome e saciedade', 'Perder a rotina de refeições', 'Dietas extremas ou restritivas', 'Comparação com outros', 'Negligenciar o autocuidado'],
    dicas: ['Pesagem semanal (mesmo dia e hora) — não diária', 'Ajusta porções conforme necessário', 'Celebra as vitórias, mesmo as pequenas', 'Uma refeição livre por semana é saudável', 'Volta ao plano quando desviares 2-3 dias', 'És uma obra em progresso — sempre']
  }
};

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

      let porcoesFromPlan = {};
      try {
        const receitasConfig = plano?.receitas_incluidas ? JSON.parse(plano.receitas_incluidas) : {};
        porcoesFromPlan = receitasConfig['porções_por_refeicao'] || receitasConfig.porcoes_por_refeicao || {};
      } catch (e) { /* ignore */ }

      const proteinaG = plano?.proteina_g || 120;
      const carboidratosG = plano?.carboidratos_g || 100;
      const gorduraG = plano?.gordura_g || 60;

      setDados({
        nome: intake?.nome || 'Cliente',
        peso_actual: plano?.peso_actual || cliente?.peso_actual || 70,
        peso_meta: plano?.peso_meta || cliente?.peso_meta || 60,
        fase: plano?.fase || 'inducao',
        calorias: plano?.calorias_diarias || plano?.calorias_alvo || 1500,
        proteina_g: proteinaG,
        carboidratos_g: carboidratosG,
        gordura_g: gorduraG,
        porcoes_proteina: plano?.porcoes_proteina || porcoesFromPlan.proteina || Math.round(proteinaG / 25),
        porcoes_legumes: plano?.porcoes_legumes || porcoesFromPlan.legumes || 4,
        porcoes_hidratos: plano?.porcoes_hidratos || porcoesFromPlan.hidratos || Math.round(carboidratosG / 30),
        porcoes_gordura: plano?.porcoes_gordura || porcoesFromPlan.gordura || Math.round(gorduraG / 10),
        tamanho_palma: plano?.tamanho_palma_g || 20,
        tamanho_mao: plano?.tamanho_mao_g || 25,
        tamanho_polegar: plano?.tamanho_polegar_g || 7,
        data_inicio: plano?.data_inicio_fase || plano?.created_at || new Date().toISOString(),
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
        <p style={{marginTop:'20px',color:'#6B5C4C',fontFamily:'Georgia,serif',fontSize:'16px'}}>A preparar o teu plano premium...</p>
        <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!dados) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#FAF7F2'}}>
      <div style={{textAlign:'center',color:'#C62828'}}>
        <p style={{fontFamily:'Georgia,serif',fontSize:'18px'}}>Plano não encontrado</p>
        <button onClick={() => window.close()} style={{marginTop:'20px',padding:'12px 35px',background:'#7C8B6F',color:'white',border:'none',borderRadius:'10px',cursor:'pointer',fontFamily:'Georgia,serif',fontSize:'15px'}}>Fechar</button>
      </div>
    </div>
  );

  const faseConfig = FASES_CONFIG[dados.fase] || FASES_CONFIG.inducao;
  const formatarData = (d) => d ? new Date(d).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const Logo = ({ size = 80 }) => (
    <img src={LOGO_PATH} alt="Vitalis" style={{width:`${size}px`,height:`${size}px`,objectFit:'contain'}} />
  );

  const PageHeader = () => (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #C5D1BC',paddingBottom:'16px',marginBottom:'30px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
        <Logo size={42} />
        <span style={{fontWeight:'600',fontSize:'20px',color:'#7C8B6F',letterSpacing:'4px',fontFamily:'Georgia,serif'}}>VITALIS</span>
      </div>
      <div style={{fontSize:'14px',color:'#6B5C4C',fontWeight:'500',fontFamily:'Georgia,serif'}}>{faseConfig.nome}</div>
    </div>
  );

  const PageFooter = ({ page, total = 12 }) => (
    <div style={{position:'absolute',bottom:'25px',left:'35px',right:'35px',display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#6B5C4C',borderTop:'1px solid #C5D1BC',paddingTop:'12px',fontFamily:'Georgia,serif'}}>
      <span>Plano exclusivo de {dados.nome}</span>
      <span>Página {page} de {total}</span>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap');
        @page { size: A4; margin: 0; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; }
        body { font-family: 'Lato', 'Segoe UI', sans-serif; background: #FAF7F2; color: #3A3025; }
        .page {
          width: 210mm;
          height: 297mm;
          min-height: 297mm;
          max-height: 297mm;
          background: #FAF7F2;
          position: relative;
          overflow: hidden;
          padding: 0;
        }
        .page-content {
          padding: 35px 35px 70px 35px;
          height: 100%;
        }
        @media screen {
          .page { margin: 20px auto; box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
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
        h1, h2, h3 { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>

      <div className="no-print" style={{position:'fixed',bottom:'30px',right:'30px',zIndex:1000,display:'flex',gap:'12px'}}>
        <button onClick={() => window.print()} style={{padding:'16px 32px',background:'linear-gradient(135deg, #7C8B6F, #5A6B4D)',color:'white',border:'none',borderRadius:'14px',fontSize:'16px',fontWeight:'600',cursor:'pointer',boxShadow:'0 6px 24px rgba(124,139,111,0.4)',fontFamily:'Lato,sans-serif'}}>
          🖨️ Imprimir / Guardar PDF
        </button>
        <button onClick={() => window.close()} style={{padding:'16px 24px',background:'#666',color:'white',border:'none',borderRadius:'14px',fontSize:'16px',cursor:'pointer',fontFamily:'Lato,sans-serif'}}>✕</button>
      </div>

      {/* PÁGINA 1 - CAPA */}
      <div className="page" style={{display:'flex',flexDirection:'column'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 50px'}}>
          <Logo size={160} />
          <div style={{fontSize:'15px',color:'#6B5C4C',letterSpacing:'7px',marginTop:'18px',fontFamily:'Lato,sans-serif',fontWeight:'300'}}>A RAIZ DA TRANSFORMAÇÃO</div>
          <div style={{width:'140px',height:'3px',background:'linear-gradient(90deg, transparent, #7C8B6F, transparent)',margin:'55px 0'}}></div>
          <h1 style={{fontSize:'42px',fontWeight:'600',color:'#3A3025',letterSpacing:'5px',fontFamily:'Cormorant Garamond,serif',marginBottom:'8px'}}>Guia Personalizado</h1>
          <div style={{fontSize:'20px',color:'#7C8B6F',fontWeight:'500',letterSpacing:'7px',marginTop:'8px',marginBottom:'60px',fontFamily:'Lato,sans-serif'}}>PLANO ALIMENTAR</div>

          <div style={{background:'white',border:'2px solid #C5D1BC',borderRadius:'30px',padding:'50px 100px',textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,0.1)'}}>
            <div style={{fontSize:'12px',color:'#6B5C4C',letterSpacing:'5px',marginBottom:'14px',fontFamily:'Lato,sans-serif',fontWeight:'300'}}>PREPARADO EXCLUSIVAMENTE PARA</div>
            <div style={{fontSize:'44px',fontWeight:'600',color:'#3A3025',marginBottom:'35px',fontFamily:'Cormorant Garamond,serif'}}>{dados.nome}</div>
            <div style={{display:'flex',gap:'50px',justifyContent:'center',alignItems:'center',marginBottom:'28px'}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'11px',color:'#6B5C4C',letterSpacing:'3px',marginBottom:'8px',fontFamily:'Lato,sans-serif'}}>PESO ACTUAL</div>
                <div style={{fontSize:'40px',color:'#6B7A5D',fontWeight:'700',fontFamily:'Cormorant Garamond,serif'}}>{dados.peso_actual} kg</div>
              </div>
              <div style={{color:'#6B8E23',fontSize:'45px'}}>→</div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'11px',color:'#6B5C4C',letterSpacing:'3px',marginBottom:'8px',fontFamily:'Lato,sans-serif'}}>META</div>
                <div style={{fontSize:'40px',color:'#6B8E23',fontWeight:'700',fontFamily:'Cormorant Garamond,serif'}}>{dados.peso_meta} kg</div>
              </div>
            </div>
            <div style={{fontSize:'15px',color:'#6B5C4C',fontFamily:'Georgia,serif'}}>Início: {formatarData(dados.data_inicio)}</div>
          </div>
        </div>
        <div style={{background:'linear-gradient(135deg, #3A3025, #4A4035)',padding:'32px 60px',display:'flex',justifyContent:'space-between'}}>
          <div style={{color:'rgba(255,255,255,0.95)',fontSize:'13px',fontFamily:'Lato,sans-serif'}}>
            <div style={{fontWeight:'600',marginBottom:'4px'}}>Vivianne Saraiva</div>
            <div style={{opacity:0.85}}>Precision Nutrition Level 1 Coach</div>
          </div>
          <div style={{color:'rgba(255,255,255,0.95)',fontSize:'13px',textAlign:'right',fontFamily:'Lato,sans-serif'}}>
            <div style={{marginBottom:'4px'}}>vivianne.saraiva@outlook.com</div>
            <div style={{opacity:0.85}}>WhatsApp: +258 85 100 6473</div>
          </div>
        </div>
      </div>

      {/* PÁGINA 2 - BEM-VINDA + FASE */}
      <div className="page">
        <div className="page-content">
          <PageHeader />

          <h2 style={{fontSize:'30px',fontWeight:'600',color:'#3A3025',marginBottom:'22px',fontFamily:'Cormorant Garamond,serif'}}>👋 Boas-vindas à Tua Jornada</h2>

          <div style={{background:'linear-gradient(135deg, #FFFFFF, #F5F0E8)',border:'1px solid #C5D1BC',borderRadius:'16px',padding:'30px',marginBottom:'28px',boxShadow:'0 4px 16px rgba(0,0,0,0.06)'}}>
            <p style={{fontSize:'16px',lineHeight:'2',color:'#3A3025',fontFamily:'Georgia,serif'}}>
              <strong style={{color:'#7C8B6F',fontSize:'18px'}}>{dados.nome}</strong>, este guia foi criado especialmente para ti, com base nas tuas respostas, objectivos e estilo de vida.
            </p>
            <p style={{fontSize:'16px',lineHeight:'2',color:'#3A3025',marginTop:'18px',fontFamily:'Georgia,serif'}}>
              Cada porção, cada recomendação, cada conselho foi calculado para o <em>teu</em> corpo e para onde queres chegar. Não é um plano genérico — é o <strong>teu plano</strong>.
            </p>
            <p style={{fontSize:'16px',lineHeight:'2',color:'#3A3025',marginTop:'18px',fontFamily:'Georgia,serif'}}>
              Nas próximas páginas vais encontrar tudo o que precisas para ter sucesso: porções personalizadas, listas de compras, equivalências práticas, e orientações fase a fase. <strong>Guarda este documento</strong> — vai ser o teu companheiro de jornada.
            </p>
          </div>

          <h2 style={{fontSize:'28px',fontWeight:'600',color:'#3A3025',marginBottom:'20px',marginTop:'35px',fontFamily:'Cormorant Garamond,serif'}}>🔥 {faseConfig.nome}</h2>

          <div style={{background:'linear-gradient(135deg, #FFFFFF, #FDF8F3)',border:'1px solid #C5D1BC',borderRadius:'16px',padding:'28px',marginBottom:'20px',boxShadow:'0 4px 16px rgba(0,0,0,0.06)'}}>
            <span style={{display:'inline-block',padding:'10px 24px',background:'linear-gradient(135deg, #7C8B6F, #8B9A7A)',color:'white',borderRadius:'25px',fontSize:'13px',marginBottom:'18px',fontFamily:'Lato,sans-serif',fontWeight:'600'}}>Duração: {faseConfig.duracao}</span>
            <p style={{fontSize:'16px',lineHeight:'2',color:'#3A3025',fontFamily:'Georgia,serif'}}>{faseConfig.descricao}</p>

            <div style={{marginTop:'22px',padding:'18px',background:'#F5F0E8',borderRadius:'12px',borderLeft:'4px solid #7C8B6F'}}>
              <div style={{fontSize:'13px',color:'#7C8B6F',fontWeight:'700',marginBottom:'8px',letterSpacing:'2px',fontFamily:'Lato,sans-serif'}}>OBJECTIVO</div>
              <p style={{fontSize:'15px',color:'#3A3025',lineHeight:'1.8',fontFamily:'Georgia,serif'}}>{faseConfig.objetivo}</p>
            </div>

            <div style={{marginTop:'16px',padding:'18px',background:'#F5F0E8',borderRadius:'12px',borderLeft:'4px solid #6B8E23'}}>
              <div style={{fontSize:'13px',color:'#6B8E23',fontWeight:'700',marginBottom:'8px',letterSpacing:'2px',fontFamily:'Lato,sans-serif'}}>O QUE ESPERAR</div>
              <p style={{fontSize:'15px',color:'#3A3025',lineHeight:'1.8',fontFamily:'Georgia,serif'}}>{faseConfig.expectativa}</p>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
            <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'28px',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize:'12px',color:'#7C8B6F',letterSpacing:'3px',marginBottom:'14px',fontFamily:'Lato,sans-serif',fontWeight:'600'}}>ABORDAGEM NUTRICIONAL</div>
              <div style={{fontSize:'28px',fontWeight:'600',color:'#6B7A5D',textTransform:'capitalize',fontFamily:'Cormorant Garamond,serif'}}>{dados.abordagem?.replace('_', ' ')}</div>
            </div>
            <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'28px',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize:'12px',color:'#7C8B6F',letterSpacing:'3px',marginBottom:'14px',fontFamily:'Lato,sans-serif',fontWeight:'600'}}>META SEMANAL</div>
              <div style={{fontSize:'28px',fontWeight:'600',color:'#6B8E23',fontFamily:'Cormorant Garamond,serif'}}>-0.5 a -1.0 kg</div>
            </div>
          </div>

          <PageFooter page={2} />
        </div>
      </div>

      {/* PÁGINA 3 - PORÇÕES (MÉTODO DA MÃO) */}
      <div className="page">
        <div className="page-content">
          <PageHeader />

          <h2 style={{fontSize:'30px',fontWeight:'600',color:'#3A3025',marginBottom:'12px',fontFamily:'Cormorant Garamond,serif'}}>🤚 A Tua Mão É a Tua Medida</h2>
          <p style={{fontSize:'15px',color:'#6B5C4C',marginBottom:'24px',fontFamily:'Georgia,serif',lineHeight:'1.8'}}>
            <strong>Sem balança, sem stress, sem apps.</strong> A tua mão é proporcional ao teu corpo — mãos maiores significam corpo maior, logo porções maiores. É simples, prático e funciona em qualquer lugar.
          </p>

          <div style={{background:'linear-gradient(135deg, #7C8B6F, #5A6B4D)',borderRadius:'18px',padding:'22px 28px',marginBottom:'24px',display:'flex',justifyContent:'space-around',alignItems:'center',boxShadow:'0 6px 20px rgba(124,139,111,0.3)'}}>
            <div style={{textAlign:'center',color:'white'}}>
              <div style={{fontSize:'32px',marginBottom:'4px'}}>🫲</div>
              <div style={{fontSize:'11px',fontWeight:'700',letterSpacing:'1.5px',marginTop:'4px',fontFamily:'Lato,sans-serif'}}>PALMA</div>
              <div style={{fontSize:'10px',opacity:0.9,marginTop:'2px',fontFamily:'Georgia,serif'}}>Proteína</div>
            </div>
            <div style={{textAlign:'center',color:'white'}}>
              <div style={{fontSize:'32px',marginBottom:'4px'}}>✊</div>
              <div style={{fontSize:'11px',fontWeight:'700',letterSpacing:'1.5px',marginTop:'4px',fontFamily:'Lato,sans-serif'}}>PUNHO</div>
              <div style={{fontSize:'10px',opacity:0.9,marginTop:'2px',fontFamily:'Georgia,serif'}}>Legumes</div>
            </div>
            <div style={{textAlign:'center',color:'white'}}>
              <div style={{fontSize:'32px',marginBottom:'4px'}}>🤲</div>
              <div style={{fontSize:'11px',fontWeight:'700',letterSpacing:'1.5px',marginTop:'4px',fontFamily:'Lato,sans-serif'}}>MÃO CONCHA</div>
              <div style={{fontSize:'10px',opacity:0.9,marginTop:'2px',fontFamily:'Georgia,serif'}}>Hidratos</div>
            </div>
            <div style={{textAlign:'center',color:'white'}}>
              <div style={{fontSize:'32px',marginBottom:'4px'}}>👍</div>
              <div style={{fontSize:'11px',fontWeight:'700',letterSpacing:'1.5px',marginTop:'4px',fontFamily:'Lato,sans-serif'}}>POLEGAR</div>
              <div style={{fontSize:'10px',opacity:0.9,marginTop:'2px',fontFamily:'Georgia,serif'}}>Gordura</div>
            </div>
          </div>

          <h3 style={{fontSize:'20px',fontWeight:'600',color:'#3A3025',marginBottom:'18px',fontFamily:'Cormorant Garamond,serif'}}>As Tuas Porções Diárias:</h3>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'18px'}}>
            <div style={{background:'linear-gradient(135deg, #FFEBEE, #FFCDD2)',border:'3px solid #E57373',borderRadius:'20px',padding:'24px',textAlign:'center',boxShadow:'0 4px 16px rgba(229,115,115,0.2)'}}>
              <div style={{fontSize:'36px',marginBottom:'6px'}}>🫲</div>
              <div style={{fontSize:'15px',fontWeight:'600',color:'#C62828',marginBottom:'6px',fontFamily:'Lato,sans-serif'}}>Proteína</div>
              <div style={{fontSize:'52px',fontWeight:'700',color:'#C62828',lineHeight:1,fontFamily:'Cormorant Garamond,serif'}}>{dados.porcoes_proteina}</div>
              <div style={{fontSize:'13px',color:'#6B5C4C',marginTop:'8px',fontFamily:'Georgia,serif'}}>palmas por dia</div>
              <div style={{fontSize:'11px',color:'#999',marginTop:'6px',fontFamily:'Georgia,serif',fontStyle:'italic'}}>Tamanho e espessura da tua palma</div>
            </div>

            <div style={{background:'linear-gradient(135deg, #E8F5E9, #C8E6C9)',border:'3px solid #81C784',borderRadius:'20px',padding:'24px',textAlign:'center',boxShadow:'0 4px 16px rgba(129,199,132,0.2)'}}>
              <div style={{fontSize:'36px',marginBottom:'6px'}}>✊</div>
              <div style={{fontSize:'15px',fontWeight:'600',color:'#2E7D32',marginBottom:'6px',fontFamily:'Lato,sans-serif'}}>Legumes</div>
              <div style={{fontSize:'52px',fontWeight:'700',color:'#2E7D32',lineHeight:1,fontFamily:'Cormorant Garamond,serif'}}>{dados.porcoes_legumes}</div>
              <div style={{fontSize:'13px',color:'#6B5C4C',marginTop:'8px',fontFamily:'Georgia,serif'}}>punhos por dia (mínimo)</div>
              <div style={{fontSize:'11px',color:'#999',marginTop:'6px',fontFamily:'Georgia,serif',fontStyle:'italic'}}>Tamanho do teu punho fechado</div>
            </div>

            <div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',border:'3px solid #64B5F6',borderRadius:'20px',padding:'24px',textAlign:'center',boxShadow:'0 4px 16px rgba(100,181,246,0.2)'}}>
              <div style={{fontSize:'36px',marginBottom:'6px'}}>🤲</div>
              <div style={{fontSize:'15px',fontWeight:'600',color:'#1565C0',marginBottom:'6px',fontFamily:'Lato,sans-serif'}}>Hidratos</div>
              <div style={{fontSize:'52px',fontWeight:'700',color:'#1565C0',lineHeight:1,fontFamily:'Cormorant Garamond,serif'}}>{dados.porcoes_hidratos}</div>
              <div style={{fontSize:'13px',color:'#6B5C4C',marginTop:'8px',fontFamily:'Georgia,serif'}}>mãos concha por dia</div>
              <div style={{fontSize:'11px',color:'#999',marginTop:'6px',fontFamily:'Georgia,serif',fontStyle:'italic'}}>O que cabe na tua mão em concha</div>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'3px solid #FFD54F',borderRadius:'20px',padding:'24px',textAlign:'center',boxShadow:'0 4px 16px rgba(255,213,79,0.2)'}}>
              <div style={{fontSize:'36px',marginBottom:'6px'}}>👍</div>
              <div style={{fontSize:'15px',fontWeight:'600',color:'#F57F17',marginBottom:'6px',fontFamily:'Lato,sans-serif'}}>Gordura</div>
              <div style={{fontSize:'52px',fontWeight:'700',color:'#F57F17',lineHeight:1,fontFamily:'Cormorant Garamond,serif'}}>{dados.porcoes_gordura}</div>
              <div style={{fontSize:'13px',color:'#6B5C4C',marginTop:'8px',fontFamily:'Georgia,serif'}}>polegares por dia</div>
              <div style={{fontSize:'11px',color:'#999',marginTop:'6px',fontFamily:'Georgia,serif',fontStyle:'italic'}}>Tamanho da ponta do teu polegar</div>
            </div>
          </div>

          <h3 style={{fontSize:'18px',fontWeight:'600',color:'#3A3025',marginBottom:'14px',fontFamily:'Cormorant Garamond,serif'}}>Resumo Nutricional:</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'14px'}}>
            <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',textAlign:'center',padding:'16px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize:'20px',marginBottom:'6px'}}>🔥</div>
              <div style={{fontSize:'24px',fontWeight:'700',color:'#7C8B6F',fontFamily:'Cormorant Garamond,serif'}}>{dados.calorias}</div>
              <div style={{fontSize:'11px',color:'#6B5C4C',marginTop:'4px',fontFamily:'Lato,sans-serif'}}>kcal/dia</div>
            </div>
            <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',textAlign:'center',padding:'16px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize:'20px',marginBottom:'6px'}}>🥩</div>
              <div style={{fontSize:'24px',fontWeight:'700',color:'#C62828',fontFamily:'Cormorant Garamond,serif'}}>{dados.proteina_g}g</div>
              <div style={{fontSize:'11px',color:'#6B5C4C',marginTop:'4px',fontFamily:'Lato,sans-serif'}}>Proteína</div>
            </div>
            <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',textAlign:'center',padding:'16px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize:'20px',marginBottom:'6px'}}>🍚</div>
              <div style={{fontSize:'24px',fontWeight:'700',color:'#1565C0',fontFamily:'Cormorant Garamond,serif'}}>{dados.carboidratos_g}g</div>
              <div style={{fontSize:'11px',color:'#6B5C4C',marginTop:'4px',fontFamily:'Lato,sans-serif'}}>Hidratos</div>
            </div>
            <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',textAlign:'center',padding:'16px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize:'20px',marginBottom:'6px'}}>🥑</div>
              <div style={{fontSize:'24px',fontWeight:'700',color:'#F57F17',fontFamily:'Cormorant Garamond,serif'}}>{dados.gordura_g}g</div>
              <div style={{fontSize:'11px',color:'#6B5C4C',marginTop:'4px',fontFamily:'Lato,sans-serif'}}>Gordura</div>
            </div>
          </div>

          <PageFooter page={3} />
        </div>
      </div>

      {/* PÁGINA 4 - EQUIVALÊNCIAS */}
      <div className="page">
        <div className="page-content">
          <PageHeader />

          <h2 style={{fontSize:'30px',fontWeight:'600',color:'#3A3025',marginBottom:'10px',fontFamily:'Cormorant Garamond,serif'}}>🫲 O Que Conta Como 1 Porção?</h2>
          <p style={{fontSize:'14px',color:'#6B5C4C',marginBottom:'22px',fontStyle:'italic',fontFamily:'Georgia,serif'}}>
            Usa a <strong>TUA</strong> mão como referência — é proporcional ao teu corpo. Não precisas de balança! Estes valores são <em>guias práticos</em> baseados nas tuas medidas.
          </p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            {/* Proteína */}
            <div style={{background:'linear-gradient(135deg, #FFEBEE, #FFCDD2)',border:'3px solid #E57373',borderRadius:'20px',padding:'22px',boxShadow:'0 4px 16px rgba(229,115,115,0.2)'}}>
              <div style={{fontWeight:'700',color:'#C62828',marginBottom:'6px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif'}}>🫲 A Palma — PROTEÍNA</div>
              <div style={{color:'#C62828',fontWeight:'700',fontSize:'20px',marginBottom:'14px',fontFamily:'Cormorant Garamond,serif'}}>~{dados.tamanho_palma}g por palma</div>
              <div style={{fontSize:'13px',color:'#3A3025',lineHeight:'2.2',fontFamily:'Georgia,serif'}}>
                🍗 1 peito de frango (~100g)<br/>
                🐟 1 lata de atum escorrida<br/>
                🥩 1 bife médio (~100-120g)<br/>
                🥚 <strong>2-3 ovos inteiros</strong><br/>
                🦐 6-8 camarões grandes<br/>
                🐟 1 posta de peixe<br/>
                🥛 1 iogurte grego (170g) = ½ palma<br/>
                🧀 2 fatias de queijo = ½ palma<br/>
                🥤 1 scoop whey protein = 1 palma<br/>
                🍗 1 coxa de frango s/ pele
              </div>
            </div>

            {/* Legumes */}
            <div style={{background:'linear-gradient(135deg, #E8F5E9, #C8E6C9)',border:'3px solid #81C784',borderRadius:'20px',padding:'22px',boxShadow:'0 4px 16px rgba(129,199,132,0.2)'}}>
              <div style={{fontWeight:'700',color:'#2E7D32',marginBottom:'6px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif'}}>✊ Punho — LEGUMES</div>
              <div style={{fontSize:'12px',color:'#2E7D32',marginBottom:'14px',fontStyle:'italic',fontFamily:'Georgia,serif'}}>Tamanho do teu punho fechado ≈ 150g cozidos</div>
              <div style={{fontSize:'13px',color:'#3A3025',lineHeight:'2.2',fontFamily:'Georgia,serif'}}>
                🥗 2 mãos cheias de salada crua<br/>
                🥦 1 chávena de brócolos<br/>
                🥬 1 chávena espinafres/couve<br/>
                🍅 1 tomate médio + pepino<br/>
                🥕 1 cenoura grande<br/>
                🫑 1 pimento médio<br/>
                🍄 1 chávena de cogumelos<br/>
                🥒 1 pepino inteiro<br/>
                🧅 ½ cebola grande salteada
              </div>
              <p style={{fontSize:'12px',color:'#2E7D32',fontWeight:'700',marginTop:'10px',fontFamily:'Lato,sans-serif'}}>✨ Come À VONTADE — quanto mais cores, melhor!</p>
            </div>

            {/* Hidratos */}
            <div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',border:'3px solid #64B5F6',borderRadius:'20px',padding:'22px',boxShadow:'0 4px 16px rgba(100,181,246,0.2)'}}>
              <div style={{fontWeight:'700',color:'#1565C0',marginBottom:'6px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif'}}>🤲 Mão Concha — HIDRATOS</div>
              <div style={{color:'#1565C0',fontWeight:'700',fontSize:'20px',marginBottom:'14px',fontFamily:'Cormorant Garamond,serif'}}>~{dados.tamanho_mao}g carbs por mão</div>
              <div style={{fontSize:'13px',color:'#3A3025',lineHeight:'2.2',fontFamily:'Georgia,serif'}}>
                🍚 3 col. sopa arroz cozido<br/>
                🥔 1 batata pequena<br/>
                🍠 ½ batata doce média<br/>
                🍝 ½ chávena massa cozida<br/>
                🍞 1 fatia pão integral<br/>
                🥣 3 col. sopa aveia<br/>
                🍎 1 fruta média (maçã, pera)<br/>
                🍌 ½ banana<br/>
                🫚 ½ chávena mandioca cozida<br/>
                🌾 3 col. sopa quinoa cozida
              </div>
            </div>

            {/* Gordura */}
            <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'3px solid #FFD54F',borderRadius:'20px',padding:'22px',boxShadow:'0 4px 16px rgba(255,213,79,0.2)'}}>
              <div style={{fontWeight:'700',color:'#F57F17',marginBottom:'6px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif'}}>👍 O Polegar — GORDURA</div>
              <div style={{color:'#F57F17',fontWeight:'700',fontSize:'20px',marginBottom:'14px',fontFamily:'Cormorant Garamond,serif'}}>~{dados.tamanho_polegar}g por polegar</div>
              <div style={{fontSize:'13px',color:'#3A3025',lineHeight:'2.2',fontFamily:'Georgia,serif'}}>
                🫒 1 col. sopa azeite<br/>
                🥑 ¼ de abacate médio<br/>
                🥜 1 punhado pequeno nozes (~15g)<br/>
                🥜 10-12 amêndoas<br/>
                🧈 1 col. chá de manteiga<br/>
                🥜 1 col. sopa manteiga amendoim<br/>
                🥥 2 col. sopa coco ralado<br/>
                🫒 8-10 azeitonas<br/>
                🌰 8-10 castanhas de caju
              </div>
            </div>
          </div>

          <div style={{background:'#F5F0E8',borderRadius:'14px',padding:'18px',marginTop:'18px',borderLeft:'4px solid #7C8B6F'}}>
            <p style={{fontSize:'13px',color:'#3A3025',lineHeight:'1.8',fontFamily:'Georgia,serif'}}>
              <strong>💡 Dica importante:</strong> No início, mede 2-3x cada alimento para calibrares a tua mão. Depois fica automático e nunca mais precisas de balança!
            </p>
          </div>

          <PageFooter page={4} />
        </div>
      </div>

      {/* Indicador para Puppeteer */}
      <div id="pdf-ready" style={{display:'none'}} aria-hidden="true"></div>
    </>
  );
}
