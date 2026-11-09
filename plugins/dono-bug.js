/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `✨ *Soberano, o usuário esqueceu de informar o erro! Uso correto:* \n*${usedPrefix + command}* texto do erro. 💋`
    if (text.length < 10) throw '✨ *Por favor, descreva o erro com pelo menos 10 caracteres para que eu possa entender.* 🖤'
    if (text.length > 1000) throw '✨ *O limite máximo para o reporte é de 1000 caracteres.* 💫'

    const teks = `╭──✨ 𝐑𝐄𝐏𝐎𝐑𝐓𝐄 𝐃𝐄 𝐄𝐑𝐑𝐎 ✨──
│
│ 🖤 *Usuário:* @${m.sender.split`@`[0]}
│ 🌙 *Mensagem:* ${text}
│
╰─────────────💋─`

    // Envia para o seu número (Soberano)
    await conn.reply(global.owner[0][0] + '@s.whatsapp.net', m.quoted ? teks + '\n\n*Mensagem respondida:*\n' + m.quoted.text : teks, m, { mentions: [m.sender] })
    
    m.reply('✨ *Obrigada! Seu reporte foi enviado ao meu criador. Ele analisará o erro em breve.* 💫')
}

handler.help = ['reportar']
handler.tags = ['info']
handler.command = ['reporte', 'report', 'reportar', 'bug', 'error']

export default handler