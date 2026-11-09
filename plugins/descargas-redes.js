/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Downloads e Redes Sociais
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Downloads de redes sociais portados do Minato:
 *  !tiktok       - baixa vídeo do TikTok
 *  !tiktoksearch - busca no TikTok
 *  !tiktokstalk  - info de perfil do TikTok
 *  !instagram    - baixa do Instagram
 *  !insta        - alias de instagram
 *  !insta_video  - baixa vídeo do Instagram
 *  !insta_audio  - baixa áudio do Instagram
 *  !instamp3     - baixa áudio do Instagram
 *  !fbvideo      - baixa do Facebook
 *  !fb           - alias de fbvideo
 *  !fbmp3        - baixa áudio do Facebook
 *  !facebook     - alias
 *  !facebookaudio - alias
 *  !facebookvideo - alias
 *  !pinterest    - baixa do Pinterest
 *  !pinterestimg - imagem do Pinterest
 *  !pinterestvideo - vídeo do Pinterest
 *  !pinterestaudio - áudio do Pinterest
 *  !figuapi      - figurinha via API
 */

import axios from 'axios'
import fetch from 'node-fetch'
import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

/** Extrai o ID do TikTok de uma URL. */
function tiktokId(url) {
    const m = String(url).match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/i)
    return m ? m[1] : null
}

/** Extrai o shortcode do Instagram de uma URL. */
function instaShortcode(url) {
    const m = String(url).match(/instagram\.com\/(?:p|reel|tv)\/([\w-]+)/i)
    return m ? m[1] : null
}

/** Baixa um buffer de uma URL. */
async function getBuffer(url, headers = {}) {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', ...headers } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return Buffer.from(await res.arrayBuffer())
}

