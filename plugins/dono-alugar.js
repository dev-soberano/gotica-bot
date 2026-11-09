/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Comando exclusivo para o Soberano
    if (!text) return conn.reply(m.chat, `✨ *Soberano, use o comando assim:* \n\n*${usedPrefix + command}* @mencione 30`, m)

    // Agora aceita separar por espaço ou por "|"
    let [userPart, dayPart] = text.includes('|') ? text.split('|') : text.split(' ')
    
    // Se você marcou alguém, o mencionadoJid já resolve, senão tentamos pegar o número do texto
    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : (userPart.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    
    // Se o dayPart sumiu (caso de muitos espaços), pegamos o último argumento
    let days = dayPart ? dayPart : text.split(' ').pop()
    let daysNum = parseInt(days)

    if (!user || isNaN(daysNum)) return conn.reply(m.chat, `✨ *Erro! Não consegui entender os dias. Use:* \n${usedPrefix + command} @mencione 30`, m)

    let duration = daysNum * 24 * 60 * 60 * 1000 

    if (!global.db.data.userRents) global.db.data.userRents = {}
    if (!global.db.data.groupRents) global.db.data.groupRents = {}

    if (!global.db.data.userRents[user]) {
        global.db.data.userRents[user] = { tokens: 0, groups: [] }
    }

    let chatId = m.chat
    global.db.data.groupRents[chatId] = {
        startTime: Date.now(),
        duration: duration,
        user: user
    }

    if (!global.db.data.userRents[user].groups.includes(chatId)) {
        global.db.data.userRents[user].groups.push(chatId)
    }

    let msg = `
┌─『 🌙 *ALUGUEL ATIVADO* 』*
│╭──────────────┄
││ ✨ *Status* : Ativado via PIX
││ 🖤 *Duração* : ${daysNum} dia(s)
││ 💫 *Grupo* : ${await conn.getName(chatId)}
│╰──────────────┄
└──────────────`.trim()

    conn.reply(m.chat, msg, m)
    conn.reply(user, `✨ *Seu aluguel foi ativado por ${daysNum} dias neste grupo!* 💋`, null)
}

handler.help = ['alugar @tag dias']
handler.tags = ['owner']
handler.command = ['addaluguel', 'alugar']
handler.rowner = true 

export default handler