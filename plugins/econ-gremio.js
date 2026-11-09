/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let cooldowns = {};

let handler = async (m, { conn }) => {
  let chat = global.db.data.chats[m.chat]
  if (!chat || !chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para entrar no Grêmio.* 🍷')

  let senderId = m.sender
  let tiempoEspera = 10 * 60 // 10 minutos

  if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempoEspera * 1000) {
    let tiempoRestante = segundosAHMS(Math.ceil((cooldowns[senderId] + tiempoEspera * 1000 - Date.now()) / 1000))
    return m.reply(`⏱️ Você já saiu em missão recentemente. Aguarde *${tiempoRestante}* para ir ao Grêmio novamente.`)
  }

  if (!chat.users) chat.users = {}
  if (!chat.users[senderId]) chat.users[senderId] = { health: 100, coin: 0, exp: 0 }
  let userGroup = chat.users[senderId]

  cooldowns[senderId] = Date.now()

  const eventos = [
    { nome: 'Batalha contra Goblins', tipo: 'vitoria', coin: rn(200, 400), exp: rn(10, 20), health: 0, msg: 'Você derrotou os Goblins! Ao caírem, deixaram um monte de moedas.' },
    { nome: 'Confronto com o Orco', tipo: 'derrota', coin: rn(-300, -100), exp: rn(5, 10), health: rn(-15, -5), msg: 'Um Orco te atacou e você perdeu saúde e dinheiro na briga.' },
    { nome: 'Desafio do Dragão', tipo: 'vitoria', coin: rn(1000, 1500), exp: rn(50, 80), health: 0, msg: 'Você venceu o Dragão! Encontrou um tesouro antigo cheio de ouro.' },
    { nome: 'Confronto com o Esqueleto', tipo: 'derrota', coin: rn(-200, -100), exp: rn(5, 10), health: rn(-10, -5), msg: 'Você caiu diante de um Esqueleto. A batalha foi intensa e perdeu dinheiro.' },
    { nome: 'Combate contra a Manticora', tipo: 'vitoria', coin: rn(800, 1200), exp: rn(40, 60), health: 0, msg: 'Derrotou a Manticora! Sua pelagem brilhava, revelando um tesouro oculto.' },
    { nome: 'Confrontação com o Troll', tipo: 'derrota', coin: rn(-500, -200), exp: rn(10, 20), health: rn(-20, -10), msg: 'Um Troll te atacou. Você perdeu saúde e moedas na contenda.' },
    { nome: 'Duelo com o Licantropo', tipo: 'vitoria', coin: rn(600, 1000), exp: rn(30, 50), health: 0, msg: 'Derrotou um Lobisomem em uma feroz batalha. Ganhou um bom saque.' },
    { nome: 'Enfrentamento com o Minotauro', tipo: 'derrota', coin: rn(-400, -150), exp: rn(10, 20), health: rn(-15, -5), msg: 'O Minotauro te atacou com o machado. Você sofreu danos e perdeu moedas.' },
    { nome: 'Batalha contra o Fantasma', tipo: 'vitoria', coin: rn(300, 500), exp: rn(20, 40), health: 0, msg: 'Venceu o Fantasma que assombrava a aldeia. Recebeu ouro como recompensa.' },
    { nome: 'Luta contra o Dragão de Gelo', tipo: 'derrota', coin: rn(-600, -200), exp: rn(15, 30), health: rn(-25, -10), msg: 'O Dragão de Gelo te congelou. Você perdeu saúde e dinheiro.' },
    { nome: 'Combate com a Hidra', tipo: 'vitoria', coin: rn(900, 1300), exp: rn(50, 80), health: 0, msg: 'Você derrotou a Hidra e encontrou um tesouro épico.' },
    { nome: 'Desafio do Cavaleiro Caído', tipo: 'derrota', coin: rn(-300, -100), exp: rn(5, 10), health: rn(-15, -5), msg: 'Foi derrotado pelo Cavaleiro Caído. Perdeu saúde e economias.' },
    { nome: 'Encontro com a Bruxa', tipo: 'troll', coin: 0, exp: rn(20, 40), health: rn(-10, -5), msg: 'Encontrou uma bruxa que te lançou um feitiço. Ganhou experiência.' },
    { nome: 'Emboscada de Bandidos', tipo: 'troll', coin: 0, exp: rn(15, 30), health: rn(-5, -3), msg: 'Bandidos te cercaram. Conseguiu escapar, mas saiu ferido.' },
    { nome: 'Caça à Serpente Gigante', tipo: 'vitoria', coin: rn(500, 800), exp: rn(30, 50), health: 0, msg: 'Caçou a Serpente Gigante. Sua pele é valiosa e rendeu bom dinheiro.' },
  ]

  let ev = eventos[Math.floor(Math.random() * eventos.length)]

  userGroup.coin = Math.max(0, (userGroup.coin || 0) + ev.coin)
  userGroup.exp = (userGroup.exp || 0) + ev.exp
  userGroup.health = Math.min(100, Math.max(0, (userGroup.health || 100) + (ev.tipo === 'vitoria' ? 0 : -Math.abs(ev.health))))

  let formatar = (v) => Math.abs(v).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
  
  // Link corrigido para uma imagem JPG (para aparecer a legenda)
  let img = 'https://files.catbox.moe/gaf2oy.jpg'
  
  let info = `
╭━〔 🛡️ *GRÊMIO DE CAÇADORES* 〕
┃
┃ *Missão:* ${ev.nome}
┃ *Evento:* ${ev.msg}
┃
┃ *Recompensa:* ${ev.coin >= 0 ? '+' : '-'} ${formatar(ev.coin)}
┃ *XP:* +${ev.exp}
┃ *Saúde:* ${userGroup.health}% ❤️
╰━━━━━━━━━━━━⬣`.trim()

  await conn.sendFile(m.chat, img, 'gremio.jpg', info, m)
  if (global.db.write) await global.db.write()
}

handler.help = ['gremio']
handler.tags = ['economia']
handler.command = ['gremio', 'missao']
handler.group = true

export default handler

function rn(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function segundosAHMS(segundos) {
  let minutos = Math.floor(segundos / 60)
  let segundosRestantes = segundos % 60
  return `${minutos}m e ${segundosRestantes}s`
}