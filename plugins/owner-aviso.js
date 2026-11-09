/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

// Variável global para controle de cancelamento
global.cancelarBC = false 

const handler = async (m, { conn, text, command }) => {
  
  // Comando para cancelar
  if (command === 'cancelbc') {
    global.cancelarBC = true
    return m.reply('*🚫 Ordem recebida! A transmissão será interrompida no próximo ciclo.*')
  }

  const delay = (time) => new Promise((res) => setTimeout(res, time))
  const getGroups = await conn.groupFetchAllParticipating()
  const groups = Object.entries(getGroups).slice(0).map((entry) => entry[1])
  const ids = groups.map((v) => v.id)
  
  const mensagem = m.quoted && m.quoted.text ? m.quoted.text : text
  if (!mensagem) return m.reply('*⚠️ Soberano, defina a mensagem para a transmissão.*')
  
  global.cancelarBC = false // Reseta o status ao iniciar
  await m.reply(`*📣 Transmissão iniciada para ${ids.length} grupos.*\n*⏳ Intervalo:* 1 minuto.\n*❌ Para cancelar use:* .cancelbc`)

  for (const id of ids) {
    // Verifica se o Soberano mandou cancelar
    if (global.cancelarBC) {
      m.reply('*✅ Transmissão cancelada com sucesso, Soberano!*')
      break
    }

    conn.relayMessage(id, {
      liveLocationMessage: {
        degreesLatitude: -23.5505, 
        degreesLongitude: -46.6333,
        caption: `*📢 COMUNICADO DO SOBERANO*\n\n${mensagem}\n\n*Gótica Bot*`,
        contextInfo: { mentionedJid: conn.parseMention(mensagem) }
      }
    }, {}).catch((_) => _)

    await delay(60000) // Espera 1 minuto antes do próximo
  }
  
  if (!global.cancelarBC) m.reply(`*✅ Transmissão concluída nos ${ids.length} grupos.*`)
}

handler.help = ['bcgc', 'cancelbc']
handler.tags = ['owner']
handler.command = ['aviso', 'transmissao', 'cancelaaviso']
handler.owner = true 

export default handler