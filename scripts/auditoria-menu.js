/**
 * Script de auditoria do MENU: compara os comandos que aparecem
 * nos menus do Minato (menus.txt) com os comandos registrados
 * no Gótica.
 *
 * O "menus.txt" do Minato é a lista oficial de comandos principais
 * (aqueles que aparecem para o usuário final nos menus). Este script
 * mostra quais ainda faltam no Gótica.
 *
 * Uso: node scripts/auditoria-menu.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const PLUGINS = path.join(ROOT, 'plugins')

const MINATO_ROOT = path.join(process.env.USERPROFILE || '', 'Desktop', 'minato-bot')
const MENUS_MINATO = [
    path.join(MINATO_ROOT, 'src', 'dados', 'settings', 'textos', 'menus.txt'),
    path.join(MINATO_ROOT, 'src', 'dados', 'settings', 'textos', 'menus-padrao.txt')
]

/**
 * Comandos registrados pelos plugins do Gótica (runtime real).
 * Inclui comandos literais (string/array) e comandos em RegExp,
 * que são lidos estaticamente do código-fonte.
 */
async function getGoticaCommands() {
    const map = new Map()
    const files = fs.readdirSync(PLUGINS).filter(f => f.endsWith('.js'))

    for (const file of files) {
        const full = path.join(PLUGINS, file)
        let source = ''
        try {
            source = fs.readFileSync(full, 'utf-8')
        } catch (e) { }

        // handler.command = /^(ping|p)$/i
        const regexMatch = source.match(/handler\.command\s*=\s*\/\^?([^/\n]*?)\$?\/[gimsuy]*/)
        if (regexMatch) {
            const cmds = regexMatch[1].match(/[a-z0-9_\-]+/gi) || []
            for (const c of cmds) {
                const cmd = c.trim().toLowerCase()
                if (!cmd) continue
                if (!map.has(cmd)) map.set(cmd, [])
                if (!map.get(cmd).includes(file)) map.get(cmd).push(file)
            }
        }

        try {
            const mod = await import(pathToFileURL(full).href)
            const plugin = mod.default || mod
            const cmds = plugin?.command
            const list = Array.isArray(cmds) ? cmds
                : (cmds instanceof RegExp ? [] : (typeof cmds === 'string' ? [cmds] : []))
            for (const c of list) {
                const cmd = String(c).trim().toLowerCase()
                if (!cmd) continue
                if (!map.has(cmd)) map.set(cmd, [])
                if (!map.get(cmd).includes(file)) map.get(cmd).push(file)
            }
        } catch (e) {
            // plugin com dependência ausente - ignora silenciosamente
        }
    }

    return map
}

/** Comandos citados nos menus do Minato. */
function getMinatoMenuCommands() {
    const set = new Set()

    for (const file of MENUS_MINATO) {
        if (!fs.existsSync(file)) continue
        const content = fs.readFileSync(file, 'utf-8')
        for (const m of content.matchAll(/\{prefix\}([A-Za-z0-9_\-]+)/g)) {
            set.add(m[1].trim().toLowerCase())
        }
    }

    return [...set].sort()
}

const gotica = await getGoticaCommands()
const menuCmds = getMinatoMenuCommands()

const ok = []
const falta = []

for (const cmd of menuCmds) {
    if (gotica.has(cmd)) ok.push(cmd)
    else falta.push(cmd)
}

const pct = ((ok.length / menuCmds.length) * 100).toFixed(1)

console.log('='.repeat(60))
console.log('GÓTICA — AUDITORIA DOS COMANDOS DO MENU DO MINATO')
console.log('='.repeat(60))
console.log(`Comandos de menu no Minato : ${menuCmds.length}`)
console.log(`Já cobertos pelo Gótica    : ${ok.length}  (${pct}%)`)
console.log(`Faltando                   : ${falta.length}`)
console.log('='.repeat(60))

if (falta.length) {
    console.log('\n📋 FALTANDO:')
    for (let i = 0; i < falta.length; i += 6) {
        console.log('   ' + falta.slice(i, i + 6).join(', '))
    }
}

const out = path.join(ROOT, 'scripts', 'relatorio-menu.json')
fs.writeFileSync(out, JSON.stringify({
    totalMenuMinato: menuCmds.length,
    cobertos: ok.length,
    faltando: falta.length,
    ok,
    falta
}, null, 2), 'utf-8')
console.log(`\n💾 Relatório salvo em ${out}`)

process.exit(0)
