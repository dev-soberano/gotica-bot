/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║    ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot 💋⭐✨💫🌙🖤
 */

import { webp2mp4 } from '../lib/webp2mp4.js'

let cooldowns = {}
const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'

let handler = async (m, { conn, usedPrefix, command }) => {
    const nome = m.pushName || 'Explorador'
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

    // 🛡️ REGRA SOBERANA: Soberano testa sem cooldown
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
    
    if (!/webp/.test(mime)) return m.reply(`*Responda a uma figurinha ANIMADA para converter em GIF!* \n\n> Exemplo: Responda ao sticker com *${usedPrefix + command}*`)

    await m.react('⏳')
    
    try {
        const media = await q.download()
        // Usamos webp2mp4 para converter a animação
        let out = await webp2mp4(media).catch(_ => null)
        
        if (!out) {
            await m.react('❌')
            return m.reply('*❌ ERRO:* Não foi possível converter. Verifique se a figurinha é realmente animada.')
        }

        // Enviando como vídeo com a flag gifPlayback ativada
        await conn.sendFile(m.chat, out, 'video.mp4', '*✨ Aqui está seu GIF!*', m, 0, { gifPlayback: true })
        await m.react('✅')
        
    } catch (e) {
        console.error(e)
        m.reply('*❌ ERRO:* Ocorreu uma falha técnica na conversão para GIF.')
    }
}

// Para que serve: Converte figurinhas animadas em vídeos curtos (GIF).
// Como usar: Responda a uma figurinha animada com .togif
// Público: Membros (com cooldown) e Soberano (sem cooldown).

handler.help = ['togif']
handler.tags = ['sticker']
handler.command = ['togif', 'gif', 'paragif']
handler.group = true

export default handler