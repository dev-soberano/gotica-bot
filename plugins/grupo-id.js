let handler = async (m, { conn }) => {
  const chatJid = m.chat

  const textoResposta = `
*ID DO CHAT OBTIDO*
━━━━━━━━━━━━━━━━━━━━━━━

🆔 *ID:* \`${chatJid}\`

Aqui está o ID do grupo, mestre! Fique à vontade para usar onde precisar.

━━━━━━━━━━━━━━━━━━━━━━━
✨ *Gotica bot*
`.trim()

  await conn.sendMessage(m.chat, { text: textoResposta }, { quoted: m })
}

handler.help = ['id', 'groupid']
handler.tags = ['group', 'tools']
handler.command = /^(id|groupid|chatid|idgp)$/i

export default handler