/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let toM = a => '@' + a.split('@')[0]

let handler = async (m, { conn, groupMetadata }) => {
    let ps = groupMetadata.participants.map(v => v.id)
    if (ps.length < 2) return m.reply('*🦇 Erro:* Preciso de pelo menos duas pessoas no grupo para criar uma amizade.')
    
    let a = ps.getRandom()
    let b
    do b = ps.getRandom()
    while (b === a)

    let texto = `*🦇 ─ ☾ CONEXÃO AMIGOS ☽ ─ 🦇*\n\n> Vamos criar novas amizades nesse grupo...\n\n Ei *${toM(a)}*, chame *${toM(b)}* no privado para conversarem ou jogarem algo! 🙆\n\n*As melhores amizades começam com um simples "oi" 😉.*`.trim()

    await conn.sendMessage(m.chat, {
        text: texto,
        contextInfo: {
            mentionedJid: [a, b],
            externalAdReply: {
                title: '☾ 𝖦𝗈́𝗍𝗂𝖼𝖺 𝖡𝗈𝗍 𝖠𝗆𝗂𝗓𝖺𝖽𝖾 ☽',
                body: 'Unindo almas no grupo',
                thumbnailUrl: 'https://files.catbox.moe/njwial.jpg', // Sua imagem padrão
                sourceUrl: 'https://github.com/leandromemes',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}

handler.help = ['amizade']
handler.tags = ['fun']
handler.command = ['amizade', 'amigorandom', 'amistad']
handler.group = true
handler.register = false // Sem trava de registro conforme suas regras

export default handler