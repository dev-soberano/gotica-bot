/**
 * Gera lib/menu-categorias.js com os comandos REAIS carregados pelos plugins.
 * Carrega cada plugin como o bot faz; só entra o que foi registrado.
 *
 * Uso: node scripts/gerar-menu-real.js
 */

import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const raiz = process.cwd()
const pastaPlugins = path.join(raiz, 'plugins')
const saida = path.join(raiz, 'lib', 'menu-categorias.js')

/** Categorias pedidas: id, título e emoji. */
const CATEGORIAS = [
    { id: 'geral', titulo: 'GERAL', emoji: '🌙' },
    { id: 'menuadm', titulo: 'MENU ADM', emoji: '🛡️' },
    { id: 'menudono', titulo: 'MENU DONO', emoji: '👑' },
    { id: 'brincadeiras', titulo: 'BRINCADEIRAS', emoji: '🎮' },
    { id: 'menu18', titulo: 'MENU +18', emoji: '🔞' },
    { id: 'protecao', titulo: 'PROTEÇÃO', emoji: '🔒' },
    { id: 'donos', titulo: 'DONOS', emoji: '🤴' }
]

/** Tag do plugin -> categoria. */
const TAG_PARA = {
    main: 'geral', info: 'geral', tools: 'geral', ferramentas: 'geral', util: 'geral',
    buscador: 'geral', buscadores: 'geral', search: 'geral', download: 'geral',
    downloader: 'geral', descargas: 'geral', music: 'geral', sticker: 'geral',
    transformador: 'geral', convertidor: 'geral', edits: 'geral', audio: 'geral',
    ai: 'geral', pix: 'geral', '(sem tag)': 'geral',
    admin: 'menuadm', adm: 'menuadm', group: 'menuadm', grupo: 'menuadm', member: 'menuadm',
    owner: 'menudono', soberano: 'menudono', serbot: 'menudono', nable: 'menudono',
    fun: 'brincadeiras', 'diversão': 'brincadeiras', diversao: 'brincadeiras',
    jogos: 'brincadeiras', game: 'brincadeiras', zueira: 'brincadeiras',
    anime: 'brincadeiras', economia: 'brincadeiras', rpg: 'brincadeiras',
    relacionamento: 'brincadeiras', logos: 'brincadeiras',
    nsfw: 'menu18', '+18': 'menu18', adult: 'menu18'
}

/** Nomes que não são comandos de verdade (menus antigos, testes, lixo). */
const RUIDO = /^menu.+|antigo|texto$|^teste|^test|^x9/

function nomesDoPlugin(plugin) {
    const c = plugin?.command
    if (Array.isArray(c)) return c.filter(v => typeof v === 'string')
    if (typeof c === 'string') return [c]
    return []
}

function categoriaDe(nome, tag) {
    if (/^anti/.test(nome)) return 'protecao'
    if (/dono/.test(nome)) return 'donos'
    return TAG_PARA[tag] || 'geral'
}

const porCategoria = Object.fromEntries(CATEGORIAS.map(c => [c.id, new Map()]))
let carregados = 0
let falhas = 0

for (const arq of fs.readdirSync(pastaPlugins).filter(f => f.endsWith('.js'))) {
    let mod
    try {
        mod = await import(pathToFileURL(path.join(pastaPlugins, arq)).href)
        carregados++
    } catch (e) {
        falhas++
        continue
    }
    const plugin = mod.default || mod
    const src = fs.readFileSync(path.join(pastaPlugins, arq), 'utf-8')
    const tagBloco = src.match(/handler\.tags\s*=\s*\[([^\]]*)\]/)
    const tag = tagBloco ? ([...tagBloco[1].matchAll(/['"]([^'"]+)['"]/g)][0]?.[1] || '(sem tag)') : '(sem tag)'
    const descricoes = Array.isArray(plugin.help) ? plugin.help : []

    for (const nome of nomesDoPlugin(plugin)) {
        const n = nome.toLowerCase()
        if (!/^[a-z0-9_\-+]+$/.test(n) || RUIDO.test(n)) continue
        const cat = categoriaDe(n, tag)
        if (!porCategoria[cat].has(n)) {
            porCategoria[cat].set(n, { cmd: n, label: n, desc: descricoes.find(d => d.startsWith(n)) || '' })
        }
    }
}

const linhas = CATEGORIAS.map(c => {
    const itens = [...porCategoria[c.id].values()].sort((a, b) => a.cmd.localeCompare(b.cmd))
    return {
        id: c.id,
        emoji: c.emoji,
        label: c.titulo,
        // Sem contagem: o usuário não quer ver a quantidade de comandos.
        description: 'Comandos da Gótica.',
        items: itens
    }
})

const texto = `/* Gerado por scripts/gerar-menu-real.js — comandos carregados de verdade. */\n` +
    `export const MENU_CATEGORIAS_REAIS = ${JSON.stringify(linhas, null, 4)}\n`
fs.writeFileSync(saida, texto, 'utf-8')

console.log(`Plugins carregados: ${carregados} | com erro ao carregar: ${falhas}`)
for (const c of linhas) console.log(`${c.label.padEnd(14)} ${c.items.length}`)
console.log(`Arquivo: ${saida}`)
process.exit(0)
