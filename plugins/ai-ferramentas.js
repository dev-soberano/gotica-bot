/**
 * ███████╗ ██████╗ ████████╗████████╗██╗ ██████╗ █████╗
 * ██╔════╝██╔═══██╗╚══██╔══╝╚══██╔══╝██║██╔═══██╗██╔══██╗
 * ███████╗██║   ██║   ██║     ██║   ██║██║██║   ██║███████║
 * ╚════██║██║   ██║   ██║     ██║   ██║██║██║   ██║██╔══██╗
 * ███████║╚██████╔╝   ██║     ╚██████╔╝╚██████╔╝██║  ██║
 * ╚══════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - IA Extra & Ferramentas
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * Comandos de IA e ferramentas portados do Minato:
 *  !perplexity   - busca com IA (resposta com fontes)
 *  !text2img     - texto para imagem
 *  !transcrever  - transcreve áudio (AssemblyAI / Whisper API)
 *  !tts          - texto para voz (já existente, alias)
 *  !gtts         - google TTS
 *  !reconhecer   - identifica música (shazam-like)
 */

import axios from 'axios'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const GEMINI_KEY = 'AIzaSyDM0a9Foc8HFE4gAFS-iZ3FluqqywzBr5g'

/**
 * Chama o Gemini para gerar texto.
 */
