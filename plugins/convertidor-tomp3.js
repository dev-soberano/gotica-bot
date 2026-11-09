/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { toAudio } from '../lib/converter.js';

let handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted ? m.quoted : m;
    const mime = (q || q.msg).mimetype || q.mediaType || '';
    
    // Verifica se o arquivo é um vídeo ou áudio (nota de voz)
    if (!/video|audio/.test(mime)) {
        return conn.reply(m.chat, '*✨ Por favor, responda ao vídeo ou nota de voz que deseja converter para MP3.*', m);
    }
    
    await m.react('⏳');
    
    try {
        const media = await q.download();
        if (!media) {
            await m.react('❌');
            return conn.reply(m.chat, '*❌ Ocorreu um erro ao baixar o arquivo.*', m);
        }
        
        // Converte a mídia para áudio
        const audio = await toAudio(media, 'mp4');
        if (!audio.data) {
            await m.react('❌');
            return conn.reply(m.chat, '*❌ Ocorreu um erro ao converter para MP3.*', m);
        }
        
        // Envia o arquivo MP3 resultante
        await conn.sendMessage(m.chat, { 
            audio: audio.data, 
            mimetype: 'audio/mpeg' 
        }, { quoted: m });
        
        await m.react('✅');
    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('*❌ Erro técnico ao processar a conversão.*');
    }
};

handler.help = ['tomp3', 'toaudio'];
handler.tags = ['transformador'];
handler.command = ['tomp3', 'toaudio'];
handler.group = true;
handler.register = false; // Removida a trava de registro

export default handler;