/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import axios from 'axios'

let handler = async (m, { conn, command }) => {
    // Verifica se o modo NSFW está ativo no grupo
    if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
        return m.reply('*⚠️ O conteúdo NSFW está desativado neste grupo.*')
    }

    m.react('🔞')

    try {
        const res = await axios.get('https://delirius-apiofc.vercel.app/anime/hentaivid')
        const data = res.data

        if (!Array.isArray(data) || data.length === 0) {
            return m.reply('*⚠️ Não foi possível obter o vídeo agora. Tente novamente mais tarde.*')
        }

        const videoAleatorio = data[Math.floor(Math.random() * data.length)]
        
        const legenda = `🔞 *VÍDEO HENTAI ALEATÓRIO* 🔥\n\n` +
            `🎬 *Título:* ${videoAleatorio.title}\n` +
            `📁 *Categoria:* ${videoAleatorio.category}\n` +
            `📊 *Visualizações:* ${videoAleatorio.views_count}`

        // Envio direto do arquivo de vídeo com legenda
        await conn.sendFile(m.chat, videoAleatorio.video_1, 'hentai.mp4', legenda, m)

    } catch (err) {
        console.error('[❌ ERRO API]', err)
        return m.reply('*❌ Ocorreu um erro ao obter o vídeo. A API pode estar fora do ar.*')
    }
}

handler.help = ['hentaivideo']
handler.tags = ['nsfw']
handler.command = ['hentaivideo', 'hentaivid', 'videohe']
handler.group = true

export default handler