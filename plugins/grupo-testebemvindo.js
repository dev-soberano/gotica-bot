/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Verifica se o recurso de boas-vindas está ativo no banco de dados
    if (!global.db.data.chats[m.chat].welcome && m.isGroup) {
        return m.reply(`✨ *Soberano,* para usar este comando você deve ativar as Boas-vindas primeiro com *#welcome* 💋`);
    }

    let chat = global.db.data.chats[m.chat];
    
    // Pega a menção do usuário
    let who = text ? conn.parseMention(text) : [];
    if (!text || who.length === 0) return conn.reply(m.chat, `💫 Mencione o usuário com @ para simular a boas-vindas. 🌙`, m);

    let taguser = `@${who[0].split('@')[0]}`;
    let groupMetadata = await conn.groupMetadata(m.chat);
    let defaultImage = 'https://files.catbox.moe/xr2m6u.jpg'; // Foto padrão se o usuário não tiver

    let img;
    try {
        let pp = await conn.profilePictureUrl(who[0], 'image');
        img = await (await fetch(pp)).buffer();
    } catch {
        img = await (await fetch(defaultImage)).buffer();
    }

    let bienvenida = `✨ *BEM-VINDO(A)* ao grupo: ${groupMetadata.subject}\n\n💫 Olá ${taguser}\n${global.welcom1 || ''}\n🖤 *Aproveite sua estadia conosco!*\n\n> 🌙 Use *#help* para ver meu menu de comandos. 💋`;
    
    await conn.sendMessage(m.chat, { 
        image: img, 
        caption: bienvenida, 
        mentions: who 
    }, { quoted: m });
};

handler.help = ['testwelcome @user'];
handler.tags = ['admin'];
handler.command = ['testwelcome', 'testarboasvindas', 'testarbemvindo']; // Handlers em português
handler.admin = true;
handler.group = true;
handler.register = false; 

export default handler;