/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

const handler = async (m, { conn, text, usedPrefix, command }) => {
  let quem
  if (m.isGroup) {
    quem = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
  } else {
    quem = m.chat
  }

  if (!quem) return m.reply('*⚠️ Soberano, mencione ou responda a quem você deseja retirar os privilégios Premium.*')

  const usuario = global.db.data.users[quem]

  if (!usuario) return m.reply('*❌ Este usuário ainda não consta na minha base de dados.*')
  if (!usuario.premium) return m.reply('*👑 O usuário já não possui status Premium.*')

  // Remove os benefícios
  usuario.premiumTime = 0
  usuario.premium = false

  const texto = `*👑 PRIVILÉGIOS REVOGADOS*\n\n> O usuário @${quem.split`@`[0]} não é mais um membro Premium. As sombras se fecharam para ele.`
  
  await conn.reply(m.chat, texto, m, { mentions: [quem] })
  await m.react('⚖️')
}

handler.help = ['delprem <@tag>']
handler.tags = ['owner']
handler.command = ['removepremium', 'delpremium', 'tirarpremium']
handler.group = true
handler.rowner = true

export default handler