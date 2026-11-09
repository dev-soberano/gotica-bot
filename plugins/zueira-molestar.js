/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fs from 'fs'
import { join } from 'path'

let handler = async (m, { conn }) => {
    let who;
    if (m.mentionedJid.length > 0) {
        who = m.mentionedJid[0];
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else {
        return conn.reply(m.chat, `*⚠️ Erro:* Mencione alguém ou responda a uma mensagem para usar a zueira. 💋`, m);
    }

    // Busca o arquivo MP4 na pasta media na raiz do bot
    const videoPath = join(process.cwd(), 'media', 'molestar.mp4');

    if (!fs.existsSync(videoPath)) {
        return conn.reply(m.chat, `*❌ Erro:* O arquivo "molestar.mp4" não foi encontrado na pasta media.`, m);
    }

    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    
    await m.react('😈');

    let str = `*${name2}* está molestando o(a) *${name}*! 😈🔥`;
    let mentions = [who, m.sender];

    try {
        // Lendo o vídeo como Buffer
        const buffer = fs.readFileSync(videoPath);

        await conn.sendMessage(m.chat, { 
            video: buffer, 
            gifPlayback: true, // Isso faz o MP4 rodar em loop infinito como um GIF
            caption: str, 
            mentions 
        }, { quoted: m });

    } catch (e) {
        console.error('Erro ao enviar molestar.mp4:', e);
        await conn.reply(m.chat, `*❌ Erro técnico:* ${e.message}`, m);
    }
}

handler.help = ['molestar'];
handler.tags = ['zueira'];
handler.command = ['molestar', 'estuprar', 'abusar'];

handler.group = true;
handler.register = false;

export default handler;