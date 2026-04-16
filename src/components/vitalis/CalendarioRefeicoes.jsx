import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

// Fallback meals if DB recipes fail to load
const REFEICOES_FALLBACK = {
  pequeno_almoco: [
    { id: 'fb-pa1', nome: 'Ovos mexidos com espinafres', icone: '🥚', proteina: 1, hidratos: 0, gordura: 1 },
    { id: 'fb-pa2', nome: 'Papas de milho com amendoim', icone: '🥣', proteina: 0.5, hidratos: 1.5, gordura: 0.5 },
    { id: 'fb-pa3', nome: 'Batido proteico de amendoim', icone: '🥤', proteina: 0.5, hidratos: 1, gordura: 1 },
    { id: 'fb-pa4', nome: 'Iogurte grego com sementes', icone: '🥛', proteina: 0.5, hidratos: 0, gordura: 1 },
  ],
  almoco: [
    { id: 'fb-al1', nome: 'Frango à Zambeziana', icone: '🍗', proteina: 1.5, hidratos: 0, gordura: 1 },
    { id: 'fb-al2', nome: 'Matapa com camarão', icone: '🥬', proteina: 1, hidratos: 0.5, gordura: 1 },
    { id: 'fb-al3', nome: 'Peixe grelhado com legumes', icone: '🐟', proteina: 1, hidratos: 0, gordura: 0.5 },
    { id: 'fb-al4', nome: 'Xima com caril de amendoim', icone: '🍛', proteina: 0.5, hidratos: 1.5, gordura: 1 },
    { id: 'fb-al5', nome: 'Caril de camarão', icone: '🦐', proteina: 1, hidratos: 0, gordura: 1 },
    { id: 'fb-al6', nome: 'Galinha à Cafreal', icone: '🍗', proteina: 1.5, hidratos: 0, gordura: 1 },
  ],
  jantar: [
    { id: 'fb-jt1', nome: 'Sopa de peixe Zambeziana', icone: '🍜', proteina: 1, hidratos: 0.5, gordura: 0 },
    { id: 'fb-jt2', nome: 'Peixe grelhado com molho de coco e manga', icone: '🐟', proteina: 1, hidratos: 0, gordura: 1 },
    { id: 'fb-jt3', nome: 'Camarão grelhado com alho', icone: '🦐', proteina: 1, hidratos: 0, gordura: 1 },
    { id: 'fb-jt4', nome: 'Mucapata', icone: '🫘', proteina: 0.5, hidratos: 1, gordura: 0.5 },
    { id: 'fb-jt5', nome: 'Omelete com salada', icone: '🍳', proteina: 1, hidratos: 0, gordura: 1 },
  ],
  snack: [
    { id: 'fb-sn1', nome: 'Amendoim torrado com piripiri', icone: '🥜', proteina: 0.5, hidratos: 0, gordura: 1 },
    { id: 'fb-sn2', nome: 'Sumo de baobá', icone: '🥤', proteina: 0, hidratos: 0.5, gordura: 0 },
    { id: 'fb-sn3', nome: 'Batido de papaia e coco', icone: '🥭', proteina: 0, hidratos: 1, gordura: 0.5 },
    { id: 'fb-sn4', nome: 'Chá de capim-limão', icone: '🫖', proteina: 0, hidratos: 0, gordura: 0 },
  ]
};

// Map DB recipe type to calendar slot
const mapTipoReceita = (tipo) => {
  if (!tipo) return 'almoco';
  const t = tipo.toLowerCase();
  if (t.includes('pequeno') || t.includes('breakfast')) return 'pequeno_almoco';
  if (t.includes('almoco') || t.includes('lunch')) return 'almoco';
  if (t.includes('jantar') || t.includes('dinner')) return 'jantar';
  if (t.includes('snack') || t.includes('lanche') || t.includes('bebida')) return 'snack';
  return 'almoco';
};

