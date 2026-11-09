/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩
 *
 * @project Gótica Bot - Cliente de música (API Soberana)
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Busca e download de músicas pela API própria.
 *
 *   GET /play?search=<termo>   -> dados do vídeo + arquivo de áudio
 *   GET /files/<arquivo>.m4a   -> download do áudio (exige a chave)
 *
 * A chave vai no cabeçalho `x-api-key`. O campo `url` que a API devolve
 * aponta para localhost, então o arquivo é reescrito para o domínio
 * público antes do download.
 */

import axios from 'axios'

export const API_URL = process.env.API_URL || 'https://api.devsoberano.com'
export const API_KEY = process.env.API_KEY || 'sb_bot_gotica_8f9a2b'

const cabecalhos = () => ({ 'x-api-key': API_KEY })

/** Troca o host local devolvido pela API pelo domínio público. */
function arquivoPublico(urlLocal) {
    const nome = String(urlLocal || '').split('/').pop()
    return nome ? `${API_URL}/files/${nome}` : null
}

/**
 * Busca uma música pelo nome ou link.
 * @returns {Promise<{title, url, thumbnail, duration, channel, fileUrl}|null>}
 */
export async function buscarMusica(termo) {
    try {
        const { data } = await axios.get(`${API_URL}/play`, {
            params: { search: termo },
            headers: cabecalhos(),
            timeout: 60000
        })
        if (!data?.file && !data?.url) return null
        return {
            title: data.title || 'Música',
            url: data.youtube_video_url || null,
            thumbnail: data.thumbnail || null,
            duration: data.total_duration_in_seconds || 0,
            channel: data.channel?.name || 'Desconhecido',
            fileUrl: arquivoPublico(data.url)
        }
    } catch (e) {
        return null
    }
}

/**
 * Baixa o áudio como Buffer (já com a chave).
 * @returns {Promise<Buffer|null>}
 */
export async function baixarAudio(fileUrl) {
    try {
        const { data } = await axios.get(fileUrl, {
            headers: cabecalhos(),
            responseType: 'arraybuffer',
            timeout: 120000,
            maxContentLength: 100 * 1024 * 1024
        })
        return Buffer.from(data)
    } catch (e) {
        return null
    }
}

export default { buscarMusica, baixarAudio }
