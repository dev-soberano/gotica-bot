/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Dev soberano
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 *
 * Sistema de Donos (dono1..dono6) — Resolução Automática de @lid (@ e respostas)
 *
 * CORRIGIDO: quando a pessoa marcada ou respondida aparece pro bot como
 * @lid (identidade "oculta" do WhatsApp, comum em quem não é contato
 * salvo), o código antigo caía num fallback que pegava os dígitos do
 * PRÓPRIO número de lid e tentava usar como se fosse o telefone real —
 * por isso aparecia um "número" gigante tipo +173195277643813, que não
 * é um telefone de verdade, é só o identificador interno do lid.
 *
 * Agora a resolução de @lid é igual à usada no antifake (index.js):
 * 1) conn.signalRepository.lidMapping.getPNForLID()
 * 2) procura o lid dentro de groupMetadata.participants do grupo atual
 * 3) tenta de novo depois de um pequeno delay (o WhatsApp às vezes
 *    ainda não sincronizou o mapeamento na hora)
 * Se nada disso resolver, o comando AVISA que não conseguiu resolver o
 * número real, em vez de inventar um número errado.
 */

import { getDonoSlots, setDono, removeDono, getAllOwners, jidNum } from '../lib/owners.js'
import { painelDonos } from '../lib/molduras.js'
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'

const cwd = process.cwd()
const VIDEO_FIXO = path.join(cwd, 'src', 'menu', 'gotica-1.mp4')

function acharVideo() {
    try {
        if (fs.existsSync(VIDEO_FIXO)) return VIDEO_FIXO
    } catch { }

    const dir = path.join(cwd, 'src', 'menu')
    try {
        if (!fs.existsSync(dir)) return null
        const files = fs.readdirSync(dir).filter(f => /\.(mp4|mkv|webm)$/i.test(f))
        if (!files.length) return null
        return path.join(dir, files[0])
    } catch {
        return null
    }
}

const limpar = jid => String(jid || '').split(':')[0].split('@')[0].replace(/[^0-9]/g, '')
const idsDe = p => [p.id, p.jid, p.lid, p.phoneNumber].filter(Boolean).map(limpar)
const esperar = ms => new Promise(r => setTimeout(r, ms))

/**
 * Resolve um JID @lid para o JID de telefone real (@s.whatsapp.net).
 * Retorna null se não conseguir — nunca inventa um número.
 */
async function resolverLid(conn, m, lidJid) {
    const lidLimpo = limpar(lidJid)
    if (!lidLimpo) return null

    // 1) API nativa do Baileys pra mapear lid -> número de telefone
    try {
        const pn = await conn.signalRepository?.lidMapping?.getPNForLID?.(lidJid)
        if (pn) {
            const real = String(pn).includes('@') ? pn : `${limpar(pn)}@s.whatsapp.net`
            if (!real.includes('@lid')) return real
        }
    } catch (e) { }

    // 2) Procura o lid dentro dos participantes do grupo atual.
    // IMPORTANTE: nesse bot, "id"/"lid" É o próprio identificador oculto
    // (@lid) — quem carrega o número de telefone real é o campo "jid".
    // Por isso "jid"/"phoneNumber" têm prioridade sobre "id" aqui.
    async function buscarNosParticipantes() {
        if (!m.chat?.endsWith?.('@g.us')) return null
        try {
            const meta = await conn.groupMetadata(m.chat)
            const participantes = meta?.participants || []
            const achado = participantes.find(p => idsDe(p).includes(lidLimpo))
            if (achado) {
                const real = achado.jid || achado.phoneNumber || achado.id
                if (real && !String(real).includes('@lid')) return real
            }
        } catch (e) { }
        return null
    }

    let real = await buscarNosParticipantes()
    if (real) return real

    // 3) Tenta de novo depois de um pequeno delay (sync pode atrasar)
    await esperar(1200)
    real = await buscarNosParticipantes()
    if (real) return real

    return null
}

