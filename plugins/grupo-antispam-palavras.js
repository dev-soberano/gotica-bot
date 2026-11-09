/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║    ██║   ██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║    ██║   ██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║    ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝     ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Protecoes Avancadas de Grupo
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * REMOVIDO: "antidalavra"/"antipalavra"/"antippalavra" saíram do mapa
 * PROTECTIONS. Eram um toggle morto — ligava/desligava uma chave
 * (antiPalavra) que o before() nunca chegava a checar de verdade (não
 * existia nenhuma lista de palavra nem detecção aqui). Isso colidia com
 * o sistema novo ANTI-TÓXICO (main-antitoxico.js: !antitoxic/!antitoxico
 * + !addpalavrao/!delpalavrao/!listapalavrao), que é o único sistema de
 * palavra proibida usado agora — lista global, só o dono mexe, match
 * exato por palavra inteira, bane de verdade.
 */

import fs from 'fs'
import path from 'path'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const PROTECT_FILE = path.join(process.cwd(), 'src', 'dados', 'protecao.json')

/** Mapa de comando -> chave de protecao (ANTISTICKER REMOVIDO DAQUI para ser gerido pelo plugin dedicado). */
const PROTECTIONS = {
    antiloc: 'antiLoc',
    antilocal: 'antiLoc',
    antictt: 'antiCtt',
    anticanal: 'antiCanal',
    antidoc: 'antiDoc',
    antidocumento: 'antiDoc',
    antimarcar: 'antiMarcar',
    antistatus: 'antiStatus',
    antiaudio: 'antiAudio',
    antivideo: 'antiVideo',
    antiimg: 'antiImg',
    antimsg: 'antiMsg',
    antinotas: 'antiNotas',
    anticontato: 'antiContato',
    antisp: 'antiSp',
    'anti-sp': 'antiSp'
}

/** Nomes legiveis para o relatorio. */
const FRIENDLY = {
    antiLoc: 'Anti-Localização',
    antiCtt: 'Anti-Contato',
    antiCanal: 'Anti-Canal',
    antiDoc: 'Anti-Documento',
    antiMarcar: 'Anti-Marcar',
    antiStatus: 'Anti-Status',
    antiAudio: 'Anti-Áudio',
    antiVideo: 'Anti-Vídeo',
    antiImg: 'Anti-Imagem',
    antiMsg: 'Anti-Mensagem',
    antiNotas: 'Anti-Notas',
    antiContato: 'Anti-Contato',
    antiSp: 'Anti-Spam'
}

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

async function sendComBotao(conn, chatId, texto, quoted, mentions) {
    const interactiveMessage = {
        ...(mentions ? { contextInfo: { mentionedJid: mentions } } : {}),
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
        await conn.sendMessage(chatId, { text: texto, mentions }, { quoted }).catch(() => {})
    }
}

/** Le as protecoes por grupo. */
function readProtect() {
    try {
        if (!fs.existsSync(PROTECT_FILE)) return {}
        const p = JSON.parse(fs.readFileSync(PROTECT_FILE, 'utf-8'))
        return (p && typeof p === 'object' && !Array.isArray(p)) ? p : {}
    } catch {
        return {}
    }
}

