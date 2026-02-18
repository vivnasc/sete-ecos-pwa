/**
 * API Endpoint: WhatsApp via Meta Cloud API (consolidado)
 *
 * Ações:
 * - POST { mensagem, para? }           → Enviar mensagem WhatsApp
 * - POST { action: "perfil" }           → Configurar perfil Business
 * - GET  ?action=perfil&key=CRON_SECRET → Configurar perfil (browser)
 *
 * Configuração no Vercel:
 * - WHATSAPP_ACCESS_TOKEN: Token de acesso Meta Business
 * - WHATSAPP_PHONE_NUMBER_ID: ID do número WhatsApp Business
 * - VIVIANNE_PERSONAL_NUMBER: Número pessoal da coach (ex: 258851006473)
 */

export default async function handler(req, res) {
  // CORS
  const allowedOrigins = [
    'https://app.seteecos.com',
    'https://seteecos.com',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return res.status(500).json({ error: 'Meta WhatsApp API não configurada. Adiciona WHATSAPP_ACCESS_TOKEN e WHATSAPP_PHONE_NUMBER_ID no Vercel.' });
  }

  // Determinar ação: query param (GET) ou body (POST)
  const action = req.query?.action || req.body?.action;

  if (action === 'perfil') {
    return handlePerfil(req, res, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID);
  }

  // Ação default: enviar mensagem
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  return handleEnviarMensagem(req, res, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID);
}

// ═══════════════════════════════════════════
// Enviar mensagem WhatsApp
// ═══════════════════════════════════════════
async function handleEnviarMensagem(req, res, token, phoneId) {
  const personalNumber = (process.env.VIVIANNE_PERSONAL_NUMBER || '').trim();
  const COACH_NUMBER = personalNumber
    ? personalNumber.replace(/[^0-9]/g, '')
    : '258851006473';

  try {
    const { mensagem, para } = req.body;

    if (!mensagem) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    const destinatario = para
      ? para.replace(/[^0-9]/g, '')
      : COACH_NUMBER;

    const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: destinatario,
        type: 'text',
        text: { body: mensagem },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Erro Meta API:', result?.error?.message || JSON.stringify(result));
      return res.status(response.status).json({
        error: result?.error?.message || 'Erro ao enviar WhatsApp',
        code: result?.error?.code
      });
    }

    const msgId = result.messages?.[0]?.id;
    console.log('WhatsApp enviado via Meta:', msgId);
    return res.status(200).json({ success: true, messageId: msgId });

  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return res.status(500).json({ error: 'Erro interno ao enviar WhatsApp' });
  }
}

// ═══════════════════════════════════════════
// Configurar perfil WhatsApp Business
// ═══════════════════════════════════════════
async function handlePerfil(req, res, token, phoneId) {
  // Auth simples para proteger este endpoint
  const CRON_SECRET = process.env.CRON_SECRET;
  const apiKey = req.headers['x-api-key'] || req.query?.key;
  if (CRON_SECRET && apiKey !== CRON_SECRET) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const resultados = { perfil: null, foto: null, erros: [] };

  // ── 1. Atualizar informações do perfil ──
  try {
    const profileUrl = `https://graph.facebook.com/v22.0/${phoneId}/whatsapp_business_profile`;

    const profileData = {
      messaging_product: 'whatsapp',
      about: 'Bem-estar holístico para mulheres 🌱✨',
      description: 'SETE ECOS — Sistema de Transmutação Feminina criado por Vivianne dos Santos.\n\n🌿 VITALIS — Nutrição inteligente e personalizada\n💛 ÁUREA — Presença, valor próprio e merecimento\n🔮 LUMINA — Diagnóstico energético e autoconhecimento\n👥 COMUNIDADE — Rede de apoio entre mulheres\n\n7 módulos que integram corpo, emoção, energia, expressão e identidade. Planos alimentares adaptados, acompanhamento por WhatsApp e uma comunidade que te acolhe.\n\n📍 Maputo, Moçambique | Portugal',
      email: 'feedback@seteecos.com',
      websites: ['https://app.seteecos.com', 'https://seteecos.com'],
      address: 'Maputo, Moçambique',
      vertical: 'HEALTH',
    };

    const profileRes = await fetch(profileUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const profileResult = await profileRes.json();

    if (!profileRes.ok) {
      resultados.erros.push('Perfil: ' + (profileResult?.error?.message || JSON.stringify(profileResult)));
    } else {
      resultados.perfil = 'Atualizado com sucesso';
    }
  } catch (err) {
    resultados.erros.push('Perfil erro: ' + err.message);
  }

  // ── 2. Fazer upload da foto de perfil ──
  try {
    const logoUrl = 'https://app.seteecos.com/logos/seteecos_logo_v2.png';
    const logoRes = await fetch(logoUrl);

    if (!logoRes.ok) {
      resultados.erros.push('Foto: não conseguiu baixar logo de ' + logoUrl);
    } else {
      const logoBuffer = await logoRes.arrayBuffer();
      const logoBytes = new Uint8Array(logoBuffer);

      // Step 1: Criar sessão de upload
      const uploadSessionUrl = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_WABA_ID || 'app'}/uploads`;
      const sessionRes = await fetch(uploadSessionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_length: logoBytes.length,
          file_type: 'image/png',
          file_name: 'seteecos_logo.png',
        }),
      });

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        const uploadSessionId = sessionData.id;

        // Step 2: Upload do ficheiro
        const uploadUrl = `https://graph.facebook.com/v22.0/${uploadSessionId}`;
        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `OAuth ${token}`,
            'file_offset': '0',
            'Content-Type': 'application/octet-stream',
          },
          body: logoBytes,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          const mediaHandle = uploadData.h;

          // Step 3: Definir como foto de perfil
          const photoUrl = `https://graph.facebook.com/v22.0/${phoneId}/whatsapp_business_profile`;
          const photoRes = await fetch(photoUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              profile_picture_handle: mediaHandle,
            }),
          });

          const photoResult = await photoRes.json();
          if (!photoRes.ok) {
            resultados.erros.push('Foto perfil: ' + (photoResult?.error?.message || JSON.stringify(photoResult)));
          } else {
            resultados.foto = 'Foto de perfil atualizada';
          }
        } else {
          const uploadErr = await uploadRes.json();
          resultados.erros.push('Upload foto: ' + (uploadErr?.error?.message || JSON.stringify(uploadErr)));
        }
      } else {
        const sessErr = await sessionRes.json();
        resultados.erros.push('Sessão upload: ' + (sessErr?.error?.message || JSON.stringify(sessErr)));
      }
    }
  } catch (err) {
    resultados.erros.push('Foto erro: ' + err.message);
  }

  const sucesso = resultados.erros.length === 0;
  console.log('WhatsApp perfil:', JSON.stringify(resultados));

  return res.status(sucesso ? 200 : 207).json({
    success: sucesso,
    ...resultados,
  });
}
