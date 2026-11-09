/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    // Se não houver mensagem citada, avisa o usuário
    if (!m.quoted) return conn.reply(m.chat, `✨ *por favor, responda à mensagem que deseja apagar!* 💋`, m)

    try {
        // Tenta deletar usando os dados contextuais da mensagem citada
        let delet = m.message.extendedTextMessage.contextInfo.participant
        let bang = m.message.extendedTextMessage.contextInfo.stanzaId
        return conn.sendMessage(m.chat, { 
            delete: { 
                remoteJid: m.chat, 
                fromMe: false, 
                id: bang, 
                participant: delet 
            }
        })
    } catch {
        // Caso o método acima falhe, usa o método alternativo de chave de mensagem
        return conn.sendMessage(m.chat, { delete: m.quoted.vM.key })
    }
}

handler.help = ['del']
handler.tags = ['admin']
handler.command = ['d', 'delete']
handler.group = true
handler.admin = true // Apenas ADMs podem apagar mensagens de outros
handler.botAdmin = true // O bot precisa ser ADM para apagar mensagens alheias

export default handler