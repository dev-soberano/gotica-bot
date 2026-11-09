/**
 * Prévia visual dos menus da Gótica Bot.
 *
 * Uso: node scripts/preview-menu.js
 */

import { pathToFileURL } from 'url'
import path from 'path'

const ROOT = process.cwd()

const menuData = await import(pathToFileURL(path.join(ROOT, 'lib', 'menuData.js')).href)
const molduras = await import(pathToFileURL(path.join(ROOT, 'lib', 'molduras.js')).href)

console.log('\n' + '═'.repeat(46))
console.log('  MENU PRINCIPAL')
console.log('═'.repeat(46) + '\n')

console.log(menuData.buildMainMenuText({
    prefix: '!',
    uptime: '1h 23m',
    date: '30/10/2026',
    version: '2.0.4',
    botName: 'Gótica Bot',
    owner: 'Leandro Rocha',
    numero: '556391096656',
    cargo: 'dono principal',
    vip: 'SIM',
    velocidade: '0.001s',
    total: 1490
}))

console.log('\n\n' + '═'.repeat(46))
console.log('  SUBMENU (exemplo)')
console.log('═'.repeat(46) + '\n')

const cat = menuData.findCategory('menusticker')
console.log(menuData.buildSubMenuText(cat, { prefix: '!' }))

console.log('\n\n' + '═'.repeat(46))
console.log('  PAINEL DE DONOS')
console.log('═'.repeat(46) + '\n')

console.log(molduras.painelDonos({
    nome: 'Soberano',
    numero: '556391096656',
    donos: [
        { slot: 1, valor: '556391096656' },
        { slot: 2, valor: '558399162503' },
        { slot: 3, valor: ' . ' },
        { slot: 4, valor: '5518982052655' },
        { slot: 5, valor: ' . ' },
        { slot: 6, valor: ' . ' }
    ],
    bot: 'Gótica Bot'
}))

console.log('\n\n' + '═'.repeat(46))
console.log('  LISTA DE OPÇÕES (o que aparece no botão)')
console.log('═'.repeat(46) + '\n')

const bot = 'Gótica Bot'
const rowsMenus = menuData.MENU_CATEGORIES.map(cat => ({
    header: `${cat.emoji} • ${cat.label.toUpperCase()}`,
    title: cat.description,
    description: bot,
    id: `menu:cat:${cat.id}`
}))

console.log('  ✦ 𝗔𝗣𝗖𝗢𝗘𝗌 ✦')
console.log('  ┌─ ⭑ 𝑴𝑬𝑵𝑼𝑺 ─────────────────────────')
for (const r of rowsMenus) {
    console.log(`  │`)
    console.log(`  │  ${r.header}`)
    console.log(`  │  ${r.title}`)
    console.log(`  │  ${r.description}`)
}
console.log('  └────────────────────────────────────────')

console.log('\n')
process.exit(0)
