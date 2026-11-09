/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗     ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣     ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩     ╚═╝ ╚═╝  ╩ 
 * @project Gotica Bot 💋⭐✨💫🌙🖤
 */

let handler = async (m, { conn, groupMetadata }) => {
  // Pega o sender base
  let rawSender = m.quoted ? m.quoted.sender : m.sender
  if (!rawSender) {
    return m.reply('❌ Não foi possível identificar o usuário.')
  }

  let realJid = ''
  let realLid = ''

  // Se o sender original já for JID tradicional (@s.whatsapp.net)
  if (rawSender.endsWith('@s.whatsapp.net')) {
    realJid = rawSender
  }

  // 1. Tenta mapear LID -> JID usando o repositório de sinal/chaves do Baileys
  if (!realJid && conn.signalRepository?.jidForLid) {
    try {
      realJid = await conn.signalRepository.jidForLid(rawSender)
    } catch (e) {
      // Falha silenciosa no repositório
    }
  }

  // 2. Tenta mapear nos participantes do grupo (comparando LID e ID)
  const participants = groupMetadata?.participants || []

  let foundParticipant = participants.find(p => p.id === rawSender || p.lid === rawSender || p.jid === realJid)

  if (foundParticipant) {
    // O número real fica no campo .jid do participante (não em .id, que é sempre LID nessa versão)
    if (!realJid && foundParticipant.jid && foundParticipant.jid.endsWith('@s.whatsapp.net')) {
      realJid = foundParticipant.jid
    }
    if (foundParticipant.lid) {
      realLid = foundParticipant.lid
    }
  }

  // Se a mensagem for LID e o realLid ainda estiver vazio, define o rawSender nele
  if (rawSender.endsWith('@lid') && !realLid) {
    realLid = rawSender
  }

  // 3. Caso o JID ainda seja LID e não foi mapeado (WhatsApp oculta o número por privacidade)
  let numTelefoneReal = 'Oculto pelo WhatsApp'
  if (realJid && realJid.endsWith('@s.whatsapp.net')) {
    numTelefoneReal = realJid.split('@')[0].replace(/\D/g, '')
  } else {
    realJid = 'Não identificado (Modo Privado)'
  }

  // Nome do usuário — o banco de dados guarda tudo pela chave do LID cru (rawSender),
  // então a busca precisa priorizar ele, igual o comando !beijar já faz.
  let nomeExibicao =
    (m.quoted && m.quoted.pushName) ||
    global.db?.data?.users?.[rawSender]?.name ||
    global.db?.data?.users?.[rawSender]?.pushName ||
    conn.contacts?.[rawSender]?.name ||
    (await conn.getName(rawSender)) ||
    'Usuário'

  // Se ainda ficou undefined/vazio por algum motivo, cai no fallback do número
  if (!nomeExibicao || nomeExibicao === 'undefined') {
    nomeExibicao = `@${rawSender.split('@')[0]}`
  }

  // Hierarquia no grupo (Admin vs Membro)
  let statusUser = '👤 Membro Comum'
  if (foundParticipant && (foundParticipant.admin === 'admin' || foundParticipant.admin === 'superadmin')) {
    statusUser = '🛡️ Administrador'
  }

  // Foto de perfil
  let pp
  try {
    pp = await conn.profilePictureUrl(realJid !== 'Não identificado (Modo Privado)' ? realJid : rawSender, 'image')
  } catch {
    pp = 'https://i.ibb.co/3kWy96p/avatar.png'
  }

  const textoResposta = `
*DADOS DE IDENTIFICAÇÃO*
━━━━━━━━━━━━━━━━━━━━━━
👤 *Nome:* ${nomeExibicao}
📱 *Número:* ${numTelefoneReal !== 'Oculto pelo WhatsApp' ? '+' + numTelefoneReal : numTelefoneReal}
🛡️ *Hierarquia:* ${statusUser}
🆔 *JID:* \`${realJid}\`
🔑 *LID:* \`${realLid}\`
Aqui estão os dados de identificação do WhatsApp.
━━━━━━━━━━━━━━━━━━━━━━
✨ *Gotica bot*
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: textoResposta
  }, { quoted: m })
}

handler.help = ['me', 'jid', 'lid']
handler.tags = ['tools', 'main']
handler.command = /^(me|jid|lid)$/i
handler.group = true

export default handler