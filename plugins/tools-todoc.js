/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let cooldowns = {}
const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

    // REGRA SOBERANA: Leandro sem cooldown
    if (!eDono) {
        const tempoEspera = 10 * 1000 
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) return
        cooldowns[m.sender] = Date.now()
    }

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!m.quoted) return m.reply(`*📄 Marque a Imagem, Vídeo ou Áudio que deseja converter em documento.*`)
    if (!text) return m.reply(`*📄 Por favor, digite o nome que deseja dar ao arquivo.*\n\n*Exemplo:* ${usedPrefix + command} MeuArquivo`)
    
    if (!/audio|video|image/.test(mime)) return m.reply(`*❌ Erro:* Formato não suportado. Marque uma Imagem, Áudio ou Vídeo.`)

    await m.react('⏳')

    try {
        let media = await q.download?.()
        if (!media) return m.react('✖️')

        let type = ''
        let extension = ''

        if (/video/.test(mime)) {
            type = 'video/mp4'
            extension = 'mp4'
        } else if (/audio/.test(mime)) {
            type = 'audio/mpeg'
            extension = 'mp3'
        } else if (/image/.test(mime)) {
            // Se o comando for 'topdf', ele salva como pdf, senão como png
            if (command === 'topdf') {
                type = 'application/pdf'
                extension = 'pdf'
            } else {
                type = 'image/png'
                extension = 'png'
            }
        }

        await conn.sendMessage(m.chat, { 
            document: media, 
            mimetype: type, 
            fileName: `${text}.${extension}`
        }, { quoted: m })
        
        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('*❌ Ocorreu um erro ao processar o documento.*')
    }
}

handler.help = ['todoc <nome>', 'topdf <nome>']
handler.tags = ['tools']
handler.command = ['todoc', 'todocument', 'documento', 'topdf']
handler.register = false 

export default handler