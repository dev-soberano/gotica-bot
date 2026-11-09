/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    // Verifica se o modo NSFW está ativo no grupo
    if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
        return m.reply('*⚠️ O conteúdo NSFW está desativado neste grupo.*')
    }

    let quem = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
    
    if (!quem) return m.reply('*⚠️ Marque ou responda a mensagem de quem você deseja violar.*')

    let nomeAlvo = conn.getName(quem)
    let nomeAutor = conn.getName(m.sender)
    m.react('🥵')

    let mensagem = `*${nomeAutor}* acabas de violar a putinha da *${nomeAlvo}* enquanto ela pedia: "coloca mais fundo, que delícia de pau"... 🔥`

    const videos = [
        'https://files.catbox.moe/cnmn0x.jpg',
        'https://files.catbox.moe/xph5x5.mp4',
        'https://files.catbox.moe/4ffxj8.mp4',
        'https://files.catbox.moe/f6ovgb.mp4'
    ]
    
    const videoAleatorio = videos[Math.floor(Math.random() * videos.length)]

    await conn.sendMessage(m.chat, { 
        video: { url: videoAleatorio }, 
        gifPlayback: true, 
        caption: mensagem, 
        mentions: [quem, m.sender] 
    }, { quoted: m })
}

handler.help = ['violar @tag']
handler.tags = ['nsfw']
handler.command = ['violar', 'estuprar','estrupar']
handler.group = true

export default handler