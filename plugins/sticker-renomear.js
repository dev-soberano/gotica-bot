/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { addExif } from '../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Verifica se há uma figurinha marcada
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!/webp/.test(mime)) {
        return m.reply(`✨ *COMO RENOMEAR* ✨\n\nResponda a uma figurinha com:\n*${usedPrefix + command} Pacote . Autor*`)
    }

    // Divide o texto para pegar Pack e Autor
    let [packname, ...author] = text.split(/[.|•|]/).map(v => v.trim())
    
    // Se não escrever nada, usa o padrão do Soberano
    if (!packname) packname = 'Gótica Bot 💋'
    if (!author || author.length === 0) author = 'Leandro'
    else author = author.join(' ')

    await m.react('🪄')

    try {
        let img = await q.download()
        if (!img) return m.reply('*Erro ao baixar a figurinha, Soberano.*')

        // A mágica: troca o nome usando a função da sua lib/sticker.js
        let stiker = await addExif(img, packname, author)
        
        await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
    } catch (e) {
        console.error(e)
        m.reply('*Houve um erro ao renomear esta figurinha.*')
    }
}

handler.help = ['renomear']
handler.tags = ['ferramentas']
handler.command = ['renomear', 'rn']
handler.group = true

export default handler