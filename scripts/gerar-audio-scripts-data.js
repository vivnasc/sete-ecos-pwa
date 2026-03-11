/**
 * Regenera src/lib/audio-scripts-data.js a partir dos ficheiros .md em audio-scripts/
 *
 * Uso:
 *   node scripts/gerar-audio-scripts-data.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCRIPTS_DIR = path.join(ROOT, 'audio-scripts')
const OUTPUT = path.join(ROOT, 'src', 'lib', 'audio-scripts-data.js')

function parseHeader(content) {
  const speedMatch = content.match(/Speed:\s*([\d.]+)/)
  const stabilityMatch = content.match(/Stability:\s*([\d.]+)/)
  return {
    speed: speedMatch ? parseFloat(speedMatch[1]) : 0.73,
    stability: stabilityMatch ? parseFloat(stabilityMatch[1]) : 82,
  }
}

function extractScript(content) {
  const marker = '## Script (colar directamente no ElevenLabs)'
  const idx = content.indexOf(marker)
  if (idx === -1) return null
  return content.slice(idx + marker.length).trim()
}

const data = {}

for (const folder of fs.readdirSync(SCRIPTS_DIR).sort()) {
  const folderPath = path.join(SCRIPTS_DIR, folder)
  if (!fs.statSync(folderPath).isDirectory()) continue

  const entries = []
  for (const file of fs.readdirSync(folderPath).sort()) {
    if (!file.endsWith('.md')) continue

    const content = fs.readFileSync(path.join(folderPath, file), 'utf8')
    const script = extractScript(content)
    if (!script) {
      console.warn(`⚠️  ${folder}/${file} — sem secção ## Script, a saltar`)
      continue
    }

    const { speed, stability } = parseHeader(content)
    const slug = file.replace('.md', '')

    entries.push({ slug, speed, stability, script })
  }

  if (entries.length > 0) {
    data[folder] = entries
  }
}

const output = `// Auto-gerado a partir de audio-scripts/*.md
// Não editar manualmente — regenerar com: node scripts/gerar-audio-scripts-data.js

export const AUDIO_SCRIPTS = ${JSON.stringify(data, null, 2)};
`

fs.writeFileSync(OUTPUT, output)

const totalScripts = Object.values(data).reduce((sum, arr) => sum + arr.length, 0)
console.log(`✅  ${totalScripts} scripts em ${Object.keys(data).length} pastas → ${OUTPUT}`)
for (const [folder, entries] of Object.entries(data)) {
  console.log(`   ${folder}: ${entries.length} scripts`)
}
