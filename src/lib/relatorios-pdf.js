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
  const pesoInicio = pesosOrdenados[0]?.peso_kg || dados.cliente?.peso_actual || 0;
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
  (treinos || []).forEach(t => { tiposTreino[t.tipo] = (tiposTreino[t.tipo] || 0) + 1; });
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

  // Energia e humor
  const comEnergia = (registos || []).filter(r => r.energia_1a10);
  const mediaEnergia = comEnergia.length > 0 ? (comEnergia.reduce((s, r) => s + r.energia_1a10, 0) / comEnergia.length).toFixed(1) : '—';
  const comHumor = (registos || []).filter(r => r.humor_1a10);
  const mediaHumor = comHumor.length > 0 ? (comHumor.reduce((s, r) => s + r.humor_1a10, 0) / comHumor.length).toFixed(1) : '—';

  // Medidas
  const primeiraM = (medidas || [])[0];
  const ultimaM = (medidas || []).length > 1 ? medidas[medidas.length - 1] : null;

  return {
    pesoInicio, pesoFim, variacaoPeso,
    mediaAguaL, diasComAgua, diasMeta2L,
    treinosFeitos, tiposTreino, totalMinTreino,
    mediaSonoH, mediaSonoQ, sonoComDados,
    totalMeals, mealsOk, mealsParcial, aderenciaRefeicoes,
    mediaEnergia, mediaHumor,
    primeiraM, ultimaM, pesosOrdenados,
    totalRegistos: (registos || []).length
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
  if (!stats.primeiraM || !stats.ultimaM) return '';
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

function htmlInsights(stats) {
  const insights = [];
  if (stats.aderenciaRefeicoes >= 80) insights.push('✅ Excelente aderência às refeições — mantém este ritmo!');
  else if (stats.aderenciaRefeicoes >= 50) insights.push('📈 Aderência às refeições pode melhorar — tenta planear com antecedência.');
  else if (stats.totalMeals > 0) insights.push('⚠️ Aderência baixa às refeições — foca numa refeição de cada vez.');

  if (parseFloat(stats.mediaAguaL) >= 2) insights.push('💧 Hidratação óptima — parabéns!');
  else if (parseFloat(stats.mediaAguaL) >= 1) insights.push('💧 Hidratação pode melhorar — tenta chegar aos 2L diários.');
  else if (stats.diasComAgua > 0) insights.push('🚨 Hidratação muito abaixo — prioriza beber mais água.');

  if (parseFloat(stats.mediaSonoH) >= 7) insights.push('😴 Sono dentro do recomendado — continua assim.');
  else if (parseFloat(stats.mediaSonoH) >= 5) insights.push('😴 Sono abaixo do ideal — tenta dormir 7-8 horas.');

  if (stats.treinosFeitos >= 12) insights.push('🏋️ Frequência de treino excelente!');
  else if (stats.treinosFeitos >= 8) insights.push('🏋️ Bom ritmo de treino — tenta mais um dia por semana.');
  else if (stats.treinosFeitos > 0) insights.push('🏋️ Podes aumentar a frequência de treino gradualmente.');

  if (stats.variacaoPeso < -1) insights.push(`⭐ Perdeste ${Math.abs(stats.variacaoPeso).toFixed(1)} kg — excelente progresso!`);
  else if (stats.variacaoPeso > 1) insights.push('📊 O peso subiu — analisa se é retenção, massa muscular ou ajusta a alimentação.');

  return insights.length > 0 ? secao('Análise e Recomendações', `
    <ul style="list-style:none; padding:0; margin:0;">
      ${insights.map(i => `<li style="padding:6px 0; border-bottom:1px solid #E8E2D9; font-size:12px; color:#4A4035;">${i}</li>`).join('')}
    </ul>`, '💡') : '';
}

// ==========================================
// RELATÓRIO MENSAL
// ==========================================

export async function gerarRelatorioMensal(dados) {
  const { mes } = dados;
  const stats = calcularStats(dados);

  const treinoTipos = Object.entries(stats.tiposTreino).map(([tipo, count]) =>
    `<span style="display:inline-block; background:#E8E2D9; padding:3px 8px; border-radius:12px; font-size:10px; margin:2px;">${tipo}: ${count}x</span>`
  ).join('');

  const html = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 800px; margin: 0 auto; font-size: 12px; line-height: 1.5; color: #4A4035;">
      ${gerarHeader('Relatório Mensal', mes)}
      <div style="padding: 0 20px;">

        ${secao('Visão Geral', `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${metricaCard('Dias Activos', stats.totalRegistos, 'check-ins', '#7C8B6F')}
            ${metricaCard('Refeições', `${stats.aderenciaRefeicoes}%`, `${stats.mealsOk}/${stats.totalMeals} no plano`, stats.aderenciaRefeicoes >= 70 ? '#10b981' : '#f59e0b')}
            ${metricaCard('Treinos', stats.treinosFeitos, `${stats.totalMinTreino} min total`, '#6366f1')}
            ${metricaCard('Água/dia', `${stats.mediaAguaL}L`, `${stats.diasMeta2L} dias ≥2L`, parseFloat(stats.mediaAguaL) >= 2 ? '#10b981' : '#f59e0b')}
          </div>
        `, '📊')}

        ${secao('Peso', htmlPeso(stats, dados.cliente), '⚖️')}

        ${htmlMedidas(stats)}

        ${secao('Treinos', `
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
            ${metricaCard('Sessões', stats.treinosFeitos, '', '#7C8B6F')}
            ${metricaCard('Tempo Total', `${stats.totalMinTreino} min`, `~${Math.round(stats.totalMinTreino/60)}h`, '#7C8B6F')}
          </div>
          ${treinoTipos ? `<div style="margin-top:6px;"><span style="font-size:10px; color:#6B5C4C;">Tipos:</span> ${treinoTipos}</div>` : ''}
        `, '🏋️')}

        ${secao('Sono & Bem-estar', `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${metricaCard('Sono Médio', `${stats.mediaSonoH}h`, `Qualidade: ${stats.mediaSonoQ}/5`, parseFloat(stats.mediaSonoH) >= 7 ? '#10b981' : '#f59e0b')}
            ${metricaCard('Energia', `${stats.mediaEnergia}/10`, '', '#f59e0b')}
            ${metricaCard('Humor', `${stats.mediaHumor}/10`, '', '#10b981')}
          </div>
        `, '😴')}

        ${htmlInsights(stats)}

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

        <div style="background: linear-gradient(135deg, #F5F2ED, #E8E4DC); padding: 16px; border-radius: 12px; margin-bottom: 18px;">
          <p style="margin: 0; font-size: 13px; color: #4A4035; font-weight: 600;">Sobre esta fase</p>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #6B5C4C;">${faseDescricoes[fase.numero] || ''}</p>
        </div>

        ${secao('Resultados da Fase', `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${metricaCard('Check-ins', stats.totalRegistos, 'dias registados', '#7C8B6F')}
            ${metricaCard('Refeições', `${stats.aderenciaRefeicoes}%`, 'aderência', stats.aderenciaRefeicoes >= 70 ? '#10b981' : '#f59e0b')}
            ${metricaCard('Treinos', stats.treinosFeitos, `${stats.totalMinTreino} min`, '#6366f1')}
            ${metricaCard('Sono', `${stats.mediaSonoH}h`, `${stats.mediaSonoQ}/5 qualidade`, '#8b5cf6')}
          </div>
        `, '🏆')}

        ${secao('Evolução do Peso', htmlPeso(stats, dados.cliente), '⚖️')}

        ${htmlMedidas(stats)}

        ${secao('Hidratação', `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${metricaCard('Média', `${stats.mediaAguaL}L/dia`, '', parseFloat(stats.mediaAguaL) >= 2 ? '#10b981' : '#f59e0b')}
            ${metricaCard('Dias ≥ 2L', `${stats.diasMeta2L}`, `de ${stats.diasComAgua} dias`, '#3b82f6')}
          </div>
          <div style="margin-top:8px;">${barraProgresso(stats.diasComAgua > 0 ? (stats.diasMeta2L / stats.diasComAgua * 100) : 0, '#3b82f6')}</div>
        `, '💧')}

        ${htmlInsights(stats)}

        <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 16px; border-radius: 12px; text-align: center; color: white; margin-bottom: 18px;">
          <div style="font-size: 30px;">🏆</div>
          <p style="margin: 6px 0 0 0; font-weight: 700; font-size: 14px;">Fase ${fase.numero} Completa!</p>
          <p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.9;">Parabéns pelo teu compromisso e dedicação.</p>
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

  const consistencia = diasPrograma > 0 ? Math.round((stats.totalRegistos / diasPrograma) * 100) : 0;

  const treinoResumo = Object.entries(stats.tiposTreino)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tipo, count]) => `<span style="display:inline-block; background:#E8E2D9; padding:3px 8px; border-radius:12px; font-size:10px; margin:2px;">${tipo}: ${count}x</span>`)
    .join('');

  const html = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 800px; margin: 0 auto; font-size: 12px; line-height: 1.5; color: #4A4035;">
      ${gerarHeader('Relatório de Conclusão', `A jornada Vitalis de ${nome}`)}
      <div style="padding: 0 20px;">

        <div style="text-align: center; margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #F0FFF4, #E8F5E9); border-radius: 16px;">
          <div style="font-size: 50px;">🎉</div>
          <h2 style="margin: 8px 0 0 0; color: #7C8B6F; font-size: 20px;">Parabéns, ${nome}!</h2>
          <p style="margin: 6px 0 0 0; color: #6B5C4C; font-size: 13px;">Completaste ${diasPrograma} dias do programa Vitalis.</p>
        </div>

        ${secao('A Tua Jornada em Números', `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${metricaCard('Dias', diasPrograma, 'de programa', '#7C8B6F')}
            ${metricaCard('Check-ins', stats.totalRegistos, `${consistencia}% consistência`, '#10b981')}
            ${metricaCard('Refeições', stats.totalMeals, `${stats.aderenciaRefeicoes}% aderência`, '#f59e0b')}
            ${metricaCard('Treinos', stats.treinosFeitos, `${Math.round(stats.totalMinTreino / 60)}h total`, '#6366f1')}
          </div>
        `, '📊')}

        ${secao('Transformação do Peso', htmlPeso(stats, cliente), '⚖️')}

        ${htmlMedidas(stats)}

        ${secao('Hábitos Construídos', `
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
            ${metricaCard('Água', `${stats.mediaAguaL}L/dia`, `${stats.diasMeta2L} dias ≥2L`, '#3b82f6')}
            ${metricaCard('Sono', `${stats.mediaSonoH}h/noite`, `${stats.mediaSonoQ}/5 qualidade`, '#8b5cf6')}
            ${metricaCard('Energia', `${stats.mediaEnergia}/10`, 'média', '#f59e0b')}
            ${metricaCard('Humor', `${stats.mediaHumor}/10`, 'média', '#10b981')}
          </div>
          ${treinoResumo ? `<div><span style="font-size:10px; color:#6B5C4C;">Treinos favoritos:</span> ${treinoResumo}</div>` : ''}
        `, '🌱')}

        ${(conquistas || []).length > 0 ? secao('Conquistas Desbloqueadas', `
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${conquistas.map(c => `
              <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 10px; border-radius: 10px; text-align: center; min-width: 70px;">
                <div style="font-size: 20px;">${c.emoji || '🏆'}</div>
                <div style="font-size: 9px; color: white; font-weight: 600; margin-top: 2px;">${c.nome || 'Conquista'}</div>
              </div>`).join('')}
          </div>
        `, '🏆') : ''}

        ${htmlInsights(stats)}

        <div style="background: linear-gradient(135deg, #7C8B6F, #5A6B4D); padding: 20px; border-radius: 14px; text-align: center; color: white; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px; font-style: italic; line-height: 1.6;">
            "Cada dia que registaste, cada refeição consciente, cada copo de água — tudo contribuiu para esta transformação.
            Leva contigo estas ferramentas e continua a honrar o teu corpo."
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

async function renderPDF(html, filename) {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  const html2pdf = await getHtml2pdf();
  await html2pdf().set({ ...PDF_CONFIG, filename }).from(container).save();

  document.body.removeChild(container);
}

export default { gerarRelatorioMensal, gerarRelatorioFase, gerarRelatorioFinal };
