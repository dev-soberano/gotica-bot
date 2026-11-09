/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `*✨ Por favor, faça uma pergunta ao Gênio.* 💋\n\n*Exemplo:* ${usedPrefix}${command} Eu serei rico?`, m)

  const respostas = [
    'Sim, com toda certeza! ✨',
    'Claro que sim! 💋',
    'Definitivamente sim. ⭐',
    'Sim, os astros confirmam. 💫',
    'Com certeza, Soberano. 🖤',
    'Sim, acredite nisso.',
    'Tudo indica que sim!',
    'Sim, é a sua hora. ✨',
    'Não, nem pense nisso. 🖤',
    'Definitivamente não. 🍂',
    'Minha resposta é um não absoluto.',
    'Não conte com isso.',
    'Infelizmente não. 🌙',
    'Não, as chances são nulas.',
    'Minhas fontes dizem que não.',
    'Esqueça, a resposta é não. 💋'
  ]

  const pathImg = './media/genio.png'
  const resposta = respostas[Math.floor(Math.random() * respostas.length)]
  
  let messageOptions = {
    caption: `---⭑꒷꒦꒷〘 PREVISÃO 〙꒷꒦꒷⭑---\n\n*💋 Pergunta:* ${text}\n\n*🔮 Resposta:* ${resposta}\n\n╰─⭑꒷꒦꒷〘 🌙🖤 〙꒷꒦꒷⭑---\n`,
    mentions: [m.sender]
  }

  if (fs.existsSync(pathImg)) {
    messageOptions.image = fs.readFileSync(pathImg)
  }

  // Bloco de segurança para evitar o erro 1006 💫
  try {
    if (conn.ws.isOpen || conn.ws.readyState === 1) {
        await conn.sendMessage(m.chat, messageOptions, { quoted: m })
    } else {
        console.log('⚠️ Conexão instável, aguardando reconexão...')
    }
  } catch (e) {
    console.log('❌ Erro de conexão ao enviar mensagem. O bot tentará reconectar.')
  }
}

handler.help = ['genio <pergunta>']
handler.tags = ['fun']
handler.command = ['akinator', 'genio', 'gênio']
handler.register = false

export default handler