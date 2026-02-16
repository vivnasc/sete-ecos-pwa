// src/pages/PlanoHTML.jsx
// Página do Plano optimizada para impressão/PDF - PREMIUM EDITION

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { coachApi } from '../lib/coachApi.js';
import { calcularPorcoesDiarias } from '../lib/vitalis/calcularPorcoes.js';

// Overrides de texto por abordagem (sem alterar layout)
// Quando abordagem != keto_if, substituir referências a cetose
const FASES_OVERRIDES_EQUILIBRADO = {
  inducao: {
    nome: 'Fase 1: Arranque',
    descricao: 'A fase de arranque onde criamos novos hábitos alimentares e o corpo começa a ajustar-se. Foco em proteína, vegetais e porções equilibradas. Esta fase é desafiante mas transformadora — vais aprender a comer de forma consciente e sustentável.',
    objetivo: 'Criar hábitos alimentares sólidos e começar a perder peso de forma consistente.',
    expectativa: 'Perda de 1-2 kg nas primeiras 2 semanas, depois 0.5-1kg por semana de forma sustentável.',
    priorizar: ['Proteína em todas as refeições (palma da mão)', 'Vegetais verdes em abundância (pelo menos 4 punhos/dia)', 'Hidratos complexos nas porções certas (batata-doce, arroz integral)', 'Água cristalina (mínimo 2L por dia)', 'Sono reparador (7-9 horas por noite)', 'Refeições a horas regulares'],
    evitar: ['Açúcar refinado e adoçantes artificiais', 'Alimentos ultra-processados', 'Bebidas açucaradas e sumos de pacote', 'Farinhas brancas e pão branco', 'Álcool (calorias vazias)', 'Refeições sem proteína'],
    dicas: ['Prepara as refeições ao domingo — facilita a semana', 'Tem snacks saudáveis à mão (ovos cozidos, fruta, nozes)', 'Nos primeiros dias podes sentir fome — é o corpo a ajustar-se', 'Bebe água entre refeições', 'Pesa-te às sextas-feiras, em jejum', 'Tira fotos semanais — a balança não conta tudo']
  }
};

