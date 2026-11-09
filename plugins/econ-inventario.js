/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import moment from 'moment-timezone'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let chat = global.db.data.chats[m.chat]

    if (!chat || !chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para ver o inventário.* 🍷')

    // Inicializa o usuário se ele não existir no banco do grupo
    if (!chat.users) chat.users = {}
    if (!chat.users[who]) chat.users[who] = { health: 100, coin: 0, bank: 0, exp: 0, lastAdventure: 0 }
    
    let userGroup = chat.users[who]
    let userGlobal = global.db.data.users[who] || {} // Para dados globais como Premium
    let name = conn.getName(who)
    let premium = userGlobal.premium ? '✅' : '❌'

    let img = 'https://files.catbox.moe/w3dncj.jpg'
    
    // Função para formatar moeda
    let fmoeda = (v) => (v || 0).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })

    let text = `
〔 🎒 *INVENTÁRIO DE ${name.toUpperCase()}* 〕
┃
┃ 💳 *Carteira:* ${fmoeda(userGroup.coin)}
┃ 🏦 *Banco:* ${fmoeda(userGroup.bank)}
┃
┃ ❤️ *Saúde:* ${userGroup.health || 100}%
┃ ✨ *XP:* ${userGroup.exp || 0}
┃ 💎 *Diamantes:* ${userGroup.diamond || 0}
┃ 🍬 *Doces:* ${userGroup.candies || 0}
┃ 🎁 *Presentes:* ${userGroup.gifts || 0}
┃ ⚜️ *Premium:* ${premium}
┃
┃ ⏳ *Última Missão:* ${userGroup.lastAdventure ? moment(userGroup.lastAdventure).locale('pt-br').fromNow() : 'Nunca'}
┃ 📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}
╰━━━━━━━━━━━━⬣`.trim()

    await conn.sendFile(m.chat, img, 'inventario.jpg', text, m)
}

handler.help = ['inventario', 'inv']
handler.tags = ['economia']
handler.command = ['inventario', 'inv', 'bal'] 
handler.group = true

export default handler