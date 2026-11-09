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
        frase = `*${nomeAutor}* meteu gostoso em *${nomeAlvo}*! 🥵🔥💦`;
    } else {
        frase = `*${nomeAutor}* está fodendo com muita vontade! 💦🔥`;
    }
    
    if (m.isGroup) {
        let videos = [
            'https://telegra.ph/file/6ea4ddf2f9f4176d4a5c0.mp4',
            'https://telegra.ph/file/66535b909845bd2ffbad9.mp4',
            'https://telegra.ph/file/1af11cf4ffeda3386324b.mp4',
            'https://telegra.ph/file/e2beba258ba83f09a34df.mp4',
            'https://telegra.ph/file/21543bac2383ce0fc6f51.mp4',
            'https://telegra.ph/file/1baf2e8577d5118c03438.mp4',
            'https://telegra.ph/file/80aa0e43656667b07d0b4.mp4',
            'https://telegra.ph/file/7638618cf43e499007765.mp4',
            'https://telegra.ph/file/1c7d59e637f8e5915dbbc.mp4',
            'https://telegra.ph/file/e7078700d16baad953348.mp4',
            'https://telegra.ph/file/100ba1caee241e5c439de.mp4',
            'https://telegra.ph/file/3b1d6ef30a5e53518b13b.mp4',
            'https://telegra.ph/file/249518bf45c1050926d9c.mp4',
            'https://telegra.ph/file/34e1fb2f847cbb0ce0ea2.mp4',
            'https://telegra.ph/file/52c82a0269bb69d5c9fc4.mp4',
            'https://telegra.ph/file/ca64bfe2eb8f7f8c6b12c.mp4',
            'https://telegra.ph/file/8e94da8d393a6c634f6f9.mp4',
            'https://telegra.ph/file/216b3ab73e1d98d698843.mp4',
            'https://telegra.ph/file/1dec277caf371c8473c08.mp4',
            'https://telegra.ph/file/bbf6323509d48f4a76c13.mp4',
            'https://telegra.ph/file/f8e4abb6923b95e924724.mp4',
            'https://telegra.ph/file/bd4d5a957466eee06a208.mp4',
            'https://telegra.ph/file/a91d94a51dba34dc1bed9.mp4',
            'https://telegra.ph/file/b08996c47ff1b38e13df0.mp4',
            'https://telegra.ph/file/58bcc3cd79cecda3acdfa.mp4'
        ];
        
        const videoAleatorio = videos[Math.floor(Math.random() * videos.length)];

        // Envio minimalista: apenas vídeo/gif e frase
        await conn.sendMessage(m.chat, { 
            video: { url: videoAleatorio }, 
            gifPlayback: true, 
            caption: frase, 
            mentions: [who] 
        }, { quoted: m });
    }
}

handler.help = ['foder @tag']
handler.tags = ['nsfw']
handler.command = ['foder', 'comer']
handler.group = true

export default handler