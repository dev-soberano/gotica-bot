/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha / ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — Comando de Figurinha com Botão Nativo
 */

import { sticker } from '../lib/sticker.js'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

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

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let stiker = false
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''
        
        let packname = m.pushName || 'Soberano' 
        let author = 'Gótica Bot 💋'

        if (/webp|image|video/g.test(mime)) {
            if (/video/g.test(mime)) {
                if ((q.msg || q).seconds > 10) return m.reply('⭐ *Erro:* O vídeo deve ter no máximo 10 segundos! 💋')
            }

            await m.react('⏳')
            let img = await q.download?.()
            if (!img) return m.reply('⭐ *Erro:* Não consegui baixar a mídia. 💋')

            stiker = await sticker(img, false, packname, author)
            
        } else if (args[0] && /https?:\/\//.test(args[0])) {
            await m.react('⏳')
            stiker = await sticker(false, args[0], packname, author)
            
        } else {
            const textoHey = `🚫 *Hey!*\n\n> Marque uma foto ou vídeo com *${usedPrefix + command}* para criar sua figurinha. 💋`
            return sendComBotao(conn, m.chat, textoHey, m)
        }

        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
            await m.react('✅')
        } else {
            throw new Error('Falha na conversão')
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
        if (m.chat) {
            const textoErro = `⭐ *Ops!* Ocorreu um erro. Tente novamente! 💋`
            await sendComBotao(conn, m.chat, textoErro, m)
        }
    }
}

handler.help = ['sticker', 's', 'figurinha']
handler.tags = ['sticker']
handler.command = /^(s|sticker|figurinha)$/i
handler.register = false

export default handler