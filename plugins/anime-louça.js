/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗     ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣     ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩     ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
    // Para que serve: Envia o vídeo local lavando louça/fazendo tarefas domésticas.
    // Como usar: .louca @tag ou apenas .louca
    // Público: Todos. Sem travas de registro.

    let who;
    try {
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            who = m.mentionedJid[0];
        } else if (m.quoted && m.quoted.sender) {
            who = m.quoted.sender;
        } else {
            who = m.sender;
        }
    } catch {
        who = m.sender;
    }

    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    
    try {
        await m.react('🍽️');
    } catch {}

    let str;
    let isTargetingOther = (m.mentionedJid && m.mentionedJid.length > 0) || (m.quoted && m.quoted.sender);
    
    if (isTargetingOther) {
        str = `*${name2}* mandou *${name}* ir lavar a louça e ajudar nas tarefas de casa! 🧼🫧`;
    } else {
        str = `*${name2}* criou vergonha na cara e foi lavar a pilha de louça da pia! 🧼🫧`.trim();
    }
    
    // Caminho para o arquivo local dentro da pasta media
    const videoPath = path.join(process.cwd(), 'media', 'lava-louça.mp4');
    let mentions = [who];

    try {
        if (!fs.existsSync(videoPath)) {
            return await conn.reply(m.chat, `*🦇 Erro:* Vídeo não encontrado no caminho:\n\`gotica-bot/media/lava-louça.mp4\``, m);
        }

        const videoBuffer = fs.readFileSync(videoPath);

        await conn.sendMessage(m.chat, { 
            video: videoBuffer, 
            gifPlayback: true, 
            caption: str, 
            mentions 
        }, { quoted: m });
    } catch (e) {
        console.error('Erro no comando louça:', e);
        await conn.reply(m.chat, str, m);
    }
}

handler.help = ['louca'];
handler.tags = ['anime'];
handler.command = ['louca', 'louça', 'pia', 'lavarlouca', 'lavarlouça'];

handler.group = false;
handler.register = false;

export default handler;

// Para adicionar ao seu menu:
// txt += '┇┆🧼 ${_p}louca\n'