/** Grava as protecoes por grupo. */
function writeProtect(data) {
    try {
        const dir = path.dirname(PROTECT_FILE)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(PROTECT_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch {
        return false
    }
}

/**
 * Plugin `before`: aplica as protecoes ativas no grupo.
 */
export async function before(m, { conn, groupMetadata, isSoberano }) {
    if (!m.isGroup) return
    if (m.fromMe || isSoberano) return

    const groupId = m.chat
    const prot = readProtect()[groupId]
    if (!prot) return

    const participants = groupMetadata?.participants || []
    const senderAdmin = participants.find(p => (p.id || p.jid) === m.sender)?.admin
    if (senderAdmin) return

    const botId = conn.user?.jid || conn.user?.id
    const isBotAdmin = !!participants.find(p => (p.id || p.jid) === botId)?.admin

    const txt = m.text || ''
    const mime = (m.msg || m)?.mimetype || ''

    const apagar = async (motivo) => {
        if (!isBotAdmin) return
        try {
            const textoAviso = `\`⚠️ MENSAGEM REMOVIDA\`\n\n> 👤 @${m.sender.split('@')[0]}\n> 🚫 ${motivo}\n\n> 🔒 _Proteção avançada ativa neste grupo._`
            await sendComBotao(conn, m.chat, textoAviso, m, [m.sender])
            await conn.sendMessage(m.chat, { delete: m.key })
        } catch (e) {
            console.error('[PROTECT] Erro ao apagar mensagem:', e.message)
        }
    }

    // Anti-Localizacao
    if (prot.antiLoc && m.message?.locationMessage) {
        return apagar('Localização não permitida.')
    }

    // Anti-Contato (vCard)
    if (prot.antiCtt && m.message?.contactMessage) {
        return apagar('Cartão de contato não permitido.')
    }

    // Anti-Canal (newsletter)
    if (prot.antiCanal && /newsletter|whatsapp\.com\/channel/i.test(txt)) {
        return apagar('Links de canal não permitidos.')
    }

    // Anti-Documento
    if (prot.antiDoc && (mime.includes('document') || m.message?.documentMessage)) {
        return apagar('Documentos não permitidos.')
    }

    // Anti-Audio
    if (prot.antiAudio && mime.startsWith('audio/')) {
        return apagar('Áudios não permitidos.')
    }

    // Anti-Video
    if (prot.antiVideo && mime.startsWith('video/')) {
        return apagar('Vídeos não permitidos.')
    }

    // Anti-Imagem
    if (prot.antiImg && mime.startsWith('image/')) {
        return apagar('Imagens não permitidas.')
    }

    // Anti-Mensagem (bloqueia texto puro)
    if (prot.antiMsg && txt && !mime) {
        return apagar('Texto puro não permitido.')
    }

    // Anti-Notas de voz
    if (prot.antiNotas && m.message?.audioMessage?.ptt) {
        return apagar('Notas de voz não permitidas.')
    }

    // Anti-Pagamento
    if (prot.antiPayment && (m.message?.requestPaymentMessage || m.message?.paymentMessage)) {
        return apagar('Solicitações de pagamento não permitidas.')
    }

    // Anti-Marcar (@everyone / @here)
    if (prot.antiMarcar && /@all|@everyone|@here/i.test(txt)) {
        return apagar('Menções em massa não permitidas.')
    }
}

const handler = async (m, { conn, args, command, isSoberano, isAdmin }) => {
    const cmd = (command || '').toLowerCase()

    // ---- !listprotect ----
    if (cmd === 'listprotect' || cmd === 'listaprotecao' || cmd === 'listarprotecao' || cmd === 'protecao' || cmd === 'protect') {
        if (!m.isGroup) return m.reply(global.dfail('group'))
        const prot = readProtect()[m.chat] || {}

        let txt = `\`🛡️ PROTEÇÕES AVANÇADAS\`\n\n`

        const keys = Object.keys(prot).filter(k => prot[k])
        if (!keys.length) {
            txt += `> _Nenhuma proteção avançada ativa neste grupo._\n`
        } else {
            keys.forEach(k => {
                txt += `> ✅ *${FRIENDLY[k] || k}*\n`
            })
        }

        txt += `\n> 💡 Use \`!antinome on|off\` para ativar/desativar.`
        return sendComBotao(conn, m.chat, txt, m)
    }

    // Comandos antixxx on|off
    const key = PROTECTIONS[cmd]
    if (!key) return

    if (!m.isGroup) return m.reply(global.dfail('group'))
    if (!isSoberano && !isAdmin) return m.reply(global.dfail('admin'))

    const arg = (args[0] || '').toLowerCase()
    const all = readProtect()
    const groupProt = all[m.chat] || (all[m.chat] = {})

    if (!arg) {
        const status = groupProt[key] ? '🟢 ATIVA' : '🔴 INATIVA'
        const txtStatus = `\`🛡️ ${FRIENDLY[key] || key}\`\n\n> 📊 Status: ${status}\n\n> 💡 \`!${cmd} on\` / \`!${cmd} off\``
        return sendComBotao(conn, m.chat, txtStatus, m)
    }

    if (arg === 'on' || arg === 'ativar' || arg === '1' || arg === 'true') {
        groupProt[key] = true
        all[m.chat] = groupProt
        writeProtect(all)
        const txtOn = `\`🛡️ ${FRIENDLY[key] || key}\`\n\n> ✅ Função *ATIVADA* com sucesso!\n> _A proteção está valendo neste grupo._`
        return sendComBotao(conn, m.chat, txtOn, m)
    }

    if (arg === 'off' || arg === 'desativar' || arg === '0' || arg === 'false') {
        groupProt[key] = false
        all[m.chat] = groupProt
        writeProtect(all)
        const txtOff = `\`🔓 ${FRIENDLY[key] || key}\`\n\n> 🔕 Função *DESATIVADA* com sucesso!\n> _A proteção foi removida deste grupo._`
        return sendComBotao(conn, m.chat, txtOff, m)
    }

    const txtUso = `\`📝 USO DO COMANDO\`\n\n> *!${cmd} on* — ativar\n> *!${cmd} off* — desativar`
    return sendComBotao(conn, m.chat, txtUso, m)
}

handler.help = ['listprotect', 'antiloc', 'antictt', 'anticanal', 'antidoc']
handler.tags = ['group', 'admin', 'protect']
handler.command = [
    'listprotect', 'listaprotecao', 'listarprotecao', 'protecao', 'protect',
    ...Object.keys(PROTECTIONS)
]

handler.before = before

export default handler