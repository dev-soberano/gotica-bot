/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { args, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🔮 *Como usar o comando:*\n${usedPrefix}${command} eu serei rico?\n\nFaça uma pergunta e a Gótica Bot responderá o seu destino.`)

  const pergunta = text.toLowerCase()
  
  const respostasPositivas = ['Sim', 'Com certeza', 'As estrelas dizem que sim', 'Tudo indica que sim', 'Pode apostar que sim']
  const respostasNegativas = ['Não', 'Nem pensar', 'As chances são nulas', 'Meu instinto diz que não', 'Definitivamente não']
  
  let resposta = Math.random() < 0.5 
    ? respostasNegativas[Math.floor(Math.random() * respostasNegativas.length)]
    : respostasPositivas[Math.floor(Math.random() * respostasPositivas.length)]

  if (pergunta.includes('gay') || pergunta.includes('homo') || pergunta.includes('bisexual') || pergunta.includes('bi')) {
    resposta = 'Sim, com toda certeza! 🌈'
  } else if (pergunta.includes('hetero') || pergunta.includes('heterosexual')) {
    resposta = 'Não, as evidências dizem o contrário! 🤔'
  }

  // Agora envia apenas a resposta direta
  await m.reply(`🔮 *Resposta:* ${resposta}`)
}

handler.help = ['8ball *<pergunta>*']
handler.tags = ['diversão']
handler.command = ['8ball', 'bola8', 'prever']
handler.group = true
handler.register = false 

export default handler