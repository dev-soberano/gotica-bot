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
    if (!chat || !chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para sentir o terror.* 🍷')

    // Inicializa o usuário no banco do grupo
    if (!chat.users) chat.users = {}
    if (!chat.users[m.sender]) chat.users[m.sender] = { coin: 0, exp: 0, lastHalloween: 0, candies: 0 }
    let userGroup = chat.users[m.sender]

    const currentDate = new Date().getTime()
    const cooldown = 24 * 60 * 60 * 1000 // Cooldown de 24 horas para ser diário
    let timeRemaining = (userGroup.lastHalloween || 0) + cooldown - currentDate

    if (timeRemaining > 0) {
        return m.reply(`🎃 *Calma, criatura da noite!* Você já coletou seus doces hoje. Volte em:\n*${msToTime(timeRemaining)}*`)
    }

    // Recompensas balanceadas para o Modo Real
    let coinReward = pickRandom([1000, 2000, 3500, 5000])
    let candyReward = pickRandom([5, 10, 15, 20])
    let expReward = pickRandom([500, 1000, 1500, 2000])

    userGroup.coin = (userGroup.coin || 0) + coinReward
    userGroup.candies = (userGroup.candies || 0) + candyReward
    userGroup.exp = (userGroup.exp || 0) + expReward
    userGroup.lastHalloween = currentDate

    let texto = `
╭━〔 🎃 *DOCES OU TRAVESSURAS* 〕
┃
┃ *Feliz Halloween (atrasado)!* 👻
┃ _Você explorou a mansão abandonada e achou:_
┃
┃ 💸 *Dinheiro:* + ${coinReward.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
┃ 🍬 *Doces:* + ${candyReward}
┃ ✨ *XP:* + ${expReward}
┃
╰━━━━━━━━━━━━⬣
> Use os doces para subir no ranking sombrio!`.trim()

    let img = 'https://files.catbox.moe/7wyt4w.jpg' // Imagem temática de Halloween

    await conn.sendFile(m.chat, img, 'halloween.jpg', texto, m)
    if (global.db.write) await global.db.write()
}

handler.help = ['halloween']
handler.tags = ['economia']
handler.command = ['halloween', 'doces']
handler.group = true

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function msToTime(duration) {
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let seconds = Math.floor((duration / 1000) % 60)
    return `${hours}h ${minutes}m ${seconds}s`
}