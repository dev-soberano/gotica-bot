/**
 * Extrai de uma vez vários blocos `case 'comando':` do index.js do
 * Minato e salva em um arquivo de referência.
 *
 * Uso:
 *   node scripts/extrair-minato.js saida.txt comando1 comando2 ...
 *   node scripts/extrair-minato.js saida.txt --grupo grupo1,grupo2
 */
import fs from 'fs'
import path from 'path'

const ROOT = path.join(process.env.USERPROFILE || '', 'Desktop', 'minato-bot')
const file = path.join(ROOT, 'index.js')

const args = process.argv.slice(2)
const saida = args.shift()
const pedidos = args.flatMap(a => a.split(',').map(s => s.trim().toLowerCase())).filter(Boolean)

const src = fs.readFileSync(file, 'utf-8')
const lines = src.split('\n')

/** Índice de linha de cada `case 'x':` */
const casos = new Map()
lines.forEach((l, i) => {
    const m = l.match(/^\s*case\s+'([^']*)'\s*:/)
    if (m) {
        const chave = m[1].trim().toLowerCase()
        if (!casos.has(chave)) casos.set(chave, i)
    }
})

/** Encontra onde o bloco do caso termina (break ou fecha de chave). */
function fimDoCaso(inicio) {
    let profundidade = 0
    for (let i = inicio; i < lines.length; i++) {
        const l = lines[i]
        for (const ch of l) {
            if (ch === '{') profundidade++
            else if (ch === '}') {
                profundidade--
                if (profundidade < 0) return i
            }
        }
        if (profundidade === 0 && /^\s*break\s*;?\s*$/.test(l)) return i
        if (profundidade === 0 && /^\s*\}\s*$/.test(l)) return i
    }
    return linhas.length - 1
}

const trechos = []
const usados = new Set()

for (const nome of pedidos) {
    if (!casos.has(nome)) {
        trechos.push(`\n\n/* ===== ${nome}: NAO ENCONTRADO ===== */\n`)
        continue
    }
    const inicio = casos.get(nome)
    // Pega o grupo de cases iguais que antecedem este (case a: case b: { })
    let comeco = inicio
    while (comeco > 0 && /^\s*case\s+'[^']*'\s*:\s*$/.test(lines[comeco - 1])) comeco--
    const fim = fimDoCaso(inicio)
    usados.add(nome)
    trechos.push(
        `\n\n/* ===== ${nome} (linhas ${comeco + 1}-${fim + 1}) ===== */\n` +
        lines.slice(comeco, fim + 1).join('\n')
    )
}

const conteudo =
    `/* Referência extraída do Minato — ${pedidos.length} comando(s)\n` +
    `   Gerado por scripts/extrair-minato.js — NÃO EDITE AQUI. */\n` +
    trechos.join('\n')

fs.writeFileSync(saida, conteudo, 'utf-8')
console.log(`Extraído ${pedidos.length} comando(s) -> ${saida}`)
console.log('Encontrados: ' + [...usados].join(', '))
