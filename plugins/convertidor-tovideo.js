/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { webp2mp4 } from '../lib/webp2mp4.js';
import { ffmpeg } from '../lib/converter.js';

let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.quoted) {
        return conn.reply(m.chat, '*✨ Responda a uma figurinha (sticker) que deseja converter em vídeo.*', m);
    }
    
    const mime = m.quoted.mimetype || '';
    if (!/webp/.test(mime)) {
        return conn.reply(m.chat, '*✨ Por favor, responda apenas a figurinhas (stickers).*', m);
    }
    
    await m.react('⏳');
    
    try {
        const media = await m.quoted.download();
        let out = Buffer.alloc(0);
        
        if (/webp/.test(mime)) {
            // Converte sticker webp para mp4
            out = await webp2mp4(media);
        } else if (/audio/.test(mime)) {
            // Caso responda a um áudio, tenta gerar um vídeo simples (opcional)
            out = await ffmpeg(media, [
                '-filter_complex', 'color',
                '-pix_fmt', 'yuv420p',
                '-crf', '51',
                '-c:a', 'copy',
                '-shortest',
            ], 'mp3', 'mp4');
        }
        
        if (!out || out.length === 0) throw new Error('Falha na conversão');

        let cap = '*Aqui está o seu Vídeo! 🎥*';
        await conn.sendFile(m.chat, out, 'video.mp4', cap, m, 0, { thumbnail: out });
        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('*❌ Ocorreu um erro ao converter a figurinha para vídeo.*');
    }
};

handler.help = ['tovideo'];
handler.tags = ['transformador'];
handler.command = ['tovideo', 'tomp4', 'mp4', 'togif'];
handler.group = true;
handler.register = false; // Removida a trava de registro conforme solicitado

export default handler;