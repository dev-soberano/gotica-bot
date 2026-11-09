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
    // Para que serve: Envia um GIF de anime dançando, sozinho ou acompanhado.
    // Como usar: .dançar @tag ou apenas .dançar
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
    await m.react('💃');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* está dançando com *${name}*! 💃✨`;
    } else {
        str = `*${name2}* soltou os passos proibidos! 🕺🔥`.trim();
    }
    
    // Links enviados pelo Soberano (Catbox)
    const videos = [
        'https://files.catbox.moe/ovc90l.mp4',
        'https://files.catbox.moe/gtf00l.mp4',
        'https://files.catbox.moe/xqoen3.mp4',
        'https://files.catbox.moe/vzuiez.mp4',
        'https://files.catbox.moe/rq3i1q.mp4'
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
        console.error('Erro no comando dançar:', e);
        await conn.reply(m.chat, str, m);
    }
}

handler.help = ['dançar'];
handler.tags = ['anime'];
handler.command = ['dançar', 'dancar', 'dance', 'bailar'];

handler.group = false;
handler.register = false;

export default handler;