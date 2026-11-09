/**
 * Utilitário de desenvolvimento: extrai um trecho do index.js do
 * Minato a partir de um `case 'comando'` para servir de referência
 * durante a portagem.
 *
 * Uso: node scripts/ref-minato.js clima [linhas]
 */
import fs from 'fs'
import path from 'path'

const ROOT = path.join(process.env.USERPROFILE || '', 'Desktop', 'minato-bot')
const file = path.join(ROOT, 'index.js')

const cmd = (process.argv[2] || '').toLowerCase()
const extra = Number(process.argv[3] || 45)

if (!fs.existsSync(file)) {
    console.error('index.js do Minato nao encontrado em ' + file)
    process.exit(1)
}

const lines = fs.readFileSync(file, 'utf-8').split('\n')
const needle = "case '" + cmd + "'"
const idx = lines.findIndex(l => l.includes(needle))

if (idx === -1) {
    console.error('case nao encontrado: ' + needle)
    process.exit(1)
}

console.log('=== ' + needle + ' (linha ' + (idx + 1) + ') ===')
const saida = lines.slice(Math.max(0, idx - 8), idx + extra).join('\n')

const outFile = process.argv[4]
if (outFile) {
    fs.writeFileSync(outFile, saida, 'utf-8')
    console.log('(escrito em ' + outFile + ')')
} else {
    console.log(saida)
}
