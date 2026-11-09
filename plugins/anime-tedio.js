/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fs from 'fs';

let handler = async (m, { conn, usedPrefix }) => {
    // Para que serve: Envia um GIF de anime expressando tédio.
    // Como usar: .tedio @tag ou apenas .tedio
    // Público: Todos. Sem travas de registro.

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
    await m.react('😒');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* está com tédio de *${name}*... 🙄`;
    } else {
        str = `*${name2}* está morrendo de tédio! 😒`.trim();
    }
    
    const videos = [
        'https://files.catbox.moe/n4o7x4.mp4',
        'https://files.catbox.moe/1ynb8f.mp4',
        'https://files.catbox.moe/ll9wvo.mp4',
        'https://files.catbox.moe/lvawwk.mp4',
        'https://files.catbox.moe/vf40qf.mp4',
        'https://files.catbox.moe/zr4zqz.mp4',
        'https://files.catbox.moe/fqe3sj.mp4'
    ];
    
    const video = videos[Math.floor(Math.random() * videos.length)];
    let mentions = [who];

    try {
        await conn.sendMessage(m.chat, { 
            video: { url: video }, 
            gifPlayback: true, 
            caption: str, 
            mentions 
        }, { quoted: m });
    } catch (e) {
        console.error('Erro no comando tedio:', e);
        await conn.reply(m.chat, str, m);
    }
}

handler.help = ['tedio'];
handler.tags = ['anime'];
handler.command = ['tedio', 'chato', 'cansado'];

handler.group = false;
handler.register = false;

export default handler;