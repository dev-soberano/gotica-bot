/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let cooldowns = {}

const TARGET_JID_DONO = '192380913328157@lid'; 
const DONO_PHONE = ' 5549920050811';

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let chat = global.db.data.chats[m.chat]
  if (!chat || !chat.modoreal) return m.reply('*O Modo Real precisa estar ativado para apostar na roleta.* 🍷')

  if (!chat.users) chat.users = {}
  if (!chat.users[m.sender]) chat.users[m.sender] = { coin: 0 }
  let user = chat.users[m.sender]
  let nome = m.pushName || 'Explorador'

  const tempoEspera = 60 * 1000 // 1 Minuto
  const agora = Date.now()

  if (cooldowns[m.sender] && agora - cooldowns[m.sender] < tempoEspera) {
    let restante = Math.ceil((cooldowns[m.sender] + tempoEspera - agora) / 1000)
    return m.reply(`*⚠️ SEM FLOOD!* Olá ${nome}, aguarde ${restante}s para apostar novamente.`)
  }

  let args = text.trim().split(/\s+/)
  let quantia = args[0]
  let corInput = args[1] ? args[1].toLowerCase() : ''

  if (!quantia || !corInput) {
    return m.reply(`*Como usar:* ${usedPrefix + command} <quantia> <preto ou vermelho>`)
  }

  let aposta = parseInt(quantia.replace(/[^0-9]/g, ''))
  let corFinal = ['preto', 'preta', 'black'].includes(corInput) ? 'preto' : ['vermelho', 'vermelha', 'red'].includes(corInput) ? 'vermelho' : ''

  if (isNaN(aposta) || aposta <= 0) return m.reply('*Informe um valor válido.*')
  if (!corFinal) return m.reply('*Escolha: preto ou vermelho.*')
  if (aposta > (user.coin || 0)) return m.reply('*Saldo insuficiente na carteira.*')

  cooldowns[m.sender] = agora
  await m.reply(`🎲 *Aposta de R$ ${aposta.toLocaleString('pt-br')} no ${corFinal.toUpperCase()} confirmada!* Girando...`)

  setTimeout(async () => {
    const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)
    const sorte = eDono ? 0.75 : 0.50
    const resultado = Math.random() < sorte ? corFinal : (corFinal === 'vermelho' ? 'preto' : 'vermelho')
    const ganhou = resultado === corFinal

    if (ganhou) {
      user.coin += aposta 
      await conn.reply(m.chat, `✨ *RESULTADO: ${resultado.toUpperCase()}*\n\nParabéns ${nome}! Você ganhou *R$ ${aposta.toLocaleString('pt-br')}*.`, m)
    } else {
      user.coin -= aposta
      await conn.reply(m.chat, `💀 *RESULTADO: ${resultado.toUpperCase()}*\n\nNão foi dessa vez, ${nome}. Você perdeu a aposta.`, m)
    }
    if (global.db.write) await global.db.write()
  }, 10000)
}

handler.help = ['ruleta']
handler.tags = ['economia']
handler.command = ['ruleta', 'rt']
handler.group = true
export default handler