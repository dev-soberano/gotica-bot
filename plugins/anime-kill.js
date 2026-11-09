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
    await m.react('🗡️');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* acaba de matar *${name}*! ( ⚆ _ ⚆ ) 💀`;
    } else {
        str = `*${name2}* cometeu suicídio... ( ⚆ _ ⚆ ) 😵‍💫`.trim();
    }
    
    if (m.isGroup) {
        // Seus novos links do Litterbox para o comando de matar
        const videos = [
            'https://files.catbox.moe/4fk4q2.mp4',
            'https://files.catbox.moe/pypp8u.mp4',
            'https://files.catbox.moe/o0obly.mp4'
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

handler.help = ['kill', 'matar'];
handler.tags = ['anime'];
handler.command = ['kill', 'matar'];
handler.group = true;

// Sem cooldown para o Leandro, 5s para os outros
handler.cooldown = m => (m.sender.split`@`[0] === '556391330669' ? 0 : 5000);

// Para que serve: Envia um vídeo de anime "matando" ou "assassinando" alguém.
// Benefícios: Diversão e interação dinâmica no chat.
// Acesso: Todos os membros do grupo.

export default handler;