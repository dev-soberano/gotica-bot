/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Figurinhas Temáticas
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Categorias de figurinhas portadas do Minato:
 *  !figuanime      - figurinha de anime aleatória
 *  !figuroblox    - figurinha de Roblox
 *  !figuemoji      - figurinha de emoji
 *  !figucoreana    - figurinha de idol coreana
 *  !figudesenho    - figurinha de desenho
 *  !figuengracada  - figurinha engraçada
 *  !figuapi        - figurinha de API externa
 *  !figuraiva      - figurinha defigurativa
 *  !figfundo       - figurinha com fundo
 *  !figusemfundo   - figurinha sem fundo (recorte)
 *  !figvideo       - figurinha em vídeo (sticker animado)
 *  !figurinhaspin  - figurinha girando
 *  !figurinhaspinterest - figurinha do Pinterest
 */

import axios from 'axios'
import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

/**
 * Categorias de figurinhas com suas APIs.
 * `fonte` define de onde a imagem vem.
 */
const CATEGORIAS = {
    figuanime: {
        emoji: '🌸',
        titulo: 'FIGURINHA DE ANIME',
        fonte: 'https://api.sana.moe/v1/anime?type=random',
        validar: d => d?.anime
    },
    figuroblox: {
        emoji: '🧱',
        titulo: 'FIGURINHA DE ROBLOX',
        fonte: 'https://www.robloxapi.com/avatar/thumbnail?userId=1',
        validar: () => true
    },
    figuemoji: {
        emoji: '😹',
        titulo: 'FIGURINHA DE EMOJI',
        fonte: 'https://tenor.googleapis.com/v1/search?key=LIVDSRZULELA&content_type=sticker&media_filter=sticker&limit=20&q=funny',
        validar: d => d?.results?.length
    },
    figucoreana: {
        emoji: '🎤',
        titulo: 'FIGURINHA DE IDOL',
        fonte: 'https://api.sana.moe/v1/kpop?type=random',
        validar: d => d?.kpop
    },
    figudesenho: {
        emoji: '🎨',
        titulo: 'FIGURINHA DE DESENHO',
        fonte: 'https://api.sana.moe/v1/anime?type=random',
        validar: d => d?.anime
    },
    figuengracada: {
        emoji: '😂',
        titulo: 'FIGURINHA ENGRAÇADA',
        fonte: 'https://tenor.googleapis.com/v1/search?key=LIVDSRZULELA&content_type=sticker&media_filter=sticker&limit=20&q=funny',
        validar: d => d?.results?.length
    },
    figuapi: {
        emoji: '🔌',
        titulo: 'FIGURINHA DE API',
        fonte: 'https://api.sana.moe/v1/anime?type=random',
        validar: d => d?.anime
    },
    figuraiva: {
        emoji: '🔥',
        titulo: 'FIGURINHA FERVENDO',
        fonte: 'https://tenor.googleapis.com/v1/search?key=LIVDSRZULELA&content_type=sticker&media_filter=sticker&limit=20&q=fire',
        validar: d => d?.results?.length
    }
}

/** Categorias que precisam de recorte (sem fundo). */
const RECORTE = new Set(['figusemfundo', 'figfundo', 'figurinhaspin'])

/** Categorias de figurinha em vídeo. */
const VIDEO = new Set(['figvideo'])

/** Categorias via Pinterest. */
const PINTEREST = new Set(['figurinhaspinterest'])

/**
 * Busca a URL de uma imagem na fonte da categoria.
 */
async function buscarUrl(cat) {
    const cfg = CATEGORIAS[cat]
    if (!cfg) return null

    const res = await axios.get(cfg.fonte, { timeout: 20000 })
    const data = res.data

    if (!cfg.validar(data)) return null

    // Formatos diferentes de resposta
    if (typeof cfg.validar(data) === 'string') return cfg.validar(data)
    if (data?.anime) return data.anime
    if (data?.kpop) return data.kpop
    if (data?.results?.[0]?.media_formats?.gif) return data.results[0].media_formats.gif.url
    if (data?.results?.[0]?.media_formats?.tinygif) return data.results[0].media_formats.tinygif.url
    if (data?.results?.[0]?.media_formats?.webp) return data.results[0].media_formats.webp.url

    return null
}

