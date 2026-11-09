/**
 * Corrige plugins que exportam `before` como named export E possuem
 * default export. O carregador do bot usa `module.default || module`,
 * então o `before` de named export se perde.
 *
 * A solucao e anexar `before` ao default export.
 *
 * Uso: node scripts/fix-before-exports.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const PLUGINS = path.join(ROOT, 'plugins')

const alvos = [
    'grupo-antilink-variantes.js',
    'grupo-antispam-palavras.js',
    'grupo-protecao.js',
    'main-aliases.js',
    'config-soadm.js'
]

for (const arquivo of alvos) {
    const full = path.join(PLUGINS, arquivo)
    if (!fs.existsSync(full)) {
        console.log(`  [SKIP] ${arquivo} (não encontrado)`)
        continue
    }

    let src = fs.readFileSync(full, 'utf-8')

    // Se já faz o attach, pula
    if (/handler\.before\s*=/.test(src)) {
        console.log(`  [OK] ${arquivo} (já corrigido)`)
        continue
    }

    // Localiza a declaração do handler e o export default
    const handlerMatch = src.match(/^(let|const|var)\s+handler\s*=/m)
    if (!handlerMatch) {
        console.log(`  [SKIP] ${arquivo} (sem handler declarado)`)
        continue
    }

    const nomeHandler = handlerMatch[1] === 'let' ? 'handler' : 'handler'

    // Insere o attach antes do export default
    const exportDefault = src.match(/^export\s+default\s+/m)
    if (!exportDefault) {
        console.log(`  [SKIP] ${arquivo} (sem export default)`)
        continue
    }

    const insertPos = exportDefault.index
    const bloco = [
        `// O carregador do bot usa \`module.default || module\`, então o hook`,
        `// \`before\` de named export se perderia. Anexamos ao default export.`,
        `${nomeHandler}.before = before`,
        '',
        ''
    ].join('\r\n')

    src = src.slice(0, insertPos) + bloco + src.slice(insertPos)
    fs.writeFileSync(full, src, 'utf-8')
    console.log(`  [FIX] ${arquivo}`)
}

console.log('\nOK')
