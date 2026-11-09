/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn }) => {
  let chat = global.db.data.chats[m.chat]
  if (!chat || !chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para receber seu salário mensal.* 🍷')

  // Inicializa o usuário no banco do grupo
  if (!chat.users) chat.users = {}
  if (!chat.users[m.sender]) chat.users[m.sender] = { coin: 0, exp: 0, lastMonthly: 0, diamond: 0 }
  let userGroup = chat.users[m.sender]

  const cooldown = 604800000 * 4 // 4 semanas em milisegundos
  let timeRemaining = (userGroup.lastMonthly || 0) + cooldown - Date.now()

  if (timeRemaining > 0) {
    return m.reply(`⏳ *Calma, Milionário!* Você já resgatou seu bônus mensal.\nVolte em: *${msToTime(timeRemaining)}*`)
  }

  // Recompensas generosas para o Modo Real
  let coinReward = pickRandom([50000, 65000, 80000, 100000])
  let expReward = pickRandom([10000, 15000, 20000])
  let diamondReward = pickRandom([10, 15, 20, 25])

  userGroup.coin = (userGroup.coin || 0) + coinReward
  userGroup.exp = (userGroup.exp || 0) + expReward
  userGroup.diamond = (userGroup.diamond || 0) + diamondReward
  userGroup.lastMonthly = Date.now()

  let mensaje = `
╭━━〔 🎁 *BÔNUS MENSAL* 〕━━╮
┃
┃ ✿ *Seu salário chegou!*
┃ _Parabéns por ser um membro ativo._
┃
┃ 💸 *Dinheiro:* + ${coinReward.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
┃ ✨ *XP:* + ${expReward.toLocaleString()}
┃ 💎 *Diamantes:* + ${diamondReward}
┃
╰━━━━━━━━━━━━━━━━━━━⬣
> Próximo resgate disponível em 30 dias.`.trim()

  await m.reply(mensaje)
  if (global.db.write) await global.db.write()
}

handler.help = ['mensal']
handler.tags = ['economia']
handler.command = ['mensal', 'monthly', 'salario']
handler.group = true

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function msToTime(duration) {
  const days = Math.floor(duration / (1000 * 60 * 60 * 24))
  const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
  return `${days} dias, ${hours} horas e ${minutes} minutos`
}