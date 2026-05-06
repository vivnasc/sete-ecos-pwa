// Gera o caderno imprimível Reset · 60 dias
// Uso: node scripts/gerar-reset-caderno.mjs
// Output: public/reset-caderno.html

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const startDate = new Date(2026, 4, 11) // 11 maio 2026 (mês 0-indexed)
const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const treinoSemanal = {
  Segunda: 'Pernas + Glúteos · 30min · halteres',
  Terça: 'Cardio leve · 30min · caminhada ou bicicleta',
  Quarta: 'Descanso activo · alongamento ou caminhada com Cris',
  Quinta: 'Costas + Ombros + Bíceps · 30min · halteres',
  Sexta: 'Descanso · caminhada se apetecer',
  Sábado: 'Full body · 40min · circuito (refeed à noite)',
  Domingo: 'Descanso total'
}

const mantras = [
  'O teu corpo já sabe o caminho. Este plano só o guia.',
  'Subtracção, não adição.',
  'Suficiente é melhor que ótimo.',
  'Não estás a começar. Estás a regressar.',
  'Estás cansada, não falhada.',
  'Movimento é descompressão.',
  'A fita métrica não mente.',
  'Hoje, esta refeição. Não a vida toda.',
  'Aceitar ajuda não te diminui.',
  'Progresso, não perfeição.'
]

const dias = []
for (let i = 0; i < 60; i++) {
  const d = new Date(startDate)
  d.setDate(startDate.getDate() + i)
  const dow = diasSemana[d.getDay()]
  dias.push({
    num: i + 1,
    dia: d.getDate(),
    mes: meses[d.getMonth()],
    mesCurto: meses[d.getMonth()].slice(0, 3).toLowerCase(),
    diaSemana: dow,
    treino: treinoSemanal[dow],
    medidas: [14, 28, 42, 56].includes(i + 1),
    mantra: mantras[i % mantras.length]
  })
}

