/**
 * 🛡️ SENTINELA ANTI-FRAUDE (VERSÃO ULTRA-SENSÍVEL)
 * @author Dev Soberano
 *
 * CORRIGIDO:
 * - Status lido do arquivo físico (src/database/grupos/<grupo>.json),
 *   mesma fonte que o painel !menuprot usa e que o nable.js escreve.
 * - Checagem de admin limpa o JID (sufixo de dispositivo / @lid) antes
 *   de comparar, igual main-antilink.js.
 * - Alerta com botão do canal + formatação em citação, igual antilink.
 * - Ao detectar: FECHA o grupo na hora (trava qualquer msg nova, mesmo
 *   de outro atacante coordenado) → apaga a msg → avisa → bane → reabre.
 * - Trava contra duplicidade: 2 mensagens de pagamento quase juntas não
 *   disparam 2 avisos/bans.
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
        console.error('[ANTIPAGAMENTO] Erro ao enviar msg com botão, caindo pro texto simples:', e)
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

// Evita banir/avisar em duplicidade quando chegam 2+ mensagens de
// "pagamento" quase juntas — trava o GRUPO (não só o atacante) até o
// ciclo fechar-banir-reabrir terminar.
global.antipagamentoProcessando = global.antipagamentoProcessando || new Set()

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
        const isAntipagamentoAtivo = !!(cfg.antipagamento === true || cfg.antipay === true || cfg.antipix === true)
        if (!isAntipagamentoAtivo) return

        // Se o grupo já está em processo de fechar/banir/reabrir, ignora
        // qualquer outra mensagem de pagamento que chegue nesse meio tempo
        if (global.antipagamentoProcessando.has(m.chat)) return

        const listaMembros = participants || groupMetadata?.participants || []

        // Checa se o remetente é admin (comparação limpa, não string exata)
        const senderAdmin = listaMembros.some(p => idsDe(p).includes(senderClean) && ehAdmin(p))
        if (senderAdmin) return

        // Checa se o bot é admin
        const rawBotJid = conn.user?.id || conn.user?.jid || ''
        const botNumberClean = limpar(rawBotJid)
        const botLid = limpar(conn.user?.lid || '')
        const isBotAdmin = listaMembros.some(p => {
            const ids = idsDe(p)
            return (ids.includes(botNumberClean) || (botLid && ids.includes(botLid))) && ehAdmin(p)
        })

        // Detecta qualquer vestígio de mensagem de pagamento ou pedido (Ghost Payment)
        const paymentTypes = ['paymentInviteMessage', 'requestPaymentMessage', 'orderMessage', 'paymentMessage']
        const isPaymentSpam = paymentTypes.includes(m.mtype) ||
            !!m.message?.paymentInviteMessage ||
            !!m.message?.requestPaymentMessage

        if (!isPaymentSpam) return

        global.antipagamentoProcessando.add(m.chat)

        try {
            if (isBotAdmin) {
                // PASSO 1: fecha o grupo na hora — trava qualquer mensagem
                // nova (mesmo de outro atacante coordenado) enquanto o
                // resto do processo roda
                await conn.groupSettingUpdate(m.chat, 'announcement').catch(() => {})
            }

            // PASSO 2: avisa (não dá pra apagar requestPaymentMessage/
            // paymentInviteMessage — o WhatsApp não permite excluir esse
            // tipo de mensagem, então nem tenta mais)
            const userTag = `@${senderClean}`
            const texto =
                `*🛡️ PROTEÇÃO ANTI-PAGAMENTO*\n\n` +
                `> ${userTag} detectado enviando pagamento/spam.\n\n` +
                `_Inseto sendo removido._ 💀`

            await sendComBotao(conn, m.chat, texto, m, [m.sender])

            // PASSO 3: bane
            if (isBotAdmin) {
                console.log(`[ANTIPAGAMENTO] Banindo ${m.sender} de ${m.chat}...`)
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch((e) => {
                    console.error('[ANTIPAGAMENTO] Falha ao remover:', e.message)
                })

                // PASSO 4: reabre o grupo
                await new Promise(r => setTimeout(r, 500))
                await conn.groupSettingUpdate(m.chat, 'not_announcement').catch(() => {})
            }
        } finally {
            // Libera a trava logo após o ciclo terminar (um pequeno
            // delay de segurança contra mensagens que ainda estejam
            // na fila de processamento)
            setTimeout(() => global.antipagamentoProcessando.delete(m.chat), 5000)
        }
    } catch (e) {
        console.error('[ANTIPAGAMENTO] Erro no middleware:', e)
        global.antipagamentoProcessando.delete(m.chat)
    }
}