/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m) => {
    let msgs = global.db.data.msgs
    if (!msgs || Object.keys(msgs).length === 0) throw `*「 📭 VAZIO 」*\n\nAinda não temos gatilhos de auto-resposta configurados.`

    let texto = `*「 📜 GATILHOS DISPONÍVEIS 」*\n\n`
    texto += `Digite qualquer uma das palavras abaixo para ativar a resposta:\n\n`
    
    Object.keys(msgs).forEach(key => {
        texto += `ი ̯ ✦⋆͜͡҈➳ *${key}*\n`
    })

    texto += `\n*Nota:* ADMs podem criar novos com .setmsg`
    m.reply(texto)
}

handler.help = ['listmsg']
handler.tags = ['util']
handler.command = ['listmsg', 'msgs', 'gatilhos']
// Sem trava de admin/dono aqui para os membros verem

export default handler