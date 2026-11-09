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

let handler = async (m, { conn, usedPrefix, command }) => {
    const nomeUsuario = m.pushName || 'Explorador'
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

    // REGRA SOBERANA: Sem tempo para o Leandro, 1 minuto para os outros
    if (!eDono) {
        const tempoEspera = 60 * 1000
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) {
            let restante = Math.ceil((cooldowns[m.sender] + tempoEspera - Date.now()) / 1000)
            return m.reply(`*⚠️ AGUARDE:* Olá ${nomeUsuario}, aguarde ${restante}s para usar este comando novamente.`)
        }
        cooldowns[m.sender] = Date.now()
    }

    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let name = await conn.getName(who)
    let pp

    try {
        pp = await conn.profilePictureUrl(who, 'image')
    } catch (e) {
        pp = 'https://files.catbox.moe/xr2m6u.jpg' // Foto padrão caso o usuário não tenha ou seja privada
    }

    await conn.sendFile(m.chat, pp, 'profile.jpg', `*👤 Foto de perfil de:* ${name}`, m)
}

handler.help = ['pfp']
handler.tags = ['ferramentas']
handler.command = ['pfp', 'getpic', 'getpp', 'foto']
handler.group = true

export default handler