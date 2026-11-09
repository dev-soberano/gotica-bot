/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import axios from 'axios';

const SPIDER_API_KEY = '3edfB5m8XuOFVPijpgGE';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*✨ O que deseja buscar?*\n\n*Exemplo:*\n*${usedPrefix + command} Naruto*`);

    try {
        await m.react('🔍');
        
        // Fazendo a busca via Spider X API
        const { data } = await axios.get(`https://api.spiderx.com.br/api/downloads/pinterest?search=${encodeURIComponent(text)}&api_key=${SPIDER_API_KEY}`);
        
        // Valida se a resposta veio no formato array esperado e possui imagens
        if (!Array.isArray(data) || data.length === 0) {
            return m.reply('*⚠️ Nenhuma imagem encontrada para este termo.*');
        }

        // Seleciona até 3 imagens da lista retornada
        const imagesToSend = data.slice(0, 3);

        for (let i = 0; i < imagesToSend.length; i++) {
            const imgUrl = imagesToSend[i].url;
            const caption = i === 0 ? `*📌 PINTEREST*\n\n*🔍 Termo:* ${text}\n*👤 por:* Gotica Bot 💋` : '';
            
            await conn.sendFile(m.chat, imgUrl, 'pinterest.jpg', caption, m);
        }

        await m.react('✅');

    } catch (e) {
        console.error('[ERRO PINTEREST]:', e);
        m.reply('*❌ Erro ao buscar imagem no Pinterest. Tente novamente mais tarde!*');
    }
};

handler.help = ['img'];
handler.tags = ['buscador'];
handler.command = ['pin', 'imagen', 'imagem', 'pinterest'];
handler.register = false; 

export default handler;