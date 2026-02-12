/**
 * API Endpoint: Broadcast para Interessados
 *
 * Envia emails em massa para:
 * - Waitlist (leads que ainda não subscreveram)
 * - Users registados sem subscrição ativa
 * - Clientes expirados/cancelados (win-back)
 *
 * Tipos de broadcast:
 * - catálogo: Catálogo completo com todos os servicos
 * - novidade: Anuncio de nova funcionalidade
 * - promo: Promoção especial com código
 * - curiosidade: Conteúdo provocador de marketing
 * - convite-whatsapp: Convida a juntar-se ao WhatsApp Business
 */

import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Sete Ecos <noreply@seteecos.com>';
const BASE_URL = 'https://app.seteecos.com';
const WHATSAPP_LINK = 'https://wa.me/258851006473';
const CODIGO_PROMO = 'VEMVITALIS20';

const RODAPE = `
  <div style="border-top: 1px solid #E8E0D8; margin-top: 30px; padding-top: 20px; text-align: center;">
    <div style="background: #25D366; border-radius: 10px; padding: 14px; margin: 0 auto 16px; max-width: 300px;">
      <a href="${WHATSAPP_LINK}" style="color: white; text-decoration: none; font-weight: bold; font-size: 14px;">WhatsApp: Falar com a Vivianne</a>
    </div>
    <p style="color: #9B9B9B; font-size: 11px; line-height: 1.6;">
      Sete Ecos — Sistema de Transmutação Feminina<br>
      <a href="${BASE_URL}" style="color: #7C8B6F;">app.seteecos.com</a><br>
      Maputo, Moçambique
    </p>
  </div>`;

// ===== TEMPLATES DE BROADCAST =====

