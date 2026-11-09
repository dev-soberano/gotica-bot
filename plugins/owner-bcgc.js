/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

global.enviandoBC = false 

let handler = async (m, { conn, text, command }) => {
  
  // Comando para cancelar
  if (command === 'cancelbc' || command === 'cancelaraviso') {
    if (!global.enviandoBC) return m.reply('*⚠️ Não há nenhuma transmissão ativa para cancelar.*')
    global.enviandoBC = false
    return m.reply('*🚫 Ordem recebida! A transmissão foi interrompida, Soberano.*')
  }

  // Lógica de Transmissão
  const getGroups = await conn.groupFetchAllParticipating()
  const groups = Object.entries(getGroups).slice(0).map((entry) => entry[1])
  const ids = groups.map((v) => v.id)
  
  const mensagem = m.quoted && m.quoted.text ? m.quoted.text : text
  if (!mensagem) return m.reply('*⚠️ Soberano, defina a mensagem ou responda a um texto para transmitir.*')
  
  global.enviandoBC = true 
  await m.reply(`*📣 Transmissão iniciada para ${ids.length} grupos.*\n*⏳ Intervalo:* 1 minuto.\n*❌ Para cancelar use:* .cancelbc`)

  for (const id of ids) {
    if (!global.enviandoBC) break

    try {
      await conn.sendMessage(id, { 
        text: `*📢 COMUNICADO DO SOBERANO*\n\n${mensagem}\n\n*Gótica Bot*`,
        mentions: conn.parseMention(mensagem)
      })
    } catch (e) {
      console.log(`Erro ao enviar para o grupo ${id}`)
    }

    // Espera 1 minuto (60 segundos), checando cancelamento a cada segundo
    for (let i = 0; i < 60; i++) {
        if (!global.enviandoBC) break
        await new Promise(res => setTimeout(res, 1000))
    }
  }
  
  if (global.enviandoBC) {
      m.reply(`*✅ Transmissão concluída nos ${ids.length} grupos.*`)
      global.enviandoBC = false 
  }
}

handler.help = ['bcgc', 'cancelbc']
handler.tags = ['owner']
handler.command = ['aviso', 'transmissao', 'cancelbc', 'cancelaraviso']
handler.owner = true 

export default handler