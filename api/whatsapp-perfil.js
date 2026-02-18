/**
 * API Endpoint: Configurar Perfil WhatsApp Business via Meta Cloud API
 *
 * Chama uma vez para preencher o perfil do WhatsApp Business com:
 * - Descrição / About
 * - Website
 * - Email
 * - Endereço
 * - Categoria (vertical)
 * - Foto de perfil
 *
 * Uso: POST /api/whatsapp-perfil
 * Header: x-api-key (= CRON_SECRET)
 *
 * Também aceita GET com ?key=CRON_SECRET para facilitar teste no browser.
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth simples
  const CRON_SECRET = process.env.CRON_SECRET;
  const apiKey = req.headers['x-api-key'] || req.query?.key;
  if (CRON_SECRET && apiKey !== CRON_SECRET) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return res.status(500).json({ error: 'WHATSAPP_ACCESS_TOKEN ou WHATSAPP_PHONE_NUMBER_ID não configurados' });
  }

  const resultados = { perfil: null, foto: null, erros: [] };

  // ── 1. Atualizar informações do perfil ──
  try {
    const profileUrl = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/whatsapp_business_profile`;

    const profileData = {
      messaging_product: 'whatsapp',
      about: 'Sistema de Transmutação Feminina 🌱',
      description: 'SETE ECOS — Plataforma de bem-estar holístico para mulheres. 7 módulos que integram corpo, emoção, energia, expressão e identidade. Nutrição inteligente (Vitalis), presença e merecimento (Aurea), comunidade e muito mais. Criado por Vivianne dos Santos.',
      email: 'viv.saraiva@gmail.com',
      websites: ['https://app.seteecos.com'],
      address: 'Maputo, Moçambique',
      vertical: 'HEALTH',
    };

    const profileRes = await fetch(profileUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
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
    // Buscar a imagem do logo hospedado no site
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
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
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
            'Authorization': `OAuth ${WHATSAPP_ACCESS_TOKEN}`,
            'file_offset': '0',
            'Content-Type': 'application/octet-stream',
          },
          body: logoBytes,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          const mediaHandle = uploadData.h;

          // Step 3: Definir como foto de perfil
          const photoUrl = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/whatsapp_business_profile`;
          const photoRes = await fetch(photoUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
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

  // ── Resultado final ──
  const sucesso = resultados.erros.length === 0;
  console.log('WhatsApp perfil:', JSON.stringify(resultados));

  return res.status(sucesso ? 200 : 207).json({
    success: sucesso,
    ...resultados,
  });
}
