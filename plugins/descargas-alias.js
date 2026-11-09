/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Aliases de Download
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Aliases de download portados do Minato. Todos encaminham para
 * plugins/descargas-youtube.js (ytmp3 / ytmp4 / ytsearch):
 *  !play2, !play_audio, !playvideo, !play_video, !playvid,
 *  !playmp4, !playdoc, !play_doc
 *
 * !playstore busca apps na Play Store.
 */

import yts from 'yt-search'
import { ytmp3, ytmp4 } from '../lib/youtubedl.js'
import axios from 'axios'

/** Formata a duração (segundos). */
function formatDuration(secs) {
    const s = Math.floor(Number(secs) || 0)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
        : `${m}:${String(sec).padStart(2, '0')}`
}

const handler = async (m, { conn, args, command, text }) => {
    const cmd = (command || '').toLowerCase()

    // ══════════════ !playstore ══════════════
    if (cmd === 'playstore') {
        if (!text) return m.reply('📝 *Uso:*\n!playstore <nome do app>')
        await m.react('⏳')
        try {
            const res = await axios.get('https://playstoreapi.hpavil.com/search', {
                params: { q: text, hl: 'pt', gl: 'BR' },
                timeout: 20000
            })
            const apps = res.data?.apps || []
            if (!apps.length) {
                await m.react('❌')
                return m.reply('❌ *Nenhum app encontrado!*')
            }

            let txt = `🛒 *PLAY STORE*\n\n🔍 *Termo:* ${text}\n\n`
            apps.slice(0, 10).forEach((a, i) => {
                txt += `${i + 1}. *${a.title}*\n`
                txt += `   👤 ${a.developer || 'N/D'}\n`
                txt += `   ⭐ ${a.score || 'N/D'} (${a.scoreNormalized || 'N/D'})\n`
                txt += `   🔗 ${a.url}\n\n`
            })
            await m.reply(txt)
            await m.react('✅')
        } catch (e) {
            console.error('[PLAYSTORE]', e)
            await m.react('❌')
            m.reply('❌ *Erro ao buscar na Play Store!*')
        }
        return
    }

    // ══════════════ Aliases de download ══════════════
    // play_audio -> mp3 ; playvideo/play_video/playvid/playmp4 -> mp4
    // play2 -> busca pelo nome e baixa o audio
    // playdoc/play_doc -> baixa o documento do link

    const ehVideo = ['playvideo', 'play_video', 'playvid', 'playmp4'].includes(cmd)
    const ehAudio = ['play_audio'].includes(cmd)
    const ehDoc = ['playdoc', 'play_doc'].includes(cmd)
    const ehNome = cmd === 'play2'

    if (!ehVideo && !ehAudio && !ehDoc && !ehNome) return

    if (!text) {
        return m.reply(`📝 *Uso:*\n!${cmd} <link ou nome>\n\n💡 \`!ytsearch\` para buscar vídeos.`)
    }

    await m.react('⏳')
    try {
        let url = text.trim()

        // Se for só um nome, busca no YouTube
        if (ehNome || !/^https?:\/\//i.test(url)) {
            const busca = await yts(url)
            if (!busca?.videos?.length) {
                await m.react('❌')
                return m.reply('❌ *Nenhum vídeo encontrado!*')
            }
            url = busca.videos[0].url
        }

        if (ehDoc) {
            // Baixa o documento (PDF) via api externa
            const res = await axios.get('https://api.techniknews.net/asos/l/document', {
                params: { url },
                timeout: 30000
            })
            const link = res.data?.data?.download
            if (!link) {
                await m.react('❌')
                return m.reply('❌ *Não consegui obter o documento!*')
            }
            await conn.sendMessage(m.chat, {
                document: { url: link },
                fileName: 'documento.pdf',
                mimetype: 'application/pdf',
                caption: '📄 *Documento baixado!*'
            }, { quoted: m })
            await m.react('✅')
            return
        }

        const res = ehVideo ? await ytmp4(url) : await ytmp3(url)
        if (!res?.status) {
            await m.react('❌')
            return m.reply(`❌ *Falha ao baixar!*\n\n${res?.message || 'Erro desconhecido.'}`)
        }

        const meta = res.metadata || {}
        const caption = `🎬 *${meta.title || 'Mídia'}*\n\n👤 ${meta.author || 'Desconhecido'}\n⏱️ ${formatDuration(meta.duration)}\n🔗 ${meta.url || url}`

        if (ehVideo) {
            await conn.sendMessage(m.chat, {
                video: { url: res.download?.url },
                caption,
                mimetype: 'video/mp4',
                fileName: `${(meta.title || 'video').replace(/[^\w\s.-]/g, '')}.mp4`
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, {
                audio: { url: res.download?.url },
                caption,
                mimetype: 'audio/mpeg',
                fileName: `${(meta.title || 'audio').replace(/[^\w\s.-]/g, '')}.mp3`
            }, { quoted: m })
        }
        await m.react('✅')
    } catch (e) {
        console.error('[PLAY-ALIAS]', e)
        await m.react('❌')
        m.reply('❌ *Erro ao baixar!*')
    }
}

handler.help = ['play2', 'play_audio', 'playvideo', 'playvid', 'playmp4', 'playdoc', 'playstore']
handler.tags = ['download', 'media']
handler.command = ['play2', 'play_audio', 'playvideo', 'play_video', 'playvid', 'playmp4',
    'playdoc', 'play_doc', 'playstore']

export default handler
