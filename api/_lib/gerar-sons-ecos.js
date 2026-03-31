/**
 * api/gerar-sons-ecos.js
 * Proxy para ElevenLabs Sound Effects API
 * Gera sons de drone para cada Eco
 */

const ECOS_PROMPTS = {
  vitalis: {
    nome: 'VITALIS',
    prompt: 'Deep earth grounding drone, low 256hz C note frequency, ancient tribal resonance, muladhara root chakra, red earth vibration, slow deep pulse, healing frequency, meditation ambient',
    duracao: 22,
  },
  aurea: {
    nome: 'ÁUREA',
    prompt: 'Golden harmonic drone, 528hz healing frequency, warm resonant singing bowl, pure gold vibration, DNA repair frequency, radiant warmth, solfeggio tone, meditation ambient',
    duracao: 22,
  },
  serena: {
    nome: 'SERENA',
    prompt: 'Ocean tide drone, 288hz sacral chakra, flowing water resonance, gentle wave pulse, emotional release frequency, blue water vibration, calm meditation ambient',
    duracao: 22,
  },
  ignis: {
    nome: 'IGNIS',
    prompt: 'Solar fire drone, 320hz manipura solar plexus chakra, crackling ember resonance, yellow fire frequency, willpower activation, dynamic fire pulse, meditation ambient',
    duracao: 22,
  },
  ventis: {
    nome: 'VENTIS',
    prompt: 'Forest wind drone, 341hz heart chakra, rustling leaves resonance, green anahata frequency, love vibration, soft breeze pulse, healing ambient nature sound',
    duracao: 22,
  },
  ecoa: {
    nome: 'ECOA',
    prompt: 'Crystal singing bowl throat drone, 384hz vishuddha chakra, voice resonance frequency, blue sound healing, vocal activation, clear expression vibration, meditation ambient',
    duracao: 22,
  },
  imago: {
    nome: 'IMAGO',
    prompt: 'Crown chakra transcendence drone, 480hz sahasrara frequency, violet cosmic resonance, pure om vibration, identity awakening, crystalline high frequency, sacred meditation ambient',
    duracao: 22,
  },
}

export default async function handler(req, res) {
  // CORS para permitir chamadas da app
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' })
  }

  const { eco, apiKey } = req.body

  if (!apiKey) {
    return res.status(400).json({ erro: 'API key da ElevenLabs é obrigatória' })
  }

  if (!eco || !ECOS_PROMPTS[eco]) {
    const disponiveis = Object.keys(ECOS_PROMPTS).join(', ')
    return res.status(400).json({ erro: `Eco inválido. Disponíveis: ${disponiveis}` })
  }

  const { prompt, duracao, nome } = ECOS_PROMPTS[eco]

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: duracao,
        prompt_influence: 0.3,
      }),
    })

    if (!response.ok) {
      let mensagemErro = `Erro ElevenLabs: ${response.status}`
      try {
        const erroJson = await response.json()
        mensagemErro = erroJson.detail?.message || erroJson.detail || mensagemErro
      } catch {
        // ignora erro de parse
      }
      return res.status(response.status).json({ erro: mensagemErro })
    }

    const audioBuffer = await response.arrayBuffer()

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Disposition', `attachment; filename="${eco}-drone.mp3"`)
    res.setHeader('X-Eco-Nome', nome)
    return res.status(200).send(Buffer.from(audioBuffer))
  } catch (err) {
    console.error('[gerar-sons-ecos] Erro:', err)
    return res.status(500).json({ erro: 'Erro interno ao gerar som' })
  }
}
