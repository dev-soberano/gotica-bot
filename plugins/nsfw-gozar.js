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
    m.react('💦');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* gozou todinho(a) dentro de *${name}*! 💦🤤`;
    } else {
        str = `*${name2}* se derreteu e gozou tudo! 💦🔥`;
    }
    
    if (m.isGroup) {
        let videos = [
            'https://telegra.ph/file/9243544e7ab350ce747d7.mp4',
            'https://telegra.ph/file/fadc180ae9c212e2bd3e1.mp4',
            'https://telegra.ph/file/79a5a0042dd8c44754942.mp4',
            'https://telegra.ph/file/035e84b8767a9f1ac070b.mp4',
            'https://telegra.ph/file/0103144b636efcbdc069b.mp4',
            'https://telegra.ph/file/4d97457142dff96a3f382.mp4',
            'https://telegra.ph/file/b1b4c9f48eaae4a79ae0e.mp4',
            'https://telegra.ph/file/5094ac53709aa11683a54.mp4',
            'https://telegra.ph/file/dc279553e1ccfec6783f3.mp4',
            'https://telegra.ph/file/acdb5c2703ee8390aaf33.mp4'
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

handler.help = ['gozar @tag'];
handler.tags = ['nsfw'];
handler.command = ['goza', 'leite', 'gozar'];
handler.group = true;

export default handler;