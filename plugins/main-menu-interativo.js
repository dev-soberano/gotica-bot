/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Dev soberano
 * @link https://github.com/leandromemes
 * @project Gotica Bot

 *
 * Menu no estilo EXATO do Minato Bot:
 *  - Botão `single_select` com `sections` + `rows` (lista nativa "OPCÕES")
 *  - Botão `cta_url` para o canal oficial
 *  - Caption estilizado com o caixa do bot (como o "bot info" do Minato)
 *  - Vídeo da Gótica no cabeçalho
 *
 * O clique na lista chega como listResponseMessage.singleSelectReply
 * com o `selectedRowId` (o id da row), que o handler.js converte
 * em comando.
 */

import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { MENU_CATEGORIES, MENU_PREFIX, buildMainMenuText, buildSubMenuText, findCategory, findCategoryByIndex, findItem } from '../lib/menuData.js'
import { quickReply, ctaUrl } from '../lib/buttons.js'
import { isSoberano, isDono, isModerador, isVip } from '../lib/owners.js'

const cwd = process.cwd()

/**
 * No `biz` exigido pelo WhatsApp para renderizar a lista nativa.
 */
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

/** Pega um vídeo aleatório da pasta src/menu (vídeos da Gótica). */
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

/** Formata milissegundos em texto curto. */
function clockString(ms) {
    const d = Math.floor(ms / 86400000)
    const h = Math.floor(ms / 3600000) % 24
    const m = Math.floor(ms / 60000) % 60
    const s = Math.floor(ms / 1000) % 60
    const result = []
    if (d > 0) result.push(`${d}d`)
    if (h > 0) result.push(`${h}h`)
    if (m > 0) result.push(`${m}m`)
    if (s > 0) result.push(`${s}s`)
    return result.length > 0 ? result.join(' ') : '0s'
}

/**
 * Prepara o vídeo do cabeçalho (usa os vídeos da Gótica).
 * Se falhar, devolve null e o menu é enviado sem mídia.
 */
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
        console.error('[MENU] Erro ao preparar mídia do cabeçalho:', e.message)
        return null
    }
}

/**
 * Monta o botão de LISTA NATIVA (single_select) do menu principal.
 * Formato idêntico ao Minato: seções com header/title/description.
 *
 * As linhas de cada categoria abrem o submenu correspondente.
 */
function buildMenuList() {
    const bot = global.packname || 'Gótica Bot'

    const rowsMenus = MENU_CATEGORIES.map(cat => ({
        header: `${cat.emoji} • ${cat.label.toUpperCase()}`,
        title: cat.description,
        description: bot,
        id: `${MENU_PREFIX}cat:${cat.id}`
    }))

    const rowsInfos = [
        {
            header: '⚡ • PING',
            title: 'Status e velocidade do bot.',
            description: bot,
            id: `${MENU_PREFIX}cmd:ping`
        },
        {
            header: '🤖 • INFO DO BOT',
            title: 'Informações gerais do bot.',
            description: bot,
            id: `${MENU_PREFIX}cmd:infobot`
        },
        {
            header: '👑 • DONO',
            title: 'Contato do responsável.',
            description: bot,
            id: `${MENU_PREFIX}cmd:dono`
        }
    ]

    return {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
            title: '✦ 𝑶𝑷𝑪̧𝑶̃𝑬𝑺 ✦',
            sections: [
                {
                    title: '⭑💫 • 𝑴𝑬𝑵𝑼𝑺',
                    rows: rowsMenus
                },
                {
                    title: '⭑ℹ️ • 𝑰𝒏𝒇𝒐𝒔',
                    rows: rowsInfos
                }
            ]
        })
    }
}

/**
 * Monta o botão de LISTA NATIVA de uma categoria.
 */
function buildCategoryList(category) {
    const bot = global.packname || 'Gótica Bot'
    const pfx = global.prefix || '!'

    const rows = category.items.map(item => ({
        header: `${category.emoji} • ${item.label.toUpperCase()}`,
        title: item.desc,
        description: `${pfx}${item.cmd}`,
        id: `${MENU_PREFIX}run:${category.id}:${item.cmd}`
    }))

    // Linha para voltar ao menu principal
    rows.push({
        header: '🔙 • VOLTAR',
        title: 'Voltar ao menu principal.',
        description: bot,
        id: `${MENU_PREFIX}back`
    })

    return {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
            title: `✦ ${category.label.toUpperCase()} ✦`,
            sections: [
                {
                    title: `⭑ ${category.emoji} • ${category.label.toUpperCase()}`,
                    rows
                }
            ]
        })
    }
}

