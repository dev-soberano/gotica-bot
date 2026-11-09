/**
 * Roda cada menu com um conector simulado e mede o tamanho do corpo do
 * texto. O WhatsApp corta o texto da mensagem interativa e mostra "ler
 * mais", então este script diz qual menu passa do limite.
 *
 * Uso: node scripts/medir-menus.js
 */

import '../settings.js'
import { pathToFileURL } from 'url'
import path from 'path'

/**
 * Limite do corpo da mensagem interativa antes do WhatsApp cortar.
 * Deixamos folga: testes em aparelho real podem variar.
 */
const LIMITE = 780

const MENUS = [
    ['main-menuadm.js', 'menuadmtexto'],
    ['main-menudono.js', 'menudonotexto'],
    ['main-menu18.js', 'menu18'],
    ['main-menubrincadeiras.js', 'menubrincadeiras'],
    ['main-menus-secundarios.js', 'menupg'],
    ['main-menuprincipal.js', 'comandos']
]

let capturado = null

const connFake = {
    user: { id: '556391096656@s.whatsapp.net' },
    waUploadToServer: async () => ({ url: 'x' }),
    profilePictureUrl: async () => 'https://files.catbox.moe/yyk5xo.jpg',
    relayMessage: async (jid, msg) => {
        capturado = msg
        return {}
    },
    sendMessage: async (jid, conteudo) => {
        // Alguns menus enviam texto simples ou legenda; fica com o maior.
        const t = conteudo?.text || conteudo?.caption || ''
        if (t.length > (capturado?.__len || 0)) {
            capturado = { interactiveMessage: { body: { text: t } }, __len: t.length }
        }
        return {}
    },
    reply: async (jid, text) => {
        if (String(text).length > (capturado?.__len || 0)) {
            capturado = { interactiveMessage: { body: { text } }, __len: String(text).length }
        }
        return {}
    }
}

const mFake = {
    chat: '123@g.us',
    sender: '556391096656@s.whatsapp.net',
    pushName: 'Soberano',
    id: 'ABCDEF123456',
    fromMe: false,
    isGroup: true,
    key: { remoteJid: '123@g.us', fromMe: false, id: 'ABCDEF123456', participant: '556391096656@s.whatsapp.net' },
    message: { conversation: 'oi' },
    participant: '556391096656@s.whatsapp.net',
    mentionedJid: [],
    react: async () => { },
    reply: async (text) => {
        const t = String(text || '')
        if (t.length > (capturado?.__len || 0)) {
            capturado = { interactiveMessage: { body: { text: t } }, __len: t.length }
        }
        return {}
    }
}

for (const [arq, comando] of MENUS) {
    capturado = null
    let plugin
    try {
        const mod = await import(pathToFileURL(path.join(process.cwd(), 'plugins', arq)).href)
        plugin = mod.default || mod
    } catch (e) {
        console.log(`[ERRO] ${arq} não importou: ${e.message}`)
        continue
    }

    try {
        await plugin(mFake, { conn: connFake, usedPrefix: '!', command: comando, isSoberano: true, isOwner: true, isROwner: true })
    } catch (e) {
        console.log(`[ERRO] ${arq} falhou ao rodar: ${e.message}`)
        continue
    }

    const interativo = capturado?.interactiveMessage
        || capturado?.message?.interactiveMessage
        || capturado?.message?.viewOnceMessage?.message?.interactiveMessage
        || capturado?.viewOnceMessage?.message?.interactiveMessage
    const corpo = interativo?.body?.text || ''
    const passa = corpo.length > LIMITE
    console.log(`${passa ? '[CORTA]' : '[ok]   '} ${arq.padEnd(32)} ${String(corpo.length).padStart(5)} chars`)
    if (process.env.VER && corpo) {
        console.log('    >>> ' + corpo.slice(0, 160).replace(/\n/g, ' / '))
    }
}

console.log(`\nLimite considerado: ${LIMITE} caracteres.`)
process.exit(0)
