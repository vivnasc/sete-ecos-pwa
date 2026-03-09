/**
 * API Endpoint: Sequência Automática de Emails (Educacional / Autoridade)
 *
 * Envia emails automáticos para leads da waitlist baseado nos dias desde registo.
 * Conteúdo educativo sobre bem-estar, nutrição e autoconsciência.
 * Sem códigos de desconto, sem urgência — foco em valor e autoridade.
 *
 * Sequência:
 *   Dia 0  - Boas-vindas + apresentação Sete Ecos + Lumina
 *   Dia 3  - Convite para Lumina (gratuito)
 *   Dia 7  - Conteúdo educativo: 3 sinais do corpo que ignoramos
 *   Dia 10 - Conteúdo educativo: Fome física vs fome emocional
 *   Dia 14 - Conteúdo educativo: Mitos da nutrição
 *   Dia 21 - Conteúdo educativo: Ciclo menstrual e fome
 *   Dia 30 - Conteúdo educativo: Integrar corpo, emoção e mente
 */

import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Sete Ecos <noreply@seteecos.com>';
const BASE_URL = 'https://app.seteecos.com';
const WHATSAPP_CHATBOT = 'https://wa.me/258851006473';

// Rodapé padrão com WhatsApp
const RODAPE_WHATSAPP = `
  <div style="background: #25D366; border-radius: 12px; padding: 16px; margin: 30px 0; text-align: center;">
    <p style="color: white; font-weight: bold; margin: 0 0 8px; font-size: 15px;">Tens perguntas? Fala comigo no WhatsApp.</p>
    <a href="${WHATSAPP_CHATBOT}" style="display: inline-block; padding: 10px 24px; background: white; color: #25D366; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 14px;">Abrir WhatsApp</a>
    <p style="color: rgba(255,255,255,0.8); font-size: 11px; margin: 8px 0 0;">Respondo em menos de 1 hora | Seg-Sex 9h-18h</p>
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
        <p style="color: #6B5C4C; line-height: 1.8;">O Sete Ecos é um ecossistema de transformação integral — sete caminhos que se complementam para te guiar numa jornada de autodescoberta, equilíbrio e plenitude.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">Nos próximos dias, vou partilhar contigo conhecimento prático sobre corpo, emoção e mente. Coisas que aprendi ao longo de anos de trabalho com pessoas reais.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">A começar pelo <strong>Lumina</strong> — um diagnóstico gratuito que revela padrões sobre a tua energia, emoção e corpo.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/lumina?utm_source=email&utm_medium=sequencia&utm_campaign=dia0" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6B5B95, #9B59B6); color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Experimentar o Lumina (Gratuito)</a>
        </div>
        ${RODAPE_WHATSAPP}
        <p style="color: #6B5C4C; font-size: 14px; text-align: center; margin-top: 30px;">— Vivianne</p>
      </div>`
  },
  {
    dia: 3,
    assunto: 'Já experimentaste o Lumina?',
    template: (nome) => `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #4A4035; font-size: 24px;">${nome}, 2 minutos podem mudar o teu dia.</h1>
        <p style="color: #6B5C4C; line-height: 1.8;">O <strong>Lumina</strong> é um ritual diário de auto-observação. 7 perguntas simples que revelam padrões sobre como te sentes — corpo, mente e emoção.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">Pessoas que usam o Lumina reportam:</p>
        <ul style="color: #6B5C4C; line-height: 2;">
          <li>Mais consciência sobre os seus padrões emocionais</li>
          <li>Melhor capacidade de antecipar dias difíceis</li>
          <li>Ligações entre ciclo hormonal e estados emocionais</li>
        </ul>
        <p style="color: #6B5C4C; line-height: 1.8;">É <strong>completamente gratuito</strong>. Demora menos de 2 minutos.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/lumina?utm_source=email&utm_medium=sequencia&utm_campaign=dia3" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6B5B95, #9B59B6); color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Fazer o Meu Diagnóstico</a>
        </div>
        ${RODAPE_WHATSAPP}
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">— Vivianne</p>
      </div>`
  },
  {
    dia: 7,
    assunto: '3 sinais do corpo que ignoramos',
    template: (nome) => `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #4A4035; font-size: 24px;">${nome}, o teu corpo fala. Estás a ouvir?</h1>
        <p style="color: #6B5C4C; line-height: 1.8;">Há 3 sinais que muitas pessoas ignoram no dia-a-dia — e que dizem muito sobre o que se passa por dentro:</p>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #7C8B6F;">
          <p style="color: #4A4035; margin: 0 0 12px;"><strong>1. Cansaço crónico (cortisol elevado)</strong></p>
          <p style="color: #6B5C4C; margin: 0 0 16px;">Se dormes e acordas sem energia, pode ser sinal de cortisol cronicamente elevado. O stress mantém o corpo em modo de alerta, o que impede a recuperação durante o sono. Não é preguiça — é química.</p>
          <p style="color: #4A4035; margin: 0 0 12px;"><strong>2. Comer por emoção</strong></p>
          <p style="color: #6B5C4C; margin: 0 0 16px;">Quando comes por ansiedade, tristeza ou tédio, o problema raramente é fome. É o cérebro a procurar dopamina rápida. Reconhecer este padrão é o primeiro passo — sem culpa, sem julgamento.</p>
          <p style="color: #4A4035; margin: 0 0 12px;"><strong>3. Ciclo do efeito ioiô</strong></p>
          <p style="color: #6B5C4C; margin: 0;">Perder peso e ganhar de volta é o resultado mais comum de dietas restritivas. O metabolismo adapta-se, baixa o gasto energético, e quando voltas a comer normalmente o corpo armazena mais. Não é falta de disciplina — é biologia.</p>
        </div>
        <p style="color: #6B5C4C; line-height: 1.8;">Se te identificas com algum destes sinais, o Lumina pode ajudar-te a entender melhor o que o teu corpo está a dizer.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/lumina?utm_source=email&utm_medium=sequencia&utm_campaign=dia7" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6B5B95, #9B59B6); color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Experimenta o Lumina</a>
        </div>
        ${RODAPE_WHATSAPP}
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">— Vivianne</p>
      </div>`
  },
  {
    dia: 10,
    assunto: 'Fome física vs fome emocional — como distinguir',
    template: (nome) => `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #4A4035; font-size: 24px;">${nome}, nem toda a fome é igual.</h1>
        <p style="color: #6B5C4C; line-height: 1.8;">Uma das coisas mais transformadoras que aprendi ao trabalhar com pessoas é que a maioria não tem um problema de comida. Tem um problema de emoção disfarçado de fome.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">Aqui fica uma forma simples de distinguir as duas:</p>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #7C8B6F; font-weight: bold;">Fome Física</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #9B59B6; font-weight: bold;">Fome Emocional</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #6B5C4C;">Aparece gradualmente</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #6B5C4C;">Aparece de repente</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #6B5C4C;">Aceitas vários alimentos</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #6B5C4C;">Queres algo específico</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #6B5C4C;">Paras quando estás satisfeito/a</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #6B5C4C;">Comes além da saciedade</td>
            </tr>
            <tr>
              <td style="padding: 10px; color: #6B5C4C;">Sem culpa depois</td>
              <td style="padding: 10px; color: #6B5C4C;">Culpa ou vergonha depois</td>
            </tr>
          </table>
        </div>
        <p style="color: #6B5C4C; line-height: 1.8;">Quando sentires vontade de comer, experimenta parar e perguntar: "Estou com fome no corpo ou na cabeça?" Só essa pergunta já muda muita coisa.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">No Sete Ecos chamamos a isto o <strong>Espaço de Retorno</strong> — um momento de pausa consciente antes de agir. É uma prática, não uma regra. E fica mais fácil com o tempo.</p>
        ${RODAPE_WHATSAPP}
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">— Vivianne</p>
      </div>`
  },
  {
    dia: 14,
    assunto: 'Os mitos da nutrição que te prejudicam',
    template: (nome) => `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #4A4035; font-size: 24px;">${nome}, vamos desmontar 3 mitos.</h1>
        <p style="color: #6B5C4C; line-height: 1.8;">Há ideias sobre nutrição tão repetidas que parecem verdade. Mas muitas fazem mais mal do que bem.</p>

        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #E74C3C;">
          <p style="color: #E74C3C; font-weight: bold; margin: 0 0 8px;">Mito 1: "Para emagrecer, tens de comer menos"</p>
          <p style="color: #6B5C4C; margin: 0;">Reduzir calorias abruptamente faz o metabolismo abrandar. O corpo entra em modo de conservação e gasta menos energia. Resultado: perdes peso no início e depois estagna — ou voltas a ganhar. O que funciona é comer o suficiente dos alimentos certos, não passar fome.</p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #E74C3C;">
          <p style="color: #E74C3C; font-weight: bold; margin: 0 0 8px;">Mito 2: "Hidratos de carbono são o inimigo"</p>
          <p style="color: #6B5C4C; margin: 0;">Xima, arroz, batata-doce — estes alimentos não são o problema. O problema está nas quantidades e na combinação. Os hidratos são a principal fonte de energia do cérebro. Eliminá-los completamente leva a cansaço, irritabilidade e compulsão alimentar.</p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #E74C3C;">
          <p style="color: #E74C3C; font-weight: bold; margin: 0 0 8px;">Mito 3: "Tens de fazer exercício intenso para ver resultados"</p>
          <p style="color: #6B5C4C; margin: 0;">Caminhar 30 minutos por dia tem mais impacto a longo prazo do que treinos intensos que duram 2 semanas. A consistência vence a intensidade, sempre. O melhor exercício é aquele que consegues manter.</p>
        </div>

        <p style="color: #6B5C4C; line-height: 1.8;">Se queres entender melhor como o teu corpo funciona, o <strong>Lumina</strong> ajuda-te a identificar padrões — é gratuito e demora menos de 2 minutos.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/lumina?utm_source=email&utm_medium=sequencia&utm_campaign=dia14" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6B5B95, #9B59B6); color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Experimenta o Lumina</a>
        </div>
        ${RODAPE_WHATSAPP}
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">— Vivianne</p>
      </div>`
  },
  {
    dia: 21,
    assunto: 'Como o ciclo menstrual afecta a fome',
    template: (nome) => `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #4A4035; font-size: 24px;">${nome}, isto explica muita coisa.</h1>
        <p style="color: #6B5C4C; line-height: 1.8;">Se tens ciclo menstrual, provavelmente já reparaste que há dias em que tens mais fome, mais vontade de doces, ou menos energia. Não é falta de disciplina — são hormonas.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">Aqui está o que acontece em cada fase:</p>

        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="color: #4A4035; margin: 0 0 12px;"><strong>Fase folicular (depois da menstruação)</strong></p>
          <p style="color: #6B5C4C; margin: 0 0 16px;">O estrogénio sobe. Tens mais energia, menos fome, mais motivação. É a melhor altura para experimentar coisas novas na alimentação.</p>
          <p style="color: #4A4035; margin: 0 0 12px;"><strong>Ovulação</strong></p>
          <p style="color: #6B5C4C; margin: 0 0 16px;">Pico de energia e disposição. O apetite tende a ser mais estável.</p>
          <p style="color: #4A4035; margin: 0 0 12px;"><strong>Fase lútea (antes da menstruação)</strong></p>
          <p style="color: #6B5C4C; margin: 0 0 16px;">A progesterona sobe. O corpo gasta mais energia (cerca de 100-300 calorias extra por dia). As vontades de doces e hidratos aumentam. É biologia — não fraqueza.</p>
          <p style="color: #4A4035; margin: 0 0 12px;"><strong>Menstruação</strong></p>
          <p style="color: #6B5C4C; margin: 0;">As hormonas estão no ponto mais baixo. O corpo pede descanso e alimentos reconfortantes. Respeitar este momento é parte do processo.</p>
        </div>

        <p style="color: #6B5C4C; line-height: 1.8;">Conhecer o teu ciclo muda a forma como te relacionas com a comida. Em vez de lutar contra o corpo, aprendes a trabalhar com ele.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">O <strong>Lumina</strong> integra o ciclo menstrual no diagnóstico — para que entendas como o teu corpo funciona em cada fase.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/lumina?utm_source=email&utm_medium=sequencia&utm_campaign=dia21" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6B5B95, #9B59B6); color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Descobre mais no Lumina</a>
        </div>
        ${RODAPE_WHATSAPP}
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">— Vivianne</p>
      </div>`
  },
  {
    dia: 30,
    assunto: 'Integrar corpo, emoção e mente',
    template: (nome) => `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #4A4035; font-size: 24px;">${nome}, a peça que falta.</h1>
        <p style="color: #6B5C4C; line-height: 1.8;">Nas últimas semanas partilhei contigo o que aprendi sobre sinais do corpo, fome emocional, mitos da nutrição e ciclo hormonal.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">Mas há uma coisa que liga tudo isto: o corpo, a emoção e a mente não funcionam separados. Quando tentas resolver um problema de peso só com dieta, ignoras 70% da equação.</p>

        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #6B5B95;">
          <p style="color: #4A4035; font-weight: bold; margin: 0 0 12px;">O Sete Ecos existe por causa disso.</p>
          <p style="color: #6B5C4C; margin: 0 0 8px;"><strong>Vitalis</strong> — cuida da nutrição e do corpo</p>
          <p style="color: #6B5C4C; margin: 0 0 8px;"><strong>Serena</strong> — cuida das emoções e do equilíbrio</p>
          <p style="color: #6B5C4C; margin: 0 0 8px;"><strong>Ignis</strong> — cuida do foco e da vontade</p>
          <p style="color: #6B5C4C; margin: 0 0 8px;"><strong>Ventis</strong> — cuida da energia e do ritmo</p>
          <p style="color: #6B5C4C; margin: 0 0 8px;"><strong>Áurea</strong> — cuida do valor próprio</p>
          <p style="color: #6B5C4C; margin: 0 0 8px;"><strong>Ecoa</strong> — cuida da voz e expressão</p>
          <p style="color: #6B5C4C; margin: 0;"><strong>Imago</strong> — cuida da identidade e da essência</p>
        </div>

        <p style="color: #6B5C4C; line-height: 1.8;">Cada eco trabalha uma dimensão diferente. Juntos, formam um sistema integrado de transformação. Não é preciso fazer todos — começas por onde sentes mais necessidade.</p>
        <p style="color: #6B5C4C; line-height: 1.8;">Se queres descobrir por onde começar, o <strong>Lumina</strong> mostra-te exactamente isso.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/lumina?utm_source=email&utm_medium=sequencia&utm_campaign=dia30" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6B5B95, #9B59B6); color: white; border-radius: 25px; text-decoration: none; font-weight: bold;">Descobre por onde começar</a>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${BASE_URL}/vitalis?utm_source=email&utm_medium=sequencia&utm_campaign=dia30" style="display: inline-block; padding: 12px 28px; background: #7C8B6F; color: white; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 14px;">Conhece o Vitalis</a>
        </div>

        ${RODAPE_WHATSAPP}
        <p style="color: #6B5C4C; font-size: 14px; text-align: center;">Com carinho,<br><strong>— Vivianne</strong></p>
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