/** Converte qualquer JID (incluindo @lid ou menções) para o JID real de telefone. */
async function resolverJidReal(conn, m, text, args) {
    let alvoRaw = null

    // 1. Prioridade: Marcou com @
    if (Array.isArray(m.mentionedJid) && m.mentionedJid.length) {
        alvoRaw = m.mentionedJid[0]
    }
    // 2. Respondendo a uma mensagem
    else if (m.quoted?.sender) {
        alvoRaw = m.quoted.sender
    }
    // 3. Digitou um número
    else if (args[0]) {
        const numDig = String(args[0]).replace(/[^0-9]/g, '')
        if (numDig) alvoRaw = `${numDig}@s.whatsapp.net`
    }

    if (!alvoRaw) return { jid: null, erro: null }

    // Já é um JID de telefone normal (não é @lid) — usa direto
    if (!String(alvoRaw).includes('@lid')) {
        const cleanDigits = String(alvoRaw).split('@')[0].replace(/[^0-9]/g, '')
        if (cleanDigits && cleanDigits.length <= 15) {
            return { jid: `${cleanDigits}@s.whatsapp.net`, erro: null }
        }
    }

    // É @lid — resolve pro número real
    const real = await resolverLid(conn, m, alvoRaw)
    if (real) return { jid: real, erro: null }

    return {
        jid: null,
        erro: '❌ Não consegui descobrir o número real dessa pessoa (ela aparece como identidade oculta/@lid pro WhatsApp e ainda não sincronizou). Peça pra ela mandar uma mensagem no grupo e tente de novo em alguns segundos.'
    }
}

