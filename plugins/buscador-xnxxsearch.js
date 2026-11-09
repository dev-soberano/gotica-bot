/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fetch from 'node-fetch';
import cheerio from 'cheerio';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Verificação de NSFW
    let chat = global.db.data.chats[m.chat];
    if (m.isGroup && chat && !chat.nsfw) {
        return m.reply('*🔞 Conteúdo adulto desativado neste grupo.*');
    }

    if (!text) return m.reply(`*✨ O que deseja buscar?*\n\n*Exemplo:* ${usedPrefix + command} loira`);

    try {
        await m.react('⏳');

        const res = await xnxxsearch(text);
        const json = res.result.slice(0, 10); 

        if (!json || json.length === 0) {
            await m.react('❌');
            return m.reply('*❌ Nenhum resultado encontrado.*');
        }

        let cap = `*🔞 RESULTADOS PARA:* ${text.toUpperCase()}\n\n`;
        
        json.forEach((v, i) => {
            cap += `*[${i + 1}] ${v.title.toUpperCase()}*\n`;
            cap += `• 🕒 *Info:* ${v.info}\n`;
            cap += `• 🔗 *Link:* ${v.link}\n`;
            cap += `• 📥 *Baixar:* ${usedPrefix}xnxx ${v.link}\n`;
            cap += `\n─────────────────\n\n`;
        });

        cap += `*Gótica Bot*`;

        // Envia como texto normal com imagem (se quiser) ou apenas texto
        // Texto normal é 100% compatível com qualquer WhatsApp
        await conn.reply(m.chat, cap, m);
        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('*❌ Erro ao processar a busca.*');
    }
};

handler.help = ['xnxxsearch'];
handler.tags = ['buscador'];
handler.command = ['xnxxsearch', 'xnxxs', 'xsearch'];
handler.register = false;

export default handler;

async function xnxxsearch(query) {
    return new Promise((resolve, reject) => {
        const baseurl = 'https://www.xnxx.com';
        fetch(`${baseurl}/search/${query}/${Math.floor(Math.random() * 3) + 1}`, { method: 'get' })
            .then((res) => res.text())
            .then((res) => {
                const $ = cheerio.load(res, { xmlMode: false });
                const title = [];
                const url = [];
                const desc = [];
                const results = [];
                $('div.mozaique').each(function (a, b) {
                    $(b).find('div.thumb').each(function (c, d) {
                        url.push(baseurl + $(d).find('a').attr('href').replace('/THUMBNUM/', '/'));
                    });
                });
                $('div.mozaique').each(function (a, b) {
                    $(b).find('div.thumb-under').each(function (c, d) {
                        desc.push($(d).find('p.metadata').text());
                        $(d).find('a').each(function (e, f) {
                            title.push($(f).attr('title'));
                        });
                    });
                });
                for (let i = 0; i < title.length; i++) {
                    if (title[i]) results.push({ title: title[i], info: desc[i], link: url[i] });
                }
                resolve({ code: 200, status: true, result: results });
            })
            .catch((err) => reject({ code: 503, status: false, result: err }));
    });
}