/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @project Gotica Bot 💋⭐✨💫🌙🖤
 */

let handler = async (m, { conn, groupMetadata }) => {
  try {
    // Identificação do alvo (Marcação, Resposta ou o Próprio Remetente)
    let rawSender = m.mentionedJid && m.mentionedJid.length > 0 
      ? m.mentionedJid[0] 
      : (m.quoted ? m.quoted.sender : m.sender)

    if (!rawSender) {
      return m.reply('❌ Não foi possível identificar o usuário.')
    }

    // Busca participantes no grupo
    const participants = groupMetadata?.participants || []
    let realJid = rawSender.endsWith('@s.whatsapp.net') ? rawSender : ''

    let foundParticipant = participants.find(p => p.id === rawSender || p.lid === rawSender || p.jid === realJid)

    if (foundParticipant) {
      if (!realJid && foundParticipant.jid && foundParticipant.jid.endsWith('@s.whatsapp.net')) {
        realJid = foundParticipant.jid
      }
    }

    if (!realJid && rawSender.endsWith('@s.whatsapp.net')) {
      realJid = rawSender
    }

    const numTelefoneReal = realJid ? realJid.split('@')[0].replace(/\D/g, '') : rawSender.split('@')[0].replace(/\D/g, '')

    // Nome de exibição
    let nomeExibicao =
      (m.quoted && m.quoted.pushName) ||
      global.db?.data?.users?.[rawSender]?.name ||
      global.db?.data?.users?.[rawSender]?.pushName ||
      conn.contacts?.[rawSender]?.name ||
      (await conn.getName(rawSender).catch(() => null)) ||
      'Usuário'

    if (!nomeExibicao || nomeExibicao === 'undefined') {
      nomeExibicao = `@${numTelefoneReal}`
    }

    // Hierarquia
    let userRole = "Mortal Comum"
    if (foundParticipant && (foundParticipant.admin === 'admin' || foundParticipant.admin === 'superadmin')) {
      userRole = "👑 Administrador(a)"
    }

    // Cálculo das Estatísticas Fixas baseadas no ID (Seed para ser consistente)
    const seed = rawSender.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const calc = (mult) => Math.abs(Math.floor((Math.sin(seed * mult) * 50 + 50) % 101))

    const stats = {
      feiura: calc(1),
      prostituicao: calc(2),
      gado: calc(3),
      passiva: calc(4),
      safadeza: calc(5),
      inteligencia: Math.abs(Math.floor((Math.sin(seed * 6) * 10 + 10) % 21)), // Inteligência sempre baixa (0 a 20%)
      gay: calc(7)
    }

    // Valor no mercado
    const precoVal = (Math.abs(Math.sin(seed * 8)) * 150 + 5).toFixed(2).replace('.', ',')
    const valeAPena = stats.safadeza > 50 ? "Sim, na falta de opção." : "Nem de graça!"

    // Bio/Status
    let bio = 'Sem bio disponível'
    try {
      const statusData = await conn.fetchStatus(realJid || rawSender).catch(() => null)
      if (statusData && statusData.status) {
        bio = statusData.status
      }
    } catch {
      // Bio privada
    }

    // Foto de perfil
    let profilePic = 'https://i.ibb.co/3kWy96p/avatar.png'
    try {
      profilePic = await conn.profilePictureUrl(realJid || rawSender, 'image')
    } catch {
      // Imagem padrão
    }

    const mensagem = `
🕵️ *INFORMAÇÕES DE PERFIL* 🕵️
━━━━━━━━━━━━━━━━━━━━━━
👤 *Alvo:* ${nomeExibicao}
📱 *Número:* +${numTelefoneReal}
🎖️ *Cargo:* ${userRole}
📜 *Bio:* _${bio}_

✨ *ESTATÍSTICAS ATUAIS:*
🤢 *Feiúra:* ${stats.feiura}%
💃 *Prostituição:* ${stats.prostituicao}%
🐮 *Gado:* ${stats.gado}%
🎱 *Passiva:* ${stats.passiva}%
🍑 *Safadeza:* ${stats.safadeza}%
🧠 *Inteligência:* ${stats.inteligencia}% (Baixa)
🏳️‍🌈 *Chance de ser Gay:* ${stats.gay}%

💰 *VALOR NO MERCADO:*
🔞 *Programa:* R$ ${precoVal}
🦴 *Vale a pena?* ${valeAPena}

━━━━━━━━━━━━━━━━━━━━━━
_Obs: Informações tiradas da minha bola de cristal levemente suja._ 💅
✨ *Gotica Bot*
`.trim()

    await conn.sendMessage(m.chat, {
      image: { url: profilePic },
      caption: mensagem,
      mentions: [rawSender]
    }, { quoted: m })

  } catch (error) {
    console.error('Erro ao processar comando perfil:', error)
    await m.reply('❌ Ocorreu um erro ao gerar o dossiê do perfil.')
  }
}

handler.help = ['perfil']
handler.tags = ['main', 'tools']
handler.command = /^(perfil|profile)$/i
handler.group = true

export default handler