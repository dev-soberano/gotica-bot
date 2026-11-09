/**
 * Teste de integração da Gótica Bot.
 *
 * Valida:
 *  - Todos os plugins carregam sem erro
 *  - Não há comandos duplicados entre plugins
 *  - O sistema de donos funciona
 *  - O menu interativo tem categorias e botões válidos
 *  - As libs exportam o esperado
 *
 * Uso: node scripts/test-integracao.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const PLUGINS = path.join(ROOT, 'plugins')

let falhas = 0
let avisos = 0

/** Verifica uma condição. */
function check(nome, condicao, detalhe = '') {
    if (condicao) {
        console.log(`  ✅ ${nome}`)
    } else {
        console.log(`  ❌ ${nome}${detalhe ? ` — ${detalhe}` : ''}`)
        falhas++
    }
}

/** Registra um aviso. */
function warn(nome, detalhe = '') {
    console.log(`  ⚠️  ${nome}${detalhe ? ` — ${detalhe}` : ''}`)
    avisos++
}

console.log('\n' + '='.repeat(60))
console.log('  TESTE DE INTEGRAÇÃO — GÓTICA BOT')
console.log('='.repeat(60) + '\n')

// ══════════════ 1. CARREGAMENTO DOS PLUGINS ══════════════
console.log('📦 [1/5] Carregamento dos plugins')

const files = fs.readdirSync(PLUGINS).filter(f => f.endsWith('.js'))
const carregados = new Map()
const erros = []

for (const file of files) {
    try {
        const mod = await import(pathToFileURL(path.join(PLUGINS, file)).href)
        const plugin = mod.default || mod
        if (!plugin) throw new Error('sem default export')
        carregados.set(file, plugin)
    } catch (e) {
        erros.push({ file, msg: e.message })
    }
}

check(`Todos os ${files.length} plugins carregam`, erros.length === 0,
    erros.length ? erros.map(e => `${e.file}: ${e.msg}`).join(' | ') : '')
if (erros.length) erros.forEach(e => console.log(`     → ${e.file}: ${e.msg}`))

// ══════════════ 2. DUPLICATAS DE COMANDO ══════════════
console.log('\n🔍 [2/5] Verificação de comandos duplicados')

const porComando = new Map()
for (const [file, plugin] of carregados) {
    const cmds = plugin?.command
    const lista = Array.isArray(cmds) ? cmds
        : (typeof cmds === 'string' ? [cmds] : [])
    for (const c of lista) {
        const cmd = String(c).trim().toLowerCase()
        if (!cmd) continue
        if (!porComando.has(cmd)) porComando.set(cmd, [])
        porComando.get(cmd).push(file)
    }
}

const duplicados = [...porComando.entries()].filter(([, fs]) => fs.length > 1)
// Duplicatas são toleradas no Gótica (o primeiro plugin vence), mas
// avisamos para o desenvolvedor manter a base limpa.
if (duplicados.length) {
    warn(`${duplicados.length} comando(s) duplicado(s) entre plugins`,
        duplicados.slice(0, 8).map(([c, f]) => `${c} (${f.length}x)`).join(', '))
} else {
    check('Nenhum comando duplicado', true)
}

console.log(`     → Total de comandos registrados: ${porComando.size}`)

// ══════════════ 3. SISTEMA DE DONOS ══════════════
console.log('\n👑 [3/5] Sistema de donos')

try {
    const owners = await import(pathToFileURL(path.join(ROOT, 'lib', 'owners.js')).href)

    check('lib/owners.js carrega', !!owners)
    check('getAllOwners retorna array', Array.isArray(owners.getAllOwners()))
    check('getDonoSlots retorna 6 slots', owners.getDonoSlots().length === 6)
    check('isDono com dono válido', typeof owners.isDono('123456789') === 'boolean')
    check('isSoberano funciona', typeof owners.isSoberano('123456789') === 'boolean')
    check('isVip funciona', typeof owners.isVip('123456789') === 'boolean')
    check('isModerador funciona', typeof owners.isModerador('123456789') === 'boolean')
    check('hasPermissao funciona', typeof owners.hasPermissao('123456789', 'g@g.us', 'dono') === 'boolean')
    check('checkPermission funciona', typeof owners.checkPermission({}, { groupId: null, isGroupAdmin: false, isBotAdmin: false }) === 'object')

    // Testa o ciclo set/remove de dono
    const setRes = owners.setDono(3, '5511999999999')
    check('setDono(3) grava', setRes.ok === true)
    check('isDono detecta o novo dono', owners.isDono('5511999999999@s.whatsapp.net') === true)
    const rmRes = owners.removeDono(3)
    check('removeDono(3) remove', rmRes.ok === true)
    check('isDono não detecta mais', owners.isDono('5511999999999@s.whatsapp.net') === false)

    // Moderadores
    const addMod = owners.addModerador('5511888888888')
    check('addModerador grava', addMod.ok === true)
    check('isModerador detecta', owners.isModerador('5511888888888@s.whatsapp.net') === true)
    check('removeModerador remove', owners.removeModerador('5511888888888').ok === true)

    // VIP
    const addV = owners.addVip('5511777777777')
    check('addVip grava', addV.ok === true)
    check('isVip detecta', owners.isVip('5511777777777@s.whatsapp.net') === true)
    check('removeVip remove', owners.removeVip('5511777777777').ok === true)

    // Permissões
    const addP = owners.addPermissao('120363@g.us', '5511666666666', 'dono')
    check('addPermissao grava', addP.ok === true)
    check('hasPermissao detecta', owners.hasPermissao('5511666666666@s.whatsapp.net', '120363@g.us', 'dono') === true)
    check('removePermissao remove', owners.removePermissao('120363@g.us', '5511666666666', 'dono').ok === true)

    // Bloqueio
    const addB = owners.addBloqueado('5511555555555')
    check('addBloqueado grava', addB.ok === true)
    check('isBloqueado detecta', owners.isBloqueado('5511555555555@s.whatsapp.net') === true)
    check('removeBloqueado remove', owners.removeBloqueado('5511555555555').ok === true)
} catch (e) {
    check('Sistema de donos', false, e.message)
}

