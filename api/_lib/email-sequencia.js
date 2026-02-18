/**
 * API Endpoint: Sequência Automática de Emails (Lead Nurturing + Marketing Intenso)
 *
 * Envia emails automáticos para leads da waitlist baseado nos dias desde registo.
 * Inclui código VEMVITALIS20 (20% desconto) e redireciona ao WhatsApp Business.
 *
 * Sequência:
 *   Dia 0  - Boas-vindas + apresentação Sete Ecos + WhatsApp
 *   Dia 3  - Convite para Lumina (gratuito) + curiosidade
 *   Dia 7  - Conteúdo de valor (3 sinais) + provocação
 *   Dia 10 - CURIOSIDADE INSANA (novo!) - "O segredo que ninguém te conta"
 *   Dia 14 - Convite para Vitalis + código VEMVITALIS20
 *   Dia 21 - Testemunho + prova social + código
 *   Dia 30 - Oferta final / urgência + código + WhatsApp direto
 */

import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Sete Ecos <noreply@seteecos.com>';
const BASE_URL = 'https://app.seteecos.com';
const WHATSAPP_LINK = 'https://wa.me/258851006473?text=Ola%20Vivianne%2C%20vim%20pelo%20email%20do%20Sete%20Ecos';
const WHATSAPP_CHATBOT = 'https://wa.me/258851006473';
const CODIGO_PROMO = 'VEMVITALIS20';

// Rodapé padrão com WhatsApp
const RODAPE_WHATSAPP = `
  <div style="background: #25D366; border-radius: 12px; padding: 16px; margin: 30px 0; text-align: center;">
    <p style="color: white; font-weight: bold; margin: 0 0 8px; font-size: 15px;">Tens dúvidas? Fala comigo no WhatsApp!</p>
    <a href="${WHATSAPP_CHATBOT}" style="display: inline-block; padding: 10px 24px; background: white; color: #25D366; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 14px;">Abrir WhatsApp</a>
    <p style="color: rgba(255,255,255,0.8); font-size: 11px; margin: 8px 0 0;">Respondo em menos de 1 hora | Seg-Sex 9h-18h</p>
  </div>`;

// Badge de desconto
const BADGE_DESCONTO = `
  <div style="background: linear-gradient(135deg, #FF6B6B, #EE5A24); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
    <p style="color: white; font-size: 12px; margin: 0; letter-spacing: 2px;">CÓDIGO EXCLUSIVO</p>
    <p style="color: white; font-size: 32px; font-weight: bold; margin: 8px 0; letter-spacing: 4px;">${CODIGO_PROMO}</p>
    <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">20% de desconto no VITALIS</p>
    <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 4px 0 0;">Usa na app ou envia por WhatsApp</p>
  </div>`;

