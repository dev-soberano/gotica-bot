/**
 * Teste funcional do menu interativo (lista nativa) e do despacho.
 *
 * Simula o clique nas opções da lista e verifica que:
 *  - O menu principal usa lista nativa (single_select) + botão de canal
 *  - O clique em "menu:cat:<id>" abre o submenu
 *  - O clique em "menu:run:<cat>:<cmd>" reescreve m.text
 *  - O clique em "menu:cmd:<cmd>" reescreve m.text
 *  - O clique em "menu:back" volta ao menu principal
 *  - Todos os comandos referenciados nos menus existem em plugins
 *
 * Uso: node scripts/test-menu.js
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

/**
 * Coleta todos os comandos registrados pelos plugins.
 */
async function coletarComandos() {
    const comandos = new Set()
    const falhas = []
    const arquivos = fs.readdirSync(PLUGINS).filter(x => x.endsWith('.js'))

    for (const arquivo of arquivos) {
        try {
            const mod = await import(pathToFileURL(path.join(PLUGINS, arquivo)).href)
            const plugin = mod.default || mod
            const cmd = plugin?.command

            let lista = []
            if (Array.isArray(cmd)) {
                lista = cmd
            } else if (typeof cmd === 'string') {
                lista = [cmd]
            } else if (cmd instanceof RegExp) {
                const alt = cmd.source.match(/\(([^)]*)\)/)?.[1] || ''
                for (const parte of alt.split('|')) {
                    const limpo = parte.replace(/[\\^$.*+?()[\]{}|]/g, '').trim()
                    if (limpo) lista.push(limpo)
                }
            }

            for (const item of lista) {
                comandos.add(String(item).toLowerCase())
            }
        } catch (e) {
            falhas.push(`${arquivo}: ${e.message}`)
        }
    }

    return { comandos, falhas }
}

console.log('\n' + '='.repeat(60))
console.log('  TESTE DO MENU INTERATIVO (LISTA NATIVA)')
console.log('='.repeat(60) + '\n')

// ══════════════ Carrega o plugin do menu ══════════════
const menuMod = await import(pathToFileURL(path.join(PLUGINS, 'main-menu-interativo.js')).href)
const menuPlugin = menuMod.default
const menuHandlers = menuPlugin?.menuHandlers

check('Plugin do menu carrega', !!menuPlugin)
check('menuHandlers exposto', typeof menuHandlers?.handleButton === 'function')

const buttons = await import(pathToFileURL(path.join(ROOT, 'lib', 'buttons.js')).href)
const menuData = await import(pathToFileURL(path.join(ROOT, 'lib', 'menuData.js')).href)

check('MENU_PREFIX e "menu:"', menuData.MENU_PREFIX === 'menu:')

// ══════════════ Mock de mensagem/conexão ══════════════
function mockM() {
    return {
        chat: '5511999999999@s.whatsapp.net',
        sender: '5511888888888@s.whatsapp.net',
        text: '',
        isGroup: false,
        fromMe: false,
        pushName: 'Teste',
        key: {
            remoteJid: '5511999999999@s.whatsapp.net',
            fromMe: false,
            id: 'TESTKEY123',
            participant: '5511888888888@s.whatsapp.net'
        },
        message: { conversation: '' },
        react: async () => { },
        reply: async () => { },
        quoted: null
    }
}

let enviado = null
const connMock = {
    user: { id: '5511999999999@s.whatsapp.net' },
    waUploadToServer: async () => ({ mediaUrl: 'https://example.com/media', directPath: '/media' }),
    relayMessage: async (jid, msg, opts) => { enviado = { jid, msg, opts } },
    sendMessage: async (jid, msg) => { enviado = { jid, msg } },
    groupInviteCode: async () => 'ABC123'
}

// ══════════════ [1/4] Estrutura da lista nativa ══════════════
console.log('\n[1/4] Estrutura da lista nativa')

