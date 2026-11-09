/**
 * Mostra a estrutura do formulário de uma página de efeito.
 * Uso: node scripts/inspecionar-efeito.js <url>
 */
import axios from 'axios'
import cheerio from 'cheerio'

const url = process.argv[2]
const dia = String(Date.now()).slice(0, 10)
const H = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.81 Safari/537.36',
    'cookie': `_gid=GA1.2.1.${dia}; PHPSESSID=1b2hk17njmimvuim3celdji3q3; _ga=GA1.1.1.${dia}`
}

const r = await axios.get(url, { headers: H })
const $ = cheerio.load(r.data)

console.log('=== ' + url)
console.log('forms: ' + $('form').length + ' | textarea: ' + $('textarea').length)

$('input').each((_, el) => {
    const id = $(el).attr('id')
    const name = $(el).attr('name')
    const type = $(el).attr('type')
    const val = $(el).attr('value')
    if (id || name) console.log(`  input id=${id} name=${name} type=${type} value=${String(val).slice(0, 50)}`)
})

$('textarea').each((_, el) => {
    console.log(`  textarea id=${$(el).attr('id')} name=${$(el).attr('name')}`)
})

$('form').each((_, el) => {
    console.log(`  form id=${$(el).attr('id')} action=${$(el).attr('action')} method=${$(el).attr('method')}`)
})

process.exit(0)
