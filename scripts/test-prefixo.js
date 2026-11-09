/**
 * Teste do prefixo por grupo.
 *
 * Verifica que:
 *  - !prefixo salva o prefixo no chat do grupo
 *  - o handler usa o prefixo do grupo (nao o global)
 *  - !prefixo reset volta ao global
 *  - multi-prefixo funciona
 *
 * Uso: node scripts/test-prefixo.js
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
console.log('  TESTE DO PREFIXO POR GRUPO')
console.log('='.repeat(60) + '\n')

global.prefix = '!'
global.db = { data: { chats: {}, users: {} } }

const mod = await import(pathToFileURL(path.join(ROOT, 'plugins', 'owner-prefixo.js')).href)
const handler = mod.default

const CHAT = '5511999999999@g.us'
const m = {
    chat: CHAT,
    sender: '556391096656@s.whatsapp.net',
    isGroup: true,
    react: async () => { },
    reply: async (t) => { m._reply = t }
}

// ---------- !prefixo # ----------
console.log('[1/5] Definindo prefixo')
m._reply = null
await handler(m, { conn: {}, text: '#', usedPrefix: '!', command: 'prefixo', isSoberano: true, isAdmin: true })

check('Respondeu ao comando', !!m._reply)
check('Confirmou alteração', (m._reply || '').includes('sucesso') || (m._reply || '').includes('alterado'))
check('Salvou o prefixo no chat do grupo', global.db.data.chats[CHAT]?.prefix === '#',
    JSON.stringify(global.db.data.chats[CHAT]?.prefix))

// ---------- Simula o handler usando o prefixo ----------
console.log('\n[2/5] Handler usando o prefixo do grupo')

/** Simula a lógica de prefixo do handler.js. */
function matchPrefixo(bodyText) {
    const chatDb = global.db.data.chats[CHAT] || {}
    const globalPrefix = global.prefix || '!'
    let _prefix = chatDb.prefix || globalPrefix
    let prefixList = Array.isArray(_prefix) ? _prefix.filter(Boolean) : String(_prefix).split(/\s+/).filter(Boolean)
    if (!prefixList.length) prefixList = [globalPrefix]
    const escaped = prefixList.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const re = new RegExp(`^(?:${escaped.join('|')})`)
    return { match: re.exec(bodyText), prefixList }
}

const r1 = matchPrefixo('#menu')
check('Comando com o prefixo do grupo (#menu) é reconhecido', !!r1.match, 'não casou')
check('Comando com o prefixo ANTIGO (!menu) NÃO é reconhecido', !matchPrefixo('!menu').match, 'casou errado')

// ---------- !prefixo reset ----------
console.log('\n[3/5] Resetando o prefixo')
m._reply = null
await handler(m, { conn: {}, text: 'reset', usedPrefix: '#', command: 'prefixo', isSoberano: true, isAdmin: true })

check('Removeu o prefixo do grupo', !global.db.data.chats[CHAT]?.prefix,
    JSON.stringify(global.db.data.chats[CHAT]?.prefix))
check('Comando com prefixo global (!menu) é reconhecido de novo', !!matchPrefixo('!menu').match)

// ---------- Multi-prefixo ----------
console.log('\n[4/5] Multi-prefixo')
m._reply = null
await handler(m, { conn: {}, text: '! # $', usedPrefix: '!', command: 'prefixo', isSoberano: true, isAdmin: true })

const salvos = global.db.data.chats[CHAT]?.prefix
check('Salvou como array', Array.isArray(salvos), JSON.stringify(salvos))
check('Tem 3 prefixos', Array.isArray(salvos) && salvos.length === 3, JSON.stringify(salvos))
check('!menu funciona', !!matchPrefixo('!menu').match)
check('#menu funciona', !!matchPrefixo('#menu').match)
check('$menu funciona', !!matchPrefixo('$menu').match)
check('Xmenu NÃO funciona', !matchPrefixo('Xmenu').match)

// ---------- !prefixo sem argumento ----------
console.log('\n[5/5] Mostrando o prefixo atual')
m._reply = null
await handler(m, { conn: {}, text: '', usedPrefix: '!', command: 'prefixo', isSoberano: true, isAdmin: true })
check('Mostra o prefixo atual', (m._reply || '').includes('PREFIXO ATUAL'))
check('Lista os 3 prefixos', (m._reply || '').includes('`!`') && (m._reply || '').includes('`#`') && (m._reply || '').includes('`$`'))

console.log('\n' + '='.repeat(60))
console.log(falhas === 0 ? '  [OK] PREFIXO POR GRUPO FUNCIONAL' : `  [X] ${falhas} FALHA(S)`)
console.log('='.repeat(60) + '\n')

process.exit(falhas === 0 ? 0 : 1)
