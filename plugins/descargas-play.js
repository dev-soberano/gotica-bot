/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fetch from 'node-fetch'
import fs from 'fs'

// Função para formatar segundos em MM:SS ou HH:MM:SS
function formatarTempo(segundos) {
    if (!segundos || isNaN(segundos)) return '00:00'
    const sec = Number(segundos)
    const horas = Math.floor(sec / 3600)
    const minutos = Math.floor((sec % 3600) / 60)
    const segRestantes = Math.floor(sec % 60)

    const pad = (num) => String(num).padStart(2, '0')

    if (horas > 0) {
        return `${pad(horas)}:${pad(minutos)}:${pad(segRestantes)}`
    }
    return `${pad(minutos)}:${pad(segRestantes)}`
}

let handler = async (m, { conn, text }) => {
    const devLeandro = "༄ Đev Šoberano ×͜×"

    const minhaApiURL = 'https://api.devsoberano.com'
    const apiKey = 'sb_bot_gotica_8f9a2b'

    if (!text.trim()) return conn.reply(m.chat, '*✨ Hey!* Digite o nome da música para buscar.', m)

    if (text.includes("http://") || text.includes("https://")) {
        return m.reply('*💋 Erro:* Não use links aqui! Para baixar com link, use o comando de YouTube.')
    }

    await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key }})

    try {
        // Envia tanto 'apikey' quanto 'api_key' para garantir compatibilidade com a rota /play
        const querySearch = encodeURIComponent(text.trim())
        const endpoint = `${minhaApiURL}/play?search=${querySearch}&apikey=${apiKey}&api_key=${apiKey}`
        
        let res = await fetch(endpoint)

        const contentType = res.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            return m.reply("*🌙 Erro:* Minha API não respondeu em JSON. Verifique se ela está ativa.")
        }

        let data = await res.json()

        if (res.status === 401 || res.status === 403) {
            return m.reply(`*🔑 Erro de Autenticação:* ${data.error || 'Token inválido!'}`)
        }

        if (!data || (!data.url && !data.file)) {
            return m.reply("*💫 Erro:* Música não encontrada!")
        }

        const duracaoFormatada = formatarTempo(data.total_duration_in_seconds)

        const textoMensagem = `*💋 ─ ☾ GOTICA PLAY ☽ ─ 💫*\n\n` +
            `> *🎵 Título »* _${data.title}_\n` +
            `> *⏳ Duração »* _${duracaoFormatada}_\n` +
            `> *📺 Canal »* _${data.channel?.name || 'YouTube'}_\n` +
            `> *👤 Dev »* _${devLeandro}_\n\n` +
            `*⭐ AGUARDE! Enviando áudio...*`

        // 1. Envia a thumbnail com a legenda
        if (data.thumbnail) {
            await conn.sendMessage(m.chat, {
                image: { url: data.thumbnail },
                caption: textoMensagem
            }, { quoted: m })
        } else {
            await conn.reply(m.chat, textoMensagem, m)
        }

        // 2. Carrega o Buffer do Áudio (Prioriza arquivo local se estiver na VPS ou trata URL pública)
        let audioBuffer
        const caminhoLocal = data.file ? String(data.file).trim() : ''

        if (caminhoLocal && fs.existsSync(caminhoLocal)) {
            audioBuffer = fs.readFileSync(caminhoLocal)
        } else if (data.url) {
            // Se a API retornar localhost na URL, converte para o domínio público HTTPS
            let urlDownload = data.url.trim()
            if (urlDownload.includes('localhost:3000')) {
                urlDownload = urlDownload.replace('http://localhost:3000', minhaApiURL)
            }

            const resAudio = await fetch(urlDownload)
            if (!resAudio.ok) throw new Error('Falha ao baixar áudio da URL da API')
            
            const arrayBuffer = await resAudio.arrayBuffer()
            audioBuffer = Buffer.from(arrayBuffer)
        } else {
            return m.reply('*💫 Erro:* Falha ao carregar o arquivo de áudio!')
        }

        // 3. Envia o áudio no WhatsApp
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            fileName: `${data.title}.mp3`,
            mimetype: "audio/mp4",
            ptt: false
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key }})

    } catch (e) {
        console.error('ERRO API PRÓPRIA:', e)
        m.reply('*🖤 Erro:* Não foi possível processar o áudio. Tente novamente.')
    }
}

handler.help = ["play"]
handler.tags = ["descargas"]
handler.command = ["play", "musica", "p"] 
handler.group = true
handler.register = false

export default handler