const css = `
  @page { size: A4; margin: 12mm 14mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    font-family: Georgia, 'Times New Roman', serif;
    color: #3D2817;
    background: #F8F4EC;
    line-height: 1.5;
    font-size: 11pt;
  }
  body { padding: 0; }
  .page {
    width: 100%;
    min-height: 273mm;
    padding: 8mm 4mm;
    page-break-after: always;
    position: relative;
  }
  .page:last-child { page-break-after: auto; }
  h1, h2, h3 { font-weight: normal; letter-spacing: 0.02em; }
  h1 { font-size: 32pt; color: #C9A961; }
  h2 { font-size: 18pt; color: #3D2817; margin-bottom: 12pt; border-bottom: 1px solid #C9A961; padding-bottom: 4pt; }
  h3 { font-size: 13pt; color: #7A8450; margin: 12pt 0 6pt; text-transform: uppercase; letter-spacing: 0.1em; font-size: 9pt; }
  p { margin: 6pt 0; }
  ul { margin: 6pt 0 6pt 18pt; }
  li { margin: 3pt 0; }
  .small { font-size: 9pt; color: #7A8450; }
  .center { text-align: center; }
  .gold { color: #C9A961; }
  .olive { color: #7A8450; }
  .terracota { color: #B8704A; }
  .light { color: #8a7a6a; }
  hr { border: none; border-top: 1px solid #C9A961; margin: 14pt 0; }
  .checkbox { display: inline-block; width: 13pt; height: 13pt; border: 1.3px solid #3D2817; vertical-align: -2pt; margin-right: 8pt; }
  .checkbox-sm { width: 10pt; height: 10pt; border: 1px solid #3D2817; vertical-align: -1pt; margin-right: 5pt; }
  .line { border-bottom: 1px solid #3D2817; display: inline-block; min-width: 60pt; height: 1px; vertical-align: -3pt; }
  .line-full { border-bottom: 1px solid #b9a98e; display: block; height: 14pt; }
  .ancora { display: flex; align-items: flex-start; gap: 8pt; margin: 8pt 0; padding: 4pt 0; }
  .ancora-num { color: #C9A961; font-weight: bold; min-width: 18pt; }
  .ancora-text { flex: 1; }

  /* Capa */
  .cover { text-align: center; padding: 60mm 10mm 0; }
  .cover .titulo { font-size: 60pt; color: #C9A961; letter-spacing: 0.1em; margin-bottom: 8pt; }
  .cover .sub { font-size: 14pt; color: #3D2817; margin-bottom: 40pt; font-style: italic; }
  .cover .periodo { font-size: 11pt; color: #7A8450; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 30pt; }
  .cover .nome { font-size: 16pt; color: #3D2817; margin-top: 80mm; }

  /* Página de dia */
  .day-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #C9A961; padding-bottom: 6pt; margin-bottom: 12pt; }
  .day-num { font-size: 38pt; color: #C9A961; line-height: 1; }
  .day-meta { text-align: right; }
  .day-data { font-size: 14pt; color: #3D2817; }
  .day-dow { font-size: 10pt; color: #7A8450; text-transform: uppercase; letter-spacing: 0.15em; }
  .day-mantra { font-style: italic; color: #B8704A; text-align: center; margin: 8pt 0 16pt; font-size: 10pt; }
  .ancoras-grid { margin: 10pt 0; }
  .ancoras-grid .ancora { padding: 3pt 0; font-size: 10pt; }
  .row { display: flex; gap: 14pt; margin: 10pt 0; align-items: center; }
  .col { flex: 1; }
  .field-label { font-size: 8pt; color: #7A8450; text-transform: uppercase; letter-spacing: 0.12em; display: block; margin-bottom: 2pt; }
  .field-line { border-bottom: 1px solid #b9a98e; height: 16pt; }
  .scale { display: flex; gap: 4pt; align-items: center; font-size: 9pt; }
  .scale .num { width: 14pt; height: 14pt; border: 1px solid #3D2817; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 8pt; }
  .treino-box { border: 1px dashed #7A8450; padding: 6pt 8pt; margin: 8pt 0; font-size: 10pt; color: #7A8450; }
  .treino-box .label { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.1em; color: #B8704A; }
  .alcool-box { border: 1px solid #B8704A; padding: 6pt 8pt; margin: 8pt 0; font-size: 9pt; }
  .alcool-box .label { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.12em; color: #B8704A; }
  .notas-box { margin-top: 8pt; }
  .notas-box .field-line { height: 14pt; }
  .medidas-banner { background: #C9A961; color: #F8F4EC; padding: 6pt 10pt; text-align: center; margin: 10pt 0; font-size: 10pt; letter-spacing: 0.1em; text-transform: uppercase; }

  /* Página de medidas */
  .medida-row { display: flex; gap: 10pt; margin: 10pt 0; align-items: center; }
  .medida-row .label { width: 80pt; font-size: 10pt; color: #7A8450; text-transform: uppercase; letter-spacing: 0.1em; }
  .medida-row .value { flex: 1; border-bottom: 1px solid #3D2817; height: 18pt; }
  .medida-row .unit { width: 30pt; font-size: 9pt; color: #8a7a6a; }

  /* Refeições */
  .ref-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14pt; margin-top: 12pt; }
  .ref-card { border: 1px solid #C9A961; padding: 8pt 10pt; }
  .ref-card h4 { font-size: 11pt; color: #C9A961; margin-bottom: 4pt; }
  .ref-card ul { font-size: 9.5pt; margin-left: 14pt; }

  /* Mantras */
  .mantra-list { padding: 20pt 0; }
  .mantra-item { font-size: 13pt; font-style: italic; color: #3D2817; margin: 18pt 0; padding-left: 14pt; border-left: 2px solid #C9A961; }
  .mantra-num { color: #C9A961; font-weight: bold; font-style: normal; margin-right: 6pt; }

  .footer-page { position: absolute; bottom: 6mm; left: 0; right: 0; text-align: center; font-size: 8pt; color: #b9a98e; letter-spacing: 0.1em; }
`

const ancoras = [
  { num: '01', titulo: 'Ecrã off às 21h00', detalhe: 'todos os dias. carregador na cozinha.' },
  { num: '02', titulo: 'Janela 9h–19h', detalhe: 'jejum 14h. PA com proteína + gordura à 1h após acordar.' },
  { num: '03', titulo: 'Carbos = zero', detalhe: 'sem cinzentos. excepção: refeed sábado à noite.' },
  { num: '04', titulo: 'Proteína primeiro', detalhe: '1,8g/kg. preserva músculo na retoma.' },
  { num: '05', titulo: 'Caderno antes do copo', detalhe: 'hora + emoção numa linha. depois decides.' },
  { num: '06', titulo: 'Eletrólitos religiosos', detalhe: 'sal de manhã na água. magnésio bisglicinato 400mg à noite.' },
  { num: '07', titulo: 'Sem balança 14 dias', detalhe: 'cintura quinzenal. balança opcional a partir da semana 3.' }
]

