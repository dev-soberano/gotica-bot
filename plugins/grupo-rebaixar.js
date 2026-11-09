/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, usedPrefix, command }) => {

  if (!m.mentionedJid[0] && !m.quoted) return m.reply(`*✳️ Mencione um usuário. Exemplo :*\n\n*${usedPrefix + command}* @tag 💋`)
  
  let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
  
  if (conn.user.jid.includes(user)) return m.reply(`*✳️ Eu não posso me rebaixar.* 💋`)

  await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
  m.reply(`*✅ Usuário rebaixado de administrador com sucesso* 💋`)

}

handler.help = ['rebaixar @user']
handler.tags = ['grupo']
handler.command = ['demote', 'degradar', 'rebaixar', 'tiraradm']
handler.admin = true
handler.group = true
handler.botAdmin = true
handler.register = false

export default handler