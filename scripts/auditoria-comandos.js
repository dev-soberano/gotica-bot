/**
 * Script de auditoria: lista todos os comandos registrados no Gótica
 * e compara com a lista de comandos do Minato, marcando quais já
 * existem (para não duplicar) e quais ainda faltam.
 *
 * Uso: node scripts/auditoria-comandos.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const PLUGINS = path.join(ROOT, 'plugins')

/**
 * Extrai todos os comandos registrados pelos plugins do Gótica.
 * Usa análise estática (regex) sobre o código, o que também captura
 * listas construídas dinamicamente via `handler.command = [...]` onde
 * os itens são literais.
 */
function getGoticaCommands() {
    const map = new Map() // comando -> [plugins]
    const files = fs.readdirSync(PLUGINS).filter(f => f.endsWith('.js'))

    for (const file of files) {
        const content = fs.readFileSync(path.join(PLUGINS, file), 'utf-8')
        // handler.command = ['a', 'b']  |  handler.command = 'x'
        const arrMatch = content.match(/handler\.command\s*=\s*\[([\s\S]*?)\]/m)
        if (arrMatch) {
            const cmds = arrMatch[1].match(/'([^']+)'|"([^"]+)"/g) || []
            for (const c of cmds) {
                const cmd = c.slice(1, -1).trim().toLowerCase()
                if (!cmd) continue
                if (!map.has(cmd)) map.set(cmd, [])
                map.get(cmd).push(file)
            }
        }
        const strMatch = content.match(/handler\.command\s*=\s*'([^']+)'/)
        if (strMatch) {
            const cmd = strMatch[1].trim().toLowerCase()
            if (!map.has(cmd)) map.set(cmd, [])
            map.get(cmd).push(file)
        }
    }

    return map
}

/**
 * Carrega os plugins de verdade (import dinâmico) para pegar os
 * comandos montados dinamicamente em runtime (ex: listas geradas por
 * loops sobre um objeto de categorias).
 */
async function getGoticaCommandsRuntime() {
    const map = new Map()
    const files = fs.readdirSync(PLUGINS).filter(f => f.endsWith('.js'))

    for (const file of files) {
        try {
            const mod = await import(pathToFileURL(path.join(PLUGINS, file)).href)
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

/** Lê a lista de comandos do Minato. */
function getMinatoCommands() {
    const minato = path.join(process.env.USERPROFILE || '', 'Desktop', 'minato-bot', 'index.js')
    if (!fs.existsSync(minato)) return []
    const content = fs.readFileSync(minato, 'utf-8')
    const matches = content.matchAll(/^\s*case\s+'([^']*)'\s*:/gm)
    return [...new Set([...matches].map(m => m[1].trim().toLowerCase()))]
}

const gotica = await getGoticaCommandsRuntime()
const minato = getMinatoCommands()

const jaExiste = []
const falta = []

for (const cmd of minato) {
    if (!cmd || cmd === '?') continue
    if (gotica.has(cmd)) jaExiste.push(cmd)
    else falta.push(cmd)
}

console.log('='.repeat(60))
console.log(`GÓTICA  — ${gotica.size} comandos registrados em ${fs.readdirSync(PLUGINS).filter(f => f.endsWith('.js')).length} plugins`)
console.log(`MINATO  — ${minato.length} comandos`)
console.log('='.repeat(60))
console.log(`\n✅ Já existem no Gótica: ${jaExiste.length}`)
console.log(`❌ Faltam portar:         ${falta.length}`)
// Agrupa os que faltam por prefixo para facilitar a portabilidade
const grupos = {}
for (const cmd of falta) {
    let key = 'outros'
    const prefixes = ['play', 'yt', 'fig', 'logo', 'menu', 'dono', 'ant', 'group', 'admin', 'owner',
        'level', 'rank', 'coin', 'aposta', 'casino', 'pix', 'vip', 'mod', 'cmd', 'pdf', 'img', 'tt', 'ttp']
    for (const p of prefixes) {
        if (cmd.startsWith(p)) { key = p; break }
    }
    ; (grupos[key] ||= []).push(cmd)
}

console.log('\n📋 FALTANTES POR GRUPO:')
for (const [k, v] of Object.entries(grupos).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n  [${k}] (${v.length}): ${v.slice(0, 25).join(', ')}${v.length > 25 ? ' ...' : ''}`)
}

// Salva relatório
const out = path.join(ROOT, 'scripts', 'relatorio-comandos.json')
fs.writeFileSync(out, JSON.stringify({
    totalGotica: gotica.size,
    totalMinato: minato.length,
    jaExiste,
    falta
}, null, 2), 'utf-8')
console.log(`\n💾 Relatório salvo em ${out}`)

// Alguns plugins abrem timers/watchers; encerra explicitamente.
process.exit(0)
