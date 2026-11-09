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
    if (!chat || !chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para usar a enfermaria.* 🍷')

    // Inicializa o usuário no banco do grupo se não existir
    if (!chat.users) chat.users = {}
    if (!chat.users[m.sender]) chat.users[m.sender] = { health: 100, coin: 0 }
    
    let userGroup = chat.users[m.sender]

    const custoCura = 1500 // R$ 1.500,00 para se curar
    const cura = 75 // Recupera 75% de vida

    if (userGroup.health >= 100) {
        return m.reply('*Você já está com a saúde plena!* ❤️ Aproveite sua vitalidade.')
    }

    if (userGroup.coin < custoCura) {
        return m.reply(`💔 *Saldo insuficiente!* \nA cura custa *R$ 1.500,00*. Você tem apenas *${userGroup.coin.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}*.`)
    }

    // Executa a cura
    userGroup.health += cura
    userGroup.coin -= custoCura

    // Garante que a vida não passe de 100%
    if (userGroup.health > 100) userGroup.health = 100

    const mensagem = `
╭━〔 💉 *ENFERMARIA GÓTICA* 〕
┃
┃ 🌸 *Tratamento Concluído!*
┃ ❤️ *Vida Restaurada:* +${cura}%
┃ 💸 *Custo:* ${custoCura.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
┃
┣━━〔 🏷️ *ESTADO ATUAL* 〕
┃ › ❤️ *Saúde:* ${userGroup.health}/100
┃ › 💰 *Saldo:* ${userGroup.coin.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
╰━━━━━━━━━━━━⬣`.trim()

    await conn.sendMessage(m.chat, { text: mensagem }, { quoted: m })
    if (global.db.write) await global.db.write()
}

handler.help = ['curar']
handler.tags = ['economia']
handler.command = ['heal', 'curar', 'hospital']
handler.group = true

export default handler