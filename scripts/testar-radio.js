/**
 * Testa as variações (radio) de um efeito até achar uma que funcione.
 * Uso: node scripts/testar-radio.js <url>
 */
import axios from 'axios'
import cheerio from 'cheerio'

const url = process.argv[2]
const dia = String(Date.now()).slice(0, 10)
const H = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.81 Safari/537.36',
    'cookie': `_gid=GA1.2.1.${dia}; PHPSESSID=1b2hk17njmimvuim3celdji3q3; _ga=GA1.1.1.${dia}`
}

async function tentar(semRadio) {
    const p1 = await axios.get(url, { headers: H })
    const $ = cheerio.load(p1.data)
    const servidor = $('#build_server').val()
    const servidorId = $('#build_server_id').val()
    const token = $('#token').val()

    const tipos = []
    $('input[name="radio0[radio]"]').each((_, el) => tipos.push($(el).attr('value')))

    const corpo = new URLSearchParams()
    corpo.append('autocomplete0', 'abc12345')
    if (!semRadio && tipos.length) corpo.append('radio0[radio]', tipos[0])
    corpo.append('text', 'Gotica')
    corpo.append('submit', 'GO')
    corpo.append('token', token)
    corpo.append('build_server', servidor)
    corpo.append('build_server_id', String(servidorId))

    const p2 = await axios.post(url, corpo.toString(), {
        headers: { ...H, 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    const $$ = cheerio.load(p2.data)
    const bruto = $$('#form_value_input').val()
    if (!bruto) return { ok: false, motivo: 'sem form_value_input' }

    const payload = typeof bruto === 'string' ? JSON.parse(bruto) : bruto
    const p3 = await axios.post('https://en.ephoto360.com/effect/create-image', payload, {
        headers: { ...H, 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    const dados = typeof p3.data === 'string' ? JSON.parse(p3.data) : p3.data
    return { ok: !!dados?.image, url: servidor + (dados?.image || ''), info: dados?.info }
}

console.log('Variações encontradas: ' + (await (async () => {
    const p1 = await axios.get(url, { headers: H })
    const $ = cheerio.load(p1.data)
    let n = 0
    $('input[name="radio0[radio]"]').each(() => n++)
    return n
})()))

for (let i = 0; i < 6; i++) {
    try {
        const r = await tentar(false)
        console.log(`  tentativa ${i}: ${r.ok ? 'OK ' + r.url : 'falhou (' + r.motivo + ' ' + (r.info || '') + ')'}`)
    } catch (e) {
        console.log(`  tentativa ${i}: erro ${e.message}`)
    }
}

process.exit(0)
