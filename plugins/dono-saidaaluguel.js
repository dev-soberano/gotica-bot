/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn }) => {
    let groupData = global.db.data.groupRents[m.chat]

    if (!groupData) {
        return conn.reply(m.chat, `✨ Este grupo não possui um plano de aluguel ativo. 💋`, m)
    }

    let resta = (groupData.startTime + groupData.duration) - Date.now()
    
    if (resta <= 0) {
        return conn.reply(m.chat, `🌙 O aluguel expirou e o bot sairá em breve! ✨`, m)
    }

    // Cálculos de tempo
    let dias = Math.floor(resta / (1000 * 60 * 60 * 24))
    let horas = Math.floor((resta % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    let minutos = Math.floor((resta % (1000 * 60 * 60)) / (1000 * 60))

    let texto = `
┌─『 🌙 *STATUS DO ALUGUEL* 』*
│╭──────────────┄
││ 🖤 *Tempo Restante:*
││ ✨ ${dias} dias, ${horas} horas e ${minutos} min
││ 💫 *Grupo:* ${await conn.getName(m.chat)}
│╰──────────────┄
└──────────────`.trim()

    conn.reply(m.chat, texto, m)
}

handler.help = ['veraluguel']
handler.tags = ['grupo']
handler.command = ['veraluguel', 'tempoaluguel', 'rentstat']
handler.group = true

export default handler