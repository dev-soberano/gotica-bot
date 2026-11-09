/** Varre o projeto inteiro procurando arquivos com encoding quebrado. */
import fs from 'fs'
import path from 'path'
import { temMojibake } from './recuperar-encoding.js'

const raiz = process.cwd()

function varrer(dir) {
    const saida = []
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (['node_modules', '.git', 'session', 'tmp'].includes(e.name)) continue
        const cam = path.join(dir, e.name)
        if (e.isDirectory()) saida.push(...varrer(cam))
        else if (e.name.endsWith('.js')) saida.push(cam)
    }
    return saida
}

const arqs = varrer(raiz)
const quebrados = arqs.filter(a => temMojibake(fs.readFileSync(a, 'utf8')))
console.log(`Arquivos .js verificados: ${arqs.length}`)
console.log(quebrados.length
    ? quebrados.map(q => `[QUEBRADO] ${path.relative(raiz, q)}`).join('\n')
    : 'Nenhum arquivo com encoding quebrado.')
