/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat]
    
    if (!chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para realizar transferências.* 🍷')

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    if (!who) return m.reply(`*Marque alguém ou responda a uma mensagem para fazer um PIX.* 💸\n\nExemplo: *${usedPrefix + command} 100 @tag*`)
    if (who === m.sender) return m.reply('*Você não pode fazer um PIX para você mesmo, Leandro.* 🤨')
    
    // Inicializa usuários no grupo se não existirem
    if (!chat.users) chat.users = {}
    if (!chat.users[m.sender]) chat.users[m.sender] = { coin: 0, bank: 0 }
    if (!chat.users[who]) chat.users[who] = { coin: 0, bank: 0 }

    let userEmissor = chat.users[m.sender]
    let userReceptor = chat.users[who]

    let txt = args.find(v => !v.includes('@'))
    let amount = txt === 'all' ? userEmissor.coin : parseInt(txt)

    if (!amount || isNaN(amount) || amount <= 0) return m.reply('*Informe um valor válido para o PIX.*')
    if (userEmissor.coin < amount) return m.reply(`*Saldo insuficiente!* Você só tem *R$ ${userEmissor.coin.toLocaleString('pt-br')}* na carteira.`)

    // Realiza a transferência
    userEmissor.coin -= amount
    userReceptor.coin += amount

    let formatar = (v) => v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
    let nomeReceptor = await conn.getName(who)

    let mensagem = `
╭─〔 💸 *PIX REALIZADO* 〕
│
│ 📤 *De:* ${m.pushName}
│ 📥 *Para:* ${nomeReceptor}
│ 💰 *Valor:* ${formatar(amount)}
╰─────────────────────
│ ✅ *Transferência Concluída!*
╰─────────────────────
> O dinheiro foi enviado para a carteira do destinatário.`.trim()

    await conn.reply(m.chat, mensagem, m, { mentions: [who] })
}

handler.help = ['pix']
handler.tags = ['economia']
handler.command = ['pix', 'transferir', 'pagar']
handler.group = true

export default handler