const refeicoes = {
  pequenoAlmoco: ['Ovos mexidos + abacate + folhas verdes', 'Omelete com espinafres e queijo', 'Iogurte grego natural + nozes + canela', 'Salmão fumado + ovo cozido + tomate'],
  almoco: ['Frango grelhado + brócolos + azeite', 'Peixe grelhado + courgette + salada', 'Carne picada + couve refogada', 'Atum + ovo cozido + alface + maionese caseira'],
  jantar: ['Sopa de legumes (sem batata/cenoura) + ovo cozido', 'Sardinhas + salada de tomate', 'Frango assado + abóbora courgete', 'Omelete + salada verde'],
  snacks: ['Frutos secos (mão fechada)', 'Queijo + azeitonas', 'Ovo cozido', 'BPC à tarde se precisar'],
  evitar: ['Pão, arroz, massa, batata', 'Açúcar, doces, mel', 'Fruta (excepto frutos vermelhos a partir da semana 4)', 'Bebidas com açúcar, sumos', 'Álcool (caderno antes do copo)'],
  refeed: ['Sábado à noite: 1 chávena batata-doce ou arroz integral', 'Acompanhar com proteína + folhas']
}

const compras = {
  proteinas: ['Ovos (24)', 'Frango (1,5kg)', 'Peixe / atum em lata', 'Carne picada', 'Sardinhas em lata'],
  vegetais: ['Folhas verdes (alface, espinafres)', 'Brócolos, couve-flor', 'Courgette, abóbora', 'Tomate, pepino', 'Couve, cebola, alho'],
  gorduras: ['Azeite extra-virgem', 'Abacate (4)', 'Frutos secos (amêndoa, noz)', 'Azeitonas', 'Manteiga'],
  outros: ['Queijo (feta, parmesão)', 'Iogurte grego natural', 'Sal grosso (eletrólitos)', 'Magnésio bisglicinato 400mg', 'Café'],
  fimSemana: ['Batata-doce ou arroz integral (refeed)', 'Frutos vermelhos (a partir semana 4)']
}

// ----- HTML BUILDER -----

const cover = `
  <div class="page cover">
    <div class="titulo">RESET</div>
    <div class="sub">Caderno de 60 dias · Sete Ecos</div>
    <div class="periodo">11 maio — 9 julho · 2026</div>
    <div class="nome">para Vivianne</div>
    <div class="footer-page">não estás a começar — estás a regressar</div>
  </div>
`

const ancorasPagina = `
  <div class="page">
    <h1 style="margin-bottom: 4pt;">As 7 Âncoras</h1>
    <p class="small olive" style="margin-bottom: 18pt;">sustentam tudo. cumpre estas, o resto vem.</p>
    ${ancoras.map(a => `
      <div class="ancora">
        <div class="ancora-num">${a.num}</div>
        <div class="ancora-text">
          <strong>${a.titulo}</strong><br>
          <span class="small light">${a.detalhe}</span>
        </div>
      </div>
    `).join('')}
    <hr>
    <p class="small light center" style="margin-top: 14pt;">cumprir 5 das 7 = dia bom. cumprir 7 = dia perfeito. nenhum dia perfeito é exigido.</p>
    <div class="footer-page">reset · âncoras</div>
  </div>
`

