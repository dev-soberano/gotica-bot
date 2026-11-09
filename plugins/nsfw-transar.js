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
    m.react('🥵');

    let frase;
    if (m.mentionedJid.length > 0 || m.quoted) {
        frase = `*${nomeAutor}* está transando com força com *${nomeAlvo}*! 🥵🔥💦`;
    } else {
        frase = `*${nomeAutor}* está transando gostoso! 💦🔥`;
    }
    
    if (m.isGroup) {
        let videos = [
            'https://files.catbox.moe/7ito13.mp4',
            'https://files.catbox.moe/6to3zj.mp4',
            'https://files.catbox.moe/8j94sh.mp4',
            'https://files.catbox.moe/ylfpb7.mp4',
            'https://files.catbox.moe/kccjc7.mp4',
            'https://files.catbox.moe/lt9e1u.mp4'
        ];
        
        const videoAleatorio = videos[Math.floor(Math.random() * videos.length)];

        // Envio limpo: apenas o vídeo/gif e a legenda
        await conn.sendMessage(m.chat, { 
            video: { url: videoAleatorio }, 
            gifPlayback: true, 
            caption: frase, 
            mentions: [who] 
        }, { quoted: m });
    }
}

handler.help = ['transar @tag'];
handler.tags = ['nsfw'];
handler.command = ['transar', 'transa'];
handler.group = true;

export default handler;