const handler = async (m, { conn, args, command, text }) => {
    const cmd = (command || '').toLowerCase()
    const url = text.trim()

    // ══════════════ TikTok ══════════════
    if (cmd === 'tiktok' || cmd === 'tiktokd') {
        const id = tiktokId(url)
        if (!id) return m.reply('❌ *Link do TikTok inválido!*\n\n💡 Envie um link como `https://www.tiktok.com/@user/video/123`')
        await m.react('⏳')
        try {
            const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`
            const res = await axios.get(api, { timeout: 25000 })
            const data = res.data?.data
            if (!data?.play) {
                await m.react('❌')
                return m.reply('❌ *Não consegui baixar o vídeo!*')
            }
            const buf = await getBuffer(data.play)
            await conn.sendMessage(m.chat, {
                video: buf,
                mimetype: 'video/mp4',
                fileName: 'tiktok.mp4',
                caption: `🎵 *${data.title || 'TikTok'}*\n\n👤 @${data.author?.unique_id || 'desconhecido'}`
            }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            console.error('[TIKTOK]', e)
            await m.react('❌')
            m.reply('❌ *Erro ao baixar do TikTok!*')
        }
        return
    }

    if (cmd === 'tiktoksearch' || cmd === 'tiktokstalker' || cmd === 'tiktokstalk') {
        if (!url) return m.reply('📝 *Uso:*\n!tiktoksearch <termo>')
        await m.react('⏳')
        try {
            const res = await axios.get(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(url)}&count=10`, { timeout: 25000 })
            const data = res.data?.data || []
            if (!data.length) {
                await m.react('❌')
                return m.reply('❌ *Nenhum resultado encontrado!*')
            }
            let txt = `🔎 *TIKTOK SEARCH*\n\n🔍 *Termo:* ${url}\n\n`
            data.slice(0, 8).forEach((v, i) => {
                txt += `${i + 1}. *${(v.title || 'Sem título').slice(0, 50)}*\n   👤 @${v.author?.unique_id || '?'}\n   🔗 https://www.tiktok.com/@${v.author?.unique_id}/video/${v.video_id}\n\n`
            })
            txt += `💡 \`!tiktok <link>\` — baixar`
            await m.reply(txt)
            await m.react('✅')
        } catch (e) {
            console.error('[TIKTOK-SEARCH]', e)
            await m.react('❌')
            m.reply('❌ *Erro ao buscar no TikTok!*')
        }
        return
    }

    // ══════════════ Instagram ══════════════
    if (cmd === 'instagram' || cmd === 'insta' || cmd === 'ig' || cmd === 'instamp3' ||
        cmd === 'insta_video' || cmd === 'insta_audio' || cmd === 'instagramvideo' || cmd === 'instagramaudio') {
        const code = instaShortcode(url)
        if (!code) return m.reply('❌ *Link do Instagram inválido!*\n\n💡 Envie um link como `https://instagram.com/p/ABC123`')
        await m.react('⏳')
        try {
            const api = `https://www.sssinstagram.com/api?igurl=${encodeURIComponent(url)}`
            const res = await axios.get(api, { timeout: 25000, headers: { 'User-Agent': 'Mozilla/5.0' } })
            const data = res.data
            const media = data?.media?.[0]
            const isAudio = cmd === 'instamp3' || cmd === 'insta_audio' || cmd === 'instagramaudio'

            const link = isAudio ? (media?.downloadUrl_audio || media?.downloadUrl_mp3)
                : (media?.downloadUrl || media?.downloadUrl_hd)

            if (!link) {
                await m.react('❌')
                return m.reply('❌ *Não consegui obter a mídia!*')
            }

            const buf = await getBuffer(link)
            if (isAudio) {
                await conn.sendMessage(m.chat, {
                    audio: buf,
                    mimetype: 'audio/mpeg',
                    fileName: 'instagram.mp3',
                    caption: `🎧 *Instagram*\n\n👤 @${media?.user?.username || 'desconhecido'}`
                }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, {
                    video: buf,
                    mimetype: 'video/mp4',
                    fileName: 'instagram.mp4',
                    caption: `📸 *Instagram*\n\n👤 @${media?.user?.username || 'desconhecido'}`
                }, { quoted: m })
            }
            await m.react('✅')
        } catch (e) {
            console.error('[INSTAGRAM]', e)
            await m.react('❌')
            m.reply('❌ *Erro ao baixar do Instagram!*')
        }
        return
    }

    // ══════════════ Facebook ══════════════
    if (cmd === 'fbvideo' || cmd === 'fb' || cmd === 'facebook' || cmd === 'facebookvideo' ||
        cmd === 'fbmp3' || cmd === 'facebookaudio') {
        if (!url) return m.reply('📝 *Uso:*\n!fbvideo <link do Facebook>')
        await m.react('⏳')
        try {
            const res = await axios.get(`https://www.ebioweb.click/api/video?url=${encodeURIComponent(url)}`, { timeout: 25000 })
            const data = res.data
            const isAudio = cmd === 'fbmp3' || cmd === 'facebookaudio'
            const link = isAudio ? (data?.audio_url || data?.download_url) : (data?.hd || data?.sd)

            if (!link) {
                await m.react('❌')
                return m.reply('❌ *Não consegui obter a mídia do Facebook!*')
            }

            const buf = await getBuffer(link)
            if (isAudio) {
                await conn.sendMessage(m.chat, {
                    audio: buf,
                    mimetype: 'audio/mpeg',
                    fileName: 'facebook.mp3'
                }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, {
                    video: buf,
                    mimetype: 'video/mp4',
                    fileName: 'facebook.mp4'
                }, { quoted: m })
            }
            await m.react('✅')
        } catch (e) {
            console.error('[FACEBOOK]', e)
            await m.react('❌')
            m.reply('❌ *Erro ao baixar do Facebook!*')
        }
        return
    }

    // ══════════════ Pinterest ══════════════
    if (cmd === 'pinterest' || cmd === 'pinterestimg' || cmd === 'pinterestvideo' || cmd === 'pinterestaudio') {
        if (!url) return m.reply('📝 *Uso:*\n!pinterest <link ou termo>')
        await m.react('⏳')
        try {
            let imgUrl = null

            // Se for link direto de imagem, usa ele
            if (/\.(jpg|jpeg|png|gif|webp|mp4)(\?|$)/i.test(url)) {
                imgUrl = url
            } else {
                const res = await axios.get(
                    `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2F&data=${encodeURIComponent(JSON.stringify({ options: { query: url, scope: 'pins', page_size: 10 } }))}`,
                    { timeout: 25000, headers: { 'User-Agent': 'Mozilla/5.0' } }
                )
                const results = res.data?.data?.results || []
                const pin = results.find(r => r?.images?.orig)
                if (!pin) {
                    await m.react('❌')
                    return m.reply('❌ *Nenhuma imagem encontrada!*')
                }
                imgUrl = pin.images.orig.url
            }

            const buf = await getBuffer(imgUrl)
            if (cmd === 'pinterestvideo') {
                await conn.sendMessage(m.chat, { video: buf, mimetype: 'video/mp4', fileName: 'pinterest.mp4' }, { quoted: m })
            } else if (cmd === 'pinterestaudio') {
                await conn.sendMessage(m.chat, { audio: buf, mimetype: 'audio/mpeg', fileName: 'pinterest.mp3' }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, { image: buf, caption: '📌 *Pinterest*' }, { quoted: m })
            }
            await m.react('✅')
        } catch (e) {
            console.error('[PINTEREST]', e)
            await m.react('❌')
            m.reply('❌ *Erro ao baixar do Pinterest!*')
        }
        return
    }
}

handler.help = ['tiktok', 'tiktoksearch', 'instagram', 'fbvideo', 'pinterest']
handler.tags = ['download', 'social']
handler.command = ['tiktok', 'tiktokd', 'tiktoksearch', 'tiktokstalk', 'tiktokstalker',
    'instagram', 'insta', 'ig', 'instamp3', 'insta_video', 'insta_audio', 'instagramvideo', 'instagramaudio',
    'fbvideo', 'fb', 'facebook', 'facebookvideo', 'fbmp3', 'facebookaudio',
    'pinterestimg', 'pinterestvideo', 'pinterestaudio']

export default handler
