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
    m.react('😏');

    let frase;
    if (m.mentionedJid.length > 0 || m.quoted) {
        frase = `*${nomeAutor}* está apalpando *${nomeAlvo}* todinha! Você está muito excitante hoje... 😏🔥`;
    } else {
        frase = `*${nomeAutor}* está se apalpando e ficando no clima! 💦🔥`;
    }
    
    if (m.isGroup) {
        let videos = [
            'https://files.catbox.moe/0v0sbs.mp4',
            'https://files.catbox.moe/m4nrpm.mp4',
            'https://files.catbox.moe/nr7vl2.mp4'
        ];
        
        const videoAleatorio = videos[Math.floor(Math.random() * videos.length)];

        // Envio minimalista: apenas o vídeo/gif e a legenda
        await conn.sendMessage(m.chat, { 
            video: { url: videoAleatorio }, 
            gifPlayback: true, 
            caption: frase, 
            mentions: [who] 
        }, { quoted: m });
    }
}

handler.help = ['apalpada @tag']
handler.tags = ['nsfw']
handler.command = ['apalpada', 'manusear']
handler.group = true

export default handler