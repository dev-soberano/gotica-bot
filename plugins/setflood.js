/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — Comando !setflood (ajusta o limite do antiflood)
 *
 * O !antiflood (nable.js) só liga/desliga. Esse comando aqui muda o
 * NÚMERO: quantas mensagens em quantos segundos disparam o ban.
 * Uso: !setflood <msgs> <segundos>   ex: !setflood 5 4
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
        console.error('[SETFLOOD] Erro ao enviar msg com botão, caindo pro texto simples:', e)
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
    if (!isAdmin && !isOwner) return m.reply('❌ Apenas administradores podem configurar o antiflood!')

    const cfg = readGroupConfig(m.chat)
    const limiteAtual = cfg.floodLimite ?? 5
    const janelaAtual = cfg.floodJanela ?? 4

    if (!args[0]) {
        const texto =
            `*🚨 LIMITE DO ANTIFLOOD*\n\n` +
            `_Configuração atual:_\n> *${limiteAtual}* mensagens em *${janelaAtual}s* = ban\n\n` +
            `_Pra mudar:_\n> *!setflood <msgs> <segundos>*\n` +
            `_Exemplo:_ !setflood 5 4`
        return sendComBotao(conn, m.chat, texto, m)
    }

    const novoLimite = parseInt(args[0], 10)
    const novaJanela = parseInt(args[1], 10) || janelaAtual

    if (!novoLimite || novoLimite < 2) {
        return sendComBotao(conn, m.chat, `❌ _Use um limite válido, exemplo:_\n> *!setflood 5 4*`, m)
    }

    cfg.floodLimite = novoLimite
    cfg.floodJanela = novaJanela
    writeGroupConfig(m.chat, cfg)

    return sendComBotao(
        conn,
        m.chat,
        `*🚨 LIMITE DO ANTIFLOOD*\n\n> ✅ Atualizado: *${novoLimite}* mensagens em *${novaJanela}s* = ban.`,
        m
    )
}

handler.help = ['setflood']
handler.tags = ['admin']
handler.command = /^setflood$/i
handler.group = true
handler.admin = true

export default handler