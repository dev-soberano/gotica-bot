/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { webp2png } from '../lib/webp2mp4.js'

let cooldowns = {}
const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'

let handler = async (m, { conn, usedPrefix, command }) => {
    const nome = m.pushName || 'Explorador'
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

    // REGRA SOBERANA: Leandro testa sem cooldown
    if (!eDono) {
        const tempoEspera = 60 * 1000
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) {
            let restante = Math.ceil((cooldowns[m.sender] + tempoEspera - Date.now()) / 1000)
            return m.reply(`*⚠️ AGUARDE:* Olá ${nome}, aguarde ${restante}s para converter outra figurinha.`)
        }
        cooldowns[m.sender] = Date.now()
    }

    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''
    
    if (!/webp/.test(mime)) return m.reply(`*Responda a uma figurinha para converter em imagem!* \n\n> Exemplo: Responda a um sticker com *${usedPrefix + command}*`)

    await m.react('⏳')
    
    try {
        const media = await q.download()
        let out = await webp2png(media).catch(_ => null)
        
        if (!out) {
            await m.react('❌')
            return m.reply('*❌ ERRO:* Não foi possível converter esta figurinha. Verifique se ela não é animada demais.')
        }

        await conn.sendFile(m.chat, out, 'imagem.png', '*✨ Aqui está sua imagem!*', m)
        await m.react('✅')
        
    } catch (e) {
        console.error(e)
        m.reply('*❌ ERRO:* Ocorreu uma falha na conversão.')
    }
}

handler.help = ['toimg']
handler.tags = ['sticker']
handler.command = ['toimg', 'img', 'jpg', 'parafoto']
handler.group = true

export default handler