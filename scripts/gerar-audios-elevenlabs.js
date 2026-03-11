/**
 * Gerador de Áudios — ElevenLabs API
 * ====================================
 * Lê todos os .md em audio-scripts/, extrai o script e
 * gera os MP3 com a voz clonada da Vivianne.
 *
 * Uso:
 *   node scripts/gerar-audios-elevenlabs.js           # todos os ficheiros
 *   node scripts/gerar-audios-elevenlabs.js ECOA       # só uma pasta
 *   node scripts/gerar-audios-elevenlabs.js 35 36 37   # números específicos
 *
 * Requer no .env:
 *   ELEVENLABS_API_KEY=sk_...
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Carregar .env manualmente (sem dependência extra)
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  }
}

const API_KEY   = process.env.ELEVENLABS_API_KEY
const VOICE_ID  = 'fnoNuVpfClX7lHKFbyZ2'
const MODEL_ID  = 'eleven_v3'
const DELAY_MS  = 3000  // 3s entre pedidos para não exceder rate limit

const ROOT        = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCRIPTS_DIR = path.join(ROOT, 'audio-scripts')
const AUDIO_DIR   = path.join(ROOT, 'public', 'audio')

// ──────────────────────────────────────────────────────────────
// Funções auxiliares
// ──────────────────────────────────────────────────────────────

function parseHeader(content) {
  const speedMatch     = content.match(/Speed:\s*([\d.]+)/)
  const stabilityMatch = content.match(/Stability:\s*([\d.]+)/)
  return {
    speed:     speedMatch     ? parseFloat(speedMatch[1])     : 0.73,
    stability: stabilityMatch ? parseFloat(stabilityMatch[1]) / 100 : 0.82,
  }
}

function extractScript(content) {
  const marker = '## Script (colar directamente no ElevenLabs)'
  const idx = content.indexOf(marker)
  if (idx === -1) return null
  return content.slice(idx + marker.length).trim()
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function gerarAudio(texto, outputPath, speed, stability) {
  const body = JSON.stringify({
    text: texto,
    model_id: MODEL_ID,
    voice_settings: {
      stability,
      similarity_boost: 0.80,
      style: 0.15,
      use_speaker_boost: true,
      speed,
    },
  })

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API ${res.status}: ${err}`)
  }

  const buffer = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(outputPath, buffer)
  return buffer.length
}

// ──────────────────────────────────────────────────────────────
// Descobrir ficheiros a processar
// ──────────────────────────────────────────────────────────────

function getAllMdFiles() {
  const files = []
  for (const folder of fs.readdirSync(SCRIPTS_DIR)) {
    const folderPath = path.join(SCRIPTS_DIR, folder)
    if (!fs.statSync(folderPath).isDirectory()) continue
    for (const file of fs.readdirSync(folderPath).sort()) {
      if (!file.endsWith('.md')) continue
      files.push({ folder, file, fullPath: path.join(folderPath, file) })
    }
  }
  return files
}

function filterFiles(allFiles, args) {
  if (args.length === 0) return allFiles

  return allFiles.filter(({ folder, file }) => {
    // Filtro por nome de pasta: ECOA, IGNIS, MARKETING, etc.
    if (args.some(a => a.toUpperCase() === folder.toUpperCase())) return true
    // Filtro por número: 35, 36, etc.
    const num = file.match(/^(\d+)/)
    if (num && args.includes(num[1])) return true
    // Filtro por slug parcial: mkt-teaser, mkt-story, etc.
    const slug = file.replace('.md', '')
    if (args.some(a => slug.includes(a.toLowerCase()))) return true
    return false
  })
}

// ──────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────

async function main() {
  if (!API_KEY) {
    console.error('❌  ELEVENLABS_API_KEY não encontrada no .env')
    process.exit(1)
  }

  fs.mkdirSync(AUDIO_DIR, { recursive: true })

  const args = process.argv.slice(2)
  const allFiles = getAllMdFiles()
  const toProcess = filterFiles(allFiles, args)

  if (toProcess.length === 0) {
    console.error('❌  Nenhum ficheiro encontrado para os filtros:', args)
    process.exit(1)
  }

  console.log(`\n🎙️  Voz: ${VOICE_ID}`)
  console.log(`📁  Output: public/audio/`)
  console.log(`📋  ${toProcess.length} ficheiro(s) a gerar\n`)

  let ok = 0, skip = 0, err = 0

  for (const { folder, file, fullPath } of toProcess) {
    const baseName  = file.replace('.md', '')
    const outputMp3 = path.join(AUDIO_DIR, `${baseName}.mp3`)

    // Saltar se já existe
    if (fs.existsSync(outputMp3)) {
      console.log(`⏭️   ${folder}/${file} — já existe, a saltar`)
      skip++
      continue
    }

    const content = fs.readFileSync(fullPath, 'utf8')
    const script  = extractScript(content)

    if (!script) {
      console.warn(`⚠️   ${folder}/${file} — sem secção ## Script, a saltar`)
      skip++
      continue
    }

    const { speed, stability } = parseHeader(content)

    process.stdout.write(`🎵  ${folder}/${file} (speed ${speed}, stability ${Math.round(stability * 100)})... `)

    try {
      const bytes = await gerarAudio(script, outputMp3, speed, stability)
      console.log(`✅  ${(bytes / 1024).toFixed(0)} KB`)
      ok++
    } catch (e) {
      console.log(`❌  ${e.message}`)
      err++
    }

    if (toProcess.indexOf({ folder, file, fullPath }) < toProcess.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  console.log(`\n─────────────────────────────`)
  console.log(`✅  Gerados:  ${ok}`)
  console.log(`⏭️   Saltados: ${skip}`)
  console.log(`❌  Erros:    ${err}`)
  console.log(`📂  Ficheiros em: public/audio/\n`)
}

main().catch(e => { console.error(e); process.exit(1) })
