/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot — Detecção e Punição Anti-Link
 */

import fs from 'fs'
import path from 'path'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const DB_DIR = path.join(process.cwd(), 'src', 'database', 'grupos')

const globalLinkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi
const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i

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

export async function before(m, { conn, participants, groupMetadata, isSoberano, isOwner }) {
    if (!m || !m.text || typeof m.text !== 'string') return
    if (!m.isGroup) return

    const from = m.chat
    const sender = m.sender || m.key.participant || ''
    const senderClean = limpar(sender)

    // 1. RECONHECIMENTO ABSOLUTO DE DONO / SOBERANO / BOT
    const ownerNumbers = global.owner ? global.owner.map(v => String(v[0]).replace(/[^0-9]/g, '')) : []
    const isBotOwner = ownerNumbers.includes(senderClean) || isSoberano || isOwner || m.fromMe
    if (isBotOwner) return

    // 2. LEITURA DO ARQUIVO JSON FÍSICO (Mesmo formato do comando !antilink)
    const cleanGroupChat = from.split('@')[0] + '@g.us'
    const caminhoGotica = path.join(DB_DIR, `${cleanGroupChat}.json`)
    
    let isAntiLinkAtivo = false
    try {
        if (fs.existsSync(caminhoGotica)) {
            const raw = fs.readFileSync(caminhoGotica, 'utf-8')
            const parsed = raw ? JSON.parse(raw) : []
            const arr = Array.isArray(parsed) ? parsed : [parsed]
            const config = arr[0] || {}
            isAntiLinkAtivo = config.antilink === true
        }
    } catch (e) {}

    if (!isAntiLinkAtivo) return

    // 3. VERIFICA SE HÁ LINK NA MENSAGEM
    const isAnyLink = m.text.match(globalLinkRegex) || m.text.match(linkRegex)
    if (!isAnyLink) return

    const listaMembros = participants || groupMetadata?.participants || []
    const participanteClean = limpar(sender)

    // 4. VERIFICA SE QUEM ENVIOU É ADMIN DO GRUPO
    const senderAdmin = listaMembros.some(p => idsDe(p).includes(participanteClean) && ehAdmin(p))
    if (senderAdmin) return

    // 5. CHECAGEM DO BOT COMO ADMIN
    const rawBotJid = conn.user?.id || conn.user?.jid || ''
    const botNumberClean = limpar(rawBotJid)
    const botLid = limpar(conn.user?.lid || '')
    
    const isBotAdmin = listaMembros.some(p => {
        const ids = idsDe(p)
        return (ids.includes(botNumberClean) || (botLid && ids.includes(botLid))) && ehAdmin(p)
    })

    // Se for link do próprio grupo e o bot for admin, permite
    if (isBotAdmin && m.text.match(linkRegex)) {
        try {
            const groupCode = await conn.groupInviteCode(from)
            const linkThisGroup = `chat.whatsapp.com/${groupCode}`
            if (m.text.includes(linkThisGroup)) return
        } catch (e) {}
    }

    const userTag = `@${senderClean}`

    // 6. SE O BOT NÃO FOR ADMIN DE FATO NO GRUPO
    if (!isBotAdmin) {
        const textoSemAdmin = `*✦ LINK DETECTADO*  ✅️\n\n> *O ${userTag} enviou um link, mas não posso puni-lo porque não sou Admin.*\n\nDeu sorte dessa vez kkk`
        
        const interactiveMessage = {
            contextInfo: { mentionedJid: [sender] },
            body: { text: textoSemAdmin },
            footer: { text: "• ༄ Đev Šoberano ×͜×" },
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

        let msgi = generateWAMessageFromContent(from, { interactiveMessage }, { userJid: conn.user.id, quoted: m })
        await conn.relayMessage(from, msgi.message, {
            messageId: msgi.key.id,
            additionalNodes: buildInteractiveNodes(from)
        })
        return
    }

    // 7. SE O BOT FOR ADMIN: Envia o deboche, apaga a mensagem e BANE o membro comum na hora!
    const deboche = [
        `*「 🔗 ACHOU QUE IA DIVULGAR? 」*\n\n> 《✧》${userTag} Coitado... achou que esse link ia passar batido? kkkk Tchau, "divulgador"! 💀`,
        `*「 🔗 OPS, ERROU DE LUGAR 」*\n\n> 《✧》${userTag} Esse tipo de lixo não entra aqui. Aproveita a viagem pra fora do grupo! 🦇`,
        `*「 🔗 ANTILINK ATIVO 」*\n\n> 《✧》${userTag} Tentando postar link, fofura? Que pena, minha paciência é zero. RUA! 🦴`
    ]
    const msgDeboche = deboche[Math.floor(Math.random() * deboche.length)]

    const interactiveMessage = {
        contextInfo: { mentionedJid: [sender] },
        body: { text: msgDeboche },
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

    let msgi = generateWAMessageFromContent(from, { interactiveMessage }, { userJid: conn.user.id, quoted: m })
    await conn.relayMessage(from, msgi.message, {
        messageId: msgi.key.id,
        additionalNodes: buildInteractiveNodes(from)
    })

    // Apaga a mensagem com o link
    await conn.sendMessage(from, { 
        delete: { 
            remoteJid: from, 
            fromMe: false, 
            id: m.key.id, 
            participant: m.key.participant || m.sender 
        } 
    }).catch(() => {})
    
    // Bane o infractor imediatamente
    console.log(`[ANTI-LINK] Banindo ${sender} de ${from}...`)
    await conn.groupParticipantsUpdate(from, [sender], 'remove')
}