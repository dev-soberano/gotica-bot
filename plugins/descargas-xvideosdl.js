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

const handler = async (m, { conn, args, command, usedPrefix }) => {
    // Verifica se o modo NSFW está ativo
    if (m.isGroup && !global.db.data.chats[m.chat].nsfw) {
        return m.reply(`*⚠️ O conteúdo adulto (NSFW) está desativado neste grupo.*\n> Use: *${usedPrefix}nsfw on* para ativar.`);
    }

    if (!args[0]) {
        return conn.reply(m.chat, `*⚠️ Por favor, envie um link do XVideos para baixar o vídeo.*`, m);
    }

    try {
        await m.react('⏳');
        await conn.reply(m.chat, `*⏳ O vídeo está sendo processado...*\n\n- O tempo de envio depende do tamanho e duração do vídeo.`, m);
        
        const res = await xvideosdl(args[0]);
        
        if (!res.result.url) throw 'Não foi possível extrair o link do vídeo.';

        const caption = `🎬 *Título:* ${res.result.title}\n👀 *Views:* ${res.result.views}\n👍 *Likes:* ${res.result.likes}\n\n> *Gotica bot*`;

        // Envia como VÍDEO (não documento)
        await conn.sendMessage(m.chat, { 
            video: { url: res.result.url }, 
            caption: caption,
            mimetype: 'video/mp4'
        }, { quoted: m });

        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        return m.reply(`*❌ Ocorreu um erro ao processar o vídeo.*\n\nCertifique-se de que o link é válido.`);
    }
};

handler.help = ['xvideosdl *<link>*'];
handler.tags = ['nsfw'];
handler.command = ['baixar-xvideo', 'xvdl', 'xvid'];
handler.group = true;
handler.register = false; // Trava de registro removida
handler.coin = 10;

export default handler;

// --- FUNÇÃO DE EXTRAÇÃO ---

async function xvideosdl(url) {
    return new Promise((resolve, reject) => {
        fetch(`${url}`, { method: 'get' })
            .then(res => res.text())
            .then(res => {
                let $ = cheerio.load(res, { xmlMode: false });
                const title = $("meta[property='og:title']").attr("content");
                const views = $("div#video-tabs > div > div > div > div > strong.mobile-hide").text() + " views";
                const likes = $("span.rating-good-nbr").text();
                const videoUrl = $("#html5video > #html5video_base > div > a").attr("href");
                
                resolve({ 
                    status: 200, 
                    result: { title, url: videoUrl, views, likes } 
                });
            })
            .catch(err => reject(err));
    });
}