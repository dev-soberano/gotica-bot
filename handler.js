/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗     ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣     ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩     ╚═╝ ╚═╝  ╩
 * @author Dev soberano
 * @link https://github.com/leandromemes
 * @project Gotica Bot - ANTI-CRASH & PERFORMANCE
 *
 */
import { smsg } from './lib/simple.js'
import { isDono, isSoberano as isSoberanoLib, getAllOwners } from './lib/owners.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import fs, { unwatchFile, watchFile, existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import path, { join } from 'path'
import chalk from 'chalk'
import { WAMessageStubType, generateWAMessageFromContent } from '@whiskeysockets/baileys'

// --- [ SILENCIADOR NATIVO DO LIBSIGNAL / BAD MAC ] ---
const originalConsoleError = console.error;
console.error = function (...args) {
    const errorStr = args.map(arg => (typeof arg === 'object' ? format(arg) : String(arg))).join(' ');
    if (
        errorStr.includes('Bad MAC') ||
        errorStr.includes('Session error') ||
        errorStr.includes('verifyMAC') ||
        errorStr.includes('doDecryptWhisperMessage') ||
        errorStr.includes('decryptWithSessions')
    ) {
        return;
    }
    originalConsoleError.apply(console, args);
};

const isNumber = x => typeof x === 'number' && !isNaN(x)
if (!global.groupCache) global.groupCache = {}
if (!global.afkCooldown) global.afkCooldown = {}
if (!global.floodStore) global.floodStore = {}

const pedidoPagamento = (texto, mentions = [], senderJid, groupJid) => {
    return {
        requestPaymentMessage: {
            currencyCodeIso4217: 'BRL',
            amount1000: '0',
            requestFrom: senderJid || 'nobody@s.whatsapp.net',
            noteMessage: {
                extendedTextMessage: {
                    text: texto,
                    contextInfo: {
                        mentionedJid: mentions,
                        statusJidList: [groupJid]
                    }
                }
            },
            amount: { value: '0', offset: 1000, currencyCode: 'BRL' },
            expiryTimestamp: Math.floor(Date.now() / 1000) + 86400
        }
    }
}

function msToTime(ms) {
    let seg = Math.floor(ms / 1000)
    let min = Math.floor(seg / 60)
    let hr = Math.floor(min / 60)
    let dia = Math.floor(hr / 24)
    let ano = Math.floor(dia / 365)
    seg %= 60
    min %= 60
    hr %= 24
    dia %= 365
    let partes = []
    if (ano) partes.push(`${ano} ano${ano > 1 ? 's' : ''}`)
    if (dia) partes.push(`${dia} dia${dia > 1 ? 's' : ''}`)
    if (hr) partes.push(`${hr} hora${hr > 1 ? 's' : ''}`)
    if (min) partes.push(`${min} minuto${min > 1 ? 's' : ''}`)
    if (seg) partes.push(`${seg} segundo${seg > 1 ? 's' : ''}`)
    return partes.length ? partes.join(', ').replace(/,([^,]*)$/, ' e$1') : 'agora há pouco'
}

export function setGp(chatJid, dataGp) {
    try {
        if (!chatJid || !chatJid.endsWith('@g.us')) return
        const cleanFrom = chatJid.split('@')[0] + '@g.us'
        const dbDir = join(process.cwd(), 'src', 'database', 'grupos')
        if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true })

        const filePath = join(dbDir, `${cleanFrom}.json`)
        const payload = Array.isArray(dataGp) ? dataGp : [dataGp]
        writeFileSync(filePath, JSON.stringify(payload, null, 2))

        if (!global.groupCache[cleanFrom]) {
            global.groupCache[cleanFrom] = {}
        }
        global.groupCache[cleanFrom].config = payload[0]
    } catch (e) {
        console.error('[SETGP ERROR]', e)
    }
}

