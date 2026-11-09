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
    // Tratamento para ler o texto passado ou o texto de uma mensagem respondida (quoted)
    let textToConvert = text || (m.quoted && m.quoted.text ? m.quoted.text : '');

    if (!textToConvert) {
        return m.reply(`*🗣️ Digite o texto ou responda a uma mensagem para converter em áudio!*\n\n*Exemplo:*\n*${usedPrefix + command} Olá, eu sou a Gotica Bot*`);
    }

    if (textToConvert.length > 1000) {
        return m.reply('*⚠️ O texto não pode ter mais de 1000 caracteres!*');
    }

    // Define a voz padrão (pode alterar para 'ana' ou 'pedro' se preferir)
    const voice = 'ana';

    try {
        await m.react('🗣️');

        const { data } = await axios.post(`https://api.spiderx.com.br/api/ai/tts?api_key=${SPIDER_API_KEY}`, {
            text: textToConvert,
            voice: voice
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!data || !data.success || !data.url) {
            return m.reply('*❌ Erro ao gerar o áudio. Tente novamente mais tarde!*');
        }

        // Envia o áudio como nota de voz (ptt: true)
        await conn.sendFile(m.chat, data.url, 'tts.mp3', null, m, true, {
            mimetype: 'audio/mp4'
        });

        await m.react('✅');

    } catch (e) {
        console.error('[ERRO TTS]:', e);
        m.reply('*❌ Ocorreu um erro ao processar a conversão de voz.*');
    }
};

handler.help = ['tts'];
handler.tags = ['ferramentas'];
handler.command = ['tts', 'falar', 'voz'];
handler.register = false;

export default handler;