const m1 = mockM()
const handled1 = await menuHandlers.handleButton(connMock, m1, `${menuData.MENU_PREFIX}cat:menusticker`, '!')
check('Clique em categoria retorna handled=true', handled1 === true)
check('Clique em categoria enviou uma mensagem', !!enviado)

const botoes = enviado?.msg?.interactiveMessage?.nativeFlowMessage?.buttons || []
check('Menu tem 2 botões (lista + canal)', botoes.length === 2, `${botoes.length}`)
check('Primeiro botão é single_select (lista nativa)', botoes[0]?.name === 'single_select', botoes[0]?.name)
check('Segundo botão é cta_url (canal)', botoes[1]?.name === 'cta_url', botoes[1]?.name)

// Valida o JSON da lista
let listaMenu = null
try {
    listaMenu = JSON.parse(botoes[0].buttonParamsJson)
} catch (e) {
    check('buttonParamsJson é JSON válido', false, e.message)
}
check('Lista tem título', !!listaMenu?.title, listaMenu?.title)
check('Lista tem seções', Array.isArray(listaMenu?.sections) && listaMenu.sections.length > 0)

// Cada seção tem rows com header/title/description/id
let rowsOk = true
let totalRows = 0
for (const sec of listaMenu.sections || []) {
    if (!sec.title || !Array.isArray(sec.rows)) { rowsOk = false; break }
    for (const row of sec.rows) {
        totalRows++
        if (!row.id || !row.title || !row.description || !row.header) { rowsOk = false; break }
    }
}
check('Todas as rows têm id/title/description/header', rowsOk)
check('Lista tem linhas suficientes', totalRows >= 10, `${totalRows} linhas`)

// O texto do submenu mostra só o nome da categoria + nº de comandos
const bodyText = enviado?.msg?.interactiveMessage?.body?.text || ''
check('Texto do submenu NÃO tem opções numeradas', !/\n\s*\d+\.\s/.test(bodyText))
check('Texto do submenu tem o nome da categoria', bodyText.includes('MENU STICKERS'))
check('Texto do submenu informa a quantidade de comandos', bodyText.includes('COMANDOS DISPONÍVEIS'))

// Abre o menu PRINCIPAL e valida o texto dele
enviado = null
const mMain = mockM()
await menuHandlers.handleButton(connMock, mMain, `${menuData.MENU_PREFIX}back`, '!')
const mainText = enviado?.msg?.interactiveMessage?.body?.text || ''
check('Texto do menu principal NÃO tem opções numeradas', !/\n\s*\d+\.\s/.test(mainText))
check('Texto do menu principal NÃO tem lista de categorias', !mainText.includes('MENU STICKERS'))
check('Texto do menu principal tem "Prefixo"', mainText.includes('*Prefixo:*'))
check('Texto do menu principal tem "Ativa:"', mainText.includes('*Ativa:*'))
check('Texto do menu principal tem "Bot:"', mainText.includes('*Bot:*'))
check('Texto do menu principal tem "Dono:"', mainText.includes('*Dono:*'))
check('Texto do menu principal tem "VIP:"', mainText.includes('*VIP:*'))
check('Texto do menu principal tem "Cargo:"', mainText.includes('*Cargo:*'))
check('Texto do menu principal tem "Comandos:"', mainText.includes('*Comandos:*'))
check('Texto do menu principal usa a moldura Gótica', mainText.includes('┏━━'))
check('Texto do menu principal usa a barra ❈', mainText.includes('❈'))
check('Texto do menu principal NÃO tem moldura longa', !mainText.includes('─' + '─'.repeat(15)))

// ══════════════ [2/4] Fluxo das opções ══════════════
console.log('\n[2/4] Fluxo das opções')

// Verifica o clique em um item do submenu
const itemSticker = menuData.findItem('menusticker', 'ttp')
check('Item TTP encontrado no sticker', !!itemSticker)

const m2 = mockM()
const handled2 = await menuHandlers.handleButton(connMock, m2, `${menuData.MENU_PREFIX}run:menusticker:ttp`, '!')
check('Clique em item retorna handled=false (reprocessa)', handled2 === false)
check('Clique em item reescreve m.text', m2.text === '!ttp', `m.text = ${m2.text}`)

