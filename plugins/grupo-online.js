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
    let id = args?.[0]?.match(/\d+\-\d+@g.us/) || m.chat

    // Filtra os participantes que enviaram mensagens recentemente no cache
    const participantesUnicos = Object.values(conn.chats[id]?.messages || {})
      .map((item) => item.key.participant)
      .filter((value, index, self) => value && self.indexOf(value) === index)

    const listaOnline =
      participantesUnicos
        .map((k) => `> @${k.split("@")[0]}`)
        .join("\n") || "*🙄 Não há sinais de vida no chat neste momento.*"

    const mensagem = `*👁️ ─ ☾ USUÁRIOS ATIVOS ☽ ─ 👁️*\n\n${listaOnline}\n\n*🌑 Estes são os que estão Online no grupo agora.*`

    await conn.sendMessage(m.chat, {
      text: mensagem,
      mentions: participantesUnicos,
    })

    await m.react("👁️")
  } catch (error) {
    console.error(error)
    await m.reply('*🦇 Erro:* Houve um problema ao tentar invocar a lista de ativos.')
  }
}

handler.help = ["online"]
handler.tags = ["grupo"]
handler.command = ["onlines", "ativos", "listaronline", "vivos"] // Handlers em português
handler.group = true
handler.register = false // Sem trava de registro

export default handler