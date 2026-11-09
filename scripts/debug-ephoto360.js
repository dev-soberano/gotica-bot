/**
 * Depuração passo a passo do fluxo do ephoto360.
 * Uso: node scripts/debug-ephoto360.js <url>
 */
import axios from 'axios'
import cheerio from 'cheerio'

const url = process.argv[2] || 'https://en.ephoto360.com/1917-effect-text-online-518.html'
const dia = String(Date.now()).slice(0, 10)
const COOKIE = [
    `_gid=GA1.2.694836508.${dia}`,
    `__gads=ID=e77077076c5a18dc-223769e4b3cf00de:T=${dia}:RT=${dia}:S=ALNI_MZ54A8a-CdUL0GH7R1OPfiwplOIyQ`,
    `PHPSESSID=1b2hk17njmimvuim3celdji3q3`,
    `_ga=GA1.1.170505887.${dia}`,
    `_ga_SK0KDDQM5P=GS1.1.${dia}.2.1.${dia}.0`
].join('; ')

const H = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.81 Safari/537.36',
    'cookie': COOKIE
}

console.log('1) GET pagina')
const p1 = await axios.get(url, { headers: H, timeout: 20000 })
const $ = cheerio.load(p1.data)
const servidor = $('#build_server').val()
const servidorId = $('#build_server_id').val()
const token = $('#token').val()
console.log('   servidor =', servidor)
console.log('   servidorId =', servidorId)
console.log('   token =', token)

const tipos = []
$('.item-input.select_option_wrapper > label').each((_, el) => {
    const v = $(el).find('input').val()
    if (v) tipos.push(v)
})
console.log('   tipos =', JSON.stringify(tipos))

console.log('2) POST pagina (form)')
const corpo = new URLSearchParams()
corpo.append('autocomplete0', 'abc12345')
tipos.forEach(t => corpo.append('radio0[radio]', t))
corpo.append('text', 'Gotica')
corpo.append('submit', 'GO')
corpo.append('token', token)
corpo.append('build_server', servidor)
corpo.append('build_server_id', String(servidorId))

const p2 = await axios.post(url, corpo.toString(), {
    headers: { ...H, 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 20000
})
const $$ = cheerio.load(p2.data)
const bruto = $$('#form_value_input').val()
console.log('   form_value_input =', bruto ? bruto.slice(0, 200) : '(vazio)')

console.log('3) POST create-image')
const payload = typeof bruto === 'string' ? JSON.parse(bruto) : bruto
const p3 = await axios.post('https://en.ephoto360.com/effect/create-image', payload, {
    headers: { ...H, 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 20000
})
console.log('   tipo =', typeof p3.data)
console.log('   dados =', JSON.stringify(p3.data).slice(0, 400))
console.log('   imagem final =', servidor + (p3.data?.image || '(sem image)'))

process.exit(0)
