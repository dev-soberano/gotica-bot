/**
 * Acha comandos registrados em mais de um plugin, lendo os arquivos sem
 * importá-los (importar plugins deixa timers abertos e trava o Node).
 *
 * O despachante executa o PRIMEIRO plugin que casa o comando e para,
 * então comando duplicado significa que um dos dois nunca roda.
 *
 * Uso: node scripts/verificar-conflitos.js
 */

import fs from 'fs'
import path from 'path'

const pasta = path.join(process.cwd(), 'plugins')

/** Extrai os nomes de uma atribuição handler.command = [...] */
function extrairComandos(src) {
    const saida = []
    const re = /handler\.command\s*=\s*(\[[^\]]*\]|['"][^'"]+['"])/g
    for (const m of src.matchAll(re)) {
        const bloco = m[1]
        if (bloco.startsWith('[')) {
            for (const n of bloco.matchAll(/['"]([^'"]+)['"]/g)) saida.push(n[1].toLowerCase())
        } else {
            saida.push(bloco.replace(/['"]/g, '').toLowerCase())
        }
    }
    return saida
}

/** Comando -> plugins que o registram. */
const donos = new Map()
const arquivos = fs.readdirSync(pasta).filter(f => f.endsWith('.js'))

for (const arq of arquivos) {
    const src = fs.readFileSync(path.join(pasta, arq), 'utf8')
    for (const nome of extrairComandos(src)) {
        if (!donos.has(nome)) donos.set(nome, [])
        donos.get(nome).push(arq)
    }
}

const conflitos = [...donos.entries()].filter(([, arqs]) => arqs.length > 1)
console.log(`Arquivos de plugin: ${arquivos.length}`)
console.log(`Comandos distintos: ${donos.size}`)
console.log(`Comando em mais de um plugin: ${conflitos.length}\n`)

for (const [cmd, arqs] of conflitos.sort((a, b) => b[1].length - a[1].length)) {
    console.log(`!${cmd}`)
    for (const a of arqs) console.log(`    - ${a}`)
}

const DO_MENU = ['comandos', 'menuprincipal', 'menup', 'menupre', 'menuprincipalantigo',
    'menuadmtexto', 'menudonotexto', 'menubrincadeiras', 'menu18', 'listprotect', 'donos', 'menu']
console.log('\n--- quem registra os comandos do menu ---')
for (const cmd of DO_MENU) {
    console.log(`!${cmd.padEnd(20)} -> ${(donos.get(cmd) || ['(ninguém)']).join(', ')}`)
}
