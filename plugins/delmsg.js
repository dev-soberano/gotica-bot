/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { text, usedPrefix, command }) => {
    let msgs = global.db.data.msgs
    if (!text) throw `*「 💡 COMO DELETAR 」*\n\nVocê precisa informar o nome do gatilho que deseja remover.\n\n*Exemplo:* *${usedPrefix + command} bomdia*\n\n*Dica:* Use *${usedPrefix}listmsg* para ver os nomes exatos antes de deletar.`
    
    if (!msgs[text]) throw `*「 ❌ NÃO ENCONTRADO 」*\n\nO gatilho *${text}* não existe no meu banco de dados.`

    delete msgs[text]
    m.reply(`*「 ✅ REMOVIDO 」*\n\nO gatilho *${text}* foi apagado e não funcionará mais.`)
}

handler.help = ['delmsg']
handler.tags = ['admin']
handler.command = ['delmsg', 'removermsg']
handler.admin = true // Liberado para ADMs e para o Soberano

export default handler