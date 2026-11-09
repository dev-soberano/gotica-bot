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

let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply("Isso só pode ser usado em grupo 💔")

    const cleanFrom = m.chat.split('@')[0] + '@g.us'
    const filePath = join(process.cwd(), 'src', 'database', 'grupos', `${cleanFrom}.json`)

    let dataGp = [{ exit: { enabled: false } }]
    if (existsSync(filePath)) {
        try {
            dataGp = JSON.parse(readFileSync(filePath, 'utf-8'))
            if (!Array.isArray(dataGp) || dataGp.length === 0) {
                dataGp = [{ exit: { enabled: false } }]
            }
        } catch (e) {
            dataGp = [{ exit: { enabled: false } }]
        }
    }

    if (!dataGp[0].exit) {
        dataGp[0].exit = { enabled: false }
    }

    dataGp[0].exit.enabled = !dataGp[0].exit.enabled
    setGp(m.chat, dataGp)

    if (dataGp[0].exit.enabled) {
        await m.reply('✅ *Mensagens de saída ativadas!* O grupo avisará quando alguém sair.')
    } else {
        await m.reply('❌ *Mensagens de saída desativadas!*')
    }
}

handler.help = ['saida', 'exit']
handler.tags = ['group']
handler.command = ['saida', 'exit']
handler.group = true
handler.admin = true

export default handler