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
    if (!chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para abrir cofres.* 🍷')

    // Inicializa o usuário no grupo
    if (!chat.users) chat.users = {}
    if (!chat.users[m.sender]) chat.users[m.sender] = { coin: 0, exp: 0, lastcofre: 0 }
    
    let userGroup = chat.users[m.sender]
    let nomeUsuario = m.pushName || 'Explorador'
    let tempoEspera = 86400000 
    let tempoRestante = (userGroup.lastcofre + tempoEspera) - Date.now()

    if (Date.now() < userGroup.lastcofre + tempoEspera) {
        return m.reply(`📦 *COFRE INDISPONÍVEL*\n\nOlá *${nomeUsuario}*, você já coletou seu cofre hoje. Volte em:\n*⏱️ ${msToTime(tempoRestante)}*`)
    }

    let moedas = Math.floor(Math.random() * 500) + 100 
    let exp = Math.floor(Math.random() * 1000) + 200 
    let img = 'https://files.catbox.moe/qfx5pn.jpg'

    userGroup.coin += moedas
    userGroup.exp += exp
    userGroup.lastcofre = Date.now()

    let formatar = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })

    let texto = `
┏━〔 📦 𝘾𝙊𝙁𝙍𝙀 𝘼𝙇𝙀𝘼𝙏𝙊́𝙍𝙄𝙊 📦 〕⬣
┃
┃ 🎉 *Parabéns, ${nomeUsuario.toUpperCase()}!*
┃ Você encontrou um cofre perdido!
┃
┃ 💰 *Dinheiro:* ${formatar(moedas)}
┃ ✨ *XP:* ${exp} pontos
┃
┗━━━━━━━━━━━━━━━━━⬣
_Sistema de Economia_`.trim()

    await m.react('📦')
    await conn.sendFile(m.chat, img, 'cofre.jpg', texto, m)
}

handler.help = ['cofre']
handler.tags = ['economia']
handler.command = ['cofre', 'diario', 'recompensa']
handler.group = true

export default handler

function msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    return `${hours}h ${minutes}m`
}