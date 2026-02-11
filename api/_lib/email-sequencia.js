/**
 * API Endpoint: Sequencia Automatica de Emails (Lead Nurturing)
 *
 * Envia emails automaticos para leads da waitlist baseado nos dias desde registo.
 * Deve ser chamado pelo cron diario (tarefas-agendadas.js) ou em separado.
 *
 * Sequencia:
 *   Dia 0  - Boas-vindas + apresentacao Sete Ecos
 *   Dia 3  - Convite para Lumina (gratuito)
 *   Dia 7  - Conteudo de valor sobre nutricao
 *   Dia 14 - Convite para Vitalis
 *   Dia 21 - Testemunho + prova social
 *   Dia 30 - Oferta final / urgencia
 */

import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Sete Ecos <noreply@seteecos.com>';
const BASE_URL = 'https://app.seteecos.com';

const SEQUENCIA = [
  {
    dia: 0,
    assunto: 'Bem-vinda ao Sete Ecos!',
    template: (nome) => `
      <div style="font-family: 'Quicksand', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-family: 'Cormorant Garamond', serif; color: #4A4035; font-size: 28px;">Bem-vinda, ${nome}!</h1>
        </div>
        <p style="color: #6B5C4C; line-height: 1.8;">Obrigada por te juntares ao Sete Ecos.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">O Sete Ecos e um ecossistema de transformacao feminina - sete caminhos que se complementam para te guiar numa jornada de autodescoberta, equilibrio e plenitude.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">Nos proximos dias, vou partilhar contigo ferramentas que podem mudar a tua relacao contigo mesma.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">A comecar pelo <strong>Lumina</strong> - um diagnostico gratuito que revela padroes sobre a tua energia, emocao e corpo.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/lumina?utm_source=email&utm_medium=sequencia&utm_campaign=dia0" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6B5B95, #9B59B6); color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Experimentar Lumina (Gratuito)</a>
        </div>
        <p style="color: #6B5C4C; font-size: 14px; text-align: center; margin-top: 30px;">Com carinho,<br><strong>Vivianne Saraiva</strong><br>Criadora do Sete Ecos</p>
      </div>`
  },
  {
    dia: 3,
    assunto: 'Ja experimentaste o Lumina?',
    template: (nome) => `
      <div style="font-family: 'Quicksand', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Cormorant Garamond', serif; color: #4A4035; font-size: 24px;">${nome}, 2 minutos podem mudar o teu dia.</h1>
        <p style="color: #6B5C4C; line-height: 1.8;">O <strong>Lumina</strong> e um ritual diario de auto-observacao. 7 perguntas simples que revelam padroes sobre como te sentes - corpo, mente e emocao.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">Mulheres que usam o Lumina reportam:</p>
        <ul style="color: #6B5C4C; line-height: 2;">
          <li>Mais consciencia sobre os seus padroes emocionais</li>
          <li>Melhor capacidade de prever dias dificeis</li>
          <li>Correlacao entre ciclo menstrual e estados emocionais</li>
        </ul>
        <p style="color: #6B5C4C; line-height: 1.8;">E <strong>completamente gratuito</strong>. Demora menos de 2 minutos.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/lumina?utm_source=email&utm_medium=sequencia&utm_campaign=dia3" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6B5B95, #9B59B6); color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Fazer o Meu Diagnostico</a>
        </div>
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">Vivianne</p>
      </div>`
  },
  {
    dia: 7,
    assunto: '3 sinais de que o teu corpo precisa de atencao',
    template: (nome) => `
      <div style="font-family: 'Quicksand', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Cormorant Garamond', serif; color: #4A4035; font-size: 24px;">${nome}, o teu corpo fala. Estas a ouvir?</h1>
        <p style="color: #6B5C4C; line-height: 1.8;">Ha 3 sinais que muitas mulheres ignoram:</p>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #7C8B6F;">
          <p style="color: #4A4035; margin: 0 0 12px;"><strong>1. Cansaco cronico</strong> - Se dormes e acordas cansada, pode ser o que comes (ou nao comes).</p>
          <p style="color: #4A4035; margin: 0 0 12px;"><strong>2. Comer por emocao</strong> - Se comes quando estas triste, ansiosa ou aborrecida, o problema nao e fome.</p>
          <p style="color: #4A4035; margin: 0;"><strong>3. Efeito ioio</strong> - Se perdes peso e ganhas de volta, as dietas restritivas estao a sabotar o teu metabolismo.</p>
        </div>
        <p style="color: #6B5C4C; line-height: 1.8;">Se te identificas com pelo menos 1 destes sinais, o <strong>VITALIS</strong> foi criado exactamente para ti.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">E o unico programa em Mocambique que combina nutricao cientifica (Precision Nutrition) com apoio emocional (Espaco de Retorno).</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/vitalis?utm_source=email&utm_medium=sequencia&utm_campaign=dia7" style="display: inline-block; padding: 14px 32px; background: #7C8B6F; color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Conhecer o VITALIS</a>
        </div>
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">Vivianne</p>
      </div>`
  },
  {
    dia: 14,
    assunto: 'O VITALIS esta a espera de ti',
    template: (nome) => `
      <div style="font-family: 'Quicksand', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Cormorant Garamond', serif; color: #4A4035; font-size: 24px;">${nome}, imagina isto:</h1>
        <p style="color: #6B5C4C; line-height: 1.8;">Daqui a 3 meses, acordas com mais energia. A roupa cabe melhor. Comes sem culpa porque sabes o que o teu corpo precisa.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">Nao e fantasia. E o que acontece quando tens o metodo certo + acompanhamento real.</p>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="color: #4A4035; font-weight: bold; margin: 0 0 10px;">O que inclui o VITALIS:</p>
          <p style="color: #6B5C4C; margin: 4px 0;">✅ Plano alimentar personalizado</p>
          <p style="color: #6B5C4C; margin: 4px 0;">✅ Receitas com ingredientes locais</p>
          <p style="color: #6B5C4C; margin: 4px 0;">✅ Coach IA disponivel 24h</p>
          <p style="color: #6B5C4C; margin: 4px 0;">✅ Espaco de Retorno (apoio emocional unico)</p>
          <p style="color: #6B5C4C; margin: 4px 0;">✅ Dashboard com progresso e conquistas</p>
          <p style="color: #6B5C4C; margin: 4px 0;">✅ 7 dias de garantia total</p>
        </div>
        <p style="color: #7C8B6F; font-weight: bold; text-align: center; font-size: 18px;">Desde 2.500 MT/mes</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${BASE_URL}/vitalis?utm_source=email&utm_medium=sequencia&utm_campaign=dia14" style="display: inline-block; padding: 14px 32px; background: #7C8B6F; color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Comecar a Minha Transformacao</a>
        </div>
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">Vivianne</p>
      </div>`
  },
  {
    dia: 21,
    assunto: '"Perdi 8kg sem passar fome" - historia real',
    template: (nome) => `
      <div style="font-family: 'Quicksand', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Cormorant Garamond', serif; color: #4A4035; font-size: 24px;">${nome}, isto e possivel para ti tambem.</h1>
        <div style="background: white; padding: 24px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #7C8B6F;">
          <p style="color: #4A4035; font-style: italic; font-size: 16px; line-height: 1.6;">"Finalmente um metodo que nao me faz sentir em dieta. Perdi 8kg em 3 meses e aprendi a comer sem culpa. O Espaco de Retorno mudou tudo - percebi que comia por ansiedade, nao por fome."</p>
          <p style="color: #7C8B6F; font-weight: bold; margin-top: 12px;">- M.J., -8kg em 3 meses</p>
        </div>
        <div style="background: white; padding: 24px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #7C8B6F;">
          <p style="color: #4A4035; font-style: italic; font-size: 16px; line-height: 1.6;">"A app e tao facil de usar. Os graficos mostram exactamente o meu progresso e isso motiva imenso."</p>
          <p style="color: #7C8B6F; font-weight: bold; margin-top: 12px;">- A.B., -12kg em 6 meses</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/vitalis?utm_source=email&utm_medium=sequencia&utm_campaign=dia21" style="display: inline-block; padding: 14px 32px; background: #7C8B6F; color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Quero o Mesmo Resultado</a>
        </div>
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">Vivianne</p>
      </div>`
  },
  {
    dia: 30,
    assunto: 'Ultima oportunidade - a tua transformacao espera',
    template: (nome) => `
      <div style="font-family: 'Quicksand', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Cormorant Garamond', serif; color: #4A4035; font-size: 24px;">${nome}, ja passou um mes.</h1>
        <p style="color: #6B5C4C; line-height: 1.8;">Ha 30 dias juntaste-te a lista de espera do Sete Ecos. Nesse tempo, mulheres que comecaram o VITALIS ja:</p>
        <ul style="color: #6B5C4C; line-height: 2;">
          <li>Perderam 2-4kg na primeira semana</li>
          <li>Aprenderam a medir porcoes sem balanca</li>
          <li>Descobriram o Espaco de Retorno para momentos dificeis</li>
          <li>Construiram habitos que duram</li>
        </ul>
        <p style="color: #6B5C4C; line-height: 1.8;">A unica diferenca entre elas e tu? <strong>Elas comecaram.</strong></p>
        <p style="color: #6B5C4C; line-height: 1.8;">E lembra-te: tens <strong>7 dias de garantia</strong>. Se nao gostares, reembolso total.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/vitalis?utm_source=email&utm_medium=sequencia&utm_campaign=dia30" style="display: inline-block; padding: 14px 32px; background: #7C8B6F; color: white; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px;">Comecar Agora - Sem Risco</a>
        </div>
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">Com carinho,<br><strong>Vivianne</strong></p>
      </div>`
  }
];

