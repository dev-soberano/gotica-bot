/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██║
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - YouTube / Busca
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Comandos de YouTube portados do Minato:
 *  !ytmp3 / !ytaudio  - baixa o áudio de um link
 *  !ytmp4             - baixa o vídeo de um link
 *  !ytsearch          - busca vídeos no YouTube
 *  !yt-info           - informações de um vídeo
 *  !ytplay            - toca pelo nome (busca + baixa)
 */

import yts from 'yt-search'
import { ytmp4 } from '../lib/youtubedl.js'
import { buscarMusica, baixarAudio } from '../lib/musica.js'

/** Extrai o ID do vídeo de uma URL do YouTube. */
function getVideoId(url) {
    const m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|[^\/]+\/.+\/|.*embed\/))([^&?\/]+)/)
    return m ? m[1] : null
}

/** Valida se é uma URL do YouTube. */
function isYouTube(url) {
    return /^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(String(url || ''))
}

/** Formata a duração (segundos) em "mm:ss" ou "h:mm:ss". */
function formatDuration(secs) {
    const s = Math.floor(Number(secs) || 0)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
        : `${m}:${String(sec).padStart(2, '0')}`
}

const handler = async (m, { conn, args, command, text, usedPrefix }) => {
    const cmd = (command || '').toLowerCase()
    const input = text.trim()

    // ---------- !ytmp3 / !ytmp4 ----------
    if (cmd === 'ytmp3' || cmd === 'ytaudio' || cmd === 'ytmp4' || cmd === 'ytvideo') {
        if (!input) {
            return m.reply(`📝 *Uso:*\n!${cmd} <link do YouTube>\n\n*Exemplo:*\n\`!${cmd} https://youtube.com/watch?v=...\``)
        }
        if (!isYouTube(input)) {
            return m.reply('❌ *Link inválido!*\n\nEnvie um link válido do YouTube.')
        }

        await m.react('⏳')
        try {
            const isVideo = cmd === 'ytmp4' || cmd === 'ytvideo'
            if (!isVideo) {
                const musica = await buscarMusica(input)
                const audio = musica ? await baixarAudio(musica.fileUrl) : null
                if (!audio) {
                    await m.react('❌')
                    return m.reply('❌ *Falha ao baixar!*\n\nNão consegui obter o áudio. Tente de novo.')
                }
                await conn.sendMessage(m.chat, {
                    audio,
                    mimetype: 'audio/mpeg',
                    fileName: `${musica.title.replace(/[^\w\s.-]/g, '')}.mp3`,
                    caption: `🎵 *${musica.title}*\n\n👤 ${musica.channel}\n⏱️ ${formatDuration(musica.duration)}\n🔗 ${musica.url || input}`
                }, { quoted: m })
                await m.react('✅')
                return
            }
            const res = await ytmp4(input)

            if (!res?.status) {
                await m.react('❌')
                return m.reply(`❌ *Falha ao baixar!*\n\n${res?.message || 'Erro desconhecido.'}`)
            }

            const meta = res.metadata || {}
            const dl = res.download || {}
            const caption = `🎬 *${meta.title || 'Vídeo'}*\n\n👤 ${meta.author || 'Desconhecido'}\n⏱️ ${formatDuration(meta.duration)}\n🔗 ${meta.url || input}`

            if (isVideo) {
                await conn.sendMessage(m.chat, {
                    video: { url: dl.url },
                    caption,
                    mimetype: 'video/mp4',
                    fileName: `${(meta.title || 'video').replace(/[^\w\s.-]/g, '')}.mp4`
                }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, {
                    audio: { url: dl.url },
                    caption,
                    mimetype: 'audio/mpeg',
                    fileName: `${(meta.title || 'audio').replace(/[^\w\s.-]/g, '')}.mp3`
                }, { quoted: m })
            }
            await m.react('✅')
        } catch (e) {
            console.error('[YT-DOWNLOAD]', e)
            await m.react('❌')
            m.reply('❌ *Erro ao baixar do YouTube!*\n\nTente novamente em instantes.')
        }
        return
    }

    // ---------- !ytsearch ----------
    if (cmd === 'ytsearch' || cmd === 'pesquisa_yt' || cmd === 'yt-info' || cmd === 'ytinfo') {
        if (!input) {
            return m.reply(`📝 *Uso:*\n!${cmd} <termo de busca>\n\n*Exemplo:*\n\`!${cmd} Never gonna give you up\``)
        }

        await m.react('⏳')
        try {
            const results = await yts(input)
            if (!results?.videos?.length) {
                await m.react('❌')
                return m.reply('❌ *Nenhum vídeo encontrado!*')
            }

            // Monta o card com o primeiro resultado
            const v = results.videos[0]

            if (cmd === 'yt-info' || cmd === 'ytinfo') {
                let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
                txt += `  🎬 *INFORMAÇÕES DO VÍDEO*\n`
                txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`
                txt += `📌 *Título:* ${v.title}\n`
                txt += `👤 *Canal:* ${v.author?.name || 'Desconhecido'}\n`
                txt += `⏱️ *Duração:* ${formatDuration(v.duration?.seconds)}\n`
                txt += `👁️ *Views:* ${(v.views?.toLocaleString?.() || v.views || 0)}\n`
                txt += `📅 *Publicado:* ${v.published || 'N/D'}\n`
                txt += `🔗 *Link:* ${v.url}\n`
                txt += `\n━━━━━━━━━━━━━━━━━━━━━━\n`
                txt += `💡 \`!ytmp3 ${v.url}\` — baixar áudio\n`
                txt += `💡 \`!ytmp4 ${v.url}\` — baixar vídeo`
                await m.reply(txt)
                await m.react('✅')
                return
            }

            // Lista os 5 primeiros
            let txt = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`
            txt += `  🔎 *YOUTUBE SEARCH*\n`
            txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`
            txt += `🔍 *Termo:* ${input}\n\n`

            results.videos.slice(0, 5).forEach((vid, i) => {
                txt += `${i + 1}. *${vid.title}*\n`
                txt += `   👤 ${vid.author?.name || 'N/D'} • ⏱️ ${formatDuration(vid.duration?.seconds)}\n`
                txt += `   🔗 ${vid.url}\n\n`
            })

            txt += `━━━━━━━━━━━━━━━━━━━━━━\n`
            txt += `💡 \`!ytmp3 <link>\` — baixar áudio\n`
            txt += `💡 \`!ytmp4 <link>\` — baixar vídeo`

            await conn.sendMessage(m.chat, {
                image: { url: v.thumbnail?.url || 'https://files.catbox.moe/yyk5xo.jpg' },
                caption: txt,
                mentions: [m.sender]
            }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            console.error('[YT-SEARCH]', e)
            await m.react('❌')
            m.reply('❌ *Erro ao buscar no YouTube!*')
        }
        return
    }

    // ---------- !ytplay (busca + baixa pelo nome) ----------
    if (cmd === 'ytplay' || cmd === 'playyt') {
        if (!input) {
            return m.reply(`📝 *Uso:*\n!ytplay <nome da música>\n\n*Exemplo:*\n\`!ytplay never gonna give you up\``)
        }

        await m.react('⏳')
        try {
            const musica = await buscarMusica(input)
            if (!musica) {
                await m.react('❌')
                return m.reply('❌ *Nenhuma música encontrada!*')
            }
            const audio = await baixarAudio(musica.fileUrl)
            if (!audio) {
                await m.react('❌')
                return m.reply('❌ *Falha ao baixar a música!*\n\nTente novamente em instantes.')
            }
            await conn.sendMessage(m.chat, {
                audio,
                mimetype: 'audio/mpeg',
                fileName: `${musica.title.replace(/[^\w\s.-]/g, '')}.mp3`,
                caption: `🎧 *${musica.title}*\n\n👤 ${musica.channel}\n⏱️ ${formatDuration(musica.duration)}\n🔗 ${musica.url || ''}`
            }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            console.error('[YT-PLAY]', e)
            await m.react('❌')
            m.reply('❌ *Erro ao tocar a música!*')
        }
    }
}

handler.help = ['ytmp3', 'ytmp4', 'ytsearch', 'yt-info', 'ytplay']
handler.tags = ['download', 'youtube']
handler.command = ['ytmp3', 'ytaudio', 'ytmp4', 'ytvideo', 'ytsearch', 'pesquisa_yt', 'yt-info', 'ytinfo', 'ytplay', 'playyt']

export default handler
