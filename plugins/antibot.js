/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — Comando !antibot on/off
 */

import fs from 'fs'
import path from 'path'
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
        header: { hasMediaAttachment: false },
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

function getConfigPath(groupJid) {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
    const cleanFrom = groupJid.split('@')[0] + '@g.us'
    return path.join(DB_DIR, `${cleanFrom}.json`)
}

function readGroupConfig(groupJid) {
    const p = getConfigPath(groupJid)
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
    const p = getConfigPath(groupJid)
    fs.writeFileSync(p, JSON.stringify([data], null, 2))
}

let handler = async (m, { conn, args, isAdmin, isOwner }) => {
    if (!m.isGroup) return m.reply('❌ Esse comando só funciona em grupos!')
    if (!isAdmin && !isOwner) return m.reply('❌ Apenas administradores podem configurar o antibot!')

    const cfg = readGroupConfig(m.chat)
    const ativoAtual = cfg.antibot === true

    if (!args[0]) {
        const texto =
            `*🤖 ANTIBOT*\n\n` +
            `_Status atual:_ ${ativoAtual ? '*ATIVADO* ✅' : '*DESATIVADO* ❌'}\n\n` +
            `_Pra ligar/desligar:_\n> *!antibot on* \n> *!antibot off*`
        return sendComBotao(conn, m.chat, texto, m)
    }

    if (/^on$/i.test(args[0])) {
        if (ativoAtual) {
            return sendComBotao(conn, m.chat, `*🤖 ANTIBOT*\n\n> _Opa!_ Essa função *já está ATIVADA* ✅`, m)
        }
        cfg.antibot = true
        writeGroupConfig(m.chat, cfg)
        return sendComBotao(conn, m.chat, `*🤖 ANTIBOT*\n\n> ✅ Função *ATIVADA* com sucesso!\n\n_Bots não-administradores serão removidos automaticamente._`, m)
    }

    if (/^off$/i.test(args[0])) {
        if (!ativoAtual) {
            return sendComBotao(conn, m.chat, `*🤖 ANTIBOT*\n\n> _Opa!_ Essa função *já está DESATIVADA* ❌`, m)
        }
        cfg.antibot = false
        writeGroupConfig(m.chat, cfg)
        return sendComBotao(conn, m.chat, `*🤖 ANTIBOT*\n\n> 🔕 Função *DESATIVADA* com sucesso!`, m)
    }

    return sendComBotao(conn, m.chat, `❌ _Use:_ *!antibot on* | *!antibot off*`, m)
}

handler.help = ['antibot']
handler.tags = ['admin']
handler.command = /^antibot$/i
handler.group = true
handler.admin = true

export default handler