/** Botão do canal oficial (igual ao Minato). */
function buildCanalButton() {
    return ctaUrl(
        '✦ 💋 𝗖𝗔𝗡𝗔𝗟 𝗗𝗔 𝗚𝗢𝗧𝗜𝗖𝗔 ✦',
        global.canal || 'https://whatsapp.com/channel/0029Vb8SRN5CcW4sYg65Tp2K'
    )
}

/** Envia o menu principal com a lista nativa (protegido contra queda de conexao). */
async function enviarMenuPrincipal(conn, m, _p) {
    const media = await prepareVideoMedia(conn)

    // Dados reais de quem pediu
    const senderNum = (m.sender || '').replace(/[^0-9]/g, '')
    const nome = m.pushName || 'Usuário'
    let cargo = 'usuário'
    if (isSoberano(m.sender)) cargo = 'dono principal'
    else if (isDono(m.sender)) cargo = 'dono'
    else if (isModerador(m.sender)) cargo = 'moderador'
    else if (isVip(m.sender)) cargo = 'vip'

    const totalComandos = Object.keys(global.plugins || {}).reduce((s, p) => {
        const c = global.plugins[p]?.command
        return s + (Array.isArray(c) ? c.length : (typeof c === 'string' ? 1 : 0))
    }, 0)

    const txt = buildMainMenuText({
        prefix: _p,
        uptime: clockString(process.uptime() * 1000),
        date: moment.tz('America/Sao_Paulo').format('DD/MM/YYYY'),
        version: global.vs || '2.0.4',
        botName: global.packname || 'Gótica Bot',
        owner: global.author || 'Dev Soberano',
        numero: senderNum,
        cargo,
        vip: isVip(m.sender) ? 'SIM' : 'NÃO',
        velocidade: '0.001s',
        total: totalComandos
    })

    const interactiveMessage = {
        contextInfo: { mentionedJid: [m.sender] },
        header: media?.videoMessage
            ? { hasMediaAttachment: true, videoMessage: media.videoMessage }
            : { hasMediaAttachment: true, imageMessage: media?.imageMessage },
        headerType: media?.videoMessage ? 'VIDEO' : 'IMAGE',
        body: { text: txt },
        footer: { text: `✦ ${global.packname || 'Gótica Bot'} ✦` },
        nativeFlowMessage: {
            buttons: [buildMenuList(), buildCanalButton()],
            messageParamsJson: '{}',
            messageVersion: 1
        }
    }

    const msgi = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid: conn.user.id, quoted: m })
    await conn.relayMessage(m.chat, msgi.message, {
        messageId: msgi.key.id,
        additionalNodes: buildInteractiveNodes(m.chat)
    })
}

/**
 * Envia o menu principal com a lista nativa.
 * Protege contra queda de conexão (erro 428) para não derrubar o bot.
 */
async function sendMainMenu(conn, m, _p) {
    try {
        await enviarMenuPrincipal(conn, m, _p)
    } catch (e) {
        const msg = String(e?.message || e)
        if (msg.includes('428') || msg.includes('Connection Closed')) {
            console.error('[MENU] Conexão caiu durante o envio do menu. Tentando texto puro...')
            // Fallback: envia só o texto, sem mídia/botão
            const txt = buildMainMenuText({
                prefix: _p,
                uptime: clockString(process.uptime() * 1000),
                date: moment.tz('America/Sao_Paulo').format('DD/MM/YYYY'),
                version: global.vs || '2.0.4',
                botName: global.packname || 'Gótica Bot',
                owner: global.author || 'Dev Soberano',
                numero: (m.sender || '').replace(/[^0-9]/g, ''),
                cargo: 'usuário',
                vip: 'SIM',
                velocidade: '0.001s',
                total: 0
            })
            await conn.sendMessage(m.chat, { text: txt }).catch(() => { })
            return
        }
        throw e
    }
}

/**
 * Categoria do menu -> comando do menu original (cada um abre o plugin
 * de menu daquela categoria, sem mudar o texto).
 */
const COMANDO_DA_CATEGORIA = {
    geral: 'menuprincipal',
    menuadm: 'menuadm',
    menudono: 'menudono',
    brincadeiras: 'menubrincadeiras',
    menu18: 'menu18',
    protecao: 'menuprot',
    donos: 'donos'
}

/** Comandos por mensagem de categoria (WhatsApp não aceita listas longas). */
const COMANDOS_POR_MENSAGEM = 60

/**
 * Envia a categoria em molduras: comandos com prefixo, em mensagens de
 * até 60 comandos. Cada mensagem tem o botão do canal.
 */
