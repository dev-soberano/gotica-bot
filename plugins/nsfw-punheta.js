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
    m.react('🔥');

    let str;
    if (m.mentionedJid.length > 0) {
        str = `*${name2}* está batendo uma punheta pensando em *${name}*! 🥵💦`;
    } else if (m.quoted) {
        str = `*${name2}* está batendo uma punheta para *${name}*! 🔥`;
    } else {
        str = `*${name2}* não aguentou e começou a se pajar sozinho! 🍯`.trim();
    }
    
    if (m.isGroup) {
        let videos = [
            'https://qu.ax/TFGZu.mp4',
            'https://qu.ax/DFYTU.mp4',
            'https://qu.ax/ugAfu.mp4',
            'https://qu.ax/pbpcw.mp4',
            'https://qu.ax/UrzOi.mp4',
            'https://qu.ax/KaQp.mp4',
            'https://qu.ax/fsWkl.mp4',
            'https://qu.ax/nZMnv.mp4'
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

handler.help = ['punheta @tag'];
handler.tags = ['nsfw'];
handler.command = ['masturbar', 'punheta', 'bateruma'];
handler.group = true;

export default handler;