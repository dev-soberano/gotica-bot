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
    // Para que serve: Envia um GIF de anime de aconchego/carinho.
    // Como usar: .aconchegar @tag ou responda a alguém.
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
    await m.react('🫂');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* está se aconchegando com *${name}*... 🫂`;
    } else {
        str = `*${name2}* está se aconchegando! ✨`.trim();
    }
    
    // Links enviados pelo Soberano (Catbox)
    const videos = [
        'https://files.catbox.moe/9b77dq.mp4',
        'https://files.catbox.moe/9x69wm.mp4',
        'https://files.catbox.moe/vmxp8s.mp4',
        'https://files.catbox.moe/nhkwo4.mp4'
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
        console.error('Erro no comando aconchegar:', e);
        await conn.reply(m.chat, str, m);
    }
}

handler.help = ['aconchegar'];
handler.tags = ['anime'];
handler.command = ['aconchegar', 'cuddle', 'carinho'];

handler.group = false;
handler.register = false;

export default handler;