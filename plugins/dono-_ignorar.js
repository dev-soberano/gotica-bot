/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, text, command }) => {
    if (!text) throw `*💋 Soberano, digite o número ou responda alguém para ${command}!*`
    
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    else who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

    // Garante que a lista exista na database
    let settings = global.db.data.settings[conn.user.jid]
    if (!settings.ignoredUsers) settings.ignoredUsers = []

    if (command === 'ignorar') {
        if (settings.ignoredUsers.includes(who)) throw `*⭐ Este infiel já está sendo ignorado em silêncio!*`
        settings.ignoredUsers.push(who)
        m.reply(`*🖤 O usuário @${who.split`@`[0]} agora será ignorado por mim em silêncio.*`, null, { mentions: [who] })
    }

    if (command === 'avisar') {
        if (!settings.ignoredUsers.includes(who)) throw `*💫 Este usuário não estava na minha lista de ignorados.*`
        settings.ignoredUsers = settings.ignoredUsers.filter(u => u !== who)
        m.reply(`*✨ @${who.split`@`[0]} agora pode voltar a usar meus comandos.*`, null, { mentions: [who] })
    }
}

handler.help = ['ignorar', 'avisar']
handler.tags = ['owner']
handler.command = ['ignorar','avisar']
handler.owner = true // Só para você, Soberano 💋

export default handler