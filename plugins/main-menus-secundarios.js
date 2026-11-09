/**
 * @project Gótica Bot - Menus Secundários (lista nativa)
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Cada submenu abre uma LISTA NATIVA com os comandos da categoria.
 * As categorias são reaproveitadas do menuData.js - sem duplicar
 * a lista de comandos.
 *
 *  !menuvip       - recursos VIP
 *  !menulogos     - logos e efeitos
 *  !menubrincadeira - brincadeiras
 *  !menubn        - conteúdo +18
 *  !menuia        - inteligência artificial
 *  !menuanime     - anime
 *  !menudownloads - downloads
 *  !menutools     - ferramentas
 *  !menupg        - grupo
 *  !menueconomia  - economia
 */

import { buildSubMenuText, findCategory, MENU_CATEGORIES } from '../lib/menuData.js'
import { ctaUrl } from '../lib/buttons.js'
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'

const cwd = process.cwd()

/** No `biz` exigido pelo WhatsApp para renderizar a lista nativa. */
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

/** Vídeo aleatório da Gótica (src/menu). */
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
        console.error('[MENU2] Erro ao preparar mídia:', e.message)
        return null
    }
}

/**
 * Menus extras. Cada um aponta para uma categoria do menuData.js
 * (reaproveitada, sem duplicar comandos) OU tem itens próprios.
 */
const MENUS = {
    menuvip: {
        cat: null,
        emoji: '💎',
        titulo: 'Menu VIP',
        descricao: 'Recursos exclusivos para assinantes VIP.',
        itens: [
            { cmd: 'checkvip', label: 'Meu VIP', desc: 'Verificar seu status VIP.' },
            { cmd: 'viplist', label: 'Lista de VIPs', desc: 'Quem é VIP.' },
            { cmd: 'consultar_vip', label: 'Consultar VIP', desc: 'Consultar dados de VIP.' },
            { cmd: 'perplexity', label: 'IA Ilimitada', desc: 'Busca com IA sem limite.' },
            { cmd: 'playlist', label: 'Playlists', desc: 'Playlists sem limite.' },
            { cmd: 'text2img', label: 'Text2Img', desc: 'Gere imagens sem limite.' }
        ]
    },
    menuanime: {
        cat: null,
        emoji: '🌸',
        titulo: 'Menu Anime',
        descricao: 'Coisas de anime.',
        itens: [
            { cmd: 'waifu', label: 'Waifu', desc: 'Waifu aleatória.' },
            { cmd: 'figuanime', label: 'FiguAnime', desc: 'Figurinha de anime.' },
            { cmd: 'animes', label: 'Animes', desc: 'Buscar animes.' },
            { cmd: 'animeinfo', label: 'Info Anime', desc: 'Info de anime.' },
            { cmd: 'figuroblox', label: 'Figu Roblox', desc: 'Figurinha Roblox.' },
            { cmd: 'fraseanime', label: 'Frase Anime', desc: 'Frases de anime.' },
            { cmd: 'personagem', label: 'Personagem', desc: 'Personagens de anime.' }
        ]
    },
    menutools: {
        cat: 'menuferramentas',
        emoji: '🛠️',
        titulo: 'Menu Ferramentas',
        descricao: 'Utilidades e conversores.',
        itens: null
    },
    menueconomia: {
        cat: null,
        emoji: '💰',
        titulo: 'Menu Economia',
        descricao: 'Coins, XP e progressão.',
        itens: [
            { cmd: 'trabalhar', label: 'Trabalhar', desc: 'Ganhar coins.' },
            { cmd: 'apostar', label: 'Apostar', desc: 'Apostar coins.' },
            { cmd: 'casino', label: 'Cassino', desc: 'Jogar no cassino.' },
            { cmd: 'slot', label: 'Slot', desc: 'Caça-níquel.' },
            { cmd: 'ruleta', label: 'Roleta', desc: 'Roleta da fortuna.' },
            { cmd: 'roubar', label: 'Roubar', desc: 'Roubar coins.' },
            { cmd: 'loja', label: 'Loja', desc: 'Comprar itens.' },
            { cmd: 'cofre', label: 'Cofre', desc: 'Cofre diário.' },
            { cmd: 'inventario', label: 'Inventário', desc: 'Seus itens.' },
            { cmd: 'rankglobal', label: 'Ranking', desc: 'Ranking global.' },
            { cmd: 'nivel', label: 'Level', desc: 'Seu nível.' },
            { cmd: 'pix', label: 'Pix', desc: 'Transferir coins.' }
        ]
    },
    menupg: {
        cat: null,
        emoji: '👥',
        titulo: 'Menu Grupo',
        descricao: 'Administração de grupos.',
        itens: [
            { cmd: 'infogrupo', label: 'Info Grupo', desc: 'Dados do grupo.' },
            { cmd: 'link', label: 'Link', desc: 'Link do grupo.' },
            { cmd: 'promover', label: 'Promover', desc: 'Promover membro.' },
            { cmd: 'rebaixar', label: 'Rebaixar', desc: 'Rebaixar membro.' },
            { cmd: 'ban', label: 'Ban', desc: 'Banir membro.' },
            { cmd: 'hidetag', label: 'HideTag', desc: 'Marcar todos.' },
            { cmd: 'bemvindo', label: 'Bem-vindo', desc: 'Mensagem de entrada.' },
            { cmd: 'antipalavra', label: 'Anti-Palavra', desc: 'Bloquear palavras.' },
            { cmd: 'antiflood', label: 'Anti-Flood', desc: 'Proteger de spam.' },
            { cmd: 'antispam', label: 'Anti-Spam', desc: 'Anti spam.' }
        ]
    }
}