const treinoPagina = `
  <div class="page">
    <h1>Treino</h1>
    <p class="small olive" style="margin-bottom: 18pt;">4x/semana · 30min · halteres + peso corporal · em casa</p>

    ${Object.entries(treinoSemanal).map(([dia, treino]) => `
      <div class="row" style="border-bottom: 1px solid #e8d9b8; padding: 8pt 0; margin: 0;">
        <div style="width: 80pt; font-weight: bold; color: ${treino === 'Descanso total' || treino.startsWith('Descanso') ? '#7A8450' : '#C9A961'};">${dia}</div>
        <div class="col" style="font-size: 10pt;">${treino}</div>
      </div>
    `).join('')}

    <h3 style="margin-top: 20pt;">Regras</h3>
    <ul class="small">
      <li>Treino antes do PA (jejum curto, queima gordura)</li>
      <li>30min máximo nas primeiras 4 semanas</li>
      <li>Cargas conservadoras nas primeiras 2 semanas</li>
      <li>Sem corrida até semana 4</li>
      <li>Movimento como descompressão — substitui o álcool nesse papel</li>
      <li>Suficiente é melhor que ótimo</li>
    </ul>
    <div class="footer-page">reset · treino</div>
  </div>
`

const refeicoesPagina = `
  <div class="page">
    <h1>Comer</h1>
    <p class="small olive" style="margin-bottom: 14pt;">keto cíclico · janela 9h–19h · proteína primeiro</p>

    <div class="ref-grid">
      <div class="ref-card">
        <h4>Pequeno-almoço</h4>
        <ul>${refeicoes.pequenoAlmoco.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>
      <div class="ref-card">
        <h4>Almoço</h4>
        <ul>${refeicoes.almoco.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>
      <div class="ref-card">
        <h4>Jantar</h4>
        <ul>${refeicoes.jantar.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>
      <div class="ref-card">
        <h4>Snacks (se necessário)</h4>
        <ul>${refeicoes.snacks.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>
    </div>

    <h3 style="margin-top: 16pt; color: #B8704A;">Evitar</h3>
    <ul class="small">${refeicoes.evitar.map(r => `<li>${r}</li>`).join('')}</ul>

    <h3 style="margin-top: 12pt;">Refeed (semana 1+)</h3>
    <ul class="small">${refeicoes.refeed.map(r => `<li>${r}</li>`).join('')}</ul>
    <div class="footer-page">reset · comer</div>
  </div>
`

const comprasPagina = `
  <div class="page">
    <h1>Compras semanais</h1>
    <p class="small olive" style="margin-bottom: 14pt;">faz no sábado de manhã · prepara proteínas no domingo à noite</p>

    <h3>Proteínas</h3>
    ${compras.proteinas.map(c => `<div class="ancora" style="padding: 2pt 0;"><span class="checkbox-sm"></span><span class="small">${c}</span></div>`).join('')}

    <h3>Vegetais</h3>
    ${compras.vegetais.map(c => `<div class="ancora" style="padding: 2pt 0;"><span class="checkbox-sm"></span><span class="small">${c}</span></div>`).join('')}

    <h3>Gorduras boas</h3>
    ${compras.gorduras.map(c => `<div class="ancora" style="padding: 2pt 0;"><span class="checkbox-sm"></span><span class="small">${c}</span></div>`).join('')}

    <h3>Outros</h3>
    ${compras.outros.map(c => `<div class="ancora" style="padding: 2pt 0;"><span class="checkbox-sm"></span><span class="small">${c}</span></div>`).join('')}

    <h3>Fim de semana</h3>
    ${compras.fimSemana.map(c => `<div class="ancora" style="padding: 2pt 0;"><span class="checkbox-sm"></span><span class="small">${c}</span></div>`).join('')}

    <div class="footer-page">reset · compras</div>
  </div>
`

const mantrasPagina = `
  <div class="page">
    <h1>Mantras</h1>
    <p class="small olive" style="margin-bottom: 18pt;">um para cada dia da semana · roda no domingo</p>

    <div class="mantra-list">
      ${mantras.map((m, i) => `
        <div class="mantra-item">
          <span class="mantra-num">${String(i + 1).padStart(2, '0')}</span>${m}
        </div>
      `).join('')}
    </div>
    <div class="footer-page">reset · mantras</div>
  </div>
`

