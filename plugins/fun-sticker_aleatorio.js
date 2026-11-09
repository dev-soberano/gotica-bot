/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fs from 'fs'
import path from 'path'
import { addExif } from '../lib/sticker.js' // Importa a função que renomeia de verdade

let handler = async (m, { conn }) => {
    try {
        const dir = path.join(process.cwd(), 'figu')

        if (!fs.existsSync(dir)) {
            return m.reply('*Soberano, a pasta "figu" não existe.* ❌')
        }

        const files = fs.readdirSync(dir).filter(file => file.endsWith('.webp'))

        if (files.length === 0) {
            return m.reply('*A pasta "figu" está vazia!* 📂')
        }

        const randomSticker = files[Math.floor(Math.random() * files.length)]
        const stickerPath = path.join(dir, randomSticker)
        
        await m.react('✨')

        // Lê o arquivo da pasta
        let img = fs.readFileSync(stickerPath)
        let stiker = false
        
        try {
            // Tenta injetar o nome do Pack e Autor no arquivo lido
            stiker = await addExif(img, 'Gótica Bot 💋', 'Dev Soberano')
        } catch (e) {
            console.error('Erro ao adicionar Exif:', e)
        }

        // Envia o resultado (se falhar o Exif, envia o original)
        await conn.sendMessage(m.chat, { sticker: stiker ? stiker : img }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('*Erro ao processar a figurinha, Soberano.*')
    }
}

handler.help = ['faleatorio']
handler.tags = ['diversão']
handler.command = ['faleatorio', 'figurinha', 'stk', 'fig']
handler.group = true

export default handler