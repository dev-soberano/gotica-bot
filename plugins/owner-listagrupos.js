/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn }) => {
  await m.reply('*⏳ Sincronizando permissões reais com o WhatsApp...*')
  
  let txt = `*🏰 LISTA DE GRUPOS DO SOBERANO*\n\n`
  
  try {
    const getGroups = await conn.groupFetchAllParticipating()
    const groups = Object.values(getGroups)
    txt += `*—◉ Total de grupos ativos:* ${groups.length}\n\n`

    for (let i = 0; i < groups.length; i++) {
      const g = groups[i]
      let isAdmin = false
      let link = '--- (Não é Admin) ---'

      // Tentativa 1: Verificar pelos metadados
      try {
        const groupMetadata = await conn.groupMetadata(g.id)
        const participants = groupMetadata.participants
        const botId = conn.user.id.split(':')[0] // Pega o número limpo do bot
        
        const bot = participants.find(u => u.id.includes(botId))
        if (bot && (bot.admin === 'admin' || bot.admin === 'superadmin')) {
          isAdmin = true
        }
      } catch { }

      // Tentativa 2: Prova real (Tentar gerar o link)
      // Se o bot conseguir gerar o link, ele É admin, independente do que a lista diz
      if (!isAdmin) {
        try {
          const code = await conn.groupInviteCode(g.id)
          if (code) {
            isAdmin = true
            link = 'https://chat.whatsapp.com/' + code
          }
        } catch { 
          isAdmin = false
        }
      } else {
        // Se já sabemos que é admin, apenas pegamos o código
        try {
          link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(g.id)
        } catch { }
      }

      txt += `*◉ Grupo ${i + 1}*\n`
      txt += `*➤ Nome:* ${g.subject}\n`
      txt += `*➤ ID:* ${g.id}\n`
      txt += `*➤ Admin:* ${isAdmin ? '✅ Sim' : '❌ Não'}\n`
      txt += `*➤ Participantes:* ${g.size || '---'}\n`
      txt += `*➤ Link:* ${link}\n\n`
    }

    m.reply(txt)
  } catch (e) {
    console.error(e)
    m.reply('*❌ Erro ao listar grupos. O servidor do WhatsApp demorou a responder.*')
  }
}

handler.help = ['groups']
handler.tags = ['owner']
handler.command = ['groups', 'listagrupos']
handler.rowner = true 

export default handler