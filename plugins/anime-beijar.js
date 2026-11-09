/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗     ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣     ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩     ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, usedPrefix }) => {
    let who;

    if (m.mentionedJid && m.mentionedJid.length > 0) {
        who = m.mentionedJid[0];
    } else if (m.quoted) {
        who = m.quoted.sender || m.quoted.participant;
    } else {
        who = m.sender;
    }

    if (!who) who = m.sender;

    // Resolução correta com await para evitar Promises pendentes / undefined
    let name = await conn.getName(who);
    let name2 = m.pushName || await conn.getName(m.sender);

    // Fallbacks extras para evitar "undefined" em qualquer situação
    if (!name || name === 'undefined') name = `@${who.split('@')[0]}`;
    if (!name2 || name2 === 'undefined') name2 = `@${m.sender.split('@')[0]}`;

    await m.react('🫦');

    let str;
    if ((m.mentionedJid && m.mentionedJid.length > 0) || m.quoted) {
        str = `*${name2}* deu um beijo em *${name}*! ( ˘ ³˘)❤️`;
    } else {
        str = `*${name2}* está se beijando... que amor próprio! ( ˘ ³˘)❤️`.trim();
    }
    
    if (m.isGroup) {
        // Seus novos links permanentes do Catbox
        const videos = [
            'https://files.catbox.moe/jj9vob.mp4',
            'https://files.catbox.moe/vsuo93.mp4'
        ];
        
        const video = videos[Math.floor(Math.random() * videos.length)];
        let mentions = [who, m.sender];

        await conn.sendMessage(m.chat, { 
            video: { url: video }, 
            gifPlayback: true, 
            caption: str, 
            mentions 
        }, { quoted: m });
    }
}

handler.help = ['kiss', 'beijo'];
handler.tags = ['anime'];
handler.command = ['beija', 'beijo', 'beijar'];
handler.group = true;

// Cooldown zero para o Soberano Leandro
handler.cooldown = m => (m.sender.split`@`[0] === '5574991940377' ? 0 : 5000);

export default handler;