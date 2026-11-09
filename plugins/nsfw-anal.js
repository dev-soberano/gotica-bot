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
        str = `*${name2}* está macetando o rabo de *${name}*! 🥵🔥`;
    } else {
        str = `*${name2}* está fazendo um anal gostoso! 💦`;
    }
    
    if (m.isGroup) {
        let videos = [
            'https://telegra.ph/file/7185b0be7a315706d086a.mp4',
            'https://telegra.ph/file/a11625fef11d628d3c8df.mp4',
            'https://telegra.ph/file/062b9506656e89b069618.mp4',
            'https://telegra.ph/file/1325494a54adc9a87ec56.mp4',
            'https://files.catbox.moe/pfdh1a.mp4',
            'https://files.catbox.moe/7gn3cf.mp4'
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

handler.help = ['anal @tag'];
handler.tags = ['nsfw'];
handler.command = ['anal', 'culiar'];
handler.group = true;

export default handler;