async function sendSubMenu(conn, m, _p, category) {
    const prefixo = _p || global.prefix || '!'
    const itens = category.items || []
    const paginas = []
    for (let i = 0; i < itens.length; i += COMANDOS_POR_MENSAGEM) {
        paginas.push(itens.slice(i, i + COMANDOS_POR_MENSAGEM))
    }
    if (!paginas.length) paginas.push([])

    for (let n = 0; n < paginas.length; n++) {
        const pagina = paginas.length > 1 ? ` (${n + 1}/${paginas.length})` : ''
        const linhas = [
            '┎┶┅┅┅━═⋅═━━━━═⋅═━┅┅┅┅☾⋆',
            `${category.emoji} *${category.label.toUpperCase()}*${pagina}`,
            `─━━━━┉❈⏤͟͟͞͞★꙲⃝͟${category.emoji}❈┉━━━━─`,
            ...paginas[n].map(item => `┇┆✦⋆͜͡҈➳ *${prefixo}${item.cmd}*`),
            '┇├┉━┅━┅━┅━┅━┅━┅━⋅≎⋆ᐧ'
        ]
        const interactiveMessage = {
            contextInfo: { mentionedJid: [m.sender] },
            ...(n === 0 ? {
                header: { hasMediaAttachment: false }
            } : {}),
            body: { text: linhas.join('\n') },
            footer: { text: `${category.emoji} ${category.label}` },
            nativeFlowMessage: {
                buttons: [buildCanalButton()],
                messageParamsJson: '{}',
                messageVersion: 1
            }
        }
        const msgi = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid: conn.user.id, quoted: n === 0 ? m : undefined })
        await conn.relayMessage(m.chat, msgi.message, {
            messageId: msgi.key.id,
            additionalNodes: buildInteractiveNodes(m.chat)
        })
    }
}

let handler = async (m, { conn, usedPrefix: _p }) => {
    try {
        await m.react('🎉')
        await sendMainMenu(conn, m, _p)
    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('❌ Erro ao gerar o menu principal.')
    }
}

handler.help = ['menu', 'menuprincipal', 'ajuda']
handler.tags = ['main']
handler.command = ['menu', 'menus', 'ajuda']

/**
 * Manipuladores do menu interativo, usados pelo handler.js quando uma
 * opção da lista é selecionada.
 *
 * Anexado ao default export porque o carregador do bot usa
 * `module.default || module` - um named export separado seria perdido.
 */
handler.menuHandlers = {
    async handleButton(conn, m, buttonId, _p) {
        // cat:<id> -> abre o menu original daquela categoria (plugin da Gótica)
        if (buttonId.startsWith(`${MENU_PREFIX}cat:`)) {
            const catId = buttonId.slice(`${MENU_PREFIX}cat:`.length)
            const comando = COMANDO_DA_CATEGORIA[catId]
            if (!comando) return m.reply('❌ Menu não encontrado.')
            m.text = `${_p}${comando}`
            return false
        }

        // run:<catId>:<cmd> -> executa o comando
        if (buttonId.startsWith(`${MENU_PREFIX}run:`)) {
            const rest = buttonId.slice(`${MENU_PREFIX}run:`.length)
            const sepIdx = rest.indexOf(':')
            if (sepIdx === -1) return false
            const catId = rest.slice(0, sepIdx)
            const cmd = rest.slice(sepIdx + 1)

            // Valida o comando na categoria (se ela existir no menuData)
            const cat = findCategory(catId)
            if (cat) {
                const item = findItem(catId, cmd)
                if (!item) return false
            }

            // Se o comando precisa de mídia, marca como pendente para
            // que a próxima mídia enviada seja aplicada automaticamente.
            try {
                const { setPendente, precisaMidia } = await import('../lib/pendente.js')
                if (precisaMidia(cmd)) {
                    setPendente(m.sender, m.chat, cmd)
                }
            } catch { }

            // Injeta o prefixo no texto para que o handler.js despache
            // o comando normalmente (inclusive as restrições de admin).
            m.text = `${_p}${cmd}`
            return false // sinaliza ao handler.js para reprocessar
        }

        // cmd:<comando> -> executa um comando direto (seção Infos)
        if (buttonId.startsWith(`${MENU_PREFIX}cmd:`)) {
            const cmd = buttonId.slice(`${MENU_PREFIX}cmd:`.length)
            if (!cmd) return false
            m.text = `${_p}${cmd}`
            return false // sinaliza ao handler.js para reprocessar
        }

        // back -> menu principal
        if (buttonId === `${MENU_PREFIX}back`) {
            await sendMainMenu(conn, m, _p)
            return true
        }

        return false
    }
}

export default handler