const sinaisPagina = `
  <div class="page">
    <h1>Sinais de progresso</h1>
    <p class="small olive" style="margin-bottom: 18pt;">a balança não é a única medida. provavelmente nem é a melhor.</p>

    <ul style="font-size: 11pt; line-height: 2;">
      <li>Conseguir olhar-te ao espelho sem desviar</li>
      <li>Roupa que está agora a magoar começar a servir</li>
      <li>Vontade de álcool a baixar sem esforço</li>
      <li>Acordar antes da Cris, voluntariamente</li>
      <li>Pensamento mais limpo</li>
      <li>Cintura a descer (medir quinzenal)</li>
      <li>Energia 4-5 mais dias do que 1-2</li>
    </ul>

    <hr style="margin: 24pt 0;">

    <h3>Se falhares um dia</h3>
    <p class="small">não compenses. não jejues mais no dia seguinte. não treines em dobro. retoma exactamente onde estás. um dia mau não estraga 60 dias bons. uma semana de auto-flagelação sim.</p>

    <h3 style="margin-top: 16pt;">Se falhares uma semana</h3>
    <p class="small">não atires o caderno fora. abre numa página em branco e escreve: "estou aqui." é tudo o que é preciso para continuar.</p>

    <div class="footer-page">reset · progresso</div>
  </div>
`

function paginaDia(d) {
  return `
  <div class="page">
    <div class="day-header">
      <div class="day-num">Dia ${String(d.num).padStart(2, '0')}</div>
      <div class="day-meta">
        <div class="day-data">${d.dia} ${d.mes}</div>
        <div class="day-dow">${d.diaSemana}</div>
      </div>
    </div>

    <div class="day-mantra">"${d.mantra}"</div>

    <div class="treino-box">
      <span class="label">treino do dia · </span>${d.treino}
    </div>

    <h3>Âncoras</h3>
    <div class="ancoras-grid">
      <div class="ancora"><span class="checkbox"></span><span class="ancora-text">Ecrã off às 21h <span class="small light">· cama 22h30</span></span></div>
      <div class="ancora"><span class="checkbox"></span><span class="ancora-text">PA com proteína + gordura na 1ª hora</span></div>
      <div class="ancora"><span class="checkbox"></span><span class="ancora-text">Janela 9h–19h <span class="small light">· jejum 14h</span></span></div>
      <div class="ancora"><span class="checkbox"></span><span class="ancora-text">Carbos zero <span class="small light">${d.diaSemana === 'Sábado' ? '· refeed à noite OK' : ''}</span></span></div>
      <div class="ancora"><span class="checkbox"></span><span class="ancora-text">Eletrólitos <span class="small light">· sal manhã + magnésio noite</span></span></div>
      <div class="ancora"><span class="checkbox"></span><span class="ancora-text">Treino feito <span class="small light">· ${d.treino.split('·')[0].trim()}</span></span></div>
      <div class="ancora"><span class="checkbox"></span><span class="ancora-text">Caderno antes do copo <span class="small light">· se aplicável</span></span></div>
    </div>

    <div class="row">
      <div class="col">
        <span class="field-label">sono (h)</span>
        <div class="field-line"></div>
      </div>
      <div class="col">
        <span class="field-label">caminhada (min)</span>
        <div class="field-line"></div>
      </div>
      <div class="col">
        <span class="field-label">energia 1-5</span>
        <div class="field-line"></div>
      </div>
      <div class="col">
        <span class="field-label">humor 1-5</span>
        <div class="field-line"></div>
      </div>
    </div>

    <div class="alcool-box">
      <span class="label">caderno antes do copo · </span>
      <div style="margin-top: 4pt;"><span class="small light">hora:</span> <span class="line" style="min-width: 40pt;"></span> &nbsp; <span class="small light">unidades:</span> <span class="line" style="min-width: 30pt;"></span></div>
      <div style="margin-top: 4pt;"><span class="small light">emoção / gatilho:</span></div>
      <div class="field-line" style="margin-top: 2pt;"></div>
    </div>

    ${d.medidas ? `<div class="medidas-banner">★ Hoje: medir cintura · página de medidas</div>` : ''}

    <div class="notas-box">
      <span class="field-label">notas</span>
      <div class="field-line"></div>
      <div class="field-line"></div>
      <div class="field-line"></div>
    </div>

    <div class="footer-page">dia ${d.num} de 60 · ${d.dia} ${d.mesCurto}</div>
  </div>
  `
}