// Clique em cmd direto (seção Infos)
const m3 = mockM()
const handled3 = await menuHandlers.handleButton(connMock, m3, `${menuData.MENU_PREFIX}cmd:ping`, '!')
check('Clique em cmd direto reescreve m.text', m3.text === '!ping', `m.text = ${m3.text}`)

// Clique em voltar
enviado = null
const m4 = mockM()
const handled4 = await menuHandlers.handleButton(connMock, m4, `${menuData.MENU_PREFIX}back`, '!')
check('Clique em voltar retorna handled=true', handled4 === true)
check('Clique em voltar enviou o menu principal', !!enviado)
const b2 = enviado?.msg?.interactiveMessage?.nativeFlowMessage?.buttons || []
check('Menu principal tem 2 botões', b2.length === 2, `${b2.length}`)

// ID desconhecido
enviado = null
const m5 = mockM()
const handled5 = await menuHandlers.handleButton(connMock, m5, 'menu:desconhecido', '!')
check('ID desconhecido retorna handled=false', handled5 === false)

// ══════════════ [3/4] Extração de IDs ══════════════
console.log('\n[3/4] Extração de IDs do clique')

const rawList = {
    listResponseMessage: {
        singleSelectReply: { selectedRowId: `${menuData.MENU_PREFIX}cat:menusticker` }
    }
}
check('extractButtonId extrai o ID da lista', buttons.extractButtonId(rawList) === `${menuData.MENU_PREFIX}cat:menusticker`)
check('extractButtonId em mensagem vazia retorna ""', buttons.extractButtonId({}) === '')

// ══════════════ [4/4] Coerência dos menus ══════════════
console.log('\n[4/4] Coerência entre menu e plugins')

const coletado = await coletarComandos()
const comandos = coletado.comandos
const falhasCarga = coletado.falhas

check('Todos os plugins de comando carregam', falhasCarga.length === 0, falhasCarga.slice(0, 5).join(', '))
console.log(`     -> ${comandos.size} comandos registrados`)

// Todos os comandos do menu principal
const faltando = []
for (const cat of menuData.MENU_CATEGORIES) {
    for (const item of cat.items) {
        if (!comandos.has(String(item.cmd).toLowerCase())) {
            faltando.push(`${cat.id}/${item.cmd}`)
        }
    }
}
check('Todos os comandos do menu principal existem', faltando.length === 0, faltando.join(', '))

// Todos os comandos dos menus secundários e adm/dono
const menusExtra = ['main-menus-secundarios.js', 'main-menus-adm-dono.js']
const faltandoExtra = []
for (const arquivo of menusExtra) {
    const src = fs.readFileSync(path.join(PLUGINS, arquivo), 'utf-8')
    for (const m of src.matchAll(/cmd:\s*'([^']+)'/g)) {
        if (!comandos.has(m[1].toLowerCase())) faltandoExtra.push(`${arquivo}/${m[1]}`)
    }
}
check('Todos os comandos dos menus extras existem', faltandoExtra.length === 0, faltandoExtra.join(', '))

// IDs únicos
let colisoes = []
for (const cat of menuData.MENU_CATEGORIES) {
    const ids = cat.items.map(i => `${menuData.MENU_PREFIX}run:${cat.id}:${i.cmd}`)
    ids.push(`${menuData.MENU_PREFIX}back`)
    if (new Set(ids).size !== ids.length) colisoes.push(cat.id)
}
check('IDs de opção sem colisão', colisoes.length === 0, colisoes.join(', '))

console.log('\n' + '='.repeat(60))
if (falhas === 0) {
    console.log('  [OK] MENU INTERATIVO 100% FUNCIONAL')
} else {
    console.log(`  [X] ${falhas} FALHA(S)`)
}
console.log('='.repeat(60) + '\n')

process.exit(falhas === 0 ? 0 : 1)
