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
        return m.reply('*⚠️ O conteúdo NSFW está desativado neste grupo.*');
    }

    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
    let nomeAlvo = conn.getName(who);
    let nomeAutor = conn.getName(m.sender);
    m.react('🔥');

    let frase;
    if (m.mentionedJid.length > 0) {
        frase = `*${nomeAutor}* deu uma palmada bem forte em *${nomeAlvo}*! 🍑💥`;
    } else if (m.quoted) {
        frase = `*${nomeAutor}* deu um tapa na bunda de *${nomeAlvo}*! 🍑🔥`;
    } else {
        frase = `*${nomeAutor}* está distribuindo palmadas para todo lado! 😈💥`.trim();
    }
    
    if (m.isGroup) {
        let videos = [
            'https://files.catbox.moe/yjulgu.mp4',
            'https://telegra.ph/file/07fe0023525be2b2579f9.mp4',
            'https://telegra.ph/file/f830f235f844e30d22e8e.mp4',
            'https://telegra.ph/file/e278ca6dc7d26a2cfda46.mp4',
            'https://files.catbox.moe/mf3tve.mp4',
            'https://files.catbox.moe/hobfrw.mp4'
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

handler.help = ['palmada @tag'];
handler.tags = ['nsfw'];
handler.command = ['palmada', 'spank', 'tapanaraba'];
handler.group = true;

export default handler;