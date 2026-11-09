/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
    // Para que serve: Envia um GIF de anime expressando raiva.
    // Como usar: .raiva @tag ou responda a alguém.
    // Público: Todos.

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
    await m.react('😡');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* está furioso com *${name}*! 💢`; 
    } else {
        str = `*${name2}* está com muita raiva! 😡`.trim();
    }
    
    const videos = [
        'https://files.catbox.moe/2aedd3.mp4',
        'https://files.catbox.moe/fqf4ey.mp4',
        'https://files.catbox.moe/v7ldgq.mp4',
        'https://files.catbox.moe/uedd7l.mp4',
        'https://files.catbox.moe/5stubg.mp4',
        'https://files.catbox.moe/phaft3.mp4'
    ];
    
    const video = videos[Math.floor(Math.random() * videos.length)];
    let mentions = [who]; 

    await conn.sendMessage(m.chat, { 
        video: { url: video }, 
        gifPlayback: true, 
        caption: str, 
        mentions 
    }, { quoted: m });
}

handler.help = ['raiva', 'bravo'];
handler.tags = ['anime'];
handler.command = ['raiva', 'bravo', 'puto', 'angry'];

handler.group = false;
handler.register = false;

export default handler;