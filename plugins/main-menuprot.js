/**
 * @project Gótica Bot - Menu de Proteção (Painel de Sistemas Nativo)
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 */

import fs from 'fs'
import path from 'path'
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'

const cwd = process.cwd()

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
        return null
    }
}

/**
 * Lê o estado real direto do arquivo JSON físico do grupo para o painel refletir com precisão
 */
function getGroupStatus(chatId, cmdName) {
    try {
        const cleanFrom = chatId.split('@')[0] + '@g.us'
        const caminhoGotica = path.join(cwd, 'src', 'database', 'grupos', `${cleanFrom}.json`)
        const caminhoAntigo = path.join(cwd, 'DADOS DA GOTICA', 'grupos', 'ATIVAÇÕES-GOTICA', `${cleanFrom}.json`)
        const caminho = fs.existsSync(caminhoGotica) ? caminhoGotica : (fs.existsSync(caminhoAntigo) ? caminhoAntigo : null)

        if (caminho && fs.existsSync(caminho)) {
            const content = fs.readFileSync(caminho, 'utf-8')
            const jsonGp = content ? JSON.parse(content) : []
            const config = Array.isArray(jsonGp) ? jsonGp[0] : jsonGp
            if (config && typeof config === 'object') {
                return !!(config[cmdName] || config['anti' + cmdName] || config[cmdName + 'gp'])
            }
        }
    } catch (e) {}

    // Fallback para o global.db caso o arquivo físico não exista
    const chatGlobal = global.db?.data?.chats?.[chatId] || {}
    return !!(chatGlobal[cmdName] || chatGlobal['anti' + cmdName])
}

function buildProtList(chatId, _p) {
    const sistemas = [
        { cmd: 'antilink', name: 'ANTI-LINK', desc: 'Bloqueia links de grupos e sites externos.' },
        { cmd: 'antiflood', name: 'ANTI-FLOOD', desc: 'Evita spam de mensagens repetidas.' },
        { cmd: 'antipagamento', name: 'ANTI-PAGAMENTO', desc: 'Bloqueia solicitações de pagamentos/PIX.' },
        { cmd: 'antibot', name: 'ANTI-BOT', desc: 'Expulsa outros bots que entrarem no grupo.' },
        { cmd: 'antifake', name: 'ANTI-FAKE', desc: 'Bloqueia números fakes e estrangeiros.' },
        { cmd: 'antitrabas', name: 'ANTI-TRAVA', desc: 'Apaga mensagens com travas/bugs.' },
        { cmd: 'antisticker', name: 'ANTI-STICKER', desc: 'Bloqueia figurinhas no grupo.' },
        { cmd: 'antidelete', name: 'ANTI-DELETE', desc: 'Reenvia mensagens apagadas pelos membros.' },
        { cmd: 'antitoxic', name: 'ANTI-TÓXICO', desc: 'Bloqueia palavras de baixo calão.' },
        { cmd: 'anticall', name: 'ANTI-CALL', desc: 'Remove quem ligar para o bot.' }
    ]

    const rows = sistemas.map(s => {
        // Pega o status real atualizado do JSON físico
        const isAtivo = getGroupStatus(chatId, s.cmd)
        const emoji = isAtivo ? '✅' : '❌'
        const estadoLabel = isAtivo ? 'ATIVADO' : 'DESATIVADO'

        // Se estiver ativo, ao clicar envia o comando para desligar (off). Se estiver desativado, envia para ligar (on).
        const acao = isAtivo ? 'off' : 'on'

        return {
            header: `${emoji} ${s.name} [ ${estadoLabel} ]`,
            title: 'Toque para alternar sistema',
            description: s.desc,
            id: `${_p}${s.cmd} ${acao}`
        }
    })

    rows.push({
        header: '🔙 • VOLTAR AO MENU',
        title: 'Retornar ao menu principal',
        description: global.packname || 'Gótica Bot',
        id: `${_p}menu`
    })

    return {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
            title: '✦ 🔓 PAINEL DE PROTEÇÃO ✦',
            sections: [
                {
                    title: '🛡️ • SISTEMAS DE SEGURANÇA',
                    rows: rows
                }
            ]
        })
    }
}

let handler = async (m, { conn, usedPrefix: _p }) => {
    try {
        await m.react('🛡️')
        const media = await prepareVideoMedia(conn)
        const botName = global.packname || 'Gótica Bot'

        let txt = `\`⚙️ PAINEL DE PROTEÇÃO\`\n\n`
        txt += `> *Selecione uma categoria e escolha o sistema que deseja ativar ou desativar.*\n\n`
        txt += `✦ Status atualizado ✦`

        const interactiveMessage = {
            contextInfo: { mentionedJid: [m.sender] },
            header: media?.videoMessage
                ? { hasMediaAttachment: true, videoMessage: media.videoMessage }
                : { hasMediaAttachment: true, imageMessage: media?.imageMessage },
            headerType: media?.videoMessage ? 'VIDEO' : 'IMAGE',
            body: { text: txt },
            footer: { text: `✦ ${botName} ✦` },
            nativeFlowMessage: {
                buttons: [buildProtList(m.chat, _p)],
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
        console.error(e)
        await m.react('❌')
        m.reply('❌ Erro ao abrir o painel de proteção.')
    }
}

handler.help = ['menuprot', 'protecao', 'proteção']
handler.tags = ['main', 'group']
handler.command = ['menuprot', 'protecao', 'proteção']

export default handler