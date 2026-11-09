/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import translate from '@vitalets/google-translate-api';
import fetch from 'node-fetch';

const handler = async (m, { args, usedPrefix, command }) => {
    // Mensagem de ajuda traduzida
    const msg = `*👑 Uso correto do comando ${usedPrefix + command} (idioma) (texto)*\n\n*Exemplo:*\n*${usedPrefix + command} pt Hello*\n\n*Veja os idiomas suportados em:*\n*- https://cloud.google.com/translate/docs/languages*`;
    
    if (!args || !args[0]) return m.reply(msg);
    
    let lang = args[0];
    let text = args.slice(1).join(' ');
    const defaultLang = 'pt'; 

    if ((args[0] || '').length !== 2) {
        lang = defaultLang;
        text = args.join(' ');
    }

    if (!text && m.quoted && m.quoted.text) text = m.quoted.text;
    if (!text) return m.reply(msg);

    try {
        await m.react('⏳');
        
        const result = await translate(`${text}`, { to: lang, autoCorrect: true });
        await m.reply('*✨ Tradução:* ' + result.text);
        
    } catch {
        try {
            const lol = await fetch(`https://api.lolhuman.xyz/api/translate/auto/${lang}?apikey=${global.lolkeysapi}&text=${encodeURIComponent(text)}`);
            const loll = await lol.json();
            const result2 = loll.result.translated;
            await m.reply('*✨ Tradução (Reserva):* ' + result2);
        } catch {
            await m.reply('*❌ Ocorreu um erro ao tentar traduzir.*');
        }
    }
};

handler.help = ['translate', 'traduzir'];
handler.tags = ['buscadores'];
handler.command = ['traduza', 'traduzir', 'trad', 'tradutor'];
handler.group = true;
// Trava de registro removida para o Soberano
handler.register = false; 

export default handler;