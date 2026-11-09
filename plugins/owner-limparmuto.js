/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn }) => {
    let users = global.db.data.users
    let contagem = 0

    // Percorre todos os usuários e remove o muto
    Object.keys(users).forEach(jid => {
        if (users[jid].muto) {
            users[jid].muto = false
            contagem++
        }
    })

    // Força a gravação no banco de dados 💫
    await global.db.write()

    m.reply(`*✨ LIMPEZA CONCLUÍDA ✨*\n\n💋 Foram desmutados *${contagem}* usuários com sucesso.\n\n*Soberano:* A voz de todos foi devolvida! 🌙🖤`)
}

handler.help = ['limparmuto']
handler.tags = ['owner']
handler.command = ['limparmuto', 'resetmuto', 'desmutartodos']
handler.owner = true // Só você pode fazer isso ⭐

export default handler