function paginaMedidas(num, semana, dia) {
  return `
  <div class="page">
    <h1>Medidas · Semana ${semana}</h1>
    <p class="small olive" style="margin-bottom: 18pt;">${dia} · sem julgamento · só dados</p>

    <div class="medida-row">
      <div class="label">Cintura</div>
      <div class="value"></div>
      <div class="unit">cm</div>
    </div>
    <div class="medida-row">
      <div class="label">Ancas</div>
      <div class="value"></div>
      <div class="unit">cm</div>
    </div>
    <div class="medida-row">
      <div class="label">Coxa</div>
      <div class="value"></div>
      <div class="unit">cm</div>
    </div>
    <div class="medida-row">
      <div class="label">Braço</div>
      <div class="value"></div>
      <div class="unit">cm</div>
    </div>
    <div class="medida-row">
      <div class="label">Peso <span class="small light">(opcional)</span></div>
      <div class="value"></div>
      <div class="unit">kg</div>
    </div>

    <hr style="margin: 22pt 0;">

    <h3>Foto</h3>
    <p class="small light">tira frente / lado / costas no telemóvel · mesma hora · mesma luz · roupa interior</p>
    <div class="ancora" style="margin-top: 8pt;"><span class="checkbox-sm"></span><span class="small">frente</span></div>
    <div class="ancora"><span class="checkbox-sm"></span><span class="small">lado</span></div>
    <div class="ancora"><span class="checkbox-sm"></span><span class="small">costas</span></div>

    <hr style="margin: 22pt 0;">

    <h3>Como te sentes hoje</h3>
    <div class="field-line"></div>
    <div class="field-line"></div>
    <div class="field-line"></div>
    <div class="field-line"></div>

    <h3 style="margin-top: 16pt;">O que mudou desde a última medição</h3>
    <div class="field-line"></div>
    <div class="field-line"></div>
    <div class="field-line"></div>

    <div class="footer-page">medidas · semana ${semana}</div>
  </div>
  `
}

const fimPagina = `
  <div class="page">
    <h1>Dia 61</h1>
    <p class="small olive" style="margin-bottom: 24pt;">10 julho 2026 · o dia depois</p>

    <h3>O que aprendi sobre mim</h3>
    <div class="field-line"></div>
    <div class="field-line"></div>
    <div class="field-line"></div>
    <div class="field-line"></div>
    <div class="field-line"></div>

    <h3 style="margin-top: 20pt;">O que vou manter</h3>
    <div class="field-line"></div>
    <div class="field-line"></div>
    <div class="field-line"></div>

    <h3 style="margin-top: 20pt;">O que vou largar</h3>
    <div class="field-line"></div>
    <div class="field-line"></div>
    <div class="field-line"></div>

    <h3 style="margin-top: 20pt;">Próximos 60 dias</h3>
    <div class="field-line"></div>
    <div class="field-line"></div>
    <div class="field-line"></div>

    <hr style="margin: 30pt 0;">

    <p class="center" style="font-style: italic; color: #B8704A;">"chegaste aqui sem app. sem coach. sem balança. com um caderno e os teus dias."</p>

    <div class="footer-page">reset · fim da fase 1</div>
  </div>
`

const html = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset · Caderno de 60 dias</title>
<style>${css}</style>
</head>
<body>
  ${cover}
  ${ancorasPagina}
  ${treinoPagina}
  ${refeicoesPagina}
  ${comprasPagina}
  ${mantrasPagina}
  ${sinaisPagina}

  ${dias.slice(0, 14).map(paginaDia).join('')}
  ${paginaMedidas(1, 2, '24 maio')}
  ${dias.slice(14, 28).map(paginaDia).join('')}
  ${paginaMedidas(2, 4, '7 junho')}
  ${dias.slice(28, 42).map(paginaDia).join('')}
  ${paginaMedidas(3, 6, '21 junho')}
  ${dias.slice(42, 56).map(paginaDia).join('')}
  ${paginaMedidas(4, 8, '5 julho')}
  ${dias.slice(56, 60).map(paginaDia).join('')}

  ${fimPagina}
</body>
</html>`

const outPath = join(ROOT, 'public', 'reset-caderno.html')
writeFileSync(outPath, html, 'utf8')

const stats = {
  totalPages: 7 + 60 + 4 + 1, // ref + dias + medidas + fim
  fileSizeKb: Math.round(Buffer.byteLength(html, 'utf8') / 1024)
}
console.log(`✓ Caderno gerado: ${outPath}`)
console.log(`  ${stats.totalPages} páginas · ${stats.fileSizeKb} KB`)
