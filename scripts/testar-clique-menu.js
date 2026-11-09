/**
 * Simula o clique nas categorias do menu principal e confere que o
 * clique vira o comando do menu original daquela categoria.
 *
 * Uso: node scripts/testar-clique-menu.js
 */

import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const raiz = process.cwd()
const pasta = path.join(raiz, 'plugins')

// Carrega os plugins como o bot faz, para o despachante achar os comandos.
global.plugins = {}
const comandos = new Map()
for (const arq of fs.readdirSync(pasta).filter(f => f.endsWith('.js'))) {
    try {
        const mod = await import(pathToFileURL(path.join(pasta, arq)).href)
        const plugin = mod.default || mod
        global.plugins[arq] = plugin
        const c = plugin?.command
        const lista = Array.isArray(c) ? c : typeof c === 'string' ? [c] : []
        for (const nome of lista) {
        const n = nome.toLowerCase()
        // O bot fica com o PRIMEIRO plugin que casa e para, então o mapa
        // guarda só a primeira ocorrência (igual ao handler.js).
        if (!comandos.has(n)) comandos.set(n, arq)
    }
    } catch (e) {
        console.log(`[!] ${arq} não carregou: ${e.message}`)
    }
}

const menuMod = await import(pathToFileURL(path.join(pasta, 'main-menu-interativo.js')).href)
const handler = menuMod.default?.menuHandlers || menuMod.menuHandlers
if (!handler?.handleButton) {
    console.log('[FALHA] menuHandlers não encontrado')
    process.exit(1)
}

const CATEGORIAS = ['geral', 'menuadm', 'menudono', 'brincadeiras', 'menu18', 'protecao', 'donos']
let falhas = 0

for (const cat of CATEGORIAS) {
    const m = { text: '', chat: '123@g.us', sender: '5563@s.whatsapp.net', reply: () => { } }
    const tratado = await handler.handleButton({ }, m, `menu:cat:${cat}`, '!')
    const cmd = (m.text || '').replace(/^!/, '').trim()
    const pluginDoComando = comandos.get(cmd)
    const ok = tratado === false && pluginDoComando
    if (!ok) falhas++
    console.log(`${ok ? '[OK]  ' : '[FALHA]'} ${cat.padEnd(14)} -> ${m.text || '(nada)'}${pluginDoComando ? `  (${pluginDoComando})` : ''}`)
}

console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os cliques viram comandos reais.')
process.exit(falhas ? 1 : 0)
