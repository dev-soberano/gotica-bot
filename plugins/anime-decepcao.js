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
    // Para que serve: Envia um GIF de anime fazendo "facepalm" (mão no rosto).
    // Como usar: .decepcao @tag ou responda a alguém.
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
    await m.react('🤦');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = `*${name2}* está decepcionado com as besteiras de *${name}*... 🤦`;
    } else {
        str = `*${name2}* não está acreditando nisso... 🤦‍♀️`.trim();
    }
    
    // Links enviados pelo Soberano (Catbox)
    const videos = [
        'https://files.catbox.moe/iu8ov2.mp4',
        'https://files.catbox.moe/7smbjr.mp4',
        'https://files.catbox.moe/cs8a18.mp4',
        'https://files.catbox.moe/twxl22.mp4'
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
        console.error('Erro no comando decepção:', e);
        await conn.reply(m.chat, str, m);
    }
}

handler.help = ['decepcao'];
handler.tags = ['anime'];
handler.command = ['decepcao', 'decepção', 'decepcionado'];

handler.group = false;
handler.register = false;

export default handler;

// Para adicionar ao seu menu:
// txt += '┇┆🤦 ${_p}decepcao\n'