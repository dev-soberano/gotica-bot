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
    
    let nomeAutor = conn.getName(m.sender)
    let nomeAlvo = quem ? conn.getName(quem) : ''
    m.react('🥵')

    let texto
    if (quem) {
        texto = `*${nomeAutor}* está batendo tesoura com *${nomeAlvo}*! 🔥`
    } else {
        texto = `*${nomeAutor}* está batendo tesoura sozinha! >.<`
    }

    const videos = [
        'https://telegra.ph/file/d11af77009e15383a5f3e.mp4',
        'https://telegra.ph/file/b24f36949398986232952.mp4',
        'https://telegra.ph/file/aae61f727baf48c0a25f8.mp4',
        'https://telegra.ph/file/8baea377988065dd28520.mp4',
        'https://telegra.ph/file/553649d8f95f7ff86b9f2.mp4',
        'https://telegra.ph/file/c3b386d99c84e7c914a6e.mp4',
        'https://telegra.ph/file/a438a1aec11241b8a63eb.mp4',
        'https://telegra.ph/file/0c5a22faacbc91d4e93a5.mp4',
        'https://telegra.ph/file/d999becfa325549d1c976.mp4'
    ]
    
    const videoAleatorio = videos[Math.floor(Math.random() * videos.length)]

    let mentions = quem ? [quem, m.sender] : [m.sender]
    await conn.sendMessage(m.chat, { 
        video: { url: videoAleatorio }, 
        gifPlayback: true, 
        caption: texto, 
        mentions 
    }, { quoted: m })
}

handler.help = ['yuri', 'lesbicas', 'tesoura']
handler.tags = ['nsfw']
handler.command = ['yuri', 'lesbicas', 'tesoura']
handler.group = true

export default handler