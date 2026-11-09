/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, command, args }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat.modoreal) return m.reply('*Modo Real desativado.* 🍷')

    let userGroup = chat.users[m.sender]
    if (!userGroup) return m.reply('*Trabalhe primeiro para ter dinheiro!*')

    let formatar = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })

    // COMANDO DEPOSITAR
    if (command === 'depositar' || command === 'dep') {
        let amount = args[0] === 'all' ? userGroup.coin : parseInt(args[0])
        if (!amount || isNaN(amount) || amount <= 0) return m.reply('*Digite um valor válido ou "all" para depositar tudo.*')
        if (userGroup.coin < amount) return m.reply('*Você não tem esse valor na carteira.*')

        userGroup.coin -= amount
        userGroup.bank = (userGroup.bank || 0) + amount
        return m.reply(`✅ *Sucesso!* Você depositou *${formatar(amount)}* no seu banco.`)
    }

    // COMANDO SACAR
    if (command === 'sacar' || command === 'withdraw') {
        let amount = args[0] === 'all' ? userGroup.bank : parseInt(args[0])
        if (!amount || isNaN(amount) || amount <= 0) return m.reply('*Digite um valor válido ou "all" para sacar tudo.*')
        if (userGroup.bank < amount) return m.reply('*Você não tem esse valor no banco.*')

        userGroup.bank -= amount
        userGroup.coin = (userGroup.coin || 0) + amount
        return m.reply(`✅ *Sucesso!* Você sacou *${formatar(amount)}* para sua carteira.`)
    }
}

handler.help = ['depositar', 'sacar']
handler.tags = ['economia']
handler.command = ['depositar', 'dep', 'sacar', 'withdraw']
handler.group = true

export default handler