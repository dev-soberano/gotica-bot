/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let cooldowns = {}
const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    const nomeUser = m.pushName || 'Explorador'
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

    // REGRA SOBERANA: Leandro sem cooldown
    if (!eDono) {
        const tempoEspera = 30 * 1000 // 30 segundos
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) {
            let restante = Math.ceil((cooldowns[m.sender] + tempoEspera - Date.now()) / 1000)
            return m.reply(`*⚠️ AGUARDE:* Olá ${nomeUser}, aguarde ${restante}s para criar outro fake.`)
        }
        cooldowns[m.sender] = Date.now()
    }

    if (!text) return m.reply(`*🎭 Exemplo de uso:*\n\n*${usedPrefix + command}* Olá @${m.sender.split`@`[0]} Tudo bem?`, null, { mentions: [m.sender] })

    let cm = copy(m)
    let who

    if (text.includes('@0')) {
        who = '0@s.whatsapp.net'
    } else if (m.isGroup) {
        who = cm.participant = m.mentionedJid[0]
    } else {
        who = m.chat
    }

    if (!who) return m.reply(`*🎭 Você precisa mencionar alguém!*\n\nExemplo: *${usedPrefix + command}* Oi @${m.sender.split`@`[0]} como vai?`, null, { mentions: [m.sender] })

    cm.key.fromMe = false
    cm.message[m.mtype] = copy(m.msg)
    
    let sp = '@' + who.split`@`[0]
    let [fake, ...real] = text.split(sp)

    await conn.fakeReply(
        m.chat, 
        real.join(sp).trimStart(), 
        who, 
        fake.trimEnd(), 
        m.isGroup ? m.chat : false, 
        { contextInfo: { mentionedJid: conn.parseMention(real.join(sp).trim()) } }
    )
}

handler.help = ['fake']
handler.tags = ['tools']
handler.command = ['fitnah', 'fakereply', 'fake']
handler.register = false // SEM TRAVA DE REGISTRO
handler.group = true

export default handler

function copy(obj) {
    return JSON.parse(JSON.stringify(obj))
}