const SEQUENCIA = [
  {
    dia: 0,
    assunto: 'Bem-vindo/a ao Sete Ecos!',
    template: (nome) => `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-family: 'Playfair Display', serif; color: #4A4035; font-size: 28px;">Bem-vindo/a, ${nome}!</h1>
        </div>
        <p style="color: #6B5C4C; line-height: 1.8;">Obrigado/a por te juntares ao Sete Ecos.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">O Sete Ecos é um ecossistema de transformação feminina - sete caminhos que se complementam para te guiar numa jornada de autodescoberta, equilíbrio e plenitude.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">Nos próximos dias, vou partilhar contigo ferramentas que podem mudar a tua relação contigo mesma.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">A começar pelo <strong>Lumina</strong> - um diagnóstico gratuito que revela padrões sobre a tua energia, emoção e corpo.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/lumina?utm_source=email&utm_medium=sequencia&utm_campaign=dia0" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6B5B95, #9B59B6); color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Experimentar Lumina (Gratuito)</a>
        </div>
        ${RODAPE_WHATSAPP}
        <p style="color: #6B5C4C; font-size: 14px; text-align: center; margin-top: 30px;">Com carinho,<br><strong>Vivianne Saraiva</strong><br>Criadora do Sete Ecos</p>
      </div>`
  },
  {
    dia: 3,
    assunto: 'Já experimentaste o Lumina?',
    template: (nome) => `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #4A4035; font-size: 24px;">${nome}, 2 minutos podem mudar o teu dia.</h1>
        <p style="color: #6B5C4C; line-height: 1.8;">O <strong>Lumina</strong> é um ritual diário de auto-observação. 7 perguntas simples que revelam padrões sobre como te sentes - corpo, mente e emoção.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">Mulheres que usam o Lumina reportam:</p>
        <ul style="color: #6B5C4C; line-height: 2;">
          <li>Mais consciência sobre os seus padrões emocionais</li>
          <li>Melhor capacidade de prever dias difíceis</li>
          <li>Correlação entre ciclo menstrual e estados emocionais</li>
        </ul>
        <p style="color: #6B5C4C; line-height: 1.8;">É <strong>completamente gratuito</strong>. Demora menos de 2 minutos.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/lumina?utm_source=email&utm_medium=sequencia&utm_campaign=dia3" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6B5B95, #9B59B6); color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Fazer o Meu Diagnóstico</a>
        </div>
        ${RODAPE_WHATSAPP}
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">Vivianne</p>
      </div>`
  },
  {
    dia: 7,
    assunto: '3 sinais de que o teu corpo precisa de atenção',
    template: (nome) => `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #4A4035; font-size: 24px;">${nome}, o teu corpo fala. Estás a ouvir?</h1>
        <p style="color: #6B5C4C; line-height: 1.8;">Há 3 sinais que muitas mulheres ignoram:</p>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #7C8B6F;">
          <p style="color: #4A4035; margin: 0 0 12px;"><strong>1. Cansaço crónico</strong> - Se dormes e acordas cansada, pode ser o que comes (ou não comes).</p>
          <p style="color: #4A4035; margin: 0 0 12px;"><strong>2. Comer por emoção</strong> - Se comes quando estás triste, ansiosa ou aborrecida, o problema não é fome.</p>
          <p style="color: #4A4035; margin: 0;"><strong>3. Efeito ioiô</strong> - Se perdes peso e ganhas de volta, as dietas restritivas estão a sabotar o teu metabolismo.</p>
        </div>
        <p style="color: #6B5C4C; line-height: 1.8;">Se te identificas com pelo menos 1 destes sinais, o <strong>VITALIS</strong> foi criado exatamente para ti.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">É o único programa no mundo que combina nutrição científica com apoio emocional.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/vitalis?utm_source=email&utm_medium=sequencia&utm_campaign=dia7" style="display: inline-block; padding: 14px 32px; background: #7C8B6F; color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Conhecer o VITALIS</a>
        </div>
        ${RODAPE_WHATSAPP}
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">Vivianne</p>
      </div>`
  },
  {
    dia: 10,
    assunto: 'O segredo que ninguém te conta sobre perder peso',
    template: (nome) => `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #4A4035; font-size: 24px;">${nome}, preciso de te contar uma coisa.</h1>
        <p style="color: #6B5C4C; line-height: 1.8;">Tenho trabalhado com mulheres moçambicanas há anos. E há um padrão que vejo repetir-se:</p>
        <div style="background: #2C2C2C; color: white; padding: 24px; border-radius: 12px; margin: 20px 0;">
          <p style="font-size: 18px; font-style: italic; line-height: 1.6; margin: 0;">"A maioria das mulheres que me procura não tem um problema de comida. Tem um problema de emoção disfarçado de fome."</p>
        </div>
        <p style="color: #6B5C4C; line-height: 1.8;">Leste isto e sentiste algo? Então preciso de te explicar o que descobri.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">Quando comes por ansiedade, por solidão, por tédio — o teu corpo não precisa de comida. Precisa de <strong>presença</strong>. E nenhuma dieta do mundo resolve isso.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">Foi por isso que criei o <strong>Espaço de Retorno</strong> dentro do VITALIS — um lugar onde podes ir quando sentes vontade de comer por emoção. Sem culpa. Sem julgamento.</p>
        <p style="color: #6B5C4C; line-height: 1.8;"><strong>Isto não existe em mais nenhum programa — em lado nenhum do mundo.</strong></p>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <p style="color: #4A4035; font-size: 16px; margin: 0 0 8px;">Queres saber se isto é para ti?</p>
          <p style="color: #6B5C4C; font-size: 14px; margin: 0;">Envia-me "quero saber mais" no WhatsApp.</p>
          <p style="color: #6B5C4C; font-size: 14px; margin: 0;">Respondo pessoalmente.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${WHATSAPP_LINK}" style="display: inline-block; padding: 14px 32px; background: #25D366; color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Enviar Mensagem no WhatsApp</a>
        </div>
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">Vivianne</p>
      </div>`
  },
  {
    dia: 14,
    assunto: '${nome}, tenho um presente para ti (20% desconto)',
    template: (nome) => `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #4A4035; font-size: 24px;">${nome}, imagina isto:</h1>
        <p style="color: #6B5C4C; line-height: 1.8;">Daqui a 3 meses, acordas com mais energia. A roupa cabe melhor. Comes sem culpa porque sabes o que o teu corpo precisa.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">Não é fantasia. É o que acontece quando tens o método certo + acompanhamento real.</p>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="color: #4A4035; font-weight: bold; margin: 0 0 10px;">O que inclui o VITALIS:</p>
          <p style="color: #6B5C4C; margin: 4px 0;">Plano alimentar personalizado com comida moçambicana</p>
          <p style="color: #6B5C4C; margin: 4px 0;">Receitas com ingredientes que já tens em casa</p>
          <p style="color: #6B5C4C; margin: 4px 0;">Check-in diário em 30 segundos</p>
          <p style="color: #6B5C4C; margin: 4px 0;">Espaço de Retorno (apoio emocional único)</p>
          <p style="color: #6B5C4C; margin: 4px 0;">Dashboard com progresso e conquistas</p>
          <p style="color: #6B5C4C; margin: 4px 0;">Chat direto com a Vivianne</p>
          <p style="color: #6B5C4C; margin: 4px 0;">7 dias de garantia total</p>
        </div>
        ${BADGE_DESCONTO}
        <p style="color: #7C8B6F; font-weight: bold; text-align: center; font-size: 16px;">De <s>2.500 MZN</s> por <strong>2.000 MZN/mês</strong> com o código</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${BASE_URL}/vitalis/pagamento?code=${CODIGO_PROMO}&utm_source=email&utm_medium=sequencia&utm_campaign=dia14" style="display: inline-block; padding: 14px 32px; background: #7C8B6F; color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Começar com 20% Desconto</a>
        </div>
        ${RODAPE_WHATSAPP}
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">Vivianne</p>
      </div>`
  },
  {
    dia: 21,
    assunto: '"Perdi 8kg sem passar fome" - história real',
    template: (nome) => `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #4A4035; font-size: 24px;">${nome}, isto é possível para ti também.</h1>
        <div style="background: white; padding: 24px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #7C8B6F;">
          <p style="color: #4A4035; font-style: italic; font-size: 16px; line-height: 1.6;">"Finalmente um método que não me faz sentir em dieta. Perdi 8kg em 3 meses e aprendi a comer sem culpa. O Espaço de Retorno mudou tudo - percebi que comia por ansiedade, não por fome."</p>
          <p style="color: #7C8B6F; font-weight: bold; margin-top: 12px;">- M.J., Maputo</p>
        </div>
        <div style="background: white; padding: 24px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #7C8B6F;">
          <p style="color: #4A4035; font-style: italic; font-size: 16px; line-height: 1.6;">"A app é tão fácil de usar. Uso a comida que já tenho em casa - xima, matapa, feijão nhemba. Não preciso de comprar nada especial."</p>
          <p style="color: #7C8B6F; font-weight: bold; margin-top: 12px;">- A.B., Beira</p>
        </div>
        <div style="background: #FFF3E0; padding: 16px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <p style="color: #E65100; font-weight: bold; margin: 0 0 4px;">O teu código ainda está ativo!</p>
          <p style="color: #4A4035; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 0;">${CODIGO_PROMO}</p>
          <p style="color: #6B5C4C; font-size: 13px; margin: 4px 0 0;">20% de desconto - usa antes que expire</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/vitalis/pagamento?code=${CODIGO_PROMO}&utm_source=email&utm_medium=sequencia&utm_campaign=dia21" style="display: inline-block; padding: 14px 32px; background: #7C8B6F; color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Quero o Mesmo Resultado</a>
        </div>
        ${RODAPE_WHATSAPP}
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">Vivianne</p>
      </div>`
  },
  {
    dia: 30,
    assunto: 'Última chance: 20% desconto + garantia total',
    template: (nome) => `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #4A4035; font-size: 24px;">${nome}, já passou um mês.</h1>
        <p style="color: #6B5C4C; line-height: 1.8;">Há 30 dias juntaste-te à lista de espera do Sete Ecos. Nesse tempo, mulheres que começaram o VITALIS já:</p>
        <ul style="color: #6B5C4C; line-height: 2;">
          <li>Perderam 2-4kg na primeira semana</li>
          <li>Aprenderam a medir porções sem balança (método da mão)</li>
          <li>Descobriram o Espaço de Retorno para momentos difíceis</li>
          <li>Construíram hábitos que duram - com comida moçambicana</li>
        </ul>
        <p style="color: #6B5C4C; line-height: 1.8;">A única diferença entre elas e tu? <strong>Elas começaram.</strong></p>

        <div style="background: linear-gradient(135deg, #2C2C2C, #1a1a1a); color: white; padding: 24px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <p style="font-size: 12px; letter-spacing: 2px; margin: 0 0 8px; color: #FF6B6B;">ÚLTIMA OPORTUNIDADE</p>
          <p style="font-size: 36px; font-weight: bold; letter-spacing: 4px; margin: 0;">${CODIGO_PROMO}</p>
          <p style="font-size: 18px; margin: 8px 0 0; color: #FFD700;">20% de desconto</p>
          <p style="font-size: 14px; margin: 4px 0 0; color: rgba(255,255,255,0.6);">De 2.500 por 2.000 MZN/mês</p>
        </div>

        <p style="color: #6B5C4C; line-height: 1.8; text-align: center;">Tens <strong>7 dias de garantia</strong>. Se não gostares, reembolso total. Zero risco.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/vitalis/pagamento?code=${CODIGO_PROMO}&utm_source=email&utm_medium=sequencia&utm_campaign=dia30" style="display: inline-block; padding: 16px 36px; background: linear-gradient(135deg, #7C8B6F, #5a6b4f); color: white; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px;">Começar Agora - 20% Off</a>
        </div>

        <div style="background: #25D366; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="color: white; font-weight: bold; margin: 0 0 4px; font-size: 16px;">Preferes falar comigo primeiro?</p>
          <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin: 0 0 12px;">Tiro todas as tuas dúvidas pessoalmente</p>
          <a href="${WHATSAPP_LINK}" style="display: inline-block; padding: 12px 28px; background: white; color: #25D366; border-radius: 20px; text-decoration: none; font-weight: bold;">Falar com a Vivianne no WhatsApp</a>
        </div>

        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">Com carinho,<br><strong>Vivianne</strong></p>
      </div>`
  }
];

