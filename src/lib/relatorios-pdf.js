/**
 * Sistema de Geração de PDFs de Relatórios - Vitalis
 * Relatórios completos com dados reais de água, treinos, sono, refeições, peso e medidas
 */
import { g } from '../utils/genero';

let html2pdfModule = null;
async function getHtml2pdf() {
  if (!html2pdfModule) {
    const mod = await import('html2pdf.js');
    html2pdfModule = mod.default || mod;
  }
  return html2pdfModule;
}

const PDF_CONFIG = {
  margin: [8, 8, 8, 8],
  image: { type: 'jpeg', quality: 0.95 },
  html2canvas: { scale: 2, useCORS: true, letterRendering: true },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
};

// ==========================================
// FUNÇÕES AUXILIARES DE HTML
// ==========================================

function gerarHeader(titulo, subtitulo = '') {
  return `
    <div style="background: linear-gradient(135deg, #7C8B6F 0%, #5A6B4D 100%); color: white; padding: 25px 30px; margin-bottom: 20px; border-radius: 0 0 16px 16px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🌿</div>
        <div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">${titulo}</h1>
          ${subtitulo ? `<p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.85;">${subtitulo}</p>` : ''}
        </div>
      </div>
    </div>`;
}

function gerarFooter() {
  return `
    <div style="background: #F5F2ED; padding: 12px; margin-top: 25px; text-align: center; font-size: 10px; color: #6B5C4C; border-top: 1px solid #E8E2D9;">
      <p style="margin: 0;">VITALIS — Sistema de Adaptação Metabólica • Gerado em ${new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>`;
}

function secao(titulo, conteudo, icone = '') {
  return `
    <div style="margin-bottom: 18px; page-break-inside: avoid;">
      <h2 style="color: #4A4035; font-size: 14px; font-weight: 700; border-bottom: 2px solid #7C8B6F; padding-bottom: 6px; margin: 0 0 10px 0;">
        ${icone} ${titulo}
      </h2>
      ${conteudo}
    </div>`;
}

function metricaCard(label, valor, sublabel = '', cor = '#7C8B6F') {
  return `
    <div style="background: #F5F2ED; padding: 10px 14px; border-radius: 10px; text-align: center; flex: 1; min-width: 80px; border-top: 3px solid ${cor};">
      <div style="font-size: 10px; color: #6B5C4C; text-transform: uppercase; letter-spacing: 0.5px;">${label}</div>
      <div style="font-size: 22px; font-weight: 700; color: #4A4035; margin: 2px 0;">${valor}</div>
      ${sublabel ? `<div style="font-size: 10px; color: #8B7D6B;">${sublabel}</div>` : ''}
    </div>`;
}

function barraProgresso(pct, cor = '#7C8B6F', altura = '8px') {
  return `<div style="background: #E8E2D9; border-radius: 4px; overflow: hidden; height: ${altura};"><div style="background: ${cor}; height: 100%; width: ${Math.min(pct, 100)}%; border-radius: 4px;"></div></div>`;
}

function miniBarChart(dados, maxVal, corFn) {
  const bars = dados.map((v, i) => {
    const h = maxVal > 0 ? Math.max((v / maxVal) * 50, 2) : 2;
    const cor = corFn ? corFn(v) : '#7C8B6F';
    return `<div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:2px;">
      <div style="font-size:8px; color:#6B5C4C;">${v > 0 ? v : ''}</div>
      <div style="width:100%; height:${h}px; background:${cor}; border-radius:2px;"></div>
    </div>`;
  });
  return `<div style="display:flex; gap:2px; align-items:flex-end; height:60px;">${bars.join('')}</div>`;
}

// ==========================================
// CÁLCULOS COMUNS
// ==========================================

function calcularStats(dados) {
  const { registos, agua, treinos, sono, meals, medidas } = dados;

  // Peso
  const pesosOrdenados = (registos || []).filter(r => r.peso_kg).sort((a, b) => new Date(a.data) - new Date(b.data));
  const pesoInicio = pesosOrdenados[0]?.peso_kg || dados.cliente?.peso_actual || dados.cliente?.peso_inicial || 0;
  const pesoFim = pesosOrdenados.length > 0 ? pesosOrdenados[pesosOrdenados.length - 1].peso_kg : pesoInicio;
  const variacaoPeso = pesoFim - pesoInicio;

  // Água por dia
  const aguaPorDia = {};
  (agua || []).forEach(a => { aguaPorDia[a.data] = (aguaPorDia[a.data] || 0) + a.quantidade_ml; });
  const diasComAgua = Object.keys(aguaPorDia).length;
  const totalAgua = Object.values(aguaPorDia).reduce((s, v) => s + v, 0);
  const mediaAguaL = diasComAgua > 0 ? (totalAgua / diasComAgua / 1000).toFixed(1) : '0';
  const diasMeta2L = Object.values(aguaPorDia).filter(ml => ml >= 2000).length;

  // Treinos
  const treinosFeitos = (treinos || []).length;
  const tiposTreino = {};
  (treinos || []).forEach(t => { tiposTreino[t.tipo || 'geral'] = (tiposTreino[t.tipo || 'geral'] || 0) + 1; });
  const totalMinTreino = (treinos || []).reduce((s, t) => s + (t.duracao_min || 0), 0);

  // Sono
  const sonoComDados = (sono || []).filter(s => s.duracao_min);
  const mediaSonoH = sonoComDados.length > 0 ? (sonoComDados.reduce((s, v) => s + v.duracao_min, 0) / sonoComDados.length / 60).toFixed(1) : '0';
  const mediaSonoQ = sonoComDados.length > 0 ? (sonoComDados.reduce((s, v) => s + (v.qualidade_1a5 || 0), 0) / sonoComDados.length).toFixed(1) : '0';

  // Refeições
  const totalMeals = (meals || []).length;
  const mealsOk = (meals || []).filter(m => m.seguiu_plano === 'sim').length;
  const mealsParcial = (meals || []).filter(m => m.seguiu_plano === 'parcial').length;
  const aderenciaRefeicoes = totalMeals > 0 ? Math.round(((mealsOk + mealsParcial * 0.5) / totalMeals) * 100) : 0;

  // Tipo de refeição
  const mealPorTipo = {};
  (meals || []).forEach(m => {
    const tipo = m.refeicao || m.tipo_refeicao || 'outro';
    if (!mealPorTipo[tipo]) mealPorTipo[tipo] = { total: 0, sim: 0, parcial: 0 };
    mealPorTipo[tipo].total++;
    if (m.seguiu_plano === 'sim') mealPorTipo[tipo].sim++;
    if (m.seguiu_plano === 'parcial') mealPorTipo[tipo].parcial++;
  });

  // Energia e humor
  const comEnergia = (registos || []).filter(r => r.energia_1a10);
  const mediaEnergia = comEnergia.length > 0 ? (comEnergia.reduce((s, r) => s + r.energia_1a10, 0) / comEnergia.length).toFixed(1) : '—';
  const comHumor = (registos || []).filter(r => r.humor_1a10);
  const mediaHumor = comHumor.length > 0 ? (comHumor.reduce((s, r) => s + r.humor_1a10, 0) / comHumor.length).toFixed(1) : '—';

  // Medidas
  const medidasOrdenadas = (medidas || []).sort((a, b) => new Date(a.data) - new Date(b.data));
  const primeiraM = medidasOrdenadas[0];
  const ultimaM = medidasOrdenadas.length > 1 ? medidasOrdenadas[medidasOrdenadas.length - 1] : null;

  // Dias únicos com qualquer actividade
  const diasActivos = new Set();
  (registos || []).forEach(r => diasActivos.add(r.data));
  (meals || []).forEach(m => diasActivos.add(m.data));
  (agua || []).forEach(a => diasActivos.add(a.data));
  (treinos || []).forEach(t => diasActivos.add(t.data));
  (sono || []).forEach(s => diasActivos.add(s.data));

  // Semana-a-semana (para breakdown semanal dentro do mês)
  const semanasMap = {};
  const todasDatas = [...diasActivos].sort();
  todasDatas.forEach(data => {
    const d = new Date(data + 'T00:00:00');
    const seg = new Date(d);
    seg.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const semKey = seg.toISOString().split('T')[0];
    if (!semanasMap[semKey]) semanasMap[semKey] = { meals: 0, agua: 0, treinos: 0, dias: 0 };
    semanasMap[semKey].dias++;
  });
  (meals || []).forEach(m => {
    const d = new Date(m.data + 'T00:00:00');
    const seg = new Date(d); seg.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const k = seg.toISOString().split('T')[0];
    if (semanasMap[k]) semanasMap[k].meals++;
  });
  (treinos || []).forEach(t => {
    const d = new Date(t.data + 'T00:00:00');
    const seg = new Date(d); seg.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const k = seg.toISOString().split('T')[0];
    if (semanasMap[k]) semanasMap[k].treinos++;
  });
  Object.entries(aguaPorDia).forEach(([data, ml]) => {
    const d = new Date(data + 'T00:00:00');
    const seg = new Date(d); seg.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const k = seg.toISOString().split('T')[0];
    if (semanasMap[k]) semanasMap[k].agua += ml;
  });

  return {
    pesoInicio, pesoFim, variacaoPeso,
    mediaAguaL, diasComAgua, diasMeta2L, aguaPorDia,
    treinosFeitos, tiposTreino, totalMinTreino,
    mediaSonoH, mediaSonoQ, sonoComDados,
    totalMeals, mealsOk, mealsParcial, aderenciaRefeicoes, mealPorTipo,
    mediaEnergia, mediaHumor,
    primeiraM, ultimaM, pesosOrdenados, medidasOrdenadas,
    totalRegistos: (registos || []).length,
    diasActivos: diasActivos.size,
    diasActivosSet: diasActivos,
    semanasMap
  };
}

// ==========================================
// GERAR HTML DO CORPO DO PESO (reutilizável)
// ==========================================

function htmlPeso(stats, cliente) {
  const meta = cliente?.peso_meta || 0;
  const progressoMeta = meta > 0 && stats.pesoInicio > 0
    ? Math.round(Math.abs(stats.variacaoPeso) / Math.abs(stats.pesoInicio - meta) * 100)
    : 0;

  return `
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      ${metricaCard('Início', `${stats.pesoInicio} kg`, '', '#7C8B6F')}
      ${metricaCard('Actual', `${stats.pesoFim} kg`, '', stats.variacaoPeso <= 0 ? '#10b981' : '#ef4444')}
      ${metricaCard('Variação', `${stats.variacaoPeso > 0 ? '+' : ''}${stats.variacaoPeso.toFixed(1)} kg`, stats.variacaoPeso < 0 ? '↓ a perder' : stats.variacaoPeso > 0 ? '↑ ganho' : 'estável', stats.variacaoPeso <= 0 ? '#10b981' : '#ef4444')}
      ${meta > 0 ? metricaCard('Meta', `${meta} kg`, `${Math.min(progressoMeta, 100)}% alcançado`, '#6366f1') : ''}
    </div>
    ${stats.pesosOrdenados.length > 2 ? `
      <div style="margin-top:10px;">
        <div style="font-size:10px; color:#6B5C4C; margin-bottom:4px;">Evolução do peso (${stats.pesosOrdenados.length} registos)</div>
        ${miniBarChart(
          stats.pesosOrdenados.map(p => p.peso_kg),
          Math.max(...stats.pesosOrdenados.map(p => p.peso_kg)) + 2,
          (v) => v <= stats.pesoInicio ? '#10b981' : '#ef4444'
        )}
      </div>` : ''}`;
}

function htmlMedidas(stats) {
  if (!stats.primeiraM && !stats.ultimaM) {
    return secao('Medidas Corporais', `
      <div style="padding:10px 14px; background:#F5F2ED; border-radius:8px; font-size:11px; color:#6B5C4C; text-align:center;">
        Sem medidas registadas. Registar cintura e anca semanalmente ajuda a ver resultados mesmo quando o peso não muda.
      </div>`, '📏');
  }

  if (!stats.ultimaM) {
    const info = [];
    if (stats.primeiraM?.cintura_cm) info.push(`Cintura: ${stats.primeiraM.cintura_cm} cm`);
    if (stats.primeiraM?.anca_cm) info.push(`Anca: ${stats.primeiraM.anca_cm} cm`);
    return secao('Medidas Corporais', `
      <div style="padding:10px 14px; background:#F5F2ED; border-radius:8px; font-size:11px; color:#6B5C4C;">
        Apenas 1 registo (${info.join(', ')}). É preciso pelo menos 2 registos para ver a evolução.
      </div>`, '📏');
  }

  const diffCintura = stats.ultimaM.cintura_cm && stats.primeiraM.cintura_cm
    ? (stats.ultimaM.cintura_cm - stats.primeiraM.cintura_cm).toFixed(1) : null;
  const diffAnca = stats.ultimaM.anca_cm && stats.primeiraM.anca_cm
    ? (stats.ultimaM.anca_cm - stats.primeiraM.anca_cm).toFixed(1) : null;

  if (!diffCintura && !diffAnca) return '';

  return secao('Medidas Corporais', `
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      ${diffCintura ? metricaCard('Cintura', `${diffCintura > 0 ? '+' : ''}${diffCintura} cm`, `${stats.primeiraM.cintura_cm} → ${stats.ultimaM.cintura_cm} cm`, parseFloat(diffCintura) <= 0 ? '#10b981' : '#ef4444') : ''}
      ${diffAnca ? metricaCard('Anca', `${diffAnca > 0 ? '+' : ''}${diffAnca} cm`, `${stats.primeiraM.anca_cm} → ${stats.ultimaM.anca_cm} cm`, parseFloat(diffAnca) <= 0 ? '#10b981' : '#ef4444') : ''}
    </div>`, '📏');
}

function htmlInsights(stats, contexto = '', overrides = {}) {
  const varPeso = overrides.variacaoPeso !== undefined ? overrides.variacaoPeso : stats.variacaoPeso;
  const insights = [];

  // Consistência
  if (stats.diasActivos >= 25) insights.push({ tipo: 'sucesso', texto: `${stats.diasActivos} dias activos — consistência exemplar!` });
  else if (stats.diasActivos >= 15) insights.push({ tipo: 'bom', texto: `${stats.diasActivos} dias activos — bom ritmo, tenta não falhar mais de 2 dias seguidos.` });
  else if (stats.diasActivos >= 5) insights.push({ tipo: 'alerta', texto: `Apenas ${stats.diasActivos} dias activos — a regularidade é mais importante que a perfeição.` });
  else if (stats.diasActivos > 0) insights.push({ tipo: 'critico', texto: `Poucos registos (${stats.diasActivos} dias). Mesmo nos dias difíceis, regista algo — ajuda a manter o compromisso.` });

  // Refeições
  if (stats.totalMeals === 0) {
    insights.push({ tipo: 'info', texto: 'Sem registos de refeições. Regista pelo menos as refeições principais para acompanhar a aderência.' });
  } else if (stats.aderenciaRefeicoes >= 80) {
    insights.push({ tipo: 'sucesso', texto: `Aderência de ${stats.aderenciaRefeicoes}% às refeições — excelente disciplina!` });
  } else if (stats.aderenciaRefeicoes >= 50) {
    // Encontrar refeição mais fraca
    const maisFragil = Object.entries(stats.mealPorTipo).sort((a, b) => {
      const pctA = a[1].total > 0 ? (a[1].sim + a[1].parcial * 0.5) / a[1].total : 0;
      const pctB = b[1].total > 0 ? (b[1].sim + b[1].parcial * 0.5) / b[1].total : 0;
      return pctA - pctB;
    })[0];
    const dica = maisFragil ? ` O ${maisFragil[0]} é onde mais desvias — foca aí.` : '';
    insights.push({ tipo: 'alerta', texto: `Aderência de ${stats.aderenciaRefeicoes}%.${dica}` });
  } else if (stats.totalMeals > 0) {
    insights.push({ tipo: 'critico', texto: `Aderência baixa (${stats.aderenciaRefeicoes}%). Tenta preparar refeições com antecedência.` });
  }

  // Água
  if (stats.diasComAgua === 0) {
    insights.push({ tipo: 'info', texto: 'Sem registos de água. A hidratação é fundamental — tenta registar diariamente.' });
  } else if (parseFloat(stats.mediaAguaL) >= 2) {
    insights.push({ tipo: 'sucesso', texto: `Hidratação média de ${stats.mediaAguaL}L/dia — ${stats.diasMeta2L} dias atingiram a meta de 2L.` });
  } else if (parseFloat(stats.mediaAguaL) >= 1) {
    insights.push({ tipo: 'alerta', texto: `Hidratação média de ${stats.mediaAguaL}L/dia — abaixo dos 2L recomendados. Tenta beber um copo antes de cada refeição.` });
  } else {
    insights.push({ tipo: 'critico', texto: `Hidratação muito baixa (${stats.mediaAguaL}L/dia). Desidratação afecta energia, fome e metabolismo.` });
  }

  // Sono
  if (parseFloat(stats.mediaSonoH) >= 7 && parseFloat(stats.mediaSonoH) > 0) {
    insights.push({ tipo: 'sucesso', texto: `Sono médio de ${stats.mediaSonoH}h — dentro do recomendado (7-9h).` });
  } else if (parseFloat(stats.mediaSonoH) >= 5 && parseFloat(stats.mediaSonoH) > 0) {
    insights.push({ tipo: 'alerta', texto: `Sono médio de ${stats.mediaSonoH}h — abaixo do ideal. Sono insuficiente aumenta a fome e dificulta a perda de peso.` });
  } else if (stats.sonoComDados?.length === 0) {
    insights.push({ tipo: 'info', texto: 'Sem registos de sono. O sono é um pilar fundamental — regista para identificar padrões.' });
  }

  // Treinos
  if (stats.treinosFeitos === 0) {
    insights.push({ tipo: 'info', texto: 'Sem treinos registados. Mesmo 15 minutos de caminhada contam — regista a tua actividade.' });
  } else if (stats.treinosFeitos >= 12) {
    insights.push({ tipo: 'sucesso', texto: `${stats.treinosFeitos} sessões de treino (${Math.round(stats.totalMinTreino / 60)}h) — frequência excelente!` });
  } else if (stats.treinosFeitos >= 4) {
    insights.push({ tipo: 'bom', texto: `${stats.treinosFeitos} sessões de treino. Tenta adicionar mais um dia por semana.` });
  } else {
    insights.push({ tipo: 'alerta', texto: `Apenas ${stats.treinosFeitos} treinos. Começa com actividades de que gostas para criar o hábito.` });
  }

  // Peso
  if (varPeso < -2) insights.push({ tipo: 'sucesso', texto: `Perdeste ${Math.abs(varPeso).toFixed(1)} kg — progresso sólido!` });
  else if (varPeso < -0.5) insights.push({ tipo: 'bom', texto: `Perdeste ${Math.abs(varPeso).toFixed(1)} kg — ritmo saudável e sustentável.` });
  else if (varPeso > 1) insights.push({ tipo: 'alerta', texto: `O peso subiu ${varPeso.toFixed(1)} kg. Pode ser retenção, ciclo menstrual, ou precisa de ajuste alimentar.` });

  // Energia/Humor
  if (stats.mediaEnergia !== '—' && parseFloat(stats.mediaEnergia) < 5) {
    insights.push({ tipo: 'alerta', texto: `Energia média baixa (${stats.mediaEnergia}/10). Pode estar ligada a sono, hidratação ou nutrição insuficiente.` });
  }

  const cores = { sucesso: '#10b981', bom: '#3b82f6', alerta: '#f59e0b', critico: '#ef4444', info: '#6b7280' };
  const icones = { sucesso: '✅', bom: '📈', alerta: '⚠️', critico: '🚨', info: '💡' };

  return insights.length > 0 ? secao('Análise e Recomendações', `
    <div style="space-y:2px;">
      ${insights.map(i => `
        <div style="display:flex; gap:8px; padding:8px 12px; margin-bottom:4px; background:${cores[i.tipo]}10; border-left:3px solid ${cores[i.tipo]}; border-radius:0 6px 6px 0;">
          <span style="font-size:14px; flex-shrink:0;">${icones[i.tipo]}</span>
          <span style="font-size:11px; color:#4A4035; line-height:1.4;">${i.texto}</span>
        </div>
      `).join('')}
    </div>`, '💡') : '';
}

// Calendário de consistência (mapa de dias)
function htmlCalendario(stats, dataInicio, dataFim) {
  const inicio = new Date(dataInicio + 'T00:00:00');
  const fim = new Date(dataFim + 'T00:00:00');
  const dias = [];
  const d = new Date(inicio);
  while (d <= fim) {
    const dataStr = d.toISOString().split('T')[0];
    const activo = stats.diasActivosSet ? stats.diasActivosSet.has(dataStr) : !!stats.aguaPorDia?.[dataStr];
    dias.push({ data: dataStr, dia: d.getDate(), activo });
    d.setDate(d.getDate() + 1);
  }

  const cells = dias.map(d => {
    const bg = d.activo ? '#7C8B6F' : '#E8E2D9';
    const cor = d.activo ? 'white' : '#B0A898';
    return `<div style="width:22px; height:22px; border-radius:4px; background:${bg}; color:${cor}; font-size:8px; display:flex; align-items:center; justify-content:center; font-weight:600;">${d.dia}</div>`;
  });

  return secao('Calendário de Actividade', `
    <div style="display:flex; flex-wrap:wrap; gap:3px;">
      ${cells.join('')}
    </div>
    <div style="display:flex; gap:12px; margin-top:6px; font-size:9px; color:#6B5C4C;">
      <span style="display:flex; align-items:center; gap:3px;"><span style="width:10px; height:10px; border-radius:2px; background:#7C8B6F;"></span> Com registo</span>
      <span style="display:flex; align-items:center; gap:3px;"><span style="width:10px; height:10px; border-radius:2px; background:#E8E2D9;"></span> Sem registo</span>
      <span>${stats.diasActivos} de ${dias.length} dias (${dias.length > 0 ? Math.round(stats.diasActivos / dias.length * 100) : 0}%)</span>
    </div>
  `, '📅');
}

// Refeições por tipo de refeição
function htmlMealBreakdown(stats) {
  if (Object.keys(stats.mealPorTipo).length === 0) return '';

  const rows = Object.entries(stats.mealPorTipo)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([tipo, data]) => {
      const pct = data.total > 0 ? Math.round(((data.sim + data.parcial * 0.5) / data.total) * 100) : 0;
      const cor = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
      return `
        <div style="display:flex; align-items:center; gap:8px; padding:4px 0;">
          <span style="font-size:10px; color:#6B5C4C; width:80px; text-transform:capitalize;">${tipo.replace(/_/g, ' ')}</span>
          <div style="flex:1; height:6px; background:#E8E2D9; border-radius:3px; overflow:hidden;">
            <div style="height:100%; width:${pct}%; background:${cor}; border-radius:3px;"></div>
          </div>
          <span style="font-size:10px; font-weight:600; color:#4A4035; width:35px; text-align:right;">${pct}%</span>
          <span style="font-size:9px; color:#8B7D6B; width:30px;">${data.total}x</span>
        </div>`;
    });

  return secao('Aderência por Refeição', rows.join(''), '🍽️');
}

// Breakdown semanal
function htmlSemanasBreakdown(stats) {
  const semanas = Object.entries(stats.semanasMap).sort((a, b) => a[0].localeCompare(b[0]));
  if (semanas.length === 0) return '';

  const rows = semanas.map(([semKey, data], i) => {
    const seg = new Date(semKey + 'T00:00:00');
    const dom = new Date(seg); dom.setDate(seg.getDate() + 6);
    const label = `${seg.getDate()}/${seg.getMonth() + 1} - ${dom.getDate()}/${dom.getMonth() + 1}`;
    return `
      <tr style="border-bottom:1px solid #E8E2D9;">
        <td style="padding:5px 8px; font-size:10px; font-weight:600; color:#4A4035;">Sem ${i + 1}</td>
        <td style="padding:5px 8px; font-size:9px; color:#6B5C4C;">${label}</td>
        <td style="padding:5px 8px; font-size:10px; text-align:center; color:#4A4035;">${data.dias}</td>
        <td style="padding:5px 8px; font-size:10px; text-align:center; color:#4A4035;">${data.meals}</td>
        <td style="padding:5px 8px; font-size:10px; text-align:center; color:#4A4035;">${data.treinos}</td>
        <td style="padding:5px 8px; font-size:10px; text-align:center; color:#4A4035;">${data.agua > 0 ? (data.agua / 1000 / Math.max(data.dias, 1)).toFixed(1) + 'L' : '—'}</td>
      </tr>`;
  });

  return secao('Evolução Semanal', `
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="background:#F5F2ED;">
          <th style="padding:5px 8px; font-size:9px; color:#6B5C4C; text-align:left;">Semana</th>
          <th style="padding:5px 8px; font-size:9px; color:#6B5C4C; text-align:left;">Período</th>
          <th style="padding:5px 8px; font-size:9px; color:#6B5C4C; text-align:center;">Dias</th>
          <th style="padding:5px 8px; font-size:9px; color:#6B5C4C; text-align:center;">Refeições</th>
          <th style="padding:5px 8px; font-size:9px; color:#6B5C4C; text-align:center;">Treinos</th>
          <th style="padding:5px 8px; font-size:9px; color:#6B5C4C; text-align:center;">Água/dia</th>
        </tr>
      </thead>
      <tbody>${rows.join('')}</tbody>
    </table>
  `, '📊');
}

// Secção de treinos detalhada
function htmlTreinos(stats) {
  if (stats.treinosFeitos === 0) {
    return secao('Actividade Física', `
      <div style="background:#F5F2ED; padding:14px; border-radius:10px; text-align:center;">
        <div style="font-size:24px; margin-bottom:6px;">🏃‍♀️</div>
        <p style="font-size:11px; color:#6B5C4C; margin:0;">Sem treinos registados neste período.</p>
        <p style="font-size:10px; color:#8B7D6B; margin:4px 0 0 0;">Regista os teus treinos para acompanhar a evolução!</p>
      </div>
    `, '🏋️');
  }

  const emojis = { musculacao: '🏋️', corrida: '🏃', caminhada: '🚶', yoga: '🧘', natacao: '🏊', danca: '💃', ciclismo: '🚴', hiit: '⚡', pilates: '🤸', outro: '🔥', geral: '💪' };
  const tipos = Object.entries(stats.tiposTreino).sort((a, b) => b[1] - a[1]);

  return secao('Actividade Física', `
    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
      ${metricaCard('Sessões', stats.treinosFeitos, `${(stats.treinosFeitos / 4).toFixed(1)}x/sem`, '#6366f1')}
      ${metricaCard('Tempo Total', `${stats.totalMinTreino}min`, `~${(stats.totalMinTreino / 60).toFixed(1)}h`, '#8b5cf6')}
      ${stats.treinosFeitos > 0 ? metricaCard('Média/Sessão', `${Math.round(stats.totalMinTreino / stats.treinosFeitos)}min`, '', '#a78bfa') : ''}
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:4px;">
      ${tipos.map(([tipo, count]) => `
        <span style="display:inline-flex; align-items:center; gap:3px; background:#EEF2FF; padding:4px 10px; border-radius:12px; font-size:10px; color:#4338ca;">
          ${emojis[tipo] || '💪'} ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}: ${count}x
        </span>
      `).join('')}
    </div>
  `, '🏋️');
}

// Contexto do programa (abordagem, fase, objectivos)
function htmlContextoPrograma(dados) {
  const { cliente, plano } = dados;
  if (!cliente && !plano) return '';

  const abordagens = { keto: 'Cetogénica/Jejum', lowcarb: 'Low-Carb', equilibrado: 'Equilibrada' };
  const fases = {
    keto: { inducao: 'Indução', transicao: 'Transição', estabilizacao: 'Estabilização', manutencao: 'Manutenção' },
    lowcarb: { inducao: 'Adaptação', transicao: 'Progressão', estabilizacao: 'Consolidação', manutencao: 'Autonomia' },
    equilibrado: { inducao: 'Arranque', transicao: 'Evolução', estabilizacao: 'Optimização', manutencao: 'Manutenção' }
  };
  const abordagem = plano?.abordagem || cliente?.abordagem || 'equilibrado';
  const faseKey = plano?.fase || cliente?.fase_actual || 'inducao';
  const faseNome = (fases[abordagem] || fases.equilibrado)[faseKey] || faseKey;

  const items = [];
  items.push(`<span style="background:#E8E4DC; padding:3px 10px; border-radius:8px; font-size:10px;"><strong>Abordagem:</strong> ${abordagens[abordagem] || abordagem}</span>`);
  items.push(`<span style="background:#E8E4DC; padding:3px 10px; border-radius:8px; font-size:10px;"><strong>Fase:</strong> ${faseNome}</span>`);
  if (cliente?.peso_meta) items.push(`<span style="background:#E8E4DC; padding:3px 10px; border-radius:8px; font-size:10px;"><strong>Objectivo:</strong> ${cliente.peso_meta} kg</span>`);
  if (cliente?.objectivo_principal) items.push(`<span style="background:#E8E4DC; padding:3px 10px; border-radius:8px; font-size:10px;"><strong>Foco:</strong> ${cliente.objectivo_principal}</span>`);

  return `
    <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:16px;">
      ${items.join('')}
    </div>`;
}

// ==========================================
// RELATÓRIO MENSAL
// ==========================================

export async function gerarRelatorioMensal(dados) {
  const { mes } = dados;
  const stats = calcularStats(dados);
  const nome = dados.cliente?.nome || g('Guerreiro', 'Guerreira');

  // Calcular datas do mês para o calendário
  const dataInicio = dados.dataInicio || '';
  const dataFim = dados.dataFim || '';

  // Score geral (0-100)
  const scores = [];
  if (stats.totalMeals > 0) scores.push(stats.aderenciaRefeicoes);
  if (stats.diasComAgua > 0) scores.push(Math.min(parseFloat(stats.mediaAguaL) / 2 * 100, 100));
  if (stats.treinosFeitos > 0) scores.push(Math.min(stats.treinosFeitos / 12 * 100, 100));
  if (parseFloat(stats.mediaSonoH) > 0) scores.push(Math.min(parseFloat(stats.mediaSonoH) / 7 * 100, 100));
  const scoreGeral = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
  const scoreLabel = scoreGeral >= 80 ? 'Excelente' : scoreGeral >= 60 ? 'Bom' : scoreGeral >= 40 ? 'Regular' : scoreGeral > 0 ? 'A melhorar' : 'Sem dados';
  const scoreCor = scoreGeral >= 80 ? '#10b981' : scoreGeral >= 60 ? '#3b82f6' : scoreGeral >= 40 ? '#f59e0b' : '#ef4444';

  const html = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 800px; margin: 0 auto; font-size: 12px; line-height: 1.5; color: #4A4035;">
      ${gerarHeader('Relatório Mensal', mes)}
      <div style="padding: 0 20px;">

        ${htmlContextoPrograma(dados)}

        <!-- Score Geral -->
        <div style="text-align:center; margin-bottom:18px; padding:16px; background:linear-gradient(135deg, #F5F2ED, #E8E4DC); border-radius:14px;">
          <div style="display:inline-block; width:80px; height:80px; border-radius:50%; border:6px solid ${scoreCor}; display:flex; align-items:center; justify-content:center; margin:0 auto 8px;">
            <span style="font-size:24px; font-weight:800; color:${scoreCor};">${scoreGeral}%</span>
          </div>
          <p style="margin:0; font-size:14px; font-weight:700; color:#4A4035;">${scoreLabel}</p>
          <p style="margin:2px 0 0; font-size:10px; color:#6B5C4C;">Score geral de ${mes}</p>
        </div>

        ${secao('Visão Geral', `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${metricaCard('Dias Activos', stats.diasActivos || stats.totalRegistos, stats.totalRegistos > 0 ? `${stats.totalRegistos} check-ins` : 'com registos', '#7C8B6F')}
            ${metricaCard('Refeições', stats.totalMeals > 0 ? `${stats.aderenciaRefeicoes}%` : '—', stats.totalMeals > 0 ? `${stats.mealsOk}✓ ${stats.mealsParcial}~ de ${stats.totalMeals}` : 'sem registos', stats.aderenciaRefeicoes >= 70 ? '#10b981' : '#f59e0b')}
            ${metricaCard('Treinos', stats.treinosFeitos > 0 ? stats.treinosFeitos : '—', stats.treinosFeitos > 0 ? `${stats.totalMinTreino} min` : 'sem registos', '#6366f1')}
            ${metricaCard('Água/dia', parseFloat(stats.mediaAguaL) > 0 ? `${stats.mediaAguaL}L` : '—', stats.diasComAgua > 0 ? `${stats.diasMeta2L} dias ≥2L` : 'sem registos', parseFloat(stats.mediaAguaL) >= 2 ? '#10b981' : '#f59e0b')}
          </div>
        `, '📊')}

        ${dataInicio && dataFim ? htmlCalendario(stats, dataInicio, dataFim) : ''}

        ${secao('Peso', htmlPeso(stats, dados.cliente), '⚖️')}

        ${htmlMedidas(stats)}

        ${htmlMealBreakdown(stats)}

        ${htmlTreinos(stats)}

        ${secao('Sono & Bem-estar', `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${metricaCard('Sono Médio', parseFloat(stats.mediaSonoH) > 0 ? `${stats.mediaSonoH}h` : '—', parseFloat(stats.mediaSonoH) > 0 ? `Qualidade: ${stats.mediaSonoQ}/5` : 'sem registos', parseFloat(stats.mediaSonoH) >= 7 ? '#10b981' : '#f59e0b')}
            ${metricaCard('Energia', stats.mediaEnergia !== '—' ? `${stats.mediaEnergia}/10` : '—', '', '#f59e0b')}
            ${metricaCard('Humor', stats.mediaHumor !== '—' ? `${stats.mediaHumor}/10` : '—', '', '#10b981')}
          </div>
        `, '😴')}

        ${htmlSemanasBreakdown(stats)}

        ${htmlInsights(stats)}

        <!-- Mensagem motivacional -->
        <div style="background:linear-gradient(135deg, #7C8B6F, #5A6B4D); padding:16px; border-radius:12px; color:white; text-align:center; margin-top:10px;">
          <p style="margin:0; font-size:12px; font-style:italic; line-height:1.5;">
            ${scoreGeral >= 70
              ? `"${nome}, este mês mostraste verdadeiro compromisso. Continua assim — os resultados vêm com consistência."`
              : scoreGeral >= 40
              ? `"${nome}, cada dia que registaste é um passo na direcção certa. No próximo mês, foca num hábito de cada vez."`
              : stats.diasActivos > 0
              ? `"${nome}, o importante é não desistir. Recomeça amanhã — estou aqui contigo."`
              : `"${nome}, um novo mês é uma nova oportunidade. Vamos juntos!"`
            }
          </p>
          <p style="margin:8px 0 0; font-size:10px; opacity:0.8;">— Vivianne, Coach Vitalis</p>
        </div>

      </div>
      ${gerarFooter()}
    </div>`;

  await renderPDF(html, `Vitalis_Mensal_${mes.replace(/\s/g, '_')}.pdf`);
}

// ==========================================
// RELATÓRIO DE FASE
// ==========================================

export async function gerarRelatorioFase(dados) {
  const { fase } = dados;
  const stats = calcularStats(dados);
  const nome = dados.cliente?.nome || g('Guerreiro', 'Guerreira');

  const faseDescricoes = {
    1: 'Adaptação ao novo ritmo alimentar. Redução de inflamação, estabilização de energia e criação de novos hábitos.',
    2: 'Expansão gradual das opções alimentares mantendo os princípios da fase anterior. Mais variedade, mesma disciplina.',
    3: 'Optimização do metabolismo com ajustes personalizados. Foco em recomposição corporal.',
    4: 'Consolidação dos hábitos para sustentabilidade a longo prazo. Autonomia alimentar completa.'
  };

  const html = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 800px; margin: 0 auto; font-size: 12px; line-height: 1.5; color: #4A4035;">
      ${gerarHeader(`Fase ${fase.numero}: ${fase.nome}`, 'Relatório de Conclusão')}
      <div style="padding: 0 20px;">

        ${htmlContextoPrograma(dados)}

        <div style="background: linear-gradient(135deg, #F5F2ED, #E8E4DC); padding: 16px; border-radius: 12px; margin-bottom: 18px;">
          <p style="margin: 0; font-size: 13px; color: #4A4035; font-weight: 600;">Sobre esta fase</p>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #6B5C4C;">${faseDescricoes[fase.numero] || ''}</p>
        </div>

        ${secao('Resultados da Fase', `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${metricaCard('Dias Activos', stats.diasActivos || stats.totalRegistos, 'com registos', '#7C8B6F')}
            ${metricaCard('Refeições', stats.totalMeals > 0 ? `${stats.aderenciaRefeicoes}%` : '—', stats.totalMeals > 0 ? `${stats.mealsOk}✓ de ${stats.totalMeals}` : 'sem dados', stats.aderenciaRefeicoes >= 70 ? '#10b981' : '#f59e0b')}
            ${metricaCard('Treinos', stats.treinosFeitos > 0 ? stats.treinosFeitos : '—', stats.treinosFeitos > 0 ? `${stats.totalMinTreino} min` : 'sem dados', '#6366f1')}
            ${metricaCard('Sono', parseFloat(stats.mediaSonoH) > 0 ? `${stats.mediaSonoH}h` : '—', parseFloat(stats.mediaSonoH) > 0 ? `${stats.mediaSonoQ}/5 qualidade` : 'sem dados', '#8b5cf6')}
          </div>
        `, '🏆')}

        ${secao('Evolução do Peso', htmlPeso(stats, dados.cliente), '⚖️')}

        ${htmlMedidas(stats)}

        ${htmlMealBreakdown(stats)}

        ${htmlTreinos(stats)}

        ${secao('Hidratação', `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${metricaCard('Média', parseFloat(stats.mediaAguaL) > 0 ? `${stats.mediaAguaL}L/dia` : '—', '', parseFloat(stats.mediaAguaL) >= 2 ? '#10b981' : '#f59e0b')}
            ${metricaCard('Dias ≥ 2L', stats.diasComAgua > 0 ? `${stats.diasMeta2L}` : '—', stats.diasComAgua > 0 ? `de ${stats.diasComAgua} dias` : 'sem dados', '#3b82f6')}
          </div>
          ${stats.diasComAgua > 0 ? `<div style="margin-top:8px;">${barraProgresso(stats.diasMeta2L / stats.diasComAgua * 100, '#3b82f6')}</div>` : ''}
        `, '💧')}

        ${secao('Bem-estar', `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${metricaCard('Energia', stats.mediaEnergia !== '—' ? `${stats.mediaEnergia}/10` : '—', '', '#f59e0b')}
            ${metricaCard('Humor', stats.mediaHumor !== '—' ? `${stats.mediaHumor}/10` : '—', '', '#10b981')}
          </div>
        `, '⚡')}

        ${htmlInsights(stats)}

        <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 20px; border-radius: 14px; text-align: center; color: white; margin: 18px 0;">
          <div style="font-size: 36px;">🏆</div>
          <p style="margin: 8px 0 0 0; font-weight: 700; font-size: 16px;">Fase ${fase.numero} Completa!</p>
          <p style="margin: 6px 0 0 0; font-size: 12px; opacity: 0.9;">Parabéns, ${nome}! Cada fase é uma conquista.</p>
        </div>

        <div style="background:linear-gradient(135deg, #7C8B6F, #5A6B4D); padding:14px; border-radius:12px; color:white; text-align:center;">
          <p style="margin:0; font-size:12px; font-style:italic; line-height:1.5;">
            "A consistência supera a perfeição. Leva os hábitos desta fase para a próxima — eles são o teu alicerce."
          </p>
          <p style="margin:6px 0 0; font-size:10px; opacity:0.8;">— Vivianne, Coach Vitalis</p>
        </div>

      </div>
      ${gerarFooter()}
    </div>`;

  await renderPDF(html, `Vitalis_Fase${fase.numero}_${fase.nome}.pdf`);
}

// ==========================================
// RELATÓRIO FINAL
// ==========================================

export async function gerarRelatorioFinal(dados) {
  const { cliente, conquistas } = dados;
  const stats = calcularStats(dados);
  const nome = cliente?.nome || g('Guerreiro', 'Guerreira');

  const diasPrograma = cliente?.data_inicio
    ? Math.floor((new Date() - new Date(cliente.data_inicio)) / (1000 * 60 * 60 * 24))
    : 84;

  const consistencia = diasPrograma > 0 ? Math.round((stats.diasActivos / diasPrograma) * 100) : 0;
  const meta = cliente?.peso_meta || 0;
  const pesoInicialProg = cliente?.peso_inicial || stats.pesoInicio;
  const pesoFinalProg = cliente?.peso_actual || stats.pesoFim;
  const totalPerdido = pesoInicialProg - pesoFinalProg;
  const metaAlcancada = meta > 0 && pesoFinalProg <= meta;

  const emojis = { musculacao: '🏋️', corrida: '🏃', caminhada: '🚶', yoga: '🧘', natacao: '🏊', danca: '💃', ciclismo: '🚴', hiit: '⚡', pilates: '🤸', outro: '🔥', geral: '💪' };
  const treinoFav = Object.entries(stats.tiposTreino).sort((a, b) => b[1] - a[1])[0];

  const html = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 800px; margin: 0 auto; font-size: 12px; line-height: 1.5; color: #4A4035;">
      ${gerarHeader('Relatório de Conclusão', `A jornada Vitalis de ${nome}`)}
      <div style="padding: 0 20px;">

        <!-- Celebração -->
        <div style="text-align: center; margin-bottom: 20px; padding: 24px; background: linear-gradient(135deg, #F0FFF4, #E8F5E9); border-radius: 16px; border: 2px solid #C6F6D5;">
          <div style="font-size: 50px;">${metaAlcancada ? '🎉' : '🌟'}</div>
          <h2 style="margin: 8px 0 0 0; color: #7C8B6F; font-size: 20px;">Parabéns, ${nome}!</h2>
          <p style="margin: 6px 0 0 0; color: #6B5C4C; font-size: 13px;">
            ${metaAlcancada
              ? `Atingiste o teu objectivo! De ${pesoInicialProg} kg para ${pesoFinalProg} kg em ${diasPrograma} dias.`
              : `Completaste ${diasPrograma} dias de programa Vitalis com ${consistencia}% de consistência.`
            }
          </p>
        </div>

        ${htmlContextoPrograma(dados)}

        <!-- Transformação Principal -->
        ${secao('A Tua Transformação', `
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
            ${metricaCard('Duração', `${diasPrograma}`, 'dias', '#7C8B6F')}
            ${metricaCard('Consistência', `${consistencia}%`, `${stats.diasActivos} dias activos`, consistencia >= 70 ? '#10b981' : '#f59e0b')}
            ${metricaCard('Peso', totalPerdido > 0 ? `-${totalPerdido.toFixed(1)}kg` : `${Math.abs(totalPerdido).toFixed(1)}kg`, `${pesoInicialProg} → ${pesoFinalProg} kg`, totalPerdido > 0 ? '#10b981' : '#f59e0b')}
            ${meta > 0 ? metricaCard('Meta', metaAlcancada ? '✓' : `${Math.round(Math.abs(totalPerdido) / Math.abs(pesoInicialProg - meta) * 100)}%`, `${meta} kg`, metaAlcancada ? '#10b981' : '#6366f1') : metricaCard('Refeições', `${stats.aderenciaRefeicoes}%`, 'aderência', '#f59e0b')}
          </div>
          ${stats.pesosOrdenados.length > 2 ? `
            <div style="margin-top:8px;">
              <div style="font-size:10px; color:#6B5C4C; margin-bottom:4px;">Evolução completa do peso (${stats.pesosOrdenados.length} registos)</div>
              ${miniBarChart(
                stats.pesosOrdenados.map(p => p.peso_kg),
                Math.max(...stats.pesosOrdenados.map(p => p.peso_kg)) + 2,
                (v) => v <= pesoInicialProg ? '#10b981' : '#ef4444'
              )}
            </div>` : ''}
        `, '⚖️')}

        ${htmlMedidas(stats)}

        <!-- Hábitos Construídos -->
        ${secao('Hábitos que Construíste', `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
            <div style="background:#EFF6FF; padding:12px; border-radius:10px; text-align:center;">
              <div style="font-size:20px;">💧</div>
              <div style="font-size:16px; font-weight:700; color:#1d4ed8;">${parseFloat(stats.mediaAguaL) > 0 ? `${stats.mediaAguaL}L` : '—'}</div>
              <div style="font-size:9px; color:#3b82f6;">água/dia</div>
              ${stats.diasMeta2L > 0 ? `<div style="font-size:8px; color:#6b7280; margin-top:2px;">${stats.diasMeta2L} dias com ≥2L</div>` : ''}
            </div>
            <div style="background:#F0FDF4; padding:12px; border-radius:10px; text-align:center;">
              <div style="font-size:20px;">😴</div>
              <div style="font-size:16px; font-weight:700; color:#15803d;">${parseFloat(stats.mediaSonoH) > 0 ? `${stats.mediaSonoH}h` : '—'}</div>
              <div style="font-size:9px; color:#22c55e;">sono/noite</div>
              ${parseFloat(stats.mediaSonoQ) > 0 ? `<div style="font-size:8px; color:#6b7280; margin-top:2px;">Qualidade: ${stats.mediaSonoQ}/5</div>` : ''}
            </div>
            <div style="background:#FEF3C7; padding:12px; border-radius:10px; text-align:center;">
              <div style="font-size:20px;">⚡</div>
              <div style="font-size:16px; font-weight:700; color:#b45309;">${stats.mediaEnergia !== '—' ? stats.mediaEnergia : '—'}</div>
              <div style="font-size:9px; color:#f59e0b;">energia/10</div>
            </div>
            <div style="background:#ECFDF5; padding:12px; border-radius:10px; text-align:center;">
              <div style="font-size:20px;">😊</div>
              <div style="font-size:16px; font-weight:700; color:#047857;">${stats.mediaHumor !== '—' ? stats.mediaHumor : '—'}</div>
              <div style="font-size:9px; color:#10b981;">humor/10</div>
            </div>
          </div>
          ${treinoFav ? `
            <div style="background:#EEF2FF; padding:10px; border-radius:10px; display:flex; align-items:center; gap:8px;">
              <span style="font-size:24px;">${emojis[treinoFav[0]] || '💪'}</span>
              <div>
                <div style="font-size:11px; font-weight:600; color:#4338ca;">Treino Favorito: ${treinoFav[0].charAt(0).toUpperCase() + treinoFav[0].slice(1)}</div>
                <div style="font-size:9px; color:#6366f1;">${treinoFav[1]}x sessões • ${stats.totalMinTreino} min total (${stats.treinosFeitos} treinos)</div>
              </div>
            </div>` : ''}
        `, '🌱')}

        ${htmlMealBreakdown(stats)}

        ${(conquistas || []).length > 0 ? secao('Conquistas Desbloqueadas', `
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${conquistas.map(c => `
              <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 10px; border-radius: 10px; text-align: center; min-width: 70px;">
                <div style="font-size: 20px;">${c.emoji || c.icone || '🏆'}</div>
                <div style="font-size: 9px; color: white; font-weight: 600; margin-top: 2px;">${c.nome || 'Conquista'}</div>
              </div>`).join('')}
          </div>
        `, '🏆') : ''}

        ${htmlInsights(stats)}

        <!-- Mensagem Final -->
        <div style="background: linear-gradient(135deg, #7C8B6F, #5A6B4D); padding: 20px; border-radius: 14px; text-align: center; color: white; margin-top: 16px;">
          <p style="margin: 0; font-size: 13px; font-style: italic; line-height: 1.6;">
            "${nome}, cada registo, cada refeição consciente, cada copo de água — tudo contribuiu para esta transformação.
            O programa termina, mas os hábitos ficam. Leva contigo estas ferramentas e continua a honrar o teu corpo."
          </p>
          <p style="margin: 12px 0 0 0; font-size: 11px; opacity: 0.8;">— Vivianne, Coach Vitalis</p>
        </div>

      </div>
      ${gerarFooter()}
    </div>`;

  await renderPDF(html, `Vitalis_Relatorio_Final_${nome.replace(/\s/g, '_')}.pdf`);
}

// ==========================================
// RENDER PDF
// ==========================================
// RELATÓRIO PROGRESSO ACUMULADO (desde dia 1)
// ==========================================

export async function gerarRelatorioProgresso(dados) {
  const { cliente } = dados;
  const stats = calcularStats(dados);
  const nome = cliente?.nome || g('Guerreiro', 'Guerreira');

  const dataInicio = cliente?.data_inicio || cliente?.created_at;
  const diasPrograma = dataInicio
    ? Math.floor((new Date() - new Date(dataInicio)) / (1000 * 60 * 60 * 24))
    : 0;
  const consistencia = diasPrograma > 0 ? Math.round((stats.diasActivos / diasPrograma) * 100) : 0;

  const pesoInicialProg = cliente?.peso_inicial || stats.pesoInicio;
  const pesoActual = cliente?.peso_actual || stats.pesoFim;
  const totalPerdido = pesoInicialProg - pesoActual;
  const meta = cliente?.peso_meta || 0;
  const pctMeta = meta > 0 && pesoInicialProg > meta
    ? Math.min(Math.round(Math.abs(totalPerdido) / Math.abs(pesoInicialProg - meta) * 100), 100)
    : 0;

  const dataInicioStr = dataInicio ? new Date(dataInicio).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const hojeStr = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });

  const html = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 800px; margin: 0 auto; font-size: 12px; line-height: 1.5; color: #4A4035;">
      ${gerarHeader('Progresso Acumulado', `${dataInicioStr} — ${hojeStr} (${diasPrograma} dias)`)}
      <div style="padding: 0 20px;">

        ${htmlContextoPrograma(dados)}

        <!-- Resumo da Jornada -->
        ${secao('Resumo da Jornada', `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${metricaCard('Programa', `${diasPrograma}d`, `${consistencia}% consistência`, '#7C8B6F')}
            ${metricaCard('Dias Activos', stats.diasActivos, `de ${diasPrograma}`, consistencia >= 70 ? '#10b981' : '#f59e0b')}
            ${metricaCard('Refeições', stats.totalMeals > 0 ? `${stats.aderenciaRefeicoes}%` : '—', stats.totalMeals > 0 ? `${stats.mealsOk}✓ de ${stats.totalMeals}` : 'sem registos', stats.aderenciaRefeicoes >= 70 ? '#10b981' : '#f59e0b')}
            ${metricaCard('Treinos', stats.treinosFeitos > 0 ? `${stats.treinosFeitos}` : '—', stats.treinosFeitos > 0 ? `${Math.round(stats.totalMinTreino / 60)}h total` : 'sem registos', '#6366f1')}
          </div>
        `, '📊')}

        <!-- Peso: progresso em direcção à meta -->
        ${secao('Peso — Caminho até à Meta', `
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
            ${metricaCard('Início', `${pesoInicialProg} kg`, dataInicioStr.split(' ').slice(0, 2).join(' '), '#7C8B6F')}
            ${metricaCard('Actual', `${pesoActual} kg`, 'hoje', totalPerdido > 0 ? '#10b981' : '#f59e0b')}
            ${metricaCard('Variação', `${totalPerdido > 0 ? '-' : '+'}${Math.abs(totalPerdido).toFixed(1)} kg`, totalPerdido > 0 ? '↓ a perder' : totalPerdido < 0 ? '↑ ganho' : 'estável', totalPerdido > 0 ? '#10b981' : '#ef4444')}
            ${meta > 0 ? metricaCard('Meta', `${meta} kg`, `${pctMeta}% alcançado`, pctMeta >= 100 ? '#10b981' : '#6366f1') : metricaCard('Água/dia', parseFloat(stats.mediaAguaL) > 0 ? `${stats.mediaAguaL}L` : '—', '', '#3b82f6')}
          </div>
          ${meta > 0 ? `
            <div style="margin-bottom:6px;">
              <div style="display:flex; justify-content:space-between; font-size:9px; color:#6B5C4C; margin-bottom:3px;">
                <span>${pesoInicialProg} kg</span>
                <span>Meta: ${meta} kg</span>
              </div>
              ${barraProgresso(pctMeta, pctMeta >= 100 ? '#10b981' : '#6366f1', '12px')}
              <div style="font-size:9px; color:#6B5C4C; text-align:center; margin-top:3px;">
                ${pctMeta >= 100 ? 'Meta atingida!' : `Faltam ${(pesoActual - meta).toFixed(1)} kg`}
              </div>
            </div>` : ''}
          ${stats.pesosOrdenados.length > 2 ? `
            <div style="margin-top:8px;">
              <div style="font-size:10px; color:#6B5C4C; margin-bottom:4px;">Evolução do peso (${stats.pesosOrdenados.length} registos)</div>
              ${miniBarChart(
                stats.pesosOrdenados.map(p => p.peso_kg),
                Math.max(...stats.pesosOrdenados.map(p => p.peso_kg)) + 2,
                (v) => v <= pesoInicialProg ? '#10b981' : '#ef4444'
              )}
            </div>` : ''}
        `, '⚖️')}

        ${htmlMedidas(stats)}

        ${htmlMealBreakdown(stats)}

        ${htmlTreinos(stats)}

        ${secao('Hidratação & Sono', `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${metricaCard('Água/dia', parseFloat(stats.mediaAguaL) > 0 ? `${stats.mediaAguaL}L` : '—', stats.diasComAgua > 0 ? `${stats.diasMeta2L} dias ≥2L` : 'sem registos', parseFloat(stats.mediaAguaL) >= 2 ? '#10b981' : '#f59e0b')}
            ${metricaCard('Sono', parseFloat(stats.mediaSonoH) > 0 ? `${stats.mediaSonoH}h` : '—', parseFloat(stats.mediaSonoQ) > 0 ? `Qualidade: ${stats.mediaSonoQ}/5` : 'sem registos', parseFloat(stats.mediaSonoH) >= 7 ? '#10b981' : '#f59e0b')}
            ${metricaCard('Energia', stats.mediaEnergia !== '—' ? `${stats.mediaEnergia}/10` : '—', '', '#f59e0b')}
            ${metricaCard('Humor', stats.mediaHumor !== '—' ? `${stats.mediaHumor}/10` : '—', '', '#10b981')}
          </div>
        `, '💧')}

        ${dataInicio ? htmlCalendario(stats, new Date(dataInicio).toISOString().split('T')[0], new Date().toISOString().split('T')[0]) : ''}

        ${htmlSemanasBreakdown(stats)}

        ${htmlInsights(stats, '', { variacaoPeso: -totalPerdido })}

        <div style="background:linear-gradient(135deg, #7C8B6F, #5A6B4D); padding:16px; border-radius:12px; color:white; text-align:center; margin-top:10px;">
          <p style="margin:0; font-size:12px; font-style:italic; line-height:1.5;">
            "${nome}, ${diasPrograma} dias de caminho percorrido. Cada registo conta. Continua — o progresso é teu."
          </p>
          <p style="margin:8px 0 0; font-size:10px; opacity:0.8;">— Vivianne, Coach Vitalis</p>
        </div>

      </div>
      ${gerarFooter()}
    </div>`;

  await renderPDF(html, `Vitalis_Progresso_${nome.replace(/\s/g, '_')}_${diasPrograma}dias.pdf`);
}

// ==========================================
// RENDER PDF
// ==========================================

async function renderPDF(html, filename) {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  const html2pdf = await getHtml2pdf();
  await html2pdf().set({ ...PDF_CONFIG, filename }).from(container).save();

  document.body.removeChild(container);
}

export default { gerarRelatorioMensal, gerarRelatorioFase, gerarRelatorioFinal, gerarRelatorioProgresso };
