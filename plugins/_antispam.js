/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗     ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣     ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩     ╚═╝ ╚═╝  ╩ 
 * @author ༄ Đev Šoberano ×͜×
 * @link https://github.com/leandromemes
 * @project Gotica Bot - ANTI-SPAM SYSTEM
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'

// Memória temporária para rastrear mensagens por usuário/chat
const userSpamMap = new Map()

const fancyFontMap = {
  'A': '𝘼', 'B': '𝘽', 'C': '𝘾', 'D': '𝘿', 'E': '𝙀', 'F': '𝙁', 'G': '𝙂', 'H': '𝙃', 'I': '𝙄', 'J': '𝙅', 'K': '𝙆', 'L': '𝙇', 'M': '𝙈', 'N': '𝙉', 'O': '𝙊', 'P': '𝙋', 'Q': '𝙌', 'R': '𝙍', 'S': '𝙎', 'T': '𝙏', 'U': '𝙐', 'V': '𝙑', 'W': '𝙈', 'X': '𝙓', 'Y': '𝙔', 'Z': '𝙕',
  'a': '𝙖', 'b': '𝙗', 'c': '𝙘', 'd': '𝙙', 'e': '𝙚', 'f': '𝙛', 'g': '𝙜', 'h': '𝙝', 'i': '𝙞', 'j': '𝙟', 'k': '𝙠', 'l': '𝙡', 'm': '𝙢', 'n': '𝙣', 'o': 'o', 'p': '𝙥', 'q': '𝙦', 'r': '𝙧', 's': '𝙨', 't': '𝙩', 'u': '𝙪', 'v': '𝙫', 'w': '𝙬', 'x': '𝙭', 'y': '𝙮', 'z': '𝙯',
  '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
}

function toFancyText(text) {
  if (typeof text !== 'string') text = String(text);
  return text.split('').map(char => fancyFontMap[char] || char).join('');
}

export function getAntiSpamData() {
    const dbDir = join(process.cwd(), 'src', 'database')
    if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true })
    const filePath = join(dbDir, 'antispam.json')

    if (!existsSync(filePath)) {
        writeFileSync(filePath, JSON.stringify({}, null, 2))
        return {}
    }

    try {
        const content = readFileSync(filePath, 'utf-8')
        const parsed = JSON.parse(content)
        // Garante que o retorno é SEMPRE um objeto válido
        return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {}
    } catch {
        return {}
    }
}

export function saveAntiSpamData(data) {
    const dbDir = join(process.cwd(), 'src', 'database')
    if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true })
    const filePath = join(dbDir, 'antispam.json')
    const toSave = (data && typeof data === 'object') ? data : {}
    writeFileSync(filePath, JSON.stringify(toSave, null, 2))
}

function syncGrupoJson(chatJid, isEnabled) {
    try {
        const dirGrupos = join(process.cwd(), 'src', 'database', 'grupos')
        if (!existsSync(dirGrupos)) mkdirSync(dirGrupos, { recursive: true })
        const cleanFrom = chatJid.split('@')[0] + '@g.us'
        const caminho = join(dirGrupos, `${cleanFrom}.json`)
        let jsonGp = []
        if (existsSync(caminho)) {
            const content = readFileSync(caminho, 'utf-8')
            jsonGp = content ? JSON.parse(content) : []
        }
        if (!Array.isArray(jsonGp)) jsonGp = []
        if (!jsonGp[0] || typeof jsonGp[0] !== 'object') jsonGp[0] = {}

        jsonGp[0]['antispam'] = isEnabled

        writeFileSync(caminho, JSON.stringify(jsonGp, null, 2))
    } catch (err) {
        console.error('Erro ao sincronizar arquivo do grupo:', err)
    }
}

// Envia resposta formatada com o card estilizado
async function replyWithCard(conn, m, isEnable, replyText) {
    await m.react(isEnable ? '✅' : '⚠️')
    try {
        const res = await fetch('https://i.postimg.cc/nhdkndD6/pngtree-yellow-bell-ringing-with-sound-waves-png-image-20687908.png')
        const thumb2 = Buffer.from(await res.arrayBuffer())
        const fkontak = {
            key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Notificacion' },
            message: { locationMessage: { name: isEnable ? `🔔 ${toFancyText('LIGADO')}` : `🔕 ${toFancyText('DESLIGADO')}`, jpegThumbnail: thumb2 } },
            participant: '0@s.whatsapp.net'
        }
        await conn.reply(m.chat, replyText, fkontak)
    } catch {
        await conn.reply(m.chat, replyText, m)
    }
}

