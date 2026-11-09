/**
 * 👑 COMANDO DEUS - ENTRADA TRIUNFAL DO SOBERANO
 * Versão: Ajustada para soberano.mp4 e aura.mp3
 */

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handler = async (m, { conn, participants }) => {
    // 👑 Identificação EXCLUSIVA do Soberano
    const soberanoLid = '93691188363501@lid';
    const soberanoNum = '556391096656@s.whatsapp.net';

    // O bot verifica se quem enviou é o Mestre Supremo ⭐
    const isSoberano = m.sender === soberanoLid || m.sender === soberanoNum;

    if (!isSoberano) {
        await m.react('🤣');
        return m.reply(`
🫵 *QUEM VOCÊ PENSA QUE É?*

 Você realmente achou que teria o mesmo poder que o *MESTRE SOBERANO*?\n
Não me faça rir! Esse comando é exclusivo para quem manda nessa porra toda. 💋⭐\n

> 🚫 *ACESSO NEGADO, VERME.*`.trim());
    }

    // Se for o Mestre, o ritual começa ✨
    await m.react('👑');

    // Caminhos para a sua pasta media (ajustado para mp4)
    const audioPath = path.join(__dirname, '../media/auraa.mp3');
    const videoPath = path.join(__dirname, '../media/soberano.mp4');

    // 1. Enviar Áudio (Aura)
    if (fs.existsSync(audioPath)) {
        await conn.sendFile(m.chat, audioPath, 'aura.mp3', '', m, true);
    }

    // 2. Preparar Marcação de TODOS
    const mentions = participants.map((p) => p.id);
    const mensagem = `⚡ *ATENÇÃO, MORTAIS!* ⚡\n\nO Grande Mestre supremo *Dev Soberano* manifestou sua presença neste chat! 👑\n\nCurvem-se perante sua divindade e mostrem o devido respeito. Onde o Mestre ordena, todos devem obedecer sem questionar! 🙇‍♂️✨\n\n> *Status:* Rei absoluto no comando! 👑`;

    // 3. Enviar Vídeo MP4 em loop (Modo GIF) com legenda e marcações 💫
    if (fs.existsSync(videoPath)) {
        try {
            await conn.sendMessage(m.chat, {
                video: fs.readFileSync(videoPath),
                caption: mensagem,
                gifPlayback: true, // Isso faz o MP4 rodar em loop como um GIF
                mentions: mentions
            }, { quoted: m });
        } catch (e) {
            console.error("Erro ao enviar vídeo:", e);
            await conn.sendMessage(m.chat, { text: mensagem, mentions: mentions }, { quoted: m });
        }
    } else {
        console.log("Arquivo soberano.mp4 não encontrado na pasta media.");
        await conn.sendMessage(m.chat, { text: mensagem, mentions: mentions }, { quoted: m });
    }
};

handler.help = ['deus'];
handler.tags = ['owner'];
handler.command = ['deus', 'soberano', 'criador']; 
handler.group = true;
handler.register = false; 

export default handler;