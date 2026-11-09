/**
 * 🎭 ANTI-STICKER
 * @author Dev Soberano
 *
 * Bane quem enviar figurinha (sticker) manualmente no grupo quando a
 * proteção estiver ativada. Segue o mesmo padrão dos outros plugins:
 * - Status lido/gravado no arquivo físico (src/database/grupos/<grupo>.json),
 *   mesma fonte que o painel !menuprot usa.
 * - !antisticker on/off pra ligar/desligar (admin-only), com botão de
 *   canal e formatação em citação igual ao antilink.
 * - Ao detectar: avisa PRIMEIRO (com botão) → apaga a figurinha → bane.
 *   Admins e o dono nunca são afetados.
 */
import fs from 'fs'
import path from 'path'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const DB_DIR = path.join(process.cwd(), 'src', 'database', 'grupos')

const limpar = jid => String(jid || '').split(':')[0].split('@')[0].replace(/[^0-9]/g, '')
const ehAdmin = p => p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true
const idsDe = p => [p.id, p.jid, p.lid, p.phoneNumber].filter(Boolean).map(limpar)

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
        console.error('[ANTISTICKER] Erro ao enviar msg com botão, caindo pro texto simples:', e)
        await conn.sendMessage(chatId, { text: texto, mentions }, { quoted }).catch(() => {})
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

// ───────────────────────── TOGGLE: !antisticker on/off ─────────────────────────
let handler = async (m, { conn, args, isAdmin, isOwner }) => {
    // Intercepta e bloqueia qualquer propagação para handlers globais genéricos
    if (m.isGroup && !isAdmin && !isOwner) {
        return sendComBotao(conn, m.chat, '`🎭 ANTI-STICKER`\n\n> ❌ Apenas administradores podem configurar o antisticker!', m)
    }
    if (!m.isGroup) {
        return sendComBotao(conn, m.chat, '`🎭 ANTI-STICKER`\n\n> ❌ Esse comando só funciona em grupos!', m)
    }

    const cfg = readGroupConfig(m.chat)
    const ativoAtual = cfg.antisticker === true

    if (!args[0]) {
        const texto =
            `\`🎭 ANTI-STICKER\`\n\n` +
            `> _Status atual:_ ${ativoAtual ? '*ATIVADO* ✅' : '*DESATIVADO* ❌'}\n\n` +
            `> _Pra ligar/desligar:_\n> *!antisticker on*\n> *!antisticker off*`
        return sendComBotao(conn, m.chat, texto, m)
    }

    if (/^on$/i.test(args[0])) {
        if (ativoAtual) {
            return sendComBotao(conn, m.chat, '`🎭 ANTI-STICKER`\n\n> _Opa!_ Essa função *já está ATIVADA* ✅', m)
        }
        cfg.antisticker = true
        writeGroupConfig(m.chat, cfg)
        const textoOn =
            `\`🎭 ANTI-STICKER\`\n\n` +
            `> ✅ Função *ATIVADA* com sucesso!\n\n` +
            `> _A partir de agora, quem enviar figurinha neste grupo é banido automaticamente. Administradores não são afetados._`
        return sendComBotao(conn, m.chat, textoOn, m)
    }

    if (/^off$/i.test(args[0])) {
        if (!ativoAtual) {
            return sendComBotao(conn, m.chat, '`🎭 ANTI-STICKER`\n\n> _Opa!_ Essa função *já está DESATIVADA* ❌', m)
        }
        cfg.antisticker = false
        writeGroupConfig(m.chat, cfg)
        const textoOff =
            `\`🎭 ANTI-STICKER\`\n\n` +
            `> 🔕 Função *DESATIVADA* com sucesso!`
        return sendComBotao(conn, m.chat, textoOff, m)
    }

    return sendComBotao(conn, m.chat, '`🎭 ANTI-STICKER`\n\n> ❌ _Use:_ *!antisticker on* | *!antisticker off*', m)
}

handler.help = ['antisticker']
handler.tags = ['admin']
handler.command = /^(antisticker|antifigurinha)$/i
handler.group = true
handler.admin = true
handler.fail = null // Previne propagação para fallbacks globais

export default handler

// ───────────────────────── DETECÇÃO: bane quem mandar figurinha ─────────────────────────
export async function before(m, { conn, participants, groupMetadata, isSoberano, isOwner }) {
    try {
        if (!m.isGroup) return
        if (m.key?.fromMe || isSoberano) return
        if (!m.sender) return

        const senderClean = limpar(m.sender)

        // Dono/Soberano nunca é punido
        const ownerNumbers = global.owner ? global.owner.map(v => String(v[0]).replace(/[^0-9]/g, '')) : []
        if (ownerNumbers.includes(senderClean) || isOwner) return

        // Status lido do arquivo físico — mesma fonte do painel
        const cfg = readGroupConfig(m.chat)
        if (cfg.antisticker !== true) return

        const listaMembros = participants || groupMetadata?.participants || []

        // Admin nunca é punido
        const senderAdmin = listaMembros.some(p => idsDe(p).includes(senderClean) && ehAdmin(p))
        if (senderAdmin) return

        // Checa se o bot é admin (precisa ser pra banir)
        const rawBotJid = conn.user?.id || conn.user?.jid || ''
        const botNumberClean = limpar(rawBotJid)
        const botLid = limpar(conn.user?.lid || '')
        const isBotAdmin = listaMembros.some(p => {
            const ids = idsDe(p)
            return (ids.includes(botNumberClean) || (botLid && ids.includes(botLid))) && ehAdmin(p)
        })

        // Detecta se a mensagem é uma figurinha
        const mime = (m.msg || m).mimetype || m.mediaType || ''
        const isSticker = m.mtype === 'stickerMessage' || /webp/i.test(mime)
        if (!isSticker) return

        // PASSO 1: avisa primeiro, com botão do canal
        const userTag = `@${senderClean}`
        const texto =
            `\`🎭 ANTI-STICKER\`\n\n` +
            `> ${userTag} foi detectado enviando figurinha neste grupo.\n` +
            `> _Apenas administradores podem enviar figurinhas aqui — removendo._ 🚫`

        await sendComBotao(conn, m.chat, texto, m, [m.sender])

        // PASSO 2: apaga a figurinha
        await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})

        // PASSO 3: bane
        if (isBotAdmin) {
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch((e) => {
                console.error('[ANTISTICKER] Falha ao remover:', e.message)
            })
        }
    } catch (e) {
        console.error('[ANTISTICKER] Erro no middleware:', e)
    }
}