export default async function handler(req, res) {
  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Configuração em falta' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const resultados = { enviados: 0, erros: [] };

  try {
    const { data: waitlist, error: wlError } = await supabase
      .from('waitlist')
      .select('id, nome, email, created_at');

    if (wlError) {
      console.warn('Waitlist query error:', wlError.message);
      return res.status(200).json({ message: 'Tabela waitlist não disponível: ' + wlError.message, ...resultados });
    }
    if (!waitlist || waitlist.length === 0) {
      return res.status(200).json({ message: 'Waitlist vazia', ...resultados });
    }

    const hoje = new Date();

    for (const lead of waitlist) {
      const diasDesdeRegisto = Math.floor(
        (hoje - new Date(lead.created_at)) / (1000 * 60 * 60 * 24)
      );

      const emailTemplate = SEQUENCIA.find(s => s.dia === diasDesdeRegisto);
      if (!emailTemplate) continue;

      // Verificar duplicados
      try {
        const { data: jaEnviado } = await supabase
          .from('waitlist_email_log')
          .select('id')
          .eq('email', lead.email)
          .eq('sequencia_dia', emailTemplate.dia)
          .maybeSingle();
        if (jaEnviado) continue;
      } catch {
        // Continuar sem de-duplicação se tabela não existir
      }

      // Enviar email
      try {
        const nome = lead.nome || 'amigo/a';
        // Substituir ${nome} no assunto
        const assunto = emailTemplate.assunto.replace('${nome}', nome);

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: lead.email,
            subject: assunto,
            html: emailTemplate.template(nome),
          }),
        });

        if (response.ok) {
          await supabase.from('waitlist_email_log').insert({
            email: lead.email,
            waitlist_id: lead.id,
            sequencia_dia: emailTemplate.dia,
            assunto: assunto,
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
      message: `Sequência processada: ${resultados.enviados} emails enviados`,
      ...resultados
    });
  } catch (error) {
    console.error('Erro na sequência de emails:', error);
    return res.status(500).json({ error: error.message, ...resultados });
  }
}