const BROADCAST_TEMPLATES = {
  catalogo: {
    assunto: (nome) => `${nome}, conhece o catálogo completo Sete Ecos`,
    html: (nome) => `
      <div style="font-family: 'Quicksand', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-family: 'Cormorant Garamond', serif; color: #4A4035; font-size: 26px;">Catálogo Sete Ecos 2026</h1>
          <p style="color: #6B5C4C;">Olá ${nome}, aqui está tudo sobre o nosso ecossistema</p>
        </div>

        <!-- LUMINA -->
        <div style="background: linear-gradient(135deg, #6B5B95, #9B59B6); border-radius: 12px; padding: 20px; margin: 16px 0; color: white;">
          <h2 style="margin: 0 0 8px; font-size: 20px;">LUMINA — Diagnóstico Gratuito</h2>
          <p style="margin: 0; opacity: 0.9; font-size: 14px;">5 minutos. 23 padrões possíveis. 100% gratuito.</p>
          <p style="margin: 8px 0 0; font-size: 13px;">Descobre o teu padrão emocional, a tua relação com a comida e o que o teu corpo precisa.</p>
          <div style="margin-top: 12px;">
            <a href="${BASE_URL}/lumina?utm_source=broadcast&utm_campaign=catalogo" style="display: inline-block; padding: 8px 20px; background: white; color: #6B5B95; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 13px;">Começar Lumina</a>
          </div>
        </div>

        <!-- VITALIS -->
        <div style="background: linear-gradient(135deg, #7C8B6F, #5a6b4f); border-radius: 12px; padding: 20px; margin: 16px 0; color: white;">
          <h2 style="margin: 0 0 8px; font-size: 20px;">VITALIS — Coaching Nutricional</h2>
          <p style="margin: 0; opacity: 0.9; font-size: 14px;">O programa de transformação feito para a mulher moçambicana.</p>
          <ul style="margin: 8px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; opacity: 0.9;">
            <li>Plano alimentar personalizado (xima, matapa, caril)</li>
            <li>Check-in diário + Dashboard de progresso</li>
            <li>Espaço de Retorno (apoio emocional único)</li>
            <li>Receitas moçambicanas + Lista de compras</li>
            <li>Chat direto com a Vivianne</li>
          </ul>
          <p style="margin: 8px 0 0; font-size: 16px; font-weight: bold;">Desde 2.500 MZN/mês | 7 dias grátis</p>
          <div style="margin-top: 12px;">
            <a href="${BASE_URL}/vitalis?utm_source=broadcast&utm_campaign=catalogo" style="display: inline-block; padding: 8px 20px; background: white; color: #7C8B6F; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 13px;">Ver VITALIS</a>
          </div>
        </div>

        <!-- AUREA -->
        <div style="background: linear-gradient(135deg, #C9A96E, #8B6914); border-radius: 12px; padding: 20px; margin: 16px 0; color: white;">
          <h2 style="margin: 0 0 8px; font-size: 20px;">AUREA — Auto-Valor e Presença</h2>
          <p style="margin: 0; opacity: 0.9; font-size: 14px;">100+ micro-práticas de auto-cuidado. Meditações. Diário de merecimento.</p>
          <p style="margin: 8px 0 0; font-size: 16px; font-weight: bold;">Desde 975 MZN/mês</p>
          <div style="margin-top: 12px;">
            <a href="${BASE_URL}/aurea?utm_source=broadcast&utm_campaign=catalogo" style="display: inline-block; padding: 8px 20px; background: white; color: #C9A96E; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 13px;">Ver AUREA</a>
          </div>
        </div>

        <!-- BUNDLE -->
        <div style="background: linear-gradient(135deg, #FF6B6B, #EE5A24); border-radius: 12px; padding: 20px; margin: 16px 0; color: white; text-align: center;">
          <h2 style="margin: 0 0 8px; font-size: 20px;">BUNDLE — Vitalis + Aurea</h2>
          <p style="margin: 0; font-size: 24px; font-weight: bold;">25% DESCONTO</p>
          <p style="margin: 4px 0; font-size: 14px; opacity: 0.9;">Desde 2.600 MZN/mês (poupas 875 MZN!)</p>
        </div>

        <!-- CODIGO PROMO -->
        <div style="background: #2C2C2C; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; color: white;">
          <p style="font-size: 11px; letter-spacing: 2px; margin: 0;">CÓDIGO EXCLUSIVO PARA TI</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 8px 0;">${CODIGO_PROMO}</p>
          <p style="font-size: 16px; margin: 0;">20% de desconto no VITALIS</p>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${BASE_URL}/vitalis/pagamento?code=${CODIGO_PROMO}&utm_source=broadcast&utm_campaign=catalogo" style="display: inline-block; padding: 16px 36px; background: #7C8B6F; color: white; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px;">Começar com 20% Desconto</a>
        </div>

        <!-- Métodos de pagamento -->
        <div style="background: white; padding: 16px; border-radius: 12px; margin: 16px 0;">
          <p style="color: #4A4035; font-weight: bold; margin: 0 0 8px; text-align: center;">Formas de Pagamento</p>
          <p style="color: #6B5C4C; font-size: 13px; margin: 2px 0; text-align: center;">M-Pesa | e-Mola | PayPal | Cartão Visa/Mastercard | Transferência BCI</p>
        </div>

        ${RODAPE}
      </div>`
  },

  promo: {
    assunto: (nome) => `${nome}, 20% de desconto no VITALIS — código exclusivo`,
    html: (nome) => `
      <div style="font-family: 'Quicksand', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Cormorant Garamond', serif; color: #4A4035; font-size: 26px; text-align: center;">${nome}, tenho um presente para ti</h1>

        <div style="background: linear-gradient(135deg, #2C2C2C, #1a1a1a); color: white; padding: 30px; border-radius: 16px; margin: 24px 0; text-align: center;">
          <p style="font-size: 12px; letter-spacing: 3px; margin: 0; color: #FF6B6B;">OFERTA EXCLUSIVA</p>
          <p style="font-size: 42px; font-weight: bold; letter-spacing: 4px; margin: 12px 0;">${CODIGO_PROMO}</p>
          <p style="font-size: 20px; margin: 0; color: #FFD700;">20% de desconto no VITALIS</p>
          <p style="font-size: 14px; margin: 8px 0 0; color: rgba(255,255,255,0.6);">De 2.500 por 2.000 MZN/mês</p>
        </div>

        <p style="color: #6B5C4C; font-size: 15px; line-height: 1.8; text-align: center;">O VITALIS é o único programa em Moçambique que combina:</p>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 16px 0;">
          <p style="color: #4A4035; margin: 6px 0; font-size: 14px;">Plano alimentar com comida moçambicana</p>
          <p style="color: #4A4035; margin: 6px 0; font-size: 14px;">Apoio emocional (ESPAÇO de Retorno)</p>
          <p style="color: #4A4035; margin: 6px 0; font-size: 14px;">Acompanhamento real com a Vivianne</p>
          <p style="color: #4A4035; margin: 6px 0; font-size: 14px;">7 dias de garantia total</p>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${BASE_URL}/vitalis/pagamento?code=${CODIGO_PROMO}&utm_source=broadcast&utm_campaign=promo" style="display: inline-block; padding: 16px 36px; background: linear-gradient(135deg, #7C8B6F, #5a6b4f); color: white; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px;">Usar Código — 20% Off</a>
        </div>

        ${RODAPE}
      </div>`
  },

  'convite-whatsapp': {
    assunto: (nome) => `${nome}, agora podes falar comigo no WhatsApp!`,
    html: (nome) => `
      <div style="font-family: 'Quicksand', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 40px 30px;">
        <h1 style="font-family: 'Cormorant Garamond', serif; color: #4A4035; font-size: 26px; text-align: center;">Novidade, ${nome}!</h1>

        <p style="color: #6B5C4C; font-size: 15px; line-height: 1.8; text-align: center;">Agora podes falar comigo diretamente no WhatsApp!</p>

        <div style="background: #25D366; border-radius: 16px; padding: 30px; margin: 24px 0; text-align: center; color: white;">
          <p style="font-size: 40px; margin: 0 0 8px;">💬</p>
          <h2 style="margin: 0 0 8px; font-size: 22px;">WhatsApp Sete Ecos</h2>
          <p style="margin: 0 0 16px; font-size: 14px; opacity: 0.9;">Tira dúvidas, vê preços, conhece os servicos ou fala diretamente comigo — tudo pelo WhatsApp.</p>
          <a href="${WHATSAPP_LINK}?text=Ola%20Vivianne!" style="display: inline-block; padding: 14px 32px; background: white; color: #25D366; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px;">Enviar Mensagem</a>
        </div>

        <p style="color: #6B5C4C; font-size: 14px; line-height: 1.8; text-align: center;">O que podes fazer no WhatsApp:</p>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 16px 0;">
          <p style="color: #4A4035; margin: 6px 0; font-size: 14px;">Tirar dúvidas sobre o VITALIS, LUMINA ou AUREA</p>
          <p style="color: #4A4035; margin: 6px 0; font-size: 14px;">Vê preços e formas de pagamento</p>
          <p style="color: #4A4035; margin: 6px 0; font-size: 14px;">Ativar o trial gratuito de 7 dias</p>
          <p style="color: #4A4035; margin: 6px 0; font-size: 14px;">Enviar comprovativo de pagamento</p>
          <p style="color: #4A4035; margin: 6px 0; font-size: 14px;">Falar diretamente com a Vivianne</p>
        </div>

        <p style="color: #6B5C4C; font-size: 14px; text-align: center; margin-top: 24px;">Respondo pessoalmente. Sem bots. Sem espera.</p>

        ${RODAPE}
      </div>`
  }
};

