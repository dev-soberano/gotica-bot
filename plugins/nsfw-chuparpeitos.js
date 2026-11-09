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
        return m.reply('*⚠️ O conteúdo NSFW está desativado neste grupo.*');
    }

    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
    let nomeAlvo = conn.getName(who);
    let nomeAutor = conn.getName(m.sender);
    m.react('🔥');

    let frase;
    if (m.mentionedJid.length > 0) {
        frase = `*${nomeAutor}* chupou os peitos de *${nomeAlvo}*! 🍼🥵`;
    } else if (m.quoted) {
        frase = `*${nomeAutor}* está chupando os peitos de *${nomeAlvo}* gostoso! 🍼🔥`;
    } else {
        frase = `*${nomeAutor}* está chupando uns peitos deliciosos! 🤤💦`.trim();
    }
    
    if (m.isGroup) {
        let videos = [
            'https://telegra.ph/file/01143878beb3d0430c33e.mp4',
            'https://telegra.ph/file/7b181cbaa54eee6c048fc.mp4',
            'https://telegra.ph/file/f8cf75586670483fadc1d.mp4',
            'https://telegra.ph/file/f8969e557ad07e7e53f1a.mp4',
            'https://telegra.ph/file/1104aa065e51d29a5fb4f.mp4',
            'https://telegra.ph/file/9e1240c29f3a6a9867aaa.mp4',
            'https://telegra.ph/file/949dff632250307033b2e.mp4',
            'https://telegra.ph/file/b178b294a963d562bb449.mp4',
            'https://telegra.ph/file/95efbd8837aa18f3e2bde.mp4',
            'https://telegra.ph/file/9827c7270c9ceddb8d074.mp4'
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

handler.help = ['chuparpeitos @tag'];
handler.tags = ['nsfw'];
handler.command = ['chuparpeitos', 'suckboobs', 'mamarpitos'];
handler.group = true;

export default handler;