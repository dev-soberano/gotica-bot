/**
 * Teste do painel de donos: valida o formato do !dono e do !meusdados.
 *
 * Uso: node scripts/test-donos.js
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
console.log('  TESTE DO PAINEL DE DONOS')
console.log('='.repeat(60) + '\n')

global.author = 'Dev Soberano'
global.packname = 'Gótica Bot'
global.owner = [['+556391096656', 'Soberano', true]]

const mod = await import(pathToFileURL(path.join(ROOT, 'plugins', 'info-dono.js')).href)
const handler = mod.default

check('Plugin carrega', !!handler)
check('Registra !dono', handler.command.includes('dono'))
check('Registra !meusdados', handler.command.includes('meusdados'))

/** Captura a resposta (texto). */
let resposta = null
/** Captura a mídia enviada. */
let midia = null

const m = {
    sender: '556391096656@s.whatsapp.net',
    senderLid: '93691188363501@lid',
    pushName: 'Đev Šoberano ×͜×',
    chat: '5511999999999@s.whatsapp.net',
    isGroup: false,
    react: async () => { },
    reply: async (t) => { resposta = t }
}

/** Mock da conexão. */
const conn = {
    getName: () => 'Đev Šoberano ×͜×',
    store: { contacts: {} },
    user: { id: '5511999999999@s.whatsapp.net' },
    waUploadToServer: async () => ({ mediaUrl: 'https://example.com/media', directPath: '/media' }),
    sendMessage: async (jid, content) => { midia = content }
}

// ══════════════ !dono ══════════════
console.log('\n[1/4] Formato do !dono')

await handler(m, { conn, command: 'dono' })

check('!dono enviou mídia', !!midia, 'nenhuma mídia enviada')
check('Mídia tem legenda (caption)', !!midia?.caption)
check('Mídia tem vídeo ou imagem',
    !!(midia?.video || midia?.videoMessage || midia?.image || midia?.imageMessage),
    Object.keys(midia || {}).join(','))

const t = midia?.caption || resposta || ''
if (t) {
    console.log('\n' + t.split('\n').map(l => '  | ' + l).join('\n') + '\n')

    check('Moldura superior com 🏰', t.includes('╭━━━━━〔 🏰 〕━━━━━╮'))
    check('Título "PAINEL DOS DONOS"', t.includes('*𝐏𝐀𝐈𝐍𝐄𝐋 𝐃𝐎𝐒 𝐃𝐎𝐍𝐎𝐒*'))
    check('Divisor superior', t.includes('┣ ━━━━━━━━━━━━━━━╯'))
    check('Divisor do bloco 👑', t.includes('┣━━━〔 👑 〕━━━'))
    check('Usa barra de dados ┃', t.includes('┃'))
    check('Linha "Dono Principal"', t.includes('🤴 *Dono Principal:*'))
    check('Linha "Número"', t.includes('☎ *Número:*'))
    check('Mostra Dono 1', t.includes('*Dono 1:*'))
    check('Mostra Dono 2', t.includes('*Dono 2:*'))
    check('Mostra Dono 3', t.includes('*Dono 3:*'))
    check('Mostra Dono 4', t.includes('*Dono 4:*'))
    check('Mostra Dono 5', t.includes('*Dono 5:*'))
    check('Mostra Dono 6', t.includes('*Dono 6:*'))
    check('Moldura inferior', t.includes('╰━━━━━━━━━━━━╯'))
    check('Rodapé com "Gótica Bot"', t.includes('Gótica Bot'))
    check('Rodapé com o nome do bot', t.includes('☾⋆༺'))

    // O número do principal é o dono1
    const principal = t.match(/☎ \*Número:\* (\S+)/)?.[1]
    check('Número do principal correto', principal === '+556391096656', principal)

    // Donos 1-4 preenchidos (conforme o owners.json), 5-6 vazios
    const d1 = t.match(/\*Dono 1:\* 「([^」]*)」/)?.[1]
    const d2 = t.match(/\*Dono 2:\* 「([^」]*)」/)?.[1]
    const d4 = t.match(/\*Dono 4:\* 「([^」]*)」/)?.[1]
    const d5 = t.match(/\*Dono 5:\* 「([^」]*)」/)?.[1]
    const d6 = t.match(/\*Dono 6:\* 「([^」]*)」/)?.[1]
    check('Dono 1 preenchido', d1 === '556391096656', d1)
    check('Dono 2 preenchido', d2 === '558399162503', d2)
    check('Dono 4 preenchido', d4 === '5518982052655', d4)
    check('Dono 5 vago', d5 === ' . ', `"${d5}"`)
    check('Dono 6 vago', d6 === ' . ', `"${d6}"`)
}

