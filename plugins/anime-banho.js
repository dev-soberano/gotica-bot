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
    // Para que serve: Envia um GIF de anime tomando banho ou dando banho em alguém.
    // Como usar: .banho @tag ou apenas .banho
    // Público: Todos os usuários. Sem travas.

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
    await m.react('🛀');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* está dando banho em *${name}*! 🧼`; 
    } else {
        str = `*${name2}* está tomando um banho relaxante... 🛀`.trim();
    }
    
    // Links enviados pelo Soberano
    const videos = [
        'https://files.catbox.moe/z6fmzi.mp4',
        'https://files.catbox.moe/oilz3c.mp4',
        'https://files.catbox.moe/g0z5wo.mp4'
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
        console.error('Erro ao enviar vídeo de banho:', e);
        await conn.reply(m.chat, str, m);
    }
}

handler.help = ['banho'];
handler.tags = ['anime'];
handler.command = ['banho', 'bath', 'banhar', 'banharse'];

handler.group = false;
handler.register = false;

export default handler;