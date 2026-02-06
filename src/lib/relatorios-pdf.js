/**
 * Sistema de Geração de PDFs de Relatórios - Vitalis
 *
 * Usa html2pdf.js para gerar PDFs no cliente
 */
import { g } from '../utils/genero';

// html2pdf loaded dynamically to avoid 600KB+ in the initial chunk
let html2pdfModule = null;
async function getHtml2pdf() {
  if (!html2pdfModule) {
    const mod = await import('html2pdf.js');
    html2pdfModule = mod.default || mod;
  }
  return html2pdfModule;
}

/**
 * Configurações padrão do PDF
 */
const PDF_CONFIG = {
  margin: [10, 10, 10, 10],
  filename: 'vitalis-relatorio.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: {
    scale: 2,
    useCORS: true,
    letterRendering: true
  },
  jsPDF: {
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  }
};

/**
 * Gera HTML do header padrão dos relatórios
 */
function gerarHeader(titulo, subtitulo = '') {
  return `
    <div style="background: linear-gradient(135deg, #7C8B6F 0%, #9CAF88 100%); color: white; padding: 30px; margin-bottom: 20px; border-radius: 0 0 20px 20px;">
      <div style="display: flex; align-items: center; gap: 15px;">
        <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" style="width: 50px; height: 50px; object-fit: contain;">
        <div>
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${titulo}</h1>
          ${subtitulo ? `<p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">${subtitulo}</p>` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Gera HTML do footer padrão
 */
function gerarFooter() {
  return `
    <div style="background: #F5F2ED; padding: 15px; margin-top: 30px; text-align: center; font-size: 11px; color: #6B5C4C;">
      <p style="margin: 0;">Vitalis - Sistema de Adaptação Metabólica</p>
      <p style="margin: 5px 0 0 0; opacity: 0.7;">Gerado automaticamente em ${new Date().toLocaleDateString('pt-PT')}</p>
    </div>
  `;
}

/**
 * Cria uma secção com título e conteúdo
 */
function criarSeccao(titulo, conteudo, cor = '#7C8B6F') {
  return `
    <div style="margin-bottom: 20px;">
      <h2 style="color: ${cor}; font-size: 16px; border-bottom: 2px solid ${cor}; padding-bottom: 8px; margin-bottom: 12px;">
        ${titulo}
      </h2>
      <div style="padding-left: 10px;">
        ${conteudo}
      </div>
    </div>
  `;
}

/**
 * Cria um card de estatística
 */
function criarCard(label, valor, icone = '') {
  return `
    <div style="background: #F5F2ED; padding: 12px 15px; border-radius: 10px; margin-bottom: 8px; display: inline-block; margin-right: 10px;">
      <span style="font-size: 12px; color: #6B5C4C;">${icone} ${label}</span>
      <div style="font-size: 18px; font-weight: bold; color: #4A4035;">${valor}</div>
    </div>
  `;
}

/**
 * Gera relatório mensal em PDF
 */
export async function gerarRelatorioMensal(dados) {
  const { mes, registos, cliente } = dados;

  // Calcular estatísticas
  const totalRegistos = registos.length;
  const diasComAgua = registos.filter(r => (r.agua_litros || 0) >= 2).length;
  const diasComTreino = registos.filter(r => r.exercicio).length;
  const mediaAgua = totalRegistos > 0
    ? (registos.reduce((acc, r) => acc + (r.agua_litros || 0), 0) / totalRegistos).toFixed(1)
    : 0;
  const mediaSono = totalRegistos > 0
    ? (registos.reduce((acc, r) => acc + (r.horas_sono || 0), 0) / totalRegistos).toFixed(1)
    : 0;

  const html = `
    <div style="font-family: 'Quicksand', sans-serif; max-width: 800px; margin: 0 auto;">
      ${gerarHeader('Relatório Mensal', mes)}

      <div style="padding: 0 20px;">
        ${criarSeccao('Resumo do Mês', `
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${criarCard('Registos', `${totalRegistos} dias`, '📝')}
            ${criarCard('Meta de Água', `${diasComAgua} dias`, '💧')}
            ${criarCard('Dias de Treino', `${diasComTreino}`, '🏋️')}
            ${criarCard('Média Água/dia', `${mediaAgua}L`, '💧')}
            ${criarCard('Média Sono', `${mediaSono}h`, '😴')}
          </div>
        `)}

        ${criarSeccao('Consistência', `
          <div style="background: #E8F5E9; padding: 15px; border-radius: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 24px;">${totalRegistos >= 20 ? '🌟' : totalRegistos >= 15 ? '✨' : '💪'}</span>
              <div>
                <p style="margin: 0; font-weight: bold; color: #2E7D32;">
                  ${totalRegistos >= 20 ? 'Excelente!' : totalRegistos >= 15 ? 'Muito Bom!' : 'Bom trabalho!'}
                </p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #388E3C;">
                  Fizeste check-in em ${totalRegistos} dos 30 dias deste mês.
                </p>
              </div>
            </div>
          </div>
        `)}

        ${criarSeccao('Padrões Observados', `
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #E8E2D9;">
              💧 <strong>Hidratação:</strong> ${diasComAgua > 20 ? 'Consistente e acima da meta na maioria dos dias' : diasComAgua > 10 ? 'Boa na maior parte do tempo' : 'Pode melhorar'}
            </li>
            <li style="padding: 8px 0; border-bottom: 1px solid #E8E2D9;">
              🏋️ <strong>Exercício:</strong> ${diasComTreino > 12 ? 'Regularidade excelente' : diasComTreino > 6 ? 'Frequência moderada' : 'Oportunidade de melhorar'}
            </li>
            <li style="padding: 8px 0;">
              😴 <strong>Sono:</strong> ${parseFloat(mediaSono) >= 7 ? 'Dentro do recomendado' : parseFloat(mediaSono) >= 6 ? 'Ligeiramente abaixo do ideal' : 'Atenção necessária'}
            </li>
          </ul>
        `)}

        ${criarSeccao('Próximo Mês', `
          <div style="background: #FFF8E1; padding: 15px; border-radius: 10px; border-left: 4px solid #F9A825;">
            <p style="margin: 0; font-size: 14px; color: #5D4037;">
              <strong>Sugestão:</strong> ${
                diasComAgua < 15
                  ? 'Foca em beber pelo menos 2L de água por dia.'
                  : diasComTreino < 8
                    ? 'Tenta adicionar mais um dia de exercício por semana.'
                    : 'Mantém este ritmo excelente!'
              }
            </p>
          </div>
        `)}
      </div>

      ${gerarFooter()}
    </div>
  `;

  // Criar elemento temporário
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  // Gerar PDF
  const opt = {
    ...PDF_CONFIG,
    filename: `Vitalis_Relatorio_${mes.replace(/\s/g, '_')}.pdf`
  };

  const html2pdf = await getHtml2pdf();
  await html2pdf().set(opt).from(container).save();

  // Limpar
  document.body.removeChild(container);
}

/**
 * Gera relatório de fim de fase em PDF
 */
export async function gerarRelatorioFase(dados) {
  const { fase, registos, cliente, plano } = dados;

  const totalRegistos = registos.length;
  const duracaoFase = fase.numero === 1 ? '2 semanas' : fase.numero === 2 ? '4 semanas' : '6 semanas';

  const html = `
    <div style="font-family: 'Quicksand', sans-serif; max-width: 800px; margin: 0 auto;">
      ${gerarHeader(`Fase ${fase.numero}: ${fase.nome}`, `Relatório de Conclusão`)}

      <div style="padding: 0 20px;">
        ${criarSeccao('Sobre esta Fase', `
          <div style="background: linear-gradient(135deg, #F5F2ED 0%, #E8E4DC 100%); padding: 20px; border-radius: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #4A4035;">Fase ${fase.numero} - ${fase.nome}</h3>
            <p style="margin: 0; color: #6B5C4C; font-size: 14px;">
              ${getFaseDescricao(fase.numero)}
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #7C8B6F;">
              Duração: ${duracaoFase}
            </p>
          </div>
        `)}

        ${criarSeccao('Estatísticas da Fase', `
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${criarCard('Total de Registos', totalRegistos, '📊')}
            ${criarCard('Consistência', `${Math.round((totalRegistos / (fase.numero === 1 ? 14 : 28)) * 100)}%`, '🎯')}
          </div>
        `)}

        ${criarSeccao('Conquistas Desbloqueadas', `
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 15px; border-radius: 15px; text-align: center; min-width: 100px;">
              <span style="font-size: 30px;">🏆</span>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: white; font-weight: bold;">
                Fase ${fase.numero} Completa!
              </p>
            </div>
          </div>
        `)}

        ${criarSeccao('Próximos Passos', `
          <div style="background: #E3F2FD; padding: 15px; border-radius: 10px; border-left: 4px solid #1976D2;">
            <p style="margin: 0; font-size: 14px; color: #1565C0;">
              ${getProximaFaseInfo(fase.numero)}
            </p>
          </div>
        `)}
      </div>

      ${gerarFooter()}
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  const opt = {
    ...PDF_CONFIG,
    filename: `Vitalis_Fase${fase.numero}_${fase.nome}.pdf`
  };

  const html2pdf = await getHtml2pdf();
  await html2pdf().set(opt).from(container).save();
  document.body.removeChild(container);
}

/**
 * Gera relatório final do programa em PDF
 */
export async function gerarRelatorioFinal(dados) {
  const { cliente, registos, conquistas, plano } = dados;

  const totalRegistos = registos.length;
  const diasPrograma = 84; // ~12 semanas
  const consistencia = Math.round((totalRegistos / diasPrograma) * 100);

  const html = `
    <div style="font-family: 'Quicksand', sans-serif; max-width: 800px; margin: 0 auto;">
      ${gerarHeader('Relatório de Conclusão', 'A tua jornada Vitalis')}

      <div style="padding: 0 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <span style="font-size: 60px;">🎉</span>
          <h2 style="margin: 10px 0; color: #7C8B6F;">Parabéns, ${cliente?.nome || g('Guerreiro', 'Guerreira')}!</h2>
          <p style="color: #6B5C4C;">Completaste o programa Vitalis de 12 semanas.</p>
        </div>

        ${criarSeccao('Resumo da Jornada', `
          <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
            ${criarCard('Dias de Programa', '84', '📅')}
            ${criarCard('Check-ins', totalRegistos, '✅')}
            ${criarCard('Consistência', `${consistencia}%`, '🎯')}
            ${criarCard('Fases Completas', '4', '🏁')}
          </div>
        `)}

        ${criarSeccao('Conquistas Desbloqueadas', `
          <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
            ${(conquistas || []).map(c => `
              <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 15px; border-radius: 15px; text-align: center; min-width: 80px;">
                <span style="font-size: 24px;">${c.emoji || '🏆'}</span>
                <p style="margin: 5px 0 0 0; font-size: 10px; color: white; font-weight: bold;">
                  ${c.nome || 'Conquista'}
                </p>
              </div>
            `).join('')}
          </div>
        `, '#FFB300')}

        ${criarSeccao('Evolução por Fase', `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F5F2ED; border-radius: 10px;">
              <span style="font-size: 20px;">1️⃣</span>
              <div style="flex: 1;">
                <p style="margin: 0; font-weight: bold;">Fase 1: Indução</p>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #6B5C4C;">Adaptação inicial ao sistema</p>
              </div>
              <span style="color: #4CAF50;">✓</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F5F2ED; border-radius: 10px;">
              <span style="font-size: 20px;">2️⃣</span>
              <div style="flex: 1;">
                <p style="margin: 0; font-weight: bold;">Fase 2: Transição</p>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #6B5C4C;">Expansão gradual</p>
              </div>
              <span style="color: #4CAF50;">✓</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F5F2ED; border-radius: 10px;">
              <span style="font-size: 20px;">3️⃣</span>
              <div style="flex: 1;">
                <p style="margin: 0; font-weight: bold;">Fase 3: Recomposição</p>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #6B5C4C;">Optimização metabólica</p>
              </div>
              <span style="color: #4CAF50;">✓</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F5F2ED; border-radius: 10px;">
              <span style="font-size: 20px;">4️⃣</span>
              <div style="flex: 1;">
                <p style="margin: 0; font-weight: bold;">Fase 4: Manutenção</p>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #6B5C4C;">Sustentabilidade a longo prazo</p>
              </div>
              <span style="color: #4CAF50;">✓</span>
            </div>
          </div>
        `)}

        ${criarSeccao('Mensagem Final', `
          <div style="background: linear-gradient(135deg, #7C8B6F 0%, #9CAF88 100%); padding: 25px; border-radius: 15px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 16px; font-style: italic;">
              "O caminho que percorreste é único. Cada dia que registaste, cada refeição consciente,
              cada copo de água – tudo contribuiu para esta transformação. Leva contigo estas
              ferramentas e continua a honrar o teu corpo."
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px;">
              - Vivianne, Coach Vitalis
            </p>
          </div>
        `, '#7C8B6F')}
      </div>

      ${gerarFooter()}
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  const opt = {
    ...PDF_CONFIG,
    filename: `Vitalis_Relatorio_Final_${cliente?.nome || 'Conclusao'}.pdf`
  };

  const html2pdf = await getHtml2pdf();
  await html2pdf().set(opt).from(container).save();
  document.body.removeChild(container);
}

// Funções auxiliares
function getFaseDescricao(numero) {
  const descricoes = {
    1: 'A Fase de Indução é o teu período de adaptação. O corpo começa a ajustar-se ao novo ritmo alimentar, reduzindo inflamação e estabilizando energia.',
    2: 'A Fase de Transição expande gradualmente as opções alimentares enquanto mantém os princípios fundamentais da fase anterior.',
    3: 'A Fase de Recomposição foca na optimização do metabolismo, com ajustes baseados no teu progresso individual.',
    4: 'A Fase de Manutenção estabelece hábitos sustentáveis para o longo prazo, integrando tudo o que aprendeste.'
  };
  return descricoes[numero] || '';
}

function getProximaFaseInfo(numero) {
  const info = {
    1: 'Na próxima fase (Transição), vais expandir gradualmente as tuas opções alimentares. Prepara-te para mais variedade!',
    2: 'A Fase de Recomposição está a chegar! Vamos optimizar o teu metabolismo com ajustes personalizados.',
    3: 'Estás quase a entrar na Manutenção - a fase final onde consolidas todos os hábitos aprendidos.',
    4: 'Completaste todas as fases! Agora tens as ferramentas para manter este estilo de vida para sempre.'
  };
  return info[numero] || '';
}

export default {
  gerarRelatorioMensal,
  gerarRelatorioFase,
  gerarRelatorioFinal
};
