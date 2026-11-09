/*
* ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
* ║ ╦ ║ ║  ║  ║ ║    ╠═╣      ╠╩╗ ║ ║  ║ 
* ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
* @author Dev Leandro
* @project Gótica Bot 💋⭐✨💫🌙🖤
*/

import axios from 'axios'
import uploadImage from '../lib/uploadImage.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    // 1. Verifica se é imagem
    if (!/image/.test(mime)) return m.reply(`❓ *Responda a uma imagem com o comando ${usedPrefix + command} para colocar as grades!*`)

    await m.reply('⛓️ *Aguarde... a justiça está sendo feita!*')

    try {
        // 2. Baixa a imagem do WhatsApp
        let img = await q.download()
        
        // 3. Faz o upload usando a sua lib interna (Gera link compatível)
        let link = await uploadImage(img)

        // 4. Configurações da API SpiderX
        const apiKey = '3edfB5m8XuOFVPijpgGE'
        const apiUrl = `https://api.spiderx.com.br/api/canvas/jail?image_url=${encodeURIComponent(link)}&api_key=${apiKey}`

        // 5. Envia o resultado final puxando direto da URL da SpiderX
        await conn.sendMessage(m.chat, { 
            image: { url: apiUrl }, 
            caption: `⚖️ *SENTENÇA PROFERIDA!*\n\nO meliante foi devidamente encarcerado! ⛓️\n\n*Status:* Preso por tempo indeterminado.`
        }, { quoted: m })

    } catch (e) {
        console.error('ERRO CADEIA:', e)
        m.reply('❌ *Ocorreu um erro ao processar. Tente novamente ou use outra imagem.*')
    }
}

handler.help = ['cadeia']
handler.tags = ['edits']
handler.command = /^(cadeia|preso|jail)$/i

export default handler