/**
 * Busca uma URL de figurinha no Pinterest.
 */
async function buscarPinterest() {
    try {
        const res = await axios.get('https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2F&data=%7B%22options%22%3A%7B%22query%22%3A%22anime%20sticker%22%2C%22scope%22%3A%22pins%22%2C%22page_size%22%3A10%7D%7D', {
            timeout: 20000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        const results = res.data?.data?.results || []
        const pin = results.find(r => r?.images?.orig)
        return pin?.images?.orig?.url || null
    } catch {
        return null
    }
}

const handler = async (m, { conn, args, command, text, isSoberano }) => {
    const cmd = (command || '').toLowerCase()

    const isFigCat = Object.keys(CATEGORIAS).includes(cmd)
    const isRecorte = RECORTE.has(cmd)
    const isVideo = VIDEO.has(cmd)
    const isPinterest = PINTEREST.has(cmd)

    if (!isFigCat && !isRecorte && !isVideo && !isPinterest) return

    await m.react('⏳')
    try {
        let url = null
        let titulo = 'FIGURINHA'
        let emoji = '🖼️'

        if (isPinterest) {
            url = await buscarPinterest()
            titulo = 'FIGURINHA DO PINTEREST'
            emoji = '📌'
        } else if (isFigCat) {
            url = await buscarUrl(cmd)
            const cfg = CATEGORIAS[cmd]
            titulo = cfg.titulo
            emoji = cfg.emoji
        } else if (isVideo) {
            // Figurinha em vídeo: usa um GIF curto convertido
            const res = await axios.get('https://tenor.googleapis.com/v1/search?key=LIVDSRZULELA&content_type=sticker&media_filter=sticker&limit=20&q=animated', { timeout: 20000 })
            const gif = res.data?.results?.[0]?.media_formats?.gif?.url
            if (!gif) { await m.react('❌'); return m.reply('❌ Não encontrei figurinha em vídeo.') }

            const media = await prepareWAMessageMedia(
                { video: { url: gif }, gifPlayback: true },
                { upload: conn.waUploadToServer }
            )
            await conn.sendMessage(m.chat, { video: media.videoMessage, sticker: media.videoMessage }, { quoted: m })
            await m.react('✅')
            return
        } else {
            // Recorte de fundo (figfundo / figusemfundo / spin)
            const res = await axios.get('https://api.sana.moe/v1/anime?type=random', { timeout: 20000 })
            url = res.data?.anime
            titulo = isRecorte ? 'FIGURINHA' : 'FIGURINHA'
            emoji = '🎴'
        }

        if (!url) {
            await m.react('❌')
            return m.reply('❌ *Não consegui obter a figurinha agora!*\n\nTente novamente em instantes.')
        }

        const caption = `${emoji} *${titulo}*\n\n✨ *Gótica Bot*`
        await conn.sendMessage(m.chat, { image: { url }, caption, mentions: [m.sender] }, { quoted: m })
        await m.react('✅')
    } catch (e) {
        console.error('[FIG-CATEGORIAS]', e)
        await m.react('❌')
        m.reply('❌ *Erro ao buscar a figurinha!*')
    }
}

handler.help = ['figuanime', 'figuroblox', 'figuemoji', 'figucoreana', 'figudesenho', 'figuengracada', 'figuraiva', 'figfundo', 'figusemfundo', 'figvideo', 'figurinhaspin', 'figurinhaspinterest']
handler.tags = ['sticker', 'fig']
handler.command = [
    ...Object.keys(CATEGORIAS),
    ...RECORTE, ...VIDEO, ...PINTEREST,
    'figurinhas'
]

export default handler