/**
 * Aliases de comando -> (id da categoria no menuData).
 * Usado para que o `menu:run:` saiba em qual categoria o comando mora.
 */
const CAT_ALIAS = {
    menuvip: 'opcoes',
    menuanime: 'opcoes',
    menueconomia: 'opcoes',
    menupg: 'opcoes',
    menutools: 'menuferramentas'
}

/**
 * Monta o botão de lista nativa de um menu extra.
 */
function buildList(menu, itens, catId) {
    const bot = global.packname || 'Gótica Bot'

    const rows = itens.map(item => ({
        header: `${menu.emoji} • ${item.label.toUpperCase()}`,
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
            title: `✦ ${menu.titulo.toUpperCase()} ✦`,
            sections: [
                {
                    title: `⭑ ${menu.emoji} • ${menu.titulo.toUpperCase()}`,
                    rows
                }
            ]
        })
    }
}

const handler = async (m, { conn, args, command, usedPrefix: _p }) => {
    const cmd = (command || '').toLowerCase()
    const menu = MENUS[cmd]
    if (!menu) return

    // Se o menu reaproveita uma categoria, usa os comandos dela
    let itens = menu.itens
    let catId = CAT_ALIAS[cmd] || menu.cat || menu.titulo

    if (!itens && menu.cat) {
        const cat = findCategory(menu.cat)
        if (!cat) return m.reply('❌ Categoria não encontrada.')
        itens = cat.items
    }

    if (!itens) return

    try {
        const media = await prepareVideoMedia(conn)

        const txt = buildSubMenuText(
            {
                emoji: menu.emoji,
                label: menu.titulo,
                description: menu.descricao,
                items: itens
            },
            { prefix: _p }
        )

        const interactiveMessage = {
            contextInfo: { mentionedJid: [m.sender] },
            header: media?.videoMessage
                ? { hasMediaAttachment: true, videoMessage: media.videoMessage }
                : { hasMediaAttachment: true, imageMessage: media?.imageMessage },
            headerType: media?.videoMessage ? 'VIDEO' : 'IMAGE',
            body: { text: txt },
            footer: { text: `✦ ${menu.emoji} ${menu.titulo} ✦` },
            nativeFlowMessage: {
                buttons: [
                    buildList(menu, itens, catId),
                    ctaUrl('✦ 💋 𝗖𝗔𝗡𝗔𝗟 𝗗𝗔 𝗚𝗢𝗧𝗜𝗖𝗔 ✦', global.canal || 'https://whatsapp.com/channel/0029Vb8SRN5CcW4sYg65Tp2K')
                ],
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
        console.error('[MENU2]', e)
        m.reply('❌ Erro ao gerar o menu.')
    }
}

handler.help = ['menuvip', 'menulogos', 'menubrincadeira', 'menubn', 'menuia', 'menuanime', 'menudownloads', 'menutools', 'menupg', 'menueconomia']
handler.tags = ['main', 'menu']
handler.command = [
    'menuvip', 'menulogos', 'menulogo', 'menubrincadeira', 'menubrincadeiras',
    'menubn', 'menuia', 'menuania', 'menuanime', 'menudownloads',
    'menutools', 'menupg', 'menueconomia', 'menurpg'
]

export default handler
