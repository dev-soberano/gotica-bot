/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha / ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — AUTO-STICKER (com padrão visual exato)
 */

import fs from 'fs'
import path from 'path'
import { sticker } from '../lib/sticker.js'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const DB_DIR = path.join(process.cwd(), 'src', 'database', 'grupos')

function buildInteractiveNodes(chatId) {
    const nodes = [
        {
            tag: 'biz',
            attrs: {},
            content: [
                {
                    tag: 'interactive',
                    attrs: { type: 'native_flow', v: '1' },
                    content: [
                        { tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }
                    ]
                }
            ]
        }
    ]
    if (!chatId.endsWith('@g.us')) {
        nodes.push({ tag: 'bot', attrs: { biz_bot: '1' } })
    }
    return nodes
}

async function sendComBotao(conn, chatId, texto, quoted) {
    const interactiveMessage = {
        body: { text: texto },
        nativeFlowMessage: {
            buttons: [
                {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                        display_text: "✦ 💋 𝗖𝗔𝗡𝗔𝗟 𝗚𝗢𝗧𝗜𝗖𝗔 ✦",
                        url: global.canal || "https://whatsapp.com/channel/0029Vb8SRN5CcW4sYg65Tp2K"
                    })
                }
            ]
        }
    }

    try {
        const msgi = generateWAMessageFromContent(chatId, { interactiveMessage }, { userJid: conn.user.id, quoted })
        await conn.relayMessage(chatId, msgi.message, {
            messageId: msgi.key.id,
            additionalNodes: buildInteractiveNodes(chatId)
        })
    } catch (e) {
        await conn.sendMessage(chatId, { text: texto }, { quoted }).catch(() => {})
    }
}

function readGroupConfig(groupJid) {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
    const cleanFrom = groupJid.split('@')[0] + '@g.us'
    const p = path.join(DB_DIR, `${cleanFrom}.json`)
    if (fs.existsSync(p)) {
        try {
            const raw = fs.readFileSync(p, 'utf-8')
            const parsed = raw ? JSON.parse(raw) : []
            const arr = Array.isArray(parsed) ? parsed : [parsed]
            return arr[0] || {}
        } catch (e) {
            return {}
        }
    }
    return {}
}

function writeGroupConfig(groupJid, data) {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
    const cleanFrom = groupJid.split('@')[0] + '@g.us'
    const p = path.join(DB_DIR, `${cleanFrom}.json`)
    fs.writeFileSync(p, JSON.stringify([data], null, 2))
}

let cmdHandler = async (m, { conn, args, isAdmin, isOwner }) => {
    if (!m.isGroup) return m.reply('❌ Esse comando só funciona em grupos!')
    if (!isAdmin && !isOwner) return m.reply('❌ Apenas administradores podem configurar o autosticker!')

    const cfg = readGroupConfig(m.chat)
    const ativoAtual = !!(cfg.autosticker || cfg.autofigurinha || cfg.autofig || cfg.autofigu)

    if (!args[0]) {
        const texto =
            `\`🤖 AUTO-STICKER\`\n\n` +
            `_Status atual:_ ${ativoAtual ? '*ATIVADO* ✅' : '*DESATIVADO* ❌'}\n\n` +
            `_Pra ligar/desligar:_\n> *!autosticker on* \n> *!autosticker off*`
        return sendComBotao(conn, m.chat, texto, m)
    }

    if (/^on$/i.test(args[0])) {
        cfg.autosticker = true
        cfg.autofigurinha = true
        cfg.autofig = true
        cfg.autofigu = true
        writeGroupConfig(m.chat, cfg)
        const texto =
            `\`🤖 AUTO-STICKER\`\n\n` +
            `> ✅ Função *ATIVADA* com sucesso!\n\n_Envie fotos ou vídeos para gerar figurinhas automaticamente._`
        return sendComBotao(conn, m.chat, texto, m)
    }

    if (/^off$/i.test(args[0])) {
        cfg.autosticker = false
        cfg.autofigurinha = false
        cfg.autofig = false
        cfg.autofigu = false
        writeGroupConfig(m.chat, cfg)
        const texto =
            `\`🤖 AUTO-STICKER\`\n\n` +
            `> 🔕 Função *DESATIVADA* com sucesso!`
        return sendComBotao(conn, m.chat, texto, m)
    }

    const textoErro = `\`🤖 AUTO-STICKER\`\n\n> ❌ _Use:_ *!autosticker on* | *!autosticker off*`
    return sendComBotao(conn, m.chat, textoErro, m)
}

cmdHandler.help = ['autosticker', 'autofigurinha', 'autofig', 'autofigu']
cmdHandler.tags = ['admin']
cmdHandler.command = /^(autosticker|autofigurinha|autofig|autofigu)$/i
cmdHandler.group = true
cmdHandler.admin = true

cmdHandler.before = async function (m, { conn }) {
    try {
        if (!m.isGroup) return
        if (m.key?.fromMe) return

        const cfg = readGroupConfig(m.chat)
        const isAutoActive = !!(cfg.autosticker || cfg.autofigurinha || cfg.autofig || cfg.autofigu)
        if (!isAutoActive) return

        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''

        if (/webp/i.test(mime)) return
        if (!/image|video/g.test(mime)) return

        if (/video/g.test(mime)) {
            if ((q.msg || q).seconds > 10) return 
        }

        let img = await q.download?.()
        if (!img) return

        let packname = m.pushName || 'Soberano'
        let author = 'Gótica Bot 💋'

        await m.react('⏳')
        let stiker = await sticker(img, false, packname, author)

        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
            await m.react('✅')
        }
    } catch (e) {
        console.error('[AUTOSTICKER ERROR]:', e)
        await m.react('❌').catch(() => {})
    }
}

export default cmdHandler