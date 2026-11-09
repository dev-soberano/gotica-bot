/**
 * Teste de boot: simula o carregamento de plugins exatamente como o
 * index.js faz, e verifica que todos carregam sem erro.
 *
 * Uso: node scripts/test-boot.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const PLUGINS = path.join(ROOT, 'plugins')

let falhas = 0
function check(nome, cond, detalhe = '') {
    if (cond) console.log(`  [OK] ${nome}`)
    else { console.log(`  [X] ${nome}${detalhe ? ` - ${detalhe}` : ''}`); falhas++ }
}

console.log('\n' + '='.repeat(60))
console.log('  TESTE DE BOOT (CARREGAMENTO DE PLUGINS)')
console.log('='.repeat(60) + '\n')

const global = {
    plugins: {},
    prefix: '!',
    packname: 'Gótica Bot',
    author: 'Leandro Rocha',
    canal: 'https://whatsapp.com/channel/0029Vb8SRN5CcW4sYg65Tp2K',
    vs: '2.0.4',
    db: { data: { users: {}, chats: {} } }
}
globalThis.global = global

// Carrega as settings (define global.owner)
await import(pathToFileURL(path.join(ROOT, 'settings.js')).href)

const arquivos = fs.readdirSync(PLUGINS).filter(f => f.endsWith('.js'))
const erros = []
let carregados = 0
let comComando = 0

for (const filename of arquivos) {
    const file = path.join(PLUGINS, filename)
    try {
        const fileUrl = pathToFileURL(file).href
        const module = await import(fileUrl + '?update=' + Date.now())
        global.plugins[filename] = module.default || module
        carregados++
        const cmd = global.plugins[filename]?.command
        if (Array.isArray(cmd) && cmd.length) comComando++
    } catch (e) {
        erros.push(`${filename}: ${e.message}`)
    }
}

check(`Todos os ${arquivos.length} plugins carregam`, erros.length === 0)
if (erros.length) erros.forEach(e => console.log(`     -> ${e}`))
check(`Todos os ${carregados} plugins estao em global.plugins`, Object.keys(global.plugins).length === arquivos.length)
check('Plugins com comando registrado', comComando > 200, `${comComando} com comando`)

// Verifica comandos duplicados
const porComando = new Map()
for (const [file, plugin] of Object.entries(global.plugins)) {
    const c = plugin?.command
    const list = Array.isArray(c) ? c : (typeof c === 'string' ? [c] : [])
    for (const x of list) {
        const k = String(x).toLowerCase()
        if (!porComando.has(k)) porComando.set(k, [])
        porComando.get(k).push(file)
    }
}
const dups = [...porComando.entries()].filter(([, f]) => f.length > 1)
console.log(`     -> ${porComando.size} comandos unicos, ${dups.length} duplicado(s)`)
if (dups.length) {
    console.log(`     -> duplicados: ${dups.slice(0, 10).map(([c, f]) => `${c}(${f.length})`).join(', ')}`)
}

// Verifica os plugins do novo sistema
const PLUGINS_NOVOS = [
    'main-menu-interativo.js', 'owner-donos.js', 'owner-moderadores.js',
    'owner-vip.js', 'owner-permissoes-gp.js', 'owner-customcmds.js',
    'owner-subbot-divul.js', 'owner-aluguel.js'
]
for (const p of PLUGINS_NOVOS) {
    check(`Plugin ${p} carregado`, !!global.plugins[p])
}

// O menu precisa expor menuHandlers para o handler.js
check('main-menu-interativo expõe menuHandlers',
    typeof global.plugins['main-menu-interativo.js']?.menuHandlers?.handleButton === 'function')

// O handler.js deve conseguir importar as libs
try {
    const owners = await import(pathToFileURL(path.join(ROOT, 'lib', 'owners.js')).href)
    check('lib/owners.js importável', typeof owners.isDono === 'function')
    check('Donos do settings.js reconhecidos', owners.isDono('556391096656@s.whatsapp.net') === true)
    check('isSoberano reconhece o dono principal', owners.isSoberano('556391096656@s.whatsapp.net') === true)
} catch (e) {
    check('lib/owners.js importável', false, e.message)
}

try {
    const helpers = await import(pathToFileURL(path.join(ROOT, 'lib', 'helpers-minato.js')).href)
    check('lib/helpers-minato.js importável', typeof helpers.getUserLevel === 'function')
} catch (e) {
    check('lib/helpers-minato.js importável', false, e.message)
}

console.log('\n' + '='.repeat(60))
if (falhas === 0) {
    console.log('  [OK] BOOT CONCLUIDO COM SUCESSO')
} else {
    console.log(`  [X] ${falhas} FALHA(S)`)
}
console.log('='.repeat(60) + '\n')

process.exit(falhas === 0 ? 0 : 1)
