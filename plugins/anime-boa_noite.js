/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fs from 'fs';

let handler = async (m, { conn }) => {
    // Para que serve: Envia um GIF de anime e uma mensagem de boa noite aleatória.
    // Como usar: .boanoite
    // Público: Todos. Sem travas de registro.

    await m.react('🌕');
    
    const messages = [
        "Boa noite! 🌜 Espero que tenha um descanso revigorante e sonhe com coisas lindas.",
        "Boa noite! 🌟 Que a tranquilidade da noite te envolva e te prepare para um novo dia.",
        "Boa noite! 🌌 Lembre-se que cada estrela no céu é um sonho esperando para se realizar.",
        "Boa noite! 🌙 Deixe as preocupações de hoje para trás e abrace a paz da noite.",
        "Boa noite! 🌠 Espero que seus sonhos sejam tão brilhantes quanto as estrelas.",
        "Boa noite! 💤 Que você encontre serenidade no silêncio da noite e acorde renovado(a)."
    ];

    let randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const videos = [
        'https://files.catbox.moe/0n2bf5.mp4',
        'https://files.catbox.moe/zua131.mp4',
        'https://files.catbox.moe/0im4vk.mp4',
        'https://files.catbox.moe/9cm0x9.mp4',
        'https://files.catbox.moe/7kxjhv.mp4',
        'https://files.catbox.moe/id09sr.mp4',
        'https://files.catbox.moe/3kyhf0.mp4',
        'https://files.catbox.moe/4qokmi.mp4'
    ];
    
    const video = videos[Math.floor(Math.random() * videos.length)];

    try {
        await conn.sendMessage(m.chat, { 
            video: { url: video }, 
            gifPlayback: true, 
            caption: randomMessage 
        }, { quoted: m });
    } catch (e) {
        console.error('Erro no comando boa noite:', e);
        await conn.reply(m.chat, randomMessage, m);
    }
}

handler.help = ['boanoite'];
handler.tags = ['diversao'];
handler.command = ['boanoite', 'noite', 'goodnight'];

handler.group = false;
handler.register = false;

export default handler;