/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author ༄ Đev Šoberano ×͜×
 * @project Gotica Bot — Detecção e Punição Anti-Bot
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
        console.error('[ANTIBOT] Erro ao enviar msg com botão, caindo pro texto simples:', e)
        await conn.sendMessage(chatId, { text: texto, mentions }, { quoted }).catch(() => {})
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

global.antibotLock = global.antibotLock || new Map()

export async function before(m, { conn, participants, groupMetadata, isSoberano, isOwner, isAdmin, isBotAdmin }) {
    try {
        if (!m.isGroup || !m.sender) return

        const senderClean = limpar(m.sender)

        // 1. RECONHECIMENTO ABSOLUTO DE DONO / SOBERANO / BOT
        const ownerNumbers = global.owner ? global.owner.map(v => String(v[0]).replace(/[^0-9]/g, '')) : []
        const isBotOwner = ownerNumbers.includes(senderClean) || isSoberano || isOwner || m.key?.fromMe
        if (isBotOwner) return

        // 2. LEITURA DO ARQUIVO JSON FÍSICO DO GRUPO
        const cfg = readGroupConfig(m.chat)
        if (cfg.antibot !== true) return

        const listaMembros = participants || groupMetadata?.participants || []
        const participanteClean = limpar(m.sender)

        // 3. SE FOR ADMIN, IGNORA
        const senderAdmin = (isAdmin === true) || listaMembros.some(p => idsDe(p).includes(participanteClean) && ehAdmin(p))
        if (senderAdmin) return

        // 4. CHECAGEM DO BOT COMO ADMIN
        const rawBotJid = conn.user?.id || conn.user?.jid || ''
        const botNumberClean = limpar(rawBotJid)
        const botLid = limpar(conn.user?.lid || '')
        
        const botIsAdminCalculated = (isBotAdmin === true) || listaMembros.some(p => {
            const ids = idsDe(p)
            return (ids.includes(botNumberClean) || (botLid && ids.includes(botLid))) && ehAdmin(p)
        })

        if (!botIsAdminCalculated) return

        // 5. DETECÇÃO ROBUSTA DE ASSINATURA DE BOT (BAE5, 3EB0, ILSYM ou Mensagens com Botões)
        const msgId = m.key?.id || ''
        const isApiBot = 
            msgId.startsWith('BAE5') || 
            msgId.startsWith('3EB0') || 
            msgId.startsWith('ILSYM') ||
            !!m.message?.interactiveMessage ||
            !!m.message?.buttonsMessage ||
            !!m.message?.templateMessage

        if (!isApiBot) return

        // Trava anti-duplicidade (30s) para evitar loops de ban no mesmo bot
        const lockKey = `${senderClean}_${m.chat}`
        const agora = Date.now()
        const ultimoBan = global.antibotLock.get(lockKey) || 0
        if (agora - ultimoBan < 30_000) return

        global.antibotLock.set(lockKey, agora)

        // 6. RITUAL DE ELIMINAÇÃO DO BOT INVASOR
        console.log(`[ANTIBOT] Removendo bot detectado ${m.sender} de ${m.chat} (MsgID: ${msgId})...`)
        
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(e => {
            console.error('[ANTIBOT] Falha ao remover bot:', e.message)
        })

        await conn.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.key.id,
                participant: m.key.participant || m.sender
            }
        }).catch(() => {})

        const texto =
            `*🤖 𝐀𝐍𝐓𝐈𝐁𝐎𝐓 𝐀𝐓𝐈𝐕𝐀𝐃𝐎*\n\n` +
            `> @${senderClean} foi removido por uso de bot não autorizado. 💀`

        await sendComBotao(conn, m.chat, texto, m, [m.sender])

    } catch (e) {
        console.error('[ANTIBOT ERROR]', e)
    }
}