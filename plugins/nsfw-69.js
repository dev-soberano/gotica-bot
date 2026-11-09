/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, usedPrefix }) => {
    // Verifica se o modo NSFW está ativo
    if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
        return m.reply(`*⚠️ O conteúdo NSFW está desativado.*`);
    }
    
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
    let name = conn.getName(who); 
    let name2 = conn.getName(m.sender); 
    m.react('🥵');

    let str = `*${name2}* está fazendo um 69 com *${name}*! 🥵🔥`;
    
    let videos = [
        'https://telegra.ph/file/bb4341187c893748f912b.mp4',
        'https://telegra.ph/file/c7f154b0ce694449a53cc.mp4',
        'https://telegra.ph/file/1101c595689f638881327.mp4',
        'https://telegra.ph/file/f7f2a23e9c45a5d6bf2a1.mp4',
        'https://telegra.ph/file/a2098292896fb05675250.mp4',
        'https://telegra.ph/file/16f43effd7357e82c94d3.mp4',
        'https://telegra.ph/file/55cb31314b168edd732f8.mp4',
        'https://telegra.ph/file/1cbaa4a7a61f1ad18af01.mp4',
        'https://telegra.ph/file/1083c19087f6997ec8095.mp4'
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

handler.help = ['69 @tag'];
handler.tags = ['nsfw'];
handler.command = ['sixnine','69'];
handler.group = true;

export default handler;