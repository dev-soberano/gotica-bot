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
    await m.react('👙');

    let str;
    if (m.mentionedJid.length > 0) {
        str = `*${name2}* está tirando a roupa de *${name || who}*! 🔥🔞`;
    } else if (m.quoted) {
        str = `*${name2}* está se desnudando para *${name || who}*... ( ͡° ͜ʖ ͡°)`;
    } else {
        str = `*${name2}* está ficando pelad﹫! 🔞`.trim();
    }
    
    if (m.isGroup) {
        // Vídeos do Catbox enviados pelo Soberano
        const videos = [
            'https://files.catbox.moe/6bnlqe.mp4',
            'https://files.catbox.moe/lncr0n.mp4',
            'https://files.catbox.moe/usfg84.mp4',
            'https://files.catbox.moe/7adgfm.mp4',
            'https://files.catbox.moe/rkg006.mp4',
            'https://files.catbox.moe/lg95ld.mp4',
            'https://files.catbox.moe/fznu68.mp4'
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
}

handler.help = ['despir', 'pelado'];
handler.tags = ['anime'];
handler.command = ['nuds', 'despir', 'pelado', 'nu']; // Comandos em português
handler.group = true;

// Cooldown zero para o soberano Leandro, 5s para os outros
handler.cooldown = m => (m.sender.split`@`[0] === '556391330669' ? 0 : 5000);

// Para que serve: Envia um vídeo de anime de um personagem tirando a roupa.
// Como usar: .despir @marcar ou apenas .despir.
// Acesso: Todos os membros.

export default handler;