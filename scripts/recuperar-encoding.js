/**
 * Recupera arquivos que passaram por uma decodificação cp1252 indevida
 * (clássico "mojibake"): emojis e acentos UTF-8 viraram sequências como
 * ðŸŒ™. A inversão é: chars -> bytes cp1252 -> texto UTF-8.
 *
 * Uso: node scripts/recuperar-encoding.js <arquivo> [--gravar]
 */

import fs from 'fs'
import path from 'path'

/** Tabela cp1252: código de 0x80 a 0x9F -> code point Unicode. */
const CP1252 = {
    0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E, 0x85: 0x2026,
    0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6, 0x89: 0x2030, 0x8A: 0x0160,
    0x8B: 0x2039, 0x8C: 0x0152, 0x8E: 0x017D, 0x91: 0x2018, 0x92: 0x2019,
    0x93: 0x201C, 0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
    0x98: 0x02DC, 0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A, 0x9C: 0x0153,
    0x9E: 0x017E, 0x9F: 0x0178
}

const PARA_BYTE = new Map(Object.entries(CP1252).map(([b, cp]) => [cp, Number(b)]))

/** Inverte a decodificação cp1252 e devolve o texto UTF-8 original. */
export function recuperar(texto) {
    const bytes = []
    for (const ch of texto) {
        const cp = ch.codePointAt(0)
        if (cp <= 0xFF) {
            bytes.push(cp)
        } else {
            const byte = PARA_BYTE.get(cp)
            if (byte === undefined) throw new Error(`caractere irreversível: U+${cp.toString(16)} (${ch})`)
            bytes.push(byte)
        }
    }
    return Buffer.from(bytes).toString('utf8')
}

/**
 * Detecta mojibake: se o texto, convertido de volta para os bytes cp1252
 * de origem, formar UTF-8 válido e diferente, então ele foi decodificado
 * com a tabela errada. É o caso de emojis e acentos virarem ðŸŒ™.
 */
export function temMojibake(texto) {
    const bytes = []
    for (const ch of texto) {
        const cp = ch.codePointAt(0)
        if (cp <= 0xFF) {
            bytes.push(cp)
        } else {
            const byte = PARA_BYTE.get(cp)
            if (byte === undefined) return false
            bytes.push(byte)
        }
    }
    try {
        const bruto = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.from(bytes))
        return bruto !== texto
    } catch {
        return false
    }
}

const alvo = process.argv[2]

if (alvo === '--varrer') {
    // Varre plugins/ e lib/ procurando arquivos com encoding quebrado.
    const pastas = ['plugins', 'lib']
    let achados = 0
    for (const pasta of pastas) {
        for (const arq of fs.readdirSync(pasta).filter(f => f.endsWith('.js'))) {
            const caminho = path.join(pasta, arq)
            if (temMojibake(fs.readFileSync(caminho, 'utf8'))) {
                console.log(`[QUEBRADO] ${caminho}`)
                achados++
            }
        }
    }
    console.log(achados ? `\n${achados} arquivo(s) com encoding quebrado.` : '\nNenhum arquivo quebrado.')
    process.exit(0)
}

if (alvo) {
    const texto = fs.readFileSync(alvo, 'utf8')
    const quebrado = temMojibake(texto)
    console.log(`Mojibake no arquivo: ${quebrado}`)
    if (!quebrado) {
        console.log('Nada a recuperar.')
        process.exit(0)
    }
    const recuperado = recuperar(texto)
    if (process.argv.includes('--gravar')) {
        fs.writeFileSync(alvo, recuperado, 'utf8')
        console.log(`Mojibake após inverter: ${temMojibake(fs.readFileSync(alvo, 'utf8'))}`)
        console.log(`Gravado: ${alvo}`)
    } else {
        console.log(recuperado.split(/\r?\n/).slice(93, 99).join('\n'))
        console.log('\n(sem --gravar, nada foi alterado)')
    }
}