/** Formata um JID pra +556391096656 (número estrangeiro também funciona). */
function fmtMais(jid) {
    const num = jidNum(jid) || limpar(jid)
    return num ? `+${num}` : '—'
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

const handler = async (m, { conn, args, command, text, isSoberano }) => {
    const cmd = (command || '').toLowerCase()

    const addMatch = /^adddono([1-5])$/.exec(cmd)
    if (addMatch) {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const label = Number(addMatch[1])
        const slotReal = label + 1

        const { jid: alvoReal, erro } = await resolverJidReal(conn, m, text, args)
        if (erro) return m.reply(erro)
        if (!alvoReal) {
            return m.reply(`📝 *Uso:*\nMarque @alguém ou responda a mensagem da pessoa com *!adddono${label}*`)
        }

        const res = setDono(slotReal, alvoReal)
        if (!res.ok) return m.reply(`❌ ${res.msg}`)

        return m.reply(`✅ *Dono${label} definido com sucesso!*\n\n📱 Número: ${fmtMais(res.jid)}\n👑 _Bem-vindo ao alto escalão da Gótica!_`)
    }

    const rmMatch = /^rmdono([1-5])$/.exec(cmd)
    if (rmMatch) {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const label = Number(rmMatch[1])
        const slotReal = label + 1
        const res = removeDono(slotReal)
        if (!res.ok) return m.reply(`❌ ${res.msg}`)

        const removidoFmt = res.removed ? fmtMais(res.removed) : 'Slot limpo'
        return m.reply(`🗑️ *Dono${label} removido!*\n\n📱 Registro desvinculado: ${removidoFmt}`)
    }

    const slotMatch = /^dono([1-6])$/.exec(cmd)
    if (slotMatch) {
        const slot = Number(slotMatch[1])

        if (!args[0] && !(Array.isArray(m.mentionedJid) && m.mentionedJid.length) && !m.quoted) {
            const slots = getDonoSlots()
            const s = slots.find(x => x.slot === slot)
            if (!s?.definido) {
                return m.reply(`👑 *Dono${slot}*\n\n❌ Ainda não definido.\n\n💡 Use: *!setdono <numero> ${slot}*`)
            }
            return m.reply(`👑 *Dono${slot}*\n\n📱 *Número:* ${fmtMais(s.jid)}\n✅ *Ativo no sistema*`)
        }

        if (!isSoberano) return m.reply(global.dfail('owner'))

        const { jid: alvoReal, erro } = await resolverJidReal(conn, m, text, args)
        if (erro) return m.reply(erro)
        if (!alvoReal) return m.reply(`❌ Número/Usuário inválido.`)

        const res = setDono(slot, alvoReal)
        if (!res.ok) return m.reply(`❌ ${res.msg}`)
        return m.reply(`✅ *Dono${slot} definido!*\n\n📱 ${fmtMais(res.jid)}`)
    }

    if (cmd === 'setdono') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const { jid: alvoReal, erro } = await resolverJidReal(conn, m, text, args)
        if (erro) return m.reply(erro)
        const slot = args[1] || args[0]
        if (!alvoReal || !slot) {
            return m.reply(`📝 *Uso:*\n!setdono @alguém <slot 1-6>\nOu responda a mensagem com \`!setdono <slot>\``)
        }
        const res = setDono(slot, alvoReal)
        if (!res.ok) return m.reply(`❌ ${res.msg}`)
        return m.reply(`✅ *Dono${res.slot} definido!*\n\n📱 ${fmtMais(res.jid)}`)
    }

    if (cmd === 'rmdono' || cmd === 'deldono' || cmd === 'removedono') {
        if (!isSoberano) return m.reply(global.dfail('owner'))
        const slot = args[0]
        if (!slot) return m.reply(`📝 *Uso:*\n!rmdono <slot 1-6>\n\n*Exemplo:* \`!rmdono 3\``)
        const res = removeDono(slot)
        if (!res.ok) return m.reply(`❌ ${res.msg}`)
        return m.reply(`🗑️ *Dono${slot} removido com sucesso!*`)
    }

    if (cmd === 'donos' || cmd === 'listadono' || cmd === 'listdonos') {
        const slots = getDonoSlots()

        // Dono Principal (Slot 1)
        const soberano = slots.find(s => s.slot === 1)
        const numSoberano = soberano?.definido ? jidNum(soberano.jid) : ''
        const nomeSoberano = numSoberano ? `@${numSoberano}` : 'Soberano'

        // Donos 1 a 5 (Slots 2 a 6)
        const donosExtras = slots
            .filter(s => s.slot !== 1)
            .map(s => ({
                slot: s.slot - 1,
                valor: s.definido ? fmtMais(s.jid) : '「vago」'
            }))

        const caption = painelDonos({
            nome: nomeSoberano,
            numero: numSoberano,
            donos: donosExtras,
            bot: 'Gótica Bot'
        })

        const mentions = soberano?.jid ? [soberano.jid, m.sender] : [m.sender]

        try {
            await m.react('👑')
            const videoPath = acharVideo()

            if (videoPath && fs.existsSync(videoPath)) {
                const media = await prepareWAMessageMedia(
                    { video: fs.readFileSync(videoPath), gifPlayback: true },
                    { upload: conn.waUploadToServer }
                )

                const interactiveMessage = {
                    header: {
                        hasMediaAttachment: true,
                        videoMessage: media.videoMessage
                    },
                    headerType: 'VIDEO',
                    body: { text: caption },
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
                    },
                    contextInfo: { mentionedJid: mentions }
                }

                const msgi = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid: conn.user.id, quoted: m })

                await conn.relayMessage(m.chat, msgi.message, {
                    messageId: msgi.key.id,
                    additionalNodes: buildInteractiveNodes(m.chat)
                })
            } else {
                const interactiveMessage = {
                    body: { text: caption },
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
                    },
                    contextInfo: { mentionedJid: mentions }
                }

                const msgi = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid: conn.user.id, quoted: m })

                await conn.relayMessage(m.chat, msgi.message, {
                    messageId: msgi.key.id,
                    additionalNodes: buildInteractiveNodes(m.chat)
                })
            }
        } catch (e) {
            console.error('[DONOS ERROR]:', e)
            await conn.sendMessage(m.chat, { text: caption, mentions }, { quoted: m })
        }
        return
    }
}

handler.help = [
    'donos', 'dono1', 'dono2', 'dono3', 'dono4', 'dono5', 'dono6',
    'adddono1', 'adddono2', 'adddono3', 'adddono4', 'adddono5',
    'rmdono1', 'rmdono2', 'rmdono3', 'rmdono4', 'rmdono5',
    'setdono', 'rmdono'
]
handler.tags = ['owner']
handler.command = [
    'donos', 'listadono', 'listdonos',
    'dono1', 'dono2', 'dono3', 'dono4', 'dono5', 'dono6',
    'adddono1', 'adddono2', 'adddono3', 'adddono4', 'adddono5',
    'rmdono1', 'rmdono2', 'rmdono3', 'rmdono4', 'rmdono5',
    'setdono', 'rmdono', 'deldono', 'removedono'
]
handler.owner = true

export default handler