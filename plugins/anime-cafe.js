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
    // Para que serve: Envia um GIF de anime tomando café, sozinho ou acompanhado.
    // Como usar: .cafe @tag ou apenas .cafe
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
    await m.react('☕');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* está tomando uma xícara de café com *${name}*! ☕`;
    } else {
        str = `*${name2}* está tomando uma xícara de café... ☕`.trim();
    }
    
    const videos = [
        'https://files.catbox.moe/k6bzj0.mp4', 
        'https://files.catbox.moe/3pj3nx.mp4', 
        'https://files.catbox.moe/wcpe4z.mp4',
        'https://files.catbox.moe/64t3cf.mp4',
        'https://files.catbox.moe/qy1qmo.mp4',
        'https://files.catbox.moe/va1mu7.mp4',
        'https://files.catbox.moe/zqqre3.mp4',
        'https://files.catbox.moe/duydzw.mp4',
        'https://files.catbox.moe/4mn95m.mp4'
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
        console.error('Erro no comando café:', e);
        await conn.reply(m.chat, str, m);
    }
}

handler.help = ['cafe'];
handler.tags = ['anime'];
handler.command = ['cafe', 'coffee', 'café'];

handler.group = false;
handler.register = false;

export default handler;

// Para adicionar ao seu menu:
// txt += '┇┆☕ ${_p}cafe\n'