// ══════════════ !meusdados ══════════════
console.log('\n[2/4] Formato do !meusdados')

resposta = null
await handler(m, { conn, command: 'meusdados' })
check('!meusdados respondeu', !!resposta)

if (resposta) {
    const t2 = resposta
    console.log('\n' + t2.split('\n').map(l => '  | ' + l).join('\n') + '\n')

    check('Tem título "Meus dados"', t2.includes('Meus dados'))
    check('Mostra Nome', t2.includes('👤 *Nome:*'))
    check('Mostra Número', t2.includes('📱 *Número:*'))
    check('Mostra Hierarquia', t2.includes('🛡️ *Hierarquia:*'))
    check('Mostra JID', t2.includes('🆔 *JID:*'))
    check('Mostra LID', t2.includes('🔑 *LID:*'))
    check('Número correto', t2.includes('+556391096656'))
    check('JID correto', t2.includes('556391096656@s.whatsapp.net'))
    check('LID correto', t2.includes('93691188363501@lid'))
    check('Hierarquia = dono', t2.includes('dono'))
}

// ══════════════ Hierarquia de outros usuários ══════════════
console.log('\n[3/4] Hierarquia de outros usuários')

resposta = null
await handler({ ...m, sender: '5511999999999@s.whatsapp.net', pushName: 'Comum' }, { conn, command: 'meusdados' })
check('Usuário comum tem hierarquia "usuário"', resposta?.includes('*Hierarquia:* usuário'))

// ══════════════ !dono com donos vazios ══════════════
console.log('\n[4/4] Painel sem donos configurados')

midia = null
const ownersFile = path.join(ROOT, 'src', 'dados', 'owners.json')
const backup = (await import('fs')).readFileSync(ownersFile, 'utf-8')
try {
    ;(await import('fs')).writeFileSync(ownersFile, JSON.stringify({
        donos: ['', '', '', '', '', ''], moderadores: [], vips: [],
        permissoes: {}, gruposDono: {}, bloqueados: []
    }, null, 2), 'utf-8')

    // Recarrega o módulo para pegar o JSON novo
    const mod2 = await import(pathToFileURL(path.join(ROOT, 'plugins', 'info-dono.js')).href + '?v=' + Date.now())
    const h2 = mod2.default

    let cap = null
    const m2 = { ...m, react: async () => { }, reply: async (x) => { cap = x } }
    const conn2 = {
        ...conn,
        sendMessage: async (jid, content) => { cap = content.caption }
    }
    await h2(m2, { conn: conn2, command: 'dono' })

    check('Painel sem donos mostra "." nos slots', (cap || '').includes('「 . 」'), (cap || '').split('\n').slice(9, 12).join(' / '))
    check('Painel sem donos ainda mostra o principal', (cap || '').includes('🤴 *Dono Principal:*'))
} finally {
    ;(await import('fs')).writeFileSync(ownersFile, backup, 'utf-8')
}

console.log('\n' + '='.repeat(60))
console.log(falhas === 0 ? '  [OK] PAINEL DE DONOS 100% FUNCIONAL' : `  [X] ${falhas} FALHA(S)`)
console.log('='.repeat(60) + '\n')

process.exit(falhas === 0 ? 0 : 1)
