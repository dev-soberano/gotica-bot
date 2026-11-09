/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let victims = m.mentionedJid.length ? m.mentionedJid : m.quoted ? [m.quoted.sender] : []
    
    if (victims.length < 2) return m.reply(`*Uso correto:* Marque duas pessoas.\n\nExemplo:\n> *${usedPrefix + command} @pessoa1 @pessoa2*`)

    let [p1, p2] = victims
    let amor = Math.floor(Math.random() * 100)
    
    // Barra de progresso sem emojis (estilo bloco)
    let progresso = Math.round(amor / 10)
    let barra = '█'.repeat(progresso) + '░'.repeat(10 - progresso)

    let mensagem = `
*📊CHANCE DE DAR CERTO*

*Participantes:*
👤 @${p1.split('@')[0]}
👤 @${p2.split('@')[0]}

*Resultado:* ${amor}%
[ ${barra} ]

*Veredito:*
${amor < 30 ? 'A afinidade é muito baixa.' : 
  amor < 50 ? 'Pode funcionar com paciência.' : 
  amor < 75 ? 'Há uma boa conexão entre vocês.' : 
  amor < 90 ? 'Grande chance de dar certo!' : 
  'Almas gêmeas detectadas!' }`.trim()

    await conn.sendMessage(m.chat, { 
        text: mensagem, 
        mentions: [p1, p2] 
    }, { quoted: m })
}

handler.help = ['shipo @tag @tag']
handler.tags = ['fun']
handler.command = ['ship', 'shipo']
handler.register = false 

export default handler