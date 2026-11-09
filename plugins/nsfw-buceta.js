/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, usedPrefix }) => {
    // Verifica se o modo NSFW está ativo no grupo
    if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
        return m.reply(`*⚠️ O conteúdo NSFW está desativado neste grupo.*`);
    }
    
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
    let nomeAlvo = conn.getName(who);
    let nomeAutor = conn.getName(m.sender);
    m.react('🤪');

    let frase;
    if (m.mentionedJid.length > 0 || m.quoted) {
        frase = `*${nomeAutor}* está lambendo a buceta de *${nomeAlvo}*! 👅💦🔥`;
    } else {
        frase = `*${nomeAutor}* está se deliciando em uma buceta! 👅🤤`;
    }
    
    if (m.isGroup) {
        let videos = [
            'https://files.catbox.moe/9lagk4.mp4',
            'https://files.catbox.moe/udskb1.mp4',
            'https://files.catbox.moe/5yzz6s.mp4',
            'https://files.catbox.moe/crzuxr.mp4'
        ];
        
        const videoAleatorio = videos[Math.floor(Math.random() * videos.length)];

        // Envio minimalista: apenas o vídeo/gif e a legenda
        await conn.sendMessage(m.chat, { 
            video: { url: videoAleatorio }, 
            gifPlayback: true, 
            caption: frase, 
            mentions: [who] 
        }, { quoted: m });
    }
}

handler.help = ['lamberbuceta @tag']
handler.tags = ['nsfw']
handler.command = ['lamberbct', 'buceta', 'lamberbuceta']
handler.group = true

export default handler