// Hook executado a CADA MENSAGEM recebida no grupo
export async function before(m, { conn, isAdmin, isOwner, isROwner }) {
    if (!m || !m.isGroup || !m.sender || m.fromMe) return

    const isSoberano = isOwner || isROwner || m.sender.includes('240041947357401')
    
    // Admins e Soberano são imunes
    if (isAdmin || isSoberano) return

    const chat = global.db?.data?.chats?.[m.chat] || {}
    const bot = global.db?.data?.settings?.[conn.user.jid] || {}

    let localGroupEnabled = false
    try {
        const cleanFrom = m.chat.split('@')[0] + '@g.us'
        const caminho = join(process.cwd(), 'src', 'database', 'grupos', `${cleanFrom}.json`)
        if (existsSync(caminho)) {
            const content = readFileSync(caminho, 'utf-8')
            const jsonGp = JSON.parse(content)
            if (Array.isArray(jsonGp) && jsonGp[0]) {
                localGroupEnabled = jsonGp[0].antispam === true
            }
        }
    } catch {}

    let antiSpamData = getAntiSpamData()
    const groupData = antiSpamData[m.chat]

    const isEnabled = groupData?.enabled ?? (chat.antispam || bot.antiSpam || localGroupEnabled || false)
    if (!isEnabled) return

    const limit = groupData?.limit || 4
    const intervalMs = (groupData?.interval || 5) * 1000

    const userKey = `${m.chat}:${m.sender}`
    const now = Date.now()

    if (!userSpamMap.has(userKey)) {
        userSpamMap.set(userKey, [])
    }

    const timestamps = userSpamMap.get(userKey)

    while (timestamps.length > 0 && timestamps[0] <= now - intervalMs) {
        timestamps.shift()
    }

    timestamps.push(now)

    if (timestamps.length >= limit) {
        userSpamMap.delete(userKey)

        try {
            await conn.reply(
                m.chat, 
                `🚫 @${m.sender.split('@')[0]} *foi banido por anti-spam!* (${limit} mensagens em menos de ${groupData?.interval || 5}s)`, 
                m, 
                { mentions: [m.sender] }
            )
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        } catch (err) {
            console.error('Erro ao banir por Anti-Spam:', err)
        }
    }
}

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner, isROwner }) => {
    if (!m.isGroup) return m.reply('༄ Đev Šoberano ×͜× | Este comando só pode ser usado em grupos.')
    const isSoberano = isOwner || isROwner || m.sender.includes('240041947357401')
    if (!isAdmin && !isSoberano) return global.dfail('admin', m, conn)

    let antiSpamData = getAntiSpamData()
    // Força a variável a ser um objeto limpo caso estivesse corrompida
    if (typeof antiSpamData !== 'object' || Array.isArray(antiSpamData) || antiSpamData === null) {
        antiSpamData = {}
    }

    const chatId = m.chat
    const arg0 = (args[0] || '').toLowerCase()

    if (arg0 === 'off' || arg0 === 'desativar' || arg0 === '0' || arg0 === 'disable') {
        antiSpamData[chatId] = { enabled: false }
        saveAntiSpamData(antiSpamData)
        syncGrupoJson(chatId, false)

        if (global.db?.data?.chats?.[chatId]) {
            global.db.data.chats[chatId].antispam = false
        }

        const replyText = `⚠️ *A função ${toFancyText('Anti-Spam')} foi DESATIVADA* para este chat.`
        return await replyWithCard(conn, m, false, replyText)
    }

    let limit = parseInt(args[0])
    let interval = parseInt(args[1])

    if (isNaN(limit) || isNaN(interval)) {
        limit = 4
        interval = 5
    }

    antiSpamData[chatId] = {
        enabled: true,
        limit: limit,
        interval: interval
    }

    saveAntiSpamData(antiSpamData)
    syncGrupoJson(chatId, true)

    if (global.db?.data?.chats?.[chatId]) {
        global.db.data.chats[chatId].antispam = true
    }

    const replyText = `✅ *A função ${toFancyText('Anti-Spam')} foi ATIVADA* para este chat.`
    return await replyWithCard(conn, m, true, replyText)
}

handler.before = before
handler.command = /^(_?antispam|antispam)$/i
handler.group = true
handler.admin = true

export default handler