/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat]
    
    if (!chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para consultar as Patentes.* 🍷')

    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let user = global.db.data.users[who]
    let nome = await conn.getName(who)

    if (!user) return m.reply('*Usuário não encontrado.*')

    let total = (user.coin || 0) + (user.bank || 0)
    let patente = ""

    if (total < 5000) patente = "Pobre 💸"
    else if (total < 50000) patente = "Rico 💰"
    else if (total < 500000) patente = "Milionário 💎"
    else if (total < 5000000) patente = "Bilionário 👑"
    else patente = "Magnata Supremo 🍷"

    let msg = `
╭─〔 ᥫ᭡ 𝙋𝘼𝙏𝙀𝙉𝙏𝙀 𝙎𝙊𝘾𝙄𝘼𝙇 🏛️ 〕
│ 👤 *Usuário:* ${nome}
│ 💰 *Fortuna Total:* R$ ${total.toLocaleString('pt-br')}
│ 🏆 *Patente:* ${patente}
╰─────────────────────
> Fortunas maiores garantem respeito e poder na Gótica Bot.`.trim()

    await conn.reply(m.chat, msg, m)
}

handler.help = ['level']
handler.tags = ['rpg']
handler.command = ['level', 'patente']
handler.group = true

export default handler