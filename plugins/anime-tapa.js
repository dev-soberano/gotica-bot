/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    let who;

    if (m.mentionedJid && m.mentionedJid.length > 0) {
        who = m.mentionedJid[0];
    } else if (m.quoted) {
        who = m.quoted.sender || m.quoted.participant;
    } else {
        who = m.sender;
    }

    if (!who) who = m.sender;

    // Resolução correta com await para evitar Promises pendentes / undefined
    let name = await conn.getName(who);
    let name2 = m.pushName || await conn.getName(m.sender);

    // Fallbacks extras para evitar "undefined" em qualquer situação
    if (!name || name === 'undefined') name = `@${who.split('@')[0]}`;
    if (!name2 || name2 === 'undefined') name2 = `@${m.sender.split('@')[0]}`;

    await m.react('🖐️');

    let str;
    if ((m.mentionedJid && m.mentionedJid.length > 0) || m.quoted) {
        str = `*${name2}* deu um tapa bem dado na raba de *${name}*! 🖐️🍑`;
    } else {
        str = `*${name2}* deu um tapa na própria raba... que doideira! 🖐️🍑`.trim();
    }
    
    if (m.isGroup) {
        // Lista com os caminhos dos arquivos locais na pasta media/
        const videos = [
            './media/tapa1.mp4',
            './media/tapa2.mp4',
            './media/tapa3.mp4'
        ];
        
        const videoPath = videos[Math.floor(Math.random() * videos.length)];
        let mentions = [who, m.sender];

        // Verifica se o arquivo local existe antes de enviar
        if (fs.existsSync(videoPath)) {
            await conn.sendMessage(m.chat, { 
                video: fs.readFileSync(videoPath), 
                gifPlayback: true, 
                caption: str, 
                mentions 
            }, { quoted: m });
        } else {
            await m.reply(`❌ O arquivo de vídeo \`${videoPath}\` não foi encontrado na pasta media!`);
        }
    }
}

handler.help = ['tapa', 'slap'];
handler.tags = ['anime'];
handler.command = ['tapa', 'slap', 'estapear'];
handler.group = true;

// Cooldown zero para o Soberano Leandro
handler.cooldown = m => (m.sender.split`@`[0] === '5574991940377' ? 0 : 5000);

export default handler;