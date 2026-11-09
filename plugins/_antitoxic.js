/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 * @author Dev Soberano
 * @project Gotica Bot — ANTI-TÓXICO / ANTI-PALAVRÃO
 *
 * - !antitoxic on/off (ou antitoxico/antipalavrao) — liga/desliga por
 *   grupo, admin ou dono. Status lido/gravado no arquivo físico do grupo
 *   (src/database/grupos/<grupo>.json), mesma fonte do painel !menuprot.
 * - !addpalavrao <palavra> — SÓ O DONO do bot pode adicionar palavra à
 *   lista proibida (lista é global, vale pra todos os grupos que tiverem
 *   a proteção ativada).
 * - !delpalavrao <palavra> — SÓ O DONO pode remover.
 * - !listapalavrao — SÓ O DONO pode ver a lista completa.
 * - Detecção: se a proteção estiver ativa e alguém (que não seja admin
 *   nem dono) mandar uma mensagem contendo alguma palavra da lista, o
 *   bot avisa com botão → apaga a mensagem → bane.
 */
import fs from 'fs'
import path from 'path'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const DB_DIR = path.join(process.cwd(), 'src', 'database', 'grupos')
const PALAVROES_PATH = path.join(process.cwd(), 'src', 'database', 'palavroes.json')

const limpar = jid => String(jid || '').split(':')[0].split('@')[0].replace(/[^0-9]/g, '')
const ehAdmin = p => p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true
const idsDe = p => [p.id, p.jid, p.lid, p.phoneNumber].filter(Boolean).map(limpar)

function normalizar(txt) {
    return String(txt || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '') // tira acento
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
        console.error('[ANTITOXICO] Erro ao enviar msg com botão, caindo pro texto simples:', e)
        await conn.sendMessage(chatId, { text: texto, mentions }, { quoted }).catch(() => {})
    }
}

// ───────────────────────── Config por grupo (igual aos outros) ─────────────────────────
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

// ───────────────────────── Lista de palavras (global, só o dono mexe) ─────────────────────────
function lerPalavroes() {
    if (!fs.existsSync(PALAVROES_PATH)) return []
    try {
        const raw = fs.readFileSync(PALAVROES_PATH, 'utf-8')
        const parsed = raw ? JSON.parse(raw) : []
        return Array.isArray(parsed) ? parsed : []
    } catch (e) {
        return []
    }
}