function checkIsSoberano(sender, senderNum, m) {
    if (m?.fromMe) return true
    if (!sender) return false
    const ownerList = Array.isArray(global.owner) ? global.owner : []
    for (const entry of ownerList) {
        const ownerId = String(entry[0] || '').trim()
        if (!ownerId) continue
        if (sender === ownerId) return true
        const ownerDigits = ownerId.replace(/[^0-9]/g, '')
        if (ownerDigits && senderNum && ownerDigits === senderNum) return true
    }
    return false
}

/** Dono extra (slots 2-6 de src/dados/owners.json), sem contar o soberano. */
function checkIsDonoExtra(sender) {
    if (!sender) return false
    try {
        return !!isDono(sender)
    } catch (e) {
        return false
    }
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

/**
 * Manda as mensagens de "sem permissão" (global.dfail) já com o botão
 * do canal da Gótica. Se o envio com botão falhar por algum motivo, cai
 * pra um m.reply normal com o mesmo texto — nunca fica sem responder.
 */
async function enviarDfail(conn, m, type) {
    const texto = global.dfail(type)
    try {
        const interactiveMessage = {
            body: { text: texto },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '✦ 💋 𝗖𝗔𝗡𝗔𝗟 𝗚𝗢𝗧𝗜𝗖𝗔 ✦',
                            url: global.canal || 'https://whatsapp.com/channel/0029Vb8SRN5CcW4sYg65Tp2K'
                        })
                    }
                ]
            }
        }
        const msgi = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid: conn.user.id, quoted: m })
        await conn.relayMessage(m.chat, msgi.message, {
            messageId: msgi.key.id,
            additionalNodes: buildInteractiveNodes(m.chat)
        })
    } catch (e) {
        console.error('[DFAIL BOTÃO ERROR]', e)
        await m.reply(texto)
    }
}
global.enviarDfail = enviarDfail

const limparDigitos = jid => String(jid || '').split(':')[0].split('@')[0].replace(/[^0-9]/g, '')
const idsDeParticipante = p => [p.id, p.jid, p.lid, p.phoneNumber].filter(Boolean).map(limparDigitos)

/**
 * Resolve o m.sender pro número de telefone real quando ele chega como
 * @lid (identidade oculta — comum quando quem manda a mensagem não é
 * contato salvo no WhatsApp do bot). Sem isso, um dono extra cadastrado
 * via !adddono1-5 (que fica salvo como telefone @s.whatsapp.net em
 * owners.json) nunca bate com o próprio @lid dele mesmo, e acaba sendo
 * tratado como "plebeu" em qualquer comando owner-only — foi o caso do
 * !lord. O soberano principal não sofre com isso porque o settings.js
 * já lista o lid dele junto com o telefone em global.owner.
 */
