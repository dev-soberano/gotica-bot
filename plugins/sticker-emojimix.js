/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

let cooldowns = {}
const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    const nome = m.pushName || 'Explorador'
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

    // REGRA SOBERANA: Sem tempo para o Leandro, 1 minuto para os outros
    if (!eDono) {
        const tempoEspera = 60 * 1000
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) {
            let restante = Math.ceil((cooldowns[m.sender] + tempoEspera - Date.now()) / 1000)
            return m.reply(`*⚠️ AGUARDE:* Olá ${nome}, aguarde ${restante}s para criar outro mix.`)
        }
        cooldowns[m.sender] = Date.now()
    }

    if (!args[0] || !text.includes('+')) {
        return m.reply(`*Combine dois emojis para criar um sticker!*\n\n> Exemplo: *${usedPrefix + command}* 😎+🤑`)
    }

    try {
        let [emoji, emoji2] = text.split('+').map(e => e.trim())
        let url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji)}_${encodeURIComponent(emoji2)}`
        
        let res = await fetch(url)
        let json = await res.json()

        if (!json.results || json.results.length === 0) {
            return m.reply('*❌ Erro:* Não encontrei uma combinação para esses emojis. Tente outros!')
        }

        let stickerUrl = json.results[0].media_formats.png_transparent.url
        let packname = global.packsticker || 'Gotica Bot'
        let author = 'Dev Soberano'

        let stiker = await sticker(false, stickerUrl, packname, author)
        
        if (stiker) {
            return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
        } else {
            throw new Error()
        }

    } catch (e) {
        return m.reply('*❌ OCORREU UM ERRO:* Verifique se você usou emojis válidos e tente novamente.')
    }
}

handler.help = ['emojimix']
handler.tags = ['sticker']
handler.command = ['emojimix', 'mix', 'emix']
handler.group = true

export default handler