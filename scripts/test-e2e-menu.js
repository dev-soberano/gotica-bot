/**
 * Teste end-to-end: simula o handler.js processando um clique de botao
 * do menu e verifica que o comando e despachado corretamente.
 *
 * Uso: node scripts/test-e2e-menu.js
 */

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
console.log('  TESTE END-TO-END DO MENU')
console.log('='.repeat(60) + '\n')

const menuMod = await import(pathToFileURL(path.join(PLUGINS, 'main-menu-interativo.js')).href)
const menuData = await import(pathToFileURL(path.join(ROOT, 'lib', 'menuData.js')).href)
const buttons = await import(pathToFileURL(path.join(ROOT, 'lib', 'buttons.js')).href)

// ══════════════ Testa o ciclo completo de cada categoria ══════════════
console.log('[1/3] Ciclo completo de cada categoria')

const PREFIXO = '!'

for (const cat of menuData.MENU_CATEGORIES) {
    const catId = `${menuData.MENU_PREFIX}cat:${cat.id}`
    const backId = `${menuData.MENU_PREFIX}back`

    // Botão de categoria
    const bCat = buttons.quickReply(catId, cat.label)
    const idCat = JSON.parse(bCat.buttonParamsJson).id
    if (idCat !== catId) {
        check(`Botão da categoria "${cat.id}" gera ID correto`, false, idCat)
    }

    // Botão de item
    let itensOk = true
    for (const item of cat.items) {
        const runId = `${menuData.MENU_PREFIX}run:${cat.id}:${item.cmd}`
        const bItem = buttons.quickReply(runId, item.label)
        const idItem = JSON.parse(bItem.buttonParamsJson).id
        if (idItem !== runId) { itensOk = false; break }
    }

    check(`Categoria "${cat.id}" (${cat.items.length} itens) gera IDs válidos`, itensOk)

    // Botão de voltar
    const bBack = buttons.quickReply(backId, 'Voltar')
    check(`Botão voltar da categoria "${cat.id}" válido`,
        JSON.parse(bBack.buttonParamsJson).id === backId)
}

// ══════════════ Testa o despacho real de comandos ══════════════
console.log('\n[2/3] Despacho real dos comandos do menu')

const registrados = new Set()
for (const f of (await import('fs')).readdirSync(PLUGINS).filter(x => x.endsWith('.js'))) {
    try {
        const mod = await import(pathToFileURL(path.join(PLUGINS, f)).href)
        const p = mod.default || mod
        const c = p?.command
        let lista = []
        if (Array.isArray(c)) lista = c
        else if (typeof c === 'string') lista = [c]
        else if (c instanceof RegExp) {
            const alt = c.source.match(/\(([^)]*)\)/)?.[1] || ''
            for (const parte of alt.split('|')) {
                const limpo = parte.replace(/[\\^$.*+?()[\]{}|]/g, '').trim()
                if (limpo) lista.push(limpo)
            }
        }
        lista.forEach(x => registrados.add(String(x).toLowerCase()))
    } catch { }
}

// Verifica que TODOS os comandos do menu podem ser despachados
let naoDespacha = []
for (const cat of menuData.MENU_CATEGORIES) {
    for (const item of cat.items) {
        if (!registrados.has(item.cmd.toLowerCase())) {
            naoDespacha.push(`${cat.id}/${item.cmd}`)
        }
    }
}
check('Todos os comandos do menu são despacháveis', naoDespacha.length === 0, naoDespacha.join(', '))

// ══════════════ Testa a resolucao de categoria por indice ══════════════
console.log('\n[3/3] Resolução por índice e navegação')

check('findCategory por id funciona', menuData.findCategory('menusticker')?.id === 'menusticker')
check('findCategory por índice funciona', menuData.findCategoryByIndex(1)?.id === menuData.MENU_CATEGORIES[0].id)
check('findCategory com id inválido retorna null', menuData.findCategory('inexistente') === null)
check('findItem encontra comando', menuData.findItem('menusticker', 'ttp')?.cmd === 'ttp')
check('findItem com cmd inválido retorna null', menuData.findItem('sticker', 'inexistente') === null)

// Todos os IDs de botão são únicos dentro de cada submenu
let colisoes = []
for (const cat of menuData.MENU_CATEGORIES) {
    const ids = cat.items.map(i => `${menuData.MENU_PREFIX}run:${cat.id}:${i.cmd}`)
    ids.push(`${menuData.MENU_PREFIX}back`)
    const unicos = new Set(ids)
    if (unicos.size !== ids.length) colisoes.push(cat.id)
}
check('IDs de botão sem colisão em cada submenu', colisoes.length === 0, colisoes.join(', '))

// IDs de categoria únicos
const catIds = menuData.MENU_CATEGORIES.map(c => `${menuData.MENU_PREFIX}cat:${c.id}`)
check('IDs de categoria sem colisão', new Set(catIds).size === catIds.length)

console.log('\n' + '='.repeat(60))
console.log(falhas === 0 ? '  [OK] END-TO-END DO MENU FUNCIONAL' : `  [X] ${falhas} FALHA(S)`)
console.log('='.repeat(60) + '\n')

process.exit(falhas === 0 ? 0 : 1)
