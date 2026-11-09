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
    // Para que serve: Envia um GIF de anime dando uma mordida em alguém.
    // Como usar: .morder @tag ou responda a alguém.
    // Público: Todos. Sem travas.

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
    await m.react('🦷');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* deu uma mordida em *${name}*! 🦷`; 
    } else {
        str = `*${name2}* está se mordendo! 😅`.trim();
    }
    
    const videos = [
        'https://files.catbox.moe/nssx5g.mp4',
        'https://files.catbox.moe/c23bw3.mp4',
        'https://files.catbox.moe/nxr7vx.mp4',
        'https://files.catbox.moe/j5yobc.mp4',
        'https://files.catbox.moe/o31g5x.mp4',
        'https://files.catbox.moe/c43d18.mp4'
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
        console.error('Erro no comando morder:', e);
        await conn.reply(m.chat, str, m);
    }
}

handler.help = ['morder'];
handler.tags = ['anime'];
handler.command = ['morder', 'bite'];

handler.group = false;
handler.register = false;

export default handler;