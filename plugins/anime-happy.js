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
    await m.react('😁');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* está feliz por *${name}*! ✨`;
    } else {
        str = `*${name2}* está muito feliz hoje! ✨`;
    }
    
    if (m.isGroup) {
        const videos = [
            'https://files.catbox.moe/92bs9b.mp4', 
            'https://files.catbox.moe/d56pfs.mp4', 
            'https://files.catbox.moe/kh6ii0.mp4',
            'https://files.catbox.moe/gmya70.mp4',
            'https://files.catbox.moe/6mjruj.mp4',
            'https://files.catbox.moe/kgggyv.mp4',
            'https://files.catbox.moe/84d71w.mp4',
            'https://files.catbox.moe/hlifrw.mp4'
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

handler.help = ['happy', 'feliz'];
handler.tags = ['anime'];
handler.command = ['happy', 'feliz'];
handler.group = true;

// Sem cooldown para o Leandro, 5s para os outros
handler.cooldown = m => (m.sender.split`@`[0] === '556391330669' ? 0 : 5000);

// Para que serve: Envia um vídeo/gif de felicidade.
// Como usar: Digite .feliz ou marque alguém para ficar feliz por ela.
// Acesso: Membros e Adms.

export default handler;