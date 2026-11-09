/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import axios from 'axios';
import cheerio from 'cheerio';

const searchAnime = async (query) => {
    const url = `https://tioanime.com/directorio?q=${encodeURIComponent(query)}`;

    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const results = [];

        $('ul.animes li').each((_, element) => {
            const name = $(element).find('h3.title').text().trim();
            const id = $(element).find('a').attr('href').split('/').pop();
            const image = $(element).find('img').attr('src');
            const animeUrl = `https://tioanime.com${$(element).find('a').attr('href')}`; 

            results.push({
                name,
                id,
                image: `https://tioanime.com${image}`,
                url: animeUrl, 
            });
        });

        return results;
    } catch (error) {
        console.error('Erro ao buscar o anime:', error.message);
        return { error: 'Não foi possível obter os resultados' };
    }
};

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
    if (!text) {
        return conn.reply(m.chat, `*🔍 Por favor, digite o nome de um anime para pesquisar.*`, m);
    }

    await m.react('🔍');
    const results = await searchAnime(text);
    
    if (results.length === 0 || results.error) {
        return conn.reply(m.chat, `*❌ Nenhum anime encontrado com esse nome.*`, m);
    }

    const messages = [];
    for (const { name, id, url, image } of results) {
        messages.push([
            `✨ Informações do Anime`,
            `📌 Título: ${name}\n🆔 ID: ${id}\n\n*Clique no botão abaixo para ver a lista de episódios.*`,
            image,
            [],
            [],
            [],
            [{ title: `Obter episódios de ${name}`, rows: [
                { title: "🎬 Ver Episódios", description: `Buscar episódios de ${name}`, rowId: `${usedPrefix}animeinfo ${url}` }
            ]}]
        ]);
    }

    const contextInfo = {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363405588045392@newsletter',
            newsletterName: '🐾 Gótica Bot Oficial 🐾',
            serverMessageId: -1
        },
        externalAdReply: {
            title: 'Gótica Bot - Busca de Animes',
            body: 'Soberano: Leandro',
            thumbnailUrl: 'https://files.catbox.moe/fznu68.mp4',
            sourceUrl: 'https://chat.whatsapp.com/HhIATn48XsuAbduwn8sowT',
            mediaType: 1,
            renderLargerThumbnail: false
        }
    };

    await conn.sendCarousel(m.chat, '', `*🍭 Olá! Veja os animes que encontrei para você:*`, "", messages, m, { contextInfo });
}

handler.help = ['animes', 'animesearch'];
handler.command = ['animes', 'animesearch', 'pesquisaranime'];
handler.tags = ['anime'];
handler.group = true;

// Sem travas de registro ou premium
handler.register = false;
handler.premium = false;

// Cooldown zero para o soberano Leandro, 5s para os outros
handler.cooldown = m => (m.sender.split`@`[0] === '556391330669' ? 0 : 5000);

export default handler;