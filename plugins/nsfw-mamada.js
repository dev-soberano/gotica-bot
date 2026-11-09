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
    m.react('😮');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* está pagando um boquete para *${name}*! 😮‍💨💦`;
    } else {
        str = `*${name2}* está dando uma mamada daquelas! 🥵`;
    }
    
    if (m.isGroup) {
        let videos = [
            'https://telegra.ph/file/0260766c6b36537aa2802.mp4',
            'https://telegra.ph/file/2c1c68c9e310f60f1ded1.mp4',
            'https://telegra.ph/file/e14f5a31d3b3c279f5593.mp4',
            'https://telegra.ph/file/e020aa808f154a30b8da7.mp4',
            'https://telegra.ph/file/1cafb3e72664af94d45c0.mp4',
            'https://telegra.ph/file/72b49d3b554df64e377bb.mp4',
            'https://telegra.ph/file/9687aedfd58a3110c7f88.mp4',
            'https://telegra.ph/file/c799ea8a1ed0fd336579c.mp4',
            'https://telegra.ph/file/7352d18934971201deed5.mp4',
            'https://telegra.ph/file/379edd38bac6de4258843.mp4'
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

handler.help = ['mamada @tag'];
handler.tags = ['nsfw'];
handler.command = ['boquete', 'bqt', 'mamada','mamar'];
handler.group = true;

export default handler;