export default async function handler(req, res) {
  // Permitir POST (manual) e GET (cron)
  const CRON_SECRET = process.env.CRON_SECRET;

  // Verificar auth - ou cron secret ou coach email
  if (req.method === 'GET') {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${CRON_SECRET}` && !req.query.secret !== CRON_SECRET) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
  }

  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Configuração em falta' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Parametros
  const tipo = req.query?.tipo || req.body?.tipo || 'catalogo';
  const audiencia = req.query?.audiencia || req.body?.audiencia || 'todos'; // waitlist, registados, expirados, todos

  const template = BROADCAST_TEMPLATES[tipo];
  if (!template) {
    return res.status(400).json({
      error: 'Tipo inválido',
      tipos_disponiveis: Object.keys(BROADCAST_TEMPLATES)
    });
  }

  const resultados = { enviados: 0, erros: [], audiencia, tipo };

  try {
    // Construir lista de destinatarios
    const destinatarios = new Map(); // email -> nome (evitar duplicados)

    // Waitlist
    if (audiencia === 'waitlist' || audiencia === 'todos') {
      const { data: waitlist } = await supabase
        .from('waitlist')
        .select('nome, email');

      for (const lead of waitlist || []) {
        if (lead.email && !destinatarios.has(lead.email)) {
          destinatarios.set(lead.email, lead.nome || 'amiga');
        }
      }
    }

    // Users registados sem subscrição
    if (audiencia === 'registados' || audiencia === 'todos') {
      const { data: users } = await supabase
        .from('users')
        .select('id, nome, email');

      for (const user of users || []) {
        if (!user.email || destinatarios.has(user.email)) continue;

        // Verificar se tem subscrição ativa
        const { data: client } = await supabase
          .from('vitalis_clients')
          .select('subscription_status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!client || !['active', 'tester'].includes(client?.subscription_status)) {
          destinatarios.set(user.email, user.nome || 'amiga');
        }
      }
    }

    // Clientes expirados/cancelados (win-back)
    if (audiencia === 'expirados' || audiencia === 'todos') {
      const { data: expirados } = await supabase
        .from('vitalis_clients')
        .select('user_id, users!inner(nome, email)')
        .in('subscription_status', ['expired', 'cancelled']);

      for (const client of expirados || []) {
        const email = client.users?.email;
        if (email && !destinatarios.has(email)) {
          destinatarios.set(email, client.users?.nome || 'amiga');
        }
      }
    }

    // Excluir coach emails
    const coachEmails = ['viv.saraiva@gmail.com', 'vivnasc@gmail.com', 'vivianne.saraiva@outlook.com'];
    for (const ce of coachEmails) {
      destinatarios.delete(ce);
    }

    resultados.total_destinatarios = destinatarios.size;

    // Enviar emails (com rate limiting)
    let count = 0;
    for (const [email, nome] of destinatarios) {
      try {
        // Verificar se já enviamos este broadcast hoje
        const hoje = new Date().toISOString().split('T')[0];
        try {
          const { data: jaEnviado } = await supabase
            .from('email_log')
            .select('id')
            .eq('email', email)
            .eq('tipo', `broadcast-${tipo}`)
            .gte('sent_at', hoje)
            .limit(1);

          if (jaEnviado && jaEnviado.length > 0) continue;
        } catch {
          // Tabela pode não existir
        }

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: email,
            subject: template.assunto(nome),
            html: template.html(nome),
          }),
        });

        if (response.ok) {
          // Registar envio
          try {
            await supabase.from('email_log').insert({
              email,
              tipo: `broadcast-${tipo}`,
              subject: template.assunto(nome),
              sent_at: new Date().toISOString()
            });
          } catch {
            // Tabela pode não existir
          }
          resultados.enviados++;
        } else {
          const err = await response.text();
          resultados.erros.push({ email, erro: err });
        }

        count++;
        // Rate limit: pausa a cada 10 emails (Resend free tier)
        if (count % 10 === 0) {
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (emailErr) {
        resultados.erros.push({ email, erro: emailErr.message });
      }
    }

    return res.status(200).json({
      message: `Broadcast "${tipo}" enviado: ${resultados.enviados}/${destinatarios.size} emails`,
      ...resultados
    });

  } catch (error) {
    console.error('Erro no broadcast:', error);
    return res.status(500).json({ error: error.message, ...resultados });
  }
}
