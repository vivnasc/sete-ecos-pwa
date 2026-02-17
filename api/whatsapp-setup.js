/**
 * WhatsApp Webhook Setup & Diagnostic — Sete Ecos
 *
 * Endpoint para diagnosticar e corrigir a subscrição do webhook WhatsApp.
 * Usa os tokens já configurados no Vercel para:
 * 1. Encontrar o WABA ID a partir do Phone Number ID
 * 2. Verificar se a app está subscrita ao WABA
 * 3. Subscrever a app ao WABA se necessário
 *
 * Uso: GET https://app.seteecos.com/api/whatsapp-setup
 *      POST https://app.seteecos.com/api/whatsapp-setup  (para subscrever)
 */

const ACCESS_TOKEN = () => process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = () => process.env.WHATSAPP_PHONE_NUMBER_ID;

const API_VERSION = 'v21.0';
const BASE = `https://graph.facebook.com/${API_VERSION}`;

async function graphGet(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function graphPost(path, token, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export default async function handler(req, res) {
  // Only allow from known origins or no origin (direct browser/curl)
  const allowedOrigins = ['https://app.seteecos.com', 'https://seteecos.com', 'http://localhost:3000'];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  const token = ACCESS_TOKEN();
  const phoneId = PHONE_NUMBER_ID();

  if (!token || !phoneId) {
    return res.status(200).json({
      error: 'Variáveis em falta',
      hasAccessToken: !!token,
      hasPhoneNumberId: !!phoneId,
    });
  }

  const diagnostico = {
    timestamp: new Date().toISOString(),
    phoneNumberId: phoneId,
    steps: [],
  };

  try {
    // Step 1: Get phone number info + WABA ID
    const phoneInfo = await graphGet(`/${phoneId}?fields=display_phone_number,verified_name,quality_rating`, token);
    diagnostico.steps.push({
      step: '1. Phone Number Info',
      ok: phoneInfo.ok,
      data: phoneInfo.data,
    });

    // Step 2: Get WABA ID from phone number
    const wabaLookup = await graphGet(`/${phoneId}/owner_business_info`, token);
    // Alternative: try to get WABA directly
    const wabaFromPhone = await graphGet(`/${phoneId}?fields=id,display_phone_number`, token);

    // Try to find WABA ID through the business
    // The phone number belongs to a WABA — we need to find it
    // Common approach: query the phone number's parent WABA
    const wabaSearch = await graphGet(`/${phoneId}/whatsapp_business_account`, token);

    diagnostico.steps.push({
      step: '2. WABA Lookup',
      wabaSearch: { ok: wabaSearch.ok, data: wabaSearch.data },
      ownerBusiness: { ok: wabaLookup.ok, data: wabaLookup.data },
    });

    // Try alternative: get WABA ID from the phone number's account
    // Sometimes the WABA ID is embedded in app-level subscriptions
    let wabaId = wabaSearch.data?.id || wabaSearch.data?.data?.[0]?.id;

    // If we couldn't find WABA via phone, check env var
    if (!wabaId && process.env.WHATSAPP_BUSINESS_ACCOUNT_ID) {
      wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
      diagnostico.steps.push({
        step: '2b. WABA ID from env',
        wabaId,
      });
    }

    // Step 3: If we have WABA ID, check subscriptions
    if (wabaId) {
      const subs = await graphGet(`/${wabaId}/subscribed_apps`, token);
      diagnostico.steps.push({
        step: '3. Current Subscriptions',
        wabaId,
        ok: subs.ok,
        data: subs.data,
      });

      // Step 4: On POST, subscribe the app
      if (req.method === 'POST') {
        const subscribe = await graphPost(`/${wabaId}/subscribed_apps`, token, {});
        diagnostico.steps.push({
          step: '4. Subscribe App to WABA',
          ok: subscribe.ok,
          data: subscribe.data,
        });

        // Verify subscription worked
        if (subscribe.ok) {
          const verify = await graphGet(`/${wabaId}/subscribed_apps`, token);
          diagnostico.steps.push({
            step: '5. Verify Subscription',
            ok: verify.ok,
            data: verify.data,
          });
        }
      } else {
        diagnostico.steps.push({
          step: '4. Ação',
          message: 'Envia POST para este endpoint para subscrever a app ao WABA',
        });
      }
    } else {
      diagnostico.steps.push({
        step: '3. WABA não encontrado',
        message: 'Não consegui encontrar o WABA ID. Tenta adicionar WHATSAPP_BUSINESS_ACCOUNT_ID nas env vars do Vercel.',
        hint: 'O WABA ID está em business.facebook.com > WhatsApp Accounts > Settings',
      });

      // Try app-level subscriptions check
      // This requires app access token (app_id|app_secret)
      if (process.env.META_APP_ID && process.env.META_APP_SECRET) {
        const appToken = `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`;
        const appSubs = await graphGet(`/${process.env.META_APP_ID}/subscriptions`, appToken);
        diagnostico.steps.push({
          step: '3b. App-level Subscriptions',
          ok: appSubs.ok,
          data: appSubs.data,
        });
      }
    }

    // Step extra: test sending a message to ourselves (dry run check)
    diagnostico.steps.push({
      step: 'Resumo',
      config: {
        phoneNumberId: phoneId,
        wabaId: wabaId || 'NÃO ENCONTRADO',
        hasToken: true,
        phoneInfo: phoneInfo.ok ? 'OK' : 'ERRO',
      },
      nextSteps: wabaId
        ? (req.method === 'POST'
          ? 'Subscrição feita! Testa enviando "ola" no WhatsApp.'
          : 'Faz POST para este endpoint para subscrever.')
        : 'Adiciona WHATSAPP_BUSINESS_ACCOUNT_ID ao Vercel.',
    });

  } catch (err) {
    diagnostico.error = err.message;
  }

  return res.status(200).json(diagnostico);
}
