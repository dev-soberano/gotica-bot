/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RAIZ = path.resolve(__dirname, '..');

let handler = async (m, { conn, participants, usedPrefix, command }) => {
    // 1. Reação de respeito ao ADM ✨
    await m.react('⚡');

    // 2. Caminho do Áudio (Trovão) na pasta media 💫
    const audioPath = path.join(RAIZ, 'media', 'aura.mp3');
    if (fs.existsSync(audioPath)) {
        await conn.sendFile(m.chat, audioPath, 'audio.mp3', '', m, true);
    }

    // 3. Tentar obter a foto de perfil do ADM
    let pp;
    try {
        pp = await conn.profilePictureUrl(m.sender, 'image');
    } catch (e) {
        // Imagem neutra caso não encontre a foto de perfil 💋
        // Certifique-se de ter o arquivo 'neutra.jpg' na pasta media
        pp = path.join(RAIZ, 'media', 'neutra.jpg'); 
    }

    // 4. Preparar Marcação Total (@everyone) ⭐
    const mentions = participants.map((p) => p.id);
    const nomeAdm = m.pushName || 'Administrador';
    
    const mensagem = `⚡ *AUTORIDADE NA ÁREA!* ⚡\n\n*${nomeAdm}* acaba de manifestar sua presença! 💋\n\nautoridade máxima acaba de entrar. Curvem-se perante quem mantém as rédeas deste lugar! ✨💫`;

    // 5. Enviar a imagem (Perfil ou Neutra) com as menções 💫
    if (typeof pp === 'string' && pp.startsWith('http')) {
        // Se for link (foto de perfil)
        await conn.sendMessage(m.chat, { 
            image: { url: pp }, 
            caption: mensagem, 
            mentions: mentions 
        }, { quoted: m });
    } else if (fs.existsSync(pp)) {
        // Se for arquivo local (imagem neutra)
        await conn.sendMessage(m.chat, { 
            image: fs.readFileSync(pp), 
            caption: mensagem, 
            mentions: mentions 
        }, { quoted: m });
    } else {
        // Fallback apenas texto se nada funcionar
        await conn.sendMessage(m.chat, { text: mensagem, mentions: mentions }, { quoted: m });
    }
};

handler.help = ['entrada'];
handler.tags = ['admin'];
handler.command = ['ana', 'Ana', 'cheguei','carlos']; 
handler.admin = true; // SOMENTE PARA ADMS ⭐
handler.group = true; // SOMENTE EM GRUPOS 💋
handler.register = false; 

export default handler;