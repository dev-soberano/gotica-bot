/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import axios from 'axios'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

let cooldowns = {}
const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const nomeUser = m.pushName || 'Explorador'
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

    // REGRA SOBERANA: Leandro sem cooldown
    if (!eDono) {
        const tempoEspera = 60 * 1000 
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) {
            let restante = Math.ceil((cooldowns[m.sender] + tempoEspera - Date.now()) / 1000)
            return m.reply(`*⚠️ AGUARDE:* Olá ${nomeUser}, aguarde ${restante}s para comprimir outra imagem.`)
        }
        cooldowns[m.sender] = Date.now()
    }

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!/image/.test(mime)) return m.reply(`*❌ ERRO:* Você precisa responder a uma *Imagem* com o comando *${usedPrefix + command}*`)

    await m.react('⏳')

    try {
        let imgBuffer = await q.download()
        let { ext, mime: type } = await fileTypeFromBuffer(imgBuffer)
        
        // Usando a API da TinyPNG/TinyJPG via Proxy estável
        const formData = new FormData()
        const blob = new Blob([imgBuffer], { type })
        formData.append('file', blob, `image.${ext}`)

        // API Alternativa de compressão direta
        const res = await axios.post('https://api.tools.com/compress-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: 'arraybuffer'
        }).catch(async () => {
            // Backup: Se a primeira falhar, usa a do Tinyify/API externa
            return await axios.get(`https://api.screenshotlapi.com/compress?url=${encodeURIComponent(text)}`, {
                responseType: 'arraybuffer'
            })
        })

        if (!res.data) throw new Error('A API não retornou dados.')

        await conn.sendMessage(m.chat, {
            image: res.data,
            caption: `🎯 *Imagem Comprimida com Sucesso!*\n✨ *Tamanho reduzido sem perder a alma da foto.*\n\n> *Feito por:* Gotica Bot`
        }, { quoted: m })

        await m.react('✅')

    } catch (err) {
        console.error(err)
        // Se todas as APIs falharem, avisamos o Soberano
        await m.react('❌')
        await m.reply(`*❌ ERRO:* As APIs de compressão estão instáveis no momento. Tente novamente em alguns segundos ou use outra imagem.`)
    }
}

handler.help = ['comprimir']
handler.tags = ['ferramentas']
handler.command = ['compress', 'comprimir', 'otimizar']
handler.register = false 

export default handler