// Convert DB recipe to calendar format
const receitaParaCalendario = (receita) => ({
  id: `rec-${receita.id}`,
  receitaId: receita.id,
  nome: receita.titulo,
  icone: receita.imagem_url?.startsWith('http') ? '🍽️' : (receita.imagem_url || '🍽️'),
  proteina: Math.round((receita.proteina_g || 0) / 25 * 10) / 10, // g → palmas (25g per palm)
  hidratos: Math.round((receita.carboidratos_g || 0) / 30 * 10) / 10, // g → mãos (30g per cupped hand)
  gordura: Math.round((receita.gordura_g || 0) / 10 * 10) / 10, // g → polegares (10g per thumb)
  kcal: receita.calorias || 0,
  tempo: receita.tempo_minutos || 0,
  dificuldade: receita.dificuldade || '',
});

export default function CalendarioRefeicoes() {
  const [semanaAtual, setSemanaAtual] = useState(0);
  const [planoSemanal, setPlanoSemanal] = useState({});
  const [modalAberto, setModalAberto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [receitasDB, setReceitasDB] = useState(null); // null = not loaded, {} = loaded
  const [planoMacros, setPlanoMacros] = useState(null);
  const [tiposRefeicao, setTiposRefeicao] = useState(['pequeno_almoco', 'almoco', 'jantar', 'snack']);
  const [confirmarLimpar, setConfirmarLimpar] = useState(false);
  const [templateGuardado, setTemplateGuardado] = useState(false);

  const NOMES_REFEICAO = {
    pequeno_almoco: 'Peq. Almoço',
    almoco: 'Almoço',
    jantar: 'Jantar',
    snack: 'Snack',
    lanche_manha: 'Lanche manhã',
    lanche_tarde: 'Lanche tarde',
  };

  const getDatasSemana = (offset = 0) => {
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() + diffSegunda + (offset * 7));
    return DIAS_SEMANA.map((_, i) => {
      const data = new Date(segunda);
      data.setDate(segunda.getDate() + i);
      return data;
    });
  };

  const datasSemana = getDatasSemana(semanaAtual);
  const chavesSemana = datasSemana.map(d => d.toISOString().split('T')[0]);

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserData(user);

      // Load calendar: try Supabase first, fallback to localStorage
      try {
        const { data: calDB } = await supabase
          .from('vitalis_calendario_refeicoes')
          .select('*')
          .eq('user_id', user.id);

        if (calDB && calDB.length > 0) {
          // Convert flat rows to nested planoSemanal format
          const plano = {};
          calDB.forEach(row => {
            if (!plano[row.data]) plano[row.data] = {};
            plano[row.data][row.tipo_refeicao] = {
              id: row.receita_id ? `rec-${row.receita_id}` : row.id,
              receitaId: row.receita_id,
              nome: row.nome,
              icone: row.icone || '🍽️',
              proteina: parseFloat(row.proteina) || 0,
              hidratos: parseFloat(row.hidratos) || 0,
              gordura: parseFloat(row.gordura) || 0,
              kcal: row.kcal || 0,
              tempo: row.tempo || 0,
            };
          });
          setPlanoSemanal(plano);
        } else {
          // Fallback: localStorage
          const planoGuardado = localStorage.getItem(`vitalis-plano-refeicoes-${user.id}`);
          if (planoGuardado) {
            try { setPlanoSemanal(JSON.parse(planoGuardado)); } catch {}
          }
        }
      } catch {
        // Table might not exist yet — use localStorage
        const planoGuardado = localStorage.getItem(`vitalis-plano-refeicoes-${user.id}`);
        if (planoGuardado) {
          try { setPlanoSemanal(JSON.parse(planoGuardado)); } catch {}
        }
      }

      // Load user's meal config (custom meal types)
      const { data: config } = await supabase
        .from('vitalis_refeicoes_config')
        .select('tipo, nome')
        .eq('user_id', user.id)
        .order('ordem', { ascending: true });

      if (config && config.length > 0) {
        const tipos = config.map(c => c.tipo || c.nome?.toLowerCase().replace(/\s+/g, '_') || 'almoco');
        setTiposRefeicao([...new Set(tipos)]);
      }

      // Load plan macros for targets
      const { data: plano } = await supabase
        .from('vitalis_plano')
        .select('porcoes_proteina, porcoes_hidratos, porcoes_gordura, calorias_diarias')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (plano) {
        setPlanoMacros(plano);
      } else {
        // Fallback to vitalis_meal_plans
        const { data: mp } = await supabase
          .from('vitalis_meal_plans')
          .select('proteina_g, carboidratos_g, gordura_g, calorias_diarias')
          .eq('user_id', user.id)
          .eq('status', 'activo')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (mp) {
          setPlanoMacros({
            porcoes_proteina: Math.round((mp.proteina_g || 0) / 25),
            porcoes_hidratos: Math.round((mp.carboidratos_g || 0) / 30),
            porcoes_gordura: Math.round((mp.gordura_g || 0) / 10),
            calorias_diarias: mp.calorias_diarias,
          });
        }
      }

      // Load recipes from DB
      const { data: receitas } = await supabase
        .from('vitalis_receitas')
        .select('id, titulo, tipo, imagem_url, proteina_g, carboidratos_g, gordura_g, calorias, tempo_minutos, dificuldade, tags')
        .eq('ativo', true)
        .order('titulo');

      if (receitas && receitas.length > 0) {
        const grouped = {};
        receitas.forEach(r => {
          const slot = mapTipoReceita(r.tipo);
          if (!grouped[slot]) grouped[slot] = [];
          grouped[slot].push(receitaParaCalendario(r));
        });
        // Also put all lunch recipes in dinner and vice versa for flexibility
        if (grouped.almoco && !grouped.jantar) grouped.jantar = [...grouped.almoco];
        if (grouped.jantar && !grouped.almoco) grouped.almoco = [...grouped.jantar];
        // Make snacks/drinks available as snacks
        setReceitasDB(grouped);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRefeicoes = (tipo) => {
    if (receitasDB && receitasDB[tipo] && receitasDB[tipo].length > 0) {
      return receitasDB[tipo];
    }
    return REFEICOES_FALLBACK[tipo] || REFEICOES_FALLBACK.almoco;
  };

  const guardarPlano = (novoPlano) => {
    setPlanoSemanal(novoPlano);
    if (!userData) return;

    // Always save to localStorage as immediate backup
    localStorage.setItem(`vitalis-plano-refeicoes-${userData.id}`, JSON.stringify(novoPlano));

    // Save to Supabase (async, non-blocking)
    syncToSupabase(novoPlano);
  };

  const syncToSupabase = async (plano) => {
    if (!userData) return;
    try {
      // Get all dates that are in the current view's range
      const allDates = Object.keys(plano);
      if (allDates.length === 0) return;

      // Delete existing entries for these dates
      await supabase
        .from('vitalis_calendario_refeicoes')
        .delete()
        .eq('user_id', userData.id)
        .in('data', allDates);

      // Build rows to insert
      const rows = [];
      Object.entries(plano).forEach(([data, refeicoes]) => {
        Object.entries(refeicoes).forEach(([tipo, ref]) => {
          rows.push({
            user_id: userData.id,
            data,
            tipo_refeicao: tipo,
            receita_id: ref.receitaId || null,
            nome: ref.nome,
            icone: ref.icone || '🍽️',
            proteina: ref.proteina || 0,
            hidratos: ref.hidratos || 0,
            gordura: ref.gordura || 0,
            kcal: ref.kcal || 0,
            tempo: ref.tempo || 0,
          });
        });
      });

      if (rows.length > 0) {
        await supabase
          .from('vitalis_calendario_refeicoes')
          .upsert(rows, { onConflict: 'user_id,data,tipo_refeicao' });
      }
    } catch (err) {
      // Supabase table might not exist yet — localStorage handles persistence
      console.log('Calendar sync to cloud skipped:', err.message);
    }
  };

  const adicionarRefeicao = (refeicao) => {
    if (!modalAberto) return;
    const { dia, tipo } = modalAberto;
    const chave = chavesSemana[dia];
    const novoPlano = { ...planoSemanal };
    if (!novoPlano[chave]) novoPlano[chave] = {};
    novoPlano[chave][tipo] = refeicao;
    guardarPlano(novoPlano);
    setModalAberto(null);
  };

  const removerRefeicao = (dia, tipo) => {
    const chave = chavesSemana[dia];
    const novoPlano = { ...planoSemanal };
    if (novoPlano[chave]) {
      delete novoPlano[chave][tipo];
      if (Object.keys(novoPlano[chave]).length === 0) delete novoPlano[chave];
    }
    guardarPlano(novoPlano);
  };

  const copiarSemanaAnterior = () => {
    const datasAnterior = getDatasSemana(semanaAtual - 1);
    const chavesAnterior = datasAnterior.map(d => d.toISOString().split('T')[0]);
    const novoPlano = { ...planoSemanal };
    let copiou = false;
    chavesAnterior.forEach((chaveAnt, i) => {
      if (planoSemanal[chaveAnt]) {
        novoPlano[chavesSemana[i]] = { ...planoSemanal[chaveAnt] };
        copiou = true;
      }
    });
    if (!copiou) {
      // Try loading saved template
      const template = localStorage.getItem(`vitalis-template-semanal-${userData?.id}`);
      if (template) {
        try {
          const tpl = JSON.parse(template);
          // Map template days (0-6) to current week dates
          Object.entries(tpl).forEach(([dayIdx, meals]) => {
            novoPlano[chavesSemana[parseInt(dayIdx)]] = meals;
          });
          copiou = true;
        } catch {}
      }
    }
    guardarPlano(novoPlano);
  };

  const guardarComoTemplate = () => {
    if (!userData) return;
    const template = {};
    chavesSemana.forEach((chave, i) => {
      if (planoSemanal[chave]) {
        template[i] = planoSemanal[chave];
      }
    });
    localStorage.setItem(`vitalis-template-semanal-${userData.id}`, JSON.stringify(template));
    setTemplateGuardado(true);
    setTimeout(() => setTemplateGuardado(false), 2000);
  };

  const limparSemana = async () => {
    const novoPlano = { ...planoSemanal };
    chavesSemana.forEach(chave => delete novoPlano[chave]);
    setPlanoSemanal(novoPlano);
    if (userData) {
      localStorage.setItem(`vitalis-plano-refeicoes-${userData.id}`, JSON.stringify(novoPlano));
      // Also delete from Supabase
      try {
        await supabase
          .from('vitalis_calendario_refeicoes')
          .delete()
          .eq('user_id', userData.id)
          .in('data', chavesSemana);
      } catch {}
    }
    setConfirmarLimpar(false);
  };

  // Auto-fill week with varied recipes
  const preencherSemana = () => {
    const novoPlano = { ...planoSemanal };
    chavesSemana.forEach((chave, diaIndex) => {
      if (!novoPlano[chave]) novoPlano[chave] = {};
      tiposRefeicao.forEach(tipo => {
        if (novoPlano[chave][tipo]) return; // already has a meal
        const opcoes = getRefeicoes(tipo);
        if (opcoes.length === 0) return;
        // Avoid repeating the same recipe on consecutive days
        const usadasRecentes = [];
        for (let d = Math.max(0, diaIndex - 2); d < diaIndex; d++) {
          const ref = novoPlano[chavesSemana[d]]?.[tipo];
          if (ref) usadasRecentes.push(ref.id);
        }
        const naoUsadas = opcoes.filter(o => !usadasRecentes.includes(o.id));
        const pool = naoUsadas.length > 0 ? naoUsadas : opcoes;
        novoPlano[chave][tipo] = { ...pool[Math.floor(Math.random() * pool.length)] };
      });
    });
    guardarPlano(novoPlano);
  };

  // Print weekly menu as PDF
  const imprimirMenu = async () => {
    const nome = userData?.user_metadata?.nome || 'Vitalis';
    const semanaLabel = `${formatarData(datasSemana[0])} - ${formatarData(datasSemana[6])}`;

    const diasHTML = DIAS_SEMANA.map((dia, i) => {
      const chave = chavesSemana[i];
      const refeicoesDia = planoSemanal[chave] || {};
      const totDia = calcularTotaisDia(i);
      const mealsHTML = tiposRefeicao.map(tipo => {
        const ref = refeicoesDia[tipo];
        if (!ref) return '';
        return `
          <div style="display:flex; align-items:center; gap:8px; padding:6px 10px; background:#F5F2ED; border-radius:8px; margin-bottom:4px;">
            <span style="font-size:18px;">${ref.icone}</span>
            <div style="flex:1; min-width:0;">
              <div style="font-size:11px; font-weight:600; color:#4A4035;">${ref.nome}</div>
              <div style="font-size:9px; color:#6B5C4C;">
                ${ref.proteina > 0 ? `🫲${ref.proteina}` : ''} ${ref.hidratos > 0 ? `🤲${ref.hidratos}` : ''} ${ref.gordura > 0 ? `👍${ref.gordura}` : ''}
                ${ref.kcal > 0 ? ` · ${ref.kcal} kcal` : ''}${ref.tempo > 0 ? ` · ${ref.tempo}min` : ''}
              </div>
            </div>
            <div style="font-size:9px; color:#8B7D6B; text-transform:capitalize;">${(NOMES_REFEICAO[tipo] || tipo).replace(/_/g, ' ')}</div>
          </div>`;
      }).join('');

      if (!mealsHTML) return '';
      return `
        <div style="page-break-inside:avoid; margin-bottom:14px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
            <h3 style="margin:0; font-size:13px; font-weight:700; color:#4A4035;">${dia} <span style="font-weight:400; color:#8B7D6B;">${formatarData(datasSemana[i])}</span></h3>
            ${totDia.count > 0 ? `<span style="font-size:9px; color:#6B5C4C;">🫲${totDia.proteina.toFixed(0)} 🤲${totDia.hidratos.toFixed(0)} 👍${totDia.gordura.toFixed(0)}</span>` : ''}
          </div>
          ${mealsHTML}
        </div>`;
    }).join('');

    const metaHTML = metaDiaria ? `
      <div style="display:flex; gap:8px; justify-content:center; margin-bottom:14px;">
        <div style="background:#FEE2E2; padding:6px 14px; border-radius:8px; text-align:center;">
          <div style="font-size:16px; font-weight:700; color:#BE123C;">🫲 ${metaDiaria.proteina}</div>
          <div style="font-size:8px; color:#9F1239;">palmas/dia</div>
        </div>
        <div style="background:#FFEDD5; padding:6px 14px; border-radius:8px; text-align:center;">
          <div style="font-size:16px; font-weight:700; color:#C2410C;">🤲 ${metaDiaria.hidratos}</div>
          <div style="font-size:8px; color:#9A3412;">mãos/dia</div>
        </div>
        <div style="background:#F3E8FF; padding:6px 14px; border-radius:8px; text-align:center;">
          <div style="font-size:16px; font-weight:700; color:#7C3AED;">👍 ${metaDiaria.gordura}</div>
          <div style="font-size:8px; color:#6D28D9;">polegares/dia</div>
        </div>
      </div>` : '';

    const legendaHTML = `
      <div style="background:#F5F2ED; padding:10px; border-radius:10px; margin-top:10px;">
        <div style="font-size:10px; font-weight:600; color:#4A4035; margin-bottom:4px;">Como medir com a mão:</div>
        <div style="display:flex; gap:12px; font-size:9px; color:#6B5C4C;">
          <span>🫲 1 palma = porção de proteína (~25g)</span>
          <span>🤲 1 mão = porção de hidratos (~30g)</span>
          <span>👍 1 polegar = porção de gordura (~10g)</span>
        </div>
      </div>`;

    const html = `
      <div style="font-family:'Inter',-apple-system,sans-serif; max-width:800px; margin:0 auto; font-size:12px; line-height:1.5; color:#4A4035;">
        <div style="background:linear-gradient(135deg,#7C8B6F,#5A6B4D); color:white; padding:20px 24px; border-radius:0 0 14px 14px; margin-bottom:16px;">
          <h1 style="margin:0; font-size:20px; font-weight:700;">Menu Semanal</h1>
          <p style="margin:4px 0 0; font-size:12px; opacity:0.85;">${semanaLabel}</p>
        </div>
        <div style="padding:0 16px;">
          ${metaHTML}
          ${diasHTML}
          ${legendaHTML}
          <div style="text-align:center; margin-top:14px; padding:10px; font-size:9px; color:#8B7D6B; border-top:1px solid #E8E2D9;">
            VITALIS — Gerado em ${new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>`;

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    try {
      const mod = await import('html2pdf.js');
      const html2pdf = mod.default || mod;
      await html2pdf().set({
        margin: [8, 8, 8, 8],
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        filename: `Menu_Semanal_${chavesSemana[0]}.pdf`
      }).from(container).save();
    } finally {
      document.body.removeChild(container);
    }
  };

  const formatarData = (data) => `${data.getDate()}/${data.getMonth() + 1}`;

  const isHoje = (data) => {
    const hoje = new Date();
    return data.toDateString() === hoje.toDateString();
  };

  // Calculate weekly totals using hand portions
  const calcularTotaisSemana = () => {
    let proteina = 0, hidratos = 0, gordura = 0, refeicoes = 0;
    chavesSemana.forEach(chave => {
      if (planoSemanal[chave]) {
        Object.values(planoSemanal[chave]).forEach(ref => {
          proteina += ref.proteina || 0;
          hidratos += ref.hidratos || 0;
          gordura += ref.gordura || 0;
          refeicoes++;
        });
      }
    });
    return { proteina, hidratos, gordura, refeicoes };
  };

  // Calculate daily totals for a specific day
  const calcularTotaisDia = (diaIndex) => {
    const chave = chavesSemana[diaIndex];
    if (!planoSemanal[chave]) return { proteina: 0, hidratos: 0, gordura: 0, count: 0 };
    let proteina = 0, hidratos = 0, gordura = 0, count = 0;
    Object.values(planoSemanal[chave]).forEach(ref => {
      proteina += ref.proteina || 0;
      hidratos += ref.hidratos || 0;
      gordura += ref.gordura || 0;
      count++;
    });
    return { proteina, hidratos, gordura, count };
  };

  const totais = calcularTotaisSemana();
  const metaDiaria = planoMacros ? {
    proteina: planoMacros.porcoes_proteina || 0,
    hidratos: planoMacros.porcoes_hidratos || 0,
    gordura: planoMacros.porcoes_gordura || 0,
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7C8B6F] to-[#5C6B4F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#7C8B6F] to-[#5C6B4F] text-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/vitalis/dashboard" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span>←</span>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Calendário de Refeições</h1>
              <p className="text-white/70 text-sm">Planeia a tua semana com a palma da mão</p>
            </div>
            <Link to="/vitalis/lista-compras" className="px-3 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors">
              🛒 Compras
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {/* Week Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSemanaAtual(s => s - 1)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">←</button>
            <div className="text-center">
              <p className="font-bold text-lg text-gray-800">
                {semanaAtual === 0 ? 'Esta Semana' : semanaAtual === 1 ? 'Próxima Semana' : semanaAtual === -1 ? 'Semana Passada' : `Semana ${semanaAtual > 0 ? '+' : ''}${semanaAtual}`}
              </p>
              <p className="text-sm text-gray-500">{formatarData(datasSemana[0])} - {formatarData(datasSemana[6])}</p>
            </div>
            <button onClick={() => setSemanaAtual(s => s + 1)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">→</button>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            <button onClick={preencherSemana} className="px-3 py-1.5 bg-[#7C8B6F] text-white rounded-full text-sm hover:bg-[#5C6B4F] font-medium">
              ✨ Preencher semana
            </button>
            <button onClick={imprimirMenu} className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 font-medium">
              🖨️ Imprimir PDF
            </button>
            <button onClick={copiarSemanaAnterior} className="px-3 py-1.5 bg-[#7C8B6F]/10 text-[#7C8B6F] rounded-full text-sm hover:bg-[#7C8B6F]/20">
              📋 Copiar anterior
            </button>
            <button onClick={guardarComoTemplate} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200">
              {templateGuardado ? '✓ Guardado!' : '💾 Template'}
            </button>
            <button onClick={() => setConfirmarLimpar(true)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm hover:bg-red-100">
              🗑️ Limpar
            </button>
          </div>
        </div>

        {/* Weekly Summary with Plan Targets */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">Resumo da Semana</h3>
            {metaDiaria && (
              <span className="text-xs text-gray-500">Meta diária: 🫲{metaDiaria.proteina} 🤲{metaDiaria.hidratos} 👍{metaDiaria.gordura}</span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-blue-600">{totais.refeicoes}</p>
              <p className="text-xs text-gray-500">Refeições</p>
            </div>
            <div className="bg-rose-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-rose-600">{totais.proteina.toFixed(1)}</p>
              <p className="text-xs text-gray-500">🫲 Palmas</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-orange-600">{totais.hidratos.toFixed(1)}</p>
              <p className="text-xs text-gray-500">🤲 Mãos</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-purple-600">{totais.gordura.toFixed(1)}</p>
              <p className="text-xs text-gray-500">👍 Polegares</p>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Day headers */}
            <div className="grid grid-cols-8 bg-gray-50 border-b">
              <div className="p-3 text-center font-medium text-gray-500 text-sm border-r">Refeição</div>
              {DIAS_SEMANA.map((dia, i) => {
                const totaisDia = calcularTotaisDia(i);
                return (
                  <div key={dia} className={`p-2 text-center border-r last:border-r-0 ${isHoje(datasSemana[i]) ? 'bg-[#7C8B6F] text-white' : ''}`}>
                    <p className="font-bold text-sm">{dia.slice(0, 3)}</p>
                    <p className={`text-xs ${isHoje(datasSemana[i]) ? 'text-white/70' : 'text-gray-400'}`}>{formatarData(datasSemana[i])}</p>
                    {totaisDia.count > 0 && (
                      <div className={`text-xs mt-1 ${isHoje(datasSemana[i]) ? 'text-white/80' : 'text-gray-500'}`}>
                        🫲{totaisDia.proteina.toFixed(0)} 🤲{totaisDia.hidratos.toFixed(0)} 👍{totaisDia.gordura.toFixed(0)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Meal rows */}
            {tiposRefeicao.map(tipo => (
              <div key={tipo} className="grid grid-cols-8 border-b last:border-b-0">
                <div className="p-3 text-center bg-gray-50 border-r flex items-center justify-center">
                  <span className="font-medium text-gray-600 text-xs">{NOMES_REFEICAO[tipo] || tipo}</span>
                </div>
                {DIAS_SEMANA.map((_, diaIndex) => {
                  const chave = chavesSemana[diaIndex];
                  const refeicao = planoSemanal[chave]?.[tipo];
                  return (
                    <div key={diaIndex} className={`p-1.5 border-r last:border-r-0 min-h-[80px] ${isHoje(datasSemana[diaIndex]) ? 'bg-[#7C8B6F]/5' : ''}`}>
                      {refeicao ? (
                        <div className="bg-[#7C8B6F]/10 rounded-lg p-1.5 h-full relative group cursor-pointer" onClick={() => setModalAberto({ dia: diaIndex, tipo })}>
                          <button
                            onClick={(e) => { e.stopPropagation(); removerRefeicao(diaIndex, tipo); }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >×</button>
                          <span className="text-lg">{refeicao.icone}</span>
                          <p className="text-xs text-gray-700 mt-0.5 line-clamp-2 leading-tight">{refeicao.nome}</p>
                          {refeicao.tempo > 0 && <p className="text-xs text-gray-400 mt-0.5">{refeicao.tempo}min</p>}
                        </div>
                      ) : (
                        <button onClick={() => setModalAberto({ dia: diaIndex, tipo })} className="w-full h-full flex items-center justify-center text-gray-300 hover:text-[#7C8B6F] hover:bg-[#7C8B6F]/5 rounded-lg transition-colors">
                          <span className="text-2xl">+</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Hand method reference */}
        <div className="bg-gradient-to-r from-[#7C8B6F] to-[#5C6B4F] rounded-2xl p-4 text-white">
          <h3 className="font-bold mb-2">A tua mão = a tua medida</h3>
          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            <div><span className="text-2xl">🫲</span><p className="text-white/80 text-xs mt-1">1 palma = Proteína</p></div>
            <div><span className="text-2xl">✊</span><p className="text-white/80 text-xs mt-1">1 punho = Legumes</p></div>
            <div><span className="text-2xl">🤲</span><p className="text-white/80 text-xs mt-1">1 mão = Hidratos</p></div>
            <div><span className="text-2xl">👍</span><p className="text-white/80 text-xs mt-1">1 polegar = Gordura</p></div>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/vitalis/sugestoes" className="bg-white rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition-shadow">
            <span className="text-2xl">💡</span>
            <p className="text-sm font-medium text-gray-800 mt-1">Sugestões</p>
            <p className="text-xs text-gray-500">Refeições que encaixam nos teus macros</p>
          </Link>
          <Link to="/vitalis/lista-compras" className="bg-white rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition-shadow">
            <span className="text-2xl">🛒</span>
            <p className="text-sm font-medium text-gray-800 mt-1">Lista de Compras</p>
            <p className="text-xs text-gray-500">Gerada a partir do teu plano</p>
          </Link>
        </div>
      </main>

      {/* Clear confirmation */}
      {confirmarLimpar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg text-gray-800 mb-2">Limpar semana?</h3>
            <p className="text-sm text-gray-600 mb-4">Todas as refeições planeadas para esta semana serão removidas.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarLimpar(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium">Cancelar</button>
              <button onClick={limparSemana} className="flex-1 py-2 bg-red-500 text-white rounded-xl font-medium">Limpar</button>
            </div>
          </div>
        </div>
      )}

      {/* Meal Selection Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">
                    {NOMES_REFEICAO[modalAberto.tipo] || modalAberto.tipo}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {DIAS_SEMANA[modalAberto.dia]}, {formatarData(datasSemana[modalAberto.dia])}
                  </p>
                </div>
                <button onClick={() => setModalAberto(null)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">×</button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {receitasDB && (
                <p className="text-xs text-green-600 mb-3 flex items-center gap-1">
                  <span>✓</span> Receitas da base de dados ({getRefeicoes(modalAberto.tipo).length} opções)
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {getRefeicoes(modalAberto.tipo).map(refeicao => (
                  <button
                    key={refeicao.id}
                    onClick={() => adicionarRefeicao(refeicao)}
                    className="p-3 bg-gray-50 rounded-xl hover:bg-[#7C8B6F]/10 transition-colors text-left border border-transparent hover:border-[#7C8B6F]/20"
                  >
                    <span className="text-2xl">{refeicao.icone}</span>
                    <p className="font-medium text-gray-800 mt-1.5 text-sm leading-tight">{refeicao.nome}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {refeicao.proteina > 0 && <span className="text-xs text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">🫲{refeicao.proteina}</span>}
                      {refeicao.hidratos > 0 && <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">🤲{refeicao.hidratos}</span>}
                      {refeicao.gordura > 0 && <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">👍{refeicao.gordura}</span>}
                    </div>
                    {refeicao.tempo > 0 && <p className="text-xs text-gray-400 mt-1">{refeicao.tempo} min</p>}
                  </button>
                ))}
              </div>
              <Link to="/vitalis/receitas" className="block mt-4 text-center text-sm text-[#7C8B6F] font-medium hover:underline">
                Ver todas as receitas →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
