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
    // Para que serve: Envia um GIF de anime mostrando a língua (provocação amigável).
    // Como usar: .bleh @tag ou responda a alguém.
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
    await m.react('😝');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* mostrou a língua para *${name}*! 😝`; 
    } else {
        str = `*${name2}* mostrou a língua! 😛`.trim();
    }
    
    // Links de vídeos (Removi os que poderiam estar quebrados)
    const videos = [
        'https://files.catbox.moe/tnsdlr.mp4',
        'https://files.catbox.moe/fox9sl.mp4',
        'https://files.catbox.moe/lh4c2n.mp4',
        'https://files.catbox.moe/y2zg7b.mp4',
        'https://files.catbox.moe/qhcqag.mp4'
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
        console.error('Erro no comando bleh:', e);
        await conn.reply(m.chat, str, m);
    }
}

handler.help = ['bleh'];
handler.tags = ['anime'];
handler.command = ['língua', 'lingua'];

handler.group = false;
handler.register = false;

export default handler;