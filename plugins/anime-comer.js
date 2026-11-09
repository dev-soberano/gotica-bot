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
    // Para que serve: Envia um GIF de anime comendo, sozinho ou acompanhado.
    // Como usar: .comer @tag ou apenas .comer
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
    await m.react('😋');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* está comendo com *${name}*! 🍕`;
    } else {
        str = `*${name2}* está comendo algo delicioso! 😋`.trim();
    }
    
    // Links de vídeos (Catbox)
    const videos = [
        'https://files.catbox.moe/a67a4g.mp4', 
        'https://files.catbox.moe/rzms6b.mp4', 
        'https://files.catbox.moe/j6akt5.mp4',
        'https://files.catbox.moe/oew6da.mp4',
        'https://files.catbox.moe/mappcr.mp4',
        'https://files.catbox.moe/v6b8cq.mp4'
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
        console.error('Erro no comando comer:', e);
        await conn.reply(m.chat, str, m);
    }
}

handler.help = ['comer'];
handler.tags = ['anime'];
handler.command = ['comer', 'come'];

handler.group = false;
handler.register = false;

export default handler;

// Para adicionar ao seu menu:
// txt += '┇┆😋 ${_p}comer\n'