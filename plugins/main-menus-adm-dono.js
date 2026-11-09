/**
 * @project Gótica Bot - Menu ADM e Menu Dono (lista nativa)
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 *  !menuadm   - comandos de administração (lista nativa)
 *  !menudono - comandos do dono (lista nativa)
 *
 * Reaproveita as categorias do menuData.js - sem duplicar comandos.
 */

import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { findCategory } from '../lib/menuData.js'
import { cabecalhoSubmenu } from '../lib/molduras.js'
import fs from 'fs'
import path from 'path'

const cwd = process.cwd()

/** No `biz` para renderizar a lista nativa. */
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

/** Vídeo aleatório da Gótica. */
function pickRandomVideo() {
    const dir = path.join(cwd, 'src', 'menu')
    try {
        if (!fs.existsSync(dir)) return null
        const files = fs.readdirSync(dir).filter(f => /\.(mp4|mkv|webm)$/i.test(f))
        if (!files.length) return null
        return path.join(dir, files[Math.floor(Math.random() * files.length)])
    } catch {
        return null
    }
}

/** Prepara a mídia do cabeçalho. */
async function prepareVideoMedia(conn) {
    const video = pickRandomVideo()
    try {
        if (video) {
            return await prepareWAMessageMedia(
                { video: fs.readFileSync(video), gifPlayback: true },
                { upload: conn.waUploadToServer }
            )
        }
        return await prepareWAMessageMedia(
            { image: { url: 'https://files.catbox.moe/yyk5xo.jpg' } },
            { upload: conn.waUploadToServer }
        )
    } catch (e) {
        console.error('[MENU-ADM] Erro ao preparar mídia:', e.message)
        return null
    }
}

/**
 * Monta o botão de lista nativa.
 */
function buildList(itens, titulo, emoji, catId) {
    const bot = global.packname || 'Gótica Bot'

    const rows = itens.map(item => ({
        header: `${emoji} • ${item.label.toUpperCase()}`,
        title: item.desc,
        description: bot,
        id: `menu:run:${catId}:${item.cmd}`
    }))

    rows.push({
        header: '🔙 • 𝑽𝒐𝑳𝑻𝒂𝑹',
        title: 'Voltar ao menu principal.',
        description: bot,
        id: 'menu:back'
    })

    return {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
            title: `✦ ${titulo.toUpperCase()} ✦`,
            sections: [
                {
                    title: `⭑ ${emoji} • ${titulo.toUpperCase()}`,
                    rows
                }
            ]
        })
    }
}

const handler = async (m, { conn, args, command, usedPrefix: _p, isSoberano, isAdmin }) => {
    const cmd = (command || '').toLowerCase()

    let catId = ''
    let titulo = ''
    let emoji = ''
    let descricao = ''

    if (cmd === 'menuadm') {
        catId = 'menuadm'
        titulo = 'Menu ADM'
        emoji = '⚙️'
        descricao = 'Comandos de administração.'
    } else if (cmd === 'menudono') {
        if (!isSoberano) {
            await m.react('🚫')
            return m.reply('👑 *Quem você pensa que é?*\n\nEste menu é exclusivo do Dev Soberano Meu Mestre.')
        }
        catId = 'menudono'
        titulo = 'Menu Dono'
        emoji = '👑'
        descricao = 'Comandos restritos do dono.'
    } else {
        return
    }

    const cat = findCategory(catId)
    if (!cat) return m.reply('❌ Categoria não encontrada.')

    try {
        const media = await prepareVideoMedia(conn)

        const txt = cabecalhoSubmenu({
            emoji,
            titulo: titulo.toUpperCase(),
            descricao,
            total: cat.items.length
        })
        const interactiveMessage = {
            contextInfo: { mentionedJid: [m.sender] },
            header: media?.videoMessage
                ? { hasMediaAttachment: true, videoMessage: media.videoMessage }
                : { hasMediaAttachment: true, imageMessage: media?.imageMessage },
            headerType: media?.videoMessage ? 'VIDEO' : 'IMAGE',
            body: { text: txt },
            footer: { text: `✦ ${emoji} ${titulo} ✦` },
            nativeFlowMessage: {
                buttons: [buildList(cat.items, titulo, emoji, catId)],
                messageParamsJson: '{}',
                messageVersion: 1
            }
        }

        const msgi = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid: conn.user.id, quoted: m })
        await conn.relayMessage(m.chat, msgi.message, {
            messageId: msgi.key.id,
            additionalNodes: buildInteractiveNodes(m.chat)
        })
    } catch (e) {
        console.error('[MENU-ADM]', e)
        m.reply('❌ Erro ao gerar o menu.')
    }
}

handler.help = ['menuadm', 'menudono']
handler.tags = ['main', 'menu']
handler.command = ['menuadm', 'adm', 'admin', 'menudono', 'lord', 'master']

export default handler
