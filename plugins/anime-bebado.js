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
    // Para que serve: Envia um GIF de anime bebendo ou bêbado.
    // Como usar: .bebado @tag ou apenas .bebado
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
    await m.react('🍺');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* está bebendo todas com *${name}*! 🍻`;
    } else {
        str = `*${name2}* está muito bêbado(a)... 🥴`.trim();
    }
    
    // Links enviados pelo Soberano (Catbox)
    const videos = [
        'https://files.catbox.moe/uxlxy4.mp4',
        'https://files.catbox.moe/ek9niv.mp4',
        'https://files.catbox.moe/q7yuhx.mp4'
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
        console.error('Erro no comando bebado:', e);
        await conn.reply(m.chat, str, m);
    }
}

handler.help = ['bebado'];
handler.tags = ['anime'];
handler.command = ['bebado', 'beber', 'bêbado'];

handler.group = false;
handler.register = false;

export default handler;

// Para adicionar ao seu menu:
// txt += '┇┆🍺 ${_p}bebado\n'