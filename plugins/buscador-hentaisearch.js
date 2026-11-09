/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import cheerio from 'cheerio';
import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Verifica se o modo NSFW está ativo no grupo
    if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
        return m.reply(`*⚠️ O conteúdo NSFW está desativado neste grupo.*\n\n> Um administrador pode ativar com o comando: *${usedPrefix}nsfw on*`);
    }

    // Mensagem caso o usuário não digite o nome, com o exemplo solicitado
    if (!text) return m.reply(`*🔥 Por favor, digite o nome de algum hentai para buscar.*\n\n*Exemplo:*  *${usedPrefix + command} Nani*`);

    try {
        const response = await axios.get('https://hentai.tv/?s=' + encodeURIComponent(text));
        const $ = cheerio.load(response.data);
        const results = [];

        $('div.flex > div.crsl-slde').each(function() {
            const thumb = $(this).find('img').attr('src');
            const title = $(this).find('a').text().trim();
            const url = $(this).find('a').attr('href');
            
            if (thumb && title && url) {
                results.push({ thumb, title, url });
            }
        });

        // Caso não encontre resultados, também mostra o exemplo
        if (results.length === 0) {
            return m.reply(`*❌ Nenhum resultado encontrado para sua busca.*\n\n*Tente algo como:*\n*${usedPrefix + command} Nani*`);
        }

        const random = results[Math.floor(Math.random() * results.length)];
        const caption = `*🔞 BUSCA HENTAI - GÓTICA BOT*\n\n*📌 Título:* _${random.title}_\n*🔗 Assistir:* ${random.url}`;

        await conn.sendFile(m.chat, random.thumb, 'hentai.jpg', caption, m);

    } catch (e) {
        console.error(e);
        m.reply('*❌ Ocorreu um erro ao realizar a busca.*');
    }
};

handler.help = ['hentai'];
handler.tags = ['nsfw'];
handler.command = ['searchhentai', 'hentaisearch', 'hentai'];
handler.group = true;
handler.register = false; 

export default handler;