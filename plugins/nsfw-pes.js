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
    let nomeAlvo = conn.getName(who);
    let nomeAutor = conn.getName(m.sender);
    m.react('🥵');

    let frase;
    if (m.mentionedJid.length > 0 || m.quoted) {
        frase = `*${nomeAutor}* está batendo uma punheta com os pés para *${nomeAlvo}*! 👣🥵`;
    } else {
        frase = `*${nomeAutor}* está fazendo um footjob delicioso! 👣💦`;
    }
    
    if (m.isGroup) {
        let videos = [
            'https://files.catbox.moe/a8ik2a.mp4',
            'https://files.catbox.moe/wv8ciz.mp4',
            'https://files.catbox.moe/w4q7jw.mp4',
            'https://files.catbox.moe/v94nur.mp4',
            'https://files.catbox.moe/v94nur.mp4'
        ];
        
        const videoAleatorio = videos[Math.floor(Math.random() * videos.length)];

        // Envio direto: Apenas vídeo/gif e legenda
        await conn.sendMessage(m.chat, { 
            video: { url: videoAleatorio }, 
            gifPlayback: true, 
            caption: frase, 
            mentions: [who] 
        }, { quoted: m });
    }
}

handler.help = ['punhetapes @tag'];
handler.tags = ['nsfw'];
handler.command = ['footjob', 'punhetapes', 'pes'];
handler.group = true;

export default handler;