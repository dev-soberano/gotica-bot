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
    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    m.react('🥵');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* está fazendo uma espanhola deliciosa em *${name}*! 🍈💦`;
    } else {
        str = `*${name2}* está fazendo uma russa de dar inveja! 🥵`;
    }
    
    if (m.isGroup) {
        let videos = [
            'https://telegra.ph/file/e4412c087db1b1a7a4022.mp4',
            'https://telegra.ph/file/7e6bd15e33a1d77d6fb15.mp4',
            'https://telegra.ph/file/de3cbbb4611242eb0648c.mp4',
            'https://telegra.ph/file/4ca2676e76364d6861852.mp4',
            'https://telegra.ph/file/1099709e53a16a8a791fd.mp4',
            'https://telegra.ph/file/3baffe20cdfbb03d31e45.mp4',
            'https://telegra.ph/file/7cc41bab371611124693e.mp4',
            'https://telegra.ph/file/adaefc5b25537d948b959.mp4'
        ];
        
        const video = videos[Math.floor(Math.random() * videos.length)];
        
        // Envio direto: Apenas vídeo e legenda
        await conn.sendMessage(m.chat, { 
            video: { url: video }, 
            gifPlayback: true, 
            caption: str, 
            mentions: [who] 
        }, { quoted: m });
    }
}

handler.help = ['espanhola @tag'];
handler.tags = ['nsfw'];
handler.command = ['boobjob', 'rusa', 'espanhola'];
handler.group = true;

export default handler;