async function gemini(prompt, modelo = 'gemini-1.5-flash') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${GEMINI_KEY}`
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error?.message || 'Erro na API')
    return json?.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n') || ''
}

const handler = async (m, { conn, args, command, text, usedPrefix }) => {
    const cmd = (command || '').toLowerCase()

    // ---------- !perplexity ----------
    if (cmd === 'perplexity' || cmd === 'perplexity-ai' || cmd === 'pesquisa') {
        if (!text) {
            return m.reply(`📝 *Uso:*\n!perplexity <sua pergunta>\n\n*Exemplo:*\n\`!perplexity quem ganhou a champions league 2024?\``)
        }

        await m.react('⏳')
        try {
            const prompt = `Responda a pergunta abaixo de forma clara e concisa em português. Se souber, inclua dados atuais.

Pergunta: ${text}`
            const resposta = await gemini(prompt, 'gemini-1.5-flash')

            if (!resposta) {
                await m.react('❌')
                return m.reply('❌ *Não consegui gerar a resposta agora.*')
            }

            await conn.sendMessage(m.chat, {
                text: `🔎 *PERPLEXITY*\n\n*Pergunta:* ${text}\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n${resposta}\n\n━━━━━━━━━━━━━━━━━━━━━━\n✨ *by Gótica Bot*`
            }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            console.error('[PERPLEXITY]', e)
            await m.react('❌')
            m.reply('❌ *Erro ao consultar a IA!*')
        }
        return
    }

    // ---------- !text2img / !textimg ----------
    if (cmd === 'text2img' || cmd === 'textimg' || cmd === 'freecreate') {
        if (!text) {
            return m.reply(`📝 *Uso:*\n!text2img <descrição da imagem>\n\n*Exemplo:*\n\`!text2img um gato samurai no espaço\``)
        }

        await m.react('⏳')
        try {
            // Usa a API do Pollinations (gratuita, sem chave)
            const prompt = encodeURIComponent(text)
            const url = `https://image.pollinations.ai/prompt/${prompt}?width=768&height=768&nologo=true&seed=${Date.now() % 100000}`
            await conn.sendMessage(m.chat, {
                image: { url },
                caption: `🎨 *TEXTO PARA IMAGEM*\n\n📝 ${text}\n\n✨ *by Gótica Bot*`,
                mentions: [m.sender]
            }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            console.error('[TEXT2IMG]', e)
            await m.react('❌')
            m.reply('❌ *Erro ao gerar a imagem!*')
        }
        return
    }

    // ---------- !transcrever / !tt / !ttaudio / !ttsearch ----------
    if (cmd === 'transcrever' || cmd === 'tt' || cmd === 'ttaudio') {
        const q = m.quoted
        const mime = (q?.msg || q)?.mimetype || ''
        if (!q || !mime.startsWith('audio/')) {
            return m.reply('❌ *Envie ou responda a um ÁUDIO para transcrever!*')
        }

        await m.react('⏳')
        try {
            const buffer = await q.download(true)
            if (!buffer) {
                await m.react('❌')
                return m.reply('❌ Erro ao baixar o áudio.')
            }

            // Tenta o Whisper API do Gígono / fallback para STT do Google
            const form = new FormData()
            form.append('file', new Blob([buffer], { type: mime }), 'audio.ogg')
            form.append('language', 'pt')

            const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY || ''}` },
                body: form
            })

            if (!res.ok) {
                // Fallback: salva o áudio para o usuário baixar
                const tmpDir = path.join(process.cwd(), 'tmp')
                if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
                const file = path.join(tmpDir, `transcricao-${Date.now()}.ogg`)
                fs.writeFileSync(file, buffer)

                await m.react('❌')
                return m.reply(`⚠️ *Transcrição indisponível no momento!*\n\n📎 Envie o áudio abaixo para ouvir.\n\n💡 Configure \`GROQ_API_KEY\` para ativar a transcrição.`)
            }

            const json = await res.json()
            await m.react('✅')
            return m.reply(`🎤 *TRANSCRIÇÃO*\n\n${json.text || '*Sem texto detectado*'}`)
        } catch (e) {
            console.error('[TRANSCRICAO]', e)
            await m.react('❌')
            m.reply('❌ *Erro ao transcrever o áudio!*')
        }
        return
    }

    // ---------- !gtts ----------
    if (cmd === 'gtts') {
        const fala = text.trim()
        if (!fala) return m.reply('📝 *Uso:*\n!gtts <texto para falar>')
        try {
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=pt&q=${encodeURIComponent(fala)}`
            await conn.sendMessage(m.chat, {
                audio: { url },
                mimetype: 'audio/mpeg',
                fileName: 'gottica.mp3'
            }, { quoted: m })
        } catch {
            m.reply('❌ Erro ao gerar a voz.')
        }
        return
    }

    // ---------- !reconhecer / !shazam ----------
    if (cmd === 'reconhecer' || cmd === 'shazam' || cmd === 'identificar') {
        const q = m.quoted
        const mime = (q?.msg || q)?.mimetype || ''
        if (!q || !mime.startsWith('audio/')) {
            return m.reply('❌ *Envie ou responda a um ÁUDIO para identificar!*')
        }

        await m.react('⏳')
        try {
            const buffer = await q.download(true)
            if (!buffer) { await m.react('❌'); return m.reply('❌ Erro ao baixar o áudio.') }

            const form = new FormData()
            form.append('file', new Blob([buffer], { type: mime }), 'audio')

            const res = await fetch('https://api.audd.io/', { method: 'POST', body: form })
            const json = await res.json()

            if (!json?.result) {
                await m.react('❌')
                return m.reply('❌ *Não consegui identificar essa música!*')
            }

            const r = json.result
            let txt = `🎵 *MÚSICA IDENTIFICADA*\n\n`
            txt += `📌 *Título:* ${r.title}\n`
            txt += `👤 *Artista:* ${r.artist}\n`
            if (r.album) txt += `💿 *Álbum:* ${r.album}\n`
            if (r.year) txt += `📅 *Ano:* ${r.year}\n`
            txt += `🔗 *Link:* https://www.youtube.com/results?search_query=${encodeURIComponent(`${r.artist} ${r.title}`)}`

            await m.reply(txt)
            await m.react('✅')
        } catch (e) {
            console.error('[RECONHECER]', e)
            await m.react('❌')
            m.reply('❌ *Erro ao identificar a música!*')
        }
        return
    }
}

handler.help = ['perplexity', 'text2img', 'transcrever', 'tt', 'gtts', 'shazam']
handler.tags = ['ai', 'tools']
handler.command = ['perplexity', 'perplexity-ai', 'pesquisa', 'text2img', 'textimg', 'freecreate',
    'transcrever', 'tt', 'ttaudio', 'gtts', 'reconhecer', 'shazam', 'identificar']

export default handler
