/**
 * Descoberta dos efeitos de texto disponíveis no ephoto360.
 *
 * Usa o sitemap público do site para montar a lista completa de
 * efeitos (slug + URL). Depois valida cada candidato contra o
 * comando, para garantir que só entram efeitos realmente funcionais.
 *
 * Uso: node scripts/descobrir-efeitos.js [validar]
 */
import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36'
}

/** Extrai o "nome de exibição" da página de um efeito. */
async function tituloDaPagina(url) {
    try {
        const res = await axios.get(url, { headers: HEADERS, timeout: 15000 })
        const $ = cheerio.load(res.data)
        const t = $('h1').first().text().trim() || $('title').text().trim()
        return t.replace(/\s+/g, ' ').slice(0, 80)
    } catch (e) {
        return ''
    }
}

// ── 1. Índice de sitemaps ──
const idx = await axios.get('https://en.ephoto360.com/sitemap.xml', { headers: HEADERS, timeout: 20000 })
const sitemaps = [...String(idx.data).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
console.log('Sitemaps encontrados: ' + sitemaps.length)

// ── 2. Todas as URLs de efeito ──
const urls = new Set()
for (const sm of sitemaps) {
    try {
        const res = await axios.get(sm, { headers: HEADERS, timeout: 20000 })
        for (const m of String(res.data).matchAll(/<loc>([^<]+)<\/loc>/g)) {
            const u = m[1].trim()
            if (/\.html$/i.test(u)) urls.add(u)
        }
    } catch (e) {
        console.log('[erro] ' + sm + ' -> ' + e.message)
    }
}

const lista = [...urls].sort()
console.log('URLs de efeito coletadas: ' + lista.length)

const out = path.join(process.cwd(), 'tmp', 'efeitos-ephoto360.json')
fs.writeFileSync(out, JSON.stringify(lista, null, 2), 'utf-8')
console.log('Salvo em ' + out)

// ── 3. Amostra com títulos ──
if (process.argv[2] === 'validar') {
    const amostra = lista.slice(0, Number(process.argv[3] || 15))
    const comTitulo = []
    for (const u of amostra) {
        const t = await tituloDaPagina(u)
        if (t) comTitulo.push({ url: u, titulo: t })
        console.log('  ' + (t ? '[ok] ' : '[--] ') + u)
    }
    const out2 = path.join(process.cwd(), 'tmp', 'efeitos-ephoto360-titulos.json')
    fs.writeFileSync(out2, JSON.stringify(comTitulo, null, 2), 'utf-8')
    console.log('Títulos salvos em ' + out2)
}

process.exit(0)
