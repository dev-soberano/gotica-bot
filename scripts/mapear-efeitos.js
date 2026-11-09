/**
 * Atribui cada efeito do ephoto360 a um comando amigável.
 *
 * Lê a lista de URLs coletada pelo `descobrir-efeitos.js`, busca o
 * título de cada página e casa com as palavras-chave pedidas no
 * comando. Gera o mapa `nomeDoComando -> url` para o plugin de logos.
 *
 * Uso: node scripts/mapear-efeitos.js
 */
import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36'
}

const urlFile = path.join(process.cwd(), 'tmp', 'efeitos-ephoto360.json')
const urls = JSON.parse(fs.readFileSync(urlFile, 'utf-8'))

/** Palavras-chave por comando (todas precisam bater no título). */
const ALVOS = {
    '1917': ['1917'],
    '3druby': ['ruby'],
    'advancedglow': ['glow'],
    'blackpinklogo': ['blackpink'],
    'blood': ['blood'],
    'cartoon': ['cartoon'],
    'cemetery': ['cemetery'],
    'clouds': ['cloud'],
    'darkgreen': ['dark green', 'darkgreen'],
    'deleting': ['delet'],
    'dragonball': ['dragon ball', 'dragonball'],
    'effectclouds': ['cloud'],
    'flag': ['flag'],
    'flag3d': ['flag'],
    'freecreate': ['free create'],
    'frozen': ['frozen', 'ice'],
    'galaxy': ['galaxy'],
    'galaxywallpaper': ['galaxy'],
    'glitch': ['glitch'],
    'glowing': ['glow'],
    'gradient': ['gradient'],
    'halloween': ['halloween'],
    'horror': ['horror'],
    'joker': ['joker'],
    'ligatures': ['ligature'],
    'lighteffects': ['light effect'],
    'luxurygold': ['luxury', 'gold'],
    'makingneon': ['neon'],
    'metal3d': ['metal'],
    'multicoloredneon': ['multi color', 'multicolor'],
    'neondevil': ['devil'],
    'neonglitch': ['neon glitch', 'glitch neon'],
    'papercut': ['paper cut', 'papercut'],
    'pixelglitch': ['pixel glitch', 'glitch pixel'],
    'royal': ['royal'],
    'sandsummer': ['sand'],
    'summerbeach': ['summer', 'beach'],
    'sunset': ['sunset'],
    'typography': ['typography'],
    'underwater': ['underwater', 'under water'],
    'watercolor': ['water color', 'watercolor'],
    'wooden3d': ['wooden', 'wood']
}

/** Baixa o título de uma página de efeito. */
async function titulo(url) {
    try {
        const res = await axios.get(url, { headers: HEADERS, timeout: 15000 })
        const $ = cheerio.load(res.data)
        const h1 = $('h1').first().text().trim()
        const title = (h1 || $('title').text().trim()).replace(/\s+/g, ' ')
        // Valida se a página tem os campos do formulário do ephoto360
        const valido = !!$('#build_server').val() && !!$('#token').val()
        return { titulo: title, valido }
    } catch (e) {
        return { titulo: '', valido: false }
    }
}

// ── Coleta títulos em blocos ──
const infos = []
const LOTE = 10
for (let i = 0; i < urls.length; i += LOTE) {
    const lote = urls.slice(i, i + LOTE)
    const res = await Promise.all(lote.map(async (u) => ({ url: u, ...(await titulo(u)) })))
    infos.push(...res)
    if (i % 100 === 0) console.log('  ' + Math.min(i + LOTE, urls.length) + '/' + urls.length)
}

const validos = infos.filter(i => i.valido && i.titulo)
console.log('\nPáginas válidas: ' + validos.length + '/' + infos.length)

fs.writeFileSync(
    path.join(process.cwd(), 'tmp', 'efeitos-com-titulo.json'),
    JSON.stringify(validos, null, 2), 'utf-8'
)

// ── Casa as palavras-chave ──
const mapa = {}
for (const [comando, chaves] of Object.entries(ALVOS)) {
    const achados = validos.filter(i => chaves.every(c => i.titulo.toLowerCase().includes(c)))
    if (!achados.length) {
        console.log('[sem] ' + comando)
        continue
    }
    // Prefere o título mais curto (nome mais direto)
    achados.sort((a, b) => a.titulo.length - b.titulo.length)
    mapa[comando] = achados[0].url
    console.log('[ok]  ' + comando.padEnd(18) + ' -> ' + achados[0].titulo.slice(0, 55))
}

fs.writeFileSync(
    path.join(process.cwd(), 'tmp', 'mapa-efeitos.json'),
    JSON.stringify(mapa, null, 2), 'utf-8'
)
console.log('\nMapeados: ' + Object.keys(mapa).length + '/' + Object.keys(ALVOS).length)

process.exit(0)