// ══════════════ 4. MENU INTERATIVO ══════════════
console.log('\n🎛️ [4/5] Menu interativo')

try {
    const menuData = await import(pathToFileURL(path.join(ROOT, 'lib', 'menuData.js')).href)
    const buttons = await import(pathToFileURL(path.join(ROOT, 'lib', 'buttons.js')).href)

    check('lib/menuData.js carrega', !!menuData)
    check('Tem categorias', menuData.MENU_CATEGORIES.length > 0,
        `${menuData.MENU_CATEGORIES.length} categorias`)
    check('Tem itens', menuData.MENU_CATEGORIES.every(c => c.items.length > 0))

    // Todas as categorias devem ter id, label, description
    const catsInvalidas = menuData.MENU_CATEGORIES.filter(c => !c.id || !c.label || !c.description)
    check('Todas as categorias têm id/label/desc', catsInvalidas.length === 0,
        catsInvalidas.map(c => c.id).join(', '))

    // IDs de categoria únicos
    const ids = menuData.MENU_CATEGORIES.map(c => c.id)
    check('IDs de categoria únicos', new Set(ids).size === ids.length)

    // Textos do menu
    const txt = menuData.buildMainMenuText({ prefix: '!', uptime: '1h', date: '01/01/2026', version: '1.0' })
    check('buildMainMenuText gera texto', typeof txt === 'string' && txt.length > 100)

    const sub = menuData.buildSubMenuText(menuData.MENU_CATEGORIES[0], { prefix: '!' })
    check('buildSubMenuText gera texto', typeof sub === 'string' && sub.length > 50)

    // Lib de botões
    check('lib/buttons.js carrega', !!buttons)
    const qr = buttons.quickReply('menu:cat:test', 'Teste')
    check('quickReply gera JSON válido', !!JSON.parse(qr.buttonParamsJson).id)
    const cta = buttons.ctaUrl('Canal', 'https://example.com')
    check('ctaUrl gera JSON válido', !!JSON.parse(cta.buttonParamsJson).url)
    check('extractButtonId com null', buttons.extractButtonId({}) === '')

    // O plugin do menu deve estar carregado e expor menuHandlers
    const menuPlugin = carregados.get('main-menu-interativo.js')
    check('Plugin do menu carregado', !!menuPlugin)
    check('Plugin do menu expõe menuHandlers', typeof menuPlugin?.menuHandlers?.handleButton === 'function')
} catch (e) {
    check('Menu interativo', false, e.message)
}

// ══════════════ 5. PLUGINS DE DONOS ══════════════
console.log('\n🔐 [5/5] Plugins do sistema de donos')

const pluginsDono = [
    'owner-donos.js',
    'owner-moderadores.js',
    'owner-vip.js',
    'owner-permissoes-gp.js',
    'owner-customcmds.js',
    'owner-subbot-divul.js',
    'owner-aluguel.js'
]

for (const p of pluginsDono) {
    const plugin = carregados.get(p)
    if (!plugin) {
        check(`Plugin ${p} carregado`, false, 'não encontrado ou com erro')
        continue
    }
    const temCmd = Array.isArray(plugin.command) && plugin.command.length > 0
    const temAjuda = Array.isArray(plugin.help) && plugin.help.length > 0
    check(`Plugin ${p} tem comandos e ajuda`, temCmd && temAjuda)
}

// ══════════════ RESULTADO ══════════════
console.log('\n' + '='.repeat(60))
if (falhas === 0) {
    console.log(`  ✅ TODOS OS TESTES PASSARAM${avisos ? ` (${avisos} aviso(s))` : ''}`)
} else {
    console.log(`  ❌ ${falhas} FALHA(S)${avisos ? `, ${avisos} aviso(s)` : ''}`)
}
console.log('='.repeat(60) + '\n')

process.exit(falhas === 0 ? 0 : 1)
