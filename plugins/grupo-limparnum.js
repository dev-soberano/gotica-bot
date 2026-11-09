/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

const handler = async (m, { conn, args, command }) => {
  const input = args[0]
  if (!input) {
    return m.reply(`*🦇 Erro:* Você deve especificar um DDD ou Prefixo válido.\nExemplo: *.${command} 16* ou *.${command} +5516*`)
  }

  // Limpa caracteres especiais mantendo apenas números
  const cleanInput = input.replace(/[^0-9]/g, '')
  if (!cleanInput) {
    return m.reply(`*🦇 Erro:* DDD/Prefixo inválido.\nExemplo: *.${command} 16* ou *.${command} 5516*`)
  }

  // Se o usuário passou apenas 2 dígitos (ex: "16"), assume Brasil e adiciona 55 na frente
  let targetPrefixes = []
  if (cleanInput.length === 2) {
    targetPrefixes.push(`55${cleanInput}`)
  } else if (cleanInput.startsWith('55') && cleanInput.length === 4) {
    targetPrefixes.push(cleanInput) // Ex: 5516
  } else {
    targetPrefixes.push(cleanInput) // Qualquer DDI/Prefixo customizado (ex: 63975)
  }

  // Obter metadados do grupo e participantes
  const groupMetadata = await conn.groupMetadata(m.chat).catch(() => ({}))
  const groupParticipants = groupMetadata.participants || []

  // Identifica o ID do bot para ignorá-lo na lista
  const botJid = conn.user.jid || conn.user.id || ''
  const botNumber = botJid.split(':')[0].split('@')[0].replace(/[^0-9]/g, '')

  const admins = groupParticipants.filter(p => p.admin).map(p => p.id)

  // Filtra participantes que coincidem com os prefixos calculados
  // O número de telefone real fica em p.jid, não em p.id (que é sempre LID)
  const matchingParticipants = groupParticipants.filter(p => {
    const realNumberJid = p.jid || p.id
    const userNum = realNumberJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
    if (!userNum || userNum === botNumber) return false

    return targetPrefixes.some(prefix => userNum.startsWith(prefix))
  })

  if (matchingParticipants.length === 0) {
    return m.reply(`*🦇 Erro:* Não encontrei nenhum participante com o DDD/Prefixo *${input}* neste grupo.`)
  }

  // Busca o nome de cada participante (banco/cache é indexado pelo LID, então usa p.id)
  const listaItens = await Promise.all(matchingParticipants.map(async (p, i) => {
    const isUserAdmin = admins.includes(p.id)
    const realNumberJid = p.jid || p.id
    const cleanNum = realNumberJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '')

    let nome =
      global.db?.data?.users?.[p.id]?.name ||
      global.db?.data?.users?.[p.id]?.pushName ||
      conn.contacts?.[p.id]?.name ||
      (await conn.getName(p.id)) ||
      `+${cleanNum}`

    if (!nome || nome === 'undefined') nome = `+${cleanNum}`

    return `${i + 1}. *${nome}* — +${cleanNum}${isUserAdmin ? ' *[ADM]*' : ''}`
  }))

  const lista = listaItens.join('\n')

  return m.reply(`🔎 *Lista de participantes com o DDD/Prefixo ${input}:*\n\n${lista}`)
}

handler.help = ['listaddd <ddd>']
handler.tags = ['admin']
handler.command = ['listaddd', 'ddd']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.register = false

export default handler