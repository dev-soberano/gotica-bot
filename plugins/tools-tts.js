/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import gtts from 'node-gtts';
import { readFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const defaultLang = 'pt'; // Idioma padrão: Português

const handler = async (m, { conn, args, usedPrefix, command }) => {
    let lang = args[0];
    let text = args.slice(1).join(' ');

    // Se o primeiro argumento não for um código de idioma (2 letras), assume português
    if ((args[0] || '').length !== 2) {
        lang = defaultLang;
        text = args.join(' ');
    }

    // Se não houver texto, mas houver uma mensagem respondida, usa o texto da mensagem
    if (!text && m.quoted?.text) text = m.quoted.text;
    
    if (!text) return m.reply(`*✨ Por favor, digite o texto que deseja converter em voz.*\nExemplo: *${usedPrefix + command} Olá, eu sou a Gótica Bot*`);

    await m.react('🗣️');

    try {
        let res = await tts(text, lang);
        if (res) {
            await conn.sendFile(m.chat, res, 'tts.opus', null, m, true);
            await m.react('✅');
        }
    } catch (e) {
        console.error(e);
        try {
            // Tenta novamente com o idioma padrão em caso de erro no código de idioma
            let res = await tts(text, defaultLang);
            await conn.sendFile(m.chat, res, 'tts.opus', null, m, true);
        } catch (err) {
            await m.react('❌');
            m.reply(`*❌ Ocorreu um erro ao converter o texto em voz.*`);
        }
    }
};

handler.help = ['tts <lang> <texto>'];
handler.tags = ['transformador'];
handler.group = true;
handler.register = false; // Removida a trava de registro
handler.command = ['audio', 'falar', 'voz','áudio'];

export default handler;

function tts(text, lang = 'pt') {
    return new Promise((resolve, reject) => {
        try {
            const tts = gtts(lang);
            const tmpDir = join(process.cwd(), 'tmp');
            if (!existsSync(tmpDir)) mkdirSync(tmpDir); // Garante que a pasta tmp existe
            
            const filePath = join(tmpDir, (1 * new Date()) + '.wav');
            
            tts.save(filePath, text, () => {
                const buffer = readFileSync(filePath);
                unlinkSync(filePath);
                resolve(buffer);
            });
        } catch (e) {
            reject(e);
        }
    });
}