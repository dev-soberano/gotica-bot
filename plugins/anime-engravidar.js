/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, usedPrefix }) => {
    let who;

    if (m.mentionedJid.length > 0) {
        who = m.mentionedJid[0];
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else {
        who = m.sender;
    }

    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    await m.react('🤰');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* engravidou *${name}*! 🤰✨`;
    } else {
        str = `*${name2}* engravidou a si mesmo... como isso é possível? >.<`.trim();
    }
    
    if (m.isGroup) { 
        // Apenas links permanentes do Catbox (conforme solicitado)
        const videos = [
            'https://files.catbox.moe/brnwzh.mp4',
            'https://files.catbox.moe/3ucfc0.mp4',
            'https://files.catbox.moe/054z2h.mp4',
            'https://files.catbox.moe/f6twdv.mp4'
        ];
        
        const video = videos[Math.floor(Math.random() * videos.length)];

        let mentions = [who];
        await conn.sendMessage(m.chat, { 
            video: { url: video }, 
            gifPlayback: true, 
            caption: str, 
            mentions 
        }, { quoted: m });
    }
}

handler.help = ['engravidar', 'prenar'];
handler.tags = ['anime'];
handler.command = ['engravidar', 'prenar', 'bucho']; 
handler.group = true;

// Cooldown zero para o Soberano Leandro, 5s para os outros
handler.cooldown = m => (m.sender.split`@`[0] === '556391330669' ? 0 : 5000);

// Para que serve: Envia um vídeo de anime brincando sobre engravidar alguém.
// Como usar: .engravidar @marcar ou responda a uma mensagem.
// Acesso: Todos os membros.

export default handler;