/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║  
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩  
 * @author ༄ Đev Šoberano ×͜×
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { setGp } from '../handler.js'

let handler = async (m, { text, conn }) => {
    if (!m.isGroup) return

    const cleanFrom = m.chat.split('@')[0] + '@g.us'
    const filePath = join(process.cwd(), 'src', 'database', 'grupos', `${cleanFrom}.json`)

    let dataGp = [{ ausentes: [] }]
    if (existsSync(filePath)) {
        try {
            dataGp = JSON.parse(readFileSync(filePath, 'utf-8'))
            if (!Array.isArray(dataGp) || dataGp.length === 0) {
                dataGp = [{ ausentes: [] }]
            }
        } catch (e) {
            dataGp = [{ ausentes: [] }]
        }
    }

    if (!dataGp[0].ausentes) {
        dataGp[0].ausentes = []
    }

    const motivo = text ? text.trim() : 'Sem motivo especificado'
    const horaAtual = Date.now()

    const ja_afk = dataGp[0].ausentes.find(x => x.id === m.sender)
    if (ja_afk) {
        ja_afk.msg = motivo
        ja_afk.hora = horaAtual
    } else {
        dataGp[0].ausentes.push({ id: m.sender, msg: motivo, hora: horaAtual })
    }

    setGp(m.chat, dataGp)

    let msgAfk = `*┎┶┅┅┅━═⋅═━━━━═⋅═━┅┅┅┅☾⋆*\n`
    msgAfk += `*💤 MODO AFK ATIVADO*\n`
    msgAfk += `*─━━━━┉❈⏤͟͟͞͞★꙲⃝͟💤❈┉━━━━─*\n`
    msgAfk += `*┇┆👤 Usuário:* @${m.sender.split('@')[0]}\n`
    msgAfk += `*┇┆📝 Motivo:* ${motivo}\n`
    msgAfk += `*┇├┉━┅━┅━┅━┅━┅━┅━⋅≎⋆ᐧ*\n\n`
    msgAfk += `_Eu vou avisar neste grupo quando alguém citar você enquanto estiver fora!_ 💋`

    await conn.sendMessage(m.chat, { text: msgAfk, mentions: [m.sender] }, { quoted: m })
}

handler.help = ['afk', 'ausente', 'off']
handler.tags = ['diversão']
handler.command = ['afk', 'ausente', 'off']
handler.group = true

export default handler