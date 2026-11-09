/**
 * Verifica a integridade de encoding UTF-8 dos arquivos do projeto.
 *
 * Detecta:
 *  - Caractere de substituicao U+FFFD (indicador de mojibake)
 *  - Sequencias de "?" que substituiram emojis
 *  - BOM UTF-8 indevido
 *  - Erros de sintaxe caused por encoding quebrado
 *
 * Uso: node scripts/check-encoding.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import vm from 'node:vm'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const ALVOS = ['plugins', 'lib', 'scripts']

let problemas = 0
let verificados = 0
const listaProblemas = []

console.log('\n' + '='.repeat(60))
console.log('  VERIFICACAO DE ENCODING UTF-8')
console.log('='.repeat(60) + '\n')

/**
 * Verifica se o texto tem um "?" no lugar de um emoji.
 *
 * A heuristica precisa ser precisa para nao gerar falsos positivos:
 * procuramos o padrao exato que a corrupcao produz - um "?" (ou "??")
 * seguido de espaco e de um texto em caixa alta/negrito, dentro de uma
 * string de template. O operador ternario (`x ? y : z`) nao gera esse
 * padrao porque o "?" e seguido de espaco + expressao, nao de `*Texto`.
 */
function temEmojiPerdido(text) {
    const emojis = (text.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu) || []).length
    if (emojis < 10) return false

    // Padroes tipicos da corrupcao:
    //   `? *TITULO*`   -> emoji perdido antes do negrito
    //   `?? `           -> emoji duplo perdido
    //   `? `            -> emoji perdido no inicio de frase
    const padroes = [
        /\?[ ]{1,2}\*[A-Za-zÀ-ÿ]/,      // "? *Texto"
        /`\?[ ]{1,2}[A-ZÀ-Þ][a-zà-ÿ]+/, // "`? Texto"
        /:\s*\?[ ]{1,2}[A-ZÀ-Þ]/        // ": ? Texto"
    ]

    for (const p of padroes) {
        if (p.test(text)) return true
    }
    return false
}

for (const alvo of ALVOS) {
    const dir = path.join(ROOT, alvo)
    if (!fs.existsSync(dir)) continue

    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) {
        const full = path.join(dir, file)
        const bytes = fs.readFileSync(full)
        verificados++

        // BOM UTF-8
        if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
            listaProblemas.push(`${alvo}/${file}: BOM UTF-8 indevido`)
            continue
        }

        const text = bytes.toString('utf8')

        // U+FFFD - caractere de substituicao
        if (text.includes('\uFFFD')) {
            const idx = text.indexOf('\uFFFD')
            const linha = text.slice(0, idx).split('\n').length
            listaProblemas.push(`${alvo}/${file}: U+FFFD na linha ${linha} (mojibake)`)
            continue
        }

        // Emoji perdido
        if (temEmojiPerdido(text)) {
            const idx = text.search(/\?[ ]{1,2}[*A-ZÀ-Þ]/)
            const linha = text.slice(0, idx).split('\n').length
            listaProblemas.push(`${alvo}/${file}: emoji perdido na linha ${linha}`)
            continue
        }

        // Erro de sintaxe (tipicamente por encoding quebrado)
        try {
            new vm.SourceTextModule(text, { identifier: full })
        } catch (e) {
            const msg = String(e.message || '')
            if (/Invalid or unexpected token|Unexpected character|unterminated|Invalid character/i.test(msg)) {
                listaProblemas.push(`${alvo}/${file}: erro de sintaxe — ${msg.split('\n')[0]}`)
            }
        }
    }
}

// Verifica os arquivos da raiz tambem
for (const file of ['handler.js', 'index.js', 'settings.js']) {
    const full = path.join(ROOT, file)
    if (!fs.existsSync(full)) continue
    verificados++
    const text = fs.readFileSync(full).toString('utf8')
    if (text.includes('\uFFFD')) {
        listaProblemas.push(`${file}: U+FFFD detectado (mojibake)`)
    }
    if (temEmojiPerdido(text)) {
        listaProblemas.push(`${file}: emoji perdido`)
    }
}

listaProblemas.forEach(p => console.log(`  [X] ${p}`))

console.log(`\n  Arquivos verificados: ${verificados}`)
if (listaProblemas.length === 0) {
    console.log('  [OK] Todos os arquivos estao com encoding UTF-8 integro')
} else {
    problemas = listaProblemas.length
    console.log(`  [X] ${problemas} problema(s) de encoding encontrados`)
}
console.log('='.repeat(60) + '\n')

process.exit(problemas === 0 ? 0 : 1)
