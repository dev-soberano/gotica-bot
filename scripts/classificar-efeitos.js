/**
 * Classifica as páginas de efeito do ephoto360 em "texto" ou "foto".
 *
 * Efeito de TEXTO tem o campo `text` no formulário.
 * Efeito de FOTO tem `file_image_input` (precisa de imagem).
 *
 * Só os de texto podem ser usados pelo comando de logo.
 *
 * Uso: node scripts/classificar-efeitos.js
 */
import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

const HEADERS = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.81 Safari/537.36'
}

const urlFile = path.join(process.cwd(), 'tmp', 'efeitos-ephoto360.json')
const urls = JSON.parse(fs.readFileSync(urlFile, 'utf-8'))

async function inspecionar(url) {
    try {
        const res = await axios.get(url, { headers: HEADERS, timeout: 15000 })
        const $ = cheerio.load(res.data)

        const temToken = !!$('#token').val()
        const temServidor = !!$('#build_server').val()
        // Efeito de TEXTO usa campo name="text[]" (input ou textarea)
        // Efeito de FOTO usa <input name="file_image_input">
        const temTexto = $('[name="text[]"]').length > 0
        const temFoto = $('input[name="file_image_input"]').length > 0
        const h1 = $('h1').first().text().trim().replace(/\s+/g, ' ')

        return {
            url,
            titulo: h1,
            tipo: temTexto ? 'texto' : (temFoto ? 'foto' : 'desconhecido'),
            valido: temToken && temServidor
        }
    } catch (e) {
        return { url, titulo: '', tipo: 'erro', valido: false }
    }
}

const resultados = []
const LOTE = 10
for (let i = 0; i < urls.length; i += LOTE) {
    const lote = urls.slice(i, i + LOTE)
    resultados.push(...await Promise.all(lote.map(inspecionar)))
    if (i % 200 === 0) console.log('  ' + Math.min(i + LOTE, urls.length) + '/' + urls.length)
}

const deTexto = resultados.filter(r => r.valido && r.tipo === 'texto')
console.log('\nEfeitos de TEXTO: ' + deTexto.length + '/' + resultados.length)

fs.writeFileSync(
    path.join(process.cwd(), 'tmp', 'efeitos-texto.json'),
    JSON.stringify(deTexto, null, 2), 'utf-8'
)
console.log('Salvo em tmp/efeitos-texto.json')

process.exit(0)
