/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let cooldowns = {};

let handler = async (m, { conn, usedPrefix, command }) => {
  let chat = global.db.data.chats[m.chat]
  if (!chat || !chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para entrar nas Masmorras.* 🍷')

  let senderId = m.sender
  let tiempoEspera = 8 * 60 // 8 minutos

  if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempoEspera * 1000) {
    let tiempoRestante = segundosAHMS(Math.ceil((cooldowns[senderId] + tiempoEspera * 1000 - Date.now()) / 1000))
    return m.reply(`⏱️ Você explorou as profundezas recentemente. Aguarde *${tiempoRestante}* antes de descer novamente.`)
  }

  // Inicializa o usuário no banco do grupo
  if (!chat.users) chat.users = {}
  if (!chat.users[senderId]) chat.users[senderId] = { health: 100, coin: 0, exp: 0 }
  let userGroup = chat.users[senderId]

  // Trava de segurança por saúde baixa
  if (userGroup.health < 10) {
    return m.reply(`🩸 *Você está muito ferido!* Sua saúde está em ${userGroup.health}%. Use *${usedPrefix}curar* antes de morrer nas masmorras.`)
  }

  cooldowns[senderId] = Date.now()

  const eventos = [
    { nome: 'Masmorras dos Caídos', tipo: 'vitoria', coin: rn(1500, 3000), exp: rn(50, 100), health: 0, msg: 'Você derrotou o guardião! Ao abrir o baú, encontrou uma fortuna.' },
    { nome: 'Câmara dos Espectros', tipo: 'derrota', coin: rn(-700, -400), exp: rn(10, 20), health: rn(-15, -5), msg: 'Um espectro te prendeu em uma rede de sombras. Perdeu dinheiro enquanto fugia.' },
    { nome: 'Cripta do Esquecimento', tipo: 'vitoria', coin: rn(2500, 4000), exp: rn(100, 150), health: 0, msg: 'Você descobriu um tesouro antigo repleto de gemas preciosas e barras de ouro.' },
    { nome: 'Armadilha do Labirinto', tipo: 'trampa', coin: 0, exp: rn(5, 10), health: 0, msg: 'Ativou uma armadilha oculta. Felizmente saiu ileso, mas não ganhou nada.' },
    { nome: 'Câmara dos Demônios', tipo: 'derrota', coin: rn(-1500, -800), exp: rn(20, 40), health: rn(-30, -20), msg: 'Um demônio feroz te emboscou na escuridão. Você escapou, mas perdeu saúde e ouro.' },
    { nome: 'Santuário da Luz', tipo: 'vitoria', coin: rn(1000, 2000), exp: rn(30, 60), health: 0, msg: 'Encontrou um altar iluminado com oferendas valiosas que agora são suas.' },
    { nome: 'Labirinto dos Perdidos', tipo: 'trampa', coin: 0, exp: rn(5, 15), health: 0, msg: 'Ficou confuso no labirinto. Conseguiu sair, mas não obteve recompensas.' },
    { nome: 'Ruínas Antigas', tipo: 'vitoria', coin: rn(1500, 3000), exp: rn(70, 120), health: 0, msg: 'Descobriu artefatos misteriosos que brilham com um encanto valioso.' },
    { nome: 'Covil do Dragão', tipo: 'derrota', coin: rn(-2000, -1000), exp: rn(20, 40), health: rn(-30, -20), msg: 'O dragão lançou chamas em sua direção! Você fugiu, mas deixou cair muitas moedas.' },
    { nome: 'Sábio da Masmorra', tipo: 'vitoria', coin: rn(500, 1000), exp: rn(30, 50), health: 0, msg: 'Um velho sábio compartilhou histórias e te presenteou pela sua atenção.' },
  ]

  let ev = eventos[Math.floor(Math.random() * eventos.length)]

  // Aplica resultados
  userGroup.coin = Math.max(0, (userGroup.coin || 0) + ev.coin)
  userGroup.exp = (userGroup.exp || 0) + ev.exp
  userGroup.health = Math.min(100, Math.max(0, (userGroup.health || 100) + (ev.tipo === 'vitoria' || ev.tipo === 'trampa' ? 0 : -Math.abs(ev.health))))

  let formatar = (v) => Math.abs(v).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
  let img = 'https://files.catbox.moe/vnb99u.jpg'
  
  let info = `
〔 ⛓️ *MASMORRAS ANTIGAS* 〕
┃
┃ *Missão:* ${ev.nome}
┃ *Evento:* ${ev.msg}
┃
┃ *Resultado:* ${ev.coin >= 0 ? '+' : '-'} ${formatar(ev.coin)}
┃ *XP:* +${ev.exp}
┃ *Saúde:* ${userGroup.health}% ❤️
╰━━━━━━━━━━━━⬣`.trim()

  await conn.sendFile(m.chat, img, 'masmorra.jpg', info, m)
  if (global.db.write) await global.db.write()
}

handler.help = ['masmorra']
handler.tags = ['economia']
handler.command = ['masmorra', 'dungeon', 'caverna']
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