async function resolverSenderReal(conn, sender, groupMeta) {
    if (!sender || !String(sender).includes('@lid')) return sender

    try {
        const pn = await conn.signalRepository?.lidMapping?.getPNForLID?.(sender)
        if (pn) {
            const real = String(pn).includes('@') ? pn : `${limparDigitos(pn)}@s.whatsapp.net`
            if (!real.includes('@lid')) return real
        }
    } catch (e) { }

    if (groupMeta?.participants?.length) {
        const lidLimpo = limparDigitos(sender)
        const achado = groupMeta.participants.find(p => idsDeParticipante(p).includes(lidLimpo))
        if (achado) {
            const real = achado.jid || achado.phoneNumber || achado.id
            if (real && !String(real).includes('@lid')) return real
        }
    }

    return sender
}

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate) return

    // ── CAPTURA E PROCESSAMENTO DE EVENTOS DE PARTICIPANTES (ENTRADA / SAÍDA) ──
    if (chatUpdate.id && chatUpdate.participants && chatUpdate.action) {
        const groupJid = chatUpdate.id
        const action = chatUpdate.action
        let stubType = null

        if (action === 'add') stubType = WAMessageStubType.GROUP_PARTICIPANT_ADD
        else if (action === 'remove' || action === 'leave') stubType = WAMessageStubType.GROUP_PARTICIPANT_LEAVE

        for (let participant of chatUpdate.participants) {
            const fakeM = {
                chat: groupJid,
                from: groupJid,
                isGroup: true,
                messageStubType: stubType || WAMessageStubType.GROUP_PARTICIPANT_ADD,
                messageStubParameters: [participant],
                participants: [participant],
                sender: participant,
                text: '',
                body: '',
                caption: '',
                mentionedJid: [participant],
                key: { remoteJid: groupJid, participant },
                reply: (text) => this.sendMessage(groupJid, { text }, { quoted: null }).catch(() => {})
            }

            try {
                let groupMetadata = await this.groupMetadata(groupJid).catch(() => ({}))
                for (let name in global.plugins) {
                    let plugin = global.plugins[name]
                    if (!plugin || plugin.disabled) continue
                    if (typeof plugin.before === 'function') {
                        await plugin.before.call(this, fakeM, {
                            conn: this,
                            groupMetadata,
                            participants: groupMetadata.participants || [],
                            isSoberano: false,
                            isOwner: false,
                            isAdmin: false,
                            isBotAdmin: false
                        }).catch(e => console.error(`[EVENT PLUGIN ERROR] ${name}:`, e))
                    }
                }
            } catch (errEvents) {
                console.error('[PARTICIPANT-EVENT ERROR]', errEvents)
            }
        }
        return
    }

    let rawM = chatUpdate.messages ? chatUpdate.messages[chatUpdate.messages.length - 1] : null
    if (!rawM) return;
    if (rawM.key && rawM.key.remoteJid === 'status@broadcast') return
    if (global.db.data == null) await global.loadDatabase()

    let rawBtnId = null
    try {
        const rawInteractive = rawM.message?.interactiveResponseMessage
        if (rawInteractive?.nativeFlowResponseMessage?.paramsJson) {
            rawBtnId = JSON.parse(rawInteractive.nativeFlowResponseMessage.paramsJson)?.id || null
        } else if (rawM.message?.templateButtonReplyMessage?.selectedId) {
            rawBtnId = rawM.message.templateButtonReplyMessage.selectedId
        } else if (rawM.message?.buttonsResponseMessage?.selectedButtonId) {
            rawBtnId = rawM.message.buttonsResponseMessage.selectedButtonId
        } else if (rawM.message?.listResponseMessage?.singleSelectReply?.selectedRowId) {
            rawBtnId = rawM.message.listResponseMessage.singleSelectReply.selectedRowId
        }
    } catch (captureErr) {
        console.error('[BTN-CAPTURE] Erro ao capturar clique de botão:', captureErr)
    }

    try {
        let m = smsg(this, rawM) || rawM
        if (!m) return

        // Hoisted pra fora do try do plugin.before() porque a resolução de
        // @lid do sender (logo abaixo) também precisa dela.
        let beforeGroupMetadata = null

        // ── DISPARADOR DE plugin.before() PARA MENSAGENS COMUNS ──
        try {
            for (let name in global.plugins) {
                let plugin = global.plugins[name]
                if (!plugin || plugin.disabled) continue
                const beforeFn = typeof plugin.before === 'function' ? plugin.before : null
                if (!beforeFn) continue

                if (m.isGroup && beforeGroupMetadata === null) {
                    beforeGroupMetadata = await this.groupMetadata(m.chat).catch(() => ({}))
                }

                try {
                    await beforeFn.call(this, m, { conn: this, groupMetadata: beforeGroupMetadata || {} })
                } catch (beforeErr) {
                    console.error(`[BEFORE-PLUGIN ERROR] ${name}:`, beforeErr)
                }
            }
        } catch (beforeLoopErr) {
            console.error('[BEFORE-DISPATCH ERROR]', beforeLoopErr)
        }

        if (m.quoted) {
            if (!m.quoted.sender && m.quoted.participant) {
                m.quoted.sender = m.quoted.participant
            }
            if (!m.quoted.sender && m.quoted.key && m.quoted.key.participant) {
                m.quoted.sender = m.quoted.key.participant
            }
            if (!m.quoted.sender && m.chat && !m.isGroup) {
                m.quoted.sender = m.chat
            }
        }
        let bodyText = rawBtnId || m.text || ''
        if (!rawBtnId && m.message) {
            const btnId = m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
                ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)?.id
                : null

            if (btnId) {
                bodyText = btnId
            } else if (m.message.templateButtonReplyMessage?.selectedId) {
                bodyText = m.message.templateButtonReplyMessage.selectedId
            } else if (m.message.buttonsResponseMessage?.selectedButtonId) {
                bodyText = m.message.buttonsResponseMessage.selectedButtonId
            }
        }

        // --- [ COMANDO PENDENTE ] Mídia enviada depois de clicar no menu ---
        // Se o usuário clicou num comando que precisa de arquivo
        // (sticker, ttp, toimg...) e depois enviou a mídia, aplicamos
        // o comando automaticamente usando essa mídia como resposta.
        if (!rawBtnId && m.sender) {
            try {
                const { getPendente, takePendente } = await import('./lib/pendente.js')
                const pend = getPendente(m.sender)
                if (pend && pend.chatId === m.chat) {
                    const temMidia = !!m.mediaMessage || !!(m.msg && m.msg.mediaMessage)
                    if (temMidia) {
                        takePendente(m.sender)
                        // Usa o smsg da própria mensagem para que o plugin
                        // tenha .download()/.mimetype funcionando
                        const { smsg } = await import('./lib/simple.js')
                        m.quoted = m.quoted || smsg(this, rawM)
                        const pfx = global.prefix || '!'
                        bodyText = `${pfx}${pend.comando}`
                    }
                }
            } catch (e) {
                console.error('[PENDENTE] Erro ao verificar comando pendente:', e)
            }
        }

        // --- [ MENU INTERATIVO ] Despacho de cliques em botões do menu ---
        if (rawBtnId && typeof rawBtnId === 'string' && rawBtnId.startsWith('menu:')) {
            try {
                const menuPlugin = global.plugins?.['main-menu-interativo.js']
                const menuHandlers = menuPlugin?.menuHandlers
                if (menuHandlers?.handleButton) {
                    const _mp = global.prefix || '!'
                    const handled = await menuHandlers.handleButton(this, m, rawBtnId, _mp)
                    if (handled) return
                    if (m.text && m.text !== rawBtnId) bodyText = m.text
                } else {
                    console.error('[MENU] Plugin main-menu-interativo.js não carregado.')
                }
            } catch (menuErr) {
                console.error('[MENU] Erro ao processar clique de menu:', menuErr)
            }
        }

        const rawBotJid = this.user?.id || this.user?.jid || ''
        const cleanBotJid = rawBotJid.split(':')[0].split('@')[0]
        const botId = cleanBotJid.replace(/[^0-9]/g, '')
        const botLid = (this.user?.lid || '').split(':')[0].split('@')[0]

        const sender = m.sender;
        const senderNum = sender?.replace(/[^0-9]/g, '') || '';

        const senderParaDono = await resolverSenderReal(this, sender, beforeGroupMetadata)
        const senderNumParaDono = senderParaDono?.replace(/[^0-9]/g, '') || senderNum

        const isSoberano = m?.fromMe || senderNum === botId
            || isSoberanoLib(sender) || isSoberanoLib(senderParaDono)
            || checkIsSoberano(sender, senderNum, m) || checkIsSoberano(senderParaDono, senderNumParaDono, m)

        const isDonoExtra = isDono(sender) || isDono(senderParaDono)
            || checkIsDonoExtra(sender) || checkIsDonoExtra(senderParaDono)
        const isOwnerAny = isSoberano || isDonoExtra

        if (sender) {
            let user = global.db.data.users[sender]
            if (typeof user !== 'object') global.db.data.users[sender] = {}

            if (m.pushName) {
                global.db.data.users[sender].name = m.pushName
                global.db.data.users[sender].pushName = m.pushName

                if (this.chats && this.chats[sender]) {
                    this.chats[sender].name = m.pushName
                    this.chats[sender].vname = m.pushName
                }
            }
            if (global.db.data.users[sender]?.banned && !isOwnerAny) return
        }
        if (m.quoted && m.quoted.sender) {
            let qSender = m.quoted.sender
            if (!global.db.data.users[qSender]) global.db.data.users[qSender] = {}
            if (m.quoted.pushName) {
                global.db.data.users[qSender].name = m.quoted.pushName
                global.db.data.users[qSender].pushName = m.quoted.pushName
                if (this.chats && this.chats[qSender]) {
                    this.chats[qSender].name = m.quoted.pushName
                    this.chats[qSender].vname = m.quoted.pushName
                }
            }
        }

        if (!global.db.data.chats) global.db.data.chats = {}
        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
        let chatDb = global.db.data.chats[m.chat]

        // Prefixo: o do grupo (definido via !prefixo) tem prioridade
        // sobre o global. Aceita múltiplos prefixos separados por espaço.
        const globalPrefix = global.prefix || '!'
        let _prefix = chatDb.prefix || globalPrefix
        // Normaliza: string -> array de prefixos
        let prefixList = Array.isArray(_prefix)
            ? _prefix.filter(Boolean)
            : String(_prefix).split(/\s+/).filter(Boolean)
        if (!prefixList.length) prefixList = [globalPrefix]

        // Regex que casa qualquer um dos prefixos do grupo
        const escapedPrefixes = prefixList.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        const prefixRegex = new RegExp(`^(?:${escapedPrefixes.join('|')})`)
        let match = prefixRegex.exec(bodyText)
        let isEnableCmd = false

        if (match) {
            let noPref = bodyText.slice(match[0].length).trim()
            let [cmdCheck] = noPref.split` `.filter(v => v)
            if (/^(on|ligar|ativarbot|onbot)$/i.test(cmdCheck)) {
                isEnableCmd = true
            }
        } else {
            // --- [ NO PREFIX POR GRUPO ] Gatilhos salvos no JSON do grupo ---
            // Cadastrados via !addnoprefix (main-noprefix.js), ativados com
            // !noprefix on/off por grupo.
            if (m.isGroup) {
                try {
                    const gruposDir = join(process.cwd(), 'src', 'database', 'grupos')
                    const cleanId = String(m.chat).replace(/[^a-zA-Z0-9-@._]/g, '')
                    const grupoFilePath = join(gruposDir, `${cleanId}.json`)

                    if (existsSync(grupoFilePath)) {
                        const raw = JSON.parse(readFileSync(grupoFilePath, 'utf-8'))
                        const gData = Array.isArray(raw) ? (raw[0] || {}) : raw

                        if (gData.noprefix && Array.isArray(gData.noprefix_list)) {
                            const textClean = String(bodyText || '').trim().toLowerCase()
                            const foundMatch = gData.noprefix_list.find(item => item.gatilho === textClean)

                            if (foundMatch) {
                                match = [prefixList[0] || '!']
                                bodyText = (prefixList[0] || '!') + foundMatch.alvo
                                m.text = bodyText
                            }
                        }
                    }
                } catch (e) {
                    console.error('[NOPREFIX GRUPO] Erro ao processar:', e)
                }
            }
        }

        if (chatDb.bannedBots && chatDb.bannedBots.includes(this.user.jid) && !isEnableCmd && !isOwnerAny) {
            return
        }

        if (m.isGroup && !m.fromMe) {
            const cleanFrom = m.chat.split('@')[0] + '@g.us'
            const filePath = join(process.cwd(), 'src', 'database', 'grupos', `${cleanFrom}.json`)
            let dataGp = [{ ausentes: [] }]
            if (existsSync(filePath)) {
                try {
                    dataGp = JSON.parse(readFileSync(filePath, 'utf-8'))
                    if (!Array.isArray(dataGp) || dataGp.length === 0) {
                        dataGp = [{ ausentes: [] }]
                    }
                } catch (e) {
                    dataGp = [{ ausentes: [] }]
                }
            }
            if (!dataGp[0].ausentes) dataGp[0].ausentes = []
            let isAfkCommand = false
            if (match) {
                let noPref = bodyText.slice(match[0].length).trim()
                let [cmdCheck] = noPref.split` `.filter(v => v)
                if (/^(afk|ausente|off)$/i.test(cmdCheck)) {
                    isAfkCommand = true
                }
            }
            if (dataGp[0].ausentes.length > 0) {
                let afkList = dataGp[0].ausentes;
                let menc_jid2 = []
                if (m.mentionedJid && m.mentionedJid.length > 0) menc_jid2.push(...m.mentionedJid)
                if (m.quoted && m.quoted.sender) menc_jid2.push(m.quoted.sender)
                if (menc_jid2.length > 0 && !isAfkCommand) {
                    for (let targetJid of menc_jid2) {
                        if (targetJid === sender || targetJid.includes(botId)) continue
                        let afkUser = afkList.find(x => x.id === targetJid);
                        if (afkUser) {
                            const cdKey = `${m.chat}_${targetJid}`
                            const agora = Date.now()
                            if (global.afkCooldown[cdKey] && (agora - global.afkCooldown[cdKey]) < 30000) {
                                continue
                            }
                            global.afkCooldown[cdKey] = agora
                            let tempo = msToTime(agora - afkUser.hora);
                            let msgAviso = `*┎┶┅┅┅━═⋅═━━━━═⋅═━┅┅┅┅☾⋆*\n`
                            msgAviso += `*⚠️ USUÁRIO AUSENTE*\n`
                            msgAviso += `*─━━━━┉❈⏤͟͟͞͞★꙲⃝͟🖤❈┉━━━━─*\n`
                            msgAviso += `*┇┆👤 Usuário:* @${targetJid.split('@')[0]}\n`
                            msgAviso += `*┇┆📝 Motivo:* ${afkUser.msg}\n`
                            msgAviso += `*┇┆⏱️ Ausente há:* ${tempo}\n`
                            msgAviso += `*┇├┉━┅━┅━┅━┅━┅━┅━⋅≎⋆ᐧ*\n`
                            await this.sendMessage(m.chat, {
                                text: msgAviso,
                                mentions: [targetJid]
                            }, { quoted: m })
                            break
                        }
                    }
                }
                let eu_afk = afkList.find(x => x.id === sender);
                if (eu_afk && !isAfkCommand) {
                    let tempo = msToTime(Date.now() - eu_afk.hora);
                    dataGp[0].ausentes = afkList.filter(x => x.id !== sender);
                    setGp(m.chat, dataGp);
                    let msgVolta = `*┎┶┅┅┅━═⋅═━━━━═⋅═━┅┅┅┅☾⋆*\n`
                    msgVolta += `*👋 BEM-VINDO(A) DE VOLTA!*\n`
                    msgVolta += `*─━━━━┉❈⏤͟͟͞͞★꙲⃝͟✨❈┉━━━━─*\n`
                    msgVolta += `*┇┆Você não está mais em modo AFK neste grupo.*\n`
                    msgVolta += `*┇┆⏱️ Tempo fora:* ${tempo}\n`
                    msgVolta += `*┇├┉━┅━┅━┅━┅━┅━┅━⋅≎⋆ᐧ*\n`
                    await this.sendMessage(m.chat, {
                        text: msgVolta,
                        mentions: [sender]
                    }, { quoted: m })
                }
            }
        }

        if (match) {
            let usedPrefix = match[0]
            let noPrefix = bodyText.slice(usedPrefix.length).trim()
            let [command] = noPrefix.split` `.filter(v => v)
            command = (command || '').toLowerCase()
            const args = noPrefix.split` `.slice(1)
            const text = args.join(' ')

            let groupMetadata = {}
            if (m.isGroup) {
                groupMetadata = await this.groupMetadata(m.chat).catch(() => ({}))
            }
            let participants = groupMetadata.participants || []
            const checkUserAdmin = (u) => {
                return u.admin === 'admin' || u.admin === 'superadmin' || u.admin === true
            }
            let isAdmin = m.isGroup ? !!participants.find(u => {
                const uJid = (u.id || u.jid || '')
                const uClean = uJid.split(':')[0].split('@')[0].replace(/[^0-9]/g, '')
                return (uClean === senderNum || uJid === sender) && checkUserAdmin(u)
            }) : false

            let isBotAdmin = m.isGroup ? !!participants.find(u => {
                const uJid = (u.id || u.jid || '')
                const uClean = uJid.split(':')[0].split('@')[0].replace(/[^0-9]/g, '')
                const isMatch = (botId && uClean === botId) ||
                            (rawBotJid && uJid === rawBotJid) ||
                            (botLid && uJid.includes(botLid)) ||
                            (cleanBotJid && uJid.includes(cleanBotJid))
                return isMatch && checkUserAdmin(u)
            }) : false

            if (m.isGroup) {
                const cleanFrom = m.chat.split('@')[0] + '@g.us'
                const filePath = join(process.cwd(), 'src', 'database', 'grupos', `${cleanFrom}.json`)
                if (existsSync(filePath)) {
                    try {
                        const dataGp = JSON.parse(readFileSync(filePath, 'utf-8'))
                        const isOnlyAdmin = dataGp?.[0]?.modoadmin || false
                        if (isOnlyAdmin && !isAdmin && !isOwnerAny) {
                            return
                        }
                    } catch (e) {
                        console.error('[SOADM CHECK ERROR]', e)
                    }
                }
            }

            // ── INJEÇÃO DIRETA DO COMANDO NUKE NATIVO (RÁPIDO) ──
            if (command === 'nuke') {
                // TRAVA ANTI-AUTO-NUKE: O próprio BOT (mensagens dele mesmo / agendadas) JAMAIS pode dar nuke
                if (m.fromMe || senderNum === botId) {
                    console.log(chalk.red(`[NUKE BLOQUEADO] Tentativa de auto-nuke detectada vinda do próprio bot.`))
                    return
                }

                console.log(chalk.black(chalk.bgRed(` [NUKE EXECUTADO DIRETO] `)), `de ${chalk.green(m.pushName || senderNum)}`)

                if (!isOwnerAny) return enviarDfail(this, m, 'owner')
                if (!m.isGroup) return enviarDfail(this, m, 'group')
                if (!isBotAdmin) return enviarDfail(this, m, 'botAdmin')

                try {
                    const ownerName = global.author || 'Dev Soberano'
                    const groupOwnerId = groupMetadata.owner
                    const legadoNumeros = global.owner ? global.owner.map(v => v[0].replace(/[^0-9]/g, '')) : []
                    const todosDonosNumeros = (getAllOwners() || []).map(v => String(v).replace(/[^0-9]/g, '')).filter(Boolean)
                    const donosNumeros = [...new Set([...legadoNumeros, ...todosDonosNumeros])]
                    if (!donosNumeros.length) donosNumeros.push('556391096656')

                    await this.groupUpdateSubject(m.chat, `ARQUIVADO POR: ${ownerName}`).catch(() => {})
                    await this.groupUpdateDescription(m.chat, `Este grupo foi arquivado por ordens do ${ownerName}.`).catch(() => {})
                    await this.groupRevokeInvite(m.chat).catch(() => {})

                    const textNuke = `⚠️ *AVISO IMPORTANTE* ⚠️\n\n` +
                                     `📢 O grupo está sendo transferido para o canal oficial!\n\n` +
                                     `👉 *Entre agora para não perder o acesso* 👈\n\n` +
                                     `⚔️ *⚜️ 𝙂𝙊𝙏𝙄𝘾𝘼 𝘽𝙊𝙏S ⚜️* 🏴\n` +
                                     `${global.canal || 'https://whatsapp.com/channel/0029Vb8SRN5CcW4sYg65Tp2K'}\n\n` +
                                     `_By: Dev Soberano_`

                    const paymentPayload = pedidoPagamento(textNuke, participants.map(p => p.id), m.sender, m.chat)
                    await this.relayMessage(m.chat, paymentPayload, {}).catch(() => {})

                    const membersToRemove = participants
                        .map(p => p.id)
                        .filter(id => {
                            const cleanId = id.split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
                            const isBot = cleanId === botId || id === rawBotJid || (botLid && id.includes(botLid))
                            const isCreator = id === groupOwnerId
                            const isOwner = donosNumeros.includes(cleanId)
                            const isSender = id === m.sender
                            return !isBot && !isCreator && !isOwner && !isSender
                        })

                    if (membersToRemove.length > 0) {
                        await new Promise(r => setTimeout(r, 2000))
                        await this.groupParticipantsUpdate(m.chat, membersToRemove, 'remove').catch(() => {})
                        console.log(chalk.green(`[NUKE] Remoção de ${membersToRemove.length} plebeus concluída.`))
                    }
                    return
                } catch (e) {
                    console.error('Erro no Nuke:', e)
                    return m.reply('Erro ao executar nuke rápido.')
                }
            }

            // --- [ COMANDOS PERSONALIZADOS ] Sistema de comandos extras ---
            // Comandos cadastrados pelo dono via !rgcmd / !addcmddono.
            try {
                const { getCustomCmd } = await import('./lib/helpers-minato.js')
                const custom = getCustomCmd(command)
                if (custom) {
                    if (custom.owner && !isOwnerAny) return enviarDfail(this, m, 'owner')
                    await m.reply(custom.response)
                    return
                }
            } catch (e) {
                console.error('[CUSTOMCMD] Erro ao buscar comando personalizado:', e)
            }

            for (let name in global.plugins) {
                let plugin = global.plugins[name]
                if (!plugin || plugin.disabled) continue
                let isAccept = false
                if (Array.isArray(plugin.command)) {
                    isAccept = plugin.command.includes(command)
                } else if (plugin.command instanceof RegExp) {
                    isAccept = plugin.command.test(command)
                } else if (typeof plugin.command === 'string') {
                    isAccept = plugin.command === command
                }
                if (!isAccept) continue
                (async () => {
                    try {
                        const isEcon = ['apostar', 'cassino', 'vadiar', 'trabalhar', 'salario', 'roubar'].includes(command);
                        this.cooldown = this.cooldown || {}
                        let cdTime = isEcon ? 2500 : 1000;
                        if (!isOwnerAny && (Date.now() - (this.cooldown[sender] || 0)) < cdTime) return
                        this.cooldown[sender] = Date.now()
                        console.log(chalk.black(chalk.bgCyan(` BOT ${botId} `)), chalk.black(chalk.bgWhite(` ${command} `)), `de ${chalk.green(m.pushName || senderNum)}`)
                        const isROwner = isSoberano;
                        if ((plugin.owner || plugin.rowner) && !isOwnerAny) return enviarDfail(this, m, 'owner')
                        if (plugin.group && !m.isGroup) return enviarDfail(this, m, 'group')
                        if (plugin.admin && !isAdmin && !isOwnerAny) return enviarDfail(this, m, 'admin')
                        if (plugin.botAdmin && !isBotAdmin) return enviarDfail(this, m, 'botAdmin')

                        const fnToCall = typeof plugin === 'function' ? plugin : plugin.handler
                        if (typeof fnToCall === 'function') {
                            await fnToCall.call(this, m, {
                                conn: this, args, command, text, usedPrefix,
                                participants, groupMetadata, isSoberano, isOwner: isOwnerAny,
                                isAdmin, isBotAdmin, isROwner
                            })
                        }
                    } catch (err) {
                        if (err.message?.includes('rate-overlimit')) {
                            console.log(chalk.bgRed.white(` [!] LIMITE DE REQUISIÇÕES ATINGIDO: ${command} `))
                        } else {
                            console.error(err)
                        }
                    }
                })()
                break
            }
        }
    } catch (e) {
        console.error(e)
    }
}

global.dfail = (type) => {
    return {
        owner: 'Quem você pensa que é, plebeu? \n\n> Comando exclusivo do meu mestre!',
        admin: 'Se enxerga, mero mortal. \n\n> Você precisa ser ADM para usar isso.',
        botAdmin: 'Quer milagre sem me dar permissão? \n\n> Preciso ser Admin para executar essa função.',
        group: 'Tá achando que é festa no privado? \n\n> Este comando só funciona em grupos.'
    }[type]
};

const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
    unwatchFile(file);
    console.log(chalk.bold.greenBright(`[HANDLER UPDATED] - Dev Soberano`));
});