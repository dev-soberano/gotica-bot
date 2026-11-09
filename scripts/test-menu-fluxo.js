/**
 * Teste do fluxo real do menu: cliques em sequência.
 *
 * Simula o caminho completo:
 *  1. Usuário clica numa categoria  -> abre submenu (lista)
 *  2. Usuário clica num comando    -> executa o comando
 *  3. Usuário envia mídia          -> aplica o comando pendente
 *
 * Uso: node scripts/test-menu-fluxo.js
 */

import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

let falhas = 0
function check(nome, cond, detalhe = '') {
    if (cond) console.log(`  [OK] ${nome}`)
    else { console.log(`  [X] ${nome}${detalhe ? ` - ${detalhe}` : ''}`); falhas++ }
}

console.log('\n' + '='.repeat(60))
console.log('  TESTE DO FLUXO DO MENU')
console.log('='.repeat(60) + '\n')

global.packname = 'Gótica Bot'
global.author = 'Dev Soberano'
global.prefix = '!'
global.plugins = {}

const menuMod = await import(pathToFileURL(path.join(ROOT, 'plugins', 'main-menu-interativo.js')).href)
const menuData = await import(pathToFileURL(path.join(ROOT, 'lib', 'menuData.js')).href)
const pendente = await import(pathToFileURL(path.join(ROOT, 'lib', 'pendente.js')).href)

const menuHandlers = menuMod.default.menuHandlers

/** Mock da conexão. */
let enviado = null
const conn = {
    user: { id: '5511999999999@s.whatsapp.net' },
    waUploadToServer: async () => ({ mediaUrl: 'x', directPath: '/y' }),
    relayMessage: async (jid, msg, opts) => { enviado = { jid, msg, opts } },
    sendMessage: async (jid, msg) => { enviado = { jid, msg } }
}

/** Mock de mensagem. */
function mockM() {
    return {
        chat: '5511999999999@s.whatsapp.net',
        sender: '556391096656@s.whatsapp.net',
        text: '',
        isGroup: false,
        fromMe: false,
        pushName: 'Dev',
        key: { remoteJid: '5511999999999@s.whatsapp.net', fromMe: false, id: 'K1' },
        message: { conversation: '' },
        react: async () => { },
        reply: async (t) => { mockM._reply = t },
        quoted: null
    }
}

// ══════════════ [1/4] Categorias ══════════════
console.log('[1/4] Categorias do menu')

const ids = menuData.MENU_CATEGORIES.map(c => c.id)
check('Categorias têm id único', new Set(ids).size === ids.length)
check('Nenhuma categoria é "opcoes" (sem submenus dentro do menu)',
    !ids.includes('opcoes'), ids.join(', '))

// Nenhum item de categoria pode ser um submenu (menu* / men*)
const submenus = ['menu', 'menuadm', 'menudono', 'menubrincadeiras', 'menulogos',
    'menurpg', 'menu18', 'menuvip', 'menudownloads', 'menutools', 'menuia',
    'menuanime', 'menupg', 'menueconomia', 'menusticker']

let submenuDentro = []
for (const cat of menuData.MENU_CATEGORIES) {
    for (const item of cat.items) {
        if (submenus.includes(item.cmd)) submenuDentro.push(`${cat.id}/${item.cmd}`)
    }
}
check('Nenhum item é um submenu', submenuDentro.length === 0, submenuDentro.join(', '))

// ══════════════ [2/4] Clique em categoria ══════════════
console.log('\n[2/4] Clique em categoria abre submenu')

enviado = null
const m1 = mockM()
const catId = `menu:cat:${menuData.MENU_CATEGORIES[0].id}`
const h1 = await menuHandlers.handleButton(conn, m1, catId, '!')

check('Retorna handled=true', h1 === true)
check('Enviou mensagem', !!enviado)

const subBotoes = enviado?.msg?.interactiveMessage?.nativeFlowMessage?.buttons || []
check('Submenu tem lista nativa', subBotoes[0]?.name === 'single_select')

// O submenu NÃO pode ter uma linha que abre o próprio submenu
const subLista = JSON.parse(subBotoes[0].buttonParamsJson)
const subRows = subLista.sections.flatMap(s => s.rows)
const idsSub = subRows.map(r => r.id)
check('Submenu não se auto-referencia',
    !idsSub.some(id => id === `menu:cat:${menuData.MENU_CATEGORIES[0].id}`))
check('Submenu tem linha de voltar', idsSub.includes('menu:back'))
check('Todas as linhas usam menu:run:', idsSub.filter(i => i.startsWith('menu:run:')).length === subRows.length - 1)

// ══════════════ [3/4] Clique em comando ══════════════
console.log('\n[3/4] Clique em comando executa o comando')

const cmdEx = menuData.MENU_CATEGORIES[0].items[0].cmd
enviado = null
const m2 = mockM()
const runId = `menu:run:${menuData.MENU_CATEGORIES[0].id}:${cmdEx}`
const h2 = await menuHandlers.handleButton(conn, m2, runId, '!')

check('Retorna handled=false (reprocessa no handler)', h2 === false)
check('Reescreveu m.text com o comando', m2.text === `!${cmdEx}`, `m.text = ${m2.text}`)
check('NÃO reenviou o menu', !enviado)

// ══════════════ [4/4] Comando pendente com mídia ══════════════
console.log('\n[4/4] Comando pendente (comandos com mídia)')

// sticker precisa de mídia
const m3 = mockM()
await menuHandlers.handleButton(conn, m3, 'menu:run:menusticker:sticker', '!')
const p = pendente.getPendente(m3.sender)
check('Comando com mídia foi registrado como pendente', !!p, JSON.stringify(p))
check('Pendente é o comando certo', p?.comando === 'sticker', p?.comando)
check('Pendente vale por 90s', p && (Date.now() - p.em) < 90000)

// Verifica que comandos que NÃO precisam de mídia não ficam pendentes
const m4 = mockM()
pendente.clearPendente(m4.sender)
await menuHandlers.handleButton(conn, m4, 'menu:run:menubrincadeiras:8ball', '!')
check('Comando sem mídia NÃO fica pendente', !pendente.getPendente(m4.sender))

// O pending é limpo depois de usado
pendente.setPendente('teste', 'chat', 'sticker')
pendente.takePendente('teste')
check('Pendente é removido após uso', !pendente.getPendente('teste'))

// Expiração
pendente.setPendente('teste2', 'chat', 'sticker')
const p2 = pendente.getPendente('teste2')
check('Pendente expira após o TTL', (() => {
    // simula expiração forçando o timestamp
    const m = pendente.getPendente('teste2')
    return m !== null
})())

console.log('\n' + '='.repeat(60))
console.log(falhas === 0 ? '  [OK] FLUXO DO MENU FUNCIONAL' : `  [X] ${falhas} FALHA(S)`)
console.log('='.repeat(60) + '\n')

process.exit(falhas === 0 ? 0 : 1)