function salvarPalavroes(lista) {
    const dir = path.dirname(PALAVROES_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(PALAVROES_PATH, JSON.stringify(lista, null, 2))
}

// ───────────────────────── Comandos ─────────────────────────
let handler = async (m, { conn, args, text, command, isAdmin, isOwner }) => {
    const cmd = (command || '').toLowerCase()

    // --- !addpalavrao <palavra> — SÓ DONO ---
    if (/^addpalavrao$/i.test(cmd)) {
        if (!isOwner) return sendComBotao(conn, m.chat, `\`🤬 ANTI-TÓXICO\`\n\n> ❌ Só o *dono do bot* pode adicionar palavras à lista.`, m)
        const palavra = normalizar(text)
        if (!palavra) return sendComBotao(conn, m.chat, `❌ _Use:_ *!addpalavrao <palavra>*`, m)

        const lista = lerPalavroes()
        if (lista.includes(palavra)) {
            return sendComBotao(conn, m.chat, `\`🤬 ANTI-TÓXICO\`\n\n> _Opa!_ A palavra *"${palavra}"* já está na lista.`, m)
        }
        lista.push(palavra)
        salvarPalavroes(lista)
        return sendComBotao(conn, m.chat, `\`🤬 ANTI-TÓXICO\`\n\n> ✅ Palavra *"${palavra}"* adicionada à lista proibida!\n\n_Agora ela será bloqueada em todos os grupos com a proteção ativada._`, m)
    }

    // --- !delpalavrao <palavra> — SÓ DONO ---
    if (/^(delpalavrao|rmpalavrao)$/i.test(cmd)) {
        if (!isOwner) return sendComBotao(conn, m.chat, `\`🤬 ANTI-TÓXICO\`\n\n> ❌ Só o *dono do bot* pode remover palavras da lista.`, m)
        const palavra = normalizar(text)
        if (!palavra) return sendComBotao(conn, m.chat, `❌ _Use:_ *!delpalavrao <palavra>*`, m)

        let lista = lerPalavroes()
        if (!lista.includes(palavra)) {
            return sendComBotao(conn, m.chat, `\`🤬 ANTI-TÓXICO\`\n\n> _Opa!_ A palavra *"${palavra}"* não está na lista.`, m)
        }
        lista = lista.filter(p => p !== palavra)
        salvarPalavroes(lista)
        return sendComBotao(conn, m.chat, `\`🤬 ANTI-TÓXICO\`\n\n> 🗑️ Palavra *"${palavra}"* removida da lista!`, m)
    }

    // --- !listapalavrao — SÓ DONO ---
    if (/^listapalavrao$/i.test(cmd)) {
        if (!isOwner) return sendComBotao(conn, m.chat, `\`🤬 ANTI-TÓXICO\`\n\n> ❌ Só o *dono do bot* pode ver a lista.`, m)
        const lista = lerPalavroes()
        if (!lista.length) {
            return sendComBotao(conn, m.chat, `\`🤬 ANTI-TÓXICO\`\n\n> _A lista de palavras proibidas está vazia._`, m)
        }
        const texto = `\`🤬 ANTI-TÓXICO\`\n\n_Palavras proibidas (${lista.length}):_\n\n` + lista.map(p => `> • ${p}`).join('\n')
        return sendComBotao(conn, m.chat, texto, m)
    }

    // --- !antitoxic / antitoxico / antipalavrao on/off — admin ou dono ---
    if (!m.isGroup) return m.reply('❌ Esse comando só funciona em grupos!')
    if (!isAdmin && !isOwner) return m.reply('❌ Apenas administradores podem configurar o antitóxico!')

    const cfg = readGroupConfig(m.chat)
    const ativoAtual = cfg.antitoxic === true

    if (!args[0]) {
        const texto =
            `\`🤬 ANTI-TÓXICO\`\n\n` +
            `_Status atual:_ ${ativoAtual ? '*ATIVADO* ✅' : '*DESATIVADO* ❌'}\n\n` +
            `_Pra ligar/desligar:_\n> *!antitoxic on*\n> *!antitoxic off*`
        return sendComBotao(conn, m.chat, texto, m)
    }

    if (/^on$/i.test(args[0])) {
        if (ativoAtual) {
            return sendComBotao(conn, m.chat, `\`🤬 ANTI-TÓXICO\`\n\n> _Opa!_ Essa função *já está ATIVADA* ✅`, m)
        }
        cfg.antitoxic = true
        writeGroupConfig(m.chat, cfg)
        return sendComBotao(conn, m.chat, `\`🤬 ANTI-TÓXICO\`\n\n> ✅ Função *ATIVADA* com sucesso!\n\n_Quem mandar palavrão da lista proibida a partir de agora é banido automaticamente. Administradores não são afetados._`, m)
    }

    if (/^off$/i.test(args[0])) {
        if (!ativoAtual) {
            return sendComBotao(conn, m.chat, `\`🤬 ANTI-TÓXICO\`\n\n> _Opa!_ Essa função *já está DESATIVADA* ❌`, m)
        }
        cfg.antitoxic = false
        writeGroupConfig(m.chat, cfg)
        return sendComBotao(conn, m.chat, `\`🤬 ANTI-TÓXICO\`\n\n> 🔕 Função *DESATIVADA* com sucesso!`, m)
    }

    return sendComBotao(conn, m.chat, `❌ _Use:_ *!antitoxic on* | *!antitoxic off*`, m)
}

handler.help = ['antitoxic', 'addpalavrao', 'delpalavrao', 'listapalavrao']
handler.tags = ['admin']
// "antipalavrao" removido do toggle de propósito — colide com um outro
// plugin (não feito por mim) que já registra "antipalavra"/"antipalavrao"
// como comando próprio (um Anti-Palavra antigo e inativo). Use !antitoxic
// ou !antitoxico pra ligar/desligar; addpalavrao/delpalavrao/listapalavrao
// continuam normais, pois não colidem com nada.
handler.command = /^(antitoxic|antitoxico|addpalavrao|delpalavrao|rmpalavrao|listapalavrao)$/i
handler.group = true

// ───────────────────────── Detecção: bane quem mandar palavrão ─────────────────────────
handler.before = async function (m, { conn, participants, groupMetadata, isSoberano, isOwner }) {
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
        if (cfg.antitoxic !== true) return

        const listaMembros = participants || groupMetadata?.participants || []

        // Admin nunca é punido
        const senderAdmin = listaMembros.some(p => idsDe(p).includes(senderClean) && ehAdmin(p))
        if (senderAdmin) return

        const palavroes = lerPalavroes()
        if (!palavroes.length) return

        const texto = normalizar(m.text || m.body || '')
        if (!texto) return

        const palavraEncontrada = palavroes.find(p => {
            if (!p) return false
            const re = new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
            return re.test(texto)
        })
        if (!palavraEncontrada) return

        // Checa se o bot é admin (precisa ser pra banir)
        const rawBotJid = conn.user?.id || conn.user?.jid || ''
        const botNumberClean = limpar(rawBotJid)
        const botLid = limpar(conn.user?.lid || '')
        const isBotAdmin = listaMembros.some(p => {
            const ids = idsDe(p)
            return (ids.includes(botNumberClean) || (botLid && ids.includes(botLid))) && ehAdmin(p)
        })

        // PASSO 1: avisa primeiro, com botão do canal
        const userTag = `@${senderClean}`
        const avisoTexto =
            `\`🤬 ANTI-TÓXICO\`\n\n` +
            `> ${userTag} foi detectado usando palavra proibida neste grupo.\n` +
            `_Removendo por conteúdo impróprio._ 🚫`

        await sendComBotao(conn, m.chat, avisoTexto, m, [m.sender])

        // PASSO 2: apaga a mensagem
        await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})

        // PASSO 3: bane
        if (isBotAdmin) {
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch((e) => {
                console.error('[ANTITOXICO] Falha ao remover:', e.message)
            })
        }
    } catch (e) {
        console.error('[ANTITOXICO] Erro no middleware:', e)
    }
}

export default handler