const FASES_OVERRIDES_LOW_CARB = {
  inducao: {
    nome: 'Fase 1: Redução',
    descricao: 'A fase de arranque onde reduzimos hidratos gradualmente para o corpo começar a usar gordura como energia. Foco em proteína elevada, vegetais e gorduras saudáveis. Esta fase é desafiante mas transformadora.',
    objetivo: 'Reduzir hidratos, estabilizar açúcar no sangue e começar a perder peso de forma consistente.',
    expectativa: 'Perda de 2-3 kg nas primeiras 2 semanas, depois 0.5-1kg por semana.',
    priorizar: ['Proteína em todas as refeições (palma da mão)', 'Vegetais verdes em abundância (pelo menos 4 punhos/dia)', 'Gorduras saudáveis (azeite, abacate, nozes)', 'Água cristalina (mínimo 2.5L por dia)', 'Sono reparador (7-9 horas por noite)', 'Electrólitos (sal marinho, magnésio)'],
    evitar: ['Açúcar e adoçantes artificiais', 'Farinhas brancas e pão branco', 'Bebidas açucaradas e sumos de pacote', 'Alimentos ultra-processados', 'Álcool', 'Frutas muito doces em excesso (banana, manga, uvas)'],
    dicas: ['Prepara as refeições ao domingo — facilita a semana', 'Tem snacks proteicos à mão (ovos cozidos, nozes, queijo)', 'Nos primeiros dias podes ter mais fome — é temporário', 'Adiciona 1 colher de sal na água 2x/dia', 'Pesa-te às sextas-feiras, em jejum', 'Tira fotos semanais — a balança não conta tudo']
  }
};

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
  const nomeParam = searchParams.get('nome');
  const userIdParam = searchParams.get('userId');
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (planoId) carregarDados();
  }, [planoId]);

  // Build dados object from plan + client + username
  const buildDados = (plano, cliente, userName) => {
    const abordagem = plano?.abordagem || 'equilibrado';
    const caloriasAlvo = plano?.calorias_diarias || plano?.calorias_alvo || 1500;

    let proteinaG, carboidratosG, gorduraG;
    if (plano?.proteina_g && plano?.carboidratos_g && plano?.gordura_g) {
      proteinaG = plano.proteina_g;
      carboidratosG = plano.carboidratos_g;
      gorduraG = plano.gordura_g;
    } else {
      if (abordagem === 'keto_if') {
        proteinaG = Math.round((caloriasAlvo * 0.25) / 4);
        carboidratosG = Math.round((caloriasAlvo * 0.05) / 4);
        gorduraG = Math.round((caloriasAlvo * 0.70) / 9);
      } else if (abordagem === 'low_carb') {
        proteinaG = Math.round((caloriasAlvo * 0.40) / 4);
        carboidratosG = Math.round((caloriasAlvo * 0.30) / 4);
        gorduraG = Math.round((caloriasAlvo * 0.30) / 9);
      } else {
        proteinaG = Math.round((caloriasAlvo * 0.30) / 4);
        carboidratosG = Math.round((caloriasAlvo * 0.40) / 4);
        gorduraG = Math.round((caloriasAlvo * 0.30) / 9);
      }
    }

    // Porções diárias — função partilhada (PDF + dashboard + cliente)
    const porcoesPlan = { ...plano, proteina_g: proteinaG, carboidratos_g: carboidratosG, gordura_g: gorduraG };
    const porcoes = calcularPorcoesDiarias(porcoesPlan);
    const porcoesProteina = porcoes.proteina;
    const porcoesHidratos = porcoes.hidratos;
    const porcoesGordura = porcoes.gordura;
    const porcoesLegumes = porcoes.legumes;

    return {
      nome: userName || nomeParam || 'Cliente',
      peso_actual: plano?.peso_actual || cliente?.peso_actual || 70,
      peso_meta: plano?.peso_meta || cliente?.peso_meta || 60,
      fase: plano?.fase || 'inducao',
      calorias: caloriasAlvo,
      proteina_g: proteinaG,
      carboidratos_g: carboidratosG,
      gordura_g: gorduraG,
      porcoes_proteina: porcoesProteina,
      porcoes_legumes: porcoesLegumes,
      porcoes_hidratos: porcoesHidratos,
      porcoes_gordura: porcoesGordura,
      tamanho_palma: plano?.tamanho_palma_g || 20,
      tamanho_mao: plano?.tamanho_mao_g || 25,
      tamanho_polegar: plano?.tamanho_polegar_g || 7,
      data_inicio: plano?.data_inicio_fase || plano?.created_at || new Date().toISOString(),
      abordagem: abordagem
    };
  };

  const carregarDados = async () => {
    try {
      // Try coach API first (server-side, bypasses RLS)
      // This works when coach opens the PDF or when userId param is present
      let loaded = false;
      try {
        const pdfData = await coachApi.buscarPlanoPdf(planoId, userIdParam);
        if (pdfData?.plano) {
          const plano = { ...pdfData.plano, calorias_diarias: pdfData.plano.calorias_alvo };
          setDados(buildDados(plano, pdfData.cliente, pdfData.userName));
          loaded = true;
        }
      } catch (e) {
        // Coach API failed (not a coach, or network error) — fall through to direct queries
      }

      if (loaded) return;

      // Fallback: direct supabase queries (works for client viewing own plan)
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
      const userIdForName = cliente?.user_id || plano?.user_id;
      const { data: userData } = userIdForName
        ? await supabase.from('users').select('nome').eq('id', userIdForName).maybeSingle()
        : { data: null };

      setDados(buildDados(plano, cliente, userData?.nome));
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

  // Seleccionar config da fase com overrides por abordagem
  const baseFaseConfig = FASES_CONFIG[dados.fase] || FASES_CONFIG.inducao;
  const overrides = dados.abordagem === 'equilibrado'
    ? (FASES_OVERRIDES_EQUILIBRADO[dados.fase] || {})
    : dados.abordagem === 'low_carb'
      ? (FASES_OVERRIDES_LOW_CARB[dados.fase] || {})
      : {};
  const faseConfig = { ...baseFaseConfig, ...overrides };
  const formatarData = (d) => d ? new Date(d).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const Logo = ({ size = 80 }) => (
    <img src={LOGO_PATH} alt="Vitalis" style={{width:`${size}px`,height:`${size}px`,objectFit:'contain'}} />
  );

  const PageHeader = () => (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #C5D1BC',paddingBottom:'12px',marginBottom:'20px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
        <Logo size={36} />
        <span style={{fontWeight:'600',fontSize:'18px',color:'#7C8B6F',letterSpacing:'3px',fontFamily:'Georgia,serif'}}>VITALIS</span>
      </div>
      <div style={{fontSize:'13px',color:'#6B5C4C',fontWeight:'500',fontFamily:'Georgia,serif'}}>{faseConfig.nome}</div>
    </div>
  );

  const PageFooter = ({ page, total = 12 }) => (
    <div style={{position:'absolute',bottom:'18px',left:'28px',right:'28px',display:'flex',justifyContent:'space-between',fontSize:'9px',color:'#6B5C4C',borderTop:'1px solid #C5D1BC',paddingTop:'8px',fontFamily:'Georgia,serif'}}>
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
          padding: 22px 28px 50px 28px;
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
            <div style={{display:'flex',gap:'50px',justifyContent:'center',alignItems:'center',marginBottom:'14px'}}>
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

          <h2 style={{fontSize:'24px',fontWeight:'600',color:'#3A3025',marginBottom:'16px',fontFamily:'Cormorant Garamond,serif'}}>👋 Boas-vindas à Tua Jornada</h2>

          <div style={{background:'linear-gradient(135deg, #FFFFFF, #F5F0E8)',border:'1px solid #C5D1BC',borderRadius:'16px',padding:'14px',marginBottom:'14px',boxShadow:'0 4px 16px rgba(0,0,0,0.06)'}}>
            <p style={{fontSize:'16px',lineHeight:'1.7',color:'#3A3025',fontFamily:'Georgia,serif'}}>
              <strong style={{color:'#7C8B6F',fontSize:'18px'}}>{dados.nome}</strong>, este guia foi criado especialmente para ti, com base nas tuas respostas, objectivos e estilo de vida.
            </p>
            <p style={{fontSize:'16px',lineHeight:'1.7',color:'#3A3025',marginTop:'18px',fontFamily:'Georgia,serif'}}>
              Cada porção, cada recomendação, cada conselho foi calculado para o <em>teu</em> corpo e para onde queres chegar. Não é um plano genérico — é o <strong>teu plano</strong>.
            </p>
            <p style={{fontSize:'16px',lineHeight:'1.7',color:'#3A3025',marginTop:'18px',fontFamily:'Georgia,serif'}}>
              Nas próximas páginas vais encontrar tudo o que precisas para ter sucesso: porções personalizadas, listas de compras, equivalências práticas, e orientações fase a fase. <strong>Guarda este documento</strong> — vai ser o teu companheiro de jornada.
            </p>
          </div>

          <h2 style={{fontSize:'22px',fontWeight:'600',color:'#3A3025',marginBottom:'14px',marginTop:'20px',fontFamily:'Cormorant Garamond,serif'}}>🔥 {faseConfig.nome}</h2>

          <div style={{background:'linear-gradient(135deg, #FFFFFF, #FDF8F3)',border:'1px solid #C5D1BC',borderRadius:'16px',padding:'14px',marginBottom:'14px',boxShadow:'0 4px 16px rgba(0,0,0,0.06)'}}>
            <span style={{display:'inline-block',padding:'10px 24px',background:'linear-gradient(135deg, #7C8B6F, #8B9A7A)',color:'white',borderRadius:'25px',fontSize:'13px',marginBottom:'12px',fontFamily:'Lato,sans-serif',fontWeight:'600'}}>Duração: {faseConfig.duracao}</span>
            <p style={{fontSize:'16px',lineHeight:'1.7',color:'#3A3025',fontFamily:'Georgia,serif'}}>{faseConfig.descricao}</p>

            <div style={{marginTop:'22px',padding:'18px',background:'#F5F0E8',borderRadius:'12px',borderLeft:'4px solid #7C8B6F'}}>
              <div style={{fontSize:'13px',color:'#7C8B6F',fontWeight:'700',marginBottom:'8px',letterSpacing:'2px',fontFamily:'Lato,sans-serif'}}>OBJECTIVO</div>
              <p style={{fontSize:'15px',color:'#3A3025',lineHeight:'1.8',fontFamily:'Georgia,serif'}}>{faseConfig.objetivo}</p>
            </div>

            <div style={{marginTop:'16px',padding:'18px',background:'#F5F0E8',borderRadius:'12px',borderLeft:'4px solid #6B8E23'}}>
              <div style={{fontSize:'13px',color:'#6B8E23',fontWeight:'700',marginBottom:'8px',letterSpacing:'2px',fontFamily:'Lato,sans-serif'}}>O QUE ESPERAR</div>
              <p style={{fontSize:'15px',color:'#3A3025',lineHeight:'1.8',fontFamily:'Georgia,serif'}}>{faseConfig.expectativa}</p>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'16px'}}>
            <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'14px',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize:'11px',color:'#7C8B6F',letterSpacing:'2px',marginBottom:'12px',fontFamily:'Lato,sans-serif',fontWeight:'600'}}>ABORDAGEM</div>
              <div style={{fontSize:'19px',fontWeight:'600',color:'#6B7A5D',textTransform:'capitalize',fontFamily:'Cormorant Garamond,serif'}}>{dados.abordagem?.replace('_', ' ')}</div>
            </div>
            <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'14px',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize:'11px',color:'#7C8B6F',letterSpacing:'2px',marginBottom:'12px',fontFamily:'Lato,sans-serif',fontWeight:'600'}}>A PERDER</div>
              <div style={{fontSize:'28px',fontWeight:'700',color:'#E65100',fontFamily:'Cormorant Garamond,serif'}}>{(dados.peso_actual - dados.peso_meta).toFixed(1)} kg</div>
            </div>
            <div style={{background:'white',border:'1px solid #C5D1BC',borderRadius:'14px',padding:'14px',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize:'11px',color:'#7C8B6F',letterSpacing:'2px',marginBottom:'12px',fontFamily:'Lato,sans-serif',fontWeight:'600'}}>ESTIMATIVA</div>
              <div style={{fontSize:'19px',fontWeight:'600',color:'#6B8E23',fontFamily:'Cormorant Garamond,serif'}}>{Math.ceil((dados.peso_actual - dados.peso_meta) / 0.75)} semanas</div>
            </div>
          </div>

          <PageFooter page={2} />
        </div>
      </div>

      {/* PÁGINA 3 - PORÇÕES (MÉTODO DA MÃO) */}
      <div className="page">
        <div className="page-content">
          <PageHeader />

          <h2 style={{fontSize:'24px',fontWeight:'600',color:'#3A3025',marginBottom:'12px',fontFamily:'Cormorant Garamond,serif'}}>🤚 A Tua Mão É a Tua Medida</h2>
          <p style={{fontSize:'15px',color:'#6B5C4C',marginBottom:'12px',fontFamily:'Georgia,serif',lineHeight:'1.8'}}>
            <strong>Sem balança, sem stress, sem apps.</strong> A tua mão é proporcional ao teu corpo — mãos maiores significam corpo maior, logo porções maiores. É simples, prático e funciona em qualquer lugar.
          </p>

          <div style={{background:'linear-gradient(135deg, #7C8B6F, #5A6B4D)',borderRadius:'18px',padding:'22px 28px',marginBottom:'12px',display:'flex',justifyContent:'space-around',alignItems:'center',boxShadow:'0 6px 20px rgba(124,139,111,0.3)'}}>
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

          <h3 style={{fontSize:'20px',fontWeight:'600',color:'#3A3025',marginBottom:'12px',fontFamily:'Cormorant Garamond,serif'}}>As Tuas Porções Diárias:</h3>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'12px'}}>
            <div style={{background:'linear-gradient(135deg, #FFEBEE, #FFCDD2)',border:'3px solid #E57373',borderRadius:'20px',padding:'16px',textAlign:'center',boxShadow:'0 4px 16px rgba(229,115,115,0.2)'}}>
              <div style={{fontSize:'36px',marginBottom:'6px'}}>🫲</div>
              <div style={{fontSize:'15px',fontWeight:'600',color:'#C62828',marginBottom:'6px',fontFamily:'Lato,sans-serif'}}>Proteína</div>
              <div style={{fontSize:'52px',fontWeight:'700',color:'#C62828',lineHeight:1,fontFamily:'Cormorant Garamond,serif'}}>{dados.porcoes_proteina}</div>
              <div style={{fontSize:'13px',color:'#6B5C4C',marginTop:'8px',fontFamily:'Georgia,serif'}}>palmas por dia</div>
              <div style={{fontSize:'11px',color:'#999',marginTop:'6px',fontFamily:'Georgia,serif',fontStyle:'italic'}}>Tamanho e espessura da tua palma</div>
            </div>

            <div style={{background:'linear-gradient(135deg, #E8F5E9, #C8E6C9)',border:'3px solid #81C784',borderRadius:'20px',padding:'16px',textAlign:'center',boxShadow:'0 4px 16px rgba(129,199,132,0.2)'}}>
              <div style={{fontSize:'36px',marginBottom:'6px'}}>✊</div>
              <div style={{fontSize:'15px',fontWeight:'600',color:'#2E7D32',marginBottom:'6px',fontFamily:'Lato,sans-serif'}}>Legumes</div>
              <div style={{fontSize:'52px',fontWeight:'700',color:'#2E7D32',lineHeight:1,fontFamily:'Cormorant Garamond,serif'}}>{dados.porcoes_legumes}</div>
              <div style={{fontSize:'13px',color:'#6B5C4C',marginTop:'8px',fontFamily:'Georgia,serif'}}>punhos por dia (mínimo)</div>
              <div style={{fontSize:'11px',color:'#999',marginTop:'6px',fontFamily:'Georgia,serif',fontStyle:'italic'}}>Tamanho do teu punho fechado</div>
            </div>

            <div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',border:'3px solid #64B5F6',borderRadius:'20px',padding:'16px',textAlign:'center',boxShadow:'0 4px 16px rgba(100,181,246,0.2)'}}>
              <div style={{fontSize:'36px',marginBottom:'6px'}}>🤲</div>
              <div style={{fontSize:'15px',fontWeight:'600',color:'#1565C0',marginBottom:'6px',fontFamily:'Lato,sans-serif'}}>Hidratos</div>
              <div style={{fontSize:'52px',fontWeight:'700',color:'#1565C0',lineHeight:1,fontFamily:'Cormorant Garamond,serif'}}>{dados.porcoes_hidratos}</div>
              <div style={{fontSize:'13px',color:'#6B5C4C',marginTop:'8px',fontFamily:'Georgia,serif'}}>mãos concha por dia</div>
              <div style={{fontSize:'11px',color:'#999',marginTop:'6px',fontFamily:'Georgia,serif',fontStyle:'italic'}}>O que cabe na tua mão em concha</div>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'3px solid #FFD54F',borderRadius:'20px',padding:'16px',textAlign:'center',boxShadow:'0 4px 16px rgba(255,213,79,0.2)'}}>
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

          <h2 style={{fontSize:'24px',fontWeight:'600',color:'#3A3025',marginBottom:'10px',fontFamily:'Cormorant Garamond,serif'}}>🫲 O Que Conta Como 1 Porção?</h2>
          <p style={{fontSize:'14px',color:'#6B5C4C',marginBottom:'16px',fontStyle:'italic',fontFamily:'Georgia,serif'}}>
            Usa a <strong>TUA</strong> mão como referência — é proporcional ao teu corpo. Não precisas de balança! Estes valores são <em>guias práticos</em> baseados nas tuas medidas.
          </p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            {/* Proteína */}
            <div style={{background:'linear-gradient(135deg, #FFEBEE, #FFCDD2)',border:'3px solid #E57373',borderRadius:'20px',padding:'22px',boxShadow:'0 4px 16px rgba(229,115,115,0.2)'}}>
              <div style={{fontWeight:'700',color:'#C62828',marginBottom:'6px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif'}}>🫲 A Palma — PROTEÍNA</div>
              <div style={{color:'#C62828',fontWeight:'700',fontSize:'20px',marginBottom:'14px',fontFamily:'Cormorant Garamond,serif'}}>~{dados.tamanho_palma}g por palma</div>
              <div style={{fontSize:'13px',color:'#3A3025',lineHeight:'1.8',fontFamily:'Georgia,serif'}}>
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
              <div style={{fontSize:'13px',color:'#3A3025',lineHeight:'1.8',fontFamily:'Georgia,serif'}}>
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
              <div style={{fontSize:'13px',color:'#3A3025',lineHeight:'1.8',fontFamily:'Georgia,serif'}}>
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
              <div style={{fontSize:'13px',color:'#3A3025',lineHeight:'1.8',fontFamily:'Georgia,serif'}}>
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

      {/* PÁGINA 5 - PROTEÍNAS */}
      <div className="page">
        <div className="page-content">
          <PageHeader />

          <h2 style={{fontSize:'24px',fontWeight:'600',color:'#3A3025',marginBottom:'16px',fontFamily:'Cormorant Garamond,serif'}}>🥩 Proteínas — O Pilar da Transformação</h2>
          <p style={{fontSize:'15px',color:'#6B5C4C',marginBottom:'12px',fontFamily:'Georgia,serif',lineHeight:'1.8'}}>
            A proteína constrói músculo, acelera o metabolismo, sacia a fome e mantém-te forte. <strong>É o macronutriente mais importante</strong> na tua jornada. Prioriza sempre!
          </p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'18px',marginBottom:'12px'}}>
            <div style={{background:'linear-gradient(135deg, #FFFFFF, #FFF5F5)',border:'1px solid #FFCDD2',borderLeft:'5px solid #C62828',borderRadius:'16px',padding:'18px',boxShadow:'0 3px 14px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',color:'#C62828',marginBottom:'12px',fontSize:'18px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'24px'}}>🥩</span> Carnes Vermelhas (magras)
              </div>
              <p style={{fontSize:'14px',lineHeight:'1.9',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Bife de vaca • Carne moída magra (5% gordura) • Lombo de porco • Cabrito • Borrego • Fígado de boi (rico em ferro) • Rins • Coração
              </p>
              <div style={{background:'#FFF0F0',padding:'12px',borderRadius:'10px',marginTop:'14px',fontSize:'12px',color:'#6B5C4C',fontFamily:'Georgia,serif'}}>
                💡 Prefere cortes magros. Retira gordura visível antes de cozinhar.
              </div>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFFFFF, #FFFEF5)',border:'1px solid #FFE0B2',borderLeft:'5px solid #F57C00',borderRadius:'16px',padding:'18px',boxShadow:'0 3px 14px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',color:'#F57C00',marginBottom:'12px',fontSize:'18px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'24px'}}>🍗</span> Aves
              </div>
              <p style={{fontSize:'14px',lineHeight:'1.9',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Peito de frango • Coxa de frango (sem pele) • Peito de peru • Asa de frango • Pato (sem pele) • Codorniz • Peru moído
              </p>
              <div style={{background:'#FFF8F0',padding:'12px',borderRadius:'10px',marginTop:'14px',fontSize:'12px',color:'#6B5C4C',fontFamily:'Georgia,serif'}}>
                💡 Retira sempre a pele — tem muita gordura saturada.
              </div>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFFFFF, #F0F8FF)',border:'1px solid #BBDEFB',borderLeft:'5px solid #1976D2',borderRadius:'16px',padding:'18px',boxShadow:'0 3px 14px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',color:'#1976D2',marginBottom:'12px',fontSize:'18px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'24px'}}>🐟</span> Peixes & Mariscos
              </div>
              <p style={{fontSize:'14px',lineHeight:'1.9',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Salmão (Ómega-3) • Atum fresco/lata • Sardinha • Carapau • Pescada • Tilápia • Camarão • Lulas • Polvo • Mexilhão • Bacalhau
              </p>
              <div style={{background:'#F0F8FF',padding:'12px',borderRadius:'10px',marginTop:'14px',fontSize:'12px',color:'#6B5C4C',fontFamily:'Georgia,serif'}}>
                💡 Peixes gordos (salmão, sardinha) 2-3x/semana para Ómega-3.
              </div>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFFFFF, #FFFBF0)',border:'1px solid #FFF9C4',borderLeft:'5px solid #F9A825',borderRadius:'16px',padding:'18px',boxShadow:'0 3px 14px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',color:'#F9A825',marginBottom:'12px',fontSize:'18px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'24px'}}>🥚</span> Ovos & Lacticínios
              </div>
              <p style={{fontSize:'14px',lineHeight:'1.9',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Ovos inteiros (não temas a gema!) • Claras de ovo • Queijo fresco magro • Iogurte grego natural • Requeijão • Queijo cottage • Leite magro
              </p>
              <div style={{background:'#FFFEF5',padding:'12px',borderRadius:'10px',marginTop:'14px',fontSize:'12px',color:'#6B5C4C',fontFamily:'Georgia,serif'}}>
                💡 Ovos inteiros SIM — a gema tem vitaminas essenciais!
              </div>
            </div>
          </div>

          <div style={{background:'linear-gradient(135deg, #E8F5E9, #C8E6C9)',borderRadius:'16px',padding:'16px',marginTop:'18px',border:'2px solid #66BB6A'}}>
            <h3 style={{fontSize:'18px',fontWeight:'700',color:'#2E7D32',marginBottom:'14px',fontFamily:'Cormorant Garamond,serif'}}>✨ Proteínas Vegetais (para variar)</h3>
            <p style={{fontSize:'14px',lineHeight:'1.8',color:'#3A3025',fontFamily:'Georgia,serif'}}>
              Tofu • Tempeh • Edamame • Grão-de-bico • Lentilhas • Feijão preto • Quinoa • Sementes de cânhamo • Proteína de ervilha
            </p>
            <p style={{fontSize:'12px',marginTop:'10px',color:'#2E7D32',fontStyle:'italic',fontFamily:'Georgia,serif'}}>
              Nota: Combina com cereais para proteína completa (ex: arroz + feijão)
            </p>
          </div>

          <PageFooter page={5} />
        </div>
      </div>

      {/* PÁGINA 6 - HIDRATOS & GORDURAS */}
      <div className="page">
        <div className="page-content">
          <PageHeader />

          <h2 style={{fontSize:'24px',fontWeight:'600',color:'#3A3025',marginBottom:'10px',fontFamily:'Cormorant Garamond,serif'}}>🍚 Hidratos Inteligentes</h2>
          <p style={{fontSize:'14px',color:'#6B5C4C',marginBottom:'14px',fontFamily:'Georgia,serif',lineHeight:'1.8'}}>
            Hidratos não são inimigos — são <strong>combustível</strong>. A questão é <em>quando</em> e <em>quais</em>. Prioriza hidratos complexos e come-os perto do treino.
          </p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'14px'}}>
            <div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',border:'2px solid #64B5F6',borderRadius:'16px',padding:'22px',boxShadow:'0 3px 14px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',color:'#1565C0',marginBottom:'14px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif'}}>🥔 Tubérculos & Raízes</div>
              <p style={{fontSize:'14px',lineHeight:'1.8',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Batata-doce (favorita!) • Mandioca/Macaxeira • Inhame • Batata inglesa • Cenoura cozida
              </p>
            </div>

            <div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',border:'2px solid #64B5F6',borderRadius:'16px',padding:'22px',boxShadow:'0 3px 14px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',color:'#1565C0',marginBottom:'14px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif'}}>🌾 Grãos Integrais</div>
              <p style={{fontSize:'14px',lineHeight:'1.8',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Arroz integral • Quinoa • Aveia • Cuscuz integral • Massa integral • Pão integral de verdade
              </p>
            </div>

            <div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',border:'2px solid #64B5F6',borderRadius:'16px',padding:'22px',boxShadow:'0 3px 14px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',color:'#1565C0',marginBottom:'14px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif'}}>🍎 Frutas (baixo índice glicémico)</div>
              <p style={{fontSize:'14px',lineHeight:'1.8',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Frutos vermelhos • Maçã verde • Pera • Laranja • Toranja • Kiwi • Morango • Framboesa
              </p>
            </div>

            <div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',border:'2px solid #64B5F6',borderRadius:'16px',padding:'22px',boxShadow:'0 3px 14px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',color:'#1565C0',marginBottom:'14px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif'}}>🫘 Leguminosas</div>
              <p style={{fontSize:'14px',lineHeight:'1.8',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Grão-de-bico • Lentilhas • Feijão preto • Feijão vermelho • Ervilhas
              </p>
            </div>
          </div>

          <h2 style={{fontSize:'22px',fontWeight:'600',color:'#3A3025',marginTop:'24px',marginBottom:'10px',fontFamily:'Cormorant Garamond,serif'}}>🥑 Gorduras Saudáveis</h2>
          <p style={{fontSize:'14px',color:'#6B5C4C',marginBottom:'12px',fontFamily:'Georgia,serif',lineHeight:'1.8'}}>
            Gorduras boas <strong>saciam, nutrem o cérebro, regulam hormonas e absorvem vitaminas</strong>. Essenciais para saúde!
          </p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'2px solid #FFD54F',borderRadius:'16px',padding:'22px',boxShadow:'0 3px 14px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',color:'#F57F17',marginBottom:'14px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif'}}>🫒 Óleos & Manteigas</div>
              <p style={{fontSize:'14px',lineHeight:'1.8',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Azeite extra-virgem (o melhor!) • Óleo de coco • Óleo de abacate • Manteiga de vaca • Ghee (manteiga clarificada)
              </p>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'2px solid #FFD54F',borderRadius:'16px',padding:'22px',boxShadow:'0 3px 14px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',color:'#F57F17',marginBottom:'14px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif'}}>🥜 Frutos Secos & Sementes</div>
              <p style={{fontSize:'14px',lineHeight:'1.8',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Amêndoas • Nozes (Ómega-3) • Cajus • Amendoins • Sementes de chia • Linhaça • Sementes de abóbora
              </p>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'2px solid #FFD54F',borderRadius:'16px',padding:'22px',boxShadow:'0 3px 14px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',color:'#F57F17',marginBottom:'14px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif'}}>🥑 Outras Fontes</div>
              <p style={{fontSize:'14px',lineHeight:'1.8',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Abacate • Azeitonas • Coco • Chocolate negro (+75%) • Gema de ovo • Peixes gordos (salmão, sardinha)
              </p>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'2px solid #FFD54F',borderRadius:'16px',padding:'22px',boxShadow:'0 3px 14px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',color:'#F57F17',marginBottom:'14px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif'}}>🥜 Manteigas de Frutos Secos</div>
              <p style={{fontSize:'14px',lineHeight:'1.8',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Manteiga de amendoim (100% amendoim) • Manteiga de amêndoa • Manteiga de caju • Tahini (pasta de sésamo)
              </p>
            </div>
          </div>

          <PageFooter page={6} />
        </div>
      </div>

      {/* PÁGINA 7 - VEGETAIS */}
      <div className="page">
        <div className="page-content">
          <PageHeader />

          <h2 style={{fontSize:'24px',fontWeight:'600',color:'#3A3025',marginBottom:'12px',fontFamily:'Cormorant Garamond,serif'}}>🥬 Vegetais — Come o Arco-Íris!</h2>
          <p style={{fontSize:'15px',color:'#6B5C4C',marginBottom:'12px',textAlign:'center',fontFamily:'Georgia,serif',lineHeight:'1.9'}}>
            Cada cor representa diferentes <strong>fitonutrientes, antioxidantes e vitaminas</strong>. Inclui <strong>pelo menos 3 cores por refeição</strong> e maximiza a nutrição!
          </p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
            <div style={{background:'linear-gradient(135deg, #F1F8E9, #DCEDC8)',border:'1px solid #C5D1BC',borderLeft:'6px solid #4CAF50',borderRadius:'16px',padding:'16px',boxShadow:'0 3px 14px rgba(76,175,80,0.15)'}}>
              <div style={{fontWeight:'700',color:'#2E7D32',marginBottom:'16px',fontSize:'18px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                🟢 Verdes — Os Super-Heróis
              </div>
              <p style={{fontSize:'14px',lineHeight:'1.8',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Espinafre • Couve • Brócolos • Alface • Rúcula • Pepino • Abobrinha/Courgette • Vagem • Ervilhas • Agrião
              </p>
              <div style={{background:'#F1F8E9',padding:'10px',borderRadius:'8px',marginTop:'12px',fontSize:'12px',color:'#2E7D32',fontFamily:'Georgia,serif'}}>
                💚 Ricos em ferro, magnésio, vitamina K e fibra. Come SEM LIMITES!
              </div>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFEBEE, #FFCDD2)',border:'1px solid #C5D1BC',borderLeft:'6px solid #F44336',borderRadius:'16px',padding:'16px',boxShadow:'0 3px 14px rgba(244,67,54,0.15)'}}>
              <div style={{fontWeight:'700',color:'#C62828',marginBottom:'16px',fontSize:'18px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                🔴 Vermelhos — Antioxidantes
              </div>
              <p style={{fontSize:'14px',lineHeight:'1.8',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Tomate • Pimento vermelho • Beterraba • Rabanete • Cebola roxa • Repolho roxo
              </p>
              <div style={{background:'#FFEBEE',padding:'10px',borderRadius:'8px',marginTop:'12px',fontSize:'12px',color:'#C62828',fontFamily:'Georgia,serif'}}>
                ❤️ Licopeno (tomate) protege o coração. Betalaínas (beterraba) desintoxicam.
              </div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
            <div style={{background:'linear-gradient(135deg, #FFF3E0, #FFE0B2)',border:'1px solid #C5D1BC',borderLeft:'6px solid #FF9800',borderRadius:'16px',padding:'16px',boxShadow:'0 3px 14px rgba(255,152,0,0.15)'}}>
              <div style={{fontWeight:'700',color:'#E65100',marginBottom:'16px',fontSize:'18px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                🟠 Laranjas — Vitamina A
              </div>
              <p style={{fontSize:'14px',lineHeight:'1.8',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Cenoura • Abóbora • Pimento laranja • Batata-doce (também hidrato!)
              </p>
              <div style={{background:'#FFF3E0',padding:'10px',borderRadius:'8px',marginTop:'12px',fontSize:'12px',color:'#E65100',fontFamily:'Georgia,serif'}}>
                🧡 Beta-caroteno para visão, pele e imunidade.
              </div>
            </div>

            <div style={{background:'linear-gradient(135deg, #F3E5F5, #E1BEE7)',border:'1px solid #C5D1BC',borderLeft:'6px solid #9C27B0',borderRadius:'16px',padding:'16px',boxShadow:'0 3px 14px rgba(156,39,176,0.15)'}}>
              <div style={{fontWeight:'700',color:'#6A1B9A',marginBottom:'16px',fontSize:'18px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                🟣 Roxos — Anti-inflamatórios
              </div>
              <p style={{fontSize:'14px',lineHeight:'1.8',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Beringela • Couve roxa • Cebola roxa • Beterraba
              </p>
              <div style={{background:'#F3E5F5',padding:'10px',borderRadius:'8px',marginTop:'12px',fontSize:'12px',color:'#6A1B9A',fontFamily:'Georgia,serif'}}>
                💜 Antocianinas combatem inflamação e envelhecimento.
              </div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <div style={{background:'linear-gradient(135deg, #FAFAFA, #F5F5F5)',border:'1px solid #C5D1BC',borderLeft:'6px solid #9E9E9E',borderRadius:'16px',padding:'16px',boxShadow:'0 3px 14px rgba(158,158,158,0.15)'}}>
              <div style={{fontWeight:'700',color:'#616161',marginBottom:'16px',fontSize:'18px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                ⚪ Brancos — Imunidade
              </div>
              <p style={{fontSize:'14px',lineHeight:'1.8',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Couve-flor • Cogumelos • Alho • Cebola • Nabo • Alho-francês
              </p>
              <div style={{background:'#FAFAFA',padding:'10px',borderRadius:'8px',marginTop:'12px',fontSize:'12px',color:'#616161',fontFamily:'Georgia,serif'}}>
                🤍 Alicina (alho/cebola) reforça sistema imunitário.
              </div>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFF9C4, #FFF59D)',border:'1px solid #C5D1BC',borderLeft:'6px solid #FBC02D',borderRadius:'16px',padding:'16px',boxShadow:'0 3px 14px rgba(251,192,45,0.15)'}}>
              <div style={{fontWeight:'700',color:'#F57F00',marginBottom:'16px',fontSize:'18px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                🟡 Amarelos — Vitamina C
              </div>
              <p style={{fontSize:'14px',lineHeight:'1.8',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Pimento amarelo • Abóbora amarela • Milho (com moderação)
              </p>
              <div style={{background:'#FFF9C4',padding:'10px',borderRadius:'8px',marginTop:'12px',fontSize:'12px',color:'#F57F00',fontFamily:'Georgia,serif'}}>
                💛 Vitamina C para colagénio e sistema imunitário.
              </div>
            </div>
          </div>

          <div style={{background:'linear-gradient(135deg, #E8F5E9, #C8E6C9)',borderRadius:'16px',padding:'14px',marginTop:'18px',textAlign:'center',border:'2px solid #66BB6A'}}>
            <p style={{fontSize:'15px',fontWeight:'600',color:'#2E7D32',fontFamily:'Cormorant Garamond,serif',marginBottom:'8px'}}>🎯 META DIÁRIA</p>
            <p style={{fontSize:'14px',color:'#3A3025',lineHeight:'1.9',fontFamily:'Georgia,serif'}}>
              Mínimo <strong>{dados.porcoes_legumes} punhos</strong> por dia. <strong>Máximo? Não há!</strong> Come vegetais à vontade em TODAS as refeições.
            </p>
          </div>

          <PageFooter page={7} />
        </div>
      </div>

      {/* PÁGINA 8 - LISTA DE COMPRAS */}
      <div className="page">
        <div className="page-content">
          <PageHeader />

          <h2 style={{fontSize:'24px',fontWeight:'600',color:'#3A3025',marginBottom:'12px',fontFamily:'Cormorant Garamond,serif'}}>🛒 Lista de Compras Semanal</h2>
          <p style={{fontSize:'14px',color:'#6B5C4C',marginBottom:'16px',fontFamily:'Georgia,serif',lineHeight:'1.8'}}>
            Imprime esta página e leva ao supermercado! <strong>Compra fresco</strong> sempre que possível. Quanto menos embalagens, melhor.
          </p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'13px'}}>
            <div style={{background:'linear-gradient(135deg, #FFFFFF, #FFF5F5)',border:'2px solid #E57373',borderRadius:'14px',padding:'12px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:'700',color:'#C62828',marginBottom:'10px',fontSize:'16px',borderBottom:'2px solid #E57373',paddingBottom:'8px',fontFamily:'Cormorant Garamond,serif'}}>
                🥩 Proteínas
              </div>
              <div style={{fontSize:'12px',lineHeight:'1.7',fontFamily:'Georgia,serif'}}>
                ☐ Peito de frango (1kg)<br/>
                ☐ Ovos frescos (2 dúzias)<br/>
                ☐ Peixe fresco (500-700g)<br/>
                ☐ Carne moída magra (500g)<br/>
                ☐ Atum em lata (3-4 latas)<br/>
                ☐ Iogurte grego natural (4 unid.)<br/>
                ☐ Queijo fresco magro (200g)
              </div>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFFFFF, #F1F8E9)',border:'2px solid #81C784',borderRadius:'14px',padding:'12px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:'700',color:'#2E7D32',marginBottom:'10px',fontSize:'16px',borderBottom:'2px solid #81C784',paddingBottom:'8px',fontFamily:'Cormorant Garamond,serif'}}>
                🥬 Vegetais (cores variadas!)
              </div>
              <div style={{fontSize:'12px',lineHeight:'1.7',fontFamily:'Georgia,serif'}}>
                ☐ Espinafre/Couve fresca<br/>
                ☐ Brócolos (2 cabeças)<br/>
                ☐ Tomate (1kg)<br/>
                ☐ Pepino (3-4 unid.)<br/>
                ☐ Pimentos (mix de cores)<br/>
                ☐ Cebola e Alho<br/>
                ☐ Cenoura (500g)<br/>
                ☐ Alface/Rúcula
              </div>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFFFFF, #E3F2FD)',border:'2px solid #64B5F6',borderRadius:'14px',padding:'12px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:'700',color:'#1565C0',marginBottom:'10px',fontSize:'16px',borderBottom:'2px solid #64B5F6',paddingBottom:'8px',fontFamily:'Cormorant Garamond,serif'}}>
                🍚 Hidratos (conforme fase)
              </div>
              <div style={{fontSize:'12px',lineHeight:'1.7',fontFamily:'Georgia,serif'}}>
                ☐ Batata-doce (1kg)<br/>
                ☐ Arroz integral (500g)<br/>
                ☐ Aveia (500g)<br/>
                ☐ Pão integral verdadeiro<br/>
                ☐ Quinoa (opcional)<br/>
                ☐ Frutas frescas da época<br/>
                ☐ Frutos vermelhos congelados
              </div>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFFFFF, #FFF8E1)',border:'2px solid #FFD54F',borderRadius:'14px',padding:'12px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:'700',color:'#F57F17',marginBottom:'10px',fontSize:'16px',borderBottom:'2px solid #FFD54F',paddingBottom:'8px',fontFamily:'Cormorant Garamond,serif'}}>
                🥑 Gorduras Saudáveis
              </div>
              <div style={{fontSize:'12px',lineHeight:'1.7',fontFamily:'Georgia,serif'}}>
                ☐ Azeite extra-virgem (500ml)<br/>
                ☐ Abacate (3-4 unid.)<br/>
                ☐ Manteiga de vaca<br/>
                ☐ Amêndoas/Nozes (200g)<br/>
                ☐ Manteiga amendoim 100%<br/>
                ☐ Azeitonas<br/>
                ☐ Óleo de coco (opcional)
              </div>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFFFFF, #F5F0E8)',border:'2px solid #C5D1BC',borderRadius:'14px',padding:'12px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:'700',color:'#6B5C4C',marginBottom:'10px',fontSize:'16px',borderBottom:'2px solid #C5D1BC',paddingBottom:'8px',fontFamily:'Cormorant Garamond,serif'}}>
                🧂 Despensa & Temperos
              </div>
              <div style={{fontSize:'12px',lineHeight:'1.7',fontFamily:'Georgia,serif'}}>
                ☐ Sal marinho grosso<br/>
                ☐ Pimenta do reino<br/>
                ☐ Ervas frescas (coentros, salsa)<br/>
                ☐ Especiarias (curcuma, paprika)<br/>
                ☐ Limões (6 unid.)<br/>
                ☐ Vinagre (maçã ou balsâmico)<br/>
                ☐ Chá verde/Café
              </div>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFFFFF, #E8F5E9)',border:'2px solid #66BB6A',borderRadius:'14px',padding:'12px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:'700',color:'#2E7D32',marginBottom:'10px',fontSize:'16px',borderBottom:'2px solid #66BB6A',paddingBottom:'8px',fontFamily:'Cormorant Garamond,serif'}}>
                💧 Hidratação & Extras
              </div>
              <div style={{fontSize:'12px',lineHeight:'1.7',fontFamily:'Georgia,serif'}}>
                ☐ Água mineral (garrafões)<br/>
                ☐ Água com gás (opcional)<br/>
                ☐ Chá de ervas<br/>
                ☐ Café (se bebes)<br/>
                ☐ Limões para água<br/>
                ☐ Gengibre fresco
              </div>
            </div>
          </div>

          <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',borderRadius:'12px',padding:'14px',marginTop:'14px',border:'2px solid #FFA726'}}>
            <p style={{fontSize:'12px',fontWeight:'600',color:'#E65100',marginBottom:'6px',fontFamily:'Lato,sans-serif'}}>💡 DICA DE OURO</p>
            <p style={{fontSize:'12px',color:'#3A3025',lineHeight:'1.6',fontFamily:'Georgia,serif'}}>
              Compra <strong>1x por semana</strong> aos domingos. Dedica 2h a preparar proteínas e vegetais. Guarda em recipientes de vidro. Durante a semana, só montas o prato!
            </p>
          </div>

          <PageFooter page={8} />
        </div>
      </div>

      {/* PÁGINA 9 - REGRAS DA FASE */}
      <div className="page">
        <div className="page-content">
          <PageHeader />

          <h2 style={{fontSize:'24px',fontWeight:'600',color:'#3A3025',marginBottom:'10px',fontFamily:'Cormorant Garamond,serif'}}>📋 Regras da {faseConfig.nome}</h2>
          <p style={{fontSize:'13px',color:'#6B5C4C',marginBottom:'10px',textAlign:'center',fontFamily:'Georgia,serif',lineHeight:'1.6'}}>
            Estas regras foram desenhadas para <strong>maximizar os teus resultados</strong> nesta fase. Segue-as com <em>consistência</em>, não perfeição.
          </p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'10px'}}>
            <div style={{background:'linear-gradient(135deg, #E8F5E9, #C8E6C9)',border:'2px solid #66BB6A',borderRadius:'14px',padding:'11px',boxShadow:'0 3px 14px rgba(102,187,106,0.2)'}}>
              <div style={{fontWeight:'700',color:'#2E7D32',marginBottom:'10px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{fontSize:'19px'}}>✓</span> PRIORIZAR
              </div>
              <div style={{fontSize:'13px',lineHeight:'1.6',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                {faseConfig.priorizar.map((item, i) => (
                  <div key={i} style={{marginBottom:'5px'}}>✓ {item}</div>
                ))}
              </div>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFEBEE, #FFCDD2)',border:'2px solid #E57373',borderRadius:'14px',padding:'11px',boxShadow:'0 3px 14px rgba(229,115,115,0.2)'}}>
              <div style={{fontWeight:'700',color:'#C62828',marginBottom:'10px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{fontSize:'19px'}}>✗</span> EVITAR
              </div>
              <div style={{fontSize:'13px',lineHeight:'1.6',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                {faseConfig.evitar.map((item, i) => (
                  <div key={i} style={{marginBottom:'5px'}}>✗ {item}</div>
                ))}
              </div>
            </div>
          </div>

          <div style={{background:'linear-gradient(135deg, #FFF8E1, #FFECB3)',border:'2px solid #FFD54F',borderRadius:'14px',padding:'11px',marginBottom:'12px',boxShadow:'0 3px 14px rgba(255,213,79,0.2)'}}>
            <div style={{fontWeight:'700',color:'#F57F17',marginBottom:'10px',fontSize:'17px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'8px'}}>
              <span style={{fontSize:'19px'}}>💡</span> DICAS PARA O SUCESSO
            </div>
            <div style={{fontSize:'13px',lineHeight:'1.6',color:'#3A3025',fontFamily:'Georgia,serif'}}>
              {faseConfig.dicas.map((item, i) => (
                <div key={i} style={{marginBottom:'5px'}}>• {item}</div>
              ))}
            </div>
          </div>

          <div style={{background:'linear-gradient(135deg, #E3F2FD, #BBDEFB)',borderRadius:'14px',padding:'13px',border:'2px solid #42A5F5',boxShadow:'0 2px 12px rgba(66,165,245,0.18)'}}>
            <h3 style={{fontSize:'16px',fontWeight:'700',color:'#1565C0',marginBottom:'10px',fontFamily:'Cormorant Garamond,serif'}}>⏰ Estrutura Diária Recomendada</h3>
            <div style={{fontSize:'12px',lineHeight:'1.6',color:'#3A3025',fontFamily:'Georgia,serif'}}>
              <strong>7h-8h:</strong> Pequeno-almoço com proteína (ovos, iogurte grego)<br/>
              <strong>10h-11h:</strong> Snack (se necessário): frutos secos ou fruta<br/>
              <strong>12h30-13h30:</strong> Almoço completo (proteína + legumes + hidrato)<br/>
              <strong>16h-17h:</strong> Snack da tarde (iogurte, queijo, nozes)<br/>
              <strong>19h-20h:</strong> Jantar (proteína + legumes + gordura boa)<br/>
              <strong>Antes de dormir:</strong> Chá de camomila ou casca de abacaxi
            </div>
          </div>

          <PageFooter page={9} />
        </div>
      </div>

      {/* PÁGINA 10 - COMO USAR A APP */}
      <div className="page">
        <div className="page-content">
          <PageHeader />

          <h2 style={{fontSize:'24px',fontWeight:'600',color:'#3A3025',marginBottom:'10px',fontFamily:'Cormorant Garamond,serif'}}>📱 Como Usar a Plataforma VITALIS</h2>
          <p style={{fontSize:'13px',color:'#6B5C4C',marginBottom:'10px',fontFamily:'Georgia,serif',lineHeight:'1.6',textAlign:'center'}}>
            O teu plano em papel é o <strong>guia base</strong>. A plataforma digital é o <strong>acompanhamento vivo</strong> — regista progressos, pede ajuda e ajusta conforme necessário.
          </p>

          <div style={{display:'grid',gridTemplateColumns:'1fr',gap:'13px',marginBottom:'12px'}}>
            <div style={{background:'linear-gradient(135deg, #FFFFFF, #F5F0E8)',border:'2px solid #C5D1BC',borderRadius:'14px',padding:'14px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:'700',color:'#7C8B6F',marginBottom:'10px',fontSize:'16px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'24px'}}>📊</span> 1. Regista Peso Semanal
              </div>
              <p style={{fontSize:'13px',lineHeight:'1.5',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Todas as <strong>sextas-feiras de manhã</strong>, em jejum e depois da casa de banho. Regista na app. Não te peses diariamente — o corpo flutua naturalmente.
              </p>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFFFFF, #F5F0E8)',border:'2px solid #C5D1BC',borderRadius:'14px',padding:'14px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:'700',color:'#7C8B6F',marginBottom:'10px',fontSize:'16px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'24px'}}>📸</span> 2. Tira Fotos de Progresso
              </div>
              <p style={{fontSize:'13px',lineHeight:'1.5',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                <strong>1x por mês</strong>, de frente, lado e costas. Mesma roupa, mesma luz, mesma hora. A app guarda e compara automaticamente. A transformação é VISUAL!
              </p>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFFFFF, #F5F0E8)',border:'2px solid #C5D1BC',borderRadius:'14px',padding:'14px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:'700',color:'#7C8B6F',marginBottom:'10px',fontSize:'16px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'24px'}}>📏</span> 3. Mede Circunferências Mensais
              </div>
              <p style={{fontSize:'13px',lineHeight:'1.5',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                <strong>Cintura, quadris, coxa, braço.</strong> Às vezes o peso não mexe mas perdeste 5cm de cintura! Regista tudo na app — ela gera gráficos automáticos.
              </p>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFFFFF, #F5F0E8)',border:'2px solid #C5D1BC',borderRadius:'14px',padding:'14px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:'700',color:'#7C8B6F',marginBottom:'10px',fontSize:'16px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'24px'}}>💬</span> 4. Usa o Chat para Dúvidas
              </div>
              <p style={{fontSize:'13px',lineHeight:'1.5',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Dúvida sobre um alimento? Não sabes se podes substituir? <strong>Pergunta no chat!</strong> Respondo em até 24h. És acompanhada, não estás sozinha.
              </p>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFFFFF, #F5F0E8)',border:'2px solid #C5D1BC',borderRadius:'14px',padding:'14px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:'700',color:'#7C8B6F',marginBottom:'10px',fontSize:'16px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'24px'}}>📝</span> 5. Diário Alimentar (Opcional mas Poderoso)
              </div>
              <p style={{fontSize:'13px',lineHeight:'1.5',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                Nas primeiras 2-3 semanas, regista o que comes. Não precisa ser perfeito — anota porções da mão. Ajuda-te a <strong>calibrar o olho</strong> e identificar padrões.
              </p>
            </div>

            <div style={{background:'linear-gradient(135deg, #FFFFFF, #F5F0E8)',border:'2px solid #C5D1BC',borderRadius:'14px',padding:'14px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:'700',color:'#7C8B6F',marginBottom:'10px',fontSize:'16px',fontFamily:'Cormorant Garamond,serif',display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'24px'}}>🔔</span> 6. Activa Notificações de Água
              </div>
              <p style={{fontSize:'13px',lineHeight:'1.5',color:'#3A3025',fontFamily:'Georgia,serif'}}>
                A app lembra-te de beber água a cada 2h. Pequeno detalhe, <strong>grande impacto</strong> — hidratação acelera resultados.
              </p>
            </div>
          </div>

          <div style={{background:'linear-gradient(135deg, #E8F5E9, #C8E6C9)',borderRadius:'14px',padding:'16px',border:'2px solid #66BB6A',textAlign:'center'}}>
            <p style={{fontSize:'14px',fontWeight:'600',color:'#2E7D32',marginBottom:'6px',fontFamily:'Cormorant Garamond,serif'}}>💚 Lembra-te</p>
            <p style={{fontSize:'13px',color:'#3A3025',lineHeight:'1.6',fontFamily:'Georgia,serif'}}>
              A plataforma é uma <strong>ferramenta</strong>, não uma prisão. Usa-a para te <em>apoiar</em>, não para te <em>stressar</em>. Consistência > Perfeição.
            </p>
          </div>

          <PageFooter page={10} />
        </div>
      </div>

      {/* PÁGINA 11 - MENTALIDADE & MOTIVAÇÃO */}
      <div className="page">
        <div className="page-content">
          <PageHeader />

          <h2 style={{fontSize:'28px',fontWeight:'600',color:'#3A3025',marginBottom:'10px',textAlign:'center',fontFamily:'Cormorant Garamond,serif'}}>💪 A Tua Jornada Começa Aqui</h2>
          <p style={{fontSize:'13px',color:'#6B5C4C',marginBottom:'18px',textAlign:'center',fontFamily:'Georgia,serif',lineHeight:'1.5',fontStyle:'italic'}}>
            Este plano não é sobre <strong>perfeição</strong>. É sobre <strong>progresso</strong>. Não é sobre <strong>restrição</strong>. É sobre <strong>transformação</strong>.
          </p>

          <div style={{background:'linear-gradient(135deg, #FFFFFF, #FDF8F3)',border:'2px solid #C5D1BC',borderRadius:'16px',padding:'18px',marginBottom:'10px',boxShadow:'0 4px 18px rgba(0,0,0,0.06)'}}>
            <div style={{fontSize:'50px',color:'#C5D1BC',textAlign:'center',lineHeight:'0.5',marginBottom:'10px',fontFamily:'Georgia,serif'}}>"</div>
            <p style={{fontSize:'17px',color:'#3A3025',fontStyle:'italic',lineHeight:'1.5',textAlign:'center',fontFamily:'Georgia,serif',marginBottom:'10px'}}>
              Quando o excesso cai, o corpo responde.<br/>
              Quando o corpo responde, a mente transforma.<br/>
              Quando a mente transforma, a vida muda.
            </p>
            <div style={{textAlign:'center',marginTop:'14px'}}>
              <span style={{fontSize:'13px',color:'#7C8B6F',fontWeight:'600',letterSpacing:'2px',fontFamily:'Lato,sans-serif'}}>— Vivianne Saraiva</span>
            </div>
          </div>

          <h3 style={{fontSize:'19px',fontWeight:'600',color:'#3A3025',marginBottom:'12px',fontFamily:'Cormorant Garamond,serif'}}>🎯 Os Teus Princípios de Sucesso</h3>

          <div style={{display:'grid',gridTemplateColumns:'1fr',gap:'11px'}}>
            <div style={{background:'#F5F0E8',borderLeft:'4px solid #7C8B6F',borderRadius:'10px',padding:'13px'}}>
              <p style={{fontSize:'14px',fontWeight:'600',color:'#3A3025',marginBottom:'5px',fontFamily:'Lato,sans-serif'}}>1. Progresso, não perfeição</p>
              <p style={{fontSize:'12px',color:'#6B5C4C',lineHeight:'1.5',fontFamily:'Georgia,serif'}}>
                Um dia fora do plano não destrói 6 dias de consistência. Volta ao plano na refeição seguinte.
              </p>
            </div>

            <div style={{background:'#F5F0E8',borderLeft:'4px solid #7C8B6F',borderRadius:'10px',padding:'13px'}}>
              <p style={{fontSize:'14px',fontWeight:'600',color:'#3A3025',marginBottom:'5px',fontFamily:'Lato,sans-serif'}}>2. O teu corpo é único</p>
              <p style={{fontSize:'12px',color:'#6B5C4C',lineHeight:'1.5',fontFamily:'Georgia,serif'}}>
                Este plano foi feito para TI. Não te compares com outras. A tua jornada é tua.
              </p>
            </div>

            <div style={{background:'#F5F0E8',borderLeft:'4px solid #7C8B6F',borderRadius:'10px',padding:'13px'}}>
              <p style={{fontSize:'14px',fontWeight:'600',color:'#3A3025',marginBottom:'5px',fontFamily:'Lato,sans-serif'}}>3. Consistência > Intensidade</p>
              <p style={{fontSize:'12px',color:'#6B5C4C',lineHeight:'1.5',fontFamily:'Georgia,serif'}}>
                Melhor seguir 80% do plano durante 12 semanas do que 100% durante 2 semanas e desistir.
              </p>
            </div>

            <div style={{background:'#F5F0E8',borderLeft:'4px solid #7C8B6F',borderRadius:'10px',padding:'13px'}}>
              <p style={{fontSize:'14px',fontWeight:'600',color:'#3A3025',marginBottom:'5px',fontFamily:'Lato,sans-serif'}}>4. Fome não é falha</p>
              <p style={{fontSize:'12px',color:'#6B5C4C',lineHeight:'1.5',fontFamily:'Georgia,serif'}}>
                Se tens fome verdadeira, come mais proteína e legumes. Não passes fome — isso desacelera o metabolismo.
              </p>
            </div>

            <div style={{background:'#F5F0E8',borderLeft:'4px solid #7C8B6F',borderRadius:'10px',padding:'13px'}}>
              <p style={{fontSize:'14px',fontWeight:'600',color:'#3A3025',marginBottom:'5px',fontFamily:'Lato,sans-serif'}}>5. Celebra vitórias não-balança</p>
              <p style={{fontSize:'12px',color:'#6B5C4C',lineHeight:'1.5',fontFamily:'Georgia,serif'}}>
                Dormes melhor? Mais energia? Roupas mais folgadas? Pele mais bonita? ISSO é transformação!
              </p>
            </div>

            <div style={{background:'#F5F0E8',borderLeft:'4px solid #7C8B6F',borderRadius:'10px',padding:'13px'}}>
              <p style={{fontSize:'14px',fontWeight:'600',color:'#3A3025',marginBottom:'5px',fontFamily:'Lato,sans-serif'}}>6. Não estás sozinha</p>
              <p style={{fontSize:'12px',color:'#6B5C4C',lineHeight:'1.5',fontFamily:'Georgia,serif'}}>
                Usa o chat. Pede ajuda. Partilha dúvidas. Coaching é parceria, não monólogo.
              </p>
            </div>
          </div>

          <div style={{background:'linear-gradient(135deg, #E8F5E9, #C8E6C9)',borderRadius:'14px',padding:'14px',marginTop:'16px',textAlign:'center',border:'2px solid #66BB6A'}}>
            <p style={{fontSize:'16px',fontWeight:'700',color:'#2E7D32',marginBottom:'8px',fontFamily:'Cormorant Garamond,serif'}}>
              🌱 És Capaz. Eu Acredito. Agora Acredita Tu.
            </p>
            <p style={{fontSize:'13px',color:'#3A3025',lineHeight:'1.6',fontFamily:'Georgia,serif'}}>
              Cada refeição é uma oportunidade nova. Cada dia é um recomeço. Vamos juntas. 💚
            </p>
          </div>

          <PageFooter page={11} />
        </div>
      </div>

      {/* PÁGINA 12 - FINAL */}
      <div className="page" style={{display:'flex',flexDirection:'column'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 50px'}}>
          <Logo size={160} />
          <div style={{fontSize:'15px',color:'#6B5C4C',letterSpacing:'7px',marginTop:'18px',marginBottom:'70px',fontFamily:'Lato,sans-serif',fontWeight:'300'}}>A RAIZ DA TRANSFORMAÇÃO</div>

          <div style={{maxWidth:'500px',textAlign:'center',padding:'55px 45px',background:'linear-gradient(135deg, #FFFFFF, #FDF8F3)',borderRadius:'30px',boxShadow:'0 20px 60px rgba(0,0,0,0.12)',marginBottom:'70px',border:'1px solid #C5D1BC'}}>
            <div style={{fontSize:'75px',color:'#C5D1BC',marginBottom:'14px',lineHeight:'0.5',fontFamily:'Georgia,serif'}}>"</div>
            <p style={{fontSize:'26px',color:'#3A3025',fontStyle:'italic',lineHeight:'1.8',fontFamily:'Georgia,serif',marginBottom:'14px'}}>
              O teu corpo já sabe o caminho.<br/>
              Este plano só o guia.
            </p>
            <div style={{fontSize:'70px',color:'#C5D1BC',marginTop:'10px',lineHeight:'0.5',transform:'rotate(180deg)',fontFamily:'Georgia,serif'}}>"</div>
          </div>

          <div style={{textAlign:'center',marginBottom:'40px'}}>
            <div style={{fontSize:'12px',color:'#6B5C4C',letterSpacing:'5px',marginBottom:'12px',fontFamily:'Lato,sans-serif',fontWeight:'300'}}>CRIADO EXCLUSIVAMENTE PARA</div>
            <div style={{fontSize:'44px',fontWeight:'600',color:'#3A3025',fontFamily:'Cormorant Garamond,serif',marginBottom:'12px'}}>{dados.nome}</div>
            <div style={{fontSize:'15px',color:'#7C8B6F',fontFamily:'Georgia,serif'}}>{formatarData(dados.data_inicio)}</div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:'20px',maxWidth:'550px',marginTop:'30px'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'22px',fontWeight:'700',color:'#7C8B6F',fontFamily:'Cormorant Garamond,serif'}}>{dados.porcoes_proteina}</div>
              <div style={{fontSize:'11px',color:'#6B5C4C',marginTop:'4px',fontFamily:'Lato,sans-serif'}}>Proteína<br/>(palmas/dia)</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'22px',fontWeight:'700',color:'#6B8E23',fontFamily:'Cormorant Garamond,serif'}}>{dados.porcoes_legumes}+</div>
              <div style={{fontSize:'11px',color:'#6B5C4C',marginTop:'4px',fontFamily:'Lato,sans-serif'}}>Legumes<br/>(punhos/dia)</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'22px',fontWeight:'700',color:'#1976D2',fontFamily:'Cormorant Garamond,serif'}}>{dados.porcoes_hidratos}</div>
              <div style={{fontSize:'11px',color:'#6B5C4C',marginTop:'4px',fontFamily:'Lato,sans-serif'}}>Hidratos<br/>(mãos/dia)</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'22px',fontWeight:'700',color:'#F57F17',fontFamily:'Cormorant Garamond,serif'}}>{dados.porcoes_gordura}</div>
              <div style={{fontSize:'11px',color:'#6B5C4C',marginTop:'4px',fontFamily:'Lato,sans-serif'}}>Gordura<br/>(polegares/dia)</div>
            </div>
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

      {/* Indicador para Puppeteer */}
      <div id="pdf-ready" style={{display:'none'}} aria-hidden="true"></div>
    </>
  );
}