export default async function handler(req, res) {
  // Auth centralizada no api/cron.js dispatcher

  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Configuracao em falta' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const resultados = { enviados: 0, erros: [] };

  try {
    // Buscar todos da waitlist
    const { data: waitlist, error: wlError } = await supabase
      .from('waitlist')
      .select('id, nome, email, created_at');

    if (wlError) {
      // Tabela waitlist pode nao existir ainda
      console.warn('Waitlist query error:', wlError.message);
      return res.status(200).json({ message: 'Tabela waitlist nao disponivel: ' + wlError.message, ...resultados });
    }
    if (!waitlist || waitlist.length === 0) {
      return res.status(200).json({ message: 'Waitlist vazia', ...resultados });
    }

    const hoje = new Date();

    for (const lead of waitlist) {
      const diasDesdeRegisto = Math.floor(
        (hoje - new Date(lead.created_at)) / (1000 * 60 * 60 * 24)
      );

      // Encontrar email da sequencia para este dia
      const emailTemplate = SEQUENCIA.find(s => s.dia === diasDesdeRegisto);
      if (!emailTemplate) continue;

      // Verificar se ja foi enviado (evitar duplicados)
      try {
        const { data: jaEnviado } = await supabase
          .from('waitlist_email_log')
          .select('id')
          .eq('email', lead.email)
          .eq('sequencia_dia', emailTemplate.dia)
          .maybeSingle();
        if (jaEnviado) continue;
      } catch {
        // Tabela email_log pode nao existir - continuar sem de-duplicacao
      }

      // Enviar email
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: lead.email,
            subject: emailTemplate.assunto,
            html: emailTemplate.template(lead.nome || 'amiga'),
          }),
        });

        if (response.ok) {
          // Registar envio
          await supabase.from('waitlist_email_log').insert({
            email: lead.email,
            waitlist_id: lead.id,
            sequencia_dia: emailTemplate.dia,
            assunto: emailTemplate.assunto,
          });
          resultados.enviados++;
        } else {
          const err = await response.text();
          resultados.erros.push({ email: lead.email, dia: emailTemplate.dia, erro: err });
        }
      } catch (emailErr) {
        resultados.erros.push({ email: lead.email, dia: emailTemplate.dia, erro: emailErr.message });
      }
    }

    return res.status(200).json({
      message: `Sequencia processada: ${resultados.enviados} emails enviados`,
      ...resultados
    });
  } catch (error) {
    console.error('Erro na sequencia de emails:', error);
    return res.status(500).json({ error: error.message, ...resultados });
  }
}
