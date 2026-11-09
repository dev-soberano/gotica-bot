/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para apostar.* 🍷')

    let [eleccion, quantidade] = text.trim().split(' ')

    if (!eleccion || !quantidade) {
        return m.reply(`🪙 *CARA OU COROA*\n\nPor favor, escolha *cara* ou *coroa* e o valor.\nExemplo: *${usedPrefix + command} cara 100*`)
    }

    eleccion = eleccion.toLowerCase()
    let valorAposta = parseInt(quantidade)
    let formatar = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })

    if (!['cara', 'coroa'].includes(eleccion)) {
        return m.reply('*Escolha inválida!* Use apenas *cara* ou *coroa*.')
    }

    if (isNaN(valorAposta) || valorAposta <= 0) {
        return m.reply('*Quantidade inválida!* Insira um valor maior que zero.')
    }

    // Inicializa o usuário no grupo
    if (!chat.users) chat.users = {}
    if (!chat.users[m.sender]) chat.users[m.sender] = { coin: 0, bank: 0 }
    
    let userGroup = chat.users[m.sender]

    if (userGroup.coin < valorAposta) {
        return m.reply(`❌ *Saldo insuficiente!* Você só tem *${formatar(userGroup.coin)}* na carteira.`)
    }

    // Resultado aleatório
    let resultado = Math.random() < 0.5 ? 'cara' : 'coroa'
    await m.react('🪙')

    if (resultado === eleccion) {
        // Ganha o que apostou + um bônus aleatório de até 25%
        let ganho = Math.floor(valorAposta + (Math.random() * valorAposta * 0.25))
        userGroup.coin += ganho

        let msgVitoria = `
┏━━⏤͟͟͞͞★꙲⃝͟🪙 *VITÓRIA*
┃
┃ ✨ A moeda caiu em: *${resultado.toUpperCase()}*
┃ 💰 Você ganhou: *${formatar(ganho)}*
┃ 👤 Sua escolha: *${eleccion.toUpperCase()}*
┃
┗━━━━━⏤͟͟͞͞★꙲⃝͟🍀❈┉━━━━┛`.trim()
        return conn.reply(m.chat, msgVitoria, m)

    } else {
        // Perde exatamente o que apostou
        userGroup.coin -= valorAposta

        let msgDerrota = `
┏━━⏤͟͟͞͞★꙲⃝͟🥀 *DERROTA*
┃
┃ ❌ A moeda caiu em: *${resultado.toUpperCase()}*
┃ 💸 Você perdeu: *${formatar(valorAposta)}*
┃ 👤 Sua escolha: *${eleccion.toUpperCase()}*
┃
┗━━━━━⏤͟͟͞͞★꙲⃝͟💔❈┉━━━━┛`.trim()
        return conn.reply(m.chat, msgDerrota, m)
    }
}

handler.help = ['caracruz <cara|coroa> <valor>']
handler.tags = ['economia']
handler.command = ['cc', 'suerte', 'caracruz', 'caraoucoroa']
handler.group = true

export default handler