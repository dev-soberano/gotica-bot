/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║  
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩  
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { setGp } from '../handler.js'

let handler = async (m, { conn, usedPrefix }) => {
    if (!m.isGroup) return m.reply("Isso só pode ser usado em grupo 💔")

    const cleanFrom = m.chat.split('@')[0] + '@g.us'
    const filePath = join(process.cwd(), 'src', 'database', 'grupos', `${cleanFrom}.json`)

    let dataGp = [{ bemvindo: false }]
    if (existsSync(filePath)) {
        try {
            dataGp = JSON.parse(readFileSync(filePath, 'utf-8'))
            if (!Array.isArray(dataGp) || dataGp.length === 0) {
                dataGp = [{ bemvindo: false }]
            }
        } catch (e) {
            dataGp = [{ bemvindo: false }]
        }
    }

    dataGp[0].bemvindo = !dataGp[0].bemvindo
    setGp(m.chat, dataGp)

    if (dataGp[0].bemvindo) {
        await m.reply(`✅ *Boas-vindas ativadas!* Agora, novos membros serão recebidos com uma mensagem personalizada.`)
    } else {
        await m.reply('⚠️ *Boas-vindas desativadas!* O grupo não enviará mais mensagens para novos membros.')
    }
}

handler.help = ['bemvindo', 'bv', 'boasvindas', 'welcome']
handler.tags = ['group']
handler.command = ['bemvindo', 'bv', 'boasvindas', 'welcome']
handler.group = true
handler.admin = true

export default handler