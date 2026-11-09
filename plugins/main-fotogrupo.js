/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    if (/image/.test(mime)) {
        let img = await q.download()
        if (!img) return m.reply('*🦇 Erro:* Você esqueceu de marcar ou enviar a imagem para o perfil do grupo.')

        try {
            // Atualiza a foto do perfil do grupo
            await conn.updateProfilePicture(m.chat, img)
            
            // Resposta de sucesso com o estilo Gótica
            await conn.sendMessage(m.chat, { 
                text: '*✅ Perfil atualizado!* A nova face do grupo foi estabelecida com sucesso.' 
            }, { quoted: m })
            
            await m.react('🖼️')
        } catch (e) {
            m.reply(`*🦇 Erro:* Ocorreu um problema ao mudar a imagem: ${e.message}`)
        }
    } else {
        return m.reply(`*🦇 Erro:* Responda a uma imagem ou envie uma foto com o comando *${usedPrefix + command}* para mudar o perfil do grupo.`)
    }
}

handler.help = ['fotogrupo']
handler.tags = ['admin']
handler.command = ['fotogrupo', 'fotogp', 'perfilgrupo'] // Traduzido para português
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.register = false 

export default handler