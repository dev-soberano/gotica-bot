/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, args }) => {
    try {
        let group = m.chat
        // Gera o código de convite do grupo
        let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)
        
        let mensagem = `*🦇 ─ ☾ CONVITE DAS SOMBRAS ☽ ─ 🦇*\n\n*Aqui está o link do nosso Grupo:*\n${link}`
        
        // Envia o link com detecção ativada
        await conn.reply(m.chat, mensagem, m, { detectLink: true })
        
    } catch (e) {
        m.reply('*🦇 Erro:* Não consegui obter o link. Verifique se eu sou Administradora deste grupo.')
    }
}

handler.help = ['link']
handler.tags = ['grupo']
handler.command = ['link', 'linkgp', 'convite'] // Handlers em português
handler.group = true
handler.botAdmin = true
handler.register = false // Sem trava de registro

export default handler