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
    m.react('🔥');

    let frase;
    if (m.mentionedJid.length > 0 || m.quoted) {
        frase = `*${nomeAutor}* está apertando os peitos de *${nomeAlvo}*! 🥵🍈💦`;
    } else {
        frase = `*${nomeAutor}* está apertando uns peitos deliciosos! 🍯🔥`;
    }
    
    if (m.isGroup) {
        let videos = [
            'https://telegra.ph/file/e6bf14b93dfe22c4972d0.mp4',
            'https://telegra.ph/file/075db3ebba7126d2f0d95.mp4',
            'https://telegra.ph/file/37c21753892b5d843b9ce.mp4',
            'https://telegra.ph/file/04bbf490e29158f03e348.mp4',
            'https://telegra.ph/file/82d32821f3b57b62359f2.mp4',
            'https://telegra.ph/file/36149496affe5d02c8965.mp4',
            'https://telegra.ph/file/61d85d10baf2e3b9a4cde.mp4',
            'https://telegra.ph/file/538c95e4f1c481bcc3cce.mp4',
            'https://telegra.ph/file/e999ef6e67a1a75a515d6.mp4',
            'https://telegra.ph/file/05c1bd3a2ec54428ac2fc.mp4'
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

handler.help = ['agarrarpeitos @tag']
handler.tags = ['nsfw']
handler.command = ['agarrarpeitos', 'peitos','peganopeito']
handler.group = true

export default handler