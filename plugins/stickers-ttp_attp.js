/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { sticker } from '../lib/sticker.js'

let cooldowns = {}
const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'
const SPIDER_API_KEY = 'txsOVBIevZekrQ6MC2bV' // Sua chave paga

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const nomeUser = m.pushName || 'Explorador'
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

    // REGRA SOBERANA: Leandro sem tempo de espera, outros 1 minuto
    if (!eDono) {
        const tempoEspera = 60 * 1000
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) {
            let restante = Math.ceil((cooldowns[m.sender] + tempoEspera - Date.now()) / 1000)
            return m.reply(`*⚠️ AGUARDE:* Olá ${nomeUser}, aguarde ${restante}s para usar o ${command} novamente.`)
        }
        cooldowns[m.sender] = Date.now()
    }

    if (!text) return m.reply(`*Por favor, digite um texto!*\n\n> Exemplo: *${usedPrefix + command} Leandro memes*`)

    await m.react('⏳')

    try {
        let packname = global.packsticker || 'Gotica Bot'
        let author = 'dev Leandro'
        
        // Agora ambos usam a SpiderX paga para evitar erros de 0KB
        let url = `https://api.spiderx.com.br/api/stickers/${command}?text=${encodeURIComponent(text)}&api_key=${SPIDER_API_KEY}`
        
        let stiker = await sticker(null, url, packname, author)
        
        if (stiker && stiker.length > 100) {
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
            await m.react('✅')
        } else {
            throw new Error('Falha no processamento do sticker')
        }
    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply(`*❌ ERRO:* Não foi possível gerar o sticker com a SpiderX. \n\n> Verifique se o comando *${command}* está ativo no seu plano ou se a chave está correta.`)
    }
}

handler.help = ['ttp', 'attp']
handler.tags = ['sticker']
handler.command = ['ttp', 'attp']
handler.group = true

export default handler