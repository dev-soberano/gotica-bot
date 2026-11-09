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
    await m.react('🫂');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* deu um abraço bem forte em *${name}*! 🫂❤️`;
    } else {
        str = `*${name2}* está se abraçando... parece que alguém está precisando de carinho! 🥺✨`.trim();
    }
    
    if (m.isGroup) {
        // Seus novos links do Litterbox para o comando de abraço
        const videos = [
            'https://files.catbox.moe/ak3uk6.mp4',
            'https://files.catbox.moe/nhkwo4.mp4'
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

handler.help = ['hug', 'abraco'];
handler.tags = ['anime'];
handler.command = ['hug', 'abraçar', 'abraco', 'abraço'];
handler.group = true;

// Cooldown zero para o Soberano Leandro, 5s para os outros
handler.cooldown = m => (m.sender.split`@`[0] === '556391330669' ? 0 : 5000);

// Para que serve: Envia um vídeo de anime abraçando alguém.
// Benefícios: Interação carinhosa no grupo com links que você mesmo gerou.
// Acesso: Todos os membros.

export default handler;